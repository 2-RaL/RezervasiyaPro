import { NextResponse } from 'next/server';
import { createBooking } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.tenantId || !body.customerName || !body.customerPhone || !body.serviceId || !body.staffId || !body.date || !body.timeSlot) {
      return NextResponse.json({ success: false, error: 'Bütün vacib sahələri doldurun (Ad, Telefon, Xidmət, Mütəxəssis, Tarix, Saat)' }, { status: 400 });
    }

    const booking = createBooking({
      tenantId: body.tenantId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerFin: body.customerFin || '',
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
