import { NextResponse } from 'next/server';
import { getActivityLogs, revertActivity } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let tenantId = searchParams.get('tenantId') || undefined;

    // Scope normal Admin and Editor to their company
    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId || undefined;
    }

    const logs = getActivityLogs(tenantId);
    return NextResponse.json({ success: true, logs, role: currentUser.role });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    if (currentUser.role === 'EDITOR') {
      return NextResponse.json({
        success: false,
        error: 'İcazə verilmədi: Yalnız Şirkət Admini və Super Admin əməliyyatları ləğv edib geri qaytara bilər.'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, logId } = body;

    if (action !== 'revert' || !logId) {
      return NextResponse.json({ success: false, error: 'Düzgün parametr tələb olunur (action: revert, logId)' }, { status: 400 });
    }

    const actor = {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      tenantId: currentUser.tenantId
    };

    const result = revertActivity(logId, actor);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message, log: result.log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
