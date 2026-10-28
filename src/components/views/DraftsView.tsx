'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import {
  FileText,
  Copy,
  Download,
  Check,
  Loader2,
  Code2,
  Eye,
  Edit3,
  Trash2,
  Save,
  Tag,
  ShieldAlert,
  Sparkles,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { IssueDraft } from '@/types';
import { redactSecrets } from '@/lib/redaction';

function DraftsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedDraftId = searchParams.get('draftId');

  const { activeScan, showToast } = useApp();

  const [drafts, setDrafts] = useState<IssueDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<IssueDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'edit' | 'raw'>('preview');

  // Edit draft form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editLabels, setEditLabels] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'reviewed' | 'exported'>('draft');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScan]);

  useEffect(() => {
    if (selectedDraft) {
      setEditTitle(selectedDraft.title);
      setEditBody(selectedDraft.markdownContent || selectedDraft.body || '');
      setEditLabels((selectedDraft.labels || []).join(', '));
      setEditStatus(selectedDraft.status || 'draft');
      setConfirmDelete(false);
    }
  }, [selectedDraft]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const url = activeScan ? `/api/drafts?scanId=${activeScan.id}` : '/api/drafts';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const loadedDrafts: IssueDraft[] = data.drafts || [];
        setDrafts(loadedDrafts);

        if (requestedDraftId) {
          const match = loadedDrafts.find((d) => d.id === requestedDraftId);
          if (match) setSelectedDraft(match);
          else if (loadedDrafts.length > 0) setSelectedDraft(loadedDrafts[0]);
        } else if (loadedDrafts.length > 0) {
          setSelectedDraft(loadedDrafts[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load drafts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!selectedDraft) return;
    setRegenerating(true);
    try {
      const res = await fetch('/api/issue-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          regenerate: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.draft) {
        setSelectedDraft(data.draft);
        setDrafts((prev) => prev.map((d) => (d.id === data.draft.id ? data.draft : d)));
        showToast(
          data.draft.generatedBy === 'gemini'
            ? 'Draft regenerated via Gamma 4 using server-side evidence!'
            : 'Draft regenerated via Deterministic Planner (Fallback)',
          'success'
        );
      } else {
        showToast(data.error || 'Failed to regenerate draft', 'error');
      }
    } catch {
      showToast('Error regenerating draft', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedDraft) return;
    setSaving(true);
    try {
      const parsedLabels = editLabels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      // Defensively re-redact before sending
      const cleanMarkdown = redactSecrets(editBody);
      const cleanTitle = redactSecrets(editTitle.trim());

      const res = await fetch('/api/drafts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          title: cleanTitle,
          markdownContent: cleanMarkdown,
          labels: parsedLabels,
          status: editStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.draft;
        setSelectedDraft(updated);
        setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        showToast('Draft updated and saved successfully!', 'success');
        setViewMode('preview');
      } else {
        showToast('Failed to save draft changes', 'error');
      }
    } catch {
      showToast('Error saving draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!selectedDraft) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/drafts?draftId=${selectedDraft.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Draft deleted successfully', 'info');
        const remaining = drafts.filter((d) => d.id !== selectedDraft.id);
        setDrafts(remaining);
        setSelectedDraft(remaining.length > 0 ? remaining[0] : null);
        setConfirmDelete(false);
      } else {
        showToast('Failed to delete draft', 'error');
      }
    } catch {
      showToast('Error deleting draft', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = () => {
    if (!selectedDraft) return;
    // Defensive re-redaction before clipboard copy
    const safeContent = redactSecrets(selectedDraft.markdownContent);
    navigator.clipboard.writeText(safeContent);
    setCopied(true);
    showToast('Markdown draft copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!selectedDraft) return;
    // Defensive re-redaction before export
    const safeContent = redactSecrets(selectedDraft.markdownContent);
    const blob = new Blob([safeContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDraft.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Draft downloaded as .md file', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 text-koraOffWhite">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-koraCharcoal-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-koraOffWhite flex items-center gap-2">
            <span>Maintainer Issue Drafts</span>
            {activeScan && (
              <span className="text-xs font-mono font-medium text-koraOffWhite bg-koraCharcoal-card px-3 py-1 rounded-full border border-koraCharcoal-border">
                {activeScan.repoName}
              </span>
            )}
          </h1>
          <p className="text-xs text-koraSecondary mt-1">
            Polite, reviewable issue drafts engineered for open-source maintainers. Includes problem description, evidence, impact, test plans, and acceptance criteria.
          </p>
        </div>

        {/* Global Safety Notice: Clearly labeled Maintainer review required & Never auto-published */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-koraBurgundy/40 border border-koraRed/40 text-xs text-koraOffWhite">
          <ShieldAlert className="w-4 h-4 text-koraRed" />
          <span className="font-semibold">Maintainer review required • Never auto-published</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-koraRed animate-spin mx-auto mb-2" />
          <p className="text-xs text-koraSecondary">Loading issue drafts...</p>
        </div>
      ) : drafts.length > 0 && selectedDraft ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Drafts Sidebar List (Col 1) */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-heading font-semibold text-koraSecondary uppercase tracking-wider">
              Saved Drafts ({drafts.length})
            </h3>
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
              {drafts.map((d) => {
                const isSelected = selectedDraft.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDraft(d)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-koraBurgundy/30 border-koraRed/60 shadow-lg text-koraOffWhite'
                        : 'bg-koraCharcoal-surface/70 border-koraCharcoal-border hover:border-koraSlate/50 hover:bg-koraCharcoal-card/80 text-koraSecondary hover:text-koraOffWhite'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-koraSecondary mb-1.5">
                      <span
                        className={`font-mono px-2 py-0.5 rounded-full text-[10px] border ${
                          d.generatedBy === 'gemini'
                            ? 'bg-koraCharcoal-dark text-koraOffWhite border-koraCharcoal-border'
                            : 'bg-koraBurgundy/20 text-koraOffWhite border-koraRed/30'
                        }`}
                      >
                        {d.generatedBy === 'gemini' ? 'GAMMA 4' : 'FALLBACK'}
                      </span>
                      <span className="capitalize px-1.5 py-0.5 rounded text-[9px] bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary">
                        {d.status || 'draft'}
                      </span>
                    </div>
                    <h4 className="text-xs font-heading font-semibold text-koraOffWhite line-clamp-2">{d.title}</h4>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-koraSecondary/70">
                      <span>{d.repoName}</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Draft Workspace & Surface (Col 2, 3, 4) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Action Bar */}
            <div className="bg-koraCharcoal-surface/90 border border-koraCharcoal-border p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
              <div>
                {/* Badges: Evidence-linked, AI-validated / Fallback, and Maintainer Review Required */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {selectedDraft.findingId && (
                    <Link
                      href={`/app/findings/${selectedDraft.findingId}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-koraCharcoal-card hover:bg-koraCharcoal-dark text-koraOffWhite border border-koraCharcoal-border hover:border-koraRed/50 transition-colors"
                      title="Navigate to verified evidence in Findings view"
                    >
                      <ExternalLink className="w-3 h-3 text-koraRed" />
                      <span>Evidence-linked: #{selectedDraft.findingId}</span>
                    </Link>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                      selectedDraft.generatedBy === 'gemini'
                        ? 'bg-koraCharcoal-dark text-koraOffWhite border-koraCharcoal-border'
                        : 'bg-koraBurgundy/20 text-koraOffWhite border-koraRed/30'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-koraRed" />
                    <span>
                      {selectedDraft.generatedBy === 'gemini'
                        ? 'AI-validated (Gamma 4 Grounded)'
                        : 'Deterministic Template (Fallback)'}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-koraBurgundy/30 border border-koraRed/40 text-[10px] font-semibold text-koraOffWhite">
                    <ShieldAlert className="w-3 h-3 text-koraRed" />
                    <span>Maintainer review required • Not maintainer-approved</span>
                  </span>
                </div>

                <h2 className="text-base font-heading font-bold text-koraOffWhite mt-0.5">{selectedDraft.title}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle: Preview / Edit / Markdown */}
                <div className="bg-koraCharcoal-dark p-1 rounded-full border border-koraCharcoal-border flex items-center text-xs">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-full flex items-center gap-1 font-medium transition-colors ${
                      viewMode === 'preview' ? 'bg-koraRed text-white shadow-sm' : 'text-koraSecondary hover:text-koraOffWhite'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded-full flex items-center gap-1 font-medium transition-colors ${
                      viewMode === 'edit' ? 'bg-koraRed text-white shadow-sm' : 'text-koraSecondary hover:text-koraOffWhite'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded-full flex items-center gap-1 font-medium transition-colors ${
                      viewMode === 'raw' ? 'bg-koraRed text-white shadow-sm' : 'text-koraSecondary hover:text-koraOffWhite'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" /> Markdown
                  </button>
                </div>

                {/* Regenerate Button (Gamma 4 server-side evidence load) */}
                <button
                  onClick={handleRegenerateDraft}
                  disabled={regenerating}
                  className="px-3.5 py-1.5 rounded-full bg-koraCharcoal-card hover:bg-koraCharcoal-dark text-koraOffWhite text-xs font-semibold flex items-center gap-1.5 transition-colors border border-koraCharcoal-border hover:border-koraRed/50 disabled:opacity-50"
                  title="Regenerate issue draft via Gamma 4 with fresh server-side evidence"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>

                {/* Copy Action */}
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-full bg-koraCharcoal-card hover:bg-koraCharcoal-dark text-koraOffWhite text-xs font-semibold flex items-center gap-1.5 transition-colors border border-koraCharcoal-border hover:border-koraRed/50"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Download Action */}
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-glow-red"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                {/* Delete Draft Action */}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-2 rounded-full bg-koraCharcoal-card hover:bg-koraBurgundy/40 text-red-400 border border-koraCharcoal-border hover:border-koraRed/40 transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-koraCharcoal-dark p-1 rounded-full border border-koraRed">
                    <button
                      onClick={handleDeleteDraft}
                      disabled={deleting}
                      className="px-2.5 py-0.5 rounded-full bg-koraRed text-white text-[11px] font-semibold"
                    >
                      {deleting ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-0.5 text-[11px] text-koraSecondary hover:text-koraOffWhite"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode 1: Edit Form */}
            {viewMode === 'edit' && (
              <div className="bg-koraCharcoal-surface/90 border border-koraCharcoal-border p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-koraCharcoal-border">
                  <span className="text-xs font-bold text-koraOffWhite flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-koraRed" /> Edit Maintainer Issue Draft
                  </span>
                  <div className="flex items-center gap-3">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-lg text-xs text-koraOffWhite focus:outline-none focus:border-koraRed"
                    >
                      <option value="draft">Status: Draft</option>
                      <option value="reviewed">Status: Reviewed</option>
                      <option value="exported">Status: Exported</option>
                    </select>
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="px-4 py-1.5 bg-koraRed hover:bg-koraRed-hover text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors shadow-glow-red disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-koraSecondary mb-1.5">Issue Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-xl text-xs sm:text-sm text-koraOffWhite focus:outline-none focus:border-koraRed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-koraSecondary mb-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-koraRed" />
                      <span>Suggested Labels (comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={editLabels}
                      onChange={(e) => setEditLabels(e.target.value)}
                      placeholder="e.g. security, good-first-issue, beginner"
                      className="w-full px-4 py-2 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-xl text-xs text-koraOffWhite focus:outline-none focus:border-koraRed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-koraSecondary mb-1.5">Markdown Body</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={18}
                      className="w-full p-4 bg-koraCharcoal-dark border border-koraCharcoal-border rounded-xl font-mono text-xs text-koraOffWhite focus:outline-none focus:border-koraRed leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 2: Dark Editorial GitHub Issue Preview */}
            {viewMode === 'preview' && (
              <div className="p-8 sm:p-10 rounded-2xl bg-koraCharcoal-surface border border-koraCharcoal-border text-koraOffWhite shadow-2xl space-y-6">
                {/* Surface Header with Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-koraCharcoal-border text-xs text-koraSecondary">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-koraOffWhite bg-koraCharcoal-dark border border-koraCharcoal-border px-2.5 py-1 rounded-md">
                      GitHub Issue Preview
                    </span>
                    {selectedDraft.findingId && (
                      <Link
                        href={`/app/findings/${selectedDraft.findingId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-koraOffWhite bg-koraBurgundy/30 hover:bg-koraBurgundy/50 border border-koraRed/40 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-koraRed" />
                        <span>Evidence #{selectedDraft.findingId}</span>
                      </Link>
                    )}
                    <span className="text-[11px] font-mono text-koraSecondary bg-koraCharcoal-dark border border-koraCharcoal-border px-2.5 py-1 rounded-md">
                      {selectedDraft.generatedBy === 'gemini' ? 'AI-validated (Gamma 4)' : 'Deterministic Template'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDraft.labels && selectedDraft.labels.length > 0 && (
                      <div className="flex items-center gap-1 mr-2">
                        {selectedDraft.labels.map((lbl) => (
                          <span
                            key={lbl}
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-koraCharcoal-dark text-koraSecondary border border-koraCharcoal-border"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="font-semibold text-koraOffWhite bg-koraBurgundy/40 border border-koraRed/40 px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-koraRed" />
                      Maintainer review required • Never auto-published
                    </span>
                  </div>
                </div>

                {/* Markdown Rendered Content */}
                <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
                  {selectedDraft.markdownContent.split('\n\n').map((block, idx) => {
                    const trimmed = block.trim();

                    // Main Title
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h1
                          key={idx}
                          className="text-2xl font-heading font-bold text-koraOffWhite border-b border-koraCharcoal-border pb-3 tracking-tight"
                        >
                          {trimmed.replace('# ', '')}
                        </h1>
                      );
                    }

                    // Section Headings (1-7)
                    if (trimmed.startsWith('### ')) {
                      const isReviewNote = trimmed.includes('Maintainer Review Note');
                      return (
                        <h3
                          key={idx}
                          className={`text-base font-heading font-bold mt-6 mb-2 flex items-center gap-2 ${
                            isReviewNote ? 'text-koraRed border-t border-koraCharcoal-border pt-4' : 'text-koraOffWhite'
                          }`}
                        >
                          {trimmed.replace('### ', '')}
                        </h3>
                      );
                    }

                    // Maintainer Notice Blockquote
                    if (trimmed.startsWith('> ')) {
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-koraBurgundy/20 border-l-4 border-koraRed text-koraOffWhite/90 text-xs space-y-1 my-3 shadow-inner"
                        >
                          {trimmed.split('\n').map((line, lIdx) => (
                            <p key={lIdx} className="leading-relaxed">
                              {line.replace(/^>\s?/, '')}
                            </p>
                          ))}
                        </div>
                      );
                    }

                    // Code Blocks (Evidence)
                    if (trimmed.startsWith('```')) {
                      return (
                        <pre
                          key={idx}
                          className="p-4 bg-koraCharcoal-dark text-koraOffWhite rounded-xl font-mono text-xs overflow-x-auto border border-koraCharcoal-border shadow-inner"
                        >
                          {trimmed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '')}
                        </pre>
                      );
                    }

                    // Bullet / Checklist items
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <ul key={idx} className="space-y-2 pl-2 text-koraSecondary">
                          {trimmed.split('\n').map((li, liIdx) => {
                            const isChecklist = li.includes('- [ ]') || li.includes('- [x]');
                            const isChecked = li.includes('- [x]');
                            const text = li.replace(/^[*-] (\[[ x]\] )?/, '');

                            return (
                              <li key={liIdx} className="flex items-start gap-2">
                                {isChecklist ? (
                                  <span
                                    className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded border ${
                                      isChecked
                                        ? 'bg-koraRed text-white border-koraRed'
                                        : 'border-koraCharcoal-border bg-koraCharcoal-dark'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                  </span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-koraRed mt-2 shrink-0" />
                                )}
                                <span className={isChecked ? 'text-koraOffWhite font-medium' : 'text-koraSecondary'}>{text}</span>
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }

                    // Footer divider
                    if (trimmed === '---') {
                      return <hr key={idx} className="border-koraCharcoal-border my-4" />;
                    }

                    // Standard Paragraph
                    return (
                      <p key={idx} className="text-koraSecondary leading-relaxed">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Mode 3: Raw Markdown */}
            {viewMode === 'raw' && (
              <div className="bg-koraCharcoal-dark p-6 rounded-2xl border border-koraCharcoal-border font-mono text-xs overflow-x-auto text-koraOffWhite leading-relaxed">
                <pre>{selectedDraft.markdownContent}</pre>
              </div>
            )}

            {/* Strict Safe Disclosure Policy Card */}
            <div className="p-4 rounded-xl bg-koraCharcoal-surface/90 border border-koraRed/30 flex items-start gap-3 text-xs text-koraOffWhite">
              <ShieldAlert className="w-5 h-5 text-koraRed shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-koraOffWhite block">ContribLens Safe Disclosure Policy</span>
                <p className="text-koraSecondary mt-0.5 leading-relaxed">
                  ContribLens never connects directly to GitHub issue or pull request APIs. Maintainers must review and publish issue drafts manually. Secrets, credentials, and sensitive private security disclosures are strictly blocked from public issue generation.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-koraCharcoal-surface/80 rounded-2xl border border-koraCharcoal-border max-w-lg mx-auto p-8 space-y-4">
          <FileText className="w-12 h-12 text-koraRed/60 mx-auto" />
          <h2 className="text-lg font-heading font-bold text-koraOffWhite">No Issue Drafts Available</h2>
          <p className="text-xs text-koraSecondary leading-relaxed">
            Generate your first maintainer-reviewable issue draft from verified findings in the Contributions + Stack view.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => router.push('/app/contributions')}
              className="px-5 py-2.5 rounded-full bg-koraRed hover:bg-koraRed-hover text-white text-xs font-semibold transition-colors shadow-glow-red"
            >
              Browse Contributions
            </button>
            <button
              onClick={() => router.push('/app/scan')}
              className="px-5 py-2.5 rounded-full bg-koraCharcoal-card hover:bg-koraCharcoal-dark text-koraOffWhite text-xs font-semibold border border-koraCharcoal-border transition-colors"
            >
              Scan Repository
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueDraftsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-8 text-center text-koraSecondary">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-koraRed mb-2" />
          <p className="text-xs">Loading Issue Drafts Workspace...</p>
        </div>
      }
    >
      <DraftsContent />
    </Suspense>
  );
}
