import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Button } from '@/components/ui/Button';

const trustBadges = [
  {
    label: 'Gentle Products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Certified Artist',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    label: 'Satisfaction Guaranteed',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Navy background with radial gradient */}
      <div className="absolute inset-0 bg-navy" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(84,94,133,0.35) 0%, transparent 65%)',
        }}
      />

      {/* SVG lash pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lash-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M10 40 Q25 15 40 40 Q55 65 70 40"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M10 60 Q25 35 40 60 Q55 85 70 60"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lash-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-[-0.03em]">
            Ready for Your Lash Transformation?
          </h2>

          <p className="mt-5 text-white/70 font-body text-lg leading-[1.7] max-w-xl mx-auto">
            Book your appointment today and wake up beautiful every morning
          </p>

          <div className="mt-8">
            <Button variant="gold" size="lg" href="/booking">
              Book Your Appointment
            </Button>
          </div>

          <p className="mt-4 text-white/50 font-body text-sm">
            Free consultation included with every service
          </p>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-white/60">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm font-body">
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
