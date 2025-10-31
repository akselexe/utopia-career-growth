import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Target, LogOut, Loader2, Sparkles } from "lucide-react";
import { CVUpload } from "@/components/CVUpload";
import { AIInterview } from "@/components/AIInterview";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome Back!</h1>
            <p className="text-muted-foreground text-lg">
              Let's take your career to the next level
            </p>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/jobs">
            <Card className="p-4 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="space-y-2">
                <Briefcase className="w-8 h-8 text-primary" />
                <h3 className="font-semibold">Browse Jobs</h3>
                <p className="text-sm text-muted-foreground">Find your perfect match</p>
              </div>
            </Card>
          </Link>

          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Career Insights</h3>
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <Target className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground">Update your details</p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* CV Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <CVUpload userId={user.id} />
            <AIInterview userId={user.id} />
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Profile Strength</span>
                    <span className="text-sm font-semibold">45%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-primary to-accent" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Applications</span>
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interviews</span>
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Matches</span>
                    <span className="text-xl font-bold">0</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <div className="space-y-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h3 className="font-bold">AI-Powered</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ CV Analysis & Scoring</li>
                  <li>✓ Interview Practice</li>
                  <li>→ Smart Job Matching</li>
                  <li>→ Career Path Insights</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
