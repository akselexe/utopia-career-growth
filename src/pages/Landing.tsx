import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Target, 
  BarChart,
  Globe,
  Shield,
  Zap,
  Heart,
  Award,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJjMC0xLjEtLjktMi0yLTJ6bTAtNGgyYzAtMS4xLS45LTItMi0ydi0yYzIuMiAwIDQgMS44IDQgNGgtMnptLTJ2LTJjLTEuMSAwLTItLjktMi0yaC0yYzAgMi4yIDEuOCA0IDQgNHptLTQgMmMyLjIgMCA0IDEuOCA0IDRoLTJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 text-primary text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4 animate-pulse" />
              AI-Powered Career Platform for Africa & MENA
              <Globe className="w-4 h-4" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in fade-in slide-in-from-top-6 duration-700 delay-150">
              Empower Your{" "}
              <span className="gradient-text inline-block">
                Career Journey
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-8 duration-700 delay-300">
              Break barriers. Transform resumes. Land opportunities. 
              <span className="text-foreground font-semibold"> UtopiaHire</span> connects talent with opportunity through ethical AI, 
              empowering job seekers across emerging regions.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-top-10 duration-700 delay-500">
              <Link to="/auth?type=seeker">
                <Button size="xl" variant="hero" className="group w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button size="xl" variant="glass" className="group w-full sm:w-auto">
                  I'm Hiring Talent
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground animate-in fade-in duration-700 delay-700">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Ethical AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Instant Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                <span>Inclusive Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 gradient-border hover-lift">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Breaking Down Barriers to Employment
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In Sub-Saharan Africa and MENA regions, talented professionals face 
                <span className="text-foreground font-semibold"> high rejection rates</span> due to 
                outdated resumes, poor formatting, and algorithmic filtering. 
                Many lack access to personalized career guidance or interview preparation tools.
              </p>
              <p className="text-lg font-semibold text-primary">
                UtopiaHire changes that—with fairness, intelligence, and empathy at its core.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features - Job Seekers */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Users className="w-4 h-4" />
            For Job Seekers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Your Complete Career Toolkit
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to stand out and land your dream opportunity
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <Card className="p-8 space-y-6 hover-lift border-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center pulse-glow">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mt-4">AI CV Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your resume and receive instant, deep AI-powered analysis with 
                contextualized suggestions tailored to your region and industry.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>ATS-friendly formatting tips</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Skill gap identification</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Industry-specific optimization</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 space-y-6 hover-lift border-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center pulse-glow" style={{ animationDelay: '0.3s' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mt-4">AI Interview Coach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice with our dynamic AI interviewer to sharpen your skills, 
                boost confidence, and ace your next interview.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Real-time feedback on answers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Role-specific questions</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Behavioral analysis</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 space-y-6 hover-lift border-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center pulse-glow" style={{ animationDelay: '0.6s' }}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mt-4">Smart Job Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Match with locally relevant opportunities and global platforms 
                based on your unique skills, experience, and career aspirations.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>AI-powered matching algorithm</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Local & global opportunities</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Personalized recommendations</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* Features - Companies */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold">
              <Briefcase className="w-4 h-4" />
              For Companies
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Build Exceptional Teams
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find, evaluate, and hire the best talent with AI-powered insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <Card className="p-8 space-y-4 hover-lift border-2 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Easy Job Posting</h3>
              <p className="text-muted-foreground leading-relaxed">
                Post openings effortlessly, define requirements, and showcase 
                your company culture to attract the right candidates.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-lift border-2 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">AI Candidate Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover best-fit candidates with intelligent recommendations—
                evaluate skills, potential, and cultural alignment.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-lift border-2 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <BarChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Diversity & Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build diverse, high-performing teams with data-driven insights 
                and bias-free hiring recommendations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built on Values That Matter
          </h2>
          <p className="text-muted-foreground text-lg">
            Fairness, inclusivity, and empowerment at every step
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center space-y-3 hover-lift border-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-bold text-lg">Ethical AI</h4>
            <p className="text-sm text-muted-foreground">
              Fair, transparent algorithms that respect privacy
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover-lift border-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold text-lg">Local Context</h4>
            <p className="text-sm text-muted-foreground">
              Tailored for African and MENA markets
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover-lift border-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-bold text-lg">Inclusive</h4>
            <p className="text-sm text-muted-foreground">
              Breaking barriers for all backgrounds
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover-lift border-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold text-lg">Empowering</h4>
            <p className="text-sm text-muted-foreground">
              Tools that unlock your full potential
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-5xl mx-auto p-12 md:p-16 text-center relative overflow-hidden border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Future?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Join thousands empowering their careers and building exceptional teams with UtopiaHire
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
              <Link to="/auth?type=seeker">
                <Button size="xl" variant="empowering" className="group w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button size="xl" variant="outline" className="group w-full sm:w-auto">
                  Find Your Team
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Landing;
