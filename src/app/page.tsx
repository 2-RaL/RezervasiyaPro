'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Building2, 
  ShieldCheck, 
  Users, 
  Activity, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Scissors,
  CheckCircle2,
  Car,
  Dumbbell,
  GraduationCap,
  Sparkle,
  Sun,
  Moon,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Globe2,
  Lock,
  HeartPulse
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface TenantDisplay {
  id: string;
  name: string;
  slug: string;
  sector: string;
  sectorCategory: 'beauty' | 'health' | 'barber' | 'auto' | 'fitness' | 'education';
  phone: string;
  address: string;
  featuredServices: { name: string; price: number; duration: number }[];
  accentColor: string;
}

const DEMO_TENANTS: TenantDisplay[] = [
  {
    id: 'tenant-1',
    name: 'Gözəllik və Estetik Mərkəzi',
    slug: 'gozellik-merkezi',
    sector: 'Gözəllik & Kosmetologiya',
    sectorCategory: 'beauty',
    phone: '+994 50 222 33 44',
    address: 'Bakı şəh., Nizami küç. 45',
    accentColor: 'from-pink-500 to-rose-600',
    featuredServices: [
      { name: 'Lazer Epilyasiyası (Tam bədən)', price: 120, duration: 60 },
      { name: 'Dərinin Dərin Təmizlənməsi (Hydrafacial)', price: 85, duration: 45 },
    ]
  },
  {
    id: 'tenant-2',
    name: 'Modern Klinika & Diaqnostika',
    slug: 'modern-klinika',
    sector: 'Səhiyyə & Diaqnostika',
    sectorCategory: 'health',
    phone: '+994 12 444 55 66',
    address: 'Bakı şəh., Azadlıq pr. 102',
    accentColor: 'from-blue-500 to-indigo-600',
    featuredServices: [
      { name: 'Stomatoloji Müayinə və Rentgen', price: 40, duration: 30 },
      { name: 'Diş Ağardılması (Zoom 4)', price: 250, duration: 60 },
    ]
  },
  {
    id: 'tenant-3',
    name: 'VIP Barber Club Baku',
    slug: 'vip-barber',
    sector: 'Bərbərxana & Stil',
    sectorCategory: 'barber',
    phone: '+994 55 777 88 99',
    address: 'Bakı şəh., 28 May küç. 14',
    accentColor: 'from-amber-500 to-orange-600',
    featuredServices: [
      { name: 'Klassik Saç Kəsimi və Saqqal Dizaynı', price: 35, duration: 45 },
      { name: 'V.I.P Qulluq & Baş Masajı', price: 50, duration: 60 },
    ]
  },
  {
    id: 'tenant-4',
    name: 'ProAuto Təmir & Detailing Mərkəzi',
    slug: 'avto-servis',
    sector: 'Avtomobil & Detailing',
    sectorCategory: 'auto',
    phone: '+994 50 333 44 22',
    address: 'Bakı şəh., Babək pr. 58',
    accentColor: 'from-cyan-500 to-blue-600',
    featuredServices: [
      { name: 'Kompleks Detailing & Keramika Qoruma', price: 200, duration: 180 },
      { name: 'Kompüter Diaqnostikası və Texniki Baxış', price: 40, duration: 45 },
    ]
  },
  {
    id: 'tenant-5',
    name: 'Grand Fitness & Yoga Studiyası',
    slug: 'fit-studio',
    sector: 'İdman & Fitnes',
    sectorCategory: 'fitness',
    phone: '+994 12 598 00 11',
    address: 'Bakı şəh., Fəvvarələr meydanı 12',
    accentColor: 'from-emerald-500 to-teal-600',
    featuredServices: [
      { name: 'Fərdi Məşqçi ilə Personal Training', price: 50, duration: 60 },
      { name: 'Hatha Yoga və Dərin Nəfəs Dərsi', price: 30, duration: 60 },
    ]
  },
  {
    id: 'tenant-6',
    name: 'Zirvə Tədris & İnkişaf Mərkəzi',
    slug: 'tedris-merkezi',
    sector: 'Təhsil & Fərdi Dərslər',
    sectorCategory: 'education',
    phone: '+994 50 888 12 34',
    address: 'Bakı şəh., Cəfər Cabbarlı küç. 28',
    accentColor: 'from-purple-500 to-indigo-600',
    featuredServices: [
      { name: 'Fərdi IELTS / TOEFL İmtahan Hazırlığı', price: 40, duration: 90 },
      { name: 'Veb və Proqramlaşdırma Praktiki Dərsi', price: 50, duration: 90 },
    ]
  },
  {
    id: 'tenant-osteopat',
    name: 'Osteopat.az - Manuel Terapiya və Reabilitasiya',
    slug: 'osteopat',
    sector: 'Reabilitasiya & Osteopatiya',
    sectorCategory: 'health',
    phone: '+994 50 700 80 90',
    address: 'Bakı şəh., Zərifə Əliyeva küç. 24',
    accentColor: 'from-teal-500 to-emerald-600',
    featuredServices: [
      { name: 'Osteopatik İlkin Müayinə və Diaqnostika', price: 80, duration: 60 },
      { name: 'Onurğa və Oynaqlarda Manuel Terapiya', price: 60, duration: 45 },
    ]
  }
];

export default function HomePage() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Ensure default is light mode, but allow toggling and persistent preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const filteredTenants = selectedCategory === 'all' 
    ? DEMO_TENANTS 
    : DEMO_TENANTS.filter(t => t.sectorCategory === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Corporate Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Rezervasiya<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  Universal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bütün Sektorlar Üçün Rezervasiya Sistemi</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#sektorlar" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sektorlar</a>
            <a href="#filiallar" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Filiallar</a>
            <a href="#imkanlar" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">İmkanlar</a>
            <a href="#nece-isleyir" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Necə İşləyir?</a>
          </div>

          {/* Action Bar (Theme Toggle + Giriş Button) */}
          <div className="flex items-center space-x-3">
            
            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Single "Giriş" Button */}
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>Giriş</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/70 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Müasir & Çoxşaxəli Biznes Həlli</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 text-slate-900 dark:text-white">
            Bütün Xidmət və Biznes Sahələri Üçün <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 dark:from-indigo-400 dark:via-blue-300 dark:to-cyan-300">
              Ağıllı Rezervasiya Sistemi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10">
            Gözəllik mərkəzləri, tibb klinikaları, bərbərxanalar, avto servislər, fitnes studiyaları və tədris müəssisələri üçün vahid növbə, mütəxəssis və müştəri idarəetmə platforması.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#filiallar"
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:translate-y-[-2px] flex items-center gap-3"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Nümunə Filialları Sına</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-base border border-slate-300 dark:border-slate-700 shadow-md transition-all flex items-center gap-2"
            >
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Sistemə Giriş</span>
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Hər Sektora Uyğun</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="text-3xl font-black text-slate-900 dark:text-white">24/7</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Avtomatlaşdırılmış Növbə</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="text-3xl font-black text-slate-900 dark:text-white">0 dəq</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Vaxt İtkisi və Xəta</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Canlı</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Mütəxəssis Qrafiki</div>
            </div>
          </div>

        </div>
      </header>

      {/* Universal Sectors Banner */}
      <section id="sektorlar" className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Universal Tətbiq Sahələri
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              İstənilən Xidmət Sektoruna Rahat İnteqrasiya
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Sistem yalnız bir istiqamət üçün deyil, bütün xidmət yönümlü müəssisələr üçün elastik parametrlərlə təchiz edilmişdir.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Sector 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gözəllik & Spa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kosmetologiya, baxım, lazer</p>
            </div>

            {/* Sector 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Klinika & Səhiyyə</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Həkim, stomatoloq, tibb</p>
            </div>

            {/* Sector 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bərbər & Stil</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kişi salonları, saç dizaynı</p>
            </div>

            {/* Sector 4 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Avto Servis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detailing, təmir, texniki baxış</p>
            </div>

            {/* Sector 5 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">İdman & Yoga</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fərdi məşq, pilates, zal</p>
            </div>

            {/* Sector 6 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Təhsil & Kurslar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fərdi dərslər, repetitor, İT</p>
            </div>

          </div>
        </div>
      </section>

      {/* Live Branches Section with Interactive Sector Filter */}
      <section id="filiallar" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>Canlı Filial Nümunələri</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Müəssisələr və Rezervasiya Səhifələri
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-xl">
                Hər filial üçün ayrılmış fərdi portal. Müştərilər xidməti, mütəxəssisi və münasib saatı saniyələr içində seçib rezervasiya edirlər.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Hamısı' },
                { id: 'beauty', label: 'Gözəllik' },
                { id: 'health', label: 'Səhiyyə' },
                { id: 'barber', label: 'Bərbərxana' },
                { id: 'auto', label: 'Avto Servis' },
                { id: 'fitness', label: 'İdman' },
                { id: 'education', label: 'Təhsil' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTenants.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                      {item.sector}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Aktiv
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-6">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.address}</span>
                  </p>

                  {/* Featured Services Preview */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Populyar Xidmətlər:</div>
                    {item.featuredServices.map((srv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">{srv.name}</span>
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span>{srv.price} ₼</span>
                          <span className="text-[10px] text-slate-400 font-normal">({srv.duration} dəq)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/${item.slug}`}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white dark:hover:text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <span>Rezervasiya Et</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Corporate Features / Platform Advantages */}
      <section id="imkanlar" className="py-24 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Korporativ Standartlar
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Biznesinizi Tam Nəzarətdə Saxlayın
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              Müştəri məmnuniyyətini artıran, boş dayanma vaxtını aradan qaldıran və komandanın işini nizamlayan güclü idarəetmə vasitələri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Çoxfiliallı və Çoxsahəli</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bir platformadan bir neçə fərqli sektordakı filialı, xidmətləri və işçiləri ayrı-ayrı tənzimləyin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Real-vaxtda Ağıllı Cədvəl</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Boş vaxt intervalları avtomatik hesablanır, toqquşmalar tam istisna olunur və növbələr dərhal yenilənir.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mütəxəssis & İşçi İdarəsi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hər həkim, usta, məşqçi və ya təlimçi üçün xüsusi iş saatları, xidmət kateqoriyaları və statuslar təyin edin.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Müştəri & FİN Tarixçəsi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Gələn hər müştərinin rezervasiya tarixçəsini, əlaqə nömrəsini və qeydlərini təhlükəsiz bazada saxlayın.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gəlir və Rezervasiya Analitikası</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hansı xidmətlərin daha çox tələb olunduğunu, mütəxəssislərin yüklənməsini və filial üzrə dövriyyəni izləyin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bütün Cihazlara Uyğun</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mobil telefon, planşet və noutbuklarda sürətli, həssas və qüsursuz işləyən korporativ interfeys.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow: How It Works */}
      <section id="nece-isleyir" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Sadə Proses
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              3 Addımda Rezervasiya
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Müştəriləriniz növbəyə durmadan, cəmi 30 saniyə ərzində istədikləri xidməti qeydiyyatdan keçirə bilirlər.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="text-5xl font-black text-indigo-600/10 dark:text-indigo-400/10 absolute top-6 right-6">01</div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Filial və Xidməti Seçin</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tələb olunan xidmət kateqoriyasını və qiymət tarifini siyahıdan seçin.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="text-5xl font-black text-indigo-600/10 dark:text-indigo-400/10 absolute top-6 right-6">02</div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mütəxəssis və Saat Təyin Edin</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                İstədiyiniz mütəxəssisin həmin günə aid real-vaxtda boş olan saatını təyin edin.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="text-5xl font-black text-indigo-600/10 dark:text-indigo-400/10 absolute top-6 right-6">03</div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dərhal Təsdiq Alın</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Məlumatlar dərhal mərkəzin admin sisteminə ötürülür və rezervasiya təsdiqlənir.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-indigo-700/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
              Rəqəmsal Növbə İdarəetməsi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
              Müəssisənizi RezervasiyaPro ilə İdarə Edin
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Bütün filiallarınızı, işçilərinizi, xidmətlərinizi və rezervasiyaları tək bir korporativ paneldən izləyin.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl bg-white text-indigo-950 font-bold text-sm shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Giriş</span>
              </Link>
              <a
                href="#filiallar"
                className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Filialları İncələ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
              R
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">RezervasiyaPro</span>
              <p className="text-[11px] text-slate-400">Universal Rezervasiya və İdarəetmə Sistemi</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 font-semibold">
            <a href="#sektorlar" className="hover:text-indigo-600 dark:hover:text-indigo-400">Sektorlar</a>
            <a href="#filiallar" className="hover:text-indigo-600 dark:hover:text-indigo-400">Filiallar</a>
            <a href="#imkanlar" className="hover:text-indigo-600 dark:hover:text-indigo-400">İmkanlar</a>
            <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">Giriş</Link>
          </div>

          <div>
            © {new Date().getFullYear()} RezervasiyaPro. Bütün hüquqlar qorunur.
          </div>

        </div>
      </footer>

    </div>
  );
}
