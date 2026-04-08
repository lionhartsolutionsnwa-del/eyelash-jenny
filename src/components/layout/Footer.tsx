import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Book Now', href: '/booking' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms' },
];

function Footer() {
  return (
    <footer className="relative">
      {/* Gold accent line */}
      <div className="h-0.5 bg-gold" />

      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#101B4B' }}
      >
        {/* Subtle radial gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 0%, rgba(84,94,133,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(246,214,115,0.06) 0%, transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8">
          {/* Columns */}
          <div className="grid gap-12 md:grid-cols-3">
            {/* Column 1 - Brand */}
            <div className="flex flex-col gap-5">
              <Logo variant="light" size="md" />
              <p className="font-body text-sm leading-relaxed text-white/60 max-w-xs">
                Premium lash extensions crafted with care
              </p>
              {/* Social icons */}
              <div className="flex gap-4 mt-1">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/eyelashjenny1996?igsh=MjJpdW9zYzVyYzdp&utm_source=qr"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors duration-200 hover:border-gold hover:text-gold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-5 tracking-tight">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/60 transition-colors duration-200 hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 - Contact */}
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-5 tracking-tight">
                Contact
              </h4>
              <ul className="flex flex-col gap-3 font-body text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0 text-gold/60"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>5400 S Pinnacle Hills Pkwy<br />Rogers, AR 72756</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-gold/60"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>479-329-7979</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-gold/60"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a
                    href="mailto:info@jennyprofessionallash.com"
                    className="hover:text-gold transition-colors"
                  >
                    info@jennyprofessionallash.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0 text-gold/60"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    Tue &ndash; Fri: 9:00 AM &ndash; 6:00 PM
                    <br />
                    Sat: 10:00 AM &ndash; 4:00 PM
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 border-t border-white/10 pt-6 text-center">
            <p className="font-body text-xs text-white/40">
              &copy; 2026 Jenny Professional Eyelash. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
