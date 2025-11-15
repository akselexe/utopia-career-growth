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

    const { cvText, analysis, targetRole, templateStyle } = await req.json();

    if (!cvText) {
      throw new Error('No CV text provided');
    }

    console.log('Rewriting resume for user:', user.id, 'with template style:', templateStyle ? 'custom' : 'default');

    
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
            content: `You are an expert resume writer. Rewrite the resume in a STRUCTURED JSON format that will be used to generate a professional PDF.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "contact": {
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "website": "portfolio.com"
  },
  "summary": "2-3 sentence professional summary highlighting key achievements and career focus",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Month Year - Present",
      "achievements": [
        "Achievement with metrics and impact",
        "Another quantifiable achievement"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief project description",
      "technologies": ["Tech 1", "Tech 2"],
      "achievements": [
        "Key achievement or result",
        "Another accomplishment"
      ],
      "link": "github.com/project or demo.com"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "University Name",
      "location": "City, State",
      "dates": "Year - Year",
      "details": "GPA, honors, relevant coursework"
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "languages": ["Language 1", "Language 2"]
  },
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Month Year"
    }
  ]
}

CRITICAL: Extract ALL information from the original resume including:
- All work experience with full details
- ALL projects with complete descriptions and technologies
- All certifications and courses
- All education details
- All skills mentioned
- Do NOT omit any section that exists in the original resume

GUIDELINES:
- Use strong action verbs and quantify achievements
- Keep bullet points concise (1-2 lines)
- Maintain factual accuracy from original resume
- Include ALL projects, certifications, and details from original
- Optimize for ATS systems
${targetRole ? `- Tailor content for: ${targetRole}` : ''}
${templateStyle || ''}

Analysis context:
Score: ${analysis?.score || 'N/A'}
Strengths: ${analysis?.strengths?.join(', ') || 'N/A'}
Areas to improve: ${analysis?.improvements?.join(', ') || 'N/A'}
Missing skills: ${analysis?.missing_skills?.join(', ') || 'N/A'}`
          },
          {
            role: 'user',
            content: `Rewrite this resume:\n\n${cvText}`
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
    const content = aiData.choices[0].message.content;

    console.log('Resume rewritten successfully');

    // Parse JSON from response
    let resumeData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resumeData = JSON.parse(jsonMatch[0]);
      } else {
        resumeData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse resume data');
    }

    return new Response(
      JSON.stringify({ resumeData }),
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
