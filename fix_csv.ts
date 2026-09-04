import fs from 'fs';
const file = 'src/hooks/useTeachers.ts';
let code = fs.readFileSync(file, 'utf-8');

const replacement = `  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\\n');
        
        const teachersToAdd: Partial<Teacher>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          if (parts.length < 2) continue;
          
          teachersToAdd.push({
            functionalCode: parts[0] || '',
            firstName: parts[1] || '',
            lastName: parts[2] || '',
            name: \`\${parts[1] || ''} \${parts[2] || ''}\`.trim(),
            birthDate: parts[3] || '',
            rank: parts[4] || '',
            subject: parts[5] || '',
          });
        }

        if (teachersToAdd.length > 0) {
          const { createTeacher } = await import('../lib/api/teachers');
          await Promise.all(teachersToAdd.map(t => createTeacher({ ...t, id: Math.random().toString(36).substr(2, 9) } as Teacher)));
          setImportMessage({ text: \`تم استيراد \${teachersToAdd.length} أستاذ بنجاح!\`, type: 'success' });
        } else {
          setImportMessage({ text: 'لم يتم العثور على أساتذة صالحين للاستيراد.', type: 'error' });
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        setImportMessage({ text: 'حدث خطأ أثناء استيراد الملف.', type: 'error' });
      } finally {
        setTimeout(() => setImportMessage(null), 5000);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };`;

// replace everything from `const handleCSVImport` to `reader.readAsText(file); \n    // Reset input \n    if (fileInputRef.current) fileInputRef.current.value = ''; \n  };`

code = code.replace(/const handleCSVImport = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?fileInputRef\.current\.value = '';\s*\};/g, replacement);

fs.writeFileSync(file, code);
