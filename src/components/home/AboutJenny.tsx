import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Button } from '@/components/ui/Button';

export function AboutJenny() {
  return (
    <section className="py-20 md:py-28 bg-offwhite">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <ScrollReveal direction="left">
            <div className="relative">
              {/* Gold accent border */}
              <div className="absolute -left-3 top-6 bottom-6 w-1 bg-gold rounded-full" />
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/jenny.jpg"
                  alt="Jenny, professional lash artist"
                  className="w-full h-auto object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
              </div>
            </div>
          </ScrollReveal>

          {/* Text Side */}
          <ScrollReveal direction="right" delay={150}>
            <div className="flex flex-col gap-6">
              <span className="text-gold font-body text-sm font-semibold uppercase tracking-widest">
                Meet Your Artist
              </span>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-navy leading-tight tracking-[-0.03em]">
                Crafted with Care, Designed for You
              </h2>

              <div className="flex flex-col gap-4 text-navy-light font-body leading-[1.7]">
                <p>
                  Hi, I&apos;m Jenny — a certified lash artist with a passion for bringing out
                  the natural beauty in every client. From the moment you sit in my chair,
                  my goal is to make you feel comfortable, confident, and absolutely stunning.
                </p>
                <p>
                  I specialize in everything from soft, natural classics to bold, dramatic
                  volume sets. Every lash application is customized to complement your unique
                  eye shape, lifestyle, and personal style. No cookie-cutter looks here.
                </p>
                <p>
                  Using only premium, gentle adhesives and lightweight lash materials, I
                  prioritize the health of your natural lashes just as much as the final
                  look. Your comfort and satisfaction are always my top priority.
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-8 pt-4 border-t border-gray-light">
                <div className="flex flex-col">
                  <span className="font-display text-3xl font-bold text-gold-dark">5+</span>
                  <span className="text-sm text-gray font-body">Years Experience</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl font-bold text-gold-dark">2000+</span>
                  <span className="text-sm text-gray font-body">Lash Sets Applied</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-3xl font-bold text-gold-dark">Certified</span>
                  <span className="text-sm text-gray font-body">Licensed Artist</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="gold" size="lg" href="/booking">
                  Book a Consultation
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
