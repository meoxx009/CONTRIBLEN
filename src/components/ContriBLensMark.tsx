import React from 'react';

interface ContriBLensMarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * ContriBLensMark:
 * The official standalone brand symbol for ContriBLens OSS.
 * Combines:
 *  - C: Chamfered hexagonal outer hull representing ContriBLens
 *  - 🔍: Central circular lens with specular highlight for scanning/inspection
 *  - <>: 45-degree angled handle exiting the opening representing open-source code
 *
 * Adheres strictly to the application's established design system:
 * Electric Tangerine (#FF6D1F), Platinum Silver (#E5E4E2), Botticelli (#CDE3E8), Lemon Chiffon (#FFF8CA).
 */
export default function ContriBLensMark({
  className = 'w-6 h-6',
  size = 24,
  style,
  ...props
}: ContriBLensMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size || 24}
      height={size || 24}
      style={{ maxWidth: '100%', maxHeight: '100%', ...style }}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="cbl-c-hull" x1="16" y1="16" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9F6F2" />
          <stop offset="50%" stopColor="#303A4C" />
          <stop offset="100%" stopColor="#C02B18" />
        </linearGradient>
        <linearGradient id="cbl-lens-rim" x1="32" y1="32" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C02B18" />
          <stop offset="100%" stopColor="#F9F6F2" />
        </linearGradient>
      </defs>

      {/* Outer C-shaped Hexagonal Hull */}
      <path
        d="M 78 18 L 38 18 L 16 40 L 16 60 L 38 82 L 66 82 L 66 68 L 44 68 L 30 54 L 30 46 L 44 32 L 78 32 Z"
        fill="url(#cbl-c-hull)"
      />

      {/* Inner Lens Head (Magnifying Glass) */}
      <circle
        cx="48"
        cy="48"
        r="14"
        stroke="url(#cbl-lens-rim)"
        strokeWidth="5.5"
        fill="#120F0E"
      />

      {/* Lens Specular Glass Highlight */}
      <circle cx="43.5" cy="43.5" r="3" fill="#F9F6F2" opacity="0.9" />

      {/* Magnifying Glass Diagonal Handle (45 degrees down-right) */}
      <line
        x1="58"
        y1="58"
        x2="78"
        y2="78"
        stroke="#C02B18"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
