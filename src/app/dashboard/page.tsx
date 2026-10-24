'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  Shield,
  Search,
  AlertTriangle,
  Compass,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { ScanSummary, ContributionRoute, ActivityEvent, Finding } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeScan, setActiveScan, loading: appLoading } = useApp();

  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [routes, setRoutes] = useState<ContributionRoute[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!appLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appLoading]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [scansRes, routesRes, findingsRes, profileRes] = await Promise.all([
        fetch('/api/scans'),
        fetch('/api/routes'),
        fetch('/api/findings'),
        fetch('/api/profile'),
      ]);

      if (scansRes.ok) {
        const data = await scansRes.json();
        setScans(data.scans || []);
        if (!activeScan && data.scans?.length > 0) {
          setActiveScan(data.scans[0]);
        }
      }

      if (routesRes.ok) {
        const data = await routesRes.json();
        setRoutes(data.routes || []);
      }

      if (findingsRes.ok) {
        const data = await findingsRes.json();
        setFindings(data.findings || []);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setActivities(data.activities || []);
      }
    } catch (e: any) {
      console.error('Failed to load dashboard data:', e);
      setFetchError('Failed to load workspace data. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalScans = scans.length;
  const openFindingsCount = findings.length;

  const displayedRoutes = activeScan
    ? routes.filter((r) => r.scanId === activeScan.id)
    : routes;

  const openRoutes = displayedRoutes.filter((r) => r.status !== 'completed');
  const completedRoutes = displayedRoutes.filter((r) => r.status === 'completed');
  const progressPercentage =
    displayedRoutes.length > 0
      ? Math.round((completedRoutes.length / displayedRoutes.length) * 100)
      : 0;

  const relevantFindings = activeScan
    ? findings.filter((f) => f.scanId === activeScan.id)
    : findings;

  const goodFirstCount = relevantFindings.filter(
    (f) => f.readiness?.label === 'good-first-contribution'
  ).length;

  const maintainerLevelCount = relevantFindings.filter(
    (f) => f.readiness?.label === 'maintainer-assistance'
  ).length;

  const resolvedCount = activeScan?.resolvedCount ?? 0;

  const recommendedRoute =
    openRoutes.find((r) => r.difficulty === 'beginner') ||
    openRoutes[0] ||
    null;

  const displayedFindingsCount = activeScan
    ? activeScan.findingsCount.total
    : openFindingsCount;

  if (appLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-lemonChiffon animate-spin" />
          <span className="text-xs text-textMuted">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-black text-textPrimary">
      
      {/* Welcome & Primary CTA Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderDark">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
            Welcome back, <span className="text-lemonChiffon">{user?.name || 'Contributor'}</span>
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Navigate verified findings, plan bounded contributor fixes, and generate maintainer-ready drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/scan"
            className="px-6 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-xs transition-all shadow-md hover:shadow-lemonChiffon/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Scan Repository</span>
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-rosewood/30 border border-rosewood text-cotton text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-electricTangerine shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-1.5 rounded-full bg-lemonChiffon text-black font-semibold text-xs hover:bg-sustainableLinen transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Open Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        <div className="glass-panel p-4 rounded-2xl border border-borderDark flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-borderDark flex items-center justify-center text-electricTangerine shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">{totalScans}</div>
            <div className="text-[11px] text-textMuted leading-tight">Repositories Scanned</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-borderDark flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rosewood/30 border border-rosewood/40 flex items-center justify-center text-rosewood shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">{displayedFindingsCount}</div>
            <div className="text-[11px] text-textMuted leading-tight">Verified Findings</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-borderDark flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-lemonChiffon/30 flex items-center justify-center text-lemonChiffon shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-lemonChiffon">{goodFirstCount}</div>
            <div className="text-[11px] text-textMuted leading-tight">Good First Opportunities</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-borderDark flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-electricTangerine/30 flex items-center justify-center text-electricTangerine shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">{maintainerLevelCount}</div>
            <div className="text-[11px] text-textMuted leading-tight">Maintainer Assistance</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-borderDark flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-borderDark flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400">{resolvedCount}</div>
            <div className="text-[11px] text-textMuted leading-tight">Resolved Findings</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recommended Task & Tech Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Next Task (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electricTangerine" />
                <h3 className="text-sm font-bold text-textPrimary">Next Best Action</h3>
              </div>
              <span className="text-[11px] font-mono text-lemonChiffon bg-black px-3 py-0.5 rounded-full border border-lemonChiffon/30">
                Grounded Route
              </span>
            </div>

            {recommendedRoute ? (
              <div className="p-5 rounded-xl bg-black border border-borderDark space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-textPrimary">{recommendedRoute.title}</h4>
                    <p className="text-xs text-textMuted mt-1">
                      Target File: <code className="text-lemonChiffon font-mono">{recommendedRoute.files[0]}</code>
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-coffeeBean text-lemonChiffon border border-borderDark capitalize">
                    {recommendedRoute.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-textMuted border-t border-blackHole">
                  <span>⏱ Effort: <strong className="text-textPrimary">{recommendedRoute.estimatedEffort}</strong></span>
                  <span>•</span>
                  <span>Skills: <strong className="text-textPrimary">{recommendedRoute.skills.join(', ')}</strong></span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-textMuted">
                    Readiness Score: <strong className="text-lemonChiffon">{recommendedRoute.readinessScore}/100</strong>
                  </span>
                  <Link
                    href={`/contributions?routeId=${recommendedRoute.id}`}
                    className="px-5 py-2 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <span>View Plan &amp; Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 rounded-xl bg-black border border-dashed border-borderDark">
                <Compass className="w-8 h-8 text-textMuted mx-auto mb-2" />
                <p className="text-xs text-textMuted">
                  {scans.length === 0
                    ? 'No repositories scanned yet. Run your first repository scan to receive tailored tasks.'
                    : 'No open contribution routes generated. Select a finding to generate a route.'}
                </p>
                <Link
                  href={scans.length === 0 ? '/app/scan' : '/app/findings'}
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-lemonChiffon hover:underline"
                >
                  {scans.length === 0 ? 'Scan a repository now' : 'Browse open findings'} →
                </Link>
              </div>
            )}
          </div>

          {/* Open Contribution Progress */}
          <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-lemonChiffon" />
                <h3 className="text-sm font-bold text-textPrimary">Open Contribution Progress</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-lemonChiffon">
                {completedRoutes.length} of {displayedRoutes.length} completed ({progressPercentage}%)
              </span>
            </div>
            <ProgressBar
              value={progressPercentage}
              variant="tangerine"
              size="md"
            />
            <div className="flex items-center justify-between text-[11px] text-textMuted pt-1">
              <span>Status: {openRoutes.length} active routes awaiting review</span>
              <Link href="/app/contributions" className="text-lemonChiffon hover:underline">
                View All Routes →
              </Link>
            </div>
          </div>

          {/* Recent Repositories */}
          <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-textPrimary">Recent Repositories</h3>
              <Link href="/app/scan" className="text-xs text-lemonChiffon hover:underline">
                New Scan →
              </Link>
            </div>

            {scans.length > 0 ? (
              <div className="space-y-3">
                {scans.slice(0, 4).map((s) => {
                  const isSelected = activeScan?.id === s.id;
                  const highestRisk =
                    s.findingsCount.critical > 0
                      ? { label: 'CRITICAL', style: 'bg-rosewood/40 text-red-300 border-rosewood' }
                      : s.findingsCount.high > 0
                      ? { label: 'HIGH', style: 'bg-electricTangerine/20 text-electricTangerine border-electricTangerine/40' }
                      : s.findingsCount.medium > 0
                      ? { label: 'MEDIUM', style: 'bg-botticelli/20 text-botticelli border-botticelli/40' }
                      : { label: 'LOW', style: 'bg-white/10 text-textMuted border-borderDark' };

                  const scanDate = new Date(s.scannedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const techList = s.techStack.languages.map((l) => l.name).slice(0, 3).join(', ') || 'Multi-tech';

                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveScan(s)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-black border-lemonChiffon shadow-md'
                          : 'bg-black/60 border-borderDark hover:border-borderDark/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <GitBranch className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-lemonChiffon' : 'text-textMuted'}`} />
                        <div>
                          <div className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                            <span>{s.repoName}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 px-2 py-0.5 rounded-full font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-textMuted flex flex-wrap items-center gap-2 mt-1">
                            <span>Last scan: <strong className="text-textPrimary">{scanDate}</strong></span>
                            <span>•</span>
                            <span>Stack: <strong className="text-lemonChiffon font-mono">{techList}</strong></span>
                            <span>•</span>
                            <span>{s.findingsCount.total} findings</span>
                            {s.comparison && (
                              <>
                                <span>•</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coffeeBean text-lemonChiffon border border-lemonChiffon/20">
                                  {s.comparison.summary.resolvedCount > 0
                                    ? `Diff: +${s.comparison.summary.newCount} new, ${s.comparison.summary.resolvedCount} resolved`
                                    : `Diff: +${s.comparison.summary.newCount} new, ${s.comparison.summary.unchangedCount} unchanged`}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-borderDark/40">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${highestRisk.style}`}>
                          {highestRisk.label}
                        </span>
                        <div className="text-right">
                          <div className="text-xs font-bold text-lemonChiffon">{s.readinessScore}/100</div>
                          <div className="text-[10px] text-textMuted">Readiness</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-textMuted hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-textMuted max-w-sm mx-auto leading-relaxed">
                  No repositories scanned yet. To start, provide any public GitHub repository URL to evaluate its health, dependencies, and contribution readiness.
                </p>
                <Link
                  href="/app/scan"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-lemonChiffon hover:underline"
                >
                  Start your first repository scan →
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar: Latest Tech Snapshot & Activity Timeline */}
        <div className="space-y-6">
          
          {/* Latest Tech Snapshot */}
          <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-electricTangerine" />
              <h3 className="text-sm font-bold text-textPrimary">Technology Snapshot</h3>
            </div>

            {activeScan ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-textMuted mb-1.5">Primary Languages</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeScan.techStack.languages.map((l) => (
                      <span
                        key={l.name}
                        className="text-xs px-2.5 py-1 rounded-full bg-black border border-borderDark text-textPrimary"
                      >
                        {l.name} ({l.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>

                {activeScan.techStack.frameworks.length > 0 && (
                  <div>
                    <div className="text-xs text-textMuted mb-1.5">Frameworks</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScan.techStack.frameworks.map((f) => (
                        <span
                          key={f.name}
                          className="text-xs px-2.5 py-1 rounded-full bg-black border border-borderDark text-lemonChiffon"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeScan.techStack.tooling.length > 0 && (
                  <div>
                    <div className="text-xs text-textMuted mb-1.5">Tooling &amp; CI/CD</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScan.techStack.tooling.map((t) => (
                        <span
                          key={t.name}
                          className="text-xs px-2.5 py-1 rounded-full bg-black border border-borderDark text-cotton"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-borderDark">
                  <Link
                    href="/contributions"
                    className="text-xs text-lemonChiffon hover:underline flex items-center gap-1"
                  >
                    <span>View Stack Matrix &amp; Routes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-textMuted py-3">
                Select or scan a repository to inspect its technology snapshot.
              </p>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-textMuted" />
              <h3 className="text-sm font-bold text-textPrimary">Recent Activity</h3>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-lemonChiffon/60 pl-3 py-0.5">
                    <p className="text-textPrimary font-medium leading-snug">{act.description}</p>
                    <span className="text-[10px] text-textMuted mt-0.5 block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-textMuted">No recent activity recorded.</p>
                <Link
                  href="/app/scan"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lemonChiffon text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Run First Scan
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
