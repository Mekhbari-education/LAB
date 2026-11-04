import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Download, 
  FileDown, 
  X, 
  Sliders, 
  FileText, 
  Check, 
  RotateCcw, 
  Palette, 
  Layout, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  RefreshCw, 
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Stamp,
  Heading,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PrintService } from '../services/printService';
import { PDFService } from '../services/pdfService';
import DOMPurify from 'dompurify';
import { 
  PrintOrientation, 
  PrintColorMode, 
  PrintMargins, 
  PrintScale,
  PrintPaperSize,
  PrintHeaderStyle,
  PrintWatermark,
  PrintBorderStyle,
  PrintLineHeight
} from '../types/printSettings';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';

export default function PrintPreviewModal() {
  const { 
    isPreviewOpen, 
    closePrintPreview, 
    previewData, 
    settings: globalSettings,
    updateSettings,
    saveSettingsToCloud
  } = usePrintSettings();
  const { openPdfPreview } = usePdfPreview();

  // Local overrides for this specific print preview session
  const [localOrientation, setLocalOrientation] = useState<PrintOrientation | null>(null);
  const [localColorMode, setLocalColorMode] = useState<PrintColorMode | null>(null);
  const [localMargins, setLocalMargins] = useState<PrintMargins | null>(null);
  const [localScale, setLocalScale] = useState<PrintScale | null>(null);
  const [localPaperSize, setLocalPaperSize] = useState<PrintPaperSize | null>(null);
  const [localShowHeader, setLocalShowHeader] = useState<boolean | null>(null);
  const [localShowSignatures, setLocalShowSignatures] = useState<boolean | null>(null);
  const [localHeaderStyle, setLocalHeaderStyle] = useState<PrintHeaderStyle | null>(null);
  const [localTableStriped, setLocalTableStriped] = useState<boolean | null>(null);
  const [localHighContrast, setLocalHighContrast] = useState<boolean | null>(null);
  const [localStampSpace, setLocalStampSpace] = useState<boolean | null>(null);

  // Windows-style print overrides
  const [localWatermark, setLocalWatermark] = useState<PrintWatermark | null>(null);
  const [localCustomWatermark, setLocalCustomWatermark] = useState<string>('');
  const [localGutterMm, setLocalGutterMm] = useState<number | null>(null);
  const [localCustomScalePercent, setLocalCustomScalePercent] = useState<number | null>(null);
  const [localLineHeight, setLocalLineHeight] = useState<PrintLineHeight | null>(null);
  const [localBorderStyle, setLocalBorderStyle] = useState<PrintBorderStyle | null>(null);
  const [localShowPageNumbers, setLocalShowPageNumbers] = useState<boolean | null>(null);
  const [localShowPrintDateTime, setLocalShowPrintDateTime] = useState<boolean | null>(null);
  const [localCopies, setLocalCopies] = useState<number>(1);
  const [localSignersCount, setLocalSignersCount] = useState<number | null>(null);
  const [localShowNazir, setLocalShowNazir] = useState<boolean | null>(null);
  const [localShowTeacher, setLocalShowTeacher] = useState<boolean | null>(null);
  const [localShowInspector, setLocalShowInspector] = useState<boolean | null>(null);
  const [localFontFamily, setLocalFontFamily] = useState<'Cairo' | 'Amiri' | 'ManaraDocs' | 'system' | null>(null);

  // Operation States
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReviewingPdf, setIsReviewingPdf] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Viewport & Zoom Controls
  const [zoom, setZoom] = useState<number>(100);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'layout' | 'style' | 'watermark' | 'header' | 'signatures'>('layout');
  const [viewMode, setViewMode] = useState<'custom' | 'structured'>('custom');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Reset local overrides when new preview data opens
  useEffect(() => {
    if (previewData) {
      setLocalOrientation(previewData.suggestedOrientation || null);
      setLocalPaperSize(previewData.suggestedPaperSize || null);
      setLocalColorMode(null);
      setLocalMargins(null);
      setLocalScale(null);
      setLocalShowHeader(null);
      setLocalShowSignatures(null);
      setLocalHeaderStyle(null);
      setLocalTableStriped(null);
      setLocalHighContrast(null);
      setLocalStampSpace(null);
      setLocalWatermark(null);
      setLocalCustomWatermark('');
      setLocalGutterMm(null);
      setLocalCustomScalePercent(null);
      setLocalLineHeight(null);
      setLocalBorderStyle(null);
      setLocalShowPageNumbers(null);
      setLocalShowPrintDateTime(null);
      setLocalCopies(1);
      setLocalSignersCount(null);
      setLocalShowNazir(null);
      setLocalShowTeacher(null);
      setLocalShowInspector(null);
      setLocalFontFamily(null);
      setZoom(100);
      setCopiedHtml(false);
    }
  }, [previewData]);

  // Determine active effective options
  const orientation = localOrientation || previewData?.suggestedOrientation || globalSettings.layout.orientation || 'portrait';
  const paperSize = localPaperSize || previewData?.suggestedPaperSize || globalSettings.layout.paperSize || 'a4';
  const colorMode = localColorMode || globalSettings.appearance.colorMode || 'color';
  const margins = localMargins || globalSettings.layout.margins || 'standard';
  const scale = localScale || globalSettings.layout.fontSizeScale || 'normal';
  const fontFamily = localFontFamily || globalSettings.layout.fontFamily || 'Cairo';
  const showHeader = localShowHeader !== null ? localShowHeader : globalSettings.institution.headerStyle !== 'minimal';
  const showSignatures = localShowSignatures !== null ? localShowSignatures : globalSettings.signatures.showSignatures;
  const headerStyle = localHeaderStyle || globalSettings.institution.headerStyle || 'official';
  const tableStriped = localTableStriped !== null ? localTableStriped : globalSettings.appearance.tableStriped;
  const highContrast = localHighContrast !== null ? localHighContrast : globalSettings.appearance.highContrastBorders;
  const stampSpace = localStampSpace !== null ? localStampSpace : globalSettings.signatures.reserveStampSpace;

  const watermark = localWatermark !== null ? localWatermark : (globalSettings.appearance?.watermark || 'none');
  const watermarkText = watermark === 'custom' 
    ? (localCustomWatermark || 'معاينة') 
    : watermark === 'official' 
    ? 'رسمي' 
    : watermark === 'draft' 
    ? 'مسودة' 
    : watermark === 'confidential' 
    ? 'سري للغاية' 
    : watermark === 'certified' 
    ? 'نسخة مصادق عليها' 
    : watermark === 'lab_copy' 
    ? 'خاص بالمخبر' 
    : '';

  const gutterMm = localGutterMm !== null ? localGutterMm : (globalSettings.layout?.gutterMm || 0);
  const customScalePercent = localCustomScalePercent !== null ? localCustomScalePercent : (globalSettings.layout?.customScalePercent || 100);
  const lineHeight = localLineHeight !== null ? localLineHeight : (globalSettings.layout?.lineHeight || 'normal');
  const borderStyle = localBorderStyle !== null ? localBorderStyle : (globalSettings.appearance?.borderStyle || 'standard');
  const showPageNumbers = localShowPageNumbers !== null ? localShowPageNumbers : (globalSettings.appearance?.showPageNumbers ?? false);
  const showPrintDateTime = localShowPrintDateTime !== null ? localShowPrintDateTime : (globalSettings.appearance?.showPrintDateTime ?? false);
  const copies = localCopies || 1;
  const signersCount = localSignersCount !== null ? localSignersCount : (globalSettings.signatures?.signersCount || 3);
  const showNazir = localShowNazir !== null ? localShowNazir : (globalSettings.signatures?.showNazir ?? true);
  const showTeacher = localShowTeacher !== null ? localShowTeacher : (globalSettings.signatures?.showTeacher ?? false);
  const showInspector = localShowInspector !== null ? localShowInspector : (globalSettings.signatures?.showInspector ?? false);

  // Build active combined settings snapshot
  const activeEffectiveSettings = useMemo(() => {
    return {
      ...globalSettings,
      layout: {
        ...globalSettings.layout,
        orientation,
        paperSize,
        margins,
        fontSizeScale: scale,
        fontFamily,
        copies,
        gutterMm,
        customScalePercent,
        lineHeight
      },
      appearance: {
        ...globalSettings.appearance,
        colorMode,
        tableStriped,
        highContrastBorders: highContrast,
        watermark,
        customWatermarkText: localCustomWatermark,
        borderStyle,
        showPageNumbers,
        showPrintDateTime
      },
      institution: {
        ...globalSettings.institution,
        headerStyle: (showHeader ? headerStyle : 'minimal') as any
      },
      signatures: {
        ...globalSettings.signatures,
        showSignatures,
        reserveStampSpace: stampSpace,
        showNazir,
        showTeacher,
        showInspector,
        signersCount
      }
    };
  }, [
    globalSettings,
    orientation,
    paperSize,
    margins,
    scale,
    fontFamily,
    colorMode,
    tableStriped,
    highContrast,
    showHeader,
    headerStyle,
    showSignatures,
    stampSpace,
    watermark,
    localCustomWatermark,
    gutterMm,
    customScalePercent,
    lineHeight,
    borderStyle,
    showPageNumbers,
    showPrintDateTime,
    copies,
    signersCount,
    showNazir,
    showTeacher,
    showInspector
  ]);

  const currentPrintData = useMemo(() => {
    if (!previewData) return null;
    if (viewMode === 'structured') {
      return { ...previewData, customHtml: undefined };
    }
    return previewData;
  }, [previewData, viewMode]);

  const handlePrint = async () => {
    if (!currentPrintData) return;
    setIsPrinting(true);
    try {
      const html = PrintService.generateReportHtml(currentPrintData, activeEffectiveSettings);
      await PrintService.printHtml(html, { title: currentPrintData.title });
    } catch (e) {
      console.error('Print error:', e);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!previewData) return;
    setIsExportingPdf(true);
    try {
      const inst = globalSettings.institution;
      await PDFService.exportLabReportPDF({
        title: previewData.title,
        subtitle: previewData.subtitle,
        schoolInfo: {
          country: inst.country,
          ministry: inst.ministry,
          directorate: inst.directorate,
          school: inst.school,
          commune: inst.commune,
          laboratory: inst.laboratory,
          academicYear: inst.academicYear
        },
        headers: previewData.headers || [],
        rows: previewData.rows || [],
        fileName: `${previewData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: orientation === 'landscape' ? 'l' : 'p',
        summaryCards: previewData.summaryCards || [],
        showSignatures,
        showNazir,
        notes: previewData.notes,
        save: true
      });
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    if (!currentPrintData) return;
    try {
      PrintService.downloadReportWord(currentPrintData, activeEffectiveSettings);
    } catch (e) {
      console.error('Word export error:', e);
    }
  };

  const handleReviewPdf = async () => {
    if (!previewData) return;
    setIsReviewingPdf(true);
    try {
      const inst = globalSettings.institution;
      const doc = await PDFService.exportLabReportPDF({
        title: previewData.title,
        subtitle: previewData.subtitle,
        schoolInfo: {
          country: inst.country,
          ministry: inst.ministry,
          directorate: inst.directorate,
          school: inst.school,
          commune: inst.commune,
          laboratory: inst.laboratory,
          academicYear: inst.academicYear
        },
        headers: previewData.headers || [],
        rows: previewData.rows || [],
        fileName: `${previewData.title.replace(/\s+/g, '_')}.pdf`,
        orientation: orientation === 'landscape' ? 'l' : 'p',
        summaryCards: previewData.summaryCards || [],
        showSignatures,
        showNazir,
        notes: previewData.notes,
        save: false
      });
      const blob = doc.output('blob');
      openPdfPreview({
        file: blob,
        title: previewData.title,
        fileName: `${previewData.title.replace(/\s+/g, '_')}.pdf`,
        category: 'تقرير مخبري'
      });
    } catch (e) {
      console.error('PDF review error:', e);
    } finally {
      setIsReviewingPdf(false);
    }
  };

  const handlePrintInNewTab = () => {
    if (!currentPrintData) return;
    const html = PrintService.generateReportHtml(currentPrintData, activeEffectiveSettings);
    PrintService.printInNewTab(html, { title: currentPrintData.title, autoPrint: true });
  };

  const handleCopyHtml = async () => {
    if (!currentPrintData) return;
    try {
      const html = PrintService.generateReportHtml(currentPrintData, activeEffectiveSettings);
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch (e) {
      console.error('Copy HTML error:', e);
    }
  };

  const handleSaveAsDefaults = async () => {
    setIsSavingDefaults(true);
    try {
      updateSettings(activeEffectiveSettings);
      await saveSettingsToCloud();
      setSaveSuccessMessage('تم حفظ الإعدادات كافتراضية لجميع المطبوعات بنجاح!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (e) {
      console.error('Save settings error:', e);
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleResetOverrides = () => {
    setLocalOrientation(null);
    setLocalColorMode(null);
    setLocalMargins(null);
    setLocalScale(null);
    setLocalPaperSize(null);
    setLocalShowHeader(null);
    setLocalShowSignatures(null);
    setLocalHeaderStyle(null);
    setLocalTableStriped(null);
    setLocalHighContrast(null);
    setLocalStampSpace(null);
    setLocalWatermark(null);
    setLocalCustomWatermark('');
    setLocalGutterMm(null);
    setLocalCustomScalePercent(null);
    setLocalLineHeight(null);
    setLocalBorderStyle(null);
    setLocalShowPageNumbers(null);
    setLocalShowPrintDateTime(null);
    setLocalCopies(1);
    setLocalSignersCount(null);
    setLocalShowNazir(null);
    setLocalShowTeacher(null);
    setLocalShowInspector(null);
    setLocalFontFamily(null);
    setZoom(100);
  };

  // Keyboard shortcut: Ctrl + P / Cmd + P triggers print while modal is open
  useEffect(() => {
    if (!isPreviewOpen || !previewData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        closePrintPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, previewData, activeEffectiveSettings]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(175, prev + 15));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 15));
  const handleZoomReset = () => setZoom(100);
  const handleZoomFit = () => setZoom(orientation === 'landscape' ? 80 : 90);

  // Extract custom embedded CSS rules from customHtml
  const extractedCustomStyles = useMemo(() => {
    if (!previewData?.customHtml) return '';
    const styleMatches = previewData.customHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (!styleMatches) return '';
    return styleMatches
      .map(tag => tag.replace(/<\/?style[^>]*>/gi, ''))
      .join('\n');
  }, [previewData?.customHtml]);

  // Sanitize custom HTML using useMemo unconditionally before any early returns
  const sanitizedCustomHtml = useMemo(() => {
    if (!previewData?.customHtml) return '';
    let content = previewData.customHtml;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
    return DOMPurify.sanitize(content, {
      FORCE_BODY: false,
      ADD_TAGS: ['style'],
      ADD_ATTR: [
        'target', 'style', 'class', 'align', 'valign', 'border', 
        'cellpadding', 'cellspacing', 'dir', 'width', 'height',
        'colspan', 'rowspan', 'scope', 'id', 'name', 'nowrap'
      ],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'formaction']
    });
  }, [previewData?.customHtml]);

  // Guard clause ONLY after ALL React Hooks have executed unconditionally
  if (!isPreviewOpen || !previewData) {
    return null;
  }

  // Margin in preview
  const marginPx = margins === 'compact' ? '10px' : margins === 'spacious' ? '28px' : '18px';

  // Sheet dimensions based on paper size and orientation
  const sheetWidth = paperSize === 'a3' 
    ? (orientation === 'landscape' ? '420mm' : '297mm')
    : paperSize === 'a5'
    ? (orientation === 'landscape' ? '210mm' : '148mm')
    : paperSize === 'letter'
    ? (orientation === 'landscape' ? '279.4mm' : '215.9mm')
    : (orientation === 'landscape' ? '297mm' : '210mm');

  const sheetMinHeight = paperSize === 'a3'
    ? (orientation === 'landscape' ? '297mm' : '420mm')
    : paperSize === 'a5'
    ? (orientation === 'landscape' ? '148mm' : '210mm')
    : paperSize === 'letter'
    ? (orientation === 'landscape' ? '215.9mm' : '279.4mm')
    : (orientation === 'landscape' ? '210mm' : '297mm');

  const hasBothViews = Boolean(previewData.customHtml && (previewData.headers?.length || previewData.cards?.length || previewData.stickers?.length));
  const shouldRenderCustom = previewData.customHtml && (viewMode === 'custom' || (!previewData.headers?.length && !previewData.cards?.length && !previewData.stickers?.length));

  // Scale multiplier for font size
  const fontMultiplier = scale === 'small' ? 0.88 : scale === 'large' ? 1.15 : 1;

  // Colors based on color mode
  const isBw = colorMode === 'blackAndWhite';
  const isGrayscale = colorMode === 'grayscale';
  const brandPrimary = isBw ? '#000000' : isGrayscale ? '#1a1a1a' : '#2b3d22';
  const bgHeader = isBw ? '#ffffff' : isGrayscale ? '#e2e2e2' : '#2b3d22';
  const textHeader = isBw ? '#000000' : isGrayscale ? '#000000' : '#ffffff';
  const rowZebra = tableStriped
    ? (isBw ? '#ffffff' : isGrayscale ? '#f5f5f5' : '#f9faf7')
    : '#ffffff';
  const borderColor = isBw ? '#000000' : highContrast ? '#888888' : '#d2d8ce';

  const inst = globalSettings.institution;
  const sig = globalSettings.signatures;

  const currentDateFormatted = new Date().toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm rtl overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-surface w-full max-w-[1550px] h-[95vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant/30 overflow-hidden"
          dir="rtl"
        >
          {/* Top Primary Control Toolbar */}
          <header className="px-5 py-3 bg-surface-container flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 flex-shrink-0">
            {/* Document Title & Badge Zone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Printer size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-primary truncate max-w-xs sm:max-w-md">
                    {previewData.title}
                  </h3>
                  <span className="text-[11px] font-bold text-secondary bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30 uppercase">
                    {paperSize} · {orientation === 'landscape' ? 'أفقي' : 'عمودي'} {copies > 1 ? `· ${copies} نسخ` : ''}
                  </span>
                </div>
                <p className="text-xs text-secondary/80 hidden sm:block">
                  {previewData.subtitle || 'معاينة مباشرة وضبط مسبق قبل الإرسال للطابعة'}
                </p>
              </div>
            </div>

            {/* Middle Zoom & Orientation Bar */}
            <div className="hidden lg:flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-outline-variant/30">
              {/* Orientation segmented button */}
              <button
                onClick={() => setLocalOrientation('portrait')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orientation === 'portrait'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-surface-container'
                }`}
                title="تخطيط عمودي"
              >
                عمودي
              </button>
              <button
                onClick={() => setLocalOrientation('landscape')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orientation === 'landscape'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-surface-container'
                }`}
                title="تخطيط أفقي"
              >
                أفقي
              </button>

              <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

              {/* Zoom Controls */}
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30"
                title="تصغير (-)"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 py-1 text-xs font-mono font-bold text-primary hover:bg-surface-container rounded-md"
                title="إعادة التكبير إلى 100%"
              >
                {zoom}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 175}
                className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30"
                title="تكبير (+)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleZoomFit}
                className="px-2 py-1 text-[11px] font-bold text-secondary hover:text-primary hover:bg-surface-container rounded-md"
                title="ملاءمة الشاشة"
              >
                ملاءمة
              </button>
            </div>

            {/* Action Buttons Zone */}
            <div className="flex items-center gap-2">
              {/* Settings Sidebar Toggle */}
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                  showSettingsDrawer 
                    ? 'bg-primary text-white border-primary shadow-sm' 
                    : 'bg-surface text-secondary hover:bg-secondary-container/30 border-outline-variant/30'
                }`}
                title="إظهار / إخفاء شريط خيارات الطباعة المتقدمة"
              >
                <Sliders size={17} />
                <span className="hidden sm:inline">خيارات الطباعة</span>
              </button>

              {/* Open in Dedicated Print Tab */}
              <button
                onClick={handlePrintInNewTab}
                className="p-2.5 bg-surface text-secondary hover:text-primary border border-outline-variant/30 rounded-xl transition-all hidden xl:flex items-center gap-1 text-xs font-bold shadow-sm"
                title="فتح الطباعة في تبويب مستقل"
              >
                <ExternalLink size={16} />
                <span>تبويب مستقل</span>
              </button>

              {/* Copy HTML */}
              <button
                onClick={handleCopyHtml}
                className="p-2.5 bg-surface text-secondary hover:text-primary border border-outline-variant/30 rounded-xl transition-all hidden xl:flex items-center gap-1 text-xs font-bold shadow-sm"
                title="نسخ كود HTML للوثيقة"
              >
                {copiedHtml ? <CheckCheck size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{copiedHtml ? 'تم النسخ!' : 'نسخ HTML'}</span>
              </button>

              {/* Review PDF */}
              <button
                onClick={handleReviewPdf}
                disabled={isReviewingPdf}
                className="px-3.5 py-2.5 bg-surface text-tertiary border border-tertiary/30 hover:bg-tertiary/10 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm shadow-sm disabled:opacity-50"
                title="معاينة تفاعلية لملف PDF"
              >
                <Eye size={17} />
                <span className="hidden xl:inline">{isReviewingPdf ? 'تحضير...' : 'معاينة PDF'}</span>
              </button>

              {/* Export Word */}
              <button
                onClick={handleExportWord}
                className="px-3.5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm shadow-sm"
                title="تنزيل كملف Word مخصص للتعديل (.doc)"
              >
                <FileDown size={17} />
                <span className="hidden md:inline">Word</span>
              </button>

              {/* Export PDF */}
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2.5 bg-surface text-primary border border-outline-variant/40 rounded-xl font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 text-xs sm:text-sm shadow-sm disabled:opacity-50"
                title="تنزيل كملف PDF رسمي مصادق عليه"
              >
                <Download size={17} />
                <span className="hidden md:inline">{isExportingPdf ? 'تنزيل...' : 'PDF'}</span>
              </button>

              {/* Direct Print Button */}
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-xs sm:text-sm shadow-sm disabled:opacity-50"
                title="طباعة فورية للمستند (Ctrl+P)"
              >
                <Printer size={17} />
                <span>{isPrinting ? 'جاري الإرسال...' : 'طباعة فورية'}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">
                  Ctrl+P
                </span>
              </button>

              {/* Close Modal */}
              <button
                onClick={closePrintPreview}
                className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary-container/40 transition-colors"
                title="إغلاق المعاينة"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Main Content: Document Canvas + Side-by-side Collapsible Settings Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Document Interactive Preview Canvas */}
            <div 
              ref={printContainerRef}
              className="flex-1 bg-slate-200/70 dark:bg-slate-950 p-4 sm:p-8 overflow-auto flex justify-center items-start"
            >
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="flex flex-col items-center pb-12"
              >
                {/* Secondary View Switcher if both structured and custom HTML exist */}
                {hasBothViews && (
                  <div className="mb-4 bg-surface p-1.5 rounded-2xl shadow-md border border-outline-variant/30 flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('custom')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        viewMode === 'custom'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-secondary hover:text-primary hover:bg-surface-container'
                      }`}
                    >
                      النموذج الخاص الكامل
                    </button>
                    <button
                      onClick={() => setViewMode('structured')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        viewMode === 'structured'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-secondary hover:text-primary hover:bg-surface-container'
                      }`}
                    >
                      الجدول الرسمي
                    </button>
                  </div>
                )}

                {/* Simulated Paper Sheet */}
                <div
                  style={{
                    width: sheetWidth,
                    minHeight: sheetMinHeight,
                    padding: marginPx,
                    paddingRight: gutterMm > 0 ? `calc(${marginPx} + ${gutterMm}mm)` : marginPx,
                    fontSize: `${11 * fontMultiplier}pt`,
                    lineHeight: lineHeight === 'compact' ? '1.3' : lineHeight === 'relaxed' ? '1.7' : '1.5',
                    fontFamily: fontFamily === 'ManaraDocs' ? "'ManaraDocs', 'ManaraDocsAmatti', 'Cairo', 'Amiri', sans-serif" : `${fontFamily || 'Cairo'}, sans-serif`,
                    direction: 'rtl'
                  }}
                  className={`bg-white text-neutral-900 shadow-2xl rounded-sm transition-all relative overflow-hidden ${
                    borderStyle === 'double_official' 
                      ? 'border-4 border-double border-neutral-800' 
                      : borderStyle === 'high_contrast' 
                      ? 'border-2 border-neutral-900' 
                      : 'border border-neutral-200'
                  }`}
                >
                  {/* Binding Gutter Visual Guide if enabled */}
                  {gutterMm > 0 && (
                    <div 
                      style={{ width: `${gutterMm}mm` }}
                      className="absolute top-0 right-0 bottom-0 border-l border-dashed border-red-300 bg-red-50/20 pointer-events-none flex flex-col justify-around items-center"
                      title={`هامش التثقيب والتجليد: ${gutterMm}mm`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full border border-red-400 bg-white opacity-40"></div>
                      <div className="w-2.5 h-2.5 rounded-full border border-red-400 bg-white opacity-40"></div>
                      <div className="w-2.5 h-2.5 rounded-full border border-red-400 bg-white opacity-40"></div>
                    </div>
                  )}

                  {/* Watermark Overlay in Preview Canvas */}
                  {watermarkText && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
                    >
                      <div 
                        style={{
                          transform: 'rotate(-35deg)',
                          color: 'rgba(120, 140, 115, 0.14)',
                          borderColor: 'rgba(120, 140, 115, 0.18)'
                        }}
                        className="text-6xl font-black border-4 border-dashed px-10 py-3 rounded-2xl uppercase tracking-widest whitespace-nowrap"
                      >
                        {watermarkText}
                      </div>
                    </div>
                  )}

                  {shouldRenderCustom ? (
                    /* Render Pure Custom HTML provided by the page (e.g. Daily Report custom sheet) with complete Algerian styling */
                    <div className="w-full">
                      <style>{`
                        @font-face {
                          font-family: 'ManaraDocs';
                          src: url('/ManaraDocs_Amatti.ttf') format('truetype');
                          font-weight: normal;
                          font-style: normal;
                        }
                        @font-face {
                          font-family: 'ManaraDocsAmatti';
                          src: url('/ManaraDocs_Amatti.ttf') format('truetype');
                          font-weight: normal;
                          font-style: normal;
                        }
                        .custom-rendered-sheet {
                          width: 100%;
                          color: ${isBw ? '#000000' : '#1e2819'};
                          line-height: ${lineHeight === 'compact' ? '1.3' : lineHeight === 'relaxed' ? '1.7' : '1.45'};
                          font-size: ${11 * fontMultiplier * (customScalePercent / 100)}pt;
                          font-family: ${fontFamily === 'ManaraDocs' ? "'ManaraDocs', 'ManaraDocsAmatti', 'Cairo', 'Amiri', sans-serif" : `'${fontFamily || 'Cairo'}', 'Cairo', 'Amiri', sans-serif`};
                          direction: rtl;
                          ${isBw ? 'filter: grayscale(100%) contrast(150%);' : isGrayscale ? 'filter: grayscale(100%);' : ''}
                        }
                        .custom-rendered-sheet .republic-header {
                          text-align: center;
                          font-size: ${14.5 * fontMultiplier * (customScalePercent / 100)}px;
                          font-weight: 900;
                          color: ${isBw ? '#000000' : '#1e2819'};
                          margin-bottom: 2px;
                          font-family: 'Amiri', serif;
                          letter-spacing: 0.3px;
                          ${!showHeader ? 'display: none !important;' : ''}
                        }
                        .custom-rendered-sheet .ministry-header {
                          text-align: center;
                          font-size: ${12.5 * fontMultiplier * (customScalePercent / 100)}px;
                          font-weight: 700;
                          color: ${isBw ? '#333333' : '#3c4632'};
                          margin-bottom: 5px;
                          font-family: 'Amiri', serif;
                          ${!showHeader ? 'display: none !important;' : ''}
                        }
                        .custom-rendered-sheet .institution-bar {
                          display: flex;
                          justify-content: space-between;
                          align-items: flex-start;
                          font-size: ${11 * fontMultiplier * (customScalePercent / 100)}px;
                          font-weight: bold;
                          color: #32382c;
                          border-bottom: 1.5px solid ${isBw ? '#000000' : '#c8d2c3'};
                          padding-bottom: 6px;
                          margin-bottom: 8px;
                          line-height: 1.5;
                          font-family: 'Amiri', serif;
                        }
                        .custom-rendered-sheet .title-banner {
                          background-color: ${isBw ? '#ffffff' : bgHeader};
                          color: ${textHeader};
                          border: ${isBw ? '2px solid #000000' : isGrayscale ? '1px solid #888888' : 'none'};
                          border-radius: 5px;
                          padding: 7px 14px;
                          text-align: center;
                          margin: 6px 0 8px;
                          box-shadow: 0 1px 3px rgba(43,61,34,0.2);
                        }
                        .custom-rendered-sheet .title-banner h1 {
                          margin: 0;
                          font-size: ${16 * fontMultiplier * (customScalePercent / 100)}px;
                          font-weight: 800;
                          color: ${textHeader};
                          font-family: 'Cairo', sans-serif;
                          letter-spacing: 0.4px;
                        }
                        .custom-rendered-sheet .title-banner .subtitle {
                          margin: 2px 0 0;
                          font-size: ${10.5 * fontMultiplier * (customScalePercent / 100)}px;
                          color: ${isBw ? '#000000' : isGrayscale ? '#222222' : '#e6f0dc'};
                          font-family: 'Amiri', serif;
                        }
                        .custom-rendered-sheet .summary-cards {
                          display: flex;
                          gap: 8px;
                          margin-bottom: 8px;
                        }
                        .custom-rendered-sheet .summary-card {
                          flex: 1;
                          background: ${isBw ? '#ffffff' : '#f5f8f2'};
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#d7e1cd'};
                          border-radius: 4px;
                          padding: 5px 8px;
                          text-align: center;
                        }
                        .custom-rendered-sheet .summary-card .label {
                          font-size: ${9 * fontMultiplier * (customScalePercent / 100)}px;
                          color: #64735f;
                          font-family: 'Amiri', serif;
                          margin-bottom: 1px;
                        }
                        .custom-rendered-sheet .summary-card .value {
                          font-size: ${12 * fontMultiplier * (customScalePercent / 100)}px;
                          font-weight: bold;
                          color: ${isBw ? '#000000' : brandPrimary};
                          font-family: 'Cairo', sans-serif;
                        }
                        .custom-rendered-sheet table.data-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 6px 0;
                          font-size: ${11.5 * fontMultiplier * (customScalePercent / 100)}px;
                          ${borderStyle === 'double_official' ? 'border: 3px double #2b3d22 !important;' : ''}
                        }
                        .custom-rendered-sheet table.data-table th {
                          background-color: ${isBw ? '#ffffff' : bgHeader};
                          color: ${textHeader};
                          font-weight: bold;
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : isGrayscale ? '#888888' : bgHeader};
                          padding: 6px 7px;
                          text-align: right;
                          font-family: 'Cairo', sans-serif;
                          font-size: ${10.5 * fontMultiplier * (customScalePercent / 100)}px;
                        }
                        .custom-rendered-sheet table.data-table td {
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#e1e6d7'};
                          padding: 5px 7px;
                          vertical-align: middle;
                          background-color: #ffffff;
                        }
                        ${tableStriped ? `
                          .custom-rendered-sheet table.data-table tbody tr:nth-child(even) td {
                            background-color: ${isBw ? '#ffffff' : colorMode === 'grayscale' ? '#f5f5f5' : '#f9faf7'};
                          }
                        ` : `
                          .custom-rendered-sheet table.data-table tbody tr td {
                            background-color: #ffffff !important;
                          }
                        `}
                        .custom-rendered-sheet table.observations-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 6px 0 4px;
                          font-size: ${11 * fontMultiplier * (customScalePercent / 100)}px;
                        }
                        .custom-rendered-sheet table.observations-table th {
                          background-color: ${isBw ? '#f0f0f0' : '#f5f8f2'};
                          color: ${isBw ? '#000000' : brandPrimary};
                          font-weight: bold;
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#d7e1cd'};
                          padding: 4px 6px;
                          text-align: center;
                          font-family: 'Cairo', sans-serif;
                          font-size: ${10.5 * fontMultiplier * (customScalePercent / 100)}px;
                        }
                        .custom-rendered-sheet table.observations-table td {
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#d7e1cd'};
                          padding: 6px 8px;
                          vertical-align: top;
                          min-height: 48px;
                          line-height: 1.4;
                          background: #ffffff;
                        }
                        .custom-rendered-sheet .release-line {
                          text-align: left;
                          margin: 6px 0 6px;
                          font-weight: bold;
                          font-size: ${11.5 * fontMultiplier * (customScalePercent / 100)}px;
                          color: ${isBw ? '#000000' : brandPrimary};
                          font-family: 'Cairo', sans-serif;
                        }
                        .custom-rendered-sheet .signatures-grid {
                          display: flex;
                          justify-content: space-between;
                          gap: 12px;
                          margin-top: 6px;
                          text-align: center;
                          ${!showSignatures ? 'display: none !important;' : ''}
                        }
                        .custom-rendered-sheet .sig-box {
                          flex: 1;
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#d2d7cd'};
                          border-radius: 4px;
                          padding: 6px 8px;
                          background: #fefefd;
                          min-height: ${stampSpace ? '78px' : '65px'};
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                        }
                        ${!showNazir ? `
                          .custom-rendered-sheet .signatures-grid .sig-box:nth-child(2),
                          .custom-rendered-sheet .signatures-grid .sig-box-nazir {
                            display: none !important;
                          }
                        ` : ''}
                        ${signersCount === 1 ? `
                          .custom-rendered-sheet .signatures-grid .sig-box:nth-child(2),
                          .custom-rendered-sheet .signatures-grid .sig-box:nth-child(3),
                          .custom-rendered-sheet .signatures-grid .sig-box-nazir,
                          .custom-rendered-sheet .signatures-grid .sig-box-principal {
                            display: none !important;
                          }
                        ` : ''}
                        .custom-rendered-sheet .sig-title {
                          font-weight: bold;
                          font-size: ${12 * fontMultiplier * (customScalePercent / 100)}px;
                          color: ${isBw ? '#000000' : brandPrimary};
                          font-family: 'Cairo', sans-serif;
                        }
                        .custom-rendered-sheet .sig-content {
                          min-height: 42px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        .custom-rendered-sheet .sig-placeholder {
                          color: #828c7d;
                          font-size: 10px;
                          font-family: 'Amiri', serif;
                        }

                        /* Universal styling for any table inside custom forms */
                        .custom-rendered-sheet table {
                          width: 100% !important;
                          border-collapse: collapse !important;
                          margin: 6px 0 !important;
                          font-size: ${11.5 * fontMultiplier * (customScalePercent / 100)}px;
                        }
                        .custom-rendered-sheet table th,
                        .custom-rendered-sheet th {
                          background-color: ${isBw ? '#ffffff' : bgHeader} !important;
                          color: ${textHeader} !important;
                          font-weight: bold !important;
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : isGrayscale ? '#888888' : bgHeader} !important;
                          padding: 6px 7px !important;
                          text-align: center !important;
                          font-family: 'Cairo', sans-serif !important;
                          font-size: ${10.5 * fontMultiplier * (customScalePercent / 100)}px !important;
                        }
                        .custom-rendered-sheet table td,
                        .custom-rendered-sheet td {
                          border: 1px solid ${isBw || highContrast || borderStyle === 'high_contrast' ? '#000000' : '#d2d8ce'} !important;
                          padding: 5px 7px !important;
                          vertical-align: middle !important;
                          background-color: #ffffff;
                        }
                        ${tableStriped ? `
                          .custom-rendered-sheet table tbody tr:nth-child(even) td,
                          .custom-rendered-sheet table tr:nth-child(even) td {
                            background-color: ${isBw ? '#ffffff' : colorMode === 'grayscale' ? '#f5f5f5' : '#f9faf7'};
                          }
                        ` : ''}
                        .custom-rendered-sheet .paper-wrapper {
                          width: 100% !important;
                          max-width: 100% !important;
                          min-height: auto !important;
                          margin: 0 !important;
                          padding: 0 !important;
                          box-shadow: none !important;
                          border: none !important;
                          background: transparent !important;
                        }

                        /* Embedded custom styles from template */
                        ${extractedCustomStyles}
                      `}</style>
                      <div 
                        className="custom-rendered-sheet w-full"
                        dangerouslySetInnerHTML={{ __html: sanitizedCustomHtml }}
                      />
                      {(showPrintDateTime || showPageNumbers) && (
                        <div className="mt-4 pt-2 border-t border-neutral-300 flex justify-between items-center text-[10px] text-neutral-500">
                          <div>{showPrintDateTime ? `طُبع بتاريخ: ${currentDateFormatted}` : ''}</div>
                          <div>{sig.customDisclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'}</div>
                          <div>{showPageNumbers ? 'صفحة 1 / 1' : ''}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Render Unified Standard Document Template */
                    <>
                      {/* Official Ministry Header */}
                      {showHeader && (
                        <div className="border-b border-neutral-300 pb-2 mb-3">
                          {inst.showRepublicHeader && (
                            <h1 className="text-center font-extrabold text-sm tracking-wide mb-0.5" style={{ color: brandPrimary }}>
                              {inst.country}
                            </h1>
                          )}
                          {inst.showMinistry && (
                            <h2 className="text-center font-bold text-xs text-neutral-600 mb-2">
                              {inst.ministry}
                            </h2>
                          )}

                          <div className="flex justify-between items-start text-[11px] leading-relaxed">
                            <div className="text-right">
                              <div>{inst.directorate}</div>
                              <div>{formatSchoolWithCommune(inst.school, inst.commune)}</div>
                              <div><strong>المصلحة / المخبر:</strong> {inst.laboratory}</div>
                            </div>

                            {inst.showLogo && (
                              <div className="text-center px-2">
                                <img src={inst.customLogoUrl || logo} alt="شعار المؤسسة" className="h-12 w-auto mx-auto object-contain" />
                              </div>
                            )}

                            <div className="text-left" dir="rtl">
                              <div><strong>السنة الدراسية:</strong> {inst.academicYear}</div>
                              {inst.showDate && <div><strong>تاريخ الإصدار:</strong> {currentDateFormatted}</div>}
                              <div><strong>المسؤول:</strong> {sig.labManagerTitle}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Document Banner Title */}
                      <div
                        style={{ backgroundColor: bgHeader, color: textHeader }}
                        className="py-2.5 px-4 rounded text-center my-3"
                      >
                        <h2 className="text-base font-black tracking-wide">{previewData.title}</h2>
                        {previewData.subtitle && (
                          <p className="text-xs opacity-90 font-medium mt-0.5">{previewData.subtitle}</p>
                        )}
                      </div>

                      {/* Summary KPI cards if present */}
                      {previewData.summaryCards && previewData.summaryCards.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
                          {previewData.summaryCards.map((sc, idx) => (
                            <div key={idx} className="border border-neutral-200 bg-neutral-50 rounded p-2 text-center">
                              <div className="text-[10px] text-neutral-500 mb-0.5">{sc.label}</div>
                              <div className="text-sm font-bold" style={{ color: brandPrimary }}>{sc.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Standard Table View */}
                      {previewData.headers && previewData.rows && (
                        <div className="my-3 overflow-x-auto">
                          <table className="w-full border-collapse text-right text-[11px]">
                            <thead>
                              <tr style={{ backgroundColor: bgHeader, color: textHeader }}>
                                {previewData.headers.map((h, i) => (
                                  <th key={i} className="border border-neutral-300 p-2 font-bold whitespace-nowrap">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.rows.map((row, rIdx) => (
                                <tr 
                                  key={rIdx} 
                                  style={{ backgroundColor: rIdx % 2 === 1 ? rowZebra : '#ffffff' }}
                                  className="hover:bg-neutral-50"
                                >
                                  {row.map((cell, cIdx) => (
                                    <td 
                                      key={cIdx} 
                                      style={{ borderColor }}
                                      className="border p-1.5 align-middle"
                                    >
                                      {cell !== null && cell !== undefined ? cell : '—'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Cards Grid Preview if present */}
                      {previewData.cards && previewData.cards.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 my-3">
                          {previewData.cards.map((card, cIdx) => (
                            <div key={cIdx} className="border border-neutral-300 rounded p-3 bg-neutral-50/50">
                              <div className="font-bold text-sm text-neutral-800 mb-1">{card.title}</div>
                              {card.code && <div className="text-[10px] font-mono text-neutral-500 mb-2">كود: {card.code}</div>}
                              <div className="space-y-1 text-xs">
                                {card.details.map((d, dIdx) => (
                                  <div key={dIdx} className="flex justify-between border-b border-neutral-200/60 pb-0.5">
                                    <span className="text-neutral-500">{d.label}:</span>
                                    <span className="font-semibold text-neutral-800">{d.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stickers Grid Preview if present */}
                      {previewData.stickers && previewData.stickers.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 my-3">
                          {previewData.stickers.map((stk, sIdx) => (
                            <div key={sIdx} className="border border-dashed border-neutral-400 p-2 text-center rounded bg-white">
                              <div className="font-bold text-xs text-neutral-800 truncate">{stk.name}</div>
                              {stk.code && <div className="text-[10px] font-mono text-neutral-600">{stk.code}</div>}
                              {stk.location && <div className="text-[9px] text-neutral-500">المكان: {stk.location}</div>}
                              <div className="mt-1 text-[9px] bg-neutral-100 p-1 rounded font-mono">{stk.qrValue}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes & Directives */}
                      {previewData.notes && (
                        <div className="my-3 p-2.5 bg-neutral-50 border-r-4 border-primary rounded text-[11px] text-neutral-700">
                          <strong className="block text-primary mb-1">ملاحظات وإرشادات:</strong>
                          <div>{previewData.notes}</div>
                        </div>
                      )}

                      {/* Official Signatures Block */}
                      {showSignatures && (
                        <div className="mt-6 pt-4 flex justify-between gap-3 border-t border-dashed border-neutral-300 text-center">
                          {sig.showLabManager && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[85px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.labManagerTitle}</div>
                                <div className="text-[9px] text-neutral-500">(التوقيع والختم)</div>
                              </div>
                              {stampSpace && (
                                <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                                  موضع الختم
                                </div>
                              )}
                            </div>
                          )}

                          {showNazir && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[85px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.nazirTitle || 'الناظر'}</div>
                                <div className="text-[9px] text-neutral-500">(التوقيع والختم)</div>
                              </div>
                              {stampSpace && (
                                <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                                  موضع الختم
                                </div>
                              )}
                            </div>
                          )}

                          {sig.showPrincipal && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[85px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.principalTitle}</div>
                                <div className="text-[9px] text-neutral-500">(التوقيع والختم)</div>
                              </div>
                              {stampSpace && (
                                <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                                  موضع الختم
                                </div>
                              )}
                            </div>
                          )}

                          {showTeacher && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[85px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.teacherTitle}</div>
                                <div className="text-[9px] text-neutral-500">(التوقيع)</div>
                              </div>
                            </div>
                          )}

                          {showInspector && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[85px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.inspectorTitle}</div>
                                <div className="text-[9px] text-neutral-500">(توقيع وختم المفتش)</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Document Standard Footer */}
                      <div className="mt-6 pt-2 border-t border-neutral-200 flex justify-between text-[9px] text-neutral-500">
                        <div>{sig.customDisclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'}</div>
                        <div>{formatSchoolWithCommune(inst.school, inst.commune)} — {inst.laboratory}</div>
                        {showPrintDateTime && <div>طُبع في: {currentDateFormatted}</div>}
                        {showPageNumbers && <div>صفحة 1 من 1</div>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Side-by-Side Collapsible Settings Sidebar */}
            <AnimatePresence>
              {showSettingsDrawer && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 360, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-[360px] bg-surface border-s border-outline-variant/30 flex flex-col flex-shrink-0 overflow-hidden"
                >
                  {/* Sidebar Header & Tab Navigation */}
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-black text-primary text-sm">
                        <Sliders size={18} />
                        <span>لوحة خيارات الطباعة</span>
                      </div>
                      <button
                        onClick={handleResetOverrides}
                        className="text-xs text-secondary hover:text-primary flex items-center gap-1 hover:underline"
                        title="استعادة الإعدادات الأصلية"
                      >
                        <RotateCcw size={13} />
                        <span>استعادة</span>
                      </button>
                    </div>

                    {/* Category Tabs: 5 comprehensive Windows categories */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/20 text-[10px] font-bold text-center">
                      <button
                        onClick={() => setActiveSettingsTab('layout')}
                        className={`py-1.5 rounded-lg transition-all ${
                          activeSettingsTab === 'layout'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        الصفحة
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab('style')}
                        className={`py-1.5 rounded-lg transition-all ${
                          activeSettingsTab === 'style'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        المظهر
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab('watermark')}
                        className={`py-1.5 rounded-lg transition-all ${
                          activeSettingsTab === 'watermark'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        العلامة
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab('header')}
                        className={`py-1.5 rounded-lg transition-all ${
                          activeSettingsTab === 'header'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        الترويسة
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab('signatures')}
                        className={`py-1.5 rounded-lg transition-all ${
                          activeSettingsTab === 'signatures'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        التوقيعات
                      </button>
                    </div>
                  </div>

                  {/* Sidebar Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Tab 1: Layout & Page Geometry */}
                    {activeSettingsTab === 'layout' && (
                      <div className="space-y-4">
                        {/* Orientation */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                            <Layout size={14} />
                            <span>اتجاه الورقة (Orientation)</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setLocalOrientation('portrait')}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                orientation === 'portrait'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary hover:bg-secondary-container/40 border-outline-variant/20'
                              }`}
                            >
                              عمودي (Portrait)
                            </button>
                            <button
                              onClick={() => setLocalOrientation('landscape')}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                orientation === 'landscape'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary hover:bg-secondary-container/40 border-outline-variant/20'
                              }`}
                            >
                              أفقي (Landscape)
                            </button>
                          </div>
                        </div>

                        {/* Paper Size */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                            <FileSpreadsheet size={14} />
                            <span>حجم الورق (Paper Size)</span>
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(['a4', 'a3', 'a5', 'letter'] as PrintPaperSize[]).map((size) => (
                              <button
                                key={size}
                                onClick={() => setLocalPaperSize(size)}
                                className={`p-2 rounded-xl border text-xs font-bold transition-all text-center uppercase ${
                                  paperSize === size
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface-container text-secondary hover:bg-secondary-container/40 border-outline-variant/20'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Margins */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary">الهوامش (Margins)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setLocalMargins('compact')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                margins === 'compact'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              مضغوطة (8mm)
                            </button>
                            <button
                              onClick={() => setLocalMargins('standard')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                margins === 'standard'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              قياسية (14mm)
                            </button>
                            <button
                              onClick={() => setLocalMargins('spacious')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                margins === 'spacious'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              واسعة (20mm)
                            </button>
                          </div>
                        </div>

                        {/* Binding Gutter Margin (Windows Hole-Punching) */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary flex items-center justify-between">
                            <span>هامش التثقيب والتجليد (Binding Gutter)</span>
                            <span className="font-mono text-[11px] text-primary">{gutterMm}mm</span>
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[0, 5, 10, 15].map((g) => (
                              <button
                                key={g}
                                onClick={() => setLocalGutterMm(g)}
                                className={`py-1.5 px-2 rounded-lg border text-xs font-bold text-center ${
                                  gutterMm === g
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface text-secondary border-outline-variant/20'
                                }`}
                              >
                                {g === 0 ? 'بدون' : `${g}mm`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Copies */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary flex items-center justify-between">
                            <span>عدد النسخ (Copies)</span>
                            <span className="font-mono text-[11px] text-primary">{copies}</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((c) => (
                              <button
                                key={c}
                                onClick={() => setLocalCopies(c)}
                                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold text-center ${
                                  copies === c
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface text-secondary border-outline-variant/20'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Font Scale & Custom Scale */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary">حجم الخط والبيانات</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setLocalScale('small')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'small'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              88% صغير
                            </button>
                            <button
                              onClick={() => setLocalScale('normal')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'normal'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              100% عادي
                            </button>
                            <button
                              onClick={() => setLocalScale('large')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'large'
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              115% كبير
                            </button>
                          </div>
                        </div>

                        {/* Custom Scale Percentage */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary flex items-center justify-between">
                            <span>نسبة ملاءمة الصفحة (Scale %)</span>
                            <span className="font-mono text-[11px] text-primary">{customScalePercent}%</span>
                          </label>
                          <div className="grid grid-cols-5 gap-1">
                            {[75, 90, 100, 110, 125].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setLocalCustomScalePercent(pct)}
                                className={`py-1.5 rounded-lg border text-[11px] font-bold text-center transition-all ${
                                  customScalePercent === pct
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface text-secondary border-outline-variant/20 hover:bg-secondary-container/30'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="140"
                            step="5"
                            value={customScalePercent}
                            onChange={(e) => setLocalCustomScalePercent(Number(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer mt-1"
                          />
                        </div>

                        {/* Font Family (نوع الخط العربي) */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary flex items-center justify-between">
                            <span>الخط العربي (Font)</span>
                          </label>
                          <select
                            value={fontFamily}
                            onChange={(e) => setLocalFontFamily(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-bold text-primary outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="Cairo">خط القاهرة الرسمي (Cairo)</option>
                            <option value="Amiri">خط أميري الكلاسيكي (Amiri)</option>
                            <option value="ManaraDocs">خط وثائق المنارة المدمج (ManaraDocs)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Style & Appearance */}
                    {activeSettingsTab === 'style' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                            <Palette size={14} />
                            <span>نمط الألوان واستهلاك الحبر</span>
                          </label>
                          <div className="space-y-1.5">
                            <button
                              onClick={() => setLocalColorMode('color')}
                              className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                colorMode === 'color'
                                  ? 'bg-primary/10 text-primary border-primary'
                                  : 'bg-surface text-secondary hover:bg-secondary-container/20 border-outline-variant/20'
                              }`}
                            >
                              <span>ملون رسمي (Full Color)</span>
                              {colorMode === 'color' && <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setLocalColorMode('grayscale')}
                              className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                colorMode === 'grayscale'
                                  ? 'bg-primary/10 text-primary border-primary'
                                  : 'bg-surface text-secondary hover:bg-secondary-container/20 border-outline-variant/20'
                              }`}
                            >
                              <span>تدرج رمادي لتوفير الحبر (Eco Grayscale)</span>
                              {colorMode === 'grayscale' && <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setLocalColorMode('blackAndWhite')}
                              className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                colorMode === 'blackAndWhite'
                                  ? 'bg-primary/10 text-primary border-primary'
                                  : 'bg-surface text-secondary hover:bg-secondary-container/20 border-outline-variant/20'
                              }`}
                            >
                              <span>أبيض وأسود عالي التباين (Monochrome)</span>
                              {colorMode === 'blackAndWhite' && <Check size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Border Style */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary">طراز الحدود والإطارات</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'standard', label: 'قياسي' },
                              { id: 'high_contrast', label: 'تباين عالي' },
                              { id: 'double_official', label: 'إطار مزدوج' }
                            ].map((b) => (
                              <button
                                key={b.id}
                                onClick={() => setLocalBorderStyle(b.id as PrintBorderStyle)}
                                className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                  borderStyle === b.id
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface text-secondary border-outline-variant/20'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Line Spacing / Text Density */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary">كثافة النص وتباعد الأسطر</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'compact', label: 'مضغوط (1.3)' },
                              { id: 'normal', label: 'عادي (1.5)' },
                              { id: 'relaxed', label: 'مريح (1.7)' }
                            ].map((l) => (
                              <button
                                key={l.id}
                                onClick={() => setLocalLineHeight(l.id as PrintLineHeight)}
                                className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                  lineHeight === l.id
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-surface text-secondary border-outline-variant/20'
                                }`}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Table Enhancements */}
                        <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>تظليل الصفوف المتناوبة (Zebra Striping)</span>
                            <input
                              type="checkbox"
                              checked={tableStriped}
                              onChange={(e) => setLocalTableStriped(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                          </label>
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>حدود بارزة عالية التباين للبيانات</span>
                            <input
                              type="checkbox"
                              checked={highContrast}
                              onChange={(e) => setLocalHighContrast(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Watermark */}
                    {activeSettingsTab === 'watermark' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                            <Sparkles size={14} />
                            <span>العلامة المائية المطبوعة (Watermark)</span>
                          </label>
                          <div className="space-y-1.5">
                            {[
                              { id: 'none', label: 'بدون علامة مائية' },
                              { id: 'official', label: 'رسمي (OFFICIAL)' },
                              { id: 'draft', label: 'مسودة عمل (DRAFT)' },
                              { id: 'confidential', label: 'سري للغاية (CONFIDENTIAL)' },
                              { id: 'certified', label: 'نسخة للمصادقة (CERTIFIED)' },
                              { id: 'lab_copy', label: 'خاص بالمخبر (LAB COPY)' },
                              { id: 'custom', label: 'نص مخصص...' }
                            ].map((w) => (
                              <button
                                key={w.id}
                                onClick={() => setLocalWatermark(w.id as PrintWatermark)}
                                className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                  watermark === w.id
                                    ? 'bg-primary/10 text-primary border-primary'
                                    : 'bg-surface text-secondary hover:bg-secondary-container/20 border-outline-variant/20'
                                }`}
                              >
                                <span>{w.label}</span>
                                {watermark === w.id && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {watermark === 'custom' && (
                          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                            <label className="text-xs font-bold text-secondary">نص العلامة المائية المخصصة</label>
                            <input
                              type="text"
                              value={localCustomWatermark}
                              onChange={(e) => setLocalCustomWatermark(e.target.value)}
                              placeholder="مثال: نسخة مؤقتة، للاطلاع فقط..."
                              className="w-full p-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold bg-surface focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Institutional Header & Footer */}
                    {activeSettingsTab === 'header' && (
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer pb-2 border-b border-outline-variant/20">
                          <span>إظهار الترويسة الرسمية</span>
                          <input
                            type="checkbox"
                            checked={showHeader}
                            onChange={(e) => setLocalShowHeader(e.target.checked)}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                        </label>

                        {showHeader && (
                          <div className="space-y-3 pt-1">
                            <label className="text-xs font-bold text-secondary">طراز الترويسة الرسمية</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'official', label: 'رسمي كامل' },
                                { id: 'compact', label: 'مدمج اقتصادي' },
                                { id: 'modern', label: 'حديث' },
                                { id: 'minimal', label: 'مبسط' }
                              ].map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => setLocalHeaderStyle(st.id as PrintHeaderStyle)}
                                  className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                    headerStyle === st.id
                                      ? 'bg-primary text-white border-primary shadow-sm'
                                      : 'bg-surface text-secondary border-outline-variant/20'
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2.5 pt-3 border-t border-outline-variant/20">
                          <label className="text-xs font-bold text-secondary block mb-1">عناصر التذييل وأسفل الصفحة</label>
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>ترقيم الصفحات (صفحة 1 من 1)</span>
                            <input
                              type="checkbox"
                              checked={showPageNumbers}
                              onChange={(e) => setLocalShowPageNumbers(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                          </label>
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>طابع تاريخ ووقت الطباعة</span>
                            <input
                              type="checkbox"
                              checked={showPrintDateTime}
                              onChange={(e) => setLocalShowPrintDateTime(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Tab 5: Signatures & Stamp */}
                    {activeSettingsTab === 'signatures' && (
                      <div className="space-y-3">
                        <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer pb-2 border-b border-outline-variant/20">
                          <span>إظهار خانات التوقيعات</span>
                          <input
                            type="checkbox"
                            checked={showSignatures}
                            onChange={(e) => setLocalShowSignatures(e.target.checked)}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                        </label>

                        {showSignatures && (
                          <div className="space-y-3 pt-1">
                            {/* Number of signers selector */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-secondary block">عدد خانات التوقيع الرسمية</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { count: 1, label: 'موقّع واحد', desc: 'مسير المخبر' },
                                  { count: 2, label: 'موقّعان (2)', desc: 'المسير + المدير' },
                                  { count: 3, label: '3 موقعين', desc: 'المسير + الناظر + المدير' }
                                ].map((s) => (
                                  <button
                                    key={s.count}
                                    type="button"
                                    onClick={() => {
                                      setLocalSignersCount(s.count);
                                      if (s.count === 3) setLocalShowNazir(true);
                                      if (s.count < 3) setLocalShowNazir(false);
                                    }}
                                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                                      signersCount === s.count
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-surface text-secondary hover:bg-secondary-container/30 border-outline-variant/20'
                                    }`}
                                  >
                                    <div className="text-xs font-bold">{s.label}</div>
                                    <div className={`text-[9px] mt-0.5 ${signersCount === s.count ? 'text-white/80' : 'text-neutral-500'}`}>
                                      {s.desc}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer p-2 rounded-xl bg-surface-container/30 border border-outline-variant/10">
                              <span>تخصيص موضع ختم المؤسسة الدائري</span>
                              <input
                                type="checkbox"
                                checked={stampSpace}
                                onChange={(e) => setLocalStampSpace(e.target.checked)}
                                className="rounded text-primary focus:ring-primary w-4 h-4"
                              />
                            </label>

                            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                              <label className="text-xs font-bold text-secondary block">تفعيل وتخصيص الموقعين</label>

                              {/* Nazir signature and stamp */}
                              <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer p-2.5 rounded-xl hover:bg-surface-container/50 border border-outline-variant/20 transition-colors">
                                <div>
                                  <span className="block font-bold text-primary">الناظر (التوقيع والختم)</span>
                                  <span className="text-[10px] text-secondary font-normal">إدراج خانة تأشيرة وختم السيد الناظر في التقرير</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={showNazir}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    setLocalShowNazir(val);
                                    setLocalSignersCount(val ? 3 : 2);
                                  }}
                                  className="rounded text-primary focus:ring-primary w-4 h-4"
                                />
                              </label>

                              {/* Teacher signature */}
                              <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer p-2.5 rounded-xl hover:bg-surface-container/50 border border-outline-variant/20 transition-colors">
                                <div>
                                  <span className="block font-bold text-primary">توقيع أستاذ(ة) المادة</span>
                                  <span className="text-[10px] text-secondary font-normal">إدراج خانة توقيع أستاذ المادة المشرف على الحصة</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={showTeacher}
                                  onChange={(e) => setLocalShowTeacher(e.target.checked)}
                                  className="rounded text-primary focus:ring-primary w-4 h-4"
                                />
                              </label>

                              {/* Inspector signature */}
                              <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer p-2.5 rounded-xl hover:bg-surface-container/50 border border-outline-variant/20 transition-colors">
                                <div>
                                  <span className="block font-bold text-primary">ختم وتوقيع مفتش المادة</span>
                                  <span className="text-[10px] text-secondary font-normal">إدراج خانة زيارة وتأشيرة مفتش التربية الوطنية</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={showInspector}
                                  onChange={(e) => setLocalShowInspector(e.target.checked)}
                                  className="rounded text-primary focus:ring-primary w-4 h-4"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sidebar Footer: Save defaults & Direct Quick Print */}
                  <div className="p-4 border-t border-outline-variant/20 bg-surface-container/50 space-y-2">
                    {saveSuccessMessage && (
                      <div className="p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold text-center animate-in fade-in">
                        {saveSuccessMessage}
                      </div>
                    )}

                    <button
                      onClick={handleSaveAsDefaults}
                      disabled={isSavingDefaults}
                      className="w-full py-2 bg-surface hover:bg-surface-container text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30"
                      title="حفظ التفضيلات الحالية كإعدادات افتراضية لجميع المطبوعات القادمة"
                    >
                      <Save size={15} />
                      <span>{isSavingDefaults ? 'جاري الحفظ...' : 'حفظ كإعدادات افتراضية'}</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <Printer size={16} />
                      <span>بدء الطباعة الآن</span>
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
