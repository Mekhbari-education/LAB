import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

export const DEFAULT_TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '13:00 - 15:00',
  '15:00 - 17:00'
];

export function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const docRef = doc(db, 'settings', auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.timeSlots && Array.isArray(data.timeSlots)) {
          setTimeSlots(data.timeSlots);
        }
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/${auth.currentUser?.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveTimeSlots = async (newSlots: string[]) => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'settings', auth.currentUser.uid);
      await setDoc(docRef, { timeSlots: newSlots }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `settings/${auth.currentUser.uid}`);
    }
  };

  return { timeSlots, saveTimeSlots, loading };
}
