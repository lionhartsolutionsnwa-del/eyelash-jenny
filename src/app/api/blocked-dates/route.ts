import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';

// GET /api/blocked-dates — Public: list all blocked dates
export async function GET() {
  const { data, error } = await getAdminClient()
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/blocked-dates — Admin: add a blocked date
export async function POST(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, reason } = body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
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
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This date is already blocked' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/blocked-dates?date=YYYY-MM-DD — Admin: remove a blocked date
export async function DELETE(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { error: 'date query parameter is required' },
      { status: 400 }
    );
  }

  const { error } = await getAdminClient()
    .from('blocked_dates')
    .delete()
    .eq('date', date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
