import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: lib/supabase/admin.ts must never be imported or executed in client components or browser context!');
}

const FALLBACK_SUPABASE_URL = 'https://oskbafwqreeqxfwnwbzv.supabase.co';

function resolveServiceKey(): string | undefined {
  const envKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envKey && !envKey.includes('PEGA_AQUI') && !envKey.includes('your-service-role')) {
    return envKey;
  }
  return undefined;
}

function resolveSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && envUrl.includes('.supabase.co')) {
    return envUrl;
  }
  return FALLBACK_SUPABASE_URL;
}

export function isSupabaseConfigured(): boolean {
  const serviceRoleKey = resolveServiceKey();
  const supabaseUrl = resolveSupabaseUrl();

  if (!serviceRoleKey || !supabaseUrl) return false;
  if (!supabaseUrl.includes('.supabase.co')) return false;
  return true;
}

export function createAdminClient() {
  const serviceRoleKey = resolveServiceKey();
  const supabaseUrl = resolveSupabaseUrl();

  if (!serviceRoleKey) {
    throw new Error('Missing Supabase key in environment variables.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

