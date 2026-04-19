import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { parseStatelessAdminSessionToken } from '@/lib/admin-session-token';

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/** Returns the user_id if the admin_token cookie is valid, null otherwise. */
export async function validateAdminSession(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;

  const supabase = getAdminClient();

  const statelessSession = parseStatelessAdminSessionToken(token);
  if (statelessSession) {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, active')
      .eq('id', statelessSession.userId)
      .single();

    if (error || !user?.active) return null;
    return user.id;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('user_id, expires_at, admin_users!inner(active)')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !data) return null;

  // admin_users is returned as object from the !inner join
  const sessionAny = data as unknown as {
    user_id: string;
    expires_at: string;
    admin_users: { active: boolean } | { active: boolean }[];
  };
  const isActive = Array.isArray(sessionAny.admin_users)
    ? sessionAny.admin_users[0]?.active
    : sessionAny.admin_users?.active;

  if (!isActive) return null;
  if (new Date(sessionAny.expires_at) <= new Date()) return null;

  return sessionAny.user_id;
}
