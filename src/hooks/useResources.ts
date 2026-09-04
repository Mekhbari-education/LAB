import { useState, useEffect } from 'react';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, getUserCollection, handleFirestoreError, OperationType } from '../firebase';
import { useSchool } from '../context/SchoolContext';

export interface ResourceItem {
  id: string;
  name: string;
  type: 'equipment' | 'chemical';
  category?: string;
  unit?: string;
}

export function useResources() {
  const { schoolId } = useSchool();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const equipmentRef = getUserCollection(schoolId, 'equipment');
    const chemicalsRef = getUserCollection(schoolId, 'chemicals');

    const unsubEquipment = onSnapshot(query(equipmentRef, orderBy('name')), (snapshot) => {
      const equipItems = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        type: 'equipment' as const,
        category: doc.data().type
      }));
      
      setResources(prev => {
        const others = prev.filter(p => p.type !== 'equipment');
        return [...others, ...equipItems].sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'equipment');
    });

    const unsubChemicals = onSnapshot(query(chemicalsRef, orderBy('name')), (snapshot) => {
      const chemItems = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        type: 'chemical' as const,
        category: doc.data().category,
        unit: doc.data().unit
      }));

      setResources(prev => {
        const others = prev.filter(p => p.type !== 'chemical');
        return [...others, ...chemItems].sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chemicals');
    });

    return () => {
      unsubEquipment();
      unsubChemicals();
    };
  }, []);

  return { resources, isLoading };
}
