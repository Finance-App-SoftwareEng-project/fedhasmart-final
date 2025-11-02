import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuth() {
  const unified = useUnifiedAuth();
  const firebase = useFirebaseAuth();
  const supabase = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Unified Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: unified.user ? {
                  id: unified.user.id,
                  email: unified.user.email,
                  phoneNumber: unified.user.phoneNumber,
                  emailVerified: unified.user.emailVerified,
                  phoneVerified: unified.user.phoneVerified,
                } : null,
                loading: unified.loading,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: firebase.user ? {
                  uid: firebase.user.uid,
                  phoneNumber: firebase.user.phoneNumber,
                  email: firebase.user.email,
                } : null,
                loading: firebase.loading,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: supabase.user ? {
                  id: supabase.user.id,
                  email: supabase.user.email,
                } : null,
                loading: supabase.loading,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
