import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSchool } from '../context/SchoolContext';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { useSqlCollection } from './useSqlCollection';
import * as XLSX from 'xlsx';
import { Teacher } from '../types/teachers';
import { useVirtualizer } from '@tanstack/react-virtual';

export type DeleteConfirmTarget =
  | { mode: 'single'; teacher: Teacher }
  | { mode: 'bulk'; ids: string[] }
  | null;

const INITIAL_TEACHER_STATE: Partial<Teacher> = {
  functionalCode: '',
  firstName: '',
  lastName: '',
  name: '',
  birthDate: '',
  rank: '',
  subject: '',
  grade: '',
  effectiveDate: '',
  email: '',
  phone: '',
  levels: []
};

export function useTeachers() {
  const { schoolId, schoolName, academicYear, educationLevel } = useSchool();
  const { openPrintPreview } = usePrintSettings();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<DeleteConfirmTarget>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>(INITIAL_TEACHER_STATE);
  const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    functionalCode: '',
    name: '',
    rank: '',
    subject: '',
    birthDate: ''
  });
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Teacher | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Virtualization ref
  const parentRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setImportMessage({ text, type });
    toastTimerRef.current = setTimeout(() => setImportMessage(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilterColumn(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'غير محدد';
    if (!dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const { data: sqlTeachers, loading: sqlLoading } = useSqlCollection<Teacher>('teachers', '/api/db/teachers');

  useEffect(() => {
    if (sqlTeachers) {
      setTeachers(sqlTeachers);
      setLoading(sqlLoading);
    }
  }, [sqlTeachers, sqlLoading]);

  const openAddModal = useCallback(() => {
    setEditingTeacher(null);
    setNewTeacher({ ...INITIAL_TEACHER_STATE });
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      functionalCode: teacher.functionalCode || '',
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      name: teacher.name || '',
      birthDate: teacher.birthDate || '',
      rank: teacher.rank || '',
      subject: teacher.subject || '',
      grade: teacher.grade || '',
      effectiveDate: teacher.effectiveDate || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      levels: Array.isArray(teacher.levels) ? teacher.levels : []
    });
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingTeacher(null);
    setNewTeacher({ ...INITIAL_TEACHER_STATE });
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${newTeacher.firstName || ''} ${newTeacher.lastName || ''}`.trim() || newTeacher.name || '';
      const teacherData: Partial<Teacher> = {
        ...INITIAL_TEACHER_STATE,
        ...newTeacher,
        name: fullName,
        levels: Array.isArray(newTeacher.levels) ? newTeacher.levels : []
      };

      if (editingTeacher) {
        const { id } = editingTeacher;
        const { updateTeacher } = await import('../lib/api/teachers');
        const updated = await updateTeacher(id, teacherData as Teacher);
        setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...teacherData, ...updated, id } : t)));
        if (viewingTeacher?.id === id) {
          setViewingTeacher(prev => (prev ? { ...prev, ...teacherData, id } : null));
        }
        try {
          const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
          await logActivity(schoolId, LogAction.UPDATE, LogModule.TEACHERS, `تحديث بيانات الأستاذ: ${fullName}`, id);
        } catch {
          // Ignore logging failure
        }
        showToast(`تم تحديث بيانات "${fullName}" بنجاح`);
      } else {
        const { createTeacher } = await import('../lib/api/teachers');
        const created = await createTeacher(teacherData as Teacher);
        setTeachers(prev => [created, ...prev.filter(t => t.id !== created.id)]);
        try {
          const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
          await logActivity(schoolId, LogAction.CREATE, LogModule.TEACHERS, `تسجيل أستاذ جديد: ${fullName}`, created.id);
        } catch {
          // Ignore logging failure
        }
        showToast(`تم تسجيل الأستاذ "${fullName}" بنجاح`);
      }
      closeAddModal();
    } catch (error) {
      console.error('Failed to save teacher', error);
      showToast('حدث خطأ أثناء حفظ بيانات الأستاذ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteTeacher = useCallback((teacher: Teacher) => {
    setDeleteConfirmTarget({ mode: 'single', teacher });
  }, []);

  const requestBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmTarget({ mode: 'bulk', ids: [...selectedIds] });
  }, [selectedIds]);

  const confirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      if (deleteConfirmTarget.mode === 'single') {
        const target = deleteConfirmTarget.teacher;
        const { deleteTeacher } = await import('../lib/api/teachers');
        await deleteTeacher(target.id);
        setTeachers(prev => prev.filter(t => t.id !== target.id));
        setSelectedIds(prev => prev.filter(id => id !== target.id));
        if (viewingTeacher?.id === target.id) setViewingTeacher(null);
        try {
          const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
          await logActivity(schoolId, LogAction.DELETE, LogModule.TEACHERS, `حذف سجل الأستاذ: ${target.name}`, target.id);
        } catch {
          // Ignore logging failure
        }
        showToast(`تم حذف سجل "${target.name}" بنجاح`);
      } else {
        const idsToDelete = deleteConfirmTarget.ids;
        const idSet = new Set(idsToDelete);
        const { deleteTeachersBulk } = await import('../lib/api/teachers');
        await deleteTeachersBulk(idsToDelete);
        setTeachers(prev => prev.filter(t => !idSet.has(t.id)));
        setSelectedIds([]);
        if (viewingTeacher && idSet.has(viewingTeacher.id)) setViewingTeacher(null);
        try {
          const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
          await logActivity(schoolId, LogAction.DELETE, LogModule.TEACHERS, `حذف جماعي لـ ${idsToDelete.length} أستاذ`);
        } catch {
          // Ignore logging failure
        }
        showToast(`تم حذف ${idsToDelete.length} سجل بنجاح`);
      }
      setDeleteConfirmTarget(null);
    } catch (error) {
      console.error('Failed to delete teacher(s)', error);
      showToast('حدث خطأ أثناء عملية الحذف', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    const found = teachers.find(t => t.id === id);
    if (found) {
      requestDeleteTeacher(found);
    }
  };

  const handleCopyCode = useCallback(async (teacher: Teacher) => {
    const code = teacher.functionalCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(teacher.id);
      setTimeout(() => {
        setCopiedCodeId(prev => (prev === teacher.id ? null : prev));
      }, 1800);
    } catch {
      showToast('تعذر نسخ الرمز الوظيفي إلى الحافظة', 'error');
    }
  }, [showToast]);

  // Helper to normalize column header strings (supports Arabic, Farsi, French, and English variations)
  const normalizeHeaderKey = (key: string): string => {
    return String(key || '')
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\u06CC\u0649]/g, '\u064A') // Persian Yeh / Alef Maksura -> Arabic Yeh 'ي'
      .replace(/\u06A9/g, '\u0643') // Persian Kaf -> Arabic Kaf 'ك'
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // Alef variations -> bare alef 'ا'
      .replace(/\u0629/g, '\u0647') // Teh Marbuta -> Heh
      .replace(/[\u064B-\u065F\u0670]/g, '') // Strip tashkeel
      .toLowerCase();
  };

  const formatTextCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') return String(val).trim();
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(val).trim();
  };

  const formatDateCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return '';
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Parse Excel numeric date serial (e.g., 31000..60000) using UTC to prevent timezone day shifts
    if (typeof val === 'number' && val > 1000 && val < 90000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    const str = String(val).trim();
    if (!str || str === '-' || str === '---' || str === '/' || str === 'غير محدد') return '';

    // YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD (including inside combined strings)
    const ymd = str.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymd) {
      return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (including inside combined strings)
    const dmy = str.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (dmy) {
      let year = parseInt(dmy[3], 10);
      if (year < 100) year += year > 30 ? 1900 : 2000;
      return `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }

    return str;
  };

  type TeacherFieldKey =
    | 'functionalCode'
    | 'lastName'
    | 'firstName'
    | 'name'
    | 'birthDate'
    | 'rank'
    | 'grade'
    | 'effectiveDate'
    | 'subject'
    | 'email'
    | 'phone'
    | 'levels';

  const matchHeaderToField = (headerText: string): TeacherFieldKey | null => {
    const norm = normalizeHeaderKey(headerText);
    if (!norm) return null;

    // Ignore pure sequence/row-index columns and non-target biographical columns so they never steal real fields
    if (
      norm === 'الرقم' ||
      norm === 'رقم' ||
      norm === 'ر ت' ||
      norm === 'ر.ت' ||
      norm === 'ت' ||
      norm === 'م' ||
      norm === '#' ||
      norm === 'no' ||
      norm === 'n°' ||
      norm === 'num' ||
      norm === 'numero' ||
      norm === 'index' ||
      norm === 'الرقم التسلسلي' ||
      norm === 'رقم تسلسلي'
    ) {
      return null;
    }

    // Ignore birthplace without date ("مكان الازدياد" / "مكان الميلاد"), parents, spouse, children, remarks
    if (
      (norm.includes('مكان') && !norm.includes('تاريخ')) ||
      norm.includes('lieu de naissance') ||
      norm.includes('اسم الاب') ||
      norm.includes('اسم الام') ||
      norm.includes('لقب الزوج') ||
      norm.includes('اللقب الاصلي') ||
      norm.includes('اولاد') ||
      norm.includes('الحاله العائليه') ||
      norm.includes('ملاحظ')
    ) {
      return null;
    }

    // 1. Contact fields (check before functionalCode so "رقم الهاتف" does not match numeric/code patterns)
    if (
      norm.includes('بريد') ||
      norm.includes('ايميل') ||
      norm.includes('email') ||
      norm.includes('e-mail') ||
      norm.includes('mail') ||
      norm.includes('courriel')
    ) {
      return 'email';
    }

    if (
      norm.includes('هاتف') ||
      norm.includes('نقال') ||
      norm.includes('جوال') ||
      norm.includes('محمول') ||
      norm.includes('tel') ||
      norm.includes('phone') ||
      norm.includes('mobile') ||
      norm.includes('gsm')
    ) {
      return 'phone';
    }

    // 2. Dates (check before rank/grade so "تاريخ سريان الدرجة" does not match grade)
    if (
      norm.includes('ازدياد') ||
      norm.includes('ميلاد') ||
      norm.includes('ولاده') ||
      norm.includes('birth') ||
      norm.includes('naissance') ||
      norm === 'dob'
    ) {
      return 'birthDate';
    }

    if (
      norm.includes('سريان') ||
      norm.includes('مفعول') ||
      norm.includes('استحقاق') ||
      norm.includes('ترقيه') ||
      norm.includes('effective') ||
      norm.includes('effet') ||
      (norm.includes('تاريخ') && (norm.includes('درج') || norm.includes('تعيين') || norm.includes('تنصيب')))
    ) {
      return 'effectiveDate';
    }

    // 3. Subject / Specialty (check before firstName/name so "اسم المادة" matches subject)
    if (
      norm.includes('ماد') ||
      norm.includes('تخصص') ||
      norm.includes('اختصاص') ||
      norm.includes('شعب') ||
      norm.includes('subject') ||
      norm.includes('matiere') ||
      norm.includes('discipline') ||
      norm.includes('specialite')
    ) {
      return 'subject';
    }

    // 4. Teaching Levels / Cycles
    if (
      norm.includes('اطوار') ||
      norm.includes('طور') ||
      norm.includes('مستو') ||
      norm.includes('اقسام') ||
      norm.includes('levels') ||
      norm.includes('niveaux') ||
      norm.includes('cycles')
    ) {
      return 'levels';
    }

    // 5. Combined Full Name (check BEFORE separate lastName / firstName)
    if (
      (norm.includes('اسم') && norm.includes('لقب')) ||
      (norm.includes('nom') && norm.includes('prenom')) ||
      norm.includes('اسم كامل') ||
      norm.includes('الاسم الكامل') ||
      norm.includes('الاسم الثلاثي') ||
      norm.includes('اسم الاستاذ') ||
      norm.includes('اسم الموظف') ||
      norm.includes('الاستاذ') ||
      norm.includes('الموظف') ||
      norm.includes('المعني') ||
      norm.includes('full name') ||
      norm.includes('fullname') ||
      norm.includes('nom complet') ||
      norm === 'name' ||
      norm === 'teacher' ||
      norm === 'enseignant'
    ) {
      return 'name';
    }

    // 6. Last Name & First Name
    if (
      norm.includes('لقب') ||
      norm.includes('عائلي') ||
      norm.includes('lastname') ||
      norm.includes('last name') ||
      norm.includes('last_name') ||
      norm.includes('surname') ||
      norm.includes('family') ||
      norm === 'nom'
    ) {
      return 'lastName';
    }

    if (
      norm.includes('اسم') ||
      norm.includes('شخصي') ||
      norm.includes('firstname') ||
      norm.includes('first name') ||
      norm.includes('first_name') ||
      norm.includes('prenom') ||
      norm.includes('given')
    ) {
      return 'firstName';
    }

    // 7. Rank ("الرتبة") vs Grade/Echelon ("الدرجة")
    if (
      norm.includes('رتب') ||
      norm.includes('صفه') ||
      norm.includes('وظيفه') ||
      norm.includes('سلك') ||
      norm.includes('corps') ||
      norm.includes('fonction') ||
      norm.includes('rank') ||
      norm.includes('poste')
    ) {
      return 'rank';
    }

    if (
      norm.includes('درج') ||
      norm.includes('echelon') ||
      norm.includes('step') ||
      norm === 'grade'
    ) {
      return 'grade';
    }

    // 8. Functional Code (skip generic NIN / national ID unless explicitly functional)
    if (
      norm.includes('رمز') ||
      norm.includes('وظيف') ||
      norm.includes('مالي') ||
      norm.includes('تسجيل') ||
      norm.includes('matricule') ||
      norm.includes('functional') ||
      norm.includes('code')
    ) {
      return 'functionalCode';
    }

    return null;
  };

  const handleXLSImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        setImportMessage({ text: 'الملف لا يحتوي على أوراق عمل صالحة.', type: 'error' });
        return;
      }

      // Pick best sheet (score sheets by teacher header matches, preferring staff/teacher sheets)
      let selectedRawRows: any[][] = [];
      let headerRowIndex = -1;
      let maxMatches = 0;
      let bestColMap: Record<number, TeacherFieldKey> = {};

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false }) as any[][];
        if (!rawRows || rawRows.length === 0) continue;

        let sheetBestRow = -1;
        let sheetMaxMatches = 0;
        let sheetBestMap: Record<number, TeacherFieldKey> = {};

        for (let r = 0; r < Math.min(25, rawRows.length); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;

          const currentMap: Record<number, TeacherFieldKey> = {};
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

          if (matches > sheetMaxMatches) {
            sheetMaxMatches = matches;
            sheetBestRow = r;
            sheetBestMap = currentMap;
          }
        }

        const normSheet = normalizeHeaderKey(sheetName);
        const sheetBonus =
          sheetMaxMatches > 0 &&
          (normSheet.includes('اساذ') ||
            normSheet.includes('اساتذ') ||
            normSheet.includes('استاذ') ||
            normSheet.includes('موظف') ||
            normSheet.includes('teach') ||
            normSheet.includes('staff'))
            ? 0.5
            : 0;

        if (sheetMaxMatches + sheetBonus > maxMatches || selectedRawRows.length === 0) {
          maxMatches = sheetMaxMatches + sheetBonus;
          headerRowIndex = sheetBestRow;
          bestColMap = sheetBestMap;
          selectedRawRows = rawRows;
        }
      }

      const detectedColCount = Object.keys(bestColMap).length;
      if (!selectedRawRows || selectedRawRows.length === 0 || detectedColCount < 2 || headerRowIndex < 0) {
        setImportMessage({
          text: 'تعذر التعرف على أعمدة جدول الأساتذة في الملف. تأكد من وجود رؤوس الأعمدة مثل (الرمز الوظيفي، اللقب، الاسم، المادة، الرتبة).',
          type: 'error'
        });
        return;
      }

      const dataRows = selectedRawRows.slice(headerRowIndex + 1);
      if (dataRows.length === 0) {
        setImportMessage({ text: 'لم يتم العثور على صفوف بيانات بعد رأس الجدول.', type: 'error' });
        return;
      }

      const headerRowCells = selectedRawRows[headerRowIndex] || [];
      const nameColIdx = Object.entries(bestColMap).find(([, f]) => f === 'name')?.[0];
      const nameHeaderNorm = nameColIdx !== undefined ? normalizeHeaderKey(String(headerRowCells[Number(nameColIdx)] || '')) : '';
      const isLastThenFirst = nameHeaderNorm.startsWith('لقب') || nameHeaderNorm.includes('اللقب و') || nameHeaderNorm.includes('nom');

      const teachersToAdd: Partial<Teacher>[] = [];

      for (let idx = 0; idx < dataRows.length; idx++) {
        const rowCells = dataRows[idx];
        if (!Array.isArray(rowCells) || rowCells.length === 0) continue;

        const hasContent = rowCells.some(c => c !== undefined && c !== null && String(c).trim() !== '');
        if (!hasContent) continue;

        // Extract strictly by mapped column index (prevents any column shifting or mixing)
        const rowData: Partial<Record<TeacherFieldKey, any>> = {};
        for (const [colIdxStr, field] of Object.entries(bestColMap)) {
          const colIdx = Number(colIdxStr);
          if (colIdx < rowCells.length) {
            rowData[field] = rowCells[colIdx];
          }
        }

        // Skip summary, footer, or repeated header rows
        const combinedStr = Object.values(rowData).map(v => String(v || '')).join(' ');
        if (
          combinedStr.includes('المجموع') ||
          combinedStr.includes('الإجمالي') ||
          combinedStr.includes('التوقيع') ||
          combinedStr.includes('حرر بـ') ||
          combinedStr.startsWith('Page ')
        ) {
          continue;
        }

        let firstName = formatTextCell(rowData.firstName);
        let lastName = formatTextCell(rowData.lastName);
        const rawCombinedName = formatTextCell(rowData.name);
        const functionalCode = formatTextCell(rowData.functionalCode);
        const rank = formatTextCell(rowData.rank);
        const grade = formatTextCell(rowData.grade);
        const subject = formatTextCell(rowData.subject);
        const birthDate = formatDateCell(rowData.birthDate);
        const effectiveDate = formatDateCell(rowData.effectiveDate);
        const email = formatTextCell(rowData.email);
        const phone = formatTextCell(rowData.phone);
        const levelsRaw = formatTextCell(rowData.levels);
        const levels = levelsRaw
          ? levelsRaw.split(/[;،,\/]/).map(s => s.trim()).filter(Boolean)
          : [];

        // Skip repeated header row if encountered inside data rows
        if (
          normalizeHeaderKey(firstName) === 'الاسم' ||
          normalizeHeaderKey(lastName) === 'اللقب' ||
          normalizeHeaderKey(functionalCode) === 'الرمز الوظيفي'
        ) {
          continue;
        }

        // Resolve fullName, firstName, and lastName accurately
        let fullName = '';
        if (rawCombinedName) {
          fullName = rawCombinedName;
          if (!firstName && !lastName) {
            const parts = rawCombinedName.split(/\s+/).filter(Boolean);
            if (parts.length >= 2) {
              if (isLastThenFirst) {
                lastName = parts[0];
                firstName = parts.slice(1).join(' ');
              } else {
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
              }
            } else if (parts.length === 1) {
              firstName = parts[0];
            }
          }
        } else if (firstName && lastName) {
          fullName = `${firstName} ${lastName}`.trim();
        } else if (firstName) {
          fullName = firstName;
          const parts = firstName.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }
        } else if (lastName) {
          fullName = lastName;
        }

        if (fullName || functionalCode) {
          teachersToAdd.push({
            functionalCode,
            firstName,
            lastName,
            name: fullName,
            rank,
            grade,
            subject,
            birthDate,
            effectiveDate,
            email,
            phone,
            levels
          });
        }
      }

      if (teachersToAdd.length > 0) {
        const { createTeachersBulk } = await import('../lib/api/teachers');
        const saved = await createTeachersBulk(teachersToAdd);
        const addedItems = (saved && saved.length > 0 ? saved : teachersToAdd) as Teacher[];
        setTeachers(prev => {
          const map = new Map(prev.map(t => [t.id, t]));
          addedItems.forEach(item => {
            if (item && item.id) {
              map.set(item.id, item);
            }
          });
          return Array.from(map.values());
        });
        resetAllFilters();
        try {
          const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
          await logActivity(schoolId, LogAction.CREATE, LogModule.TEACHERS, `استيراد ${addedItems.length} أستاذ من ملف Excel (XLS)`);
        } catch {
          // Ignore logging failure
        }
        showToast(`تم استيراد ${addedItems.length} أستاذ بنجاح (تمت مطابقة ${detectedColCount} أعمدة بدقة)!`);
      } else {
        showToast('لم يتم العثور على أساتذة صالحين للاستيراد.', 'error');
      }
    } catch (error) {
      console.error('Error importing XLS:', error);
      showToast('حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');

        const teachersToAdd: Partial<Teacher>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = line.split(/[,;]/).map(p => p.trim());
          if (parts.length < 2) continue;

          const firstName = parts[1] || '';
          const lastName = parts[2] || '';
          teachersToAdd.push({
            functionalCode: parts[0] || '',
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            birthDate: formatDateCell(parts[3] || ''),
            rank: parts[4] || '',
            subject: parts[5] || '',
            grade: parts[6] || '',
            effectiveDate: formatDateCell(parts[7] || ''),
            email: parts[8] || '',
            phone: parts[9] || '',
            levels: parts[10] ? parts[10].split(/[|/،]/).map(s => s.trim()).filter(Boolean) : []
          });
        }

        if (teachersToAdd.length > 0) {
          const { createTeachersBulk } = await import('../lib/api/teachers');
          const saved = await createTeachersBulk(teachersToAdd);
          const addedItems = (saved && saved.length > 0 ? saved : teachersToAdd) as Teacher[];
          setTeachers(prev => {
            const map = new Map(prev.map(t => [t.id, t]));
            addedItems.forEach(item => {
              if (item && item.id) {
                map.set(item.id, item);
              }
            });
            return Array.from(map.values());
          });
          resetAllFilters();
          try {
            const { logActivity, LogAction, LogModule } = await import('../services/loggingService');
            await logActivity(schoolId, LogAction.CREATE, LogModule.TEACHERS, `استيراد ${addedItems.length} أستاذ من ملف CSV`);
          } catch {
            // Ignore logging failure
          }
          showToast(`تم استيراد ${addedItems.length} أستاذ بنجاح!`);
        } else {
          showToast('لم يتم العثور على أساتذة صالحين للاستيراد.', 'error');
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        showToast('حدث خطأ أثناء استيراد الملف.', 'error');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);

    if (e.target) e.target.value = '';
  };

  const handleSort = (key: keyof Teacher) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const filteredTeachers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return teachers.filter(t => {
      const matchesSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.functionalCode?.toLowerCase().includes(q) ||
        t.rank?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.phone?.toLowerCase().includes(q);
      const matchesRank = selectedRank === 'all' || t.rank === selectedRank;
      const matchesSubject = selectedSubject === 'all' || t.subject === selectedSubject;

      const matchesColumnFilters = Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const teacherValue = String((t as any)[key] || '').toLowerCase();
        return teacherValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesRank && matchesSubject && matchesColumnFilters;
    });
  }, [teachers, searchTerm, selectedRank, selectedSubject, columnFilters]);

  const sortedTeachers = useMemo(() => {
    const list = [...filteredTeachers];
    if (!sortConfig.key || !sortConfig.direction) return list;

    return list.sort((a, b) => {
      const aValue = String(a[sortConfig.key!] || '').toLowerCase();
      const bValue = String(b[sortConfig.key!] || '').toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTeachers, sortConfig]);

  const uniqueRanks = useMemo(
    () => Array.from(new Set(teachers.map(t => t.rank).filter((r): r is string => Boolean(r)))),
    [teachers]
  );

  const uniqueSubjects = useMemo(
    () => Array.from(new Set(teachers.map(t => t.subject).filter((s): s is string => Boolean(s)))),
    [teachers]
  );

  const activeFiltersCount = useMemo(() => {
    const colCount = Object.values(columnFilters).filter(Boolean).length;
    return colCount + (selectedRank !== 'all' ? 1 : 0) + (selectedSubject !== 'all' ? 1 : 0) + (searchTerm.trim() ? 1 : 0);
  }, [columnFilters, selectedRank, selectedSubject, searchTerm]);

  const resetAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRank('all');
    setSelectedSubject('all');
    setColumnFilters({
      functionalCode: '',
      name: '',
      rank: '',
      subject: '',
      birthDate: ''
    });
    setSortConfig({ key: null, direction: null });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  }, []);

  const isAllSelected = useMemo(() => {
    if (sortedTeachers.length === 0) return false;
    const selectedSet = new Set(selectedIds);
    return sortedTeachers.every(t => selectedSet.has(t.id));
  }, [sortedTeachers, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const visibleIds = new Set(sortedTeachers.map(t => t.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...sortedTeachers.map(t => t.id)]);
      setSelectedIds(Array.from(merged));
    }
  }, [isAllSelected, sortedTeachers, selectedIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleExportXLS = useCallback((onlySelected = false) => {
    const selectedSet = new Set(selectedIds);
    const list = onlySelected && selectedIds.length > 0
      ? sortedTeachers.filter(t => selectedSet.has(t.id))
      : sortedTeachers;

    if (list.length === 0) {
      showToast('لا توجد بيانات للتصدير في القائمة الحالية.', 'error');
      return;
    }

    const rows = list.map((t, index) => ({
      'الرقم': index + 1,
      'الرمز الوظيفي': t.functionalCode || '',
      'اللقب': t.lastName || '',
      'الاسم': t.firstName || '',
      'اللقب والاسم': t.name || '',
      'تاريخ الازدياد': formatDisplayDate(t.birthDate),
      'الرتبة': t.rank || '',
      'المادة': t.subject || '',
      'الدرجة': t.grade || '',
      'تاريخ السريان': formatDisplayDate(t.effectiveDate),
      'الأطوار / المستويات': Array.isArray(t.levels) ? t.levels.join('، ') : '',
      'رقم الهاتف': t.phone || '',
      'البريد الإلكتروني': t.email || ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 24 },
      { wch: 14 },
      { wch: 24 },
      { wch: 18 },
      { wch: 10 },
      { wch: 14 },
      { wch: 24 },
      { wch: 16 },
      { wch: 26 }
    ];
    const wb = XLSX.utils.book_new();
    if (!wb.Workbook) wb.Workbook = {};
    wb.Workbook.Views = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, ws, 'قائمة الأساتذة');
    const safeYear = (academicYear || '2025-2026').replace(/[\/\\]/g, '-');
    XLSX.writeFile(wb, `قائمة_الأساتذة_${safeYear}.xlsx`);
    showToast(`تم تصدير ${list.length} سجل إلى ملف Excel بنجاح`);
  }, [selectedIds, sortedTeachers, academicYear, showToast]);

  const handleDownloadTemplateXLS = useCallback(() => {
    const sampleRows = [
      {
        'الرمز الوظيفي': '2021045891',
        'اللقب': 'بن عمار',
        'الاسم': 'سليم',
        'تاريخ الازدياد': '1986-05-14',
        'الرتبة': educationLevel === 'Lycée' ? 'أستاذ التعليم الثانوي' : 'أستاذ التعليم المتوسط',
        'المادة': 'العلوم الفيزيائية والتكنولوجيا',
        'الدرجة': '05',
        'تاريخ السريان': '2023-09-01',
        'المستويات': educationLevel === 'Lycée' ? '1 ثانوي، 2 ثانوي' : '1 متوسط، 2 متوسط',
        'رقم الهاتف': '0661000000',
        'البريد الإلكتروني': 's.benamar@example.dz'
      },
      {
        'الرمز الوظيفي': '2019087412',
        'اللقب': 'عسول',
        'الاسم': 'فيصل',
        'تاريخ الازدياد': '1988-11-22',
        'الرتبة': 'ملحق رئيسي بالمخابر',
        'المادة': 'العلوم الفيزيائية والطبيعية',
        'الدرجة': '06',
        'تاريخ السريان': '2024-01-01',
        'المستويات': '',
        'رقم الهاتف': '0770000000',
        'البريد الإلكتروني': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 15 },
      { wch: 24 },
      { wch: 26 },
      { wch: 10 },
      { wch: 15 },
      { wch: 22 },
      { wch: 16 },
      { wch: 24 }
    ];
    const wb = XLSX.utils.book_new();
    if (!wb.Workbook) wb.Workbook = {};
    wb.Workbook.Views = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج الأساتذة');
    XLSX.writeFile(wb, 'نموذج_استيراد_الأساتذة.xlsx');
    showToast('تم تحميل نموذج Excel الجاهز للاستيراد');
  }, [educationLevel, showToast]);

  const handlePrintRoster = useCallback((onlySelected = false) => {
    const selectedSet = new Set(selectedIds);
    const list = onlySelected && selectedIds.length > 0
      ? sortedTeachers.filter(t => selectedSet.has(t.id))
      : sortedTeachers;

    if (list.length === 0) {
      showToast('لا توجد سجلات متاحة للطباعة.', 'error');
      return;
    }

    const teachingCount = list.filter(t => t.rank?.includes('أستاذ')).length;
    const labCount = list.filter(t => t.rank?.includes('مخبر') || t.rank?.includes('المخابر')).length;

    openPrintPreview({
      title: 'القائمة الاسمية لهيئة التدريس وموظفي المخبر',
      subtitle: `${schoolName || 'المؤسسة التربوية'} — السنة الدراسية ${academicYear || '2025/2026'}`,
      type: 'table',
      suggestedOrientation: 'landscape',
      summaryCards: [
        { label: 'إجمالي الموظفين بالقائمة', value: list.length },
        { label: 'الأساتذة', value: teachingCount },
        { label: 'طاقم المخابر', value: labCount },
        { label: 'المواد والتخصصات', value: new Set(list.map(t => t.subject).filter(Boolean)).size }
      ],
      headers: [
        '#',
        'الرمز الوظيفي',
        'اللقب والاسم',
        'تاريخ الازدياد',
        'الرتبة',
        'المادة / التخصص',
        'الدرجة',
        'تاريخ السريان',
        'المستويات / الهاتف'
      ],
      rows: list.map((t, index) => [
        index + 1,
        t.functionalCode || '—',
        t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || '—',
        formatDisplayDate(t.birthDate),
        t.rank || '—',
        t.subject || '—',
        t.grade || '—',
        formatDisplayDate(t.effectiveDate),
        [
          Array.isArray(t.levels) && t.levels.length > 0 ? t.levels.join('، ') : '',
          t.phone || ''
        ].filter(Boolean).join(' | ') || '—'
      ]),
      notes: 'تُستعمل هذه القائمة كمرجع رسمي لتسيير المخبر وتحديد الرموز الوظيفية لولوج الأساتذة إلى فضاء التحضير الرقمي.'
    });
  }, [selectedIds, sortedTeachers, openPrintPreview, schoolName, academicYear, showToast]);

  const stats = useMemo(() => ({
    total: teachers.length,
    teachingStaff: teachers.filter(t => t.rank?.includes('أستاذ')).length,
    secondaryTeachers: teachers.filter(t => t.rank?.includes('ثانوي') || t.rank?.includes('متوسط')).length,
    labStaff: teachers.filter(t => t.rank?.includes('مخبر') || t.rank?.includes('المخابر')).length,
    uniqueSubjectsCount: uniqueSubjects.length,
    ranks: teachers.reduce((acc, t) => {
      if (t.rank) acc[t.rank] = (acc[t.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    subjects: teachers.reduce((acc, t) => {
      if (t.subject) acc[t.subject] = (acc[t.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }), [teachers, uniqueSubjects]);

  const rowVirtualizer = useVirtualizer({
    count: sortedTeachers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 10,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [sortedTeachers.length, rowVirtualizer]);

  return {
    schoolId,
    schoolName,
    academicYear,
    educationLevel,
    teachers,
    loading,
    searchTerm, setSearchTerm,
    selectedRank, setSelectedRank,
    selectedSubject, setSelectedSubject,
    isAddModalOpen, setIsAddModalOpen,
    openAddModal,
    openEditModal,
    closeAddModal,
    editingTeacher, setEditingTeacher,
    viewingTeacher, setViewingTeacher,
    isImporting,
    isSaving,
    isDeleting,
    selectedIds,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    deleteConfirmTarget,
    setDeleteConfirmTarget,
    requestDeleteTeacher,
    requestBulkDelete,
    confirmDelete,
    copiedCodeId,
    handleCopyCode,
    newTeacher, setNewTeacher,
    importMessage,
    columnFilters, setColumnFilters,
    activeFilterColumn, setActiveFilterColumn,
    showFilterRow, setShowFilterRow,
    sortConfig, setSortConfig,
    fileInputRef,
    filterRef,
    parentRef,
    rowVirtualizer,
    formatDisplayDate,
    handleAddTeacher,
    handleDeleteTeacher,
    handleXLSImport,
    handleCSVImport,
    handleExportXLS,
    handleDownloadTemplateXLS,
    handlePrintRoster,
    handleSort,
    resetAllFilters,
    filteredTeachers: sortedTeachers,
    uniqueRanks,
    uniqueSubjects,
    activeFiltersCount,
    stats
  };
}
