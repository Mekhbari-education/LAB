import React, { useMemo, useRef, useState } from 'react';
import {
  Beaker,
  Plus,
  Search,
  Printer,
  FileDown,
  Download,
  FileUp,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Thermometer,
  ShieldCheck,
  MapPin,
  BookOpen,
  Info,
  Check,
  Minus,
  CheckSquare,
  ArrowRightLeft,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { useSchool } from '../context/SchoolContext';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { useSqlCollection } from '../hooks/useSqlCollection';
import { PDFService } from '../services/pdfService';
import { ROUTES } from '../config/routes';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { Equipment } from '../types/equipment';
import {
  GlasswareItem,
  GlasswareStatus,
  createGlassware,
  createGlasswareBulk,
  updateGlassware,
  deleteGlassware,
  deleteGlasswareBulk,
} from '../lib/api/glassware';
import {
  GLASSWARE_CATALOG,
  GLASSWARE_CATEGORIES,
  GlasswareCategoryId,
  GlasswareCatalogTemplate,
  findGlasswareCatalogMatch,
} from '../data/glasswareCatalog';
import { buildGlasswareStockCardsHtml } from '../services/glasswareStockCardPrintService';

type ActiveTab = 'stock' | 'catalog';

const STATUS_STYLES: Record<GlasswareStatus, string> = {
  جيدة: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  'تحتاج إصلاح':
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  مكسورة: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
  مفقودة: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
};

function GlasswareThumb({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-slate-800 dark:to-slate-900 text-primary/60',
          className
        )}
      >
        <Beaker className="w-1/2 h-1/2 max-w-10 max-h-10" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}

export default function GlasswareStore() {
  const { schoolName, directorate, commune, academicYear } = useSchool();
  const { openPrintPreview } = usePrintSettings();
  const { openPdfPreview } = usePdfPreview();

  const {
    data: items,
    loading,
    invalidate,
  } = useSqlCollection<GlasswareItem>('glassware_inventory', '/api/db/glassware');

  const { data: equipmentList } = useSqlCollection<Equipment>('equipment', '/api/db/equipment');

  const [activeTab, setActiveTab] = useState<ActiveTab>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<GlasswareCategoryId | 'all'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCapacities, setSelectedCapacities] = useState<Record<string, string>>({});

  // UI feedback & modals
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{
    template: GlasswareCatalogTemplate;
    item?: GlasswareItem;
  } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GlasswareItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastClickedIndexRef = useRef<number | null>(null);

  const [formState, setFormState] = useState<{
    nameAr: string;
    designationFr: string;
    type: string;
    unit: string;
    quantity: number;
    status: GlasswareStatus;
    location: string;
    notes: string;
  }>({
    nameAr: '',
    designationFr: '',
    type: 'بيشر',
    unit: 'قطعة',
    quantity: 1,
    status: 'جيدة',
    location: 'خزانة الزجاجيات — الرف A1',
    notes: '',
  });

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Filtered stock items
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter(item => {
      const matchesSearch =
        !q ||
        (item.nameAr || '').toLowerCase().includes(q) ||
        (item.designationFr || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q);
      const matchesType = !filterType || item.type === filterType;
      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, searchTerm, filterType, filterStatus]);

  // Filtered catalog items
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return GLASSWARE_CATALOG.filter(tpl => {
      const matchesCategory = catalogCategory === 'all' || tpl.category === catalogCategory;
      const matchesQuery =
        !q ||
        tpl.nameAr.toLowerCase().includes(q) ||
        tpl.designationFr.toLowerCase().includes(q) ||
        tpl.type.toLowerCase().includes(q) ||
        tpl.primaryUses.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [catalogCategory, catalogSearch]);

  // KPI metrics
  const totalTypes = items.length;
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );
  const goodPieces = useMemo(
    () =>
      items
        .filter(i => i.status === 'جيدة')
        .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
    [items]
  );
  const issueItemsCount = useMemo(
    () => items.filter(i => i.status !== 'جيدة').length,
    [items]
  );

  // Glassware items currently stored inside Equipment table (type === 'glassware')
  const glasswareInEquipment = useMemo(
    () => (equipmentList || []).filter(e => e.type === 'glassware'),
    [equipmentList]
  );

  const uniqueTypes = useMemo(
    () => Array.from(new Set(items.map(i => i.type).filter(Boolean))),
    [items]
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormState({
      nameAr: '',
      designationFr: '',
      type: 'بيشر',
      unit: 'قطعة',
      quantity: 1,
      status: 'جيدة',
      location: 'خزانة الزجاجيات — الرف A1',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: GlasswareItem) => {
    setEditingItem(item);
    setFormState({
      nameAr: item.nameAr || '',
      designationFr: item.designationFr || '',
      type: item.type || 'أخرى',
      unit: item.unit || 'قطعة',
      quantity: Number(item.quantity) || 0,
      status: item.status || 'جيدة',
      location: item.location || 'خزانة الزجاجيات',
      notes: item.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nameAr.trim()) {
      showToast('error', 'يرجى إدخال التسمية بالعربية على الأقل.');
      return;
    }
    setIsBusy(true);
    try {
      if (editingItem) {
        await updateGlassware(editingItem.id, formState);
        showToast('success', `تم تحديث "${formState.nameAr}" في مخزن الزجاجيات.`);
      } else {
        await createGlassware(formState);
        showToast('success', `تمت إضافة "${formState.nameAr}" وفتح بطاقة مخزون لها.`);
      }
      invalidate();
      setIsFormModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'تعذر حفظ البيانات. حاول مرة أخرى.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleApplyTemplateToForm = (templateId: string) => {
    const tpl = GLASSWARE_CATALOG.find(t => t.id === templateId);
    if (!tpl) return;
    setFormState(prev => ({
      ...prev,
      nameAr: `${tpl.nameAr} ${tpl.defaultCapacity}`,
      designationFr: `${tpl.designationFr} ${tpl.defaultCapacity}`,
      type: tpl.type,
      unit: tpl.defaultUnit,
      quantity: tpl.suggestedQuantity,
      location: tpl.defaultLocation,
      notes: tpl.careAndSafety,
    }));
  };

  const handleAddCatalogTemplateToStock = async (tpl: GlasswareCatalogTemplate) => {
    const chosenCap = selectedCapacities[tpl.id] || tpl.defaultCapacity;
    const fullNameAr = chosenCap ? `${tpl.nameAr} ${chosenCap}` : tpl.nameAr;
    const fullNameFr = chosenCap ? `${tpl.designationFr} (${chosenCap})` : tpl.designationFr;

    setIsBusy(true);
    try {
      await createGlassware({
        nameAr: fullNameAr,
        designationFr: fullNameFr,
        type: tpl.type,
        unit: tpl.defaultUnit,
        quantity: tpl.suggestedQuantity,
        status: 'جيدة',
        location: tpl.defaultLocation,
        notes: `${tpl.material} · ${tpl.thermalResistance}`,
      });
      invalidate();
      showToast('success', `تمت إضافة "${fullNameAr}" إلى مخزن الزجاجيات بنجاح.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'تعذر إضافة النموذج إلى المخزن.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSeedCatalog = async () => {
    setIsBusy(true);
    try {
      const existingNames = new Set(items.map(i => i.nameAr.trim().toLowerCase()));
      const toAdd = GLASSWARE_CATALOG.filter(
        tpl => !existingNames.has(`${tpl.nameAr} ${tpl.defaultCapacity}`.trim().toLowerCase())
      ).map(tpl => ({
        nameAr: `${tpl.nameAr} ${tpl.defaultCapacity}`,
        designationFr: `${tpl.designationFr} (${tpl.defaultCapacity})`,
        type: tpl.type,
        unit: tpl.defaultUnit,
        quantity: tpl.suggestedQuantity,
        status: 'جيدة' as GlasswareStatus,
        location: tpl.defaultLocation,
        notes: `${tpl.material} · ${tpl.thermalResistance}`,
      }));

      if (toAdd.length === 0) {
        showToast('info', 'جميع النماذج القياسية المصورة مضافة مسبقاً في المخزن.');
        setIsBusy(false);
        return;
      }

      await createGlasswareBulk(toAdd);
      invalidate();
      showToast('success', `تمت إضافة ${toAdd.length} نموذجاً قياسياً إلى مخزن الزجاجيات.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'حدث خطأ أثناء إضافة النماذج القياسية.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportFromEquipment = async () => {
    if (glasswareInEquipment.length === 0) {
      showToast('info', 'لا توجد أصناف مصنفة كزجاجيات في سجل التجهيزات العام.');
      return;
    }

    setIsBusy(true);
    try {
      const existingNames = new Set(items.map(i => (i.nameAr || '').trim().toLowerCase()));
      const candidates = glasswareInEquipment.filter(eq => {
        const displayName = (eq.smartNameAr || eq.name || '').trim().toLowerCase();
        return displayName && !existingNames.has(displayName);
      });

      if (candidates.length === 0) {
        showToast('info', 'جميع الزجاجيات المسجلة في سجل التجهيزات موجودة بالفعل في مخزن الزجاجيات.');
        setIsBusy(false);
        return;
      }

      const payload: Partial<GlasswareItem>[] = candidates.map(eq => {
        const matched = findGlasswareCatalogMatch(eq.smartNameAr || eq.name, eq.name);
        const mappedStatus: GlasswareStatus =
          eq.status === 'broken' || eq.status === 'written_off'
            ? 'مكسورة'
            : eq.status === 'missing'
            ? 'مفقودة'
            : eq.status === 'maintenance' || eq.status === 'needs_inspection'
            ? 'تحتاج إصلاح'
            : 'جيدة';

        return {
          nameAr: eq.smartNameAr || eq.name || matched.nameAr,
          designationFr: matched.designationFr,
          type: matched.type,
          unit: 'قطعة',
          quantity: Number(eq.totalQuantity) || 1,
          status: mappedStatus,
          location: eq.location || matched.defaultLocation,
          notes: eq.notes || `مستورد من سجل العتاد · ${matched.material}`,
        };
      });

      await createGlasswareBulk(payload);
      invalidate();
      showToast('success', `تم استيراد ${payload.length} صنف زجاجيات إلى مخزن الزجاجيات وبطاقات المخزون.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'فشل استيراد الزجاجيات من سجل التجهيزات.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdjustQuantity = async (item: GlasswareItem, delta: number) => {
    const nextQty = Math.max(0, (Number(item.quantity) || 0) + delta);
    try {
      await updateGlassware(item.id, { quantity: nextQty });
      invalidate();
    } catch {
      showToast('error', 'تعذر تحديث الكمية.');
    }
  };

  const handleInlineStatusChange = async (item: GlasswareItem, status: GlasswareStatus) => {
    try {
      await updateGlassware(item.id, { status });
      invalidate();
    } catch {
      showToast('error', 'تعذر تحديث الحالة.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setIsBusy(true);
    try {
      await deleteGlassware(confirmDeleteId);
      setSelectedIds(prev => prev.filter(id => id !== confirmDeleteId));
      await invalidate();
      showToast('success', 'تم حذف الصنف من مخزن الزجاجيات.');
    } catch {
      showToast('error', 'تعذر حذف الصنف.');
    } finally {
      setIsBusy(false);
      setConfirmDeleteId(null);
    }
  };

  // Multi-select helpers
  const activeSelectedIds = useMemo(() => {
    const validIds = new Set(items.map(i => i.id));
    return selectedIds.filter(id => validIds.has(id));
  }, [items, selectedIds]);

  const selectedItems = useMemo(() => {
    const set = new Set(activeSelectedIds);
    return items.filter(i => set.has(i.id));
  }, [items, activeSelectedIds]);

  const isAllFilteredSelected =
    filteredItems.length > 0 && filteredItems.every(item => activeSelectedIds.includes(item.id));
  const isSomeFilteredSelected =
    filteredItems.some(item => activeSelectedIds.includes(item.id)) && !isAllFilteredSelected;

  const handleToggleSelectAllFiltered = () => {
    const filteredIdSet = new Set(filteredItems.map(i => i.id));
    if (isAllFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredItems.map(i => i.id)])));
    }
  };

  const handleToggleSelectRow = (id: string, index: number, shiftKey = false) => {
    if (shiftKey && lastClickedIndexRef.current !== null && filteredItems[lastClickedIndexRef.current]) {
      const start = Math.min(lastClickedIndexRef.current, index);
      const end = Math.max(lastClickedIndexRef.current, index);
      const rangeIds = filteredItems.slice(start, end + 1).map(i => i.id);
      const isCurrentlySelected = activeSelectedIds.includes(id);
      setSelectedIds(prev => {
        if (isCurrentlySelected) {
          const removeSet = new Set(rangeIds);
          return prev.filter(itemId => !removeSet.has(itemId));
        }
        return Array.from(new Set([...prev, ...rangeIds]));
      });
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    }
    lastClickedIndexRef.current = index;
  };

  const handleQuickSelectOption = (mode: string) => {
    if (!mode) return;
    if (mode === 'all') {
      setSelectedIds(filteredItems.map(i => i.id));
    } else if (mode === 'all_store') {
      setSelectedIds(items.map(i => i.id));
    } else if (mode === 'good') {
      setSelectedIds(filteredItems.filter(i => i.status === 'جيدة').map(i => i.id));
    } else if (mode === 'damaged') {
      setSelectedIds(filteredItems.filter(i => i.status !== 'جيدة').map(i => i.id));
    } else if (mode === 'invert') {
      const current = new Set(activeSelectedIds);
      setSelectedIds(filteredItems.filter(i => !current.has(i.id)).map(i => i.id));
    } else if (mode === 'none') {
      setSelectedIds([]);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (activeSelectedIds.length === 0) {
      setConfirmBulkDelete(false);
      return;
    }
    setIsBusy(true);
    try {
      const count = activeSelectedIds.length;
      await deleteGlasswareBulk(activeSelectedIds);
      setSelectedIds([]);
      await invalidate();
      showToast('success', `تم حذف ${count} صنف من مخزن الزجاجيات بنجاح.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'تعذر حذف العناصر المحددة.');
    } finally {
      setIsBusy(false);
      setConfirmBulkDelete(false);
    }
  };

  const handlePrintStockCards = (targetItems: Partial<GlasswareItem>[], title?: string) => {
    if (targetItems.length === 0) {
      showToast('info', 'لا توجد عناصر لطباعة بطاقات المخزون الخاصة بها.');
      return;
    }
    const html = buildGlasswareStockCardsHtml(targetItems, {
      schoolName,
      directorate,
      commune,
      academicYear,
    });
    openPrintPreview({
      title: title || `بطاقات مخزون الزجاجيات (${targetItems.length} صنف)`,
      type: 'custom',
      customHtml: html,
      suggestedPaperSize: 'a5',
      suggestedOrientation: 'portrait',
    });
  };

  const getReportConfig = () => {
    const headers = [
      'رقم',
      'التسمية بالعربية',
      'التسمية بالفرنسية (Désignation)',
      'الصنف',
      'الوحدة',
      'الكمية',
      'الحالة',
      'مكان الحفظ',
      'ملاحظات',
    ];
    const rows = filteredItems.map((item, idx) => [
      idx + 1,
      item.nameAr || '—',
      item.designationFr || '—',
      item.type || '—',
      item.unit || 'قطعة',
      item.quantity ?? 0,
      item.status || 'جيدة',
      item.location || 'خزانة الزجاجيات',
      item.notes || '—',
    ]);
    return {
      title: 'سجل مخزن الزجاجيات وبطاقات المخزون',
      subtitle: 'وزارة التربية الوطنية — مخبر العلوم والوسائل التعليمية (الزجاجيات لا تُرقّم في الجرد الدائم)',
      schoolInfo: {
        school: schoolName,
        directorate,
        commune,
        laboratory: 'مخزن الزجاجيات المخبرية',
      },
      headers,
      rows,
      orientation: 'l' as const,
      summaryCards: [
        { label: 'أصناف الزجاجيات', value: totalTypes },
        { label: 'إجمالي القطع', value: totalQuantity },
        { label: 'القطع السليمة', value: goodPieces },
        { label: 'أصناف تالفة / مفقودة', value: issueItemsCount },
      ],
      showSignatures: true,
      notes: 'تخضع الزجاجيات المخبرية لنظام بطاقات المخزون والمتابعة الدورية للكسور.',
    };
  };

  const handlePrintTable = () => {
    const cfg = getReportConfig();
    openPrintPreview({
      title: cfg.title,
      subtitle: `${formatSchoolWithCommune(schoolName, commune)} · ${academicYear || '2025/2026'}`,
      type: 'table',
      suggestedOrientation: 'landscape',
      headers: cfg.headers,
      rows: cfg.rows,
      summaryCards: cfg.summaryCards,
    });
  };

  const handleExportPDF = async () => {
    const cfg = getReportConfig();
    await PDFService.exportLabReportPDF({
      ...cfg,
      fileName: `glassware_stock_${new Date().toISOString().split('T')[0]}.pdf`,
      save: true,
    });
  };

  const handlePreviewPDF = async () => {
    const cfg = getReportConfig();
    const doc = await PDFService.exportLabReportPDF({ ...cfg, save: false });
    openPdfPreview({
      file: doc.output('blob'),
      title: cfg.title,
      fileName: `glassware_stock_${new Date().toISOString().split('T')[0]}.pdf`,
      category: 'مخزن الزجاجيات',
    });
  };

  const handleExportWord = () => {
    const cfg = getReportConfig();
    PDFService.exportLabReportWord({
      ...cfg,
      fileName: `glassware_stock_${new Date().toISOString().split('T')[0]}.doc`,
    });
  };

  const handleExportExcel = (onlySelected = false) => {
    const list = onlySelected && selectedItems.length > 0 ? selectedItems : filteredItems;
    const dataToExport = list.map((item, idx) => ({
      الرقم: idx + 1,
      'التسمية بالعربية': item.nameAr,
      'Désignation (FR)': item.designationFr,
      الصنف: item.type,
      الوحدة: item.unit,
      الكمية: item.quantity,
      الحالة: item.status,
      'مكان الحفظ': item.location,
      ملاحظات: item.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 36 },
      { wch: 16 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 24 },
      { wch: 28 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'مخزن الزجاجيات');
    XLSX.writeFile(wb, `مخزن_الزجاجيات_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        if (!rows.length) {
          showToast('info', 'الملف فارغ ولا يحتوي على صفوف صالحة.');
          return;
        }
        const mapped: Partial<GlasswareItem>[] = rows
          .map(r => {
            const nameAr =
              r['التسمية بالعربية'] || r['الاسم'] || r['تعيين الشيء'] || r['nameAr'] || '';
            const designationFr =
              r['Désignation (FR)'] || r['التسمية بالفرنسية'] || r['designationFr'] || '';
            if (!nameAr && !designationFr) return null;
            const matched = findGlasswareCatalogMatch(String(nameAr), String(designationFr));
            return {
              nameAr: String(nameAr || matched.nameAr),
              designationFr: String(designationFr || matched.designationFr),
              type: String(r['الصنف'] || r['النوع'] || matched.type),
              unit: String(r['الوحدة'] || matched.defaultUnit),
              quantity: Number(r['الكمية'] ?? 1) || 0,
              status: (r['الحالة'] as GlasswareStatus) || 'جيدة',
              location: String(r['مكان الحفظ'] || r['الموقع'] || matched.defaultLocation),
              notes: String(r['ملاحظات'] || ''),
            };
          })
          .filter(Boolean) as Partial<GlasswareItem>[];

        if (mapped.length === 0) {
          showToast('error', 'لم يتم العثور على أعمدة صالحة للاستيراد.');
          return;
        }
        await createGlasswareBulk(mapped);
        invalidate();
        showToast('success', `تم استيراد ${mapped.length} صنف زجاجيات بنجاح.`);
      } catch (err) {
        console.error(err);
        showToast('error', 'تعذر قراءة ملف Excel.');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-6 font-sans" dir="rtl">
      {/* Toast notification */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-6 start-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-bold max-w-md transition-all',
            toast.type === 'success' &&
              'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800',
            toast.type === 'error' &&
              'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800',
            toast.type === 'info' &&
              'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800'
          )}
        >
          <Info size={18} className="shrink-0" />
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Beaker size={15} />
            <span>الجرد والمخزون · نظام بطاقات المخزون (بدون جرد دائم)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
            مخزن الزجاجيات وبطاقات المخزون
          </h1>
          <p className="text-sm sm:text-base text-secondary/80 font-medium max-w-2xl">
            تسيير مخزون الأدوات الزجاجية مثل المخزن الكيميائي، مع دليل نماذج مصورة بالخصائص العلمية وطباعة بطاقات المخزون الرسمية (A5 وجه وظهر).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={handleImportExcel}
          />
          <button
            onClick={() => handlePrintStockCards(filteredItems)}
            disabled={filteredItems.length === 0}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Printer size={17} />
            <span>طباعة بطاقات المخزون ({filteredItems.length})</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={17} />
            <span>إضافة صنف زجاجي</span>
          </button>
          <Link
            to={ROUTES.GLASSWARE_BREAKAGE}
            className="bg-surface border border-outline/15 text-primary hover:bg-surface-container-low px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <AlertTriangle size={16} />
            <span>سجل الكسور</span>
          </Link>
        </div>
      </header>

      {/* Regulatory Notice Banner */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/50 bg-sky-50/70 dark:bg-sky-950/30 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="text-xs sm:text-sm leading-relaxed text-sky-950 dark:text-sky-100">
            <span className="font-black">قاعدة الجرد المعتمدة: </span>
            الزجاجيات المخبرية لا تحمل أرقام جرد عام دائمة ولا تُطبع لها بطاقات الجرد، بل تُتابع عبر{' '}
            <span className="font-bold underline underline-offset-4">بطاقات المخزون</span> تماماً مثل المواد الكيميائية في المخزن الكيميائي.
          </div>
        </div>
        {glasswareInEquipment.length > 0 && (
          <button
            onClick={handleImportFromEquipment}
            disabled={isBusy}
            className="shrink-0 bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft size={14} />
            <span>استيراد الزجاجيات من جدول العتاد ({glasswareInEquipment.length})</span>
          </button>
        )}
      </div>

      {/* KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'أصناف الزجاجيات',
            value: totalTypes,
            sub: 'بطاقة مخزون نشطة',
            icon: Layers,
            tone: 'text-primary bg-primary/10',
          },
          {
            label: 'إجمالي القطع بالمخزن',
            value: totalQuantity,
            sub: 'رصيد فعلي متوفر',
            icon: Package,
            tone: 'text-sky-700 dark:text-sky-300 bg-sky-500/10',
          },
          {
            label: 'قطع صالحة للاستعمال',
            value: goodPieces,
            sub: 'الحالة: جيدة',
            icon: CheckCircle2,
            tone: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10',
          },
          {
            label: 'تحتاج متابعة / كسور',
            value: issueItemsCount,
            sub: 'مكسورة · إصلاح · مفقودة',
            icon: AlertTriangle,
            tone: 'text-amber-700 dark:text-amber-300 bg-amber-500/10',
          },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface-container-lowest border border-outline/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-secondary/70 truncate">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-primary tabular-nums">{stat.value}</p>
                <p className="text-[11px] font-medium text-secondary/60 truncate">{stat.sub}</p>
              </div>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', stat.tone)}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline/10 pb-3">
        <div className="inline-flex p-1 rounded-2xl bg-surface-container-low border border-outline/10">
          <button
            onClick={() => setActiveTab('stock')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all',
              activeTab === 'stock'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            )}
          >
            <Package size={16} />
            <span>المخزن وبطاقات المخزون ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all',
              activeTab === 'catalog'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            )}
          >
            <Sparkles size={16} />
            <span>النماذج الاحترافية المصورة ({GLASSWARE_CATALOG.length})</span>
          </button>
        </div>

        {activeTab === 'stock' ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeedCatalog}
              disabled={isBusy}
              className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>إضافة النماذج القياسية</span>
            </button>
            <button
              onClick={handlePrintTable}
              className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-secondary hover:text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>طباعة السجل</span>
            </button>
            <button
              onClick={handlePreviewPDF}
              className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-secondary hover:text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Eye size={14} />
              <span>معاينة PDF</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-secondary hover:text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2 rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileDown size={14} />
              <span>Word</span>
            </button>
            <button
              onClick={() => handleExportExcel(false)}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-secondary hover:text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileUp size={14} />
              <span>استيراد Excel</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-secondary/70">
            اختر السعة المطلوبة وأضف النموذج مباشرة إلى مخزن الزجاجيات
          </div>
        )}
      </div>

      {/* TAB 1: ACTIVE STOCK LEDGER */}
      {activeTab === 'stock' && (
        <section className="bg-surface-container-lowest border border-outline/10 rounded-3xl overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 sm:p-5 border-b border-outline/10 bg-surface-container-low/40 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={17}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-secondary/50"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث بالتسمية العربية أو الفرنسية، الصنف، أو الخزانة..."
                className="w-full bg-surface border border-outline/15 rounded-xl ps-10 pe-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {/* Quick Multi-Select Options Dropdown */}
              <div className="relative flex items-center">
                <CheckSquare
                  size={14}
                  className="absolute start-3 pointer-events-none text-primary/70"
                />
                <select
                  value=""
                  onChange={e => {
                    handleQuickSelectOption(e.target.value);
                    e.target.value = '';
                  }}
                  aria-label="خيارات التحديد المتعدد"
                  className="bg-surface border border-outline/15 rounded-xl ps-8 pe-3.5 py-2.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">خيارات التحديد ({activeSelectedIds.length})</option>
                  <option value="all">تحديد كل المعروض ({filteredItems.length})</option>
                  <option value="all_store">تحديد كل المخزن ({items.length})</option>
                  <option value="good">تحديد الصالحة فقط (جيدة)</option>
                  <option value="damaged">تحديد التالفة والمفقودة والمحتاجة إصلاح</option>
                  <option value="invert">عكس التحديد الحالي</option>
                  <option value="none">إلغاء كل التحديد</option>
                </select>
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-surface border border-outline/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل الأصناف ({uniqueTypes.length})</option>
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-surface border border-outline/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل الحالات</option>
                <option value="جيدة">جيدة</option>
                <option value="تحتاج إصلاح">تحتاج إصلاح</option>
                <option value="مكسورة">مكسورة</option>
                <option value="مفقودة">مفقودة</option>
              </select>
            </div>
          </div>

          {/* Contextual Multi-Selection Bulk Action Bar */}
          {activeSelectedIds.length > 0 && (
            <div className="px-4 sm:px-5 py-3 bg-primary/[0.06] border-b border-primary/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-primary">
                <span className="inline-flex items-center gap-1.5 font-black tabular-nums">
                  <CheckSquare size={16} />
                  تم تحديد {activeSelectedIds.length} صنف
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-secondary hover:text-primary underline font-bold"
                >
                  إلغاء التحديد
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePrintStockCards(
                      selectedItems,
                      `بطاقات مخزون الزجاجيات المحددة (${selectedItems.length} صنف)`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-surface border border-outline/15 text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={14} />
                  <span>طباعة بطاقات المحدد ({selectedItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportExcel(true)}
                  className="px-3.5 py-2 rounded-xl bg-surface border border-outline/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>تصدير المحدد Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBulkDelete(true)}
                  disabled={isBusy}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span>حذف المحدد ({activeSelectedIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Stock Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-secondary/60">
              <RefreshCw size={26} className="animate-spin text-primary" />
              <span className="text-sm font-bold">جاري تحميل مخزن الزجاجيات...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Beaker size={30} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-primary">مخزن الزجاجيات فارغ حالياً</h3>
                <p className="text-sm text-secondary/70 max-w-md mx-auto">
                  يمكنك تصفح تبويب «النماذج الاحترافية المصورة» لإضافة الزجاجيات القياسية بنقرة واحدة، أو إضافة النماذج الافتراضية دفعة واحدة.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>تصفح النماذج المصورة</span>
                </button>
                <button
                  onClick={handleSeedCatalog}
                  disabled={isBusy}
                  className="bg-surface border border-outline/15 text-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-surface-container-low"
                >
                  <Plus size={16} />
                  <span>إضافة كل النماذج القياسية</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline/10 text-[11px] font-black text-secondary/70">
                    <th className="px-3 py-3.5 text-center w-11">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllFiltered}
                        aria-label={isAllFilteredSelected ? 'إلغاء تحديد الكل' : 'تحديد كل المعروض'}
                        title={isAllFilteredSelected ? 'إلغاء تحديد الكل' : 'تحديد كل المعروض'}
                        className={cn(
                          'w-5 h-5 mx-auto rounded-md border-2 flex items-center justify-center transition-all',
                          isAllFilteredSelected || isSomeFilteredSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-outline/35 bg-surface hover:border-primary/60'
                        )}
                      >
                        {isAllFilteredSelected ? (
                          <Check size={12} />
                        ) : isSomeFilteredSelected ? (
                          <Minus size={12} />
                        ) : null}
                      </button>
                    </th>
                    <th className="px-3 py-3.5 text-center w-10">#</th>
                    <th className="px-4 py-3.5">الأداة الزجاجية والخصائص</th>
                    <th className="px-4 py-3.5">الصنف</th>
                    <th className="px-4 py-3.5 text-center">الكمية المتوفرة</th>
                    <th className="px-4 py-3.5 text-center">الحالة</th>
                    <th className="px-4 py-3.5">مكان الحفظ</th>
                    <th className="px-4 py-3.5 text-center">بطاقة المخزون والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredItems.map((item, idx) => {
                    const matched = findGlasswareCatalogMatch(
                      item.nameAr,
                      item.designationFr,
                      item.type
                    );
                    const isSelected = activeSelectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors group',
                          isSelected
                            ? 'bg-primary/[0.06] hover:bg-primary/[0.09]'
                            : 'hover:bg-primary/[0.025]'
                        )}
                      >
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={e => handleToggleSelectRow(item.id, idx, e.shiftKey)}
                            aria-label={`تحديد ${item.nameAr}`}
                            className={cn(
                              'w-5 h-5 mx-auto rounded-md border-2 flex items-center justify-center transition-all',
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-outline/30 bg-surface group-hover:border-primary/60'
                            )}
                          >
                            {isSelected && <Check size={12} />}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-bold text-secondary/60 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 min-w-[260px]">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate({ template: matched, item })}
                              className="w-12 h-12 rounded-xl overflow-hidden border border-outline/10 shrink-0 hover:ring-2 hover:ring-primary/30 transition-all"
                              title="معاينة الصورة والمواصفات"
                            >
                              <GlasswareThumb
                                src={matched.image}
                                alt={item.nameAr}
                                className="w-full h-full"
                              />
                            </button>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-primary truncate">
                                {item.nameAr}
                              </p>
                              <p
                                className="text-xs font-mono text-secondary/65 truncate text-left"
                                dir="ltr"
                              >
                                {item.designationFr || matched.designationFr}
                              </p>
                              <p className="text-[11px] text-secondary/55 truncate mt-0.5">
                                {matched.material} · {item.unit || 'قطعة'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-secondary whitespace-nowrap">
                          {item.type || matched.type}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustQuantity(item, -1)}
                              className="w-7 h-7 rounded-lg border border-outline/15 bg-surface hover:bg-surface-container-low text-sm font-black text-secondary flex items-center justify-center"
                              title="إنقاص قطعة"
                            >
                              -
                            </button>
                            <span className="min-w-[2.5rem] text-center font-black text-sm text-primary tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustQuantity(item, 1)}
                              className="w-7 h-7 rounded-lg border border-outline/15 bg-surface hover:bg-surface-container-low text-sm font-black text-secondary flex items-center justify-center"
                              title="إضافة قطعة"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={item.status || 'جيدة'}
                            onChange={e =>
                              handleInlineStatusChange(item, e.target.value as GlasswareStatus)
                            }
                            className={cn(
                              'px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer focus:outline-none',
                              STATUS_STYLES[item.status || 'جيدة']
                            )}
                          >
                            <option value="جيدة">جيدة</option>
                            <option value="تحتاج إصلاح">تحتاج إصلاح</option>
                            <option value="مكسورة">مكسورة</option>
                            <option value="مفقودة">مفقودة</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-secondary max-w-[180px] truncate">
                          {item.location || 'خزانة الزجاجيات'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handlePrintStockCards([item], `بطاقة مخزون — ${item.nameAr}`)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold flex items-center gap-1 transition-colors"
                              title="طباعة بطاقة مخزون هذه الزجاجية (A5 وجه وظهر)"
                            >
                              <Printer size={13} />
                              <span>بطاقة المخزون</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate({ template: matched, item })}
                              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
                              title="معلومات العناية والسلامة"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
                              title="تعديل"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3.5 bg-surface-container-low/40 border-t border-outline/10 flex flex-wrap justify-between items-center gap-2 text-xs font-bold text-secondary/70">
            <span className="tabular-nums">
              المعروض: {filteredItems.length} من أصل {items.length} صنف زجاجي
            </span>
            <span>نظام بطاقات المخزون — متوافق مع المخزن الكيميائي</span>
          </div>
        </section>
      )}

      {/* TAB 2: ILLUSTRATED PROFESSIONAL CATALOG */}
      {activeTab === 'catalog' && (
        <section className="space-y-6">
          {/* Category Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-container-lowest border border-outline/10 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2">
              {GLASSWARE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCatalogCategory(cat.id)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-colors',
                    catalogCategory === cat.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-secondary hover:text-primary'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-secondary/50"
              />
              <input
                type="text"
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="ابحث في النماذج المصورة..."
                className="w-full bg-surface border border-outline/15 rounded-xl ps-9 pe-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map(tpl => {
              const chosenCapacity = selectedCapacities[tpl.id] || tpl.defaultCapacity;
              const alreadyCount = items.filter(i =>
                (i.nameAr || '').includes(tpl.nameAr)
              ).length;

              return (
                <article
                  key={tpl.id}
                  className="bg-surface-container-lowest border border-outline/10 rounded-3xl overflow-hidden flex flex-col justify-between transition-colors hover:border-primary/30"
                >
                  <div>
                    {/* 4:3 Studio Photo */}
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-outline/10">
                      <GlasswareThumb
                        src={tpl.image}
                        alt={tpl.nameAr}
                        className="w-full h-full transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 start-3 bg-slate-950/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        {tpl.categoryAr}
                      </div>
                      {alreadyCount > 0 && (
                        <div className="absolute top-3 end-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Check size={12} />
                          <span>بالمخزن ({alreadyCount})</span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-primary leading-snug">
                          {tpl.nameAr}
                        </h3>
                        <p className="text-xs font-mono text-secondary/75 text-left" dir="ltr">
                          {tpl.designationFr}
                        </p>
                        {/* Clean Zero-Pill Metadata Line */}
                        <p className="text-xs font-medium text-secondary/65 pt-0.5">
                          {tpl.material} · السعة القياسية: {chosenCapacity}
                        </p>
                      </div>

                      <p className="text-xs text-secondary/85 leading-relaxed line-clamp-2">
                        {tpl.primaryUses}
                      </p>

                      {/* Capacities selector */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-secondary/70">
                          اختر السعة / القياس للإضافة:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {tpl.capacities.map(cap => (
                            <button
                              key={cap}
                              type="button"
                              onClick={() =>
                                setSelectedCapacities(prev => ({ ...prev, [tpl.id]: cap }))
                              }
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors',
                                chosenCapacity === cap
                                  ? 'bg-primary text-on-primary border-primary'
                                  : 'bg-surface border-outline/15 text-secondary hover:border-primary/40'
                              )}
                            >
                              {cap}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-surface-container-low/40 border-t border-outline/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate({ template: tpl })}
                      className="px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-primary hover:bg-surface-container-low text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye size={14} />
                      <span>المواصفات الكاملة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddCatalogTemplateToStock(tpl)}
                      disabled={isBusy}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />
                      <span>إضافة للمخزن</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* PREVIEW TEMPLATE & CARE MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border border-outline/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="relative h-56 sm:h-64 bg-slate-100 dark:bg-slate-900">
              <GlasswareThumb
                src={previewTemplate.template.image}
                alt={previewTemplate.template.nameAr}
                className="w-full h-full"
              />
              <button
                onClick={() => setPreviewTemplate(null)}
                className="absolute top-4 end-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-3 start-4 bg-black/75 text-white px-3 py-1 rounded-lg text-xs font-bold">
                {previewTemplate.template.categoryAr}
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div>
                <h3 className="text-2xl font-black text-primary">
                  {previewTemplate.item?.nameAr || previewTemplate.template.nameAr}
                </h3>
                <p className="text-sm font-mono text-secondary/75 text-left mt-1" dir="ltr">
                  {previewTemplate.item?.designationFr || previewTemplate.template.designationFr}
                </p>
                <p className="text-xs font-bold text-secondary/70 mt-2">
                  {previewTemplate.template.material} · {previewTemplate.template.precisionClass}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-primary">
                    <Thermometer size={14} />
                    <span>التحمل الحراري والفيزيائي</span>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    {previewTemplate.template.thermalResistance}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-primary">
                    <MapPin size={14} />
                    <span>موقع الحفظ المقترح</span>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    {previewTemplate.item?.location || previewTemplate.template.defaultLocation}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline/10 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 font-black text-primary">
                    <BookOpen size={14} />
                    <span>الاستخدامات البيداغوجية في التجارب</span>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    {previewTemplate.template.primaryUses}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
                    <ShieldCheck size={14} />
                    <span>تعليمات السلامة والعناية والوقاية من الكسر</span>
                  </div>
                  <p className="text-amber-950/85 dark:text-amber-100/90 leading-relaxed">
                    {previewTemplate.template.careAndSafety}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-container-low/50 border-t border-outline/10 flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const target: Partial<GlasswareItem> = previewTemplate.item || {
                    nameAr: `${previewTemplate.template.nameAr} ${
                      selectedCapacities[previewTemplate.template.id] ||
                      previewTemplate.template.defaultCapacity
                    }`,
                    designationFr: previewTemplate.template.designationFr,
                    type: previewTemplate.template.type,
                    unit: previewTemplate.template.defaultUnit,
                    quantity: previewTemplate.template.suggestedQuantity,
                    status: 'جيدة',
                    location: previewTemplate.template.defaultLocation,
                    notes: previewTemplate.template.careAndSafety,
                  };
                  handlePrintStockCards([target], `بطاقة مخزون — ${target.nameAr}`);
                }}
                className="px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Printer size={15} />
                <span>طباعة بطاقة المخزون (A5)</span>
              </button>

              <div className="flex items-center gap-2">
                {!previewTemplate.item && (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCatalogTemplateToStock(previewTemplate.template);
                      setPreviewTemplate(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>إضافة للمخزن</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface border border-outline/15 text-secondary text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STOCK ITEM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border border-outline/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-outline/10 flex items-center justify-between bg-surface-container-low/50">
              <h3 className="text-lg font-black text-primary">
                {editingItem ? 'تعديل بطاقة مخزون الزجاجية' : 'إضافة زجاجية جديدة للمخزن'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {!editingItem && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-primary">
                    تعبئة سريعة من النماذج القياسية (اختياري)
                  </label>
                  <select
                    defaultValue=""
                    onChange={e => handleApplyTemplateToForm(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-primary"
                  >
                    <option value="">-- اختر نموذجاً لتعبئة المواصفات تلقائياً --</option>
                    {GLASSWARE_CATALOG.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.nameAr} ({tpl.defaultCapacity}) — {tpl.categoryAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">التسمية بالعربية *</label>
                  <input
                    required
                    type="text"
                    value={formState.nameAr}
                    onChange={e => setFormState(p => ({ ...p, nameAr: e.target.value }))}
                    placeholder="مثال: بيشر مدرج بيريكس 250 ml"
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">التسمية بالفرنسية</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formState.designationFr}
                    onChange={e => setFormState(p => ({ ...p, designationFr: e.target.value }))}
                    placeholder="Bécher gradué Pyrex 250 ml"
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3.5 py-2.5 text-sm font-mono text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">الصنف</label>
                  <input
                    type="text"
                    value={formState.type}
                    onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">الوحدة</label>
                  <input
                    type="text"
                    value={formState.unit}
                    onChange={e => setFormState(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">الكمية</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.quantity}
                    onChange={e =>
                      setFormState(p => ({ ...p, quantity: Math.max(0, Number(e.target.value)) }))
                    }
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-secondary">الحالة</label>
                  <select
                    value={formState.status}
                    onChange={e =>
                      setFormState(p => ({ ...p, status: e.target.value as GlasswareStatus }))
                    }
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="جيدة">جيدة</option>
                    <option value="تحتاج إصلاح">تحتاج إصلاح</option>
                    <option value="مكسورة">مكسورة</option>
                    <option value="مفقودة">مفقودة</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary">مكان الحفظ والخزانة</label>
                <input
                  type="text"
                  value={formState.location}
                  onChange={e => setFormState(p => ({ ...p, location: e.target.value }))}
                  placeholder="خزانة الزجاجيات — الرف A1"
                  className="w-full bg-surface border border-outline/15 rounded-xl px-3.5 py-2 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary">
                  ملاحظات التخزين والعناية
                </label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={e => setFormState(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-surface border border-outline/15 rounded-xl px-3.5 py-2 text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline/15 text-xs font-bold text-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
                >
                  {editingItem ? 'حفظ التعديلات' : 'إضافة للمخزن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL (SINGLE) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border border-outline/15 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h4 className="text-lg font-black text-primary">تأكيد الحذف</h4>
            <p className="text-sm text-secondary">
              هل تريد حذف هذا الصنف من مخزن الزجاجيات وبطاقات المخزون نهائياً؟
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl border border-outline/15 text-xs font-bold text-secondary disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isBusy ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRM MODAL */}
      {confirmBulkDelete && activeSelectedIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border border-outline/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-lg font-black text-primary">تأكيد الحذف المتعدد</h4>
                <p className="text-xs font-bold text-secondary/70 tabular-nums">
                  سيتم حذف {activeSelectedIds.length} صنف نهائياً من المخزن
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low border border-outline/10 p-3 max-h-36 overflow-y-auto space-y-1 text-xs font-bold text-secondary">
              {selectedItems.slice(0, 6).map(item => (
                <div key={item.id} className="truncate">
                  • {item.nameAr}
                </div>
              ))}
              {selectedItems.length > 6 && (
                <div className="text-primary/70 pt-1 tabular-nums">
                  و {selectedItems.length - 6} أصناف أخرى...
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(false)}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl border border-outline/15 text-xs font-bold text-secondary disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                disabled={isBusy}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isBusy ? 'جاري الحذف...' : `حذف (${activeSelectedIds.length}) نهائياً`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
