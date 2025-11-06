import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, TrendingUp, Target, Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const JobMatcher = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background relative overflow-x-hidden">
        {/* Decorative background shapes like dashboard */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-[30vw] h-[30vw] bg-gradient-to-tr from-primary/12 via-accent/8 to-violet-200/8 rounded-full blur-2xl absolute -top-20 -left-20" />
          <div className="w-[18vw] h-[18vw] bg-gradient-to-br from-yellow-200/8 via-amber-200/8 to-violet-200/6 rounded-full blur-xl absolute top-2/3 right-0 opacity-60" />
        </div>
        
        {/* Header */}
        <div className="border-b bg-card/80 backdrop-blur-sm z-10 relative">
          <div className="container mx-auto px-4 py-5 flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/seeker')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">Job Matcher</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered job recommendations based on your profile
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* CTA Card */}
            <Card className="p-10 border-0 text-center bg-white/50 rounded-xl shadow-lg backdrop-blur-lg">
              <Sparkles className="w-14 h-14 text-primary mx-auto mb-5" />
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Get Your Perfect Job Matches
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
                Upload your CV first to unlock AI-powered job matching that analyzes your skills, experience, and career goals to find the best opportunities for you.
              </p>
              <div className="flex gap-5 justify-center">
                <Link to="/cv-review">
                  <Button className="gap-2 px-6 py-3 text-lg rounded-full">
                    Upload CV First
                  </Button>
                </Link>
                <Link to="/matched-jobs">
                  <Button variant="outline" className="gap-2 px-6 py-3 text-lg rounded-full">
                    View Matches
                  </Button>
                </Link>
              </div>
            </Card>
            
            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-md flex flex-col items-center text-center">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Personalized Matching</h3>
                <p className="text-base text-muted-foreground">
                  Our AI analyzes your skills, experience, and preferences to find jobs that truly fit your profile
                </p>
              </Card>
              
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-md flex flex-col items-center text-center">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Score-Based Ranking</h3>
                <p className="text-base text-muted-foreground">
                  Jobs are ranked by match score so you can focus on opportunities where you'll excel
                </p>
              </Card>
              
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-md flex flex-col items-center text-center">
                <Briefcase className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Real Opportunities</h3>
                <p className="text-base text-muted-foreground">
                  Browse through verified job listings from companies actively hiring
                </p>
              </Card>
              
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-md flex flex-col items-center text-center">
                <Sparkles className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Continuous Updates</h3>
                <p className="text-base text-muted-foreground">
                  Your matches update automatically as new jobs are posted and your profile evolves
                </p>
              </Card>
            </div>
            
            {/* Browse All Jobs */}
            <Card className="p-8 border-0 rounded-xl shadow text-center bg-white/60 backdrop-blur-xl">
              <h3 className="font-bold text-lg mb-2 text-foreground">Browse All Available Jobs</h3>
              <p className="text-base text-muted-foreground mb-4">
                Explore all job listings without AI matching
              </p>
              <Link to="/jobs">
                <Button variant="outline" className="px-6 py-3 text-lg rounded-full">Browse Jobs</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default JobMatcher;
