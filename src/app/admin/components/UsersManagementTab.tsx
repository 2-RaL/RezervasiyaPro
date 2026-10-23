'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Crown, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Phone, 
  CreditCard,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { User, Tenant, UserRole } from '../../../lib/types';

interface UsersManagementTabProps {
  users: User[];
  tenants: Tenant[];
  currentUser: User | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export default function UsersManagementTab({
  users,
  tenants,
  currentUser,
  onRefresh,
  showToast
}: UsersManagementTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    fullName: '',
    username: '',
    password: '',
    fin: '',
    phone: '+994 ',
    role: 'ADMIN' as UserRole,
    tenantId: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    fullName: '',
    username: '',
    password: '',
    fin: '',
    phone: '',
    role: 'ADMIN' as UserRole,
    tenantId: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setSelectedUserForEdit(user);
    setEditForm({
      id: user.id,
      fullName: user.fullName || '',
      username: user.username || '',
      password: '', // leave empty unless changing
      fin: user.fin || '',
      phone: user.phone || '',
      role: user.role,
      tenantId: user.tenantId || '',
      isActive: user.isActive !== false
    });
    setIsEditModalOpen(true);
  };

  // Toggle Block/Unblock
  const handleToggleBlock = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Öz hesabınızı bloklaya bilməzsiniz!');
      return;
    }

    const nextState = user.isActive === false ? true : false;
    const actionLabel = nextState ? 'aktiv etmək' : 'bloklamaq';

    if (!confirm(`"${user.fullName}" istifadəçisini ${actionLabel} istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          isActive: nextState
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(nextState ? 'İstifadəçi hesabı aktiv edildi' : 'İstifadəçi hesabı bloklandı');
        onRefresh();
      } else {
        alert(data.error || 'Əməliyyat yerinə yetirilmədi');
      }
    } catch (e) {
      alert('Xəta baş verdi');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Öz hesabınızı silə bilməzsiniz!');
      return;
    }

    if (!confirm(`"${user.fullName}" (@${user.username}) istifadəçisini birdəfəlik silmək istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('İstifadəçi uğurla silindi');
        onRefresh();
      } else {
        alert(data.error || 'Silinmə zamanı xəta baş verdi');
      }
    } catch (e) {
      alert('Xəta baş verdi');
    }
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.username.trim() || !addForm.password.trim()) {
      alert('Zəhmət olmasa bütün vacib xanaları doldurun.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni istifadəçi uğurla yaradıldı');
        setIsAddModalOpen(false);
        setAddForm({
          fullName: '',
          username: '',
          password: '',
          fin: '',
          phone: '+994 ',
          role: 'ADMIN',
          tenantId: ''
        });
        onRefresh();
      } else {
        alert(data.error || 'İstifadəçi yaradılmadı');
      }
    } catch (err) {
      alert('Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim() || !editForm.username.trim()) {
      alert('Ad və İstifadəçi adı boş ola bilməz.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('İstifadəçi məlumatları və şifrəsi yeniləndi');
        setIsEditModalOpen(false);
        setSelectedUserForEdit(null);
        onRefresh();
      } else {
        alert(data.error || 'Yenilənmə zamanı xəta baş verdi');
      }
    } catch (err) {
      alert('Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Requirement 5: Excel Export (Sadəcə FİN, Ad/Soyad və Şirkətin Adı)
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      alert('İxrac etmək üçün istifadəçi tapılmadı.');
      return;
    }

    // CSV Headers strictly as requested: FIN, Ad / Soyad, Şirkətin Adı
    const headers = ['FIN', 'Ad / Soyad', 'Şirkətin Adı'];
    const rows = filteredUsers.map(u => [
      `"${(u.fin || '').replace(/"/g, '""')}"`,
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      `"${(u.tenantName || (u.role === 'SUPER_ADMIN' ? 'Bütün Sistem (Super Admin)' : 'Təyin edilməyib')).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Azerbaijani characters (ə, ı, ö, ğ, ç, ş) flawlessly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `istifadeciler_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('İstifadəçilər siyahısı Excel (CSV) kimi endirildi');
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    // Search query
    const query = search.toLowerCase().trim();
    if (query) {
      const matchName = u.fullName?.toLowerCase().includes(query);
      const matchUsername = u.username?.toLowerCase().includes(query);
      const matchFin = u.fin?.toLowerCase().includes(query);
      const matchTenant = u.tenantName?.toLowerCase().includes(query);
      if (!matchName && !matchUsername && !matchFin && !matchTenant) return false;
    }

    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    // Status filter
    if (statusFilter === 'active' && u.isActive === false) return false;
    if (statusFilter === 'blocked' && u.isActive !== false) return false;

    // Tenant filter
    if (tenantFilter !== 'all' && u.tenantId !== tenantFilter) return false;

    return true;
  });

  // KPI Metrics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.isActive !== false).length;
  const blockedCount = users.filter(u => u.isActive === false).length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const editorCount = users.filter(u => u.role === 'EDITOR').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">İstifadəçilərin İdarə Edilməsi</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistem adminləri, redaktorlar, şifrə redaktəsi, bloklama və Excel hesabatı
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            title="İstifadəçiləri Excel formatında endir"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (CSV) Endir</span>
          </button>

          {/* Add User Button (Super Admin or Company Admin) */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni İstifadəçi</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Ümumi İstifadəçi
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">100%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            🟢 Aktiv Hesablar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <span className="text-xs text-slate-400">Giriş edə bilir</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-500/20 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
            🔴 Bloklananlar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{blockedCount}</span>
            <span className="text-xs text-rose-500">Giriş dayandırılıb</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Admin & Redaktor
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{adminCount + editorCount}</span>
            <span className="text-xs text-slate-500">{adminCount} adm / {editorCount} red</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ad, istifadəçi adı, FİN və ya şirkət..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Bütün Rollar</option>
            <option value="SUPER_ADMIN">👑 Super Admin</option>
            <option value="ADMIN">🏢 Şirkət Admini</option>
            <option value="EDITOR">✍️ Redaktor</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Bütün Statuslar</option>
            <option value="active">🟢 Yalnız Aktivlər</option>
            <option value="blocked">🔴 Yalnız Bloklananlar</option>
          </select>

          {/* Company Filter (Super Admin) */}
          {isSuperAdmin && (
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Şirkətlər</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
          Göstərilir: <b>{filteredUsers.length}</b> istifadəçi
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-3.5">FİN Kodu</th>
                <th className="p-3.5">Ad və Soyad</th>
                <th className="p-3.5">İstifadəçi Adı</th>
                <th className="p-3.5">Rolu</th>
                <th className="p-3.5">Şirkətin Adı</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const isBlocked = u.isActive === false;
                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${
                        isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* FIN */}
                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {u.fin ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            {u.fin}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Full Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                              Siz
                            </span>
                          )}
                        </div>
                        {u.phone && (
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Username */}
                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        @{u.username}
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        {u.role === 'SUPER_ADMIN' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Super Admin</span>
                          </span>
                        )}
                        {u.role === 'ADMIN' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>Şirkət Admini</span>
                          </span>
                        )}
                        {u.role === 'EDITOR' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Redaktor</span>
                          </span>
                        )}
                      </td>

                      {/* Company Name */}
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {u.tenantName || (u.role === 'SUPER_ADMIN' ? 'Bütün Sistem (Super Admin)' : 'Təyin edilməyib')}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Bloklanıb</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktiv</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Edit User Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500 text-indigo-700 dark:text-indigo-300 hover:text-white transition-all"
                            title="İstifadəçini və şifrəni redaktə et"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock Toggle Button */}
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleToggleBlock(u)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isBlocked
                                  ? 'bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white'
                                  : 'bg-amber-50 hover:bg-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white'
                              }`}
                              title={isBlocked ? 'Hesabı Aktiv Et' : 'Hesabı Blokla'}
                            >
                              {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete User Button */}
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                              title="İstifadəçini Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Axtarışa və ya filtrlərə uyğun istifadəçi tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ MODAL: ADD USER ═══════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Yeni İstifadəçi Əlavə Et</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad və Soyad * (Yalnız hərflər)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Rəşad Quliyev"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value.replace(/[^a-zA-Z\səıöğçşƏIİÖĞÇŞ'-]/g, '') })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    İstifadəçi Adı * (Login)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="resad_q"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    FİN Kodu (7 simvol)
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="7ABC123"
                    value={addForm.fin}
                    onChange={(e) => setAddForm({ ...addForm, fin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Şifrə *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobil Nömrə
                  </label>
                  <input
                    type="tel"
                    placeholder="+994 50 123 45 67"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value.replace(/[^\d+\s()-]/g, '') })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  İstifadəçi Rolu
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="ADMIN">Şirkət Admini (ADMIN)</option>
                  <option value="SUPER_ADMIN">Super Administrator (SUPER_ADMIN)</option>
                  <option value="EDITOR">Filial Redaktoru (EDITOR)</option>
                </select>
              </div>

              {addForm.role !== 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Təyin Ediləcək Şirkət / Filial
                  </label>
                  <select
                    value={addForm.tenantId}
                    onChange={(e) => setAddForm({ ...addForm, tenantId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">-- Şirkət seçin --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Yaradılır...' : 'İstifadəçini Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT USER & PASSWORD ═══════════ */}
      {isEditModalOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  <span>İstifadəçini Redaktə Et</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedUserForEdit.fullName} (@{selectedUserForEdit.username})
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad və Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value.replace(/[^a-zA-Z\səıöğçşƏIİÖĞÇŞ'-]/g, '') })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    İstifadəçi Adı (Login)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    FİN Kodu
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="7ABC123"
                    value={editForm.fin}
                    onChange={(e) => setEditForm({ ...editForm, fin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Password update field */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 space-y-1">
                <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Yeni Şifrə (Dəyişmək üçün)</span>
                </label>
                <input
                  type="password"
                  placeholder="Dəyişmək istəmirsinizsə boş saxlayın"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Yeni şifrə daxil etsəniz, istifadəçinin şifrəsi dərhal yenilənəcək.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobil Nömrə
                </label>
                <input
                  type="tel"
                  placeholder="+994 50 123 45 67"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^\d+\s()-]/g, '') })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {isSuperAdmin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rolu</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="ADMIN">Şirkət Admini</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="EDITOR">Redaktor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Şirkət / Filial</label>
                    <select
                      value={editForm.tenantId}
                      onChange={(e) => setEditForm({ ...editForm, tenantId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">Təyin edilməyib</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Status Radio / Checkbox */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hesab Statusu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: true })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      editForm.isActive
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🟢 Aktiv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: false })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !editForm.isActive
                        ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400'
                        : 'border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>🔴 Bloklanmış</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Yenilənir...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
