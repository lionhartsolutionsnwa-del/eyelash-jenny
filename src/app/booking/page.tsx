'use client'

import { useReducer, useCallback, useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  description: string | null
  popular?: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

interface WizardState {
  step: number
  service: Service | null
  date: Date | null
  time: string
  name: string
  phone: string
  email: string
  notes: string
  errors: Record<string, string>
  submitting: boolean
  loadingServices: boolean
  loadingSlots: boolean
}

type WizardAction =
  | { type: 'SET_SERVICE'; payload: Service }
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_DONE' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'SET_SERVICES_LOADING'; payload: boolean }
  | { type: 'SET_SLOTS_LOADING'; payload: boolean }

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_SERVICE':
      return { ...state, service: action.payload, time: '' }
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
      return { ...state, submitting: true, errors: {} }
    case 'SUBMIT_DONE':
      return { ...state, submitting: false }
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, errors: { submit: action.payload } }
    case 'SET_SERVICES_LOADING':
      return { ...state, loadingServices: action.payload }
    case 'SET_SLOTS_LOADING':
      return { ...state, loadingSlots: action.payload }
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTimeForAPI(time: string): string {
  // Convert "9:00 AM" to "09:00:00" (24-hour HH:MM:SS)
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    // Already in 24h format or invalid
    return time.length === 5 ? `${time}:00` : time
  }
  let h = parseInt(match[1], 10)
  const m = match[2]
  const suffix = match[3].toUpperCase()
  if (suffix === 'PM' && h !== 12) h += 12
  if (suffix === 'AM' && h === 12) h = 0
  return `${h.toString().padStart(2, '0')}:${m}:00`
}

function isBeforeToday(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const check = new Date(date)
  check.setHours(0, 0, 0, 0)
  return check < today
}

const STEP_LABELS = ['Service', 'Date & Time', 'Your Info', 'Confirm']

/* ------------------------------------------------------------------ */
/* Inner booking component (uses useSearchParams)                      */
/* ------------------------------------------------------------------ */

function BookingWizardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselected = searchParams.get('service') || ''

  const [services, setServices] = useState<Service[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  const [state, dispatch] = useReducer(reducer, {
    step: 0,
    service: null,
    date: null,
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    errors: {},
    submitting: false,
    loadingServices: true,
    loadingSlots: false,
  })

  // Fetch services from Supabase on mount
  useEffect(() => {
    async function loadServices() {
      dispatch({ type: 'SET_SERVICES_LOADING', payload: true })
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('services')
          .select('id, name, price, duration_minutes, description')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error
        const loaded = (data || []) as Service[]
        setServices(loaded)

        // Pre-select if service param was passed
        if (preselected) {
          const match = loaded.find(
            (s) => s.name.toLowerCase().replace(/\s+/g, '-') === preselected
          )
          if (match) dispatch({ type: 'SET_SERVICE', payload: match })
        }
      } catch (err) {
        console.error('Failed to load services:', err)
        // Fallback to hardcoded
        setServices([
          { id: 'classic', name: 'Classic Lashes', price: 119, duration_minutes: 120, description: 'One extension per natural lash.' },
          { id: 'hybrid', name: 'Hybrid Lashes', price: 149, duration_minutes: 150, description: 'Mixed classic and volume.', popular: true },
          { id: 'removal', name: 'Lash Removal', price: 25, duration_minutes: 30, description: 'Safe removal.' },
        ])
      } finally {
        dispatch({ type: 'SET_SERVICES_LOADING', payload: false })
      }
    }
    loadServices()
  }, [preselected])

  // Fetch available slots when date changes
  useEffect(() => {
    if (!state.date || !state.service) return

    async function loadSlots() {
      if (!state.date || !state.service) return
      dispatch({ type: 'SET_SLOTS_LOADING', payload: true })
      try {
        const dateStr = formatDateISO(state.date)
        const response = await fetch(
          `/api/availability/slots?date=${dateStr}&service_id=${state.service!.id}`
        )
        const data = await response.json()
        setSlots(data.slots || [])
      } catch (err) {
        console.error('Failed to load slots:', err)
        setSlots([])
      } finally {
        dispatch({ type: 'SET_SLOTS_LOADING', payload: false })
      }
    }
    loadSlots()
  }, [state.date, state.service])

  const handleNext = useCallback(() => {
    if (state.step === 2) {
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

  const handleConfirm = useCallback(async () => {
    if (!state.service || !state.date || !state.time) return

    dispatch({ type: 'SUBMIT' })

    try {
      const payload: Record<string, string> = {
        client_name: state.name.trim(),
        client_phone: state.phone.replace(/\D/g, ''),
        service_id: state.service!.id,
        date: formatDateISO(state.date!),
        start_time: formatTimeForAPI(state.time),
      }
      if (state.email.trim()) payload.client_email = state.email.trim()
      if (state.notes.trim()) payload.notes = state.notes.trim()

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show detailed error for debugging
        const errorMsg = data.error || data.issues?.map((i: { message: string }) => i.message).join(', ') || 'Booking failed. Please try again.'
        dispatch({ type: 'SUBMIT_ERROR', payload: errorMsg })
        return
      }

      // Success - redirect to confirmation
      const params = new URLSearchParams({
        id: data.id,
        service: state.service!.name,
        date: formatDateISO(state.date!),
        time: state.time,
        name: state.name,
        phone: state.phone,
      })
      router.push(`/booking/confirmation?${params.toString()}`)
    } catch (err) {
      console.error('Booking error:', err)
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Network error. Please try again.' })
    }
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

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} hours ${m} min` : `${h} hours`
  }

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

        <div className="relative h-1.5 bg-gray-light rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gold rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${((state.step + 1) / 4) * 100}%` }}
          />
        </div>

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

      {/* Step content */}
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

            {state.loadingServices ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="font-body text-sm text-gray">Loading services...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {services.map((service) => {
                  const selected = state.service?.id === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_SERVICE', payload: service })}
                      className={[
                        'relative flex items-start gap-4 w-full text-left rounded-2xl p-5 border-2 transition-[border-color,box-shadow] duration-200 cursor-pointer',
                        selected
                          ? 'border-gold bg-gold/5 shadow-[0_0_0_1px_rgba(246,214,115,0.3)]'
                          : 'border-gray-light bg-white hover:border-navy-light/30',
                      ].join(' ')}
                    >
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
                          <h3 className="font-display text-lg font-semibold text-navy">{service.name}</h3>
                          {service.popular && <Badge variant="popular" size="sm">Most Popular</Badge>}
                        </div>
                        <p className="mt-1 font-body text-sm text-navy-light">{service.description}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <span className="font-display text-xl font-bold text-gold-dark">${service.price}</span>
                          <span className="font-body text-xs text-gray">{formatDuration(service.duration_minutes)}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
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
                {state.loadingSlots ? (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      <p className="font-body text-xs text-gray">Loading times...</p>
                    </div>
                  </div>
                ) : state.date ? (
                  <TimeSlotPicker
                    slots={slots}
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
                      {state.service?.name}
                    </p>
                  </div>
                  <span className="font-display text-2xl font-bold text-gold-dark">
                    ${state.service?.price}
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
                  <p className="font-body text-base text-navy mt-1">
                    {state.service ? formatDuration(state.service.duration_minutes) : ''}
                  </p>
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

                {/* Error message */}
                {state.errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-body text-sm text-red-600">{state.errors.submit}</p>
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

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center font-body text-xs text-gray font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const date = new Date(viewYear, viewMonth, day)
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getFullYear() === viewYear
          const isPast = isBeforeToday(date)
          const isToday = date.toDateString() === today.toDateString()

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(date)}
              className={[
                'w-full aspect-square rounded-xl font-body text-sm flex items-center justify-center cursor-pointer transition-all duration-150',
                isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gold/20',
                isSelected ? 'bg-gold text-navy font-semibold' : '',
                !isSelected && !isPast ? 'text-navy' : '',
                isToday && !isSelected ? 'ring-1 ring-gold/40' : '',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Time Slot Picker                                                   */
/* ------------------------------------------------------------------ */

function TimeSlotPicker({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: TimeSlot[]
  selectedTime: string
  onSelect: (t: string) => void
}) {
  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <p className="font-body text-sm text-gray mb-1">No available slots</p>
          <p className="font-body text-xs text-gray-light">Try another date</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="font-display text-sm font-semibold text-navy mb-3">Available Times</p>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => {
          const selected = selectedTime === slot.time
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={[
                'px-3 py-2 rounded-xl font-body text-sm border-2 transition-all duration-150',
                !slot.available
                  ? 'bg-gray-light/50 text-gray line-through cursor-not-allowed border-transparent'
                  : selected
                  ? 'bg-gold text-navy font-semibold border-gold'
                  : 'bg-white text-navy border-gray-light hover:border-gold',
              ].join(' ')}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
      {slots.every((s) => !s.available) && (
        <p className="mt-3 font-body text-xs text-gray text-center">All slots booked — try another date</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page Layout                                                         */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  return (
    <main>
      <Header />
      <div className="min-h-screen bg-off-white">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <BookingWizardInner />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
