import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2, UserX, Loader2, Pencil, X } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      loadProfile();
    }
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
    }
  };

  const handlePhoneUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phone || null })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Phone number updated successfully');
      setIsEditingPhone(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPhone(false);
    loadProfile();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 mobile-content-padding">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-base mt-1">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {!isEditingPhone ? (
                  <div className="flex items-center justify-between">
                    <p className="text-base">{phone || 'Not set'}</p>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingPhone(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                      />
                      <Button onClick={handlePhoneUpdate} disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit} disabled={loading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Profile information</li>
                        <li>Income records</li>
                        <li>Expense records</li>
                        <li>Budgets</li>
                        <li>Financial goals</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
