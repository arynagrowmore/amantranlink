import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚡ Explicit Static Bindings for Vite Bundler Inlining
const VITE_URL = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : undefined;
const VITE_KEY = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY : undefined;

// Fallback for Node / Testing / SSR environments
const NODE_URL = typeof process !== 'undefined' && process.env ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) : undefined;
const NODE_KEY = typeof process !== 'undefined' && process.env ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) : undefined;

const SUPABASE_URL = VITE_URL || NODE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_ANON_KEY = VITE_KEY || NODE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emlpcWR4YnZ5bnJwcnVndndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzAyMDMsImV4cCI6MjEwMjgwNjIwM30._rrJrh-NLf3t0sQzvmcQL9X3CzZH_nvHGvqOv1ijqeI';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('demo.supabase') &&
  !SUPABASE_ANON_KEY.includes('demo_anon_key')
);

// 🛡️ Single Supabase Client Instance for Whole Application
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export default supabase;
