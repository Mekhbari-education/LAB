import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  FlaskConical,
  Users,
  KeyRound,
  School,
  Bell,
  MessageSquare,
  ShoppingCart,
  ScrollText,
  Sliders,
  Database,
  Lock,
  Loader2,
  RefreshCw,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import {
  collection,
  collectionGroup,
  query,
  onSnapshot,
  getDocs,
  limit,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import ministryLogo from '/ministry-logo.png';
import {
  db,
  auth,
  isProjectOwner,
  PROJECT_OWNER_EMAIL,
  testFirestoreConnection,
} from '../firebase';
import { ROUTES } from '../config/routes';
import { useTheme } from '../context/ThemeContext';
import { useSystemConfig } from '../context/SystemConfigContext';
import { cn } from '../lib/utils';
import {
  AdminUser,
  AdminWorkspaceId,
  Announcement,
  CrossSchoolChemical,
  CrossSchoolEquipment,
  CrossSchoolIncident,
  CrossSchoolReport,
  DelegatedAdminEntry,
  DiagnosticLogItem,
  OwnerAuditLogItem,
  PurchaseOrder,
  RegisteredSchool,
  SchoolHealthScore,
  SupportTicket,
  SystemActivityLog,
  UserSettings,
  computeSchoolHealthScores,
  getTimestampMs,
} from '../components/admin/adminTypes';
import AdminExecutiveOverview from '../components/admin/AdminExecutiveOverview';
import AdminLabOversight from '../components/admin/AdminLabOversight';
import AdminUsersAndPolicies from '../components/admin/AdminUsersAndPolicies';
import AdminSystemAndAudit from '../components/admin/AdminSystemAndAudit';

interface SidebarGroup {
  title: string;
  items: {
    id: AdminWorkspaceId;
    label: string;
    enLabel: string;
    icon: typeof Activity;
    badge?: number | null;
    alert?: boolean;
  }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { config: systemConfig } = useSystemConfig();

  const [isOwner, setIsOwner] = useState<boolean>(() => isProjectOwner(auth.currentUser));
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(
    auth.currentUser?.email || ''
  );

  const [activeWorkspace, setActiveWorkspace] = useState<AdminWorkspaceId>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Live collections
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, UserSettings>>({});
  const [registeredSchools, setRegisteredSchools] = useState<RegisteredSchool[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLogItem[]>([]);
  const [ownerAuditLogs, setOwnerAuditLogs] = useState<OwnerAuditLogItem[]>([]);
  const [delegatedAdmins, setDelegatedAdmins] = useState<DelegatedAdminEntry[]>([]);

  // Cross-school lab oversight collections
  const [chemicals, setChemicals] = useState<CrossSchoolChemical[]>([]);
  const [equipment, setEquipment] = useState<CrossSchoolEquipment[]>([]);
  const [incidents, setIncidents] = useState<CrossSchoolIncident[]>([]);
  const [reports, setReports] = useState<CrossSchoolReport[]>([]);
  const [experimentLogsCount, setExperimentLogsCount] = useState<number>(0);

  // Shared UI states
  const [selectedSchoolScore, setSelectedSchoolScore] = useState<SchoolHealthScore | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [isPingingDb, setIsPingingDb] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), duration);
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserEmail(user?.email || '');
      setIsOwner(isProjectOwner(user));
      setIsVerifyingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshSystemLogs = useCallback(async () => {
    if (!isOwner) return;
    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const [activitySnap, diagSnap, ownerSnap] = await Promise.all([
        getDocs(query(collectionGroup(db, 'logs'), limit(300))),
        getDocs(query(collection(db, 'diagnostics_log'), limit(150))),
        getDocs(query(collection(db, 'admin_audit_logs'), limit(150))),
      ]);

      setActivityLogs(
        activitySnap.docs
          .map((d): SystemActivityLog => ({
            id: d.id,
            schoolId: d.ref.parent.parent?.id || 'default',
            ...(d.data() as Record<string, any>),
          }))
          .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
      );

      setDiagnosticLogs(
        diagSnap.docs
          .map((d): DiagnosticLogItem => ({ id: d.id, ...(d.data() as Record<string, any>) }))
          .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
      );

      setOwnerAuditLogs(
        ownerSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
      );
    } catch (err: any) {
      setLogsError(err?.message || 'تعذر تحميل سجلات النظام.');
    } finally {
      setIsLoadingLogs(false);
    }
  }, [isOwner]);

  useEffect(() => {
    if (!isOwner) return;

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.warn('Users subscription error:', err.message)
    );

    const unsubSettings = onSnapshot(
      collection(db, 'settings'),
      (snap) => {
        const map: Record<string, UserSettings> = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data() as UserSettings;
        });
        setSettingsMap(map);
      },
      (err) => console.warn('Settings subscription error:', err.message)
    );

    const unsubSchools = onSnapshot(
      collection(db, 'registered_schools'),
      (snap) => setRegisteredSchools(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.warn('Registered schools error:', err.message)
    );

    const unsubTickets = onSnapshot(
      collection(db, 'support_tickets'),
      (snap) =>
        setTickets(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt))
        ),
      (err) => console.warn('Tickets error:', err.message)
    );

    let schoolOrders: PurchaseOrder[] = [];
    let reqOrders: PurchaseOrder[] = [];
    const mergeOrders = () => {
      setPurchases(
        [...schoolOrders, ...reqOrders].sort(
          (a, b) => getTimestampMs(b.createdAt || b.date) - getTimestampMs(a.createdAt || a.date)
        )
      );
    };

    const unsubSchoolOrders = onSnapshot(
      query(collectionGroup(db, 'purchase_orders'), limit(200)),
      (snap) => {
        schoolOrders = snap.docs.map((d) => ({
          id: d.id,
          schoolId: d.ref.parent.parent?.id || '',
          sourceCollection: 'purchase_orders',
          ...(d.data() as any),
        }));
        mergeOrders();
      },
      (err) => console.warn('School orders error:', err.message)
    );

    const unsubPurchaseRequests = onSnapshot(
      collection(db, 'purchase_requests'),
      (snap) => {
        reqOrders = snap.docs.map((d) => ({
          id: d.id,
          sourceCollection: 'purchase_requests',
          orderNumber: (d.data() as any).featureName || 'طلب ميزة',
          schoolName: (d.data() as any).userEmail || '',
          supplierName: (d.data() as any).userName || 'طلب مستخدم',
          ...(d.data() as any),
        }));
        mergeOrders();
      },
      (err) => console.warn('Purchase requests error:', err.message)
    );

    const unsubAnnouncements = onSnapshot(
      collection(db, 'system_announcements'),
      (snap) =>
        setAnnouncements(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt))
        ),
      (err) => console.warn('Announcements error:', err.message)
    );

    const unsubActivityLogs = onSnapshot(
      query(collectionGroup(db, 'logs'), limit(300)),
      (snap) => {
        setActivityLogs(
          snap.docs
            .map((d) => ({
              id: d.id,
              schoolId: d.ref.parent.parent?.id || 'default',
              ...(d.data() as any),
            }))
            .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
        );
        setLogsError(null);
      },
      (err) => setLogsError(err.message)
    );

    const unsubDiagnostics = onSnapshot(
      query(collection(db, 'diagnostics_log'), limit(150)),
      (snap) =>
        setDiagnosticLogs(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
        ),
      (err) => console.warn('Diagnostics error:', err.message)
    );

    const unsubOwnerAudit = onSnapshot(
      query(collection(db, 'admin_audit_logs'), limit(150)),
      (snap) =>
        setOwnerAuditLogs(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
        ),
      (err) => console.warn('Owner audit error:', err.message)
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => setDelegatedAdmins(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.warn('Admins error:', err.message)
    );

    // Cross-school lab compliance streams
    const unsubChemicals = onSnapshot(
      query(collectionGroup(db, 'chemicals'), limit(400)),
      (snap) =>
        setChemicals(
          snap.docs.map((d) => ({
            id: d.id,
            schoolId: d.ref.parent.parent?.id || 'default',
            ...(d.data() as any),
          }))
        ),
      (err) => console.warn('Cross-school chemicals error:', err.message)
    );

    const unsubEquipment = onSnapshot(
      query(collectionGroup(db, 'equipment'), limit(400)),
      (snap) =>
        setEquipment(
          snap.docs.map((d) => ({
            id: d.id,
            schoolId: d.ref.parent.parent?.id || 'default',
            ...(d.data() as any),
          }))
        ),
      (err) => console.warn('Cross-school equipment error:', err.message)
    );

    const unsubIncidents = onSnapshot(
      query(collectionGroup(db, 'safety_incidents'), limit(200)),
      (snap) =>
        setIncidents(
          snap.docs
            .map((d) => ({
              id: d.id,
              schoolId: d.ref.parent.parent?.id || 'default',
              ...(d.data() as any),
            }))
            .sort((a, b) => getTimestampMs(b.createdAt || b.date) - getTimestampMs(a.createdAt || a.date))
        ),
      (err) => console.warn('Cross-school incidents error:', err.message)
    );

    const unsubReports = onSnapshot(
      query(collectionGroup(db, 'reports'), limit(300)),
      (snap) =>
        setReports(
          snap.docs.map((d) => ({
            id: d.id,
            schoolId: d.ref.parent.parent?.id || 'default',
            ...(d.data() as any),
          }))
        ),
      (err) => console.warn('Cross-school reports error:', err.message)
    );

    const unsubExperiments = onSnapshot(
      query(collectionGroup(db, 'experiment_logs'), limit(300)),
      (snap) => setExperimentLogsCount(snap.size),
      (err) => console.warn('Cross-school experiments error:', err.message)
    );

    testFirestoreConnection(1).then(setDbHealthy);

    return () => {
      unsubUsers();
      unsubSettings();
      unsubSchools();
      unsubTickets();
      unsubSchoolOrders();
      unsubPurchaseRequests();
      unsubAnnouncements();
      unsubActivityLogs();
      unsubDiagnostics();
      unsubOwnerAudit();
      unsubAdmins();
      unsubChemicals();
      unsubEquipment();
      unsubIncidents();
      unsubReports();
      unsubExperiments();
    };
  }, [isOwner]);

  const schoolHealthScores = useMemo(
    () =>
      computeSchoolHealthScores({
        registeredSchools,
        settingsMap,
        users,
        chemicals,
        equipment,
        incidents,
        reports,
      }),
    [registeredSchools, settingsMap, users, chemicals, equipment, incidents, reports]
  );

  const openTicketsCount = useMemo(
    () =>
      tickets.filter(
        (t) => t.status === 'new' || t.status === 'open' || t.status === 'in_progress' || t.status === 'pending'
      ).length,
    [tickets]
  );

  const openIncidentsCount = useMemo(
    () => incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length,
    [incidents]
  );

  const sidebarGroups: SidebarGroup[] = useMemo(
    () => [
      {
        title: 'القيادة والمخابر · Command',
        items: [
          {
            id: 'overview',
            label: 'القيادة التنفيذية',
            enLabel: 'Executive Overview',
            icon: Activity,
          },
          {
            id: 'lab_oversight',
            label: 'صحة المخابر والأمان',
            enLabel: 'Lab Oversight',
            icon: FlaskConical,
            badge: openIncidentsCount > 0 ? openIncidentsCount : null,
            alert: openIncidentsCount > 0,
          },
        ],
      },
      {
        title: 'الهوية والصلاحيات · Governance',
        items: [
          {
            id: 'users',
            label: 'المستخدمون والعمليات',
            enLabel: 'Users & Bulk Ops',
            icon: Users,
            badge: users.length,
          },
          {
            id: 'policies',
            label: 'سياسات الصلاحيات',
            enLabel: 'RBAC Policies',
            icon: KeyRound,
          },
        ],
      },
      {
        title: 'المؤسسات والعمليات · Operations',
        items: [
          {
            id: 'schools',
            label: 'دليل المؤسسات',
            enLabel: 'Schools Directory',
            icon: School,
            badge: schoolHealthScores.length,
          },
          {
            id: 'announcements',
            label: 'التعميمات الموجهة',
            enLabel: 'Announcements',
            icon: Bell,
            badge: announcements.filter((a) => a.active !== false).length,
          },
          {
            id: 'tickets',
            label: 'الدعم والتذاكر',
            enLabel: 'Support Desk',
            icon: MessageSquare,
            badge: openTicketsCount > 0 ? openTicketsCount : null,
            alert: openTicketsCount > 0,
          },
          {
            id: 'purchases',
            label: 'الطلبيات والميزانية',
            enLabel: 'Procurement',
            icon: ShoppingCart,
            badge: purchases.length || null,
          },
        ],
      },
      {
        title: 'النظام والبيانات · Platform',
        items: [
          {
            id: 'audit',
            label: 'سجل التدقيق والتشخيص',
            enLabel: 'Audit & Logs',
            icon: ScrollText,
            badge: activityLogs.length + diagnosticLogs.length + ownerAuditLogs.length,
          },
          {
            id: 'flags',
            label: 'إعدادات النظام والصيانة',
            enLabel: 'Feature Flags',
            icon: Sliders,
            alert: systemConfig.maintenanceMode,
          },
          {
            id: 'explorer',
            label: 'مستكشف البيانات والنسخ',
            enLabel: 'Firestore & Backup',
            icon: Database,
          },
        ],
      },
    ],
    [
      openIncidentsCount,
      users.length,
      schoolHealthScores.length,
      announcements,
      openTicketsCount,
      purchases.length,
      activityLogs.length,
      diagnosticLogs.length,
      ownerAuditLogs.length,
      systemConfig.maintenanceMode,
    ]
  );

  const activeItemMeta = useMemo(() => {
    for (const g of sidebarGroups) {
      const found = g.items.find((i) => i.id === activeWorkspace);
      if (found) return found;
    }
    return sidebarGroups[0].items[0];
  }, [sidebarGroups, activeWorkspace]);

  const handlePingDatabase = async () => {
    setIsPingingDb(true);
    try {
      const ok = await testFirestoreConnection(2);
      setDbHealthy(ok);
      showToast(
        ok ? 'الاتصال بقاعدة بيانات Firestore السحابية مستقر.' : 'تعذر التحقق من الاتصال.',
        ok ? 'success' : 'error'
      );
    } catch (e: any) {
      setDbHealthy(false);
      showToast('خطأ في اختبار الاتصال: ' + (e?.message || ''), 'error');
    } finally {
      setIsPingingDb(false);
    }
  };

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background rtl font-sans" dir="rtl">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-on-surface/70">جاري التحقق من صلاحية مالك المشروع...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background rtl font-sans" dir="rtl">
        <Helmet>
          <title>وصول مقيد لمالك المشروع — لوحة الإدارة المركزية</title>
        </Helmet>
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline/15 text-center shadow-sm">
          <div className="w-14 h-14 bg-error/10 text-error rounded-xl flex items-center justify-center mx-auto mb-5">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black text-primary mb-2">لوحة الإدارة المركزية محصورة بالمالك</h2>
          <p className="text-xs sm:text-sm text-on-surface/70 leading-relaxed mb-6">
            هذه الصفحة مخصصة حصرياً لمالك المشروع والتحقق عبر البريد الإلكتروني الموثق للمالك فقط.
          </p>
          <div className="p-4 bg-surface-container rounded-xl border border-outline/10 mb-6 text-xs text-on-surface/75 text-right space-y-1">
            <div>
              <strong>الحساب الحالي:</strong> {currentUserEmail || 'غير مسجل'}
            </div>
            <div>
              <strong>حالة التوثيق:</strong>{' '}
              {auth.currentUser?.emailVerified ? 'بريد موثق' : 'بريد غير موثق'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            العودة إلى الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-container-low border-e border-outline/15">
      <div className="p-4 border-b border-outline/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={ministryLogo} alt="Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-black text-primary truncate">الإدارة المركزية</div>
            <div className="text-[10px] font-mono text-on-surface/60 truncate">OWNER CONSOLE</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {sidebarGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold text-on-surface/50 uppercase tracking-wide">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspace(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-start flex items-center justify-between gap-2 transition-colors text-xs font-bold cursor-pointer',
                    active
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface/80 hover:bg-surface-container hover:text-primary'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div
                        className={cn(
                          'text-[9px] font-mono truncate',
                          active ? 'text-on-primary/75' : 'text-on-surface/45'
                        )}
                      >
                        {item.enLabel}
                      </div>
                    </div>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={cn(
                        'font-mono text-[10px] tabular-nums shrink-0',
                        active
                          ? 'text-on-primary'
                          : item.alert
                          ? 'text-error font-black'
                          : 'text-on-surface/60'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-outline/10 space-y-2">
        <div className="px-2.5 py-2 rounded-lg bg-surface-container-lowest border border-outline/10">
          <div className="text-[10px] font-bold text-on-surface/60 flex items-center gap-1.5">
            <Lock size={11} className="text-emerald-700 dark:text-emerald-400" />
            <span>مالك المشروع الموثق</span>
          </div>
          <div className="font-mono text-[10px] text-primary font-bold truncate mt-0.5">
            {PROJECT_OWNER_EMAIL}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="w-full py-2 px-3 rounded-lg border border-outline/15 bg-surface-container-lowest hover:border-primary/40 text-xs font-bold text-primary flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowRight size={14} />
          <span>العودة للمنصة · Exit</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex rtl font-sans" dir="rtl">
      <Helmet>
        <title>لوحة الإدارة المركزية — LabEducationDZ</title>
      </Helmet>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={cn(
              'fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg border text-white font-bold text-xs sm:text-sm',
              toast.type === 'error'
                ? 'bg-red-600 border-red-400'
                : toast.type === 'info'
                ? 'bg-blue-600 border-blue-400'
                : 'bg-primary border-primary/40'
            )}
          >
            {toast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Dedicated 260px Command Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50"
            />
            <div className="relative w-[260px] h-full z-10">{renderSidebarContent()}</div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Command Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean 1-Row Top Command Bar */}
        <header className="h-14 bg-surface/90 backdrop-blur-sm border-b border-outline/10 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
              aria-label="قائمة الإدارة"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-primary truncate">
                  {activeItemMeta.label}
                </h1>
                <span className="hidden sm:inline text-[11px] font-mono text-on-surface/55">
                  · {activeItemMeta.enLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {systemConfig.maintenanceMode && (
              <button
                type="button"
                onClick={() => setActiveWorkspace('flags')}
                className="px-2.5 py-1 rounded-md bg-error/10 text-error text-[11px] font-bold cursor-pointer"
              >
                وضع الصيانة نشط
              </button>
            )}

            <button
              type="button"
              onClick={handlePingDatabase}
              disabled={isPingingDb}
              className="px-2.5 py-1.5 rounded-lg border border-outline/15 bg-surface-container-lowest text-[11px] font-bold text-on-surface/80 hover:border-primary/40 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={cn(isPingingDb && 'animate-spin')} />
              <span>{dbHealthy === false ? 'فشل الاتصال' : 'Firestore متصل'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg border border-outline/15 bg-surface-container-lowest text-primary cursor-pointer"
              title="تبديل السمة"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeWorkspace === 'overview' && (
            <AdminExecutiveOverview
              users={users}
              settingsMap={settingsMap}
              registeredSchools={registeredSchools}
              tickets={tickets}
              activityLogs={activityLogs}
              diagnosticLogs={diagnosticLogs}
              chemicals={chemicals}
              equipment={equipment}
              incidents={incidents}
              schoolHealthScores={schoolHealthScores}
              onNavigateWorkspace={(ws) => setActiveWorkspace(ws)}
              onInspectSchoolScore={(sch) => {
                setSelectedSchoolScore(sch);
                setActiveWorkspace('lab_oversight');
              }}
            />
          )}

          {activeWorkspace === 'lab_oversight' && (
            <AdminLabOversight
              chemicals={chemicals}
              equipment={equipment}
              incidents={incidents}
              experimentLogsCount={experimentLogsCount}
              schoolHealthScores={schoolHealthScores}
              selectedSchoolScore={selectedSchoolScore}
              onSelectSchoolScore={setSelectedSchoolScore}
              onShowToast={showToast}
            />
          )}

          {(activeWorkspace === 'users' || activeWorkspace === 'policies') && (
            <AdminUsersAndPolicies
              mode={activeWorkspace}
              users={users}
              settingsMap={settingsMap}
              delegatedAdmins={delegatedAdmins}
              activityLogs={activityLogs}
              systemConfig={systemConfig}
              onShowToast={showToast}
            />
          )}

          {(activeWorkspace === 'schools' ||
            activeWorkspace === 'announcements' ||
            activeWorkspace === 'tickets' ||
            activeWorkspace === 'purchases' ||
            activeWorkspace === 'audit' ||
            activeWorkspace === 'flags' ||
            activeWorkspace === 'explorer') && (
            <AdminSystemAndAudit
              workspace={activeWorkspace}
              schoolHealthScores={schoolHealthScores}
              onInspectSchoolScore={(sch) => {
                setSelectedSchoolScore(sch);
                setActiveWorkspace('lab_oversight');
              }}
              announcements={announcements}
              tickets={tickets}
              purchases={purchases}
              activityLogs={activityLogs}
              diagnosticLogs={diagnosticLogs}
              ownerAuditLogs={ownerAuditLogs}
              isLoadingLogs={isLoadingLogs}
              logsError={logsError}
              onRefreshLogs={refreshSystemLogs}
              systemConfig={systemConfig}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
