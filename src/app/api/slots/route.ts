import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/slots?date=YYYY-MM-DD
// Returns 30-minute time slots for the given date.
// Slot is unavailable if: date is blocked, outside business hours,
// or already booked (non-cancelled).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');

  if (!date) {
    return Response.json({ error: 'date query parameter is required (YYYY-MM-DD)' }, { status: 400 });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Date must be in YYYY-MM-DD format' }, { status: 400 });
  }

  // Validate date is not in the past
  const requestedDate = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    return Response.json({ slots: [], message: 'Cannot query past dates' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Check if date is blocked
  const { data: blockedDate } = await supabase
    .from('blocked_dates')
    .select('id, reason')
    .eq('date', date)
    .maybeSingle();

  if (blockedDate) {
    return Response.json({
      slots: [],
      blocked: true,
      reason: blockedDate.reason ?? 'This date is not available',
    });
  }

  // 2. Determine day_of_week (0=Sunday … 6=Saturday)
  const dayOfWeek = requestedDate.getDay();

  // 3. Fetch availability for that day
  const { data: availability } = await supabase
    .from('availability')
    .select('start_time, end_time, is_active')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .maybeSingle();

  if (!availability) {
    return Response.json({ slots: [], closed: true, message: 'Not available on this day' });
  }

  // 4. Fetch existing bookings for that date (non-cancelled)
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('date', date)
    .neq('status', 'cancelled');

  // 5. Generate 30-minute slots from start_time to end_time
  function timeToMinutes(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function doRangesOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
    return s1 < e2 && s2 < e1;
  }

  const dayStart = timeToMinutes(availability.start_time);
  const dayEnd = timeToMinutes(availability.end_time);

  // Pre-convert booked ranges
  const bookings = (existingBookings ?? []).map((b: { start_time: string; end_time: string }) => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));

  const slots: { time: string; available: boolean }[] = [];

  for (let slotStart = dayStart; slotStart + 30 <= dayEnd; slotStart += 30) {
    const slotEnd = slotStart + 30;

    // Check if any existing booking overlaps this slot
    const isBooked = bookings.some((b: { start: number; end: number }) =>
      doRangesOverlap(slotStart, slotEnd, b.start, b.end)
    );

    slots.push({
      time: minutesToTime(slotStart),
      available: !isBooked,
    });
  }

  return Response.json({ slots });
}
