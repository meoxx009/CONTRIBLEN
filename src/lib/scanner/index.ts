/**
 * ContribLens Scanner Orchestrator
 * 
 * Runs deterministic checks, normalizes findings, detects tech stack, and stores results.
 * Strictly adheres to read-only operation with bounded fetch limits and zero code execution.
 */

import {
  parseGitHubUrl,
  fetchRepoMetadata,
  fetchBoundedRepositoryTree,
  BoundedFile,
} from './github';
import {
  parsePackageJson,
  parseRequirementsTxt,
  parsePyprojectToml,
  ParsedDependency,
} from './manifests';
import { queryOSVBatch } from './osv';
import { scanGitHubActions } from './actions';
import { checkRepositoryHealth } from './health';
import { detectTechnologyStack } from './tech-detector.ts';
import { detectSecretsInText } from '../redaction.ts';
import { createFindingEvidence } from './evidence.ts';
import { triageFinding } from './readiness.ts';
import { buildEvidenceChain } from './evidence-chain.ts';
import { compareScans, computeFindingFingerprint } from './diff.ts';
import { db } from '../db.ts';
import type { Finding, FindingEvidence, ScanSummary, TechStack } from '../../types.ts';

/**
 * Pure Deterministic Scanner Domain Function
 * Analyzes bounded files in memory without external side effects or network calls.
 * Adheres strictly to zero code execution, pattern redaction, and EVIDENCE_SCHEMA.md.
 */
export function scanRepositoryFiles(
  files: BoundedFile[],
  scanId: string,
  repoMeta?: { licenseName?: string; repoName?: string },
  checks?: string[]
): {
  findings: FindingEvidence[];
  techStack: TechStack;
  readinessScore: number;
  parsedDeps: ParsedDependency[];
} {
  const allFindings: Finding[] = [];
  const parsedDeps: ParsedDependency[] = [];
  let packageJsonData: { dependencies: Array<{ name: string }>; scripts: Record<string, string> } | undefined;
  const pythonDeps: Array<{ name: string }> = [];

  const shouldRunCheck = (name: string) => {
    if (!checks || checks.length === 0) return true;
    return checks.some((c) => c.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.toLowerCase()));
  };

  const runSecrets = shouldRunCheck('secret');
  const runDependencies = shouldRunCheck('dependenc') || shouldRunCheck('manifest');
  const runActions = shouldRunCheck('action') || shouldRunCheck('workflow');
  const runHealth = shouldRunCheck('health');
  const runTechnology = shouldRunCheck('technolog');

  // 1. Scan files individually
  for (const file of files) {
    const lowerPath = file.path.toLowerCase();

    // A. Secret scanning with redaction
    if (runSecrets) {
      const secrets = detectSecretsInText(file.path, file.content);
      for (const sec of secrets) {
        allFindings.push({
          id: `fnd_sec_${Math.random().toString(36).substring(2, 9)}`,
          scanId,
          title: sec.title,
          category: 'secret',
          severity: sec.severity,
          confidence: sec.confidence,
          sourceTool: 'Secret Pattern Redaction Scanner',
          ruleId: sec.ruleId,
          file: file.path,
          line: sec.line,
          redactedEvidence: sec.redactedEvidence,
          impact: 'Exposed secret credentials can allow unauthorized access to sensitive accounts and infrastructure.',
          fixHint: 'Revoke and rotate this credential immediately. Add this file to .gitignore and use GitHub Secrets or environment variables instead.',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // B. JavaScript manifest analysis
    if (runDependencies && lowerPath.endsWith('package.json')) {
      const parsedPkg = parsePackageJson(file.path, file.content);
      parsedDeps.push(...parsedPkg.dependencies);
      packageJsonData = {
        dependencies: parsedPkg.dependencies.map((d) => ({ name: d.name })),
        scripts: parsedPkg.scripts,
      };
    }

    // C. Python manifest analysis
    if (runDependencies) {
      if (lowerPath.endsWith('requirements.txt')) {
        const reqs = parseRequirementsTxt(file.path, file.content);
        parsedDeps.push(...reqs);
        pythonDeps.push(...reqs.map((r) => ({ name: r.name })));
      } else if (lowerPath.endsWith('pyproject.toml')) {
        const poetryReqs = parsePyprojectToml(file.path, file.content);
        parsedDeps.push(...poetryReqs);
        pythonDeps.push(...poetryReqs.map((r) => ({ name: r.name })));
      }
    }

    // D. GitHub Actions CI/CD checks
    if (runActions && lowerPath.includes('.github/workflows/') && (lowerPath.endsWith('.yml') || lowerPath.endsWith('.yaml'))) {
      const actionFindings = scanGitHubActions(file.path, file.content, scanId);
      allFindings.push(...actionFindings);
    }
  }

  // 2. Repository Health Checks
  let healthScore = 100;
  if (runHealth) {
    const healthResult = checkRepositoryHealth(files, scanId, repoMeta?.licenseName);
    allFindings.push(...healthResult.findings);
    healthScore = healthResult.healthScore;
  }

  // 3. Technology stack detection
  let techStack: TechStack = {
    languages: [],
    frameworks: [],
    tooling: [],
    manifests: [],
    confidenceScore: 100,
  };
  let techReadiness = 100;

  if (runTechnology) {
    const detected = detectTechnologyStack(
      files,
      packageJsonData,
      pythonDeps
    );
    techStack = detected.techStack;
    techReadiness = detected.readinessScore;
  }

  // Blended Contribution Readiness Score (0 to 100)
  const combinedReadiness = Math.round((healthScore * 0.5) + (techReadiness * 0.5));

  // Deduplicate repeated matches in the same file/rule per SCANNER_RULES.md Section 7
  const seenKeys = new Set<string>();
  const deduplicatedFindings: Finding[] = [];

  for (const f of allFindings) {
    const key = `${f.ruleId}:${f.file || 'root'}:${f.line || f.lineStart || 1}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);

      // Mark fixture/test files in evidence per SCANNER_RULES.md
      const isTestFile = Boolean(
        f.file && /test[s]?\/|fixture[s]?\/|mock[s]?\/|__tests?__\/|\.test\.|\.spec\./i.test(f.file)
      );

      const fixHintWithFixture = isTestFile
        ? `${f.fixHint} [Note: Located in test/fixture file; ensure credentials/configurations are intentionally non-sensitive test data.]`
        : f.fixHint;

      deduplicatedFindings.push({
        ...f,
        fixHint: fixHintWithFixture,
      });
    }
  }

  // Normalize all findings strictly to FindingEvidence contract
  const normalizedFindings = deduplicatedFindings.map((f) =>
    createFindingEvidence({
      scanId,
      category: f.category,
      ruleId: f.ruleId || 'GENERIC-SECURITY-RULE',
      title: f.title,
      severity: f.severity,
      confidence: f.confidence,
      sourceTool: f.sourceTool || 'ContribLens Scanner',
      file: f.file || null,
      lineStart: f.lineStart ?? f.line ?? null,
      lineEnd: f.lineEnd ?? f.line ?? null,
      evidence: f.evidence || f.redactedEvidence || '',
      impact: f.impact,
      fixHint: f.fixHint,
      disclosureMode: f.disclosureMode,
      redacted: f.redacted,
    })
  );

  return {
    findings: normalizedFindings,
    techStack,
    readinessScore: combinedReadiness,
    parsedDeps,
  };
}

export async function executeRepositoryScan(
  repoUrl: string,
  userId: string,
  branch?: string,
  checks?: string[]
): Promise<{ scan: ScanSummary; findings: Finding[]; warnings?: string[] }> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  const scanId = `scn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Fetch metadata
  const meta = await fetchRepoMetadata(owner, repo);
  const targetBranch = branch?.trim() || meta.defaultBranch || 'main';

  // 2. Fetch bounded file tree
  const { files, totalFilesIndexed, totalBytes, warnings } = await fetchBoundedRepositoryTree(
    owner,
    repo,
    targetBranch
  );

  // 3. Execute pure in-memory deterministic scan
  const { findings: deterministicFindings, techStack, readinessScore, parsedDeps } = scanRepositoryFiles(
    files,
    scanId,
    { licenseName: meta.licenseName, repoName: `${owner}/${repo}` },
    checks
  );

  const allFindings = [...deterministicFindings];

  // 4. OSV.dev batch vulnerability queries (when ENABLE_OSV !== 'false')
  const isOsvEnabled = process.env.ENABLE_OSV !== 'false';
  const shouldRunDeps = !checks || checks.some((c) => c.toLowerCase().includes('dependenc') || c.toLowerCase().includes('osv'));
  if (isOsvEnabled && shouldRunDeps && parsedDeps.length > 0) {
    try {
      const osvFindings = await queryOSVBatch(parsedDeps, scanId);
      allFindings.push(...osvFindings);
    } catch (osvErr) {
      console.warn('OSV.dev query throttled or unavailable, continuing with deterministic findings:', osvErr);
      warnings.push('OSV.dev dependency advisory query was temporarily unavailable. Deterministic scanner results preserved.');
    }
  }

  // Count findings by severity
  const findingsCount = {
    total: allFindings.length,
    critical: allFindings.filter((f) => String(f.severity).toUpperCase() === 'CRITICAL').length,
    high: allFindings.filter((f) => String(f.severity).toUpperCase() === 'HIGH').length,
    medium: allFindings.filter((f) => String(f.severity).toUpperCase() === 'MEDIUM').length,
    low: allFindings.filter((f) => String(f.severity).toUpperCase() === 'LOW').length,
    info: allFindings.filter((f) => String(f.severity).toUpperCase() === 'INFO').length,
  };

  // 5. Calculate Contribution Readiness, Urgency, Fingerprint, and Evidence Chain for all findings
  const enrichedFindings: Finding[] = allFindings.map((f) => {
    const triage = triageFinding(f, {
      filesCount: files.length,
      hasTestFiles: files.some((file) => /test|spec|fixture/i.test(file.path)),
    });
    const chain = buildEvidenceChain(f, { repoName: `${owner}/${repo}` });
    const fingerprint = computeFindingFingerprint(f);

    return {
      ...f,
      readiness: triage.readiness,
      urgencyScore: triage.urgencyScore,
      urgencyLabel: triage.urgencyLabel,
      evidenceChain: chain,
      fingerprint,
    };
  });

  // 6. Scan Comparison against previous scan of this user on same repo & branch
  const previousScans = db.getScans(userId).filter(
    (s) =>
      s.repoName.toLowerCase() === `${owner}/${repo}`.toLowerCase() &&
      s.branch === targetBranch &&
      s.id !== scanId
  );
  const previousScan = previousScans.length > 0 ? previousScans[0] : undefined;
  const previousFindings = previousScan ? db.getFindings(previousScan.id) : undefined;

  const initialSummary: ScanSummary = {
    id: scanId,
    userId,
    repoUrl: `https://github.com/${owner}/${repo}`,
    repoName: `${owner}/${repo}`,
    owner,
    branch: targetBranch,
    scannedAt: new Date().toISOString(),
    totalFiles: totalFilesIndexed,
    totalBytes,
    status: (warnings && warnings.length > 0) ? 'complete_with_warnings' : 'completed',
    readinessScore,
    techStack,
    warnings,
    findingsCount,
  };

  const comparison = compareScans(
    initialSummary,
    enrichedFindings,
    previousScan,
    previousFindings
  );

  // Attach diffStatus back to enriched findings
  const diffMap = new Map(comparison.diffs.map((d) => [d.findingId, d.status]));
  for (const f of enrichedFindings) {
    f.diffStatus = diffMap.get(f.id) || 'new';
  }

  const goodFirstCount = enrichedFindings.filter((f) => f.readiness?.label === 'good-first-contribution').length;
  const maintainerLevelCount = enrichedFindings.filter((f) => f.readiness?.label === 'maintainer-assistance').length;
  const resolvedCount = comparison.summary.resolvedCount;

  const scanSummary: ScanSummary = {
    ...initialSummary,
    goodFirstCount,
    maintainerLevelCount,
    resolvedCount,
    comparison,
  };

  // Save to DB
  db.saveScan(scanSummary);
  db.saveFindings(enrichedFindings);

  // Log user activity
  db.logActivity({
    userId,
    type: 'scan',
    repoName: `${owner}/${repo}`,
    description: `Scanned repository "${owner}/${repo}" (${enrichedFindings.length} findings, Readiness: ${readinessScore}/100, Good-first: ${goodFirstCount})`,
  });

  return { scan: scanSummary, findings: enrichedFindings, warnings };
}
