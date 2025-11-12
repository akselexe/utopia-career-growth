import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, Mail, MapPin, Briefcase, Star, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ContactCandidateDialog } from "@/components/company/ContactCandidateDialog";

interface Candidate {
  candidate_id: string;
  match_score: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    skills: string[];
    experience_years: number;
    location: string;
    bio: string;
  };
}

interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  requirements: string;
}

interface CompanyProfile {
  company_name: string;
}

const MatchedCandidates = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (user && jobId) {
      loadJobDetails();
      loadCompanyProfile();
    }
  }, [user, jobId]);

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

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('company_id', user?.id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindCandidates = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 3000; // 3 seconds
    
    setMatching(true);
    if (retryCount === 0) {
      setCandidates([]);
    }
    
    try {
      // Verify session before calling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Please sign in again to continue");
      }

      console.log("Calling match-candidates with job:", jobId);
      
      const { data, error } = await supabase.functions.invoke('match-candidates', {
        body: { jobId }
      });

      console.log("Match-candidates response:", { data, error });

      // Handle rate limit errors specifically
      if (error?.message?.includes('429') || data?.error?.includes('Rate limit')) {
        if (retryCount < MAX_RETRIES) {
          toast({
            title: "Rate Limit Hit",
            description: `Too many requests. Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`,
          });
          
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return handleFindCandidates(retryCount + 1);
        } else {
          throw new Error("The AI service is currently experiencing high traffic. Please try again in a few minutes.");
        }
      }

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const matchedCandidates = data?.candidates || [];
      setCandidates(matchedCandidates);
      
      toast({
        title: matchedCandidates.length > 0 ? "Candidates Matched!" : "No Matches Found",
        description: matchedCandidates.length > 0 
          ? `Found ${matchedCandidates.length} matching candidates`
          : "Try creating test candidates first at /seed-test-data",
      });
    } catch (error) {
      console.error('Error matching candidates:', error);
      toast({
        title: "Matching Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setMatching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Button onClick={() => navigate('/dashboard/company')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/company')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Job Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {job.location}
              </p>
            </div>
            <Button
              onClick={() => handleFindCandidates()}
              disabled={matching}
              className="gap-2"
              size="lg"
            >
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find Candidates
                </>
              )}
            </Button>
          </div>
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Job Description</h3>
            <p className="text-sm text-muted-foreground">{job.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <p className="text-sm text-muted-foreground">{job.requirements}</p>
          </div>
        </Card>

        {/* Empty State */}
        {candidates.length === 0 && !matching && (
          <Card className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Candidates Yet</h3>
            <p className="text-muted-foreground">
              Click "Find Candidates" to get AI-powered candidate recommendations
            </p>
          </Card>
        )}

        {/* Candidates List */}
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.candidate_id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold">{candidate.candidate.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.candidate.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {candidate.candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {candidate.candidate.experience_years} years
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col gap-2">
                    <ContactCandidateDialog
                      candidateEmail={candidate.candidate.email}
                      candidateName={candidate.candidate.name}
                      jobTitle={job?.title}
                      companyName={companyProfile?.company_name || "Our Company"}
                    />
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score}%
                    </div>
                    <Badge variant={getScoreBadgeVariant(candidate.match_score)} className="mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Match Score
                    </Badge>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-muted-foreground">{candidate.summary}</p>

                {/* Skills */}
                {candidate.candidate.skills && candidate.candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {candidate.candidate.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Strengths & Concerns */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {candidate.strengths.map((strength, idx) => (
                        <li key={idx} className="text-muted-foreground">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Considerations
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {candidate.concerns.map((concern, idx) => (
                        <li key={idx} className="text-muted-foreground">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchedCandidates;
