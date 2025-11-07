import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, FileText, CheckCircle2, XCircle, Sparkles, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite handles this worker import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface CVAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  missing_skills: string[];
  formatting_feedback: string;
}

export const CVUpload = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [cvText, setCvText] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenResume, setRewrittenResume] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");

  // Set up PDF.js worker using Vite's URL import
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please try a different file format.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setFileName(file.name);
    setAnalysis(null);

    try {
      // Extract text from PDF
      let text: string;
      
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        // For TXT and other text files, read directly
        text = await file.text();
      }

      setCvText(text); // Store the extracted text

      // Upload to storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call AI analysis edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-cv', {
        body: { 
          cvText: text.substring(0, 4000), // Limit text length
          fileName: file.name 
        },
      });

      if (aiError) {
        console.error('AI Analysis error:', aiError);
        throw new Error(aiError.message || 'Failed to analyze CV');
      }

      if (!aiData || !aiData.analysis) {
        throw new Error('No analysis data received');
      }

      // Save CV record to database
      const { error: dbError } = await supabase.from('cvs').insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        ai_analysis: aiData.analysis,
        ai_score: aiData.analysis.score,
      });

      if (dbError) throw dbError;

      setAnalysis(aiData.analysis);
      
      toast({
        title: "CV Analyzed Successfully!",
        description: `Your CV scored ${aiData.analysis.score}/100. Finding matching jobs...`,
      });

      // Trigger automatic job matching
      try {
        const { data: matchData, error: matchError } = await supabase.functions.invoke('match-jobs', {
          body: { 
            cvAnalysis: aiData.analysis,
            userId: userId
          },
        });

        if (matchError) {
          console.error('Job matching error:', matchError);
        } else if (matchData?.matches) {
          toast({
            title: "Job Matches Found!",
            description: `Found ${matchData.matches.length} jobs matching your profile (≥70% match)`,
          });
        }
      } catch (matchError) {
        console.error('Failed to match jobs:', matchError);
        // Don't show error to user - matching is a bonus feature
      }

    } catch (error) {
      console.error('CV upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze CV';
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewriteResume = async () => {
    if (!cvText || !analysis) {
      toast({
        title: "Cannot Rewrite",
        description: "Please upload and analyze a resume first.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    setRewrittenResume("");

    try {
      const { data: rewriteData, error: rewriteError } = await supabase.functions.invoke('rewrite-resume', {
        body: { 
          cvText: cvText.substring(0, 4000),
          analysis: analysis,
          targetRole: targetRole || undefined
        },
      });

      if (rewriteError) {
        console.error('Rewrite error:', rewriteError);
        throw new Error(rewriteError.message || 'Failed to rewrite resume');
      }

      if (!rewriteData || !rewriteData.rewrittenResume) {
        throw new Error('No rewritten resume received');
      }

      setRewrittenResume(rewriteData.rewrittenResume);
      
      toast({
        title: "Resume Rewritten Successfully!",
        description: "Your improved resume is ready. Review and download below.",
      });

    } catch (error) {
      console.error('Resume rewrite error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rewrite resume';
      
      toast({
        title: "Rewrite Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rewrittenResume);
    toast({
      title: "Copied!",
      description: "Resume copied to clipboard",
    });
  };

  const downloadResume = () => {
    const blob = new Blob([rewrittenResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rewritten_resume_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Resume downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Resume Review & Rewrite
          </h2>
          <p className="text-muted-foreground">
            Upload your resume to get AI-powered analysis and a professionally rewritten version
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4 hover:border-primary transition-colors">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <Label htmlFor="cv-upload" className="cursor-pointer">
              <div className="text-lg font-semibold">Drop your CV here or click to browse</div>
              <div className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, TXT (Max 5MB)</div>
            </Label>
            <Input
              id="cv-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isAnalyzing}
            />
          </div>
          <Button asChild disabled={isAnalyzing}>
            <Label htmlFor="cv-upload" className="cursor-pointer">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Choose File'
              )}
            </Label>
          </Button>
        </div>

        {fileName && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{fileName}</span>
          </div>
        )}
      </Card>

      {analysis && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Analysis Results</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{analysis.score}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                Strengths
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-orange-600 flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5" />
                Areas for Improvement
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-2">
                Suggestions
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>

            {analysis.missing_skills && analysis.missing_skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-2">
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-muted-foreground mb-2">
                Formatting Feedback
              </h4>
              <p className="text-sm">{analysis.formatting_feedback}</p>
            </div>
          </div>

          {/* Rewrite Section */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Resume Rewriter
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Get a professionally rewritten version optimized for ATS and impact
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="target-role" className="text-sm">
                  Target Role (Optional)
                </Label>
                <Input
                  id="target-role"
                  placeholder="e.g., Senior Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={isRewriting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tailor your resume for a specific position
                </p>
              </div>

              <Button 
                onClick={handleRewriteResume}
                disabled={isRewriting || !analysis}
                className="w-full"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Rewrite My Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Rewritten Resume Display */}
      {rewrittenResume && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Rewritten Resume
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadResume}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <Textarea
              value={rewrittenResume}
              onChange={(e) => setRewrittenResume(e.target.value)}
              className="min-h-[500px] font-mono text-sm bg-transparent border-none focus-visible:ring-0"
              placeholder="Your rewritten resume will appear here..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Review the rewritten content carefully and make any personal adjustments before using it. You can edit the text directly above.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};