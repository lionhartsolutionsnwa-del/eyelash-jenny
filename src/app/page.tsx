import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { ServicesOverview } from '@/components/home/ServicesOverview'
import { BeforeAfterSlider } from '@/components/home/BeforeAfterSlider'
import { AboutJenny } from '@/components/home/AboutJenny'
import { WhatToExpect } from '@/components/home/WhatToExpect'
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { FinalCTA } from '@/components/home/FinalCTA'
import { BookingTicker } from '@/components/shared/BookingTicker'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesOverview />
        <BeforeAfterSlider />
        <AboutJenny />
        <WhatToExpect />
        <TestimonialsCarousel />
        <InstagramFeed />
        {/* Book Now CTA strip */}
        <section className="py-16 bg-navy text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
              Ready for Your Lash Transformation?
            </h2>
            <p className="font-body text-white/70 text-base mb-6">
              Book your appointment in just a few clicks
            </p>
            <Button variant="gold" size="lg" href="/book">
              Book Now
            </Button>
          </div>
        </section>
        <FinalCTA />
      </main>
      <Footer />
      <BookingTicker />
    </>
  )
}
