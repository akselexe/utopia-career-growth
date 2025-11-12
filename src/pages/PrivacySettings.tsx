import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Download, Trash2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/Navbar";

interface PrivacyPreferences {
  behavioral_analysis_consent: boolean;
  footprint_scanning_consent: boolean;
  data_retention_days: number;
  ai_job_matching_consent: boolean;
  marketing_consent: boolean;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    behavioral_analysis_consent: false,
    footprint_scanning_consent: false,
    data_retention_days: 90,
    ai_job_matching_consent: true,
    marketing_consent: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadPreferences();
  }, [user, navigate]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("privacy_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setPreferences({
          behavioral_analysis_consent: data.behavioral_analysis_consent,
          footprint_scanning_consent: data.footprint_scanning_consent,
          data_retention_days: data.data_retention_days,
          ai_job_matching_consent: data.ai_job_matching_consent,
          marketing_consent: data.marketing_consent,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("privacy_preferences")
        .upsert({
          user_id: user?.id,
          ...preferences,
        });

      if (error) throw error;

      toast.success("Privacy settings saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      toast.info("Preparing your data export...");
      
      const { data, error } = await supabase.functions.invoke("export-user-data");
      
      if (error) throw error;

      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const deleteInterviewData = async () => {
    if (!confirm("Are you sure you want to delete all your interview data? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("interview_sessions")
        .delete()
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Interview data deleted successfully");
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete interview data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center">Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 md:pt-24">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Privacy & Data Control
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your data, your choice. Full transparency and control over how AI uses your information.
            </p>
          </div>

          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>Your privacy matters.</strong> All AI features are optional and you can opt out anytime.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* AI Features Consent */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AI Features</CardTitle>
                    <CardDescription className="text-base">
                      Choose which AI capabilities can analyze your data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="behavioral" className="text-base font-semibold cursor-pointer">
                          Behavioral Analysis
                        </Label>
                        {preferences.behavioral_analysis_consent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        AI analyzes facial expressions and body language during interviews to provide personalized feedback
                      </p>
                    </div>
                    <Switch
                      id="behavioral"
                      checked={preferences.behavioral_analysis_consent}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, behavioral_analysis_consent: checked })
                      }
                      className="ml-4"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="footprint" className="text-base font-semibold cursor-pointer">
                          Developer Footprint Scanning
                        </Label>
                        {preferences.footprint_scanning_consent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Scan your GitHub and StackOverflow profiles to showcase your technical expertise
                      </p>
                    </div>
                    <Switch
                      id="footprint"
                      checked={preferences.footprint_scanning_consent}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, footprint_scanning_consent: checked })
                      }
                      className="ml-4"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="matching" className="text-base font-semibold cursor-pointer">
                          AI Job Matching
                        </Label>
                        {preferences.ai_job_matching_consent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Get personalized job recommendations based on your skills and preferences
                      </p>
                    </div>
                    <Switch
                      id="matching"
                      checked={preferences.ai_job_matching_consent}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, ai_job_matching_consent: checked })
                      }
                      className="ml-4"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                          Marketing Communications
                        </Label>
                        {preferences.marketing_consent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Receive curated job alerts and important platform updates
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={preferences.marketing_consent}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, marketing_consent: checked })
                      }
                      className="ml-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention & Management */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-primary" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>
                    Auto-delete old interview data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={preferences.data_retention_days.toString()}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, data_retention_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="retention" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Delete after 30 days</SelectItem>
                      <SelectItem value="90">Delete after 90 days</SelectItem>
                      <SelectItem value="180">Delete after 6 months</SelectItem>
                      <SelectItem value="365">Delete after 1 year</SelectItem>
                      <SelectItem value="0">Keep forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Interview recordings and behavioral data will be automatically removed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Export or delete your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={exportData} variant="outline" className="w-full h-12 justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export All My Data
                  </Button>
                  <Button onClick={deleteInterviewData} variant="outline" className="w-full h-12 justify-start text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Interview Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Transparency Section */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">AI Transparency</CardTitle>
                <CardDescription>
                  Understanding how our AI systems work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2 p-4 rounded-lg bg-accent/5 border border-border/50">
                    <h4 className="font-semibold text-base">Job Matching</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Location fit</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills match</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CV quality</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cultural fit</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 rounded-lg bg-accent/5 border border-border/50">
                    <h4 className="font-semibold text-base">Behavioral Analysis</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Analyzes facial expressions, posture, and engagement. Real-time processing only - no permanent video storage.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 rounded-lg bg-accent/5 border border-border/50">
                    <h4 className="font-semibold text-base">CV Analysis</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Reviews your CV structure, content quality, and provides actionable improvement suggestions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={savePreferences} 
                disabled={saving}
                size="lg"
                className="min-w-[200px] h-12 text-base"
              >
                {saving ? "Saving..." : "Save All Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
