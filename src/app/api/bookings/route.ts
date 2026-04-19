import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { upsertContact, addNote } from '@/lib/ghl';

// Prevent static pre-rendering — env vars aren't available at build time
export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ServiceInfo {
  name: string;
  price: number;
  duration_minutes?: number;
}

// GET /api/bookings — Admin: list all bookings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');       // YYYY-MM-DD
  const status = searchParams.get('status');   // filter by status

  const supabase = getSupabase();
  let query = supabase
    .from('bookings')
    .select(
      'id, client_name, client_phone, client_email, date, start_time, end_time, status, created_at, services(name, price, duration_minutes)'
    )
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[BOOKINGS:GET]', error);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  // Flatten services join — single service per booking (direct FK, no junction table)
  // Supabase may return services as an array [{name, price, duration}] or a single object
  type ServiceRecord = { name: string; price: number; duration_minutes?: number };
  const flat = (data ?? []).map((b) => {
    const raw = b.services as unknown;
    let svc: ServiceRecord | null = null;
    if (Array.isArray(raw) && raw.length > 0) {
      svc = raw[0] as unknown as ServiceRecord;
    } else if (raw != null) {
      svc = raw as unknown as ServiceRecord;
    }
    return {
      id: b.id,
      client_name: b.client_name,
      client_phone: b.client_phone,
      client_email: b.client_email,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      created_at: b.created_at,
      services: svc ? [svc] : [],
    };
  });

  return Response.json(flat);
}

// Validation schema for public booking
const publicBookingSchema = z.object({
  client_name: z.string().min(2, 'Name must be at least 2 characters'),
  client_phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'),
  client_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS format'),
  service_id: z.enum(['classic', 'hybrid', 'volume', 'wispy', 'classic-fill', 'hybrid-fill', 'volume-fill', 'lash-removal'], {
    message: 'Invalid service selected',
  }),
  sms_reminders_consent: z.boolean().refine((v) => v === true, 'You must agree to receive appointment reminders'),
  sms_marketing_consent: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

// Helper to strip seconds: "09:00:00" -> "09:00"
function toHHMM(time: string): string {
  return time.substring(0, 5);
}

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// POST /api/bookings — Public: create a new booking with multi-service support
export async function POST(request: NextRequest) {
  // 1. Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = getSupabase();
  const result = publicBookingSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const input = result.data;
  console.log('[BOOKING] Input:', JSON.stringify(input));

  // 2. Spam protection: check for duplicate phone/email within last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: recentByPhone } = await supabase
    .from('bookings')
    .select('id')
    .eq('client_phone', input.client_phone.replace(/\D/g, ''))
    .eq('status', 'pending')
    .gte('created_at', fiveMinutesAgo)
    .maybeSingle();

  if (recentByPhone) {
    return Response.json(
      { error: 'A booking with this phone number was submitted recently. Please wait a few minutes before trying again.' },
      { status: 429 }
    );
  }

  if (input.client_email) {
    const { data: recentByEmail } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_email', input.client_email.toLowerCase())
      .eq('status', 'pending')
      .gte('created_at', fiveMinutesAgo)
      .maybeSingle();

    if (recentByEmail) {
      return Response.json(
        { error: 'A booking with this email was submitted recently. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }
  }

  // 3. Validate date is not in the past
  const requestedDate = new Date(input.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    return Response.json({ error: 'Cannot book a date in the past' }, { status: 400 });
  }

  // 4. Check blocked date
  const { data: blockedDate } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', input.date)
    .maybeSingle();

  if (blockedDate) {
    return Response.json({ error: 'This date is not available for booking' }, { status: 409 });
  }

  // 5. Check day_of_week availability
  const dayOfWeek = requestedDate.getDay();
  const { data: availability } = await supabase
    .from('availability')
    .select('start_time, end_time, is_active')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .maybeSingle();

  if (!availability) {
    return Response.json({ error: 'Not available on this day' }, { status: 409 });
  }

  // 6. Verify the slot time is within business hours
  const slotMinutes = timeToMinutes(toHHMM(input.start_time));
  const businessStart = timeToMinutes(availability.start_time);
  const businessEnd = timeToMinutes(availability.end_time);

  if (slotMinutes < businessStart || slotMinutes + 30 > businessEnd) {
    return Response.json({ error: 'Selected time is outside business hours' }, { status: 409 });
  }

  // 7. Check existing bookings for that date/time slot
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('date', input.date)
    .neq('status', 'cancelled');

  // Check if any booking overlaps the 30-min slot
  const slotEndMinutes = slotMinutes + 30;
  const isSlotTaken = (existingBookings ?? []).some((b: { start_time: string; end_time: string }) => {
    const bStart = timeToMinutes(toHHMM(b.start_time));
    const bEnd = timeToMinutes(toHHMM(b.end_time));
    return slotMinutes < bEnd && bStart < slotEndMinutes;
  });

  if (isSlotTaken) {
    return Response.json({ error: 'This time slot is no longer available' }, { status: 409 });
  }

  // 8. Fetch service to get duration and calculate end_time
  const { data: svc, error: servicesError } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('id', input.service_id)
    .eq('active', true)
    .single();

  if (servicesError || !svc) {
    return Response.json({ error: 'Service not found or inactive' }, { status: 404 });
  }

  let totalDurationMinutes = svc.duration_minutes ?? 30;
  // Add addon duration if present in notes (format: "Addon: Add 20 Lash Extensions (+$20, +15 min)")
  if (input.notes) {
    const addonMatch = input.notes.match(/\+\$(\d+)[^|]*\+\s*(\d+)\s*min/);
    if (addonMatch) {
      totalDurationMinutes += parseInt(addonMatch[2], 10);
    }
  }
  const endTime = minutesToTime(slotMinutes + totalDurationMinutes);

  // 9. Insert booking with status=pending
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      client_name: input.client_name.trim(),
      client_phone: input.client_phone.replace(/\D/g, ''),
      client_email: input.client_email?.toLowerCase() || null,
      date: input.date,
      start_time: toHHMM(input.start_time),
      end_time: endTime,
      service_id: input.service_id,
      status: 'pending',
      sms_reminders_consent: input.sms_reminders_consent,
      sms_marketing_consent: input.sms_marketing_consent ?? false,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[BOOKING] Insert error:', insertError);
    return Response.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
  }

  // 10. Return the created booking with service details
  const { data: bookingWithServices } = await supabase
    .from('bookings')
    .select('*, services(name, price, duration_minutes)')
    .eq('id', booking.id)
    .single();

  // 11. Sync to GoHighLevel — awaited before response (serverless functions terminate on return)
  if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
    try {
      const nameParts = input.client_name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || undefined;

      const contactId = await upsertContact({
        firstName,
        lastName,
        phone: input.client_phone,
        email: input.client_email || undefined,
        tags: ['booking', 'website'],
        appointmentDate: input.date,
        appointmentTime: toHHMM(input.start_time),
        appointmentService: svc.name,
      });

      if (contactId) {
        const noteBody = [
          `New booking from website`,
          `Service: ${svc.name}`,
          `Date: ${input.date} at ${toHHMM(input.start_time)}`,
          `SMS reminders consent: ${input.sms_reminders_consent ? 'Yes' : 'No'}`,
          `SMS marketing consent: ${input.sms_marketing_consent ? 'Yes' : 'No'}`,
        ].join('\n');
        await addNote({ contactId, body: noteBody });
      }
    } catch (err) {
      console.error('[GHL] Sync error:', err);
      // Never fail the booking if GHL is down
    }
  }

  // 12. Insert into appointments table for n8n SMS workflow
  // Build UTC appointment_time from date + start_time
  const appointmentTime = new Date(`${input.date}T${toHHMM(input.start_time)}:00.000Z`);
  const serviceSlug = svc.name.toLowerCase().replace(/\s+/g, '-').replace(/lashes$/, '');

  // Build a descriptive service string that includes addon if selected
  let serviceDescription = svc.name;
  if (input.notes) {
    const addonMatch = input.notes.match(/Addon:\s*(.+?)\s*\(\+\$[\d]+\s*,/);
    if (addonMatch) {
      serviceDescription = `${svc.name} + ${addonMatch[1].trim()}`;
    }
  }

  const { error: apptError } = await supabase
    .from('appointments')
    .insert({
      booking_id: booking.id,  // Use real booking ID for FK relationship
      client_name: input.client_name.trim(),
      client_phone: input.client_phone.replace(/\D/g, ''),
      appointment_time: appointmentTime.toISOString(),
      service_type: serviceDescription,  // Full description incl. addon for n8n SMS
    });

  if (apptError) {
    // Log but don't fail — booking itself succeeded
    console.error('[BOOKING] appointments insert error:', apptError);
  } else {
    console.log('[BOOKING] Inserted into appointments table for n8n SMS workflow');
  }

  return Response.json(bookingWithServices ?? booking, { status: 201 });
}
