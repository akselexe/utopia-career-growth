import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  salaryMin: z.string().regex(/^\d+$/, "Must be a valid number"),
  salaryMax: z.string().regex(/^\d+$/, "Must be a valid number"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  jobType: z.string().min(1, "Job type is required"),
});
// A dialog component that allows a company to post a new job, with optional AI-generated job details.
interface PostJobDialogProps {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId?: string;
}

export const PostJobDialog = ({ children, isOpen, onOpenChange, onSuccess, userId }: PostJobDialogProps) => {
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    jobType: "Full-time",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() || aiPrompt.trim().length < 20) {
      toast({
        title: "Invalid prompt",
        description: "Please provide at least 20 characters describing the job",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-job-description', {
        body: { description: aiPrompt }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const jobData = data.jobData;
      setFormData({
        title: jobData.title || "",
        location: jobData.location || "",
        salaryMin: jobData.salaryMin ? String(jobData.salaryMin) : "",
        salaryMax: jobData.salaryMax ? String(jobData.salaryMax) : "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        jobType: formData.jobType,
      });

      toast({
        title: "Success!",
        description: "Job details generated. Review and adjust as needed.",
      });
    } catch (error) {
      console.error('Error generating job:', error);
      toast({
        title: "Error",
        description: "Failed to generate job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostJob = async () => {
    try {
      const result = jobSchema.safeParse(formData);
      
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      setIsPosting(true);

      const { error } = await supabase.from('jobs').insert({
        company_id: userId,
        title: formData.title,
        location: formData.location,
        salary_min: parseInt(formData.salaryMin),
        salary_max: parseInt(formData.salaryMax),
        description: formData.description,
        requirements: formData.requirements,
        job_type: formData.jobType,
        status: 'active',
      });

      if (error) throw error;

      setFormData({
        title: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        description: "",
        requirements: "",
        jobType: "Full-time",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* AI Generation Section */}
          <div className="space-y-3 p-4 rounded-lg border bg-accent/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Generate with AI</Label>
            </div>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the job you want to post. For example: 'Looking for a senior React developer with 5+ years experience for our startup in San Francisco. Remote work possible. Salary range 120k-160k. Must know TypeScript, Next.js, and have experience with cloud platforms.'"
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full gap-2"
              variant="secondary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Job Details
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or fill manually</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Tunis, Tunisia"
            />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Min Salary (USD) *</Label>
              <Input
                id="salaryMin"
                value={formData.salaryMin}
                onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                placeholder="50000"
              />
              {errors.salaryMin && <p className="text-sm text-destructive mt-1">{errors.salaryMin}</p>}
            </div>
            <div>
              <Label htmlFor="salaryMax">Max Salary (USD) *</Label>
              <Input
                id="salaryMax"
                value={formData.salaryMax}
                onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                placeholder="80000"
              />
              {errors.salaryMax && <p className="text-sm text-destructive mt-1">{errors.salaryMax}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="jobType">Job Type *</Label>
            <Input
              id="jobType"
              value={formData.jobType}
              onChange={(e) => handleInputChange("jobType", e.target.value)}
              placeholder="Full-time, Part-time, Contract"
            />
            {errors.jobType && <p className="text-sm text-destructive mt-1">{errors.jobType}</p>}
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="List the required skills, experience, and qualifications..."
              rows={4}
            />
            {errors.requirements && <p className="text-sm text-destructive mt-1">{errors.requirements}</p>}
          </div>

          <Button
            onClick={handlePostJob}
            disabled={isPosting}
            className="w-full"
            size="lg"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
