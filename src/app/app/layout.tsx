'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.push(`/login${nextParam}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-koraSecondary space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-koraRed" />
        <p className="text-xs font-mono text-koraOffWhite/80 tracking-wide">
          Verifying authenticated session...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col w-full bg-transparent text-textPrimary">
      {children}
    </div>
  );
}
