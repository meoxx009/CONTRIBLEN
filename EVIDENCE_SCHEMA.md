# ContribShield OSS — Evidence and AI Schemas

## 1. Design rule

Every scanner result is normalized into the same evidence contract. The contract is the boundary between deterministic code and Gemini.

```text
Code verifies → evidence schema → Gemini explains → validator accepts/rejects
```

## 2. Finding schema

```ts
type FindingCategory =
  | "dependency"
  | "github-actions"
  | "secret"
  | "repository-health";

type Severity = "critical" | "high" | "medium" | "low" | "info";

type DisclosureMode =
  | "public-issue"
  | "maintainer-review"
  | "security-disclosure";

interface FindingEvidence {
  id: string;
  scanId: string;
  category: FindingCategory;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: number; // 0..1
  sourceTool: string;
  file: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  evidence: string; // redacted or non-secret evidence only
  impact: string;
  fixHint: string;
  disclosureMode: DisclosureMode;
  redacted: boolean;
  evidenceHash: string;
  createdAt: string;
}
```

## 3. Evidence rules

- `id` is stable for the scan and rule/location combination.
- `ruleId` maps to `SCANNER_RULES.md`.
- `confidence` must be between 0 and 1.
- `file` must be a normalized repository-relative path or `null`.
- `lineStart` and `lineEnd` are one-based when known.
- `evidence` must never contain raw secret values.
- `redacted` is `true` for secret-related evidence.
- `evidenceHash` is a one-way hash of normalized redacted evidence, not a raw secret hash.
- `disclosureMode` is deterministic and cannot be changed by Gemini.

## 4. Technology snapshot

```ts
interface TechnologySnapshot {
  languages: TechnologySignal[];
  frameworks: TechnologySignal[];
  tooling: TechnologySignal[];
  manifests: ManifestSignal[];
}

interface TechnologySignal {
  name: string;
  confidence: number;
  sources: string[];
}

interface ManifestSignal {
  type: "package.json" | "package-lock.json" | "requirements.txt" | "pyproject.toml" | "workflow" | "other";
  file: string;
  present: boolean;
}
```

## 5. Contribution route schema

```ts
interface ContributionRoute {
  id: string;
  scanId: string;
  findingIds: string[];
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  skills: string[];
  files: string[];
  suggestedChange: string;
  testPlan: string[];
  acceptanceCriteria: string[];
  readiness: {
    securityImpact: number;
    evidenceConfidence: number;
    testAvailability: number;
    documentationClarity: number;
    difficultyPenalty: number;
    total: number;
  };
  status: "not-started" | "in-progress" | "needs-review" | "completed";
}
```

## 6. Gemini request contract

Gemini receives only the minimum bundle required for the selected operation.

```ts
interface GeminiPlanRequest {
  operation: "explain" | "route" | "issue" | "summary";
  scanId: string;
  findingIds: string[];
  evidence: FindingEvidence[];
  technologies: TechnologySnapshot;
  outputLanguage: "en";
}
```

Before sending, the server must:

1. load the user-owned findings from the database;
2. ignore any client-supplied severity or evidence values;
3. redact again defensively;
4. remove unnecessary file contents;
5. enforce size limits;
6. add an instruction that every claim must be grounded in the supplied finding IDs.

## 7. Gemini response contract

```ts
interface GeminiPlanResponse {
  findingIds: string[];
  explanation: string;
  priorityReason: string;
  taskTitle: string;
  taskSummary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  skills: string[];
  files: string[];
  testPlan: string[];
  acceptanceCriteria: string[];
  unsupportedClaims: string[];
  issueMarkdown: string | null;
}
```

Reject the response when:

- an unknown finding ID is referenced;
- `unsupportedClaims` is not empty;
- files are not present in evidence or repository metadata;
- the model changes deterministic severity/confidence;
- raw secret-like content is detected;
- required fields are missing;
- Markdown contains a secret or an automatic publication instruction.

## 8. Fallback planner

The deterministic fallback uses rule metadata and templates. It must always produce a useful explanation for supported rules without claiming that Gemini was used.
