import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Search, Loader2, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  status: string;
  company_id: string;
  created_at: string;
  match_score?: number;
  skills_required?: string[];
}

const Jobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [otherJobs, setOtherJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?type=seeker');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      // Fetch all active jobs
      const { data: allJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user's applications with match scores
      const { data: applications } = await supabase
        .from('applications')
        .select('job_id, match_score')
        .eq('seeker_id', user?.id || '')
        .not('match_score', 'is', null);

      const jobsWithScores = (allJobs || []).map(job => {
        const application = applications?.find(app => app.job_id === job.id);
        return {
          ...job,
          match_score: application?.match_score
        };
      });

      // Sort: matched jobs first (by score), then others
      const matched = jobsWithScores
        .filter(job => job.match_score && job.match_score >= 70)
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      
      const others = jobsWithScores.filter(job => !job.match_score || job.match_score < 70);

      setMatchedJobs(matched);
      setOtherJobs(others);
      setJobs(jobsWithScores);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Failed to load jobs",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        seeker_id: user.id,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Applied",
            description: "You've already applied to this job",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Application Submitted!",
          description: "The company will review your application soon.",
        });
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast({
        title: "Application Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const filteredMatchedJobs = matchedJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOtherJobs = otherJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground text-lg">
            {matchedJobs.length > 0 
              ? `${matchedJobs.length} AI-matched jobs found for you`
              : "Find your next opportunity"
            }
          </p>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by title or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Matched Jobs Section */}
        {filteredMatchedJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">AI Matched Jobs</h2>
              <Badge variant="secondary">{filteredMatchedJobs.length}</Badge>
            </div>
            
            {filteredMatchedJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-md transition-all border-primary/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{job.title}</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {job.match_score}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </span>
                      {job.job_type && (
                        <Badge variant="secondary">{job.job_type}</Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleApply(job.id)} className="gap-2">
                    <Send className="w-4 h-4" />
                    Apply
                  </Button>
                </div>

                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* All Jobs Section */}
        <div className="space-y-4">
          {filteredMatchedJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <h2 className="text-2xl font-bold">All Jobs</h2>
              <Badge variant="secondary">{filteredOtherJobs.length}</Badge>
            </div>
          )}

          {filteredOtherJobs.length === 0 && filteredMatchedJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0 
                  ? "No active job postings yet. Check back soon!"
                  : "Try adjusting your search terms"}
              </p>
            </Card>
          ) : (
            filteredOtherJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-2xl font-bold">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </span>
                      {job.job_type && (
                        <Badge variant="secondary">{job.job_type}</Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleApply(job.id)} className="gap-2">
                    <Send className="w-4 h-4" />
                    Apply
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;