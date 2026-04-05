'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/contexts/LanguageContext';

/* ── Types ─────────────────────────────────────────────── */

interface DaySchedule {
  id?: string;
  day: string;
  day_of_week: number;
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

interface AvailabilityRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

/* ── Helpers ────────────────────────────────────────────── */

const timeOptions: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of ['00', '30']) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${m}`);
  }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function toHHMM(time24: string): string {
  // "09:00:00" → "09:00"
  return time24.substring(0, 5);
}

function toHHMMSS(time: string): string {
  // "09:00" → "09:00:00"
  return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
}

/* ── Component ─────────────────────────────────────────── */

export default function AvailabilityPage() {
  const { lang } = useLang();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [breaks, setBreaks] = useState<BreakTime[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [availRes, blockedRes] = await Promise.all([
          fetch('/api/availability'),
          fetch('/api/blocked-dates'),
        ]);
        if (availRes.status === 401 || blockedRes.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        if (!availRes.ok) throw new Error('Failed to load availability');
        const [availRows, blockedRows] = await Promise.all([
          availRes.json() as Promise<AvailabilityRow[]>,
          blockedRes.json() as Promise<BlockedDate[]>,
        ]);

        // Build schedule map keyed by day_of_week
        const availMap = new Map<number, AvailabilityRow>();
        for (const row of availRows) {
          availMap.set(row.day_of_week, row);
        }

        // Fill all 7 days, using DB data or defaults
        const defaultSchedule: DaySchedule[] = DAY_NAMES.map((day, i) => {
          const row = availMap.get(i);
          return {
            id: row?.id,
            day,
            day_of_week: i,
            enabled: row?.is_active ?? false,
            start: row ? toHHMM(row.start_time) : '09:00',
            end: row ? toHHMM(row.end_time) : '17:00',
          };
        });

        setSchedule(defaultSchedule);
        setBlocked(blockedRows);
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // New blocked date form
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  // New break form
  const [newBreakDay, setNewBreakDay] = useState('Monday');
  const [newBreakStart, setNewBreakStart] = useState('12:00');
  const [newBreakEnd, setNewBreakEnd] = useState('13:00');

  function updateSchedule(index: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    );
  }

  async function saveSchedule() {
    setSaving(true);
    setSaveError(null);
    try {
      for (const day of schedule) {
        if (!day.id) continue; // Can't update a row without an id
        await fetch('/api/availability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: day.id,
            is_active: day.enabled,
            start_time: toHHMMSS(day.start),
            end_time: toHHMMSS(day.end),
          }),
        });
      }
      // Reload to get fresh data and ids
      window.location.reload();
    } catch {
      setSaveError('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!newBlockDate) return;
    const res = await fetch('/api/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newBlockDate, reason: newBlockReason }),
    });
    if (res.ok) {
      const newEntry = await res.json();
      setBlocked((prev) => [...prev, newEntry]);
      setNewBlockDate('');
      setNewBlockReason('');
    }
  }

  async function removeBlockedDate(id: string) {
    const entry = blocked.find((b) => b.id === id);
    if (!entry) return;
    const res = await fetch(`/api/blocked-dates?date=${entry.date}`, { method: 'DELETE' });
    if (res.ok) {
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    }
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
          {loading ? (
            <div className="text-center py-8 text-sm text-gray font-body">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading schedule...
            </div>
          ) : schedule.map((day, i) => (
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
          <Button variant="gold" size="sm" onClick={saveSchedule} disabled={saving}>
            {saving ? (
              <span className="only-en">Saving...</span>
            ) : (
              <><span className="only-en">Save Schedule</span><span className="only-zh">保存时间表</span></>
            )}
          </Button>
          {saveError && <span className="text-xs text-rose-500 ml-2">{saveError}</span>}
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
