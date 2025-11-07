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
    const { messages, behavioralFeedback, jobTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating profile analysis for job:", jobTitle);
    console.log("Messages count:", messages?.length);
    console.log("Behavioral feedback count:", behavioralFeedback?.length);

    // Create a comprehensive prompt for profiling
    const systemPrompt = `You are an expert interview coach and career counselor. Analyze this interview session and provide a comprehensive candidate profile with:

1. **Overall Performance Score** (0-100)
2. **Key Strengths** (3-5 specific strengths with examples)
3. **Areas for Improvement** (3-5 specific areas with actionable advice)
4. **Communication Skills Assessment**
5. **Technical/Domain Knowledge Assessment** (if applicable)
6. **Body Language & Presentation** (based on behavioral analysis)
7. **Recommendations for Next Steps**

Be specific, constructive, and actionable. Reference specific moments from the interview.`;

    const conversationSummary = messages.map((msg: any) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');

    const behavioralSummary = behavioralFeedback && behavioralFeedback.length > 0
      ? `\n\nBehavioral Analysis Points:\n${behavioralFeedback.map((fb: string, i: number) => `${i + 1}. ${fb}`).join('\n')}`
      : '';

    const userPrompt = `Job Position: ${jobTitle}

Interview Transcript:
${conversationSummary}
${behavioralSummary}

Please provide a detailed candidate profile analysis.`;

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
        temperature: 0.7,
        max_tokens: 2000,
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
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const profileAnalysis = data.choices[0].message.content;

    console.log("Profile analysis generated successfully");

    return new Response(
      JSON.stringify({ profileAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-profile function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
