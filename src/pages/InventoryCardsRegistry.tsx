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
  ChevronRight,
  Edit3
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
import { Equipment } from '../types/equipment';
import { printInventoryCards } from '../services/inventoryCardPrintService';
import InventoryCardPrintModal from '../components/InventoryCardPrintModal';

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
  const { schoolId, schoolName, directorate, commune, academicYear } = useSchool();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Printing and Formatting State
  const [printingItem, setPrintingItem] = useState<InventoryItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [printModalMode, setPrintModalMode] = useState<'filled' | 'blank'>('filled');
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
    setPrintModalMode('filled');
    setIsPreviewModalOpen(true);
  };

  // Open modal for batch cards
  const openBatchPreview = () => {
    setPrintingItem(null);
    setPrintScope('all');
    setPrintModalMode('filled');
    setSelectedPreviewIndex(0);
    setIsPreviewModalOpen(true);
  };

  // Open modal for blank card template (manual fill)
  const openBlankPreview = () => {
    setPrintingItem(null);
    setPrintScope('single');
    setPrintModalMode('blank');
    setSelectedPreviewIndex(0);
    setIsPreviewModalOpen(true);
  };

  // Open modal for table
  const openTablePreview = () => {
    setPrintingItem(null);
    setPrintScope('table');
    setPrintModalMode('filled');
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
        academicYear,
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
                  السنة الدراسية: {academicYear || '2025/2026'}<br />
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
                            <div className="font-bold text-[7pt] text-gray-700">السنة الدراسية: {academicYear || '2025/2026'}</div>
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
                {t('inventory_cards.academic_year', 'السنة الدراسية:')} <span className="font-black">{academicYear || '2025/2026'}</span>
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
              className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
            >
              <Sliders size={18} />
              <span>معاينة وتنسيق نموذج الطباعة</span>
            </button>

            {/* DIRECT PRINT CARDS BUTTON */}
            <button 
              onClick={openBatchPreview}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-secondary hover:bg-secondary-dim text-white rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
            >
              <Printer size={18} />
              {t('inventory_cards.btn_print_cards', 'طباعة بطاقات الجرد')}
            </button>

            {/* BLANK FORM TEMPLATE BUTTON */}
            <button 
              onClick={openBlankPreview}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-2xl font-black shadow-sm transition-all text-sm cursor-pointer"
              title="طباعة استمارة بطاقة جرد فارغة للملء اليدوي"
            >
              <Edit3 size={18} />
              <span>استمارة فارغة (للملء اليدوي)</span>
            </button>

            {/* PRINT REGISTRY TABLE BUTTON */}
            <button 
              onClick={openTablePreview}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-black shadow transition-all text-sm cursor-pointer"
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
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400 cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => openPreviewForCard(item)}
                        title={t('inventory_cards.print_individual', 'معاينة وطباعة بطاقة هذا التجهيز')}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40 cursor-pointer"
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

      {/* Pop-up In-App Print & Preview Modal (Matching ActivityRequestPrintModal) */}
      <InventoryCardPrintModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        items={filteredItems}
        initialItem={printingItem}
        initialScope={printScope}
        initialMode={printModalMode}
        schoolInfo={{
          directorate: directorate || "مديرية التربية لولاية أم البواقي",
          schoolName: schoolName || "متوسطة قطاف الطاهر",
          commune: commune || "عين كرشة",
          academicYear: academicYear || "2025/2026"
        }}
      />
    </>
  );
}

