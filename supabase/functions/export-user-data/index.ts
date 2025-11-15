import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    console.log(`Exporting data for user: ${user.id}`);

    // Fetch all user data from different tables
    const [
      { data: profile },
      { data: seekerProfile },
      { data: companyProfile },
      { data: cvs },
      { data: applications },
      { data: interviews },
      { data: privacyPrefs },
      { data: auditLogs },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("seeker_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("company_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("cvs").select("*").eq("user_id", user.id),
      supabase.from("applications").select("*").eq("seeker_id", user.id),
      supabase.from("interview_sessions").select("*").eq("user_id", user.id),
      supabase.from("privacy_preferences").select("*").eq("user_id", user.id).single(),
      supabase.from("data_access_logs").select("*").eq("user_id", user.id),
    ]);

    // Log the export action
    await supabase.from("data_access_logs").insert({
      user_id: user.id,
      action_type: "EXPORT",
      resource_type: "ALL_DATA",
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    const exportData = {
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile,
      seeker_profile: seekerProfile,
      company_profile: companyProfile,
      cvs: cvs || [],
      applications: applications || [],
      interview_sessions: interviews || [],
      privacy_preferences: privacyPrefs,
      audit_logs: auditLogs || [],
    };

    console.log("Data export completed successfully");

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
