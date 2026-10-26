'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  Building2,
  RefreshCw,
  PlusCircle,
  Trash2,
  Edit,
  UserX,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ActivityLog, UserRole } from '../../../lib/types';

interface ActivityLogsTabProps {
  currentUser: { id: string; fullName: string; role: UserRole; tenantId?: string | null } | null;
  isSuperAdmin: boolean;
  onDataRefresh: () => void;
  showToast: (msg: string) => void;
}

export default function ActivityLogsTab({
  currentUser,
  isSuperAdmin,
  onDataRefresh,
  showToast
}: ActivityLogsTabProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reverted'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/activity-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Activity logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Revert Action
  const handleRevert = async (log: ActivityLog) => {
    const confirmMsg = `Diqqət: "${log.description}" əməliyyatını ləğv edib əvvəlki vəziyyətinə qaytarmaq istəyirsiniz?\n\n(Məsələn: silinmiş xidmət və ya mütəxəssis təkrar bazaya bərpa olunacaq)`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setRevertingId(log.id);
      const res = await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revert', logId: log.id })
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || 'Əməliyyat uğurla geri qaytarıldı!');
        await fetchLogs();
        onDataRefresh(); // Refresh services, staff, bookings across admin
      } else {
        alert(data.error || 'Geri qaytarmaq mümkün olmadı');
      }
    } catch {
      alert('Əməliyyat zamanı xəta baş verdi');
    } finally {
      setRevertingId(null);
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDesc = log.description.toLowerCase().includes(term);
      const matchUser = log.userName.toLowerCase().includes(term);
      const matchEntity = log.entityName.toLowerCase().includes(term);
      if (!matchDesc && !matchUser && !matchEntity) return false;
    }

    // Action filter
    if (actionFilter !== 'all') {
      if (actionFilter === 'SERVICE' && !log.actionType.startsWith('SERVICE')) return false;
      if (actionFilter === 'STAFF' && !log.actionType.startsWith('STAFF')) return false;
      if (actionFilter === 'BOOKING' && !log.actionType.startsWith('BOOKING')) return false;
      if (actionFilter === 'CUSTOMER' && !log.actionType.startsWith('CUSTOMER')) return false;
      if (actionFilter === 'TENANT' && !log.actionType.startsWith('TENANT')) return false;
      if (actionFilter === 'USER' && !log.actionType.startsWith('USER')) return false;
      if (actionFilter === 'PATIENT' && !log.actionType.startsWith('PATIENT')) return false;
    }

    // Role filter
    if (roleFilter !== 'all' && log.userRole !== roleFilter) return false;

    // Status filter
    if (statusFilter === 'active' && log.isReverted) return false;
    if (statusFilter === 'reverted' && !log.isReverted) return false;

    return true;
  });

  const getActionBadge = (type: string) => {
    if (type.endsWith('_CREATE')) {
      return {
        label: 'Əlavə Edildi',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        icon: PlusCircle
      };
    }
    if (type.endsWith('_DELETE')) {
      return {
        label: 'Silindi',
        bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        icon: Trash2
      };
    }
    if (type.endsWith('_UPDATE')) {
      return {
        label: 'Redaktə Edildi',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        icon: Edit
      };
    }
    if (type.endsWith('_CANCEL')) {
      return {
        label: 'Ləğv Edildi',
        bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        icon: XCircle
      };
    }
    if (type.includes('BLOCK')) {
      return {
        label: 'Bloklandı',
        bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300',
        icon: UserX
      };
    }
    return {
      label: 'Əməliyyat',
      bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200',
      icon: FileText
    };
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
      case 'ADMIN':
        return { label: 'Şirkət Admini', bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' };
      case 'EDITOR':
        return { label: 'Redaktor', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'USER':
        return { label: 'Müştəri (Onlayn)', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const canRevert = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── BAŞLIQ VƏ FƏALİYYƏT CƏDVƏLİ İCMALI ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Fəaliyyət Cədvəli və Audit Jurnalı
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin və Redaktorların sistemdə etdiyi bütün dəyişikliklər və bir kliklə geri qaytarma (Undo)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenilə</span>
          </button>
        </div>
      </div>

      {/* ─── AXTARIŞ VƏ FİLTER PANELİ ─── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Axtarış */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Əməliyyat, istifadəçi və ya obyekt adını axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Obyekt filteri */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Əməliyyatlar</option>
              <option value="SERVICE">Xidmətlər (Yaratma, Silmə, Redaktə)</option>
              <option value="STAFF">Mütəxəssislər (Yaratma, Silmə, Redaktə)</option>
              <option value="BOOKING">Rezervasiyalar (Status, Ləğv, Silmə)</option>
              <option value="CUSTOMER">Müştəri Bloku (Qara siyahı)</option>
              <option value="TENANT">Şirkət Rekvizitləri & Parametrlər</option>
              <option value="USER">İstifadəçilər və Redaktorlar</option>
              <option value="PATIENT">Tibbi Qeydiyyat & Diaqnozlar</option>
            </select>
          </div>

          {/* Rol filteri */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Rollar</option>
              <option value="SUPER_ADMIN">Yalnız Super Adminlər</option>
              <option value="ADMIN">Yalnız Şirkət Adminləri</option>
              <option value="EDITOR">Yalnız Redaktorlar</option>
            </select>
          </div>
        </div>

        {/* Status Tabları: Hamısı / Aktiv / Geri Qaytarılmış */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Vəziyyət:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Hamısı ({logs.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Aktiv Əməliyyatlar ({logs.filter(l => !l.isReverted).length})
          </button>
          <button
            onClick={() => setStatusFilter('reverted')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              statusFilter === 'reverted'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Geri Qaytarılmış ({logs.filter(l => l.isReverted).length})
          </button>
        </div>
      </div>

      {/* ─── FƏALİYYƏT CƏDVƏLİ SİYAHISI ─── */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span>Fəaliyyət qeydləri yüklənir...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">Heç bir fəaliyyət qeydi yoxdur</div>
            <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 text-[11px]">
              Sistemdə yeni xidmət, mütəxəssis, rezervasiya əlavə edildikdə və ya redaktə edildikdə bütün fəaliyyətlər avtomatik burada canlı qeydə alınacaq və admin tərəfindən bir kliklə geri qaytarıla biləcək.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const badge = getActionBadge(log.actionType);
            const roleBadge = getRoleBadge(log.userRole);
            const Icon = badge.icon;
            const isExpanded = expandedLogId === log.id;
            const hasSnapshots = Boolean(log.snapshotBefore || log.snapshotAfter);

            return (
              <div
                key={log.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  log.isReverted
                    ? 'border-slate-200 dark:border-white/5 opacity-80 bg-slate-50/60 dark:bg-slate-900/40'
                    : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/40 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Əməliyyat ikonası */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      {/* Təsvir */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {log.description}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Kim, nə vaxt və hansı filialda */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {log.userName}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleBadge.bg}`}>
                          {roleBadge.label}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString('az-AZ')}
                        </span>
                        {log.tenantName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {log.tenantName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status və Geri Qaytarma Düyməsi */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {hasSnapshots && (
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors"
                      >
                        <span>Detallar</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    {log.isReverted ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-white/5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Geri Qaytarılıb</span>
                      </span>
                    ) : (
                      canRevert && (
                        <button
                          type="button"
                          disabled={revertingId === log.id}
                          onClick={() => handleRevert(log)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-500 text-xs font-bold border border-rose-200 dark:border-rose-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          title="Bu əməliyyatı ləğv et və silinmiş/dəyişmiş məlumatı bərpa et"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${revertingId === log.id ? 'animate-spin' : ''}`} />
                          <span>Geri Qaytar (Ləğv Et)</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Genişləndirilmiş Məlumat Paneli (Snapshot Before / After) */}
                {isExpanded && hasSnapshots && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Əməliyyatın İlkin və Son Vəziyyəti:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      {log.snapshotBefore && (
                        <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
                          <span className="text-rose-600 dark:text-rose-400 font-bold block mb-1">
                            Əvvəlki halı (Bərpa ediləcək məlumat):
                          </span>
                          <pre className="text-[10px] whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">
                            {JSON.stringify(log.snapshotBefore, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.snapshotAfter && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                            Sonrakı halı:
                          </span>
                          <pre className="text-[10px] whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">
                            {JSON.stringify(log.snapshotAfter, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
