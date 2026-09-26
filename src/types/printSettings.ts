export type PrintPaperSize = 'a4' | 'a3' | 'letter';
export type PrintOrientation = 'portrait' | 'landscape' | 'auto';
export type PrintMargins = 'compact' | 'standard' | 'spacious';
export type PrintScale = 'small' | 'normal' | 'large';
export type PrintColorMode = 'color' | 'grayscale' | 'blackAndWhite';
export type PrintHeaderStyle = 'official' | 'compact' | 'modern' | 'minimal';
export type QRStickerPreset = '2x4' | '3x7' | '4x8' | 'custom';

export interface InstitutionPrintSettings {
  country: string;
  ministry: string;
  directorate: string;
  school: string;
  commune?: string;
  laboratory: string;
  academicYear: string;
  headerStyle: PrintHeaderStyle;
  showRepublicHeader: boolean;
  showMinistry: boolean;
  showLogo: boolean;
  showDate: boolean;
}

export interface LayoutPrintSettings {
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  margins: PrintMargins;
  fontSizeScale: PrintScale;
  fontFamily: 'Amiri' | 'Cairo' | 'ManaraDocs' | 'system';
}

export interface AppearancePrintSettings {
  colorMode: PrintColorMode;
  tableStriped: boolean;
  compactRows: boolean;
  printBackgrounds: boolean;
  highContrastBorders: boolean;
}

export interface SignaturesPrintSettings {
  showSignatures: boolean;
  showLabManager: boolean;
  labManagerTitle: string;
  showPrincipal: boolean;
  principalTitle: string;
  showTeacher: boolean;
  teacherTitle: string;
  showInspector: boolean;
  inspectorTitle: string;
  reserveStampSpace: boolean;
  customDisclaimer: string;
}

export interface QRStickerPrintSettings {
  preset: QRStickerPreset;
  gridColumns: number;
  gridRows: number;
  stickerWidthMm: number;
  stickerHeightMm: number;
  showLogo: boolean;
  showSchoolName: boolean;
  showItemCode: boolean;
  showCategory: boolean;
  showStorageLocation: boolean;
  qrSize: number;
}

export interface PrintSettings {
  institution: InstitutionPrintSettings;
  layout: LayoutPrintSettings;
  appearance: AppearancePrintSettings;
  signatures: SignaturesPrintSettings;
  qrSticker: QRStickerPrintSettings;
  defaultOutput: 'dialog' | 'instant_print' | 'pdf';
  lastUpdated?: string;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  institution: {
    country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    ministry: 'وزارة التربية الوطنية',
    directorate: 'مديرية التربية لولاية الجزائر',
    school: 'مؤسسة التعليم الثانوي والتقني',
    commune: '',
    laboratory: 'مخبر العلوم الفيزيائية والطبيعية',
    academicYear: '2025/2026',
    headerStyle: 'official',
    showRepublicHeader: true,
    showMinistry: true,
    showLogo: true,
    showDate: true
  },
  layout: {
    paperSize: 'a4',
    orientation: 'portrait',
    margins: 'standard',
    fontSizeScale: 'normal',
    fontFamily: 'Cairo'
  },
  appearance: {
    colorMode: 'color',
    tableStriped: true,
    compactRows: false,
    printBackgrounds: true,
    highContrastBorders: false
  },
  signatures: {
    showSignatures: true,
    showLabManager: true,
    labManagerTitle: 'المسؤول عن المخبر',
    showPrincipal: true,
    principalTitle: 'مدير(ة) المؤسسة',
    showTeacher: false,
    teacherTitle: 'الأستاذ المؤطر',
    showInspector: false,
    inspectorTitle: 'مفتش المادة',
    reserveStampSpace: true,
    customDisclaimer: 'وثيقة رسمية مصادق عليها صادرة عن النظام الرقمي للمخابر المدرسية'
  },
  qrSticker: {
    preset: '3x7',
    gridColumns: 3,
    gridRows: 7,
    stickerWidthMm: 63.5,
    stickerHeightMm: 38.1,
    showLogo: true,
    showSchoolName: true,
    showItemCode: true,
    showCategory: true,
    showStorageLocation: true,
    qrSize: 80
  },
  defaultOutput: 'dialog'
};

export interface PrintPreviewData {
  title: string;
  subtitle?: string;
  type: 'table' | 'cards' | 'stickers' | 'custom';
  headers?: string[];
  rows?: (string | number | null | undefined)[][];
  cards?: Array<{
    title: string;
    code?: string;
    details: Array<{ label: string; value: string | number }>;
    qrValue?: string;
    badges?: string[];
  }>;
  stickers?: Array<{
    id: string;
    name: string;
    qrValue: string;
    category?: string;
    location?: string;
    code?: string;
  }>;
  summaryCards?: Array<{ label: string; value: string | number }>;
  notes?: string;
  customHtml?: string;
  suggestedOrientation?: PrintOrientation;
}
