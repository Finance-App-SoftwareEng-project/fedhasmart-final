/**
 * Authentication Context
 * 
 * Provides Supabase authentication state and methods to the application.
 * This is a simpler auth context that directly uses Supabase user objects.
 * For a more unified approach with phone/email support, see UnifiedAuthContext.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication context interface
 * Provides user session state and sign-out functionality
 */
interface AuthContextType {
  user: User | null; // Current authenticated user from Supabase
  session: Session | null; // Current session object containing auth tokens
  loading: boolean; // Whether auth state is still being determined
  signOut: () => Promise<void>; // Function to sign out the current user
}

// Default context value - used when context is accessed outside provider
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider component
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider Component
 * 
 * Manages authentication state by:
 * 1. Listening to Supabase auth state changes
 * 2. Checking for existing sessions on mount
 * 3. Providing auth state and methods to child components
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Set up Supabase auth state change listener
     * This fires whenever authentication state changes (sign in, sign out, token refresh, etc.)
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update state whenever auth changes
        setSession(session);
        setUser(session?.user ?? null); // Extract user from session, or null if no session
        setLoading(false); // Auth state determined
      }
    );

    /**
     * Check for existing session on component mount
     * This handles cases where user refreshes the page or returns to the app
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup: unsubscribe from auth state changes when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign out function
   * Signs out the current user and redirects to auth page
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
