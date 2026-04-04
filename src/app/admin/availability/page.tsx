'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/contexts/LanguageContext';

/* ── Types ─────────────────────────────────────────────── */

interface DaySchedule {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

interface BreakTime {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

/* ── Mock Data ─────────────────────────────────────────── */

const initialSchedule: DaySchedule[] = [
  { day: 'Sunday', enabled: false, start: '09:00', end: '17:00' },
  { day: 'Monday', enabled: true, start: '09:00', end: '19:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '19:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '19:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '19:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '19:00' },
  { day: 'Saturday', enabled: true, start: '10:00', end: '17:00' },
];

const initialBreaks: BreakTime[] = [
  { id: '1', day: 'Monday', start: '12:00', end: '13:00' },
  { id: '2', day: 'Tuesday', start: '12:00', end: '13:00' },
  { id: '3', day: 'Wednesday', start: '12:00', end: '13:00' },
  { id: '4', day: 'Thursday', start: '12:00', end: '13:00' },
  { id: '5', day: 'Friday', start: '12:00', end: '13:00' },
];

const initialBlocked: BlockedDate[] = [
  { id: '1', date: '2026-04-10', reason: 'Personal day' },
  { id: '2', date: '2026-04-25', reason: 'Training workshop' },
  { id: '3', date: '2026-05-01', reason: 'Holiday' },
];

/* ── Helpers ────────────────────────────────────────────── */

const timeOptions: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of ['00', '30']) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${m}`);
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Component ─────────────────────────────────────────── */

export default function AvailabilityPage() {
  const { lang } = useLang();
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [breaks, setBreaks] = useState<BreakTime[]>(initialBreaks);
  const [blocked, setBlocked] = useState<BlockedDate[]>(initialBlocked);

  // New blocked date form
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  // New break form
  const [newBreakDay, setNewBreakDay] = useState('Monday');
  const [newBreakStart, setNewBreakStart] = useState('12:00');
  const [newBreakEnd, setNewBreakEnd] = useState('13:00');

  function updateSchedule(index: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addBreak() {
    if (!newBreakDay) return;
    setBreaks((prev) => [
      ...prev,
      { id: Date.now().toString(), day: newBreakDay, start: newBreakStart, end: newBreakEnd },
    ]);
  }

  function removeBreak(id: string) {
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  }

  function addBlockedDate() {
    if (!newBlockDate) return;
    setBlocked((prev) => [
      ...prev,
      { id: Date.now().toString(), date: newBlockDate, reason: newBlockReason },
    ]);
    setNewBlockDate('');
    setNewBlockReason('');
  }

  function removeBlockedDate(id: string) {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  }

  // Mini calendar for blocked dates
  const calendarDate = new Date();
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const blockedDateSet = new Set(blocked.map((b) => b.date));

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  function toggleCalendarDate(day: number) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (blockedDateSet.has(dateStr)) {
      const entry = blocked.find((b) => b.date === dateStr);
      if (entry) removeBlockedDate(entry.id);
    } else {
      setBlocked((prev) => [
        ...prev,
        { id: Date.now().toString(), date: dateStr, reason: '' },
      ]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Weekly Schedule */}
      <Card className="p-6">
        <h2 className="font-display text-lg text-navy tracking-tight mb-4">
          <span className="only-en">Weekly Schedule</span>
          <span className="only-zh">每周营业时间</span>
        </h2>
        <div className="space-y-3">
          {schedule.map((day, i) => (
            <div
              key={day.day}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-offwhite/60"
            >
              <span className="text-sm font-body font-medium text-navy w-24 shrink-0">
                {day.day}
              </span>

              {/* Toggle */}
              <button
                onClick={() => updateSchedule(i, 'enabled', !day.enabled)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent cursor-pointer',
                  'transition-[background-color] duration-200',
                  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                  day.enabled ? 'bg-gold' : 'bg-gray-light',
                ].join(' ')}
                role="switch"
                aria-checked={day.enabled}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
                    'transition-transform duration-200',
                    day.enabled ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>

              {day.enabled && (
                <div className="flex items-center gap-2">
                  <select
                    value={day.start}
                    onChange={(e) => updateSchedule(i, 'start', e.target.value)}
                    className="px-2 py-1.5 text-xs font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray">
                    <span className="only-en">to</span>
                    <span className="only-zh">至</span>
                  </span>
                  <select
                    value={day.end}
                    onChange={(e) => updateSchedule(i, 'end', e.target.value)}
                    className="px-2 py-1.5 text-xs font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {!day.enabled && (
                <span className="text-xs text-gray font-body">
                  <span className="only-en">Closed</span>
                  <span className="only-zh">休息</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="gold" size="sm" onClick={() => window.alert(lang === 'en' ? 'Schedule saved!' : '时间表已保存！')}>
            <span className="only-en">Save Schedule</span>
            <span className="only-zh">保存时间表</span>
          </Button>
        </div>
      </Card>

      {/* Section 2: Break Times */}
      <Card className="p-6">
        <h2 className="font-display text-lg text-navy tracking-tight mb-4">
          <span className="only-en">Break Times</span>
          <span className="only-zh">休息时间</span>
        </h2>

        <div className="space-y-2 mb-4">
          {breaks.map((brk) => (
            <div
              key={brk.id}
              className="flex items-center justify-between p-3 rounded-xl bg-offwhite/60"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-body font-medium text-navy w-24">{brk.day}</span>
                <span className="text-sm text-navy-light font-body">{brk.start} - {brk.end}</span>
              </div>
              <button
                onClick={() => removeBreak(brk.id)}
                className="text-gray hover:text-rose-500 transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold rounded p-1"
                aria-label="Remove break"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add break form */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 rounded-xl border border-gray-light bg-white">
          <div>
            <label className="block text-xs text-gray font-body mb-1">
              <span className="only-en">Day</span><span className="only-zh">日期</span>
            </label>
            <select
              value={newBreakDay}
              onChange={(e) => setNewBreakDay(e.target.value)}
              className="px-2 py-1.5 text-xs font-body text-navy bg-offwhite rounded-lg border border-gray-light focus:border-gold outline-none cursor-pointer"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray font-body mb-1">
              <span className="only-en">Start</span><span className="only-zh">开始</span>
            </label>
            <select
              value={newBreakStart}
              onChange={(e) => setNewBreakStart(e.target.value)}
              className="px-2 py-1.5 text-xs font-body text-navy bg-offwhite rounded-lg border border-gray-light focus:border-gold outline-none cursor-pointer"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray font-body mb-1">
              <span className="only-en">End</span><span className="only-zh">结束</span>
            </label>
            <select
              value={newBreakEnd}
              onChange={(e) => setNewBreakEnd(e.target.value)}
              className="px-2 py-1.5 text-xs font-body text-navy bg-offwhite rounded-lg border border-gray-light focus:border-gold outline-none cursor-pointer"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={addBreak}>
            <span className="only-en">Add Break</span><span className="only-zh">添加休息</span>
          </Button>
        </div>
      </Card>

      {/* Section 3: Blocked Dates */}
      <Card className="p-6">
        <h2 className="font-display text-lg text-navy tracking-tight mb-4">Blocked Dates</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mini Calendar */}
          <div>
            <p className="text-sm font-body font-medium text-navy mb-3">
              {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray font-body py-1">{d}</div>
              ))}
              {calendarCells.map((day, i) => {
                if (day === null) return <div key={i} />;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isBlocked = blockedDateSet.has(dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={i}
                    onClick={() => toggleCalendarDate(day)}
                    className={[
                      'w-full aspect-square flex items-center justify-center rounded-lg text-xs font-body cursor-pointer',
                      'transition-opacity duration-150',
                      'focus-visible:ring-2 focus-visible:ring-gold',
                      isBlocked
                        ? 'bg-rose-100 text-rose-700 font-medium'
                        : isToday
                        ? 'bg-gold/15 text-gold-dark font-medium'
                        : 'hover:bg-offwhite text-navy-light',
                    ].join(' ')}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray font-body mt-2"><span className="only-en">Click a date to block/unblock it</span><span className="only-zh">点击日期来封锁/解除</span></p>
          </div>

          {/* Blocked dates list + form */}
          <div>
            <div className="space-y-2 mb-4">
              {blocked.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-offwhite/60"
                >
                  <div>
                    <p className="text-sm font-body font-medium text-navy">{formatDate(b.date)}</p>
                    {b.reason && (
                      <p className="text-xs text-navy-light font-body">{b.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlockedDate(b.id)}
                    className="text-gray hover:text-rose-500 transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold rounded p-1"
                    aria-label="Remove blocked date"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
              {blocked.length === 0 && (
                <p className="text-sm text-gray font-body py-4 text-center"><span className="only-en">No blocked dates</span><span className="only-zh">暂无封锁日期</span></p>
              )}
            </div>

            {/* Add blocked date form */}
            <div className="p-4 rounded-xl border border-gray-light bg-white space-y-3">
              <p className="text-xs text-gray font-body uppercase tracking-wider font-medium"><span className="only-en">Add Blocked Date</span><span className="only-zh">添加封锁日期</span></p>
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-body text-navy bg-offwhite rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
              />
              <input
                type="text"
                placeholder={lang === 'en' ? "Reason (optional)" : "原因（可选）"}
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                className="w-full px-3 py-2 text-sm font-body text-navy bg-offwhite rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
              />
              <Button variant="gold" size="sm" onClick={addBlockedDate}>
                <span className="only-en">Block Date</span>
                <span className="only-zh">封锁日期</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
