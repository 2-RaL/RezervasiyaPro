import { NextResponse } from 'next/server';
import { getServices, createService, updateService, deleteService } from '../../../../lib/dataStore';
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

    const services = getServices(tenantId);
    return NextResponse.json({ success: true, services, role: currentUser.role });
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

    if (!tenantId || !body.nameAz || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'Filial, xidmət adı və qiymət tələb olunur' }, { status: 400 });
    }

    const actor = {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      tenantId: currentUser.tenantId || tenantId
    };

    const service = createService({
      tenantId,
      nameAz: body.nameAz,
      nameRu: body.nameRu || '',
      nameEn: body.nameEn || body.nameAz,
      duration: Number(body.duration) || 30,
      price: Number(body.price) || 0,
      category: body.category || 'Ümumi',
      categoryRu: body.categoryRu || '',
      categoryEn: body.categoryEn || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      description: body.description || '',
      descriptionRu: body.descriptionRu || '',
      descriptionEn: body.descriptionEn || '',
      blockedDays: Array.isArray(body.blockedDays) ? body.blockedDays : [],
      blockedDates: Array.isArray(body.blockedDates) ? body.blockedDates : [],
      workStartTime: body.workStartTime || '09:00',
      workEndTime: body.workEndTime || '21:00'
    }, actor);

    return NextResponse.json({ success: true, service });
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

    const actor = {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      tenantId: currentUser.tenantId
    };

    const updated = updateService(id, updates, actor);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Xidmət tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: updated });
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

    const actor = {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      tenantId: currentUser.tenantId
    };

    const success = deleteService(id, actor);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
