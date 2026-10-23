import { NextResponse } from 'next/server';
import { getFeedbacks, createFeedback, updateFeedback, deleteFeedback, getTenants } from '../../../../lib/dataStore';
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

    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId || undefined;
    }

    const feedbacks = getFeedbacks(tenantId);
    return NextResponse.json({ success: true, feedbacks, role: currentUser.role });
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

    const body = await request.json();
    const { subject, message, type, priority, tenantId: bodyTenantId } = body;

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: 'Mövzu və müraciət mətni tələb olunur' }, { status: 400 });
    }

    const tenantId = currentUser.role === 'SUPER_ADMIN' 
      ? (bodyTenantId || 'tenant-system') 
      : (currentUser.tenantId || 'tenant-unknown');

    const tenants = getTenants();
    const currentTenant = tenants.find(t => t.id === tenantId);

    const feedback = createFeedback({
      tenantId,
      tenantName: currentTenant ? currentTenant.name : (currentUser.role === 'SUPER_ADMIN' ? 'Sistem Mərkəzi' : 'Filial'),
      userId: currentUser.id,
      userName: currentUser.fullName || currentUser.username,
      userRole: currentUser.role,
      type: type || 'IMPROVEMENT',
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'MEDIUM',
      status: 'PENDING'
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminNote, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const updatePayload: any = { ...otherUpdates };
    if (status !== undefined) updatePayload.status = status;
    if (adminNote !== undefined) updatePayload.adminNote = adminNote;

    const updated = updateFeedback(id, updatePayload);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Müraciət tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, feedback: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const success = deleteFeedback(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
