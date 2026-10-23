import fs from 'fs';
import path from 'path';
import { 
  Tenant, 
  Service, 
  Staff, 
  Booking, 
  Patient, 
  ClinicalEncounter, 
  BookingStatus, 
  User, 
  UserRole,
  CustomerReview,
  FeedbackSuggestion
} from './types';

interface DatabaseSchema {
  users: User[];
  tenants: Tenant[];
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  patients: Patient[];
  encounters: ClinicalEncounter[];
  reviews: CustomerReview[];
  feedbacks: FeedbackSuggestion[];
}

const dataDir = path.resolve(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'db.json');

const defaultData: DatabaseSchema = {
  users: [
    {
      id: 'usr-super',
      username: 'superadmin',
      password: 'admin123',
      fullName: 'Super Administrator',
      role: 'SUPER_ADMIN',
      tenantId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin',
      username: 'admin',
      password: 'admin123',
      fullName: 'Baş İnzibatçı',
      role: 'SUPER_ADMIN',
      tenantId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin-gozellik',
      username: 'admin_gozellik',
      password: 'admin123',
      fullName: 'Aysel Xanım (Gözəllik Admini)',
      role: 'ADMIN',
      tenantId: 'tenant-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin-klinika',
      username: 'admin_klinika',
      password: 'admin123',
      fullName: 'Dr. Rəşad Əliyev (Klinika Admini)',
      role: 'ADMIN',
      tenantId: 'tenant-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-editor-gozellik',
      username: 'editor_gozellik',
      password: 'editor123',
      fullName: 'Nərmin Məmmədova (Redaktor)',
      role: 'EDITOR',
      tenantId: 'tenant-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  tenants: [
    {
      id: 'tenant-1',
      name: 'Gözəllik və Estetik Mərkəzi',
      slug: 'gozellik-merkezi',
      sector: 'Gözəllik & Kosmetologiya',
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
      sector: 'Səhiyyə & Diaqnostika',
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
      sector: 'Bərbərxana & Stil',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 55 777 88 99',
      address: 'Bakı şəh., 28 May küç. 14',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-4',
      name: 'ProAuto Təmir & Detailing Mərkəzi',
      slug: 'avto-servis',
      sector: 'Avtomobil & Detailing',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 50 333 44 22',
      address: 'Bakı şəh., Babək pr. 58',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-5',
      name: 'Grand Fitness & Yoga Studiyası',
      slug: 'fit-studio',
      sector: 'İdman & Fitnes',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 12 598 00 11',
      address: 'Bakı şəh., Fəvvarələr meydanı 12',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-6',
      name: 'Zirvə Tədris & İnkişaf Mərkəzi',
      slug: 'tedris-merkezi',
      sector: 'Təhsil & Fərdi Dərslər',
      status: 'ACTIVE',
      medicalEnabled: false,
      phone: '+994 50 888 12 34',
      address: 'Bakı şəh., Cəfər Cabbarlı küç. 28',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tenant-osteopat',
      name: 'Osteopat.az - Manuel Terapiya və Reabilitasiya Mərkəzi',
      slug: 'osteopat',
      sector: 'Reabilitasiya & Osteopatiya',
      status: 'ACTIVE',
      medicalEnabled: true,
      phone: '+994 50 700 80 90',
      address: 'Bakı şəh., Zərifə Əliyeva küç. 24',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  services: [
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
    },
    {
      id: 'srv-auto-1',
      tenantId: 'tenant-4',
      nameAz: 'Kompleks Detailing & Keramika Qoruma',
      nameEn: 'Complex Detailing & Ceramic Coating',
      duration: 180,
      price: 200,
      category: 'Detailing'
    },
    {
      id: 'srv-auto-2',
      tenantId: 'tenant-4',
      nameAz: 'Kompüter Diaqnostikası və Texniki Baxış',
      nameEn: 'Computer Diagnostics & Inspection',
      duration: 45,
      price: 40,
      category: 'Diaqnostika'
    },
    {
      id: 'srv-fit-1',
      tenantId: 'tenant-5',
      nameAz: 'Fərdi Məşqçi ilə Personal Training',
      nameEn: 'Personal Training Session',
      duration: 60,
      price: 50,
      category: 'Fərdi Məşq'
    },
    {
      id: 'srv-edu-1',
      tenantId: 'tenant-6',
      nameAz: 'Fərdi IELTS / TOEFL İmtahan Hazırlığı',
      nameEn: 'One-on-One IELTS / TOEFL Prep',
      duration: 90,
      price: 40,
      category: 'Xarici Dil'
    },
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
    }
  ],
  staff: [
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
    },
    {
      id: 'stf-auto-1',
      tenantId: 'tenant-4',
      name: 'Elçin Qasımov',
      role: 'Baş Detailing Ustası'
    },
    {
      id: 'stf-fit-1',
      tenantId: 'tenant-5',
      name: 'Murad Əliyev',
      role: 'Sertifikatlı Fitnes Təlimçisi'
    },
    {
      id: 'stf-edu-1',
      tenantId: 'tenant-6',
      name: 'Nigar Əhmədova',
      role: 'IELTS Baş Təlimçi (C2)'
    },
    {
      id: 'stf-ost-1',
      tenantId: 'tenant-osteopat',
      name: 'Dr. Elmir Məmmədov',
      role: 'Baş Həkim-Osteopat'
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
  ],
  reviews: [
    {
      id: 'rev-1',
      tenantId: 'tenant-1',
      tenantName: 'Gözəllik və Estetik Mərkəzi',
      customerName: 'Günay Əliyeva',
      customerPhone: '+994 50 234 56 78',
      rating: 5,
      comment: 'Lazer epilyasiyası xidmətindən çox razı qaldım. Heyət çox peşəkardır, mütləq tövsiyə edirəm!',
      serviceName: 'Lazer Epilyasiyası (Tam bədən)',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'rev-2',
      tenantId: 'tenant-2',
      tenantName: 'Modern Klinika & Stomatologiya',
      customerName: 'Kənan Məmmədov',
      customerPhone: '+994 55 987 65 43',
      rating: 5,
      comment: 'Həkim çox diqqətli idi, müayinə və rentgen sürətli və ağrısız keçdi.',
      serviceName: 'Stomatoloji Müayinə və Rentgen',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'rev-3',
      tenantId: 'tenant-3',
      tenantName: 'VIP Barber Club Baku',
      customerName: 'Fərid Həsənov',
      customerPhone: '+994 70 333 22 11',
      rating: 5,
      comment: 'Əla usta, saç və saqqal dizaynı tam istədiyim kimi oldu. Qulluq yüksək səviyyədədir.',
      serviceName: 'Klassik Saç Kəsimi və Saqqal Dizaynı',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'rev-4',
      tenantId: 'tenant-osteopat',
      tenantName: 'Osteopat.az - Manuel Terapiya və Reabilitasiya',
      customerName: 'Leyla Rüstəmova',
      customerPhone: '+994 50 555 44 33',
      rating: 5,
      comment: 'Onurğa ağrılarım ilk seansdan sonra xeyli yüngülləşdi. Həkimin manual terapiyası möcüzədir!',
      serviceName: 'Onurğa və Oynaqlarda Manuel Terapiya',
      createdAt: new Date().toISOString()
    }
  ],
  feedbacks: [
    {
      id: 'fb-1',
      tenantId: 'tenant-1',
      tenantName: 'Gözəllik və Estetik Mərkəzi',
      userId: 'usr-admin-gozellik',
      userName: 'Aysel Xanım (Gözəllik Admini)',
      userRole: 'ADMIN',
      type: 'FEATURE',
      subject: 'SMS Xatırlatma inteqrasiyası',
      message: 'Müştərilərə rezervasiyadan 2 saat əvvəl avtomatik SMS xatırlatması göndərilməsi çox faydalı olardı.',
      priority: 'HIGH',
      status: 'IN_REVIEW',
      adminNote: 'Növbəti yenilənmə planına daxil edildi.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'fb-2',
      tenantId: 'tenant-2',
      tenantName: 'Modern Klinika & Stomatologiya',
      userId: 'usr-admin-klinika',
      userName: 'Dr. Rəşad Əliyev (Klinika Admini)',
      userRole: 'ADMIN',
      type: 'IMPROVEMENT',
      subject: 'Pasiyent kartında qan qrupunun tez görünməsi',
      message: 'Pasiyentin qan qrupu və allergiyası rezervasiya vərəqəsində də dərhal çıxsa çox rahat olardı.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      adminNote: 'FİN tibbi kartına əlavə edildi.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
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
      users: parsed.users || defaultData.users,
      tenants: parsed.tenants || defaultData.tenants,
      services: parsed.services || defaultData.services,
      staff: parsed.staff || defaultData.staff,
      bookings: parsed.bookings || defaultData.bookings,
      patients: parsed.patients || defaultData.patients,
      encounters: parsed.encounters || defaultData.encounters,
      reviews: parsed.reviews || defaultData.reviews,
      feedbacks: parsed.feedbacks || defaultData.feedbacks,
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
    price: Number(data.price) || 0,
    isActive: data.isActive !== undefined ? data.isActive : true
  };
  db.services.push(newService);
  writeDb(db);
  return newService;
}

export function updateService(id: string, data: Partial<Service>): Service | null {
  const db = readDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index === -1) return null;
  db.services[index] = { 
    ...db.services[index], 
    ...data,
    ...(data.duration !== undefined ? { duration: Number(data.duration) } : {}),
    ...(data.price !== undefined ? { price: Number(data.price) } : {})
  };
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
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
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

// ── USERS & AUTHENTICATION API ─────────────────────────────────────────
export function getUsers(tenantId?: string | null): User[] {
  const db = readDb();
  let list = db.users || [];
  if (tenantId) {
    list = list.filter(u => u.tenantId === tenantId);
  }
  return list.map(u => {
    const tenant = u.tenantId ? db.tenants.find(t => t.id === u.tenantId) : null;
    return {
      ...u,
      tenantName: tenant ? tenant.name : (u.role === 'SUPER_ADMIN' ? 'Bütün Sistem (Super Admin)' : 'Təyin edilməyib')
    };
  });
}

export function getUserByUsername(username: string): User | undefined {
  const db = readDb();
  const search = username.toLowerCase().trim();
  return (db.users || []).find(u => u.username.toLowerCase() === search);
}

export function getUserById(id: string): User | undefined {
  const db = readDb();
  return (db.users || []).find(u => u.id === id);
}

export function validateUserCredentials(username: string, password: string): User | null {
  const db = readDb();
  const user = (db.users || []).find(
    u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password.trim()
  );
  if (!user) return null;
  if (user.isActive === false) {
    throw new Error('Hesabınız bloklanıb! Zəhmət olmasa baş administratorla əlaqə saxlayın.');
  }
  const tenant = user.tenantId ? db.tenants.find(t => t.id === user.tenantId) : null;
  return {
    ...user,
    tenantName: tenant ? tenant.name : (user.role === 'SUPER_ADMIN' ? 'Bütün Sistem' : undefined)
  };
}

export function createUser(data: {
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  tenantId?: string | null;
  fin?: string;
  phone?: string;
  isActive?: boolean;
  createdBy?: string | null;
}): { success: boolean; user?: User; error?: string } {
  const db = readDb();
  const cleanUsername = data.username.toLowerCase().trim();

  // Check unique username
  const existing = (db.users || []).find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, error: 'Bu istifadəçi adı artıq mövcuddur' };
  }

  // Check if role is EDITOR: only 1 editor allowed per tenant/company!
  if (data.role === 'EDITOR') {
    if (!data.tenantId) {
      return { success: false, error: 'Redaktor üçün filial təyin edilməlidir' };
    }
    const existingEditor = (db.users || []).find(u => u.tenantId === data.tenantId && u.role === 'EDITOR');
    if (existingEditor) {
      return { 
        success: false, 
        error: `Bu filial üçün artıq redaktor (${existingEditor.fullName}) təyin edilib. Şirkət üzrə yalnız 1 redaktor ola bilər.` 
      };
    }
  }

  const newUser: User = {
    id: 'usr-' + Date.now(),
    username: cleanUsername,
    password: data.password || 'admin123',
    fullName: data.fullName.trim(),
    role: data.role,
    tenantId: data.tenantId || null,
    fin: data.fin ? data.fin.trim().toUpperCase() : '',
    phone: data.phone ? data.phone.trim() : '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdBy: data.createdBy || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.users) db.users = [];
  db.users.push(newUser);
  writeDb(db);

  const tenant = newUser.tenantId ? db.tenants.find(t => t.id === newUser.tenantId) : null;
  return { 
    success: true, 
    user: { ...newUser, tenantName: tenant ? tenant.name : undefined } 
  };
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDb();
  if (!db.users) db.users = [];
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  // If changing username, check uniqueness
  if (updates.username) {
    const cleanUsername = updates.username.toLowerCase().trim();
    const existing = db.users.find(u => u.id !== id && u.username.toLowerCase() === cleanUsername);
    if (existing) return null;
    updates.username = cleanUsername;
  }

  // If changing role to EDITOR, check uniqueness per tenant
  if (updates.role === 'EDITOR' && updates.tenantId) {
    const existingEditor = db.users.find(u => u.id !== id && u.tenantId === updates.tenantId && u.role === 'EDITOR');
    if (existingEditor) return null;
  }

  // If password was empty string, do not overwrite with empty
  const cleanUpdates = { ...updates };
  if (cleanUpdates.password !== undefined && cleanUpdates.password.trim() === '') {
    delete cleanUpdates.password;
  }
  if (cleanUpdates.fin) {
    cleanUpdates.fin = cleanUpdates.fin.trim().toUpperCase();
  }

  db.users[index] = {
    ...db.users[index],
    ...cleanUpdates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.users[index];
}

export function deleteUser(id: string): boolean {
  const db = readDb();
  if (!db.users) return false;
  const initialLen = db.users.length;
  db.users = db.users.filter(u => u.id !== id);
  writeDb(db);
  return db.users.length < initialLen;
}

export function getEditorForTenant(tenantId: string): User | null {
  const db = readDb();
  return (db.users || []).find(u => u.tenantId === tenantId && u.role === 'EDITOR') || null;
}

// ── DASHBOARD STATS ────────────────────────────────────────────────────
export function getDashboardStats(tenantId?: string | null) {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];

  let relevantBookings = db.bookings;
  let relevantServices = db.services;
  let relevantStaff = db.staff;
  let relevantTenants = db.tenants;

  if (tenantId && tenantId !== 'all') {
    relevantBookings = db.bookings.filter(b => b.tenantId === tenantId);
    relevantServices = db.services.filter(s => s.tenantId === tenantId);
    relevantStaff = db.staff.filter(st => st.tenantId === tenantId);
    relevantTenants = db.tenants.filter(t => t.id === tenantId);
  }

  const todayBookings = relevantBookings.filter(b => b.date === todayStr);

  let totalRevenue = 0;
  relevantBookings.forEach(b => {
    if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
      const srv = db.services.find(s => s.id === b.serviceId);
      if (srv) totalRevenue += Number(srv.price);
    }
  });

  return {
    totalBookings: relevantBookings.length,
    todayBookingsCount: todayBookings.length,
    activeTenantsCount: relevantTenants.filter(t => t.status === 'ACTIVE').length,
    totalServicesCount: relevantServices.length,
    totalStaffCount: relevantStaff.length,
    totalRevenue,
    pendingBookings: relevantBookings.filter(b => b.status === 'CONFIRMED').length,
    completedBookings: relevantBookings.filter(b => b.status === 'COMPLETED').length,
    cancelledBookings: relevantBookings.filter(b => b.status === 'CANCELLED').length
  };
}

export function resetDemoData(): void {
  writeDb(defaultData);
}

// ── CUSTOMER REVIEWS & QUALITY API ────────────────────────────────────
export function getReviews(tenantId?: string): CustomerReview[] {
  const db = readDb();
  let list = db.reviews || [];
  if (tenantId && tenantId !== 'all') {
    list = list.filter(r => r.tenantId === tenantId);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createReview(data: Omit<CustomerReview, 'id' | 'createdAt'>): CustomerReview {
  const db = readDb();
  if (!db.reviews) db.reviews = [];
  const tenant = db.tenants.find(t => t.id === data.tenantId);
  const newReview: CustomerReview = {
    ...data,
    id: 'rev-' + Date.now(),
    tenantName: data.tenantName || (tenant ? tenant.name : 'Müəssisə'),
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    createdAt: new Date().toISOString()
  };
  db.reviews.unshift(newReview);
  writeDb(db);
  return newReview;
}

export function deleteReview(id: string): boolean {
  const db = readDb();
  if (!db.reviews) return false;
  const initialLen = db.reviews.length;
  db.reviews = db.reviews.filter(r => r.id !== id);
  writeDb(db);
  return db.reviews.length < initialLen;
}

// ── FEEDBACKS & SUGGESTIONS API (SUPER ADMIN) ──────────────────────────
export function getFeedbacks(tenantId?: string): FeedbackSuggestion[] {
  const db = readDb();
  let list = db.feedbacks || [];
  if (tenantId && tenantId !== 'all') {
    list = list.filter(f => f.tenantId === tenantId);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createFeedback(data: Omit<FeedbackSuggestion, 'id' | 'createdAt' | 'updatedAt'>): FeedbackSuggestion {
  const db = readDb();
  if (!db.feedbacks) db.feedbacks = [];
  const tenant = db.tenants.find(t => t.id === data.tenantId);
  const newFeedback: FeedbackSuggestion = {
    ...data,
    id: 'fb-' + Date.now(),
    tenantName: data.tenantName || (tenant ? tenant.name : 'Filial'),
    status: data.status || 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.feedbacks.unshift(newFeedback);
  writeDb(db);
  return newFeedback;
}

export function updateFeedback(id: string, data: Partial<FeedbackSuggestion>): FeedbackSuggestion | null {
  const db = readDb();
  if (!db.feedbacks) return null;
  const index = db.feedbacks.findIndex(f => f.id === id);
  if (index === -1) return null;
  db.feedbacks[index] = {
    ...db.feedbacks[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.feedbacks[index];
}

export function deleteFeedback(id: string): boolean {
  const db = readDb();
  if (!db.feedbacks) return false;
  const initialLen = db.feedbacks.length;
  db.feedbacks = db.feedbacks.filter(f => f.id !== id);
  writeDb(db);
  return db.feedbacks.length < initialLen;
}


