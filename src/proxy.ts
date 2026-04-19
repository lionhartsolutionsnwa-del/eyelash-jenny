import { NextResponse, type NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { parseStatelessAdminSessionToken } from '@/lib/admin-session-token';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = pathname === '/admin/login';

  // No token → redirect to login (unless already on login page)
  if (!token && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If no token and on login page → allow through
  if (!token && isLoginPage) {
    return NextResponse.next();
  }

  // Verify token against admin_sessions table
  if (token) {
    let isValid = false;
    const supabase = getAdminClient();
    const statelessSession = parseStatelessAdminSessionToken(token);

    if (statelessSession) {
      try {
        const { data: user, error } = await supabase
          .from('admin_users')
          .select('active')
          .eq('id', statelessSession.userId)
          .single();
        isValid = !error && !!user?.active;
      } catch {
        isValid = false;
      }
    } else {
      const tokenHash = hashToken(token);
      try {
        const { data: session } = await supabase
          .from('admin_sessions')
          .select('expires_at, admin_users!inner(id, active)')
          .eq('token_hash', tokenHash)
          .single();

        const sessionData = session as
          | { expires_at: string; admin_users: { active: boolean } }
          | null;
        isValid = !!(
          sessionData &&
          new Date(sessionData.expires_at) > new Date() &&
          sessionData.admin_users?.active
        );
      } catch {
        isValid = false;
      }
    }

    if (!isValid && !isLoginPage) {
      // Invalid/expired session → clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
      });
      return response;
    }

    if (isValid && isLoginPage) {
      // Already logged in → redirect to admin
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
