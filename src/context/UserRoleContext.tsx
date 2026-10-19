import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher } from '../types/teachers';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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

      // Determine role
      let role: UserRole = 'lab_manager';
      if (data?.role) {
        const rawRole = (data.role || '').toLowerCase();
        if (['director', 'censor', 'teacher', 'lab_manager', 'economist'].includes(rawRole)) {
          role = rawRole as UserRole;
        } else if (rawRole === 'admin' || rawRole === 'administrator') {
          role = 'director';
        }
      } else if (isTeacher) {
        role = 'teacher';
      } else if (email && (email === 'faycalassoul@gmail.com' || email.toLowerCase().includes('admin'))) {
        role = 'director';
      }

      const profile: UserProfileData = {
        uid,
        name: data?.name || data?.displayName || teacherDocData?.name || (email ? email.split('@')[0] : 'موظف'),
        email: email || data?.email || '',
        role: role,
        nationalId: data?.nationalId || teacherDocData?.functionalCode || '',
        institution: data?.institution || data?.schoolName || '',
        wilaya: data?.wilaya || '',
        phone: data?.phone || '',
        subject: data?.subject || teacherDocData?.subject || '',
        grade: data?.grade || teacherDocData?.rank || '',
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
