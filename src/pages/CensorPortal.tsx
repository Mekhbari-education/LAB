import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { onSnapshot, query, updateDoc, doc, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, getUserCollection, auth } from '../firebase';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck, 
  Calendar, 
  Users, 
  BarChart3, 
  GraduationCap, 
  FlaskConical, 
  Search, 
  Check, 
  X, 
  MessageSquare, 
  ChevronRight, 
  Printer, 
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export default function CensorPortal() {
  const { schoolId, schoolName } = useSchool();
  const { setRole } = useUserRole();

  const [activeTab, setActiveTab] = useState<'requests' | 'reports' | 'stats' | 'breakages'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [breakages, setBreakages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modal for censor feedback
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [censorNote, setCensorNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Daily report censor visa modal
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportCensorRemarks, setReportCensorRemarks] = useState('');

  useEffect(() => {
    try {
      if (auth.currentUser) {
        // 1. Listen to Activity Requests
        const unsubReqs = onSnapshot(getUserCollection(schoolId, 'activity_requests'), (snap) => {
          setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        // 2. Listen to Daily Reports
        const unsubReports = onSnapshot(getUserCollection(schoolId, 'daily_reports'), (snap) => {
          setDailyReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {
          try {
            const cached = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
            if (cached.length) setDailyReports(cached);
          } catch {}
        });

        // 3. Listen to Safety/Breakage Incidents
        const unsubBreakages = onSnapshot(getUserCollection(schoolId, 'safety_incidents'), (snap) => {
          setBreakages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        return () => {
          unsubReqs();
          unsubReports();
          unsubBreakages();
        };
      } else {
        // Offline / Role session without direct auth user
        try {
          const storedReqs = JSON.parse(localStorage.getItem('offline_activity_requests') || '[]');
          setRequests(storedReqs);
          const storedReports = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
          setDailyReports(storedReports);
          const storedBreakages = JSON.parse(localStorage.getItem('offline_safety_incidents') || '[]');
          setBreakages(storedBreakages);
        } catch {}
      }
    } catch (e) {
      console.warn('Realtime listener fallback for CensorPortal', e);
    }
  }, [schoolId]);

  // Approve a Teacher's request
  const handleApproveRequest = async (request: any) => {
    setIsProcessing(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(getUserCollection(schoolId, 'activity_requests'), request.id), {
          status: 'approved',
          censorApprovedAt: new Date().toISOString(),
          censorNotes: censorNote.trim() || request.censorNotes || 'معتمد من ناظر الدروس بدون تحفظ.'
        });
      } else {
        const stored = JSON.parse(localStorage.getItem('offline_activity_requests') || '[]');
        const updated = stored.map((r: any) => r.id === request.id ? { ...r, status: 'approved', censorNotes: censorNote } : r);
        localStorage.setItem('offline_activity_requests', JSON.stringify(updated));
        setRequests(updated);
      }

      setNotification({ message: `تم اعتماد طلب الحصة للأستاذ ${request.teacherName} بنجاح!`, type: 'success' });
      setSelectedRequest(null);
      setCensorNote('');
    } catch (err) {
      console.error('Error approving request:', err);
      setNotification({ message: 'حدث خطأ أثناء اعتماد الطلب.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Reject / Request modification
  const handleRejectRequest = async (request: any) => {
    if (!censorNote.trim()) {
      setNotification({ message: 'يرجى كتابة سبب الرفض أو التعديل المطلوب لتبليغ الأستاذ.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(getUserCollection(schoolId, 'activity_requests'), request.id), {
          status: 'rejected',
          censorRejectedAt: new Date().toISOString(),
          censorNotes: censorNote.trim()
        });
      } else {
        const stored = JSON.parse(localStorage.getItem('offline_activity_requests') || '[]');
        const updated = stored.map((r: any) => r.id === request.id ? { ...r, status: 'rejected', censorNotes: censorNote } : r);
        localStorage.setItem('offline_activity_requests', JSON.stringify(updated));
        setRequests(updated);
      }

      setNotification({ message: `تم تسجيل التحفظ وإشعار الأستاذ ${request.teacherName} بالتعديل.`, type: 'success' });
      setSelectedRequest(null);
      setCensorNote('');
    } catch (err) {
      console.error('Error rejecting request:', err);
      setNotification({ message: 'حدث خطأ أثناء حفظ القرار.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Save Censor Visa on a Daily Report
  const handleSaveReportVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsProcessing(true);
    try {
      const updateData = {
        supervisorNotes: reportCensorRemarks.trim(),
        'observations.supervisorNotes': reportCensorRemarks.trim(),
        censorVisa: true,
        censorVisaDate: new Date().toISOString().split('T')[0]
      };

      if (auth.currentUser) {
        await updateDoc(doc(getUserCollection(schoolId, 'daily_reports'), selectedReport.id), updateData);
      } else {
        const stored = JSON.parse(localStorage.getItem('offline_daily_reports') || '[]');
        const updated = stored.map((r: any) => r.id === selectedReport.id ? { ...r, ...updateData } : r);
        localStorage.setItem('offline_daily_reports', JSON.stringify(updated));
        setDailyReports(updated);
      }

      setNotification({ message: 'تم حفظ تأشيرة الناظر وملاحظاته على التقرير اليومي بنجاح!', type: 'success' });
      setSelectedReport(null);
      setReportCensorRemarks('');
    } catch (err) {
      console.error('Error signing daily report:', err);
      setNotification({ message: 'حدث خطأ أثناء حفظ التأشيرة.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Metrics computation
  const pendingCount = requests.filter(r => r.status === 'pending' || !r.status).length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const reportsAwaitingVisa = dailyReports.filter(r => !r.censorVisa && !r.observations?.supervisorNotes).length;

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      (r.activityTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.className || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending') return matchesSearch && (r.status === 'pending' || !r.status);
    if (filterStatus === 'approved') return matchesSearch && r.status === 'approved';
    if (filterStatus === 'rejected') return matchesSearch && r.status === 'rejected';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet>
        <title>فضاء ناظر الدروس | {schoolName}</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-200 shadow-inner">
              <FileCheck size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  الإشراف والمتابعة البيداغوجية
                </span>
                <span className="text-xs text-emerald-100/80">
                  {schoolName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                لوحة قيادة ناظر الدروس
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                اعتماد طلبات التجارب والحصص المخبرية، تأشير التقارير اليومية، وتنسيق العمل البيداغوجي.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <span className="text-[11px] text-emerald-100/80 block mb-1">طلبات بانتظار الاعتماد</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{pendingCount}</span>
              <span className="text-[10px] text-amber-300 font-bold">طلب جديد</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <span className="text-[11px] text-emerald-100/80 block mb-1">حصص معتمدة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{approvedCount}</span>
              <span className="text-[10px] text-emerald-300 font-bold">حصة</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <span className="text-[11px] text-emerald-100/80 block mb-1">تقارير بانتظار التأشيرة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{reportsAwaitingVisa}</span>
              <span className="text-[10px] text-amber-200 font-bold">تقرير</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <span className="text-[11px] text-emerald-100/80 block mb-1">تبليغات الإتلاف</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{breakages.length}</span>
              <span className="text-[10px] text-white/80 font-bold">حادثة</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'requests'
                ? "bg-white text-emerald-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Clock size={16} />
            <span>اعتماد طلبات الحصص المخبرية</span>
            {pendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'reports'
                ? "bg-white text-emerald-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <FileText size={16} />
            <span>تأشيرة التقارير اليومية</span>
            {reportsAwaitingVisa > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono">
                {reportsAwaitingVisa}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'stats'
                ? "bg-white text-emerald-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <BarChart3 size={16} />
            <span>المؤشرات البيداغوجية والتوزيع</span>
          </button>

          <button
            onClick={() => setActiveTab('breakages')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'breakages'
                ? "bg-white text-emerald-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <AlertTriangle size={16} />
            <span>سجل الإتلاف والحوادث</span>
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

      {/* TAB 1: Teacher Requests Management */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-3xl border border-outline-variant">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <input
                type="text"
                placeholder="بحث باسم الأستاذ، عنوان النشاط، أو القسم..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container pl-4 pr-10 py-2.5 rounded-2xl border border-outline-variant text-sm font-bold focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-2xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  filterStatus === 'all' ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary"
                )}
              >
                الكل ({requests.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  filterStatus === 'pending' ? "bg-amber-500 text-white shadow-sm font-black" : "text-secondary hover:text-primary"
                )}
              >
                قيد الانتظار ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  filterStatus === 'approved' ? "bg-emerald-600 text-white shadow-sm font-black" : "text-secondary hover:text-primary"
                )}
              >
                معتمد ({approvedCount})
              </button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-surface rounded-3xl p-12 text-center border border-outline-variant/60">
              <Clock className="mx-auto text-secondary mb-3 opacity-40" size={44} />
              <p className="text-base font-bold text-primary">لا توجد طلبات تطابق معايير البحث</p>
              <p className="text-xs text-secondary mt-1">
                عند قيام الأساتذة بإرسال طلبات حصص جديدة، ستظهر هنا مباشرة لمراجعتها واعتمادها.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => {
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isPending = !isApproved && !isRejected;

                return (
                  <div
                    key={req.id}
                    className={cn(
                      "bg-surface rounded-3xl p-6 border shadow-sm transition-all space-y-4",
                      isPending ? "border-amber-300 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10" : "border-outline-variant"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/50 pb-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-black text-primary">{req.activityTitle}</h3>
                          <span
                            className={cn(
                              "text-[10px] font-black px-2.5 py-0.5 rounded-full border",
                              isApproved && "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
                              isRejected && "bg-error/10 text-error border-error/30",
                              isPending && "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                            )}
                          >
                            {isApproved ? 'معتمد' : isRejected ? 'مرفوض' : 'في انتظار التأشيرة'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-1 flex items-center gap-2 flex-wrap">
                          <span>الأستاذ: <strong>{req.teacherName}</strong> ({req.teacherSubject})</span>
                          <span>•</span>
                          <span>القسم: <strong>{req.className}</strong> ({req.groupName})</span>
                          <span>•</span>
                          <span>المخبر: <strong>{req.lab}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant">
                          {req.executionDate} | {req.timing}
                        </span>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              <span>اعتماد</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setCensorNote(req.censorNotes || '');
                              }}
                              className="px-3 py-2 bg-surface-container text-error hover:bg-error/10 rounded-xl text-xs font-bold border border-outline-variant transition-all flex items-center gap-1"
                            >
                              <X size={14} />
                              <span>تحفظ / تعديل</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Materials requested */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-surface-container-low/50 p-4 rounded-2xl">
                      <div>
                        <strong className="text-secondary block mb-1">العتاد والزجاجيات المطلوبة:</strong>
                        {req.equipItems && req.equipItems.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-primary font-bold">
                            {req.equipItems.map((e: any, i: number) => (
                              <li key={i}>{e.name} — <span className="font-mono text-secondary">{e.quantity}</span></li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-secondary italic">لا يوجد عتاد محدد</span>
                        )}
                      </div>

                      <div>
                        <strong className="text-secondary block mb-1">المواد والمحاليل الكيميائية:</strong>
                        {req.chemItems && req.chemItems.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-primary font-bold">
                            {req.chemItems.map((c: any, i: number) => (
                              <li key={i}>{c.name} — <span className="font-mono text-secondary">{c.quantity}</span></li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-secondary italic">لا توجد مواد كيميائية</span>
                        )}
                      </div>
                    </div>

                    {req.censorNotes && (
                      <div className="text-xs p-3 bg-surface-container rounded-xl text-primary font-bold border border-outline-variant">
                        <strong>ملاحظة ناظر الدروس:</strong> {req.censorNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Daily Reports Censor Visa */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-primary">تأشيرة وملاحظات الناظر على التقارير اليومية</h2>
              <p className="text-xs text-secondary mt-0.5">
                تأشيرة ناظر الدروس الرسمية على سجل الحصص المخبرية المنجزة اليومية للمؤسسة.
              </p>
            </div>
            <Link
              to={ROUTES.DAILY_REPORT}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>فتح صفحة التقرير اليومي الكاملة</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {dailyReports.map((report) => {
              const hasSupervisorNotes = !!report.observations?.supervisorNotes;

              return (
                <div
                  key={report.id}
                  className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm hover:border-emerald-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/50 pb-3">
                    <div>
                      <h3 className="text-base font-black text-primary">
                        تقرير يوم: {report.date} ({report.dayName || 'سجل الحصص'})
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        عدد الحصص المنجزة: <strong>{report.sessions?.length || 0}</strong> • مسؤول المخبر: {report.sender || 'محرر التقرير'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full border",
                          hasSupervisorNotes
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                        )}
                      >
                        {hasSupervisorNotes ? 'مؤشر من الناظر ✓' : 'بانتظار تأشيرة الناظر'}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setReportCensorRemarks(report.observations?.supervisorNotes || '');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare size={14} />
                        <span>{hasSupervisorNotes ? 'تعديل التأشيرة' : 'تأشير التقرير'}</span>
                      </button>
                    </div>
                  </div>

                  {report.observations?.supervisorNotes && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs">
                      <strong className="text-emerald-900 dark:text-emerald-200 block mb-1">ملاحظات وتأشيرة ناظر الدروس:</strong>
                      <p className="text-primary font-bold">{report.observations.supervisorNotes}</p>
                    </div>
                  )}

                  {/* Sessions table preview */}
                  {report.sessions && report.sessions.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right">
                        <thead>
                          <tr className="text-secondary border-b border-outline-variant/40">
                            <th className="py-2 px-3">التوقيت</th>
                            <th className="py-2 px-3">الأستاذ</th>
                            <th className="py-2 px-3">المستوى / الفوج</th>
                            <th className="py-2 px-3">النشاط التجريبي</th>
                            <th className="py-2 px-3">المخبر</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30 font-bold text-primary">
                          {report.sessions.map((s: any, idx: number) => (
                            <tr key={idx} className="hover:bg-surface-container/30">
                              <td className="py-2 px-3 font-mono">{s.timing}</td>
                              <td className="py-2 px-3">{s.teacherName}</td>
                              <td className="py-2 px-3">{s.className} ({s.groupName})</td>
                              <td className="py-2 px-3">{s.experimentTitle}</td>
                              <td className="py-2 px-3">{s.roomName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Pedagogical Statistics & Distribution */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
            <h3 className="text-base font-black text-primary">توزيع الحصص حسب المادة</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>علوم الطبيعة والحياة</span>
                  <span className="font-mono">55%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>العلوم الفيزيائية</span>
                  <span className="font-mono">35%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>التكنولوجيا والهندسة</span>
                  <span className="font-mono">10%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
            <h3 className="text-base font-black text-primary">جاهزية المخابر والأفواج المؤطرة</h3>
            <p className="text-xs text-secondary leading-relaxed">
              تضمن المنصة التوزيع العادل للأفواج التربوية على قاعات المخابر الثلاث، مع مراعاة الحجم الساعي الأسبوعي المقرر رسمياً في المنهاج لكل تخصص.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-4 rounded-2xl bg-surface-container">
                <span className="text-2xl font-black text-primary font-mono block">100%</span>
                <span className="text-xs text-secondary font-bold">تغطية البرامج</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container">
                <span className="text-2xl font-black text-primary font-mono block">24</span>
                <span className="text-xs text-secondary font-bold">فوج تربوي</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container">
                <span className="text-2xl font-black text-primary font-mono block">03</span>
                <span className="text-xs text-secondary font-bold">مخابر متخصصة</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Breakage overview */}
      {activeTab === 'breakages' && (
        <div className="space-y-4">
          <div className="border-b border-outline-variant/60 pb-3">
            <h2 className="text-lg font-black text-primary">سجل حوادث الإتلاف والكسر المحالة للإشراف</h2>
            <p className="text-xs text-secondary mt-0.5">
              متابعة محاضر الإتلاف المسجلة من طرف الأساتذة ومسؤولي المخابر لتقدير المسؤوليات والتعويضات.
            </p>
          </div>

          {breakages.length === 0 ? (
            <div className="bg-surface rounded-3xl p-12 text-center border border-outline-variant/60">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-3 opacity-60" size={44} />
              <p className="text-base font-bold text-primary">لا توجد حوادث إتلاف مسجلة</p>
              <p className="text-xs text-secondary mt-1">جميع الأجهزة والزجاجيات في حالة سليمة ومستقرة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {breakages.map(b => (
                <div key={b.id} className="bg-surface p-5 rounded-2xl border border-outline-variant flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-error">{b.title || b.item}</h4>
                    <p className="text-xs text-secondary mt-1">
                      القسم: {b.className} • الطاولة: {b.benchNumber} • الأستاذ: {b.teacherName} • التاريخ: {b.date}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-secondary bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant">
                    {b.description || 'كسر أثناء التجربة'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Censor Remark on Activity Request */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface w-full max-w-lg rounded-3xl p-6 border border-outline-variant shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <h3 className="text-base font-black text-primary">إبداء ملاحظة / تحفظ على طلب الحصة</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1 text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs text-secondary">
                النشاط: <strong>{selectedRequest.activityTitle}</strong> (الأستاذ: {selectedRequest.teacherName})
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary block">
                ملاحظة وتوجيهات الناظر (ستظهر للأستاذ في فضاء متابعة طلباته):
              </label>
              <textarea
                rows={4}
                required
                placeholder="اكتب التوجيهات أو سبب التحفظ..."
                value={censorNote}
                onChange={e => setCensorNote(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-surface-container text-secondary text-xs font-bold rounded-xl hover:bg-outline-variant/30"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleRejectRequest(selectedRequest)}
                disabled={isProcessing}
                className="px-5 py-2 bg-error text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                تسجيل التحفظ وإشعار الأستاذ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Daily Report Visa */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface w-full max-w-lg rounded-3xl p-6 border border-outline-variant shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <h3 className="text-base font-black text-primary">
                تأشيرة الناظر على تقرير يوم: {selectedReport.date}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReportVisa} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary block">
                  ملاحظات وتوجيهات ناظر الدروس الرسمية:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="مثال: لوحظ الالتزام بالبرنامج الوزاري مع ضرورة ترشيد استهلاك المواد، الحصص منجزة بانتظام..."
                  value={reportCensorRemarks}
                  onChange={e => setReportCensorRemarks(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-emerald-500 outline-none resize-none"
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  حفظ وتأشير التقرير
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
