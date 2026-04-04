'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';

const navItems = [
  {
    label: 'Dashboard',
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
    label: 'Calendar',
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
    label: 'Bookings',
    href: '/admin/bookings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M6 7h8M6 10h8M6 13h4" />
      </svg>
    ),
  },
  {
    label: 'Availability',
    href: '/admin/availability',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 5v5l3.5 3.5" />
      </svg>
    ),
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6" r="3.5" />
        <path d="M3 17.5c0-3.5 3.13-6 7-6s7 2.5 7 6" />
      </svg>
    ),
  },
  {
    label: 'Settings',
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
  if (pathname === '/admin') return 'Dashboard';
  const segment = pathname.split('/').pop();
  if (!segment) return 'Dashboard';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Don't render admin shell on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Verify auth on mount
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

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 h-full w-60 bg-white border-r border-gray-light flex flex-col',
          'transition-transform duration-200 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-light">
          <Link href="/admin" className="block">
            <Logo variant="dark" size="sm" />
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium',
                  'transition-opacity duration-150',
                  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                  active
                    ? 'bg-gold/10 text-gold-dark border-l-[3px] border-gold-dark'
                    : 'text-navy-light hover:text-navy hover:bg-offwhite',
                ].join(' ')}
              >
                <span className={active ? 'text-gold-dark' : 'text-gray'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-body font-medium text-navy-light hover:text-navy hover:bg-offwhite transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
              <path d="M13 14l4-4-4-4M17 10H7" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-light">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-navy-light hover:text-navy hover:bg-offwhite transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
                aria-label="Open menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 5h14M3 10h14M3 15h14" />
                </svg>
              </button>

              <h1 className="font-display text-xl lg:text-2xl text-navy tracking-tight">
                {getPageTitle(pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-navy font-body">{user?.name}</span>
                <span className="text-xs text-gray font-body capitalize">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-gold-dark">
                  {user?.name?.charAt(0) ?? '?'}
                </span>
              </div>
            </div>
            <p className="hidden sm:block text-sm text-gray font-body">{formatDate()}</p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
