import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { auth, getUserCollection } from '../firebase';
import { getDocs } from 'firebase/firestore';

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
    queryKey: [key],
    queryFn: async () => {
      try {
        const result = await fetchWithAuth(endpoint);
        if (Array.isArray(result)) {
          try {
            localStorage.setItem(`offline_cache_${key}`, JSON.stringify(result));
          } catch (e) {
            // LocalStorage quota or unavailable, ignore
          }
        }
        return result;
      } catch (err) {
        // 1. If backend API failed (e.g. 404 on GitHub Pages or static host), attempt Firestore
        try {
          if (auth.currentUser) {
            const schoolId = auth.currentUser.uid;
            const colRef = getUserCollection(schoolId, key);
            const snap = await getDocs(colRef);
            if (!snap.empty) {
              const firestoreItems = snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
              try {
                localStorage.setItem(`offline_cache_${key}`, JSON.stringify(firestoreItems));
              } catch (e) {
                // Ignore quota
              }
              return firestoreItems;
            }
          }
        } catch (fsErr) {
          // Ignore Firestore error and fall through to localStorage
        }

        // 2. Attempt offline cache retrieval if network/API/Firestore failed
        const cached = localStorage.getItem(`offline_cache_${key}`);
        if (cached) {
          try {
            return JSON.parse(cached) as T[];
          } catch (parseErr) {
            // Ignore parse error
          }
        }
        // If nothing is cached and on static deployment, return empty array instead of throwing
        return [];
      }
    },
    placeholderData: () => {
      try {
        const cached = localStorage.getItem(`offline_cache_${key}`);
        return cached ? (JSON.parse(cached) as T[]) : undefined;
      } catch {
        return undefined;
      }
    },
    // Keep cached data indefinitely while offline
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


