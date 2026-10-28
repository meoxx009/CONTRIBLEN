'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { calculatePasswordStrength } from '@/lib/password';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrengthMeter?: boolean;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = 'Password', error, showStrengthMeter = false, value, onChange, className = '', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || 'password-field';
    const stringValue = typeof value === 'string' ? value : '';
    const strength = showStrengthMeter ? calculatePasswordStrength(stringValue) : null;

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-koraSecondary"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-koraCharcoal-dark border text-koraOffWhite placeholder:text-koraSecondary/50 text-sm transition-all focus:outline-none focus:ring-1 ${
              error
                ? 'border-koraRed focus:border-koraRed focus:ring-koraRed bg-koraBurgundy/10'
                : 'border-koraCharcoal-border focus:border-koraRed/60 focus:ring-koraRed/60 hover:border-koraCharcoal-border/80'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-koraSecondary hover:text-koraOffWhite transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-koraRed"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-koraRed font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {showStrengthMeter && strength && stringValue.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-koraSecondary">Password Strength:</span>
              <span
                className={`font-semibold ${
                  strength.score <= 1
                    ? 'text-koraBurgundy'
                    : strength.score === 2
                    ? 'text-koraSlate'
                    : strength.score === 3
                    ? 'text-koraRed'
                    : 'text-emerald-400'
                }`}
              >
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-koraCharcoal-card rounded-full overflow-hidden flex gap-1">
              {[0, 1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 transition-all rounded-full ${
                    step < strength.score
                      ? strength.score <= 1
                        ? 'bg-koraBurgundy'
                        : strength.score === 2
                        ? 'bg-koraSlate'
                        : strength.score === 3
                        ? 'bg-koraRed'
                        : 'bg-emerald-400'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
