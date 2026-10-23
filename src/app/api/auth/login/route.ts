import { NextResponse } from 'next/server';
import { validateUserCredentials } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'İstifadəçi adı və şifrə daxil edilməlidir' },
        { status: 400 }
      );
    }

    const user = validateUserCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'İstifadəçi adı və ya şifrə yanlışdır' },
        { status: 401 }
      );
    }

    // Prepare sanitized user session object (do not expose password in session)
    const sessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenantName
    };

    const sessionPayload = Buffer.from(JSON.stringify(sessionUser)).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: sessionUser
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: 'auth_session',
      value: sessionPayload,
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
