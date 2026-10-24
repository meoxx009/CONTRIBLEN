'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Compass,
  ArrowLeft,
  Clock,
  Terminal,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Lock,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  Layers,
  Wrench,
  HelpCircle,
  Code2,
  FileCode,
  AlertCircle,
} from 'lucide-react';
import type { ContributionRoute, Finding, SkillGapItem, ExplanationMode } from '@/types';

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.routeId as string;

  const { showToast } = useApp();
  const [route, setRoute] = useState<ContributionRoute | null>(null);
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [downloadingPack, setDownloadingPack] = useState(false);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('beginner');

  useEffect(() => {
    if (routeId) {
      loadRouteDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const loadRouteDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/routes/${routeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.route) {
          setRoute(data.route);
          if (data.finding) setFinding(data.finding);
          return;
        }
      }

      // Fallback to list search
      const listRes = await fetch('/api/routes');
      if (listRes.ok) {
        const data = await listRes.json();
        const found = (data.routes || []).find((r: ContributionRoute) => r.id === routeId);
        if (found) {
          setRoute(found);
          const fId = found.findingId || (found.findingIds && found.findingIds[0]);
          if (fId) {
            const fRes = await fetch('/api/findings');
            if (fRes.ok) {
              const fData = await fRes.json();
              const matchedFinding = (fData.findings || []).find((f: Finding) => f.id === fId);
              if (matchedFinding) setFinding(matchedFinding);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load route detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ContributionRoute['status']) => {
    if (!route) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: route.id, status: newStatus }),
      });
      if (res.ok) {
        setRoute({ ...route, status: newStatus });
        showToast(`Route status updated to "${newStatus}"`, 'info');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
      }
    } catch {
      showToast('Network error updating status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleSkill = async (skillId: string, currentCompleted: boolean) => {
    if (!route) return;
    const nextCompleted = !currentCompleted;
    const updatedChecklist = (route.learningChecklist || []).map((item) =>
      item.id === skillId ? { ...item, completed: nextCompleted } : item
    );

    setRoute({ ...route, learningChecklist: updatedChecklist });

    try {
      await fetch('/api/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: route.id,
          skillId,
          completed: nextCompleted,
        }),
      });
      showToast(nextCompleted ? 'Skill marked complete!' : 'Skill unchecked', 'info');
    } catch {
      showToast('Failed to save skill progress', 'error');
    }
  };

  const handleDownloadPack = async () => {
    if (!route) return;
    setDownloadingPack(true);
    try {
      const res = await fetch(`/api/routes/${route.id}/pack`);
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || `contribution-pack-${route.id}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Contribution pack downloaded as .md file!', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to download contribution pack', 'error');
      }
    } catch {
      showToast('Error downloading contribution pack', 'error');
    } finally {
      setDownloadingPack(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!route) return;
    setGeneratingDraft(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: route.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Maintainer issue draft generated successfully!', 'success');
        router.push(`/app/issue-drafts?draftId=${data.draft.id}`);
      } else {
        showToast(data.error || 'Failed to generate draft', 'error');
      }
    } catch {
      showToast('Network error generating draft', 'error');
    } finally {
      setGeneratingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-lemonChiffon animate-spin" />
          <span className="text-xs text-textMuted">Loading contribution route blueprint...</span>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 bg-black text-textPrimary">
        <Compass className="w-12 h-12 text-rosewood mx-auto" />
        <h2 className="text-lg font-bold">Contribution Route Not Found</h2>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          The requested route ID does not exist or you do not have permission to access it.
        </p>
        <Link
          href="/app/contributions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lemonChiffon text-black text-xs font-semibold hover:bg-sustainableLinen transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contributions</span>
        </Link>
      </div>
    );
  }

  const currentStatus = route.status || 'not-started';
  const readiness = route.contributionReadiness;
  const chain = route.evidenceChain;
  const learningItems = route.learningChecklist || [];

  const explanationText =
    route.explanationModes?.[explanationMode] ||
    (explanationMode === 'beginner'
      ? route.summary
      : explanationMode === 'developer'
      ? `Deterministic issue in ${route.files.join(', ')}. Follow task: ${route.suggestedChange}`
      : `Maintainer review guidance: Verify test plan and PR acceptance checklist.`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-black text-textPrimary">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-borderDark">
        <Link
          href="/app/contributions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-lemonChiffon transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contributions + Stack</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Download Contribution Pack Action */}
          <button
            onClick={handleDownloadPack}
            disabled={downloadingPack}
            className="px-4 py-1.5 rounded-full bg-blackHole hover:bg-black text-lemonChiffon text-xs font-semibold flex items-center gap-1.5 transition-colors border border-lemonChiffon/30 disabled:opacity-50"
            title="Download full contribution pack as Markdown (.md)"
          >
            {downloadingPack ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPack ? 'Exporting...' : 'Download Contribution Pack'}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-borderDark space-y-8">
        {/* Route Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-borderDark">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30">
                Difficulty: {route.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono text-botticelli bg-blackHole border border-borderDark flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Effort: {route.estimatedEffort}</span>
              </span>
              {route.urgencyLabel && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rosewood/30 text-rosewood border border-rosewood/40">
                  Urgency: {route.urgencyLabel}
                </span>
              )}
              {readiness && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-lemonChiffon text-black">
                  Readiness: {readiness.total}/100 ({readiness.label.replace(/-/g, ' ')})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              {route.title}
            </h1>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {finding && (finding.disclosureMode === 'security-disclosure' || finding.category === 'secret') ? (
              <div className="px-5 py-2.5 rounded-full bg-rosewood/30 border border-rosewood text-cotton text-xs font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-lemonChiffon" />
                <span>Private Security Disclosure Only</span>
              </div>
            ) : (
              <button
                onClick={handleGenerateDraft}
                disabled={generatingDraft}
                className="px-6 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Maintainer Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Tracker & Persisted State */}
        <div className="p-4 rounded-xl bg-black border border-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-textMuted">Execution Status:</span>
            <span
              className={`text-xs font-bold font-mono px-3 py-0.5 rounded-full capitalize ${
                currentStatus === 'completed'
                  ? 'bg-lemonChiffon text-black'
                  : currentStatus === 'in-progress'
                  ? 'bg-electricTangerine text-black'
                  : currentStatus === 'needs-review'
                  ? 'bg-botticelli text-black'
                  : 'bg-coffeeBean text-lemonChiffon'
              }`}
            >
              {currentStatus.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-blackHole p-1 rounded-full border border-borderDark">
            {(['not-started', 'in-progress', 'needs-review', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateStatus(st)}
                disabled={updatingStatus}
                className={`px-3 py-1 text-[11px] font-mono rounded-full capitalize transition-all ${
                  currentStatus === st
                    ? st === 'completed'
                      ? 'bg-lemonChiffon text-black font-bold'
                      : st === 'in-progress'
                      ? 'bg-electricTangerine text-black font-bold'
                      : st === 'needs-review'
                      ? 'bg-botticelli text-black font-bold'
                      : 'bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation Mode Switcher */}
        <div className="p-5 rounded-xl bg-black border border-borderDark space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-electricTangerine" />
              <span>Grounded Explanation Depth</span>
            </span>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-blackHole p-1 rounded-full border border-borderDark text-xs">
              {(['beginner', 'developer', 'maintainer'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setExplanationMode(mode)}
                  className={`px-3 py-1 rounded-full font-medium capitalize transition-colors ${
                    explanationMode === mode
                      ? 'bg-coffeeBean text-lemonChiffon font-bold border border-lemonChiffon/30'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-textPrimary leading-relaxed p-3.5 rounded-lg bg-blackHole border border-borderDark/60 font-sans">
            {explanationText}
          </p>
        </div>

        {/* Contribution Readiness Breakdown (5 Factors) */}
        {readiness && (
          <div className="p-5 rounded-xl bg-black border border-borderDark space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  Contribution Readiness Breakdown
                </h3>
                <span className="text-[11px] text-textMuted">
                  Deterministic score derived from 5 objective criteria (independent from risk severity)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-lemonChiffon font-mono">{readiness.total}/100</span>
                <span className="text-[10px] text-textMuted block capitalize">
                  {readiness.label.replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-blackHole border border-borderDark space-y-1">
                <span className="text-textMuted block text-[10px]">EVIDENCE CLARITY</span>
                <span className="font-mono text-lemonChiffon font-bold text-sm">{readiness.evidenceClarity}/25</span>
                <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                  <div className="bg-lemonChiffon h-full" style={{ width: `${(readiness.evidenceClarity / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blackHole border border-borderDark space-y-1">
                <span className="text-textMuted block text-[10px]">SCOPE SIMPLICITY</span>
                <span className="font-mono text-lemonChiffon font-bold text-sm">{readiness.scopeSimplicity}/20</span>
                <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                  <div className="bg-lemonChiffon h-full" style={{ width: `${(readiness.scopeSimplicity / 20) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blackHole border border-borderDark space-y-1">
                <span className="text-textMuted block text-[10px]">TESTABILITY</span>
                <span className="font-mono text-lemonChiffon font-bold text-sm">{readiness.testability}/20</span>
                <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                  <div className="bg-lemonChiffon h-full" style={{ width: `${(readiness.testability / 20) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blackHole border border-borderDark space-y-1">
                <span className="text-textMuted block text-[10px]">SKILL ACCESSIBILITY</span>
                <span className="font-mono text-lemonChiffon font-bold text-sm">{readiness.skillAccessibility}/20</span>
                <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                  <div className="bg-lemonChiffon h-full" style={{ width: `${(readiness.skillAccessibility / 20) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blackHole border border-borderDark space-y-1">
                <span className="text-textMuted block text-[10px]">CONTEXT COMPLETENESS</span>
                <span className="font-mono text-lemonChiffon font-bold text-sm">{readiness.contextCompleteness}/15</span>
                <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                  <div className="bg-lemonChiffon h-full" style={{ width: `${(readiness.contextCompleteness / 15) * 100}%` }} />
                </div>
              </div>
            </div>

            {readiness.reasons.length > 0 && (
              <div className="pt-2 border-t border-borderDark/60 space-y-1.5 text-xs">
                <span className="font-semibold text-textMuted block text-[11px]">Score Justification:</span>
                <ul className="space-y-1 text-textPrimary pl-1">
                  {readiness.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-lemonChiffon font-bold">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {readiness.blockers.length > 0 && (
              <div className="p-3 rounded-lg bg-rosewood/20 border border-rosewood/40 text-xs text-cotton space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-electricTangerine" />
                  <span>Important Consideration:</span>
                </span>
                <ul className="space-y-1 pl-5 list-disc text-cotton/90">
                  {readiness.blockers.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Skill Gap & Learning Mode Checklist */}
        <div className="p-5 rounded-xl bg-black border border-borderDark space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-lemonChiffon" />
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Skill Gap &amp; Learning Mode Checklist
              </h3>
            </div>
            <span className="text-[11px] font-mono text-lemonChiffon">
              {learningItems.filter((i) => i.completed).length} of {learningItems.length} completed
            </span>
          </div>
          <p className="text-xs text-textMuted">
            Review and check off foundational concepts before opening your pull request:
          </p>

          <div className="space-y-2.5">
            {learningItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleSkill(item.id, item.completed)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.completed
                    ? 'bg-coffeeBean/60 border-lemonChiffon/60 text-lemonChiffon'
                    : 'bg-blackHole border-borderDark text-textPrimary hover:border-borderDark/80'
                }`}
              >
                <div className="pt-0.5">
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-lemonChiffon" />
                  ) : (
                    <Square className="w-4 h-4 text-textMuted" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${item.completed ? 'line-through text-lemonChiffon' : 'text-textPrimary'}`}>
                      {item.concept}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black border border-borderDark text-textMuted">
                      {item.level.toUpperCase()} • ~{item.estimatedMinutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-textMuted leading-relaxed">{item.whyNeeded}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Chain / Trust Trail */}
        {chain && chain.steps && (
          <div className="p-5 rounded-xl bg-black border border-borderDark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-electricTangerine" />
                <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                  Evidence Chain &amp; Trust Trail
                </h3>
              </div>
              <span className="text-[11px] font-mono text-lemonChiffon">
                8 Traceable Verification Steps
              </span>
            </div>

            <div className="space-y-2">
              {chain.steps.map((step) => (
                <div
                  key={step.step}
                  className="p-3 rounded-lg bg-blackHole border border-borderDark/60 flex items-start gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-coffeeBean border border-borderDark text-lemonChiffon font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {step.step}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-textPrimary">{step.label}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        step.verifiedBy === 'osv'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                          : step.verifiedBy === 'scanner'
                          ? 'bg-black text-botticelli border-botticelli/30'
                          : step.verifiedBy === 'gemini'
                          ? 'bg-black text-lemonChiffon border-lemonChiffon/30'
                          : 'bg-rosewood/30 text-rosewood border-rosewood/40'
                      }`}>
                        {step.verifiedBy === 'osv'
                          ? 'Verified by OSV'
                          : step.verifiedBy === 'scanner'
                          ? 'Verified by Scanner'
                          : step.verifiedBy === 'gemini'
                          ? 'Grounded by Gemini'
                          : 'Human Review Required'}
                      </span>
                    </div>
                    <p className="text-textMuted leading-relaxed text-[11px]">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beginner Contributor Answers Framework */}
        <div className="p-6 rounded-2xl bg-black border border-lemonChiffon/30 space-y-4">
          <h3 className="text-xs font-bold text-lemonChiffon uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-lemonChiffon" />
            Beginner Contributor Roadmap
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-electricTangerine block">1. What is wrong?</span>
              <p className="text-textMuted leading-relaxed">{finding?.impact || route.summary}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-botticelli block">2. Where is it?</span>
              <span className="font-mono text-cotton block truncate">{route.files.join(', ') || 'Repository Root'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-lemonChiffon block">3. What skill is needed?</span>
              <span className="text-cotton font-semibold block">{route.skills.join(', ')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-sustainableLinen block">4. What should I change?</span>
              <p className="text-textPrimary leading-relaxed">{route.suggestedChange || 'Update configuration per guidance.'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-lemonChiffon block">5. How do I test it?</span>
              <p className="text-textMuted leading-relaxed">{route.testPlan[0] || 'Run local test suite.'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blackHole border border-borderDark space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">6. When is it complete?</span>
              <p className="text-textMuted leading-relaxed">{route.acceptanceCriteria[0] || 'Fix tested and verified.'}</p>
            </div>
          </div>
        </div>

        {/* Target Files & Required Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black border border-borderDark space-y-1.5">
            <span className="font-semibold text-textMuted uppercase tracking-wider text-[11px]">Target Files to Edit</span>
            <div className="space-y-1">
              {route.files.map((file, idx) => (
                <div key={idx} className="font-mono text-lemonChiffon bg-blackHole px-3 py-1.5 rounded-lg border border-borderDark">
                  {file}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black border border-borderDark space-y-1.5">
            <span className="font-semibold text-textMuted uppercase tracking-wider text-[11px]">Required Technical Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {route.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-coffeeBean text-cotton border border-borderDark text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-Step Test Plan & Acceptance Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Test Plan */}
          <div className="p-5 rounded-xl bg-black border border-borderDark space-y-3">
            <h3 className="font-semibold text-textPrimary uppercase tracking-wider text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-lemonChiffon" />
              Local Verification &amp; Test Plan
            </h3>
            <ul className="space-y-2">
              {route.testPlan.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-blackHole border border-borderDark/60">
                  <span className="text-lemonChiffon font-mono font-bold text-xs shrink-0">{idx + 1}.</span>
                  <span className="text-textPrimary leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Acceptance Criteria */}
          <div className="p-5 rounded-xl bg-black border border-borderDark space-y-3">
            <h3 className="font-semibold text-textPrimary uppercase tracking-wider text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-electricTangerine" />
              Maintainer Acceptance Criteria
            </h3>
            <ul className="space-y-2">
              {route.acceptanceCriteria.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-blackHole border border-borderDark/60">
                  <span className="text-electricTangerine font-mono font-bold text-xs shrink-0">✓</span>
                  <span className="text-textPrimary leading-relaxed">{crit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
