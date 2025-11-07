import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Target, LogOut, Loader2, Sparkles, TrendingUp, ArrowRight, BarChart3, Lightbulb, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartTooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';

const SeekerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({ applications: 0, matches: 0, cvs: 0 });
  const [latestCV, setLatestCV] = useState<any | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [applicationsSeries, setApplicationsSeries] = useState<any[]>([]);
  const [careerInsights, setCareerInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?type=seeker');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadLatestCV();
      loadRecentActivity();
    }
  }, [user]);

  const generateCareerInsights = async () => {
    if (!user) return;
    setLoadingInsights(true);
    try {
      // Fetch seeker profile for GitHub/Stack Overflow URLs
      const { data: seekerProfile } = await supabase
        .from('seeker_profiles')
        .select('github_url, twitter_url')
        .eq('user_id', user.id)
        .single();

      let footprintData = null;

      // If profile has GitHub or Stack Overflow URLs, fetch footprint data
      if (seekerProfile?.github_url || (seekerProfile?.twitter_url && seekerProfile.twitter_url.includes('stackoverflow'))) {
        const githubUsername = seekerProfile?.github_url?.match(/github\.com\/([^\/]+)/)?.[1];
        const stackoverflowId = seekerProfile?.twitter_url?.includes('stackoverflow') 
          ? seekerProfile.twitter_url.match(/stackoverflow\.com\/users\/(\d+)/)?.[1] 
          : null;

        let githubData = null;
        let stackoverflowData = null;

        // Fetch GitHub data
        if (githubUsername) {
          const { data: ghResult } = await supabase.functions.invoke('fetch-github-profile', {
            body: { username: githubUsername }
          });
          if (ghResult) githubData = ghResult;
        }

        // Fetch Stack Overflow data
        if (stackoverflowId) {
          const { data: soResult } = await supabase.functions.invoke('fetch-stackoverflow-profile', {
            body: { userId: stackoverflowId }
          });
          if (soResult) stackoverflowData = soResult;
        }

        if (githubData || stackoverflowData) {
          footprintData = { githubData, stackoverflowData };
        }
      }

      // Generate career insights with footprint data
      const { data, error } = await supabase.functions.invoke('career-insights', {
        body: {
          cvAnalysis: latestCV?.ai_analysis,
          applications: stats.applications,
          profile: { completeness: latestCV?.ai_score || 45 },
          footprintData
        }
      });

      if (error) throw error;
      setCareerInsights(data.insights);
      toast({
        title: "Career Insights Generated",
        description: footprintData 
          ? "Your personalized career report with developer footprint is ready."
          : "Your personalized career report is ready.",
      });
    } catch (error) {
      console.error('Error generating career insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate career insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadRecentActivity = async () => {
    if (!user) return;
    try {
      const { data: apps } = await supabase
        .from('applications')
        .select('id, job_id, created_at, match_score, jobs(id, title)')
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);

      const { data: cvs } = await supabase
        .from('cvs')
        .select('id, file_name, created_at, ai_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const activity: any[] = [];
      if (apps) {
        apps.forEach((a: any) => {
          activity.push({ type: 'application', id: a.id, title: a.jobs?.title || 'Application', date: a.created_at, score: a.match_score });
        });
      }
      if (cvs) {
        cvs.forEach((c: any) => {
          activity.push({ type: 'cv', id: c.id, title: c.file_name, date: c.created_at, score: c.ai_score });
        });
      }

      activity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activity.slice(0, 10));

      // Build simple monthly series for applications (group by month)
      if (apps) {
        const seriesMap: Record<string, number> = {};
        apps.forEach((a: any) => {
          const d = new Date(a.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()+1}`;
          seriesMap[key] = (seriesMap[key] || 0) + 1;
        });
        const series = Object.keys(seriesMap).map(k => ({ month: k, count: seriesMap[k] }));
        setApplicationsSeries(series);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const { count: applicationsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('seeker_id', user.id);

      const { count: matchesCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('seeker_id', user.id)
        .not('match_score', 'is', null)
        .gte('match_score', 70);

      const { count: cvsCount } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({ applications: applicationsCount || 0, matches: matchesCount || 0, cvs: cvsCount || 0 });
    } catch (error) {
      console.error('Error loading seeker stats:', error);
    }
  };

  const loadLatestCV = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setLatestCV(data[0]);
      }
    } catch (error) {
      console.error('Error loading latest CV:', error);
    }
  };


  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 pt-24">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Career Insights Dashboard</h1>
            <p className="text-muted-foreground text-lg">Strategic analysis for your career development</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.applications}</p>
              <p className="text-xs text-muted-foreground mt-1">Total submitted</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Strong Matches</p>
                <Target className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.matches}</p>
              <p className="text-xs text-muted-foreground mt-1">≥70% match score</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">CVs Analyzed</p>
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.cvs}</p>
              <p className="text-xs text-muted-foreground mt-1">AI reviewed</p>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Career Insights */}
              <Card className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Career Insights Report</h2>
                      <p className="text-sm text-muted-foreground">AI-powered strategic career guidance</p>
                    </div>
                  </div>
                  <Button 
                    onClick={generateCareerInsights}
                    disabled={loadingInsights || !latestCV}
                    className="gap-2"
                  >
                    {loadingInsights ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                </div>

                {careerInsights ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{careerInsights}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {latestCV 
                        ? "Generate personalized career insights based on your profile and activity."
                        : "Upload a CV first to unlock AI-powered career insights."}
                    </p>
                    {!latestCV && (
                      <Link to="/cv-review">
                        <Button variant="outline">Upload CV</Button>
                      </Link>
                    )}
                  </div>
                )}
              </Card>

              {/* Profile Strength / Latest CV */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Profile Strength</h3>
                  <span className="text-2xl font-bold text-primary">{latestCV?.ai_score ?? 45}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(latestCV?.ai_score ?? 45, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to increase visibility to employers
                </p>

                {latestCV && latestCV.ai_analysis ? (
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">Latest CV ( {new Date(latestCV.created_at).toLocaleDateString()} )</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-extrabold text-primary">{latestCV.ai_analysis.score}</div>
                      <div className="text-lg text-muted-foreground">/100</div>
                    </div>
                    {latestCV.ai_analysis.strengths && (
                      <div>
                        <h5 className="text-base font-medium">Top Strengths</h5>
                        <ul className="list-disc list-inside text-base text-muted-foreground">
                          {latestCV.ai_analysis.strengths.slice(0,3).map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link to="/cv-review">
                        <Button variant="outline" className="rounded-full border-primary/60 hover:bg-primary/10 transition-all">View Full Analysis</Button>
                      </Link>
                      <Link to="/cv-review">
                        <Button className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all">Upload New CV</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base text-muted-foreground">No CV analyzed yet. Upload your CV to get AI feedback and job matches.</p>
                    <div className="flex gap-3">
                      <Link to="/cv-review">
                        <Button className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all">Upload CV</Button>
                      </Link>
                      <Link to="/job-matcher">
                        <Button variant="outline" className="rounded-full border-accent/60 hover:bg-accent/10 transition-all">Find Matches</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>

              {/* Application Activity Chart */}
              {applicationsSeries.length > 0 && (
                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-6">Application Activity</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={applicationsSeries}>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <RechartTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                <div className="grid gap-4">
                  <Link to="/cv-review" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-all">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Resume Review & Rewrite</p>
                        <p className="text-sm text-muted-foreground">AI analysis & rewriting</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link to="/ai-interview" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-all">
                      <Video className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">AI Interview</p>
                        <p className="text-sm text-muted-foreground">Practice with AI</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link to="/job-matcher" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-all">
                      <Target className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Job Matcher</p>
                        <p className="text-sm text-muted-foreground">Find opportunities</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((item, idx) => (
                      <div key={item.id + idx} className="pb-3 border-b last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.type === 'cv' ? 'CV Uploaded' : 'Applied'} - {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          {item.score != null && (
                            <span className="text-sm font-semibold text-primary shrink-0">
                              {item.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default SeekerDashboard;
