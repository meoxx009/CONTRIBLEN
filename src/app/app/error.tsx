'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error Intercepted:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-blackHole border border-borderDark text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rosewood/20 border border-rosewood/40 flex items-center justify-center text-rosewood shadow-glow-tangerine">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Workspace View Error</h2>
          <p className="text-xs text-textMuted leading-relaxed">
            An error occurred while loading this view. All repository data and active states remain safely preserved.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-textMuted/70 bg-black/50 px-2.5 py-1 rounded border border-borderDark inline-block">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-xs transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/app/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black border border-borderDark hover:border-lemonChiffon/30 text-textPrimary text-xs font-medium transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-electricTangerine" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
