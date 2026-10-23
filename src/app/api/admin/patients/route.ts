import { NextResponse } from 'next/server';
import { getPatients, createPatient, updatePatient, deletePatient, addClinicalEncounter } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';

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
      fullName: body.fullName.trim(),
      fin: body.fin.toUpperCase().trim(),
      phone: body.phone ? body.phone.trim() : null,
      birthDate: body.birthDate || null,
      bloodGroup: body.bloodGroup || null,
      allergies: body.allergies || null,
      notes: body.notes || null
    });

    return NextResponse.json({ success: true, patient });
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
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Pasiyent ID tələb olunur' }, { status: 400 });
    }

    const updated = updatePatient(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Pasiyent tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: updated });
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
      return NextResponse.json({ success: false, error: 'Pasiyent ID tələb olunur' }, { status: 400 });
    }

    const success = deletePatient(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Pasiyent tapılmadı və ya silinmədi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pasiyent kartı uğurla silindi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
