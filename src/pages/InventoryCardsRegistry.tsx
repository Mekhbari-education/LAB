import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Printer, 
  Search, 
  Plus, 
  Database, 
  ArrowRight,
  FileText,
  QrCode,
  Trash2,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Sliders,
  X,
  Check,
  RotateCcw,
  Layers,
  FileSpreadsheet,
  Calendar,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import logo from '/ministry-logo.png';
import { useTranslation } from 'react-i18next';
import { useSqlCollection } from '../hooks/useSqlCollection';
import { updateEquipment } from '../lib/api/equipment';
import type { Equipment } from '../types/equipment';
import { printInventoryCards } from '../services/inventoryCardPrintService';

interface InventoryItem {
  id: string;
  serialNumber: string;
  name: string;
  foundationalInventory: string;
  decennialReview: string;
  totalQuantity: number;
  supplier: string;
  price?: string;
  location?: string;
  exitDate?: string;
  status: string;
  notes: string;
}

type SortField = keyof InventoryItem | 'index';
type SortDirection = 'asc' | 'desc' | null;
type PaperFormat = 'A4' | 'A5' | 'A4_DUAL';
type PrintSides = 'both' | 'front' | 'back';
type PrintScope = 'single' | 'all' | 'table';

export default function InventoryCardsRegistry() {
  const { t, i18n } = useTranslation();
  const { schoolId, schoolName, directorate, commune } = useSchool();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Printing and Formatting State
  const [printingItem, setPrintingItem] = useState<InventoryItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>('A4');
  const [printSides, setPrintSides] = useState<PrintSides>('both');
  const [printScope, setPrintScope] = useState<PrintScope>('single');
  const [previewCardSide, setPreviewCardSide] = useState<'front' | 'back'>('front');
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [includeStampBox, setIncludeStampBox] = useState(true);
  const [includeOfficialHeader, setIncludeOfficialHeader] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const navigate = useNavigate();

  // Load equipment directly from the centralized equipment SQL database
  const { data: sqlEquipment, loading: sqlLoading } = useSqlCollection<Equipment>('equipment', '/api/db/equipment');

  useEffect(() => {
    const handleAfterPrint = () => {
      // Keep state intact or reset temporary printing item if needed
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    if (sqlEquipment) {
      const equipmentItems = sqlEquipment.map(data => ({
        id: data.id,
        serialNumber: data.serialNumber || '',
        name: data.smartNameAr || data.name || '',
        foundationalInventory: data.registrationDate || data.foundationalInventory || '',
        decennialReview: data.decennialReview || '',
        totalQuantity: data.totalQuantity || 1,
        supplier: data.source || data.supplier || '',
        price: data.price || '',
        location: data.location || '',
        exitDate: data.exitDate || '',
        status: data.status === 'functional' ? 'جيدة' : 
                data.status === 'maintenance' ? 'تحتاج صيانة' : 
                data.status === 'broken' ? 'عاطلة' : data.status || 'جيدة',
        notes: data.notes || ''
      }));
      setItems(equipmentItems);
      setLoading(sqlLoading);
    }
  }, [sqlEquipment, sqlLoading]);

  const handleUpdateItem = async (id: string, field: string, value: any) => {
    try {
      let finalValue = value;
      let finalField = field;

      // Map back status labels if needed
      if (field === 'status') {
        if (value === 'جيدة') finalValue = 'functional';
        else if (value === 'تحتاج صيانة' || value === 'في الإصلاح') finalValue = 'maintenance';
        else if (value === 'عاطلة' || value === 'مفقودة') finalValue = 'broken';
      }

      await updateEquipment(id, { [finalField]: finalValue });
      setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    } catch (error) {
      console.error('Failed to update equipment card:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortDirection || sortField === 'index') return 0;
    
    const aValue = a[sortField as keyof InventoryItem];
    const bValue = b[sortField as keyof InventoryItem];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'ar') 
        : bValue.localeCompare(aValue, 'ar');
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const filteredItems = sortedItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: items.length,
    good: items.filter(i => i.status === 'جيدة' || i.status === 'functional').length,
    maintenance: items.filter(i => i.status === 'تحتاج صيانة' || i.status === 'maintenance').length,
    broken: items.filter(i => i.status === 'عاطلة' || i.status === 'broken' || i.status === 'مفقودة').length
  };

  // Open the formatter & preview modal for a specific item
  const openPreviewForCard = (item: InventoryItem) => {
    const idx = filteredItems.findIndex(i => i.id === item.id);
    setSelectedPreviewIndex(idx >= 0 ? idx : 0);
    setPrintingItem(item);
    setPrintScope('single');
    setIsPreviewModalOpen(true);
  };

  // Open modal for batch cards
  const openBatchPreview = () => {
    setPrintingItem(null);
    setPrintScope('all');
    setSelectedPreviewIndex(0);
    setIsPreviewModalOpen(true);
  };

  // Direct print trigger with specific scope
  const triggerPrint = async (scope: PrintScope, item?: InventoryItem) => {
    setPrintScope(scope);
    if (item) {
      setPrintingItem(item);
    } else if (scope === 'single' && filteredItems[selectedPreviewIndex]) {
      setPrintingItem(filteredItems[selectedPreviewIndex]);
    } else {
      setPrintingItem(null);
    }

    setIsPrinting(true);
    try {
      let targetItems: InventoryItem[] = [];
      if (scope === 'table' || scope === 'all') {
        targetItems = filteredItems;
      } else {
        const single = item || (filteredItems[selectedPreviewIndex] ? filteredItems[selectedPreviewIndex] : printingItem || filteredItems[0]);
        targetItems = single ? [single] : [];
      }

      await printInventoryCards({
        items: targetItems,
        paperFormat,
        printSides,
        printScope: scope,
        directorate,
        schoolName,
        commune,
        includeOfficialHeader,
        includeQrCode,
        includeStampBox,
      });
    } catch (err) {
      console.warn('Iframe print error, falling back to window.print():', err);
      setTimeout(() => {
        window.print();
      }, 100);
    } finally {
      setIsPrinting(false);
    }
  };

  const currentPreviewItem = filteredItems[selectedPreviewIndex] || filteredItems[0] || printingItem;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Items to print based on scope
  const itemsToPrint = printScope === 'single' 
    ? (printingItem ? [printingItem] : (currentPreviewItem ? [currentPreviewItem] : []))
    : filteredItems;

  return (
    <>
      {/* =========================================================================
          PRINT STYLES & LAYOUT (PRINT ONLY)
          ========================================================================= */}
      <div className="hidden print:block font-sans rtl" dir="rtl">
        <style>
          {`
            @media print {
              @page {
                ${paperFormat === 'A5' 
                  ? 'size: A5 portrait; margin: 4mm;' 
                  : printScope === 'table' 
                    ? 'size: A4 landscape; margin: 8mm;' 
                    : 'size: A4 portrait; margin: 6mm;'
                }
              }

              *, *::before, *::after {
                box-sizing: border-box !important;
                overflow: visible !important;
                scrollbar-width: none !important;
              }

              html, body {
                background: white !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Cairo', 'Amiri', system-ui, -apple-system, sans-serif !important;
              }

              ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }

              .no-print, .no-print * {
                display: none !important;
              }

              /* A4 Full Card Styling */
              .pcard-a4 {
                background: white;
                border: 2px solid #000;
                padding: 5.5mm 6.5mm;
                width: 100%;
                box-sizing: border-box;
                min-height: 276mm;
                max-height: 280mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
                margin: 0 auto;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* A5 Official Standard Card */
              .pcard-a5 {
                background: white;
                border: 1.5px solid #000;
                padding: 3.5mm 4.5mm;
                width: 100%;
                box-sizing: border-box;
                min-height: 198mm;
                max-height: 200mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
                margin: 0 auto;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* A4 Dual Cards (2 cards on A4 with cut line) */
              .pcard-dual-wrapper {
                height: 280mm;
                max-height: 282mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
                box-sizing: border-box;
                overflow: visible !important;
              }

              .pcard-dual {
                background: white;
                border: 1.5px solid #000;
                padding: 3mm 4mm;
                width: 100%;
                box-sizing: border-box;
                height: 135mm;
                max-height: 136mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
              }

              .dual-cut-line {
                text-align: center;
                font-size: 8pt;
                color: #555;
                border-top: 1px dashed #777;
                margin: 2mm 0;
                padding-top: 1mm;
              }

              .pcard:last-child, .pcard-a4:last-child, .pcard-a5:last-child, .pcard-dual-wrapper:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              /* Common Official Card Components */
              .official-table {
                width: 100%;
                border-collapse: collapse;
                border: 1.5px solid #000;
                table-layout: fixed;
              }

              .official-table th {
                background: #f1f3f0 !important;
                color: #000 !important;
                border: 1px solid #000;
                font-weight: 800;
                text-align: center;
                padding: 2px 4px;
              }

              .official-table td {
                border: 1px solid #000;
                padding: 2px 4px;
                text-align: center;
              }

              .underlined-field {
                border-bottom: 1px dotted #444;
                display: inline-block;
                padding: 0 4px;
                font-weight: 700;
              }
            }
          `}
        </style>

        {/* -----------------------------------------------------------
            SCENARIO 1: FULL REGISTRY SUMMARY TABLE (A4 Landscape)
            ----------------------------------------------------------- */}
        {printScope === 'table' ? (
          <div className="w-full text-black">
            {/* Algerian Official Header */}
            <div className="border-b-2 border-black pb-3 mb-4">
              <div className="flex justify-between items-start text-xs font-bold leading-tight">
                <div>
                  مديرية التربية لولاية: {directorate}<br />
                  المؤسسة: {schoolName} ({commune})<br />
                  مخبر الوسائل التعليمية والعلوم
                </div>
                <div className="text-center">
                  <div className="text-sm font-black">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="text-xs font-bold">وزارة التربية الوطنية</div>
                  <div className="text-base font-black mt-1 underline decoration-double">سجل بطاقات الجرد العام للوسائل التعليمية</div>
                </div>
                <div className="text-left text-xs font-bold">
                  السنة الدراسية: 2025 / 2026<br />
                  تاريخ الطباعة: {new Date().toLocaleDateString('ar-DZ')}<br />
                  عدد التجهيزات: {filteredItems.length}
                </div>
              </div>
            </div>

            {/* Registry Table */}
            <table className="w-full border-collapse border-2 border-black text-[9pt]">
              <thead>
                <tr className="bg-gray-100 font-bold border-b-2 border-black">
                  <th className="border border-black p-1 text-center w-8">رقم</th>
                  <th className="border border-black p-1 text-center w-24">رقم الجرد</th>
                  <th className="border border-black p-1 text-right">تعيين الجهاز / المادة</th>
                  <th className="border border-black p-1 text-center w-24">الجرد التأسيسي</th>
                  <th className="border border-black p-1 text-center w-24">المراجعة العشرية</th>
                  <th className="border border-black p-1 text-center w-12">الكمية</th>
                  <th className="border border-black p-1 text-center w-28">الممون / المصدر</th>
                  <th className="border border-black p-1 text-center w-20">الحالة</th>
                  <th className="border border-black p-1 text-right w-40">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 text-center font-black">{item.serialNumber}</td>
                    <td className="border border-black p-1 text-right font-bold">{item.name}</td>
                    <td className="border border-black p-1 text-center">{item.foundationalInventory || '—'}</td>
                    <td className="border border-black p-1 text-center">{item.decennialReview || '—'}</td>
                    <td className="border border-black p-1 text-center font-bold">{item.totalQuantity}</td>
                    <td className="border border-black p-1 text-center">{item.supplier || '—'}</td>
                    <td className="border border-black p-1 text-center font-semibold">{item.status}</td>
                    <td className="border border-black p-1 text-right text-[8pt]">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official Signatures Footer */}
            <div className="grid grid-cols-3 gap-6 text-center text-xs font-bold mt-8 pt-4 border-t-2 border-black">
              <div>
                <p className="mb-14">المقتصد / مسير المصالح الاقتصادية</p>
                <div className="w-36 border-b border-black mx-auto"></div>
              </div>
              <div>
                <p className="mb-14">مسؤول المخبر الرئيسي</p>
                <div className="w-36 border-b border-black mx-auto"></div>
              </div>
              <div>
                <p className="mb-14">رئيس المؤسسة (المدير)</p>
                <div className="w-36 border-b border-black mx-auto"></div>
              </div>
            </div>
          </div>
        ) : (
          /* -----------------------------------------------------------
             SCENARIO 2: INDIVIDUAL / BATCH INVENTORY CARDS (A4, A5, Dual)
             ----------------------------------------------------------- */
          <div>
            {itemsToPrint.map((item) => (
              <React.Fragment key={item.id}>
                {/* --- FRONT OF CARD (الوجه الأمامي) --- */}
                {(printSides === 'both' || printSides === 'front') && (
                  <div className={paperFormat === 'A5' ? 'pcard-a5' : 'pcard-a4'}>
                    {/* Top Header */}
                    {includeOfficialHeader && (
                      <div className="border-b-2 border-black pb-1 mb-1">
                        <div className="flex justify-between items-start text-[7pt] md:text-[8pt] font-bold leading-tight">
                          <div className="text-right">
                            مديرية التربية لولاية: {directorate}<br />
                            {formatSchoolWithCommune(schoolName, commune)}<br />
                            مخبر الوسائل التعليمية والعلوم
                          </div>
                          <div className="text-center">
                            <div className="font-black text-[8pt]">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                            <div className="font-bold text-[7.5pt]">وزارة التربية الوطنية</div>
                            <div className="font-bold text-[7pt] text-gray-700">السنة الدراسية: 2025 / 2026</div>
                          </div>
                          <div className="text-left text-[7pt]">
                            بطاقة الجرد رقم:<br />
                            <span className="font-black text-[9pt] underline">{item.serialNumber}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Title Box */}
                    <div className="text-center my-1">
                      <div className="inline-block border-2 border-black bg-gray-100 px-6 py-0.5 rounded-sm">
                        <h1 className="text-[11pt] font-black tracking-wide underline decoration-double">بــطــاقـــة الجـــرد</h1>
                      </div>
                    </div>

                    {/* Foundational and Decennial Review Banner */}
                    <div className="flex justify-between items-center text-[7.5pt] font-bold border border-black bg-gray-50 px-2 py-1 mb-1.5">
                      <div>
                        <span>الجرد التأسيسي لسنة : </span>
                        <span className="font-black text-[8pt] underline">{item.foundationalInventory || '2015-10-15'}</span>
                      </div>
                      <div>
                        <span>المراجعة العشرية لسنة : </span>
                        <span className="font-black text-[8pt] underline">{item.decennialReview || '2025-10-15'}</span>
                      </div>
                    </div>

                    {/* 4-Box Technical Header Grid */}
                    <div className="grid grid-cols-4 border-2 border-black text-center text-[7.5pt] mb-2 divide-x divide-x-reverse divide-black">
                      <div className="p-1">
                        <div className="font-bold text-gray-700 border-b border-black pb-0.5 mb-1">الفهرس (الصنف)</div>
                        <div className="font-black text-[8pt] h-7 flex items-center justify-center">
                          {item.name.includes('مجهر') ? 'أجهزة بصرية' : 
                           item.name.includes('أنبوب') || item.name.includes('بيشر') ? 'زجاجيات مخبرية' : 
                           item.name.includes('مولد') || item.name.includes('ميزان') ? 'أجهزة قياس وكهرباء' : 'أجهزة وعتاد تعليمي'}
                        </div>
                      </div>
                      <div className="p-1">
                        <div className="font-bold text-gray-700 border-b border-black pb-0.5 mb-1">الفرع / الجناح</div>
                        <div className="font-black text-[8pt] h-7 flex items-center justify-center">مخبر العلوم والوسائل</div>
                      </div>
                      <div className="p-1 bg-yellow-50/20">
                        <div className="font-bold text-gray-700 border-b border-black pb-0.5 mb-1">رقم الجرد العام</div>
                        <div className="font-black text-[10pt] text-black h-7 flex items-center justify-center tracking-wider">{item.serialNumber}</div>
                      </div>
                      <div className="p-1 relative">
                        <div className="font-bold text-gray-700 border-b border-black pb-0.5 mb-0.5">ختم المؤسسة والتأشيرة</div>
                        <div className="h-7 flex items-center justify-center">
                          {includeQrCode ? (
                            <QRCodeSVG value={`DZ-EDU-INV:${item.serialNumber}:${item.name}`} size={26} />
                          ) : (
                            <span className="text-[6pt] text-gray-400">مربع الختم</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identification and Properties Details */}
                    <div className="border border-black p-2 mb-2 text-[8pt] space-y-1.5 bg-white">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black whitespace-nowrap">الـتـعـيـيـن (تعيين الشيء) :</span>
                        <span className="font-black text-[9pt] border-b border-dotted border-black flex-1 pb-0.5">{item.name}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold whitespace-nowrap">الـخـصـائـص والمـواصـفـات :</span>
                        <span className="border-b border-dotted border-black flex-1 pb-0.5">{item.notes || 'جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة.'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold whitespace-nowrap">الموقع / الحفظ :</span>
                          <span className="border-b border-dotted border-black flex-1 pb-0.5">{item.location || 'مخبر الوسائل التعليمية - الخزانة الرئيسية'}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold whitespace-nowrap">الممون / المصدر :</span>
                          <span className="border-b border-dotted border-black flex-1 pb-0.5">{item.supplier || 'المؤسسة الوطنية للوسائل التعليمية'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Movements / Entry Log Table */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[7.5pt] font-black mb-1 flex justify-between items-center">
                          <span>جدول حركات الدخول والتكفل بالعتاد:</span>
                          <span className="text-[6.5pt] font-normal text-gray-600">(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)</span>
                        </div>
                        <table className="w-full border-collapse border border-black text-[7.5pt] text-center">
                          <thead>
                            <tr className="bg-gray-100 font-bold border-b border-black">
                              <th className="border border-black p-1 w-20">تاريخ الدخول</th>
                              <th className="border border-black p-1 w-12">الكمية</th>
                              <th className="border border-black p-1 w-20">سعر الوحدة</th>
                              <th className="border border-black p-1 w-20">المبلغ الإجمالي</th>
                              <th className="border border-black p-1">الممون / المصدر</th>
                              <th className="border border-black p-1 w-28">التعيين الجديد (الموقع)</th>
                              <th className="border border-black p-1 w-20">ملاحظات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Primary Equipment Row */}
                            <tr className="border-b border-black font-semibold">
                              <td className="border border-black p-1 font-bold">{item.foundationalInventory || '2023-09-15'}</td>
                              <td className="border border-black p-1 font-black text-[8.5pt]">{item.totalQuantity}</td>
                              <td className="border border-black p-1">{item.price ? `${item.price} دج` : '—'}</td>
                              <td className="border border-black p-1 font-bold">
                                {item.price && !isNaN(Number(item.price))
                                  ? `${(Number(item.price) * item.totalQuantity).toLocaleString('ar-DZ')} دج`
                                  : '—'}
                              </td>
                              <td className="border border-black p-1">{item.supplier || '—'}</td>
                              <td className="border border-black p-1 text-[7pt]">مخبر الوسائل التعليمية</td>
                              <td className="border border-black p-1 text-[7pt]">{item.status}</td>
                            </tr>
                            {/* Empty Ruled Rows for handwriting / future updates */}
                            {[...Array(paperFormat === 'A4' ? 5 : 2)].map((_, rIdx) => (
                              <tr key={rIdx} className="border-b border-black h-6">
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Front Bottom Signature & Stamp Area */}
                      {includeStampBox && (
                        <div className="grid grid-cols-2 gap-4 text-center text-[7pt] font-bold border-t border-black pt-1.5 mt-2">
                          <div className="border border-black/40 p-1 rounded-sm bg-gray-50/50">
                            <span>تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:</span>
                            <div className="h-9"></div>
                          </div>
                          <div className="border border-black/40 p-1 rounded-sm bg-gray-50/50">
                            <span>تأشيرة وختم رئيس المؤسسة (المدير):</span>
                            <div className="h-9"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- BACK OF CARD (الوجه الخلفي - الظهر) --- */}
                {(printSides === 'both' || printSides === 'back') && (
                  <div className={paperFormat === 'A5' ? 'pcard-a5' : 'pcard-a4'}>
                    {/* Back Header Banner */}
                    <div className="border-b-2 border-black pb-1 mb-2">
                      <div className="flex justify-between items-center text-[7.5pt] font-bold">
                        <div>التكفل المستمر وحركات التعيين والإتلاف</div>
                        <div className="text-center font-black text-[9pt] underline">
                          بطاقة جرد رقم: {item.serialNumber} — {item.name}
                        </div>
                        <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
                      </div>
                    </div>

                    {/* Section 1: Prise en charge continue (التكفل المستمر) */}
                    <div className="mb-2">
                      <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1">
                        1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)
                      </div>
                      <table className="w-full border-collapse border border-black text-[7pt] text-center">
                        <thead>
                          <tr className="bg-gray-50 font-bold border-b border-black">
                            <th className="border border-black p-1 w-24">التاريخ</th>
                            <th className="border border-black p-1">اسم ولقب الموظف المسؤول</th>
                            <th className="border border-black p-1 w-28">الصفة / الوظيفة</th>
                            <th className="border border-black p-1 w-24">إمضاء المعني</th>
                            <th className="border border-black p-1 w-24">تأشيرة المقتصد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(paperFormat === 'A4' ? 6 : 4)].map((_, i) => (
                            <tr key={i} className="border-b border-black h-5">
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

                    {/* Section 2: Changement d'affectation (تغيير التعيين) */}
                    <div className="mb-2">
                      <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1">
                        2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)
                      </div>
                      <table className="w-full border-collapse border border-black text-[7pt] text-center">
                        <thead>
                          <tr className="bg-gray-50 font-bold border-b border-black">
                            <th className="border border-black p-1 w-24" rowSpan={2}>تاريخ القرار</th>
                            <th className="border border-black p-1 w-14" rowSpan={2}>الكمية</th>
                            <th className="border border-black p-1 w-28" rowSpan={2}>رقم الجرد الجديد</th>
                            <th className="border border-black p-1" rowSpan={2}>التعيين الجديد (المخبر / القاعة)</th>
                            <th className="border border-black p-0.5" colSpan={2}>الإمضاء والتأشيرة</th>
                          </tr>
                          <tr className="bg-gray-50 font-bold border-b border-black">
                            <th className="border border-black p-0.5 w-20">المقتصد</th>
                            <th className="border border-black p-0.5 w-20">العون المسؤول</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(paperFormat === 'A4' ? 4 : 2)].map((_, i) => (
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

                    {/* Section 3: Sortie & Réforme (الإسقاط والإتلاف والخروج) */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1">
                          3. الإسـقـاط والإتـلاف والخـروج (Réforme / Sortie / Décharge)
                        </div>
                        <table className="w-full border-collapse border border-black text-[7pt] text-center">
                          <thead>
                            <tr className="bg-gray-50 font-bold border-b border-black">
                              <th className="border border-black p-1 w-24" rowSpan={2}>تاريخ القرار / السند</th>
                              <th className="border border-black p-1 w-14" rowSpan={2}>الكمية</th>
                              <th className="border border-black p-1" rowSpan={2}>سبب الخروج أو الإتلاف (كسر / تقادم)</th>
                              <th className="border border-black p-1 w-28" rowSpan={2}>رقم محضر الإسقاط</th>
                              <th className="border border-black p-0.5" colSpan={2}>الإمضاء والتأشيرة</th>
                            </tr>
                            <tr className="bg-gray-50 font-bold border-b border-black">
                              <th className="border border-black p-0.5 w-20">المقتصد</th>
                              <th className="border border-black p-0.5 w-20">رئيس المؤسسة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(paperFormat === 'A4' ? 3 : 2)].map((_, i) => (
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

                      {/* Back Bottom Note */}
                      <div className="text-[6.5pt] text-gray-700 italic border-t border-black pt-1 mt-2 text-center">
                        هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر.
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          SCREEN UI (MAIN PAGE)
          ========================================================================= */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 bg-surface shadow-2xl rounded-[40px] my-8 font-sans transition-all duration-500 no-print" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Official Algeria Header */}
        <div className="border-b-4 border-double border-primary/20 pb-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 text-sm font-bold text-on-surface/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {t('inventory_cards.directorate_label', 'مديرية التربية لولاية:')} {directorate}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {formatSchoolWithCommune(schoolName, commune)}
              </div>
            </div>
            
            <div className="text-center space-y-2 flex-1">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="Ministry Logo" className="h-20 w-auto object-contain" />
              </div>
              <p className="text-xl font-black text-primary tracking-tight">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="text-lg font-bold">وزارة التربية الوطنية</p>
            </div>

            <div className="space-y-2 text-start md:text-end">
              <p className="bg-primary/5 px-4 py-1.5 rounded-full inline-block">
                {t('inventory_cards.academic_year', 'السنة الدراسية:')} <span className="font-black">2025 - 2026</span>
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-primary/10"></div>
            </div>
            <h2 className="relative inline-block bg-surface px-8 text-3xl font-black text-primary tracking-tighter decoration-primary decoration-4 underline-offset-8">
              {t('inventory_cards.registry_title', 'سجل بطاقات الجرد - مخبر الوسائل التعليمية')}
            </h2>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 no-print">
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => navigate(ROUTES.EQUIPMENT)}
              className="group flex items-center gap-2.5 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              {t('inventory_cards.btn_add_equipment', 'إضافة تجهيز')}
            </button>

            {/* PREVIEW & FORMAT BUTTON - PRIMARY ACTION */}
            <button 
              onClick={openBatchPreview}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Sliders size={18} />
              <span>معاينة وتنسيق نموذج الطباعة</span>
            </button>

            {/* DIRECT PRINT CARDS BUTTON */}
            <button 
              onClick={() => triggerPrint('all')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-secondary text-white rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Printer size={18} />
              {t('inventory_cards.btn_print_cards', 'طباعة بطاقات الجرد')}
            </button>

            {/* PRINT REGISTRY TABLE BUTTON */}
            <button 
              onClick={() => triggerPrint('table')}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-black shadow transition-all text-sm"
              title="طباعة السجل الإجمالي كجدول رسمي A4 أفقي"
            >
              <FileSpreadsheet size={18} />
              <span>طباعة السجل كجدول</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-sm group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors", i18n.language === 'ar' ? 'right-5' : 'left-5')} size={18} />
            <input
              type="text"
              placeholder={t('inventory_cards.search_placeholder', 'بحث في السجل بالرقم أو التعيين أو الممون...')}
              className={cn(
                "w-full py-3.5 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl font-bold text-xs md:text-sm shadow-inner transition-all outline-none",
                i18n.language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 no-print">
          {[
            { label: t('inventory_cards.stat_total', 'إجمالي بطاقات الجرد'), value: stats.total, color: 'border-primary', icon: Database },
            { label: t('inventory_cards.stat_good', 'في حالة جيدة'), value: stats.good, color: 'border-success', icon: Package },
            { label: t('inventory_cards.stat_maintenance', 'تحتاج صيانة'), value: stats.maintenance, color: 'border-warning', icon: Package },
            { label: t('inventory_cards.stat_broken', 'عاطلة / مفقودة'), value: stats.broken, color: 'border-error', icon: Trash2 }
          ].map((stat, i) => (
            <div key={i} className={cn("p-5 bg-surface-container-low rounded-3xl border-t-4 shadow-sm hover:shadow transition-all", stat.color)}>
              <div className="flex justify-between items-center mb-2">
                <stat.icon size={20} className="text-on-surface/40" />
                <div className="text-2xl font-black text-on-surface">{stat.value}</div>
              </div>
              <div className="text-xs font-black text-on-surface/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-3xl border border-primary/10 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[50px] cursor-pointer group"
                  onClick={() => handleSort('index')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_index', 'رقم')}
                    <SortIcon field="index" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-[130px]"
                  onClick={() => handleSort('serialNumber')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_serial', 'رقم الجرد')}
                    <SortIcon field="serialNumber" />
                  </div>
                </th>
                <th 
                  className="p-4 font-black text-xs uppercase tracking-widest border-l border-white/10 w-[24%] text-center cursor-pointer group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_name', 'تعيين الشيء')}
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group"
                  onClick={() => handleSort('foundationalInventory')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_foundational', 'الجرد التأسيسي')}
                    <SortIcon field="foundationalInventory" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group"
                  onClick={() => handleSort('decennialReview')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_decennial', 'المراجعة العشرية')}
                    <SortIcon field="decennialReview" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-20"
                  onClick={() => handleSort('totalQuantity')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_quantity', 'الكمية')}
                    <SortIcon field="totalQuantity" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group"
                  onClick={() => handleSort('supplier')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_supplier', 'الممون')}
                    <SortIcon field="supplier" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-24"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_status', 'الحالة')}
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[14%] cursor-pointer group"
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center justify-center gap-1">
                    {t('inventory_cards.col_notes', 'ملاحظات')}
                    <SortIcon field="notes" />
                  </div>
                </th>
                <th className="p-4 text-center font-black text-xs uppercase tracking-widest no-print w-[120px]">
                  {t('common.actions', 'إجراءات الطباعة')}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15, delay: index * 0.015 }}
                  className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group"
                >
                  <td className="p-3 text-center font-bold text-xs text-on-surface/40 border-l border-primary/5">{index + 1}</td>
                  <td className="p-3 border-l border-primary/5">
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all underline decoration-dotted decoration-primary/20"
                      value={item.serialNumber}
                      onChange={(e) => handleUpdateItem(item.id, 'serialNumber', e.target.value)}
                    />
                  </td>
                  <td className="p-3 border-l border-primary/5">
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all decoration-primary/20"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap">
                     <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs"
                      placeholder="الجرد التأسيسي"
                      value={item.foundationalInventory}
                      onChange={(e) => handleUpdateItem(item.id, 'foundationalInventory', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap">
                     <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs"
                      placeholder="المراجعة العشرية"
                      value={item.decennialReview}
                      onChange={(e) => handleUpdateItem(item.id, 'decennialReview', e.target.value)}
                    />
                  </td>
                  <td className="p-3 border-l border-primary/5">
                    <input 
                      type="number" 
                      className="w-14 bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1 font-bold text-xs text-center transition-all"
                      value={item.totalQuantity}
                      onChange={(e) => handleUpdateItem(item.id, 'totalQuantity', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-3 border-l border-primary/5">
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all"
                      value={item.supplier}
                      onChange={(e) => handleUpdateItem(item.id, 'supplier', e.target.value)}
                    />
                  </td>
                  <td className="p-3 border-l border-primary/5">
                    <select 
                      className="bg-transparent border-none focus:outline-none font-bold text-xs p-1 rounded-lg cursor-pointer"
                      value={item.status}
                      onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value)}
                    >
                      <option value="جيدة">{t('equipment.status_functional', 'جيدة')}</option>
                      <option value="تحتاج صيانة">{t('equipment.status_maintenance', 'تحتاج صيانة')}</option>
                      <option value="عاطلة">{t('equipment.status_broken', 'عاطلة')}</option>
                      <option value="في الإصلاح">{t('equipment.status_repair', 'في الإصلاح')}</option>
                      <option value="مفقودة">{t('equipment.status_missing', 'مفقودة')}</option>
                    </select>
                  </td>
                  <td className="p-3 border-l border-primary/5">
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all"
                      value={item.notes}
                      onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => openPreviewForCard(item)}
                        title="معاينة وتنسيق نموذج هذه البطاقة"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => triggerPrint('single', item)}
                        title={t('inventory_cards.print_individual', 'طباعة فورية لهذه البطاقة')}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex flex-wrap justify-between items-center text-xs font-black text-on-surface/40 no-print gap-4">
          <div className="flex items-center gap-2">
            <Database size={16} />
            {t('inventory_cards.item_count', 'عدد التجهيزات في السجل: {{count}} من أصل {{total}}', { count: filteredItems.length, total: items.length })}
          </div>
          <div className="italic text-[11pt] text-gray-500">
            {t('inventory_cards.official_notice', 'هذا السجل ونماذج بطاقات الجرد تعتبر وثائق رسمية لجرد الوسائل التعليمية المعتمدة')}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE PRINT TEMPLATE PREVIEW & FORMATTER MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isPreviewModalOpen && currentPreviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface rounded-3xl shadow-2xl border border-primary/20 w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[92vh]"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface">معاينة وتنسيق نموذج بطاقة الجرد للطباعة</h3>
                    <p className="text-xs font-bold text-on-surface/60">
                      تخصيص أبعاد الورق، الوجهين، والبيانات الرسمية وفق مواصفات وزارة التربية الوطنية
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 rounded-xl text-on-surface/50 hover:bg-black/5 hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Controls & Realistic Paper Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
                {/* Left Panel (in RTL: Controls & Options) */}
                <div className="lg:col-span-4 p-5 border-l border-primary/10 bg-surface-container-lowest space-y-5 text-sm">
                  {/* Scope Selector */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/70 mb-2">نطاق الطباعة:</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl">
                      <button
                        onClick={() => setPrintScope('single')}
                        className={cn(
                          "py-2 text-xs font-black rounded-lg transition-all",
                          printScope === 'single' ? "bg-primary text-white shadow" : "text-on-surface/70 hover:bg-black/5"
                        )}
                      >
                        بطاقة مفردة
                      </button>
                      <button
                        onClick={() => setPrintScope('all')}
                        className={cn(
                          "py-2 text-xs font-black rounded-lg transition-all",
                          printScope === 'all' ? "bg-primary text-white shadow" : "text-on-surface/70 hover:bg-black/5"
                        )}
                      >
                        جميع البطاقات
                      </button>
                      <button
                        onClick={() => setPrintScope('table')}
                        className={cn(
                          "py-2 text-xs font-black rounded-lg transition-all",
                          printScope === 'table' ? "bg-primary text-white shadow" : "text-on-surface/70 hover:bg-black/5"
                        )}
                      >
                        السجل كجدول
                      </button>
                    </div>
                  </div>

                  {/* Item Selector (if single or navigating) */}
                  {printScope !== 'table' && (
                    <div className="bg-surface-container-low p-3 rounded-2xl border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-on-surface/70">اختيار التجهيز للمعاينة:</label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedPreviewIndex(prev => Math.max(0, prev - 1))}
                            disabled={selectedPreviewIndex === 0}
                            className="p-1 rounded bg-surface hover:bg-primary/10 disabled:opacity-30"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <span className="text-xs font-black px-1.5">{selectedPreviewIndex + 1} / {filteredItems.length}</span>
                          <button
                            onClick={() => setSelectedPreviewIndex(prev => Math.min(filteredItems.length - 1, prev + 1))}
                            disabled={selectedPreviewIndex >= filteredItems.length - 1}
                            className="p-1 rounded bg-surface hover:bg-primary/10 disabled:opacity-30"
                          >
                            <ChevronLeft size={16} />
                          </button>
                        </div>
                      </div>
                      <select
                        className="w-full bg-surface border border-primary/20 rounded-xl p-2 text-xs font-bold"
                        value={selectedPreviewIndex}
                        onChange={(e) => setSelectedPreviewIndex(Number(e.target.value))}
                      >
                        {filteredItems.map((item, idx) => (
                          <option key={item.id} value={idx}>
                            [{item.serialNumber}] {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Paper Format */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/70 mb-2">تنسيق وحجم الورق المطبعي:</label>
                    <div className="space-y-2">
                      {[
                        { id: 'A4', label: 'A4 قياسي (بطاقة كاملة مفصلة)', desc: '210 × 297 مم - النموذج الأوضح والأشمل' },
                        { id: 'A5', label: 'A5 كرتوني (بطاقة الجرد الوزارية القياسية)', desc: '148 × 210 مم - الحجم المعتمد لعلب البطاقات' },
                        { id: 'A4_DUAL', label: 'A4 اقتصادي (بطاقتان في صفحة واحدة)', desc: 'بطاقتان A5 في ورقة A4 مع خط قطع ✂' }
                      ].map((fmt) => (
                        <div
                          key={fmt.id}
                          onClick={() => setPaperFormat(fmt.id as PaperFormat)}
                          className={cn(
                            "p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3",
                            paperFormat === fmt.id ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-surface hover:bg-surface-container"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0", paperFormat === fmt.id ? "border-primary bg-primary" : "border-on-surface/30")}>
                            {paperFormat === fmt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <div className="font-black text-xs text-on-surface">{fmt.label}</div>
                            <div className="text-[10px] text-on-surface/50 font-bold">{fmt.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Print Sides Selector */}
                  {printScope !== 'table' && (
                    <div>
                      <label className="block text-xs font-black text-on-surface/70 mb-2">أوجه البطاقة المراد طباعتها:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'both', label: 'الوجهان معاً' },
                          { id: 'front', label: 'الوجه الأمامي' },
                          { id: 'back', label: 'الظهر (الخلفي)' }
                        ].map((side) => (
                          <button
                            key={side.id}
                            onClick={() => setPrintSides(side.id as PrintSides)}
                            className={cn(
                              "p-2 rounded-xl text-xs font-black border-2 transition-all text-center",
                              printSides === side.id ? "border-primary bg-primary/10 text-primary" : "border-primary/10 text-on-surface/70 hover:bg-black/5"
                            )}
                          >
                            {side.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Elements Toggles */}
                  <div className="pt-2 border-t border-primary/10 space-y-2">
                    <label className="block text-xs font-black text-on-surface/70 mb-1">عناصر النموذج الرسمي:</label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeQrCode} 
                        onChange={(e) => setIncludeQrCode(e.target.checked)} 
                        className="rounded accent-primary" 
                      />
                      <span className="text-xs font-bold text-on-surface/80">تضمين رمز QR Code السريع بالبطاقة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeOfficialHeader} 
                        onChange={(e) => setIncludeOfficialHeader(e.target.checked)} 
                        className="rounded accent-primary" 
                      />
                      <span className="text-xs font-bold text-on-surface/80">إظهار الترويسة الوزارية الرسمية</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeStampBox} 
                        onChange={(e) => setIncludeStampBox(e.target.checked)} 
                        className="rounded accent-primary" 
                      />
                      <span className="text-xs font-bold text-on-surface/80">إظهار خانات أختام وتأشيرة المقتصد والمدير</span>
                    </label>
                  </div>
                </div>

                {/* Right Panel: Live Visual Card Preview */}
                <div className="lg:col-span-8 p-6 bg-gray-100 flex flex-col items-center justify-start overflow-y-auto min-h-[480px]">
                  {/* Top Preview Controls */}
                  {printScope !== 'table' && (
                    <div className="w-full max-w-xl flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                        <span className="text-xs font-black text-gray-500">معاينة الوجه:</span>
                        <button
                          onClick={() => setPreviewCardSide('front')}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-black transition-all",
                            previewCardSide === 'front' ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          الوجه الأمامي (Recto)
                        </button>
                        <button
                          onClick={() => setPreviewCardSide('back')}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-black transition-all",
                            previewCardSide === 'back' ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          الوجه الخلفي (Verso)
                        </button>
                      </div>

                      <div className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                        المقاس: <span className="font-black text-black">{paperFormat}</span> | {printSides === 'both' ? 'الوجهان' : printSides === 'front' ? 'وجه أمامي فقط' : 'وجه خلفي فقط'}
                      </div>
                    </div>
                  )}

                  {/* Simulated Paper Sheet */}
                  <div className="w-full max-w-xl bg-white shadow-xl rounded-md border-2 border-black p-6 text-black font-sans min-h-[620px] flex flex-col justify-between">
                    {previewCardSide === 'front' ? (
                      /* FRONT PREVIEW */
                      <div>
                        {includeOfficialHeader && (
                          <div className="border-b-2 border-black pb-2 mb-2">
                            <div className="flex justify-between items-start text-[8pt] font-bold leading-tight">
                              <div>
                                مديرية التربية لولاية: {directorate}<br />
                                {formatSchoolWithCommune(schoolName, commune)}<br />
                                مخبر الوسائل التعليمية
                              </div>
                              <div className="text-center">
                                <div className="font-black text-[9pt]">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                                <div className="font-bold text-[8pt]">وزارة التربية الوطنية</div>
                                <div className="font-bold text-[7.5pt] text-gray-600">السنة الدراسية: 2025 / 2026</div>
                              </div>
                              <div className="text-left text-[8pt]">
                                بطاقة الجرد رقم:<br />
                                <span className="font-black text-[10pt] underline">{currentPreviewItem.serialNumber}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center my-2">
                          <div className="inline-block border-2 border-black bg-gray-100 px-6 py-1 rounded-sm">
                            <h2 className="text-sm font-black underline decoration-double">بـطــاقـــة الجـــرد</h2>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[8pt] font-bold border border-black bg-gray-50 px-3 py-1 mb-2">
                          <div>
                            <span>الجرد التأسيسي لسنة : </span>
                            <span className="font-black underline">{currentPreviewItem.foundationalInventory || '2015-10-15'}</span>
                          </div>
                          <div>
                            <span>المراجعة العشرية لسنة : </span>
                            <span className="font-black underline">{currentPreviewItem.decennialReview || '2025-10-15'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 border-2 border-black text-center text-[8pt] mb-3 divide-x divide-x-reverse divide-black">
                          <div className="p-1.5">
                            <div className="font-bold text-gray-600 border-b border-black pb-0.5 mb-1">الفهرس</div>
                            <div className="font-black text-[9pt] h-8 flex items-center justify-center">أجهزة تعليمية</div>
                          </div>
                          <div className="p-1.5">
                            <div className="font-bold text-gray-600 border-b border-black pb-0.5 mb-1">الفرع</div>
                            <div className="font-black text-[9pt] h-8 flex items-center justify-center">مخبر العلوم والوسائل</div>
                          </div>
                          <div className="p-1.5 bg-yellow-50/40">
                            <div className="font-bold text-gray-600 border-b border-black pb-0.5 mb-1">رقم الجرد</div>
                            <div className="font-black text-[11pt] h-8 flex items-center justify-center">{currentPreviewItem.serialNumber}</div>
                          </div>
                          <div className="p-1.5">
                            <div className="font-bold text-gray-600 border-b border-black pb-0.5 mb-1">ختم المؤسسة</div>
                            <div className="h-8 flex items-center justify-center">
                              {includeQrCode ? (
                                <QRCodeSVG value={`DZ-EDU-INV:${currentPreviewItem.serialNumber}:${currentPreviewItem.name}`} size={28} />
                              ) : (
                                <span className="text-[7pt] text-gray-400">مربع الختم</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border border-black p-3 mb-3 text-[8.5pt] space-y-1.5 bg-white">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black whitespace-nowrap">الـتـعـيـيـن :</span>
                            <span className="font-black text-[9.5pt] border-b border-dotted border-black flex-1 pb-0.5">{currentPreviewItem.name}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold whitespace-nowrap">الـخـصـائـص :</span>
                            <span className="border-b border-dotted border-black flex-1 pb-0.5">{currentPreviewItem.notes || 'جهاز تعليمي مخبري مطابق للمعايير الرسمية'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold whitespace-nowrap">الموقع :</span>
                              <span className="border-b border-dotted border-black flex-1 pb-0.5">{currentPreviewItem.location || 'مخبر الوسائل التعليمية'}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold whitespace-nowrap">الممون :</span>
                              <span className="border-b border-dotted border-black flex-1 pb-0.5">{currentPreviewItem.supplier || 'المؤسسة الوطنية للوسائل'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="text-[8pt] font-black mb-1">جدول حركات الدخول والتكفل:</div>
                          <table className="w-full border-collapse border border-black text-[8pt] text-center">
                            <thead>
                              <tr className="bg-gray-100 font-bold border-b border-black">
                                <th className="border border-black p-1">تاريخ الدخول</th>
                                <th className="border border-black p-1">الكمية</th>
                                <th className="border border-black p-1">سعر الوحدة</th>
                                <th className="border border-black p-1">المبلغ الإجمالي</th>
                                <th className="border border-black p-1">الممون</th>
                                <th className="border border-black p-1">التعيين الجديد</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-black font-semibold">
                                <td className="border border-black p-1 font-bold">{currentPreviewItem.foundationalInventory || '2023-09-15'}</td>
                                <td className="border border-black p-1 font-black">{currentPreviewItem.totalQuantity}</td>
                                <td className="border border-black p-1">{currentPreviewItem.price ? `${currentPreviewItem.price} دج` : '—'}</td>
                                <td className="border border-black p-1 font-bold">
                                  {currentPreviewItem.price && !isNaN(Number(currentPreviewItem.price))
                                    ? `${(Number(currentPreviewItem.price) * currentPreviewItem.totalQuantity).toLocaleString('ar-DZ')} دج`
                                    : '—'}
                                </td>
                                <td className="border border-black p-1">{currentPreviewItem.supplier || '—'}</td>
                                <td className="border border-black p-1 text-[7.5pt]">مخبر الوسائل</td>
                              </tr>
                              {[...Array(3)].map((_, i) => (
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
                    ) : (
                      /* BACK PREVIEW */
                      <div>
                        <div className="border-b-2 border-black pb-1 mb-3">
                          <div className="flex justify-between items-center text-[8pt] font-bold">
                            <div>التكفل المستمر وحركات التعيين والإتلاف</div>
                            <div className="text-center font-black text-[9pt] underline">
                              بطاقة رقم: {currentPreviewItem.serialNumber} — {currentPreviewItem.name}
                            </div>
                            <div>الجمهورية الجزائرية</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1">
                            1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)
                          </div>
                          <table className="w-full border-collapse border border-black text-[7.5pt] text-center">
                            <thead>
                              <tr className="bg-gray-50 font-bold border-b border-black">
                                <th className="border border-black p-1 w-24">التاريخ</th>
                                <th className="border border-black p-1">اسم ولقب الموظف المسؤول</th>
                                <th className="border border-black p-1 w-24">الصفة</th>
                                <th className="border border-black p-1 w-24">الإمضاء</th>
                                <th className="border border-black p-1 w-24">تأشيرة المقتصد</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-black h-5">
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

                        <div className="mb-3">
                          <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1">
                            2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)
                          </div>
                          <table className="w-full border-collapse border border-black text-[7.5pt] text-center">
                            <thead>
                              <tr className="bg-gray-50 font-bold border-b border-black">
                                <th className="border border-black p-1 w-24" rowSpan={2}>تاريخ القرار</th>
                                <th className="border border-black p-1 w-12" rowSpan={2}>الكمية</th>
                                <th className="border border-black p-1 w-24" rowSpan={2}>رقم الجرد</th>
                                <th className="border border-black p-1" rowSpan={2}>التعيين الجديد</th>
                                <th className="border border-black p-0.5" colSpan={2}>الإمضاء والتأشيرة</th>
                              </tr>
                              <tr className="bg-gray-50 font-bold border-b border-black">
                                <th className="border border-black p-0.5 w-16">المقتصد</th>
                                <th className="border border-black p-0.5 w-16">العون</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...Array(2)].map((_, i) => (
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

                        <div className="mb-3">
                          <div className="bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1">
                            3. الإسـقـاط والإتـلاف والخـروج (Sorties / Réformes)
                          </div>
                          <table className="w-full border-collapse border border-black text-[7.5pt] text-center">
                            <thead>
                              <tr className="bg-gray-50 font-bold border-b border-black">
                                <th className="border border-black p-1 w-24" rowSpan={2}>تاريخ القرار</th>
                                <th className="border border-black p-1 w-12" rowSpan={2}>الكمية</th>
                                <th className="border border-black p-1" rowSpan={2}>سبب الخروج</th>
                                <th className="border border-black p-1 w-24" rowSpan={2}>محضر الإسقاط</th>
                                <th className="border border-black p-0.5" colSpan={2}>الإمضاء والتأشيرة</th>
                              </tr>
                              <tr className="bg-gray-50 font-bold border-b border-black">
                                <th className="border border-black p-0.5 w-16">المقتصد</th>
                                <th className="border border-black p-0.5 w-16">المدير</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...Array(2)].map((_, i) => (
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
                    )}

                    {/* Footer Stamps */}
                    {includeStampBox && (
                      <div className="grid grid-cols-2 gap-4 text-center text-[7.5pt] font-bold border-t border-black pt-2 mt-4">
                        <div className="border border-gray-300 p-1.5 rounded bg-gray-50">
                          <div>تأشيرة وختم المقتصد:</div>
                          <div className="h-8"></div>
                        </div>
                        <div className="border border-gray-300 p-1.5 rounded bg-gray-50">
                          <div>تأشيرة وختم رئيس المؤسسة:</div>
                          <div className="h-8"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-primary/10 bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-bold text-on-surface/60 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>
                    النموذج جاهز للطباعة بالتنسيق المحدد ({paperFormat} — {printScope === 'table' ? 'سجل إجمالي' : printScope === 'all' ? `جميع البطاقات (${filteredItems.length})` : 'بطاقة واحدة'})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-black text-xs text-on-surface/70 hover:bg-black/5 transition-colors"
                  >
                    إغلاق
                  </button>

                  <button
                    onClick={() => {
                      triggerPrint(printScope, printScope === 'single' ? currentPreviewItem : undefined);
                    }}
                    disabled={isPrinting}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPrinting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري إرسال الأمر للطباعة...</span>
                      </>
                    ) : (
                      <>
                        <Printer size={18} />
                        <span>طباعة النموذج الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

