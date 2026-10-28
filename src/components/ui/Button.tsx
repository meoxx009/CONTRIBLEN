'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'lemon' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-koraBg disabled:opacity-50 disabled:pointer-events-none select-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
    };

    const variantStyles = {
      // Primary: Kora Red glow
      primary:
        'bg-koraRed hover:bg-koraRed-hover text-white shadow-glow-red focus-visible:ring-koraRed active:scale-[0.98]',
      // Secondary: Dark charcoal card with subtle border
      secondary:
        'bg-koraCharcoal-card border border-koraCharcoal-border hover:border-koraRed/40 text-koraOffWhite hover:bg-koraCharcoal-dark focus-visible:ring-koraRed active:scale-[0.98]',
      // Ghost: Borderless hover highlight
      ghost:
        'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5 focus-visible:ring-koraRed',
      // Danger: Burgundy critical state
      danger:
        'bg-koraBurgundy hover:bg-koraBurgundy/90 text-white border border-koraRed/50 shadow-md focus-visible:ring-koraRed active:scale-[0.98]',
      // Lemon / Accent: Primary action
      lemon:
        'bg-koraRed hover:bg-koraRed-hover text-white font-semibold shadow-glow-red focus-visible:ring-koraRed active:scale-[0.98]',
      // Glass: Liquid glass button with Kora styling
      glass:
        'bg-white/[0.06] hover:bg-white/[0.12] text-koraOffWhite border border-koraCharcoal-border hover:border-koraRed/40 backdrop-blur-xl shadow-liquid-glass focus-visible:ring-koraRed active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
