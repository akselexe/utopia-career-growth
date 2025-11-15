import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Match candidates function called");
    
    // Get the JWT from the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token from "Bearer <token>"
    const jwt = authHeader.replace('Bearer ', '');

    // Create client with service role key to verify JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Verifying JWT token...");
    // Pass the JWT token directly to getUser
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("User authenticated:", user.id);

    const { jobId } = await req.json();
    console.log("Job ID:", jobId);

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching job details for:", jobId);

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('company_id', user.id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching seeker profiles with CVs...");

    // Get all seeker profiles
    const { data: seekers, error: seekersError } = await supabaseClient
      .from('seeker_profiles')
      .select(`
        *,
        profiles!inner(id, full_name, email)
      `);

    if (seekersError) {
      throw seekersError;
    }

    if (!seekers || seekers.length === 0) {
      return new Response(
        JSON.stringify({ candidates: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all CVs separately
    const { data: cvs, error: cvsError } = await supabaseClient
      .from('cvs')
      .select('user_id, id, ai_analysis, ai_score');

    if (cvsError) {
      console.error("Error fetching CVs:", cvsError);
    }

    // Create a map of CVs by user_id for quick lookup
    const cvsMap = new Map();
    if (cvs) {
      cvs.forEach((cv: any) => {
        if (!cvsMap.has(cv.user_id)) {
          cvsMap.set(cv.user_id, []);
        }
        cvsMap.get(cv.user_id).push(cv);
      });
    }

    console.log(`Found ${seekers.length} seekers, analyzing with AI...`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare candidate data for AI analysis
    const candidatesData = seekers.map((seeker: any) => {
      const userCvs = cvsMap.get(seeker.user_id) || [];
      return {
        id: seeker.user_id,
        name: seeker.profiles?.full_name || 'Unknown',
        email: seeker.profiles?.email || '',
        skills: seeker.skills || [],
        experience_years: seeker.experience_years || 0,
        location: seeker.location || 'Not specified',
        bio: seeker.bio || '',
        cv_analysis: userCvs[0]?.ai_analysis || null,
        cv_score: userCvs[0]?.ai_score || 0,
      };
    });

    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a recruitment AI assistant. Analyze candidates and match them to job requirements."
          },
          {
            role: "user",
            content: `Match candidates to this job and return ranked results:

JOB:
Title: ${job.title}
Location: ${job.location}
Requirements: ${job.requirements}
Description: ${job.description}
Required Skills: ${job.skills_required?.join(', ') || 'Not specified'}

CANDIDATES:
${JSON.stringify(candidatesData, null, 2)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rank_candidates",
              description: "Rank and score candidates for a job position",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        candidate_id: {
                          type: "string",
                          description: "The candidate's user ID"
                        },
                        match_score: {
                          type: "number",
                          description: "Match score from 0-100"
                        },
                        strengths: {
                          type: "array",
                          items: { type: "string" },
                          description: "Key strengths that match the job"
                        },
                        concerns: {
                          type: "array",
                          items: { type: "string" },
                          description: "Potential concerns or gaps"
                        },
                        summary: {
                          type: "string",
                          description: "Brief summary of why they're a good/bad match"
                        }
                      },
                      required: ["candidate_id", "match_score", "strengths", "concerns", "summary"]
                    }
                  }
                },
                required: ["matches"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "rank_candidates" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function?.name !== "rank_candidates") {
      throw new Error("Invalid AI response format");
    }

    const { matches } = JSON.parse(toolCall.function.arguments);

    // Enrich matches with full candidate data
    const enrichedMatches = matches
      .map((match: any) => {
        const candidate = candidatesData.find((c: any) => c.id === match.candidate_id);
        return candidate ? { ...match, candidate } : null;
      })
      .filter((m: any) => m !== null)
      .sort((a: any, b: any) => b.match_score - a.match_score);

    console.log(`Matched ${enrichedMatches.length} candidates`);

    return new Response(
      JSON.stringify({ candidates: enrichedMatches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in match-candidates:", error);
    console.error("Error details:", error instanceof Error ? error.stack : String(error));
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
