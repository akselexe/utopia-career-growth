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
        .single();

      if (error && error.code !== "PGRST116") {
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Privacy & Data Settings</h1>
              <p className="text-muted-foreground">Manage your privacy preferences and data</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              We're committed to protecting your privacy. You have full control over how your data is used.
            </AlertDescription>
          </Alert>

          {/* AI Features Consent */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features & Consent</CardTitle>
              <CardDescription>
                Control which AI features can analyze your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="behavioral">Behavioral Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to analyze facial expressions and body language during interviews
                  </p>
                </div>
                <Switch
                  id="behavioral"
                  checked={preferences.behavioral_analysis_consent}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, behavioral_analysis_consent: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="footprint">Footprint Scanning</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow scanning of your GitHub and StackOverflow profiles
                  </p>
                </div>
                <Switch
                  id="footprint"
                  checked={preferences.footprint_scanning_consent}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, footprint_scanning_consent: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="matching">AI Job Matching</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to match you with relevant job opportunities
                  </p>
                </div>
                <Switch
                  id="matching"
                  checked={preferences.ai_job_matching_consent}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, ai_job_matching_consent: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive job recommendations and platform updates
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing_consent}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing_consent: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>
                Choose how long we keep your interview and behavioral data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="retention">Auto-delete data after</Label>
                <Select
                  value={preferences.data_retention_days.toString()}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, data_retention_days: parseInt(value) })
                  }
                >
                  <SelectTrigger id="retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Never (keep indefinitely)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Interview recordings and behavioral analysis data will be automatically deleted after this period
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={exportData} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export All My Data
                </Button>
                <Button onClick={deleteInterviewData} variant="outline" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Interview Data
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                You can export all your data in JSON format or permanently delete specific data types
              </p>
            </CardContent>
          </Card>

          {/* Transparency */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use AI</CardTitle>
              <CardDescription>
                Understanding our AI systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Job Matching (70-100 score)</h4>
                  <p className="text-muted-foreground">
                    • 30% Location compatibility<br />
                    • 40% Skills and experience match<br />
                    • 20% CV quality and completeness<br />
                    • 10% Cultural fit indicators
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-1">Behavioral Analysis</h4>
                  <p className="text-muted-foreground">
                    AI analyzes facial expressions, posture, and engagement during interviews to provide feedback. This is optional and requires your explicit consent.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-1">CV Analysis</h4>
                  <p className="text-muted-foreground">
                    AI reviews your CV for strengths, weaknesses, and improvement suggestions based on industry standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? "Saving..." : "Save Privacy Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
