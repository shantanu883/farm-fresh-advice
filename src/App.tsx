import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Index from "./pages/Index";
import LocationSelection from "./pages/LocationSelection";
import CropSoilSelection from "./pages/CropSoilSelection";
import Advisory from "./pages/Advisory";
import CropCalendar from "./pages/CropCalendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Guard component to check onboarding status
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";
  
  if (!isOnboardingComplete) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<OnboardingGuard><Index /></OnboardingGuard>} />
            <Route path="/location" element={<OnboardingGuard><LocationSelection /></OnboardingGuard>} />
            <Route path="/crop-selection" element={<OnboardingGuard><CropSoilSelection /></OnboardingGuard>} />
            <Route path="/advisory" element={<OnboardingGuard><Advisory /></OnboardingGuard>} />
            <Route path="/crop-calendar" element={<OnboardingGuard><CropCalendar /></OnboardingGuard>} />
            <Route path="/settings" element={<OnboardingGuard><Settings /></OnboardingGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
