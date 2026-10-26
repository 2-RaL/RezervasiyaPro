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
  whatsappNotificationEnabled?: boolean; // Avtomatik WhatsApp bildirişinin aktiv olması
  whatsappTemplate?: string | null;      // Avtomatik WhatsApp bildiriş şablonu
  whatsappProvider?: 'DIRECT' | 'META' | 'CUSTOM_GATEWAY'; // Mesaj göndərmə metodu
  whatsappPhoneNumberId?: string | null; // Meta WhatsApp Cloud API Phone Number ID
  whatsappAccessToken?: string | null;   // Meta WhatsApp Cloud API Access Token
  whatsappWabaId?: string | null;        // Meta WhatsApp Business Account ID
  whatsappGatewayUrl?: string | null;    // Custom Gateway / Webhook URL
  instagram?: string | null;  // Instagram profili və ya linki
  facebook?: string | null;   // Facebook səhifəsi
  tiktok?: string | null;     // TikTok profili
  telegram?: string | null;   // Telegram kanalı və ya istifadəçi adı
  blockedDays?: number[];     // Şirkət üzrə həftəlik qeyri-iş günləri (0=Bazar, ...)
  blockedDates?: string[];    // Şirkət üzrə bayram və qeyri-iş tarixləri
  workStartTime?: string;     // Ümumi iş başlama saatı (məs: '09:00')
  workEndTime?: string;       // Ümumi iş bitmə saatı (məs: '21:00')
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
  blockedDays?: number[];   // Həftənin bloklanmış günləri: 0=Bazar, 1=B.e, 2=Ç.a, 3=Ç, 4=C.a, 5=C, 6=Şənbə
  blockedDates?: string[];  // Fərdi bloklanmış tarixlər: ['2026-10-31', '2026-11-01']
  workStartTime?: string;   // Xidmət üçün iş başlama saatı (məs: '09:00')
  workEndTime?: string;     // Xidmət üçün iş bitmə saatı (məs: '21:00')
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

// ── AUDIT & ACTIVITY LOG (FƏALİYYƏT CƏDVƏLİ VƏ GERİ QAYTARMA) ─────────────
export type ActivityActionType =
  | 'SERVICE_CREATE'
  | 'SERVICE_UPDATE'
  | 'SERVICE_DELETE'
  | 'STAFF_CREATE'
  | 'STAFF_UPDATE'
  | 'STAFF_DELETE'
  | 'BOOKING_CREATE'
  | 'BOOKING_UPDATE'
  | 'BOOKING_CANCEL'
  | 'BOOKING_DELETE'
  | 'CUSTOMER_BLOCK'
  | 'CUSTOMER_UNBLOCK'
  | 'PATIENT_CREATE'
  | 'PATIENT_DELETE';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  tenantId?: string | null;
  tenantName?: string;
  actionType: ActivityActionType;
  entityType: 'SERVICE' | 'STAFF' | 'BOOKING' | 'CUSTOMER' | 'PATIENT';
  entityId: string;
  entityName: string;
  description: string;
  snapshotBefore?: any;
  snapshotAfter?: any;
  isReverted?: boolean;
  revertedAt?: string;
  revertedBy?: string;
}

export interface WhatsAppLogItem {
  id: string;
  tenantId: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  method: 'META_API' | 'DIRECT_LINK' | 'CUSTOM_GATEWAY';
  status: 'SENT' | 'READY' | 'FAILED' | 'INVALID_PHONE';
  errorDetails?: string;
  metaMessageId?: string;
  createdAt: string;
}

