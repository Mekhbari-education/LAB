import React, { useState, useEffect, useMemo } from 'react';
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
  FlaskConical,
  Loader2,
  Briefcase,
  Compass,
  Utensils,
  Search,
  Award,
  AlertTriangle,
  FileText
} from 'lucide-react';
import logo from '/ministry-logo.png';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useUserRole, UserRole, UserProfileData, ROLE_CONFIGS } from '../context/UserRoleContext';
import { ROUTES } from '../config/routes';
import { Helmet } from 'react-helmet-async';
import { Teacher } from '../types/teachers';
import { 
  saveOrUpdateRegisteredSchool, 
  linkStaffMemberToSchool 
} from '../services/schoolLinkingService';
import { 
  OFFICIAL_GRADES, 
  OfficialGrade, 
  OFFICIAL_PERSONNEL_CATEGORIES,
  PersonnelCategoryType,
  PersonnelCategoryMeta,
  findGradeByCodeOrName, 
  getGradesByPersonnelCategory,
  getCorpsByCategory
} from '../constants/grades';

export default function Signup() {
  const navigate = useNavigate();
  const { setRole } = useUserRole();
  const { isDarkMode } = useTheme();

  // Selected Decree 25-54 Category
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<PersonnelCategoryType>('موظفو المخابر');
  const [selectedCorps, setSelectedCorps] = useState<string>('all');
  const [gradeSearchQuery, setGradeSearchQuery] = useState('');

  // Selected Role (operational applet role)
  const [selectedRole, setSelectedRole] = useState<UserRole>('lab_manager');

  // Form Fields - Personal Identification
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Institution State with Cascading Dropdowns (Matching Settings.tsx)
  const [schoolsDb, setSchoolsDb] = useState<any>(null);
  const [dirList, setDirList] = useState<{ id: string; name: string; wilayaNum: number }[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  const [selectedDirectorate, setSelectedDirectorate] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('متوسط');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [isCustomSchool, setIsCustomSchool] = useState(false);

  // Load Algerian Schools Database
  useEffect(() => {
    let isMounted = true;
    import('../data/schools').then(({ SCHOOL_DB }) => {
      if (!isMounted) return;
      setSchoolsDb(SCHOOL_DB);

      // Build sorted directorates list by official Wilaya numbering (01 to 58)
      const list = Object.entries(SCHOOL_DB).map(([id, data]) => {
        const wilayaNum = parseInt(id.slice(0, 2), 10) || 99;
        return {
          id,
          name: data.name,
          wilayaNum
        };
      }).sort((a, b) => a.wilayaNum - b.wilayaNum || a.name.localeCompare(b.name, 'ar'));

      setDirList(list);
      setIsLoadingSchools(false);
    }).catch(err => {
      console.error('Failed to load schools database:', err);
      setIsLoadingSchools(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Current directorate data derived reactively from schoolsDb
  const currentDirData = (schoolsDb && selectedDirectorate)
    ? (schoolsDb[selectedDirectorate] || Object.values(schoolsDb).find((d: any) => d.name === selectedDirectorate || d.name.includes(selectedDirectorate)))
    : null;

  // Communes list derived from current directorate
  const communesList = currentDirData?.communes
    ? Object.entries(currentDirData.communes).map(([id, com]: [string, any]) => ({
        id,
        name: com.name,
        cycles: com.cycles
      })).sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    : [];

  // Current commune data
  const currentCommune = currentDirData?.communes?.[selectedCommune]
    || (currentDirData?.communes && Object.values(currentDirData.communes).find((c: any) => c.name === selectedCommune));

  // Cycles list derived from current commune
  const cyclesList = currentCommune?.cycles
    ? Object.keys(currentCommune.cycles)
    : ['ابتدائي', 'متوسط', 'ثانوي'];

  // Schools list derived from current commune and cycle
  const schoolsList: any[] = (currentCommune?.cycles && selectedCycle && currentCommune.cycles[selectedCycle])
    ? [...currentCommune.cycles[selectedCycle]].sort((a: any, b: any) => a.name.localeCompare(b.name, 'ar'))
    : [];

  // Resolved school name for preview and submission
  const resolvedSchoolName = isCustomSchool
    ? customSchoolName.trim()
    : (schoolsList.find((s: any) => s.code === selectedSchool)?.name || (selectedSchool && selectedSchool !== '__custom__' ? selectedSchool : ''));

  // Professional Grade State
  const [selectedGradeCode, setSelectedGradeCode] = useState('09040302'); // Default: ملحق رئيسي بالمخابر

  // Role Specific Fields
  const [teacherSubject, setTeacherSubject] = useState('العلوم الفيزيائية والتكنولوجيا');
  const [teacherLevels, setTeacherLevels] = useState<string[]>(['1 ج م ع ت', '2 ع ت', '3 ع ت']);
  const [labSpecialty, setLabSpecialty] = useState('مخبر العلوم الفيزيائية');

  // Currently selected grade object
  const currentGradeObj = useMemo(() => {
    return findGradeByCodeOrName(selectedGradeCode) || OFFICIAL_GRADES[0];
  }, [selectedGradeCode]);

  // Available corps for the current category
  const availableCorps = useMemo(() => {
    return getCorpsByCategory(selectedCategoryTitle);
  }, [selectedCategoryTitle]);

  // Filtered grades list based on search or selected Category and Corps
  const displayedGrades = useMemo(() => {
    const query = gradeSearchQuery.trim().toLowerCase();
    if (query) {
      return OFFICIAL_GRADES.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query) ||
        g.corps.toLowerCase().includes(query) ||
        g.categoryGroup.toLowerCase().includes(query)
      );
    }

    let list = getGradesByPersonnelCategory(selectedCategoryTitle);
    if (selectedCorps !== 'all') {
      list = list.filter(g => g.corps === selectedCorps);
    }
    return list;
  }, [selectedCategoryTitle, selectedCorps, gradeSearchQuery]);

  // When a grade is selected, automatically update default applet role
  const handleSelectGrade = (grade: OfficialGrade) => {
    setSelectedGradeCode(grade.code);
    setSelectedCategoryTitle(grade.categoryGroup);
    
    // Auto-map to best applet operational role
    if (grade.roles && grade.roles.length > 0) {
      setSelectedRole(grade.roles[0]);
    } else if (grade.categoryGroup === 'موظفو إدارة مؤسسات التربية والتعليم') {
      setSelectedRole('director');
    } else if (grade.categoryGroup === 'موظفو المخابر') {
      setSelectedRole('lab_manager');
    } else if (grade.categoryGroup === 'موظفو التعليم') {
      setSelectedRole('teacher');
    } else if (grade.categoryGroup === 'موظفو المصالح الاقتصادية' || grade.categoryGroup === 'موظفو التغذية المدرسية') {
      setSelectedRole('economist');
    } else {
      setSelectedRole('censor');
    }
  };

  // Switch Category handler
  const handleSelectCategory = (catMeta: PersonnelCategoryMeta) => {
    setSelectedCategoryTitle(catMeta.title);
    setSelectedCorps('all');
    setGradeSearchQuery('');
    
    // Pick the first grade in that category
    const catGrades = getGradesByPersonnelCategory(catMeta.title);
    if (catGrades.length > 0) {
      const preferred = catGrades.find(g => !g.isExtinction) || catGrades[0];
      handleSelectGrade(preferred);
    }
  };

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
    if (!selectedDirectorate) {
      setError('يرجى اختيار مديرية التربية من القائمة المنسدلة.');
      return;
    }
    if (!selectedCommune) {
      setError('يرجى اختيار البلدية.');
      return;
    }
    if (!selectedCycle) {
      setError('يرجى اختيار الطور التعليمي.');
      return;
    }
    if (isCustomSchool) {
      if (!customSchoolName.trim()) {
        setError('يرجى كتابة اسم المؤسسة التعليمية.');
        return;
      }
    } else {
      if (!selectedSchool || selectedSchool === '__custom__') {
        setError('يرجى اختيار المؤسسة التعليمية من القائمة، أو النقر على "كتابة يدوية" إذا كانت غير مدرجة.');
        return;
      }
    }
    if (!selectedGradeCode) {
      setError('يرجى اختيار الرتبة / الصفة الوظيفية.');
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
        try {
          if (!auth.currentUser) {
            const anonCred = await signInAnonymously(auth);
            uid = anonCred.user.uid;
          }
        } catch {}
      }

      // Institutional School Linking with Cascading Hierarchy
      const finalSchoolName = resolvedSchoolName;
      const dirName = currentDirData?.name || `مديرية التربية لولاية ${selectedDirectorate}`;
      const wilayaCleanName = currentDirData?.name 
        ? currentDirData.name.replace('مديرية التربية لولاية ', '').trim()
        : 'الجزائر';
      const wilayaNum = selectedDirectorate ? selectedDirectorate.slice(0, 2) : '16';
      const formattedWilaya = `${wilayaNum} - ${wilayaCleanName}`;
      const communeName = currentCommune?.name || selectedCommune || 'المركز';
      const eduLevel: 'CEM' | 'Lycée' | 'Autre' = selectedCycle === 'متوسط' ? 'CEM' : (selectedCycle === 'ثانوي' ? 'Lycée' : 'Autre');

      const finalGradeName = currentGradeObj ? currentGradeObj.name : 'ملحق رئيسي بالمخابر';
      const finalGradeCode = currentGradeObj ? currentGradeObj.code : selectedGradeCode;
      const finalCorps = currentGradeObj?.corps || 'سلك الملحقين بالمخابر';
      const finalCategoryGroup = currentGradeObj?.categoryGroup || selectedCategoryTitle;

      let assignedSchoolId: string;
      if (selectedRole === 'director') {
        const regSchool = await saveOrUpdateRegisteredSchool({
          name: finalSchoolName,
          wilaya: formattedWilaya,
          commune: communeName,
          directorate: dirName,
          educationLevel: eduLevel,
          academicYear: '2025/2026',
          directorUid: uid,
          directorName: fullName.trim(),
          directorEmail: email.trim(),
          phone: phone.trim()
        });
        assignedSchoolId = regSchool.id;
      } else {
        assignedSchoolId = await linkStaffMemberToSchool(
          uid,
          finalSchoolName,
          formattedWilaya,
          selectedRole
        );
      }

      const userProfile: UserProfileData = {
        uid,
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        nationalId: nationalId.trim(),
        institution: finalSchoolName,
        wilaya: formattedWilaya,
        commune: communeName,
        directorate: dirName,
        educationLevel: eduLevel,
        phone: phone.trim(),
        subject: selectedRole === 'teacher' ? teacherSubject : undefined,
        grade: finalGradeName,
        gradeCode: finalGradeCode,
        levels: selectedRole === 'teacher' ? teacherLevels : undefined,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // 1. Save profile to Firestore users collection with assignedSchoolId and Statutory Decree Data
      try {
        await setDoc(doc(db, 'users', uid), {
          ...userProfile,
          schoolId: assignedSchoolId,
          roleTitle: ROLE_CONFIGS[selectedRole].label,
          statutoryCategory: finalCategoryGroup,
          corps: finalCorps,
          decreeNumber: '25-54',
          isExtinction: Boolean(currentGradeObj?.isExtinction),
          hasCompletedSchoolSetup: selectedRole === 'director' ? true : undefined,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore write warning:', fsErr);
      }

      // 2. If Teacher role, also sync teacher record in school directory
      let teacherObject: Teacher | null = null;
      if (selectedRole === 'teacher') {
        teacherObject = {
          id: uid,
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: teacherSubject,
          levels: teacherLevels,
          grade: finalGradeName,
          functionalCode: nationalId.trim(),
          status: 'active'
        };

        try {
          await setDoc(doc(db, 'schools', assignedSchoolId, 'teachers', uid), {
            ...teacherObject,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          await setDoc(doc(db, 'teachers', uid), {
            ...teacherObject,
            schoolId: assignedSchoolId,
            institution: finalSchoolName,
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (tErr) {
          console.warn('Notice saving teacher record:', tErr);
        }
      }

      // 3. Mirror to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('algeria_lab_school_id', assignedSchoolId);
        localStorage.setItem('algeria_lab_school_name', finalSchoolName);
        localStorage.setItem('algeria_lab_directorate', dirName);
        localStorage.setItem('algeria_lab_commune', communeName);
        localStorage.setItem('algeria_lab_grade_code', finalGradeCode);
        localStorage.setItem('algeria_lab_grade_name', finalGradeName);
        localStorage.setItem('algeria_lab_corps', finalCorps);
        localStorage.setItem('algeria_lab_category', finalCategoryGroup);
        window.dispatchEvent(new Event('school_changed'));
      }

      // 4. Update UserRoleContext and localStorage for Instant Activation
      setRole(selectedRole, teacherObject, userProfile);

      setSuccessMessage(`تم ربط وتفعيل حسابك (${finalGradeName}) بقاعدة بيانات مؤسسة ${finalSchoolName} بنجاح! جاري التوجيه...`);

      // 5. Redirect immediately to the role's default portal
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
        <title>إنشاء حساب جديد طبقاً للمرسوم 25-54 | الأرضية الرقمية للمخابر المدرسية</title>
      </Helmet>

      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-6">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 mb-3 group">
          <img className="h-16 w-auto drop-shadow-sm group-hover:scale-105 transition-transform" src={logo} alt="شعار وزارة التربية الوطنية" />
        </Link>
        
        {/* Decree 25-54 Official Badge */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs">
            <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
            طبقاً للمرسوم التنفيذي رقم 25-54 المتضمن القانون الأساسي لأسلاك التربية الوطنية
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          إنشاء وتفعيل حساب موظف بالأرضية الرقمية
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-on-surface/75 max-w-2xl mx-auto leading-relaxed">
          حدّد شعبتك وسلكك ورتبتك الرسمية المعتمدة لربط حسابك بقاعدة بيانات مؤسستك التعليمية والاستفادة الفورية من فضاء العمل والصلاحيات المخصصة لك.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
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

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── 1. Decree 25-54 Categories & Grades Selection ─────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-3">
                <div>
                  <label className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={18} className="text-secondary" />
                    <span>1. الشعب والأسلاك والرتب الرسمية (المرسوم التنفيذي 25-54)</span>
                    <span className="text-error">*</span>
                  </label>
                  <p className="text-[11px] text-on-surface/65 font-medium mt-0.5">
                    اختر الشعبة الوظيفية ثم السلك والرتبة المطابقة لقرار التعيين أو الترقية
                  </p>
                </div>

                {/* Instant Search in all 62 grades */}
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                  <input
                    type="text"
                    value={gradeSearchQuery}
                    onChange={(e) => setGradeSearchQuery(e.target.value)}
                    placeholder="بحث سريع بالرتبة أو الرمز (مثال: ملحق، ناظر، مقتصد)..."
                    className="w-full ps-9 pe-3 py-1.5 text-xs rounded-xl border border-outline/20 bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  {gradeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGradeSearchQuery('')}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* The 8 Official Personnel Categories Grid */}
              {!gradeSearchQuery && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface/80 flex items-center gap-1.5">
                      <span>الشعب الوظيفية الرسمية لقطاع التربية الوطنية:</span>
                    </span>
                    <span className="text-[11px] font-bold text-primary">8 فئات معتمدة</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {OFFICIAL_PERSONNEL_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategoryTitle === cat.title;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={cn(
                            "p-3 rounded-2xl border text-start transition-all relative flex flex-col justify-between group cursor-pointer",
                            isSelected
                              ? cat.activeBorder
                              : "border-outline/15 hover:border-primary/40 bg-surface hover:bg-surface-container-low/40"
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface/70"
                              )}>
                                {cat.badge}
                              </span>
                              {isSelected && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                            </div>
                            <h4 className="text-xs font-black text-on-surface group-hover:text-primary transition-colors leading-snug">
                              {cat.title}
                            </h4>
                          </div>

                          <p className="text-[10px] text-on-surface/60 mt-2 pt-1.5 border-t border-outline/10 line-clamp-2">
                            {cat.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-corps Filter Bar inside the selected Category */}
              {!gradeSearchQuery && availableCorps.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                  <span className="text-[11px] font-bold text-on-surface/70 shrink-0 ms-1">
                    تصفية بالأسلاك:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCorps('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      selectedCorps === 'all'
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container text-on-surface/70 hover:bg-surface-container-high"
                    )}
                  >
                    كافة أسلاك {selectedCategoryTitle}
                  </button>
                  {availableCorps.map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedCorps(cName)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                        selectedCorps === cName
                          ? "bg-primary text-on-primary shadow-xs"
                          : "bg-surface-container text-on-surface/70 hover:bg-surface-container-high"
                      )}
                    >
                      {cName}
                    </button>
                  ))}
                </div>
              )}

              {/* Grades Listing with Official Statutory Hierarchy */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface/80 flex items-center gap-1.5">
                    <span>قائمة الرتب المعتمدة:</span>
                    <span className="text-primary font-black">({displayedGrades.length} رتبة)</span>
                  </span>
                  {currentGradeObj && (
                    <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                      الرمز الوزاري: {currentGradeObj.code}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 border border-outline/15 rounded-2xl bg-surface-container-lowest">
                  {displayedGrades.map((g) => {
                    const isSelected = selectedGradeCode === g.code;
                    return (
                      <div
                        key={g.code}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectGrade(g)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectGrade(g); }}
                        className={cn(
                          "p-3 rounded-xl border text-start cursor-pointer transition-all flex flex-col justify-between gap-2 select-none",
                          isSelected
                            ? "border-primary ring-2 ring-primary/25 bg-primary/5 dark:bg-primary/10 shadow-xs"
                            : "border-outline/10 hover:border-primary/40 hover:bg-surface-container-low/40 bg-surface"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-on-surface">
                                {g.name}
                              </span>
                              {g.isExtinction && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                  <AlertTriangle size={10} />
                                  في طريق الزوال
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-on-surface/65 font-medium block truncate">
                              {g.corps} • {g.categoryGroup}
                            </span>
                          </div>

                          <div className="text-end shrink-0">
                            <span className="text-[10px] font-mono font-bold text-on-surface/50 px-1.5 py-0.5 rounded bg-surface-container block">
                              {g.code}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-primary mt-1 ms-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Grade Confirmation Banner */}
              {currentGradeObj && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-primary/5 to-emerald-50 dark:from-emerald-950/30 dark:via-primary/10 dark:to-emerald-950/30 rounded-2xl border border-emerald-300/60 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-primary">{currentGradeObj.name}</span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-surface border border-outline/15 text-primary">
                          {currentGradeObj.code}
                        </span>
                        {currentGradeObj.isExtinction && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            رتبة آيلة للزوال طبقاً للمرسوم 25-54
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-on-surface/75 font-medium mt-0.5">
                        {currentGradeObj.corps} ◀ {currentGradeObj.categoryGroup}
                      </div>
                    </div>
                  </div>

                  {/* Applet Workspace Badge */}
                  <div className="shrink-0 flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline/15 text-[11px]">
                    <span className="text-on-surface/60 font-medium">فضاء العمل المخصص:</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      {ROLE_CONFIGS[selectedRole].label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── 2. Identification & Institutional Data ─────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard size={16} />
                  <span>2. بيانات الهوية والمؤسسة التعليمية</span>
                </label>
                <span className="text-[11px] text-on-surface/60 font-medium">الربط التلقائي بقاعدة البيانات المدرسية الموحدة</span>
              </div>

              {/* Personal Identification: Full Name & NIN */}
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
                      placeholder="مثال: محمد بن عبد الله"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* National ID / NIN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                    <span>رقم التعريف الوطني أو الوظيفي (NIN)</span>
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
              </div>

              {/* Cascading Educational Institutional Hierarchy */}
              <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline/15 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-outline/10">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <School size={16} className="text-secondary" />
                    <span>بيانات المؤسسة التعليمية وقاعدة البيانات المدرسية</span>
                  </div>
                  {isLoadingSchools ? (
                    <span className="text-[11px] text-primary flex items-center gap-1 font-bold">
                      <Loader2 size={13} className="animate-spin" />
                      جاري تحميل قاعدة المؤسسات...
                    </span>
                  ) : (
                    <span className="text-[11px] text-on-surface/60 font-medium">
                      58 مديرية ولائية معتمدة
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. مديرية التربية */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface/80 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>مديرية التربية</span>
                        <span className="text-error">*</span>
                      </span>
                      {selectedDirectorate && (
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          ولاية {selectedDirectorate.slice(0, 2)}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDirectorate}
                        disabled={isLoadingSchools}
                        onChange={(e) => {
                          setSelectedDirectorate(e.target.value);
                          setSelectedCommune('');
                          setSelectedCycle('متوسط');
                          setSelectedSchool('');
                          setIsCustomSchool(false);
                          setCustomSchoolName('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingSchools ? 'جاري تحميل مديريات التربية...' : 'اختر مديرية التربية'}
                        </option>
                        {dirList.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. البلدية */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface/80 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>البلدية</span>
                        <span className="text-error">*</span>
                      </span>
                      {communesList.length > 0 && (
                        <span className="text-[10px] text-on-surface/60 font-medium">({communesList.length} بلدية)</span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCommune}
                        disabled={!selectedDirectorate || communesList.length === 0}
                        onChange={(e) => {
                          setSelectedCommune(e.target.value);
                          setSelectedCycle('متوسط');
                          setSelectedSchool('');
                          setIsCustomSchool(false);
                          setCustomSchoolName('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {selectedDirectorate ? 'اختر البلدية...' : 'يرجى اختيار مديرية التربية أولاً...'}
                        </option>
                        {communesList.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. الطور التعليمي */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                      <span>الطور التعليمي للمؤسسة</span>
                      <span className="text-error">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['متوسط', 'ثانوي', 'ابتدائي'].map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          disabled={!selectedCommune}
                          onClick={() => {
                            setSelectedCycle(cycle);
                            setSelectedSchool('');
                            setIsCustomSchool(false);
                            setCustomSchoolName('');
                          }}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl border transition-all disabled:opacity-50",
                            selectedCycle === cycle
                              ? "bg-primary text-on-primary border-primary shadow-xs"
                              : "bg-surface text-on-surface/70 border-outline/15 hover:border-primary/40"
                          )}
                        >
                          {cycle === 'متوسط' ? 'التعليم المتوسط (CEM)' : cycle === 'ثانوي' ? 'التعليم الثانوي (Lycée)' : 'التعليم الابتدائي'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. اسم المؤسسة التعليمية */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-on-surface/80 flex items-center gap-1">
                        <span>المؤسسة التعليمية</span>
                        <span className="text-error">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSchool(!isCustomSchool);
                          setSelectedSchool('');
                          setCustomSchoolName('');
                        }}
                        className="text-[11px] text-primary hover:underline font-bold"
                      >
                        {isCustomSchool ? '◀ العودة للقائمة المعتمدة' : '✍️ كتابة الاسم يدوياً'}
                      </button>
                    </div>

                    {!isCustomSchool ? (
                      <div className="relative">
                        <select
                          value={selectedSchool}
                          disabled={!selectedCommune || schoolsList.length === 0}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomSchool(true);
                              setSelectedSchool('');
                            } else {
                              setSelectedSchool(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">
                            {!selectedCommune 
                              ? 'يرجى اختيار البلدية أولاً...' 
                              : schoolsList.length === 0 
                                ? 'لا توجد مؤسسات مسجلة في هذا الطور، انقر كتابة يدوياً' 
                                : `اختر المؤسسة (${schoolsList.length} مؤسسة متوفرة)...`}
                          </option>
                          {schoolsList.map((s) => (
                            <option key={s.code || s.name} value={s.code || s.name}>
                              {s.name}
                            </option>
                          ))}
                          <option value="__custom__">-- إدخال اسم المؤسسة يدوياً --</option>
                        </select>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="اكتب اسم المؤسسة التعليمية كاملاً (مثال: متوسطة قطاف الطاهر)..."
                          value={customSchoolName}
                          onChange={(e) => setCustomSchoolName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview / Confirmation Card */}
                {resolvedSchoolName && (
                  <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-primary truncate">{resolvedSchoolName}</div>
                        <div className="text-[11px] text-on-surface/70 truncate">
                          {currentDirData?.name || `ولاية ${selectedDirectorate.slice(0, 2)}`} • بلدية {currentCommune?.name || selectedCommune} • الطور: {selectedCycle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      جاهزة للربط المؤسساتي
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── 3. Operational Role Details & Specialization ───────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={16} />
                  <span>3. فضاء العمل والبيانات التخصصية</span>
                </label>
                <span className="text-[11px] text-on-surface/60 font-medium">تخصيص الواجهة حسب الصلاحيات</span>
              </div>

              {/* Role specific forms */}
              {selectedRole === 'teacher' && (
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
                    <GraduationCap size={18} />
                    <span className="text-xs font-bold">بيانات التخصص والتدريس للأستاذ</span>
                  </div>

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
                    <span className="text-xs font-bold">تحديد المخبر المسند لموظف المخبر</span>
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
                    <span className="text-xs font-bold">صلاحيات المصالح الاقتصادية والتغذية</span>
                  </div>
                  <p className="text-xs text-purple-900/80 dark:text-purple-200/80 leading-relaxed font-medium">
                    تمكين الموظف من إدارة الميزانية والطلبيات، فواتير المستهلكات، معاينة سجل بطاقات الجرد الدائم، ومصادقة محاضر الإسقاط والتكهين.
                  </p>
                </div>
              )}

              {selectedRole === 'censor' && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <FileCheck size={18} />
                    <span className="text-xs font-bold">صلاحيات النظار وموظفي التربية والتوجيه</span>
                  </div>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed font-medium">
                    اعتماد الحصص المخبرية والتجارب المقترحة من الأساتذة، تأشير التقارير اليومية للمخابر، وتنسيق جداول استعمال القاعات والمخابر.
                  </p>
                </div>
              )}

              {selectedRole === 'director' && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
                    <Building2 size={18} />
                    <span className="text-xs font-bold">صلاحيات إدارة المؤسسات وهيئة التفتيش</span>
                  </div>
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed font-medium">
                    الإشراف الإداري الشامل، تأشير ومصادقة محاضر الجرد السنوي، تقارير السلامة والكسر، ومتابعة ربط كافة طواقم المؤسسة التعليمية.
                  </p>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── 4. Account Credentials & Contact ────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="pt-4 border-t border-outline/10 space-y-4">
              <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <LockIcon size={16} />
                <span>4. بيانات الحساب والاتصال</span>
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
              <div className="text-[11px] text-on-surface/70 leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-outline/10 flex items-start gap-2">
                <FileText size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  بالضغط على إنشاء الحساب، أقر بصحة البيانات الوظيفية ورقم التعريف الوطني، وتخضع الصلاحيات للضوابط التشريعية الرسمية للمرسوم التنفيذي رقم 25-54 لوزارة التربية الوطنية بالجمهورية الجزائرية.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary text-sm font-black shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    <span>جاري إنشاء وتفعيل الحساب والربط المؤسساتي...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>تأكيد التسجيل والتفعيل الفوري بالحساب</span>
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
