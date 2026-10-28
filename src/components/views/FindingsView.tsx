'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Shield,
  Filter,
  Search,
  Sparkles,
  Compass,
  FileCode,
  Lock,
  ArrowRight,
  Loader2,
  X,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Layers,
  TrendingUp,
  GitCompare,
} from 'lucide-react';
import type { Finding, Severity, GroundedExplanation, ExplanationMode } from '@/types';

const SEVERITY_OPTIONS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const;

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'dependency', label: 'Dependency' },
  { id: 'github-actions', label: 'GitHub Actions' },
  { id: 'secret', label: 'Secret' },
  { id: 'repository-health', label: 'Repository Health' },
] as const;

const READINESS_OPTIONS = [
  { id: 'ALL', label: 'All Readiness' },
  { id: 'good-first-contribution', label: 'Good First (80+)' },
  { id: 'beginner-friendly', label: 'Beginner (60-79)' },
  { id: 'intermediate', label: 'Intermediate (40-59)' },
  { id: 'maintainer-assistance', label: 'Maintainer (<40)' },
] as const;

const DIFF_OPTIONS = [
  { id: 'ALL', label: 'All Diff States' },
  { id: 'new', label: 'New' },
  { id: 'unchanged', label: 'Unchanged' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'changed', label: 'Changed' },
  { id: 'needs-review', label: 'Needs Review' },
] as const;

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 5,
  critical: 5,
  HIGH: 4,
  high: 4,
  MEDIUM: 3,
  medium: 3,
  LOW: 2,
  low: 2,
  INFO: 1,
  info: 1,
};

function getConfidenceScore(conf: number | string | undefined): number {
  if (typeof conf === 'number') return conf;
  if (!conf) return 0.5;
  const upper = String(conf).toUpperCase();
  if (upper === 'HIGH') return 0.85;
  if (upper === 'MEDIUM') return 0.70;
  if (upper === 'LOW') return 0.50;
  return 0.50;
}

function getSeverityBadge(sev: Severity | string) {
  const s = sev?.toUpperCase();
  switch (s) {
    case 'CRITICAL':
      return 'bg-koraBurgundy text-koraOffWhite border border-koraRed';
    case 'HIGH':
      return 'bg-koraBurgundy/60 text-koraRed border border-koraRed/40';
    case 'MEDIUM':
      return 'bg-koraSlate/50 text-koraOffWhite border border-koraSlate';
    case 'LOW':
      return 'bg-koraCharcoal-card text-koraSecondary border border-koraCharcoal-border';
    case 'INFO':
    default:
      return 'bg-koraCharcoal-dark text-koraSecondary border border-koraCharcoal-border';
  }
}

function getReadinessBadge(label?: string) {
  switch (label) {
    case 'good-first-contribution':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50';
    case 'beginner-friendly':
      return 'bg-koraBurgundy/40 text-koraOffWhite border-koraBurgundy';
    case 'intermediate':
      return 'bg-koraSlate/40 text-koraSecondary border-koraSlate/60';
    case 'maintainer-assistance':
    default:
      return 'bg-koraCharcoal-card text-koraSecondary border-koraCharcoal-border';
  }
}

function getDiffStatusBadge(status?: string) {
  switch (status) {
    case 'new':
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    case 'resolved':
      return 'bg-koraSlate/60 text-koraOffWhite border-koraSlate';
    case 'changed':
      return 'bg-koraBurgundy/50 text-koraRed border-koraRed/40';
    case 'needs-review':
      return 'bg-koraBurgundy/40 text-koraOffWhite border-koraBurgundy';
    case 'unchanged':
    default:
      return 'bg-koraCharcoal-dark text-koraSecondary border-koraCharcoal-border';
  }
}

export default function FindingsView() {
  const router = useRouter();
  const { activeScan, showToast } = useApp();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [readinessFilter, setReadinessFilter] = useState<string>('ALL');
  const [diffFilter, setDiffFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive actions & explanation depth mode
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('beginner');
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<GroundedExplanation | null>(null);
  const [creatingRouteId, setCreatingRouteId] = useState<string | null>(null);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [copiedEvidence, setCopiedEvidence] = useState(false);

  useEffect(() => {
    fetchFindings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScan, severityFilter, categoryFilter, readinessFilter, diffFilter]);

  const fetchFindings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (activeScan) params.set('scanId', activeScan.id);
      if (severityFilter !== 'ALL') params.set('severity', severityFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (readinessFilter !== 'ALL') params.set('readinessLabel', readinessFilter);
      if (diffFilter !== 'ALL') params.set('diffStatus', diffFilter);

      const res = await fetch(`/api/findings?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load findings (HTTP ${res.status})`);
      }
      const data = await res.json();
      const loaded: Finding[] = data.findings || [];

      // Sort deterministically: Severity rank descending, then Confidence descending
      const sorted = [...loaded].sort((a, b) => {
        const sevA = SEVERITY_RANK[a.severity?.toUpperCase()] || 0;
        const sevB = SEVERITY_RANK[b.severity?.toUpperCase()] || 0;
        if (sevB !== sevA) return sevB - sevA;
        return getConfidenceScore(b.confidence) - getConfidenceScore(a.confidence);
      });

      setFindings(sorted);
      if (sorted.length > 0) {
        setSelectedFinding((prev) => {
          if (!prev) return sorted[0];
          const exists = sorted.find((f) => f.id === prev.id);
          return exists || sorted[0];
        });
      } else {
        setSelectedFinding(null);
      }
    } catch (err: any) {
      console.error('Failed to load findings:', err);
      setFetchError(err.message || 'Failed to load verified findings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReview = async (finding: Finding) => {
    setUpdatingReviewId(finding.id);
    try {
      const nextReviewed = !finding.reviewed;
      const res = await fetch(`/api/findings/${finding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: nextReviewed }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedFinding: Finding = data.finding;
        setFindings((prev) =>
          prev.map((f) => (f.id === updatedFinding.id ? updatedFinding : f))
        );
        if (selectedFinding?.id === updatedFinding.id) {
          setSelectedFinding(updatedFinding);
        }
        showToast(
          nextReviewed ? 'Marked finding as reviewed' : 'Unmarked review status',
          'info'
        );
      } else {
        showToast('Failed to update review status', 'error');
      }
    } catch {
      showToast('Error connecting to review API', 'error');
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleCopyEvidence = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEvidence(true);
    showToast('Evidence snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  const handleRequestExplanation = async (finding: Finding) => {
    setExplainingId(finding.id);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findingId: finding.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentExplanation(data.explanation);
      } else {
        showToast(data.error || 'Failed to explain finding', 'error');
      }
    } catch {
      showToast('Network error while requesting explanation', 'error');
    } finally {
      setExplainingId(null);
    }
  };

  const handleCreateRoute = async (finding: Finding) => {
    setCreatingRouteId(finding.id);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findingId: finding.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Contribution route created!', 'success');
        router.push(`/app/contributions?routeId=${data.route.id}`);
      } else {
        showToast(data.error || 'Failed to create route', 'error');
      }
    } catch {
      showToast('Network error while creating route', 'error');
    } finally {
      setCreatingRouteId(null);
    }
  };

  // Filter findings based on text search query
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        (f.file && f.file.toLowerCase().includes(q)) ||
        f.ruleId.toLowerCase().includes(q) ||
        f.impact.toLowerCase().includes(q)
      );
    });
  }, [findings, searchQuery]);

  // Aggregate count metrics
  const counts = useMemo(() => {
    const bySev: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    let reviewed = 0;
    let goodFirst = 0;
    let maintainerAssistance = 0;
    let resolved = 0;

    findings.forEach((f) => {
      const sev = f.severity?.toUpperCase() || 'INFO';
      if (bySev[sev] !== undefined) bySev[sev]++;
      if (f.reviewed) reviewed++;

      const rLabel = f.readiness?.label;
      if (rLabel === 'good-first-contribution') goodFirst++;
      if (rLabel === 'maintainer-assistance') maintainerAssistance++;
      if (f.diffStatus === 'resolved') resolved++;
    });

    return { bySev, reviewed, goodFirst, maintainerAssistance, resolved, total: findings.length };
  }, [findings]);

  // Derived 3-depth explanation text for selected finding
  const explanationText = useMemo(() => {
    if (!selectedFinding) return '';
    if (selectedFinding.explanationModes?.[explanationMode]) {
      return selectedFinding.explanationModes[explanationMode];
    }
    const file = selectedFinding.file || 'Repository Root';
    if (explanationMode === 'beginner') {
      return `This finding identifies "${selectedFinding.title}" in \`${file}\`. Addressing this improves repository security posture and ensures clean standards. As an open-source contributor, you will inspect the file, apply the recommended action, and verify it locally before submitting a clean pull request.`;
    }
    if (explanationMode === 'developer') {
      return `Deterministic rule \`${selectedFinding.ruleId}\` flagged in \`${file}\` with verified severity **${selectedFinding.severity}**. Action required: ${selectedFinding.fixHint}. Validate changes locally using existing tests or linter checks.`;
    }
    return `Maintainer hygiene finding: **${selectedFinding.severity}** severity risk in \`${file}\`. Impact: ${selectedFinding.impact}. Requires strict adherence to disclosure policy and non-breaking regression boundaries.`;
  }, [selectedFinding, explanationMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 text-textPrimary">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-koraCharcoal-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-koraOffWhite flex items-center gap-2">
            <span>Verified Findings</span>
            {activeScan && (
              <span className="text-xs font-mono font-medium text-koraOffWhite bg-koraBurgundy/40 px-3 py-1 rounded-full border border-koraBurgundy">
                {activeScan.repoName}
              </span>
            )}
          </h1>
          <p className="text-xs text-koraSecondary mt-1">
            Deterministic security, manifest, and health findings with exact evidence, Contribution Readiness scoring, and grounded contributor trails.
          </p>
        </div>

        <button
          onClick={() => router.push('/app/scan')}
          className="px-4 py-2 rounded-full bg-koraCharcoal-surface hover:bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border text-xs font-medium transition-colors self-start md:self-auto"
        >
          Scan Another Repo
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-koraCharcoal-border bg-koraCharcoal-surface/90 shadow-liquid-glass space-y-3.5">
        {/* Row 1: Search & Severity Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="w-full md:w-80 relative shrink-0">
            <Search className="w-4 h-4 text-koraSecondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, files, or rules..."
              aria-label="Search findings by title, file, or rule ID"
              className="w-full pl-9 pr-3 py-1.5 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-lg text-xs text-koraOffWhite placeholder-koraSecondary/40 focus:outline-none focus:border-koraRed"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Severity filter">
            <span className="text-xs text-koraSecondary font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {SEVERITY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                  severityFilter === s
                    ? 'bg-koraRed text-white font-semibold shadow-glow-red'
                    : 'text-koraSecondary hover:text-koraOffWhite bg-koraCharcoal-dark border border-koraCharcoal-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category Filter */}
        <div className="pt-2.5 border-t border-koraCharcoal-border/60 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Category filter">
          <span className="text-xs text-koraSecondary font-medium shrink-0 mr-1">Category:</span>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                categoryFilter === c.id
                  ? 'bg-koraBurgundy/60 text-koraOffWhite border border-koraBurgundy font-semibold'
                  : 'text-koraSecondary hover:text-koraOffWhite bg-koraCharcoal-dark border border-koraCharcoal-border'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Row 3 Filters: Contribution Readiness & Diff Status */}
        <div className="pt-2.5 border-t border-koraCharcoal-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Readiness Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-koraSecondary font-medium flex items-center gap-1 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-koraRed" /> Readiness:
            </span>
            {READINESS_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReadinessFilter(r.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors shrink-0 ${
                  readinessFilter === r.id
                    ? 'bg-koraRed text-white font-semibold shadow-glow-red'
                    : 'text-koraSecondary hover:text-koraOffWhite bg-koraCharcoal-dark border border-koraCharcoal-border'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Diff Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-koraSecondary font-medium flex items-center gap-1 shrink-0">
              <GitCompare className="w-3.5 h-3.5 text-koraSlate" /> Diff Status:
            </span>
            {DIFF_OPTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDiffFilter(d.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors shrink-0 ${
                  diffFilter === d.id
                    ? 'bg-koraBurgundy/60 text-koraOffWhite border border-koraBurgundy font-semibold'
                    : 'text-koraSecondary hover:text-koraOffWhite bg-koraCharcoal-dark border border-koraCharcoal-border'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count Summary */}
        <div className="pt-3 border-t border-koraCharcoal-border flex flex-wrap items-center justify-between text-xs text-koraSecondary gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <strong className="text-koraOffWhite">{filteredFindings.length}</strong> of{' '}
              <strong className="text-koraOffWhite">{counts.total}</strong> findings
            </span>
            <span className="text-koraCharcoal-borderLight">•</span>
            <span className="text-emerald-400 font-medium">{counts.goodFirst} Good First</span>
            <span className="text-koraSecondary font-medium">{counts.maintainerAssistance} Maintainer Assistance</span>
            <span className="text-koraCharcoal-borderLight">•</span>
            <span className="text-koraOffWhite font-medium">{counts.bySev.CRITICAL} Critical</span>
            <span className="text-koraRed font-medium">{counts.bySev.HIGH} High</span>
            <span className="text-koraSlate font-medium">{counts.bySev.MEDIUM} Medium</span>
            <span className="text-koraSecondary font-medium">{counts.bySev.LOW} Low</span>
          </div>

          <div className="flex items-center gap-3">
            {counts.resolved > 0 && (
              <span className="text-koraOffWhite font-mono text-[11px]">
                {counts.resolved} Resolved
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{counts.reviewed} Reviewed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-koraBurgundy/30 border border-koraBurgundy text-koraOffWhite flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-koraRed shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchFindings}
            className="px-3 py-1 rounded-md bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 p-8 rounded-2xl border border-koraCharcoal-border bg-koraCharcoal-surface/90">
          <Loader2 className="w-8 h-8 text-koraRed animate-spin mx-auto mb-3" />
          <p className="text-xs text-koraSecondary font-mono">Loading verified findings...</p>
        </div>
      ) : filteredFindings.length > 0 ? (
        /* Master-Detail Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Accessible Finding List (Col span 5) */}
          <div className="lg:col-span-5 space-y-3" role="region" aria-label="Findings List">
            <div className="flex items-center justify-between text-xs font-semibold text-koraSecondary uppercase tracking-wider mb-1">
              <span>Sorted by Severity &amp; Confidence</span>
              <span>{filteredFindings.length} items</span>
            </div>

            <ul role="list" className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1 no-scrollbar">
              {filteredFindings.map((finding) => {
                const isSelected = selectedFinding?.id === finding.id;
                const isCritical = finding.severity?.toUpperCase() === 'CRITICAL';
                const isHigh = finding.severity?.toUpperCase() === 'HIGH';
                const readiness = finding.readiness;
                const topReason = readiness?.reasons?.[0];

                return (
                  <li role="listitem" key={finding.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFinding(finding)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? isCritical
                            ? 'bg-koraBurgundy/40 border-koraRed shadow-glow-red/20'
                            : isHigh
                            ? 'bg-koraBurgundy/25 border-koraRed/60 shadow-glow-red/10'
                            : 'bg-koraCharcoal-surface border-koraRed/50 shadow-liquid-glass'
                          : 'bg-koraCharcoal-surface/60 border-koraCharcoal-border hover:border-koraCharcoal-borderLight hover:bg-koraCharcoal-surface'
                      }`}
                    >
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] mb-2 gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
                            {finding.severity}
                          </span>

                          {finding.urgencyScore !== undefined && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary">
                              Urg: {finding.urgencyScore}
                            </span>
                          )}

                          {readiness && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getReadinessBadge(readiness.label)}`}>
                              Readiness: {readiness.total}/100
                            </span>
                          )}

                          {finding.diffStatus && finding.diffStatus !== 'unchanged' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getDiffStatusBadge(finding.diffStatus)}`}>
                              {finding.diffStatus}
                            </span>
                          )}

                          {finding.reviewed && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Reviewed
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-koraSecondary">
                          {typeof finding.confidence === 'number'
                            ? `${Math.round(finding.confidence * 100)}%`
                            : finding.confidence || 'HIGH'}{' '}
                          Conf.
                        </span>
                      </div>

                      <h4 className="text-xs font-heading font-semibold text-koraOffWhite line-clamp-2">
                        {finding.title}
                      </h4>

                      {/* Top Readiness reason preview */}
                      {topReason && (
                        <p className="mt-1.5 text-[11px] text-koraSecondary line-clamp-1 italic">
                          💡 {topReason}
                        </p>
                      )}

                      <div className="mt-2.5 text-[11px] text-koraSlate font-mono flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{finding.file || 'Repository Root'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-koraSecondary" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: Finding Detail Panel (Col span 7) */}
          <div className="lg:col-span-7">
            {selectedFinding ? (
              <div
                className={`p-6 sm:p-8 rounded-2xl border transition-all space-y-6 shadow-liquid-glass backdrop-blur-2xl ${
                  selectedFinding.severity?.toUpperCase() === 'CRITICAL'
                    ? 'border-koraRed/60 bg-koraBurgundy/20'
                    : selectedFinding.severity?.toUpperCase() === 'HIGH'
                    ? 'border-koraRed/40 bg-koraBurgundy/15'
                    : 'border-koraCharcoal-border bg-koraCharcoal-surface/90'
                }`}
              >
                
                {/* Header: Title, Category, Severity, Rule ID, Diff Status, Review Toggle */}
                <div className="space-y-3 pb-4 border-b border-koraCharcoal-border">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(selectedFinding.severity)}`}>
                        {selectedFinding.severity}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary uppercase">
                        {selectedFinding.category}
                      </span>
                      <span className="text-[11px] font-mono text-koraOffWhite">
                        Rule: {selectedFinding.ruleId}
                      </span>
                      {selectedFinding.diffStatus && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${getDiffStatusBadge(selectedFinding.diffStatus)}`}>
                          Diff: {selectedFinding.diffStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Review State Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleReview(selectedFinding)}
                        disabled={updatingReviewId === selectedFinding.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                          selectedFinding.reviewed
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/60'
                            : 'bg-koraCharcoal-card text-koraSecondary border-koraCharcoal-border hover:text-koraOffWhite'
                        }`}
                      >
                        {updatingReviewId === selectedFinding.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : selectedFinding.reviewed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-koraSecondary" />
                        )}
                        <span>{selectedFinding.reviewed ? 'Reviewed ✓' : 'Mark as Reviewed'}</span>
                      </button>

                      {/* Deep Link to Detail Page */}
                      <Link
                        href={`/app/findings/${selectedFinding.id}`}
                        className="p-1.5 rounded-md text-koraSecondary hover:text-koraOffWhite hover:bg-koraCharcoal-dark border border-koraCharcoal-border transition-colors"
                        title="Open finding deep link in dedicated page"
                        aria-label="Open finding deep link in dedicated page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-koraOffWhite leading-snug">
                    {selectedFinding.title}
                  </h3>

                  {/* Exact File and Line clearly shown */}
                  <div className="p-3 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border flex items-center justify-between gap-2 text-xs font-mono text-koraSlate">
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-4 h-4 text-koraRed shrink-0" />
                      <span>Exact Location: </span>
                      <strong className="text-koraOffWhite truncate">
                        {selectedFinding.file || 'Repository Root'}
                        {(selectedFinding.lineStart || selectedFinding.line) && (
                          <span className="text-koraOffWhite ml-1">
                            (Line {selectedFinding.lineStart || selectedFinding.line}
                            {selectedFinding.lineEnd && selectedFinding.lineEnd !== (selectedFinding.lineStart || selectedFinding.line)
                              ? `-${selectedFinding.lineEnd}`
                              : ''}
                            )
                          </span>
                        )}
                      </strong>
                    </div>
                    <span className="text-[10px] text-koraSecondary uppercase font-mono px-2 py-0.5 rounded bg-koraCharcoal-card border border-koraCharcoal-border shrink-0">
                      {selectedFinding.sourceTool || 'Deterministic Engine'}
                    </span>
                  </div>
                </div>

                {/* Contribution Readiness & Risk Separation Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-koraOffWhite uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-koraRed" />
                      <span>Contribution Readiness &amp; Risk Separation</span>
                    </span>
                    <span className="text-[10px] font-mono text-koraSecondary">
                      Deterministic Invariant: Urgency ≠ Readiness
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Urgency & Risk Card */}
                    <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-koraSecondary uppercase tracking-wider font-semibold text-[10px]">
                          Risk / Urgency Score
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-koraBurgundy/30 text-koraOffWhite border border-koraBurgundy">
                          {selectedFinding.urgencyLabel || 'medium'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-koraRed">
                          {selectedFinding.urgencyScore ?? 50}
                        </span>
                        <span className="text-koraSecondary text-[10px] font-mono">/ 100</span>
                      </div>
                      <p className="text-[11px] text-koraSecondary leading-relaxed">
                        Urgency measures repository threat priority. Critical vulnerabilities must be fixed immediately by maintainers, NOT delegated to beginner contributors.
                      </p>
                    </div>

                    {/* Contribution Readiness Card */}
                    {selectedFinding.readiness ? (
                      <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-koraSecondary uppercase tracking-wider font-semibold text-[10px]">
                            Contribution Readiness
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getReadinessBadge(selectedFinding.readiness.label)}`}>
                            {selectedFinding.readiness.label.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-mono text-koraOffWhite">
                            {selectedFinding.readiness.total}
                          </span>
                          <span className="text-koraSecondary text-[10px] font-mono">/ 100</span>
                          {selectedFinding.readiness.estimatedMinutes && (
                            <span className="text-koraSecondary text-[10px] font-mono ml-auto">
                              ~{selectedFinding.readiness.estimatedMinutes} mins
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-koraSecondary leading-relaxed">
                          Readiness evaluates whether a new contributor can safely fix and test this finding with clear bounds.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border flex items-center justify-center text-koraSecondary text-xs">
                        Readiness calculated during scan
                      </div>
                    )}
                  </div>

                  {/* 5-Factor Weighted Criteria Breakdown */}
                  {selectedFinding.readiness && (
                    <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-3">
                      <span className="text-[11px] font-semibold text-koraSecondary uppercase tracking-wider block">
                        5-Factor Deterministic Weighting
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border space-y-1">
                          <div className="text-koraSecondary text-[10px]">Clarity</div>
                          <div className="font-mono font-bold text-koraOffWhite">
                            {selectedFinding.readiness.evidenceClarity} <span className="text-koraSecondary font-normal">/ 25</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border space-y-1">
                          <div className="text-koraSecondary text-[10px]">Scope</div>
                          <div className="font-mono font-bold text-koraOffWhite">
                            {selectedFinding.readiness.scopeSimplicity} <span className="text-koraSecondary font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border space-y-1">
                          <div className="text-koraSecondary text-[10px]">Testability</div>
                          <div className="font-mono font-bold text-koraOffWhite">
                            {selectedFinding.readiness.testability} <span className="text-koraSecondary font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border space-y-1">
                          <div className="text-koraSecondary text-[10px]">Skill Accessibility</div>
                          <div className="font-mono font-bold text-koraOffWhite">
                            {selectedFinding.readiness.skillAccessibility} <span className="text-koraSecondary font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border space-y-1">
                          <div className="text-koraSecondary text-[10px]">Context</div>
                          <div className="font-mono font-bold text-koraOffWhite">
                            {selectedFinding.readiness.contextCompleteness} <span className="text-koraSecondary font-normal">/ 15</span>
                          </div>
                        </div>
                      </div>

                      {/* Reasons list */}
                      {selectedFinding.readiness.reasons.length > 0 && (
                        <div className="pt-2 border-t border-koraCharcoal-border/60 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-koraOffWhite font-semibold">Positive Indicators:</span>
                          <ul className="space-y-1">
                            {selectedFinding.readiness.reasons.map((r, i) => (
                              <li key={i} className="text-[11px] text-koraSecondary flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Blockers list */}
                      {selectedFinding.readiness.blockers && selectedFinding.readiness.blockers.length > 0 && (
                        <div className="pt-2 border-t border-koraCharcoal-border/60 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-koraRed font-semibold">Disclosure Blockers:</span>
                          <ul className="space-y-1">
                            {selectedFinding.readiness.blockers.map((b, i) => (
                              <li key={i} className="text-[11px] text-koraOffWhite flex items-start gap-1.5">
                                <span className="text-koraRed mt-0.5">✕</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Evidence Chain / Trust Trail */}
                {selectedFinding.evidenceChain && selectedFinding.evidenceChain.steps && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-koraOffWhite uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-koraSlate" />
                        <span>Evidence Chain / Trust Trail (8 Steps)</span>
                      </span>
                      <span className="text-[10px] font-mono text-koraSecondary">
                        Hash: {selectedFinding.evidenceChain.evidenceHash?.slice(0, 10)}...
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedFinding.evidenceChain.steps.map((st) => (
                          <div
                            key={st.step}
                            className="p-2.5 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border flex items-start gap-2.5"
                          >
                            <div className="w-5 h-5 rounded-full bg-koraBurgundy text-koraOffWhite font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                              {st.step}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-koraOffWhite text-[11px] truncate">
                                  {st.label}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-koraCharcoal-dark text-koraOffWhite border border-koraCharcoal-border shrink-0 uppercase">
                                  {st.verifiedBy}
                                </span>
                              </div>
                              <p className="text-[10px] text-koraSecondary line-clamp-2">
                                {st.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Impact Statement */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-koraSecondary uppercase tracking-wider">
                    Security &amp; Operational Impact
                  </span>
                  <p className="text-xs text-koraOffWhite leading-relaxed">
                    {selectedFinding.impact}
                  </p>
                </div>

                {/* Redacted Evidence */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-koraSecondary uppercase tracking-wider">
                      Redacted Finding Evidence
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-koraRed text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Redacted &amp; Masked
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyEvidence(
                            selectedFinding.redactedEvidence || selectedFinding.evidence
                          )
                        }
                        className="text-[11px] text-koraOffWhite hover:underline flex items-center gap-1 font-mono transition-colors"
                      >
                        {copiedEvidence ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedEvidence ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0B0908] border border-koraCharcoal-border font-mono text-xs text-koraOffWhite overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedFinding.redactedEvidence ||
                      selectedFinding.evidence ||
                      'No raw evidence snippet required for this structural finding.'}
                  </pre>
                  <p className="text-[10px] text-koraSecondary">
                    {selectedFinding.category === 'secret'
                      ? 'Credentials strictly redacted. Raw secret material is never logged or exposed.'
                      : 'Evidence extracted deterministically from scanned repository tree.'}
                  </p>
                </div>

                {/* Grounded Explanation Depth Switcher */}
                <div className="space-y-3 pt-2 border-t border-koraCharcoal-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-koraRed" />
                      <span className="text-xs font-bold text-koraOffWhite uppercase tracking-wider">
                        Explanation Depth &amp; Guidance
                      </span>
                    </div>

                    {/* Mode Toggle Pills */}
                    <div className="flex items-center gap-1 bg-koraCharcoal-dark p-1 rounded-full border border-koraCharcoal-border">
                      {(['beginner', 'developer', 'maintainer'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setExplanationMode(mode)}
                          className={`px-3 py-1 text-[11px] font-mono capitalize rounded-full transition-all ${
                            explanationMode === mode
                              ? 'bg-koraRed text-white font-semibold shadow-glow-red'
                              : 'text-koraSecondary hover:text-koraOffWhite'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-koraOffWhite capitalize">
                        {explanationMode} Perspective
                      </span>
                      <span className="text-koraSecondary font-mono text-[10px]">
                        Grounded in identical verified evidence
                      </span>
                    </div>
                    <p className="text-xs text-koraOffWhite leading-relaxed">
                      {explanationText}
                    </p>
                  </div>
                </div>

                {/* Fix Guidance & Disclosure Policy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 p-3.5 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border text-xs text-koraOffWhite space-y-1">
                    <span className="font-semibold text-koraOffWhite block">Suggested Action</span>
                    <p className="text-koraSecondary leading-relaxed">{selectedFinding.fixHint}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border text-xs space-y-1">
                    <span className="font-semibold text-koraSecondary block">Disclosure Policy</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        selectedFinding.disclosureMode === 'security-disclosure' ||
                        selectedFinding.category === 'secret'
                          ? 'bg-koraBurgundy text-koraOffWhite border border-koraRed'
                          : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {selectedFinding.disclosureMode === 'security-disclosure' ||
                      selectedFinding.category === 'secret'
                        ? 'Private Disclosure Only'
                        : 'Public Contributor Fix'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-koraCharcoal-border">
                  <button
                    onClick={() => handleRequestExplanation(selectedFinding)}
                    disabled={explainingId === selectedFinding.id}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-koraCharcoal-surface hover:bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {explainingId === selectedFinding.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-koraRed" />
                        <span>Grounded Gemini Query...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-koraRed" />
                        <span>Explain with Gemini</span>
                      </>
                    )}
                  </button>

                  {selectedFinding.disclosureMode === 'security-disclosure' ||
                  selectedFinding.category === 'secret' ? (
                    <div className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-koraBurgundy/40 text-koraOffWhite border border-koraBurgundy text-xs font-semibold flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-koraRed" />
                      <span>Public Draft Blocked (Private Disclosure Only)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateRoute(selectedFinding)}
                      disabled={creatingRouteId === selectedFinding.id}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-glow-red disabled:opacity-50"
                    >
                      {creatingRouteId === selectedFinding.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Structuring Route...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5" />
                          <span>Find Safe Contribution</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            ) : null}
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 rounded-2xl border border-dashed border-koraCharcoal-border bg-koraCharcoal-surface/60 px-4">
          <Shield className="w-10 h-10 text-koraRed/70 mx-auto mb-3" />
          <h3 className="text-sm font-heading font-semibold text-koraOffWhite">No verified findings match your filters</h3>
          <p className="text-xs text-koraSecondary mt-1.5 max-w-md mx-auto leading-relaxed">
            No deterministic findings match the current severity, category, or readiness filters.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSeverityFilter('ALL');
                setCategoryFilter('all');
                setReadinessFilter('ALL');
                setDiffFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-full bg-koraCharcoal-dark text-koraOffWhite border border-koraCharcoal-border text-xs font-semibold hover:border-koraRed/40 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => router.push('/app/scan')}
              className="px-5 py-2 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold transition-colors shadow-glow-red"
            >
              Scan Another Repository
            </button>
          </div>
        </div>
      )}

      {/* Grounded Explanation Modal */}
      {currentExplanation && selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl w-full border border-koraCharcoal-border bg-koraCharcoal-surface rounded-2xl shadow-liquid-glass p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                      currentExplanation.generatedBy === 'gemini'
                        ? 'bg-koraCharcoal-dark text-koraOffWhite border-koraCharcoal-border'
                        : 'bg-koraBurgundy/40 text-koraOffWhite border-koraBurgundy'
                    }`}
                  >
                    {currentExplanation.generatedBy === 'gemini'
                      ? 'Grounded via Gemini 2.5 Flash'
                      : 'Fallback Used: Deterministic Planner (100% Grounded Evidence)'}
                  </span>
                  <span className="text-xs text-koraSlate capitalize">
                    {currentExplanation.difficulty} Track
                  </span>
                </div>
                <h3 className="text-lg font-heading font-bold text-koraOffWhite">{selectedFinding.title}</h3>
              </div>
              <button
                onClick={() => setCurrentExplanation(null)}
                className="text-koraSecondary hover:text-koraOffWhite p-1"
                aria-label="Close explanation modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-koraOffWhite">
              <div>
                <h4 className="font-heading font-semibold text-koraSecondary uppercase tracking-wider mb-1">
                  Educational Context
                </h4>
                <p className="leading-relaxed bg-koraCharcoal-dark p-3.5 rounded-xl border border-koraCharcoal-border">
                  {currentExplanation.explanation}
                </p>
              </div>

              <div>
                <h4 className="font-heading font-semibold text-koraSecondary uppercase tracking-wider mb-1">
                  Repository Risk
                </h4>
                <p className="leading-relaxed bg-koraCharcoal-dark p-3.5 rounded-xl border border-koraCharcoal-border">
                  {currentExplanation.riskContext}
                </p>
              </div>

              <div>
                <h4 className="font-heading font-semibold text-koraSecondary uppercase tracking-wider mb-1">
                  Step-by-Step Fix Guidance
                </h4>
                <p className="leading-relaxed bg-koraCharcoal-dark p-3.5 rounded-xl border border-koraCharcoal-border text-koraOffWhite font-mono">
                  {currentExplanation.recommendedFix}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border">
                  <span className="text-koraSecondary text-[10px] block mb-0.5">Estimated Time</span>
                  <span className="font-semibold text-koraOffWhite">{currentExplanation.estimatedEffort}</span>
                </div>
                <div className="p-3 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border">
                  <span className="text-koraSecondary text-[10px] block mb-0.5">Required Skills</span>
                  <span className="font-semibold text-koraOffWhite">{currentExplanation.skillsNeeded.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-koraCharcoal-border">
              <button
                onClick={() => setCurrentExplanation(null)}
                className="px-4 py-2 rounded-full bg-koraCharcoal-dark text-koraOffWhite text-xs font-semibold hover:bg-koraCharcoal-card transition-colors border border-koraCharcoal-border"
              >
                Close
              </button>
              {selectedFinding.disclosureMode !== 'security-disclosure' && selectedFinding.category !== 'secret' && (
                <button
                  onClick={() => {
                    const target = selectedFinding;
                    setCurrentExplanation(null);
                    handleCreateRoute(target);
                  }}
                  className="px-5 py-2 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-red"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Create Route from this Explanation</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
