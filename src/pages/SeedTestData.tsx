import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// for test data
const SeedTestData = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-test-candidates', {
        body: {}
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Test Data Created!",
        description: `Successfully created ${data.created} Tunisian test candidates`,
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Seeding Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <Users className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Seed Test Candidates</h1>
            <p className="text-muted-foreground">
              Create 10 Tunisian test candidates for AI matching demo
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">This will create:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 10 seeker accounts with Tunisian names and locations</li>
                <li>• Complete profiles with skills and experience</li>
                <li>• Various tech roles (React, Python, Java, etc.)</li>
                <li>• Locations: Tunis, Sfax, Sousse, and more</li>
              </ul>
            </div>

            <Button
              onClick={handleSeed}
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Test Candidates...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Create Test Candidates
                </>
              )}
            </Button>

            {result && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Successfully created {result.created} candidates
                    </p>
                    {result.users && result.users.length > 0 && (
                      <div className="text-sm text-green-800 dark:text-green-200">
                        <p className="font-medium mb-1">Created users:</p>
                        <ul className="space-y-1">
                          {result.users.map((user: any) => (
                            <li key={user.id}>• {user.name} ({user.email})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Test account credentials: <code className="font-mono bg-muted px-1 rounded">TestPass123!</code>
                <br />
                You can log in as any test user using their email and this password.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SeedTestData;
