'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F3ED] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Warm Ambient Tangerine Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF6D1F]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#222222]/80 border border-[#FAF3E1]/10 text-sm font-semibold tracking-wide hover:border-[#FF6D1F]/50 transition-colors"
          >
            <Shield className="w-5 h-5 text-[#FF6D1F]" />
            <span>ContribLens <span className="text-[#FFF8CA]">OSS</span></span>
          </Link>
        </div>

        <div className="p-8 sm:p-10 rounded-2xl bg-[#222222]/90 border border-[#FAF3E1]/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F3ED] tracking-tight">Reset your password</h1>
            <p className="mt-2 text-xs text-[#AAA9A1] leading-relaxed">
              Enter your registered email address and we will send you secure recovery instructions.
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-[#F5F3ED]">Check your inbox</h2>
                <p className="text-xs text-[#AAA9A1] leading-relaxed">
                  We have dispatched recovery instructions to <strong className="text-[#FFF8CA]">{email}</strong>.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-[#FFF8CA] text-[#000000] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-[#6B0B0C]/40 border border-[#6B0B0C] flex items-start gap-2.5 text-xs text-[#FFF8CA]">
                  <AlertCircle className="w-4 h-4 text-[#FF6D1F] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#AAA9A1] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA9A1]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contributor@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#000000]/60 border border-[#FAF3E1]/15 text-sm text-[#F5F3ED] placeholder-[#AAA9A1]/50 focus:outline-none focus:border-[#FFF8CA] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-full bg-[#FFF8CA] text-[#000000] text-xs font-semibold tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#FFF8CA]/10"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-[#000000]" />}
                {submitting ? 'Sending instructions...' : 'Send Recovery Instructions'}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#AAA9A1] hover:text-[#FFF8CA] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
