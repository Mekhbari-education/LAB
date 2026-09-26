import { useState, useRef, useCallback, useEffect, useTransition } from 'react';
import { logger } from '../services/loggingService';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

/**
 * A hook to fetch a Firestore collection and cache it so that multiple 
 * instances don't unnecessarily re-fetch data.
 * Useful for large static lists like Chemicals or Equipment
 */
export function useFirestoreCollection<T = DocumentData>(
  query: Query<DocumentData>,
  transformFn: (doc: DocumentData) => T,
  dependencies: any[] = []
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const transformFnRef = useRef(transformFn);
  transformFnRef.current = transformFn;

  useEffect(() => {
    setLoading(true);
    let mounted = true;

    unsubscribeRef.current = onSnapshot(
      query,
      (snapshot) => {
        if (!mounted) return;
        
        startTransition(() => {
          const items = snapshot.docs.map(docSnap => transformFnRef.current(docSnap));
          setData(items);
          setLoading(false);
        });
      },
      (err) => {
        if (!mounted) return;
        logger.error("Firestore onSnapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ...dependencies]);

  return { data, loading, error };
}
