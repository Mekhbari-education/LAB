import { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, query, where, getDocs, serverTimestamp, orderBy, onSnapshot, addDoc, limit, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { useTimeSlots } from './useTimeSlots';
import { PDFService } from '../services/pdfService';
import { ReportRow, Teacher, InstitutionSettings, SavedReport } from '../types/reports';
import { cleanSchoolName, formatSchoolWithCommune } from '../lib/utils';

export function useDailyReport() {
  const { schoolId } = useSchool();
  const navigate = useNavigate();
  const { timeSlots, loading: loadingTimeSlots } = useTimeSlots();
  const [isTimeManagerOpen, setIsTimeManagerOpen] = useState(false);
  const [pickerState, setPickerState] = useState<{ isOpen: boolean; rowId: number | null }>({
    isOpen: false,
    rowId: null
  });
  const [resourcePickerState, setResourcePickerState] = useState<{ isOpen: boolean; rowId: number | null }>({
    isOpen: false,
    rowId: null
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportNumber, setReportNumber] = useState<string>('');
  const [rows, setRows] = useState<ReportRow[]>([
    { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' },
  ]);
  const [labNotes, setLabNotes] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [institution, setInstitution] = useState<InstitutionSettings | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2b3d22';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
      setIsSignatureModalOpen(false);
    }
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!auth.currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch Institution Settings
        const settingsRef = doc(db, 'settings', auth.currentUser.uid);
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          
          let directorateName = data.directorateName || data.directorate || '';
          let schoolName = data.schoolName || data.school || '';

          // Resolve names from SCHOOL_DB if they are codes
          if (!data.directorateName && data.directorate) {
            try {
              const { SCHOOL_DB } = await import('../data/schools');
              const dirData = (SCHOOL_DB as any)[data.directorate];
              if (dirData) {
                directorateName = dirData.name;
                
                if (data.commune && data.cycle && data.school) {
                  const commune = dirData.communes[data.commune];
                  if (commune) {
                    const school = commune.cycles[data.cycle]?.find((s: any) => s.code === data.school);
                    if (school) {
                      schoolName = `${school.name} - ${commune.name}`;
                    }
                  }
                }
              }
            } catch (err) {
              console.error('Error fetching school lookup data:', err);
            }
          }

          const communeName = data.communeName || data.commune || '';
          setInstitution({
            directorate: directorateName,
            school: formatSchoolWithCommune(cleanSchoolName(schoolName), communeName),
            commune: communeName,
            address: data.address || '',
            jobTitle: data.jobTitle || 'ملحق مخبري'
          });
        }

        // Fetch Report for current date if exists
        await fetchReportForDate(date);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const q = query(getUserCollection(schoolId, 'teachers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        subject: doc.data().subject,
        rank: doc.data().rank
      } as Teacher));
      setTeachers(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teachers');
    });
    return () => unsubscribe();
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === 'history' && auth.currentUser && schoolId) {
      setIsLoadingHistory(true);
      const q = query(
        getUserCollection(schoolId, 'daily_reports'),
        where('createdBy', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedReport[];
        setHistory(reports);
        setIsLoadingHistory(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'daily_reports');
        setIsLoadingHistory(false);
      });

      return () => unsubscribe();
    }
  }, [activeTab, schoolId]);

  const generateNextReportNumber = async () => {
    if (!auth.currentUser) return '01';
    
    try {
      const reportsRef = getUserCollection(schoolId, 'daily_reports');
      const q = query(
        reportsRef,
        where('createdBy', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return '01';
      
      const lastReport = snapshot.docs[0].data();
      const lastNumber = parseInt(lastReport.reportNumber || '0');
      const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
      return nextNumber;
    } catch (error) {
      console.error('Error generating report number:', error);
      return '01';
    }
  };

  const fetchReportForDate = async (selectedDate: string) => {
    if (!auth.currentUser) return;
    
    try {
      const reportsRef = getUserCollection(schoolId, 'daily_reports');
      const q = query(
        reportsRef, 
        where('date', '==', selectedDate), 
        where('createdBy', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const reportData = querySnapshot.docs[0].data();
        setReportNumber(reportData.reportNumber || '');
        const fetchedRows = (reportData.rows || []).map((row: any, i: number) => ({
          id: i + 1,
          teacher: row.teacher || '',
          teacherSubject: row.teacherSubject || '',
          time: row.time || '',
          class: row.class || '',
          activityType: row.activityType || '',
          activityTitle: row.activityTitle || row.activity || '',
          equipment: row.equipment || '',
          notes: row.notes || ''
        }));
        setRows(fetchedRows);
        setLabNotes(reportData.labNotes || '');
        setSupervisorNotes(reportData.supervisorNotes || '');
        setDirectorNotes(reportData.directorNotes || '');
      } else {
        // New report
        const nextNum = await generateNextReportNumber();
        setReportNumber(nextNum);
        // Reset to empty rows if no report found for this date
        setRows([
          { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' },
          { id: 2, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' },
          { id: 3, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' },
        ]);
        setLabNotes('');
        setSupervisorNotes('');
        setDirectorNotes('');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'daily_reports');
    }
  };

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    setIsLoading(true);
    await fetchReportForDate(newDate);
    setIsLoading(false);
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: keyof ReportRow, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const moveRow = (id: number, direction: 'up' | 'down') => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rows.length - 1) return;

    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    setRows(newRows);
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const reportId = `${auth.currentUser.uid}_${date}`;
      await setDoc(doc(getUserCollection(schoolId, 'daily_reports'), reportId), {
        date,
        reportNumber,
        dayName: getDayName(date),
        rows,
        labNotes,
        supervisorNotes,
        directorNotes,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'daily_reports');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser) return;
    setIsDeleting(true);
    try {
      const reportId = `${auth.currentUser.uid}_${date}`;
      await deleteDoc(doc(getUserCollection(schoolId, 'daily_reports'), reportId));
      
      // Reset state
      setRows([
        { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: '', activityTitle: '', equipment: '', notes: '' },
      ]);
      setLabNotes('');
      setSupervisorNotes('');
      setDirectorNotes('');
      setReportNumber(await generateNextReportNumber());
      setShowDeleteConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'daily_reports');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = async () => {
    await handleSave();
    window.focus();
    window.print();
  };

  const handleExportPDF = async () => {
    await handleSave();
    await PDFService.generateDailyReportPDF({
      date,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune,
        directorate: institution?.directorate,
        laboratory: 'مخبر العلوم الطبيعية والفيزيائية'
      },
      rows
    });
  };

  const handleExportWord = async () => {
    await handleSave();
    PDFService.generateDailyReportWord({
      date,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune,
        directorate: institution?.directorate,
        laboratory: 'مخبر العلوم الطبيعية والفيزيائية'
      },
      rows
    });
  };

  const loadReport = (report: SavedReport) => {
    setDate(report.date);
    setReportNumber(report.reportNumber || '');
    const fetchedRows = (report.rows || []).map((row: any, i: number) => ({
      id: i + 1,
      teacher: row.teacher || '',
      teacherSubject: row.teacherSubject || '',
      time: row.time || '',
      class: row.class || '',
      activityType: row.activityType || '',
      activityTitle: row.activityTitle || row.activity || '',
      equipment: row.equipment || '',
      notes: row.notes || ''
    }));
    setRows(fetchedRows);
    setLabNotes(report.labNotes || '');
    setSupervisorNotes(report.supervisorNotes || '');
    setDirectorNotes(report.directorNotes || '');
    setActiveTab('new');
  };

  const getDayName = (dateString: string) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date(dateString);
    return days[d.getDay()];
  };


  const deleteRow = (id: number) => {
    // Implement delete row logic
  };
  const printHistoryReport = (report: SavedReport) => {
    // Placeholder
  };
  const printBlankReport = () => {
    // Placeholder
  };
  const downloadBlankWord = () => {
    // Placeholder
  };

  return {
    schoolId,
    navigate,
    timeSlots,
    loadingTimeSlots,
    isTimeManagerOpen, setIsTimeManagerOpen,
    pickerState, setPickerState,
    resourcePickerState, setResourcePickerState,
    teachers,
    activeTab, setActiveTab,
    date, setDate: handleDateChange,
    reportNumber, setReportNumber,
    rows,
    labNotes, setLabNotes,
    supervisorNotes, setSupervisorNotes,
    directorNotes, setDirectorNotes,
    institution,
    history,
    isSaving,
    signature, setSignature,
    isSignatureModalOpen, setIsSignatureModalOpen,
    signatureCanvasRef,
    isDrawing,
    startDrawing,
    stopDrawing,
    draw,
    clearSignature,
    saveSignature,
    isDeleting, setIsDeleting,
    showDeleteConfirm, setShowDeleteConfirm,
    isLoading,
    isLoadingHistory,
    saveSuccess,
    generateNextReportNumber,
    fetchReportForDate,
    addRow,
    updateRow,
    deleteRow,
    handleSave,
    handleDelete,
    printHistoryReport,
    printBlankReport,
    downloadBlankWord,
    handleExportPDF,
    handleExportWord,
    handlePrint,
    handleDateChange,
    getDayName,
    moveRow,
    setRows,
    removeRow,
    loadReport
  };
}
