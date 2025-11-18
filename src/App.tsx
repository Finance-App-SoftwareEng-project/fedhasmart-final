import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

// Components
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import PhoneAuth from '@/pages/PhoneAuth';
import Expenses from '@/pages/Expenses';
import Income from '@/pages/Income';
import Budgets from '@/pages/Budgets';
import Goals from '@/pages/Goals';
import Settings from '@/pages/Settings';
import UserProfile from '@/pages/UserProfile';
import DebugAuth from '@/pages/DebugAuth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUnifiedAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Layout component - let pages handle their own navigation
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

function AppContent() {
  return (
    <AppLayout>
      <Routes>
        {/* Public routes */}
        <Route index path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/phone-auth" element={<PhoneAuth />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } />
        <Route path="/income" element={
          <ProtectedRoute>
            <Income />
          </ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        
        {/* Debug route */}
        <Route path="/debug-auth" element={<DebugAuth />} />
        
        {/* 404 and fallback */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster />
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fedhasmart-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UnifiedAuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </UnifiedAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
