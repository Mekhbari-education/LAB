import React, { useMemo, useState } from 'react';
import {
  School,
  Bell,
  MessageSquare,
  ShoppingCart,
  ScrollText,
  Database,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Send,
  X,
  Eye,
  Save,
  Loader2,
  AlertTriangle,
  Sparkles,
  HardDriveDownload,
  Terminal,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, PROJECT_OWNER_EMAIL } from '../../firebase';
import { ROLE_CONFIGS } from '../../context/UserRoleContext';
import {
  FeatureFlagKey,
  GlobalSystemConfig,
} from '../../context/SystemConfigContext';
import { cn } from '../../lib/utils';
import {
  AIInsightsResponse,
  Announcement,
  AnnouncementScope,
  DiagnosticLogItem,
  OwnerAuditLogItem,
  PurchaseOrder,
  SchoolHealthScore,
  SupportTicket,
  SystemActivityLog,
  WORKSPACE_ROLE_KEYS,
  downloadCSV,
  downloadJSON,
  formatDateTime,
  getTimestampMs,
} from './adminTypes';
import { recordOwnerAudit } from './adminAudit';

interface AdminSystemAndAuditProps {
  workspace: 'schools' | 'announcements' | 'tickets' | 'purchases' | 'audit' | 'flags' | 'explorer';
  schoolHealthScores: SchoolHealthScore[];
  onInspectSchoolScore: (school: SchoolHealthScore) => void;
  announcements: Announcement[];
  tickets: SupportTicket[];
  purchases: PurchaseOrder[];
  activityLogs: SystemActivityLog[];
  diagnosticLogs: DiagnosticLogItem[];
  ownerAuditLogs: OwnerAuditLogItem[];
  isLoadingLogs: boolean;
  logsError: string | null;
  onRefreshLogs: () => void;
  systemConfig: GlobalSystemConfig;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ROOT_COLLECTIONS = [
  'users',
  'settings',
  'registered_schools',
  'system_announcements',
  'system_config',
  'support_tickets',
  'diagnostics_log',
  'admin_audit_logs',
  'admins',
  'public_legislation',
  'purchase_requests',
] as const;

const SCHOOL_SUBCOLLECTIONS = [
  'chemicals',
  'equipment',
  'safety_incidents',
  'reports',
  'experiment_logs',
  'logs',
  'purchase_orders',
] as const;

export default function AdminSystemAndAudit({
  workspace,
  schoolHealthScores,
  onInspectSchoolScore,
  announcements,
  tickets,
  purchases,
  activityLogs,
  diagnosticLogs,
  ownerAuditLogs,
  isLoadingLogs,
  logsError,
  onRefreshLogs,
  systemConfig,
  onShowToast,
}: AdminSystemAndAuditProps) {
  // Schools filters
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolCycleFilter, setSchoolCycleFilter] = useState<'all' | 'ثانوي' | 'متوسط' | 'ابتدائي'>('all');

  // Announcements state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('pedagogical');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('normal');
  const [annScope, setAnnScope] = useState<AnnouncementScope>('all');
  const [annTargets, setAnnTargets] = useState<string[]>([]);
  const [annExpiresAt, setAnnExpiresAt] = useState('');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Tickets state
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplyingTicket, setIsReplyingTicket] = useState(false);

  // Purchases state
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<string>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);

  // Audit & Diagnostics state
  const [auditSubTab, setAuditSubTab] = useState<'activity' | 'diagnostics' | 'owner'>('activity');
  const [logsSearch, setLogsSearch] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('all');
  const [logsModuleFilter, setLogsModuleFilter] = useState('all');
  const [inspectedPayload, setInspectedPayload] = useState<{ title: string; data: unknown } | null>(null);
  const [aiScanResult, setAiScanResult] = useState<AIInsightsResponse | null>(null);
  const [isScanningAI, setIsScanningAI] = useState(false);

  // Feature flags & Maintenance draft state
  const [flagDraft, setFlagDraft] = useState<GlobalSystemConfig>(systemConfig);
  const [hasUnsavedFlags, setHasUnsavedFlags] = useState(false);
  const [isSavingFlags, setIsSavingFlags] = useState(false);

  const effectiveFlags = hasUnsavedFlags ? flagDraft : systemConfig;

  // Firestore Explorer state
  const [explorerMode, setExplorerMode] = useState<'root' | 'school'>('root');
  const [selectedRootCol, setSelectedRootCol] = useState<string>('users');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schoolHealthScores[0]?.id || ''
  );
  const [selectedSchoolSubCol, setSelectedSchoolSubCol] = useState<string>('chemicals');
  const [explorerDocs, setExplorerDocs] = useState<{ id: string; data: Record<string, any> }[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState(false);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerError, setExplorerError] = useState<string | null>(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);

  // --- Computed Lists ---
  const wilayaOptions = useMemo(() => {
    const s = new Set<string>();
    schoolHealthScores.forEach((sch) => {
      if (sch.wilaya && sch.wilaya !== 'غير محددة') s.add(sch.wilaya);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [schoolHealthScores]);

  const filteredSchools = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    return schoolHealthScores.filter((sch) => {
      if (schoolCycleFilter !== 'all' && sch.cycle !== schoolCycleFilter) return false;
      if (!q) return true;
      return (
        sch.name.toLowerCase().includes(q) ||
        sch.wilaya.toLowerCase().includes(q) ||
        sch.commune.toLowerCase().includes(q)
      );
    });
  }, [schoolHealthScores, schoolSearch, schoolCycleFilter]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketStatusFilter === 'all') return true;
      if (ticketStatusFilter === 'open') {
        return t.status === 'new' || t.status === 'open' || t.status === 'pending';
      }
      return t.status === ticketStatusFilter;
    });
  }, [tickets, ticketStatusFilter]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (purchaseStatusFilter === 'all') return true;
      return p.status === purchaseStatusFilter;
    });
  }, [purchases, purchaseStatusFilter]);

  const uniqueActions = useMemo(
    () => Array.from(new Set(activityLogs.map((l) => l.action).filter(Boolean))) as string[],
    [activityLogs]
  );
  const uniqueModules = useMemo(
    () => Array.from(new Set(activityLogs.map((l) => l.module).filter(Boolean))) as string[],
    [activityLogs]
  );

  const filteredActivityLogs = useMemo(() => {
    const q = logsSearch.trim().toLowerCase();
    return activityLogs.filter((l) => {
      if (logsActionFilter !== 'all' && l.action !== logsActionFilter) return false;
      if (logsModuleFilter !== 'all' && l.module !== logsModuleFilter) return false;
      if (!q) return true;
      return (
        (l.userName || '').toLowerCase().includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q) ||
        (l.schoolId || '').toLowerCase().includes(q)
      );
    });
  }, [activityLogs, logsSearch, logsActionFilter, logsModuleFilter]);

  const filteredDiagnosticLogs = useMemo(() => {
    const q = logsSearch.trim().toLowerCase();
    if (!q) return diagnosticLogs;
    return diagnosticLogs.filter(
      (d) =>
        (d.testBy || '').toLowerCase().includes(q) ||
        (d.message || '').toLowerCase().includes(q) ||
        (d.databaseId || '').toLowerCase().includes(q)
    );
  }, [diagnosticLogs, logsSearch]);

  const filteredOwnerAuditLogs = useMemo(() => {
    const q = logsSearch.trim().toLowerCase();
    if (!q) return ownerAuditLogs;
    return ownerAuditLogs.filter(
      (o) =>
        o.action.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        (o.actorEmail || '').toLowerCase().includes(q)
    );
  }, [ownerAuditLogs, logsSearch]);

  const filteredExplorerDocs = useMemo(() => {
    const q = explorerSearch.trim().toLowerCase();
    if (!q) return explorerDocs;
    return explorerDocs.filter(
      (d) => d.id.toLowerCase().includes(q) || JSON.stringify(d.data).toLowerCase().includes(q)
    );
  }, [explorerDocs, explorerSearch]);

  // --- Handlers ---
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      onShowToast('يرجى إدخال عنوان ومحتوى الإعلان.', 'error');
      return;
    }
    if (annScope !== 'all' && annTargets.length === 0) {
      onShowToast('يرجى تحديد فئة مستهدفة واحدة على الأقل.', 'error');
      return;
    }
    setIsPostingAnn(true);
    try {
      const ref = doc(collection(db, 'system_announcements'));
      await setDoc(ref, {
        title: annTitle.trim(),
        message: annMessage.trim(),
        category: annCategory,
        priority: annPriority,
        targetScope: annScope,
        targetValues: annScope === 'all' ? [] : annTargets,
        expiresAt: annExpiresAt || '',
        authorName: auth.currentUser?.displayName || 'الإدارة المركزية للمنصة',
        createdAt: serverTimestamp(),
        active: true,
      });
      await recordOwnerAudit({
        action: 'ANNOUNCEMENT_PUBLISH',
        targetType: 'system_announcements',
        targetIds: [ref.id],
        summary: `نشر إعلان "${annTitle.trim()}" (${annScope})`,
      });
      onShowToast('تم نشر التعميم وتوجيهه للفئة المحددة.', 'success');
      setAnnTitle('');
      setAnnMessage('');
      setAnnTargets([]);
      setAnnExpiresAt('');
      setAnnScope('all');
    } catch (err: any) {
      onShowToast('فشل نشر التعميم: ' + (err?.message || ''), 'error');
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleToggleAnnActive = async (ann: Announcement) => {
    const nextActive = ann.active === false;
    await updateDoc(doc(db, 'system_announcements', ann.id), { active: nextActive });
    await recordOwnerAudit({
      action: 'ANNOUNCEMENT_TOGGLE',
      targetType: 'system_announcements',
      targetIds: [ann.id],
      summary: `${nextActive ? 'تفعيل' : 'إيقاف'} التعميم "${ann.title}"`,
    });
    onShowToast(nextActive ? 'تم تفعيل الإعلان.' : 'تم إيقاف عرض الإعلان.', 'info');
  };

  const handleDeleteAnn = async (ann: Announcement) => {
    await deleteDoc(doc(db, 'system_announcements', ann.id));
    await recordOwnerAudit({
      action: 'ANNOUNCEMENT_DELETE',
      targetType: 'system_announcements',
      targetIds: [ann.id],
      summary: `حذف التعميم "${ann.title}"`,
    });
    onShowToast('تم حذف التعميم.', 'success');
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    setIsReplyingTicket(true);
    try {
      await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
        adminReply: ticketReplyText.trim(),
        adminRepliedAt: serverTimestamp(),
        adminName: auth.currentUser?.displayName || 'مالك المنصة',
        status: 'resolved',
      });
      await recordOwnerAudit({
        action: 'TICKET_REPLY',
        targetType: 'support_tickets',
        targetIds: [selectedTicket.id],
        summary: `الرد على التذكرة وإغلاقها (${selectedTicket.title || selectedTicket.id})`,
      });
      onShowToast('تم إرسال الرد الرسمي واعتماد حل التذكرة.', 'success');
      setSelectedTicket(null);
      setTicketReplyText('');
    } catch (err: any) {
      onShowToast('فشل إرسال الرد: ' + (err?.message || ''), 'error');
    } finally {
      setIsReplyingTicket(false);
    }
  };

  const handleSaveSystemFlags = async () => {
    setIsSavingFlags(true);
    try {
      await setDoc(
        doc(db, 'system_config', 'global'),
        {
          maintenanceMode: effectiveFlags.maintenanceMode,
          maintenanceMessage: effectiveFlags.maintenanceMessage,
          maintenanceEta: effectiveFlags.maintenanceEta,
          readOnlyMode: effectiveFlags.readOnlyMode,
          enforceStatutorySetup: effectiveFlags.enforceStatutorySetup,
          features: effectiveFlags.features,
          updatedBy: PROJECT_OWNER_EMAIL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await recordOwnerAudit({
        action: 'SYSTEM_FLAGS_UPDATE',
        targetType: 'system_config',
        targetIds: ['global'],
        summary: `تحديث إعدادات النظام (وضع الصيانة: ${effectiveFlags.maintenanceMode ? 'مفعل' : 'متوقف'})`,
        details: {
          maintenanceMode: effectiveFlags.maintenanceMode,
          readOnlyMode: effectiveFlags.readOnlyMode,
          features: effectiveFlags.features,
        },
      });
      setHasUnsavedFlags(false);
      onShowToast('تم حفظ وتعميم إعدادات النظام على جميع المستخدمين فوراً.', 'success');
    } catch (err: any) {
      onShowToast('فشل حفظ الإعدادات: ' + (err?.message || ''), 'error');
    } finally {
      setIsSavingFlags(false);
    }
  };

  const handleRunLogAnomalyScan = async () => {
    setIsScanningAI(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('رمز المصادقة غير متوفر.');
      const res = await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          focus: 'audit_and_diagnostics_anomaly_scan',
          activityLogsSample: activityLogs.slice(0, 35).map((l) => ({
            action: l.action,
            module: l.module,
            timestamp: getTimestampMs(l.timestamp),
            details: (l.details || '').slice(0, 120),
          })),
          diagnosticsSample: diagnosticLogs.slice(0, 25).map((d) => ({
            message: d.message,
            timestamp: getTimestampMs(d.timestamp),
          })),
          ownerAuditSample: ownerAuditLogs.slice(0, 15).map((o) => ({
            action: o.action,
            summary: o.summary,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'فشل فحص السجلات.');
      setAiScanResult(data as AIInsightsResponse);
    } catch (err: any) {
      onShowToast(err?.message || 'تعذر تشغيل فحص السجلات الذكي.', 'error');
    } finally {
      setIsScanningAI(false);
    }
  };

  const handleLoadExplorerCollection = async () => {
    setIsLoadingExplorer(true);
    setExplorerError(null);
    try {
      const ref =
        explorerMode === 'root'
          ? query(collection(db, selectedRootCol), limit(80))
          : query(
              collection(db, 'schools', selectedSchoolId.trim(), selectedSchoolSubCol),
              limit(80)
            );
      if (explorerMode === 'school' && !selectedSchoolId.trim()) {
        throw new Error('يرجى إدخال أو اختيار معرف المؤسسة schoolId.');
      }
      const snap = await getDocs(ref);
      setExplorerDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() })));
    } catch (err: any) {
      setExplorerError(err?.message || 'تعذر قراءة المجموعة المحددة.');
      setExplorerDocs([]);
    } finally {
      setIsLoadingExplorer(false);
    }
  };

  const handleExportFullSnapshot = async () => {
    setIsExportingSnapshot(true);
    try {
      const snapshot: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        exportedBy: PROJECT_OWNER_EMAIL,
        collections: {},
      };
      await Promise.all(
        ROOT_COLLECTIONS.map(async (colName) => {
          try {
            const snap = await getDocs(query(collection(db, colName), limit(250)));
            snapshot.collections[colName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          } catch {
            snapshot.collections[colName] = [];
          }
        })
      );
      downloadJSON(
        `labeducationdz_snapshot_${new Date().toISOString().split('T')[0]}.json`,
        snapshot
      );
      await recordOwnerAudit({
        action: 'SNAPSHOT_BACKUP_EXPORT',
        targetType: 'firestore',
        summary: 'تصدير نسخة احتياطية شاملة بصيغة JSON للمجموعات المركزية',
      });
      onShowToast('تم تنزيل النسخة الاحتياطية JSON بنجاح.', 'success');
    } catch (err: any) {
      onShowToast('فشل تصدير النسخة الاحتياطية: ' + (err?.message || ''), 'error');
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  // ==================== SCHOOLS WORKSPACE ====================
  if (workspace === 'schools') {
    return (
      <div className="space-y-5">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
              <input
                type="text"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="بحث باسم المؤسسة أو الولاية أو البلدية..."
                className="w-full ps-8 pe-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
              />
            </div>
            <select
              value={schoolCycleFilter}
              onChange={(e) => setSchoolCycleFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
            >
              <option value="all">جميع الأطوار</option>
              <option value="ثانوي">التعليم الثانوي</option>
              <option value="متوسط">التعليم المتوسط</option>
              <option value="ابتدائي">التعليم الابتدائي</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              downloadCSV(
                `schools_directory_${new Date().toISOString().split('T')[0]}.csv`,
                ['المعرف', 'المؤسسة', 'الولاية', 'البلدية', 'الطور', 'الطاقم', 'مؤشر الصحة'],
                filteredSchools.map((s) => [
                  s.id,
                  s.name,
                  s.wilaya,
                  s.commune,
                  s.cycle,
                  s.staffCount,
                  s.totalScore,
                ])
              );
              onShowToast('تم تصدير دليل المؤسسات بصيغة CSV.', 'success');
            }}
            className="px-3.5 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold text-primary hover:border-primary/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>تصدير CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSchools.length === 0 ? (
            <div className="col-span-full bg-surface-container-lowest p-12 rounded-xl border border-outline/15 text-center text-xs text-on-surface/50">
              لا توجد مؤسسات مطابقة لمعايير البحث.
            </div>
          ) : (
            filteredSchools.map((sch) => (
              <button
                key={sch.id}
                type="button"
                onClick={() => onInspectSchoolScore(sch)}
                className="text-start bg-surface-container-lowest p-4 rounded-xl border border-outline/15 hover:border-primary/40 transition-colors space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <School size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-primary truncate">{sch.name}</h3>
                      <p className="text-[11px] text-on-surface/65 truncate">
                        {sch.wilaya} · {sch.cycle}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs tabular-nums text-primary">
                    {sch.totalScore}/100
                  </span>
                </div>
                <div className="pt-2 border-t border-outline/10 flex items-center justify-between text-[11px] text-on-surface/70 tabular-nums">
                  <span>{sch.staffCount} موظفين</span>
                  <span>
                    {sch.chemicalsCount} كواشف · {sch.equipmentCount} تجهيز
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ==================== TARGETED ANNOUNCEMENTS WORKSPACE ====================
  if (workspace === 'announcements') {
    const scopeOptions =
      annScope === 'wilaya'
        ? wilayaOptions
        : annScope === 'cycle'
        ? ['متوسط', 'ثانوي', 'ابتدائي']
        : annScope === 'role'
        ? WORKSPACE_ROLE_KEYS.map((rk) => rk)
        : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={handleCreateAnnouncement}
          className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4 self-start"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-outline/10">
            <Bell size={18} className="text-primary" />
            <h2 className="text-sm font-black text-primary">
              إصدار تعميم موجه · Targeted Announcement
            </h2>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface/80">عنوان التعميم</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="مثال: تحديث نماذج الجرد السنوي 2026"
              className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface/80">التصنيف</label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
              >
                <option value="pedagogical">بيداغوجي</option>
                <option value="technical">تقني</option>
                <option value="update">تحديث منصة</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface/80">الأولوية</label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
              >
                <option value="normal">عادية · Normal</option>
                <option value="high">مرتفعة · High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface/80">نطاق الاستهداف · Scope</label>
              <select
                value={annScope}
                onChange={(e) => {
                  setAnnScope(e.target.value as AnnouncementScope);
                  setAnnTargets([]);
                }}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
              >
                <option value="all">جميع المستخدمين · All</option>
                <option value="wilaya">حسب الولاية · Wilaya</option>
                <option value="cycle">حسب الطور · Cycle</option>
                <option value="role">حسب الرتبة · Role</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface/80">تاريخ الانتهاء (اختياري)</label>
              <input
                type="date"
                value={annExpiresAt}
                onChange={(e) => setAnnExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-mono outline-none focus:border-primary"
              />
            </div>
          </div>

          {annScope !== 'all' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface/80">
                تحديد الفئات المستهدفة ({annTargets.length} محددة)
              </label>
              <div className="max-h-36 overflow-y-auto p-2 rounded-lg border border-outline/15 bg-surface-container-low flex flex-wrap gap-1.5">
                {scopeOptions.map((opt) => {
                  const selected = annTargets.includes(opt);
                  const display =
                    annScope === 'role'
                      ? ROLE_CONFIGS[opt as keyof typeof ROLE_CONFIGS]?.shortLabel || opt
                      : opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setAnnTargets((prev) =>
                          prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
                        )
                      }
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer',
                        selected
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface border-outline/15 text-on-surface/80'
                      )}
                    >
                      {display}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface/80">نص التعميم</label>
            <textarea
              rows={4}
              required
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="اكتب التعليمات والتوجيهات المركزية هنا..."
              className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isPostingAnn}
            className="w-full py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPostingAnn ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>نشر التعميم فوراً</span>
          </button>
        </form>

        {/* Active & Historical Announcements Feed */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline/10">
            <h3 className="text-sm font-black text-primary">
              التعميمات المنشورة · Broadcast History ({announcements.length})
            </h3>
          </div>
          {announcements.length === 0 ? (
            <p className="text-xs text-on-surface/55 py-10 text-center">
              لا توجد تعميمات منشورة بعد.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pe-1">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={cn(
                    'p-4 rounded-xl border border-outline/15 bg-surface-container-low space-y-2',
                    ann.active === false && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-primary">{ann.title}</div>
                      <div className="text-[11px] text-on-surface/60 font-mono mt-0.5">
                        {formatDateTime(ann.createdAt)} · النطاق:{' '}
                        {ann.targetScope && ann.targetScope !== 'all'
                          ? `${ann.targetScope} (${(ann.targetValues || []).join('، ')})`
                          : 'جميع المستخدمين'}
                        {ann.expiresAt ? ` · ينتهي ${ann.expiresAt}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnActive(ann)}
                        className="px-2.5 py-1 rounded-md border border-outline/15 bg-surface text-[11px] font-bold cursor-pointer"
                      >
                        {ann.active === false ? 'تفعيل' : 'إيقاف'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnn(ann)}
                        className="p-1.5 rounded-md text-error hover:bg-error/10 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface/80 leading-relaxed">{ann.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== TICKETS WORKSPACE ====================
  if (workspace === 'tickets') {
    return (
      <div className="space-y-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {[
              { id: 'all', label: `الكل (${tickets.length})` },
              { id: 'open', label: 'مفتوحة' },
              { id: 'in_progress', label: 'قيد المعالجة' },
              { id: 'resolved', label: 'مغلقة / محلولة' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTicketStatusFilter(st.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg cursor-pointer',
                  ticketStatusFilter === st.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface/75'
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 font-black text-on-surface/75">
                <tr>
                  <th className="py-3 px-4 text-start">الموضوع · Subject</th>
                  <th className="py-3 px-3 text-start">المرسل · Requester</th>
                  <th className="py-3 px-3 text-center">الأولوية</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-3 text-center">التاريخ</th>
                  <th className="py-3 px-3 text-center">رد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface/50">
                      لا توجد تذاكر دعم مطابقة.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-primary">{t.title || t.subject || 'تذكرة دعم'}</div>
                        <div className="text-[11px] text-on-surface/65 line-clamp-1">
                          {t.description || t.message || ''}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium">{t.userName || 'مستخدم'}</div>
                        <div className="text-[11px] font-mono text-on-surface/55">{t.userEmail || ''}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{t.priority || 'medium'}</td>
                      <td className="py-3 px-3 text-center font-bold">
                        {t.status === 'resolved' || t.status === 'closed' ? (
                          <span className="text-emerald-700 dark:text-emerald-400">محلولة</span>
                        ) : t.status === 'in_progress' ? (
                          <span className="text-amber-700 dark:text-amber-400">قيد المعالجة</span>
                        ) : (
                          <span className="text-error">مفتوحة</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] tabular-nums">
                        {formatDateTime(t.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(t);
                            setTicketReplyText(t.adminReply || '');
                          }}
                          className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold hover:bg-primary hover:text-on-primary cursor-pointer"
                        >
                          معالجة
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Reply Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
              <div
                onClick={() => setSelectedTicket(null)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              />
              <form
                onSubmit={handleSendTicketReply}
                className="relative bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline/20 p-6 shadow-2xl space-y-4 z-10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-primary">
                    {selectedTicket.title || selectedTicket.subject || 'معالجة التذكرة'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-on-surface/80 bg-surface-container-low p-3.5 rounded-xl leading-relaxed">
                  {selectedTicket.description || selectedTicket.message}
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface/80">الرد الرسمي للمالك</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="اكتب الرد الإداري أو الحل التقني هنا..."
                    className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-lg border border-outline/15 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isReplyingTicket}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isReplyingTicket ? 'جاري الإرسال...' : 'إرسال واعتماد الحل'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== PURCHASES WORKSPACE ====================
  if (workspace === 'purchases') {
    const totalVolume = purchases.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    return (
      <div className="space-y-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-primary tabular-nums">
            إجمالي الحجم المالي المرصود · Budget Volume:{' '}
            <span className="font-mono font-black">{totalVolume.toLocaleString('ar-DZ')} دج</span>
          </div>
          <select
            value={purchaseStatusFilter}
            onChange={(e) => setPurchaseStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none"
          >
            <option value="all">جميع الحالات ({purchases.length})</option>
            <option value="pending">قيد الانتظار</option>
            <option value="sent">مرسلة</option>
            <option value="approved">مصادق عليها</option>
            <option value="completed">منجزة</option>
          </select>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 font-black text-on-surface/75">
                <tr>
                  <th className="py-3 px-4 text-start">الطلبية · Order</th>
                  <th className="py-3 px-3 text-start">المؤسسة / صاحب الطلب</th>
                  <th className="py-3 px-3 text-center">المبلغ · Total</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-3 text-center">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface/50">
                      لا توجد طلبيات شراء مطابقة.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((po) => (
                    <tr key={`${po.sourceCollection}_${po.id}`} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 font-bold text-primary">
                        {po.orderNumber || po.id}
                      </td>
                      <td className="py-3 px-3">
                        <div>{po.schoolName || po.schoolId || '—'}</div>
                        <div className="text-[11px] text-on-surface/60">{po.supplierName || ''}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                        {Number(po.total || 0).toLocaleString('ar-DZ')} دج
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        {po.status || 'pending'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPurchase(po)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-primary cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {selectedPurchase && (
            <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
              <div
                onClick={() => setSelectedPurchase(null)}
                className="absolute inset-0 bg-black/45"
              />
              <div className="relative bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline/20 p-5 shadow-2xl space-y-3 z-10">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-primary text-sm">
                    تفاصيل الطلبية: {selectedPurchase.orderNumber || selectedPurchase.id}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedPurchase(null)}
                    className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="text-[11px] font-mono bg-surface-container-low p-3 rounded-xl overflow-auto max-h-80"
                >
                  {JSON.stringify(selectedPurchase, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== AUDIT TRAIL & DIAGNOSTICS WORKSPACE ====================
  if (workspace === 'audit') {
    return (
      <div className="space-y-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {[
              { id: 'activity', label: `سجل النشاط · Activity (${activityLogs.length})` },
              { id: 'diagnostics', label: `سجل التشخيص · Diagnostics (${diagnosticLogs.length})` },
              { id: 'owner', label: `تدقيق المالك · Owner Audit (${ownerAuditLogs.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAuditSubTab(tab.id as any)}
                className={cn(
                  'px-3 py-2 rounded-lg cursor-pointer',
                  auditSubTab === tab.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface/75'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-52">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                placeholder="بحث في السجلات..."
                className="w-full ps-8 pe-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none"
              />
            </div>

            {auditSubTab === 'activity' && (
              <>
                <select
                  value={logsActionFilter}
                  onChange={(e) => setLogsActionFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold"
                >
                  <option value="all">كل العمليات</option>
                  {uniqueActions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={logsModuleFilter}
                  onChange={(e) => setLogsModuleFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold"
                >
                  <option value="all">كل الأقسام</option>
                  {uniqueModules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              type="button"
              onClick={onRefreshLogs}
              disabled={isLoadingLogs}
              className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold text-primary flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={cn(isLoadingLogs && 'animate-spin')} />
              <span>تحديث</span>
            </button>

            <button
              type="button"
              onClick={handleRunLogAnomalyScan}
              disabled={isScanningAI}
              className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isScanningAI ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>كشف الشذوذ بالذكاء</span>
            </button>

            <button
              type="button"
              onClick={() => {
                downloadCSV(
                  `audit_logs_${auditSubTab}_${new Date().toISOString().split('T')[0]}.csv`,
                  ['التاريخ', 'الفاعل', 'العملية / القسم', 'التفاصيل'],
                  auditSubTab === 'activity'
                    ? filteredActivityLogs.map((l) => [
                        formatDateTime(l.timestamp),
                        l.userEmail || l.userName || l.schoolId,
                        `${l.action || ''} / ${l.module || ''}`,
                        l.details || '',
                      ])
                    : auditSubTab === 'diagnostics'
                    ? filteredDiagnosticLogs.map((d) => [
                        formatDateTime(d.timestamp),
                        d.testBy || '',
                        d.databaseId || '',
                        d.message || '',
                      ])
                    : filteredOwnerAuditLogs.map((o) => [
                        formatDateTime(o.timestamp),
                        o.actorEmail || '',
                        o.action,
                        o.summary,
                      ])
                );
                onShowToast('تم تصدير السجلات بصيغة CSV.', 'success');
              }}
              className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold text-primary flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {logsError && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/25 text-xs font-bold text-error flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{logsError}</span>
          </div>
        )}

        {aiScanResult && (
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-primary/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-primary flex items-center gap-1.5">
                <Sparkles size={14} /> نتائج فحص الشذوذ في السجلات
              </span>
              <button
                type="button"
                onClick={() => setAiScanResult(null)}
                className="text-xs text-on-surface/50 hover:text-primary cursor-pointer"
              >
                إغلاق
              </button>
            </div>
            <p className="text-xs text-on-surface/85 leading-relaxed">{aiScanResult.executiveSummary}</p>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 font-black text-on-surface/75">
                <tr>
                  <th className="py-3 px-4 text-start">التوقيت · Timestamp</th>
                  <th className="py-3 px-3 text-start">المصدر / الفاعل · Actor</th>
                  <th className="py-3 px-3 text-start">العملية · Event</th>
                  <th className="py-3 px-3 text-start">التفاصيل · Summary</th>
                  <th className="py-3 px-3 text-center">JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {auditSubTab === 'activity' &&
                  filteredActivityLogs.slice(0, 150).map((log) => (
                    <tr key={`${log.schoolId}_${log.id}`} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-4 font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-primary">{log.userName || 'مستخدم'}</div>
                        <div className="font-mono text-[10px] text-on-surface/60">
                          {log.userEmail || log.schoolId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {log.action} · {log.module}
                      </td>
                      <td className="py-2.5 px-3 text-on-surface/80 max-w-md truncate">
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedPayload({ title: `Activity Log: ${log.id}`, data: log })
                          }
                          className="p-1.5 rounded hover:bg-surface-container text-primary cursor-pointer"
                        >
                          <Terminal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {auditSubTab === 'diagnostics' &&
                  filteredDiagnosticLogs.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-4 font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {formatDateTime(d.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{d.testBy || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{d.databaseId || 'default'}</td>
                      <td className="py-2.5 px-3 text-on-surface/80">{d.message || '—'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedPayload({ title: `Diagnostic: ${d.id}`, data: d })
                          }
                          className="p-1.5 rounded hover:bg-surface-container text-primary cursor-pointer"
                        >
                          <Terminal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {auditSubTab === 'owner' &&
                  filteredOwnerAuditLogs.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-4 font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {formatDateTime(o.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-primary">
                        {o.actorEmail || PROJECT_OWNER_EMAIL}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold">{o.action}</td>
                      <td className="py-2.5 px-3 text-on-surface/85">{o.summary}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedPayload({ title: `Owner Audit: ${o.action}`, data: o })
                          }
                          className="p-1.5 rounded hover:bg-surface-container text-primary cursor-pointer"
                        >
                          <Terminal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Payload Modal */}
        <AnimatePresence>
          {inspectedPayload && (
            <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
              <div
                onClick={() => setInspectedPayload(null)}
                className="absolute inset-0 bg-black/45"
              />
              <div className="relative bg-surface-container-lowest max-w-2xl w-full rounded-2xl border border-outline/20 p-5 shadow-2xl space-y-3 z-10">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-black text-primary">
                    {inspectedPayload.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setInspectedPayload(null)}
                    className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="text-[11px] font-mono bg-surface-container-low p-4 rounded-xl overflow-auto max-h-[65vh]"
                >
                  {JSON.stringify(inspectedPayload.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== FEATURE FLAGS & MAINTENANCE MODE ====================
  if (workspace === 'flags') {
    const toggleFlag = (key: FeatureFlagKey) => {
      setFlagDraft({
        ...effectiveFlags,
        features: {
          ...effectiveFlags.features,
          [key]: !effectiveFlags.features[key],
        },
      });
      setHasUnsavedFlags(true);
    };

    const flagItems: { key: FeatureFlagKey; title: string; desc: string }[] = [
      {
        key: 'aiAssistant',
        title: 'المساعد المخبري الذكي · aiAssistant',
        desc: 'تمكين أو تعطيل المساعد الذكي للمستخدمين غير المالك',
      },
      {
        key: 'scientificSimulators',
        title: 'أدوات المحاكاة العلمية · scientificSimulators',
        desc: 'التحكم في الوصول إلى المخبر الافتراضي، الجدول الدوري، والتشريح والفضاء',
      },
      {
        key: 'allowSignups',
        title: 'فتح التسجيل الجديد · allowSignups',
        desc: 'إيقاف إنشاء الحسابات الجديدة مؤقتاً عبر صفحة /signup عند الحاجة',
      },
      {
        key: 'supportPortal',
        title: 'بوابة الدعم والتذاكر · supportPortal',
        desc: 'السماح بإرسال تذاكر الدعم والاقتراحات عبر صفحة /support',
      },
      {
        key: 'backupExports',
        title: 'مركز النسخ الاحتياطي · backupExports',
        desc: 'تمكين تصدير واستعادة البيانات من طرف المؤسسات',
      },
    ];

    return (
      <div className="space-y-5">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-primary">
              التحكم المركزي والمفاتيح البرمجية · Feature Flags & Maintenance
            </h2>
            <p className="text-[11px] text-on-surface/65">
              يُطبق هذا التكوين المخزن في <span className="font-mono">system_config/global</span> لحظياً على كافة المستخدمين
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveSystemFlags}
            disabled={isSavingFlags || !hasUnsavedFlags}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSavingFlags ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>حفظ وتعميم الإعدادات</span>
          </button>
        </div>

        {/* Maintenance Mode & Read-Only */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={20}
                className={effectiveFlags.maintenanceMode ? 'text-error shrink-0 mt-0.5' : 'text-primary shrink-0 mt-0.5'}
              />
              <div>
                <h3 className="text-sm font-black text-primary">
                  وضع الصيانة الشامل · Maintenance Mode
                </h3>
                <p className="text-xs text-on-surface/70">
                  عند التفعيل، تظهر شاشة صيانة رسمية لجميع المستخدمين مع بقاء لوحة المالك /admin متاحة لك وحدك
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFlagDraft({
                  ...effectiveFlags,
                  maintenanceMode: !effectiveFlags.maintenanceMode,
                });
                setHasUnsavedFlags(true);
              }}
              className={cn(
                'w-12 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer shrink-0',
                effectiveFlags.maintenanceMode ? 'bg-error justify-end' : 'bg-outline/30 justify-start'
              )}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-on-surface/80">رسالة الصيانة للمستخدمين</label>
              <input
                type="text"
                value={effectiveFlags.maintenanceMessage}
                onChange={(e) => {
                  setFlagDraft({ ...effectiveFlags, maintenanceMessage: e.target.value });
                  setHasUnsavedFlags(true);
                }}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface/80">المدة / الموعد المتوقع ETA</label>
              <input
                type="text"
                value={effectiveFlags.maintenanceEta}
                onChange={(e) => {
                  setFlagDraft({ ...effectiveFlags, maintenanceEta: e.target.value });
                  setHasUnsavedFlags(true);
                }}
                placeholder="مثال: 30 دقيقة"
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-outline/10 grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setFlagDraft({ ...effectiveFlags, readOnlyMode: !effectiveFlags.readOnlyMode });
                setHasUnsavedFlags(true);
              }}
              className="p-3 rounded-xl border border-outline/15 bg-surface-container-low flex items-center justify-between text-start cursor-pointer"
            >
              <div>
                <div className="text-xs font-black text-primary">وضع القراءة فقط · readOnlyMode</div>
                <div className="text-[11px] text-on-surface/65">إظهار شريط تنبيه بتجميد التعديلات أثناء الأرشفة</div>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                {effectiveFlags.readOnlyMode ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFlagDraft({
                  ...effectiveFlags,
                  enforceStatutorySetup: !effectiveFlags.enforceStatutorySetup,
                });
                setHasUnsavedFlags(true);
              }}
              className="p-3 rounded-xl border border-outline/15 bg-surface-container-low flex items-center justify-between text-start cursor-pointer"
            >
              <div>
                <div className="text-xs font-black text-primary">
                  إلزامية استكمال الرتبة · enforceStatutorySetup
                </div>
                <div className="text-[11px] text-on-surface/65">مطالبة الحسابات الجديدة بتحديد الرتبة والمؤسسة</div>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                {effectiveFlags.enforceStatutorySetup ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Global Feature Switches */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-3">
          <h3 className="text-sm font-black text-primary">الميزات الفرعية · Global Feature Toggles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flagItems.map((item) => {
              const enabled = effectiveFlags.features[item.key] !== false;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFlag(item.key)}
                  className={cn(
                    'p-3.5 rounded-xl border text-start flex items-center justify-between gap-3 cursor-pointer transition-colors',
                    enabled
                      ? 'bg-surface-container-low border-primary/25'
                      : 'bg-surface border-outline/15 opacity-75'
                  )}
                >
                  <div>
                    <div className="text-xs font-black text-primary">{item.title}</div>
                    <div className="text-[11px] text-on-surface/65 mt-0.5">{item.desc}</div>
                  </div>
                  <div
                    className={cn(
                      'w-10 h-5 rounded-full p-0.5 flex items-center shrink-0 transition-colors',
                      enabled ? 'bg-primary justify-end' : 'bg-outline/30 justify-start'
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== INTERACTIVE FIRESTORE EXPLORER & JSON SNAPSHOT ====================
  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-outline/10">
          <div className="flex items-center gap-2.5">
            <Database size={20} className="text-primary" />
            <div>
              <h2 className="text-sm font-black text-primary">
                مستكشف Firestore والنسخ الاحتياطي · Explorer & JSON Backup
              </h2>
              <p className="text-[11px] text-on-surface/65">
                تصفح آمن (للقراءة فقط) للمجموعات الجذرية ومجموعات المؤسسات الفرعية مع تصدير فوري بصيغة JSON
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportFullSnapshot}
            disabled={isExportingSnapshot}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExportingSnapshot ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <HardDriveDownload size={15} />
            )}
            <span>تصدير نسخة JSON شاملة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-on-surface/80">نطاق الاستعلام · Scope</label>
            <select
              value={explorerMode}
              onChange={(e) => setExplorerMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold"
            >
              <option value="root">مجموعة جذرية · Root Collection</option>
              <option value="school">مجموعة مؤسسة · School Subcollection</option>
            </select>
          </div>

          {explorerMode === 'root' ? (
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-on-surface/80">المجموعة الجذرية</label>
              <select
                value={selectedRootCol}
                onChange={(e) => setSelectedRootCol(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-mono font-bold"
              >
                {ROOT_COLLECTIONS.map((c) => (
                  <option key={c} value={c}>
                    /{c}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-on-surface/80">معرف المؤسسة schoolId</label>
                <input
                  type="text"
                  list="school-ids-list"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  placeholder="أدخل schoolId..."
                  className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-mono"
                />
                <datalist id="school-ids-list">
                  {schoolHealthScores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-on-surface/80">المجموعة الفرعية</label>
                <select
                  value={selectedSchoolSubCol}
                  onChange={(e) => setSelectedSchoolSubCol(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-mono font-bold"
                >
                  {SCHOOL_SUBCOLLECTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadExplorerCollection}
              disabled={isLoadingExplorer}
              className="flex-1 py-2 px-4 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoadingExplorer ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              <span>جلب الوثائق (حد 80)</span>
            </button>
            {explorerDocs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const label =
                    explorerMode === 'root'
                      ? selectedRootCol
                      : `${selectedSchoolId}_${selectedSchoolSubCol}`;
                  downloadJSON(`${label}_export.json`, explorerDocs);
                  onShowToast('تم تصدير المجموعة بصيغة JSON.', 'success');
                }}
                className="py-2 px-3 rounded-lg border border-outline/15 text-xs font-bold text-primary cursor-pointer"
              >
                <Download size={14} />
              </button>
            )}
          </div>
        </div>

        {explorerError && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-xs font-bold">
            {explorerError}
          </div>
        )}
      </div>

      {explorerDocs.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black text-primary tabular-nums">
              الوثائق المسترجعة ({filteredExplorerDocs.length})
            </span>
            <input
              type="text"
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
              placeholder="تصفية داخل JSON..."
              className="w-56 px-3 py-1.5 rounded-lg border border-outline/15 bg-surface text-xs outline-none"
            />
          </div>

          <div className="divide-y divide-outline/10 max-h-[460px] overflow-y-auto">
            {filteredExplorerDocs.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-container-low/50 px-2 rounded"
              >
                <div className="min-w-0">
                  <div className="font-mono font-bold text-primary truncate">{item.id}</div>
                  <div className="font-mono text-[10px] text-on-surface/55 truncate max-w-2xl">
                    {JSON.stringify(item.data).slice(0, 140)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setInspectedPayload({ title: `Document: ${item.id}`, data: item.data })
                  }
                  className="px-2.5 py-1 rounded bg-surface-container text-primary font-bold text-[11px] shrink-0 cursor-pointer"
                >
                  عرض JSON
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explorer JSON Viewer Modal */}
      <AnimatePresence>
        {inspectedPayload && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <div
              onClick={() => setInspectedPayload(null)}
              className="absolute inset-0 bg-black/45"
            />
            <div className="relative bg-surface-container-lowest max-w-2xl w-full rounded-2xl border border-outline/20 p-5 shadow-2xl space-y-3 z-10">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-black text-primary">
                  {inspectedPayload.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setInspectedPayload(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <pre
                dir="ltr"
                className="text-[11px] font-mono bg-surface-container-low p-4 rounded-xl overflow-auto max-h-[65vh]"
              >
                {JSON.stringify(inspectedPayload.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
