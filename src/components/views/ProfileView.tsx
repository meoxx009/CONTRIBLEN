'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  User as UserIcon,
  Moon,
  Sun,
  Download,
  Trash2,
  LogOut,
  Shield,
  Sliders,
  ChevronDown,
  Lock,
  AlertTriangle,
  Activity,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ActivityEvent } from '@/types';

export default function ProfileView() {
  const router = useRouter();
  const { user, setUser, updateSettings, showToast } = useApp();

  const [savingName, setSavingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);

  // Accordion open sections
  const [openSection, setOpenSection] = useState<'profile' | 'appearance' | 'safety' | 'activity' | 'data'>('safety');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.activities) {
            setActivities(data.activities);
          }
        }
      } catch {}

      try {
        const statusRes = await fetch('/api/integrations/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setIntegrationStatus(statusData.status);
        }
      } catch {}
    }
    loadData();
  }, []);

  const settings = user?.settings || {
    theme: 'dark',
    fontSize: 'normal',
    fontFamily: 'sans',
    reducedMotion: false,
    strictRedaction: true,
    geminiGroundingPolicy: true,
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        showToast('Profile name updated!', 'success');
      }
    } catch {
      showToast('Failed to update name', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contriblens_workspace_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Workspace data exported successfully', 'success');
      }
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (res.ok) {
        showToast('All scan records and drafts cleared.', 'info');
        setConfirmClear(false);
        router.push('/app/dashboard');
      }
    } catch {
      showToast('Failed to clear data', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/profile?account=true', { method: 'DELETE' });
      if (res.ok) {
        setUser(null);
        showToast('Account and associated data deleted permanently.', 'info');
        router.push('/');
      } else {
        showToast('Failed to delete account', 'error');
      }
    } catch {
      showToast('Network error deleting account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    showToast('Logged out', 'info');
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 text-koraOffWhite">
      {/* Header */}
      <div className="pb-6 border-b border-koraCharcoal-border">
        <h1 className="text-2xl font-heading font-bold text-koraOffWhite flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-koraRed" />
          <span>Profile &amp; Safety Controls</span>
        </h1>
        <p className="text-xs text-koraSecondary mt-1">
          Safety policies, visual accessibility preferences, and local data retention settings.
        </p>
      </div>

      {/* Accordion 1: Safety & AI Guardrails */}
      <div className="bg-koraCharcoal-surface/90 rounded-2xl border border-koraCharcoal-border overflow-hidden shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setOpenSection(openSection === 'safety' ? ('' as any) : 'safety')}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-koraCharcoal-card/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-koraCharcoal-dark flex items-center justify-center text-koraRed border border-koraCharcoal-border">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-koraOffWhite">Safety &amp; Evidence Grounding Controls</h2>
              <span className="text-xs text-koraSecondary">Secret masking, AI grounding policy, and external safety rules</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-koraSecondary transition-transform ${
              openSection === 'safety' ? 'rotate-180 text-koraRed' : ''
            }`}
          />
        </button>

        {openSection === 'safety' && (
          <div className="p-6 pt-2 border-t border-koraCharcoal-border space-y-4 text-xs">
            {/* Always ON: Secret Masking */}
            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-koraOffWhite block">Strict Secret Masking</span>
                <span className="text-koraSecondary">API tokens, AWS keys, and private keys are masked with asterisks before model calls or database writes.</span>
              </div>
              <span className="text-koraOffWhite font-bold px-3 py-1 rounded-full bg-koraBurgundy/40 border border-koraRed/40 text-[10px]">
                ALWAYS ON
              </span>
            </div>

            {/* Toggle: Gemini Grounding Policy */}
            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-koraOffWhite block">Gemini Evidence Grounding Policy</span>
                <span className="text-koraSecondary">Restricts AI explanations strictly to verified finding IDs with deterministic fallback on failure.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.geminiGroundingPolicy}
                  onChange={(e) => updateSettings({ geminiGroundingPolicy: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-koraCharcoal-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-koraBg after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-koraOffWhite after:border-koraCharcoal-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-koraRed" />
              </label>
            </div>

            {/* Sensitive Publishing Control (Enforced) */}
            <div className="p-4 rounded-xl bg-koraBurgundy/20 border border-koraRed/30 flex items-center justify-between">
              <div>
                <span className="font-semibold text-koraOffWhite block">Human Review Enforcement</span>
                <span className="text-koraSecondary">Prohibits automatic PR creation and forces human maintainer review for all issue drafts.</span>
              </div>
              <span className="text-koraRed font-bold px-3 py-1 rounded-full bg-koraCharcoal-dark border border-koraRed/40 text-[10px]">
                ENFORCED
              </span>
            </div>

            {/* Live Integration Status (Safe enum report) */}
            {integrationStatus && (
              <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-koraOffWhite text-xs block">
                    Verified Integration Status
                  </span>
                  <span className="text-[10px] text-koraSecondary font-mono">Zero secrets exposed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border">
                    <span className="text-[10px] text-koraSecondary block">Supabase</span>
                    <span className={`text-[11px] font-mono font-bold capitalize ${
                      integrationStatus.supabase === 'configured' ? 'text-emerald-400' : 'text-koraSecondary'
                    }`}>
                      {integrationStatus.supabase}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border">
                    <span className="text-[10px] text-koraSecondary block">GitHub API</span>
                    <span className={`text-[11px] font-mono font-bold capitalize ${
                      integrationStatus.github === 'token configured' ? 'text-koraRed' : 'text-koraSecondary'
                    }`}>
                      {integrationStatus.github}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border">
                    <span className="text-[10px] text-koraSecondary block">OSV Engine</span>
                    <span className={`text-[11px] font-mono font-bold capitalize ${
                      integrationStatus.osv === 'reachable' ? 'text-emerald-400' : 'text-koraBurgundy'
                    }`}>
                      {integrationStatus.osv}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border">
                    <span className="text-[10px] text-koraSecondary block">Gemini AI</span>
                    <span className={`text-[11px] font-mono font-bold capitalize ${
                      integrationStatus.gemini === 'configured' ? 'text-emerald-400' : 'text-koraRed'
                    }`}>
                      {integrationStatus.gemini}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border">
                    <span className="text-[10px] text-koraSecondary block">Persistence DB</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {integrationStatus.database}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Safety Center Documentation Links */}
            <div className="pt-2 border-t border-koraCharcoal-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-koraSecondary">Official Safety &amp; Governance Center:</span>
              <div className="flex items-center gap-4">
                <Link
                  href="/security"
                  className="text-koraRed hover:text-koraRed-hover hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Security Model &amp; Disclosure Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/privacy"
                  className="text-koraRed hover:text-koraRed-hover hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Privacy Notice &amp; Zero Retention</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Profile Credentials */}
      <div className="bg-koraCharcoal-surface/90 rounded-2xl border border-koraCharcoal-border overflow-hidden shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setOpenSection(openSection === 'profile' ? ('' as any) : 'profile')}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-koraCharcoal-card/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-koraCharcoal-dark flex items-center justify-center text-koraRed border border-koraCharcoal-border">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-koraOffWhite">Profile &amp; Credentials</h2>
              <span className="text-xs text-koraSecondary">Display name, email address, and phone number</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-koraSecondary transition-transform ${
              openSection === 'profile' ? 'rotate-180 text-koraRed' : ''
            }`}
          />
        </button>

        {openSection === 'profile' && (
          <div className="p-6 pt-2 border-t border-koraCharcoal-border space-y-4">
            <form onSubmit={handleUpdateName} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-koraSecondary mb-1.5">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-xl text-sm text-koraOffWhite focus:outline-none focus:border-koraRed"
                  />
                  <button
                    type="submit"
                    disabled={savingName}
                    className="px-5 py-2 bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold rounded-full transition-colors shadow-glow-red disabled:opacity-50"
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border">
                  <span className="text-koraSecondary block mb-0.5">Email</span>
                  <span className="text-koraOffWhite font-medium">{user?.email || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border">
                  <span className="text-koraSecondary block mb-0.5">Phone</span>
                  <span className="text-koraOffWhite font-medium">{user?.phone || 'N/A'}</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Accordion 3: Appearance & Reduced Motion */}
      <div className="bg-koraCharcoal-surface/90 rounded-2xl border border-koraCharcoal-border overflow-hidden shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setOpenSection(openSection === 'appearance' ? ('' as any) : 'appearance')}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-koraCharcoal-card/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-koraCharcoal-dark flex items-center justify-center text-koraRed border border-koraCharcoal-border">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-koraOffWhite">Appearance &amp; Accessibility</h2>
              <span className="text-xs text-koraSecondary">Theme, font scale, font stack, and reduced motion</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-koraSecondary transition-transform ${
              openSection === 'appearance' ? 'rotate-180 text-koraRed' : ''
            }`}
          />
        </button>

        {openSection === 'appearance' && (
          <div className="p-6 pt-2 border-t border-koraCharcoal-border space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-xs font-medium text-koraSecondary mb-2">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'system', label: 'System Match', icon: Sliders },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateSettings({ theme: t.id as any })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-koraBurgundy/40 border-koraRed text-koraOffWhite shadow-sm'
                          : 'bg-koraCharcoal-dark border-koraCharcoal-border text-koraSecondary hover:text-koraOffWhite'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Scale */}
            <div>
              <label className="block text-xs font-medium text-koraSecondary mb-2">Font Scale</label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'small', label: 'Compact' },
                  { id: 'normal', label: 'Standard' },
                  { id: 'large', label: 'Enlarged' },
                ].map((fs) => {
                  const isSelected = settings.fontSize === fs.id;
                  return (
                    <button
                      key={fs.id}
                      type="button"
                      onClick={() => updateSettings({ fontSize: fs.id as any })}
                      className={`py-2 px-3 rounded-full border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-koraRed text-white font-semibold border-koraRed shadow-sm'
                          : 'bg-koraCharcoal-dark border-koraCharcoal-border text-koraSecondary hover:text-koraOffWhite'
                      }`}
                    >
                      {fs.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-koraSecondary mb-2">Typography Stack</label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'sans', label: 'Inter Sans' },
                  { id: 'mono', label: 'JetBrains Mono' },
                  { id: 'system', label: 'System Native' },
                ].map((ff) => {
                  const isSelected = (settings.fontFamily || 'sans') === ff.id;
                  return (
                    <button
                      key={ff.id}
                      type="button"
                      onClick={() => updateSettings({ fontFamily: ff.id as any })}
                      className={`py-2 px-3 rounded-full border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-koraRed text-white font-semibold border-koraRed shadow-sm'
                          : 'bg-koraCharcoal-dark border-koraCharcoal-border text-koraSecondary hover:text-koraOffWhite'
                      }`}
                    >
                      {ff.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  className="rounded bg-koraCharcoal-dark border-koraCharcoal-border text-koraRed focus:ring-koraRed"
                />
                <span className="text-xs text-koraOffWhite">
                  Enable Reduced Motion (disables CSS animations &amp; ambient float effects)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: Activity History & Audit Trail */}
      <div className="bg-koraCharcoal-surface/90 rounded-2xl border border-koraCharcoal-border overflow-hidden shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setOpenSection(openSection === 'activity' ? ('' as any) : 'activity')}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-koraCharcoal-card/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-koraCharcoal-dark flex items-center justify-center text-koraRed border border-koraCharcoal-border">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-koraOffWhite">Activity History &amp; Audit Trail</h2>
              <span className="text-xs text-koraSecondary">Local timeline of scans, generated routes, and issue draft exports</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-koraSecondary transition-transform ${
              openSection === 'activity' ? 'rotate-180 text-koraRed' : ''
            }`}
          />
        </button>

        {openSection === 'activity' && (
          <div className="p-6 pt-2 border-t border-koraCharcoal-border space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-koraSecondary text-xs">
                <Clock className="w-6 h-6 mx-auto mb-2 text-koraSecondary/60" />
                <p>No activity recorded yet.</p>
                <p className="text-[11px] text-koraSecondary/70 mt-1">
                  Run a repository scan or create contribution routes to begin tracking actions.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activities.map((act) => {
                  const getBadge = (type: string) => {
                    switch (type) {
                      case 'scan':
                        return 'bg-koraSlate/40 text-koraOffWhite border-koraSlate';
                      case 'route_created':
                        return 'bg-koraBurgundy/40 text-koraOffWhite border-koraRed/40';
                      case 'draft_generated':
                        return 'bg-koraRed/20 text-koraOffWhite border-koraRed/50';
                      case 'route_updated':
                      case 'route_completed':
                        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800';
                      default:
                        return 'bg-koraCharcoal-card text-koraOffWhite border-koraCharcoal-border';
                    }
                  };

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start sm:items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getBadge(
                            act.type
                          )}`}
                        >
                          {act.type.replace('_', ' ')}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-koraOffWhite">{act.repoName}</span>
                          </div>
                          <p className="text-[11px] text-koraSecondary mt-0.5">{act.description}</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-koraSecondary flex items-center gap-1 sm:self-center shrink-0">
                        <Clock className="w-3 h-3 text-koraSecondary/80" />
                        <span>{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion 5: Data Retention & Export */}
      <div className="bg-koraCharcoal-surface/90 rounded-2xl border border-koraCharcoal-border overflow-hidden shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setOpenSection(openSection === 'data' ? ('' as any) : 'data')}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-koraCharcoal-card/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-koraCharcoal-dark flex items-center justify-center text-koraRed border border-koraCharcoal-border">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-koraOffWhite">Workspace Data &amp; Export</h2>
              <span className="text-xs text-koraSecondary">Export scans as JSON, clear database history, or sign out</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-koraSecondary transition-transform ${
              openSection === 'data' ? 'rotate-180 text-koraRed' : ''
            }`}
          />
        </button>

        {openSection === 'data' && (
          <div className="p-6 pt-2 border-t border-koraCharcoal-border space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportData}
                className="px-5 py-2.5 rounded-full bg-koraCharcoal-card hover:bg-koraCharcoal-dark text-koraOffWhite text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-koraCharcoal-border hover:border-koraRed/40"
              >
                <Download className="w-4 h-4 text-koraRed" />
                <span>Export Scans &amp; Drafts (.JSON)</span>
              </button>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-5 py-2.5 rounded-full bg-koraBurgundy/30 hover:bg-koraBurgundy/50 text-koraOffWhite text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-koraRed/50"
                >
                  <Trash2 className="w-4 h-4 text-koraRed" />
                  <span>Clear History</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearData}
                    disabled={clearing}
                    className="px-5 py-2.5 rounded-full bg-koraRed text-white text-xs font-semibold transition-colors shadow-glow-red"
                  >
                    {clearing ? 'Clearing...' : 'Confirm Clear Data'}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2.5 rounded-full bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary text-xs hover:text-koraOffWhite"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!confirmDeleteAccount ? (
                <button
                  onClick={() => setConfirmDeleteAccount(true)}
                  className="px-5 py-2.5 rounded-full bg-koraCharcoal-card hover:bg-koraBurgundy/40 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-koraCharcoal-border hover:border-koraRed/50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="px-5 py-2.5 rounded-full bg-koraRed text-white text-xs font-bold transition-colors shadow-glow-red"
                  >
                    {deletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAccount(false)}
                    className="px-4 py-2.5 rounded-full bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary text-xs hover:text-koraOffWhite"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-koraCharcoal-border">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full bg-koraCharcoal-card hover:bg-koraBurgundy/30 text-koraOffWhite border border-koraCharcoal-border hover:border-koraRed/40 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-koraRed" />
                <span>Sign Out of ContribLens</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
