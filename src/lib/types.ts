export type TenantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  tenantId?: string | null;
  tenantName?: string;
  fin?: string;
  phone?: string;
  isActive?: boolean; // Aktiv və ya bloklanmış olması
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  sector: string;
  status: TenantStatus;
  medicalEnabled: boolean;
  phone?: string | null;
  address?: string | null;
  coverImage?: string | null; // Yuxarı panel üçün örtük şəkli (Banner)
  logo?: string | null;       // Sol tərəf üçün loqo şəkli
  whatsapp?: string | null;   // WhatsApp nömrəsi və ya linki
  instagram?: string | null;  // Instagram profili və ya linki
  facebook?: string | null;   // Facebook səhifəsi
  tiktok?: string | null;     // TikTok profili
  telegram?: string | null;   // Telegram kanalı və ya istifadəçi adı
  createdAt: string;
  updatedAt: string;
  services?: Service[];
  staff?: Staff[];
  bookings?: Booking[];
}

export interface Service {
  id: string;
  tenantId: string;
  nameAz: string;
  nameRu?: string; // Rusca xidmət adı
  nameEn: string;
  duration: number; // in minutes
  price: number; // in AZN
  category: string;
  categoryRu?: string;
  categoryEn?: string;
  isActive?: boolean; // Xidmətin aktiv və ya bloklanmış olması
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  serviceIds?: string[]; // Mütəxəssisə təhkim edilmiş xidmətlərin ID siyahısı
  slotDuration?: number; // Mütəxəssisin fərdi vaxt aralığı (dəqiqə ilə, məs: 30, 60, 120). Təyin edilməyibsə xidmətin müddəti əsas götürülür.
}

export interface Booking {
  id: string;
  tenantId: string;
  tenantName?: string;
  customerName: string;
  customerPhone: string;
  customerFin?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  staffId: string;
  staffName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  duration?: number; // Rezervasiya müddəti (dəqiqə ilə)
  status: BookingStatus;
  clientIp?: string;        // Rezervasiya edilən IP / qurğu
  customerScore?: number;   // Müştəriyə verilən xal / bal (1 - 100)
  adminNotes?: string;      // Müştəri/rezervasiya haqqında daxili qeyd
  noShowCount?: number;     // Müştərinin gəlmədiyi rezervasiyaların sayı
  isBlocked?: boolean;      // Bloklanmış olub-olmaması
  createdAt: string;
}

export interface Patient {
  id: string;
  tenantId: string;
  fullName: string;
  fin: string;
  phone?: string | null;
  birthDate?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  notes?: string | null;
  encounters?: ClinicalEncounter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockedCustomer {
  id: string;
  phone?: string;
  fin?: string;
  ip?: string;
  customerName?: string;
  reason: string;
  noShowCount: number;
  isManual?: boolean;
  blockedAt: string;
  blockedBy?: string;
}

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  prescription?: string | null;
  encounterDate: string;
}

// Xidmət Keyfiyyəti və Müştəri Rəyləri
export interface CustomerReview {
  id: string;
  tenantId: string;
  tenantName?: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 - 5 ulduz
  comment: string;
  serviceName?: string;
  clientIp?: string; // Rəy yazan istifadəçinin IP ünvanı (təkrar rəy məhdudiyyəti üçün)
  createdAt: string;
}

// Super Adminə Rəy və Təklif Bildirişləri
export type FeedbackType = 'FEATURE' | 'IMPROVEMENT' | 'BUG' | 'COMPLAINT' | 'OTHER';
export type FeedbackStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FeedbackSuggestion {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: FeedbackType;
  subject: string;
  message: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

