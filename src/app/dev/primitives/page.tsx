'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  PasswordField,
  Badge,
  SeverityBadge,
  Card,
  CardHeader,
  ProgressBar,
  Tabs,
  Accordion,
  Toggle,
} from '@/components/ui';
import { Shield, Sparkles, Terminal, Lock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PrimitivesDeveloperPreviewPage() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [inputValue, setInputValue] = useState('https://github.com/expressjs/express');
  const [inputError, setInputError] = useState('');
  const [password, setPassword] = useState('ContribLens@2026!');
  const [progress, setProgress] = useState(65);
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);

  const previewTabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'inputs', label: 'Inputs & Passwords' },
    { id: 'badges', label: 'Badges & Severity' },
    { id: 'cards', label: 'Surfaces & Cards' },
    { id: 'navigation', label: 'Progress & Tabs' },
    { id: 'disclosure', label: 'Accordion & Toggles' },
  ];

  return (
    <div className="min-h-screen bg-black text-textPrimary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Developer Fixture Banner */}
        <div className="p-4 rounded-2xl bg-coffeeBean/90 border border-electricTangerine/40 flex items-start gap-3 shadow-glow-tangerine">
          <Terminal className="w-5 h-5 text-electricTangerine shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-electricTangerine">
                DEVELOPER FIXTURE PREVIEW
              </span>
              <span className="text-[10px] font-semibold bg-rosewood/40 text-rosewood border border-rosewood px-2 py-0.2 rounded-full">
                NON-PRODUCT DATA
              </span>
            </div>
            <p className="text-xs text-textMuted mt-1">
              Visual verification fixture for ContribLens OSS design system tokens, accessible primitives,
              and color scales from DESIGN.md.
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary flex items-center gap-3">
            ContribLens Design System Primitives
            <Badge variant="lemon" size="sm">Tokens v1.0</Badge>
          </h1>
          <p className="text-sm text-textMuted max-w-2xl">
            Pure Black / Black Hole surfaces, Electric Tangerine ambient accents, Lemon Chiffon safe actions,
            Rosewood critical states, Coffee Bean depth, and Sustainable Linen light document panels.
          </p>
        </div>

        {/* Primary Tabs Navigation */}
        <div className="overflow-x-auto no-scrollbar pb-2">
          <Tabs tabs={previewTabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* 1. BUTTONS */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <Card variant="widget">
              <CardHeader
                title="Button Variants & States"
                subtitle="Primary, secondary, ghost, danger, and safe-action variants"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Primary (Tangerine)</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg" icon={<Sparkles className="w-4 h-4" />}>Large</Button>
                    <Button variant="primary" loading>Loading</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Lemon Safe Action</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="lemon" size="sm">Small</Button>
                    <Button variant="lemon" size="md" icon={<ArrowRight className="w-4 h-4" />}>Sign Up</Button>
                    <Button variant="lemon" size="lg">Large Action</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Secondary & Ghost</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="md">Secondary</Button>
                    <Button variant="ghost" size="md">Ghost Button</Button>
                    <Button variant="secondary" disabled>Disabled</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Critical (Rosewood)</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="danger" size="md" icon={<AlertTriangle className="w-4 h-4" />}>
                      Delete Record
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 2. INPUTS & PASSWORDS */}
        {activeTab === 'inputs' && (
          <div className="space-y-8">
            <Card variant="widget">
              <CardHeader
                title="Input Controls & Password Fields"
                subtitle="Monospace repository inputs, password visibility toggles, and live strength meter"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-4xl">
                <Input
                  label="Repository URL"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  hint="Enter a valid public GitHub repository URL."
                  monospace
                />

                <Input
                  label="Validation Error State"
                  value="invalid-repo-format"
                  error="Repository must be a valid HTTPS GitHub URL."
                  monospace
                />

                <PasswordField
                  label="Password with Live Strength"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showStrengthMeter
                />

                <PasswordField
                  label="Password Error State"
                  value="123"
                  error="Password is too weak. Must contain at least 8 characters, numbers, and symbols."
                  showStrengthMeter
                />
              </div>
            </Card>
          </div>
        )}

        {/* 3. BADGES & SEVERITY */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            <Card variant="widget">
              <CardHeader
                title="Severity & Technology Badges"
                subtitle="Deterministic risk ratings, ecosystems, and technology tags"
              />
              <div className="space-y-6 pt-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-3">Severity Ratings</h4>
                  <div className="flex flex-wrap gap-3">
                    <SeverityBadge severity="CRITICAL" />
                    <SeverityBadge severity="HIGH" />
                    <SeverityBadge severity="MEDIUM" />
                    <SeverityBadge severity="LOW" />
                    <SeverityBadge severity="INFO" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-3">Technology & Status Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="tech">TypeScript</Badge>
                    <Badge variant="tech">Next.js 15</Badge>
                    <Badge variant="tech">Docker</Badge>
                    <Badge variant="lemon">Public Issue Allowed</Badge>
                    <Badge variant="critical">Disclosure Blocked</Badge>
                    <Badge variant="neutral">Read-only</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 4. CARDS & SURFACES */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardHeader title="Glass Surface (Default)" subtitle="Translucent Black Hole canvas with blur" />
              <p className="text-xs text-textMuted leading-relaxed">
                Used across authenticated views, finding inspection panels, and repository dashboards.
              </p>
            </Card>

            <Card variant="warm">
              <CardHeader title="Coffee Bean Ambient Surface" subtitle="Warm depth with Electric Tangerine glow" />
              <p className="text-xs text-textPrimary/80 leading-relaxed">
                Highlights security alerts, critical evidence cards, and featured contribution routes.
              </p>
            </Card>

            <Card variant="linen">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                  DOCUMENT PREVIEW SURFACE
                </span>
                <h4 className="text-base font-bold text-neutral-900">Sustainable Linen Panel</h4>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Used specifically for maintainer-ready Markdown issue drafts, code inspection blocks, and exportable reports.
                </p>
              </div>
            </Card>

            <Card variant="cotton">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                  ALTERNATIVE LIGHT SURFACE
                </span>
                <h4 className="text-base font-bold text-neutral-900">Recycled Cotton Surface</h4>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Warm editorial tint for accessibility contrasts and high-readability documentation.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 5. PROGRESS & TABS */}
        {activeTab === 'navigation' && (
          <div className="space-y-8">
            <Card variant="widget">
              <CardHeader
                title="Progress Bars & Metric Gauges"
                subtitle="Contribution readiness, scan progress, and score visualizers"
              />
              <div className="space-y-6 max-w-xl pt-2">
                <ProgressBar
                  value={progress}
                  label="Contribution Readiness Score"
                  variant="readiness"
                  showPercentage
                />

                <ProgressBar
                  value={85}
                  label="Scan Files Processed (51/60)"
                  variant="tangerine"
                  showPercentage
                />

                <ProgressBar
                  value={40}
                  label="Safe Action Progress"
                  variant="lemon"
                  showPercentage
                />

                <div className="pt-2 flex gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setProgress(Math.max(10, progress - 15))}>
                    Decrease Score
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setProgress(Math.min(95, progress + 15))}>
                    Increase Score
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 6. ACCORDION & TOGGLES */}
        {activeTab === 'disclosure' && (
          <div className="space-y-8">
            <Card variant="widget">
              <CardHeader
                title="Accordion & Accessibility Toggles"
                subtitle="Keyboard-accessible disclosure widgets and preference switches"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Interactive Accordion</h4>
                  <Accordion
                    items={[
                      {
                        id: 'acc-1',
                        title: 'Does ContribLens execute repository code?',
                        content:
                          'Never. ContribLens operates strictly as a read-only analyzer. Code is never built, installed, or executed in any environment.',
                        badge: <Badge variant="lemon" size="sm">Security Rule</Badge>,
                      },
                      {
                        id: 'acc-2',
                        title: 'How does Gamma 4 explain verified findings?',
                        content:
                          'Gamma 4 receives only pre-verified, redacted evidence bundles. It cannot invent findings or alter severity levels.',
                        badge: <Badge variant="tech" size="sm">Grounding</Badge>,
                      },
                    ]}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Preference Switches</h4>
                  <div className="p-4 rounded-xl bg-black border border-borderDark/60 space-y-2">
                    <Toggle
                      id="toggle-motion"
                      checked={toggleState1}
                      onChange={setToggleState1}
                      label="Reduced Motion Mode"
                      description="Honor system and user-selected animation damping"
                    />
                    <div className="h-px bg-borderDark/40" />
                    <Toggle
                      id="toggle-redact"
                      checked={toggleState2}
                      onChange={setToggleState2}
                      label="Strict Redaction Preview"
                      description="Mask high-entropy secrets and sensitive identifiers"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
