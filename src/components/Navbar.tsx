'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import ContriBLensMark from './ContriBLensMark';
import {
  Shield,
  LogOut,
  GitBranch,
  User as UserIcon,
  ChevronDown,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, activeScan, showToast } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Detect scroll to adjust glass transparency and specular rim
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section for public anchor links on the landing page
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['process', 'features', 'safety', 'faqs'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  // Close dropdown & mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown & mobile menu with Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown & mobile menu on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
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
    { label: 'Process', href: '/#process', id: 'process' },
    { label: 'Features', href: '/#features', id: 'features' },
    { label: 'Safety', href: '/#safety', id: 'safety' },
    { label: 'FAQs', href: '/#faqs', id: 'faqs' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
        scrolled
          ? 'bg-koraBg/90 backdrop-blur-2xl border-b border-koraCharcoal-border shadow-liquid-nav'
          : 'bg-koraBg/75 backdrop-blur-xl border-b border-koraCharcoal-border/80 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href={user ? '/app/dashboard' : '/'} className="flex items-center gap-2.5 group" aria-label="ContriBLens OSS Home">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-koraSlate/25 via-koraCharcoal-surface to-koraBurgundy/30 border border-koraCharcoal-border flex items-center justify-center group-hover:scale-105 transition-all shadow-liquid-glass">
                <ContriBLensMark size={20} className="w-5 h-5 drop-shadow-[0_0_8px_rgba(192,43,24,0.5)]" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base tracking-tight text-textPrimary flex items-center gap-1.5 group-hover:text-koraOffWhite transition-colors">
                  <span>Contri<span className="text-textPrimary">B</span><span className="text-koraRed">Lens</span></span> <span className="text-[10px] font-semibold bg-[#1C1715] text-koraOffWhite border border-[#5B5857]/40 px-2 py-0.5 rounded-full shadow-sm font-mono">OSS</span>
                </span>
                <span className="text-[11px] text-textMuted -mt-0.5 hidden sm:inline tracking-wide font-normal">Scan. Understand. Contribute.</span>
              </div>
            </Link>

            {/* Active repository pill if in authenticated mode */}
            {user && activeScan && (
              <div className="hidden lg:flex items-center gap-2 ml-3 px-3.5 py-1.5 rounded-full bg-[#120F0E]/80 border border-koraCharcoal-border text-xs text-textPrimary backdrop-blur-md shadow-inner">
                <GitBranch className="w-3.5 h-3.5 text-koraRed shrink-0" />
                <span className="font-mono text-koraOffWhite font-medium truncate max-w-[170px]">
                  git::{activeScan.repoName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center py-2 px-1">
            <div className="flex items-center gap-1 lg:gap-2 whitespace-nowrap">
              {user ? (
                // Authenticated Navigation with Kora dark editorial pill
                authenticatedLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname === item.href.replace('/app', '') ||
                    (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3.5 py-1.5 min-h-[38px] inline-flex items-center text-xs lg:text-sm font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraOffWhite ${
                        isActive
                          ? 'bg-white/10 text-koraOffWhite border border-koraOffWhite/35 shadow-sm'
                          : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })
              ) : (
                // Public Navigation with enhanced contrast & live active anchor detection
                <>
                  {publicLinks.map((item) => {
                    const isAnchorActive = activeSection === item.id;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3.5 py-2 min-h-[38px] inline-flex items-center text-sm font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraOffWhite ${
                          isAnchorActive
                            ? 'bg-white/10 text-koraOffWhite border border-koraOffWhite/30 shadow-sm'
                            : 'text-koraSecondary hover:text-koraOffWhite hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="h-4 w-px bg-koraCharcoal/30 mx-2" />
                  <Link
                    href="/login"
                    className="px-4 py-2 min-h-[38px] inline-flex items-center text-sm font-medium text-koraSecondary hover:text-koraOffWhite hover:bg-white/5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraOffWhite"
                  >
                    Login
                  </Link>
                  {/* Primary Red Accent Button for Signup with Kora glow */}
                  <Link
                    href="/signup"
                    className="px-5 py-2 min-h-[38px] inline-flex items-center text-sm font-semibold bg-koraRed hover:bg-koraRed-hover text-white rounded-full transition-all shadow-glow-red ml-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Right Action Area: User Profile or Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            
            {/* User Profile Dropdown (Authenticated) */}
            {user && (
              <div className="relative pl-2 shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 min-h-[38px] rounded-full bg-black/60 border border-platinumSilver/25 hover:border-lemonChiffon/40 transition-all text-textPrimary text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon shadow-sm backdrop-blur-md"
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
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-blackHole/95 border border-platinumSilver/25 shadow-liquid-glass p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
                    <div className="p-3 border-b border-borderDark mb-1">
                      <p className="text-sm font-semibold text-textPrimary truncate">{user.name || 'Contributor'}</p>
                      <p className="text-xs text-textMuted truncate">{user.email}</p>
                      {user.phone && (
                        <p className="text-[11px] font-mono text-lemonChiffon/90 truncate mt-0.5">{user.phone}</p>
                      )}
                    </div>

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

            {/* Mobile Menu Hamburger Button with min 44px tap target */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-platinumSilver/20 text-platinumSilver hover:text-lemonChiffon hover:border-lemonChiffon/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-lemonChiffon transition-all"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Accessible Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-platinumSilver/15 bg-black/95 backdrop-blur-2xl shadow-liquid-nav px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          {user ? (
            /* Authenticated Mobile Navigation Links */
            <div className="space-y-1">
              {authenticatedLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname === item.href.replace('/app', '') ||
                  (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[44px] flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/10 text-lemonChiffon border border-lemonChiffon/30'
                        : 'text-platinumSilver/80 hover:bg-white/5 hover:text-textPrimary'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Public Mobile Navigation Links & CTAs */
            <div className="space-y-3">
              <div className="space-y-1">
                {publicLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-platinumSilver/85 hover:bg-white/5 hover:text-lemonChiffon transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-platinumSilver/15 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center py-2.5 text-center text-sm font-medium text-platinumSilver hover:text-textPrimary bg-white/5 rounded-xl border border-platinumSilver/20"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center py-3 text-center text-sm font-bold bg-lemonChiffon hover:bg-sustainableLinen text-black rounded-xl shadow-md"
                >
                  Sign Up
                </Link>
                <Link
                  href="/scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] py-3 text-center text-sm font-bold bg-electricTangerine hover:bg-electricTangerine-hover text-white rounded-xl shadow-glow-tangerine flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Scan a Repository</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
