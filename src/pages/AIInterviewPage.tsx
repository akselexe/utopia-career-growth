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

  if (!user) return null;

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-background relative overflow-x-hidden">
        {/* Subtle decorative background like dashboard */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-[30vw] h-[30vw] bg-gradient-to-tr from-primary/10 via-accent/8 to-violet-200/8 rounded-full blur-2xl absolute -top-20 -left-20" />
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
                <Video className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">
                  AI Interview Practice
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Practice interviews and get real-time feedback
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Main Interview Component */}
            <AIInterview userId={user!.id} />
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-sm flex flex-col items-center">
                <Video className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Video Analysis</h3>
                <p className="text-base text-muted-foreground text-center">
                  Get feedback on your body language and presentation
                </p>
              </Card>
              
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-sm flex flex-col items-center">
                <MessageSquare className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Smart Questions</h3>
                <p className="text-base text-muted-foreground text-center">
                  AI-generated questions tailored to your experience
                </p>
              </Card>
              
              <Card className="p-8 border-0 rounded-xl shadow-md bg-white/40 backdrop-blur-sm flex flex-col items-center">
                <Mic className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-foreground">Voice Practice</h3>
                <p className="text-base text-muted-foreground text-center">
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
