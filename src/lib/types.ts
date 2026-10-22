export type TenantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  sector: string;
  status: TenantStatus;
  medicalEnabled: boolean;
  phone?: string | null;
  address?: string | null;
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
