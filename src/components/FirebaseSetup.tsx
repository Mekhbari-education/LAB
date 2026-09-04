import { useEffect } from 'react';
import { getDocs, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getUserCollection, auth } from '../firebase';
import { useSchool } from '../context/SchoolContext';

export default function FirebaseSetup({ onComplete }: { onComplete?: () => void }) {
  const { schoolId } = useSchool();

  useEffect(() => {
    let isMounted = true;
    
    const setupData = async () => {
      if (!auth.currentUser || !schoolId) {
        if (onComplete) onComplete();
        return;
      }
      
      console.log('FirebaseSetup: Starting setup for user', auth.currentUser.uid, 'at schoolId', schoolId);
      
      try {
        // 1. Bootstrap: Ensure user is a school member as 'director'
        try {
          const memberRef = doc(db, 'schools', schoolId, 'members', auth.currentUser.uid);
          const memberSnap = await getDoc(memberRef);
          
          if (!memberSnap.exists()) {
            console.log('FirebaseSetup: Bootstrapping member');
            await setDoc(memberRef, {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              role: 'director',
              displayName: auth.currentUser.phoneNumber || auth.currentUser.email?.split('@')[0] || 'Admin',
              joinedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error: any) {
          console.error('FirebaseSetup: Bootstrap member error:', error);
          // If it's a domain error, don't just log it, potentially show it if we can
          if (error.message && error.message.includes('auth/unauthorized-domain')) {
            console.error('CRITICAL: Domain not authorized in Firebase Console');
          }
        }

        // New users should start with empty lists and records as requested. 
        // We removed the code that was seeding default chemicals and equipment.

      } catch (err) {
        console.error('FirebaseSetup: Global error in setupData:', err);
      } finally {
        if (isMounted) {
          console.log('FirebaseSetup: Setup finished');
          if (onComplete) onComplete();
        }
      }
    };

    setupData();

    // Safety timeout: If setup takes longer than 8 seconds, force complete
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('FirebaseSetup: Setup timed out, forcing complete');
        if (onComplete) onComplete();
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [onComplete, schoolId]);

  return null;
}
