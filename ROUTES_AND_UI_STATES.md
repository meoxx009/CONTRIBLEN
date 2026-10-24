# ContribShield OSS — Routes and UI States

## 1. Public routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Email/phone login | Public |
| `/signup` | Account creation | Public |
| `/forgot-password` | Email password reset | Public |
| `/privacy` | Privacy notice | Public |
| `/safety` | Safety model and disclosure | Public |

## 2. Authenticated routes

| Route | Menu label | Purpose |
|---|---|---|
| `/app/dashboard` | Dashboard | Activity, history and next action |
| `/app/scan` | Scan Repository | Start and monitor a scan |
| `/app/findings` | Findings | Filter and inspect findings |
| `/app/findings/[findingId]` | Findings detail | Evidence and explanation |
| `/app/contributions` | Contributions + Stack | Technology and contribution routes |
| `/app/contributions/[routeId]` | Route detail | Task, tests and acceptance |
| `/app/issue-drafts` | Issue Drafts | Review and export Markdown |
| `/app/profile` | Profile | Account, appearance, safety and data |

## 3. Authentication states

```text
anonymous → signup_submitting → authenticated
anonymous → login_submitting → authenticated
anonymous → auth_error
authenticated → signing_out → anonymous
```

Protected routes redirect to `/login?next=<encoded-route>` when no session exists. After login, redirect to the requested route or `/app/dashboard`.

## 4. Scan states

```text
idle
  → validating
  → fetching_metadata
  → fetching_tree
  → fetching_files
  → analyzing
  → enriching_dependencies
  → persisting
  → complete
```

Failure states:

```text
invalid_url
not_found
private_or_unavailable
rate_limited
tree_too_large
network_error
dependency_lookup_unavailable
persist_failed
```

The UI must distinguish `complete_with_warnings` from `complete`.

## 5. Gemini states

```text
not_requested
building_evidence_bundle
requesting
validating_response
complete
fallback_used
failed
```

`fallback_used` is a valid user-facing state, not a silent failure.

## 6. Empty states

- No scans: explain how to scan a public repository.
- No findings: say that no supported deterministic findings were detected; do not say the repository is secure.
- No routes: explain that routes are created from findings and repository health gaps.
- No drafts: provide a link to Findings.
- No activity: show the first scan CTA.

## 7. Error display rules

- Use English, actionable copy.
- Keep raw provider errors out of the UI.
- Provide a safe user message and a correlation ID for support/debug logs.
- Preserve user input when retrying a scan.
- Never clear saved settings or history because a network request failed.
