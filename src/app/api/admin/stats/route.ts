import { NextResponse } from 'next/server';
import { getDashboardStats } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let targetTenantId = searchParams.get('tenantId');

    // If normal Admin or Editor, strictly scope to their company
    if (currentUser.role !== 'SUPER_ADMIN') {
      targetTenantId = currentUser.tenantId || null;
    }

    const stats = getDashboardStats(targetTenantId);
    return NextResponse.json({ success: true, stats, role: currentUser.role, scopedTenantId: targetTenantId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
