import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, TrendingUp, Target, Briefcase, MapPin, DollarSign, Loader2, Search, Zap, ExternalLink } from "lucide-react";
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
  const [isMatching, setIsMatching] = useState(false);
  const [showAiMatches, setShowAiMatches] = useState(false);

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

      // Fetch jobs - prioritize by location if available
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

  const runAiMatching = async () => {
    if (!user) return;
    
    setIsMatching(true);
    try {
      // Get latest CV
      const { data: cvData } = await supabase
        .from('cvs')
        .select('ai_analysis')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!cvData?.ai_analysis) {
        toast({
          title: "No CV Analysis",
          description: "Please upload and analyze your CV first.",
          variant: "destructive",
        });
        return;
      }

      // Call match-jobs function
      const { data, error } = await supabase.functions.invoke('match-jobs', {
        body: {
          cvAnalysis: cvData.ai_analysis,
          userId: user.id
        }
      });

      if (error) throw error;

      setAiMatches(data.matches || []);
      setShowAiMatches(true);
      
      toast({
        title: "AI Matching Complete!",
        description: `Found ${data.total} high-quality matches for your profile.`,
      });
    } catch (error) {
      console.error('Error running AI matching:', error);
      toast({
        title: "Matching Failed",
        description: "Could not complete AI job matching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6">
            <div className="flex h-16 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/seeker')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">Job Matcher</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userLocation ? `Jobs near ${userLocation}` : 'Personalized job recommendations'}
                </p>
              </div>
              <div className="flex gap-2">
                {hasCV && (
                  <Button 
                    onClick={runAiMatching} 
                    disabled={isMatching}
                    className="gap-2"
                  >
                    {isMatching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    AI Match Jobs
                  </Button>
                )}
                <Link to="/footprint-scanner">
                  <Button variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    Footprint Scanner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8">
          {!hasCV ? (
            <Card className="p-12 text-center max-w-2xl mx-auto">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Upload Your CV First</h2>
              <p className="text-muted-foreground mb-6">
                To get personalized job matches based on your skills and experience, please upload your CV.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/cv-review">
                  <Button className="gap-2">
                    Upload CV
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline" className="gap-2">
                    Browse All Jobs
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* AI Matches Section */}
              {showAiMatches && aiMatches.length > 0 && (
                <div className="space-y-4">
                  <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold">AI-Powered Matches</h2>
                      <Badge variant="secondary" className="ml-auto">
                        {aiMatches.length} High-Quality Matches
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These jobs have been analyzed and scored based on your CV, skills, and experience.
                    </p>
                  </Card>

                  {aiMatches.map((match) => (
                    <Card key={match.job_id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{match.job_title}</h3>
                            {match.is_external && (
                              <Badge variant="outline" className="gap-1">
                                <ExternalLink className="w-3 h-3" />
                                External
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {match.job_location}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="text-lg px-3 py-1">
                            <Target className="w-4 h-4 mr-1" />
                            {match.match_score}% Match
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {match.recommendation && (
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <p className="text-sm font-medium mb-1">AI Recommendation:</p>
                            <p className="text-sm text-muted-foreground">{match.recommendation}</p>
                          </div>
                        )}

                        {match.matching_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.matching_skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.missing_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">
                              Skills to Develop
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.missing_skills.slice(0, 5).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
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
                      </div>
                    </Card>
                  ))}

                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAiMatches(false)}
                    >
                      View All Jobs
                    </Button>
                  </div>
                </div>
              )}

              {/* Location info */}
              {!showAiMatches && userLocation && (
                <Card className="p-4 bg-primary/5">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Showing jobs relevant to <strong>{userLocation}</strong></span>
                    <Link to="/profile-settings" className="ml-auto text-primary hover:underline text-xs">
                      Update location
                    </Link>
                  </div>
                </Card>
              )}

              {/* Job listings */}
              {!showAiMatches && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {matchedJobs.length} {userLocation ? 'Regional' : ''} Opportunities
                  </h2>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm">View All Jobs</Button>
                  </Link>
                </div>

                {matchedJobs.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No jobs available at the moment.</p>
                  </Card>
                ) : (
                  matchedJobs.map((job) => (
                    <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            UtopiaHire
                          </p>
                        </div>
                        {job.location?.toLowerCase().includes(userLocation?.toLowerCase() || '') && (
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="w-3 h-3" />
                            Local
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                        )}
                        {job.job_type && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.job_type}
                          </div>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary_min && job.salary_max 
                              ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                              : job.salary_min 
                              ? `From $${job.salary_min.toLocaleString()}`
                              : `Up to $${job.salary_max.toLocaleString()}`
                            }
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills_required.slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills_required.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills_required.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/jobs`} className="flex-1">
                          <Button className="w-full">View Details</Button>
                        </Link>
                      </div>
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
