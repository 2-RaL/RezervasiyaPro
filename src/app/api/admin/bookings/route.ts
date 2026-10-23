import { NextResponse } from 'next/server';
import { getBookings, createBooking, updateBooking, deleteBooking, toggleCustomerBlock } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';
import { BookingStatus } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let tenantId = searchParams.get('tenantId') || undefined;

    // Restrict normal admin and editor to their own company
    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId || undefined;
    }

    const status = searchParams.get('status') || undefined;
    const date = searchParams.get('date') || undefined;
    const search = searchParams.get('search') || undefined;

    const bookings = getBookings({ tenantId, status, date, search });
    return NextResponse.json({ success: true, bookings, role: currentUser.role });
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

    if (!tenantId || !body.customerName || !body.customerPhone || !body.serviceId || !body.staffId || !body.date || !body.timeSlot) {
      return NextResponse.json({ success: false, error: 'Bütün vacib sahələri doldurun' }, { status: 400 });
    }

    const newBooking = createBooking({
      tenantId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerFin: body.customerFin || '',
      serviceId: body.serviceId,
      staffId: body.staffId,
      date: body.date,
      timeSlot: body.timeSlot,
      status: (body.status as BookingStatus) || 'CONFIRMED'
    });

    return NextResponse.json({ success: true, booking: newBooking });
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

    const actor = {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      tenantId: currentUser.tenantId
    };

    // Toggle customer block directly
    if (body.action === 'toggleBlock') {
      const { phone, fin, ip, customerName, blocked, reason } = body;
      toggleCustomerBlock({
        phone,
        fin,
        ip,
        customerName,
        blocked: Boolean(blocked),
        reason: reason || (blocked ? 'Admin tərəfindən əl ilə bloklandı' : undefined),
        adminName: currentUser.fullName
      }, actor);
      return NextResponse.json({ success: true, message: blocked ? 'Müştəri bloklandı' : 'Müştəri blokdan çıxarıldı' });
    }

    const { id, status, customerScore, adminNotes } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const updated = updateBooking(id, {
      ...(status ? { status: status as BookingStatus } : {}),
      ...(customerScore !== undefined ? { customerScore: Number(customerScore) } : {}),
      ...(adminNotes !== undefined ? { adminNotes: String(adminNotes) } : {})
    }, actor);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Rezervasiya tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated });
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

    const success = deleteBooking(id, actor);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
