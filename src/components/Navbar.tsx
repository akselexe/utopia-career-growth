import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const userRole = user?.user_metadata?.user_type;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            UtopiaHire
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Jobs
                </Link>
                <Link to="/job-matcher" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job Matcher
                </Link>
                {userRole === "seeker" && (
                  <>
                    <Link to="/dashboard/seeker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/cv-review" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      CV Review
                    </Link>
                    <Link to="/ai-interview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      AI Interview
                    </Link>
                  </>
                )}
                {userRole === "company" && (
                  <Link to="/dashboard/company" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile-settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Settings
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Jobs
                </Link>
                <Button onClick={() => navigate("/auth")} variant="outline" size="sm">
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    to="/jobs"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Jobs
                  </Link>
                  <Link
                    to="/job-matcher"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Job Matcher
                  </Link>
                  {userRole === "seeker" && (
                    <>
                      <Link
                        to="/dashboard/seeker"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/cv-review"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        CV Review
                      </Link>
                      <Link
                        to="/ai-interview"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        AI Interview
                      </Link>
                    </>
                  )}
                  {userRole === "company" && (
                    <Link
                      to="/dashboard/company"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile-settings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Jobs
                  </Link>
                  <Button onClick={() => { navigate("/auth"); setIsOpen(false); }} variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
