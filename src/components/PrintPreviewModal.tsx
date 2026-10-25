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
  ChevronRight,
  ChevronLeft,
  Settings2,
  FileSpreadsheet
} from 'lucide-react';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PrintService } from '../services/printService';
import { PDFService } from '../services/pdfService';
import { 
  PrintOrientation, 
  PrintColorMode, 
  PrintMargins, 
  PrintScale,
  PrintPaperSize,
  PrintHeaderStyle
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

  // Operation States
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReviewingPdf, setIsReviewingPdf] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Viewport & Zoom Controls
  const [zoom, setZoom] = useState<number>(100);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'layout' | 'style' | 'header' | 'signatures'>('layout');
  const [viewMode, setViewMode] = useState<'custom' | 'structured'>('custom');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Reset local overrides when new preview data opens
  useEffect(() => {
    if (previewData) {
      setLocalOrientation(previewData.suggestedOrientation || null);
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
      setZoom(100);
    }
  }, [previewData]);

  // Determine active effective options
  const orientation = localOrientation || previewData?.suggestedOrientation || globalSettings.layout.orientation || 'portrait';
  const paperSize = localPaperSize || globalSettings.layout.paperSize || 'a4';
  const colorMode = localColorMode || globalSettings.appearance.colorMode || 'color';
  const margins = localMargins || globalSettings.layout.margins || 'standard';
  const scale = localScale || globalSettings.layout.fontSizeScale || 'normal';
  const showHeader = localShowHeader !== null ? localShowHeader : globalSettings.institution.headerStyle !== 'minimal';
  const showSignatures = localShowSignatures !== null ? localShowSignatures : globalSettings.signatures.showSignatures;
  const headerStyle = localHeaderStyle || globalSettings.institution.headerStyle || 'official';
  const tableStriped = localTableStriped !== null ? localTableStriped : globalSettings.appearance.tableStriped;
  const highContrast = localHighContrast !== null ? localHighContrast : globalSettings.appearance.highContrastBorders;
  const stampSpace = localStampSpace !== null ? localStampSpace : globalSettings.signatures.reserveStampSpace;

  // Build active combined settings snapshot
  const activeEffectiveSettings = useMemo(() => {
    return {
      ...globalSettings,
      layout: {
        ...globalSettings.layout,
        orientation,
        paperSize,
        margins,
        fontSizeScale: scale
      },
      appearance: {
        ...globalSettings.appearance,
        colorMode,
        tableStriped,
        highContrastBorders: highContrast
      },
      institution: {
        ...globalSettings.institution,
        headerStyle: (showHeader ? headerStyle : 'minimal') as any
      },
      signatures: {
        ...globalSettings.signatures,
        showSignatures,
        reserveStampSpace: stampSpace
      }
    };
  }, [
    globalSettings,
    orientation,
    paperSize,
    margins,
    scale,
    colorMode,
    tableStriped,
    highContrast,
    showHeader,
    headerStyle,
    showSignatures,
    stampSpace
  ]);

  const handlePrint = async () => {
    if (!previewData) return;
    setIsPrinting(true);
    try {
      const html = PrintService.generateReportHtml(previewData, activeEffectiveSettings);
      await PrintService.printHtml(html, { title: previewData.title });
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
    if (!previewData) return;
    try {
      PrintService.downloadReportWord(previewData, activeEffectiveSettings);
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

  // Guard clause ONLY after all React Hooks have executed unconditionally
  if (!isPreviewOpen || !previewData) {
    return null;
  }

  // Margin in preview
  const marginPx = margins === 'compact' ? '10px' : margins === 'spacious' ? '28px' : '18px';

  // Sheet dimensions based on paper size and orientation
  const sheetWidth = paperSize === 'a3' 
    ? (orientation === 'landscape' ? '420mm' : '297mm')
    : paperSize === 'letter'
    ? (orientation === 'landscape' ? '279.4mm' : '215.9mm')
    : (orientation === 'landscape' ? '297mm' : '210mm');

  const sheetMinHeight = paperSize === 'a3'
    ? (orientation === 'landscape' ? '297mm' : '420mm')
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
  const brandPrimary = isBw ? '#000000' : isGrayscale ? '#333333' : '#2b3d22';
  const bgHeader = isBw ? '#ffffff' : isGrayscale ? '#e2e2e2' : '#2b3d22';
  const textHeader = isBw ? '#000000' : isGrayscale ? '#111111' : '#ffffff';
  const rowZebra = tableStriped
    ? (isBw ? '#ffffff' : isGrayscale ? '#f5f5f5' : '#f9faf7')
    : '#ffffff';
  const borderColor = isBw ? '#000000' : highContrast ? '#888888' : '#d2d8ce';

  const inst = globalSettings.institution;
  const sig = globalSettings.signatures;

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
                  <span className="text-[11px] font-bold text-secondary bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30">
                    {paperSize.toUpperCase()} · {orientation === 'landscape' ? 'أفقي' : 'عمودي'}
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
                title="إظهار / إخفاء شريط إعدادات وخيارات الطباعة"
              >
                <Sliders size={17} />
                <span className="hidden sm:inline">خيارات الطباعة</span>
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
                className="my-2 flex flex-col items-center"
              >
                {/* View switcher when both views are available */}
                {hasBothViews && (
                  <div className="flex items-center gap-1.5 bg-surface/90 backdrop-blur p-1 rounded-xl border border-outline-variant/30 mb-3 shadow-md">
                    <button
                      onClick={() => setViewMode('custom')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        viewMode === 'custom' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      النموذج الأصلي
                    </button>
                    <button
                      onClick={() => setViewMode('structured')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        viewMode === 'structured' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      الجدول الرسمي المنظم
                    </button>
                  </div>
                )}

                {/* Paper sheet container */}
                <div
                  style={{
                    padding: marginPx,
                    width: sheetWidth,
                    minHeight: sheetMinHeight,
                    fontSize: `${11 * fontMultiplier}pt`
                  }}
                  className={`bg-white text-neutral-900 shadow-2xl transition-all duration-200 border border-neutral-300 rounded-sm relative select-text sheet ${
                    colorMode === 'grayscale' ? 'filter grayscale' : ''
                  }`}
                >
                  {/* If custom view is active */}
                  {shouldRenderCustom ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: previewData.customHtml || '' }} 
                      className="w-full h-full"
                    />
                  ) : (
                    <>
                      {/* Official institutional header */}
                      {showHeader && (
                        <div className="mb-4 pb-3 border-b border-neutral-300 text-center">
                          {inst.showRepublicHeader && (
                            <h4 className="font-extrabold text-sm text-neutral-800 mb-0.5" style={{ color: brandPrimary }}>
                              {inst.country}
                            </h4>
                          )}
                          {inst.showMinistry && (
                            <h5 className="font-bold text-xs text-neutral-600 mb-2">
                              {inst.ministry}
                            </h5>
                          )}

                          <div className="flex justify-between items-center text-[10px] text-neutral-700 mt-2 px-1">
                            <div className="text-right leading-relaxed">
                              <div><strong>مديرية التربية:</strong> {inst.directorate}</div>
                              <div>{formatSchoolWithCommune(inst.school, inst.commune)}</div>
                              <div><strong>المخبر:</strong> {inst.laboratory}</div>
                            </div>

                            {inst.showLogo && (
                              <div className="px-2">
                                <img src={logo} alt="شعار التربية الوطنية" className="h-10 w-auto object-contain mx-auto" />
                              </div>
                            )}

                            <div className="text-left leading-relaxed">
                              <div><strong>السنة الدراسية:</strong> {inst.academicYear}</div>
                              {inst.showDate && (
                                <div><strong>التاريخ:</strong> {new Date().toLocaleDateString('ar-DZ')}</div>
                              )}
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
                        <div className="mt-6 pt-4 flex justify-between gap-4 border-t border-dashed border-neutral-300 text-center">
                          {sig.showLabManager && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[75px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.labManagerTitle}</div>
                                <div className="text-[9px] text-neutral-500">(الاسم، التوقيع والختم)</div>
                              </div>
                              {stampSpace && (
                                <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                                  موضع الختم
                                </div>
                              )}
                            </div>
                          )}

                          {sig.showPrincipal && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[75px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.principalTitle}</div>
                                <div className="text-[9px] text-neutral-500">(تأشيرة المصادقة والختم)</div>
                              </div>
                              {stampSpace && (
                                <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                                  موضع الختم
                                </div>
                              )}
                            </div>
                          )}

                          {sig.showTeacher && (
                            <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[75px]">
                              <div>
                                <div className="text-[11px] font-bold text-neutral-800">{sig.teacherTitle}</div>
                                <div className="text-[9px] text-neutral-500">(التوقيع)</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Document Standard Footer */}
                      <div className="mt-6 pt-2 border-t border-neutral-200 flex justify-between text-[9px] text-neutral-500">
                        <div>{sig.customDisclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'}</div>
                        <div>{inst.school} — {inst.laboratory}</div>
                        <div>صفحة 1 من 1</div>
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
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-[340px] bg-surface border-s border-outline-variant/30 flex flex-col flex-shrink-0 overflow-hidden"
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

                    {/* Category Tabs */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/20 text-[11px] font-bold text-center">
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
                        الألوان
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
                            <span>اتجاه الورقة</span>
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
                            <span>حجم الورق</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['a4', 'a3', 'letter'] as PrintPaperSize[]).map((size) => (
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
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              مضغوطة
                            </button>
                            <button
                              onClick={() => setLocalMargins('standard')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                margins === 'standard'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              قياسية
                            </button>
                            <button
                              onClick={() => setLocalMargins('spacious')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                margins === 'spacious'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              واسعة
                            </button>
                          </div>
                        </div>

                        {/* Font Scale */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-secondary">حجم الخط والبيانات</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setLocalScale('small')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'small'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              88% صغير
                            </button>
                            <button
                              onClick={() => setLocalScale('normal')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'normal'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              100% عادي
                            </button>
                            <button
                              onClick={() => setLocalScale('large')}
                              className={`p-2 rounded-xl border text-xs font-bold text-center ${
                                scale === 'large'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface-container text-secondary border-outline-variant/20'
                              }`}
                            >
                              115% كبير
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Style & Ink Eco Modes */}
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
                              <span>تدرج رمادي لتوفير الحبر (Eco)</span>
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
                              <span>أبيض وأسود عالي التباين</span>
                              {colorMode === 'blackAndWhite' && <Check size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Table Enhancements */}
                        <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>تظليل الصفوف المتناوبة (Zebra)</span>
                            <input
                              type="checkbox"
                              checked={tableStriped}
                              onChange={(e) => setLocalTableStriped(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                          </label>
                          <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                            <span>حدود بارزة عالية التباين</span>
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

                    {/* Tab 3: Institutional Header */}
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
                          <div className="space-y-2 pt-1">
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
                      </div>
                    )}

                    {/* Tab 4: Signatures & Stamp */}
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
                            <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                              <span>تخصيص موضع ختم المؤسسة</span>
                              <input
                                type="checkbox"
                                checked={stampSpace}
                                onChange={(e) => setLocalStampSpace(e.target.checked)}
                                className="rounded text-primary focus:ring-primary w-4 h-4"
                              />
                            </label>
                            <p className="text-[10px] text-secondary/70">
                              تتضمن خانات التوقيع: مسؤول المخبر، مدير المؤسسة، والأستاذ المؤطر مع موضع الختم الدائري.
                            </p>
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
