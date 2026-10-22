import { NextResponse } from 'next/server';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const staff = getStaff(tenantId);
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.tenantId || !body.name || !body.role) {
      return NextResponse.json({ success: false, error: 'Filial, mütəxəssis adı və vəzifəsi tələb olunur' }, { status: 400 });
    }

    const staffMember = createStaff({
      tenantId: body.tenantId,
      name: body.name,
      role: body.role
    });

    return NextResponse.json({ success: true, staff: staffMember });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
