import { NextResponse } from 'next/server';
import { getTenantBySlug } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const tenant = getTenantBySlug(slug);

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
