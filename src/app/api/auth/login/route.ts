import { NextResponse } from 'next/server';
import { validateUserCredentials } from '../../../../lib/dataStore';
import { createSignedSessionToken, checkRateLimit, recordFailedAttempt, resetFailedAttempts, sanitizeUser } from '../../../../lib/security';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'İstifadəçi adı və şifrə daxil edilməlidir' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const rateLimitKey = `login:${clientIp}:${cleanUsername}`;

    // 1. Anti-Brute-Force Rate Limiting
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.remainingMs || 300000) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Təhlükəsizlik xəbərdarlığı: Çox sayda ardıcıl uğursuz giriş cəhdi aşkarlandı. Zəhmət olmasa ${waitMinutes} dəqiqə sonra yenidən cəhd edin.` 
        },
        { status: 429 }
      );
    }

    // 2. Validate credentials with cryptographic scrypt/hash verification
    const user = validateUserCredentials(cleanUsername, password);

    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, error: 'İstifadəçi adı və ya şifrə yanlışdır' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    resetFailedAttempts(rateLimitKey);

    // 3. Prepare sanitized user session object (NEVER include password or hash)
    const sessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenantName
    };

    // 4. Create cryptographically signed HMAC-SHA256 session token
    const signedToken = createSignedSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(sessionUser)
    });

    // 5. Set secure HTTP-only cookie with strict security flags
    response.cookies.set({
      name: 'auth_session',
      value: signedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    const isBlocked = error.message?.includes('bloklanıb');
    return NextResponse.json(
      { success: false, error: error.message || 'Giriş zamanı xəta baş verdi' },
      { status: isBlocked ? 403 : 500 }
    );
  }
}
