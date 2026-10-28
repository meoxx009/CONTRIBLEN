'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, EyeOff, Terminal } from 'lucide-react';

export default function PrivacyNoticePage() {
  return (
    <div className="min-h-screen bg-koraBg text-koraOffWhite py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Smoky Ambient Backdrop Overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-koraBurgundy/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-[450px] h-[300px] bg-koraSlate/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-koraSecondary hover:text-koraOffWhite transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 rounded-xl bg-koraBurgundy/30 border border-koraRed/40 text-koraRed">
              <Shield className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-koraRed">
              Privacy &amp; Data Stewardship
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-koraOffWhite tracking-tight">
            Privacy Policy &amp; Data Principles
          </h1>
          <p className="mt-2 text-sm text-koraSecondary leading-relaxed">
            ContribLens OSS is built from the ground up on privacy-preserving, evidence-first principles. We do not monetize personal data or retain repository code.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3 text-koraOffWhite">
              <Lock className="w-5 h-5 text-koraRed" />
              <h2 className="text-lg font-heading font-semibold">1. Zero Raw Secret Storage</h2>
            </div>
            <p className="text-xs sm:text-sm text-koraSecondary leading-relaxed">
              When scanning repositories, any matching API tokens, AWS keys, GitHub PATs, private keys, or passwords are automatically and irreversibly redacted using client/server regex masking (<code className="text-koraOffWhite font-mono bg-koraCharcoal-dark px-1.5 py-0.5 rounded border border-koraCharcoal-border">ghp_••••••••••••</code>). Raw secrets never touch the database, logs, or AI prompt contexts.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3 text-koraOffWhite">
              <Terminal className="w-5 h-5 text-koraRed" />
              <h2 className="text-lg font-heading font-semibold">2. Zero Code Execution</h2>
            </div>
            <p className="text-xs sm:text-sm text-koraSecondary leading-relaxed">
              ContribLens never runs arbitrary code, executes scripts, or executes package manager installers (<code className="text-koraOffWhite font-mono bg-koraCharcoal-dark px-1.5 py-0.5 rounded border border-koraCharcoal-border">npm install</code>, <code className="text-koraOffWhite font-mono bg-koraCharcoal-dark px-1.5 py-0.5 rounded border border-koraCharcoal-border">pip install</code>) against audited repositories. All analysis is purely static, AST/manifest parsed, and read-only.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3 text-koraOffWhite">
              <EyeOff className="w-5 h-5 text-koraRed" />
              <h2 className="text-lg font-heading font-semibold">3. Safe AI Contract</h2>
            </div>
            <p className="text-xs sm:text-sm text-koraSecondary leading-relaxed">
              We send Gemini minimal, redacted evidence bundles rather than whole-repository dumps. Gemini is constrained to explain validated facts only and cannot alter findings, invent CVEs, or transmit repository contents outside our secure adapter boundary.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3 text-koraOffWhite">
              <Database className="w-5 h-5 text-koraRed" />
              <h2 className="text-lg font-heading font-semibold">4. User Rights &amp; Data Portability</h2>
            </div>
            <p className="text-xs sm:text-sm text-koraSecondary leading-relaxed">
              You own your scan history and generated issue drafts. From your Profile settings, you can export all stored records as a formatted JSON bundle or permanently purge your repository activity and scan history at any time.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-koraCharcoal-border flex flex-wrap items-center justify-between gap-4 text-xs text-koraSecondary">
          <p>© {new Date().getFullYear()} ContribLens OSS. Built for open source safety.</p>
          <div className="flex items-center gap-4">
            <Link href="/security" className="hover:text-koraOffWhite transition-colors">Security Model</Link>
            <Link href="/login" className="hover:text-koraOffWhite transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
