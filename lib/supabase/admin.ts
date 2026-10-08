import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: lib/supabase/admin.ts must never be imported or executed in client components or browser context!');
}

export function isSupabaseConfigured(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) return false;
  if (!supabaseUrl.includes('.supabase.co')) return false;
  if (serviceRoleKey.includes('PEGA_AQUI') || serviceRoleKey.includes('your-service-role')) return false;
  return true;
}

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

