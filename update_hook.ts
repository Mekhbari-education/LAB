import fs from 'fs';

const file = 'src/hooks/useChemicalsLogic.tsx';
let code = fs.readFileSync(file, 'utf-8');

// Replace addDoc call
code = code.replace(
  `        const docRef = await addDoc(getUserCollection(schoolId, 'chemicals'), {
          ...newChemical,
          createdAt: serverTimestamp()
        });`,
  `        const { createChemical } = await import('../lib/api/chemicals');
        const docRef = await createChemical({
          ...newChemical,
          id: Math.random().toString(36).substr(2, 9), // Generate temporary ID or use DB serial
        } as Chemical);`
);

// Replace deleteDoc call
code = code.replace(
  `      await deleteDoc(doc(getUserCollection(schoolId, 'chemicals'), id));`,
  `      const { deleteChemical } = await import('../lib/api/chemicals');
      await deleteChemical(id);`
);

// Replace updateDoc call
code = code.replace(
  `        await updateDoc(doc(getUserCollection(schoolId, 'chemicals'), editingChemical.id), {
          ...newChemical,
          updatedAt: serverTimestamp()
        });`,
  `        const { updateChemical } = await import('../lib/api/chemicals');
        await updateChemical(editingChemical.id, newChemical as Chemical);`
);

// Replace batch update
code = code.replace(
  `      const batch = writeBatch(db);

      selectedIds.forEach(id => {
        const docRef = doc(getUserCollection(schoolId, 'chemicals'), id);
        batch.update(docRef, { ...updates, updatedAt: serverTimestamp() });
      });

      await batch.commit();`,
  `      const { updateChemical } = await import('../lib/api/chemicals');
      await Promise.all(selectedIds.map(id => updateChemical(id, updates as Chemical)));`
);

fs.writeFileSync(file, code);
