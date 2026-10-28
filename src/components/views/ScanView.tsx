'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Search,
  Shield,
  GitBranch,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GitCompare,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { ScanSummary, Finding } from '@/types';

type ScanStage =
  | 'idle'
  | 'validating'
  | 'fetching_metadata'
  | 'fetching_tree'
  | 'fetching_files'
  | 'analyzing'
  | 'enriching_dependencies'
  | 'persisting'
  | 'complete'
  | 'complete_with_warnings';

interface FailureDetails {
  type:
    | 'auth_required'
    | 'invalid_url'
    | 'not_found'
    | 'branch_not_found'
    | 'private_or_unavailable'
    | 'rate_limited'
    | 'tree_too_large'
    | 'network_error'
    | 'dependency_lookup_unavailable'
    | 'persist_failed';
  userMessage: string;
  correlationId: string;
  resetTime?: string;
  defaultBranch?: string;
}

const STAGE_LABELS: Record<ScanStage, string> = {
  idle: 'Ready to scan',
  validating: 'Validating repository URL and checking access permissions...',
  fetching_metadata: 'Fetching repository metadata and default branch from GitHub...',
  fetching_tree: 'Retrieving bounded repository tree (up to 60 configuration files max)...',
  fetching_files: 'Downloading text configuration and source files (binary assets skipped)...',
  analyzing: 'Executing deterministic AST and manifest analyzers...',
  enriching_dependencies: 'Enriching findings via OSV.dev batch vulnerability queries...',
  persisting: 'Persisting redacted security findings and contribution routes...',
  complete: 'Scan completed successfully with all checks verified.',
  complete_with_warnings: 'Scan completed with advisory warnings (e.g. dependency lookup throttled).',
};

const STAGE_PROGRESS: Record<ScanStage, number> = {
  idle: 0,
  validating: 12,
  fetching_metadata: 25,
  fetching_tree: 38,
  fetching_files: 52,
  analyzing: 68,
  enriching_dependencies: 82,
  persisting: 94,
  complete: 100,
  complete_with_warnings: 100,
};

export default function ScanView() {
  const router = useRouter();
  const { setActiveScan, showToast } = useApp();

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState<ScanStage>('idle');
  const [failure, setFailure] = useState<FailureDetails | null>(null);

  // Category Checklist
  const [categories, setCategories] = useState({
    dependencies: true,
    actions: true,
    secrets: true,
    health: true,
  });

  const [scanResult, setScanResult] = useState<{
    scan: ScanSummary;
    findings: Finding[];
    hasWarnings?: boolean;
  } | null>(null);

  const [recentScans, setRecentScans] = useState<ScanSummary[]>([]);

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const res = await fetch('/api/scans');
      if (res.ok) {
        const data = await res.json();
        setRecentScans(data.scans || []);
      }
    } catch {
      // Non-blocking
    }
  };

  const classifyError = (
    rawMessage: string,
    errorCode?: string,
    correlationIdParam?: string,
    resetTime?: string,
    defaultBranch?: string
  ): FailureDetails => {
    const correlationId = correlationIdParam || `CS-ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const lower = rawMessage.toLowerCase();

    // 1. ContriBLens application session missing or expired
    if (
      errorCode === 'AUTH_INVALID_CREDENTIALS' ||
      lower.includes('sign in') ||
      lower.includes('session') ||
      (lower.includes('authentication') && lower.includes('required'))
    ) {
      return {
        type: 'auth_required',
        userMessage: 'Your ContriBLens session has expired or authentication is required. Please sign in to scan repositories.',
        correlationId,
      };
    }

    if (errorCode === 'GITHUB_INVALID_URL' || lower.includes('invalid') || lower.includes('format')) {
      return {
        type: 'invalid_url',
        userMessage: rawMessage || 'The provided URL is not a recognized public GitHub repository format. Please verify the URL.',
        correlationId,
      };
    }
    if (errorCode === 'GITHUB_BRANCH_NOT_FOUND' || (lower.includes('branch') && (lower.includes('not found') || lower.includes('failed to load')))) {
      return {
        type: 'branch_not_found',
        userMessage: rawMessage || 'The specified branch was not found in this repository.',
        correlationId,
        defaultBranch,
      };
    }
    if (errorCode === 'GITHUB_RATE_LIMITED' || lower.includes('rate limit') || lower.includes('403') || lower.includes('429')) {
      return {
        type: 'rate_limited',
        userMessage: rawMessage || 'GitHub API rate limit reached. Configure a read-only token in .env.local or retry later.',
        correlationId,
        resetTime,
      };
    }
    if (errorCode === 'GITHUB_NOT_FOUND') {
      return {
        type: 'not_found',
        userMessage: rawMessage || 'Repository could not be found. Check for typos or verify the repository exists on GitHub.',
        correlationId,
      };
    }
    if (errorCode === 'GITHUB_PRIVATE_OR_UNAVAILABLE' || lower.includes('private')) {
      return {
        type: 'private_or_unavailable',
        userMessage: rawMessage || 'The requested repository appears to be private or unavailable for public auditing.',
        correlationId,
      };
    }
    if (
      errorCode === 'GITHUB_TREE_TRUNCATED' ||
      errorCode === 'GITHUB_FILE_LIMIT' ||
      lower.includes('tree') ||
      lower.includes('size') ||
      lower.includes('large')
    ) {
      return {
        type: 'tree_too_large',
        userMessage: rawMessage || 'Repository file tree exceeds bounded safety constraints (60 files max).',
        correlationId,
      };
    }
    if (errorCode === 'OSV_UNAVAILABLE' || lower.includes('osv') || lower.includes('dependency')) {
      return {
        type: 'dependency_lookup_unavailable',
        userMessage: rawMessage || 'OSV.dev vulnerability lookup was temporarily unavailable. Deterministic analysis was preserved.',
        correlationId,
      };
    }
    if (errorCode === 'PERSISTENCE_FAILED' || lower.includes('persist') || lower.includes('db')) {
      return {
        type: 'persist_failed',
        userMessage: rawMessage || 'Failed to write scan results to disk store. Please retry the scan.',
        correlationId,
      };
    }

    return {
      type: 'network_error',
      userMessage: rawMessage || 'A temporary network interruption occurred while connecting to GitHub. Your input has been preserved.',
      correlationId,
    };
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFailure(null);
    setScanResult(null);

    const cleanUrl = repoUrl.trim();
    if (!cleanUrl) {
      setFailure({
        type: 'invalid_url',
        userMessage: 'Please provide a valid GitHub repository URL.',
        correlationId: `CS-ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
      return;
    }

    const isShorthand = /^[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+$/.test(cleanUrl);
    if (!cleanUrl.includes('github.com/') && !isShorthand && !cleanUrl.startsWith('git@github.com:')) {
      setFailure({
        type: 'invalid_url',
        userMessage: 'URL must be a public GitHub repository (e.g. https://github.com/expressjs/express or owner/repo).',
        correlationId: `CS-ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
      return;
    }

    setScanning(true);
    setStage('validating');

    // Progression of state stages
    const timer1 = setTimeout(() => setStage('fetching_metadata'), 500);
    const timer2 = setTimeout(() => setStage('fetching_tree'), 1100);
    const timer3 = setTimeout(() => setStage('fetching_files'), 1800);
    const timer4 = setTimeout(() => setStage('analyzing'), 2500);
    const timer5 = setTimeout(() => setStage('enriching_dependencies'), 3300);
    const timer6 = setTimeout(() => setStage('persisting'), 4000);

    try {
      const selectedChecks = Object.entries(categories)
        .filter(([_, enabled]) => Boolean(enabled))
        .map(([cat]) => cat);

      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: cleanUrl,
          repoUrl: cleanUrl,
          ref: branch.trim() || undefined,
          branch: branch.trim() || undefined,
          checks: selectedChecks,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);

      const data = await res.json();

      if (!res.ok) {
        setStage('idle');
        const failureObj = classifyError(
          data.error || 'Failed to scan repository.',
          data.errorCode,
          data.correlationId,
          data.resetTime,
          data.defaultBranch
        );
        setFailure(failureObj);
        return;
      }

      // Check if complete or complete_with_warnings
      const hasWarnings = data.warnings && data.warnings.length > 0;
      setStage(hasWarnings ? 'complete_with_warnings' : 'complete');
      setScanResult({ scan: data.scan, findings: data.findings, hasWarnings });
      setActiveScan(data.scan);
      if (data.scan) {
        setRecentScans((prev) => [data.scan, ...prev.filter((s) => s.id !== data.scan.id)]);
      }

      showToast(
        hasWarnings
          ? `Scan complete with warnings (${data.findings.length} findings).`
          : `Scan complete: ${data.findings.length} findings discovered.`,
        hasWarnings ? 'info' : 'success'
      );
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);

      setStage('idle');
      const failureObj = classifyError(err.message || '');
      setFailure(failureObj);
    } finally {
      setScanning(false);
    }
  };

  const handleQuickFill = (exampleUrl: string) => {
    setRepoUrl(exampleUrl);
    setBranch('');
    setFailure(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 bg-black text-textPrimary">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-textPrimary flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-electricTangerine" />
          <span>Scan Public Repository</span>
        </h1>
        <p className="text-xs sm:text-sm text-textMuted mt-1 max-w-2xl leading-relaxed">
          Provide any public HTTPS GitHub repository. ContribLens analyzes dependencies, workflows, secrets, and governance deterministically without ever executing code.
        </p>
      </div>

      {/* Scan Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-glass-card space-y-6 border border-borderDark">
        {/* Failure State Display with Safe User Message + Correlation ID + Actions */}
        {failure && (
          <div className="p-4 rounded-xl bg-rosewood/40 border border-rosewood text-cotton text-xs sm:text-sm space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-lemonChiffon mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <span className="font-semibold block text-lemonChiffon uppercase tracking-wider text-[11px]">
                  Scan Failed ({failure.type.replace(/_/g, ' ')})
                </span>
                <p className="leading-relaxed">{failure.userMessage}</p>
                {failure.resetTime && (
                  <p className="text-[11px] text-lemonChiffon/90">
                    Estimated Rate Limit Reset: <span className="font-mono">{new Date(failure.resetTime).toLocaleTimeString()} UTC</span>
                  </p>
                )}
                <span className="font-mono text-[10px] text-textMuted block">
                  Support Correlation ID: {failure.correlationId}
                </span>

                {/* Helpful Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {failure.type === 'auth_required' && (
                    <Link
                      href="/login?next=/app/scan"
                      className="px-3 py-1 rounded-full bg-lemonChiffon text-black text-[11px] font-semibold hover:bg-sustainableLinen transition-colors inline-flex items-center gap-1"
                    >
                      Sign In to ContriBLens →
                    </Link>
                  )}
                  {failure.type === 'branch_not_found' && (
                    <button
                      type="button"
                      onClick={() => {
                        setBranch(failure.defaultBranch || 'main');
                        setFailure(null);
                      }}
                      className="px-3 py-1 rounded-full bg-lemonChiffon text-black text-[11px] font-semibold hover:bg-sustainableLinen transition-colors"
                    >
                      Use default branch ({failure.defaultBranch || 'main'})
                    </button>
                  )}
                  {failure.type !== 'auth_required' && (
                    <button
                      type="button"
                      onClick={() => handleScan()}
                      className="px-3 py-1 rounded-full bg-black border border-lemonChiffon/40 text-lemonChiffon text-[11px] font-semibold hover:bg-lemonChiffon hover:text-black transition-colors"
                    >
                      Retry Scan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleScan} className="space-y-6">
          {/* Large URL Input */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-2">
              GitHub Repository URL <span className="text-electricTangerine">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository or owner/repo"
                disabled={scanning}
                className="w-full pl-11 pr-4 py-3.5 bg-black border border-borderDark rounded-xl text-base text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon font-mono transition-colors"
              />
              <Search className="w-5 h-5 text-textMuted absolute left-3.5 top-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                Target Branch or Ref (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main, master, or release-v1"
                  disabled={scanning}
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-borderDark rounded-xl text-sm text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon focus:ring-1 focus:ring-lemonChiffon font-mono transition-colors"
                />
                <GitBranch className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
              </div>
              <span className="text-[10px] text-textMuted mt-1 block">Defaults to repository default branch.</span>
            </div>

            {/* Quick Sample Repositories */}
            <div>
              <span className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">
                Quick Sample Repositories
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'https://github.com/octocat/Hello-World',
                  'https://github.com/expressjs/express',
                  'https://github.com/pallets/flask',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleQuickFill(sample)}
                    disabled={scanning}
                    className="text-[11px] font-mono px-3 py-1 rounded-full bg-black border border-borderDark text-textPrimary hover:text-lemonChiffon hover:border-lemonChiffon/40 transition-colors"
                  >
                    {sample.split('/').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Checklist */}
          <div className="p-4 rounded-xl bg-black border border-borderDark space-y-3">
            <span className="block text-xs font-semibold text-textPrimary uppercase tracking-wider">
              Audit Scope &amp; Category Checklist
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'dependencies', label: 'Dependencies (OSV)' },
                { key: 'actions', label: 'CI/CD Workflows' },
                { key: 'secrets', label: 'Secret Redaction' },
                { key: 'health', label: 'Community Health' },
              ].map((cat) => (
                <label key={cat.key} className="flex items-center gap-2 cursor-pointer text-textMuted hover:text-textPrimary">
                  <input
                    type="checkbox"
                    checked={(categories as any)[cat.key]}
                    onChange={(e) =>
                      setCategories({ ...categories, [cat.key]: e.target.checked })
                    }
                    className="rounded bg-blackHole border-borderDark text-lemonChiffon focus:ring-lemonChiffon"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scan Action Button */}
          <button
            type="submit"
            disabled={scanning}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              scanning
                ? 'bg-electricTangerine text-cotton'
                : 'bg-lemonChiffon hover:bg-sustainableLinen text-black hover:shadow-lemonChiffon/20'
            }`}
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cotton" />
                <span>Processing Repository Scan...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Begin Evidence-First Scan</span>
              </>
            )}
          </button>
        </form>

        {/* Scanning Live Progress */}
        {scanning && (
          <div className="p-5 rounded-xl bg-black border border-borderDark space-y-3">
            <div className="flex items-center justify-between text-xs text-textMuted">
              <span className="font-semibold text-electricTangerine flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deterministic Pipeline Active
              </span>
              <span className="font-mono text-lemonChiffon">{STAGE_PROGRESS[stage]}%</span>
            </div>

            <p className="text-xs font-mono text-lemonChiffon bg-blackHole p-2.5 rounded border border-borderDark">
              {STAGE_LABELS[stage]}
            </p>

            <div className="w-full bg-blackHole rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-electricTangerine h-full transition-all duration-300 rounded-full"
                style={{ width: `${STAGE_PROGRESS[stage]}%` }}
              />
            </div>
          </div>
        )}

        {/* Scan Result Summary with complete vs complete_with_warnings */}
        {scanResult && !scanning && (
          <div className={`p-6 rounded-xl bg-black border space-y-5 animate-in fade-in duration-300 ${
            scanResult.hasWarnings ? 'border-electricTangerine/50' : 'border-lemonChiffon/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderDark">
              <div>
                <span className={`text-[11px] font-mono uppercase tracking-widest block mb-0.5 ${
                  scanResult.hasWarnings ? 'text-electricTangerine' : 'text-lemonChiffon'
                }`}>
                  {scanResult.hasWarnings ? 'Complete with Warnings' : 'Scan Completed Successfully'}
                </span>
                <h3 className="text-lg font-heading font-bold text-cotton font-mono">{scanResult.scan.repoName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-full bg-coffeeBean border border-lemonChiffon/30 text-lemonChiffon text-xs font-bold">
                  Readiness: {scanResult.scan.readinessScore}/100
                </div>
              </div>
            </div>

            {/* Findings breakdown badge row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-blackHole border border-borderDark">
                <div className="text-xl font-bold text-textPrimary">{scanResult.scan.findingsCount.total}</div>
                <div className="text-[11px] text-textMuted">Total Findings</div>
              </div>
              <div className="p-3 rounded-xl bg-blackHole border border-borderDark">
                <div className="text-xl font-bold text-rosewood">{scanResult.scan.findingsCount.critical}</div>
                <div className="text-[11px] text-textMuted">Critical Severity</div>
              </div>
              <div className="p-3 rounded-xl bg-blackHole border border-borderDark">
                <div className="text-xl font-bold text-electricTangerine">{scanResult.scan.findingsCount.high}</div>
                <div className="text-[11px] text-textMuted">High Severity</div>
              </div>
              <div className="p-3 rounded-xl bg-blackHole border border-emerald-500/30">
                <div className="text-xl font-bold text-emerald-400">
                  {scanResult.scan.goodFirstCount ?? 0}
                </div>
                <div className="text-[11px] text-emerald-300">Good First Fixes</div>
              </div>
              <div className="p-3 rounded-xl bg-blackHole border border-rosewood/40">
                <div className="text-xl font-bold text-cotton">
                  {scanResult.scan.maintainerLevelCount ?? 0}
                </div>
                <div className="text-[11px] text-textMuted">Maintainer Level</div>
              </div>
              <div className="p-3 rounded-xl bg-blackHole border border-borderDark">
                <div className="text-xl font-bold text-lemonChiffon">
                  {scanResult.scan.techStack.languages.length}
                </div>
                <div className="text-[11px] text-textMuted">Languages Detected</div>
              </div>
            </div>

            {/* Scan Diff & Progress Tracking Card */}
            {scanResult.scan.comparison && (
              <div className="p-4 rounded-xl bg-blackHole border border-lemonChiffon/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-lemonChiffon" />
                    <span className="text-xs font-bold text-lemonChiffon uppercase tracking-wider">
                      Scan Diff &amp; Progress Tracking
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-textMuted">
                    Comparing vs previous scan on this repository
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black border border-emerald-500/30">
                    <div className="text-emerald-400 font-bold font-mono text-base">
                      +{scanResult.scan.comparison.newCount}
                    </div>
                    <div className="text-[10px] text-textMuted uppercase">New Findings</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-blue-500/30">
                    <div className="text-blue-400 font-bold font-mono text-base">
                      {scanResult.scan.comparison.resolvedCount}
                    </div>
                    <div className="text-[10px] text-textMuted uppercase">Resolved Findings</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-borderDark">
                    <div className="text-textMuted font-bold font-mono text-base">
                      {scanResult.scan.comparison.unchangedCount}
                    </div>
                    <div className="text-[10px] text-textMuted uppercase">Unchanged</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-electricTangerine/30">
                    <div className="text-electricTangerine font-bold font-mono text-base">
                      {scanResult.scan.comparison.changedCount}
                    </div>
                    <div className="text-[10px] text-textMuted uppercase">Changed</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-rosewood/40">
                    <div className="text-cotton font-bold font-mono text-base">
                      {scanResult.scan.comparison.needsReviewCount}
                    </div>
                    <div className="text-[10px] text-textMuted uppercase">Needs Review</div>
                  </div>
                </div>

                {scanResult.scan.comparison.warnings && scanResult.scan.comparison.warnings.length > 0 && (
                  <div className="text-[11px] text-lemonChiffon bg-coffeeBean p-2.5 rounded-lg border border-lemonChiffon/20 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-electricTangerine shrink-0 mt-0.5" />
                    <span>
                      Fail-safe Active: {scanResult.scan.comparison.warnings.join(' ')} Unmatched findings classified as needs-review rather than resolved to prevent false positives.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Next actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => router.push('/app/findings')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Inspect Verified Findings ({scanResult.findings.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {scanResult.scan.goodFirstCount !== undefined && scanResult.scan.goodFirstCount > 0 && (
                <button
                  onClick={() => router.push('/app/findings?readinessLabel=good-first-contribution')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Good-First ({scanResult.scan.goodFirstCount})</span>
                </button>
              )}

              <button
                onClick={() => router.push('/app/contributions')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blackHole hover:bg-blackHole/80 text-textPrimary border border-borderDark font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View Tech Stack &amp; Routes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Previous Scans in this Workspace */}
      {recentScans.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-lemonChiffon" />
              <h3 className="text-sm font-heading font-bold text-textPrimary">Previous Repository Scans</h3>
            </div>
            <span className="text-[11px] font-mono text-textMuted">
              {recentScans.length} {recentScans.length === 1 ? 'repository' : 'repositories'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentScans.slice(0, 4).map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-xl bg-black border border-borderDark hover:border-lemonChiffon/30 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-heading font-bold font-mono text-textPrimary">{scan.repoName}</h4>
                    <span className="text-[10px] text-textMuted font-mono">
                      Ref: {scan.branch} • {new Date(scan.scannedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/20">
                    {scan.readinessScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-textMuted pt-1 border-t border-blackHole">
                  <span>{scan.findingsCount.total} findings</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRepoUrl(scan.repoUrl);
                        setBranch(scan.branch);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[10px] text-textMuted hover:text-lemonChiffon transition-colors underline"
                    >
                      Fill URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScan(scan);
                        router.push('/app/findings');
                      }}
                      className="px-2.5 py-1 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-[10px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read-Only Safety Card */}
      <div className="glass-panel p-5 rounded-2xl border border-borderDark text-xs text-textMuted flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-lemonChiffon shrink-0 mt-0.5" />
        <div>
          <strong className="text-textPrimary block mb-0.5">Read-Only Safety Guarantee</strong>
          Scans run strictly in read-only mode over public GitHub trees. File limits (120 files max) and byte boundaries are strictly enforced. Binary assets are ignored. Secret patterns are masked before any storage or model interaction.
        </div>
      </div>
    </div>
  );
}
