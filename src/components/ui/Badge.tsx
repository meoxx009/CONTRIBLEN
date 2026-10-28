'use client';

import React from 'react';
import type { Severity } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'lemon' | 'tech' | 'neutral' | 'chrome' | 'lavender' | 'silver';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    // Critical: Kora Burgundy + Red
    critical: 'bg-koraBurgundy/40 text-red-300 border border-koraRed/50 font-semibold',
    // High: Kora Red
    high: 'bg-koraRed/20 text-koraRed border border-koraRed/40 font-semibold',
    // Medium: Kora Slate
    medium: 'bg-koraSlate/40 text-blue-200 border border-koraSlate font-medium',
    // Low: Subtle Neutral
    low: 'bg-white/10 text-koraSecondary border border-white/15 font-medium',
    // Info: Muted Blue
    info: 'bg-sky-950/40 text-sky-300 border border-sky-800/40 font-medium',
    // Lemon / Accent: Kora Red / Burgundy accent
    lemon: 'bg-koraBurgundy/30 text-koraOffWhite border border-koraRed/30 font-medium',
    // Tech: Kora Slate Muted
    tech: 'bg-koraSlate/25 text-koraOffWhite border border-koraSlate/40 font-mono font-medium',
    // Neutral: Kora Charcoal card
    neutral: 'bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border font-medium',
    // Chrome: Metallic liquid chrome pill
    chrome: 'liquid-chrome-pill text-koraOffWhite font-semibold',
    // Lavender: Pale Lavender accent for AI & learning cues
    lavender: 'bg-koraSlate/30 text-koraOffWhite border border-koraSlate/40 font-medium',
    // Silver: Reflective chip
    silver: 'bg-white/10 text-koraOffWhite border border-koraCharcoal-border font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none tracking-wide ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const normalized = severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'info';
  const map: Record<'critical' | 'high' | 'medium' | 'low' | 'info', 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    info: 'info',
  };
  return <Badge variant={map[normalized] || 'neutral'}>{severity.toUpperCase()}</Badge>;
}
