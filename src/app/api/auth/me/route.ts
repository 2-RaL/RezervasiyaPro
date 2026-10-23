import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, getTenants } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'Giriş edilməyib' },
        { status: 401 }
      );
    }

    let sessionData: any = null;
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
      sessionData = JSON.parse(decoded);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Sessiya xətası' },
        { status: 401 }
      );
    }

    if (!sessionData?.id) {
      return NextResponse.json(
        { success: false, error: 'İstifadəçi tapılmadı' },
        { status: 401 }
      );
    }

    const user = getUserById(sessionData.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'İstifadəçi bazada mövcud deyil' },
        { status: 401 }
      );
    }

    const tenants = getTenants();
    const userTenant = user.tenantId ? tenants.find(t => t.id === user.tenantId) : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: userTenant ? userTenant.name : (user.role === 'SUPER_ADMIN' ? 'Bütün Sistem (Super Admin)' : undefined)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
