/**
 * Server-side Supabase client configuration
 * 
 * Creates a Supabase client for server-side use with improved error handling
 */
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config';

// Use service role key for server-side operations if available
const supabaseUrl = supabaseConfig.url || '';
const supabaseKey = supabaseConfig.serviceRoleKey || supabaseConfig.anonKey || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Create server-side Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // No need to persist session server-side
    autoRefreshToken: false, // Disable auto refresh for server
  },
  global: {
    fetch: (...args) => {
      return fetch(...args);
    },
  },
});