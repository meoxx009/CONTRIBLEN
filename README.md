# ContriBLens OSS

> **Scan. Understand. Contribute.**  
> An open-source security intelligence and contribution navigator that empowers developers to inspect public repositories, verify vulnerabilities and hygiene gaps deterministically, understand technical risks with grounded AI explanations, and produce maintainer-ready contribution blueprints.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.28-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live Application:** [https://contri-b-lens.vercel.app/](https://contri-b-lens.vercel.app/)  
**GitHub Repository:** [https://github.com/meoxx009/CONTRIBLEN](https://github.com/meoxx009/CONTRIBLEN)

---

## 🧭 Overview & Core Architecture

New contributors often struggle with two major obstacles when approaching open source:
1. **Uncertainty about where to start**: Massive codebases can be intimidating. Identifying approachable, verified issues with clear test plans and acceptance criteria is difficult.
2. **Hallucination & security risks**: Generic generative AI tools often invent vulnerabilities, fabricate file paths, or risk leaking repository credentials.

ContriBLens solves this with an **evidence-first, read-only analysis pipeline**:
```text
Public GitHub Scan ──► Deterministic AST/Manifest Verification ──► OSV Vulnerability Query
                                                                         │
                                                                         ▼
Maintainer-Ready Issue Draft ◄── Test Plan & Acceptance ◄── Grounded Gemini Explanation
```

---

## ✨ Implemented Core Features

1. **Deterministic Repository Scanner (`/scan`)**:
   - Ingests public repositories via GitHub REST API with strict safety bounds (max 60 files, 180 KB per file, 3 MB total size, 20,000 tree entries).
   - **Zero code execution guarantee**: ContriBLens never executes repository scripts (`npm install`, `setup.py`, arbitrary shell).
   - Instant in-memory secret masking with SHA-256 evidence hashing before any storage or external transmission.

2. **Technology Stack Detection & Architecture Profiling (`/contributions`)**:
   - Detects programming languages with file count, percentage, and confidence metrics.
   - Extracts web and backend frameworks with exact declared versions (`Next.js`, `React`, `Vue.js`, `Nuxt`, `Svelte`, `Express`, `FastAPI`, `Django`, `Flask`).
   - Identifies package managers (`pnpm`, `Yarn`, `Bun`, `npm`, `Poetry`, `pip`, `Cargo`, `Go modules`) from lockfiles and `packageManager` manifest fields.
   - Parses package manifests and catalogs declared production, development, and peer dependencies.
   - Audits development tooling: Linters (`ESLint`, `Biome`, `Ruff`), Formatters (`Prettier`, `Black`), Testing suites (`Jest`, `Vitest`, `Playwright`, `Cypress`, `Pytest`), and CI/CD (`GitHub Actions`, `GitLab CI`).

3. **18-Point Verified Finding Breakdown (`/findings/[findingId]`)**:
   - Traceable Evidence Chain (8 verifiable trust steps).
   - Explicit scope confirmation: clearly documents what was verified vs. what is not confirmed (e.g. runtime exploitability).
   - Depth-tailored perspectives: explanations adjusted for Beginner, Developer, and Maintainer mindsets without modifying deterministic severity.

4. **Grounded AI Explanations & Repository Context**:
   - Powered by Google Gemini (`@google/genai`) with low temperature (0.2) and strict JSON schema validation.
   - Rejects hallucinated findings, unknown IDs, and invented file paths.
   - Automatically injects verified repository context (languages, frameworks, package managers, tools) into explanations.
   - 100% resilient offline fallback engine when API keys are not provided.

5. **Actionable Contribution Routes (`/contributions/[routeId]`)**:
   - Contribution Readiness scoring (0–100) based on test suite signals, linter presence, CI configuration, and documentation clarity.
   - Step-by-step verification plans and acceptance criteria tailored to contributor experience level.
   - One-click exportable Contribution Packs (`.md`) and maintainer-reviewable issue drafts.

6. **Issue Drafts Management (`/drafts`)**:
   - Full draft lifecycle: creation, editing, Markdown preview, and clipboard export.
   - **Safety Disclosure Guard**: Automatically blocks public issue draft generation for credentials, raw tokens, and high-risk exploitable vulnerabilities to prevent accidental public disclosure.

7. **Multi-Identifier Authentication & User Settings (`/login`, `/signup`, `/profile`)**:
   - Dual-identifier authentication supporting both Email and E.164 normalized Phone numbers.
   - Real-time password strength meter and explicit Terms of Service consent tracking.
   - User preferences: dark/light theme, font scale, typography modes, and reduced motion.
   - Integration Diagnostics panel reporting real-time connectivity status for Supabase, GitHub, OSV, and Gemini.

---

## 🏛️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15.5 (App Router, Server Actions, Dynamic API Routes) |
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS 3.4, Lucide Icons |
| **Typography** | Berkelium Sans & Ferdinand styling with resilient system fallbacks |
| **AI Integration** | Google Gemini API (`@google/genai`) with schema enforcement & deterministic fallback |
| **Security & Auditing**| Deterministic AST patterns, OSV.dev Batch API, SHA-256 evidence hashing |
| **Data Persistence** | Dual-mode: Supabase PostgreSQL (Row-Level Security) & Local JSON store |
| **Deployment** | Vercel (Edge-compatible headers, serverless API execution) |

---

## 📁 Repository Directory Structure

```text
CONTRIBLEN/
├── public/                 # Static assets, SVG branding, and font documentation
│   ├── fonts/              # Licensing guide and specifications for webfonts
│   ├── contrilens-logo.svg # Vector brandmark
│   └── favicon.svg         # Favicon icon
├── scripts/                # Verification, testing, and diagnostic scripts
│   ├── run-tests.mjs       # Comprehensive 28-suite test orchestrator
│   └── check-integrations.mjs # Non-secret connectivity diagnostics
├── src/
│   ├── app/                # Next.js App Router (pages and API endpoints)
│   │   ├── api/            # Server-only REST route handlers (auth, scans, findings, routes, drafts)
│   │   ├── app/            # Authenticated application views
│   │   └── globals.css     # Global theme, font tokens, and utility classes
│   ├── components/         # Reusable UI components and application views
│   │   ├── ui/             # Glass panels, cards, step rails, badges, buttons
│   │   └── views/          # ScanView, DashboardView, ContributionsView, FindingsView
│   ├── lib/                # Core domain logic
│   │   ├── scanner/        # Deterministic scanner, manifests, health, tech detector
│   │   ├── gemini.ts       # Grounded AI adapter and fallback planners
│   │   ├── redaction.ts    # In-memory secret detection and masking
│   │   └── db.ts           # Unified data persistence adapter (Supabase + Local)
│   └── types.ts            # Canonical TypeScript schemas and interfaces
├── test/                   # Automated unit and fixture tests
│   ├── fixtures/           # Bounded repository fixtures, manifests, workflows
│   └── security-scanner.test.mjs # Dedicated scanner and tech-detector test suite
├── .env.example            # Documented environment variable template
├── next.config.mjs         # Production Next.js configuration with security headers
├── package.json            # Scripts and project dependencies
├── tailwind.config.ts      # Custom theme color tokens and typography configuration
└── tsconfig.json           # Strict TypeScript configuration
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0` (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/meoxx009/CONTRIBLEN.git
cd CONTRIBLEN
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env.local` configuration:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Supabase credentials (defaults to local database if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Google Gemini API (defaults to deterministic planner if omitted)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gamma-4

# Optional: GitHub token to increase API rate limit (60 -> 5,000 req/hr)
GITHUB_TOKEN=your-github-personal-access-token
```

> **Zero-Config Local Development**: You can run ContriBLens immediately without external accounts or credentials. The application automatically uses the local persistence engine (`.data/`) and deterministic rule engines when external keys are not provided.

### 4. Run Diagnostics
Verify environment integrity and integration availability:
```bash
npm run check:integrations
```

### 5. Launch the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🚀 Production Deployment (Vercel)

ContriBLens is optimized for one-click deployment on [Vercel](https://vercel.com/):

### Option A: Deploy via Vercel Dashboard

1. Push your repository to GitHub: `https://github.com/meoxx009/CONTRIBLEN`.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `meoxx009/CONTRIBLEN` repository.
4. Framework Preset will automatically detect **Next.js**.
5. Configure the Environment Variables in the Vercel project settings:
   - `NEXT_PUBLIC_APP_URL` — Your production domain (e.g. `https://contri-b-lens.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (Secret)
   - `GEMINI_API_KEY` — Google Gemini API key (Secret)
   - `GITHUB_TOKEN` — GitHub Personal Access Token (Secret)
   - `JWT_SECRET` — A secure random string for session tokens
6. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
vercel --prod
```

---

## 🧪 Testing & Quality Assurance

ContriBLens enforces comprehensive testing across all critical data paths:

| Test Script | Description |
| :--- | :--- |
| `npm run typecheck` | Strict TypeScript validation without emitting files (`tsc --noEmit`) |
| `npm run lint` | Next.js ESLint validation |
| `npm test` | Complete 28-suite integration test verifying redaction, URL validation, manifest parsing, actions auditing, readiness calculation, and issue generation |
| `npm run test:scanner` | Dedicated 24-test suite validating repository boundaries, tech detector, lockfile detection, and Gemini explanation context |
| `npm run build` | Compiles optimized Next.js production bundle and verifies all 43 static/dynamic routes |

Execute all checks in sequence:
```bash
npm run typecheck
npm run lint
npm test
npm run test:scanner
npm run build
```

---

## 🔒 Security Model & Secret Handling

- **Immediate In-Memory Redaction**: Credentials (GitHub tokens, AWS keys, Slack tokens, private keys) are masked at ingestion using strict regular expressions.
- **No Secret Persistence**: Raw secrets are never saved to disk, never stored in databases, and never transmitted to external APIs.
- **Cryptographic Evidence Hashing**: Every finding's evidence is cryptographically digested with SHA-256 for integrity verification.
- **Prompt Injection Defense**: Repository content is encapsulated within untrusted quotation boundaries when processed by AI models.
- **Responsible Disclosure Guards**: Findings with secrets or critical vulnerabilities automatically block public draft generation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
ContriBLens OSS — Copyright (c) 2026.
