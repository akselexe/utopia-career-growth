import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, TrendingUp, Target, Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const JobMatcher = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/seeker')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-1 flex-1">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-accent" />
                Smart Job Matcher
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered job recommendations based on your profile
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* CTA Card */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <div className="space-y-4 text-center">
                <Sparkles className="w-16 h-16 text-accent mx-auto" />
                <h2 className="text-2xl font-bold">Get Your Perfect Job Matches</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your CV first to unlock AI-powered job matching that analyzes your skills,
                  experience, and career goals to find the best opportunities for you.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <Link to="/cv-review">
                    <Button size="lg" className="gap-2">
                      Upload CV First
                    </Button>
                  </Link>
                  <Link to="/matched-jobs">
                    <Button size="lg" variant="outline" className="gap-2">
                      View Matches
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <Target className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Personalized Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your skills, experience, and preferences to find jobs that truly fit your profile
                </p>
              </Card>
              
              <Card className="p-6">
                <TrendingUp className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Score-Based Ranking</h3>
                <p className="text-sm text-muted-foreground">
                  Jobs are ranked by match score so you can focus on opportunities where you'll excel
                </p>
              </Card>
              
              <Card className="p-6">
                <Briefcase className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold mb-2">Real Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Browse through verified job listings from companies actively hiring
                </p>
              </Card>
              
              <Card className="p-6">
                <Sparkles className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Continuous Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Your matches update automatically as new jobs are posted and your profile evolves
                </p>
              </Card>
            </div>

            {/* Browse All Jobs */}
            <Card className="p-6 text-center">
              <h3 className="font-semibold mb-2">Or Browse All Available Jobs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore all job listings without AI matching
              </p>
              <Link to="/jobs">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default JobMatcher;
