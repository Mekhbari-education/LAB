import { GlasswareItem } from '../lib/api/glassware';
import { findGlasswareCatalogMatch, GlasswareCatalogTemplate } from '../data/glasswareCatalog';
import { formatSchoolWithCommune } from '../lib/utils';

export interface GlasswareStockCardSchoolInfo {
  schoolName: string;
  directorate: string;
  commune?: string;
  academicYear?: string;
}

export function buildGlasswareStockCardsHtml(
  items: Partial<GlasswareItem>[],
  schoolInfo: GlasswareStockCardSchoolInfo,
  options?: {
    includeCatalogImage?: boolean;
    customTemplateMap?: Record<string, GlasswareCatalogTemplate>;
  }
): string {
  const today = new Date().toLocaleDateString('en-GB');
  const schoolLine = formatSchoolWithCommune(
    schoolInfo.schoolName || 'المؤسسة التربوية',
    schoolInfo.commune || ''
  );
  const directorate = schoolInfo.directorate || 'مديرية التربية';
  const academicYear = schoolInfo.academicYear || '2025 / 2026';

  const cardsHtml = items
    .map((item, index) => {
      const matched =
        (item.id && options?.customTemplateMap?.[item.id]) ||
        findGlasswareCatalogMatch(item.nameAr, item.designationFr, item.type);

      const statusLabel = item.status || 'جيدة';
      const statusBadgeClass =
        statusLabel === 'جيدة'
          ? 'status-good'
          : statusLabel === 'تحتاج إصلاح'
          ? 'status-warn'
          : 'status-danger';

      const qty = Number(item.quantity ?? matched.suggestedQuantity ?? 0);
      const unit = item.unit || matched.defaultUnit || 'قطعة';
      const location = item.location || matched.defaultLocation || 'خزانة الزجاجيات';
      const safetyNote =
        item.notes && item.notes.trim().length > 0
          ? item.notes
          : `${matched.careAndSafety} (${matched.thermalResistance})`;

      return `
        <div class="pcard">
          <div class="ph-container">
            <div class="ph">
              <div class="ph-r">
                <div>مديرية التربية لولاية: ${directorate}</div>
                <div>${schoolLine}</div>
                <div>مخبر العلوم والوسائل التعليمية</div>
              </div>
              <div class="ph-c">
                <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div>وزارة التربية الوطنية</div>
                <div class="doc-sub">بطاقة متابعة مخزون الزجاجيات</div>
              </div>
              <div class="ph-l">
                <div>السنة الدراسية: ${academicYear}</div>
                <div class="header-stamp">ختم المؤسسة</div>
              </div>
            </div>
          </div>

          <div class="pcard-badge">بطاقة مخزون رقم: ${index + 1}</div>
          <h1 class="pcard-title">بطاقة مخزون زجاجيات مخبرية</h1>

          <div class="ic-top-row">
            <div class="ic-meta-expressive">
              <div class="ic-field main">
                <span class="l">التسمية بالعربية</span>
                <span class="v">${item.nameAr || matched.nameAr}</span>
              </div>
              <div class="ic-field sub">
                <span class="l">DÉSIGNATION</span>
                <span class="v fr">${item.designationFr || matched.designationFr}</span>
              </div>
            </div>
            ${
              options?.includeCatalogImage !== false && matched.image
                ? `<div class="ic-thumb"><img src="${matched.image}" alt="${item.nameAr || matched.nameAr}" /></div>`
                : ''
            }
          </div>

          <div class="ic-grid-info">
            <div class="ic-info-box">
              <span class="l">الصنف / الفئة</span>
              <span class="v">${item.type || matched.type}</span>
            </div>
            <div class="ic-info-box">
              <span class="l">مادة الصنع</span>
              <span class="v">${matched.material.includes('Pyrex') ? 'Pyrex 3.3' : matched.material}</span>
            </div>
            <div class="ic-info-box">
              <span class="l">مكان الحفظ</span>
              <span class="v">${location}</span>
            </div>
            <div class="ic-info-box ${statusBadgeClass}">
              <span class="l">الحالة الحالية</span>
              <span class="v">${statusLabel}</span>
            </div>
          </div>

          <div class="ic-safety-strip">
            <span class="sep">|</span>
            <b>وحدة القياس:</b> ${unit}
            <span class="sep">|</span>
            <b>المواصفات:</b> ${matched.precisionClass}
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="13%">التاريخ</th>
                  <th colspan="2">سند الطلب</th>
                  <th rowspan="2" width="18%">المصدر / التعيين</th>
                  <th rowspan="2" width="10%">الثمن</th>
                  <th colspan="3">الكمية</th>
                  <th rowspan="2">ملاحظات / الكسور</th>
                </tr>
                <tr>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>المخزون</th>
                </tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td>${today}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>رصيد أول المدة</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${qty}</td>
                  <td class="bold">${qty}</td>
                  <td>رصيد مخزني ابتدائي</td>
                </tr>
                ${Array(12)
                  .fill('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
                  .join('')}
                <tr class="carry-over">
                  <td colspan="5">الرصيد المنقول لظهر البطاقة</td>
                  <td></td>
                  <td></td>
                  <td class="bold">..........</td>
                  <td>ينقل ←</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pcard back">
          <div class="back-header">
            <span>تتمة حركة مخزون الزجاجيات — ${item.nameAr || matched.nameAr}</span>
            <span class="ref">REF STOCK: G-${index + 1}</span>
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="13%">التاريخ</th>
                  <th colspan="2">سند الطلب</th>
                  <th rowspan="2" width="18%">المصدر / الاستعمال</th>
                  <th rowspan="2" width="10%">الثمن</th>
                  <th colspan="3">الكمية</th>
                  <th rowspan="2">ملاحظات / محضر كسر</th>
                </tr>
                <tr>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>المخزون</th>
                </tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td colspan="5">المجموع المنقول من وجه البطاقة</td>
                  <td></td>
                  <td></td>
                  <td>..........</td>
                  <td>نقل ←</td>
                </tr>
                ${Array(19)
                  .fill('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="ic-safety-rules">
            <h3>إرشادات العناية والحفظ والوقاية من الكسر</h3>
            <div class="rules-box">
              <div><b>الاستعمال البيداغوجي:</b> ${matched.primaryUses}</div>
              <div style="margin-top: 4px"><b>شروط الحفظ والسلامة:</b> ${safetyNote}</div>
            </div>
            <div class="signatures-strip">
              <div>توقيع مسؤول المخبر: ..........................</div>
              <div>تأشيرة المقتصد / المدير: ..........................</div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>بطاقات مخزون الزجاجيات المخبرية</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <style>
          :root {
            --primary: #2b3d22;
            --primary-container: #415437;
            --primary-soft: #eef3ea;
            --secondary: #5c6146;
            --outline: #d2d8ce;
            --good-bg: #ecfdf5;
            --good-text: #065f46;
            --warn-bg: #fffbeb;
            --warn-text: #92400e;
            --danger-bg: #fef2f2;
            --danger-text: #991b1b;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', 'Amiri', sans-serif;
            direction: rtl;
            background: transparent;
            color: #1e2819;
            padding: 0;
          }

          .pcard {
            background: #ffffff;
            width: 148mm;
            height: 210mm;
            margin: 0 auto 14px auto;
            padding: 6.5mm;
            border-radius: 6px;
            box-shadow: 0 6px 18px rgba(43, 61, 34, 0.12);
            display: flex;
            flex-direction: column;
            border: 1.5px solid #2b3d22;
            position: relative;
            overflow: hidden;
          }

          .pcard.back { border-style: dashed; margin-bottom: 18px; }

          .ph-container {
            background: #f5f8f2;
            margin: -6.5mm -6.5mm 3mm -6.5mm;
            padding: 4.5mm 6.5mm 3.5mm 6.5mm;
            border-bottom: 2px solid #2b3d22;
          }
          .ph {
            display: grid;
            grid-template-columns: 1.1fr 1.4fr 0.9fr;
            font-size: 7pt;
            gap: 6px;
            align-items: start;
            color: #3c4632;
          }
          .ph-r { text-align: right; line-height: 1.45; font-weight: 700; }
          .ph-c { text-align: center; font-weight: 800; line-height: 1.45; color: #1e2819; }
          .ph-c .doc-sub { font-size: 6.5pt; color: #2b3d22; margin-top: 2px; font-weight: 800; }
          .ph-l { text-align: left; line-height: 1.45; font-weight: 700; }

          .header-stamp {
            margin-top: 4px;
            width: 30mm;
            height: 13mm;
            border: 1px dashed #828c7d;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6pt;
            color: #5c6146;
            margin-right: auto;
            background: rgba(255, 255, 255, 0.7);
          }

          .pcard-badge {
            position: absolute;
            top: 25mm;
            left: 6.5mm;
            background: #eef3ea;
            color: #2b3d22;
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 800;
            border: 1px solid #b7cda8;
          }

          .pcard-title {
            text-align: center;
            font-size: 13pt;
            font-weight: 900;
            color: #2b3d22;
            margin: 2mm 0 3mm 0;
          }

          .ic-top-row {
            display: flex;
            gap: 8px;
            align-items: stretch;
            margin-bottom: 3mm;
          }
          .ic-meta-expressive {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ic-field {
            border-radius: 6px;
            padding: 5px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .ic-field.main {
            background: #f5f8f2;
            border-right: 3px solid #2b3d22;
            border-top: 1px solid #d7e1cd;
            border-bottom: 1px solid #d7e1cd;
            border-left: 1px solid #d7e1cd;
          }
          .ic-field.sub {
            background: #fafbf9;
            border-right: 3px solid #5c6146;
            border-top: 1px solid #e1e6d7;
            border-bottom: 1px solid #e1e6d7;
            border-left: 1px solid #e1e6d7;
          }
          .ic-field .l { font-weight: 700; color: #5c6146; font-size: 7.5pt; white-space: nowrap; }
          .ic-field .v { font-weight: 800; font-size: 9.5pt; text-align: left; color: #1e2819; }
          .ic-field .v.fr { font-family: sans-serif; font-size: 8pt; direction: ltr; color: #3c4632; }

          .ic-thumb {
            width: 22mm;
            height: 18mm;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #d2d8ce;
            background: #f5f8f2;
            flex-shrink: 0;
          }
          .ic-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .ic-grid-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-bottom: 3mm;
          }
          .ic-info-box {
            background: #ffffff;
            border: 1px solid #d2d8ce;
            border-radius: 6px;
            padding: 4px 5px;
            text-align: center;
          }
          .ic-info-box .l {
            display: block;
            font-size: 6.5pt;
            font-weight: 700;
            color: #5c6146;
            margin-bottom: 1px;
          }
          .ic-info-box .v {
            font-weight: 800;
            font-size: 8pt;
            display: block;
            line-height: 1.25;
            color: #1e2819;
          }
          .ic-info-box.status-good { background: var(--good-bg); color: var(--good-text); border-color: #a7f3d0; }
          .ic-info-box.status-good .v { color: var(--good-text); }
          .ic-info-box.status-warn { background: var(--warn-bg); color: var(--warn-text); border-color: #fde68a; }
          .ic-info-box.status-warn .v { color: var(--warn-text); }
          .ic-info-box.status-danger { background: var(--danger-bg); color: var(--danger-text); border-color: #fecaca; }
          .ic-info-box.status-danger .v { color: var(--danger-text); }

          .ic-safety-strip {
            background: #2b3d22;
            color: #ffffff;
            border-radius: 5px;
            padding: 4.5px 10px;
            font-size: 7.2pt;
            margin-bottom: 3mm;
            line-height: 1.4;
          }
          .ic-safety-strip .sep { margin: 0 6px; opacity: 0.5; }

          .ic-table-container { flex: 1; margin-bottom: 2mm; }
          .ic-tbl { width: 100%; border-collapse: collapse; font-size: 7.2pt; table-layout: fixed; }
          .ic-tbl th, .ic-tbl td { border: 0.6pt solid #94a38f; padding: 3px; text-align: center; }
          .ic-tbl th { background: #eef3ea !important; color: #2b3d22 !important; font-weight: 800; font-size: 6.8pt; }
          .ic-tbl td { height: 5.3mm; background: #ffffff; color: #1e2819; }
          tr.initial-stock td { background: #f5f8f2 !important; font-weight: 700; }
          tr.carry-over td { background: #fafbf9 !important; font-weight: 700; }
          .bold { font-weight: 900; }

          .back-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2b3d22;
            padding-bottom: 4px;
            margin-bottom: 4mm;
            font-weight: 900;
            font-size: 10pt;
            color: #2b3d22;
          }
          .back-header .ref { font-size: 8pt; font-family: monospace; color: #5c6146; }

          .ic-safety-rules h3 {
            font-size: 8.5pt;
            font-weight: 900;
            color: #2b3d22;
            margin-bottom: 4px;
          }
          .rules-box {
            background: #f5f8f2;
            border: 1px solid #d2d8ce;
            padding: 7px 10px;
            border-radius: 6px;
            font-size: 7.5pt;
            color: #2b3d22;
            line-height: 1.55;
          }
          .signatures-strip {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
            font-size: 7.5pt;
            font-weight: 700;
            color: #2b3d22;
          }

          @media print {
            body { background: white !important; padding: 0 !important; }
            @page { size: A5 portrait; margin: 3mm; }
            .pcard {
              width: 100% !important;
              height: calc(210mm - 6mm) !important;
              margin: 0 !important;
              border: 1.5px solid #2b3d22 !important;
              border-radius: 6px !important;
              box-shadow: none !important;
              page-break-after: always !important;
              padding: 6.5mm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pcard.back { border-style: dashed !important; }
            .pcard:last-child { page-break-after: avoid !important; }
            .ph-container { margin: -6.5mm -6.5mm 3mm -6.5mm; padding: 4.5mm 6.5mm 3.5mm 6.5mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ic-tbl th { background: #eef3ea !important; color: #2b3d22 !important; border: 0.6pt solid #94a38f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ic-tbl td { border: 0.6pt solid #94a38f !important; }
            .ic-safety-strip, .ic-field, .ic-info-box, .rules-box, .pcard-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div id="body">
          ${cardsHtml}
        </div>
      </body>
    </html>
  `;
}
