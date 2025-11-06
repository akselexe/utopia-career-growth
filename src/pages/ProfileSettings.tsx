import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, User, Briefcase, Globe, Github, Twitter, Linkedin } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().trim().max(100, "Location too long").optional(),
  experience_years: z.number().min(0, "Experience must be positive").max(50, "Invalid experience").optional(),
  linkedin_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  github_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  twitter_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  skills: z.string().trim().max(500, "Skills list too long").optional(),
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
    experience_years: 0,
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
    portfolio_url: "",
    skills: "",
  });

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

      setFormData({
        full_name: profile?.full_name || "",
        bio: seekerProfile?.bio || "",
        location: seekerProfile?.location || "",
        experience_years: seekerProfile?.experience_years || 0,
        linkedin_url: seekerProfile?.linkedin_url || "",
        github_url: seekerProfile?.github_url || "",
        twitter_url: seekerProfile?.twitter_url || "",
        portfolio_url: seekerProfile?.portfolio_url || "",
        skills: seekerProfile?.skills?.join(", ") || "",
      });
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
      // Validate form data
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

      // Update or insert seeker_profiles
      const skillsArray = validatedData.skills 
        ? validatedData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const { error: seekerError } = await supabase
        .from('seeker_profiles')
        .upsert({
          user_id: user.id,
          bio: validatedData.bio || null,
          location: validatedData.location || null,
          experience_years: validatedData.experience_years || null,
          linkedin_url: validatedData.linkedin_url || null,
          github_url: validatedData.github_url || null,
          twitter_url: validatedData.twitter_url || null,
          portfolio_url: validatedData.portfolio_url || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
        });

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
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6">
            <div className="flex h-16 items-center justify-between">
              <Link to="/dashboard/seeker" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your personal information and social links</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              
              <div className="space-y-4">
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
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className={errors.bio ? "border-destructive" : ""}
                  />
                  {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio}</p>}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
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

            {/* Professional Information */}
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
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, ..."
                    rows={3}
                    className={errors.skills ? "border-destructive" : ""}
                  />
                  {errors.skills && <p className="text-sm text-destructive mt-1">{errors.skills}</p>}
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Social Links</h2>
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
                    placeholder="https://linkedin.com/in/..."
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
                    placeholder="https://github.com/..."
                    className={errors.github_url ? "border-destructive" : ""}
                  />
                  {errors.github_url && <p className="text-sm text-destructive mt-1">{errors.github_url}</p>}
                </div>

                <div>
                  <Label htmlFor="twitter_url" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/..."
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

            {/* Actions */}
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
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSettings;
