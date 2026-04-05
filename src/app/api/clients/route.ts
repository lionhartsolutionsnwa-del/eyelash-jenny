import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';

// GET /api/clients — Admin: list clients derived from bookings
// Since there is no clients table, we group bookings by client_phone/client_email
// to build a client profile with visit history and spend totals.
export async function GET(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings, error } = await getAdminClient()
    .from('bookings')
    .select('client_name, client_phone, client_email, date, start_time, status, services(price)')
    .order('date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by unique client (keyed by client_phone)
  const clientMap = new Map<
    string,
    {
      id: string;
      name: string;
      phone: string;
      email: string;
      visits: number;
      lastVisit: string;
      totalSpent: number;
    }
  >();

  for (const b of bookings) {
    const phone = b.client_phone || '';
    if (!phone) continue;

    const services = b.services as ({ price?: number } | null)[] | null;
    const price = Array.isArray(services)
      ? services.reduce((sum, s) => sum + (s?.price ?? 0), 0)
      : (services as { price?: number } | null)?.price ?? 0;

    if (clientMap.has(phone)) {
      const c = clientMap.get(phone)!;
      c.visits += 1;
      c.totalSpent += price;
      if (b.date > c.lastVisit) c.lastVisit = b.date;
    } else {
      clientMap.set(phone, {
        id: phone,
        name: b.client_name || 'Unknown',
        phone,
        email: b.client_email || '',
        visits: 1,
        lastVisit: b.date,
        totalSpent: price,
      });
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return NextResponse.json(clients);
}
