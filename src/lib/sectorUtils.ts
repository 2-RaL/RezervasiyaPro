import { 
  HeartPulse, 
  Scissors, 
  Sparkles, 
  Car, 
  Dumbbell, 
  GraduationCap, 
  Building2,
  LucideIcon 
} from 'lucide-react';

export interface SectorConfig {
  type: 'HEALTH' | 'BARBER' | 'BEAUTY' | 'AUTO' | 'FITNESS' | 'EDUCATION' | 'GENERAL';
  label: string;
  badge: string;
  icon: LucideIcon;
  gradient: string;
  bookingsLabel: string;
  bookingsDesc: string;
  servicesLabel: string;
  servicesDesc: string;
  staffLabel: string;
  staffDesc: string;
  specialModuleLabel?: string;
  customerTerm: string;
  staffTerm: string;
  serviceTerm: string;
  quickActionService: string;
  quickActionStaff: string;
}

export function getSectorInfo(sectorName?: string): SectorConfig {
  const s = (sectorName || '').toLowerCase();

  // 1. TİBB / KLİNİKA / SƏHİYYƏ / OSTEOPATİYA
  if (
    s.includes('tib') || 
    s.includes('klinik') || 
    s.includes('osteopat') || 
    s.includes('həkim') || 
    s.includes('stomatoloq') ||
    s.includes('səhiyyə') ||
    s.includes('diaqnostika')
  ) {
    return {
      type: 'HEALTH',
      label: 'Tibb & Klinika Paneli',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: HeartPulse,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      bookingsLabel: 'Pasiyent Qəbulları & Növbələr',
      bookingsDesc: 'Həkim qəbuluna yazılan pasiyentlərin cədvəli və FİN tibbi kartları',
      servicesLabel: 'Tibbi Müayinə & Diaqnostika Xidmətləri',
      servicesDesc: 'Diaqnostika, müayinə, rentgen və müalicə tarifləri',
      staffLabel: 'Həkimlər & Tibbi Mütəxəssislər',
      staffDesc: 'Klinikanın həkim, stomatoloq və tibbi heyəti',
      specialModuleLabel: 'FİN Tibbi Kartlar & Reseptlər',
      customerTerm: 'Pasiyent',
      staffTerm: 'Həkim',
      serviceTerm: 'Tibbi Xidmət / Müayinə',
      quickActionService: 'Yeni Tibbi Müayinə Əlavə Et',
      quickActionStaff: 'Yeni Həkim Əlavə Et'
    };
  }

  // 2. BƏRBƏRXANA & KİŞİ SALONU & STİL
  if (s.includes('bərbər') || s.includes('barber') || s.includes('kişi salonu') || s.includes('saç')) {
    return {
      type: 'BARBER',
      label: 'Bərbərxana & Stil Klubu',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Scissors,
      gradient: 'from-amber-600 via-orange-600 to-yellow-500',
      bookingsLabel: 'Müştəri Növbələri & Rezervlər',
      bookingsDesc: 'Saç kəsimi, saqqal dizaynı və baxım üçün usta növbələri',
      servicesLabel: 'Saç, Saqqal & Stil Xidmətləri',
      servicesDesc: 'Kəsim, saqqal baxımı, maska və V.I.P paketlər',
      staffLabel: 'Ustalar & Bərbərlər',
      staffDesc: 'Salonda çalışan bərbər ustaları və stilistlər',
      specialModuleLabel: 'Kreslo & Növbə İdarəetməsi',
      customerTerm: 'Müştəri',
      staffTerm: 'Usta / Bərbər',
      serviceTerm: 'Saç / Saqqal Xidməti',
      quickActionService: 'Yeni Kəsim/Qulluq Əlavə Et',
      quickActionStaff: 'Yeni Usta Əlavə Et'
    };
  }

  // 3. GÖZƏLLİK & KOSMETOLOGİYA & SPA
  if (
    s.includes('gözəllik') || 
    s.includes('kosmetologiya') || 
    s.includes('estetik') || 
    s.includes('spa') || 
    s.includes('lazer')
  ) {
    return {
      type: 'BEAUTY',
      label: 'Gözəllik & Estetik Mərkəzi',
      badge: 'bg-pink-50 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      icon: Sparkles,
      gradient: 'from-pink-600 via-rose-600 to-purple-500',
      bookingsLabel: 'Müştəri Qəbulları & Seanslar',
      bookingsDesc: 'Lazer epilyasiyası, kosmetologiya və baxım seansları',
      servicesLabel: 'Kosmetoloji & Estetik Prosedurlar',
      servicesDesc: 'Lazer, dərinin təmizlənməsi, mezo və baxım paketləri',
      staffLabel: 'Kosmetoloqlar & Stilistlər',
      staffDesc: 'Mərkəzin kosmetoloq, lazer mütəxəssisi və vizajistləri',
      specialModuleLabel: 'Kabinə & Prosedur Otaqları',
      customerTerm: 'Xanım Müştəri',
      staffTerm: 'Kosmetoloq / Mütəxəssis',
      serviceTerm: 'Estetik Prosedur',
      quickActionService: 'Yeni Prosedur Əlavə Et',
      quickActionStaff: 'Yeni Kosmetoloq Əlavə Et'
    };
  }

  // 4. AVTOMOBİL & DETAİLİNG & TƏMİR
  if (s.includes('avto') || s.includes('detailing') || s.includes('maşın') || s.includes('təmir')) {
    return {
      type: 'AUTO',
      label: 'Avto Servis & Detailing Paneli',
      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      icon: Car,
      gradient: 'from-cyan-600 via-teal-600 to-blue-500',
      bookingsLabel: 'Avtomobil Qəbulları & Təmir Növbəsi',
      bookingsDesc: 'Servis boksuna daxil olan avtomobillərin növbə cədvəli',
      servicesLabel: 'Diaqnostika, Təmir & Detailing Xidmətləri',
      servicesDesc: 'Texniki baxış, mühərrik diaqnostikası, boya qoruma və keramika',
      staffLabel: 'Texniklər, Ustalar & Qəbulçular',
      staffDesc: 'Avto-texniklər, elektrik və detailing ustaları',
      specialModuleLabel: 'Boks & Qaldırıcı Cədvəli',
      customerTerm: 'Avtomobil Sahibi',
      staffTerm: 'Texnik / Usta',
      serviceTerm: 'Təmir / Detailing Xidməti',
      quickActionService: 'Yeni Təmir Xidməti Əlavə Et',
      quickActionStaff: 'Yeni Texnik Əlavə Et'
    };
  }

  // 5. İDMAN & FİTNES & YOGA
  if (s.includes('idman') || s.includes('fitnes') || s.includes('yoga') || s.includes('zal')) {
    return {
      type: 'FITNESS',
      label: 'İdman & Fitnes Klubu Paneli',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: Dumbbell,
      gradient: 'from-emerald-600 via-teal-600 to-green-500',
      bookingsLabel: 'Fərdi & Qrup Məşq Rezervləri',
      bookingsDesc: 'Şəxsi təlimçi və qrup dərslərinin rezervasiya qrafiki',
      servicesLabel: 'Məşq, Fitnes & Yoga Dərsləri',
      servicesDesc: 'Fərdi dərslər, yoga, pilates və zala giriş tarifləri',
      staffLabel: 'Məşqçilər & Təlimçilər',
      staffDesc: 'Fitnes təlimçiləri, yoga instruktorları və məşqçilər',
      specialModuleLabel: 'Zal & Qrup İdarəetməsi',
      customerTerm: 'İdmançı / Üzv',
      staffTerm: 'Məşqçi / Təlimçi',
      serviceTerm: 'Məşq / Dərs Proqramı',
      quickActionService: 'Yeni Dərs/Məşq Əlavə Et',
      quickActionStaff: 'Yeni Məşqçi Əlavə Et'
    };
  }

  // 6. TƏHSİL & KURSLAR & REPETİTOR
  if (s.includes('təhsil') || s.includes('kurs') || s.includes('tədris') || s.includes('dərslər') || s.includes('repetitor')) {
    return {
      type: 'EDUCATION',
      label: 'Tədris & Təhsil Mərkəzi Paneli',
      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: GraduationCap,
      gradient: 'from-purple-600 via-indigo-600 to-pink-500',
      bookingsLabel: 'Dərs Qrafiki & Qeydiyyatlar',
      bookingsDesc: 'Tələbələrin fərdi dərsləri və sınaq imtahanı qeydiyyatı',
      servicesLabel: 'Fənlər, Kurslar & İmtahan Hazırlığı',
      servicesDesc: 'Xarici dil, abituriyent hazırlığı və İT kurslarının qiymətləri',
      staffLabel: 'Müəllimlər & Repetitorlar',
      staffDesc: 'Mərkəzin tədris heyəti və fənn müəllimləri',
      specialModuleLabel: 'Auditoriya & Qrup Cədvəli',
      customerTerm: 'Tələbə / Valideyn',
      staffTerm: 'Müəllim / Repetitor',
      serviceTerm: 'Tədris Dərsi / Kurs',
      quickActionService: 'Yeni Fənn/Kurs Əlavə Et',
      quickActionStaff: 'Yeni Müəllim Əlavə Et'
    };
  }

  // 7. STANDART / ÜMUMİ SEKTOR
  return {
    type: 'GENERAL',
    label: 'Universal Xidmət Paneli',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: Building2,
    gradient: 'from-indigo-600 via-blue-600 to-violet-500',
    bookingsLabel: 'Rezervasiyalar & Növbələr',
    bookingsDesc: 'Müştəri qəbullarının və rezervasiyaların idarəsi',
    servicesLabel: 'Xidmətlər və Qiymət Tarifləri',
    servicesDesc: 'Müəssisənin aktiv və müştərilərə təqdim etdiyi xidmətlər',
    staffLabel: 'İşçi Heyəti & Mütəxəssislər',
    staffDesc: 'Xidmət göstərən əməkdaşlar və mütəxəssislər',
    customerTerm: 'Müştəri',
    staffTerm: 'Mütəxəssis',
    serviceTerm: 'Xidmət',
    quickActionService: 'Yeni Xidmət Əlavə Et',
    quickActionStaff: 'Yeni Mütəxəssis Əlavə Et'
  };
}
