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
  Clock,
  Layers,
  HelpCircle,
  FileText,
  GitCompare,
  TrendingUp,
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
      return 'bg-rosewood text-cotton border border-rosewood';
    case 'HIGH':
      return 'bg-coffeeBean text-electricTangerine border border-electricTangerine/60';
    case 'MEDIUM':
      return 'bg-coffeeBean text-lemonChiffon border border-lemonChiffon/40';
    case 'LOW':
      return 'bg-blackHole text-botticelli border border-borderDark';
    case 'INFO':
    default:
      return 'bg-[#222222] text-[#AAA9A1] border border-white/10';
  }
}

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

export default function FindingsPage() {
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
        // Keep selected finding if still in list, else select top sorted finding
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 bg-black text-textPrimary">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderDark">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
            <span>Verified Findings</span>
            {activeScan && (
              <span className="text-xs font-mono font-medium text-lemonChiffon bg-coffeeBean px-3 py-1 rounded-full border border-lemonChiffon/20">
                {activeScan.repoName}
              </span>
            )}
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Deterministic security, manifest, and health findings with exact evidence, Contribution Readiness scoring, and grounded contributor trails.
          </p>
        </div>

        <button
          onClick={() => router.push('/app/scan')}
          className="px-4 py-2 rounded-full bg-blackHole hover:bg-blackHole/80 text-textPrimary border border-borderDark text-xs font-medium transition-colors self-start md:self-auto"
        >
          Scan Another Repo
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-borderDark space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="w-full lg:w-72 relative">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, files, or rules..."
              aria-label="Search findings by title, file, or rule ID"
              className="w-full pl-9 pr-3 py-1.5 bg-black border border-borderDark rounded-lg text-xs text-textPrimary placeholder-textMuted/40 focus:outline-none focus:border-lemonChiffon"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0" role="toolbar" aria-label="Severity filter">
            <span className="text-xs text-textMuted font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {SEVERITY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                  severityFilter === s
                    ? 'bg-lemonChiffon text-black font-semibold shadow-sm'
                    : 'text-textMuted hover:text-textPrimary bg-black border border-borderDark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0" role="toolbar" aria-label="Category filter">
            <span className="text-xs text-textMuted font-medium shrink-0">Category:</span>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                  categoryFilter === c.id
                    ? 'bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30'
                    : 'text-textMuted hover:text-textPrimary bg-black border border-borderDark'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>

        {/* Row 2 Filters: Contribution Readiness & Diff Status */}
        <div className="pt-2 border-t border-borderDark/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Readiness Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-textMuted font-medium flex items-center gap-1 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-lemonChiffon" /> Readiness:
            </span>
            {READINESS_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReadinessFilter(r.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors shrink-0 ${
                  readinessFilter === r.id
                    ? 'bg-lemonChiffon text-black font-semibold shadow-sm'
                    : 'text-textMuted hover:text-textPrimary bg-black border border-borderDark'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Diff Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-textMuted font-medium flex items-center gap-1 shrink-0">
              <GitCompare className="w-3.5 h-3.5 text-botticelli" /> Diff Status:
            </span>
            {DIFF_OPTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDiffFilter(d.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors shrink-0 ${
                  diffFilter === d.id
                    ? 'bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 font-semibold'
                    : 'text-textMuted hover:text-textPrimary bg-black border border-borderDark'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count Summary */}
        <div className="pt-3 border-t border-borderDark/60 flex flex-wrap items-center justify-between text-xs text-textMuted gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <strong className="text-textPrimary">{filteredFindings.length}</strong> of{' '}
              <strong className="text-textPrimary">{counts.total}</strong> findings
            </span>
            <span className="text-borderDark">•</span>
            <span className="text-emerald-400 font-medium">{counts.goodFirst} Good First</span>
            <span className="text-rosewood font-medium">{counts.maintainerAssistance} Maintainer Assistance</span>
            <span className="text-borderDark">•</span>
            <span className="text-rosewood font-medium">{counts.bySev.CRITICAL} Critical</span>
            <span className="text-electricTangerine font-medium">{counts.bySev.HIGH} High</span>
            <span className="text-lemonChiffon font-medium">{counts.bySev.MEDIUM} Medium</span>
            <span className="text-botticelli font-medium">{counts.bySev.LOW} Low</span>
          </div>

          <div className="flex items-center gap-3">
            {counts.resolved > 0 && (
              <span className="text-blue-400 font-mono text-[11px]">
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
        <div className="p-4 rounded-xl bg-rosewood/20 border border-rosewood text-cotton flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-rosewood shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchFindings}
            className="px-3 py-1 rounded-md bg-rosewood hover:bg-rosewood/80 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-borderDark">
          <Loader2 className="w-8 h-8 text-lemonChiffon animate-spin mx-auto mb-3" />
          <p className="text-xs text-textMuted font-mono">Loading verified findings...</p>
        </div>
      ) : filteredFindings.length > 0 ? (
        /* Master-Detail Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Accessible Finding List (Col span 5) */}
          <div className="lg:col-span-5 space-y-3" role="region" aria-label="Findings List">
            <div className="flex items-center justify-between text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">
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
                            ? 'bg-rosewood/30 border-rosewood shadow-md'
                            : isHigh
                            ? 'bg-coffeeBean border-electricTangerine/70 shadow-md'
                            : 'bg-coffeeBean border-lemonChiffon/60 shadow-md'
                          : 'glass-panel hover:border-borderDark/80'
                      }`}
                    >
                      {/* Top Badges Row: Severity, Urgency, Readiness, Diff Status */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] mb-2 gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
                            {finding.severity}
                          </span>

                          {finding.urgencyScore !== undefined && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-black border border-borderDark text-textMuted">
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

                        <span className="text-[10px] font-mono text-textMuted">
                          {typeof finding.confidence === 'number'
                            ? `${Math.round(finding.confidence * 100)}%`
                            : finding.confidence || 'HIGH'}{' '}
                          Conf.
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-textPrimary line-clamp-2">
                        {finding.title}
                      </h4>

                      {/* Top Readiness reason preview */}
                      {topReason && (
                        <p className="mt-1.5 text-[11px] text-textMuted line-clamp-1 italic">
                          💡 {topReason}
                        </p>
                      )}

                      <div className="mt-2.5 text-[11px] text-botticelli font-mono flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{finding.file || 'Repository Root'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-textMuted" />
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
                className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all space-y-6 ${
                  selectedFinding.severity?.toUpperCase() === 'CRITICAL'
                    ? 'border-rosewood/70 bg-rosewood/10'
                    : selectedFinding.severity?.toUpperCase() === 'HIGH'
                    ? 'border-electricTangerine/40 bg-coffeeBean/40'
                    : 'border-borderDark'
                }`}
              >
                
                {/* Header: Title, Category, Severity, Rule ID, Diff Status, Review Toggle */}
                <div className="space-y-3 pb-4 border-b border-borderDark">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(selectedFinding.severity)}`}>
                        {selectedFinding.severity}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-black border border-borderDark text-textMuted uppercase">
                        {selectedFinding.category}
                      </span>
                      <span className="text-[11px] font-mono text-lemonChiffon">
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
                            : 'bg-[#222222] text-[#AAA9A1] border-white/10 hover:text-[#FFF8CA] hover:border-[#FFF8CA]/30'
                        }`}
                      >
                        {updatingReviewId === selectedFinding.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : selectedFinding.reviewed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#AAA9A1]" />
                        )}
                        <span>{selectedFinding.reviewed ? 'Reviewed ✓' : 'Mark as Reviewed'}</span>
                      </button>

                      {/* Deep Link to Detail Page */}
                      <Link
                        href={`/app/findings/${selectedFinding.id}`}
                        className="p-1.5 rounded-md text-textMuted hover:text-lemonChiffon hover:bg-black/40 border border-borderDark transition-colors"
                        title="Open finding deep link in dedicated page"
                        aria-label="Open finding deep link in dedicated page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-textPrimary leading-snug">
                    {selectedFinding.title}
                  </h3>

                  {/* Exact File and Line clearly shown */}
                  <div className="p-3 rounded-xl bg-black border border-borderDark flex items-center justify-between gap-2 text-xs font-mono text-botticelli">
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-4 h-4 text-lemonChiffon shrink-0" />
                      <span>Exact Location: </span>
                      <strong className="text-textPrimary truncate">
                        {selectedFinding.file || 'Repository Root'}
                        {(selectedFinding.lineStart || selectedFinding.line) && (
                          <span className="text-lemonChiffon ml-1">
                            (Line {selectedFinding.lineStart || selectedFinding.line}
                            {selectedFinding.lineEnd && selectedFinding.lineEnd !== (selectedFinding.lineStart || selectedFinding.line)
                              ? `-${selectedFinding.lineEnd}`
                              : ''}
                            )
                          </span>
                        )}
                      </strong>
                    </div>
                    <span className="text-[10px] text-textMuted uppercase font-mono px-2 py-0.5 rounded bg-blackHole border border-borderDark shrink-0">
                      {selectedFinding.sourceTool || 'Deterministic Engine'}
                    </span>
                  </div>
                </div>

                {/* Contribution Readiness & Risk Separation Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-lemonChiffon" />
                      <span>Contribution Readiness &amp; Risk Separation</span>
                    </span>
                    <span className="text-[10px] font-mono text-textMuted">
                      Deterministic Invariant: Urgency ≠ Readiness
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Urgency & Risk Card */}
                    <div className="p-4 rounded-xl bg-black border border-borderDark space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                          Risk / Urgency Score
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rosewood/20 text-cotton border border-rosewood/40">
                          {selectedFinding.urgencyLabel || 'medium'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-electricTangerine">
                          {selectedFinding.urgencyScore ?? 50}
                        </span>
                        <span className="text-textMuted text-[10px] font-mono">/ 100</span>
                      </div>
                      <p className="text-[11px] text-textMuted leading-relaxed">
                        Urgency measures repository threat priority. Critical vulnerabilities must be fixed immediately by maintainers, NOT delegated to beginner contributors.
                      </p>
                    </div>

                    {/* Contribution Readiness Card */}
                    {selectedFinding.readiness ? (
                      <div className="p-4 rounded-xl bg-black border border-lemonChiffon/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                            Contribution Readiness
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getReadinessBadge(selectedFinding.readiness.label)}`}>
                            {selectedFinding.readiness.label.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-mono text-lemonChiffon">
                            {selectedFinding.readiness.total}
                          </span>
                          <span className="text-textMuted text-[10px] font-mono">/ 100</span>
                          {selectedFinding.readiness.estimatedMinutes && (
                            <span className="text-textMuted text-[10px] font-mono ml-auto">
                              ~{selectedFinding.readiness.estimatedMinutes} mins
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-lemonChiffon/80 leading-relaxed">
                          Readiness evaluates whether a new contributor can safely fix and test this finding with clear bounds.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-black border border-borderDark flex items-center justify-center text-textMuted text-xs">
                        Readiness calculated during scan
                      </div>
                    )}
                  </div>

                  {/* 5-Factor Weighted Criteria Breakdown */}
                  {selectedFinding.readiness && (
                    <div className="p-4 rounded-xl bg-black border border-borderDark space-y-3">
                      <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider block">
                        5-Factor Deterministic Weighting
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-blackHole border border-borderDark space-y-1">
                          <div className="text-textMuted text-[10px]">Clarity</div>
                          <div className="font-mono font-bold text-lemonChiffon">
                            {selectedFinding.readiness.evidenceClarity} <span className="text-textMuted font-normal">/ 25</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blackHole border border-borderDark space-y-1">
                          <div className="text-textMuted text-[10px]">Scope</div>
                          <div className="font-mono font-bold text-lemonChiffon">
                            {selectedFinding.readiness.scopeSimplicity} <span className="text-textMuted font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blackHole border border-borderDark space-y-1">
                          <div className="text-textMuted text-[10px]">Testability</div>
                          <div className="font-mono font-bold text-lemonChiffon">
                            {selectedFinding.readiness.testability} <span className="text-textMuted font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blackHole border border-borderDark space-y-1">
                          <div className="text-textMuted text-[10px]">Skill Accessibility</div>
                          <div className="font-mono font-bold text-lemonChiffon">
                            {selectedFinding.readiness.skillAccessibility} <span className="text-textMuted font-normal">/ 20</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blackHole border border-borderDark space-y-1">
                          <div className="text-textMuted text-[10px]">Context</div>
                          <div className="font-mono font-bold text-lemonChiffon">
                            {selectedFinding.readiness.contextCompleteness} <span className="text-textMuted font-normal">/ 15</span>
                          </div>
                        </div>
                      </div>

                      {/* Reasons list */}
                      {selectedFinding.readiness.reasons.length > 0 && (
                        <div className="pt-2 border-t border-borderDark/40 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-lemonChiffon font-semibold">Positive Indicators:</span>
                          <ul className="space-y-1">
                            {selectedFinding.readiness.reasons.map((r, i) => (
                              <li key={i} className="text-[11px] text-textMuted flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Blockers list */}
                      {selectedFinding.readiness.blockers && selectedFinding.readiness.blockers.length > 0 && (
                        <div className="pt-2 border-t border-borderDark/40 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-rosewood font-semibold">Disclosure Blockers:</span>
                          <ul className="space-y-1">
                            {selectedFinding.readiness.blockers.map((b, i) => (
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
                {selectedFinding.evidenceChain && selectedFinding.evidenceChain.steps && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-botticelli" />
                        <span>Evidence Chain / Trust Trail (8 Steps)</span>
                      </span>
                      <span className="text-[10px] font-mono text-textMuted">
                        Hash: {selectedFinding.evidenceChain.evidenceHash?.slice(0, 10)}...
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-black border border-borderDark space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedFinding.evidenceChain.steps.map((st) => (
                          <div
                            key={st.step}
                            className="p-2.5 rounded-lg bg-blackHole border border-borderDark/60 flex items-start gap-2.5"
                          >
                            <div className="w-5 h-5 rounded-full bg-coffeeBean text-lemonChiffon font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                              {st.step}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-textPrimary text-[11px] truncate">
                                  {st.label}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black text-lemonChiffon border border-lemonChiffon/20 shrink-0 uppercase">
                                  {st.verifiedBy}
                                </span>
                              </div>
                              <p className="text-[10px] text-textMuted line-clamp-2">
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
                  <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">
                    Security &amp; Operational Impact
                  </span>
                  <p className="text-xs text-textPrimary leading-relaxed">
                    {selectedFinding.impact}
                  </p>
                </div>

                {/* Redacted Evidence with Botticelli / Linen accents */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-textMuted uppercase tracking-wider">
                      Redacted Finding Evidence
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-lemonChiffon text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Redacted &amp; Masked
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyEvidence(
                            selectedFinding.redactedEvidence || selectedFinding.evidence
                          )
                        }
                        className="text-[11px] text-botticelli hover:text-lemonChiffon flex items-center gap-1 font-mono transition-colors"
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
                  <pre className="p-4 rounded-xl bg-black border border-borderDark font-mono text-xs text-botticelli overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedFinding.redactedEvidence ||
                      selectedFinding.evidence ||
                      'No raw evidence snippet required for this structural finding.'}
                  </pre>
                  <p className="text-[10px] text-textMuted">
                    {selectedFinding.category === 'secret'
                      ? 'Credentials strictly redacted. Raw secret material is never logged or exposed.'
                      : 'Evidence extracted deterministically from scanned repository tree.'}
                  </p>
                </div>

                {/* Grounded Explanation Depth Switcher (Beginner / Developer / Maintainer) */}
                <div className="space-y-3 pt-2 border-t border-borderDark">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-lemonChiffon" />
                      <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Explanation Depth &amp; Guidance
                      </span>
                    </div>

                    {/* Mode Toggle Pills */}
                    <div className="flex items-center gap-1 bg-black p-1 rounded-full border border-borderDark">
                      {(['beginner', 'developer', 'maintainer'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setExplanationMode(mode)}
                          className={`px-3 py-1 text-[11px] font-mono capitalize rounded-full transition-all ${
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

                  <div className="p-4 rounded-xl bg-black border border-borderDark space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-lemonChiffon capitalize">
                        {explanationMode} Perspective
                      </span>
                      <span className="text-textMuted font-mono text-[10px]">
                        Grounded in identical verified evidence
                      </span>
                    </div>
                    <p className="text-xs text-textPrimary leading-relaxed">
                      {explanationText}
                    </p>
                  </div>
                </div>

                {/* Fix Guidance & Disclosure Policy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 p-3.5 rounded-xl bg-black border border-borderDark text-xs text-textPrimary space-y-1">
                    <span className="font-semibold text-lemonChiffon block">Suggested Action</span>
                    <p className="text-textMuted leading-relaxed">{selectedFinding.fixHint}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black border border-borderDark text-xs space-y-1">
                    <span className="font-semibold text-textMuted block">Disclosure Policy</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        selectedFinding.disclosureMode === 'security-disclosure' ||
                        selectedFinding.category === 'secret'
                          ? 'bg-rosewood/40 text-cotton border border-rosewood'
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

                {/* Action Buttons: Explain with Gamma 4 & Create Contribution Route */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-borderDark">
                  <button
                    onClick={() => handleRequestExplanation(selectedFinding)}
                    disabled={explainingId === selectedFinding.id}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-coffeeBean hover:bg-coffeeBean/80 text-textPrimary border border-borderDark text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {explainingId === selectedFinding.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-electricTangerine" />
                        <span>Grounded Gamma 4 Query...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-lemonChiffon" />
                        <span>Explain with Gamma 4</span>
                      </>
                    )}
                  </button>

                  {selectedFinding.disclosureMode === 'security-disclosure' ||
                  selectedFinding.category === 'secret' ? (
                    <div className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rosewood/30 text-cotton border border-rosewood text-xs font-semibold flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-lemonChiffon" />
                      <span>Public Draft Blocked (Private Disclosure Only)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateRoute(selectedFinding)}
                      disabled={creatingRouteId === selectedFinding.id}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lemonChiffon/20 disabled:opacity-50"
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
        <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-borderDark px-4">
          <Shield className="w-10 h-10 text-lemonChiffon/70 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-textPrimary">No verified findings match your filters</h3>
          <p className="text-xs text-textMuted mt-1.5 max-w-md mx-auto leading-relaxed">
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
              className="px-4 py-2 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Reset Filters
            </button>
            <button
              onClick={() => router.push('/app/scan')}
              className="px-5 py-2 rounded-full bg-lemonChiffon text-black text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Scan Another Repository
            </button>
          </div>
        </div>
      )}

      {/* Grounded Explanation Modal */}
      {currentExplanation && selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl w-full glass-panel border border-borderDark rounded-2xl shadow-glass-card p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                      currentExplanation.generatedBy === 'gemini'
                        ? 'bg-black text-lemonChiffon border-lemonChiffon/30'
                        : 'bg-coffeeBean text-lemonChiffon border-electricTangerine/40'
                    }`}
                  >
                    {currentExplanation.generatedBy === 'gemini'
                      ? 'Grounded via Gamma 4 Adapter'
                      : 'Fallback Used: Deterministic Planner (100% Grounded Evidence)'}
                  </span>
                  <span className="text-xs text-botticelli capitalize">
                    {currentExplanation.difficulty} Track
                  </span>
                </div>
                <h3 className="text-lg font-bold text-textPrimary">{selectedFinding.title}</h3>
              </div>
              <button
                onClick={() => setCurrentExplanation(null)}
                className="text-textMuted hover:text-textPrimary p-1"
                aria-label="Close explanation modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-textPrimary">
              <div>
                <h4 className="font-semibold text-textMuted uppercase tracking-wider mb-1">
                  Educational Context
                </h4>
                <p className="leading-relaxed bg-black p-3.5 rounded-xl border border-borderDark">
                  {currentExplanation.explanation}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-textMuted uppercase tracking-wider mb-1">
                  Repository Risk
                </h4>
                <p className="leading-relaxed bg-black p-3.5 rounded-xl border border-borderDark">
                  {currentExplanation.riskContext}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-textMuted uppercase tracking-wider mb-1">
                  Step-by-Step Fix Guidance
                </h4>
                <p className="leading-relaxed bg-black p-3.5 rounded-xl border border-borderDark text-lemonChiffon">
                  {currentExplanation.recommendedFix}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black border border-borderDark">
                  <span className="text-textMuted text-[10px] block mb-0.5">Estimated Time</span>
                  <span className="font-semibold text-textPrimary">{currentExplanation.estimatedEffort}</span>
                </div>
                <div className="p-3 rounded-xl bg-black border border-borderDark">
                  <span className="text-textMuted text-[10px] block mb-0.5">Required Skills</span>
                  <span className="font-semibold text-textPrimary">{currentExplanation.skillsNeeded.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderDark">
              <button
                onClick={() => setCurrentExplanation(null)}
                className="px-4 py-2 rounded-full bg-blackHole text-textPrimary text-xs font-semibold hover:bg-black transition-colors"
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
                  className="px-5 py-2 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
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
