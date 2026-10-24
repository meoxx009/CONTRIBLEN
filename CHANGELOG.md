# Changelog

All notable changes to **ContribLens OSS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-24

### Added
- **Core Platform**: Complete Next.js App Router full-stack web application with TypeScript, React 19, and Tailwind CSS.
- **Branding & Visual System**: Official ContribLens OSS branding (*Scan. Understand. Contribute.*) featuring Black Hole dark theme, orange/Lemon Chiffon high-contrast accents, and accessible typography.
- **Authentication**: Supabase Auth with PostgreSQL Row Level Security (RLS) policies.
  - Multi-field registration (Email, Phone number with E.164 normalization, Password with strength meter, and Terms consent).
  - Dual-identifier login (Email or normalized Phone number + Password) with generic error responses to prevent account enumeration.
- **Pure Read-Only Scanner Engine**:
  - Deterministic security auditor for GitHub Actions workflows (`GH-ACTIONS-WRITE-ALL`, `GH-ACTIONS-UNPINNED`, `GH-ACTIONS-PULL-REQUEST-TARGET`, `GH-ACTIONS-CURL-PIPE-SHELL`, `GH-ACTIONS-SCRIPT-INJECTION`, etc.).
  - Dependency manifest parsers for JavaScript (`package.json`) and Python (`requirements.txt`, `pyproject.toml`).
  - Community health checks for `README.md`, `LICENSE`, `SECURITY.md`, and `CONTRIBUTING.md`.
  - Memory-safe secret redaction for PATs, fine-grained tokens, AWS keys, and webhooks.
  - Strict bounded ingestion limits: maximum 60 files, 180 KB per file, 3 MB total repository bytes.
- **OSV.dev Vulnerability Integration**:
  - Batch queries against the open OSV.dev vulnerability database without requiring an API key.
  - Normalization of CVEs and GHSAs into verified evidence records.
- **Gemini Grounded Explanations**:
  - Server-only Gemini API integration with schema-enforced structured JSON output.
  - Strict grounding validation rejecting unevidenced claims, hallucinated IDs, or altered severity levels.
  - High-fidelity deterministic fallback engine when API keys are absent or services are degraded.
- **Actionable Findings & Contribution Planning**:
  - 18-point detailed finding breakdowns with skills required, files to inspect, test guidance, and acceptance criteria.
  - Interactive Contribution Impact Graph and deterministic Contribution Readiness scoring.
  - Technology stack signals with source tracking and confidence scores.
- **Issue Drafts Management**:
  - Complete CRUD for maintainer-ready Markdown issue drafts (create, edit title/body/labels, copy to clipboard, download `.md`, delete).
  - Safety disclosure guards: automated blocking (`DISCLOSURE_BLOCKED`) for secret findings and critical vulnerabilities.
- **Integration Diagnostics**:
  - `npm run check:integrations` CLI and `/api/integrations/status` endpoint to safely diagnose Supabase, GitHub, OSV, and Gemini connections without leaking credentials.
