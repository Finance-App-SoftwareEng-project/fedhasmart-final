import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Mail, CheckCircle2, XCircle, Camera, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';

export default function UserProfile() {
  const { user, loading } = useUnifiedAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.supabaseUser?.id) {
      // For Firebase-only users, use basic info
      setDisplayName(user?.displayName || '');
      setAvatarUrl(user?.avatarUrl || '');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.supabaseUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData(data);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user?.supabaseUser?.id) {
      toast.error('Profile picture upload requires a full account');
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.supabaseUser.id}/${Math.random()}.${fileExt}`;

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.supabaseUser.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated!');
      await loadProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.supabaseUser?.id) {
      toast.error('Profile updates require a full account. Please sign up with email to save changes.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
        })
        .eq('id', user.supabaseUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
      await loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profileData?.display_name || user?.displayName || '');
    setBio(profileData?.bio || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Alert>
            <AlertDescription>Please sign in to view your profile.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        {/* Profile Picture Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>Upload and manage your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarUrl} alt={displayName || 'User'} />
              <AvatarFallback className="text-3xl">
                {getInitials(displayName || user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={uploading || !user?.supabaseUser}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {uploading ? 'Uploading...' : 'Change Picture'}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            {!user?.supabaseUser && (
              <p className="text-xs text-muted-foreground text-center">
                Profile picture upload requires a full account. Complete email signup to enable.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>View your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{user?.email || 'Not set'}</span>
                  {user?.emailVerified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Not verified
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{user?.phoneNumber || 'Not set'}</span>
                  {user?.phoneVerified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Not verified
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date Joined:</span>
                </div>
                <span className="text-muted-foreground">
                  {profileData?.created_at 
                    ? formatDate(profileData.created_at)
                    : user?.supabaseUser?.created_at
                    ? formatDate(user.supabaseUser.created_at)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Brief description for your profile
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {!user?.supabaseUser && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <strong>⚠️ Limited Account:</strong> You're using phone authentication only. 
                  To save profile changes, please complete signup with email. 
                  You can still preview changes but they won't be saved.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Alert className="mt-6">
          <AlertDescription>
            <strong>Note:</strong> To update your phone number or other security settings, 
            please visit the <a href="/settings" className="underline text-primary">Settings</a> page.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
