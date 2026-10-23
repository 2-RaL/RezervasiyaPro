import { NextResponse } from 'next/server';
import { createBooking, getBookings, isCustomerBlocked, getServices, getStaff, isTimeOverlapping, getTenantById } from '../../../lib/dataStore';
import { prepareWhatsAppBookingNotification } from '../../../lib/whatsapp';

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
      staffId: b.staffId,
      duration: b.duration || 30
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
    // Extract Client IP (device tracking)
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1');

    const body = await request.json();
    if (!body.tenantId || !body.customerName || !body.customerPhone || !body.serviceId || !body.staffId || !body.date || !body.timeSlot) {
      return NextResponse.json({ success: false, error: 'Bütün vacib sahələri doldurun (Ad, Telefon, Xidmət, Mütəxəssis, Tarix, Saat)' }, { status: 400 });
    }

    // Requirement 1 validation: Name cannot contain digits; Phone cannot contain letters
    const rawName = String(body.customerName).trim();
    const rawPhone = String(body.customerPhone).trim();
    const cleanFin = body.customerFin ? String(body.customerFin).trim().toUpperCase() : '';

    if (/\d/.test(rawName)) {
      return NextResponse.json({ success: false, error: 'Ad və Soyad xanasına rəqəm yazıla bilməz, yalnız hərf daxil edin.' }, { status: 400 });
    }

    if (/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFFəıöğçşƏIİÖĞÇŞ]/.test(rawPhone)) {
      return NextResponse.json({ success: false, error: 'Nömrə xanasına hərf yazıla bilməz, yalnız rəqəm daxil edin.' }, { status: 400 });
    }

    // Requirement 3: Multi-layer Block Check (IP / Device, Phone, or FIN)
    const blockCheck = isCustomerBlocked({
      phone: rawPhone,
      fin: cleanFin,
      ip: clientIp
    });

    if (blockCheck.isBlocked) {
      return NextResponse.json({
        success: false,
        blocked: true,
        error: blockCheck.reason || 'Daha əvvəl 3 dəfə rezervasiyaya gəlinmədiyi üçün onlayn rezervasiyanız bloklanıb. Zəhmət olmasa birbaşa əlaqə saxlayın.'
      }, { status: 403 });
    }

    // Determine booking duration from staff slotDuration or service duration
    const services = getServices(body.tenantId);
    const staffList = getStaff(body.tenantId);
    const service = services.find(s => s.id === body.serviceId);
    const staff = staffList.find(st => st.id === body.staffId);
    const bookingDuration = (staff?.slotDuration && staff.slotDuration > 0) ? staff.slotDuration : (service?.duration || 30);

    // Check if time slot is already booked or overlaps with existing bookings for this staff on this date
    const existingBookings = getBookings({ tenantId: body.tenantId, date: body.date });
    const isSlotTaken = existingBookings.some(
      b => b.status !== 'CANCELLED' && 
           b.date === body.date && 
           b.staffId === body.staffId &&
           isTimeOverlapping(body.timeSlot, bookingDuration, b.timeSlot, b.duration || 30)
    );

    if (isSlotTaken) {
      return NextResponse.json({
        success: false,
        error: `Seçilmiş saat (${body.timeSlot}) və ya onun tələb etdiyi vaxt aralığı (${bookingDuration} dəqiqə) bu mütəxəssis üçün artıq mövcud rezervasiya ilə kəsişir. Zəhmət olmasa başqa saat seçin.`
      }, { status: 409 });
    }

    const booking = createBooking({
      tenantId: body.tenantId,
      customerName: rawName,
      customerPhone: rawPhone,
      customerFin: cleanFin,
      serviceId: body.serviceId,
      staffId: body.staffId,
      date: body.date,
      timeSlot: body.timeSlot,
      duration: bookingDuration,
      status: 'CONFIRMED',
      clientIp
    });

    const tenant = getTenantById(body.tenantId);
    const tenantName = tenant?.name || 'Müəssisə';
    const whatsappNotification = prepareWhatsAppBookingNotification({
      tenantName,
      tenantWhatsApp: tenant?.whatsapp,
      tenantPhone: tenant?.phone,
      notificationEnabled: tenant?.whatsappNotificationEnabled !== false,
      customTemplate: tenant?.whatsappTemplate,
      customerPhone: rawPhone,
      customerName: rawName,
      timeSlot: body.timeSlot,
      date: body.date,
      serviceName: service?.nameAz
    });

    return NextResponse.json({
      success: true,
      message: 'Rezervasiyanız uğurla qeydə alındı!',
      booking,
      whatsappNotification
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
