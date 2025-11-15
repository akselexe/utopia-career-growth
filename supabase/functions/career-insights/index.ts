import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvAnalysis, applications, profile, footprintData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior career advisor with expertise in career development and strategic planning. 
Analyze the candidate's profile, CV performance, and application history to provide actionable career insights.
Focus on: strengths, growth areas, market positioning, skill gaps, and strategic recommendations.
Be specific, professional, and encouraging.`;

    const footprintSection = footprintData ? `

Developer Footprint Analysis:
GitHub Profile:
- Public Repositories: ${footprintData.githubData?.profile?.publicRepos || 'N/A'}
- Followers: ${footprintData.githubData?.profile?.followers || 'N/A'}
- Recent Commits: ${footprintData.githubData?.stats?.totalCommits || 'N/A'}
- Primary Languages: ${footprintData.githubData?.stats?.languages?.join(', ') || 'N/A'}
- Location: ${footprintData.githubData?.profile?.location || 'N/A'}

Stack Overflow Profile:
- Reputation: ${footprintData.stackoverflowData?.profile?.reputation?.toLocaleString() || 'N/A'}
- Answers: ${footprintData.stackoverflowData?.stats?.answerCount || 'N/A'}
- Questions: ${footprintData.stackoverflowData?.stats?.questionCount || 'N/A'}
- Top Tags: ${footprintData.stackoverflowData?.topTags?.slice(0, 5).map((t: any) => `${t.name} (${t.count})`).join(', ') || 'N/A'}
- Badges: Gold ${footprintData.stackoverflowData?.profile?.badges?.gold || 0}, Silver ${footprintData.stackoverflowData?.profile?.badges?.silver || 0}, Bronze ${footprintData.stackoverflowData?.profile?.badges?.bronze || 0}
` : '';

    const userPrompt = `
Profile Data:
- CV Score: ${cvAnalysis?.score || 'N/A'}
- Strengths: ${cvAnalysis?.strengths?.join(', ') || 'N/A'}
- Improvement Areas: ${cvAnalysis?.improvements?.join(', ') || 'N/A'}
- Total Applications: ${applications}
- Profile Completeness: ${profile?.completeness || 'N/A'}%
${footprintSection}
Generate a comprehensive Career Insights Report with:
1. Current Position Analysis (2-3 sentences) - ${footprintData ? 'Include insights from their public developer footprint' : ''}
2. Key Strengths to Leverage (3-4 bullet points) - ${footprintData ? 'Reference their GitHub activity and Stack Overflow contributions' : ''}
3. Priority Development Areas (3-4 bullet points)
4. Strategic Next Steps (4-5 actionable recommendations) - ${footprintData ? 'Consider their technology stack and community engagement' : ''}
5. Market Positioning Advice (2-3 sentences) - ${footprintData ? 'Use their technical footprint to position them in the market' : ''}
${footprintData ? '6. Developer Footprint Summary (2-3 sentences highlighting their public contributions and community presence)' : ''}

Format the response in markdown with clear sections.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career insights error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
