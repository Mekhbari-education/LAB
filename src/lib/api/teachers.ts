import { fetchWithAuth } from './client';
import { Teacher } from '../../types/teachers';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function getActiveSchoolId(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('algeria_lab_school_id');
    if (stored && stored !== 'school_001' && stored.trim() !== '') {
      return stored.trim();
    }
  }
  return auth.currentUser?.uid || null;
}

function getOfflineCacheKey(): string {
  const uid = auth.currentUser?.uid;
  return uid ? `offline_cache_${uid}_teachers` : 'offline_cache_teachers';
}

function getOfflineCache(): Teacher[] {
  try {
    const raw = localStorage.getItem(getOfflineCacheKey()) ?? localStorage.getItem('offline_cache_teachers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setOfflineCache(items: Teacher[]) {
  try {
    localStorage.setItem(getOfflineCacheKey(), JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

function syncQueryCache(items: Teacher[]) {
  setOfflineCache(items);
  queryClient.setQueryData(['teachers', auth.currentUser?.uid], items);
}

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const result = await fetchWithAuth('/api/db/teachers');
    if (Array.isArray(result) && result.length > 0) {
      setOfflineCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/teachers failed, checking Firestore & cache:', err);
  }

  try {
    if (auth.currentUser) {
      const schoolId = getActiveSchoolId() || auth.currentUser.uid;
      const colRef = getUserCollection(schoolId, 'teachers');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Teacher[];
        setOfflineCache(items);
        return items;
      }
      if (schoolId !== auth.currentUser.uid) {
        const uidSnap = await getDocs(getUserCollection(auth.currentUser.uid, 'teachers'));
        if (!uidSnap.empty) {
          const items = uidSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Teacher[];
          setOfflineCache(items);
          return items;
        }
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
    id:
      data.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11))
  } as Teacher;

  let savedTeacher: Teacher = payload;

  try {
    const result = await fetchWithAuth('/api/db/teachers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (result && result.id) {
      savedTeacher = { ...payload, ...result };
    }
  } catch (apiErr) {
    console.warn('API /api/db/teachers unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  // Always mirror to Firestore for cross-module availability (e.g. DailyReport, TeacherPortal)
  try {
    if (auth.currentUser) {
      const schoolId = getActiveSchoolId() || auth.currentUser.uid;
      const docRef = doc(getUserCollection(schoolId, 'teachers'), savedTeacher.id);
      await setDoc(docRef, { ...savedTeacher, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore write error in createTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = [savedTeacher, ...existing.filter(e => e.id !== savedTeacher.id)];
  syncQueryCache(updated);
  return savedTeacher;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
  let updatedTeacher: Teacher = { id, ...data } as Teacher;

  try {
    const result = await fetchWithAuth(`/api/db/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (result && result.id) {
      updatedTeacher = { ...data, ...result, id };
    }
  } catch (apiErr) {
    console.warn(`API /api/db/teachers/${id} unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const schoolId = getActiveSchoolId() || auth.currentUser.uid;
      const docRef = doc(getUserCollection(schoolId, 'teachers'), id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore update error in updateTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = existing.map(e => (e.id === id ? { ...e, ...updatedTeacher } : e));
  syncQueryCache(updated);
  return updatedTeacher;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    await fetchWithAuth(`/api/db/teachers/${id}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn(`API /api/db/teachers/${id} DELETE unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const schoolId = getActiveSchoolId() || auth.currentUser.uid;
      const docRef = doc(getUserCollection(schoolId, 'teachers'), id);
      await deleteDoc(docRef);
    }
  } catch (fsErr) {
    console.warn('Firestore delete error in deleteTeacher:', fsErr);
  }

  const existing = getOfflineCache();
  syncQueryCache(existing.filter(e => e.id !== id));
};

export const deleteTeachersBulk = async (ids: string[]): Promise<void> => {
  if (!ids || ids.length === 0) return;
  const idSet = new Set(ids);

  try {
    await fetchWithAuth('/api/db/teachers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  } catch (apiErr) {
    console.warn('API /api/db/teachers/bulk-delete unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const schoolId = getActiveSchoolId() || currentUser.uid;
      for (let i = 0; i < ids.length; i += 400) {
        const chunk = ids.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(id => {
          const docRef = doc(getUserCollection(schoolId, 'teachers'), id);
          batch.delete(docRef);
        });
        await batch.commit();
      }
    }
  } catch (fsErr) {
    console.warn('Firestore delete error in deleteTeachersBulk:', fsErr);
  }

  const existing = getOfflineCache();
  syncQueryCache(existing.filter(e => !idSet.has(e.id)));
};

export const createTeachersBulk = async (items: Partial<Teacher>[]): Promise<Teacher[]> => {
  const formatted = items.map(item => ({
    ...item,
    firstName: item.firstName || '',
    lastName: item.lastName || '',
    name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || '',
    levels: Array.isArray(item.levels) ? item.levels : [],
    id:
      item.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11))
  })) as Teacher[];

  let finalItems: Teacher[] = formatted;

  // 1. Try SQL API in chunks of 200 (safe under MAX_BULK_ITEMS = 250)
  try {
    const apiSaved: Teacher[] = [];
    for (let i = 0; i < formatted.length; i += 200) {
      const chunk = formatted.slice(i, i + 200);
      const result = await fetchWithAuth('/api/db/teachers/bulk', {
        method: 'POST',
        body: JSON.stringify(chunk)
      });
      if (Array.isArray(result)) {
        // Merge original chunk fields (like phone) with returned DB fields
        const resultMap = new Map(result.map((r: any) => [r.id, r]));
        chunk.forEach(orig => {
          const dbRow = resultMap.get(orig.id);
          apiSaved.push(dbRow ? { ...orig, ...dbRow } : orig);
        });
      }
    }
    if (apiSaved.length > 0) {
      finalItems = apiSaved;
    }
  } catch (apiErr) {
    console.warn('API /api/db/teachers/bulk unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  // 2. Always mirror to Firestore in chunks of 400
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const schoolId = getActiveSchoolId() || currentUser.uid;
      for (let i = 0; i < finalItems.length; i += 400) {
        const chunk = finalItems.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'teachers'), item.id);
          batch.set(
            docRef,
            {
              ...item,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            },
            { merge: true }
          );
        });
        await batch.commit();
      }
    }
  } catch (fsErr) {
    console.warn('Firestore write error in createTeachersBulk:', fsErr);
  }

  // 3. Persist merged list in offline cache & React Query cache directly
  const existing = getOfflineCache();
  const existingMap = new Map(existing.map(e => [e.id, e]));
  finalItems.forEach(f => existingMap.set(f.id, f));
  const merged = Array.from(existingMap.values());
  syncQueryCache(merged);

  return finalItems;
};
