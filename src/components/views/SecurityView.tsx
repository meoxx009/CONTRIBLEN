'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  Cpu,
  FileCheck2,
  UserCheck,
  Lock,
  EyeOff,
} from 'lucide-react';

export default function SecurityModelPage() {
  return (
    <div className="min-h-screen bg-koraBg text-koraOffWhite py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Smoky Ambient Backdrop Overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-koraBurgundy/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[300px] bg-koraSlate/25 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-koraSecondary hover:text-koraOffWhite transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 rounded-xl bg-koraBurgundy/30 border border-koraRed/40 text-koraRed">
              <Shield className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-koraRed">
              ContribLens OSS Security &amp; Safety Model
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-koraOffWhite tracking-tight">
            Security Guarantees &amp; Responsible Disclosure
          </h1>
          <p className="mt-2 text-sm text-koraSecondary leading-relaxed">
            ContribLens adheres to a strict non-negotiable safety invariant:
            <strong className="text-koraOffWhite block mt-1 font-semibold">
              Code verifies. <span className="font-showcase italic font-normal text-koraOffWhite">Gamma 4 explains.</span> Human approves.
            </strong>
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-2">
            <Cpu className="w-6 h-6 text-koraRed" />
            <h3 className="text-sm font-heading font-semibold text-koraOffWhite">1. Code Verifies</h3>
            <p className="text-xs text-koraSecondary leading-relaxed">
              Vulnerabilities and security risks are detected solely by deterministic parsers and official OSV.dev advisories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-2">
            <FileCheck2 className="w-6 h-6 text-koraOffWhite" />
            <h3 className="text-sm font-heading font-semibold text-koraOffWhite">2. Gamma 4 Explains</h3>
            <p className="text-xs text-koraSecondary leading-relaxed">
              AI translates validated evidence into beginner-friendly guidance. AI cannot invent CVEs or inflate severities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl backdrop-blur-xl space-y-2">
            <UserCheck className="w-6 h-6 text-koraSlate" />
            <h3 className="text-sm font-heading font-semibold text-koraOffWhite">3. Human Approves</h3>
            <p className="text-xs text-koraSecondary leading-relaxed">
              No automatic pull requests or public issue spam. Maintainers review, verify, and publish issue drafts manually.
            </p>
          </div>
        </div>

        {/* What ContribLens Scans vs What It Does Not Scan */}
        <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl space-y-6">
          <h2 className="text-base font-heading font-semibold text-koraOffWhite uppercase tracking-wider">
            Repository Scanning Scope &amp; Safety Boundaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-emerald-500/30 space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">What ContribLens Scans:</span>
              <ul className="space-y-1.5 text-koraSecondary list-disc pl-3">
                <li>Public GitHub repositories accessible over HTTPS.</li>
                <li>Dependency manifests (package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml, etc.).</li>
                <li>CI/CD workflows (.github/workflows/*.yml) for permission misconfigurations.</li>
                <li>Community governance health files (SECURITY.md, LICENSE, README, CONTRIBUTING.md).</li>
                <li>Bounded text/configuration files strictly under 60 files, 180 KB per file, and 3 MB total.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraRed/40 space-y-2">
              <span className="font-bold text-koraRed block text-sm">What ContribLens NEVER Scans:</span>
              <ul className="space-y-1.5 text-koraSecondary list-disc pl-3">
                <li>Private GitHub repositories without explicit authenticated authorization.</li>
                <li>Binary files, compiled executables, or compressed archives (.exe, .wasm, .zip, .tar).</li>
                <li>Vendor and build directories (node_modules, vendor, dist, .next, target, build).</li>
                <li>Arbitrary non-GitHub URLs (strictly protected against SSRF attacks).</li>
                <li>Local developer machines or network environments.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zero Code Execution & Secret Redaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-koraRed">
              <Lock className="w-5 h-5" />
              <h3 className="text-sm font-heading font-bold text-koraOffWhite uppercase tracking-wider">
                Zero Code Execution Guarantee
              </h3>
            </div>
            <p className="text-xs text-koraSecondary leading-relaxed">
              ContribLens operates purely as an in-memory AST and text parser. Repository code, test suites, and install scripts are never executed dynamically. This completely prevents arbitrary remote code execution.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-koraOffWhite">
              <EyeOff className="w-5 h-5 text-koraRed" />
              <h3 className="text-sm font-heading font-bold text-koraOffWhite uppercase tracking-wider">
                Strict Secret Masking
              </h3>
            </div>
            <p className="text-xs text-koraSecondary leading-relaxed">
              Potential API tokens, AWS keys, GitHub PATs, and private credentials are masked immediately in memory using deterministic regex redaction. Raw secret values are never persisted, never logged, and never transmitted to Gemini.
            </p>
          </div>
        </div>

        {/* GitHub Tokens & Gemini Grounding Invariants */}
        <div className="p-6 sm:p-8 rounded-2xl bg-koraCharcoal-surface/90 border border-koraCharcoal-border shadow-xl space-y-6">
          <h2 className="text-base font-heading font-semibold text-koraOffWhite uppercase tracking-wider">
            Token Isolation &amp; Responsible Disclosure Policy
          </h2>

          <div className="space-y-4 text-xs text-koraSecondary leading-relaxed">
            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-1">
              <span className="font-bold text-koraOffWhite block">How GitHub Tokens Are Used:</span>
              <p>
                The optional <code className="text-koraRed font-mono">GITHUB_TOKEN</code> is used exclusively server-side to improve GitHub REST API rate limits. It is never sent to the browser, never printed in logs, and operates solely with read-only permissions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-1">
              <span className="font-bold text-koraOffWhite block">Why Gemini Receives Only Sanitized Context:</span>
              <p>
                Gemini functions strictly as an educational translation layer. Prompts are validated against strict JSON schemas and contain only redacted evidence, finding IDs, and file paths. If Gemini is unavailable, deterministic rule-based templates activate automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-koraCharcoal-dark border border-koraCharcoal-border space-y-1">
              <span className="font-bold text-koraOffWhite block">Public Issue Draft Blocking for Sensitive Secrets:</span>
              <p>
                Findings classified as secrets or sensitive security disclosures return <code className="text-koraRed font-mono">DISCLOSURE_BLOCKED</code> (HTTP 403). ContribLens enforces responsible disclosure by prohibiting public issue drafts for sensitive vulnerabilities, directing maintainers to their private security channels.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-koraRed hover:bg-koraRed-hover text-white font-semibold text-xs transition-colors shadow-glow-red"
          >
            Start a Safe Repository Scan
          </Link>
        </div>
      </div>
    </div>
  );
}
