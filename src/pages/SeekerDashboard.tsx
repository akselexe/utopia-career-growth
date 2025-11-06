import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Target, LogOut, Loader2, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartTooltip } from 'recharts';

const SeekerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({ applications: 0, matches: 0, cvs: 0 });
  const [latestCV, setLatestCV] = useState<any | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [applicationsSeries, setApplicationsSeries] = useState<any[]>([]);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back, track your career progress
                </p>
              </div>
              <Button variant="ghost" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Main Tools Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Link to="/cv-review" className="group">
              <Card className="p-6 h-full border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">CV Review</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered analysis and improvement suggestions for your CV
                </p>
              </Card>
            </Link>

            <Link to="/ai-interview" className="group">
              <Card className="p-6 h-full border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Interview Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Practice interviews with real-time behavioral feedback
                </p>
              </Card>
            </Link>

            <Link to="/job-matcher" className="group">
              <Card className="p-6 h-full border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Job Matcher</h3>
                <p className="text-sm text-muted-foreground">
                  Find jobs tailored to your skills and experience
                </p>
              </Card>
            </Link>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Strength / Latest CV */}
              <Card className="p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Profile Strength</h3>
                  <span className="text-2xl font-bold text-primary">{latestCV?.ai_score ?? 45}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div className={`h-full bg-primary transition-all duration-500`} style={{ width: `${Math.min(latestCV?.ai_score ?? 45, 100)}%` }} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to increase visibility to employers
                </p>

                {latestCV && latestCV.ai_analysis ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Latest CV ( {new Date(latestCV.created_at).toLocaleDateString()} )</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-primary">{latestCV.ai_analysis.score}</div>
                      <div className="text-sm text-muted-foreground">/100</div>
                    </div>
                    {latestCV.ai_analysis.strengths && (
                      <div>
                        <h5 className="text-sm font-medium">Top Strengths</h5>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {latestCV.ai_analysis.strengths.slice(0,3).map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to="/cv-review">
                        <Button variant="outline">View Full Analysis</Button>
                      </Link>
                      <Link to="/cv-review">
                        <Button>Upload New CV</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No CV analyzed yet. Upload your CV to get AI feedback and job matches.</p>
                    <div className="flex gap-2">
                      <Link to="/cv-review">
                        <Button>Upload CV</Button>
                      </Link>
                      <Link to="/job-matcher">
                        <Button variant="outline">Find Matches</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card
                  onClick={() => setExpandedCard(expandedCard === 'applications' ? null : 'applications')}
                  className={`p-6 border text-center cursor-pointer transform transition-transform hover:scale-[1.02] ${expandedCard === 'applications' ? 'ring-2 ring-primary' : ''}`}>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.applications}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  {expandedCard === 'applications' && (
                    <div className="mt-4 h-28">
                      {applicationsSeries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={110}>
                          <BarChart data={applicationsSeries}>
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <RechartTooltip />
                            <Bar dataKey="count" fill="#2563eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent application data</p>
                      )}
                    </div>
                  )}
                </Card>

                <Card
                  onClick={() => setExpandedCard(expandedCard === 'cvs' ? null : 'cvs')}
                  className={`p-6 border text-center cursor-pointer transform transition-transform hover:scale-[1.02] ${expandedCard === 'cvs' ? 'ring-2 ring-primary' : ''}`}>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.cvs}</p>
                  <p className="text-sm text-muted-foreground">CVs Uploaded</p>
                  {expandedCard === 'cvs' && (
                    <div className="mt-4 text-left">
                      {latestCV ? (
                        <>
                          <div className="text-sm font-medium">{latestCV.file_name}</div>
                          <div className="text-xs text-muted-foreground">Scored: {latestCV.ai_score ?? latestCV.ai_analysis?.score ?? '—'}</div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No CV uploaded yet</p>
                      )}
                    </div>
                  )}
                </Card>

                <Card
                  onClick={() => setExpandedCard(expandedCard === 'matches' ? null : 'matches')}
                  className={`p-6 border text-center cursor-pointer transform transition-transform hover:scale-[1.02] ${expandedCard === 'matches' ? 'ring-2 ring-primary' : ''}`}>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.matches}</p>
                  <p className="text-sm text-muted-foreground">Job Matches (≥70%)</p>
                  {expandedCard === 'matches' && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Matches are calculated from recent CV analyses. Visit <Link to="/matched-jobs" className="text-primary underline">Matched Jobs</Link> to view details.</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Next Steps */}
              <Card className="p-6 border">
                <h3 className="text-lg font-semibold mb-4">Recommended Next Steps</h3>
                <div className="space-y-3">
                  <Link to="/cv-review">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Upload your CV</p>
                        <p className="text-xs text-muted-foreground">Get instant AI-powered feedback</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/ai-interview">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Practice your interview skills</p>
                        <p className="text-xs text-muted-foreground">Build confidence with AI feedback</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/job-matcher">
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Find matching opportunities</p>
                        <p className="text-xs text-muted-foreground">AI-powered job recommendations</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Quick Tips</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Regular interview practice can increase your success rate by up to 3x.
                </p>
                <Link to="/ai-interview">
                  <Button variant="outline" size="sm" className="w-full">
                    Start Practicing
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Recent Activity</h3>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activity yet. Start by uploading your CV to get personalized insights.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, idx) => (
                      <div key={item.id + idx} className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {item.type === 'cv' ? 'CV Uploaded' : 'Application'} - {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          {item.score != null && (
                            <div className="text-sm font-semibold text-primary">{item.score}%</div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <Link to="/matched-jobs">
                        <Button variant="ghost" size="sm">View all activity</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SeekerDashboard;
