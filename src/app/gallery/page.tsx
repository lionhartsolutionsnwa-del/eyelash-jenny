import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { GalleryGrid } from './GalleryGrid'

const GALLERY_IMAGES = [
  { src: 'https://placehold.co/400x500', alt: 'Classic lash set - natural look', aspect: 'portrait' },
  { src: 'https://placehold.co/500x400', alt: 'Hybrid lash set - textured volume', aspect: 'landscape' },
  { src: 'https://placehold.co/400x550', alt: 'Volume lash close-up', aspect: 'portrait' },
  { src: 'https://placehold.co/500x350', alt: 'Before and after classic lashes', aspect: 'landscape' },
  { src: 'https://placehold.co/400x480', alt: 'Natural lash enhancement', aspect: 'portrait' },
  { src: 'https://placehold.co/500x400', alt: 'Mega volume set', aspect: 'landscape' },
  { src: 'https://placehold.co/400x520', alt: 'Wispy hybrid lash set', aspect: 'portrait' },
  { src: 'https://placehold.co/500x380', alt: 'Cat eye lash mapping', aspect: 'landscape' },
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
