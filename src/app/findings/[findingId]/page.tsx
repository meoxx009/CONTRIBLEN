'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Shield,
  FileCode,
  Sparkles,
  Compass,
  ArrowLeft,
  Loader2,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Wrench,
  BookOpen,
  FileText,
  Info,
  TrendingUp,
  Layers,
  GitCompare,
} from 'lucide-react';
import type { Finding, GroundedExplanation, ExplanationMode } from '@/types';

const severityBadgeStyles: Record<string, string> = {
  CRITICAL: 'bg-[#6B0B0C] text-[#FFF8CA] border-[#6B0B0C]',
  HIGH: 'bg-[#2D120D] text-[#FF6D1F] border-[#FF6D1F]/50',
  MEDIUM: 'bg-[#222222] text-[#FFF8CA] border-[#FFF8CA]/30',
  LOW: 'bg-[#222222] text-[#CDE3E8] border-[#CDE3E8]/30',
  INFO: 'bg-[#222222] text-[#AAA9A1] border-[#AAA9A1]/30',
  critical: 'bg-[#6B0B0C] text-[#FFF8CA] border-[#6B0B0C]',
  high: 'bg-[#2D120D] text-[#FF6D1F] border-[#FF6D1F]/50',
  medium: 'bg-[#222222] text-[#FFF8CA] border-[#FFF8CA]/30',
  low: 'bg-[#222222] text-[#CDE3E8] border-[#CDE3E8]/30',
  info: 'bg-[#222222] text-[#AAA9A1] border-[#AAA9A1]/30',
};

function getReadinessBadge(label?: string) {
  switch (label) {
    case 'good-first-contribution':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50';
    case 'beginner-friendly':
      return 'bg-coffeeBean text-lemonChiffon border-lemonChiffon/40';
    case 'intermediate':
      return 'bg-[#2D120D] text-electricTangerine border-electricTangerine/40';
    case 'maintainer-assistance':
    default:
      return 'bg-rosewood/30 text-cotton border-rosewood/40';
  }
}

function getDiffStatusBadge(status?: string) {
  switch (status) {
    case 'new':
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    case 'resolved':
      return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
    case 'changed':
      return 'bg-coffeeBean text-electricTangerine border-electricTangerine/40';
    case 'needs-review':
      return 'bg-rosewood/30 text-lemonChiffon border-rosewood/40';
    case 'unchanged':
    default:
      return 'bg-black text-textMuted border-borderDark';
  }
}

export default function FindingDetailPage({
  params,
}: {
  params: Promise<{ findingId: string }>;
}) {
  const { findingId } = use(params);
  const router = useRouter();
  const { showToast } = useApp();

  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<GroundedExplanation | null>(null);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [updatingReview, setUpdatingReview] = useState(false);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('beginner');

  const handleToggleReview = async () => {
    if (!finding) return;
    setUpdatingReview(true);
    try {
      const nextReviewed = !finding.reviewed;
      const res = await fetch(`/api/findings/${finding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: nextReviewed }),
      });
      if (res.ok) {
        const data = await res.json();
        setFinding(data.finding);
        showToast(nextReviewed ? 'Marked finding as reviewed' : 'Unmarked review', 'info');
      }
    } catch {
      showToast('Failed to update review status', 'error');
    } finally {
      setUpdatingReview(false);
    }
  };

  useEffect(() => {
    async function loadFinding() {
      try {
        const directRes = await fetch(`/api/findings/${findingId}`);
        if (directRes.ok) {
          const data = await directRes.json();
          if (data.finding) {
            setFinding(data.finding);
            return;
          }
        }

        const res = await fetch('/api/findings');
        if (res.ok) {
          const data = await res.json();
          const allFindings: Finding[] = data.findings || [];
          const matched = allFindings.find((f) => f.id === findingId);
          if (matched) {
            setFinding(matched);
          }
        }
      } catch (err) {
        console.error('Failed to load finding details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinding();
  }, [findingId]);

  const handleCopyEvidence = () => {
    const textToCopy = finding?.redactedEvidence || finding?.evidence || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Evidence snippet copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = async () => {
    if (!finding) return;
    setExplaining(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findingId: finding.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data.explanation);
        showToast('Grounded explanation generated', 'success');
      } else {
        showToast('Failed to generate explanation', 'error');
      }
    } catch {
      showToast('Error requesting AI explanation', 'error');
    } finally {
      setExplaining(false);
    }
  };

  const handleCreateRoute = async () => {
    if (!finding) return;
    setCreatingRoute(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findingId: finding.id }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Contribution route generated', 'success');
        router.push(`/app/contributions?routeId=${data.route.id}`);
      } else {
        showToast('Failed to create route', 'error');
      }
    } catch {
      showToast('Error connecting to route planner', 'error');
    } finally {
      setCreatingRoute(false);
    }
  };

  const explanationModeText = useMemo(() => {
    if (!finding) return '';
    if (finding.explanationModes?.[explanationMode]) {
      return finding.explanationModes[explanationMode];
    }
    const file = finding.file || 'Repository Root';
    if (explanationMode === 'beginner') {
      return `This finding identifies "${finding.title}" in \`${file}\`. In open-source repositories, addressing this keeps configuration clean and avoids security vulnerabilities. As a new contributor, you can inspect the file, apply the recommended fix, and run local checks to verify your work.`;
    }
    if (explanationMode === 'developer') {
      return `Deterministic static check flagged \`${finding.ruleId}\` in \`${file}\` with verified severity **${finding.severity}**. Remediation: ${finding.fixHint}. Validate changes locally using existing tests or linters without touching unrelated code.`;
    }
    return `Hygiene finding: **${finding.severity}** severity risk in \`${file}\`. Impact: ${finding.impact}. Ensure regression verification and adherence to project maintainer contribution guidelines.`;
  }, [finding, explanationMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-[#F5F3ED]">
        <Loader2 className="w-8 h-8 text-[#FF6D1F] animate-spin mb-4" />
        <p className="text-sm text-[#AAA9A1]">Loading finding evidence...</p>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F3ED] px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-[#FF6D1F] mx-auto" />
          <h1 className="text-2xl font-bold">Finding Not Found</h1>
          <p className="text-[#AAA9A1]">
            Finding ID <code className="text-[#FFF8CA]">{findingId}</code> could not be located in this workspace.
          </p>
          <Link
            href="/app/findings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF8CA] text-[#000000] font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Findings
          </Link>
        </div>
      </div>
    );
  }

  const confidenceDisplay =
    typeof finding.confidence === 'number'
      ? `${Math.round(finding.confidence * 100)}%`
      : finding.confidence || 'HIGH';

  const verificationStatus =
    finding.category === 'secret'
      ? 'Needs Review (Potential Credential)'
      : 'Verified by Deterministic Static Analysis';

  const readiness = finding.readiness;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F3ED] px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/app/findings"
            className="inline-flex items-center gap-2 text-sm text-[#AAA9A1] hover:text-[#FFF8CA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Findings
          </Link>
        </div>

        {/* 1 & 2. What was found & Where it was found */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                  severityBadgeStyles[finding.severity]
                }`}
              >
                Severity: {finding.severity}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#222222] text-[#CDE3E8] border border-[#CDE3E8]/30 uppercase tracking-wider">
                Category: {finding.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#222222] text-[#AAA9A1] border border-white/10 font-mono">
                Rule ID: {finding.ruleId || 'DETERMINISTIC'}
              </span>
              {finding.diffStatus && (
                <span className={`text-xs px-2.5 py-1 rounded-md uppercase font-mono font-semibold border ${getDiffStatusBadge(finding.diffStatus)}`}>
                  Diff: {finding.diffStatus}
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleReview}
                disabled={updatingReview}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                  finding.reviewed
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                    : 'bg-[#222222] text-[#AAA9A1] border-white/10 hover:text-[#FFF8CA] hover:border-[#FFF8CA]/30'
                }`}
              >
                {updatingReview ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : finding.reviewed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AAA9A1]" />
                )}
                <span>{finding.reviewed ? 'Reviewed ✓' : 'Mark as Reviewed'}</span>
              </button>
            </div>
            <div className="text-xs text-[#AAA9A1]">
              Scanned: {new Date(finding.createdAt).toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-electricTangerine">
              1. What was found
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F3ED] leading-snug mt-1">
              {finding.title}
            </h1>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-textMuted block mb-1">
              2. Where it was found
            </span>
            <div className="flex items-center gap-2 text-sm font-mono text-[#AAA9A1] bg-[#000000]/60 px-3 py-2 rounded-lg border border-white/5 overflow-x-auto">
              <FileCode className="w-4 h-4 text-[#FF6D1F] shrink-0" />
              <span>{finding.file || 'Repository Root'}</span>
              {(finding.lineStart || finding.line) && (
                <span className="text-[#FFF8CA] font-semibold">
                  :Line {finding.lineStart || finding.line}
                  {finding.lineEnd && finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* 5, 6, 7, 8. Severity, Confidence, Verification, Detection Source */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-borderDark text-xs">
            <div className="p-3 rounded-xl bg-black/50 border border-borderDark">
              <span className="text-textMuted block mb-0.5">5. Severity</span>
              <span className="font-bold text-lemonChiffon uppercase">{finding.severity}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-borderDark">
              <span className="text-textMuted block mb-0.5">6. Confidence</span>
              <span className="font-bold text-botticelli">{confidenceDisplay}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-borderDark">
              <span className="text-textMuted block mb-0.5">7. Verification</span>
              <span className="font-bold text-lemonChiffon truncate block">{verificationStatus}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-borderDark">
              <span className="text-textMuted block mb-0.5">8. Detection Tool</span>
              <span className="font-bold text-textPrimary truncate block">{finding.sourceTool || 'Static Engine'}</span>
            </div>
          </div>
        </div>

        {/* Contribution Readiness & Urgency Separation Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lemonChiffon" />
              <h2 className="text-base font-semibold text-[#F5F3ED]">
                Contribution Readiness &amp; Risk Separation
              </h2>
            </div>
            <span className="text-xs font-mono text-[#AAA9A1]">
              Invariant: Urgency ≠ Readiness
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Risk / Urgency Card */}
            <div className="p-4 rounded-xl bg-black/60 border border-borderDark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-textMuted uppercase font-semibold text-[10px]">
                  Risk / Urgency Priority
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rosewood/30 text-cotton border border-rosewood/50">
                  {finding.urgencyLabel || 'medium'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-electricTangerine">
                  {finding.urgencyScore ?? 50}
                </span>
                <span className="text-textMuted text-[10px] font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-textMuted leading-relaxed">
                Urgency measures how critically this finding impacts security posture. High urgency findings require maintainer attention and must not be marked beginner-friendly.
              </p>
            </div>

            {/* Contribution Readiness Card */}
            {readiness ? (
              <div className="p-4 rounded-xl bg-black/60 border border-lemonChiffon/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-textMuted uppercase font-semibold text-[10px]">
                    Contribution Readiness Score
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getReadinessBadge(readiness.label)}`}>
                    {readiness.label.replace(/-/g, ' ')}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-lemonChiffon">
                    {readiness.total}
                  </span>
                  <span className="text-textMuted text-[10px] font-mono">/ 100</span>
                  {readiness.estimatedMinutes && (
                    <span className="text-textMuted text-[10px] font-mono ml-auto">
                      ~{readiness.estimatedMinutes} mins
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-lemonChiffon/80 leading-relaxed">
                  Deterministic assessment of scope bounded-ness, testability, and clarity for open-source contributors.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/60 border border-borderDark flex items-center justify-center text-textMuted text-xs">
                Readiness evaluation available via scan summary
              </div>
            )}
          </div>

          {/* 5 Weighted Factor Breakdown */}
          {readiness && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-3">
              <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider block">
                5-Factor Deterministic Criteria Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#222222] border border-white/5 space-y-1">
                  <div className="text-textMuted text-[10px]">Evidence Clarity</div>
                  <div className="font-mono font-bold text-lemonChiffon">
                    {readiness.evidenceClarity} <span className="text-textMuted font-normal">/ 25</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#222222] border border-white/5 space-y-1">
                  <div className="text-textMuted text-[10px]">Scope Simplicity</div>
                  <div className="font-mono font-bold text-lemonChiffon">
                    {readiness.scopeSimplicity} <span className="text-textMuted font-normal">/ 20</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#222222] border border-white/5 space-y-1">
                  <div className="text-textMuted text-[10px]">Testability</div>
                  <div className="font-mono font-bold text-lemonChiffon">
                    {readiness.testability} <span className="text-textMuted font-normal">/ 20</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#222222] border border-white/5 space-y-1">
                  <div className="text-textMuted text-[10px]">Skill Accessibility</div>
                  <div className="font-mono font-bold text-lemonChiffon">
                    {readiness.skillAccessibility} <span className="text-textMuted font-normal">/ 20</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#222222] border border-white/5 space-y-1">
                  <div className="text-textMuted text-[10px]">Context Completeness</div>
                  <div className="font-mono font-bold text-lemonChiffon">
                    {readiness.contextCompleteness} <span className="text-textMuted font-normal">/ 15</span>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              {readiness.reasons.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-lemonChiffon font-semibold">Positive Reasons:</span>
                  <ul className="space-y-1">
                    {readiness.reasons.map((r, i) => (
                      <li key={i} className="text-[11px] text-[#AAA9A1] flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Blockers */}
              {readiness.blockers && readiness.blockers.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rosewood font-semibold">Blockers:</span>
                  <ul className="space-y-1">
                    {readiness.blockers.map((b, i) => (
                      <li key={i} className="text-[11px] text-cotton flex items-start gap-1.5">
                        <span className="text-rosewood mt-0.5">✕</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence Chain / Trust Trail (8 Traceable Steps) */}
        {finding.evidenceChain && finding.evidenceChain.steps && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-botticelli" />
                <h2 className="text-base font-semibold text-[#F5F3ED]">
                  Evidence Chain / Trust Trail (8 Traceable Steps)
                </h2>
              </div>
              <span className="text-xs font-mono text-[#AAA9A1]">
                Hash: {finding.evidenceChain.evidenceHash?.slice(0, 10)}...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {finding.evidenceChain.steps.map((st) => (
                <div
                  key={st.step}
                  className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-coffeeBean text-lemonChiffon font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {st.step}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-[#F5F3ED] text-xs truncate">
                        {st.label}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#222222] text-lemonChiffon border border-lemonChiffon/20 uppercase shrink-0">
                        {st.verifiedBy}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAA9A1] leading-relaxed">
                      {st.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Evidence Panel (Redacted) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF6D1F]" />
              <h2 className="text-base font-semibold text-[#F5F3ED] uppercase tracking-wider">
                4. Verified Evidence (Redacted)
              </h2>
            </div>
            <button
              onClick={handleCopyEvidence}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000]/60 border border-white/10 text-xs text-[#AAA9A1] hover:text-[#FFF8CA] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Evidence'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#000000] border border-white/10 text-xs font-mono text-[#FAF3E1] whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {finding.redactedEvidence || finding.evidence || 'No raw evidence snippet required for this structural finding.'}
          </pre>
          <p className="text-[11px] text-textMuted">
            Zero raw secrets are stored or logged. Sensitive credentials are conservatively masked with asterisks.
          </p>
        </div>

        {/* 3 & 11. Why it Matters & Recommended Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-3">
            <h3 className="text-xs font-semibold text-[#FF6D1F] uppercase tracking-wider">
              3. Why it Matters (Impact)
            </h3>
            <p className="text-sm text-[#F5F3ED]/90 leading-relaxed">{finding.impact}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-3">
            <h3 className="text-xs font-semibold text-[#FFF8CA] uppercase tracking-wider">
              11. Recommended Action
            </h3>
            <p className="text-sm text-[#F5F3ED]/90 leading-relaxed">{finding.fixHint}</p>
          </div>
        </div>

        {/* 9 & 10. What is Confirmed vs. What is NOT Confirmed (Limitations) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4">
          <h2 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-botticelli" />
            <span>9 &amp; 10. Scanner Scope &amp; Limitations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Confirmed */}
            <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 9. What is Confirmed
              </span>
              <ul className="space-y-1.5 text-textMuted pl-2 list-disc">
                <li>Deterministic text pattern or manifest configuration exists in public source files.</li>
                <li>Severity assigned based on static AST/manifest rules without AI speculation.</li>
                <li>Evidence has been cryptographically hashed and verified against repository tree.</li>
              </ul>
            </div>

            {/* Not Confirmed */}
            <div className="p-4 rounded-xl bg-black/60 border border-rosewood/40 space-y-2">
              <span className="font-bold text-rosewood flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> 10. What is NOT Confirmed (Limitations)
              </span>
              <ul className="space-y-1.5 text-textMuted pl-2 list-disc">
                <li>Runtime exploitability is NOT verified (ContribLens never executes repository code).</li>
                <li>Secret liveness or active cloud validity is NOT checked against third-party providers.</li>
                <li>Private branch changes or uncommitted repository states are NOT evaluated.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Explanation Depth Switcher (Beginner / Developer / Maintainer) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lemonChiffon" />
              <div>
                <h2 className="text-base font-semibold text-[#F5F3ED]">
                  Explanation Depth &amp; Grounded Perspectives
                </h2>
                <span className="text-xs text-[#AAA9A1]">
                  Same verified evidence explained for 3 contributor skill levels
                </span>
              </div>
            </div>

            {/* Depth Switcher Pills */}
            <div className="flex items-center gap-1 bg-black p-1 rounded-full border border-borderDark">
              {(['beginner', 'developer', 'maintainer'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setExplanationMode(mode)}
                  className={`px-3 py-1 text-xs font-mono capitalize rounded-full transition-all ${
                    explanationMode === mode
                      ? 'bg-lemonChiffon text-black font-semibold'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-black/60 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lemonChiffon capitalize">
                {explanationMode} Explanation Depth
              </span>
              <span className="text-textMuted font-mono text-[10px]">
                Deterministic &amp; Evidence-Grounded
              </span>
            </div>
            <p className="text-sm text-[#F5F3ED] leading-relaxed">
              {explanationModeText}
            </p>
          </div>
        </div>

        {/* AI Grounded Explanation with Gamma 4 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6D1F]" />
              <div>
                <h2 className="text-base font-semibold text-[#F5F3ED]">
                  Gamma 4 Deep Explanation Query
                </h2>
                <span className="text-xs text-textMuted">Evidence-grounded assistance (never mutates severity)</span>
              </div>
            </div>
            {!explanation && (
              <button
                onClick={handleExplain}
                disabled={explaining}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF8CA] text-[#000000] font-medium text-xs hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                {explaining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {explaining ? 'Grounding...' : 'Explain with Gamma 4'}
              </button>
            )}
          </div>

          {explanation ? (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl bg-[#000000]/60 border border-[#FFF8CA]/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#AAA9A1]">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                    explanation.generatedBy === 'gemini'
                      ? 'bg-black text-[#FFF8CA] border-[#FFF8CA]/30'
                      : 'bg-[#2D120D] text-[#FFF8CA] border-[#FF6D1F]/40'
                  }`}>
                    {explanation.generatedBy === 'gemini'
                      ? 'Grounded via Gamma 4 Adapter'
                      : 'Fallback Used: Deterministic Planner'}
                  </span>
                  <span>Estimated effort: <strong className="text-[#F5F3ED]">{explanation.estimatedEffort}</strong></span>
                </div>

                <p className="text-sm text-[#F5F3ED] leading-relaxed">{explanation.explanation}</p>

                <div className="pt-3 border-t border-white/5 space-y-1">
                  <span className="text-xs text-[#FF6D1F] font-semibold uppercase">Risk Context:</span>
                  <p className="text-xs text-[#AAA9A1]">{explanation.riskContext}</p>
                </div>

                {/* 12. Required Skills */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-xs text-textMuted block mb-1 font-semibold">12. Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {explanation.skillsNeeded.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-[#222222] text-[#CDE3E8] border border-[#CDE3E8]/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#AAA9A1]">
              Generate a beginner-friendly, evidence-grounded explanation and contributor readiness breakdown using Gamma 4.
            </p>
          )}
        </div>

        {/* 13, 14, 15, 16, 17, 18. Contributor Roadmap & Next Actions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#222222]/80 border border-[#FAF3E1]/10 space-y-6">
          <h2 className="text-base font-semibold text-textPrimary flex items-center gap-2">
            <Compass className="w-5 h-5 text-electricTangerine" />
            <span>Contributor Roadmap &amp; Actions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/60 border border-borderDark">
              <span className="font-semibold text-lemonChiffon block mb-1">13. Target Files to Inspect</span>
              <code className="text-botticelli font-mono block">{finding.file || 'Repository Root'}</code>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-borderDark">
              <span className="font-semibold text-lemonChiffon block mb-1">14. Suggested Verification Tests</span>
              <span className="text-textMuted">Run local unit tests or linter matching file extension.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-borderDark flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-textMuted flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-botticelli" />
              <span>18. References: Static scanner rules &amp; GitHub Security Best Practices</span>
            </div>

            <div className="flex items-center gap-3">
              {finding.disclosureMode === 'security-disclosure' || finding.category === 'secret' ? (
                <div className="px-5 py-2.5 rounded-full bg-rosewood/30 text-cotton text-xs font-semibold flex items-center gap-2 border border-rosewood">
                  <Lock className="w-4 h-4 text-lemonChiffon" />
                  <span>Public Draft Blocked (Private Disclosure Only)</span>
                </div>
              ) : (
                <button
                  onClick={handleCreateRoute}
                  disabled={creatingRoute}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6D1F] hover:bg-[#FF6D1F]/90 text-[#000000] font-semibold text-xs shadow-lg shadow-[#FF6D1F]/20 transition-all disabled:opacity-50"
                >
                  {creatingRoute ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                  <span>{creatingRoute ? 'Building Route...' : 'Create Contribution Route'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
