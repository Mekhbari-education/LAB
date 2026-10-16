import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  Building2, 
  FileCheck, 
  GraduationCap, 
  Package, 
  Wallet, 
  Lock as LockIcon, 
  User, 
  Mail, 
  Phone, 
  School, 
  MapPin, 
  IdCard, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles,
  ShieldCheck,
  BookOpen,
  FlaskConical
} from 'lucide-react';
import logo from '/ministry-logo.png';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useUserRole, UserRole, UserProfileData, ROLE_CONFIGS } from '../context/UserRoleContext';
import { ROUTES } from '../config/routes';
import { Helmet } from 'react-helmet-async';
import { Teacher } from '../types/teachers';

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  colorClass: string;
  activeBorder: string;
  desc: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'director',
    title: 'مدير المؤسسة التعليمية',
    subtitle: 'رتبة الإدارة العليا والتأشير الإداري',
    icon: Building2,
    badge: 'الإدارة',
    colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300',
    activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30',
    desc: 'الاطلاع على تقارير المخابر، تأشير الجرد السنوي، ومتابعة مؤشرات أداء المؤسسة والسلامة.'
  },
  {
    id: 'censor',
    title: 'ناظر الدروس',
    subtitle: 'المشرف البيداغوجي وتنظيم الحصص',
    icon: FileCheck,
    badge: 'البيداغوجيا',
    colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/30',
    desc: 'اعتماد طلبات التجارب والحصص المخبرية، تأشيرة التقارير اليومية، وتنسيق جداول الأفواج.'
  },
  {
    id: 'teacher',
    title: 'أستاذ المادة التعليمية',
    subtitle: 'العلوم الفيزيائية أو علوم الطبيعة والحياة',
    icon: GraduationCap,
    badge: 'التعليم',
    colorClass: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300',
    activeBorder: 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/30 dark:bg-sky-950/30',
    desc: 'حجز الحصص المخبرية، إرسال طلبات الوسائل والكواشف، ومحاكاة التجارب والموارد العلمية.'
  },
  {
    id: 'lab_manager',
    title: 'مسؤول / ملحق المخبر',
    subtitle: 'التسيير الميداني، الجرد، والصيانة',
    icon: Package,
    badge: 'المخبر',
    colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    activeBorder: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/30 dark:bg-amber-950/30',
    desc: 'إدارة الجرد والمخزون، تحضير التجارب، الصيانة، سجلات الكسر، والتقارير اليومية.'
  },
  {
    id: 'economist',
    title: 'المقتصد والمسير المالي',
    subtitle: 'المصالح الاقتصادية والمادية',
    icon: Wallet,
    badge: 'المالية والمادية',
    colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300',
    activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/30 dark:bg-purple-950/30',
    desc: 'متابعة الميزانية والطلبيات، فواتير المستهلكات، سجل بطاقات الجرد، ومحاضر التكهين والإسقاط.'
  }
];

const ALGERIAN_WILAYAS = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
  '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
  '16 - الجزائر', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
  '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
  '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
  '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - تقرت',
  '56 - جانت', '57 - المغير', '58 - المنيعة'
];

export default function Signup() {
  const navigate = useNavigate();
  const { setRole } = useUserRole();
  const { isDarkMode } = useTheme();

  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [institution, setInstitution] = useState('');
  const [wilaya, setWilaya] = useState('16 - الجزائر');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role Specific Fields
  const [teacherSubject, setTeacherSubject] = useState('العلوم الفيزيائية والتكنولوجيا');
  const [teacherGrade, setTeacherGrade] = useState('أستاذ التعليم الثانوي');
  const [teacherLevels, setTeacherLevels] = useState<string[]>(['1 ج م ع ت', '2 ع ت', '3 ع ت']);
  const [labSpecialty, setLabSpecialty] = useState('مخبر العلوم الفيزيائية');

  // Status & UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLevelToggle = (lvl: string) => {
    setTeacherLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم واللقب الكامل.');
      return;
    }
    if (!nationalId.trim()) {
      setError('يرجى إدخال رقم التعريف الوطني أو الوظيفي (NIN).');
      return;
    }
    if (!institution.trim()) {
      setError('يرجى تحديد المؤسسة التعليمية (الثانوية أو المتوسطة).');
      return;
    }
    if (!email.trim()) {
      setError('يرجى إدخال عنوان البريد الإلكتروني.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة مع تأكيد كلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      let uid = `user_${Date.now()}`;
      let firebaseUser: any = null;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = userCred.user;
        uid = firebaseUser.uid;
        await updateProfile(firebaseUser, { displayName: fullName.trim() });
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          setError('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.');
          setLoading(false);
          return;
        }
        console.warn('Firebase createUser failed, falling back to instant activation session:', authErr);
        // Fallback to anonymous sign-in or offline mode to ensure instant activation
        try {
          if (!auth.currentUser) {
            const anonCred = await signInAnonymously(auth);
            uid = anonCred.user.uid;
          }
        } catch {}
      }

      const userProfile: UserProfileData = {
        uid,
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        nationalId: nationalId.trim(),
        institution: institution.trim(),
        wilaya: wilaya,
        phone: phone.trim(),
        subject: selectedRole === 'teacher' ? teacherSubject : undefined,
        grade: selectedRole === 'teacher' ? teacherGrade : undefined,
        levels: selectedRole === 'teacher' ? teacherLevels : undefined,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // 1. Save profile to Firestore users collection
      try {
        await setDoc(doc(db, 'users', uid), {
          ...userProfile,
          roleTitle: ROLE_CONFIGS[selectedRole].label,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore write warning:', fsErr);
      }

      // 2. If Teacher role, also sync teacher record in school directory
      let teacherObject: Teacher | null = null;
      if (selectedRole === 'teacher') {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName;

        teacherObject = {
          id: uid,
          name: fullName.trim(),
          firstName,
          lastName,
          functionalCode: nationalId.trim(),
          subject: teacherSubject,
          rank: teacherGrade,
          email: email.trim(),
          levels: teacherLevels,
          birthDate: '',
          grade: '01',
          effectiveDate: new Date().toISOString().split('T')[0]
        };

        try {
          await setDoc(doc(db, 'teachers', uid), {
            ...teacherObject,
            institution: institution.trim(),
            wilaya: wilaya,
            status: 'active',
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (tErr) {
          console.warn('Teacher sync warning:', tErr);
        }
      }

      // 3. Update UserRoleContext and localStorage for Instant Activation
      setRole(selectedRole, teacherObject, userProfile);

      setSuccessMessage(`تم إنشاء وتفعيل حسابك (${ROLE_CONFIGS[selectedRole].shortLabel}) بنجاح! جاري توجيهك...`);

      // 4. Redirect immediately to the role's default portal
      setTimeout(() => {
        const targetPath = ROLE_CONFIGS[selectedRole].defaultPath || ROUTES.HOME;
        navigate(targetPath, { replace: true });
      }, 1200);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <Helmet>
        <title>إنشاء حساب جديد | الأرضية الرقمية للمخابر المدرسية</title>
      </Helmet>

      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 mb-4 group">
          <img className="h-16 w-auto drop-shadow-sm group-hover:scale-105 transition-transform" src={logo} alt="شعار وزارة التربية الوطنية" />
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={13} />
          التفعيل الفوري للرتب التعليمية والإدارية
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          إنشاء حساب جديد بالأرضية الرقمية للمخابر
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface/70">
          اختر رتبتك الوظيفية وسجّل بياناتك للاستفادة الفورية من الصلاحيات والبطاقات المخصصة لاختصاصك.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-surface-container-lowest py-8 px-5 sm:px-10 shadow-xl rounded-3xl border border-outline/10">

          {/* Error & Success Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 flex items-start gap-3 text-error text-xs font-bold animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── 1. Role Selection Grid ─────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>1. اختر نوع الحساب والرتبة الوظيفية</span>
                  <span className="text-error">*</span>
                </label>
                <span className="text-[11px] text-on-surface/60 font-medium">تحديد الصلاحيات المخصصة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.id;
                  return (
                    <div
                      key={opt.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRole(opt.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRole(opt.id); }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-start relative group select-none",
                        isSelected
                          ? opt.activeBorder
                          : "border-outline/10 hover:border-primary/30 hover:bg-surface-container-low/50"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", opt.colorClass)}>
                            <Icon size={20} />
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            isSelected ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface/70 border-outline/10"
                          )}>
                            {opt.badge}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-primary group-hover:text-primary-container transition-colors">
                          {opt.title}
                        </h4>
                        <p className="text-[11px] text-on-surface/60 font-medium mt-0.5 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>

                      <p className="text-[10px] text-on-surface/60 mt-3 pt-2.5 border-t border-outline/5 leading-relaxed line-clamp-2">
                        {opt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Identification & Institutional Data ─────────────────── */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <IdCard size={16} />
                <span>2. بيانات التعريف والمؤسسة التعليمية</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>الاسم واللقب الكامل</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: د. محمد بن عبد الله"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* National ID / NIN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>رقم التعريف الوطني / الوظيفي (NIN)</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <IdCard size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: 198501230004589"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-mono font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Institution Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>اسم المؤسسة التعليمية (ثانوية / متوسطة)</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <School size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: ثانوية العقيد لطفي"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Wilaya Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>الولاية</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                    >
                      {ALGERIAN_WILAYAS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Role-Specific Parameters ────────────────────────────── */}
            {selectedRole === 'teacher' && (
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
                  <GraduationCap size={18} />
                  <span className="text-xs font-bold">بيانات التخصص والتدريس للأستاذ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface/70">مادة التدريس</label>
                    <select
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium outline-none focus:border-primary"
                    >
                      <option value="العلوم الفيزيائية والتكنولوجيا">العلوم الفيزيائية والتكنولوجيا</option>
                      <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة</option>
                      <option value="العلوم التجريبية">العلوم التجريبية والتطبيقية</option>
                      <option value="التكنولوجيا والهندسة">التكنولوجيا والهندسة</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface/70">الرتبة البيداغوجية</label>
                    <select
                      value={teacherGrade}
                      onChange={(e) => setTeacherGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium outline-none focus:border-primary"
                    >
                      <option value="أستاذ التعليم الثانوي">أستاذ التعليم الثانوي</option>
                      <option value="أستاذ رئيسي في التعليم الثانوي">أستاذ رئيسي في التعليم الثانوي</option>
                      <option value="أستاذ مكون في التعليم الثانوي">أستاذ مكون في التعليم الثانوي</option>
                      <option value="أستاذ التعليم المتوسط">أستاذ التعليم المتوسط</option>
                    </select>
                  </div>
                </div>

                {/* Levels */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface/70">الأطوار والمستويات المسندة</label>
                  <div className="flex flex-wrap gap-2">
                    {['1 ج م ع ت', '1 ج م أ', '2 ع ت', '2 ر', '2 ت ر', '3 ع ت', '3 ر', '3 ت ر'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleLevelToggle(lvl)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all",
                          teacherLevels.includes(lvl)
                            ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                            : "bg-surface text-on-surface/70 border-outline/15 hover:border-sky-400"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'lab_manager' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <FlaskConical size={18} />
                  <span className="text-xs font-bold">تحديد المخبر المسند</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface/70">المخبر الرئيسي المكلف به</label>
                  <select
                    value={labSpecialty}
                    onChange={(e) => setLabSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium outline-none focus:border-primary"
                  >
                    <option value="مخبر العلوم الفيزيائية">مخبر العلوم الفيزيائية</option>
                    <option value="مخبر علوم الطبيعة والحياة">مخبر علوم الطبيعة والحياة</option>
                    <option value="المخبر المركزي الشامل">المخبر المركزي الشامل</option>
                    <option value="مستودع الكواشف والمستهلكات">مستودع الكواشف والمستهلكات</option>
                  </select>
                </div>
              </div>
            )}

            {selectedRole === 'economist' && (
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                  <Wallet size={18} />
                  <span className="text-xs font-bold">صلاحيات المصلحة المالية والمادية</span>
                </div>
                <p className="text-xs text-purple-900/80 dark:text-purple-200/80 leading-relaxed font-medium">
                  سيتم تمكينك من إدارة الميزانية، طلبيات المواد المستهلكة، معاينة بطاقات الجرد الدائم، ومصادقة محاضر إسقاط وتكهين العتاد التالف.
                </p>
              </div>
            )}

            {/* ── 4. Account Credentials & Contact ────────────────────────── */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <LockIcon size={16} />
                <span>3. بيانات الحساب والاتصال</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>البريد الإلكتروني</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="nom.prenom@education.dz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dir-ltr text-end"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80">رقم الهاتف (اختياري)</label>
                  <div className="relative">
                    <Phone size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="05 / 06 / 07 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-mono font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dir-ltr text-end"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>كلمة المرور</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <LockIcon size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>تأكيد كلمة المرور</span>
                    <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <LockIcon size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <div className="text-[11px] text-on-surface/60 leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-outline/10">
                بالضغط على إنشاء الحساب، أقر بصحة البيانات الوظيفية ورقم التعريف الوطني، وتخضع الصلاحيات للضوابط التشريعية الرسمية لوزارة التربية الوطنية.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    <span>جاري إنشاء وتفعيل الحساب...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>تأكيد التسجيل والتفعيل الفوري</span>
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-on-surface/70">لديك حساب مفعل بالفعل؟ </span>
                <Link to={ROUTES.LOGIN} className="text-xs font-bold text-primary hover:underline">
                  تسجيل الدخول الآن
                </Link>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
