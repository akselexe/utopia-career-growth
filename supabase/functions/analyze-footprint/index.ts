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
    const { githubData, stackoverflowData, profileData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior technical recruiter and career analyst with expertise in evaluating developer profiles.
Analyze the candidate's public footprint from GitHub and StackOverflow to provide actionable insights.
Focus on: technical strengths, community engagement, expertise areas, code quality indicators, and career positioning.
Be specific, professional, and data-driven.`;

    // Build comprehensive analysis prompt
    let userPrompt = `Analyze this developer's public footprint:\n\n`;

    if (githubData) {
      userPrompt += `**GitHub Profile:**
- Name: ${githubData.profile?.name || 'N/A'}
- Location: ${githubData.profile?.location || 'N/A'}
- Bio: ${githubData.profile?.bio || 'N/A'}
- Public Repos: ${githubData.profile?.publicRepos || 0}
- Followers: ${githubData.profile?.followers || 0}
- Recent Commits: ${githubData.stats?.totalCommits || 0}
- Languages: ${githubData.stats?.languages?.join(', ') || 'N/A'}

**Top Repositories:**
${githubData.topRepos?.map((repo: any) => 
  `- ${repo.name}: ${repo.description || 'No description'} (${repo.language || 'N/A'}, ⭐${repo.stars})`
).join('\n') || 'None'}

`;
    }

    if (stackoverflowData) {
      userPrompt += `**StackOverflow Profile:**
- Reputation: ${stackoverflowData.profile?.reputation || 0}
- Questions: ${stackoverflowData.stats?.questionCount || 0}
- Answers: ${stackoverflowData.stats?.answerCount || 0}
- Badges: 🥇${stackoverflowData.profile?.badges?.gold || 0} 🥈${stackoverflowData.profile?.badges?.silver || 0} 🥉${stackoverflowData.profile?.badges?.bronze || 0}

**Top Expertise Tags:**
${stackoverflowData.topTags?.map((tag: any) => `- ${tag.name} (${tag.count} posts)`).join('\n') || 'None'}

`;
    }

    if (profileData) {
      userPrompt += `**Profile Information:**
- Skills: ${profileData.skills?.join(', ') || 'N/A'}
- Experience: ${profileData.experience_years || 0} years
- Location: ${profileData.location || 'N/A'}

`;
    }

    userPrompt += `Generate a comprehensive Technical Footprint Analysis with:
1. Technical Expertise Summary (2-3 sentences)
2. Key Technical Strengths (4-5 bullet points with specific evidence)
3. Community Engagement Level (analyze contribution patterns)
4. Technology Stack Proficiency (based on repos and tags)
5. Career Positioning Advice (2-3 actionable recommendations)
6. Notable Achievements (highlight impressive metrics or contributions)

Format the response in markdown with clear sections and specific metrics.`;

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
    const analysis = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Footprint analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
