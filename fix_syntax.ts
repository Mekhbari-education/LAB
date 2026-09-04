import fs from 'fs';
const file = 'src/hooks/useTeachers.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  /const \{ createTeacher \} = await import\('\.\.\/lib\/api\/teachers'\);\s*await Promise\.all\(teachersToAdd\.map\(t => createTeacher\(\{ \.\.\.t, id: Math\.random\(\)\.toString\(36\)\.substr\(2, 9\) \} as Teacher\)\)\);/g,
  `if (teachersToAdd.length > 0) {
          const { createTeacher } = await import('../lib/api/teachers');
          await Promise.all(teachersToAdd.map(t => createTeacher({ ...t, id: Math.random().toString(36).substr(2, 9) } as Teacher)));
`
);

fs.writeFileSync(file, code);
