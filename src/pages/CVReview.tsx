import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { CVUpload } from "@/components/CVUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CVReview = () => {
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
                <FileText className="w-10 h-10 text-primary" />
                CV Review & Analysis
              </h1>
              <p className="text-muted-foreground text-lg">
                Get AI-powered insights to improve your CV
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <CVUpload userId={user!.id} />
            
            {/* Tips Section */}
            <Card className="p-6 mt-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-bold text-lg mb-3">💡 CV Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Keep your CV concise and focused (1-2 pages)</li>
                <li>✓ Use action verbs and quantify achievements</li>
                <li>✓ Tailor your CV to each job application</li>
                <li>✓ Include relevant keywords from job descriptions</li>
                <li>✓ Proofread carefully for spelling and grammar</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CVReview;
