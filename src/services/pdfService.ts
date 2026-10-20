import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatSchoolWithCommune, formatOfficialRankTitle, getNextWorkingDay } from '../lib/utils';

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
  showFooter?: boolean;
  labManagerTitle?: string;
  middleTitle?: string;
  principalTitle?: string;
  releaseLocation?: string;
  releaseDate?: string;
}

export function resolveAcademicYear(passed?: string, secondary?: string): string {
  if (passed && passed.trim()) return passed.trim();
  if (secondary && secondary.trim()) return secondary.trim();
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('algeria_lab_academic_year');
    if (stored && stored.trim()) return stored.trim();
  }
  return '2025/2026';
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
      showFooter = true,
      labManagerTitle = 'المسؤول عن المخبر',
      middleTitle,
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
    const academicYear = resolveAcademicYear(schoolInfo.academicYear);
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

    // Right-hand side (Directorate, School)
    doc.text(processArabic(`مديرية التربية: ${directorate}`), headerRightX, currentY + 3, { align: 'right' });
    const formattedSchool = formatSchoolWithCommune(school, schoolInfo.commune);
    doc.text(processArabic(formattedSchool), headerRightX, currentY + 8, { align: 'right' });

    // Left-hand side: Academic Year above Laboratory
    doc.text(processArabic(`السنة الدراسية: ${academicYear}`), headerLeftX, currentY + 3, { align: 'left' });
    doc.text(processArabic(`المخبر: ${laboratory || 'مخبر العلوم الفيزيائية والطبيعية'}`), headerLeftX, currentY + 8, { align: 'left' });

    currentY += 15;

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
      const cardsPerRow = summaryCards.length > 4 ? 4 : summaryCards.length;
      const cardGap = 3.5;
      const cardHeight = 11;
      const totalRows = Math.ceil(summaryCards.length / cardsPerRow);

      for (let r = 0; r < totalRows; r++) {
        const rowCards = summaryCards.slice(r * cardsPerRow, (r + 1) * cardsPerRow);
        const actualWidth = (contentWidth - (rowCards.length - 1) * cardGap) / rowCards.length;

        rowCards.forEach((card, idx) => {
          const cardX = margin + idx * (actualWidth + cardGap);
          doc.setFillColor(245, 248, 242);
          doc.setDrawColor(215, 225, 205);
          doc.roundedRect(cardX, currentY, actualWidth, cardHeight, 2, 2, 'FD');

          doc.setFont(fontName, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 115, 95);
          doc.text(processArabic(card.label), cardX + actualWidth / 2, currentY + 3.8, { align: 'center' });

          doc.setFont(fontName, 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
          doc.text(processArabic(String(card.value)), cardX + actualWidth / 2, currentY + 8.2, { align: 'center' });
        });

        currentY += cardHeight + 2.5;
      }

      currentY += 2;
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
      if (finalY + 36 > pageHeight - 20) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 6;
      }

      if (options.releaseLocation || options.releaseDate || options.schoolInfo?.commune) {
        const releaseLoc = options.releaseLocation || options.schoolInfo?.commune || 'عين كرشة';
        const releaseD = options.releaseDate || options.schoolInfo?.date || new Date().toISOString().split('T')[0];
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text(processArabic(`حرر بـ : ${releaseLoc} في : ${releaseD}`), pageWidth - margin, finalY, { align: 'right' });
        finalY += 5;
      }

      const boxWidth = middleTitle ? 52 : 55;
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
      const rightSubText = labManagerTitle.includes('أستاذ') ? '(الاسم والتوقيع)' : '(الاسم، التوقيع والختم)';
      doc.text(processArabic(rightSubText), rightBoxX + boxWidth / 2, finalY + 9, { align: 'center' });

      // Middle box: الناظر (if provided)
      if (middleTitle) {
        const middleBoxX = (pageWidth - boxWidth) / 2;
        doc.roundedRect(middleBoxX, finalY, boxWidth, boxHeight, 2, 2, 'D');
        doc.setFont(fontName, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text(processArabic(middleTitle), middleBoxX + boxWidth / 2, finalY + 5, { align: 'center' });
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(130, 130, 130);
        doc.text(processArabic('(التوقيع والختم)'), middleBoxX + boxWidth / 2, finalY + 9, { align: 'center' });
      }

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
      doc.text(processArabic('(التوقيع والختم)'), leftBoxX + boxWidth / 2, finalY + 9, { align: 'center' });
    }

    // --- Footer on all pages (Page numbers & platform badge) ---
    if (showFooter) {
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

        // Right side: Platform title or custom disclaimer (omitted if disclaimer is empty string)
        const footerDisclaimer = disclaimer !== undefined ? disclaimer : 'الأرضية الرقمية لتسيير المخابر المدرسية';
        if (footerDisclaimer) {
          doc.text(processArabic(footerDisclaimer), pageWidth - margin, footerY, { align: 'right' });
        }

        // Center: Document reference/date
        doc.text(processArabic(dateStr), pageWidth / 2, footerY, { align: 'center' });

        // Left side: Page X of Y
        doc.text(processArabic(`صفحة ${i} من ${totalPages}`), margin, footerY, { align: 'left' });
      }
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
    reportNumber?: string;
    schoolInfo?: SchoolInfo;
    department?: string;
    academicYear?: string;
    location?: string;
    routing?: string;
    recipient?: string;
    sender?: string;
    signers?: string[];
    noActivities?: boolean;
    noActivitiesReason?: string;
    observations?: {
      labNotes?: string;
      supervisorNotes?: string;
      directorNotes?: string;
    };
    rows: Array<{
      teacher: string;
      teacherSubject?: string;
      class: string;
      time: string;
      activityType?: string;
      activityTitle: string;
      equipment: string;
      notes?: string;
    }>;
    save?: boolean;
    isBlank?: boolean;
  }): Promise<jsPDF> {
    const isBlank = Boolean(data.isBlank);
    const isNoActivities = Boolean(data.noActivities);
    const headers = ['#', 'الأستاذ(ة) والمادة', 'التوقيت', 'القسم', 'عنوان النشاط البيداغوجي والنوع', 'الأدوات والمواد المستعملة', 'ملاحظات'];
    
    let formattedRows: any[];
    if (isBlank) {
      formattedRows = Array.from({ length: 7 }, (_, index) => [
        index + 1,
        '........................................',
        '...... : ......',
        '....................',
        '................................................................',
        '................................................................',
        '..............................'
      ]);
    } else if (isNoActivities) {
      formattedRows = [
        [
          '-',
          '---',
          '---',
          '---',
          `لا توجد نشاطات تطبيقية لهذا اليوم (${data.noActivitiesReason || 'أعمال الصيانة والتحضير والجرد الإداري'})`,
          '---',
          'يوم بدون حصص مخبرية'
        ]
      ];
    } else {
      formattedRows = data.rows.map((r, index) => [
        index + 1,
        r.teacher ? (r.teacherSubject ? `${r.teacher} (${r.teacherSubject})` : r.teacher) : '---',
        r.time || '---',
        r.class || '---',
        [r.activityType ? `[${r.activityType}]` : '', r.activityTitle].filter(Boolean).join(' ') || '---',
        r.equipment || '---',
        r.notes || '---'
      ]);
    }

    const releaseDate = getNextWorkingDay(data.date);
    const obsParts = [
      data.observations?.labNotes ? `ملاحظات ${data.sender || 'مسؤول المخبر'}: ${data.observations.labNotes}` : '',
      data.observations?.supervisorNotes ? `ملاحظات الناظر: ${data.observations.supervisorNotes}` : '',
      data.observations?.directorNotes ? `ملاحظات السيد المدير: ${data.observations.directorNotes}` : '',
      `حرر بـ : ${data.location || data.schoolInfo?.commune || 'عين كرشة'} في : ${releaseDate}`
    ].filter(Boolean);
    const obsNotes = obsParts.length > 0 ? obsParts.join('\n\n') : undefined;

    const summaryCards = isBlank ? [
      { label: 'رقم التقرير', value: data.reportNumber || '01' },
      { label: 'النوع', value: 'استمارة بيضاء للتحرير اليدوي' },
      { label: 'تاريخ الاستخراج', value: data.date }
    ] : isNoActivities ? [
      { label: 'رقم التقرير', value: data.reportNumber || '01' },
      { label: 'الوضعية', value: 'لا توجد نشاطات تطبيقية' },
      { label: 'تاريخ اليوم', value: data.date }
    ] : [
      { label: 'رقم التقرير', value: data.reportNumber || '01' },
      { label: 'إجمالي الحصص المسجلة', value: data.rows.length },
      { label: 'تاريخ النشاط', value: data.date }
    ];

    const mergedSchoolInfo: SchoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي',
      school: data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة',
      commune: data.schoolInfo?.commune || data.location || 'عين كرشة',
      laboratory: data.department || 'مخبر العلوم الفيزيائية والطبيعية',
      academicYear: resolveAcademicYear(data.academicYear, data.schoolInfo?.academicYear),
      ...data.schoolInfo
    };

    return this.exportLabReportPDF({
      title: isBlank ? 'استمارة التقرير اليومي للمخبر (نموذج رسمي فارغ)' : 'التقرير اليومي للمخبر',
      subtitle: isBlank 
        ? 'استمارة رسمية جاهزة للطباعة والملء اليدوي المباشر أثناء اليوم الدراسي' 
        : isNoActivities
        ? `سجل الحصص المخبرية ليوم: ${data.date} (يوم بدون أنشطة تطبيقية)`
        : `سجل الحصص المخبرية المنجزة ليوم: ${data.date}${data.reportNumber ? ` (رقم: ${data.reportNumber})` : ''}`,
      schoolInfo: mergedSchoolInfo,
      headers,
      rows: formattedRows,
      fileName: isBlank ? `daily_report_blank_form.pdf` : `daily_report_${data.date}.pdf`,
      orientation: 'l', // Landscape layout for wide daily report table
      summaryCards,
      notes: obsNotes,
      showSignatures: true,
      labManagerTitle: formatOfficialRankTitle(data.signers?.[0] || data.sender),
      middleTitle: data.signers?.[1] || 'الناظر',
      principalTitle: data.signers?.[data.signers.length - 1] || 'مدير المؤسسة',
      disclaimer: '',
      showFooter: false,
      save: data.save !== undefined ? data.save : true
    });
  }

  /**
   * Dedicated generator for Activity Preparation Request (طلب تحضير نشاط تجريبي / تطبيقي)
   * Matches Algerian Daily Lab Report official header, without footer (showFooter: false).
   */
  static async generateActivityRequestPDF(data: {
    orderNum?: string;
    teacherName?: string;
    requestDate?: string;
    requestTime?: string;
    executionDate?: string;
    timing?: string;
    className?: string;
    activityType?: string;
    lab?: string;
    activityTitle?: string;
    jobTitle?: string;
    schoolInfo?: SchoolInfo;
    equipItems?: Array<{ name: string; quantity: number | string; notes?: string }>;
    chemItems?: Array<{ name: string; quantity: string; formula?: string; notes?: string }>;
    signDate?: string;
    isBlank?: boolean;
    save?: boolean;
  }): Promise<jsPDF> {
    const isBlank = Boolean(data.isBlank);
    const rawJob = (data.jobTitle && !data.jobTitle.includes('مدير') && !data.jobTitle.includes('أستاذ'))
      ? data.jobTitle
      : (typeof window !== 'undefined' ? (localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade')) : null) || 'ملحق رئيس بالمخابر';
    const labOfficerTitle = formatOfficialRankTitle(rawJob);
    const headers = ['#', 'النوع / التصنيف', 'البيان (الوسيلة أو المادة الكيميائية)', 'الكمية المطلوبة', 'الصيغة / الملاحظات'];

    let rows: (string | number)[][] = [];

    if (isBlank) {
      // 14 clean dotted rows for manual handwritten fill (7 equipment + 7 chemicals)
      rows = Array.from({ length: 14 }, (_, idx) => [
        idx + 1,
        idx < 7 ? 'وسائل وتجهيزات' : 'مواد كيميائية',
        '....................................................................',
        '............',
        '................................................'
      ]);
    } else {
      const equip = data.equipItems?.filter(e => e.name?.trim()) || [];
      const chem = data.chemItems?.filter(c => c.name?.trim()) || [];

      equip.forEach((item, idx) => {
        rows.push([
          idx + 1,
          'وسائل وتجهيزات',
          item.name,
          item.quantity || 1,
          item.notes || 'صالحة وجاهزة للتجربة'
        ]);
      });

      chem.forEach((item, idx) => {
        rows.push([
          equip.length + idx + 1,
          'مواد كيميائية',
          item.name,
          item.quantity || 'حسب التجربة',
          item.formula ? `[${item.formula}] ${item.notes || ''}` : (item.notes || '---')
        ]);
      });

      if (rows.length === 0) {
        rows.push(['1', 'وسائل وتجهيزات', 'وسائل وتجهيزات التجربة المقررة في المنهاج', '1', 'جاهزة بالمخبر']);
      }
    }

    const title = isBlank 
      ? 'طلب تحضير نشاط تجريبي / تطبيقي' 
      : 'طلب تحضير نشاط تجريبي / تطبيقي';

    const subtitle = isBlank
      ? 'المخبر المخصص: .................................... — عنوان النشاط التطبيقي: ....................................................................'
      : `المخبر المخصص: ${data.lab || 'مخبر العلوم'} — عنوان النشاط التطبيقي: ${data.activityTitle || 'نشاط مخبري'}`;

    const summaryCards = isBlank ? [
      { label: 'الرقم', value: '...............' },
      { label: 'الأستاذ/ة المادة', value: '....................' },
      { label: 'القسم', value: '.........' },
      { label: 'توقيت الحصة', value: '...... : ......' },
      { label: 'تاريخ الطلب', value: '..... / ..... / 2026' },
      { label: 'ساعة الطلب', value: '...... : ......' },
      { label: 'تاريخ الإجراء', value: '..... / ..... / 2026' },
      { label: 'نوع النشاط', value: 'عملي / محاكاة' }
    ] : [
      { label: 'الرقم', value: data.orderNum || '---' },
      { label: 'الأستاذ/ة المادة', value: data.teacherName || '---' },
      { label: 'القسم', value: data.className || '---' },
      { label: 'توقيت الحصة', value: data.timing || '---' },
      { label: 'تاريخ الطلب', value: data.requestDate || '---' },
      { label: 'ساعة الطلب', value: data.requestTime || '---' },
      { label: 'تاريخ الإجراء', value: data.executionDate || data.requestDate || '---' },
      { label: 'نوع النشاط', value: data.activityType || 'عملي' }
    ];

    const mergedSchoolInfo: SchoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي',
      school: data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة',
      commune: data.schoolInfo?.commune || 'عين كرشة',
      laboratory: data.lab || data.schoolInfo?.laboratory || 'مخبر العلوم والتكنولوجيا',
      academicYear: resolveAcademicYear(data.schoolInfo?.academicYear),
      date: data.requestDate || new Date().toISOString().split('T')[0],
      ...data.schoolInfo
    };

    const communeLoc = mergedSchoolInfo.commune || 'عين كرشة';
    const releaseD = isBlank ? '....................................' : (data.signDate || data.requestDate || new Date().toISOString().split('T')[0]);

    return this.exportLabReportPDF({
      title,
      subtitle,
      schoolInfo: mergedSchoolInfo,
      headers,
      rows,
      fileName: isBlank 
        ? 'activity_request_blank_form.pdf' 
        : `activity_request_${(data.orderNum || 'doc').replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      orientation: 'p',
      summaryCards,
      notes: 'تقدم هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل للعتاد والمحاليل.',
      releaseLocation: communeLoc,
      releaseDate: releaseD,
      showSignatures: true,
      labManagerTitle: 'أستاذ(ة) المادة',
      principalTitle: labOfficerTitle,
      disclaimer: '',
      showFooter: false,
      save: data.save !== undefined ? data.save : true
    });
  }

  /**
   * Generates a formal official document archive card (بطاقة توثيق وأرشفة نص تشريعي)
   * used when rendering legislation documents or as a zero-failure preview fallback.
   */
  static async generateLegislationSheetPDF(options: {
    title: string;
    reference?: string;
    category?: string;
    date?: string;
    description?: string;
    fileName?: string;
    isPublic?: boolean;
    schoolInfo?: SchoolInfo;
  }): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 16;

    // Header: Algerian Republic & Ministry
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 45, 25);
    doc.text(processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });

    currentY += 6;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 75, 55);
    doc.text(processArabic('وزارة التربية الوطنية — الأرشيف الرقمي للمخابر والتشريع المدرسي'), pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    doc.setDrawColor(200, 215, 195);
    doc.setLineWidth(0.6);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Document Banner
    doc.setFillColor(43, 61, 34);
    doc.roundedRect(margin, currentY, contentWidth, 14, 3, 3, 'F');
    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(processArabic('بطاقة تعريف وأرشفة النص التشريعي'), pageWidth / 2, currentY + 9, { align: 'center' });

    currentY += 20;

    // Title Card
    doc.setFillColor(248, 250, 246);
    doc.setDrawColor(215, 225, 210);
    doc.roundedRect(margin, currentY, contentWidth, 18, 3, 3, 'FD');
    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 45, 25);
    const titleLines = doc.splitTextToSize(processArabic(options.title || 'وثيقة تشريعية'), contentWidth - 10);
    doc.text(titleLines, pageWidth / 2, currentY + 8, { align: 'center' });

    currentY += 24;

    // Details Grid / Key-Value rows
    const details = [
      { label: 'طبيعة النص التشريعي:', value: options.category || 'نص تشريعي رسمي' },
      { label: 'الرقم المرجعي:', value: options.reference || 'غير محدد' },
      { label: 'تاريخ الإصدار / النشر:', value: options.date || new Date().toISOString().split('T')[0] },
      { label: 'اسم الملف المرفق:', value: options.fileName || 'المرفق الرقمي الأصلي' },
      { label: 'نطاق النشر:', value: options.isPublic ? 'نص رسمي عام (متاح لكافة المدارس والمستخدمين)' : 'أرشيف محلي خاص بالمؤسسة' }
    ];

    details.forEach(item => {
      doc.setFillColor(252, 253, 250);
      doc.setDrawColor(230, 235, 225);
      doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'FD');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(70, 85, 65);
      doc.text(processArabic(item.label), pageWidth - margin - 6, currentY + 6.5, { align: 'right' });

      doc.setFont(fontName, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(20, 30, 15);
      doc.text(processArabic(item.value), margin + 6, currentY + 6.5, { align: 'left' });

      currentY += 12;
    });

    currentY += 4;

    // Summary / Description Box
    if (options.description) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(43, 61, 34);
      doc.text(processArabic('خلاصة وفحوى الوثيقة:'), pageWidth - margin, currentY, { align: 'right' });
      currentY += 4;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(210, 220, 205);
      doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

      doc.setFont(fontName, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 60, 45);
      const descLines = doc.splitTextToSize(processArabic(options.description), contentWidth - 12);
      doc.text(descLines, pageWidth - margin - 6, currentY + 7, { align: 'right' });

      currentY += 32;
    }

    // Notice Box
    doc.setFillColor(240, 246, 238);
    doc.setDrawColor(180, 205, 175);
    doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(43, 61, 34);
    doc.text(processArabic('إشعار الأرشفة والتوثيق الرقمي:'), pageWidth - margin - 6, currentY + 6, { align: 'right' });

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 95, 75);
    const noticeText = 'هذه البطاقة تمثل التوثيق الرقمي الرسمي المعتمد في منصة تسيير المخابر المدرسية والتشريع التربوي. المرفق الرقمي الأصلي محفوظ ومؤرشف في قاعدة البيانات. يمكنك إعادة إرفاق أو تحديث ملف PDF الأصلي عند توفره.';
    const noticeLines = doc.splitTextToSize(processArabic(noticeText), contentWidth - 12);
    doc.text(noticeLines, pageWidth - margin - 6, currentY + 12, { align: 'right' });

    // Official Stamp box at bottom
    currentY += 26;
    const stampWidth = 60;
    const stampX = margin + 10;
    doc.setDrawColor(160, 180, 150);
    doc.setLineWidth(0.4);
    doc.roundedRect(stampX, currentY, stampWidth, 22, 2, 2, 'D');
    doc.setFont(fontName, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 120, 95);
    doc.text(processArabic('ختم وتأشيرة الأرشيف الرقمي'), stampX + stampWidth / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont(fontName, 'normal');
    doc.text(processArabic('معتمد رقمياً'), stampX + stampWidth / 2, currentY + 11.5, { align: 'center' });
    doc.text(processArabic(new Date().toLocaleDateString('ar-DZ')), stampX + stampWidth / 2, currentY + 17, { align: 'center' });

    return doc.output('blob');
  }

  /**
   * Generates a complete, authentic administrative document PDF
   * (طلبات، مراسلات، تقارير، محاضر) matching official Algerian Ministry standards.
   */
  static async generateAdministrativeDocumentPDF(options: {
    title: string;
    reference?: string;
    category?: string;
    date?: string;
    sender: string;
    recipient: string;
    subject: string;
    content: string;
    notes?: string;
    department?: string;
    academicYear?: string;
    location?: string;
    hasTable?: boolean;
    tableHeaders?: string[];
    tableRows?: (string | number)[][];
    signers?: string[];
    schoolInfo?: SchoolInfo;
    fileName?: string;
    save?: boolean;
  }): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 14;

    const schoolInfo = options.schoolInfo || {};
    const country = schoolInfo.country || 'الجمهورية الجزائرية الديمقراطية الشعبية';
    const ministry = schoolInfo.ministry || 'وزارة التربية الوطنية';
    const directorate = schoolInfo.directorate || 'مديرية التربية الوطنية';
    const school = formatSchoolWithCommune(schoolInfo.school || 'المؤسسة التعليمية', schoolInfo.commune);
    const dateStr = options.date || new Date().toISOString().split('T')[0];

    // 1. Official Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic(country), pageWidth / 2, currentY, { align: 'center' });

    currentY += 5.5;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text(processArabic(ministry), pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;
    // Right info: Directorate, School, Department
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic(directorate), pageWidth - margin, currentY + 3, { align: 'right' });
    doc.text(processArabic(school), pageWidth - margin, currentY + 8, { align: 'right' });
    const dept = options.department || schoolInfo.laboratory || 'مخبر العلوم الفيزيائية والطبيعية';
    doc.text(processArabic(`المصلحة: ${dept}`), pageWidth - margin, currentY + 13, { align: 'right' });

    // Left info: Academic Year, Date, Reference
    const yearStr = resolveAcademicYear(options.academicYear, schoolInfo.academicYear);
    doc.text(processArabic(`السنة الدراسية: ${yearStr}`), margin, currentY + 3, { align: 'left' });
    doc.text(processArabic(`التاريخ: ${dateStr}`), margin, currentY + 8, { align: 'left' });
    if (options.reference) {
      doc.text(processArabic(`المرجع: ${options.reference}`), margin, currentY + 13, { align: 'left' });
    }

    currentY += 18;
    // Divider line
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.7);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // 2. Title Box
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(15, 118, 110);
    doc.roundedRect(margin, currentY, contentWidth, 13, 2.5, 2.5, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text(processArabic(options.title), pageWidth / 2, currentY + 8.5, { align: 'center' });

    currentY += 17;

    // 3. Correspondence Box (من، إلى، الموضوع)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

    // Right colored accent bar
    doc.setFillColor(15, 118, 110);
    doc.rect(pageWidth - margin - 2.5, currentY, 2.5, 23, 'F');

    const metaRightX = pageWidth - margin - 6;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic(`من: ${options.sender}`), metaRightX, currentY + 6, { align: 'right' });
    doc.text(processArabic(`إلى: ${options.recipient}`), metaRightX, currentY + 12, { align: 'right' });
    doc.setTextColor(15, 118, 110);
    doc.text(processArabic(`الموضوع: ${options.subject}`), metaRightX, currentY + 18, { align: 'right' });

    currentY += 28;

    // 4. Body Content
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const contentLines = doc.splitTextToSize(processArabic(options.content), contentWidth - 4);
    
    const lineHeight = 5.8;
    const neededContentHeight = contentLines.length * lineHeight;
    if (currentY + neededContentHeight > pageHeight - 35) {
      for (const line of contentLines) {
        if (currentY + lineHeight > pageHeight - 30) {
          doc.addPage();
          currentY = 18;
        }
        doc.text(line, pageWidth - margin - 2, currentY, { align: 'right' });
        currentY += lineHeight;
      }
    } else {
      doc.text(contentLines, pageWidth - margin - 2, currentY, { align: 'right' });
      currentY += neededContentHeight;
    }

    currentY += 6;

    // 5. Table (if hasTable and rows exist)
    if (options.hasTable && options.tableRows && options.tableRows.length > 0) {
      const headers = options.tableHeaders || ['الرقم', 'البيان والتسمية', 'الكمية', 'الملاحظات'];
      const rtlHeaders = [...headers].reverse().map(h => processArabic(h));
      const rtlRows = options.tableRows.map(r => [...r].reverse().map(c => processArabic(c)));

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
          textColor: [15, 23, 42],
          lineColor: [203, 213, 225],
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: [15, 118, 110],
          textColor: [255, 255, 255],
          font: fontName,
          fontStyle: 'bold',
          fontSize: 9.5,
          halign: 'right'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      currentY = (doc as any).lastAutoTable?.finalY + 6 || currentY + 30;
    }

    // 6. Notes Box
    if (options.notes) {
      if (currentY + 20 > pageHeight - 35) {
        doc.addPage();
        currentY = 18;
      }
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(254, 243, 199);
      doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

      doc.setFillColor(217, 119, 6);
      doc.rect(pageWidth - margin - 2, currentY, 2, 14, 'F');

      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(146, 64, 14);
      const noteText = processArabic(`ملاحظة هامة: ${options.notes}`);
      const noteLines = doc.splitTextToSize(noteText, contentWidth - 8);
      doc.text(noteLines, pageWidth - margin - 6, currentY + 6, { align: 'right' });

      currentY += 18;
    }

    // 6b. Location and Date line
    const releaseLocation = options.location || schoolInfo.commune || 'عين كرشة';
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic(`حرر بـ : ${releaseLocation} في : ${dateStr}`), margin, currentY + 2, { align: 'left' });
    currentY += 8;

    // 7. Signatures
    const signers = options.signers && options.signers.length > 0 ? options.signers : ['مسير المخبر', 'مدير المؤسسة'];
    if (currentY + 30 > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 4;
    }

    const colWidth = contentWidth / signers.length;
    signers.forEach((sig, idx) => {
      const colX = margin + idx * colWidth;
      const centerX = colX + colWidth / 2;

      // dashed signature line
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(colX + 6, currentY + 4, colX + colWidth - 6, currentY + 4);
      doc.setLineDashPattern([], 0);

      doc.setFont(fontName, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(processArabic(sig), centerX, currentY + 9, { align: 'center' });

      doc.setFont(fontName, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(processArabic('(الاسم، التوقيع والختم)'), centerX, currentY + 15, { align: 'center' });
    });

    // 8. Footer across all pages
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont(fontName, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      const footerY = pageHeight - 8;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

      doc.text(processArabic('الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'), pageWidth - margin, footerY, { align: 'right' });
      doc.text(processArabic(`صفحة ${i} من ${totalPages}`), margin, footerY, { align: 'left' });
    }

    if (options.save) {
      const safeName = (options.fileName || options.title || 'document').replace(/[/\\?%*:|"<>]/g, '_');
      doc.save(safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`);
    }

    return doc.output('blob');
  }

  /**
   * Generates a fully formatted Word Document (.doc) HTML matching the exact same form and details as exportLabReportPDF.
   */
  static generateLabReportWordHtml(options: LabReportPDFOptions): string {
    const {
      title,
      subtitle,
      schoolInfo = {},
      headers = [],
      rows = [],
      orientation = 'p',
      summaryCards = [],
      showSignatures = true,
      notes,
      disclaimer,
      showFooter = true,
      labManagerTitle = 'المسؤول عن المخبر',
      principalTitle = 'مدير(ة) المؤسسة'
    } = options;

    const isLandscape = orientation === 'l' || orientation === 'landscape';
    const country = schoolInfo.country || 'الجمهورية الجزائرية الديمقراطية الشعبية';
    const ministry = schoolInfo.ministry || 'وزارة التربية الوطنية';
    const directorate = schoolInfo.directorate || 'مديرية التربية لولاية الجزائر';
    const school = schoolInfo.school || 'مؤسسة التعليم الثانوي والتقني';
    const laboratory = schoolInfo.laboratory || 'مخبر العلوم والتكنولوجيا';
    const academicYear = resolveAcademicYear(schoolInfo.academicYear);
    const dateStr = schoolInfo.date || new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedSchool = formatSchoolWithCommune(school, schoolInfo.commune);

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${title} — ${formattedSchool}</title>
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
            size: ${isLandscape ? '841.95pt 595.35pt' : '595.35pt 841.95pt'};
            mso-page-orientation: ${isLandscape ? 'landscape' : 'portrait'};
            margin: 36.0pt 36.0pt 36.0pt 36.0pt;
            mso-header-margin: 25.0pt;
            mso-footer-margin: 25.0pt;
          }
          div.Section1 { page: Section1; }
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
            font-size: 11pt;
            font-weight: bold;
            color: #2b3d22;
            margin: 0 0 6pt 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            border-bottom: 2pt solid #2b3d22;
            margin-bottom: 10pt;
            padding-bottom: 5pt;
          }
          .header-table td {
            border: none;
            vertical-align: top;
            font-size: 9.5pt;
          }
          .banner-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8pt 0 10pt 0;
            background-color: #2b3d22;
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
            color: #ffffff;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .banner-sub {
            margin: 3pt 0 0 0;
            font-size: 9.5pt;
            color: #dce5d6;
          }
          .cards-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: none;
          }
          .cards-table td {
            border: 1pt solid #d2d8ce;
            background-color: #fafbf9;
            padding: 6pt;
            text-align: center;
          }
          .card-label { font-size: 8.5pt; color: #555555; }
          .card-value { font-size: 11pt; font-weight: bold; color: #2b3d22; margin-top: 2pt; }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: 1.5pt solid #2b3d22;
            direction: rtl;
          }
          .data-table th {
            background-color: #2b3d22;
            color: #ffffff;
            border: 1pt solid #2b3d22;
            padding: 6pt 5pt;
            font-size: 9.5pt;
            font-weight: bold;
            text-align: center;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .data-table td {
            border: 1pt solid #c2c9bc;
            padding: 5pt 6pt;
            font-size: 9pt;
            color: #1a1a1a;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            background-color: #ffffff;
            border: 1pt solid #d2d8ce;
          }
          .notes-table td {
            padding: 7pt 10pt;
            border: none;
            font-size: 9pt;
            color: #333333;
          }
          .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            border: none;
            direction: rtl;
          }
          .signatures-table td {
            width: 50%;
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
            height: 42pt;
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
          <p class="republic-title">${country}</p>
          <p class="ministry-title">${ministry}</p>

          <table class="header-table" dir="rtl">
            <tr>
              <td style="text-align: right; width: 50%;">
                <div><strong>مديرية التربية لولاية:</strong> ${directorate}</div>
                <div><strong>المؤسسة التعليمية:</strong> ${formattedSchool}</div>
                <div><strong>المصلحة / المخبر:</strong> ${laboratory}</div>
              </td>
              <td style="text-align: left; width: 50%;" dir="rtl">
                <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                <div><strong>تاريخ الإصدار:</strong> ${dateStr}</div>
              </td>
            </tr>
          </table>

          <table class="banner-table" dir="rtl">
            <tr>
              <td>
                <h1 class="banner-title">${title}</h1>
                ${subtitle ? `<p class="banner-sub">${subtitle}</p>` : ''}
              </td>
            </tr>
          </table>

          ${summaryCards && summaryCards.length > 0 ? `
            <table class="cards-table" dir="rtl">
              <tr>
                ${summaryCards.map(c => `
                  <td>
                    <div class="card-label">${c.label}</div>
                    <div class="card-value">${c.value}</div>
                  </td>
                `).join('')}
              </tr>
            </table>
          ` : ''}

          <table class="data-table" dir="rtl">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, rIdx) => `
                <tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f9faf7'};">
                  ${row.map(cell => `
                    <td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${notes ? `
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>ملاحظات وتوجيهات:</strong> ${notes}</td>
              </tr>
            </table>
          ` : ''}

          ${showSignatures ? `
            <table class="signatures-table" dir="rtl">
              <tr>
                <td>
                  <div class="sig-title">${labManagerTitle}</div>
                  <div class="sig-space">${labManagerTitle.includes('أستاذ') ? '(الاسم والتوقيع)' : '(الاسم، التوقيع والختم)'}</div>
                  <div style="font-size: 7.5pt; color: #777;">حرر بتاريخ: ....................</div>
                </td>
                <td>
                  <div class="sig-title">${principalTitle}</div>
                  <div class="sig-space">(التوقيع والختم)</div>
                  <div style="font-size: 7.5pt; color: #777;">في: .............................</div>
                </td>
              </tr>
            </table>
          ` : ''}

          ${showFooter ? `
          <table class="footer-table" dir="rtl">
            <tr>
              <td style="text-align: right;">${disclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية'}</td>
              <td style="text-align: center;">${formattedSchool}</td>
              <td style="text-align: left;">صفحة 1 من 1</td>
            </tr>
          </table>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Directly triggers download of laboratory report as Microsoft Word (.doc)
   */
  static exportLabReportWord(options: LabReportPDFOptions): void {
    const html = this.generateLabReportWordHtml(options);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (options.fileName || options.title || 'document')
      .replace(/\.pdf$/i, '')
      .replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Helper method to download any generic table as Word document (.doc)
   */
  static downloadTableWord(
    title: string,
    headers: string[],
    rows: any[][],
    fileName: string,
    extraOptions?: Partial<LabReportPDFOptions>
  ): void {
    this.exportLabReportWord({
      title,
      headers,
      rows,
      fileName,
      ...extraOptions
    });
  }

  /**
   * Generates and downloads an Incident Safety Report as Word (.doc)
   */
  static generateIncidentWord(incident: any, schoolInfo?: SchoolInfo): void {
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

    this.exportLabReportWord({
      title: 'محضر إثبات وتفاصيل حادث مخبري',
      subtitle: `تقرير رسمي صادر عن إدارة المخبر - المرجع: ${incident.id || ''}`,
      schoolInfo,
      headers: ['البيان / الإجراء', 'معلومات وتفاصيل الحادث'],
      rows: fields,
      fileName: `incident_${incident.id || 'report'}_${new Date().toISOString().split('T')[0]}.doc`,
      showSignatures: true,
      notes: 'يُحفظ هذا التقرير في سجل الأمن والسلامة المخبرية وتُرسل نسخة منه إلى إدارة المؤسسة.'
    });
  }

  /**
   * Generates and downloads a Daily Lab Activity Report as Word (.doc)
   */
  static generateDailyReportWord(data: {
    date: string;
    reportNumber?: string;
    schoolInfo?: SchoolInfo;
    department?: string;
    academicYear?: string;
    location?: string;
    routing?: string;
    recipient?: string;
    sender?: string;
    signers?: string[];
    noActivities?: boolean;
    noActivitiesReason?: string;
    observations?: {
      labNotes?: string;
      supervisorNotes?: string;
      directorNotes?: string;
    };
    rows: Array<{
      teacher: string;
      teacherSubject?: string;
      class: string;
      time: string;
      activityType?: string;
      activityTitle: string;
      equipment: string;
      notes?: string;
    }>;
    isBlank?: boolean;
  }): void {
    const isBlank = Boolean(data.isBlank);
    const isNoActivities = Boolean(data.noActivities);
    const headers = ['#', 'الأستاذ(ة) والمادة', 'التوقيت', 'القسم', 'عنوان النشاط البيداغوجي والنوع', 'الأدوات والمواد المستعملة', 'ملاحظات'];
    
    let formattedRows: any[];
    if (isBlank) {
      formattedRows = Array.from({ length: 7 }, (_, index) => [
        index + 1,
        '........................................',
        '...... : ......',
        '....................',
        '................................................................',
        '................................................................',
        '..............................'
      ]);
    } else if (isNoActivities) {
      formattedRows = [
        [
          '-',
          '---',
          '---',
          '---',
          `لا توجد نشاطات تطبيقية لهذا اليوم (${data.noActivitiesReason || 'أعمال الصيانة والتحضير والجرد الإداري'})`,
          '---',
          'يوم بدون حصص مخبرية'
        ]
      ];
    } else {
      formattedRows = data.rows.map((r, index) => [
        index + 1,
        r.teacher ? (r.teacherSubject ? `${r.teacher} (${r.teacherSubject})` : r.teacher) : '---',
        r.time || '---',
        r.class || '---',
        [r.activityType ? `[${r.activityType}]` : '', r.activityTitle].filter(Boolean).join(' ') || '---',
        r.equipment || '---',
        r.notes || '---'
      ]);
    }

    const releaseDate = getNextWorkingDay(data.date);
    const obsParts = [
      data.observations?.labNotes ? `ملاحظات ${data.sender || 'مسؤول المخبر'}: ${data.observations.labNotes}` : '',
      data.observations?.supervisorNotes ? `ملاحظات الناظر: ${data.observations.supervisorNotes}` : '',
      data.observations?.directorNotes ? `ملاحظات المدير: ${data.observations.directorNotes}` : '',
      `حرر بـ : ${data.location || data.schoolInfo?.commune || 'عين كرشة'} في : ${releaseDate}`
    ].filter(Boolean);
    const obsNotes = obsParts.length > 0 ? obsParts.join('\n\n') : undefined;

    const mergedSchoolInfo: SchoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي',
      school: data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة',
      commune: data.schoolInfo?.commune || data.location || 'عين كرشة',
      laboratory: data.department || 'مخبر العلوم الفيزيائية والطبيعية',
      academicYear: resolveAcademicYear(data.academicYear, data.schoolInfo?.academicYear),
      ...data.schoolInfo
    };

    this.exportLabReportWord({
      title: isBlank ? 'استمارة التقرير اليومي للمخبر (نموذج رسمي فارغ)' : 'التقرير اليومي للمخبر',
      subtitle: isBlank 
        ? 'استمارة رسمية جاهزة للطباعة والملء اليدوي المباشر أثناء اليوم الدراسي' 
        : isNoActivities
        ? `سجل الحصص المخبرية ليوم: ${data.date} (يوم بدون أنشطة تطبيقية)`
        : `سجل الحصص المخبرية المنجزة ليوم: ${data.date}${data.reportNumber ? ` (رقم: ${data.reportNumber})` : ''}`,
      schoolInfo: mergedSchoolInfo,
      headers,
      rows: formattedRows,
      fileName: isBlank ? `daily_report_blank_form.doc` : `daily_report_${data.date}.doc`,
      orientation: 'l',
      summaryCards: isBlank ? [
        { label: 'النوع', value: 'استمارة بيضاء للتحرير اليدوي' },
        { label: 'تاريخ الاستخراج', value: data.date }
      ] : isNoActivities ? [
        { label: 'الوضعية', value: 'لا توجد نشاطات تطبيقية' },
        { label: 'تاريخ اليوم', value: data.date },
        ...(data.academicYear ? [{ label: 'السنة الدراسية', value: data.academicYear }] : [])
      ] : [
        { label: 'إجمالي الحصص المسجلة', value: data.rows.length },
        { label: 'تاريخ النشاط', value: data.date },
        ...(data.academicYear ? [{ label: 'السنة الدراسية', value: data.academicYear }] : [])
      ],
      notes: obsNotes,
      labManagerTitle: formatOfficialRankTitle(data.signers?.[0] || data.sender),
      principalTitle: data.signers?.[data.signers.length - 1] || 'مدير المؤسسة',
      showSignatures: true,
      showFooter: false
    });
  }

  /**
   * Generates and downloads an Official Document Archive Card as Word (.doc)
   */
  static generateLegislationSheetWord(options: {
    title: string;
    reference?: string;
    category?: string;
    date?: string;
    description?: string;
    fileName?: string;
    isPublic?: boolean;
    schoolInfo?: SchoolInfo;
  }): void {
    const infoRows = [
      ['عنوان النص / الوثيقة', options.title],
      ['المرجع والترقيم الرسمي', options.reference || '---'],
      ['التصنيف الإداري والتربوي', options.category || 'نصوص وتشريعات عامة'],
      ['تاريخ الإصدار / النشر', options.date || new Date().toISOString().split('T')[0]],
      ['طبيعة الوثيقة', options.isPublic ? 'عامة ومتاحة لكافة أعضاء الأسرة التربوية' : 'خاصة / داخلية'],
      ['ملخص المضمون والأثر القانوني', options.description || 'وثيقة رسمية معتمدة محفوظة في الأرشيف التربوي للمؤسسة']
    ];

    this.exportLabReportWord({
      title: 'بطاقة أرشفة وتوثيق نص تشريعي وإداري',
      subtitle: `المرجع المعتمد: ${options.reference || '---'} — وزارة التربية الوطنية`,
      schoolInfo: options.schoolInfo,
      headers: ['البيان الإداري', 'المعطيات والتفاصيل'],
      rows: infoRows,
      fileName: `${(options.fileName || options.title).replace(/[/\\?%*:|"<>]/g, '_')}.doc`,
      notes: 'تُعد هذه البطاقة وثيقة أرشفة رقمية رسمية مطابقة للنصوص التشريعية المعمول بها بوزارة التربية الوطنية.',
      showSignatures: true,
      labManagerTitle: 'مسؤول التوثيق والأرشيف',
      principalTitle: 'مدير المؤسسة التعليمية'
    });
  }

  /**
   * Generates and downloads an Activity Preparation Request as Word (.doc)
   * Matches Algerian Daily Lab Report official header, without footer (showFooter: false).
   */
  static generateActivityRequestWord(data: {
    orderNum?: string;
    teacherName?: string;
    requestDate?: string;
    requestTime?: string;
    executionDate?: string;
    timing?: string;
    className?: string;
    activityType?: string;
    lab?: string;
    activityTitle?: string;
    jobTitle?: string;
    schoolInfo?: SchoolInfo;
    equipItems?: Array<{ name: string; quantity: number | string; notes?: string }>;
    chemItems?: Array<{ name: string; quantity: string; formula?: string; notes?: string }>;
    signDate?: string;
    isBlank?: boolean;
  }): void {
    const isBlank = Boolean(data.isBlank);
    const rawJob = (data.jobTitle && !data.jobTitle.includes('مدير') && !data.jobTitle.includes('أستاذ'))
      ? data.jobTitle
      : (typeof window !== 'undefined' ? (localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade')) : null) || 'ملحق رئيس بالمخابر';
    const labOfficerTitle = formatOfficialRankTitle(rawJob);
    const headers = ['#', 'النوع / التصنيف', 'البيان (الوسيلة أو المادة الكيميائية)', 'الكمية المطلوبة', 'الصيغة / الملاحظات'];

    let rows: (string | number)[][] = [];

    if (isBlank) {
      rows = Array.from({ length: 14 }, (_, idx) => [
        idx + 1,
        idx < 7 ? 'وسائل وتجهيزات' : 'مواد كيميائية',
        '....................................................................',
        '............',
        '................................................'
      ]);
    } else {
      const equip = data.equipItems?.filter(e => e.name?.trim()) || [];
      const chem = data.chemItems?.filter(c => c.name?.trim()) || [];

      equip.forEach((item, idx) => {
        rows.push([
          idx + 1,
          'وسائل وتجهيزات',
          item.name,
          item.quantity || 1,
          item.notes || 'صالحة وجاهزة للتجربة'
        ]);
      });

      chem.forEach((item, idx) => {
        rows.push([
          equip.length + idx + 1,
          'مواد كيميائية',
          item.name,
          item.quantity || 'حسب التجربة',
          item.formula ? `[${item.formula}] ${item.notes || ''}` : (item.notes || '---')
        ]);
      });

      if (rows.length === 0) {
        rows.push(['1', 'وسائل وتجهيزات', 'وسائل وتجهيزات التجربة المقررة في المنهاج', '1', 'جاهزة بالمخبر']);
      }
    }

    const title = isBlank 
      ? 'طلب تحضير نشاط تجريبي / تطبيقي' 
      : 'طلب تحضير نشاط تجريبي / تطبيقي';

    const subtitle = isBlank
      ? 'المخبر المخصص: .................................... — عنوان النشاط التطبيقي: ....................................................................'
      : `المخبر المخصص: ${data.lab || 'مخبر العلوم'} — عنوان النشاط التطبيقي: ${data.activityTitle || 'نشاط مخبري'}`;

    const summaryCards = isBlank ? [
      { label: 'الرقم', value: '...............' },
      { label: 'الأستاذ/ة المادة', value: '....................' },
      { label: 'القسم', value: '.........' },
      { label: 'توقيت الحصة', value: '...... : ......' },
      { label: 'تاريخ الطلب', value: '..... / ..... / 2026' },
      { label: 'ساعة الطلب', value: '...... : ......' },
      { label: 'تاريخ الإجراء', value: '..... / ..... / 2026' },
      { label: 'نوع النشاط', value: 'عملي / محاكاة' }
    ] : [
      { label: 'الرقم', value: data.orderNum || '---' },
      { label: 'الأستاذ/ة المادة', value: data.teacherName || '---' },
      { label: 'القسم', value: data.className || '---' },
      { label: 'توقيت الحصة', value: data.timing || '---' },
      { label: 'تاريخ الطلب', value: data.requestDate || '---' },
      { label: 'ساعة الطلب', value: data.requestTime || '---' },
      { label: 'تاريخ الإجراء', value: data.executionDate || data.requestDate || '---' },
      { label: 'نوع النشاط', value: data.activityType || 'عملي' }
    ];

    const mergedSchoolInfo: SchoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي',
      school: data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة',
      commune: data.schoolInfo?.commune || 'عين كرشة',
      laboratory: data.lab || data.schoolInfo?.laboratory || 'مخبر العلوم والتكنولوجيا',
      academicYear: resolveAcademicYear(data.schoolInfo?.academicYear),
      date: data.requestDate || new Date().toISOString().split('T')[0],
      ...data.schoolInfo
    };

    this.exportLabReportWord({
      title,
      subtitle,
      schoolInfo: mergedSchoolInfo,
      headers,
      rows,
      fileName: isBlank 
        ? 'activity_request_blank_form.doc' 
        : `activity_request_${(data.orderNum || 'doc').replace(/[/\\?%*:|"<>]/g, '_')}.doc`,
      orientation: 'p',
      summaryCards,
      notes: 'تقدم هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل للعتاد والمحاليل.',
      showSignatures: true,
      labManagerTitle: 'أستاذ(ة) المادة',
      principalTitle: labOfficerTitle,
      showFooter: false
    });
  }

  /**
   * Generates pure printable HTML for Activity Preparation Request matching the Daily Report header style.
   * Completely excludes footer elements.
   */
  static generateActivityRequestHtml(data: {
    orderNum?: string;
    teacherName?: string;
    requestDate?: string;
    requestTime?: string;
    executionDate?: string;
    timing?: string;
    className?: string;
    activityType?: string;
    lab?: string;
    activityTitle?: string;
    jobTitle?: string;
    schoolInfo?: SchoolInfo;
    equipItems?: Array<{ name: string; quantity: number | string; notes?: string }>;
    chemItems?: Array<{ name: string; quantity: string; formula?: string; notes?: string }>;
    signDate?: string;
    isBlank?: boolean;
    isEconomical?: boolean;
    copies?: number;
    lineStyle?: 'dotted' | 'solid';
    blankRowsCount?: number;
    paperSize?: 'a4' | 'a3' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    pagesPerSheet?: 1 | 2 | 4;
    margins?: 'default' | 'minimum' | 'none' | 'wide';
    scale?: number;
    showHeader?: boolean;
    backgroundGraphics?: boolean;
  }): string {
    const isBlank = Boolean(data.isBlank);
    const isEconomical = Boolean(data.isEconomical);
    const copiesCount = Math.max(1, Math.min(5, data.copies || 1));
    const rowsCount = data.blankRowsCount || 12;
    const lineStyle = data.lineStyle || 'dotted';
    const paperSize = data.paperSize || 'a4';
    const orientation = data.orientation || 'portrait';
    const pagesPerSheet = data.pagesPerSheet || 1;
    const marginsType = data.margins || 'default';
    const scale = data.scale || 100;
    const showHeader = data.showHeader !== false;
    const backgroundGraphics = data.backgroundGraphics !== false && !isEconomical;

    let marginCss = '7mm 10mm 7mm 10mm';
    if (marginsType === 'minimum') marginCss = '3mm 4mm 3mm 4mm';
    else if (marginsType === 'none') marginCss = '0mm';
    else if (marginsType === 'wide') marginCss = '14mm 16mm 14mm 16mm';

    const country = 'الجمهورية الجزائرية الديمقراطية الشعبية';
    const ministry = 'وزارة التربية الوطنية';
    const directorate = data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي';
    const school = data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة';
    const commune = data.schoolInfo?.commune || 'عين كرشة';
    const formattedSchool = formatSchoolWithCommune(school, commune);
    const laboratory = data.lab || data.schoolInfo?.laboratory || 'مخبر العلوم الطبيعية والفيزيائية';
    const academicYear = resolveAcademicYear(data.schoolInfo?.academicYear);
    const signDate = data.signDate || data.requestDate || new Date().toISOString().split('T')[0];
    const rawJob = (data.jobTitle && !data.jobTitle.includes('مدير') && !data.jobTitle.includes('أستاذ'))
      ? data.jobTitle
      : (typeof window !== 'undefined' ? (localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade')) : null) || 'ملحق رئيس بالمخابر';
    const labOfficerTitle = formatOfficialRankTitle(rawJob);

    const title = 'طلب تحضير نشاط تجريبي / تطبيقي';

    const subtitle = isBlank
      ? 'المخبر المخصص: .................................... — عنوان النشاط التطبيقي: ....................................................................'
      : `المخبر المخصص: ${laboratory} — عنوان النشاط التطبيقي: ${data.activityTitle || 'نشاط مخبري'}`;

    const summaryCards = isBlank ? [
      { label: 'الرقم', value: '...............' },
      { label: 'الأستاذ/ة المادة', value: '....................' },
      { label: 'القسم', value: '.........' },
      { label: 'توقيت الحصة', value: '...... : ......' },
      { label: 'تاريخ الطلب', value: '..... / ..... / 2026' },
      { label: 'ساعة الطلب', value: '...... : ......' },
      { label: 'تاريخ الإجراء', value: '..... / ..... / 2026' },
      { label: 'نوع النشاط', value: 'عملي / محاكاة' }
    ] : [
      { label: 'الرقم', value: data.orderNum || '---' },
      { label: 'الأستاذ/ة المادة', value: data.teacherName || '---' },
      { label: 'القسم', value: data.className || '---' },
      { label: 'توقيت الحصة', value: data.timing || '---' },
      { label: 'تاريخ الطلب', value: data.requestDate || '---' },
      { label: 'ساعة الطلب', value: data.requestTime || '---' },
      { label: 'تاريخ الإجراء', value: data.executionDate || data.requestDate || '---' },
      { label: 'نوع النشاط', value: data.activityType || 'عملي' }
    ];

    let equipRowsHtml = '';
    let chemRowsHtml = '';

    const dottedGuide = lineStyle === 'solid' ? '&nbsp;' : '............................................................';
    const shortDottedGuide = lineStyle === 'solid' ? '&nbsp;' : '..............';
    const tinyDottedGuide = lineStyle === 'solid' ? '&nbsp;' : '.......';
    const borderBottomStyle = lineStyle === 'solid' ? 'border-bottom: 1px solid #cbd5e1;' : '';

    if (isBlank) {
      equipRowsHtml = Array.from({ length: rowsCount }, (_, idx) => `
        <tr style="height: 27px; ${borderBottomStyle}">
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 4px; text-align: center; font-weight: bold; color: #2b3d22; background: ${isEconomical ? '#fff' : '#fafbf9'}; font-size: 10px;">${idx + 1}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 6px; color: #94a3b8; font-size: 9px; overflow: hidden; ${borderBottomStyle}">${dottedGuide}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 4px; text-align: center; color: #94a3b8; font-size: 9px; ${borderBottomStyle}">${tinyDottedGuide}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 6px; color: #94a3b8; font-size: 9px; ${borderBottomStyle}">${shortDottedGuide}</td>
        </tr>
      `).join('');

      chemRowsHtml = Array.from({ length: rowsCount }, (_, idx) => `
        <tr style="height: 27px; ${borderBottomStyle}">
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 4px; text-align: center; font-weight: bold; color: #1e3a8a; background: ${isEconomical ? '#fff' : '#fafbf9'}; font-size: 10px;">${idx + 1}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 6px; color: #94a3b8; font-size: 9px; overflow: hidden; ${borderBottomStyle}">${dottedGuide}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 4px; text-align: center; color: #94a3b8; font-size: 9px; ${borderBottomStyle}">${shortDottedGuide}</td>
          <td style="border: 1px solid ${isEconomical ? '#888' : '#d2d7cd'}; padding: 2px 4px; text-align: center; color: #94a3b8; font-size: 9px; ${borderBottomStyle}">${tinyDottedGuide}</td>
        </tr>
      `).join('');
    } else {
      const equip = data.equipItems?.filter(e => e.name?.trim()) || [];
      const chem = data.chemItems?.filter(c => c.name?.trim()) || [];

      if (equip.length === 0) {
        equipRowsHtml = `
          <tr>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #2b3d22;">1</td>
            <td style="border: 1px solid #e1e6d7; padding: 5px 6px; font-weight: bold; color: #0f172a;">وسائل وتجهيزات التجربة المقررة</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #2b3d22;">1</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px 6px; color: #475569; font-size: 10px;">جاهزة بالمخبر</td>
          </tr>
        `;
      } else {
        equipRowsHtml = equip.map((item, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#fcfaf6'};">
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #2b3d22; background: #fafbf9;">${idx + 1}</td>
            <td style="border: 1px solid #e1e6d7; padding: 5px 6px; font-weight: bold; color: #0f172a;">${item.name}</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #2b3d22;">${item.quantity || 1}</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px 6px; color: #475569; font-size: 10px;">${item.notes || 'جاهزة'}</td>
          </tr>
        `).join('');
      }

      if (chem.length === 0) {
        chemRowsHtml = `
          <tr>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #1e3a8a;">1</td>
            <td style="border: 1px solid #e1e6d7; padding: 5px 6px; font-weight: bold; color: #0f172a;">لا تتطلب محاليل كيميائية خاصة</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; color: #64748b; font-size: 10px;">---</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; color: #64748b; font-size: 10px;">---</td>
          </tr>
        `;
      } else {
        chemRowsHtml = chem.map((item, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#fcfaf6'};">
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #1e3a8a; background: #fafbf9;">${idx + 1}</td>
            <td style="border: 1px solid #e1e6d7; padding: 5px 6px; font-weight: bold; color: #0f172a;">${item.name}</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-mono; font-size: 10px; color: #2563eb;">${item.formula || '---'}</td>
            <td style="border: 1px solid #e1e6d7; padding: 4px; text-align: center; font-weight: bold; color: #2b3d22;">${item.quantity || 'حسب التجربة'}</td>
          </tr>
        `).join('');
      }
    }

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${title} - ${data.activityTitle || data.orderNum || 'طلب نشاط'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: ${paperSize.toUpperCase()} ${orientation};
            margin: ${marginCss};
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Amiri', 'Traditional Arabic', serif;
            margin: 0;
            padding: ${marginsType === 'none' ? '0' : '2px 4px'};
            color: #282d23;
            line-height: 1.35;
            direction: rtl;
            background: #fff;
            -webkit-print-color-adjust: ${backgroundGraphics ? 'exact' : 'economy'};
            print-color-adjust: ${backgroundGraphics ? 'exact' : 'economy'};
          }
          .republic-header {
            text-align: center;
            font-size: 14.5px;
            font-weight: 900;
            color: #1e2819;
            margin-bottom: 2px;
            font-family: 'Amiri', serif;
            letter-spacing: 0.3px;
          }
          .ministry-header {
            text-align: center;
            font-size: 12.5px;
            font-weight: 700;
            color: #3c4632;
            margin-bottom: 5px;
            font-family: 'Amiri', serif;
          }
          .institution-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 11px;
            font-weight: bold;
            color: #32382c;
            border-bottom: 1.5px solid #c8d2c3;
            padding-bottom: 6px;
            margin-bottom: 8px;
            line-height: 1.5;
            font-family: 'Amiri', serif;
          }
          .title-banner {
            background-color: #2b3d22;
            color: #ffffff;
            border-radius: 5px;
            padding: 7px 14px;
            text-align: center;
            margin: 6px 0 8px;
            box-shadow: 0 1px 3px rgba(43,61,34,0.2);
          }
          .title-banner h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.4px;
          }
          .title-banner .subtitle {
            margin: 2px 0 0;
            font-size: 10.5px;
            color: #e6f0dc;
            font-family: 'Amiri', serif;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-bottom: 8px;
          }
          .summary-card {
            background: #f5f8f2;
            border: 1px solid #d7e1cd;
            border-radius: 4px;
            padding: 4px 6px;
            text-align: center;
          }
          .summary-card .label {
            font-size: 9px;
            color: #64735f;
            font-family: 'Amiri', serif;
            margin-bottom: 1px;
          }
          .summary-card .value {
            font-size: 11px;
            font-weight: bold;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          .dual-tables-grid {
            display: flex;
            gap: 10px;
            margin: 6px 0;
          }
          .table-block {
            flex: 1;
          }
          .table-title {
            background-color: #2b3d22;
            color: #ffffff;
            padding: 4px 8px;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
            border-radius: 4px 4px 0 0;
            font-family: 'Cairo', sans-serif;
          }
          table.sub-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          table.sub-table th {
            background-color: #f5f8f2;
            color: #2b3d22;
            font-weight: bold;
            border: 1px solid #d2d7cd;
            padding: 4px;
            text-align: right;
            font-family: 'Cairo', sans-serif;
            font-size: 9.5px;
          }
          table.sub-table td {
            border: 1px solid #e1e6d7;
            padding: 4px 6px;
            vertical-align: middle;
          }
          .notes-box {
            background: #fafbf9;
            border: 1px dashed #c8d2c3;
            border-radius: 4px;
            padding: 5px 8px;
            font-size: 9.5px;
            color: #475569;
            margin: 6px 0 8px;
          }
          .release-line {
            text-align: left;
            margin: 5px 0;
            font-weight: bold;
            font-size: 11px;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          .signatures-grid {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 6px;
            text-align: center;
          }
          .sig-box {
            flex: 1;
            border: 1px solid #d2d7cd;
            border-radius: 4px;
            padding: 6px 8px;
            background: #fefefd;
            height: 76px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .sig-title {
            font-weight: bold;
            font-size: 11.5px;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          .sig-placeholder {
            color: #828c7d;
            font-size: 9.5px;
            font-family: 'Amiri', serif;
          }
          ${scale !== 100 ? `body { zoom: ${scale / 100}; }` : ''}
          .sheet-page {
            width: 100%;
            min-height: calc(100vh - 10mm);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .pages-grid-2 {
            display: grid;
            grid-template-columns: ${orientation === 'landscape' ? '1fr 1fr' : '1fr'};
            grid-template-rows: ${orientation === 'landscape' ? '1fr' : '1fr 1fr'};
            gap: 6mm;
            min-height: calc(100vh - 8mm);
            box-sizing: border-box;
          }
          .pages-grid-2 .sheet-cell {
            border: 1px dashed #ccc;
            padding: 3mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            font-size: 85%;
          }
          .pages-grid-4 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 4mm;
            min-height: calc(100vh - 6mm);
            box-sizing: border-box;
          }
          .pages-grid-4 .sheet-cell {
            border: 1px dashed #ccc;
            padding: 2.5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            font-size: 70%;
          }
          @media print {
            body {
              padding: 0;
            }
            .sheet-page {
              page-break-after: always;
            }
            .sheet-page:last-child {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${Array.from({ length: copiesCount }, (_, cIdx) => {
          const renderSheetContent = (badgeText?: string) => `
            <div>
              ${badgeText ? `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; font-size:9px; color:#666;">
                  <span style="background:#eee; padding:1px 5px; border-radius:3px; font-weight:bold;">${badgeText}</span>
                  <span>طلب نشاط تجريبي</span>
                </div>
              ` : ''}

              <!-- Official Header (Matches Algerian Daily Lab Report) -->
              ${showHeader ? `
                <div class="republic-header">${country}</div>
                <div class="ministry-header">${ministry}</div>

                <div class="institution-bar">
                  <div style="text-align: right;">
                    <div><strong>مديرية التربية:</strong> ${directorate}</div>
                    <div><strong>المؤسسة:</strong> ${formattedSchool}</div>
                  </div>
                  <div style="text-align: left;">
                    <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                    <div><strong>المخبر:</strong> ${laboratory}</div>
                  </div>
                </div>
              ` : ''}

              <!-- Document Title Banner -->
              <div class="title-banner">
                <h1>${title}</h1>
                <div class="subtitle">${subtitle}</div>
              </div>

              <!-- 8 Detailed Summary Cards (2 rows of 4) -->
              <div class="summary-cards">
                ${summaryCards.map(c => `
                  <div class="summary-card">
                    <div class="label">${c.label}</div>
                    <div class="value">${c.value}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Dual Tables Side-by-Side: الوسائل والتجهيزات | المواد الكيميائية -->
              <div class="dual-tables-grid">
                <!-- Table 1: الوسائل والتجهيزات -->
                <div class="table-block">
                  <div class="table-title">الوسائل والتجهيزات</div>
                  <table class="sub-table">
                    <thead>
                      <tr>
                        <th style="width: 25px; text-align: center;">#</th>
                        <th>الوسيلة / التجهيز المطلوب</th>
                        <th style="width: 45px; text-align: center;">الكمية</th>
                        <th style="width: 65px;">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${equipRowsHtml}
                    </tbody>
                  </table>
                </div>

                <!-- Table 2: المواد الكيميائية -->
                <div class="table-block">
                  <div class="table-title">المواد الكيميائية</div>
                  <table class="sub-table">
                    <thead>
                      <tr>
                        <th style="width: 25px; text-align: center;">#</th>
                        <th>المادة الكيميائية المطلوبة</th>
                        <th style="width: 55px; text-align: center;">الصيغة</th>
                        <th style="width: 50px; text-align: center;">الكمية</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${chemRowsHtml}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Bottom Section -->
            <div style="margin-top:auto;">
              <!-- Notice -->
              <div class="notes-box">
                <strong>ملاحظة هامة:</strong> تقدم هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل للعتاد والمحاليل.
              </div>

              <!-- Release Date: Empty writing space for blank form, exact date for filled form -->
              <div class="release-line">
                حرر بـ : ${commune} في : <span dir="ltr">${isBlank ? '<span style="display:inline-block; border-bottom: 1.5px dashed #444; width: 140px; margin-right: 6px;">&nbsp;</span>' : (data.signDate || signDate)}</span>
              </div>

              <!-- Signatures -->
              <div class="signatures-grid">
                <div class="sig-box">
                  <div class="sig-title">أستاذ(ة) المادة</div>
                  <div class="sig-placeholder">(الاسم والتوقيع)</div>
                </div>
                <div class="sig-box">
                  <div class="sig-title">${labOfficerTitle}</div>
                  <div class="sig-placeholder">(التوقيع والختم)</div>
                </div>
              </div>
            </div>
          `;

          if (pagesPerSheet === 2) {
            return `
              <div class="sheet-page pages-grid-2">
                <div class="sheet-cell">${renderSheetContent('النسخة 1: الأصلية (المخبر)')}</div>
                <div class="sheet-cell">${renderSheetContent('النسخة 2: نسخة أستاذ(ة) المادة')}</div>
              </div>
            `;
          }

          if (pagesPerSheet === 4) {
            return `
              <div class="sheet-page pages-grid-4">
                ${[1, 2, 3, 4].map(idx => `<div class="sheet-cell">${renderSheetContent(`نسخة ${idx}`)}</div>`).join('')}
              </div>
            `;
          }

          return `
            <div class="sheet-page">
              ${renderSheetContent(copiesCount > 1 ? `النسخة ${cIdx + 1} من ${copiesCount}` : undefined)}
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;
  }
}

/**
 * Standalone unified export function ready to import directly.
 */
export const exportLabReportPDF = (options: LabReportPDFOptions) => PDFService.exportLabReportPDF(options);
export const exportLabReportWord = (options: LabReportPDFOptions) => PDFService.exportLabReportWord(options);
