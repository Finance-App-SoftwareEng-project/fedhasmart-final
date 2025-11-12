import React, { useState, useEffect } from 'react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const PhoneAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { setupRecaptcha, signInWithPhone, verifyOTP, user } = useFirebaseAuth();

  useEffect(() => {
    try {
      // Setup reCAPTCHA when component mounts
      const verifier = setupRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);

      return () => {
        // Cleanup reCAPTCHA when component unmounts
        if (verifier) {
          verifier.clear();
        }
      };
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      setError('Failed to initialize authentication. Please refresh the page.');
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    // Validate phone number format (should start with + and country code)
    if (!phoneNumber.startsWith('+')) {
      setError('Phone number must include country code (e.g., +1234567890)');
      return;
    }

    if (!recaptchaVerifier) {
      setError('reCAPTCHA not initialized');
      return;
    }

    setLoading(true);

    try {
      const confirmation = await signInWithPhone(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setSuccess('OTP sent successfully! Check your phone.');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const newVerifier = setupRecaptcha('recaptcha-container');
        setRecaptchaVerifier(newVerifier);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (!confirmationResult) {
      setError('Please request OTP first');
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(confirmationResult, otp);
      setSuccess('Phone number verified successfully!');
      setOtp('');
      setPhoneNumber('');
      setConfirmationResult(null);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authenticated</CardTitle>
          <CardDescription>You are logged in with phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">Phone: {user.phoneNumber}</p>
          <p className="text-sm text-muted-foreground">User ID: {user.uid}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Authentication</CardTitle>
        <CardDescription>
          {!confirmationResult
            ? 'Enter your phone number to receive an OTP'
            : 'Enter the OTP sent to your phone'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="recaptcha-container"></div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!confirmationResult ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US, +91 for India)
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmationResult(null);
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
