import crypto from 'crypto';

type AdminSessionPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function createStatelessAdminSessionToken(userId: string, expiresAt: Date): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY');
  }

  const payload: AdminSessionPayload = {
    userId,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `v1.${encodedPayload}.${signature}`;
}

export function parseStatelessAdminSessionToken(token: string): { userId: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;

  const [, encodedPayload, signature] = parts;
  const secret = getSessionSecret();
  if (!secret) return null;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const providedSigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);
  if (
    providedSigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(providedSigBuffer, expectedSigBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<AdminSessionPayload>;

    if (typeof payload.userId !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { userId: payload.userId, exp: payload.exp };
  } catch {
    return null;
  }
}

export function isStatelessAdminSessionToken(token: string): boolean {
  return token.startsWith('v1.');
}
