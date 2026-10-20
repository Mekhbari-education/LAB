import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Download, 
  FileDown, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  Edit3,
  Maximize2,
  Minimize2,
  Layers,
  Droplet,
  Info,
  Check,
  AlignJustify,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';
import { formatSchoolWithCommune, formatOfficialRankTitle } from '../lib/utils';

export type PaperSize = 'a4' | 'a3' | 'letter' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';
export type PagesPerSheet = 1 | 2 | 4;
export type MarginOption = 'default' | 'minimum' | 'none' | 'wide';

export interface ActivityRequestData {
  orderNum: string;
  teacherName: string;
  requestDate: string;
  requestTime: string;
  executionDate: string;
  timing: string;
  className: string;
  activityType: string;
  lab: string;
  activityTitle: string;
  jobTitle?: string;
  equipItems: Array<{ id?: string; name: string; quantity: number | string; notes?: string }>;
  chemItems: Array<{ id?: string; name: string; quantity: string; formula?: string; notes?: string }>;
  signDate?: string;
  schoolInfo?: {
    country?: string;
    ministry?: string;
    directorate?: string;
    school?: string;
    commune?: string;
    laboratory?: string;
    academicYear?: string;
  };
}

interface ActivityRequestPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ActivityRequestData;
  initialMode?: 'filled' | 'blank';
}

export default function ActivityRequestPrintModal({
  isOpen,
  onClose,
  data,
  initialMode = 'filled'
}: ActivityRequestPrintModalProps) {
  const [mode, setMode] = useState<'filled' | 'blank'>(initialMode);
  const [zoom, setZoom] = useState<number>(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  
  // Advanced Printing Tools state
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [pagesPerSheet, setPagesPerSheet] = useState<PagesPerSheet>(1);
  const [margins, setMargins] = useState<MarginOption>('default');
  const [scale, setScale] = useState<number>(100);
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [backgroundGraphics, setBackgroundGraphics] = useState<boolean>(true);

  const [copies, setCopies] = useState<number>(1);
  const [isEconomical, setIsEconomical] = useState<boolean>(false);
  const [lineStyle, setLineStyle] = useState<'dotted' | 'solid'>('dotted');
  const [blankRowsCount, setBlankRowsCount] = useState<number>(12);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(true);
  const [showPrintTips, setShowPrintTips] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const isBlank = mode === 'blank';

  const schoolInfo = {
    country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    ministry: 'وزارة التربية الوطنية',
    directorate: data.schoolInfo?.directorate || 'مديرية التربية لولاية أم البواقي',
    school: data.schoolInfo?.school || 'متوسطة قطاف الطاهر - عين كرشة',
    commune: data.schoolInfo?.commune || 'عين كرشة',
    laboratory: data.lab || data.schoolInfo?.laboratory || 'مخبر العلوم الطبيعية والفيزيائية',
    academicYear: data.schoolInfo?.academicYear || '2025 / 2026',
    date: data.requestDate || new Date().toISOString().split('T')[0]
  };

  const formattedSchool = formatSchoolWithCommune(schoolInfo.school, schoolInfo.commune);
  const rawJobTitle = (() => {
    if (data.jobTitle && !data.jobTitle.includes('مدير') && !data.jobTitle.includes('أستاذ')) {
      return data.jobTitle;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade');
      if (stored && !stored.includes('مدير') && !stored.includes('أستاذ')) {
        return stored;
      }
    }
    return (data.jobTitle && !data.jobTitle.includes('مدير')) ? data.jobTitle : 'ملحق رئيس بالمخابر';
  })();
  const labOfficerTitle = formatOfficialRankTitle(rawJobTitle);

  const docTitle = 'طلب تحضير نشاط تجريبي / تطبيقي';

  const docSubtitle = isBlank
    ? 'المخبر المخصص: .................................... — عنوان النشاط التطبيقي: ....................................................................'
    : `المخبر المخصص: ${schoolInfo.laboratory} — عنوان النشاط التطبيقي: ${data.activityTitle || 'نشاط مخبري'}`;

  // Complete 8 Summary Cards (2 rows of 4) covering the requested metadata fields
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

  const validEquip = data.equipItems?.filter(e => e.name?.trim()) || [];
  const validChem = data.chemItems?.filter(c => c.name?.trim()) || [];

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);
    try {
      const html = PDFService.generateActivityRequestHtml({
        ...data,
        schoolInfo,
        jobTitle: data.jobTitle,
        isBlank,
        isEconomical,
        copies,
        lineStyle,
        blankRowsCount,
        paperSize,
        orientation,
        pagesPerSheet,
        margins,
        scale,
        showHeader,
        backgroundGraphics: backgroundGraphics && !isEconomical
      });
      await PrintService.printHtml(html, { title: docTitle });
    } catch (e) {
      console.error('Print error:', e);
    } finally {
      setIsPrinting(false);
    }
  }, [
    data, 
    schoolInfo, 
    isBlank, 
    isEconomical, 
    copies, 
    lineStyle, 
    blankRowsCount, 
    paperSize, 
    orientation, 
    pagesPerSheet, 
    margins, 
    scale, 
    showHeader, 
    backgroundGraphics, 
    docTitle
  ]);

  // Global Ctrl+P keyboard shortcut when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint]);

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      await PDFService.generateActivityRequestPDF({
        ...data,
        schoolInfo,
        jobTitle: data.jobTitle,
        isBlank,
        save: true
      });
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    PDFService.generateActivityRequestWord({
      ...data,
      schoolInfo,
      jobTitle: data.jobTitle,
      isBlank
    });
  };

  if (!isOpen) return null;

  // Paper Dimensions calculation for simulated canvas
  const getPaperDimensions = () => {
    const isLand = orientation === 'landscape';
    switch (paperSize) {
      case 'a3':
        return isLand ? { w: '420mm', h: '297mm' } : { w: '297mm', h: '420mm' };
      case 'letter':
        return isLand ? { w: '279mm', h: '216mm' } : { w: '216mm', h: '279mm' };
      case 'legal':
        return isLand ? { w: '356mm', h: '216mm' } : { w: '216mm', h: '356mm' };
      case 'a4':
      default:
        return isLand ? { w: '297mm', h: '210mm' } : { w: '210mm', h: '297mm' };
    }
  };

  const getPaddingClass = () => {
    switch (margins) {
      case 'none':
        return 'p-1';
      case 'minimum':
        return 'p-[5mm]';
      case 'wide':
        return 'p-[15mm]';
      case 'default':
      default:
        return 'p-[9mm]';
    }
  };

  const paperDim = getPaperDimensions();
  const effectiveBackgroundGraphics = backgroundGraphics && !isEconomical;

  // Single Page Sheet Content Component
  const renderDocumentContent = (miniBadge?: string) => (
    <div className="w-full h-full flex flex-col justify-between select-text text-right font-sans">
      {/* Upper Content */}
      <div>
        {miniBadge && (
          <div className="flex justify-between items-center mb-1 text-[9px] text-zinc-500 font-sans">
            <span className="bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 rounded font-bold">
              {miniBadge}
            </span>
            <span>استمارة نشاط تجريبي</span>
          </div>
        )}

        {/* Header: Republic + Ministry */}
        {showHeader && (
          <>
            <div className="text-center mb-1">
              <div className="text-[13.5px] font-black tracking-wide text-[#1e2819] font-serif">
                {schoolInfo.country}
              </div>
              <div className="text-[11.5px] font-bold text-[#3c4632] font-serif">
                {schoolInfo.ministry}
              </div>
            </div>

            {/* Institution and Laboratory Bar */}
            <div className={`flex justify-between items-start text-[10.5px] font-bold text-[#32382c] border-b pb-1 mb-2 font-serif ${
              isEconomical ? 'border-zinc-400' : 'border-[#c8d2c3]'
            }`}>
              <div className="text-right leading-relaxed">
                <div>مديرية التربية: {schoolInfo.directorate}</div>
                <div>المؤسسة: {formattedSchool}</div>
              </div>
              <div className="text-left leading-relaxed">
                <div>السنة الدراسية: {schoolInfo.academicYear}</div>
                <div>المخبر: {schoolInfo.laboratory}</div>
              </div>
            </div>
          </>
        )}

        {/* Document Title Banner */}
        <div className="text-center mb-2">
          <h2 className="text-[15.5px] font-black text-[#1b2614] m-0 font-serif tracking-tight">
            {docTitle}
          </h2>
          <p className="text-[9.5px] font-bold text-[#495443] m-0 mt-0.5 font-serif">
            {docSubtitle}
          </p>
        </div>

        {/* 8 Detailed Summary Cards (2 rows of 4) */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {summaryCards.map((card, idx) => (
            <div 
              key={idx} 
              className={`border rounded p-1 sm:p-1.5 flex justify-between items-center text-[9.5px] shadow-2xs ${
                effectiveBackgroundGraphics 
                  ? 'bg-[#f4f7f0] border-[#c8d2c3]' 
                  : 'bg-white border-zinc-400'
              }`}
            >
              <span className={`font-bold font-serif ${effectiveBackgroundGraphics ? 'text-[#424f3c]' : 'text-zinc-800'}`}>{card.label}</span>
              <span className={`font-black font-sans text-[9px] ${effectiveBackgroundGraphics ? 'text-[#1b2614]' : 'text-zinc-950'}`}>{card.value}</span>
            </div>
          ))}
        </div>

        {/* Dual Tables Side-by-Side: الوسائل والتجهيزات | المواد الكيميائية */}
        <div className="grid grid-cols-2 gap-2 mb-2 items-start">
          {/* Table 1: الوسائل والتجهيزات */}
          <div className={`border rounded overflow-hidden ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>
            <div className={`font-sans font-bold text-[10.5px] py-1 px-3 text-center ${
              effectiveBackgroundGraphics ? 'bg-[#2b3d22] text-white' : 'bg-zinc-800 text-white'
            }`}>
              الوسائل والتجهيزات
            </div>
            <table className="w-full border-collapse text-[10px] text-right">
              <thead>
                <tr className={`font-sans text-[9px] ${
                  effectiveBackgroundGraphics ? 'bg-[#f5f8f2] text-[#2b3d22]' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  <th className={`border-b border-l p-1 text-center w-7 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>#</th>
                  <th className={`border-b border-l p-1 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>الوسيلة / التجهيز المطلوب</th>
                  <th className={`border-b border-l p-1 text-center w-12 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>الكمية</th>
                  <th className={`border-b p-1 w-16 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {isBlank ? (
                  Array.from({ length: blankRowsCount }, (_, idx) => (
                    <tr key={idx} className={`h-6 sm:h-[26px] border-b last:border-0 ${
                      lineStyle === 'solid' ? 'border-b border-zinc-200' : 'border-b border-[#e1e6d7]'
                    }`}>
                      <td className={`p-1 text-center font-bold text-[9.5px] w-7 border-l ${
                        effectiveBackgroundGraphics ? 'text-[#2b3d22] bg-[#fafbf9] border-[#e1e6d7]' : 'text-zinc-800 bg-white border-zinc-300'
                      }`}>{idx + 1}</td>
                      <td className={`p-1 border-l text-[8.5px] overflow-hidden ${
                        effectiveBackgroundGraphics ? 'border-[#e1e6d7]' : 'border-zinc-300'
                      } ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] tracking-widest select-none'}`}>
                        {lineStyle === 'solid' ? '' : '....................................'}
                      </td>
                      <td className={`p-1 text-center border-l text-[8.5px] w-12 ${
                        effectiveBackgroundGraphics ? 'border-[#e1e6d7]' : 'border-zinc-300'
                      } ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] select-none'}`}>
                        {lineStyle === 'solid' ? '' : '.......'}
                      </td>
                      <td className={`p-1 text-[8.5px] w-16 ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] select-none'}`}>
                        {lineStyle === 'solid' ? '' : '................'}
                      </td>
                    </tr>
                  ))
                ) : (
                  validEquip.length > 0 ? (
                    validEquip.map((item, idx) => (
                      <tr key={`equip-${idx}`} className={`border-b border-[#e1e6d7] last:border-0 ${idx % 2 === 0 ? "bg-white" : (effectiveBackgroundGraphics ? "bg-[#fcfaf6]" : "bg-white")}`}>
                        <td className={`p-1 text-center font-bold border-l border-[#e1e6d7] ${effectiveBackgroundGraphics ? 'text-[#2b3d22] bg-[#fafbf9]' : 'text-zinc-900 bg-white'}`}>{idx + 1}</td>
                        <td className="p-1 font-bold text-[#0f172a] border-l border-[#e1e6d7]">{item.name}</td>
                        <td className="p-1 text-center font-bold text-[#2b3d22] border-l border-[#e1e6d7]">{item.quantity || 1}</td>
                        <td className="p-1 text-[#475569] text-[9px]">{item.notes || 'جاهزة'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-1 text-center font-bold text-[#2b3d22] bg-[#fafbf9] border-l border-[#e1e6d7]">1</td>
                      <td className="p-1.5 font-bold text-[#0f172a] border-l border-[#e1e6d7]">وسائل وتجهيزات التجربة المقررة</td>
                      <td className="p-1 text-center font-bold text-[#2b3d22] border-l border-[#e1e6d7]">1</td>
                      <td className="p-1.5 text-[#475569] text-[9px]">جاهزة بالمخبر</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Table 2: المواد الكيميائية */}
          <div className={`border rounded overflow-hidden ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>
            <div className={`font-sans font-bold text-[10.5px] py-1 px-3 text-center ${
              effectiveBackgroundGraphics ? 'bg-[#2b3d22] text-white' : 'bg-zinc-800 text-white'
            }`}>
              المواد الكيميائية
            </div>
            <table className="w-full border-collapse text-[10px] text-right">
              <thead>
                <tr className={`font-sans text-[9px] ${
                  effectiveBackgroundGraphics ? 'bg-[#f5f8f2] text-[#2b3d22]' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  <th className={`border-b border-l p-1 text-center w-7 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>#</th>
                  <th className={`border-b border-l p-1 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>المادة الكيميائية المطلوبة</th>
                  <th className={`border-b border-l p-1 text-center w-14 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>الصيغة</th>
                  <th className={`border-b p-1 text-center w-12 ${effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'}`}>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {isBlank ? (
                  Array.from({ length: blankRowsCount }, (_, idx) => (
                    <tr key={idx} className={`h-6 sm:h-[26px] border-b last:border-0 ${
                      lineStyle === 'solid' ? 'border-b border-zinc-200' : 'border-b border-[#e1e6d7]'
                    }`}>
                      <td className={`p-1 text-center font-bold text-[9.5px] w-7 border-l ${
                        effectiveBackgroundGraphics ? 'text-[#1e3a8a] bg-[#fafbf9] border-[#e1e6d7]' : 'text-zinc-800 bg-white border-zinc-300'
                      }`}>{idx + 1}</td>
                      <td className={`p-1 border-l text-[8.5px] overflow-hidden ${
                        effectiveBackgroundGraphics ? 'border-[#e1e6d7]' : 'border-zinc-300'
                      } ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] tracking-widest select-none'}`}>
                        {lineStyle === 'solid' ? '' : '....................................'}
                      </td>
                      <td className={`p-1 text-center border-l text-[8.5px] w-14 ${
                        effectiveBackgroundGraphics ? 'border-[#e1e6d7]' : 'border-zinc-300'
                      } ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] select-none'}`}>
                        {lineStyle === 'solid' ? '' : '.......'}
                      </td>
                      <td className={`p-1 text-center text-[8.5px] w-12 ${lineStyle === 'solid' ? '' : 'text-[#94a3b8] select-none'}`}>
                        {lineStyle === 'solid' ? '' : '.......'}
                      </td>
                    </tr>
                  ))
                ) : (
                  validChem.length > 0 ? (
                    validChem.map((item, idx) => (
                      <tr key={`chem-${idx}`} className={`border-b border-[#e1e6d7] last:border-0 ${idx % 2 === 0 ? "bg-white" : (effectiveBackgroundGraphics ? "bg-[#fcfaf6]" : "bg-white")}`}>
                        <td className={`p-1 text-center font-bold border-l border-[#e1e6d7] ${effectiveBackgroundGraphics ? 'text-[#1e3a8a] bg-[#fafbf9]' : 'text-zinc-900 bg-white'}`}>{idx + 1}</td>
                        <td className="p-1 font-bold text-[#0f172a] border-l border-[#e1e6d7]">{item.name}</td>
                        <td className="p-1 text-center font-mono font-bold text-[#2563eb] text-[9px] border-l border-[#e1e6d7]">{item.formula || '---'}</td>
                        <td className="p-1 text-center font-bold text-[#2b3d22]">{item.quantity || 'حسب التجربة'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-1 text-center font-bold text-[#1e3a8a] bg-[#fafbf9] border-l border-[#e1e6d7]">1</td>
                      <td className="p-1.5 font-bold text-[#0f172a] border-l border-[#e1e6d7]">لا تتطلب محاليل كيميائية خاصة</td>
                      <td className="p-1 text-center text-[#64748b] text-[9px] border-l border-[#e1e6d7]">---</td>
                      <td className="p-1 text-center text-[#64748b] text-[9px]">---</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Note, Location, Date & Signatures */}
      <div className="mt-auto pt-1">
        {/* Important Note */}
        <div className={`mb-1.5 p-1.5 border border-dashed rounded text-[9px] leading-relaxed ${
          effectiveBackgroundGraphics 
            ? 'bg-[#fafbf9] border-[#c8d2c3] text-[#475569]' 
            : 'bg-white border-zinc-400 text-zinc-700'
        }`}>
          <strong>ملاحظة هامة:</strong> تقدم هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل للعتاد والمحاليل.
        </div>

        {/* Release location and date: Empty writing space for blank form, exact date for filled form */}
        <div className="text-left font-bold text-[10.5px] text-[#2b3d22] font-sans mb-1.5">
          حرر بـ : {schoolInfo.commune} في : {isBlank ? (
            <span className="inline-block border-b-2 border-dashed border-[#55694d] min-w-[130px] text-center font-mono text-transparent select-none mr-1">
              &nbsp;
            </span>
          ) : (
            <span dir="ltr">{data.signDate || schoolInfo.date}</span>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className={`border rounded-lg p-2 bg-white h-18 sm:h-20 flex flex-col justify-between shadow-2xs ${
            effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'
          }`}>
            <div className="font-bold text-[11px] text-[#2b3d22] font-sans">
              أستاذ(ة) المادة
            </div>
            <div className="text-[#828c7d] text-[9px] font-serif">
              (الاسم والتوقيع)
            </div>
          </div>

          <div className={`border rounded-lg p-2 bg-white h-18 sm:h-20 flex flex-col justify-between shadow-2xs ${
            effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'
          }`}>
            <div className="font-bold text-[11px] text-[#2b3d22] font-sans">
              {labOfficerTitle}
            </div>
            <div className="text-[#828c7d] text-[9px] font-serif">
              (التوقيع والختم)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-1 sm:p-3 md:p-4 bg-black/70 backdrop-blur-sm rtl font-sans" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full bg-surface rounded-3xl shadow-2xl border border-outline/10 flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'max-w-[99vw] h-[98vh] max-h-[99vh] rounded-xl' 
              : 'max-w-7xl h-[95vh] max-h-[980px]'
          }`}
        >
          {/* Top Modal Header & Primary Actions */}
          <div className="px-4 sm:px-5 py-2.5 bg-surface-container-low border-b border-outline/10 flex flex-wrap items-center justify-between gap-2.5 select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Printer size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-primary leading-tight">معاينة وإعدادات طباعة استمارة الطلب</h3>
              </div>
            </div>

            {/* Mode Switcher Tabs (Filled vs Blank) */}
            <div className="flex items-center bg-surface p-1 rounded-xl border border-outline/10 shadow-xs">
              <button
                type="button"
                onClick={() => setMode('filled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  !isBlank 
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface/60 hover:text-primary'
                }`}
              >
                <FileText size={13} />
                الطلب المعبأ
              </button>
              <button
                type="button"
                onClick={() => setMode('blank')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  isBlank 
                    ? 'bg-primary text-on-primary shadow-xs' 
                    : 'text-on-surface/60 hover:text-primary'
                }`}
              >
                <Edit3 size={13} />
                استمارة فارغة (للملء اليدوي)
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Toggle Settings Drawer */}
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border ${
                  showSettingsDrawer
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                    : 'bg-surface text-on-surface/70 border-outline/10 hover:text-primary hover:bg-surface-container'
                }`}
                title="إظهار / إخفاء لوحة إعدادات الطباعة المتقدمة"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">خيارات الطباعة</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-3.5 sm:px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-black flex items-center gap-1.5 sm:gap-2 hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="طباعة مباشرة عبر الطابعة (Ctrl + P)"
              >
                <Printer size={15} />
                <span>{isPrinting ? 'جاري التحضير...' : `طباعة (${copies} ${copies === 1 ? 'نسخة' : copies === 2 ? 'نسختان' : 'نسخ'})`}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="px-3 py-2 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border border-rose-500/20 disabled:opacity-50"
                title="تنزيل كملف PDF رسمي"
              >
                <Download size={14} />
                PDF
              </button>

              <button
                type="button"
                onClick={handleDownloadWord}
                className="px-2.5 sm:px-3 py-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border border-blue-500/20"
                title="تنزيل كملف Word قابل للتعديل (.doc)"
              >
                <FileDown size={14} />
                Word
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-2 text-on-surface/60 hover:text-primary hover:bg-surface-container rounded-xl transition-all"
                title={isFullscreen ? "استعادة الحجم الطبيعي" : "ملء الشاشة"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-on-surface/50 hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all mr-1"
                title="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Content Split: Settings Sidebar + Live Canvas */}
          <div className="flex-1 flex overflow-hidden">
            {/* Collapsible Left Settings Drawer (Print Settings Panel) */}
            <AnimatePresence initial={false}>
              {showSettingsDrawer && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 290, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border-l border-outline/10 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden text-xs"
                >
                  <div className="p-4 space-y-4">
                    {/* Header in sidebar */}
                    <div className="flex items-center justify-between pb-2 border-b border-outline/10">
                      <span className="font-black text-primary flex items-center gap-1.5 text-xs">
                        <SlidersHorizontal size={14} />
                        إعدادات ومحددات الطباعة
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSettingsDrawer(false)}
                        className="p-1 text-on-surface/40 hover:text-on-surface rounded-lg"
                        title="إخفاء اللوحة"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* 1. Paper Size (حجم الورق) */}
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1.5">
                        حجم الورق (Paper Size):
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['a4', 'a3', 'letter', 'legal'] as PaperSize[]).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setPaperSize(size)}
                            className={`py-1.5 rounded-lg font-black uppercase text-[11px] transition-all border ${
                              paperSize === size
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Layout Orientation (الاتجاه: عمودي وأفقي) */}
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1.5">
                        الاتجاه والتخطيط (Layout):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOrientation('portrait')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border ${
                            orientation === 'portrait'
                              ? 'bg-primary text-on-primary border-primary shadow-xs'
                              : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                          }`}
                        >
                          <span className="inline-block w-3 h-4 border-2 border-current rounded-xs" />
                          <span>عمودي (Portrait)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrientation('landscape')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border ${
                            orientation === 'landscape'
                              ? 'bg-primary text-on-primary border-primary shadow-xs'
                              : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                          }`}
                        >
                          <span className="inline-block w-4 h-3 border-2 border-current rounded-xs" />
                          <span>أفقي (Landscape)</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Pages per sheet (صفحات في الورقة) */}
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1.5">
                        صفحات في الورقة (Page per Sheet):
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {([1, 2, 4] as PagesPerSheet[]).map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setPagesPerSheet(num)}
                            className={`py-1.5 px-1 rounded-lg font-bold text-[11px] transition-all border text-center ${
                              pagesPerSheet === num
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                            }`}
                          >
                            {num === 1 ? '1 صفحة' : num === 2 ? 'صفحتان (2-up)' : '4 صفحات (4-up)'}
                          </button>
                        ))}
                      </div>
                      {pagesPerSheet === 2 && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-bold">
                          ✓ مثالي لطباعة نسختين (للأستاذ وللمخبر) في ورقة A4 واحدة وقصها.
                        </p>
                      )}
                    </div>

                    {/* 4. Margins (الهوامش) */}
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1.5">
                        الهوامش (Margins):
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'default', label: 'عادي (10mm)' },
                          { id: 'minimum', label: 'ضيق (4mm)' },
                          { id: 'none', label: 'بدون (0mm)' },
                          { id: 'wide', label: 'عريض (15mm)' },
                        ].map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMargins(item.id as MarginOption)}
                            className={`py-1.5 px-1 rounded-lg font-bold text-[10.5px] transition-all border text-center ${
                              margins === item.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                            }`}
                          >
                            {item.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Scale (المقياس) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-on-surface/70">
                          المقياس (Scale):
                        </label>
                        <span className="font-mono font-black text-primary text-[11px]">{scale}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {[100, 90, 80].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setScale(s)}
                            className={`flex-1 py-1 rounded-md text-[10.5px] font-bold transition-all border ${
                              scale === s
                                ? 'bg-primary text-on-primary border-primary shadow-2xs'
                                : 'bg-surface-container-low text-on-surface/70 border-outline/10 hover:text-primary'
                            }`}
                          >
                            {s}%
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setScale(100)}
                          className="px-2 py-1 bg-surface-container-low text-on-surface/60 hover:text-primary rounded-md text-[10px] font-bold border border-outline/10"
                          title="إعادة ضبط 100%"
                        >
                          ملاءمة
                        </button>
                      </div>
                      <input 
                        type="range"
                        min="60"
                        max="140"
                        step="5"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-surface-container-high rounded cursor-pointer"
                      />
                    </div>

                    {/* 6. Options Checkboxes (Headers & Footers, Background Graphics) */}
                    <div className="pt-2 border-t border-outline/10 space-y-2">
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1">
                        خيارات متقدمة (Options):
                      </label>
                      
                      {/* Show Header & Footer Option */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showHeader}
                          onChange={(e) => setShowHeader(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-on-surface/80">
                          الرؤوس والتذييل (Header & Institution)
                        </span>
                      </label>

                      {/* Background Graphics Option */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={backgroundGraphics}
                          onChange={(e) => setBackgroundGraphics(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-on-surface/80">
                          رسومات الخلفية والألوان (Background graphics)
                        </span>
                      </label>

                      {/* Economical Toner Saver Mode */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isEconomical}
                          onChange={(e) => setIsEconomical(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-on-surface/80 flex items-center gap-1">
                          <Droplet size={12} className={isEconomical ? 'text-amber-500' : 'text-on-surface/40'} />
                          توفير الحبر (أبيض وأسود عالي التباين)
                        </span>
                      </label>
                    </div>

                    {/* 7. Copies Selector */}
                    <div className="pt-2 border-t border-outline/10">
                      <label className="block text-[11px] font-bold text-on-surface/70 mb-1.5">
                        عدد النسخ المطبوعة (Copies):
                      </label>
                      <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-outline/10">
                        <button
                          type="button"
                          onClick={() => setCopies(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-on-surface/70 bg-surface hover:text-primary shadow-xs transition-colors"
                        >
                          -
                        </button>
                        <span className="flex-1 font-mono font-black text-center text-primary text-sm">{copies}</span>
                        <button
                          type="button"
                          onClick={() => setCopies(prev => Math.min(5, prev + 1))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-on-surface/70 bg-surface hover:text-primary shadow-xs transition-colors"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setCopies(2)}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all ${
                            copies === 2 
                              ? 'bg-primary text-on-primary shadow-2xs' 
                              : 'bg-surface text-on-surface/60 hover:text-primary'
                          }`}
                        >
                          نسختان
                        </button>
                      </div>
                    </div>

                    {/* Blank Form Specific Controls */}
                    {isBlank && (
                      <div className="pt-2 border-t border-outline/10 space-y-2">
                        <label className="block text-[11px] font-bold text-on-surface/70">
                          تخصيص النموذج اليدوي:
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setLineStyle('dotted')}
                            className={`flex-1 py-1 rounded-lg text-[10.5px] font-bold transition-all border ${
                              lineStyle === 'dotted'
                                ? 'bg-primary text-on-primary border-primary shadow-2xs'
                                : 'bg-surface-container-low text-on-surface/60 border-outline/10 hover:text-primary'
                            }`}
                          >
                            أسطر منقطة
                          </button>
                          <button
                            type="button"
                            onClick={() => setLineStyle('solid')}
                            className={`flex-1 py-1 rounded-lg text-[10.5px] font-bold transition-all border ${
                              lineStyle === 'solid'
                                ? 'bg-primary text-on-primary border-primary shadow-2xs'
                                : 'bg-surface-container-low text-on-surface/60 border-outline/10 hover:text-primary'
                            }`}
                          >
                            أسطر مسطرة
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-on-surface/70 pt-1">
                          <span>عدد الأسطر الفارغة:</span>
                          <div className="flex items-center gap-1">
                            {[10, 12, 14].map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setBlankRowsCount(c)}
                                className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold border transition-all ${
                                  blankRowsCount === c
                                    ? 'bg-primary text-on-primary border-primary shadow-2xs'
                                    : 'bg-surface-container-low text-on-surface/60 border-outline/10 hover:text-primary'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Preview Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest/80">
              {/* Toolbar Sub-bar: Zoom, Fit, Quick Drawer Toggle & Tips */}
              <div className="px-4 py-2 bg-surface/80 border-b border-outline/10 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {!showSettingsDrawer && (
                    <button
                      type="button"
                      onClick={() => setShowSettingsDrawer(true)}
                      className="px-2.5 py-1 bg-surface-container-low hover:bg-primary/10 hover:text-primary text-on-surface/70 rounded-lg font-bold flex items-center gap-1 transition-all border border-outline/10"
                    >
                      <ChevronLeft size={14} />
                      <span>فتح إعدادات الطباعة</span>
                    </button>
                  )}
                  <span className="text-[11px] font-bold text-on-surface/60">
                    ورق: <strong className="text-primary uppercase">{paperSize}</strong> ({orientation === 'portrait' ? 'عمودي' : 'أفقي'}) | {pagesPerSheet === 1 ? 'صفحة/ورقة' : `${pagesPerSheet} صفحات/ورقة`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-xl border border-outline/10 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                      className="p-1 text-on-surface/60 hover:text-primary transition-colors"
                      title="تصغير المعاينة"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="text-[11px] font-mono font-bold px-1 text-on-surface/70">{zoom}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                      className="p-1 text-on-surface/60 hover:text-primary transition-colors"
                      title="تكبير المعاينة"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom(100)}
                      className="p-1 text-on-surface/40 hover:text-primary transition-colors"
                      title="الحجم الطبيعي 100%"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>

                  {/* Print Tips Button */}
                  <button
                    type="button"
                    onClick={() => setShowPrintTips(prev => !prev)}
                    className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 text-[11px] border transition-all ${
                      showPrintTips
                        ? 'bg-primary/15 text-primary border-primary/25'
                        : 'bg-surface text-on-surface/60 border-outline/10 hover:text-primary'
                    }`}
                  >
                    <Info size={13} />
                    <span className="hidden sm:inline">نصائح الطباعة</span>
                  </button>
                </div>
              </div>

              {/* Tips Banner */}
              {showPrintTips && (
                <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>
                      <strong>نصيحة المتصفح:</strong> في نافذة طباعة Google Chrome / Edge اختر نفس حجم الورق (<strong>{paperSize.toUpperCase()}</strong>)، والاتجاه (<strong>{orientation === 'portrait' ? 'عمودي' : 'أفقي'}</strong>)، وفعل خيار <strong>رسومات الخلفية (Background Graphics)</strong> لظهور الألوان، أو عطّله لتوفير الحبر.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrintTips(false)}
                    className="text-emerald-700 hover:text-emerald-950 font-bold text-[11px] underline"
                  >
                    إغلاق
                  </button>
                </div>
              )}

              {/* Document Canvas Display */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
                <div 
                  style={{ 
                    transform: `scale(${(zoom / 100) * (scale / 100)})`, 
                    transformOrigin: 'top center' 
                  }}
                  className="transition-transform duration-150 ease-out"
                >
                  {/* Simulated Paper Sheet */}
                  <div 
                    id="activity-request-sheet"
                    style={{ 
                      width: paperDim.w, 
                      minHeight: paperDim.h,
                      fontFamily: "'Amiri', 'Traditional Arabic', serif"
                    }}
                    className={`bg-white text-[#282d23] shadow-2xl rounded-sm border select-text transition-all duration-200 ${getPaddingClass()} ${
                      effectiveBackgroundGraphics ? 'border-[#d2d7cd]' : 'border-zinc-400'
                    }`}
                  >
                    {/* If pagesPerSheet === 1 */}
                    {pagesPerSheet === 1 && renderDocumentContent(copies > 1 ? `النسخة 1 من ${copies}` : undefined)}

                    {/* If pagesPerSheet === 2 (2-up side-by-side or stacked) */}
                    {pagesPerSheet === 2 && (
                      <div className={`grid gap-4 h-full ${
                        orientation === 'landscape' ? 'grid-cols-2' : 'grid-rows-2'
                      }`}>
                        <div className="border border-dashed border-zinc-300 p-3 rounded-lg flex flex-col justify-between">
                          {renderDocumentContent('النسخة 1: الأصلية (المخبر)')}
                        </div>
                        <div className="border border-dashed border-zinc-300 p-3 rounded-lg flex flex-col justify-between">
                          {renderDocumentContent('النسخة 2: نسخة أستاذ(ة) المادة')}
                        </div>
                      </div>
                    )}

                    {/* If pagesPerSheet === 4 (4-up 2x2 grid) */}
                    {pagesPerSheet === 4 && (
                      <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
                        {[1, 2, 3, 4].map(idx => (
                          <div key={idx} className="border border-dashed border-zinc-300 p-2 rounded-lg flex flex-col justify-between text-[8px]">
                            {renderDocumentContent(`نسخة مصغرة ${idx}`)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
