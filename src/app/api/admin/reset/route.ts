import { NextResponse } from 'next/server';
import { resetDemoData } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu kritik əməliyyat üçün yalnız Super Admin səlahiyyəti tələb olunur' },
        { status: 403 }
      );
    }

    resetDemoData();
    return NextResponse.json({ success: true, message: 'Demo məlumatlar bərpa edildi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
