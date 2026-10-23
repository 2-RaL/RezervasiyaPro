'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  TrendingUp,
  SlidersHorizontal,
  Home,
  Check,
  ShieldCheck,
  UserCheck,
  Crown,
  LogOut,
  UserPlus,
  Lock,
  Mail,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Camera,
  Star,
  Lightbulb,
  Edit2,
  Sparkles,
  UserX,
  ShieldAlert,
  FileText,
  HeartPulse,
  Clock
} from 'lucide-react';
import { Tenant, Service, Staff, Booking, Patient, BookingStatus, User, UserRole, CustomerReview, FeedbackSuggestion } from '../../lib/types';
import ThemeToggle from '../../components/ThemeToggle';
import { getSectorInfo } from '../../lib/sectorUtils';
import QualityReviewsTab from './components/QualityReviewsTab';
import FeedbacksTab from './components/FeedbacksTab';
import ServicesManagementTab from './components/ServicesManagementTab';
import UsersManagementTab from './components/UsersManagementTab';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Current Logged In User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'tenants' | 'users' | 'editor' | 'services' | 'staff' | 'medical' | 'quality' | 'feedbacks' | 'settings'
  >('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters for bookings
  const [bookingTenantFilter, setBookingTenantFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  const [selectedPatientForEncounter, setSelectedPatientForEncounter] = useState<Patient | null>(null);

  // Super Admin Tenant Edit Modal State
  const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
  const [editTenantData, setEditTenantData] = useState({
    id: '',
    name: '',
    slug: '',
    sector: 'Gözəllik & Kosmetologiya',
    phone: '',
    address: '',
    medicalEnabled: false,
    assignedAdminId: '',
    coverImage: '',
    logo: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    telegram: ''
  });
  const [editTenantImageError, setEditTenantImageError] = useState<{ cover?: string; logo?: string }>({});

  // Patient Modals & Search State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [newPatientData, setNewPatientData] = useState({
    tenantId: '',
    fullName: '',
    fin: '',
    phone: '+994 ',
    birthDate: '',
    bloodGroup: 'I (O) Rh+',
    allergies: '',
    notes: ''
  });
  const [editPatientData, setEditPatientData] = useState({
    id: '',
    tenantId: '',
    fullName: '',
    fin: '',
    phone: '',
    birthDate: '',
    bloodGroup: '',
    allergies: '',
    notes: ''
  });

  // Customer Reputation & Notes Modal State
  const [isReputationModalOpen, setIsReputationModalOpen] = useState(false);
  const [selectedBookingForReputation, setSelectedBookingForReputation] = useState<Booking | null>(null);
  const [reputationData, setReputationData] = useState({
    customerScore: 100,
    adminNotes: ''
  });

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
    medicalEnabled: false,
    assignedAdminId: '',
    coverImage: '',
    logo: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    telegram: ''
  });

  const [tenantImageError, setTenantImageError] = useState<{ cover?: string; logo?: string }>({});
  const [companyImageError, setCompanyImageError] = useState<{ cover?: string; logo?: string }>({});

  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ADMIN' as UserRole,
    tenantId: ''
  });

  // Editor form for Company Admin
  const [newEditorData, setNewEditorData] = useState({
    fullName: '',
    username: '',
    password: ''
  });

  const [newServiceData, setNewServiceData] = useState({
    tenantId: '',
    nameAz: '',
    nameEn: '',
    price: 30,
    duration: 45,
    category: 'Ümumi'
  });

  const [newStaffData, setNewStaffData] = useState<{
    tenantId: string;
    name: string;
    role: string;
    serviceIds: string[];
    slotDuration?: number;
  }>({
    tenantId: '',
    name: '',
    role: 'Mütəxəssis',
    serviceIds: [],
    slotDuration: undefined
  });

  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [editStaffData, setEditStaffData] = useState<{
    id: string;
    name: string;
    role: string;
    tenantId: string;
    serviceIds: string[];
    slotDuration?: number;
  }>({
    id: '',
    name: '',
    role: '',
    tenantId: '',
    serviceIds: [],
    slotDuration: undefined
  });

  const [newEncounterData, setNewEncounterData] = useState({
    doctorName: '',
    diagnosis: '',
    treatment: '',
    prescription: ''
  });

  // Company Admin Settings Form
  const [companySettingsData, setCompanySettingsData] = useState({
    name: '',
    phone: '',
    address: '',
    sector: '',
    medicalEnabled: false,
    coverImage: '',
    logo: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    telegram: ''
  });

  // Image validation and upload handler
  const handleValidateAndUploadImage = (
    file: File,
    type: 'cover' | 'logo',
    onSuccess: (dataUrl: string) => void,
    onError: (err: string) => void
  ) => {
    const isCover = type === 'cover';
    const maxKB = isCover ? 1024 : 512;
    const maxW = isCover ? 1920 : 800;
    const maxH = isCover ? 1080 : 800;
    const label = isCover ? 'Yuxarı panel örtük şəkli' : 'Loqo şəkli';

    // 1. Check size in KB
    const fileSizeKB = Math.round(file.size / 1024);
    if (fileSizeKB > maxKB) {
      onError(`${label}: Faylın həcmi çox böyükdür (${fileSizeKB} KB). Qoyulan limit: maksimum ${maxKB} KB.`);
      return;
    }

    // 2. Read as data URL and verify pixel dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        if (img.width > maxW || img.height > maxH) {
          onError(`${label}: Şəklin ölçüləri (${img.width}x${img.height} px) limiti aşır! Maksimum icazə verilən ölçü: ${maxW}x${maxH} px.`);
          return;
        }
        onError('');
        onSuccess(dataUrl);
      };
      img.onerror = () => {
        onError('Şəkil faylı oxuna bilmədi. Zəhmət olmasa düzgün formatda (JPG, PNG, WebP) şəkil seçin.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      onError('Fayl oxunarkən xəta baş verdi.');
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Verify Authentication against Database
  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        // Not authenticated in DB - immediately deny and redirect
        router.push('/login');
        return null;
      }

      setCurrentUser(data.user);
      return data.user;
    } catch {
      router.push('/login');
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Load all dashboard data
  const loadData = async (userParam?: User) => {
    const user = userParam || currentUser;
    if (!user) return;

    try {
      setLoading(true);

      const [statsRes, tenantsRes, bookingsRes, servicesRes, staffRes, patientsRes, reviewsRes, feedbacksRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/tenants').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/bookings').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/services').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/staff').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/patients').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/reviews' + (user.role !== 'SUPER_ADMIN' && user.tenantId ? `?tenantId=${user.tenantId}` : '')).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/feedbacks').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (tenantsRes.success) {
        setTenants(tenantsRes.tenants || []);

        // If company admin, initialize company settings
        if (user.role === 'ADMIN' && tenantsRes.tenants.length > 0) {
          const myT = tenantsRes.tenants[0];
          setCompanySettingsData({
            name: myT.name || '',
            phone: myT.phone || '',
            address: myT.address || '',
            sector: myT.sector || 'Gözəllik & Kosmetologiya',
            medicalEnabled: Boolean(myT.medicalEnabled),
            coverImage: myT.coverImage || '',
            logo: myT.logo || '',
            whatsapp: myT.whatsapp || '',
            instagram: myT.instagram || '',
            facebook: myT.facebook || '',
            tiktok: myT.tiktok || '',
            telegram: myT.telegram || ''
          });
        }

        if (tenantsRes.tenants.length > 0 && !newBookingData.tenantId) {
          setNewBookingData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
          setNewServiceData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
          setNewStaffData(prev => ({ ...prev, tenantId: tenantsRes.tenants[0].id }));
        }
      }

      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
      if (servicesRes.success) setServices(servicesRes.services || []);
      if (staffRes.success) setStaffList(staffRes.staff || []);
      if (patientsRes.success) setPatients(patientsRes.patients || []);
      if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      if (feedbacksRes.success) setFeedbacks(feedbacksRes.feedbacks || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Load Users
  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    checkAuth().then(user => {
      if (user) {
        loadData(user);
        loadUsers();
      }
    });
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Booking Status Updater
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        const statusMap: Record<string, string> = {
          'CONFIRMED': 'Təsdiqləndi',
          'COMPLETED': 'Tamamlandı',
          'CANCELLED': 'Ləğv edildi',
          'NO_SHOW': 'Gəlmədi (Qeydə alındı)'
        };
        showToast(`Rezervasiya statusu yeniləndi: ${statusMap[status] || status}`);
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
      alert('Silinmədi');
    }
  };

  // Open Customer Reputation & Notes Modal
  const handleOpenReputation = (b: Booking) => {
    setSelectedBookingForReputation(b);
    setReputationData({
      customerScore: b.customerScore !== undefined ? b.customerScore : 100,
      adminNotes: b.adminNotes || ''
    });
    setIsReputationModalOpen(true);
  };

  // Save Customer Reputation & Notes
  const handleSaveReputation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReputation) return;
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBookingForReputation.id,
          customerScore: reputationData.customerScore,
          adminNotes: reputationData.adminNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Müştəri xalı və daxili qeyd yadda saxlanıldı');
        setIsReputationModalOpen(false);
        loadData();
      } else {
        alert(data.error || 'Yadda saxlanmadı');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Manual Toggle Block / Unblock Customer
  const handleToggleBlockCustomer = async (b: Booking, block: boolean) => {
    const actionText = block ? 'bloklamaq' : 'blokdan çıxarmaq';
    if (!confirm(`Müştərini (${b.customerName}, ${b.customerPhone}) ${actionText} istədiyinizdən əminsiniz?`)) return;
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleBlock',
          phone: b.customerPhone,
          fin: b.customerFin,
          ip: b.clientIp,
          customerName: b.customerName,
          blocked: block,
          reason: block ? 'Admin tərəfindən bloklandı' : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(block ? 'Müştəri bloklandı (Qurğu, Nömrə və FİN)' : 'Müştəri blokdan çıxarıldı');
        loadData();
      } else {
        alert(data.error || 'Əməliyyat yerinə yetirilmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Submit New Booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantToUse = currentUser?.role === 'SUPER_ADMIN' ? newBookingData.tenantId : currentUser?.tenantId;
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBookingData, tenantId: tenantToUse })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni rezervasiya uğurla qeyd edildi');
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

  // Submit New Tenant (Super Admin only)
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
        showToast('Yeni şirkət/filial uğurla yaradıldı');
        setIsTenantModalOpen(false);
        setTenantImageError({});
        setNewTenantData({
          name: '',
          slug: '',
          sector: 'Gözəllik & Kosmetologiya',
          phone: '+994 ',
          address: 'Bakı şəh.',
          medicalEnabled: false,
          assignedAdminId: '',
          coverImage: '',
          logo: '',
          whatsapp: '',
          instagram: '',
          facebook: '',
          tiktok: '',
          telegram: ''
        });
        loadData();
        loadUsers();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (err) {
      alert('Filial yaradılmadı');
    }
  };

  // Delete Tenant (Super Admin only)
  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`"${name}" filialını və onun bütün məlumatlarını silmək istəyirsiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/tenants?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Filial silindi');
        loadData();
        loadUsers();
      }
    } catch (err) {
      alert('Silinmədi');
    }
  };

  // Open Edit Tenant Modal (Super Admin)
  const handleOpenEditTenant = (t: Tenant) => {
    const assignedAdmin = (t as any).assignedAdmin;
    setEditTenantData({
      id: t.id,
      name: t.name,
      slug: t.slug,
      sector: t.sector,
      phone: t.phone || '',
      address: t.address || '',
      medicalEnabled: Boolean(t.medicalEnabled),
      assignedAdminId: assignedAdmin?.id || '',
      coverImage: t.coverImage || '',
      logo: t.logo || '',
      whatsapp: t.whatsapp || '',
      instagram: t.instagram || '',
      facebook: t.facebook || '',
      tiktok: t.tiktok || '',
      telegram: t.telegram || ''
    });
    setEditTenantImageError({});
    setIsEditTenantModalOpen(true);
  };

  // Save Edit Tenant (Super Admin)
  const handleSaveEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTenantData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Şirkət/filial məlumatları uğurla yeniləndi');
        setIsEditTenantModalOpen(false);
        loadData();
        loadUsers();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch {
      alert('Yenilənmədi');
    }
  };

  // Toggle Tenant Active/Suspended
  const handleToggleTenantStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenant.id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status dəyişdirildi: ${newStatus}`);
        loadData();
      }
    } catch (err) {
      alert('Yenilənmədi');
    }
  };

  // Company Admin saves own company settings
  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.tenantId) return;

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.tenantId,
          name: companySettingsData.name,
          phone: companySettingsData.phone,
          address: companySettingsData.address,
          sector: companySettingsData.sector,
          medicalEnabled: companySettingsData.medicalEnabled,
          coverImage: companySettingsData.coverImage || null,
          logo: companySettingsData.logo || null,
          whatsapp: companySettingsData.whatsapp || null,
          instagram: companySettingsData.instagram || null,
          facebook: companySettingsData.facebook || null,
          tiktok: companySettingsData.tiktok || null,
          telegram: companySettingsData.telegram || null
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Şirkət parametrləri uğurla yadda saxlanıldı');
        loadData();
      } else {
        alert(data.error || 'Yadda saxlanılmadı');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Create User (Super Admin only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('İstifadəçi bazaya əlavə edildi');
        setIsUserModalOpen(false);
        setNewUserData({
          username: '',
          password: '',
          fullName: '',
          role: 'ADMIN',
          tenantId: ''
        });
        loadUsers();
      } else {
        alert(data.error || 'İstifadəçi yaradılmadı');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Create Editor (Company Admin only - 1 Editor Rule)
  const handleCreateEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.tenantId) {
      alert('Şirkət təyin edilməyib');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEditorData,
          role: 'EDITOR',
          tenantId: currentUser.tenantId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Şirkətiniz üçün 1 nəfər rəsmi Redaktor təyin edildi');
        setNewEditorData({ fullName: '', username: '', password: '' });
        loadUsers();
      } else {
        alert(data.error || 'Redaktor əlavə edilmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Delete User (Super Admin or Company Admin deleting their editor)
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı istifadəçini silmək istədiyinizdən əminsiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('İstifadəçi silindi');
        loadUsers();
      } else {
        alert(data.error || 'Silinmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Service CRUD
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantToUse = currentUser?.role === 'SUPER_ADMIN' ? newServiceData.tenantId : currentUser?.tenantId;
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newServiceData, tenantId: tenantToUse })
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
    } catch {
      alert('Xidmət əlavə olunmadı');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Bu xidməti silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Xidmət silindi');
        loadData();
      }
    } catch {
      alert('Silinmədi');
    }
  };

  // Staff CRUD
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantToUse = currentUser?.role === 'SUPER_ADMIN' ? newStaffData.tenantId : currentUser?.tenantId;
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStaffData, tenantId: tenantToUse })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni mütəxəssis əlavə edildi');
        setIsStaffModalOpen(false);
        setNewStaffData({
          tenantId: tenants[0]?.id || '',
          name: '',
          role: 'Mütəxəssis',
          serviceIds: [],
          slotDuration: undefined
        });
        loadData();
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch {
      alert('İşçi əlavə olunmadı');
    }
  };

  const handleUpdateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStaffData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Mütəxəssis məlumatları və xidmətləri yeniləndi');
        setIsEditStaffModalOpen(false);
        loadData();
      } else {
        alert(data.error || 'Yenilənmədi');
      }
    } catch {
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Bu mütəxəssisi silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Mütəxəssis silindi');
        loadData();
      }
    } catch {
      alert('Silinmədi');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Bu rəyi silmək istədiyinizdən əminsiniz?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Rəy silindi');
        loadData();
      } else {
        alert(data.error || 'Silinmədi');
      }
    } catch {
      alert('Silinmədi');
    }
  };

  // ── PATIENT CRUD HANDLERS ──────────────────────────────────────────
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantToUse = currentUser?.role === 'SUPER_ADMIN' ? (newPatientData.tenantId || tenants[0]?.id) : currentUser?.tenantId;
      if (!tenantToUse) {
        alert('Zəhmət olmasa filialı seçin');
        return;
      }
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPatientData, tenantId: tenantToUse })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Yeni pasiyent uğurla qeydiyyata alındı');
        setIsPatientModalOpen(false);
        setNewPatientData({
          tenantId: '',
          fullName: '',
          fin: '',
          phone: '+994 ',
          birthDate: '',
          bloodGroup: 'I (O) Rh+',
          allergies: '',
          notes: ''
        });
        loadData();
      } else {
        alert(data.error || 'Pasiyent əlavə olunmadı');
      }
    } catch {
      alert('Pasiyent əlavə olunarkən xəta baş verdi');
    }
  };

  const handleOpenEditPatient = (p: Patient) => {
    setEditPatientData({
      id: p.id,
      tenantId: p.tenantId,
      fullName: p.fullName,
      fin: p.fin,
      phone: p.phone || '',
      birthDate: p.birthDate || '',
      bloodGroup: p.bloodGroup || '',
      allergies: p.allergies || '',
      notes: p.notes || ''
    });
    setIsEditPatientModalOpen(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPatientData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pasiyent məlumatları uğurla yeniləndi');
        setIsEditPatientModalOpen(false);
        if (selectedPatientForEncounter?.id === editPatientData.id) {
          setSelectedPatientForEncounter(data.patient);
        }
        loadData();
      } else {
        alert(data.error || 'Pasiyent yenilənmədi');
      }
    } catch {
      alert('Pasiyent yenilənərkən xəta baş verdi');
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Diqqət: "${name}" adlı pasiyenti və bütün tibbi baxış tarixçəsini silmək istədiyinizdən əminsiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/patients?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Pasiyent uğurla silindi');
        if (selectedPatientForEncounter?.id === id) {
          setSelectedPatientForEncounter(null);
        }
        loadData();
      } else {
        alert(data.error || 'Silinmədi');
      }
    } catch {
      alert('Silinərkən xəta baş verdi');
    }
  };

  // Medical Encounter
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
    } catch {
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
        loadUsers();
      }
    } catch {
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

  // Check if Company Admin currently has an editor
  const currentCompanyEditor = usersList.find(
    u => u.tenantId === currentUser?.tenantId && u.role === 'EDITOR'
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">İcazələr yoxlanılır...</p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = currentUser?.role === 'ADMIN';

  const currentSectorTenant = isSuperAdmin
    ? (bookingTenantFilter !== 'all' ? tenants.find(t => t.id === bookingTenantFilter) : tenants[0])
    : tenants.find(t => t.id === currentUser?.tenantId);
  const sectorInfo = getSectorInfo(currentSectorTenant?.sector);

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
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Rezervasiya<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                  {isSuperAdmin ? 'Super Admin Panel' : `${sectorInfo.label}`}
                </span>
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
                <span>{sectorInfo.bookingsLabel}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'bookings'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                {bookings.length}
              </span>
            </button>

            {/* Super Admin Tab: Səhifələr və Şirkətlər */}
            {isSuperAdmin && (
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
                  <span>Şirkətlər (Filiallar)</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'tenants'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tenants.length}
                </span>
              </button>
            )}

            {/* Super Admin Tab: İstifadəçilər və Rollar */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4" />
                  <span>İstifadəçilər & İcazələr</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'users'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {usersList.length}
                </span>
              </button>
            )}

            {/* Company Admin Tab: Redaktor İdarəetməsi (Strictly 1 Editor Rule) */}
            {isCompanyAdmin && (
              <button
                onClick={() => setActiveTab('editor')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4" />
                  <span>Redaktor Təyini</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentCompanyEditor
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                  }`}
                >
                  {currentCompanyEditor ? '1 Təyin Edilib' : '0 / 1'}
                </span>
              </button>
            )}

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
                <span>{sectorInfo.servicesLabel}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'services'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
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
                <span>{sectorInfo.staffLabel}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'staff'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
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

            {/* NEW: Xidmət Keyfiyyəti (Customer Reviews & Star Ratings) */}
            <button
              onClick={() => setActiveTab('quality')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'quality'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Xidmət Keyfiyyəti</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'quality'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                }`}
              >
                {reviews.length}
              </span>
            </button>

            {/* NEW: Rəy və Təkliflər (Feedbacks to Super Admin) */}
            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'feedbacks'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <span>{isSuperAdmin ? 'Daxil Olan Təkliflər' : 'Super Adminə Təklif'}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'feedbacks'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                }`}
              >
                {feedbacks.length}
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
                <span>{isSuperAdmin ? 'Sistem Parametrləri' : 'Şirkət Tənzimləmələri'}</span>
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
              {activeTab === 'bookings' && sectorInfo.bookingsLabel}
              {activeTab === 'tenants' && 'Şirkət və Filialların İdarəsi (Super Admin)'}
              {activeTab === 'users' && 'Sistem İstifadəçiləri və Rollar (Super Admin)'}
              {activeTab === 'editor' && 'Şirkət Redaktoru İdarəetməsi (1 Redaktor Limiti)'}
              {activeTab === 'services' && sectorInfo.servicesLabel}
              {activeTab === 'staff' && sectorInfo.staffLabel}
              {activeTab === 'medical' && 'Tibbi Qeydiyyat və FİN Xəstəlik Tarixçəsi'}
              {activeTab === 'quality' && 'Xidmət Keyfiyyəti və Müştəri Rəyləri'}
              {activeTab === 'feedbacks' && (isSuperAdmin ? 'Daxil Olan Rəy və Təkliflər' : 'Super Adminə Rəy və Təklif')}
              {activeTab === 'settings' && (isSuperAdmin ? 'Sistem Parametrləri' : 'Şirkət və Səhifə Tənzimləmələri')}
            </h1>

            {/* Dynamic Sector Badge */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${sectorInfo.badge}`}>
              <sectorInfo.icon className="w-4 h-4" />
              <span>{sectorInfo.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              {isSuperAdmin ? (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </div>
              ) : isCompanyAdmin ? (
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{currentUser?.tenantName || 'Şirkət Admini'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Redaktor: {currentUser?.tenantName}</span>
                </div>
              )}
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.fullName}</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Refresh */}
            <button
              onClick={() => {
                loadData();
                loadUsers();
              }}
              title="Yenilə"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* New Booking Button */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Rezervasiya</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sistemdən Çıxış"
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 space-y-6">
          {/* ═══════════ TAB 1: OVERVIEW ═══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Sector Specific Hero Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${sectorInfo.badge}`}>
                    <sectorInfo.icon className="w-4 h-4" />
                    <span>{sectorInfo.label}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {currentSectorTenant?.name || 'Müəssisə İdarəetmə Paneli'}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                    {sectorInfo.servicesDesc}. {sectorInfo.bookingsDesc}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                  <button
                    onClick={() => setActiveTab('services')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-300" />
                    <span>{sectorInfo.servicesLabel}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('quality')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    <span>Xidmət Keyfiyyəti ({reviews.length})</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {isSuperAdmin ? 'Bütün Rezervasiyalar' : sectorInfo.bookingsLabel}
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {stats?.totalBookings || 0}
                      </h3>
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
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Təxmini Gəlir (AZN)
                      </p>
                      <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {stats?.totalRevenue || 0} ₼
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Tamamlanmış və təsdiq olunmuşlar
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {sectorInfo.servicesLabel}
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {stats?.totalServicesCount || 0}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Aktiv qiymət paketləri
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {isSuperAdmin ? 'Aktiv Filiallar' : sectorInfo.staffLabel}
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {isSuperAdmin ? stats?.activeTenantsCount || 0 : stats?.totalStaffCount || 0}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      {isSuperAdmin ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {isSuperAdmin ? 'Sistemə qoşulmuş müəssisələr' : `Xidmət göstərən ${sectorInfo.staffTerm.toLowerCase()} heyəti`}
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table in Overview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
                <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Son Rezervasiyalar</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ən son daxil olmuş müraciətlər</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Bütün siyahıya bax →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="p-3.5">Müştəri</th>
                        <th className="p-3.5">Filial</th>
                        <th className="p-3.5">Xidmət</th>
                        <th className="p-3.5">Tarix & Saat</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{b.customerName}</span>
                              {b.customerScore !== undefined && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                  ⭐ {b.customerScore}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-normal text-slate-500">{b.customerPhone}</div>
                            {b.isBlocked && (
                              <span className="text-[10px] font-bold text-rose-500 block">🚫 BLOKLANIB</span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                            {b.tenantName || 'Filial'}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                            {b.serviceName || 'Xidmət'}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">{b.date}</span> • {b.timeSlot}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                  : b.status === 'COMPLETED'
                                  ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                                  : b.status === 'NO_SHOW'
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                              }`}
                            >
                              {b.status === 'CONFIRMED' && 'Təsdiqləndi'}
                              {b.status === 'COMPLETED' && 'Tamamlandı'}
                              {b.status === 'NO_SHOW' && 'Gəlmədi'}
                              {b.status === 'CANCELLED' && 'Ləğv edildi'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {b.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                                  title="Tamamlandı et"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {b.status !== 'NO_SHOW' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'NO_SHOW')}
                                  title="Gəlmədi (No-Show)"
                                  className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500 text-orange-700 dark:text-orange-300 hover:text-white transition-all"
                                >
                                  <UserX className="w-3.5 h-3.5" />
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

                  {/* Tenant Select (Only for Super Admin) */}
                  {isSuperAdmin && (
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
                  )}

                  {/* Status Select */}
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Bütün Statuslar</option>
                    <option value="CONFIRMED">Təsdiqləndi</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="NO_SHOW">Gəlmədi (No-Show)</option>
                    <option value="CANCELLED">Ləğv edildi</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold self-end md:self-auto">
                  Cəmi tapıldı: <span className="text-indigo-600 dark:text-indigo-400">{filteredBookings.length}</span> rezervasiya
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Müştəri & Reputasiya</th>
                        {isSuperAdmin && <th className="p-3.5">Filial</th>}
                        <th className="p-3.5">Xidmət & Qiymət</th>
                        <th className="p-3.5">Mütəxəssis</th>
                        <th className="p-3.5">Tarix & Saat</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">{b.id}</td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{b.customerName}</span>
                              {b.customerScore !== undefined && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-0.5" title="Müştəri Xalı / Balı">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                  <span>{b.customerScore} bal</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-normal text-slate-500">{b.customerPhone}</div>
                            {b.customerFin && (
                              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                FİN: {b.customerFin}
                              </div>
                            )}
                            {b.adminNotes && (
                              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 font-normal line-clamp-2" title={b.adminNotes}>
                                📝 Qeyd: {b.adminNotes}
                              </div>
                            )}
                            {/* No Show / Blocking Status Pill */}
                            {b.isBlocked ? (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                                <ShieldAlert className="w-3 h-3" />
                                <span>BLOKLANIB ({b.noShowCount || 3}x gəlməyib)</span>
                              </div>
                            ) : b.noShowCount && b.noShowCount > 0 ? (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>{b.noShowCount} dəfə gəlməyib</span>
                              </div>
                            ) : null}
                          </td>
                          {isSuperAdmin && (
                            <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                              {b.tenantName || 'Filial'}
                            </td>
                          )}
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <div className="font-semibold">{b.serviceName || 'Xidmət'}</div>
                            {b.servicePrice !== undefined && (
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {b.servicePrice} ₼
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                            {b.staffName || 'İxtiyari Mütəxəssis'}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">{b.date}</span>
                            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                              {b.timeSlot}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                  : b.status === 'COMPLETED'
                                  ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                                  : b.status === 'NO_SHOW'
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                              }`}
                            >
                              {b.status === 'CONFIRMED' && 'Təsdiqləndi'}
                              {b.status === 'COMPLETED' && 'Tamamlandı'}
                              {b.status === 'NO_SHOW' && 'Gəlmədi (No-Show)'}
                              {b.status === 'CANCELLED' && 'Ləğv edildi'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {b.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                                  title="Tamamlandı et"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {b.status !== 'NO_SHOW' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'NO_SHOW')}
                                  title="Müştəri gəlmədi qeyd et (3 dəfə olduqda bloklanacaq)"
                                  className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500 text-orange-700 dark:text-orange-300 hover:text-white transition-all"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {b.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                  title="Ləğv et"
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Xal və Daxili Qeyd Butonu */}
                              <button
                                onClick={() => handleOpenReputation(b)}
                                title="Müştəriyə bal ver və daxili qeyd yaz"
                                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500 text-indigo-700 dark:text-indigo-300 hover:text-white transition-all"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              {/* Əl ilə Blok / Blokdan çıxar */}
                              {b.isBlocked ? (
                                <button
                                  onClick={() => handleToggleBlockCustomer(b, false)}
                                  title="Müştərini blokdan çıxar"
                                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:hover:bg-emerald-500 text-emerald-800 dark:text-emerald-300 hover:text-white transition-all"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleBlockCustomer(b, true)}
                                  title="Müştərini əl ilə blokla"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-all"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                title="Sil"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500 text-slate-500 hover:text-white transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

          {/* ═══════════ TAB 3: TENANTS (SUPER ADMIN ONLY) ═══════════ */}
          {activeTab === 'tenants' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Şirkət və Filiallar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Yalnız Super Admin yeni şirkət/səhifə yarada və şirkət admini təyin edə bilər
                  </p>
                </div>
                <button
                  onClick={() => setIsTenantModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Şirkət / Səhifə Əlavə Et</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map(t => (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden relative flex flex-col justify-between shadow-sm transition-colors group"
                  >
                    <div>
                      {/* Company Cover Banner */}
                      {t.coverImage ? (
                        <div className="h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={t.coverImage}
                            alt={`${t.name} banner`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 right-3 z-10">
                            <button
                              onClick={() => handleToggleTenantStatus(t)}
                              className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${
                                t.status === 'ACTIVE'
                                  ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600'
                                  : 'bg-rose-500/90 text-white border-rose-400 hover:bg-rose-600'
                              }`}
                            >
                              {t.status === 'ACTIVE' ? 'Aktiv' : 'Dayandırılıb'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 relative p-3 flex justify-end items-start border-b border-slate-100 dark:border-white/5">
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
                      )}

                      <div className="p-5">
                        {/* Company Logo & Sector Header */}
                        <div className="flex items-center gap-3 mb-3">
                          {t.logo ? (
                            <img
                              src={t.logo}
                              alt={`${t.name} logo`}
                              className={`w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-md shrink-0 bg-white dark:bg-slate-800 ${t.coverImage ? '-mt-9 z-10' : ''}`}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0 ${t.coverImage ? '-mt-8 z-10 bg-white dark:bg-slate-800' : ''}`}>
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}

                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                            {t.sector}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.name}</h4>
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3">Slug: /{t.slug}</p>

                      {/* Assigned Admin user badge */}
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                          Təyin Edilmiş Admin User:
                        </div>
                        {(t as any).assignedAdmin ? (
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{(t as any).assignedAdmin.fullName} (@{(t as any).assignedAdmin.username})</span>
                          </div>
                        ) : (
                          <div className="text-amber-600 dark:text-amber-400 font-medium">
                            Təyin edilməyib
                          </div>
                        )}
                      </div>

                      {/* Assigned Editor badge */}
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                          Filial Redaktoru (Maks. 1):
                        </div>
                        {(t as any).assignedEditor ? (
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{(t as any).assignedEditor.fullName} (@{(t as any).assignedEditor.username})</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 font-normal">
                            Redaktor təyin edilməyib
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {t.phone && <p>Tel: {t.phone}</p>}
                        {t.address && <p>Ünvan: {t.address}</p>}
                        <div className="pt-1 flex items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              t.medicalEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t.medicalEnabled ? 'Tibbi Modul: Aktiv (FİN)' : 'Tibbi Modul: Yoxdur'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <Link
                        href={`/${t.slug}`}
                        target="_blank"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <span>İctimai Səhifə</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditTenant(t)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold px-2.5 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all flex items-center gap-1 border border-indigo-200 dark:border-indigo-500/30"
                          title="Şirkət və filialı redaktə et"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Redaktə Et</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTenant(t.id, t.name)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-semibold p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ TAB 4: USERS MANAGEMENT (FULL FEATURES: EDIT, BLOCK, EXCEL) ═══════════ */}
          {activeTab === 'users' && (
            <UsersManagementTab
              users={usersList}
              tenants={tenants}
              currentUser={currentUser}
              onRefresh={() => loadUsers()}
              showToast={showToast}
            />
          )}

          {/* ═══════════ TAB 5: EDITOR MANAGEMENT (COMPANY ADMIN ONLY) ═══════════ */}
          {activeTab === 'editor' && isCompanyAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Şirkət Redaktorunun İdarə Edilməsi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser?.tenantName} üçün redaktor təyini. Qaydaya əsasən şirkət üzrə <b>yalnız 1 redaktor</b> əlavə edilə bilər.
                </p>
              </div>

              {currentCompanyEditor ? (
                /* Card showing the 1 existing editor */
                <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>Şirkətiniz üzrə 1 nəfər rəsmi Redaktor təyin edilib:</span>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{currentCompanyEditor.fullName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                          Aktiv Redaktor
                        </span>
                      </div>
                      <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        İstifadəçi adı: @{currentCompanyEditor.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Şirkət: <b>{currentUser?.tenantName}</b> • Təyin edilib: {new Date(currentCompanyEditor.createdAt).toLocaleDateString('az-AZ')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(currentCompanyEditor.id, currentCompanyEditor.fullName)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 self-start md:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Redaktoru Ləğv Et (Sil)</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Sistem Məhdudiyyəti: </span>
                      Şirkət üzrə eyni vaxtda yalnız 1 redaktor ola bilər. Başqa bir şəxsi redaktor təyin etmək istəyirsinizsə, əvvəlcə yuxarıdakı mövcud redaktoru silməlisiniz.
                    </div>
                  </div>
                </div>
              ) : (
                /* Form to create the single allowed editor */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
                    <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Yeni Redaktor Təyini: </span>
                      Hazırda şirkətiniz üçün heç bir redaktor təyin edilməyib. Aşağıdakı formadan istifadə edərək şirkətiniz üzrə 1 nəfər səlahiyyətli redaktor əlavə edə bilərsiniz.
                    </div>
                  </div>

                  <form onSubmit={handleCreateEditor} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Redaktorun Tam Adı (Ad və Soyad)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="məs. Aytən Qasımova"
                        value={newEditorData.fullName}
                        onChange={(e) => setNewEditorData({ ...newEditorData, fullName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        İstifadəçi Adı (Giriş üçün)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="məs. editor_brend"
                        value={newEditorData.username}
                        onChange={(e) => setNewEditorData({ ...newEditorData, username: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Şifrə
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newEditorData.password}
                        onChange={(e) => setNewEditorData({ ...newEditorData, password: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>1 Nəfər Redaktor Təyin Et</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB 6: SERVICES MANAGEMENT (FULL FEATURES) ═══════════ */}
          {activeTab === 'services' && (
            <ServicesManagementTab
              services={services}
              tenants={tenants}
              currentUser={currentUser}
              sectorInfo={sectorInfo}
              onRefresh={() => loadData()}
              showToast={showToast}
            />
          )}

          {/* ═══════════ TAB: QUALITY & REVIEWS (XİDMƏT KEYFİYYƏTİ) ═══════════ */}
          {activeTab === 'quality' && (
            <QualityReviewsTab
              reviews={reviews}
              tenants={tenants}
              currentUser={currentUser}
              onDeleteReview={handleDeleteReview}
              showToast={showToast}
            />
          )}

          {/* ═══════════ TAB: FEEDBACKS & SUGGESTIONS (RƏY VƏ TƏKLİFLƏR) ═══════════ */}
          {activeTab === 'feedbacks' && (
            <FeedbacksTab
              feedbacks={feedbacks}
              tenants={tenants}
              currentUser={currentUser}
              onRefresh={() => loadData()}
              showToast={showToast}
            />
          )}

          {/* ═══════════ TAB 7: STAFF ═══════════ */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">İşçi Heyəti və Mütəxəssislər</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Xidməti icra edən həkim, usta və mütəxəssislər
                  </p>
                </div>
                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni İşçi Əlavə Et</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {staffList.map(st => (
                  <div
                    key={st.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3">
                        {st.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</h4>
                      {/* Slot Duration / Interval Badge */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Vaxt Aralığı:</span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {st.slotDuration ? (st.slotDuration >= 60 ? `${st.slotDuration % 60 === 0 ? st.slotDuration / 60 : (st.slotDuration / 60).toFixed(1)} saat (${st.slotDuration} dəq)` : `${st.slotDuration} dəq`) : 'Xidmət standartı'}
                        </span>
                      </div>

                      {/* Requirement 4: Show Assigned Services */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                          Təhkim Olunan Xidmətlər:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {st.serviceIds && st.serviceIds.length > 0 ? (
                            st.serviceIds.map(sId => {
                              const srv = services.find(s => s.id === sId);
                              return srv ? (
                                <span
                                  key={sId}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
                                >
                                  {srv.nameAz}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Bütün xidmətlər (Məhdudiyyətsiz)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditStaffData({
                            id: st.id,
                            name: st.name,
                            role: st.role,
                            tenantId: st.tenantId,
                            serviceIds: st.serviceIds || [],
                            slotDuration: st.slotDuration
                          });
                          setIsEditStaffModalOpen(true);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs font-semibold p-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all flex items-center gap-1"
                        title="Mütəxəssisi və xidmətləri redaktə et"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Redaktə Et</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(st.id)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-semibold p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ TAB 8: MEDICAL ═══════════ */}
          {activeTab === 'medical' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tibbi Qeydiyyat və FİN Xəstəlik Tarixçəsi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Osteopatiya, klinika və tibb mərkəzləri üçün pasiyent kartları və diaqnoz jurnalı
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pasiyentlər</h4>
                      <p className="text-[11px] text-slate-400">
                        Cəmi: {patients.filter(p => {
                          if (!patientSearch.trim()) return true;
                          const t = patientSearch.toLowerCase().trim();
                          return p.fullName.toLowerCase().includes(t) || p.fin.toLowerCase().includes(t) || (p.phone && p.phone.toLowerCase().includes(t));
                        }).length}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewPatientData({
                          tenantId: currentUser?.tenantId || tenants[0]?.id || '',
                          fullName: '',
                          fin: '',
                          phone: '+994 ',
                          birthDate: '',
                          bloodGroup: 'I (O) Rh+',
                          allergies: '',
                          notes: ''
                        });
                        setIsPatientModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Pasiyent</span>
                    </button>
                  </div>

                  {/* Search Pasiyent */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ad, FİN və ya Tel ilə axtar..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {patients
                      .filter(p => {
                        if (!patientSearch.trim()) return true;
                        const t = patientSearch.toLowerCase().trim();
                        return p.fullName.toLowerCase().includes(t) || p.fin.toLowerCase().includes(t) || (p.phone && p.phone.toLowerCase().includes(t));
                      })
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPatientForEncounter(p)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedPatientForEncounter?.id === p.id
                              ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{p.fullName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">FİN: {p.fin}</span>
                            {p.phone && <span className="text-[10px] text-slate-400 font-normal">{p.phone}</span>}
                          </div>
                          {p.bloodGroup && (
                            <div className="text-[10px] text-rose-500 font-medium mt-0.5">Qan: {p.bloodGroup}</div>
                          )}
                        </button>
                      ))}
                    {patients.filter(p => {
                      if (!patientSearch.trim()) return true;
                      const t = patientSearch.toLowerCase().trim();
                      return p.fullName.toLowerCase().includes(t) || p.fin.toLowerCase().includes(t) || (p.phone && p.phone.toLowerCase().includes(t));
                    }).length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400">
                        {patientSearch ? 'Axtarışa uyğun pasiyent tapılmadı' : 'Hələ heç bir pasiyent əlavə edilməyib'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Medical History & Actions */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                  {selectedPatientForEncounter ? (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {selectedPatientForEncounter.fullName}
                            </h4>
                            {selectedPatientForEncounter.bloodGroup && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                                {selectedPatientForEncounter.bloodGroup}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">FİN: {selectedPatientForEncounter.fin}</span>
                            {selectedPatientForEncounter.phone && <span>• Tel: {selectedPatientForEncounter.phone}</span>}
                            {selectedPatientForEncounter.birthDate && <span>• Doğum: {selectedPatientForEncounter.birthDate}</span>}
                          </div>
                          {selectedPatientForEncounter.allergies && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                              ⚠️ Allergiya: {selectedPatientForEncounter.allergies}
                            </div>
                          )}
                          {selectedPatientForEncounter.notes && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                              Qeyd: {selectedPatientForEncounter.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleOpenEditPatient(selectedPatientForEncounter)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-all"
                            title="Pasiyent məlumatlarını redaktə et"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Redaktə</span>
                          </button>
                          <button
                            onClick={() => handleDeletePatient(selectedPatientForEncounter.id, selectedPatientForEncounter.fullName)}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                            title="Pasiyent kartını sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                          <button
                            onClick={() => setIsEncounterModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Diaqnoz və Baxış</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Tibbi Baxış və Diaqnoz Tarixçəsi
                        </h5>
                        {(selectedPatientForEncounter.encounters || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Heç bir diaqnoz və ya baxış qeyd edilməyib.</p>
                        ) : (
                          (selectedPatientForEncounter.encounters || []).map((enc: any) => (
                            <div
                              key={enc.id}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 space-y-1.5 text-xs"
                            >
                              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>Həkim: <b className="text-slate-800 dark:text-slate-200">{enc.doctorName}</b></span>
                                <span>{new Date(enc.encounterDate).toLocaleDateString('az-AZ')}</span>
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                Diaqnoz: <span className="text-indigo-600 dark:text-indigo-400">{enc.diagnosis}</span>
                              </div>
                              <div className="text-slate-600 dark:text-slate-300">
                                <b>Müalicə planı:</b> {enc.treatment}
                              </div>
                              {enc.prescription && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                                  Resept: {enc.prescription}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-400">
                      Ətraflı tibbi kart və diaqnoz tarixçəsini görmək üçün soldakı siyahıdan bir pasiyent seçin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 9: SETTINGS ═══════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isSuperAdmin ? 'Sistem Parametrləri' : 'Şirkət və Səhifə Tənzimləmələri'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isSuperAdmin
                    ? 'RezervasiyaPro platformasının qlobal tənzimləmələri'
                    : 'Öz şirkətinizin məlumatlarını və funksiyalarını idarə edin'}
                </p>
              </div>

              {/* Company Admin Settings Form */}
              {isCompanyAdmin && (
                <form
                  onSubmit={handleSaveCompanySettings}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Şirkət Rekvizitləri</h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Şirkətin Rəsmi Adı
                    </label>
                    <input
                      type="text"
                      required
                      value={companySettingsData.name}
                      onChange={(e) => setCompanySettingsData({ ...companySettingsData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Əlaqə Nömrəsi
                      </label>
                      <input
                        type="tel"
                        value={companySettingsData.phone}
                        onChange={(e) => setCompanySettingsData({ ...companySettingsData, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Sektor
                      </label>
                      <select
                        value={companySettingsData.sector}
                        onChange={(e) => setCompanySettingsData({ ...companySettingsData, sector: e.target.value })}
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ünvan
                    </label>
                    <input
                      type="text"
                      value={companySettingsData.address}
                      onChange={(e) => setCompanySettingsData({ ...companySettingsData, address: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compMedEnabled"
                      checked={companySettingsData.medicalEnabled}
                      onChange={(e) => setCompanySettingsData({ ...companySettingsData, medicalEnabled: e.target.checked })}
                      className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor="compMedEnabled" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                      Tibbi Modul Aktiv Olsun (FİN ilə pasiyent bazası)
                    </label>
                  </div>

                  {/* ─── SOSİAL MEDİA VƏ ƏLAQƏ LOGOLARI ─── */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-3">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Sosial Media & Əlaqə Linkləri (Rezervasiya Səhifəsində Görünür)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          WhatsApp Nömrəsi və ya Linki
                        </label>
                        <input
                          type="text"
                          placeholder="məs. +994 50 700 80 90"
                          value={companySettingsData.whatsapp}
                          onChange={(e) => setCompanySettingsData({ ...companySettingsData, whatsapp: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Instagram İstifadəçi Adı və ya Linki
                        </label>
                        <input
                          type="text"
                          placeholder="məs. osteopat.az"
                          value={companySettingsData.instagram}
                          onChange={(e) => setCompanySettingsData({ ...companySettingsData, instagram: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Facebook Səhifəsi
                        </label>
                        <input
                          type="text"
                          placeholder="məs. osteopat.az"
                          value={companySettingsData.facebook}
                          onChange={(e) => setCompanySettingsData({ ...companySettingsData, facebook: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          TikTok Profili
                        </label>
                        <input
                          type="text"
                          placeholder="məs. @osteopat.az"
                          value={companySettingsData.tiktok}
                          onChange={(e) => setCompanySettingsData({ ...companySettingsData, tiktok: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Telegram Kanalı / Linki
                        </label>
                        <input
                          type="text"
                          placeholder="məs. osteopat_az"
                          value={companySettingsData.telegram}
                          onChange={(e) => setCompanySettingsData({ ...companySettingsData, telegram: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─── YUXARI PANEL ÖRTÜK ŞƏKLİ (COVER BANNER) ─── */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Yuxarı Panel Şəkli (Örtük Banneri)</span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        Maks. 1024 KB (1 MB)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                      <span>📐 Maks. Ölçü: <b>1920 × 1080 px</b></span>
                      <span>•</span>
                      <span>Tövsiyə olunan format: <b>1200 × 400 px</b></span>
                    </div>

                    {companyImageError.cover && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{companyImageError.cover}</span>
                      </div>
                    )}

                    {companySettingsData.coverImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 h-36 group">
                        <img
                          src={companySettingsData.coverImage}
                          alt="Şirkət örtük şəkli"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCompanySettingsData({ ...companySettingsData, coverImage: '' })}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Şəkli Sil</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-center">
                        <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Yuxarı Panel üçün Örtük Şəkli Seçin</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP • Maks. 1024 KB & 1920x1080 px</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleValidateAndUploadImage(
                                file,
                                'cover',
                                (dataUrl) => setCompanySettingsData(prev => ({ ...prev, coverImage: dataUrl })),
                                (err) => setCompanyImageError(prev => ({ ...prev, cover: err }))
                              );
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* ─── SOL TƏRƏF LOQOSU (LOGO) ─── */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Sol Tərəf Loqosu (Logo)</span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        Maks. 512 KB
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                      <span>📐 Maks. Ölçü: <b>800 × 800 px</b></span>
                      <span>•</span>
                      <span>Tövsiyə olunan format: <b>400 × 400 px kvadrat</b></span>
                    </div>

                    {companyImageError.logo && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{companyImageError.logo}</span>
                      </div>
                    )}

                    {companySettingsData.logo ? (
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 shrink-0 shadow-md">
                          <img
                            src={companySettingsData.logo}
                            alt="Şirkət loqosu"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setCompanySettingsData({ ...companySettingsData, logo: '' })}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-500 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Loqonu Sil</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 p-3.5 border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sol Tərəf üçün Loqo Seçin</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP • Maks. 512 KB & 800x800 px</div>
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleValidateAndUploadImage(
                                file,
                                'logo',
                                (dataUrl) => setCompanySettingsData(prev => ({ ...prev, logo: dataUrl })),
                                (err) => setCompanyImageError(prev => ({ ...prev, logo: err }))
                              );
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Şirkət Məlumatlarını Yadda Saxla</span>
                  </button>
                </form>
              )}

              {/* Super Admin Reset Demo Data Section */}
              {isSuperAdmin && (
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
              )}
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
              {isSuperAdmin && (
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Müştərinin Adı * (Yalnız hərflər)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ad və Soyad"
                    value={newBookingData.customerName}
                    onChange={(e) => setNewBookingData({ 
                      ...newBookingData, 
                      customerName: e.target.value.replace(/[^a-zA-Z\səıöğçşƏIİÖĞÇŞ'-]/g, '') 
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobil Nömrə * (Yalnız rəqəmlər)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+994 50 000 00 00"
                    value={newBookingData.customerPhone}
                    onChange={(e) => setNewBookingData({ 
                      ...newBookingData, 
                      customerPhone: e.target.value.replace(/[^\d+\s()-]/g, '') 
                    })}
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
                    onChange={(e) => {
                      const sId = e.target.value;
                      const targetTenant = isSuperAdmin ? newBookingData.tenantId : currentUser?.tenantId;
                      const matchingStaff = staffList.filter(st => {
                        if (targetTenant && st.tenantId !== targetTenant) return false;
                        return !st.serviceIds || st.serviceIds.length === 0 || st.serviceIds.includes(sId);
                      });
                      setNewBookingData({
                        ...newBookingData,
                        serviceId: sId,
                        staffId: matchingStaff.some(st => st.id === newBookingData.staffId) 
                          ? newBookingData.staffId 
                          : (matchingStaff[0]?.id || '')
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">-- Xidmət seçin --</option>
                    {services
                      .filter(s => isSuperAdmin ? s.tenantId === newBookingData.tenantId : true)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.nameAz} ({s.price} ₼)</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mütəxəssis (Xidmətə uyğun)
                  </label>
                  {(() => {
                    const targetTenant = isSuperAdmin ? newBookingData.tenantId : currentUser?.tenantId;
                    const matchingStaff = staffList.filter(st => {
                      if (targetTenant && st.tenantId !== targetTenant) return false;
                      if (newBookingData.serviceId && st.serviceIds && st.serviceIds.length > 0) {
                        return st.serviceIds.includes(newBookingData.serviceId);
                      }
                      return true;
                    });

                    return (
                      <>
                        <select
                          value={newBookingData.staffId}
                          onChange={(e) => setNewBookingData({ ...newBookingData, staffId: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                          required
                        >
                          <option value="">-- Mütəxəssis seçin --</option>
                          {matchingStaff.map(st => (
                            <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                          ))}
                        </select>
                        {newBookingData.serviceId && matchingStaff.length === 0 && (
                          <p className="text-[10px] text-amber-500 mt-1">
                            ⚠️ Bu xidmət üzrə mütəxəssis təhkim edilməyib.
                          </p>
                        )}
                      </>
                    );
                  })()}
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
                  {(() => {
                    const selSrv = services.find(s => s.id === newBookingData.serviceId);
                    const selStf = staffList.find(st => st.id === newBookingData.staffId);
                    const activeInt = (selStf?.slotDuration && selStf.slotDuration > 0) ? selStf.slotDuration : (selSrv?.duration || 30);
                    const dynamicSlots: string[] = [];
                    for (let m = 8 * 60; m <= 23 * 60; m += activeInt) {
                      const hh = String(Math.floor(m / 60)).padStart(2, '0');
                      const mm = String(m % 60).padStart(2, '0');
                      dynamicSlots.push(`${hh}:${mm}`);
                    }
                    const intLabel = activeInt >= 60 ? (activeInt % 60 === 0 ? `${activeInt / 60} saat` : `${(activeInt / 60).toFixed(1)} saat`) : `${activeInt} dəq`;

                    return (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Vaxt ({intLabel})
                          </label>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded">
                            24 Saatlıq
                          </span>
                        </div>
                        <select
                          required
                          value={newBookingData.timeSlot}
                          onChange={(e) => setNewBookingData({ ...newBookingData, timeSlot: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                        >
                          {dynamicSlots.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </>
                    );
                  })()}
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
                  Rezervasiyanı Təsdiqlə
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 2: NEW TENANT (SUPER ADMIN ONLY) ═══════════ */}
      {isTenantModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Şirkət / Filial Yarat</h3>
              <button onClick={() => setIsTenantModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müəssisə / Şirkət Adı</label>
                <input
                  type="text"
                  required
                  placeholder="məs. Elite Estetik Mərkəzi"
                  value={newTenantData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const slugVal = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                    setNewTenantData({ ...newTenantData, name: val, slug: slugVal });
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

              {/* Requirement 3: Super Admin can assign this new company to an Admin user */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cavabdeh Şirkət Admini Təyin Et (İstəyə bağlı)
                </label>
                <select
                  value={newTenantData.assignedAdminId}
                  onChange={(e) => setNewTenantData({ ...newTenantData, assignedAdminId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- Təyin edilməsin (Sonra istifadəçilərdən təyin et) --</option>
                  {usersList.filter(u => u.role === 'ADMIN').map(adminUser => (
                    <option key={adminUser.id} value={adminUser.id}>
                      {adminUser.fullName} (@{adminUser.username}) {adminUser.tenantName ? `[${adminUser.tenantName}]` : '[Təyin edilməyib]'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Seçilmiş istifadəçi bu yeni filialın tam inzibatçısı olacaq.
                </p>
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

              {/* ─── SOSİAL MEDİA VƏ ƏLAQƏ LOGOLARI ─── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-2.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Sosial Media & Əlaqə Linkləri</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      WhatsApp Nömrəsi
                    </label>
                    <input
                      type="text"
                      placeholder="məs. +994 50 700 80 90"
                      value={newTenantData.whatsapp}
                      onChange={(e) => setNewTenantData({ ...newTenantData, whatsapp: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Instagram İstifadəçi Adı
                    </label>
                    <input
                      type="text"
                      placeholder="məs. osteopat.az"
                      value={newTenantData.instagram}
                      onChange={(e) => setNewTenantData({ ...newTenantData, instagram: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Facebook Səhifəsi
                    </label>
                    <input
                      type="text"
                      placeholder="məs. osteopat.az"
                      value={newTenantData.facebook}
                      onChange={(e) => setNewTenantData({ ...newTenantData, facebook: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      TikTok Profili
                    </label>
                    <input
                      type="text"
                      placeholder="məs. @osteopat.az"
                      value={newTenantData.tiktok}
                      onChange={(e) => setNewTenantData({ ...newTenantData, tiktok: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Telegram Kanalı
                    </label>
                    <input
                      type="text"
                      placeholder="məs. osteopat_az"
                      value={newTenantData.telegram}
                      onChange={(e) => setNewTenantData({ ...newTenantData, telegram: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ─── YUXARI PANEL ÖRTÜK ŞƏKLİ (COVER BANNER) ─── */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Yuxarı Panel Şəkli (Örtük Banneri)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Maks. 1024 KB (1 MB)
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                  <span>📐 Maks. Ölçü: <b>1920 × 1080 px</b></span>
                  <span>•</span>
                  <span>Tövsiyə olunan format: <b>1200 × 400 px</b></span>
                </div>

                {tenantImageError.cover && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{tenantImageError.cover}</span>
                  </div>
                )}

                {newTenantData.coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 h-32 group">
                    <img
                      src={newTenantData.coverImage}
                      alt="Örtük önizləməsi"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTenantData({ ...newTenantData, coverImage: '' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Şəkli Sil</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-center">
                    <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Yuxarı Panel üçün Örtük Şəkli Seçin</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP • Maks. 1024 KB & 1920x1080 px</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleValidateAndUploadImage(
                            file,
                            'cover',
                            (dataUrl) => setNewTenantData(prev => ({ ...prev, coverImage: dataUrl })),
                            (err) => setTenantImageError(prev => ({ ...prev, cover: err }))
                          );
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* ─── SOL TƏRƏF LOQOSU (LOGO) ─── */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Sol Tərəf Loqosu (Logo)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Maks. 512 KB
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                  <span>📐 Maks. Ölçü: <b>800 × 800 px</b></span>
                  <span>•</span>
                  <span>Tövsiyə olunan format: <b>400 × 400 px kvadrat</b></span>
                </div>

                {tenantImageError.logo && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{tenantImageError.logo}</span>
                  </div>
                )}

                {newTenantData.logo ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 shrink-0 shadow-md">
                      <img
                        src={newTenantData.logo}
                        alt="Loqo önizləməsi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTenantData({ ...newTenantData, logo: '' })}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-500 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Loqonu Sil</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sol Tərəf üçün Loqo Seçin</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP • Maks. 512 KB & 800x800 px</div>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleValidateAndUploadImage(
                            file,
                            'logo',
                            (dataUrl) => setNewTenantData(prev => ({ ...prev, logo: dataUrl })),
                            (err) => setTenantImageError(prev => ({ ...prev, logo: err }))
                          );
                        }
                      }}
                    />
                  </label>
                )}
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

      {/* ═══════════ MODAL: EDIT TENANT / COMPANY (SUPER ADMIN) ═══════════ */}
      {isEditTenantModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Şirkət / Filialı Redaktə Et</h3>
                <p className="text-xs text-slate-500">Super Admin hüququ ilə şirkət məlumatlarının tam yenilənməsi</p>
              </div>
              <button onClick={() => setIsEditTenantModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müəssisə / Şirkət Adı</label>
                <input
                  type="text"
                  required
                  value={editTenantData.name}
                  onChange={(e) => setEditTenantData({ ...editTenantData, name: e.target.value })}
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
                    value={editTenantData.slug}
                    onChange={(e) => setEditTenantData({ ...editTenantData, slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-') })}
                    className="w-full bg-transparent text-indigo-600 dark:text-indigo-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Assigned Admin user */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cavabdeh Şirkət Admini Təyin Et / Dəyişdir
                </label>
                <select
                  value={editTenantData.assignedAdminId}
                  onChange={(e) => setEditTenantData({ ...editTenantData, assignedAdminId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- Təyin edilməsin --</option>
                  {usersList.filter(u => u.role === 'ADMIN').map(adminUser => (
                    <option key={adminUser.id} value={adminUser.id}>
                      {adminUser.fullName} (@{adminUser.username}) {adminUser.tenantId === editTenantData.id ? '✓ [Hazırkı Admin]' : adminUser.tenantName ? `[${adminUser.tenantName}]` : '[Təyin edilməyib]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sektor / Kateqoriya</label>
                <select
                  value={editTenantData.sector}
                  onChange={(e) => setEditTenantData({ ...editTenantData, sector: e.target.value })}
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
                    value={editTenantData.phone}
                    onChange={(e) => setEditTenantData({ ...editTenantData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ünvan</label>
                  <input
                    type="text"
                    value={editTenantData.address}
                    onChange={(e) => setEditTenantData({ ...editTenantData, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editMedEnabled"
                  checked={editTenantData.medicalEnabled}
                  onChange={(e) => setEditTenantData({ ...editTenantData, medicalEnabled: e.target.checked })}
                  className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="editMedEnabled" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">
                  Tibbi Modul Aktiv Olsun (FİN ilə pasiyent bazası)
                </label>
              </div>

              {/* ─── SOSİAL MEDİA VƏ ƏLAQƏ LOGOLARI ─── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-2.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Sosial Media & Əlaqə Linkləri</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">WhatsApp Nömrəsi</label>
                    <input
                      type="text"
                      placeholder="məs. +994 50 700 80 90"
                      value={editTenantData.whatsapp}
                      onChange={(e) => setEditTenantData({ ...editTenantData, whatsapp: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Instagram (@istifadəçi)</label>
                    <input
                      type="text"
                      placeholder="məs. @clinic_baku"
                      value={editTenantData.instagram}
                      onChange={(e) => setEditTenantData({ ...editTenantData, instagram: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Facebook Səhifəsi</label>
                    <input
                      type="text"
                      placeholder="məs. clinicbaku"
                      value={editTenantData.facebook}
                      onChange={(e) => setEditTenantData({ ...editTenantData, facebook: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">TikTok Profili</label>
                    <input
                      type="text"
                      placeholder="məs. @clinicbaku"
                      value={editTenantData.tiktok}
                      onChange={(e) => setEditTenantData({ ...editTenantData, tiktok: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ─── ŞƏKİL VƏ LOQO YÜKLƏNMƏSİ ─── */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-500/20 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Şirkət Şəkilləri (Maks 800KB Örtük, 400KB Loqo)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Örtük Banner Şəkli</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleValidateAndUploadImage(
                            file,
                            'cover',
                            (url) => {
                              setEditTenantData(prev => ({ ...prev, coverImage: url }));
                              setEditTenantImageError(prev => ({ ...prev, cover: undefined }));
                            },
                            (err) => setEditTenantImageError(prev => ({ ...prev, cover: err }))
                          );
                        }
                      }}
                      className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                    {editTenantImageError.cover && (
                      <p className="text-[10px] text-rose-500 mt-1">{editTenantImageError.cover}</p>
                    )}
                    {editTenantData.coverImage && (
                      <div className="mt-2 h-16 w-full rounded-lg overflow-hidden border">
                        <img src={editTenantData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Loqo Şəkli</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleValidateAndUploadImage(
                            file,
                            'logo',
                            (url) => {
                              setEditTenantData(prev => ({ ...prev, logo: url }));
                              setEditTenantImageError(prev => ({ ...prev, logo: undefined }));
                            },
                            (err) => setEditTenantImageError(prev => ({ ...prev, logo: err }))
                          );
                        }
                      }}
                      className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                    {editTenantImageError.logo && (
                      <p className="text-[10px] text-rose-500 mt-1">{editTenantImageError.logo}</p>
                    )}
                    {editTenantData.logo && (
                      <div className="mt-2 h-16 w-16 rounded-lg overflow-hidden border">
                        <img src={editTenantData.logo} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Dəyişiklikləri Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 3: NEW USER (SUPER ADMIN ONLY) ═══════════ */}
      {isUserModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yeni İstifadəçi Əlavə Et</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad və Soyad
                </label>
                <input
                  type="text"
                  required
                  placeholder="məs. Rəşad Quliyev"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  İstifadəçi Adı (Giriş üçün)
                </label>
                <input
                  type="text"
                  required
                  placeholder="məs. admin_filial"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Şifrə
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  İstifadəçi Rolu
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="ADMIN">Şirkət Admini (ADMIN)</option>
                  <option value="SUPER_ADMIN">Super Administrator (SUPER_ADMIN)</option>
                  <option value="EDITOR">Filial Redaktoru (EDITOR)</option>
                </select>
              </div>

              {newUserData.role !== 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Təyin Ediləcək Şirkət / Filial
                  </label>
                  <select
                    value={newUserData.tenantId}
                    onChange={(e) => setNewUserData({ ...newUserData, tenantId: e.target.value })}
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
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  İstifadəçini Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 4: NEW SERVICE ═══════════ */}
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
              {isSuperAdmin && (
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
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Xidmətin Adı (AZ)</label>
                <input
                  type="text"
                  required
                  placeholder="məs. Üz Təmizlənməsi və Baxım"
                  value={newServiceData.nameAz}
                  onChange={(e) => setNewServiceData({ ...newServiceData, nameAz: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Xidmətin Adı (EN)</label>
                <input
                  type="text"
                  placeholder="məs. Facial Cleansing"
                  value={newServiceData.nameEn}
                  onChange={(e) => setNewServiceData({ ...newServiceData, nameEn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qiymət (AZN)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newServiceData.price}
                    onChange={(e) => setNewServiceData({ ...newServiceData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Müddət (dəq)</label>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {newServiceData.duration >= 60 ? `${Math.floor(newServiceData.duration / 60)} saat ${newServiceData.duration % 60 ? (newServiceData.duration % 60) + ' dəq' : ''}` : `${newServiceData.duration} dəq`}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={5}
                    value={newServiceData.duration}
                    onChange={(e) => setNewServiceData({ ...newServiceData, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: '30 dəq', value: 30 },
                      { label: '45 dəq', value: 45 },
                      { label: '1 saat', value: 60 },
                      { label: '1.5 saat', value: 90 },
                      { label: '2 saat', value: 120 }
                    ].map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setNewServiceData({ ...newServiceData, duration: p.value })}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          newServiceData.duration === p.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kateqoriya</label>
                <input
                  type="text"
                  placeholder="məs. Dəri qulluğu"
                  value={newServiceData.category}
                  onChange={(e) => setNewServiceData({ ...newServiceData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
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
                  Xidməti Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 5: NEW STAFF ═══════════ */}
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
              {isSuperAdmin && (
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
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad və Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="məs. Dr. Nərgiz Məmmədova"
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
                  placeholder="məs. Kosmetoloq-Dermatoloq"
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Təhkim Olunan Xidmətlər *</span>
                  <span className="text-[10px] text-slate-400">({newStaffData.serviceIds.length} seçilib)</span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 space-y-1.5">
                  {services
                    .filter(s => (isSuperAdmin ? (newStaffData.tenantId ? s.tenantId === newStaffData.tenantId : true) : s.tenantId === currentUser?.tenantId))
                    .map(srv => {
                      const isChecked = newStaffData.serviceIds.includes(srv.id);
                      return (
                        <label
                          key={srv.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewStaffData({ ...newStaffData, serviceIds: [...newStaffData.serviceIds, srv.id] });
                              } else {
                                setNewStaffData({ ...newStaffData, serviceIds: newStaffData.serviceIds.filter(id => id !== srv.id) });
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{srv.nameAz}</span>
                          <span className="text-[10px] text-slate-400 ml-auto font-mono">{srv.price} ₼</span>
                        </label>
                      );
                    })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mütəxəssis rezervasiya zamanı yalnız seçilmiş bu xidmətlər üzrə görünəcək.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Rezervasiya Vaxt Aralığı</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {newStaffData.slotDuration ? (newStaffData.slotDuration >= 60 ? `${newStaffData.slotDuration % 60 === 0 ? newStaffData.slotDuration / 60 : (newStaffData.slotDuration / 60).toFixed(1)} saat (${newStaffData.slotDuration} dəq)` : `${newStaffData.slotDuration} dəq`) : 'Xidmət standartı'}
                  </span>
                </label>
                <select
                  value={newStaffData.slotDuration || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNewStaffData({ ...newStaffData, slotDuration: val > 0 ? val : undefined });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value={0}>Avtomatik (Hər xidmətin öz təyin edilmiş vaxtı)</option>
                  <option value={15}>15 dəqiqə</option>
                  <option value={30}>30 dəqiqə</option>
                  <option value={45}>45 dəqiqə</option>
                  <option value={60}>1 saat (60 dəqiqə)</option>
                  <option value={90}>1.5 saat (90 dəqiqə)</option>
                  <option value={120}>2 saat (120 dəqiqə)</option>
                  <option value={180}>3 saat (180 dəqiqə)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mütəxəssis üçün fərdi interval təyin edə və ya hər xidmətin öz standart müddətini seçə bilərsiniz.
                </p>
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
                  Mütəxəssisi Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT STAFF & SERVICES ═══════════ */}
      {isEditStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>Mütəxəssisi Redaktə Et</span>
              </h3>
              <button onClick={() => setIsEditStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad və Soyad</label>
                <input
                  type="text"
                  required
                  value={editStaffData.name}
                  onChange={(e) => setEditStaffData({ ...editStaffData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vəzifə / İxtisas</label>
                <input
                  type="text"
                  required
                  value={editStaffData.role}
                  onChange={(e) => setEditStaffData({ ...editStaffData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Təhkim Olunan Xidmətlər *</span>
                  <span className="text-[10px] text-slate-400">({editStaffData.serviceIds.length} seçilib)</span>
                </label>
                <div className="max-h-40 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 space-y-1.5">
                  {services
                    .filter(s => s.tenantId === editStaffData.tenantId)
                    .map(srv => {
                      const isChecked = editStaffData.serviceIds.includes(srv.id);
                      return (
                        <label
                          key={srv.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditStaffData({ ...editStaffData, serviceIds: [...editStaffData.serviceIds, srv.id] });
                              } else {
                                setEditStaffData({ ...editStaffData, serviceIds: editStaffData.serviceIds.filter(id => id !== srv.id) });
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{srv.nameAz}</span>
                          <span className="text-[10px] text-slate-400 ml-auto font-mono">{srv.price} ₼</span>
                        </label>
                      );
                    })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mütəxəssis rezervasiya zamanı yalnız seçilmiş bu xidmətlər üzrə görünəcək.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Fərdi Rezervasiya Vaxt Aralığı</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {editStaffData.slotDuration ? (editStaffData.slotDuration >= 60 ? `${editStaffData.slotDuration % 60 === 0 ? editStaffData.slotDuration / 60 : (editStaffData.slotDuration / 60).toFixed(1)} saat (${editStaffData.slotDuration} dəq)` : `${editStaffData.slotDuration} dəq`) : 'Xidmət standartı'}
                  </span>
                </label>
                <select
                  value={editStaffData.slotDuration || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditStaffData({ ...editStaffData, slotDuration: val > 0 ? val : undefined });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value={0}>Avtomatik (Hər xidmətin öz təyin edilmiş vaxtı)</option>
                  <option value={15}>15 dəqiqə</option>
                  <option value={30}>30 dəqiqə</option>
                  <option value={45}>45 dəqiqə</option>
                  <option value={60}>1 saat (60 dəqiqə)</option>
                  <option value={90}>1.5 saat (90 dəqiqə)</option>
                  <option value={120}>2 saat (120 dəqiqə)</option>
                  <option value={180}>3 saat (180 dəqiqə)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mütəxəssis üçün fərdi interval təyin edə və ya hər xidmətin öz standart müddətini seçə bilərsiniz.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 6: MEDICAL ENCOUNTER ═══════════ */}
      {isEncounterModalOpen && selectedPatientForEncounter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tibbi Baxış və Diaqnoz Qeydi</h3>
                <p className="text-xs text-slate-500">Pasiyent: {selectedPatientForEncounter.fullName} (FİN: {selectedPatientForEncounter.fin})</p>
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
                  placeholder="məs. Dr. Şahin Əhmədov"
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
                  placeholder="məs. Servikal fəqərə osteoxondrozu"
                  value={newEncounterData.diagnosis}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, diagnosis: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Müalicə / Terapiya Təyinatı</label>
                <textarea
                  rows={2}
                  required
                  placeholder="məs. 5 seans osteopatik korreksiya və müalicəvi gimnastika"
                  value={newEncounterData.treatment}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, treatment: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dərman Resepti (İstəyə bağlı)</label>
                <input
                  type="text"
                  placeholder="məs. Maqnezium B6 1x2, Kondroprotektor"
                  value={newEncounterData.prescription}
                  onChange={(e) => setNewEncounterData({ ...newEncounterData, prescription: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
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
                  Diaqnozu Qeyd Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: NEW PATIENT (MEDICAL MODULE) ═══════════ */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Yeni Pasiyent Qeydiyyatı</span>
                </h3>
                <p className="text-xs text-slate-500">Həkim modulu üçün yeni xəstə kartı və tibbi profil</p>
              </div>
              <button onClick={() => setIsPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3">
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial / Klinika</label>
                  <select
                    value={newPatientData.tenantId}
                    onChange={(e) => setNewPatientData({ ...newPatientData, tenantId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pasiyentin Adı və Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="məs. Əli Məmmədov"
                  value={newPatientData.fullName}
                  onChange={(e) => setNewPatientData({ ...newPatientData, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ş/V FİN Kodu * (7 simvol)</label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="məs. 7ABC123"
                    value={newPatientData.fin}
                    onChange={(e) => setNewPatientData({ ...newPatientData, fin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Əlaqə Nömrəsi</label>
                  <input
                    type="tel"
                    placeholder="+994 50 123 45 67"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doğum Tarixi</label>
                  <input
                    type="date"
                    value={newPatientData.birthDate}
                    onChange={(e) => setNewPatientData({ ...newPatientData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qan Qrupu</label>
                  <select
                    value={newPatientData.bloodGroup}
                    onChange={(e) => setNewPatientData({ ...newPatientData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="I (O) Rh+">I (O) Rh+</option>
                    <option value="I (O) Rh-">I (O) Rh-</option>
                    <option value="II (A) Rh+">II (A) Rh+</option>
                    <option value="II (A) Rh-">II (A) Rh-</option>
                    <option value="III (B) Rh+">III (B) Rh+</option>
                    <option value="III (B) Rh-">III (B) Rh-</option>
                    <option value="IV (AB) Rh+">IV (AB) Rh+</option>
                    <option value="IV (AB) Rh-">IV (AB) Rh-</option>
                    <option value="Naməlum">Naməlum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergiya və Xroniki Xəstəliklər</label>
                <input
                  type="text"
                  placeholder="məs. Penisillin allergiyası, Astma"
                  value={newPatientData.allergies}
                  onChange={(e) => setNewPatientData({ ...newPatientData, allergies: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Həkim / Daxili Qeydlər</label>
                <textarea
                  rows={2}
                  placeholder="Pasiyent haqqında xüsusi göstərişlər və ya ilkin şikayətlər..."
                  value={newPatientData.notes}
                  onChange={(e) => setNewPatientData({ ...newPatientData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Pasiyenti Qeydiyyata Al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT PATIENT (MEDICAL MODULE) ═══════════ */}
      {isEditPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Pasiyent Kartını Redaktə Et</span>
                </h3>
                <p className="text-xs text-slate-500">Pasiyentin fərdi və tibbi məlumatlarının yenilənməsi</p>
              </div>
              <button onClick={() => setIsEditPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pasiyentin Adı və Soyadı *</label>
                <input
                  type="text"
                  required
                  value={editPatientData.fullName}
                  onChange={(e) => setEditPatientData({ ...editPatientData, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ş/V FİN Kodu * (7 simvol)</label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={editPatientData.fin}
                    onChange={(e) => setEditPatientData({ ...editPatientData, fin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Əlaqə Nömrəsi</label>
                  <input
                    type="tel"
                    value={editPatientData.phone}
                    onChange={(e) => setEditPatientData({ ...editPatientData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doğum Tarixi</label>
                  <input
                    type="date"
                    value={editPatientData.birthDate}
                    onChange={(e) => setEditPatientData({ ...editPatientData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qan Qrupu</label>
                  <select
                    value={editPatientData.bloodGroup}
                    onChange={(e) => setEditPatientData({ ...editPatientData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Seçin</option>
                    <option value="I (O) Rh+">I (O) Rh+</option>
                    <option value="I (O) Rh-">I (O) Rh-</option>
                    <option value="II (A) Rh+">II (A) Rh+</option>
                    <option value="II (A) Rh-">II (A) Rh-</option>
                    <option value="III (B) Rh+">III (B) Rh+</option>
                    <option value="III (B) Rh-">III (B) Rh-</option>
                    <option value="IV (AB) Rh+">IV (AB) Rh+</option>
                    <option value="IV (AB) Rh-">IV (AB) Rh-</option>
                    <option value="Naməlum">Naməlum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergiya və Xroniki Xəstəliklər</label>
                <input
                  type="text"
                  placeholder="məs. Penisillin allergiyası, Astma"
                  value={editPatientData.allergies}
                  onChange={(e) => setEditPatientData({ ...editPatientData, allergies: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Həkim / Daxili Qeydlər</label>
                <textarea
                  rows={2}
                  value={editPatientData.notes}
                  onChange={(e) => setEditPatientData({ ...editPatientData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Məlumatları Yenilə
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: CUSTOMER REPUTATION SCORE & STAFF NOTES ═══════════ */}
      {isReputationModalOpen && selectedBookingForReputation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Müştəri Xalı və Qeyd</span>
                </h3>
                <p className="text-xs text-slate-500">Müştəri reputasiyası və daxili inzibati qeydlər</p>
              </div>
              <button onClick={() => setIsReputationModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedBookingForReputation.customerName}
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>Tel: <b>{selectedBookingForReputation.customerPhone}</b></span>
                {selectedBookingForReputation.customerFin && (
                  <span>• FİN: <b>{selectedBookingForReputation.customerFin}</b></span>
                )}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                Xidmət: {selectedBookingForReputation.serviceName} ({selectedBookingForReputation.date} {selectedBookingForReputation.timeSlot})
              </div>

              {/* No show & Blocking alert in modal */}
              {selectedBookingForReputation.isBlocked ? (
                <div className="mt-2 p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-[11px] font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Bu müştəri sistemdə bloklanıb ({selectedBookingForReputation.noShowCount || 3} dəfə rezervasiyaya gəlməyib).</span>
                </div>
              ) : selectedBookingForReputation.noShowCount && selectedBookingForReputation.noShowCount > 0 ? (
                <div className="mt-2 p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Xəbərdarlıq: Müştəri daha əvvəl {selectedBookingForReputation.noShowCount} dəfə rezervasiyaya gəlməyib.</span>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSaveReputation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Müştəriyə Verilən Bal / Xal (0 - 100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={reputationData.customerScore}
                    onChange={(e) => setReputationData({ ...reputationData, customerScore: Number(e.target.value) })}
                    className="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-base font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {[100, 80, 50, 20].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReputationData({ ...reputationData, customerScore: val })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          reputationData.customerScore === val
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200'
                        }`}
                      >
                        {val} {val === 100 ? 'Əla' : val === 80 ? 'Yaxşı' : val === 50 ? 'Orta' : 'Zəif'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  İnzibati / Daxili Qeydlər
                </label>
                <textarea
                  rows={3}
                  placeholder="Müştəri haqqında daxili qeyd (məs. dəqiqdir, xüsusi diqqət lazımdır, gecikir və s.)..."
                  value={reputationData.adminNotes}
                  onChange={(e) => setReputationData({ ...reputationData, adminNotes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Bu qeyd yalnız admin və filial işçiləri üçün görünür.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReputationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
