'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const processSteps = [
    {
      num: '01',
      title: 'Scan',
      tagline: 'Deterministic static analysis',
      desc: 'Connects to any public GitHub repository. Strictly read-only, checks dependency manifests, audits GitHub Actions workflows, masks credentials, and tests governance health without running code.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Verify',
      tagline: 'Evidence & OSV verification',
      desc: 'Cryptographically hashes evidence snippets and cross-references published CVEs using the OSV.dev batch API. Zero hallucinated vulnerabilities: the deterministic scanner is the sole source of truth.',
      icon: CheckCircle2,
    },
    {
      num: '03',
      title: 'Understand',
      tagline: 'Grounded Gemini explanations',
      desc: 'Server-side Gemini adapter translates raw technical findings into beginner-friendly, educational context. Explanations are strictly anchored to verified file paths, line numbers, and redacted evidence.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Contribute',
      tagline: 'Actionable routes & issue drafts',
      desc: 'Contributors receive structured plans with required skills, target files, and test criteria. Maintainers receive polite, reviewable Markdown issue drafts ready for manual review and publishing.',
      icon: Compass,
    },
  ];

  const features = [
    {
      title: 'Evidence-First Security',
      desc: 'Scanner rules govern finding existence, severity, and confidence. Real published CVEs from OSV.dev are verified without allowing AI to invent security claims.',
      tag: 'Zero Invented CVEs',
      color: 'border-electricTangerine/30',
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
      title: 'Maintainer-Safe Verification',
      desc: 'Pre-drafted, structured Markdown issues prevent friction. ContribLens never auto-publishes issues or PRs: human maintainer review is strictly enforced.',
      tag: 'Human in the Loop',
      color: 'border-botticelli/30',
      icon: FileText,
    },
  ];

  const faqs = [
    {
      q: 'How does ContribLens prevent Gemini from hallucinating vulnerabilities?',
      a: 'Gemini operates through a server-side adapter bound by strict grounding guardrails: it is never permitted to declare a vulnerability independently or alter deterministic severities. Every prompt is tied to an existing finding ID and verified, redacted evidence. If the model is unreachable, a robust deterministic fallback engine steps in seamlessly.',
    },
    {
      q: 'Does ContribLens ever execute repository code during a scan?',
      a: 'Never. Scans are strictly read-only, sandboxed, and bounded by a 60-file limit and byte caps. Manifests, YAML workflows, and health files are parsed purely statically, completely eliminating arbitrary code execution risks.',
    },
    {
      q: 'Does ContribLens automatically post issues or pull requests to GitHub?',
      a: 'Never. ContribLens operates under a strict manual publishing model. Issue drafts can be previewed, edited, copied, or downloaded as Markdown files, but cannot be automatically submitted to external GitHub repositories.',
    },
    {
      q: 'How are exposed secrets safely handled?',
      a: 'ContribLens features a deterministic redaction engine that masks API keys, AWS credentials, Slack webhooks, and private keys with asterisks before storage, UI display, model prompts, or export.',
    },
    {
      q: 'What visual design system does ContribLens use?',
      a: 'ContribLens uses a student-friendly, professional visual design system featuring Pure Black (#000000), Black Hole (#222222), Coffee Bean (#2D120D), Electric Tangerine (#FF6D1F), Lemon Chiffon (#FFF8CA), Sustainable Linen (#FAF3E1), Recycled Cotton (#F5E7C6), and Botticelli (#CDE3E8).',
    },
    {
      q: 'What types of repositories can I scan?',
      a: 'Any public HTTPS GitHub repository. The engine is optimized for JavaScript/TypeScript (npm), Python (pip/poetry), GitHub Actions workflows, and community repository health.',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-black text-textPrimary overflow-hidden">
      
      {/* Hero Section with Tangerine Arc & Floating Context Cards */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Large Ambient Electric Tangerine Arc / Glow */}
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[480px] bg-gradient-to-b from-electricTangerine/25 via-coffeeBean/40 to-transparent rounded-[100%] blur-[90px] pointer-events-none" />

        {/* Floating Decorative Faded GitHub / Git / Code Cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-[8%] p-3 rounded-xl bg-blackHole/60 border border-borderDark text-[11px] font-mono text-textMuted/40 backdrop-blur-sm animate-float-slow hidden lg:block">
            <div className="flex items-center gap-1.5 mb-1 text-electricTangerine/60">
              <GitBranch className="w-3.5 h-3.5" /> git status
            </div>
            <span>clean working tree • read-only</span>
          </div>

          <div className="absolute bottom-28 left-[12%] p-3 rounded-xl bg-blackHole/60 border border-borderDark text-[11px] font-mono text-textMuted/40 backdrop-blur-sm animate-float-delayed hidden lg:block">
            <span className="text-lemonChiffon/60">OSV.dev Batch Query</span>
            <div className="text-[10px] text-textMuted/30">express@4.17.1 → GHSA-verified</div>
          </div>

          <div className="absolute top-36 right-[7%] p-3 rounded-xl bg-blackHole/60 border border-borderDark text-[11px] font-mono text-textMuted/40 backdrop-blur-sm animate-float-delayed hidden lg:block">
            <span className="text-electricTangerine/60">Deterministic Redaction</span>
            <div className="text-[10px] text-textMuted/30">ghp_****************32a1</div>
          </div>

          <div className="absolute bottom-24 right-[10%] p-3 rounded-xl bg-blackHole/60 border border-borderDark text-[11px] font-mono text-textMuted/40 backdrop-blur-sm animate-float-slow hidden lg:block">
            <span className="text-botticelli/60">Human Review Required</span>
            <div className="text-[10px] text-textMuted/30">Manual PR • Zero auto-publish</div>
          </div>
        </div>

        {/* Hero Content Grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left: Value Proposition & CTAs (Col span 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blackHole border border-borderDark text-lemonChiffon text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-electricTangerine" />
              <span>ContribLens OSS — Scan. Understand. Contribute.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-textPrimary leading-tight">
              From security risk to safe contribution.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lemonChiffon via-recycledCotton to-electricTangerine">
                Scan. Understand. Contribute.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-textMuted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ContribLens helps beginners discover meaningful open-source contribution opportunities by scanning public GitHub repositories, verifying findings, explaining them in plain English, and creating actionable contribution plans.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/scan"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-bold text-sm transition-all shadow-lg hover:shadow-lemonChiffon/20 flex items-center justify-center gap-2"
              >
                Scan a Repository <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/#process"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-blackHole hover:bg-blackHole/80 text-textPrimary border border-borderDark font-semibold text-sm transition-colors"
              >
                See how it works
              </Link>
            </div>

            {/* Formula Banner */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-mono text-textMuted">
              <span className="text-electricTangerine font-semibold">1. Scan</span>
              <span>→</span>
              <span className="text-botticelli font-semibold">2. Verify</span>
              <span>→</span>
              <span className="text-lemonChiffon font-semibold">3. Understand</span>
              <span>→</span>
              <span className="text-electricTangerine font-semibold">4. Contribute</span>
            </div>

          </div>

          {/* Right: Glass Scan Preview Widget (Col span 5) */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 rounded-2xl shadow-glass-card space-y-4 border border-borderDark">
              
              <div className="flex items-center justify-between pb-3 border-b border-borderDark">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rosewood animate-ping" />
                  <span className="text-xs font-mono font-medium text-textPrimary">
                    expressjs/express
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-coffeeBean text-lemonChiffon border border-lemonChiffon/20">
                  Readiness: 85/100
                </span>
              </div>

              {/* Sample Finding Widget */}
              <div className="p-3.5 rounded-xl bg-black border border-borderDark space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-rosewood text-textPrimary font-bold text-[10px]">
                    HIGH
                  </span>
                  <span className="font-mono text-textMuted text-[10px]">.github/workflows/ci.yml:18</span>
                </div>
                <div className="text-xs font-semibold text-textPrimary">
                  Overly Permissive Workflow: write-all declared
                </div>
                <p className="text-[11px] text-textMuted leading-relaxed">
                  Permissions grant unrestricted write access to repository contents and pull requests.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-lemonChiffon font-mono">Confidence: 98%</span>
                  <span className="text-electricTangerine font-mono">Verified Deterministic Rule</span>
                </div>
              </div>

              {/* Contributor Route Pill */}
              <div className="p-3 rounded-xl bg-coffeeBean/70 border border-electricTangerine/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-electricTangerine uppercase font-mono block">Actionable Plan</span>
                  <span className="text-textPrimary font-medium">Declare explicit minimal permissions</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-black text-lemonChiffon font-mono text-[10px] border border-lemonChiffon/30">
                  Beginner • 25m
                </span>
              </div>

              {/* Security Invariants Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-textMuted/80 border-t border-borderDark">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-lemonChiffon" /> Zero code execution
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-electricTangerine" /> Manual PR only
                </span>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* Section 1: The 4-Step Process */}
      <section id="process" className="py-20 border-t border-borderDark bg-blackHole/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block mb-2">
              The 4-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              From cold security findings to safe maintainer pull requests
            </h2>
            <p className="mt-3 text-textMuted text-sm">
              ContribLens combines deterministic static analysis with grounded AI explanations so beginners contribute with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-borderDark relative space-y-4 hover:border-lemonChiffon/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-lemonChiffon/30 group-hover:text-lemonChiffon transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-borderDark flex items-center justify-center text-electricTangerine group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-textPrimary group-hover:text-lemonChiffon transition-colors">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-mono text-electricTangerine block mt-0.5">
                      {step.tagline}
                    </span>
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 2: Core Features */}
      <section id="features" className="py-20 border-t border-borderDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-lemonChiffon uppercase tracking-widest block mb-2">
              Engineered for Open-Source Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Features built for contributors and maintainers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-borderDark space-y-4 hover:border-lemonChiffon/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-coffeeBean border border-borderDark flex items-center justify-center text-electricTangerine">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-textPrimary">{feat.title}</h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    {feat.desc}
                  </p>
                  <span className="inline-block text-[11px] font-mono text-lemonChiffon px-2.5 py-0.5 rounded-full bg-black border border-borderDark">
                    {feat.tag}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 3: Safety & Guarantees */}
      <section id="safety" className="py-20 border-t border-borderDark bg-blackHole/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest">
            Core Safety Commitment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            Code verifies. Gemini explains. Human approves.
          </h2>
          <p className="text-sm text-textMuted max-w-xl mx-auto leading-relaxed">
            Deterministic scanner rules own finding existence and severity. Gemini translates technical evidence into constructive contributor guides without inventing CVEs. External PR creation always requires human review.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            <div className="p-4 rounded-xl bg-coffeeBean border border-borderDark">
              <span className="font-bold text-xs text-textPrimary block mb-1">1. Zero Code Execution</span>
              <p className="text-[11px] text-textMuted">
                Repository code is never executed. Scans operate purely as bounded static text parsers over public GitHub trees.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-coffeeBean border border-borderDark">
              <span className="font-bold text-xs text-textPrimary block mb-1">2. Strict Secret Masking</span>
              <p className="text-[11px] text-textMuted">
                Tokens, private keys, and credentials are redacted with asterisks before database writes or AI prompt calls.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-coffeeBean border border-borderDark">
              <span className="font-bold text-xs text-textPrimary block mb-1">3. Manual PRs Only</span>
              <p className="text-[11px] text-textMuted">
                ContribLens never calls GitHub write APIs. Maintainers review and submit all issue drafts manually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: FAQ Accordion */}
      <section id="faqs" className="py-20 border-t border-borderDark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-electricTangerine uppercase tracking-widest block mb-2">
              FAQs
            </span>
            <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-borderDark overflow-hidden"
              >
                <h3>
                  <button
                    id={`faq-btn-${idx}`}
                    aria-controls={`faq-answer-${idx}`}
                    aria-expanded={openFaq === idx}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-semibold text-textPrimary hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded-xl"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-botticelli transition-transform ${
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
                    className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-textMuted leading-relaxed border-t border-borderDark pt-3"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Section 5: Final CTA */}
      <section className="py-20 bg-coffeeBean border-t border-borderDark text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary">
            Ready to scan and contribute to open source?
          </h2>
          <p className="text-sm text-textMuted max-w-lg mx-auto">
            Scan your first public GitHub repository in seconds. Evidence-first, beginner-friendly, and maintainer-safe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full bg-lemonChiffon hover:bg-sustainableLinen text-black font-semibold text-sm transition-all shadow-lg hover:shadow-lemonChiffon/20"
            >
              Sign up with Email &amp; Phone
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-black hover:bg-blackHole text-textPrimary border border-borderDark font-semibold text-sm transition-colors"
            >
              Log in to Existing Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
