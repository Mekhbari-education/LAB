import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { onSnapshot, query, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db, getUserCollection, auth } from '../firebase';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  FileCheck, 
  Printer, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  FlaskConical, 
  Users, 
  Coins, 
  CheckCircle2, 
  Eye, 
  MessageSquare, 
  ChevronRight, 
  X, 
  ExternalLink,
  School 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import DirectorOnboardingModal from '../components/DirectorOnboardingModal';

export default function DirectorPortal() {
  const { schoolId, schoolName, directorate, commune, hasCompletedSchoolSetup } = useSchool();
  const { setRole } = useUserRole();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'visas' | 'safety' | 'inventory' | 'summary'>('visas');
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [chemicalsList, setChemicalsList] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  // Visa Modal state
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [directorRemarks, setDirectorRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!hasCompletedSchoolSetup) {
      setIsOnboardingOpen(true);
    }
  }, [hasCompletedSchoolSetup]);

  useEffect(() => {
    try {
      if (auth.currentUser) {
        const unsubReports = onSnapshot(getUserCollection(schoolId, 'daily_reports'), (snap) => {
          setDailyReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {
          try {
            const cached = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
            if (cached.length) setDailyReports(cached);
          } catch {}
        });

        const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
          setEquipmentList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        const unsubChems = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
          setChemicalsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        const unsubIncidents = onSnapshot(getUserCollection(schoolId, 'safety_incidents'), (snap) => {
          setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        return () => {
          unsubReports();
          unsubEquip();
          unsubChems();
          unsubIncidents();
        };
      } else {
        try {
          const storedReports = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
          setDailyReports(storedReports);
          const storedEquip = JSON.parse(localStorage.getItem('offline_equipment') || '[]');
          setEquipmentList(storedEquip);
          const storedChems = JSON.parse(localStorage.getItem('offline_chemicals') || '[]');
          setChemicalsList(storedChems);
          const storedIncidents = JSON.parse(localStorage.getItem('offline_safety_incidents') || '[]');
          setIncidents(storedIncidents);
        } catch {}
      }
    } catch (e) {
      console.warn('Realtime listener fallback for DirectorPortal', e);
    }
  }, [schoolId]);

  // Handle Principal Final Visa on a Daily Report
  const handleSignDirectorVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsProcessing(true);
    try {
      const updateData = {
        directorNotes: directorRemarks.trim() || 'صودق عليه من طرف مدير المؤسسة.',
        'observations.directorNotes': directorRemarks.trim() || 'صودق عليه من طرف مدير المؤسسة.',
        directorVisa: true,
        directorVisaDate: new Date().toISOString().split('T')[0]
      };

      if (auth.currentUser) {
        await updateDoc(doc(getUserCollection(schoolId, 'daily_reports'), selectedReport.id), updateData);
      } else {
        const stored = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
        const updated = stored.map((r: any) => r.id === selectedReport.id ? { ...r, ...updateData } : r);
        localStorage.setItem('offline_daily_reports', JSON.stringify(updated));
        setDailyReports(updated);
      }

      setNotification({ message: 'تم تسجيل تأشيرة ومصادقة المدير الرسمية على التقرير بنجاح!', type: 'success' });
      setSelectedReport(null);
      setDirectorRemarks('');
    } catch (err) {
      console.error('Error signing report as director:', err);
      setNotification({ message: 'حدث خطأ أثناء حفظ مصادقة المدير.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // KPI Calculations
  const totalEquipCount = equipmentList.length;
  const brokenEquipCount = equipmentList.filter(e => e.status === 'broken' || e.exitDate).length;
  const dangerChemsCount = chemicalsList.filter(c => c.hazardClass === 'danger' || (c.ghs && c.ghs.length > 0)).length;
  const totalSessionsCount = dailyReports.reduce((acc, r) => acc + (r.sessions?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet>
        <title>فضاء مدير المؤسسة | {schoolName}</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-indigo-300 shadow-inner">
              <Building2 size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  لوحة القيادة والمصادقة السيادية
                </span>
                <span className="text-xs text-slate-300">
                  {schoolName} • ولاية {directorate}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                فضاء مدير المؤسسة التعليمية
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                المصادقة الرسمية على التقارير، مراقبة أمان المخابر، وحماية ممتلكات وسجلات المؤسسة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
              title="تهيئة وتأسيس وتحديث قاعدة بيانات المؤسسة التعليمية"
            >
              <School size={16} />
              <span>تهيئة بيانات المؤسسة</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 block mb-1">إجمالي عتاد الجرد العام</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{totalEquipCount}</span>
              <span className="text-[10px] text-indigo-200 font-bold">صنف مقيد</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 block mb-1">الحصص المخبرية المنجزة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{totalSessionsCount}</span>
              <span className="text-[10px] text-emerald-300 font-bold">حصة تطبيقية</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 block mb-1">المواد الكيميائية الخطرة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{dangerChemsCount}</span>
              <span className="text-[10px] text-amber-300 font-bold">مادة مراقبة</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 block mb-1">العتاد التالف / للإسقاط</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{brokenEquipCount}</span>
              <span className="text-[10px] text-error font-bold">عتاد متوقف</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('visas')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'visas'
                ? "bg-white text-slate-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Award size={16} />
            <span>التأشيرة والمصادقة الرسمية</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'safety'
                ? "bg-white text-slate-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <ShieldCheck size={16} />
            <span>الأمان والسلامة الكيميائية</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'inventory'
                ? "bg-white text-slate-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Package size={16} />
            <span>مراقبة سجل الجرد العام</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'summary'
                ? "bg-white text-slate-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <TrendingUp size={16} />
            <span>التقرير الإداري الفصلي</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl text-sm font-bold flex items-center justify-between border shadow-sm",
            notification.type === 'success'
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-error/10 text-error border-error/20"
          )}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70"><X size={16} /></button>
        </motion.div>
      )}

      {/* TAB 1: Principal Visas & Signatures */}
      {activeTab === 'visas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-primary">سجل تأشيرات ومصادقة المدير على التقارير اليومية</h2>
              <p className="text-xs text-secondary mt-0.5">
                تأشيرة رئيس المؤسسة الرسمية بعد فحص ومراجعة تأشيرة ناظر الدروس وملاحظات مسؤول المخبر.
              </p>
            </div>
            <Link
              to={ROUTES.DAILY_REPORT}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>معاينة نموذج التقرير اليومي</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {dailyReports.map((report) => {
              const hasDirectorNotes = !!report.observations?.directorNotes || report.directorVisa;
              const hasCensorNotes = !!report.observations?.supervisorNotes || report.censorVisa;

              return (
                <div
                  key={report.id}
                  className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4 hover:border-indigo-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/50 pb-3">
                    <div>
                      <h3 className="text-base font-black text-primary">
                        تقرير يوم: {report.date} ({report.dayName || 'سجل الحصص'})
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        عدد الحصص المنجزة: <strong>{report.sessions?.length || 0}</strong> • محرر التقرير: {report.sender || 'مسؤول المخبر'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full border",
                          hasDirectorNotes
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                        )}
                      >
                        {hasDirectorNotes ? 'مؤشر ومصادق من المدير ✓' : 'بانتظار مصادقة المدير'}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setDirectorRemarks(report.observations?.directorNotes || '');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Award size={14} />
                        <span>{hasDirectorNotes ? 'تعديل التأشيرة' : 'مصادقة وتأشير المدير'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Observations preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-container-low/50 p-4 rounded-2xl">
                    <div>
                      <strong className="text-secondary block mb-1">ملاحظات مسؤول المخبر:</strong>
                      <p className="text-primary font-bold">{report.observations?.labNotes || 'سير عادي بدون ملاحظات.'}</p>
                    </div>

                    <div>
                      <strong className="text-secondary block mb-1">تأشيرة وملاحظات الناظر:</strong>
                      <p className="text-primary font-bold">
                        {report.observations?.supervisorNotes || 'بانتظار تأشيرة الناظر.'}
                      </p>
                    </div>
                  </div>

                  {report.observations?.directorNotes && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl text-xs">
                      <strong className="text-indigo-900 dark:text-indigo-200 block mb-1">ملاحظات ومصادقة السيد المدير:</strong>
                      <p className="text-primary font-bold">{report.observations.directorNotes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Chemical Safety & Incident Oversight */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h3 className="text-base font-black text-primary flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" />
                <span>حالة السلامة الكيميائية بالمخابر</span>
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                تخضع جميع المواد الكيميائية المخزنة بالمؤسسة لنظام التصنيف المنسق عالمياً (GHS)، مع تطبيق إجراءات العزل للمواد السامة والأكالة وسريعة الاشتعال.
              </p>
              <div className="p-4 rounded-2xl bg-surface-container space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>إجمالي المواد المقيدة:</span>
                  <span className="font-mono text-primary font-black">{chemicalsList.length} مادة</span>
                </div>
                <div className="flex justify-between font-bold text-amber-700 dark:text-amber-400">
                  <span>مواد شديدة الخطورة (تحت القفل):</span>
                  <span className="font-mono font-black">{dangerChemsCount} مادة</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
              <h3 className="text-base font-black text-primary flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                <span>سجل الحوادث والإتلافات المسجلة</span>
              </h3>
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-secondary text-xs">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-2 opacity-50" size={32} />
                  <span>لم تسجل أي حوادث سلامة خلال الفترة الحالية.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {incidents.map(inc => (
                    <div key={inc.id} className="p-3 bg-surface-container rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-error block">{inc.title || inc.item}</strong>
                        <span className="text-secondary">{inc.teacherName} • {inc.date}</span>
                      </div>
                      <span className="text-[10px] font-bold text-secondary">{inc.className}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Inventory Oversight */}
      {activeTab === 'inventory' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
            <div>
              <h3 className="text-base font-black text-primary">المعاينة الإدارية لسجل الجرد العام للمؤسسة</h3>
              <p className="text-xs text-secondary mt-0.5">
                حالة التجهيزات المخبرية، مصدرها، أرقام التسجيل، ومقترحات الشطب والإسقاط.
              </p>
            </div>
            <Link
              to={ROUTES.EQUIPMENT}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>فتح سجل الجرد الكامل</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-2">
            <div className="p-4 rounded-2xl bg-surface-container">
              <span className="text-xl font-black text-primary font-mono block">{equipmentList.length}</span>
              <span className="text-xs text-secondary font-bold">إجمالي التجهيزات</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container">
              <span className="text-xl font-black text-emerald-600 font-mono block">
                {equipmentList.filter(e => e.status === 'functional').length}
              </span>
              <span className="text-xs text-secondary font-bold">عتاد سليم وظيفي</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container">
              <span className="text-xl font-black text-amber-600 font-mono block">
                {equipmentList.filter(e => e.status === 'maintenance').length}
              </span>
              <span className="text-xs text-secondary font-bold">عتاد قيد الصيانة</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container">
              <span className="text-xl font-black text-error font-mono block">
                {brokenEquipCount}
              </span>
              <span className="text-xs text-secondary font-bold">عتاد مقترح للشطب</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Quarterly Summary */}
      {activeTab === 'summary' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-6">
          <div className="border-b border-outline-variant/60 pb-4">
            <h3 className="text-base font-black text-primary">ملخص النشاط المخبري الفصلي الموجه لمديرية التربية</h3>
            <p className="text-xs text-secondary mt-1">
              تقرير إداري تركيبي يعكس مدى تنفيذ الأعمال التطبيقية واستغلال الوسائل التعليمية الممنوحة للمؤسسة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-bold bg-surface-container-low/50 p-6 rounded-2xl">
            <div>
              <span className="text-xs text-secondary block mb-1">المؤسسة التعليمية:</span>
              <p className="text-primary">{schoolName}</p>
            </div>
            <div>
              <span className="text-xs text-secondary block mb-1">الولاية والبلدية:</span>
              <p className="text-primary">{directorate} • {commune}</p>
            </div>
            <div>
              <span className="text-xs text-secondary block mb-1">السنة الدراسية:</span>
              <p className="text-primary font-mono">2025/2026</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2"
            >
              <Printer size={16} />
              <span>طباعة الحصيلة الإدارية للمؤسسة</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Director Visa Sign-off */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface w-full max-w-lg rounded-3xl p-6 border border-outline-variant shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <h3 className="text-base font-black text-primary">
                مصادقة وتأشيرة المدير على تقرير يوم: {selectedReport.date}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSignDirectorVisa} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary block">
                  ملاحظات وتأشيرة السيد مدير المؤسسة:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="مثال: صودق عليه واعتمد بعد الاطلاع على تأشيرة ناظر الدروس وملاحظات مسؤول المخبر..."
                  value={directorRemarks}
                  onChange={e => setDirectorRemarks(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-surface-container text-secondary text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  اعتماد ومصادقة التقرير
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Director School Database Setup & Foundation Wizard */}
      <DirectorOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
