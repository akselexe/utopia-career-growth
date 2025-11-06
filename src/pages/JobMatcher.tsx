import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, TrendingUp, Target, Briefcase, MapPin, DollarSign, Loader2, Search } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const JobMatcher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [hasCV, setHasCV] = useState(false);

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
        .select('*, company_profiles!jobs_company_id_fkey(company_name)')
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
              <Link to="/footprint-scanner">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  Footprint Scanner
                </Button>
              </Link>
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
              {/* Location info */}
              {userLocation && (
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
                            {job.company_profiles?.company_name || 'Company'}
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
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default JobMatcher;
