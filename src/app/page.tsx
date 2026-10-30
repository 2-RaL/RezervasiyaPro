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
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../lib/languageContext';

interface TenantDisplay {
  id: string;
  name: string;
  slug: string;
  sector: string;
  sectorCategory: 'beauty' | 'health' | 'barber' | 'auto' | 'fitness' | 'education';
  phone: string;
  address: string;
  coverImage?: string;
  logo?: string;
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
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=400&q=80',
    featuredServices: [
      { name: 'Osteopatik İlkin Müayinə və Diaqnostika', price: 80, duration: 60 },
      { name: 'Onurğa və Oynaqlarda Manuel Terapiya', price: 60, duration: 45 },
    ]
  }
];

export default function HomePage() {
  const { lang, t, formatDuration, getCategoryName } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTenants = selectedCategory === 'all' 
    ? DEMO_TENANTS 
    : DEMO_TENANTS.filter(t => t.sectorCategory === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-300">
      
      {/* Apple Translucent Floating Glass Navigation Bar */}
      <nav className="sticky top-0 z-50 apple-glass-nav transition-all">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Apple Brand Logo with Spring Touch */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group apple-press-sm shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-[#0071e3] to-[#0051a8] flex items-center justify-center shadow-md shadow-[#0071e3]/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold apple-headline tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                  Rezervasiya<span className="text-[#0071e3] dark:text-[#2997ff]">Pro</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/10">
                  Universal
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-normal leading-tight">
                {lang === 'ru' ? 'Система бронирования для любого бизнеса' : (lang === 'en' ? 'Online Booking System for Any Business' : 'Bütün Sektorlar Üçün Rezervasiya Sistemi')}
              </p>
            </div>
          </Link>

          {/* Desktop Apple-Style Nav Links */}
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-[#1d1d1f]/80 dark:text-[#f5f5f7]/80">
            <a 
              href="#sektorlar" 
              className="px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] transition-all apple-press-sm"
            >
              {lang === 'ru' ? 'Секторы' : (lang === 'en' ? 'Sectors' : 'Sektorlar')}
            </a>
            <a 
              href="#filiallar" 
              className="px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] transition-all apple-press-sm"
            >
              {lang === 'ru' ? 'Филиалы' : (lang === 'en' ? 'Branches' : 'Filiallar')}
            </a>
            <a 
              href="#imkanlar" 
              className="px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] transition-all apple-press-sm"
            >
              {lang === 'ru' ? 'Возможности' : (lang === 'en' ? 'Features' : 'İmkanlar')}
            </a>
            <a 
              href="#nece-isleyir" 
              className="px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] transition-all apple-press-sm"
            >
              {lang === 'ru' ? 'Как это работает?' : (lang === 'en' ? 'How it works?' : 'Necə İşləyir?')}
            </a>
          </div>

          {/* Action Bar (Language Switcher + Theme Toggle + Login Button) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSelector />
            <ThemeToggle />

            <Link 
              href="/login" 
              className="apple-press text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071e3]/30 transition-all inline-flex items-center gap-1.5 sm:gap-2 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Apple Minimalist Immersion & Optical Sizing */}
      <header className="relative pt-16 sm:pt-28 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Depth Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#0071e3]/15 via-[#5856d6]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Apple Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.12] text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Main Headline with Apple Optical Typography */}
          <h1 className="apple-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
            {t('heroTitle1')} <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] via-[#5856d6] to-[#0071e3] dark:from-[#2997ff] dark:via-[#af52de] dark:to-[#2997ff]">
              {t('heroTitle2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="apple-body max-w-2xl mx-auto text-lg sm:text-xl text-[#86868b] dark:text-[#a1a1a6] font-normal leading-relaxed mb-10">
            {t('heroDesc')}
          </p>

          {/* Apple Style CTAs with Tactile Press Response */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#filiallar"
              className="apple-btn-primary apple-press text-base font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-[#0071e3]/25 flex items-center gap-2.5"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>{t('tryDemo')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/login"
              className="apple-btn-secondary apple-press text-base font-semibold px-8 py-3.5 rounded-full flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
              <span>{t('login')}</span>
            </Link>
          </div>

          {/* Apple Bento Metrics Cards with Specular Highlights */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="apple-glass-card apple-press-sm p-6 text-left">
              <div className="apple-display text-3xl sm:text-4xl font-bold text-[#0071e3] dark:text-[#2997ff]">100%</div>
              <div className="apple-caption font-medium text-[#86868b] dark:text-[#a1a1a6] mt-2 uppercase tracking-wider">
                {lang === 'ru' ? 'Для всех отраслей' : (lang === 'en' ? 'For all sectors' : 'Hər Sektora Uyğun')}
              </div>
            </div>

            <div className="apple-glass-card apple-press-sm p-6 text-left">
              <div className="apple-display text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">24/7</div>
              <div className="apple-caption font-medium text-[#86868b] dark:text-[#a1a1a6] mt-2 uppercase tracking-wider">
                {lang === 'ru' ? 'Автоматическая очередь' : (lang === 'en' ? 'Automated queue' : 'Avtomatlaşdırılmış Növbə')}
              </div>
            </div>

            <div className="apple-glass-card apple-press-sm p-6 text-left">
              <div className="apple-display text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">0 {lang === 'ru' ? 'мин' : (lang === 'en' ? 'min' : 'dəq')}</div>
              <div className="apple-caption font-medium text-[#86868b] dark:text-[#a1a1a6] mt-2 uppercase tracking-wider">
                {lang === 'ru' ? 'Без задержек и ошибок' : (lang === 'en' ? 'Zero delay & errors' : 'Vaxt İtkisi və Xəta')}
              </div>
            </div>

            <div className="apple-glass-card apple-press-sm p-6 text-left">
              <div className="apple-display text-3xl sm:text-4xl font-bold text-[#34c759] dark:text-[#30d158]">
                {lang === 'ru' ? 'Онлайн' : (lang === 'en' ? 'Live' : 'Canlı')}
              </div>
              <div className="apple-caption font-medium text-[#86868b] dark:text-[#a1a1a6] mt-2 uppercase tracking-wider">
                {lang === 'ru' ? 'График специалистов' : (lang === 'en' ? 'Specialist schedule' : 'Mütəxəssis Qrafiki')}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Universal Sectors Showcase — Apple Squircle Grid */}
      <section id="sektorlar" className="py-20 px-4 sm:px-6 lg:px-8 border-y border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="apple-caption font-semibold uppercase tracking-widest text-[#0071e3] dark:text-[#2997ff]">
              {lang === 'ru' ? 'Универсальные сферы применения' : (lang === 'en' ? 'Universal Business Sectors' : 'Universal Tətbiq Sahələri')}
            </span>
            <h2 className="apple-headline text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">
              {lang === 'ru' ? 'Простая интеграция для любого бизнеса' : (lang === 'en' ? 'Seamless integration for every service sector' : 'İstənilən Xidmət Sektoruna Rahat İnteqrasiya')}
            </h2>
            <p className="apple-body text-sm sm:text-base text-[#86868b] dark:text-[#a1a1a6] mt-3">
              {lang === 'ru' 
                ? 'Система спроектирована с гибкими параметрами для любых сервисных организаций, салонов и клиник.' 
                : (lang === 'en' 
                  ? 'The system is equipped with versatile parameters for all service-oriented enterprises, salons, and clinics.' 
                  : 'Sistem yalnız bir istiqamət üçün deyil, bütün xidmət yönümlü müəssisələr üçün elastik parametrlərlə təchiz edilmişdir.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Sector 1: Beauty */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Красота и SPA' : (lang === 'en' ? 'Beauty & Spa' : 'Gözəllik & Spa')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Косметология, уход' : (lang === 'en' ? 'Cosmetology, laser' : 'Kosmetologiya, baxım')}
              </p>
            </div>

            {/* Sector 2: Health */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Клиника и здоровье' : (lang === 'en' ? 'Clinic & Health' : 'Klinika & Səhiyyə')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Врачи, терапия' : (lang === 'en' ? 'Doctors, therapy' : 'Həkim, stomatoloq')}
              </p>
            </div>

            {/* Sector 3: Barber */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Барбершоп и стиль' : (lang === 'en' ? 'Barbershop & Style' : 'Bərbər & Stil')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Мужские стрижки' : (lang === 'en' ? 'Men haircuts' : 'Kişi salonları, saç')}
              </p>
            </div>

            {/* Sector 4: Auto */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Автосервис' : (lang === 'en' ? 'Auto Service' : 'Avto Servis')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Детейлинг, ТО' : (lang === 'en' ? 'Detailing, repair' : 'Detailing, təmir')}
              </p>
            </div>

            {/* Sector 5: Fitness */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#34c759]/10 text-[#34c759] dark:text-[#30d158] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Фитнес и Йога' : (lang === 'en' ? 'Fitness & Yoga' : 'İdman & Yoga')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Тренировки, зал' : (lang === 'en' ? 'Gym, pilates' : 'Fərdi məşq, zal')}
              </p>
            </div>

            {/* Sector 6: Education */}
            <div className="apple-glass-card apple-press p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lang === 'ru' ? 'Образование и курсы' : (lang === 'en' ? 'Education & Courses' : 'Təhsil & Kurslar')}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-snug">
                {lang === 'ru' ? 'Уроки, IT курсы' : (lang === 'en' ? 'Lessons, IT' : 'Fərdi dərslər, İT')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Live Branches Section with iOS Segmented Control */}
      <section id="filiallar" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                <span>{lang === 'ru' ? 'Примеры филиалов' : (lang === 'en' ? 'Live Branch Examples' : 'Canlı Filial Nümunələri')}</span>
              </div>
              <h2 className="apple-headline text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {lang === 'ru' ? 'Организации и страницы бронирования' : (lang === 'en' ? 'Enterprises & Booking Portals' : 'Müəssisələr və Rezervasiya Səhifələri')}
              </h2>
              <p className="apple-body text-[#86868b] dark:text-[#a1a1a6] text-sm sm:text-base mt-2 max-w-xl">
                {lang === 'ru'
                  ? 'Индивидуальный портал для каждого филиала. Клиенты выбирают услугу, мастера и время за считанные секунды.'
                  : (lang === 'en'
                    ? 'Dedicated portal for each branch. Customers select service, specialist, and convenient time in seconds.'
                    : 'Hər filial üçün ayrılmış fərdi portal. Müştərilər xidməti, mütəxəssisi və münasib saatı saniyələr içində seçib rezervasiya edirlər.')}
              </p>
            </div>

            {/* Apple iOS-Style Segmented Control */}
            <div className="apple-segmented-container inline-flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: t('allSectors') },
                { id: 'beauty', label: lang === 'ru' ? 'Красота' : (lang === 'en' ? 'Beauty' : 'Gözəllik') },
                { id: 'health', label: lang === 'ru' ? 'Здоровье' : (lang === 'en' ? 'Healthcare' : 'Səhiyyə') },
                { id: 'barber', label: lang === 'ru' ? 'Барбер' : (lang === 'en' ? 'Barbershop' : 'Bərbərxana') },
                { id: 'auto', label: lang === 'ru' ? 'Авто' : (lang === 'en' ? 'Auto' : 'Avto') },
                { id: 'fitness', label: lang === 'ru' ? 'Спорт' : (lang === 'en' ? 'Fitness' : 'İdman') },
                { id: 'education', label: lang === 'ru' ? 'Образование' : (lang === 'en' ? 'Education' : 'Təhsil') },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`apple-segmented-item apple-press-sm ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Bento Grid with Apple Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTenants.map((item) => (
              <div 
                key={item.id}
                className="apple-glass-card apple-press-sm overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl"
              >
                <div>
                  {/* Top Cover Banner */}
                  <div className="relative h-44 w-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                    {item.coverImage ? (
                      <img 
                        src={item.coverImage} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-r ${item.accentColor} opacity-90`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                    
                    {/* Apple Frosted Badges on Cover */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                        {getCategoryName(item.sector)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-white bg-[#34c759]/90 backdrop-blur-xl px-2.5 py-0.5 rounded-full font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {lang === 'ru' ? 'Активен' : (lang === 'en' ? 'Active' : 'Aktiv')}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Apple Squircle Logo */}
                  <div className="p-6 pt-0">
                    <div className="flex items-end justify-between -mt-10 mb-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl border-2 border-white dark:border-[#2c2c2e] bg-white dark:bg-[#1c1c1e] shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                        {item.logo ? (
                          <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-tr ${item.accentColor} flex items-center justify-center text-white font-bold text-lg`}>
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors mb-2">
                      {item.name}
                    </h3>

                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1.5 mb-5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-[#0071e3] dark:text-[#2997ff]" />
                      <span>{item.address}</span>
                    </p>

                    {/* Featured Services Preview */}
                    <div className="space-y-2 mb-6">
                      <div className="apple-caption font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6]">
                        {t('featuredServices')}:
                      </div>
                      {item.featuredServices.map((srv, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-xs">
                          <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium truncate max-w-[190px]">{srv.name}</span>
                          <div className="flex items-center gap-1.5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] shrink-0">
                            <span>{srv.price} ₼</span>
                            <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-normal">({formatDuration(srv.duration)})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Link with Apple Press Touch */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                    <Link
                      href={`/${item.slug}`}
                      className="apple-press w-full py-3 px-4 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{t('bookNow')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Corporate Features / Platform Advantages (Apple Bento Showcase) */}
      <section id="imkanlar" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="apple-caption font-semibold uppercase tracking-widest text-[#0071e3] dark:text-[#2997ff]">
              {lang === 'ru' ? 'Корпоративные стандарты' : (lang === 'en' ? 'Enterprise Standards' : 'Korporativ Standartlar')}
            </span>
            <h2 className="apple-headline text-3xl sm:text-5xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3 tracking-tight">
              {lang === 'ru' ? 'Полный контроль над вашим бизнесом' : (lang === 'en' ? 'Keep Your Business Fully Under Control' : 'Biznesinizi Tam Nəzarətdə Saxlayın')}
            </h2>
            <p className="apple-body text-base text-[#86868b] dark:text-[#a1a1a6] mt-4 leading-relaxed">
              {lang === 'ru'
                ? 'Мощные инструменты управления, повышающие удовлетворенность клиентов, исключающие простои и наводящие идеальный порядок в расписании.'
                : (lang === 'en'
                  ? 'Powerful management tools that boost customer satisfaction, eliminate idle time, and streamline team workflows.'
                  : 'Müştəri məmnuniyyətini artıran, boş dayanma vaxtını aradan qaldıran və komandanın işini nizamlayan güclü idarəetmə vasitələri.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Мульти-филиальность и отрасли' : (lang === 'en' ? 'Multi-branch & Multi-sector' : 'Çoxfiliallı və Çoxsahəli')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Управляйте несколькими филиалами в разных отраслях, их услугами и персоналом из одной централизованной платформы.'
                  : (lang === 'en'
                    ? 'Manage multiple branches across different sectors, their services, and employees from a single unified system.'
                    : 'Bir platformadan bir neçə fərqli sektordakı filialı, xidmətləri və işçiləri ayrı-ayrı tənzimləyin.')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#34c759]/10 text-[#34c759] dark:text-[#30d158] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Умное расписание реального времени' : (lang === 'en' ? 'Real-Time Smart Schedule' : 'Real-vaxtda Ağıllı Cədvəl')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Свободные интервалы рассчитываются автоматически, наложения и двойные бронирования полностью исключены.'
                  : (lang === 'en'
                    ? 'Free time slots are dynamically calculated, double bookings are eliminated, and slots update instantly.'
                    : 'Boş vaxt intervalları avtomatik hesablanır, toqquşmalar tam istisna olunur və növbələr dərhal yenilənir.')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Управление специалистами' : (lang === 'en' ? 'Specialist & Staff Management' : 'Mütəxəssis & İşçi İdarəsi')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Назначайте персональные рабочие часы, интервалы приёма и привязывайте услуги для каждого специалиста.'
                  : (lang === 'en'
                    ? 'Assign custom working hours, booking durations, and service specialties for every team member.'
                    : 'Hər həkim, usta, məşqçi və ya təlimçi üçün xüsusi iş saatları, xidmət kateqoriyaları və statuslar təyin edin.')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Клиентская база и FIN-история' : (lang === 'en' ? 'Customer Base & FIN History' : 'Müştəri & FİN Tarixçəsi')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Сохраняйте историю записей клиентов, контакты, медицинские FIN-номера и внутренние заметки в защищённой базе.'
                  : (lang === 'en'
                    ? 'Securely store customer reservation records, contact info, medical FIN codes, and internal admin notes.'
                    : 'Gələn hər müştərinin rezervasiya tarixçəsini, əlaqə nömrəsini və qeydlərini təhlükəsiz bazada saxlayın.')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Аналитика и выручка' : (lang === 'en' ? 'Revenue & Booking Analytics' : 'Gəlir və Rezervasiya Analitikası')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Отслеживайте самые востребованные процедуры, нагрузку специалистов и общие финансовые показатели.'
                  : (lang === 'en'
                    ? 'Monitor top-performing services, staff workloads, and turnover statistics by branch.'
                    : 'Hansı xidmətlərin daha çox tələb olunduğunu, mütəxəssislərin yüklənməsini və filial üzrə dövriyyəni izləyin.')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="apple-glass-card apple-press-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Адаптивность для любых устройств' : (lang === 'en' ? 'Responsive on All Devices' : 'Bütün Cihazlara Uyğun')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Молниеносный, удобный и интуитивный интерфейс на смартфонах, планшетах и компьютерах.'
                  : (lang === 'en'
                    ? 'Lightning-fast, sleek, and intuitive UI on mobile phones, tablets, and desktop workstations.'
                    : 'Mobil telefon, planşet və noutbuklarda sürətli, həssas və qüsursuz işləyən korporativ interfeys.')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow: How It Works (Apple 3-Step Physical Progression) */}
      <section id="nece-isleyir" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="apple-caption font-semibold uppercase tracking-widest text-[#0071e3] dark:text-[#2997ff]">
              {lang === 'ru' ? 'Простой процесс' : (lang === 'en' ? 'Simple Process' : 'Sadə Proses')}
            </span>
            <h2 className="apple-headline text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">
              {lang === 'ru' ? 'Бронирование в 3 шага' : (lang === 'en' ? 'Booking in 3 Steps' : '3 Addımda Rezervasiya')}
            </h2>
            <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] mt-2">
              {lang === 'ru'
                ? 'Клиенты записываются без очередей и телефонных звонков всего за 30 секунд.'
                : (lang === 'en'
                  ? 'Your clients book their desired service in just 30 seconds without waiting in lines.'
                  : 'Müştəriləriniz növbəyə durmadan, cəmi 30 saniyə ərzində istədikləri xidməti qeydiyyatdan keçirə bilirlər.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="apple-glass-card apple-press-sm p-8 relative">
              <div className="apple-display text-5xl font-black text-black/5 dark:text-white/5 absolute top-6 right-6 select-none">01</div>
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-[#0071e3]/30">
                1
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Выберите филиал и услугу' : (lang === 'en' ? 'Select Branch & Service' : 'Filial və Xidməti Seçin')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Выберите нужную процедуру и ознакомьтесь с актуальной стоимостью и длительностью.'
                  : (lang === 'en'
                    ? 'Select the service category and check transparent price rates.'
                    : 'Tələb olunan xidmət kateqoriyasını və qiymət tarifini siyahıdan seçin.')}
              </p>
            </div>

            <div className="apple-glass-card apple-press-sm p-8 relative">
              <div className="apple-display text-5xl font-black text-black/5 dark:text-white/5 absolute top-6 right-6 select-none">02</div>
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-[#0071e3]/30">
                2
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Назначьте мастера и время' : (lang === 'en' ? 'Pick Specialist & Time' : 'Mütəxəssis və Saat Təyin Edin')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Определите удобный интервал времени в живом 24-часовом графике выбранного специалиста.'
                  : (lang === 'en'
                    ? 'Choose an available time slot in the specialist real-time 24-hour calendar.'
                    : 'İstədiyiniz mütəxəssisin həmin günə aid real-vaxtda boş olan saatını təyin edin.')}
              </p>
            </div>

            <div className="apple-glass-card apple-press-sm p-8 relative">
              <div className="apple-display text-5xl font-black text-black/5 dark:text-white/5 absolute top-6 right-6 select-none">03</div>
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-[#0071e3]/30">
                3
              </div>
              <h3 className="text-xl font-bold apple-headline text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                {lang === 'ru' ? 'Получите мгновенное подтверждение' : (lang === 'en' ? 'Get Instant Confirmation' : 'Dərhal Təsdiq Alın')}
              </h3>
              <p className="apple-body text-sm text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {lang === 'ru'
                  ? 'Запись мгновенно отправляется в систему филиала и генерирует электронный талон бронирования.'
                  : (lang === 'en'
                    ? 'Booking data is instantly submitted to the center admin dashboard with an e-ticket.'
                    : 'Məlumatlar dərhal mərkəzin admin sisteminə ötürülür və rezervasiya təsdiqlənir.')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise Apple Depth Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#1c1c1e] to-[#000000] text-white p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="apple-caption font-semibold uppercase tracking-widest text-[#2997ff] bg-white/10 px-3 py-1 rounded-full border border-white/10">
              {lang === 'ru' ? 'Цифровое управление очередями' : (lang === 'en' ? 'Digital Queue Management' : 'Rəqəmsal Növbə İdarəetməsi')}
            </span>
            <h2 className="apple-headline text-3xl sm:text-5xl font-bold mt-4 mb-4">
              {lang === 'ru' ? 'Управляйте предприятием с RezervasiyaPro' : (lang === 'en' ? 'Manage Your Business with RezervasiyaPro' : 'Müəssisənizi RezervasiyaPro ilə İdarə Edin')}
            </h2>
            <p className="apple-body text-neutral-300 text-sm sm:text-base leading-relaxed mb-8">
              {lang === 'ru'
                ? 'Отслеживайте все ваши филиалы, персонал, список услуг и бронирования из единой корпоративной панели.'
                : (lang === 'en'
                  ? 'Track all your branches, specialists, services, and live bookings from a single corporate console.'
                  : 'Bütün filiallarınızı, işçilərinizi, xidmətlərinizi və rezervasiyaları tək bir korporativ paneldən izləyin.')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="apple-press px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm shadow-xl hover:bg-neutral-100 transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#0071e3]" />
                <span>{t('login')}</span>
              </Link>
              <a
                href="#filiallar"
                className="apple-press px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all"
              >
                {lang === 'ru' ? 'Смотреть филиалы' : (lang === 'en' ? 'Explore Branches' : 'Filialları İncələ')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Apple Minimalist Frosted Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] apple-glass-nav py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#86868b] dark:text-[#a1a1a6]">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center text-white font-black shadow-sm">
              R
            </div>
            <div>
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">RezervasiyaPro</span>
              <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                {lang === 'ru' ? 'Универсальная система бронирования и управления' : (lang === 'en' ? 'Universal Booking & Management Platform' : 'Universal Rezervasiya və İdarəetmə Sistemi')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 font-medium">
            <a href="#sektorlar" className="hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors">
              {lang === 'ru' ? 'Секторы' : (lang === 'en' ? 'Sectors' : 'Sektorlar')}
            </a>
            <a href="#filiallar" className="hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors">
              {lang === 'ru' ? 'Филиалы' : (lang === 'en' ? 'Branches' : 'Filiallar')}
            </a>
            <a href="#imkanlar" className="hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors">
              {lang === 'ru' ? 'Возможности' : (lang === 'en' ? 'Features' : 'İmkanlar')}
            </a>
            <Link href="/login" className="hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors">{t('login')}</Link>
          </div>

          <div>
            © {new Date().getFullYear()} RezervasiyaPro. {lang === 'ru' ? 'Все права защищены.' : (lang === 'en' ? 'All rights reserved.' : 'Bütün hüquqlar qorunur.')}
          </div>

        </div>
      </footer>

    </div>
  );
}
