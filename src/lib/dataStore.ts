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
  FeedbackSuggestion,
  BlockedCustomer,
  ActivityLog,
  ActivityActionType,
  WhatsAppLogItem
} from './types';
import { hashPassword, verifyPassword, isPasswordHashed, sanitizeUser } from './security';

export interface ActorInfo {
  id: string;
  name: string;
  role: UserRole;
  tenantId?: string | null;
}

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
  blockedCustomers?: BlockedCustomer[];
  activityLogs?: ActivityLog[];
  whatsappLogs?: WhatsAppLogItem[];
}

const dataDir = path.resolve(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'db.json');

const defaultData: DatabaseSchema = {
  users: [
    {
      id: 'usr-super',
      username: 'superadmin',
      password: hashPassword('admin123'),
      fullName: 'Super Administrator',
      role: 'SUPER_ADMIN',
      tenantId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin',
      username: 'admin',
      password: hashPassword('admin123'),
      fullName: 'Baş İnzibatçı',
      role: 'SUPER_ADMIN',
      tenantId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin-gozellik',
      username: 'admin_gozellik',
      password: hashPassword('admin123'),
      fullName: 'Aysel Xanım (Gözəllik Admini)',
      role: 'ADMIN',
      tenantId: 'tenant-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-admin-klinika',
      username: 'admin_klinika',
      password: hashPassword('admin123'),
      fullName: 'Dr. Rəşad Əliyev (Klinika Admini)',
      role: 'ADMIN',
      tenantId: 'tenant-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr-editor-gozellik',
      username: 'editor_gozellik',
      password: hashPassword('editor123'),
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
      nameRu: 'Лазерная эпиляция (Все тело)',
      nameEn: 'Full Body Laser Hair Removal',
      duration: 60,
      price: 120,
      category: 'Kosmetologiya'
    },
    {
      id: 'srv-2',
      tenantId: 'tenant-1',
      nameAz: 'Dərinin Dərin Təmizlənməsi (Hydrafacial)',
      nameRu: 'Глубокая чистка лица (Hydrafacial)',
      nameEn: 'Deep Cleansing Hydrafacial',
      duration: 45,
      price: 85,
      category: 'Kosmetologiya'
    },
    {
      id: 'srv-3',
      tenantId: 'tenant-2',
      nameAz: 'Stomatoloji Müayinə və Rentgen',
      nameRu: 'Стоматологический осмотр и рентген',
      nameEn: 'Dental Examination & X-Ray',
      duration: 30,
      price: 40,
      category: 'Stomatologiya'
    },
    {
      id: 'srv-4',
      tenantId: 'tenant-2',
      nameAz: 'Diş Ağardılması (Zoom 4)',
      nameRu: 'Отбеливание зубов (Zoom 4)',
      nameEn: 'Teeth Whitening Zoom 4',
      duration: 60,
      price: 250,
      category: 'Stomatologiya'
    },
    {
      id: 'srv-5',
      tenantId: 'tenant-3',
      nameAz: 'Klassik Saç Kəsimi və Saqqal Dizaynı',
      nameRu: 'Классическая стрижка и дизайн бороды',
      nameEn: 'Classic Haircut & Beard Design',
      duration: 45,
      price: 35,
      category: 'Saç & Saqqal'
    },
    {
      id: 'srv-auto-1',
      tenantId: 'tenant-4',
      nameAz: 'Kompleks Detailing & Keramika Qoruma',
      nameRu: 'Комплексный детейлинг и керамическая защита',
      nameEn: 'Complex Detailing & Ceramic Coating',
      duration: 180,
      price: 200,
      category: 'Detailing'
    },
    {
      id: 'srv-auto-2',
      tenantId: 'tenant-4',
      nameAz: 'Kompüter Diaqnostikası və Texniki Baxış',
      nameRu: 'Компьютерная диагностика и техосмотр',
      nameEn: 'Computer Diagnostics & Inspection',
      duration: 45,
      price: 40,
      category: 'Diaqnostika'
    },
    {
      id: 'srv-fit-1',
      tenantId: 'tenant-5',
      nameAz: 'Fərdi Məşqçi ilə Personal Training',
      nameRu: 'Персональная тренировка с тренером',
      nameEn: 'Personal Training Session',
      duration: 60,
      price: 50,
      category: 'Fərdi Məşq'
    },
    {
      id: 'srv-edu-1',
      tenantId: 'tenant-6',
      nameAz: 'Fərdi IELTS / TOEFL İmtahan Hazırlığı',
      nameRu: 'Индивидуальная подготовка к IELTS / TOEFL',
      nameEn: 'One-on-One IELTS / TOEFL Prep',
      duration: 90,
      price: 40,
      category: 'Xarici Dil'
    },
    {
      id: 'srv-ost-1',
      tenantId: 'tenant-osteopat',
      nameAz: 'Osteopatik İlkin Müayinə və Diaqnostika',
      nameRu: 'Первичный остеопатический осмотр и диагностика',
      nameEn: 'Osteopathic Initial Examination & Diagnosis',
      duration: 60,
      price: 80,
      category: 'Müayinə'
    },
    {
      id: 'srv-ost-2',
      tenantId: 'tenant-osteopat',
      nameAz: 'Onurğa və Oynaqlarda Manuel Terapiya',
      nameRu: 'Мануальная терапия позвоночника и суставов',
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
  ],
  blockedCustomers: [],
  activityLogs: [
    {
      id: 'act-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      userId: 'usr-admin-gozellik',
      userName: 'Aysel Xanım',
      userRole: 'ADMIN',
      tenantId: 'tenant-1',
      tenantName: 'Gözəllik və Estetik Mərkəzi',
      actionType: 'SERVICE_CREATE',
      entityType: 'SERVICE',
      entityId: 'srv-1',
      entityName: 'Saç kəsimi və forma',
      description: 'Yeni xidmət əlavə edildi: "Saç kəsimi və forma" (30 AZN)',
      isReverted: false
    },
    {
      id: 'act-102',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      userId: 'usr-editor-gozellik',
      userName: 'Nərmin Məmmədova',
      userRole: 'EDITOR',
      tenantId: 'tenant-1',
      tenantName: 'Gözəllik və Estetik Mərkəzi',
      actionType: 'STAFF_CREATE',
      entityType: 'STAFF',
      entityId: 'stf-1',
      entityName: 'Günel Əliyeva',
      description: 'Yeni mütəxəssis əlavə edildi: "Günel Əliyeva" (Stilist)',
      isReverted: false
    },
    {
      id: 'act-103',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      userId: 'usr-super',
      userName: 'Super Administrator',
      userRole: 'SUPER_ADMIN',
      tenantId: 'tenant-2',
      tenantName: 'Baku Medical Plaza',
      actionType: 'SERVICE_CREATE',
      entityType: 'SERVICE',
      entityId: 'srv-5',
      entityName: 'Kardioloq Qəbulu',
      description: 'Yeni tibbi xidmət əlavə edildi: "Kardioloq Qəbulu" (60 AZN)',
      isReverted: false
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
    
    // Auto-migrate any unhashed plaintext passwords to secure scrypt hashes
    let hasUnhashed = false;
    const rawUsers: User[] = parsed.users || defaultData.users;
    const secureUsers = rawUsers.map((u: User) => {
      if (u.password && !isPasswordHashed(u.password)) {
        hasUnhashed = true;
        return { ...u, password: hashPassword(u.password) };
      }
      return u;
    });

    const schema: DatabaseSchema = {
      users: secureUsers,
      tenants: parsed.tenants || defaultData.tenants,
      services: parsed.services || defaultData.services,
      staff: parsed.staff || defaultData.staff,
      bookings: parsed.bookings || defaultData.bookings,
      patients: parsed.patients || defaultData.patients,
      encounters: parsed.encounters || defaultData.encounters,
      reviews: parsed.reviews || defaultData.reviews,
      feedbacks: parsed.feedbacks || defaultData.feedbacks,
      blockedCustomers: parsed.blockedCustomers || defaultData.blockedCustomers || [],
      activityLogs: parsed.activityLogs || defaultData.activityLogs || [],
      whatsappLogs: parsed.whatsappLogs || defaultData.whatsappLogs || []
    };

    if (hasUnhashed) {
      try {
        fs.writeFileSync(dataFilePath, JSON.stringify(schema, null, 2), 'utf-8');
      } catch (e) {
        console.error('Password auto-migration save warning:', e);
      }
    }

    return schema;
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
    staff: db.staff.filter(s => s.tenantId === t.id)
    // bookings are removed for privacy to prevent leaking customer PII to public visitors
  };
}

export function getTenantById(id: string): Tenant | null {
  const db = readDb();
  const t = db.tenants.find(x => x.id === id);
  if (!t) return null;
  return {
    ...t,
    services: db.services.filter(s => s.tenantId === t.id),
    staff: db.staff.filter(s => s.tenantId === t.id)
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

export function createService(data: Omit<Service, 'id'>, actor?: ActorInfo): Service {
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
  if (actor) {
    logActivity({
      actor,
      actionType: 'SERVICE_CREATE',
      entityType: 'SERVICE',
      entityId: newService.id,
      entityName: newService.nameAz,
      description: `Yeni xidmət əlavə edildi: "${newService.nameAz}" (${newService.price} AZN)`,
      tenantId: newService.tenantId,
      snapshotAfter: newService
    });
  }
  return newService;
}

export function updateService(id: string, data: Partial<Service>, actor?: ActorInfo): Service | null {
  const db = readDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index === -1) return null;
  const snapshotBefore = { ...db.services[index] };
  db.services[index] = { 
    ...db.services[index], 
    ...data,
    ...(data.duration !== undefined ? { duration: Number(data.duration) } : {}),
    ...(data.price !== undefined ? { price: Number(data.price) } : {})
  };
  writeDb(db);
  if (actor) {
    logActivity({
      actor,
      actionType: 'SERVICE_UPDATE',
      entityType: 'SERVICE',
      entityId: id,
      entityName: db.services[index].nameAz,
      description: `Xidmət redaktə edildi: "${db.services[index].nameAz}"`,
      tenantId: db.services[index].tenantId,
      snapshotBefore,
      snapshotAfter: { ...db.services[index] }
    });
  }
  return db.services[index];
}

export function deleteService(id: string, actor?: ActorInfo): boolean {
  const db = readDb();
  const target = db.services.find(s => s.id === id);
  if (!target) return false;
  const snapshotBefore = { ...target };
  const len = db.services.length;
  db.services = db.services.filter(s => s.id !== id);
  writeDb(db);
  if (actor && snapshotBefore) {
    logActivity({
      actor,
      actionType: 'SERVICE_DELETE',
      entityType: 'SERVICE',
      entityId: id,
      entityName: snapshotBefore.nameAz,
      description: `Xidmət silindi: "${snapshotBefore.nameAz}"`,
      tenantId: snapshotBefore.tenantId,
      snapshotBefore
    });
  }
  return db.services.length < len;
}

// ── STAFF API ──────────────────────────────────────────────────────────
export function getStaff(tenantId?: string): Staff[] {
  const db = readDb();
  if (tenantId) return db.staff.filter(s => s.tenantId === tenantId);
  return db.staff;
}

export function createStaff(data: Omit<Staff, 'id'>, actor?: ActorInfo): Staff {
  const db = readDb();
  const newStaff: Staff = {
    ...data,
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
    slotDuration: data.slotDuration ? Number(data.slotDuration) : undefined,
    id: 'stf-' + Date.now()
  };
  db.staff.push(newStaff);
  writeDb(db);
  if (actor) {
    logActivity({
      actor,
      actionType: 'STAFF_CREATE',
      entityType: 'STAFF',
      entityId: newStaff.id,
      entityName: newStaff.name,
      description: `Yeni mütəxəssis əlavə edildi: "${newStaff.name}" (${newStaff.role})`,
      tenantId: newStaff.tenantId,
      snapshotAfter: newStaff
    });
  }
  return newStaff;
}

export function updateStaff(id: string, data: Partial<Staff>, actor?: ActorInfo): Staff | null {
  const db = readDb();
  const index = db.staff.findIndex(s => s.id === id);
  if (index === -1) return null;
  const snapshotBefore = { ...db.staff[index] };
  db.staff[index] = { 
    ...db.staff[index], 
    ...data,
    ...(data.slotDuration !== undefined ? { slotDuration: data.slotDuration ? Number(data.slotDuration) : undefined } : {})
  };
  writeDb(db);
  if (actor) {
    logActivity({
      actor,
      actionType: 'STAFF_UPDATE',
      entityType: 'STAFF',
      entityId: id,
      entityName: db.staff[index].name,
      description: `Mütəxəssis məlumatları redaktə edildi: "${db.staff[index].name}"`,
      tenantId: db.staff[index].tenantId,
      snapshotBefore,
      snapshotAfter: { ...db.staff[index] }
    });
  }
  return db.staff[index];
}

export function deleteStaff(id: string, actor?: ActorInfo): boolean {
  const db = readDb();
  const target = db.staff.find(s => s.id === id);
  if (!target) return false;
  const snapshotBefore = { ...target };
  const len = db.staff.length;
  db.staff = db.staff.filter(s => s.id !== id);
  writeDb(db);
  if (actor && snapshotBefore) {
    logActivity({
      actor,
      actionType: 'STAFF_DELETE',
      entityType: 'STAFF',
      entityId: id,
      entityName: snapshotBefore.name,
      description: `Mütəxəssis silindi: "${snapshotBefore.name}"`,
      tenantId: snapshotBefore.tenantId,
      snapshotBefore
    });
  }
  return db.staff.length < len;
}

// ── BOOKING REPUTATION & MULTI-LAYER BLOCKING HELPERS ──────────────────
export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function normalizeFin(fin?: string | null): string {
  if (!fin) return '';
  return fin.trim().toUpperCase();
}

export function getCustomerNoShowCount(params: { phone?: string; fin?: string; ip?: string }): {
  count: number;
  matchingBookings: Booking[];
} {
  const db = readDb();
  const cleanPhone = normalizePhone(params.phone);
  const cleanFin = normalizeFin(params.fin);
  const ip = params.ip ? params.ip.trim() : '';

  const matched = db.bookings.filter(b => {
    const bPhone = normalizePhone(b.customerPhone);
    const bFin = normalizeFin(b.customerFin);
    const bIp = b.clientIp ? b.clientIp.trim() : '';

    const phoneMatch = Boolean(cleanPhone && bPhone && (cleanPhone.endsWith(bPhone) || bPhone.endsWith(cleanPhone) || cleanPhone === bPhone));
    const finMatch = Boolean(cleanFin && bFin && cleanFin === bFin);
    const ipMatch = Boolean(ip && bIp && ip === bIp && ip !== '127.0.0.1' && ip !== '::1' && ip !== 'localhost');

    return phoneMatch || finMatch || ipMatch;
  });

  const noShowBookings = matched.filter(b => b.status === 'NO_SHOW');
  return {
    count: noShowBookings.length,
    matchingBookings: matched
  };
}

export function isCustomerBlocked(params: { phone?: string; fin?: string; ip?: string }): {
  isBlocked: boolean;
  reason?: string;
  noShowCount: number;
} {
  const db = readDb();
  const cleanPhone = normalizePhone(params.phone);
  const cleanFin = normalizeFin(params.fin);
  const ip = params.ip ? params.ip.trim() : '';

  // 1. Check explicit blockedCustomers list
  const blockedList = db.blockedCustomers || [];
  const manualBlock = blockedList.find(item => {
    const bPhone = normalizePhone(item.phone);
    const bFin = normalizeFin(item.fin);
    const bIp = item.ip ? item.ip.trim() : '';

    const phoneMatch = Boolean(cleanPhone && bPhone && (cleanPhone.endsWith(bPhone) || bPhone.endsWith(cleanPhone)));
    const finMatch = Boolean(cleanFin && bFin && cleanFin === bFin);
    const ipMatch = Boolean(ip && bIp && ip === bIp && ip !== '127.0.0.1' && ip !== '::1');

    return phoneMatch || finMatch || ipMatch;
  });

  if (manualBlock) {
    return {
      isBlocked: true,
      reason: manualBlock.reason || 'Daha əvvəl 3 dəfə rezervasiyaya gəlinmədiyi üçün onlayn qeydiyyat bloklanıb.',
      noShowCount: manualBlock.noShowCount || 3
    };
  }

  // 2. Count NO_SHOW in bookings
  const { count } = getCustomerNoShowCount(params);
  if (count >= 3) {
    return {
      isBlocked: true,
      reason: `Daha əvvəl ${count} dəfə rezervasiyaya gəlinmədiyi üçün sistem bu nömrəni, FİN-i və qurğunu bloklayıb.`,
      noShowCount: count
    };
  }

  return {
    isBlocked: false,
    noShowCount: count
  };
}

export function toggleCustomerBlock(params: {
  phone?: string;
  fin?: string;
  ip?: string;
  customerName?: string;
  blocked: boolean;
  reason?: string;
  adminName?: string;
}, actor?: ActorInfo): boolean {
  const db = readDb();
  if (!db.blockedCustomers) db.blockedCustomers = [];
  const cleanPhone = normalizePhone(params.phone);
  const cleanFin = normalizeFin(params.fin);
  const ip = params.ip ? params.ip.trim() : '';

  if (params.blocked) {
    const existingIndex = db.blockedCustomers.findIndex(b => 
      (cleanPhone && normalizePhone(b.phone) === cleanPhone) ||
      (cleanFin && normalizeFin(b.fin) === cleanFin) ||
      (ip && b.ip === ip && ip !== '127.0.0.1')
    );
    const item: BlockedCustomer = {
      id: 'blk-' + Date.now(),
      phone: params.phone,
      fin: params.fin,
      ip: params.ip,
      customerName: params.customerName,
      reason: params.reason || 'Admin tərəfindən bloklandı',
      noShowCount: 3,
      isManual: true,
      blockedAt: new Date().toISOString(),
      blockedBy: params.adminName || (actor ? actor.name : 'Admin')
    };
    if (existingIndex >= 0) {
      db.blockedCustomers[existingIndex] = item;
    } else {
      db.blockedCustomers.push(item);
    }
  } else {
    db.blockedCustomers = db.blockedCustomers.filter(b => {
      const matchPhone = cleanPhone && normalizePhone(b.phone) === cleanPhone;
      const matchFin = cleanFin && normalizeFin(b.fin) === cleanFin;
      const matchIp = ip && b.ip === ip;
      return !(matchPhone || matchFin || matchIp);
    });
    // If they had NO_SHOW status bookings, reset them to CANCELLED so they don't immediately auto-block again
    db.bookings.forEach(b => {
      const bPhone = normalizePhone(b.customerPhone);
      const bFin = normalizeFin(b.customerFin);
      const bIp = b.clientIp ? b.clientIp.trim() : '';
      const match = Boolean((cleanPhone && bPhone === cleanPhone) || (cleanFin && bFin === cleanFin) || (ip && bIp === ip));
      if (match && b.status === 'NO_SHOW') {
        b.status = 'CANCELLED';
      }
    });
  }
  writeDb(db);
  if (actor) {
    logActivity({
      actor,
      actionType: params.blocked ? 'CUSTOMER_BLOCK' : 'CUSTOMER_UNBLOCK',
      entityType: 'CUSTOMER',
      entityId: cleanPhone || cleanFin || ip || 'cust',
      entityName: params.customerName || params.phone || 'Müştəri',
      description: params.blocked 
        ? `Müştəri bloklandı: ${params.customerName || params.phone || 'Nömrə'}`
        : `Müştəri blokdan çıxarıldı: ${params.customerName || params.phone || 'Nömrə'}`,
      snapshotBefore: { phone: params.phone, fin: params.fin, ip: params.ip, customerName: params.customerName, blocked: !params.blocked },
      snapshotAfter: { phone: params.phone, fin: params.fin, ip: params.ip, customerName: params.customerName, blocked: params.blocked }
    });
  }
  return true;
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
    const blockInfo = isCustomerBlocked({ phone: b.customerPhone, fin: b.customerFin, ip: b.clientIp });
    return {
      ...b,
      tenantName: tenant ? tenant.name : 'Naməlum Filial',
      serviceName: service ? service.nameAz : 'Xidmət',
      servicePrice: service ? service.price : 0,
      staffName: staffMember ? staffMember.name : 'Təyin edilməyib',
      noShowCount: blockInfo.noShowCount,
      isBlocked: blockInfo.isBlocked
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

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

export function isTimeOverlapping(
  slotA: string,
  durationA: number,
  slotB: string,
  durationB: number
): boolean {
  const startA = timeToMinutes(slotA);
  const endA = startA + (durationA > 0 ? durationA : 30);
  const startB = timeToMinutes(slotB);
  const endB = startB + (durationB > 0 ? durationB : 30);
  return startA < endB && startB < endA;
}

export function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const db = readDb();
  const service = db.services.find(s => s.id === data.serviceId);
  const staff = db.staff.find(st => st.id === data.staffId);
  const calculatedDuration = Number(data.duration) || (staff?.slotDuration && staff.slotDuration > 0 ? staff.slotDuration : (service?.duration || 30));

  const newBooking: Booking = {
    ...data,
    duration: calculatedDuration,
    serviceName: data.serviceName || service?.nameAz,
    servicePrice: data.servicePrice !== undefined ? data.servicePrice : service?.price,
    staffName: data.staffName || staff?.name,
    id: 'bkg-' + Math.floor(1000 + Math.random() * 9000),
    status: data.status || 'CONFIRMED',
    customerScore: data.customerScore !== undefined ? Number(data.customerScore) : undefined,
    adminNotes: data.adminNotes || undefined,
    clientIp: data.clientIp || undefined,
    createdAt: new Date().toISOString()
  };
  db.bookings.push(newBooking);
  writeDb(db);
  return newBooking;
}

export function updateBooking(id: string, updates: {
  status?: BookingStatus;
  customerScore?: number;
  adminNotes?: string;
}, actor?: ActorInfo): Booking | null {
  const db = readDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  const snapshotBefore = { ...db.bookings[index] };
  
  if (updates.status !== undefined) {
    db.bookings[index].status = updates.status;
    if (updates.status === 'NO_SHOW') {
      const b = db.bookings[index];
      const countInfo = getCustomerNoShowCount({ phone: b.customerPhone, fin: b.customerFin, ip: b.clientIp });
      if (countInfo.count >= 3) {
        toggleCustomerBlock({
          phone: b.customerPhone,
          fin: b.customerFin,
          ip: b.clientIp,
          customerName: b.customerName,
          blocked: true,
          reason: '3 dəfə rezervasiyaya gəlinmədiyi üçün avtomatik bloklandı'
        }, actor);
      }
    }
  }
  if (updates.customerScore !== undefined) {
    db.bookings[index].customerScore = Number(updates.customerScore);
  }
  if (updates.adminNotes !== undefined) {
    db.bookings[index].adminNotes = updates.adminNotes;
  }
  
  writeDb(db);
  if (actor) {
    const isCancel = updates.status === 'CANCELLED';
    logActivity({
      actor,
      actionType: isCancel ? 'BOOKING_CANCEL' : 'BOOKING_UPDATE',
      entityType: 'BOOKING',
      entityId: id,
      entityName: `${snapshotBefore.customerName} (${snapshotBefore.date} ${snapshotBefore.timeSlot})`,
      description: isCancel 
        ? `Rezervasiya ləğv edildi: ${snapshotBefore.customerName} (${snapshotBefore.timeSlot})`
        : `Rezervasiya statusu dəyişdirildi (${updates.status || 'yeniləndi'}): ${snapshotBefore.customerName}`,
      tenantId: snapshotBefore.tenantId,
      snapshotBefore,
      snapshotAfter: { ...db.bookings[index] }
    });
  }
  return db.bookings[index];
}

export function updateBookingStatus(id: string, status: BookingStatus, actor?: ActorInfo): Booking | null {
  return updateBooking(id, { status }, actor);
}

export function deleteBooking(id: string, actor?: ActorInfo): boolean {
  const db = readDb();
  const target = db.bookings.find(b => b.id === id);
  if (!target) return false;
  const snapshotBefore = { ...target };
  const len = db.bookings.length;
  db.bookings = db.bookings.filter(b => b.id !== id);
  writeDb(db);
  if (actor && snapshotBefore) {
    logActivity({
      actor,
      actionType: 'BOOKING_DELETE',
      entityType: 'BOOKING',
      entityId: id,
      entityName: `${snapshotBefore.customerName} (${snapshotBefore.date})`,
      description: `Rezervasiya silindi: ${snapshotBefore.customerName} (${snapshotBefore.date} ${snapshotBefore.timeSlot})`,
      tenantId: snapshotBefore.tenantId,
      snapshotBefore
    });
  }
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

export function getPatientById(id: string): Patient | undefined {
  const db = readDb();
  const patient = db.patients.find(p => p.id === id);
  if (!patient) return undefined;
  return {
    ...patient,
    encounters: db.encounters.filter(e => e.patientId === id)
  };
}

export function createPatient(data: Omit<Patient, 'id' | 'encounters'>): Patient {
  const db = readDb();
  const newPatient: Patient = {
    ...data,
    fin: data.fin.trim().toUpperCase(),
    phone: data.phone || null,
    notes: data.notes || null,
    id: 'pat-' + Date.now(),
    encounters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.patients.push(newPatient);
  writeDb(db);
  return newPatient;
}

export function updatePatient(id: string, data: Partial<Patient>): Patient | null {
  const db = readDb();
  const index = db.patients.findIndex(p => p.id === id);
  if (index === -1) return null;
  db.patients[index] = {
    ...db.patients[index],
    ...data,
    ...(data.fin ? { fin: data.fin.trim().toUpperCase() } : {}),
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return {
    ...db.patients[index],
    encounters: db.encounters.filter(e => e.patientId === id)
  };
}

export function deletePatient(id: string): boolean {
  const db = readDb();
  const initialLen = db.patients.length;
  db.patients = db.patients.filter(p => p.id !== id);
  db.encounters = db.encounters.filter(e => e.patientId !== id);
  writeDb(db);
  return db.patients.length < initialLen;
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
    return sanitizeUser({
      ...u,
      tenantName: tenant ? tenant.name : (u.role === 'SUPER_ADMIN' ? 'Bütün Sistem (Super Admin)' : 'Təyin edilməyib')
    }) as User;
  });
}

export function getUserByUsername(username: string): User | undefined {
  const db = readDb();
  const search = username.toLowerCase().trim();
  const user = (db.users || []).find(u => u.username.toLowerCase() === search);
  return user ? (sanitizeUser(user) as User) : undefined;
}

export function getUserById(id: string): User | undefined {
  const db = readDb();
  const user = (db.users || []).find(u => u.id === id);
  return user ? (sanitizeUser(user) as User) : undefined;
}

export function validateUserCredentials(username: string, password: string): User | null {
  const db = readDb();
  const search = username.toLowerCase().trim();
  const user = (db.users || []).find(u => u.username.toLowerCase() === search);
  if (!user || !user.password) return null;
  
  if (!verifyPassword(password.trim(), user.password)) {
    return null;
  }
  
  if (user.isActive === false) {
    throw new Error('Hesabınız bloklanıb! Zəhmət olmasa baş administratorla əlaqə saxlayın.');
  }
  const tenant = user.tenantId ? db.tenants.find(t => t.id === user.tenantId) : null;
  return sanitizeUser({
    ...user,
    tenantName: tenant ? tenant.name : (user.role === 'SUPER_ADMIN' ? 'Bütün Sistem' : undefined)
  }) as User;
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

  const rawPassword = data.password ? data.password.trim() : 'admin123';
  const newUser: User = {
    id: 'usr-' + Date.now(),
    username: cleanUsername,
    password: hashPassword(rawPassword),
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
    user: sanitizeUser({ ...newUser, tenantName: tenant ? tenant.name : undefined }) as User 
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
  if (cleanUpdates.password !== undefined) {
    if (cleanUpdates.password.trim() === '') {
      delete cleanUpdates.password;
    } else {
      cleanUpdates.password = hashPassword(cleanUpdates.password.trim());
    }
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
  return sanitizeUser(db.users[index]) as User;
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
  const editor = (db.users || []).find(u => u.tenantId === tenantId && u.role === 'EDITOR');
  return editor ? (sanitizeUser(editor) as User) : null;
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

export function hasIpReviewed(clientIp: string, tenantId?: string): boolean {
  if (!clientIp) return false;
  const db = readDb();
  if (!db.reviews || db.reviews.length === 0) return false;
  return db.reviews.some(r => r.clientIp === clientIp && (!tenantId || r.tenantId === tenantId));
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
    clientIp: data.clientIp || undefined,
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

// ── AUDIT & ACTIVITY LOG (FƏALİYYƏT CƏDVƏLİ VƏ GERİ QAYTARMA SİSTEMİ) ──
export function logActivity(params: {
  actor: ActorInfo;
  actionType: ActivityActionType;
  entityType: 'SERVICE' | 'STAFF' | 'BOOKING' | 'CUSTOMER' | 'PATIENT';
  entityId: string;
  entityName: string;
  description: string;
  tenantId?: string | null;
  tenantName?: string;
  snapshotBefore?: any;
  snapshotAfter?: any;
}): ActivityLog {
  const db = readDb();
  if (!db.activityLogs) db.activityLogs = [];

  const tenant = params.tenantId ? db.tenants.find(t => t.id === params.tenantId) : null;
  const newLog: ActivityLog = {
    id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    tenantId: params.tenantId || params.actor.tenantId || null,
    tenantName: params.tenantName || (tenant ? tenant.name : 'Bütün Sistem'),
    actionType: params.actionType,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    description: params.description,
    snapshotBefore: params.snapshotBefore ? JSON.parse(JSON.stringify(params.snapshotBefore)) : undefined,
    snapshotAfter: params.snapshotAfter ? JSON.parse(JSON.stringify(params.snapshotAfter)) : undefined,
    isReverted: false
  };

  db.activityLogs.unshift(newLog);
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }
  writeDb(db);
  return newLog;
}

export function getActivityLogs(tenantId?: string | null): ActivityLog[] {
  const db = readDb();
  let list = db.activityLogs || [];
  if (tenantId && tenantId !== 'all') {
    list = list.filter(l => !l.tenantId || l.tenantId === tenantId);
  }
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function revertActivity(logId: string, performedBy: ActorInfo): {
  success: boolean;
  message: string;
  log?: ActivityLog;
} {
  const db = readDb();
  if (!db.activityLogs) return { success: false, message: 'Fəaliyyət qeydləri tapılmadı' };

  const logIndex = db.activityLogs.findIndex(l => l.id === logId);
  if (logIndex === -1) return { success: false, message: 'Fəaliyyət tapılmadı' };

  const targetLog = db.activityLogs[logIndex];
  if (targetLog.isReverted) {
    return { success: false, message: 'Bu əməliyyat artıq geri qaytarılıb' };
  }

  let revertSummary = '';

  switch (targetLog.actionType) {
    case 'SERVICE_DELETE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'Bərpa üçün ilkin məlumat tapılmadı' };
      }
      const existing = db.services.find(s => s.id === targetLog.entityId);
      if (existing) {
        return { success: false, message: 'Bu xidmət artıq sistemdə mövcuddur' };
      }
      db.services.push(targetLog.snapshotBefore);
      revertSummary = `Silinmiş xidmət ("${targetLog.entityName}") təkrar bərpa edildi`;
      break;
    }

    case 'SERVICE_CREATE': {
      const idx = db.services.findIndex(s => s.id === targetLog.entityId);
      if (idx !== -1) {
        db.services.splice(idx, 1);
        revertSummary = `Əlavə edilmiş xidmət ("${targetLog.entityName}") sistemdən silindi`;
      } else {
        revertSummary = `Xidmət artıq silinib`;
      }
      break;
    }

    case 'SERVICE_UPDATE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'İlkin xidmət məlumatı tapılmadı' };
      }
      const idx = db.services.findIndex(s => s.id === targetLog.entityId);
      if (idx !== -1) {
        db.services[idx] = { ...targetLog.snapshotBefore };
        revertSummary = `Xidmətin ("${targetLog.entityName}") ilkin parametrləri bərpa edildi`;
      } else {
        db.services.push(targetLog.snapshotBefore);
        revertSummary = `Xidmət ilkin parametrlərlə təkrar bərpa edildi`;
      }
      break;
    }

    case 'STAFF_DELETE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'Bərpa üçün ilkin işçi məlumatı tapılmadı' };
      }
      const existing = db.staff.find(st => st.id === targetLog.entityId);
      if (existing) {
        return { success: false, message: 'Bu mütəxəssis artıq sistemdə mövcuddur' };
      }
      db.staff.push(targetLog.snapshotBefore);
      revertSummary = `Silinmiş mütəxəssis ("${targetLog.entityName}") bərpa edildi`;
      break;
    }

    case 'STAFF_CREATE': {
      const idx = db.staff.findIndex(st => st.id === targetLog.entityId);
      if (idx !== -1) {
        db.staff.splice(idx, 1);
        revertSummary = `Əlavə edilmiş mütəxəssis ("${targetLog.entityName}") sistemdən ləğv edildi`;
      } else {
        revertSummary = `Mütəxəssis artıq bazada yoxdur`;
      }
      break;
    }

    case 'STAFF_UPDATE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'İlkin işçi məlumatı tapılmadı' };
      }
      const idx = db.staff.findIndex(st => st.id === targetLog.entityId);
      if (idx !== -1) {
        db.staff[idx] = { ...targetLog.snapshotBefore };
        revertSummary = `Mütəxəssisin ("${targetLog.entityName}") əvvəlki məlumatları bərpa edildi`;
      } else {
        db.staff.push(targetLog.snapshotBefore);
        revertSummary = `Mütəxəssis ilkin vəziyyətdə bərpa olundu`;
      }
      break;
    }

    case 'BOOKING_DELETE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'İlkin rezervasiya məlumatı tapılmadı' };
      }
      db.bookings.push(targetLog.snapshotBefore);
      revertSummary = `Silinmiş rezervasiya (${targetLog.entityName}) bərpa olundu`;
      break;
    }

    case 'BOOKING_CANCEL':
    case 'BOOKING_UPDATE': {
      if (!targetLog.snapshotBefore) {
        return { success: false, message: 'İlkin rezervasiya məlumatı tapılmadı' };
      }
      const idx = db.bookings.findIndex(b => b.id === targetLog.entityId);
      if (idx !== -1) {
        db.bookings[idx] = { ...targetLog.snapshotBefore };
        revertSummary = `Rezervasiya statusu (${targetLog.snapshotBefore.status || 'əvvəlki'}) bərpa olundu`;
      } else {
        db.bookings.push(targetLog.snapshotBefore);
        revertSummary = `Rezervasiya yenidən qeydiyyata alındı`;
      }
      break;
    }

    case 'CUSTOMER_BLOCK': {
      if (db.blockedCustomers) {
        db.blockedCustomers = db.blockedCustomers.filter(b => b.id !== targetLog.entityId && b.phone !== targetLog.entityId);
      }
      revertSummary = `Müştərinin bloku ləğv edildi`;
      break;
    }

    case 'CUSTOMER_UNBLOCK': {
      if (targetLog.snapshotBefore) {
        if (!db.blockedCustomers) db.blockedCustomers = [];
        db.blockedCustomers.push(targetLog.snapshotBefore);
      }
      revertSummary = `Müştəri təkrar bloklandı`;
      break;
    }

    default:
      return { success: false, message: 'Bu növ əməliyyat geri qaytarıla bilməz' };
  }

  targetLog.isReverted = true;
  targetLog.revertedAt = new Date().toISOString();
  targetLog.revertedBy = performedBy.name;

  const revertAuditLog: ActivityLog = {
    id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userId: performedBy.id,
    userName: performedBy.name,
    userRole: performedBy.role,
    tenantId: targetLog.tenantId,
    tenantName: targetLog.tenantName,
    actionType: targetLog.actionType,
    entityType: targetLog.entityType,
    entityId: targetLog.entityId,
    entityName: targetLog.entityName,
    description: `${performedBy.name} tərəfindən '${targetLog.description}' əməliyyatı ləğv edildi və geri qaytarıldı. (${revertSummary})`,
    isReverted: true,
    revertedAt: new Date().toISOString(),
    revertedBy: performedBy.name
  };

  db.activityLogs.unshift(revertAuditLog);
  writeDb(db);

  return {
    success: true,
    message: revertSummary || 'Əməliyyat uğurla geri qaytarıldı',
    log: targetLog
  };
}

// ── WHATSAPP LOGS & DISPATCH HISTORY ───────────────────────────────────
export function getWhatsAppLogs(tenantId?: string): WhatsAppLogItem[] {
  const db = readDb();
  const logs = db.whatsappLogs || [];
  if (tenantId) {
    return logs
      .filter(l => l.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addWhatsAppLog(log: Omit<WhatsAppLogItem, 'id' | 'createdAt'>): WhatsAppLogItem {
  const db = readDb();
  if (!db.whatsappLogs) db.whatsappLogs = [];
  const newLog: WhatsAppLogItem = {
    ...log,
    id: 'walog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString()
  };
  db.whatsappLogs.unshift(newLog);
  if (db.whatsappLogs.length > 500) {
    db.whatsappLogs = db.whatsappLogs.slice(0, 500);
  }
  writeDb(db);
  return newLog;
}

export function clearWhatsAppLogs(tenantId?: string): boolean {
  const db = readDb();
  if (!db.whatsappLogs) return true;
  if (tenantId) {
    db.whatsappLogs = db.whatsappLogs.filter(l => l.tenantId !== tenantId);
  } else {
    db.whatsappLogs = [];
  }
  writeDb(db);
  return true;
}


