import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: { phoneNumber?: string; displayName?: string }) => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useUnifiedAuth = () => useContext(UnifiedAuthContext);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Convert Supabase user to UnifiedUser
  const createUnifiedUser = (supabaseUser: SupabaseUser | null): UnifiedUser | null => {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || null,
      phoneNumber: supabaseUser.user_metadata?.phone || supabaseUser.phone || null,
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      phoneVerified: supabaseUser.phone_confirmed_at ? true : false,
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      supabaseUser,
    };
  };

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(createUnifiedUser(session?.user ?? null));
        setLoading(false);

        // Auto-navigate on sign in if we're on the auth page
        if (event === 'SIGNED_IN' && session?.user && window.location.pathname === '/auth') {
          navigate('/dashboard');
        }
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(createUnifiedUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
    if (!user?.supabaseUser) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: data.phoneNumber,
          display_name: data.displayName,
        }
      });

      if (error) throw error;

      toast.success('Profile updated successfully');
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(createUnifiedUser(updatedUser));
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
    updateProfile,
  };

  return <UnifiedAuthContext.Provider value={value}>{children}</UnifiedAuthContext.Provider>;
};
