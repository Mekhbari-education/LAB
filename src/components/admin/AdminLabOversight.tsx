import React, { useMemo, useState } from 'react';
import {
  FlaskConical,
  Wrench,
  ShieldAlert,
  HeartPulse,
  Search,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import {
  CrossSchoolChemical,
  CrossSchoolEquipment,
  CrossSchoolIncident,
  SchoolHealthScore,
  downloadCSV,
  formatDateTime,
  isExpiredDate,
} from './adminTypes';

interface AdminLabOversightProps {
  chemicals: CrossSchoolChemical[];
  equipment: CrossSchoolEquipment[];
  incidents: CrossSchoolIncident[];
  experimentLogsCount: number;
  schoolHealthScores: SchoolHealthScore[];
  selectedSchoolScore: SchoolHealthScore | null;
  onSelectSchoolScore: (school: SchoolHealthScore | null) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type OversightSubTab = 'scores' | 'chemicals' | 'equipment' | 'incidents';

export default function AdminLabOversight({
  chemicals,
  equipment,
  incidents,
  experimentLogsCount,
  schoolHealthScores,
  selectedSchoolScore,
  onSelectSchoolScore,
  onShowToast,
}: AdminLabOversightProps) {
  const [subTab, setSubTab] = useState<OversightSubTab>('scores');
  const [searchQuery, setSearchQuery] = useState('');
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');
  const [chemFilter, setChemFilter] = useState<'critical' | 'expired' | 'low' | 'all'>('critical');

  const schoolNameLookup = useMemo(() => {
    const map = new Map<string, string>();
    schoolHealthScores.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [schoolHealthScores]);

  const wilayaOptions = useMemo(() => {
    const set = new Set<string>();
    schoolHealthScores.forEach((s) => {
      if (s.wilaya && s.wilaya !== 'غير محددة') set.add(s.wilaya);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [schoolHealthScores]);

  const criticalChemicals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chemicals.filter((c) => {
      const isLow = Number(c.quantity ?? 0) <= Number(c.minQuantity ?? 5);
      const isExp = isExpiredDate(c.expiryDate);
      if (chemFilter === 'critical' && !isLow && !isExp) return false;
      if (chemFilter === 'expired' && !isExp) return false;
      if (chemFilter === 'low' && !isLow) return false;

      if (!q) return true;
      const schoolName = schoolNameLookup.get(c.schoolId) || c.schoolId;
      return (
        (c.nameAr || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.formula || '').toLowerCase().includes(q) ||
        schoolName.toLowerCase().includes(q)
      );
    });
  }, [chemicals, chemFilter, searchQuery, schoolNameLookup]);

  const brokenEquipment = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return equipment.filter((e) => {
      const hasIssue =
        e.status === 'broken' ||
        e.status === 'maintenance' ||
        Number(e.brokenQuantity ?? 0) > 0;
      if (!hasIssue) return false;
      if (!q) return true;
      const schoolName = schoolNameLookup.get(e.schoolId) || e.schoolId;
      return (
        (e.name || '').toLowerCase().includes(q) ||
        (e.type || '').toLowerCase().includes(q) ||
        schoolName.toLowerCase().includes(q)
      );
    });
  }, [equipment, searchQuery, schoolNameLookup]);

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (!q) return true;
      const schoolName = schoolNameLookup.get(inc.schoolId) || inc.schoolId;
      return (
        (inc.title || '').toLowerCase().includes(q) ||
        (inc.description || '').toLowerCase().includes(q) ||
        schoolName.toLowerCase().includes(q)
      );
    });
  }, [incidents, searchQuery, schoolNameLookup]);

  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return schoolHealthScores.filter((s) => {
      if (wilayaFilter !== 'all' && s.wilaya !== wilayaFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.wilaya.toLowerCase().includes(q) ||
        s.commune.toLowerCase().includes(q)
      );
    });
  }, [schoolHealthScores, wilayaFilter, searchQuery]);

  const summary = useMemo(() => {
    const lowStock = chemicals.filter(
      (c) => Number(c.quantity ?? 0) <= Number(c.minQuantity ?? 5)
    ).length;
    const expired = chemicals.filter((c) => isExpiredDate(c.expiryDate)).length;
    const broken = equipment.filter(
      (e) => e.status === 'broken' || e.status === 'maintenance' || Number(e.brokenQuantity ?? 0) > 0
    ).length;
    const openIncidents = incidents.filter(
      (i) => i.status !== 'resolved' && i.status !== 'closed'
    ).length;
    return { lowStock, expired, broken, openIncidents };
  }, [chemicals, equipment, incidents]);

  const handleExportHealthCSV = () => {
    const headers = [
      'المؤسسة',
      'الولاية',
      'الطور',
      'الطاقم',
      'المجموع /100',
      'اكتمال الملف /25',
      'تغطية الطاقم /20',
      'السلامة والمخزون /35',
      'التقارير /20',
      'كواشف ناقصة',
      'كواشف منتهية',
      'عتاد عاطل',
      'حوادث مفتوحة',
    ];
    const rows = filteredSchools.map((s) => [
      s.name,
      s.wilaya,
      s.cycle,
      s.staffCount,
      s.totalScore,
      s.pillars.profileScore,
      s.pillars.staffScore,
      s.pillars.safetyStockScore,
      s.pillars.reportingScore,
      s.lowStockCount,
      s.expiredChemicalsCount,
      s.brokenEquipmentCount,
      s.openIncidentsCount,
    ]);
    downloadCSV(`school_health_scores_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    onShowToast('تم تصدير مصفوفة صحة المؤسسات بصيغة CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* National Lab Oversight Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15">
          <div className="text-[11px] font-bold text-on-surface/65">إجمالي الكواشف · Chemicals</div>
          <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
            {chemicals.length}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1 tabular-nums">
            {summary.lowStock} نقص مخزون · {summary.expired} منتهي
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15">
          <div className="text-[11px] font-bold text-on-surface/65">التجهيزات المخبرية · Equipment</div>
          <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
            {equipment.length}
          </div>
          <div className="text-[11px] text-on-surface/65 font-medium mt-1 tabular-nums">
            {summary.broken} عاطل أو في الصيانة
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15">
          <div className="text-[11px] font-bold text-on-surface/65">حوادث السلامة · Incidents</div>
          <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
            {incidents.length}
          </div>
          <div className="text-[11px] text-error font-bold mt-1 tabular-nums">
            {summary.openIncidents} مفتوحة للمتابعة
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15">
          <div className="text-[11px] font-bold text-on-surface/65">التجارب المسجلة · Experiments</div>
          <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
            {experimentLogsCount}
          </div>
          <div className="text-[11px] text-on-surface/65 font-medium mt-1">عبر المؤسسات النشطة</div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-on-surface/65">مؤسسات مصنفة · Scored</div>
          <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
            {schoolHealthScores.length}
          </div>
          <div className="text-[11px] text-on-surface/65 font-medium mt-1 tabular-nums">
            {schoolHealthScores.filter((s) => s.totalScore < 60).length} تحتاج متابعة
          </div>
        </div>
      </div>

      {/* Sub-navigation & Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {[
            { id: 'scores', label: 'صحة المؤسسات · School Scores', icon: HeartPulse, count: schoolHealthScores.length },
            { id: 'chemicals', label: 'الكواشف الحرجة · Chemicals', icon: FlaskConical, count: summary.lowStock + summary.expired },
            { id: 'equipment', label: 'العتاد والصيانة · Equipment', icon: Wrench, count: summary.broken },
            { id: 'incidents', label: 'حوادث السلامة · Incidents', icon: ShieldAlert, count: incidents.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as OversightSubTab)}
                className={cn(
                  'px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer',
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface/75 hover:text-primary'
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] opacity-80 tabular-nums">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المؤسسة أو المادة..."
              className="w-full ps-8 pe-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
            />
          </div>

          {subTab === 'scores' && (
            <>
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
              >
                <option value="all">جميع الولايات</option>
                {wilayaOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportHealthCSV}
                className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold text-primary hover:border-primary/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>تصدير CSV</span>
              </button>
            </>
          )}

          {subTab === 'chemicals' && (
            <select
              value={chemFilter}
              onChange={(e) => setChemFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
            >
              <option value="critical">الحرجة فقط (نقص أو منتهية)</option>
              <option value="expired">منتهية الصلاحية فقط</option>
              <option value="low">نقص المخزون فقط</option>
              <option value="all">كافة الكواشف ({chemicals.length})</option>
            </select>
          )}
        </div>
      </div>

      {/* SubTab 1: School Health Scores */}
      {subTab === 'scores' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 text-on-surface/75 font-black">
                <tr>
                  <th className="py-3 px-4 text-start">المؤسسة التربوية · School</th>
                  <th className="py-3 px-3 text-start">الولاية · Wilaya</th>
                  <th className="py-3 px-3 text-center">الطاقم</th>
                  <th className="py-3 px-3 text-center">مؤشر الصحة · Score</th>
                  <th className="py-3 px-3 text-center">تنبيهات المخزون والأمان</th>
                  <th className="py-3 px-3 text-center">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface/50">
                      لا توجد مؤسسات مطابقة لمعايير البحث.
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => (
                    <tr
                      key={sch.id}
                      onClick={() => onSelectSchoolScore(sch)}
                      className="hover:bg-surface-container-low/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-primary">{sch.name}</div>
                        <div className="text-[11px] text-on-surface/60">
                          {sch.cycle} · {sch.commune || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-on-surface/80">{sch.wilaya}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                        {sch.staffCount}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                sch.totalScore >= 80
                                  ? 'bg-emerald-600'
                                  : sch.totalScore >= 60
                                  ? 'bg-primary'
                                  : sch.totalScore >= 40
                                  ? 'bg-amber-600'
                                  : 'bg-error'
                              )}
                              style={{ width: `${sch.totalScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-black tabular-nums">{sch.totalScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px] tabular-nums">
                        {sch.expiredChemicalsCount === 0 &&
                        sch.lowStockCount === 0 &&
                        sch.openIncidentsCount === 0 &&
                        sch.brokenEquipmentCount === 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            سليم
                          </span>
                        ) : (
                          <span className="text-on-surface/80 font-mono">
                            {sch.expiredChemicalsCount > 0 ? `${sch.expiredChemicalsCount} منتهي · ` : ''}
                            {sch.lowStockCount > 0 ? `${sch.lowStockCount} ناقص · ` : ''}
                            {sch.brokenEquipmentCount > 0 ? `${sch.brokenEquipmentCount} عطل · ` : ''}
                            {sch.openIncidentsCount > 0 ? `${sch.openIncidentsCount} حادث` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[11px]">
                        <span
                          className={cn(
                            sch.totalScore >= 80
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : sch.totalScore >= 60
                              ? 'text-primary'
                              : sch.totalScore >= 40
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-error'
                          )}
                        >
                          {sch.gradeLabel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Chemical Watch */}
      {subTab === 'chemicals' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 text-on-surface/75 font-black">
                <tr>
                  <th className="py-3 px-4 text-start">المادة الكيميائية · Reagent</th>
                  <th className="py-3 px-3 text-start">المؤسسة · School</th>
                  <th className="py-3 px-3 text-center">الكمية / الحد</th>
                  <th className="py-3 px-3 text-center">تاريخ الانتهاء</th>
                  <th className="py-3 px-3 text-center">الوضعية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {criticalChemicals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface/50">
                      لا توجد كواشف مطابقة للفرز المحدد.
                    </td>
                  </tr>
                ) : (
                  criticalChemicals.slice(0, 120).map((chem) => {
                    const expired = isExpiredDate(chem.expiryDate);
                    const low = Number(chem.quantity ?? 0) <= Number(chem.minQuantity ?? 5);
                    return (
                      <tr key={`${chem.schoolId}_${chem.id}`} className="hover:bg-surface-container-low/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-primary">
                            {chem.nameAr || chem.name || 'مادة غير مسماة'}
                          </div>
                          <div className="text-[11px] font-mono text-on-surface/60">
                            {chem.formula || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {schoolNameLookup.get(chem.schoolId) || chem.schoolId}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                          {chem.quantity ?? 0} / {chem.minQuantity ?? 5} {chem.unit || ''}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums">
                          {chem.expiryDate || '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {expired ? (
                            <span className="text-error inline-flex items-center gap-1">
                              <AlertTriangle size={12} /> منتهية الصلاحية
                            </span>
                          ) : low ? (
                            <span className="text-amber-700 dark:text-amber-400">نقص في المخزون</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400">جيد</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Broken / Maintenance Equipment */}
      {subTab === 'equipment' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 text-on-surface/75 font-black">
                <tr>
                  <th className="py-3 px-4 text-start">التجهيز · Equipment</th>
                  <th className="py-3 px-3 text-start">المؤسسة · School</th>
                  <th className="py-3 px-3 text-center">الإجمالي / العاطل</th>
                  <th className="py-3 px-3 text-center">الحالة · Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {brokenEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-on-surface/50">
                      لا توجد تجهيزات مصنفة كعاطلة أو قيد الصيانة حالياً.
                    </td>
                  </tr>
                ) : (
                  brokenEquipment.slice(0, 120).map((eq) => (
                    <tr key={`${eq.schoolId}_${eq.id}`} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-primary">{eq.name || 'جهاز غير مسمى'}</div>
                        <div className="text-[11px] text-on-surface/60">{eq.type || 'عتاد مخبري'}</div>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {schoolNameLookup.get(eq.schoolId) || eq.schoolId}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                        {eq.totalQuantity ?? 1} / {eq.brokenQuantity ?? (eq.status === 'broken' ? 1 : 0)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={cn(
                            eq.status === 'broken'
                              ? 'text-error'
                              : 'text-amber-700 dark:text-amber-400'
                          )}
                        >
                          {eq.status === 'broken' ? 'عاطل · Broken' : 'صيانة · Maintenance'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: Safety Incidents */}
      {subTab === 'incidents' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-container-low border-b border-outline/10 text-on-surface/75 font-black">
                <tr>
                  <th className="py-3 px-4 text-start">الحادث / التبليغ · Incident</th>
                  <th className="py-3 px-3 text-start">المؤسسة · School</th>
                  <th className="py-3 px-3 text-center">الخطورة</th>
                  <th className="py-3 px-3 text-center">التاريخ</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface/50">
                      لا توجد حوادث سلامة مسجلة عبر المؤسسات.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => {
                    const resolved = inc.status === 'resolved' || inc.status === 'closed';
                    return (
                      <tr key={`${inc.schoolId}_${inc.id}`} className="hover:bg-surface-container-low/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-primary">{inc.title || 'حادث سلامة'}</div>
                          {inc.description && (
                            <div className="text-[11px] text-on-surface/65 line-clamp-1">
                              {inc.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {schoolNameLookup.get(inc.schoolId) || inc.schoolId}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px]">
                          {inc.severity || 'medium'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] tabular-nums">
                          {formatDateTime(inc.createdAt || inc.date)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {resolved ? (
                            <span className="text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> مغلق
                            </span>
                          ) : (
                            <span className="text-error inline-flex items-center gap-1">
                              <AlertTriangle size={12} /> مفتوح
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over School Health Scorecard Drawer */}
      <AnimatePresence>
        {selectedSchoolScore && (
          <div className="fixed inset-0 z-[90] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelectSchoolScore(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full max-w-lg bg-surface h-full shadow-2xl border-e border-outline/15 flex flex-col z-10 overflow-hidden"
            >
              <div className="p-5 border-b border-outline/10 flex items-center justify-between gap-3 bg-surface-container-lowest">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-primary truncate">
                      {selectedSchoolScore.name}
                    </h3>
                    <p className="text-[11px] text-on-surface/65 truncate">
                      {selectedSchoolScore.wilaya} · {selectedSchoolScore.cycle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSchoolScore(null)}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface/60 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline/15 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-on-surface/70">
                      مؤشر الامتثال الإجمالي · Health Score
                    </div>
                    <div className="text-sm font-black text-primary mt-1">
                      {selectedSchoolScore.gradeLabel}
                    </div>
                  </div>
                  <div className="text-3xl font-black font-mono tabular-nums text-primary">
                    {selectedSchoolScore.totalScore}
                    <span className="text-sm font-bold text-on-surface/50">/100</span>
                  </div>
                </div>

                {/* 4-Pillar Scoring Math */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 space-y-3">
                  <h4 className="text-xs font-black text-primary">
                    تفاصيل المعايير الأربعة · 4-Pillar Breakdown
                  </h4>
                  {[
                    {
                      label: 'اكتمال بيانات المؤسسة · Profile Completeness',
                      score: selectedSchoolScore.pillars.profileScore,
                      max: 25,
                    },
                    {
                      label: 'تغطية الطاقم التربوي والمخبري · Staff Coverage',
                      score: selectedSchoolScore.pillars.staffScore,
                      max: 20,
                    },
                    {
                      label: 'نظافة المخزون والسلامة · Inventory & Safety',
                      score: selectedSchoolScore.pillars.safetyStockScore,
                      max: 35,
                    },
                    {
                      label: 'انضباط التقارير الدورية · Reporting Cadence',
                      score: selectedSchoolScore.pillars.reportingScore,
                      max: 20,
                    },
                  ].map((p) => (
                    <div key={p.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-on-surface/80">{p.label}</span>
                        <span className="font-mono tabular-nums text-primary">
                          {p.score}/{p.max}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.round((p.score / p.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline/15">
                    <div className="text-[11px] text-on-surface/65">المستخدمون المرتبطون</div>
                    <div className="text-lg font-black font-mono tabular-nums text-primary mt-0.5">
                      {selectedSchoolScore.staffCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline/15">
                    <div className="text-[11px] text-on-surface/65">التقارير المحفوظة</div>
                    <div className="text-lg font-black font-mono tabular-nums text-primary mt-0.5">
                      {selectedSchoolScore.reportsCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline/15">
                    <div className="text-[11px] text-on-surface/65">الكواشف (ناقص / منتهي)</div>
                    <div className="text-lg font-black font-mono tabular-nums text-primary mt-0.5">
                      {selectedSchoolScore.chemicalsCount}{' '}
                      <span className="text-[11px] text-error">
                        ({selectedSchoolScore.lowStockCount} / {selectedSchoolScore.expiredChemicalsCount})
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline/15">
                    <div className="text-[11px] text-on-surface/65">العتاد (عاطل) / حوادث</div>
                    <div className="text-lg font-black font-mono tabular-nums text-primary mt-0.5">
                      {selectedSchoolScore.equipmentCount}{' '}
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">
                        ({selectedSchoolScore.brokenEquipmentCount}) · {selectedSchoolScore.openIncidentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-outline/10 bg-surface-container-lowest flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadCSV(
                      `school_scorecard_${selectedSchoolScore.id}.csv`,
                      ['المعيار', 'القيمة'],
                      [
                        ['المؤسسة', selectedSchoolScore.name],
                        ['الولاية', selectedSchoolScore.wilaya],
                        ['المجموع', `${selectedSchoolScore.totalScore}/100`],
                        ['الطاقم', selectedSchoolScore.staffCount],
                        ['الكواشف', selectedSchoolScore.chemicalsCount],
                        ['كواشف ناقصة', selectedSchoolScore.lowStockCount],
                        ['كواشف منتهية', selectedSchoolScore.expiredChemicalsCount],
                        ['تجهيزات عاطلة', selectedSchoolScore.brokenEquipmentCount],
                        ['حوادث مفتوحة', selectedSchoolScore.openIncidentsCount],
                      ]
                    );
                    onShowToast('تم تصدير بطاقة المؤسسة.', 'success');
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} />
                  <span>تصدير بطاقة المؤسسة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSchoolScore(null)}
                  className="px-4 py-2 rounded-lg border border-outline/15 text-xs font-bold text-on-surface/80 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
