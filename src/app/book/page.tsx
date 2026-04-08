'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLang } from '@/contexts/LanguageContext';
import type { Service } from '@/types';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface FormState {
  name: string
  phone: string
  email: string
  serviceIds: string[]
  notes: string
  smsConsent: boolean
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  serviceIds?: string;
  submit?: string;
}

function getWeekDates(base: Date): Date[] {
  // Get Monday of the week containing `base`
  const day = base.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatTimeDisplay(time: string): string {
  // "09:00" -> "9:00 AM"
  const [hStr, m] = time.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BookPage() {
  const { lang } = useLang();

  const [weekStart, setWeekStart] = useState<Date>(() => {
    // Align to Monday of current week so calendar always opens on the current week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    return monday;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', serviceIds: [], notes: '', smsConsent: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Record<string, unknown> | null>(null);

  const weekDates = getWeekDates(weekStart);

  // Fetch services on mount
  useEffect(() => {
    async function load() {
      setServicesLoading(true);
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setServices(data as Service[]);
        }
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        setServicesLoading(false);
      }
    }
    load();
  }, []);

  // Fetch slots when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    async function loadSlots() {
      if (!selectedDate) return;
      setSlotsLoading(true);
      setSelectedTime(null);
      setSlots([]);
      try {
        const dateStr = formatDateISO(selectedDate);
        const res = await fetch(`/api/slots?date=${dateStr}`);
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch (e) {
        console.error('Failed to load slots', e);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [selectedDate]);

  function prevWeek() {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
    setSelectedDate(null);
    setSlots([]);
    setSelectedTime(null);
  }

  function nextWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
    setSelectedDate(null);
    setSlots([]);
    setSelectedTime(null);
  }

  function goToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setWeekStart(getWeekDates(today)[0]);
    setSelectedDate(null);
    setSlots([]);
    setSelectedTime(null);
  }

  function selectSlot(time: string) {
    setSelectedTime(time);
    setErrors({});
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s) => s !== id)
        : [...prev.serviceIds, id],
    }));
    setErrors((prev) => ({ ...prev, serviceIds: undefined }));
  }

  function setField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) newErrors.phone = 'Please enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (form.serviceIds.length === 0) newErrors.serviceIds = 'Please select at least one service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        client_name: form.name.trim(),
        client_phone: form.phone.replace(/\D/g, ''),
        client_email: form.email.trim() || undefined,
        date: formatDateISO(selectedDate),
        start_time: selectedTime + ':00',
        service_id: form.serviceIds[0], // API expects single service_id UUID
        notes: form.notes.trim() || undefined,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error ?? 'Booking failed. Please try again.' });
        return;
      }

      setConfirmedBooking(data);
      setSuccess(true);
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const totalPrice = services
    .filter((s) => form.serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const totalDuration = services
    .filter((s) => form.serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if weekStart is the current week
  const isCurrentWeek = getWeekDates(today).every(
    (d, i) => d.toDateString() === weekDates[i].toDateString()
  );

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 bg-offwhite min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Page heading */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy tracking-tight">
              {lang === 'en' ? 'Book Your Appointment' : '预约服务'}
            </h1>
            <p className="mt-3 font-body text-navy-light text-base max-w-md mx-auto">
              {lang === 'en'
                ? 'Select a date and time that works for you'
                : '选择您方便的日期和时间'}
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <Card elevated className="p-8 md:p-12 text-center max-w-xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="font-display text-2xl font-semibold text-navy mb-2">
                {lang === 'en' ? 'Booking Submitted!' : '预约已提交！'}
              </h2>
              <p className="font-body text-navy-light mb-6">
                {lang === 'en'
                  ? `Your appointment on ${selectedDate ? formatDateDisplay(selectedDate) : ''} at ${selectedTime ? formatTimeDisplay(selectedTime) : ''} has been requested. We'll confirm via phone shortly.`
                  : `您于 ${selectedDate ? formatDateDisplay(selectedDate) : ''} ${selectedTime ? formatTimeDisplay(selectedTime) : ''} 的预约已提交，我们将尽快电话确认。`}
              </p>
              <div className="space-y-2 text-left bg-offwhite rounded-xl p-4 mb-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray">{lang === 'en' ? 'Services' : '服务'}</span>
                  <span className="text-navy font-medium">
                    {services.filter((s) => form.serviceIds.includes(s.id)).map((s) => s.name).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray">{lang === 'en' ? 'Total' : '总计'}</span>
                  <span className="text-navy font-medium">${totalPrice}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray">{lang === 'en' ? 'Duration' : '时长'}</span>
                  <span className="text-navy font-medium">{totalDuration} min</span>
                </div>
              </div>
              <Button variant="gold" size="md" href="/">
                {lang === 'en' ? 'Back to Home' : '返回首页'}
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* ── Week Navigation ── */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={prevWeek}
                    className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-light hover:border-navy hover:bg-navy/5 transition-colors duration-200 cursor-pointer"
                    aria-label="Previous week"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 12L6 8L10 4" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-semibold text-navy">
                      {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      {' – '}
                      {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    {!isCurrentWeek && (
                      <button
                        type="button"
                        onClick={goToToday}
                        className="text-xs font-body text-gold hover:text-gold-dark underline cursor-pointer"
                      >
                        {lang === 'en' ? 'Today' : '今天'}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={nextWeek}
                    className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-light hover:border-navy hover:bg-navy/5 transition-colors duration-200 cursor-pointer"
                    aria-label="Next week"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 4L10 8L6 12" />
                    </svg>
                  </button>
                </div>

                {/* Day selector */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, i) => {
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(date)}
                        className={[
                          'flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                          isPast
                            ? 'opacity-40 cursor-not-allowed border-transparent bg-gray-light/30'
                            : isSelected
                            ? 'border-gold bg-gold/10 shadow-sm'
                            : 'border-transparent bg-white hover:bg-gold/10 border-gray-light',
                        ].join(' ')}
                      >
                        <span className={[
                          'font-body text-xs mb-1',
                          isSelected ? 'text-gold-dark font-semibold' : 'text-gray',
                        ].join(' ')}>
                          {DAY_NAMES[i]}
                        </span>
                        <span className={[
                          'font-display text-lg font-semibold leading-none',
                          isSelected ? 'text-gold-dark' : isToday ? 'text-navy' : 'text-navy',
                        ].join(' ')}>
                          {date.getDate()}
                        </span>
                        {isToday && !isSelected && (
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gold" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* ── Time Slots ── */}
              {selectedDate && (
                <Card className="p-6">
                  <h3 className="font-display text-lg font-semibold text-navy mb-1">
                    {formatDateDisplay(selectedDate)}
                  </h3>
                  <p className="font-body text-sm text-gray mb-5">
                    {lang === 'en' ? 'Select an available time slot' : '选择可用时段'}
                  </p>

                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 font-body text-sm text-gray">Loading slots...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="font-body text-navy-light">
                        {lang === 'en' ? 'No slots available for this date' : '此日期无可用时段'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {slots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => selectSlot(slot.time)}
                            className={[
                              'flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-body text-sm transition-all duration-200',
                              !slot.available
                                ? 'bg-gray-light/40 text-gray cursor-not-allowed border-transparent'
                                : isSelected
                                ? 'bg-gold text-navy font-semibold border-gold shadow-sm'
                                : 'bg-white text-navy border-gray-light hover:border-gold cursor-pointer',
                            ].join(' ')}
                          >
                            <span>{formatTimeDisplay(slot.time)}</span>
                            {slot.available ? (
                              <span className="text-xs mt-0.5 opacity-70">
                                {isSelected ? (lang === 'en' ? 'Selected' : '已选') : (lang === 'en' ? 'Book' : '预约')}
                              </span>
                            ) : (
                              <span className="text-xs mt-0.5 opacity-70">{lang === 'en' ? 'Full' : '已满'}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!slotsLoading && slots.length > 0 && slots.every((s) => !s.available) && (
                    <p className="mt-4 text-center font-body text-sm text-gray">
                      {lang === 'en' ? 'All slots are booked for this day. Try another date.' : '当日时段已满，请选择其他日期。'}
                    </p>
                  )}
                </Card>
              )}

              {/* ── Booking Form ── */}
              {selectedTime && (
                <Card elevated className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold text-navy">
                        {lang === 'en' ? 'Complete Your Booking' : '完成预约'}
                      </h3>
                      <p className="mt-1 font-body text-sm text-gray">
                        {selectedDate ? formatDateDisplay(selectedDate) : ''} at {formatTimeDisplay(selectedTime)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTime(null)}
                      className="text-gray hover:text-navy cursor-pointer text-sm font-body"
                    >
                      {lang === 'en' ? 'Change time' : '更改时间'}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Service selection */}
                    <div>
                      <label className="block font-body text-sm font-medium text-navy mb-2">
                        {lang === 'en' ? 'Select Services' : '选择服务'}{' '}
                        <span className="text-gold-dark">*</span>
                      </label>

                      {servicesLoading ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          <span className="font-body text-sm text-gray">Loading services...</span>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {services.map((service) => {
                            const selected = form.serviceIds.includes(service.id);
                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={[
                                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer',
                                  selected
                                    ? 'border-gold bg-gold/8'
                                    : 'border-gray-light bg-white hover:border-navy/30',
                                ].join(' ')}
                              >
                                <span className={[
                                  'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                                  selected ? 'border-gold bg-gold' : 'border-gray',
                                ].join(' ')}>
                                  {selected && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M8.5 2.5L4 7 1.5 4.5" stroke="#101B4B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display text-sm font-semibold text-navy">{service.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-body text-xs text-gold-dark font-semibold">${service.price}</span>
                                    <span className="font-body text-xs text-gray">{service.duration_minutes} min</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {errors.serviceIds && (
                        <p className="mt-2 font-body text-xs text-red-500">{errors.serviceIds}</p>
                      )}
                    </div>

                    {/* Summary */}
                    {form.serviceIds.length > 0 && (
                      <div className="bg-offwhite rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-body text-xs text-gray">
                            {lang === 'en' ? 'Estimated Total' : '预计费用'}
                          </p>
                          <p className="font-display text-2xl font-bold text-gold-dark">${totalPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-xs text-gray">
                            {lang === 'en' ? 'Duration' : '时长'}
                          </p>
                          <p className="font-body text-sm text-navy font-medium">{totalDuration} min</p>
                        </div>
                      </div>
                    )}

                    {/* Contact info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label={lang === 'en' ? 'Full Name' : '姓名'}
                        name="name"
                        required
                        value={form.name}
                        error={errors.name}
                        onChange={(e) => setField('name', e.target.value)}
                      />
                      <Input
                        label={lang === 'en' ? 'Phone Number' : '电话'}
                        name="phone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        value={form.phone}
                        error={errors.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                      />
                    </div>

                    <Input
                      label={lang === 'en' ? 'Email (optional)' : '邮箱（选填）'}
                      name="email"
                      type="email"
                      value={form.email}
                      error={errors.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />

                    <div className="relative">
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                        placeholder={lang === 'en' ? 'Any special requests or notes...' : '特殊要求或备注...'}
                        rows={3}
                        className="peer w-full bg-white rounded-xl px-4 pt-5 pb-2 text-navy font-body text-base border border-gray-light outline-none transition-[border-color,box-shadow] duration-200 focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none"
                      />
                      <label className="pointer-events-none absolute left-4 top-1.5 text-xs text-navy-light font-body">
                        {lang === 'en' ? 'Notes (optional)' : '备注（选填）'}
                      </label>
                    </div>

                    {/* SMS Consent */}
                    <div className="rounded-xl bg-navy/5 p-4 space-y-3">
                      <p className="font-display text-sm font-semibold text-navy">
                        SMS Notifications from Jenny Professional Eyelash
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.smsConsent}
                          onChange={(e) => setForm((prev) => ({ ...prev, smsConsent: e.target.checked }))}
                          className="mt-0.5 shrink-0 w-4 h-4 accent-gold cursor-pointer"
                        />
                        <span className="font-body text-sm text-navy leading-snug">
                          I agree to receive appointment reminders and confirmations via SMS from Jenny Professional Eyelash. (optional)
                        </span>
                      </label>
                      <div className="space-y-1 pt-1 border-t border-navy/10 ml-7">
                        <p className="font-body text-xs text-gray">
                          Message frequency varies. Standard msg rates apply.
                        </p>
                        <p className="font-body text-xs text-gray">
                          Reply STOP to opt out at any time. Text HELP for assistance.
                        </p>
                        <p className="font-body text-xs text-gray">
                          <a href="/privacy-policy" className="underline hover:text-navy transition-colors">Privacy Policy</a>
                          {' '}·{' '}
                          <a href="/terms" className="underline hover:text-navy transition-colors">Terms of Service</a>
                        </p>
                      </div>
                    </div>

                    {/* Submit error */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="font-body text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}

                    {/* Submit button */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        loading={submitting}
                        disabled={submitting || form.serviceIds.length === 0}
                        className="w-full sm:w-auto"
                      >
                        {submitting
                          ? (lang === 'en' ? 'Booking...' : '预约中...')
                          : (lang === 'en' ? 'Confirm Booking' : '确认预约')}
                      </Button>
                      <p className="font-body text-xs text-gray text-center max-w-sm">
                        {lang === 'en'
                          ? 'By booking, you agree to our cancellation policy. We will confirm your appointment via phone.'
                          : '预约即表示您同意我们的取消政策。我们将通过电话确认您的预约。'}
                      </p>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
