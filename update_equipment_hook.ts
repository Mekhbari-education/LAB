import fs from 'fs';

const file = 'src/hooks/useEquipmentLogic.tsx';
let code = fs.readFileSync(file, 'utf-8');

// Use SQL hook instead of Firestore hook
code = code.replace(
  /import { useFirestoreCollection } from '\.\.\/hooks\/useFirestoreCollection';/,
  `import { useSqlCollection } from '../hooks/useSqlCollection';`
);

code = code.replace(
  /const { data: equipmentList, loading: equipmentLoading, error } = useFirestoreCollection\([\s\S]*?\[schoolId\]\n\s*\);/,
  `const { data: equipmentList, loading: equipmentLoading, error } = useSqlCollection<Equipment>('equipment', '/api/db/equipment');`
);

// Replace addDoc
code = code.replace(
  /const docRef = await addDoc\(getUserCollection\(schoolId, 'equipment'\), \{\s*\.\.\.newEquipment,\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const { createEquipment } = await import('../lib/api/equipment');
        const docRef = await createEquipment({
          ...newEquipment,
          id: Math.random().toString(36).substr(2, 9),
        } as Equipment);`
);

// Replace deleteDoc
code = code.replace(
  /await deleteDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), id\)\);/g,
  `const { deleteEquipment } = await import('../lib/api/equipment');
      await deleteEquipment(id);`
);

// Replace updateDoc
code = code.replace(
  /await updateDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), editingEquipment\.id\), \{\s*\.\.\.newEquipment,\s*updatedAt: serverTimestamp\(\)\s*\}\);/g,
  `const { updateEquipment } = await import('../lib/api/equipment');
        await updateEquipment(editingEquipment.id, newEquipment as Equipment);`
);

// Replace batch update
code = code.replace(
  /const batch = writeBatch\(db\);[\s\S]*?await batch\.commit\(\);/g,
  `const { updateEquipment } = await import('../lib/api/equipment');
      await Promise.all(selectedIds.map(id => updateEquipment(id, updates as Equipment)));`
);

fs.writeFileSync(file, code);
