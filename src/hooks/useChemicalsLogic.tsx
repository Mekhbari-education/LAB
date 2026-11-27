import { useState, useEffect, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { useSqlCollection } from '../hooks/useSqlCollection';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'react-router-dom';
import {
  getChemicalIntelligence,
  getChemicalsBatchIntelligence,
  getChemicalSafetyGuide,
  ChemicalIntelligence,
  ChemicalBatchIntelligenceItem,
  ChemicalSafetyGuide,
  ensureApiKey
} from '../services/geminiService';
import type { BulkSmartUpdateOptions } from '../components/ChemicalBulkConfirmModal';
import { findDuplicateChemicalIds } from '../utils/chemistryCalc';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';
import { Chemical, GHS_ICONS, GHS_LABELS, getGhsIcon, getGhsLabel } from '../types/chemicals';
import { formatSchoolWithCommune } from '../lib/utils';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

export type ChemicalStatusFilter = 'all' | 'danger' | 'expiring' | 'low' | 'incomplete' | 'duplicates';
export type ChemicalStateFilter = 'all' | 'solid' | 'liquid' | 'gas';

export function useChemicalsLogic(isNested = false) {
  const { schoolId, schoolName, directorate: stateName, commune, academicYear: contextAcademicYear, jobTitle, educationLevel } = useSchool();
  const { userProfile } = useUserRole();
  const { openPrintPreview } = usePrintSettings();
  const academicYear = contextAcademicYear || (typeof window !== 'undefined' ? localStorage.getItem('algeria_lab_academic_year') : null) || '2025/2026';
  const [searchParams] = useSearchParams();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChemicalStatusFilter>(
    searchParams.get('filter') === 'low' ? 'low' : 'all'
  );
  const [stateFilter, setStateFilter] = useState<ChemicalStateFilter>('all');
  const [shelfFilter, setShelfFilter] = useState<string>('all');
  const filterLowStock = statusFilter === 'low';
  const setFilterLowStock = (val: boolean) => setStatusFilter(val ? 'low' : 'all');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isLabCalcOpen, setIsLabCalcOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isSafetyAuditOpen, setIsSafetyAuditOpen] = useState(false);
  const [safetyGuidesCache, setSafetyGuidesCache] = useState<Record<string, ChemicalSafetyGuide>>({});
  const [loadingSafetyGuideId, setLoadingSafetyGuideId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    successCount: number;
    failCount: number;
    currentLabel?: string;
  }>({ current: 0, total: 0, successCount: 0, failCount: 0, currentLabel: '' });
  const cancelBulkRef = useRef(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [suggestedUpdate, setSuggestedUpdate] = useState<ChemicalIntelligence | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Chemical; direction: 'asc' | 'desc' } | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'غير محدد';
    if (!dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const [newChemical, setNewChemical] = useState<Partial<Chemical>>({
    nameEn: '',
    nameAr: '',
    formula: '',
    casNumber: '',
    storageTemp: '',
    unit: 'g',
    quantity: 0,
    state: 'solid',
    hazardClass: 'safe',
    ghs: [],
    shelf: '',
    expiryDate: '',
    notes: ''
  });

  const { data: chemicalsList, loading: chemicalsLoading, error, invalidate } = useSqlCollection<Chemical>('chemicals', '/api/db/chemicals');
  
  useEffect(() => {
    if (!chemicalsLoading) {
      setChemicals(chemicalsList);
      setLoading(false);

      const validIdSet = new Set(chemicalsList.map(c => c.id));
      setSelectedIds(prev => {
        const next = prev.filter(id => validIdSet.has(id));
        return next.length === prev.length ? prev : next;
      });
      
      const targetId = searchParams.get('id');
      if (targetId) {
        let actualId = targetId;
        if (targetId.startsWith('APP_ID_')) {
          const parts = targetId.split('_');
          actualId = parts.slice(2, -1).join('_');
        }
        setSearchTerm(actualId);
        const item = chemicalsList.find(e => e.id === targetId || e.id === actualId);
        if (item) {
          setSelectedChemical(item);
        } else if (chemicalsList.length > 0 && (!selectedChemical || !validIdSet.has(selectedChemical.id))) {
          setSelectedChemical(chemicalsList[0]);
        } else if (chemicalsList.length === 0) {
          setSelectedChemical(null);
        }
      } else if (chemicalsList.length === 0) {
        setSelectedChemical(null);
      } else if (!selectedChemical || !validIdSet.has(selectedChemical.id)) {
        setSelectedChemical(chemicalsList[0]);
      }
    }
  }, [chemicalsList, chemicalsLoading, searchParams]);

  const handleAddChemical = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChemical) {
        const { id } = editingChemical;
        const { updateChemical } = await import('../lib/api/chemicals');
        await updateChemical(id, newChemical as Chemical);
        await logActivity(schoolId, LogAction.UPDATE, LogModule.CHEMICALS, `تعديل بيانات المادة: ${newChemical.nameAr}`, id);
      } else {
        const { createChemical } = await import('../lib/api/chemicals');
        const docRef = await createChemical(newChemical as Chemical);
        await logActivity(schoolId, LogAction.CREATE, LogModule.CHEMICALS, `إضافة مادة جديدة: ${newChemical.nameAr}`, docRef.id);
      }
      setIsAddModalOpen(false);
      setEditingChemical(null);
      await invalidate();
      setNewChemical({
        nameEn: '',
        nameAr: '',
        formula: '',
        casNumber: '',
        storageTemp: '',
        unit: 'g',
        quantity: 0,
        state: 'solid',
        hazardClass: 'safe',
        ghs: [],
        shelf: '',
        expiryDate: '',
        notes: ''
      });
    } catch (error) {
      handleFirestoreError(error, editingChemical ? OperationType.UPDATE : OperationType.CREATE, 'chemicals');
    }
  };

  const handleSmartFill = async () => {
    const nameToUse = newChemical.nameEn || newChemical.nameAr;
    if (!nameToUse) {
      showToast('error', 'يرجى إدخال اسم المادة أولاً (بالعربية أو الإنجليزية).');
      return;
    }

    setIsGenerating(true);
    try {
      const info = await getChemicalIntelligence(nameToUse);
      if (info) {
        // Calculate expiry date based on expiryYears
        let expiryDate = '';
        if (info.expiryYears > 0) {
          const date = new Date();
          date.setFullYear(date.getFullYear() + info.expiryYears);
          expiryDate = date.toISOString().split('T')[0];
        }

        setNewChemical(prev => ({
          ...prev,
          nameEn: info.nameEn || prev.nameEn,
          nameAr: info.nameAr || prev.nameAr,
          formula: info.formula || prev.formula,
          casNumber: info.casNumber || prev.casNumber,
          storageTemp: info.storageTemp || prev.storageTemp,
          hazardClass: info.hazardClass || prev.hazardClass,
          ghs: info.ghs || prev.ghs,
          expiryDate: expiryDate || prev.expiryDate,
          notes: info.notes || prev.notes
        }));
        showToast('success', 'تم ملء البيانات الكيميائية ذكياً بنجاح.');
      } else {
        showToast('error', 'لم نتمكن من الحصول على معلومات دقيقة لهذه المادة. يرجى إدخالها يدوياً.');
      }
    } catch (error) {
      console.error('Smart fill error:', error);
      showToast('error', 'حدث خطأ أثناء محاولة الحصول على المعلومات الذكية.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRequestSmartUpdate = async (chemical?: Chemical) => {
    const target = chemical || selectedChemical;
    if (!target) return;
    
    setIsGenerating(true);
    try {
      const info = await getChemicalIntelligence(target.nameEn || target.nameAr);
      if (info) {
        setSuggestedUpdate(info);
        if (chemical) setSelectedChemical(chemical);
        setIsReviewModalOpen(true);
      } else {
        showToast('error', 'لم نتمكن من الحصول على اقتراحات تحديث لهذه المادة.');
      }
    } catch (error) {
      console.error('Smart update request error:', error);
      showToast('error', 'حدث خطأ أثناء طلب التحديث الذكي.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveUpdate = async () => {
    if (!selectedChemical || !suggestedUpdate) return;

    try {
      let expiryDate = selectedChemical.expiryDate;
      if (suggestedUpdate.expiryYears > 0) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + suggestedUpdate.expiryYears);
        expiryDate = date.toISOString().split('T')[0];
      }

      const { updateChemical } = await import('../lib/api/chemicals');
      const patch: Partial<Chemical> = {
        nameEn: suggestedUpdate.nameEn,
        nameAr: suggestedUpdate.nameAr,
        formula: suggestedUpdate.formula,
        casNumber: suggestedUpdate.casNumber,
        storageTemp: suggestedUpdate.storageTemp,
        hazardClass: suggestedUpdate.hazardClass,
        ghs: suggestedUpdate.ghs,
        expiryDate: expiryDate,
        notes: suggestedUpdate.notes,
      };
      await updateChemical(selectedChemical.id, patch);
      setChemicals(prev => prev.map(item => (item.id === selectedChemical.id ? { ...item, ...patch } : item)));
      setSelectedChemical(prev => (prev?.id === selectedChemical.id ? { ...prev, ...patch } : prev));
      await invalidate();
      setIsReviewModalOpen(false);
      setSuggestedUpdate(null);
      showToast('success', 'تم تحديث معلومات المادة بنجاح!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chemicals/${selectedChemical.id}`);
    }
  };

  const isChemicalMissingInfo = (c: Chemical) =>
    !c.formula?.trim() ||
    !c.casNumber?.trim() ||
    !c.storageTemp?.trim() ||
    !c.notes?.trim() ||
    !c.nameEn?.trim() ||
    !c.nameAr?.trim();

  const missingChemicalsCount = useMemo(
    () => chemicals.filter(isChemicalMissingInfo).length,
    [chemicals]
  );

  const cancelBulkUpdate = () => {
    cancelBulkRef.current = true;
    showToast('info', 'جاري إيقاف التحديث الذكي بعد انتهاء الدفعة الحالية...');
  };

  const handleBulkSmartUpdate = async (
    options: BulkSmartUpdateOptions = { scope: 'missing', overwriteExisting: false }
  ) => {
    setIsBulkConfirmOpen(false);

    const hasKey = await ensureApiKey();
    if (!hasKey) {
      showToast('error', 'يرجى التأكد من تفعيل مفتاح Gemini API لاستخدام ميزة التحديث الذكي.');
      return;
    }

    let targets: Chemical[] = [];
    if (options.scope === 'selected' && selectedIds.length > 0) {
      const selectedSet = new Set(selectedIds);
      targets = chemicals.filter(c => selectedSet.has(c.id));
    } else if (options.scope === 'missing') {
      targets = chemicals.filter(isChemicalMissingInfo);
    } else {
      targets = [...chemicals];
    }

    targets = targets.filter(c => (c.nameEn || c.nameAr || '').trim().length > 0);

    if (targets.length === 0) {
      showToast('info', 'لا توجد مواد تحتاج إلى تحديث ضمن النطاق المحدد.');
      return;
    }

    cancelBulkRef.current = false;
    setIsBulkUpdating(true);
    setBulkProgress({
      current: 0,
      total: targets.length,
      successCount: 0,
      failCount: 0,
      currentLabel: targets[0]?.nameAr || targets[0]?.nameEn || '',
    });

    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;
    let stoppedByQuota = false;

    const BATCH_SIZE = 12;
    const { updateChemicalsBulk } = await import('../lib/api/chemicals');

    const buildPatch = (c: Chemical, info: ChemicalIntelligence): Partial<Chemical> => {
      const overwrite = options.overwriteExisting;
      let nextExpiry = c.expiryDate || '';
      if (info.expiryYears > 0 && (overwrite || !c.expiryDate?.trim())) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + info.expiryYears);
        nextExpiry = d.toISOString().split('T')[0];
      }

      const pickStr = (existingVal: string | undefined, aiVal: string | undefined) => {
        const cleanAi = (aiVal || '').trim();
        const cleanExisting = (existingVal || '').trim();
        if (overwrite) return cleanAi || cleanExisting;
        return cleanExisting || cleanAi;
      };

      const nextGhs =
        overwrite || !Array.isArray(c.ghs) || c.ghs.length === 0
          ? Array.isArray(info.ghs) && info.ghs.length > 0
            ? info.ghs
            : c.ghs || []
          : c.ghs;

      const nextHazard =
        overwrite || !c.hazardClass
          ? info.hazardClass || c.hazardClass || 'safe'
          : c.hazardClass === 'safe' && info.hazardClass === 'danger'
          ? 'danger'
          : c.hazardClass;

      return {
        nameEn: pickStr(c.nameEn, info.nameEn),
        nameAr: pickStr(c.nameAr, info.nameAr),
        formula: pickStr(c.formula, info.formula),
        casNumber: pickStr(c.casNumber, info.casNumber),
        storageTemp: pickStr(c.storageTemp, info.storageTemp),
        hazardClass: nextHazard,
        ghs: nextGhs,
        expiryDate: nextExpiry,
        notes: pickStr(c.notes, info.notes),
      };
    };

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      if (cancelBulkRef.current) break;

      const chunk = targets.slice(i, i + BATCH_SIZE);
      const firstLabel = chunk[0]?.nameAr || chunk[0]?.nameEn || '';
      setBulkProgress({
        current: processedCount,
        total: targets.length,
        successCount,
        failCount,
        currentLabel: `${firstLabel}${chunk.length > 1 ? ` (+${chunk.length - 1})` : ''}`,
      });

      const batchPayload = chunk.map(c => ({
        id: c.id,
        name: (c.nameEn && c.nameAr && c.nameEn !== c.nameAr ? `${c.nameEn} (${c.nameAr})` : c.nameEn || c.nameAr).trim(),
      }));

      let infoMap = new Map<string, ChemicalBatchIntelligenceItem>();

      try {
        const batchResults = await getChemicalsBatchIntelligence(batchPayload);
        if (Array.isArray(batchResults)) {
          batchResults.forEach(item => {
            if (item?.id) infoMap.set(item.id, item);
          });
        }
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota') || errorMessage.includes('429')) {
          stoppedByQuota = true;
          failCount += targets.length - processedCount;
          showToast(
            'error',
            'تم إيقاف التحديث الذكي مؤقتاً بسبب بلوغ حد الطلبات المسموح به (Gemini Quota). يمكنك المتابعة بعد قليل.'
          );
          break;
        }
      }

      // Single-item fallback only for any chemical missed by the batch JSON response
      const missingInBatch = chunk.filter(c => !infoMap.has(c.id));
      if (missingInBatch.length > 0 && !cancelBulkRef.current) {
        for (const missed of missingInBatch) {
          if (cancelBulkRef.current) break;
          try {
            const single = await getChemicalIntelligence((missed.nameEn || missed.nameAr).trim(), 2, 1500);
            if (single) {
              infoMap.set(missed.id, { ...single, id: missed.id });
            }
          } catch {
            // Counted below as failed
          }
        }
      }

      const updatesToPersist: { id: string; data: Partial<Chemical> }[] = [];
      for (const c of chunk) {
        const info = infoMap.get(c.id);
        if (info) {
          updatesToPersist.push({ id: c.id, data: buildPatch(c, info) });
          successCount++;
        } else {
          failCount++;
        }
        processedCount++;
      }

      if (updatesToPersist.length > 0) {
        try {
          await updateChemicalsBulk(updatesToPersist);
          const patchMap = new Map(updatesToPersist.map(u => [u.id, u.data]));
          setChemicals(prev =>
            prev.map(item => {
              const p = patchMap.get(item.id);
              return p ? { ...item, ...p } : item;
            })
          );
          setSelectedChemical(prev => {
            if (!prev) return prev;
            const p = patchMap.get(prev.id);
            return p ? { ...prev, ...p } : prev;
          });
        } catch (persistErr) {
          console.error('Error persisting bulk chemical batch:', persistErr);
        }
      }

      setBulkProgress({
        current: processedCount,
        total: targets.length,
        successCount,
        failCount,
        currentLabel: firstLabel,
      });

      if (i + BATCH_SIZE < targets.length && !cancelBulkRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    try {
      await invalidate();
      if (successCount > 0) {
        await logActivity(
          schoolId,
          LogAction.UPDATE,
          LogModule.CHEMICALS,
          `تحديث ذكي جماعي لـ ${successCount} مادة كيميائية`
        );
      }
    } catch {
      // Non-blocking
    }

    setIsBulkUpdating(false);

    if (!stoppedByQuota) {
      if (cancelBulkRef.current) {
        showToast('info', `تم إيقاف التحديث الذكي. حُدّثت ${successCount} مادة بنجاح.`);
      } else if (failCount === 0) {
        showToast('success', `اكتمل التحديث الذكي بنجاح لـ ${successCount} مادة!`);
      } else {
        showToast('info', `اكتمل التحديث: ${successCount} مادة بنجاح، وتعذر تحديث ${failCount} مادة.`);
      }
    }
  };

  const handleDeleteChemical = async (id: string, name: string) => {
    try {
      const { deleteChemical } = await import('../lib/api/chemicals');
      await deleteChemical(id);
      setChemicals(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      if (selectedChemical?.id === id) {
        setSelectedChemical(chemicals.find(c => c.id !== id) || null);
      }
      await invalidate();
      try {
        await logActivity(schoolId, LogAction.DELETE, LogModule.CHEMICALS, `حذف المادة: ${name}`, id);
      } catch {
        // Non-blocking activity log
      }
      showToast('success', `تم حذف "${name || 'المادة'}" من المخزن الكيميائي.`);
    } catch (error) {
      console.error('Error deleting chemical:', error);
      showToast('error', 'تعذر حذف المادة. حاول مرة أخرى.');
    }
  };

  const handlePrintList = () => {
    const hazardousCount = sortedChemicals.filter(c => (c.ghs && c.ghs.length > 0) || c.hazardClass === 'danger').length;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const tableRows = sortedChemicals.map((c, index) => {
      const isHazardous = (c.ghs && c.ghs.length > 0) || c.hazardClass === 'danger';
      const ghsPictograms = (c.ghs || []).map(code => {
        const icon = getGhsIcon(code);
        return icon
          ? `<div class="ghs-pic"><img src="${icon}" alt="${code}" /></div>`
          : `<div class="ghs-pic"><span style="font-size:8px;font-weight:800;">${code}</span></div>`;
      }).join('');

      return `
        <tr class="${isHazardous ? 'hazardous-row' : ''}">
          <td class="text-center">${index + 1}</td>
          <td class="font-bold text-lg">${c.nameAr}</td>
          <td class="text-sm en-font">${c.nameEn}</td>
          <td class="mono-font">${c.formula || '—'}</td>
          <td class="text-center">${c.unit}</td>
          <td class="text-center font-bold">${c.quantity}</td>
          <td class="text-center">${c.state === 'solid' ? 'صلب' : c.state === 'liquid' ? 'سائل' : 'غاز'}</td>
          <td class="text-center">${c.shelf || '—'}</td>
          <td><div class="ghs-container">${ghsPictograms}</div></td>
          <td class="notes-cell">${c.notes || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>سجل المواد الكيميائية — ${schoolName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #006494;
              --on-primary: #ffffff;
              --primary-container: #cbe6ff;
              --secondary: #50606e;
              --surface: #fdfcff;
              --surface-variant: #dee3eb;
              --outline: #71787e;
              --error: #ba1a1a;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl; 
              background: #f8f9fb; 
              color: #1a1c1e;
              padding: 20px;
            }

            #toolbar {
              position: fixed; top: 0; left: 0; right: 0; 
              z-index: 100; background: #1a1c1e; color: white;
              padding: 12px 24px; display: flex; align-items: center; gap: 15px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            #toolbar h3 { flex: 1; font-weight: 800; font-size: 16px; }
            .tb-btn { 
              padding: 10px 20px; border: none; border-radius: 20px; 
              cursor: pointer; font-weight: 700; font-size: 13px; font-family: Cairo;
              transition: all 0.2s;
            }
            .tb-print { background: #00b894; color: white; }
            .tb-close { background: #e74c3c; color: white; }

            .page-sheet {
              background: white;
              width: 297mm;
              min-height: 210mm;
              margin: 60px auto 20px;
              padding: 15mm;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
            }

            /* --- Header Layout --- */
            .official-header {
              display: grid;
              grid-template-columns: 1fr 2fr 1fr;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid var(--primary);
              align-items: start;
            }
            .oh-right { text-align: right; line-height: 1.6; font-size: 10pt; }
            .oh-center { text-align: center; line-height: 1.5; font-size: 11pt; font-weight: 800; }
            .oh-left { text-align: left; line-height: 1.6; font-size: 10pt; }
            .oh-center img { height: 50px; margin-bottom: 5px; }

            .main-title {
              text-align: center;
              font-size: 22pt;
              font-weight: 900;
              color: var(--primary);
              margin: 10px 0;
              letter-spacing: -0.5px;
              text-shadow: 1px 1px 0 rgba(0,0,0,0.05);
            }

            .registry-meta {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-bottom: 20px;
              padding: 10px;
              background: var(--primary-container);
              border-radius: 12px;
              font-weight: 700;
              color: var(--on-primary-container);
            }

            /* --- Table Design --- */
            .registry-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              font-size: 10pt;
              margin-bottom: 20px;
            }
            .registry-table th {
              background: #f0f4f8;
              color: var(--secondary);
              font-weight: 800;
              padding: 12px 8px;
              border: 1px solid #d1d5db;
              text-align: center;
              font-size: 9pt;
            }
            .registry-table td {
              padding: 10px 8px;
              border: 1px solid #e5e7eb;
              line-height: 1.4;
            }
            .registry-table tr:nth-child(even) { background: #fafbfc; }
            .hazardous-row { background-color: #fff1f2 !important; }
            .hazardous-row td:first-child { border-right: 4px solid var(--error); }

            .text-center { text-align: center; }
            .font-bold { font-weight: 800; }
            .mono-font { font-family: 'JetBrains Mono', monospace; font-size: 9pt; }
            .en-font { font-family: sans-serif; color: var(--secondary); }
            .notes-cell { font-size: 9pt; color: #444; font-style: italic; }

            .ghs-container { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
            .ghs-pic { 
              width: 32px; height: 32px; border: 1px solid #ddd; 
              border-radius: 4px; background: white; padding: 2px;
              display: flex; align-items: center; justify-content: center;
            }
            .ghs-pic img { width: 100%; height: 100%; object-fit: contain; }

            /* --- Footer --- */
            .registry-footer {
              margin-top: auto;
              padding-top: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }
            .sign-box {
              text-align: center;
              border: 1px solid #eee;
              padding: 15px;
              border-radius: 12px;
              background: #fafafa;
            }
            .sign-box h4 { margin-bottom: 50px; font-weight: 800; text-decoration: underline; color: var(--secondary); }
            
            .inst-stamp {
              width: 40mm;
              height: 25mm;
              border: 2px dashed #ccc;
              border-radius: 12px;
              margin: 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8pt;
              color: #999;
            }

            @media print {
              #toolbar { display: none !important; }
              body { background: white !important; padding: 0 !important; }
              .page-sheet { 
                margin: 0 !important; box-shadow: none !important; 
                width: 100% !important; padding: 10mm !important;
                border-radius: 0 !important;
              }
              @page { size: A4 landscape; margin: 0; }
              .registry-table th { background: #eee !important; -webkit-print-color-adjust: exact; }
              .hazardous-row { background-color: #fff1f1 !important; -webkit-print-color-adjust: exact; }
              .registry-meta { background: #eee !important; color: black !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div id="toolbar">
              <h3>📄 جرد المواد الكيميائية — سجل المخبر</h3>
              <button class="tb-btn tb-print" onclick="window.print()">🖨️ طباعة السجل</button>
              <button class="tb-btn tb-close" onclick="window.close()">✕ إغلاق</button>
          </div>

          <div class="page-sheet">
            <header class="official-header">
              <div class="oh-right">
                <div>وزارة التربية الوطنية</div>
                <div>مديرية التربية لولاية: ${stateName}</div>
                <div>${formatSchoolWithCommune(schoolName, commune)}</div>
              </div>
              <div class="oh-center">
                <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <div class="main-title">سجل جرد المواد الكيميائية للمخبر</div>
              </div>
              <div class="oh-left">
                <div>السنة الدراسية: ${academicYear}</div>
                <div>تاريخ الطباعة: ${formattedDate}</div>
                <div class="inst-stamp">ختم المؤسسة</div>
              </div>
            </header>

            <div class="registry-meta">
              <span>إجمالي المواد: ${sortedChemicals.length}</span>
              <span style="border-right: 2px solid rgba(0,0,0,0.1); padding-right: 20px;">المواد الخطرة: ${hazardousCount}</span>
            </div>

            <table class="registry-table">
              <thead>
                <tr>
                  <th width="40">رقم</th>
                  <th>الاسم العربي للمادة</th>
                  <th>Désignation (En)</th>
                  <th width="120">الصيغة</th>
                  <th width="60">الوحدة</th>
                  <th width="60">الكمية</th>
                  <th width="70">الحالة</th>
                  <th width="60">الرف</th>
                  <th width="100">GHS Pictograms</th>
                  <th>ملاحظات إضافية</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <footer class="registry-footer">
              <div class="sign-box"><h4>المخبري الرئيسي</h4></div>
              <div class="sign-box"><h4>المقتصد</h4></div>
              <div class="sign-box"><h4>مدير المؤسسة</h4></div>
              <div class="sign-box"><h4>مفتش التربية الوطنية</h4></div>
            </footer>
          </div>
        </body>
      </html>
    `;
    openPrintPreview({
      title: `سجل المواد الكيميائية — ${schoolName}`,
      subtitle: `مديرية التربية: ${stateName || '—'} · السنة الدراسية: ${academicYear}`,
      type: 'custom',
      customHtml: html,
      headers: ['#', 'الاسم العربي', 'Désignation (En)', 'الصيغة', 'الوحدة', 'الكمية', 'الحالة', 'الرف'],
      rows: sortedChemicals.map((c, index) => [
        index + 1,
        c.nameAr,
        c.nameEn,
        c.formula || '—',
        c.unit,
        c.quantity,
        c.state === 'solid' ? 'صلب' : c.state === 'liquid' ? 'سائل' : 'غاز',
        c.shelf || '—'
      ]),
      summaryCards: [
        { label: 'إجمالي المواد', value: sortedChemicals.length },
        { label: 'المواد الخطرة', value: hazardousCount }
      ],
      suggestedOrientation: 'landscape'
    });
  };


  const handleExportPDF = async () => {
    const headers = ['#', 'الاسم العلمي', 'الاسم العربي', 'الصيغة', 'الكمية', 'الرف', 'تاريخ الصلاحية'];
    const tableData = filteredChemicals.map((c, index) => [
      index + 1,
      c.nameEn || '',
      c.nameAr || '',
      c.formula || '',
      `${c.quantity} ${c.unit}`,
      c.shelf || '',
      formatDisplayDate(c.expiryDate)
    ]);

    await PDFService.generateTablePDF(
      'تقرير جرد المواد الكيميائية المخبرية',
      headers,
      tableData,
      `chemicals_inventory_${new Date().toISOString().split('T')[0]}.pdf`,
      {
        subtitle: `سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${filteredChemicals.length}`,
        schoolInfo: {
          school: schoolName,
          commune: commune,
          directorate: stateName,
          laboratory: 'مخبر الكيمياء والعلوم الفيزيائية'
        },
        summaryCards: [
          { label: 'إجمالي المواد الكيميائية', value: filteredChemicals.length },
          { label: 'المواد السائلة', value: filteredChemicals.filter(c => c.state === 'liquid').length },
          { label: 'المواد الصلبة', value: filteredChemicals.filter(c => c.state === 'solid').length },
          { label: 'تاريخ إعداد التقرير', value: new Date().toLocaleDateString('ar-DZ') }
        ]
      }
    );
  };

  const handleExportWord = () => {
    const headers = ['#', 'الاسم العلمي', 'الاسم العربي', 'الصيغة', 'الكمية', 'الرف', 'تاريخ الصلاحية'];
    const tableData = filteredChemicals.map((c, index) => [
      index + 1,
      c.nameEn || '',
      c.nameAr || '',
      c.formula || '',
      `${c.quantity} ${c.unit}`,
      c.shelf || '',
      formatDisplayDate(c.expiryDate)
    ]);

    PDFService.downloadTableWord(
      'تقرير جرد المواد الكيميائية المخبرية',
      headers,
      tableData,
      `chemicals_inventory_${new Date().toISOString().split('T')[0]}.doc`,
      {
        subtitle: `سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${filteredChemicals.length}`,
        schoolInfo: {
          school: schoolName,
          commune: commune,
          directorate: stateName,
          laboratory: 'مخبر الكيمياء والعلوم الفيزيائية'
        },
        summaryCards: [
          { label: 'إجمالي المواد الكيميائية', value: filteredChemicals.length },
          { label: 'المواد السائلة', value: filteredChemicals.filter(c => c.state === 'liquid').length },
          { label: 'المواد الصلبة', value: filteredChemicals.filter(c => c.state === 'solid').length },
          { label: 'تاريخ إعداد التقرير', value: new Date().toLocaleDateString('ar-DZ') }
        ]
      }
    );
  };

  const handleExportXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredChemicals.map(c => ({
      'الاسم (EN)': c.nameEn,
      'الاسم (AR)': c.nameAr,
      'الصيغة': c.formula,
      'رقم CAS': c.casNumber,
      'الكمية': c.quantity,
      'الوحدة': c.unit,
      'الحالة': c.state,
      'الخطورة': c.hazardClass,
      'الرف': c.shelf,
      'تاريخ الصلاحية': c.expiryDate,
      'ملاحظات': c.notes
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `chemical_inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportXLS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formatDate = (val: any) => {
          if (!val) return '';
          if (val instanceof Date) {
            return val.toISOString().split('T')[0];
          }
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
          }
          return String(val).trim();
        };

        const getVal = (item: any, keys: string[]) => {
          const itemKeys = Object.keys(item);
          for (const key of keys) {
            const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (foundKey) return item[foundKey];
          }
          return undefined;
        };

        const itemsToCreate = data.map(item => ({
          nameAr: String(getVal(item, ['الاسم بالعربية', 'nameAr', 'arabic name', 'الاسم', 'اسم المادة']) || 'مادة كيميائية').trim(),
          nameEn: String(getVal(item, ['الاسم بالإنجليزية', 'nameEn', 'english name', 'name']) || '').trim(),
          formula: String(getVal(item, ['الصيغة الكيميائية', 'formula', 'الصيغة']) || '').trim(),
          casNumber: String(getVal(item, ['رقم CAS', 'cas', 'casNumber', 'cas_number']) || '').trim(),
          unit: String(getVal(item, ['الوحدة', 'unit']) || 'g').trim(),
          quantity: Number(getVal(item, ['الكمية', 'quantity']) || 0),
          storageTemp: String(getVal(item, ['درجة حرارة التخزين', 'storageTemp', 'درجة التخزين']) || '').trim(),
          state: String(getVal(item, ['الحالة الفيزيائية', 'state', 'الحالة']) || 'solid').trim(),
          hazardClass: String(getVal(item, ['فئة الخطورة', 'hazardClass', 'الخطورة']) || 'safe').trim(),
          shelf: String(getVal(item, ['الرف', 'shelf', 'مكان التخزين']) || '').trim(),
          expiryDate: formatDate(getVal(item, ['تاريخ انتهاء الصلاحية', 'expiryDate', 'تاريخ الانتهاء'])),
          notes: String(getVal(item, ['ملاحظات', 'notes']) || '').trim(),
        }));
        const { createChemicalsBulk } = await import('../lib/api/chemicals');
        await createChemicalsBulk(itemsToCreate);
        await invalidate();
        showToast('success', `تم استيراد ${itemsToCreate.length} مادة بنجاح!`);
      } catch (error) {
        console.error('Error importing XLS:', error);
        showToast('error', 'حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrintInventoryCards = async (items: Chemical[]) => {
    const { buildChemicalStockCardsHtml, isGenericRolePlaceholder } = await import(
      '../services/chemicalStockCardPrintService'
    );

    let settingsJobTitle: string | undefined;
    let settingsCycle: string | undefined;
    let settingsSchoolName: string | undefined;
    let userDocGrade: string | undefined;
    let userDocLevel: string | undefined;

    if (auth.currentUser) {
      const [settingsRes, userRes] = await Promise.allSettled([
        getDoc(doc(db, 'settings', auth.currentUser.uid)),
        getDoc(doc(db, 'users', auth.currentUser.uid)),
      ]);
      if (settingsRes.status === 'fulfilled' && settingsRes.value.exists()) {
        const sData = settingsRes.value.data();
        settingsJobTitle = sData?.jobTitle;
        settingsCycle = sData?.cycle || sData?.educationLevel;
        settingsSchoolName = sData?.schoolName || sData?.school;
      }
      if (userRes.status === 'fulfilled' && userRes.value.exists()) {
        const uData = userRes.value.data();
        userDocGrade = uData?.grade;
        userDocLevel = uData?.educationLevel || uData?.cycle;
      }
    }

    const lsJobTitle = typeof window !== 'undefined' ? localStorage.getItem('algeria_lab_job_title') : null;
    const lsStatutory = typeof window !== 'undefined' ? localStorage.getItem('algeria_lab_statutory_grade') : null;
    const lsGradeName = typeof window !== 'undefined' ? localStorage.getItem('algeria_lab_grade_name') : null;
    const lsCycle = typeof window !== 'undefined' ? localStorage.getItem('algeria_lab_education_level') : null;

    const rankCandidates = [
      settingsJobTitle,
      userDocGrade,
      userProfile?.grade,
      lsJobTitle,
      lsStatutory,
      lsGradeName,
      jobTitle,
    ];
    const resolvedRank = rankCandidates.find((r) => !isGenericRolePlaceholder(r)) || '';

    if (resolvedRank && typeof window !== 'undefined') {
      localStorage.setItem('algeria_lab_job_title', resolvedRank);
    }

    const resolvedEducationLevel =
      settingsCycle ||
      userDocLevel ||
      userProfile?.educationLevel ||
      lsCycle ||
      educationLevel;

    const html = buildChemicalStockCardsHtml(items, {
      schoolName: settingsSchoolName || schoolName,
      directorate: stateName,
      commune,
      academicYear,
      officerRank: resolvedRank,
      officerRankCandidates: rankCandidates,
      educationLevel: resolvedEducationLevel,
    });
    openPrintPreview({
      title: `بطاقات مخزون المواد الكيميائية (${items.length} مادة)`,
      type: 'custom',
      customHtml: html,
      suggestedPaperSize: 'a5',
      suggestedOrientation: 'portrait'
    });
  };

  const handlePrint = (c: Chemical) => {
    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة مادة - ${c.nameEn}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #2b3d22; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #2b3d22; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .label { font-weight: bold; color: #5c6146; }
            .hazard { color: #e11d48; font-weight: bold; }
            .footer { margin-top: 50px; text-align: left; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">بطاقة تعريف مادة كيميائية</div>
            <div>نظام تسيير المخابر المدرسية</div>
          </div>
          <div class="details">
            <div class="item"><span class="label">PRODUIT CHIMIQUE:</span> ${c.nameEn}</div>
            <div class="item"><span class="label">الاسم العربي:</span> ${c.nameAr}</div>
            <div class="item"><span class="label">الصيغة الكيميائية:</span> ${c.formula}</div>
            <div class="item"><span class="label">رقم CAS:</span> ${c.casNumber || 'غير متوفر'}</div>
            <div class="item"><span class="label">درجة التخزين:</span> ${c.storageTemp || 'غير متوفر'}</div>
            <div class="item"><span class="label">الحالة:</span> ${c.state}</div>
            <div class="item"><span class="label">الكمية الحالية:</span> ${c.quantity} ${c.unit}</div>
            <div class="item"><span class="label">الرف:</span> ${c.shelf}</div>
            <div class="item"><span class="label">الصلاحية:</span> ${c.expiryDate || 'غير محدد'}</div>
            <div class="item" style="grid-column: span 2;">
              <span class="label">رموز السلامة GHS:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${(c.ghs || []).map(code => {
                  const icon = getGhsIcon(code);
                  const label = getGhsLabel(code);
                  return `
                  <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #ccc; padding: 5px; border-radius: 8px; width: 70px; background: #fff;">
                    ${icon ? `<img src="${icon}" alt="${label}" style="width: 40px; height: 40px;" />` : `<span style="font-size:10px;font-weight:800;">${code}</span>`}
                    <span style="font-size: 9px; margin-top: 4px; text-align: center; font-weight: bold;">${label}</span>
                  </div>
                `;
                }).join('')}
              </div>
            </div>
            <div class="item"><span class="label">تصنيف الخطورة:</span> <span class="${c.hazardClass === 'danger' ? 'hazard' : ''}">${c.hazardClass === 'danger' ? 'خطر' : 'آمن'}</span></div>
            <div class="item" style="grid-column: span 2;"><span class="label">ملاحظات:</span> ${c.notes || 'لا توجد'}</div>
          </div>
          <div class="footer">طبع بتاريخ: ${new Date().toLocaleString('ar-DZ')}</div>
        </body>
      </html>
    `;
    openPrintPreview({
      title: `بطاقة تعريف مادة — ${c.nameAr || c.nameEn}`,
      type: 'custom',
      customHtml: html,
      suggestedOrientation: 'portrait'
    });
  };

  const handleSort = (key: keyof Chemical) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredChemicals.map(c => c.id);
    const filteredIdSet = new Set(filteredIds);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = selectedIds.filter(id => chemicals.some(c => c.id === id));
    if (idsToDelete.length === 0) {
      setIsBulkDeleteConfirmOpen(false);
      return;
    }

    setIsDeletingBulk(true);
    try {
      const { deleteChemicalsBulk } = await import('../lib/api/chemicals');
      await deleteChemicalsBulk(idsToDelete);
      const deletedSet = new Set(idsToDelete);
      const remaining = chemicals.filter(c => !deletedSet.has(c.id));
      setChemicals(remaining);
      setSelectedIds([]);
      if (selectedChemical && deletedSet.has(selectedChemical.id)) {
        setSelectedChemical(remaining[0] || null);
      }
      await invalidate();
      try {
        await logActivity(schoolId, LogAction.DELETE, LogModule.CHEMICALS, `حذف جماعي لـ ${idsToDelete.length} مادة`);
      } catch {
        // Non-blocking activity log
      }
      showToast('success', `تم حذف ${idsToDelete.length} مادة من المخزن الكيميائي بنجاح.`);
    } catch (error) {
      console.error('Error bulk deleting chemicals:', error);
      showToast('error', 'تعذر حذف المواد المحددة. حاول مرة أخرى.');
    } finally {
      setIsDeletingBulk(false);
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const handleQuickAdjustQuantity = async (
    chemical: Chemical,
    delta: number,
    reason?: string
  ) => {
    const nextQty = Math.max(0, Math.round((Number(chemical.quantity) + delta) * 1000) / 1000);
    if (nextQty === chemical.quantity) return;
    try {
      const { updateChemical } = await import('../lib/api/chemicals');
      await updateChemical(chemical.id, { quantity: nextQty });
      setChemicals(prev => prev.map(item => (item.id === chemical.id ? { ...item, quantity: nextQty } : item)));
      setSelectedChemical(prev => (prev?.id === chemical.id ? { ...prev, quantity: nextQty } : prev));
      await invalidate();
      try {
        const actionDesc = delta < 0
          ? `استهلاك ${Math.abs(delta)} ${chemical.unit} من ${chemical.nameAr || chemical.nameEn}${reason ? ` (${reason})` : ''}`
          : `توريد ${delta} ${chemical.unit} إلى ${chemical.nameAr || chemical.nameEn}${reason ? ` (${reason})` : ''}`;
        await logActivity(schoolId, LogAction.UPDATE, LogModule.CHEMICALS, actionDesc, chemical.id);
      } catch {
        // Non-blocking
      }
      showToast(
        'success',
        `تم تحديث كمية "${chemical.nameAr || chemical.nameEn}" إلى ${nextQty} ${chemical.unit}.`
      );
    } catch (error) {
      console.error('Error adjusting chemical quantity:', error);
      showToast('error', 'تعذر تحديث الكمية. حاول مرة أخرى.');
    }
  };

  const handleBulkAssignShelf = async (shelfName: string) => {
    const trimmed = shelfName.trim();
    const targetIds = selectedIds.filter(id => chemicals.some(c => c.id === id));
    if (!trimmed || targetIds.length === 0) return;

    try {
      const { updateChemicalsBulk } = await import('../lib/api/chemicals');
      await updateChemicalsBulk(targetIds.map(id => ({ id, data: { shelf: trimmed } })));
      const idSet = new Set(targetIds);
      setChemicals(prev => prev.map(c => (idSet.has(c.id) ? { ...c, shelf: trimmed } : c)));
      setSelectedChemical(prev => (prev && idSet.has(prev.id) ? { ...prev, shelf: trimmed } : prev));
      await invalidate();
      try {
        await logActivity(
          schoolId,
          LogAction.UPDATE,
          LogModule.CHEMICALS,
          `نقل جماعي لـ ${targetIds.length} مادة إلى الرف ${trimmed}`
        );
      } catch {
        // Non-blocking
      }
      showToast('success', `تم تعيين الرف "${trimmed}" لـ ${targetIds.length} مادة بنجاح.`);
    } catch (error) {
      console.error('Error assigning shelf in bulk:', error);
      showToast('error', 'تعذر تحديث الرف للمواد المحددة.');
    }
  };

  const handleSmartTextImport = async (items: Partial<Chemical>[]) => {
    if (!items || items.length === 0) return;
    try {
      const { createChemicalsBulk } = await import('../lib/api/chemicals');
      await createChemicalsBulk(items);
      await invalidate();
      try {
        await logActivity(
          schoolId,
          LogAction.CREATE,
          LogModule.CHEMICALS,
          `استيراد نصي ذكي لـ ${items.length} مادة كيميائية`
        );
      } catch {
        // Non-blocking
      }
      showToast('success', `تمت إضافة ${items.length} مادة إلى المخزن الكيميائي بنجاح.`);
    } catch (error) {
      console.error('Smart text import error:', error);
      showToast('error', 'تعذر حفظ المواد المستوردة.');
      throw error;
    }
  };

  const handleFetchSafetyGuide = async (chemical: Chemical, force = false) => {
    if (!chemical) return;
    if (!force && safetyGuidesCache[chemical.id]) return;

    setLoadingSafetyGuideId(chemical.id);
    try {
      const guide = await getChemicalSafetyGuide({
        nameEn: chemical.nameEn,
        nameAr: chemical.nameAr,
        formula: chemical.formula,
        casNumber: chemical.casNumber,
      });
      if (guide) {
        setSafetyGuidesCache(prev => ({ ...prev, [chemical.id]: guide }));
      } else {
        showToast('error', 'تعذر إنشاء بطاقة السلامة الذكية حالياً.');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء الاتصال بالمساعد الذكي للسلامة.');
    } finally {
      setLoadingSafetyGuideId(null);
    }
  };

  const isExpiringOrExpired = (c: Chemical) => {
    if (!c.expiryDate) return false;
    const expiry = new Date(c.expiryDate);
    if (Number.isNaN(expiry.getTime())) return false;
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  const duplicateIds = useMemo(() => findDuplicateChemicalIds(chemicals), [chemicals]);

  const uniqueShelves = useMemo(() => {
    const set = new Set<string>();
    chemicals.forEach(c => {
      const s = (c.shelf || '').trim();
      if (s && s !== '—') set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [chemicals]);

  const dangerCount = useMemo(
    () => chemicals.filter(c => (c.ghs && c.ghs.length > 0) || c.hazardClass === 'danger').length,
    [chemicals]
  );

  const expiringOrExpiredCount = useMemo(
    () => chemicals.filter(isExpiringOrExpired).length,
    [chemicals]
  );

  const lowStockCount = useMemo(
    () => chemicals.filter(c => c.quantity < 10).length,
    [chemicals]
  );

  const filteredChemicals = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return chemicals.filter(c => {
      const matchesSearch =
        !q ||
        c.nameEn?.toLowerCase().includes(q) ||
        c.nameAr?.toLowerCase().includes(q) ||
        c.formula?.toLowerCase().includes(q) ||
        c.casNumber?.toLowerCase().includes(q) ||
        c.shelf?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'low' && c.quantity < 10) ||
        (statusFilter === 'danger' && ((c.ghs && c.ghs.length > 0) || c.hazardClass === 'danger')) ||
        (statusFilter === 'expiring' && isExpiringOrExpired(c)) ||
        (statusFilter === 'incomplete' && isChemicalMissingInfo(c)) ||
        (statusFilter === 'duplicates' && duplicateIds.has(c.id));

      const matchesState = stateFilter === 'all' || c.state === stateFilter;
      const matchesShelf = shelfFilter === 'all' || (c.shelf || '').trim() === shelfFilter;

      return matchesSearch && matchesStatus && matchesState && matchesShelf;
    });
  }, [chemicals, searchTerm, statusFilter, stateFilter, shelfFilter, duplicateIds]);

  const sortedChemicals = useMemo(() => {
    const sortableItems = [...filteredChemicals];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredChemicals, sortConfig]);

  const getSortIcon = (key: keyof Chemical) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />;
    }
    return <div className="w-[14px] mr-1" />;
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: sortedChemicals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });


  return {
    searchParams,
    chemicals,
    setChemicals,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    stateFilter,
    setStateFilter,
    shelfFilter,
    setShelfFilter,
    uniqueShelves,
    filterLowStock,
    setFilterLowStock,
    selectedChemical,
    setSelectedChemical,
    isAddModalOpen,
    setIsAddModalOpen,
    editingChemical,
    setEditingChemical,
    fileInputRef,
    isImporting,
    setIsImporting,
    isGenerating,
    setIsGenerating,
    isBulkUpdating,
    setIsBulkUpdating,
    isBulkConfirmOpen,
    setIsBulkConfirmOpen,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    isDeletingBulk,
    isLabCalcOpen,
    setIsLabCalcOpen,
    isSmartImportOpen,
    setIsSmartImportOpen,
    isSafetyAuditOpen,
    setIsSafetyAuditOpen,
    safetyGuidesCache,
    loadingSafetyGuideId,
    handleFetchSafetyGuide,
    handleQuickAdjustQuantity,
    handleBulkAssignShelf,
    handleSmartTextImport,
    toast,
    setToast,
    bulkProgress,
    setBulkProgress,
    selectedIds,
    setSelectedIds,
    suggestedUpdate,
    setSuggestedUpdate,
    isReviewModalOpen,
    setIsReviewModalOpen,
    sortConfig,
    setSortConfig,
    isQRScannerOpen,
    setIsQRScannerOpen,
    formatDisplayDate,
    newChemical,
    setNewChemical,
    handleAddChemical,
    handleSmartFill,
    handleRequestSmartUpdate,
    handleApproveUpdate,
    handleBulkSmartUpdate,
    cancelBulkUpdate,
    missingChemicalsCount,
    dangerCount,
    expiringOrExpiredCount,
    duplicateIds,
    handleDeleteChemical,
    handlePrintList,
    handleExportPDF,
    handleExportWord,
    handleExportXLS,
    handleImportXLS,
    handlePrintInventoryCards,
    handlePrint,
    handleSort,
    handleToggleSelect,
    handleSelectAll,
    handleBulkDelete,
    filteredChemicals,
    sortedChemicals,
    getSortIcon,
    lowStockCount,
    parentRef,
    rowVirtualizer,
    chemicalsList,
    chemicalsLoading,
    error,
    schoolId,
    schoolName,
    stateName
  };
}
