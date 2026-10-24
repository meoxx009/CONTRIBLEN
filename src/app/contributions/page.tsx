'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Compass,
  Layers,
  CheckCircle2,
  ArrowRight,
  FileText,
  Clock,
  Loader2,
  Terminal,
  Lock,
  Sparkles,
  ExternalLink,
  Code2,
  FileCode,
  Shield,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  Wrench,
  Download,
} from 'lucide-react';
import type { ContributionRoute, TechStack, Finding } from '@/types';

function ContributionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedRouteId = searchParams.get('routeId');

  const { activeScan, showToast } = useApp();

  const [routes, setRoutes] = useState<ContributionRoute[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null);
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [updatingRouteId, setUpdatingRouteId] = useState<string | null>(null);
  const [generatingAllRoutes, setGeneratingAllRoutes] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(highlightedRouteId);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScan]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const routeUrl = activeScan ? `/api/routes?scanId=${activeScan.id}` : '/api/routes';
      const findingUrl = activeScan ? `/api/findings?scanId=${activeScan.id}` : '/api/findings';

      const [routeRes, findingRes] = await Promise.all([
        fetch(routeUrl),
        fetch(findingUrl),
      ]);

      if (routeRes.ok) {
        const data = await routeRes.json();
        const loadedRoutes: ContributionRoute[] = data.routes || [];
        setRoutes(loadedRoutes);
        if (loadedRoutes.length > 0 && !selectedRouteId) {
          setSelectedRouteId(highlightedRouteId || loadedRoutes[0].id);
        }
      }

      if (findingRes.ok) {
        const fData = await findingRes.json();
        setFindings(fData.findings || []);
      }
    } catch (e) {
      console.error('Failed to load contributions data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (routeId: string, newStatus: ContributionRoute['status']) => {
    setUpdatingRouteId(routeId);
    try {
      const res = await fetch('/api/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoutes((prev) =>
          prev.map((r) => (r.id === routeId ? { ...r, status: newStatus } : r))
        );
        showToast(`Route status updated to "${newStatus.replace('-', ' ')}"`, 'info');
      } else {
        showToast(data.error || 'Failed to update route status', 'error');
      }
    } catch {
      showToast('Network error updating route status', 'error');
    } finally {
      setUpdatingRouteId(null);
    }
  };

  const handleGenerateDraft = async (routeId: string) => {
    setGeneratingDraftId(routeId);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId }),
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
      setGeneratingDraftId(null);
    }
  };

  const handleDownloadPack = async (routeId: string) => {
    setDownloadingPackId(routeId);
    try {
      const res = await fetch(`/api/routes/${routeId}/pack`);
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to download pack', 'error');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contriblens-pack-${routeId}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Contribution pack downloaded successfully!', 'success');
    } catch {
      showToast('Network error downloading contribution pack', 'error');
    } finally {
      setDownloadingPackId(null);
    }
  };

  const handleAutoGenerateRoutes = async () => {
    if (findings.length === 0) {
      showToast('No verified findings available to generate routes from.', 'info');
      return;
    }
    setGeneratingAllRoutes(true);
    try {
      const unrouted = findings.filter(
        (f) => !routes.some((r) => r.findingId === f.id || (r.findingIds && r.findingIds.includes(f.id)))
      );

      if (unrouted.length === 0) {
        showToast('All findings already have active contribution routes.', 'info');
        setGeneratingAllRoutes(false);
        return;
      }

      let createdCount = 0;
      for (const f of unrouted.slice(0, 5)) {
        const res = await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ findingId: f.id }),
        });
        if (res.ok) createdCount++;
      }

      showToast(`Created ${createdCount} new contribution routes!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to auto-generate contribution routes', 'error');
    } finally {
      setGeneratingAllRoutes(false);
    }
  };

  const techStack: TechStack | undefined = activeScan?.techStack;
  const readinessScore = activeScan?.readinessScore ?? 65;

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (difficultyFilter !== 'all' && r.difficulty !== difficultyFilter) return false;
      if (statusFilter !== 'all' && (r.status || 'not-started') !== statusFilter) return false;
      return true;
    });
  }, [routes, difficultyFilter, statusFilter]);

  // Pick top contribution recommendation
  const topRoute = useMemo(() => {
    if (routes.length === 0) return null;
    const sorted = [...routes].sort((a, b) => {
      const diffWeight = { beginner: 3, intermediate: 2, advanced: 1 };
      const wA = diffWeight[a.difficulty] || 1;
      const wB = diffWeight[b.difficulty] || 1;
      if (wB !== wA) return wB - wA;
      const scoreA = a.readiness?.total ?? a.readinessScore ?? 0;
      const scoreB = b.readiness?.total ?? b.readinessScore ?? 0;
      return scoreB - scoreA;
    });
    return sorted[0];
  }, [routes]);

  // Selected route for the Contribution Impact Graph
  const activeRoute = useMemo(() => {
    if (selectedRouteId) {
      const found = routes.find((r) => r.id === selectedRouteId);
      if (found) return found;
    }
    return topRoute || routes[0] || null;
  }, [routes, selectedRouteId, topRoute]);

  // Find linked finding for active route
  const activeFinding = useMemo(() => {
    if (!activeRoute) return null;
    const fId = activeRoute.findingId || (activeRoute.findingIds && activeRoute.findingIds[0]);
    return findings.find((f) => f.id === fId) || null;
  }, [activeRoute, findings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10 bg-black text-textPrimary">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderDark">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
            <span>Contributions + Technology Stack</span>
            {activeScan && (
              <span className="text-xs font-mono font-medium text-lemonChiffon bg-coffeeBean px-3 py-1 rounded-full border border-lemonChiffon/20">
                {activeScan.repoName}
              </span>
            )}
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Merged architecture inspection and prioritized contributor tracks with concrete test plans and acceptance criteria.
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-3">
          <div className="glass-panel p-3.5 rounded-2xl border border-borderDark flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lemonChiffon/15 border border-lemonChiffon/30 flex items-center justify-center text-lemonChiffon font-bold text-base font-mono">
              {readinessScore}
            </div>
            <div>
              <div className="text-xs font-bold text-textPrimary">Contribution Readiness</div>
              <div className="text-[11px] text-textMuted">
                {readinessScore >= 80 ? 'Excellent Onboarding' : readinessScore >= 60 ? 'Moderate Friction' : 'Needs Docs'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Top Technology Chips & Manifests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-electricTangerine" />
            <h2 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Detected Technology Stack &amp; Manifests
            </h2>
          </div>
          {techStack && (
            <span className="text-[11px] font-mono text-lemonChiffon">
              Confidence Score: {techStack.confidenceScore}%
            </span>
          )}
        </div>

        {techStack ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Languages */}
            <div className="glass-panel p-5 rounded-2xl border border-borderDark space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Languages</span>
                <span className="text-lemonChiffon font-mono text-[11px]">{techStack.languages.length} detected</span>
              </h3>
              <div className="space-y-3">
                {techStack.languages.map((l) => (
                  <div key={l.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-textPrimary">
                      <span className="font-semibold">{l.name}</span>
                      <span className="font-mono text-lemonChiffon text-[11px]">
                        {Math.round((l.confidence ?? 0.9) * 100)}% Conf
                      </span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                      <div className="bg-lemonChiffon h-full rounded-full" style={{ width: `${l.percentage}%` }} />
                    </div>
                    {l.sources && l.sources.length > 0 && (
                      <div className="text-[10px] text-textMuted font-mono truncate" title={l.sources.join(', ')}>
                        src: {l.sources.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Frameworks */}
            <div className="glass-panel p-5 rounded-2xl border border-borderDark space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Frameworks</span>
                <span className="text-botticelli font-mono text-[11px]">{techStack.frameworks.length} found</span>
              </h3>
              {techStack.frameworks.length > 0 ? (
                <div className="space-y-2">
                  {techStack.frameworks.map((f) => (
                    <div
                      key={f.name}
                      className="p-2.5 rounded-xl bg-black border border-borderDark text-xs text-botticelli flex flex-col"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-textPrimary">{f.name}</span>
                        <span className="font-mono text-[10px] text-lemonChiffon">
                          {Math.round((f.confidence ?? 0.95) * 100)}% Conf
                        </span>
                      </div>
                      <span className="text-[10px] text-textMuted mt-0.5">{f.category}</span>
                      {f.sources && f.sources.length > 0 && (
                        <span className="text-[10px] font-mono text-lemonChiffon/70 truncate mt-0.5">
                          via {f.sources[0]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textMuted">No major web framework detected.</p>
              )}
            </div>

            {/* Tooling & Testing */}
            <div className="glass-panel p-5 rounded-2xl border border-borderDark space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Tooling &amp; CI</span>
                <span className="text-cotton font-mono text-[11px]">{techStack.tooling.length} found</span>
              </h3>
              {techStack.tooling.length > 0 ? (
                <div className="space-y-2">
                  {techStack.tooling.map((t) => (
                    <div
                      key={t.name}
                      className="p-2.5 rounded-xl bg-black border border-borderDark text-xs text-cotton flex flex-col"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lemonChiffon">{t.name}</span>
                        <span className="font-mono text-[10px] text-botticelli">
                          {Math.round((t.confidence ?? 0.9) * 100)}% Conf
                        </span>
                      </div>
                      <span className="text-[10px] text-textMuted mt-0.5">{t.category}</span>
                      {t.sources && t.sources.length > 0 && (
                        <span className="text-[10px] font-mono text-textMuted truncate mt-0.5">
                          via {t.sources[0]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textMuted">Standard build tooling detected.</p>
              )}
            </div>

            {/* Manifest Files */}
            <div className="glass-panel p-5 rounded-2xl border border-borderDark space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center justify-between">
                <span>Package Manifests</span>
                <span className="text-sustainableLinen font-mono text-[11px]">{techStack.manifests.length} files</span>
              </h3>
              {techStack.manifests.length > 0 ? (
                <div className="space-y-2">
                  {techStack.manifests.map((m) => (
                    <div key={m.path} className="p-2.5 rounded-xl bg-black border border-borderDark text-xs">
                      <div className="font-mono text-lemonChiffon truncate">{m.path}</div>
                      <div className="text-[11px] text-textMuted mt-0.5">
                        Type: <strong className="text-textPrimary uppercase">{m.type}</strong>
                        {m.dependenciesCount > 0 && ` (${m.dependenciesCount} deps)`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textMuted">No standard package manifests found.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl border border-borderDark text-xs text-textMuted text-center">
            Run a repository scan to automatically detect languages, frameworks, and tooling.
          </div>
        )}
      </section>

      {/* Part 2: Top Contribution Recommendation */}
      {topRoute && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lemonChiffon" />
              <h2 className="text-xs font-bold text-lemonChiffon uppercase tracking-wider">
                Top Contribution Recommendation
              </h2>
            </div>
            <span className="text-[11px] font-mono text-textMuted">
              Optimal First Contributor Track
            </span>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-lemonChiffon/40 bg-gradient-to-br from-coffeeBean/40 to-black space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lemonChiffon text-black">
                    {topRoute.difficulty} track
                  </span>
                  <span className="text-xs font-medium text-textMuted flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-botticelli" />
                    Est. {topRoute.estimatedEffort || `${topRoute.estimatedMinutes || 30} mins`}
                  </span>
                  <span className="text-xs font-mono text-lemonChiffon">
                    Readiness: {topRoute.contributionReadiness?.total ?? topRoute.readiness?.total ?? topRoute.readinessScore ?? 85}/100
                  </span>
                  {(topRoute.contributionReadiness?.label || topRoute.readinessLabel) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                      {(topRoute.contributionReadiness?.label || topRoute.readinessLabel)?.replace(/-/g, ' ')}
                    </span>
                  )}
                  {topRoute.urgencyLabel && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rosewood/30 text-rosewood border border-rosewood/40">
                      Urg: {topRoute.urgencyLabel}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-textPrimary leading-snug">
                  {topRoute.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/app/contributions/${topRoute.id}`}
                  className="px-4 py-2 rounded-full bg-blackHole hover:bg-black text-textPrimary text-xs font-semibold border border-borderDark flex items-center gap-1.5 transition-colors"
                >
                  <span>Route Blueprint</span>
                  <ExternalLink className="w-3.5 h-3.5 text-botticelli" />
                </Link>

                <button
                  onClick={() => handleDownloadPack(topRoute.id)}
                  disabled={downloadingPackId === topRoute.id}
                  className="px-4 py-2 rounded-full bg-blackHole hover:bg-black text-lemonChiffon text-xs font-semibold border border-lemonChiffon/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Download self-contained Contribution Pack (.md)"
                >
                  {downloadingPackId === topRoute.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Export Pack</span>
                </button>

                {topRoute.category === 'secret' ? (
                  <div className="px-4 py-2 rounded-full bg-rosewood/30 text-cotton text-xs font-semibold flex items-center gap-1.5 border border-rosewood">
                    <Lock className="w-3.5 h-3.5 text-lemonChiffon" />
                    <span>Private Disclosure</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateDraft(topRoute.id)}
                    disabled={generatingDraftId === topRoute.id}
                    className="px-5 py-2 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lemonChiffon/20 disabled:opacity-50"
                  >
                    {generatingDraftId === topRoute.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Issue Draft</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Beginner 6-Question Framework Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 text-xs">
              
              {/* 1. What is wrong? */}
              <div className="p-4 rounded-xl bg-black border border-electricTangerine/30 space-y-1.5">
                <span className="font-bold text-electricTangerine uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 1. What is wrong?
                </span>
                <p className="text-textMuted leading-relaxed">
                  {topRoute.summary || 'Security or repository health gap detected by deterministic scanner.'}
                </p>
              </div>

              {/* 2. Where is it? */}
              <div className="p-4 rounded-xl bg-black border border-botticelli/30 space-y-1.5">
                <span className="font-bold text-botticelli uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5" /> 2. Where is it?
                </span>
                <div className="font-mono text-cotton truncate">
                  {topRoute.files.join(', ') || 'Repository Root'}
                </div>
                {activeFinding && (
                  <span className="text-[10px] text-textMuted block font-mono">
                    Rule: {activeFinding.ruleId}
                  </span>
                )}
              </div>

              {/* 3. What skill is needed? */}
              <div className="p-4 rounded-xl bg-black border border-lemonChiffon/30 space-y-1.5">
                <span className="font-bold text-lemonChiffon uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> 3. What skill is needed?
                </span>
                <div className="flex flex-wrap gap-1">
                  {topRoute.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blackHole text-lemonChiffon text-[10px] font-mono border border-borderDark">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. What should I change? */}
              <div className="p-4 rounded-xl bg-black border border-sustainableLinen/30 space-y-1.5">
                <span className="font-bold text-sustainableLinen uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" /> 4. What should I change?
                </span>
                <p className="text-cotton leading-relaxed">
                  {topRoute.suggestedChange || 'Update configuration to follow secure repository guidelines.'}
                </p>
              </div>

              {/* 5. How do I test it? */}
              <div className="p-4 rounded-xl bg-black border border-borderDark space-y-1.5">
                <span className="font-bold text-lemonChiffon uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" /> 5. How do I test it?
                </span>
                <p className="text-textMuted leading-relaxed">
                  {topRoute.testPlan[0] || 'Run local verification linter or test suite.'}
                </p>
              </div>

              {/* 6. When is it complete? */}
              <div className="p-4 rounded-xl bg-black border border-emerald-500/30 space-y-1.5">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 6. When is it complete?
                </span>
                <p className="text-textMuted leading-relaxed">
                  {topRoute.acceptanceCriteria[0] || 'CI passes and configuration changes are tested.'}
                </p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Part 3: Contribution Impact Graph (Finding → File/Line → Technology/Skill → Task → Test → Issue) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-electricTangerine" />
            <h2 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Contribution Impact Graph
            </h2>
          </div>
          <span className="text-[11px] font-mono text-textMuted">
            Interactive Flow: Finding → File/Line → Technology/Skill → Task → Test → Issue
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-borderDark overflow-x-auto no-scrollbar">
          <div className="min-w-[850px] flex items-stretch justify-between gap-3 text-xs">
            
            {/* Stage 1: Finding */}
            <div className="flex-1 p-3.5 rounded-xl bg-black border border-electricTangerine/40 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-electricTangerine shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-electricTangerine uppercase">
                    1. Finding
                  </span>
                </div>
                <div className="text-xs font-semibold text-textPrimary line-clamp-2">
                  {activeFinding?.title || activeRoute?.title.replace('Fix: ', '') || 'Static Finding'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-textMuted">
                {activeFinding?.ruleId || 'DETERMINISTIC'}
              </span>
            </div>

            <div className="flex items-center text-borderDark font-bold">→</div>

            {/* Stage 2: File / Line */}
            <div className="flex-1 p-3.5 rounded-xl bg-black border border-botticelli/40 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-botticelli shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-botticelli uppercase">
                    2. File / Line
                  </span>
                </div>
                <div className="text-xs font-mono text-cotton truncate" title={activeRoute?.files[0] || 'Config'}>
                  {activeRoute?.files[0] || 'Repository Root'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-botticelli">
                {activeFinding?.lineStart ? `Line ${activeFinding.lineStart}` : 'Config Root'}
              </span>
            </div>

            <div className="flex items-center text-borderDark font-bold">→</div>

            {/* Stage 3: Technology / Skill */}
            <div className="flex-1 p-3.5 rounded-xl bg-black border border-lemonChiffon/40 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-lemonChiffon shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-lemonChiffon uppercase">
                    3. Technology / Skill
                  </span>
                </div>
                <div className="text-xs font-semibold text-textPrimary truncate">
                  {activeRoute?.skills.slice(0, 2).join(', ') || 'Git, Markdown'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-lemonChiffon">
                {activeRoute?.difficulty || 'beginner'} difficulty
              </span>
            </div>

            <div className="flex items-center text-borderDark font-bold">→</div>

            {/* Stage 4: Task */}
            <div className="flex-1 p-3.5 rounded-xl bg-black border border-recycledCotton/40 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-recycledCotton shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-recycledCotton uppercase">
                    4. Task
                  </span>
                </div>
                <div className="text-xs font-semibold text-cotton line-clamp-2">
                  {activeRoute?.suggestedChange || 'Update configuration per guidance'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-textMuted">
                Est. {activeRoute?.estimatedEffort || '30 mins'}
              </span>
            </div>

            <div className="flex items-center text-borderDark font-bold">→</div>

            {/* Stage 5: Test */}
            <div className="flex-1 p-3.5 rounded-xl bg-black border border-emerald-500/40 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    5. Test
                  </span>
                </div>
                <div className="text-xs font-semibold text-textPrimary line-clamp-2">
                  {activeRoute?.testPlan[0] || 'Verify change locally'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                {activeRoute?.testPlan.length || 1} verify step(s)
              </span>
            </div>

            <div className="flex items-center text-borderDark font-bold">→</div>

            {/* Stage 6: Issue */}
            <div className="flex-1 p-3.5 rounded-xl bg-sustainableLinen text-black border border-sustainableLinen flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                  <span className="text-[10px] font-mono font-bold uppercase">
                    6. Issue Draft
                  </span>
                </div>
                <div className="text-xs font-bold leading-snug">
                  {activeRoute?.draftId ? 'Draft Persisted' : 'Reviewable Draft Ready'}
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold">
                6 Required Sections
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Part 4: All Available Routes & Actionable Plans */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-electricTangerine" />
            <h2 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
              Available Contribution Routes ({filteredRoutes.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Difficulty */}
            <div className="flex items-center gap-1 bg-black p-1 rounded-full border border-borderDark text-xs">
              <span className="text-[10px] font-mono text-textMuted px-2">Track:</span>
              {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono capitalize transition-colors ${
                    difficultyFilter === d
                      ? 'bg-lemonChiffon text-black font-semibold'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1 bg-black p-1 rounded-full border border-borderDark text-xs">
              <span className="text-[10px] font-mono text-textMuted px-2">Status:</span>
              {['all', 'not-started', 'in-progress', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-coffeeBean text-lemonChiffon font-semibold border border-lemonChiffon/30'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {st.replace('-', ' ')}
                </button>
              ))}
            </div>

            {findings.length > routes.length && (
              <button
                onClick={handleAutoGenerateRoutes}
                disabled={generatingAllRoutes}
                className="px-3.5 py-1.5 rounded-full bg-coffeeBean hover:bg-coffeeBean/80 text-lemonChiffon border border-lemonChiffon/30 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {generatingAllRoutes ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-electricTangerine" />
                )}
                <span>+ Build routes from findings</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-borderDark">
            <Loader2 className="w-8 h-8 text-lemonChiffon animate-spin mx-auto mb-2" />
            <p className="text-xs text-textMuted font-mono">Loading contribution blueprints...</p>
          </div>
        ) : filteredRoutes.length > 0 ? (
          <div className="space-y-6">
            {filteredRoutes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const isCompleted = route.status === 'completed';
              const isInProgress = route.status === 'in-progress';
              const isNeedsReview = route.status === 'needs-review';

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all space-y-6 cursor-pointer ${
                    isSelected
                      ? 'border-lemonChiffon/70 ring-1 ring-lemonChiffon/30 shadow-xl'
                      : 'border-borderDark hover:border-borderDark/80'
                  }`}
                >
                  
                  {/* Route Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-3 py-0.5 rounded-full border uppercase ${
                            route.difficulty === 'beginner'
                              ? 'bg-black text-lemonChiffon border-lemonChiffon/40'
                              : route.difficulty === 'intermediate'
                              ? 'bg-black text-electricTangerine border-electricTangerine/40'
                              : 'bg-black text-rosewood border-rosewood/40'
                          }`}
                        >
                          {route.difficulty} track
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                            route.generatedBy === 'gemini'
                              ? 'bg-black text-lemonChiffon border-lemonChiffon/30'
                              : 'bg-coffeeBean text-lemonChiffon border-electricTangerine/40'
                          }`}
                        >
                          {route.generatedBy === 'gemini' ? 'Gemini Grounded' : 'Fallback Used: Deterministic'}
                        </span>

                        <span className="text-xs font-medium text-textMuted flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-botticelli" />
                          Est. Effort: <strong className="text-textPrimary">{route.estimatedEffort || '30 mins'}</strong>
                        </span>

                        <span className="text-xs font-mono text-lemonChiffon font-semibold">
                          Readiness: {route.contributionReadiness?.total ?? route.readiness?.total ?? route.readinessScore ?? 80}/100
                        </span>

                        {(route.contributionReadiness?.label || route.readinessLabel) && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 uppercase">
                            {(route.contributionReadiness?.label || route.readinessLabel)?.replace(/-/g, ' ')}
                          </span>
                        )}

                        {route.urgencyLabel && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rosewood/30 text-rosewood border border-rosewood/40 uppercase">
                            Urg: {route.urgencyLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-textPrimary">{route.title}</h3>
                      <p className="text-xs text-textMuted leading-relaxed max-w-3xl">
                        {route.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        href={`/app/contributions/${route.id}`}
                        className="p-2 rounded-full bg-black hover:bg-blackHole text-textMuted hover:text-lemonChiffon border border-borderDark transition-colors"
                        title="Open Dedicated Route Blueprint"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPack(route.id);
                        }}
                        disabled={downloadingPackId === route.id}
                        className="p-2 rounded-full bg-black hover:bg-blackHole text-textMuted hover:text-lemonChiffon border border-borderDark transition-colors"
                        title="Download self-contained Contribution Pack (.md)"
                      >
                        {downloadingPackId === route.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-lemonChiffon" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>

                      {route.category === 'secret' ? (
                        <div className="px-4 py-2 rounded-full bg-rosewood/30 text-cotton text-xs font-semibold flex items-center gap-1.5 border border-rosewood">
                          <Lock className="w-3.5 h-3.5 text-lemonChiffon" />
                          <span>Private Disclosure Required</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateDraft(route.id);
                          }}
                          disabled={generatingDraftId === route.id}
                          className="px-5 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lemonChiffon/20 disabled:opacity-50"
                        >
                          {generatingDraftId === route.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating...</span>
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

                  {/* Beginner Guidance 4-Box Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-black border border-borderDark">
                      <span className="text-textMuted text-[10px] uppercase font-bold block mb-1">Target File</span>
                      <code className="text-lemonChiffon font-mono text-[11px] block truncate">
                        {route.files[0] || 'Configuration'}
                      </code>
                    </div>

                    <div className="p-3 rounded-xl bg-black border border-borderDark">
                      <span className="text-textMuted text-[10px] uppercase font-bold block mb-1">Required Skills</span>
                      <span className="text-cotton font-semibold text-[11px] block truncate">
                        {route.skills.join(', ')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black border border-borderDark sm:col-span-2">
                      <span className="text-textMuted text-[10px] uppercase font-bold block mb-1">Suggested Change</span>
                      <p className="text-textPrimary text-[11px] leading-relaxed line-clamp-2">
                        {route.suggestedChange || 'Apply fix per repository best practices.'}
                      </p>
                    </div>
                  </div>

                  {/* Deterministic Readiness Score Breakdown */}
                  {route.readiness && (
                    <div className="p-3.5 rounded-xl bg-black/60 border border-borderDark/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-textMuted font-medium">Deterministic Readiness Breakdown:</span>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-botticelli">Security Impact: +{route.readiness.securityImpact}</span>
                        <span className="text-borderDark">•</span>
                        <span className="text-cotton">Evidence Conf: +{route.readiness.evidenceConfidence}</span>
                        <span className="text-borderDark">•</span>
                        <span className="text-lemonChiffon">Test Signal: +{route.readiness.testAvailability}</span>
                        <span className="text-borderDark">•</span>
                        <span className="text-sustainableLinen">Doc Clarity: +{route.readiness.documentationClarity}</span>
                        <span className="text-borderDark">•</span>
                        <span className="text-electricTangerine font-bold">Total: {route.readiness.total}/100</span>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Test Plan & Acceptance Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Test Plan */}
                    <div className="p-4 rounded-xl bg-black border border-borderDark space-y-2.5">
                      <h4 className="font-semibold text-textPrimary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-lemonChiffon" />
                        Step-by-Step Verification Plan
                      </h4>
                      <ul className="space-y-1.5 text-textMuted">
                        {route.testPlan.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-lemonChiffon font-mono text-[11px] shrink-0">{idx + 1}.</span>
                            <span className="leading-relaxed text-textPrimary">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Acceptance Criteria */}
                    <div className="p-4 rounded-xl bg-black border border-borderDark space-y-2.5">
                      <h4 className="font-semibold text-textPrimary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-electricTangerine" />
                        Maintainer Acceptance Criteria
                      </h4>
                      <ul className="space-y-1.5 text-textMuted">
                        {route.acceptanceCriteria.map((crit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-electricTangerine font-mono text-[11px] shrink-0">✓</span>
                            <span className="leading-relaxed text-textPrimary">{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Status Toggle & Persistence Bar */}
                  <div className="pt-3 border-t border-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-textMuted">Current Status:</span>
                      <span
                        className={`text-xs font-bold font-mono px-3 py-0.5 rounded-full capitalize ${
                          isCompleted
                            ? 'bg-lemonChiffon text-black'
                            : isInProgress
                            ? 'bg-electricTangerine text-black'
                            : isNeedsReview
                            ? 'bg-botticelli text-black'
                            : 'bg-coffeeBean text-lemonChiffon'
                        }`}
                      >
                        {(route.status || 'not-started').replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-blackHole p-1 rounded-full border border-borderDark">
                      <span className="text-[10px] text-textMuted font-mono px-2">Update:</span>
                      {(['not-started', 'in-progress', 'needs-review', 'completed'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(route.id, st);
                          }}
                          disabled={updatingRouteId === route.id}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded-full capitalize transition-all ${
                            (route.status || 'not-started') === st
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

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 glass-panel rounded-2xl border border-dashed border-borderDark px-4 space-y-4">
            <Compass className="w-12 h-12 text-lemonChiffon/60 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-textPrimary">No contribution routes created yet</h3>
              <p className="text-xs text-textMuted mt-1 max-w-md mx-auto leading-relaxed">
                Contribution routes are actionable fix blueprints constructed from verified security findings and repository health gaps.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/app/findings"
                className="px-5 py-2.5 rounded-full bg-lemonChiffon text-black text-xs font-semibold hover:bg-sustainableLinen transition-colors shadow-sm"
              >
                Browse Verified Findings →
              </Link>
              <Link
                href="/app/scan"
                className="px-5 py-2.5 rounded-full bg-blackHole hover:bg-black text-textPrimary text-xs font-semibold border border-borderDark transition-colors"
              >
                Scan Another Repository
              </Link>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

export default function ContributionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-16 bg-black">
          <div className="w-8 h-8 border-2 border-lemonChiffon border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ContributionsContent />
    </Suspense>
  );
}
