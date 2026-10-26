'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  Key, 
  Hash, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  HelpCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { Tenant, User, WhatsAppLogItem } from '../../../lib/types';
import { DEFAULT_WHATSAPP_TEMPLATE } from '../../../lib/whatsapp';

interface WhatsAppManagementTabProps {
  tenants: Tenant[];
  currentUser: User | null;
  showToast: (msg: string) => void;
  onRefreshTenants: () => void;
}

export default function WhatsAppManagementTab({
  tenants,
  currentUser,
  showToast,
  onRefreshTenants
}: WhatsAppManagementTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Selected Tenant
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    currentUser?.tenantId || tenants[0]?.id || ''
  );

  // Loading & Submitting
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; waLink?: string } | null>(null);

  // Form State
  const [settings, setSettings] = useState({
    whatsapp: '',
    whatsappNotificationEnabled: true,
    whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
    whatsappProvider: 'DIRECT' as 'DIRECT' | 'META' | 'CUSTOM_GATEWAY',
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappWabaId: '',
    whatsappGatewayUrl: ''
  });

  // Logs state
  const [logs, setLogs] = useState<WhatsAppLogItem[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [testPhone, setTestPhone] = useState('+994 ');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch Settings & Logs
  const loadWhatsAppConfig = async (tenantId: string) => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/whatsapp?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success) {
        setSettings({
          whatsapp: data.settings.whatsapp || '',
          whatsappNotificationEnabled: data.settings.whatsappNotificationEnabled !== false,
          whatsappTemplate: data.settings.whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE,
          whatsappProvider: data.settings.whatsappProvider || (data.settings.whatsappPhoneNumberId ? 'META' : 'DIRECT'),
          whatsappPhoneNumberId: data.settings.whatsappPhoneNumberId || '',
          whatsappAccessToken: data.settings.whatsappAccessToken || '',
          whatsappWabaId: data.settings.whatsappWabaId || '',
          whatsappGatewayUrl: data.settings.whatsappGatewayUrl || ''
        });
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('WhatsApp config error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenantId) {
      loadWhatsAppConfig(selectedTenantId);
    }
  }, [selectedTenantId]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/whatsapp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          ...settings
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('WhatsApp tənzimləmələri uğurla yadda saxlanıldı');
        onRefreshTenants();
      } else {
        alert(data.error || 'Yadda saxlanılmadı');
      }
    } catch {
      alert('Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  // Send Test Message
  const handleSendTest = async () => {
    if (!testPhone.trim() || testPhone.trim() === '+994') {
      alert('Zəhmət olmasa test ediləcək mobil nömrəni daxil edin');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          action: 'test',
          phone: testPhone.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Test bildirişi uğurla çatdırıldı!',
          waLink: data.waLink
        });
        showToast('Test bildirişi uğurla həyata keçirildi');
        loadWhatsAppConfig(selectedTenantId);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Test göndərişi uğursuz oldu'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Xəta baş verdi'
      });
    } finally {
      setTesting(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!confirm('Bütün WhatsApp göndəriş tarixçəsini silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          action: 'clearLogs'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('WhatsApp mesaj tarixçəsi təmizləndi');
        setLogs([]);
      }
    } catch {
      alert('Silinmədi');
    }
  };

  // Insert Variable to Template
  const insertVariable = (varName: string) => {
    setSettings(prev => ({
      ...prev,
      whatsappTemplate: prev.whatsappTemplate + ' ' + varName
    }));
  };

  // Live preview text generator
  const currentTenant = tenants.find(t => t.id === selectedTenantId);
  const previewMessage = settings.whatsappTemplate
    .replace(/{tenantName}/g, currentTenant?.name || 'Gözəllik & Estetik Mərkəzi')
    .replace(/{customerName}/g, 'Aygün Əliyeva')
    .replace(/{date}/g, '2026-11-05')
    .replace(/{timeSlot}/g, '14:30')
    .replace(/{serviceName}/g, 'Klassik Saç Kəsimi')
    .replace(/{staffName}/g, 'Leyla Məmmədova');

  const filteredLogs = logs.filter(l => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      l.recipientPhone?.toLowerCase().includes(q) ||
      l.recipientName?.toLowerCase().includes(q) ||
      l.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── YUXARI BAŞLIQ KARTI ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Rəsmi WhatsApp Mesaj Mərkəzi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            WhatsApp Avtomatlaşdırma & API Paneli
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rezervasiya tamamlandıqda müştəriyə şirkətin öz WhatsApp nömrəsindən avtomatik təsdiq mesajlarının göndərilməsi və Meta Cloud API inteqrasiyası.
          </p>
        </div>

        {/* Super Admin üçün Şirkət Seçimi */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ─── STATUS İNDİKATORLARI ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Göndəriş Metodu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            {settings.whatsappProvider === 'META' ? <Globe className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Aktiv Rejim</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {settings.whatsappProvider === 'META'
                ? 'Meta Cloud API (Rəsmi)'
                : (settings.whatsappProvider === 'CUSTOM_GATEWAY' ? 'Fərdi Gateway' : 'Şirkət Nömrəsi (Direct)')}
            </h4>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {settings.whatsappProvider === 'META' ? 'Pərdəarxası birbaşa çatdırılma' : 'Birbaşa Click-to-Chat'}
            </span>
          </div>
        </div>

        {/* Card 2: Şirkət Nömrəsi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Şirkətin WhatsApp Nömrəsi</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {settings.whatsapp || 'Qeyd edilməyib'}
            </h4>
            <span className="text-[11px] text-slate-500">
              Müştəriyə görünən göndərən nömrə
            </span>
          </div>
        </div>

        {/* Card 3: Avtomatik Bildiriş Vəziyyəti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avtomatik Bildiriş</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {settings.whatsappNotificationEnabled ? '🟢 Aktivdir' : '🔴 Deaktivdir'}
            </h4>
            <span className="text-[11px] text-slate-500">
              Hər rezervasiyada dərhal göndərilmə
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, whatsappNotificationEnabled: !prev.whatsappNotificationEnabled }))}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
              settings.whatsappNotificationEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.whatsappNotificationEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </div>

      {/* ─── ƏSAS FORM: API VƏ ŞABLON TƏNZİMLƏMƏLƏRİ ─── */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sol Panel: Metod və API Girişləri (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-5">
          
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-500" />
                <span>Göndəriş Metodu & API Açarları</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Şirkətinizin WhatsApp sistemini necə işlədəcəyinizi seçin
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              3 Rejim Dəstəklənir
            </span>
          </div>

          {/* Rejim Seçimi Düymələri */}
          <div className="grid grid-cols-3 gap-2">
            
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, whatsappProvider: 'DIRECT' }))}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                settings.whatsappProvider === 'DIRECT'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold">1. Şirkət Nömrəsi</span>
              <span className="text-[9px] text-slate-500">API Tələb Olunmur</span>
            </button>

            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, whatsappProvider: 'META' }))}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                settings.whatsappProvider === 'META'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold">2. Meta Cloud API</span>
              <span className="text-[9px] text-slate-500">Avtomatik & Rəsmi</span>
            </button>

            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, whatsappProvider: 'CUSTOM_GATEWAY' }))}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                settings.whatsappProvider === 'CUSTOM_GATEWAY'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold">3. Fərdi Gateway</span>
              <span className="text-[9px] text-slate-500">UltraMsg / Webhook</span>
            </button>

          </div>

          {/* Sahə 1: Şirkətin WhatsApp Nömrəsi (Hər rejimdə lazımdır) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Şirkətin Rəsmi WhatsApp Nömrəsi *</span>
              <span className="text-[10px] text-slate-400">Məs: +994 50 123 45 67</span>
            </label>
            <input
              type="text"
              required
              placeholder="+994 50 123 45 67"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* REJİM 1 İZAHI: DIRECT CLICK TO CHAT */}
          {settings.whatsappProvider === 'DIRECT' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Sadə Şirkət Nömrəsi Rejimi Seçilib</span>
              </div>
              <p className="leading-relaxed">
                Bu rejimdə heç bir Meta API açarına ehtiyac yoxdur. Müştəri rezervasiyanı bitirdikdə sistem nömrənin WhatsApp-a uyğunluğunu yoxlayır, rəsmi təsdiq mesajını hazırlayır və müştəriyə şirkətinizin WhatsApp nömrəsi ilə 1 kliklə birbaşa əlaqə qurmağa imkan verir.
              </p>
            </div>
          )}

          {/* REJİM 2: META CLOUD API GİRİŞLƏRİ */}
          {settings.whatsappProvider === 'META' && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Meta WhatsApp Cloud API Parametrləri</span>
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  developers.facebook.com
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number ID (Meta Telefon ID-si) *
                </label>
                <input
                  type="text"
                  placeholder="Məs: 104598765432109"
                  value={settings.whatsappPhoneNumberId}
                  onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  System User Access Token (Daimi Giriş Açarı) *
                </label>
                <input
                  type="password"
                  placeholder="EAAG... (Meta daimi access token)"
                  value={settings.whatsappAccessToken}
                  onChange={(e) => setSettings({ ...settings, whatsappAccessToken: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Business Account ID (WABA ID - İstəyə bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Məs: 209876543210987"
                  value={settings.whatsappWabaId}
                  onChange={(e) => setSettings({ ...settings, whatsappWabaId: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">💡 Meta Cloud API necə işləyir?</span>
                <p>
                  Meta açarları daxil edildikdə sistem müştəri nömrəsinə serverdən birbaşa WhatsApp mesajı atır. Heç bir proqram açmağa ehtiyac qalmır.
                </p>
              </div>
            </div>
          )}

          {/* REJİM 3: CUSTOM GATEWAY */}
          {settings.whatsappProvider === 'CUSTOM_GATEWAY' && (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3.5">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Fərdi Gateway & Webhook Parametrləri</span>
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook / HTTP API Endpoint URL *
                </label>
                <input
                  type="url"
                  placeholder="https://api.ultramsg.com/instance123/messages/chat"
                  value={settings.whatsappGatewayUrl}
                  onChange={(e) => setSettings({ ...settings, whatsappGatewayUrl: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Saxla Düyməsi */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Yadda saxlanılır...' : 'Tənzimləmələri Yadda Saxla'}
            </button>
          </div>

        </div>

        {/* Sağ Panel: Şablon Redaktoru və Canlı Çat Önizləməsi (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mesaj Şablonu Redaktoru */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Avtomatik Mesaj Şablonu</span>
              </h3>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE }))}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                İlkinə Qaytar
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Müştəriyə göndəriləcək mətni istəyinizə uyğun dəyişə bilərsiniz:
            </p>

            <textarea
              rows={5}
              value={settings.whatsappTemplate}
              onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium leading-relaxed"
            />

            {/* Dəyişən Düymələri */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                Tez Dəyişənlər (Klikləyərək əlavə edin):
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { tag: '{date}', label: 'Tarix' },
                  { tag: '{timeSlot}', label: 'Saat' },
                  { tag: '{tenantName}', label: 'Müəssisə' },
                  { tag: '{customerName}', label: 'Müştəri' },
                  { tag: '{serviceName}', label: 'Xidmət' },
                  { tag: '{staffName}', label: 'Mütəxəssis' }
                ].map(v => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariable(v.tag)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    + {v.label} ({v.tag})
                  </button>
                ))}
              </div>
            </div>

            {/* Real Çat Balonu Görünüşü (WhatsApp Preview) */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">
                Müştərinin Telefonunda Canlı Görünüş:
              </span>
              <div className="rounded-2xl p-4 bg-[#e5ddd5] dark:bg-[#0b141a] border border-slate-300 dark:border-white/10 relative overflow-hidden shadow-inner">
                {/* Chat Bubble */}
                <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs leading-relaxed max-w-[90%] relative">
                  <p>{previewMessage}</p>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 dark:text-emerald-200/80 mt-1.5 font-semibold">
                    <span>14:30</span>
                    <span className="text-emerald-600 dark:text-emerald-300">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Test Göndəriş Paneli */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Canlı Test Bildirişi Yoxla</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistemi yoxlamaq üçün öz telefon nömrənizə test bildirişi göndərin:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+994 50 123 45 67"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testing ? 'Yoxlanılır...' : 'Test Et'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.waLink && (
                  <a
                    href={testResult.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline mt-1"
                  >
                    <span>WhatsApp-da Birbaşa Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

      </form>

      {/* ─── AŞAĞI PANEL: GÖNDƏRİLMİŞ WHATSAPP MESAJLARININ TARİXÇƏSİ (LOGS) ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Göndərilmiş WhatsApp Mesajlarının Tarixçəsi və Loqları</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sistem tərəfindən müştərilərə ünvanlanmış bildirişlərin real vaxt hesabatı
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nömrə və ya ada görə axtar..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                title="Tarixçəni Təmizlə"
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            Hələlik heç bir WhatsApp mesajı qeydə alınmayıb. Rezervasiyalar edildikcə burada real vaxt görünəcək.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Tarix & Saat</th>
                  <th className="py-3 px-3">Müştəri & Nömrə</th>
                  <th className="py-3 px-3">Göndərilən Mesaj</th>
                  <th className="py-3 px-3">Metod</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Keçid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleString('az-AZ')}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{l.recipientName}</div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">{l.recipientPhone}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={l.message}>
                      {l.message}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        {l.method === 'META_API' ? 'Meta Cloud API' : (l.method === 'CUSTOM_GATEWAY' ? 'Gateway' : 'Click-to-Chat')}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {l.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Çatdırıldı</span>
                        </span>
                      ) : l.status === 'READY' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Hazırlandı</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500" title={l.errorDetails}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Xəta</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <a
                        href={`https://wa.me/${l.recipientPhone}?text=${encodeURIComponent(l.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
