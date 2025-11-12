import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import SeekerDashboard from "./pages/SeekerDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import Applicants from "./pages/Applicants";
import CompanyProfile from "./pages/CompanyProfile";
import MatchedJobs from "./pages/MatchedJobs";
import MatchedCandidates from "./pages/MatchedCandidates";
import CVReview from "./pages/CVReview";
import AIInterviewPage from "./pages/AIInterviewPage";
import ProfileSettings from "./pages/ProfileSettings";
import FootprintScanner from "./pages/FootprintScanner";
import PrivacySettings from "./pages/PrivacySettings";
import SeedTestData from "./pages/SeedTestData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/dashboard/seeker" element={<SeekerDashboard />} />
            <Route path="/dashboard/company" element={<CompanyDashboard />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/matched-jobs" element={<MatchedJobs />} />
            <Route path="/matched-candidates/:jobId" element={<MatchedCandidates />} />
            <Route path="/cv-review" element={<CVReview />} />
            <Route path="/ai-interview" element={<AIInterviewPage />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/footprint-scanner" element={<FootprintScanner />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            <Route path="/seed-test-data" element={<SeedTestData />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
