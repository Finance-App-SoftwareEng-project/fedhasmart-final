import { PhoneAuth } from '@/components/PhoneAuth';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const PhoneAuthPage = () => {
  const { user, signOut } = useFirebaseAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link to="/auth" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in options
        </Link>
        
        <PhoneAuth />
        
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Authenticated!</CardTitle>
              <CardDescription>Phone: {user.phoneNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
              <Button onClick={signOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PhoneAuthPage;
