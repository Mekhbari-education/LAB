import { PrintService } from './printService';
import { formatSchoolWithCommune } from '../lib/utils';
import { PDFService } from './pdfService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '/ministry-logo.png';

export interface PrintableOrderItem {
  name: string;
  referenceCode?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface PrintablePurchaseOrder {
  orderNumber: string;
  date?: string | Date;
  supplierName?: string;
  supplierContact?: string;
  supplierAddress?: string;
  status?: string;
  items: PrintableOrderItem[];
  subtotal: number;
  total: number;
  notes?: string;
  templateCode?: string;
}

export interface SchoolPrintInfo {
  directorate?: string;
  schoolName?: string;
  commune?: string;
  academicYear?: string;
  laboratoryName?: string;
  customLogoUrl?: string;
}

/**
 * Converts a numeric amount to approximate written Arabic currency text for official documents.
 */
function numberToArabicWords(amount: number): string {
  if (!amount || amount <= 0) return 'صفر دينار جزائري';
  
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  
  // Format with clean thousands separator
  const formatted = new Intl.NumberFormat('ar-DZ').format(Math.round(amount));
  return `${formatted} دينار جزائري فقط لا غير`;
}

export class PurchaseOrderPrintService {
  /**
   * Generates the official HTML for an Algerian Laboratory Purchase Order (سند طلب شراء / تموين المخبر)
   */
  static generateOrderHtml(order: PrintablePurchaseOrder, school: SchoolPrintInfo): string {
    const formattedSchool = formatSchoolWithCommune(school.schoolName, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = school.academicYear || '2025 / 2026';
    const labName = school.laboratoryName || 'مخبر العلوم الفيزيائية والطبيعية';
    
    const formattedDate = order.date 
      ? (typeof order.date === 'string' ? order.date : new Date(order.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }))
      : new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

    const totalInWords = numberToArabicWords(order.total);

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند طلب تموين المخبر - ${order.orderNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Cairo', 'Amiri', 'Traditional Arabic', sans-serif;
      direction: rtl;
      text-align: right;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.4;
    }
    .sheet {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 8px 12px;
    }

    /* Official Ministry Header */
    .official-header {
      border-bottom: 2px solid #2b3d22;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .republic-title {
      font-family: 'Amiri', serif;
      font-size: 12pt;
      font-weight: 700;
      text-align: center;
      margin: 0 0 2px 0;
      color: #1a2e16;
    }
    .ministry-title {
      font-family: 'Amiri', serif;
      font-size: 11pt;
      font-weight: 700;
      text-align: center;
      margin: 0 0 6px 0;
      color: #2b3d22;
    }
    .header-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .header-col-right {
      text-align: right;
      font-size: 9.5pt;
      line-height: 1.5;
    }
    .header-col-center {
      text-align: center;
    }
    .header-logo {
      height: 48px;
      width: auto;
      object-fit: contain;
    }
    .header-col-left {
      text-align: left;
      font-size: 9.5pt;
      line-height: 1.5;
      direction: ltr;
    }

    /* Document Title Banner */
    .banner {
      background: #f4f6f2;
      border: 1.5px solid #2b3d22;
      border-radius: 6px;
      padding: 8px 12px;
      text-align: center;
      margin: 10px 0 12px 0;
    }
    .banner-title {
      font-size: 14pt;
      font-weight: 900;
      color: #2b3d22;
      margin: 0;
    }
    .banner-subtitle {
      font-size: 9pt;
      color: #555;
      margin-top: 2px;
      font-weight: 600;
    }

    /* Meta Cards */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .meta-box {
      border: 1px solid #d2d8ce;
      background: #fafbf9;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 9.5pt;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      font-weight: 700;
      color: #2b3d22;
    }
    .meta-value {
      font-weight: 600;
      color: #111;
    }

    /* Items Table */
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }
    table.items-table th {
      background-color: #2b3d22;
      color: #ffffff;
      border: 1px solid #2b3d22;
      padding: 6px 4px;
      font-weight: 700;
      text-align: center;
    }
    table.items-table td {
      border: 1px solid #c2c9bc;
      padding: 5px 6px;
      vertical-align: middle;
    }
    table.items-table tbody tr:nth-child(even) {
      background-color: #f9faf7;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-mono { font-family: monospace, sans-serif; }
    .font-bold { font-weight: 700; }

    /* Total Section */
    .total-box {
      border: 1.5px solid #2b3d22;
      border-radius: 6px;
      background: #f7f9f5;
      padding: 8px 12px;
      margin-bottom: 14px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11pt;
      font-weight: 800;
      color: #2b3d22;
    }
    .total-in-words {
      font-size: 9pt;
      color: #444;
      margin-top: 4px;
      border-top: 1px dashed #d2d8ce;
      padding-top: 4px;
    }

    /* Notes */
    .notes-box {
      border: 1px solid #e0e5dc;
      background: #fff;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 8.5pt;
      color: #444;
      margin-bottom: 14px;
    }

    /* Official Signatures Grid */
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px dashed #889980;
      border-radius: 6px;
      padding: 8px;
      min-height: 85px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fcfdfb;
    }
    .sig-title {
      font-weight: 800;
      font-size: 9.5pt;
      color: #2b3d22;
      border-bottom: 1px solid #e0e5dc;
      padding-bottom: 3px;
    }
    .sig-space {
      font-size: 8pt;
      color: #888;
      margin: 15px 0 5px 0;
    }

    /* Footer */
    .doc-footer {
      margin-top: 14px;
      padding-top: 6px;
      border-top: 1px solid #d2d8ce;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="official-header">
      <div class="republic-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div class="ministry-title">وزارة التربية الوطنية</div>
      
      <div class="header-grid">
        <div class="header-col-right">
          <div><strong>مديرية التربية لولاية:</strong> ${directorate}</div>
          <div><strong>المؤسسة التعليمية:</strong> ${formattedSchool}</div>
          <div><strong>المصلحة:</strong> ${labName}</div>
        </div>

        <div class="header-col-center">
          <img src="${school.customLogoUrl || logo}" alt="شعار المؤسسة" class="header-logo" />
        </div>

        <div class="header-col-left" dir="rtl">
          <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
          <div><strong>تاريخ السند:</strong> ${formattedDate}</div>
          <div><strong>رمز المرجع:</strong> <span class="font-mono">${order.orderNumber}</span></div>
        </div>
      </div>
    </div>

    <div class="banner">
      <h1 class="banner-title">استمارة وسند طلب تموين المخبر (Bon de Commande)</h1>
      <div class="banner-subtitle">طلب تزويد المخبر بالوسائل، السجلات، والمواد التعليمية اللازمة للأعمال التطبيقية</div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">الممون / المورد المقترح:</span>
          <span class="meta-value">${order.supplierName || 'حسب استشارة المقتصدية / ممون معتمد'}</span>
        </div>
        ${order.supplierContact ? `
        <div class="meta-row">
          <span class="meta-label">مسؤول الاتصال:</span>
          <span class="meta-value">${order.supplierContact}</span>
        </div>
        ` : ''}
        ${order.supplierAddress ? `
        <div class="meta-row">
          <span class="meta-label">العنوان / الهاتف:</span>
          <span class="meta-value">${order.supplierAddress}</span>
        </div>
        ` : ''}
      </div>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">حالة الطلبية:</span>
          <span class="meta-value">${
            order.status === 'received' ? 'مستلمة ومطابقة' :
            order.status === 'sent' ? 'قيد الإنجاز والتوريد' :
            order.status === 'cancelled' ? 'ملغاة' : 'مشروع طلبية (مسودة رسمية)'
          }</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">عدد البنود المطلوبة:</span>
          <span class="meta-value font-mono">${order.items.length} بنود</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">الجهة الطالبة:</strong></span>
          <span class="meta-value">مسؤول مخابر العلوم والتكنولوجيا</span>
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 32px;">الرقم</th>
          <th>تعيين المادة / السجل / العتاد (Désignation)</th>
          <th style="width: 85px;">المرجع / الرمز</th>
          <th style="width: 70px;">الوحدة</th>
          <th style="width: 55px;">الكمية</th>
          <th style="width: 90px;">السعر التقريبي (دج)</th>
          <th style="width: 95px;">المبلغ الإجمالي (دج)</th>
          <th style="width: 110px;">ملاحظات / مواصفات</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item, index) => {
          const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
          return `
          <tr>
            <td class="text-center font-mono font-bold">${index + 1}</td>
            <td class="text-right">
              <div class="font-bold">${item.name}</div>
              ${item.description ? `<div style="font-size: 7.5pt; color: #555;">${item.description}</div>` : ''}
            </td>
            <td class="text-center font-mono" style="font-size: 8pt;">${item.referenceCode || '-'}</td>
            <td class="text-center">${item.unit || 'وحدة'}</td>
            <td class="text-center font-bold font-mono">${item.quantity}</td>
            <td class="text-left font-mono" dir="ltr">${item.unitPrice > 0 ? new Intl.NumberFormat('ar-DZ').format(item.unitPrice) : '-'}</td>
            <td class="text-left font-mono font-bold" dir="ltr">${itemTotal > 0 ? new Intl.NumberFormat('ar-DZ').format(itemTotal) : '-'}</td>
            <td class="text-right" style="font-size: 8pt; color: #555;">نوعية مطابقة للمواصفات التربوية</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>المبلغ الإجمالي التقديري للطلبية:</span>
        <span class="font-mono" dir="ltr">${new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }).format(order.total)}</span>
      </div>
      <div class="total-in-words">
        <strong>وقف هذا السند بمبلغ إجمالي تقديري قدره:</strong> ${totalInWords}
      </div>
    </div>

    ${order.notes ? `
    <div class="notes-box">
      <strong>توجيهات وملاحظات خاصة:</strong> ${order.notes}
    </div>
    ` : ''}

    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-title">مسؤول المخبر (الملحق)</div>
        <div class="sig-space">توقيع وخاتم المسؤول</div>
        <div style="font-size: 7.5pt; color: #666;">حرر بتاريخ: ....................</div>
      </div>

      <div class="sig-box">
        <div class="sig-title">المقتصد / المسير المالي</div>
        <div class="sig-space">تأشيرة وموافقة المقتصدية</div>
        <div style="font-size: 7.5pt; color: #666;">التأشيرة المالية: ..................</div>
      </div>

      <div class="sig-box">
        <div class="sig-title">السيد رئيس المؤسسة (المدير)</div>
        <div class="sig-space">موافقة للأمر بالصرف والختم</div>
        <div style="font-size: 7.5pt; color: #666;">في: .............................</div>
      </div>
    </div>

    <div class="doc-footer">
      <div>الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية</div>
      <div>${formattedSchool} — ${labName}</div>
      <div>صفحة 1 من 1</div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Directly sends the purchase order to print iframe
   */
  static async printOrder(order: PrintablePurchaseOrder, school: SchoolPrintInfo): Promise<void> {
    const html = this.generateOrderHtml(order, school);
    await PrintService.printHtml(html, { title: `سند_طلب_${order.orderNumber}` });
  }

  /**
   * Generates a fully formatted Word Document (.doc) HTML matching the exact same form and details as the PDF
   */
  static generateOrderWordHtml(order: PrintablePurchaseOrder, school: SchoolPrintInfo): string {
    const formattedSchool = formatSchoolWithCommune(school.schoolName, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = school.academicYear || '2025 / 2026';
    const labName = school.laboratoryName || 'مخبر العلوم الفيزيائية والطبيعية';
    
    const formattedDate = order.date 
      ? (typeof order.date === 'string' ? order.date : new Date(order.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }))
      : new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

    const totalInWords = numberToArabicWords(order.total);

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>سند طلب تموين المخبر - ${order.orderNumber}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
            <w:Compatibility>
              <w:UseWord2002TableStyleRules/>
            </w:Compatibility>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 595.35pt 841.95pt; /* A4 */
            margin: 36.0pt 36.0pt 36.0pt 36.0pt;
            mso-header-margin: 25.0pt;
            mso-footer-margin: 25.0pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
            font-size: 11pt;
            color: #1a1a1a;
            line-height: 1.45;
            direction: rtl;
            text-align: right;
            background-color: #ffffff;
          }
          p { margin: 0 0 4pt 0; }
          .republic-title {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            color: #1a2e16;
            margin: 0 0 2pt 0;
          }
          .ministry-title {
            text-align: center;
            font-size: 11.5pt;
            font-weight: bold;
            color: #2b3d22;
            margin: 0 0 8pt 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            border-bottom: 2pt solid #2b3d22;
            margin-bottom: 10pt;
            padding-bottom: 6pt;
          }
          .header-table td {
            border: none;
            vertical-align: top;
            font-size: 10pt;
          }
          .banner-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8pt 0 10pt 0;
            background-color: #f4f6f2;
            border: 1.5pt solid #2b3d22;
          }
          .banner-table td {
            padding: 8pt 12pt;
            text-align: center;
            border: none;
          }
          .banner-title {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            color: #2b3d22;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .banner-sub {
            margin: 3pt 0 0 0;
            font-size: 9pt;
            color: #555555;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: 1pt solid #d2d8ce;
            background-color: #fafbf9;
          }
          .meta-table td {
            padding: 6pt 10pt;
            border: 0.5pt solid #e0e5dc;
            font-size: 9.5pt;
            vertical-align: top;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: 1.5pt solid #2b3d22;
            direction: rtl;
          }
          .items-table th {
            background-color: #2b3d22;
            color: #ffffff;
            border: 1pt solid #2b3d22;
            padding: 6pt 4pt;
            font-size: 9pt;
            font-weight: bold;
            text-align: center;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .items-table td {
            border: 1pt solid #c2c9bc;
            padding: 5pt 6pt;
            font-size: 9pt;
            color: #1a1a1a;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .total-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            background-color: #f7f9f5;
            border: 1.5pt solid #2b3d22;
          }
          .total-table td {
            padding: 8pt 12pt;
            border: none;
          }
          .notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            background-color: #ffffff;
            border: 1pt solid #e0e5dc;
          }
          .notes-table td {
            padding: 6pt 10pt;
            border: none;
            font-size: 9pt;
            color: #444444;
          }
          .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            border: none;
            direction: rtl;
          }
          .signatures-table td {
            width: 33.33%;
            border: 1pt dashed #889980;
            padding: 8pt;
            text-align: center;
            vertical-align: top;
            background-color: #fcfdfb;
          }
          .sig-title {
            font-weight: bold;
            font-size: 9.5pt;
            color: #2b3d22;
            border-bottom: 1pt solid #e0e5dc;
            padding-bottom: 3pt;
            margin-bottom: 8pt;
          }
          .sig-space {
            font-size: 8pt;
            color: #888888;
            height: 45pt;
            padding-top: 14pt;
          }
          .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            border: none;
            border-top: 1pt solid #d2d8ce;
          }
          .footer-table td {
            border: none;
            font-size: 8pt;
            color: #777777;
            padding-top: 5pt;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          <p class="republic-title">الجمهورية الجزائرية الديمقراطية الشعبية</p>
          <p class="ministry-title">وزارة التربية الوطنية</p>

          <table class="header-table" dir="rtl">
            <tr>
              <td style="text-align: right; width: 45%;">
                <div><strong>مديرية التربية لولاية:</strong> ${directorate}</div>
                <div><strong>المؤسسة التعليمية:</strong> ${formattedSchool}</div>
                <div><strong>المصلحة:</strong> ${labName}</div>
              </td>
              <td style="text-align: center; width: 10%;"></td>
              <td style="text-align: left; width: 45%;" dir="rtl">
                <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                <div><strong>تاريخ السند:</strong> ${formattedDate}</div>
                <div><strong>رمز المرجع:</strong> ${order.orderNumber}</div>
              </td>
            </tr>
          </table>

          <table class="banner-table" dir="rtl">
            <tr>
              <td>
                <h1 class="banner-title">استمارة وسند طلب تموين المخبر (Bon de Commande)</h1>
                <p class="banner-sub">طلب تزويد المخبر بالوسائل، السجلات، والمواد التعليمية اللازمة للأعمال التطبيقية</p>
              </td>
            </tr>
          </table>

          <table class="meta-table" dir="rtl">
            <tr>
              <td style="width: 50%;">
                <div><strong>الممون / المورد المقترح:</strong> ${order.supplierName || 'حسب استشارة المقتصدية / ممون معتمد'}</div>
                ${order.supplierContact ? `<div><strong>مسؤول الاتصال:</strong> ${order.supplierContact}</div>` : ''}
                ${order.supplierAddress ? `<div><strong>العنوان / الهاتف:</strong> ${order.supplierAddress}</div>` : ''}
              </td>
              <td style="width: 50%;">
                <div><strong>حالة الطلبية:</strong> ${
                  order.status === 'received' ? 'مستلمة ومطابقة' :
                  order.status === 'sent' ? 'قيد الإنجاز والتوريد' :
                  order.status === 'cancelled' ? 'ملغاة' : 'مشروع طلبية (مسودة رسمية)'
                }</div>
                <div><strong>عدد البنود المطلوبة:</strong> ${order.items.length} بنود</div>
                <div><strong>الجهة الطالبة:</strong> مسؤول مخابر العلوم والتكنولوجيا</div>
              </td>
            </tr>
          </table>

          <table class="items-table" dir="rtl">
            <thead>
              <tr>
                <th style="width: 25pt;">الرقم</th>
                <th>تعيين المادة / السجل / العتاد (Désignation)</th>
                <th style="width: 65pt;">المرجع / الرمز</th>
                <th style="width: 50pt;">الوحدة</th>
                <th style="width: 40pt;">الكمية</th>
                <th style="width: 65pt;">السعر التقريبي (دج)</th>
                <th style="width: 70pt;">المبلغ الإجمالي (دج)</th>
                <th style="width: 80pt;">ملاحظات / مواصفات</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => {
                const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                return `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9faf7'};">
                    <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                    <td style="text-align: right;">
                      <strong>${item.name}</strong>
                      ${item.description ? `<div style="font-size: 8pt; color: #555;">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.referenceCode || '-'}</td>
                    <td style="text-align: center;">${item.unit || 'وحدة'}</td>
                    <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                    <td style="text-align: left;" dir="ltr">${item.unitPrice > 0 ? new Intl.NumberFormat('ar-DZ').format(item.unitPrice) : '-'}</td>
                    <td style="text-align: left; font-weight: bold;" dir="ltr">${itemTotal > 0 ? new Intl.NumberFormat('ar-DZ').format(itemTotal) : '-'}</td>
                    <td style="text-align: right; font-size: 8pt; color: #555;">مطابق للمواصفات التربوية</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <table class="total-table" dir="rtl">
            <tr>
              <td>
                <div style="font-size: 11pt; font-weight: bold; color: #2b3d22;">
                  المبلغ الإجمالي التقديري للطلبية: <span dir="ltr">${new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }).format(order.total)}</span>
                </div>
                <div style="font-size: 9pt; color: #444; margin-top: 4pt; border-top: 1pt dashed #d2d8ce; padding-top: 4pt;">
                  <strong>وقف هذا السند بمبلغ إجمالي تقديري قدره:</strong> ${totalInWords}
                </div>
              </td>
            </tr>
          </table>

          ${order.notes ? `
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>توجيهات وملاحظات خاصة:</strong> ${order.notes}</td>
              </tr>
            </table>
          ` : ''}

          <table class="signatures-table" dir="rtl">
            <tr>
              <td>
                <div class="sig-title">مسؤول المخبر (الملحق)</div>
                <div class="sig-space">توقيع وخاتم المسؤول</div>
                <div style="font-size: 7.5pt; color: #666;">حرر بتاريخ: ....................</div>
              </td>
              <td>
                <div class="sig-title">المقتصد / المسير المالي</div>
                <div class="sig-space">تأشيرة وموافقة المقتصدية</div>
                <div style="font-size: 7.5pt; color: #666;">التأشيرة المالية: ..................</div>
              </td>
              <td>
                <div class="sig-title">السيد رئيس المؤسسة (المدير)</div>
                <div class="sig-space">موافقة للأمر بالصرف والختم</div>
                <div style="font-size: 7.5pt; color: #666;">في: .............................</div>
              </td>
            </tr>
          </table>

          <table class="footer-table" dir="rtl">
            <tr>
              <td style="text-align: right;">الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية</td>
              <td style="text-align: center;">${formattedSchool} — ${labName}</td>
              <td style="text-align: left;">صفحة 1 من 1</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Directly triggers download of purchase order as Microsoft Word (.doc)
   */
  static downloadOrderWord(order: PrintablePurchaseOrder, school: SchoolPrintInfo): void {
    const html = this.generateOrderWordHtml(order, school);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFilename = `سند_طلب_${order.orderNumber}`.replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeFilename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generates a genuine, high-quality PDF of the purchase order matching Algerian Ministry standards
   */
  static async generateOrderPDF(order: PrintablePurchaseOrder, school: SchoolPrintInfo, save = false): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await PDFService.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const processArabic = (text: any) => PDFService.processArabic(text);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 12;

    const formattedSchool = formatSchoolWithCommune(school.schoolName, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = school.academicYear || '2025 / 2026';
    const labName = school.laboratoryName || 'مخبر العلوم الفيزيائية والطبيعية';
    const formattedDate = order.date 
      ? (typeof order.date === 'string' ? order.date : new Date(order.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }))
      : new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalInWords = numberToArabicWords(order.total);

    // 1. Official Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 46, 22);
    doc.text(processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(43, 61, 34);
    doc.text(processArabic('وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    // Right info: Directorate, School, Lab
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 40);
    doc.text(processArabic(`مديرية التربية: ${directorate}`), pageWidth - margin, currentY + 3, { align: 'right' });
    doc.text(processArabic(`المؤسسة: ${formattedSchool}`), pageWidth - margin, currentY + 7.5, { align: 'right' });
    doc.text(processArabic(`المصلحة: ${labName}`), pageWidth - margin, currentY + 12, { align: 'right' });

    // Left info: Academic Year, Date, Order Ref
    doc.text(processArabic(`السنة الدراسية: ${academicYear}`), margin, currentY + 3, { align: 'left' });
    doc.text(processArabic(`تاريخ السند: ${formattedDate}`), margin, currentY + 7.5, { align: 'left' });
    doc.text(processArabic(`رمز المرجع: ${order.orderNumber}`), margin, currentY + 12, { align: 'left' });

    currentY += 16;
    // Divider line
    doc.setDrawColor(43, 61, 34);
    doc.setLineWidth(0.6);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // 2. Banner
    doc.setFillColor(244, 246, 242);
    doc.setDrawColor(43, 61, 34);
    doc.roundedRect(margin, currentY, contentWidth, 13, 2, 2, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(43, 61, 34);
    doc.text(processArabic('استمارة وسند طلب تموين المخبر (Bon de Commande)'), pageWidth / 2, currentY + 6, { align: 'center' });

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(85, 95, 80);
    doc.text(processArabic('طلب تزويد المخبر بالوسائل، السجلات، والمواد التعليمية اللازمة للأعمال التطبيقية'), pageWidth / 2, currentY + 10.5, { align: 'center' });

    currentY += 16;

    // 3. Meta Grid (Supplier & Status)
    const boxWidth = (contentWidth - 4) / 2;
    // Right box: Supplier info
    doc.setFillColor(250, 251, 249);
    doc.setDrawColor(210, 216, 206);
    doc.roundedRect(pageWidth - margin - boxWidth, currentY, boxWidth, 16, 2, 2, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(43, 61, 34);
    doc.text(processArabic('الممون / المورد المقترح:'), pageWidth - margin - 3, currentY + 4.5, { align: 'right' });
    doc.setFont(fontName, 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(processArabic(order.supplierName || 'حسب استشارة المقتصدية / ممون معتمد'), pageWidth - margin - 3, currentY + 9, { align: 'right' });
    if (order.supplierContact || order.supplierAddress) {
      const contactInfo = [order.supplierContact, order.supplierAddress].filter(Boolean).join(' - ');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(processArabic(contactInfo), pageWidth - margin - 3, currentY + 13.5, { align: 'right' });
    }

    // Left box: Status & Item count
    const statusText = order.status === 'received' ? 'مستلمة ومطابقة' :
      order.status === 'sent' ? 'قيد الإنجاز والتوريد' :
      order.status === 'cancelled' ? 'ملغاة' : 'مشروع طلبية (مسودة رسمية)';

    doc.roundedRect(margin, currentY, boxWidth, 16, 2, 2, 'FD');
    doc.setFont(fontName, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(43, 61, 34);
    doc.text(processArabic(`حالة الطلبية: ${statusText}`), margin + boxWidth - 3, currentY + 4.5, { align: 'right' });
    doc.setFont(fontName, 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(processArabic(`عدد البنود المطلوبة: ${order.items.length} بنود`), margin + boxWidth - 3, currentY + 9, { align: 'right' });
    doc.text(processArabic('الجهة الطالبة: مسؤول مخابر العلوم والتكنولوجيا'), margin + boxWidth - 3, currentY + 13.5, { align: 'right' });

    currentY += 19;

    // 4. Items Table (autoTable)
    const headers = [
      'ملاحظات / مواصفات',
      'المبلغ الإجمالي (دج)',
      'السعر التقريبي',
      'الكمية',
      'الوحدة',
      'المرجع / الرمز',
      'تعيين المادة / السجل / العتاد',
      'الرقم'
    ];

    const rows = order.items.map((item, index) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return [
        processArabic('مطابق للمواصفات التربوية'),
        processArabic(itemTotal > 0 ? new Intl.NumberFormat('ar-DZ').format(itemTotal) : '-'),
        processArabic(item.unitPrice > 0 ? new Intl.NumberFormat('ar-DZ').format(item.unitPrice) : '-'),
        processArabic(String(item.quantity)),
        processArabic(item.unit || 'وحدة'),
        processArabic(item.referenceCode || '-'),
        processArabic(item.name + (item.description ? ` (${item.description})` : '')),
        processArabic(String(index + 1))
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: currentY,
      margin: { left: margin, right: margin, bottom: 25 },
      styles: {
        font: fontName,
        fontStyle: 'normal',
        halign: 'right',
        fontSize: 8,
        cellPadding: 2.2,
        textColor: [20, 20, 20],
        lineColor: [194, 201, 188],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [43, 61, 34],
        textColor: [255, 255, 255],
        font: fontName,
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 247]
      }
    });

    currentY = (doc as any).lastAutoTable?.finalY + 4 || currentY + 30;

    // 5. Total Box
    if (currentY + 28 > pageHeight - 35) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(247, 249, 245);
    doc.setDrawColor(43, 61, 34);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(43, 61, 34);
    const totalFormatted = new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }).format(order.total);
    doc.text(processArabic(`المبلغ الإجمالي التقديري للطلبية: ${totalFormatted}`), pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(processArabic(`وقف هذا السند بمبلغ إجمالي تقديري قدره: ${totalInWords}`), pageWidth - margin - 4, currentY + 10.5, { align: 'right' });

    currentY += 17;

    // 6. Notes if available
    if (order.notes) {
      if (currentY + 16 > pageHeight - 35) {
        doc.addPage();
        currentY = 16;
      }
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(224, 229, 220);
      doc.roundedRect(margin, currentY, contentWidth, 11, 2, 2, 'FD');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(43, 61, 34);
      doc.text(processArabic('توجيهات وملاحظات خاصة:'), pageWidth - margin - 3, currentY + 4.5, { align: 'right' });
      doc.setFont(fontName, 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(processArabic(order.notes), pageWidth - margin - 3, currentY + 8.5, { align: 'right' });

      currentY += 14;
    }

    // 7. Signatures (3 boxes)
    if (currentY + 28 > pageHeight - 20) {
      doc.addPage();
      currentY = 16;
    }

    const sigWidth = (contentWidth - 6) / 3;
    const sigTitles = [
      { title: 'مسؤول المخبر (الملحق)', note: 'توقيع وخاتم المسؤول' },
      { title: 'المقتصد / المسير المالي', note: 'تأشيرة وموافقة المقتصدية' },
      { title: 'السيد رئيس المؤسسة (المدير)', note: 'موافقة للأمر بالصرف والختم' }
    ];

    sigTitles.forEach((sig, i) => {
      const x = pageWidth - margin - (i + 1) * sigWidth - i * 3;
      doc.setFillColor(252, 253, 251);
      doc.setDrawColor(136, 153, 128);
      doc.roundedRect(x, currentY, sigWidth, 22, 2, 2, 'FD');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(43, 61, 34);
      doc.text(processArabic(sig.title), x + sigWidth / 2, currentY + 5, { align: 'center' });

      doc.setFont(fontName, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(136, 136, 136);
      doc.text(processArabic(sig.note), x + sigWidth / 2, currentY + 12, { align: 'center' });
      doc.text(processArabic('التاريخ: ....................'), x + sigWidth / 2, currentY + 18, { align: 'center' });
    });

    // 8. Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(119, 119, 119);

      const footerY = pageHeight - 6;
      doc.setDrawColor(210, 216, 206);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

      doc.text(processArabic('الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية'), pageWidth - margin, footerY, { align: 'right' });
      doc.text(processArabic(`${formattedSchool} — ${labName}`), pageWidth / 2, footerY, { align: 'center' });
      doc.text(processArabic(`صفحة ${i} من ${totalPages}`), margin, footerY, { align: 'left' });
    }

    if (save) {
      const safeName = `سند_طلب_${order.orderNumber}`.replace(/[/\\?%*:|"<>]/g, '_');
      doc.save(`${safeName}.pdf`);
    }

    return doc.output('blob');
  }

  /**
   * Directly triggers download of purchase order as PDF
   */
  static async downloadOrderPDF(order: PrintablePurchaseOrder, school: SchoolPrintInfo): Promise<void> {
    await this.generateOrderPDF(order, school, true);
  }
}
