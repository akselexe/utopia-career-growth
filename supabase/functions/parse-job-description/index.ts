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
    const { description } = await req.json();

    if (!description || description.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Description must be at least 20 characters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing job description with AI...");

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
            content: "You are a job posting assistant. Extract structured job information from descriptions."
          },
          {
            role: "user",
            content: `Parse this job description and extract the information: ${description}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_job_info",
              description: "Extract structured job posting information from a description",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Job title (e.g., 'Senior Software Engineer')"
                  },
                  location: {
                    type: "string",
                    description: "Job location (e.g., 'Remote', 'New York, NY', 'Hybrid - San Francisco')"
                  },
                  salaryMin: {
                    type: "number",
                    description: "Minimum salary in USD (annual)"
                  },
                  salaryMax: {
                    type: "number",
                    description: "Maximum salary in USD (annual)"
                  },
                  description: {
                    type: "string",
                    description: "Detailed job description including responsibilities and what the role entails"
                  },
                  requirements: {
                    type: "string",
                    description: "Key requirements, qualifications, and skills needed"
                  }
                },
                required: ["title", "location", "salaryMin", "salaryMax", "description", "requirements"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_job_info" } }
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

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "extract_job_info") {
      throw new Error("Invalid AI response format");
    }

    const jobData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted job data:", jobData);

    return new Response(
      JSON.stringify({ jobData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in parse-job-description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
