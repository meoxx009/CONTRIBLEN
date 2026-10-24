# ContribShield OSS — Database and Persistence

## 1. Persistence strategy

Use Supabase PostgreSQL with Row Level Security for authenticated production mode. Local storage may be used only for a clearly labelled demo mode and must not store passwords or provider secrets.

## 2. Core tables

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | FK to `auth.users.id`, primary key |
| `display_name` | text | Optional |
| `username` | text | Optional, unique when present |
| `phone_e164` | text | Unique when present; format validated |
| `bio` | text | Optional, length-limited |
| `experience_level` | text | beginner/intermediate/advanced |
| `created_at` | timestamptz | Server-generated |
| `updated_at` | timestamptz | Server-generated |

### `user_preferences`

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to profiles |
| `theme` | text | black-hole/linen/system |
| `font_size` | text | small/medium/large |
| `font_family` | text | system/inter/manrope/grotesk |
| `reduce_motion` | boolean | Default false |
| `ai_explanations` | boolean | Default true |
| `save_scan_history` | boolean | Default true |
| `updated_at` | timestamptz | Server-generated |

### `repositories`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `owner` | text | GitHub owner |
| `name` | text | GitHub repository name |
| `full_name` | text | Unique owner/name |
| `url` | text | Canonical HTTPS URL |
| `default_branch` | text | Last known default branch |
| `last_scanned_at` | timestamptz | Nullable |
| `created_at` | timestamptz | Server-generated |

### `scans`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner |
| `repository_id` | uuid | FK |
| `ref` | text | Branch/ref |
| `commit_sha` | text | Reproducibility when available |
| `status` | text | running/complete/complete_with_warnings/failed |
| `error_code` | text | Nullable safe code |
| `files_scanned` | integer | Count only |
| `bytes_scanned` | integer | Count only |
| `technologies` | jsonb | Bounded normalized snapshot |
| `health` | jsonb | Bounded normalized health summary |
| `created_at` | timestamptz | Server-generated |

### `findings`

Store the fields from `EVIDENCE_SCHEMA.md`. Do not store raw file contents. Store only redacted evidence, hashes, paths, line numbers and normalized impact/fix text.

### `contribution_routes`

Store the fields from `EVIDENCE_SCHEMA.md`, including the deterministic score breakdown and status.

### `issue_drafts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner |
| `scan_id` | uuid | FK |
| `route_id` | uuid | FK |
| `title` | text | Length-limited |
| `markdown` | text | Redacted, validated Markdown |
| `disclosure_mode` | text | public-issue/maintainer-review/security-disclosure |
| `status` | text | draft/reviewed/exported |
| `created_at` | timestamptz | Server-generated |
| `updated_at` | timestamptz | Server-generated |

### `activity_events`

Store low-sensitivity events such as `scan_completed`, `finding_reviewed`, `route_started`, `draft_created` and `route_completed`. Do not store raw provider payloads.

## 3. Row Level Security

- Users can read/update only their own profile and preferences.
- Users can read/write only repositories, scans, findings, routes, drafts and events linked to their user ID.
- Server-side service-role operations are isolated to trusted routes and never exposed to the browser.
- Public repository metadata may be cached globally only when it contains no user-private state.

## 4. Retention and deletion

- Provide `Clear local history` for browser mode.
- Provide account-level export and deletion for production mode.
- Delete child scans/findings/routes/drafts when a user requests account deletion, unless a separately approved audit-retention policy exists.
- Never retain raw secrets or raw repository file contents by default.

## 5. Indexes

Recommended indexes:

- `scans(user_id, created_at desc)`;
- `findings(scan_id, severity)`;
- `contribution_routes(user_id, status)`;
- `issue_drafts(user_id, updated_at desc)`;
- unique `repositories(full_name)`;
- unique `profiles(phone_e164)` when non-null.
