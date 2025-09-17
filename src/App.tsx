import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PlacementDashboard from "./pages/PlacementDashboard";
import NotFound from "./pages/NotFound";
import StudentRanking from "./components/StudentRanking";
import { SocialIcons } from "@/components/SocialIcons";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/placement-dashboard" element={<PlacementDashboard />} />
            <Route path="/student-ranking" element={<StudentRanking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground border-t mt-8">
            <div className="flex flex-col items-center gap-2">
              <SocialIcons className="mb-2" />
              <p>© {new Date().getFullYear()} Student Hub. All rights reserved.</p>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;