import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { cvAnalysis, userId } = await req.json();

    if (!cvAnalysis || !userId) {
      throw new Error('CV analysis and userId are required');
    }

    console.log('Matching jobs for user:', userId);

    // Get internal active jobs
    const { data: internalJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');

    if (jobsError) throw jobsError;

    const allJobs = [...(internalJobs || [])];

    // Fetch external jobs from JSearch API (MENA region)
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (RAPIDAPI_KEY) {
      try {
        // MENA region countries
        const menaCountries = ['ae', 'sa', 'eg', 'ma', 'qa', 'kw', 'om', 'bh', 'jo', 'lb'];
        
        for (const country of menaCountries.slice(0, 3)) { // Fetch from top 3 countries to avoid rate limits
          try {
            const searchQuery = cvAnalysis.strengths?.join(' ') || 'jobs';
            const response = await fetch(
              `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=1&country=${country}&date_posted=month`,
              {
                method: 'GET',
                headers: {
                  'x-rapidapi-host': 'jsearch.p.rapidapi.com',
                  'x-rapidapi-key': RAPIDAPI_KEY,
                },
              }
            );

            if (response.ok) {
              const externalData = await response.json();
              const externalJobs = externalData.data || [];
              
              // Map external jobs to internal format
              for (const job of externalJobs.slice(0, 20)) { // Limit per country
                allJobs.push({
                  id: `external_${job.job_id}`,
                  title: job.job_title || 'N/A',
                  description: job.job_description || job.job_highlights?.Qualifications?.join('. ') || 'No description available',
                  location: job.job_city || job.job_country || 'Remote',
                  requirements: job.job_highlights?.Qualifications?.join(', ') || 'Not specified',
                  salary_min: job.job_min_salary || null,
                  salary_max: job.job_max_salary || null,
                  skills_required: job.job_required_skills || [],
                  company_id: null, // External job
                  status: 'active',
                  job_type: job.job_employment_type || 'Full-time',
                  external_url: job.job_apply_link || job.job_google_link,
                  external_source: 'jsearch'
                });
              }
              
              console.log(`Fetched ${externalJobs.length} jobs from ${country.toUpperCase()}`);
            }
          } catch (countryError) {
            console.error(`Error fetching jobs from ${country}:`, countryError);
          }
        }
      } catch (error) {
        console.error('Error fetching external jobs:', error);
      }
    }

    if (allJobs.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No jobs available for matching' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${allJobs.length} total jobs to match (internal + external)`);

    // Extract CV skills from analysis
    const cvSkills = cvAnalysis.strengths?.join(', ') || '';
    const cvScore = cvAnalysis.score || 0;

    // Match each job using AI
    const matches = [];

    for (const job of allJobs) {
      try {
        const matchPrompt = `
You are a job matching expert. Analyze the match between this candidate's CV and the job posting.

CV Analysis:
- Score: ${cvScore}/100
- Strengths: ${cvAnalysis.strengths?.join(', ') || 'None listed'}
- Skills: ${cvSkills}
- Missing Skills: ${cvAnalysis.missing_skills?.join(', ') || 'None'}

Job Posting:
- Title: ${job.title}
- Location: ${job.location}
- Description: ${job.description}
- Requirements: ${job.requirements}
- Required Skills: ${job.skills_required?.join(', ') || 'Not specified'}

Calculate a match score from 0-100 based on:
1. Skill overlap (40% weight)
2. Experience relevance (30% weight)
3. CV quality score alignment (20% weight)
4. Geographic compatibility (10% weight)

Respond with JSON only:
{
  "match_score": number,
  "matching_skills": string[],
  "missing_skills": string[],
  "recommendation": string
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a job matching AI. Respond only with valid JSON.'
              },
              {
                role: 'user',
                content: matchPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for job ${job.id}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const matchText = aiData.choices[0].message.content;

        // Parse JSON response
        let matchData;
        try {
          const jsonMatch = matchText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            matchData = JSON.parse(jsonMatch[0]);
          } else {
            matchData = JSON.parse(matchText);
          }
        } catch (parseError) {
          console.error('Failed to parse match response for job', job.id);
          continue;
        }

        // Only include matches >= 70%
        if (matchData.match_score >= 70) {
          matches.push({
            job_id: job.id,
            job_title: job.title,
            job_location: job.location,
            company_id: job.company_id,
            match_score: matchData.match_score,
            matching_skills: matchData.matching_skills || [],
            missing_skills: matchData.missing_skills || [],
            recommendation: matchData.recommendation || '',
            job_details: job,
            external_url: job.external_url || null,
            external_source: job.external_source || null,
            is_external: !job.company_id
          });
        }

      } catch (error) {
        console.error(`Error matching job ${job.id}:`, error);
        continue;
      }
    }

    // Sort matches by score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    console.log(`Found ${matches.length} matches above 70%`);

    // Create application records for top internal job matches only
    const topMatches = matches.filter(m => !m.is_external).slice(0, 10);
    
    for (const match of topMatches) {
      try {
        // Check if application already exists
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('seeker_id', userId)
          .eq('job_id', match.job_id)
          .maybeSingle();

        if (!existing) {
          // Create new application with match score
          await supabase
            .from('applications')
            .insert({
              seeker_id: userId,
              job_id: match.job_id,
              match_score: match.match_score,
              status: 'pending'
            });
        }
      } catch (error) {
        console.error(`Error creating application for job ${match.job_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ matches, total: matches.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-jobs function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: errorMessage === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
