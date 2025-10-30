import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Target, TrendingUp, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const CompanyDashboard = () => {
  const { toast } = useToast();

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Job Posted!",
      description: "Your job posting is now live and visible to candidates.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect talent for your team
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Users className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Matches</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">0%</div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Posting Form */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Post a New Job
              </h2>
              <p className="text-muted-foreground">
                Fill out the details below to attract the best candidates
              </p>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Remote, New York"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    placeholder="e.g. $80k - $120k"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Key Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the key skills and qualifications..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Post Job Opening
              </Button>
            </form>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  View Candidates
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Briefcase className="w-4 h-4" />
                  Manage Jobs
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Target className="w-4 h-4" />
                  AI Recommendations
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <h3 className="font-bold">Pro Tips</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Be specific about requirements</li>
                  <li>• Highlight company culture</li>
                  <li>• Include salary ranges</li>
                  <li>• Respond quickly to applications</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
