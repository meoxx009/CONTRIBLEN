# ContribShield OSS — Application Architecture

## 1. Architecture goals

The application must be:

- fully usable from a normal Chrome browser;
- free-first and deployable on free tiers;
- safe when GitHub, OSV or Gemini fail;
- deterministic at the security-detection layer;
- evidence-linked at every recommendation;
- componentized enough for Antigravity to extend safely;
- testable without a browser at the scanner/domain layer;
- responsive from mobile to large desktop;
- privacy-preserving by default.

## 2. Recommended greenfield stack

| Layer | Choice | Reason |
|---|---|---|
| Web framework | Next.js App Router + TypeScript | UI and secure server routes in one free-deployable app |
| UI | React + custom CSS variables/CSS modules | Exact reference-driven visual control without paid UI kits |
| Validation | Zod or the existing project validator | Runtime validation at every external boundary |
| Auth/database | Supabase Auth + PostgreSQL | Free-first email/password auth, RLS and persistence |
| Scanner | Pure TypeScript domain modules | Deterministic, testable and independent of UI |
| GitHub/OSV | Server-side `fetch` adapters | CORS, rate limits and caching are controlled centrally |
| Gemini | Server-side Gemini adapter | API key never reaches the browser |
| Testing | Vitest + Testing Library + Playwright | Unit, component and Chrome journey coverage |
| Hosting | Vercel/Cloudflare Pages or equivalent free tier | Simple Next.js/serverless deployment |

Do not add a second UI framework, ORM, chart system or state-management library unless a concrete requirement justifies it.

## 3. System overview

```text
┌──────────────────────────────────────────────────────────┐
│ Presentation layer                                       │
│ Landing · Auth · Dashboard · Scan · Findings             │
│ Contributions + Stack · Issue Drafts · Profile           │
└──────────────────────────────┬───────────────────────────┘
                               │ typed view models
┌──────────────────────────────▼───────────────────────────┐
│ Application layer                                         │
│ route guards · use cases · orchestration · auth context  │
│ scan orchestration · AI request validation               │
└──────────────────────────────┬───────────────────────────┘
                               │ domain inputs/outputs
┌──────────────────────────────▼───────────────────────────┐
│ Domain layer                                              │
│ evidence schema · scanner rules · technology detector    │
│ severity rules · contribution scoring · issue builder    │
└──────────────────────────────┬───────────────────────────┘
                               │ ports/adapters
┌──────────────────────────────▼───────────────────────────┐
│ Integration/data layer                                   │
│ GitHub · OSV · Gemini · Supabase · cache · rate limits   │
└──────────────────────────────────────────────────────────┘
```

The domain layer must never import React, Next.js request objects, Supabase clients or the Gemini SDK.

## 4. Request/data flow

### Scan flow

```text
Browser scan form
  → POST /api/scans
  → validate URL and authenticated user
  → GitHub metadata/tree adapter
  → bounded text fetcher
  → pure scanner modules
  → OSV adapter for supported manifests
  → evidence normalization
  → technology detection
  → database persistence of redacted results
  → scan response view model
```

### AI flow

```text
Finding detail / contribution route
  → POST /api/ai/plan
  → authorize finding ownership
  → build minimal redacted evidence bundle
  → Gemini adapter
  → JSON schema validation
  → evidence-reference validation
  → persist generated explanation/route/draft
  → return English UI model
```

## 5. Suggested project structure

```text
app/
  page.tsx                         # landing page
  login/page.tsx
  signup/page.tsx
  (app)/layout.tsx                 # authenticated shell + horizontal nav
  (app)/dashboard/page.tsx
  (app)/scan/page.tsx
  (app)/findings/page.tsx
  (app)/findings/[findingId]/page.tsx
  (app)/contributions/page.tsx
  (app)/issue-drafts/page.tsx
  (app)/profile/page.tsx
  api/auth/signup/route.ts
  api/auth/login/route.ts
  api/scans/route.ts
  api/scans/[scanId]/route.ts
  api/ai/plan/route.ts
  api/issue-drafts/route.ts

src/
  components/
    marketing/
    auth/
    shell/
    dashboard/
    scan/
    findings/
    contributions/
    issue-drafts/
    profile/
    safety/
  domain/
    evidence/
    scanner/
    technology/
    contributions/
    issue-drafts/
  integrations/
    github/
    osv/
    gemini/
    supabase/
  lib/
    validation/
    redaction/
    hashing/
    rate-limit/
    errors/
  styles/
    tokens.css
    globals.css
  types/
    index.ts

tests/
  unit/
  integration/
  e2e/
```

## 6. State boundaries

- URL/page state: filters, selected finding, active route.
- Server state: scans, findings, routes, drafts and activity.
- User preference state: theme, font size, font family, reduced motion.
- Auth state: Supabase session only; never store raw credentials.
- Temporary UI state: scan progress, modal state, toasts.

Prefer server components for read-heavy pages and client components only where interaction is required.

## 7. Free-first deployment modes

### Local/demo mode

- Supabase is optional.
- Local fixtures can demonstrate the UI.
- Never label fixture data as a real scan.

### Public MVP mode

- Supabase Auth/database configured.
- Server routes call GitHub and OSV.
- Gemini is optional; deterministic fallback remains enabled.
- Deploy on a free Next.js-compatible host.

## 8. Failure isolation

- GitHub failure: show a scan error; do not create findings.
- OSV failure: keep deterministic manifest/technology results and mark dependency lookup unavailable.
- Gemini failure: show deterministic explanation and allow issue draft generation from evidence/templates.
- Database failure: show a retryable persistence error; never silently claim saved state.

# Architecture filename alias

The product-owner requested filename is `ARCHITECHTURE.md`. The full architecture specification is stored there:

```text
ARCHITECHTURE.md
```

Read that file as the canonical architecture document.

