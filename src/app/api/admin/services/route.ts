import { NextResponse } from 'next/server';
import { getServices, createService, updateService, deleteService } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const services = getServices(tenantId);
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.tenantId || !body.nameAz || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'Filial, xidmət adı və qiymət tələb olunur' }, { status: 400 });
    }

    const service = createService({
      tenantId: body.tenantId,
      nameAz: body.nameAz,
      nameEn: body.nameEn || body.nameAz,
      duration: Number(body.duration) || 30,
      price: Number(body.price) || 0,
      category: body.category || 'Ümumi'
    });

    return NextResponse.json({ success: true, service });
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

    const updated = updateService(id, updates);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const success = deleteService(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
