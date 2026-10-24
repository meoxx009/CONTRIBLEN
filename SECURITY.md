# ContribLens OSS — Security Policy & Security Model

## 1. Security Principle

```text
Code verifies. Gemini explains. Human approves.
```

**ContribLens OSS** is an evidence-first open-source security and contribution navigator. It is designed to assist developers and maintainers in discovering, understanding, and remediating repository hygiene and security issues safely.

---

## 2. Reporting a Security Vulnerability

If you discover a security vulnerability within ContribLens itself, please do not file a public GitHub issue.

Please report vulnerabilities privately via email:
- **Email**: `security@contriblens.org`
- **Response Window**: You will receive an initial response within 48 hours.
- **Coordination**: We will coordinate with you on responsible disclosure and timeline.

---

## 3. Threat Model & Protections

### A. Malicious Repository Scanning
- **No Code Execution**: ContribLens NEVER executes code from scanned repositories (`npm install`, `python setup.py`, etc.).
- **Bounded Ingestion**: Bounded file count (`SCAN_MAX_FILES = 60`), file size (`SCAN_MAX_FILE_BYTES = 180 KB`), and total bytes (`SCAN_MAX_TOTAL_BYTES = 3 MB`). Binary, minified, vendor, and generated files are skipped.
- **Untrusted Input**: Repository content is treated strictly as quoted evidence, never as instructions or commands.

### B. Prompt Injection Resistance
- Scanned repository text cannot override system prompts, modify severity levels, manipulate confidence, or alter disclosure rules.
- Grounding verification rejects unknown finding IDs and unevidenced claims.

### C. Secret Exposure & Redaction
- High-entropy tokens, GitHub PATs, AWS access keys, and Slack webhooks are redacted immediately in memory before any storage, logging, or AI explanation calls.
- Raw secret strings are masked (`ghp_****`, `AKIA************MPLE`, `[REDACTED_AWS_SECRET_KEY]`).
- Evidence hashes are SHA-256 digests of redacted text.

### D. Public Issue Disclosure Policy

| Finding Category | Disclosure Mode | Policy |
| :--- | :--- | :--- |
| Missing documentation / License | `PUBLIC_ISSUE_ALLOWED` | Public issue draft allowed for maintainer review |
| CI/CD Workflow Hygiene | `PUBLIC_ISSUE_ALLOWED` | Public issue draft allowed |
| Unpinned GitHub Action SHA | `MAINTAINER_REVIEW` | Recommended maintainer review |
| Dependency Vulnerability (CVE/GHSA) | `MAINTAINER_REVIEW` | Depends on exploitability; maintainer disclosure guidance |
| Detected Secret / Credential | `DISCLOSURE_BLOCKED` | **Public issue draft strictly blocked.** Private maintainer notification instructions provided. |
| Critical Production RCE | `DISCLOSURE_BLOCKED` | **Public issue draft strictly blocked.** |

---

## 4. Environment Secrets & Zero-Trust Key Handling

The canonical environment variable names are:
- `GITHUB_TOKEN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `SUPABASE_SERVICE_ROLE_KEY`

Rules:
1. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed via `NEXT_PUBLIC_` or sent to the browser.
2. `GEMINI_API_KEY` and `GITHUB_TOKEN` are strictly server-only.
3. If `GEMINI_API_KEY` is absent, ContribLens falls back deterministically to rule-based explanation templates.
4. If `GITHUB_TOKEN` is absent, ContribLens falls back to unauthenticated public GitHub API requests.
5. OSV.dev batch vulnerability queries require no API key.
