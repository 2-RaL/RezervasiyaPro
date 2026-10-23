import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUser, deleteUser, getUserById, getTenants } from '../../../../lib/dataStore';
import { getSessionUser } from '../../../../lib/auth';
import { UserRole } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantFilter = searchParams.get('tenantId');

    // Super Admin can see all users, or filter by tenant
    if (currentUser.role === 'SUPER_ADMIN') {
      const users = getUsers(tenantFilter || undefined);
      return NextResponse.json({ success: true, users, role: currentUser.role });
    }

    // Normal Admin can only see their company's users/editor
    if (currentUser.role === 'ADMIN') {
      const users = getUsers(currentUser.tenantId);
      return NextResponse.json({ success: true, users, role: currentUser.role });
    }

    // Editor is not authorized to list users
    return NextResponse.json({ success: false, error: 'İcazə verilmədi' }, { status: 403 });
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

    const body = await request.json();
    const { username, password, fullName, role, tenantId, fin, phone } = body;

    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'Bütün vacib xanaları doldurun' },
        { status: 400 }
      );
    }

    // Rule 2: Super admin can create any user and assign company
    if (currentUser.role === 'SUPER_ADMIN') {
      const result = createUser({
        username,
        password,
        fullName,
        role: role as UserRole,
        tenantId: tenantId || null,
        fin: fin || '',
        phone: phone || '',
        createdBy: currentUser.id
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, user: result.user });
    }

    // Rule 3: Normal admin can ONLY create an EDITOR for their OWN company
    if (currentUser.role === 'ADMIN') {
      if (role !== 'EDITOR') {
        return NextResponse.json(
          { success: false, error: 'Şirkət admini yalnız öz şirkəti üçün Redaktor təyin edə bilər' },
          { status: 403 }
        );
      }

      if (!currentUser.tenantId) {
        return NextResponse.json(
          { success: false, error: 'Bu admin heç bir şirkətə təyin edilməyib' },
          { status: 400 }
        );
      }

      // Check: "yalnız bir redaktor əlavə edə bilsin"
      const existingUsers = getUsers(currentUser.tenantId);
      const existingEditor = existingUsers.find(u => u.role === 'EDITOR');
      if (existingEditor) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Şirkətiniz üzrə artıq 1 redaktor (${existingEditor.fullName} - @${existingEditor.username}) təyin edilib. Şirkət üzrə yalnız bir redaktor ola bilər. Yenisini təyin etmək üçün mövcud olanı silin.` 
          },
          { status: 400 }
        );
      }

      const result = createUser({
        username,
        password,
        fullName,
        role: 'EDITOR',
        tenantId: currentUser.tenantId,
        fin: fin || '',
        phone: phone || '',
        createdBy: currentUser.id
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, user: result.user });
    }

    return NextResponse.json({ success: false, error: 'Bu əməliyyat üçün icazəniz yoxdur' }, { status: 403 });
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
    const { id, username, fullName, role, tenantId, fin, phone, password, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'İstifadəçi ID-si tələb olunur' }, { status: 400 });
    }

    const targetUser = getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'İstifadəçi tapılmadı' }, { status: 404 });
    }

    // Super Admin can edit any user
    if (currentUser.role === 'SUPER_ADMIN') {
      const updates: any = {};
      if (username !== undefined) updates.username = username;
      if (fullName !== undefined) updates.fullName = fullName;
      if (role !== undefined) updates.role = role;
      if (tenantId !== undefined) updates.tenantId = tenantId;
      if (fin !== undefined) updates.fin = fin;
      if (phone !== undefined) updates.phone = phone;
      if (password && password.trim() !== '') updates.password = password;
      if (isActive !== undefined) updates.isActive = isActive;

      const updated = updateUser(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Yenilənmə alınmadı (İstifadəçi adı artıq mövcuddur və ya xətalı parametrlər)' }, { status: 400 });
      }

      return NextResponse.json({ success: true, user: updated, message: 'İstifadəçi məlumatları yeniləndi' });
    }

    // Company Admin can ONLY edit their own company's editor
    if (currentUser.role === 'ADMIN') {
      if (targetUser.role !== 'EDITOR' || targetUser.tenantId !== currentUser.tenantId) {
        return NextResponse.json({ success: false, error: 'Yalnız öz şirkətinizin redaktorunu redaktə edə bilərsiniz' }, { status: 403 });
      }

      const updates: any = {};
      if (fullName !== undefined) updates.fullName = fullName;
      if (fin !== undefined) updates.fin = fin;
      if (phone !== undefined) updates.phone = phone;
      if (password && password.trim() !== '') updates.password = password;
      if (isActive !== undefined) updates.isActive = isActive;

      const updated = updateUser(id, updates);
      return NextResponse.json({ success: true, user: updated, message: 'Redaktor məlumatları yeniləndi' });
    }

    return NextResponse.json({ success: false, error: 'İcazə verilmədi' }, { status: 403 });
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
    const targetUserId = searchParams.get('id');

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'İstifadəçi ID-si göstərilməyib' }, { status: 400 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ success: false, error: 'Öz hesabınızı silə bilməzsiniz' }, { status: 400 });
    }

    const targetUser = getUserById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'İstifadəçi tapılmadı' }, { status: 404 });
    }

    // Super Admin can delete anyone except self
    if (currentUser.role === 'SUPER_ADMIN') {
      deleteUser(targetUserId);
      return NextResponse.json({ success: true, message: 'İstifadəçi silindi' });
    }

    // Admin can ONLY delete their own company's editor
    if (currentUser.role === 'ADMIN') {
      if (targetUser.role === 'EDITOR' && targetUser.tenantId === currentUser.tenantId) {
        deleteUser(targetUserId);
        return NextResponse.json({ success: true, message: 'Redaktor silindi' });
      } else {
        return NextResponse.json({ success: false, error: 'Bu istifadəçini silməyə icazəniz yoxdur' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: false, error: 'İcazə verilmədi' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
