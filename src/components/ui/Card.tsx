'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'widget' | 'warm' | 'linen' | 'cotton' | 'liquid-glass' | 'liquid-hero' | 'metric-card';
}

export function Card({
  children,
  variant = 'glass',
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    // Glass card: dark charcoal translucent surface with fine border
    glass: 'bg-koraCharcoal-surface/85 backdrop-blur-md border border-koraCharcoal-border text-koraOffWhite shadow-glass-card',
    // Open widget: spacious, high-contrast framing
    widget: 'bg-koraCharcoal-surface border border-koraCharcoal-border hover:border-koraRed/40 text-koraOffWhite shadow-2xl transition-all',
    // Warm: Deep burgundy ambient card
    warm: 'bg-koraBurgundy/25 backdrop-blur-lg border border-koraRed/30 text-koraOffWhite shadow-glow-burgundy',
    // Linen: Editorial document surface for drafts & reports
    linen: 'bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border shadow-md',
    // Cotton: Warm editorial tone
    cotton: 'bg-koraCharcoal-card text-koraOffWhite border border-koraCharcoal-border shadow-md',
    // Liquid glass: high-translucency glass with fine specular rim
    'liquid-glass': 'liquid-glass-card text-koraOffWhite',
    // Liquid hero: elevated multi-stop glass with deep blur
    'liquid-hero': 'liquid-glass-hero text-koraOffWhite',
    // Metric card: high-hierarchy metric panel with subtle glow
    'metric-card': 'liquid-glass-card border-koraCharcoal-border hover:border-koraRed/40 text-koraOffWhite',
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-koraCharcoal-border mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-koraOffWhite">{title}</h3>
        {subtitle && <p className="text-xs text-koraSecondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
