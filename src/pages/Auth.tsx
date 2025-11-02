import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Wallet, Phone, CircleDollarSign } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            phone,
          },
        },
      });

      if (error) throw error;

      toast.success('Account created! You can now log in.');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-md opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-3 sm:p-4 rounded-2xl shadow-xl">
                <CircleDollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            FedhaSmart
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-medium tracking-wide">
            Smart Finance Management
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 touch-target">
              <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="text-xs sm:text-sm text-primary hover:underline w-full text-center touch-target"
                >
                  Forgot password?
                </button>
                
                <div className="relative my-3 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Link to="/phone-auth">
                  <Button type="button" variant="outline" className="w-full touch-target" disabled={loading}>
                    <Phone className="mr-2 h-4 w-4" />
                    Sign in with Phone
                  </Button>
                </Link>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full touch-target" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
                
                <div className="relative my-3 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Link to="/phone-auth">
                  <Button type="button" variant="outline" className="w-full touch-target" disabled={loading}>
                    <Phone className="mr-2 h-4 w-4" />
                    Sign up with Phone
                  </Button>
                </Link>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
