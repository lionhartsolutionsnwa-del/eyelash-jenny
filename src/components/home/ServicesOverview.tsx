import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ServiceItem {
  name: string;
  description: string;
  duration: string;
  price: string;
  popular?: boolean;
  icon: React.ReactNode;
}

const SERVICES: ServiceItem[] = [
  {
    name: 'Classic Lashes',
    description: 'Natural, elegant enhancement for everyday beauty',
    duration: '2 hours',
    price: '$119',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 28 Q14 10, 24 8" stroke="#101B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M12 30 Q18 14, 28 12" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M16 31 Q22 18, 32 16" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="32" r="2" fill="#F6D673" />
      </svg>
    ),
  },
  {
    name: 'Hybrid Lashes',
    description: 'The perfect blend of classic and volume for added drama',
    duration: '2.5 hours',
    price: '$149',
    popular: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M6 28 Q12 8, 22 6" stroke="#101B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M10 30 Q16 12, 26 10" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M14 31 Q20 16, 30 14" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M18 31 Q24 20, 34 18" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M4 26 Q10 12, 18 6" stroke="#101B4B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
        <circle cx="20" cy="32" r="2.5" fill="#F6D673" />
      </svg>
    ),
  },
  {
    name: 'Lash Removal',
    description: 'Safe, gentle removal of existing extensions',
    duration: '30 min',
    price: '$25',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M5 28 Q10 6, 20 4" stroke="#101B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M8 30 Q14 10, 24 8" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M11 31 Q18 14, 28 12" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M14 31 Q22 18, 32 16" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M17 31 Q26 22, 35 20" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M3 26 Q8 10, 16 4" stroke="#101B4B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M6 28 Q12 14, 20 8" stroke="#101B4B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
        <circle cx="20" cy="32" r="3" fill="#F6D673" />
      </svg>
    ),
  },
];

function ServicesOverview() {
  return (
    <section id="services" className="py-24 md:py-32 bg-offwhite">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="font-display text-3xl md:text-5xl font-semibold text-navy tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Our Services
            </h2>
            {/* Gold accent line */}
            <div className="mt-4 mx-auto h-0.5 w-12 rounded-full bg-gold" />
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.name} delay={i * 150}>
              <Card
                elevated={service.popular}
                hoverable
                className={`relative flex flex-col items-center text-center p-8 ${
                  service.popular ? '-mt-0 md:-mt-4' : ''
                }`}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="popular" size="md">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-offwhite mb-5">
                  {service.icon}
                </div>

                {/* Name */}
                <h3
                  className="font-display text-xl font-semibold text-navy tracking-tight"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {service.name}
                </h3>

                {/* Description */}
                <p className="mt-2 font-body text-sm text-navy-light leading-relaxed">
                  {service.description}
                </p>

                {/* Duration badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-offwhite px-3 py-1 font-body text-xs text-navy-light">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {service.duration}
                  </span>
                </div>

                {/* Price */}
                <p className="mt-5 font-display text-3xl font-bold text-gold-dark">
                  {service.price}
                </p>

                {/* Book button */}
                <div className="mt-6 w-full">
                  <Button variant="secondary" size="sm" href="/book" className="w-full">
                    Book Now
                  </Button>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { ServicesOverview };
