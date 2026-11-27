import { fetchWithAuth } from './client';
import { Chemical } from '../../types/chemicals';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function stripUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

function getActiveSchoolId(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('algeria_lab_school_id');
    if (stored && stored !== 'school_001' && stored.trim() !== '') {
      return stored.trim();
    }
  }
  return auth.currentUser?.uid || null;
}

/**
 * Returns all Firestore school scopes that useSqlCollection may read from
 * (active school ID + authenticated user UID) so deletions remove copies across both.
 */
function getTargetSchoolIds(): string[] {
  const ids = new Set<string>();
  const active = getActiveSchoolId();
  if (active) ids.add(active);
  if (auth.currentUser?.uid) ids.add(auth.currentUser.uid);
  return Array.from(ids);
}

function getAllOfflineCacheKeys(): string[] {
  const keys = new Set<string>();
  const uid = auth.currentUser?.uid;
  const sid = getActiveSchoolId();
  if (uid) keys.add(`offline_cache_${uid}_chemicals`);
  if (sid) keys.add(`offline_cache_${sid}_chemicals`);
  keys.add('offline_cache_chemicals');
  return Array.from(keys);
}

function getOfflineCache(): Chemical[] {
  try {
    for (const k of getAllOfflineCacheKeys()) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function setOfflineCache(items: Chemical[]) {
  try {
    const serialized = JSON.stringify(items);
    for (const k of getAllOfflineCacheKeys()) {
      localStorage.setItem(k, serialized);
    }
  } catch (e) {
    console.warn('Could not save chemicals cache to localStorage', e);
  }
}

function getExistingCachedItems(): Chemical[] {
  const withUid = queryClient.getQueryData(['chemicals', auth.currentUser?.uid]) as Chemical[] | undefined;
  if (Array.isArray(withUid)) return withUid;
  const legacy = queryClient.getQueryData(['chemicals']) as Chemical[] | undefined;
  if (Array.isArray(legacy)) return legacy;
  const matched = queryClient.getQueriesData<Chemical[]>({ queryKey: ['chemicals'] });
  for (const [, val] of matched) {
    if (Array.isArray(val)) return val;
  }
  return getOfflineCache();
}

function syncQueryCache(items: Chemical[]) {
  setOfflineCache(items);
  queryClient.setQueryData(['chemicals', auth.currentUser?.uid], items);
  queryClient.setQueriesData({ queryKey: ['chemicals'] }, items);
}

export const getChemicals = async (): Promise<Chemical[]> => {
  try {
    const result = await fetchWithAuth('/api/db/chemicals');
    if (Array.isArray(result) && result.length > 0) {
      syncQueryCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/chemicals failed, checking Firestore & cache:', err);
  }

  try {
    for (const schoolId of getTargetSchoolIds()) {
      const colRef = getUserCollection(schoolId, 'chemicals');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Chemical[];
        syncQueryCache(items);
        return items;
      }
    }
    syncQueryCache([]);
    return [];
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

  let created: Chemical = payload;
  try {
    const result = await fetchWithAuth('/api/db/chemicals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (result?.id) created = { ...payload, ...result };
  } catch (apiErr) {
    console.warn('API /api/db/chemicals unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    const schoolId = getActiveSchoolId();
    if (schoolId) {
      const docRef = doc(getUserCollection(schoolId, 'chemicals'), created.id);
      await setDoc(docRef, { ...stripUndefined(created), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore mirror error in createChemical:', fsErr);
  }

  const existing = getExistingCachedItems();
  const updated = [created, ...existing.filter(e => e.id !== created.id)];
  syncQueryCache(updated);
  return created;
};

export const updateChemical = async (id: string, data: Partial<Chemical>): Promise<Chemical> => {
  const cleanedData = stripUndefined(data);
  let updatedItem: Chemical = { id, ...cleanedData } as Chemical;
  try {
    const result = await fetchWithAuth(`/api/db/chemicals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData)
    });
    if (result?.id) updatedItem = { ...cleanedData, ...result, id };
  } catch (apiErr) {
    console.warn(`API /api/db/chemicals/${id} unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    for (const schoolId of getTargetSchoolIds()) {
      const docRef = doc(getUserCollection(schoolId, 'chemicals'), id);
      await setDoc(docRef, { ...cleanedData, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore mirror update error in updateChemical:', fsErr);
  }

  const existing = getExistingCachedItems();
  const updated = existing.map(e => (e.id === id ? { ...e, ...updatedItem } : e));
  syncQueryCache(updated);
  return updated.find(e => e.id === id) || updatedItem;
};

export const updateChemicalsBulk = async (
  updates: { id: string; data: Partial<Chemical> }[]
): Promise<void> => {
  if (!updates || updates.length === 0) return;

  const cleanedUpdates = updates.map(u => ({
    id: u.id,
    data: stripUndefined(u.data),
  }));

  // 1. Update SQL database via PUT /api/db/chemicals/:id in controlled parallel batches
  try {
    const CHUNK_API = 10;
    for (let i = 0; i < cleanedUpdates.length; i += CHUNK_API) {
      const slice = cleanedUpdates.slice(i, i + CHUNK_API);
      await Promise.allSettled(
        slice.map(u =>
          fetchWithAuth(`/api/db/chemicals/${u.id}`, {
            method: 'PUT',
            body: JSON.stringify(u.data),
          })
        )
      );
    }
  } catch (apiErr) {
    console.warn('API bulk PUT error in updateChemicalsBulk, relying on Firestore & cache:', apiErr);
  }

  // 2. Batch update Firestore across all target school scopes
  try {
    const targetSchoolIds = getTargetSchoolIds();
    if (targetSchoolIds.length > 0) {
      for (const schoolId of targetSchoolIds) {
        for (let i = 0; i < cleanedUpdates.length; i += 400) {
          const chunk = cleanedUpdates.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(u => {
            const docRef = doc(getUserCollection(schoolId, 'chemicals'), u.id);
            batch.set(docRef, { ...u.data, updatedAt: serverTimestamp() }, { merge: true });
          });
          await batch.commit();
        }
      }
    }
  } catch (fsErr) {
    console.warn('Firestore batch update error in updateChemicalsBulk:', fsErr);
  }

  // 3. Sync React Query & localStorage cache once per bulk batch
  const updateMap = new Map(cleanedUpdates.map(u => [u.id, u.data]));
  const existing = getExistingCachedItems();
  const next = existing.map(item => {
    const patch = updateMap.get(item.id);
    return patch ? { ...item, ...patch } : item;
  });
  syncQueryCache(next);
};

export const deleteChemical = async (id: string): Promise<void> => {
  let apiSucceeded = false;
  let fsSucceeded = false;

  try {
    await fetchWithAuth(`/api/db/chemicals/${id}`, {
      method: 'DELETE'
    });
    apiSucceeded = true;
  } catch (apiErr) {
    console.warn(`API /api/db/chemicals/${id} DELETE unavailable, falling back to Firestore & localStorage:`, apiErr);
  }

  try {
    const targetSchoolIds = getTargetSchoolIds();
    if (targetSchoolIds.length > 0) {
      const deletePromises = targetSchoolIds.map(schoolId => {
        const docRef = doc(getUserCollection(schoolId, 'chemicals'), id);
        return deleteDoc(docRef);
      });
      if (typeof navigator === 'undefined' || navigator.onLine) {
        await Promise.all(deletePromises);
      } else {
        void Promise.allSettled(deletePromises);
      }
      fsSucceeded = true;
    }
  } catch (fsErr) {
    console.warn('Firestore delete error in deleteChemical:', fsErr);
  }

  const existing = getExistingCachedItems();
  syncQueryCache(existing.filter(e => e.id !== id));

  if ((typeof navigator === 'undefined' || navigator.onLine) && !apiSucceeded && !fsSucceeded) {
    throw new Error('Failed to delete chemical from server and Firestore.');
  }
};

export const deleteChemicalsBulk = async (ids: string[]): Promise<void> => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return;

  let apiSucceeded = false;
  let fsSucceeded = false;

  // 1. Delete from SQL via atomic bulk-delete endpoint (with fallback to chunked DELETEs)
  try {
    const CHUNK_BULK = 200;
    for (let i = 0; i < uniqueIds.length; i += CHUNK_BULK) {
      const slice = uniqueIds.slice(i, i + CHUNK_BULK);
      await fetchWithAuth('/api/db/chemicals/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: slice }),
      });
    }
    apiSucceeded = true;
  } catch (bulkApiErr) {
    console.warn('API /api/db/chemicals/bulk-delete unavailable, trying individual DELETEs:', bulkApiErr);
    const CHUNK_API = 20;
    let allSettledOk = true;
    for (let i = 0; i < uniqueIds.length; i += CHUNK_API) {
      const slice = uniqueIds.slice(i, i + CHUNK_API);
      const results = await Promise.allSettled(
        slice.map(id =>
          fetchWithAuth(`/api/db/chemicals/${id}`, {
            method: 'DELETE',
          })
        )
      );
      if (results.some(r => r.status === 'rejected')) {
        allSettledOk = false;
      }
    }
    apiSucceeded = allSettledOk;
  }

  // 2. Delete from Firestore across ALL matching school scopes (activeSchoolId + user UID)
  try {
    const targetSchoolIds = getTargetSchoolIds();
    if (targetSchoolIds.length > 0) {
      const commitPromises: Promise<void>[] = [];
      for (const schoolId of targetSchoolIds) {
        for (let i = 0; i < uniqueIds.length; i += 400) {
          const chunk = uniqueIds.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(id => {
            const docRef = doc(getUserCollection(schoolId, 'chemicals'), id);
            batch.delete(docRef);
          });
          commitPromises.push(batch.commit());
        }
      }
      if (typeof navigator === 'undefined' || navigator.onLine) {
        await Promise.all(commitPromises);
      } else {
        void Promise.allSettled(commitPromises);
      }
      fsSucceeded = true;
    }
  } catch (fsErr) {
    console.warn('Firestore bulk delete error in deleteChemicalsBulk:', fsErr);
  }

  const idSet = new Set(uniqueIds);
  const existing = getExistingCachedItems();
  syncQueryCache(existing.filter(item => !idSet.has(item.id)));

  if ((typeof navigator === 'undefined' || navigator.onLine) && !apiSucceeded && !fsSucceeded) {
    throw new Error('Failed to delete selected chemicals from server and Firestore.');
  }
};

export const createChemicalsBulk = async (items: Partial<Chemical>[]): Promise<Chemical[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  })) as Chemical[];

  try {
    const CHUNK = 200;
    for (let i = 0; i < formatted.length; i += CHUNK) {
      const chunk = formatted.slice(i, i + CHUNK);
      await fetchWithAuth('/api/db/chemicals/bulk', {
        method: 'POST',
        body: JSON.stringify(chunk)
      });
    }
  } catch (apiErr) {
    console.warn('API /api/db/chemicals/bulk unavailable, falling back to Firestore & localStorage:', apiErr);
  }

  try {
    const schoolId = getActiveSchoolId();
    if (schoolId) {
      for (let i = 0; i < formatted.length; i += 400) {
        const chunk = formatted.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'chemicals'), item.id);
          batch.set(docRef, {
            ...stripUndefined(item),
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

  const existing = getExistingCachedItems();
  const existingMap = new Map(existing.map(e => [e.id, e]));
  formatted.forEach(f => existingMap.set(f.id, f));
  const merged = Array.from(existingMap.values());
  syncQueryCache(merged);

  return formatted;
};
