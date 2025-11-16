/**
 * Unified Authentication Context
 * 
 * Provides a unified authentication interface that supports both email and phone authentication.
 * This context wraps Supabase authentication and provides a normalized user object
 * that abstracts away the differences between email and phone-based auth.
 * 
 * Key features:
 * - Unified user object regardless of auth method
 * - Profile management (display name, phone number)
 * - Email/phone verification status tracking
 * - Automatic navigation on auth events
 * - Toast notifications for auth state changes
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Unified user interface
 * Normalizes Supabase user data into a consistent format regardless of auth method
 */
interface UnifiedUser {
  id: string; // User's unique identifier
  email: string | null; // Email address (null if phone-only auth)
  phoneNumber: string | null; // Phone number (null if email-only auth)
  emailVerified: boolean; // Whether email has been confirmed
  phoneVerified: boolean; // Whether phone has been confirmed
  displayName?: string | null; // User's display name from profile
  avatarUrl?: string | null; // URL to user's avatar image
  supabaseUser: SupabaseUser; // Original Supabase user object for advanced use cases
}

/**
 * Unified auth context interface
 * Provides unified auth state and methods
 */
interface UnifiedAuthContextType {
  user: UnifiedUser | null; // Current unified user object
  session: Session | null; // Current Supabase session
  loading: boolean; // Whether auth state is still being determined
  signOut: () => Promise<void>; // Sign out function
  updateProfile: (data: { phoneNumber?: string; displayName?: string }) => Promise<void>; // Update user profile
}

// Default context value
const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
});

/**
 * Hook to access unified authentication context
 * Must be used within a UnifiedAuthProvider component
 */
export const useUnifiedAuth = () => useContext(UnifiedAuthContext);

/**
 * UnifiedAuthProvider Component
 * 
 * Manages unified authentication state and provides methods for:
 * - Converting Supabase users to unified format
 * - Handling auth state changes
 * - Profile updates
 * - Sign out functionality
 */
export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Convert Supabase user to UnifiedUser format
   * 
   * This function normalizes Supabase user data into a consistent format
   * that works regardless of whether the user authenticated via email or phone.
   * 
   * @param supabaseUser - The Supabase user object to convert
   * @returns UnifiedUser object with normalized data
   */
  const createUnifiedUser = (supabaseUser: SupabaseUser): UnifiedUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || null,
      // Try multiple sources for phone number (metadata or direct phone field)
      phoneNumber: supabaseUser.user_metadata?.phone || supabaseUser.phone || null,
      // Check if email/phone have been confirmed
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      phoneVerified: supabaseUser.phone_confirmed_at ? true : false,
      // Try multiple metadata fields for display name
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      supabaseUser, // Keep original for advanced use cases
    };
  };

  /**
   * Effect hook to set up authentication state management
   * 
   * This effect:
   * 1. Listens to Supabase auth state changes
   * 2. Converts Supabase users to unified format
   * 3. Handles navigation and notifications based on auth events
   * 4. Checks for existing session on mount
   */
  useEffect(() => {
    /**
     * Set up Supabase auth state change listener
     * Fires on sign in, sign out, token refresh, email confirmation, etc.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Update session and convert user to unified format
        setSession(session);
        const unifiedUser = session?.user ? createUnifiedUser(session.user) : null;
        setUser(unifiedUser);
        setLoading(false);

        // Handle different auth events with appropriate actions
        if (event === 'SIGNED_IN' && session?.user) {
          // Redirect to dashboard if user was on auth page
          if (window.location.pathname === '/auth') {
            navigate('/dashboard');
          }
          
          // Show welcome message for users with confirmed email
          if (session.user.email_confirmed_at) {
            toast.success('Welcome back! You are now signed in.');
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Handle email confirmation event
          if (session.user.email_confirmed_at) {
            toast.success('✅ Email confirmed! Your account is now fully activated.');
          }
        }
      }
    );

    /**
     * Check for existing session on component mount
     * Handles page refreshes and returning users
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const unifiedUser = session?.user ? createUnifiedUser(session.user) : null;
      setUser(unifiedUser);
      setLoading(false);
    });

    // Cleanup: unsubscribe from auth state changes
    return () => subscription.unsubscribe();
  }, [navigate]);

  /**
   * Sign out function
   * 
   * Signs out the current user, clears local state, and redirects to auth page.
   * Shows success/error toast notifications.
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local state
      setUser(null);
      setSession(null);
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  /**
   * Update user profile
   * 
   * Updates both Supabase auth metadata and the profiles table.
   * This ensures profile data is consistent across the system.
   * 
   * @param data - Object containing phoneNumber and/or displayName to update
   */
  const updateProfile = async (data: { phoneNumber?: string; displayName?: string }) => {
    // Ensure user is authenticated before updating
    if (!user || !session) return;

    try {
      // Update Supabase auth metadata
      // This stores data in the user's auth record
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          phone: data.phoneNumber,
          display_name: data.displayName,
        }
      });

      if (authError) throw authError;

      // Update profiles table if it exists
      // This provides a dedicated table for extended profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          phone: data.phoneNumber,
          display_name: data.displayName,
          updated_at: new Date().toISOString(),
        });

      // Profile table update is optional - warn but don't fail if it doesn't exist
      if (profileError) {
        console.warn('Profile table update failed (table may not exist):', profileError);
      }

      toast.success('Profile updated successfully');
      
      // Refresh user data to reflect changes
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession?.user) {
        setUser(createUnifiedUser(newSession.user));
      }
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
