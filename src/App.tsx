/**
 * Main Application Component
 * 
 * This component sets up the application's provider hierarchy and routing structure.
 * It wraps the entire app with necessary context providers for:
 * - React Query (data fetching and caching)
 * - Theme management (dark/light mode)
 * - Authentication (Supabase auth)
 * - Notifications (real-time notifications)
 * - Toast notifications (user feedback)
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PhoneAuthPage from "./pages/PhoneAuth";
import UserProfile from "./pages/UserProfile";
import DebugAuth from "./pages/DebugAuth";
import { MobileBottomNav } from "./components/MobileBottomNav";

// Initialize React Query client for data fetching and caching
// This enables efficient data management across the application
const queryClient = new QueryClient();

/**
 * AppContent Component
 * 
 * Handles routing and conditional rendering of mobile navigation.
 * The mobile bottom nav is hidden on authentication and landing pages
 * to provide a cleaner user experience.
 */
const AppContent = () => {
  const location = useLocation();
  // Hide mobile navigation on auth pages and landing page
  const showMobileNav = !['/auth', '/phone-auth', '/'].includes(location.pathname);

  return (
    <>
      {/* Application routes - defines all available pages */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/phone-auth" element={<PhoneAuthPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/debug" element={<DebugAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Mobile bottom navigation - only shown on main app pages */}
      {showMobileNav && <MobileBottomNav />}
    </>
  );
};

/**
 * Main App Component
 * 
 * Sets up the provider hierarchy for the entire application.
 * Provider order matters - outer providers are available to inner ones.
 * 
 * Provider hierarchy (outer to inner):
 * 1. QueryClientProvider - React Query for data fetching
 * 2. ThemeProvider - Theme management (dark/light mode)
 * 3. TooltipProvider - Tooltip functionality
 * 4. Toaster components - Toast notifications (two different toast systems)
 * 5. AuthProvider - Supabase authentication context
 * 6. NotificationProvider - Real-time notification system
 * 7. AppContent - Main routing and page content
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        {/* Toast notification systems - provides user feedback */}
        <Toaster />
        <Sonner />
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
