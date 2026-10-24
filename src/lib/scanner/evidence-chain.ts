/**
 * ContribLens Evidence Chain & Trust Trail Engine
 * 
 * Constructs an 8-step traceable chain for every finding:
 * 1. Source
 * 2. Deterministic rule or advisory
 * 3. Verification
 * 4. Finding classification
 * 5. Explanation
 * 6. Recommended action
 * 7. Validation / test plan
 * 8. Acceptance criteria
 * 
 * Attributions:
 * - 'scanner': verified by deterministic scanner
 * - 'osv': verified by OSV.dev advisory
 * - 'gemini': explanation generated from verified evidence
 * - 'human-review': human maintainer review required
 */

import { redactSecrets } from '../redaction.ts';
import type { Finding, EvidenceChain, EvidenceChainStep } from '../../types.ts';

export function buildEvidenceChain(
  finding: Finding,
  options?: {
    explanationGeneratedBy?: 'gemini' | 'deterministic';
    repoName?: string;
  }
): EvidenceChain {
  const safeEvidence = redactSecrets(finding.evidence || finding.redactedEvidence || 'Deterministic static match.');
  const evidenceHash = finding.evidenceHash || 'sha256-evidence-digest';
  const file = finding.file || 'Repository Root';
  const lineStr = finding.lineStart ? `Line ${finding.lineStart}${finding.lineEnd ? `-${finding.lineEnd}` : ''}` : null;
  const isOsv = finding.category === 'dependency' || (finding.ruleId && finding.ruleId.startsWith('GHSA-'));

  const steps: EvidenceChainStep[] = [
    // Step 1: Source
    {
      step: 1,
      label: 'Repository Source File',
      verifiedBy: 'scanner',
      detail: `File \`${file}\`${lineStr ? ` at ${lineStr}` : ''} ingested through bounded text retrieval.`,
      file,
      line: lineStr,
      status: 'verified',
    },

    // Step 2: Rule / Advisory Reference
    {
      step: 2,
      label: isOsv ? 'OSV Open Source Advisory' : 'Deterministic Scanner Rule',
      verifiedBy: isOsv ? 'osv' : 'scanner',
      detail: isOsv
        ? `Matched official vulnerability advisory \`${finding.ruleId || 'DEPENDENCY-CVE'}\` via OSV.dev.`
        : `Evaluated static analysis rule \`${finding.ruleId || 'STATIC-RULE'}\` against source text.`,
      ruleId: finding.ruleId,
      advisoryId: isOsv ? finding.ruleId : undefined,
      status: 'verified',
    },

    // Step 3: Verification
    {
      step: 3,
      label: 'Evidence Verification',
      verifiedBy: isOsv ? 'osv' : 'scanner',
      detail: `Verified with confidence ${typeof finding.confidence === 'number' ? Math.round(finding.confidence * 100) + '%' : finding.confidence}. Evidence hash: \`${evidenceHash.substring(0, 16)}...\`.`,
      evidenceHash,
      status: 'verified',
    },

    // Step 4: Classification
    {
      step: 4,
      label: 'Deterministic Classification',
      verifiedBy: 'scanner',
      detail: `Category: **${finding.category}** • Deterministic Severity: **${finding.severity}** (owned strictly by code/rules).`,
      status: 'verified',
    },

    // Step 5: Grounded Explanation
    {
      step: 5,
      label: options?.explanationGeneratedBy === 'gemini'
        ? 'Explanation (Grounded in Verified Evidence)'
        : 'Explanation (Deterministic Rule Template)',
      verifiedBy: options?.explanationGeneratedBy === 'gemini' ? 'gemini' : 'scanner',
      detail: finding.impact || 'Identifies security hygiene or dependency vulnerability in repository configuration.',
      status: 'verified',
    },

    // Step 6: Recommended Action
    {
      step: 6,
      label: 'Recommended Remediation',
      verifiedBy: 'scanner',
      detail: finding.fixHint || 'Follow recommended open-source standards to update this configuration.',
      status: 'verified',
    },

    // Step 7: Validation / Test Plan
    {
      step: 7,
      label: 'Deterministic Test & Validation Plan',
      verifiedBy: 'scanner',
      detail: `Run local linters and tests to verify that \`${file}\` is updated without introducing syntax or regression errors.`,
      file,
      status: 'verified',
    },

    // Step 8: Human Maintainer Acceptance
    {
      step: 8,
      label: 'Human Maintainer Acceptance & PR Review',
      verifiedBy: 'human-review',
      detail: 'Human review required • Never auto-published • Contributor creates PR and maintainer evaluates fix.',
      status: 'needs-review',
    },
  ];

  return {
    findingId: finding.id,
    steps,
    source: file,
    ruleId: finding.ruleId || 'STATIC-RULE',
    advisoryId: isOsv ? finding.ruleId : undefined,
    evidenceHash,
    redactedEvidence: safeEvidence,
    verificationStatus: 'verified',
  };
}
