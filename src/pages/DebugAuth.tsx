import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuth() {
  const unified = useUnifiedAuth();
  const supabase = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unified Auth (Supabase-based)</CardTitle>
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
                  displayName: unified.user.displayName,
                  avatarUrl: unified.user.avatarUrl,
                } : null,
                session: unified.session ? {
                  access_token: unified.session.access_token ? '***' : null,
                  user_id: unified.session.user.id,
                } : null,
                loading: unified.loading,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Auth (Raw)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: supabase.user ? {
                  id: supabase.user.id,
                  email: supabase.user.email,
                  phone: supabase.user.phone,
                  email_confirmed_at: supabase.user.email_confirmed_at,
                  phone_confirmed_at: supabase.user.phone_confirmed_at,
                  user_metadata: supabase.user.user_metadata,
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
