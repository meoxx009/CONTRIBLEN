# ImplT 2 Prompt Index — ContribLens UI/UX Redesign

Run the files in this order against the real webapp repository:

1. `00_REFERENCE_UI_ANALYSIS.md` — observed problems, reference direction and color tokens.
2. `01_LANDING_LIQUID_GLASS_REDESIGN_MASTER_PROMPT.md` — implement the landing-page, shared navigation and liquid-glass redesign.
3. `02_FULL_APP_VISUAL_SYNC_AND_RESPONSIVE_QA_PROMPT.md` — verify and fix the full webapp, responsive behavior, accessibility, performance and interactions.

## Status

- **Step 1 (Analysis & Tokens)**: Completed. Mocha Brown (`#6F4E37`), Platinum Silver (`#E5E4E2`), and Pale Lavender (`#E6E0F0`) integrated with core ContribLens palette.
- **Step 2 (Liquid Glass & Landing Page Redesign)**: Completed. Reusable UI primitives (`GlassStepRail`, `GlassMetricCard`, `Button glass`, `Badge chrome/lavender/silver`, `Card liquid-glass/liquid-hero`), responsive mobile navigation drawer, and 4-step evidence pipeline implemented.
- **Step 3 (Full-App Sync & QA)**: Completed. Anchor scroll margins (`scroll-mt-24`), keyboard `Escape` dismiss, reduced motion support, and test matrix (28/28 test suites, 0 lint errors, 0 typecheck errors, 39/39 build routes) verified.
