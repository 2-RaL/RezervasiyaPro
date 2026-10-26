export type Language = 'az' | 'ru' | 'en';

export interface TranslationDictionary {
  // Navigation & General
  home: string;
  login: string;
  adminPanel: string;
  backToHome: string;
  loading: string;
  notFound: string;
  notFoundDesc: string;

  // Booking Page Steps
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Subtitle: string;
  step4Title: string;
  step4Subtitle: string;

  // Booking Details & Time
  bookingDate: string;
  availableHours: string;
  twentyFourHourMode: string;
  slotInterval: string;
  duration: string;
  free: string;
  booked: string;
  bookedShort: string;
  allHours: string;
  morning: string;
  afternoon: string;
  evening: string;
  selectedTime: string;
  noStaffForService: string;
  noSlotsAvailable: string;
  allServicesAssigned: string;
  openDaysLegend: string;
  blockedDaysLegend: string;
  pastDaysLegend: string;
  dayBlockedWarning: string;
  closedDay: string;
  openDay: string;
  selectedDay: string;
  workingHoursLabel: string;

  // Customer Form
  fullName: string;
  phone: string;
  finCode: string;
  optional: string;
  onlyLetters: string;
  onlyDigits: string;
  fullNamePlaceholder: string;
  finPlaceholder: string;
  confirmBooking: string;
  confirming: string;
  secureNotice: string;
  priceNote: string;

  // Receipt / Confirmation Modal
  bookingSuccessTitle: string;
  bookingSuccessDesc: string;
  bookingCode: string;
  organization: string;
  service: string;
  specialist: string;
  date: string;
  time: string;
  price: string;
  status: string;
  confirmed: string;
  newBooking: string;

  // Reviews Section
  reviewsTitle: string;
  reviewsSubtitle: string;
  avgRating: string;
  basedOnReviews: string;
  filterReviews: string;
  allStars: string;
  star: string;
  stars: string;
  noReviewsForStar: string;
  noReviewsYet: string;
  leaveReviewTitle: string;
  leaveReviewSubtitle: string;
  yourName: string;
  yourPhone: string;
  serviceUsed: string;
  yourExperience: string;
  sendReview: string;
  reviewSentSuccess: string;
  alreadyReviewed: string;
  reviewPlaceholder: string;

  // Social Links
  socialTitle: string;
  whatsappDirect: string;
  instagramPage: string;
  facebookPage: string;
  tiktokProfile: string;
  telegramChannel: string;

  // Landing Page
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  tryDemo: string;
  allSectors: string;
  searchBranch: string;
  bookNow: string;
  featuredServices: string;
  call: string;
  address: string;

  // Errors / Notifications
  nameValidationError: string;
  phoneValidationError: string;
  requiredFieldsError: string;
  blockedError: string;
  slotTakenError: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  az: {
    home: 'Əsas səhifə',
    login: 'Giriş',
    adminPanel: 'İdarəetmə Paneli',
    backToHome: 'Ana Səhifəyə Qayıt',
    loading: 'Məlumatlar yüklənir...',
    notFound: 'Filial Tapılmadı',
    notFoundDesc: 'Göstərilən filial mövcud deyil və ya deaktiv edilib.',

    step1Title: 'Xidmət Seçimi',
    step1Subtitle: 'Yazılmaq istədiyiniz proseduru və ya xidməti seçin',
    step2Title: 'Mütəxəssis Seçimi',
    step2Subtitle: 'Seçilmiş xidmət üzrə təyin edilmiş mütəxəssisi seçin',
    step3Title: 'Tarix və Saat',
    step3Subtitle: 'Rezervasiya üçün uyğun gün və vaxtı müəyyən edin',
    step4Title: 'Müştəri Məlumatları',
    step4Subtitle: 'Rezervasiyanın təsdiqlənməsi üçün əlaqə vasitələrinizi qeyd edin',

    bookingDate: 'Rezervasiya Tarixi',
    availableHours: 'Mövcud Saatlar',
    twentyFourHourMode: '24 Saatlıq Rejim',
    slotInterval: 'Aralıq',
    duration: 'Müddət',
    free: 'Boş',
    booked: 'Dolu (Rezerv edilib)',
    bookedShort: 'Dolu',
    allHours: 'Bütün Saatlar (24H)',
    morning: 'Səhər (08:00 - 12:00)',
    afternoon: 'Günorta (12:00 - 17:00)',
    evening: 'Axşam (17:00 - 23:00)',
    selectedTime: 'Seçilmiş vaxt',
    noStaffForService: 'Bu xidmət üzrə aktiv mütəxəssis təyin edilməyib. Zəhmət olmasa başqa xidmət seçin və ya müəssisə ilə əlaqə saxlayın.',
    noSlotsAvailable: 'Bu tarix üçün heç bir boş saat qalmayıb.',
    allServicesAssigned: 'Bütün xidmətlər (Məhdudiyyətsiz)',
    openDaysLegend: 'Açıq günlər (Rezervasiya aktivdir)',
    blockedDaysLegend: 'Qırmızı: Bloklanmış günlər (Qapalı / Seçmək olmur)',
    pastDaysLegend: 'Keçmiş tarixlər',
    dayBlockedWarning: 'Seçilmiş gün admin tərəfindən bloklanıb və qapalıdır. Zəhmət olmasa təqvimdən açıq günləri seçin.',
    closedDay: 'Qapalı',
    openDay: 'Açıq',
    selectedDay: 'Seçildi',
    workingHoursLabel: 'Açıq İş Saatları',

    fullName: 'Ad və Soyad',
    phone: 'Mobil Nömrə',
    finCode: 'Pasiyent FİN Kodu',
    optional: 'İstəyə bağlı',
    onlyLetters: 'Yalnız hərflər',
    onlyDigits: 'Yalnız rəqəmlər',
    fullNamePlaceholder: 'məs. Aygün Əliyeva',
    finPlaceholder: '7 simvol (məs. 7ABC123)',
    confirmBooking: 'Rezervasiyanı Təsdiqlə',
    confirming: 'Göndərilir...',
    secureNotice: 'Sizin sağlamlıq və rezervasiya tarixçəniz təhlükəsiz şəkildə qorunur.',
    priceNote: 'Ödəniş müəssisədə xidmət göstərildikdən sonra həyata keçirilir.',

    bookingSuccessTitle: 'Rezervasiyanız Uğurla Qeydə Alındı!',
    bookingSuccessDesc: 'Qeyd etdiyiniz məlumatlar sistemdə təsdiqləndi. Zəhmət olmasa təyin olunmuş vaxtdan 10 dəqiqə əvvəl mərkəzimizdə olun.',
    bookingCode: 'Rezervasiya Kodu',
    organization: 'Müəssisə',
    service: 'Xidmət',
    specialist: 'Mütəxəssis',
    date: 'Tarix',
    time: 'Saat',
    price: 'Məbləğ',
    status: 'Status',
    confirmed: 'Təsdiqləndi',
    newBooking: 'Yeni Rezervasiya Et',

    reviewsTitle: 'Müştərilərin Real Rəyləri',
    reviewsSubtitle: 'Xidmətlərimizdən faydalanan müştərilərin səmimi fikirləri və təcrübələri',
    avgRating: 'Orta Qiymətləndirmə',
    basedOnReviews: 'ümumi rəy əsasında',
    filterReviews: 'Rəyləri Filterlə',
    allStars: 'Bütün Ulduzlar',
    star: 'Ulduz',
    stars: 'Ulduz',
    noReviewsForStar: 'Bu ulduz dərəcəsi üzrə hələlik heç bir rəy bildirilməyib.',
    noReviewsYet: 'Hələlik heç bir rəy bildirilməyib. İlk rəy bildirən siz olun!',
    leaveReviewTitle: 'Rəy Bildirin və Təcrübənizi Bölüşün',
    leaveReviewSubtitle: 'Sizin rəyiniz xidmət keyfiyyətimizi artırmaq üçün dəyərlidir',
    yourName: 'Ad və Soyadınız *',
    yourPhone: 'Telefon Nömrəniz *',
    serviceUsed: 'Faydalandığınız Xidmət *',
    yourExperience: 'Təcrübəniz və Fikirləriniz *',
    sendReview: 'Rəyi Göndər',
    reviewSentSuccess: 'Rəyiniz uğurla qəbul edildi və dərc olundu! Təşəkkür edirik.',
    alreadyReviewed: 'Siz bu müəssisə üçün artıq rəy bildirmisiniz. Bir IP ünvanından yalnız bir dəfə rəy yazmaq mümkündür.',
    reviewPlaceholder: 'Göstərilən xidmət, mütəxəssisin münasibəti və ümumi təəssüratınız haqqında yazın...',

    socialTitle: 'Bizi Sosial Şəbəkələrdə İzləyin və Əlaqə Saxlayın',
    whatsappDirect: 'WhatsApp ilə birbaşa yazın',
    instagramPage: 'Instagram səhifəmiz',
    facebookPage: 'Facebook səhifəmiz',
    tiktokProfile: 'TikTok profilimiz',
    telegramChannel: 'Telegram kanalımız',

    heroBadge: 'Müasir & Çoxşaxəli Biznes Həlli',
    heroTitle1: 'Bütün Xidmət və Biznes Sahələri Üçün',
    heroTitle2: 'Ağıllı Rezervasiya Sistemi',
    heroDesc: 'Gözəllik mərkəzləri, tibb klinikaları, bərbərxanalar, avto servislər, fitnes studiyaları və tədris müəssisələri üçün vahid növbə, mütəxəssis və müştəri idarəetmə platforması.',
    tryDemo: 'Nümunə Filialları Sına',
    allSectors: 'Bütün Sahələr',
    searchBranch: 'Filial və ya xidmət axtar...',
    bookNow: 'Rezervasiya Et',
    featuredServices: 'Seçilmiş Xidmətlər',
    call: 'Zəng et',
    address: 'Ünvan',

    nameValidationError: 'Ad və Soyad xanasına rəqəm yazıla bilməz, yalnız hərf daxil edin.',
    phoneValidationError: 'Nömrə xanasına hərf yazıla bilməz, yalnız rəqəm daxil edin.',
    requiredFieldsError: 'Zəhmət olmasa bütün vacib sahələri doldurun.',
    blockedError: 'Daha əvvəl 3 dəfə rezervasiyaya gəlinmədiyi üçün onlayn rezervasiyanız bloklanıb. Zəhmət olmasa birbaşa əlaqə saxlayın.',
    slotTakenError: 'Seçilmiş saat həmin mütəxəssis üçün artıq rezerv olunub və ya kəsişir. Zəhmət olmasa başqa saat seçin.'
  },

  ru: {
    home: 'Главная страница',
    login: 'Вход в систему',
    adminPanel: 'Панель управления',
    backToHome: 'Вернуться на главную',
    loading: 'Загрузка данных...',
    notFound: 'Филиал не найден',
    notFoundDesc: 'Указанный филиал не существует или временно деактивирован.',

    step1Title: '1. Выбор услуги',
    step1Subtitle: 'Выберите процедуру или услугу, на которую хотите записаться',
    step2Title: '2. Выбор специалиста',
    step2Subtitle: 'Выберите специалиста, предоставляющего данную услугу',
    step3Title: '3. Дата и время',
    step3Subtitle: 'Определите удобный день и время для бронирования',
    step4Title: '4. Данные клиента',
    step4Subtitle: 'Укажите ваши контактные данные для подтверждения записи',

    bookingDate: 'Дата бронирования',
    availableHours: 'Доступные часы',
    twentyFourHourMode: '24-часовой формат',
    slotInterval: 'Интервал',
    duration: 'Длительность',
    free: 'Свободно',
    booked: 'Занято (Забронировано)',
    bookedShort: 'Занято',
    allHours: 'Все часы (24H)',
    morning: 'Утро (08:00 - 12:00)',
    afternoon: 'День (12:00 - 17:00)',
    evening: 'Вечер (17:00 - 23:00)',
    selectedTime: 'Выбранное время',
    noStaffForService: 'Для этой услуги в данный момент нет назначенного специалиста. Пожалуйста, выберите другую услугу или свяжитесь с нами.',
    noSlotsAvailable: 'На выбранную дату нет свободных слотов.',
    allServicesAssigned: 'Все услуги (Без ограничений)',
    openDaysLegend: 'Открытые дни (Запись доступна)',
    blockedDaysLegend: 'Красный: Заблокировано (Закрыто / Выбор недоступен)',
    pastDaysLegend: 'Прошедшие даты',
    dayBlockedWarning: 'Выбранный день заблокирован администратором и закрыт. Пожалуйста, выберите открытый день в календаре.',
    closedDay: 'Закрыто',
    openDay: 'Открыто',
    selectedDay: 'Выбрано',
    workingHoursLabel: 'Часы работы',

    fullName: 'Имя и Фамилия',
    phone: 'Номер телефона',
    finCode: 'FIN-код пациента',
    optional: 'Необязательно',
    onlyLetters: 'Только буквы',
    onlyDigits: 'Только цифры',
    fullNamePlaceholder: 'напр. Лейла Мамедова',
    finPlaceholder: '7 символов (напр. 7ABC123)',
    confirmBooking: 'Подтвердить бронирование',
    confirming: 'Оформление записи...',
    secureNotice: 'История ваших бронирований и медицинские данные надежно защищены.',
    priceNote: 'Оплата производится на месте после оказания услуги.',

    bookingSuccessTitle: 'Бронирование успешно оформлено!',
    bookingSuccessDesc: 'Ваша запись успешно зарегистрирована в системе. Пожалуйста, подойдите за 10 минут до назначенного времени.',
    bookingCode: 'Код бронирования',
    organization: 'Организация',
    service: 'Услуга',
    specialist: 'Специалист',
    date: 'Дата',
    time: 'Время',
    price: 'Стоимость',
    status: 'Статус',
    confirmed: 'Подтверждено',
    newBooking: 'Сделать новое бронирование',

    reviewsTitle: 'Реальные отзывы клиентов',
    reviewsSubtitle: 'Искренние мнения и впечатления клиентов о качестве наших услуг',
    avgRating: 'Средняя оценка',
    basedOnReviews: 'на основе отзывов',
    filterReviews: 'Фильтр отзывов',
    allStars: 'Все отзывы',
    star: 'звезда',
    stars: 'звёзд',
    noReviewsForStar: 'По выбранному рейтингу отзывов пока нет.',
    noReviewsYet: 'Пока нет отзывов. Станьте первым, кто оставит отзыв!',
    leaveReviewTitle: 'Оставить отзыв и поделиться впечатлениями',
    leaveReviewSubtitle: 'Ваше мнение помогает нам становиться лучше и повышать качество сервиса',
    yourName: 'Ваше имя и фамилия *',
    yourPhone: 'Ваш номер телефона *',
    serviceUsed: 'Полученная услуга *',
    yourExperience: 'Ваш отзыв и впечатления *',
    sendReview: 'Отправить отзыв',
    reviewSentSuccess: 'Ваш отзыв успешно принят и опубликован! Благодарим вас.',
    alreadyReviewed: 'Вы уже оставили отзыв об этой организации. С одного IP-адреса разрешен только один отзыв.',
    reviewPlaceholder: 'Поделитесь впечатлением об услуге, мастере и уровне обслуживания...',

    socialTitle: 'Мы в социальных сетях и контакты',
    whatsappDirect: 'Написать напрямую в WhatsApp',
    instagramPage: 'Наша страница в Instagram',
    facebookPage: 'Наша страница в Facebook',
    tiktokProfile: 'Наш профиль в TikTok',
    telegramChannel: 'Наш Telegram-канал',

    heroBadge: 'Современное бизнес-решение нового поколения',
    heroTitle1: 'Для всех сфер услуг и сервисного бизнеса',
    heroTitle2: 'Умная система онлайн-бронирования',
    heroDesc: 'Единая платформа управления очередями, специалистами и клиентами для салонов красоты, медицинских центров, барбершопов, автосервисов, фитнес-клубов и учебных заведений.',
    tryDemo: 'Попробовать демо-филиалы',
    allSectors: 'Все сферы',
    searchBranch: 'Поиск филиала или услуги...',
    bookNow: 'Записаться онлайн',
    featuredServices: 'Популярные услуги',
    call: 'Позвонить',
    address: 'Адрес',

    nameValidationError: 'В поле имени нельзя вводить цифры, используйте только буквы.',
    phoneValidationError: 'В поле телефона нельзя вводить буквы, используйте только цифры.',
    requiredFieldsError: 'Пожалуйста, заполните все обязательные поля.',
    blockedError: 'Онлайн-запись заблокирована из-за 3 неявок на предыдущие бронирования. Пожалуйста, свяжитесь напрямую с филиалом.',
    slotTakenError: 'Выбранное время уже занято или пересекается с другой записью. Пожалуйста, выберите другое время.'
  },

  en: {
    home: 'Home Page',
    login: 'Login',
    adminPanel: 'Admin Panel',
    backToHome: 'Back to Home',
    loading: 'Loading data...',
    notFound: 'Branch Not Found',
    notFoundDesc: 'The specified branch does not exist or has been deactivated.',

    step1Title: '1. Select Service',
    step1Subtitle: 'Choose the procedure or service you would like to book',
    step2Title: '2. Select Specialist',
    step2Subtitle: 'Select a specialist assigned to the selected service',
    step3Title: '3. Date & Time',
    step3Subtitle: 'Select a convenient day and time for your booking',
    step4Title: '4. Customer Information',
    step4Subtitle: 'Enter your contact details to confirm the booking',

    bookingDate: 'Booking Date',
    availableHours: 'Available Hours',
    twentyFourHourMode: '24-Hour Format',
    slotInterval: 'Interval',
    duration: 'Duration',
    free: 'Available',
    booked: 'Booked',
    bookedShort: 'Booked',
    allHours: 'All Hours (24H)',
    morning: 'Morning (08:00 - 12:00)',
    afternoon: 'Afternoon (12:00 - 17:00)',
    evening: 'Evening (17:00 - 23:00)',
    selectedTime: 'Selected Time',
    noStaffForService: 'No specialist is currently assigned to this service. Please choose another service or contact the branch directly.',
    noSlotsAvailable: 'No available time slots on this date.',
    allServicesAssigned: 'All services (Unrestricted)',
    openDaysLegend: 'Open days (Booking available)',
    blockedDaysLegend: 'Red: Blocked days (Closed / Cannot be selected)',
    pastDaysLegend: 'Past dates',
    dayBlockedWarning: 'Selected date is blocked by administrator and closed. Please choose an open date from the calendar.',
    closedDay: 'Closed',
    openDay: 'Open',
    selectedDay: 'Selected',
    workingHoursLabel: 'Working Hours',

    fullName: 'Full Name',
    phone: 'Phone Number',
    finCode: 'Patient FIN Code',
    optional: 'Optional',
    onlyLetters: 'Letters only',
    onlyDigits: 'Digits only',
    fullNamePlaceholder: 'e.g. John Doe',
    finPlaceholder: '7 characters (e.g. 7ABC123)',
    confirmBooking: 'Confirm Reservation',
    confirming: 'Booking...',
    secureNotice: 'Your health and reservation history are securely encrypted.',
    priceNote: 'Payment is made on-site after service completion.',

    bookingSuccessTitle: 'Reservation Confirmed Successfully!',
    bookingSuccessDesc: 'Your reservation details have been confirmed. Please arrive at least 10 minutes prior to your scheduled time.',
    bookingCode: 'Booking Code',
    organization: 'Organization',
    service: 'Service',
    specialist: 'Specialist',
    date: 'Date',
    time: 'Time',
    price: 'Price',
    status: 'Status',
    confirmed: 'Confirmed',
    newBooking: 'Make New Reservation',

    reviewsTitle: 'Customer Reviews',
    reviewsSubtitle: 'Honest reviews and experiences from our valued customers',
    avgRating: 'Average Rating',
    basedOnReviews: 'based on reviews',
    filterReviews: 'Filter Reviews',
    allStars: 'All Reviews',
    star: 'star',
    stars: 'stars',
    noReviewsForStar: 'No reviews found for this star rating yet.',
    noReviewsYet: 'No reviews yet. Be the first to share your experience!',
    leaveReviewTitle: 'Leave a Review & Share Your Experience',
    leaveReviewSubtitle: 'Your feedback helps us continuously improve our service quality',
    yourName: 'Your Full Name *',
    yourPhone: 'Your Phone Number *',
    serviceUsed: 'Service Received *',
    yourExperience: 'Your Review & Comments *',
    sendReview: 'Submit Review',
    reviewSentSuccess: 'Your review has been successfully submitted and published! Thank you.',
    alreadyReviewed: 'You have already submitted a review for this branch. Only one review per IP address is allowed.',
    reviewPlaceholder: 'Share your thoughts regarding the service, staff attitude, and overall experience...',

    socialTitle: 'Follow Us on Social Media & Get in Touch',
    whatsappDirect: 'Chat directly on WhatsApp',
    instagramPage: 'Our Instagram page',
    facebookPage: 'Our Facebook page',
    tiktokProfile: 'Our TikTok profile',
    telegramChannel: 'Our Telegram channel',

    heroBadge: 'Next-Generation Multi-Industry Solution',
    heroTitle1: 'For Every Service & Business Industry',
    heroTitle2: 'Smart Online Booking Platform',
    heroDesc: 'Unified queue, staff, and customer scheduling platform for beauty salons, clinics, barbershops, auto repairs, fitness studios, and education centers.',
    tryDemo: 'Explore Demo Branches',
    allSectors: 'All Sectors',
    searchBranch: 'Search branch or service...',
    bookNow: 'Book Now',
    featuredServices: 'Featured Services',
    call: 'Call',
    address: 'Address',

    nameValidationError: 'Numbers are not allowed in the name field, letters only.',
    phoneValidationError: 'Letters are not allowed in the phone field, numbers only.',
    requiredFieldsError: 'Please fill in all required fields.',
    blockedError: 'Online reservation is blocked due to 3 previous no-shows. Please contact the branch directly.',
    slotTakenError: 'The selected time slot is already taken or conflicts with an existing booking. Please pick another time.'
  }
};

export function getTranslation(key: keyof TranslationDictionary, lang: Language = 'az'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.az;
  return dict[key] || TRANSLATIONS.az[key] || key;
}

export function formatDurationByLang(mins: number, lang: Language = 'az'): string {
  if (!mins) return lang === 'ru' ? '30 мин' : (lang === 'en' ? '30 mins' : '30 dəq');
  
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    
    if (lang === 'ru') {
      const hStr = hours === 1 ? '1 час' : (hours < 5 ? `${hours} часа` : `${hours} часов`);
      if (rem === 0) return `${hStr} (${mins} мин)`;
      return `${hStr} ${rem} мин (${mins} мин)`;
    }
    
    if (lang === 'en') {
      const hStr = hours === 1 ? '1 hr' : `${hours} hrs`;
      if (rem === 0) return `${hStr} (${mins} mins)`;
      return `${hStr} ${rem} mins (${mins} mins)`;
    }

    // Default AZ
    if (rem === 0) return `${hours} saat (${mins} dəq)`;
    return `${hours} saat ${rem} dəq (${mins} dəq)`;
  }

  if (lang === 'ru') return `${mins} мин`;
  if (lang === 'en') return `${mins} mins`;
  return `${mins} dəq`;
}

export function getLocalizedServiceName(
  service: { nameAz: string; nameRu?: string; nameEn?: string },
  lang: Language = 'az'
): string {
  if (lang === 'ru' && service.nameRu && service.nameRu.trim()) {
    return service.nameRu;
  }
  if (lang === 'en' && service.nameEn && service.nameEn.trim()) {
    return service.nameEn;
  }
  return service.nameAz || service.nameEn || '';
}

const CATEGORY_MAP: Record<string, { ru: string; en: string }> = {
  'Gözəllik & Kosmetologiya': { ru: 'Красота и Косметология', en: 'Beauty & Cosmetology' },
  'Kosmetologiya': { ru: 'Косметология', en: 'Cosmetology' },
  'Səhiyyə & Diaqnostika': { ru: 'Здравоохранение и Диагностика', en: 'Healthcare & Diagnostics' },
  'Stomatologiya': { ru: 'Стоматология', en: 'Dentistry' },
  'Bərbərxana & Stil': { ru: 'Барбершоп и Стиль', en: 'Barbershop & Style' },
  'Saç & Saqqal': { ru: 'Стрижка и Борода', en: 'Hair & Beard' },
  'Avtomobil & Detailing': { ru: 'Автосервис и Детейлинг', en: 'Auto Service & Detailing' },
  'Detailing': { ru: 'Детейлинг', en: 'Detailing' },
  'Diaqnostika': { ru: 'Диагностика', en: 'Diagnostics' },
  'İdman & Fitnes': { ru: 'Спорт и Фитнес', en: 'Sports & Fitness' },
  'Fərdi Məşq': { ru: 'Персональная тренировка', en: 'Personal Training' },
  'Təhsil & Fərdi Dərslər': { ru: 'Образование и Уроки', en: 'Education & Tutoring' },
  'İmtahan Hazırlığı': { ru: 'Подготовка к экзаменам', en: 'Exam Preparation' },
  'Ümumi': { ru: 'Общее', en: 'General' },
  'Saç': { ru: 'Волосы', en: 'Hair' },
  'Baxım': { ru: 'Уход', en: 'Care' }
};

export function getLocalizedCategoryName(category: string, lang: Language = 'az'): string {
  if (!category) return '';
  if (lang === 'az') return category;
  const match = CATEGORY_MAP[category];
  if (match && match[lang]) return match[lang];
  return category;
}
