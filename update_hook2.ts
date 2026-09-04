import fs from 'fs';

const file = 'src/hooks/useChemicalsLogic.tsx';
let code = fs.readFileSync(file, 'utf-8');

// The first replacement didn't catch updateDoc properly due to exact string mismatch. Let's do it cleaner.
code = code.replace(
  /await updateDoc\(doc\(getUserCollection\(schoolId, 'chemicals'\), editingChemical\.id\), \{[^}]+\}\);/g,
  `const { updateChemical } = await import('../lib/api/chemicals');
        await updateChemical(editingChemical.id, newChemical as Chemical);`
);

code = code.replace(
  /const batch = writeBatch\(db\);[\s\S]*?await batch\.commit\(\);/g,
  `const { updateChemical } = await import('../lib/api/chemicals');
      await Promise.all(selectedIds.map(id => updateChemical(id, updates as Chemical)));`
);

fs.writeFileSync(file, code);
