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
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-koraSlate/25 via-koraCharcoal-surface to-koraBurgundy/30 border border-koraCharcoal-border flex items-center justify-center shadow-liquid-glass group-hover:scale-105 transition-all">
        <ContriBLensMark size={24} className={markClassName} />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Typography: ContriBLens + OSS Badge + Tagline */}
      <div className="flex flex-col">
        <span className="font-heading font-bold text-base tracking-tight text-textPrimary flex items-center gap-1.5 transition-colors">
          <span>Contri<span className="text-textPrimary">B</span><span className="text-koraRed">Lens</span></span>
          {showBadge && (
            <span className="text-[10px] font-semibold bg-[#1C1715] text-koraOffWhite border border-[#5B5857]/40 px-2 py-0.5 rounded-full shadow-sm font-mono">
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
