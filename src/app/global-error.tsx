'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-[#F5F3ED] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#222222] border border-[rgba(245,243,237,0.14)] text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6B0B0C]/20 border border-[#6B0B0C]/40 flex items-center justify-center text-[#FF6D1F]">
            <span className="text-2xl">⚠️</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Critical Application Error</h1>
            <p className="text-sm text-[#AAA9A1] leading-relaxed">
              A fatal application exception was intercepted. Your session and repository state are safe.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-[#AAA9A1]/70 bg-black/40 px-3 py-1.5 rounded-lg border border-[rgba(245,243,237,0.14)] inline-block">
                Ref ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF8CA] hover:bg-[#FAF3E1] text-black font-semibold text-sm transition-all shadow-md"
            >
              Reload ContribLens
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
