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
    // Use service role key to create users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log("Starting to seed Tunisian test candidates...");

    const candidates = [
      {
        email: 'amine.bensalem@test.tn',
        password: 'TestPass123!',
        full_name: 'Amine Ben Salem',
        bio: 'Experienced full-stack developer from Tunis with expertise in React and Node.js. Passionate about building scalable web applications.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        experience_years: 5,
        location: 'Tunis, Tunisia',
        github_url: 'https://github.com/aminebensalem',
        linkedin_url: 'https://linkedin.com/in/aminebensalem',
        portfolio_url: 'https://aminebensalem.tn',
        desired_salary_min: 40000,
        desired_salary_max: 60000,
      },
      {
        email: 'mariem.trabelsi@test.tn',
        password: 'TestPass123!',
        full_name: 'Mariem Trabelsi',
        bio: 'Senior software engineer specializing in cloud architecture and DevOps. Based in Sfax with 7 years of experience.',
        skills: ['AWS', 'Kubernetes', 'Python', 'Terraform', 'CI/CD', 'Docker'],
        experience_years: 7,
        location: 'Sfax, Tunisia',
        github_url: 'https://github.com/mariemtrabelsi',
        linkedin_url: 'https://linkedin.com/in/mariemtrabelsi',
        portfolio_url: null,
        desired_salary_min: 50000,
        desired_salary_max: 75000,
      },
      {
        email: 'youssef.gharbi@test.tn',
        password: 'TestPass123!',
        full_name: 'Youssef Gharbi',
        bio: 'Mobile developer focused on React Native and Flutter. Creating beautiful mobile experiences for users across Tunisia.',
        skills: ['React Native', 'Flutter', 'Firebase', 'REST API', 'JavaScript', 'Dart'],
        experience_years: 4,
        location: 'Sousse, Tunisia',
        github_url: 'https://github.com/youssefgharbi',
        linkedin_url: 'https://linkedin.com/in/youssefgharbi',
        portfolio_url: 'https://youssefgharbi.com',
        desired_salary_min: 35000,
        desired_salary_max: 55000,
      },
      {
        email: 'sarra.messaoudi@test.tn',
        password: 'TestPass123!',
        full_name: 'Sarra Messaoudi',
        bio: 'Data scientist with strong background in machine learning and AI. Graduated from INSAT and worked on multiple ML projects.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis', 'Machine Learning'],
        experience_years: 3,
        location: 'Tunis, Tunisia',
        github_url: 'https://github.com/sarramessaoudi',
        linkedin_url: 'https://linkedin.com/in/sarramessaoudi',
        portfolio_url: null,
        desired_salary_min: 45000,
        desired_salary_max: 65000,
      },
      {
        email: 'mohamed.ayari@test.tn',
        password: 'TestPass123!',
        full_name: 'Mohamed Ayari',
        bio: 'Backend specialist with deep expertise in Java and Spring Boot. 8 years building enterprise applications.',
        skills: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'MongoDB', 'Redis'],
        experience_years: 8,
        location: 'Bizerte, Tunisia',
        github_url: 'https://github.com/mohamedayari',
        linkedin_url: 'https://linkedin.com/in/mohamedayari',
        portfolio_url: null,
        desired_salary_min: 55000,
        desired_salary_max: 80000,
      },
      {
        email: 'nesrine.karoui@test.tn',
        password: 'TestPass123!',
        full_name: 'Nesrine Karoui',
        bio: 'Frontend developer with eye for design. Creating pixel-perfect interfaces using modern web technologies.',
        skills: ['Vue.js', 'React', 'CSS3', 'Tailwind', 'Figma', 'JavaScript'],
        experience_years: 3,
        location: 'Nabeul, Tunisia',
        github_url: 'https://github.com/nesrinekaroui',
        linkedin_url: 'https://linkedin.com/in/nesrinekaroui',
        portfolio_url: 'https://nesrine.design',
        desired_salary_min: 30000,
        desired_salary_max: 45000,
      },
      {
        email: 'khalil.bouazizi@test.tn',
        password: 'TestPass123!',
        full_name: 'Khalil Bouazizi',
        bio: 'Cybersecurity engineer protecting digital assets. Certified ethical hacker with penetration testing experience.',
        skills: ['Security', 'Penetration Testing', 'Python', 'Linux', 'Network Security', 'CISSP'],
        experience_years: 6,
        location: 'Tunis, Tunisia',
        github_url: 'https://github.com/khalilbouazizi',
        linkedin_url: 'https://linkedin.com/in/khalilbouazizi',
        portfolio_url: null,
        desired_salary_min: 60000,
        desired_salary_max: 85000,
      },
      {
        email: 'rim.ferchichi@test.tn',
        password: 'TestPass123!',
        full_name: 'Rim Ferchichi',
        bio: 'Product designer and UX researcher. Creating user-centered designs based on research and data.',
        skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
        experience_years: 4,
        location: 'Sousse, Tunisia',
        github_url: null,
        linkedin_url: 'https://linkedin.com/in/rimferchichi',
        portfolio_url: 'https://rimferchichi.com',
        desired_salary_min: 35000,
        desired_salary_max: 50000,
      },
      {
        email: 'maher.jebali@test.tn',
        password: 'TestPass123!',
        full_name: 'Maher Jebali',
        bio: 'Full-stack JavaScript developer. Building modern web applications from database to UI.',
        skills: ['JavaScript', 'React', 'Express.js', 'MongoDB', 'Next.js', 'GraphQL'],
        experience_years: 5,
        location: 'Monastir, Tunisia',
        github_url: 'https://github.com/maherjebali',
        linkedin_url: 'https://linkedin.com/in/maherjebali',
        portfolio_url: 'https://maherjebali.dev',
        desired_salary_min: 40000,
        desired_salary_max: 60000,
      },
      {
        email: 'ines.chaabane@test.tn',
        password: 'TestPass123!',
        full_name: 'Ines Chaabane',
        bio: 'QA engineer ensuring software quality through automated testing. Expert in test automation frameworks.',
        skills: ['Selenium', 'Cypress', 'Jest', 'API Testing', 'Python', 'CI/CD'],
        experience_years: 4,
        location: 'Ariana, Tunisia',
        github_url: 'https://github.com/ineschaabane',
        linkedin_url: 'https://linkedin.com/in/ineschaabane',
        portfolio_url: null,
        desired_salary_min: 32000,
        desired_salary_max: 48000,
      },
    ];

    const createdUsers = [];

    for (const candidate of candidates) {
      console.log(`Creating user: ${candidate.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: candidate.email,
        password: candidate.password,
        email_confirm: true,
        user_metadata: {
          full_name: candidate.full_name,
          user_type: 'seeker'
        }
      });

      if (authError) {
        console.error(`Error creating user ${candidate.email}:`, authError);
        continue;
      }

      if (!authData.user) {
        console.error(`No user created for ${candidate.email}`);
        continue;
      }

      console.log(`User created with ID: ${authData.user.id}`);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('seeker_profiles')
        .insert({
          user_id: authData.user.id,
          bio: candidate.bio,
          skills: candidate.skills,
          experience_years: candidate.experience_years,
          location: candidate.location,
          github_url: candidate.github_url,
          linkedin_url: candidate.linkedin_url,
          portfolio_url: candidate.portfolio_url,
          desired_salary_min: candidate.desired_salary_min,
          desired_salary_max: candidate.desired_salary_max,
        });

      if (profileError) {
        console.error(`Error creating profile for ${candidate.email}:`, profileError);
        continue;
      }

      createdUsers.push({
        email: candidate.email,
        id: authData.user.id,
        name: candidate.full_name
      });

      console.log(`Profile created for ${candidate.full_name}`);
    }

    console.log(`Successfully created ${createdUsers.length} test candidates`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        created: createdUsers.length,
        users: createdUsers 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in seed-test-candidates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
