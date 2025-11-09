import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Target, TrendingUp, Plus, LogOut, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JobsList = ({ userId }: { userId?: string }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />;
  }

  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No active jobs yet. Post your first job above!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => navigate(`/matched-candidates/${job.id}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{job.title}</p>
              <p className="text-xs text-muted-foreground">{job.location}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  location: z.string().min(2, "Location is required").max(100),
  salaryMin: z.string().regex(/^\d+$/, "Must be a valid number"),
  salaryMax: z.string().regex(/^\d+$/, "Must be a valid number"),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000),
  requirements: z.string().min(20, "Requirements must be at least 20 characters").max(1000),
});

const CompanyDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, applications: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isParsingAI, setIsParsingAI] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?type=company');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.id);

      const { count: applicationsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', (await supabase.from('jobs').select('id').eq('company_id', user.id)).data?.map(j => j.id) || []);

      setStats({
        jobs: jobsCount || 0,
        candidates: applicationsCount || 0,
        applications: applicationsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAIJobParsing = async () => {
    if (!aiDescription.trim() || aiDescription.trim().length < 20) {
      toast({
        title: "Description too short",
        description: "Please provide at least 20 characters describing the job.",
        variant: "destructive",
      });
      return;
    }

    setIsParsingAI(true);

    try {
      const { data, error } = await supabase.functions.invoke('parse-job-description', {
        body: { description: aiDescription }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const { jobData } = data;

      // Fill form fields with AI-extracted data
      (document.getElementById('title') as HTMLInputElement).value = jobData.title || '';
      (document.getElementById('location') as HTMLInputElement).value = jobData.location || '';
      (document.getElementById('salaryMin') as HTMLInputElement).value = jobData.salaryMin?.toString() || '';
      (document.getElementById('salaryMax') as HTMLInputElement).value = jobData.salaryMax?.toString() || '';
      (document.getElementById('description') as HTMLTextAreaElement).value = jobData.description || '';
      (document.getElementById('requirements') as HTMLTextAreaElement).value = jobData.requirements || '';

      toast({
        title: "AI Parsing Complete!",
        description: "Form fields have been filled with AI-extracted information. Review and submit.",
      });

      setAiDialogOpen(false);
      setAiDescription("");

    } catch (error) {
      console.error('AI parsing error:', error);
      toast({
        title: "AI Parsing Failed",
        description: error instanceof Error ? error.message : "Please try again or fill the form manually",
        variant: "destructive",
      });
    } finally {
      setIsParsingAI(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPosting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const jobData = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      salaryMin: formData.get('salaryMin') as string,
      salaryMax: formData.get('salaryMax') as string,
      description: formData.get('description') as string,
      requirements: formData.get('requirements') as string,
    };

    try {
      // Validate
      jobSchema.parse(jobData);

      // Insert job
      const { error } = await supabase.from('jobs').insert({
        company_id: user.id,
        title: jobData.title,
        location: jobData.location,
        salary_min: parseInt(jobData.salaryMin),
        salary_max: parseInt(jobData.salaryMax),
        description: jobData.description,
        requirements: jobData.requirements,
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: "Job Posted!",
        description: "Your job posting is now live and visible to candidates.",
      });

      (e.target as HTMLFormElement).reset();
      loadStats();

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Error posting job:', error);
        toast({
          title: "Failed to post job",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsPosting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.jobs}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Users className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{stats.candidates}</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.applications}</div>
                <div className="text-sm text-muted-foreground">Applications</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Posting Form */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Plus className="w-6 h-6 text-primary" />
                    Post a New Job
                  </h2>
                  <p className="text-muted-foreground">
                    Fill out the details below to attract the best candidates
                  </p>
                </div>
                <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Assistant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI-Powered Job Posting
                      </DialogTitle>
                      <DialogDescription>
                        Describe the job in a few sentences and AI will help fill out the form
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ai-description">Job Description</Label>
                        <Textarea
                          id="ai-description"
                          placeholder="Example: We're looking for a Senior React Developer to join our remote team. Must have 5+ years experience with React, TypeScript, and Node.js. Salary range $100k-$150k. Will be building our next-generation SaaS platform."
                          rows={8}
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAIJobParsing} 
                        disabled={isParsingAI || aiDescription.trim().length < 20}
                        className="w-full gap-2"
                      >
                        {isParsingAI ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Parsing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Job Post
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Remote, New York"
                    required
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary Min ($)</Label>
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    placeholder="e.g. 80000"
                    type="number"
                    required
                  />
                  {errors.salaryMin && <p className="text-sm text-destructive">{errors.salaryMin}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary Max ($)</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  placeholder="e.g. 120000"
                  type="number"
                  required
                />
                {errors.salaryMax && <p className="text-sm text-destructive">{errors.salaryMax}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={6}
                  required
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Key Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="List the key skills and qualifications..."
                  rows={4}
                  required
                />
                {errors.requirements && <p className="text-sm text-destructive">{errors.requirements}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isPosting}>
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Post Job Opening
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Your Active Jobs</h3>
              <JobsList userId={user?.id} />
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <h3 className="font-bold">Pro Tips</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Be specific about requirements</li>
                  <li>• Highlight company culture</li>
                  <li>• Include salary ranges</li>
                  <li>• Respond quickly to applications</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
