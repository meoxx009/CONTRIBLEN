'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import ContriBLensMark from '@/components/ContriBLensMark';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const { setUser, showToast } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your email address or phone number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in.');
      }

      setUser(data.user);
      showToast('Welcome back! Logged in successfully.', 'success');
      
      const safeTarget =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? decodeURIComponent(nextParam)
          : '/app/dashboard';
      router.push(safeTarget);
    } catch (err: any) {
      setError(err.message || 'An error occurred while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Smoky Ambient Top Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-koraBurgundy/25 rounded-full blur-[90px] pointer-events-none" />

      <div className="p-8 rounded-2xl shadow-liquid-glass max-w-md w-full space-y-8 relative z-10 bg-koraCharcoal-surface/90 border border-koraCharcoal-border backdrop-blur-2xl">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-koraSlate/25 via-koraCharcoal-surface to-koraBurgundy/30 border border-koraCharcoal-border items-center justify-center text-koraOffWhite mb-4 shadow-liquid-glass">
            <ContriBLensMark size={24} className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-koraOffWhite tracking-tight">Log in to ContribLens</h2>
          <p className="mt-2 text-xs text-koraSecondary">
            Access your scanned repositories, contribution routes, and issue drafts.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-koraBurgundy/30 border border-koraBurgundy text-koraOffWhite text-xs flex items-start gap-2">
            <span>•</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-koraOffWhite mb-1.5">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="developer@example.com or +1 555-0199"
                className="w-full px-3.5 py-2.5 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-lg text-sm text-koraOffWhite placeholder-koraSecondary/50 focus:outline-none focus:border-koraRed focus:ring-1 focus:ring-koraRed transition-colors"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-[11px] text-koraSecondary">
              Enter the email or phone number you registered with.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-koraOffWhite">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-koraSecondary hover:text-koraOffWhite hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-lg text-sm text-koraOffWhite placeholder-koraSecondary/50 focus:outline-none focus:border-koraRed focus:ring-1 focus:ring-koraRed transition-colors pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-koraSecondary hover:text-koraOffWhite"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-koraRed hover:bg-koraRed-hover text-white font-semibold text-sm transition-all shadow-glow-red flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-koraCharcoal-border">
          <p className="text-xs text-koraSecondary">
            Don&apos;t have an account?{' '}
            <Link
              href={nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : '/signup'}
              className="text-koraOffWhite hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-koraBg" />}>
      <LoginContent />
    </Suspense>
  );
}
