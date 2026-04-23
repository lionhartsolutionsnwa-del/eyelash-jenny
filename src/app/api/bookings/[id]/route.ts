import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';
import { cancelAppointment } from '@/lib/ghl';

type Context = { params: Promise<{ id: string }> };

// GET /api/bookings/[id] — Admin: get a single booking with service details
export async function GET(request: NextRequest, context: Context) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const { data, error } = await getAdminClient()
    .from('bookings')
    .select('*, services(name, price, duration_minutes)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/bookings/[id] — Admin: update a booking
export async function PATCH(request: NextRequest, context: Context) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  // Only allow specific fields to be updated
  const allowedFields = ['status', 'notes', 'date', 'start_time', 'end_time'];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  // If cancelling, propagate status to the appointments table so n8n skips SMS
  // and sync the cancellation to GoHighLevel
  if (updates.status === 'cancelled') {
    // Fetch current booking data for GHL sync before updating
    const { data: bookingData } = await getAdminClient()
      .from('bookings')
      .select('client_phone, date, start_time, services(name)')
      .eq('id', id)
      .single();

    await getAdminClient()
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('booking_id', id)
      .eq('status', 'active');

    // Sync cancellation to GHL (non-blocking — never fail the API response)
    if (bookingData && process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      cancelAppointment({
        phone: bookingData.client_phone,
        service: (bookingData.services as { name: string } | null)?.name ?? 'Appointment',
        date: bookingData.date,
        time: bookingData.start_time,
      }).catch(err => console.error('[GHL] cancelAppointment error:', err));
    }
  }

  const { data, error } = await getAdminClient()
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select('*, services(name, price, duration_minutes)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/bookings/[id] — Admin: cancel a booking (soft delete)
export async function DELETE(request: NextRequest, context: Context) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  // Fetch current booking data for GHL sync before updating
  const { data: bookingData } = await getAdminClient()
    .from('bookings')
    .select('client_phone, date, start_time, services(name)')
    .eq('id', id)
    .single();

  // Cancel the appointment first so n8n stops texting
  await getAdminClient()
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('booking_id', id)
    .eq('status', 'active');

  // Sync cancellation to GHL (non-blocking — never fail the API response)
  if (bookingData && process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
    cancelAppointment({
      phone: bookingData.client_phone,
      service: (bookingData.services as { name: string } | null)?.name ?? 'Appointment',
      date: bookingData.date,
      time: bookingData.start_time,
    }).catch(err => console.error('[GHL] cancelAppointment error:', err));
  }

  const { data, error } = await getAdminClient()
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
