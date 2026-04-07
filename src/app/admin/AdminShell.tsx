'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { useLang } from '@/contexts/LanguageContext';

const navItems = [
  {
    labelEn: 'Dashboard',
    labelZh: '仪表盘',
    href: '/admin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    labelEn: 'Calendar',
    labelZh: '日历',
    href: '/admin/calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="15" rx="2" />
        <path d="M2 8h16" />
        <path d="M6 1v4M14 1v4" />
      </svg>
    ),
  },
  {
    labelEn: 'Bookings',
    labelZh: '预约',
    href: '/admin/bookings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M6 7h8M6 10h8M6 13h4" />
      </svg>
    ),
  },
  {
    labelEn: 'Clients',
    labelZh: '客户',
    href: '/admin/clients',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6" r="3.5" />
        <path d="M3 17.5c0-3.5 3.13-6 7-6s7 2.5 7 6" />
      </svg>
    ),
  },
  {
    labelEn: 'More',
    labelZh: '更多',
    href: '__more__',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="4" cy="10" r="1.5" />
        <circle cx="16" cy="10" r="1.5" />
      </svg>
    ),
  },
];

const sidebarItems = [
  {
    labelEn: 'Dashboard',
    labelZh: '仪表盘',
    href: '/admin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    labelEn: 'Calendar',
    labelZh: '日历',
    href: '/admin/calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="15" rx="2" />
        <path d="M2 8h16" />
        <path d="M6 1v4M14 1v4" />
      </svg>
    ),
  },
  {
    labelEn: 'Bookings',
    labelZh: '预约',
    href: '/admin/bookings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M6 7h8M6 10h8M6 13h4" />
      </svg>
    ),
  },
  {
    labelEn: 'Availability',
    labelZh: '可用时间',
    href: '/admin/availability',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 5v5l3.5 3.5" />
      </svg>
    ),
  },
  {
    labelEn: 'Clients',
    labelZh: '客户',
    href: '/admin/clients',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6" r="3.5" />
        <path d="M3 17.5c0-3.5 3.13-6 7-6s7 2.5 7 6" />
      </svg>
    ),
  },
  {
    labelEn: 'Settings',
    labelZh: '设置',
    href: '/admin/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M16.2 12.8a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 11-2.06 2.06l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.72 1.1v.12a1.46 1.46 0 11-2.92 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 11-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.72h-.12a1.46 1.46 0 110-2.92h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 112.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.72-1.1v-.12a1.46 1.46 0 112.92 0v.06a1.2 1.2 0 00.72 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 112.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.72h.12a1.46 1.46 0 110 2.92h-.06a1.2 1.2 0 00-1.1.72z" />
      </svg>
    ),
  },
];

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getPageTitle(pathname: string) {
  const titles: Record<string, { en: string; zh: string }> = {
    '/admin': { en: 'Dashboard', zh: '仪表盘' },
    calendar: { en: 'Calendar', zh: '日历' },
    bookings: { en: 'Bookings', zh: '预约管理' },
    availability: { en: 'Availability', zh: '可用时间' },
    clients: { en: 'Clients', zh: '客户管理' },
    settings: { en: 'Settings', zh: '设置' },
  };
  if (pathname === '/admin') return titles['/admin'];
  const segment = pathname.split('/').pop() ?? '';
  return titles[segment] ?? { en: segment.charAt(0).toUpperCase() + segment.slice(1), zh: segment };
}

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { lang, toggleLang } = useLang();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-navy font-display text-lg">Loading...</div>
      </div>
    );
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-full w-60 bg-white border-r border-gray-light flex-col">
        <div className="px-5 py-5 border-b border-gray-light">
          <Link href="/admin">
            <Logo variant="dark" size="sm" />
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-colors duration-150',
                  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                  active
                    ? 'bg-gold/10 text-gold-dark border-l-[3px] border-gold-dark'
                    : 'text-navy-light hover:text-navy hover:bg-offwhite',
                ].join(' ')}
              >
                <span className={active ? 'text-gold-dark' : 'text-gray'}>{item.icon}</span>
                <span className="only-en">{item.labelEn}</span>
                <span className="only-zh">{item.labelZh}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-body font-medium text-navy-light hover:text-navy hover:bg-offwhite transition-colors duration-150 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
              <path d="M13 14l4-4-4-4M17 10H7" />
            </svg>
            <span className="only-en">Logout</span>
            <span className="only-zh">退出</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile "More" Drawer ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="relative w-full bg-white rounded-t-2xl pb-8 pt-4 px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-light rounded-full mx-auto mb-5" />

            {/* User info */}
            <div className="flex items-center gap-3 px-2 pb-4 mb-2 border-b border-gray-light">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <span className="text-base font-semibold text-gold-dark">{user?.name?.charAt(0) ?? '?'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-navy font-body">{user?.name}</p>
                <p className="text-xs text-gray font-body capitalize">{user?.role}</p>
              </div>
              <button
                onClick={toggleLang}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-semibold border border-gold/40 bg-gold/5 text-gold-dark"
              >
                {lang === 'en' ? '中文' : 'EN'}
              </button>
            </div>

            {/* Extra nav items */}
            <nav className="space-y-1">
              {[
                { labelEn: 'Availability', labelZh: '可用时间', href: '/admin/availability',
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 5v5l3.5 3.5" /></svg> },
                { labelEn: 'Settings', labelZh: '设置', href: '/admin/settings',
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="2.5" /><path d="M16.2 12.8a1.2 1.2 0 00.24 1.32l.04.04a1.46 1.46 0 11-2.06 2.06l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.72 1.1v.12a1.46 1.46 0 11-2.92 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.46 1.46 0 11-2.06-2.06l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.72h-.12a1.46 1.46 0 110-2.92h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.46 1.46 0 112.06-2.06l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.72-1.1v-.12a1.46 1.46 0 112.92 0v.06a1.2 1.2 0 00.72 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.46 1.46 0 112.06 2.06l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.72h.12a1.46 1.46 0 110 2.92h-.06a1.2 1.2 0 00-1.1.72z" /></svg> },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={[
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-body font-medium transition-colors duration-150',
                    isActive(item.href)
                      ? 'bg-gold/10 text-gold-dark'
                      : 'text-navy-light hover:text-navy hover:bg-offwhite',
                  ].join(' ')}
                >
                  <span className={isActive(item.href) ? 'text-gold-dark' : 'text-gray'}>{item.icon}</span>
                  <span className="only-en">{item.labelEn}</span>
                  <span className="only-zh">{item.labelZh}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-light">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-body font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
                  <path d="M13 14l4-4-4-4M17 10H7" />
                </svg>
                <span className="only-en">Logout</span>
                <span className="only-zh">退出</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-light">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14 lg:h-16">
            {/* Title */}
            <h1 className="font-display text-lg lg:text-2xl text-navy tracking-tight">
              <span className="only-en">{title.en}</span>
              <span className="only-zh">{title.zh}</span>
            </h1>

            {/* Desktop: lang + user + date */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-semibold border border-gold/40 bg-gold/5 hover:bg-gold/10 text-gold-dark transition-colors duration-150 cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
                {lang === 'en' ? '中文' : 'EN'}
              </button>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-navy font-body">{user?.name}</span>
                <span className="text-xs text-gray font-body capitalize">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-gold-dark">{user?.name?.charAt(0) ?? '?'}</span>
              </div>
              <p className="text-sm text-gray font-body border-l border-gray-light pl-4">{formatDate()}</p>
            </div>

            {/* Mobile: avatar only */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-gold-dark">{user?.name?.charAt(0) ?? '?'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 p-3 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-light">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            if (item.href === '__more__') {
              return (
                <button
                  key="more"
                  onClick={() => setDrawerOpen(true)}
                  className={[
                    'flex flex-col items-center justify-center gap-1 text-[10px] font-body font-medium transition-colors duration-150',
                    drawerOpen ? 'text-gold-dark' : 'text-gray',
                  ].join(' ')}
                >
                  <span className={drawerOpen ? 'text-gold-dark' : 'text-gray'}>{item.icon}</span>
                  <span className="only-en">{item.labelEn}</span>
                  <span className="only-zh">{item.labelZh}</span>
                </button>
              );
            }
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-1 text-[10px] font-body font-medium transition-colors duration-150',
                  active ? 'text-gold-dark' : 'text-gray',
                ].join(' ')}
              >
                <span className={active ? 'text-gold-dark' : 'text-gray'}>{item.icon}</span>
                <span className="only-en">{item.labelEn}</span>
                <span className="only-zh">{item.labelZh}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
