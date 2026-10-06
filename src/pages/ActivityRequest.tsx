import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { 
  Plus, 
  Printer, 
  RotateCcw, 
  Trash2, 
  Save,
  ArrowRight,
  User,
  Calendar,
  FileText,
  Package,
  MapPin,
  RefreshCw,
  Search,
  Clock,
  FlaskConical,
  Beaker,
  Activity,
  AlertCircle,
  FileDown,
  Download,
  Eye
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';

interface EquipItem {
  id: string;
  name: string;
  quantity: number;
}

interface ChemItem {
  id: string;
  name: string;
  quantity: string;
  formula: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
}

interface Chemical {
  id: string;
  name: string;
  formula?: string;
}

export default function ActivityRequest() {
  const { schoolId, schoolName, directorate, commune } = useSchool();
  const { openPdfPreview } = usePdfPreview();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [chemicalsList, setChemicalsList] = useState<Chemical[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [orderNum, setOrderNum] = useState(`${new Date().getFullYear()}/...`);
  const [teacherName, setTeacherName] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestTime, setRequestTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [executionDate, setExecutionDate] = useState('');
  const [timing, setTiming] = useState('08:00 - 10:00');
  const [className, setClassName] = useState('');
  const [activityType, setActivityType] = useState('عملي');
  const [lab, setLab] = useState('مخبر العلوم الطبيعية والحياة');
  const [activityTitle, setActivityTitle] = useState('');
  
  const [equipItems, setEquipItems] = useState<EquipItem[]>([
    { id: '1', name: '', quantity: 1 }
  ]);
  const [chemItems, setChemItems] = useState<ChemItem[]>([
    { id: '1', name: '', quantity: '', formula: '' }
  ]);
  
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers'), (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
      setEquipmentList(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    const unsubChem = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
      setChemicalsList(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name, formula: doc.data().formula })));
    });

    return () => {
      unsubTeachers();
      unsubEquip();
      unsubChem();
    };
  }, []);

  const handleAddEquipRow = () => {
    setEquipItems([...equipItems, { id: (equipItems.length + 1).toString(), name: '', quantity: 1 }]);
  };

  const handleAddChemRow = () => {
    setChemItems([...chemItems, { id: (chemItems.length + 1).toString(), name: '', quantity: '', formula: '' }]);
  };

  const handleEquipChange = (id: string, field: keyof EquipItem, value: any) => {
    setEquipItems(equipItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleChemChange = (id: string, field: keyof ChemItem, value: any) => {
    setChemItems(chemItems.map(item => {
      if (item.id === id) {
        if (field === 'name') {
          const matched = chemicalsList.find(c => c.name === value);
          return { ...item, [field]: value, formula: matched?.formula || '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من مسح البيانات والبدء بنموذج جديد؟')) {
      setOrderNum(`${new Date().getFullYear()}/...`);
      setTeacherName('');
      setExecutionDate('');
      setActivityTitle('');
      setEquipItems([{ id: '1', name: '', quantity: 1 }]);
      setChemItems([{ id: '1', name: '', quantity: '', formula: '' }]);
    }
  };

  const handleSave = async () => {
    if (!teacherName || !activityTitle) {
      setNotification({ message: 'يرجى ملأ البيانات الأساسية قبل الحفظ.', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = await addDoc(getUserCollection(schoolId, 'activity_requests'), {
        orderNum,
        teacherName,
        requestDate,
        requestTime,
        executionDate,
        timing,
        className,
        activityType,
        lab,
        activityTitle,
        equipItems,
        chemItems,
        signDate,
        createdAt: serverTimestamp()
      });
      await logActivity(schoolId, LogAction.CREATE, LogModule.REPORTS, `طلب تحضير نشاط: ${activityTitle} للأستاذ ${teacherName}`, docRef.id);
      setNotification({ message: 'تم حفظ طلب التحضير بنجاح!', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'activity_preparations');
      setNotification({ message: 'حدث خطأ أثناء الحفظ.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getDocumentData = () => {
    const schoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: directorate || 'مديرية التربية لولاية الجزائر',
      school: schoolName || 'المؤسسة التعليمية',
      commune,
      laboratory: lab || 'مخبر العلوم والتكنولوجيا',
      academicYear: '2025 / 2026',
      date: requestDate
    };

    const headers = ['#', 'النوع / التصنيف', 'البيان (الوسيلة / المادة الكيميائية)', 'الكمية المطلوبة', 'الصيغة / الملاحظات'];
    const rows: (string | number)[][] = [];

    equipItems.forEach((item, idx) => {
      if (item.name) {
        rows.push([idx + 1, 'وسائل وتجهيزات', item.name, item.quantity, 'صالحة وجاهزة للتجربة']);
      }
    });

    chemItems.forEach((item, idx) => {
      if (item.name) {
        rows.push([equipItems.length + idx + 1, 'مواد كيميائية', item.name, item.quantity || 'حسب التجربة', item.formula || '---']);
      }
    });

    return {
      title: 'استمارة وطلب تحضير نشاط تجريبي / تطبيقي',
      subtitle: `عنوان النشاط: ${activityTitle || 'نشاط مخبري'} — الأستاذ(ة): ${teacherName || '---'} — القسم: ${className || '---'}`,
      headers,
      rows: rows.length > 0 ? rows : [['1', 'نشاط عام', 'وسائل التجربة المقررة', 1, 'جاهزة']],
      summaryCards: [
        { label: 'رقم الطلب', value: orderNum },
        { label: 'تاريخ الإجراء', value: executionDate || requestDate },
        { label: 'توقيت الحصة', value: timing },
        { label: 'المخبر', value: lab }
      ],
      notes: 'تُودع هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل.',
      schoolInfo,
      labManagerTitle: 'مسؤول المخبر (الملحق)',
      principalTitle: 'أستاذ(ة) المادة المشرف(ة)'
    };
  };

  const handleDownloadWord = () => {
    const data = getDocumentData();
    PDFService.exportLabReportWord(data);
  };

  const handleDownloadPDF = async () => {
    const data = getDocumentData();
    await PDFService.exportLabReportPDF({ ...data, save: true });
  };

  const handlePreviewPDF = async () => {
    const data = getDocumentData();
    const doc = await PDFService.exportLabReportPDF({ ...data, save: false });
    const blob = doc.output('blob');
    openPdfPreview({
      file: blob,
      title: data.title,
      fileName: `activity_request_${orderNum.replace(/\//g, '_')}.pdf`,
      category: 'تحضير الأنشطة'
    });
  };

  const handlePrint = async () => {
    const data = getDocumentData();
    const html = PDFService.generateLabReportWordHtml(data);
    await PrintService.printHtml(html, { title: data.title });
  };

  return (
    <div className="min-h-screen bg-background pb-24 rtl font-sans" dir="rtl">
      <Helmet>
        <title>تحضير نشاط تطبيقي | الأرضية الرقمية للمخابر</title>
      </Helmet>
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-3xl text-on-primary shadow-xl shadow-primary/20">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tighter">تحضير نشاط تطبيقي</h1>
              <p className="text-on-surface/40 font-bold">نموذج طلب الوسائل والمواد للحصص التطبيقية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              onClick={handleReset} 
              className="p-3.5 bg-surface text-on-surface/40 rounded-2xl hover:text-primary transition-all shadow-sm border border-outline/10 active:scale-95"
              title="نموذج جديد"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="px-6 py-3.5 bg-surface text-primary border-2 border-primary/10 rounded-2xl font-black flex items-center gap-2 hover:border-primary transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xs"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ الطلب
            </button>

            <button 
              onClick={handleDownloadWord} 
              className="px-5 py-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
              title="تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)"
            >
              <FileDown size={18} />
              تحميل Word
            </button>

            <button 
              onClick={handleDownloadPDF} 
              className="px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
              title="تحميل كملف PDF رسمي"
            >
              <Download size={18} />
              تحميل PDF
            </button>

            <button 
              onClick={handlePreviewPDF} 
              className="p-3.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="معاينة PDF في المتصفح"
            >
              <Eye size={18} />
            </button>

            <button 
              onClick={handlePrint} 
              className="px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-black flex items-center gap-2 hover:bg-primary-container shadow-2xl transition-all active:scale-95 text-xs"
            >
              <Printer size={18} />
              طباعة الطلب
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-surface rounded-[40px] shadow-2xl border border-outline/5 overflow-hidden relative"
        >
          {/* Watermark Decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />

          {/* Official Header */}
          <div className="p-10 border-b-2 border-primary/10 bg-surface-container-low/30">
            <div className="flex flex-col md:flex-row justify-between gap-8 text-center md:text-right">
              <div className="space-y-1">
                <p className="text-sm font-black text-primary">مديرية التربية لولاية: {directorate}</p>
                <p className="text-xs font-bold text-on-surface/60">{formatSchoolWithCommune(schoolName, commune)}</p>
              </div>
              <div className="space-y-1 font-black text-primary">
                <p className="text-base">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-sm">وزارة التربية الوطنية</p>
              </div>
              <div className="md:text-left text-primary font-black">
                <p className="text-sm">السنة الدراسية: <span className="border-b-2 border-primary/20 px-4">2025 - 2026</span></p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <h2 className="text-4xl font-black text-primary underline underline-offset-[16px] decoration-primary/20">طلب تحضير نشاط تطبيقي</h2>
              <p className="mt-10 text-[10px] text-on-surface/60 font-black uppercase tracking-[0.2em]">تقدم هذه الوثيقة لتحضير الحصص التطبيقية قبل إنجازها بـ 48 ساعة</p>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* Meta Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">الرقم</label>
                <div className="relative group">
                   <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                   <input 
                    value={orderNum} 
                    onChange={e => setOrderNum(e.target.value)} 
                    className="w-full bg-surface-container-low rounded-2xl px-6 py-4 pr-12 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" 
                   />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">الأستاذ/ة المادة</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    list="teachers-dl" 
                    placeholder="اختر أو اكتب الاسم..."
                    value={teacherName} 
                    onChange={e => setTeacherName(e.target.value)} 
                    className="w-full bg-surface-container-low rounded-2xl px-6 py-4 pr-12 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" 
                  />
                </div>
                <datalist id="teachers-dl">{teachers.map(t => <option key={t.id} value={t.name} />)}</datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">توقيت الحصة</label>
                <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    value={timing} 
                    onChange={e => setTiming(e.target.value)} 
                    className="w-full bg-surface-container-low rounded-2xl px-6 py-4 pr-12 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">تاريخ الطلب</label>
                <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="w-full bg-surface-container-low rounded-2xl px-6 py-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">ساعة الطلب</label>
                <input type="time" value={requestTime} onChange={e => setRequestTime(e.target.value)} className="w-full bg-surface-container-low rounded-2xl px-6 py-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">تاريخ الإجراء</label>
                <input type="date" value={executionDate} onChange={e => setExecutionDate(e.target.value)} className="w-full bg-surface-container-low rounded-2xl px-6 py-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">القسم المستهدف</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    value={className} 
                    onChange={e => setClassName(e.target.value)} 
                    placeholder="مثال: 3 ع ت 1" 
                    className="w-full bg-surface-container-low rounded-2xl px-6 py-4 pr-12 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">نوع النشاط</label>
                <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full bg-surface-container-low rounded-2xl px-6 py-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner appearance-none">
                  <option>عملي</option><option>بالمحاكات</option><option>نشاط محوسب EXAO</option><option>إفتراضي</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">المخبر المخصص</label>
                <select value={lab} onChange={e => setLab(e.target.value)} className="w-full bg-surface-container-low rounded-2xl px-6 py-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner appearance-none">
                  <option>مخبر العلوم الطبيعية والحياة</option>
                  <option>مخبر العلوم الفيزيائية</option>
                  <option>مخبر الوسائل التعليمية</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface/40 mr-2 tracking-widest">عنوان النشاط التطبيقي</label>
              <div className="relative group">
                <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  value={activityTitle} 
                  onChange={e => setActivityTitle(e.target.value)} 
                  placeholder="اكتب العنوان الكامل للحصة التطبيقية..." 
                  className="w-full bg-surface-container-low rounded-2xl px-6 py-4 pr-12 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner" 
                />
              </div>
            </div>

            {/* Dual Tables Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
              {/* Equipment Table */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-primary flex items-center gap-3 text-lg">
                    <div className="w-2 h-6 bg-primary rounded-full shadow-sm" />
                    الوسائل والتجهيزات
                  </h3>
                  <button onClick={handleAddEquipRow} className="px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 font-black text-xs flex items-center gap-2 transition-all"><Plus size={16}/> إضافة</button>
                </div>
                <div className="overflow-hidden rounded-[32px] border border-outline/5 shadow-xl bg-surface-container-low/20">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-primary/5 text-[9px] font-black text-primary uppercase tracking-widest">
                      <tr><th className="p-4 w-12 text-center border-l border-white/20">#</th><th className="p-4 border-l border-white/20">الوسيلة</th><th className="p-4 w-20 text-center border-l border-white/20">كمية</th><th className="p-4 w-14"></th></tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {equipItems.map((item, idx) => (
                          <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="border-t border-outline/5 hover:bg-primary/2 transition-colors">
                            <td className="p-4 font-black text-primary/40 text-center bg-primary/2">{idx + 1}</td>
                            <td className="p-2">
                              <input list="equip-dl" value={item.name} onChange={e => handleEquipChange(item.id, 'name', e.target.value)} className="w-full bg-transparent px-3 py-2 font-bold focus:outline-none focus:border-b-2 border-primary transition-all" placeholder="الاسم..." />
                            </td>
                            <td className="p-2">
                              <input type="number" value={item.quantity} onChange={e => handleEquipChange(item.id, 'quantity', e.target.value)} className="w-full bg-transparent px-2 py-2 font-bold text-center focus:outline-none focus:bg-surface/50 rounded-lg transition-all" />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => setEquipItems(equipItems.filter(i => i.id !== item.id))} className="p-2 text-error/30 hover:text-error hover:bg-error/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                <datalist id="equip-dl">{equipmentList.map(e => <option key={e.id} value={e.name} />)}</datalist>
              </div>

              {/* Chemicals Table */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-primary flex items-center gap-3 text-lg">
                    <div className="w-2 h-6 bg-secondary rounded-full shadow-sm" />
                    المواد الكيميائية
                  </h3>
                  <button onClick={handleAddChemRow} className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 font-black text-xs flex items-center gap-2 transition-all"><Plus size={16}/> إضافة</button>
                </div>
                <div className="overflow-hidden rounded-[32px] border border-outline/5 shadow-xl bg-surface-container-low/20">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-secondary/5 text-[9px] font-black text-secondary uppercase tracking-widest">
                      <tr><th className="p-4 w-12 text-center border-l border-white/20">#</th><th className="p-4 border-l border-white/20">المادة</th><th className="p-4 w-28 text-center border-l border-white/20">كمية</th><th className="p-4 w-14"></th></tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {chemItems.map((item, idx) => (
                          <motion.tr key={item.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="border-t border-outline/5 hover:bg-secondary/2 transition-colors">
                            <td className="p-4 font-black text-secondary/40 text-center bg-secondary/2">{idx + 1}</td>
                            <td className="p-2">
                              <input list="chem-dl" value={item.name} onChange={e => handleChemChange(item.id, 'name', e.target.value)} className="w-full bg-transparent px-3 py-2 font-bold focus:outline-none focus:border-b-2 border-secondary transition-all" placeholder="الاسم..." />
                              {item.formula && <span className="text-[10px] font-mono text-secondary/60 mr-2">{item.formula}</span>}
                            </td>
                            <td className="p-2">
                              <input value={item.quantity} onChange={e => handleChemChange(item.id, 'quantity', e.target.value)} className="w-full bg-transparent px-2 py-2 font-bold text-center focus:outline-none focus:bg-surface/50 rounded-lg transition-all" placeholder="مثال: 50مل" />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => setChemItems(chemItems.filter(i => i.id !== item.id))} className="p-2 text-error/30 hover:text-error hover:bg-error/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                <datalist id="chem-dl">{chemicalsList.map(c => <option key={c.id} value={c.name} />)}</datalist>
              </div>
            </div>

            <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest mr-6 pt-4">
               (*) ق.ن: حالة الوسيلة قبل النشاط &nbsp;|&nbsp; (*) ب.ن: حالة الوسيلة بعد النشاط والإرجاع
            </p>

            {/* Bottom Signature Area */}
            <div className="pt-16 border-t border-outline/5 flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 font-bold text-on-surface/60">
                   <span>عين كرشة في:</span>
                   <input type="date" value={signDate} onChange={e => setSignDate(e.target.value)} className="bg-surface-container-low rounded-xl px-6 py-3 font-bold border border-transparent focus:border-primary transition-all" />
                </div>
                <div className="h-40 w-72 border-2 border-dashed border-primary/10 rounded-[32px] flex flex-col items-center justify-center bg-surface-container-low/20 gap-3 grayscale opacity-30">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">توقيع أستاذ(ة) المادة</p>
                  <User size={32} />
                </div>
              </div>
              
              <div className="h-48 w-80 border-2 border-dashed border-primary/10 rounded-[48px] flex flex-col items-center justify-center bg-surface-container-low/20 gap-4 grayscale opacity-30 group-hover:opacity-50 transition-opacity">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">مصادقة مسؤول المخبر</p>
                <div className="w-20 h-20 border-2 border-primary/5 rounded-full flex items-center justify-center">
                  <RefreshCw size={40} className="text-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 font-black transition-all", notification.type === 'success' ? "bg-primary text-on-primary" : "bg-error text-white")}>
            {notification.type === 'success' ? <RefreshCw className="animate-spin" size={24} /> : <AlertCircle size={24} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
