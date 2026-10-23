'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Briefcase,
  Users,
  Stethoscope,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  Home,
  Check,
  Activity,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Tenant, Service, Staff, Booking, Patient, BookingStatus } from '../../lib/types';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tenants' | 'services' | 'staff' | 'medical' | 'settings'>('overview');
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters for bookings
  const [bookingTenantFilter, setBookingTenantFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  const [selectedPatientForEncounter, setSelectedPatientForEncounter] = useState<Patient | null>(null);

  // Form states for modals
  const [newBookingData, setNewBookingData] = useState({
    tenantId: '',
    customerName: '',
    customerPhone: '+994 ',
    customerFin: '',
    serviceId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00'
  });

  const [newTenantData, setNewTenantData] = useState({
    name: '',
    slug: '',
    sector: 'Gözəllik & Kosmetologiya',
    phone: '+994 ',
    address: 'Bakı şəh.',
    medicalEnabled: false
  });

  const [newServiceData, setNewServiceData] = useState({
    tenantId: '',
    nameAz: '',
    nameEn: '',
    price: 30,
    duration: 45,
    category: 'Ümumi'
  });

  const [newStaffData, setNewStaffData] = useState({
    tenantId: '',
    name: '',
    role: 'Mütəxəssis'
  });

  const [newEncounterData, setNewEncounterData] = useState({
    doctorName: '',
    diagnosis: '',
    treatment: '',
    prescription: ''
  });

  // Fetch all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, tenantsRes, bookingsRes, servicesRes, staffRes, patientsRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/tenants').then(r => r.json()),
        fetch('/api/admin/bookings').then(r => r.json()),
        fetch('/api/admin/services').then(r => r.json()),
        fetch('/api/admin/staff').then(r => r.json()),
        fetch('/api/admin/patients').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (tenantsRes.success) {
        setTenants(tenantsRes.tenants);
        if (tenantsRes.tenants.length > 0 && !newBookingData.tenantId) {
          setNewBookingData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
          setNewServiceData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
          setNewStaffData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
        }
      }
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (servicesRes.success) setServices(servicesRes.services);
      if (staffRes.success) setStaffList(staffRes.staff);
      if (patientsRes.success) setPatients(patientsRes.patients);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Updater for Bookings
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Rezervasiya statusu yeniləndi: ${status}`);
        loadData();
      }
    } catch (err) {
      alert('Status yenilənmədi');
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Bu rezervasiyanı silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Rezervasiya silindi');
        loadData();
      }
    } catch (err) {
      alert('Silinərkən xəta baş verdi');
    }
  };

  // Submit New Booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni rezervasiya uğurla əlavə edildi');
        setIsBookingModalOpen(false);
        setNewBookingData({
          tenantId: tenants[0]?.id || '',
          customerName: '',
          customerPhone: '+994 ',
          customerFin: '',
          serviceId: '',
          staffId: '',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '11:00'
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('Rezervasiya yaradılmadı');
    }
  };

  // Toggle Tenant Active Status
  const handleToggleTenantStatus = async (t: Tenant) => {
    const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Filial statusu: ${nextStatus}`);
        loadData();
      }
    } catch (err) {
      alert('Status dəyişdirilmədi');
    }
  };

  // Submit New Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenantData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni filial uğurla yaradıldı');
        setIsTenantModalOpen(false);
        setNewTenantData({
          name: '',
          slug: '',
          sector: 'Gözəllik & Kosmetologiya',
          phone: '+994 ',
          address: 'Bakı şəh.',
          medicalEnabled: false
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('Filial yaradılmadı');
    }
  };

  // Delete Tenant
  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`"${name}" filialını və onun bütün xidmətlərini silmək istəyirsiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/tenants?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Filial silindi');
        loadData();
      }
    } catch (err) {
      alert('Silinmədi');
    }
  };

  // Submit New Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServiceData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni xidmət əlavə edildi');
        setIsServiceModalOpen(false);
        setNewServiceData({
          tenantId: tenants[0]?.id || '',
          nameAz: '',
          nameEn: '',
          price: 30,
          duration: 45,
          category: 'Ümumi'
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('Xidmət əlavə olunmadı');
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Bu xidməti silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Xidmət silindi');
        loadData();
      }
    } catch (err) {
      alert('Silinmədi');
    }
  };

  // Submit New Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni mütəxəssis əlavə edildi');
        setIsStaffModalOpen(false);
        setNewStaffData({
          tenantId: tenants[0]?.id || '',
          name: '',
          role: 'Mütəxəssis'
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('İşçi əlavə olunmadı');
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Bu mütəxəssisi silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Mütəxəssis silindi');
        loadData();
      }
    } catch (err) {
      alert('Silinmədi');
    }
  };

  // Submit Encounter for Patient
  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForEncounter) return;
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'encounter',
          patientId: selectedPatientForEncounter.id,
          ...newEncounterData
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Tibbi baxış və diaqnoz qeydə alındı');
        setIsEncounterModalOpen(false);
        setNewEncounterData({
          doctorName: '',
          diagnosis: '',
          treatment: '',
          prescription: ''
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('Əlavə edilmədi');
    }
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    if (!confirm('Diqqət: Bütün verilənlər ilkin demo vəziyyətinə qaytarılacaq. Davam edilsin?')) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Demo verilənlər bərpa edildi');
        loadData();
      }
    } catch (err) {
      alert('Bərpa edilmədi');
    }
  };

  // Filtered Bookings calculation
  const filteredBookings = bookings.filter(b => {
    const matchTenant = bookingTenantFilter === 'all' || b.tenantId === bookingTenantFilter;
    const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchSearch =
      !bookingSearch.trim() ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch) ||
      (b.customerFin && b.customerFin.toLowerCase().includes(bookingSearch.toLowerCase()));
    return matchTenant && matchStatus && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between shrink-0 transition-colors">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">Rezervasiya<span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>İcmal (Dashboard)</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4" />
                <span>Rezervasiyalar</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'tenants'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Şirkət & Filiallar</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'tenants' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                {tenants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4" />
                <span>Xidmətlər və Qiymətlər</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Mütəxəssislər / İşçilər</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                {staffList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('medical')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'medical'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4" />
                <span>Tibbi Kart & Pasiyent</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                FİN
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Tənzimləmələr</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Əsas Sayta Keçid</span>
          </Link>
          <div className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            RezervasiyaPro SaaS v2.5
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'overview' && 'Sistemin Ümumi Göstəriciləri'}
              {activeTab === 'bookings' && 'Rezervasiyaların İdarə Edilməsi'}
              {activeTab === 'tenants' && 'Filiallar və Şirkətlər'}
              {activeTab === 'services' && 'Xidmətlər və Qiymət Tarifləri'}
              {activeTab === 'staff' && 'İşçi Heyəti və Mütəxəssislər'}
              {activeTab === 'medical' && 'Tibbi Qeydiyyat və FİN Xəstəlik Tarixçəsi'}
              {activeTab === 'settings' && 'Sistem Parametrləri'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <button
              onClick={loadData}
              title="Yenilə"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Rezervasiya</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 space-y-6">
          {/* ═══════════ TAB 1: OVERVIEW ═══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ümumi Rezervasiyalar</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalBookings || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Bu gün üçün: {stats?.todayBookingsCount || 0} növbə</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Təxmini Gəlir (AZN)</p>
                      <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.totalRevenue || 0} ₼</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Təsdiqlənmiş & icra olunmuş</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aktiv Filiallar</p>
                      <h3 className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">{stats?.activeTenantsCount || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Cəmi xidmət: {stats?.totalServicesCount || 0}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">İşçi Heyəti</p>
                      <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats?.totalStaffCount || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Həkimlər, ustalar, məşqçilər</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Təsdiqlənmiş (Gözləyir)</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.pendingBookings || 0}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase">Tamamlanmış</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.completedBookings || 0}</p>
                  </div>
                  <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase">Ləğv Olunmuş</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats?.cancelledBookings || 0}</p>
                  </div>
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>

              {/* Quick Actions & Recent Bookings */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Son Rezervasiyalar və Status İdarəetməsi</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Canlı qeydiyyat cədvəli və anında status dəyişməsi</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Bütün rezervasiyaları gör ({bookings.length})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="pb-3">Müştəri / Əlaqə</th>
                        <th className="pb-3">Filial</th>
                        <th className="pb-3">Xidmət & Qiymət</th>
                        <th className="pb-3">Tarix & Saat</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {bookings.slice(0, 6).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <p className="font-semibold text-slate-900 dark:text-white">{b.customerName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{b.customerPhone}</p>
                            {b.customerFin && (
                              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                                FİN: {b.customerFin}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {b.tenantName}
                          </td>
                          <td className="py-3">
                            <p className="font-medium text-slate-900 dark:text-white text-xs">{b.serviceName}</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{b.servicePrice} AZN</p>
                          </td>
                          <td className="py-3 text-xs">
                            <p className="text-slate-700 dark:text-slate-300">{b.date}</p>
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold">{b.timeSlot}</p>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300' :
                              b.status === 'COMPLETED' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-500 text-blue-700 dark:text-blue-300' :
                              b.status === 'CANCELLED' ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-500 text-rose-700 dark:text-rose-300' :
                              'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-500 text-amber-700 dark:text-amber-300'
                            }`}>
                              {b.status === 'CONFIRMED' ? 'Təsdiqləndi' : b.status === 'COMPLETED' ? 'Tamamlandı' : b.status === 'CANCELLED' ? 'Ləğv edildi' : 'Gəlmədi'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                                  title="Tamamla"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {b.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                  title="Ləğv et"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 2: BOOKINGS ═══════════ */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filter Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Müştəri adı, tel və ya FİN..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Tenant Select */}
                  <select
                    value={bookingTenantFilter}
                    onChange={(e) => setBookingTenantFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Bütün Filiallar</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>

                  {/* Status Select */}
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Bütün Statuslar</option>
                    <option value="CONFIRMED">Təsdiqləndi</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="CANCELLED">Ləğv edildi</option>
                    <option value="NO_SHOW">Gəlmədi</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Rezervasiya Əlavə Et</span>
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Müştəri & FİN</th>
                        <th className="p-4">Filial</th>
                        <th className="p-4">Xidmət & Mütəxəssis</th>
                        <th className="p-4">Tarix & Saat</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                            Uyğun rezervasiya tapılmadı
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{b.id}</td>
                            <td className="p-4">
                              <p className="font-bold text-slate-900 dark:text-white">{b.customerName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{b.customerPhone}</p>
                              {b.customerFin && (
                                <span className="inline-block mt-1 text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                                  FİN: {b.customerFin}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {b.tenantName}
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs">{b.serviceName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">İşçi: {b.staffName}</p>
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{b.servicePrice} AZN</p>
                            </td>
                            <td className="p-4 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{b.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{b.timeSlot}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <select
                                value={b.status}
                                onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none ${
                                  b.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300' :
                                  b.status === 'COMPLETED' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-300' :
                                  b.status === 'CANCELLED' ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-500 text-rose-700 dark:text-rose-300' :
                                  'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-500 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                <option value="CONFIRMED">Təsdiqləndi</option>
                                <option value="COMPLETED">Tamamlandı</option>
                                <option value="CANCELLED">Ləğv edildi</option>
                                <option value="NO_SHOW">Gəlmədi</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                title="Sil"
                                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 3: TENANTS ═══════════ */}
          {activeTab === 'tenants' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Bütün Müəssisə və Filiallar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Şirkətləri yaradın, statusunu dəyişin və ya tibbi modulu idarə edin</p>
                </div>
                <button
                  onClick={() => setIsTenantModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Filial Əlavə Et</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative flex flex-col justify-between shadow-sm transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          {t.sector}
                        </span>
                        <button
                          onClick={() => handleToggleTenantStatus(t)}
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 hover:bg-rose-100'
                          }`}
                        >
                          {t.status === 'ACTIVE' ? 'Aktiv' : 'Dayandırılıb'}
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.name}</h4>
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">Slug: /{t.slug}</p>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {t.phone && <p>Tel: {t.phone}</p>}
                        {t.address && <p>Ünvan: {t.address}</p>}
                        <div className="pt-1 flex items-center gap-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            t.medicalEnabled ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {t.medicalEnabled ? 'Tibbi Modul: Aktiv (FİN)' : 'Tibbi Modul: Yoxdur'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <Link
                        href={`/${t.slug}`}
                        target="_blank"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <span>İctimai Səhifə</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDeleteTenant(t.id, t.name)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-semibold p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ TAB 4: SERVICES ═══════════ */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Xidmətlər və Qiymətlər</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Filiallar üzrə təqdim olunan bütün xidmətlər, müddət və qiymətlər</p>
                </div>
                <button
                  onClick={() => setIsServiceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Xidmət Əlavə Et</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    <tr>
                      <th className="p-4">Xidmət Adı (AZ / EN)</th>
                      <th className="p-4">Aid Olduğu Filial</th>
                      <th className="p-4">Kateqoriya</th>
                      <th className="p-4">Müddət</th>
                      <th className="p-4">Qiymət (AZN)</th>
                      <th className="p-4 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {services.map(s => {
                      const t = tenants.find(x => x.id === s.tenantId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white">{s.nameAz}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.nameEn}</p>
                          </td>
                          <td className="p-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {t ? t.name : 'Naməlum'}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                              {s.category}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                            {s.duration} dəqiqə
                          </td>
                          <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {s.price} AZN
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteService(s.id)}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 5: STAFF ═══════════ */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Mütəxəssis və İşçi Heyəti</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Həkimlər, ustalar, məşqçilər və mütəxəssislərin filiallar üzrə cədvəli</p>
                </div>
                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Mütəxəssis Əlavə Et</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map(st => {
                  const t = tenants.find(x => x.id === st.tenantId);
                  return (
                    <div key={st.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-sm transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {st.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{st.role}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t ? t.name : 'Naməlum Filial'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStaff(st.id)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════ TAB 6: MEDICAL & PATIENTS ═══════════ */}
          {activeTab === 'medical' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tibbi Qeydiyyat & FİN İnteqrasiyası</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pasiyentlərin tibbi kartı, diaqnozları, müalicəsi və verilən reseptlər</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patients.map(p => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{p.fullName}</h4>
                          <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                            FİN: {p.fin}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Doğum tarixi: {p.birthDate || 'Qeyd olunmayıb'}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPatientForEncounter(p);
                          setIsEncounterModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Klinik Baxış Əlavə Et</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Qan Qrupu:</span>
                        <p className="font-semibold text-slate-900 dark:text-white">{p.bloodGroup || 'Qeyd yoxdur'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Allergiyalar:</span>
                        <p className="font-semibold text-slate-900 dark:text-white">{p.allergies || 'Yoxdur'}</p>
                      </div>
                    </div>

                    {/* Encounters History */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Baxış Tarixçəsi və Diaqnozlar ({p.encounters?.length || 0})</h5>
                      <div className="space-y-2">
                        {p.encounters && p.encounters.length > 0 ? (
                          p.encounters.map(e => (
                            <div key={e.id} className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-white/5 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{e.doctorName}</span>
                                <span className="text-[11px] text-slate-400">{e.encounterDate.split('T')[0]}</span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200"><span className="text-slate-500 dark:text-slate-400">Diaqnoz:</span> {e.diagnosis}</p>
                              <p className="text-slate-800 dark:text-slate-200"><span className="text-slate-500 dark:text-slate-400">Müalicə:</span> {e.treatment}</p>
                              {e.prescription && (
                                <p className="text-indigo-600 dark:text-indigo-300 pt-1 border-t border-slate-200 dark:border-white/5"><span className="text-slate-500 dark:text-slate-400">Resept:</span> {e.prescription}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">Hələ ki, kliniki baxış əlavə edilməyib.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ TAB 7: SETTINGS ═══════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sistem Məlumatları</h3>
                <div className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-white/5">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Layihə Adı:</span>
                    <span className="font-bold text-slate-900 dark:text-white">RezervasiyaPro Multi-Tenant SaaS</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Platforma & Server:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Hostinger Cloud / Node.js 18+ / Next.js 14</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Verilənlər Bazası:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">PostgreSQL (Prisma) + Fail-safe JSON Store</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Git Repozitoriya:</span>
                    <span className="text-sky-600 dark:text-sky-400">https://github.com/2-RaL/RezervasiyaPro.git</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">Demo Verilənləri Bərpa Et</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bütün demo filialları, xidmətləri, işçiləri və rezervasiyaları ilkin standart vəziyyətinə qaytarmaq üçün aşağıdakı düyməni sıxın.
                </p>
                <button
                  onClick={handleResetDemoData}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 dark:bg-rose-600/20 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:text-white font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Demo Datanı Sıfırla və Bərpa Et</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════ MODAL 1: NEW BOOKING ═══════════ */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Rezervasiya Əlavə Et</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial Seçin</label>
                <select
                  value={newBookingData.tenantId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    const tenantSrvs = services.filter(s => s.tenantId === tid);
                    const tenantStf = staffList.filter(st => st.tenantId === tid);
                    setNewBookingData({
                      ...newBookingData,
                      tenantId: tid,
                      serviceId: tenantSrvs[0]?.id || '',
                      staffId: tenantStf[0]?.id || ''
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  required
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müştərinin Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad və Soyad"
                    value={newBookingData.customerName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobil Nömrə</label>
                  <input
                    type="tel"
                    required
                    placeholder="+994 50 000 00 00"
                    value={newBookingData.customerPhone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerPhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pasiyent FİN Kodu (İstəyə bağlı)</label>
                <input
                  type="text"
                  maxLength={7}
                  placeholder="7 rəqəm/hərf (Məs: 7ABC123)"
                  value={newBookingData.customerFin}
                  onChange={(e) => setNewBookingData({ ...newBookingData, customerFin: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Xidmət</label>
                  <select
                    value={newBookingData.serviceId}
                    onChange={(e) => setNewBookingData({ ...newBookingData, serviceId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Seçin</option>
                    {services
                      .filter(s => !newBookingData.tenantId || s.tenantId === newBookingData.tenantId)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.nameAz} ({s.price} AZN)</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mütəxəssis</label>
                  <select
                    value={newBookingData.staffId}
                    onChange={(e) => setNewBookingData({ ...newBookingData, staffId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Seçin</option>
                    {staffList
                      .filter(st => !newBookingData.tenantId || st.tenantId === newBookingData.tenantId)
                      .map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarix</label>
                  <input
                    type="date"
                    required
                    value={newBookingData.date}
                    onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Saat</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: 14:30"
                    value={newBookingData.timeSlot}
                    onChange={(e) => setNewBookingData({ ...newBookingData, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Təsdiq Et və Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 2: NEW TENANT ═══════════ */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Filial / Şirkət Qeydiyyatı</h3>
              <button onClick={() => setIsTenantModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial / Şirkət Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Baku Smile Dental"
                  value={newTenantData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                    setNewTenantData({ ...newTenantData, name, slug });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Keçid (Slug)</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-500 font-mono">/</span>
                  <input
                    type="text"
                    required
                    value={newTenantData.slug}
                    onChange={(e) => setNewTenantData({ ...newTenantData, slug: e.target.value })}
                    className="w-full bg-transparent text-indigo-600 dark:text-indigo-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sektor / Kateqoriya</label>
                <select
                  value={newTenantData.sector}
                  onChange={(e) => setNewTenantData({ ...newTenantData, sector: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Gözəllik & Kosmetologiya">Gözəllik & Kosmetologiya</option>
                  <option value="Səhiyyə & Diaqnostika">Səhiyyə & Diaqnostika</option>
                  <option value="Bərbərxana & Stil">Bərbərxana & Stil</option>
                  <option value="Avtomobil & Detailing">Avtomobil & Detailing</option>
                  <option value="İdman & Fitnes">İdman & Fitnes</option>
                  <option value="Təhsil & Fərdi Dərslər">Təhsil & Fərdi Dərslər</option>
                  <option value="Reabilitasiya & Osteopatiya">Reabilitasiya & Osteopatiya</option>
                  <option value="Digər Xidmətlər">Digər Xidmətlər</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Əlaqə Telefonu</label>
                  <input
                    type="tel"
                    value={newTenantData.phone}
                    onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ünvan</label>
                  <input
                    type="text"
                    value={newTenantData.address}
                    onChange={(e) => setNewTenantData({ ...newTenantData, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="medEnabled"
                  checked={newTenantData.medicalEnabled}
                  onChange={(e) => setNewTenantData({ ...newTenantData, medicalEnabled: e.target.checked })}
                  className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="medEnabled" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                  Tibbi Modul Aktiv Olsun (FİN ilə pasiyent bazası)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Filialı Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 3: NEW SERVICE ═══════════ */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Xidmət və Qiymət Əlavə Et</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial</label>
                <select
                  value={newServiceData.tenantId}
                  onChange={(e) => setNewServiceData({ ...newServiceData, tenantId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  required
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Xidmət Adı (Azərbaycan dilində)</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Plomb qoyulması"
                  value={newServiceData.nameAz}
                  onChange={(e) => setNewServiceData({ ...newServiceData, nameAz: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kateqoriya</label>
                <input
                  type="text"
                  placeholder="Məs: Stomatologiya, Saç kəsimi"
                  value={newServiceData.category}
                  onChange={(e) => setNewServiceData({ ...newServiceData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qiymət (AZN)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newServiceData.price}
                    onChange={(e) => setNewServiceData({ ...newServiceData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müddət (dəqiqə)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={newServiceData.duration}
                    onChange={(e) => setNewServiceData({ ...newServiceData, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Xidməti Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 4: NEW STAFF ═══════════ */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Mütəxəssis Əlavə Et</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial</label>
                <select
                  value={newStaffData.tenantId}
                  onChange={(e) => setNewStaffData({ ...newStaffData, tenantId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  required
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mütəxəssisin Adı və Soyadı</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Dr. Samir İsmayılov"
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vəzifə / İxtisas</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Baş Terapevt, Master Barber, Lazeroloq"
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Mütəxəssisi Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 5: NEW CLINICAL ENCOUNTER ═══════════ */}
      {isEncounterModalOpen && selectedPatientForEncounter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Klinik Baxış və Diaqnoz Qeydi</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Pasiyent: {selectedPatientForEncounter.fullName} (FİN: {selectedPatientForEncounter.fin})
                </p>
              </div>
              <button onClick={() => setIsEncounterModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müayinə Edən Həkim</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Dr. Rəşad Əliyev"
                  value={newEncounterData.doctorName}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, doctorName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diaqnoz</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Kəskin pulpitis, sol yuxarı 6-cı diş"
                  value={newEncounterData.diagnosis}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, diagnosis: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Görülən Müalicə / Prosedur</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Məs: Sinir çıxarıldı, kanallar dezinfeksiya edildi və müvəqqəti plomblə bağlandı."
                  value={newEncounterData.treatment}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, treatment: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Yazılan Resept / Dərmanlar</label>
                <textarea
                  rows={2}
                  placeholder="Məs: Nimesil gündə 2 dəfə yeməkdən sonra, Asepta balzam"
                  value={newEncounterData.prescription}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, prescription: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEncounterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-600/30"
                >
                  Tarixçəyə Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
