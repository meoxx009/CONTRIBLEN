'use client';

import React from 'react';
import { Search, CheckCircle2, Cpu, Compass } from 'lucide-react';

export interface StepItem {
  num: string;
  title: string;
  tagline: string;
  badge?: string;
  icon?: React.ElementType;
}

export interface GlassStepRailProps {
  steps?: StepItem[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  className?: string;
}

const DEFAULT_STEPS: StepItem[] = [
  {
    num: '01',
    title: 'Scan',
    tagline: 'Deterministic static analysis',
    badge: 'Zero Code Execution',
    icon: Search,
  },
  {
    num: '02',
    title: 'Verify',
    tagline: 'Evidence & OSV verification',
    badge: 'Zero AI Hallucination',
    icon: CheckCircle2,
  },
  {
    num: '03',
    title: 'Understand',
    tagline: 'Grounded Gemini explanations',
    badge: 'Strict Server Adapter',
    icon: Cpu,
  },
  {
    num: '04',
    title: 'Contribute',
    tagline: 'Actionable routes & drafts',
    badge: 'Maintainer Safe',
    icon: Compass,
  },
];

export function GlassStepRail({
  steps = DEFAULT_STEPS,
  currentStep,
  onStepChange,
  className = '',
}: GlassStepRailProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal Stepper Rail for Desktop */}
      <div className="hidden md:grid grid-cols-4 gap-4 relative">
        {/* Connecting Progress Line behind nodes */}
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-koraCharcoal-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-8 h-0.5 bg-gradient-to-r from-koraBurgundy via-koraRed to-koraOffWhite -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 82}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon || Search;
          const isCurrent = currentStep === idx;
          const isPassed = currentStep > idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange?.(idx)}
              className={`relative z-10 p-4 rounded-2xl text-left transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-koraBurgundy/30 border border-koraRed/60 shadow-glow-burgundy scale-[1.02]'
                  : isPassed
                  ? 'bg-koraCharcoal-card border border-emerald-500/30 text-koraOffWhite'
                  : 'bg-koraCharcoal-surface/60 border border-koraCharcoal-border text-koraSecondary hover:border-koraSlate/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xl font-mono font-bold ${isCurrent ? 'text-koraRed' : 'text-koraSecondary/50'}`}>
                  {step.num}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent
                    ? 'bg-koraRed/20 text-koraRed border border-koraRed/40'
                    : isPassed
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                    : 'bg-koraCharcoal-dark text-koraSecondary border border-koraCharcoal-border'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-sm font-heading font-bold text-koraOffWhite">{step.title}</h4>
                  {step.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-koraCharcoal-dark text-koraSecondary border border-koraCharcoal-border">
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-koraSecondary leading-snug line-clamp-2">
                  {step.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Vertical Stepper Rail for Mobile */}
      <div className="md:hidden space-y-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon || Search;
          const isCurrent = currentStep === idx;
          const isPassed = currentStep > idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange?.(idx)}
              className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-koraBurgundy/30 border border-koraRed/60 shadow-sm'
                  : isPassed
                  ? 'bg-koraCharcoal-card border border-emerald-500/30'
                  : 'bg-koraCharcoal-surface/60 border border-koraCharcoal-border text-koraSecondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base font-mono font-bold ${isCurrent ? 'text-koraRed' : 'text-koraSecondary/50'}`}>
                  {step.num}
                </span>
                <div>
                  <h4 className="text-xs font-heading font-bold text-koraOffWhite">{step.title}</h4>
                  <p className="text-[10px] text-koraSecondary">{step.tagline}</p>
                </div>
              </div>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isCurrent
                  ? 'bg-koraRed/20 text-koraRed'
                  : isPassed
                  ? 'bg-emerald-950/40 text-emerald-400'
                  : 'bg-koraCharcoal-dark text-koraSecondary'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
