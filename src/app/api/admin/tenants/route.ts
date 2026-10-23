import { NextResponse } from 'next/server';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenants = getTenants();
    return NextResponse.json({ success: true, tenants });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug || !body.sector) {
      return NextResponse.json({ success: false, error: 'Ad, slug və sektor sahələri vacibdir' }, { status: 400 });
    }

    const tenant = createTenant({
      name: body.name,
      slug: body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
      sector: body.sector,
      status: body.status || 'ACTIVE',
      medicalEnabled: Boolean(body.medicalEnabled),
      phone: body.phone || null,
      address: body.address || null
    });

    return NextResponse.json({ success: true, tenant });
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

    const updated = updateTenant(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant: updated });
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

    const success = deleteTenant(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
