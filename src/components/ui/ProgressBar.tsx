'use client';

import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  variant?: 'tangerine' | 'lemon' | 'readiness' | 'neutral' | 'red' | 'kora';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'red',
  size = 'md',
  label,
  showPercentage = false,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'red':
      case 'kora':
        return 'bg-gradient-to-r from-koraBurgundy via-koraRed to-koraOffWhite';
      case 'lemon':
        return 'bg-koraOffWhite';
      case 'neutral':
        return 'bg-koraOffWhite';
      case 'readiness':
        if (percentage >= 80) return 'bg-emerald-400';
        if (percentage >= 50) return 'bg-koraSlate';
        if (percentage >= 30) return 'bg-koraRed';
        return 'bg-koraBurgundy';
      case 'tangerine':
      default:
        return 'bg-gradient-to-r from-koraBurgundy via-koraRed to-koraOffWhite';
    }
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`} {...props}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-koraSecondary">{label}</span>}
          {showPercentage && <span className="font-mono text-koraOffWhite">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-koraCharcoal-dark rounded-full overflow-hidden border border-koraCharcoal-border ${sizeStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getVariantStyles()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
