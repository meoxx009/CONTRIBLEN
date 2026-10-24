# ContribShield OSS — Build Documentation

## Purpose

This repository is the implementation source of truth for the ContribShield OSS webapp. It consolidates the decisions from the product discussion into an Antigravity-ready plan for a professional, English-first, fully working application.

ContribShield is an evidence-first security and contribution navigator:

```text
Public GitHub repository
        ↓
Read-only deterministic scan
        ↓
Exact evidence and technology snapshot
        ↓
Gemini explanation and prioritization
        ↓
Beginner-friendly contribution route
        ↓
Maintainer-reviewable issue draft
```

## Final product decisions

- The public landing page is the first screen.
- The landing page has a horizontal marketing navigation with Login and Sign up.
- Authentication initially uses email, phone number, password and password confirmation on signup.
- Login accepts email or phone number plus password.
- The authenticated app uses a sticky horizontal navigation, never a permanent sidebar.
- The authenticated menu is: Dashboard, Scan Repository, Findings, Contributions + Stack, Issue Drafts, Profile.
- The primary app language is English.
- The default visual mode is Black Hole/dark premium mode.
- The visual system follows the supplied references: black luxury background, orange ambient glow, warm cream surfaces, spacious widgets and restrained premium motion.
- Gemini explains and plans from validated evidence. It never discovers a finding, reads raw secrets, executes code or publishes a security issue automatically.
- Public repositories are scanned read-only. Repository code is never executed.
- The MVP is free-first: public GitHub APIs, OSV, Supabase free tier where configured, static/serverless deployment and a deterministic fallback when Gemini is unavailable.

## Read order for Antigravity

1. `00_README.md`
2. `PRD.md`
3. `SKILL.md`
4. `ARCHITECHTURE.md` (and `ARCHITECTURE.md`)
5. `DESIGN.md`
6. `ROUTES_AND_STATES.md` (and `ROUTES_AND_UI_STATES.md`)
7. `EVIDENCE_SCHEMA.md` (and `EVIDENCE_AND_AI_SCHEMAS.md`)
8. `SCANNER_RULES.md`
9. `DATABASE.md` (and `DATABASE_AND_PERSISTENCE.md`)
10. `API INTEGRATION.md` (and `API_INTEGRATION_PLAN.md`)
11. `SECURITY.md`
12. `ENVIRONMENT.md` (and `ENVIRONMENT_AND_CONFIGURATION.md`)
13. `IMPLEMENTATION.md` (and `IMPLEMENTATION_PLAN.md`)
14. `ANTIGRAVITY_PROMPTS.md`
15. `TESTING CHECKLIST.md` (and `TESTING_CHECKLIST.md`)
16. `DEPLOYMENT.md`

`ARCHITECHTURE.md` keeps the filename requested by the product owner. `ARCHITECTURE.md` is provided as a correctly-spelled compatibility alias.

## Design asset location

Reference-driven SVG previews are in:

```text
artifacts/contribshield-ui/previews/
```

Important assets:

- `01-landing-page.svg`
- `02-auth-login-signup.svg`
- `03-dashboard.svg`
- `04-scan-repository.svg`
- `05-findings.svg`
- `06-contributions-stack.svg`
- `07-issue-drafts.svg`
- `08-profile-safety.svg`
- `preview-gallery.html`

## How to use these documents

Antigravity should implement one phase at a time, run the phase checks, and preserve existing working behavior. It must not replace real API failures with fake success states and must not introduce a paid dependency without approval.

## Target copy location

The requested Windows destination is:

```text
C:\Users\ezyre\Documents\24 OCT\DOCS
```

The current worker sandbox cannot write to that external path. The completed documents are generated in the workspace at:

```text
C:\Users\ezyre\omnirush.ai\artifacts\contribshield-docs
```

Use `COPY_TO_24_OCT_DOCS.ps1` from the project root to copy this folder to the requested destination on the Windows machine.
