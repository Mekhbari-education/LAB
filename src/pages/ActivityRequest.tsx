import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { 
  Plus, 
  Printer, 
  RotateCcw, 
  Trash2, 
  Save, 
  User, 
  Clock, 
  MapPin, 
  RefreshCw, 
  FileText, 
  AlertCircle, 
  FileDown, 
  Download, 
  Eye, 
  Edit3, 
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatSchoolWithCommune, formatOfficialRankTitle } from '../lib/utils';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';
import ActivityRequestPrintModal from '../components/ActivityRequestPrintModal';

interface EquipItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface ChemItem {
  id: string;
  name: string;
  quantity: string;
  formula: string;
  notes?: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface EquipmentCatalogItem {
  id: string;
  name: string;
  availableQuantity?: number;
  totalQuantity?: number;
  status?: string;
  location?: string;
}

interface ChemicalCatalogItem {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  formula?: string;
  quantity?: number;
  unit?: string;
  hazardClass?: string;
  shelf?: string;
}

export default function ActivityRequest() {
  const { schoolId, schoolName, directorate, commune, jobTitle, academicYear } = useSchool();
  const { userProfile } = useUserRole();

  // Resolve official laboratory officer rank chosen in settings / statutory profile
  // The activity request is submitted to the lab officer, never to the director.
  const resolvedLabOfficerRank = (() => {
    // 1. Check userProfile grade if not director and not teacher
    if (userProfile?.grade && !userProfile.grade.includes('مدير') && !userProfile.grade.includes('أستاذ')) {
      return userProfile.grade;
    }
    // 2. Check localStorage saved lab rank
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade');
      if (stored && !stored.includes('مدير') && !stored.includes('أستاذ')) {
        return stored;
      }
    }
    // 3. Check schoolContext jobTitle if not director and not teacher
    if (jobTitle && !jobTitle.includes('مدير') && !jobTitle.includes('أستاذ')) {
      return jobTitle;
    }
    // 4. Fallback default official rank
    return 'ملحق رئيس بالمخابر';
  })();

  const officialLabOfficerTitle = formatOfficialRankTitle(resolvedLabOfficerRank);
  const { openPdfPreview } = usePdfPreview();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentCatalogItem[]>([]);
  const [chemicalsList, setChemicalsList] = useState<ChemicalCatalogItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalMode, setPrintModalMode] = useState<'filled' | 'blank'>('filled');
  const [showBlankDropdown, setShowBlankDropdown] = useState(false);

  // Form State
  const [orderNum, setOrderNum] = useState(`${new Date().getFullYear()}/01`);
  const [teacherName, setTeacherName] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestTime, setRequestTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [executionDate, setExecutionDate] = useState('');
  const [timing, setTiming] = useState('08:00 - 10:00');
  const [className, setClassName] = useState('');
  const [activityType, setActivityType] = useState('عملي');
  const [lab, setLab] = useState('مخبر العلوم الطبيعية والفيزيائية');
  const [activityTitle, setActivityTitle] = useState('');
  
  const [equipItems, setEquipItems] = useState<EquipItem[]>([
    { id: '1', name: '', quantity: 1, notes: 'صالحة وجاهزة للتجربة' }
  ]);
  const [chemItems, setChemItems] = useState<ChemItem[]>([
    { id: '1', name: '', quantity: '', formula: '', notes: '' }
  ]);
  
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);

  // Load teachers, equipment with stock, and chemicals with formulas
  useEffect(() => {
    const unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers'), (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
      setEquipmentList(snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || '',
          availableQuantity: d.availableQuantity !== undefined ? d.availableQuantity : (d.totalQuantity || 0),
          totalQuantity: d.totalQuantity || 0,
          status: d.status || 'functional',
          location: d.location || ''
        };
      }));
    });

    const unsubChem = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
      setChemicalsList(snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.nameAr || d.name || '',
          nameAr: d.nameAr || d.name || '',
          nameEn: d.nameEn || '',
          formula: d.formula || '',
          quantity: d.quantity || 0,
          unit: d.unit || 'غم',
          hazardClass: d.hazardClass || '',
          shelf: d.shelf || ''
        };
      }));
    });

    return () => {
      unsubTeachers();
      unsubEquip();
      unsubChem();
    };
  }, [schoolId]);

  const handleAddEquipRow = () => {
    setEquipItems([...equipItems, { id: (equipItems.length + 1).toString(), name: '', quantity: 1, notes: 'صالحة وجاهزة للتجربة' }]);
  };

  const handleAddChemRow = () => {
    setChemItems([...chemItems, { id: (chemItems.length + 1).toString(), name: '', quantity: '', formula: '', notes: '' }]);
  };

  const handleEquipChange = (id: string, field: keyof EquipItem, value: any) => {
    setEquipItems(equipItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleChemChange = (id: string, field: keyof ChemItem, value: any) => {
    setChemItems(chemItems.map(item => {
      if (item.id === id) {
        if (field === 'name') {
          const matched = chemicalsList.find(c => (c.name && c.name.toLowerCase() === value.toLowerCase()) || (c.nameAr && c.nameAr === value));
          return { 
            ...item, 
            [field]: value, 
            formula: matched?.formula || item.formula || ''
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من مسح البيانات والبدء بنموذج طلب جديد؟')) {
      setOrderNum(`${new Date().getFullYear()}/01`);
      setTeacherName('');
      setExecutionDate('');
      setActivityTitle('');
      setClassName('');
      setEquipItems([{ id: '1', name: '', quantity: 1, notes: 'صالحة وجاهزة للتجربة' }]);
      setChemItems([{ id: '1', name: '', quantity: '', formula: '', notes: '' }]);
    }
  };

  const handleSave = async () => {
    if (!teacherName || !activityTitle) {
      setNotification({ message: 'يرجى ملأ البيانات الأساسية (الأستاذ وعنوان النشاط) قبل الحفظ.', type: 'error' });
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
      handleFirestoreError(error, OperationType.CREATE, 'activity_requests');
      setNotification({ message: 'حدث خطأ أثناء الحفظ.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getDocumentData = () => {
    const schoolInfo = {
      country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: directorate || 'مديرية التربية لولاية أم البواقي',
      school: schoolName || 'المؤسسة التعليمية',
      commune: commune || 'عين كرشة',
      laboratory: lab || 'مخبر العلوم الطبيعية والفيزيائية',
      academicYear: academicYear || '2025/2026',
      date: requestDate
    };

    return {
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
      jobTitle: officialLabOfficerTitle,
      equipItems,
      chemItems,
      signDate,
      schoolInfo
    };
  };

  const handleOpenPrintModal = (mode: 'filled' | 'blank' = 'filled') => {
    setPrintModalMode(mode);
    setIsPrintModalOpen(true);
  };

  const handleDownloadWord = () => {
    const data = getDocumentData();
    PDFService.generateActivityRequestWord(data);
  };

  const handleDownloadPDF = async () => {
    const data = getDocumentData();
    await PDFService.generateActivityRequestPDF({ ...data, save: true });
  };

  const handleDownloadBlankPDF = async () => {
    const data = getDocumentData();
    await PDFService.generateActivityRequestPDF({ ...data, isBlank: true, save: true });
  };

  const handlePreviewPDF = async () => {
    const data = getDocumentData();
    const doc = await PDFService.generateActivityRequestPDF({ ...data, save: false });
    const blob = doc.output('blob');
    openPdfPreview({
      file: blob,
      title: 'طلب تحضير نشاط تجريبي / تطبيقي',
      fileName: `activity_request_${orderNum.replace(/\//g, '_')}.pdf`,
      category: 'تحضير الأنشطة'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 rtl font-sans" dir="rtl">
      <Helmet>
        <title>طلب تحضير نشاط مخبري | الأرضية الرقمية للمخابر</title>
      </Helmet>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12">
        {/* Top Header / Actions Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 no-print">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-3xl text-on-primary shadow-xl shadow-primary/20">
              <Layers size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">تحضير نشاط تطبيقي</h1>
              <p className="text-on-surface/50 text-xs sm:text-sm font-bold mt-0.5">
                نموذج طلب الأجهزة والوسائل والمواد للحصص المخبرية
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            <button 
              onClick={handleReset} 
              className="p-3 bg-surface text-on-surface/50 rounded-2xl hover:text-primary transition-all shadow-sm border border-outline/10 active:scale-95"
              title="نموذج جديد"
            >
              <RotateCcw size={18} />
            </button>

            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="px-5 py-3 bg-surface text-primary border-2 border-primary/10 rounded-2xl font-black flex items-center gap-2 hover:border-primary transition-all shadow-sm active:scale-95 disabled:opacity-50 text-xs"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              حفظ الطلب
            </button>

            {/* Blank Forms Download / Print Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowBlankDropdown(!showBlankDropdown)} 
                className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 rounded-2xl font-black flex items-center gap-1.5 transition-all active:scale-95 text-xs shadow-sm"
                title="خيارات الاستمارة البيضاء الفارغة للملء اليدوي"
              >
                <Edit3 size={16} />
                استمارة فارغة (للملء اليدوي)
                <ChevronDown size={14} className={cn("transition-transform", showBlankDropdown && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showBlankDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-outline/10 p-2 z-50 space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowBlankDropdown(false);
                        handleOpenPrintModal('blank');
                      }}
                      className="w-full text-right px-3 py-2.5 rounded-xl text-xs font-black text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                    >
                      <Printer size={15} />
                      معاينة وطباعة استمارة فارغة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBlankDropdown(false);
                        handleDownloadBlankPDF();
                      }}
                      className="w-full text-right px-3 py-2.5 rounded-xl text-xs font-black text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                    >
                      <Download size={15} />
                      تحميل استمارة فارغة (PDF)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleDownloadWord} 
              className="px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 rounded-2xl font-black flex items-center gap-1.5 transition-all active:scale-95 text-xs shadow-sm"
              title="تحميل كملف Word (.doc)"
            >
              <FileDown size={16} />
              Word
            </button>

            <button 
              onClick={handleDownloadPDF} 
              className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-2xl font-black flex items-center gap-1.5 transition-all active:scale-95 text-xs shadow-sm"
              title="تحميل كملف PDF رسمي (بدون تذييل)"
            >
              <Download size={16} />
              PDF
            </button>

            <button 
              onClick={handlePreviewPDF} 
              className="p-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-sm border border-teal-500/20"
              title="معاينة PDF في نافذة العارض"
            >
              <Eye size={18} />
            </button>

            {/* Primary Action Button: Open Print Pop-Up Page */}
            <button 
              onClick={() => handleOpenPrintModal('filled')} 
              className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-black flex items-center gap-2 hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs"
            >
              <Printer size={18} />
              طباعة الطلب
            </button>
          </div>
        </div>

        {/* Document Editor Form (Algerian Institutional Standard Layout) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-surface rounded-[32px] sm:rounded-[40px] shadow-2xl border border-outline/5 overflow-hidden relative"
        >
          {/* Official Letterhead Header (Strictly matching Daily Lab Report) */}
          <div className="p-6 sm:p-10 border-b-2 border-primary/10 bg-surface-container-low/30">
            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-primary/20 pb-8 gap-6">
              {/* Right Column: Directorate & Institution */}
              <div className="text-right text-xs font-bold space-y-1.5 text-primary order-2 md:order-1">
                <p className="font-black text-sm">{directorate || 'مديرية التربية لولاية أم البواقي'}</p>
                <p className="font-black text-sm">{formatSchoolWithCommune(schoolName, commune)}</p>
              </div>

              {/* Center Column: Republic & Ministry */}
              <div className="text-center space-y-2 flex-1 px-4 order-1 md:order-2">
                <p className="text-2xl font-black text-primary tracking-tight leading-relaxed">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-base font-black text-primary/85">وزارة التربية الوطنية</p>
                <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
              </div>

              {/* Left Column: Academic Year & Laboratory */}
              <div className="text-left text-xs font-bold space-y-1.5 text-primary order-3" dir="rtl">
                <p className="font-black text-sm">
                  السنة الدراسية: <span className="border-b-2 border-primary px-3 inline-block font-black">{academicYear || '2025/2026'}</span>
                </p>
                <p className="font-black text-sm">
                  المخبر: <span className="border-b-2 border-primary px-3 inline-block font-black">{lab}</span>
                </p>
              </div>
            </div>

            {/* Dark Green Algerian Title Banner */}
            <div className="bg-[#2b3d22] text-white rounded-2xl py-5 px-6 text-center my-6 shadow-md">
              <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-wide font-sans">
                طلب تحضير نشاط تجريبي / تطبيقي
              </h2>
              <p className="text-xs sm:text-sm text-[#e6f0dc] font-bold m-0 mt-1.5">
                تقدم هذه الاستمارة لدى مسؤول المخبر قبل 48 ساعة على الأقل من موعد إنجاز الحصة لضمان التحضير الأمثل للعتاد والمحاليل
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Meta Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">رقم الطلب</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={17} />
                  <input 
                    value={orderNum} 
                    onChange={e => setOrderNum(e.target.value)} 
                    className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 pr-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">الأستاذ(ة) المشرف(ة)</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={17} />
                  <input 
                    list="teachers-dl" 
                    placeholder="اختر أو اكتب اسم الأستاذ..."
                    value={teacherName} 
                    onChange={e => setTeacherName(e.target.value)} 
                    className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 pr-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                  />
                </div>
                <datalist id="teachers-dl">{teachers.map(t => <option key={t.id} value={t.name} />)}</datalist>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">توقيت الحصة</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={17} />
                  <input 
                    value={timing} 
                    onChange={e => setTiming(e.target.value)} 
                    placeholder="مثال: 08:00 - 10:00"
                    className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 pr-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Meta Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">تاريخ تقديم الطلب</label>
                <input 
                  type="date" 
                  value={requestDate} 
                  onChange={e => setRequestDate(e.target.value)} 
                  className="w-full bg-surface-container-low rounded-2xl px-4 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">ساعة الطلب</label>
                <input 
                  type="time" 
                  value={requestTime} 
                  onChange={e => setRequestTime(e.target.value)} 
                  className="w-full bg-surface-container-low rounded-2xl px-4 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">تاريخ إجراء الحصة</label>
                <input 
                  type="date" 
                  value={executionDate} 
                  onChange={e => setExecutionDate(e.target.value)} 
                  className="w-full bg-surface-container-low rounded-2xl px-4 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">القسم المستهدف</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={17} />
                  <input 
                    value={className} 
                    onChange={e => setClassName(e.target.value)} 
                    placeholder="مثال: 3 ع ت 1" 
                    className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 pr-4 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Meta Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">نوع النشاط المخبري</label>
                <select 
                  value={activityType} 
                  onChange={e => setActivityType(e.target.value)} 
                  className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner appearance-none text-sm cursor-pointer"
                >
                  <option value="عملي">عملي تجريبي مباشر</option>
                  <option value="بالمحاكات">بالمحاكاة الحاسوبية</option>
                  <option value="نشاط محوسب EXAO">نشاط تجريبي محوسب EXAO</option>
                  <option value="إفتراضي">مخبر افتراضي وتفاعلي</option>
                  <option value="عرض بيداغوجي">عرض أستاذ (Démonstration)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">المخبر المخصص</label>
                <select 
                  value={lab} 
                  onChange={e => setLab(e.target.value)} 
                  className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner appearance-none text-sm cursor-pointer"
                >
                  <option value="مخبر العلوم الطبيعية والفيزيائية">مخبر العلوم الطبيعية والفيزيائية</option>
                  <option value="مخبر العلوم الفيزيائية والكيميائية">مخبر العلوم الفيزيائية والكيميائية</option>
                  <option value="مخبر علوم الطبيعة والحياة">مخبر علوم الطبيعة والحياة</option>
                  <option value="مخبر الوسائل التعليمية والتكنولوجيا">مخبر الوسائل التعليمية والتكنولوجيا</option>
                </select>
              </div>
            </div>

            {/* Activity Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-primary uppercase tracking-wide mr-1">عنوان النشاط التجريبي / التطبيقي</label>
              <input 
                value={activityTitle} 
                onChange={e => setActivityTitle(e.target.value)} 
                placeholder="اكتب العنوان الكامل والمفصل للحصة التجريبية المقررة..." 
                className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 font-bold border-2 border-transparent focus:border-primary transition-all shadow-inner text-sm" 
              />
            </div>

            {/* Dual Tables Layout: Equipment and Chemicals with Catalog Dropdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
              
              {/* Equipment Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-primary flex items-center gap-2.5 text-base">
                    <span className="w-2.5 h-6 bg-primary rounded-full" />
                    الوسائل والتجهيزات المخبرية
                  </h3>
                  <button 
                    type="button"
                    onClick={handleAddEquipRow} 
                    className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus size={15}/> إضافة وسيلة
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-outline/10 shadow-sm bg-surface">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead className="bg-primary/5 font-black text-primary uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center border-l border-outline/10">#</th>
                        <th className="p-3 border-l border-outline/10">الوسيلة / العتاد</th>
                        <th className="p-3 w-20 text-center border-l border-outline/10">الكمية</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipItems.map((item, idx) => {
                        const matchedEquip = equipmentList.find(e => e.name && e.name.toLowerCase() === item.name.trim().toLowerCase());
                        return (
                          <tr key={item.id} className="border-t border-outline/5 hover:bg-primary/2 transition-colors">
                            <td className="p-3 font-black text-primary/50 text-center bg-primary/2">{idx + 1}</td>
                            <td className="p-2">
                              <input 
                                list="equip-catalog-dl" 
                                value={item.name} 
                                onChange={e => handleEquipChange(item.id, 'name', e.target.value)} 
                                className="w-full bg-transparent px-2.5 py-1.5 font-bold focus:outline-none focus:border-b-2 border-primary transition-all text-xs" 
                                placeholder="ابحث أو اكتب اسم الوسيلة..." 
                              />
                              {matchedEquip && (
                                <div className="text-[10px] text-primary/70 font-bold mt-0.5 px-2.5 flex items-center gap-1">
                                  <span>المتوفر بالمخزن:</span>
                                  <span className="text-primary font-black">{matchedEquip.availableQuantity}</span>
                                  {matchedEquip.location && <span className="opacity-70">({matchedEquip.location})</span>}
                                </div>
                              )}
                            </td>
                            <td className="p-2">
                              <input 
                                type="number" 
                                min={1}
                                value={item.quantity} 
                                onChange={e => handleEquipChange(item.id, 'quantity', parseInt(e.target.value) || 1)} 
                                className="w-full bg-surface-container-low px-2 py-1.5 font-black text-center focus:outline-none focus:ring-1 focus:ring-primary rounded-lg transition-all text-xs" 
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button"
                                onClick={() => setEquipItems(equipItems.filter(i => i.id !== item.id))} 
                                className="p-1.5 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                title="حذف السطر"
                              >
                                <Trash2 size={15}/>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <datalist id="equip-catalog-dl">
                  {equipmentList.map(e => (
                    <option key={e.id} value={e.name}>
                      {e.availableQuantity !== undefined ? `المتوفر: ${e.availableQuantity}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Chemicals Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-secondary flex items-center gap-2.5 text-base">
                    <span className="w-2.5 h-6 bg-secondary rounded-full" />
                    المواد الكيميائية والمحاليل
                  </h3>
                  <button 
                    type="button"
                    onClick={handleAddChemRow} 
                    className="px-3.5 py-1.5 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus size={15}/> إضافة مادة
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-outline/10 shadow-sm bg-surface">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead className="bg-secondary/5 font-black text-secondary uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center border-l border-outline/10">#</th>
                        <th className="p-3 border-l border-outline/10">المادة والصيغة</th>
                        <th className="p-3 w-28 text-center border-l border-outline/10">الكمية / التركيز</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {chemItems.map((item, idx) => {
                        const matchedChem = chemicalsList.find(c => 
                          (c.name && c.name.toLowerCase() === item.name.trim().toLowerCase()) || 
                          (c.nameAr && c.nameAr === item.name.trim())
                        );
                        return (
                          <tr key={item.id} className="border-t border-outline/5 hover:bg-secondary/2 transition-colors">
                            <td className="p-3 font-black text-secondary/50 text-center bg-secondary/2">{idx + 1}</td>
                            <td className="p-2">
                              <input 
                                list="chem-catalog-dl" 
                                value={item.name} 
                                onChange={e => handleChemChange(item.id, 'name', e.target.value)} 
                                className="w-full bg-transparent px-2.5 py-1.5 font-bold focus:outline-none focus:border-b-2 border-secondary transition-all text-xs" 
                                placeholder="ابحث أو اكتب اسم المادة..." 
                              />
                              <div className="flex items-center gap-2 mt-0.5 px-2.5 flex-wrap">
                                {item.formula && (
                                  <span className="text-[10px] font-mono text-secondary font-bold bg-secondary/10 px-1.5 py-0.5 rounded">
                                    {item.formula}
                                  </span>
                                )}
                                {matchedChem && (
                                  <span className="text-[10px] text-on-surface/50 font-bold">
                                    المتوفر: {matchedChem.quantity} {matchedChem.unit}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <input 
                                value={item.quantity} 
                                onChange={e => handleChemChange(item.id, 'quantity', e.target.value)} 
                                className="w-full bg-surface-container-low px-2 py-1.5 font-bold text-center focus:outline-none focus:ring-1 focus:ring-secondary rounded-lg transition-all text-xs" 
                                placeholder="مثال: 50 مل" 
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button"
                                onClick={() => setChemItems(chemItems.filter(i => i.id !== item.id))} 
                                className="p-1.5 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                title="حذف السطر"
                              >
                                <Trash2 size={15}/>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <datalist id="chem-catalog-dl">
                  {chemicalsList.map(c => (
                    <option key={c.id} value={c.nameAr || c.name}>
                      {c.formula ? `[${c.formula}] ` : ''}{c.quantity ? `المتوفر: ${c.quantity} ${c.unit || ''}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Bottom Signatures Area */}
            <div className="pt-10 border-t border-outline/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-bold text-on-surface/70 text-sm">
                  <span>حرر بـ : {commune || 'عين كرشة'} في :</span>
                  <input 
                    type="date" 
                    value={signDate} 
                    onChange={e => setSignDate(e.target.value)} 
                    className="bg-surface-container-low rounded-xl px-4 py-2 font-bold border border-transparent focus:border-primary transition-all text-xs" 
                  />
                </div>
                <div className="h-32 w-64 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center bg-surface-container-low/20 gap-2 p-3 text-center">
                  <p className="text-[12px] font-black text-primary">أستاذ(ة) المادة</p>
                  <p className="text-[10px] text-on-surface/50 font-medium">(الاسم والتوقيع)</p>
                </div>
              </div>
              
              <div className="h-32 w-64 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center bg-surface-container-low/20 gap-2 p-3 text-center">
                <p className="text-[12px] font-black text-primary">{officialLabOfficerTitle}</p>
                <p className="text-[10px] text-on-surface/50 font-medium">(التوقيع والختم)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pop-up Print Modal (Interactive In-App Print Page) */}
      <ActivityRequestPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={getDocumentData()}
        initialMode={printModalMode}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 40 }} 
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs transition-all", 
              notification.type === 'success' ? "bg-primary text-on-primary" : "bg-error text-white"
            )}
          >
            {notification.type === 'success' ? <RefreshCw className="animate-spin" size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
