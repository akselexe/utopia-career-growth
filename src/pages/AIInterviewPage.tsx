import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mic, Video, MessageSquare } from "lucide-react";
import { AIInterview } from "@/components/AIInterview";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AIInterviewPage = () => {
  const { user } = useAuth();
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
                <Video className="w-10 h-10 text-primary" />
                AI Interview Practice
              </h1>
              <p className="text-muted-foreground text-lg">
                Practice interviews with AI and get real-time feedback
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <AIInterview userId={user!.id} />
            
            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                <Video className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Video Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get feedback on your body language and presentation
                </p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10">
                <MessageSquare className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold mb-1">Smart Questions</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated questions tailored to your experience
                </p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <Mic className="w-8 h-8 text-secondary mb-2" />
                <h3 className="font-semibold mb-1">Voice Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Improve your communication and speaking skills
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIInterviewPage;
