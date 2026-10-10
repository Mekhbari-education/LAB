import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import { PrintService } from './printService';

export interface InventoryItemForPrint {
  id: string;
  serialNumber: string;
  name: string;
  foundationalInventory: string;
  decennialReview: string;
  totalQuantity: number;
  supplier: string;
  price?: string;
  location?: string;
  exitDate?: string;
  status: string;
  notes: string;
}

export type PaperFormat = 'A4' | 'A5' | 'A4_DUAL';
export type PrintSides = 'both' | 'front' | 'back';
export type PrintScope = 'single' | 'all' | 'table';

export interface InventoryCardPrintOptions {
  items: InventoryItemForPrint[];
  paperFormat: PaperFormat;
  printSides: PrintSides;
  printScope: PrintScope;
  directorate: string;
  schoolName: string;
  commune: string;
  includeOfficialHeader?: boolean;
  includeQrCode?: boolean;
  includeStampBox?: boolean;
}

function getItemCategory(name: string): string {
  if (name.includes('مجهر')) return 'أجهزة بصرية';
  if (name.includes('أنبوب') || name.includes('بيشر') || name.includes('حوجلة') || name.includes('مخبار')) return 'زجاجيات مخبرية';
  if (name.includes('مولد') || name.includes('ميزان') || name.includes('فولطمتر') || name.includes('أمبيرمتر')) return 'أجهزة قياس وكهرباء';
  if (name.includes('مجسم') || name.includes('هيكل') || name.includes('لوحة')) return 'وسائل إيضاح ومجسمات';
  return 'عتاد وأجهزة علمية تعليمية';
}

function renderQrCodeSvg(value: string, size = 26): string {
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
    return `<div style="font-size: 6pt; font-weight: bold; border: 1px solid #000; padding: 2px;">QR</div>`;
  }
}

/**
 * Generates standalone, pristine HTML for official Algerian Inventory Cards.
 * Completely free of scrollbars, responsive overflow glitches, and parent constraints.
 */
export function generateInventoryCardsHtml(options: InventoryCardPrintOptions): string {
  const {
    items,
    paperFormat,
    printSides,
    printScope,
    directorate,
    schoolName,
    commune,
    includeOfficialHeader = true,
    includeQrCode = true,
    includeStampBox = true,
  } = options;

  const isTableScope = printScope === 'table';
  const isA5 = paperFormat === 'A5' && !isTableScope;
  const isDual = paperFormat === 'A4_DUAL' && !isTableScope;

  const pageOrientation = isTableScope ? 'landscape' : 'portrait';
  const pagePaper = isA5 ? 'A5' : 'A4';
  const pageMargin = isA5 ? '4mm' : isTableScope ? '8mm' : '6mm';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بطاقات الجرد الرسمية — ${schoolName}</title>
  <style>
    @page {
      size: ${pagePaper} ${pageOrientation};
      margin: ${pageMargin};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      overflow: visible !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      direction: rtl !important;
      font-family: 'Cairo', 'Amiri', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: ${isA5 ? '7pt' : '8pt'};
      line-height: 1.25;
      overflow: visible !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    /* Card Page Container */
    .card-page {
      width: 100%;
      background: #ffffff;
      border: ${isA5 ? '1.5px' : '2px'} solid #000000;
      padding: ${isA5 ? '3.5mm 4.5mm' : '5.5mm 6.5mm'};
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: ${isA5 ? '198mm' : '278mm'};
      max-height: ${isA5 ? '201mm' : '281mm'};
      margin: 0 auto;
    }

    /* Dual Cards Wrapper (2 cards per A4 page) */
    .dual-page-wrapper {
      width: 100%;
      height: 280mm;
      max-height: 282mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
      margin: 0 auto;
    }

    .dual-card {
      width: 100%;
      background: #ffffff;
      border: 1.5px solid #000000;
      padding: 3mm 4mm;
      box-sizing: border-box;
      height: 135mm;
      max-height: 136mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 6.8pt;
      line-height: 1.2;
    }

    .dual-cut-line {
      text-align: center;
      font-size: 7.5pt;
      color: #555555;
      border-top: 1px dashed #666666;
      margin: 2mm 0;
      padding-top: 1mm;
      font-weight: bold;
    }

    .card-page:last-child,
    .dual-page-wrapper:last-child,
    .registry-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Header Components */
    .official-header {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
    }

    .header-columns {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: ${isA5 ? '6.5pt' : '7.5pt'};
      font-weight: bold;
      line-height: 1.25;
    }

    .header-right {
      text-align: right;
    }

    .header-center {
      text-align: center;
    }

    .header-left {
      text-align: left;
    }

    .rep-title {
      font-size: ${isA5 ? '7.5pt' : '8.5pt'};
      font-weight: 900;
    }

    .min-title {
      font-size: ${isA5 ? '7pt' : '8pt'};
      font-weight: 700;
    }

    .year-title {
      font-size: ${isA5 ? '6.5pt' : '7pt'};
      color: #333333;
    }

    .sn-box {
      font-size: ${isA5 ? '9pt' : '10pt'};
      font-weight: 900;
      text-decoration: underline;
      font-family: monospace;
    }

    /* Card Title Badge */
    .title-banner {
      text-align: center;
      margin: 3px 0;
    }

    .title-pill {
      display: inline-block;
      border: 2px solid #000000;
      background: #f3f4f6;
      padding: ${isA5 ? '1px 16px' : '2px 24px'};
      border-radius: 2px;
    }

    .title-pill h1 {
      margin: 0;
      font-size: ${isA5 ? '10pt' : '11.5pt'};
      font-weight: 900;
      letter-spacing: 0.5px;
      text-decoration: underline;
      text-decoration-style: double;
    }

    /* Review Dates Bar */
    .review-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #000000;
      background: #fafafa;
      padding: 2px 8px;
      font-size: ${isA5 ? '6.5pt' : '7.5pt'};
      font-weight: bold;
      margin-bottom: 4px;
    }

    .review-val {
      font-weight: 900;
      text-decoration: underline;
    }

    /* 4-Box Technical Header Grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border: 2px solid #000000;
      text-align: center;
      font-size: ${isA5 ? '6.5pt' : '7.5pt'};
      margin-bottom: 4px;
      background: #ffffff;
    }

    .tech-col {
      padding: 2px;
      border-left: 1px solid #000000;
    }

    .tech-col:last-child {
      border-left: none;
    }

    .tech-col-sn {
      background: #fffbeb;
    }

    .tech-col-hdr {
      font-weight: bold;
      color: #374151;
      border-bottom: 1px solid #000000;
      padding-bottom: 1px;
      margin-bottom: 2px;
    }

    .tech-col-body {
      height: ${isA5 ? '20px' : '26px'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .sn-large {
      font-size: ${isA5 ? '9pt' : '10.5pt'};
      letter-spacing: 1px;
      font-family: monospace;
    }

    /* Identification Details Box */
    .details-box {
      border: 1.5px solid #000000;
      padding: ${isA5 ? '4px 6px' : '6px 8px'};
      margin-bottom: 5px;
      background: #ffffff;
      font-size: ${isA5 ? '7pt' : '8pt'};
    }

    .detail-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 3px;
    }

    .detail-lbl {
      font-weight: 900;
      white-space: nowrap;
    }

    .detail-val {
      border-bottom: 1px dotted #333333;
      flex: 1;
      padding-bottom: 1px;
    }

    .detail-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 1px;
    }

    /* Movements Section & Table */
    .table-section {
      margin-bottom: 4px;
    }

    .section-title {
      font-weight: 900;
      font-size: ${isA5 ? '6.8pt' : '7.8pt'};
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-sub {
      font-size: 6pt;
      font-weight: normal;
      color: #4b5563;
    }

    .official-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      text-align: center;
      font-size: ${isA5 ? '6.5pt' : '7.5pt'};
    }

    .official-table th {
      background: #f3f4f6 !important;
      border: 1px solid #000000;
      font-weight: 900;
      padding: 3px 2px;
      color: #000000;
    }

    .official-table td {
      border: 1px solid #000000;
      padding: 2.5px 2px;
    }

    .data-row td {
      font-weight: 600;
    }

    .empty-row td {
      height: ${isA5 ? '16px' : '20px'};
    }

    /* Stamps & Signatures Grid */
    .stamps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${isA5 ? '8px' : '14px'};
      border-top: 1.5px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
      text-align: center;
      font-size: ${isA5 ? '6.5pt' : '7.5pt'};
      font-weight: bold;
    }

    .stamp-box {
      border: 1px solid #9ca3af;
      background: #f9fafb;
      padding: 3px;
      border-radius: 2px;
    }

    .stamp-space {
      height: ${isA5 ? '26px' : '36px'};
    }

    /* Back Side Elements */
    .back-hdr-banner {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${isA5 ? '6.8pt' : '7.8pt'};
      font-weight: bold;
    }

    .back-title {
      font-weight: 900;
      font-size: ${isA5 ? '8.5pt' : '9.5pt'};
      text-decoration: underline;
    }

    .back-sec-title {
      background: #f3f4f6;
      border: 1px solid #000000;
      padding: 2px 6px;
      font-weight: 900;
      font-size: ${isA5 ? '6.8pt' : '7.8pt'};
      margin-bottom: 2px;
    }

    .back-footer-notice {
      font-size: 6.5pt;
      color: #374151;
      font-style: italic;
      border-top: 1px solid #000000;
      padding-top: 2px;
      margin-top: 4px;
      text-align: center;
    }

    /* Full Registry Table Sheet (A4 Landscape) */
    .registry-sheet {
      width: 100%;
      background: #ffffff;
      padding: 0;
      box-sizing: border-box;
      font-size: 7.5pt;
    }

    .registry-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000000;
      text-align: center;
      font-size: 7.5pt;
      margin-top: 6px;
    }

    .registry-table th {
      background: #f3f4f6 !important;
      border: 1px solid #000000;
      font-weight: 900;
      padding: 4px 2px;
      color: #000000;
    }

    .registry-table td {
      border: 1px solid #000000;
      padding: 3.5px 2px;
    }

    .registry-stamps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
      text-align: center;
      font-size: 8pt;
      font-weight: bold;
    }
  </style>
</head>
<body class="${isA5 ? 'format-a5' : isDual ? 'format-dual' : 'format-a4'}">
  ${isTableScope ? renderRegistrySummaryTable(items, options) : renderCardsCollection(items, options)}
</body>
</html>`;
}

function renderRegistrySummaryTable(items: InventoryItemForPrint[], options: InventoryCardPrintOptions): string {
  const { directorate, schoolName, commune } = options;
  const currentDate = new Date().toLocaleDateString('ar-DZ');

  return `
    <div class="registry-sheet">
      <div class="official-header">
        <div class="header-columns">
          <div class="header-right">
            مديرية التربية لولاية: ${directorate}<br>
            المؤسسة: ${schoolName} (${commune})<br>
            مخبر الوسائل التعليمية والعلوم
          </div>
          <div class="header-center">
            <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
            <div class="min-title">وزارة التربية الوطنية</div>
            <div class="year-title">السنة الدراسية: 2025 / 2026</div>
          </div>
          <div class="header-left">
            سجل بطاقات الجرد العام<br>
            تاريخ الطباعة: ${currentDate}<br>
            مجموع التجهيزات: ${items.length}
          </div>
        </div>
      </div>

      <div class="title-banner" style="margin: 8px 0 10px 0;">
        <div class="title-pill">
          <h1>ســجــل بـطــاقـــات الجـــرد الـعــام للـوســائـل والـتـجـهـيـزات الـتـعـلـيـمـيـة</h1>
        </div>
      </div>

      <table class="registry-table">
        <thead>
          <tr>
            <th style="width: 4%;">الرقم</th>
            <th style="width: 12%;">رقم التسجيل</th>
            <th style="width: 12%;">تاريخ التكفل بالتسجيل</th>
            <th style="width: 20%;">تعيين الشيء (العتاد)</th>
            <th style="width: 13%;">مصدره (الممون)</th>
            <th style="width: 10%;">قيمته (دج)</th>
            <th style="width: 12%;">التعيين / الموقع</th>
            <th style="width: 8%;">خروجه</th>
            <th style="width: 9%;">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => `
            <tr>
              <td style="font-weight: bold; text-align: center;">${idx + 1}</td>
              <td style="font-weight: 800; text-align: center; font-family: monospace;">${it.serialNumber}</td>
              <td style="text-align: center;">${it.foundationalInventory || '—'}</td>
              <td style="font-weight: 700; text-align: right; padding-right: 6px;">${it.name}</td>
              <td>${it.supplier || '—'}</td>
              <td style="text-align: center; font-weight: 700;">${it.price ? `${it.price} دج` : '—'}</td>
              <td>${it.location || 'مخبر الوسائل'}</td>
              <td style="text-align: center;">${it.exitDate || '—'}</td>
              <td style="font-size: 6.8pt; color: #374151;">${it.notes || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="registry-stamps">
        <div class="stamp-box">
          <div>المقتصد / مسير المصالح الاقتصادية:</div>
          <div style="height: 48px;"></div>
        </div>
        <div class="stamp-box">
          <div>مسؤول المخبر الرئيسي:</div>
          <div style="height: 48px;"></div>
        </div>
        <div class="stamp-box">
          <div>رئيس المؤسسة (المدير):</div>
          <div style="height: 48px;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderCardsCollection(items: InventoryItemForPrint[], options: InventoryCardPrintOptions): string {
  const { paperFormat, printSides } = options;

  if (paperFormat === 'A4_DUAL') {
    // Group items into pairs of 2 for A4 Dual
    const pairs: InventoryItemForPrint[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      pairs.push(items.slice(i, i + 2));
    }

    return pairs.map(pair => `
      <div class="dual-page-wrapper">
        <div class="dual-card">
          ${renderSingleCardFront(pair[0], options, true)}
        </div>
        <div class="dual-cut-line">✂ خط القطع والفصل المعتمد للبطاقات (A5) ✂</div>
        ${pair[1] ? `
          <div class="dual-card">
            ${renderSingleCardFront(pair[1], options, true)}
          </div>
        ` : `
          <div class="dual-card" style="border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #888;">
            بطاقة فارغة (نهاية القائمة)
          </div>
        `}
      </div>
    `).join('');
  }

  // Standard A4 or A5 pages
  return items.map(item => `
    ${(printSides === 'both' || printSides === 'front') ? `
      <div class="card-page">
        ${renderSingleCardFront(item, options, false)}
      </div>
    ` : ''}
    ${(printSides === 'both' || printSides === 'back') ? `
      <div class="card-page">
        ${renderSingleCardBack(item, options)}
      </div>
    ` : ''}
  `).join('');
}

function renderSingleCardFront(
  item: InventoryItemForPrint,
  options: InventoryCardPrintOptions,
  isDual = false
): string {
  const {
    directorate,
    schoolName,
    commune,
    includeOfficialHeader = true,
    includeQrCode = true,
    includeStampBox = true,
    paperFormat,
  } = options;

  const isA5 = paperFormat === 'A5';
  const qrSvg = includeQrCode ? renderQrCodeSvg(`DZ-EDU-INV:${item.serialNumber}:${item.name}`, isA5 ? 24 : 26) : '';
  const category = getItemCategory(item.name);
  const totalAmount = item.price && !isNaN(Number(item.price))
    ? `${(Number(item.price) * item.totalQuantity).toLocaleString('ar-DZ')} دج`
    : '—';

  const emptyRowsCount = isDual ? 1 : isA5 ? 2 : 3;

  return `
    <div>
      ${includeOfficialHeader ? `
        <div class="official-header">
          <div class="header-columns">
            <div class="header-right">
              مديرية التربية لولاية: ${directorate}<br>
              ${schoolName} (${commune})<br>
              مخبر الوسائل التعليمية
            </div>
            <div class="header-center">
              <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div class="min-title">وزارة التربية الوطنية</div>
              <div class="year-title">السنة الدراسية: 2025 / 2026</div>
            </div>
            <div class="header-left">
              بطاقة الجرد رقم:<br>
              <span class="sn-box">${item.serialNumber}</span>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="title-banner">
        <div class="title-pill">
          <h1>بـطــاقـــة الجـــرد</h1>
        </div>
      </div>

      <div class="review-bar">
        <div>
          <span>الجرد التأسيسي لسنة : </span>
          <span class="review-val">${item.foundationalInventory || '2015-10-15'}</span>
        </div>
        <div>
          <span>المراجعة العشرية لسنة : </span>
          <span class="review-val">${item.decennialReview || '2025-10-15'}</span>
        </div>
      </div>

      <div class="tech-grid">
        <div class="tech-col">
          <div class="tech-col-hdr">الفهرس (الصنف)</div>
          <div class="tech-col-body">${category}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">الفرع / الجناح</div>
          <div class="tech-col-body">مخبر العلوم والوسائل</div>
        </div>
        <div class="tech-col tech-col-sn">
          <div class="tech-col-hdr">رقم الجرد العام</div>
          <div class="tech-col-body sn-large">${item.serialNumber}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">ختم المؤسسة والتأشيرة</div>
          <div class="tech-col-body">
            ${includeQrCode ? qrSvg : '<span style="font-size: 6pt; color: #888;">مربع الختم</span>'}
          </div>
        </div>
      </div>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-lbl">الـتـعـيـيـن (تعيين الشيء) :</span>
          <span class="detail-val" style="font-weight: 900;">${item.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">الـخـصـائـص والمـواصـفـات :</span>
          <span class="detail-val">${item.notes || 'جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة.'}</span>
        </div>
        <div class="detail-grid-2">
          <div class="detail-row">
            <span class="detail-lbl">الموقع / الحفظ :</span>
            <span class="detail-val">${item.location || 'مخبر الوسائل التعليمية - الخزانة الرئيسية'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-lbl">الممون / المصدر :</span>
            <span class="detail-val">${item.supplier || 'المؤسسة الوطنية للوسائل التعليمية'}</span>
          </div>
        </div>
      </div>

      <div class="table-section">
        <div class="section-title">
          <span>جدول حركات الدخول والتكفل بالعتاد:</span>
          <span class="section-sub">(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)</span>
        </div>
        <table class="official-table">
          <thead>
            <tr>
              <th style="width: 18%;">تاريخ الدخول</th>
              <th style="width: 10%;">الكمية</th>
              <th style="width: 15%;">سعر الوحدة</th>
              <th style="width: 18%;">المبلغ الإجمالي</th>
              <th style="width: 21%;">الممون</th>
              <th style="width: 18%;">التعيين الجديد</th>
            </tr>
          </thead>
          <tbody>
            <tr class="data-row">
              <td>${item.foundationalInventory || '2023-09-15'}</td>
              <td style="font-weight: 900;">${item.totalQuantity}</td>
              <td>${item.price ? `${item.price} دج` : '—'}</td>
              <td style="font-weight: 900;">${totalAmount}</td>
              <td>${item.supplier || '—'}</td>
              <td style="font-size: 6.8pt;">مخبر الوسائل</td>
            </tr>
            ${Array.from({ length: emptyRowsCount }).map(() => `
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${includeStampBox ? `
      <div class="stamps-grid">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:</div>
          <div class="stamp-space"></div>
        </div>
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة (المدير):</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    ` : ''}
  `;
}

function renderSingleCardBack(item: InventoryItemForPrint, options: InventoryCardPrintOptions): string {
  const { includeStampBox = true, paperFormat } = options;
  const isA5 = paperFormat === 'A5';

  return `
    <div>
      <div class="back-hdr-banner">
        <div>التكفل المستمر وحركات التعيين والإتلاف</div>
        <div class="back-title">بطاقة جرد رقم: ${item.serialNumber} — ${item.name}</div>
        <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
      </div>

      <!-- Section 1 -->
      <div class="table-section">
        <div class="back-sec-title">1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th style="width: 16%;">التاريخ</th>
              <th>اسم ولقب الموظف المسؤول</th>
              <th style="width: 20%;">الصفة / الوظيفة</th>
              <th style="width: 18%;">الإمضاء</th>
              <th style="width: 18%;">تأشيرة المقتصد</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: isA5 ? 3 : 4 }).map(() => `
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 2 -->
      <div class="table-section">
        <div class="back-sec-title">2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 16%;">تاريخ القرار</th>
              <th rowspan="2" style="width: 9%;">الكمية</th>
              <th rowspan="2" style="width: 18%;">رقم الجرد</th>
              <th rowspan="2">التعيين الجديد</th>
              <th colspan="2" style="width: 25%;">الإمضاء والتأشيرة</th>
            </tr>
            <tr>
              <th style="width: 12.5%;">المقتصد</th>
              <th style="width: 12.5%;">العون</th>
            </tr>
          </thead>
          <tbody>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>

      <!-- Section 3 -->
      <div class="table-section">
        <div class="back-sec-title">3. الإسـقـاط والإتـلاف والخـروج (Sorties / Réformes)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 16%;">تاريخ القرار</th>
              <th rowspan="2" style="width: 9%;">الكمية</th>
              <th rowspan="2" style="width: 22%;">سبب الخروج</th>
              <th rowspan="2">محضر الإسقاط</th>
              <th colspan="2" style="width: 25%;">الإمضاء والتأشيرة</th>
            </tr>
            <tr>
              <th style="width: 12.5%;">المقتصد</th>
              <th style="width: 12.5%;">المدير</th>
            </tr>
          </thead>
          <tbody>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    ${includeStampBox ? `
      <div class="stamps-grid">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد:</div>
          <div class="stamp-space"></div>
        </div>
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة:</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    ` : ''}

    <div class="back-footer-notice">
      هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر.
    </div>
  `;
}

/**
 * Triggers clean, robust printing using PrintService's offscreen isolated iframe.
 * Absolutely eliminates browser scrollbars, modal interference, and clipped pages.
 */
export async function printInventoryCards(options: InventoryCardPrintOptions): Promise<void> {
  const html = generateInventoryCardsHtml(options);
  const title = options.printScope === 'table'
    ? 'سجل بطاقات الجرد العام'
    : options.items.length === 1
      ? `بطاقة جرد رقم ${options.items[0].serialNumber} - ${options.items[0].name}`
      : `بطاقات الجرد (${options.items.length} تجهيز)`;

  await PrintService.printHtml(html, { title });
}
