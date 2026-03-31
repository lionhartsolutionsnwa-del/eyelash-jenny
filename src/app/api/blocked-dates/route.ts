import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

// GET /api/blocked-dates — Public: list all blocked dates
export async function GET() {
  const { data, error } = await getAdminClient()
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST /api/blocked-dates — Admin: add a blocked date
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, reason } = body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: 'A valid date in YYYY-MM-DD format is required' },
      { status: 400 }
    );
  }

  const { data, error } = await getAdminClient()
    .from('blocked_dates')
    .insert({ date, reason: reason ?? null })
    .select()
    .single();

  if (error) {
    // Unique constraint violation (date already blocked)
    if (error.code === '23505') {
      return Response.json(
        { error: 'This date is already blocked' },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

// DELETE /api/blocked-dates?date=YYYY-MM-DD — Admin: remove a blocked date
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');

  if (!date) {
    return Response.json(
      { error: 'date query parameter is required' },
      { status: 400 }
    );
  }

  const { error } = await getAdminClient()
    .from('blocked_dates')
    .delete()
    .eq('date', date);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
