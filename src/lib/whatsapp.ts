import { Tenant, WhatsAppLogItem } from './types';

/**
 * WhatsApp Avtomatik Bildiriş, Meta Cloud API və Gateway İnteqrasiya Modulu
 */

export const DEFAULT_WHATSAPP_TEMPLATE =
  'Rezervasiyanız müvəffəqiyyətlə qeydə alınmışdır. Gün: {date}, Saat: {timeSlot}. 10 dəqiqə gecikmə payı mövcuddur. Qeyd: 3 dəfə rezervasiya ləğv edildikdən sonra təkrar rezervasiya almaq mümkünsüzdür. Anlayışınız üçün təşəkkür edirik';

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

  // Azərbaycan mobil operatorları prefiksləri: 99450, 99451, 99455, 99470, 99477, 99499, 99410, 99460
  if (cleaned.startsWith('994')) {
    const azPrefix = cleaned.substring(3, 5);
    const validAzPrefixes = ['50', '51', '55', '70', '77', '99', '10', '60'];
    return validAzPrefixes.includes(azPrefix) && cleaned.length === 12;
  }

  // Digər beynəlxalq nömrələr üçün ən azı 10 rəqəm
  return cleaned.length >= 10;
}

/**
 * Şablon mətndəki {timeSlot}, {tenantName}, {customerName}, {date}, {serviceName}, {staffName} dəyişənlərini əvəz edir
 */
export function formatWhatsAppMessage(
  template: string | null | undefined,
  data: {
    tenantName: string;
    timeSlot: string;
    customerName?: string;
    date?: string;
    serviceName?: string;
    staffName?: string;
  }
): string {
  const tmpl = template && template.trim().length > 0 ? template.trim() : DEFAULT_WHATSAPP_TEMPLATE;

  return tmpl
    .replace(/{timeSlot}/g, data.timeSlot)
    .replace(/{tenantName}/g, data.tenantName)
    .replace(/{customerName}/g, data.customerName || '')
    .replace(/{date}/g, data.date || '')
    .replace(/{serviceName}/g, data.serviceName || '')
    .replace(/{staffName}/g, data.staffName || '');
}

/**
 * Birbaşa WhatsApp Web və Mobil tətbiqi keçid linki (Click to Chat) yaradır
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Meta WhatsApp Cloud API vasitəsilə mesajın birbaşa arxa fonda göndərilməsi
 */
export async function sendMetaCloudApiMessage(options: {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanPhone = cleanPhoneForWhatsApp(options.recipientPhone);
    const url = `https://graph.facebook.com/v20.0/${options.phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: options.message
        }
      })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }

    const errMsg = data.error?.message || (typeof data === 'string' ? data : JSON.stringify(data));
    return { success: false, error: errMsg };
  } catch (err: any) {
    return { success: false, error: err.message || 'Meta API şəbəkə bağlantı xətası' };
  }
}

/**
 * Fərdi WhatsApp Gateway / Webhook vasitəsilə mesajın göndərilməsi (UltraMsg, GreenAPI və s.)
 */
export async function sendGatewayWhatsAppMessage(options: {
  gatewayUrl: string;
  recipientPhone: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanPhone = cleanPhoneForWhatsApp(options.recipientPhone);
    const res = await fetch(options.gatewayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cleanPhone,
        phone: cleanPhone,
        message: options.message,
        text: options.message,
        body: options.message
      })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, messageId: data.id || data.messageId || 'gw-' + Date.now() };
    }
    return { success: false, error: data.error || data.message || `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gateway bağlantı xətası' };
  }
}

export interface WhatsAppNotificationResult {
  enabled: boolean;
  isWhatsAppValid: boolean;
  recipientPhone: string;
  formattedPhone: string;
  companyName: string;
  companyWhatsApp: string;
  message: string;
  waLink: string;
  sentAt: string;
  status: 'SENT' | 'READY' | 'INVALID_PHONE' | 'DISABLED' | 'FAILED';
  method: 'META_API' | 'DIRECT_LINK' | 'CUSTOM_GATEWAY';
  directSendAttempted: boolean;
  directSendSuccess: boolean;
  errorDetails?: string;
  metaMessageId?: string;
}

/**
 * Rezervasiya tamamlandıqda avtomatik WhatsApp göndərişi və ya link hazırlığı
 */
export async function dispatchWhatsAppBookingNotification(options: {
  tenant: Tenant;
  customerPhone: string;
  customerName: string;
  timeSlot: string;
  date: string;
  serviceName?: string;
  staffName?: string;
  logHandler?: (log: Omit<WhatsAppLogItem, 'id' | 'createdAt'>) => void;
}): Promise<WhatsAppNotificationResult> {
  const { tenant } = options;
  const isEnabled = tenant.whatsappNotificationEnabled !== false;
  const isWhatsAppValid = isValidWhatsAppPhone(options.customerPhone);
  const cleanRecipientPhone = cleanPhoneForWhatsApp(options.customerPhone);

  const recordLog = (logData: Omit<WhatsAppLogItem, 'id' | 'createdAt'>) => {
    try {
      if (typeof options.logHandler === 'function') {
        options.logHandler(logData);
      }
    } catch (e) {
      // Ignore logging failures
    }
  };

  const message = formatWhatsAppMessage(tenant.whatsappTemplate, {
    tenantName: tenant.name,
    timeSlot: options.timeSlot,
    customerName: options.customerName,
    date: options.date,
    serviceName: options.serviceName,
    staffName: options.staffName
  });

  const waLink = generateWhatsAppLink(cleanRecipientPhone, message);
  const companyPhone = tenant.whatsapp || tenant.phone || '';

  const result: WhatsAppNotificationResult = {
    enabled: isEnabled,
    isWhatsAppValid,
    recipientPhone: cleanRecipientPhone,
    formattedPhone: options.customerPhone,
    companyName: tenant.name,
    companyWhatsApp: companyPhone,
    message,
    waLink,
    sentAt: new Date().toISOString(),
    status: 'READY',
    method: 'DIRECT_LINK',
    directSendAttempted: false,
    directSendSuccess: false
  };

  if (!isEnabled) {
    result.status = 'DISABLED';
    return result;
  }

  if (!isWhatsAppValid) {
    result.status = 'INVALID_PHONE';
    recordLog({
      tenantId: tenant.id,
      recipientPhone: options.customerPhone,
      recipientName: options.customerName,
      message,
      method: 'DIRECT_LINK',
      status: 'INVALID_PHONE',
      errorDetails: 'Nömrə aktiv WhatsApp mobil formatına uyğun deyil'
    });
    return result;
  }

  // 1. Meta Cloud API mövcuddursa birbaşa göndər
  if (tenant.whatsappPhoneNumberId && tenant.whatsappAccessToken) {
    result.directSendAttempted = true;
    result.method = 'META_API';

    const metaRes = await sendMetaCloudApiMessage({
      phoneNumberId: tenant.whatsappPhoneNumberId,
      accessToken: tenant.whatsappAccessToken,
      recipientPhone: cleanRecipientPhone,
      message
    });

    if (metaRes.success) {
      result.directSendSuccess = true;
      result.status = 'SENT';
      result.metaMessageId = metaRes.messageId;

      recordLog({
        tenantId: tenant.id,
        recipientPhone: cleanRecipientPhone,
        recipientName: options.customerName,
        message,
        method: 'META_API',
        status: 'SENT',
        metaMessageId: metaRes.messageId
      });
      return result;
    } else {
      result.directSendSuccess = false;
      result.status = 'READY'; // Keep waLink ready for manual fallback
      result.errorDetails = metaRes.error;

      recordLog({
        tenantId: tenant.id,
        recipientPhone: cleanRecipientPhone,
        recipientName: options.customerName,
        message,
        method: 'META_API',
        status: 'FAILED',
        errorDetails: metaRes.error
      });
      return result;
    }
  }

  // 2. Custom Gateway / Webhook mövcuddursa
  if (tenant.whatsappGatewayUrl) {
    result.directSendAttempted = true;
    result.method = 'CUSTOM_GATEWAY';

    const gwRes = await sendGatewayWhatsAppMessage({
      gatewayUrl: tenant.whatsappGatewayUrl,
      recipientPhone: cleanRecipientPhone,
      message
    });

    if (gwRes.success) {
      result.directSendSuccess = true;
      result.status = 'SENT';
      result.metaMessageId = gwRes.messageId;

      recordLog({
        tenantId: tenant.id,
        recipientPhone: cleanRecipientPhone,
        recipientName: options.customerName,
        message,
        method: 'CUSTOM_GATEWAY',
        status: 'SENT',
        metaMessageId: gwRes.messageId
      });
      return result;
    } else {
      result.directSendSuccess = false;
      result.status = 'READY';
      result.errorDetails = gwRes.error;

      recordLog({
        tenantId: tenant.id,
        recipientPhone: cleanRecipientPhone,
        recipientName: options.customerName,
        message,
        method: 'CUSTOM_GATEWAY',
        status: 'FAILED',
        errorDetails: gwRes.error
      });
      return result;
    }
  }

  // 3. Sadə rejim: Şirkətin WhatsApp nömrəsi ilə birbaşa Click to Chat linki
  result.status = 'READY';
  result.method = 'DIRECT_LINK';
  result.directSendSuccess = true;

  recordLog({
    tenantId: tenant.id,
    recipientPhone: cleanRecipientPhone,
    recipientName: options.customerName,
    message,
    method: 'DIRECT_LINK',
    status: 'READY'
  });

  return result;
}
