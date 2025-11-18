import React from 'react';
import Landing from '@/components/Landing';

const Index = () => {
  // Always show landing page immediately without waiting for auth loading
  // The Landing component handles both authenticated and non-authenticated states
  return <Landing />;
};

export default Index;
