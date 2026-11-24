import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';
import { db, auth, getUserCollection } from '../../firebase';
import { writeBatch, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export type GlasswareStatus = 'جيدة' | 'مكسورة' | 'تحتاج إصلاح' | 'مفقودة';

export interface GlasswareItem {
  id: string;
  designationFr: string;
  nameAr: string;
  type: string;
  unit: string;
  quantity: number;
  status: GlasswareStatus;
  location: string;
  notes: string;
  createdAt?: any;
  updatedAt?: any;
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

/**
 * Matches useSqlCollection's primary localStorage key (`offline_cache_${uid}_glassware_inventory`).
 */
function getOfflineCacheKey(): string {
  const uid = auth.currentUser?.uid;
  if (uid) return `offline_cache_${uid}_glassware_inventory`;
  const sid = getActiveSchoolId();
  return sid ? `offline_cache_${sid}_glassware_inventory` : 'offline_cache_glassware_inventory';
}

function getAllOfflineCacheKeys(): string[] {
  const keys = new Set<string>();
  const uid = auth.currentUser?.uid;
  const sid = getActiveSchoolId();
  if (uid) keys.add(`offline_cache_${uid}_glassware_inventory`);
  if (sid) keys.add(`offline_cache_${sid}_glassware_inventory`);
  keys.add('offline_cache_glassware_inventory');
  return Array.from(keys);
}

function getOfflineCache(): GlasswareItem[] {
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

function setOfflineCache(items: GlasswareItem[]) {
  try {
    const serialized = JSON.stringify(items);
    for (const k of getAllOfflineCacheKeys()) {
      localStorage.setItem(k, serialized);
    }
  } catch (e) {
    console.warn('Could not save glassware cache to localStorage', e);
  }
}

function getExistingCachedItems(): GlasswareItem[] {
  const withUid = queryClient.getQueryData(['glassware_inventory', auth.currentUser?.uid]) as GlasswareItem[] | undefined;
  if (Array.isArray(withUid)) return withUid;
  const legacy = queryClient.getQueryData(['glassware_inventory']) as GlasswareItem[] | undefined;
  if (Array.isArray(legacy)) return legacy;
  const matched = queryClient.getQueriesData<GlasswareItem[]>({ queryKey: ['glassware_inventory'] });
  for (const [, val] of matched) {
    if (Array.isArray(val)) return val;
  }
  return getOfflineCache();
}

function syncQueryCache(items: GlasswareItem[]) {
  setOfflineCache(items);
  queryClient.setQueryData(['glassware_inventory', auth.currentUser?.uid], items);
  queryClient.setQueriesData({ queryKey: ['glassware_inventory'] }, items);
}

export const getGlassware = async (): Promise<GlasswareItem[]> => {
  try {
    const result = await fetchWithAuth('/api/db/glassware');
    if (Array.isArray(result) && result.length > 0) {
      syncQueryCache(result);
      return result;
    }
  } catch (err) {
    console.warn('API /api/db/glassware failed, checking Firestore:', err);
  }

  try {
    for (const schoolId of getTargetSchoolIds()) {
      const colRef = getUserCollection(schoolId, 'glassware_inventory');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as GlasswareItem[];
        syncQueryCache(items);
        return items;
      }
    }
    syncQueryCache([]);
    return [];
  } catch (fsErr) {
    console.warn('Firestore fallback error in getGlassware:', fsErr);
  }

  return getOfflineCache();
};

export const createGlassware = async (data: Partial<GlasswareItem>): Promise<GlasswareItem> => {
  const payload: GlasswareItem = {
    designationFr: data.designationFr || '',
    nameAr: data.nameAr || 'صنف زجاجي',
    type: data.type || 'أخرى',
    unit: data.unit || 'قطعة',
    quantity: Number(data.quantity) || 0,
    status: (data.status as GlasswareStatus) || 'جيدة',
    location: data.location || 'خزانة الزجاجيات',
    notes: data.notes || '',
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };

  let created = payload;
  try {
    const result = await fetchWithAuth('/api/db/glassware', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (result?.id) created = result;
  } catch (apiErr) {
    console.warn('API /api/db/glassware unavailable, falling back to Firestore:', apiErr);
  }

  try {
    const schoolId = getActiveSchoolId();
    if (schoolId) {
      const docRef = doc(getUserCollection(schoolId, 'glassware_inventory'), created.id);
      await setDoc(docRef, { ...created, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore mirror error in createGlassware:', fsErr);
  }

  const existing = getExistingCachedItems();
  const updated = [created, ...existing.filter(item => item.id !== created.id)];
  syncQueryCache(updated);
  return created;
};

export const createGlasswareBulk = async (items: Partial<GlasswareItem>[]): Promise<GlasswareItem[]> => {
  const formatted: GlasswareItem[] = items.map(item => ({
    designationFr: item.designationFr || '',
    nameAr: item.nameAr || 'صنف زجاجي',
    type: item.type || 'أخرى',
    unit: item.unit || 'قطعة',
    quantity: Number(item.quantity) || 0,
    status: (item.status as GlasswareStatus) || 'جيدة',
    location: item.location || 'خزانة الزجاجيات',
    notes: item.notes || '',
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  }));

  try {
    const CHUNK = 200;
    for (let i = 0; i < formatted.length; i += CHUNK) {
      const chunk = formatted.slice(i, i + CHUNK);
      await fetchWithAuth('/api/db/glassware/bulk', {
        method: 'POST',
        body: JSON.stringify(chunk)
      });
    }
  } catch (apiErr) {
    console.warn('API /api/db/glassware/bulk unavailable, using Firestore fallback:', apiErr);
  }

  try {
    const schoolId = getActiveSchoolId();
    if (schoolId) {
      for (let i = 0; i < formatted.length; i += 400) {
        const chunk = formatted.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const docRef = doc(getUserCollection(schoolId, 'glassware_inventory'), item.id);
          batch.set(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        });
        await batch.commit();
      }
    }
  } catch (fsErr) {
    console.warn('Firestore bulk write error in createGlasswareBulk:', fsErr);
  }

  const existing = getExistingCachedItems();
  const map = new Map<string, GlasswareItem>();
  existing.forEach(e => map.set(e.id, e));
  formatted.forEach(f => map.set(f.id, f));
  const merged = Array.from(map.values());
  syncQueryCache(merged);
  return formatted;
};

export const updateGlassware = async (id: string, data: Partial<GlasswareItem>): Promise<GlasswareItem> => {
  try {
    await fetchWithAuth(`/api/db/glassware/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (apiErr) {
    console.warn(`API /api/db/glassware/${id} PUT unavailable, falling back to Firestore:`, apiErr);
  }

  try {
    const schoolId = getActiveSchoolId();
    if (schoolId) {
      const docRef = doc(getUserCollection(schoolId, 'glassware_inventory'), id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Firestore mirror update error in updateGlassware:', fsErr);
  }

  const existing = getExistingCachedItems();
  const updatedList = existing.map(item => item.id === id ? { ...item, ...data } : item);
  syncQueryCache(updatedList);
  const found = updatedList.find(item => item.id === id);
  return found || ({ id, ...data } as GlasswareItem);
};

export const deleteGlassware = async (id: string): Promise<void> => {
  let apiSucceeded = false;
  let fsSucceeded = false;

  try {
    await fetchWithAuth(`/api/db/glassware/${id}`, {
      method: 'DELETE'
    });
    apiSucceeded = true;
  } catch (apiErr) {
    console.warn(`API /api/db/glassware/${id} DELETE unavailable, falling back to Firestore:`, apiErr);
  }

  try {
    const targetSchoolIds = getTargetSchoolIds();
    if (targetSchoolIds.length > 0) {
      const deletePromises = targetSchoolIds.map(schoolId => {
        const docRef = doc(getUserCollection(schoolId, 'glassware_inventory'), id);
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
    console.warn('Firestore delete error in deleteGlassware:', fsErr);
  }

  const existing = getExistingCachedItems();
  syncQueryCache(existing.filter(item => item.id !== id));

  if ((typeof navigator === 'undefined' || navigator.onLine) && !apiSucceeded && !fsSucceeded) {
    throw new Error('Failed to delete glassware item from server and Firestore.');
  }
};

export const deleteGlasswareBulk = async (ids: string[]): Promise<void> => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return;

  let apiSucceeded = false;
  let fsSucceeded = false;

  // 1. Delete from SQL via atomic bulk-delete endpoint (with fallback to individual DELETEs)
  try {
    const CHUNK_BULK = 200;
    for (let i = 0; i < uniqueIds.length; i += CHUNK_BULK) {
      const slice = uniqueIds.slice(i, i + CHUNK_BULK);
      await fetchWithAuth('/api/db/glassware/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: slice }),
      });
    }
    apiSucceeded = true;
  } catch (bulkApiErr) {
    console.warn('API /api/db/glassware/bulk-delete unavailable, trying individual DELETEs:', bulkApiErr);
    const CHUNK_API = 20;
    let allSettledOk = true;
    for (let i = 0; i < uniqueIds.length; i += CHUNK_API) {
      const slice = uniqueIds.slice(i, i + CHUNK_API);
      const results = await Promise.allSettled(
        slice.map(id =>
          fetchWithAuth(`/api/db/glassware/${id}`, {
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
            const docRef = doc(getUserCollection(schoolId, 'glassware_inventory'), id);
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
    console.warn('Firestore bulk delete error in deleteGlasswareBulk:', fsErr);
  }

  const idSet = new Set(uniqueIds);
  const existing = getExistingCachedItems();
  syncQueryCache(existing.filter(item => !idSet.has(item.id)));

  if ((typeof navigator === 'undefined' || navigator.onLine) && !apiSucceeded && !fsSucceeded) {
    throw new Error('Failed to delete selected glassware items from server and Firestore.');
  }
};
