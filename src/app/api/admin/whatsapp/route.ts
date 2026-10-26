import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/auth';
import { 
  getTenantById, 
  updateTenant, 
  getWhatsAppLogs, 
  addWhatsAppLog, 
  clearWhatsAppLogs,
  getTenants 
} from '../../../../lib/dataStore';
import { 
  sendMetaCloudApiMessage, 
  sendGatewayWhatsAppMessage, 
  generateWhatsAppLink, 
  cleanPhoneForWhatsApp, 
  isValidWhatsAppPhone,
  DEFAULT_WHATSAPP_TEMPLATE 
} from '../../../../lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let tenantId = searchParams.get('tenantId') || undefined;

    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId || undefined;
    }

    if (!tenantId) {
      // If super admin and no tenantId specified, pick first tenant
      const all = getTenants();
      tenantId = all[0]?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    const tenant = getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    const logs = getWhatsAppLogs(tenantId);

    return NextResponse.json({
      success: true,
      tenantId,
      settings: {
        whatsapp: tenant.whatsapp || '',
        whatsappNotificationEnabled: tenant.whatsappNotificationEnabled !== false,
        whatsappTemplate: tenant.whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE,
        whatsappProvider: tenant.whatsappProvider || (tenant.whatsappPhoneNumberId ? 'META' : 'DIRECT'),
        whatsappPhoneNumberId: tenant.whatsappPhoneNumberId || '',
        whatsappAccessToken: tenant.whatsappAccessToken || '',
        whatsappWabaId: tenant.whatsappWabaId || '',
        whatsappGatewayUrl: tenant.whatsappGatewayUrl || ''
      },
      logs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const body = await request.json();
    let tenantId = body.tenantId;

    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Filial ID tələb olunur' }, { status: 400 });
    }

    const updates: any = {};
    if (body.whatsapp !== undefined) updates.whatsapp = body.whatsapp;
    if (body.whatsappNotificationEnabled !== undefined) updates.whatsappNotificationEnabled = Boolean(body.whatsappNotificationEnabled);
    if (body.whatsappTemplate !== undefined) updates.whatsappTemplate = body.whatsappTemplate;
    if (body.whatsappProvider !== undefined) updates.whatsappProvider = body.whatsappProvider;
    if (body.whatsappPhoneNumberId !== undefined) updates.whatsappPhoneNumberId = body.whatsappPhoneNumberId;
    if (body.whatsappAccessToken !== undefined) updates.whatsappAccessToken = body.whatsappAccessToken;
    if (body.whatsappWabaId !== undefined) updates.whatsappWabaId = body.whatsappWabaId;
    if (body.whatsappGatewayUrl !== undefined) updates.whatsappGatewayUrl = body.whatsappGatewayUrl;

    const updated = updateTenant(tenantId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp tənzimləmələri uğurla yadda saxlanıldı',
      tenant: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Giriş edilməyib' }, { status: 401 });
    }

    const body = await request.json();
    let tenantId = body.tenantId;

    if (currentUser.role !== 'SUPER_ADMIN') {
      tenantId = currentUser.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Filial ID tələb olunur' }, { status: 400 });
    }

    const tenant = getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    // Action 1: Clear Logs
    if (body.action === 'clearLogs') {
      clearWhatsAppLogs(tenantId);
      return NextResponse.json({ success: true, message: 'WhatsApp mesaj tarixçəsi təmizləndi' });
    }

    // Action 2: Send Test Message
    if (body.action === 'test') {
      const recipientPhone = String(body.phone || '').trim();
      if (!recipientPhone) {
        return NextResponse.json({ success: false, error: 'Zəhmət olmasa test nömrəsini daxil edin' }, { status: 400 });
      }

      if (!isValidWhatsAppPhone(recipientPhone)) {
        return NextResponse.json({
          success: false,
          error: 'Daxil edilən nömrə aktiv WhatsApp formatına (məsələn: +994 50 123 45 67) uyğun deyil'
        }, { status: 400 });
      }

      const cleanPhone = cleanPhoneForWhatsApp(recipientPhone);
      const testMessage = body.message || `Salam! Bu "${tenant.name}" şirkətinin rezervasiya sistemindən göndərilən rəsmi WhatsApp test bildirişidir. Əlaqə uğurla quruldu! ✅`;

      // 1. If Meta Cloud API
      if (tenant.whatsappPhoneNumberId && tenant.whatsappAccessToken) {
        const metaRes = await sendMetaCloudApiMessage({
          phoneNumberId: tenant.whatsappPhoneNumberId,
          accessToken: tenant.whatsappAccessToken,
          recipientPhone: cleanPhone,
          message: testMessage
        });

        if (metaRes.success) {
          addWhatsAppLog({
            tenantId,
            recipientPhone: cleanPhone,
            recipientName: 'Test Qəbul Edən (Admin)',
            message: testMessage,
            method: 'META_API',
            status: 'SENT',
            metaMessageId: metaRes.messageId
          });

          return NextResponse.json({
            success: true,
            method: 'META_API',
            message: `Meta Cloud API vasitəsilə mesaj birbaşa ${cleanPhone} nömrəsinə çatdırıldı!`,
            messageId: metaRes.messageId
          });
        } else {
          addWhatsAppLog({
            tenantId,
            recipientPhone: cleanPhone,
            recipientName: 'Test Qəbul Edən (Admin)',
            message: testMessage,
            method: 'META_API',
            status: 'FAILED',
            errorDetails: metaRes.error
          });

          return NextResponse.json({
            success: false,
            method: 'META_API',
            error: `Meta Cloud API xətası: ${metaRes.error}. Açarları və Phone Number ID-ni yoxlayın.`
          }, { status: 400 });
        }
      }

      // 2. If Gateway
      if (tenant.whatsappGatewayUrl) {
        const gwRes = await sendGatewayWhatsAppMessage({
          gatewayUrl: tenant.whatsappGatewayUrl,
          recipientPhone: cleanPhone,
          message: testMessage
        });

        if (gwRes.success) {
          addWhatsAppLog({
            tenantId,
            recipientPhone: cleanPhone,
            recipientName: 'Test Qəbul Edən (Admin)',
            message: testMessage,
            method: 'CUSTOM_GATEWAY',
            status: 'SENT',
            metaMessageId: gwRes.messageId
          });

          return NextResponse.json({
            success: true,
            method: 'CUSTOM_GATEWAY',
            message: `Gateway vasitəsilə test mesajı göndərildi!`
          });
        } else {
          addWhatsAppLog({
            tenantId,
            recipientPhone: cleanPhone,
            recipientName: 'Test Qəbul Edən (Admin)',
            message: testMessage,
            method: 'CUSTOM_GATEWAY',
            status: 'FAILED',
            errorDetails: gwRes.error
          });

          return NextResponse.json({
            success: false,
            method: 'CUSTOM_GATEWAY',
            error: `Gateway xətası: ${gwRes.error}`
          }, { status: 400 });
        }
      }

      // 3. Simple / Direct Click to Chat Mode
      const waLink = generateWhatsAppLink(cleanPhone, testMessage);
      addWhatsAppLog({
        tenantId,
        recipientPhone: cleanPhone,
        recipientName: 'Test Qəbul Edən (Admin)',
        message: testMessage,
        method: 'DIRECT_LINK',
        status: 'READY'
      });

      return NextResponse.json({
        success: true,
        method: 'DIRECT_LINK',
        message: 'Şirkət nömrəsi rejimi aktivdir. Mesaj linki uğurla hazırlandı!',
        waLink
      });
    }

    return NextResponse.json({ success: false, error: 'Bilinməyən əməliyyat' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
