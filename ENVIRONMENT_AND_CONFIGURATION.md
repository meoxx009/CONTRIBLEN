# ContribShield OSS — Environment and Configuration

## 1. Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## 2. Environment variables

```env
# Public application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase public browser-safe values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only Supabase value; never use in client code
SUPABASE_SERVICE_ROLE_KEY=

# Gemini server-only configuration
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_API_TIMEOUT_MS=15000

# Optional server-only GitHub token for higher public API limits.
# Use a minimum-scope token and never expose it to the browser.
GITHUB_TOKEN=

# Scan limits
SCAN_MAX_FILES=60
SCAN_MAX_FILE_BYTES=180000
SCAN_MAX_TOTAL_BYTES=3000000
SCAN_MAX_TREE_ENTRIES=20000

# Feature controls
ENABLE_GEMINI=true
ENABLE_OSV=true
ENABLE_DEMO_MODE=false
```

## 3. Environment rules

- Only values intentionally safe for the browser may use `NEXT_PUBLIC_`.
- Never put `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or `GITHUB_TOKEN` in a public variable.
- Validate required production variables at startup.
- Do not silently enable demo mode in production.
- If `ENABLE_GEMINI=false`, the deterministic planner must remain available.

## 4. Supabase configuration

1. Create a free Supabase project.
2. Enable email/password authentication.
3. Create the profile, preference, repository, scan, finding, route, draft and activity tables.
4. Enable RLS and apply policies from `DATABASE.md`.
5. Configure email confirmation according to the deployment need.
6. Store the public URL and anon key in `NEXT_PUBLIC_*` variables.
7. Store the service-role key only in server/deployment secrets.

Phone numbers are collected and normalized as an account identifier. SMS OTP is not part of the initial free scope. If phone verification is later added, it must use a separately configured SMS provider.

## 5. Gemini configuration

1. Create a Gemini API key through the approved Google AI setup.
2. Set `GEMINI_API_KEY` only in server/deployment secrets.
3. Set `GEMINI_MODEL` to a currently available Flash model.
4. Test a grounded explanation with a synthetic finding.
5. Confirm fallback works by disabling the key temporarily.

Free quotas and model availability can change. The app must never assume unlimited calls.

## 6. Production checklist

- All required variables set in deployment platform.
- `.env*` ignored by git except `.env.example`.
- HTTPS enabled.
- Supabase redirect URLs configured.
- Gemini route server-only.
- Rate limits enabled.
- Error monitoring redacts request payloads.
