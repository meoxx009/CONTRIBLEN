'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import ContriBLensMark from '@/components/ContriBLensMark';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { calculatePasswordStrength } from '@/lib/password';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const { setUser, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number with country code is required (e.g. +1 555-0199).');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (strength.score < 2) {
      setError('Password is too weak. Please meet at least 3 strength criteria.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setUser(data.user);
      showToast('Account created successfully! Welcome to ContribLens.', 'success');
      const safeTarget =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? decodeURIComponent(nextParam)
          : '/app/dashboard';
      router.push(safeTarget);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
      
      {/* Orange Ambient Top Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-electricTangerine/20 rounded-full blur-[90px] pointer-events-none" />

      <div className="glass-panel p-8 rounded-2xl shadow-glass-card max-w-md w-full space-y-6 relative z-10 border border-borderDark">
        
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-electricTangerine/15 border border-electricTangerine/30 items-center justify-center text-electricTangerine mb-3 shadow-glow-tangerine">
            <ContriBLensMark size={24} className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Create your account</h2>
          <p className="mt-1.5 text-xs text-textMuted">
            Sign up with your email and phone to start navigating repositories safely.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rosewood/40 border border-rosewood text-cotton text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-lemonChiffon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-textPrimary mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Contributor"
              className="w-full px-3.5 py-2.5 bg-black border border-borderDark rounded-lg text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-textPrimary mb-1">
              Email Address <span className="text-electricTangerine">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full px-3.5 py-2.5 bg-black border border-borderDark rounded-lg text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-textPrimary mb-1">
              Phone Number with Country Code <span className="text-electricTangerine">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199 or +91 9876543210"
              className="w-full px-3.5 py-2.5 bg-black border border-borderDark rounded-lg text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon transition-colors"
              disabled={loading}
            />
            <span className="text-[10px] text-textMuted">Include your country calling code prefix.</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-textPrimary mb-1">
              Password <span className="text-electricTangerine">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 bg-black border border-borderDark rounded-lg text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textPrimary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength visualizer */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-textMuted">Strength:</span>
                  <span
                    className={`font-semibold ${
                      strength.score <= 1
                        ? 'text-rosewood'
                        : strength.score === 2
                        ? 'text-electricTangerine'
                        : 'text-lemonChiffon'
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all ${
                        step < strength.score
                          ? strength.score <= 1
                            ? 'bg-rosewood'
                            : strength.score === 2
                            ? 'bg-electricTangerine'
                            : 'bg-lemonChiffon'
                          : 'bg-blackHole'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-textPrimary mb-1">
              Re-enter Password <span className="text-electricTangerine">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 bg-black border border-borderDark rounded-lg text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textPrimary"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-black border-borderDark text-electricTangerine focus:ring-lemonChiffon"
                required
              />
              <span className="text-xs text-textMuted leading-snug">
                I agree to the <span className="text-textPrimary underline">Terms of Service</span> and acknowledge the <span className="text-textPrimary underline">Privacy Policy</span>. ContribLens scans public repositories in read-only mode.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-sm transition-all shadow-md hover:shadow-lemonChiffon/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <div className="text-center pt-2 border-t border-borderDark">
          <p className="text-xs text-textMuted">
            Already registered?{' '}
            <Link href="/login" className="text-lemonChiffon hover:underline font-medium">
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}
