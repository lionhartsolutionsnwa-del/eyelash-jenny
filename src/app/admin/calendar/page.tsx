'use client';

import { useState, useMemo } from 'react';
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
  status: 'confirmed' | 'pending' | 'completed';
  phone: string;
  notes: string;
}

/* ── Mock Data ─────────────────────────────────────────── */

function getMockBookings(): CalendarBooking[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return [
    { id: '1', client: 'Sarah Kim', service: 'Classic Full Set', serviceType: 'classic', date: dates[0], startHour: 9, duration: 2, status: 'confirmed', phone: '(555) 123-4567', notes: 'New client, wants natural look' },
    { id: '2', client: 'Emily Chen', service: 'Hybrid Full Set', serviceType: 'hybrid', date: dates[0], startHour: 12, duration: 2.5, status: 'confirmed', phone: '(555) 234-5678', notes: '' },
    { id: '3', client: 'Jessica Park', service: 'Volume Full Set', serviceType: 'volume', date: dates[1], startHour: 10, duration: 3, status: 'pending', phone: '(555) 345-6789', notes: 'Returning client' },
    { id: '4', client: 'Michelle Lee', service: 'Classic Refill', serviceType: 'refill', date: dates[1], startHour: 14, duration: 1.5, status: 'confirmed', phone: '(555) 456-7890', notes: '' },
    { id: '5', client: 'Amanda Wong', service: 'Lash Removal', serviceType: 'removal', date: dates[2], startHour: 9.5, duration: 1, status: 'confirmed', phone: '(555) 567-8901', notes: 'Sensitive eyes' },
    { id: '6', client: 'Rachel Nguyen', service: 'Hybrid Refill', serviceType: 'hybrid', date: dates[2], startHour: 11, duration: 1.5, status: 'pending', phone: '(555) 678-9012', notes: '' },
    { id: '7', client: 'Lisa Wang', service: 'Classic Full Set', serviceType: 'classic', date: dates[3], startHour: 10, duration: 2, status: 'confirmed', phone: '(555) 789-0123', notes: '' },
    { id: '8', client: 'Diana Cho', service: 'Volume Full Set', serviceType: 'volume', date: dates[4], startHour: 13, duration: 3, status: 'confirmed', phone: '(555) 890-1234', notes: 'Allergic to certain glues' },
    { id: '9', client: 'Karen Yoo', service: 'Hybrid Full Set', serviceType: 'hybrid', date: dates[5], startHour: 10, duration: 2.5, status: 'pending', phone: '(555) 901-2345', notes: '' },
  ];
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

  const bookings = useMemo(() => getMockBookings(), []);
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(0)}>
              <span className="only-en">Today</span>
              <span className="only-zh">今天</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4" /></svg>
            </Button>
            <span className="ml-2 font-body text-sm font-medium text-navy">{headerLabel}</span>
          </div>

          <div className="flex items-center bg-offwhite rounded-lg p-0.5">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={[
                  'px-3 py-1.5 text-xs font-body font-medium rounded-md capitalize cursor-pointer',
                  'transition-opacity duration-150',
                  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1',
                  viewMode === mode
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-navy-light hover:text-navy',
                ].join(' ')}
              >
                {mode === 'day' ? (<><span className="only-en">Day</span><span className="only-zh">日</span></>) : mode === 'week' ? (<><span className="only-en">Week</span><span className="only-zh">周</span></>) : (<><span className="only-en">Month</span><span className="only-zh">月</span></>)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      {viewMode !== 'month' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
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

                {/* Booking blocks */}
                {bookings
                  .filter((b) => visibleDates.includes(b.date))
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
              <Button variant="gold" size="sm">Confirm</Button>
              <Button variant="secondary" size="sm">Reschedule</Button>
              <Button variant="ghost" size="sm">Cancel</Button>
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
          const dayBookings = bookings.filter((b) => b.date === dateStr);
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
