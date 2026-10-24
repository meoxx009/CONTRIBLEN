import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase';

export async function POST() {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseBrowserClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch {}
  }

  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Clear legacy cookie name if present
  response.cookies.set('contribshield_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
