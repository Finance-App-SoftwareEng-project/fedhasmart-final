import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailConfirmationProps {
  email?: string;
  onResend?: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ 
  email: initialEmail, 
  onResend 
}) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) throw error;

      setSent(true);
      toast.success('Confirmation email sent! Please check your inbox.');
      onResend?.();
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast.error(error.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          We've sent a confirmation link to your email address. Click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent && (
          <Alert className="border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Confirmation email sent! Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Didn't receive the email? Check your spam folder or request a new one below.</p>
        </div>

        <form onSubmit={handleResendConfirmation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Confirmation Email'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Already confirmed your email?{' '}
            <a href="/auth" className="text-primary hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfirmation;
