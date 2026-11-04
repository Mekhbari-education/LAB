import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PrintService } from './printService';
import { PrintPreviewData, DEFAULT_PRINT_SETTINGS } from '../types/printSettings';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';

export interface SchoolInfo {
  country?: string;
  ministry?: string;
  directorate?: string;
  school?: string;
  commune?: string;
  laboratory?: string;
  academicYear?: string;
}

export interface LabReportPDFOptions {
  title: string;
  subtitle?: string;
  schoolInfo?: SchoolInfo;
  headers?: string[];
  rows?: any[][];
  fileName?: string;
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  summaryCards?: { label: string; value: string | number }[];
  showSignatures?: boolean;
  notes?: string;
  labManagerTitle?: string;
  save?: boolean;
  [key: string]: any;
}

export interface DailyReportPDFOptions {
  date: string;
  reportNumber?: string;
  department?: string;
  academicYear?: string;
  location?: string;
  routing?: string;
  recipient?: string;
  sender?: string;
  signers?: string[];
  noActivities?: boolean;
  noActivitiesReason?: string;
  schoolInfo?: SchoolInfo;
  observations?: {
    labNotes?: string;
    supervisorNotes?: string;
    directorNotes?: string;
  };
  rows?: any[];
  isBlank?: boolean;
  save?: boolean;
  [key: string]: any;
}

export interface ActivityRequestPDFOptions {
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
  equipItems?: Array<{ name: string; quantity: number | string; notes?: string }>;
  chemItems?: Array<{ name: string; quantity: string; formula?: string; notes?: string }>;
  signDate?: string;
  jobTitle?: string;
  schoolInfo?: SchoolInfo;
  isBlank?: boolean;
  save?: boolean;
  [key: string]: any;
}

export interface AdminDocumentPDFOptions {
  title: string;
  formatType?: 'correspondence' | 'voucher_form' | 'minutes_pv' | 'report' | 'certificate' | 'circular_memo';
  reference?: string;
  category?: string;
  date?: string;
  sender?: string;
  recipient?: string;
  department?: string;
  academicYear?: string;
  location?: string;
  subject?: string;
  content?: string;
  notes?: string;
  closingFormula?: string;
  hasTable?: boolean;
  tableHeaders?: string[];
  tableRows?: any[][];
  signers?: string[];
  schoolInfo?: SchoolInfo;
  fileName?: string;
  save?: boolean;
  showCorrespondenceMeta?: boolean;
  showSubject?: boolean;
  showReference?: boolean;
  showApprovalBox?: boolean;
  showStampSpace?: boolean;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'a3' | 'a5' | 'letter' | 'A4' | 'A3' | 'A5' | 'Letter';
  margins?: 'compact' | 'standard' | 'spacious';
  fontSizeScale?: 'compact' | 'standard' | 'large';
  showBottomReleaseDate?: boolean;
  showTopHeaderDate?: boolean;
}

export interface LegislationSheetOptions {
  title: string;
  reference?: string;
  category?: string;
  date?: string;
  description?: string;
  fileName?: string;
  isPublic?: boolean;
}

/**
 * Algerian Educational Laboratory PDF Service
 * Generates official documents following the Algerian Ministry of National Education standards.
 */
export class PDFService {
  private static fontBase64Cache: string | null = null;
  private static fontLoadingPromise: Promise<boolean> | null = null;

  /**
   * Loads and registers the ManaraDocs Arabic font in jsPDF VFS.
   */
  static async init(doc: jsPDF): Promise<boolean> {
    try {
      if (!this.fontBase64Cache) {
        if (!this.fontLoadingPromise) {
          this.fontLoadingPromise = (async () => {
            try {
              const res = await fetch('/ManaraDocs_Amatti.ttf');
              if (!res.ok) return false;
              const arrayBuffer = await res.arrayBuffer();
              const bytes = new Uint8Array(arrayBuffer);
              let binary = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              this.fontBase64Cache = btoa(binary);
              return true;
            } catch (err) {
              console.warn('[PDFService] Failed to load ManaraDocs font file:', err);
              return false;
            }
          })();
        }
        await this.fontLoadingPromise;
      }

      if (this.fontBase64Cache) {
        doc.addFileToVFS('ManaraDocs.ttf', this.fontBase64Cache);
        doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'normal');
        doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'bold');
        doc.setFont('ManaraDocs');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PDFService] Error registering font in jsPDF:', err);
      return false;
    }
  }

  /**
   * Sanitizes and shapes Arabic string for jsPDF rendering
   */
  static processArabic(text: any): string {
    if (text === null || text === undefined) return '';
    return String(text).trim();
  }

  /**
   * Generates a lab report PDF with tables, headers, and Algerian Ministry footer
   */
  static async exportLabReportPDF(options: LabReportPDFOptions): Promise<jsPDF> {
    const isLand = options.orientation === 'l' || options.orientation === 'landscape';
    const doc = new jsPDF({
      orientation: isLand ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let currentY = 14;

    const schoolInfo = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(schoolInfo.school, schoolInfo.commune) || 'المؤسسة التعليمية';
    const directorate = schoolInfo.directorate || 'مديرية التربية لولاية';
    const academicYear = schoolInfo.academicYear || `${new Date().getFullYear() - 1} / ${new Date().getFullYear()}`;

    // Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9.5);
    doc.text(this.processArabic('وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // Subheader info
    doc.setFont(fontName, 'normal');
    doc.setFontSize(9);
    doc.text(this.processArabic(directorate), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`السنة الدراسية: ${academicYear}`), margin, currentY, { align: 'left' });
    currentY += 5;
    doc.text(this.processArabic(formattedSchool), pageWidth - margin, currentY, { align: 'right' });
    if (schoolInfo.laboratory) {
      doc.text(this.processArabic(schoolInfo.laboratory), margin, currentY, { align: 'left' });
    }
    currentY += 8;

    // Divider line
    doc.setDrawColor(65, 84, 55);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Title banner
    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic(options.title), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    if (options.subtitle) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(this.processArabic(options.subtitle), pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
    }

    // Summary Cards
    if (options.summaryCards && options.summaryCards.length > 0) {
      currentY += 2;
      const cardWidth = (pageWidth - margin * 2) / options.summaryCards.length;
      options.summaryCards.forEach((card, idx) => {
        const x = margin + idx * cardWidth;
        doc.setFillColor(248, 250, 246);
        doc.setDrawColor(210, 216, 206);
        doc.roundedRect(x + 1, currentY, cardWidth - 2, 12, 1.5, 1.5, 'FD');
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(this.processArabic(card.label), x + (cardWidth / 2), currentY + 4.5, { align: 'center' });
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(43, 61, 34);
        doc.text(this.processArabic(String(card.value)), x + (cardWidth / 2), currentY + 9.5, { align: 'center' });
      });
      currentY += 16;
    }

    // Table
    if (options.headers && options.headers.length > 0 && options.rows && options.rows.length > 0) {
      autoTable(doc, {
        head: [options.headers.map(h => this.processArabic(h))],
        body: options.rows.map(row => row.map(cell => this.processArabic(cell !== null && cell !== undefined ? cell : '—'))),
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: {
          font: fontName,
          fontSize: 8.5,
          halign: 'right',
          cellPadding: 2.5
        },
        headStyles: {
          fillColor: [43, 61, 34],
          textColor: [255, 255, 255],
          font: fontName,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 247]
        },
        theme: 'grid'
      });
      currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 30;
    }

    // Notes
    if (options.notes) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFillColor(252, 253, 250);
      doc.setDrawColor(210, 216, 206);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 1.5, 1.5, 'FD');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic('ملاحظات وإرشادات:'), pageWidth - margin - 3, currentY + 5, { align: 'right' });
      doc.setFont(fontName, 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(this.processArabic(options.notes), pageWidth - margin - 3, currentY + 10, { align: 'right' });
      currentY += 18;
    }

    // Signatures
    if (options.showSignatures !== false) {
      if (currentY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 45, 25);
      
      const showNazir = options.showNazir !== false;
      const sigCount = showNazir ? 3 : 2;
      const sigColWidth = (pageWidth - margin * 2) / sigCount;

      // 1. Right: Lab Officer
      const x1 = pageWidth - margin - (sigColWidth / 2);
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.text(this.processArabic('المسؤول عن المخبر'), x1, currentY, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.text(this.processArabic('(الاسم، التوقيع والختم)'), x1, currentY + 4.5, { align: 'center' });

      // 2. Center: Nazir
      if (showNazir) {
        const x2 = margin + (pageWidth - margin * 2) / 2;
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.text(this.processArabic('الناظر'), x2, currentY, { align: 'center' });
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7.5);
        doc.text(this.processArabic('(التوقيع والختم)'), x2, currentY + 4.5, { align: 'center' });
      }

      // 3. Left: Principal
      const x3 = margin + (sigColWidth / 2);
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.text(this.processArabic('مدير(ة) المؤسسة'), x3, currentY, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.text(this.processArabic('(التوقيع والختم)'), x3, currentY + 4.5, { align: 'center' });
    }

    if (options.save !== false) {
      doc.save(options.fileName || `${options.title.replace(/\s+/g, '_')}.pdf`);
    }

    return doc;
  }

  /**
   * Exports lab report as Word (.doc)
   */
  static exportLabReportWord(options: any): void {
    const previewData: PrintPreviewData = {
      title: options.title || 'تقرير المخبر',
      subtitle: options.subtitle,
      headers: options.headers || [],
      rows: options.rows || [],
      summaryCards: options.summaryCards,
      notes: options.notes,
      suggestedOrientation: options.orientation === 'l' || options.orientation === 'landscape' ? 'landscape' : 'portrait'
    };
    const settings: any = {
      ...DEFAULT_PRINT_SETTINGS,
      institution: {
        ...DEFAULT_PRINT_SETTINGS.institution,
        school: options.schoolInfo?.school || DEFAULT_PRINT_SETTINGS.institution.school,
        commune: options.schoolInfo?.commune || DEFAULT_PRINT_SETTINGS.institution.commune,
        directorate: options.schoolInfo?.directorate || DEFAULT_PRINT_SETTINGS.institution.directorate,
        laboratory: options.schoolInfo?.laboratory || DEFAULT_PRINT_SETTINGS.institution.laboratory,
        academicYear: options.schoolInfo?.academicYear || DEFAULT_PRINT_SETTINGS.institution.academicYear,
      }
    };
    PrintService.downloadReportWord(previewData, settings);
  }

  /**
   * Generates styled HTML document suitable for Word or rich view
   */
  static generateLabReportWordHtml(options: any): string {
    const previewData: PrintPreviewData = {
      title: options.title || 'وثيقة مخبرية رسمية',
      subtitle: options.subtitle,
      headers: options.headers || [],
      rows: options.rows || [],
      summaryCards: options.summaryCards,
      notes: options.notes,
      suggestedOrientation: options.orientation === 'l' || options.orientation === 'landscape' ? 'landscape' : 'portrait'
    };
    return PrintService.generateReportHtml(previewData);
  }

  /**
   * Generates Daily Lab Activity Report PDF (التقرير اليومي للمخبر)
   */
  static async generateDailyReportPDF(options: DailyReportPDFOptions): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = 12;

    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = options.academicYear || '2025 / 2026';
    const reportNum = options.reportNumber || '—';

    // Official Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFontSize(9);
    doc.text(this.processArabic('وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;

    // Institution Info
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.text(this.processArabic(directorate), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`السنة الدراسية: ${academicYear}`), margin, currentY, { align: 'left' });
    currentY += 4.5;
    doc.text(this.processArabic(formattedSchool), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`التاريخ: ${options.date}`), margin, currentY, { align: 'left' });
    currentY += 4.5;
    doc.text(this.processArabic(options.department || 'مخبر العلوم الفيزيائية والطبيعية'), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`رقم التقرير: ${reportNum}`), margin, currentY, { align: 'left' });
    currentY += 7;

    // Divider
    doc.setDrawColor(65, 84, 55);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Title
    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic('التقرير اليومي لسير الأنشطة المخبرية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    if (options.noActivities) {
      // Zero activities banner
      doc.setFillColor(254, 249, 235);
      doc.setDrawColor(217, 119, 6);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(180, 83, 9);
      doc.text(this.processArabic('نموذج خاص: يوم بدون أنشطة تطبيقية'), pageWidth / 2, currentY + 8, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 53, 15);
      const reason = options.noActivitiesReason || 'لا توجد أنشطة تطبيقية مبرمجة لهذا اليوم بالمخبر';
      doc.text(this.processArabic(reason), pageWidth / 2, currentY + 16, { align: 'center' });
      currentY += 28;
    } else {
      // Activity Sessions Table
      const headers = ['رقم', 'الأستاذ(ة)', 'المادة', 'التوقيت', 'الفوج', 'عنوان النشاط', 'الوسائل المستعملة'];
      const rawRows = options.rows || [];
      const tableRows = rawRows.map((r: any, idx: number) => [
        String(idx + 1),
        this.processArabic(r.teacher || '—'),
        this.processArabic(r.teacherSubject || '—'),
        this.processArabic(r.time || '—'),
        this.processArabic(r.class || '—'),
        this.processArabic(r.activityTitle || '—'),
        this.processArabic(r.equipment || '—')
      ]);

      autoTable(doc, {
        head: [headers.map(h => this.processArabic(h))],
        body: tableRows.length > 0 ? tableRows : [[
          '1', '—', '—', '—', '—', 'لا توجد حصص مسجلة', '—'
        ]],
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: {
          font: fontName,
          fontSize: 7.5,
          halign: 'right',
          cellPadding: 2
        },
        headStyles: {
          fillColor: [43, 61, 34],
          textColor: [255, 255, 255],
          font: fontName,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 247]
        },
        theme: 'grid'
      });
      currentY = (doc as any).lastAutoTable?.finalY + 6 || currentY + 30;
    }

    // Observations
    const obs = options.observations || {};
    const hasObs = obs.labNotes || obs.supervisorNotes || obs.directorNotes;
    if (hasObs) {
      if (currentY > doc.internal.pageSize.getHeight() - 45) {
        doc.addPage();
        currentY = 16;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic('الملاحظات والتوجيهات:'), pageWidth - margin, currentY, { align: 'right' });
      currentY += 4;

      if (obs.labNotes) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.text(this.processArabic(`• ملاحظات مسؤول المخبر: ${obs.labNotes}`), pageWidth - margin, currentY, { align: 'right' });
        currentY += 4.5;
      }
      if (obs.supervisorNotes) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.text(this.processArabic(`• ملاحظات وتأشيرة الناظر: ${obs.supervisorNotes}`), pageWidth - margin, currentY, { align: 'right' });
        currentY += 4.5;
      }
      if (obs.directorNotes) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.text(this.processArabic(`• ملاحظات مدير المؤسسة: ${obs.directorNotes}`), pageWidth - margin, currentY, { align: 'right' });
        currentY += 4.5;
      }
      currentY += 4;
    }

    // Signatures
    if (currentY > doc.internal.pageSize.getHeight() - 32) {
      doc.addPage();
      currentY = 16;
    }
    const sigColWidth = (pageWidth - margin * 2) / 3;
    const signers = options.signers || ['المسؤول عن المخبر', 'الناظر', 'مدير المؤسسة'];
    
    doc.setFont(fontName, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 45, 25);
    signers.forEach((s, i) => {
      const centerX = margin + i * sigColWidth + (sigColWidth / 2);
      doc.text(this.processArabic(s), centerX, currentY, { align: 'center' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7);
      doc.text(this.processArabic('(التوقيع والختم)'), centerX, currentY + 4, { align: 'center' });
    });

    if (options.save !== false) {
      doc.save(`التقرير_اليومي_${options.date}.pdf`);
    }

    return doc;
  }

  /**
   * Generates Daily Report Word document
  /**
   * Generates Microsoft Word document HTML for the Daily Report matching the official PDF layout identically
   */
  static generateDailyReportWordHtml(options: DailyReportPDFOptions): string {
    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية أم البواقي';
    const academicYear = options.academicYear || '2025 / 2026';
    const reportNum = options.reportNumber || '01';
    const activeDate = options.date || new Date().toISOString().split('T')[0];
    const dept = options.department || 'مخبر العلوم الفيزيائية والطبيعية';
    const isNoAct = Boolean(options.noActivities);
    const noActReason = options.noActivitiesReason || 'لا توجد أنشطة تطبيقية مبرمجة لهذا اليوم بالمخبر';
    const rawRows = options.rows || [];

    const labNotes = options.observations?.labNotes?.trim() || '';
    const supervisorNotes = options.observations?.supervisorNotes?.trim() || '';
    const directorNotes = options.observations?.directorNotes?.trim() || '';

    const signers = options.signers && options.signers.length > 0 
      ? options.signers 
      : [options.sender || 'المسؤول عن المخبر', 'الناظر', 'مدير المؤسسة'];

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 210mm 297mm;
            mso-page-orientation: portrait;
            margin: 12mm;
            mso-header-margin: 10mm;
            mso-footer-margin: 10mm;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Cairo', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 10pt;
            color: #1a1a1a;
            line-height: 1.5;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          <!-- Official Header -->
          <p style="text-align: center; font-weight: bold; font-size: 11.5pt; color: #1e2d19; margin: 0 0 2pt 0;">
            الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 10pt; color: #415437; margin: 0 0 8pt 0;">
            وزارة التربية الوطنية
          </p>

          <!-- Institution Metadata -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 6pt; border: none;">
            <tr>
              <td style="text-align: right; width: 55%; font-size: 9pt; vertical-align: top; border: none;">
                <div>${directorate}</div>
                <div>${formattedSchool}</div>
                <div><strong>المصلحة / المخبر:</strong> ${dept}</div>
              </td>
              <td style="text-align: left; width: 45%; font-size: 9pt; vertical-align: top; border: none;" dir="rtl">
                <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                <div><strong>تاريخ اليوم:</strong> ${activeDate}</div>
                <div><strong>رقم التقرير:</strong> ${reportNum}</div>
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1.5pt solid #2b3d22; margin: 4pt 0 8pt 0;" />

          <!-- Title Banner -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 10pt; border: none;">
            <tr>
              <td style="background-color: #2b3d22; color: #ffffff; text-align: center; padding: 6pt 10pt; border-radius: 4pt;">
                <h1 style="font-size: 13pt; font-weight: bold; margin: 0; color: #ffffff;">التقرير اليومي لسير الأنشطة المخبرية</h1>
              </td>
            </tr>
          </table>

          ${isNoAct ? `
            <!-- Special Amber Box for Zero Activities -->
            <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 12pt; background-color: #fef9eb; border: 2pt solid #d97706; border-radius: 4pt;">
              <tr>
                <td style="padding: 12pt 16pt; text-align: center;">
                  <h2 style="font-size: 13pt; font-weight: bold; color: #b45309; margin: 0 0 6pt 0;">
                    نموذج خاص: يوم بدون أنشطة تطبيقية
                  </h2>
                  <p style="font-size: 10.5pt; color: #78350f; font-weight: bold; margin: 0 0 6pt 0;">
                    ${noActReason}
                  </p>
                  <p style="font-size: 9.5pt; color: #92400e; margin: 0;">
                    تم استغلال هذا اليوم في أعمال الصيانة الدورية، جرد الوسائل وتنظيم المخزن وتحضير الكواشف والمحاليل للدروس المقبلة.
                  </p>
                </td>
              </tr>
            </table>
          ` : `
            <!-- Summary Metric Cards -->
            <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 10pt; border: none;">
              <tr>
                <td style="width: 33.3%; text-align: center; padding: 6pt; background-color: #f4f6f2; border: 1pt solid #d2d8ce;">
                  <div style="font-size: 8.5pt; color: #666;">رقم التقرير</div>
                  <div style="font-size: 12pt; font-weight: bold; color: #2b3d22;">${reportNum}</div>
                </td>
                <td style="width: 33.3%; text-align: center; padding: 6pt; background-color: #f4f6f2; border: 1pt solid #d2d8ce;">
                  <div style="font-size: 8.5pt; color: #666;">إجمالي الحصص المنجزة</div>
                  <div style="font-size: 12pt; font-weight: bold; color: #2b3d22;">${rawRows.length}</div>
                </td>
                <td style="width: 33.3%; text-align: center; padding: 6pt; background-color: #f4f6f2; border: 1pt solid #d2d8ce;">
                  <div style="font-size: 8.5pt; color: #666;">تاريخ النشاط</div>
                  <div style="font-size: 12pt; font-weight: bold; color: #2b3d22;">${activeDate}</div>
                </td>
              </tr>
            </table>

            <!-- Activity Sessions Table -->
            <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 12pt; border: 1.5pt solid #2b3d22;">
              <thead>
                <tr style="background-color: #2b3d22; color: #ffffff;">
                  <th style="border: 1pt solid #415437; padding: 6pt 4pt; width: 28pt; text-align: center; color: #ffffff; font-weight: bold; font-size: 9.5pt;">رقم</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 6pt; text-align: right; color: #ffffff; font-weight: bold; font-size: 9.5pt;">الأستاذ(ة)</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 6pt; text-align: center; width: 65pt; color: #ffffff; font-weight: bold; font-size: 9.5pt;">المادة</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 6pt; text-align: center; width: 55pt; color: #ffffff; font-weight: bold; font-size: 9.5pt;">التوقيت</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 6pt; text-align: center; width: 50pt; color: #ffffff; font-weight: bold; font-size: 9.5pt;">الفوج</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 8pt; text-align: right; color: #ffffff; font-weight: bold; font-size: 9.5pt;">عنوان النشاط التجريبي</th>
                  <th style="border: 1pt solid #415437; padding: 6pt 8pt; text-align: right; color: #ffffff; font-weight: bold; font-size: 9.5pt;">الوسائل والتجهيزات المستعملة</th>
                </tr>
              </thead>
              <tbody>
                ${rawRows.map((r: any, idx: number) => `
                  <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9faf7'};">
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 4pt; text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 6pt; text-align: right; font-weight: bold;">${r.teacher || '—'}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 6pt; text-align: center;">${r.teacherSubject || '—'}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 6pt; text-align: center;">${r.time || '—'}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 6pt; text-align: center;">${r.class || '—'}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 8pt; text-align: right;">${r.activityTitle || '—'}</td>
                    <td style="border: 1pt solid #d2d8ce; padding: 5pt 8pt; text-align: right;">${r.equipment || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <!-- Observations Table (3 Official Sections) -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 14pt; border: 1pt solid #d2d8ce;">
            <tr>
              <td style="width: 33.3%; padding: 6pt 8pt; border: 1pt solid #d2d8ce; vertical-align: top; background-color: #fcfdfb;">
                <div style="font-weight: bold; font-size: 9.5pt; color: #2b3d22; border-bottom: 1pt solid #e2e8de; padding-bottom: 3pt; margin-bottom: 4pt;">
                  ملاحظات مسير المخبر:
                </div>
                <div style="font-size: 8.5pt; color: #444; min-height: 40pt;">
                  ${labNotes || 'تمت جميع التجارب في ظروف عادية ووفق معايير السلامة والأمن المخبري.'}
                </div>
              </td>
              <td style="width: 33.3%; padding: 6pt 8pt; border: 1pt solid #d2d8ce; vertical-align: top; background-color: #fcfdfb;">
                <div style="font-weight: bold; font-size: 9.5pt; color: #2b3d22; border-bottom: 1pt solid #e2e8de; padding-bottom: 3pt; margin-bottom: 4pt;">
                 وملاحظات السيد الناظر:
                </div>
                <div style="font-size: 8.5pt; color: #444; min-height: 40pt;">
                  ${supervisorNotes || 'شوهد وتمت المطابقة مع جداول توقيت المخابر.'}
                </div>
              </td>
              <td style="width: 33.3%; padding: 6pt 8pt; border: 1pt solid #d2d8ce; vertical-align: top; background-color: #fcfdfb;">
                <div style="font-weight: bold; font-size: 9.5pt; color: #2b3d22; border-bottom: 1pt solid #e2e8de; padding-bottom: 3pt; margin-bottom: 4pt;">
                 وملاحظات السيد مدير المؤسسة:
                </div>
                <div style="font-size: 8.5pt; color: #444; min-height: 40pt;">
                  ${directorNotes || 'اطُّلِع عليه، ويُصادَق على السير البيداغوجي للمخبر.'}
                </div>
              </td>
            </tr>
          </table>

          <!-- Official Signatures Block with Round Stamp Placeholder -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 14pt; margin-bottom: 16pt;">
            <tr>
              ${signers.map(sig => `
                <td style="width: ${Math.floor(100 / signers.length)}%; text-align: center; vertical-align: top; padding: 6pt; border: 1pt dashed #889980; background-color: #fcfdfb;">
                  <div style="font-weight: bold; font-size: 10pt; color: #2b3d22; border-bottom: 1pt solid #e0e5dc; padding-bottom: 3pt; margin-bottom: 6pt;">
                    ${sig}
                  </div>
                  <div style="font-size: 8.5pt; color: #888888; height: 30pt; padding-top: 6pt;">
                    (الاسم، التوقيع والختم)
                  </div>
                  <div style="margin: 6pt auto 4pt auto; width: 50pt; height: 50pt; border: 1pt dotted #a3b09d; border-radius: 50%; text-align: center; padding-top: 16pt; font-size: 7.5pt; color: #778873;">
                    موضع الختم الرسمي
                  </div>
                </td>
              `).join('')}
            </tr>
          </table>

          <!-- Footer -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 12pt; border-top: 1pt solid #d2d8ce;">
            <tr>
              <td style="text-align: right; font-size: 8pt; color: #777; padding-top: 4pt; border: none;">
                الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية
              </td>
              <td style="text-align: center; font-size: 8pt; color: #777; padding-top: 4pt; border: none;">
                ${formattedSchool}
              </td>
              <td style="text-align: left; font-size: 8pt; color: #777; padding-top: 4pt; border: none;">
                صفحة 1 من 1
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Downloads Microsoft Word document (.doc) for the Daily Report matching the official PDF layout
   */
  static generateDailyReportWord(options: DailyReportPDFOptions): void {
    const html = this.generateDailyReportWordHtml(options);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = `التقرير_اليومي_للمخبر_${options.date || 'اليوم'}`.replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generates Activity Request PDF (طلب تحضير نشاط تجريبي / تطبيقي)
   * With official Algerian lab rank signature block (الملحق الرئيس بالمخابر / التوقيع والختم).
   */
  static async generateActivityRequestPDF(options: ActivityRequestPDFOptions): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = 12;

    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const isBlank = Boolean(options.isBlank);

    // Official Algerian Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFontSize(9);
    doc.text(this.processArabic('وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;

    // Side details
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.text(this.processArabic(directorate), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`السنة الدراسية: ${school.academicYear || '2025 / 2026'}`), margin, currentY, { align: 'left' });
    currentY += 4.5;
    doc.text(this.processArabic(formattedSchool), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`رقم الطلب: ${options.orderNum || '—'}`), margin, currentY, { align: 'left' });
    currentY += 7;

    // Divider
    doc.setDrawColor(65, 84, 55);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Document Title
    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic('طلب تحضير نشاط تجريبي / مخبري'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    // Metadata Grid (Teacher, Date, Class, Title...)
    doc.setFillColor(248, 250, 246);
    doc.setDrawColor(210, 216, 206);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 1.5, 1.5, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(43, 61, 34);

    const halfW = (pageWidth - margin * 2) / 2;
    doc.text(this.processArabic(`أستاذ(ة) المادة: ${isBlank ? '...........................' : (options.teacherName || '—')}`), pageWidth - margin - 4, currentY + 5.5, { align: 'right' });
    doc.text(this.processArabic(`تاريخ الإجراء: ${isBlank ? '....../....../202...' : (options.executionDate || options.requestDate || '—')}`), margin + halfW - 4, currentY + 5.5, { align: 'right' });
    
    doc.text(this.processArabic(`القسم / الفوج: ${isBlank ? '...........................' : (options.className || '—')}`), pageWidth - margin - 4, currentY + 11.5, { align: 'right' });
    doc.text(this.processArabic(`التوقيت: ${isBlank ? '.... : ....' : (options.timing || '—')}`), margin + halfW - 4, currentY + 11.5, { align: 'right' });

    doc.text(this.processArabic(`عنوان النشاط التجريبي: ${isBlank ? '..........................................................' : (options.activityTitle || '—')}`), pageWidth - margin - 4, currentY + 17.5, { align: 'right' });
    currentY += 26;

    // Equipment Table
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic('1. قائمة الأجهزة والوسائل المخبرية المطلوبة:'), pageWidth - margin, currentY, { align: 'right' });
    currentY += 3;

    const equipRows = isBlank
      ? Array(4).fill(['', '', ''])
      : (options.equipItems || []).map((e: any, idx: number) => [
          String(idx + 1),
          this.processArabic(e.name || '—'),
          this.processArabic(String(e.quantity || 1)),
          this.processArabic(e.notes || 'جاهزة للاستعمال')
        ]);

    autoTable(doc, {
      head: [['رقم', 'اسم الجهاز / الوسيلة', 'الكمية', 'ملاحظات وحالة العتاد'].map(h => this.processArabic(h))],
      body: equipRows.length > 0 ? equipRows : [['1', '—', '—', '—']],
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: fontName, fontSize: 8, halign: 'right', cellPadding: 2 },
      headStyles: { fillColor: [43, 61, 34], textColor: [255, 255, 255], font: fontName, fontStyle: 'bold', halign: 'center' },
      theme: 'grid'
    });
    currentY = (doc as any).lastAutoTable?.finalY + 6 || currentY + 25;

    // Chemicals Table
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic('2. قائمة المواد الكيميائية والمحاليل المستعملة:'), pageWidth - margin, currentY, { align: 'right' });
    currentY += 3;

    const chemRows = isBlank
      ? Array(3).fill(['', '', '', ''])
      : (options.chemItems || []).map((c: any, idx: number) => [
          String(idx + 1),
          this.processArabic(c.name || '—'),
          this.processArabic(c.formula || '—'),
          this.processArabic(String(c.quantity || '—')),
          this.processArabic(c.notes || '—')
        ]);

    autoTable(doc, {
      head: [['رقم', 'اسم المادة الكيميائية', 'الصيغة', 'الكمية المطلوبة', 'ملاحظات واحتياطات'].map(h => this.processArabic(h))],
      body: chemRows.length > 0 ? chemRows : [['1', '—', '—', '—', '—']],
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: fontName, fontSize: 8, halign: 'right', cellPadding: 2 },
      headStyles: { fillColor: [65, 84, 55], textColor: [255, 255, 255], font: fontName, fontStyle: 'bold', halign: 'center' },
      theme: 'grid'
    });
    currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 25;

    // Signature Blocks
    if (currentY > doc.internal.pageSize.getHeight() - 35) {
      doc.addPage();
      currentY = 16;
    }

    const officerRankTitle = options.jobTitle || 'الملحق الرئيس بالمخابر';

    // Right: Teacher signature
    const sigBoxWidth = 70;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('أستاذ(ة) المادة'), pageWidth - margin - (sigBoxWidth / 2), currentY, { align: 'center' });
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.5);
    doc.text(this.processArabic('(الاسم والتوقيع)'), pageWidth - margin - (sigBoxWidth / 2), currentY + 4.5, { align: 'center' });

    // Left: Lab Officer (Requested by user: Official rank + التوقيع والختم)
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9);
    doc.text(this.processArabic(officerRankTitle), margin + (sigBoxWidth / 2), currentY, { align: 'center' });
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.5);
    doc.text(this.processArabic('(التوقيع والختم)'), margin + (sigBoxWidth / 2), currentY + 4.5, { align: 'center' });

    if (options.save !== false) {
      doc.save(`طلب_نشاط_مخبري_${options.orderNum?.replace(/\//g, '_') || ''}.pdf`);
    }

    return doc;
  }

  /**
   * Generates Activity Request Word document matching HTML and PDF layout identically
   */
  static generateActivityRequestWord(options: any): void {
    const rawHtml = this.generateActivityRequestHtml(options);
    const bodyContent = rawHtml
      .replace(/<!DOCTYPE html>[\s\S]*?<div class="sheet">/, '')
      .replace(/<\/div>\s*<\/body>\s*<\/html>[\s\S]*$/, '');

    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 210mm 297mm;
            mso-page-orientation: portrait;
            margin: 12mm;
            mso-header-margin: 10mm;
            mso-footer-margin: 10mm;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Cairo', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 10pt;
            color: #1a1a1a;
            line-height: 1.4;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          ${bodyContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = `طلب_نشاط_مخبري_${options.teacherName || 'استمارة'}`.replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generates complete, styled HTML string for Activity Request print preview modal
   */
  static generateActivityRequestHtml(options: any): string {
    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const isBlank = Boolean(options.isBlank);
    const officerRank = options.jobTitle || 'الملحق الرئيس بالمخابر';

    const equipItems = options.equipItems || [];
    const chemItems = options.chemItems || [];

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>طلب تحضير نشاط مخبري — ${options.orderNum || ''}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; color: #1a1a1a; direction: rtl; font-size: 11pt; line-height: 1.4; }
    .sheet { width: 100%; margin: 0 auto; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .header-table td { vertical-align: top; }
    .rep-title { text-align: center; font-weight: 800; font-size: 11.5pt; color: #1b2e17; }
    .min-title { text-align: center; font-weight: 700; font-size: 10pt; color: #2e4d27; }
    .doc-title-box { text-align: center; margin: 12px 0; padding: 8px; border: 2px solid #2b3d22; background: #f4f6f2; border-radius: 6px; }
    .doc-title { font-size: 14pt; font-weight: 900; color: #2b3d22; margin: 0; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; background: #fafbf9; border: 1px solid #d2d8ce; border-radius: 6px; }
    .info-grid td { padding: 5px 10px; font-size: 9.5pt; border: 1px solid #e2e6de; }
    .info-label { font-weight: 700; color: #2b3d22; }
    .table-title { font-weight: 800; font-size: 10.5pt; color: #2b3d22; margin: 10px 0 4px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    table.data-table th { background-color: #2b3d22; color: #ffffff; padding: 6px 8px; font-size: 9pt; border: 1px solid #2b3d22; text-align: center; }
    table.data-table td { padding: 5px 8px; font-size: 9pt; border: 1px solid #d2d8ce; text-align: right; }
    table.data-table tr:nth-child(even) td { background-color: #f9faf7; }
    .signatures-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
    .signatures-table td { width: 50%; vertical-align: top; text-align: center; padding: 10px; }
    .sig-rank { font-weight: 800; font-size: 11pt; color: #2b3d22; margin-bottom: 4px; }
    .sig-sub { font-size: 8.5pt; color: #666; }
    .sig-box { min-height: 70px; border: 1px dashed #b8c2b0; border-radius: 6px; margin-top: 6px; padding: 8px; background: #fafbf8; }
  </style>
</head>
<body>
  <div class="sheet">
    <table class="header-table">
      <tr>
        <td style="text-align: right; width: 33%;">
          <div style="font-weight: 700;">${directorate}</div>
          <div style="font-weight: 800; color: #2b3d22;">${formattedSchool}</div>
          <div style="font-size: 8.5pt; color: #666;">مخبر العلوم الطبيعية والفيزيائية</div>
        </td>
        <td style="text-align: center; width: 34%;">
          <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
          <div class="min-title">وزارة التربية الوطنية</div>
        </td>
        <td style="text-align: left; width: 33%;">
          <div style="font-size: 9pt;">السنة الدراسية: <strong>${school.academicYear || '2025 / 2026'}</strong></div>
          <div style="font-size: 9pt;">رقم الطلب: <strong>${options.orderNum || '—'}</strong></div>
          <div style="font-size: 8.5pt; color: #666;">تاريخ التحرير: ${options.requestDate || '—'}</div>
        </td>
      </tr>
    </table>

    <div class="doc-title-box">
      <h1 class="doc-title">طلب تحضير نشاط تجريبي / مخبري</h1>
    </div>

    <table class="info-grid">
      <tr>
        <td><span class="info-label">أستاذ(ة) المادة:</span> ${isBlank ? '................................................' : (options.teacherName || '—')}</td>
        <td><span class="info-label">تاريخ الإجراء:</span> ${isBlank ? '....... / ....... / 202...' : (options.executionDate || options.requestDate || '—')}</td>
        <td><span class="info-label">التوقيت:</span> ${isBlank ? '....... : .......' : (options.timing || '—')}</td>
      </tr>
      <tr>
        <td><span class="info-label">القسم / الفوج:</span> ${isBlank ? '................................................' : (options.className || '—')}</td>
        <td><span class="info-label">نوع النشاط:</span> ${options.activityType || 'عملي'}</td>
        <td><span class="info-label">المخبر المبرمج:</span> ${options.lab || 'مخبر العلوم'}</td>
      </tr>
      <tr>
        <td colspan="3"><span class="info-label">عنوان النشاط المخبري:</span> <strong>${isBlank ? '................................................................................................................' : (options.activityTitle || '—')}</strong></td>
      </tr>
    </table>

    <div class="table-title">1. قائمة الأجهزة والوسائل والزجاجيات المطلوبة:</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 8%;">الرقم</th>
          <th style="width: 50%;">اسم الجهاز / الوسيلة</th>
          <th style="width: 15%;">الكمية المطلوبة</th>
          <th style="width: 27%;">ملاحظات وحالة العتاد</th>
        </tr>
      </thead>
      <tbody>
        ${isBlank ? Array(5).fill(0).map((_, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td></td>
            <td style="text-align: center;"></td>
            <td></td>
          </tr>
        `).join('') : (equipItems.length > 0 ? equipItems.map((e: any, i: number) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="font-weight: 600;">${e.name || '—'}</td>
            <td style="text-align: center; font-weight: 700;">${e.quantity || 1}</td>
            <td>${e.notes || 'صالحة وجاهزة للتجربة'}</td>
          </tr>
        `).join('') : `<tr><td colspan="4" style="text-align:center;">لا توجد أجهزة مضافة</td></tr>`)}
      </tbody>
    </table>

    <div class="table-title">2. قائمة المواد الكيميائية والمحاليل المستعملة:</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 8%;">الرقم</th>
          <th style="width: 40%;">اسم المادة الكيميائية</th>
          <th style="width: 20%;">الصيغة الكيميائية</th>
          <th style="width: 15%;">الكمية المطلوبة</th>
          <th style="width: 17%;">ملاحظات السلامة</th>
        </tr>
      </thead>
      <tbody>
        ${isBlank ? Array(4).fill(0).map((_, i) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td></td>
            <td></td>
            <td style="text-align: center;"></td>
            <td></td>
          </tr>
        `).join('') : (chemItems.length > 0 ? chemItems.map((c: any, i: number) => `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="font-weight: 600;">${c.name || '—'}</td>
            <td style="direction: ltr; text-align: center; font-family: monospace;">${c.formula || '—'}</td>
            <td style="text-align: center; font-weight: 700;">${c.quantity || '—'}</td>
            <td>${c.notes || '—'}</td>
          </tr>
        `).join('') : `<tr><td colspan="5" style="text-align:center;">لا توجد مواد كيميائية مضافة</td></tr>`)}
      </tbody>
    </table>

    <table class="signatures-table">
      <tr>
        <td>
          <div class="sig-rank">أستاذ(ة) المادة</div>
          <div class="sig-sub">(الاسم والتوقيع)</div>
          <div class="sig-box">
            <div style="font-size: 8pt; color: #777; text-align: right;">حرر في: ${options.signDate || options.requestDate || '.................'}</div>
          </div>
        </td>
        <td>
          <div class="sig-rank">${officerRank}</div>
          <div class="sig-sub">(التوقيع والختم)</div>
          <div class="sig-box">
            <div style="font-size: 8pt; color: #777; text-align: right;"> استلام وتحضير العتاد</div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generates Official Administrative Internal Document PDF (سند طلب داخلي / مراسلة إدارية)
   * Returns Promise<Blob> as required by callers
   */
  static async generateAdministrativeDocumentPDF(options: AdminDocumentPDFOptions): Promise<Blob> {
    const orientation = options.orientation || 'portrait';
    const paperSize = (options.paperSize || 'a4').toLowerCase();
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: paperSize as any,
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Dynamic margin calculation
    let margin = 14;
    if (options.margins === 'compact') margin = 10;
    else if (options.margins === 'spacious') margin = 18;

    let currentY = margin;

    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = options.academicYear || school.academicYear || '2025 / 2026';
    const fmt = options.formatType || 'correspondence';
    const hasBottomRelease = options.showBottomReleaseDate !== false;

    // Header - Official Republic & Ministry
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic(school.country || 'الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFontSize(9);
    doc.text(this.processArabic(school.ministry || 'وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;

    // School and date lines
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.text(this.processArabic(directorate), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(`السنة الدراسية: ${academicYear}`), margin, currentY, { align: 'left' });
    currentY += 4.5;
    doc.text(this.processArabic(formattedSchool), pageWidth - margin, currentY, { align: 'right' });
    if (!hasBottomRelease || options.showTopHeaderDate) {
      doc.text(this.processArabic(`التاريخ: ${options.date || new Date().toISOString().split('T')[0]}`), margin, currentY, { align: 'left' });
    }
    currentY += 4.5;
    if (options.department) {
      doc.text(this.processArabic(options.department), pageWidth - margin, currentY, { align: 'right' });
    }
    if (options.reference && options.showReference !== false) {
      doc.text(this.processArabic(`الرقم: ${options.reference}`), margin, currentY, { align: 'left' });
    }
    currentY += 6;

    // Dividing Line
    doc.setDrawColor(65, 84, 55);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6.5;

    // Document Title Banner
    doc.setFont(fontName, 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic(options.title), pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    // Context / Format-Specific Block
    const showCorresp = options.showCorrespondenceMeta !== false;
    if (fmt === 'correspondence' && showCorresp && (options.sender || options.recipient || options.subject)) {
      doc.setFillColor(248, 250, 246);
      doc.setDrawColor(210, 216, 206);
      const boxHeight = (options.subject && options.showSubject !== false) ? 18 : 11;
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxHeight, 1.5, 1.5, 'FD');
      
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(43, 61, 34);
      if (options.sender) {
        doc.text(this.processArabic(`من: ${options.sender}`), pageWidth - margin - 4, currentY + 5.5, { align: 'right' });
      }
      if (options.recipient) {
        doc.text(this.processArabic(`إلى: ${options.recipient}`), margin + (pageWidth - margin * 2) / 2 - 4, currentY + 5.5, { align: 'right' });
      }
      if (options.subject && options.showSubject !== false) {
        doc.text(this.processArabic(`الموضوع: ${options.subject}`), pageWidth - margin - 4, currentY + 13, { align: 'right' });
      }
      currentY += boxHeight + 5;
    } else if (fmt === 'voucher_form') {
      // Slip / Form header box (طالب السند، المصلحة، التاريخ)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 1.5, 1.5, 'FD');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      if (options.sender) {
        doc.text(this.processArabic(`طالب السند / المسؤول: ${options.sender}`), pageWidth - margin - 4, currentY + 4.5, { align: 'right' });
      }
      if (options.department) {
        doc.text(this.processArabic(`المصلحة / المخبر: ${options.department}`), margin + (pageWidth - margin * 2) / 2 - 4, currentY + 4.5, { align: 'right' });
      }
      if (options.reference && options.showReference !== false) {
        doc.text(this.processArabic(`سند رقم: ${options.reference}`), pageWidth - margin - 4, currentY + 9, { align: 'right' });
      }
      if (options.subject && options.showSubject !== false) {
        doc.text(this.processArabic(`الغرض: ${options.subject}`), margin + (pageWidth - margin * 2) / 2 - 4, currentY + 9, { align: 'right' });
      }
      currentY += 16;
    } else if (fmt === 'circular_memo' && (options.recipient || options.subject)) {
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(204, 251, 241);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 1.5, 1.5, 'FD');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 118, 110);
      if (options.recipient) {
        doc.text(this.processArabic(`موجهة إلى: ${options.recipient}`), pageWidth - margin - 4, currentY + 5, { align: 'right' });
      }
      if (options.subject && options.showSubject !== false) {
        doc.text(this.processArabic(`الموضوع: ${options.subject}`), pageWidth - margin - 4, currentY + 9.5, { align: 'right' });
      }
      currentY += 16;
    } else if (options.subject && options.showSubject !== false && fmt !== 'correspondence') {
      // Small simple subject line
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic(`الموضوع: ${options.subject}`), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
    }

    // Main Content
    if (options.content) {
      doc.setFont(fontName, 'normal');
      const baseFontSize = options.fontSizeScale === 'compact' ? 8.5 : options.fontSizeScale === 'large' ? 10.5 : 9.5;
      doc.setFontSize(baseFontSize);
      doc.setTextColor(40, 40, 40);
      const splitContent = doc.splitTextToSize(this.processArabic(options.content), pageWidth - margin * 2);
      doc.text(splitContent, pageWidth - margin, currentY, { align: 'right' });
      currentY += splitContent.length * 5 + 6;
    }

    // Table
    if (options.hasTable && options.tableHeaders && options.tableRows && options.tableRows.length > 0) {
      autoTable(doc, {
        head: [options.tableHeaders.map(h => this.processArabic(h))],
        body: options.tableRows.map(row => row.map(c => this.processArabic(c !== null && c !== undefined ? c : '—'))),
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: { font: fontName, fontSize: 8.5, halign: 'right', cellPadding: 2.5 },
        headStyles: { fillColor: [43, 61, 34], textColor: [255, 255, 255], font: fontName, fontStyle: 'bold', halign: 'center' },
        theme: 'grid'
      });
      currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 30;
    }

    // Notes
    if (options.notes) {
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic('ملاحظات:'), pageWidth - margin, currentY, { align: 'right' });
      doc.setFont(fontName, 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text(this.processArabic(options.notes), pageWidth - margin - 15, currentY, { align: 'right' });
      currentY += 8;
    }

    // Closing Formula
    if (options.closingFormula && options.closingFormula !== 'بدون عبارة ختامية') {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(this.processArabic(options.closingFormula), pageWidth - margin - 6, currentY, { align: 'right' });
      currentY += 7;
    }

    // Approval / Decision Box (Optional)
    if (options.showApprovalBox) {
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = margin;
      }
      doc.setDrawColor(180, 195, 175);
      doc.setFillColor(252, 253, 250);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 1.5, 1.5, 'FD');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic('قرار وختم إدارة المؤسسة:'), pageWidth - margin - 4, currentY + 5, { align: 'right' });
      doc.setFont(fontName, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(this.processArabic('[   ] موافقة تامة         [   ] موافقة مع تحفظ         [   ] مرفوض'), pageWidth - margin - 50, currentY + 5, { align: 'right' });
      doc.text(this.processArabic('الملاحظات: ............................................................................   التاريخ والتوقيع: ................................'), pageWidth - margin - 4, currentY + 10.5, { align: 'right' });
      currentY += 19;
    }

    // Drafting Location and Date Formula (حرر بـ ... في ...)
    if (hasBottomRelease) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const loc = options.location || 'عين كرشة';
      const dt = options.date || new Date().toISOString().split('T')[0];
      doc.text(this.processArabic(`حرر بـ : ${loc} في : ${dt}`), margin, currentY + 3, { align: 'left' });
      currentY += 10;
    }

    // Signers and Official Stamps
    if (options.signers && options.signers.length > 0) {
      if (currentY > pageHeight - 38) {
        doc.addPage();
        currentY = margin;
      }
      const count = options.signers.length;
      const colW = (pageWidth - margin * 2) / count;
      options.signers.forEach((sig, idx) => {
        const x = margin + idx * colW + (colW / 2);
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 45, 25);
        doc.text(this.processArabic(sig), x, currentY, { align: 'center' });
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7.5);
        doc.text(this.processArabic('(التوقيع والختم)'), x, currentY + 4.5, { align: 'center' });

        if (options.showStampSpace) {
          doc.setDrawColor(200, 210, 200);
          doc.circle(x, currentY + 15, 7, 'S');
          doc.setFontSize(6.5);
          doc.setTextColor(140, 150, 140);
          doc.text(this.processArabic('موضع الختم الرسمي'), x, currentY + 15.5, { align: 'center' });
        }
      });
    }

    if (options.save === true) {
      doc.save(options.fileName || `${options.title}.pdf`);
    }

    return doc.output('blob');
  }

  /**
   * Generates Microsoft Word document HTML for Administrative Documents matching the PDF layout identically
   */
  static generateAdministrativeDocumentWordHtml(options: AdminDocumentPDFOptions): string {
    const school = options.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';
    const directorate = school.directorate || 'مديرية التربية لولاية';
    const academicYear = options.academicYear || school.academicYear || '2025 / 2026';
    const fmt = options.formatType || 'correspondence';
    const orient = options.orientation || 'portrait';
    const isLandscape = orient === 'landscape';
    const paperSize = (options.paperSize || 'a4').toLowerCase();
    const dateStr = options.date || new Date().toISOString().split('T')[0];
    const signers = options.signers && options.signers.length > 0 ? options.signers : ['مسير المخبر', 'مدير المؤسسة'];
    const showCorresp = options.showCorrespondenceMeta !== false;
    const showAppr = Boolean(options.showApprovalBox);
    const showStmp = options.showStampSpace !== false;
    const hasBottomRelease = options.showBottomReleaseDate !== false;
    const marginMm = options.margins === 'compact' ? 10 : options.margins === 'spacious' ? 18 : 14;
    const baseFontSize = options.fontSizeScale === 'compact' ? '9.5pt' : options.fontSizeScale === 'large' ? '12pt' : '11pt';

    // Format-specific metadata HTML
    let metaBoxHtml = '';
    if (fmt === 'correspondence' && showCorresp && (options.sender || options.recipient || options.subject)) {
      metaBoxHtml = `
        <table class="meta-box-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 12pt; background-color: #f7f9f5; border: 1.5pt solid #2b3d22;">
          <tr>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top; border-bottom: 1pt solid #d2d8ce;">
              <strong>من:</strong> ${options.sender || 'مسير المخبر'}
            </td>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top; border-bottom: 1pt solid #d2d8ce;">
              <strong>إلى:</strong> ${options.recipient || 'السيد مدير المؤسسة'}
            </td>
          </tr>
          ${(options.subject && options.showSubject !== false) ? `
          <tr>
            <td colspan="2" style="padding: 6pt 10pt; vertical-align: top;">
              <strong>الموضوع:</strong> ${options.subject}
            </td>
          </tr>
          ` : ''}
        </table>
      `;
    } else if (fmt === 'voucher_form') {
      metaBoxHtml = `
        <table class="meta-box-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 12pt; background-color: #f8fafc; border: 1.5pt solid #0f766e;">
          <tr>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top; border-bottom: 1pt solid #cbd5e1;">
              <strong>طالب السند / المسؤول:</strong> ${options.sender || 'المسؤول عن المخبر'}
            </td>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top; border-bottom: 1pt solid #cbd5e1;">
              <strong>المصلحة / المخبر:</strong> ${options.department || 'مخبر العلوم'}
            </td>
          </tr>
          <tr>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top;">
              <strong>سند رقم:</strong> ${options.reference || '—'}
            </td>
            <td style="padding: 6pt 10pt; width: 50%; vertical-align: top;">
              <strong>الغرض:</strong> ${options.subject || '—'}
            </td>
          </tr>
        </table>
      `;
    } else if (fmt === 'circular_memo') {
      metaBoxHtml = `
        <table class="meta-box-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 12pt; background-color: #f0fdfa; border: 1.5pt solid #0d9488;">
          <tr>
            <td style="padding: 6pt 10pt; vertical-align: top; border-bottom: 1pt solid #99f6e4;">
              <strong>موجهة إلى:</strong> ${options.recipient || 'جميع الأساتذة ومستخدمي المخبر'}
            </td>
          </tr>
          ${(options.subject && options.showSubject !== false) ? `
          <tr>
            <td style="padding: 6pt 10pt; vertical-align: top;">
              <strong>الموضوع:</strong> ${options.subject}
            </td>
          </tr>
          ` : ''}
        </table>
      `;
    } else if (options.subject && options.showSubject !== false) {
      metaBoxHtml = `
        <div style="margin-top: 8pt; margin-bottom: 10pt; font-weight: bold; font-size: 11pt; color: #2b3d22;">
          <strong>الموضوع:</strong> ${options.subject}
        </div>
      `;
    }

    // Items Table HTML
    let tableHtml = '';
    if (options.hasTable && options.tableHeaders && options.tableRows && options.tableRows.length > 0) {
      tableHtml = `
        <table class="data-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 12pt; margin-bottom: 12pt; border: 1.5pt solid #2b3d22;">
          <thead>
            <tr style="background-color: #2b3d22; color: #ffffff;">
              ${options.tableHeaders.map(h => `
                <th style="border: 1pt solid #415437; padding: 6pt 8pt; text-align: center; font-weight: bold; font-size: 10pt; color: #ffffff;">
                  ${h}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${options.tableRows.map((row, rIdx) => `
              <tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f9faf7'};">
                ${row.map(cell => `
                  <td style="border: 1pt solid #d2d8ce; padding: 5pt 8pt; font-size: 9.5pt; color: #1a1a1a;">
                    ${cell !== null && cell !== undefined ? String(cell) : '—'}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Notes Box
    let notesHtml = '';
    if (options.notes) {
      notesHtml = `
        <table class="notes-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; background-color: #fcfdfb; border-right: 3pt solid #2b3d22; border: 1pt solid #d2d8ce;">
          <tr>
            <td style="padding: 7pt 10pt; font-size: 9.5pt; color: #333333;">
              <strong style="color: #2b3d22;">ملاحظات وتوجيهات:</strong> ${options.notes}
            </td>
          </tr>
        </table>
      `;
    }

    // Closing Formula
    let closingHtml = '';
    if (options.closingFormula && options.closingFormula !== 'بدون عبارة ختامية') {
      closingHtml = `
        <p style="margin-top: 14pt; margin-bottom: 14pt; font-size: 11pt; color: #2b3d22; font-weight: bold;">
          ${options.closingFormula}
        </p>
      `;
    }

    // Approval / Decision Box
    let approvalHtml = '';
    if (showAppr) {
      approvalHtml = `
        <table class="approval-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 14pt; margin-bottom: 14pt; background-color: #fbfcf9; border: 1.5pt solid #2b3d22;">
          <tr>
            <td style="padding: 8pt 12pt;">
              <div style="font-weight: bold; color: #2b3d22; font-size: 11pt; margin-bottom: 5pt;">قرار وختم إدارة المؤسسة:</div>
              <div style="font-size: 10pt; margin-bottom: 5pt;">
                [ &nbsp; ] موافقة تامة &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] موافقة مع تحفظ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] مرفوض
              </div>
              <div style="font-size: 9pt; color: #555555;">
                الملاحظات: ............................................................................ &nbsp;&nbsp;&nbsp;&nbsp; التوقيع والختم: ................................
              </div>
            </td>
          </tr>
        </table>
      `;
    }

    // Signatures Table
    const colWidthPercent = Math.floor(100 / Math.max(signers.length, 1));
    const signaturesHtml = `
      <table class="signatures-table" dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 24pt; margin-bottom: 16pt;">
        <tr>
          ${signers.map(sig => `
            <td style="width: ${colWidthPercent}%; text-align: center; vertical-align: top; padding: 6pt; border: 1pt dashed #889980; background-color: #fcfdfb;">
              <div style="font-weight: bold; font-size: 10.5pt; color: #2b3d22; border-bottom: 1pt solid #e0e5dc; padding-bottom: 4pt; margin-bottom: 8pt;">
                ${sig}
              </div>
              <div style="font-size: 8.5pt; color: #888888; height: 35pt; padding-top: 10pt;">
                (الاسم، التوقيع والختم)
              </div>
              ${showStmp ? `
                <div style="margin: 8pt auto 4pt auto; width: 55pt; height: 55pt; border: 1pt dotted #a3b09d; border-radius: 50%; text-align: center; padding-top: 18pt; font-size: 7.5pt; color: #778873;">
                  موضع الختم الرسمي
                </div>
              ` : ''}
              <div style="font-size: 7.5pt; color: #999999; margin-top: 6pt;">
                حرر في: .....................
              </div>
            </td>
          `).join('')}
        </tr>
      </table>
    `;

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: ${isLandscape ? '297mm 210mm' : '210mm 297mm'};
            mso-page-orientation: ${orient};
            margin: ${marginMm}mm;
            mso-header-margin: 10mm;
            mso-footer-margin: 10mm;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Cairo', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            font-size: ${baseFontSize};
            color: #1a1a1a;
            line-height: 1.6;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          <!-- Official Republic & Ministry -->
          <p style="text-align: center; font-weight: bold; font-size: 12pt; color: #2b3d22; margin: 0 0 2pt 0;">
            ${school.country || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 10.5pt; color: #415437; margin: 0 0 8pt 0;">
            ${school.ministry || 'وزارة التربية الوطنية'}
          </p>

          <!-- Institution Details Table -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 8pt; border: none;">
            <tr>
              <td style="text-align: right; width: 55%; font-size: 9.5pt; vertical-align: top; border: none;">
                <div>${directorate}</div>
                <div>${formattedSchool}</div>
                ${options.department ? `<div><strong>المصلحة / المخبر:</strong> ${options.department}</div>` : ''}
              </td>
              <td style="text-align: left; width: 45%; font-size: 9.5pt; vertical-align: top; border: none;" dir="rtl">
                <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                ${(!hasBottomRelease || options.showTopHeaderDate) ? `<div><strong>التاريخ:</strong> ${dateStr}</div>` : ''}
                ${(options.reference && options.showReference !== false) ? `<div><strong>الرقم:</strong> ${options.reference}</div>` : ''}
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1.5pt solid #2b3d22; margin: 6pt 0 10pt 0;" />

          <!-- Title Banner -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-bottom: 12pt; border: none;">
            <tr>
              <td style="background-color: #2b3d22; color: #ffffff; text-align: center; padding: 7pt 12pt; border-radius: 4pt;">
                <h1 style="font-size: 13.5pt; font-weight: bold; margin: 0; color: #ffffff;">${options.title}</h1>
              </td>
            </tr>
          </table>

          ${metaBoxHtml}

          <!-- Body Content -->
          ${options.content ? `
            <div style="font-size: ${baseFontSize}; line-height: 1.7; margin-top: 10pt; margin-bottom: 12pt; text-align: justify;">
              ${options.content.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 8pt 0; text-indent: 18pt;">${p}</p>` : '').join('')}
            </div>
          ` : ''}

          ${tableHtml}
          ${notesHtml}
          ${closingHtml}
          ${approvalHtml}

          ${hasBottomRelease ? `
            <div style="text-align: left; margin: 16pt 0 10pt; font-weight: bold; font-size: 11pt; color: #1e293b;" dir="rtl">
              حرر بـ : ${options.location || 'عين كرشة'} في : ${dateStr}
            </div>
          ` : ''}

          ${signaturesHtml}

          <!-- Footer -->
          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 16pt; border-top: 1pt solid #d2d8ce;">
            <tr>
              <td style="text-align: right; font-size: 8pt; color: #777777; padding-top: 4pt; border: none;">
                الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية
              </td>
              <td style="text-align: center; font-size: 8pt; color: #777777; padding-top: 4pt; border: none;">
                ${formattedSchool}
              </td>
              <td style="text-align: left; font-size: 8pt; color: #777777; padding-top: 4pt; border: none;">
                صفحة 1 من 1
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Downloads Microsoft Word document (.doc) for Administrative Documents matching the official PDF layout identically
   */
  static generateAdministrativeDocumentWord(options: AdminDocumentPDFOptions): void {
    const html = this.generateAdministrativeDocumentWordHtml(options);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (options.title || 'وثيقة_إدارية').replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generates Legislation Archival Sheet PDF
   * Returns Promise<Blob>
   */
  static async generateLegislationSheetPDF(options: LegislationSheetOptions): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let currentY = 16;

    // Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9.5);
    doc.text(this.processArabic('وزارة التربية الوطنية — أرشيف النصوص والتشريع المدرسي'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    doc.setDrawColor(65, 84, 55);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Title
    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic(options.title || 'بطاقة توثيق نص تشريعي'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Table of details
    const details = [
      ['عنوان الوثيقة', options.title || '—'],
      ['المرجع الإداري / رقم النص', options.reference || '—'],
      ['التصنيف التشريعي', options.category || 'نصوص تنظيمية'],
      ['تاريخ الصدور', options.date || '—'],
      ['اسم الملف الأصلي', options.fileName || '—'],
      ['حالة النشر والوصول', options.isPublic ? 'عام / متاح للجميع' : 'خاص بالمؤسسة']
    ];

    autoTable(doc, {
      body: details.map(([k, v]) => [this.processArabic(k), this.processArabic(v)]),
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: fontName, fontSize: 9.5, halign: 'right', cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 246], cellWidth: 50 },
        1: { halign: 'right' }
      },
      theme: 'grid'
    });
    currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 40;

    if (options.description) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(43, 61, 34);
      doc.text(this.processArabic('ملخص وفحوى النص التنظيمي:'), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;

      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const splitDesc = doc.splitTextToSize(this.processArabic(options.description), pageWidth - margin * 2);
      doc.text(splitDesc, pageWidth - margin, currentY, { align: 'right' });
    }

    return doc.output('blob');
  }

  /**
   * Generates Legislation Word document
   */
  static generateLegislationSheetWord(options: LegislationSheetOptions): void {
    const previewData: PrintPreviewData = {
      title: options.title || 'بطاقة نص تشريعي',
      subtitle: `المرجع: ${options.reference || '—'} · التصنيف: ${options.category || 'تشريع مدرسي'}`,
      headers: ['البيان الإداري', 'القيمة والمعلومات'],
      rows: [
        ['عنوان الوثيقة', options.title || '—'],
        ['رقم المرجع', options.reference || '—'],
        ['التصنيف', options.category || '—'],
        ['تاريخ الإصدار', options.date || '—'],
        ['اسم الملف', options.fileName || '—']
      ],
      notes: options.description || 'وثيقة تنظيمية موثقة وفق المنظومة التربوية الجزائرية',
      suggestedOrientation: 'portrait'
    };
    PrintService.downloadReportWord(previewData);
  }

  /**
   * Generates a generic Table PDF report
   */
  static async generateTablePDF(
    title: string,
    headers: string[],
    rows: any[][],
    fileName = 'report.pdf',
    extraOptions?: any
  ): Promise<void> {
    const isLand = extraOptions?.orientation === 'landscape' || extraOptions?.suggestedOrientation === 'landscape';
    const doc = new jsPDF({
      orientation: isLand ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = 14;

    const school = extraOptions?.schoolInfo || {};
    const formattedSchool = formatSchoolWithCommune(school.school, school.commune) || 'المؤسسة التعليمية';

    // Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFontSize(9);
    doc.text(this.processArabic('وزارة التربية الوطنية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.text(this.processArabic(formattedSchool), pageWidth - margin, currentY, { align: 'right' });
    doc.text(this.processArabic(new Date().toLocaleDateString('ar-DZ')), margin, currentY, { align: 'left' });
    currentY += 6;

    // Title
    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(43, 61, 34);
    doc.text(this.processArabic(title), pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    // Table
    autoTable(doc, {
      head: [headers.map(h => this.processArabic(h))],
      body: rows.map(row => row.map(cell => this.processArabic(cell !== null && cell !== undefined ? cell : '—'))),
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: fontName, fontSize: 8, halign: 'right', cellPadding: 2 },
      headStyles: { fillColor: [43, 61, 34], textColor: [255, 255, 255], font: fontName, fontStyle: 'bold', halign: 'center' },
      theme: 'grid'
    });

    doc.save(fileName);
  }

  /**
   * Downloads a generic table as Word (.doc)
   */
  static downloadTableWord(
    title: string,
    headers: string[],
    rows: any[][],
    fileName = 'report.doc',
    extraOptions?: any
  ): void {
    const previewData: PrintPreviewData = {
      title,
      headers,
      rows,
      summaryCards: extraOptions?.summaryCards,
      notes: extraOptions?.notes,
      suggestedOrientation: extraOptions?.orientation === 'landscape' ? 'landscape' : 'portrait'
    };
    PrintService.downloadReportWord(previewData);
  }

  /**
   * Generates a Safety Incident Report PDF
   */
  static async generateIncidentPDF(incident: any, options?: any): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const hasFont = await this.init(doc);
    const fontName = hasFont ? 'ManaraDocs' : 'helvetica';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let currentY = 16;

    // Header
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 45, 25);
    doc.text(this.processArabic('الجمهورية الجزائرية الديمقراطية الشعبية'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9.5);
    doc.text(this.processArabic('وزارة التربية الوطنية — تقرير حادث أمني / مخبري'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(180, 50, 40);
    doc.text(this.processArabic(`تقرير حادثة مخبرية: ${incident.title || 'حادث مخبري'}`), pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    const details = [
      ['تاريخ الحادث', incident.date || '—'],
      ['الموقع / المخبر', incident.location || options?.laboratory || 'المخبر'],
      ['درجة الخطورة', incident.severity || 'متوسطة'],
      ['نوع الحادث', incident.type || '—'],
      ['الأشخاص المعنيون', incident.involvedPersons || '—'],
      ['الإسعافات الأولية المتخذة', incident.firstAidTaken || '—'],
      ['الإجراءات الوقائية المقترحة', incident.preventiveMeasures || '—']
    ];

    autoTable(doc, {
      body: details.map(([k, v]) => [this.processArabic(k), this.processArabic(v)]),
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { font: fontName, fontSize: 9, halign: 'right', cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [253, 248, 248], cellWidth: 50 },
        1: { halign: 'right' }
      },
      theme: 'grid'
    });

    doc.save(`تقرير_حادث_${incident.date || 'مخبري'}.pdf`);
  }

  /**
   * Generates a Safety Incident Word document
   */
  static generateIncidentWord(incident: any, options?: any): void {
    const previewData: PrintPreviewData = {
      title: `تقرير حادثة مخبرية: ${incident.title || 'حادث مخبري'}`,
      subtitle: `التاريخ: ${incident.date || '—'} · درجة الخطورة: ${incident.severity || 'متوسطة'}`,
      headers: ['بيان الحادثة', 'التفاصيل والإجراءات'],
      rows: [
        ['تاريخ ووقت الحادث', incident.date || '—'],
        ['المكان والمخبر', incident.location || options?.laboratory || 'المخبر'],
        ['الأطراف المعنية', incident.involvedPersons || '—'],
        ['وصف الحادثة', incident.description || '—'],
        ['الإسعافات المتخذة', incident.firstAidTaken || '—'],
        ['الإجراءات التصحيحية', incident.preventiveMeasures || '—']
      ],
      notes: 'تقرير رسمي خاص بالأمن والسلامة في المخابر المدرسية',
      suggestedOrientation: 'portrait'
    };
    PrintService.downloadReportWord(previewData);
  }
}
