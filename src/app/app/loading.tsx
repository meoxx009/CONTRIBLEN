import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-textMuted space-y-3">
      <Loader2 className="w-7 h-7 animate-spin text-electricTangerine" />
      <span className="text-xs font-mono text-lemonChiffon/70">
        Loading workspace view...
      </span>
    </div>
  );
}
