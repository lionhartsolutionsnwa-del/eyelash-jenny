'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SOCIAL_LINKS } from '@/lib/constants'

interface BookingData {
  id: string
  date: string
  start_time: string
  status: string
  services: { name: string; price: number; duration_minutes?: number }[] | null
}

interface ServiceInfo {
  name: string
  duration: string
  price: number
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const [showCheck, setShowCheck] = useState(false)
  const [copied, setCopied] = useState(false)
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [service, setService] = useState<ServiceInfo>({ name: 'Booking', duration: '', price: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bookingId = searchParams.get('id')

  // Fetch booking details by ID (server-side lookup, no PII in URL)
  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided.')
      setLoading(false)
      return
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/${bookingId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Booking not found.')
          setLoading(false)
          return
        }
        const data: BookingData = await res.json()
        setBooking(data)

        // Map service data to display format
        const svc = data.services?.[0]
        if (svc) {
          const durationMin = svc.duration_minutes ?? 60
          const h = Math.floor(durationMin / 60)
          const m = durationMin % 60
          const durationStr = m > 0 ? `${h} hr ${m} min` : h === 0 ? `${durationMin} min` : `${h} hour${h > 1 ? 's' : ''}`
          setService({ name: svc.name, duration: durationStr, price: svc.price })
        }
        setLoading(false)
      } catch {
        setError('Failed to load booking details.')
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  // Date formatting
  const dateStr = booking?.date || ''
  const time = booking?.start_time || ''
  const dateObj = dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Build Google Calendar URL
  const calStart = dateStr ? new Date(dateStr) : new Date()
  const calStartStr = calStart.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const calEnd = new Date(calStart.getTime() + 2.5 * 60 * 60 * 1000)
  const calEndStr = calEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const calUrl = `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(service.name + ' - Jenny Professional Eyelash')}&dates=${calStartStr}/${calEndStr}&details=${encodeURIComponent('Your lash appointment at Jenny Professional Eyelash. Come with clean, makeup-free lashes.')}&location=${encodeURIComponent('5400 S Pinnacle Hills Pkwy, Rogers, AR 72756')}`

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + '/booking')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-body text-base text-navy-light">Loading your booking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy tracking-tight">
          Booking Not Found
        </h1>
        <p className="mt-3 font-body text-base text-navy-light max-w-md mx-auto">
          {error}
        </p>
        <div className="mt-8">
          <Button variant="gold" size="md" href="/booking">
            Make a New Booking
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      {/* Success checkmark */}
      <div className="flex justify-center mb-8">
        <div
          className="flex items-center justify-center w-24 h-24 rounded-full bg-gold/20 transition-transform duration-500 ease-out"
          style={{
            transform: showCheck ? 'scale(1)' : 'scale(0.5)',
            opacity: showCheck ? 1 : 0,
          }}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gold">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 10L13 21L8 16"
                stroke="#101B4B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy tracking-tight">
        Booking Confirmed!
      </h1>
      <p className="mt-3 font-body text-base text-navy-light max-w-md mx-auto">
        We are looking forward to seeing you. A confirmation email will be sent if you provided one.
      </p>

      {/* Summary card */}
      <Card elevated className="mt-10 p-6 md:p-8 text-left">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-body text-xs text-gray uppercase tracking-wider">Service</p>
              <p className="font-display text-xl font-semibold text-navy mt-1">{service.name}</p>
            </div>
            <span className="font-display text-2xl font-bold text-gold-dark">${service.price}</span>
          </div>

          <div className="h-px bg-gray-light" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-xs text-gray uppercase tracking-wider">Date</p>
              <p className="font-body text-base text-navy mt-1">{formattedDate}</p>
            </div>
            <div>
              <p className="font-body text-xs text-gray uppercase tracking-wider">Time</p>
              <p className="font-body text-base text-navy mt-1">{time || 'TBD'}</p>
            </div>
          </div>

          {booking?.status && (
            <>
              <div className="h-px bg-gray-light" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs text-gray uppercase tracking-wider">Status</p>
                  <p className="font-body text-base text-navy mt-1 capitalize">{booking.status}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* SMS Disclosure */}
      <div className="mt-8 rounded-xl bg-navy/5 p-5 text-left">
        <p className="font-display text-sm font-semibold text-navy mb-2">
          SMS Notifications from Jenny Professional Eyelash
        </p>
        <p className="font-body text-xs text-navy-light leading-relaxed">
          By providing your phone number, you consent to receive appointment reminders and confirmations via SMS from Jenny Professional Eyelash. Message frequency varies. Standard msg rates apply. Reply STOP to opt out at any time. Text HELP for assistance. For full details, see our{' '}
          <a href="/privacy-policy" className="underline hover:text-navy transition-colors">Privacy Policy</a>
          {' '}and{' '}
          <a href="/terms" className="underline hover:text-navy transition-colors">Terms of Service</a>.
        </p>
      </div>

      {/* What to Prepare */}
      <div className="mt-10 text-left">
        <h2 className="font-display text-xl font-semibold text-navy mb-4">What to Prepare</h2>
        <ul className="space-y-3">
          {[
            'Come with clean, makeup-free lashes',
            'Avoid caffeine 2 hours before your appointment',
            `Your appointment will take approximately ${service.duration}`,
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <svg
                className="mt-0.5 shrink-0 text-gold-dark"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M13.333 4L6 11.333 2.667 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-body text-sm text-navy-light leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="gold" size="md" href={calUrl}>
          <svg className="mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Add to Calendar
        </Button>
        <Button variant="secondary" size="md" href="/booking">
          Book Another Appointment
        </Button>
      </div>

      {/* Share */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="font-body text-sm text-navy-light hover:text-gold-dark transition-colors duration-200 cursor-pointer underline underline-offset-4 decoration-gray-light"
        >
          {copied ? 'Link copied!' : 'Share with a friend'}
        </button>
      </div>

      {/* Instagram CTA */}
      <div className="mt-12 rounded-2xl bg-navy/5 p-6">
        <p className="font-display text-lg font-semibold text-navy">Follow us on Instagram</p>
        <p className="mt-1 font-body text-sm text-navy-light">
          See our latest work and get lash care tips.
        </p>
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 font-body text-sm font-medium text-gold-dark hover:text-navy transition-colors duration-200"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          @jennyprofessionaleyelash
        </a>
      </div>

    </div>
  )
}

export { ConfirmationContent }
