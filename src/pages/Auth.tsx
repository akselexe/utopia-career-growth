import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"seeker" | "company">(
    (searchParams.get("type") as "seeker" | "company") || "seeker"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "seeker" || type === "company") {
      setUserType(type);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectPath = user.user_metadata?.user_type === "company"
        ? "/dashboard/company"
        : "/dashboard/seeker";
      navigate(redirectPath);
    }
  }, [user, authLoading, navigate]);

  const validateField = (name: string, value: string) => {
    try {
      if (name === "email") {
        emailSchema.parse(value);
      } else if (name === "password") {
        passwordSchema.parse(value);
      } else if (name === "name") {
        nameSchema.parse(value);
      }
      setErrors(prev => ({ ...prev, [name]: "" }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: error.errors[0].message }));
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, mode: "signin" | "signup") => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;

    // Validate
    const emailValid = validateField("email", email);
    const passwordValid = validateField("password", password);
    const nameValid = mode === "signup" ? validateField("name", fullName) : true;

    if (!emailValid || !passwordValid || !nameValid) {
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (mode === "signup") {
        result = await signUp(email, password, fullName, userType);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        const errorMessage = result.error.message;
        
        // Handle specific error types
        if (errorMessage.includes("Invalid login credentials")) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: mode === "signin" ? "Sign in failed" : "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: mode === "signin" ? "Welcome back!" : "Account created!",
          description: `Redirecting to your ${userType} dashboard...`,
        });
        
        // Navigation will happen automatically via useEffect when user state changes
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">WELCOME</h1>
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
                  name="email"
                  type="email"
                  placeholder=""
                  required
                  onChange={(e) => validateField("email", e.target.value)}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  onChange={(e) => validateField("password", e.target.value)}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder=""
                  required
                  onChange={(e) => validateField("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder=""
                  required
                  onChange={(e) => validateField("email", e.target.value)}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  onChange={(e) => validateField("password", e.target.value)}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
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
