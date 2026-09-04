import fs from 'fs';

const file = 'src/hooks/useTeachers.ts';
let code = fs.readFileSync(file, 'utf-8');

// Use SQL hook instead of Firestore hook
code = code.replace(
  /import { useFirestoreCollection } from '\.\/useFirestoreCollection';/,
  `import { useSqlCollection } from './useSqlCollection';`
);

code = code.replace(
  /const { data: teachersList, loading: teachersLoading } = useFirestoreCollection\([\s\S]*?\[schoolId\]\n\s*\);/,
  `const { data: teachersList, loading: teachersLoading } = useSqlCollection<Teacher>('teachers', '/api/db/teachers');`
);

// Replace addDoc
code = code.replace(
  /const docRef = await addDoc\(getUserCollection\(schoolId, 'teachers'\), \{\s*\.\.\.newTeacher,\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const { createTeacher } = await import('../lib/api/teachers');
      const docRef = await createTeacher({
        ...newTeacher,
        id: Math.random().toString(36).substr(2, 9),
      } as Teacher);`
);

// Replace deleteDoc
code = code.replace(
  /await deleteDoc\(doc\(getUserCollection\(schoolId, 'teachers'\), id\)\);/g,
  `const { deleteTeacher } = await import('../lib/api/teachers');
    await deleteTeacher(id);`
);

// Replace updateDoc
code = code.replace(
  /await updateDoc\(doc\(getUserCollection\(schoolId, 'teachers'\), editingTeacher\.id\), \{\s*\.\.\.newTeacher,\s*updatedAt: serverTimestamp\(\)\s*\}\);/g,
  `const { updateTeacher } = await import('../lib/api/teachers');
      await updateTeacher(editingTeacher.id, newTeacher as Teacher);`
);

// Replace batch update
code = code.replace(
  /const batch = writeBatch\(db\);[\s\S]*?await batch\.commit\(\);/g,
  `const { createTeacher } = await import('../lib/api/teachers');
    await Promise.all(teachersToAdd.map(t => createTeacher({ ...t, id: Math.random().toString(36).substr(2, 9) } as Teacher)));`
);

fs.writeFileSync(file, code);
