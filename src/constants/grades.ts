/**
 * القائمة الرسمية المعتمدة للأسلاك والرتب لقطاع التربية الوطنية بالجمهورية الجزائرية
 * طبقاً لأحكام المرسوم التنفيذي رقم 25-54 المتضمن القانون الأساسي الخاص بالموظفين
 * المنتمين للأسلاك الخاصة بالتربية الوطنية.
 */

export type PersonnelCategoryType =
  | 'موظفو التعليم'
  | 'موظفو التربية'
  | 'موظفو التوجيه والإرشاد المدرسي والمهني'
  | 'موظفو المخابر'
  | 'موظفو التغذية المدرسية'
  | 'موظفو المصالح الاقتصادية'
  | 'موظفو إدارة مؤسسات التربية والتعليم'
  | 'موظفو التفتيش';

export interface OfficialGrade {
  code: string;
  name: string;
  categoryGroup: PersonnelCategoryType;
  corps: string;
  category: 'enseignant' | 'administratif';
  cycle?: 'ابتدائي' | 'متوسط' | 'ثانوي' | 'مشترك';
  roles: ('teacher' | 'censor' | 'director' | 'lab_manager' | 'economist')[];
  isExtinction?: boolean; // في طريق الزوال
}

export interface PersonnelCategoryMeta {
  id: string;
  title: PersonnelCategoryType;
  shortTitle: string;
  badge: string;
  colorClass: string;
  activeBorder: string;
  description: string;
  defaultRole: 'teacher' | 'censor' | 'director' | 'lab_manager' | 'economist';
  corpsCount: number;
  gradesCount: number;
}

export const OFFICIAL_GRADES: OfficialGrade[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. موظفو التعليم
  // ──────────────────────────────────────────────────────────────────────────
  // سلك معلمي المدرسة الابتدائية
  {
    code: '09010101',
    name: 'معلم المدرسة الابتدائية (في طريق الزوال)',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك معلمي المدرسة الابتدائية',
    category: 'enseignant',
    cycle: 'ابتدائي',
    roles: ['teacher'],
    isExtinction: true
  },
  // سلك أساتذة التعليم الابتدائي
  {
    code: '09010201',
    name: 'أستاذ التعليم الابتدائي',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الابتدائي',
    category: 'enseignant',
    cycle: 'ابتدائي',
    roles: ['teacher']
  },
  {
    code: '09010202',
    name: 'أستاذ التعليم الابتدائي قسم أول',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الابتدائي',
    category: 'enseignant',
    cycle: 'ابتدائي',
    roles: ['teacher']
  },
  {
    code: '09010203',
    name: 'أستاذ التعليم الابتدائي قسم ثان',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الابتدائي',
    category: 'enseignant',
    cycle: 'ابتدائي',
    roles: ['teacher']
  },
  {
    code: '09010204',
    name: 'أستاذ مميز في التعليم الابتدائي',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الابتدائي',
    category: 'enseignant',
    cycle: 'ابتدائي',
    roles: ['teacher']
  },
  // سلك أساتذة التعليم الأساسي
  {
    code: '09010301',
    name: 'أستاذ التعليم الأساسي (في طريق الزوال)',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الأساسي',
    category: 'enseignant',
    cycle: 'متوسط',
    roles: ['teacher'],
    isExtinction: true
  },
  // سلك أساتذة التعليم المتوسط
  {
    code: '09010401',
    name: 'أستاذ التعليم المتوسط',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم المتوسط',
    category: 'enseignant',
    cycle: 'متوسط',
    roles: ['teacher']
  },
  {
    code: '09010402',
    name: 'أستاذ التعليم المتوسط قسم أول',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم المتوسط',
    category: 'enseignant',
    cycle: 'متوسط',
    roles: ['teacher']
  },
  {
    code: '09010403',
    name: 'أستاذ التعليم المتوسط قسم ثان',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم المتوسط',
    category: 'enseignant',
    cycle: 'متوسط',
    roles: ['teacher']
  },
  {
    code: '09010404',
    name: 'أستاذ مميز في التعليم المتوسط',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم المتوسط',
    category: 'enseignant',
    cycle: 'متوسط',
    roles: ['teacher']
  },
  // سلك أساتذة التعليم الثانوي
  {
    code: '09010501',
    name: 'أستاذ التعليم الثانوي',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الثانوي',
    category: 'enseignant',
    cycle: 'ثانوي',
    roles: ['teacher']
  },
  {
    code: '09010502',
    name: 'أستاذ التعليم الثانوي قسم أول',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الثانوي',
    category: 'enseignant',
    cycle: 'ثانوي',
    roles: ['teacher']
  },
  {
    code: '09010503',
    name: 'أستاذ التعليم الثانوي قسم ثان',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الثانوي',
    category: 'enseignant',
    cycle: 'ثانوي',
    roles: ['teacher']
  },
  {
    code: '09010504',
    name: 'أستاذ مميز في التعليم الثانوي',
    categoryGroup: 'موظفو التعليم',
    corps: 'سلك أساتذة التعليم الثانوي',
    category: 'enseignant',
    cycle: 'ثانوي',
    roles: ['teacher']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. موظفو التربية
  // ──────────────────────────────────────────────────────────────────────────
  // سلك النظار
  {
    code: '09020101',
    name: 'ناظر في التعليم الابتدائي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك النظار',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['censor']
  },
  {
    code: '09020102',
    name: 'ناظر في التعليم المتوسط',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك النظار',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['censor']
  },
  {
    code: '09020103',
    name: 'ناظر في التعليم الثانوي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك النظار',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['censor']
  },
  // سلك مستشاري التربية
  {
    code: '09020201',
    name: 'مستشار التربية (في طريق الزوال)',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مستشاري التربية',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['censor'],
    isExtinction: true
  },
  // سلك مساعدي التربية
  {
    code: '09020301',
    name: 'مساعد التربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مساعدي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020302',
    name: 'مساعد رئيسي للتربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مساعدي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  // سلك مشرفي التربية
  {
    code: '09020401',
    name: 'مشرف التربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مشرفي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020402',
    name: 'مشرف رئيسي للتربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مشرفي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020403',
    name: 'مشرف رئيس للتربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مشرفي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020404',
    name: 'مشرف عام للتربية',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك مشرفي التربية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  // سلك المربين المتخصصين في الدعم التربوي
  {
    code: '09020501',
    name: 'مربي متخصص في الدعم التربوي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك المربين المتخصصين في الدعم التربوي',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020502',
    name: 'مربي متخصص رئيسي في الدعم التربوي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك المربين المتخصصين في الدعم التربوي',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020503',
    name: 'مربي متخصص رئيس في الدعم التربوي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك المربين المتخصصين في الدعم التربوي',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09020504',
    name: 'مربي متخصص عام في الدعم التربوي',
    categoryGroup: 'موظفو التربية',
    corps: 'سلك المربين المتخصصين في الدعم التربوي',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. موظفو التوجيه والإرشاد المدرسي والمهني
  // ──────────────────────────────────────────────────────────────────────────
  // سلك مستشاري التوجيه والإرشاد المدرسي والمهني
  {
    code: '09030101',
    name: 'مستشار التوجيه والإرشاد المدرسي والمهني (في طريق الزوال)',
    categoryGroup: 'موظفو التوجيه والإرشاد المدرسي والمهني',
    corps: 'سلك مستشاري التوجيه والإرشاد المدرسي والمهني',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor'],
    isExtinction: true
  },
  {
    code: '09030102',
    name: 'مستشار محلل للتوجيه والإرشاد المدرسي والمهني',
    categoryGroup: 'موظفو التوجيه والإرشاد المدرسي والمهني',
    corps: 'سلك مستشاري التوجيه والإرشاد المدرسي والمهني',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09030103',
    name: 'مستشار رئيسي للتوجيه والإرشاد المدرسي والمهني',
    categoryGroup: 'موظفو التوجيه والإرشاد المدرسي والمهني',
    corps: 'سلك مستشاري التوجيه والإرشاد المدرسي والمهني',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },
  {
    code: '09030104',
    name: 'مستشار رئيس في التوجيه والإرشاد المدرسي والمهني',
    categoryGroup: 'موظفو التوجيه والإرشاد المدرسي والمهني',
    corps: 'سلك مستشاري التوجيه والإرشاد المدرسي والمهني',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['censor']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. موظفو المخابر
  // ──────────────────────────────────────────────────────────────────────────
  // سلك الأعوان التقنيين للمخابر
  {
    code: '09040101',
    name: 'عون تقني للمخابر (في طريق الزوال)',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك الأعوان التقنيين للمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager'],
    isExtinction: true
  },
  // سلك المعاونين التقنيين للمخابر
  {
    code: '09040201',
    name: 'معاون تقني للمخابر (في طريق الزوال)',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك المعاونين التقنيين للمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager'],
    isExtinction: true
  },
  // سلك الملحقين بالمخابر
  {
    code: '09040301',
    name: 'ملحق بالمخابر (في طريق الزوال)',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك الملحقين بالمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager'],
    isExtinction: true
  },
  {
    code: '09040302',
    name: 'ملحق رئيسي بالمخابر',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك الملحقين بالمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager']
  },
  {
    code: '09040303',
    name: 'ملحق رئيس بالمخابر',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك الملحقين بالمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager']
  },
  {
    code: '09040304',
    name: 'ملحق مشرف بالمخابر',
    categoryGroup: 'موظفو المخابر',
    corps: 'سلك الملحقين بالمخابر',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['lab_manager']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. موظفو التغذية المدرسية
  // ──────────────────────────────────────────────────────────────────────────
  // سلك مستشاري التغذية المدرسية
  {
    code: '09050101',
    name: 'مستشار التغذية المدرسية',
    categoryGroup: 'موظفو التغذية المدرسية',
    corps: 'سلك مستشاري التغذية المدرسية',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['economist', 'censor']
  },
  {
    code: '09050102',
    name: 'مستشار رئيسي في التغذية المدرسية',
    categoryGroup: 'موظفو التغذية المدرسية',
    corps: 'سلك مستشاري التغذية المدرسية',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['economist', 'censor']
  },
  {
    code: '09050103',
    name: 'مستشار رئيس في التغذية المدرسية',
    categoryGroup: 'موظفو التغذية المدرسية',
    corps: 'سلك مستشاري التغذية المدرسية',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['economist', 'censor']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. موظفو المصالح الاقتصادية
  // ──────────────────────────────────────────────────────────────────────────
  // سلك مساعدي المصالح الاقتصادية
  {
    code: '09060101',
    name: 'مساعد المصالح الاقتصادية (في طريق الزوال)',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك مساعدي المصالح الاقتصادية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist'],
    isExtinction: true
  },
  {
    code: '09060102',
    name: 'المساعد الرئيسي للمصالح الاقتصادية',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك مساعدي المصالح الاقتصادية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist']
  },
  // سلك نواب المقتصدين
  {
    code: '09060201',
    name: 'نائب مقتصد',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك نواب المقتصدين',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist']
  },
  {
    code: '09060202',
    name: 'نائب مقتصد مسير',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك نواب المقتصدين',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist']
  },
  // سلك المقتصدين
  {
    code: '09060301',
    name: 'مقتصد',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك المقتصدين',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist']
  },
  {
    code: '09060302',
    name: 'مقتصد رئيسي',
    categoryGroup: 'موظفو المصالح الاقتصادية',
    corps: 'سلك المقتصدين',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['economist']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. موظفو إدارة مؤسسات التربية والتعليم
  // ──────────────────────────────────────────────────────────────────────────
  // سلك مديري المدارس الابتدائية
  {
    code: '09070101',
    name: 'مدير مدرسة ابتدائية',
    categoryGroup: 'موظفو إدارة مؤسسات التربية والتعليم',
    corps: 'سلك مديري المدارس الابتدائية',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['director']
  },
  // سلك مديري المتوسطات
  {
    code: '09070201',
    name: 'مدير متوسطة',
    categoryGroup: 'موظفو إدارة مؤسسات التربية والتعليم',
    corps: 'سلك مديري المتوسطات',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['director']
  },
  // سلك مديري الثانويات
  {
    code: '09070301',
    name: 'مدير ثانوية',
    categoryGroup: 'موظفو إدارة مؤسسات التربية والتعليم',
    corps: 'سلك مديري الثانويات',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['director']
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. موظفو التفتيش
  // ──────────────────────────────────────────────────────────────────────────
  // سلك مفتشي التعليم الابتدائي
  {
    code: '09080101',
    name: 'مفتش التعليم الابتدائي تخصص المواد',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الابتدائي',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['director', 'censor']
  },
  {
    code: '09080102',
    name: 'مفتش التعليم الابتدائي تخصص إدارة المدارس الابتدائية',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الابتدائي',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['director']
  },
  {
    code: '09080103',
    name: 'مفتش التعليم الابتدائي تخصص التغذية المدرسية',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الابتدائي',
    category: 'administratif',
    cycle: 'ابتدائي',
    roles: ['economist', 'director']
  },
  // سلك مفتشي التعليم المتوسط
  {
    code: '09080201',
    name: 'مفتش التعليم المتوسط تخصص المواد',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم المتوسط',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['director', 'censor']
  },
  {
    code: '09080202',
    name: 'مفتش التعليم المتوسط تخصص إدارة المتوسطات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم المتوسط',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['director']
  },
  {
    code: '09080203',
    name: 'مفتش التوجيه والإرشاد المدرسي والمهني في المتوسطات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم المتوسط',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['director', 'censor']
  },
  {
    code: '09080204',
    name: 'مفتش التسيير المالي والمادي في المتوسطات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم المتوسط',
    category: 'administratif',
    cycle: 'متوسط',
    roles: ['economist', 'director']
  },
  // سلك مفتشي التعليم الثانوي
  {
    code: '09080301',
    name: 'مفتش التعليم الثانوي تخصص مواد',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الثانوي',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['director', 'censor']
  },
  {
    code: '09080302',
    name: 'مفتش التعليم الثانوي تخصص إدارة الثانويات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الثانوي',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['director']
  },
  {
    code: '09080303',
    name: 'مفتش التوجيه والإرشاد المدرسي والمهني في الثانويات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الثانوي',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['director', 'censor']
  },
  {
    code: '09080304',
    name: 'مفتش التسيير المالي والمادي في الثانويات',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التعليم الثانوي',
    category: 'administratif',
    cycle: 'ثانوي',
    roles: ['economist', 'director']
  },
  // سلك مفتشي التربية الوطنية
  {
    code: '09080401',
    name: 'مفتش التربية الوطنية',
    categoryGroup: 'موظفو التفتيش',
    corps: 'سلك مفتشي التربية الوطنية',
    category: 'administratif',
    cycle: 'مشترك',
    roles: ['director']
  }
];

/**
 * البيانات الوصفية الرسمية للشعب والفئات الثمانية طبقاً للمرسوم التنفيذي 25-54
 */
export const OFFICIAL_PERSONNEL_CATEGORIES: PersonnelCategoryMeta[] = [
  {
    id: 'teaching',
    title: 'موظفو التعليم',
    shortTitle: 'التعليم والتدريس',
    badge: '5 أسلاك • 14 رتبة',
    colorClass: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300',
    activeBorder: 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/40',
    description: 'أساتذة ومعلمو المراحل التعليمية الثلاث (ابتدائي، متوسط، ثانوي)، حجز الحصص وطلبات الوسائل.',
    defaultRole: 'teacher',
    corpsCount: 5,
    gradesCount: 14
  },
  {
    id: 'education_supervision',
    title: 'موظفو التربية',
    shortTitle: 'التأطير التربوي والنظار',
    badge: '5 أسلاك • 14 رتبة',
    colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/40',
    description: 'النظار، مستشارو ومشرفو ومساعدو التربية، ومربو الدعم التربوي، التنسيق البيداغوجي وتأشير الحصص.',
    defaultRole: 'censor',
    corpsCount: 5,
    gradesCount: 14
  },
  {
    id: 'orientation',
    title: 'موظفو التوجيه والإرشاد المدرسي والمهني',
    shortTitle: 'التوجيه والإرشاد',
    badge: 'سلك واحد • 4 رتب',
    colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300',
    activeBorder: 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/40 dark:bg-teal-950/40',
    description: 'المستشارون والمحللون للتوجيه المدرسي والمهني، متابعة المسار الدراسي للمتعلمين.',
    defaultRole: 'censor',
    corpsCount: 1,
    gradesCount: 4
  },
  {
    id: 'laboratory',
    title: 'موظفو المخابر',
    shortTitle: 'المخابر والتجهيز العلمي',
    badge: '3 أسلاك • 6 رتب',
    colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    activeBorder: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/40',
    description: 'الملحقون، المعاونون والأعوان التقنيون بالمخابر، إدارة الجرد، تحضير التجارب والسلامة الكيميائية.',
    defaultRole: 'lab_manager',
    corpsCount: 3,
    gradesCount: 6
  },
  {
    id: 'school_catering',
    title: 'موظفو التغذية المدرسية',
    shortTitle: 'التغذية المدرسية',
    badge: 'سلك واحد • 3 رتب',
    colorClass: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300',
    activeBorder: 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/40 dark:bg-orange-950/40',
    description: 'مستشارو التغذية المدرسية، متابعة المطاعم المدرسية وتسيير التموين الصحي.',
    defaultRole: 'economist',
    corpsCount: 1,
    gradesCount: 3
  },
  {
    id: 'economy',
    title: 'موظفو المصالح الاقتصادية',
    shortTitle: 'المصالح الاقتصادية والمادية',
    badge: '3 أسلاك • 6 رتب',
    colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300',
    activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/40',
    description: 'المقتصدون ونوابهم ومساعدو المصالح، تسيير الميزانية والمشتريات وسجلات بطاقات الجرد والتكهين.',
    defaultRole: 'economist',
    corpsCount: 3,
    gradesCount: 6
  },
  {
    id: 'school_management',
    title: 'موظفو إدارة مؤسسات التربية والتعليم',
    shortTitle: 'الإدارة العليا للمؤسسة',
    badge: '3 أسلاك • 3 رتب',
    colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300',
    activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/40',
    description: 'مديرو المدارس الابتدائية، المتوسطات، والثانويات، التأشير والمصادقة وتأسيس قاعدة بيانات المؤسسة.',
    defaultRole: 'director',
    corpsCount: 3,
    gradesCount: 3
  },
  {
    id: 'inspection',
    title: 'موظفو التفتيش',
    shortTitle: 'هيئة التفتيش والمراقبة',
    badge: '4 أسلاك • 12 رتبة',
    colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
    activeBorder: 'border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/40 dark:bg-rose-950/40',
    description: 'مفتشو التعليم الابتدائي، المتوسط، الثانوي، ومفتشو التربية الوطنية بكافة تخصصاتهم.',
    defaultRole: 'director',
    corpsCount: 4,
    gradesCount: 12
  }
];

/**
 * دالة جلب الرتب حسب الفئة الرسمية (الشعبة)
 */
export function getGradesByPersonnelCategory(categoryTitle: PersonnelCategoryType): OfficialGrade[] {
  return OFFICIAL_GRADES.filter(g => g.categoryGroup === categoryTitle);
}

/**
 * دالة جلب الأسلاك الفرعية داخل الفئة الرسمية
 */
export function getCorpsByCategory(categoryTitle: PersonnelCategoryType): string[] {
  const grades = getGradesByPersonnelCategory(categoryTitle);
  return Array.from(new Set(grades.map(g => g.corps)));
}

/**
 * دالة جلب الرتب حسب السلك
 */
export function getGradesByCorps(corpsName: string): OfficialGrade[] {
  return OFFICIAL_GRADES.filter(g => g.corps === corpsName);
}

/**
 * دالة مساعدة لجلب الرتب بحسب التخصص العام (قديم)
 */
export function getGradesByCategory(category: 'enseignant' | 'administratif'): OfficialGrade[] {
  return OFFICIAL_GRADES.filter(g => g.category === category);
}

/**
 * دالة مساعدة لجلب الرتب الملائمة لدور محدد والطور التعليمي
 */
export function getGradesByRoleAndCycle(
  role: 'teacher' | 'censor' | 'director' | 'lab_manager' | 'economist',
  cycle?: string
): OfficialGrade[] {
  const roleGrades = OFFICIAL_GRADES.filter(g => g.roles.includes(role));
  if (!cycle) return roleGrades;
  
  const matchingCycle = roleGrades.filter(g => g.cycle === cycle || g.cycle === 'مشترك');
  return matchingCycle.length > 0 ? matchingCycle : roleGrades;
}

/**
 * تنظيف اسم الرتبة بإزالة عبارة (في طريق الزوال) وأي أقواس أو رموز إضافية
 */
export function cleanGradeName(name: string): string {
  if (!name) return '';
  return name.replace(/\s*\(في طريق الزوال\)\s*/g, '').replace(/\s*\[.*?\]\s*/g, '').trim();
}

/**
 * البحث عن الرتبة الرسمية بالكود أو الاسم
 */
export function findGradeByCodeOrName(identifier: string): OfficialGrade | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim();
  const normalizedClean = cleanGradeName(clean);
  return OFFICIAL_GRADES.find(g => 
    g.code === clean || 
    g.name === clean || 
    cleanGradeName(g.name) === clean ||
    cleanGradeName(g.name) === normalizedClean
  );
}
