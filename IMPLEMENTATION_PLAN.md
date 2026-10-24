# ContribShield OSS — Implementation Plan

## 1. Execution method

Build in small vertical slices. Each phase must leave the app runnable. Do not build a static visual shell and postpone all behavior; connect each screen to its real state/data contract as soon as the screen exists.

## 2. Phase 0 — Project setup

### Deliverables

- Next.js App Router + TypeScript project;
- custom CSS token system from `DESIGN.md`;
- lint, typecheck, unit and build scripts;
- `.env.example`;
- basic error boundary and not-found page;
- docs copied into the project.

### Check

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## 3. Phase 1 — Reference-driven landing page

### Deliverables

- black/orange luxury background;
- Lemon Chiffon CTA;
- horizontal marketing nav;
- hero scan dashboard visual;
- faded GitHub/git/code drop cards;
- process section;
- feature cards;
- safety section;
- FAQ accordion;
- reduced-motion behavior.

### Check

Open `/` in Chrome at desktop and mobile widths. Confirm all links and animations have useful reduced-motion behavior.

## 4. Phase 2 — Authentication

### Deliverables

- `/login` and `/signup`;
- email, phone, password and confirmation validation;
- Supabase session integration;
- secure server-side phone identifier resolution;
- protected route redirect;
- logout;
- forgot-password email flow.

### Check

Signup, login by email, login by phone, refresh, logout and invalid credentials.

## 5. Phase 3 — App shell and Dashboard

### Deliverables

- sticky horizontal authenticated menu;
- active route state;
- profile dropdown;
- dashboard summary cards;
- recent repositories;
- activity timeline;
- open contribution progress;
- quick Scan Repository CTA.

### Check

Refresh persistence, mobile menu scroll and protected route behavior.

## 6. Phase 4 — Scanner domain

### Deliverables

- URL parser;
- bounded GitHub adapter;
- text-file selector;
- workflow scanner;
- repository health scanner;
- secret scanner/redactor;
- technology detector;
- evidence schema and fixture tests.

### Check

Run fixture tests with a known workflow, manifest, missing docs and fake secret. Confirm raw secret never appears in serialized output.

## 7. Phase 5 — Scan API and persistence

### Deliverables

- `POST /api/scans`;
- scan status/persistence;
- OSV enrichment;
- typed error states;
- repository/history dashboard integration;
- caching and rate limits.

### Check

Run a real public repository scan and a provider failure test.

## 8. Phase 6 — Findings

### Deliverables

- filters and sorting;
- finding list/detail;
- exact evidence view;
- source/rule/confidence display;
- disclosure label;
- review status.

### Check

Open high, medium, low and secret findings. Verify secret public-output block.

## 9. Phase 7 — Gemini and fallback

### Deliverables

- server-only Gemini adapter;
- prompt versioning;
- JSON schema validation;
- evidence-reference validation;
- deterministic fallback planner;
- AI quota/error states;
- cached valid outputs.

### Check

Test valid Gemini response, malformed response, unknown ID and disabled API key.

## 10. Phase 8 — Contributions + Stack

### Deliverables

- technology snapshot panels;
- route recommendation;
- Contribution Impact Graph;
- deterministic readiness score;
- route status and persistence;
- test plan and acceptance criteria.

### Check

Select a finding and confirm route evidence, file and skill links.

## 11. Phase 9 — Issue drafts and profile safety

### Deliverables

- Markdown draft generator;
- preview/copy/download;
- profile settings;
- theme/font/reduced-motion preferences;
- safety/privacy center;
- data export/clear controls.

### Check

Generate a workflow issue, generate a secret finding and confirm public issue is blocked, refresh settings and verify persistence.

## 12. Phase 10 — Release hardening

- run all tests in `TESTING CHECKLIST.md`;
- audit browser bundle for secrets;
- verify security headers;
- test free deployment;
- test slow/failing providers;
- update README and deployment steps;
- create a handoff with actual commands and known gaps.

## 13. Implementation rules

- Do not build future features before the current phase passes.
- Do not use mock success data in a real scan route.
- Keep fixture data under `tests/fixtures`, labelled clearly.
- Keep all generated text in English.
- Prefer an honest fallback over a broken AI-dependent flow.
