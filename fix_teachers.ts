import fs from 'fs';
const file = 'src/hooks/useTeachers.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  /await addDoc\(getUserCollection\(schoolId, 'teachers'\), \{\s*\.\.\.teacherData,\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const { createTeacher } = await import('../lib/api/teachers');
      await createTeacher({
        ...teacherData,
        id: Math.random().toString(36).substr(2, 9),
      } as Teacher);`
);

code = code.replace(
  /await updateDoc\(doc\(getUserCollection\(schoolId, 'teachers'\), id\), teacherData\);/g,
  `const { updateTeacher } = await import('../lib/api/teachers');
      await updateTeacher(id, teacherData as Teacher);`
);

fs.writeFileSync(file, code);
