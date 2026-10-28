import React from 'react';
import ContriBLensMark from './ContriBLensMark';

interface ContriBLensLogoProps {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  showBadge?: boolean;
}

/**
 * ContriBLensLogo:
 * Full horizontal logo component combining the C-shaped lens symbol,
 * the official ContriBLens wordmark, the OSS badge, and optional tagline.
 */
export default function ContriBLensLogo({
  className = '',
  markClassName = 'w-6 h-6',
  showTagline = true,
  showBadge = true,
}: ContriBLensLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Mark Icon Container */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-platinumSilver/15 via-blackHole/80 to-electricTangerine/20 border border-platinumSilver/25 flex items-center justify-center shadow-liquid-glass group-hover:scale-105 transition-all">
        <ContriBLensMark className={markClassName} />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Typography: ContriBLens + OSS Badge + Tagline */}
      <div className="flex flex-col">
        <span className="font-heading font-bold text-base tracking-tight text-textPrimary flex items-center gap-1.5 transition-colors">
          <span>Contri<span className="text-textPrimary">B</span><span className="text-electricTangerine">Lens</span></span>
          {showBadge && (
            <span className="text-[10px] font-semibold bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 px-2 py-0.5 rounded-full shadow-sm font-mono">
              OSS
            </span>
          )}
        </span>
        {showTagline && (
          <span className="text-[11px] text-textMuted -mt-0.5 hidden sm:inline tracking-wide font-normal">
            Scan. Understand. Contribute.
          </span>
        )}
      </div>
    </div>
  );
}
