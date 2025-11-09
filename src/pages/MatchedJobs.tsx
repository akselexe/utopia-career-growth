import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, MapPin, DollarSign, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  company_id: string | null;
  skills_required?: string[];
  external_url?: string;
  external_source?: string;
}

interface MatchedJob {
  id: string;
  job_id: string;
  match_score: number;
  created_at: string;
  jobs: Job;
}

export default function MatchedJobs() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkConsentAndLoadMatches();
    }
  }, [user]);

  const checkConsentAndLoadMatches = async () => {
    const { data } = await supabase
      .from("privacy_preferences")
      .select("ai_job_matching_consent")
      .eq("user_id", user?.id)
      .maybeSingle();
    
    const consentGranted = data?.ai_job_matching_consent ?? true; // Default true for backwards compatibility
    setHasConsent(consentGranted);
    
    if (consentGranted) {
      loadMatches();
    } else {
      setIsLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          match_score,
          created_at,
          jobs (
            id,
            title,
            description,
            location,
            salary_min,
            salary_max,
            company_id,
            skills_required
          )
        `)
        .eq('seeker_id', user?.id)
        .not('match_score', 'is', null)
        .gte('match_score', 70)
        .order('match_score', { ascending: false });

      if (error) throw error;

      setMatches(data || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matched jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/seeker")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Smart Job Matches
          </h1>
          <p className="text-muted-foreground">
            AI-powered job recommendations based on your CV (70%+ match)
          </p>
        </div>

        {!hasConsent ? (
          <Card className="p-8 border-destructive/50 bg-destructive/5">
            <h2 className="text-2xl font-semibold mb-2">AI Job Matching Disabled</h2>
            <p className="text-muted-foreground mb-4">
              You haven't enabled AI Job Matching in your privacy settings. Enable it to get personalized job recommendations.
            </p>
            <Button onClick={() => navigate("/privacy-settings")}>
              Go to Privacy Settings
            </Button>
          </Card>
        ) : matches.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Matches Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload your CV to get personalized job matches
            </p>
            <Button onClick={() => navigate("/dashboard/seeker")}>
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold">{match.jobs.title}</h3>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {match.match_score}% Match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.jobs.location}
                      </span>
                      {match.jobs.salary_min && match.jobs.salary_max && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${match.jobs.salary_min.toLocaleString()} - ${match.jobs.salary_max.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {match.jobs.description}
                </p>

                {match.jobs.skills_required && match.jobs.skills_required.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.jobs.skills_required.map((skill, idx) => (
                        <Badge key={idx} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  {match.jobs.external_url ? (
                    <Button 
                      onClick={() => window.open(match.jobs.external_url, '_blank')}
                    >
                      Apply on {match.jobs.external_source === 'jsearch' ? 'Job Platform' : 'External Site'}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/jobs`)}>
                      View All Jobs
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Matched {new Date(match.created_at).toLocaleDateString()}
                  </span>
                  {match.jobs.external_source && (
                    <Badge variant="secondary" className="ml-auto">
                      External Job
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
