'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  monospace?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, monospace = false, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-koraSecondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-4 py-2.5 rounded-xl bg-koraCharcoal-dark border text-koraOffWhite placeholder:text-koraSecondary/50 text-sm transition-all focus:outline-none focus:ring-1 ${
              monospace ? 'font-mono' : 'font-sans'
            } ${
              error
                ? 'border-koraRed focus:border-koraRed focus:ring-koraRed bg-koraBurgundy/10'
                : 'border-koraCharcoal-border focus:border-koraRed/60 focus:ring-koraRed/60 hover:border-koraCharcoal-border/80'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-koraRed font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {hint && !error && <p className="text-xs text-koraSecondary/70">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
