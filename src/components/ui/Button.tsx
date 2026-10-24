'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'lemon';
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
      'inline-flex items-center justify-center font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none select-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
    };

    const variantStyles = {
      // Primary: Warm Electric Tangerine glow
      primary:
        'bg-electricTangerine hover:bg-electricTangerine-hover text-white shadow-glow-tangerine focus-visible:ring-electricTangerine active:scale-[0.98]',
      // Secondary: Dark glass card with subtle border
      secondary:
        'bg-blackHole border border-borderDark hover:border-lemonChiffon/30 text-textPrimary hover:bg-blackHole/80 focus-visible:ring-lemonChiffon active:scale-[0.98]',
      // Ghost: Borderless hover highlight
      ghost:
        'text-textMuted hover:text-textPrimary hover:bg-white/5 focus-visible:ring-lemonChiffon',
      // Danger: Rosewood critical state
      danger:
        'bg-rosewood hover:bg-rosewood/90 text-white border border-rosewood/50 shadow-md focus-visible:ring-rosewood active:scale-[0.98]',
      // Lemon: Lemon Chiffon safe-action accent
      lemon:
        'bg-lemonChiffon hover:bg-lemonChiffon-hover text-black font-semibold shadow-md focus-visible:ring-lemonChiffon active:scale-[0.98]',
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
