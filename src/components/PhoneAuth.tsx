import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast.success('Phone verified successfully!');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Authentication</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to receive an OTP'
            : 'Enter the OTP sent to your phone'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={sendOTP} 
              disabled={loading || !phoneNumber}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              OTP sent to {phoneNumber}
            </div>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button 
                onClick={verifyOTP} 
                disabled={loading || otp.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
