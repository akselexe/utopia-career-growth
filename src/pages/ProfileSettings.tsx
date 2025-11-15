import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CVUpload } from "@/components/CVUpload";
import { Loader2, User, Briefcase, Globe, Github, Twitter, Linkedin, Phone, GraduationCap, Award, FileText, DollarSign, MapPin } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().trim().max(100, "Location too long").optional(),
  phone: z.string().trim().max(20, "Phone number too long").optional(),
  experience_years: z.number().min(0, "Experience must be positive").max(50, "Invalid experience").optional(),
  linkedin_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  github_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  twitter_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  skills: z.string().trim().max(500, "Skills list too long").optional(),
  desired_salary_min: z.number().min(0, "Salary must be positive").optional(),
  desired_salary_max: z.number().min(0, "Salary must be positive").optional(),
  job_preferences: z.string().trim().max(300, "Job preferences too long").optional(),
  education: z.string().trim().max(500, "Education info too long").optional(),
  certifications: z.string().trim().max(500, "Certifications too long").optional(),
});

const ProfileSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    phone: "",
    experience_years: 0,
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
    portfolio_url: "",
    skills: "",
    desired_salary_min: 0,
    desired_salary_max: 0,
    job_preferences: "",
    education: "",
    certifications: "",
  });
  
  const [cvList, setCvList] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?type=seeker');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: seekerProfile } = await supabase
        .from('seeker_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      const { data: cvs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setFormData({
        full_name: profile?.full_name || "",
        bio: seekerProfile?.bio || "",
        location: seekerProfile?.location || "",
        phone: seekerProfile?.phone || "",
        experience_years: seekerProfile?.experience_years || 0,
        linkedin_url: seekerProfile?.linkedin_url || "",
        github_url: seekerProfile?.github_url || "",
        twitter_url: seekerProfile?.twitter_url || "",
        portfolio_url: seekerProfile?.portfolio_url || "",
        skills: seekerProfile?.skills?.join(", ") || "",
        desired_salary_min: seekerProfile?.desired_salary_min || 0,
        desired_salary_max: seekerProfile?.desired_salary_max || 0,
        job_preferences: seekerProfile?.job_preferences || "",
        education: seekerProfile?.education || "",
        certifications: seekerProfile?.certifications || "",
      });
      
      setCvList(cvs || []);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    setSaving(true);

    try {
      
      const validatedData = profileSchema.parse({
        ...formData,
        experience_years: Number(formData.experience_years),
      });

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: validatedData.full_name })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update or insert seeker(if empty) profiles
      const skillsArray = validatedData.skills 
        ? validatedData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const { error: seekerError } = await supabase
        .from('seeker_profiles')
        .upsert({
          user_id: user.id,
          bio: validatedData.bio || null,
          location: validatedData.location || null,
          phone: validatedData.phone || null,
          experience_years: validatedData.experience_years || null,
          linkedin_url: validatedData.linkedin_url || null,
          github_url: validatedData.github_url || null,
          twitter_url: validatedData.twitter_url || null,
          portfolio_url: validatedData.portfolio_url || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
          desired_salary_min: validatedData.desired_salary_min || null,
          desired_salary_max: validatedData.desired_salary_max || null,
          job_preferences: validatedData.job_preferences || null,
          education: validatedData.education || null,
          certifications: validatedData.certifications || null,
        }, { onConflict: 'user_id' });

      if (seekerError) throw seekerError;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      navigate('/dashboard/seeker');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="seeker">
      <div className="min-h-screen bg-background pt-16">
        <main className="container mx-auto px-6 py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">Complete your profile to get better job matches</p>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="cv">CV & Documents</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className={errors.full_name ? "border-destructive" : ""}
                        />
                        {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell employers about yourself, your experience, and what makes you unique..."
                        rows={5}
                        className={errors.bio ? "border-destructive" : ""}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 characters</p>
                      {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio}</p>}
                    </div>

                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className={errors.location ? "border-destructive" : ""}
                      />
                      {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                    </div>
                  </div>
                </Card>

                {/* Social Links */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Social & Portfolio Links</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className={errors.linkedin_url ? "border-destructive" : ""}
                      />
                      {errors.linkedin_url && <p className="text-sm text-destructive mt-1">{errors.linkedin_url}</p>}
                    </div>

                    <div>
                      <Label htmlFor="github_url" className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub
                      </Label>
                      <Input
                        id="github_url"
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="https://github.com/yourusername"
                        className={errors.github_url ? "border-destructive" : ""}
                      />
                      {errors.github_url && <p className="text-sm text-destructive mt-1">{errors.github_url}</p>}
                    </div>

                    <div>
                      <Label htmlFor="twitter_url" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter / X
                      </Label>
                      <Input
                        id="twitter_url"
                        type="url"
                        value={formData.twitter_url}
                        onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                        placeholder="https://twitter.com/yourusername"
                        className={errors.twitter_url ? "border-destructive" : ""}
                      />
                      {errors.twitter_url && <p className="text-sm text-destructive mt-1">{errors.twitter_url}</p>}
                    </div>

                    <div>
                      <Label htmlFor="portfolio_url" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Portfolio Website
                      </Label>
                      <Input
                        id="portfolio_url"
                        type="url"
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className={errors.portfolio_url ? "border-destructive" : ""}
                      />
                      {errors.portfolio_url && <p className="text-sm text-destructive mt-1">{errors.portfolio_url}</p>}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard/seeker')}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Professional Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                        className={errors.experience_years ? "border-destructive" : ""}
                      />
                      {errors.experience_years && <p className="text-sm text-destructive mt-1">{errors.experience_years}</p>}
                    </div>

                    <div>
                      <Label htmlFor="skills">Skills & Technologies</Label>
                      <Textarea
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="React, TypeScript, Node.js, Python, AWS, Docker, etc..."
                        rows={4}
                        className={errors.skills ? "border-destructive" : ""}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
                      {errors.skills && <p className="text-sm text-destructive mt-1">{errors.skills}</p>}
                    </div>

                    <div>
                      <Label htmlFor="education" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Education
                      </Label>
                      <Textarea
                        id="education"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        placeholder="Your degrees, schools, and relevant coursework..."
                        rows={3}
                        className={errors.education ? "border-destructive" : ""}
                      />
                      {errors.education && <p className="text-sm text-destructive mt-1">{errors.education}</p>}
                    </div>

                    <div>
                      <Label htmlFor="certifications" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Certifications & Awards
                      </Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        placeholder="Professional certifications, awards, and achievements..."
                        rows={3}
                        className={errors.certifications ? "border-destructive" : ""}
                      />
                      {errors.certifications && <p className="text-sm text-destructive mt-1">{errors.certifications}</p>}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard/seeker')}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              {/* Job Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Job Preferences & Salary</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="desired_salary_min">Minimum Desired Salary ($)</Label>
                        <Input
                          id="desired_salary_min"
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.desired_salary_min}
                          onChange={(e) => setFormData({ ...formData, desired_salary_min: parseInt(e.target.value) || 0 })}
                          placeholder="50000"
                          className={errors.desired_salary_min ? "border-destructive" : ""}
                        />
                        {errors.desired_salary_min && <p className="text-sm text-destructive mt-1">{errors.desired_salary_min}</p>}
                      </div>

                      <div>
                        <Label htmlFor="desired_salary_max">Maximum Desired Salary ($)</Label>
                        <Input
                          id="desired_salary_max"
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.desired_salary_max}
                          onChange={(e) => setFormData({ ...formData, desired_salary_max: parseInt(e.target.value) || 0 })}
                          placeholder="100000"
                          className={errors.desired_salary_max ? "border-destructive" : ""}
                        />
                        {errors.desired_salary_max && <p className="text-sm text-destructive mt-1">{errors.desired_salary_max}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="job_preferences">Job Preferences</Label>
                      <Textarea
                        id="job_preferences"
                        value={formData.job_preferences}
                        onChange={(e) => setFormData({ ...formData, job_preferences: e.target.value })}
                        placeholder="Preferred job types (Full-time, Part-time, Contract, Remote), work environment, company culture, etc..."
                        rows={5}
                        className={errors.job_preferences ? "border-destructive" : ""}
                      />
                      {errors.job_preferences && <p className="text-sm text-destructive mt-1">{errors.job_preferences}</p>}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard/seeker')}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              {/* CV & Documents Tab */}
              <TabsContent value="cv" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Upload & Manage CV</h2>
                  </div>
                  
                  {user && <CVUpload userId={user.id} />}
                </Card>

                {cvList.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Uploaded CVs</h3>
                    <div className="space-y-3">
                      {cvList.map((cv) => (
                        <div key={cv.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">{cv.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded {new Date(cv.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {cv.ai_score && (
                            <Badge variant={cv.ai_score >= 80 ? "default" : cv.ai_score >= 60 ? "secondary" : "outline"}>
                              Score: {cv.ai_score}/100
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </form>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSettings;
