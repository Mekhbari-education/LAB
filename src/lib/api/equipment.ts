import { fetchWithAuth } from './client';
import { Equipment } from '../../types/equipment';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function getOfflineCache(): Equipment[] {
  try {
    const raw = localStorage.getItem('offline_cache_equipment');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setOfflineCache(items: Equipment[]) {
  try {
    localStorage.setItem('offline_cache_equipment', JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const result = await fetchWithAuth('/api/db/equipment');
    if (Array.isArray(result)) {
      setOfflineCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/equipment failed, checking Firestore & cache:', err);
  }

  // Fallback to Firestore
  try {
    if (auth.currentUser) {
      const colRef = getUserCollection(auth.currentUser.uid, 'equipment');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Equipment[];
        setOfflineCache(items);
        return items;
      }
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in getEquipment:', fsErr);
  }

  return getOfflineCache();
};

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  } as Equipment;

  try {
    const result = await fetchWithAuth('/api/db/equipment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    const existing = getOfflineCache();
    const updated = [result, ...existing.filter(e => e.id !== result.id)];
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/equipment unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  // Fallback to Firestore
  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'equipment'), payload.id);
      await setDoc(docRef, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback error in createEquipment:', fsErr);
  }

  // Fallback to LocalStorage & QueryClient
  const existing = getOfflineCache();
  const updated = [payload, ...existing.filter(e => e.id !== payload.id)];
  setOfflineCache(updated);
  queryClient.setQueryData(['equipment'], updated);
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return payload;
};

export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
  try {
    const result = await fetchWithAuth(`/api/db/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    const existing = getOfflineCache();
    const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
    setOfflineCache(updated);
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/equipment/${id} unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  // Fallback to Firestore
  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'equipment'), id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore fallback update error in updateEquipment:', fsErr);
  }

  // Fallback to LocalStorage & QueryClient
  const existing = getOfflineCache();
  const updated = existing.map(e => e.id === id ? { ...e, ...data } : e);
  setOfflineCache(updated);
  queryClient.setQueryData(['equipment'], updated);
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return { id, ...data } as Equipment;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const result = await fetchWithAuth(`/api/db/equipment/${id}`, {
      method: 'DELETE'
    });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    const existing = getOfflineCache();
    setOfflineCache(existing.filter(e => e.id !== id));
    return result;
  } catch (apiErr) {
    console.warn(`API /api/db/equipment/${id} DELETE unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  // Fallback to Firestore
  try {
    if (auth.currentUser) {
      const docRef = doc(getUserCollection(auth.currentUser.uid, 'equipment'), id);
      await deleteDoc(docRef);
    }
  } catch (fsErr) {
    console.warn('Firestore fallback delete error in deleteEquipment:', fsErr);
  }

  // Fallback to LocalStorage & QueryClient
  const existing = getOfflineCache();
  const updated = existing.filter(e => e.id !== id);
  setOfflineCache(updated);
  queryClient.setQueryData(['equipment'], updated);
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
};

export const createEquipmentBulk = async (items: Partial<Equipment>[]): Promise<Equipment[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  })) as Equipment[];

  try {
    const result = await fetchWithAuth('/api/db/equipment/bulk', {
      method: 'POST',
      body: JSON.stringify(formatted)
    });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    const existing = getOfflineCache();
    const existingMap = new Map(existing.map(e => [e.id, e]));
    formatted.forEach(f => existingMap.set(f.id, f));
    setOfflineCache(Array.from(existingMap.values()));
    return result;
  } catch (apiErr) {
    console.warn('API /api/db/equipment/bulk unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  // Fallback 1: Firestore chunked batch write (max 400 per batch)
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const schoolId = currentUser.uid;
      for (let i = 0; i < formatted.length; i += 400) {
        const chunk = formatted.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'equipment'), item.id);
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
    console.warn('Firestore fallback write error in createEquipmentBulk:', fsErr);
  }

  // Fallback 2: LocalStorage cache & QueryClient update
  const existing = getOfflineCache();
  const existingMap = new Map(existing.map(e => [e.id, e]));
  formatted.forEach(f => existingMap.set(f.id, f));
  const merged = Array.from(existingMap.values());
  setOfflineCache(merged);

  queryClient.setQueryData(['equipment'], merged);
  queryClient.invalidateQueries({ queryKey: ['equipment'] });

  return formatted;
};

