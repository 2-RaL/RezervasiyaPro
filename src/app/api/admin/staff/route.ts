import { NextResponse } from 'next/server';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../../../lib/dataStore';
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

    const staff = getStaff(tenantId);
    return NextResponse.json({ success: true, staff, role: currentUser.role });
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
    let tenantId = body.tenantId;

    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId;
    }

    if (!tenantId || !body.name || !body.role) {
      return NextResponse.json({ success: false, error: 'Filial, mütəxəssis adı və vəzifəsi tələb olunur' }, { status: 400 });
    }

    const staffMember = createStaff({
      tenantId,
      name: body.name,
      role: body.role,
      serviceIds: Array.isArray(body.serviceIds) ? body.serviceIds : []
    });

    return NextResponse.json({ success: true, staff: staffMember });
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
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const updated = updateStaff(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'İşçi tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, staff: updated });
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

    const success = deleteStaff(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
