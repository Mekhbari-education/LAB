import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  Edit3,
  Maximize2, 
  Minimize2, 
  Layers, 
  SlidersHorizontal, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Info,
  Sliders,
  QrCode,
  ShieldCheck,
  Eye,
  Search,
  ArrowRight,
  ArrowLeft,
  Building2,
  Calendar,
  Package,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { 
  InventoryItemForPrint, 
  PaperFormat, 
  PrintSides, 
  PrintScope,
  printInventoryCards,
  generateInventoryCardsHtml
} from '../services/inventoryCardPrintService';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';

interface InventoryCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItemForPrint[];
  initialItem?: InventoryItemForPrint | null;
  initialScope?: PrintScope;
  initialMode?: 'filled' | 'blank';
  schoolInfo: {
    directorate: string;
    schoolName: string;
    commune: string;
    academicYear?: string;
  };
}

export default function InventoryCardPrintModal({
  isOpen,
  onClose,
  items,
  initialItem,
  initialScope = 'all',
  initialMode = 'filled',
  schoolInfo
}: InventoryCardPrintModalProps) {
  // Modal display modes
  const [mode, setMode] = useState<'filled' | 'blank'>(initialMode);
  const [printScope, setPrintScope] = useState<PrintScope>(initialScope);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>('A5');
  const [printSides, setPrintSides] = useState<PrintSides>('both');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

  // Selected item index for single card preview / navigation
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Viewport & Zoom controls
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(true);
  const [showPrintTips, setShowPrintTips] = useState<boolean>(false);

  // Advanced print preferences
  const [copies, setCopies] = useState<number>(1);
  const [isEconomical, setIsEconomical] = useState<boolean>(false);
  const [includeOfficialHeader, setIncludeOfficialHeader] = useState<boolean>(true);
  const [includeQrCode, setIncludeQrCode] = useState<boolean>(true);
  const [includeStampBox, setIncludeStampBox] = useState<boolean>(true);
  const [lineStyle, setLineStyle] = useState<'dotted' | 'solid'>('dotted');
  const [blankRowsCount, setBlankRowsCount] = useState<number>(6);

  // Status
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setPrintScope(initialScope);
      if (initialItem && items.length > 0) {
        const found = items.findIndex(i => i.id === initialItem.id || i.serialNumber === initialItem.serialNumber);
        setSelectedIndex(found >= 0 ? found : 0);
      } else {
        setSelectedIndex(0);
      }
    }
  }, [isOpen, initialItem, initialScope, initialMode, items]);

  // Current active item
  const currentItem: InventoryItemForPrint = useMemo(() => {
    if (items.length === 0) {
      return {
        id: 'dummy',
        serialNumber: '001/2026',
        name: 'مجهر ضوئي ثنائي العينية',
        foundationalInventory: 'تأسيسي 2024',
        decennialReview: 'عشرية 2025',
        totalQuantity: 4,
        supplier: 'الديوان الوطني للمطبوعات المدرسية',
        price: '45000.00 دج',
        location: 'مخبر العلوم الطبيعية - خزانة 02',
        status: 'جيدة',
        notes: 'معدات بصرية كاملة الملحقات'
      };
    }
    return items[selectedIndex] || items[0];
  }, [items, selectedIndex]);

  // Filtered items list for quick dropdown selection
  const filteredSearchItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return items;
    const q = itemSearchQuery.toLowerCase();
    return items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.serialNumber.toLowerCase().includes(q) ||
      (i.supplier && i.supplier.toLowerCase().includes(q))
    );
  }, [items, itemSearchQuery]);

  const isBlank = mode === 'blank';

  // Print Trigger Handler
  const handlePrint = useCallback(async () => {
    setIsPrinting(true);
    try {
      let targetItems: InventoryItemForPrint[] = [];
      if (isBlank) {
        // Create blank template item
        targetItems = [{
          id: 'blank',
          serialNumber: '',
          name: '',
          foundationalInventory: '',
          decennialReview: '',
          totalQuantity: 0,
          supplier: '',
          price: '',
          location: '',
          status: '',
          notes: ''
        }];
      } else if (printScope === 'table' || printScope === 'all') {
        targetItems = items;
      } else {
        targetItems = [currentItem];
      }

      await printInventoryCards({
        items: targetItems,
        paperFormat,
        printSides,
        printScope: isBlank ? 'single' : printScope,
        directorate: schoolInfo.directorate,
        schoolName: schoolInfo.schoolName,
        commune: schoolInfo.commune,
        academicYear: schoolInfo.academicYear || '2025/2026',
        includeOfficialHeader,
        includeQrCode,
        includeStampBox
      });
    } catch (e) {
      console.error('Print cards error:', e);
    } finally {
      setIsPrinting(false);
    }
  }, [
    isBlank, 
    printScope, 
    items, 
    currentItem, 
    paperFormat, 
    printSides, 
    schoolInfo, 
    includeOfficialHeader, 
    includeQrCode, 
    includeStampBox
  ]);

  // Global Ctrl+P keyboard shortcut
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && printScope === 'single' && !isBlank) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'ArrowLeft' && printScope === 'single' && !isBlank) {
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint, onClose, printScope, isBlank, items.length]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const dataToExport = items.map((item, idx) => ({
        'الرقم الترتيبي': idx + 1,
        'رقم الجرد العام': item.serialNumber,
        'تعيين الشيء / التجهيز': item.name,
        'الجرد التأسيسي': item.foundationalInventory || '---',
        'المراجعة العشرية': item.decennialReview || '---',
        'الكمية الإجمالية': item.totalQuantity,
        'المصدر والممون': item.supplier || '---',
        'مكان الحفظ والتواجد': item.location || '---',
        'الحالة الوظيفية': item.status || 'جيدة',
        'تاريخ الخروج': item.exitDate || '---',
        'ملاحظات': item.notes || '---'
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      ws['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, 
        { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, 
        { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'سجل بطاقات الجرد');
      XLSX.writeFile(wb, `سجل_بطاقات_الجرد_${schoolInfo.schoolName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (!isOpen) return null;

  const formattedSchool = formatSchoolWithCommune(schoolInfo.schoolName, schoolInfo.commune);

  // Paper Dimensions for live canvas
  const getSimulatedDimensions = () => {
    if (printScope === 'table') {
      return { w: '297mm', h: '210mm', isLandscape: true };
    }
    if (paperFormat === 'A5') {
      return { w: '148mm', h: '210mm', isLandscape: false };
    }
    return { w: '210mm', h: '297mm', isLandscape: false };
  };

  const simDim = getSimulatedDimensions();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-1 sm:p-3 md:p-4 bg-black/75 backdrop-blur-sm rtl font-sans no-print select-none" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full bg-surface rounded-3xl shadow-2xl border border-outline/15 flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'max-w-[99vw] h-[98vh] max-h-[99vh] rounded-xl' 
              : 'max-w-7xl h-[95vh] max-h-[980px]'
          }`}
        >
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── 1. Top Modal Header & Primary Actions ─────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="px-4 sm:px-5 py-3 bg-surface-container-low border-b border-outline/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0">
                <Printer size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-primary leading-tight flex items-center gap-2">
                  <span>معاينة وإعدادات طباعة بطاقات الجرد الرسمية</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    النموذج الوزاري المعتمد
                  </span>
                </h3>
                <p className="text-[11px] text-on-surface/60 font-medium">
                  {formattedSchool} • {schoolInfo.directorate} • {items.length} تجهيز مسجل
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-surface p-1 rounded-2xl border border-outline/10 shadow-xs">
              <button
                type="button"
                onClick={() => { setMode('filled'); setPrintScope('single'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isBlank && printScope === 'single'
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface/70 hover:text-primary'
                }`}
              >
                <FileText size={13} />
                بطاقة مفردة
              </button>
              <button
                type="button"
                onClick={() => { setMode('filled'); setPrintScope('all'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isBlank && printScope === 'all'
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface/70 hover:text-primary'
                }`}
              >
                <Layers size={13} />
                جميع البطاقات ({items.length})
              </button>
              <button
                type="button"
                onClick={() => { setMode('blank'); setPrintScope('single'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isBlank 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'text-on-surface/70 hover:text-amber-700'
                }`}
              >
                <Edit3 size={13} />
                استمارة فارغة (للملء اليدوي)
              </button>
              <button
                type="button"
                onClick={() => { setMode('filled'); setPrintScope('table'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isBlank && printScope === 'table'
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface/70 hover:text-primary'
                }`}
              >
                <FileSpreadsheet size={13} />
                السجل كجدول
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Toggle Settings Drawer */}
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                  showSettingsDrawer
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                    : 'bg-surface text-on-surface/70 border-outline/10 hover:text-primary hover:bg-surface-container'
                }`}
                title="إظهار / إخفاء لوحة خيارات وتنسيق الطباعة"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">خيارات الطباعة</span>
              </button>

              {/* Excel Export */}
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="px-3 py-2 rounded-xl text-xs font-black bg-surface text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="تصدير السجل إلى ملف Excel"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden md:inline">تصدير Excel</span>
              </button>

              {/* PDF Download / Save Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-3 py-2 rounded-xl text-xs font-black bg-surface text-rose-700 dark:text-rose-400 border border-rose-300/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="حفظ أو تحميل كملف PDF (عبر نافذة الطباعة الرسمية)"
              >
                <Download size={14} />
                <span className="hidden md:inline">تحميل PDF</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-2 text-on-surface/60 hover:text-primary hover:bg-surface-container rounded-xl transition-colors cursor-pointer border border-outline/10"
                title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Main Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-black shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الطباعة...</span>
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    <span>طباعة الآن (Ctrl+P)</span>
                  </>
                )}
              </button>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-on-surface/60 hover:text-error hover:bg-error/10 rounded-xl transition-colors cursor-pointer border border-outline/10"
                title="إغلاق النافذة (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── 2. Modal Center Area: Sidebar Settings & Live Canvas ───────── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 flex overflow-hidden relative">

            {/* ── Left/Side Drawer: Printing Tools & Document Formatter ────── */}
            <AnimatePresence initial={false}>
              {showSettingsDrawer && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-container-low border-e border-outline/10 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10"
                >
                  <div className="p-4 space-y-5 text-right">
                    
                    {/* Item Navigation Selector (if single card) */}
                    {printScope === 'single' && !isBlank && (
                      <div className="p-3.5 bg-surface rounded-2xl border border-primary/15 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-primary flex items-center gap-1.5">
                            <Package size={14} />
                            <span>التجهيز المحدد للمعاينة</span>
                          </label>
                          <span className="text-[10px] font-mono font-bold text-on-surface/60 bg-surface-container px-2 py-0.5 rounded-full">
                            {selectedIndex + 1} / {items.length}
                          </span>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1))}
                            className="p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer"
                            title="التجهيز السابق"
                          >
                            <ChevronRight size={14} />
                            <span>السابق</span>
                          </button>

                          <div className="text-[11px] font-black text-primary truncate max-w-[150px] text-center">
                            {currentItem.name}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0))}
                            className="p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer"
                            title="التجهيز التالي"
                          >
                            <span>التالي</span>
                            <ChevronLeft size={14} />
                          </button>
                        </div>

                        {/* Dropdown Selector */}
                        <div className="relative pt-1">
                          <select
                            value={selectedIndex}
                            onChange={(e) => setSelectedIndex(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-outline/15 bg-surface text-xs font-bold focus:border-primary outline-none cursor-pointer"
                          >
                            {items.map((it, idx) => (
                              <option key={it.id || idx} value={idx}>
                                {idx + 1}. {it.serialNumber} — {it.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Paper Format (مقاس الورق) */}
                    {printScope !== 'table' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface/80 flex items-center justify-between">
                          <span>1. مقاس الورق (Format):</span>
                          <span className="text-[10px] text-primary font-bold">A5 قياسي</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'A5', label: 'A5 قياسي', desc: '148×210 mm' },
                            { id: 'A4', label: 'A4 كامل', desc: '210×297 mm' },
                            { id: 'A4_DUAL', label: 'A4 مزدوج', desc: 'بطاقتان/ورقة' }
                          ].map((fmt) => (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => setPaperFormat(fmt.id as PaperFormat)}
                              className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                                paperFormat === fmt.id
                                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                  : 'border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70'
                              }`}
                            >
                              <div className="text-xs font-black">{fmt.label}</div>
                              <div className="text-[9px] text-on-surface/50 font-mono mt-0.5">{fmt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Sides (أوجه البطاقة المراد طباعتها) */}
                    {printScope !== 'table' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface/80 flex items-center justify-between">
                          <span>2. أوجه الطباعة (Recto / Verso):</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'both', label: 'الوجهان معاً' },
                            { id: 'front', label: 'أمامي فقط' },
                            { id: 'back', label: 'خلفي فقط' }
                          ].map((side) => (
                            <button
                              key={side.id}
                              type="button"
                              onClick={() => setPrintSides(side.id as PrintSides)}
                              className={`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer text-xs font-black ${
                                printSides === side.id
                                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                  : 'border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70'
                              }`}
                            >
                              {side.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copies Counter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-on-surface/80 flex items-center justify-between">
                        <span>3. عدد النسخ للطباعة:</span>
                        <span className="text-xs font-mono font-bold text-primary">{copies} نسخة</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCopies(prev => Math.max(1, prev - 1))}
                          className="w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={copies}
                          onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 py-1.5 bg-surface text-center rounded-xl border border-outline/15 font-bold font-mono text-xs outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setCopies(prev => prev + 1)}
                          className="w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Toggle Options: QR, Header, Stamp */}
                    <div className="space-y-2 pt-2 border-t border-outline/10">
                      <span className="text-xs font-black text-on-surface/80 block">
                        4. خيارات المظهر والتوثيق الرسمي:
                      </span>

                      {/* Header Toggle */}
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors">
                        <span>إدراج الترويسة الرسمية للجمهورية</span>
                        <input
                          type="checkbox"
                          checked={includeOfficialHeader}
                          onChange={(e) => setIncludeOfficialHeader(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                      </label>

                      {/* QR Code Toggle */}
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors">
                        <span className="flex items-center gap-1.5">
                          <QrCode size={14} className="text-primary" />
                          <span>رمز الاستجابة السريعة (QR Code)</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={includeQrCode}
                          onChange={(e) => setIncludeQrCode(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                      </label>

                      {/* Stamp box toggle */}
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors">
                        <span>خانة تأشيرة المقتصد والمدير</span>
                        <input
                          type="checkbox"
                          checked={includeStampBox}
                          onChange={(e) => setIncludeStampBox(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                      </label>

                      {/* Eco Mode */}
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors">
                        <span>وضع التوفير الاقتصادي للحبر</span>
                        <input
                          type="checkbox"
                          checked={isEconomical}
                          onChange={(e) => setIsEconomical(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                      </label>
                    </div>

                    {/* Blank mode line style */}
                    {isBlank && (
                      <div className="space-y-2 pt-2 border-t border-outline/10">
                        <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                          تنسيق الاستمارة الفارغة:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLineStyle('dotted')}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              lineStyle === 'dotted' ? 'bg-amber-600 text-white' : 'bg-surface border-outline/15'
                            }`}
                          >
                            أسطر منقطة (...)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLineStyle('solid')}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              lineStyle === 'solid' ? 'bg-amber-600 text-white' : 'bg-surface border-outline/15'
                            }`}
                          >
                            أسطر متصلة (___)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Official Tips Dropdown */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPrintTips(prev => !prev)}
                        className="w-full text-right text-[11px] font-bold text-primary hover:underline flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1">
                          <Info size={13} />
                          <span>إرشادات طباعة الوجهين (Recto-Verso)</span>
                        </span>
                        <span>{showPrintTips ? '▲' : '▼'}</span>
                      </button>

                      {showPrintTips && (
                        <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-[10px] text-on-surface/80 leading-relaxed space-y-1">
                          <p>• <b>مقاس A5:</b> هو المقاس الرسمي المعتمد لبطاقات جرد الوسائل التعليمية بالجزائر.</p>
                          <p>• <b>الطباعة على وجهين:</b> قم بتحديد (الوجهان معاً) وضبط الطابعة على "Flip on short edge" لقلب الورقة بشكل سليم.</p>
                          <p>• <b>توفير الورق (A4 مزدوج):</b> يتيح طباعة بطاقتين مستقلتين في ورقة واحدة وقصها لاحقاً.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Right/Center Panel: Interactive Live Visual Canvas ──────── */}
            <div className="flex-1 bg-zinc-200/70 dark:bg-zinc-950 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 relative">
              
              {/* Floating Top Bar: Side Toggler, Pagination & Zoom Controls */}
              <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 z-20 bg-surface/90 backdrop-blur-md p-2 rounded-2xl border border-outline/15 shadow-sm">
                
                {/* Recto / Verso Selector */}
                {printScope !== 'table' && (
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveSide('front')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activeSide === 'front'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-on-surface/70 hover:text-primary'
                      }`}
                    >
                      الوجه الأمامي (Recto)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSide('back')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activeSide === 'back'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-on-surface/70 hover:text-primary'
                      }`}
                    >
                      الوجه الخلفي (Verso)
                    </button>
                  </div>
                )}

                {/* Card Scope Badge */}
                <div className="text-xs font-bold text-on-surface/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {printScope === 'table'
                      ? 'معاينة السجل كجدول'
                      : printScope === 'all'
                        ? `معاينة البطاقة ${selectedIndex + 1} من ${items.length}`
                        : isBlank
                          ? 'استمارة بطاقة جرد فارغة'
                          : `بطاقة رقم: ${currentItem.serialNumber}`}
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10">
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.max(50, prev - 15))}
                    className="p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer"
                    title="تصغير"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="text-[11px] font-mono font-bold px-1.5 text-on-surface/80">
                    {zoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.min(180, prev + 15))}
                    className="p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer"
                    title="تكبير"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    className="p-1 rounded-lg hover:bg-surface text-on-surface/50 hover:text-primary transition-colors cursor-pointer"
                    title="إعادة ضبط 100%"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>

              {/* ── Simulated Paper Sheet ───────────────────────────────── */}
              <div 
                className="transition-transform duration-200 origin-top my-auto shadow-2xl rounded-sm"
                style={{
                  transform: `scale(${zoom / 100})`,
                  width: simDim.w,
                  minHeight: simDim.h,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
                  border: '1px solid #d4d4d8'
                }}
              >
                {/* ── Scope A: TABLE REGISTRY VIEW ───────────────────────── */}
                {printScope === 'table' ? (
                  <div className="p-6 text-right font-sans text-black" dir="rtl">
                    {/* Header */}
                    <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs">{schoolInfo.directorate}</div>
                        <div className="font-bold text-xs">{formattedSchool}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-sm">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                        <div className="font-bold text-xs">وزارة التربية الوطنية</div>
                        <h2 className="text-base font-black mt-2 underline">سجل بطاقات الجرد العام للوسائل والتجهيزات</h2>
                      </div>
                      <div className="text-left font-bold text-xs">
                        <div>السنة الدراسية: {schoolInfo.academicYear || '2025/2026'}</div>
                        <div>العدد الإجمالي: {items.length}</div>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full border-collapse border border-black text-[9px] text-center">
                      <thead>
                        <tr className="bg-gray-100 font-bold border-b border-black">
                          <th className="border border-black p-1.5 w-8">#</th>
                          <th className="border border-black p-1.5 w-24">رقم الجرد</th>
                          <th className="border border-black p-1.5 text-right">تعيين الشيء ومواصفاته</th>
                          <th className="border border-black p-1.5 w-20">الجرد التأسيسي</th>
                          <th className="border border-black p-1.5 w-20">المراجعة العشرية</th>
                          <th className="border border-black p-1.5 w-12">الكمية</th>
                          <th className="border border-black p-1.5 w-28">الممون / المصدر</th>
                          <th className="border border-black p-1.5 w-16">الحالة</th>
                          <th className="border border-black p-1.5 w-24">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, 15).map((it, idx) => (
                          <tr key={it.id || idx} className="border-b border-black h-6">
                            <td className="border border-black p-1 font-bold">{idx + 1}</td>
                            <td className="border border-black p-1 font-mono font-bold">{it.serialNumber}</td>
                            <td className="border border-black p-1 text-right font-bold">{it.name}</td>
                            <td className="border border-black p-1">{it.foundationalInventory || '---'}</td>
                            <td className="border border-black p-1">{it.decennialReview || '---'}</td>
                            <td className="border border-black p-1 font-bold">{it.totalQuantity}</td>
                            <td className="border border-black p-1">{it.supplier || '---'}</td>
                            <td className="border border-black p-1">{it.status || 'جيدة'}</td>
                            <td className="border border-black p-1">{it.notes || '---'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {items.length > 15 && (
                      <div className="text-center text-[8px] text-gray-500 mt-2 italic">
                        (يتم طباعة كافة التجهيزات الـ {items.length} موزعة على صفحات السجل تلقائياً)
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Scope B: INDIVIDUAL / BATCH INVENTORY CARD ────────── */
                  <div className="p-4 sm:p-5 flex flex-col justify-between h-full font-sans text-black" dir="rtl" style={{ minHeight: simDim.h }}>
                    
                    {activeSide === 'front' ? (
                      /* ── CARD FRONT (الوجه الأمامي) ─────────────────────── */
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Official Republic Header */}
                          {includeOfficialHeader && (
                            <div className="border-b border-black pb-2 mb-2 flex items-start justify-between">
                              <div className="text-[7pt] leading-tight font-bold text-right">
                                <div>مديرية التربية لولاية: {schoolInfo.directorate.replace('مديرية التربية لولاية ', '')}</div>
                                <div>المؤسسة: {formattedSchool}</div>
                              </div>
                              <div className="text-center flex-1">
                                <div className="text-[8pt] font-black tracking-tight">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                                <div className="text-[7pt] font-bold">وزارة التربية الوطنية</div>
                              </div>
                              <div className="text-[7pt] font-bold text-left">
                                <div>السنة: {schoolInfo.academicYear || '2025/2026'}</div>
                              </div>
                            </div>
                          )}

                          {/* Card Title Banner with QR Code */}
                          <div className="border-2 border-black p-1.5 mb-2 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded border border-black flex items-center justify-center p-0.5 bg-white">
                                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                              </div>
                              <div>
                                <h1 className="text-[10pt] font-black leading-none m-0">بطاقة جرد الوسائل التعليمية</h1>
                                <span className="text-[6.5pt] font-bold text-gray-600 block mt-0.5">FICHE D'INVENTAIRE DU MATÉRIEL DIDACTIQUE</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="border border-black px-2 py-0.5 bg-white text-center">
                                <span className="text-[6.5pt] font-bold block text-gray-500">رقم الجرد العام:</span>
                                <span className="text-[9pt] font-black font-mono">
                                  {isBlank ? '....................' : currentItem.serialNumber}
                                </span>
                              </div>
                              {includeQrCode && !isBlank && (
                                <div className="border border-black p-0.5 bg-white">
                                  <QRCodeSVG 
                                    value={`INV:${currentItem.serialNumber}|${currentItem.name}|${schoolInfo.schoolName}`}
                                    size={30}
                                    level="M"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Designation & Item Info Grid */}
                          <div className="border border-black mb-2 text-[7.5pt]">
                            <div className="grid grid-cols-12 border-b border-black">
                              <div className="col-span-3 bg-gray-100 p-1 font-black border-l border-black">تعيين الشيء (Désignation):</div>
                              <div className="col-span-9 p-1 font-black text-[8.5pt]">
                                {isBlank ? '....................................................................................................' : currentItem.name}
                              </div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-black">
                              <div className="col-span-3 bg-gray-100 p-1 font-bold border-l border-black">المصدر / الممون (Fournisseur):</div>
                              <div className="col-span-4 p-1 font-bold border-l border-black">
                                {isBlank ? '....................................' : currentItem.supplier || 'وزارة التربية الوطنية'}
                              </div>
                              <div className="col-span-2 bg-gray-100 p-1 font-bold border-l border-black text-center">الكمية الإجمالية:</div>
                              <div className="col-span-3 p-1 font-black text-center font-mono">
                                {isBlank ? '..........' : currentItem.totalQuantity}
                              </div>
                            </div>
                            <div className="grid grid-cols-12">
                              <div className="col-span-3 bg-gray-100 p-1 font-bold border-l border-black">الجرد التأسيسي:</div>
                              <div className="col-span-3 p-1 font-bold border-l border-black">
                                {isBlank ? '................' : currentItem.foundationalInventory || '---'}
                              </div>
                              <div className="col-span-3 bg-gray-100 p-1 font-bold border-l border-black">المراجعة العشرية:</div>
                              <div className="col-span-3 p-1 font-bold">
                                {isBlank ? '................' : currentItem.decennialReview || '---'}
                              </div>
                            </div>
                          </div>

                          {/* Movements & Flow Table */}
                          <div>
                            <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1">
                              جدول حركات وتداول الشيء في المخابر والحصص التطبيقية:
                            </div>
                            <table className="w-full border-collapse border border-black text-[7pt] text-center">
                              <thead>
                                <tr className="bg-gray-50 font-bold border-b border-black">
                                  <th className="border border-black p-1 w-16" rowSpan={2}>التاريخ</th>
                                  <th className="border border-black p-0.5" colSpan={2}>الكمية</th>
                                  <th className="border border-black p-1 w-12" rowSpan={2}>الرصيد</th>
                                  <th className="border border-black p-1" rowSpan={2}>الأستاذ / المستلم</th>
                                  <th className="border border-black p-1 w-20" rowSpan={2}>التأشيرة</th>
                                </tr>
                                <tr className="bg-gray-50 font-bold border-b border-black">
                                  <th className="border border-black p-0.5 w-10">دخول</th>
                                  <th className="border border-black p-0.5 w-10">خروج</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...Array(paperFormat === 'A4' ? 8 : 5)].map((_, i) => (
                                  <tr key={i} className="border-b border-black h-5">
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Front Bottom Notice */}
                        <div className="text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center">
                          بطاقة جرد دائمة رسمية — يمنع إتلاف أو شطب أي بيان دون محضر رسمي معتمد من المصالح الاقتصادية.
                        </div>
                      </div>
                    ) : (
                      /* ── CARD BACK (الوجه الخلفي) ──────────────────────── */
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Back Title Header */}
                          <div className="border border-black bg-gray-100 p-1 mb-2 text-center font-black text-[8pt]">
                            الوجه الخلفي لبطاقة الجرد — المتابعة الدورية والإسقاط
                          </div>

                          {/* Section: Inspection & Verification */}
                          <div className="mb-3">
                            <div className="font-bold text-[7.5pt] mb-1">
                              1. المعاينة الدورية والحالة الفنية للتجهيز (Vérification et État):
                            </div>
                            <table className="w-full border-collapse border border-black text-[7pt] text-center">
                              <thead>
                                <tr className="bg-gray-50 font-bold border-b border-black">
                                  <th className="border border-black p-1 w-20">تاريخ المعاينة</th>
                                  <th className="border border-black p-1 w-16">الحالة الفنية</th>
                                  <th className="border border-black p-1">ملاحظات مسؤول المخبر / الصيانة</th>
                                  <th className="border border-black p-1 w-20">تأشيرة المخبري</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...Array(paperFormat === 'A4' ? 6 : 4)].map((_, i) => (
                                  <tr key={i} className="border-b border-black h-5">
                                    <td className="border border-black"></td>
                                    <td className="border border-black">{i === 0 && !isBlank ? currentItem.status : ''}</td>
                                    <td className="border border-black">{i === 0 && !isBlank ? currentItem.notes : ''}</td>
                                    <td className="border border-black"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Section: Décharge & Réforme */}
                          <div>
                            <div className="font-bold text-[7.5pt] mb-1">
                              2. الإسقاط والإتلاف والتكهين (Réforme / Sortie / Décharge):
                            </div>
                            <table className="w-full border-collapse border border-black text-[7pt] text-center">
                              <thead>
                                <tr className="bg-gray-50 font-bold border-b border-black">
                                  <th className="border border-black p-1 w-20" rowSpan={2}>تاريخ السند</th>
                                  <th className="border border-black p-1 w-12" rowSpan={2}>الكمية</th>
                                  <th className="border border-black p-1" rowSpan={2}>سبب الخروج / الإسقاط</th>
                                  <th className="border border-black p-1 w-24" rowSpan={2}>رقم محضر الإسقاط</th>
                                  <th className="border border-black p-0.5" colSpan={2}>التأشيرة والختم</th>
                                </tr>
                                <tr className="bg-gray-50 font-bold border-b border-black">
                                  <th className="border border-black p-0.5 w-16">المقتصد</th>
                                  <th className="border border-black p-0.5 w-16">المدير</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...Array(paperFormat === 'A4' ? 4 : 3)].map((_, i) => (
                                  <tr key={i} className="border-b border-black h-5">
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Stamp boxes if enabled */}
                        {includeStampBox && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between">
                              <div>تأشيرة وختم المقتصد:</div>
                              <div className="text-gray-400 text-[6pt]">(الاسم والتوقيع والختم)</div>
                            </div>
                            <div className="border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between">
                              <div>تأشيرة ومصادقة رئيس المؤسسة:</div>
                              <div className="text-gray-400 text-[6pt]">(الاسم والتوقيع والختم)</div>
                            </div>
                          </div>
                        )}

                        {/* Back Bottom Notice */}
                        <div className="text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center">
                          هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر.
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── 3. Modal Footer Bar ───────────────────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="px-5 py-3 bg-surface-container-low border-t border-outline/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-bold text-on-surface/70 flex items-center gap-2">
              <span className="p-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <Check size={14} />
              </span>
              <span>
                النموذج جاهز للطباعة بالتنسيق المعتمد (
                {paperFormat} • {printSides === 'both' ? 'الوجهان معاً' : printSides === 'front' ? 'وجه أمامي' : 'وجه خلفي'} • {
                  printScope === 'table' ? 'السجل كجدول' : printScope === 'all' ? `جميع البطاقات (${items.length})` : 'بطاقة مفردة'
                }
                )
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface text-on-surface/70 hover:text-on-surface hover:bg-surface-container rounded-xl text-xs font-bold transition-all border border-outline/10 cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-7 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الطباعة...</span>
                  </>
                ) : (
                  <>
                    <Printer size={15} />
                    <span>طباعة البطاقات الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
