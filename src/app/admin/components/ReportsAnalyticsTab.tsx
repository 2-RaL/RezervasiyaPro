'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  DollarSign,
  Star,
  Clock,
  Download,
  Printer,
  Filter,
  Building2,
  Award,
  ThumbsUp,
  Flame,
  Users,
  ChevronDown
} from 'lucide-react';
import { Booking, Service, Staff, CustomerReview, Tenant, User } from '../../../lib/types';
import { exportBookingsToCSV, printBookingsReport } from '../../../lib/exportUtils';

interface ReportsAnalyticsTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  reviews: CustomerReview[];
  tenants: Tenant[];
  isSuperAdmin: boolean;
  currentUser: User | null;
  selectedTenantId: string;
  onSelectTenantId?: (id: string) => void;
}

export default function ReportsAnalyticsTab({
  bookings,
  services,
  staff,
  reviews,
  tenants,
  isSuperAdmin,
  currentUser,
  selectedTenantId,
  onSelectTenantId
}: ReportsAnalyticsTabProps) {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | '30days' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter bookings based on period, tenant, and status
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Tenant filter for Super Admin
    if (isSuperAdmin && selectedTenantId && selectedTenantId !== 'all') {
      list = list.filter(b => b.tenantId === selectedTenantId);
    } else if (!isSuperAdmin && currentUser?.tenantId) {
      list = list.filter(b => b.tenantId === currentUser.tenantId);
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter);
    }

    // Period filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (period === 'today') {
      list = list.filter(b => b.date === todayStr);
    } else if (period === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      const past7Str = past7.toISOString().split('T')[0];
      list = list.filter(b => b.date >= past7Str);
    } else if (period === 'month') {
      const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
      list = list.filter(b => b.date.startsWith(currentYearMonth));
    } else if (period === '30days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      const past30Str = past30.toISOString().split('T')[0];
      list = list.filter(b => b.date >= past30Str);
    }

    return list;
  }, [bookings, period, statusFilter, selectedTenantId, isSuperAdmin, currentUser]);

  // Filter reviews based on tenant
  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (isSuperAdmin && selectedTenantId && selectedTenantId !== 'all') {
      list = list.filter(r => r.tenantId === selectedTenantId);
    } else if (!isSuperAdmin && currentUser?.tenantId) {
      list = list.filter(r => r.tenantId === currentUser.tenantId);
    }
    return list;
  }, [reviews, selectedTenantId, isSuperAdmin, currentUser]);

  // KPI Calculations
  const totalCount = filteredBookings.length;
  const completedCount = filteredBookings.filter(b => b.status === 'COMPLETED').length;
  const confirmedCount = filteredBookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledCount = filteredBookings.filter(b => b.status === 'CANCELLED').length;
  const noShowCount = filteredBookings.filter(b => b.status === 'NO_SHOW').length;
  const blockedCount = filteredBookings.filter(b => b.isBlocked).length;

  const completedPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const cancelledPct = totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;
  const noShowPct = totalCount > 0 ? Math.round((noShowCount / totalCount) * 100) : 0;

  const totalRevenue = filteredBookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (Number(b.servicePrice) || 0), 0);

  // Review & Satisfaction Analytics
  const reviewCount = filteredReviews.length;
  const avgRating = reviewCount > 0
    ? (filteredReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviewCount).toFixed(1)
    : '5.0';

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach(r => {
      const val = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))) as 1 | 2 | 3 | 4 | 5;
      counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
  }, [filteredReviews]);

  const positivePct = reviewCount > 0
    ? Math.round(((starCounts[5] + starCounts[4]) / reviewCount) * 100)
    : 100;

  // Services Ranking
  const serviceStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; revenue: number }>();
    filteredBookings.forEach(b => {
      const key = b.serviceId || b.serviceName || 'Xidmət';
      const name = b.serviceName || 'Ümumi Xidmət';
      const existing = map.get(key) || { id: key, name, count: 0, revenue: 0 };
      existing.count += 1;
      if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
        existing.revenue += Number(b.servicePrice) || 0;
      }
      map.set(key, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  // Staff Ranking
  const staffStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; completed: number; revenue: number }>();
    filteredBookings.forEach(b => {
      const key = b.staffId || b.staffName || 'İşçi';
      const name = b.staffName || 'Təyin edilməyib';
      const existing = map.get(key) || { id: key, name, count: 0, completed: 0, revenue: 0 };
      existing.count += 1;
      if (b.status === 'COMPLETED') {
        existing.completed += 1;
        existing.revenue += Number(b.servicePrice) || 0;
      } else if (b.status === 'CONFIRMED') {
        existing.revenue += Number(b.servicePrice) || 0;
      }
      map.set(key, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  // Hourly Peak Heatmap (09:00 - 21:00)
  const hourlyStats = useMemo(() => {
    const hours: { hour: string; count: number; pct: number }[] = [];
    for (let h = 9; h <= 21; h++) {
      const hStr = h < 10 ? `0${h}` : `${h}`;
      hours.push({ hour: `${hStr}:00`, count: 0, pct: 0 });
    }

    filteredBookings.forEach(b => {
      if (b.timeSlot) {
        const hPart = b.timeSlot.split(':')[0];
        const match = hours.find(item => item.hour.startsWith(hPart));
        if (match) match.count += 1;
      }
    });

    const maxCount = Math.max(...hours.map(h => h.count), 1);
    hours.forEach(h => {
      h.pct = Math.round((h.count / maxCount) * 100);
    });

    return hours;
  }, [filteredBookings]);

  // Trend Dynamics by Day (Last 7 distinct dates or recent)
  const trendDays = useMemo(() => {
    const map = new Map<string, { date: string; completed: number; cancelled: number; total: number }>();
    filteredBookings.forEach(b => {
      if (b.date) {
        const item = map.get(b.date) || { date: b.date, completed: 0, cancelled: 0, total: 0 };
        item.total += 1;
        if (b.status === 'COMPLETED') item.completed += 1;
        if (b.status === 'CANCELLED') item.cancelled += 1;
        map.set(b.date, item);
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-10); // last 10 dates with bookings
  }, [filteredBookings]);

  const maxTrendTotal = Math.max(...trendDays.map(t => t.total), 1);

  // Period label for printing and titles
  const periodLabel = {
    today: 'Bu gün',
    '7days': 'Son 7 gün',
    month: 'Bu ay',
    '30days': 'Son 30 gün',
    all: 'Bütün dövr'
  }[period];

  const currentTenantObj = tenants.find(t => t.id === selectedTenantId);
  const reportTenantName = isSuperAdmin
    ? (selectedTenantId === 'all' ? 'Bütün Filiallar' : (currentTenantObj?.name || 'Filial'))
    : (tenants.find(t => t.id === currentUser?.tenantId)?.name || 'Şirkətimiz');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── HESABATLARIN İDARƏETMƏ PANELİ VƏ ENDİRMƏ DÜYMƏLƏRİ ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Rezervasiya və Hərəkətlənmə Hesabatı
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geniş analitika, müştəri məmnuniyyəti qrafiki, sıxlıq analizi və sənədləşmə
              </p>
            </div>
          </div>
        </div>

        {/* Filterlər və Endirmə Düymələri */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filial seçimi (Super Admin) */}
          {isSuperAdmin && onSelectTenantId && (
            <select
              value={selectedTenantId}
              onChange={(e) => onSelectTenantId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">🏢 Bütün Müəssisələr</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {/* Dövr Seçimi */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-white/10 text-xs">
            {(['today', '7days', 'month', 'all'] as const).map(pKey => (
              <button
                key={pKey}
                onClick={() => setPeriod(pKey)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  period === pKey
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {{
                  today: 'Bu gün',
                  '7days': '7 Gün',
                  month: 'Bu Ay',
                  all: 'Bütün'
                }[pKey]}
              </button>
            ))}
          </div>

          {/* EXCEL ENDİR DÜYMƏSİ */}
          <button
            onClick={() => exportBookingsToCSV(filteredBookings, `Rezervasiyalar_${period}_${new Date().toISOString().split('T')[0]}.csv`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            title="Excel (.csv) faylı kimi endir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.csv) Endir</span>
          </button>

          {/* PDF / ÇAP ET DÜYMƏSİ */}
          <button
            onClick={() => printBookingsReport(filteredBookings, {
              title: 'Rezervasiya və Hərəkətlənmə Rəsmi Hesabatı',
              tenantName: reportTenantName,
              dateRangeLabel: periodLabel
            })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            title="A4 formatında çap et və ya PDF kimi saxla"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF / Çap Et</span>
          </button>
        </div>
      </div>

      {/* ─── 8 ƏSAS KPI GÖSTƏRİCİ KARTLARI ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
        {/* Toplam Rezervasiya */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Toplam Rezervasiya</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">({periodLabel})</span>
          </div>
          <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Aktiv tələbat bölgüsü</span>
          </div>
        </div>

        {/* Gələnlər / Tamamlanmış */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Gələnlər (Uğurlu)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60">
              {completedPct}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Xidmət almış müştərilər</div>
        </div>

        {/* İmtina Edilənlər */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">İmtina Edilən</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{cancelledCount}</span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
              {cancelledPct}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Ləğv olunan sifarişlər</div>
        </div>

        {/* Gəlməyənlər (No-Show) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Gəlməyənlər (No-Show)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{noShowCount}</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
              {noShowPct}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Xəbərdarlıqsız gəlməyən</div>
        </div>

        {/* Bloklanan Müştərilər */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qara Siyahı (Blok)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{blockedCount}</span>
            <span className="text-[10px] font-semibold text-rose-500">məhdudlaşdırılıb</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">3 no-show və ya əl ilə blok</div>
        </div>

        {/* Faktiki Ümumi Gəlir */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Faktiki Gəlir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalRevenue}</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">AZN</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Tamamlanan və təsdiqli cəmi</div>
        </div>

        {/* Müştəri Məmnunluğu */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Keyfiyyət Reytinqi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{avgRating}</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">/ 5.0 ★</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{reviewCount} rəy əsasında ({positivePct}% razı)</div>
        </div>

        {/* Təsdiqlənmiş Gözləyən */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gözləyən Növbələr</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{confirmedCount}</span>
            <span className="text-[10px] font-semibold text-blue-500">təsdiqlənmiş</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Yaxın saatlar üçün aktiv</div>
        </div>
      </div>

      {/* ─── 2 ƏSAS ANALİTİK QRAFİK BÖLMƏSİ: MƏMNUNLUQ & DİNAMİKA ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. KEYFİYYƏT VƏ MƏMNUNLUQ QRAFİKİ */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xidmət Keyfiyyəti və Məmnunluq Qrafiki</h3>
                <p className="text-[11px] text-slate-500">Real müştərilərin xidmət sonrası verdiyi ulduz və rəylər</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {positivePct}% Müsbət Nəticə
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Böyük Reytinq Balı */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 w-full sm:w-40 shrink-0 text-center">
              <span className="text-4xl font-black text-amber-500">{avgRating}</span>
              <div className="flex gap-1 text-amber-500 my-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {reviewCount} Müştəri Rəyi
              </span>
              <span className="text-[10px] text-slate-400 mt-1">CSAT İndeksi: {positivePct}%</span>
            </div>

            {/* Ulduz Bölgüsü Progress Barları */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starCounts[stars as 1 | 2 | 3 | 4 | 5] || 0;
                const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : (stars === 5 ? 100 : 0);
                const barColor = {
                  5: 'bg-emerald-500',
                  4: 'bg-teal-500',
                  3: 'bg-amber-500',
                  2: 'bg-orange-500',
                  1: 'bg-rose-500'
                }[stars as 1 | 2 | 3 | 4 | 5];

                return (
                  <div key={stars} className="flex items-center gap-2.5 text-xs">
                    <span className="w-12 font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ən son rəylərdən qısa nümunələr */}
          {filteredReviews.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Son Müştəri Rəyləri:</span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {filteredReviews.slice(0, 3).map(r => (
                  <div key={r.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{r.customerName}: </span>
                      <span className="text-slate-600 dark:text-slate-400 italic">&ldquo;{r.comment}&rdquo;</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400 shrink-0">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. REZERVASİYA DİNAMİKASI VƏ GƏLƏNLƏR VS İMTİNALAR */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rezervasiya Dinamikası və Hərəkətlənmə</h3>
                <p className="text-[11px] text-slate-500">Tarixlər üzrə gələnlər və imtinalar nisbəti</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Gələnlər</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">İmtinalar</span>
              </div>
            </div>
          </div>

          {/* Tarixlər üzrə Dinamika Barları */}
          <div className="pt-2">
            {trendDays.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
                <CalendarCheck className="w-8 h-8 mb-2 opacity-40" />
                <span>Seçilmiş dövrdə qeydə alınmış rezervasiya hərəkəti yoxdur</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {trendDays.map(item => {
                  const compPct = Math.round((item.completed / maxTrendTotal) * 100);
                  const cancPct = Math.round((item.cancelled / maxTrendTotal) * 100);
                  const otherCount = Math.max(0, item.total - item.completed - item.cancelled);
                  const otherPct = Math.round((otherCount / maxTrendTotal) * 100);

                  return (
                    <div key={item.date} className="flex items-center gap-3 text-xs">
                      <span className="w-20 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        {item.date}
                      </span>
                      <div className="flex-1 h-4 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${compPct}%` }}
                          title={`Gələnlər: ${item.completed}`}
                        />
                        <div
                          className="h-full bg-rose-500 transition-all duration-300"
                          style={{ width: `${cancPct}%` }}
                          title={`İmtinalar: ${item.cancelled}`}
                        />
                        <div
                          className="h-full bg-indigo-400/60 transition-all duration-300"
                          style={{ width: `${otherPct}%` }}
                          title={`Gözləyən: ${otherCount}`}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 shrink-0">
                        {item.total} sifar.
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-indigo-800 dark:text-indigo-300 font-medium">Faktiki uğur dərəcəsi:</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-200 font-mono">
              {totalCount > 0 ? `${completedPct}% ziyarət reallaşdı` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3 ƏLAVƏ DERİN ANALİTİKA: PİK SAATLAR, XİDMƏT TƏLƏBATI, MÜTƏXƏSSİSLƏR ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Pik Saatlar və Günlük Yüklənmə (09:00 - 21:00) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Günün Pik Saatları
              </h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Sıxlıq Analizi
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Müştərilərin ən çox hansı saat aralıqlarında gəldiyini göstərir:
          </p>

          <div className="space-y-1.5 pt-1">
            {hourlyStats.map(h => (
              <div key={h.hour} className="flex items-center gap-2 text-[11px]">
                <span className="w-12 font-mono text-slate-600 dark:text-slate-400 font-semibold">{h.hour}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      h.pct >= 70 ? 'bg-rose-500' : h.pct >= 40 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(5, h.pct)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                  {h.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Xidmətlər və Tələbat */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Ən Çox Tələb Olunan Xidmətlər
              </h3>
            </div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">
              Top 5
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Müştərilər tərəfindən ən çox seçilən və gəlir gətirən xidmətlər:
          </p>

          <div className="space-y-2.5 pt-1">
            {serviceStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">Məlumat yoxdur</div>
            ) : (
              serviceStats.map((srv, idx) => {
                const srvPct = totalCount > 0 ? Math.round((srv.count / totalCount) * 100) : 0;
                return (
                  <div key={srv.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        #{idx + 1} {srv.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {srv.revenue} ₼
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${srvPct}%` }} />
                      </div>
                      <span className="font-mono text-slate-500">{srv.count} rezerv. ({srvPct}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Mütəxəssislərin Yüklənməsi və Fəaliyyəti */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mütəxəssislərin Yüklənməsi
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Heyət
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Hər bir işçinin qəbul etdiyi pasiyent və ya müştəri sayı:
          </p>

          <div className="space-y-2.5 pt-1">
            {staffStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">Məlumat yoxdur</div>
            ) : (
              staffStats.map((st, idx) => {
                const stPct = totalCount > 0 ? Math.round((st.count / totalCount) * 100) : 0;
                return (
                  <div key={st.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        #{idx + 1} {st.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {st.completed} tamamlandı
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stPct}%` }} />
                      </div>
                      <span className="font-mono text-slate-500">{st.count} nəfər ({stPct}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── STATUSLARIN BÖLGÜSÜ VƏ İCMAL CƏDVƏLİ ─── */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rezervasiya Statuslarının Ümumi Dağılımı ({totalCount} Rezervasiya)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-emerald-600 font-bold">● Gələnlər: {completedCount} ({completedPct}%)</span>
            <span className="text-indigo-600 font-bold">● Təsdiqli: {confirmedCount}</span>
            <span className="text-rose-600 font-bold">● İmtina: {cancelledCount} ({cancelledPct}%)</span>
            <span className="text-amber-600 font-bold">● Gəlməyən: {noShowCount} ({noShowPct}%)</span>
          </div>
        </div>

        {/* Qrafik Rəngli Zolaq */}
        <div className="h-5 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completedPct}%` }} title="Tamamlandı" />
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0}%` }} title="Təsdiqləndi" />
          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${cancelledPct}%` }} title="İmtina Edildi" />
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${noShowPct}%` }} title="Gəlmədi" />
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between pt-1">
          <span>* Rəsmi hesabat sənədləşməsi üçün yuxarıdakı <b>"Excel (.csv) Endir"</b> və ya <b>"PDF / Çap Et"</b> düymələrindən istifadə edin.</span>
          <span>Son yenilənmə: {new Date().toLocaleTimeString('az-AZ')}</span>
        </div>
      </div>
    </div>
  );
}
