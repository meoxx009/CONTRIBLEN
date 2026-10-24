'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import {
  Shield,
  LogOut,
  GitBranch,
  User as UserIcon,
  ChevronDown,
  Settings,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, activeScan, showToast } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect scroll to adjust glass transparency and specular rim
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      showToast('Logged out successfully', 'info');
      router.push('/login');
    } catch {
      showToast('Error logging out', 'error');
    }
  };

  const authenticatedLinks = [
    { label: 'Dashboard', href: '/app/dashboard' },
    { label: 'Scan Repository', href: '/app/scan' },
    { label: 'Findings', href: '/app/findings' },
    { label: 'Contributions + Stack', href: '/app/contributions' },
    { label: 'Issue Drafts', href: '/app/issue-drafts' },
    { label: 'Profile', href: '/app/profile' },
  ];

  const publicLinks = [
    { label: 'Process', href: '/#process' },
    { label: 'Features', href: '/#features' },
    { label: 'Safety', href: '/safety' },
    { label: 'FAQs', href: '/#faqs' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/75 backdrop-blur-2xl border-b border-platinumSilver/20 shadow-liquid-nav'
          : 'bg-black/55 backdrop-blur-xl border-b border-platinumSilver/10 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href={user ? '/app/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-platinumSilver/20 via-coffeeBean/40 to-electricTangerine/20 border border-platinumSilver/30 flex items-center justify-center text-electricTangerine group-hover:scale-105 transition-all shadow-liquid-glass">
                <Shield className="w-5 h-5 text-electricTangerine drop-shadow-[0_0_8px_rgba(255,109,31,0.6)]" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-textPrimary flex items-center gap-1.5 group-hover:text-platinumSilver transition-colors">
                  ContribLens <span className="text-[10px] font-semibold bg-coffeeBean text-lemonChiffon border border-lemonChiffon/30 px-2 py-0.5 rounded-full shadow-sm">OSS</span>
                </span>
                <span className="text-[11px] text-textMuted -mt-0.5 hidden sm:inline tracking-wide">Scan. Understand. Contribute.</span>
              </div>
            </Link>

            {/* Active repository pill if in authenticated mode */}
            {user && activeScan && (
              <div className="hidden lg:flex items-center gap-2 ml-3 px-3.5 py-1.5 rounded-full bg-black/60 border border-platinumSilver/20 text-xs text-textPrimary backdrop-blur-md shadow-inner">
                <GitBranch className="w-3.5 h-3.5 text-electricTangerine shrink-0" />
                <span className="font-mono text-lemonChiffon font-medium truncate max-w-[170px]">
                  {activeScan.repoName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Navigation Items (Responsive & Horizontally scrollable on mobile) */}
          <nav className="flex items-center overflow-x-auto no-scrollbar py-2 px-1 max-w-full">
            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              {user ? (
                // Authenticated Navigation with liquid-glass pill and active Lemon Chiffon state
                authenticatedLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname === item.href.replace('/app', '') ||
                    (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                        isActive
                          ? 'bg-white/10 text-lemonChiffon border border-lemonChiffon/40 shadow-sm'
                          : 'text-platinumSilver/80 hover:text-textPrimary hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })
              ) : (
                // Public Navigation with enhanced contrast & liquid-glass feel
                <>
                  {publicLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3.5 py-2 text-sm font-medium text-platinumSilver/85 hover:text-lemonChiffon hover:bg-white/5 rounded-full transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-4 w-px bg-platinumSilver/20 mx-2 hidden sm:block" />
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-platinumSilver/90 hover:text-textPrimary hover:bg-white/5 rounded-full transition-all"
                  >
                    Login
                  </Link>
                  {/* Lemon Chiffon Pill Button for Signup with Tangerine Glow */}
                  <Link
                    href="/signup"
                    className="px-5 py-2 text-sm font-semibold bg-lemonChiffon hover:bg-sustainableLinen text-black rounded-full transition-all shadow-md hover:shadow-lemonChiffon/30 ml-1 active:scale-95"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative pl-2 shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-platinumSilver/25 hover:border-lemonChiffon/40 transition-all text-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-lemonChiffon shadow-sm backdrop-blur-md"
                aria-label="User Profile Menu"
                aria-expanded={dropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-electricTangerine/20 border border-electricTangerine/40 text-electricTangerine flex items-center justify-center font-bold text-[11px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium hidden sm:inline max-w-[100px] truncate text-platinumSilver">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-platinumSilver/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-blackHole/90 border border-platinumSilver/25 shadow-liquid-glass p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
                  {/* User Identity Header */}
                  <div className="p-3 border-b border-borderDark mb-1">
                    <p className="text-sm font-semibold text-textPrimary truncate">{user.name || 'Contributor'}</p>
                    <p className="text-xs text-textMuted truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-[11px] font-mono text-lemonChiffon/90 truncate mt-0.5">{user.phone}</p>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/app/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-white/5 hover:text-lemonChiffon rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-electricTangerine" />
                      Dashboard
                    </Link>
                    <Link
                      href="/app/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-white/5 hover:text-lemonChiffon rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-lemonChiffon" />
                      Profile &amp; Settings
                    </Link>
                    <Link
                      href="/safety"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-white/5 hover:text-lemonChiffon rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-botticelli" />
                      Safety Model
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-borderDark mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rosewood hover:bg-rosewood/15 hover:text-red-300 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
