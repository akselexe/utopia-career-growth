import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Search, Github, Code, ExternalLink } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const FootprintScanner = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [stackoverflowId, setStackoverflowId] = useState("");
  const [githubData, setGithubData] = useState<any>(null);
  const [stackoverflowData, setStackoverflowData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?type=seeker');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileAndScan();
    }
  }, [user]);

  const loadProfileAndScan = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: seekerProfile } = await supabase
        .from('seeker_profiles')
        .select('github_url, twitter_url')
        .eq('user_id', user.id)
        .single();

      // Extract GitHub username from URL
      if (seekerProfile?.github_url) {
        const match = seekerProfile.github_url.match(/github\.com\/([^\/]+)/);
        if (match) {
          setGithubUsername(match[1]);
        }
      }

      // Extract StackOverflow ID from twitter_url (repurpose for SO ID)
      // Or you could add a dedicated stackoverflow_url field
      if (seekerProfile?.twitter_url && seekerProfile.twitter_url.includes('stackoverflow')) {
        const match = seekerProfile.twitter_url.match(/stackoverflow\.com\/users\/(\d+)/);
        if (match) {
          setStackoverflowId(match[1]);
        }
      }

      setLoading(false);

      // Auto-scan if we have at least one platform
      if (seekerProfile?.github_url || (seekerProfile?.twitter_url && seekerProfile.twitter_url.includes('stackoverflow'))) {
        await handleScan(seekerProfile.github_url ? seekerProfile.github_url.match(/github\.com\/([^\/]+)/)?.[1] : '', 
                         seekerProfile?.twitter_url?.includes('stackoverflow') ? seekerProfile.twitter_url.match(/stackoverflow\.com\/users\/(\d+)/)?.[1] : '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleScan = async (ghUsername?: string, soId?: string) => {
    const usernameToUse = ghUsername || githubUsername;
    const idToUse = soId || stackoverflowId;

    if (!usernameToUse && !idToUse) {
      toast({
        title: "No Platform Data",
        description: "Please add your GitHub or StackOverflow URL in profile settings.",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    setGithubData(null);
    setStackoverflowData(null);
    setAnalysis(null);

    try {
      // Fetch GitHub data
      let ghData = null;
      if (usernameToUse) {
        const { data: githubResult, error: githubError } = await supabase.functions.invoke('fetch-github-profile', {
          body: { username: usernameToUse }
        });

        if (githubError) {
          console.error('GitHub fetch error:', githubError);
          toast({
            title: "GitHub Error",
            description: "Failed to fetch GitHub data. Check the username.",
            variant: "destructive",
          });
        } else {
          ghData = githubResult;
          setGithubData(githubResult);
        }
      }

      // Fetch StackOverflow data
      let soData = null;
      if (idToUse) {
        const { data: soResult, error: soError } = await supabase.functions.invoke('fetch-stackoverflow-profile', {
          body: { userId: idToUse }
        });

        if (soError) {
          console.error('StackOverflow fetch error:', soError);
          toast({
            title: "StackOverflow Error",
            description: "Failed to fetch StackOverflow data. Check the user ID.",
            variant: "destructive",
          });
        } else {
          soData = soResult;
          setStackoverflowData(soResult);
        }
      }

      // Analyze footprint if we have any data
      if (ghData || soData) {
        const { data: profileData } = await supabase
          .from('seeker_profiles')
          .select('skills, experience_years, location')
          .eq('user_id', user?.id)
          .single();

        const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-footprint', {
          body: {
            githubData: ghData,
            stackoverflowData: soData,
            profileData
          }
        });

        if (analysisError) {
          console.error('Analysis error:', analysisError);
          toast({
            title: "Analysis Error",
            description: "Failed to generate analysis.",
            variant: "destructive",
          });
        } else {
          setAnalysis(analysisResult.analysis);
          toast({
            title: "Success",
            description: "Footprint analysis completed!",
          });
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Error",
        description: "Failed to scan footprint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-5xl pt-24">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Footprint Scanner</h1>
            <p className="text-muted-foreground text-lg">Analyze your public contributions across platforms</p>
          </div>

          {/* Info Card */}
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-primary mt-1" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Automatic Scanning</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Your footprint is automatically scanned from your profile. Update your GitHub URL or StackOverflow URL in profile settings to scan different accounts.
                </p>
                <Link to="/profile-settings">
                  <Button variant="outline" size="sm">
                    Update Profile URLs
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Results */}
          {(githubData || stackoverflowData) && (
            <div className="space-y-6">
              {/* GitHub Results */}
              {githubData && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Github className="w-5 h-5" />
                      GitHub Profile
                    </h3>
                    <a 
                      href={`https://github.com/${githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{githubData.profile?.publicRepos || 0}</p>
                      <p className="text-sm text-muted-foreground">Repositories</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{githubData.profile?.followers || 0}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{githubData.stats?.totalCommits || 0}</p>
                      <p className="text-sm text-muted-foreground">Recent Commits</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Languages:</strong> {githubData.stats?.languages?.join(', ') || 'N/A'}</p>
                    <p><strong>Location:</strong> {githubData.profile?.location || 'N/A'}</p>
                  </div>
                </Card>
              )}

              {/* StackOverflow Results */}
              {stackoverflowData && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      StackOverflow Profile
                    </h3>
                    <a 
                      href={`https://stackoverflow.com/users/${stackoverflowId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{stackoverflowData.profile?.reputation?.toLocaleString() || 0}</p>
                      <p className="text-sm text-muted-foreground">Reputation</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{stackoverflowData.stats?.answerCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Answers</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{stackoverflowData.stats?.questionCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">
                        🥇{stackoverflowData.profile?.badges?.gold || 0} 
                        🥈{stackoverflowData.profile?.badges?.silver || 0} 
                        🥉{stackoverflowData.profile?.badges?.bronze || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Badges</p>
                    </div>
                  </div>
                  {stackoverflowData.topTags && stackoverflowData.topTags.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-2">Top Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {stackoverflowData.topTags.slice(0, 8).map((tag: any) => (
                          <span key={tag.name} className="px-2 py-1 bg-primary/10 rounded text-xs">
                            {tag.name} ({tag.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* AI Analysis */}
              {analysis && (
                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-6">AI-Powered Footprint Analysis</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </Card>
              )}
            </div>
          )}

          {!githubData && !stackoverflowData && !scanning && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No platform data found in your profile. Add your GitHub or StackOverflow URLs in profile settings to see your footprint analysis.
              </p>
              <Link to="/profile-settings">
                <Button>Update Profile</Button>
              </Link>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default FootprintScanner;
