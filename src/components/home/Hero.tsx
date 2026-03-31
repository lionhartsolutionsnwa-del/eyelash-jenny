'use client';

import { useEffect, useRef } from 'react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';

function Hero() {
  const patternRef = useRef<SVGSVGElement>(null);

  // Slow floating animation for the lash pattern
  useEffect(() => {
    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.0008;
      if (patternRef.current) {
        const x = Math.sin(t) * 8;
        const y = Math.cos(t * 0.7) * 6;
        patternRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Navy gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0a1236 0%, #101B4B 40%, #1a2660 100%)',
        }}
      />

      {/* Animated SVG lash pattern overlay */}
      <svg
        ref={patternRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <defs>
          <pattern
            id="lash-pattern"
            x="0"
            y="0"
            width="120"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Simple curved lash lines */}
            <path
              d="M10 60 Q25 20, 50 15"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M20 65 Q38 28, 58 22"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M30 68 Q48 35, 65 30"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M70 80 Q85 45, 110 38"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M80 82 Q95 55, 115 48"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lash-pattern)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        {/* Logo */}
        <Logo variant="light" size="lg" className="mb-8" />

        {/* Headline */}
        <h1
          className="font-display text-5xl md:text-7xl font-semibold text-white leading-[1.1] tracking-tight"
          style={{ letterSpacing: '-0.03em' }}
        >
          Lashes That Turn Heads
        </h1>

        {/* Subheadline */}
        <p className="mt-5 font-body text-lg md:text-xl text-white/70 max-w-md leading-relaxed">
          Wake up beautiful. No mascara needed.
        </p>

        {/* CTA Button with shimmer */}
        <div className="mt-10 relative group">
          <Button variant="gold" size="lg" href="/book" className="relative overflow-hidden">
            <span className="relative z-10">Book Your Appointment</span>
            {/* Shimmer sweep */}
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
          </Button>
        </div>

        {/* Impulse booking widget */}
        <div className="mt-5 flex items-center gap-2 font-body text-sm text-white/50">
          {/* Pulsing green dot */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>Next available: Tomorrow at 10:00 AM</span>
        </div>
      </div>

      {/* Trust strip */}
      <div className="absolute bottom-0 inset-x-0 z-10">
        <div
          className="backdrop-blur-sm border-t border-white/10"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="mx-auto max-w-4xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            <div className="flex items-center gap-1.5">
              {/* Gold stars */}
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#F6D673"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-1 font-body text-sm font-medium text-white">
                4.9 Rating
              </span>
            </div>

            <span className="text-white/30 hidden sm:inline">&middot;</span>

            <span className="font-body text-sm text-white/70">
              200+ Happy Clients
            </span>

            <span className="text-white/30 hidden sm:inline">&middot;</span>

            <span className="font-body text-sm text-white/70">
              5+ Years Experience
            </span>
          </div>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}

export { Hero };
