import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  FlaskConical, 
  FileCheck, 
  Wallet, 
  AlertTriangle, 
  User, 
  Phone, 
  IdCard, 
  Award, 
  Save, 
  X,
  Sparkles,
  School as SchoolIcon,
  BookOpen
} from 'lucide-react';
import { 
  OFFICIAL_GRADES, 
  OFFICIAL_PERSONNEL_CATEGORIES, 
  OfficialGrade, 
  PersonnelCategoryType, 
  PersonnelCategoryMeta,
  getGradesByPersonnelCategory, 
  getCorpsByCategory, 
  findGradeByCodeOrName,
  getWorkspaceRoleForGrade 
} from '../constants/grades';
import { useUserRole, StatutoryProfileInput, ROLE_CONFIGS } from '../context/UserRoleContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface StatutoryProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
}

export default function StatutoryProfileModal({ 
  isOpen, 
  onClose, 
  isMandatory = false 
}: StatutoryProfileModalProps) {
  const { userProfile, completeStatutoryProfile } = useUserRole();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Selected Category & Grade
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<PersonnelCategoryType | null>(() => {
    if (userProfile?.categoryGroup) return userProfile.categoryGroup as PersonnelCategoryType;
    return null;
  });
  const [selectedCorps, setSelectedCorps] = useState<string>('all');
  const [gradeSearchQuery, setGradeSearchQuery] = useState('');
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>(() => {
    return userProfile?.gradeCode || '';
  });

  // Personal info
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [nationalId, setNationalId] = useState(userProfile?.nationalId || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  // Teaching / Lab specifics
  const [teacherSubject, setTeacherSubject] = useState(userProfile?.subject || 'العلوم الفيزيائية والتكنولوجيا');
  const [teacherLevels, setTeacherLevels] = useState<string[]>(userProfile?.levels || ['1 ج م ع ت', '2 ع ت', '3 ع ت']);
  const [labSpecialty, setLabSpecialty] = useState('مخبر العلوم الفيزيائية');

  // Institution cascading state
  const [schoolsDb, setSchoolsDb] = useState<any>(null);
  const [dirList, setDirList] = useState<{ id: string; name: string; wilayaNum: number }[]>([]);
  const [selectedDirectorate, setSelectedDirectorate] = useState(userProfile?.directorate || '');
  const [selectedCommune, setSelectedCommune] = useState(userProfile?.commune || '');
  const [selectedCycle, setSelectedCycle] = useState<'ابتدائي' | 'متوسط' | 'ثانوي'>('متوسط');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [customSchoolName, setCustomSchoolName] = useState(userProfile?.institution || '');
  const [isCustomSchool, setIsCustomSchool] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load schools database
  useEffect(() => {
    let isMounted = true;
    import('../data/schools').then(({ SCHOOL_DB }) => {
      if (!isMounted) return;
      setSchoolsDb(SCHOOL_DB);

      const list = Object.entries(SCHOOL_DB).map(([id, data]) => {
        const wilayaNum = parseInt(id.slice(0, 2), 10) || 99;
        return { id, name: data.name, wilayaNum };
      }).sort((a, b) => a.wilayaNum - b.wilayaNum || a.name.localeCompare(b.name, 'ar'));

      setDirList(list);
    }).catch(err => {
      console.warn('Failed to load schools db:', err);
    });

    return () => { isMounted = false; };
  }, []);

  // Sync initial userProfile data when available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !fullName) setFullName(userProfile.name);
      if (userProfile.phone && !phone) setPhone(userProfile.phone);
      if (userProfile.nationalId && !nationalId) setNationalId(userProfile.nationalId);
      if (userProfile.gradeCode && !selectedGradeCode) {
        setSelectedGradeCode(userProfile.gradeCode);
        const g = findGradeByCodeOrName(userProfile.gradeCode);
        if (g) setSelectedCategoryTitle(g.categoryGroup);
      }
      if (userProfile.institution && !customSchoolName) {
        setCustomSchoolName(userProfile.institution);
      }
    }
  }, [userProfile]);

  const currentDirData = (schoolsDb && selectedDirectorate)
    ? (schoolsDb[selectedDirectorate] || Object.values(schoolsDb).find((d: any) => d.name === selectedDirectorate || d.name.includes(selectedDirectorate)))
    : null;

  const communesList = currentDirData?.communes
    ? Object.entries(currentDirData.communes).map(([id, com]: [string, any]) => ({
        id,
        name: com.name,
        cycles: com.cycles
      })).sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    : [];

  const currentCommune = currentDirData?.communes?.[selectedCommune]
    || (currentDirData?.communes && Object.values(currentDirData.communes).find((c: any) => c.name === selectedCommune));

  const schoolsList: any[] = (currentCommune?.cycles && selectedCycle && currentCommune.cycles[selectedCycle])
    ? [...currentCommune.cycles[selectedCycle]].sort((a: any, b: any) => a.name.localeCompare(b.name, 'ar'))
    : [];

  const resolvedSchoolName = isCustomSchool || !schoolsList.length
    ? customSchoolName.trim()
    : (schoolsList.find((s: any) => s.code === selectedSchool)?.name || (selectedSchool && selectedSchool !== '__custom__' ? selectedSchool : customSchoolName.trim()));

  const currentGradeObj = useMemo(() => {
    if (!selectedGradeCode) return null;
    return findGradeByCodeOrName(selectedGradeCode) || null;
  }, [selectedGradeCode]);

  const determinedRole = useMemo(() => {
    if (!currentGradeObj) return null;
    return getWorkspaceRoleForGrade(currentGradeObj);
  }, [currentGradeObj]);

  const availableCorps = useMemo(() => {
    if (!selectedCategoryTitle) return [];
    return getCorpsByCategory(selectedCategoryTitle);
  }, [selectedCategoryTitle]);

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
    if (selectedCategoryTitle) {
      let list = getGradesByPersonnelCategory(selectedCategoryTitle);
      if (selectedCorps !== 'all') {
        list = list.filter(g => g.corps === selectedCorps);
      }
      return list;
    }
    return OFFICIAL_GRADES;
  }, [selectedCategoryTitle, selectedCorps, gradeSearchQuery]);

  const handleSelectGrade = (grade: OfficialGrade) => {
    setSelectedGradeCode(grade.code);
    setSelectedCategoryTitle(grade.categoryGroup);
    setError(null);
  };

  const handleSelectCategory = (cat: PersonnelCategoryMeta) => {
    setSelectedCategoryTitle(cat.title);
    setSelectedCorps('all');
    setGradeSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedGradeCode || !currentGradeObj) {
      setError('يرجى تحديد رتبتك الرسمية لتحديد فضاء العمل الخاص بك.');
      return;
    }

    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم واللقب الكامل.');
      return;
    }

    const finalSchool = resolvedSchoolName || customSchoolName.trim();
    if (!finalSchool) {
      setError('يرجى تحديد اسم المؤسسة التعليمية.');
      return;
    }

    setLoading(true);
    try {
      const dirName = currentDirData?.name || (selectedDirectorate ? `مديرية التربية لولاية ${selectedDirectorate}` : 'مديرية التربية للجزائر');
      const communeName = currentCommune?.name || selectedCommune || 'المركز';

      const input: StatutoryProfileInput = {
        fullName: fullName.trim(),
        nationalId: nationalId.trim() || 'NIN-000',
        phone: phone.trim() || '',
        gradeCode: currentGradeObj.code,
        gradeName: currentGradeObj.name,
        corps: currentGradeObj.corps,
        categoryGroup: currentGradeObj.categoryGroup,
        directorate: dirName,
        commune: communeName,
        cycle: selectedCycle,
        institution: finalSchool,
        subject: determinedRole === 'teacher' ? teacherSubject : undefined,
        levels: determinedRole === 'teacher' ? teacherLevels : undefined,
        labSpecialty: determinedRole === 'lab_manager' ? labSpecialty : undefined
      };

      const newRole = await completeStatutoryProfile(input);
      setSuccessMsg(`تم ضبط وتثبيت فضاء العمل بنجاح: (${ROLE_CONFIGS[newRole].label}). جاري التوجيه...`);

      setTimeout(() => {
        onClose?.();
        navigate(ROLE_CONFIGS[newRole].defaultPath, { replace: true });
      }, 700);
    } catch (err: any) {
      console.error('Error saving statutory profile:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ المعلومات الرسمية.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="statutory-modal-title"
        className="w-full max-w-4xl bg-surface dark:bg-surface-container-high rounded-3xl border border-outline/20 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/15 via-surface-container to-secondary/15 px-6 py-5 border-b border-outline/10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary text-on-primary">
                المرسوم التنفيذي 25-54
              </span>
              <h2 id="statutory-modal-title" className="text-base sm:text-lg font-black text-primary">
                تحديد واستكمال المعلومات الضرورية لضبط فضاء العمل
              </h2>
            </div>
            <p className="text-xs text-on-surface/75 font-medium leading-relaxed">
              بالنسبة للحسابات المسجلة: يتطلب تحديد فضاء العمل ملء جميع المعلومات الرسمية (الرتبة، السلك، والمؤسسة التعليمية) لضبط الصلاحيات المعتمدة بدقة.
            </p>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-all"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/25 text-error text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ════ 1. Official Grade Selection (Determines Workspace) ════ */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-2">
              <div>
                <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-secondary" />
                  <span>1. الرتبة الرسمية المعتمدة (تحدد فضاء العمل تلقائياً)</span>
                  <span className="text-error">*</span>
                </label>
                <p className="text-[11px] text-on-surface/65 font-medium mt-0.5">
                  اختر رتبتك طبقاً لقرار التعيين أو الترقية لتحديد فضاء العمل الخاص بك
                </p>
              </div>

              {/* Grade Search */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none" />
                <input
                  type="text"
                  value={gradeSearchQuery}
                  onChange={(e) => setGradeSearchQuery(e.target.value)}
                  placeholder="بحث سريع بالرتبة أو الرمز..."
                  className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl border border-outline/20 bg-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Category Selector Chips */}
            {!gradeSearchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => { setSelectedCategoryTitle(null); setSelectedCorps('all'); }}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    !selectedCategoryTitle
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container text-on-surface/70 hover:bg-surface-container-high"
                  )}
                >
                  كافة الشعب الرسمية
                </button>
                {OFFICIAL_PERSONNEL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      selectedCategoryTitle === cat.title
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container text-on-surface/70 hover:bg-surface-container-high"
                    )}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            )}

            {/* Grades Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border border-outline/15 rounded-2xl bg-surface-container-lowest">
              {displayedGrades.map(g => {
                const isSelected = selectedGradeCode === g.code;
                const roleForG = getWorkspaceRoleForGrade(g);
                return (
                  <div
                    key={g.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectGrade(g)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectGrade(g); }}
                    className={cn(
                      "p-2.5 rounded-xl border text-start cursor-pointer transition-all flex flex-col justify-between gap-1 select-none",
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
                            <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              آيلة للزوال
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface/65 font-medium block truncate">
                          {g.corps}
                        </span>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="text-[9px] font-mono font-bold text-on-surface/50 px-1 rounded bg-surface-container block">
                          {g.code}
                        </span>
                        {isSelected && <CheckCircle2 size={14} className="text-primary mt-1 ms-auto" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-outline/5 text-on-surface/60">
                      <span>الفضاء: <strong className="text-primary">{ROLE_CONFIGS[roleForG].label}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Grade Result */}
            {currentGradeObj && determinedRole && (
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary">{currentGradeObj.name}</span>
                      <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-outline/10">
                        {currentGradeObj.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface/70">
                      {currentGradeObj.corps} • {currentGradeObj.categoryGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-outline/10 text-xs shrink-0">
                  <span className="text-on-surface/60">الفضاء المحدد:</span>
                  <strong className="text-primary">{ROLE_CONFIGS[determinedRole].label}</strong>
                </div>
              </div>
            )}
          </div>

          {/* ════ 2. Educational Institution & Cascading Location ════ */}
          <div className="space-y-3 pt-3 border-t border-outline/10">
            <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={16} />
              <span>2. بيانات المؤسسة التربوية والربط الجغرافي</span>
              <span className="text-error">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Directorate */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">مديرية التربية (الولاية) *</label>
                <select
                  value={selectedDirectorate}
                  onChange={(e) => {
                    setSelectedDirectorate(e.target.value);
                    setSelectedCommune('');
                    setSelectedSchool('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                >
                  <option value="">-- اختر مديرية التربية --</option>
                  {dirList.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Commune */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">البلدية *</label>
                <select
                  value={selectedCommune}
                  onChange={(e) => {
                    setSelectedCommune(e.target.value);
                    setSelectedSchool('');
                  }}
                  disabled={!communesList.length}
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value="">-- اختر البلدية --</option>
                  {communesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Cycle */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">الطور التعليمي *</label>
                <select
                  value={selectedCycle}
                  onChange={(e) => {
                    setSelectedCycle(e.target.value as any);
                    setSelectedSchool('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                >
                  <option value="متوسط">التعليم المتوسط (متوسطة)</option>
                  <option value="ثانوي">التعليم الثانوي (ثانوية)</option>
                  <option value="ابتدائي">التعليم الابتدائي (مدرسة)</option>
                </select>
              </div>
            </div>

            {/* School selector or custom */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface/80">اسم المؤسسة التعليمية *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSchool(!isCustomSchool)}
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  {isCustomSchool ? "اختيار من القائمة الرسمية" : "إدخال اسم المؤسسة يدوياً"}
                </button>
              </div>

              {!isCustomSchool && schoolsList.length > 0 ? (
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomSchool(true);
                    } else {
                      setSelectedSchool(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                >
                  <option value="">-- اختر المؤسسة من القائمة --</option>
                  {schoolsList.map(s => (
                    <option key={s.code || s.name} value={s.code || s.name}>{s.name}</option>
                  ))}
                  <option value="__custom__">-- غير موجودة في القائمة (إدخال يدوي) --</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="مثال: ثانوية العقيد لطفي، متوسطة المجاهد ابن باديس..."
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                />
              )}
            </div>
          </div>

          {/* ════ 3. Identification & Specific Fields ════ */}
          <div className="space-y-3 pt-3 border-t border-outline/10">
            <label className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <IdCard size={16} />
              <span>3. بيانات الهوية والمعلومات المهنية</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">الاسم واللقب الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم واللقب"
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                />
              </div>

              {/* National ID / NIN */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">رقم التعريف الوظيفي / الوطني</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="مثال: 0012345678"
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/80">رقم الهاتف للتواصل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 / 07 / 05..."
                  className="w-full px-3 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-primary outline-none dir-ltr text-end"
                />
              </div>
            </div>

            {/* Role specific: Teacher */}
            {determinedRole === 'teacher' && (
              <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 space-y-2 mt-2">
                <label className="text-xs font-black text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  <span>تخصيص مادة التدريس والمستويات التعليمية للأستاذ</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface/75">مادة التدريس</label>
                    <select
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-sky-500 outline-none"
                    >
                      <option value="العلوم الفيزيائية والتكنولوجيا">العلوم الفيزيائية والتكنولوجيا</option>
                      <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة</option>
                      <option value="الرياضيات">الرياضيات</option>
                      <option value="التكنولوجيا">التكنولوجيا (هندسة ميكانيكية/كهربائية/طرائق)</option>
                      <option value="الإعلام الآلي">الإعلام الآلي</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface/75">المستويات المسندة</label>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {['1 ج م ع ت', '2 ع ت', '3 ع ت', '1 متوسط', '2 متوسط', '3 متوسط', '4 متوسط'].map(lvl => {
                        const checked = teacherLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              setTeacherLevels(checked ? teacherLevels.filter(x => x !== lvl) : [...teacherLevels, lvl]);
                            }}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all",
                              checked ? "bg-sky-600 text-white border-sky-600" : "bg-surface border-outline/15 text-on-surface/70"
                            )}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-on-surface/65 font-medium flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" />
              <span>سيتم حفظ بياناتك الرسمية وربط حسابك بالمؤسسة وفضاء العمل تلقائياً.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isMandatory && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-outline/20 text-xs font-bold text-on-surface hover:bg-surface-container transition-all"
                >
                  إلغاء
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !selectedGradeCode}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <span>جاري الحفظ والضبط...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>حفظ وتثبيت المعلومات وتحديد الفضاء</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
