import * as XLSX from 'xlsx';

export type BackupCategory = 'inventory' | 'pedagogy' | 'finance' | 'system';

export interface BackupCollectionMeta {
  id: string;
  label: string;
  sheetName: string; // Strictly <= 31 chars, no \ / ? * [ ] :
  category: BackupCategory;
  description: string;
  coreModule?: boolean;
  annualResetTarget?: boolean;
  apiEndpoint?: string;
  supportsBulkPost?: boolean;
  supportsBulkDelete?: boolean;
  supportsPut?: boolean;
}

export const BACKUP_COLLECTIONS: BackupCollectionMeta[] = [
  {
    id: 'equipment',
    label: 'الأجهزة والتجهيزات المخبرية',
    sheetName: 'العتاد_والتجهيزات',
    category: 'inventory',
    description: 'سجل العتاد والتجهيزات والأدوات والكميات والمواقع',
    coreModule: true,
    annualResetTarget: false,
    apiEndpoint: '/api/db/equipment',
    supportsBulkPost: true,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'glassware_inventory',
    label: 'مخزن الزجاجيات',
    sheetName: 'مخزن_الزجاجيات',
    category: 'inventory',
    description: 'بطاقات الزجاجيات المخبرية والمقاسات والحالة والمواقع',
    coreModule: true,
    annualResetTarget: false,
    apiEndpoint: '/api/db/glassware',
    supportsBulkPost: true,
    supportsBulkDelete: true,
    supportsPut: true,
  },
  {
    id: 'chemicals',
    label: 'المواد والمحاليل الكيميائية',
    sheetName: 'المواد_الكيميائية',
    category: 'inventory',
    description: 'بطاقات المواد الكيميائية والتراكيز والصلاحية والأخطار',
    coreModule: true,
    annualResetTarget: false,
    apiEndpoint: '/api/db/chemicals',
    supportsBulkPost: true,
    supportsBulkDelete: true,
    supportsPut: true,
  },
  {
    id: 'teachers',
    label: 'الأساتذة والمؤطرون',
    sheetName: 'الأساتذة',
    category: 'pedagogy',
    description: 'قائمة أساتذة المادة والأقسام المسندة والرتب',
    coreModule: true,
    annualResetTarget: false,
    apiEndpoint: '/api/db/teachers',
    supportsBulkPost: true,
    supportsBulkDelete: true,
    supportsPut: true,
  },
  {
    id: 'maintenance',
    label: 'سجل الصيانة والإصلاح',
    sheetName: 'سجل_الصيانة',
    category: 'inventory',
    description: 'سجلات الأعطاب وعمليات صيانة الأجهزة والمعدات',
    coreModule: false,
    annualResetTarget: true,
    apiEndpoint: '/api/db/maintenance',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'daily_reports',
    label: 'التقارير اليومية للمخبر',
    sheetName: 'التقارير_اليومية',
    category: 'pedagogy',
    description: 'دفاتر التقارير اليومية وتأشيرات الناظر والمدير',
    coreModule: true,
    annualResetTarget: true,
  },
  {
    id: 'experiment_logs',
    label: 'سجل التجارب المخبرية',
    sheetName: 'سجل_التجارب',
    category: 'pedagogy',
    description: 'التجارب المنجزة والمواد والأدوات المستهلكة فيها',
    coreModule: true,
    annualResetTarget: true,
  },
  {
    id: 'lab_sessions',
    label: 'حصص الأعمال التطبيقية',
    sheetName: 'حصص_المخبر',
    category: 'pedagogy',
    description: 'بطاقات متابعة الحصص المخبرية والتجارب المجدولة',
    coreModule: false,
    annualResetTarget: true,
    apiEndpoint: '/api/db/lab-sessions',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'lab_usage_logs',
    label: 'دفتر الاستهلاك المخبري',
    sheetName: 'سجل_الاستهلاك',
    category: 'pedagogy',
    description: 'دفتر الاستهلاك الوزاري للمواد والأدوات خلال الحصص',
    coreModule: false,
    annualResetTarget: true,
    apiEndpoint: '/api/db/lab-usage-logs',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: false,
  },
  {
    id: 'activity_requests',
    label: 'طلبات تحضير الأعمال التطبيقية',
    sheetName: 'طلبات_الأنشطة',
    category: 'pedagogy',
    description: 'طلبات الأساتذة لتحضير الحصص والتجارب التطبيقية',
    coreModule: true,
    annualResetTarget: true,
  },
  {
    id: 'loan_requests',
    label: 'طلبات إعارة العتاد',
    sheetName: 'طلبات_الإعارة',
    category: 'pedagogy',
    description: 'متابعة استعارة وإرجاع الأجهزة المخبرية',
    coreModule: false,
    annualResetTarget: true,
  },
  {
    id: 'safety_incidents',
    label: 'حوادث الأمان وتقارير الإتلاف',
    sheetName: 'حوادث_الأمان_والإتلاف',
    category: 'inventory',
    description: 'سجل الكسر والإتلاف وحوادث السلامة المخبرية',
    coreModule: true,
    annualResetTarget: true,
  },
  {
    id: 'incident_logs',
    label: 'سجلات الأعطاب التكميلية',
    sheetName: 'سجلات_الأعطاب',
    category: 'inventory',
    description: 'سجلات الحوادث والأعطاب المسجلة تاريخياً',
    coreModule: false,
    annualResetTarget: true,
  },
  {
    id: 'reports',
    label: 'التقارير الدورية والأرشيف',
    sheetName: 'التقارير_الدورية',
    category: 'pedagogy',
    description: 'التقارير الدورية الفصلية والسنوية المحفوظة',
    coreModule: false,
    annualResetTarget: true,
  },
  {
    id: 'purchase_orders',
    label: 'سندات الطلب والمقتنيات',
    sheetName: 'سندات_الطلب',
    category: 'finance',
    description: 'طلبيات الشراء والفواتير المرتبطة بالمخبر',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'budget_purchases',
    label: 'نفقات الميزانية المخبرية',
    sheetName: 'مشتريات_الميزانية',
    category: 'finance',
    description: 'اعتمادات الميزانية والمقتنيات المصادق عليها',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'budget_config',
    label: 'إعدادات الميزانية',
    sheetName: 'إعدادات_الميزانية',
    category: 'finance',
    description: 'توزيع الاعتمادات المالية للمخبر',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'suppliers',
    label: 'دليل الموردين',
    sheetName: 'الموردون',
    category: 'finance',
    description: 'بيانات الموردين والشركات المعتمدة للتوريد',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'equipment_scrapping',
    label: 'محاضر إسقاط التجهيزات',
    sheetName: 'إسقاط_التجهيزات',
    category: 'finance',
    description: 'قوائم العتاد المقترح للإسقاط من الجرد',
    coreModule: false,
    annualResetTarget: false,
    apiEndpoint: '/api/db/equipment-scrapping',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'student_classes',
    label: 'الأقسام والمستويات',
    sheetName: 'الأقسام_والمستويات',
    category: 'pedagogy',
    description: 'الأقسام التربوية المسندة وتعداد التلاميذ',
    coreModule: false,
    annualResetTarget: true,
    apiEndpoint: '/api/db/student-classes',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'student_groups',
    label: 'الأفواج التربوية',
    sheetName: 'الأفواج_التربوية',
    category: 'pedagogy',
    description: 'الأفواج المخبرية المسجلة',
    coreModule: false,
    annualResetTarget: true,
  },
  {
    id: 'lab_schedule',
    label: 'جدولة القاعات المخبرية',
    sheetName: 'جدول_القاعات',
    category: 'pedagogy',
    description: 'برمجة القاعات والتجارب الأسبوعية',
    coreModule: false,
    annualResetTarget: true,
    apiEndpoint: '/api/db/lab-schedule',
    supportsBulkPost: false,
    supportsBulkDelete: false,
    supportsPut: true,
  },
  {
    id: 'timetable',
    label: 'استعمال الزمن المخبري',
    sheetName: 'استعمال_الزمن',
    category: 'pedagogy',
    description: 'توزيع الحصص الأسبوعية للمخبر',
    coreModule: false,
    annualResetTarget: true,
  },
  {
    id: 'legislation',
    label: 'التشريع والوثائق التنظيمية',
    sheetName: 'التشريع_المدرسي',
    category: 'system',
    description: 'المناشير والقرارات الوزارية الخاصة بالمؤسسة',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'user_documents',
    label: 'مكتبة الوثائق والملفات',
    sheetName: 'مكتبة_الوثائق',
    category: 'system',
    description: 'الوثائق المرفوعة والملفات الإدارية',
    coreModule: false,
    annualResetTarget: false,
  },
  {
    id: 'logs',
    label: 'سجل النشاط التقني',
    sheetName: 'سجل_النشاط',
    category: 'system',
    description: 'سجلات العمليات والتعديلات في قاعدة المؤسسة',
    coreModule: false,
    annualResetTarget: true,
  },
];

export const SUMMARY_SHEET_NAME = 'ملخص_النسخة';

export function sanitizeSheetName(raw: string): string {
  const cleaned = raw.replace(/[\\/?*[\]:]/g, '_').trim();
  return cleaned.slice(0, 31) || 'Sheet';
}

export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    if (value instanceof Date || typeof (value as any).toDate === 'function') {
      return value;
    }
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        result[k] = stripUndefined(v);
      }
    }
    return result as T;
  }
  return value;
}

export function normalizeFirestoreValue(value: any): any {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        return value.toDate().toISOString();
      } catch {
        return '';
      }
    }
    if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
      try {
        return new Date(value.seconds * 1000).toISOString();
      } catch {
        return '';
      }
    }
    if (Array.isArray(value)) {
      return value.map((v) => normalizeFirestoreValue(v));
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        out[k] = normalizeFirestoreValue(v);
      }
    }
    return out;
  }
  return value;
}

function toExcelCellValue(value: any): string | number | boolean {
  const norm = normalizeFirestoreValue(value);
  if (norm === null || norm === undefined) return '';
  if (typeof norm === 'number' || typeof norm === 'boolean') return norm;
  if (typeof norm === 'string') {
    return norm.length > 32000 ? norm.slice(0, 32000) : norm;
  }
  try {
    const serialized = JSON.stringify(norm);
    return serialized.length > 32000 ? serialized.slice(0, 32000) : serialized;
  } catch {
    return String(norm);
  }
}

const PRIORITY_COLUMNS = [
  '_doc_id',
  'name',
  'nameAr',
  'nameEn',
  'designationFr',
  'title',
  'formula',
  'casNumber',
  'serialNumber',
  'type',
  'category',
  'subject',
  'status',
  'quantity',
  'totalQuantity',
  'availableQuantity',
  'brokenQuantity',
  'unit',
  'purity',
  'location',
  'shelf',
  'storageLocation',
  'expiryDate',
  'date',
  'teacherName',
  'email',
  'phone',
  'updatedAt',
  'createdAt',
];

function computeOrderedKeys(rows: Record<string, any>[]): string[] {
  const keySet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => keySet.add(k));
  });
  const keys = Array.from(keySet);
  return keys.sort((a, b) => {
    const ia = PRIORITY_COLUMNS.indexOf(a);
    const ib = PRIORITY_COLUMNS.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

function applyColumnWidths(ws: XLSX.WorkSheet, rows: Record<string, any>[], headers: string[]) {
  ws['!cols'] = headers.map((header) => {
    let maxLen = header.length + 4;
    for (let i = 0; i < Math.min(rows.length, 200); i++) {
      const val = rows[i]?.[header];
      const strLen = val === undefined || val === null ? 0 : String(val).length;
      if (strLen > maxLen) maxLen = strLen;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 12), 48) };
  });
  ws['!views'] = [{ rightToLeft: true }];
}

export interface BackupSchoolMetadata {
  schoolId: string;
  schoolName: string;
  directorate: string;
  academicYear: string;
  exportedBy?: string;
}

export function buildExcelWorkbook(
  dataByCollection: Record<string, Record<string, any>[]>,
  meta: BackupSchoolMetadata,
  collectionsMeta: BackupCollectionMeta[] = BACKUP_COLLECTIONS
): { workbook: XLSX.WorkBook; exportedSheetsCount: number; totalRows: number } {
  const wb = XLSX.utils.book_new();
  const exportedAt = new Date().toISOString();

  let totalRows = 0;
  let exportedSheetsCount = 0;
  const usedSheetNames = new Set<string>([SUMMARY_SHEET_NAME]);

  const summaryRows: Record<string, any>[] = [];

  for (const colMeta of collectionsMeta) {
    const items = dataByCollection[colMeta.id];
    if (!items) continue;

    totalRows += items.length;
    let sheetName = sanitizeSheetName(colMeta.sheetName);
    let suffix = 2;
    while (usedSheetNames.has(sheetName)) {
      sheetName = sanitizeSheetName(`${colMeta.sheetName.slice(0, 27)}_${suffix++}`);
    }

    summaryRows.push({
      'القسم': colMeta.label,
      'المعرف التقني': colMeta.id,
      'اسم ورقة العمل': items.length > 0 ? sheetName : 'لا توجد سجلات',
      'عدد السجلات': items.length,
      'الفئة':
        colMeta.category === 'inventory'
          ? 'المخزون والعتاد'
          : colMeta.category === 'pedagogy'
          ? 'البيداغوجيا والتجارب'
          : colMeta.category === 'finance'
          ? 'المالية والإدارة'
          : 'النظام والوثائق',
      'الحالة': items.length > 0 ? 'مُصدّر' : 'فارغ',
    });

    if (items.length === 0) continue;

    usedSheetNames.add(sheetName);
    exportedSheetsCount++;

    const flatRows = items.map((item) => {
      const { id, ...rest } = item;
      const flat: Record<string, any> = {
        _doc_id: id || '',
      };
      for (const [key, val] of Object.entries(rest)) {
        flat[key] = toExcelCellValue(val);
      }
      return flat;
    });

    const headers = computeOrderedKeys(flatRows);
    const ws = XLSX.utils.json_to_sheet(flatRows, { header: headers });
    applyColumnWidths(ws, flatRows, headers);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const metaHeaderRows: any[][] = [
    ['الجمهورية الجزائرية الديمقراطية الشعبية — نظام مخبري للنسخ الاحتياطي'],
    ['المؤسسة التعليمية', meta.schoolName || 'غير محددة', 'معرف المؤسسة', meta.schoolId],
    ['مديرية التربية', meta.directorate || 'غير محددة', 'السنة الدراسية', meta.academicYear || '2025/2026'],
    ['تاريخ التصدير', exportedAt, 'بواسطة', meta.exportedBy || 'مسؤول المخبر'],
    ['إجمالي السجلات', totalRows, 'أوراق البيانات', exportedSheetsCount],
    [],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(metaHeaderRows);
  XLSX.utils.sheet_add_json(summarySheet, summaryRows, { origin: 'A7' });
  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 24 },
    { wch: 26 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
  ];
  summarySheet['!views'] = [{ rightToLeft: true }];

  wb.SheetNames.unshift(SUMMARY_SHEET_NAME);
  wb.Sheets[SUMMARY_SHEET_NAME] = summarySheet;

  return { workbook: wb, exportedSheetsCount, totalRows };
}

export function exportSingleCollectionExcel(
  collectionMeta: BackupCollectionMeta,
  items: Record<string, any>[],
  schoolName: string
) {
  const wb = XLSX.utils.book_new();
  const flatRows = items.map((item) => {
    const { id, ...rest } = item;
    const flat: Record<string, any> = { _doc_id: id || '' };
    for (const [key, val] of Object.entries(rest)) {
      flat[key] = toExcelCellValue(val);
    }
    return flat;
  });

  const headers = computeOrderedKeys(flatRows);
  const ws = XLSX.utils.json_to_sheet(flatRows, { header: headers });
  applyColumnWidths(ws, flatRows, headers);
  const sheetName = sanitizeSheetName(collectionMeta.sheetName);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeSchool = (schoolName || 'school').replace(/[\\/?*[\]:\s]+/g, '_').slice(0, 24);
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Mekhbari_${collectionMeta.id}_${safeSchool}_${dateStr}.xlsx`);
}

function tryRestoreJsonCell(value: any): any {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

export interface ParsedBackupPayload {
  format: 'json' | 'excel';
  fileName: string;
  fileSizeBytes: number;
  collections: Record<string, Record<string, any>[]>;
  unknownSheets: string[];
  totalRecords: number;
  exportedAt?: string;
  schoolName?: string;
}

export async function parseBackupFile(file: File): Promise<ParsedBackupPayload> {
  const lowerName = file.name.toLowerCase();
  const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');

  if (!isExcel) {
    const text = await file.text();
    const raw = JSON.parse(text);
    const collections: Record<string, Record<string, any>[]> = {};
    const unknownSheets: string[] = [];
    let totalRecords = 0;

    const sourceObj = raw?.collections && typeof raw.collections === 'object'
      ? raw.collections
      : raw?.data && typeof raw.data === 'object'
      ? raw.data
      : raw;

    const validIds = new Set(BACKUP_COLLECTIONS.map((c) => c.id));

    for (const [key, value] of Object.entries(sourceObj || {})) {
      if (key.startsWith('_')) continue;
      if (validIds.has(key) && Array.isArray(value)) {
        collections[key] = value.map((item) => stripUndefined(item));
        totalRecords += value.length;
      } else if (Array.isArray(value)) {
        unknownSheets.push(key);
      }
    }

    return {
      format: 'json',
      fileName: file.name,
      fileSizeBytes: file.size,
      collections,
      unknownSheets,
      totalRecords,
      exportedAt: raw?._meta?.exportedAt,
      schoolName: raw?._meta?.schoolName,
    };
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const sheetToCollectionMap = new Map<string, string>();
  let exportedAt: string | undefined;
  let schoolName: string | undefined;

  if (wb.Sheets[SUMMARY_SHEET_NAME]) {
    const summaryAoA = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[SUMMARY_SHEET_NAME], { header: 1 });
    for (const row of summaryAoA) {
      if (!Array.isArray(row)) continue;
      if (row[0] === 'المؤسسة التعليمية' && row[1]) schoolName = String(row[1]);
      if (row[0] === 'تاريخ التصدير' && row[1]) exportedAt = String(row[1]);
    }
    const summaryTable = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[SUMMARY_SHEET_NAME], {
      range: 6,
    });
    for (const row of summaryTable) {
      const colId = row['المعرف التقني'];
      const sheetName = row['اسم ورقة العمل'];
      if (colId && sheetName && typeof colId === 'string' && typeof sheetName === 'string') {
        sheetToCollectionMap.set(sheetName.trim(), colId.trim());
      }
    }
  }

  const metaLookup = new Map<string, string>();
  for (const c of BACKUP_COLLECTIONS) {
    metaLookup.set(c.id.toLowerCase(), c.id);
    metaLookup.set(c.sheetName, c.id);
    metaLookup.set(sanitizeSheetName(c.sheetName), c.id);
    metaLookup.set(c.label, c.id);
  }

  const collections: Record<string, Record<string, any>[]> = {};
  const unknownSheets: string[] = [];
  let totalRecords = 0;

  for (const sheetName of wb.SheetNames) {
    if (sheetName === SUMMARY_SHEET_NAME) continue;

    const targetCollectionId =
      sheetToCollectionMap.get(sheetName.trim()) ||
      metaLookup.get(sheetName.trim()) ||
      metaLookup.get(sheetName.trim().toLowerCase());

    if (!targetCollectionId) {
      unknownSheets.push(sheetName);
      continue;
    }

    const ws = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    const cleanedRows: Record<string, any>[] = [];

    for (const row of rawRows) {
      const docObj: Record<string, any> = {};
      const docId = row['_doc_id'] || row['id'] || '';

      for (const [colKey, cellVal] of Object.entries(row)) {
        if (colKey === '_doc_id') continue;
        if (cellVal === '') continue;
        docObj[colKey] = tryRestoreJsonCell(cellVal);
      }

      if (docId) {
        docObj.id = String(docId).trim();
      }
      if (Object.keys(docObj).length > 0) {
        cleanedRows.push(stripUndefined(docObj));
      }
    }

    if (cleanedRows.length > 0) {
      collections[targetCollectionId] = cleanedRows;
      totalRecords += cleanedRows.length;
    }
  }

  return {
    format: 'excel',
    fileName: file.name,
    fileSizeBytes: file.size,
    collections,
    unknownSheets,
    totalRecords,
    exportedAt,
    schoolName,
  };
}

export interface DataHealthReport {
  duplicateChemicals: string[];
  duplicateEquipment: string[];
  expiredChemicals: { name: string; expiryDate: string }[];
  zeroStockChemicals: string[];
  incompleteEquipment: string[];
  incompleteTeachers: string[];
  totalFindings: number;
}

export function runDataHealthScan(
  dataByCollection: Record<string, Record<string, any>[]>
): DataHealthReport {
  const chemicals = dataByCollection.chemicals || [];
  const equipment = dataByCollection.equipment || [];
  const glassware = dataByCollection.glassware_inventory || [];
  const teachers = dataByCollection.teachers || [];

  const seenChem = new Set<string>();
  const duplicateChemicals: string[] = [];
  const expiredChemicals: { name: string; expiryDate: string }[] = [];
  const zeroStockChemicals: string[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (const c of chemicals) {
    const rawName = String(c.nameAr || c.name || c.nameEn || '').trim();
    const norm = rawName.toLowerCase().replace(/\s+/g, ' ');
    if (norm) {
      if (seenChem.has(norm) && !duplicateChemicals.includes(rawName)) {
        duplicateChemicals.push(rawName);
      }
      seenChem.add(norm);
    }
    const qty = Number(c.quantity);
    if (!Number.isNaN(qty) && qty <= 0) {
      zeroStockChemicals.push(rawName || c.id || 'مادة بدون اسم');
    }
    const exp = String(c.expiryDate || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(exp) && exp.slice(0, 10) < todayStr) {
      expiredChemicals.push({ name: rawName || c.id, expiryDate: exp.slice(0, 10) });
    }
  }

  const seenEquip = new Set<string>();
  const duplicateEquipment: string[] = [];
  const incompleteEquipment: string[] = [];

  for (const e of equipment) {
    const rawName = String(e.name || e.smartNameAr || '').trim();
    const norm = rawName.toLowerCase().replace(/\s+/g, ' ');
    if (norm) {
      if (seenEquip.has(norm) && !duplicateEquipment.includes(rawName)) {
        duplicateEquipment.push(rawName);
      }
      seenEquip.add(norm);
    }
    if (!rawName || e.totalQuantity === undefined || e.totalQuantity === '' || !e.status) {
      incompleteEquipment.push(rawName || e.id || 'تجهيز غير مكتمل');
    }
  }

  for (const g of glassware) {
    const rawName = String(g.nameAr || g.designationFr || '').trim();
    if (!rawName || g.quantity === undefined || !g.status) {
      incompleteEquipment.push(rawName || g.id || 'زجاجية غير مكتملة');
    }
  }

  const incompleteTeachers: string[] = [];
  for (const t of teachers) {
    const tName = String(t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()).trim();
    if (!tName || (!t.subject && !t.email && !t.phone)) {
      incompleteTeachers.push(tName || t.id || 'أستاذ غير مكتمل');
    }
  }

  const totalFindings =
    duplicateChemicals.length +
    duplicateEquipment.length +
    expiredChemicals.length +
    zeroStockChemicals.length +
    incompleteEquipment.length +
    incompleteTeachers.length;

  return {
    duplicateChemicals,
    duplicateEquipment,
    expiredChemicals,
    zeroStockChemicals,
    incompleteEquipment,
    incompleteTeachers,
    totalFindings,
  };
}
