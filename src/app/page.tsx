'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Lock,
  Cpu,
  Terminal,
  AlertTriangle,
  FileText,
  Compass,
  ChevronDown,
  Sparkles,
  GitBranch,
  Layers,
  Code2,
  Eye,
  GitPullRequest,
  Check,
  Zap,
  Play,
  RotateCcw,
  ExternalLink,
  BookOpen,
  GitCommit,
  Clock,
  KeyRound,
  FileSearch,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'finding' | 'explanation' | 'route' | 'draft'>('finding');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoRepoInput, setDemoRepoInput] = useState<string>('https://github.com/expressjs/express');
  const [isAutoCycle, setIsAutoCycle] = useState(true);

  // Auto-cycle through the 4 steps unless user interacts
  useEffect(() => {
    if (!isAutoCycle) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % 4;
        const tabMap: ('finding' | 'explanation' | 'route' | 'draft')[] = ['finding', 'finding', 'explanation', 'route'];
        setActivePreviewTab(tabMap[next]);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoCycle]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    const tabMap: ('finding' | 'explanation' | 'route' | 'draft')[] = ['finding', 'finding', 'explanation', 'route'];
    setActivePreviewTab(tabMap[index]);
    setIsAutoCycle(false);
  };

  const handleTabClick = (tab: 'finding' | 'explanation' | 'route' | 'draft') => {
    setActivePreviewTab(tab);
    setIsAutoCycle(false);
  };

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoRepoInput.trim()) {
      router.push(`/scan?url=${encodeURIComponent(demoRepoInput.trim())}`);
    }
  };

  const trustPrinciples = [
    {
      title: 'Read-Only Public Scan',
      desc: 'Bounded to 60 files and static parsing with zero repository code execution.',
      icon: Lock,
      color: 'text-lemonChiffon',
    },
    {
      title: 'Deterministic Verification',
      desc: 'Rule matches and published OSV.dev CVEs backed by SHA-256 evidence hashes.',
      icon: Shield,
      color: 'text-electricTangerine',
    },
    {
      title: 'Sanitized AI Context',
      desc: 'Server-side Gemini adapter strictly anchored to verified file lines with redacted tokens.',
      icon: Cpu,
      color: 'text-paleLavender',
    },
    {
      title: 'Human-Approved Issue Drafts',
      desc: 'Strict manual publishing model: zero automatic GitHub issues or uninvited PRs.',
      icon: GitPullRequest,
      color: 'text-botticelli',
    },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Scan',
      tagline: 'Deterministic Static Analysis',
      badge: 'Zero Code Execution',
      desc: 'Inspects public GitHub repositories using sandboxed static analysis across package manifests, GitHub Actions workflows, and project health files.',
      icon: Search,
      evidenceSnippet: 'npm audit • package.json • .github/workflows/*.yml',
    },
    {
      num: '02',
      title: 'Verify',
      tagline: 'Evidence & OSV Verification',
      badge: 'Zero AI Hallucination',
      desc: 'Hashes normalized code evidence cryptographically and cross-references published advisories with OSV.dev. The deterministic engine is the sole source of truth.',
      icon: CheckCircle2,
      evidenceSnippet: 'OSV Batch Query • SHA-256 Evidence Hash: e3b0c442...',
    },
    {
      num: '03',
      title: 'Understand',
      tagline: 'Grounded Gemini Explanations',
      badge: 'Strict Server Adapter',
      desc: 'Server-side Gemini explains technical context in plain English. Explanations are anchored to verified file paths and line numbers without altering severities.',
      icon: Cpu,
      evidenceSnippet: 'Anchored line 18 • Plain-English impact • Required skills',
    },
    {
      num: '04',
      title: 'Contribute',
      tagline: 'Actionable Routes & Issue Drafts',
      badge: 'Maintainer Safe',
      desc: 'Translates verified findings into step-by-step contribution packs with skill checklists, test plans, and structured Markdown issue drafts for maintainers.',
      icon: Compass,
      evidenceSnippet: 'Readiness: 88/100 • 8-Section Markdown Draft • Human PR',
    },
  ];

  const features = [
    {
      title: 'Verified Security & Dependency Findings',
      desc: 'Deterministic rules audit workflows for write-all permissions, unpinned actions, and script injection. Real dependencies are checked against OSV.dev published advisories with zero AI-generated CVEs.',
      tag: 'Zero Hallucinations',
      icon: Shield,
      stat: '100% Deterministic',
      size: 'large',
    },
    {
      title: 'Contribution Readiness Score',
      desc: 'Evaluates codebase health across 5 transparent factors: documentation, test suites, CI automation, dependency freshness, and security governance.',
      tag: 'Clamped 0-100',
      icon: Zap,
      stat: '5-Factor Score',
      size: 'small',
    },
    {
      title: 'Cryptographic Evidence Chain',
      desc: 'An 8-step traceable trust trail binds raw repository files to SHA-256 evidence hashes, verifying scanner rule attribution before any AI explanation occurs.',
      tag: 'Verifiable Trail',
      icon: FileSearch,
      stat: 'SHA-256 Hashing',
      size: 'small',
    },
    {
      title: 'Skill Gap & Learning Mode',
      desc: 'Tailored checklists bridge the knowledge gap for beginners with three distinct explanation depths: Quick Summary, Detailed Context, and Architecture Deep-Dive.',
      tag: 'Student Friendly',
      icon: BookOpen,
      stat: '3 Depth Modes',
      size: 'small',
    },
    {
      title: 'Scan Diff & History Engine',
      desc: 'Tracks repository evolution across repeated scans, categorizing findings into new, resolved, or unchanged using stable content fingerprints.',
      tag: 'Delta Tracking',
      icon: GitCommit,
      stat: 'Stable Fingerprints',
      size: 'small',
    },
    {
      title: 'Maintainer-Ready Issue Drafts',
      desc: 'Generates polite, reviewable 8-section Markdown issues formatted to open-source norms. Zero auto-posting: human maintainer review is strictly enforced.',
      tag: 'Human in the Loop',
      icon: FileText,
      stat: '8 Core Sections',
      size: 'large',
    },
  ];

  const faqs = [
    {
      category: 'Grounding & AI Safety',
      q: 'How does ContribLens prevent Gemini from hallucinating vulnerabilities?',
      a: 'Gemini operates through a server-side adapter bound by strict grounding guardrails: it is never permitted to declare a vulnerability independently or alter deterministic severities. Every prompt is tied to an existing finding ID and verified, redacted evidence. If the model is unreachable, a robust deterministic fallback engine steps in seamlessly.',
    },
    {
      category: 'Security Architecture',
      q: 'Does ContribLens ever execute repository code during a scan?',
      a: 'Never. Scans are strictly read-only, sandboxed, and bounded by a 60-file limit and byte caps. Manifests, YAML workflows, and health files are parsed purely statically, completely eliminating arbitrary code execution risks.',
    },
    {
      category: 'Maintainer Etiquette',
      q: 'Does ContribLens automatically post issues or pull requests to GitHub?',
      a: 'Never. ContribLens operates under a strict manual publishing model. Issue drafts can be previewed, edited, copied, or downloaded as Markdown files, but cannot be automatically submitted to external GitHub repositories without human maintainer review.',
    },
    {
      category: 'Secret Protection',
      q: 'How are exposed secrets safely handled?',
      a: 'ContribLens features a deterministic redaction engine that masks API keys, AWS credentials, Slack webhooks, and private keys with asterisks before storage, UI display, model prompts, or export.',
    },
    {
      category: 'Design & Visual System',
      q: 'What visual design system does ContribLens use?',
      a: 'ContribLens uses an editorial, high-fidelity liquid-glass design system featuring Pure Black (#000000), Black Hole (#222222), Coffee Bean (#2D120D), Electric Tangerine (#FF6D1F), Lemon Chiffon (#FFF8CA), Mocha Brown (#6F4E37), Platinum Silver (#E5E4E2), Pale Lavender (#E6E0F0), and Botticelli (#CDE3E8).',
    },
    {
      category: 'Language Ecosystems',
      q: 'What types of repositories can I scan?',
      a: 'Any public HTTPS GitHub repository. The engine is optimized for JavaScript/TypeScript (npm), Python (pip/poetry), GitHub Actions workflows, Dockerfiles, and community repository health.',
    },
  ];

  const sampleRepositories = [
    'expressjs/express',
    'facebook/react',
    'pallets/flask',
    'vercel/next.js',
  ];

  return (
    <div className="flex flex-col w-full bg-black text-textPrimary overflow-hidden">
      
      {/* ========================================================
          SECTION B — HERO
          ======================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Layered Atmospheric Ambient Lighting (Mocha Brown + Platinum Silver + Tangerine) */}
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[850px] sm:w-[1250px] h-[550px] bg-gradient-to-b from-electricTangerine/20 via-coffeeBean/30 to-transparent rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-[280px] -left-36 w-[480px] h-[480px] bg-gradient-to-tr from-mochaBrown/25 via-paleLavender/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[320px] -right-36 w-[520px] h-[520px] bg-gradient-to-tl from-platinumSilver/15 via-electricTangerine/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left: Value Proposition, Eyebrow & High-Impact CTAs (Col span 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Concise Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-chrome-pill text-xs font-medium text-platinumSilver shadow-sm">
              <span className="w-2 h-2 rounded-full bg-electricTangerine animate-pulse" />
              <span className="font-semibold text-lemonChiffon font-mono">Evidence-First Open-Source Contribution</span>
              <span className="text-platinumSilver/40">•</span>
              <span className="text-paleLavender">Scan. Understand. Contribute.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-textPrimary leading-[1.08]">
              From security finding to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-platinumSilver via-lemonChiffon to-electricTangerine">
                safe contribution.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-platinumSilver/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ContribLens scans public GitHub repositories, verifies findings with deterministic static analysis, explains them with grounded Gemini in plain English, and produces beginner-friendly contribution packs and maintainer issue drafts.
            </p>

            {/* High-Impact Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/scan"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white font-bold text-sm transition-all shadow-glow-tangerine hover:shadow-electricTangerine/50 flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Scan a Repository</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#process"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-platinumSilver border border-platinumSilver/30 font-semibold text-sm transition-all backdrop-blur-md shadow-liquid-glass flex items-center justify-center gap-2 group active:scale-95"
              >
                <Compass className="w-4 h-4 text-lemonChiffon group-hover:rotate-45 transition-transform" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Small Trust Line */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-platinumSilver/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-lemonChiffon" /> Read-only scan
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-electricTangerine" /> No code execution
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-paleLavender" /> Human-reviewed drafts
              </span>
            </div>

            {/* 4 Clean Intentional Floating Callout Chips */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] text-platinumSilver/90 font-medium">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2 shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Evidence</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-lemonChiffon shrink-0" />
                <span>Readiness 88/100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-electricTangerine shrink-0" />
                <span>Human Review Only</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-paleLavender shrink-0" />
                <span>Zero Execution</span>
              </div>
            </div>

          </div>

          {/* Right: Rich Interactive Product Preview Frame (Col span 5) */}
          <div className="lg:col-span-5" id="hero-preview">
            <div className="liquid-glass-hero p-6 sm:p-7 rounded-3xl space-y-5 relative group">
              
              {/* Header with Sample Repository Tag */}
              <div className="flex items-center justify-between pb-4 border-b border-platinumSilver/15">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full liquid-chrome-orb flex items-center justify-center shadow-md">
                    <Shield className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-lemonChiffon flex items-center gap-1.5">
                      <span>expressjs/express</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-textMuted font-mono">Sample Context • 18 verified files</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 shadow-sm">
                    Readiness: 88/100
                  </span>
                </div>
              </div>

              {/* 4 Interactive Segmented Tabs: Finding, Explanation, Route, Draft */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/70 border border-platinumSilver/15 text-[11px] font-mono" role="tablist">
                <button
                  role="tab"
                  aria-selected={activePreviewTab === 'finding'}
                  onClick={() => handleTabClick('finding')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    activePreviewTab === 'finding'
                      ? 'bg-white/15 text-lemonChiffon font-bold border border-platinumSilver/30 shadow-sm'
                      : 'text-platinumSilver/60 hover:text-platinumSilver'
                  }`}
                >
                  Finding
                </button>
                <button
                  role="tab"
                  aria-selected={activePreviewTab === 'explanation'}
                  onClick={() => handleTabClick('explanation')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    activePreviewTab === 'explanation'
                      ? 'bg-white/15 text-lemonChiffon font-bold border border-platinumSilver/30 shadow-sm'
                      : 'text-platinumSilver/60 hover:text-platinumSilver'
                  }`}
                >
                  Explain
                </button>
                <button
                  role="tab"
                  aria-selected={activePreviewTab === 'route'}
                  onClick={() => handleTabClick('route')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    activePreviewTab === 'route'
                      ? 'bg-white/15 text-lemonChiffon font-bold border border-platinumSilver/30 shadow-sm'
                      : 'text-platinumSilver/60 hover:text-platinumSilver'
                  }`}
                >
                  Route
                </button>
                <button
                  role="tab"
                  aria-selected={activePreviewTab === 'draft'}
                  onClick={() => handleTabClick('draft')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    activePreviewTab === 'draft'
                      ? 'bg-white/15 text-lemonChiffon font-bold border border-platinumSilver/30 shadow-sm'
                      : 'text-platinumSilver/60 hover:text-platinumSilver'
                  }`}
                >
                  Draft
                </button>
              </div>

              {/* Dynamic Interactive Stage Body */}
              <div className="min-h-[250px] flex flex-col justify-between">
                
                {/* TAB 1: FINDING */}
                {activePreviewTab === 'finding' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-rosewood text-white font-bold text-[10px]">
                          HIGH SEVERITY
                        </span>
                        <span className="text-lemonChiffon">Confidence: 98%</span>
                      </div>
                      <div className="text-xs font-semibold text-textPrimary leading-snug">
                        Overly Permissive Workflow: write-all declared
                      </div>
                      <div className="font-mono text-[10px] text-platinumSilver/70 bg-black/90 p-2 rounded border border-white/5 space-y-1">
                        <p className="text-platinumSilver/60">File: .github/workflows/ci.yml:18</p>
                        <p className="text-electricTangerine">Evidence: permissions: write-all</p>
                        <p className="text-lemonChiffon">Hash: SHA-256 e3b0c44298fc1c149afb...</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-coffeeBean/70 border border-electricTangerine/30 flex items-center justify-between text-xs">
                      <span className="text-textPrimary font-medium text-[11px]">Deterministic Rule</span>
                      <span className="px-2 py-0.5 rounded bg-black text-electricTangerine font-mono text-[10px]">
                        GH-ACTIONS-WRITE-ALL
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXPLANATION */}
                {activePreviewTab === 'explanation' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-paleLavender font-semibold">GROUNDED GEMINI EXPLANATION</span>
                        <span className="text-lemonChiffon text-[10px]">Anchored: L18</span>
                      </div>
                      <div className="text-xs text-platinumSilver/90 leading-relaxed bg-black/90 p-2.5 rounded border border-white/5 space-y-1.5">
                        <p className="font-semibold text-lemonChiffon text-[11px]">Plain-English Impact:</p>
                        <p className="text-[11px] text-platinumSilver/80">
                          &quot;This GitHub Actions workflow grants unrestricted write access to every repository asset. If an external untrusted action or PR payload executes here, it could tamper with code releases.&quot;
                        </p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-coffeeBean/60 border border-paleLavender/30 flex items-center justify-between text-xs">
                      <span className="text-textPrimary font-medium text-[11px]">Required Skill</span>
                      <span className="px-2 py-0.5 rounded bg-black text-paleLavender font-mono text-[10px] border border-paleLavender/30">
                        GitHub Actions • YAML
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: ROUTE */}
                {activePreviewTab === 'route' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-lemonChiffon font-semibold">ACTIONABLE TASK ROUTE</span>
                        <span className="text-emerald-400 text-[10px]">Beginner • 25m effort</span>
                      </div>
                      <div className="space-y-1 text-[11px] bg-black/90 p-2.5 rounded border border-white/5 font-mono">
                        <p className="text-lemonChiffon font-semibold">Action: Declare minimal permissions</p>
                        <p className="text-textMuted text-[10px]">Target: .github/workflows/ci.yml:18</p>
                        <p className="text-platinumSilver/80 text-[10px]">Criteria: replace write-all with contents: read</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-coffeeBean/70 border border-lemonChiffon/30 flex items-center justify-between text-xs">
                      <span className="text-lemonChiffon font-medium text-[11px]">Readiness Score</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black text-lemonChiffon font-mono text-[10px] border border-lemonChiffon/30">
                        88/100 (Safe for Newcomers)
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 4: DRAFT */}
                {activePreviewTab === 'draft' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-platinumSilver font-semibold">MAINTAINER ISSUE DRAFT</span>
                        <span className="text-lemonChiffon text-[10px]">8 Sections Validated</span>
                      </div>
                      <div className="space-y-1 text-[10px] bg-black/90 p-2.5 rounded border border-white/5 font-mono text-platinumSilver/80">
                        <p className="text-lemonChiffon font-bold">### Summary of Proposed Fix</p>
                        <p>Restrict CI workflow permissions to read-only content access.</p>
                        <p className="text-platinumSilver/60 mt-1">### Verification Steps</p>
                        <p>1. Run workflow dry-run with explicit scopes.</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blackHole border border-platinumSilver/25 flex items-center justify-between text-xs">
                      <span className="text-platinumSilver font-medium text-[11px]">Publish Model</span>
                      <span className="px-2 py-0.5 rounded bg-black text-lemonChiffon font-mono text-[10px]">
                        Manual Human Review Only
                      </span>
                    </div>
                  </div>
                )}

                {/* Sample Label & Interaction Toggle */}
                <div className="pt-3 flex items-center justify-between text-[11px] text-textMuted border-t border-platinumSilver/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-electricTangerine" />
                    <span className="text-[10px] font-mono text-platinumSilver/60">Sample Data Preview • No network calls</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoCycle(!isAutoCycle)}
                    className="flex items-center gap-1 text-lemonChiffon hover:underline text-[10px] font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAutoCycle ? 'Auto-cycling' : 'Interactive'}</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ========================================================
          SECTION C — COMPACT TRUST STRIP
          ======================================================== */}
      <section className="py-8 border-y border-platinumSilver/15 bg-blackHole/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPrinciples.map((tp, idx) => {
              const Icon = tp.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-platinumSilver/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className={`w-4 h-4 ${tp.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary tracking-tight">{tp.title}</h4>
                    <p className="text-[11px] text-platinumSilver/70 leading-relaxed mt-0.5">{tp.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION D — HOW IT WORKS (The 4-Step Rail)
          ======================================================== */}
      <section id="process" className="py-24 border-b border-platinumSilver/15 relative bg-gradient-to-b from-black via-blackHole/40 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block font-mono">
              The 4-Step Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight">
              From cold security findings to safe maintainer pull requests
            </h2>
            <p className="text-platinumSilver/80 text-sm sm:text-base leading-relaxed">
              Every step is bounded by verifiable invariants: static parsing without code execution, OSV CVE verification, grounded AI explanations, and human-in-the-loop maintainer drafts.
            </p>
          </div>

          {/* 4-Step Rail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`liquid-glass-card p-6 rounded-2xl relative space-y-4 flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected ? 'border-lemonChiffon/60 shadow-liquid-glow scale-[1.02]' : 'hover:border-platinumSilver/35'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-3xl font-mono font-bold transition-colors ${
                        isSelected ? 'text-lemonChiffon' : 'text-lemonChiffon/30'
                      }`}>
                        {step.num}
                      </span>
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coffeeBean to-black border border-platinumSilver/25 flex items-center justify-center text-electricTangerine shadow-sm">
                        <Icon className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,109,31,0.5)]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-textPrimary">
                          {step.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-platinumSilver/80 border border-white/10">
                          {step.badge}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-electricTangerine block">
                        {step.tagline}
                      </span>
                    </div>

                    <p className="text-xs text-platinumSilver/75 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-platinumSilver/15">
                    <span className="text-[10px] font-mono text-lemonChiffon/80 block truncate">
                      {step.evidenceSnippet}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION F — FEATURE GRID (Varied Composition)
          ======================================================== */}
      <section id="features" className="py-24 border-b border-platinumSilver/15 relative">
        
        {/* Subtle Ambient Refraction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-mochaBrown/15 via-paleLavender/10 to-electricTangerine/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block font-mono">
              Engineered for Open-Source Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Features built for contributors and maintainers
            </h2>
            <p className="text-platinumSilver/80 text-sm">
              We bridge the gap between complex security audits and actionable beginner pull requests.
            </p>
          </div>

          {/* Varied Composition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isLarge = feat.size === 'large';
              return (
                <div
                  key={idx}
                  className={`liquid-glass-card p-7 rounded-3xl space-y-4 hover:border-lemonChiffon/40 transition-all flex flex-col justify-between ${
                    isLarge ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blackHole to-coffeeBean/40' : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffeeBean via-black to-blackHole border border-platinumSilver/30 flex items-center justify-center text-electricTangerine shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 text-lemonChiffon border border-lemonChiffon/30">
                        {feat.stat}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-textPrimary">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-platinumSilver/80 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-block text-xs font-mono text-platinumSilver/80 px-3 py-1 rounded-full bg-black/60 border border-platinumSilver/20 shadow-inner">
                      {feat.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION G — SAFETY SECTION
          ======================================================== */}
      <section id="safety" className="py-24 border-b border-platinumSilver/15 bg-gradient-to-b from-blackHole/30 to-black relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest font-mono">
              Core Safety Commitment
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight">
              Code verifies. Gemini explains. Human approves.
            </h2>
            <p className="text-sm sm:text-base text-platinumSilver/85 max-w-2xl mx-auto leading-relaxed">
              Deterministic scanner rules own finding existence and severity. Grounded Gemini translates technical evidence into constructive contributor guides without inventing CVEs. External PR creation always requires human maintainer review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="liquid-glass-card p-6 rounded-2xl border border-platinumSilver/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-coffeeBean border border-platinumSilver/20 flex items-center justify-center text-lemonChiffon mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-textPrimary block">1. Zero Code Execution</span>
              <p className="text-xs text-platinumSilver/75 leading-relaxed font-normal">
                Repository code is never executed. Scans operate purely as bounded static text parsers over public GitHub trees with strict byte and file bounds.
              </p>
            </div>

            <div className="liquid-glass-card p-6 rounded-2xl border border-platinumSilver/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-coffeeBean border border-platinumSilver/20 flex items-center justify-center text-electricTangerine mb-3">
                <KeyRound className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-textPrimary block">2. Strict Secret Masking</span>
              <p className="text-xs text-platinumSilver/75 leading-relaxed font-normal">
                Tokens, private keys, and credentials are automatically redacted with asterisks before database writes, UI display, or AI prompt calls.
              </p>
            </div>

            <div className="liquid-glass-card p-6 rounded-2xl border border-platinumSilver/20 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-coffeeBean border border-platinumSilver/20 flex items-center justify-center text-paleLavender mb-3">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-textPrimary block">3. Manual PRs Only</span>
              <p className="text-xs text-platinumSilver/75 leading-relaxed font-normal">
                ContribLens never calls GitHub write APIs. Contributors and maintainers review, polish, and submit all issue drafts and pull requests manually.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <Link
              href="/security"
              className="text-lemonChiffon hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Read Full Security Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-platinumSilver/30">•</span>
            <Link
              href="/privacy"
              className="text-paleLavender hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Privacy &amp; Data Retention</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION H — FAQ ACCORDION
          ======================================================== */}
      <section id="faqs" className="py-24 border-b border-platinumSilver/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block font-mono">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Clear answers on safety, grounding, and ethics
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="liquid-glass-card rounded-2xl border border-platinumSilver/20 overflow-hidden transition-all"
              >
                <h3>
                  <button
                    id={`faq-btn-${idx}`}
                    aria-controls={`faq-answer-${idx}`}
                    aria-expanded={openFaq === idx}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-textPrimary hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-4">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-paleLavender border border-paleLavender/30 shrink-0 w-fit">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-platinumSilver/70 shrink-0 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-lemonChiffon' : ''
                      }`}
                    />
                  </button>
                </h3>
                {openFaq === idx && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-platinumSilver/80 leading-relaxed border-t border-platinumSilver/15 pt-4 font-normal"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION I — FINAL CTA (Warm Liquid-Glass Terminal)
          ======================================================== */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-coffeeBean/40 via-blackHole to-black">
        
        {/* Ambient Warm Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-electricTangerine/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-electricTangerine/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block font-mono">
              Start Contributing Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight">
              Ready to scan and contribute to open source?
            </h2>
            <p className="text-sm sm:text-base text-platinumSilver/80 max-w-xl mx-auto leading-relaxed">
              Scan your first public GitHub repository in seconds. Evidence-first, beginner-friendly, and maintainer-safe.
            </p>
          </div>

          {/* Quick Scan Input Widget */}
          <form
            onSubmit={handleQuickScan}
            className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl sm:rounded-full bg-black/80 border border-platinumSilver/30 shadow-liquid-glass backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-platinumSilver/60 shrink-0" />
              <input
                type="text"
                value={demoRepoInput}
                onChange={(e) => setDemoRepoInput(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent text-xs sm:text-sm text-textPrimary placeholder-textMuted/60 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-tangerine shrink-0"
            >
              Scan Repository
            </button>
          </form>

          {/* Quick Repositories Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-textMuted font-mono">Try sample:</span>
            {sampleRepositories.map((repo) => (
              <button
                key={repo}
                type="button"
                onClick={() => setDemoRepoInput(`https://github.com/${repo}`)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-platinumSilver/90 border border-platinumSilver/20 font-mono text-[11px] transition-all"
              >
                {repo}
              </button>
            ))}
          </div>

          {/* Account CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-bold text-sm transition-all shadow-md hover:shadow-lemonChiffon/30"
            >
              Sign up with Email &amp; Phone
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black/60 hover:bg-white/5 text-platinumSilver border border-platinumSilver/30 font-semibold text-sm transition-all backdrop-blur-md"
            >
              Log in to Existing Account
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
