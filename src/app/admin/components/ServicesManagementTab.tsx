'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Ban, 
  Power, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import { Service, Tenant, User } from '../../../lib/types';
import { SectorConfig } from '../../../lib/sectorUtils';

interface ServicesManagementTabProps {
  services: Service[];
  tenants: Tenant[];
  currentUser: User | null;
  sectorInfo: SectorConfig;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export default function ServicesManagementTab({
  services,
  tenants,
  currentUser,
  sectorInfo,
  onRefresh,
  showToast
}: ServicesManagementTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Service Data
  const [newService, setNewService] = useState({
    tenantId: tenants[0]?.id || '',
    nameAz: '',
    nameEn: '',
    price: 30,
    duration: 30,
    category: 'Ümumi',
    description: '',
    isActive: true
  });

  // Editing Service Data
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Categories list
  const uniqueCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  // Filtered Services
  const filteredServices = services.filter((s) => {
    if (isSuperAdmin && tenantFilter !== 'all' && s.tenantId !== tenantFilter) {
      return false;
    }
    if (statusFilter === 'active' && s.isActive === false) {
      return false;
    }
    if (statusFilter === 'blocked' && s.isActive !== false) {
      return false;
    }
    if (categoryFilter !== 'all' && s.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAz = s.nameAz?.toLowerCase().includes(q);
      const matchEn = s.nameEn?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      if (!matchAz && !matchEn && !matchCat) return false;
    }
    return true;
  });

  // 1. Create Service
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.nameAz.trim()) {
      alert('Zəhmət olmasa xidmət adını daxil edin');
      return;
    }

    const tenantToUse = isSuperAdmin ? newService.tenantId : (currentUser?.tenantId || tenants[0]?.id);

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newService,
          tenantId: tenantToUse,
          price: Number(newService.price) || 0,
          duration: Number(newService.duration) || 30
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Yeni xidmət uğurla yaradıldı');
        setIsCreateModalOpen(false);
        setNewService({
          tenantId: tenants[0]?.id || '',
          nameAz: '',
          nameEn: '',
          price: 30,
          duration: 30,
          category: 'Ümumi',
          description: '',
          isActive: true
        });
        onRefresh();
      } else {
        alert(data.error || 'Yaradılmadı');
      }
    } catch {
      alert('Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Open Edit Modal
  const openEditModal = (service: Service) => {
    setEditingService({ ...service });
    setIsEditModalOpen(true);
  };

  // 3. Save Edited Service
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingService,
          price: Number(editingService.price) || 0,
          duration: Number(editingService.duration) || 30
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Xidmət uğurla redaktə edildi');
        setIsEditModalOpen(false);
        setEditingService(null);
        onRefresh();
      } else {
        alert(data.error || 'Yenilənmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Toggle Active / Blocked Status
  const handleToggleBlock = async (service: Service) => {
    const isCurrentlyActive = service.isActive !== false;
    const newStatus = !isCurrentlyActive; // false means blocked, true means active

    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          isActive: newStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          newStatus 
            ? 'Xidmət təkrar aktiv edildi (Müştərilər üçün açıldı)' 
            : 'Xidmət bloklandı (Rezervasiyaya bağlandı)'
        );
        onRefresh();
      } else {
        alert(data.error || 'Status dəyişmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // 5. Delete Service
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" xidmətini silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Xidmət silindi');
        onRefresh();
      } else {
        alert(data.error || 'Silinmədi');
      }
    } catch {
      alert('Silinmədi');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card with Sector Theming */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <sectorInfo.icon className="w-3.5 h-3.5" />
            <span>{sectorInfo.label}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {sectorInfo.servicesLabel}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {sectorInfo.servicesDesc}. İstənilən xidməti redaktə edə, müvəqqəti bloklaya (deaktiv edə) və ya silə bilərsiniz.
          </p>
        </div>

        {/* Add Service Button */}
        <button
          onClick={() => {
            if (tenants.length > 0) {
              setNewService(prev => ({ ...prev, tenantId: tenants[0].id }));
            }
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{sectorInfo.quickActionService}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Xidmət adı və ya kateqoriya ilə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter (Hamısı, Aktiv, Bloklanmış) */}
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Bütün Statuslar</option>
            <option value="active">🟢 Yalnız Aktivlər</option>
            <option value="blocked">🔴 Bloklananlar (Deaktiv)</option>
          </select>
        </div>

        {/* Category Filter */}
        {uniqueCategories.length > 0 && (
          <div className="w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Kateqoriyalar</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Super Admin: Tenant Filter */}
        {isSuperAdmin && (
          <div className="w-full md:w-auto">
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Filiallar ({tenants.length})</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Xidmət tapılmadı</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Seçilmiş filtrlər üzrə xidmət yoxdur. Yeni xidmət əlavə etmək üçün yuxarıdakı düyməni sıxın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((s) => {
            const isActive = s.isActive !== false;
            return (
              <div
                key={s.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'border-slate-200 dark:border-white/10 hover:border-indigo-400/60' 
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                <div>
                  {/* Category and Active/Blocked Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                      {s.category}
                    </span>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Aktiv</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <Ban className="w-3 h-3 text-rose-500" />
                        <span>Bloklanıb</span>
                      </span>
                    )}
                  </div>

                  {/* Service Title */}
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                    {s.nameAz}
                  </h4>
                  {s.nameEn && (
                    <p className="text-xs text-slate-400 italic mb-3">{s.nameEn}</p>
                  )}

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Qiymət</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {s.price} ₼
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Müddət</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>{s.duration} dəq</span>
                      </span>
                    </div>
                  </div>

                  {/* Description if present */}
                  {s.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {s.description}
                    </p>
                  )}
                </div>

                {/* Card Action Controls: Block/Unblock, Edit, Delete */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  
                  {/* Block / Reactivate Button */}
                  <button
                    onClick={() => handleToggleBlock(s)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Blokla (Deaktiv Et)</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-3.5 h-3.5" />
                        <span>Təkrar Aktiv Et</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(s)}
                      title="Redaktə Et"
                      className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(s.id, s.nameAz)}
                      title="Sil"
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ MODAL 1: CREATE NEW SERVICE ═══════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {sectorInfo.quickActionService}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Xidmətin adı, qiyməti və müddətini təyin edin
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Müəssisə / Filial *
                  </label>
                  <select
                    value={newService.tenantId}
                    onChange={(e) => setNewService({ ...newService, tenantId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xidmətin Adı (Azərbaycanca) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Klassik Saç Kəsimi və ya Stomatoloji Baxış"
                  value={newService.nameAz}
                  onChange={(e) => setNewService({ ...newService, nameAz: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xidmətin Adı (İngiliscə)
                </label>
                <input
                  type="text"
                  placeholder="Məs: Classic Haircut & Style"
                  value={newService.nameEn}
                  onChange={(e) => setNewService({ ...newService, nameEn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Qiymət (AZN) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Müddət (Dəq) *
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kateqoriya
                  </label>
                  <input
                    type="text"
                    placeholder="Məs: Saç, Baxım"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Yaradılır...' : 'Xidməti Əlavə Et'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 2: EDIT EXISTING SERVICE ═══════════ */}
      {isEditModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Xidməti Redaktə Et
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Qiymət, müddət və təsviri yeniləyin
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingService(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xidmətin Adı (Azərbaycanca) *
                </label>
                <input
                  type="text"
                  required
                  value={editingService.nameAz}
                  onChange={(e) => setEditingService({ ...editingService, nameAz: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xidmətin Adı (İngiliscə)
                </label>
                <input
                  type="text"
                  value={editingService.nameEn || ''}
                  onChange={(e) => setEditingService({ ...editingService, nameEn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Qiymət (AZN) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Müddət (Dəq) *
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kateqoriya
                  </label>
                  <input
                    type="text"
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={editingService.isActive !== false ? 'active' : 'blocked'}
                  onChange={(e) => setEditingService({ ...editingService, isActive: e.target.value === 'active' })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">🟢 Aktiv (Sifariş üçün açıqdır)</option>
                  <option value="blocked">🔴 Bloklanıb (Sifariş üçün qapalıdır)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
