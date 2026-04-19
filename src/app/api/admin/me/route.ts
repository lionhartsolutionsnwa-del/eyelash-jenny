import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { parseStatelessAdminSessionToken } from '@/lib/admin-session-token';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const statelessSession = parseStatelessAdminSessionToken(token);

  let userId = statelessSession?.userId;
  if (!userId) {
    const tokenHash = hashToken(token);
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('id, expires_at, user_id')
      .eq('token_hash', tokenHash)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('admin_sessions').delete().eq('token_hash', tokenHash);
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    userId = session.user_id;
  }

  // Fetch user separately
  const { data: user, error: userError } = await supabase
    .from('admin_users')
    .select('id, name, phone, role, active')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

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
