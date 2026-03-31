'use client'

import { useReducer, useCallback, useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SERVICES = [
  {
    id: 'classic',
    name: 'Classic Lashes',
    description: 'One extension per natural lash for a subtle, polished look.',
    price: 119,
    duration: '2 hours',
  },
  {
    id: 'hybrid',
    name: 'Hybrid Lashes',
    description: 'Mixed classic and volume fans for textured fullness.',
    price: 149,
    duration: '2.5 hours',
    popular: true,
  },
  {
    id: 'removal',
    name: 'Lash Removal',
    description: 'Gentle professional removal that keeps natural lashes healthy.',
    price: 25,
    duration: '30 min',
  },
]

const STEP_LABELS = ['Service', 'Date & Time', 'Your Info', 'Confirm']

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

interface WizardState {
  step: number
  service: string
  date: Date | null
  time: string
  name: string
  phone: string
  email: string
  notes: string
  errors: Record<string, string>
  submitting: boolean
}

type WizardAction =
  | { type: 'SET_SERVICE'; payload: string }
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_DONE' }

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_SERVICE':
      return { ...state, service: action.payload }
    case 'SET_DATE':
      return { ...state, date: action.payload, time: '' }
    case 'SET_TIME':
      return { ...state, time: action.payload }
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' },
      }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, 3) }
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 0) }
    case 'SUBMIT':
      return { ...state, submitting: true }
    case 'SUBMIT_DONE':
      return { ...state, submitting: false }
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function generateSlots(date: Date): { time: string; available: boolean }[] {
  // Deterministic "random" based on day of month so slots stay stable per date
  const seed = date.getDate() + date.getMonth() * 31
  const slots: { time: string; available: boolean }[] = []
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 0) break
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const suffix = h >= 12 ? 'PM' : 'AM'
      const label = `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`
      // ~30% booked using a simple hash
      const hash = (seed * 7 + h * 13 + m * 3) % 10
      slots.push({ time: label, available: hash > 2 })
    }
  }
  return slots
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBeforeToday(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const check = new Date(date)
  check.setHours(0, 0, 0, 0)
  return check < today
}

/* ------------------------------------------------------------------ */
/* Inner booking component (uses useSearchParams)                      */
/* ------------------------------------------------------------------ */

function BookingWizardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselected = searchParams.get('service') || ''

  const [state, dispatch] = useReducer(reducer, {
    step: 0,
    service: SERVICES.find((s) => s.id === preselected)?.id || '',
    date: null,
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    errors: {},
    submitting: false,
  })

  const selectedService = SERVICES.find((s) => s.id === state.service)

  const handleNext = useCallback(() => {
    if (state.step === 2) {
      // Validate step 3
      const errors: Record<string, string> = {}
      if (!state.name || state.name.trim().length < 2) {
        errors.name = 'Please enter your name (at least 2 characters)'
      }
      const phoneClean = state.phone.replace(/\D/g, '')
      if (!phoneClean || phoneClean.length < 10) {
        errors.phone = 'Please enter a valid phone number'
      }
      if (Object.keys(errors).length > 0) {
        dispatch({ type: 'SET_ERRORS', payload: errors })
        return
      }
    }
    dispatch({ type: 'NEXT' })
  }, [state.step, state.name, state.phone])

  const handleConfirm = useCallback(() => {
    dispatch({ type: 'SUBMIT' })
    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'SUBMIT_DONE' })
      const params = new URLSearchParams({
        id: 'mock-123',
        service: state.service,
        date: state.date ? state.date.toISOString() : '',
        time: state.time,
        name: state.name,
        phone: state.phone,
      })
      router.push(`/booking/confirmation?${params.toString()}`)
    }, 1200)
  }, [state, router])

  const canContinue = useMemo(() => {
    switch (state.step) {
      case 0:
        return !!state.service
      case 1:
        return !!state.date && !!state.time
      case 2:
        return state.name.trim().length >= 2 && state.phone.replace(/\D/g, '').length >= 10
      default:
        return true
    }
  }, [state.step, state.service, state.date, state.time, state.name, state.phone])

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-sm text-navy-light">
            Step {state.step + 1} of 4
          </p>
          <Badge variant="new" size="sm">Takes 30 seconds</Badge>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-gray-light rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gold rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${((state.step + 1) / 4) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={[
                'font-body text-xs text-center transition-colors duration-200',
                i <= state.step ? 'text-navy font-medium' : 'text-gray',
              ].join(' ')}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content with slide animation */}
      <div className="relative overflow-hidden">
        {/* Step 0: Service */}
        {state.step === 0 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy tracking-tight mb-2">
              Choose Your Service
            </h2>
            <p className="font-body text-base text-navy-light mb-8">
              Select the lash service that is right for you.
            </p>

            <div className="flex flex-col gap-4">
              {SERVICES.map((service) => {
                const selected = state.service === service.id
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_SERVICE', payload: service.id })}
                    className={[
                      'relative flex items-start gap-4 w-full text-left rounded-2xl p-5 border-2 transition-[border-color,box-shadow] duration-200 cursor-pointer',
                      selected
                        ? 'border-gold bg-gold/5 shadow-[0_0_0_1px_rgba(246,214,115,0.3)]'
                        : 'border-gray-light bg-white hover:border-navy-light/30',
                    ].join(' ')}
                  >
                    {/* Radio circle */}
                    <span
                      className={[
                        'mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200',
                        selected ? 'border-gold bg-gold' : 'border-gray',
                      ].join(' ')}
                    >
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5 2 6" stroke="#101B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg font-semibold text-navy">
                          {service.name}
                        </h3>
                        {service.popular && (
                          <Badge variant="popular" size="sm">Most Popular</Badge>
                        )}
                      </div>
                      <p className="mt-1 font-body text-sm text-navy-light">{service.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="font-display text-xl font-bold text-gold-dark">${service.price}</span>
                        <span className="font-body text-xs text-gray">{service.duration}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Date & Time */}
        {state.step === 1 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy tracking-tight mb-2">
              Pick a Date & Time
            </h2>
            <p className="font-body text-base text-navy-light mb-8">
              Choose your preferred appointment slot.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <CalendarPicker
                selectedDate={state.date}
                onSelect={(d) => dispatch({ type: 'SET_DATE', payload: d })}
              />
              <div>
                {state.date ? (
                  <TimeSlotPicker
                    date={state.date}
                    selectedTime={state.time}
                    onSelect={(t) => dispatch({ type: 'SET_TIME', payload: t })}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <p className="font-body text-sm text-gray">Select a date to see available times</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Info */}
        {state.step === 2 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy tracking-tight mb-2">
              Your Information
            </h2>
            <p className="font-body text-base text-navy-light mb-8">
              We just need a few details to confirm your booking.
            </p>

            <div className="flex flex-col gap-5 max-w-md">
              <Input
                label="Full Name"
                name="name"
                required
                value={state.name}
                error={state.errors.name}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                required
                placeholder="(555) 123-4567"
                value={state.phone}
                error={state.errors.phone}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'phone', value: e.target.value })}
              />
              <Input
                label="Email (optional)"
                name="email"
                type="email"
                value={state.email}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
              />
              <div className="relative">
                <textarea
                  name="notes"
                  value={state.notes}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full bg-white rounded-xl px-4 pt-5 pb-2 text-navy font-body text-base border border-gray-light outline-none transition-[border-color,box-shadow] duration-200 focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none"
                />
                <label className="pointer-events-none absolute left-4 top-1.5 text-xs text-navy-light font-body">
                  Notes (optional)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {state.step === 3 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy tracking-tight mb-2">
              Review Your Booking
            </h2>
            <p className="font-body text-base text-navy-light mb-8">
              Make sure everything looks right before confirming.
            </p>

            <Card elevated className="p-6 md:p-8">
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Service</p>
                    <p className="font-display text-xl font-semibold text-navy mt-1">
                      {selectedService?.name}
                    </p>
                  </div>
                  <span className="font-display text-2xl font-bold text-gold-dark">
                    ${selectedService?.price}
                  </span>
                </div>

                <div className="h-px bg-gray-light" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Date</p>
                    <p className="font-body text-base text-navy mt-1">
                      {state.date ? formatDateLong(state.date) : ''}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Time</p>
                    <p className="font-body text-base text-navy mt-1">{state.time}</p>
                  </div>
                </div>

                <div>
                  <p className="font-body text-xs text-gray uppercase tracking-wider">Duration</p>
                  <p className="font-body text-base text-navy mt-1">{selectedService?.duration}</p>
                </div>

                <div className="h-px bg-gray-light" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Name</p>
                    <p className="font-body text-base text-navy mt-1">{state.name}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Phone</p>
                    <p className="font-body text-base text-navy mt-1">{state.phone}</p>
                  </div>
                </div>
                {state.email && (
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Email</p>
                    <p className="font-body text-base text-navy mt-1">{state.email}</p>
                  </div>
                )}
                {state.notes && (
                  <div>
                    <p className="font-body text-xs text-gray uppercase tracking-wider">Notes</p>
                    <p className="font-body text-base text-navy-light mt-1">{state.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="mt-8 flex flex-col items-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={handleConfirm}
                loading={state.submitting}
                disabled={state.submitting}
                className="w-full max-w-sm"
              >
                Confirm Booking
              </Button>
              <p className="font-body text-xs text-gray text-center max-w-sm">
                By confirming, you agree to our cancellation policy. We will send a confirmation to your phone.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {state.step < 3 && (
        <div className="mt-10 flex items-center justify-between">
          {state.step > 0 ? (
            <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'BACK' })}>
              <svg className="mr-1" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8L10 4" />
              </svg>
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            variant="gold"
            size="md"
            disabled={!canContinue}
            onClick={handleNext}
          >
            Continue
            <svg className="ml-1" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4L10 8L6 12" />
            </svg>
          </Button>
        </div>
      )}
      {state.step === 3 && !state.submitting && (
        <div className="mt-6 flex justify-start">
          <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'BACK' })}>
            <svg className="mr-1" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8L10 4" />
            </svg>
            Back
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Calendar Picker                                                     */
/* ------------------------------------------------------------------ */

function CalendarPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const canGoBack =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const goPrev = () => {
    if (!canGoBack) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoBack}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-light/50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors duration-200"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
        </button>
        <span className="font-display text-lg font-semibold text-navy">{monthName}</span>
        <button
          type="button"
          onClick={goNext}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-light/50 cursor-pointer transition-colors duration-200"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4L10 8L6 12" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-center font-body text-xs text-gray font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />
          }
          const date = new Date(viewYear, viewMonth, day)
          const past = isBeforeToday(date)
          const isToday = isSameDay(date, today)
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

          return (
            <button
              key={day}
              type="button"
              disabled={past}
              onClick={() => onSelect(date)}
              className={[
                'relative flex items-center justify-center w-10 h-10 rounded-full font-body text-sm transition-[background-color,color] duration-200 cursor-pointer',
                past && 'text-gray/40 pointer-events-none',
                !past && !isSelected && 'text-navy hover:bg-gold/10',
                isSelected && 'bg-gold text-navy font-semibold',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Time Slot Picker                                                    */
/* ------------------------------------------------------------------ */

function TimeSlotPicker({
  date,
  selectedTime,
  onSelect,
}: {
  date: Date
  selectedTime: string
  onSelect: (t: string) => void
}) {
  const slots = useMemo(() => generateSlots(date), [date])
  const available = slots.filter((s) => s.available)

  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-navy mb-1">
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </h3>
      <p className="font-body text-sm text-navy-light mb-4">
        {available.length} slots available
      </p>

      {available.length === 0 ? (
        <div className="rounded-xl bg-offwhite p-6 text-center">
          <p className="font-body text-sm text-gray">No slots available on this date. Please select another day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time
            return (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelect(slot.time)}
                className={[
                  'rounded-full px-3 py-2 font-body text-sm transition-[background-color,border-color,color] duration-200 border cursor-pointer',
                  !slot.available && 'bg-gray-light/50 text-gray/40 border-transparent pointer-events-none line-through',
                  slot.available && !isSelected && 'bg-white border-navy/20 text-navy hover:border-gold hover:bg-gold/5',
                  isSelected && 'bg-gold border-gold text-navy font-semibold',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {slot.time}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page component (wraps in Suspense for useSearchParams)              */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 bg-offwhite">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
              <p className="font-body text-navy-light">Loading booking...</p>
            </div>
          }
        >
          <BookingWizardInner />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
