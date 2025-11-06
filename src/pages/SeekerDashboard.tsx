import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Target, LogOut, Loader2, Sparkles, TrendingUp, BarChart3, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const SeekerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?type=seeker');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Career Insights Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Track your progress and accelerate your career growth
              </p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/cv-review">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full group">
                <div className="space-y-3">
                  <FileText className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">CV Review</h3>
                  <p className="text-sm text-muted-foreground">AI-powered analysis and improvement tips</p>
                  <Button variant="outline" size="sm" className="w-full">Go to CV Review →</Button>
                </div>
              </Card>
            </Link>

            <Link to="/ai-interview">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full group">
                <div className="space-y-3">
                  <Video className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">AI Interview</h3>
                  <p className="text-sm text-muted-foreground">Practice with real-time feedback</p>
                  <Button variant="outline" size="sm" className="w-full">Start Practice →</Button>
                </div>
              </Card>
            </Link>

            <Link to="/job-matcher">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full group">
                <div className="space-y-3">
                  <Sparkles className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">Job Matcher</h3>
                  <p className="text-sm text-muted-foreground">Smart AI-powered recommendations</p>
                  <Button variant="outline" size="sm" className="w-full">Find Matches →</Button>
                </div>
              </Card>
            </Link>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Your Progress
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Profile Strength</span>
                      <span className="text-2xl font-bold text-primary">45%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload your CV and complete your profile to increase strength
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-3xl font-bold text-primary">0</p>
                      <p className="text-sm text-muted-foreground mt-1">Applications</p>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-lg">
                      <p className="text-3xl font-bold text-accent">0</p>
                      <p className="text-sm text-muted-foreground mt-1">Interviews</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/5 rounded-lg">
                      <p className="text-3xl font-bold text-secondary">0</p>
                      <p className="text-sm text-muted-foreground mt-1">Matches</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Next Steps */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-accent" />
                  Next Steps
                </h3>
                <div className="space-y-3">
                  <Link to="/cv-review">
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Upload Your CV</p>
                          <p className="text-sm text-muted-foreground">Get instant AI analysis</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/ai-interview">
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-bold">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Practice Interview</p>
                          <p className="text-sm text-muted-foreground">Build confidence with AI</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/job-matcher">
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-secondary font-bold">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Find Your Match</p>
                          <p className="text-sm text-muted-foreground">AI-powered job recommendations</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
                <Sparkles className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-2">AI-Powered Tools</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>CV Analysis & Scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Interview Practice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Smart Job Matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-muted-foreground">Career Path Insights</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <Award className="w-10 h-10 text-accent mb-3" />
                <h3 className="font-bold text-lg mb-2">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Start by uploading your CV!
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10">
                <TrendingUp className="w-10 h-10 text-secondary mb-3" />
                <h3 className="font-bold text-lg mb-2">Career Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Regular interview practice increases success rate by 3x. Start practicing today!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SeekerDashboard;
