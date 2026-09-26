import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatSchoolWithCommune } from '../lib/utils';

/**
 * Sanitizes and normalizes text values for PDF rendering.
 * jsPDF contains built-in Arabic letter shaping and BiDi reordering.
 * Passing plain text directly prevents double-reversing words and characters.
 */
export function processArabic(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  return String(text);
}

export interface SchoolInfo {
  country?: string;
  ministry?: string;
  directorate?: string;
  school?: string;
  commune?: string;
  laboratory?: string;
  academicYear?: string;
  date?: string;
  managerName?: string;
}

export interface SummaryCard {
  label: string;
  value: string | number;
}

export interface LabReportPDFOptions {
  title: string;
  subtitle?: string;
  schoolInfo?: SchoolInfo;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  fileName?: string;
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  summaryCards?: SummaryCard[];
  showSignatures?: boolean;
  notes?: string;
  save?: boolean;
  paperSize?: 'a4' | 'a3' | 'letter';
  margins?: number;
  colorMode?: 'color' | 'grayscale' | 'blackAndWhite';
  disclaimer?: string;
  labManagerTitle?: string;
  principalTitle?: string;
}

/**
 * Reusable, unified PDF Service with full Arabic RTL support for Algerian school laboratories.
 */
export class PDFService {
  private static fontBase64: string | null = null;
  private static isFontLoading: Promise<string | null> | null = null;

  /**
   * Loads and registers the Arabic TrueType font into jsPDF VFS.
   */
  static async init(doc: jsPDF): Promise<boolean> {
    if (!this.fontBase64) {
      if (!this.isFontLoading) {
        this.isFontLoading = (async () => {
          try {
            const response = await fetch('/ManaraDocs_Amatti.ttf');
            if (!response.ok) {
              throw new Error(`Failed to fetch Arabic font: HTTP ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
            }
            this.fontBase64 = window.btoa(binary);
            return this.fontBase64;
          } catch (error) {
            console.error('Error loading Arabic font for PDF:', error);
            return null;
          } finally {
            this.isFontLoading = null;
          }
        })();
      }
      await this.isFontLoading;
    }

    if (this.fontBase64) {
      doc.addFileToVFS('ManaraDocs.ttf', this.fontBase64);
      // Register across all standard styles so autoTable never throws missing font label warnings
      doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'normal');
      doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'bold');
      doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'italic');
      doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'bolditalic');
      doc.setFont('ManaraDocs', 'normal');
      return true;
    }

    return false;
  }

  /**
   * Helper to process Arabic text using the service.
   */
  static processArabic(text: string | number | null | undefined): string {
    return processArabic(text);
  }

  /**
   * Unified export function for all laboratory reports, inventories, logs, and forms.
   */
  static async exportLabReportPDF(options: LabReportPDFOptions): Promise<jsPDF> {
    const {
      title,
      subtitle,
      schoolInfo = {},
      headers,
      rows,
      fileName,
      orientation = 'p',
      summaryCards = [],
      showSignatures = true,
      notes,
      save = true,
      paperSize = 'a4',
      margins = 14,
      colorMode = 'color',
      disclaimer,
      labManagerTitle = 'المسؤول عن المخبر',
      principalTitle = 'مدير(ة) المؤسسة'
    } = options;

    const isLandscape = orientation === 'l' || orientation === 'landscape';
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: paperSize,
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = margins;
    const contentWidth = pageWidth - margin * 2;

    const isGrayscale = colorMode === 'grayscale';
    const isBw = colorMode === 'blackAndWhite';
    const brandColor: [number, number, number] = isBw ? [0, 0, 0] : isGrayscale ? [50, 50, 50] : [43, 61, 34];
    const bannerBg: [number, number, number] = isBw ? [255, 255, 255] : isGrayscale ? [220, 220, 220] : [43, 61, 34];
    const bannerText: [number, number, number] = isBw ? [0, 0, 0] : isGrayscale ? [0, 0, 0] : [255, 255, 255];

    // Default Algerian School Info
    const country = schoolInfo.country || 'الجمهورية الجزائرية الديمقراطية الشعبية';
    const ministry = schoolInfo.ministry || 'وزارة التربية الوطنية';
    const directorate = schoolInfo.directorate || 'مديرية التربية لولاية الجزائر';
    const school = schoolInfo.school || 'مؤسسة التعليم الثانوي والتقني';
    const laboratory = schoolInfo.laboratory || 'مخبر العلوم والتكنولوجيا';
    const academicYear = schoolInfo.academicYear || `${new Date().getFullYear() - 1}/${new Date().getFullYear()}`;
    const dateStr = schoolInfo.date || new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

    let currentY = 12;

    // --- Official Header (Algerian Institution Standard) ---
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 40, 25);
    doc.text(processArabic(country), pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 70, 50);
    doc.text(processArabic(ministry), pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    // Header Left and Right Columns
    const headerRightX = pageWidth - margin;
    const headerLeftX = margin;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    // Right-hand side (Directorate, School, Lab)
    doc.text(processArabic(`مديرية التربية: ${directorate}`), headerRightX, currentY + 3, { align: 'right' });
    const formattedSchool = formatSchoolWithCommune(school, schoolInfo.commune);
    doc.text(processArabic(formattedSchool), headerRightX, currentY + 8, { align: 'right' });
    doc.text(processArabic(`المخبر: ${laboratory}`), headerRightX, currentY + 13, { align: 'right' });

    // Left-hand side (Academic year, Date)
    doc.text(processArabic(`السنة الدراسية: ${academicYear}`), headerLeftX, currentY + 3, { align: 'left' });
    doc.text(processArabic(`التاريخ: ${dateStr}`), headerLeftX, currentY + 8, { align: 'left' });

    currentY += 19;

    // Header Divider Line
    doc.setDrawColor(200, 210, 195);
    doc.setLineWidth(0.6);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // --- Document Title Banner ---
    const bannerHeight = subtitle ? 16 : 12;
    doc.setFillColor(bannerBg[0], bannerBg[1], bannerBg[2]); // Dynamic color based on color mode
    doc.roundedRect(margin, currentY, contentWidth, bannerHeight, 3, 3, 'F');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(bannerText[0], bannerText[1], bannerText[2]);
    doc.text(processArabic(title), pageWidth / 2, currentY + (subtitle ? 7 : 8), { align: 'center' });

    if (subtitle) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(isBw ? 50 : 230, isBw ? 50 : 240, isBw ? 50 : 220);
      doc.text(processArabic(subtitle), pageWidth / 2, currentY + 12.5, { align: 'center' });
    }

    currentY += bannerHeight + 5;

    // --- Summary Cards (Key Metrics) if provided ---
    if (summaryCards && summaryCards.length > 0) {
      const cardGap = 4;
      const totalGaps = (summaryCards.length - 1) * cardGap;
      const cardWidth = (contentWidth - totalGaps) / summaryCards.length;
      const cardHeight = 12;

      summaryCards.forEach((card, idx) => {
        const cardX = margin + idx * (cardWidth + cardGap);
        doc.setFillColor(245, 248, 242);
        doc.setDrawColor(215, 225, 205);
        doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 115, 95);
        doc.text(processArabic(card.label), cardX + cardWidth / 2, currentY + 4.5, { align: 'center' });

        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text(processArabic(String(card.value)), cardX + cardWidth / 2, currentY + 9.5, { align: 'center' });
      });

      currentY += cardHeight + 5;
    }

    // --- Prepare Table Data (RTL Ordering & Arabic Processing) ---
    // In RTL tables, column 0 on the page is the leftmost column, so we reverse headers and rows
    // so that the first Arabic header (# or item name) appears at the right edge.
    const rtlHeaders = [...headers].reverse().map(h => processArabic(h));
    const rtlRows = rows.map(row => [...row].reverse().map(cell => processArabic(cell)));

    autoTable(doc, {
      head: [rtlHeaders],
      body: rtlRows,
      startY: currentY,
      margin: { left: margin, right: margin, bottom: 25 },
      styles: {
        font: fontName,
        fontStyle: 'normal',
        halign: 'right',
        fontSize: 9,
        cellPadding: 3,
        textColor: [40, 45, 35],
        lineColor: [225, 230, 215],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: bannerBg,
        textColor: bannerText,
        font: fontName,
        fontStyle: 'bold',
        fontSize: 9.5,
        halign: 'right'
      },
      alternateRowStyles: {
        fillColor: isBw ? [255, 255, 255] : isGrayscale ? [245, 245, 245] : [252, 250, 246]
      }
    });

    let finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;

    // --- Notes block if provided ---
    if (notes) {
      if (finalY + 25 > pageHeight - 35) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 6;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text(processArabic('ملاحظات وإرشادات:'), pageWidth - margin, finalY, { align: 'right' });

      doc.setFont(fontName, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(processArabic(notes), pageWidth - margin, finalY + 4.5, { align: 'right' });
      finalY += 12;
    }

    // --- Official Signatures Block ---
    if (showSignatures) {
      if (finalY + 30 > pageHeight - 20) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 8;
      }

      const boxWidth = 55;
      const boxHeight = 22;

      // Right box: المسؤول عن المخبر
      const rightBoxX = pageWidth - margin - boxWidth;
      doc.setDrawColor(210, 215, 205);
      doc.setFillColor(254, 254, 253);
      doc.roundedRect(rightBoxX, finalY, boxWidth, boxHeight, 2, 2, 'D');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text(processArabic(labManagerTitle), rightBoxX + boxWidth / 2, finalY + 5, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(processArabic('(الاسم، التوقيع والختم)'), rightBoxX + boxWidth / 2, finalY + 9, { align: 'center' });

      // Left box: مدير المؤسسة
      const leftBoxX = margin;
      doc.roundedRect(leftBoxX, finalY, boxWidth, boxHeight, 2, 2, 'D');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text(processArabic(principalTitle), leftBoxX + boxWidth / 2, finalY + 5, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(processArabic('(التوقيع وتأشيرة المصادقة)'), leftBoxX + boxWidth / 2, finalY + 9, { align: 'center' });
    }

    // --- Footer on all pages (Page numbers & platform badge) ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont(fontName, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 125);

      const footerY = pageHeight - 8;
      // Top thin line for footer
      doc.setDrawColor(230, 235, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

      // Right side: Platform title or custom disclaimer
      doc.text(processArabic(disclaimer || 'الأرضية الرقمية لتسيير المخابر المدرسية'), pageWidth - margin, footerY, { align: 'right' });

      // Center: Document reference/date
      doc.text(processArabic(dateStr), pageWidth / 2, footerY, { align: 'center' });

      // Left side: Page X of Y
      doc.text(processArabic(`صفحة ${i} من ${totalPages}`), margin, footerY, { align: 'left' });
    }

    if (save) {
      const sanitizedName = fileName
        ? fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
        : `report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(sanitizedName);
    }

    return doc;
  }

  /**
   * Prints the generated PDF directly using a clean, off-screen iframe without browser popups.
   */
  static async printLabReportPDF(options: LabReportPDFOptions): Promise<void> {
    const doc = await this.exportLabReportPDF({ ...options, save: false });
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe PDF print warning:', e);
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }, 500);
    };
  }

  /**
   * Backward-compatible helper method matching earlier signature across the app.
   */
  static async generateTablePDF(
    title: string,
    headers: string[],
    rows: any[][],
    fileName: string,
    extraOptions?: Partial<LabReportPDFOptions>
  ): Promise<jsPDF> {
    return this.exportLabReportPDF({
      title,
      headers,
      rows,
      fileName,
      ...extraOptions
    });
  }

  /**
   * Dedicated generator for Incident Safety Reports (محضر حادث مخبري).
   */
  static async generateIncidentPDF(incident: any, schoolInfo?: SchoolInfo): Promise<jsPDF> {
    const fields = [
      ['رقم الحادث', incident.id || '---'],
      ['التاريخ والتوقيت', incident.date || new Date().toISOString().split('T')[0]],
      ['نوع الحادث', incident.type || 'حادث مخبري'],
      ['المكان والمخبر', incident.location || 'المخبر الرئيسي'],
      ['درجة الخطورة', incident.severity === 'high' ? 'مرتفعة (خطير)' : incident.severity === 'medium' ? 'متوسطة' : 'منخفضة (بسيط)'],
      ['المُبلّغ / الأستاذ', incident.reporter || 'مسؤول المخبر'],
      ['المصابون', incident.injured || 'لا توجد إصابات بشرية مسجلة'],
      ['الإسعافات الأولية المقدمة', incident.firstAid || 'تم اتخاذ الإجراءات الوقائية'],
      ['الشهود الحاضرون', incident.witnesses || 'أفواج التلاميذ'],
      ['وصف وتفاصيل الحادث', incident.description || 'لا يوجد وصف مفصل']
    ];

    if (incident.analysis) {
      if (incident.analysis.rootCause) {
        fields.push(['السبب الجذري المحتمل (تحليل ذكي)', incident.analysis.rootCause]);
      }
      if (incident.analysis.longTermMitigation) {
        fields.push(['التدابير الوقائية المقترحة', incident.analysis.longTermMitigation]);
      }
      if (incident.analysis.safetyTipsAr) {
        fields.push(['إرشادات السلامة للأفواج', incident.analysis.safetyTipsAr]);
      }
    }

    return this.exportLabReportPDF({
      title: 'محضر إثبات وتفاصيل حادث مخبري',
      subtitle: `تقرير رسمي صادر عن إدارة المخبر - المرجع: ${incident.id || ''}`,
      schoolInfo,
      headers: ['البيان / الإجراء', 'معلومات وتفاصيل الحادث'],
      rows: fields,
      fileName: `incident_${incident.id || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      showSignatures: true,
      notes: 'يُحفظ هذا التقرير في سجل الأمن والسلامة المخبرية وتُرسل نسخة منه إلى إدارة المؤسسة.'
    });
  }

  /**
   * Dedicated generator for Daily Lab Activity Reports (التقرير اليومي للمخبر).
   */
  static async generateDailyReportPDF(data: {
    date: string;
    schoolInfo?: SchoolInfo;
    rows: Array<{
      teacher: string;
      teacherSubject?: string;
      class: string;
      time: string;
      activityTitle: string;
      equipment: string;
      notes?: string;
    }>;
  }): Promise<jsPDF> {
    const headers = ['#', 'الأستاذ والمادة', 'التوقيت', 'القسم', 'عنوان النشاط البيداغوجي', 'الأدوات والمواد المستعملة', 'ملاحظات'];
    const formattedRows = data.rows.map((r, index) => [
      index + 1,
      r.teacherSubject ? `${r.teacher} (${r.teacherSubject})` : r.teacher,
      r.time,
      r.class,
      r.activityTitle,
      r.equipment,
      r.notes || '---'
    ]);

    return this.exportLabReportPDF({
      title: 'التقرير اليومي لأنشطة المخبر والتجارب العلمية',
      subtitle: `سجل الحصص المخبرية المنجزة ليوم: ${data.date}`,
      schoolInfo: data.schoolInfo,
      headers,
      rows: formattedRows,
      fileName: `daily_report_${data.date}.pdf`,
      orientation: 'l', // Landscape layout for wide daily report table
      summaryCards: [
        { label: 'إجمالي الحصص المسجلة', value: data.rows.length },
        { label: 'تاريخ النشاط', value: data.date }
      ],
      showSignatures: true
    });
  }
}

/**
 * Standalone unified export function ready to import directly.
 */
export const exportLabReportPDF = (options: LabReportPDFOptions) => PDFService.exportLabReportPDF(options);
