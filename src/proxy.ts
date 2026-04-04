import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      // Supabase not configured → allow through (dev mode)
      return NextResponse.next();
    }

    const tokenHash = hashToken(token);

    let session;
    try {
      const result = await supabase
        .from('admin_sessions')
        .select('expires_at, admin_users!inner(id, active)')
        .eq('token_hash', tokenHash)
        .single();

      session = result.data;
    } catch {
      // Table doesn't exist or DB error → clear bad cookie, go to login
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

    const sessionData = session as { expires_at: string; admin_users: { active: boolean } } | null;
    const isValid = sessionData &&
      new Date(sessionData.expires_at) > new Date() &&
      sessionData.admin_users?.active;

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
