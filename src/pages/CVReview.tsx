import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { CVUpload } from "@/components/CVUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CVReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
        {/* Header */}
        <div className="border-b bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard/seeker')}
                className="h-9 w-9 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resume Reviewer & Rewriter</h1>
                </div>
                <p className="text-sm text-slate-600 mt-1">AI-powered analysis and professional resume rewriting</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Upload Component */}
            {user && <CVUpload userId={user.id} />}
            
            {/* Best Practices */}
            <Card className="p-8 bg-white border border-slate-200 shadow-lg rounded-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Resume Best Practices</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Keep it concise</p>
                    <p className="text-sm text-slate-600">Aim for 1-2 pages maximum</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Use action verbs</p>
                    <p className="text-sm text-slate-600">Start bullet points with strong verbs and quantify achievements</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Tailor to each job</p>
                    <p className="text-sm text-slate-600">Customize your CV to match job requirements</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Include keywords</p>
                    <p className="text-sm text-slate-600">Use relevant terms from job descriptions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Proofread carefully</p>
                    <p className="text-sm text-slate-600">Check for spelling and grammar errors</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CVReview;
