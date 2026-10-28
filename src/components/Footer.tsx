import React from 'react';
import Link from 'next/link';
import { Lock, Cpu } from 'lucide-react';
import ContriBLensLogo from './ContriBLensLogo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-koraCharcoal-border bg-koraBg/95 backdrop-blur-2xl py-14 text-koraSecondary text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2 space-y-3.5">
            <ContriBLensLogo showTagline={false} />
            <p className="text-koraSecondary/80 max-w-sm text-xs leading-relaxed font-sans">
              Scan. Understand. Contribute. Discover meaningful open-source contribution opportunities by scanning public GitHub repositories and turning verified findings into actionable plans and maintainer issue drafts.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-koraSecondary pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-koraRed" /> Read-only &amp; Sandboxed
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-koraSlate" /> Grounded Gemini 2.5 Flash
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-koraOffWhite text-xs font-semibold uppercase tracking-wider mb-3 font-mono">{'// Navigation'}</h4>
            <ul className="space-y-2 text-xs text-koraSecondary font-mono">
              <li><Link href="/#process" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">How It Works</Link></li>
              <li><Link href="/#features" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">Core Features</Link></li>
              <li><Link href="/security" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">Security &amp; Safety</Link></li>
              <li><Link href="/privacy" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">Privacy Notice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-koraOffWhite text-xs font-semibold uppercase tracking-wider mb-3 font-mono">{'// Compliance'}</h4>
            <ul className="space-y-2 text-xs text-koraSecondary font-mono">
              <li><Link href="/security" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">Security &amp; Disclosure</Link></li>
              <li><Link href="/privacy" className="min-h-[36px] inline-flex items-center hover:text-koraOffWhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded px-1 -ml-1">Zero Retention Policy</Link></li>
              <li><span className="text-koraSecondary/60 min-h-[36px] inline-flex items-center">Zero Code Execution</span></li>
              <li><span className="text-koraSecondary/60 min-h-[36px] inline-flex items-center">Strict Secret Masking</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-koraCharcoal-border pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-koraSecondary/60 gap-4">
          <div>
            &copy; {new Date().getFullYear()} ContriBLens OSS. Released under MIT License.
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-koraOffWhite">Scan. Understand. Contribute.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
