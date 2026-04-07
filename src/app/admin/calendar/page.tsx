'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useLang } from '@/contexts/LanguageContext';

/* ── Types ─────────────────────────────────────────────── */

type ViewMode = 'day' | 'week' | 'month';
type ServiceType = 'classic' | 'hybrid' | 'volume' | 'removal' | 'refill';

interface CalendarBooking {
  id: string;
  client: string;
  service: string;
  serviceType: ServiceType;
  date: string; // ISO date
  startHour: number; // e.g. 9.5 = 9:30
  duration: number; // hours
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  phone: string;
  notes: string;
}

interface SupabaseBooking {
  id: string;
  client_name: string;
  client_phone: string;
  notes: string | null;
  date: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  services: { name: string; duration_minutes: number } | null;
}

/* ── Helpers ────────────────────────────────────────────── */

function timeToFractionalHour(time: string): number {
  // Handles "HH:MM:SS" or "HH:MM"
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h + m / 60;
}

function serviceNameToType(name: string): ServiceType {
  const lower = name.toLowerCase();
  if (lower.includes('classic') && lower.includes('refill')) return 'refill';
  if (lower.includes('hybrid') && lower.includes('refill')) return 'refill';
  if (lower.includes('volume') && lower.includes('refill')) return 'refill';
  if (lower.includes('classic')) return 'classic';
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('volume')) return 'volume';
  if (lower.includes('removal')) return 'removal';
  if (lower.includes('refill')) return 'refill';
  return 'classic';
}

function transformBooking(b: SupabaseBooking): CalendarBooking {
  const serviceName = b.services?.name ?? 'Classic Lashes';
  return {
    id: b.id,
    client: b.client_name,
    service: serviceName,
    serviceType: serviceNameToType(serviceName),
    date: b.date,
    startHour: timeToFractionalHour(b.start_time),
    duration: (b.services?.duration_minutes ?? 120) / 60,
    status: b.status === 'no_show' ? 'cancelled' : b.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
    phone: b.client_phone,
    notes: b.notes ?? '',
  };
}

/* ── Helpers ────────────────────────────────────────────── */

const serviceColorMap: Record<ServiceType, string> = {
  classic: 'bg-navy/10 border-navy/20 text-navy',
  hybrid: 'bg-gold/15 border-gold/30 text-gold-dark',
  volume: 'bg-navy-light/10 border-navy-light/20 text-navy-light',
  removal: 'bg-gray-light border-gray text-gray',
  refill: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

function formatHour(h: number) {
  const hr = Math.floor(h);
  const min = h % 1 === 0.5 ? '30' : '00';
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${min} ${ampm}`;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateWeekday(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDateDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate().toString();
}

function getWeekDates(baseDate: Date): string[] {
  const monday = new Date(baseDate);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

/* ── Component ─────────────────────────────────────────── */

export default function CalendarPage() {
  const { lang } = useLang();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Default to day view on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('day');
    }
  }, []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, newStatus: CalendarBooking['status']) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status: newStatus });
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Fetch bookings from Supabase when visible date range changes
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      // Fetch bookings for the visible week/month window (2 months range for safety)
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });
      const res = await fetch(`/api/admin/calendar/bookings?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data: SupabaseBooking[] = await res.json();
      setBookings(data.map(transformBooking));
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [weekDates]);

  useEffect(() => {
    if (viewMode === 'day' || viewMode === 'week') {
      fetchBookings();
    }
  }, [viewMode, fetchBookings]);

  // Also refetch when currentDate changes (nav arrows)
  useEffect(() => {
    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setLoadingBookings(true);
      fetch(`/api/admin/calendar/bookings?start=${startDate}&end=${endDate}`)
        .then((r) => {
          if (r.status === 401) { window.location.href = '/admin/login'; return null; }
          return r.json();
        })
        .then((data: SupabaseBooking[] | null) => {
          if (data) setBookings(data.map(transformBooking));
        })
        .catch((err) => console.error('Calendar fetch error:', err))
        .finally(() => setLoadingBookings(false));
    }
  }, [currentDate, viewMode]);

  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) {
      setCurrentDate(new Date());
      return;
    }
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() + dir);
    else if (viewMode === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  }

  const headerLabel = viewMode === 'week'
    ? `${formatDateShort(weekDates[0])} - ${formatDateShort(weekDates[6])}`
    : viewMode === 'day'
    ? formatDateShort(currentDate.toISOString().split('T')[0])
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const visibleDates = viewMode === 'day'
    ? [currentDate.toISOString().split('T')[0]]
    : weekDates;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          {/* Nav arrows + label */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-light hover:bg-offwhite transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
            </button>
            <button onClick={() => navigate(0)} className="px-2 py-1 text-xs font-body font-medium text-navy-light hover:bg-offwhite rounded-lg transition-colors cursor-pointer">
              <span className="only-en">Today</span>
              <span className="only-zh">今天</span>
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-light hover:bg-offwhite transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4" /></svg>
            </button>
            <span className="ml-1 font-body text-sm font-medium text-navy truncate max-w-[140px] lg:max-w-none">{headerLabel}</span>
          </div>

          {/* View switcher */}
          <div className="flex items-center bg-offwhite rounded-lg p-0.5 shrink-0">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={[
                  'px-2 lg:px-3 py-1.5 text-xs font-body font-medium rounded-md capitalize cursor-pointer transition-colors duration-150',
                  viewMode === mode ? 'bg-white text-navy shadow-sm' : 'text-navy-light hover:text-navy',
                ].join(' ')}
              >
                {mode === 'day' ? (<><span className="only-en">Day</span><span className="only-zh">日</span></>) :
                 mode === 'week' ? (<><span className="only-en">Week</span><span className="only-zh">周</span></>) :
                 (<><span className="only-en">Month</span><span className="only-zh">月</span></>)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      {viewMode !== 'month' ? (
        <Card className="overflow-hidden">
          <div className={viewMode === 'week' ? 'overflow-x-auto' : ''}>
            <div className={viewMode === 'week' ? 'min-w-[640px]' : ''}>
              {/* Day headers */}
              <div className="grid border-b border-gray-light" style={{ gridTemplateColumns: `64px repeat(${visibleDates.length}, 1fr)` }}>
                <div className="p-2" />
                {visibleDates.map((date) => {
                  const isToday = date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={date} className="p-2 text-center border-l border-gray-light">
                      <p className="text-xs text-gray font-body">{formatDateWeekday(date)}</p>
                      <p className={[
                        'text-lg font-display font-semibold tracking-tight mt-0.5',
                        isToday ? 'text-gold-dark' : 'text-navy',
                      ].join(' ')}>
                        {formatDateDay(date)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid border-b border-gray-light/60"
                    style={{ gridTemplateColumns: `64px repeat(${visibleDates.length}, 1fr)`, height: '60px' }}
                  >
                    <div className="p-1 pr-2 text-right">
                      <span className="text-[10px] text-gray font-body">{formatHour(hour)}</span>
                    </div>
                    {visibleDates.map((date) => (
                      <div key={date} className="border-l border-gray-light/60 relative" />
                    ))}
                  </div>
                ))}

                {/* Booking blocks — hide cancelled */}
                {bookings
                  .filter((b) => visibleDates.includes(b.date) && b.status !== 'cancelled')
                  .map((booking) => {
                    const colIndex = visibleDates.indexOf(booking.date);
                    const top = (booking.startHour - 7) * 60;
                    const height = booking.duration * 60;
                    const colWidth = `calc((100% - 64px) / ${visibleDates.length})`;
                    const left = `calc(64px + ${colIndex} * ${colWidth})`;

                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={[
                          'absolute rounded-lg border px-2 py-1 text-left cursor-pointer',
                          'hover:opacity-80 transition-opacity duration-150',
                          'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1',
                          serviceColorMap[booking.serviceType],
                        ].join(' ')}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left,
                          width: `calc(${colWidth} - 8px)`,
                          marginLeft: '4px',
                        }}
                      >
                        <p className="text-[11px] font-body font-medium truncate">{booking.client}</p>
                        <p className="text-[10px] opacity-70 truncate">{booking.service}</p>
                        <p className="text-[10px] opacity-60">{formatHour(booking.startHour)}</p>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Month view - simple grid */
        <Card className="p-6">
          <MonthView
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={setSelectedBooking}
          />
        </Card>
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Client</p>
                <p className="text-sm font-body font-medium text-navy mt-1">{selectedBooking.client}</p>
              </div>
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Phone</p>
                <p className="text-sm font-body text-navy mt-1">{selectedBooking.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Service</p>
                <p className="text-sm font-body font-medium text-navy mt-1">{selectedBooking.service}</p>
              </div>
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <Badge variant={selectedBooking.status} size="sm">
                    {selectedBooking.status === 'confirmed' ? (
                      <><span className="only-en">Confirmed</span><span className="only-zh">已确认</span></>
                    ) : selectedBooking.status === 'pending' ? (
                      <><span className="only-en">Pending</span><span className="only-zh">待确认</span></>
                    ) : selectedBooking.status === 'cancelled' ? (
                      <><span className="only-en">Cancelled</span><span className="only-zh">已取消</span></>
                    ) : (
                      <><span className="only-en">Completed</span><span className="only-zh">已完成</span></>
                    )}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Date</p>
                <p className="text-sm font-body text-navy mt-1">{formatDateShort(selectedBooking.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Time</p>
                <p className="text-sm font-body text-navy mt-1">
                  {formatHour(selectedBooking.startHour)} - {formatHour(selectedBooking.startHour + selectedBooking.duration)}
                </p>
              </div>
            </div>
            {selectedBooking.notes && (
              <div>
                <p className="text-xs text-gray font-body uppercase tracking-wider">Notes</p>
                <p className="text-sm font-body text-navy-light mt-1">{selectedBooking.notes}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {selectedBooking.status === 'pending' && (
                <Button
                  variant="gold"
                  size="sm"
                  disabled={updatingId === selectedBooking.id}
                  onClick={async () => {
                    await updateStatus(selectedBooking.id, 'confirmed');
                    setSelectedBooking(null);
                  }}
                >
                  Confirm
                </Button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button
                  variant="gold"
                  size="sm"
                  disabled={updatingId === selectedBooking.id}
                  onClick={async () => {
                    await updateStatus(selectedBooking.id, 'completed');
                    setSelectedBooking(null);
                  }}
                >
                  Mark Completed
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updatingId === selectedBooking.id}
                  onClick={async () => {
                    await updateStatus(selectedBooking.id, 'cancelled');
                    setSelectedBooking(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Month View Sub-component ──────────────────────────── */

function MonthView({
  currentDate,
  bookings,
  onBookingClick,
}: {
  currentDate: Date;
  bookings: CalendarBooking[];
  onBookingClick: (b: CalendarBooking) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs text-gray font-body py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-20" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayBookings = bookings.filter((b) => b.date === dateStr && b.status !== 'cancelled');
          const isToday = dateStr === todayStr;

          return (
            <div
              key={i}
              className={[
                'h-20 p-1 rounded-lg border',
                isToday ? 'border-gold bg-gold/5' : 'border-transparent hover:bg-offwhite',
              ].join(' ')}
            >
              <p className={[
                'text-xs font-body',
                isToday ? 'font-semibold text-gold-dark' : 'text-navy-light',
              ].join(' ')}>
                {day}
              </p>
              {dayBookings.slice(0, 2).map((b) => (
                <button
                  key={b.id}
                  onClick={() => onBookingClick(b)}
                  className={[
                    'block w-full text-left text-[9px] font-body px-1 py-0.5 rounded mt-0.5 truncate cursor-pointer',
                    serviceColorMap[b.serviceType],
                  ].join(' ')}
                >
                  {b.client}
                </button>
              ))}
              {dayBookings.length > 2 && (
                <p className="text-[9px] text-gray font-body mt-0.5 px-1">+{dayBookings.length - 2} more</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
