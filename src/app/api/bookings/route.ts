import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { bookingSchema } from '@/lib/validators';
import { computeAvailableSlots } from '@/lib/slots';
import { minutesToTime, timeToMinutes, formatTimeDisplay } from '@/lib/slots';

// GET /api/bookings — Admin: list bookings with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let query = getAdminClient()
    .from('bookings')
    .select('*, services(name, price, duration_minutes)')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (date) {
    query = query.eq('date', date);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `client_name.ilike.%${search}%,client_phone.ilike.%${search}%,client_email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST /api/bookings — Public: create a new booking
export async function POST(request: NextRequest) {
  // 1. Validate request body
  const body = await request.json();
  const result = bookingSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const input = result.data;
  console.log('[BOOKING] Input:', JSON.stringify(input));

  // 2. Look up the service to get duration
  const { data: service, error: serviceError } = await getAdminClient()
    .from('services')
    .select('id, duration_minutes, name, price')
    .eq('id', input.service_id)
    .eq('active', true)
    .single();

  if (serviceError || !service) {
    return Response.json(
      { error: 'Service not found or inactive', debug: { serviceId: input.service_id } },
      { status: 404 }
    );
  }

  // 3. Compute end_time
  const startMinutes = timeToMinutes(input.start_time);
  const endMinutes = startMinutes + service.duration_minutes;
  const endTime = minutesToTime(endMinutes);

  // 4. Re-check slot availability (critical race condition prevention)
  const dayOfWeek = new Date(input.date + 'T00:00:00').getDay();
  console.log('[BOOKING] dayOfWeek:', dayOfWeek, 'date:', input.date);

  // Check blocked date
  const { data: blockedDate } = await getAdminClient()
    .from('blocked_dates')
    .select('id')
    .eq('date', input.date)
    .maybeSingle();

  if (blockedDate) {
    return Response.json(
      { error: 'This date is not available for booking' },
      { status: 409 }
    );
  }

  // Get availability for the day
  const { data: availability } = await getAdminClient()
    .from('availability')
    .select('start_time, end_time, is_active')
    .eq('day_of_week', dayOfWeek)
    .single();

  console.log('[BOOKING] Availability:', availability);

  if (!availability || !availability.is_active) {
    return Response.json(
      { error: 'Not available on this day', debug: { dayOfWeek, availability } },
      { status: 409 }
    );
  }

  // Get break times
  const { data: breakTimes } = await getAdminClient()
    .from('break_times')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek);

  // Get existing bookings for that date (excluding cancelled)
  const { data: existingBookings } = await getAdminClient()
    .from('bookings')
    .select('start_time, end_time')
    .eq('date', input.date)
    .neq('status', 'cancelled');

  // Get settings
  const { data: settings } = await getAdminClient()
    .from('settings')
    .select('key, value')
    .in('key', ['slot_interval_minutes', 'buffer_minutes']);

  let slotInterval = 30;
  let bufferMinutes = 15;
  if (settings) {
    for (const s of settings) {
      if (s.key === 'slot_interval_minutes') slotInterval = Number(s.value) || 30;
      if (s.key === 'buffer_minutes') bufferMinutes = Number(s.value) || 15;
    }
  }

  const slots = computeAvailableSlots({
    date: input.date,
    serviceDurationMinutes: service.duration_minutes,
    availability: {
      start_time: availability.start_time,
      end_time: availability.end_time,
    },
    breakTimes: breakTimes ?? [],
    existingBookings: existingBookings ?? [],
    slotInterval,
    bufferMinutes,
  });

  // Format computed slot times to match frontend format ("9:00 AM" not "09:00")
  const formattedSlots = slots.map((s) => ({
    ...s,
    time: formatTimeDisplay(s.time),
  }));

  console.log('[BOOKING] Computed slots:', formattedSlots);
  console.log('[BOOKING] Looking for:', input.start_time);

  // Verify the requested slot is still available (compare formatted times)
  const requestedSlot = formattedSlots.find((s) => s.time === input.start_time);
  if (!requestedSlot || !requestedSlot.available) {
    return Response.json(
      { error: 'This time slot is no longer available', debug: { requestedTime: input.start_time, availableSlots: formattedSlots, availability: availability } },
      { status: 409 }
    );
  }

  // 5. Insert booking
  const { data: booking, error: insertError } = await getAdminClient()
    .from('bookings')
    .insert({
      client_name: input.client_name,
      client_phone: input.client_phone,
      client_email: input.client_email ?? null,
      service_id: input.service_id,
      date: input.date,
      start_time: input.start_time,
      end_time: endTime,
      status: 'confirmed',
      notes: input.notes ?? null,
    })
    .select('*, services(name, price, duration_minutes)')
    .single();

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  // Send SMS confirmation (async, non-blocking)
  try {
    const { sendSMS, formatPhone, bookingConfirmationMessage, adminNewBookingMessage } = await import('@/lib/twilio');
    const { formatTimeDisplay } = await import('@/lib/slots');

    const formattedDate = new Date(input.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = formatTimeDisplay(input.start_time);

    // To client
    sendSMS(
      formatPhone(input.client_phone),
      bookingConfirmationMessage(input.client_name, service.name, formattedDate, formattedTime)
    ).catch(console.error);

    // To admin (get admin phone from settings)
    const { data: adminPhoneSetting } = await getAdminClient()
      .from('settings')
      .select('value')
      .eq('key', 'admin_phone')
      .single();

    if (adminPhoneSetting?.value && adminPhoneSetting.value !== '""') {
      sendSMS(
        formatPhone(JSON.parse(adminPhoneSetting.value)),
        adminNewBookingMessage(input.client_name, service.name, formattedDate, formattedTime, input.client_phone)
      ).catch(console.error);
    }
  } catch (e) {
    console.error('SMS notification failed:', e);
  }

  return Response.json(booking, { status: 201 });
}
