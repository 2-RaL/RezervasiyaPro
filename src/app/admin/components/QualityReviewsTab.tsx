'use client';

import React, { useState } from 'react';
import { 
  Star, 
  Download, 
  Search, 
  Trash2, 
  Building2, 
  Calendar, 
  ThumbsUp, 
  MessageSquare,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CustomerReview, Tenant, User } from '../../../lib/types';

interface QualityReviewsTabProps {
  reviews: CustomerReview[];
  tenants: Tenant[];
  currentUser: User | null;
  onDeleteReview: (id: string) => void;
  showToast: (msg: string) => void;
}

export default function QualityReviewsTab({
  reviews,
  tenants,
  currentUser,
  onDeleteReview,
  showToast
}: QualityReviewsTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Filters
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    // Super admin can filter by tenant; company admin only sees own tenant
    if (isSuperAdmin) {
      if (selectedTenantFilter !== 'all' && r.tenantId !== selectedTenantFilter) {
        return false;
      }
    } else {
      if (currentUser?.tenantId && r.tenantId !== currentUser.tenantId) {
        return false;
      }
    }

    if (selectedStarFilter !== 'all' && r.rating !== Number(selectedStarFilter)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName?.toLowerCase().includes(q);
      const matchPhone = r.customerPhone?.toLowerCase().includes(q);
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchService = r.serviceName?.toLowerCase().includes(q);
      const matchTenant = r.tenantName?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchComment && !matchService && !matchTenant) {
        return false;
      }
    }

    return true;
  });

  // Calculate KPIs
  const totalCount = filteredReviews.length;
  const avgRating = totalCount > 0 
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const fiveStarCount = filteredReviews.filter(r => r.rating === 5).length;
  const fourStarCount = filteredReviews.filter(r => r.rating === 4).length;
  const satisfactionRate = totalCount > 0 
    ? Math.round(((fiveStarCount + fourStarCount) / totalCount) * 100)
    : 100;

  // Export to Excel (CSV with UTF-8 BOM for Windows Excel compatibility)
  const handleExportExcel = () => {
    if (filteredReviews.length === 0) {
      alert('Endirmək üçün heç bir rəy tapılmadı.');
      return;
    }

    const headers = [
      'ID', 
      'Tarix', 
      'Müəssisə / Filial', 
      'Müştəri Adı', 
      'Əlaqə Nömrəsi', 
      'Xidmət', 
      'Reytinq (Ulduz)', 
      'Müştərinin Rəyi'
    ];

    const rows = filteredReviews.map(r => [
      `"${r.id}"`,
      `"${new Date(r.createdAt).toLocaleString('az-AZ', { hour12: false })}"`,
      `"${(r.tenantName || '').replace(/"/g, '""')}"`,
      `"${(r.customerName || '').replace(/"/g, '""')}"`,
      `"${(r.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(r.serviceName || 'Ümumi').replace(/"/g, '""')}"`,
      `"${r.rating} / 5"`,
      `"${(r.comment || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileTenantName = isSuperAdmin && selectedTenantFilter !== 'all' 
      ? tenants.find(t => t.id === selectedTenantFilter)?.name || 'Filial'
      : (currentUser?.tenantName || 'Butun_Filiallar');
    link.setAttribute('download', `Xidmet_Keyfiyyeti_Reyler_${fileTenantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel (CSV) faylı uğurla endirildi');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Xidmət Keyfiyyəti & Müştəri Rəyləri</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isSuperAdmin ? 'Bütün Müəssisələr Üzrə Xidmət Reytinqi' : 'Şirkətinizin Xidmət Keyfiyyəti və Rəyləri'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Müştərilərin rezervasiya səhifəsində verdikləri ulduzlar və şərhlər. Məlumatları təhlil edin və Excel formatında endirin.
          </p>
        </div>

        {/* Excel Download Button */}
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel (CSV) Endir</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Average Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Orta Reytinq</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{avgRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= Math.round(Number(avgRating)) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Ümumi Rəylər</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Aktiv qeydiyyatdan keçən rəylər
          </p>
        </div>

        {/* KPI 3: Satisfaction Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Məmnuniyyət</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {satisfactionRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            4 və 5 ulduz verən müştərilər
          </p>
        </div>

        {/* KPI 4: 5 Star Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">5 Ulduzlu</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {fiveStarCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Tam mükəmməl qiymətləndirmə
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Müştəri adı, nömrə, xidmət və ya rəy mətni ilə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Super Admin: Tenant Filter */}
        {isSuperAdmin && (
          <div className="w-full md:w-auto">
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Müəssisələr ({tenants.length})</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stars Filter */}
        <div className="w-full md:w-auto">
          <select
            value={selectedStarFilter}
            onChange={(e) => setSelectedStarFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Bütün Ulduzlar</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Ulduz</option>
            <option value="4">⭐⭐⭐⭐ 4 Ulduz</option>
            <option value="3">⭐⭐⭐ 3 Ulduz</option>
            <option value="2">⭐⭐ 2 Ulduz</option>
            <option value="1">⭐ 1 Ulduz</option>
          </select>
        </div>

      </div>

      {/* Quick Star Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setSelectedStarFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedStarFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          <span>Hamısı</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            selectedStarFilter === 'all' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
          }`}>
            {reviews.length}
          </span>
        </button>

        {[5, 4, 3, 2, 1].map(st => {
          const count = reviews.filter(r => r.rating === st).length;
          const isActive = selectedStarFilter === String(st);
          return (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStarFilter(String(st))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300 dark:ring-amber-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
              <span>{st}</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Heç bir rəy tapılmadı</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Müvafiq filtrlər üzrə hələlik rəy qeydə alınmayıb və ya müştərilər bu şirkətə rəy bildirməyib.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-all hover:border-amber-400/50 flex flex-col justify-between"
            >
              <div>
                {/* Header row with customer & rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {rev.customerName}
                      </h4>
                      {rev.customerPhone && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {rev.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars Badge */}
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3 h-3 ${
                            st <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Company & Service Info */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {isSuperAdmin && rev.tenantName && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{rev.tenantName}</span>
                    </span>
                  )}
                  {rev.serviceName && (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {rev.serviceName}
                    </span>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/5 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer with Date & Delete */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(rev.createdAt).toLocaleString('az-AZ', { hour12: false })}</span>
                </span>

                <button
                  onClick={() => onDeleteReview(rev.id)}
                  title="Rəyi Sil"
                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
