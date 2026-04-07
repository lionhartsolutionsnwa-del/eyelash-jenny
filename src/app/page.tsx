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
        <FinalCTA />
      </main>
      <Footer />
      <BookingTicker />
    </>
  )
}
