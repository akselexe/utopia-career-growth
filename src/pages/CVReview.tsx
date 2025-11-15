import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { CVUpload } from "@/components/CVUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// upload and review cv
const CVReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 pt-16">
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
