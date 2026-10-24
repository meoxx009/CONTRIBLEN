import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  validateEmail,
  validatePhone,
  normalizePhone,
  calculatePasswordStrength,
  hashPassword,
  signSessionToken,
  defaultSettings,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';
import { User } from '@/types';
import { isSupabaseConfigured, getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, password, confirmPassword, passwordConfirmation, termsAccepted, acceptedTerms, agreeTerms, name } = body;

    const confirmation = passwordConfirmation || confirmPassword;
    const isTermsAccepted = Boolean(acceptedTerms ?? termsAccepted ?? agreeTerms);

    // 1. Validate fields
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.', errorCode: 'AUTH_INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        {
          error: 'Please provide a valid E.164 phone number with country code (e.g. +919876543210 or +15550199).',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required.', errorCode: 'AUTH_INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (password !== confirmation) {
      return NextResponse.json(
        { error: 'Passwords do not match.', errorCode: 'AUTH_INVALID_INPUT' },
        { status: 400 }
      );
    }

    const strength = calculatePasswordStrength(password);
    if (strength.score < 2) {
      return NextResponse.json(
        {
          error: `Password is too weak. ${strength.feedback.join('. ')}`,
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    if (!isTermsAccepted) {
      return NextResponse.json(
        {
          error: 'You must agree to the Terms of Service and Privacy Policy to proceed.',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 2. Check existing user in local DB
    const existing = db.getUserByEmailOrPhone(email) || db.getUserByEmailOrPhone(normalizedPhone);
    if (existing) {
      return NextResponse.json(
        {
          error: 'An account with this email address or phone number already exists.',
          errorCode: 'AUTH_INVALID_INPUT',
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const displayName = name?.trim() || email.split('@')[0];
    const nowIso = new Date().toISOString();
    let userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const { data: authData, error: authErr } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: {
                name: displayName,
                phone: normalizedPhone,
              },
            },
          });

          if (authErr) {
            console.warn('Supabase auth signup notice:', authErr.message);
          } else if (authData.user) {
            userId = authData.user.id;
            const serverClient = getSupabaseServerClient() || supabase;
            await serverClient.from('profiles').upsert({
              id: userId,
              email: email.trim().toLowerCase(),
              phone: normalizedPhone,
              display_name: displayName,
              terms_accepted_at: nowIso,
              updated_at: nowIso,
            });
          }
        }
      } catch (sbErr) {
        console.warn('Supabase profile insertion error (continuing with local persistence):', sbErr);
      }
    }

    // 4. Local DB creation
    const newUser: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      name: displayName,
      passwordHash,
      termsAccepted: true,
      termsAcceptedAt: nowIso,
      createdAt: nowIso,
      settings: defaultSettings,
    };

    db.saveUser(newUser);

    // 5. Session cookie
    const token = signSessionToken({
      userId: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      name: newUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        name: newUser.name,
        settings: newUser.settings,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal signup error',
        errorCode: 'AUTH_PROVIDER_UNAVAILABLE',
      },
      { status: 500 }
    );
  }
}
