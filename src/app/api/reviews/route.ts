import { NextResponse } from 'next/server';
import { getReviews, createReview, deleteReview, hasIpReviewed } from '../../../lib/dataStore';
import { getSessionUser } from '../../../lib/auth';
import { sanitizePublicReview, sanitizeInputText } from '../../../lib/security';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const currentUser = getSessionUser();

    const reviews = getReviews(tenantId);
    
    // Privacy protection: if not logged-in admin, strip client IP and customer phone number
    const safeReviews = currentUser ? reviews : reviews.map(sanitizePublicReview);

    return NextResponse.json({ success: true, reviews: safeReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json();
    const { tenantId, customerName, customerPhone, rating, comment, serviceName, tenantName } = body;

    if (!tenantId || !customerName || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'Müəssisə, ad, rəy mətni və bal tələb olunur' },
        { status: 400 }
      );
    }

    // Rate-limiting / anti-spam: One review per client IP
    if (hasIpReviewed(clientIp, tenantId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Siz bu müəssisə üçün artıq rəy bildirmisiniz. Təhlükəsizlik qaydalarına əsasən, bir IP ünvanından yalnız bir dəfə rəy yazmaq mümkündür.` 
        },
        { status: 429 }
      );
    }

    // Stored XSS defense: Sanitize text inputs
    const cleanCustomerName = sanitizeInputText(customerName.trim());
    const cleanComment = sanitizeInputText(comment.trim());
    const cleanServiceName = serviceName ? sanitizeInputText(serviceName.trim()) : undefined;

    const review = createReview({
      tenantId,
      tenantName: tenantName || undefined,
      customerName: cleanCustomerName,
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      serviceName: cleanServiceName,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment: cleanComment,
      clientIp
    });

    return NextResponse.json({ success: true, review: sanitizePublicReview(review) });
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

    const success = deleteReview(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
