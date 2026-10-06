import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { onSnapshot, query, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
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
  FileDown,
  Download,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';

interface LoanItem {
  id: string;
  name: string;
  quantity: number;
  serial: string;
  stateBefore: string;
  stateAfter: string;
  notes: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
}

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
}

export default function LoanRequest() {
  const { schoolId, schoolName, directorate, commune } = useSchool();
  const { openPdfPreview } = usePdfPreview();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [loanNum, setLoanNum] = useState(`${new Date().getFullYear()}/...`);
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherRole, setTeacherRole] = useState('أستاذ تعليم ثانوي');
  const [location, setLocation] = useState('داخل الثانوية');
  const [activityTitle, setActivityTitle] = useState('');
  const [items, setItems] = useState<LoanItem[]>([
    { id: '1', name: '', quantity: 1, serial: '', stateBefore: '', stateAfter: '', notes: '' }
  ]);
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fetch teachers for datalist
    const unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers'), (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    });

    // Fetch equipment for datalist
    const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
      setEquipment(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment)));
    });

    return () => {
      unsubTeachers();
      unsubEquip();
    };
  }, []);

  const handleAddRow = () => {
    const newId = (items.length + 1).toString();
    setItems([...items, { id: newId, name: '', quantity: 1, serial: '', stateBefore: '', stateAfter: '', notes: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length > 1) {
      const filtered = items.filter(item => item.id !== id);
      // Re-index
      const reindexed = filtered.map((item, index) => ({ ...item, id: (index + 1).toString() }));
      setItems(reindexed);
    }
  };

  const handleItemChange = (id: string, field: keyof LoanItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // Auto-fill serial if name matches equipment exactly
        if (field === 'name') {
          const matched = equipment.find(e => e.name === value);
          if (matched) {
            return { ...item, [field]: value, serial: matched.serialNumber };
          }
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من مسح كافة البيانات والبدء بنموذج جديد؟')) {
      setLoanNum(`${new Date().getFullYear()}/...`);
      setRequestDate(new Date().toISOString().split('T')[0]);
      setReturnDate('');
      setTeacherName('');
      setTeacherRole('أستاذ تعليم ثانوي');
      setLocation('داخل الثانوية');
      setActivityTitle('');
      setItems([{ id: '1', name: '', quantity: 1, serial: '', stateBefore: '', stateAfter: '', notes: '' }]);
      setSignDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!teacherName || items.some(i => !i.name)) {
      setNotification({ message: 'يرجى ملأ اسم الأستاذ والوسائل المطلوبة قبل الحفظ.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const docRef = await addDoc(getUserCollection(schoolId, 'loan_requests'), {
        loanNum,
        requestDate,
        returnDate,
        teacherName,
        teacherRole,
        location,
        activityTitle,
        items,
        signDate,
        createdAt: serverTimestamp()
      });

      await logActivity(schoolId, LogAction.CREATE, LogModule.EQUIPMENT, `طلب إعارة جديد رقم: ${loanNum} للأستاذ ${teacherName}`, docRef.id);
      setNotification({ message: 'تم حفظ الطلب في السجل بنجاج!', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'loans');
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
      laboratory: 'مخبر الوسائل والتجهيزات العلمية',
      academicYear: '2025 / 2026',
      date: requestDate
    };

    const headers = ['#', 'اسم الوسيلة / التجهيز', 'الكمية', 'الرقم التسلسلي', 'الحالة قبل الإعارة', 'الحالة بعد الإرجاع', 'ملاحظات'];
    const rows = items.map(item => [
      item.id,
      item.name || '---',
      item.quantity,
      item.serial || '---',
      item.stateBefore || 'جيدة',
      item.stateAfter || '---',
      item.notes || ''
    ]);

    return {
      title: 'استمارة وسند إعارة وسائل وتجهيزات علمية',
      subtitle: `رقم السند: ${loanNum} — المستفيد(ة): ${teacherName || 'أستاذ(ة)'} (${teacherRole}) — الغرض: ${activityTitle || 'نشاط بيداغوجي'}`,
      headers,
      rows,
      summaryCards: [
        { label: 'رقم الإعارة', value: loanNum },
        { label: 'تاريخ الإعارة', value: requestDate },
        { label: 'تاريخ الإرجاع', value: returnDate || 'غير محدد' },
        { label: 'مكان الاستعمال', value: location }
      ],
      notes: 'يتعهد المستعير بالحفاظ على سلامة العتاد وإرجاعه فور الانتهاء من النشاط في حالته الأصلية.',
      schoolInfo,
      labManagerTitle: 'مسؤول المخبر (الملحق بالمخبر)',
      principalTitle: 'المستعير (المستفيد من الإعارة)'
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
      fileName: `loan_request_${loanNum.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      category: 'إعارة التجهيزات'
    });
  };

  const handlePrint = async () => {
    const data = getDocumentData();
    const html = PDFService.generateLabReportWordHtml(data);
    await PrintService.printHtml(html, { title: data.title });
  };

  return (
    <div className="min-h-screen bg-background pb-24 rtl font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto p-6 md:p-12">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-3xl text-on-primary shadow-xl shadow-primary/20">
              <RefreshCw size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tighter">طلب إعارة وسائل</h1>
              <p className="text-on-surface/40 font-bold">إعداد وطباعة نموذج إعارة التجهيزات العلمية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="p-4 bg-surface-container-low text-on-surface/40 rounded-2xl hover:bg-surface-container hover:text-primary transition-all active:scale-95 shadow-sm"
              title="نموذج جديد"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 bg-surface text-primary border-2 border-primary/10 rounded-2xl font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              حفظ الطلب
            </button>
            <button 
              onClick={handlePrint}
              className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-black flex items-center gap-2 hover:bg-primary-container shadow-2xl shadow-primary/30 transition-all active:scale-95"
            >
              <Printer size={20} />
              طباعة الطلب
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-[40px] shadow-2xl border border-outline/5 overflow-hidden relative"
        >
          {/* Watermark/Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          {/* Official Algerian Header Simulation */}
          <div className="p-12 border-b-2 border-primary/10 bg-surface-container-low/30">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right gap-8">
              <div className="space-y-1">
                <p className="text-sm font-black text-primary">مديرية التربية لولاية: {directorate}</p>
                <p className="text-xs font-bold text-on-surface/60">{formatSchoolWithCommune(schoolName, commune)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-primary">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-sm font-bold text-on-surface/60">وزارة التربية الوطنية</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-black text-primary">السنة الدراسية: <span className="border-b-2 border-primary/20 px-4">2025 - 2026</span></p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h2 className="text-4xl font-black text-primary underline underline-offset-[16px] decoration-primary/20 font-serif">طلب إعارة وسائل وتجهيزات علمية</h2>
            </div>
          </div>

          <div className="p-12 space-y-12">
            {/* Meta Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">رقم الطلب</label>
                <div className="relative group">
                  <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    placeholder="2025/..."
                    value={loanNum}
                    onChange={e => setLoanNum(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">تاريخ الطلب</label>
                <div className="relative group">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="date"
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    value={requestDate}
                    onChange={e => setRequestDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">تاريخ الإرجاع</label>
                <div className="relative group">
                  <RotateCcw className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="date"
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">الأستاذ المعني</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    placeholder="اختر أو اكتب الاسم واللقب..."
                    list="teachers-list"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                  />
                  <datalist id="teachers-list">
                    {teachers.map(t => <option key={t.id} value={t.name} />)}
                  </datalist>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">الصفة</label>
                <div className="relative group">
                  <RefreshCw className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    value={teacherRole}
                    onChange={e => setTeacherRole(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">موقع النشاط</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <select 
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner appearance-none"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  >
                    <option>داخل الثانوية</option>
                    <option>خارج الثانوية</option>
                    <option>أخـر</option>
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">عنوان النشاط</label>
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-8 py-5 pr-14 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    placeholder="عنوان الدرس أو النشاط العلمي..."
                    value={activityTitle}
                    onChange={e => setActivityTitle(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Equipment Table Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-primary flex items-center gap-3">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  قائمة الوسائل والتجهيزات العلمية
                </h3>
                <button 
                  onClick={handleAddRow}
                  className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary/20 transition-all border border-primary/10 active:scale-95"
                >
                  <Plus size={18} />
                  إضافة وسيلة أخرى
                </button>
              </div>

              <div className="overflow-x-auto rounded-[32px] border border-outline/5 shadow-inner bg-surface-container-low/20">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-primary/5">
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20 text-center w-16">رقم</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20">الوسيلة / التجهيز</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20 w-24">الكمية</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20 w-40">رقم الجرد</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20 w-32">ق.ن *</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20 w-32">ب.ن *</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/20">ملاحظات</th>
                      <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {items.map((item, index) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="border-t border-outline/5 hover:bg-primary/2 transition-colors"
                        >
                          <td className="p-4 font-black text-primary text-center bg-primary/2">{item.id}</td>
                          <td className="p-4">
                            <input 
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all"
                              list={`equip-list-${item.id}`}
                              placeholder="اختر أو اكتب..."
                              value={item.name}
                              onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                            />
                            <datalist id={`equip-list-${item.id}`}>
                              {equipment.map(e => <option key={e.id} value={e.name} />)}
                            </datalist>
                          </td>
                          <td className="p-4">
                            <input 
                              type="number"
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all text-center"
                              value={item.quantity}
                              onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all text-center"
                              value={item.serial}
                              onChange={e => handleItemChange(item.id, 'serial', e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <select 
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all"
                              value={item.stateBefore}
                              onChange={e => handleItemChange(item.id, 'stateBefore', e.target.value)}
                            >
                              <option value="">--</option>
                              <option>جيد</option>
                              <option>مقبول</option>
                              <option>تالف</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select 
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all"
                              value={item.stateAfter}
                              onChange={e => handleItemChange(item.id, 'stateAfter', e.target.value)}
                            >
                              <option value="">--</option>
                              <option>جيد</option>
                              <option>مقبول</option>
                              <option>تالف</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <input 
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-primary px-2 py-2 font-bold focus:outline-none transition-all"
                              value={item.notes}
                              onChange={e => handleItemChange(item.id, 'notes', e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleRemoveRow(item.id)}
                              className="p-3 text-error/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest mr-6">
                (*) ق.ن: حالة الوسيلة قبل النشاط &nbsp;&nbsp;|&nbsp;&nbsp; (*) ب.ن: حالة الوسيلة بعد النشاط والإرجاع
              </p>
            </div>

            {/* Signature Section */}
            <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-outline/5">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <MapPin size={24} />
                  <span className="font-black text-lg">مكان وتاريخ التوقيع</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-on-surface/60">عين كرشة في:</span>
                  <input 
                    type="date"
                    className="flex-1 bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-primary transition-all shadow-inner"
                    value={signDate}
                    onChange={e => setSignDate(e.target.value)}
                  />
                </div>
                <div className="h-40 border-2 border-dashed border-primary/10 rounded-[32px] flex items-center justify-center bg-surface-container-low/20">
                  <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.3em]">توقيع المعني بالأمر</p>
                </div>
              </div>
              
              <div className="space-y-6 pt-12 md:pt-0">
                <div className="flex items-center gap-4 text-primary">
                  <User size={24} />
                  <span className="font-black text-lg">المصادقة الإدارية</span>
                </div>
                <div className="h-full min-h-[220px] border-2 border-dashed border-primary/10 rounded-[32px] flex flex-col items-center justify-center bg-surface-container-low/20 gap-4">
                  <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.3em]">ختم وتوقيع مدير الثانوية</p>
                  <div className="w-24 h-24 border-2 border-primary/5 rounded-full opacity-10 flex items-center justify-center">
                    <RefreshCw size={48} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 font-black text-lg",
                notification.type === 'success' ? "bg-primary text-on-primary" : "bg-error text-white"
              )}
            >
              {notification.type === 'success' ? <RefreshCw size={24} className="animate-spin" /> : <Package size={24} />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
