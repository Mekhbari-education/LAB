import { PrintSettings, PrintPreviewData, DEFAULT_PRINT_SETTINGS } from '../types/printSettings';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';

/**
 * Robust Printing Service for Lab Education DZ
 * Handles direct browser printing via hidden iframes without popups or blocked windows,
 * and formats official documents following Algerian Ministry of National Education standards.
 */
export class PrintService {
  private static iframeInstance: HTMLIFrameElement | null = null;

  /**
   * Prints arbitrary HTML content using an offscreen sandboxed iframe.
   * This prevents popup blockers, avoids window.open, and doesn't interfere with the main app view.
   */
  static async printHtml(htmlContent: string, options?: { title?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clean up any existing print iframe
        if (this.iframeInstance && document.body.contains(this.iframeInstance)) {
          document.body.removeChild(this.iframeInstance);
          this.iframeInstance = null;
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.title = options?.title || 'طباعة الوثيقة';

        document.body.appendChild(iframe);
        this.iframeInstance = iframe;

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) {
          throw new Error('Unable to access iframe document for printing');
        }

        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Wait for styles, fonts, and images to settle before triggering print dialog
        const triggerPrint = () => {
          try {
            const win = iframe.contentWindow;
            if (!win) {
              resolve();
              return;
            }

            win.focus();
            
            // Listen for print completion or cancellation
            const handleAfterPrint = () => {
              win.removeEventListener('afterprint', handleAfterPrint);
              setTimeout(() => {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 1000);
              resolve();
            };

            win.addEventListener('afterprint', handleAfterPrint);

            // Trigger print dialog
            setTimeout(() => {
              try {
                win.print();
                // Fallback resolver if afterprint doesn't fire in certain browsers
                setTimeout(() => resolve(), 3000);
              } catch (printErr) {
                console.warn('Direct iframe print encountered an issue, fallback:', printErr);
                resolve();
              }
            }, 300);
          } catch (err) {
            console.error('Error triggering print inside iframe:', err);
            reject(err);
          }
        };

        if (doc.readyState === 'complete') {
          triggerPrint();
        } else {
          iframe.onload = triggerPrint;
        }
      } catch (error) {
        console.error('Print service error:', error);
        reject(error);
      }
    });
  }

  /**
   * Generates a complete, styled HTML document for reports, inventories, or tables
   * incorporating the active PrintSettings.
   */
  static generateReportHtml(data: PrintPreviewData, settings: PrintSettings = DEFAULT_PRINT_SETTINGS): string {
    const {
      title,
      subtitle,
      headers = [],
      rows = [],
      summaryCards = [],
      notes,
      suggestedOrientation
    } = data;

    const orientation = suggestedOrientation || (settings.layout.orientation === 'auto' ? 'portrait' : settings.layout.orientation);
    const paperSize = settings.layout.paperSize || 'a4';

    // Margins mapping in mm
    let marginMm = 14;
    if (settings.layout.margins === 'compact') marginMm = 8;
    if (settings.layout.margins === 'spacious') marginMm = 20;

    // Scale / Font sizes
    let scaleMultiplier = 1;
    if (settings.layout.fontSizeScale === 'small') scaleMultiplier = 0.88;
    if (settings.layout.fontSizeScale === 'large') scaleMultiplier = 1.15;

    // Color mode rules
    const isGrayscale = settings.appearance.colorMode === 'grayscale';
    const isBw = settings.appearance.colorMode === 'blackAndWhite';

    const brandPrimary = isBw ? '#000000' : isGrayscale ? '#333333' : '#2b3d22';
    const brandAccent = isBw ? '#333333' : isGrayscale ? '#555555' : '#415437';
    const bgHeader = isBw ? '#ffffff' : isGrayscale ? '#e2e2e2' : '#2b3d22';
    const textHeader = isBw ? '#000000' : isGrayscale ? '#111111' : '#ffffff';
    const rowZebraBg = settings.appearance.tableStriped
      ? (isBw ? '#ffffff' : isGrayscale ? '#f5f5f5' : '#f9faf7')
      : '#ffffff';
    const borderColor = isBw ? '#000000' : '#d2d8ce';

    const currentDate = new Date().toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const inst = settings.institution;
    const sig = settings.signatures;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title} — ${inst.school}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${marginMm}mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: '${settings.layout.fontFamily || 'Cairo'}', 'Cairo', 'Amiri', 'Segoe UI', Tahoma, sans-serif;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      background-color: #ffffff;
      font-size: ${11 * scaleMultiplier}pt;
      line-height: 1.4;
      direction: rtl;
    }

    /* Page Container */
    .sheet {
      width: 100%;
      background: #ffffff;
    }

    /* Official Ministry Header */
    .official-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: ${isBw ? '2px solid #000' : '1.5px solid ' + borderColor};
    }

    .republic-title {
      text-align: center;
      font-size: ${12 * scaleMultiplier}pt;
      font-weight: 800;
      color: ${brandPrimary};
      margin: 0 0 2px 0;
    }

    .ministry-title {
      text-align: center;
      font-size: ${10.5 * scaleMultiplier}pt;
      font-weight: 600;
      color: ${brandAccent};
      margin: 0 0 8px 0;
    }

    .header-details-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 6px;
      font-size: ${9.5 * scaleMultiplier}pt;
    }

    .header-col-right {
      text-align: right;
      line-height: 1.6;
    }

    .header-col-center {
      text-align: center;
    }

    .header-col-left {
      text-align: left;
      line-height: 1.6;
      direction: ltr;
    }

    .header-col-left div {
      direction: rtl;
      text-align: left;
    }

    .institution-logo {
      height: 48px;
      max-width: 60px;
      object-fit: contain;
    }

    /* Document Title Banner */
    .document-title-banner {
      background: ${bgHeader};
      color: ${textHeader};
      border: ${isBw ? '2px solid #000' : 'none'};
      padding: 8px 16px;
      border-radius: 4px;
      text-align: center;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .document-title-banner h1 {
      margin: 0;
      font-size: ${14 * scaleMultiplier}pt;
      font-weight: 800;
    }

    .document-title-banner .subtitle {
      margin: 3px 0 0 0;
      font-size: ${9.5 * scaleMultiplier}pt;
      font-weight: 500;
      opacity: 0.9;
    }

    /* Summary Cards */
    .summary-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .summary-card {
      flex: 1;
      min-width: 120px;
      border: 1px solid ${borderColor};
      background: ${isBw ? '#fff' : isGrayscale ? '#f0f0f0' : '#f6f8f4'};
      border-radius: 4px;
      padding: 6px 10px;
      text-align: center;
    }

    .summary-card-label {
      font-size: ${8.5 * scaleMultiplier}pt;
      color: #555;
      margin-bottom: 2px;
    }

    .summary-card-value {
      font-size: ${12 * scaleMultiplier}pt;
      font-weight: 700;
      color: ${brandPrimary};
    }

    /* Report Table */
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 12px;
      font-size: ${settings.appearance.compactRows ? 8.5 * scaleMultiplier : 9.5 * scaleMultiplier}pt;
    }

    table.report-table th,
    table.report-table td {
      border: 1px solid ${isBw || settings.appearance.highContrastBorders ? '#000000' : borderColor};
      padding: ${settings.appearance.compactRows ? '4px 6px' : '6px 8px'};
      text-align: right;
      vertical-align: middle;
    }

    table.report-table th {
      background-color: ${bgHeader};
      color: ${textHeader};
      font-weight: 700;
      font-size: ${10 * scaleMultiplier}pt;
      white-space: nowrap;
    }

    table.report-table tr:nth-child(even) td {
      background-color: ${rowZebraBg};
    }

    /* Notes Block */
    .notes-box {
      border-right: 3px solid ${brandPrimary};
      background: ${isBw ? '#ffffff' : isGrayscale ? '#f2f2f2' : '#f7f9f5'};
      padding: 8px 12px;
      margin: 12px 0;
      font-size: ${9 * scaleMultiplier}pt;
      page-break-inside: avoid;
    }

    .notes-box strong {
      display: block;
      color: ${brandPrimary};
      margin-bottom: 3px;
    }

    /* Signatures and Stamps Block */
    .signatures-section {
      margin-top: 20px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      gap: 15px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signature-card {
      flex: 1;
      border: 1px dashed ${isBw ? '#000' : '#a8b2a1'};
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fafbfa;
    }

    .signature-card-title {
      font-size: ${9.5 * scaleMultiplier}pt;
      font-weight: 700;
      color: ${brandPrimary};
      margin-bottom: 4px;
    }

    .signature-card-subtitle {
      font-size: ${8 * scaleMultiplier}pt;
      color: #777;
    }

    .stamp-circle-zone {
      margin: 8px auto 0;
      width: 55px;
      height: 55px;
      border: 1px dotted #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      color: #aaa;
    }

    /* Footer disclaimer */
    .document-footer {
      margin-top: 15px;
      padding-top: 6px;
      border-top: 1px solid ${borderColor};
      display: flex;
      justify-content: space-between;
      font-size: ${8 * scaleMultiplier}pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${settings.institution.headerStyle !== 'minimal' ? `
    <header class="official-header">
      ${inst.showRepublicHeader ? `<h2 class="republic-title">${inst.country}</h2>` : ''}
      ${inst.showMinistry ? `<h3 class="ministry-title">${inst.ministry}</h3>` : ''}
      
      <div class="header-details-grid">
        <div class="header-col-right">
          <div><strong>مديرية التربية:</strong> ${inst.directorate}</div>
          <div>${formatSchoolWithCommune(inst.school, inst.commune)}</div>
          <div><strong>المخبر:</strong> ${inst.laboratory}</div>
        </div>

        ${inst.showLogo ? `
        <div class="header-col-center">
          <img src="${logo}" alt="شعار وزارة التربية" class="institution-logo" />
        </div>
        ` : ''}

        <div class="header-col-left">
          <div><strong>السنة الدراسية:</strong> ${inst.academicYear}</div>
          ${inst.showDate ? `<div><strong>تاريخ الإصدار:</strong> ${currentDate}</div>` : ''}
          <div><strong>الصفة:</strong> ${sig.labManagerTitle}</div>
        </div>
      </div>
    </header>
    ` : ''}

    <div class="document-title-banner">
      <h1>${title}</h1>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
    </div>

    ${summaryCards.length > 0 ? `
    <div class="summary-grid">
      ${summaryCards.map(c => `
        <div class="summary-card">
          <div class="summary-card-label">${c.label}</div>
          <div class="summary-card-value">${c.value}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${headers.length > 0 && rows.length > 0 ? `
    <table class="report-table">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '—'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${notes ? `
    <div class="notes-box">
      <strong>ملاحظات وإرشادات إدارية:</strong>
      <div>${notes}</div>
    </div>
    ` : ''}

    ${sig.showSignatures ? `
    <div class="signatures-section">
      ${sig.showLabManager ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.labManagerTitle}</div>
          <div class="signature-card-subtitle">(الاسم، التوقيع والختم)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showTeacher ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.teacherTitle}</div>
          <div class="signature-card-subtitle">(التوقيع والملاحظات)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showInspector ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.inspectorTitle}</div>
          <div class="signature-card-subtitle">(تأشيرة المفتش وتاريخ الزيارة)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showPrincipal ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.principalTitle}</div>
          <div class="signature-card-subtitle">(تأشيرة المصادقة والختم الرسمي)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}

    <footer class="document-footer">
      <div>${sig.customDisclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'}</div>
      <div>${formatSchoolWithCommune(inst.school, inst.commune)} — ${inst.laboratory}</div>
      <div>صفحة 1 من 1</div>
    </footer>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generates printable sticker sheets with QR codes based on selected grid presets (e.g. 2x4, 3x7, 4x8)
   */
  static generateStickersHtml(
    stickers: Array<{ id: string; name: string; qrValue: string; category?: string; location?: string; code?: string }>,
    settings: PrintSettings = DEFAULT_PRINT_SETTINGS
  ): string {
    const qrConfig = settings.qrSticker;
    const cols = qrConfig.gridColumns || 3;
    const widthMm = qrConfig.stickerWidthMm || 63.5;
    const heightMm = qrConfig.stickerHeightMm || 38.1;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>ملصقات وقصاصات التجهيزات والمواد — ${settings.institution.school}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', sans-serif;
      margin: 0;
      padding: 0;
      background: white;
      direction: rtl;
    }
    .stickers-grid {
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: 3mm;
      width: 100%;
    }
    .sticker-card {
      border: 1px solid #c9d2c2;
      border-radius: 6px;
      padding: 4px 6px;
      height: ${heightMm}mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      background: #ffffff;
      overflow: hidden;
    }
    .sticker-info {
      flex: 1;
      padding-left: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .sticker-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }
    .sticker-logo {
      height: 14px;
      width: auto;
    }
    .sticker-institution {
      font-size: 6.5pt;
      font-weight: 700;
      color: #3b4e33;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sticker-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #1a2216;
      line-height: 1.2;
      margin-bottom: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sticker-meta {
      font-size: 6.5pt;
      color: #555;
      display: flex;
      gap: 6px;
    }
    .sticker-id {
      font-family: monospace;
      font-weight: bold;
      color: #2b3d22;
      direction: ltr;
      display: inline-block;
    }
    .qr-container {
      width: 32mm;
      height: 32mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-container img, .qr-container svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="stickers-grid">
    ${stickers.map(item => {
      // Use quickchart QR or inline SVG placeholder
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.qrValue || item.id)}`;
      return `
        <div class="sticker-card">
          <div class="sticker-info">
            <div class="sticker-header">
              ${qrConfig.showLogo ? `<img src="${logo}" alt="" class="sticker-logo" />` : ''}
              ${qrConfig.showSchoolName ? `<span class="sticker-institution">${formatSchoolWithCommune(settings.institution.school, settings.institution.commune)}</span>` : ''}
            </div>
            <div class="sticker-title">${item.name}</div>
            <div class="sticker-meta">
              ${qrConfig.showCategory && item.category ? `<span>${item.category}</span>` : ''}
              ${qrConfig.showStorageLocation && item.location ? `<span>${item.location}</span>` : ''}
            </div>
            ${qrConfig.showItemCode ? `<div class="sticker-id">ID: ${item.code || item.id}</div>` : ''}
          </div>
          <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
    `;
  }

  /**
   * Generates and prints a complete test page to verify printer alignment, margins, and Arabic font rendering.
   */
  static async printTestPage(settings: PrintSettings = DEFAULT_PRINT_SETTINGS): Promise<void> {
    const testData: PrintPreviewData = {
      title: 'صفحة اختبار إعدادات الطباعة والوثائق الرسمية',
      subtitle: 'نموذج تجريبي للتحقق من هوامش الصفحة، دقة الخط العربي، وتناسق الألوان',
      type: 'table',
      headers: ['#', 'الخاصية / الإعداد', 'القيمة الحالية', 'حالة الجودة في الطباعة'],
      rows: [
        ['1', 'حجم الورق المحدد', settings.layout.paperSize.toUpperCase(), 'سليم ومطابق للقياس العالمي'],
        ['2', 'اتجاه الورقة', settings.layout.orientation === 'portrait' ? 'عمودي (Portrait)' : 'أفقي (Landscape)', 'مضبوط تلقائياً'],
        ['3', 'حجم الهوامش', settings.layout.margins === 'compact' ? 'مضغوط (8mm)' : settings.layout.margins === 'spacious' ? 'واسع (20mm)' : 'قياسي (14mm)', 'ضمن حدود الطابعة الآمنة'],
        ['4', 'نمط الألوان المعتمد', settings.appearance.colorMode === 'color' ? 'ملون رسمي عالي الدقة' : settings.appearance.colorMode === 'grayscale' ? 'تدرج رمادي لتوفير الحبر (Eco)' : 'أبيض وأسود للنسخ', 'جاهز للمعاينة'],
        ['5', 'الخط العربي والاتجاه', `${settings.layout.fontFamily} - اتجاه من اليمين إلى اليسار (RTL)`, 'حروف متصلة وسليمة تماماً']
      ],
      summaryCards: [
        { label: 'حجم الورق', value: settings.layout.paperSize.toUpperCase() },
        { label: 'نمط الطباعة', value: settings.appearance.colorMode },
        { label: 'الهامش', value: `${settings.layout.margins}` },
        { label: 'تاريخ الفحص', value: new Date().toLocaleDateString('ar-DZ') }
      ],
      notes: 'تمت طباعة هذه الوثيقة التجريبية بنجاح عبر المحرك المدمج للنظام الرقمي لتسيير المخابر المدرسية. إذا كانت النصوص واضحة والحدود مستقيمة، فإن إعدادات الطابعة مضبوطة بالشكل المثالي.'
    };

    const html = this.generateReportHtml(testData, settings);
    return this.printHtml(html, { title: 'صفحة فحص الطابعة — مخبر العلوم' });
  }
}
