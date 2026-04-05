import { NextRequest } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';

// GET /api/services — Public: list all active services
export async function GET() {
  const { data, error } = await getAdminClient()
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// PUT /api/services — Admin: update a service
export async function PUT(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: 'Service ID is required' }, { status: 400 });
  }

  const { data, error } = await getAdminClient()
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST /api/services — Admin: create a new service
export async function POST(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, price, duration_minutes, description, active } = body;

  if (!name || price === undefined || duration_minutes === undefined) {
    return Response.json(
      { error: 'name, price, and duration_minutes are required' },
      { status: 400 }
    );
  }

  const { data, error } = await getAdminClient()
    .from('services')
    .insert({
      name,
      price,
      duration_minutes,
      description: description || '',
      active: active !== undefined ? active : true,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
