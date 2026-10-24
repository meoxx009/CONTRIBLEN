/**
 * ContribLens OSS — Supabase Client & Authentication Helper
 * Tagline: Scan. Understand. Contribute.
 * 
 * Security Invariants:
 * - SUPABASE_SERVICE_ROLE_KEY is used ONLY in trusted server-side execution.
 * - Browser bundles receive only NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * - If Supabase credentials are not configured in local development or tests,
 *   falls back seamlessly to local mock persistence without breaking functionality.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    url.trim() !== '' &&
    anonKey.trim() !== '' &&
    url.startsWith('http') &&
    !url.includes('your-supabase')
  );
}

export function isSupabaseServiceRoleConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    serviceKey &&
    url.trim() !== '' &&
    serviceKey.trim() !== '' &&
    !serviceKey.includes('your-service-role')
  );
}

/**
 * Client-safe Supabase instance using public anon key.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return browserClient;
}

/**
 * Server-only Supabase instance using service role key (or fallback anon key).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient must only be called on the server.');
  }

  if (isSupabaseServiceRoleConfigured()) {
    if (!serverClient) {
      serverClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }
    return serverClient;
  }

  // Fallback to anon key on server if service role key is omitted
  return getSupabaseBrowserClient();
}

/**
 * Resolves a normalized phone number to an associated email address on the server.
 * Never leaks the email to the client if login fails.
 */
export async function resolveEmailFromPhone(phone: string): Promise<string | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('email')
      .eq('phone', phone)
      .maybeSingle();

    if (error || !data) return null;
    return data.email;
  } catch (err) {
    console.warn('Failed to query profiles table for phone resolution:', err);
    return null;
  }
}
