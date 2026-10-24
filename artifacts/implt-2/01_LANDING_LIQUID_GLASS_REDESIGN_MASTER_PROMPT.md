# Master Implementation Prompt — ContribLens Landing Page and Liquid Glass Redesign

You are the lead product engineer, senior UI/UX designer, interaction designer and QA engineer for the existing ContribLens OSS webapp.

Implement a real, production-quality visual and interaction redesign of the landing page and shared navigation. This is not a screenshot exercise and not a static mockup. Work in the existing application, preserve existing functionality, connect every CTA and verify the result in a real browser.

==================================================
1. GOAL
==================================================

The current landing page communicates the product but feels flat, static and visually forgettable. The requested liquid-glass effect is missing from the feature/menu bar and the public navigation. The product preview is not attractive enough, the workflow is too small, and the page does not create a strong visual story.

Redesign the experience so it communicates this journey immediately:

Scan -> Verify -> Understand -> Contribute

The result must be:

- clean;
- attractive;
- professional;
- modern;
- student-friendly;
- evidence-first;
- fast and responsive;
- accessible;
- fully interactive;
- visually consistent with the authenticated app.

Do not create a separate landing-page design system. Improve the shared system so the landing page, authenticated shell, findings, contribution routes, issue drafts and profile pages feel like one product.

==================================================
2. SOURCE MATERIAL AND CURRENT PROBLEMS
==================================================

Read this analysis before editing:

artifacts/implt-2/00_REFERENCE_UI_ANALYSIS.md

Observed issues to fix:

- flat opaque header instead of liquid glass;
- weak menu hierarchy and low-contrast links;
- large empty black areas without purposeful depth;
- tiny floating annotations that resemble debug labels;
- workflow labels too small to read;
- static hero preview with little story or motion;
- generic pill CTAs;
- flat FAQ cards;
- abrupt final CTA;
- authenticated header and dashboard cards not sharing the same material language.

==================================================
3. AUDIT BEFORE EDITING
==================================================

Before changing code:

1. Identify the real application root.
2. Read package.json, existing scripts and project instructions.
3. Inspect the current landing route, layout, header, navigation, design tokens, CSS and reusable components.
4. Inspect the authenticated app shell, dashboard, findings, contribution route and issue-draft components.
5. Search all existing CTA handlers and route links before changing them.
6. Inspect existing tests and screenshots if available.
7. Preserve unrelated work and existing behavior.
8. Do not replace the framework or create a starter template.
9. Do not add unrelated dependencies.
10. Do not use a screenshot of the reference image as the landing page.

The final visible brand in the current app is ContribLens. Preserve that brand unless the repository contains an explicit, newer name-lock instruction. Do not introduce Patchloom, ContribShield or any other old name.

==================================================
4. NON-NEGOTIABLE FUNCTIONALITY
==================================================

This is a visual redesign with functional integration. Do not break:

- Supabase authentication;
- login and signup;
- horizontal authenticated navigation;
- GitHub repository scan;
- GitHub Raw Content reads;
- OSV dependency lookup;
- Gemini explanation and fallback;
- deterministic scanner findings;
- Contribution Readiness Score;
- Evidence Chain / Trust Trail;
- Skill Gap and Learning Mode;
- contribution routes;
- issue drafts;
- scan history and diff;
- profile and safety controls;
- route guards;
- database persistence;
- security redaction.

Every visible action must work:

- Scan a Repository must navigate to the real scan flow or login first when unauthenticated.
- See How It Works must scroll to the real workflow section.
- Process, Features, Safety and FAQs must scroll to real sections with active state feedback.
- Login and Sign up must use the existing routes.
- The brand mark must return to the correct landing/dashboard destination according to auth state.
- Mobile menu must open, close, focus correctly and navigate.
- FAQ accordions must open and close with keyboard and pointer input.
- The hero preview controls must be meaningful and must not claim that a real scan happened if it is sample/demo content.

Do not leave fake buttons, dead links, unhandled click targets or placeholder alerts.

==================================================
5. VISUAL SYSTEM
==================================================

Use the existing ContribLens design system as the base and add these supporting colors from the supplied reference:

Primary base:

Pure Black:          #000000
Black Hole:          #222222
Sustainable Linen:  #FAF3E1
Recycled Cotton:    #F5E7C6
Electric Tangerine: #FF6D1F
Lemon Chiffon:      #FFF8CA
Rosewood:           #6B0B0C
Coffee Bean:        #2D120D
Botticelli:         #CDE3E8

Reference support colors:

Mocha Brown:        #6F4E37
Platinum Silver:    #E5E4E2
Pale Lavender:      #E6E0F0

Color rules:

1. Keep black/Black Hole as the structural base.
2. Use Electric Tangerine for primary CTA, active progress, focus highlights and meaningful emphasis.
3. Use Mocha Brown for warm atmospheric glows, secondary surfaces and editorial depth.
4. Use Platinum Silver for metallic reflections, neutral information surfaces and quiet borders.
5. Use Pale Lavender sparingly for explanation/AI context, learning and contribution-route accents.
6. Use Linen/Cotton for readable content surfaces and high-contrast light sections where appropriate.
7. Use Rosewood only for critical/security states.
8. Use Botticelli for safe information states and supporting data cues.
9. Do not use neon lime.
10. Do not reintroduce the old indigo or mint palette.
11. Avoid rainbow gradients and uncontrolled multicolor decoration.
12. Preserve readable contrast; decorative color must never reduce legibility.

Add semantic tokens rather than scattered hard-coded colors.

==================================================
6. LIQUID GLASS IMPLEMENTATION
==================================================

Implement a reusable, accessible liquid-glass treatment. Do not apply a huge blur to the entire page.

Create or improve reusable primitives such as:

- GlassHeader / GlassNav
- GlassPanel
- GlassPill / GlassBadge
- GlassButton where appropriate
- GlassStepRail
- GlassMetricCard

Liquid-glass visual requirements:

- translucent dark or light surface with controlled alpha;
- backdrop-filter: blur with saturation where supported;
- subtle 1px inner/outer border;
- top/edge highlight that resembles reflected light;
- soft shadow and a restrained ambient glow;
- faint gradient or noise-like texture created with CSS/SVG, not a huge image;
- rounded corners that match the existing design language;
- clear separation from the page background;
- content remains readable at every viewport.

Use a fallback for browsers without backdrop-filter:

- opaque Black Hole or Coffee Bean surface;
- same border, shadow and hierarchy;
- no loss of contrast or functionality.

The liquid-glass treatment must appear on:

1. Public sticky header.
2. Public feature/menu rail where the workflow or feature navigation is shown.
3. Hero product preview frame.
4. Trust/security callouts.
5. FAQ accordions.
6. Final CTA panel.
7. Authenticated top navigation.
8. Important dashboard/finding/contribution panels where it improves hierarchy.

==================================================
7. LANDING PAGE STRUCTURE
==================================================

Redesign the landing page into a clear visual story:

SECTION A — Header
SECTION B — Hero
SECTION C — Trust strip
SECTION D — How it works
SECTION E — Interactive product preview
SECTION F — Feature grid
SECTION G — Safety section
SECTION H — FAQ
SECTION I — Final CTA
SECTION J — Footer

==================================================
8. MOTION AND INTERACTION
==================================================

Use motion to explain the product, not to decorate randomly. Support prefers-reduced-motion.

==================================================
9. RESPONSIVE REQUIREMENTS
==================================================

Test at minimum: 375x812, 390x844, 768x1024, 1024x768, 1280x800, 1440x900.

==================================================
10. SHARED APP VISUAL SYNC
==================================================

Synchronize across public header, authenticated horizontal header, dashboard metric cards, scan form, findings, readiness score, evidence chain, contribution routes, issue drafts, profile and safety pages.

==================================================
11. ACCESSIBILITY AND CONTENT
==================================================

Semantic landmarks, one h1, accessible button labels, keyboard access, focus states, aria-expanded/aria-controls, contrast, reduced-motion.

==================================================
12. PERFORMANCE
==================================================

Fast CSS/SVG, transform/opacity, lazy below-the-fold, local instant preview.

==================================================
13. TESTING AND VERIFICATION
==================================================

npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e (if present)

Inspect running app in real browser.
