import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAuth = () => {
  const unified = useUnifiedAuth();
  const auth = useAuth();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Unified Auth (Supabase)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {unified.loading ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {unified.user?.id || 'None'}</p>
            <p><strong>Email:</strong> {unified.user?.email || 'None'}</p>
            <p><strong>Phone:</strong> {unified.user?.phoneNumber || 'None'}</p>
            <p><strong>Email Verified:</strong> {unified.user?.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Phone Verified:</strong> {unified.user?.phoneVerified ? 'Yes' : 'No'}</p>
            <p><strong>Display Name:</strong> {unified.user?.displayName || 'None'}</p>
            <p><strong>Session:</strong> {unified.session ? 'Active' : 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legacy Auth Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {auth.user?.id || 'None'}</p>
            <p><strong>Email:</strong> {auth.user?.email || 'None'}</p>
            <p><strong>Session:</strong> {auth.session ? 'Active' : 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw User Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            <strong>Unified User:</strong>
            {JSON.stringify(unified.user, null, 2)}
          </pre>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-4">
            <strong>Legacy User:</strong>
            {JSON.stringify(auth.user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth;
