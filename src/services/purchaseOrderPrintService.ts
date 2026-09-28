import { PrintService } from './printService';
import { formatSchoolWithCommune } from '../lib/utils';
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
}
