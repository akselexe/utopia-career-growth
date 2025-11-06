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
    const { username } = await req.json();
    
    if (!username) {
      return new Response(JSON.stringify({ error: "GitHub username is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Fetching GitHub profile for:', username);

    // Fetch user profile
    const profileResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-Career-App'
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`GitHub API error: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();

    // Fetch user repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-Career-App'
      }
    });

    const repos = await reposResponse.json();

    // Fetch user events (recent activity)
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-Career-App'
      }
    });

    const events = await eventsResponse.json();

    // Calculate contribution stats
    const commitEvents = events.filter((e: any) => e.type === 'PushEvent');
    const totalCommits = commitEvents.reduce((sum: number, e: any) => 
      sum + (e.payload?.commits?.length || 0), 0
    );

    const languages = new Set<string>();
    repos.forEach((repo: any) => {
      if (repo.language) languages.add(repo.language);
    });

    const data = {
      profile: {
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        blog: profile.blog,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        createdAt: profile.created_at,
      },
      topRepos: repos.slice(0, 5).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
      })),
      stats: {
        totalCommits,
        languages: Array.from(languages),
        recentActivity: events.length,
      }
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to fetch GitHub data" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
