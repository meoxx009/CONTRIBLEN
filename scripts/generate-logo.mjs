import fs from 'fs';
import path from 'path';

// Public folder
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standalone Mark: contrilens-mark.svg
// C-shaped outer polygon + central lens with specular highlight + 45-degree handle
// Using strictly existing design tokens:
// #FF6D1F (electricTangerine), #E5E4E2 (platinumSilver), #FFF8CA (lemonChiffon), #222222 (blackHole)
const contrilensMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" aria-label="ContriBLens Mark">
  <defs>
    <linearGradient id="cb-c-grad" x1="16" y1="16" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E5E4E2" />
      <stop offset="50%" stop-color="#CDE3E8" />
      <stop offset="100%" stop-color="#FF6D1F" />
    </linearGradient>
    <linearGradient id="cb-lens-grad" x1="32" y1="32" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF6D1F" />
      <stop offset="100%" stop-color="#FFF8CA" />
    </linearGradient>
    <filter id="cb-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#FF6D1F" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Outer C-shaped Hexagonal Hull with Chamfered < > code angles -->
  <path
    d="M 78 18 L 38 18 L 16 40 L 16 60 L 38 82 L 66 82 L 66 68 L 44 68 L 30 54 L 30 46 L 44 32 L 78 32 Z"
    fill="url(#cb-c-grad)"
  />

  <!-- Inner Lens (Magnifying Glass Head) -->
  <circle
    cx="48"
    cy="48"
    r="14"
    stroke="url(#cb-lens-grad)"
    stroke-width="5.5"
    fill="#161418"
    filter="url(#cb-glow)"
  />

  <!-- Lens Specular Highlight Dot -->
  <circle cx="43.5" cy="43.5" r="3" fill="#FFF8CA" opacity="0.9" />

  <!-- Magnifying Glass Diagonal Handle (45 degrees down-right) -->
  <line
    x1="58"
    y1="58"
    x2="78"
    y2="78"
    stroke="#FF6D1F"
    stroke-width="6.5"
    stroke-linecap="round"
  />
</svg>
`;

// 2. Full Horizontal Logo: contrilens-logo.svg
// Includes Standalone Mark + ContriBLens Wordmark + OSS Pill
const contrilensLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none" aria-label="ContriBLens OSS Logo">
  <defs>
    <linearGradient id="cb-c-grad-h" x1="16" y1="16" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E5E4E2" />
      <stop offset="50%" stop-color="#CDE3E8" />
      <stop offset="100%" stop-color="#FF6D1F" />
    </linearGradient>
    <linearGradient id="cb-lens-grad-h" x1="32" y1="32" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF6D1F" />
      <stop offset="100%" stop-color="#FFF8CA" />
    </linearGradient>
  </defs>

  <!-- Left Logo Mark (Scaled 64x64 centered at x=10, y=8) -->
  <g transform="translate(8, 8) scale(0.64)">
    <!-- Outer C-shaped Hexagonal Hull -->
    <path
      d="M 78 18 L 38 18 L 16 40 L 16 60 L 38 82 L 66 82 L 66 68 L 44 68 L 30 54 L 30 46 L 44 32 L 78 32 Z"
      fill="url(#cb-c-grad-h)"
    />
    <!-- Inner Lens Head -->
    <circle
      cx="48"
      cy="48"
      r="14"
      stroke="url(#cb-lens-grad-h)"
      stroke-width="5.5"
      fill="#161418"
    />
    <!-- Specular Highlight -->
    <circle cx="43.5" cy="43.5" r="3" fill="#FFF8CA" opacity="0.9" />
    <!-- Handle -->
    <line
      x1="58"
      y1="58"
      x2="78"
      y2="78"
      stroke="#FF6D1F"
      stroke-width="6.5"
      stroke-linecap="round"
    />
  </g>

  <!-- Wordmark: ContriBLens -->
  <text x="82" y="44" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">
    <tspan fill="#F5F3ED">Contri</tspan><tspan fill="#F5F3ED">B</tspan><tspan fill="#FF6D1F">Lens</tspan>
  </text>

  <!-- OSS Badge -->
  <rect x="220" y="27" width="36" height="19" rx="9.5" fill="#2D120D" stroke="rgba(255, 248, 202, 0.4)" stroke-width="1" />
  <text x="238" y="40.5" font-family="ui-monospace, Menlo, monospace" font-size="10" font-weight="700" fill="#FFF8CA" text-anchor="middle">OSS</text>

  <!-- Tagline underneath -->
  <text x="83" y="60" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="500" fill="#AAA9A1" letter-spacing="0.5">
    Scan. Understand. Contribute.
  </text>
</svg>
`;

// 3. Favicon (icon.svg for Next.js App Router & public/favicon.svg)
const contrilensFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <!-- Crisp high-contrast favicon mark for 16px/32px/48px tab displays -->
  <rect width="32" height="32" rx="7" fill="#141416" />
  <path
    d="M 24 7 L 13 7 L 7 13 L 7 19 L 13 25 L 21 25 L 21 21 L 15 21 L 11 17 L 11 15 L 15 11 L 24 11 Z"
    fill="#E5E4E2"
  />
  <circle cx="16" cy="16" r="4.5" stroke="#FF6D1F" stroke-width="2" fill="#000000" />
  <line x1="19.5" y1="19.5" x2="24" y2="24" stroke="#FF6D1F" stroke-width="2.5" stroke-linecap="round" />
</svg>
`;

// Write to public/
fs.writeFileSync(path.join(publicDir, 'contrilens-mark.svg'), contrilensMarkSvg.trim());
fs.writeFileSync(path.join(publicDir, 'contrilens-logo.svg'), contrilensLogoSvg.trim());
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), contrilensFaviconSvg.trim());

// Write to src/app/icon.svg (Next.js official favicon route)
const appDir = path.resolve(process.cwd(), 'src/app');
fs.writeFileSync(path.join(appDir, 'icon.svg'), contrilensFaviconSvg.trim());

console.log('Successfully generated ContriBLens SVG brand assets:');
console.log(' - public/contrilens-mark.svg');
console.log(' - public/contrilens-logo.svg');
console.log(' - public/favicon.svg');
console.log(' - src/app/icon.svg');
