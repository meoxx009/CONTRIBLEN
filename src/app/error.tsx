'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Redacted server logging of client boundary errors
    console.error('Unhandled UI Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-textPrimary flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-blackHole border border-borderDark text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rosewood/20 border border-rosewood/40 flex items-center justify-center text-rosewood shadow-glow-tangerine">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Something Went Wrong</h1>
          <p className="text-sm text-textMuted leading-relaxed">
            An unexpected error occurred while processing this view. All repository data and active states remain safely preserved.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-textMuted/70 bg-black/40 px-3 py-1.5 rounded-lg border border-borderDark inline-block">
              Ref ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-sm transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/app/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blackHole border border-borderDark hover:border-lemonChiffon/30 text-textPrimary text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
