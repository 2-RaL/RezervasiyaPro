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
  AlertCircle
} from 'lucide-react';
import { Tenant, Service, Staff } from '../../lib/types';

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

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tenants/${params.slug}`);
        const data = await res.json();
        if (data.success && data.tenant) {
          setTenant(data.tenant);
          if (data.tenant.services && data.tenant.services.length > 0) {
            setSelectedServiceId(data.tenant.services[0].id);
          }
          if (data.tenant.staff && data.tenant.staff.length > 0) {
            setSelectedStaffId(data.tenant.staff[0].id);
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Müəssisə məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-800/80 border border-white/10 rounded-3xl p-8 text-center">
          <AlertCircle className="w-14 h-14 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Filial Tapılmadı</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'Göstərilən filial mövcud deyil və ya deaktiv edilib.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Səhifəyə Qayıt</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedService = tenant.services?.find(s => s.id === selectedServiceId);
  const selectedStaff = tenant.staff?.find(s => s.id === selectedStaffId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Əsas səhifə</span>
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>Admin Panel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tenant Header Banner */}
        <div className="bg-slate-800/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  {tenant.sector}
                </span>
                {tenant.medicalEnabled && (
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tibbi İnteqrasiya
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{tenant.name}</h1>
              {tenant.address && (
                <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{tenant.address}</span>
                </p>
              )}
            </div>

            {tenant.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{tenant.phone}</span>
              </a>
            )}
          </div>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success Ticket */
          <div className="bg-gradient-to-br from-slate-800/90 to-indigo-900/60 border border-emerald-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
              Rezervasiya Təsdiqləndi
            </span>

            <h2 className="text-3xl font-extrabold text-white mt-3 mb-2">Təşəkkür edirik, {confirmedBooking.customerName}!</h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-8">
              Rezervasiyanız uğurla qeydə alındı və mərkəzin admin sisteminə ötürüldü.
            </p>

            <div className="max-w-md mx-auto bg-slate-900/80 border border-white/10 rounded-2xl p-6 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Rezervasiya ID:</span>
                <span className="font-mono font-bold text-indigo-400">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Xidmət:</span>
                <span className="font-semibold text-white">{selectedService?.nameAz}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Mütəxəssis / Həkim:</span>
                <span className="font-semibold text-white">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Tarix və Saat:</span>
                <span className="font-semibold text-emerald-400">{confirmedBooking.date} / {confirmedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-400">Qiymət:</span>
                <span className="font-extrabold text-white text-base">{selectedService?.price} AZN</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setCustomerName('');
                  setCustomerPhone('+994 ');
                  setCustomerFin('');
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
              >
                Yeni Rezervasiya Et
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                Admin Paneldə Bax
              </Link>
            </div>
          </div>
        ) : (
          /* Interactive Booking Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Select Service */}
            <div className="bg-slate-800/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">1</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xidmət Seçimi</h3>
                  <p className="text-xs text-slate-400">Yazılmaq istədiyiniz proseduru və ya xidməti seçin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tenant.services?.map(srv => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {srv.category}
                        </span>
                        <span className="text-base font-extrabold text-indigo-300">{srv.price} AZN</span>
                      </div>
                      <h4 className="font-bold text-white text-base mb-1">{srv.nameAz}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Müddət: {srv.duration} dəqiqə</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Specialist */}
            <div className="bg-slate-800/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">2</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mütəxəssis / Həkim Seçimi</h3>
                  <p className="text-xs text-slate-400">Qəbulunda olmaq istədiyiniz mütəxəssisi seçin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tenant.staff?.map(stf => {
                  const isSelected = selectedStaffId === stf.id;
                  return (
                    <div
                      key={stf.id}
                      onClick={() => setSelectedStaffId(stf.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all text-center ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base mx-auto mb-3 shadow-md">
                        {stf.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h4 className="font-bold text-white text-sm">{stf.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{stf.role}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date & Time Slot */}
            <div className="bg-slate-800/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">3</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tarix və Saat</h3>
                  <p className="text-xs text-slate-400">Sizə uyğun olan rezervasiya vaxtını təyin edin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tarix</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Mövcud Saatlar</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {timeSlots.map(time => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
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
            <div className="bg-slate-800/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">4</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Müştəri Məlumatları</h3>
                  <p className="text-xs text-slate-400">Rezervasiya təsdiqi üçün əlaqə vasitələriniz</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ad və Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Əli Əliyev"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobil Nömrə *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+994 50 123 45 67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {tenant.medicalEnabled && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Şəxsiyyət Vəsiqəsinin FİN Kodu (Tibbi Qeydiyyat üçün)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      placeholder="Məs: 7ABC123"
                      value={customerFin}
                      onChange={(e) => setCustomerFin(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">FİN kod tibbi xəstəlik tarixçənizin və həkim qeydlərinin avtomatik arxivləşməsi üçün lazımdır.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/90 border border-indigo-500/30 rounded-2xl p-6">
              <div>
                <span className="text-xs text-slate-400">Yekun Xidmət:</span>
                <p className="font-bold text-white text-base">
                  {selectedService?.nameAz} — <span className="text-emerald-400">{selectedService?.price} AZN</span>
                </p>
                <p className="text-xs text-slate-400">
                  {selectedDate} / {selectedTime} • {selectedStaff?.name}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
