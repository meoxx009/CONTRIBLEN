import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-botticelli-border bg-blackHole py-12 text-linen-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-cotton font-bold text-base">
              <Shield className="w-5 h-5 text-electricTangerine" />
              <span>ContribLens OSS</span>
            </div>
            <p className="text-linen-muted max-w-sm text-xs leading-relaxed">
              Scan. Understand. Contribute. Discover meaningful open-source contribution opportunities by scanning public GitHub repositories and turning verified findings into actionable plans.
            </p>
            <div className="flex items-center gap-4 text-xs text-botticelli pt-2">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-lemonChiffon" /> Read-only &amp; Sandboxed
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-electricTangerine" /> Grounded Gemini Adapter
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-cotton text-xs font-semibold uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#process" className="hover:text-electricTangerine transition-colors">How It Works</Link></li>
              <li><Link href="/#features" className="hover:text-electricTangerine transition-colors">Core Features</Link></li>
              <li><Link href="/security" className="hover:text-electricTangerine transition-colors">Security &amp; Safety</Link></li>
              <li><Link href="/privacy" className="hover:text-electricTangerine transition-colors">Privacy Notice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-cotton text-xs font-semibold uppercase tracking-wider mb-3">Community &amp; Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/security" className="text-botticelli hover:text-lemonChiffon transition-colors">Security &amp; Disclosure Policy</Link></li>
              <li><Link href="/privacy" className="text-botticelli hover:text-lemonChiffon transition-colors">Privacy Notice &amp; Zero Retention</Link></li>
              <li><span className="text-botticelli">Zero Code Execution</span></li>
              <li><span className="text-botticelli">Strict Secret Masking</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-botticelli-border pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-botticelli gap-4">
          <div>
            &copy; {new Date().getFullYear()} ContribLens OSS. Released under MIT License.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lemonChiffon">Scan. Understand. Contribute.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
