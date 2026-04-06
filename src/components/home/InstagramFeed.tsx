import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Button } from '@/components/ui/Button';

const images = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  src: `https://placehold.co/400x400?text=Lash+${i + 1}`,
  alt: `Lash work sample ${i + 1}`,
}));

export function InstagramFeed() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-navy tracking-[-0.03em]">
              Follow Our Work
            </h2>
            <a
              href="https://www.instagram.com/eyelashjenny1996?igsh=MjJpdW9zYzVyYzdp&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-navy-light font-body hover:text-gold-dark transition-transform transition-opacity duration-200"
            >
              {/* Instagram icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="text-lg">@eyelashjenny1996</span>
            </a>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 80}>
              <a
                href="#"
                className="group relative block overflow-hidden rounded-xl aspect-square"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-navy/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-body text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    View on Instagram
                  </span>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal delay={200}>
          <div className="text-center mt-10">
            <Button variant="gold" size="lg" href="#">
              Follow Us on Instagram
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
