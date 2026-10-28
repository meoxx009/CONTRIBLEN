import React from 'react';
import Link from 'next/link';
import { Lock, Cpu } from 'lucide-react';
import ContriBLensMark from './ContriBLensMark';

export default function Footer() {
  return (
    <footer className="w-full border-t border-platinumSilver/15 bg-black/85 backdrop-blur-xl py-14 text-platinumSilver/80 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5 text-platinumSilver font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-electricTangerine/20 border border-electricTangerine/30 flex items-center justify-center">
                <ContriBLensMark className="w-4 h-4" />
              </div>
              <span className="tracking-tight">Contri<span className="text-textPrimary">B</span><span className="text-electricTangerine">Lens</span> <span className="text-[10px] bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 px-2 py-0.5 rounded-full font-mono">OSS</span></span>
            </div>
            <p className="text-platinumSilver/70 max-w-sm text-xs leading-relaxed">
              Scan. Understand. Contribute. Discover meaningful open-source contribution opportunities by scanning public GitHub repositories and turning verified findings into actionable plans and maintainer issue drafts.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-platinumSilver/80 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-lemonChiffon" /> Read-only &amp; Sandboxed
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-paleLavender" /> Grounded Gamma 4 Adapter
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-lemonChiffon text-xs font-bold uppercase tracking-wider mb-3 font-mono">{'// Navigation'}</h4>
            <ul className="space-y-2 text-xs text-platinumSilver/80 font-mono">
              <li><Link href="/#process" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">How It Works</Link></li>
              <li><Link href="/#features" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">Core Features</Link></li>
              <li><Link href="/security" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">Security &amp; Safety</Link></li>
              <li><Link href="/privacy" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">Privacy Notice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lemonChiffon text-xs font-bold uppercase tracking-wider mb-3 font-mono">{'// Compliance'}</h4>
            <ul className="space-y-2 text-xs text-platinumSilver/80 font-mono">
              <li><Link href="/security" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">Security &amp; Disclosure</Link></li>
              <li><Link href="/privacy" className="min-h-[36px] inline-flex items-center hover:text-lemonChiffon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon rounded px-1 -ml-1">Zero Retention Policy</Link></li>
              <li><span className="text-platinumSilver/60 min-h-[36px] inline-flex items-center">Zero Code Execution</span></li>
              <li><span className="text-platinumSilver/60 min-h-[36px] inline-flex items-center">Strict Secret Masking</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-platinumSilver/15 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-platinumSilver/60 gap-4">
          <div>
            &copy; {new Date().getFullYear()} ContriBLens OSS. Released under MIT License.
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-lemonChiffon">Scan. Understand. Contribute.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
