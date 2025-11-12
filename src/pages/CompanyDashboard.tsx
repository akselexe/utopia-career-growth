import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostJobDialog } from "@/components/company/PostJobDialog";
import { JobsList } from "@/components/company/JobsList";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalJobs: 0, applications: 0, activeJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      // Load jobs count
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status', { count: 'exact' })
        .eq('company_id', user?.id);

      if (jobsError) throw jobsError;

      const activeJobs = jobs?.filter(j => j.status === 'active').length || 0;

      // Load applications count
      const { count: applicationsCount, error: appsError } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('job_id', jobs?.map(j => j.id) || []);

      if (appsError) throw appsError;

      setStats({
        totalJobs: jobs?.length || 0,
        applications: applicationsCount || 0,
        activeJobs: activeJobs,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobPosted = () => {
    setIsPostDialogOpen(false);
    loadStats();
    toast({
      title: "Job Posted!",
      description: "Your job has been posted successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Company Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your job postings and find top talent</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Jobs Posted</p>
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.totalJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.activeJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently open</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.applications}</p>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </Card>
        </div>

        {/* Post Job Card */}
        <Card className="p-8 mb-8 border-2 hover-lift">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Post a New Job</h2>
                <p className="text-sm text-muted-foreground">Create a new job listing and let AI find the perfect candidates for you</p>
              </div>
            </div>
            <PostJobDialog
              isOpen={isPostDialogOpen}
              onOpenChange={setIsPostDialogOpen}
              onSuccess={handleJobPosted}
              userId={user?.id}
            >
              <Button size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                Post Job
              </Button>
            </PostJobDialog>
          </div>
        </Card>

        {/* Jobs List */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Job Postings</h2>
              <p className="text-sm text-muted-foreground">Manage and track your active job listings</p>
            </div>
          </div>
          <JobsList userId={user?.id} onJobsChange={loadStats} />
        </Card>
      </main>
    </div>
  );
};

export default CompanyDashboard;
