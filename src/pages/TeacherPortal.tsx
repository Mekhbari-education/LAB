import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { onSnapshot, query, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, getUserCollection, auth } from '../firebase';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  FlaskConical, 
  Beaker, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Send, 
  RefreshCw, 
  Search, 
  BookOpen, 
  Layers, 
  FileText, 
  Printer, 
  ExternalLink, 
  UserCheck, 
  Info, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

import { Teacher } from '../types/teachers';
import { getTeachers } from '../lib/api/teachers';

interface RequestItem {
  id: string;
  name: string;
  quantity: string | number;
}

export default function TeacherPortal() {
  const { schoolId, schoolName, directorate, commune } = useSchool();
  const { teacherProfile, setRole, setTeacherLogin } = useUserRole();

  const [activeTab, setActiveTab] = useState<'request' | 'my-requests' | 'breakage' | 'schedule'>('request');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [isSelectingProfile, setIsSelectingProfile] = useState(!teacherProfile);
  const [codeInput, setCodeInput] = useState('');

  // Available equipment and chemicals for dropdown selection
  const [availableEquip, setAvailableEquip] = useState<{ id: string; name: string }[]>([]);
  const [availableChems, setAvailableChems] = useState<{ id: string; name: string; formula?: string }[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myBreakages, setMyBreakages] = useState<any[]>([]);

  // Lab Booking Form State
  const [activityTitle, setActivityTitle] = useState('');
  const [className, setClassName] = useState('');
  const [groupName, setGroupName] = useState('الفوج 01');
  const [executionDate, setExecutionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timing, setTiming] = useState('08:00 - 10:00');
  const [lab, setLab] = useState('مخبر العلوم الطبيعية والحياة');
  const [pedagogicalObjective, setPedagogicalObjective] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [requestedEquip, setRequestedEquip] = useState<RequestItem[]>([
    { id: '1', name: '', quantity: '1' }
  ]);
  const [requestedChems, setRequestedChems] = useState<RequestItem[]>([
    { id: '1', name: '', quantity: '100 ml' }
  ]);

  // Breakage Form State
  const [breakageItem, setBreakageItem] = useState('');
  const [breakageBench, setBreakageBench] = useState('1');
  const [breakageStudentClass, setBreakageStudentClass] = useState('');
  const [breakageDescription, setBreakageDescription] = useState('');

  const teacherName = teacherProfile?.name || 'الأستاذ(ة)';
  const teacherSubject = teacherProfile?.subject || 'العلوم التجريبية';
  const teacherCode = teacherProfile?.functionalCode || '---';

  // Load inventory lists and teacher's previous requests
  useEffect(() => {
    try {
      if (auth.currentUser) {
        const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
          setAvailableEquip(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        }, () => {});

        const unsubChems = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
          setAvailableChems(snap.docs.map(d => ({ id: d.id, name: d.data().nameAr || d.data().nameEn, formula: d.data().formula })));
        }, () => {});

        const unsubReqs = onSnapshot(getUserCollection(schoolId, 'activity_requests'), (snap) => {
          const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          // Filter by teacher name if set
          const filtered = teacherProfile?.name 
            ? reqs.filter((r: any) => r.teacherName === teacherProfile.name)
            : reqs;
          setMyRequests(filtered);
        }, () => {});

        const unsubBreakages = onSnapshot(getUserCollection(schoolId, 'safety_incidents'), (snap) => {
          const incs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const filtered = teacherProfile?.name 
            ? incs.filter((i: any) => i.teacherName === teacherProfile.name)
            : incs;
          setMyBreakages(filtered);
        }, () => {});

        return () => {
          unsubEquip();
          unsubChems();
          unsubReqs();
          unsubBreakages();
        };
      }
    } catch (e) {
      console.warn('Realtime listener fallback for TeacherPortal', e);
    }
  }, [schoolId, teacherProfile]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const list = await getTeachers();
        if (Array.isArray(list) && list.length > 0) {
          setTeachersList(list);
        }
      } catch (err) {
        console.warn('Could not load teachers in TeacherPortal', err);
      }
    };
    loadTeachers();
  }, []);

  const handleVerifyCode = (codeToVerify?: string) => {
    const code = (codeToVerify || codeInput).trim();
    if (!code) return;
    const found = teachersList.find(t => 
      (t.functionalCode && t.functionalCode.trim().toLowerCase() === code.toLowerCase()) ||
      (t.name && t.name.trim().toLowerCase() === code.toLowerCase())
    );
    if (found) {
      setTeacherLogin(found);
      setIsSelectingProfile(false);
      setCodeInput('');
      setNotification({ message: `مرحباً بك، أستاذ(ة) ${found.name}`, type: 'success' });
    } else {
      const customTeacher: Teacher = {
        id: `teacher-${Date.now()}`,
        functionalCode: code,
        name: `أستاذ (${code})`,
        firstName: 'أستاذ',
        lastName: code,
        subject: 'العلوم التجريبية',
        rank: 'أستاذ التعليم الثانوي',
        birthDate: '',
        grade: '',
        effectiveDate: '',
        email: '',
        levels: []
      };
      setTeacherLogin(customTeacher);
      setIsSelectingProfile(false);
      setCodeInput('');
      setNotification({ message: `تم الدخول بالرمز الوظيفي: ${code}`, type: 'success' });
    }
  };

  // Handle Equipment row management
  const addEquipRow = () => {
    setRequestedEquip(prev => [...prev, { id: Date.now().toString(), name: '', quantity: '1' }]);
  };
  const removeEquipRow = (id: string) => {
    if (requestedEquip.length > 1) {
      setRequestedEquip(prev => prev.filter(r => r.id !== id));
    }
  };
  const updateEquipRow = (id: string, field: 'name' | 'quantity', val: any) => {
    setRequestedEquip(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // Handle Chemicals row management
  const addChemRow = () => {
    setRequestedChems(prev => [...prev, { id: Date.now().toString(), name: '', quantity: '50 ml' }]);
  };
  const removeChemRow = (id: string) => {
    if (requestedChems.length > 1) {
      setRequestedChems(prev => prev.filter(r => r.id !== id));
    }
  };
  const updateChemRow = (id: string, field: 'name' | 'quantity', val: any) => {
    setRequestedChems(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // Submit Activity Request
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      setNotification({ message: 'يرجى إدخال عنوان النشاط أو التجربة المخبرية.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        teacherName,
        teacherSubject,
        teacherCode,
        activityTitle: activityTitle.trim(),
        className: className.trim() || 'فوج غير محدد',
        groupName,
        executionDate,
        timing,
        lab,
        pedagogicalObjective: pedagogicalObjective.trim(),
        specialInstructions: specialInstructions.trim(),
        equipItems: requestedEquip.filter(e => e.name.trim() !== ''),
        chemItems: requestedChems.filter(c => c.name.trim() !== ''),
        status: 'pending', // 'pending' | 'approved' | 'rejected'
        censorNotes: '',
        createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        requestDate: new Date().toISOString().split('T')[0]
      };

      if (auth.currentUser) {
        await addDoc(getUserCollection(schoolId, 'activity_requests'), payload);
      } else {
        // LocalStorage fallback
        const existing = JSON.parse(localStorage.getItem('offline_activity_requests') || '[]');
        localStorage.setItem('offline_activity_requests', JSON.stringify([{ id: Date.now().toString(), ...payload }, ...existing]));
      }

      setNotification({ message: 'تم إرسال طلب الحصة المخبرية بنجاح إلى ناظر الدروس ومسؤول المخبر!', type: 'success' });
      setActivityTitle('');
      setPedagogicalObjective('');
      setSpecialInstructions('');
      setRequestedEquip([{ id: '1', name: '', quantity: '1' }]);
      setRequestedChems([{ id: '1', name: '', quantity: '100 ml' }]);
      setActiveTab('my-requests');
    } catch (err: any) {
      console.error('Error submitting activity request:', err);
      setNotification({ message: 'تعذر إرسال الطلب. يرجى إعادة المحاولة.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Submit Breakage Report
  const handleSubmitBreakage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakageItem.trim()) {
      setNotification({ message: 'يرجى تحديد العتاد الزجاجي أو المادة التالفة.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: `إتلاف عتاد: ${breakageItem}`,
        description: breakageDescription.trim(),
        item: breakageItem.trim(),
        benchNumber: breakageBench,
        className: breakageStudentClass.trim() || className || 'قسم غير محدد',
        teacherName,
        teacherSubject,
        date: new Date().toISOString().split('T')[0],
        status: 'reported',
        severity: 'medium',
        createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
      };

      if (auth.currentUser) {
        await addDoc(getUserCollection(schoolId, 'safety_incidents'), payload);
      } else {
        const existing = JSON.parse(localStorage.getItem('offline_safety_incidents') || '[]');
        localStorage.setItem('offline_safety_incidents', JSON.stringify([{ id: Date.now().toString(), ...payload }, ...existing]));
      }

      setNotification({ message: 'تم تسجيل تقرير الإتلاف بنجاح وإحالته لمسؤول المخبر والإدارة.', type: 'success' });
      setBreakageItem('');
      setBreakageDescription('');
    } catch (err: any) {
      console.error('Error submitting breakage report:', err);
      setNotification({ message: 'حدث خطأ أثناء حفظ تقرير الإتلاف.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet>
        <title>فضاء الأستاذ | {schoolName}</title>
      </Helmet>

      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-200 shadow-inner">
              <GraduationCap size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  فضاء الأستاذ المخصص
                </span>
                <span className="text-xs text-sky-200/80 font-mono">
                  رقم التعريف الوظيفي: {teacherCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                أهلاً بك، {teacherName}
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-1 flex items-center gap-2">
                <span>مادة: <strong>{teacherSubject}</strong></span>
                <span>•</span>
                <span>{schoolName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsSelectingProfile(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              title="تغيير الأستاذ أو الرمز الوظيفي"
            >
              <UserCheck size={14} />
              <span>تغيير الأستاذ</span>
            </button>
          </div>
        </div>

        {/* Profile Selection Modal / Overlay */}
        <AnimatePresence>
          {isSelectingProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              dir="rtl"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface text-foreground rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-outline/20 relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-primary">تسجيل دخول الأستاذ</h3>
                      <p className="text-xs text-secondary">أدخل رقمك الوظيفي أو اختر اسمك من السجل</p>
                    </div>
                  </div>
                  {teacherProfile && (
                    <button
                      onClick={() => setIsSelectingProfile(false)}
                      className="p-2 text-secondary hover:text-primary rounded-full hover:bg-secondary-container/40"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }} className="space-y-3">
                    <label className="block text-xs font-bold text-secondary">
                      رقم التعريف الوظيفي للأستاذ (Code Fonctionnel)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="مثال: 2024-PHYS-01"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="flex-1 bg-surface-container border border-outline/20 rounded-xl py-2.5 px-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-sm"
                      >
                        دخول
                      </button>
                    </div>
                  </form>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-secondary">أو اختر أستاذك مباشرة من القائمة:</span>
                      <span className="text-[10px] text-sky-600 font-bold font-mono">({teachersList.length} أستاذ)</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1.5 p-1 no-scrollbar border border-outline/10 rounded-2xl">
                      {teachersList.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleVerifyCode(t.functionalCode)}
                          className="w-full text-start p-2.5 bg-surface hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl border border-outline/5 hover:border-sky-300 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black text-xs shrink-0">
                              {t.name.slice(0, 1) || 'أ'}
                            </div>
                            <div>
                              <p className="text-xs font-bold group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors leading-tight">{t.name}</p>
                              <p className="text-[10px] text-secondary">{t.subject} • الرمز: <span className="font-mono text-sky-600 font-bold">{t.functionalCode}</span></p>
                            </div>
                          </div>
                          <CheckCircle2 size={16} className="text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('request')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'request'
                ? "bg-white text-sky-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Plus size={16} />
            <span>طلب حصة مخبرية وتجهيز</span>
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap relative",
              activeTab === 'my-requests'
                ? "bg-white text-sky-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Clock size={16} />
            <span>متابعة طلباتي</span>
            {myRequests.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500 text-white font-mono">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('breakage')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'breakage'
                ? "bg-white text-sky-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <AlertTriangle size={16} />
            <span>تبليغ عن إتلاف أو كسر</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'schedule'
                ? "bg-white text-sky-950 shadow-md font-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Calendar size={16} />
            <span>الأدوات العلمية والمحاكاة</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "p-4 rounded-2xl text-sm font-bold flex items-center justify-between border shadow-sm",
            notification.type === 'success' 
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-error/10 text-error border-error/20"
          )}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* TAB 1: Booking & Material Request */}
      {activeTab === 'request' && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitBooking}
          className="space-y-6"
        >
          {/* General Information Card */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-6">
            <div className="border-b border-outline-variant/60 pb-4">
              <h2 className="text-lg font-black text-primary flex items-center gap-2">
                <FlaskConical className="text-sky-600 dark:text-sky-400" />
                <span>بيانات الحصة والتجربة المخبرية</span>
              </h2>
              <p className="text-xs text-secondary mt-1">
                املأ تفاصيل الحصة ليتم إشعار مسؤول المخبر بتحضير العتاد وإشعار ناظر الدروس للاعتماد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-secondary block">
                  عنوان النشاط أو التجربة المخبرية <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعيين كمية المادة عن طريق المعايرة اللونية، أو فحص خلايا نباتية بالمجهر..."
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary block">
                  المخبر المستهدف
                </label>
                <select
                  value={lab}
                  onChange={e => setLab(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                >
                  <option value="مخبر العلوم الطبيعية والحياة">مخبر العلوم الطبيعية والحياة</option>
                  <option value="مخبر العلوم الفيزيائية والكيمياء">مخبر العلوم الفيزيائية والكيمياء</option>
                  <option value="مخبر التكنولوجيا">مخبر التكنولوجيا</option>
                  <option value="مخبر متعدد الاختصاصات">مخبر متعدد الاختصاصات</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary block">
                  القسم / المستوى
                </label>
                <input
                  type="text"
                  placeholder="مثال: 3 ع ت 1، أو 2 ر 2"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary block">
                  الفوج
                </label>
                <select
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                >
                  <option value="الفوج 01">الفوج 01</option>
                  <option value="الفوج 02">الفوج 02</option>
                  <option value="القسم كاملاً">القسم كاملاً</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary block">
                  تاريخ الإنجاز المطلوب
                </label>
                <input
                  type="date"
                  required
                  value={executionDate}
                  onChange={e => setExecutionDate(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary block">
                  التوقيت الزمني
                </label>
                <select
                  value={timing}
                  onChange={e => setTiming(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                >
                  <option value="08:00 - 09:00">08:00 - 09:00</option>
                  <option value="08:00 - 10:00">08:00 - 10:00</option>
                  <option value="10:00 - 11:00">10:00 - 11:00</option>
                  <option value="10:00 - 12:00">10:00 - 12:00</option>
                  <option value="13:30 - 14:30">13:30 - 14:30</option>
                  <option value="13:30 - 15:30">13:30 - 15:30</option>
                  <option value="15:30 - 16:30">15:30 - 16:30</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-secondary block">
                  الهدف البيداغوجي / الكفاءة المستهدفة
                </label>
                <input
                  type="text"
                  placeholder="مثال: التعرف على مراحل الانقسام الخيطي المتساوي بالمجهر..."
                  value={pedagogicalObjective}
                  onChange={e => setPedagogicalObjective(e.target.value)}
                  className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Requested Equipment Table */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3 className="text-base font-black text-primary flex items-center gap-2">
                  <Beaker className="text-sky-600 dark:text-sky-400" size={20} />
                  <span>العتاد والزجاجيات المطلوبة</span>
                </h3>
                <p className="text-xs text-secondary mt-0.5">حدد الأجهزة والزجاجيات المطلوبة لكل طاولة أو للتجربة.</p>
              </div>
              <button
                type="button"
                onClick={addEquipRow}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 rounded-xl text-xs font-bold hover:bg-sky-100 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>إضافة صنف عتاد</span>
              </button>
            </div>

            <div className="space-y-2">
              {requestedEquip.map((row, idx) => (
                <div key={row.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-secondary w-6 text-center">{idx + 1}</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      list="available-equip-list"
                      placeholder="اسم الجهاز أو العتاد الزجاجي (مثال: بيشر 250 مل، مجهر ضوئي...)"
                      value={row.name}
                      onChange={e => updateEquipRow(row.id, 'name', e.target.value)}
                      className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-bold focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="text"
                      placeholder="الكمية"
                      value={row.quantity}
                      onChange={e => updateEquipRow(row.id, 'quantity', e.target.value)}
                      className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-bold text-center focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  {requestedEquip.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquipRow(row.id)}
                      className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <datalist id="available-equip-list">
                {availableEquip.map(e => <option key={e.id} value={e.name} />)}
              </datalist>
            </div>
          </div>

          {/* Requested Chemicals Table */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3 className="text-base font-black text-primary flex items-center gap-2">
                  <FlaskConical className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <span>المواد والمحاليل الكيميائية المطلوبة</span>
                </h3>
                <p className="text-xs text-secondary mt-0.5">حدد المحاليل أو الكواشف والتركيز المطلوب تحضيره.</p>
              </div>
              <button
                type="button"
                onClick={addChemRow}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>إضافة مادة كيميائية</span>
              </button>
            </div>

            <div className="space-y-2">
              {requestedChems.map((row, idx) => (
                <div key={row.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-secondary w-6 text-center">{idx + 1}</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      list="available-chems-list"
                      placeholder="اسم المادة أو المحلول (مثال: هيدروكسيد الصوديوم 0.1M، ماء مقطر، أزرق الميثيلين...)"
                      value={row.name}
                      onChange={e => updateChemRow(row.id, 'name', e.target.value)}
                      className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="text"
                      placeholder="الكمية / الحجم"
                      value={row.quantity}
                      onChange={e => updateChemRow(row.id, 'quantity', e.target.value)}
                      className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-bold text-center focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  {requestedChems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChemRow(row.id)}
                      className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <datalist id="available-chems-list">
                {availableChems.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send size={18} />
              <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب الحصة المخبرية'}</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* TAB 2: My Requests Tracker */}
      {activeTab === 'my-requests' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-primary">سجل طلباتي ومتابعة حالتها</h2>
            <span className="text-xs text-secondary font-mono">إجمالي الطلبات: {myRequests.length}</span>
          </div>

          {myRequests.length === 0 ? (
            <div className="bg-surface rounded-3xl p-12 text-center border border-outline-variant/60">
              <FlaskConical className="mx-auto text-secondary mb-3 opacity-40" size={48} />
              <p className="text-base font-bold text-primary">لا توجد طلبات حصص مسجلة حتى الآن</p>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                يمكنك الضغط على زر "طلب حصة مخبرية وتجهيز" لإرسال أول طلب إلى ناظر الدروس ومسؤول المخبر.
              </p>
              <button
                onClick={() => setActiveTab('request')}
                className="mt-4 px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all"
              >
                تقديم طلب جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map((req) => {
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isPending = !isApproved && !isRejected;

                return (
                  <div
                    key={req.id}
                    className="bg-surface rounded-3xl p-6 border border-outline-variant/60 shadow-sm hover:border-sky-300 dark:hover:border-sky-800 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-primary">{req.activityTitle}</h3>
                          <span
                            className={cn(
                              "text-[10px] font-black px-2.5 py-0.5 rounded-full border",
                              isApproved && "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
                              isRejected && "bg-error/10 text-error border-error/30",
                              isPending && "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800"
                            )}
                          >
                            {isApproved ? 'معتمد من الناظر' : isRejected ? 'مرفوض / يتطلب تعديل' : 'قيد المراجعة والتحضير'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-1">
                          القسم: <strong>{req.className}</strong> ({req.groupName}) • المخبر: <strong>{req.lab}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-primary block">
                          تاريخ الحصة: {req.executionDate}
                        </span>
                        <span className="text-[11px] text-secondary font-mono">
                          التوقيت: {req.timing}
                        </span>
                      </div>
                    </div>

                    {/* Materials summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-container-low/50 p-3 rounded-2xl">
                      <div>
                        <span className="font-bold text-secondary block mb-1">العتاد المطلوب:</span>
                        {req.equipItems && req.equipItems.length > 0 ? (
                          <p className="text-primary font-bold">
                            {req.equipItems.map((e: any) => `${e.name} (${e.quantity})`).join('، ')}
                          </p>
                        ) : (
                          <span className="text-secondary italic">لا يوجد عتاد محدد</span>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-secondary block mb-1">المواد الكيميائية:</span>
                        {req.chemItems && req.chemItems.length > 0 ? (
                          <p className="text-primary font-bold">
                            {req.chemItems.map((c: any) => `${c.name} (${c.quantity})`).join('، ')}
                          </p>
                        ) : (
                          <span className="text-secondary italic">لا توجد مواد كيميائية</span>
                        )}
                      </div>
                    </div>

                    {/* Censor / Director feedback note if available */}
                    {req.censorNotes && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                        <strong>ملاحظة الناظر / مسؤول المخبر:</strong> {req.censorNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: Report Breakage / Damage */}
      {activeTab === 'breakage' && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitBreakage}
          className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm space-y-6"
        >
          <div className="border-b border-outline-variant/60 pb-4">
            <h2 className="text-lg font-black text-error flex items-center gap-2">
              <ShieldAlert className="text-error" />
              <span>التبليغ عن كسر زجاجي أو إتلاف عتاد أثناء الحصة</span>
            </h2>
            <p className="text-xs text-secondary mt-1">
              يُسجل التقرير رسمياً لمتابعة الإسقاط، الصيانة، وتعويض المستلزمات المخبرية وفق النظام الداخلي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-secondary block">
                وصف العتاد أو الزجاجية المتلفة <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: بيشر 250 مل بايركس، مخبار مدرج 100 مل، عدسة مجهر..."
                value={breakageItem}
                onChange={e => setBreakageItem(e.target.value)}
                className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-error outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary block">
                رقم الطاولة / الفوج
              </label>
              <input
                type="text"
                placeholder="طاولة رقم 3 - فوج 1"
                value={breakageBench}
                onChange={e => setBreakageBench(e.target.value)}
                className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-error outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary block">
                القسم المعني
              </label>
              <input
                type="text"
                placeholder="مثال: 2 علوم تجريبية 1"
                value={breakageStudentClass}
                onChange={e => setBreakageStudentClass(e.target.value)}
                className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-error outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-secondary block">
                ملابسات وظروف الحادث
              </label>
              <input
                type="text"
                placeholder="مثال: سقوط البيشر أثناء عملية التسخين، انكسار مقياس الحرارة أثناء التحريك..."
                value={breakageDescription}
                onChange={e => setBreakageDescription(e.target.value)}
                className="w-full bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant text-sm font-bold focus:border-error outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-error text-white font-black rounded-2xl shadow-lg shadow-error/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <AlertTriangle size={18} />
              <span>{isSubmitting ? 'جاري التسجيل...' : 'تسجيل التبليغ عن الإتلاف'}</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* TAB 4: Educational Tools & Virtual Labs */}
      {activeTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-outline-variant/60 pb-3">
            <h2 className="text-lg font-black text-primary">الأدوات العلمية والوسائل الرقمية المساعدة للأستاذ</h2>
            <p className="text-xs text-secondary mt-1">
              مجموعة متكاملة من المحاكيات والمختبرات الافتراضية وجداول العناصر لمرافقة الدرس التطبيقي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to={ROUTES.VIRTUAL_LAB}
              className="bg-surface p-6 rounded-3xl border border-outline-variant hover:border-sky-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FlaskConical size={24} />
              </div>
              <h3 className="text-base font-black text-primary mb-1">المختبر الافتراضي</h3>
              <p className="text-xs text-secondary leading-relaxed">تجارب كيميائية وفيزيائية تفاعلية ثلاثية الأبعاد بدون مخاطر.</p>
            </Link>

            <Link
              to={ROUTES.PERIODIC_TABLE}
              className="bg-surface p-6 rounded-3xl border border-outline-variant hover:border-emerald-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-base font-black text-primary mb-1">الجدول الدوري التفاعلي</h3>
              <p className="text-xs text-secondary leading-relaxed">خصائص العناصر والتوزيع الإلكتروني ومعايير السلامة.</p>
            </Link>

            <Link
              to={ROUTES.PHYSICS_SIMULATIONS}
              className="bg-surface p-6 rounded-3xl border border-outline-variant hover:border-purple-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-black text-primary mb-1">محاكيات الفيزياء</h3>
              <p className="text-xs text-secondary leading-relaxed">الميكانيكا، البصريات الهندسية، والكهرباء التفاعلية.</p>
            </Link>

            <Link
              to={ROUTES.LAB_ASSISTANT}
              className="bg-surface p-6 rounded-3xl border border-outline-variant hover:border-indigo-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-black text-primary mb-1">المساعد العلمي الذكي</h3>
              <p className="text-xs text-secondary leading-relaxed">إرشادات السلامة، الحسابات المولية، والتشريعات المدرسية.</p>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
