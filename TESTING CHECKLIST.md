# ContribShield OSS — Testing Checklist

## 1. Unit & Regression Tests (`npm run test`)

- [x] **Secret Redaction**: GitHub PAT Classic (`ghp_`), AWS Access Key (`AKIA`) and Secret Access Key masked immediately in memory.
- [x] **URL Parser**: Strict GitHub HTTPS parsing; rejects non-GitHub hosts, invalid formats, and malformed strings.
- [x] **Manifest Parsers**: Accurately extracts dependencies from `package.json`, `requirements.txt`, and `pyproject.toml`.
- [x] **Actions Auditor**: Detects `GH-ACTIONS-WRITE-ALL`, `GH-ACTIONS-UNPINNED`, `GH-ACTIONS-SCRIPT-INJECTION`, and `GH-ACTIONS-CURL-PIPE-SHELL`.
- [x] **Repository Health**: Identifies missing security policy (`SECURITY.md`), missing license, weak README, and absence of test signals.
- [x] **Password Strength**: Validates entropy, length, digit, and symbol requirements without false passes.
- [x] **Evidence Schema**: Validates `FindingEvidence` contract, confidence float (`0..1`), and SHA-256 `evidenceHash`.
- [x] **Gemini Safety Validator**: Rejects unknown finding IDs, non-empty `unsupportedClaims`, invented file paths, and raw secret leaks.
- [x] **Technology Detector**: Identifies 17 languages, package manifests, and test tooling (Playwright, Cypress, Cargo, Go modules).
- [x] **Database & Persistence**: Validates data export without password hashes, cascading account retention purge, and finding review tracking.
- [x] **API Integration Contracts**: Verifies typed error codes (`ContribShieldErrorCode`), bounded architecture summary, and request bundling.
- [x] **Security Acceptance**: Zero secret leakage in serialization or Gemini requests; prompt injection immunity; warning-aware scan status (`complete_with_warnings`).
- [x] **Environment Configuration**: Enforces scan boundaries (60 files, 180KB, 3MB, 20k tree entries), feature toggles, and zero public secret exposure.

---

## 2. Security & Threat Model Audits

- [x] **Zero Code Execution**: Repository code, test scripts, and dependencies are never executed dynamically.
- [x] **Prompt Injection Immunity**: Unsanitized repository text is treated as quoted evidence, never as prompt instructions.
- [x] **Disclosure Policy Enforcement**: `DISCLOSURE_BLOCKED` enforced on `POST /api/issue-drafts` and `POST /api/ai/plan` for secrets and sensitive security findings.
- [x] **Account Existence Obscured**: Login failures use generic credentials copy without leaking whether an email or phone number is registered.
- [x] **Browser Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy: frame-ancestors 'none';`

---

## 3. UI/UX & Chrome Manual Verification Matrix

| Route | Verification Item | Status |
|---|---|---|
| `/` | Landing page luxury Black Hole / Tangerine / Lemon Chiffon theme, hero scan preview, process cards, FAQ | ✅ Verified |
| `/login` | Centered glass card, email or phone login, inline validation, auth state redirect | ✅ Verified |
| `/signup` | Password strength feedback, E.164 phone formatting, terms consent checkbox | ✅ Verified |
| `/forgot-password` | Password reset request form, safe non-revealing feedback | ✅ Verified |
| `/privacy` | Data retention policy, local vs cloud persistence disclosures | ✅ Verified |
| `/safety` | 4-tier disclosure model, AI safety boundaries | ✅ Verified |
| `/app/dashboard` | Summary cards, recent scans, activity timeline, quick Scan CTA | ✅ Verified |
| `/app/scan` | Large repository URL input, animated 8-stage progress state machine | ✅ Verified |
| `/app/findings` | Severity & category filters, finding list and detail views | ✅ Verified |
| `/app/contributions` | Technology signals snapshot, Contribution Impact Graph, readiness score | ✅ Verified |
| `/app/issue-drafts` | Sustainable Linen Markdown preview, copy-to-clipboard, maintainer-reviewable label | ✅ Verified |
| `/app/profile` | Theme, typography, reduced motion toggles, GDPR data export download, clear history | ✅ Verified |
| `/not-found` | Custom 404 page with navigation to dashboard and home | ✅ Verified |

---

## 4. Build & Production Readiness

```bash
npm run typecheck # Passed: 0 errors
npm run test      # Passed: 13/13 suites (100%)
npm run build     # Production build compiled cleanly
```
