'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

interface Testimonial {
  id: number;
  name: string;
  service: string;
  rating: number;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Samantha L.',
    service: 'Classic Lashes',
    rating: 5,
    quote:
      'Jenny is a true artist! My classic lashes look so natural — everyone thinks I just have amazing natural lashes. I will never go anywhere else.',
  },
  {
    id: 2,
    name: 'Rachel K.',
    service: 'Volume Set',
    rating: 5,
    quote:
      'I was so nervous for my first lash appointment, but Jenny made me feel completely at ease. The results were stunning and lasted beautifully.',
  },
  {
    id: 3,
    name: 'Maria T.',
    service: 'Mega Volume',
    rating: 5,
    quote:
      'The best lash experience I have ever had. Jenny takes her time to make sure every lash is perfect. My mega volume set is absolutely gorgeous!',
  },
  {
    id: 4,
    name: 'Ashley P.',
    service: 'Lash Lift',
    rating: 5,
    quote:
      'I love waking up every morning with perfect lashes. Jenny is incredibly talented, gentle, and really listens to what you want. Highly recommend!',
  },
  {
    id: 5,
    name: 'Jessica W.',
    service: 'Classic Fill',
    rating: 5,
    quote:
      'Jenny is not only skilled but so warm and welcoming. Her attention to detail is unmatched. My lashes always look amazing after every fill appointment.',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-gold" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardCount = testimonials.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const card = container.children[index] as HTMLElement | undefined;
      if (!card) return;
      container.scrollTo({
        left: card.offsetLeft - container.offsetLeft,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    },
    []
  );

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % cardCount;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, cardCount, scrollToIndex]);

  // Sync active index on manual scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        const children = Array.from(container.children) as HTMLElement[];
        let closestIdx = 0;
        let closestDist = Infinity;
        children.forEach((child, idx) => {
          const dist = Math.abs(child.offsetLeft - container.offsetLeft - scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = idx;
          }
        });
        setActiveIndex(closestIdx);
        ticking = false;
      });
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (dir: -1 | 1) => {
    const next = (activeIndex + dir + cardCount) % cardCount;
    scrollToIndex(next);
  };

  return (
    <section className="py-20 md:py-28 bg-offwhite overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-gold font-body text-sm font-semibold uppercase tracking-widest">
              Testimonials
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-navy tracking-[-0.03em]">
              What Our Clients Say
            </h2>
            <div className="mt-3 mx-auto w-16 h-0.5 bg-gold rounded-full" />
          </div>
        </ScrollReveal>

        {/* Carousel */}
        <div className="relative">
          {/* Arrow Buttons */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy text-white items-center justify-center hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 transition-transform transition-opacity duration-200 active:scale-[0.95] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy text-white items-center justify-center hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 transition-transform transition-opacity duration-200 active:scale-[0.95] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="snap-start shrink-0 w-[85vw] sm:w-[380px] bg-white rounded-2xl p-8 relative overflow-hidden shadow-[0_2px_20px_rgba(16,27,75,0.06)]"
              >
                {/* Decorative quotation mark */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-6 font-display text-[120px] leading-none text-gold/10 select-none pointer-events-none"
                >
                  &ldquo;
                </span>

                <Stars count={t.rating} />

                <blockquote className="mt-4 font-display text-lg italic text-navy leading-[1.7] relative z-10">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3">
                  <div>
                    <p className="font-body font-semibold text-navy text-sm">{t.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gold/15 text-gold-dark font-body font-medium">
                      {t.service}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={[
                'w-2 h-2 rounded-full transition-transform transition-opacity duration-200 cursor-pointer',
                i === activeIndex ? 'bg-gold w-6' : 'bg-gray-light hover:bg-gray',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
