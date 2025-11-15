import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Trash2, MapPin, Briefcase, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  status: string;
  created_at: string;
}
// A component that lists jobs posted by a company, allowing them to view matched candidates and delete jobs.
export const JobsList = ({ userId, onJobsChange }: { userId?: string; onJobsChange?: () => void }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadJobs();
    }
  }, [userId]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Deleted",
        description: "The job has been removed successfully",
      });
      
      loadJobs();
      onJobsChange?.();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No jobs posted yet</p>
        <p className="text-sm text-muted-foreground mt-1">Post your first job to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="p-6 rounded-lg border bg-card hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(job.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/matched-candidates/${job.id}`)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                View Candidates
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteJob(job.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
