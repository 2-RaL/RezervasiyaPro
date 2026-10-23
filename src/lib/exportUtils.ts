import { Booking } from './types';

/**
 * Rezervasiyaları Microsoft Excel və digər cədvəl proqramları üçün
 * UTF-8 BOM ilə kodlaşdırılmış .CSV faylı kimi avtomatik endirir.
 */
export function exportBookingsToCSV(bookings: Booking[], customFileName?: string) {
  if (!bookings || bookings.length === 0) {
    alert('Endirmək üçün heç bir rezervasiya tapılmadı.');
    return;
  }

  const statusMap: Record<string, string> = {
    COMPLETED: 'Tamamlandı (Gəldi)',
    CONFIRMED: 'Təsdiqləndi',
    CANCELLED: 'İmtina Edildi',
    NO_SHOW: 'Gəlmədi (No-Show)'
  };

  const headers = [
    'Rezervasiya ID',
    'Müştəri Adı',
    'Əlaqə Nömrəsi',
    'Müştəri FİN',
    'Müəssisə / Filial',
    'Xidmət Adı',
    'Qiymət (AZN)',
    'Mütəxəssis',
    'Tarix',
    'Saat',
    'Müddət (dəq)',
    'Status',
    'Müştəri Balı',
    'Admin Qeydləri',
    'Yaradılma Tarixi'
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = bookings.map(b => [
    escapeCSV(b.id),
    escapeCSV(b.customerName),
    escapeCSV(b.customerPhone),
    escapeCSV(b.customerFin || '-'),
    escapeCSV(b.tenantName || 'Filial'),
    escapeCSV(b.serviceName || '-'),
    escapeCSV(b.servicePrice !== undefined ? b.servicePrice : '-'),
    escapeCSV(b.staffName || 'Təyin edilməyib'),
    escapeCSV(b.date),
    escapeCSV(b.timeSlot),
    escapeCSV(b.duration || 30),
    escapeCSV(statusMap[b.status] || b.status),
    escapeCSV(b.customerScore !== undefined ? b.customerScore : '-'),
    escapeCSV(b.adminNotes || ''),
    escapeCSV(b.createdAt ? new Date(b.createdAt).toLocaleDateString('az-AZ') : '-')
  ].join(';'));

  // UTF-8 BOM (\uFEFF) ensures Excel renders Azerbaijani characters (ə, ö, ü, ç, ş, ğ) natively without gibberish
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', customFileName || `Rezervasiyalar_Hesabati_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Rezervasiyalar və Statistik İcmal üçün xüsusi dizayn edilmiş
 * A4 formatlı çap və PDF hesabat sənədi pəncərəsini açır.
 */
export function printBookingsReport(
  bookings: Booking[],
  options?: {
    title?: string;
    subtitle?: string;
    tenantName?: string;
    dateRangeLabel?: string;
  }
) {
  if (typeof window === 'undefined') return;

  const total = bookings.length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const noShow = bookings.filter(b => b.status === 'NO_SHOW').length;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (Number(b.servicePrice) || 0), 0);

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    COMPLETED: { label: 'Gəldi (Tamamlandı)', bg: '#dcfce7', text: '#15803d' },
    CONFIRMED: { label: 'Təsdiqləndi', bg: '#e0e7ff', text: '#4338ca' },
    CANCELLED: { label: 'İmtina Edildi', bg: '#fee2e2', text: '#b91c1c' },
    NO_SHOW: { label: 'Gəlmədi', bg: '#fef3c7', text: '#b45309' }
  };

  const rowsHtml = bookings.map((b, i) => {
    const badge = statusBadges[b.status] || { label: b.status, bg: '#f1f5f9', text: '#475569' };
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 8px 10px; color: #64748b;">#${i + 1}</td>
        <td style="padding: 8px 10px; font-weight: 600; color: #0f172a;">${b.customerName}</td>
        <td style="padding: 8px 10px; color: #334155;">${b.customerPhone}</td>
        <td style="padding: 8px 10px; color: #334155;">${b.serviceName || '-'}</td>
        <td style="padding: 8px 10px; color: #334155;">${b.staffName || '-'}</td>
        <td style="padding: 8px 10px; font-weight: 600; color: #0f172a;">${b.date} • ${b.timeSlot}</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #059669;">${b.servicePrice !== undefined ? b.servicePrice + ' ₼' : '-'}</td>
        <td style="padding: 8px 10px;">
          <span style="background: ${badge.bg}; color: ${badge.text}; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;">
            ${badge.label}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up pəncərə bloklandı. Zəhmət olmasa brauzerdə pop-up-lara icazə verin.');
    return;
  }

  const generatedDate = new Date().toLocaleString('az-AZ');

  const html = `
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="utf-8">
      <title>${options?.title || 'Rezervasiya və Hərəkətlənmə Hesabatı'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-title {
          font-size: 22px;
          font-weight: 800;
          color: #4f46e5;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .meta-info {
          text-align: right;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px;
          text-align: center;
        }
        .kpi-card .val {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .kpi-card .lbl {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border-bottom: 2px solid #cbd5e1;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
        }
        .sign-area {
          display: flex;
          gap: 40px;
          margin-top: 25px;
          font-size: 11px;
          color: #475569;
        }
        .sign-box {
          border-top: 1px dashed #94a3b8;
          width: 160px;
          padding-top: 4px;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">Rezervasiya<span style="color: #0f172a;">Pro</span></div>
          <div class="subtitle">${options?.tenantName || 'Rəsmi Rezervasiya İdarəetmə Sistemi'} • ${options?.title || 'Rəsmi Hesabat Sənədi'}</div>
        </div>
        <div class="meta-info">
          <div><b>Dövr:</b> ${options?.dateRangeLabel || 'Bütün vaxtlar'}</div>
          <div><b>Çap tarixi:</b> ${generatedDate}</div>
          <div><b>Müəssisə:</b> ${options?.tenantName || 'Bütün Filiallar'}</div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="val">${total}</div>
          <div class="lbl">Cəmi Rezervasiya</div>
        </div>
        <div class="kpi-card" style="border-color: #86efac;">
          <div class="val" style="color: #16a34a;">${completed}</div>
          <div class="lbl">Gələnlər (Tamamlandı)</div>
        </div>
        <div class="kpi-card" style="border-color: #a5b4fc;">
          <div class="val" style="color: #4f46e5;">${confirmed}</div>
          <div class="lbl">Gözləyən / Təsdiqli</div>
        </div>
        <div class="kpi-card" style="border-color: #fca5a5;">
          <div class="val" style="color: #dc2626;">${cancelled}</div>
          <div class="lbl">İmtina Edilənlər</div>
        </div>
        <div class="kpi-card" style="border-color: #fde047;">
          <div class="val" style="color: #ca8a04;">${totalRevenue} ₼</div>
          <div class="lbl">Faktiki Gəlir</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Müştəri</th>
            <th>Telefon</th>
            <th>Xidmət</th>
            <th>Mütəxəssis</th>
            <th>Tarix & Saat</th>
            <th>Məbləğ</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align:center; padding: 20px; color:#94a3b8;">Heç bir qeyd tapılmadı</td></tr>'}
        </tbody>
      </table>

      <div class="sign-area">
        <div>
          <div>Məsul Administrator:</div>
          <div class="sign-box" style="margin-top: 25px;">İmza</div>
        </div>
        <div>
          <div>Möhür Yeri:</div>
          <div class="sign-box" style="margin-top: 25px;">M.Y.</div>
        </div>
      </div>

      <div class="footer">
        <div>RezervasiyaPro SaaS Enterprise • Avtomatlaşdırılmış Hesabat Sistemi</div>
        <div>Səhifə 1 / 1</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
