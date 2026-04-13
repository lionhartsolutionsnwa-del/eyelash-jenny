'use client';

import { useRef, useState, useCallback, useEffect, type PointerEvent, type TouchEvent } from 'react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

interface SliderPair {
  before: string;
  after: string;
  label: string;
}

const SLIDERS: SliderPair[] = [
  {
    before: '/images/before-after/before-classic.jpg',
    after: '/images/before-after/after-classic.jpg',
    label: 'Classic Full Set',
  },
  {
    before: '/images/before-after/before-hybrid.jpg',
    after: '/images/before-after/after-hybrid.jpg',
    label: 'Hybrid Full Set',
  },
  {
    before: '/images/before-after/before-volume.jpg',
    after: '/images/before-after/after-volume.jpg',
    label: 'Volume Full Set',
  },
];

function SingleSlider({ pair }: { pair: SliderPair }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Also support touch for mobile
  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    },
    [isDragging, updatePosition]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl cursor-ew-resize select-none"
        style={{ aspectRatio: '4 / 3' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchMove={handleTouchMove}
      >
        {/* After image (full width behind) */}
        <img
          src={pair.after}
          alt={`${pair.label} after`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={pair.before}
            alt={`${pair.label} before`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 font-body text-xs font-medium text-white backdrop-blur-sm">
          Before
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 font-body text-xs font-medium text-white backdrop-blur-sm">
          After
        </span>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2"
            style={{
              backgroundColor: '#101B4B',
              borderColor: '#F6D673',
              boxShadow: '0 2px 12px rgba(16,27,75,0.3)',
            }}
          >
            {/* Left/right arrows */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7 17 2 12 7 7" />
              <polyline points="17 7 22 12 17 17" />
            </svg>
          </div>
        </div>
      </div>

      {/* Slider label */}
      <p className="text-center font-body text-sm text-navy-light">{pair.label}</p>
    </div>
  );
}

function BeforeAfterSlider() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="font-display text-3xl md:text-5xl font-semibold text-navy tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              See the Transformation
            </h2>
            {/* Gold accent line */}
            <div className="mt-4 mx-auto h-0.5 w-12 rounded-full bg-gold" />
          </div>
        </ScrollReveal>

        {/* Sliders grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {SLIDERS.map((pair, i) => (
            <ScrollReveal key={pair.label} delay={i * 150}>
              <SingleSlider pair={pair} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { BeforeAfterSlider };
