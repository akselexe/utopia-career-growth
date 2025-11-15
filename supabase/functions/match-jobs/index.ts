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

    // Fetch user's location and footprint data
    const { data: seekerProfile } = await supabase
      .from('seeker_profiles')
      .select('location, github_url, twitter_url, skills')
      .eq('user_id', userId)
      .maybeSingle();

    const userLocation = seekerProfile?.location || '';
    let footprintData = null;

    // Auto-fetch footprint data if URLs are available
    if (seekerProfile?.github_url || seekerProfile?.twitter_url) {
      try {
        let githubData = null;
        let stackoverflowData = null;

        // Fetch GitHub data
        if (seekerProfile.github_url) {
          const ghMatch = seekerProfile.github_url.match(/github\.com\/([^\/]+)/);
          if (ghMatch) {
            const { data: ghResult } = await supabase.functions.invoke('fetch-github-profile', {
              body: { username: ghMatch[1] }
            });
            githubData = ghResult;
          }
        }

        // Fetch StackOverflow data (stored in twitter_url field)
        if (seekerProfile.twitter_url?.includes('stackoverflow')) {
          const soMatch = seekerProfile.twitter_url.match(/stackoverflow\.com\/users\/(\d+)/);
          if (soMatch) {
            const { data: soResult } = await supabase.functions.invoke('fetch-stackoverflow-profile', {
              body: { userId: soMatch[1] }
            });
            stackoverflowData = soResult;
          }
        }

        footprintData = { githubData, stackoverflowData };
        console.log('Fetched footprint data for enhanced matching');
      } catch (error) {
        console.error('Error fetching footprint data:', error);
      }
    }

    // Get internal active jobs
    const { data: internalJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');

    if (jobsError) throw jobsError;

    const allJobs = [...(internalJobs || [])];

    // Fetch external jobs from JSearch API (for test)
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (RAPIDAPI_KEY) {
      try {
        // FOR TEST 
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
              
              // Currency 
              const currencyMap: Record<string, string> = {
                'ae': 'AED', 'sa': 'SAR', 'eg': 'EGP', 'ma': 'MAD', 
                'qa': 'QAR', 'kw': 'KWD', 'om': 'OMR', 'bh': 'BHD',
                'jo': 'JOD', 'lb': 'LBP', 'za': 'ZAR', 'ng': 'NGN',
                'ke': 'KES', 'tn': 'TND'
              };
              
              // external jobs to internal format
              for (const job of externalJobs.slice(0, 20)) { // Limit per country
                allJobs.push({
                  id: `external_${job.job_id}`,
                  title: job.job_title || 'N/A',
                  description: job.job_description || job.job_highlights?.Qualifications?.join('. ') || 'No description available',
                  location: job.job_city || job.job_country || 'Remote',
                  requirements: job.job_highlights?.Qualifications?.join(', ') || 'Not specified',
                  salary_min: job.job_min_salary || null,
                  salary_max: job.job_max_salary || null,
                  currency: currencyMap[country] || 'USD',
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
        // Build comprehensive candidate profile
        let candidateProfile = `
CV Analysis:
- Score: ${cvScore}/100
- Strengths: ${cvAnalysis.strengths?.join(', ') || 'None listed'}
- Skills: ${cvSkills}
- Missing Skills: ${cvAnalysis.missing_skills?.join(', ') || 'None'}
- Location: ${userLocation || 'Not specified'}`;

        // Add footprint data if available
        if (footprintData?.githubData) {
          candidateProfile += `

GitHub Profile:
- Public Repos: ${footprintData.githubData.profile?.publicRepos || 0}
- Languages: ${footprintData.githubData.stats?.languages?.join(', ') || 'N/A'}
- Recent Commits: ${footprintData.githubData.stats?.totalCommits || 0}`;
        }

        if (footprintData?.stackoverflowData) {
          candidateProfile += `

StackOverflow Profile:
- Reputation: ${footprintData.stackoverflowData.profile?.reputation || 0}
- Top Tags: ${footprintData.stackoverflowData.topTags?.slice(0, 5).map((t: any) => t.name).join(', ') || 'N/A'}`;
        }

        // Check location match
        const locationMatch = userLocation && job.location && 
          (userLocation.toLowerCase().includes(job.location.toLowerCase()) || 
           job.location.toLowerCase().includes(userLocation.toLowerCase()) ||
           job.location.toLowerCase() === 'remote');

        const matchPrompt = `
You are a job matching expert specializing in regional job placement. Analyze the match between this candidate and the job posting.

Candidate Profile:
${candidateProfile}

Job Posting:
- Title: ${job.title}
- Location: ${job.location}
- Description: ${job.description}
- Requirements: ${job.requirements}
- Required Skills: ${job.skills_required?.join(', ') || 'Not specified'}

IMPORTANT: Location matching is critical. ${locationMatch ? 'This is a STRONG location match - boost score by 15 points.' : userLocation && job.location.toLowerCase() !== 'remote' ? 'Location mismatch - reduce score by 15 points unless the role is remote.' : ''}

Calculate a match score from 0-100 based on:
1. Regional/Location compatibility (30% weight) - Prioritize jobs in candidate's region
2. Skill overlap (35% weight) - Including GitHub/StackOverflow evidence
3. Experience relevance (25% weight)
4. CV quality score alignment (10% weight)

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
