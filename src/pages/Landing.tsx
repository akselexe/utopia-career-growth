import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Briefcase, TrendingUp, Users, Sparkles, Target, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJjMC0xLjEtLjktMi0yLTJ6bTAtNGgyYzAtMS4xLS45LTItMi0ydi0yYzIuMiAwIDQgMS44IDQgNGgtMnptLTJ2LTJjLTEuMSAwLTItLjktMi0yaC0yYzAgMi4yIDEuOCA0IDQgNHptLTQgMmMyLjIgMCA0IDEuOCA0IDRoLTJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-top-6 duration-700 delay-150">
              Your Gateway to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Growth & Opportunity
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-top-8 duration-700 delay-300">
              Connect talent with opportunity through AI-powered matching, interview practice, and intelligent career insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-top-10 duration-700 delay-500">
              <Link to="/auth?type=seeker">
                <Button size="lg" className="gap-2 text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all">
                  I'm Looking for Work
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-2 hover:border-accent hover:text-accent transition-all">
                  I'm Hiring Talent
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Job Seekers */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">For Job Seekers</h2>
          <p className="text-muted-foreground text-lg">Everything you need to land your dream job</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI CV Review</h3>
            <p className="text-muted-foreground">
              Upload your CV and get instant, deep AI-powered analysis with actionable enhancement suggestions.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Interview Practice</h3>
            <p className="text-muted-foreground">
              Practice with our dynamic AI interviewer to sharpen your skills and boost confidence.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Smart Job Matching</h3>
            <p className="text-muted-foreground">
              Match with opportunities from local companies and global platforms based on your experience.
            </p>
          </Card>
        </div>
      </section>

      {/* Features - Companies */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Companies</h2>
            <p className="text-muted-foreground text-lg">Build your dream team with AI-powered insights</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Easy Job Posting</h3>
              <p className="text-muted-foreground">
                Post job openings effortlessly, define your needs, and highlight your brand story.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Candidate Matching</h3>
              <p className="text-muted-foreground">
                Find best-fit candidates with smart recommendations powered by AI—select for skills and potential.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-md transition-all hover:-translate-y-1 border-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Team Building</h3>
              <p className="text-muted-foreground">
                Build diverse, high-performing teams for lasting impact with data-driven insights.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-2">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of professionals and companies already using UtopiaHire
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?type=seeker">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                Get Started as Job Seeker
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth?type=company">
              <Button size="lg" variant="outline" className="gap-2 border-2 hover:border-accent hover:text-accent">
                Start Hiring
                <Briefcase className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Landing;
