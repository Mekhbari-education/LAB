import { fetchWithAuth } from './client';
import { Teacher } from '../../types/teachers';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function getOfflineCache(): Teacher[] {
  try {
    const raw = localStorage.getItem('offline_cache_teachers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setOfflineCache(items: Teacher[]) {
  try {
    localStorage.setItem('offline_cache_teachers', JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const result = await fetchWithAuth('/api/db/teachers');
    if (Array.isArray(result)) {
      setOfflineCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/teachers failed, checking Firestore & cache:', err);
  }

  try {
    if (auth.currentUser) {
      const colRef = getUserCollection(auth.currentUser.uid, 'teachers');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Teacher[];
        setOfflineCache(items);
        return items;
      }
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in getTeachers:', fsErr);
  }

  return getOfflineCache();
};

export const createTeacher = async (data: Partial<Teacher>): Promise<Teacher> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  } as Teacher;

  try {
    const result = await fetchWithAuth('/api/db/teachers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    queryClient.invalidateQueries({ queryKey: ['teachers'] });
    const existing = getOfflineCache();
    const updated = [result, ...existing.filter(e => e.id !== result.id)];
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/teachers unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'teachers'), payload.id);
      await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in createTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = [payload, ...existing.filter(e => e.id !== payload.id)];
  setOfflineCache(updated);
  queryClient.setQueryData(['teachers'], updated);
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return payload;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
  try {
    const result = await fetchWithAuth(`/api/db/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    queryClient.invalidateQueries({ queryKey: ['teachers'] });
    const existing = getOfflineCache();
    const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/teachers/${id} unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'teachers'), id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback update error in updateTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
  setOfflineCache(updated);
  queryClient.setQueryData(['teachers'], updated);
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return { id, ...data } as Teacher;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    const result = await fetchWithAuth(`/api/db/teachers/${id}`, {
      method: 'DELETE'
    });
    queryClient.invalidateQueries({ queryKey: ['teachers'] });
    const existing = getOfflineCache();
    setOfflineCache(existing.filter(e => e.id !== id));
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/teachers/${id} DELETE unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'teachers'), id);
      await deleteDoc(docRef);
    }
  } catch (fsErr) {
    console.warn('Firestore fallback delete error in deleteTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = existing.filter(e => e.id !== id);
  setOfflineCache(updated);
  queryClient.setQueryData(['teachers'], updated);
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
};

export const createTeachersBulk = async (items: Partial<Teacher>[]): Promise<Teacher[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  })) as Teacher[];

  try {
    const result = await fetchWithAuth('/api/db/teachers/bulk', {
      method: 'POST',
      body: JSON.stringify(formatted)
    });
    queryClient.invalidateQueries({ queryKey: ['teachers'] });
    const existing = getOfflineCache();
    const existingMap = new Map(existing.map(e => [e.id, e]));
    formatted.forEach(f => existingMap.set(f.id, f));
    setOfflineCache(Array.from(existingMap.values()));
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/teachers/bulk unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const schoolId = currentUser.uid;
      for (let i = 0; i < formatted.length; i += 400) {
        const chunk = formatted.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'teachers'), item.id);
          batch.set(docRef, {
            ...item,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          }, { merge: true });
        });
        await batch.commit();
      }
    }
  } catch (fsErr) {
    console.warn('Firestore fallback write error in createTeachersBulk:', fsErr);
  }

  const existing = getOfflineCache();
  const existingMap = new Map(existing.map(e => [e.id, e]));
  formatted.forEach(f => existingMap.set(f.id, f));
  const merged = Array.from(existingMap.values());
  setOfflineCache(merged);

  queryClient.setQueryData(['teachers'], merged);
  queryClient.invalidateQueries({ queryKey: ['teachers'] });

  return formatted;
};

