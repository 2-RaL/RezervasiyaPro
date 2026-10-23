import { NextResponse } from 'next/server';
import { getPatients, createPatient, addClinicalEncounter } from '../../../../lib/dataStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const patients = getPatients(tenantId);
    return NextResponse.json({ success: true, patients });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'encounter') {
      const { patientId, doctorName, diagnosis, treatment, prescription } = body;
      if (!patientId || !doctorName || !diagnosis || !treatment) {
        return NextResponse.json({ success: false, error: 'Xəstə, həkim, diaqnoz və müalicə tələb olunur' }, { status: 400 });
      }

      const encounter = addClinicalEncounter(patientId, {
        doctorName,
        diagnosis,
        treatment,
        prescription: prescription || null
      });

      return NextResponse.json({ success: true, encounter });
    }

    // Default: create new patient
    if (!body.tenantId || !body.fullName || !body.fin) {
      return NextResponse.json({ success: false, error: 'Filial, pasiyentin tam adı və FİN kodu tələb olunur' }, { status: 400 });
    }

    const patient = createPatient({
      tenantId: body.tenantId,
      fullName: body.fullName,
      fin: body.fin.toUpperCase().trim(),
      birthDate: body.birthDate || null,
      bloodGroup: body.bloodGroup || null,
      allergies: body.allergies || null
    });

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
