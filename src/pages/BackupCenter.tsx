import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Database,
  FileJson,
  FileSpreadsheet,
  Filter,
  HardDrive,
  History,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { db, auth, getUserCollection } from '../firebase';
import { fetchWithAuth } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { cn } from '../lib/utils';
import {
  BACKUP_COLLECTIONS,
  BackupCategory,
  BackupCollectionMeta,
  buildExcelWorkbook,
  exportSingleCollectionExcel,
  normalizeFirestoreValue,
  parseBackupFile,
  ParsedBackupPayload,
  runDataHealthScan,
  stripUndefined,
} from '../utils/backupWorkbook';

type RestoreStrategy = 'merge_by_id' | 'skip_existing' | 'append_new';
type ReminderCadence = 'weekly' | 'monthly' | 'termly';

interface BackupHistoryEntry {
  id: string;
  timestamp: string;
  format: 'XLSX' | 'JSON' | 'AUTO_SAFETY';
  collectionsCount: number;
  totalRecords: number;
  approxKb: number;
  fileName: string;
}

const CATEGORY_TABS: { id: 'all' | BackupCategory; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'inventory', label: 'المخزون والعتاد' },
  { id: 'pedagogy', label: 'البيداغوجيا والتجارب' },
  { id: 'finance', label: 'المالية والإدارة' },
  { id: 'system', label: 'النظام والوثائق' },
];

const CADENCE_DAYS: Record<ReminderCadence, { label: string; days: number }> = {
  weekly: { label: 'أسبوعي (كل 7 أيام)', days: 7 },
  monthly: { label: 'شهري (كل 30 يوماً)', days: 30 },
  termly: { label: 'نهاية كل فصل (90 يوماً)', days: 90 },
};

function formatBytesKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function formatArabicDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getTargetScopes(schoolId: string, uid?: string | null): string[] {
  const scopes = new Set<string>();
  if (schoolId && schoolId !== 'school_001' && schoolId.trim() !== '') {
    scopes.add(schoolId.trim());
  }
  if (uid) {
    scopes.add(uid);
  }
  if (scopes.size === 0 && schoolId) {
    scopes.add(schoolId);
  }
  return Array.from(scopes);
}

function getOfflineCacheEntries(colId: string, schoolId: string, uid?: string | null): Record<string, any>[] {
  if (typeof window === 'undefined') return [];
  const candidateKeys = [
    uid ? `offline_cache_${uid}_${colId}` : null,
    schoolId ? `offline_cache_${schoolId}_${colId}` : null,
    `offline_cache_${colId}`,
  ].filter(Boolean) as string[];

  for (const key of candidateKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => normalizeFirestoreValue(item));
        }
      }
    } catch {
      // Ignore malformed cache entries
    }
  }
  return [];
}

function clearCollectionOfflineCaches(colId: string, schoolId: string, uid?: string | null) {
  if (typeof window === 'undefined') return;
  const candidateKeys = [
    uid ? `offline_cache_${uid}_${colId}` : null,
    schoolId ? `offline_cache_${schoolId}_${colId}` : null,
    `offline_cache_${colId}`,
  ].filter(Boolean) as string[];

  for (const key of candidateKeys) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Fetches records for any collection using the exact hybrid resolution order of the app:
 * 1) Backend SQL REST API (/api/db/*) when configured
 * 2) Firestore across both active schoolId and user UID scopes (merged & deduplicated by id)
 * 3) Offline localStorage fallback if neither SQL nor Firestore responded
 */
async function fetchCollectionHybrid(
  colMeta: BackupCollectionMeta,
  schoolId: string,
  uid?: string | null
): Promise<Record<string, any>[]> {
  const mergedMap = new Map<string, Record<string, any>>();
  let anyAuthoritativeResponded = false;

  // 1. Check backend SQL API first when applicable
  if (colMeta.apiEndpoint) {
    try {
      const apiRows = await fetchWithAuth(colMeta.apiEndpoint);
      if (Array.isArray(apiRows)) {
        anyAuthoritativeResponded = true;
        for (const row of apiRows) {
          if (row && typeof row === 'object') {
            const docId = String(row.id || `sql_${mergedMap.size}`);
            mergedMap.set(docId, normalizeFirestoreValue({ ...row, id: docId }));
          }
        }
      }
    } catch {
      // SQL API unavailable or unconfigured; proceed to Firestore scopes
    }
  }

  // 2. Check Firestore across active schoolId and user UID scopes
  const scopes = getTargetScopes(schoolId, uid);
  for (const scopeId of scopes) {
    try {
      const snap = await getDocs(getUserCollection(scopeId, colMeta.id));
      anyAuthoritativeResponded = true;
      for (const d of snap.docs) {
        if (!mergedMap.has(d.id)) {
          mergedMap.set(d.id, {
            id: d.id,
            ...normalizeFirestoreValue(d.data()),
          });
        }
      }
    } catch {
      // Scope unreadable or offline
    }
  }

  if (mergedMap.size > 0) {
    return Array.from(mergedMap.values());
  }

  // 3. Fallback to offline cache if neither API nor Firestore returned records
  if (!anyAuthoritativeResponded) {
    return getOfflineCacheEntries(colMeta.id, schoolId, uid);
  }

  // Even when API/Firestore returned 0, check if offline cache holds unsynced items written during API failure
  const offlineFallback = getOfflineCacheEntries(colMeta.id, schoolId, uid);
  if (offlineFallback.length > 0 && colMeta.apiEndpoint) {
    return offlineFallback;
  }

  return [];
}

export default function BackupCenter() {
  const { schoolId, schoolName, directorate, academicYear } = useSchool();
  const { userProfile } = useUserRole();

  const [authUid, setAuthUid] = useState<string | null>(() => auth.currentUser?.uid || null);
  const [cloudData, setCloudData] = useState<Record<string, Record<string, any>[]>>({});
  const [collectionSizes, setCollectionSizes] = useState<Record<string, number>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    BACKUP_COLLECTIONS.map((c) => c.id)
  );
  const [scanning, setScanning] = useState<boolean>(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number; label: string } | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Filtering & Search
  const [categoryFilter, setCategoryFilter] = useState<'all' | BackupCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  // Import / Restore preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImport, setPendingImport] = useState<ParsedBackupPayload | null>(null);
  const [restoreStrategy, setRestoreStrategy] = useState<RestoreStrategy>('merge_by_id');

  // Reset modal
  const [resetMode, setResetMode] = useState<'annual' | 'selected' | null>(null);
  const [autoBackupBeforeReset, setAutoBackupBeforeReset] = useState(true);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Local backup history & cadence reminder
  const historyStorageKey = `mekhbari_backup_history_${schoolId}`;
  const cadenceStorageKey = `mekhbari_backup_cadence_${schoolId}`;

  const [history, setHistory] = useState<BackupHistoryEntry[]>([]);
  const [cadence, setCadence] = useState<ReminderCadence>('weekly');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const savedHist = localStorage.getItem(historyStorageKey);
      setHistory(savedHist ? JSON.parse(savedHist) : []);
      const savedCadence = localStorage.getItem(cadenceStorageKey) as ReminderCadence | null;
      if (savedCadence && CADENCE_DAYS[savedCadence]) {
        setCadence(savedCadence);
      }
    } catch {
      setHistory([]);
    }
  }, [historyStorageKey, cadenceStorageKey]);

  const recordBackupHistory = useCallback(
    (entry: Omit<BackupHistoryEntry, 'id' | 'timestamp'>) => {
      const nextEntry: BackupHistoryEntry = {
        ...entry,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => {
        const updated = [nextEntry, ...prev].slice(0, 8);
        try {
          localStorage.setItem(historyStorageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [historyStorageKey]
  );

  const handleCadenceChange = (next: ReminderCadence) => {
    setCadence(next);
    try {
      localStorage.setItem(cadenceStorageKey, next);
    } catch {}
  };

  // Scan all hybrid + Firestore collections for live counts, sizes & health scan
  const scanCloudCollections = useCallback(async () => {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }
    const activeUid = auth.currentUser?.uid || authUid;
    if (!activeUid) {
      setScanning(false);
      return;
    }

    setScanning(true);
    try {
      const results = await Promise.all(
        BACKUP_COLLECTIONS.map(async (colMeta) => {
          const docs = await fetchCollectionHybrid(colMeta, schoolId, activeUid);
          const approxBytes = docs.length > 0 ? new Blob([JSON.stringify(docs)]).size : 0;
          return { id: colMeta.id, docs, approxBytes };
        })
      );

      const nextData: Record<string, Record<string, any>[]> = {};
      const nextSizes: Record<string, number> = {};
      for (const res of results) {
        nextData[res.id] = res.docs;
        nextSizes[res.id] = res.approxBytes;
      }
      setCloudData(nextData);
      setCollectionSizes(nextSizes);
    } catch (err) {
      console.error('Error scanning collections:', err);
      setStatus({ type: 'error', message: 'تعذر فحص قواعد البيانات بالكامل. يرجى التحقق من الاتصال.' });
    } finally {
      setScanning(false);
    }
  }, [schoolId, authUid]);

  useEffect(() => {
    scanCloudCollections();
  }, [scanCloudCollections]);

  // Derived aggregates
  const totalCloudRecords = useMemo(
    () => Object.values(cloudData).reduce((acc, list) => acc + list.length, 0),
    [cloudData]
  );

  const totalCloudBytes = useMemo(
    () => Object.values(collectionSizes).reduce((acc, s) => acc + s, 0),
    [collectionSizes]
  );

  const activeCollectionsCount = useMemo(
    () => BACKUP_COLLECTIONS.filter((c) => (cloudData[c.id]?.length || 0) > 0).length,
    [cloudData]
  );

  const selectedRecordsCount = useMemo(
    () => selectedIds.reduce((acc, id) => acc + (cloudData[id]?.length || 0), 0),
    [selectedIds, cloudData]
  );

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BACKUP_COLLECTIONS.filter((c) => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, searchQuery]);

  const healthReport = useMemo(() => runDataHealthScan(cloudData), [cloudData]);

  const reminderState = useMemo(() => {
    const latest = history[0];
    if (!latest) {
      return {
        label: 'لم يُنفَّذ أي نسخ بعد',
        daysAgo: null as number | null,
        overdue: true,
      };
    }
    const diffMs = Date.now() - new Date(latest.timestamp).getTime();
    const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const maxDays = CADENCE_DAYS[cadence].days;
    return {
      label: daysAgo === 0 ? 'مُحدَّث (اليوم)' : `منذ ${daysAgo} يوم`,
      daysAgo,
      overdue: daysAgo >= maxDays,
    };
  }, [history, cadence]);

  // Selection helpers
  const toggleCollection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(BACKUP_COLLECTIONS.map((c) => c.id));
  const selectNone = () => setSelectedIds([]);
  const selectCoreOnly = () =>
    setSelectedIds(BACKUP_COLLECTIONS.filter((c) => c.coreModule).map((c) => c.id));

  // Export JSON
  const handleExportJson = async (targetIds: string[] = selectedIds, silent = false) => {
    if (targetIds.length === 0) {
      setStatus({ type: 'error', message: 'يرجى تحديد قسم واحد على الأقل للتصدير.' });
      return;
    }
    if (!silent) setBusyAction('export_json');
    try {
      const activeUid = auth.currentUser?.uid || authUid;
      const selectedMetas = BACKUP_COLLECTIONS.filter((c) => targetIds.includes(c.id));
      const collectionsPayload: Record<string, any[]> = {};
      let total = 0;

      const fetched = await Promise.all(
        selectedMetas.map(async (meta) => ({
          id: meta.id,
          rows: await fetchCollectionHybrid(meta, schoolId, activeUid),
        }))
      );

      for (const { id, rows } of fetched) {
        collectionsPayload[id] = rows;
        total += rows.length;
      }

      const fullPayload = {
        _meta: {
          version: '2.1',
          schoolId,
          schoolName,
          directorate,
          academicYear,
          exportedAt: new Date().toISOString(),
          exportedBy: userProfile?.email || auth.currentUser?.email || 'lab_manager',
          collectionsCount: selectedMetas.length,
          totalRecords: total,
        },
        collections: collectionsPayload,
      };

      const jsonText = JSON.stringify(fullPayload, null, 2);
      const blob = new Blob([jsonText], { type: 'application/json' });
      const fileName = `Mekhbari_Backup_${new Date().toISOString().split('T')[0]}.json`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      recordBackupHistory({
        format: silent ? 'AUTO_SAFETY' : 'JSON',
        collectionsCount: selectedMetas.length,
        totalRecords: total,
        approxKb: Math.round(blob.size / 1024),
        fileName,
      });

      if (!silent) {
        setStatus({
          type: 'success',
          message: `تم تصدير ${total} سجل من ${selectedMetas.length} قسماً بصيغة JSON بنجاح.`,
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setStatus({ type: 'error', message: 'فشل تصدير ملف JSON. تحقق من الاتصال بالشبكة.' });
      }
      throw err;
    } finally {
      if (!silent) setBusyAction(null);
    }
  };

  // Export Multi-sheet Excel Workbook (.xlsx)
  const handleExportExcel = async (targetIds: string[] = selectedIds, silent = false) => {
    if (targetIds.length === 0) {
      setStatus({ type: 'error', message: 'يرجى تحديد قسم واحد على الأقل للتصدير.' });
      return;
    }
    if (!silent) setBusyAction('export_excel');
    try {
      const activeUid = auth.currentUser?.uid || authUid;
      const selectedMetas = BACKUP_COLLECTIONS.filter((c) => targetIds.includes(c.id));
      const freshData: Record<string, Record<string, any>[]> = {};

      const fetched = await Promise.all(
        selectedMetas.map(async (meta) => ({
          id: meta.id,
          rows: await fetchCollectionHybrid(meta, schoolId, activeUid),
        }))
      );
      for (const { id, rows } of fetched) {
        freshData[id] = rows;
      }

      const { workbook, exportedSheetsCount, totalRows } = buildExcelWorkbook(
        freshData,
        {
          schoolId,
          schoolName,
          directorate,
          academicYear,
          exportedBy: userProfile?.name || userProfile?.email || auth.currentUser?.email || 'مسؤول المخبر',
        },
        selectedMetas
      );

      const safeSchool = (schoolName || 'Mekhbari').replace(/[\\/?*[\]:\s]+/g, '_').slice(0, 24);
      const fileName = `Mekhbari_Excel_${safeSchool}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      const approxBytes = new Blob([JSON.stringify(freshData)]).size;
      recordBackupHistory({
        format: silent ? 'AUTO_SAFETY' : 'XLSX',
        collectionsCount: selectedMetas.length,
        totalRecords: totalRows,
        approxKb: Math.round(approxBytes / 1024),
        fileName,
      });

      if (!silent) {
        setStatus({
          type: 'success',
          message: `تم توليد مصنف Excel متكامل (${exportedSheetsCount} ورقة عمل · ${totalRows} سجل) بنجاح.`,
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setStatus({ type: 'error', message: 'فشل توليد ملف Excel. يرجى المحاولة مجدداً.' });
      }
      throw err;
    } finally {
      if (!silent) setBusyAction(null);
    }
  };

  // Single-collection quick export
  const handleSingleCollectionExport = (colMeta: BackupCollectionMeta, format: 'xlsx' | 'json') => {
    const items = cloudData[colMeta.id] || [];
    if (items.length === 0) {
      setStatus({ type: 'info', message: `قسم "${colMeta.label}" لا يحتوي على سجلات للتصدير.` });
      return;
    }

    if (format === 'xlsx') {
      exportSingleCollectionExcel(colMeta, items, schoolName);
      setStatus({ type: 'success', message: `تم تصدير جدول "${colMeta.label}" بصيغة Excel (${items.length} سجل).` });
    } else {
      const blob = new Blob([JSON.stringify({ [colMeta.id]: items }, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mekhbari_${colMeta.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: `تم تصدير "${colMeta.label}" بصيغة JSON (${items.length} سجل).` });
    }
  };

  // File parsing for import preview
  const processSelectedFile = async (file: File) => {
    setBusyAction('parsing_file');
    try {
      const parsed = await parseBackupFile(file);
      if (Object.keys(parsed.collections).length === 0) {
        setStatus({
          type: 'error',
          message: 'لم يتم العثور على أقسام بيانات صالحة داخل الملف المرفوع.',
        });
        return;
      }
      setPendingImport(parsed);
      setStatus(null);
    } catch (err) {
      console.error('Parse backup error:', err);
      setStatus({ type: 'error', message: 'تعذر قراءة الملف. تأكد أنه ملف JSON أو Excel (.xlsx) صالح.' });
    } finally {
      setBusyAction(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Commit parsed backup into Firestore + SQL API using chunked batches
  const executeSmartRestore = async () => {
    if (!pendingImport) return;
    setBusyAction('restoring');

    try {
      const firestoreOps: { colId: string; docId: string; payload: Record<string, any> }[] = [];
      const sqlSyncOps: {
        colMeta: BackupCollectionMeta;
        newItems: Record<string, any>[];
        updateItems: Record<string, any>[];
      }[] = [];

      const activeUid = auth.currentUser?.uid || authUid;
      const targetScope = getTargetScopes(schoolId, activeUid)[0] || schoolId;

      for (const [colId, items] of Object.entries(pendingImport.collections)) {
        const colMeta = BACKUP_COLLECTIONS.find((c) => c.id === colId);
        const existingIdSet = new Set((cloudData[colId] || []).map((d) => String(d.id)));
        const newForSql: Record<string, any>[] = [];
        const updateForSql: Record<string, any>[] = [];

        for (const item of items) {
          const { id, ...rawRest } = item;
          const rawId = id ? String(id).trim() : '';

          if (restoreStrategy === 'skip_existing' && rawId && existingIdSet.has(rawId)) {
            continue;
          }

          const finalId =
            restoreStrategy === 'append_new' || !rawId
              ? (typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
              : rawId;

          const cleanPayload = stripUndefined({
            ...rawRest,
            id: finalId,
            updatedAt: serverTimestamp(),
          });

          firestoreOps.push({ colId, docId: finalId, payload: cleanPayload });

          if (colMeta?.apiEndpoint) {
            const sqlRecord = stripUndefined({ ...rawRest, id: finalId });
            if (existingIdSet.has(finalId) && restoreStrategy === 'merge_by_id') {
              updateForSql.push(sqlRecord);
            } else {
              newForSql.push(sqlRecord);
            }
          }
        }

        if (colMeta?.apiEndpoint && (newForSql.length > 0 || updateForSql.length > 0)) {
          sqlSyncOps.push({ colMeta, newItems: newForSql, updateItems: updateForSql });
        }
      }

      if (firestoreOps.length === 0) {
        setStatus({
          type: 'info',
          message: 'لا توجد سجلات جديدة للاستعادة حسب الاستراتيجية المختارة (كل المعرّفات موجودة مسبقاً).',
        });
        setPendingImport(null);
        return;
      }

      const CHUNK_SIZE = 400;
      let processed = 0;
      setProgress({ processed: 0, total: firestoreOps.length, label: 'جاري كتابة السجلات في السحابة...' });

      for (let i = 0; i < firestoreOps.length; i += CHUNK_SIZE) {
        const chunk = firestoreOps.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        for (const op of chunk) {
          const colRef = getUserCollection(targetScope, op.colId);
          const docRef = doc(colRef, op.docId);
          batch.set(docRef, op.payload, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        setProgress({ processed, total: firestoreOps.length, label: 'جاري كتابة السجلات في السحابة...' });
      }

      // Best-effort sync to SQL backend endpoints for hybrid collections
      for (const { colMeta, newItems, updateItems } of sqlSyncOps) {
        if (!colMeta.apiEndpoint) continue;
        try {
          if (newItems.length > 0) {
            if (colMeta.supportsBulkPost) {
              for (let i = 0; i < newItems.length; i += 200) {
                await fetchWithAuth(`${colMeta.apiEndpoint}/bulk`, {
                  method: 'POST',
                  body: JSON.stringify({ items: newItems.slice(i, i + 200) }),
                });
              }
            } else {
              for (const item of newItems) {
                await fetchWithAuth(colMeta.apiEndpoint, {
                  method: 'POST',
                  body: JSON.stringify(item),
                });
              }
            }
          }
          if (updateItems.length > 0 && colMeta.supportsPut) {
            for (const item of updateItems) {
              await fetchWithAuth(`${colMeta.apiEndpoint}/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify(item),
              });
            }
          }
        } catch (sqlSyncErr) {
          console.warn(`SQL restore notice for ${colMeta.id}:`, sqlSyncErr);
        } finally {
          queryClient.invalidateQueries({ queryKey: [colMeta.id] });
        }
      }

      setPendingImport(null);
      setStatus({
        type: 'success',
        message: `تمت الاستعادة بنجاح: تم حفظ ${firestoreOps.length} سجل عبر ${Object.keys(pendingImport.collections).length} قسماً.`,
      });
      await scanCloudCollections();
    } catch (err) {
      console.error('Restore failed:', err);
      setStatus({ type: 'error', message: 'حدث خطأ أثناء استعادة البيانات. تأكد من صلاحيات الحساب والاتصال.' });
    } finally {
      setProgress(null);
      setBusyAction(null);
    }
  };

  // Safe Reset (Annual logs or Selected collections)
  const resetTargetCollections = useMemo(() => {
    if (resetMode === 'annual') {
      return BACKUP_COLLECTIONS.filter((c) => c.annualResetTarget);
    }
    if (resetMode === 'selected') {
      return BACKUP_COLLECTIONS.filter((c) => selectedIds.includes(c.id));
    }
    return [];
  }, [resetMode, selectedIds]);

  const resetTargetRecordCount = useMemo(
    () => resetTargetCollections.reduce((acc, c) => acc + (cloudData[c.id]?.length || 0), 0),
    [resetTargetCollections, cloudData]
  );

  const executeReset = async () => {
    if (resetTargetCollections.length === 0 || resetConfirmText.trim() !== 'تصفير') return;
    setBusyAction('resetting');
    try {
      const targetIds = resetTargetCollections.map((c) => c.id);
      const activeUid = auth.currentUser?.uid || authUid;

      if (autoBackupBeforeReset && resetTargetRecordCount > 0) {
        setProgress({ processed: 0, total: resetTargetRecordCount, label: 'توليد لقطة أمان تلقائية قبل التصفير...' });
        await handleExportExcel(targetIds, true);
        await handleExportJson(targetIds, true);
      }

      // 1. Delete from SQL endpoints if applicable
      for (const colMeta of resetTargetCollections) {
        if (!colMeta.apiEndpoint) continue;
        try {
          const items = cloudData[colMeta.id] || [];
          const ids = items.map((item) => String(item.id)).filter(Boolean);
          if (ids.length > 0) {
            if (colMeta.supportsBulkDelete) {
              for (let i = 0; i < ids.length; i += 200) {
                await fetchWithAuth(`${colMeta.apiEndpoint}/bulk-delete`, {
                  method: 'POST',
                  body: JSON.stringify({ ids: ids.slice(i, i + 200) }),
                });
              }
            } else {
              for (const id of ids) {
                await fetchWithAuth(`${colMeta.apiEndpoint}/${id}`, { method: 'DELETE' });
              }
            }
          }
        } catch (sqlErr) {
          console.warn(`SQL reset notice for ${colMeta.id}:`, sqlErr);
        }
        clearCollectionOfflineCaches(colMeta.id, schoolId, activeUid);
        queryClient.invalidateQueries({ queryKey: [colMeta.id] });
      }

      // 2. Delete from Firestore across all matching scopes
      const docsToDelete: any[] = [];
      const scopes = getTargetScopes(schoolId, activeUid);
      for (const colId of targetIds) {
        for (const scopeId of scopes) {
          try {
            const snap = await getDocs(getUserCollection(scopeId, colId));
            snap.docs.forEach((d) => docsToDelete.push(d.ref));
          } catch {}
        }
      }

      const CHUNK_SIZE = 400;
      let processed = 0;
      setProgress({ processed: 0, total: Math.max(docsToDelete.length, 1), label: 'جاري تصفير السجلات المحددة...' });

      for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
        const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((ref) => batch.delete(ref));
        await batch.commit();
        processed += chunk.length;
        setProgress({ processed, total: docsToDelete.length, label: 'جاري تصفير السجلات المحددة...' });
      }

      setResetMode(null);
      setResetConfirmText('');
      setStatus({
        type: 'success',
        message: `تم تصفير السجلات في ${resetTargetCollections.length} قسماً بنجاح${autoBackupBeforeReset && resetTargetRecordCount > 0 ? ' (مع حفظ نسخة أمان تلقائية).' : '.'}`,
      });
      await scanCloudCollections();
    } catch (err) {
      console.error('Reset failed:', err);
      setStatus({ type: 'error', message: 'فشلت عملية التصفير. يرجى مراجعة الصلاحيات.' });
    } finally {
      setProgress(null);
      setBusyAction(null);
    }
  };

  const isBusy = busyAction !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-8" dir="rtl">
      {/* Header & Top Action Contract */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pt-2 pb-6 border-b border-outline-variant/40 dark:border-outline/25">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center shrink-0">
              <Database size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface dark:text-dark-on-surface tracking-tight text-balance">
              مركز النسخ الاحتياطي والبيانات
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-secondary dark:text-dark-on-surface/70 font-medium">
            <span>{schoolName}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{academicYear}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-xs">{schoolId}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => scanCloudCollections()}
            disabled={scanning || isBusy}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/60 dark:border-outline/30 bg-surface-container-lowest dark:bg-dark-surface-container text-on-surface dark:text-dark-on-surface text-xs sm:text-sm font-bold hover:bg-surface-container dark:hover:bg-dark-surface transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
            <span>تحديث الفحص</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportJson()}
            disabled={isBusy || scanning || selectedIds.length === 0}
            className="px-4 py-2.5 rounded-xl border border-primary/25 dark:border-dark-primary/30 bg-primary/8 dark:bg-dark-primary/15 text-primary dark:text-dark-primary text-xs sm:text-sm font-bold hover:bg-primary/15 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {busyAction === 'export_json' ? <RefreshCw size={16} className="animate-spin" /> : <FileJson size={16} />}
            <span>تصدير JSON</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportExcel()}
            disabled={isBusy || scanning || selectedIds.length === 0}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {busyAction === 'export_excel' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            <span>تصدير Excel شامل (.xlsx)</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Banner when batching */}
      {progress && (
        <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 dark:bg-dark-primary/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-primary dark:text-dark-primary">
            <span className="flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              {progress.label}
            </span>
            <span className="font-mono tabular-nums">
              {progress.processed} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high dark:bg-dark-surface overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-dark-primary transition-all duration-200"
              style={{ width: `${Math.min(100, Math.round((progress.processed / Math.max(progress.total, 1)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Alert */}
      {status && (
        <div
          role="status"
          className={cn(
            'p-4 rounded-2xl border flex items-center justify-between gap-4 text-sm font-bold',
            status.type === 'success' && 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200',
            status.type === 'error' && 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200',
            status.type === 'info' && 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200'
          )}
        >
          <div className="flex items-center gap-3">
            {status.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : status.type === 'error' ? (
              <XCircle size={18} className="shrink-0" />
            ) : (
              <AlertTriangle size={18} className="shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="إغلاق الإشعار"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 4-Column Tabular KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-semibold text-secondary dark:text-dark-on-surface/65 flex items-center justify-between">
            <span>إجمالي السجلات السحابية</span>
            <Layers size={15} className="text-primary dark:text-dark-primary" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
            {scanning ? '...' : totalCloudRecords.toLocaleString('en-US')}
          </div>
          <div className="text-xs text-secondary/80 dark:text-dark-on-surface/55 tabular-nums">
            المحدد حالياً: {selectedRecordsCount.toLocaleString('en-US')} سجل
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-semibold text-secondary dark:text-dark-on-surface/65 flex items-center justify-between">
            <span>الأقسام النشطة</span>
            <Database size={15} className="text-primary dark:text-dark-primary" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
            {scanning ? '...' : `${activeCollectionsCount} / ${BACKUP_COLLECTIONS.length}`}
          </div>
          <div className="text-xs text-secondary/80 dark:text-dark-on-surface/55 tabular-nums">
            مشمول في التصدير: {selectedIds.length} قسماً
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-semibold text-secondary dark:text-dark-on-surface/65 flex items-center justify-between">
            <span>الحجم التقديري للبيانات</span>
            <HardDrive size={15} className="text-primary dark:text-dark-primary" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
            {scanning ? '...' : formatBytesKb(totalCloudBytes)}
          </div>
          <div className="text-xs text-secondary/80 dark:text-dark-on-surface/55">
            تغطية تشمل الجرد والسجلات
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-1.5">
          <div className="text-xs font-semibold text-secondary dark:text-dark-on-surface/65 flex items-center justify-between">
            <span>حالة النسخ الدوري</span>
            <CalendarClock
              size={15}
              className={reminderState.overdue ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}
            />
          </div>
          <div
            className={cn(
              'text-xl font-black truncate',
              reminderState.overdue ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
            )}
          >
            {reminderState.label}
          </div>
          <div className="text-xs text-secondary/80 dark:text-dark-on-surface/55">
            الدورية: {CADENCE_DAYS[cadence].label}
          </div>
        </div>
      </section>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Live Collection Scope Matrix */}
        <section className="lg:col-span-7 bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 dark:border-outline/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-on-surface dark:text-dark-on-surface">
                  نطاق النسخ ومصفوفة الأقسام السحابية
                </h2>
                <p className="text-xs text-secondary dark:text-dark-on-surface/65">
                  اختر الأقسام المشمولة في ملف Excel / JSON أو قم بتنزيل أي قسم بشكل منفرد.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container dark:bg-dark-surface hover:bg-surface-container-high font-bold text-on-surface dark:text-dark-on-surface transition-colors whitespace-nowrap cursor-pointer"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={selectCoreOnly}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container dark:bg-dark-surface hover:bg-surface-container-high font-bold text-on-surface dark:text-dark-on-surface transition-colors whitespace-nowrap cursor-pointer"
                >
                  الأساسية
                </button>
                <button
                  type="button"
                  onClick={selectNone}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container dark:bg-dark-surface hover:bg-surface-container-high font-bold text-secondary dark:text-dark-on-surface/70 transition-colors whitespace-nowrap cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>

            {/* Category Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-surface-container dark:bg-dark-surface rounded-xl overflow-x-auto">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                      categoryFilter === tab.id
                        ? 'bg-surface-container-lowest dark:bg-dark-surface-container text-primary dark:text-dark-primary shadow-xs'
                        : 'text-secondary dark:text-dark-on-surface/65 hover:text-on-surface'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن قسم..."
                  className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-outline-variant/50 dark:border-outline/30 bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* High-Density Collection Table */}
          <div className="divide-y divide-outline-variant/25 dark:divide-outline/15 max-h-[620px] overflow-y-auto">
            {scanning ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-4 animate-pulse">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-44 bg-surface-container-high dark:bg-dark-surface rounded" />
                    <div className="h-2.5 w-64 bg-surface-container dark:bg-dark-surface/60 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-surface-container dark:bg-dark-surface rounded" />
                </div>
              ))
            ) : filteredCollections.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Filter size={24} className="mx-auto text-secondary/50" />
                <p className="text-sm font-bold text-secondary dark:text-dark-on-surface/70">
                  لا توجد أقسام مطابقة لعبارة البحث الحالية.
                </p>
              </div>
            ) : (
              filteredCollections.map((colMeta) => {
                const isSelected = selectedIds.includes(colMeta.id);
                const count = cloudData[colMeta.id]?.length || 0;
                const bytes = collectionSizes[colMeta.id] || 0;

                return (
                  <div
                    key={colMeta.id}
                    className={cn(
                      'px-5 py-3 flex items-center justify-between gap-3 transition-colors hover:bg-surface-container-low/60 dark:hover:bg-dark-surface/40',
                      isSelected && 'bg-primary/[0.025] dark:bg-dark-primary/[0.04]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCollection(colMeta.id)}
                      className="flex items-start gap-3 text-right flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="mt-0.5 text-primary dark:text-dark-primary shrink-0">
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-outline" />}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-sm font-bold text-on-surface dark:text-dark-on-surface truncate">
                          {colMeta.label}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-secondary/75 dark:text-dark-on-surface/55">
                          <span className="font-mono">{colMeta.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[260px]">{colMeta.description}</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left min-w-[74px]">
                        <div className="text-sm font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
                          {count.toLocaleString('en-US')}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-secondary/70 dark:text-dark-on-surface/50">
                          {count > 0 ? formatBytesKb(bytes) : 'فارغ'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSingleCollectionExport(colMeta, 'xlsx')}
                          disabled={count === 0 || isBusy}
                          title={`تصدير ${colMeta.label} إلى Excel`}
                          className="p-2 rounded-lg border border-outline-variant/40 dark:border-outline/25 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSingleCollectionExport(colMeta, 'json')}
                          disabled={count === 0 || isBusy}
                          title={`تصدير ${colMeta.label} إلى JSON`}
                          className="p-2 rounded-lg border border-outline-variant/40 dark:border-outline/25 text-primary dark:text-dark-primary hover:bg-primary/10 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <FileJson size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right (5 cols): Smart Restore + Health Diagnostics + History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Import / Restore Panel */}
          <section className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-on-surface dark:text-dark-on-surface">
                الاستعادة الذكية من ملف (Excel أو JSON)
              </h2>
              <p className="text-xs text-secondary dark:text-dark-on-surface/65 leading-relaxed">
                ارفع ملف نسخة احتياطية بصيغة <span className="font-mono">.xlsx</span> أو{' '}
                <span className="font-mono">.json</span> لمعاينة التغييرات واختيار آلية الدمج قبل الكتابة.
              </p>
            </div>

            {!pendingImport ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'block border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer space-y-2.5',
                  isDragging
                    ? 'border-primary bg-primary/5 dark:border-dark-primary'
                    : 'border-outline-variant/60 dark:border-outline/30 hover:border-primary/50 hover:bg-surface-container-low/60 dark:hover:bg-dark-surface/40'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isBusy}
                />
                <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex items-center justify-center mx-auto">
                  {busyAction === 'parsing_file' ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <Upload size={20} />
                  )}
                </div>
                <div className="text-sm font-bold text-on-surface dark:text-dark-on-surface">
                  اسحب ملف النسخة الاحتياطية هنا أو اضغط للاختيار
                </div>
                <div className="text-[11px] text-secondary/75 dark:text-dark-on-surface/55">
                  يدعم مصنفات Excel المتعددة الأوراق (.xlsx / .xls) وملفات JSON
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/40 dark:border-outline/25 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-black text-on-surface dark:text-dark-on-surface truncate">
                      {pendingImport.fileName}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-secondary dark:text-dark-on-surface/65 tabular-nums">
                      <span>{pendingImport.format === 'excel' ? 'مصنف Excel' : 'ملف JSON'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pendingImport.totalRecords.toLocaleString('en-US')} سجل</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatBytesKb(pendingImport.fileSizeBytes)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingImport(null)}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-secondary cursor-pointer"
                    title="إلغاء الملف"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="border border-outline-variant/30 dark:border-outline/20 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-surface-container dark:bg-dark-surface text-secondary dark:text-dark-on-surface/70">
                      <tr>
                        <th className="px-3 py-2 font-bold">القسم المطابق</th>
                        <th className="px-3 py-2 font-bold text-center">في الملف</th>
                        <th className="px-3 py-2 font-bold text-center">في السحابة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 dark:divide-outline/15">
                      {Object.entries(pendingImport.collections).map(([colId, rows]) => {
                        const meta = BACKUP_COLLECTIONS.find((c) => c.id === colId);
                        const liveCount = cloudData[colId]?.length || 0;
                        return (
                          <tr key={colId}>
                            <td className="px-3 py-2 font-bold text-on-surface dark:text-dark-on-surface">
                              {meta?.label || colId}
                            </td>
                            <td className="px-3 py-2 text-center font-mono tabular-nums text-primary dark:text-dark-primary font-bold">
                              {rows.length}
                            </td>
                            <td className="px-3 py-2 text-center font-mono tabular-nums text-secondary dark:text-dark-on-surface/65">
                              {liveCount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pendingImport.unknownSheets.length > 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    تم تجاهل أوراق غير مطابقة: {pendingImport.unknownSheets.join('، ')}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-bold text-on-surface dark:text-dark-on-surface">
                    استراتيجية الاستعادة:
                  </div>
                  <div className="space-y-1.5">
                    {[
                      {
                        id: 'merge_by_id' as RestoreStrategy,
                        title: 'دمج ذكي بالمعرّف (موصى به)',
                        desc: 'يحدّث السجلات المطابقة ويضيف الجديدة دون تكرار.',
                      },
                      {
                        id: 'skip_existing' as RestoreStrategy,
                        title: 'استعادة السجلات المفقودة فقط',
                        desc: 'يتجاهل أي سجل موجود حالياً في السحابة.',
                      },
                      {
                        id: 'append_new' as RestoreStrategy,
                        title: 'إضافة كمدخلات جديدة كلياً',
                        desc: 'ينشئ معرّفات جديدة دون المساس بالبيانات الحالية.',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors text-xs',
                          restoreStrategy === opt.id
                            ? 'border-primary bg-primary/5 dark:border-dark-primary dark:bg-dark-primary/10'
                            : 'border-outline-variant/35 dark:border-outline/20 hover:bg-surface-container-low/60'
                        )}
                      >
                        <input
                          type="radio"
                          name="restoreStrategy"
                          checked={restoreStrategy === opt.id}
                          onChange={() => setRestoreStrategy(opt.id)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="font-bold text-on-surface dark:text-dark-on-surface">{opt.title}</div>
                          <div className="text-[11px] text-secondary/75 dark:text-dark-on-surface/55">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={executeSmartRestore}
                    disabled={isBusy}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {busyAction === 'restoring' ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>تنفيذ الاستعادة الآن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingImport(null)}
                    disabled={isBusy}
                    className="py-2.5 px-4 rounded-xl border border-outline-variant/50 dark:border-outline/30 text-xs sm:text-sm font-bold text-secondary hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Smart Data Health Diagnostics */}
          <section className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h2 className="text-base font-black text-on-surface dark:text-dark-on-surface">
                  فحص سلامة وجودة البيانات
                </h2>
                <p className="text-xs text-secondary dark:text-dark-on-surface/65">
                  رصد التكرارات والمواد المنتهية الصلاحية قبل الأرشفة.
                </p>
              </div>
              {healthReport.totalFindings > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHealthDetails((v) => !v)}
                  className="text-xs font-bold text-primary dark:text-dark-primary hover:underline whitespace-nowrap cursor-pointer"
                >
                  {showHealthDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                </button>
              )}
            </div>

            {scanning ? (
              <div className="h-16 rounded-xl bg-surface-container/60 dark:bg-dark-surface animate-pulse" />
            ) : healthReport.totalFindings === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center gap-3 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                <ShieldCheck size={18} className="shrink-0" />
                <span>لم يتم رصد تكرارات أو مواد منتهية الصلاحية أو سجلات ناقصة.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/25">
                    <div className="text-secondary/75 dark:text-dark-on-surface/60">مواد منتهية الصلاحية</div>
                    <div className="text-lg font-black font-mono tabular-nums text-red-700 dark:text-red-400">
                      {healthReport.expiredChemicals.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/25">
                    <div className="text-secondary/75 dark:text-dark-on-surface/60">رصيد منعدم (صفر)</div>
                    <div className="text-lg font-black font-mono tabular-nums text-amber-700 dark:text-amber-400">
                      {healthReport.zeroStockChemicals.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/25">
                    <div className="text-secondary/75 dark:text-dark-on-surface/60">أسماء مكررة</div>
                    <div className="text-lg font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
                      {healthReport.duplicateChemicals.length + healthReport.duplicateEquipment.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/25">
                    <div className="text-secondary/75 dark:text-dark-on-surface/60">بطاقات ناقصة الحقول</div>
                    <div className="text-lg font-black font-mono tabular-nums text-on-surface dark:text-dark-on-surface">
                      {healthReport.incompleteEquipment.length + healthReport.incompleteTeachers.length}
                    </div>
                  </div>
                </div>

                {showHealthDetails && (
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface text-xs space-y-2 max-h-44 overflow-y-auto border border-outline-variant/30">
                    {healthReport.expiredChemicals.length > 0 && (
                      <div>
                        <span className="font-bold text-red-700 dark:text-red-400">منتهية الصلاحية: </span>
                        <span className="text-secondary dark:text-dark-on-surface/75">
                          {healthReport.expiredChemicals.slice(0, 6).map((c) => `${c.name} (${c.expiryDate})`).join('، ')}
                        </span>
                      </div>
                    )}
                    {healthReport.zeroStockChemicals.length > 0 && (
                      <div>
                        <span className="font-bold text-amber-700 dark:text-amber-400">مخزون منعدم: </span>
                        <span className="text-secondary dark:text-dark-on-surface/75">
                          {healthReport.zeroStockChemicals.slice(0, 6).join('، ')}
                        </span>
                      </div>
                    )}
                    {(healthReport.duplicateChemicals.length > 0 || healthReport.duplicateEquipment.length > 0) && (
                      <div>
                        <span className="font-bold text-on-surface dark:text-dark-on-surface">أسماء مكررة: </span>
                        <span className="text-secondary dark:text-dark-on-surface/75">
                          {[...healthReport.duplicateChemicals, ...healthReport.duplicateEquipment].slice(0, 6).join('، ')}
                        </span>
                      </div>
                    )}
                    {(healthReport.incompleteEquipment.length > 0 || healthReport.incompleteTeachers.length > 0) && (
                      <div>
                        <span className="font-bold text-on-surface dark:text-dark-on-surface">بطاقات ناقصة: </span>
                        <span className="text-secondary dark:text-dark-on-surface/75">
                          {[...healthReport.incompleteEquipment, ...healthReport.incompleteTeachers].slice(0, 6).join('، ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Local Backup History & Cadence */}
          <section className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/25 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History size={17} className="text-primary dark:text-dark-primary" />
                <h2 className="text-base font-black text-on-surface dark:text-dark-on-surface">
                  سجل النسخ الاحتياطي والتذكير
                </h2>
              </div>
              <select
                value={cadence}
                onChange={(e) => handleCadenceChange(e.target.value as ReminderCadence)}
                aria-label="وتيرة التذكير بالنسخ الاحتياطي"
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant/50 dark:border-outline/30 bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface cursor-pointer"
              >
                <option value="weekly">تذكير أسبوعي</option>
                <option value="monthly">تذكير شهري</option>
                <option value="termly">تذكير فصلي</option>
              </select>
            </div>

            {history.length === 0 ? (
              <div className="py-5 text-center text-xs text-secondary/70 dark:text-dark-on-surface/55 space-y-2">
                <p>لا توجد عمليات تصدير مسجلة على هذا الجهاز بعد.</p>
                <button
                  type="button"
                  onClick={() => handleExportExcel()}
                  disabled={isBusy || scanning}
                  className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-dark-primary font-bold hover:bg-primary/15 transition-colors cursor-pointer"
                >
                  إنشاء أول نسخة Excel الآن
                </button>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/25 dark:divide-outline/15">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-bold text-on-surface dark:text-dark-on-surface truncate">
                        {item.fileName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-secondary/75 dark:text-dark-on-surface/55 tabular-nums">
                        <span>{item.format === 'AUTO_SAFETY' ? 'لقطة أمان' : item.format}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatArabicDate(item.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-left font-mono tabular-nums text-[11px] text-secondary dark:text-dark-on-surface/70 shrink-0">
                      {item.totalRecords} سجل
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Annual & Selective Reset Zone */}
      <section className="bg-surface-container-lowest dark:bg-dark-surface-container border border-red-200/80 dark:border-red-900/40 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-lg font-black text-red-800 dark:text-red-300">
              إدارة التصفير السنوي وتهيئة الموسم الجديد
            </h2>
            <p className="text-xs sm:text-sm text-secondary dark:text-dark-on-surface/70">
              يمكنك تصفير سجلات الأنشطة السنوية فقط مع الإبقاء على الجرد الأساسي (العتاد والمواد والأساتذة)، أو تصفير الأقسام المحددة مع توليد لقطة أمان تلقائية.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-outline-variant/40 dark:border-outline/25 bg-surface-container-low/60 dark:bg-dark-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-black text-on-surface dark:text-dark-on-surface">
                تصفير الأنشطة السنوية فقط (آمن للمخزون)
              </div>
              <p className="text-xs text-secondary/80 dark:text-dark-on-surface/60">
                يحذف التقارير اليومية، سجل التجارب، طلبات الأنشطة والإعارة، والحوادث؛ ويحافظ على العتاد والزجاجيات والمواد والأساتذة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetConfirmText('');
                setResetMode('annual');
              }}
              disabled={isBusy || scanning}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={15} />
              <span>تصفير سنوي ذكي</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-red-200/70 dark:border-red-900/35 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-black text-red-800 dark:text-red-300">
                تصفير الأقسام المحددة ({selectedIds.length} قسماً)
              </div>
              <p className="text-xs text-secondary/80 dark:text-dark-on-surface/60">
                حذف دائم للسجلات في الأقسام المختارة من الجدول أعلاه ({selectedRecordsCount.toLocaleString('en-US')} سجل).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetConfirmText('');
                setResetMode('selected');
              }}
              disabled={isBusy || scanning || selectedIds.length === 0}
              className="px-4 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={15} />
              <span>تصفير المحدد</span>
            </button>
          </div>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {resetMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant/40 dark:border-outline/30 rounded-2xl shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface dark:text-dark-on-surface">
                    {resetMode === 'annual' ? 'تأكيد التصفير السنوي للأنشطة' : 'تأكيد حذف الأقسام المحددة'}
                  </h3>
                  <p className="text-xs text-secondary dark:text-dark-on-surface/65 tabular-nums">
                    سيتم مسح {resetTargetRecordCount.toLocaleString('en-US')} سجل من {resetTargetCollections.length} قسماً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetMode(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface border border-outline-variant/30 max-h-36 overflow-y-auto text-xs space-y-1">
              {resetTargetCollections.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface dark:text-dark-on-surface">{c.label}</span>
                  <span className="font-mono tabular-nums text-secondary dark:text-dark-on-surface/65">
                    {(cloudData[c.id]?.length || 0).toLocaleString('en-US')} سجل
                  </span>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/25 bg-primary/5 dark:bg-dark-primary/10 text-xs font-bold text-primary dark:text-dark-primary cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackupBeforeReset}
                onChange={(e) => setAutoBackupBeforeReset(e.target.checked)}
                className="accent-primary"
              />
              <span>تنزيل نسخة أمان تلقائية (Excel + JSON) قبل تنفيذ التصفير</span>
            </label>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface dark:text-dark-on-surface">
                اكتب كلمة <span className="text-error font-black">تصفير</span> للتأكيد النهائي:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="تصفير"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 dark:border-outline/30 bg-surface dark:bg-dark-surface text-sm font-bold text-on-surface dark:text-dark-on-surface focus:outline-none focus:border-error"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={executeReset}
                disabled={resetConfirmText.trim() !== 'تصفير' || isBusy}
                className="flex-1 py-2.5 px-4 rounded-xl bg-error text-on-error text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {busyAction === 'resetting' ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>تأكيد وتصفير البيانات</span>
              </button>
              <button
                type="button"
                onClick={() => setResetMode(null)}
                disabled={isBusy}
                className="py-2.5 px-4 rounded-xl border border-outline-variant/50 dark:border-outline/30 text-xs sm:text-sm font-bold text-secondary hover:bg-surface-container cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
