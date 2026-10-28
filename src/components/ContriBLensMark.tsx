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
  size,
  ...props
}: ContriBLensMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="cbl-c-hull" x1="16" y1="16" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E5E4E2" />
          <stop offset="50%" stopColor="#CDE3E8" />
          <stop offset="100%" stopColor="#FF6D1F" />
        </linearGradient>
        <linearGradient id="cbl-lens-rim" x1="32" y1="32" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6D1F" />
          <stop offset="100%" stopColor="#FFF8CA" />
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
        fill="#161418"
      />

      {/* Lens Specular Glass Highlight */}
      <circle cx="43.5" cy="43.5" r="3" fill="#FFF8CA" opacity="0.9" />

      {/* Magnifying Glass Diagonal Handle (45 degrees down-right) */}
      <line
        x1="58"
        y1="58"
        x2="78"
        y2="78"
        stroke="#FF6D1F"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
