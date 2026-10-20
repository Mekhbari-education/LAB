import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '../services/loggingService';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  findRegisteredSchool, 
  generateCanonicalSchoolId 
} from '../services/schoolLinkingService';

interface SchoolContextType {
  schoolId: string;
  setSchoolId: (id: string) => void;
  schoolName: string;
  directorate: string;
  commune: string;
  address: string;
  jobTitle: string;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  schoolLogo: string;
  setSchoolLogo: (logo: string) => void;
  educationLevel: 'CEM' | 'Lycée' | 'Autre';
  hasCompletedSchoolSetup: boolean;
  refreshSchoolData: () => Promise<void>;
  loading: boolean;
}

const DEFAULT_SCHOOL_ID = 'school_001';
const SCHOOL_ID_KEY = 'algeria_lab_school_id';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [schoolId, setSchoolIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SCHOOL_ID_KEY);
      if (stored && stored !== DEFAULT_SCHOOL_ID) return stored;
    }
    return DEFAULT_SCHOOL_ID;
  });

  const [schoolName, setSchoolName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('algeria_lab_school_name') || 'متوسطة قطاف الطاهر';
    }
    return 'متوسطة قطاف الطاهر';
  });

  const [directorate, setDirectorate] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('algeria_lab_directorate') || 'مديرية التربية لولاية بسكرة';
    }
    return 'مديرية التربية لولاية بسكرة';
  });

  const [commune, setCommune] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('algeria_lab_commune') || 'سيدي عقبة';
    }
    return 'سيدي عقبة';
  });

  const [address, setAddress] = useState('');
  const [jobTitle, setJobTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('algeria_lab_job_title') || localStorage.getItem('algeria_lab_statutory_grade');
      if (stored && !stored.includes('مدير')) return stored;
    }
    return 'ملحق بالمخابر';
  });
  const [educationLevel, setEducationLevel] = useState<'CEM' | 'Lycée' | 'Autre'>('CEM');
  const [hasCompletedSchoolSetup, setHasCompletedSchoolSetup] = useState<boolean>(true);

  const [academicYear, setAcademicYearState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('algeria_lab_academic_year') || '2025/2026';
    }
    return '2025/2026';
  });

  const [schoolLogo, setSchoolLogoState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('algeria_lab_school_logo') || '';
    }
    return '';
  });

  const [loading, setLoading] = useState(true);

  const syncStateFromData = useCallback((data: any, resolvedId?: string) => {
    if (!data) return;
    if (resolvedId && resolvedId !== schoolId) {
      setSchoolIdState(resolvedId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SCHOOL_ID_KEY, resolvedId);
      }
    }
    const sName = data.schoolName || data.name || data.school || 'متوسطة قطاف الطاهر';
    const dName = data.directorateName || data.directorate || 'مديرية التربية لولاية بسكرة';
    const aYear = data.academicYear || data.schoolYear || '2025/2026';
    const cName = data.communeName || data.commune || 'سيدي عقبة';
    const logoUrl = data.schoolLogo || data.logoUrl || data.institutionLogo || '';
    const edLevel = data.educationLevel || (sName.includes('متوسط') ? 'CEM' : 'Lycée');

    setSchoolName(sName);
    setDirectorate(dName);
    setCommune(cName);
    const jTitle = data.jobTitle || data.grade;
    if (jTitle && !jTitle.includes('مدير المؤسسة')) {
      setJobTitle(jTitle);
      if (typeof window !== 'undefined') {
        localStorage.setItem('algeria_lab_job_title', jTitle);
      }
    }
    setAcademicYearState(aYear);
    setSchoolLogoState(logoUrl);
    setEducationLevel(edLevel);

    if (data.hasCompletedSchoolSetup !== undefined) {
      setHasCompletedSchoolSetup(Boolean(data.hasCompletedSchoolSetup));
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('algeria_lab_school_name', sName);
      localStorage.setItem('algeria_lab_directorate', dName);
      localStorage.setItem('algeria_lab_academic_year', aYear);
      if (cName) localStorage.setItem('algeria_lab_commune', cName);
      if (logoUrl) {
        localStorage.setItem('algeria_lab_school_logo', logoUrl);
      } else {
        localStorage.removeItem('algeria_lab_school_logo');
      }
    }
  }, [schoolId]);

  const loadSchoolData = useCallback(async (user: any) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch user document to read schoolId or institution info
      let userData: any = null;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        userData = userSnap.exists() ? userSnap.data() : null;
      } catch (uErr) {
        console.warn('Notice reading user doc in SchoolContext:', uErr);
      }

      let targetSchoolId = userData?.schoolId;
      const userInstitution = userData?.institution || userData?.schoolName;
      const userWilaya = userData?.wilaya;
      const isDirector = userData?.role === 'director' || user.email?.includes('cemguettaftaher') || user.email === 'faycalassoul@gmail.com';

      // 2. If schoolId is not set or equals user.uid, try automatic linking by name and wilaya
      if ((!targetSchoolId || targetSchoolId === user.uid) && userInstitution && userWilaya) {
        try {
          const matched = await findRegisteredSchool(userInstitution, userWilaya);
          if (matched) {
            targetSchoolId = matched.id;
          } else {
            targetSchoolId = generateCanonicalSchoolId(userInstitution, userWilaya);
          }

          // Link the user to the shared canonical schoolId
          await setDoc(doc(db, 'users', user.uid), { schoolId: targetSchoolId }, { merge: true });
        } catch (linkErr) {
          console.warn('Could not auto-link user schoolId:', linkErr);
        }
      }

      // Fallback for Director sample cemguettaftaher@gmail.com
      if (!targetSchoolId && (user.email === 'cemguettaftaher@gmail.com' || (userInstitution && userInstitution.includes('قطاف')))) {
        targetSchoolId = generateCanonicalSchoolId('متوسطة قطاف الطاهر', '07 - بسكرة');
      }

      if (!targetSchoolId) {
        targetSchoolId = user.uid;
      }

      setSchoolIdState(targetSchoolId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SCHOOL_ID_KEY, targetSchoolId);
      }

      // Check if setup is completed for this user/school
      if (userData?.hasCompletedSchoolSetup !== undefined) {
        setHasCompletedSchoolSetup(Boolean(userData.hasCompletedSchoolSetup));
      } else if (isDirector) {
        try {
          const regSnap = await getDoc(doc(db, 'registered_schools', targetSchoolId));
          setHasCompletedSchoolSetup(regSnap.exists());
        } catch {
          setHasCompletedSchoolSetup(true);
        }
      } else {
        setHasCompletedSchoolSetup(true);
      }

      // 3. Fetch from registered_schools or settings
      let loaded = false;
      try {
        const regSnap = await getDoc(doc(db, 'registered_schools', targetSchoolId));
        if (regSnap.exists()) {
          syncStateFromData(regSnap.data(), targetSchoolId);
          loaded = true;
        }
      } catch (rErr) {
        console.warn('Notice reading registered_schools:', rErr);
      }

      if (!loaded) {
        try {
          const settingsSnap = await getDoc(doc(db, 'settings', targetSchoolId));
          if (settingsSnap.exists()) {
            syncStateFromData(settingsSnap.data(), targetSchoolId);
            loaded = true;
          }
        } catch (sErr) {
          console.warn('Notice reading settings doc:', sErr);
        }
      }

      if (!loaded) {
        try {
          const userSettingsSnap = await getDoc(doc(db, 'settings', user.uid));
          if (userSettingsSnap.exists()) {
            syncStateFromData(userSettingsSnap.data(), targetSchoolId);
          }
        } catch (usErr) {
          console.warn('Notice reading user settings doc:', usErr);
        }
      }
    } catch (err) {
      console.warn('Non-fatal notice in loadSchoolData:', err);
    } finally {
      setLoading(false);
    }
  }, [syncStateFromData]);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (user) {
        await loadSchoolData(user);

        // Listen for live changes to the active school's settings
        const activeId = localStorage.getItem(SCHOOL_ID_KEY) || user.uid;
        try {
          unsubSnapshot = onSnapshot(doc(db, 'settings', activeId), (snap) => {
            if (snap.exists()) {
              syncStateFromData(snap.data(), activeId);
            }
          }, (err) => {
            console.warn('Settings snapshot notice:', err);
          });
        } catch (e) {
          console.warn('Settings snapshot listener warning:', e);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      unsubscribe();
    };
  }, [loadSchoolData, syncStateFromData]);

  useEffect(() => {
    const handleSchoolChanged = () => {
      if (auth.currentUser) {
        loadSchoolData(auth.currentUser);
      }
    };

    window.addEventListener('school_changed', handleSchoolChanged);
    window.addEventListener('storage', handleSchoolChanged);
    return () => {
      window.removeEventListener('school_changed', handleSchoolChanged);
      window.removeEventListener('storage', handleSchoolChanged);
    };
  }, [loadSchoolData]);

  const setSchoolId = (id: string) => {
    setSchoolIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCHOOL_ID_KEY, id);
    }
  };

  const setAcademicYear = (year: string) => {
    const cleanYear = year.trim();
    setAcademicYearState(cleanYear);
    if (typeof window !== 'undefined') {
      localStorage.setItem('algeria_lab_academic_year', cleanYear);
      try {
        const storedPrint = localStorage.getItem('algeria_lab_print_settings');
        if (storedPrint) {
          const parsed = JSON.parse(storedPrint);
          if (!parsed.institution) parsed.institution = {};
          parsed.institution.academicYear = cleanYear;
          localStorage.setItem('algeria_lab_print_settings', JSON.stringify(parsed));
        }
      } catch (e) {}
      window.dispatchEvent(new Event('academic_year_changed'));
    }
  };

  const setSchoolLogo = (logoUrl: string) => {
    setSchoolLogoState(logoUrl);
    if (typeof window !== 'undefined') {
      if (logoUrl) {
        localStorage.setItem('algeria_lab_school_logo', logoUrl);
      } else {
        localStorage.removeItem('algeria_lab_school_logo');
      }
    }
  };

  const refreshSchoolData = async () => {
    if (auth.currentUser) {
      await loadSchoolData(auth.currentUser);
    }
  };

  return (
    <SchoolContext.Provider value={{ 
      schoolId, 
      setSchoolId, 
      schoolName, 
      directorate, 
      commune, 
      address, 
      jobTitle,
      academicYear,
      setAcademicYear,
      schoolLogo,
      setSchoolLogo,
      educationLevel,
      hasCompletedSchoolSetup,
      refreshSchoolData,
      loading
    }}>
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-primary font-bold">جاري تحميل بيانات المؤسسة...</div>
          </div>
        </div>
      ) : children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
