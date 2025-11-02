import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User as FirebaseUser } from 'firebase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from './FirebaseAuthContext';
import { toast } from 'sonner';

interface UnifiedUser {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  supabaseUser?: SupabaseUser | null;
  firebaseUser?: FirebaseUser | null;
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncFirebaseToSupabase: (firebaseUser: FirebaseUser) => Promise<void>;
  updateProfile: (data: { phoneNumber?: string; displayName?: string }) => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  syncFirebaseToSupabase: async () => {},
  updateProfile: async () => {},
});

export const useUnifiedAuth = () => useContext(UnifiedAuthContext);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: firebaseUser, signOut: firebaseSignOut } = useFirebaseAuth();

  // Sync Firebase user to Supabase
  const syncFirebaseToSupabase = async (fbUser: FirebaseUser) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', fbUser.uid)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (!profile) {
        // Check if user already has a profile by phone
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', fbUser.phoneNumber)
          .maybeSingle();

        if (existingProfile) {
          // Link existing profile with Firebase UID
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              firebase_uid: fbUser.uid,
              phone_verified: true,
            } as any)
            .eq('id', existingProfile.id);

          if (updateError) {
            console.error('Error linking profile:', updateError);
          } else {
            toast.success('Account linked successfully!');
          }
        } else {
          // Create new profile - note: this requires manual insertion since we don't have auth.uid()
          // For Firebase-only users, we'll store their data but won't create a full Supabase auth user
          toast.info('Phone authentication successful! Complete signup to access all features.');
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            phone: fbUser.phoneNumber,
            phone_verified: true,
          })
          .eq('firebase_uid', fbUser.uid);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      }
    } catch (error) {
      console.error('Error syncing Firebase to Supabase:', error);
    }
  };

  // Merge Supabase and Firebase user data
  const mergeUserData = (supabaseUser: SupabaseUser | null, fbUser: FirebaseUser | null): UnifiedUser | null => {
    if (!supabaseUser && !fbUser) return null;

    return {
      id: supabaseUser?.id || fbUser?.uid || '',
      email: supabaseUser?.email || fbUser?.email || null,
      phoneNumber: fbUser?.phoneNumber || supabaseUser?.user_metadata?.phone || null,
      emailVerified: supabaseUser?.email_confirmed_at ? true : false,
      phoneVerified: fbUser ? true : false,
      displayName: fbUser?.displayName || supabaseUser?.user_metadata?.display_name || null,
      avatarUrl: fbUser?.photoURL || supabaseUser?.user_metadata?.avatar_url || null,
      supabaseUser,
      firebaseUser: fbUser,
    };
  };

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const mergedUser = mergeUserData(session?.user ?? null, firebaseUser);
        setUser(mergedUser);
        setLoading(false);

        // Only auto-navigate on sign in if we're on the auth page
        if (event === 'SIGNED_IN' && session?.user && window.location.pathname === '/auth') {
          navigate('/dashboard');
        }
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const mergedUser = mergeUserData(session?.user ?? null, firebaseUser);
      setUser(mergedUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [firebaseUser]);

  // When Firebase user changes, sync and update unified user
  useEffect(() => {
    if (firebaseUser) {
      syncFirebaseToSupabase(firebaseUser);
      const mergedUser = mergeUserData(session?.user ?? null, firebaseUser);
      setUser(mergedUser);
      
      // Don't auto-navigate - let the user stay on their current page
    } else if (!session?.user) {
      setUser(null);
    }
  }, [firebaseUser]);

  const signOut = async () => {
    try {
      // Sign out from both Firebase and Supabase
      if (firebaseUser) {
        await firebaseSignOut();
      }
      if (session) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const updateProfile = async (data: { phoneNumber?: string; displayName?: string }) => {
    if (!user) return;

    try {
      if (user.supabaseUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            phone: data.phoneNumber,
            display_name: data.displayName,
          })
          .eq('id', user.supabaseUser.id);

        if (error) throw error;
      } else if (user.firebaseUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            phone: data.phoneNumber,
            display_name: data.displayName,
          })
          .eq('firebase_uid', user.firebaseUser.uid);

        if (error) throw error;
      }

      toast.success('Profile updated successfully');
      
      // Refresh user data
      const mergedUser = mergeUserData(session?.user ?? null, firebaseUser);
      setUser(mergedUser);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const value: UnifiedAuthContextType = {
    user,
    session,
    loading,
    signOut,
    syncFirebaseToSupabase,
    updateProfile,
  };

  return <UnifiedAuthContext.Provider value={value}>{children}</UnifiedAuthContext.Provider>;
};
