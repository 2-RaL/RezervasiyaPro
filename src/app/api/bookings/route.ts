import { NextResponse } from 'next/server';
import { createBooking, getBookings, isCustomerBlocked, getServices, getStaff, isTimeOverlapping, getTenantById, addWhatsAppLog } from '../../../lib/dataStore';
import { dispatchWhatsAppBookingNotification } from '../../../lib/whatsapp';

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
    const tenant = getTenantById(body.tenantId);

    // Validate that the date is NOT blocked by Admin or Editor
    const [bYear, bMonth, bDay] = body.date.split('-').map(Number);
    const bookingDateObj = new Date(bYear, bMonth - 1, bDay);
    const dayOfWeek = bookingDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const isDayBlocked = 
      (service?.blockedDays && service.blockedDays.includes(dayOfWeek)) ||
      (service?.blockedDates && service.blockedDates.includes(body.date)) ||
      (tenant?.blockedDays && tenant.blockedDays.includes(dayOfWeek)) ||
      (tenant?.blockedDates && tenant.blockedDates.includes(body.date));

    if (isDayBlocked) {
      return NextResponse.json({
        success: false,
        error: `Seçilmiş tarix (${body.date}) admin və ya redaktor tərəfindən bloklanıb və qapalıdır. Yalnız təqvimdə açıq olan günlərə rezervasiya edilə bilər.`
      }, { status: 400 });
    }

    // Validate that timeSlot falls strictly within open working hours
    const workStartTime = service?.workStartTime || tenant?.workStartTime || '09:00';
    const workEndTime = service?.workEndTime || tenant?.workEndTime || '21:00';
    const [startH, startMin] = workStartTime.split(':').map(Number);
    const [endH, endMin] = workEndTime.split(':').map(Number);
    const startM = (startH || 9) * 60 + (startMin || 0);
    const endM = (endH || 21) * 60 + (endMin || 0);

    const [slotH, slotMin] = body.timeSlot.split(':').map(Number);
    const slotM = (slotH || 0) * 60 + (slotMin || 0);

    if (slotM < startM || slotM > endM) {
      return NextResponse.json({
        success: false,
        error: `Seçilmiş saat (${body.timeSlot}) bu xidmət üçün təyin edilmiş açıq iş saatlarından (${workStartTime} - ${workEndTime}) kənardadır.`
      }, { status: 400 });
    }

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

    let whatsappNotification = null;
    if (tenant) {
      whatsappNotification = await dispatchWhatsAppBookingNotification({
        tenant,
        customerPhone: rawPhone,
        customerName: rawName,
        timeSlot: body.timeSlot,
        date: body.date,
        serviceName: service?.nameAz,
        staffName: staff?.name,
        logHandler: addWhatsAppLog
      });
    }

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
