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
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={userRole === "seeker" ? "/dashboard/seeker" : "/dashboard/company"} className="flex items-center hover:opacity-80 transition-opacity">
              <img src={threaamalLogo} alt="3amal" className="h-12" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {userRole === "seeker" && (
                <>
                  <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Jobs
                  </Link>
                  <Link to="/cv-review" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    CV Review
                  </Link>
                  <Link to="/ai-interview" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    AI Interview
                  </Link>
                  <Link to="/notifications" className="relative">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              {userRole === "company" && (
                <>
                  <Link to="/applicants" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Applicants
                  </Link>
                  <Link to="/company-profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Company Profile
                  </Link>
                </>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {userRole === "seeker" && (
                <Link to="/profile-settings">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
              )}
              <Link to="/privacy-settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden border-b border-border/40 bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to={userRole === "seeker" ? "/dashboard/seeker" : "/dashboard/company"} className="flex items-center hover:opacity-80 transition-opacity">
              <img src={threaamalLogo} alt="3amal" className="h-10" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isOpen && (
            <div className="border-t border-border/40 py-4">
              <div className="flex flex-col gap-3">
                {userRole === "seeker" && (
                  <>
                    <Link
                      to="/jobs"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/cv-review"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      CV Review
                    </Link>
                    <Link
                      to="/ai-interview"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      AI Interview
                    </Link>
                    <Link
                      to="/notifications"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2 flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
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
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Applicants
                    </Link>
                    <Link
                      to="/company-profile"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Company Profile
                    </Link>
                  </>
                )}
                {userRole === "seeker" && (
                  <Link
                    to="/profile-settings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <Link
                  to="/privacy-settings"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Privacy
                </Link>
                <div className="px-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    Sign Out
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
