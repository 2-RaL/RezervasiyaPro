import { NextResponse } from 'next/server';
import { getTenants, createTenant, updateTenant, deleteTenant, getUsers, updateUser } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const allTenants = getTenants();
    const allUsers = getUsers();

    // Map each tenant with its assigned admin user(s) and editor(s)
    const tenantsWithUsers = allTenants.map(t => {
      const assignedAdmin = allUsers.find(u => u.tenantId === t.id && u.role === 'ADMIN');
      const assignedEditor = allUsers.find(u => u.tenantId === t.id && u.role === 'EDITOR');
      return {
        ...t,
        assignedAdmin: assignedAdmin ? { id: assignedAdmin.id, fullName: assignedAdmin.fullName, username: assignedAdmin.username } : null,
        assignedEditor: assignedEditor ? { id: assignedEditor.id, fullName: assignedEditor.fullName, username: assignedEditor.username } : null
      };
    });

    // If Super Admin, return all companies
    if (currentUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ success: true, tenants: tenantsWithUsers, role: currentUser.role });
    }

    // Normal Admin or Editor can only see their assigned company
    const myTenants = tenantsWithUsers.filter(t => t.id === currentUser.tenantId);
    return NextResponse.json({ success: true, tenants: myTenants, role: currentUser.role });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    // Rule 2: Only Super Admin can add companies/pages
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Yalnız Super Admin yeni şirkət/filial əlavə edə bilər' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.slug || !body.sector) {
      return NextResponse.json({ success: false, error: 'Ad, slug və sektor sahələri vacibdir' }, { status: 400 });
    }

    const tenant = createTenant({
      name: body.name,
      slug: body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
      sector: body.sector,
      status: body.status || 'ACTIVE',
      medicalEnabled: Boolean(body.medicalEnabled),
      phone: body.phone || null,
      address: body.address || null,
      coverImage: body.coverImage || null,
      logo: body.logo || null
    });

    // Rule 3: Super Admin can assign this new company to an Admin user
    if (body.assignedAdminId) {
      updateUser(body.assignedAdminId, { tenantId: tenant.id });
    }

    return NextResponse.json({ success: true, tenant });
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
    const { id, assignedAdminId, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    // Role check: Normal Admin can only edit their own company
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.tenantId !== id) {
      return NextResponse.json({ success: false, error: 'Yalnız öz şirkətinizi idarə edə bilərsiniz' }, { status: 403 });
    }

    const updated = updateTenant(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    // If Super Admin wants to reassign admin user
    if (currentUser.role === 'SUPER_ADMIN' && assignedAdminId !== undefined) {
      // First unassign any other user currently assigned to this tenant if needed, or set new
      if (assignedAdminId) {
        updateUser(assignedAdminId, { tenantId: id });
      }
    }

    return NextResponse.json({ success: true, tenant: updated });
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

    // Rule 2: Only Super Admin can delete companies/pages
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Yalnız Super Admin filial silə bilər' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tələb olunur' }, { status: 400 });
    }

    const success = deleteTenant(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
