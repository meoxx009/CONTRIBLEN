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
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoRepoInput, setDemoRepoInput] = useState<string>('https://github.com/expressjs/express');

  // Auto-cycle through the 4 steps unless user interacts
  const [isAutoCycle, setIsAutoCycle] = useState(true);

  useEffect(() => {
    if (!isAutoCycle) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoCycle]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsAutoCycle(false);
  };

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoRepoInput.trim()) {
      router.push(`/scan?url=${encodeURIComponent(demoRepoInput.trim())}`);
    }
  };

  const processSteps = [
    {
      num: '01',
      title: 'Scan',
      tagline: 'Deterministic Static Analysis',
      badge: 'Zero Code Execution',
      desc: 'Connects to any public GitHub repository. Strictly read-only, checks dependency manifests, audits GitHub Actions workflows, masks credentials, and tests governance health without executing code.',
      icon: Search,
      evidenceSnippet: 'npm audit • package.json • .github/workflows/*.yml',
      highlightColor: 'from-electricTangerine to-lemonChiffon',
    },
    {
      num: '02',
      title: 'Verify',
      tagline: 'Evidence & OSV Verification',
      badge: 'Zero AI Hallucination',
      desc: 'Cryptographically hashes evidence snippets and cross-references published CVEs using the OSV.dev batch API. The deterministic scanner is the sole source of truth for finding existence and severity.',
      icon: CheckCircle2,
      evidenceSnippet: 'OSV Batch Query • SHA-256 Evidence Hash: e3b0c44298fc...',
      highlightColor: 'from-botticelli to-platinumSilver',
    },
    {
      num: '03',
      title: 'Understand',
      tagline: 'Grounded Gemini Explanations',
      badge: 'Strict Server Adapter',
      desc: 'Server-side Gemini adapter translates raw technical findings into beginner-friendly, educational context. Explanations are strictly anchored to verified file paths, line numbers, and redacted evidence.',
      icon: Cpu,
      evidenceSnippet: 'Anchored line 18 • Plain-English impact • Required skills',
      highlightColor: 'from-paleLavender to-lemonChiffon',
    },
    {
      num: '04',
      title: 'Contribute',
      tagline: 'Actionable Routes & Issue Drafts',
      badge: 'Maintainer Safe',
      desc: 'Contributors receive structured plans with required skills, target files, and test criteria. Maintainers receive polite, reviewable Markdown issue drafts ready for manual review and publishing.',
      icon: Compass,
      evidenceSnippet: 'Readiness: 88/100 • 8-Section Markdown Draft • Human PR',
      highlightColor: 'from-lemonChiffon to-electricTangerine',
    },
  ];

  const features = [
    {
      title: 'Evidence-First Security Scanner',
      desc: 'Deterministic rules govern finding existence, severity, and confidence. Real published CVEs from OSV.dev are verified without allowing AI to invent security claims.',
      tag: 'Zero Invented CVEs',
      color: 'border-platinumSilver/25',
      icon: Shield,
    },
    {
      title: 'Beginner-Friendly Onboarding',
      desc: 'Bite-sized contributor tasks sorted by difficulty with estimated effort, required skills, and clear test plans so newcomers never feel overwhelmed.',
      tag: 'Skills & Test Plans',
      color: 'border-lemonChiffon/30',
      icon: Compass,
    },
    {
      title: 'Maintainer-Safe Issue Drafts',
      desc: 'Pre-drafted, structured Markdown issues prevent friction. ContribLens never auto-publishes issues or PRs: human maintainer review is strictly enforced.',
      tag: 'Human in the Loop',
      color: 'border-paleLavender/30',
      icon: FileText,
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
      a: 'Never. ContribLens operates under a strict manual publishing model. Issue drafts can be previewed, edited, copied, or downloaded as Markdown files, but cannot be automatically submitted to external GitHub repositories without human maintainer approval.',
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
          HERO SECTION: Atmospheric Depth, Metallic Chrome Lens & Interactive 4-Stage Preview
          ======================================================== */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Layered Atmospheric Ambient Lighting */}
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] h-[600px] bg-gradient-to-b from-electricTangerine/20 via-coffeeBean/35 to-transparent rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-[250px] -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-mochaBrown/25 via-paleLavender/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[350px] -right-40 w-[550px] h-[550px] bg-gradient-to-tl from-platinumSilver/15 via-electricTangerine/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left: Value Proposition, Editorial Branding & High-Impact CTAs (Col span 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Liquid Chrome Editorial Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-chrome-pill text-xs font-medium text-platinumSilver shadow-sm">
              <span className="w-2 h-2 rounded-full bg-electricTangerine animate-pulse" />
              <span className="font-semibold text-lemonChiffon">ContribLens OSS</span>
              <span className="text-platinumSilver/40">•</span>
              <span className="text-paleLavender">Scan. Understand. Contribute.</span>
            </div>

            {/* Editorial Headline with Liquid Chrome & Tangerine Gradient */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-textPrimary leading-[1.08]">
              From security risk to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-platinumSilver via-lemonChiffon to-electricTangerine">
                safe contribution.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-platinumSilver/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ContribLens scans public GitHub repositories, verifies dependency and workflow findings with deterministic evidence, explains them with grounded Gemini in plain English, and produces beginner-friendly contribution packs and maintainer issue drafts.
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
                href="#live-preview"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-platinumSilver border border-platinumSilver/30 font-semibold text-sm transition-all backdrop-blur-md shadow-liquid-glass flex items-center justify-center gap-2 group active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-lemonChiffon fill-lemonChiffon/30 group-hover:scale-110 transition-transform" />
                <span>Explore 4-Stage Journey</span>
              </a>
            </div>

            {/* Interactive Pipeline Formula Stepper */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-mono">
              <span className="text-textMuted/70">Evidence Chain:</span>
              <button
                onClick={() => handleStepClick(0)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  activeStep === 0
                    ? 'bg-electricTangerine/20 border-electricTangerine text-electricTangerine font-bold shadow-sm'
                    : 'bg-black/40 border-platinumSilver/15 text-platinumSilver/70 hover:text-platinumSilver'
                }`}
              >
                1. Scan
              </button>
              <span className="text-platinumSilver/30">→</span>
              <button
                onClick={() => handleStepClick(1)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  activeStep === 1
                    ? 'bg-botticelli/20 border-botticelli text-botticelli font-bold shadow-sm'
                    : 'bg-black/40 border-platinumSilver/15 text-platinumSilver/70 hover:text-platinumSilver'
                }`}
              >
                2. Verify
              </button>
              <span className="text-platinumSilver/30">→</span>
              <button
                onClick={() => handleStepClick(2)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  activeStep === 2
                    ? 'bg-paleLavender/20 border-paleLavender text-paleLavender font-bold shadow-sm'
                    : 'bg-black/40 border-platinumSilver/15 text-platinumSilver/70 hover:text-platinumSilver'
                }`}
              >
                3. Understand
              </button>
              <span className="text-platinumSilver/30">→</span>
              <button
                onClick={() => handleStepClick(3)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  activeStep === 3
                    ? 'bg-lemonChiffon/20 border-lemonChiffon text-lemonChiffon font-bold shadow-sm'
                    : 'bg-black/40 border-platinumSilver/15 text-platinumSilver/70 hover:text-platinumSilver'
                }`}
              >
                4. Contribute
              </button>
            </div>

            {/* Intentional Floating Metric Chips (Replacing debug-like labels) */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] text-platinumSilver/90 font-medium">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Deterministic</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-electricTangerine shrink-0" />
                <span>OSV.dev Verified</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-paleLavender shrink-0" />
                <span>Grounded Gemini</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-platinumSilver/15 backdrop-blur-md flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-lemonChiffon shrink-0" />
                <span>Zero Execution</span>
              </div>
            </div>

          </div>

          {/* Right: Interactive 4-Stage Product Preview Panel (Col span 5) */}
          <div className="lg:col-span-5" id="live-preview">
            <div className="liquid-glass-hero p-6 sm:p-7 rounded-3xl space-y-5 relative group">
              
              {/* Metallic Specular Highlight Header */}
              <div className="flex items-center justify-between pb-4 border-b border-platinumSilver/15">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full liquid-chrome-orb flex items-center justify-center shadow-md">
                    <Shield className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-lemonChiffon flex items-center gap-1.5">
                      <span>expressjs/express</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <span className="text-[10px] text-textMuted font-mono">Branch: master • 18 verified files</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 shadow-sm">
                    Readiness: 88/100
                  </span>
                </div>
              </div>

              {/* 4 Interactive Step Selector Pills */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/60 border border-platinumSilver/15 text-[11px] font-mono">
                {processSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                      activeStep === idx
                        ? 'bg-white/15 text-lemonChiffon font-bold border border-platinumSilver/30 shadow-sm'
                        : 'text-platinumSilver/60 hover:text-platinumSilver'
                    }`}
                  >
                    {step.title}
                  </button>
                ))}
              </div>

              {/* Dynamic Interactive Stage Body */}
              <div className="min-h-[260px] flex flex-col justify-between">
                {activeStep === 0 && (
                  /* STAGE 1: SCAN */
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3.5 rounded-xl bg-black/70 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-electricTangerine font-semibold">STAGE 1: STATIC SCAN</span>
                        <span className="text-platinumSilver/60">Strictly Read-Only</span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px] text-platinumSilver/90 bg-black/80 p-2.5 rounded-lg border border-white/5">
                        <p className="text-emerald-400">✓ Parsed package.json (42 dependencies)</p>
                        <p className="text-emerald-400">✓ Scanned .github/workflows/ci.yml</p>
                        <p className="text-electricTangerine">! Identified write-all permission grant</p>
                        <p className="text-platinumSilver/60">ℹ Redacted 0 secrets (zero credentials exposed)</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-coffeeBean/70 border border-electricTangerine/30 flex items-center justify-between text-xs">
                      <span className="text-textPrimary font-medium">Deterministic Rule Triggered</span>
                      <span className="px-2 py-0.5 rounded bg-rosewood text-white font-mono text-[10px] font-bold">
                        GH-ACTIONS-WRITE-ALL
                      </span>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  /* STAGE 2: VERIFY */
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3.5 rounded-xl bg-black/70 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-botticelli font-semibold">STAGE 2: OSV &amp; EVIDENCE HASH</span>
                        <span className="text-lemonChiffon font-mono">Confidence: 98%</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px] bg-black/80 p-2.5 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-textMuted">OSV Batch API:</span>
                          <span className="text-emerald-400">Verified CVE-2024-XXXX</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-textMuted">SHA-256 Hash:</span>
                          <span className="text-lemonChiffon font-mono">8f4c2e...b91a</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-textMuted">Source Tool:</span>
                          <span className="text-platinumSilver">Deterministic YAML Auditor</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blackHole border border-botticelli/30 flex items-center justify-between text-xs">
                      <span className="text-platinumSilver font-medium">Invariant Check</span>
                      <span className="text-lemonChiffon font-mono text-[10px]">Zero AI Inventions</span>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  /* STAGE 3: UNDERSTAND */
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3.5 rounded-xl bg-black/70 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-paleLavender font-semibold">STAGE 3: GROUNDED GEMINI EXPLANATION</span>
                        <span className="text-lemonChiffon text-[10px]">Anchored: L18</span>
                      </div>
                      <div className="text-xs text-platinumSilver/90 leading-relaxed bg-black/80 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                        <p className="font-semibold text-lemonChiffon">What this means in plain English:</p>
                        <p className="text-[11px] text-platinumSilver/80">
                          &quot;The CI workflow grants unrestricted write permissions to every repository asset. If a compromised dependency runs in CI, it could modify pull request comments or releases.&quot;
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-coffeeBean/60 border border-paleLavender/30 flex items-center justify-between text-xs">
                      <span className="text-textPrimary font-medium">Required Skill</span>
                      <span className="px-2 py-0.5 rounded bg-black text-paleLavender font-mono text-[10px] border border-paleLavender/30">
                        GitHub Actions • YAML
                      </span>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  /* STAGE 4: CONTRIBUTE */
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3.5 rounded-xl bg-black/70 border border-platinumSilver/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-lemonChiffon font-semibold">STAGE 4: ACTIONABLE CONTRIBUTION</span>
                        <span className="text-emerald-400 text-[10px]">Beginner • 25m</span>
                      </div>
                      <div className="space-y-1.5 text-[11px] bg-black/80 p-2.5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-1.5 text-lemonChiffon font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Actionable Route: Scope permissions</span>
                        </div>
                        <p className="text-textMuted text-[10px]">
                          Target: <code className="text-platinumSilver font-mono">.github/workflows/ci.yml:18</code>
                        </p>
                        <p className="text-textMuted text-[10px]">
                          Acceptance Criteria: Change <code className="text-rosewood">permissions: write-all</code> to <code className="text-emerald-400">contents: read</code>
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-coffeeBean/70 border border-lemonChiffon/30 flex items-center justify-between text-xs">
                      <span className="text-lemonChiffon font-medium">Maintainer Issue Draft</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black text-platinumSilver font-mono text-[10px] border border-borderDark">
                        Manual PR Only
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Status Bar Footer */}
                <div className="pt-3 flex items-center justify-between text-[11px] text-textMuted border-t border-platinumSilver/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-electricTangerine" />
                    <span>Evidence Chain 4-Step Pipeline</span>
                  </div>
                  <button
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
          SECTION 1: THE 4-STEP WORKFLOW (Redesigned with Clear Flow & Progress)
          ======================================================== */}
      <section id="process" className="py-24 border-t border-platinumSilver/15 relative bg-gradient-to-b from-blackHole/40 via-black to-blackHole/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block">
              The Evidence-First Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight">
              From cold security findings to safe maintainer pull requests
            </h2>
            <p className="text-platinumSilver/80 text-sm sm:text-base leading-relaxed">
              Every step is bounded by verifiable invariants: static parsing without code execution, OSV CVE verification, grounded AI explanations, and human-in-the-loop maintainer drafts.
            </p>
          </div>

          {/* Connected 4-Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="liquid-glass-card p-6 rounded-2xl relative space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-mono font-bold text-lemonChiffon/30 group-hover:text-lemonChiffon transition-colors">
                        {step.num}
                      </span>
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coffeeBean to-black border border-platinumSilver/25 flex items-center justify-center text-electricTangerine group-hover:scale-105 transition-all shadow-sm">
                        <Icon className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,109,31,0.5)]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-textPrimary group-hover:text-lemonChiffon transition-colors">
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

                  {/* Concrete Evidence Snippet */}
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
          SECTION 2: CORE FEATURES (Engineered for Open-Source Safety)
          ======================================================== */}
      <section id="features" className="py-24 border-t border-platinumSilver/15 relative">
        
        {/* Subtle Ambient Refraction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-mochaBrown/15 via-paleLavender/10 to-electricTangerine/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block">
              Engineered for Open-Source Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Features built for contributors and maintainers
            </h2>
            <p className="text-platinumSilver/80 text-sm">
              We bridge the gap between complex security audits and actionable beginner pull requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="liquid-glass-card p-7 rounded-2xl space-y-4 hover:border-lemonChiffon/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffeeBean via-black to-blackHole border border-platinumSilver/30 flex items-center justify-center text-electricTangerine shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-textPrimary">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-platinumSilver/80 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-block text-xs font-mono text-lemonChiffon px-3 py-1 rounded-full bg-black/60 border border-lemonChiffon/30 shadow-inner">
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
          SECTION 3: THREE CORE INVARIANTS & ETHICAL GUARANTEES
          ======================================================== */}
      <section id="safety" className="py-24 border-t border-platinumSilver/15 bg-gradient-to-b from-blackHole/30 to-black relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest">
              Core Safety Invariants
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
                <Shield className="w-4 h-4" />
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

        </div>
      </section>

      {/* ========================================================
          SECTION 4: FAQ ACCORDION (Upgraded Liquid Glass Accordions)
          ======================================================== */}
      <section id="faqs" className="py-24 border-t border-platinumSilver/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block">
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
          SECTION 5: FINALE CALL TO ACTION (Grand Editorial Terminal)
          ======================================================== */}
      <section className="py-24 border-t border-platinumSilver/20 relative overflow-hidden bg-gradient-to-b from-coffeeBean/40 via-blackHole to-black">
        
        {/* Ambient Warm Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-electricTangerine/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-electricTangerine/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block">
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
