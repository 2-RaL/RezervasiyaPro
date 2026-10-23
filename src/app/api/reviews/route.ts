import { NextResponse } from 'next/server';
import { getReviews, createReview, deleteReview } from '../../../lib/dataStore';
import { getSessionUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const reviews = getReviews(tenantId);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, customerName, customerPhone, rating, comment, serviceName, tenantName } = body;

    if (!tenantId || !customerName || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'Müəssisə, ad, rəy mətni və bal tələb olunur' },
        { status: 400 }
      );
    }

    const review = createReview({
      tenantId,
      tenantName: tenantName || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      serviceName: serviceName ? serviceName.trim() : undefined,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment: comment.trim()
    });

    return NextResponse.json({ success: true, review });
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
