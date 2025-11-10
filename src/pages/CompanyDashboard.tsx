import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, FileText, TrendingUp, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostJobDialog } from "@/components/company/PostJobDialog";
import { JobsList } from "@/components/company/JobsList";

const CompanyDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, active_jobs: 0 });
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
        jobs: jobs?.length || 0,
        applications: applicationsCount || 0,
        active_jobs: activeJobs,
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your job postings and find the perfect candidates
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.jobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.active_jobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{stats.applications}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Post New Job */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Post a New Job</h2>
            <PostJobDialog
              isOpen={isPostDialogOpen}
              onOpenChange={setIsPostDialogOpen}
              onSuccess={handleJobPosted}
              userId={user?.id}
            >
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Post Job
              </Button>
            </PostJobDialog>
          </div>
          <p className="text-muted-foreground">
            Create job postings and let AI match the best candidates for you
          </p>
        </Card>

        {/* Active Jobs List */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Active Jobs</h2>
          <JobsList userId={user?.id} onJobsChange={loadStats} />
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
