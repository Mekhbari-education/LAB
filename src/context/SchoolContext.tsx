import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '../services/loggingService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SchoolContextType {
  schoolId: string;
  setSchoolId: (id: string) => void;
  schoolName: string;
  directorate: string;
  commune: string;
  address: string;
  jobTitle: string;
  loading: boolean;
}

const DEFAULT_SCHOOL_ID = 'school_001';
const SCHOOL_ID_KEY = 'algeria_lab_school_id';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [schoolId, setSchoolIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SCHOOL_ID_KEY) || DEFAULT_SCHOOL_ID;
    }
    return DEFAULT_SCHOOL_ID;
  });

  const [schoolName, setSchoolName] = useState('ثانوية عامة');
  const [directorate, setDirectorate] = useState('مديرية التربية');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [jobTitle, setJobTitle] = useState('ملحق بالمخابر');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSchoolIdState(user.uid);
        
        // Fetch school details from settings
        try {
          const { db } = await import('../firebase');
          const { doc, onSnapshot } = await import('firebase/firestore');
          
          const unsubSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setSchoolName(data.school || 'ثانوية عامة');
              setDirectorate(data.directorate || 'مديرية التربية');
              setCommune(data.commune || '');
              setAddress(data.address || '');
              setJobTitle(data.jobTitle || 'ملحق بالمخابر');
            }
            setLoading(false);
          }, () => {
            setLoading(false);
          });
          
          return () => unsubSettings();
        } catch (err) {
          logger.error("Error setting up settings listener:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(SCHOOL_ID_KEY, schoolId);
  }, [schoolId]);

  const setSchoolId = (id: string) => {
    setSchoolIdState(id);
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
      loading
    }}>
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-primary font-bold">جاري تحميل البيانات...</div>
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
