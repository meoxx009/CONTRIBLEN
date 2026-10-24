# ContribShield OSS — Deployment Guide

## 1. Overview

ContribShield OSS is designed for zero-cost, free-first MVP deployment on serverless or container platforms:
- **Hosting Platform**: Vercel, Netlify, Render, or Node.js Docker container.
- **Persistence**: Supabase PostgreSQL with Row Level Security (RLS) for multi-user production, or atomic file-based persistence for single-instance demo mode.
- **External APIs**: GitHub REST API (with optional read-only `GITHUB_TOKEN`), OSV.dev batch queries (free, public), Google Gemini API (free-tier Flash model).

---

## 2. Environment Variables Checklist

Set these environment variables in your deployment platform (e.g. Vercel Project Settings > Environment Variables):

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public / Browser | Canonical HTTPS URL of your deployed application (e.g. `https://contribshield.example.com`) |
| `JWT_SECRET` | Server-Only | Cryptographically random secret string for session tokens (32+ chars) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser | Supabase project URL (`https://xyzcompany.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Supabase service role secret (Never expose to client!) |
| `GEMINI_API_KEY` | Server-Only | Google AI Studio API key |
| `GEMINI_MODEL` | Server-Only | Default: `gemini-2.5-flash` |
| `GEMINI_API_TIMEOUT_MS` | Server-Only | Default: `15000` |
| `GITHUB_TOKEN` | Server-Only | Optional read-only PAT for 5000 req/hr GitHub rate limit |
| `SCAN_MAX_FILES` | Server-Only | Default: `60` |
| `SCAN_MAX_FILE_BYTES` | Server-Only | Default: `180000` |
| `SCAN_MAX_TOTAL_BYTES` | Server-Only | Default: `3000000` |
| `SCAN_MAX_TREE_ENTRIES` | Server-Only | Default: `20000` |
| `ENABLE_GEMINI` | Server-Only | Default: `true` (Falls back to deterministic planner if `false`) |
| `ENABLE_OSV` | Server-Only | Default: `true` |
| `ENABLE_DEMO_MODE` | Server-Only | Default: `false` (Must never be true in production) |

---

## 3. Database Migration (Supabase)

When connecting production Supabase:
1. Open your Supabase Project Dashboard > **SQL Editor**.
2. Run the migration file:
   [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
3. Confirm tables created: `profiles`, `user_preferences`, `repositories`, `scans`, `findings`, `contribution_routes`, `issue_drafts`, `activity_events`.
4. Confirm RLS is enabled on all tables with `auth.uid()` policies.

---

## 4. Production Build & Verification

```bash
# 1. Install dependencies
npm install

# 2. Verify static types
npm run typecheck

# 3. Run regression test suite (13 test suites)
npm run test

# 4. Generate optimized Next.js production build
npm run build

# 5. Start production server
npm start
```

---

## 5. Security & Browser Headers

Production instances automatically serve the following HTTP headers (configured in `next.config.mjs`):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: frame-ancestors 'none';`
