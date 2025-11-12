import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Shield, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import threaamalLogo from "@/assets/3amal-logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRole = user?.user_metadata?.user_type;

  // Load unread notifications count for seekers
  useEffect(() => {
    if (user && userRole === "seeker") {
      loadUnreadCount();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('notifications-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, userRole]);

  const loadUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };
  
  // Don't show navbar on landing and auth pages
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-border/20 bg-background/60 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={userRole === "seeker" ? "/dashboard/seeker" : "/dashboard/company"} className="flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105">
              <img src={threaamalLogo} alt="3amal" className="h-14" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              {userRole === "seeker" && (
                <>
                  <Link to="/jobs" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pb-1">
                    JOBS
                  </Link>
                  <Link to="/cv-review" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pb-1">
                    CV REVIEW
                  </Link>
                  <Link to="/ai-interview" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pb-1">
                    AI INTERVIEW
                  </Link>
                  <Link to="/notifications" className="relative">
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 transition-all duration-300">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              {userRole === "company" && (
                <>
                  <Link to="/applicants" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pb-1">
                    APPLICANTS
                  </Link>
                  <Link to="/company-profile" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pb-1">
                    COMPANY PROFILE
                  </Link>
                </>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {userRole === "seeker" && (
                <Link to="/profile-settings">
                  <Button variant="ghost" size="sm" className="uppercase text-xs font-semibold tracking-wider hover:bg-primary/10 transition-all duration-300">
                    PROFILE
                  </Button>
                </Link>
              )}
              <Link to="/privacy-settings">
                <Button variant="ghost" size="sm" className="gap-2 uppercase text-xs font-semibold tracking-wider hover:bg-primary/10 transition-all duration-300">
                  <Shield className="h-4 w-4" />
                  PRIVACY
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="uppercase text-xs font-semibold tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                SIGN OUT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden border-b border-border/20 bg-background/70 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={userRole === "seeker" ? "/dashboard/seeker" : "/dashboard/company"} className="flex items-center hover:opacity-80 transition-all duration-300">
              <img src={threaamalLogo} alt="3amal" className="h-12" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-all duration-300 p-2 hover:bg-primary/10 rounded-lg"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isOpen && (
            <div className="border-t border-border/20 py-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {userRole === "seeker" && (
                  <>
                    <Link
                      to="/jobs"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      JOBS
                    </Link>
                    <Link
                      to="/cv-review"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      CV REVIEW
                    </Link>
                    <Link
                      to="/ai-interview"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      AI INTERVIEW
                    </Link>
                    <Link
                      to="/notifications"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      NOTIFICATIONS
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto animate-pulse">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </>
                )}
                {userRole === "company" && (
                  <>
                    <Link
                      to="/applicants"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      APPLICANTS
                    </Link>
                    <Link
                      to="/company-profile"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      COMPANY PROFILE
                    </Link>
                  </>
                )}
                {userRole === "seeker" && (
                  <Link
                    to="/profile-settings"
                    className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    PROFILE
                  </Link>
                )}
                <Link
                  to="/privacy-settings"
                  className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  PRIVACY
                </Link>
                <div className="px-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full uppercase text-xs font-semibold tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    SIGN OUT
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
