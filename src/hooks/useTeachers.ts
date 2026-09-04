import { useState, useEffect, useRef, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useSqlCollection } from './useSqlCollection';
import * as XLSX from 'xlsx';
import { Teacher } from '../types/teachers';
import { useVirtualizer } from '@tanstack/react-virtual';

export function useTeachers() {
  const { schoolId } = useSchool();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    functionalCode: '',
    firstName: '',
    lastName: '',
    name: '',
    birthDate: '',
    rank: '',
    subject: '',
    grade: '',
    effectiveDate: '',
    email: '',
    levels: []
  });
  const [importMessage, setImportMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    functionalCode: '',
    name: '',
    rank: '',
    subject: '',
    birthDate: ''
  });
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Teacher | null, direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Virtualization ref
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilterColumn(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'غير محدد';
    if (!dateStr.includes('-')) return dateStr; // Already formatted or unknown
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const { data: sqlTeachers, loading: sqlLoading } = useSqlCollection<Teacher>('teachers', '/api/db/teachers');

  useEffect(() => {
    if (sqlTeachers) {
      setTeachers(sqlTeachers);
      setLoading(sqlLoading);
    }
  }, [sqlTeachers, sqlLoading]);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fullName = `${newTeacher.firstName || ''} ${newTeacher.lastName || ''}`.trim() || newTeacher.name || '';
      const teacherData = {
        ...newTeacher,
        name: fullName,
      };

      if (editingTeacher) {
        const { id } = editingTeacher;
        const { updateTeacher } = await import('../lib/api/teachers');
        await updateTeacher(id, teacherData as Teacher);
      } else {
        const { createTeacher } = await import('../lib/api/teachers');
        await createTeacher(teacherData as Teacher);
      }
      setIsAddModalOpen(false);
      setEditingTeacher(null);
      setNewTeacher({
        functionalCode: '',
        firstName: '',
        lastName: '',
        name: '',
        birthDate: '',
        rank: '',
        subject: '',
        grade: '',
        effectiveDate: '',
        email: '',
        levels: []
      });
    } catch (error) {
      console.error('Failed to save teacher', error);
      alert('حدث خطأ أثناء حفظ بيانات الأستاذ');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      const { deleteTeacher } = await import('../lib/api/teachers');
      await deleteTeacher(id);
    } catch (error) {
      console.error('Failed to delete teacher', error);
      alert('حدث خطأ أثناء حذف الأستاذ');
    }
  };

  const handleXLSImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of arrays to find the header row
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        let headerRowIndex = 3; // Default to 4th row (index 3)
        
        // Search for the header row in the first 10 rows
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (row.some(cell => String(cell || '').includes('الرمز الوظيفي') || String(cell || '').includes('اللقب'))) {
            headerRowIndex = i;
            break;
          }
        }

        const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex }) as any[];

        if (data.length === 0) {
          setImportMessage({ text: 'لم يتم العثور على بيانات صالحة في الملف. يرجى التأكد من أن البيانات تبدأ من السطر الرابع.', type: 'error' });
          setIsImporting(false);
          return;
        }

        const formatDate = (val: any) => {
          if (!val) return '';
          if (val instanceof Date) {
            return val.toISOString().split('T')[0]; // YYYY-MM-DD
          }
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
             return d.toISOString().split('T')[0];
          }
          return String(val).trim();
        };

        const getVal = (item: any, keys: string[]) => {
          const itemKeys = Object.keys(item);
          for (const key of keys) {
            const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (foundKey) return item[foundKey];
          }
          return undefined;
        };

        const teachersToAdd: Partial<Teacher>[] = [];
        for (const item of data) {
          const firstName = String(getVal(item, ['الاسم', 'firstName', 'first_name']) || '').trim();
          const lastName = String(getVal(item, ['اللقب', 'lastName', 'last_name']) || '').trim();
          const fullName = String(getVal(item, ['الاسم واللقب', 'الاسم الكامل', 'name']) || `${firstName} ${lastName}`).trim();
          const functionalCode = String(getVal(item, ['الرمز الوظيفي', 'functionalCode', 'code']) || '').trim();
          const rank = String(getVal(item, ['الرتبة', 'rank']) || '').trim();
          const subject = String(getVal(item, ['المادة', 'subject']) || '').trim();
          const birthDate = formatDate(getVal(item, ['تاريخ الميلاد', 'birthDate', 'date_of_birth']));
          
          if (fullName || functionalCode) {
            teachersToAdd.push({
              functionalCode,
              firstName,
              lastName,
              name: fullName,
              rank,
              subject,
              birthDate
            });
          }
        }

        if (teachersToAdd.length > 0) {
          const { createTeachersBulk } = await import('../lib/api/teachers');
          await createTeachersBulk(teachersToAdd);
          setImportMessage({ text: `تم استيراد ${teachersToAdd.length} أستاذ بنجاح!`, type: 'success' });
        } else {
          setImportMessage({ text: 'لم يتم العثور على أساتذة صالحين للاستيراد.', type: 'error' });
        }
      } catch (error) {
        console.error('Error importing XLS:', error);
        setImportMessage({ text: 'حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.', type: 'error' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setImportMessage(null), 5000);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        
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
            name: `${parts[1] || ''} ${parts[2] || ''}`.trim(),
            birthDate: parts[3] || '',
            rank: parts[4] || '',
            subject: parts[5] || '',
          });
        }

        if (teachersToAdd.length > 0) {
          const { createTeachersBulk } = await import('../lib/api/teachers');
          await createTeachersBulk(teachersToAdd);
          setImportMessage({ text: `تم استيراد ${teachersToAdd.length} أستاذ بنجاح!`, type: 'success' });
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
  };

  const handleSort = (key: keyof Teacher) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRank = selectedRank === 'all' || t.rank === selectedRank;
      
      const matchesColumnFilters = Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const teacherValue = String((t as any)[key] || '').toLowerCase();
        return teacherValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesRank && matchesColumnFilters;
    });
  }, [teachers, searchTerm, selectedRank, columnFilters]);

  const sortedTeachers = useMemo(() => {
    const list = [...filteredTeachers];
    if (!sortConfig.key || !sortConfig.direction) return list;
    
    return list.sort((a, b) => {
      const aValue = String(a[sortConfig.key!] || '').toLowerCase();
      const bValue = String(b[sortConfig.key!] || '').toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTeachers, sortConfig]);

  const stats = {
    total: teachers.length,
    secondaryTeachers: teachers.filter(t => t.rank?.includes('ثانوي')).length,
    labStaff: teachers.filter(t => 
      t.rank?.includes('مخبر') || 
      t.rank?.includes('المخابر')
    ).length,
    ranks: teachers.reduce((acc, t) => {
      acc[t.rank] = (acc[t.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    subjects: teachers.reduce((acc, t) => {
      acc[t.subject] = (acc[t.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const uniqueRanks = Array.from(new Set(teachers.map(t => t.rank).filter(Boolean)));
  const activeFiltersCount = Object.values(columnFilters).filter(Boolean).length;

  const rowVirtualizer = useVirtualizer({
    count: sortedTeachers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  return {
    schoolId,
    teachers,
    loading,
    searchTerm, setSearchTerm,
    selectedRank, setSelectedRank,
    isAddModalOpen, setIsAddModalOpen,
    editingTeacher, setEditingTeacher,
    isImporting,
    newTeacher, setNewTeacher,
    importMessage,
    columnFilters, setColumnFilters,
    activeFilterColumn, setActiveFilterColumn,
    showFilterRow, setShowFilterRow,
    sortConfig, setSortConfig,
    fileInputRef,
    filterRef,
    parentRef,
    rowVirtualizer,
    formatDisplayDate,
    handleAddTeacher,
    handleDeleteTeacher,
    handleXLSImport,
    handleCSVImport,
    handleSort,
    filteredTeachers: sortedTeachers,
    uniqueRanks,
    activeFiltersCount,
    stats
  };
}
