import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

// GET /api/testimonials — Public: fetch active testimonials
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const featured = searchParams.get('featured');

  let query = getAdminClient()
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
