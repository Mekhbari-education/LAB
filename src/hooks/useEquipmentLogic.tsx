import { useState, useEffect, useRef, useMemo } from 'react';
import { onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, writeBatch, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { useSchool } from '../context/SchoolContext';
import { useSqlCollection } from './useSqlCollection';
import * as XLSX from 'xlsx';
import { getEquipmentIntelligence, EquipmentIntelligence, ensureApiKey } from '../services/geminiService';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import { Equipment, MaintenanceLog } from '../types/equipment';
import { formatSchoolWithCommune } from '../lib/utils';
import { generateEquipmentStickersHtml } from '../services/equipmentStickerService';

// Helpers for robust sorting
export const getPriceNumeric = (val: any): number => {
  if (val === undefined || val === null) return -1;
  if (typeof val === 'number') return isNaN(val) ? -1 : val;
  const str = String(val).replace(/,/g, '.');
  const cleaned = str.replace(/[^\d.]/g, '');
  if (!cleaned) return -1;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? -1 : parsed;
};

export const getDateNumeric = (val: any): number => {
  if (!val) return -1;
  if (val instanceof Date) {
    const t = val.getTime();
    return isNaN(t) ? -1 : t;
  }
  const str = String(val).trim();
  if (!str || str === '---' || str === '-' || str === 'لا شيء' || str === 'لا يوجد') return -1;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? -1 : d.getTime();
  }

  // YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (ymdMatch) {
    const d = new Date(parseInt(ymdMatch[1], 10), parseInt(ymdMatch[2], 10) - 1, parseInt(ymdMatch[3], 10));
    return isNaN(d.getTime()) ? -1 : d.getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? -1 : parsed;
};

export const getSerialNumeric = (val: any): number => {
  if (val === undefined || val === null) return 99999999;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  const digits = str.replace(/\D/g, '');
  if (!digits) return 99999999;
  const num = parseInt(digits, 10);
  return isNaN(num) ? 99999999 : num;
};

export const normalizeArabicForSort = (str: any): string => {
  return String(str || '')
    .trim()
    .replace(/[\u064B-\u065F]/g, '') // strip tashkeel
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // alef variations -> bare alef
    .replace(/\u0629/g, '\u0647') // ta marbuta -> heh
    .replace(/\u0649/g, '\u064A') // alef maqsura -> yaa
    .toLowerCase();
};

export function useEquipmentLogic(isNested = false) {
  const { schoolId, schoolName, directorate, commune, academicYear } = useSchool();
  const { openPrintPreview, directPrint } = usePrintSettings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [stickerModalItem, setStickerModalItem] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('filter') || 'all');
  const [filterExitStatus, setFilterExitStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isSmartUpdating, setIsSmartUpdating] = useState(false);
  const [isSmartUpdateConfirmOpen, setIsSmartUpdateConfirmOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [sortField, setSortField] = useState<keyof Equipment | 'none'>('serialNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [qrCodeItem, setQrCodeItem] = useState<Equipment | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const parentRef = useRef<HTMLDivElement>(null);
  const handledSearchTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && equipment.length > 0 && handledSearchTargetRef.current !== targetId) {
      handledSearchTargetRef.current = targetId;
      let actualId = targetId;
      if (targetId.startsWith('APP_ID_')) {
        const parts = targetId.split('_');
        actualId = parts.slice(2, -1).join('_');
      }
      setSearchTerm(actualId);
      
      const item = equipment.find(e => e.id === targetId || e.id === actualId);
      if (item) {
        setEditingEquipment(item);
        setNewEquipment({
          name: item.name,
          type: item.type,
          serialNumber: item.serialNumber,
          status: item.status,
          totalQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity,
          brokenQuantity: item.brokenQuantity,
          supplier: item.supplier || '',
          location: item.location || '',
          notes: item.notes || '',
          foundationalInventory: item.foundationalInventory || '',
          decennialReview: item.decennialReview || ''
        });
        setIsAddModalOpen(true);
      }
    }
  }, [searchParams, equipment]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEquipHistory, setSelectedEquipHistory] = useState<MaintenanceLog[]>([]);
  const [currentEquipName, setCurrentEquipName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [suggestedUpdate, setSuggestedUpdate] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    type: 'glassware',
    serialNumber: '',
    status: 'functional',
    totalQuantity: 0,
    availableQuantity: 0,
    brokenQuantity: 0,
    supplier: '',
    location: '',
    notes: '',
    source: '',
    price: '',
    registrationDate: '',
    exitDate: '',
    foundationalInventory: '',
    decennialReview: ''
  });

  const { data: sqlEquipment, loading: sqlLoading } = useSqlCollection<Equipment>('equipment', '/api/db/equipment');

  useEffect(() => {
    if (sqlEquipment) {
      setEquipment(prev => {
        if (prev === sqlEquipment) return prev;
        if (prev.length === 0 && sqlEquipment.length === 0) return prev;
        return sqlEquipment;
      });
      setLoading(sqlLoading);
    }
  }, [sqlEquipment, sqlLoading]);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        const { id } = editingEquipment;
        const { updateEquipment } = await import('../lib/api/equipment');
        await updateEquipment(id, newEquipment as Equipment);
        await logActivity(schoolId, LogAction.UPDATE, LogModule.EQUIPMENT, `تعديل بيانات الجهاز: ${newEquipment.name}`, id);
      } else {
        const { createEquipment } = await import('../lib/api/equipment');
        const docRef = await createEquipment(newEquipment as Equipment);
        await logActivity(schoolId, LogAction.CREATE, LogModule.EQUIPMENT, `إضافة جهاز جديد: ${newEquipment.name}`, docRef.id);
      }
      setIsAddModalOpen(false);
      setEditingEquipment(null);
      setNewEquipment({
        name: '',
        type: 'glassware',
        serialNumber: '',
        status: 'functional',
        totalQuantity: 0,
        availableQuantity: 0,
        brokenQuantity: 0,
        supplier: '',
        location: '',
        notes: '',
        source: '',
        price: '',
        registrationDate: '',
        exitDate: '',
        foundationalInventory: '',
        decennialReview: ''
      });
    } catch (error) {
      handleFirestoreError(error, editingEquipment ? OperationType.UPDATE : OperationType.CREATE, 'equipment');
    }
  };

  const handleDeleteEquipment = async (id: string, name: string) => {
    try {
      const { deleteEquipment } = await import('../lib/api/equipment');
      await deleteEquipment(id);
      await logActivity(schoolId, LogAction.DELETE, LogModule.EQUIPMENT, `حذف الجهاز: ${name}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `equipment/${id}`);
    }
  };

  // Helper to normalize column header strings (supports Arabic and Farsi variations)
  const normalizeHeaderKey = (key: string): string => {
    return String(key || '')
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\u06CC\u0649]/g, '\u064A') // Persian Yeh / Alef Maksura -> Arabic Yeh 'ي'
      .replace(/\u06A9/g, '\u0643') // Persian Kaf -> Arabic Kaf 'ك'
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // Alef variations -> bare alef 'ا'
      .replace(/\u0629/g, '\u0647') // Teh Marbuta -> Heh
      .replace(/[\u064B-\u065F]/g, '') // Strip tashkeel
      .toLowerCase();
  };

  const formatTextCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') return String(val).trim();
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${d}/${m}/${y}`;
    }
    return String(val).trim();
  };

  const formatDateCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${d}/${m}/${y}`;
    }
    // Only parse numbers as Excel date serial if strictly within valid date ranges
    if (typeof val === 'number' && val > 1000 && val < 90000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${d}/${m}/${y}`;
      }
    }
    const str = String(val).trim();
    if (!str || str === '-' || str === '---') return '';
    // Format YYYY-MM-DD to DD/MM/YYYY
    const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`;
    }
    return str;
  };

  const formatPriceCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') {
      return val > 0 ? `${val.toFixed(2)} دج` : '0 دج';
    }
    const str = String(val).trim();
    if (!str || str === '-' || str === '---') return '';
    // If it's pure numbers, append currency
    if (/^\d+(\.\d+)?$/.test(str)) {
      return `${parseFloat(str).toFixed(2)} دج`;
    }
    return str;
  };

  const formatQuantityCell = (val: any): number => {
    if (typeof val === 'number') {
      return Math.max(1, Math.round(val));
    }
    const str = String(val || '').trim();
    const digits = str.replace(/\D/g, '');
    const parsed = parseInt(digits, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  };

  type FieldKey = 
    | 'serialNumber'
    | 'registrationDate'
    | 'name'
    | 'source'
    | 'price'
    | 'location'
    | 'exitDate'
    | 'notes'
    | 'totalQuantity'
    | 'status'
    | 'type';

  const matchHeaderToField = (headerText: string): FieldKey | null => {
    const norm = normalizeHeaderKey(headerText);
    if (!norm) return null;

    // Disambiguation:
    // 'تعيين الشيء' or contains 'شيء'/'جهاز'/'عتاد' -> name
    if (norm.includes('شيء') || norm.includes('جهاز') || norm.includes('عتاد') || norm.includes('صنف') || norm.includes('اسم') || norm.includes('designation') || norm.includes('libelle')) {
      return 'name';
    }

    if (norm.includes('تكفل') || (norm.includes('تسجيل') && norm.includes('تاريخ')) || norm.includes('اقتناء') || norm.includes('دخول') || norm.includes('حيازه')) {
      return 'registrationDate';
    }

    if (norm.includes('خروج') || norm.includes('اسقاط') || norm.includes('شطب') || norm.includes('sortie') || norm.includes('reforme')) {
      return 'exitDate';
    }

    if (norm.includes('قيم') || norm.includes('قیم') || norm.includes('سعر') || norm.includes('مبلغ') || norm.includes('ثمن') || norm.includes('تكلف') || norm.includes('prix') || norm.includes('valeur') || norm.includes('montant') || norm.includes('price') || norm.includes('cost')) {
      return 'price';
    }

    if (norm.includes('كمي') || norm.includes('عدد') || norm.includes('quantite') || norm.includes('qty')) {
      return 'totalQuantity';
    }

    if (norm.includes('مصدر') || norm.includes('مورد') || norm.includes('ممون') || norm.includes('ممول') || norm.includes('توريد') || norm.includes('source') || norm.includes('fournisseur') || norm.includes('supplier') || norm.includes('provenance')) {
      return 'source';
    }

    if (norm.includes('ملاحظ') || norm.includes('remarque') || norm.includes('observation') || norm.includes('note') || norm.includes('تعليق')) {
      return 'notes';
    }

    if (norm.includes('حال') || norm.includes('etat') || norm.includes('status')) {
      return 'status';
    }

    if (norm.includes('نوع') || norm.includes('تصنيف') || norm.includes('type') || norm.includes('categorie')) {
      return 'type';
    }

    // Location / Destination: 'التعيين' or 'مكان التواجد' or 'المخبر'
    if (norm.includes('مكان') || norm.includes('موقع') || norm.includes('قاع') || norm.includes('مخبر') || norm.includes('مصلح') || norm.includes('حفظ') || norm.includes('تعيين') || norm.includes('affectation') || norm.includes('emplacement') || norm.includes('destination') || norm.includes('location')) {
      return 'location';
    }

    // Serial / Registration number
    if (norm.includes('تسجيل') || norm.includes('جرد') || norm.includes('رقم') || norm.includes('قيد') || norm.includes('تسلسل') || norm.startsWith('n') || norm.includes('serial') || norm.includes('code')) {
      return 'serialNumber';
    }

    return null;
  };

  const handleImportXLS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        alert('الملف لا يحتوي على أوراق عمل صالحة.');
        return;
      }

      // Pick best sheet (look for inventory-related names, otherwise first non-empty)
      let selectedSheetName = wb.SheetNames[0];
      for (const name of wb.SheetNames) {
        const norm = name.toLowerCase();
        if (norm.includes('جرد') || norm.includes('عتاد') || norm.includes('تجهيز') || norm.includes('invent') || norm.includes('materiel')) {
          selectedSheetName = name;
          break;
        }
      }

      const ws = wb.Sheets[selectedSheetName];
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false }) as any[][];

      if (!rawRows || rawRows.length === 0) {
        alert('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة.');
        return;
      }

      // Locate Header Row by scoring the first 25 rows
      let headerRowIndex = -1;
      let maxMatches = 0;
      let bestColMap: Record<number, FieldKey> = {};

      for (let r = 0; r < Math.min(25, rawRows.length); r++) {
        const row = rawRows[r];
        if (!Array.isArray(row)) continue;
        const currentMap: Record<number, FieldKey> = {};
        let matches = 0;

        row.forEach((cell, cIdx) => {
          const str = String(cell || '').trim();
          if (!str) return;
          const matched = matchHeaderToField(str);
          if (matched && !Object.values(currentMap).includes(matched)) {
            currentMap[cIdx] = matched;
            matches++;
          }
        });

        if (matches > maxMatches) {
          maxMatches = matches;
          headerRowIndex = r;
          bestColMap = currentMap;
        }
      }

      // If no strong header row found (less than 2 matches), fallback to standard 8 Algerian General Inventory columns
      if (maxMatches < 2) {
        headerRowIndex = 0;
        bestColMap = {
          0: 'serialNumber',
          1: 'registrationDate',
          2: 'name',
          3: 'source',
          4: 'price',
          5: 'location',
          6: 'exitDate',
          7: 'notes'
        };
      }

      const dataRows = rawRows.slice(headerRowIndex + 1);
      if (dataRows.length === 0) {
        alert('لم يتم العثور على صفوف بيانات بعد رأس الجدول. يرجى التأكد من محتوى الملف.');
        return;
      }

      const itemsToCreate: Partial<Equipment>[] = [];

      for (let idx = 0; idx < dataRows.length; idx++) {
        const rowCells = dataRows[idx];
        if (!Array.isArray(rowCells) || rowCells.length === 0) continue;

        // Skip completely empty rows
        const hasContent = rowCells.some(c => c !== undefined && c !== null && String(c).trim() !== '');
        if (!hasContent) continue;

        // Extract cells by mapped column index
        const rowData: Partial<Record<FieldKey, any>> = {};
        for (const [colIdxStr, field] of Object.entries(bestColMap)) {
          const colIdx = Number(colIdxStr);
          if (colIdx < rowCells.length) {
            rowData[field] = rowCells[colIdx];
          }
        }

        // Formatted values:
        const itemName = formatTextCell(rowData.name);
        const regNum = formatTextCell(rowData.serialNumber) || (idx + 1).toString().padStart(2, '0');
        const regDate = formatDateCell(rowData.registrationDate);
        const itemSource = formatTextCell(rowData.source);
        const itemPrice = formatPriceCell(rowData.price);
        const itemLocation = formatTextCell(rowData.location);
        const itemExit = formatDateCell(rowData.exitDate);
        const itemNotes = formatTextCell(rowData.notes);
        const totalQty = formatQuantityCell(rowData.totalQuantity);

        // Skip summary or title rows if encountered in data
        const combinedStr = Object.values(rowData).map(v => String(v || '')).join(' ');
        if (combinedStr.includes('المجموع') || combinedStr.includes('التوقيع') || combinedStr.includes('حرر بـ') || combinedStr.startsWith('Page ')) {
          continue;
        }

        // Must have at least a name, serial, or price
        if (!itemName && !regNum && !itemPrice) {
          continue;
        }

        // Exit status check
        const hasExited = itemExit !== '' && 
                          itemExit !== '---' && 
                          itemExit !== '-' && 
                          itemExit !== 'لا شيء' && 
                          itemExit !== 'لا يوجد' &&
                          itemExit !== 'سليم';

        const statusRaw = formatTextCell(rowData.status).toLowerCase();
        let status: Equipment['status'] = 'functional';
        if (hasExited) {
          status = 'broken';
        } else if (statusRaw.includes('صيانة') || statusRaw.includes('maintenance')) {
          status = 'maintenance';
        } else if (statusRaw.includes('تالف') || statusRaw.includes('معطل') || statusRaw.includes('broken')) {
          status = 'broken';
        }

        const availableQty = hasExited ? 0 : totalQty;
        const brokenQty = hasExited ? totalQty : 0;

        // Type auto-classification
        const typeRaw = formatTextCell(rowData.type).toLowerCase();
        let equipType: Equipment['type'] = 'other';
        if (typeRaw.includes('زجاج') || typeRaw.includes('glass')) {
          equipType = 'glassware';
        } else if (typeRaw.includes('تقن') || typeRaw.includes('tech') || typeRaw.includes('إلكترون') || typeRaw.includes('علمي')) {
          equipType = 'tech';
        } else {
          const glasswareKeywords = ['زجاج', 'بيشر', 'حوجلة', 'أنبوب', 'مخبار', 'ماصة', 'دورق', 'سحاحة', 'عدسة', 'موشور', 'قمع', 'بوتقة', 'غطاء', 'شريحة'];
          const techKeywords = ['مجهر', 'حاسوب', 'شاشة', 'طابعة', 'مسلاط', 'راسم', 'مولد', 'مقياس', 'عداد', 'ميزان', 'مطياف', 'مضخة', 'محرك', 'كهربا', 'إلكترو', 'رقمي', 'تلسكوب'];
          const lowerName = (itemName || '').toLowerCase();
          if (glasswareKeywords.some(k => lowerName.includes(k))) {
            equipType = 'glassware';
          } else if (techKeywords.some(k => lowerName.includes(k))) {
            equipType = 'tech';
          }
        }

        const fallbackName = `صنف غير مسمى #${itemsToCreate.length + 1}`;

        itemsToCreate.push({
          name: itemName || fallbackName,
          serialNumber: regNum,
          registrationDate: regDate,
          foundationalInventory: regDate,
          source: itemSource,
          supplier: itemSource,
          price: itemPrice,
          location: itemLocation,
          exitDate: itemExit,
          notes: itemNotes,
          type: equipType,
          status,
          totalQuantity: totalQty,
          availableQuantity: availableQty,
          brokenQuantity: brokenQty
        });
      }

      if (itemsToCreate.length === 0) {
        alert('لم يتم العثور على أي عتاد صالح للاستيراد في هذا الملف.\nيرجى التأكد من أن الملف يحتوي على أعمدة سجل الجرد العام (رقم التسجيل، تعيين الشيء، ...). يمكنك استخدام زر "تحميل النموذج" للحصول على التنسيق المعتمد.');
        return;
      }

      const { createEquipmentBulk } = await import('../lib/api/equipment');
      const savedItems = await createEquipmentBulk(itemsToCreate);

      // Immediately update local UI state with the new items in exact file sequence
      setEquipment(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newOnes = (savedItems || itemsToCreate).filter((item: any) => !existingIds.has(item.id)) as Equipment[];
        return [...prev, ...newOnes];
      });

      await logActivity(schoolId, LogAction.CREATE, LogModule.EQUIPMENT, `استيراد ${itemsToCreate.length} عتاد من سجل الجرد العام (XLS)`);

      alert(
        `✅ تم استيراد ${itemsToCreate.length} صنف بنجاح وبترتيب سليم وفق سجل الجرد العام!\n\n` +
        `• الأعمدة المعالجة: رقم التسجيل، تاريخ التكفل، تعيين الشيء، المصدر، القيمة، التعيين، الخروج، الملاحظات.`
      );
    } catch (error) {
      console.error('Error importing XLS:', error);
      alert(`حدث خطأ أثناء استيراد الملف: ${error instanceof Error ? error.message : 'يرجى التأكد من صيغة الملف وأعمدة سجل الجرد العام.'}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadGeneralInventoryTemplate = () => {
    const sampleData = [
      {
        'رقم التسجيل': '01',
        'تاريخ التكفل بالتسجيل': '15/09/2022',
        'تعيين الشيء': 'مجهر ضوئي ثنائي العينية تعليمي عالي الدقة',
        'مصدره': 'ميزانية المؤسسة (الباب 22)',
        'قیمته': '45000.00 دج',
        'التعيين': 'مخبر العلوم الطبيعية والحياة',
        'خروجه': '---',
        'ملاحظات': 'بحالة جيدة جداً، مع الملحقات وعدسات التكبير'
      },
      {
        'رقم التسجيل': '02',
        'تاريخ التكفل بالتسجيل': '02/10/2023',
        'تعيين الشيء': 'حوجلة عيارية زجاجية 500 مل بايركس',
        'مصدره': 'وزارة التربية الوطنية (تجهيز أولي)',
        'قیمته': '1200.00 دج',
        'التعيين': 'مخبر الكيمياء والفيزياء',
        'خروجه': '---',
        'ملاحظات': 'سليمة مع السدادة البلاستيكية الأصلية'
      },
      {
        'رقم التسجيل': '03',
        'تاريخ التكفل بالتسجيل': '11/01/2021',
        'تعيين الشيء': 'راسم اهتزاز مهبطي رقمي ثنائي المسار',
        'مصدره': 'إعانة ولائية للتجهيز المخبري',
        'قیمته': '82000.00 دج',
        'التعيين': 'مخبر الفيزياء والتكنولوجيا',
        'خروجه': '12/04/2024',
        'ملاحظات': 'تم إسقاطه بمحضر شطب رسمي رقم 02/2024 لتعطل اللوحة الإلكترونية'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 22 },
      { wch: 42 },
      { wch: 32 },
      { wch: 18 },
      { wch: 32 },
      { wch: 16 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الجرد العام');
    XLSX.writeFile(workbook, 'نموذج_سجل_الجرد_العام_الخاص_بالمؤسسة.xlsx');
  };

  const handleExportGeneralInventoryXLS = () => {
    if (equipment.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }

    const exportData = equipment.map((e, index) => ({
      'رقم التسجيل': e.serialNumber || (index + 1).toString().padStart(2, '0'),
      'تاريخ التكفل بالتسجيل': e.registrationDate || e.foundationalInventory || '---',
      'تعيين الشيء': e.smartNameAr || e.name,
      'مصدره': e.source || e.supplier || '---',
      'قیمته': e.price || '---',
      'التعيين': e.location || '---',
      'خروجه': e.exitDate || (e.status === 'broken' ? 'تالف / مقترح للإسقاط' : '---'),
      'ملاحظات': e.notes || '---'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 22 },
      { wch: 42 },
      { wch: 32 },
      { wch: 18 },
      { wch: 32 },
      { wch: 16 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الجرد العام');
    XLSX.writeFile(workbook, `سجل_الجرد_العام_الخاص_بالمؤسسة_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleUpdateStatus = async (id: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return;
    try {
      setEquipment(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as any } : item));
      const { updateEquipment } = await import('../lib/api/equipment');
      await updateEquipment(id, { status: newStatus as any });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleInlineUpdate = async (id: string, field: keyof Equipment, value: any) => {
    setEquipment(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'source') updated.supplier = value;
      if (field === 'supplier') updated.source = value;
      return updated;
    }));

    try {
      const { updateEquipment } = await import('../lib/api/equipment');
      const payload: Partial<Equipment> = { [field]: value };
      if (field === 'source') payload.supplier = value;
      if (field === 'supplier') payload.source = value;
      await updateEquipment(id, payload);
    } catch (error) {
      console.error(`Failed to inline update equipment ${id} field ${String(field)}:`, error);
    }
  };

  const handleQuickAddRow = async (): Promise<Equipment | null> => {
    try {
      const numbers = equipment
        .map(e => parseInt(e.serialNumber || '0', 10))
        .filter(n => !isNaN(n) && n > 0);
      const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : equipment.length + 1;
      const nextSerial = nextNum.toString().padStart(2, '0');

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const todayFormatted = `${dd}/${mm}/${yyyy}`;

      const newItem: Partial<Equipment> = {
        name: 'صنف جديد في سجل الجرد',
        serialNumber: nextSerial,
        registrationDate: todayFormatted,
        foundationalInventory: todayFormatted,
        totalQuantity: 1,
        availableQuantity: 1,
        brokenQuantity: 0,
        source: 'ميزانية المؤسسة',
        supplier: 'ميزانية المؤسسة',
        price: '',
        location: 'مخبر العلوم',
        status: 'functional',
        type: 'glassware',
        notes: ''
      };

      const { createEquipment } = await import('../lib/api/equipment');
      const created = await createEquipment(newItem);
      if (created) {
        setEquipment(prev => [created, ...prev]);
        return created;
      }
      return null;
    } catch (error) {
      console.error('Failed to quick add row:', error);
      alert('حدث خطأ أثناء إضافة السطر الجديد.');
      return null;
    }
  };

  const handleDuplicateEquipment = async (item: Equipment) => {
    try {
      const numbers = equipment
        .map(e => parseInt(e.serialNumber || '0', 10))
        .filter(n => !isNaN(n) && n > 0);
      const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : equipment.length + 1;
      const nextSerial = nextNum.toString().padStart(2, '0');

      const duplicated: Partial<Equipment> = {
        name: `${item.name} (نسخة)`,
        serialNumber: nextSerial,
        registrationDate: item.registrationDate || '',
        foundationalInventory: item.foundationalInventory || '',
        totalQuantity: item.totalQuantity || 1,
        availableQuantity: item.availableQuantity || 1,
        brokenQuantity: item.brokenQuantity || 0,
        source: item.source || item.supplier || '',
        supplier: item.source || item.supplier || '',
        price: item.price || '',
        location: item.location || '',
        status: item.status || 'functional',
        type: item.type || 'glassware',
        exitDate: '',
        notes: item.notes || ''
      };

      const { createEquipment } = await import('../lib/api/equipment');
      const created = await createEquipment(duplicated);
      if (created) {
        setEquipment(prev => [created, ...prev]);
        alert(`تم نسخ الصنف بنجاح برقم تسجيل جديد: ${nextSerial}`);
      }
    } catch (error) {
      console.error('Failed to duplicate equipment:', error);
      alert('حدث خطأ أثناء نسخ الصنف.');
    }
  };

  const fetchHistory = async (id: string, name: string) => {
    setCurrentEquipName(name);
    try {
      const q = query(
        getUserCollection(schoolId, 'equipment'), 
        orderBy('date', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceLog))
        .filter(log => log.equipmentId === id);
      setSelectedEquipHistory(logs);
      setIsHistoryModalOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'maintenance_logs');
    }
  };

  const handleExportXLS = () => {
    if (equipment.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }

    const exportData = equipment.map(e => ({
      'رقم الجرد': e.serialNumber || '---',
      'تعيين الجهاز': e.name,
      'النوع': e.type === 'glassware' ? 'زجاجيات' : e.type === 'tech' ? 'أجهزة تقنية' : 'أخرى',
      'الكمية': e.totalQuantity,
      'الممون': e.supplier || '---',
      'الموقع': e.location || '---',
      'الحالة': e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف',
      'الجرد التأسيسي': e.foundationalInventory || '---',
      'المراجعة العشرية': e.decennialReview || '---',
      'ملاحظات': e.notes || '---'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
    XLSX.writeFile(workbook, `جرد_العتاد_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrintList = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    const tableRows = filteredEquipment.map((e, index) => `
      <tr>
        <td style="text-align: center;">${(index + 1).toString().padStart(2, '0')}</td>
        <td style="text-align: center; font-weight: bold;">${e.serialNumber || '-'}</td>
        <td style="text-align: center;">${e.registrationDate || e.foundationalInventory || '-'}</td>
        <td style="font-weight: 600;">${e.smartNameAr || e.name}</td>
        <td style="text-align: center; font-weight: 600;">${e.totalQuantity}</td>
        <td style="text-align: center;">${e.source || e.supplier || '-'}</td>
        <td style="text-align: center; font-weight: bold;">${e.price || '-'}</td>
        <td style="text-align: center;">${e.location || '-'}</td>
        <td style="text-align: center;">${e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف / مشطوب'}</td>
        <td style="text-align: center; color: ${e.exitDate ? '#b91c1c' : 'inherit'}; font-weight: ${e.exitDate ? 'bold' : 'normal'};">${e.exitDate || '-'}</td>
        <td style="font-size: 0.85em;">${e.notes || '-'}</td>
      </tr>
    `).join('');

    const html = `
      <html dir="rtl" lang="ar">
        <head>
          <title>سجل جرد العتاد العام - ${formattedDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            @page { size: A4 landscape; margin: 10mm; }
            body { 
              font-family: 'Cairo', sans-serif; 
              margin: 0; 
              padding: 10px; 
              color: #1a1a1a;
              line-height: 1.4;
            }
            .official-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header-right { text-align: right; font-size: 12px; font-weight: bold; }
            .header-center { text-align: center; }
            .header-center p { margin: 2px 0; font-weight: bold; }
            .header-center .republic { font-size: 14px; font-weight: 900; }
            .header-left { text-align: left; font-size: 12px; font-weight: bold; }
            
            .doc-title { 
              text-align: center; 
              font-size: 22px; 
              font-weight: 900; 
              text-decoration: underline;
              margin: 20px 0;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px 4px; 
              text-align: right; 
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: 700; 
              text-align: center;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              padding: 0 50px;
            }
            .sig-box { text-align: center; width: 200px; }
            .sig-box p { margin-bottom: 50px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="official-header">
            <div class="header-right">
              <p>مديرية التربية لولاية: ${directorate}</p>
              <p>${formatSchoolWithCommune(schoolName, commune)}</p>
            </div>
            <div class="header-center">
              <p class="republic">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p>وزارة التربية الوطنية</p>
            </div>
            <div class="header-left">
              <p>السنة الدراسية: 2025 - 2026</p>
            </div>
          </div>

          <h2 class="doc-title">سجل الجرد العام للمؤسسة التعليمية</h2>
          
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th style="width: 75px;">رقم التسجيل</th>
                <th style="width: 90px;">تاريخ التكفل بالتسجيل</th>
                <th>تعيين الشيء</th>
                <th style="width: 45px;">الكمية</th>
                <th style="width: 95px;">مصدره</th>
                <th style="width: 75px;">قیمته</th>
                <th style="width: 90px;">التعيين</th>
                <th style="width: 55px;">الحالة</th>
                <th style="width: 75px;">خروجه</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <div class="sig-box"><p>المقتصد / مسير المصالح الاقتصادية</p>..........................</div>
            <div class="sig-box"><p>مسؤول المخبر</p>..........................</div>
            <div class="sig-box"><p>مدير المؤسسة</p>..........................</div>
          </div>
        </body>
      </html>
    `;

    const headers = ['#', 'رقم التسجيل', 'تاريخ التسجيل', 'تعيين العتاد والأجهزة', 'العدد', 'المصدر / المورد', 'سعر الوحدة', 'مكان الحفظ', 'الحالة', 'تاريخ الخروج', 'ملاحظات'];
    const rows = filteredEquipment.map((e, index) => [
      (index + 1).toString().padStart(2, '0'),
      e.serialNumber || '-',
      e.registrationDate || e.foundationalInventory || '-',
      e.smartNameAr || e.name,
      e.totalQuantity,
      e.source || e.supplier || '-',
      e.price ? `${e.price} د.ج` : '-',
      e.location || '-',
      e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف / مشطوب',
      e.exitDate || '-',
      e.notes || '-'
    ]);

    const totalQuantity = filteredEquipment.reduce((acc, curr) => acc + (Number(curr.totalQuantity) || 0), 0);
    const functionalCount = filteredEquipment.filter(e => e.status === 'functional').length;

    openPrintPreview({
      title: 'سجل جرد العتاد العام للمؤسسة',
      subtitle: `المؤسسة: ${schoolName} · عدد البنود: ${filteredEquipment.length} · التاريخ: ${formattedDate}`,
      type: 'table',
      suggestedOrientation: 'landscape',
      headers,
      rows,
      summaryCards: [
        { label: 'إجمالي البنود المسجلة', value: filteredEquipment.length },
        { label: 'إجمالي القطع والتجهيزات', value: totalQuantity },
        { label: 'الأجهزة السليمة والجاهزة', value: functionalCount },
        { label: 'تحت الصيانة أو الإسقاط', value: filteredEquipment.length - functionalCount }
      ],
      customHtml: html
    });
  };

  const handlePrintInventoryCards = (targetItem?: Equipment) => {
    if (targetItem) {
      setStickerModalItem(targetItem);
    } else {
      setStickerModalItem(null);
    }
    setIsStickerModalOpen(true);
  };

  const handleExportPDF = async () => {
    const headers = ['#', 'رقم التسجيل', 'تاريخ التكفل بالتسجيل', 'تعيين الشيء', 'الكمية', 'مصدره', 'قیمته', 'التعيين', 'الحالة', 'خروجه', 'ملاحظات'];
    const tableData = filteredEquipment.map((e, index) => [
      index + 1,
      e.serialNumber || '---',
      e.registrationDate || e.foundationalInventory || '---',
      e.smartNameAr || e.name,
      e.totalQuantity,
      e.source || e.supplier || '---',
      e.price || '---',
      e.location || '---',
      e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف / مشطوب',
      e.exitDate || '---',
      e.notes || '---'
    ]);

    await PDFService.generateTablePDF(
      'تقرير سجل الجرد العام للعتاد والتجهيزات',
      headers,
      tableData,
      `general_inventory_${new Date().toISOString().split('T')[0]}`,
      {
        subtitle: `سجل الجرد العام للمؤسسة - العدد الإجمالي: ${filteredEquipment.length}`,
        schoolInfo: {
          school: schoolName,
          directorate: directorate,
          laboratory: 'مخبر العلوم والتكنولوجيا'
        },
        summaryCards: [
          { label: 'إجمالي أصناف الجرد', value: filteredEquipment.length },
          { label: 'أصناف سليمة ونشطة', value: filteredEquipment.filter(e => e.status === 'functional').length },
          { label: 'أصناف خارج الخدمة / شطب', value: filteredEquipment.filter(e => e.status === 'broken' || (e.exitDate && e.exitDate !== '---')).length },
          { label: 'تاريخ التقرير', value: new Date().toLocaleDateString('ar-DZ') }
        ]
      }
    );
  };

  const handleExportWord = () => {
    const headers = ['#', 'رقم التسجيل', 'تاريخ التكفل بالتسجيل', 'تعيين الشيء', 'الكمية', 'مصدره', 'قیمته', 'التعيين', 'الحالة', 'خروجه', 'ملاحظات'];
    const tableData = filteredEquipment.map((e, index) => [
      index + 1,
      e.serialNumber || '---',
      e.registrationDate || e.foundationalInventory || '---',
      e.smartNameAr || e.name,
      e.totalQuantity,
      e.source || e.supplier || '---',
      e.price || '---',
      e.location || '---',
      e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف / مشطوب',
      e.exitDate || '---',
      e.notes || '---'
    ]);

    PDFService.downloadTableWord(
      'تقرير سجل الجرد العام للعتاد والتجهيزات',
      headers,
      tableData,
      `general_inventory_${new Date().toISOString().split('T')[0]}.doc`,
      {
        subtitle: `سجل الجرد العام للمؤسسة - العدد الإجمالي: ${filteredEquipment.length}`,
        schoolInfo: {
          school: schoolName,
          directorate: directorate,
          laboratory: 'مخبر العلوم والتكنولوجيا'
        },
        summaryCards: [
          { label: 'إجمالي أصناف الجرد', value: filteredEquipment.length },
          { label: 'أصناف سليمة ونشطة', value: filteredEquipment.filter(e => e.status === 'functional').length },
          { label: 'أصناف خارج الخدمة / شطب', value: filteredEquipment.filter(e => e.status === 'broken' || (e.exitDate && e.exitDate !== '---')).length },
          { label: 'تاريخ التقرير', value: new Date().toLocaleDateString('ar-DZ') }
        ]
      }
    );
  };

  const handleSmartUpdate = async () => {
    if (equipment.length === 0) {
      alert('لا توجد بيانات لتحديثها.');
      return;
    }

    setIsSmartUpdateConfirmOpen(false);

    // Ensure API key is available before starting
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      alert('يرجى اختيار مفتاح API الخاص بك لاستخدام ميزة التحديث الذكي.');
      return;
    }

    setIsSmartUpdating(true);
    setBulkProgress({ current: 0, total: equipment.length });

    try {
      // Process in chunks to avoid large payloads
      const CHUNK_SIZE = 10;
      for (let i = 0; i < equipment.length; i += CHUNK_SIZE) {
        const chunk = equipment.slice(i, i + CHUNK_SIZE);
        const itemsToProcess = chunk.map(item => ({ id: item.id, name: item.name }));
        
        const enrichedData = await getEquipmentIntelligence(itemsToProcess);
        
        if (!enrichedData) {
          throw new Error('فشل الحصول على بيانات الذكاء الاصطناعي.');
        }

        const { updateEquipment } = await import('../lib/api/equipment');
        await Promise.all(enrichedData.map(item => updateEquipment(item.id, {
          smartNameAr: item.smartNameAr,
          smartDescriptionAr: item.smartDescriptionAr,
          imageKeyword: item.imageKeyword,
        })));
        setBulkProgress({ current: Math.min(i + CHUNK_SIZE, equipment.length), total: equipment.length });
        
        // Small delay between chunks to respect rate limits (15 RPM for free tier)
        if (i + CHUNK_SIZE < equipment.length) {
          await new Promise(r => setTimeout(r, 5000));
        }
      }

      alert('تم التحديث الذكي لجميع التجهيزات بنجاح!');
    } catch (error: any) {
      console.error('Error in smart update:', error);
      const errorMsg = error.message || '';
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        alert('تم تجاوز حد الاستخدام المسموح به للذكاء الاصطناعي (Quota Exceeded). يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
      } else {
        alert('حدث خطأ أثناء التحديث الذكي. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsSmartUpdating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const handlePrint = (e: Equipment) => {
    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة تقنية - ${e.name}</title>
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 40px; background: #fdfdfb; }
            .header { text-align: center; border-bottom: 3px solid #1a2744; padding-bottom: 30px; margin-bottom: 40px; }
            .title { font-size: 32px; font-weight: 900; color: #1a2744; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; font-weight: bold; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; }
            .label { font-weight: 900; color: #1a2744; }
            .value { font-weight: bold; color: #444; }
            .footer { margin-top: 80px; text-align: left; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">بطاقة تقنية للعتاد المخبري</div>
            <div class="subtitle">نظام تسيير المخابر المدرسية — الأرضية الرقمية</div>
          </div>
          <div class="details">
            <div class="item"><span class="label">اسم الصنف:</span> <span class="value">${e.name}</span></div>
            <div class="item"><span class="label">النوع:</span> <span class="value">${e.type === 'glassware' ? 'زجاجيات' : e.type === 'tech' ? 'أجهزة تقنية' : 'أخرى'}</span></div>
            <div class="item"><span class="label">الرقم التسلسلي:</span> <span class="value">${e.serialNumber || 'N/A'}</span></div>
            <div class="item"><span class="label">الحالة الحالية:</span> <span class="value">${e.status === 'functional' ? 'سليم' : e.status === 'maintenance' ? 'صيانة' : 'تالف'}</span></div>
            <div class="item"><span class="label">الكمية الإجمالية:</span> <span class="value">${e.totalQuantity}</span></div>
            <div class="item"><span class="label">الكمية المتوفرة:</span> <span class="value">${e.availableQuantity}</span></div>
            <div class="item"><span class="label">الكمية التالفة:</span> <span class="value">${e.brokenQuantity}</span></div>
          </div>
          <div class="footer">طبع بتاريخ: ${new Date().toLocaleString('ar-DZ')}</div>
        </body>
      </html>
    `;
    openPrintPreview({
      title: `بطاقة تقنية - ${e.smartNameAr || e.name}`,
      subtitle: `رقم التسجيل: ${e.serialNumber || '—'} · المؤسسة: ${schoolName}`,
      type: 'cards',
      cards: [{
        title: e.smartNameAr || e.name,
        code: e.serialNumber,
        details: [
          { label: 'النوع والتصنيف', value: e.type === 'glassware' ? 'زجاجيات' : e.type === 'tech' ? 'أجهزة ومعدات تقنية' : 'أخرى' },
          { label: 'الرقم التسلسلي', value: e.serialNumber || '—' },
          { label: 'الحالة الحالية', value: e.status === 'functional' ? 'سليم وجاهز' : e.status === 'maintenance' ? 'صيانة' : 'تالف' },
          { label: 'الكمية الإجمالية', value: e.totalQuantity },
          { label: 'الكمية المتوفرة', value: e.availableQuantity },
          { label: 'الكمية التالفة', value: e.brokenQuantity },
          { label: 'مكان الحفظ', value: e.location || '—' },
          { label: 'المصدر / المورد', value: e.source || e.supplier || '—' }
        ]
      }],
      customHtml: html
    });
  };

  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For price, dates, totalQuantity: default to 'desc' on first click ("من الأكبر إلى الأصغر" / "الأحدث أولاً")
      if (field === 'price' || field === 'totalQuantity' || field === 'registrationDate' || field === 'exitDate' || field === 'foundationalInventory') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEquipment.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipment.map(e => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} صنف؟`)) return;
    try {
      const { deleteEquipment } = await import('../lib/api/equipment');
      await Promise.all(selectedIds.map(id => deleteEquipment(id)));
      await logActivity(schoolId, LogAction.DELETE, LogModule.EQUIPMENT, `حذف جماعي لـ ${selectedIds.length} صنف`);
      setSelectedIds([]);
      alert('تم الحذف بنجاح!');
    } catch (error) {
      console.error('Failed to bulk delete equipment', error);
      alert('حدث خطأ أثناء الحذف الجماعي');
    }
  };

  const handleBulkStatusUpdate = async (status: Equipment['status']) => {
    try {
      const { updateEquipment } = await import('../lib/api/equipment');
      await Promise.all(selectedIds.map(id => updateEquipment(id, { status })));
      await logActivity(schoolId, LogAction.UPDATE, LogModule.EQUIPMENT, `تحديث حالة جماعي (${status}) لـ ${selectedIds.length} صنف`);
      setSelectedIds([]);
      alert('تم تحديث الحالة بنجاح!');
    } catch (error) {
      console.error('Failed to bulk update status', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleRequestSmartUpdate = async (item: Equipment) => {
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      alert('يرجى تهيئة مفتاح API لاستخدام الميزات الذكية.');
      return;
    }

    setIsAnalyzing(true);
    setSelectedEquipment(item);
    try {
      const result = await getEquipmentIntelligence([{ id: item.id, name: item.name }]);
      if (result && result.length > 0) {
        setSuggestedUpdate(result[0]);
        setIsReviewModalOpen(true);
      } else {
        alert('فشل الذكاء الاصطناعي في تحليل هذا الصنف.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveUpdate = async () => {
    if (!suggestedUpdate || !selectedEquipment) return;
    try {
      const { updateEquipment } = await import('../lib/api/equipment');
      await updateEquipment(selectedEquipment.id, {
        smartNameAr: suggestedUpdate.smartNameAr,
        smartDescriptionAr: suggestedUpdate.smartDescriptionAr,
        imageKeyword: suggestedUpdate.imageKeyword,
      });
      setIsReviewModalOpen(false);
      setSuggestedUpdate(null);
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Failed to approve equipment update', error);
      alert('حدث خطأ أثناء تحديث بيانات الجهاز');
    }
  };

  const handleBulkSmartUpdate = async () => {
    setIsBulkConfirmOpen(false);
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      alert('يرجى تهيئة مفتاح API لاستخدام الميزات الذكية.');
      return;
    }

    setIsBulkUpdating(true);
    const CHUNK_SIZE = 5;
    let processed = 0;
    const total = equipment.length;
    setBulkProgress({ current: 0, total });

    try {
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = equipment.slice(i, i + CHUNK_SIZE);
        const chunkResults = await getEquipmentIntelligence(chunk.map(e => ({ id: e.id, name: e.name })));
        
        if (chunkResults) {
          const { updateEquipment } = await import('../lib/api/equipment');
          await Promise.all(chunkResults.map(res => updateEquipment(res.id, {
            smartNameAr: res.smartNameAr,
            smartDescriptionAr: res.smartDescriptionAr,
            imageKeyword: res.imageKeyword,
          })));
        }
        
        processed += chunk.length;
        setBulkProgress({ current: processed, total });
      }
      alert('تم تحديث جميع العتاد ذكياً بنجاح!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التحديث الجماعي.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipment
      .filter(e => {
        const s = (searchTerm || '').toLowerCase().trim();
        const matchesSearch = !s ||
          e.name?.toLowerCase().includes(s) ||
          e.smartNameAr?.toLowerCase().includes(s) ||
          e.serialNumber?.toLowerCase().includes(s) ||
          e.source?.toLowerCase().includes(s) ||
          e.supplier?.toLowerCase().includes(s) ||
          e.location?.toLowerCase().includes(s) ||
          e.price?.toLowerCase().includes(s) ||
          e.registrationDate?.toLowerCase().includes(s) ||
          e.foundationalInventory?.toLowerCase().includes(s) ||
          e.exitDate?.toLowerCase().includes(s) ||
          e.notes?.toLowerCase().includes(s);
        
        const matchesType = filterType === 'all' || 
                           (filterType === 'smart' ? !!e.smartNameAr : e.type === filterType);
        
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus;

        const matchesExit = filterExitStatus === 'all' ||
          (filterExitStatus === 'active' ? (!e.exitDate || e.exitDate === '---' || e.exitDate === '-') :
          (filterExitStatus === 'exited' ? (!!e.exitDate && e.exitDate !== '---' && e.exitDate !== '-') : true));

        return matchesSearch && matchesType && matchesStatus && matchesExit;
      })
      .sort((a, b) => {
        if (sortField === 'none') return 0;
        
        // 1. Price numeric comparison
        if (sortField === 'price') {
          const aPrice = getPriceNumeric(a.price);
          const bPrice = getPriceNumeric(b.price);
          // Items with missing or invalid price placed at the bottom
          if (aPrice < 0 && bPrice < 0) return 0;
          if (aPrice < 0) return 1;
          if (bPrice < 0) return -1;
          return sortDirection === 'desc' ? bPrice - aPrice : aPrice - bPrice;
        }

        // 2. Dates comparison (registrationDate, exitDate, foundationalInventory)
        if (sortField === 'registrationDate' || sortField === 'exitDate' || sortField === 'foundationalInventory') {
          const aDate = getDateNumeric(a[sortField]);
          const bDate = getDateNumeric(b[sortField]);
          // Items with missing or invalid date placed at the bottom
          if (aDate < 0 && bDate < 0) return 0;
          if (aDate < 0) return 1;
          if (bDate < 0) return -1;
          return sortDirection === 'desc' ? bDate - aDate : aDate - bDate;
        }

        // 3. Serial Number natural numeric comparison (1, 2, 3... 10, 11)
        if (sortField === 'serialNumber') {
          const aSerial = getSerialNumeric(a.serialNumber);
          const bSerial = getSerialNumeric(b.serialNumber);
          if (aSerial !== bSerial) {
            return sortDirection === 'asc' ? aSerial - bSerial : bSerial - aSerial;
          }
          return sortDirection === 'asc' 
            ? String(a.serialNumber || '').localeCompare(String(b.serialNumber || ''), undefined, { numeric: true })
            : String(b.serialNumber || '').localeCompare(String(a.serialNumber || ''), undefined, { numeric: true });
        }

        // 4. Quantity numeric comparison
        if (sortField === 'totalQuantity' || sortField === 'availableQuantity' || sortField === 'brokenQuantity') {
          const aQty = Number(a[sortField]) || 0;
          const bQty = Number(b[sortField]) || 0;
          return sortDirection === 'desc' ? bQty - aQty : aQty - bQty;
        }

        // 5. Name (Arabic localized comparison with normalized characters)
        if (sortField === 'name') {
          const aName = normalizeArabicForSort(a.smartNameAr || a.name);
          const bName = normalizeArabicForSort(b.smartNameAr || b.name);
          const comp = aName.localeCompare(bName, 'ar', { numeric: true, sensitivity: 'base' });
          return sortDirection === 'asc' ? comp : -comp;
        }

        // 6. Generic string comparison (source, supplier, location, status, notes)
        const aVal = String(a[sortField] || '').trim();
        const bVal = String(b[sortField] || '').trim();
        if (!aVal && !bVal) return 0;
        if (!aVal) return 1;
        if (!bVal) return -1;
        const comp = aVal.localeCompare(bVal, 'ar', { numeric: true, sensitivity: 'base' });
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [equipment, searchTerm, filterType, filterStatus, filterExitStatus, sortField, sortDirection]);

  const rowVirtualizer = useVirtualizer({
    count: filteredEquipment.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 10,
  });

  const totalPieces = equipment.reduce((acc, curr) => acc + (Number(curr.totalQuantity) || 0), 0);
  const totalAvailable = equipment.reduce((acc, curr) => acc + (Number(curr.availableQuantity) || 0), 0);
  const totalBroken = equipment.reduce((acc, curr) => acc + (Number(curr.brokenQuantity) || 0), 0);
  const totalTypes = equipment.length;
  const totalEstimatedValue = equipment.reduce((acc, curr) => {
    if (!curr.price) return acc;
    const cleaned = curr.price.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? acc : acc + num;
  }, 0);

  return {
    schoolId,
    schoolName,
    directorate,
    commune,
    searchParams,
    navigate,
    equipment,
    setEquipment,
    loading,
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterExitStatus, setFilterExitStatus,
    isAddModalOpen, setIsAddModalOpen,
    editingEquipment, setEditingEquipment,
    isSmartUpdating,
    isSmartUpdateConfirmOpen, setIsSmartUpdateConfirmOpen,
    bulkProgress,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    qrCodeItem, setQrCodeItem,
    isQRModalOpen, setIsQRModalOpen,
    isQRScannerOpen, setIsQRScannerOpen,
    selectedIds, setSelectedIds,
    fileInputRef,
    isImporting,
    isHistoryModalOpen, setIsHistoryModalOpen,
    selectedEquipHistory,
    currentEquipName,
    isAnalyzing,
    isBulkUpdating,
    suggestedUpdate, setSuggestedUpdate,
    isReviewModalOpen, setIsReviewModalOpen,
    isBulkConfirmOpen, setIsBulkConfirmOpen,
    selectedEquipment,
    newEquipment, setNewEquipment,
    handleAddEquipment,
    handleDeleteEquipment,
    handleImportXLS,
    handleDownloadGeneralInventoryTemplate,
    handleExportGeneralInventoryXLS,
    handleUpdateStatus,
    handleInlineUpdate,
    handleQuickAddRow,
    handleDuplicateEquipment,
    fetchHistory,
    handleExportXLS,
    handlePrintList,
    handlePrintInventoryCards,
    isStickerModalOpen,
    setIsStickerModalOpen,
    stickerModalItem,
    setStickerModalItem,
    handleExportPDF,
    handleExportWord,
    handleSmartUpdate,
    handlePrint,
    handleSort,
    handleToggleSelect,
    handleSelectAll,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleRequestSmartUpdate,
    handleApproveUpdate,
    handleBulkSmartUpdate,
    filteredEquipment,
    rowVirtualizer,
    parentRef,
    totalPieces,
    totalAvailable,
    totalBroken,
    totalTypes,
    totalEstimatedValue
  };
}
