import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { isStatelessAdminSessionToken } from '@/lib/admin-session-token';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (token && !isStatelessAdminSessionToken(token)) {
    const supabase = getAdminClient();
    const tokenHash = hashToken(token);
    await supabase.from('admin_sessions').delete().eq('token_hash', tokenHash);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
