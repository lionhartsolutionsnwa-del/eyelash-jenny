import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

type Context = { params: Promise<{ id: string }> };

// GET /api/bookings/[id] — Admin: get a single booking with service details
export async function GET(request: NextRequest, context: Context) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const { data, error } = await getAdminClient()
    .from('bookings')
    .select('*, services(name, price, duration_minutes)')
    .eq('id', id)
    .single();

  if (error) {
    return Response.json({ error: 'Booking not found' }, { status: 404 });
  }

  return Response.json(data);
}

// PATCH /api/bookings/[id] — Admin: update a booking
export async function PATCH(request: NextRequest, context: Context) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
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
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await getAdminClient()
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select('*, services(name, price, duration_minutes)')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// DELETE /api/bookings/[id] — Admin: cancel a booking (soft delete)
export async function DELETE(request: NextRequest, context: Context) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const { data, error } = await getAdminClient()
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
