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

    // Get all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');

    if (jobsError) throw jobsError;

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No active jobs available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${jobs.length} active jobs to match`);

    // Extract CV skills from analysis
    const cvSkills = cvAnalysis.strengths?.join(', ') || '';
    const cvScore = cvAnalysis.score || 0;

    // Match each job using AI
    const matches = [];

    for (const job of jobs) {
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
            job_details: job
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

    // Create application records for top matches
    const topMatches = matches.slice(0, 10); // Store top 10 matches
    
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
