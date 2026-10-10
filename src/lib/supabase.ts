import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey !== 'your-anon-key-here'
  );
};

// Create the Supabase client if configured, otherwise provide a dummy client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    configured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*$/, '$1') : 'Not Configured',
    mode: configured ? ('Live Cloud Sync' as const) : ('Local Demo Enclave' as const),
    statusNote: configured
      ? 'Connected to live Supabase backend with Row Level Security (RLS).'
      : 'Running in Secure Local Demo Mode. Records are stored locally and will not persist across external devices until Supabase credentials are provided.',
  };
};
