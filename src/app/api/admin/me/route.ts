import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const tokenHash = hashToken(token);
  const supabase = await createClient();

  // Find session and join with user
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select(`
      id,
      expires_at,
      admin_users!inner (
        id,
        name,
        phone,
        role,
        active
      )
    `)
    .eq('token_hash', tokenHash)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('admin_sessions').delete().eq('token_hash', tokenHash);
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const user = session.admin_users as unknown as {
    id: string; name: string; phone: string; role: string; active: boolean
  };

  if (!user.active) {
    return NextResponse.json({ error: 'Account disabled' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
}
