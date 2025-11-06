import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Target, LogOut, Loader2, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
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
              {/* Profile Strength */}
              <Card className="p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Profile Strength</h3>
                  <span className="text-2xl font-bold text-primary">45%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full w-[45%] bg-primary transition-all duration-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete your profile to increase visibility to employers
                </p>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 border text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </Card>
                <Card className="p-6 border text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                </Card>
                <Card className="p-6 border text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Job Matches</p>
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
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Start by uploading your CV to get personalized insights.
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
