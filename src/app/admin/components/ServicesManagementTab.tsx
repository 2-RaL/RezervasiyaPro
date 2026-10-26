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
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { Service, Tenant, User } from '../../../lib/types';
import { SectorConfig } from '../../../lib/sectorUtils';

const formatDuration = (mins?: number) => {
  const m = Number(mins) || 30;
  if (m >= 60) {
    const hours = Math.floor(m / 60);
    const rem = m % 60;
    if (rem === 0) return `${hours} saat (${m} dəq)`;
    return `${hours} saat ${rem} dəq (${m} dəq)`;
  }
  return `${m} dəq`;
};

const DURATION_PRESETS = [
  { label: '15 dəq', value: 15 },
  { label: '30 dəq', value: 30 },
  { label: '45 dəq', value: 45 },
  { label: '1 saat', value: 60 },
  { label: '1.5 saat', value: 90 },
  { label: '2 saat', value: 120 },
  { label: '3 saat', value: 180 },
];

const WEEKDAYS = [
  { day: 1, name: 'Bazar ertəsi', short: 'B.e' },
  { day: 2, name: 'Çərşənbə axşamı', short: 'Ç.a' },
  { day: 3, name: 'Çərşənbə', short: 'Çər' },
  { day: 4, name: 'Cümə axşamı', short: 'C.a' },
  { day: 5, name: 'Cümə', short: 'Cüm' },
  { day: 6, name: 'Şənbə', short: 'Şən' },
  { day: 0, name: 'Bazar', short: 'Baz' },
];

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
    nameRu: '',
    nameEn: '',
    price: 30,
    duration: 30,
    category: 'Ümumi',
    description: '',
    isActive: true,
    blockedDays: [] as number[],
    blockedDates: [] as string[],
    workStartTime: '09:00',
    workEndTime: '21:00'
  });

  const [newBlockedDateInput, setNewBlockedDateInput] = useState('');
  const [editBlockedDateInput, setEditBlockedDateInput] = useState('');

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
      const matchRu = s.nameRu?.toLowerCase().includes(q);
      const matchEn = s.nameEn?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      if (!matchAz && !matchRu && !matchEn && !matchCat) return false;
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
          duration: Number(newService.duration) || 30,
          blockedDays: newService.blockedDays || [],
          blockedDates: newService.blockedDates || [],
          workStartTime: newService.workStartTime || '09:00',
          workEndTime: newService.workEndTime || '21:00'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Yeni xidmət uğurla yaradıldı');
        setIsCreateModalOpen(false);
        setNewService({
          tenantId: tenants[0]?.id || '',
          nameAz: '',
          nameRu: '',
          nameEn: '',
          price: 30,
          duration: 30,
          category: 'Ümumi',
          description: '',
          isActive: true,
          blockedDays: [],
          blockedDates: [],
          workStartTime: '09:00',
          workEndTime: '21:00'
        });
        setNewBlockedDateInput('');
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
    setEditingService({
      ...service,
      blockedDays: service.blockedDays || [],
      blockedDates: service.blockedDates || [],
      workStartTime: service.workStartTime || '09:00',
      workEndTime: service.workEndTime || '21:00'
    });
    setEditBlockedDateInput('');
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
          duration: Number(editingService.duration) || 30,
          blockedDays: editingService.blockedDays || [],
          blockedDates: editingService.blockedDates || [],
          workStartTime: editingService.workStartTime || '09:00',
          workEndTime: editingService.workEndTime || '21:00'
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

  // Day & Date Blocking Helpers
  const toggleNewBlockedDay = (day: number) => {
    setNewService(prev => {
      const exists = prev.blockedDays?.includes(day);
      const updated = exists 
        ? prev.blockedDays.filter(d => d !== day)
        : [...(prev.blockedDays || []), day];
      return { ...prev, blockedDays: updated };
    });
  };

  const addNewBlockedDate = () => {
    if (!newBlockedDateInput) return;
    if (newService.blockedDates.includes(newBlockedDateInput)) return;
    setNewService(prev => ({
      ...prev,
      blockedDates: [...(prev.blockedDates || []), newBlockedDateInput].sort()
    }));
    setNewBlockedDateInput('');
  };

  const removeNewBlockedDate = (dateStr: string) => {
    setNewService(prev => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).filter(d => d !== dateStr)
    }));
  };

  const toggleEditBlockedDay = (day: number) => {
    if (!editingService) return;
    setEditingService(prev => {
      if (!prev) return null;
      const exists = prev.blockedDays?.includes(day);
      const updated = exists 
        ? (prev.blockedDays || []).filter(d => d !== day)
        : [...(prev.blockedDays || []), day];
      return { ...prev, blockedDays: updated };
    });
  };

  const addEditBlockedDate = () => {
    if (!editBlockedDateInput || !editingService) return;
    if ((editingService.blockedDates || []).includes(editBlockedDateInput)) return;
    setEditingService(prev => {
      if (!prev) return null;
      return {
        ...prev,
        blockedDates: [...(prev.blockedDates || []), editBlockedDateInput].sort()
      };
    });
    setEditBlockedDateInput('');
  };

  const removeEditBlockedDate = (dateStr: string) => {
    if (!editingService) return;
    setEditingService(prev => {
      if (!prev) return null;
      return {
        ...prev,
        blockedDates: (prev.blockedDates || []).filter(d => d !== dateStr)
      };
    });
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
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.nameRu && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 font-medium">
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">RU</span>
                        {s.nameRu}
                      </span>
                    )}
                    {s.nameEn && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-white/5 font-medium">
                        <span className="text-[9px] font-bold text-slate-400">EN</span>
                        {s.nameEn}
                      </span>
                    )}
                  </div>

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Qiymət</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {s.price} ₼
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rezervasiya Aralığı</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>{formatDuration(s.duration)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description if present */}
                  {s.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {s.description}
                    </p>
                  )}

                  {/* Schedule & Working Days Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 mb-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Həftəlik rejim:</span>
                      </span>
                      {s.blockedDays && s.blockedDays.length > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                          <Ban className="w-3 h-3 shrink-0" />
                          <span>Qapalı: {s.blockedDays.map(d => WEEKDAYS.find(w => w.day === d)?.short).join(', ')}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Hər gün açıq</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Açıq saatlar:</span>
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {s.workStartTime || '09:00'} - {s.workEndTime || '21:00'}
                      </span>
                    </div>

                    {s.blockedDates && s.blockedDates.length > 0 && (
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold pt-1 border-t border-slate-200/50 dark:border-white/5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{s.blockedDates.length} xüsusi tarix bloklanıb ({s.blockedDates.slice(0, 2).join(', ')}{s.blockedDates.length > 2 ? '...' : ''})</span>
                      </div>
                    )}
                  </div>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (Azərbaycanca) *</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇦🇿 AZ</span>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (Rusca - Название услуги)</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇷🇺 RU</span>
                </label>
                <input
                  type="text"
                  placeholder="Məs: Классическая стрижка или Осмотр стоматолога"
                  value={newService.nameRu}
                  onChange={(e) => setNewService({ ...newService, nameRu: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (İngiliscə - Service name)</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇬🇧 EN</span>
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

                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Müddət / Aralıq *
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDuration(newService.duration)}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    placeholder="Məs: 30, 60, 120"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setNewService({ ...newService, duration: p.value })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          newService.duration === p.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
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

              {/* Working Days & Schedule Blocking */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>İş Günləri və Təqvimdə Bloklama</span>
                    </h4>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      Qırmızı = Qapalı (Seçmək olmur)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Müştərilərin təqvimində qırmızı rəngdə görünəcək və seçilməsi qadağan olacaq günləri seçin. Yalnız açıq günlər və saatlar rezervasiyaya icazə verəcək.
                  </p>
                </div>

                {/* Həftəlik Günlər Togglları */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Həftənin Günləri (Bloklamaq üçün klikləyin):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {WEEKDAYS.map((w) => {
                      const isBlocked = (newService.blockedDays || []).includes(w.day);
                      return (
                        <button
                          key={w.day}
                          type="button"
                          onClick={() => toggleNewBlockedDay(w.day)}
                          className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                            isBlocked
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-sm'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{w.short}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                            isBlocked ? 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                          }`}>
                            {isBlocked ? <Ban className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                            <span>{isBlocked ? 'Qapalı' : 'Açıq'}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* İş Saatları Aralığı */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>İş Başlama Saatı</span>
                    </label>
                    <input
                      type="time"
                      value={newService.workStartTime || '09:00'}
                      onChange={(e) => setNewService({ ...newService, workStartTime: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>İş Bitmə Saatı</span>
                    </label>
                    <input
                      type="time"
                      value={newService.workEndTime || '21:00'}
                      onChange={(e) => setNewService({ ...newService, workEndTime: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Xüsusi Bloklanmış Tarixlər */}
                <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Konkret Qeyri-İş Tarixlərini Blokla (Bayramlar, təmir və s.):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={newBlockedDateInput}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewBlockedDateInput(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addNewBlockedDate}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      + Tarixi Blokla
                    </button>
                  </div>
                  {newService.blockedDates && newService.blockedDates.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {newService.blockedDates.map(dateStr => (
                        <span
                          key={dateStr}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        >
                          <span>{dateStr}</span>
                          <button
                            type="button"
                            onClick={() => removeNewBlockedDate(dateStr)}
                            className="text-rose-600 hover:text-rose-900 dark:hover:text-white ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (Azərbaycanca) *</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇦🇿 AZ</span>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (Rusca - Название услуги)</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇷🇺 RU</span>
                </label>
                <input
                  type="text"
                  placeholder="Məs: Классическая стрижка"
                  value={editingService.nameRu || ''}
                  onChange={(e) => setEditingService({ ...editingService, nameRu: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Xidmətin Adı (İngiliscə - Service name)</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">🇬🇧 EN</span>
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

                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Müddət / Aralıq *
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDuration(editingService.duration)}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    placeholder="Məs: 30, 60, 120"
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setEditingService({ ...editingService, duration: p.value })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          editingService.duration === p.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
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

              {/* Working Days & Schedule Blocking */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>İş Günləri və Təqvimdə Bloklama</span>
                    </h4>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      Qırmızı = Qapalı (Seçmək olmur)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Müştərilərin təqvimində qırmızı rəngdə görünəcək və seçilməsi qadağan olacaq günləri seçin. Yalnız açıq günlər və saatlar rezervasiyaya icazə verəcək.
                  </p>
                </div>

                {/* Həftəlik Günlər Togglları */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Həftənin Günləri (Bloklamaq üçün klikləyin):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {WEEKDAYS.map((w) => {
                      const isBlocked = (editingService.blockedDays || []).includes(w.day);
                      return (
                        <button
                          key={w.day}
                          type="button"
                          onClick={() => toggleEditBlockedDay(w.day)}
                          className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                            isBlocked
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-sm'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{w.short}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                            isBlocked ? 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                          }`}>
                            {isBlocked ? <Ban className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                            <span>{isBlocked ? 'Qapalı' : 'Açıq'}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* İş Saatları Aralığı */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>İş Başlama Saatı</span>
                    </label>
                    <input
                      type="time"
                      value={editingService.workStartTime || '09:00'}
                      onChange={(e) => setEditingService({ ...editingService, workStartTime: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>İş Bitmə Saatı</span>
                    </label>
                    <input
                      type="time"
                      value={editingService.workEndTime || '21:00'}
                      onChange={(e) => setEditingService({ ...editingService, workEndTime: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Xüsusi Bloklanmış Tarixlər */}
                <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Konkret Qeyri-İş Tarixlərini Blokla (Bayramlar, təmir və s.):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editBlockedDateInput}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditBlockedDateInput(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addEditBlockedDate}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      + Tarixi Blokla
                    </button>
                  </div>
                  {editingService.blockedDates && editingService.blockedDates.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {editingService.blockedDates.map(dateStr => (
                        <span
                          key={dateStr}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        >
                          <span>{dateStr}</span>
                          <button
                            type="button"
                            onClick={() => removeEditBlockedDate(dateStr)}
                            className="text-rose-600 hover:text-rose-900 dark:hover:text-white ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
