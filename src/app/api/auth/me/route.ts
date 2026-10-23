import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/auth';
import { sanitizeUser } from '../../../../lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş edilməyib və ya sessiya etibarsızdır' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
