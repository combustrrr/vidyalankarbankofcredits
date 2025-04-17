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

// Add Supabase RLS policy to prevent students from updating their semester once it's set
const addRlsPolicy = async () => {
  const { error } = await supabase.rpc('add_rls_policy', {
    table_name: 'students',
    policy_name: 'prevent_student_semester_update',
    definition: 'auth.uid() = id AND semester IS NULL'
  });

  if (error) {
    console.error('Error adding RLS policy:', error);
  } else {
    console.log('RLS policy added successfully');
  }
};

addRlsPolicy();
