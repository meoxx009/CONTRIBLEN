# ContribShield OSS — Deterministic Scanner Rules

## 1. Scanner boundaries

- Public GitHub repositories only in the MVP.
- Read metadata, recursive tree and bounded text/configuration files.
- Ignore binary, vendor, generated and dependency-install directories.
- Never execute repository code, package managers, shell scripts or workflows.
- Maximum selected files: 60 by default.
- Maximum file size: 180 KB by default.
- Maximum total text: 3 MB by default.
- Return warnings when a repository is truncated; do not claim a complete scan.

## 2. GitHub Actions rules

### `GH-ACTIONS-WRITE-ALL`

Trigger: `permissions: write-all` at workflow or job scope.

- Category: `github-actions`
- Default severity: high
- Default confidence: 0.98
- Fix: declare minimum required permissions at workflow/job scope.
- Disclosure: `public-issue` unless repository context requires maintainer review.

### `GH-ACTIONS-UNPINNED`

Trigger: third-party `uses:` reference with a mutable tag or branch instead of a full commit SHA.

- Category: `github-actions`
- Default severity: medium
- Default confidence: 0.90
- Fix: pin the action to a reviewed commit SHA and optionally retain a comment with the tag.

### `GH-ACTIONS-MISSING-PERMISSIONS`

Trigger: no explicit permissions in a workflow where the repository context makes default token access unclear.

- Category: `github-actions`
- Default severity: low/medium, never automatically high.
- Default confidence: 0.72.
- Explain that repository/org defaults can affect actual access.
- Recommend explicit least-privilege permissions.

### `GH-ACTIONS-PULL-REQUEST-TARGET`

Trigger: `pull_request_target` with suspicious checkout or write behavior.

- Category: `github-actions`
- Default severity: high when evidence shows unsafe untrusted input handling; otherwise medium.
- Require contextual evidence before escalating.

### `GH-ACTIONS-CURL-PIPE-SHELL`

Trigger: `curl ... | bash/sh` or equivalent remote script execution in a workflow.

- Category: `github-actions`
- Default severity: high/medium based on source and permissions.
- Fix: pin/download/verify scripts or use a trusted action.

## 3. Dependency rules

Supported manifests for MVP:

- `package.json` and lockfiles;
- `requirements.txt`;
- `pyproject.toml`.

OSV is the advisory source. The scanner must pass package name/version or ecosystem queries to OSV and normalize advisory IDs. If OSV is unavailable, report dependency lookup as unavailable rather than inventing a vulnerability.

### Dependency severity

Use advisory severity when present. If an advisory has no severity, keep `severity: medium` only as a review priority and mark the reason as `OSV advisory did not provide severity`.

## 4. Repository health rules

### `REPO-MISSING-LICENSE`

Missing `LICENSE`, `LICENSE.md` or recognized license file. Default: low, confidence 0.99.

### `REPO-MISSING-SECURITY`

Missing `SECURITY.md`. Default: low, confidence 0.99.

### `REPO-MISSING-CONTRIBUTING`

Missing `CONTRIBUTING.md`. Default: low, confidence 0.99.

### `REPO-WEAK-README`

README is missing or below the configured minimum structure. Default: low, confidence 0.78.

### `REPO-NO-TEST-SIGNAL`

No recognized test directory/configuration/script. Default: low, confidence 0.70. This is a missing signal, not proof that tests do not exist.

## 5. Secret rules

Patterns include GitHub tokens, AWS access key shapes, Slack tokens, private key headers, bearer tokens and carefully constrained generic key assignments.

Output only:

```text
<prefix or type> + redacted mask + suffix when safe
```

Never output the raw match, raw line, raw file content or raw value to Gemini, logs, storage or issue Markdown.

Secret findings default to:

- severity: high when pattern confidence is high;
- disclosure: `security-disclosure`;
- public issue generation: blocked.

## 6. Technology detection

Detect from bounded file paths and manifest content:

- languages: JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, C/C++, C#, Swift, Kotlin, Shell, YAML, SQL, HTML and CSS;
- frameworks: React, Next.js, Vue, Express, FastAPI, Django and Flask;
- tooling: GitHub Actions, npm, pip, Cargo, Go modules, Docker, pytest, Jest, Vitest, Playwright and Cypress.

Each signal stores source paths and confidence. Path-only signals are lower confidence than manifest-backed signals.

## 7. False-positive handling

- Findings must expose confidence and source rule.
- Repeated matches in the same file/rule should be deduplicated.
- Fixture/test files may be scanned but should be marked in evidence metadata.
- Do not call a repository secure because no rule matched.
- Allow the user to mark a finding as reviewed, not to silently delete scanner evidence.
