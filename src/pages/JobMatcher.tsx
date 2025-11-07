import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, TrendingUp, Target, Briefcase, MapPin, DollarSign, Loader2, Search, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchedJob {
  job_id: string;
  job_title: string;
  job_location: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
  job_details: any;
  is_external: boolean;
  external_url?: string;
}

const JobMatcher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [hasCV, setHasCV] = useState(false);
  const [aiMatches, setAiMatches] = useState<MatchedJob[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'all'>('ai');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Check if user has uploaded CV
      const { data: cvs } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      setHasCV(cvs && cvs.length > 0);

      // Get user's location
      const { data: profile } = await supabase
        .from('seeker_profiles')
        .select('location, skills, experience_years')
        .eq('user_id', user.id)
        .single();

      setUserLocation(profile?.location || null);

      // Fetch matched applications
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('seeker_id', user.id)
        .order('match_score', { ascending: false });

      if (appError) throw appError;

      // Fetch AI matches if available
      if (applications && applications.length > 0) {
        const jobIds = applications.map(app => app.job_id);
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .in('id', jobIds);

        if (jobsError) throw jobsError;

        // Combine applications with job details
        const matchedJobsList = applications.map(app => {
          const job = jobs?.find(j => j.id === app.job_id);
          return {
            ...job,
            match_score: app.match_score,
            application_status: app.status
          };
        }).filter(job => job.id); // Filter out any null jobs

        setAiMatches(matchedJobsList.map(job => ({
          job_id: job.id,
          job_title: job.title,
          job_location: job.location,
          match_score: job.match_score,
          matching_skills: [],
          missing_skills: [],
          recommendation: '',
          job_details: job,
          is_external: false
        })));

        if (matchedJobsList.length > 0) {
          setActiveTab('ai');
        } else {
          setActiveTab('all');
        }
      }

      // Fetch all active jobs for browsing
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: jobs, error } = await query;

      if (error) throw error;

      // Simple location-based matching
      let sortedJobs = jobs || [];
      if (profile?.location && sortedJobs.length > 0) {
        sortedJobs = sortedJobs.sort((a, b) => {
          const aMatch = a.location?.toLowerCase().includes(profile.location.toLowerCase());
          const bMatch = b.location?.toLowerCase().includes(profile.location.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }

      setMatchedJobs(sortedJobs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load job matches.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-background pt-16">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {!hasCV ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="p-8 text-center max-w-md border-dashed">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Get Started</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Upload your CV to unlock AI-powered job matching
                </p>
                <div className="flex flex-col gap-3">
                  <Link to="/cv-review" className="w-full">
                    <Button className="w-full">Upload CV</Button>
                  </Link>
                  <Link to="/jobs" className="w-full">
                    <Button variant="outline" className="w-full">Browse Jobs</Button>
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">Job Matches</h1>
                  <p className="text-muted-foreground">
                    {aiMatches.length > 0 
                      ? `${aiMatches.length} AI-powered matches found`
                      : `${matchedJobs.length} opportunities available`
                    }
                  </p>
                </div>
                {userLocation && (
                  <Link to="/profile-settings">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      {userLocation}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Tabs */}
              {aiMatches.length > 0 && (
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                      activeTab === 'ai'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    AI Matches
                    <Badge variant="secondary" className="ml-2">
                      {aiMatches.length}
                    </Badge>
                    {activeTab === 'ai' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                      activeTab === 'all'
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Jobs
                    <Badge variant="secondary" className="ml-2">
                      {matchedJobs.length}
                    </Badge>
                    {activeTab === 'all' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                </div>
              )}

              {/* AI Matches */}
              {activeTab === 'ai' && aiMatches.length > 0 && (
                <div className="grid gap-4">
                  {aiMatches.map((match) => (
                    <Card key={match.job_id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold truncate">{match.job_title}</h3>
                            {match.is_external && (
                              <Badge variant="outline" className="gap-1 shrink-0">
                                <ExternalLink className="w-3 h-3" />
                                External
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {match.job_location}
                          </p>
                        </div>
                        <Badge className="text-base px-3 py-1.5 shrink-0 bg-primary/10 text-primary border-primary/20">
                          {match.match_score}% Match
                        </Badge>
                      </div>

                      {match.recommendation && (
                        <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                          {match.recommendation}
                        </p>
                      )}

                      {match.matching_skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                            Your Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.matching_skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {match.is_external && match.external_url ? (
                          <a href={match.external_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full gap-2">
                              Apply Now
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        ) : (
                          <Link to="/jobs" className="flex-1">
                            <Button className="w-full">View Details</Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* All Jobs */}
              {activeTab === 'all' && (
                <div className="grid gap-4">
                  {matchedJobs.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No jobs available at the moment</p>
                    </Card>
                  ) : (
                    matchedJobs.map((job) => (
                      <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-1 truncate">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">UtopiaHire</p>
                          </div>
                          {job.location?.toLowerCase().includes(userLocation?.toLowerCase() || '') && (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                              <MapPin className="w-3 h-3" />
                              Local
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                          )}
                          {job.job_type && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {job.job_type}
                            </span>
                          )}
                          {(job.salary_min || job.salary_max) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              {job.salary_min && job.salary_max 
                                ? `${job.currency || 'USD'} ${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}`
                                : job.salary_min 
                                ? `From ${job.currency || 'USD'} ${job.salary_min.toLocaleString()}`
                                : `Up to ${job.currency || 'USD'} ${job.salary_max.toLocaleString()}`
                              }
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills_required.slice(0, 6).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills_required.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills_required.length - 6}
                              </Badge>
                            )}
                          </div>
                        )}

                        <Link to="/jobs">
                          <Button className="w-full" variant="outline">View Details</Button>
                        </Link>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default JobMatcher;
