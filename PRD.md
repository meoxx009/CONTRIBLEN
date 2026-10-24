# ContribShield OSS — Product Requirements Document

## 1. Document control

| Field | Decision |
|---|---|
| Product | ContribShield OSS |
| Positioning | Evidence-first security and contribution navigator |
| Primary language | English |
| Primary audience | Students, beginner contributors and open-source maintainers |
| Deployment goal | Free-first web deployment with optional free-tier services |
| AI provider | Gemini through a server-side adapter |
| Authentication | Email + phone + password; no social login in the initial release |
| Source of truth | This folder and the approved implementation plan |

## 2. Product vision

ContribShield finds what is unsafe in an open-source repository and tells the next contributor exactly how to help fix it.

The product connects two workflows that are usually separate:

1. deterministic repository security and health analysis;
2. safe, beginner-friendly open-source contribution onboarding.

The product is not a generic chatbot and not only a scanner dashboard. Its core value is the evidence-to-contribution transformation:

```text
Verified finding → evidence → explanation → contribution route → test plan → issue draft
```

## 3. Problem statement

Security tools commonly produce machine-oriented warnings. A maintainer may understand the warning but still need to write a useful issue. A beginner contributor may want to help but not know:

- which finding is safe to choose;
- which file to edit;
- which skills are required;
- how much time the task will take;
- how to test the change;
- how to describe the work to a maintainer.

ContribShield solves this gap without allowing AI to invent security facts.

## 4. Target users

### 4.1 Beginner contributor

Needs a bounded, repository-specific task with clear skills, files, tests and acceptance criteria.

### 4.2 Intermediate contributor

Needs prioritized findings, technology context and a clear route to a meaningful fix.

### 4.3 Maintainer

Needs evidence-linked, reviewable issue drafts and lower explanation overhead without unsafe disclosure.

The MVP is a single-user workspace. Team roles, organization administration and private-repository workflows are not required for the first release.

## 5. User journey

```text
Landing page
  → Sign up or Login
  → Dashboard
  → Scan Repository
  → Technology snapshot + Findings
  → Finding evidence detail
  → Gemini explanation or deterministic fallback
  → Contribution route
  → Issue draft
  → Copy/download for maintainer review
```

## 6. Information architecture

### Public navigation

```text
ContribShield | Process | Features | Safety | FAQs | Login | Sign up
```

### Authenticated navigation

```text
ContribShield | Dashboard | Scan Repository | Findings | Contributions + Stack | Issue Drafts | Profile
```

The authenticated navigation is horizontal, sticky and responsive. On small screens it becomes horizontally scrollable rather than turning into a permanent sidebar.

## 7. Functional requirements

### FR-01 Landing page

- Explain the product in clear English.
- Show the scan → evidence → contribution → issue workflow.
- Include reference-driven visuals, soft motion and accessible CTAs.
- Provide Login and Sign up actions.
- Include a safety explanation and FAQ accordion.

### FR-02 Authentication

Signup fields:

- email address;
- phone number with country code;
- password;
- re-enter password;
- terms/privacy consent.

Login fields:

- email or phone number;
- password.

The UI must validate fields inline, show password strength, support password visibility toggles and show clear loading/error/success states. Social login is out of scope for the initial release.

### FR-03 Dashboard

Show:

- repositories scanned;
- open findings;
- open contribution routes;
- completed routes;
- recent repositories;
- open contribution progress;
- activity timeline;
- recommended next task;
- latest technology snapshot.

The Dashboard has a prominent Scan Repository action that navigates to the scan page.

### FR-04 Repository scan

Accept a public HTTPS GitHub repository URL and an optional branch/ref. The scan must:

- validate the URL;
- fetch public repository metadata and a bounded tree;
- fetch selected text/configuration files only;
- never execute repository code;
- ignore binary files;
- enforce file and total byte limits;
- run deterministic checks;
- normalize all findings;
- detect languages, frameworks and tooling;
- persist a scan summary for the authenticated user.

### FR-05 Findings

Provide filters for severity and category. Each finding must show:

- title;
- category;
- severity;
- confidence;
- source tool/rule;
- exact file and line when available;
- redacted evidence;
- impact;
- fix hint;
- action to request a grounded explanation;
- action to create a contribution route.

### FR-06 Contributions + Stack

Merge the Technology Stack and Contribution Routes into one feature page. Show:

- detected languages;
- frameworks;
- tooling;
- manifest/configuration files;
- source paths and confidence;
- recommended tasks;
- difficulty;
- estimated effort;
- skills;
- files;
- test plan;
- acceptance criteria;
- Contribution Readiness score.

### FR-07 Issue drafts

Generate a maintainer-reviewable Markdown draft from a selected route. The draft must include problem, evidence, impact, suggested change, test plan and acceptance criteria. It must support copy and download. Automatic public issue creation is not part of the MVP.

### FR-08 Profile

Profile is the final horizontal menu item and includes:

- manage profile;
- appearance/theme;
- font size and font family;
- reduced motion;
- privacy and safety controls;
- activity history;
- data export/clear actions;
- sign out.

## 8. Gemini requirements

Gemini may:

- explain validated evidence;
- prioritize existing findings;
- propose a contributor task;
- identify skills from evidence and detected technologies;
- propose a test plan;
- create acceptance criteria;
- draft issue Markdown;
- summarize repository architecture from bounded metadata.

Gemini may not:

- declare a vulnerability independently;
- change deterministic severity or confidence;
- receive raw secret values;
- execute repository code;
- publish issues or create pull requests;
- approve or merge changes.

Every model request and response is tied to an existing `finding_id` or `scan_id`. Invalid or unsupported output is rejected and replaced with a deterministic fallback.

## 9. Safety and trust requirements

- Public repository access is read-only.
- Repository code is never executed.
- Raw secret values are redacted before storage, model calls, logs and exports.
- Critical or secret findings cannot automatically become public issues.
- Scanner severity comes from deterministic rules.
- Human approval remains required before any external publication.
- API keys never ship to the browser.

## 10. MVP scope

### Must ship

- Landing page and responsive horizontal navigation.
- Email/phone/password signup and email-or-phone login.
- Dashboard with activity and repository history.
- Public GitHub scan.
- JavaScript/Python manifest recognition.
- OSV lookup for supported manifests.
- GitHub Actions checks.
- Repository health checks.
- Basic secret-pattern scan with redaction.
- Technology detection.
- Findings dashboard.
- Gemini explanation/planning adapter with fallback.
- Contributions + Stack page.
- Markdown issue draft export.
- Profile/settings/privacy UI.

### Explicitly deferred

- Private repositories.
- Automatic PR creation, issue publishing or merge.
- Automatic code execution or auto-fix.
- Full AST analysis for every language.
- Organization/team permissions.
- Complete vulnerability database beyond supported OSV manifest queries.
- SMS OTP unless a separately approved provider is configured.

## 11. Acceptance criteria

The product is MVP-complete when a new user can sign up, log in, scan a real public repository, see real findings and technologies, open one finding, receive a grounded Gemini or fallback explanation, create a contribution route, and copy/download a reviewable issue draft. Refreshing the browser must preserve settings and authenticated activity when the configured persistence service is available.

## 12. Success metrics

- A new user reaches a scan from the landing page without guidance.
- At least one real public repository completes a scan without fabricated success.
- Every visible finding has evidence or an explicit repository-level reason.
- A beginner can understand the recommended route without reading scanner documentation.
- Issue drafts contain all required sections and no raw secrets.
- Gemini failure does not break the core workflow.
