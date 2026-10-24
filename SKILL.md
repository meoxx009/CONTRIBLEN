# ContribShield Build Skill for Antigravity

## Mission

Build and maintain ContribShield OSS as an English-first, evidence-first security and contribution navigator. Prefer a small, testable implementation over a broad but unreliable feature set.

## Non-negotiable rules

1. Read `00_README.md`, `PRD.md`, `ARCHITECHTURE.md`, `DESIGN.md` and `SECURITY.md` before changing product behavior.
2. Preserve the horizontal authenticated navigation.
3. Preserve the supplied Black Hole, Electric Tangerine, Lemon Chiffon, Rosewood, Coffee Bean, Botticelli, Linen and Cotton visual system. Do not reintroduce the old indigo/mint palette.
4. Keep all app copy, errors, generated issue drafts and Gemini outputs in professional English.
5. Never execute repository code during a scan.
6. Never send raw secret values to Gemini, storage, logs or issue drafts.
7. Never expose Gemini, Supabase service-role or GitHub secrets to browser code.
8. Scanner rules own finding existence, severity and confidence. AI explains validated evidence only.
9. Do not show a successful scan or AI result when the underlying request failed.
10. Keep a deterministic fallback when Gemini or OSV is unavailable.
11. Add an empty, loading, error and success state for every network-backed screen.
12. Add or update a meaningful test for behavior changes.
13. Use the smallest dependency set that meets the requirement. Do not add a paid service.
14. Do not automatically create public issues, PRs, fixes or merges.

## Preferred implementation behavior

- Use typed domain models and schema validation at integration boundaries.
- Keep scanner logic pure and independent of React, Next.js and database clients.
- Keep API adapters behind interfaces such as `GitHubClient`, `OSVClient` and `GeminiPlanner`.
- Store only redacted evidence and bounded metadata.
- Use server-side routes for GitHub aggregation, OSV calls and Gemini.
- Cache safe public scan results by repository/ref/tree SHA where possible.
- Make UI components reusable and state-driven rather than page-specific copies.
- Use CSS/SVG/Web Animations for the visual system; honor `prefers-reduced-motion`.

## Definition of done

A change is done only when:

- the requested user path works from the real UI;
- the relevant persisted data can be read back;
- error and empty states are handled;
- the smallest meaningful test passes;
- `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` are run when available;
- no secret or unsupported claim appears in output;
- the changed files and actual checks are reported.

## Safe AI contract

Send Gemini a minimum evidence bundle, not a repository dump. Require JSON output, validate it with the project schema, reject unknown finding IDs, and use the deterministic planner if the model fails validation.

## Safe scanner contract

Fetch only public metadata, the bounded tree and selected text/configuration files. Ignore binaries and generated/vendor directories. Never run package managers, shell scripts, workflow files or repository tests as part of a scan.

## Antigravity working style

Implement in phases from `IMPLEMENTATION.md`. After each phase:

1. inspect the diff;
2. run the phase checks;
3. open the relevant route in Chrome;
4. verify the actual user behavior;
5. update the implementation notes before starting the next phase.
