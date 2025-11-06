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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/seeker')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-semibold">AI Interview Practice</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice interviews and get real-time feedback
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Main Interview Component */}
            <AIInterview userId={user!.id} />
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 border">
                <Video className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Video Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get feedback on your body language and presentation
                </p>
              </Card>
              
              <Card className="p-6 border">
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Smart Questions</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated questions tailored to your experience
                </p>
              </Card>
              
              <Card className="p-6 border">
                <Mic className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Voice Practice</h3>
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
