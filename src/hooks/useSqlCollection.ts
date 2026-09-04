import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';

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
        // Attempt offline cache retrieval if network failed
        const cached = localStorage.getItem(`offline_cache_${key}`);
        if (cached) {
          try {
            return JSON.parse(cached) as T[];
          } catch (parseErr) {
            // Ignore parse error
          }
        }
        throw err;
      }
    },
    // Keep cached data indefinitely while offline
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (!navigator.onLine) return false;
      return failureCount < 2;
    }
  });

  // If query errored or is loading but cache is available, fallback gracefully
  let finalData = data;
  if (!finalData) {
    try {
      const cached = localStorage.getItem(`offline_cache_${key}`);
      if (cached) {
        finalData = JSON.parse(cached);
      }
    } catch (e) {
      // Ignore
    }
  }

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


