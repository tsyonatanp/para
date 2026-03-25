import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if both env vars are set
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co'
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => supabase !== null;
