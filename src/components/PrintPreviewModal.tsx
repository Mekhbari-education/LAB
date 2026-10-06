import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Download, 
  FileDown,
  X, 
  Sliders, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Check, 
  RotateCcw,
  Palette,
  Layout,
  PenTool,
  Eye
} from 'lucide-react';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PrintService } from '../services/printService';
import { PDFService } from '../services/pdfService';
import { PrintOrientation, PrintColorMode, PrintMargins, PrintScale } from '../types/printSettings';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';

export default function PrintPreviewModal() {
  const { 
    isPreviewOpen, 
    closePrintPreview, 
    previewData, 
    settings: globalSettings 
  } = usePrintSettings();
  const { openPdfPreview } = usePdfPreview();

  // Local overrides for this specific print job
  const [localOrientation, setLocalOrientation] = useState<PrintOrientation | null>(null);
  const [localColorMode, setLocalColorMode] = useState<PrintColorMode | null>(null);
  const [localMargins, setLocalMargins] = useState<PrintMargins | null>(null);
  const [localScale, setLocalScale] = useState<PrintScale | null>(null);
  const [localShowHeader, setLocalShowHeader] = useState<boolean | null>(null);
  const [localShowSignatures, setLocalShowSignatures] = useState<boolean | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isReviewingPdf, setIsReviewingPdf] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(true);

  if (!isPreviewOpen || !previewData) {
    return null;
  }

  // Determine active effective options
  const orientation = localOrientation || previewData.suggestedOrientation || globalSettings.layout.orientation || 'portrait';
  const colorMode = localColorMode || globalSettings.appearance.colorMode || 'color';
  const margins = localMargins || globalSettings.layout.margins || 'standard';
  const scale = localScale || globalSettings.layout.fontSizeScale || 'normal';
  const showHeader = localShowHeader !== null ? localShowHeader : globalSettings.institution.headerStyle !== 'minimal';
  const showSignatures = localShowSignatures !== null ? localShowSignatures : globalSettings.signatures.showSignatures;

  // Margin in preview
  const marginPx = margins === 'compact' ? '12px' : margins === 'spacious' ? '28px' : '20px';

  // Scale multiplier for font size
  const fontMultiplier = scale === 'small' ? 0.88 : scale === 'large' ? 1.15 : 1;

  // Colors based on color mode
  const isBw = colorMode === 'blackAndWhite';
  const isGrayscale = colorMode === 'grayscale';
  const brandPrimary = isBw ? '#000000' : isGrayscale ? '#333333' : '#2b3d22';
  const bgHeader = isBw ? '#ffffff' : isGrayscale ? '#e2e2e2' : '#2b3d22';
  const textHeader = isBw ? '#000000' : isGrayscale ? '#111111' : '#ffffff';
  const rowZebra = globalSettings.appearance.tableStriped
    ? (isBw ? '#ffffff' : isGrayscale ? '#f5f5f5' : '#f9faf7')
    : '#ffffff';
  const borderColor = isBw ? '#000000' : '#d2d8ce';

  const inst = globalSettings.institution;
  const sig = globalSettings.signatures;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const activeSettings = {
        ...globalSettings,
        layout: {
          ...globalSettings.layout,
          orientation,
          margins,
          fontSizeScale: scale
        },
        appearance: {
          ...globalSettings.appearance,
          colorMode
        },
        institution: {
          ...globalSettings.institution,
          headerStyle: (showHeader ? globalSettings.institution.headerStyle : 'minimal') as any
        },
        signatures: {
          ...globalSettings.signatures,
          showSignatures
        }
      };

      const html = PrintService.generateReportHtml(previewData, activeSettings);
      await PrintService.printHtml(html, { title: previewData.title });
    } catch (e) {
      console.error('Print error:', e);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
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
    try {
      const activeSettings = {
        ...globalSettings,
        layout: {
          ...globalSettings.layout,
          orientation,
          margins,
          fontSizeScale: scale
        },
        appearance: {
          ...globalSettings.appearance,
          colorMode
        },
        institution: {
          ...globalSettings.institution,
          headerStyle: (showHeader ? globalSettings.institution.headerStyle : 'minimal') as any
        },
        signatures: {
          ...globalSettings.signatures,
          showSignatures
        }
      };
      PrintService.downloadReportWord(previewData, activeSettings);
    } catch (e) {
      console.error('Word export error:', e);
    }
  };

  const handleReviewPdf = async () => {
    setIsReviewingPdf(true);
    try {
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
        fileName: `${previewData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
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

  const handleResetOverrides = () => {
    setLocalOrientation(null);
    setLocalColorMode(null);
    setLocalMargins(null);
    setLocalScale(null);
    setLocalShowHeader(null);
    setLocalShowSignatures(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm rtl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-surface w-full max-w-7xl h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant/30 overflow-hidden"
          dir="rtl"
        >
          {/* Header bar */}
          <header className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Printer size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">معاينة وإعدادات الطباعة</h3>
                <p className="text-xs text-secondary opacity-80">{previewData.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold ${
                  showSettingsDrawer 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-surface text-secondary hover:bg-secondary-container/30 border-outline-variant/30'
                }`}
                title="تخصيص إعدادات الطباعة"
              >
                <Sliders size={18} />
                <span className="hidden sm:inline">خيارات الطباعة</span>
              </button>

              <button
                onClick={handleReviewPdf}
                disabled={isReviewingPdf}
                className="px-4 py-2.5 bg-tertiary/15 text-tertiary border border-tertiary/30 rounded-xl font-bold hover:bg-tertiary hover:text-white transition-all flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                title="معاينة ومراجعة ملف PDF بملء الشاشة مع خيارات التكبير والتدوير"
              >
                <Eye size={18} />
                <span className="hidden md:inline">{isReviewingPdf ? 'جاري التجهيز...' : 'معاينة PDF تفاعلية'}</span>
              </button>

              <button
                onClick={handleExportWord}
                className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
                title="تنزيل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)"
              >
                <FileDown size={18} />
                <span>تنزيل Word</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-4 py-2.5 bg-surface text-primary border border-outline-variant/40 rounded-xl font-bold hover:bg-primary/5 transition-all flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
              >
                <Download size={18} />
                <span>{isExportingPdf ? 'جاري التحميل...' : 'تنزيل PDF'}</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Printer size={18} />
                <span>{isPrinting ? 'جاري الإرسال للطابعة...' : 'طباعة فورية'}</span>
              </button>

              <button
                onClick={closePrintPreview}
                className="p-2.5 rounded-xl text-secondary hover:text-primary hover:bg-secondary-container/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Main workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Paper preview view area */}
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-900 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
              <div
                style={{
                  padding: marginPx,
                  width: orientation === 'landscape' ? '297mm' : '210mm',
                  minHeight: orientation === 'landscape' ? '210mm' : '297mm',
                  maxWidth: '100%',
                  fontSize: `${11 * fontMultiplier}pt`
                }}
                className={`bg-white text-neutral-900 shadow-2xl transition-all duration-200 border border-neutral-300 rounded-sm relative sheet ${
                  colorMode === 'grayscale' ? 'filter grayscale' : ''
                }`}
              >
                {/* Official header */}
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
                          <img src={logo} alt="شعار التربية" className="h-10 w-auto object-contain mx-auto" />
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

                {/* Banner title */}
                <div
                  style={{ backgroundColor: bgHeader, color: textHeader }}
                  className="py-2.5 px-4 rounded text-center my-3"
                >
                  <h2 className="text-base font-black tracking-wide">{previewData.title}</h2>
                  {previewData.subtitle && (
                    <p className="text-xs opacity-90 font-medium mt-0.5">{previewData.subtitle}</p>
                  )}
                </div>

                {/* Summary cards if present */}
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

                {/* Table preview */}
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
                              <td key={cIdx} className="border border-neutral-200 p-1.5 align-middle">
                                {cell !== null && cell !== undefined ? cell : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Notes */}
                {previewData.notes && (
                  <div className="my-3 p-2.5 bg-neutral-50 border-r-4 border-primary rounded text-[11px] text-neutral-700">
                    <strong className="block text-primary mb-1">ملاحظات وإرشادات:</strong>
                    <div>{previewData.notes}</div>
                  </div>
                )}

                {/* Signatures */}
                {showSignatures && (
                  <div className="mt-6 pt-4 flex justify-between gap-4 border-t border-dashed border-neutral-300 text-center">
                    {sig.showLabManager && (
                      <div className="flex-1 border border-dashed border-neutral-300 rounded p-2 bg-neutral-50 flex flex-col justify-between min-h-[75px]">
                        <div>
                          <div className="text-[11px] font-bold text-neutral-800">{sig.labManagerTitle}</div>
                          <div className="text-[9px] text-neutral-500">(الاسم، التوقيع والختم)</div>
                        </div>
                        {sig.reserveStampSpace && (
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
                        {sig.reserveStampSpace && (
                          <div className="w-12 h-12 rounded-full border border-dotted border-neutral-300 mx-auto my-1 flex items-center justify-center text-[8px] text-neutral-400">
                            موضع الختم
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Document footer */}
                <div className="mt-6 pt-2 border-t border-neutral-200 flex justify-between text-[9px] text-neutral-500">
                  <div>{sig.customDisclaimer || 'الأرضية الرقمية للمخابر التعليمية الجزائرية'}</div>
                  <div>{inst.school} — {inst.laboratory}</div>
                  <div>صفحة 1 من 1</div>
                </div>
              </div>
            </div>

            {/* Quick settings sidebar */}
            <AnimatePresence>
              {showSettingsDrawer && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="w-80 bg-surface border-s border-outline-variant/30 flex flex-col flex-shrink-0 overflow-y-auto p-5 space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2 font-black text-primary text-sm">
                      <Sliders size={18} />
                      <span>تخصيص أمر الطباعة</span>
                    </div>
                    <button
                      onClick={handleResetOverrides}
                      className="text-xs text-secondary hover:text-primary flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw size={13} />
                      استعادة
                    </button>
                  </div>

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

                  {/* Color Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                      <Palette size={14} />
                      <span>نمط الألوان وتوفير الحبر</span>
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
                        <span>تدرج رمادي اقتصادي (Eco)</span>
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
                        <span>أبيض وأسود للنسخ والتصوير</span>
                        {colorMode === 'blackAndWhite' && <Check size={14} />}
                      </button>
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

                  {/* Scale */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary">حجم الخط والمحتوى</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLocalScale('small')}
                        className={`p-2 rounded-xl border text-xs font-bold text-center ${
                          scale === 'small'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-container text-secondary border-outline-variant/20'
                        }`}
                      >
                        85% صغير
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

                  {/* Header & Signatures toggles */}
                  <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                    <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                      <span>إظهار الترويسة الرسمية الوزارية</span>
                      <input
                        type="checkbox"
                        checked={showHeader}
                        onChange={(e) => setLocalShowHeader(e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs font-bold text-secondary cursor-pointer">
                      <span>إظهار خانات التوقيعات والختم</span>
                      <input
                        type="checkbox"
                        checked={showSignatures}
                        onChange={(e) => setLocalShowSignatures(e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                    </label>
                  </div>

                  {/* Quick Export in Drawer */}
                  <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                    <button
                      onClick={handleExportWord}
                      className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-blue-500/20"
                      title="تنزيل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)"
                    >
                      <FileDown size={16} />
                      <span>تنزيل كملف Word (.doc)</span>
                    </button>
                    <button
                      onClick={handleExportPdf}
                      disabled={isExportingPdf}
                      className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-outline-variant/30"
                    >
                      <Download size={16} />
                      <span>تنزيل كملف PDF رسمي</span>
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
