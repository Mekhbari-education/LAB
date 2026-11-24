import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { auth, getUserCollection } from '../firebase';
import { getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Clears offline cache entries from localStorage.
 * If userId is specified, removes only that user's cached items; otherwise removes all offline caches.
 */
export function clearOfflineCache(userId?: string) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('offline_cache_')) {
        if (!userId || k.startsWith(`offline_cache_${userId}_`)) {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // Ignore storage errors
  }
}

// Auto-purge caches when signed out to prevent cross-account data leaks
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      clearOfflineCache();
    }
  });
}

function getCacheKey(key: string): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  return `offline_cache_${user.uid}_${key}`;
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

const EMPTY_ARRAY: any[] = [];

export function useSqlCollection<T>(key: string, endpoint: string) {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data, isLoading, error, refetch } = useQuery<T[]>({
    queryKey: [key, auth.currentUser?.uid],
    queryFn: async () => {
      const cacheKey = getCacheKey(key);
      let sqlResponded = false;
      try {
        const result = await fetchWithAuth(endpoint);
        if (Array.isArray(result)) {
          sqlResponded = true;
          if (result.length > 0) {
            if (cacheKey) {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(result));
              } catch (e) {
                // LocalStorage quota or unavailable, ignore
              }
            }
            return result;
          }
        }
      } catch (err) {
        // Ignore API failure and check Firestore / cache
      }

      // Check Firestore (when SQL failed OR returned an empty array)
      let firestoreResponded = false;
      try {
        if (auth.currentUser) {
          const activeSchoolId = getActiveSchoolId() || auth.currentUser.uid;
          const colRef = getUserCollection(activeSchoolId, key);
          const snap = await getDocs(colRef);
          firestoreResponded = true;
          if (!snap.empty) {
            const firestoreItems = snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
            if (cacheKey) {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(firestoreItems));
              } catch (e) {
                // Ignore quota
              }
            }
            return firestoreItems;
          }

          // Also check UID-scoped collection if activeSchoolId differs from auth.currentUser.uid
          if (activeSchoolId !== auth.currentUser.uid) {
            const uidSnap = await getDocs(getUserCollection(auth.currentUser.uid, key));
            if (!uidSnap.empty) {
              const uidItems = uidSnap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
              if (cacheKey) {
                try {
                  localStorage.setItem(cacheKey, JSON.stringify(uidItems));
                } catch (e) {
                  // Ignore quota
                }
              }
              return uidItems;
            }
          }
        }
      } catch (fsErr) {
        // Ignore Firestore error and fall through to localStorage
      }

      // If an authoritative source (Firestore or SQL) confirmed 0 items exist,
      // sync offline cache to empty instead of resurrecting deleted items.
      if (firestoreResponded || sqlResponded) {
        if (cacheKey) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify([]));
          } catch (e) {
            // Ignore quota
          }
        }
        return [];
      }

      // Attempt offline cache retrieval only when both API and Firestore could not respond
      if (cacheKey) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as T[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          } catch (parseErr) {
            // Ignore parse error
          }
        }
      }
      return [];
    },
    placeholderData: () => {
      // Do not show stale data before confirming active authenticated account
      const cacheKey = getCacheKey(key);
      if (!cacheKey) return undefined;
      try {
        const cached = localStorage.getItem(cacheKey);
        return cached ? (JSON.parse(cached) as T[]) : undefined;
      } catch {
        return undefined;
      }
    },
    // Keep cached data for 5 minutes
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (!navigator.onLine) return false;
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('404') || msg.includes('401') || msg.includes('User not authenticated')) return false;
      return failureCount < 2;
    }
  });

  const finalData = data;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] });

  return { 
    data: (finalData ?? EMPTY_ARRAY) as T[], 
    loading: isLoading && !finalData, 
    error, 
    refetch, 
    invalidate,
    isOffline 
  };
}
