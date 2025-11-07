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
import jsPDF from 'jspdf';
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

interface ResumeData {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    dates: string;
    achievements: string[];
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    achievements?: string[];
    link?: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location?: string;
    dates: string;
    details?: string;
  }>;
  skills: {
    technical?: string[];
    tools?: string[];
    languages?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
}

const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, contemporary design with focus on achievements and metrics",
    style: "Use a modern, clean format with clear sections. Emphasize quantifiable achievements, use strong action verbs, and maintain a professional yet contemporary tone. Include metrics and numbers where possible."
  },
  {
    id: "executive",
    name: "Executive Leadership",
    description: "Strategic focus for senior-level positions with leadership emphasis",
    style: "Use an executive-level format highlighting strategic impact, leadership experience, and business outcomes. Emphasize C-suite language, board-level achievements, and transformational results. Focus on ROI and organizational impact."
  },
  {
    id: "technical",
    name: "Technical/Engineering",
    description: "Optimized for developers, engineers, and technical roles",
    style: "Use a technical format with clear skill categorization, project highlights, and technical stack details. Include GitHub contributions, tech stack proficiency, and technical problem-solving achievements. Use industry-standard terminology."
  },
  {
    id: "creative",
    name: "Creative Professional",
    description: "Engaging format for design, marketing, and creative industries",
    style: "Use a creative yet professional format that showcases portfolio highlights and creative achievements. Balance creativity with readability. Emphasize projects, campaigns, and creative impact while maintaining professional structure."
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Maximum compatibility with Applicant Tracking Systems",
    style: "Use a simple, ATS-friendly format with standard section headers (Work Experience, Education, Skills). Avoid tables, graphics, or complex formatting. Use keywords from job descriptions, clear dates, and straightforward bullet points."
  },
  {
    id: "academic",
    name: "Academic/Research",
    description: "Detailed format for research, academia, and scientific positions",
    style: "Use an academic CV format with detailed sections for publications, research, grants, and teaching. Include methodologies, research impact, citations, and academic achievements. Maintain formal academic tone."
  }
];

export const CVUpload = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [cvText, setCvText] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");

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
    setResumeData(null);

    try {
      const template = RESUME_TEMPLATES.find(t => t.id === selectedTemplate);
      
      const { data: rewriteData, error: rewriteError } = await supabase.functions.invoke('rewrite-resume', {
        body: { 
          cvText: cvText.substring(0, 4000),
          analysis: analysis,
          targetRole: targetRole || undefined,
          templateStyle: template?.style
        },
      });

      if (rewriteError) {
        console.error('Rewrite error:', rewriteError);
        throw new Error(rewriteError.message || 'Failed to rewrite resume');
      }

      if (!rewriteData || !rewriteData.resumeData) {
        throw new Error('No resume data received');
      }

      setResumeData(rewriteData.resumeData);
      
      toast({
        title: "Resume Rewritten Successfully!",
        description: "Your improved resume is ready. Download as PDF below.",
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
    if (!resumeData) return;
    const text = JSON.stringify(resumeData, null, 2);
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Resume data copied to clipboard",
    });
  };

  const downloadResume = () => {
    if (!resumeData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (y + requiredSpace > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // HEADER - Name and Contact
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 78, 120); // Professional dark blue
    doc.text(resumeData.name, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Contact Info
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const contactParts = [];
    if (resumeData.contact.email) contactParts.push(resumeData.contact.email);
    if (resumeData.contact.phone) contactParts.push(resumeData.contact.phone);
    if (resumeData.contact.location) contactParts.push(resumeData.contact.location);
    const contactLine1 = contactParts.join('  |  ');
    doc.text(contactLine1, pageWidth / 2, y, { align: 'center' });
    y += 4;
    
    const contactParts2 = [];
    if (resumeData.contact.linkedin) contactParts2.push(resumeData.contact.linkedin);
    if (resumeData.contact.website) contactParts2.push(resumeData.contact.website);
    if (contactParts2.length > 0) {
      doc.text(contactParts2.join('  |  '), pageWidth / 2, y, { align: 'center' });
      y += 4;
    }

    // Divider line
    doc.setDrawColor(31, 78, 120);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // PROFESSIONAL SUMMARY
    if (resumeData.summary) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("PROFESSIONAL SUMMARY", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const summaryLines = doc.splitTextToSize(resumeData.summary, pageWidth - (margin * 2));
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 4.5 + 6;
    }

    // EXPERIENCE
    if (resumeData.experience && resumeData.experience.length > 0) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("PROFESSIONAL EXPERIENCE", margin, y);
      y += 6;

      resumeData.experience.forEach((job) => {
        checkNewPage(20);
        
        // Job title and dates
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(job.title, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(job.dates, pageWidth - margin, y, { align: 'right' });
        y += 5;

        // Company and location
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        doc.text(job.company, margin, y);
        if (job.location) {
          doc.text(job.location, pageWidth - margin, y, { align: 'right' });
        }
        y += 5;

        // Achievements
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        job.achievements.forEach((achievement) => {
          checkNewPage(10);
          const achLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - margin - 20);
          doc.text(achLines, margin + 5, y);
          y += achLines.length * 4 + 1;
        });
        y += 3;
      });
      y += 2;
    }

    // EDUCATION
    if (resumeData.education && resumeData.education.length > 0) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("EDUCATION", margin, y);
      y += 6;

      resumeData.education.forEach((edu) => {
        checkNewPage(15);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(edu.degree, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
        y += 5;

        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        doc.text(edu.school, margin, y);
        if (edu.location) {
          doc.text(edu.location, pageWidth - margin, y, { align: 'right' });
        }
        y += 4;

        if (edu.details) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 50, 50);
          const detailLines = doc.splitTextToSize(edu.details, pageWidth - (margin * 2));
          doc.text(detailLines, margin, y);
          y += detailLines.length * 4;
        }
        y += 3;
      });
      y += 2;
    }

    // PROJECTS
    if (resumeData.projects && resumeData.projects.length > 0) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("PROJECTS", margin, y);
      y += 6;

      resumeData.projects.forEach((project) => {
        checkNewPage(20);
        
        // Project name and link
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(project.name, margin, y);
        if (project.link) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(41, 128, 185);
          doc.text(project.link, pageWidth - margin, y, { align: 'right' });
        }
        y += 5;

        // Description
        if (project.description) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(project.description, pageWidth - (margin * 2));
          doc.text(descLines, margin, y);
          y += descLines.length * 4 + 2;
        }

        // Technologies
        if (project.technologies && project.technologies.length > 0) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const techText = "Technologies: " + project.technologies.join(', ');
          const techLines = doc.splitTextToSize(techText, pageWidth - (margin * 2));
          doc.text(techLines, margin, y);
          y += techLines.length * 3.5 + 2;
        }

        // Achievements
        if (project.achievements && project.achievements.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 50, 50);
          project.achievements.forEach((achievement) => {
            checkNewPage(10);
            const achLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - margin - 20);
            doc.text(achLines, margin + 5, y);
            y += achLines.length * 4 + 1;
          });
        }
        y += 3;
      });
      y += 2;
    }

    // CERTIFICATIONS
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("CERTIFICATIONS", margin, y);
      y += 6;

      resumeData.certifications.forEach((cert) => {
        checkNewPage(10);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(cert.name, margin, y);
        
        if (cert.date) {
          doc.setFont("helvetica", "normal");
          doc.text(cert.date, pageWidth - margin, y, { align: 'right' });
        }
        y += 5;

        if (cert.issuer) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(80, 80, 80);
          doc.text(cert.issuer, margin, y);
          y += 4;
        }
        y += 2;
      });
      y += 2;
    }

    // SKILLS
    if (resumeData.skills) {
      checkNewPage(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 78, 120);
      doc.text("SKILLS", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);

      if (resumeData.skills.technical && resumeData.skills.technical.length > 0) {
        checkNewPage(10);
        doc.setFont("helvetica", "bold");
        doc.text("Technical:", margin, y);
        doc.setFont("helvetica", "normal");
        const techText = resumeData.skills.technical.join(', ');
        const techLines = doc.splitTextToSize(techText, pageWidth - margin - 30);
        doc.text(techLines, margin + 25, y);
        y += techLines.length * 4 + 2;
      }

      if (resumeData.skills.tools && resumeData.skills.tools.length > 0) {
        checkNewPage(10);
        doc.setFont("helvetica", "bold");
        doc.text("Tools:", margin, y);
        doc.setFont("helvetica", "normal");
        const toolsText = resumeData.skills.tools.join(', ');
        const toolsLines = doc.splitTextToSize(toolsText, pageWidth - margin - 30);
        doc.text(toolsLines, margin + 25, y);
        y += toolsLines.length * 4 + 2;
      }

      if (resumeData.skills.languages && resumeData.skills.languages.length > 0) {
        checkNewPage(10);
        doc.setFont("helvetica", "bold");
        doc.text("Languages:", margin, y);
        doc.setFont("helvetica", "normal");
        const langText = resumeData.skills.languages.join(', ');
        const langLines = doc.splitTextToSize(langText, pageWidth - margin - 30);
        doc.text(langLines, margin + 25, y);
        y += langLines.length * 4;
      }
    }

    doc.save(`professional_resume_${Date.now()}.pdf`);
    
    toast({
      title: "Downloaded!",
      description: "Professional resume PDF downloaded successfully",
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
                  Choose a template and get a professionally rewritten version
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Choose Resume Template
                </Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {RESUME_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      disabled={isRewriting}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-background'
                      } ${isRewriting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          selectedTemplate === template.id ? 'bg-primary' : 'bg-muted-foreground'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role Input */}
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
                    Rewriting with {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Rewrite with {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name} Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Rewritten Resume Display */}
      {resumeData && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Professional Resume
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Data
              </Button>
              <Button size="sm" onClick={downloadResume}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-6">
            {/* Preview of the resume data */}
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">{resumeData.name}</h2>
                <div className="text-sm text-muted-foreground mt-2 space-x-2">
                  {resumeData.contact.email && <span>{resumeData.contact.email}</span>}
                  {resumeData.contact.phone && <span>• {resumeData.contact.phone}</span>}
                  {resumeData.contact.location && <span>• {resumeData.contact.location}</span>}
                </div>
              </div>

              {resumeData.summary && (
                <div>
                  <h3 className="font-bold text-primary mb-2">PROFESSIONAL SUMMARY</h3>
                  <p className="text-sm">{resumeData.summary}</p>
                </div>
              )}

              {resumeData.experience && resumeData.experience.length > 0 && (
                <div>
                  <h3 className="font-bold text-primary mb-2">EXPERIENCE</h3>
                  {resumeData.experience.slice(0, 2).map((job, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between">
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.dates}</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">{job.company}</p>
                      <ul className="text-xs mt-1 space-y-1">
                        {job.achievements.slice(0, 2).map((ach, i) => (
                          <li key={i}>• {ach}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {resumeData.experience.length > 2 && (
                    <p className="text-xs text-muted-foreground italic">
                      + {resumeData.experience.length - 2} more positions...
                    </p>
                  )}
                </div>
              )}

              {resumeData.skills && (
                <div>
                  <h3 className="font-bold text-primary mb-2">SKILLS</h3>
                  <div className="text-xs space-y-1">
                    {resumeData.skills.technical && (
                      <p><span className="font-semibold">Technical:</span> {resumeData.skills.technical.join(', ')}</p>
                    )}
                    {resumeData.skills.tools && (
                      <p><span className="font-semibold">Tools:</span> {resumeData.skills.tools.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Ready to download!</strong> Click "Download PDF" above to get your professionally formatted resume.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};