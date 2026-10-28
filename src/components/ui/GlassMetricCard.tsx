'use client';

import React from 'react';

export interface GlassMetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isPrimary?: boolean;
}

export function GlassMetricCard({
  value,
  label,
  icon,
  badge,
  isPrimary = false,
  className = '',
  ...props
}: GlassMetricCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl flex items-center justify-between gap-3 border transition-all ${
        isPrimary
          ? 'bg-koraBurgundy/25 border-koraRed/40 text-koraOffWhite shadow-glow-burgundy'
          : 'bg-koraCharcoal-surface/85 border-koraCharcoal-border text-koraOffWhite hover:border-koraRed/30'
      } ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isPrimary
              ? 'bg-koraBurgundy/50 border border-koraRed/40 text-koraRed'
              : 'bg-koraCharcoal-dark border border-koraCharcoal-border text-koraSecondary'
          }`}>
            {icon}
          </div>
        )}
        <div>
          <div className={`text-xl font-heading font-extrabold ${isPrimary ? 'text-koraOffWhite' : 'text-koraOffWhite'}`}>
            {value}
          </div>
          <div className="text-[11px] text-koraSecondary leading-tight">
            {label}
          </div>
        </div>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  );
}
