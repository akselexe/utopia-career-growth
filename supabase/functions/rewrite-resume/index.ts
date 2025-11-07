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

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { cvText, analysis, targetRole } = await req.json();

    if (!cvText) {
      throw new Error('No CV text provided');
    }

    console.log('Rewriting resume for user:', user.id);

    // Call Lovable AI to rewrite the resume
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
            content: `You are an expert resume writer and career coach. Your task is to rewrite and improve the user's resume based on the analysis provided.

IMPORTANT INSTRUCTIONS:
1. Maintain all factual information (names, dates, companies, education)
2. Improve clarity, impact, and professionalism
3. Use strong action verbs and quantify achievements where possible
4. Optimize for ATS (Applicant Tracking Systems)
5. Address the weaknesses identified in the analysis
6. Incorporate missing skills naturally where appropriate
7. Improve formatting and structure
${targetRole ? `8. Tailor the content for the role: ${targetRole}` : ''}

Return the rewritten resume in a clear, professional format with proper sections:
- Contact Information
- Professional Summary
- Work Experience
- Education
- Skills
- Additional sections as appropriate

Use markdown formatting for structure.`
          },
          {
            role: 'user',
            content: `Original Resume:\n${cvText}\n\nAnalysis:\nScore: ${analysis?.score || 'N/A'}\nStrengths: ${analysis?.strengths?.join(', ') || 'N/A'}\nImprovements Needed: ${analysis?.improvements?.join(', ') || 'N/A'}\nMissing Skills: ${analysis?.missing_skills?.join(', ') || 'N/A'}\n\nPlease rewrite this resume to address the identified weaknesses and make it more impactful.`
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rewrittenResume = aiData.choices[0].message.content;

    console.log('Resume rewritten successfully');

    return new Response(
      JSON.stringify({ rewrittenResume }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rewrite-resume function:', error);
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
