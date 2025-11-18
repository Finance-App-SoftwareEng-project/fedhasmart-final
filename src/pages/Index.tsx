import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import Landing from '@/components/Landing';

const Index = () => {
  const { loading } = useUnifiedAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Always show landing page - it handles authenticated vs non-authenticated states internally
  return <Landing />;
};

export default Index;
