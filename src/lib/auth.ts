import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';
import type { User, UserSettings } from '../types.ts';
import { calculatePasswordStrength } from './password.ts';
import { isSupabaseConfigured, resolveEmailFromPhone, getSupabaseServerClient } from './supabase.ts';

export { calculatePasswordStrength };

const JWT_SECRET = process.env.JWT_SECRET || 'contriblens-dev-local-secret-jwt-key-2026';
export const AUTH_COOKIE_NAME = 'contriblens_session';

export interface AuthSession {
  userId: string;
  email: string;
  phone: string;
  name: string;
}

/**
 * Normalizes phone numbers to standard E.164 international format (+[country code][number])
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function validatePhone(phone: string): boolean {
  // Must be valid international format with 8 to 15 digits
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[0-9]{8,15}$/.test(cleaned);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function signSessionToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Resolves phone number to email on the server without leaking email to client.
 */
export async function resolvePhoneToEmail(phoneInput: string): Promise<string | null> {
  const normalized = normalizePhone(phoneInput);

  // 1. Check Supabase profiles if configured
  if (isSupabaseConfigured()) {
    const email = await resolveEmailFromPhone(normalized);
    if (email) return email;
  }

  // 2. Check local DB fallback
  const localUser = db.getUserByEmailOrPhone(normalized) || db.getUserByEmailOrPhone(phoneInput);
  if (localUser) {
    return localUser.email;
  }

  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    let token =
      cookieStore.get(AUTH_COOKIE_NAME)?.value ||
      cookieStore.get('contribshield_session')?.value;

    if (!token) {
      try {
        const headerStore = await headers();
        const authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
      } catch {
        // headers() may not be available in non-request contexts
      }
    }

    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session || !session.userId) return null;

    // 1. Try local DB
    const user = db.getUserById(session.userId);
    if (user) return user;

    // 2. If Supabase is configured, fetch from profiles
    if (isSupabaseConfigured()) {
      const client = getSupabaseServerClient();
      if (client) {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.userId)
          .maybeSingle();

        if (profile) {
          return {
            id: profile.id,
            email: profile.email,
            phone: profile.phone || session.phone,
            name: profile.display_name || session.name,
            passwordHash: '',
            termsAccepted: Boolean(profile.terms_accepted_at),
            termsAcceptedAt: profile.terms_accepted_at,
            createdAt: profile.created_at,
            settings: defaultSettings,
          };
        }
      }
    }

    // 3. Stateless session reconstruction for serverless environments:
    // If the JWT signature was verified using our JWT_SECRET, the session payload is authentic.
    // Reconstruct the user and register in the local instance store so subsequent operations succeed.
    if (session.email) {
      const restoredUser: User = {
        id: session.userId,
        email: session.email,
        phone: session.phone || '',
        name: session.name || session.email.split('@')[0],
        passwordHash: '',
        termsAccepted: true,
        createdAt: new Date().toISOString(),
        settings: defaultSettings,
      };
      db.saveUser(restoredUser);
      return restoredUser;
    }

    return null;
  } catch {
    return null;
  }
}

export const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 'normal',
  fontFamily: 'sans',
  reducedMotion: false,
  strictRedaction: true,
  geminiGroundingPolicy: true,
};
