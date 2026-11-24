import React, { useMemo, useState } from 'react';
import {
  Users,
  School,
  HeartPulse,
  MessageSquare,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowUpLeft,
  CheckCircle2,
  Loader2,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { auth } from '../../firebase';
import { ROLE_CONFIGS, UserRole } from '../../context/UserRoleContext';
import { cn } from '../../lib/utils';
import {
  AdminUser,
  AdminWorkspaceId,
  AIInsightsResponse,
  CrossSchoolChemical,
  CrossSchoolEquipment,
  CrossSchoolIncident,
  DiagnosticLogItem,
  RegisteredSchool,
  SchoolHealthScore,
  SupportTicket,
  SystemActivityLog,
  UserSettings,
  WORKSPACE_ROLE_KEYS,
  getTimestampMs,
  resolveEffectiveWorkspaceRole,
} from './adminTypes';

interface AdminExecutiveOverviewProps {
  users: AdminUser[];
  settingsMap: Record<string, UserSettings>;
  registeredSchools: RegisteredSchool[];
  tickets: SupportTicket[];
  activityLogs: SystemActivityLog[];
  diagnosticLogs: DiagnosticLogItem[];
  chemicals: CrossSchoolChemical[];
  equipment: CrossSchoolEquipment[];
  incidents: CrossSchoolIncident[];
  schoolHealthScores: SchoolHealthScore[];
  onNavigateWorkspace: (workspace: AdminWorkspaceId) => void;
  onInspectSchoolScore: (school: SchoolHealthScore) => void;
}

const CHART_COLORS = ['#2b3d22', '#415437', '#5c6146', '#694819', '#8a6f42'];

export default function AdminExecutiveOverview({
  users,
  settingsMap,
  registeredSchools,
  tickets,
  activityLogs,
  diagnosticLogs,
  chemicals,
  equipment,
  incidents,
  schoolHealthScores,
  onNavigateWorkspace,
  onInspectSchoolScore,
}: AdminExecutiveOverviewProps) {
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [trendWindowDays, setTrendWindowDays] = useState<14 | 30>(14);

  const kpis = useMemo(() => {
    const activeUsers = users.filter((u) => !u.disabled).length;
    const disabledUsers = users.length - activeUsers;
    const avgHealth =
      schoolHealthScores.length > 0
        ? Math.round(
            schoolHealthScores.reduce((sum, s) => sum + s.totalScore, 0) / schoolHealthScores.length
          )
        : 0;
    const openTickets = tickets.filter(
      (t) => t.status === 'new' || t.status === 'open' || t.status === 'in_progress' || t.status === 'pending'
    ).length;
    const openIncidents = incidents.filter(
      (i) => i.status !== 'resolved' && i.status !== 'closed'
    ).length;
    const uniqueWilayas = new Set(
      schoolHealthScores.map((s) => s.wilaya).filter((w) => w && w !== 'غير محددة')
    ).size;

    return {
      totalUsers: users.length,
      activeUsers,
      disabledUsers,
      totalSchools: schoolHealthScores.length || registeredSchools.length,
      uniqueWilayas,
      avgHealth,
      openTickets,
      openIncidents,
    };
  }, [users, schoolHealthScores, registeredSchools.length, tickets, incidents]);

  // Wilaya top 8 distribution
  const wilayaChartData = useMemo(() => {
    const counts = new Map<string, { name: string; schools: number; users: number }>();
    schoolHealthScores.forEach((s) => {
      const label = (s.wilaya || 'غير محددة').replace('مديرية التربية لولاية ', '').trim();
      const prev = counts.get(label) || { name: label, schools: 0, users: 0 };
      prev.schools += 1;
      prev.users += s.staffCount;
      counts.set(label, prev);
    });
    return Array.from(counts.values())
      .sort((a, b) => b.schools + b.users - (a.schools + a.users))
      .slice(0, 8);
  }, [schoolHealthScores]);

  // Role distribution
  const roleChartData = useMemo(() => {
    const counts: Record<UserRole, number> = {
      lab_manager: 0,
      director: 0,
      censor: 0,
      teacher: 0,
      economist: 0,
    };
    users.forEach((u) => {
      const r = resolveEffectiveWorkspaceRole(u);
      counts[r] = (counts[r] || 0) + 1;
    });
    return WORKSPACE_ROLE_KEYS.map((roleKey) => ({
      roleKey,
      name: ROLE_CONFIGS[roleKey].shortLabel,
      count: counts[roleKey] || 0,
    }));
  }, [users]);

  // Activity & Diagnostics trend chart
  const activityTrendData = useMemo(() => {
    const days: { dateKey: string; label: string; activities: number; diagnostics: number }[] = [];
    const now = new Date();
    for (let i = trendWindowDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = new Intl.DateTimeFormat('ar-DZ', { month: 'numeric', day: 'numeric' }).format(d);
      days.push({ dateKey: key, label, activities: 0, diagnostics: 0 });
    }
    const map = new Map(days.map((d) => [d.dateKey, d]));

    activityLogs.forEach((l) => {
      const ms = getTimestampMs(l.timestamp);
      if (!ms) return;
      const key = new Date(ms).toISOString().split('T')[0];
      const slot = map.get(key);
      if (slot) slot.activities += 1;
    });

    diagnosticLogs.forEach((d) => {
      const ms = getTimestampMs(d.timestamp);
      if (!ms) return;
      const key = new Date(ms).toISOString().split('T')[0];
      const slot = map.get(key);
      if (slot) slot.diagnostics += 1;
    });

    return days;
  }, [activityLogs, diagnosticLogs, trendWindowDays]);

  const handleGenerateAIInsights = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('تعذر الحصول على رمز المصادقة. يرجى إعادة تسجيل الدخول.');
      }

      const lowStockCount = chemicals.filter(
        (c) => Number(c.quantity ?? 0) <= Number(c.minQuantity ?? 5)
      ).length;
      const brokenEquipCount = equipment.filter(
        (e) => e.status === 'broken' || e.status === 'maintenance' || Number(e.brokenQuantity ?? 0) > 0
      ).length;

      const snapshot = {
        generatedAt: new Date().toISOString(),
        users: {
          total: users.length,
          disabled: kpis.disabledUsers,
          byRole: roleChartData.map((r) => ({ role: r.roleKey, count: r.count })),
        },
        institutions: {
          totalSchools: kpis.totalSchools,
          wilayasCovered: kpis.uniqueWilayas,
          avgHealthScore: kpis.avgHealth,
          watchlistSchools: schoolHealthScores
            .filter((s) => s.totalScore < 60)
            .slice(0, 6)
            .map((s) => ({
              wilaya: s.wilaya,
              score: s.totalScore,
              lowStock: s.lowStockCount,
              expiredChemicals: s.expiredChemicalsCount,
              brokenEquipment: s.brokenEquipmentCount,
              openIncidents: s.openIncidentsCount,
            })),
        },
        labCompliance: {
          totalChemicalsTracked: chemicals.length,
          lowStockCount,
          totalEquipmentTracked: equipment.length,
          brokenEquipCount,
          openSafetyIncidents: kpis.openIncidents,
        },
        supportAndLogs: {
          openTickets: kpis.openTickets,
          recentActivityCount: activityLogs.length,
          recentDiagnosticsCount: diagnosticLogs.length,
          recentErrorsOrDiagnostics: diagnosticLogs.slice(0, 8).map((d) => ({
            message: d.message || '',
            timestamp: getTimestampMs(d.timestamp),
          })),
          topActivityActions: activityLogs.slice(0, 12).map((l) => ({
            action: l.action,
            module: l.module,
          })),
        },
      };

      const res = await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(snapshot),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'فشل الخادم في توليد التقرير الذكي.');
      }
      setAiInsights(data as AIInsightsResponse);
    } catch (err: any) {
      setAiError(err?.message || 'حدث خطأ أثناء الاتصال بخدمة التحليل الذكي.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const mapTargetWorkspace = (target?: string): AdminWorkspaceId => {
    const t = String(target || '').toLowerCase();
    if (t.includes('user')) return 'users';
    if (t.includes('polic') || t.includes('rbac') || t.includes('perm')) return 'policies';
    if (t.includes('lab') || t.includes('chem') || t.includes('equip') || t.includes('safety')) {
      return 'lab_oversight';
    }
    if (t.includes('school')) return 'schools';
    if (t.includes('ticket') || t.includes('support')) return 'tickets';
    if (t.includes('purchase') || t.includes('budget')) return 'purchases';
    if (t.includes('ann')) return 'announcements';
    if (t.includes('flag') || t.includes('maint')) return 'flags';
    if (t.includes('audit') || t.includes('log') || t.includes('diag')) return 'audit';
    return 'overview';
  };

  return (
    <div className="space-y-6">
      {/* 4-Card National KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateWorkspace('users')}
          className="text-start bg-surface-container-lowest p-5 rounded-xl border border-outline/15 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface/70">إجمالي المستخدمين · Users</span>
            <Users size={18} className="text-primary" />
          </div>
          <div className="text-3xl font-black text-primary font-mono tabular-nums">
            {kpis.totalUsers}
          </div>
          <p className="text-[11px] text-on-surface/65 mt-2 font-medium tabular-nums">
            {kpis.activeUsers} نشط · {kpis.disabledUsers} معلق
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateWorkspace('schools')}
          className="text-start bg-surface-container-lowest p-5 rounded-xl border border-outline/15 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface/70">المؤسسات التربوية · Schools</span>
            <School size={18} className="text-primary" />
          </div>
          <div className="text-3xl font-black text-primary font-mono tabular-nums">
            {kpis.totalSchools}
          </div>
          <p className="text-[11px] text-on-surface/65 mt-2 font-medium tabular-nums">
            عبر {kpis.uniqueWilayas} ولاية مسجلة
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateWorkspace('lab_oversight')}
          className="text-start bg-surface-container-lowest p-5 rounded-xl border border-outline/15 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface/70">مؤشر صحة المخابر · Health Score</span>
            <HeartPulse size={18} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-primary font-mono tabular-nums">
            {kpis.avgHealth}
            <span className="text-sm font-bold text-on-surface/50">/100</span>
          </div>
          <p className="text-[11px] text-on-surface/65 mt-2 font-medium tabular-nums">
            {kpis.openIncidents} حادث سلامة مفتوح
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateWorkspace('tickets')}
          className="text-start bg-surface-container-lowest p-5 rounded-xl border border-outline/15 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface/70">التذاكر المفتوحة · Open Tickets</span>
            <MessageSquare
              size={18}
              className={kpis.openTickets > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-primary'}
            />
          </div>
          <div className="text-3xl font-black text-primary font-mono tabular-nums">
            {kpis.openTickets}
          </div>
          <p className="text-[11px] text-on-surface/65 mt-2 font-medium tabular-nums">
            من أصل {tickets.length} تذكرة دعم
          </p>
        </button>
      </section>

      {/* AI Executive Briefing & Anomaly Card */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline/15 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-primary">
                الموجز التنفيذي الذكي وكشف الشذوذ · AI Executive Briefing
              </h2>
              <p className="text-xs text-on-surface/65">
                تحليل فوري لمؤشرات المنصة، المخزون الحرج، وسجلات التشخيص دون إرسال أي بيانات شخصية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAIInsights}
            disabled={isLoadingAI}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoadingAI ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>جاري التحليل عبر الخادم...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>{aiInsights ? 'تحديث التحليل الذكي' : 'توليد الموجز التنفيذي'}</span>
              </>
            )}
          </button>
        </div>

        {isLoadingAI && !aiInsights && (
          <div className="space-y-2.5 animate-pulse py-2">
            <div className="h-4 bg-surface-container rounded w-3/4" />
            <div className="h-4 bg-surface-container rounded w-1/2" />
            <div className="h-16 bg-surface-container rounded w-full mt-3" />
          </div>
        )}

        {aiError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-error font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{aiError}</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateAIInsights}
              className="px-3 py-1.5 rounded-lg bg-error text-on-error text-[11px] font-bold self-start sm:self-auto cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!isLoadingAI && !aiInsights && !aiError && (
          <p className="text-xs text-on-surface/65 leading-relaxed">
            انقر على «توليد الموجز التنفيذي» لإرسال ملخص إحصائي مجهول الهوية إلى خدمة التحليل ورصد أي اختلالات في التغطية، المخزون، أو أخطاء الاتصال.
          </p>
        )}

        {aiInsights && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shrink-0',
                  aiInsights.riskLevel === 'critical'
                    ? 'bg-error/10 text-error'
                    : aiInsights.riskLevel === 'elevated'
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                )}
              >
                {aiInsights.riskLevel === 'critical' ? (
                  <ShieldAlert size={14} />
                ) : aiInsights.riskLevel === 'elevated' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}
                <span>
                  {aiInsights.riskLevel === 'critical'
                    ? 'مستوى خطر حرج · Critical'
                    : aiInsights.riskLevel === 'elevated'
                    ? 'مستوى تنبيه مرتفع · Elevated'
                    : 'الوضع مستقر · Nominal'}
                </span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed font-medium">
                {aiInsights.executiveSummary}
              </p>
            </div>

            {aiInsights.anomalies?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-outline/10">
                <h3 className="text-xs font-black text-on-surface/80">
                  التنبيهات المرصودة · Detected Anomalies ({aiInsights.anomalies.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.anomalies.map((anom, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-primary">{anom.title}</span>
                        <span
                          className={cn(
                            'text-[10px] font-mono font-bold',
                            anom.severity === 'critical'
                              ? 'text-error'
                              : anom.severity === 'warning'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-primary'
                          )}
                        >
                          {anom.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface/75 leading-relaxed">
                        {anom.evidence}
                      </p>
                      <p className="text-[11px] font-bold text-primary/90">
                        التوصية: {anom.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiInsights.actionItems?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-outline/10">
                {aiInsights.actionItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigateWorkspace(mapTargetWorkspace(item.targetWorkspace))}
                    className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline/15 hover:border-primary/40 text-xs font-bold text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>{item.action}</span>
                    <ArrowUpLeft size={13} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Interactive National Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Wilaya Distribution Bar Chart */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-primary">
                التوزيع الجغرافي حسب الولاية · Wilaya Distribution
              </h3>
              <p className="text-[11px] text-on-surface/65">أعلى 8 ولايات من حيث عدد المؤسسات والمستخدمين</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-on-surface/60">TOP 8</span>
          </div>
          <div className="h-64 w-full" dir="ltr">
            {wilayaChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-on-surface/50">
                لا توجد بيانات ولائية كافية للرسم البياني بعد.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wilayaChartData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid rgba(116,120,111,0.2)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="schools" name="المؤسسات" fill="#2b3d22" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" name="المستخدمون" fill="#694819" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Workspace Role Distribution */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-primary">
                توزيع الرتب الوظيفية · Workspace Roles
              </h3>
              <p className="text-[11px] text-on-surface/65">الحسابات موزعة حسب فضاءات العمل الخمسة</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateWorkspace('users')}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              عرض الدليل
            </button>
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid rgba(116,120,111,0.2)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="عدد الحسابات" radius={[6, 6, 0, 0]}>
                  {roleChartData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Activity & Diagnostics Timeline + Watchlist Schools */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-primary" />
              <h3 className="text-sm font-black text-primary">
                حركية النظام وسجلات التشخيص · Activity & Diagnostics Trend
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg text-[11px] font-bold">
              {([14, 30] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTrendWindowDays(days)}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono',
                    trendWindowDays === days
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface/70 hover:text-primary'
                  )}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid rgba(116,120,111,0.2)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activities"
                  name="النشاطات"
                  stroke="#2b3d22"
                  fill="#2b3d22"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="diagnostics"
                  name="التشخيص"
                  stroke="#ba1a1a"
                  fill="#ba1a1a"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* School Health Watchlist */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-primary">
              تصنيف صحة المؤسسات · Health Ranking
            </h3>
            <button
              type="button"
              onClick={() => onNavigateWorkspace('lab_oversight')}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              التفاصيل
            </button>
          </div>

          {schoolHealthScores.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface/50">
              لا توجد مؤسسات مسجلة بعد.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pe-1">
              {schoolHealthScores.slice(0, 8).map((sch) => (
                <button
                  key={sch.id}
                  type="button"
                  onClick={() => onInspectSchoolScore(sch)}
                  className="w-full text-start p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-on-surface truncate">{sch.name}</div>
                    <div className="text-[10px] text-on-surface/60 truncate">
                      {sch.wilaya} · {sch.staffCount} موظفين
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span
                      className={cn(
                        'font-mono font-black text-xs tabular-nums',
                        sch.totalScore >= 80
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : sch.totalScore >= 60
                          ? 'text-primary'
                          : sch.totalScore >= 40
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-error'
                      )}
                    >
                      {sch.totalScore}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
