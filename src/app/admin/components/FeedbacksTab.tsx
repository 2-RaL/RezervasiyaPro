'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Send, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  User, 
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  HelpCircle,
  XCircle,
  Edit2
} from 'lucide-react';
import { FeedbackSuggestion, FeedbackStatus, FeedbackType, FeedbackPriority, Tenant, User as AppUser } from '../../../lib/types';

interface FeedbacksTabProps {
  feedbacks: FeedbackSuggestion[];
  tenants: Tenant[];
  currentUser: AppUser | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export default function FeedbacksTab({
  feedbacks,
  tenants,
  currentUser,
  onRefresh,
  showToast
}: FeedbacksTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New feedback form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('IMPROVEMENT');
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');

  // Editing Admin Note
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState<string>('');

  // Submit Feedback
  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Zəhmət olmasa mövzu və təklif mətnini qeyd edin.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          type,
          priority
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Təklifiniz Super Adminə uğurla göndərildi');
        setIsModalOpen(false);
        setSubject('');
        setMessage('');
        setType('IMPROVEMENT');
        setPriority('MEDIUM');
        onRefresh();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch {
      alert('Təklif göndərilmədi');
    } finally {
      setSubmitting(false);
    }
  };

  // Super Admin: Update Status or Admin Note
  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus, note?: string) => {
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, adminNote: note })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status yeniləndi');
        setEditingNoteId(null);
        onRefresh();
      } else {
        alert(data.error || 'Yenilənmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Delete Feedback
  const handleDelete = async (id: string) => {
    if (!confirm('Bu təklifi silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/feedbacks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Təklif silindi');
        onRefresh();
      }
    } catch {
      alert('Silinmədi');
    }
  };

  // Filtered List
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (isSuperAdmin && tenantFilter !== 'all' && f.tenantId !== tenantFilter) {
      return false;
    }
    if (statusFilter !== 'all' && f.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Gözləmədə</span>
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3 h-3" />
            <span>Baxılır</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Həll Edildi</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Rədd Edildi</span>
          </span>
        );
    }
  };

  const getTypeBadge = (t: FeedbackType) => {
    switch (t) {
      case 'FEATURE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">✨ Yeni Funksiya</span>;
      case 'IMPROVEMENT':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">💡 Təkmilləşdirmə</span>;
      case 'BUG':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">🐞 Xəta / Bug</span>;
      case 'COMPLAINT':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">⚠️ Şikayət</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">📌 Ümumi Təklif</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Rəy & Təklif Sistemi</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isSuperAdmin ? 'Filial və İstifadəçilərdən Gələn Təkliflər' : 'Super Adminə Rəy və Təklif Bildirişi'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {isSuperAdmin
              ? 'Şirkət adminləri və redaktorların sistemin inkişafı, xətalar və ya ehtiyaclar barədə göndərdiyi müraciətlər.'
              : 'Sistemdə görmək istədiyiniz yeni funksiyaları, qarşılaşdığınız çətinlikləri və təkliflərinizi birbaşa Super Adminə bildirin.'}
          </p>
        </div>

        {/* Action Button: Create Feedback */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isSuperAdmin ? 'Yeni Sistem Qeydi Yaz' : 'Super Adminə Təklif Göndər'}</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Ümumi Müraciət</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{feedbacks.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-amber-500">Gözləmədə</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {feedbacks.filter(f => f.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-blue-500">Baxılır</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {feedbacks.filter(f => f.status === 'IN_REVIEW').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-emerald-500">Həll Edildi</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {feedbacks.filter(f => f.status === 'RESOLVED').length}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        
        {isSuperAdmin && (
          <div className="w-full sm:w-auto">
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Bütün Filiallar ({tenants.length})</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Bütün Statuslar</option>
            <option value="PENDING">Gözləmədə Olanlar</option>
            <option value="IN_REVIEW">Baxılmaqda Olanlar</option>
            <option value="RESOLVED">Həll Edilmişlər</option>
            <option value="REJECTED">Rədd Edilmişlər</option>
          </select>
        </div>

      </div>

      {/* Feedbacks Grid */}
      {filteredFeedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
          <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Heç bir təklif və ya rəy tapılmadı</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {isSuperAdmin
              ? 'Filiallardan hələlik yeni rəy daxil olmayıb.'
              : 'Sistem üçün təklif və ya rəyiniz varsa, yuxarıdakı düymə ilə Super Adminə bildirin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm transition-all hover:border-indigo-400/50"
            >
              {/* Header row: Subject, Badges & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(item.type)}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.subject}
                  </h3>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              {/* Submitter & Tenant details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{item.tenantName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.userName} ({item.userRole})</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleString('az-AZ', { hour12: false })}</span>
                </span>
              </div>

              {/* Message content */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                {item.message}
              </p>

              {/* Super Admin Reply Card if exists */}
              {item.adminNote && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Super Adminin Cavabı / Qeydi:</span>
                  </div>
                  <p className="text-emerald-900 dark:text-emerald-200">{item.adminNote}</p>
                </div>
              )}

              {/* Super Admin Control Actions */}
              {isSuperAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Statusu dəyiş:</span>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'IN_REVIEW')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      Baxılır
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                    >
                      Həll Edildi
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                    >
                      Rədd Et
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setAdminNoteText(item.adminNote || '');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{item.adminNote ? 'Cavabı Dəyiş' : 'Cavab Yaz'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Təklifi Sil"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Admin Note Inline Editor for Super Admin */}
              {isSuperAdmin && editingNoteId === item.id && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Filiala Göndəriləcək Rəsmi Cavab Qeydi:
                  </label>
                  <textarea
                    rows={2}
                    value={adminNoteText}
                    onChange={(e) => setAdminNoteText(e.target.value)}
                    placeholder="Məs: Təklif qəbul edildi, növbəti versiyada əlavə olunacaq..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Ləğv et
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, item.status, adminNoteText)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Cavabı Yadda Saxla
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Feedback */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isSuperAdmin ? 'Yeni Sistem Qeydi' : 'Super Adminə Rəy / Təklif Göndər'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Təklifiniz birbaşa mərkəzi inzibatçıya ötürüləcək
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Təklifin Mövzusu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Məs: SMS xatırlatma xidməti, Qəbz çapı..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Müraciət Növü
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IMPROVEMENT">💡 Təkmilləşdirmə</option>
                    <option value="FEATURE">✨ Yeni Funksiya</option>
                    <option value="BUG">🐞 Xəta / Bug</option>
                    <option value="COMPLAINT">⚠️ Şikayət</option>
                    <option value="OTHER">📌 Digər</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Prioritet
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Aşağı</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksək / Təcili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Təklifin Ətraflı İzahı *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="İstədiyiniz funksiyanı, nə üçün lazım olduğunu və ya rastlaşdığınız problemi ətraflı qeyd edin..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Göndərilir...' : 'Təklifi Göndər'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
