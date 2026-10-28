'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ContriBLensLogo from '@/components/ContriBLensLogo';

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
    <div className="min-h-screen bg-koraBg text-koraOffWhite flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Smoky Ambient Backdrop Overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-koraBurgundy/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-24 right-1/4 w-[400px] h-[250px] bg-koraSlate/25 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-koraCharcoal-surface/80 border border-koraCharcoal-border hover:border-koraRed/40 transition-colors shadow-lg"
          >
            <ContriBLensLogo showTagline={false} />
          </Link>
        </div>

        <div className="p-8 sm:p-10 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-2xl backdrop-blur-xl space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-koraOffWhite tracking-tight">Reset your password</h1>
            <p className="mt-2 text-xs text-koraSecondary leading-relaxed">
              Enter your registered email address and we will send you secure recovery instructions.
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-koraOffWhite">Check your inbox</h2>
                <p className="text-xs text-koraSecondary leading-relaxed">
                  We have dispatched recovery instructions to <strong className="text-koraOffWhite">{email}</strong>.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-koraRed text-white text-xs font-semibold hover:bg-koraRed-hover transition-colors shadow-glow-red"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-koraBurgundy/40 border border-koraRed/50 flex items-start gap-2.5 text-xs text-koraOffWhite">
                  <AlertCircle className="w-4 h-4 text-koraRed shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-koraSecondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-koraSecondary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contributor@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border text-sm text-koraOffWhite placeholder-koraSecondary/50 focus:outline-none focus:border-koraRed transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold tracking-wide disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-glow-red"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                {submitting ? 'Sending instructions...' : 'Send Recovery Instructions'}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-koraSecondary hover:text-koraOffWhite transition-colors"
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
