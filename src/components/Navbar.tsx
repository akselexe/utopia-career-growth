import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Briefcase } from "lucide-react";
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
    <>
      {/* Desktop Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="bg-foreground/95 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-background hover:text-primary transition-colors">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-foreground" />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="text-sm text-background/80 hover:text-background transition-colors font-medium">
              Jobs
            </Link>
            <Link to="/job-matcher" className="text-sm text-background/80 hover:text-background transition-colors font-medium">
              Matcher
            </Link>
            {userRole === "seeker" && (
              <>
                <Link to="/cv-review" className="text-sm text-background/80 hover:text-background transition-colors font-medium">
                  CV Review
                </Link>
                <Link to="/ai-interview" className="text-sm text-background/80 hover:text-background transition-colors font-medium">
                  Interview
                </Link>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile-settings" className="text-sm text-background/80 hover:text-background transition-colors font-medium">
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-1.5 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors"
              >
                {user?.email || "Sign In"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="bg-foreground/95 backdrop-blur-md rounded-full shadow-2xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-background">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-foreground" />
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-background hover:text-background/80 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-foreground/95 backdrop-blur-md rounded-3xl shadow-2xl p-4">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to="/jobs"
                    className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Jobs
                  </Link>
                  <Link
                    to="/job-matcher"
                    className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Matcher
                  </Link>
                  {userRole === "seeker" && (
                    <>
                      <Link
                        to="/dashboard/seeker"
                        className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/cv-review"
                        className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        CV Review
                      </Link>
                      <Link
                        to="/ai-interview"
                        className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Interview
                      </Link>
                    </>
                  )}
                  {userRole === "company" && (
                    <Link
                      to="/dashboard/company"
                      className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile-settings"
                    className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="mt-2 px-4 py-2 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className="text-sm text-background/80 hover:text-background transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Jobs
                  </Link>
                  <button
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    className="mt-2 px-4 py-2 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
