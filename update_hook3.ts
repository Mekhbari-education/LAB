import fs from 'fs';

const file = 'src/hooks/useChemicalsLogic.tsx';
let code = fs.readFileSync(file, 'utf-8');

// I see updateChemical is correctly in place for batch operations, but we need to ensure update is fully correct in save
// Actually looking at the previous patch it might have replaced the wrong updateDoc inside import logic?

code = code.replace(
  /const { updateChemical } = await import\('\.\.\/lib\/api\/chemicals'\);\s*await updateChemical\(editingChemical\.id, newChemical as Chemical\);/g,
  `const { updateChemical } = await import('../lib/api/chemicals');
        await updateChemical(editingChemical.id, newChemical as Chemical);`
);

fs.writeFileSync(file, code);
