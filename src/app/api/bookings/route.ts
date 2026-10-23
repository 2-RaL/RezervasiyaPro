import { NextResponse } from 'next/server';
import { createBooking, getBookings } from '../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const date = searchParams.get('date') || undefined;
    const staffId = searchParams.get('staffId') || undefined;

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID mütləqdir' }, { status: 400 });
    }

    const allBookings = getBookings({ tenantId, date });
    const activeBookings = allBookings.filter(b => b.status !== 'CANCELLED');

    const bookedSlots = activeBookings.map(b => ({
      date: b.date,
      timeSlot: b.timeSlot,
      staffId: b.staffId
    }));

    return NextResponse.json({
      success: true,
      bookedSlots
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.tenantId || !body.customerName || !body.customerPhone || !body.serviceId || !body.staffId || !body.date || !body.timeSlot) {
      return NextResponse.json({ success: false, error: 'Bütün vacib sahələri doldurun (Ad, Telefon, Xidmət, Mütəxəssis, Tarix, Saat)' }, { status: 400 });
    }

    // Requirement 1 validation: Name cannot contain digits; Phone cannot contain letters
    const rawName = String(body.customerName).trim();
    const rawPhone = String(body.customerPhone).trim();

    if (/\d/.test(rawName)) {
      return NextResponse.json({ success: false, error: 'Ad və Soyad xanasına rəqəm yazıla bilməz, yalnız hərf daxil edin.' }, { status: 400 });
    }

    if (/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFFəıöğçşƏIİÖĞÇŞ]/.test(rawPhone)) {
      return NextResponse.json({ success: false, error: 'Nömrə xanasına hərf yazıla bilməz, yalnız rəqəm daxil edin.' }, { status: 400 });
    }

    // Requirement 3: Check if time slot is already booked for this staff on this date
    const existingBookings = getBookings({ tenantId: body.tenantId, date: body.date });
    const isSlotTaken = existingBookings.some(
      b => b.status !== 'CANCELLED' && 
           b.date === body.date && 
           b.timeSlot === body.timeSlot &&
           b.staffId === body.staffId
    );

    if (isSlotTaken) {
      return NextResponse.json({
        success: false,
        error: `Seçilmiş saat (${body.timeSlot}) həmin mütəxəssis üçün artıq rezerv olunub. Zəhmət olmasa başqa saat seçin.`
      }, { status: 409 });
    }

    const booking = createBooking({
      tenantId: body.tenantId,
      customerName: rawName,
      customerPhone: rawPhone,
      customerFin: body.customerFin ? String(body.customerFin).trim().toUpperCase() : '',
      serviceId: body.serviceId,
      staffId: body.staffId,
      date: body.date,
      timeSlot: body.timeSlot,
      status: 'CONFIRMED'
    });

    return NextResponse.json({
      success: true,
      message: 'Rezervasiyanız uğurla qeydə alındı!',
      booking
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
