/**
 * ContribLens Evidence Normalizer & Schema Contracts
 * 
 * Normalizes all scanner findings into the unified FindingEvidence contract:
 * Code verifies → evidence schema → Gemini explains → validator accepts/rejects
 */

import { computeEvidenceHash } from '../redaction.ts';
import type {
  FindingEvidence,
  FindingCategory,
  Severity,
  DisclosureMode,
  TechnologySnapshot,
  TechStack,
} from '../../types.ts';

export function createFindingEvidence(params: {
  scanId: string;
  category: FindingCategory;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: number | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceTool: string;
  file: string | null;
  lineStart?: number | null;
  lineEnd?: number | null;
  evidence: string;
  impact: string;
  fixHint: string;
  disclosureMode?: DisclosureMode;
  redacted?: boolean;
}): FindingEvidence {
  // Normalize confidence (0..1)
  let numConfidence = 0.85;
  if (typeof params.confidence === 'number') {
    numConfidence = Math.max(0, Math.min(1, params.confidence));
  } else if (params.confidence === 'HIGH') {
    numConfidence = 0.95;
  } else if (params.confidence === 'MEDIUM') {
    numConfidence = 0.75;
  } else if (params.confidence === 'LOW') {
    numConfidence = 0.5;
  }

  // Determine disclosure mode
  let disclosureMode: DisclosureMode = 'maintainer-review';
  if (params.category === 'secret') {
    disclosureMode = 'security-disclosure';
  } else if (params.category === 'repository-health' || params.category === 'health') {
    disclosureMode = 'public-issue';
  }
  if (params.disclosureMode) {
    disclosureMode = params.disclosureMode;
  }

  const isRedacted = params.redacted ?? (params.category === 'secret');
  const safeEvidence = (params.evidence || '').trim();
  const evidenceHash = computeEvidenceHash(safeEvidence);

  // Stable ID across repeated scans for identical rule and file location
  const fileClean = params.file ? params.file.replace(/[^a-zA-Z0-9_-]/g, '_') : 'root';
  const lineClean = params.lineStart ? `_L${params.lineStart}` : '';
  const id = `fnd_${params.ruleId}_${fileClean}${lineClean}`.slice(0, 80);

  return {
    id,
    scanId: params.scanId,
    category: params.category,
    ruleId: params.ruleId,
    title: params.title,
    severity: params.severity,
    confidence: numConfidence,
    sourceTool: params.sourceTool,
    file: params.file,
    lineStart: params.lineStart ?? null,
    lineEnd: params.lineEnd ?? params.lineStart ?? null,
    evidence: safeEvidence,
    impact: params.impact,
    fixHint: params.fixHint,
    disclosureMode,
    redacted: isRedacted,
    evidenceHash,
    createdAt: new Date().toISOString(),
    // Backward compatibility aliases
    line: params.lineStart ?? undefined,
    redactedEvidence: safeEvidence,
  };
}

export function convertToTechnologySnapshot(techStack: TechStack): TechnologySnapshot {
  return {
    languages: techStack.languages.map((l) => ({
      name: l.name,
      confidence: l.confidence ?? (l.percentage > 30 ? 0.95 : 0.75),
      sources: l.sources && l.sources.length > 0 ? l.sources : [`${l.filesCount} detected source files`],
    })),
    frameworks: techStack.frameworks.map((f) => ({
      name: f.name,
      confidence: f.confidence ?? 0.95,
      sources: f.sources && f.sources.length > 0 ? f.sources : [f.category],
    })),
    tooling: techStack.tooling.map((t) => ({
      name: t.name,
      confidence: t.confidence ?? 0.90,
      sources: t.sources && t.sources.length > 0 ? t.sources : [t.category],
    })),
    manifests: techStack.manifests.map((m) => ({
      type: (['package.json', 'requirements.txt', 'pyproject.toml'].includes(m.path)
        ? m.path
        : 'other') as any,
      file: m.path,
      present: true,
    })),
  };
}
