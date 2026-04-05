import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, validateAdminSession } from '@/lib/supabase/admin';

// GET /api/settings — Admin: get all settings
export async function GET(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await getAdminClient()
    .from('settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/settings — Admin: update a setting by key
export async function PUT(request: NextRequest) {
  const userId = await validateAdminSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
  }

  const { data, error } = await getAdminClient()
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
