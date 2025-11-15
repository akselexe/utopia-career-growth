import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactCandidateDialog } from "@/components/company/ContactCandidateDialog";

interface Application {
  id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  cover_letter: string | null;
  job: {
    id: string;
    title: string;
  };
  seeker: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface CompanyProfile {
  company_name: string;
}

const Applicants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadApplications();
    loadCompanyProfile();
  }, [user]);

  const loadCompanyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompanyProfile(data);
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  };

  const loadApplications = async () => {
    try {
      // get all company jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', user?.id);

      if (jobsError) throw jobsError;

      const jobIds = jobs?.map(j => j.id) || [];

      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // get all applications for those jobs
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          match_score,
          created_at,
          cover_letter,
          job:jobs(id, title),
          seeker:profiles!applications_seeker_id_fkey(id, full_name, email)
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      setApplications(apps as any);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected' | 'pending' | 'interview' | 'reviewing') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Applicants</h1>
              <p className="text-muted-foreground text-lg">Review and manage job applications</p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              When candidates apply to your jobs, they'll appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{application.seeker.full_name}</h3>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                      {application.match_score && (
                        <Badge variant="outline">
                          Match: {application.match_score}%
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {application.seeker.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {application.job.title}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium mb-1">Cover Letter:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <ContactCandidateDialog
                      candidateEmail={application.seeker.email}
                      candidateName={application.seeker.full_name}
                      jobTitle={application.job.title}
                      companyName={companyProfile?.company_name || "Our Company"}
                    />
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/matched-candidates/${application.job.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Job
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Applicants;
