/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client instance for the application.
 * The client is configured with TypeScript types for type-safe database operations
 * and includes authentication settings for session persistence.
 * 
 * Note: This file may be auto-generated. Check with your Supabase setup before
 * making manual changes.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Load Supabase configuration from environment variables
// These should be set in your .env file or deployment environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Usage:
 * Import the supabase client in your components like this:
 * 
 * ```typescript
 * import { supabase } from "@/integrations/supabase/client";
 * ```
 * 
 * Then use it to interact with your database:
 * ```typescript
 * const { data, error } = await supabase.from('table_name').select('*');
 * ```
 */

/**
 * Supabase client instance
 * 
 * Configured with:
 * - TypeScript database types for type safety
 * - localStorage for session persistence (survives page refreshes)
 * - Automatic token refresh for seamless user experience
 * - Session persistence enabled (users stay logged in)
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage, // Store auth tokens in browser localStorage
    persistSession: true, // Keep user logged in across page refreshes
    autoRefreshToken: true, // Automatically refresh expired tokens
  }
});