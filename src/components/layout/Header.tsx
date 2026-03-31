'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 h-20 flex items-center"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : 'transparent',
          boxShadow: scrolled
            ? '0 2px 16px rgba(16,27,75,0.06)'
            : 'none',
          transitionProperty: 'background-color, box-shadow',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" aria-label="Home">
            <Logo variant={scrolled ? 'dark' : 'light'} size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm tracking-wide transition-colors duration-200"
                style={{
                  color: scrolled ? '#101B4B' : 'rgba(255,255,255,0.85)',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = '#F6D673';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = scrolled
                    ? '#101B4B'
                    : 'rgba(255,255,255,0.85)';
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Button variant="gold" size="sm" href="/book">
              Book Now
            </Button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span
                className="block h-0.5 w-6 rounded-full transition-transform duration-300 origin-center"
                style={{
                  backgroundColor: scrolled ? '#101B4B' : '#FFFFFF',
                  transform: mobileOpen
                    ? 'translateY(4px) rotate(45deg)'
                    : 'none',
                }}
              />
              <span
                className="block h-0.5 w-6 rounded-full transition-opacity duration-300"
                style={{
                  backgroundColor: scrolled ? '#101B4B' : '#FFFFFF',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-6 rounded-full transition-transform duration-300 origin-center"
                style={{
                  backgroundColor: scrolled ? '#101B4B' : '#FFFFFF',
                  transform: mobileOpen
                    ? 'translateY(-4px) rotate(-45deg)'
                    : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-navy md:hidden"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transitionProperty: 'opacity',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <nav className="flex flex-col items-center gap-8" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="font-display text-3xl text-white tracking-tight transition-colors duration-200 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Button variant="gold" size="lg" href="/book" className="mt-4">
            Book Now
          </Button>
        </nav>
      </div>
    </>
  );
}

export { Header };
