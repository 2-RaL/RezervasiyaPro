'use client';

import React, { useState, useEffect } from 'react';
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

  // Booked slots tracking
  const [bookedSlots, setBookedSlots] = useState<{ date: string; timeSlot: string; staffId: string }[]>([]);

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

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

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

  // Auto-switch selected time slot if current selected slot is booked
  useEffect(() => {
    const isCurrentBooked = bookedSlots.some(
      b => b.timeSlot === selectedTime && (!selectedStaffId || b.staffId === selectedStaffId)
    );
    if (isCurrentBooked) {
      const freeSlot = timeSlots.find(
        t => !bookedSlots.some(b => b.timeSlot === t && (!selectedStaffId || b.staffId === selectedStaffId))
      );
      if (freeSlot) {
        setSelectedTime(freeSlot);
      }
    }
  }, [bookedSlots, selectedTime, selectedStaffId]);

  // Submit Quality Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Zəhmət olmasa adınızı və rəyinizi qeyd edin.');
      return;
    }

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
        loadReviews(tenant.id);
        setTimeout(() => setReviewSuccess(false), 5000);
      } else {
        alert(data.error || 'Rəy göndərilmədi');
      }
    } catch (err) {
      alert('Rəy göndərilərkən xəta baş verdi');
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
      } else {
        alert(data.error || 'Rezervasiya qeydə alınmadı');
      }
    } catch (err) {
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

            {tenant.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all shrink-0"
              >
                <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>{tenant.phone}</span>
              </a>
            )}
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
                        <Clock className="w-3.5 h-3.5" />
                        <span>Müddət: {srv.duration} dəqiqə</span>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mövcud Saatlar</label>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Boş
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Dolu (Rezerv edilib)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {timeSlots.map(time => {
                      const isBooked = bookedSlots.some(
                        b => b.timeSlot === time && (!selectedStaffId || b.staffId === selectedStaffId)
                      );
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
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{reviewSubmitting ? 'Göndərilir...' : 'Rəyi və Balı Təsdiqlə'}</span>
                </button>

                {reviewSuccess && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Təşəkkür edirik! Rəyiniz qeydə alındı və xidmət keyfiyyətinin yüksəldilməsinə töhfə verir.</span>
                  </div>
                )}
              </div>
            </form>

            {/* List of Existing Reviews */}
            {reviews.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>Müştərilərin Real Rəyləri ({reviews.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
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

                          <div className="flex items-center gap-0.5 shrink-0">
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
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          "{r.comment}"
                        </p>
                      </div>

                      <div className="mt-3 pt-2 text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('az-AZ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}
