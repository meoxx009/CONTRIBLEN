'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, UserSettings, ScanSummary } from '@/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  activeScan: ScanSummary | null;
  setActiveScan: (scan: ScanSummary | null) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshUser: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScan, setActiveScan] = useState<ScanSummary | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const protectedPrefixes = ['/app', '/dashboard', '/scan', '/findings', '/contributions', '/drafts', '/issue-drafts', '/profile'];
    const isProtected = protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );
    if (isProtected && !user) {
      const fullPath = pathname + (typeof window !== 'undefined' ? window.location.search : '');
      router.push(`/login?next=${encodeURIComponent(fullPath)}`);
    }
  }, [loading, user, pathname, router]);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        applySettingsToDom(data.user?.settings);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // Load last active scan from local storage if available
    try {
      const savedScan = localStorage.getItem('contriblens_active_scan') || localStorage.getItem('contribshield_active_scan');
      if (savedScan) {
        setActiveScan(JSON.parse(savedScan));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetActiveScan = (scan: ScanSummary | null) => {
    setActiveScan(scan);
    if (scan) {
      try {
        localStorage.setItem('contriblens_active_scan', JSON.stringify(scan));
      } catch {}
    } else {
      localStorage.removeItem('contriblens_active_scan');
      localStorage.removeItem('contribshield_active_scan');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const applySettingsToDom = (settings?: UserSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const theme = settings?.theme || 'dark';
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Font size
    root.classList.remove('text-sm-mode', 'text-base-mode', 'text-lg-mode');
    if (settings?.fontSize === 'small') root.classList.add('text-sm-mode');
    else if (settings?.fontSize === 'large') root.classList.add('text-lg-mode');
    else root.classList.add('text-base-mode');

    // Font family
    root.classList.remove('font-sans-mode', 'font-system-mode', 'font-mono-mode');
    if (settings?.fontFamily === 'mono') root.classList.add('font-mono-mode');
    else if (settings?.fontFamily === 'system') root.classList.add('font-system-mode');
    else root.classList.add('font-sans-mode');

    // Reduced motion
    if (settings?.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { ...user.settings, ...newSettings };
    applySettingsToDom(updated);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        showToast('Settings saved successfully', 'success');
      }
    } catch {
      showToast('Failed to save settings to server', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        setUser,
        activeScan,
        setActiveScan: handleSetActiveScan,
        toasts,
        showToast,
        removeToast,
        refreshUser,
        updateSettings,
      }}
    >
      {children}

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg shadow-lg text-sm border font-medium transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-coffeeBean text-lemonChiffon border-electricTangerine/60'
                : toast.type === 'error'
                ? 'bg-rosewood-dark text-cotton border-rosewood-alert'
                : 'bg-coffeeBean text-linen border-botticelli-border'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-botticelli hover:text-cotton text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
