import fs from 'fs';
import path from 'path';
import { Tenant, Service, Staff, Booking, Patient, ClinicalEncounter, BookingStatus } from './types';

interface DatabaseSchema {
  tenants: Tenant[];
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  patients: Patient[];
  encounters: ClinicalEncounter[];
}

const dataDir = path.resolve(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'db.json');

const defaultData: DatabaseSchema = {
  tenants: [
    {
      id: 'tenant-osteopat',
      name: 'Osteopat.az - Manuel Terapiya və Reabilitasiya Mərkəzi',
      slug: 'osteopat',
      sector: 'Osteopatiya & Səhiyyə',
      status: 'ACTIVE',
      medicalEnabled: true,
      phone: '+994 50 700 80 90',
      address: 'Bakı şəh., Zərifə Əliyeva küç. 24',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-1',
      name: 'Gözəllik və Estetik Mərkəzi',
      slug: 'gozellik-merkezi',
      sector: 'Gözəllik & Qulluq',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 50 222 33 44',
      address: 'Bakı şəh., Nizami küç. 45',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-2',
      name: 'Modern Klinika & Stomatologiya',
      slug: 'modern-klinika',
      sector: 'Səhiyyə & Klinika',
      status: 'ACTIVE',
      medicalEnabled: true,
      phone: '+994 12 444 55 66',
      address: 'Bakı şəh., Azadlıq pr. 102',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-3',
      name: 'VIP Barber Club Baku',
      slug: 'vip-barber',
      sector: 'Bərbərxana & Saç',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 55 777 88 99',
      address: 'Bakı şəh., 28 May küç. 14',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  services: [
    {
      id: 'srv-ost-1',
      tenantId: 'tenant-osteopat',
      nameAz: 'Osteopatik İlkin Müayinə və Diaqnostika',
      nameEn: 'Osteopathic Initial Examination & Diagnosis',
      duration: 60,
      price: 80,
      category: 'Müayinə'
    },
    {
      id: 'srv-ost-2',
      tenantId: 'tenant-osteopat',
      nameAz: 'Onurğa və Oynaqlarda Manuel Terapiya',
      nameEn: 'Spine & Joint Manual Therapy',
      duration: 45,
      price: 60,
      category: 'Manuel Terapiya'
    },
    {
      id: 'srv-ost-3',
      tenantId: 'tenant-osteopat',
      nameAz: 'Skolioz və Kifoz Korreksiyası (Fizioterapiya)',
      nameEn: 'Scoliosis & Kyphosis Correction',
      duration: 45,
      price: 50,
      category: 'Reabilitasiya'
    },
    {
      id: 'srv-ost-4',
      tenantId: 'tenant-osteopat',
      nameAz: 'Kəskin Bel və Boyun Ağrılarının Aradan Qaldırılması',
      nameEn: 'Acute Neck & Back Pain Relief',
      duration: 40,
      price: 70,
      category: 'Ağrı Müalicəsi'
    },
    {
      id: 'srv-ost-5',
      tenantId: 'tenant-osteopat',
      nameAz: 'Müalicəvi Bərpa Massajı',
      nameEn: 'Medical Recovery Massage',
      duration: 50,
      price: 55,
      category: 'Massaj'
    },
    {
      id: 'srv-1',
      tenantId: 'tenant-1',
      nameAz: 'Lazer Epilyasiyası (Tam bədən)',
      nameEn: 'Full Body Laser Hair Removal',
      duration: 60,
      price: 120,
      category: 'Kosmetologiya'
    },
    {
      id: 'srv-2',
      tenantId: 'tenant-1',
      nameAz: 'Dərinin Dərin Təmizlənməsi (Hydrafacial)',
      nameEn: 'Deep Cleansing Hydrafacial',
      duration: 45,
      price: 85,
      category: 'Kosmetologiya'
    },
    {
      id: 'srv-3',
      tenantId: 'tenant-2',
      nameAz: 'Stomatoloji Müayinə və Rentgen',
      nameEn: 'Dental Examination & X-Ray',
      duration: 30,
      price: 40,
      category: 'Stomatologiya'
    },
    {
      id: 'srv-4',
      tenantId: 'tenant-2',
      nameAz: 'Diş Ağardılması (Zoom 4)',
      nameEn: 'Teeth Whitening Zoom 4',
      duration: 60,
      price: 250,
      category: 'Stomatologiya'
    },
    {
      id: 'srv-5',
      tenantId: 'tenant-3',
      nameAz: 'Klassik Saç Kəsimi və Saqqal Dizaynı',
      nameEn: 'Classic Haircut & Beard Design',
      duration: 45,
      price: 35,
      category: 'Saç & Saqqal'
    }
  ],
  staff: [
    {
      id: 'stf-ost-1',
      tenantId: 'tenant-osteopat',
      name: 'Dr. Elmir Məmmədov',
      role: 'Baş Həkim-Osteopat'
    },
    {
      id: 'stf-ost-2',
      tenantId: 'tenant-osteopat',
      name: 'Dr. Leyla Rəhimova',
      role: 'Fizioterapevt / Reabilitoloq'
    },
    {
      id: 'stf-ost-3',
      tenantId: 'tenant-osteopat',
      name: 'Tural Əliyev',
      role: 'Manuel Terapevt'
    },
    {
      id: 'stf-1',
      tenantId: 'tenant-1',
      name: 'Aysel Quliyeva',
      role: 'Baş Kosmetoloq'
    },
    {
      id: 'stf-2',
      tenantId: 'tenant-1',
      name: 'Nərmin Məmmədova',
      role: 'Lazer Mütəxəssisi'
    },
    {
      id: 'stf-3',
      tenantId: 'tenant-2',
      name: 'Dr. Rəşad Əliyev',
      role: 'Ortodont / Stomatoloq'
    },
    {
      id: 'stf-4',
      tenantId: 'tenant-2',
      name: 'Dr. Günel Həsənova',
      role: 'Terapevt-Stomatoloq'
    },
    {
      id: 'stf-5',
      tenantId: 'tenant-3',
      name: 'Kamran Əhmədov',
      role: 'Top Barber Master'
    }
  ],
  bookings: [
    {
      id: 'bkg-101',
      tenantId: 'tenant-1',
      customerName: 'Sevinc Məhərrəmova',
      customerPhone: '+994 50 111 22 33',
      customerFin: '7ABC123',
      serviceId: 'srv-1',
      staffId: 'stf-2',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '11:00',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bkg-102',
      tenantId: 'tenant-2',
      customerName: 'Anar Qasımov',
      customerPhone: '+994 55 999 88 77',
      customerFin: '5XYZ987',
      serviceId: 'srv-3',
      staffId: 'stf-3',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '14:30',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bkg-103',
      tenantId: 'tenant-3',
      customerName: 'Murad Babayev',
      customerPhone: '+994 70 333 44 55',
      serviceId: 'srv-5',
      staffId: 'stf-5',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '16:00',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    }
  ],
  patients: [
    {
      id: 'pat-1',
      tenantId: 'tenant-2',
      fullName: 'Anar Qasımov',
      fin: '5XYZ987',
      birthDate: '1992-05-14',
      bloodGroup: 'A (II) Rh+',
      allergies: 'Penisilin allergiyası yoxdur',
      encounters: []
    }
  ],
  encounters: [
    {
      id: 'enc-1',
      patientId: 'pat-1',
      doctorName: 'Dr. Rəşad Əliyev',
      diagnosis: 'Karies profilaktikası və ilkin baxış',
      treatment: 'Rentgen müayinəsi aparıldı, diş minası təmizləndi.',
      prescription: 'Kalsium tərkibli pasta, antiseptik qələvi yaxalama',
      encounterDate: new Date().toISOString()
    }
  ]
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(dataFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      tenants: parsed.tenants || defaultData.tenants,
      services: parsed.services || defaultData.services,
      staff: parsed.staff || defaultData.staff,
      bookings: parsed.bookings || defaultData.bookings,
      patients: parsed.patients || defaultData.patients,
      encounters: parsed.encounters || defaultData.encounters,
    };
  } catch (err) {
    console.error('DataStore read error, using fallback in-memory:', err);
    return defaultData;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('DataStore write error:', err);
  }
}

// ── TENANTS API ────────────────────────────────────────────────────────
export function getTenants(): Tenant[] {
  const db = readDb();
  return db.tenants.map(t => ({
    ...t,
    services: db.services.filter(s => s.tenantId === t.id),
    staff: db.staff.filter(s => s.tenantId === t.id)
  }));
}

export function getTenantBySlug(slug: string): Tenant | null {
  const db = readDb();
  const searchSlug = slug.toLowerCase().trim();
  const t = db.tenants.find(x => 
    x.slug.toLowerCase() === searchSlug ||
    (searchSlug === 'osteopatiya' && x.slug === 'osteopat')
  );
  if (!t) return null;
  return {
    ...t,
    services: db.services.filter(s => s.tenantId === t.id),
    staff: db.staff.filter(s => s.tenantId === t.id),
    bookings: db.bookings.filter(b => b.tenantId === t.id)
  };
}

export function createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant {
  const db = readDb();
  const newTenant: Tenant = {
    ...data,
    id: 'tenant-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.tenants.push(newTenant);
  writeDb(db);
  return newTenant;
}

export function updateTenant(id: string, data: Partial<Tenant>): Tenant | null {
  const db = readDb();
  const index = db.tenants.findIndex(t => t.id === id);
  if (index === -1) return null;
  db.tenants[index] = {
    ...db.tenants[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.tenants[index];
}

export function deleteTenant(id: string): boolean {
  const db = readDb();
  const initialLength = db.tenants.length;
  db.tenants = db.tenants.filter(t => t.id !== id);
  db.services = db.services.filter(s => s.tenantId !== id);
  db.staff = db.staff.filter(s => s.tenantId !== id);
  db.bookings = db.bookings.filter(b => b.tenantId !== id);
  writeDb(db);
  return db.tenants.length < initialLength;
}

// ── SERVICES API ───────────────────────────────────────────────────────
export function getServices(tenantId?: string): Service[] {
  const db = readDb();
  if (tenantId) return db.services.filter(s => s.tenantId === tenantId);
  return db.services;
}

export function createService(data: Omit<Service, 'id'>): Service {
  const db = readDb();
  const newService: Service = {
    ...data,
    id: 'srv-' + Date.now(),
    duration: Number(data.duration) || 30,
    price: Number(data.price) || 0
  };
  db.services.push(newService);
  writeDb(db);
  return newService;
}

export function updateService(id: string, data: Partial<Service>): Service | null {
  const db = readDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index === -1) return null;
  db.services[index] = { ...db.services[index], ...data };
  writeDb(db);
  return db.services[index];
}

export function deleteService(id: string): boolean {
  const db = readDb();
  const len = db.services.length;
  db.services = db.services.filter(s => s.id !== id);
  writeDb(db);
  return db.services.length < len;
}

// ── STAFF API ──────────────────────────────────────────────────────────
export function getStaff(tenantId?: string): Staff[] {
  const db = readDb();
  if (tenantId) return db.staff.filter(s => s.tenantId === tenantId);
  return db.staff;
}

export function createStaff(data: Omit<Staff, 'id'>): Staff {
  const db = readDb();
  const newStaff: Staff = {
    ...data,
    id: 'stf-' + Date.now()
  };
  db.staff.push(newStaff);
  writeDb(db);
  return newStaff;
}

export function updateStaff(id: string, data: Partial<Staff>): Staff | null {
  const db = readDb();
  const index = db.staff.findIndex(s => s.id === id);
  if (index === -1) return null;
  db.staff[index] = { ...db.staff[index], ...data };
  writeDb(db);
  return db.staff[index];
}

export function deleteStaff(id: string): boolean {
  const db = readDb();
  const len = db.staff.length;
  db.staff = db.staff.filter(s => s.id !== id);
  writeDb(db);
  return db.staff.length < len;
}

// ── BOOKINGS API ───────────────────────────────────────────────────────
export function getBookings(filters?: {
  tenantId?: string;
  status?: string;
  date?: string;
  search?: string;
}): Booking[] {
  const db = readDb();
  let list = db.bookings.map(b => {
    const tenant = db.tenants.find(t => t.id === b.tenantId);
    const service = db.services.find(s => s.id === b.serviceId);
    const staffMember = db.staff.find(st => st.id === b.staffId);
    return {
      ...b,
      tenantName: tenant ? tenant.name : 'Naməlum Filial',
      serviceName: service ? service.nameAz : 'Xidmət',
      servicePrice: service ? service.price : 0,
      staffName: staffMember ? staffMember.name : 'Təyin edilməyib'
    };
  });

  if (filters?.tenantId && filters.tenantId !== 'all') {
    list = list.filter(b => b.tenantId === filters.tenantId);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter(b => b.status === filters.status);
  }
  if (filters?.date) {
    list = list.filter(b => b.date === filters.date);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    list = list.filter(b =>
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.toLowerCase().includes(term) ||
      (b.customerFin && b.customerFin.toLowerCase().includes(term))
    );
  }

  // Sort by date and time descending
  return list.sort((a, b) => (b.date + b.timeSlot).localeCompare(a.date + a.timeSlot));
}

export function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const db = readDb();
  const newBooking: Booking = {
    ...data,
    id: 'bkg-' + Math.floor(1000 + Math.random() * 9000),
    status: data.status || 'CONFIRMED',
    createdAt: new Date().toISOString()
  };
  db.bookings.push(newBooking);
  writeDb(db);
  return newBooking;
}

export function updateBookingStatus(id: string, status: BookingStatus): Booking | null {
  const db = readDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  db.bookings[index].status = status;
  writeDb(db);
  return db.bookings[index];
}

export function deleteBooking(id: string): boolean {
  const db = readDb();
  const len = db.bookings.length;
  db.bookings = db.bookings.filter(b => b.id !== id);
  writeDb(db);
  return db.bookings.length < len;
}

// ── PATIENTS & MEDICAL API ─────────────────────────────────────────────
export function getPatients(tenantId?: string): Patient[] {
  const db = readDb();
  let list = db.patients;
  if (tenantId) list = list.filter(p => p.tenantId === tenantId);
  return list.map(p => ({
    ...p,
    encounters: db.encounters.filter(e => e.patientId === p.id)
  }));
}

export function createPatient(data: Omit<Patient, 'id' | 'encounters'>): Patient {
  const db = readDb();
  const newPatient: Patient = {
    ...data,
    id: 'pat-' + Date.now(),
    encounters: []
  };
  db.patients.push(newPatient);
  writeDb(db);
  return newPatient;
}

export function addClinicalEncounter(patientId: string, data: Omit<ClinicalEncounter, 'id' | 'patientId' | 'encounterDate'>): ClinicalEncounter {
  const db = readDb();
  const newEncounter: ClinicalEncounter = {
    ...data,
    id: 'enc-' + Date.now(),
    patientId,
    encounterDate: new Date().toISOString()
  };
  db.encounters.push(newEncounter);
  writeDb(db);
  return newEncounter;
}

// ── DASHBOARD STATS ────────────────────────────────────────────────────
export function getDashboardStats() {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = db.bookings.filter(b => b.date === todayStr);

  let totalRevenue = 0;
  db.bookings.forEach(b => {
    if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
      const srv = db.services.find(s => s.id === b.serviceId);
      if (srv) totalRevenue += Number(srv.price);
    }
  });

  return {
    totalBookings: db.bookings.length,
    todayBookingsCount: todayBookings.length,
    activeTenantsCount: db.tenants.filter(t => t.status === 'ACTIVE').length,
    totalServicesCount: db.services.length,
    totalStaffCount: db.staff.length,
    totalRevenue,
    pendingBookings: db.bookings.filter(b => b.status === 'CONFIRMED').length,
    completedBookings: db.bookings.filter(b => b.status === 'COMPLETED').length,
    cancelledBookings: db.bookings.filter(b => b.status === 'CANCELLED').length
  };
}

export function resetDemoData(): void {
  writeDb(defaultData);
}
