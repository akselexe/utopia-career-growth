import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, FileText, CheckCircle2, XCircle } from "lucide-react";
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
        description: `Your CV scored ${aiData.analysis.score}/100`,
      });

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

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
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
        </Card>
      )}
    </div>
  );
};