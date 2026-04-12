import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { GalleryGrid } from './GalleryGrid'

const GALLERY_IMAGES = [
  { src: '/images/gallery/composite-hybrid.jpg',   alt: 'Hybrid lash extension — before & after',    aspect: 'portrait' },
  { src: '/images/gallery/composite-classic.jpg',  alt: 'Classic lash extension — before & after',   aspect: 'portrait' },
  { src: '/images/before-after/after-hybrid.jpg',  alt: 'Stunning hybrid lash result',               aspect: 'landscape' },
  { src: '/images/gallery/composite-classic2.jpg', alt: 'Classic lash set — two angle views',        aspect: 'portrait' },
  { src: '/images/gallery/composite-asian.jpg',    alt: 'Volume lash extensions — before & after',   aspect: 'portrait' },
  { src: '/images/before-after/after-classic.jpg', alt: 'Classic lash close-up after',               aspect: 'landscape' },
  { src: '/images/gallery/composite-removal.jpg',  alt: 'Natural lash enhancement transformation',   aspect: 'portrait' },
  { src: '/images/before-after/before-hybrid.jpg', alt: 'Natural lashes before treatment',           aspect: 'landscape' },
  { src: '/images/gallery/after-classic-03.jpg',   alt: 'Classic lash extension — final result',          aspect: 'landscape' },
  { src: '/images/gallery/after-hybrid-02.jpg',    alt: 'Hybrid lash extension — dramatic volume',       aspect: 'landscape' },
  { src: '/images/gallery/after-refill-01.jpg',    alt: 'Classic refill — added volume',                 aspect: 'portrait' },
  { src: '/images/gallery/after-add-01.jpg',       alt: 'Additional lashes for extra drama',              aspect: 'portrait' },
  { src: '/images/before-after/before-refill-01.jpg', alt: 'Classic refill — before treatment',           aspect: 'landscape' },
  { src: '/images/before-after/before-removal-01.jpg', alt: 'Lash removal — before treatment',             aspect: 'landscape' },
  { src: '/images/gallery/after-removal-01.jpg',   alt: 'Lash removal — after treatment',                  aspect: 'landscape' },
]

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-navy pt-32 pb-20 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 70% 30%, rgba(84,94,133,0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(246,214,115,0.08) 0%, transparent 50%)',
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
              Our Gallery
            </h1>
            <p className="mt-5 font-body text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Browse our portfolio of custom lash sets, each designed to
              complement individual eye shapes and personal style.
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <GalleryGrid images={GALLERY_IMAGES} />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-navy py-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(246,214,115,0.06) 0%, transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Ready for Your Transformation?
            </h2>
            <p className="mt-4 font-body text-base text-white/70 max-w-lg mx-auto leading-relaxed">
              Book your appointment today and let us create a look that is
              uniquely yours.
            </p>
            <div className="mt-8">
              <Button variant="gold" size="lg" href="/booking">
                Book Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
