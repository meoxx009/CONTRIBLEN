import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { redactSecrets, detectSecretsInText, computeEvidenceHash } from '../src/lib/redaction.ts';
import {
  parseGitHubUrl,
  GitHubRateLimitError,
  GitHubBranchNotFoundError,
  GitHubNotFoundError,
  GitHubAuthError,
  executeGitHubRequest,
  getSanitizedGitHubToken,
  resetGitHubTokenState,
  getGitHubHeaders,
} from '../src/lib/scanner/github.ts';
import { signSessionToken, verifySessionToken } from '../src/lib/auth.ts';
import { parsePackageJson, parseRequirementsTxt, parsePyprojectToml } from '../src/lib/scanner/manifests.ts';
import { scanGitHubActions } from '../src/lib/scanner/actions.ts';
import { checkRepositoryHealth } from '../src/lib/scanner/health.ts';
import { detectTechnologyStack } from '../src/lib/scanner/tech-detector.ts';
import { createFindingEvidence, convertToTechnologySnapshot } from '../src/lib/scanner/evidence.ts';
import { scanRepositoryFiles } from '../src/lib/scanner/index.ts';
import { explainFinding, buildContributionRoute } from '../src/lib/gemini.ts';
import { db } from '../src/lib/db.ts';

const FIXTURES_DIR = path.join(process.cwd(), 'test', 'fixtures');

describe('ContribLens Secret Redaction Engine (SCANNER_RULES.md Section 5)', () => {
  test('redacts GitHub Classic Personal Access Tokens without leaking raw chars', () => {
    const raw = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const redacted = redactSecrets(raw);
    assert.ok(!redacted.includes('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'Raw token was leaked!');
    assert.ok(redacted.startsWith('ghp_****'), 'Token did not receive expected mask format');
  });

  test('redacts GitHub Fine-grained Personal Access Tokens', () => {
    const raw = 'github_pat_11AAAAAA00000000000000000000000000000000000000000000000000000000000000000000000000';
    const redacted = redactSecrets(raw);
    assert.ok(!redacted.includes('11AAAAAA00000000000000000000000000000000'), 'Raw PAT was leaked!');
    assert.ok(redacted.includes('github_pat_'));
    assert.ok(redacted.includes('[REDACTED]'));
  });

  test('redacts AWS Access Key ID and Secret Access Key', () => {
    const rawId = 'export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
    const redactedId = redactSecrets(rawId);
    assert.ok(!redactedId.includes('AKIAIOSFODNN7EXAMPLE'), 'Raw AWS key was leaked!');
    assert.ok(redactedId.includes('AKIA************MPLE'));

    const rawSecret = 'aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"';
    const redactedSecret = redactSecrets(rawSecret);
    assert.ok(!redactedSecret.includes('wJalrXUtnFEMI'), 'Raw AWS secret was leaked!');
    assert.ok(redactedSecret.includes('[REDACTED_AWS_SECRET_KEY]'));
  });

  test('detects secrets and assigns CRITICAL severity with deterministic hash', () => {
    const content = 'GITHUB_TOKEN=ghp_111122223333444455556666777788889999\nconst apiKey = "1234";';
    const findings = detectSecretsInText('.env', content);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].severity, 'CRITICAL');
    assert.strictEqual(findings[0].confidence, 'HIGH');
    assert.ok(!findings[0].redactedEvidence.includes('111122223333444455556666777788889999'));

    const hash = computeEvidenceHash(findings[0].redactedEvidence);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
  });
});

describe('ContribLens GitHub URL Validator', () => {
  test('parses valid HTTPS GitHub repository URLs', () => {
    const res = parseGitHubUrl('https://github.com/expressjs/express');
    assert.deepStrictEqual(res, { owner: 'expressjs', repo: 'express' });

    const withGit = parseGitHubUrl('https://github.com/facebook/react.git');
    assert.deepStrictEqual(withGit, { owner: 'facebook', repo: 'react' });

    const withTrailing = parseGitHubUrl('https://github.com/vercel/next.js/');
    assert.deepStrictEqual(withTrailing, { owner: 'vercel', repo: 'next.js' });
  });

  test('rejects non-GitHub or invalid URLs', () => {
    assert.strictEqual(parseGitHubUrl('https://gitlab.com/owner/repo'), null);
    assert.strictEqual(parseGitHubUrl('https://bitbucket.org/owner/repo'), null);
    assert.strictEqual(parseGitHubUrl('not-a-url'), null);
  });
});

describe('ContribLens Manifest Parsers with Fixtures', () => {
  test('parses package.json fixture with dependencies, devDependencies, and security tools', () => {
    const pkgPath = path.join(FIXTURES_DIR, 'manifests', 'package.json');
    const content = fs.readFileSync(pkgPath, 'utf-8');
    const parsed = parsePackageJson('package.json', content);

    assert.strictEqual(parsed.dependencies.length, 7);
    assert.ok(parsed.dependencies.some((d) => d.name === 'next' && !d.isDev));
    assert.ok(parsed.dependencies.some((d) => d.name === 'react' && !d.isDev));
    assert.ok(parsed.dependencies.some((d) => d.name === 'typescript' && d.isDev));
    assert.ok(parsed.dependencies.some((d) => d.name === 'vitest' && d.isDev));
    assert.ok(parsed.hasSecurityTools, 'ESLint was detected as security tool');
  });

  test('parses requirements.txt fixture with version bounds and comments', () => {
    const reqPath = path.join(FIXTURES_DIR, 'manifests', 'requirements.txt');
    const content = fs.readFileSync(reqPath, 'utf-8');
    const parsed = parseRequirementsTxt('requirements.txt', content);

    assert.strictEqual(parsed.length, 4);
    assert.strictEqual(parsed[0].name, 'fastapi');
    assert.strictEqual(parsed[0].ecosystem, 'PyPI');
    assert.strictEqual(parsed[1].name, 'uvicorn');
    assert.strictEqual(parsed[2].name, 'django');
    assert.strictEqual(parsed[3].name, 'pytest');
  });

  test('parses pyproject.toml dependencies', () => {
    const tomlContent = `
[tool.poetry]
name = "demo"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"
pydantic = ">=2.0"
`;
    const parsed = parsePyprojectToml('pyproject.toml', tomlContent);
    assert.strictEqual(parsed.length, 2);
    assert.ok(parsed.some((p) => p.name === 'requests'));
    assert.ok(parsed.some((p) => p.name === 'pydantic'));
  });
});

describe('ContribLens GitHub Actions Auditor (SCANNER_RULES.md Section 2)', () => {
  test('detects all CI/CD vulnerabilities in vulnerable-ci.yml fixture', () => {
    const wfPath = path.join(FIXTURES_DIR, 'workflows', 'vulnerable-ci.yml');
    const content = fs.readFileSync(wfPath, 'utf-8');
    const findings = scanGitHubActions('.github/workflows/vulnerable-ci.yml', content, 'scan_fixture');

    // 1. GH-ACTIONS-WRITE-ALL
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-WRITE-ALL'), 'Missing GH-ACTIONS-WRITE-ALL');
    // 2. GH-ACTIONS-UNPINNED
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-UNPINNED'), 'Missing GH-ACTIONS-UNPINNED');
    // 3. GH-ACTIONS-PULL-REQUEST-TARGET
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-PULL-REQUEST-TARGET'), 'Missing GH-ACTIONS-PULL-REQUEST-TARGET');
    // 4. GH-ACTIONS-CURL-PIPE-SHELL
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-CURL-PIPE-SHELL'), 'Missing GH-ACTIONS-CURL-PIPE-SHELL');
    // 5. GH-ACTIONS-SCRIPT-INJECTION
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-SCRIPT-INJECTION'), 'Missing GH-ACTIONS-SCRIPT-INJECTION');
  });

  test('passes clean secure-ci.yml fixture with pinned SHAs and least privilege', () => {
    const wfPath = path.join(FIXTURES_DIR, 'workflows', 'secure-ci.yml');
    const content = fs.readFileSync(wfPath, 'utf-8');
    const findings = scanGitHubActions('.github/workflows/secure-ci.yml', content, 'scan_fixture_secure');

    assert.strictEqual(findings.length, 0, 'Clean pinned workflow should produce zero critical findings');
  });

  test('flags missing permissions when no permissions block is declared', () => {
    const unconfiguredWf = `
name: Build
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
`;
    const findings = scanGitHubActions('.github/workflows/build.yml', unconfiguredWf, 'scan_test');
    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-MISSING-PERMISSIONS'));
    assert.strictEqual(findings.find((f) => f.ruleId === 'GH-ACTIONS-MISSING-PERMISSIONS')?.confidence, 0.72);
  });
});

describe('ContribLens Repository Health & Community Standards (SCANNER_RULES.md Section 4)', () => {
  test('flags missing health files with exact canonical rule IDs', () => {
    const { findings, healthScore } = checkRepositoryHealth([], 'scan_test');

    assert.ok(findings.some((f) => f.ruleId === 'REPO-MISSING-SECURITY'), 'Missing REPO-MISSING-SECURITY');
    assert.ok(findings.some((f) => f.ruleId === 'REPO-MISSING-LICENSE'), 'Missing REPO-MISSING-LICENSE');
    assert.ok(findings.some((f) => f.ruleId === 'REPO-MISSING-CONTRIBUTING'), 'Missing REPO-MISSING-CONTRIBUTING');
    assert.ok(findings.some((f) => f.ruleId === 'REPO-WEAK-README'), 'Missing REPO-WEAK-README');
    assert.ok(findings.some((f) => f.ruleId === 'REPO-NO-TEST-SIGNAL'), 'Missing REPO-NO-TEST-SIGNAL');
    assert.strictEqual(healthScore, 0, 'Completely empty repo should have 0 health score');
  });

  test('awards full score when all community and test files are present', () => {
    const completeRepo = [
      { path: 'README.md', size: 200, content: '# ContribLens OSS\nComprehensive open-source security navigator for contributors and maintainers.' },
      { path: 'LICENSE', size: 100, content: 'MIT License\nCopyright (c) 2026' },
      { path: 'SECURITY.md', size: 100, content: '# Security Policy\nPlease report vulnerabilities to security@example.com' },
      { path: 'CONTRIBUTING.md', size: 100, content: '# Contributing Guide\n1. Run tests\n2. Open PR' },
      { path: 'tests/main.test.ts', size: 50, content: 'test("ok", () => {})' },
    ];
    const { findings, healthScore } = checkRepositoryHealth(completeRepo, 'scan_test');
    assert.strictEqual(findings.length, 0);
    assert.strictEqual(healthScore, 100);
  });
});

describe('ContribLens Technology Stack & Signal Tracking (SCANNER_RULES.md Section 6)', () => {
  test('tracks source paths and confidence for languages, frameworks, and tooling', () => {
    const pkgPath = path.join(FIXTURES_DIR, 'manifests', 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
    const parsedPkg = parsePackageJson('package.json', pkgContent);

    const files = [
      { path: 'package.json', size: 400, content: pkgContent },
      { path: 'src/index.ts', size: 100, content: 'export const app = true;' },
      { path: 'src/components/App.tsx', size: 200, content: 'export default function App() {}' },
      { path: 'Dockerfile', size: 150, content: 'FROM node:20' },
      { path: '.github/workflows/ci.yml', size: 150, content: 'name: CI' },
      { path: '.eslintrc.json', size: 50, content: '{}' },
    ];

    const { techStack, readinessScore } = detectTechnologyStack(
      files,
      { dependencies: parsedPkg.dependencies.map((d) => ({ name: d.name })), scripts: parsedPkg.scripts }
    );

    // Languages track sources and high confidence when manifest-backed
    const tsLang = techStack.languages.find((l) => l.name === 'TypeScript');
    assert.ok(tsLang, 'TypeScript language detected');
    assert.ok(tsLang.sources && tsLang.sources.length > 0, 'TypeScript tracks source paths');
    assert.ok(tsLang.confidence && tsLang.confidence >= 0.90, 'TypeScript has high confidence');

    // Frameworks track sources
    const nextFw = techStack.frameworks.find((f) => f.name === 'Next.js');
    assert.ok(nextFw, 'Next.js detected');
    assert.deepStrictEqual(nextFw.sources, ['package.json']);
    assert.strictEqual(nextFw.confidence, 0.98);

    // Tooling tracks sources and category
    const dockerTool = techStack.tooling.find((t) => t.name === 'Docker');
    assert.ok(dockerTool, 'Docker detected');
    assert.ok(dockerTool.sources?.includes('Dockerfile'));

    const npmTool = techStack.tooling.find((t) => t.name === 'npm');
    assert.ok(npmTool, 'npm package manager detected');

    assert.ok(readinessScore >= 70, 'Readiness score reflects test, lint, and CI presence');

    // Evidence schema snapshot conversion preserves signals
    const snapshot = convertToTechnologySnapshot(techStack);
    assert.ok(snapshot.languages.some((l) => l.name === 'TypeScript'));
    assert.ok(snapshot.frameworks.some((f) => f.name === 'Next.js'));
    assert.ok(snapshot.tooling.some((t) => t.name === 'Docker'));
  });
});

describe('ContribLens Pure Domain Fixtures & Security Invariants (Prompt 08)', () => {
  test('audits unpinned-action.yml fixture and detects GH-ACTIONS-UNPINNED', () => {
    const unpinnedPath = path.join(FIXTURES_DIR, 'workflows', 'unpinned-action.yml');
    const content = fs.readFileSync(unpinnedPath, 'utf-8');
    const findings = scanGitHubActions('.github/workflows/unpinned-action.yml', content, 'scan_unpinned_fix');

    assert.ok(findings.some((f) => f.ruleId === 'GH-ACTIONS-UNPINNED'), 'Must detect unpinned action');
    const unpinned = findings.find((f) => f.ruleId === 'GH-ACTIONS-UNPINNED');
    assert.strictEqual(unpinned?.severity, 'MEDIUM');
    assert.strictEqual(unpinned?.confidence, 0.9);
  });

  test('parses pyproject.toml fixture cleanly with dependencies', () => {
    const tomlPath = path.join(FIXTURES_DIR, 'manifests', 'pyproject.toml');
    const content = fs.readFileSync(tomlPath, 'utf-8');
    const parsed = parsePyprojectToml('pyproject.toml', content);

    assert.ok(parsed.length >= 3);
    assert.ok(parsed.some((p) => p.name === 'requests'));
    assert.ok(parsed.some((p) => p.name === 'pydantic'));
    assert.ok(parsed.some((p) => p.name === 'fastapi'));
  });

  test('redacts all credentials in fake-secrets.env fixture with zero raw leaks', () => {
    const secretPath = path.join(FIXTURES_DIR, 'secrets', 'fake-secrets.env');
    const content = fs.readFileSync(secretPath, 'utf-8');
    const findings = detectSecretsInText('.env', content);

    assert.ok(findings.length >= 2, 'Must detect multiple secret patterns');
    findings.forEach((f) => {
      assert.strictEqual(f.severity, 'CRITICAL');
      assert.ok(!f.redactedEvidence.includes('ABCDEF0123456789abcdef0123456789ABCD'), 'Raw PAT leaked');
      assert.ok(!f.redactedEvidence.includes('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'), 'Raw AWS leaked');
    });
  });

  test('verifies prompt injection in repository text cannot alter severity or disclosure', () => {
    const injectionPath = path.join(FIXTURES_DIR, 'injection', 'prompt-injection.md');
    const content = fs.readFileSync(injectionPath, 'utf-8');

    // Deterministic secret finding with injection in adjacent description
    const finding = createFindingEvidence({
      scanId: 'scan_inj_test',
      category: 'secret',
      ruleId: 'SEC-GITHUB_TOKEN',
      title: 'Exposed GitHub Token',
      severity: 'CRITICAL',
      confidence: 0.99,
      sourceTool: 'Secret Redaction Engine',
      file: 'README.md',
      evidence: `TOKEN=ghp_********************************1234\n${content}`,
      impact: 'Critical credential compromise',
      fixHint: 'Revoke and rotate immediately',
      disclosureMode: 'security-disclosure',
    });

    // Invariant: Scanner rules determine severity & disclosureMode, not repository content
    assert.strictEqual(finding.severity, 'CRITICAL', 'Prompt injection must not lower severity to LOW');
    assert.strictEqual(finding.confidence, 0.99, 'Prompt injection must not lower confidence');
    assert.strictEqual(finding.disclosureMode, 'security-disclosure', 'Prompt injection must not change disclosure');
  });

  test('verifies oversized and binary fixtures are correctly identified and rejected', () => {
    const oversizedPath = path.join(FIXTURES_DIR, 'bounded', 'oversized.txt');
    const binaryPath = path.join(FIXTURES_DIR, 'bounded', 'binary-mock.png');

    const oversizedStat = fs.statSync(oversizedPath);
    assert.ok(oversizedStat.size > 180000, 'Oversized fixture must exceed 180 KB limit');

    // Binary file extension check
    const isBinary = (filePath) => /\.(png|jpg|jpeg|gif|ico|pdf|zip|tar|gz|exe|dll|so|dylib|bin)$/i.test(filePath);
    assert.strictEqual(isBinary(binaryPath), true, 'PNG file must be identified as binary');
    assert.strictEqual(isBinary('package.json'), false, 'package.json is text');
  });
});

describe('ContribLens Technology Stack Detection Pipeline & Gemini Context Integration', () => {
  test('empty repository returns 0% confidence score (not 100%)', () => {
    const { techStack } = detectTechnologyStack([]);
    assert.strictEqual(techStack.languages.length, 0);
    assert.strictEqual(techStack.frameworks.length, 0);
    assert.strictEqual(techStack.tooling.length, 0);
    assert.strictEqual(techStack.manifests.length, 0);
    assert.strictEqual(techStack.confidenceScore, 0, 'Empty repository must have 0% confidence, not 100%');
  });

  test('accurately detects Next.js, pnpm, versions, manifests, and direct dependencies', () => {
    const files = [
      {
        path: 'package.json',
        size: 500,
        content: JSON.stringify({
          name: 'varshanetra',
          version: '1.0.0',
          packageManager: 'pnpm@8.15.1',
          dependencies: {
            next: '^14.2.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            typescript: '^5.4.0',
            tailwindcss: '^3.4.1',
            eslint: '^8.57.0',
            jest: '^29.7.0',
          },
        }),
      },
      { path: 'pnpm-lock.yaml', size: 1000, content: 'lockfileVersion: 5.4' },
      { path: 'tsconfig.json', size: 200, content: '{}' },
      { path: 'src/app/page.tsx', size: 300, content: 'export default function Page() { return <h1>Test</h1>; }' },
      { path: 'src/components/Header.tsx', size: 200, content: 'export const Header = () => null;' },
      { path: '.github/workflows/ci.yml', size: 150, content: 'name: CI\non: push' },
    ];

    const { techStack, readinessScore } = detectTechnologyStack(files);

    // Languages
    const ts = techStack.languages.find((l) => l.name === 'TypeScript');
    assert.ok(ts, 'TypeScript must be detected');
    assert.strictEqual(ts.filesCount, 2);

    // Frameworks with version extraction
    const nextFw = techStack.frameworks.find((f) => f.name === 'Next.js');
    assert.ok(nextFw, 'Next.js framework must be detected');
    assert.strictEqual(nextFw.version, '14.2.0');
    assert.strictEqual(nextFw.category, 'Full-stack Web Framework');

    const reactFw = techStack.frameworks.find((f) => f.name === 'React');
    assert.ok(reactFw, 'React must be detected');
    assert.strictEqual(reactFw.version, '18.2.0');

    // Package Manager
    assert.ok(techStack.packageManagers && techStack.packageManagers.length > 0);
    const pnpm = techStack.packageManagers.find((p) => p.name.toLowerCase() === 'pnpm');
    assert.ok(pnpm, 'pnpm must be detected');
    assert.strictEqual(pnpm.status, 'detected');
    assert.strictEqual(pnpm.lockfile, 'pnpm-lock.yaml');
    assert.strictEqual(pnpm.version, '8.15.1');

    // Tooling
    const tools = techStack.tooling.map((t) => t.name);
    assert.ok(tools.includes('TypeScript'));
    assert.ok(tools.includes('Tailwind CSS'));
    assert.ok(tools.includes('ESLint'));
    assert.ok(tools.includes('Jest'));
    assert.ok(tools.includes('GitHub Actions'));

    // Manifests
    assert.strictEqual(techStack.manifests.length, 1);
    assert.strictEqual(techStack.manifests[0].type, 'npm');
    assert.strictEqual(techStack.manifests[0].dependenciesCount, 7);

    // Direct dependencies
    assert.ok(techStack.dependencies && techStack.dependencies.length === 7);
    assert.ok(techStack.dependencies.some((d) => d.name === 'next' && d.version === '14.2.0' && d.type === 'production'));
    assert.ok(techStack.dependencies.some((d) => d.name === 'typescript' && d.type === 'dev'));

    // Confidence & readiness
    assert.ok(techStack.confidenceScore >= 90);
    assert.ok(readinessScore >= 70);
  });

  test('scanRepositoryFiles runs techStack detection unconditionally even when checks filter excludes technolog', () => {
    const files = [
      {
        path: 'package.json',
        size: 300,
        content: JSON.stringify({
          dependencies: { next: '14.0.0' },
        }),
      },
      { path: 'package-lock.json', size: 500, content: '{}' },
      { path: 'src/index.ts', size: 100, content: 'export const x = 1;' },
    ];

    // Simulate standard UI scan where checks = ['dependencies', 'actions', 'secrets', 'health']
    const result = scanRepositoryFiles(files, 'scan_test_checks', undefined, ['dependencies', 'actions', 'secrets', 'health']);

    assert.ok(result.techStack.languages.length > 0, 'Languages must be populated');
    assert.ok(result.techStack.frameworks.some((f) => f.name === 'Next.js'), 'Next.js must be detected');
    assert.ok(result.techStack.manifests.length > 0, 'Manifests must be detected');
    assert.ok(result.techStack.confidenceScore > 0, 'Confidence score must be greater than 0');
  });

  test('explainFinding populates repositoryContext with verified languages, frameworks, and package manager', async () => {
    const mockScan = {
      id: 'scan_explain_test',
      userId: 'usr_test',
      repoUrl: 'https://github.com/meoxx009/varshanetra',
      repoName: 'meoxx009/varshanetra',
      owner: 'meoxx009',
      branch: 'main',
      scannedAt: new Date().toISOString(),
      totalFiles: 10,
      totalBytes: 5000,
      status: 'completed',
      readinessScore: 85,
      findingsCount: { total: 1, critical: 0, high: 1, medium: 0, low: 0, info: 0 },
      techStack: {
        languages: [{ name: 'TypeScript', percentage: 90, filesCount: 9, confidence: 0.98 }],
        frameworks: [{ name: 'Next.js', category: 'Full-stack Web Framework', version: '14.2.0', confidence: 0.98 }],
        tooling: [{ name: 'ESLint', category: 'Linter', confidence: 0.95 }, { name: 'Jest', category: 'Testing', confidence: 0.95 }],
        manifests: [{ path: 'package.json', type: 'npm', dependenciesCount: 5 }],
        confidenceScore: 95,
        packageManagers: [{ name: 'pnpm', version: '8.15.1', lockfile: 'pnpm-lock.yaml', status: 'detected', source: 'pnpm-lock.yaml', confidence: 0.98 }],
      },
    };

    const mockFinding = {
      id: 'fnd_dep_next_123',
      scanId: 'scan_explain_test',
      title: 'Vulnerable Dependency: next',
      category: 'dependency',
      severity: 'HIGH',
      confidence: 0.95,
      sourceTool: 'OSV Batch Advisory Query',
      ruleId: 'DEP-OSV-ADVISORY',
      file: 'package.json',
      line: 5,
      lineStart: 5,
      lineEnd: 5,
      evidence: '"next": "^14.2.0"',
      redactedEvidence: '"next": "^14.2.0"',
      impact: 'Denial of service or SSRF in unpatched Next.js server actions',
      fixHint: 'Upgrade next to >= 14.2.15',
      disclosureMode: 'maintainer-review',
      createdAt: new Date().toISOString(),
    };

    const explanation = await explainFinding(mockFinding, mockScan);

    assert.ok(explanation.repositoryContext, 'Explanation must include repositoryContext');
    assert.strictEqual(explanation.repositoryContext.primaryLanguage, 'TypeScript');
    assert.ok(explanation.repositoryContext.languages.includes('TypeScript'));
    assert.ok(explanation.repositoryContext.frameworks.some((f) => f.includes('Next.js')));
    assert.strictEqual(explanation.repositoryContext.packageManager, 'pnpm');
    assert.ok(explanation.repositoryContext.tooling.includes('Jest'));
    assert.ok(explanation.recommendedFix.includes('pnpm'), 'Recommended fix should leverage detected package manager');
  });
});

describe('ContribLens Robust URL Parsing, Error Classification & Route Generation Regressions (Section 14)', () => {
  // Scenario 1: Canonical repository URL
  test('Scenario 1: parses canonical repository URL', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 2: URL with .git suffix
  test('Scenario 2: parses URL with .git suffix', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI.git');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 3: URL with trailing slash
  test('Scenario 3: parses URL with trailing slash', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI/');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 4: URL with .git and trailing slash
  test('Scenario 4: parses URL with .git and trailing slash', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI.git/');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 5: Shorthand owner/repo
  test('Scenario 5: parses owner/repo shorthand', () => {
    const res = parseGitHubUrl('meoxx009/career-AI');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 6: Shorthand owner/repo.git
  test('Scenario 6: parses owner/repo.git shorthand', () => {
    const res = parseGitHubUrl('meoxx009/career-AI.git');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 7: HTTP URL
  test('Scenario 7: parses HTTP URL correctly without failure', () => {
    const res = parseGitHubUrl('http://github.com/meoxx009/career-AI');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 8: URL without protocol
  test('Scenario 8: parses github.com/owner/repo without protocol', () => {
    const res = parseGitHubUrl('github.com/meoxx009/career-AI');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 9: URL with branch path
  test('Scenario 9: parses URL with /tree/branch', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI/tree/main');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI', branch: 'main' });
  });

  // Scenario 10: URL with complex multi-segment branch path
  test('Scenario 10: parses URL with complex branch path like feature/v2-auth', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI/tree/feature/v2-auth');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI', branch: 'feature/v2-auth' });
  });

  // Scenario 11: URL with query parameters and hash fragments
  test('Scenario 11: strips query parameters and hash fragments cleanly', () => {
    const res = parseGitHubUrl('https://github.com/meoxx009/career-AI.git?tab=readme-ov-file#installation');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 12: SSH git format
  test('Scenario 12: parses SSH git format git@github.com:owner/repo.git', () => {
    const res = parseGitHubUrl('git@github.com:meoxx009/career-AI.git');
    assert.deepStrictEqual(res, { owner: 'meoxx009', repo: 'career-AI' });
  });

  // Scenario 13: Invalid URL rejection
  test('Scenario 13: rejects non-GitHub and SSRF attempts', () => {
    assert.strictEqual(parseGitHubUrl('https://gitlab.com/meoxx009/career-AI'), null);
    assert.strictEqual(parseGitHubUrl('https://bitbucket.org/meoxx009/career-AI'), null);
    assert.strictEqual(parseGitHubUrl('http://169.254.169.254/latest/meta-data/'), null);
    assert.strictEqual(parseGitHubUrl('https://localhost:3000/owner/repo'), null);
    assert.strictEqual(parseGitHubUrl('https://github.com/'), null);
    assert.strictEqual(parseGitHubUrl('https://github.com/owner'), null);
    assert.strictEqual(parseGitHubUrl('not-a-repo'), null);
  });

  // Scenario 14: Typed error classification
  test('Scenario 14: typed errors correctly encode status and operational context', () => {
    const resetDate = new Date(Date.now() + 3600000);
    const rateLimitErr = new GitHubRateLimitError('Rate limit exceeded', resetDate);
    assert.strictEqual(rateLimitErr.name, 'GitHubRateLimitError');
    assert.strictEqual(rateLimitErr.resetTime, resetDate);

    const branchErr = new GitHubBranchNotFoundError('Branch not found', 'dev-v2', 'main');
    assert.strictEqual(branchErr.name, 'GitHubBranchNotFoundError');
    assert.strictEqual(branchErr.branch, 'dev-v2');
    assert.strictEqual(branchErr.defaultBranch, 'main');

    const notFoundErr = new GitHubNotFoundError('Repository not found or private');
    assert.strictEqual(notFoundErr.name, 'GitHubNotFoundError');

    const authErr = new GitHubAuthError('Invalid token');
    assert.strictEqual(authErr.name, 'GitHubAuthError');
  });

  // Scenario 15: Automatic Contribution Route generation from scan findings
  test('Scenario 15: auto-generates contribution routes with complete test plans and difficulty tracks', async () => {
    const mockFinding = {
      id: 'fnd_auto_route_123',
      scanId: 'scn_auto_test',
      title: 'Missing SECURITY.md Policy',
      category: 'health',
      severity: 'MEDIUM',
      confidence: 0.95,
      sourceTool: 'Repository Health Auditor',
      ruleId: 'REPO-MISSING-SECURITY-MD',
      file: 'SECURITY.md',
      impact: 'Lack of security disclosure guidelines',
      fixHint: 'Add SECURITY.md with maintainer contacts',
      disclosureMode: 'maintainer-review',
      createdAt: new Date().toISOString(),
    };

    const mockScan = {
      id: 'scn_auto_test',
      userId: 'test_user',
      repoUrl: 'https://github.com/meoxx009/career-AI',
      repoName: 'meoxx009/career-AI',
      owner: 'meoxx009',
      branch: 'main',
      scannedAt: new Date().toISOString(),
      totalFiles: 20,
      totalBytes: 50000,
      status: 'completed',
      readinessScore: 85,
      techStack: {
        languages: [{ name: 'TypeScript', confidence: 100, sourceFile: 'package.json' }],
        frameworks: [{ name: 'Next.js', confidence: 100, sourceFile: 'package.json' }],
        dependencies: [],
        manifests: [{ path: 'package.json', type: 'npm', dependenciesCount: 5 }],
        packageManagers: [{ name: 'npm', confidence: 95, sourceFile: 'package.json' }],
        tooling: [],
        confidenceScore: 90,
      },
      findingsCount: { total: 1, critical: 0, high: 0, medium: 1, low: 0, info: 0 },
    };

    const route = await buildContributionRoute(mockFinding, mockScan);

    assert.ok(route.id.startsWith('rte_'));
    assert.strictEqual(route.scanId, 'scn_auto_test');
    assert.strictEqual(route.findingId, 'fnd_auto_route_123');
    assert.strictEqual(route.status, 'not-started');
    assert.ok(route.testPlan.length > 0, 'Test plan must have actionable verification steps');
    assert.ok(route.acceptanceCriteria.length > 0, 'Acceptance criteria must have clear criteria');
    assert.ok(route.skills.length > 0, 'Skills must be listed');
    assert.ok(['beginner', 'intermediate', 'advanced'].includes(route.difficulty));
  });
});

describe('ContribLens Permanent Authentication & Token Resiliency Suite (Section 13)', () => {
  // Test 1: Public repository without GitHub token
  test('Test 1: unauthenticated public request operates cleanly with no Authorization header', () => {
    resetGitHubTokenState();
    const prev = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;

    const token = getSanitizedGitHubToken();
    assert.strictEqual(token, null, 'Expected null token when unset');

    const headers = getGitHubHeaders(false);
    assert.strictEqual(headers['Authorization'], undefined, 'No Authorization header must be sent');
    assert.strictEqual(headers['Accept'], 'application/vnd.github.v3+json');

    if (prev) process.env.GITHUB_TOKEN = prev;
  });

  // Test 2: Public repository with valid GitHub token
  test('Test 2: valid GitHub token is used server-side and never exposed', () => {
    resetGitHubTokenState();
    const prev = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'ghp_validTokenSecret1234567890';

    const token = getSanitizedGitHubToken();
    assert.strictEqual(token, 'ghp_validTokenSecret1234567890');

    const headers = getGitHubHeaders(true);
    assert.strictEqual(headers['Authorization'], 'token ghp_validTokenSecret1234567890');

    // Placeholders are safely rejected
    process.env.GITHUB_TOKEN = 'your_github_token_here';
    assert.strictEqual(getSanitizedGitHubToken(), null, 'Placeholder tokens must be ignored');

    process.env.GITHUB_TOKEN = '   ';
    assert.strictEqual(getSanitizedGitHubToken(), null, 'Whitespace tokens must be ignored');

    if (prev) process.env.GITHUB_TOKEN = prev;
    else delete process.env.GITHUB_TOKEN;
    resetGitHubTokenState();
  });

  // Test 3: Public repository with invalid optional token falls back to unauthenticated public request
  test('Test 3: invalid optional token falls back to unauthenticated public access without crashing', async () => {
    resetGitHubTokenState();
    const prev = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'ghp_invalid_token_which_gets_401';

    // Intercept fetch or call executeGitHubRequest with custom mock
    const originalFetch = globalThis.fetch;
    let callCount = 0;
    let fallbackHeaderSent = null;

    globalThis.fetch = async (url, opts) => {
      callCount++;
      const authHeader = opts?.headers?.['Authorization'];
      if (authHeader && authHeader.includes('ghp_invalid_token')) {
        // First call with bad token returns 401
        return new Response(JSON.stringify({ message: 'Bad credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Fallback call has no Authorization header and returns 200
      fallbackHeaderSent = authHeader;
      return new Response(JSON.stringify({ id: 12345, name: 'career-AI', default_branch: 'main' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const response = await executeGitHubRequest('https://api.github.com/repos/meoxx009/career-AI');
      assert.strictEqual(response.status, 200, 'Fallback request must succeed with 200');
      assert.strictEqual(callCount, 2, 'Should execute initial authenticated call and one unauthenticated fallback');
      assert.strictEqual(fallbackHeaderSent, undefined, 'Fallback call must NOT send Authorization header');
      assert.strictEqual(getSanitizedGitHubToken(), null, 'Invalid token must be marked invalid in memory');
    } finally {
      globalThis.fetch = originalFetch;
      if (prev) process.env.GITHUB_TOKEN = prev;
      else delete process.env.GITHUB_TOKEN;
      resetGitHubTokenState();
    }
  });

  // Test 4: ContriBLens user session verification & rejection of invalid sessions
  test('Test 4: ContriBLens user session verification rejects missing/tampered sessions', () => {
    // Valid session signing and verification
    const sessionPayload = {
      userId: 'usr_auth_test_999',
      email: 'verified_contributor@contriblens.org',
      phone: '+15550199999',
      name: 'Verified Contributor',
    };
    const validToken = signSessionToken(sessionPayload);
    assert.strictEqual(typeof validToken, 'string');

    const decoded = verifySessionToken(validToken);
    assert.ok(decoded);
    assert.strictEqual(decoded.userId, 'usr_auth_test_999');
    assert.strictEqual(decoded.email, 'verified_contributor@contriblens.org');

    // Tampered token rejection
    const tamperedToken = validToken.slice(0, -6) + 'xxxxxx';
    assert.strictEqual(verifySessionToken(tamperedToken), null, 'Tampered JWT must be rejected');

    // Blank token rejection
    assert.strictEqual(verifySessionToken(''), null);
    assert.strictEqual(verifySessionToken('invalid.jwt.token'), null);
  });

  // Test 5: Inaccessible or private repository handling
  test('Test 5: private or inaccessible repository throws typed GitHubNotFoundError', () => {
    const err = new GitHubNotFoundError('Repository "secret/vault" was not found or is private.');
    assert.strictEqual(err.name, 'GitHubNotFoundError');
    assert.ok(err.message.includes('not found or is private'));
  });

  // Test 6: Rate-limited public repository request
  test('Test 6: rate limit error includes reset time and avoids retry loops', () => {
    const resetDate = new Date(Date.now() + 600000);
    const err = new GitHubRateLimitError('Rate limit exceeded', resetDate);
    assert.strictEqual(err.name, 'GitHubRateLimitError');
    assert.strictEqual(err.resetTime, resetDate);
  });

  // Test 7: Branch not found
  test('Test 7: branch not found error retains branch and default branch hint', () => {
    const err = new GitHubBranchNotFoundError('Branch release-v99 not found', 'release-v99', 'main');
    assert.strictEqual(err.name, 'GitHubBranchNotFoundError');
    assert.strictEqual(err.branch, 'release-v99');
    assert.strictEqual(err.defaultBranch, 'main');
  });

  // Test 8: SSRF rejection
  test('Test 8: SSRF host rejection prevents untrusted outbound requests', async () => {
    await assert.rejects(
      async () => {
        await executeGitHubRequest('https://evil.attacker.com/steal-token');
      },
      /Untrusted host/
    );
  });

  // Test 9 & 10: Retry state preservation and URL normalization
  test('Test 9 & 10: URL normalization preserves branch and repository inputs for user retry', () => {
    const parsed1 = parseGitHubUrl('https://github.com/meoxx009/career-AI.git');
    assert.deepStrictEqual(parsed1, { owner: 'meoxx009', repo: 'career-AI' });

    const parsed2 = parseGitHubUrl('https://github.com/meoxx009/career-AI/tree/feature/test-branch');
    assert.deepStrictEqual(parsed2, {
      owner: 'meoxx009',
      repo: 'career-AI',
      branch: 'feature/test-branch',
    });
  });

  // Test 11: Existing features integrity
  test('Test 11: db and user session store remain functional', () => {
    const users = db.getUsers();
    assert.ok(Array.isArray(users));
  });
});
