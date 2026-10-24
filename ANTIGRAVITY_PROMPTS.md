# ContribShield OSS — Antigravity Prompts

Use these prompts sequentially. Do not paste all prompts into one session without checking the result after each phase.

## Master context prompt

```text
You are building ContribShield OSS, an English-first evidence-first security and open-source contribution navigator.

Product flow:
Landing → Login/Signup → Dashboard → Scan Repository → Findings → Contributions + Stack → Issue Drafts → Profile.

Use the documents in artifacts/contribshield-docs as the source of truth. Use the reference previews in artifacts/contribshield-ui/previews as the visual source of truth.

Use Next.js App Router, TypeScript, React and custom CSS variables. The default visual theme is Black Hole with Electric Tangerine, Lemon Chiffon, Rosewood, Coffee Bean, Botticelli, Sustainable Linen and Recycled Cotton. Do not use the previous indigo/mint or neon-lime palette.

The authenticated navigation is horizontal: Dashboard, Scan Repository, Findings, Contributions + Stack, Issue Drafts, Profile.

Security rules are mandatory: never execute repository code; never send raw secrets to Gemini; never expose API keys; scanner rules own severity; Gemini only explains validated evidence; no automatic issue publishing, PR creation or merge.

Build real behavior, not clickable placeholders. Add loading, empty, error and success states. Keep a deterministic fallback when Gemini or OSV are unavailable. Run the smallest relevant tests after every phase.
```

## Prompt 1 — Foundation

```text
Create the Next.js TypeScript foundation and global design tokens from DESIGN.md. Add public/authenticated route groups, error handling, validation utilities, and scripts for lint, typecheck, test and build. Do not build fake scan success. Verify the app starts and builds.
```

## Prompt 2 — Landing/auth

```text
Build the reference-driven English landing page and professional login/signup pages. Signup must have email, phone number, password and re-enter password. Login must accept email or phone number plus password. Use the Black Hole/orange/Lemon Chiffon visual system, open widgets, faded GitHub/git/code landing visuals and reduced-motion support. Connect validation and route navigation.
```

## Prompt 3 — Authenticated shell

```text
Build the protected app shell with a sticky horizontal menu: Dashboard, Scan Repository, Findings, Contributions + Stack, Issue Drafts and Profile. Add active route state, profile dropdown, logout, responsive horizontal scrolling and session guards. Test refresh and logout.
```

## Prompt 4 — Scanner

```text
Implement the pure scanner domain and server-side GitHub adapter from SCANNER_RULES.md and EVIDENCE_SCHEMA.md. Fetch bounded public text/configuration files only. Never execute repository code. Add workflow, repository health, secret redaction and technology detection rules with fixture tests.
```

## Prompt 5 — Scan API

```text
Implement POST /api/scans with URL validation, user authorization, bounded GitHub fetching, OSV enrichment, normalized evidence, persistence, caching, rate limits and typed errors. A provider failure must not become a fake successful scan. Wire the Scan Repository screen and Dashboard history to real results.
```

## Prompt 6 — Gemini

```text
Implement a server-only Gemini adapter. Send only redacted, validated evidence bundles. Require English JSON output matching EVIDENCE_SCHEMA.md. Reject unknown finding IDs, severity changes, unsupported claims and secret-like output. Add deterministic fallback templates and explicit fallback UI. Never expose GEMINI_API_KEY to client code.
```

## Prompt 7 — Findings/routes/stack

```text
Build Findings detail, Contributions + Stack, Contribution Impact Graph and deterministic Contribution Readiness scoring. Every route must reference existing evidence, show skills/files/tests/acceptance criteria and persist status. Technology signals must show source paths and confidence.
```

## Prompt 8 — Drafts/profile/safety

```text
Build Markdown issue draft preview/copy/download, disclosure guards, profile settings, theme/font/reduced-motion controls, privacy/safety center, activity history and clear/export controls. Secret and security-disclosure findings must not generate public issue drafts.
```

## Prompt 9 — Final review

```text
Run the complete TESTING CHECKLIST.md. Inspect the browser bundle for API keys, test real GitHub scan success and failure, test Gemini fallback, test mobile horizontal navigation, test accessibility and run production build. Report actual checks and remaining gaps; do not claim unrun checks passed.
```

---

## Runtime Gemini Grounded Templates

### A. Grounded Explanation Prompt (`operation: 'explain'`)

```text
You are a security advisor for open-source contributors and maintainers.
Explain this verified security/health finding in beginner-friendly, constructive English.

DO NOT invent vulnerabilities or change the severity.
Repository: {{repoName}}
Finding ID: {{findingId}}
Finding Title: {{title}}
Category: {{category}}
Deterministic Severity: {{severity}}
File: {{file}} (Line: {{line}})
Verified Evidence:
{{redactedEvidence}}
Impact: {{impact}}

Provide your response in valid JSON matching this exact structure:
{
  "findingIds": ["{{findingId}}"],
  "explanation": "Clear 2-3 sentence explanation of why this issue matters and how it happens",
  "priorityReason": "Specific technical risk to this repository",
  "taskTitle": "Fix {{title}}",
  "taskSummary": "Concrete guidance for the contributor",
  "difficulty": "beginner",
  "skills": ["Skill 1", "Skill 2"],
  "files": ["{{file}}"],
  "testPlan": ["Verify change locally"],
  "acceptanceCriteria": ["Fix is tested and documented"],
  "unsupportedClaims": [],
  "issueMarkdown": null
}
```

### B. Maintainer-Reviewable Issue Draft Prompt (`operation: 'issue'`)

```text
You are an expert open-source contributor drafting a polite, reviewable GitHub issue for maintainers.
Repository: {{repoName}}
Finding: {{title}}
Severity: {{severity}}
File: {{file}}
Evidence (already redacted): {{redactedEvidence}}
Impact: {{impact}}
Suggested Change: {{fixHint}}
Test Plan: {{testPlan}}
Acceptance Criteria: {{acceptanceCriteria}}

Draft a complete, professional GitHub Issue in Markdown format.
Include these exact headers:
### 1. Problem Description
### 2. Evidence
### 3. Security & Operational Impact
### 4. Proposed Solution
### 5. Verification & Test Plan
### 6. Contributor Readiness & Checklist

Do not include raw secrets or disclose private contact details.
```

### C. Bounded Repository Architecture Summary Prompt (`operation: 'summary'`)

```text
Provide a concise 2-sentence architecture and security hygiene summary for repository "{{repoName}}".
Primary languages: {{topLangs}}. Frameworks: {{frameworks}}. Tooling: {{tooling}}.
Readiness score: {{readinessScore}}/100. Total deterministic findings: {{totalFindings}}.
Respond in plain English without bullet points.
```
