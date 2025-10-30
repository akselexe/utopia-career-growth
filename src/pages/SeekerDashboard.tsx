import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Briefcase, TrendingUp, Target, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SeekerDashboard = () => {
  const { toast } = useToast();

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "CV Uploaded!",
        description: "Analyzing your CV with AI... This feature will be fully integrated soon.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground text-lg">
            Let's take your career to the next level
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Upload CV</h3>
              <p className="text-sm text-muted-foreground">Get AI-powered feedback</p>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <Sparkles className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Practice Interview</h3>
              <p className="text-sm text-muted-foreground">AI interview simulation</p>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Browse Jobs</h3>
              <p className="text-sm text-muted-foreground">Find your perfect match</p>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Career Insights</h3>
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* CV Upload Section */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                CV Review & Enhancement
              </h2>
              <p className="text-muted-foreground">
                Upload your CV to get instant AI-powered analysis and improvement suggestions
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4 hover:border-primary transition-colors">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="text-lg font-semibold">Drop your CV here or click to browse</div>
                  <div className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX</div>
                </Label>
                <Input
                  id="cv-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                />
              </div>
              <Button asChild>
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  Choose File
                </Label>
              </Button>
            </div>
          </Card>

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
                <Target className="w-8 h-8 text-primary" />
                <h3 className="font-bold">Next Steps</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Complete your profile</li>
                  <li>→ Upload your CV</li>
                  <li>→ Practice interviews</li>
                  <li>→ Apply to jobs</li>
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
