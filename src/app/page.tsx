'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContriBLensMark from '@/components/ContriBLensMark';
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
      desc: 'Server-side Gemini 2.5 Flash adapter strictly anchored to verified code lines with redacted secrets.',
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
      tagline: 'Grounded Gemini explanations',
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
      q: 'How does ContriBLens prevent Gemini from hallucinating vulnerabilities?',
      a: 'Gemini operates through a server-side adapter bound by strict grounding guardrails: it is never permitted to declare a vulnerability independently or alter deterministic severities. Every prompt is tied to an existing finding ID and verified, redacted evidence. If the model is unreachable, a robust deterministic fallback engine steps in seamlessly.',
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
      a: 'ContriBLens uses a Kora-inspired dark editorial design system featuring a deep obsidian canvas (#050302), atmospheric burgundy (#68100D), slate-blue (#303A4C), primary red accents (#C02B18), warm off-white typography (#F9F6F2), and dark charcoal glass surfaces.',
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
    <div className="flex flex-col w-full text-textPrimary overflow-x-hidden">
      
      {/* ========================================================
          SECTION B — HERO: Editorial, Minimal & Question-First Hierarchy
          ======================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Atmospheric Smoky Hero Backdrop */}
        <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-b from-koraRed/12 via-koraBurgundy/20 to-transparent rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-[260px] -right-32 w-[420px] h-[420px] bg-gradient-to-tl from-koraSlate/25 via-koraBurgundy/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Clear answers to What, Who, What Next, Why Trust (Col span 7) */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Developer-Centric Eyebrow & Palette Swatch */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-koraCharcoal-surface/80 border border-koraCharcoal-border text-xs font-mono text-koraSecondary shadow-sm backdrop-blur-md">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-koraRed font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-koraRed animate-pulse" />
                <span>sys::ready</span>
              </span>
              <span className="text-koraCharcoal-borderLight">{'//'}</span>
              <span className="font-semibold text-koraOffWhite">ContriBLens OSS</span>
              <span className="hidden sm:inline text-koraCharcoal-borderLight">•</span>
              <span className="hidden sm:inline text-koraSecondary/80">Scan. Understand. Contribute.</span>
              
              {/* Subtle Kora Reference Palette Swatch Rail */}
              <div className="hidden md:flex items-center gap-1 pl-2 border-l border-koraCharcoal-border">
                <span className="w-2 h-2 rounded-full bg-koraBurgundy" title="Burgundy (#68100D)" />
                <span className="w-2 h-2 rounded-full bg-koraSlate" title="Slate-Blue (#303A4C)" />
                <span className="w-2 h-2 rounded-full bg-koraRed" title="Primary Red (#C02B18)" />
                <span className="w-2 h-2 rounded-full bg-koraOffWhite" title="Warm Off-White (#F9F6F2)" />
              </div>
            </div>

            {/* Headline with Berkelium Sans Heading & Ferdinand Showcase Accent */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-koraOffWhite leading-[1.12]">
              From security finding to{' '}
              <span className="font-showcase italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-koraOffWhite via-koraSecondary to-koraRed">
                safe contribution.
              </span>
            </h1>

            {/* Subtitle: Answers What is ContribLens & Who is it for */}
            <p className="text-sm sm:text-base text-koraSecondary max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              An evidence-first security intelligence platform for open-source contributors and maintainers. We scan public GitHub repositories, verify findings deterministically, and generate beginner-friendly pull request plans.
            </p>

            {/* What Should I Do Now: High-Impact CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/scan"
                className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-koraRed hover:bg-koraRed-hover text-white font-bold text-sm transition-all shadow-glow-red flex items-center justify-center gap-2 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed focus-visible:ring-offset-2 focus-visible:ring-offset-koraBg"
              >
                <span>Scan a Repository</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="#process"
                className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-koraCharcoal-surface hover:bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border font-semibold text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed focus-visible:ring-offset-2 focus-visible:ring-offset-koraBg"
              >
                <Compass className="w-4 h-4 text-koraRed" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Why Should I Trust It: Calm Trust Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-koraSecondary font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-koraOffWhite shrink-0" />
                <span>Zero code execution</span>
              </span>
              <span className="hidden sm:inline text-koraCharcoal-borderLight">{'//'}</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-koraRed shrink-0" />
                <span>OSV-verified CVEs</span>
              </span>
              <span className="hidden sm:inline text-koraCharcoal-borderLight">{'//'}</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-koraSlate shrink-0" />
                <span>Grounded Gemini 2.5</span>
              </span>
              <span className="hidden sm:inline text-koraCharcoal-borderLight">{'//'}</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Human-approved PRs</span>
              </span>
            </div>

          </div>

          {/* Right Column: ONE Strong Focal Liquid-Glass Panel (Col span 5) */}
          <div className="lg:col-span-5" id="hero-preview">
            <div className="p-5 sm:p-6 rounded-3xl space-y-4 relative bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-liquid-glass backdrop-blur-2xl">
              
              {/* Terminal Title Bar & Session Metadata */}
              <div className="flex items-center justify-between pb-3 border-b border-koraCharcoal-border text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-koraBurgundy border border-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-koraRed border border-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/10" />
                  </div>
                  <span className="text-[11px] text-koraSecondary pl-1">
                    session::preview // <span className="text-koraRed">git:(main)</span>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-koraCharcoal-card border border-koraCharcoal-border text-koraOffWhite">
                  AST_READ_ONLY
                </span>
              </div>

              {/* Sample Repository & Readiness Gauge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-koraSlate/25 via-koraCharcoal-surface to-koraBurgundy/30 border border-koraCharcoal-border flex items-center justify-center shadow-liquid-glass">
                    <ContriBLensMark size={18} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-koraOffWhite flex items-center gap-1.5">
                      <span>expressjs/express</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-koraSecondary font-mono">Sample Context • 18 verified files</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-koraBurgundy/30 text-koraOffWhite border border-koraBurgundy/50 shadow-sm font-semibold">
                    Readiness: 88/100
                  </span>
                </div>
              </div>

              {/* 4 Interactive Segmented Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border text-[11px] font-mono" role="tablist" aria-label="Evidence preview modes">
                <button
                  type="button"
                  role="tab"
                  id="tab-btn-finding"
                  aria-selected={activePreviewTab === 'finding'}
                  aria-controls="tab-panel-finding"
                  onClick={() => handleTabClick('finding')}
                  className={`min-h-[40px] sm:min-h-[44px] py-2 px-1 rounded-lg text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed ${
                    activePreviewTab === 'finding'
                      ? 'bg-koraBurgundy/40 text-koraOffWhite font-bold border border-koraRed/40 shadow-sm'
                      : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5'
                  }`}
                >
                  <span className="block text-[10px] text-koraSecondary/50 font-mono">[01]</span>
                  <span>Finding</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-btn-explanation"
                  aria-selected={activePreviewTab === 'explanation'}
                  aria-controls="tab-panel-explanation"
                  onClick={() => handleTabClick('explanation')}
                  className={`min-h-[40px] sm:min-h-[44px] py-2 px-1 rounded-lg text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed ${
                    activePreviewTab === 'explanation'
                      ? 'bg-koraBurgundy/40 text-koraOffWhite font-bold border border-koraRed/40 shadow-sm'
                      : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5'
                  }`}
                >
                  <span className="block text-[10px] text-koraSecondary/50 font-mono">[02]</span>
                  <span>Explain</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-btn-route"
                  aria-selected={activePreviewTab === 'route'}
                  aria-controls="tab-panel-route"
                  onClick={() => handleTabClick('route')}
                  className={`min-h-[40px] sm:min-h-[44px] py-2 px-1 rounded-lg text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed ${
                    activePreviewTab === 'route'
                      ? 'bg-koraBurgundy/40 text-koraOffWhite font-bold border border-koraRed/40 shadow-sm'
                      : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5'
                  }`}
                >
                  <span className="block text-[10px] text-koraSecondary/50 font-mono">[03]</span>
                  <span>Route</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-btn-draft"
                  aria-selected={activePreviewTab === 'draft'}
                  aria-controls="tab-panel-draft"
                  onClick={() => handleTabClick('draft')}
                  className={`min-h-[40px] sm:min-h-[44px] py-2 px-1 rounded-lg text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed ${
                    activePreviewTab === 'draft'
                      ? 'bg-koraBurgundy/40 text-koraOffWhite font-bold border border-koraRed/40 shadow-sm'
                      : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5'
                  }`}
                >
                  <span className="block text-[10px] text-koraSecondary/50 font-mono">[04]</span>
                  <span>Draft</span>
                </button>
              </div>

              {/* Dynamic Preview Content */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                {/* TAB 1: FINDING */}
                {activePreviewTab === 'finding' && (
                  <div id="tab-panel-finding" role="tabpanel" aria-labelledby="tab-btn-finding" className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-koraCharcoal-card border border-koraCharcoal-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-koraBurgundy text-koraOffWhite font-bold text-[10px] border border-koraRed/40">
                          HIGH SEVERITY
                        </span>
                        <span className="text-koraOffWhite font-semibold">Confidence: 98%</span>
                      </div>
                      <div className="text-xs font-semibold text-koraOffWhite leading-snug">
                        Overly Permissive Workflow: write-all declared
                      </div>
                      <div className="font-mono text-[10px] text-koraSecondary bg-[#0B0908] p-2.5 rounded border border-koraCharcoal-border space-y-1">
                        <div className="text-koraSecondary/50 text-[9px]">{'// evidence.verify()'}</div>
                        <p className="text-koraSecondary/80">File: .github/workflows/ci.yml:18</p>
                        <p className="text-koraRed font-semibold">Evidence: permissions: write-all</p>
                        <p className="text-koraOffWhite">SHA-256: e3b0c44298fc1c14...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXPLANATION */}
                {activePreviewTab === 'explanation' && (
                  <div id="tab-panel-explanation" role="tabpanel" aria-labelledby="tab-btn-explanation" className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-koraCharcoal-card border border-koraCharcoal-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-koraSlate font-semibold">GROUNDED EXPLANATION</span>
                        <span className="text-koraOffWhite text-[10px]">Anchored: L18</span>
                      </div>
                      <div className="text-xs text-koraSecondary leading-relaxed bg-[#0B0908] p-2.5 rounded border border-koraCharcoal-border space-y-1">
                        <div className="text-koraSecondary/50 text-[9px] font-mono">{'// gemini.explain()'}</div>
                        <p>
                          &quot;This workflow grants unrestricted write permissions to every repository asset. If an untrusted action or PR payload executes here, it could tamper with code releases.&quot;
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-koraSecondary pt-0.5">
                        <span>Required Skill: GitHub Actions, YAML</span>
                        <span className="text-koraOffWhite">Est. 25m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: ROUTE */}
                {activePreviewTab === 'route' && (
                  <div id="tab-panel-route" role="tabpanel" aria-labelledby="tab-btn-route" className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-koraCharcoal-card border border-koraCharcoal-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-koraOffWhite font-semibold">CONTRIBUTOR ROUTE</span>
                        <span className="text-emerald-400 text-[10px] font-semibold">Beginner Friendly</span>
                      </div>
                      <div className="space-y-1 text-[11px] bg-[#0B0908] p-2.5 rounded border border-koraCharcoal-border font-mono">
                        <div className="text-koraSecondary/50 text-[9px]">{'// route.plan()'}</div>
                        <p className="text-koraOffWhite font-semibold">Action: Scope workflow permissions</p>
                        <p className="text-koraSecondary text-[10px]">Criteria: replace write-all with contents: read</p>
                        <p className="text-koraSecondary/80 text-[10px]">Verification: dry-run CI workflow checks</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DRAFT */}
                {activePreviewTab === 'draft' && (
                  <div id="tab-panel-draft" role="tabpanel" aria-labelledby="tab-btn-draft" className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-koraCharcoal-card border border-koraCharcoal-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-koraSecondary font-semibold">MAINTAINER ISSUE DRAFT</span>
                        <span className="text-koraOffWhite text-[10px]">8 Sections Verified</span>
                      </div>
                      <div className="space-y-1 text-[10px] bg-[#0B0908] p-2.5 rounded border border-koraCharcoal-border font-mono text-koraSecondary">
                        <div className="text-koraSecondary/50 text-[9px]">{'// draft.markdown'}</div>
                        <p className="text-koraOffWhite font-bold">### Summary of Proposed Fix</p>
                        <p>Restrict CI workflow permissions to read-only content access.</p>
                        <p className="text-koraSecondary/70 mt-1 font-semibold">### Verification Steps</p>
                        <p>1. Run workflow dry-run with explicit scopes.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Status & Sample Notice */}
                <div className="pt-2.5 flex items-center justify-between text-[11px] text-koraSecondary border-t border-koraCharcoal-border">
                  <span className="text-[10px] font-mono text-koraSecondary/70">Sample Data Preview • Local</span>
                  <button
                    type="button"
                    onClick={() => setIsAutoCycle(!isAutoCycle)}
                    className="min-h-[36px] px-2 py-1 flex items-center gap-1.5 text-koraOffWhite hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed text-[11px] font-mono transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isAutoCycle ? 'Auto-cycle [ON]' : 'Auto-cycle [OFF]'}</span>
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
      <section className="py-8 border-y border-koraCharcoal-border bg-koraCharcoal-surface/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPrinciples.map((tp, idx) => {
              const Icon = tp.icon;
              const tags = ['[ STATIC-AST ]', '[ OSV-CVE ]', '[ GROUNDED-AI ]', '[ HUMAN-GATED ]'];
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-koraCharcoal-dark/60 border border-koraCharcoal-border hover:border-koraCharcoal-borderLight transition-colors flex items-start gap-3"
                >
                  {/* Line icon container (32px) */}
                  <div className="w-8 h-8 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border flex items-center justify-center shrink-0 text-koraOffWhite">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-koraOffWhite tracking-tight">{tp.title}</h3>
                      <span className="text-[9px] font-mono text-koraRed/80 shrink-0">{tags[idx]}</span>
                    </div>
                    <p className="text-[11px] text-koraSecondary leading-relaxed">{tp.desc}</p>
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
      <section id="process" className="scroll-mt-24 py-20 border-b border-koraCharcoal-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-bold text-koraRed uppercase tracking-widest block font-mono">
              The 4-Step Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-koraOffWhite tracking-tight font-heading">
              From cold security findings to safe pull requests
            </h2>
            <p className="text-koraSecondary text-xs sm:text-sm leading-relaxed">
              Every step is bounded by verifiable invariants: static parsing, OSV verification, grounded explanations, and maintainer review.
            </p>
          </div>

          {/* 4-Step Rail: Clean, Scannable & Accessible */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => handleStepClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStepClick(idx);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed ${
                    isSelected
                      ? 'bg-koraCharcoal-surface border-koraRed/50 shadow-glow-red/20 scale-[1.01]'
                      : 'bg-koraCharcoal-dark/50 border-koraCharcoal-border hover:border-koraCharcoal-borderLight hover:bg-koraCharcoal-dark/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-mono font-bold transition-colors ${
                          isSelected ? 'text-koraRed' : 'text-koraSecondary/30'
                        }`}>
                          {step.num}
                        </span>
                        <span className="text-[10px] font-mono text-koraSecondary/50 uppercase tracking-wider">
                          step::{step.num}
                        </span>
                      </div>
                      {/* Small line icon container (32px) */}
                      <div className="w-8 h-8 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border flex items-center justify-center text-koraRed">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-koraOffWhite">
                        {step.title}
                      </h3>
                      <span className="text-xs font-mono text-koraRed/90 block mt-0.5">
                        {step.tagline}
                      </span>
                    </div>

                    <p className="text-xs text-koraSecondary leading-relaxed font-normal">
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
          SECTION F — CORE FEATURES: Minimal Editorial Grid
          ======================================================== */}
      <section id="features" className="scroll-mt-24 py-20 border-b border-koraCharcoal-border relative">
        
        {/* Subtle Ambient Smoky Mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-koraBurgundy/15 via-koraSlate/10 to-koraRed/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-bold text-koraRed uppercase tracking-widest block font-mono">
              Engineered for Open-Source Safety
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-koraOffWhite tracking-tight font-heading">
              Features built for contributors and maintainers
            </h2>
            <p className="text-koraSecondary text-xs sm:text-sm">
              We bridge the gap between complex security audits and actionable beginner pull requests without visual noise.
            </p>
          </div>

          {/* Minimal 3-Column Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-koraCharcoal-surface/60 border border-koraCharcoal-border hover:border-koraRed/40 hover:bg-koraCharcoal-surface/90 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Small line icon container (32px) */}
                      <div className="w-8 h-8 rounded-lg bg-koraCharcoal-card border border-koraCharcoal-border flex items-center justify-center text-koraRed">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-koraOffWhite px-2 py-0.5 rounded-full bg-koraCharcoal-dark border border-koraCharcoal-border">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-koraOffWhite leading-snug">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-koraSecondary leading-relaxed font-normal">
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
      <section id="safety" className="scroll-mt-24 py-20 border-b border-koraCharcoal-border relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-koraRed uppercase tracking-widest font-mono">
              Core Safety Commitment
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-koraOffWhite tracking-tight">
              Code verifies. <span className="font-showcase italic font-normal text-koraOffWhite">Gemini explains.</span> Human approves.
            </h2>
            <p className="text-xs sm:text-sm text-koraSecondary max-w-xl mx-auto leading-relaxed">
              Deterministic scanner rules own finding existence and severity. Grounded Gemini translates technical evidence into constructive contributor guides without inventing CVEs. External PR creation always requires human maintainer review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            <div className="p-5 rounded-2xl bg-koraCharcoal-dark/80 border border-koraCharcoal-border space-y-2 hover:border-koraRed/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border flex items-center justify-center text-koraOffWhite">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-koraSecondary bg-koraCharcoal-surface px-1.5 py-0.5 rounded border border-koraCharcoal-border">
                  INVARIANT // 01
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-koraOffWhite">1. Zero Code Execution</h3>
              <p className="text-xs text-koraSecondary leading-relaxed font-normal">
                Repository code is never executed. Scans operate purely as bounded static text parsers over public GitHub trees with strict byte and file bounds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-koraCharcoal-dark/80 border border-koraCharcoal-border space-y-2 hover:border-koraRed/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border flex items-center justify-center text-koraRed">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-koraRed/80 bg-koraCharcoal-surface px-1.5 py-0.5 rounded border border-koraCharcoal-border">
                  INVARIANT // 02
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-koraOffWhite">2. Strict Secret Masking</h3>
              <p className="text-xs text-koraSecondary leading-relaxed font-normal">
                Tokens, private keys, and credentials are automatically redacted with asterisks before database writes, UI display, or AI prompt calls.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-koraCharcoal-dark/80 border border-koraCharcoal-border space-y-2 hover:border-koraSlate/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-koraCharcoal-surface border border-koraCharcoal-border flex items-center justify-center text-koraSlate">
                  <GitPullRequest className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-koraSlate bg-koraCharcoal-surface px-1.5 py-0.5 rounded border border-koraCharcoal-border">
                  INVARIANT // 03
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-koraOffWhite">3. Manual PRs Only</h3>
              <p className="text-xs text-koraSecondary leading-relaxed font-normal">
                ContriBLens never calls GitHub write APIs. Contributors and maintainers review, polish, and submit all issue drafts and pull requests manually.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <Link
              href="/security"
              className="min-h-[44px] px-3 py-2 text-koraOffWhite hover:underline flex items-center gap-1.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded-lg"
            >
              <span>Security &amp; Disclosure Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-koraCharcoal-borderLight">{'//'}</span>
            <Link
              href="/privacy"
              className="min-h-[44px] px-3 py-2 text-koraSecondary hover:underline flex items-center gap-1.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded-lg"
            >
              <span>Privacy Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION H — FAQ ACCORDION
          ======================================================== */}
      <section id="faqs" className="scroll-mt-24 py-20 border-b border-koraCharcoal-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-koraRed uppercase tracking-widest block font-mono">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-koraOffWhite tracking-tight">
              Clear answers on safety, grounding, and ethics
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-koraCharcoal-border bg-koraCharcoal-surface/60 overflow-hidden transition-all"
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-btn-${idx}`}
                    aria-controls={`faq-answer-${idx}`}
                    aria-expanded={openFaq === idx}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full min-h-[48px] p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-koraOffWhite hover:text-koraRed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 pr-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-koraCharcoal-dark text-koraSecondary border border-koraCharcoal-border shrink-0 w-fit">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-koraSecondary shrink-0 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-koraRed' : ''
                      }`}
                    />
                  </button>
                </h3>
                {openFaq === idx && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-koraSecondary leading-relaxed border-t border-koraCharcoal-border pt-3 font-normal"
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
      <section className="py-20 relative overflow-hidden">
        
        {/* Ambient Smoky Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-koraBurgundy/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-koraRed uppercase tracking-widest block font-mono">
              Start Contributing Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-koraOffWhite tracking-tight">
              Ready to scan and contribute to open source?
            </h2>
            <p className="text-xs sm:text-sm text-koraSecondary max-w-lg mx-auto leading-relaxed">
              Scan your first public GitHub repository in seconds. Evidence-first, beginner-friendly, and maintainer-safe.
            </p>
          </div>

          {/* Quick Scan Input Widget */}
          <form
            onSubmit={handleQuickScan}
            className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl sm:rounded-full bg-koraCharcoal-surface border border-koraCharcoal-border shadow-liquid-glass backdrop-blur-xl focus-within:border-koraRed/60 transition-colors"
          >
            <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-koraSecondary shrink-0" />
              <input
                type="text"
                value={demoRepoInput}
                onChange={(e) => setDemoRepoInput(e.target.value)}
                placeholder="https://github.com/owner/repository"
                aria-label="Repository URL to scan"
                className="w-full min-h-[44px] bg-transparent text-xs sm:text-sm text-koraOffWhite placeholder-koraSecondary/60 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-full bg-koraRed hover:bg-koraRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed"
            >
              Scan Repository
            </button>
          </form>

          {/* Sample Shortcuts with min-h-[36px] */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-koraSecondary font-mono">Sample:</span>
            {sampleRepositories.map((repo) => (
              <button
                key={repo}
                type="button"
                onClick={() => setDemoRepoInput(`https://github.com/${repo}`)}
                className="min-h-[36px] px-3 py-1.5 rounded-full bg-koraCharcoal-card hover:bg-koraCharcoal-surface text-koraSecondary border border-koraCharcoal-border font-mono text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed"
              >
                {repo}
              </button>
            ))}
          </div>

          {/* Account CTAs with min-h-[46px] */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-koraRed hover:bg-koraRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed"
            >
              Sign up with Email &amp; Phone
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-koraCharcoal-surface hover:bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border font-semibold text-xs sm:text-sm transition-all backdrop-blur-md active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed"
            >
              Log in to Existing Account
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
