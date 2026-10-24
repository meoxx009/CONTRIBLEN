'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  CheckCircle2,
  ArrowRight,
  Lock,
  Cpu,
  FileText,
  Compass,
  ChevronDown,
  GitPullRequest,
  Check,
  Zap,
  RotateCcw,
  BookOpen,
  GitCommit,
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

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsAutoCycle(false);
    }
  }, []);

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
      title: 'Read-Only Static Analysis',
      desc: 'AST and manifest parsing with strict byte limits. Zero repository code execution.',
      icon: Lock,
    },
    {
      title: 'Deterministic Verification',
      desc: 'Real vulnerabilities matched to published OSV.dev CVEs with SHA-256 evidence hashes.',
      icon: Shield,
    },
    {
      title: 'Grounded AI Explanations',
      desc: 'Server-side Gamma 4 adapter strictly anchored to verified code lines with redacted secrets.',
      icon: Cpu,
    },
    {
      title: 'Human-Approved PRs Only',
      desc: 'Pre-drafted Markdown issues for maintainer review. Zero automated issue or PR spam.',
      icon: GitPullRequest,
    },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Scan',
      tagline: 'Static AST & manifest parser',
      desc: 'Parses dependencies, GitHub Actions workflows, and health files from public repositories without running code.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Verify',
      tagline: 'OSV & SHA-256 evidence hashing',
      desc: 'Cross-references published advisories with OSV.dev and cryptographically hashes code snippets for proof.',
      icon: CheckCircle2,
    },
    {
      num: '03',
      title: 'Understand',
      tagline: 'Grounded Gamma 4 explanations',
      desc: 'Translates raw security findings into plain English, explaining impact, required skills, and target files.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Contribute',
      tagline: 'Actionable packs & issue drafts',
      desc: 'Produces structured contribution packs for newcomers and polite, reviewable issue drafts for maintainers.',
      icon: Compass,
    },
  ];

  const features = [
    {
      title: 'Deterministic Security Engine',
      desc: 'Audits workflows for write-all permissions, unpinned actions, and script injection. Real dependencies are checked against OSV.dev published advisories with zero AI-generated CVEs.',
      icon: Shield,
      tag: 'Zero Hallucinations',
    },
    {
      title: 'Contribution Readiness Score',
      desc: 'Calculates codebase health across 5 transparent factors: documentation, test suites, CI automation, dependency freshness, and security governance.',
      icon: Zap,
      tag: '5-Factor Score',
    },
    {
      title: 'Cryptographic Evidence Chain',
      desc: 'An 8-step traceable trust trail binds raw repository files to SHA-256 evidence hashes, verifying scanner rule attribution before any AI explanation occurs.',
      icon: FileSearch,
      tag: 'SHA-256 Hashed',
    },
    {
      title: 'Skill Gap & Learning Mode',
      desc: 'Tailored checklists bridge the knowledge gap for beginners with three distinct explanation depths: Quick Summary, Detailed Context, and Architecture Deep-Dive.',
      icon: BookOpen,
      tag: 'Student Friendly',
    },
    {
      title: 'Scan Diff & History Engine',
      desc: 'Tracks repository evolution across repeated scans, categorizing findings into new, resolved, or unchanged using stable content fingerprints.',
      icon: GitCommit,
      tag: 'Delta Tracking',
    },
    {
      title: 'Maintainer-Ready Issue Drafts',
      desc: 'Generates polite, reviewable 8-section Markdown issues formatted to open-source norms. Zero auto-posting: human maintainer review is strictly enforced.',
      icon: FileText,
      tag: 'Human in the Loop',
    },
  ];

  const faqs = [
    {
      category: 'Grounding & AI Safety',
      q: 'How does ContriBLens prevent Gamma 4 from hallucinating vulnerabilities?',
      a: 'Gamma 4 operates through a server-side adapter bound by strict grounding guardrails: it is never permitted to declare a vulnerability independently or alter deterministic severities. Every prompt is tied to an existing finding ID and verified, redacted evidence. If the model is unreachable, a robust deterministic fallback engine steps in seamlessly.',
    },
    {
      category: 'Security Architecture',
      q: 'Does ContriBLens ever execute repository code during a scan?',
      a: 'Never. Scans are strictly read-only, sandboxed, and bounded by a 60-file limit and byte caps. Manifests, YAML workflows, and health files are parsed purely statically, completely eliminating arbitrary code execution risks.',
    },
    {
      category: 'Maintainer Etiquette',
      q: 'Does ContriBLens automatically post issues or pull requests to GitHub?',
      a: 'Never. ContriBLens operates under a strict manual publishing model. Issue drafts can be previewed, edited, copied, or downloaded as Markdown files, but cannot be automatically submitted to external GitHub repositories without human maintainer review.',
    },
    {
      category: 'Secret Protection',
      q: 'How are exposed secrets safely handled?',
      a: 'ContriBLens features a deterministic redaction engine that masks API keys, AWS credentials, Slack webhooks, and private keys with asterisks before storage, UI display, model prompts, or export.',
    },
    {
      category: 'Design & Visual System',
      q: 'What visual design system does ContriBLens use?',
      a: 'ContriBLens uses an editorial, high-fidelity liquid-glass design system featuring Pure Black (#000000), Black Hole (#222222), Coffee Bean (#2D120D), Electric Tangerine (#FF6D1F), Lemon Chiffon (#FFF8CA), Mocha Brown (#6F4E37), Platinum Silver (#E5E4E2), Pale Lavender (#E6E0F0), and Botticelli (#CDE3E8).',
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
    <div className="flex flex-col w-full bg-black text-textPrimary overflow-x-hidden">
      
      {/* ========================================================
          SECTION B — HERO: Editorial, Minimal & Question-First Hierarchy
          ======================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Calm Ambient Lighting (Mocha Brown + Platinum Silver + Tangerine Glow) */}
        <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-b from-electricTangerine/15 via-mochaBrown/20 to-transparent rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-[260px] -right-32 w-[400px] h-[400px] bg-gradient-to-tl from-platinumSilver/10 via-paleLavender/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Clear answers to What, Who, What Next, Why Trust (Col span 7) */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Restrained Eyebrow & Palette Swatch */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-platinumSilver/20 text-xs font-mono text-platinumSilver/90 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-electricTangerine" />
              <span className="font-semibold text-lemonChiffon">ContriBLens OSS</span>
              <span className="text-platinumSilver/30">•</span>
              <span className="text-platinumSilver/70">Scan. Understand. Contribute.</span>
              
              {/* Subtle Reference Palette Swatch Rail */}
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-platinumSilver/20">
                <span className="w-2 h-2 rounded-full bg-mochaBrown" title="Mocha Brown" />
                <span className="w-2 h-2 rounded-full bg-platinumSilver" title="Platinum Silver" />
                <span className="w-2 h-2 rounded-full bg-paleLavender" title="Pale Lavender" />
                <span className="w-2 h-2 rounded-full bg-electricTangerine" title="Electric Tangerine" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textPrimary leading-[1.12]">
              From security finding to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-platinumSilver via-lemonChiffon to-electricTangerine">
                safe contribution.
              </span>
            </h1>

            {/* Subtitle: Answers What is ContribLens & Who is it for */}
            <p className="text-sm sm:text-base text-platinumSilver/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              An evidence-first security intelligence platform for open-source contributors and maintainers. We scan public GitHub repositories, verify findings deterministically, and generate beginner-friendly pull request plans.
            </p>

            {/* What Should I Do Now: High-Impact CTAs with min-h-[44px] tap target */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/scan"
                className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white font-bold text-sm transition-all shadow-glow-tangerine flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Scan a Repository</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="#process"
                className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-platinumSilver border border-platinumSilver/25 font-semibold text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4 text-lemonChiffon" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Why Should I Trust It: Calm Trust Bar (No visual clutter) */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-platinumSilver/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-lemonChiffon" /> Zero code execution
              </span>
              <span className="hidden sm:inline text-platinumSilver/30">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-electricTangerine" /> OSV-verified CVEs
              </span>
              <span className="hidden sm:inline text-platinumSilver/30">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-paleLavender" /> Grounded Gamma 4 (no inventions)
              </span>
              <span className="hidden sm:inline text-platinumSilver/30">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Human-approved PRs
              </span>
            </div>

          </div>

          {/* Right Column: ONE Strong Focal Liquid-Glass Panel (Col span 5) */}
          <div className="lg:col-span-5" id="hero-preview">
            <div className="liquid-glass-hero p-5 sm:p-6 rounded-3xl space-y-4 relative border border-platinumSilver/20 shadow-liquid-glass">
              
              {/* Header: Sample Repository & Readiness Gauge */}
              <div className="flex items-center justify-between pb-3.5 border-b border-platinumSilver/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg liquid-chrome-orb flex items-center justify-center shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-black" />
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
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 shadow-sm">
                    Readiness: 88/100
                  </span>
                </div>
              </div>

              {/* 4 Interactive Segmented Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/60 border border-platinumSilver/15 text-[11px] font-mono" role="tablist">
                <button
                  type="button"
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
                  type="button"
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
                  type="button"
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
                  type="button"
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

              {/* Dynamic Preview Content */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                {/* TAB 1: FINDING */}
                {activePreviewTab === 'finding' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
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
                      <div className="font-mono text-[10px] text-platinumSilver/70 bg-black/90 p-2 rounded border border-white/5 space-y-0.5">
                        <p className="text-platinumSilver/60">File: .github/workflows/ci.yml:18</p>
                        <p className="text-electricTangerine">Evidence: permissions: write-all</p>
                        <p className="text-lemonChiffon">SHA-256: e3b0c44298fc1c14...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXPLANATION */}
                {activePreviewTab === 'explanation' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-paleLavender font-semibold">GROUNDED EXPLANATION</span>
                        <span className="text-lemonChiffon text-[10px]">Anchored: L18</span>
                      </div>
                      <p className="text-xs text-platinumSilver/85 leading-relaxed bg-black/90 p-2.5 rounded border border-white/5">
                        &quot;This workflow grants unrestricted write permissions to every repository asset. If an untrusted action or PR payload executes here, it could tamper with code releases.&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-platinumSilver/60 pt-0.5">
                        <span>Required Skill: GitHub Actions, YAML</span>
                        <span className="text-lemonChiffon">Est. 25m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: ROUTE */}
                {activePreviewTab === 'route' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-lemonChiffon font-semibold">CONTRIBUTOR ROUTE</span>
                        <span className="text-emerald-400 text-[10px]">Beginner Friendly</span>
                      </div>
                      <div className="space-y-1 text-[11px] bg-black/90 p-2 rounded border border-white/5 font-mono">
                        <p className="text-lemonChiffon font-semibold">Action: Scope workflow permissions</p>
                        <p className="text-platinumSilver/70 text-[10px]">Criteria: replace write-all with contents: read</p>
                        <p className="text-platinumSilver/60 text-[10px]">Verification: dry-run CI workflow checks</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DRAFT */}
                {activePreviewTab === 'draft' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-black/80 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-platinumSilver font-semibold">MAINTAINER ISSUE DRAFT</span>
                        <span className="text-lemonChiffon text-[10px]">8 Sections Verified</span>
                      </div>
                      <div className="space-y-0.5 text-[10px] bg-black/90 p-2 rounded border border-white/5 font-mono text-platinumSilver/80">
                        <p className="text-lemonChiffon font-bold">### Summary of Proposed Fix</p>
                        <p>Restrict CI workflow permissions to read-only content access.</p>
                        <p className="text-platinumSilver/60 mt-1">### Verification Steps</p>
                        <p>1. Run workflow dry-run with explicit scopes.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Status & Sample Notice */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-textMuted border-t border-platinumSilver/15">
                  <span className="text-[10px] font-mono text-platinumSilver/60">Sample Data Preview • Local</span>
                  <button
                    type="button"
                    onClick={() => setIsAutoCycle(!isAutoCycle)}
                    className="flex items-center gap-1 text-lemonChiffon hover:underline text-[10px] font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAutoCycle ? 'Auto-cycle' : 'Paused'}</span>
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
      <section className="py-7 border-y border-platinumSilver/15 bg-blackHole/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPrinciples.map((tp, idx) => {
              const Icon = tp.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  {/* Small line icon container (28px) */}
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-platinumSilver/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-platinumSilver" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-textPrimary tracking-tight">{tp.title}</h3>
                    <p className="text-[11px] text-platinumSilver/70 leading-relaxed mt-0.5">{tp.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION D — HOW IT WORKS: Connected 4-Step Rail
          ======================================================== */}
      <section id="process" className="scroll-mt-24 py-20 border-b border-platinumSilver/15 relative bg-gradient-to-b from-black via-blackHole/30 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block font-mono">
              The 4-Step Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              From cold security findings to safe pull requests
            </h2>
            <p className="text-platinumSilver/80 text-xs sm:text-sm leading-relaxed">
              Every step is bounded by verifiable invariants: static parsing, OSV verification, grounded explanations, and maintainer review.
            </p>
          </div>

          {/* 4-Step Rail: Clean, Scannable & Minimal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'liquid-glass-card border-lemonChiffon/60 shadow-liquid-glow scale-[1.01]'
                      : 'bg-black/40 border-platinumSilver/15 hover:border-platinumSilver/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-mono font-bold transition-colors ${
                        isSelected ? 'text-lemonChiffon' : 'text-platinumSilver/30'
                      }`}>
                        {step.num}
                      </span>
                      {/* Small line icon container (30px) */}
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-platinumSilver/20 flex items-center justify-center text-electricTangerine">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-textPrimary">
                        {step.title}
                      </h3>
                      <span className="text-xs font-mono text-electricTangerine/90 block mt-0.5">
                        {step.tagline}
                      </span>
                    </div>

                    <p className="text-xs text-platinumSilver/75 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION F — CORE FEATURES: Minimal Editorial Grid (Problem 1 & 2 Fixed)
          ======================================================== */}
      <section id="features" className="scroll-mt-24 py-20 border-b border-platinumSilver/15 relative">
        
        {/* Subtle Ambient Refraction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-mochaBrown/15 via-paleLavender/10 to-electricTangerine/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block font-mono">
              Engineered for Open-Source Safety
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Features built for contributors and maintainers
            </h2>
            <p className="text-platinumSilver/80 text-xs sm:text-sm">
              We bridge the gap between complex security audits and actionable beginner pull requests without visual noise.
            </p>
          </div>

          {/* Minimal 3-Column Editorial Grid: 28-34px icons, clean typography, progressive disclosure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-black/50 border border-platinumSilver/15 hover:border-platinumSilver/30 hover:bg-black/70 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Small line icon container (30px) */}
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-platinumSilver/20 flex items-center justify-center text-electricTangerine">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-lemonChiffon/90 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-textPrimary leading-snug">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-platinumSilver/75 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION G — SAFETY COMMITMENT
          ======================================================== */}
      <section id="safety" className="scroll-mt-24 py-20 border-b border-platinumSilver/15 bg-gradient-to-b from-blackHole/30 to-black relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest font-mono">
              Core Safety Commitment
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Code verifies. Gamma 4 explains. Human approves.
            </h2>
            <p className="text-xs sm:text-sm text-platinumSilver/80 max-w-xl mx-auto leading-relaxed">
              Deterministic scanner rules own finding existence and severity. Grounded Gamma 4 translates technical evidence into constructive contributor guides without inventing CVEs. External PR creation always requires human maintainer review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            <div className="p-5 rounded-2xl bg-black/60 border border-platinumSilver/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-coffeeBean/70 border border-platinumSilver/20 flex items-center justify-center text-lemonChiffon mb-2">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-textPrimary">1. Zero Code Execution</h3>
              <p className="text-xs text-platinumSilver/70 leading-relaxed font-normal">
                Repository code is never executed. Scans operate purely as bounded static text parsers over public GitHub trees with strict byte and file bounds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-platinumSilver/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-coffeeBean/70 border border-platinumSilver/20 flex items-center justify-center text-electricTangerine mb-2">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-textPrimary">2. Strict Secret Masking</h3>
              <p className="text-xs text-platinumSilver/70 leading-relaxed font-normal">
                Tokens, private keys, and credentials are automatically redacted with asterisks before database writes, UI display, or AI prompt calls.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-platinumSilver/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-coffeeBean/70 border border-platinumSilver/20 flex items-center justify-center text-paleLavender mb-2">
                <GitPullRequest className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-textPrimary">3. Manual PRs Only</h3>
              <p className="text-xs text-platinumSilver/70 leading-relaxed font-normal">
                ContriBLens never calls GitHub write APIs. Contributors and maintainers review, polish, and submit all issue drafts and pull requests manually.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <Link
              href="/security"
              className="text-lemonChiffon hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Security &amp; Disclosure Policy</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-platinumSilver/30">•</span>
            <Link
              href="/privacy"
              className="text-paleLavender hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Privacy Notice</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION H — FAQ ACCORDION: Liquid Glass
          ======================================================== */}
      <section id="faqs" className="scroll-mt-24 py-20 border-b border-platinumSilver/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block font-mono">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              Clear answers on safety, grounding, and ethics
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-platinumSilver/20 bg-black/60 overflow-hidden transition-all"
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-btn-${idx}`}
                    aria-controls={`faq-answer-${idx}`}
                    aria-expanded={openFaq === idx}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full min-h-[44px] p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-textPrimary hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 pr-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-paleLavender border border-paleLavender/30 shrink-0 w-fit">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-platinumSilver/70 shrink-0 transition-transform duration-200 ${
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
                    className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-platinumSilver/80 leading-relaxed border-t border-platinumSilver/15 pt-3 font-normal"
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
          SECTION I — FINALE CALL TO ACTION
          ======================================================== */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-coffeeBean/30 via-blackHole to-black">
        
        {/* Ambient Warm Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-electricTangerine/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block font-mono">
              Start Contributing Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Ready to scan and contribute to open source?
            </h2>
            <p className="text-xs sm:text-sm text-platinumSilver/80 max-w-lg mx-auto leading-relaxed">
              Scan your first public GitHub repository in seconds. Evidence-first, beginner-friendly, and maintainer-safe.
            </p>
          </div>

          {/* Quick Scan Input Widget */}
          <form
            onSubmit={handleQuickScan}
            className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl sm:rounded-full bg-black/80 border border-platinumSilver/30 shadow-liquid-glass backdrop-blur-xl"
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
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-electricTangerine hover:bg-electricTangerine-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-tangerine shrink-0 active:scale-95"
            >
              Scan Repository
            </button>
          </form>

          {/* Sample Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-textMuted font-mono">Sample:</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto min-h-[44px] px-7 py-3 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Sign up with Email &amp; Phone
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto min-h-[44px] px-7 py-3 rounded-full bg-black/60 hover:bg-white/5 text-platinumSilver border border-platinumSilver/25 font-semibold text-xs sm:text-sm transition-all backdrop-blur-md active:scale-95"
            >
              Log in to Existing Account
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
