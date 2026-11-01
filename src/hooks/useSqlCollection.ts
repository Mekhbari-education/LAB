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
      try {
        const result = await fetchWithAuth(endpoint);
        if (Array.isArray(result) && cacheKey) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(result));
          } catch (e) {
            // LocalStorage quota or unavailable, ignore
          }
        }
        return result;
      } catch (err) {
        // 1. If backend API failed, attempt Firestore
        try {
          if (auth.currentUser) {
            const schoolId = auth.currentUser.uid;
            const colRef = getUserCollection(schoolId, key);
            const snap = await getDocs(colRef);
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
          }
        } catch (fsErr) {
          // Ignore Firestore error and fall through to localStorage
        }

        // 2. Attempt offline cache retrieval only for this authenticated account
        if (cacheKey) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              return JSON.parse(cached) as T[];
            } catch (parseErr) {
              // Ignore parse error
            }
          }
        }
        return [];
      }
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
    data: finalData || [], 
    loading: isLoading && !finalData, 
    error, 
    refetch, 
    invalidate,
    isOffline 
  };
}
