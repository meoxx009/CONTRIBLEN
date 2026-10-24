// scripts/verify-prompt8.mjs
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('--- Verifying Prompt 8 Features Live on Server ---');

  // 1. Check App Shell & Profile Pages
  const profileRes = await fetch(`${BASE_URL}/profile`);
  console.log('GET /profile status:', profileRes.status);
  assert.strictEqual(profileRes.status, 200, 'Profile page should return 200');

  const draftsRes = await fetch(`${BASE_URL}/drafts`);
  console.log('GET /drafts status:', draftsRes.status);
  assert.strictEqual(draftsRes.status, 200, 'Drafts page should return 200');

  const issueDraftsRes = await fetch(`${BASE_URL}/app/issue-drafts`);
  console.log('GET /app/issue-drafts status:', issueDraftsRes.status);
  assert.strictEqual(issueDraftsRes.status, 200, 'Issue drafts alias route should return 200');

  // 2. Authenticate or create a session for testing
  const randomId = Date.now().toString().slice(-6);
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_p8_${Date.now()}@example.com`,
      phone: `+1555${randomId}`,
      name: 'Prompt8 Tester',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      termsAccepted: true,
    }),
  });
  const signupData = await signupRes.json();
  console.log('Signup status:', signupRes.status, signupData);
  assert.ok(signupRes.ok, 'Signup should succeed');
  const cookie = signupRes.headers.get('set-cookie');
  console.log('Authenticated test user created');

  // 3. Test Profile Settings Update (PUT /api/profile)
  const putRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || '',
    },
    body: JSON.stringify({
      name: 'Updated Tester Name',
      settings: {
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'mono',
        reducedMotion: true,
      },
    }),
  });
  assert.strictEqual(putRes.status, 200, 'PUT /api/profile should return 200');
  const putData = await putRes.json();
  assert.strictEqual(putData.user.name, 'Updated Tester Name');
  assert.strictEqual(putData.user.settings.fontFamily, 'mono');
  assert.strictEqual(putData.user.settings.reducedMotion, true);
  console.log('✓ Profile settings updated and verified');

  // 4. Test Workspace Data Export (GET /api/profile?export=true)
  const exportRes = await fetch(`${BASE_URL}/api/profile?export=true`, {
    headers: { cookie: cookie || '' },
  });
  assert.strictEqual(exportRes.status, 200, 'Export should return 200');
  const exportData = await exportRes.json();
  assert.ok(exportData.user, 'Export should contain user');
  assert.ok(Array.isArray(exportData.scans), 'Export should contain scans array');
  assert.ok(Array.isArray(exportData.findings), 'Export should contain findings array');
  assert.ok(Array.isArray(exportData.activities), 'Export should contain activities array');
  console.log('✓ Data export JSON contract verified');

  // 5. Test Disclosure Guard: Attempting to create draft for secret finding via API
  // Insert a test scan, secret finding, and route in DB for our test user
  const { db } = await import('../src/lib/db.ts');
  const testScanId = `scn_test_${Date.now()}`;
  const testFindingId = `fnd_secret_${Date.now()}`;
  const testRouteId = `rte_secret_${Date.now()}`;

  db.saveScan({
    id: testScanId,
    userId: signupData.user.id,
    repoUrl: 'https://github.com/example/secret-repo',
    repoName: 'example/secret-repo',
    owner: 'example',
    branch: 'main',
    scannedAt: new Date().toISOString(),
    totalFiles: 5,
    totalBytes: 5000,
    status: 'completed',
    readinessScore: 60,
    techStack: { languages: [], frameworks: [], tooling: [], manifests: [], confidenceScore: 80 },
    findingsCount: { total: 1, critical: 1, high: 0, medium: 0, low: 0, info: 0 },
  });

  db.saveFindings([{
    id: testFindingId,
    scanId: testScanId,
    category: 'secret',
    ruleId: 'SEC-AWS-KEY',
    title: 'Exposed AWS Access Key',
    severity: 'CRITICAL',
    confidence: 0.99,
    sourceTool: 'Secret Engine',
    file: 'config/keys.env',
    lineStart: 12,
    evidence: 'AKIA****************',
    impact: 'Exposed cloud credentials',
    fixHint: 'Rotate immediately',
    disclosureMode: 'security-disclosure',
    status: 'open',
    evidenceHash: 'hash123',
    createdAt: new Date().toISOString(),
  }]);

  db.saveRoute({
    id: testRouteId,
    scanId: testScanId,
    findingId: testFindingId,
    findingIds: [testFindingId],
    title: 'Fix Exposed AWS Access Key',
    summary: 'Secret remediation',
    difficulty: 'intermediate',
    skills: ['IAM', 'Security'],
    files: ['config/keys.env'],
    testPlan: ['Rotate key in AWS console'],
    acceptanceCriteria: ['Keys removed from repo'],
    status: 'open',
    readinessScore: 70,
    estimatedHours: 2,
    priority: 1,
    evidenceConfidence: 0.99,
    securityImpact: 25,
    testAvailability: 15,
    documentationClarity: 15,
    difficultyPenalty: 0,
    generatedBy: 'deterministic',
    createdAt: new Date().toISOString(),
  });

  const secretDraftRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || '',
    },
    body: JSON.stringify({
      routeId: testRouteId,
    }),
  });
  console.log('Secret draft creation status:', secretDraftRes.status);
  assert.strictEqual(secretDraftRes.status, 403, 'Draft creation for secret finding must return 403');
  const secretDraftData = await secretDraftRes.json();
  assert.strictEqual(secretDraftData.errorCode, 'DISCLOSURE_BLOCKED', 'Error code must be DISCLOSURE_BLOCKED');
  console.log('✓ Disclosure guard correctly blocks public issue draft for secret finding');

  // 6. Test Non-secret Finding allows draft creation
  const nonSecretFindingId = `fnd_clean_${Date.now()}`;
  const nonSecretRouteId = `rte_clean_${Date.now()}`;

  db.saveFindings([{
    id: nonSecretFindingId,
    scanId: testScanId,
    category: 'community-health',
    ruleId: 'REPO-MISSING-SECURITY-MD',
    title: 'Missing SECURITY.md Policy',
    severity: 'LOW',
    confidence: 0.95,
    sourceTool: 'Community Health Auditor',
    file: 'SECURITY.md',
    lineStart: 1,
    evidence: 'SECURITY.md not found',
    impact: 'No vulnerability disclosure path',
    fixHint: 'Add SECURITY.md with contact details',
    disclosureMode: 'public-issue',
    status: 'open',
    evidenceHash: 'hash456',
    createdAt: new Date().toISOString(),
  }]);

  db.saveRoute({
    id: nonSecretRouteId,
    scanId: testScanId,
    findingId: nonSecretFindingId,
    findingIds: [nonSecretFindingId],
    title: 'Add SECURITY.md vulnerability disclosure policy',
    summary: 'Improve community health by adding security guidance',
    difficulty: 'beginner',
    skills: ['Markdown', 'Security Policy'],
    files: ['SECURITY.md'],
    testPlan: ['Verify SECURITY.md renders correctly on GitHub'],
    acceptanceCriteria: ['Provides clear contact instructions'],
    status: 'open',
    readinessScore: 90,
    estimatedHours: 1,
    priority: 1,
    evidenceConfidence: 0.95,
    securityImpact: 15,
    testAvailability: 20,
    documentationClarity: 20,
    difficultyPenalty: 0,
    generatedBy: 'deterministic',
    createdAt: new Date().toISOString(),
  });

  const cleanDraftRes = await fetch(`${BASE_URL}/api/drafts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || '',
    },
    body: JSON.stringify({
      routeId: nonSecretRouteId,
    }),
  });
  console.log('Clean draft creation status:', cleanDraftRes.status);
  assert.strictEqual(cleanDraftRes.status, 200, 'Draft creation for non-secret finding should return 200');
  const cleanDraftData = await cleanDraftRes.json();
  assert.ok(cleanDraftData.draft?.markdownContent, 'Draft should return markdownContent');
  assert.ok(cleanDraftData.draft.markdownContent.includes('### 1. Problem Description'));
  assert.ok(cleanDraftData.draft.markdownContent.includes('### 5. Verification & Test Plan'));
  console.log('✓ Clean issue draft created and markdown content validated');

  console.log('--- ALL LIVE CHECKS PASSED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
