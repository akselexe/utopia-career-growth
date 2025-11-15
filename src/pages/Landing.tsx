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
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/10 min-h-screen flex items-center">
        <AnimatedBackground />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative w-full">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary/20 bg-background text-primary text-sm font-semibold">
              <Globe className="w-4 h-4" />
              Empowering Africa & MENA
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-white">Your Path to</span>{" "}
              <span className="gradient-text">
                Career Success
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed">
              We're building a better job market for Africa and the Middle East. Get your resume reviewed, 
              practice interviews, and find jobs that match your skills all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth?type=seeker">
                <Button size="lg" className="group w-full sm:w-auto">
                  Get Started as Job Seeker
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button size="lg" variant="outline" className="group w-full sm:w-auto">
                  Post Jobs & Hire
                  <Briefcase className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Job Seekers */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            <Users className="w-4 h-4" />
            For Job Seekers
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Complete Career Toolkit
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to enhance your profile and land opportunities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 space-y-4 border-2 hover-lift">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Resume Analysis</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload your CV for instant AI-powered analysis with region-specific 
              recommendations and ATS optimization tips.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>ATS friendly formatting</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Skill gap identification</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Industry optimization</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-4 border-2 hover-lift">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Interview Preparation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Practice with our AI interviewer to improve your responses, 
              build confidence, and prepare for real interviews.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Real-time feedback</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Role-specific questions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Behavioral analysis</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-4 border-2 hover-lift">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Job Matching</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover opportunities matched to your skills and experience 
              from local companies and global platforms.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>AI matching algorithm</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Local & global jobs</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Personalized matches</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Features - Companies */}
      <section className="bg-muted/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              For Companies
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Build Your Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find and hire top talent with AI powered candidate matching
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 space-y-4 border-2 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Easy Job Posting</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Post job openings quickly, define requirements, and showcase 
                your company to attract qualified candidates.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI Candidate Matching</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Receive intelligent candidate recommendations based on skills, 
                experience, and job requirements.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Diversity Insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Build diverse teams with data driven insights and 
                bias-free hiring recommendations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Our Core Values
          </h2>
          <p className="text-muted-foreground">
            Fairness, inclusivity, and transparency guide everything we do
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 text-center space-y-3 border-2 hover-lift">
            <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold">Ethical AI</h4>
            <p className="text-sm text-muted-foreground">
              Fair algorithms that respect your privacy
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 border-2 hover-lift">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-bold">Local Focus</h4>
            <p className="text-sm text-muted-foreground">
              Tailored for African and MENA markets
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 border-2 hover-lift">
            <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold">Inclusive</h4>
            <p className="text-sm text-muted-foreground">
              Opportunities for all backgrounds
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 border-2 hover-lift">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-bold">Empowering</h4>
            <p className="text-sm text-muted-foreground">
              Tools to unlock your potential
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <Card className="max-w-4xl mx-auto p-10 md:p-12 text-center border-2">
          <div className="space-y-6">
            <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join professionals and companies using 3amal to transform careers 
              and build exceptional teams
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/auth?type=seeker">
                <Button size="lg" className="group w-full sm:w-auto">
                  Start as Job Seeker
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button size="lg" variant="outline" className="group w-full sm:w-auto">
                  Start Hiring
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
