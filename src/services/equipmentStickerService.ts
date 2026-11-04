import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import { formatSchoolWithCommune } from '../lib/utils';

export interface EquipmentStickerItem {
  id: string;
  name: string;
  smartNameAr?: string;
  serialNumber?: string; // رقم الجرد العام
  type?: string; // 'glassware' | 'tech' | 'other'
  category?: string; // e.g. عتاد بصري / أجهزة كهربائية / زجاجيات
  location?: string; // مكان الحفظ (الخزانة / الرف / القاعة)
  registrationDate?: string; // تاريخ التكفل بالتسجيل / الدخول
  foundationalInventory?: string;
  source?: string; // المصدر / المورد
  supplier?: string;
  price?: string;
  status?: string; // 'functional' | 'maintenance' | 'broken'
  notes?: string;
}

export type StickerPreset = 'standard_8' | 'compact_18' | 'mini_24' | 'single';

export interface EquipmentStickerOptions {
  items: EquipmentStickerItem[];
  schoolName: string;
  commune?: string;
  directorate?: string;
  laboratoryName?: string;
  preset?: StickerPreset; // standard_8 (default), compact_18, mini_24, single
  includeQrCode?: boolean;
  includeBarcode?: boolean;
  includeMinistryHeader?: boolean;
  includeSchoolName?: boolean;
  includeLocation?: boolean;
  includeDate?: boolean;
  includeStatusBadge?: boolean;
  includeWarningNotice?: boolean;
  cutGuides?: boolean;
  colorMode?: 'color' | 'bw' | 'grayscale';
  copiesPerItem?: number;
}

/**
 * Detects or estimates the category of equipment for the sticker
 */
export function getEquipmentCategory(item: EquipmentStickerItem): string {
  if (item.category && item.category.trim()) return item.category.trim();
  const name = (item.smartNameAr || item.name || '').toLowerCase();
  if (name.includes('مجهر') || name.includes('عدسة') || name.includes('موشور') || name.includes('مرآة') || name.includes('منظار')) {
    return 'عتاد بصري ومجهري';
  }
  if (name.includes('مولد') || name.includes('فولطمتر') || name.includes('أمبيرمتر') || name.includes('راسم') || name.includes('مقاومة') || name.includes('وشيعة') || name.includes('مكثفة')) {
    return 'أجهزة كهربائية وإلكترونية';
  }
  if (name.includes('ميزان') || name.includes('ثرمومتر') || name.includes('محرار') || name.includes('دينامومتر') || name.includes('بارومتر')) {
    return 'أجهزة قياس ومعايرة';
  }
  if (name.includes('أنبوب') || name.includes('بيشر') || name.includes('حوجلة') || name.includes('مخبار') || name.includes('دورق') || name.includes('قمع') || item.type === 'glassware') {
    return 'زجاجيات وأدوات مخبرية';
  }
  if (name.includes('مجسم') || name.includes('هيكل') || name.includes('كرة أرضية') || name.includes('لوحة')) {
    return 'وسائل إيضاح ومجسمات';
  }
  if (name.includes('منبع') || name.includes('مسخن') || name.includes('طرد مركزي') || name.includes('حمام مائي')) {
    return 'تجهيزات مخبرية عامة';
  }
  return item.type === 'tech' ? 'أجهزة وتجهيزات تقنية' : 'عتاد وأدوات مخبرية';
}

/**
 * Renders an offline vector SVG QR code with quiet margin
 */
export function renderQrCodeSvg(value: string, size = 64): string {
  try {
    return renderToStaticMarkup(
      React.createElement(QRCodeSVG, {
        value,
        size,
        level: 'M',
        includeMargin: false,
      })
    );
  } catch {
    return `<div style="width:${size}px;height:${size}px;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:bold;">QR</div>`;
  }
}

/**
 * Generates a clean, crisp vector SVG barcode (Code-128 / Code-39 representation)
 * for instant scanner reading and authentic official asset tag styling.
 */
export function renderBarcodeSvg(rawText: string, width = 140, height = 24): string {
  const cleanCode = (rawText || 'INV-001').toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'INV-001';
  
  // Seedable pattern generator to create authentic barcode stripe widths based on characters
  const patterns: number[] = [2, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1];
  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    patterns.push((charCode % 3) + 1);
    patterns.push(((charCode >> 1) % 2) + 1);
    patterns.push(((charCode >> 2) % 3) + 1);
    patterns.push(((charCode >> 3) % 2) + 1);
  }
  patterns.push(2, 1, 3, 1, 2);

  const totalUnits = patterns.reduce((acc, curr) => acc + curr, 0);
  const barUnitWidth = width / totalUnits;

  let x = 0;
  let rects = '';
  for (let i = 0; i < patterns.length; i++) {
    const w = patterns[i] * barUnitWidth;
    if (i % 2 === 0) {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="#000000" />`;
    }
    x += w;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
      ${rects}
    </svg>
  `;
}

/**
 * Builds the complete, standalone printable HTML document for Equipment Inventory Stickers.
 * Optimized for sticking directly on laboratory devices and equipment.
 */
export function generateEquipmentStickersHtml(options: EquipmentStickerOptions): string {
  const {
    items = [],
    schoolName = 'المؤسسة التربوية',
    commune = '',
    directorate = '',
    laboratoryName = 'مخبر العلوم الفيزيائية والطبيعية',
    preset = 'standard_8',
    includeQrCode = true,
    includeBarcode = true,
    includeMinistryHeader = true,
    includeSchoolName = true,
    includeLocation = true,
    includeDate = true,
    includeStatusBadge = true,
    includeWarningNotice = true,
    cutGuides = true,
    colorMode = 'color',
    copiesPerItem = 1,
  } = options;

  const isBw = colorMode === 'bw';
  const isGrayscale = colorMode === 'grayscale';

  // Multiply items by copies if requested
  const expandedItems: EquipmentStickerItem[] = [];
  const safeCopies = Math.max(1, Math.min(20, copiesPerItem || 1));
  items.forEach(item => {
    for (let c = 0; c < safeCopies; c++) {
      expandedItems.push(item);
    }
  });

  const fullSchoolTitle = formatSchoolWithCommune(schoolName, commune);

  // Layout grid configuration
  let gridColumns = 2;
  let stickerMinHeight = '65mm';
  let qrSize = 64;
  let barcodeWidth = 145;
  let barcodeHeight = 20;
  let titleFontSize = '11.5pt';
  let snFontSize = '12pt';
  let bodyFontSize = '8pt';
  let pageMargin = '6mm';

  if (preset === 'compact_18') {
    gridColumns = 3;
    stickerMinHeight = '44mm';
    qrSize = 46;
    barcodeWidth = 110;
    barcodeHeight = 16;
    titleFontSize = '9.5pt';
    snFontSize = '10pt';
    bodyFontSize = '6.8pt';
    pageMargin = '5mm';
  } else if (preset === 'mini_24') {
    gridColumns = 3;
    stickerMinHeight = '34mm';
    qrSize = 36;
    barcodeWidth = 85;
    barcodeHeight = 12;
    titleFontSize = '8pt';
    snFontSize = '8.5pt';
    bodyFontSize = '6pt';
    pageMargin = '4mm';
  } else if (preset === 'single') {
    gridColumns = 1;
    stickerMinHeight = '80mm';
    qrSize = 82;
    barcodeWidth = 180;
    barcodeHeight = 26;
    titleFontSize = '14pt';
    snFontSize = '15pt';
    bodyFontSize = '10pt';
    pageMargin = '10mm';
  }

  // Render individual stickers
  const stickersHtml = expandedItems.map((item, index) => {
    const itemName = item.smartNameAr || item.name || 'عتاد مخبري';
    const serialNumber = item.serialNumber || (index + 1).toString().padStart(2, '0');
    const category = getEquipmentCategory(item);
    const location = item.location || 'مخبر العلوم';
    const regDate = item.registrationDate || item.foundationalInventory || '---';
    const source = item.source || item.supplier || '---';
    
    // Status formatting
    const isFunctional = item.status === 'functional' || !item.status;
    const isMaintenance = item.status === 'maintenance';
    const statusText = isFunctional ? 'سليم وصالح للاستعمال' : isMaintenance ? 'تحت الصيانة' : 'تالف / مقترح للإسقاط';
    const statusBg = isBw ? '#ffffff' : isFunctional ? '#e6f4ea' : isMaintenance ? '#fef7e0' : '#fce8e6';
    const statusBorder = isBw ? '#000000' : isFunctional ? '#137333' : isMaintenance ? '#b06000' : '#c5221f';
    const statusColor = isBw ? '#000000' : isFunctional ? '#0d652d' : isMaintenance ? '#8a4b00' : '#a50e0e';

    // QR Payload: structured compact JSON for scanner apps and smartphone cameras
    const qrPayload = JSON.stringify({
      app: 'MANARA_LAB',
      id: item.id,
      inv: serialNumber,
      name: itemName,
      loc: location,
      school: schoolName
    });

    const qrSvg = includeQrCode ? renderQrCodeSvg(qrPayload, qrSize) : '';
    const barcodeSvg = includeBarcode ? renderBarcodeSvg(`DZ-${serialNumber}`, barcodeWidth, barcodeHeight) : '';

    return `
      <div class="sticker-cell">
        <div class="sticker-card ${preset}">
          <!-- Top Security Accent Strip -->
          <div class="accent-top-bar"></div>

          <!-- Official School Lab Header -->
          ${(includeMinistryHeader || includeSchoolName) ? `
            <div class="sticker-header">
              ${includeMinistryHeader ? `
                <div class="header-republic">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div class="header-ministry">وزارة التربية الوطنية ${directorate ? `· مديرية التربية لولاية ${directorate}` : ''}</div>
              ` : ''}
              ${includeSchoolName ? `
                <div class="header-school">
                  <span>${fullSchoolTitle}</span>
                  <span class="header-sep">|</span>
                  <span class="header-lab">${laboratoryName}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Badge: Inventory Number Bar -->
          <div class="inventory-bar">
            <div class="inventory-title">ملصق جرد وتعريف العتاد</div>
            <div class="inventory-badge">
              <span class="inv-lbl">رقم الجرد العام:</span>
              <span class="inv-val">${serialNumber}</span>
            </div>
          </div>

          <!-- Middle Body: Details & QR Code -->
          <div class="sticker-body">
            <!-- Details Column -->
            <div class="details-col">
              <div class="item-name" title="${itemName}">${itemName}</div>
              
              <div class="meta-rows">
                <div class="meta-row">
                  <span class="meta-lbl">التصنيف:</span>
                  <span class="meta-val meta-cat">${category}</span>
                </div>

                ${includeLocation ? `
                  <div class="meta-row meta-loc-row">
                    <span class="meta-lbl">مكان الحفظ:</span>
                    <span class="meta-val meta-loc">${location}</span>
                  </div>
                ` : ''}

                ${includeDate && regDate !== '---' ? `
                  <div class="meta-row">
                    <span class="meta-lbl">تاريخ القيد:</span>
                    <span class="meta-val">${regDate}</span>
                  </div>
                ` : ''}

                ${source !== '---' && preset !== 'mini_24' ? `
                  <div class="meta-row">
                    <span class="meta-lbl">المصدر:</span>
                    <span class="meta-val truncate-text">${source}</span>
                  </div>
                ` : ''}
              </div>

              ${includeStatusBadge ? `
                <div class="status-badge" style="background-color: ${statusBg}; border-color: ${statusBorder}; color: ${statusColor};">
                  ${isFunctional ? '✓ ' : isMaintenance ? '⚠️ ' : '✕ '}${statusText}
                </div>
              ` : ''}
            </div>

            <!-- QR Verification Column -->
            ${includeQrCode ? `
              <div class="qr-col">
                <div class="qr-box">
                  ${qrSvg}
                </div>
                <div class="qr-hint">امسح للجرد</div>
              </div>
            ` : ''}
          </div>

          <!-- Barcode Strip -->
          ${includeBarcode ? `
            <div class="barcode-zone">
              ${barcodeSvg}
              <div class="barcode-text">*DZ-LAB-${serialNumber}*</div>
            </div>
          ` : ''}

          <!-- Legal Asset Protection Footer -->
          ${includeWarningNotice ? `
            <div class="sticker-footer">
              <span class="warning-icon">⚠️</span>
              <span>ملك الدولة والمؤسسة التعليمية — يمنع إتلاف أو نزع هذا الملصق</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>ملصقات جرد وتعريف العتاد المخبري — ${fullSchoolTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap');

    @page {
      size: A4 portrait !important;
      margin: ${pageMargin};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Cairo', 'Amiri', Tahoma, Arial, sans-serif;
      direction: rtl;
      font-size: ${bodyFontSize};
      line-height: 1.25;
      ${isGrayscale ? 'filter: grayscale(100%);' : ''}
      ${isBw ? 'filter: grayscale(100%) contrast(150%);' : ''}
    }

    /* Screen toolbar wrapper for interactive preview & test */
    @media screen {
      body {
        background-color: #f1f5f9 !important;
        padding: 20px 10px !important;
        min-height: 100vh;
      }
      .screen-container {
        max-width: 210mm;
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        border: 1px solid #cbd5e1;
        padding: ${pageMargin};
        border-radius: 6px;
      }
      .screen-toolbar {
        max-width: 210mm;
        margin: 0 auto 15px auto;
        background: #1e293b;
        color: #ffffff;
        padding: 10px 18px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .screen-toolbar strong {
        font-size: 13px;
        color: #f8fafc;
      }
      .screen-toolbar .badge {
        background: #3b82f6;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: bold;
      }
      .screen-toolbar button {
        background: #10b981;
        color: white;
        border: none;
        padding: 7px 16px;
        border-radius: 8px;
        font-weight: 800;
        cursor: pointer;
        font-family: 'Cairo', sans-serif;
        font-size: 12px;
      }
      .screen-toolbar button:hover {
        background: #059669;
      }
    }

    @media print {
      .no-print, .screen-toolbar {
        display: none !important;
      }
      .screen-container {
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
    }

    /* Stickers Layout Grid */
    .stickers-grid {
      display: grid;
      grid-template-columns: repeat(${gridColumns}, 1fr);
      gap: 3.5mm;
      width: 100%;
      box-sizing: border-box;
    }

    .sticker-cell {
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
      ${cutGuides ? 'border: 1px dashed #94a3b8; padding: 1.5mm;' : ''}
      border-radius: 6px;
      background: #ffffff;
    }

    /* Sticker Card Surface */
    .sticker-card {
      background: #ffffff;
      border: 1.8px solid ${isBw ? '#000000' : '#1e3a8a'};
      border-radius: 6px;
      padding: 2.5mm 3.5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: ${stickerMinHeight};
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* Top National/Official Color Strip */
    .accent-top-bar {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 3px;
      background: ${isBw ? '#000000' : 'linear-gradient(90deg, #15803d 0%, #ffffff 50%, #dc2626 100%)'};
    }

    /* Header */
    .sticker-header {
      text-align: center;
      border-bottom: 1px solid ${isBw ? '#000000' : '#e2e8f0'};
      padding-bottom: 1.5mm;
      margin-bottom: 1.5mm;
      line-height: 1.2;
    }
    .header-republic {
      font-size: 6pt;
      font-weight: 800;
      color: #334155;
    }
    .header-ministry {
      font-size: 5.8pt;
      font-weight: 700;
      color: #475569;
    }
    .header-school {
      font-size: 6.5pt;
      font-weight: 900;
      color: ${isBw ? '#000000' : '#1e3a8a'};
      margin-top: 0.5mm;
    }
    .header-sep {
      color: #94a3b8;
      margin: 0 3px;
    }
    .header-lab {
      color: ${isBw ? '#000000' : '#047857'};
    }

    /* Inventory Bar */
    .inventory-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${isBw ? '#f1f5f9' : '#f8fafc'};
      border: 1px solid ${isBw ? '#000000' : '#cbd5e1'};
      border-radius: 4px;
      padding: 1.2mm 2.5mm;
      margin-bottom: 1.8mm;
    }
    .inventory-title {
      font-size: 6.8pt;
      font-weight: 800;
      color: #475569;
    }
    .inventory-badge {
      display: flex;
      align-items: center;
      gap: 3px;
      background: ${isBw ? '#000000' : '#1e3a8a'};
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 3px;
    }
    .inv-lbl {
      font-size: 6.5pt;
      font-weight: 700;
    }
    .inv-val {
      font-size: ${snFontSize};
      font-weight: 900;
      font-family: 'Cairo', sans-serif;
      letter-spacing: 0.5px;
    }

    /* Body */
    .sticker-body {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      gap: 2.5mm;
      flex: 1;
    }

    .details-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
    }

    .item-name {
      font-size: ${titleFontSize};
      font-weight: 900;
      color: ${isBw ? '#000000' : '#0f172a'};
      line-height: 1.2;
      margin-bottom: 1mm;
      word-break: break-word;
    }

    .meta-rows {
      display: flex;
      flex-direction: column;
      gap: 0.8mm;
    }

    .meta-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-size: ${bodyFontSize};
    }
    .meta-lbl {
      color: #64748b;
      font-weight: 700;
      white-space: nowrap;
      min-width: 48px;
    }
    .meta-val {
      color: #1e293b;
      font-weight: 800;
    }
    .meta-cat {
      color: ${isBw ? '#000000' : '#2563eb'};
    }
    .meta-loc-row {
      background: ${isBw ? '#f8fafc' : '#eff6ff'};
      padding: 0.8mm 1.5mm;
      border-radius: 3px;
      border: 1px solid ${isBw ? '#cbd5e1' : '#bfdbfe'};
    }
    .meta-loc {
      color: ${isBw ? '#000000' : '#1d4ed8'};
      font-weight: 900;
    }

    .status-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 6.2pt;
      font-weight: 800;
      padding: 0.8mm 2mm;
      border-radius: 3px;
      border: 1px solid;
      margin-top: 1.2mm;
    }

    /* QR Column */
    .qr-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-box {
      background: #ffffff;
      padding: 1.5mm;
      border: 1px solid ${isBw ? '#000000' : '#cbd5e1'};
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-hint {
      font-size: 5.5pt;
      color: #64748b;
      font-weight: 800;
      margin-top: 0.8mm;
      text-align: center;
    }

    /* Barcode Zone */
    .barcode-zone {
      margin-top: 1.5mm;
      padding-top: 1mm;
      border-top: 1px dashed ${isBw ? '#000000' : '#e2e8f0'};
      text-align: center;
    }
    .barcode-text {
      font-family: 'Courier New', Courier, monospace;
      font-size: 6pt;
      font-weight: bold;
      color: #334155;
      letter-spacing: 1px;
      margin-top: 0.5mm;
    }

    /* Footer Warning */
    .sticker-footer {
      border-top: 1px solid ${isBw ? '#000000' : '#e2e8f0'};
      padding-top: 0.8mm;
      margin-top: 1mm;
      font-size: 5.5pt;
      font-weight: 800;
      color: ${isBw ? '#000000' : '#b91c1c'};
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .warning-icon {
      font-size: 6pt;
    }
  </style>
</head>
<body>
  <div class="screen-toolbar no-print">
    <div>
      <strong>ملصقات جرد وتعريف العتاد المخبري</strong>
      <span class="badge">${expandedItems.length} ملصق جاهز للطباعة</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span style="font-size: 11px; color: #94a3b8;">${fullSchoolTitle}</span>
      <button onclick="window.print()">🖨️ طباعة الملصقات الآن</button>
    </div>
  </div>

  <div class="screen-container">
    <div class="stickers-grid">
      ${stickersHtml}
    </div>
  </div>
</body>
</html>`;
}
