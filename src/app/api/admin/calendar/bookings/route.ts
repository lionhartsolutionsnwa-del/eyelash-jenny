import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';

// GET /api/admin/calendar/bookings?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Session is valid — proceed with booking query
  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end dates are required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, duration_minutes)')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
