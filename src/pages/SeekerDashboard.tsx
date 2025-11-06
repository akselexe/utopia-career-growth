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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background relative overflow-x-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-[40vw] h-[40vw] bg-gradient-to-tr from-orange-200/10 via-blue-200/8 to-violet-200/8 rounded-full blur-2xl absolute -top-24 -left-24" />
          <div className="w-[28vw] h-[28vw] bg-gradient-to-br from-yellow-200/8 via-amber-200/8 to-violet-200/6 rounded-full blur-xl absolute top-1/2 right-0 opacity-60" />
        </div>
        {/* Header */}
        <div className="border-b bg-card/80 backdrop-blur-sm z-10 relative">
          <div className="container mx-auto px-4 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, track your career progress</p>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="gap-2 rounded-md px-3 py-1 border hover:bg-primary/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Main Tools Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            <Link to="/cv-review" className="group">
              <Card className="p-6 h-full border-0 bg-white/30 backdrop-blur-sm shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">CV Review</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered analysis and improvement suggestions for your CV
                </p>
              </Card>
            </Link>

            <Link to="/ai-interview" className="group">
              <Card className="p-6 h-full border-0 bg-white/30 backdrop-blur-sm shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">AI Interview Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Practice interviews with real-time behavioral feedback
                </p>
              </Card>
            </Link>

            <Link to="/job-matcher" className="group">
              <Card className="p-6 h-full border-0 bg-white/30 backdrop-blur-sm shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">Job Matcher</h3>
                <p className="text-sm text-muted-foreground">
                  Find jobs tailored to your skills and experience
                </p>
              </Card>
            </Link>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Strength / Latest CV */}
              <Card className="p-6 border-0 bg-white/40 backdrop-blur-sm shadow-md rounded-xl">
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <Card
                  onClick={() => setExpandedCard(expandedCard === 'applications' ? null : 'applications')}
                  className={`p-6 border-0 text-center cursor-pointer rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg hover:scale-[1.04] transition-transform duration-300 ${expandedCard === 'applications' ? 'ring-4 ring-primary/40' : ''}`}
                >
                  <p className="text-4xl font-extrabold text-foreground mb-1">{stats.applications}</p>
                  <p className="text-base text-muted-foreground">Applications</p>
                  {expandedCard === 'applications' && (
                    <div className="mt-4 h-32">
                      {applicationsSeries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={110}>
                          <BarChart data={applicationsSeries}>
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <RechartTooltip />
                            <Bar dataKey="count" fill="#2563eb" className="transition-all duration-500" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-base text-muted-foreground">No recent application data</p>
                      )}
                    </div>
                  )}
                </Card>

                <Card
                  onClick={() => setExpandedCard(expandedCard === 'cvs' ? null : 'cvs')}
                  className={`p-6 border-0 text-center cursor-pointer rounded-2xl bg-gradient-to-br from-orange-100/40 to-yellow-100/40 shadow-lg hover:scale-[1.04] transition-transform duration-300 ${expandedCard === 'cvs' ? 'ring-4 ring-amber-400/40' : ''}`}
                >
                  <p className="text-4xl font-extrabold text-foreground mb-1">{stats.cvs}</p>
                  <p className="text-base text-muted-foreground">CVs Uploaded</p>
                  {expandedCard === 'cvs' && (
                    <div className="mt-4 text-left">
                      {latestCV ? (
                        <>
                          <div className="text-base font-medium">{latestCV.file_name}</div>
                          <div className="text-sm text-muted-foreground">Scored: {latestCV.ai_score ?? latestCV.ai_analysis?.score ?? '—'}</div>
                        </>
                      ) : (
                        <p className="text-base text-muted-foreground">No CV uploaded yet</p>
                      )}
                    </div>
                  )}
                </Card>

                <Card
                  onClick={() => setExpandedCard(expandedCard === 'matches' ? null : 'matches')}
                  className={`p-6 border-0 text-center cursor-pointer rounded-2xl bg-gradient-to-br from-violet-100/40 to-blue-100/40 shadow-lg hover:scale-[1.04] transition-transform duration-300 ${expandedCard === 'matches' ? 'ring-4 ring-violet-400/40' : ''}`}
                >
                  <p className="text-4xl font-extrabold text-foreground mb-1">{stats.matches}</p>
                  <p className="text-base text-muted-foreground">Job Matches (≥70%)</p>
                  {expandedCard === 'matches' && (
                    <div className="mt-4 text-base text-muted-foreground">
                      <p>Matches are calculated from recent CV analyses. Visit <Link to="/matched-jobs" className="text-primary underline">Matched Jobs</Link> to view details.</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Next Steps */}
              <Card className="p-8 border-0 bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl glass-card">
                <h3 className="text-xl font-bold mb-6 text-foreground">Recommended Next Steps</h3>
                <div className="space-y-4">
                  <Link to="/cv-review">
                    <div className="flex items-center gap-5 p-5 rounded-2xl border-0 bg-gradient-to-r from-primary/10 to-accent/10 hover:shadow-lg transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base">Upload your CV</p>
                        <p className="text-sm text-muted-foreground">Get instant AI-powered feedback</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/ai-interview">
                    <div className="flex items-center gap-5 p-5 rounded-2xl border-0 bg-gradient-to-r from-blue-100/40 to-violet-100/40 hover:shadow-lg transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold shadow">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base">Practice your interview skills</p>
                        <p className="text-sm text-muted-foreground">Build confidence with AI feedback</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/job-matcher">
                    <div className="flex items-center gap-5 p-5 rounded-2xl border-0 bg-gradient-to-r from-orange-100/40 to-yellow-100/40 hover:shadow-lg transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-lg font-bold shadow">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base">Find matching opportunities</p>
                        <p className="text-sm text-muted-foreground">AI-powered job recommendations</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="p-6 border-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl shadow-lg glass-card">
                <div className="flex items-center gap-4 mb-4">
                  <Target className="w-6 h-6 text-primary drop-shadow" />
                  <h3 className="font-semibold text-lg">Quick Tips</h3>
                </div>
                <p className="text-base text-muted-foreground mb-4">
                  Regular interview practice can increase your success rate by up to 3x.
                </p>
                <Link to="/ai-interview">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-full border-primary/60 hover:bg-primary/10 transition-all"
                  >
                    Start Practicing
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 border-0 bg-gradient-to-br from-violet-100/40 to-blue-100/40 rounded-2xl shadow-lg glass-card">
                <div className="flex items-center gap-4 mb-4">
                  <TrendingUp className="w-6 h-6 text-violet-500 drop-shadow" />
                  <h3 className="font-semibold text-lg">Recent Activity</h3>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    No recent activity yet. Start by uploading your CV to get personalized insights.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((item, idx) => (
                      <div key={item.id + idx} className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-medium">
                            {item.type === 'cv' ? 'CV Uploaded' : 'Application'} - {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          {item.score != null && (
                            <div className="text-base font-semibold text-primary">{item.score}%</div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <Link to="/matched-jobs">
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 transition-all">View all activity</Button>
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
