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
  Check,
  FileText,
  Lock,
  Cpu,
  Zap,
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

  const recommendedRoute =
    displayedRoutes.find((r) => r.difficulty === 'beginner' && r.status !== 'completed') ||
    displayedRoutes.find((r) => r.status !== 'completed') ||
    displayedRoutes[0];

  const goodFirstCount = displayedRoutes.filter((r) => r.difficulty === 'beginner').length;
  const maintainerLevelCount = displayedRoutes.filter((r) => r.difficulty === 'advanced').length;
  const resolvedCount = completedRoutes.length;

  const displayedFindingsCount = activeScan
    ? activeScan.findingsCount.total
    : openFindingsCount;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-textMuted space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-electricTangerine" />
        <p className="text-xs font-mono text-lemonChiffon/90">
          Loading workspace &amp; verified scan metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-platinumSilver/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-chrome-pill text-[11px] font-mono text-platinumSilver mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Active</span>
            <span className="text-platinumSilver/40">•</span>
            <span className="text-lemonChiffon">ContribLens OSS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-platinumSilver via-lemonChiffon to-electricTangerine">{user?.name || 'Contributor'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-platinumSilver/80 mt-1">
            Navigate verified findings, plan bounded contributor fixes, and generate maintainer-ready drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/scan"
            className="px-6 py-3 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white font-bold text-xs transition-all shadow-glow-tangerine flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Scan Repository</span>
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-rosewood/25 border border-rosewood/50 text-cotton text-xs flex items-center justify-between gap-3 shadow-md">
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

      {/* Visually Connected Readiness & Pipeline Stepper */}
      <div className="liquid-glass-hero p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-platinumSilver/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-electricTangerine/20 border border-electricTangerine/40 flex items-center justify-center text-electricTangerine">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-textPrimary">Contribution Pipeline Status</h2>
              <span className="text-[11px] text-platinumSilver/70">
                {activeScan ? `Active Context: ${activeScan.repoName}` : 'Select a repository to inspect pipeline'}
              </span>
            </div>
          </div>

          {activeScan && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-textMuted uppercase font-mono block">Readiness Score</span>
                <span className="text-sm font-bold text-lemonChiffon font-mono">{activeScan.readinessScore}/100</span>
              </div>
              <div className="w-10 h-10 rounded-full liquid-chrome-orb flex items-center justify-center font-bold text-xs text-black shadow-sm">
                {activeScan.readinessScore}
              </div>
            </div>
          )}
        </div>

        {/* 4 Connected Pipeline Stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/60 border border-platinumSilver/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-electricTangerine font-semibold">1. Scan</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-platinumSilver/80">Static analysis complete</p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-platinumSilver/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-botticelli font-semibold">2. Verify</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-platinumSilver/80">OSV &amp; SHA-256 verified</p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-platinumSilver/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-paleLavender font-semibold">3. Understand</span>
              <Cpu className="w-3.5 h-3.5 text-paleLavender" />
            </div>
            <p className="text-[10px] text-platinumSilver/80">Grounded Gemini active</p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-platinumSilver/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-lemonChiffon font-semibold">4. Drafts</span>
              <FileText className="w-3.5 h-3.5 text-lemonChiffon" />
            </div>
            <p className="text-[10px] text-platinumSilver/80">Ready for review</p>
          </div>
        </div>
      </div>

      {/* Metrics Row with Clear Visual Hierarchy */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Repositories Scanned */}
        <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffeeBean to-black border border-platinumSilver/25 flex items-center justify-center text-electricTangerine shrink-0 shadow-sm">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-platinumSilver">{totalScans}</div>
            <div className="text-[11px] text-platinumSilver/70 leading-tight">Repositories Scanned</div>
          </div>
        </div>

        {/* Metric 2: Verified Findings */}
        <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rosewood/40 to-black border border-rosewood/50 flex items-center justify-center text-red-300 shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">{displayedFindingsCount}</div>
            <div className="text-[11px] text-platinumSilver/70 leading-tight">Verified Findings</div>
          </div>
        </div>

        {/* Metric 3: Elevated Primary Metric (Good First Opportunities) */}
        <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3 border-lemonChiffon/40 bg-gradient-to-br from-blackHole to-coffeeBean/70 shadow-liquid-glow">
          <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-lemonChiffon/40 flex items-center justify-center text-lemonChiffon shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,248,202,0.6)]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-lemonChiffon">{goodFirstCount}</div>
            <div className="text-[11px] text-lemonChiffon/90 leading-tight font-semibold">Good First Tasks</div>
          </div>
        </div>

        {/* Metric 4: Maintainer Level Assistance */}
        <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffeeBean to-black border border-paleLavender/30 flex items-center justify-center text-paleLavender shrink-0 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">{maintainerLevelCount}</div>
            <div className="text-[11px] text-platinumSilver/70 leading-tight">Maintainer Tasks</div>
          </div>
        </div>

        {/* Metric 5: Resolved Findings */}
        <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1 border-emerald-500/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400">{resolvedCount}</div>
            <div className="text-[11px] text-platinumSilver/70 leading-tight">Resolved Findings</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recommended Task & Tech Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Next Task (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="liquid-glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-platinumSilver/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electricTangerine" />
                <h3 className="text-sm font-bold text-textPrimary">Next Best Action</h3>
              </div>
              <span className="text-[11px] font-mono text-lemonChiffon bg-black/60 px-3 py-1 rounded-full border border-lemonChiffon/30 shadow-inner">
                Grounded Route
              </span>
            </div>

            {recommendedRoute ? (
              <div className="p-5 rounded-2xl bg-black/80 border border-platinumSilver/20 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-textPrimary leading-snug">{recommendedRoute.title}</h4>
                    <p className="text-xs text-platinumSilver/70 mt-1">
                      Target File: <code className="text-lemonChiffon font-mono bg-white/5 px-2 py-0.5 rounded">{recommendedRoute.files[0]}</code>
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 capitalize shrink-0">
                    {recommendedRoute.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-platinumSilver/70 border-t border-platinumSilver/10">
                  <span>⏱ Effort: <strong className="text-platinumSilver">{recommendedRoute.estimatedEffort}</strong></span>
                  <span>•</span>
                  <span>Skills: <strong className="text-lemonChiffon">{recommendedRoute.skills.join(', ')}</strong></span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-platinumSilver/70">
                    Readiness Score: <strong className="text-lemonChiffon font-mono">{recommendedRoute.readinessScore}/100</strong>
                  </span>
                  <Link
                    href={`/app/contributions?routeId=${recommendedRoute.id}`}
                    className="px-5 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <span>View Plan &amp; Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* High-Engagement Empty State for Tasks */
              <div className="text-center py-12 px-6 rounded-2xl bg-black/60 border border-dashed border-platinumSilver/20 space-y-4">
                <div className="w-12 h-12 rounded-full liquid-chrome-orb flex items-center justify-center mx-auto text-black shadow-md">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-bold text-textPrimary">No Contribution Routes Yet</h4>
                  <p className="text-xs text-platinumSilver/70 leading-relaxed">
                    {scans.length === 0
                      ? 'Scan your first public GitHub repository to discover verified security findings and beginner-friendly routes.'
                      : 'No open routes generated for this repository. Browse findings to generate a targeted route.'}
                  </p>
                </div>
                <Link
                  href={scans.length === 0 ? '/app/scan' : '/app/findings'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white text-xs font-bold transition-all shadow-glow-tangerine"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{scans.length === 0 ? 'Scan a Repository Now' : 'Browse Open Findings'}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Open Contribution Progress */}
          <div className="liquid-glass-card p-6 rounded-3xl space-y-3">
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
            <div className="flex items-center justify-between text-[11px] text-platinumSilver/70 pt-1">
              <span>Status: {openRoutes.length} active routes awaiting review</span>
              <Link href="/app/contributions" className="text-lemonChiffon hover:underline font-medium">
                View All Routes →
              </Link>
            </div>
          </div>

          {/* Recent Repositories */}
          <div className="liquid-glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-platinumSilver/15">
              <h3 className="text-sm font-bold text-textPrimary">Recent Repositories</h3>
              <Link href="/app/scan" className="text-xs text-lemonChiffon hover:underline font-semibold">
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
                      : { label: 'LOW', style: 'bg-white/10 text-platinumSilver/70 border-platinumSilver/20' };

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
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-black/90 border-lemonChiffon shadow-md'
                          : 'bg-black/50 border-platinumSilver/15 hover:border-platinumSilver/30 hover:bg-black/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <GitBranch className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-lemonChiffon' : 'text-platinumSilver/60'}`} />
                        <div>
                          <div className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                            <span>{s.repoName}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 px-2 py-0.5 rounded-full font-mono">
                                Active Context
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-platinumSilver/70 flex flex-wrap items-center gap-2 mt-1">
                            <span>Last scan: <strong className="text-platinumSilver">{scanDate}</strong></span>
                            <span>•</span>
                            <span>Stack: <strong className="text-lemonChiffon font-mono">{techList}</strong></span>
                            <span>•</span>
                            <span>{s.findingsCount.total} findings</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-platinumSilver/15">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${highestRisk.style}`}>
                          {highestRisk.label}
                        </span>
                        <div className="text-right">
                          <div className="text-xs font-bold text-lemonChiffon font-mono">{s.readinessScore}/100</div>
                          <div className="text-[10px] text-platinumSilver/60">Readiness</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-platinumSilver/50 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* High-Engagement Empty State for Repositories */
              <div className="py-8 px-4 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-platinumSilver/20 flex items-center justify-center mx-auto text-platinumSilver/60">
                  <GitBranch className="w-5 h-5" />
                </div>
                <p className="text-xs text-platinumSilver/70 max-w-sm mx-auto leading-relaxed">
                  No repositories scanned yet. To start, provide any public GitHub repository URL to evaluate its health, dependencies, and contribution readiness.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <span className="text-textMuted font-mono">Sample:</span>
                  <Link
                    href="/app/scan?url=https://github.com/expressjs/express"
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-lemonChiffon border border-lemonChiffon/20 font-mono text-[11px]"
                  >
                    expressjs/express
                  </Link>
                  <Link
                    href="/app/scan?url=https://github.com/pallets/flask"
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-lemonChiffon border border-lemonChiffon/20 font-mono text-[11px]"
                  >
                    pallets/flask
                  </Link>
                </div>
                <Link
                  href="/app/scan"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black text-xs font-bold transition-all shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Start First Repository Scan</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar: Latest Tech Snapshot & Activity Timeline */}
        <div className="space-y-6">
          
          {/* Latest Tech Snapshot */}
          <div className="liquid-glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-platinumSilver/15">
              <Layers className="w-4 h-4 text-electricTangerine" />
              <h3 className="text-sm font-bold text-textPrimary">Technology Snapshot</h3>
            </div>

            {activeScan ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-platinumSilver/70 mb-1.5">Primary Languages</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeScan.techStack.languages.map((l) => (
                      <span
                        key={l.name}
                        className="text-xs px-2.5 py-1 rounded-full bg-black/80 border border-platinumSilver/20 text-platinumSilver"
                      >
                        {l.name} ({l.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>

                {activeScan.techStack.frameworks.length > 0 && (
                  <div>
                    <div className="text-xs text-platinumSilver/70 mb-1.5">Frameworks</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScan.techStack.frameworks.map((f) => (
                        <span
                          key={f.name}
                          className="text-xs px-2.5 py-1 rounded-full bg-black/80 border border-lemonChiffon/30 text-lemonChiffon"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeScan.techStack.tooling.length > 0 && (
                  <div>
                    <div className="text-xs text-platinumSilver/70 mb-1.5">Tooling &amp; CI/CD</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScan.techStack.tooling.map((t) => (
                        <span
                          key={t.name}
                          className="text-xs px-2.5 py-1 rounded-full bg-black/80 border border-platinumSilver/20 text-cotton"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-platinumSilver/15">
                  <Link
                    href="/app/contributions"
                    className="text-xs text-lemonChiffon hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Stack Matrix &amp; Routes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-platinumSilver/70 py-4 leading-relaxed">
                Select or scan a repository to inspect its technology snapshot and dependency signals.
              </p>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="liquid-glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-platinumSilver/15">
              <Clock className="w-4 h-4 text-platinumSilver/70" />
              <h3 className="text-sm font-bold text-textPrimary">Recent Activity</h3>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-lemonChiffon/60 pl-3 py-1 space-y-0.5">
                    <p className="text-textPrimary font-medium leading-snug">{act.description}</p>
                    <span className="text-[10px] text-platinumSilver/60 block font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-platinumSilver/70">No recent activity recorded.</p>
                <Link
                  href="/app/scan"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-lemonChiffon text-black text-xs font-bold hover:bg-sustainableLinen transition-colors shadow-sm"
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
