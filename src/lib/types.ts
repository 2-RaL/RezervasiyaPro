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
  nameEn: string;
  duration: number; // in minutes
  price: number; // in AZN
  category: string;
  isActive?: boolean; // Xidmətin aktiv və ya bloklanmış olması
  description?: string;
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  role: string;
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
  status: BookingStatus;
  createdAt: string;
}

export interface Patient {
  id: string;
  tenantId: string;
  fullName: string;
  fin: string;
  birthDate?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  encounters?: ClinicalEncounter[];
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

