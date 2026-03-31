import { ScrollReveal } from '@/components/shared/ScrollReveal';

const steps = [
  {
    number: '01',
    title: 'Consultation',
    description:
      "We'll discuss your desired look and choose the perfect lash style for your eye shape and lifestyle.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Preparation',
    description:
      'Relax while we gently cleanse and prepare your natural lashes for the application process.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 3l1.5 3.2 3.5.5-2.5 2.5.6 3.5L12 11l-3.1 1.7.6-3.5L7 6.7l3.5-.5z" />
        <path d="M5 19l2-2" />
        <path d="M19 19l-2-2" />
        <path d="M12 21v-3" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Application',
    description:
      'Precise, gentle application of each individual lash while you rest comfortably with your eyes closed.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Reveal',
    description:
      'Open your eyes to your stunning new lashes! We will review aftercare tips to keep them looking beautiful.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export function WhatToExpect() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-gold font-body text-sm font-semibold uppercase tracking-widest">
              Your Visit
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-navy tracking-[-0.03em]">
              What to Expect
            </h2>
            <div className="mt-3 mx-auto w-16 h-0.5 bg-gold rounded-full" />
            <p className="mt-4 text-navy-light font-body text-lg max-w-xl mx-auto leading-[1.7]">
              Your first visit, step by step
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-12 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px border-t-2 border-dashed border-gold/40" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 120}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Mobile connecting line */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden absolute top-24 left-1/2 -translate-x-px h-10 border-l-2 border-dashed border-gold/40" />
                  )}

                  {/* Number circle */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gold flex items-center justify-center text-navy font-display font-bold text-lg shadow-[0_2px_12px_rgba(246,214,115,0.35)]">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mt-5 text-navy-light">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 font-display text-xl font-semibold text-navy">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm text-navy-light font-body leading-[1.7] max-w-[240px]">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
