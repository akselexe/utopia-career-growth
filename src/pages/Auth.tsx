import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"seeker" | "company">(
    (searchParams.get("type") as "seeker" | "company") || "seeker"
  );

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "seeker" || type === "company") {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, mode: "signin" | "signup") => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate auth - will be replaced with real Lovable Cloud auth
    setTimeout(() => {
      toast({
        title: mode === "signin" ? "Welcome back!" : "Account created!",
        description: `Redirecting to your ${userType} dashboard...`,
      });
      
      navigate(userType === "seeker" ? "/dashboard/seeker" : "/dashboard/company");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* User Type Selector */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Welcome to UtopiaHire</h1>
          <div className="flex gap-4">
            <Button
              variant={userType === "seeker" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => setUserType("seeker")}
            >
              <User className="w-4 h-4" />
              Job Seeker
            </Button>
            <Button
              variant={userType === "company" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => setUserType("company")}
            >
              <Briefcase className="w-4 h-4" />
              Company
            </Button>
          </div>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, "signin")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          {userType === "seeker" ? (
            <p>Start your journey to find the perfect job opportunity</p>
          ) : (
            <p>Connect with top talent for your organization</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
