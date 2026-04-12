import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FAQAccordion } from './FAQAccordion'

const SERVICES = [
  {
    id: 'classic',
    name: 'Classic (Full Set)',
    tagline: 'Timeless Elegance',
    description:
      'Our Classic Lash set applies one premium synthetic extension to each natural lash, creating a naturally enhanced look that opens up your eyes. Perfect for clients who want subtle definition and a polished everyday appearance without the need for mascara.',
    included: [
      'Full set application (one extension per natural lash)',
      'Personalized curl, length, and thickness consultation',
      'Pre-treatment cleanse and primer',
      'Comfortable under-eye gel pad protection',
      'Aftercare kit with cleansing brush',
    ],
    comparison:
      'Choose Classic if you prefer a natural, mascara-like finish. For more volume and texture, consider our Hybrid set.',
    price: 119,
    duration: '90 min',
    slug: 'classic',
  },
  {
    id: 'hybrid',
    name: 'Hybrid (Full Set)',
    tagline: 'Best of Both Worlds',
    description:
      'Our most requested service blends Classic and Volume techniques for a textured, multidimensional look. Hybrid Lashes combine single extensions with handmade fans to deliver fullness with a natural feel — ideal for clients who want noticeable glamour that still looks effortless.',
    included: [
      'Full set of mixed Classic and Volume fans',
      'Custom mapping for your unique eye shape',
      'Pre-treatment cleanse and primer',
      'Comfortable under-eye gel pad protection',
      'Aftercare kit with cleansing brush',
      'Complimentary lash bath at pickup',
    ],
    comparison:
      'Hybrid is the perfect middle ground — more dramatic than Classic but softer than a full Volume set. Most popular with first-time clients.',
    price: 149,
    duration: '90 min',
    slug: 'hybrid',
    popular: true,
  },
  {
    id: 'classic-refill',
    name: 'Classic Refill',
    tagline: 'Keep It Fresh',
    description:
      'Maintain your Classic set between appointments. As your natural lashes shed, fills replace lost extensions and repair any sparse areas, restoring your look to its original fullness. Recommended every 2–3 weeks.',
    included: [
      'Fill of shed or grown-out extensions',
      'Removal of any twisted or overgrown lashes',
      'Pre-treatment cleanse',
      'Touch-up to restore symmetry and fullness',
    ],
    comparison:
      'Book within 3 weeks of your last appointment for fill pricing. Sets older than 3 weeks may require a full set.',
    price: 75,
    duration: '60 min',
    slug: 'classic-refill',
  },
  {
    id: 'removal',
    name: 'Lash Extension Removal',
    tagline: 'Professional Removal',
    description:
      'Professional removal of your existing lash extensions. We gently dissolve the adhesive without damaging your natural lashes. Quick and comfortable.',
    included: [
      'Professional-grade cream remover application',
      'Gentle extension dissolution and removal',
      'Natural lash cleanse and conditioning',
    ],
    comparison:
      'We recommend professional removal rather than picking or pulling at extensions, which can damage your natural lashes.',
    price: 35,
    duration: '20 min',
    slug: 'removal',
  },
]

const FAQ_ITEMS = [
  {
    question: 'How long do lash extensions last?',
    answer:
      'With proper care, lash extensions last 2 to 3 weeks before a fill is recommended. Your natural lash growth cycle means extensions shed gradually, so most clients book a fill every 2 to 3 weeks to keep their set looking fresh and full.',
  },
  {
    question: 'Will extensions damage my natural lashes?',
    answer:
      'No, when applied correctly by a trained professional, lash extensions will not damage your natural lashes. We carefully select the appropriate weight and length for each individual lash to ensure your natural lashes stay healthy throughout the wear cycle.',
  },
  {
    question: 'How should I prepare for my appointment?',
    answer:
      'Come with clean, makeup-free lashes. Avoid using oil-based products around the eye area on the day of your appointment. Remove contact lenses if possible, and skip the caffeine — you will be lying still with your eyes closed for 1 to 3 hours, so being relaxed helps.',
  },
  {
    question: 'Can I wear mascara with extensions?',
    answer:
      'We recommend avoiding mascara on your extensions, especially waterproof formulas. Mascara can weaken the adhesive bond and cause premature shedding. The beauty of extensions is that you will not need mascara — your lashes will already look full and defined.',
  },
  {
    question: 'What is the difference between Classic and Hybrid?',
    answer:
      'Classic uses one extension per natural lash for a natural, defined look. Hybrid is a blend of both — you get some volume fans mixed in for texture and density, making it more dramatic than Classic while still looking natural.',
  },
  {
    question: 'How often should I get a fill?',
    answer:
      'We recommend booking fills every 2 to 3 weeks. By the 3-week mark, most clients have lost 30 to 40% of their extensions due to the natural lash shedding cycle. Waiting longer than 3 weeks may require a full set rather than a fill.',
  },
  {
    question: 'What if I am allergic?',
    answer:
      'We perform a patch test for first-time clients to check for any sensitivity to the adhesive. If you have known allergies or sensitive eyes, please let us know when booking so we can prepare hypoallergenic options. Your comfort and safety are always our priority.',
  },
]

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-gold-dark"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.333 4L6 11.333 2.667 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      className="mr-1 inline-block"
      width="14"
      height="14"
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
  )
}

export default function ServicesPage() {
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
                'radial-gradient(ellipse at 20% 50%, rgba(84,94,133,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(246,214,115,0.08) 0%, transparent 50%)',
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
              Our Services
            </h1>
            <p className="mt-5 font-body text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              From subtle enhancements to full glamour, every set is
              custom-designed to complement your natural beauty and lifestyle.
            </p>
          </div>
        </section>

        {/* Services list */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-6">
            {SERVICES.map((service) => (
              <Card key={service.id} elevated className="p-8 md:p-10 relative overflow-hidden mb-8 last:mb-0">
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-6 right-6">
                    <Badge variant="popular" size="md">Most Popular</Badge>
                  </div>
                )}

                {/* Header row */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy tracking-tight">
                    {service.name}
                  </h3>
                  <span className="font-body text-sm text-navy-light italic">
                    {service.tagline}
                  </span>
                </div>

                <p className="mt-4 font-body text-base text-navy-light leading-[1.7]">
                  {service.description}
                </p>

                {/* What's Included */}
                <div className="mt-6">
                  <h4 className="font-display text-lg font-semibold text-navy mb-3">
                    What&apos;s Included
                  </h4>
                  <ul className="space-y-2">
                    {service.included.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-body text-sm text-navy-light leading-relaxed">
                        <CheckIcon />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Comparison note */}
                {service.comparison && (
                  <p className="mt-5 font-body text-sm text-navy-light/70 italic border-l-2 border-gold/40 pl-4">
                    {service.comparison}
                  </p>
                )}

                {/* Price, duration, CTA */}
                <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-gray-light pt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl md:text-4xl font-bold text-gold-dark">
                      ${service.price}
                    </span>
                  </div>
                  <Badge variant="new" size="md">
                    <ClockIcon />
                    {service.duration}
                  </Badge>
                  <div className="ml-auto">
                    <Button variant="gold" size="md" href={`/booking?service=${service.slug}`}>
                      Book This Service
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-offwhite py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy text-center tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 font-body text-base text-navy-light text-center max-w-xl mx-auto leading-relaxed">
              Everything you need to know before your appointment.
            </p>
            <div className="mt-12">
              <FAQAccordion items={FAQ_ITEMS} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
