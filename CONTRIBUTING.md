# Contributing to ContribLens OSS

Thank you for your interest in contributing to **ContribLens OSS** (*Scan. Understand. Contribute.*)!

ContribLens helps beginners discover meaningful open-source contribution opportunities by scanning public GitHub repositories, verifying security/dependency/health findings, explaining them in plain English, and converting verified findings into actionable contribution plans and maintainer issue drafts.

---

## Code of Conduct

All contributors are expected to uphold the [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations to `support@contriblens.org`.

---

## Core Security & Architectural Principles

When writing code or adding scanner rules, you must strictly observe these core invariants:

1. **Pure Read-Only Scanner Engine**:
   - The scanner **NEVER** executes repository code under any circumstances (`npm install`, `eval`, Python execution, shell commands, etc. are strictly forbidden).
   - Only bounded text files and known configuration manifests are fetched via the GitHub API.
2. **Zero Secret Leakage**:
   - Never log, store, export, or send unredacted secrets or credentials.
   - Redaction rules must mask tokens (`ghp_****`, AWS key masks, etc.) before evidence hashing or presentation.
   - Never send raw secrets to Gemini or include them in client browser bundles.
3. **Deterministic Truth & Grounded AI**:
   - Vulnerabilities, manifest dependencies, and health files are verified deterministically via code and OSV.dev.
   - Gemini is used solely to generate plain-English explanations for pre-verified evidence. Gemini can never invent findings, change severity, or alter findings IDs.
4. **Manual Maintainer Review**:
   - Issue drafts are generated for human review. ContribLens never auto-publishes issues or auto-creates pull requests on external repositories.

---

## Getting Started Locally

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/contriblens/contriblens.git
   cd contriblens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: For local testing and development, Supabase and Gemini are optional. ContribLens includes local JSON database persistence and deterministic explanation fallbacks.)*

4. **Verify integration status**:
   ```bash
   npm run check:integrations
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Checks

Before submitting a pull request, run all verification steps:

```bash
# 1. Check integration diagnostics
npm run check:integrations

# 2. Run ESLint
npm run lint

# 3. Verify TypeScript types
npm run typecheck

# 4. Run test suites
npm run test

# 5. Build production bundle
npm run build
```

All 5 checks must pass cleanly with zero warnings or errors.

---

## Pull Request Guidelines

1. Create a descriptive feature branch: `git checkout -b feature/my-new-rule`.
2. Follow the ContribLens design system tokens and semantic HTML.
3. Keep scanner rules deterministic and add corresponding unit tests in `scripts/run-tests.mjs` or `test/security-scanner.test.mjs`.
4. Ensure no secrets, tokens, or environment files (`.env.local`) are committed.
5. Fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
