/**
 * WhatsApp Avtomatik Bildiriş və Mesaj İnteqrasiya Modulu
 */

export const DEFAULT_WHATSAPP_TEMPLATE =
  'Rezervasiyanız uğurlu həyata keçirilmişdir. Saat {timeSlot} radələrində (+-10 dəqiqə)  "{tenantName}" ailəsi tərəfindən gözləniləcəksiniz. Sizi aramızda görməkdən məmnun olacayıq.';

/**
 * Nömrəni beynəlxalq WhatsApp formatına (məs. 994501234567) çevirir
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');

  // Əgər nömrə '0' ilə başlayırsa (məs: 0501234567 -> 994501234567)
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '994' + digits.substring(1);
  }
  // Əgər 9 rəqəmlidirsə (məs: 501234567 -> 994501234567)
  else if (digits.length === 9) {
    digits = '994' + digits;
  }

  return digits;
}

/**
 * Nömrənin WhatsApp üçün uyğun mobil formatda olub-olmamasını yoxlayır
 */
export function isValidWhatsAppPhone(phone: string): boolean {
  const cleaned = cleanPhoneForWhatsApp(phone);
  if (!cleaned || cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }

  // Azərbaycan mobil operatorları prefiksləri: 99450, 99451, 99455, 99470, 99477, 99499, 99410
  if (cleaned.startsWith('994')) {
    const azPrefix = cleaned.substring(3, 5);
    const validAzPrefixes = ['50', '51', '55', '70', '77', '99', '10', '60'];
    return validAzPrefixes.includes(azPrefix) && cleaned.length === 12;
  }

  // Digər beynəlxalq nömrələr üçün ən azı 10 rəqəm
  return cleaned.length >= 10;
}

/**
 * Şablon mətndəki {timeSlot}, {tenantName}, {customerName}, {date} dəyişənlərini əvəz edir
 */
export function formatWhatsAppMessage(
  template: string | null | undefined,
  data: {
    tenantName: string;
    timeSlot: string;
    customerName?: string;
    date?: string;
    serviceName?: string;
  }
): string {
  const tmpl = template && template.trim().length > 0 ? template.trim() : DEFAULT_WHATSAPP_TEMPLATE;

  return tmpl
    .replace(/{timeSlot}/g, data.timeSlot)
    .replace(/{tenantName}/g, data.tenantName)
    .replace(/{customerName}/g, data.customerName || '')
    .replace(/{date}/g, data.date || '')
    .replace(/{serviceName}/g, data.serviceName || '');
}

/**
 * Birbaşa WhatsApp Web və Mobil tətbiqi keçid linki (Click to Chat) yaradır
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppNotificationResult {
  enabled: boolean;
  isWhatsAppValid: boolean;
  recipientPhone: string;
  formattedPhone: string;
  companyName: string;
  message: string;
  waLink: string;
  sentAt: string;
  status: 'READY' | 'DISPATCHED' | 'INVALID_PHONE' | 'DISABLED';
}

/**
 * Rezervasiya zamanı avtomatik WhatsApp bildirişini hazırlayır və göndərilməsini təmin edir
 */
export function prepareWhatsAppBookingNotification(options: {
  tenantName: string;
  tenantWhatsApp?: string | null;
  tenantPhone?: string | null;
  notificationEnabled?: boolean;
  customTemplate?: string | null;
  customerPhone: string;
  customerName: string;
  timeSlot: string;
  date: string;
  serviceName?: string;
}): WhatsAppNotificationResult {
  const isEnabled = options.notificationEnabled !== false;
  const isWhatsAppValid = isValidWhatsAppPhone(options.customerPhone);
  const cleanPhone = cleanPhoneForWhatsApp(options.customerPhone);

  const message = formatWhatsAppMessage(options.customTemplate, {
    tenantName: options.tenantName,
    timeSlot: options.timeSlot,
    customerName: options.customerName,
    date: options.date,
    serviceName: options.serviceName
  });

  const waLink = generateWhatsAppLink(cleanPhone, message);

  let status: WhatsAppNotificationResult['status'] = 'READY';
  if (!isEnabled) {
    status = 'DISABLED';
  } else if (!isWhatsAppValid) {
    status = 'INVALID_PHONE';
  } else {
    status = 'DISPATCHED';
  }

  return {
    enabled: isEnabled,
    isWhatsAppValid,
    recipientPhone: cleanPhone,
    formattedPhone: options.customerPhone,
    companyName: options.tenantName,
    message,
    waLink,
    sentAt: new Date().toISOString(),
    status
  };
}
