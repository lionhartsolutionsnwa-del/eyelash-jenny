import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { computeAvailableSlots, formatTimeDisplay } from '@/lib/slots';

// GET /api/availability/slots?date=YYYY-MM-DD&service_id=UUID
// Public: compute available time slots for a given date and service
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');
  const serviceId = searchParams.get('service_id');
  const durationOverride = searchParams.get('duration');

  if (!date || !serviceId) {
    return Response.json(
      { error: 'Both date and service_id are required' },
      { status: 400 }
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: 'Date must be in YYYY-MM-DD format' },
      { status: 400 }
    );
  }

  // 1. Look up the service to get duration_minutes (skip if duration override provided)
  let serviceDuration = durationOverride ? parseInt(durationOverride, 10) : 0;
  if (!durationOverride) {
    const { data: service, error: serviceError } = await getAdminClient()
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .eq('active', true)
      .single();

    if (serviceError || !service) {
      return Response.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }
    serviceDuration = service.duration_minutes;
  }

  // 2. Check if this date is blocked
  const { data: blockedDate } = await getAdminClient()
    .from('blocked_dates')
    .select('id')
    .eq('date', date)
    .maybeSingle();

  if (blockedDate) {
    return Response.json({ slots: [], blocked: true });
  }

  // 3. Determine day_of_week from the date (0=Sunday, 6=Saturday)
  const dayOfWeek = new Date(date + 'T00:00:00').getDay();

  // 4. Fetch availability for that day
  const { data: availability } = await getAdminClient()
    .from('availability')
    .select('start_time, end_time, is_active')
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!availability || !availability.is_active) {
    return Response.json({ slots: [], closed: true });
  }

  // 5. Fetch break times for that day
  const { data: breakTimes } = await getAdminClient()
    .from('break_times')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek);

  // 6. Fetch non-cancelled bookings for that date
  const { data: existingBookings } = await getAdminClient()
    .from('bookings')
    .select('start_time, end_time')
    .eq('date', date)
    .neq('status', 'cancelled');

  // 7. Fetch settings for slot_interval and buffer
  const { data: settings } = await getAdminClient()
    .from('settings')
    .select('key, value')
    .in('key', ['slot_interval_minutes', 'buffer_minutes']);

  let slotInterval = 30;
  let bufferMinutes = 15;

  if (settings) {
    for (const s of settings) {
      if (s.key === 'slot_interval_minutes') {
        slotInterval = Number(s.value) || 30;
      }
      if (s.key === 'buffer_minutes') {
        bufferMinutes = Number(s.value) || 15;
      }
    }
  }

  // 8. Compute available slots
  const slots = computeAvailableSlots({
    date,
    serviceDurationMinutes: serviceDuration,
    availability: {
      start_time: availability.start_time,
      end_time: availability.end_time,
    },
    breakTimes: breakTimes ?? [],
    existingBookings: existingBookings ?? [],
    slotInterval,
    bufferMinutes,
  });

  // Format times for frontend display (e.g. "09:00" -> "9:00 AM")
  const formattedSlots = slots.map((s) => ({
    ...s,
    time: formatTimeDisplay(s.time),
  }));

  return Response.json({ slots: formattedSlots });
}
