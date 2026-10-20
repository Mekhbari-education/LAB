import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher } from '../types/teachers';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { findGradeByCodeOrName, cleanGradeName, OFFICIAL_GRADES, getWorkspaceRoleForGrade } from '../constants/grades';

export type UserRole = 'director' | 'censor' | 'teacher' | 'lab_manager' | 'economist';

export interface UserProfileData {
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  nationalId: string;       // رقم التعريف الوطني أو الوظيفي
  institution: string;      // المؤسسة التعليمية (ثانوية / متوسطة)
  wilaya?: string;          // الولاية
  commune?: string;         // البلدية
  directorate?: string;     // مديرية التربية
  educationLevel?: string;  // الطور التعليمي
  phone?: string;           // رقم الهاتف
  subject?: string;         // مادة التدريس (للأستاذ)
  grade?: string;           // الدرجة أو الرتبة
  gradeCode?: string;       // رمز الرتبة الوزاري الرسمي
  corps?: string;           // السلك الوظيفي
  categoryGroup?: string;   // الشعبة الوظيفية
  levels?: string[];        // الأطوار والمستويات
  createdAt?: any;
  status: 'active';
}

export interface RoleInfo {
  role: UserRole;
  label: string;
  shortLabel: string;
  badgeClass: string;
  defaultPath: string;
  description: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleInfo> = {
  director: {
    role: 'director',
    label: 'مدير المؤسسة التعليمية',
    shortLabel: 'المدير',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800',
    defaultPath: '/director-portal',
    description: 'المصادقة الإدارية، تأشير التقارير، ومتابعة مؤشرات أداء المخابر والأمان'
  },
  censor: {
    role: 'censor',
    label: 'ناظر الدروس (المشرف البيداغوجي)',
    shortLabel: 'الناظر',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    defaultPath: '/censor-portal',
    description: 'اعتماد طلبات الحصص المخبرية، تأشيرة التقارير اليومية، وتنسيق الأفواج'
  },
  teacher: {
    role: 'teacher',
    label: 'أستاذ المادة التعليمية',
    shortLabel: 'أستاذ',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800',
    defaultPath: '/teacher-portal',
    description: 'حجز الحصص المخبرية، طلب العتاد والمحاليل، والتبليغ عن الإتلاف'
  },
  lab_manager: {
    role: 'lab_manager',
    label: 'مسؤول / ملحق المخبر',
    shortLabel: 'مسؤول المخبر',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    defaultPath: '/',
    description: 'إدارة الجرد، تحضير التجارب، الصيانة، وإصدار التقارير اليومية'
  },
  economist: {
    role: 'economist',
    label: 'المقتصد / المسير المالي والمادي',
    shortLabel: 'المقتصد',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800',
    defaultPath: '/economist-portal',
    description: 'تسيير الميزانية والمشتريات، متابعة سجلات بطاقات الجرد، المستهلكات، وإسقاط التجهيزات'
  }
};

export interface StatutoryProfileInput {
  fullName: string;
  nationalId: string;
  phone: string;
  gradeCode: string;
  gradeName: string;
  corps: string;
  categoryGroup: string;
  directorate: string;
  commune: string;
  cycle: string;
  institution: string;
  subject?: string;
  levels?: string[];
  labSpecialty?: string;
}

interface UserRoleContextType {
  currentRole: UserRole;
  userProfile: UserProfileData | null;
  teacherProfile: Teacher | null;
  roleConfig: RoleInfo;
  setRole: (role: UserRole, teacher?: Teacher | null, profile?: UserProfileData | null) => void;
  setUserProfile: (profile: UserProfileData | null) => void;
  setTeacherLogin: (teacher: Teacher) => void;
  syncUserRoleFromAuth: (uid: string, userEmail?: string | null) => Promise<UserRole>;
  logoutRole: () => void;
  needsStatutorySetup: boolean;
  setNeedsStatutorySetup: (needed: boolean) => void;
  isStatutoryModalOpen: boolean;
  setIsStatutoryModalOpen: (open: boolean) => void;
  completeStatutoryProfile: (input: StatutoryProfileInput) => Promise<UserRole>;
  isDirector: boolean;
  isCensor: boolean;
  isTeacher: boolean;
  isLabManager: boolean;
  isEconomist: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('current_app_role');
      if (saved && ['director', 'censor', 'teacher', 'lab_manager', 'economist'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {
      // Fallback
    }
    return 'lab_manager';
  });

  const [userProfile, setUserProfileState] = useState<UserProfileData | null>(() => {
    try {
      const saved = localStorage.getItem('current_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(() => {
    try {
      const saved = localStorage.getItem('current_teacher_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem('current_app_role', currentRole);
    } catch (e) {
      console.warn('Could not save current_app_role to localStorage', e);
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem('current_user_profile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('current_user_profile');
      }
    } catch (e) {
      console.warn('Could not save current_user_profile to localStorage', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      if (teacherProfile) {
        localStorage.setItem('current_teacher_profile', JSON.stringify(teacherProfile));
      } else {
        localStorage.removeItem('current_teacher_profile');
      }
    } catch (e) {
      console.warn('Could not save current_teacher_profile to localStorage', e);
    }
  }, [teacherProfile]);

  const setUserProfile = (profile: UserProfileData | null) => {
    setUserProfileState(profile);
    try {
      if (profile) {
        localStorage.setItem('current_user_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('current_user_profile');
      }
    } catch {}
  };

  const setRole = (role: UserRole, teacher?: Teacher | null, profile?: UserProfileData | null) => {
    setCurrentRole(role);
    if (role === 'teacher' && teacher) {
      setTeacherProfile(teacher);
    } else if (role !== 'teacher') {
      setTeacherProfile(null);
    }
    if (profile !== undefined) {
      setUserProfile(profile);
    }
    try {
      localStorage.setItem('current_app_role', role);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('role_changed'));
      }
    } catch {}
  };

  const setTeacherLogin = (teacher: Teacher) => {
    setCurrentRole('teacher');
    setTeacherProfile(teacher);
    try {
      localStorage.setItem('current_app_role', 'teacher');
      localStorage.setItem('current_teacher_profile', JSON.stringify(teacher));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('role_changed'));
      }
    } catch {}
  };

  const [needsStatutorySetup, setNeedsStatutorySetup] = useState(false);
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);

  const completeStatutoryProfile = async (input: StatutoryProfileInput): Promise<UserRole> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    const uid = currentUser.uid;

    const officialGrade = findGradeByCodeOrName(input.gradeCode) || findGradeByCodeOrName(input.gradeName);
    const resolvedRole: UserRole = officialGrade ? getWorkspaceRoleForGrade(officialGrade) : 'lab_manager';

    const cleanWilaya = input.directorate.replace('مديرية التربية لولاية ', '').trim();
    const wilayaNum = input.directorate.slice(0, 2) || '16';
    const formattedWilaya = `${wilayaNum} - ${cleanWilaya}`;
    const eduLevel = input.cycle === 'متوسط' ? 'CEM' : (input.cycle === 'ثانوي' ? 'Lycée' : 'Autre');

    let assignedSchoolId: string;
    if (resolvedRole === 'director') {
      const { saveOrUpdateRegisteredSchool } = await import('../services/schoolLinkingService');
      const regSchool = await saveOrUpdateRegisteredSchool({
        name: input.institution,
        wilaya: formattedWilaya,
        commune: input.commune,
        directorate: input.directorate,
        educationLevel: eduLevel,
        academicYear: '2025/2026',
        directorUid: uid,
        directorName: input.fullName,
        directorEmail: currentUser.email || '',
        phone: input.phone
      });
      assignedSchoolId = regSchool.id;
    } else {
      const { linkStaffMemberToSchool } = await import('../services/schoolLinkingService');
      assignedSchoolId = await linkStaffMemberToSchool(
        uid,
        input.institution,
        formattedWilaya,
        resolvedRole
      );
    }

    const updatedProfile: UserProfileData = {
      uid,
      name: input.fullName,
      email: currentUser.email || '',
      role: resolvedRole,
      nationalId: input.nationalId,
      institution: input.institution,
      wilaya: formattedWilaya,
      commune: input.commune,
      directorate: input.directorate,
      educationLevel: eduLevel,
      phone: input.phone,
      subject: resolvedRole === 'teacher' ? input.subject : undefined,
      grade: officialGrade?.name || input.gradeName,
      gradeCode: officialGrade?.code || input.gradeCode,
      corps: officialGrade?.corps || input.corps,
      categoryGroup: officialGrade?.categoryGroup || input.categoryGroup,
      levels: resolvedRole === 'teacher' ? input.levels : undefined,
      status: 'active'
    };

    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', uid), {
      ...updatedProfile,
      schoolId: assignedSchoolId,
      roleTitle: ROLE_CONFIGS[resolvedRole].label,
      statutoryCategory: officialGrade?.categoryGroup || input.categoryGroup,
      corps: officialGrade?.corps || input.corps,
      decreeNumber: '25-54',
      isExtinction: Boolean(officialGrade?.isExtinction),
      hasCompletedSchoolSetup: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    let teacherObject: Teacher | null = null;
    if (resolvedRole === 'teacher') {
      teacherObject = {
        id: uid,
        name: input.fullName,
        email: currentUser.email || '',
        phone: input.phone,
        subject: input.subject || 'العلوم الفيزيائية والتكنولوجيا',
        levels: input.levels || [],
        grade: officialGrade?.name || input.gradeName,
        functionalCode: input.nationalId || uid,
        status: 'active'
      };
      try {
        await setDoc(doc(db, 'schools', assignedSchoolId, 'teachers', uid), {
          ...teacherObject,
          updatedAt: serverTimestamp()
        }, { merge: true });
        await setDoc(doc(db, 'teachers', uid), {
          ...teacherObject,
          schoolId: assignedSchoolId,
          institution: input.institution,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Teacher write warning:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('algeria_lab_school_id', assignedSchoolId);
      localStorage.setItem('algeria_lab_school_name', input.institution);
      localStorage.setItem('algeria_lab_directorate', input.directorate);
      localStorage.setItem('algeria_lab_commune', input.commune);
      localStorage.setItem('algeria_lab_grade_code', officialGrade?.code || input.gradeCode);
      localStorage.setItem('algeria_lab_grade_name', officialGrade?.name || input.gradeName);
      localStorage.setItem('algeria_lab_corps', officialGrade?.corps || input.corps);
      localStorage.setItem('algeria_lab_category', officialGrade?.categoryGroup || input.categoryGroup);
      window.dispatchEvent(new Event('school_changed'));
    }

    setRole(resolvedRole, teacherObject, updatedProfile);
    setIsStatutoryModalOpen(false);
    setNeedsStatutorySetup(false);
    return resolvedRole;
  };

  const syncUserRoleFromAuth = async (uid: string, userEmail?: string | null): Promise<UserRole> => {
    try {
      const email = (userEmail || auth.currentUser?.email || '').trim().toLowerCase();

      // 1. Direct fetch from users/{uid}
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      let data: any = userSnap.exists() ? userSnap.data() : null;

      // 2. Fallback: Search by email in users collection if not found by UID
      if (!data && email) {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const q = query(collection(db, 'users'), where('email', '==', email));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            data = querySnap.docs[0].data();
          }
        } catch (e) {
          console.warn('Could not query users by email:', e);
        }
      }

      // 3. Fallback: Check teachers collection by email or UID
      let teacherDocData: any = null;
      let isTeacher = false;
      try {
        const tSnap = await getDoc(doc(db, 'teachers', uid));
        if (tSnap.exists()) {
          teacherDocData = tSnap.data();
          isTeacher = true;
        } else if (email) {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const tQ = query(collection(db, 'teachers'), where('email', '==', email));
          const tQuerySnap = await getDocs(tQ);
          if (!tQuerySnap.empty) {
            teacherDocData = tQuerySnap.docs[0].data();
            isTeacher = true;
          }
        }
      } catch (e) {
        console.warn('Teacher lookup error:', e);
      }

      // Extract official grade from document data
      const gradeIdentifier = data?.gradeCode || data?.grade || teacherDocData?.rank;
      const officialGrade = gradeIdentifier ? findGradeByCodeOrName(gradeIdentifier) : undefined;

      // Determine role strictly according to statutory grade & official role
      let role: UserRole = 'lab_manager';
      if (officialGrade) {
        role = getWorkspaceRoleForGrade(officialGrade);
      } else if (data?.role) {
        const rawRole = (data.role || '').toLowerCase();
        if (['director', 'censor', 'teacher', 'lab_manager', 'economist'].includes(rawRole)) {
          role = rawRole as UserRole;
        } else if (rawRole === 'admin' || rawRole === 'administrator') {
          role = 'director';
        }
      } else if (isTeacher) {
        role = 'teacher';
      }

      // Check if existing user has all required statutory information to determine workspace
      const hasAllRequiredInfo = Boolean(
        (officialGrade || data?.grade) && 
        (data?.institution || data?.schoolId || teacherDocData?.institution)
      );

      if (!hasAllRequiredInfo) {
        setNeedsStatutorySetup(true);
        setIsStatutoryModalOpen(true);
      } else {
        setNeedsStatutorySetup(false);
      }

      const profile: UserProfileData = {
        uid,
        name: data?.name || data?.displayName || teacherDocData?.name || (email ? email.split('@')[0] : 'موظف'),
        email: email || data?.email || '',
        role: role,
        nationalId: data?.nationalId || teacherDocData?.functionalCode || '',
        institution: data?.institution || data?.schoolName || teacherDocData?.institution || '',
        wilaya: data?.wilaya || '',
        commune: data?.commune || '',
        directorate: data?.directorate || '',
        educationLevel: data?.educationLevel || '',
        phone: data?.phone || '',
        subject: data?.subject || teacherDocData?.subject || '',
        grade: officialGrade?.name || data?.grade || teacherDocData?.rank || '',
        gradeCode: officialGrade?.code || data?.gradeCode || '',
        corps: officialGrade?.corps || data?.corps || '',
        categoryGroup: officialGrade?.categoryGroup || data?.statutoryCategory || '',
        levels: data?.levels || teacherDocData?.levels || [],
        status: 'active'
      };

      let teacherObj: Teacher | null = null;
      if (role === 'teacher') {
        teacherObj = teacherDocData ? ({ id: uid, ...teacherDocData } as Teacher) : {
          id: uid,
          name: profile.name,
          firstName: profile.name.split(' ')[0] || '',
          lastName: profile.name.split(' ').slice(1).join(' ') || '',
          functionalCode: profile.nationalId || uid,
          subject: profile.subject || 'العلوم التجريبية',
          rank: profile.grade || 'أستاذ التعليم الثانوي',
          email: profile.email,
          levels: profile.levels || [],
          birthDate: '',
          grade: '01',
          effectiveDate: ''
        };
      }

      setRole(role, teacherObj, profile);
      return role;
    } catch (err) {
      console.warn('Could not sync user role from Firestore:', err);
    }
    return currentRole;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncUserRoleFromAuth(user.uid, user.email);
      }
    });
    return () => unsub();
  }, []);

  const logoutRole = () => {
    setCurrentRole('lab_manager');
    setTeacherProfile(null);
    setUserProfile(null);
    setNeedsStatutorySetup(false);
    setIsStatutoryModalOpen(false);
    try {
      localStorage.removeItem('current_app_role');
      localStorage.removeItem('current_teacher_profile');
      localStorage.removeItem('current_user_profile');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('role_changed'));
      }
    } catch {}
  };

  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.lab_manager;

  return (
    <UserRoleContext.Provider
      value={{
        currentRole,
        userProfile,
        teacherProfile,
        roleConfig,
        setRole,
        setUserProfile,
        setTeacherLogin,
        syncUserRoleFromAuth,
        logoutRole,
        needsStatutorySetup,
        setNeedsStatutorySetup,
        isStatutoryModalOpen,
        setIsStatutoryModalOpen,
        completeStatutoryProfile,
        isDirector: currentRole === 'director',
        isCensor: currentRole === 'censor',
        isTeacher: currentRole === 'teacher',
        isLabManager: currentRole === 'lab_manager',
        isEconomist: currentRole === 'economist'
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
