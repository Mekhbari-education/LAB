import { fetchWithAuth } from './client';
import { Chemical } from '../../types/chemicals';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function getOfflineCache(): Chemical[] {
  try {
    const raw = localStorage.getItem('offline_cache_chemicals');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setOfflineCache(items: Chemical[]) {
  try {
    localStorage.setItem('offline_cache_chemicals', JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

export const getChemicals = async (): Promise<Chemical[]> => {
  try {
    const result = await fetchWithAuth('/api/db/chemicals');
    if (Array.isArray(result)) {
      setOfflineCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/chemicals failed, checking Firestore & cache:', err);
  }

  try {
    if (auth.currentUser) {
      const colRef = getUserCollection(auth.currentUser.uid, 'chemicals');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Chemical[];
        setOfflineCache(items);
        return items;
      }
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in getChemicals:', fsErr);
  }

  return getOfflineCache();
};

export const createChemical = async (data: Partial<Chemical>): Promise<Chemical> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  } as Chemical;

  try {
    const result = await fetchWithAuth('/api/db/chemicals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    queryClient.invalidateQueries({ queryKey: ['chemicals'] });
    const existing = getOfflineCache();
    const updated = [result, ...existing.filter(e => e.id !== result.id)];
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/chemicals unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'chemicals'), payload.id);
      await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in createChemical:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = [payload, ...existing.filter(e => e.id !== payload.id)];
  setOfflineCache(updated);
  queryClient.setQueryData(['chemicals'], updated);
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return payload;
};

export const updateChemical = async (id: string, data: Partial<Chemical>): Promise<Chemical> => {
  try {
    const result = await fetchWithAuth(`/api/db/chemicals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    queryClient.invalidateQueries({ queryKey: ['chemicals'] });
    const existing = getOfflineCache();
    const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/chemicals/${id} unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'chemicals'), id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback update error in updateChemical:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
  setOfflineCache(updated);
  queryClient.setQueryData(['chemicals'], updated);
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return { id, ...data } as Chemical;
};

export const deleteChemical = async (id: string): Promise<void> => {
  try {
    const result = await fetchWithAuth(`/api/db/chemicals/${id}`, {
      method: 'DELETE'
    });
    queryClient.invalidateQueries({ queryKey: ['chemicals'] });
    const existing = getOfflineCache();
    setOfflineCache(existing.filter(e => e.id !== id));
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/chemicals/${id} DELETE unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'chemicals'), id);
      await deleteDoc(docRef);
    }
  } catch (fsErr) {
    console.warn('Firestore fallback delete error in deleteChemical:', fsErr);
  }

  const existing = getOfflineCache();
  const updated = existing.filter(e => e.id !== id);
  setOfflineCache(updated);
  queryClient.setQueryData(['chemicals'], updated);
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
};

export const createChemicalsBulk = async (items: Partial<Chemical>[]): Promise<Chemical[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  })) as Chemical[];

  try {
    const result = await fetchWithAuth('/api/db/chemicals/bulk', {
      method: 'POST',
      body: JSON.stringify(formatted)
    });
    queryClient.invalidateQueries({ queryKey: ['chemicals'] });
    const existing = getOfflineCache();
    const existingMap = new Map(existing.map(e => [e.id, e]));
    formatted.forEach(f => existingMap.set(f.id, f));
    setOfflineCache(Array.from(existingMap.values()));
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/chemicals/bulk unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const schoolId = currentUser.uid;
      for (let i = 0; i < formatted.length; i += 400) {
        const chunk = formatted.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'chemicals'), item.id);
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
    console.warn('Firestore fallback write error in createChemicalsBulk:', fsErr);
  }

  const existing = getOfflineCache();
  const existingMap = new Map(existing.map(e => [e.id, e]));
  formatted.forEach(f => existingMap.set(f.id, f));
  const merged = Array.from(existingMap.values());
  setOfflineCache(merged);

  queryClient.setQueryData(['chemicals'], merged);
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });

  return formatted;
};

