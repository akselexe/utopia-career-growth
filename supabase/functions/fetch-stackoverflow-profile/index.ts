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
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "StackOverflow user ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Fetching StackOverflow profile for user ID:', userId);

    // Fetch user profile
    const profileUrl = `https://api.stackexchange.com/2.3/users/${userId}?order=desc&sort=reputation&site=stackoverflow`;
    const profileResponse = await fetch(profileUrl);

    if (!profileResponse.ok) {
      throw new Error(`StackOverflow API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    
    if (!profileData.items || profileData.items.length === 0) {
      throw new Error('User not found');
    }

    const user = profileData.items[0];

    // Fetch user's top answers
    const answersUrl = `https://api.stackexchange.com/2.3/users/${userId}/answers?order=desc&sort=votes&site=stackoverflow&pagesize=5&filter=withbody`;
    const answersResponse = await fetch(answersUrl);
    const answersData = await answersResponse.json();

    // Fetch user's top questions
    const questionsUrl = `https://api.stackexchange.com/2.3/users/${userId}/questions?order=desc&sort=votes&site=stackoverflow&pagesize=5`;
    const questionsResponse = await fetch(questionsUrl);
    const questionsData = await questionsResponse.json();

    // Fetch user's tags (expertise areas)
    const tagsUrl = `https://api.stackexchange.com/2.3/users/${userId}/top-tags?pagesize=10&site=stackoverflow`;
    const tagsResponse = await fetch(tagsUrl);
    const tagsData = await tagsResponse.json();

    const data = {
      profile: {
        displayName: user.display_name,
        reputation: user.reputation,
        location: user.location,
        aboutMe: user.about_me,
        websiteUrl: user.website_url,
        profileImage: user.profile_image,
        badges: {
          gold: user.badge_counts?.gold || 0,
          silver: user.badge_counts?.silver || 0,
          bronze: user.badge_counts?.bronze || 0,
        },
        createdAt: user.creation_date,
      },
      stats: {
        reputation: user.reputation,
        questionCount: user.question_count,
        answerCount: user.answer_count,
        upVotes: user.up_vote_count,
        downVotes: user.down_vote_count,
      },
      topAnswers: answersData.items?.slice(0, 5).map((answer: any) => ({
        score: answer.score,
        isAccepted: answer.is_accepted,
        questionId: answer.question_id,
        answerUrl: `https://stackoverflow.com/a/${answer.answer_id}`,
      })) || [],
      topQuestions: questionsData.items?.slice(0, 5).map((question: any) => ({
        title: question.title,
        score: question.score,
        answerCount: question.answer_count,
        viewCount: question.view_count,
        questionUrl: `https://stackoverflow.com/q/${question.question_id}`,
      })) || [],
      topTags: tagsData.items?.slice(0, 10).map((tag: any) => ({
        name: tag.tag_name,
        count: tag.count,
      })) || [],
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("StackOverflow fetch error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to fetch StackOverflow data" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
