import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-textPrimary flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-blackHole border border-borderDark text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-electricTangerine/15 border border-electricTangerine/30 flex items-center justify-center text-electricTangerine shadow-glow-tangerine">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-electricTangerine">
            404 Error
          </span>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Page Not Found</h1>
          <p className="text-sm text-textMuted leading-relaxed">
            The route or resource you are navigating to does not exist or has been moved in this workspace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/app/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-sm transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blackHole border border-borderDark hover:border-lemonChiffon/30 text-textPrimary text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
