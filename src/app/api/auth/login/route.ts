import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyPassword,
  signSessionToken,
  resolvePhoneToEmail,
  validateEmail,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || body.phone || body.login || '').trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        {
          error: 'Email or phone number, and password are required.',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    let targetEmail = identifier;
    const isLikelyPhone = !identifier.includes('@') && /[\d+]/.test(identifier);

    // Phone login without OTP: resolve phone to email server-side
    if (isLikelyPhone) {
      const resolvedEmail = await resolvePhoneToEmail(identifier);
      if (!resolvedEmail) {
        return NextResponse.json(
          {
            error: 'Invalid credentials. Please verify your email/phone and password.',
            errorCode: 'AUTH_INVALID_CREDENTIALS',
          },
          { status: 401 }
        );
      }
      targetEmail = resolvedEmail;
    } else if (!validateEmail(targetEmail)) {
      return NextResponse.json(
        {
          error: 'Please provide a valid email address or phone number.',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (!authError && authData.user) {
          // Fetch user profile from Supabase
          const serverSupabase = getSupabaseServerClient() || supabase;
          const { data: profile } = await serverSupabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          const userName = profile?.display_name || authData.user.user_metadata?.name || targetEmail.split('@')[0];
          const userPhone = profile?.phone || authData.user.user_metadata?.phone || '';

          const token = signSessionToken({
            userId: authData.user.id,
            email: authData.user.email || targetEmail,
            phone: userPhone,
            name: userName,
          });

          const response = NextResponse.json({
            success: true,
            user: {
              id: authData.user.id,
              email: authData.user.email || targetEmail,
              phone: userPhone,
              name: userName,
              settings: profile?.metadata_json?.settings || {
                theme: 'dark',
                fontSize: 'normal',
                fontFamily: 'sans',
                reducedMotion: false,
                strictRedaction: true,
                geminiGroundingPolicy: true,
              },
            },
          });

          response.cookies.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          });

          return response;
        }
      }
    }

    // 2. Fallback to local DB for development and offline testing
    const user = db.getUserByEmailOrPhone(targetEmail) || db.getUserByEmailOrPhone(identifier);
    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid credentials. Please verify your identifier and password.',
          errorCode: 'AUTH_INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid credentials. Please verify your identifier and password.',
          errorCode: 'AUTH_INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        settings: user.settings,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal login error',
        errorCode: 'AUTH_PROVIDER_UNAVAILABLE',
      },
      { status: 500 }
    );
  }
}
