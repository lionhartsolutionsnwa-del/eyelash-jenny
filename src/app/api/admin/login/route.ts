import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (!digits.startsWith('1') && digits.length > 10) return `+${digits}`;
  return `+${digits}`;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body as { phone: string; password: string };

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const supabase = getAdminClient();

    // Fetch admin user by phone
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('active', true)
      .single();

    if (userError || !user) {
      if (userError) {
        console.error('[LOGIN] User lookup error:', userError);
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: insertError } = await supabase
      .from('admin_sessions')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('[LOGIN] Session insert error:', insertError);
      return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

    // Set HttpOnly cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
