import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from 'sonner';

export const PhoneAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useUnifiedAuth();

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

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setOtpSent(true);
      setSuccess('OTP sent successfully! Check your phone.');
      toast.success('OTP sent to your phone');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      
      // Handle specific phone provider errors
      if (err.message?.includes('Unsupported phone provider') || 
          err.message?.includes('unsupported phone provider')) {
        setError('Phone authentication is not available for this number. This could be due to carrier restrictions or regional limitations. Please try using email authentication instead.');
        toast.error('Phone provider not supported. Try email authentication.');
      } else if (err.message?.includes('Invalid phone number')) {
        setError('Please enter a valid phone number with country code (e.g., +1234567890)');
        toast.error('Invalid phone number format');
      } else if (err.message?.includes('SMS not supported')) {
        setError('SMS is not supported for this phone number. Please try email authentication.');
        toast.error('SMS not supported for this number');
      } else {
        setError(err.message || 'Failed to send OTP. Please try email authentication if the issue persists.');
        toast.error(err.message || 'Failed to send OTP');
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

    if (!phoneNumber) {
      setError('Please request OTP first');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      setSuccess('Phone number verified successfully!');
      setOtp('');
      setPhoneNumber('');
      setOtpSent(false);
      toast.success('Phone number verified successfully!');
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      toast.error(err.message || 'Invalid OTP');
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
          <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Authentication</CardTitle>
        <CardDescription>
          {!otpSent
            ? 'Enter your phone number to receive an OTP'
            : 'Enter the OTP sent to your phone'}
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        {!otpSent ? (
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
                Include country code (e.g., +1 for US, +44 for UK). Note: Phone authentication may not be available for all carriers.
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
                  setOtpSent(false);
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
        
        <div className="mt-6 pt-4 border-t">
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Having trouble with phone verification? Phone authentication may not be available for all carriers or regions.
            </p>
            <Link to="/auth" className="inline-flex items-center text-sm text-primary hover:underline">
              Use Email Authentication Instead
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
