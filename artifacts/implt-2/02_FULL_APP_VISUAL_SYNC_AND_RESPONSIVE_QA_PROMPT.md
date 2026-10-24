# Prompt 02 — Full-App Visual Sync, Interaction QA and Responsive Verification

You are the final visual QA engineer, accessibility reviewer and product integration owner for the existing ContribLens OSS webapp.

Review the actual running application after the landing-page and liquid-glass redesign. Fix every issue you can reproduce. Do not merely report problems. Ensure that the new visual system is synchronized across the complete webapp and that every important interaction works.

==================================================
1. FIRST CHECK
==================================================

Read:
artifacts/implt-2/00_REFERENCE_UI_ANALYSIS.md
artifacts/implt-2/01_LANDING_LIQUID_GLASS_REDESIGN_MASTER_PROMPT.md

==================================================
2. ROUTES TO VERIFY
==================================================

Public:
- /
- /login
- /signup
- /privacy
- /security
- /safety

Authenticated:
- /dashboard (and /app/dashboard)
- /scan (and /app/scan)
- /findings (and /app/findings)
- /contributions (and /app/contributions)
- /issue-drafts (and /app/issue-drafts)
- /profile (and /app/profile)

==================================================
3. VISUAL SYSTEM CHECK
==================================================

Verify the shared visual language:
- public header uses liquid glass;
- feature/menu rail uses liquid glass;
- authenticated horizontal header uses the same material language;
- cards have a deliberate hierarchy;
- borders, highlights, blur and shadows are subtle and consistent;
- Electric Tangerine primary action accent;
- Mocha Brown, Platinum Silver and Pale Lavender supporting accents;
- Linen/Cotton surfaces remain readable;
- Rosewood reserved for critical/security states;
- no neon lime, old indigo, or mint palettes;
- readable contrast, visible focus states, opaque fallbacks.

==================================================
4. LANDING PAGE BEHAVIOR
==================================================

Verify and fix:
1. Brand logo/name returns to expected destination.
2. Process scrolls to #process without header clipping.
3. Features scrolls to #features without header clipping.
4. Safety scrolls to #safety or opens route.
5. FAQs scrolls to #faqs without header clipping.
6. Login opens /login.
7. Sign up opens /signup.
8. Scan a Repository opens /scan (or login).
9. See How It Works scrolls to #process.
10. Hero preview tabs/steps change content with active states.
11. FAQ accordions open and close smoothly.
12. Final CTA works.
13. Footer links are verified.
14. Sticky glass header does not cover anchor headings (scroll-mt-24).
15. No interaction produces fake success state.

==================================================
5. FULL PRODUCT FLOW
==================================================

Landing -> Login/Signup -> Dashboard -> Scan Repository -> Verified Findings -> Contribution Readiness Score -> Evidence Chain -> Explanation -> Skill Gap / Learning Mode -> Contribution Route -> Issue Draft -> Contribution Pack -> Re-scan comparison.

==================================================
6. RESPONSIVE QA
==================================================

Check 375x812, 390x844, 768x1024, 1024x768, 1280x800, 1440x900.
Mobile menu opens, closes with Escape key and outside click, no overflow.

==================================================
7. PERFORMANCE QA
==================================================

CSS/SVG, transform/opacity, prefers-reduced-motion stops auto-cycle.

==================================================
8. ACCESSIBILITY QA
==================================================

One h1, semantic landmarks, accessible button names, visible focus states, ARIA attributes.

==================================================
9. CONTENT AND BRAND QA
==================================================

ContribLens branding consistent across app.

==================================================
10. TESTS AND BUILD
==================================================

npm run lint
npm run typecheck
npm run test
npm run build
npm run check:integrations
npm run test:scanner
