import { NextResponse } from 'next/server';
import { validateEmail } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        {
          error: 'Please provide a valid email address.',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // If Supabase is configured, trigger recovery email
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${appUrl}/login`,
          });
        }
      } catch (sbErr) {
        console.warn('Supabase resetPasswordForEmail notice:', sbErr);
      }
    }

    // Always return safe generic success to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account matches that email address, password reset instructions have been sent.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal error processing password recovery request.',
        errorCode: 'AUTH_PROVIDER_UNAVAILABLE',
      },
      { status: 500 }
    );
  }
}
