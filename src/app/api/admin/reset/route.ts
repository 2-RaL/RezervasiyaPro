import { NextResponse } from 'next/server';
import { resetDemoData } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    resetDemoData();
    return NextResponse.json({ success: true, message: 'Demo məlumatlar bərpa edildi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
