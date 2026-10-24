# ContribShield OSS — API Integration Plan

## 1. API principles

- Browser calls only ContribShield application routes.
- Provider keys stay server-side.
- Every request is authenticated when it reads/writes user state.
- Provider failures become typed safe errors.
- External payloads are validated before entering the domain layer.
- Cache public metadata and avoid repeated requests.

## 2. Internal application API

### `POST /api/auth/signup`

Request:

```json
{
  "email": "student@example.com",
  "phone": "+919876543210",
  "password": "...",
  "passwordConfirmation": "...",
  "acceptedTerms": true
}
```

Behavior:

- validate email, E.164 phone and password policy;
- ensure passwords match;
- create the auth identity through Supabase/persistence;
- create the user profile with a unique normalized phone;
- never return a password or provider secret.

### `POST /api/auth/login`

Request:

```json
{
  "identifier": "email@example.com or +919876543210",
  "password": "..."
}
```

The server resolves a phone identifier to the linked auth email without exposing the mapping to the browser, then creates the session. Error text must not reveal whether an email or phone exists.

### `POST /api/scans`

Request:

```json
{
  "repositoryUrl": "https://github.com/owner/repository",
  "ref": "main",
  "checks": ["dependencies", "github-actions", "secrets", "repository-health", "technology"]
}
```

Response:

```json
{
  "ok": true,
  "scanId": "uuid",
  "repository": { "fullName": "owner/repository", "ref": "main" },
  "summary": { "findings": 7, "high": 2, "medium": 3, "low": 2 },
  "technologies": { "languages": [], "frameworks": [], "tooling": [], "manifests": [] },
  "warnings": []
}
```

### `GET /api/scans/[scanId]`

Returns the authenticated user's scan summary, technologies, health and redacted findings.

### `POST /api/ai/plan`

Request:

```json
{
  "operation": "explain | route | issue | summary",
  "scanId": "uuid",
  "findingIds": ["workflow-permission-001"]
}
```

The server loads the evidence itself. Do not trust client-supplied evidence.

### `POST /api/issue-drafts`

Creates or regenerates a redacted Markdown draft from a user-owned route. It does not publish to GitHub.

## 3. GitHub integration

Use server-side fetch to:

```text
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/git/trees/{ref}?recursive=1
GET https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}
```

Rules:

- validate owner, repo, ref and path;
- reject private/unavailable repositories for MVP;
- set a clear User-Agent and Accept header;
- enforce file count, file size and total byte limits;
- use tree SHA/ref caching;
- do not fetch every file;
- do not use clone, shell, git binary or package manager execution.

Unauthenticated GitHub API limits can be low. An optional server-only `GITHUB_TOKEN` may be configured with the minimum read-only public access needed. Never ask users to paste a token into the chat or store it in browser storage.

## 4. OSV integration

Use OSV for supported dependency manifests. Prefer the batch endpoint when multiple package/version queries exist:

```text
POST https://api.osv.dev/v1/querybatch
```

Validate package names, ecosystems, versions and advisory response shape. Cache advisory results by ecosystem/package/version. If OSV fails, keep the scan usable and label dependency enrichment as unavailable.

## 5. Gemini integration

Use a server-side adapter with a configurable model. Do not hardcode a model that may disappear; configure `GEMINI_MODEL` with a currently enabled Flash model.

The adapter must:

- send only the minimal redacted evidence bundle;
- require English JSON output;
- set a short timeout;
- cap request and response size;
- validate output against `EVIDENCE_SCHEMA.md`;
- reject unsupported claims and unknown IDs;
- cache safe results by operation/evidence hash;
- fall back to deterministic templates.

Recommended operations:

```text
explain  → plain-English risk explanation
route    → task, skills, files, tests and acceptance criteria
issue    → maintainer-reviewable Markdown
summary  → bounded repository architecture summary
```

## 6. Error codes

```text
AUTH_INVALID_INPUT
AUTH_INVALID_CREDENTIALS
AUTH_PROVIDER_UNAVAILABLE
GITHUB_INVALID_URL
GITHUB_NOT_FOUND
GITHUB_PRIVATE_OR_UNAVAILABLE
GITHUB_RATE_LIMITED
GITHUB_TREE_TRUNCATED
GITHUB_FILE_LIMIT
OSV_UNAVAILABLE
GEMINI_UNAVAILABLE
GEMINI_INVALID_OUTPUT
DISCLOSURE_BLOCKED
PERSISTENCE_FAILED
```

Return safe messages to the browser and log detailed provider information only in redacted server logs.

## 7. API rate and cost controls

- Per-user scan rate limit.
- Maximum concurrent scans per user.
- Cache by repository/ref/tree SHA.
- Cap Gemini requests per scan and per user/day.
- Do not call Gemini for every finding automatically.
- Generate AI output only after explicit user action.
- Cache validated AI results by evidence hash.
- Show quota/fallback states clearly.
