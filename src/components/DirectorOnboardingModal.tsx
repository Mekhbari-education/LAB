import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  School, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  AlertCircle,
  X
} from 'lucide-react';
import { auth } from '../firebase';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { 
  saveOrUpdateRegisteredSchool, 
  generateCanonicalSchoolId,
  findRegisteredSchool 
} from '../services/schoolLinkingService';
import { ALGERIAN_WILAYAS, getWilayaName } from '../constants/wilayas';
import logo from '/ministry-logo.png';
import { cn } from '../lib/utils';

interface DirectorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DirectorOnboardingModal({
  isOpen,
  onClose,
  onSuccess
}: DirectorOnboardingModalProps) {
  const { 
    schoolName: currentSchoolName, 
    directorate: currentDirectorate, 
    commune: currentCommune,
    academicYear: currentAcademicYear,
    refreshSchoolData 
  } = useSchool();
  const { userProfile, syncUserRoleFromAuth } = useUserRole();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [schoolName, setSchoolName] = useState(
    userProfile?.institution || (currentSchoolName !== 'ثانوية عامة' ? currentSchoolName : 'متوسطة قطاف الطاهر')
  );
  const [educationLevel, setEducationLevel] = useState<'CEM' | 'Lycée' | 'Autre'>(
    schoolName.includes('متوسط') ? 'CEM' : 'Lycée'
  );
  const [wilaya, setWilaya] = useState(userProfile?.wilaya || '07 - بسكرة');
  const [directorate, setDirectorate] = useState(
    currentDirectorate !== 'مديرية التربية' ? currentDirectorate : `مديرية التربية لولاية ${getWilayaName(wilaya)}`
  );
  const [commune, setCommune] = useState(currentCommune || userProfile?.institution ? 'سيدي عقبة' : '');
  const [address, setAddress] = useState('');
  
  // Director info
  const [directorName, setDirectorName] = useState(userProfile?.name || 'مدير المؤسسة');
  const [directorEmail, setDirectorEmail] = useState(auth.currentUser?.email || userProfile?.email || 'cemguettaftaher@gmail.com');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [academicYear, setAcademicYear] = useState(currentAcademicYear || '2025/2026');

  useEffect(() => {
    // Dynamically adjust directorate when wilaya changes
    const wName = getWilayaName(wilaya);
    if (!directorate || directorate.includes('مديرية التربية')) {
      setDirectorate(`مديرية التربية لولاية ${wName}`);
    }
  }, [wilaya]);

  if (!isOpen) return null;

  const previewSchoolId = generateCanonicalSchoolId(schoolName, wilaya);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!schoolName.trim()) {
        setError('يرجى كتابة اسم المؤسسة التعليمية.');
        return;
      }
      if (!wilaya.trim()) {
        setError('يرجى تحديد الولاية.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!directorName.trim()) {
        setError('يرجى إدخال اسم مدير المؤسسة.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      const uid = user?.uid || userProfile?.uid || 'director-user';

      await saveOrUpdateRegisteredSchool({
        name: schoolName.trim(),
        wilaya: wilaya.trim(),
        commune: commune.trim() || 'المركز',
        directorate: directorate.trim() || `مديرية التربية لولاية ${getWilayaName(wilaya)}`,
        educationLevel,
        academicYear: academicYear.trim() || '2025/2026',
        directorUid: uid,
        directorName: directorName.trim(),
        directorEmail: directorEmail.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      await refreshSchoolData();
      if (user) {
        await syncUserRoleFromAuth(user.uid, user.email);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving registered school:', err);
      setError('حدث خطأ أثناء تأسيس قاعدة بيانات المؤسسة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-2xl bg-surface border border-outline/20 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-l from-emerald-900 via-primary-dim to-emerald-950 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center p-2 border border-white/20">
                <img src={logo} alt="Ministry Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                  وزارة التربية الوطنية — الجمهورية الجزائرية
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  تأسيس قاعدة بيانات المؤسسة التعليمية الموحدة
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className={cn(
              "h-1.5 rounded-full transition-all",
              step >= 1 ? "bg-emerald-400" : "bg-white/20"
            )} />
            <div className={cn(
              "h-1.5 rounded-full transition-all",
              step >= 2 ? "bg-emerald-400" : "bg-white/20"
            )} />
            <div className={cn(
              "h-1.5 rounded-full transition-all",
              step === 3 ? "bg-emerald-400" : "bg-white/20"
            )} />
          </div>

          <div className="flex justify-between items-center text-[11px] text-emerald-200/90 font-bold mt-2">
            <span>1. هوية المؤسسة</span>
            <span>2. الإدارة والسنة</span>
            <span>3. تفعيل الربط الموحد</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-error/10 border border-error/20 text-error rounded-2xl text-xs font-black flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INSTITUTION DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-right">
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-bold leading-relaxed">
                  بصفتك مدير المؤسسة التعليمية، ستقوم هذه الخطوة بإنشاء الحيز المشترك للمؤسسة بحيث ترتبط به تقارير المخابر، الجرد السنوي، سجلات التهشيم، وطلبات كافة الأساتذة تلقائياً.
                </p>
              </div>

              <div className="space-y-1 text-right">
                <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                  اسم المؤسسة التربوية <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <School size={18} className="absolute right-3.5 top-3.5 text-on-surface/30" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => {
                      setSchoolName(e.target.value);
                      if (e.target.value.includes('متوسط')) setEducationLevel('CEM');
                      else if (e.target.value.includes('ثانوي')) setEducationLevel('Lycée');
                    }}
                    placeholder="مثال: متوسطة قطاف الطاهر أو ثانوية الأمير عبد القادر"
                    className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-3 pr-11 pl-4 text-sm font-bold text-on-surface outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    الطور التعليمي <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEducationLevel('CEM')}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                        educationLevel === 'CEM'
                          ? "bg-primary text-on-primary border-primary shadow-xs font-black"
                          : "border-outline/20 hover:bg-surface-container-high text-on-surface/70"
                      )}
                    >
                      متوسطة (CEM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationLevel('Lycée')}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                        educationLevel === 'Lycée'
                          ? "bg-primary text-on-primary border-primary shadow-xs font-black"
                          : "border-outline/20 hover:bg-surface-container-high text-on-surface/70"
                      )}
                    >
                      ثانوية (Lycée)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    الولاية <span className="text-error">*</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-3 px-3 text-xs font-bold text-on-surface outline-none transition-all"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    مديرية التربية
                  </label>
                  <input
                    type="text"
                    value={directorate}
                    onChange={(e) => setDirectorate(e.target.value)}
                    className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 px-3 text-xs font-bold text-on-surface outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    البلدية
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="مثال: سيدي عقبة"
                    className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 px-3 text-xs font-bold text-on-surface outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>التالي: بيانات الإدارة والسنة</span>
                  <ArrowLeft size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DIRECTOR & ADMINISTRATIVE SETTINGS */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    الاسم واللقب لمدير المؤسسة <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute right-3.5 top-3 text-on-surface/30" />
                    <input
                      type="text"
                      required
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="الاسم واللقب الكامل"
                      className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 pr-11 pl-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    البريد الإلكتروني الرسمي
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-3.5 top-3 text-on-surface/30" />
                    <input
                      type="email"
                      value={directorEmail}
                      onChange={(e) => setDirectorEmail(e.target.value)}
                      className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 pr-11 pl-3 text-xs font-bold outline-none dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute right-3.5 top-3 text-on-surface/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06XXXXXXXX"
                      className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 pr-11 pl-3 text-xs font-bold outline-none dir-ltr text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-on-surface/60 mr-1">
                    السنة الدراسية المعتمدة <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute right-3.5 top-3 text-on-surface/30" />
                    <input
                      type="text"
                      required
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2025/2026"
                      className="w-full bg-surface border border-outline/20 focus:border-primary rounded-xl py-2.5 pr-11 pl-3 text-xs font-bold outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-outline/20 text-xs font-bold text-on-surface/70 hover:bg-surface-container-high transition-all flex items-center gap-1.5"
                >
                  <ArrowRight size={16} />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>التالي: مراجعة واعتماد الربط الموحد</span>
                  <ArrowLeft size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: UNIFIED DATABASE PREVIEW & ACTIVATION */}
          {step === 3 && (
            <div className="space-y-5 text-right">
              <div className="bg-gradient-to-r from-emerald-500/10 via-primary/10 to-indigo-500/10 border border-primary/20 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-primary font-black text-sm mb-2">
                  <Database size={20} />
                  <span>معاينة بطاقة الربط المؤسساتي الموحد</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-on-surface/50 text-[10px] block">المؤسسة التعليمية:</span>
                    <span className="font-bold text-on-surface">{schoolName} ({educationLevel})</span>
                  </div>
                  <div>
                    <span className="text-on-surface/50 text-[10px] block">الولاية والبلدية:</span>
                    <span className="font-bold text-on-surface">{wilaya} — {commune || 'المركز'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface/50 text-[10px] block">مدير المؤسسة:</span>
                    <span className="font-bold text-on-surface">{directorName}</span>
                  </div>
                  <div>
                    <span className="text-on-surface/50 text-[10px] block">السنة الدراسية:</span>
                    <span className="font-bold text-on-surface font-mono">{academicYear}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-primary/15 flex items-center justify-between">
                  <span className="text-[10px] text-on-surface/60 font-bold">المعرف المؤسساتي للقاعدة:</span>
                  <span className="font-mono text-xs font-black text-primary px-2.5 py-0.5 rounded-lg bg-surface border border-primary/20">
                    {previewSchoolId}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-surface border border-outline/15 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={18} />
                  <span>ماذا سيحدث بعد التأسيس؟</span>
                </div>
                <ul className="text-[11px] text-on-surface/70 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>سيتم ربط حسابك كمدير للمؤسسة بهذه القاعدة الموحدة مباشرة.</li>
                  <li>أي موظف جديد (أستاذ، ناظر، مقتصد، ملحق مخبر) يسجل باختيار <strong>{schoolName}</strong> سيرتبط حسابه تلقائياً بنفس قاعدة البيانات.</li>
                  <li>تتزامن تقارير التجارب اليومية، جرد المواد الكيميائية، والعتاد، وبطاقات الجرد بين كافة الموظفين فورياً.</li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-outline/20 text-xs font-bold text-on-surface/70 hover:bg-surface-container-high transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowRight size={16} />
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinalSubmit}
                  className="bg-primary hover:bg-primary-container text-on-primary px-7 py-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95"
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'جاري تأسيس القاعدة وتحديث البيانات...' : 'تأكيد وتأسيس قاعدة بيانات المؤسسة'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
