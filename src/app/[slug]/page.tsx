'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Sparkles,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Check
} from 'lucide-react';
import { Tenant, Service, Staff, CustomerReview } from '../../lib/types';
import ThemeToggle from '../../components/ThemeToggle';

export default function TenantBookingPage({ params }: { params: { slug: string } }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+994 ');
  const [customerFin, setCustomerFin] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<{ message: string; isBlocked?: boolean } | null>(null);

  // Booked slots tracking
  const [bookedSlots, setBookedSlots] = useState<{ date: string; timeSlot: string; staffId: string; duration?: number }[]>([]);

  // Quality & Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewPhone, setReviewPhone] = useState<string>('');
  const [reviewServiceName, setReviewServiceName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [reviewStarFilter, setReviewStarFilter] = useState<'ALL' | 1 | 2 | 3 | 4 | 5>('ALL');

  // Mütəxəssis və ya xidmətin təyin edilmiş vaxt aralığı (dəqiqə ilə)
  const activeInterval = useMemo(() => {
    const stf = tenant?.staff?.find(s => s.id === selectedStaffId);
    if (stf?.slotDuration && stf.slotDuration > 0) return stf.slotDuration;
    const srv = tenant?.services?.find(s => s.id === selectedServiceId);
    if (srv?.duration && srv.duration > 0) return srv.duration;
    return 30;
  }, [tenant, selectedStaffId, selectedServiceId]);

  // Aralıq üçün oxunaqlı yazı (məs: "2 saat", "30 dəq", "1 saat 30 dəq")
  const formatIntervalLabel = (mins: number) => {
    if (!mins) return '30 dəq';
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const rem = mins % 60;
      if (rem === 0) return `${h} saat (${mins} dəq)`;
      return `${h} saat ${rem} dəq (${mins} dəq)`;
    }
    return `${mins} dəq`;
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  // 24 saatlıq tam rejim üzrə dinamik vaxt cədvəli (08:00 - 23:00) təyin edilmiş aralıqla
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const startM = 8 * 60;  // 08:00
    const endM = 23 * 60;   // 23:00
    for (let m = startM; m <= endM; m += activeInterval) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, [activeInterval]);

  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');

  const filteredTimeSlots = useMemo(() => {
    return timeSlots.filter(t => {
      const hour = parseInt(t.split(':')[0], 10);
      if (timeFilter === 'MORNING') return hour >= 8 && hour < 12;
      if (timeFilter === 'AFTERNOON') return hour >= 12 && hour < 17;
      if (timeFilter === 'EVENING') return hour >= 17 && hour <= 23;
      return true;
    });
  }, [timeSlots, timeFilter]);

  // Slotun kəsişməsini yoxlayan funksiya (startA < endB && startB < endA)
  const checkSlotBooked = (time: string) => {
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + activeInterval;

    return bookedSlots.some(b => {
      if (selectedStaffId && b.staffId !== selectedStaffId) return false;
      const bDuration = b.duration || 30;
      const bStart = timeToMinutes(b.timeSlot);
      const bEnd = bStart + bDuration;
      return slotStart < bEnd && bStart < slotEnd;
    });
  };

  // Müştərilərin real rəylərinin ulduz üzrə filtrasiyası
  const filteredReviews = useMemo(() => {
    if (reviewStarFilter === 'ALL') return reviews;
    return reviews.filter(r => r.rating === reviewStarFilter);
  }, [reviews, reviewStarFilter]);

  // Sosial media və WhatsApp yönləndirmə keçidləri
  const getCleanPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const getWhatsAppUrl = () => {
    if (!tenant) return '#';
    const waNumber = tenant.whatsapp ? getCleanPhone(tenant.whatsapp) : getCleanPhone(tenant.phone);
    if (!waNumber) return '#';
    const text = encodeURIComponent(`Salam, ${tenant.name} üçün rezervasiya ilə bağlı müraciət edirəm.`);
    return `https://wa.me/${waNumber}?text=${text}`;
  };

  const getInstagramUrl = () => {
    if (!tenant) return '#';
    if (tenant.instagram) {
      if (tenant.instagram.startsWith('http')) return tenant.instagram;
      return `https://instagram.com/${tenant.instagram.replace('@', '')}`;
    }
    return `https://instagram.com/${tenant.slug}`;
  };

  const getFacebookUrl = () => {
    if (!tenant) return '#';
    if (tenant.facebook) {
      if (tenant.facebook.startsWith('http')) return tenant.facebook;
      return `https://facebook.com/${tenant.facebook}`;
    }
    return `https://facebook.com/${tenant.slug}`;
  };

  const getTikTokUrl = () => {
    if (!tenant) return '#';
    if (tenant.tiktok) {
      if (tenant.tiktok.startsWith('http')) return tenant.tiktok;
      const handle = tenant.tiktok.startsWith('@') ? tenant.tiktok : `@${tenant.tiktok}`;
      return `https://tiktok.com/${handle}`;
    }
    return `https://tiktok.com/@${tenant.slug}`;
  };

  const getTelegramUrl = () => {
    if (!tenant) return '#';
    if (tenant.telegram) {
      if (tenant.telegram.startsWith('http')) return tenant.telegram;
      return `https://t.me/${tenant.telegram.replace('@', '')}`;
    }
    return `https://t.me/${tenant.slug}`;
  };

  // Real-time input handlers: strictly letters for name, strictly digits for phone
  const handleCustomerNameChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z\səıöğçşƏIİÖĞÇŞ'-]/g, '');
    setCustomerName(cleaned);
  };

  const handleCustomerPhoneChange = (val: string) => {
    const cleaned = val.replace(/[^\d+\s()-]/g, '');
    setCustomerPhone(cleaned);
  };

  const handleReviewNameChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z\səıöğçşƏIİÖĞÇŞ'-]/g, '');
    setReviewName(cleaned);
  };

  const handleReviewPhoneChange = (val: string) => {
    const cleaned = val.replace(/[^\d+\s()-]/g, '');
    setReviewPhone(cleaned);
  };

  const loadReviews = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/reviews?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
  };

  const loadBookedSlots = async (tenantId: string, date: string, staffId?: string) => {
    try {
      let url = `/api/bookings?tenantId=${tenantId}&date=${date}`;
      if (staffId) url += `&staffId=${staffId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.bookedSlots)) {
        setBookedSlots(data.bookedSlots);
      }
    } catch (e) {
      console.error('Failed to load booked slots:', e);
    }
  };

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tenants/${params.slug}`);
        const data = await res.json();
        if (data.success && data.tenant) {
          setTenant(data.tenant);
          const activeServices = (data.tenant.services || []).filter((s: Service) => s.isActive !== false);
          let initialStaffId = '';
          if (activeServices.length > 0) {
            setSelectedServiceId(activeServices[0].id);
            setReviewServiceName(activeServices[0].nameAz);
            // Specialist matching the first service
            const matchingStaff = (data.tenant.staff || []).filter((st: Staff) => 
              !st.serviceIds || st.serviceIds.length === 0 || st.serviceIds.includes(activeServices[0].id)
            );
            if (matchingStaff.length > 0) {
              initialStaffId = matchingStaff[0].id;
              setSelectedStaffId(matchingStaff[0].id);
            }
          } else if (data.tenant.staff && data.tenant.staff.length > 0) {
            initialStaffId = data.tenant.staff[0].id;
            setSelectedStaffId(data.tenant.staff[0].id);
          }
          loadReviews(data.tenant.id);
          loadBookedSlots(data.tenant.id, selectedDate, initialStaffId);
          if (typeof window !== 'undefined') {
            const hasDone = localStorage.getItem(`reviewed_${data.tenant.id}`);
            if (hasDone === 'true') {
              setHasReviewed(true);
            }
          }
        } else {
          setError(data.error || 'Müəssisə tapılmadı');
        }
      } catch (err: any) {
        setError('Sistemlə əlaqə qurularkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, [params.slug]);

  // Load booked slots whenever date or staff changes
  useEffect(() => {
    if (tenant?.id && selectedDate) {
      loadBookedSlots(tenant.id, selectedDate, selectedStaffId);
    }
  }, [tenant?.id, selectedDate, selectedStaffId]);

  // Auto-switch selected time slot if current selected slot is booked or not in available timeSlots
  useEffect(() => {
    const isCurrentBooked = checkSlotBooked(selectedTime);
    if (!timeSlots.includes(selectedTime) || isCurrentBooked) {
      const freeSlot = timeSlots.find(t => !checkSlotBooked(t));
      if (freeSlot) {
        setSelectedTime(freeSlot);
      } else if (timeSlots.length > 0) {
        setSelectedTime(timeSlots[0]);
      }
    }
  }, [timeSlots, bookedSlots, selectedTime, selectedStaffId, activeInterval]);

  // Submit Quality Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    if (hasReviewed) {
      setReviewError('Siz bu müəssisə üçün artıq rəy bildirmisiniz. Bir IP ünvanından yalnız bir dəfə rəy yazmaq mümkündür.');
      return;
    }

    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError('Zəhmət olmasa adınızı və rəyinizi qeyd edin.');
      return;
    }

    setReviewError(null);

    try {
      setReviewSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          tenantName: tenant.name,
          customerName: reviewName.trim(),
          customerPhone: reviewPhone.trim(),
          serviceName: reviewServiceName.trim() || undefined,
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewError(null);
        setHasReviewed(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`reviewed_${tenant.id}`, 'true');
        }
        loadReviews(tenant.id);
        setTimeout(() => setReviewSuccess(false), 6000);
      } else {
        setReviewError(data.error || 'Rəy göndərilmədi');
        if (res.status === 429) {
          setHasReviewed(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`reviewed_${tenant.id}`, 'true');
          }
        }
      }
    } catch (err) {
      setReviewError('Rəy göndərilərkən xəta baş verdi');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    if (!selectedServiceId || !selectedStaffId || !customerName.trim() || !customerPhone.trim()) {
      alert('Zəhmət olmasa bütün vacib məlumatları doldurun.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          customerName,
          customerPhone,
          customerFin: customerFin.trim(),
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          date: selectedDate,
          timeSlot: selectedTime
        })
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
        setBookingError(null);
      } else {
        const isBlocked = Boolean(data.blocked || res.status === 403);
        setBookingError({
          message: data.error || 'Rezervasiya qeydə alınmadı',
          isBlocked
        });
        if (isBlocked) {
          alert('🚫 DİQQƏT: ' + (data.error || 'Bu nömrə, FİN və ya qurğudan rezervasiya etmək bloklanıb.'));
        } else {
          alert(data.error || 'Rezervasiya qeydə alınmadı');
        }
      }
    } catch (err) {
      setBookingError({ message: 'Xəta baş verdi, zəhmət olmasa yenidən cəhd edin' });
      alert('Xəta baş verdi, zəhmət olmasa yenidən cəhd edin');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Müəssisə məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-slate-900 dark:text-white transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Filial Tapılmadı</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error || 'Göstərilən filial mövcud deyil və ya deaktiv edilib.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Səhifəyə Qayıt</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedService = tenant.services?.find(s => s.id === selectedServiceId);
  const availableStaff = (tenant.staff || []).filter(stf => {
    if (stf.serviceIds && stf.serviceIds.length > 0) {
      return stf.serviceIds.includes(selectedServiceId);
    }
    return true;
  });
  const selectedStaff = tenant.staff?.find(s => s.id === selectedStaffId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Top Breadcrumb & Controls */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Əsas səhifə</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3.5 py-2 rounded-xl transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
            >
              <span>Giriş</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tenant Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Cover Banner Image at the Top */}
          {tenant.coverImage && (
            <div className="relative h-44 sm:h-60 -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 mb-6 overflow-hidden border-b border-slate-200 dark:border-white/10 group">
              <img
                src={tenant.coverImage}
                alt={`${tenant.name} örtük banneri`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              {/* Logo on the Left Side */}
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={`${tenant.name} loqosu`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-xl shrink-0 bg-white dark:bg-slate-800"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                    {tenant.sector}
                  </span>
                  {tenant.medicalEnabled && (
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Tibbi İnteqrasiya
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{tenant.name}</h1>
                {tenant.address && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{tenant.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
              {tenant.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{tenant.phone}</span>
                </a>
              )}

              {/* Sosial Media və WhatsApp loqoları */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* WhatsApp Logo Button */}
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp ilə birbaşa əlaqə"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.34-1.95 1.39-.51.05-1.18.07-3.79-.98-3.32-1.34-5.47-4.71-5.63-4.93-.17-.22-1.35-1.8-1.35-3.43 0-1.63.85-2.43 1.15-2.76.3-.33.66-.41.88-.41.22 0 .44 0 .63.01.21.01.48-.08.75.57.28.68.96 2.34 1.05 2.51.09.17.15.37.03.6-.12.22-.18.36-.36.56-.18.21-.37.47-.53.63-.18.18-.36.38-.16.73.21.36.92 1.51 1.97 2.45 1.35 1.2 2.49 1.57 2.85 1.75.36.18.57.15.78-.1.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.09.99 2.45 1.17.36.18.6.27.69.42.09.15.09.87-.15 1.55z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Instagram Logo */}
                <a
                  href={getInstagramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram səhifəsi"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/25 transition-transform hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook Logo */}
                <a
                  href={getFacebookUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook səhifəsi"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1877F2] text-white shadow-md shadow-blue-500/25 transition-transform hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* TikTok Logo */}
                <a
                  href={getTikTokUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok profili"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white/10 hover:bg-black text-white border border-slate-700/30 transition-transform hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.28 8.28 0 0 0 4.76 1.48V7.08a4.84 4.84 0 0 1-1-.39z"/>
                  </svg>
                </a>

                {/* Telegram Logo */}
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram kanalı"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#229ED9] text-white shadow-md shadow-sky-500/25 transition-transform hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success Ticket */
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
              Rezervasiya Təsdiqləndi
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 mb-2">Təşəkkür edirik, {confirmedBooking.customerName}!</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto mb-8">
              Rezervasiyanız uğurla qeydə alındı və mərkəzin admin sisteminə ötürüldü.
            </p>

            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Rezervasiya ID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Xidmət:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedService?.nameAz}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Mütəxəssis:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tarix və Saat:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{confirmedBooking.date} / {confirmedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-500 dark:text-slate-400">Qiymət:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{selectedService?.price} AZN</span>
              </div>
            </div>

            {/* Direct support / WhatsApp links on confirmation */}
            <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-indigo-50/50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 font-medium">
                Rezervasiya ilə bağlı əlavə sualınız və ya dəyişiklik istəyiniz olarsa, bizimlə əlaqə saxlaya bilərsiniz:
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.34-1.95 1.39-.51.05-1.18.07-3.79-.98-3.32-1.34-5.47-4.71-5.63-4.93-.17-.22-1.35-1.8-1.35-3.43 0-1.63.85-2.43 1.15-2.76.3-.33.66-.41.88-.41.22 0 .44 0 .63.01.21.01.48-.08.75.57.28.68.96 2.34 1.05 2.51.09.17.15.37.03.6-.12.22-.18.36-.36.56-.18.21-.37.47-.53.63-.18.18-.36.38-.16.73.21.36.92 1.51 1.97 2.45 1.35 1.2 2.49 1.57 2.85 1.75.36.18.57.15.78-.1.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.09.99 2.45 1.17.36.18.6.27.69.42.09.15.09.87-.15 1.55z" />
                  </svg>
                  <span>WhatsApp ilə Əlaqə</span>
                </a>
                {tenant?.phone && (
                  <a
                    href={`tel:${tenant.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Zəng Et</span>
                  </a>
                )}
                <a
                  href={getInstagramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold transition-all hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setCustomerName('');
                  setCustomerPhone('+994 ');
                  setCustomerFin('');
                  if (tenant?.id && selectedDate) {
                    loadBookedSlots(tenant.id, selectedDate, selectedStaffId);
                  }
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Yeni Rezervasiya Et</span>
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Booking Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Select Service */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">1</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Xidmət Seçimi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Yazılmaq istədiyiniz proseduru və ya xidməti seçin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tenant.services?.filter(srv => srv.isActive !== false).map(srv => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        setReviewServiceName(srv.nameAz);
                        // Check if current specialist provides this service
                        const matches = (tenant.staff || []).filter(st => 
                          !st.serviceIds || st.serviceIds.length === 0 || st.serviceIds.includes(srv.id)
                        );
                        if (matches.length > 0 && !matches.some(st => st.id === selectedStaffId)) {
                          setSelectedStaffId(matches[0].id);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-600/20 shadow-md' 
                          : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/50 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {srv.category}
                        </span>
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{srv.price} AZN</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{srv.nameAz}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Müddət: {formatIntervalLabel(srv.duration)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Specialist (Filtered by Selected Service) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">2</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mütəxəssis Seçimi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seçilmiş xidmət üzrə təyin edilmiş mütəxəssisi seçin
                  </p>
                </div>
              </div>

              {availableStaff.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {availableStaff.map(stf => {
                    const isSelected = selectedStaffId === stf.id;
                    return (
                      <div
                        key={stf.id}
                        onClick={() => setSelectedStaffId(stf.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all text-center ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-600/20 shadow-md' 
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base mx-auto mb-3 shadow-md">
                          {stf.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{stf.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stf.role}</p>
                        {stf.slotDuration ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2 border border-emerald-200 dark:border-emerald-500/20">
                            <Clock className="w-2.5 h-2.5" />
                            {formatIntervalLabel(stf.slotDuration)} aralıq
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Bu xidmət üzrə aktiv mütəxəssis təyin edilməyib. Zəhmət olmasa başqa xidmət seçin və ya müəssisə ilə əlaqə saxlayın.</span>
                </div>
              )}
            </div>

            {/* Step 3: Date & Time Slot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">3</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tarix və Saat</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sizə uyğun olan rezervasiya vaxtını təyin edin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Tarix</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Mövcud Saatlar</span>
                      </label>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                        <span>Aralıq: {formatIntervalLabel(activeInterval)}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        24 Saatlıq Rejim
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Boş
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Dolu (Rezerv edilib)
                      </span>
                    </div>
                  </div>

                  {/* Vaxt Filtrləri (24 saatlıq) */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTimeFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        timeFilter === 'ALL'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      Bütün Saatlar (24H)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilter('MORNING')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        timeFilter === 'MORNING'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      Səhər (08:00 - 12:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilter('AFTERNOON')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        timeFilter === 'AFTERNOON'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      Günorta (12:00 - 17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFilter('EVENING')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        timeFilter === 'EVENING'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      Axşam (17:00 - 23:00)
                    </button>
                  </div>

                  {/* 24-Saatlıq Slotlar Qridi */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredTimeSlots.map(time => {
                      const isBooked = checkSlotBooked(time);
                      const isSelected = selectedTime === time;

                      if (isBooked) {
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={true}
                            title="Bu saat artıq doludur və seçilə bilməz"
                            className="py-2.5 px-2 rounded-xl text-xs font-bold transition-all bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/40 text-rose-500 dark:text-rose-400 line-through cursor-not-allowed opacity-70 flex flex-col items-center justify-center gap-0.5"
                          >
                            <span>{time}</span>
                            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 no-underline">Dolu</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  {/* Seçilmiş saat göstəricisi */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-white/5 flex-wrap gap-2">
                    <span className="text-slate-500">Seçilmiş vaxt:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedTime} ({formatIntervalLabel(activeInterval)}, 24 saatlıq rejim)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Contact & Identity Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">4</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Müştəri Məlumatları</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rezervasiya təsdiqi üçün əlaqə vasitələriniz</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ad və Soyad * (Yalnız hərflər)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Əli Əliyev"
                    value={customerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobil Nömrə * (Yalnız rəqəmlər)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+994 50 123 45 67"
                    value={customerPhone}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {tenant.medicalEnabled && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Şəxsiyyət Vəsiqəsinin FİN Kodu (Tibbi Qeydiyyat üçün)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      placeholder="Məs: 7ABC123"
                      value={customerFin}
                      onChange={(e) => setCustomerFin(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500/40 rounded-xl px-4 py-3 text-slate-900 dark:text-white uppercase focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">FİN kod tibbi xəstəlik tarixçənizin və həkim qeydlərinin avtomatik arxivləşməsi üçün lazımdır.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Error or Block Alert */}
            {bookingError && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
                bookingError.isBlocked 
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200' 
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
              }`}>
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm">
                    {bookingError.isBlocked ? '🚫 Onlayn Rezervasiya Məhdudlaşdırılıb' : 'Rezervasiya Xətası'}
                  </div>
                  <p className="mt-1 leading-relaxed">{bookingError.message}</p>
                  {bookingError.isBlocked && tenant?.phone && (
                    <div className="mt-2 text-xs font-semibold">
                      Müəssisə ilə birbaşa əlaqə: <a href={`tel:${tenant.phone}`} className="underline font-bold text-indigo-600 dark:text-indigo-400">{tenant.phone}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-md transition-colors">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Yekun Xidmət:</span>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedService?.nameAz} — <span className="text-emerald-600 dark:text-emerald-400">{selectedService?.price} AZN</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDate} / {selectedTime} • {selectedStaff?.name}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Rezervasiya edilir...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    <span>Rezervasiyanı Təsdiqlə</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════ KEYFİYYƏT ÖLÇÜMÜ & MÜŞTƏRİ RƏYLƏRİ BÖLMƏSİ ═══════════ */}
        <section id="keyfiyyet-rey" className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors">
            
            {/* Header & Quality Score */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Xidmət Keyfiyyəti & Müştəri Məmnuniyyəti</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Xidməti Qiymətləndirin və Rəy Bildirin
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {tenant.name} filialı üçün təəssüratınızı və balınızı qeyd edin. Sizin rəyiniz xidmət səviyyəsinin yüksəldilməsinə xidmət edir.
                </p>
              </div>

              {/* Dynamic Overall Rating Pill */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-center shrink-0 min-w-[170px]">
                <div className="flex items-center justify-center gap-1.5 text-3xl font-black text-slate-900 dark:text-white">
                  <span>
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {reviews.length} müştəri qiymətləndirməsi
                </p>
              </div>
            </div>

            {/* Interactive Rating Form */}
            <form onSubmit={handleReviewSubmit} className="mt-8 space-y-6">
              
              {/* Star Selection Row */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Xidmət Balı (Ulduz Seçin) *
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                          title={`${star} ulduz`}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              isFilled 
                                ? 'fill-amber-400 text-amber-500 drop-shadow-sm' 
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Rating Description Label */}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                    {(hoverRating || reviewRating) === 5 && '⭐⭐⭐⭐⭐ 5/5 — Əla və Mükəmməl!'}
                    {(hoverRating || reviewRating) === 4 && '⭐⭐⭐⭐ 4/5 — Çox Yaxşı Xidmət'}
                    {(hoverRating || reviewRating) === 3 && '⭐⭐⭐ 3/5 — Qənaətbəxş / Orta'}
                    {(hoverRating || reviewRating) === 2 && '⭐⭐ 2/5 — Zəif Təcrübə'}
                    {(hoverRating || reviewRating) === 1 && '⭐ 1/5 — Çox Zəif / Narazıyam'}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Adınız və Soyadınız * (Yalnız hərflər)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Günel Əhmədova"
                    value={reviewName}
                    onChange={(e) => handleReviewNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobil Nömrəniz (İstəyə bağlı, yalnız rəqəmlər)
                  </label>
                  <input
                    type="tel"
                    placeholder="+994 50 123 45 67"
                    value={reviewPhone}
                    onChange={(e) => handleReviewPhoneChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Xidmət / Prosedur
                  </label>
                  <input
                    type="text"
                    placeholder="Məs: Həkim qəbulu, Saç kəsimi..."
                    value={reviewServiceName}
                    onChange={(e) => setReviewServiceName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rəy və Təəssüratınız *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Göstərilən xidmət, həkim/usta diqqəti, vaxtında qəbul və s. barədə fikirlərinizi qeyd edin..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Submit button & feedback message */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {hasReviewed ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Siz bu müəssisə üçün artıq rəy bildirmisiniz. Qaydalara əsasən, bir IP ünvanından yalnız bir dəfə rəy yazmaq mümkündür. Təşəkkür edirik!</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{reviewSubmitting ? 'Göndərilir...' : 'Rəyi və Balı Təsdiqlə'}</span>
                    </button>
                  )}

                  {reviewSuccess && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Təşəkkür edirik! Rəyiniz qeydə alındı və xidmət keyfiyyətinin yüksəldilməsinə töhfə verir.</span>
                    </div>
                  )}
                </div>

                {reviewError && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
              </div>
            </form>

            {/* List of Existing Reviews */}
            {reviews.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Müştərilərin Real Rəyləri ({reviews.length})</span>
                  </h4>

                  {/* Ulduz ilə Filterləmə Düymələri */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setReviewStarFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        reviewStarFilter === 'ALL'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>Hamısı</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        reviewStarFilter === 'ALL' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}>
                        {reviews.length}
                      </span>
                    </button>

                    {[5, 4, 3, 2, 1].map(starCount => {
                      const count = reviews.filter(r => r.rating === starCount).length;
                      const isActive = reviewStarFilter === starCount;
                      return (
                        <button
                          key={starCount}
                          type="button"
                          onClick={() => setReviewStarFilter(starCount as 1 | 2 | 3 | 4 | 5)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300 dark:ring-amber-600'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                          <span>{starCount}</span>
                          <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                            isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-white/20"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                {r.customerName.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                  {r.customerName}
                                </h5>
                                {r.serviceName && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {r.serviceName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <Star
                                  key={st}
                                  className={`w-3.5 h-3.5 ${
                                    st <= r.rating 
                                      ? 'fill-amber-400 text-amber-400' 
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-1">
                                {r.rating}.0
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                            "{r.comment}"
                          </p>
                        </div>

                        <div className="mt-3 pt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-200/50 dark:border-white/5">
                          <span>{new Date(r.createdAt).toLocaleDateString('az-AZ')}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Təsdiqlənmiş Müştəri
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <Star className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Bu ulduz dərəcəsi ({reviewStarFilter} ulduz) üzrə hələ rəy yazılmayıb.
                    </p>
                    <button
                      type="button"
                      onClick={() => setReviewStarFilter('ALL')}
                      className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Bütün rəyləri göstər ({reviews.length})
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}
