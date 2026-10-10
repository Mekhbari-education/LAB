import { useState, useEffect, useRef, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, query, where, getDocs, serverTimestamp, orderBy, onSnapshot, deleteDoc, limit } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { useTimeSlots } from './useTimeSlots';
import { PDFService } from '../services/pdfService';
import { PrintService } from '../services/printService';
import { ReportRow, Teacher, InstitutionSettings, SavedReport, DaySummaryStats, RoutingType } from '../types/reports';
import { cleanSchoolName, formatSchoolWithCommune, formatOfficialRankTitle } from '../lib/utils';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { ExperimentPreset } from '../data/labExperimentPresets';
import * as XLSX from 'xlsx';

export function useDailyReport() {
  const { schoolId } = useSchool();
  const navigate = useNavigate();
  const { openPdfPreview } = usePdfPreview();
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
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetTargetRowId, setPresetTargetRowId] = useState<number | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportNumber, setReportNumber] = useState<string>('');

  // Routing ladder and administrative metadata
  const [docRouting, setDocRouting] = useState<RoutingType>('hierarchical_nazir');
  const [docDepartment, setDocDepartment] = useState('مخبر العلوم الفيزيائية والطبيعية');
  const [docAcademicYear, setDocAcademicYear] = useState('2026 / 2027');
  const [docLocation, setDocLocation] = useState('عين كرشة');
  const [docSender, setDocSender] = useState('الملحق الرئيس بالمخابر');
  const [docRecipient, setDocRecipient] = useState('السيد: مدير المؤسسة — تحت إشراف السيد: ناظر الدروس');
  const [docSigners, setDocSigners] = useState<string[]>([
    'الملحق الرئيس بالمخابر',
    'الناظر',
    'المدير'
  ]);

  // Special mode: Days without practical activities (يوم بدون نشاطات تطبيقية)
  const [noActivities, setNoActivities] = useState<boolean>(false);
  const [noActivitiesReason, setNoActivitiesReason] = useState<string>(
    'أعمال الصيانة الدورية وتنظيم وتصنيف عتاد المخبر وتحضير المحاليل والتجارب'
  );

  const [rows, setRows] = useState<ReportRow[]>([
    { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
    { id: 2, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
    { id: 3, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
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

  // Drawing signature helpers
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

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

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
  const [deleteTargetReportId, setDeleteTargetReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  // Routing Ladder configuration
  const handleSetRouting = (type: RoutingType, customSender?: string) => {
    setDocRouting(type);
    let recipientText = '';
    let signersList: string[] = [];

    const currentSender = customSender || docSender || 'الملحق الرئيس بالمخابر';
    const baseSender = formatOfficialRankTitle(currentSender.split('/')[0].trim());

    switch (type) {
      case 'hierarchical_nazir':
        recipientText = 'السيد: مدير المؤسسة — تحت إشراف السيد: ناظر الدروس';
        signersList = [baseSender, 'الناظر', 'مدير المؤسسة'];
        break;
      case 'hierarchical_cpe':
        recipientText = 'السيد: مدير المؤسسة — تحت إشراف السيد: المستشار الرئيسي للتربية';
        signersList = [baseSender, 'مستشار التربية', 'مدير المؤسسة'];
        break;
      case 'direct':
      default:
        recipientText = 'السيد: مدير المؤسسة (المسؤول المباشر)';
        signersList = [baseSender, 'مدير المؤسسة'];
        break;
    }

    setDocRecipient(recipientText);
    setDocSigners(signersList);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!auth.currentUser) return;
      
      setIsLoading(true);
      try {
        const settingsRef = doc(db, 'settings', auth.currentUser.uid);
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          
          let directorateName = data.directorateName || data.directorate || 'مديرية التربية لولاية أم البواقي';
          let schoolName = data.schoolName || data.school || 'متوسطة قطاف الطاهر - عين كرشة';

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

          const communeName = data.communeName || data.commune || 'عين كرشة';
          const defaultJob = formatOfficialRankTitle(data.jobTitle) || 'الملحق الرئيس بالمخابر';

          setInstitution({
            directorate: directorateName,
            school: formatSchoolWithCommune(cleanSchoolName(schoolName), communeName),
            commune: communeName,
            address: data.address || '',
            jobTitle: defaultJob
          });

          setDocLocation(communeName);
          setDocSender(defaultJob);
          setDocSigners([defaultJob, 'الناظر', 'مدير المؤسسة']);
        } else {
          setInstitution({
            directorate: 'مديرية التربية لولاية أم البواقي',
            school: 'متوسطة قطاف الطاهر - عين كرشة',
            commune: 'عين كرشة',
            address: '',
            jobTitle: 'الملحق الرئيس بالمخابر'
          });
          setDocLocation('عين كرشة');
          setDocSender('الملحق الرئيس بالمخابر');
          setDocSigners(['الملحق الرئيس بالمخابر', 'الناظر', 'مدير المؤسسة']);
        }

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

  const getDayName = (dateString: string) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date(dateString);
    return days[d.getDay()];
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
        if (reportData.routing) setDocRouting(reportData.routing);
        if (reportData.department) setDocDepartment(reportData.department);
        if (reportData.academicYear) setDocAcademicYear(reportData.academicYear);
        if (reportData.location) setDocLocation(reportData.location);
        if (reportData.sender) setDocSender(formatOfficialRankTitle(reportData.sender));
        if (reportData.recipient) setDocRecipient(reportData.recipient);
        
        // Restore signers ensuring "الناظر" format and formatted lab rank with "ال"
        if (reportData.signers) {
          const sanitizedSigners = reportData.signers.map((s: string, idx: number) => {
            if (idx === 0) return formatOfficialRankTitle(s);
            if (s.includes('تحت إشراف ناظر') || s.includes('ناظر')) return 'الناظر';
            if (s.includes('مدير المؤسسة') || s.includes('المدير')) return 'مدير المؤسسة';
            return s;
          });
          setDocSigners(sanitizedSigners);
        } else {
          handleSetRouting(reportData.routing || 'hierarchical_nazir');
        }

        // Restore noActivities mode
        if (reportData.noActivities !== undefined) {
          setNoActivities(Boolean(reportData.noActivities));
          if (reportData.noActivitiesReason) {
            setNoActivitiesReason(reportData.noActivitiesReason);
          }
        } else {
          setNoActivities(false);
        }

        const fetchedRows = (reportData.rows || []).map((row: any, i: number) => ({
          id: i + 1,
          teacher: row.teacher || '',
          teacherSubject: row.teacherSubject || '',
          time: row.time || '',
          class: row.class || '',
          activityType: row.activityType || 'عملي',
          activityTitle: row.activityTitle || row.activity || '',
          equipment: row.equipment || '',
          notes: row.notes || ''
        }));
        setRows(fetchedRows.length > 0 ? fetchedRows : [
          { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
          { id: 2, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' }
        ]);
        setLabNotes(reportData.labNotes || '');
        setSupervisorNotes(reportData.supervisorNotes || '');
        setDirectorNotes(reportData.directorNotes || '');
      } else {
        const nextNum = await generateNextReportNumber();
        setReportNumber(nextNum);
        setNoActivities(false);
        setRows([
          { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
          { id: 2, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
          { id: 3, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
        ]);
        setLabNotes('');
        setSupervisorNotes('');
        setDirectorNotes('');
        handleSetRouting(docRouting);
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

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(today);
  };

  const goToYesterday = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  const goToTomorrow = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  // Row operations
  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { 
      id: newId, 
      teacher: '', 
      teacherSubject: '', 
      time: timeSlots[0] || '', 
      class: '', 
      activityType: 'عملي', 
      activityTitle: '', 
      equipment: '', 
      notes: '' 
    }]);
  };

  const duplicateRow = (id: number) => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return;
    const target = rows[index];
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow: ReportRow = {
      ...target,
      id: newId
    };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newRow);
    setRows(newRows);
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) {
      setRows([{ id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' }]);
      return;
    }
    setRows(rows.filter(r => r.id !== id));
  };

  const deleteRow = removeRow;

  const clearAllRows = () => {
    setRows([
      { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
      { id: 2, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
      { id: 3, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
    ]);
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

  // Toggle "No practical activities" mode
  const toggleNoActivities = (enable: boolean) => {
    setNoActivities(enable);
  };

  // Copy from previous saved report
  const copyFromPreviousReport = async () => {
    if (!auth.currentUser || !schoolId) return false;
    try {
      const q = query(
        getUserCollection(schoolId, 'daily_reports'),
        where('createdBy', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      const otherDoc = snap.docs.find(d => d.data().date !== date);
      if (!otherDoc) {
        setCopySuccessMessage('لم يتم العثور على تقرير سابق لنسخه.');
        setTimeout(() => setCopySuccessMessage(null), 3500);
        return false;
      }

      const prevData = otherDoc.data();
      if (prevData.rows && prevData.rows.length > 0) {
        const copied = prevData.rows.map((r: any, i: number) => ({
          id: i + 1,
          teacher: r.teacher || '',
          teacherSubject: r.teacherSubject || '',
          time: r.time || '',
          class: r.class || '',
          activityType: r.activityType || 'عملي',
          activityTitle: r.activityTitle || r.activity || '',
          equipment: r.equipment || '',
          notes: r.notes || ''
        }));
        setRows(copied);
      }
      if (prevData.labNotes) setLabNotes(prevData.labNotes);
      if (prevData.routing) setDocRouting(prevData.routing);
      if (prevData.recipient) setDocRecipient(prevData.recipient);
      if (prevData.signers) setDocSigners(prevData.signers);
      if (prevData.department) setDocDepartment(prevData.department);
      if (prevData.academicYear) setDocAcademicYear(prevData.academicYear);
      if (prevData.location) setDocLocation(prevData.location);
      if (prevData.noActivities !== undefined) setNoActivities(Boolean(prevData.noActivities));

      setCopySuccessMessage(`تم نسخ بيانات التقرير بنجاح من تاريخ (${prevData.date})`);
      setTimeout(() => setCopySuccessMessage(null), 4000);
      return true;
    } catch (err) {
      console.error('Error copying previous report:', err);
      return false;
    }
  };

  // Experiment presets application
  const applyExperimentPreset = (rowId: number, preset: ExperimentPreset) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        activityTitle: preset.title,
        activityType: preset.activityType,
        equipment: preset.equipment,
        notes: r.notes ? `${r.notes} | ${preset.notes}` : preset.notes,
        teacherSubject: r.teacherSubject || preset.subject
      };
    }));
    setIsPresetModalOpen(false);
  };

  const addPresetAsNewRow = (preset: ExperimentPreset) => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow: ReportRow = {
      id: newId,
      teacher: '',
      teacherSubject: preset.subject,
      time: timeSlots[0] || '',
      class: '',
      activityType: preset.activityType,
      activityTitle: preset.title,
      equipment: preset.equipment,
      notes: preset.notes
    };
    setRows(prev => [...prev, newRow]);
    setIsPresetModalOpen(false);
  };

  // Notes appending helpers
  const appendLabNote = (text: string) => {
    setLabNotes(prev => prev ? `${prev}\n• ${text}` : `• ${text}`);
  };

  const appendSupervisorNote = (text: string) => {
    setSupervisorNotes(prev => prev ? `${prev}\n• ${text}` : `• ${text}`);
  };

  const appendDirectorNote = (text: string) => {
    setDirectorNotes(prev => prev ? `${prev}\n• ${text}` : `• ${text}`);
  };

  // Day summary stats
  const stats: DaySummaryStats = useMemo(() => {
    if (noActivities) {
      return {
        totalSessions: 0,
        distinctTeachersCount: 0,
        distinctClassesCount: 0,
        distinctTeachers: [],
        distinctClasses: [],
        practicalCount: 0,
        simulationCount: 0,
        exaoCount: 0,
        virtualCount: 0
      };
    }

    const validRows = rows.filter(r => (r.teacher && r.teacher.trim()) || (r.activityTitle && r.activityTitle.trim()) || (r.class && r.class.trim()));
    const teachersSet = new Set<string>();
    const classesSet = new Set<string>();
    let practical = 0;
    let simulation = 0;
    let exao = 0;
    let virtualCount = 0;

    validRows.forEach(r => {
      if (r.teacher) teachersSet.add(r.teacher);
      if (r.class) classesSet.add(r.class);
      if (r.activityType === 'عملي') practical++;
      else if (r.activityType === 'محاكاة') simulation++;
      else if (r.activityType === 'EXAO') exao++;
      else if (r.activityType === 'افتراضي') virtualCount++;
    });

    return {
      totalSessions: validRows.length,
      distinctTeachersCount: teachersSet.size,
      distinctClassesCount: classesSet.size,
      distinctTeachers: Array.from(teachersSet),
      distinctClasses: Array.from(classesSet),
      practicalCount: practical,
      simulationCount: simulation,
      exaoCount: exao,
      virtualCount
    };
  }, [rows, noActivities]);

  // Save report
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const reportId = `${auth.currentUser.uid}_${date}`;
      await setDoc(doc(getUserCollection(schoolId, 'daily_reports'), reportId), {
        date,
        reportNumber,
        dayName: getDayName(date),
        routing: docRouting,
        department: docDepartment,
        academicYear: docAcademicYear,
        location: docLocation,
        sender: docSender,
        recipient: docRecipient,
        signers: docSigners,
        noActivities,
        noActivitiesReason,
        rows: noActivities ? [] : rows,
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

  // Delete current report
  const handleDelete = async () => {
    if (!auth.currentUser) return;
    setIsDeleting(true);
    try {
      const reportId = `${auth.currentUser.uid}_${date}`;
      await deleteDoc(doc(getUserCollection(schoolId, 'daily_reports'), reportId));
      
      setRows([
        { id: 1, teacher: '', teacherSubject: '', time: '', class: '', activityType: 'عملي', activityTitle: '', equipment: '', notes: '' },
      ]);
      setNoActivities(false);
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

  // Delete specific history report
  const handleDeleteHistoryReport = async (reportId: string) => {
    if (!schoolId) return;
    try {
      await deleteDoc(doc(getUserCollection(schoolId, 'daily_reports'), reportId));
      setHistory(prev => prev.filter(h => h.id !== reportId));
      setDeleteTargetReportId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'daily_reports');
    }
  };

  // Generates pure, enhanced official HTML matching the PDF model exactly
  const generateDailyReportHtml = (options?: { 
    isBlank?: boolean; 
    overrideNoActivities?: boolean;
    reportData?: SavedReport;
  }) => {
    const isBlank = Boolean(options?.isBlank);
    const sourceReport = options?.reportData;
    const isNoAct = options?.overrideNoActivities !== undefined 
      ? options.overrideNoActivities 
      : Boolean(sourceReport ? sourceReport.noActivities : noActivities);

    const activeDate = sourceReport?.date || date;
    const activeRows = isBlank ? [] : (sourceReport?.rows || (isNoAct ? [] : rows));
    const activeDept = sourceReport?.department || docDepartment || 'مخبر العلوم الفيزيائية والطبيعية';
    const activeYear = sourceReport?.academicYear || docAcademicYear || '2026 / 2027';
    const activeLocation = sourceReport?.location || docLocation || institution?.commune || 'عين كرشة';
    const activeNum = sourceReport?.reportNumber || reportNumber || '01';
    const activeReason = sourceReport?.noActivitiesReason || noActivitiesReason || 'أعمال الصيانة الدورية وتنظيم وتصنيف عتاد المخبر وتحضير المحاليل والتجارب';

    // Strict user rule: Leave notes completely empty if not provided, never insert any default placeholder
    const rawLabNotes = isBlank ? '' : (sourceReport?.labNotes ?? labNotes);
    const rawSupervisorNotes = isBlank ? '' : (sourceReport?.supervisorNotes ?? supervisorNotes);
    const rawDirectorNotes = isBlank ? '' : (sourceReport?.directorNotes ?? directorNotes);

    const cleanLabNotes = rawLabNotes?.trim() ? rawLabNotes.trim().replace(/\n/g, '<br>') : '';
    const cleanSupervisorNotes = rawSupervisorNotes?.trim() ? rawSupervisorNotes.trim().replace(/\n/g, '<br>') : '';
    const cleanDirectorNotes = rawDirectorNotes?.trim() ? rawDirectorNotes.trim().replace(/\n/g, '<br>') : '';

    const country = 'الجمهورية الجزائرية الديمقراطية الشعبية';
    const ministry = 'وزارة التربية الوطنية';
    const directorate = institution?.directorate || 'مديرية التربية لولاية أم البواقي';
    const school = institution?.school || 'متوسطة قطاف الطاهر - عين كرشة';
    const formattedSchool = formatSchoolWithCommune(school, institution?.commune || activeLocation);

    // Official Lab Officer title computed dynamically using formatOfficialRankTitle
    // Ensures "ملحق رئيس بالمخابر" becomes "الملحق الرئيس بالمخابر"
    const labOfficerTitle = formatOfficialRankTitle(
      sourceReport?.sender || 
      (sourceReport?.signers && sourceReport.signers[0]) || 
      docSigners[0] || 
      docSender || 
      institution?.jobTitle
    );

    const supervisorTitle = 'الناظر';
    const principalTitle = 'مدير المؤسسة';

    const formatIsoDate = (d?: string | Date | null): string => {
      if (!d) return '';
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
        return d.trim();
      }
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const activeDateIso = formatIsoDate(sourceReport?.date || date);
    const activeDateLtrSpan = `<span dir="ltr" style="direction: ltr; unicode-bidi: isolate; display: inline-block; font-family: 'Cairo', Arial, sans-serif;">${activeDateIso}</span>`;

    // Document Title Banner (matching PDF)
    const docTitle = isBlank 
      ? 'استمارة التقرير اليومي للمخبر (نموذج رسمي فارغ)' 
      : 'التقرير اليومي للمخبر';
    
    const docSubtitle = isBlank 
      ? 'استمارة رسمية جاهزة للطباعة والملء اليدوي المباشر أثناء اليوم الدراسي' 
      : isNoAct 
        ? `سجل الحصص المخبرية ليوم: ${activeDateLtrSpan} (يوم بدون أنشطة تطبيقية)` 
        : `سجل الحصص المخبرية المنجزة ليوم: ${activeDateLtrSpan}`;

    const reportNumSpan = `<span dir="ltr" style="direction: ltr; unicode-bidi: isolate; display: inline-block; font-family: 'Cairo', Arial, sans-serif;">${activeNum}</span>`;

    // Summary Cards (Key Metrics) - matching PDF exactly with YYYY-MM-DD LTR and report number
    const summaryCards = isBlank ? [
      { label: 'رقم التقرير', value: reportNumSpan },
      { label: 'النوع', value: 'استمارة بيضاء للتحرير اليدوي' },
      { label: 'تاريخ الاستخراج', value: activeDateLtrSpan }
    ] : isNoAct ? [
      { label: 'رقم التقرير', value: reportNumSpan },
      { label: 'الوضعية', value: 'لا توجد نشاطات تطبيقية' },
      { label: 'تاريخ اليوم', value: activeDateLtrSpan }
    ] : [
      { label: 'رقم التقرير', value: reportNumSpan },
      { label: 'إجمالي الحصص المسجلة', value: String(activeRows.length) },
      { label: 'تاريخ النشاط', value: activeDateLtrSpan }
    ];

    // Main Table Rows (matching PDF)
    let tableRowsHtml = '';
    if (isBlank) {
      tableRowsHtml = Array.from({ length: 7 }, (_, i) => `
        <tr style="height: 38px;">
          <td style="border: 1px solid #d2d7cd; padding: 6px 4px; font-weight: bold; text-align: center; color: #2b3d22;">${i + 1}</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; color: #94a3b8; font-size: 11px;">........................................</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; text-align: center; color: #94a3b8; font-size: 11px;">...... : ......</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; text-align: center; color: #94a3b8; font-size: 11px;">....................</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; color: #94a3b8; font-size: 11px;">................................................................</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; color: #94a3b8; font-size: 11px;">................................................................</td>
          <td style="border: 1px solid #d2d7cd; padding: 6px 8px; color: #94a3b8; font-size: 11px;">..............................</td>
        </tr>
      `).join('');
    } else if (isNoAct) {
      tableRowsHtml = `
        <tr style="background-color: #fafbf9;">
          <td style="border: 1px solid #d2d7cd; padding: 10px 6px; font-weight: bold; text-align: center; color: #64735f;">-</td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: center; color: #94a3b8;">---</td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: center; color: #94a3b8;">---</td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: center; color: #94a3b8;">---</td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: right; font-weight: bold; color: #2b3d22;">
            لا توجد نشاطات تطبيقية لهذا اليوم (${activeReason})
          </td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: center; color: #94a3b8;">---</td>
          <td style="border: 1px solid #d2d7cd; padding: 10px 8px; text-align: center; font-weight: bold; color: #64735f; font-size: 11px;">يوم بدون حصص مخبرية</td>
        </tr>
      `;
    } else if (activeRows.length === 0) {
      tableRowsHtml = `
        <tr>
          <td colspan="7" style="border: 1px solid #d2d7cd; padding: 16px; text-align: center; color: #64735f; font-weight: bold;">
            لا توجد حصص مسجلة في هذا التقرير
          </td>
        </tr>
      `;
    } else {
      tableRowsHtml = activeRows.map((r: any, i: number) => `
        <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#fcfaf6'};">
          <td style="border: 1px solid #e1e6d7; padding: 6px 4px; font-weight: bold; text-align: center; color: #2b3d22;">${i + 1}</td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; font-weight: bold; text-align: right; color: #1e293b;">
            ${r.teacher || '---'}
            ${r.teacherSubject ? `<span style="font-size: 10px; color: #64748b; font-weight: normal; margin-right: 4px;">(${r.teacherSubject})</span>` : ''}
          </td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; text-align: center; font-weight: bold; color: #2b3d22;">${r.time || '---'}</td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; text-align: center; font-weight: bold; color: #1e293b;">${r.class || '---'}</td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; text-align: right;">
            ${r.activityType ? `<span style="display: inline-block; background-color: #eaf0e6; color: #2b3d22; font-size: 10px; font-weight: bold; padding: 1px 6px; border-radius: 4px; margin-left: 5px;">[${r.activityType}]</span>` : ''}
            <strong style="color: #0f172a;">${r.activityTitle || '---'}</strong>
          </td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; text-align: right; font-size: 11px; color: #334155; line-height: 1.4;">${r.equipment || '---'}</td>
          <td style="border: 1px solid #e1e6d7; padding: 6px 8px; font-size: 10.5px; text-align: right; color: #475569;">${r.notes || '---'}</td>
        </tr>
      `).join('');
    }

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${docTitle} - ${activeDate}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Amiri', 'Traditional Arabic', serif;
            margin: 0;
            padding: 4px;
            color: #282d23;
            line-height: 1.35;
            direction: rtl;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print-toolbar {
            background: #0f172a;
            color: #fff;
            padding: 10px 18px;
            margin: -4px -4px 14px -4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Cairo', sans-serif;
          }
          .republic-header {
            text-align: center;
            font-size: 14.5px;
            font-weight: 900;
            color: #1e2819;
            margin-bottom: 2px;
            font-family: 'Amiri', serif;
            letter-spacing: 0.3px;
          }
          .ministry-header {
            text-align: center;
            font-size: 12.5px;
            font-weight: 700;
            color: #3c4632;
            margin-bottom: 5px;
            font-family: 'Amiri', serif;
          }
          .institution-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 11px;
            font-weight: bold;
            color: #32382c;
            border-bottom: 1.5px solid #c8d2c3;
            padding-bottom: 6px;
            margin-bottom: 8px;
            line-height: 1.5;
            font-family: 'Amiri', serif;
          }
          .title-banner {
            background-color: #2b3d22;
            color: #ffffff;
            border-radius: 5px;
            padding: 7px 14px;
            text-align: center;
            margin: 6px 0 8px;
            box-shadow: 0 1px 3px rgba(43,61,34,0.2);
          }
          .title-banner h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.4px;
          }
          .title-banner .subtitle {
            margin: 2px 0 0;
            font-size: 10.5px;
            color: #e6f0dc;
            font-family: 'Amiri', serif;
          }
          .summary-cards {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
          .summary-card {
            flex: 1;
            background: #f5f8f2;
            border: 1px solid #d7e1cd;
            border-radius: 4px;
            padding: 5px 8px;
            text-align: center;
          }
          .summary-card .label {
            font-size: 9px;
            color: #64735f;
            font-family: 'Amiri', serif;
            margin-bottom: 1px;
          }
          .summary-card .value {
            font-size: 12px;
            font-weight: bold;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0;
            font-size: 11.5px;
          }
          table.data-table th {
            background-color: #2b3d22;
            color: #ffffff;
            font-weight: bold;
            border: 1px solid #2b3d22;
            padding: 6px 7px;
            text-align: right;
            font-family: 'Cairo', sans-serif;
            font-size: 10.5px;
          }
          table.data-table td {
            border: 1px solid #e1e6d7;
            padding: 5px 7px;
            vertical-align: middle;
          }
          table.observations-table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0 4px;
            font-size: 11px;
          }
          table.observations-table th {
            background-color: #f5f8f2;
            color: #2b3d22;
            font-weight: bold;
            border: 1px solid #d7e1cd;
            padding: 4px 6px;
            text-align: center;
            font-family: 'Cairo', sans-serif;
            font-size: 10.5px;
          }
          table.observations-table td {
            border: 1px solid #d7e1cd;
            padding: 6px 8px;
            vertical-align: top;
            height: 48px;
            line-height: 1.4;
            background: #ffffff;
          }
          .release-line {
            text-align: left;
            margin: 6px 0 6px;
            font-weight: bold;
            font-size: 11.5px;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          .signatures-grid {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 6px;
            text-align: center;
          }
          .sig-box {
            flex: 1;
            border: 1px solid #d2d7cd;
            border-radius: 4px;
            padding: 6px 8px;
            background: #fefefd;
            height: 72px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .sig-title {
            font-weight: bold;
            font-size: 12px;
            color: #2b3d22;
            font-family: 'Cairo', sans-serif;
          }
          .sig-content {
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sig-placeholder {
            color: #828c7d;
            font-size: 10px;
            font-family: 'Amiri', serif;
          }
          .doc-footer {
            border-top: 1px solid #e6ebe1;
            margin-top: 8px;
            padding-top: 4px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            color: #828c7d;
            font-family: 'Amiri', serif;
          }
          @media print {
            .no-print-toolbar {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <!-- Top Toolbar for Tab Preview -->
        <div class="no-print-toolbar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: #2b3d22; border: 1px solid #4a6738; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">نموذج رسمي مطابق لـ PDF</span>
            <span style="font-weight: 700; font-size: 13.5px;">التقرير اليومي للمخبر — معاينة وطباعة الوثيقة</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" style="background: #2b3d22; color: #fff; border: 1px solid #4a6738; padding: 7px 18px; border-radius: 6px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <span>🖨️</span> طباعة الآن (Ctrl+P)
            </button>
            <button onclick="window.close()" style="background: #334155; color: #f1f5f9; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer;">
              ✕ إغلاق التبويب
            </button>
          </div>
        </div>

        <!-- Official Header (Algerian Institution Standard) -->
        <div class="republic-header">${country}</div>
        <div class="ministry-header">${ministry}</div>

        <div class="institution-bar">
          <div style="text-align: right;">
            <div><strong>مديرية التربية:</strong> ${directorate}</div>
            <div><strong>المؤسسة:</strong> ${formattedSchool}</div>
          </div>
          <div style="text-align: left;">
            <div><strong>السنة الدراسية:</strong> ${activeYear}</div>
            <div><strong>المخبر:</strong> ${activeDept}</div>
          </div>
        </div>

        <!-- Document Title Banner -->
        <div class="title-banner">
          <h1>${docTitle}</h1>
          <div class="subtitle">${docSubtitle}</div>
        </div>

        <!-- Summary Cards (Key Metrics) -->
        <div class="summary-cards">
          ${summaryCards.map(c => `
            <div class="summary-card">
              <div class="label">${c.label}</div>
              <div class="value">${c.value}</div>
            </div>
          `).join('')}
        </div>

        <!-- Main Data Table -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 170px;">الأستاذ(ة) والمادة</th>
              <th style="width: 85px; text-align: center;">التوقيت</th>
              <th style="width: 70px; text-align: center;">القسم</th>
              <th>عنوان النشاط البيداغوجي والنوع</th>
              <th style="width: 230px;">الأدوات والمواد المستعملة</th>
              <th style="width: 120px;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <!-- Observations Table (Clean and empty if no notes are provided) -->
        <table class="observations-table">
          <thead>
            <tr>
              <th style="width: 33.33%;">ملاحظات ${labOfficerTitle}</th>
              <th style="width: 33.33%;">ملاحظات الناظر</th>
              <th style="width: 33.33%;">ملاحظات السيد المدير</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${cleanLabNotes}</td>
              <td>${cleanSupervisorNotes}</td>
              <td>${cleanDirectorNotes}</td>
            </tr>
          </tbody>
        </table>

        <!-- Release Formula -->
        <div class="release-line">
          حرر بـ : ${activeLocation} في : ${activeDateLtrSpan}
        </div>

        <!-- Official Signatures Block (Matching PDF exactly) -->
        <div class="signatures-grid">
          <div class="sig-box">
            <div class="sig-title">${labOfficerTitle}</div>
            <div class="sig-content">
              ${signature ? `<img src="${signature}" style="max-height: 48px; max-width: 130px; object-fit: contain;" alt="Signature" />` : `<span class="sig-placeholder">(التوقيع والختم)</span>`}
            </div>
          </div>
          <div class="sig-box">
            <div class="sig-title">${supervisorTitle}</div>
            <div class="sig-content">
              <span class="sig-placeholder">(التوقيع والختم)</span>
            </div>
          </div>
          <div class="sig-box">
            <div class="sig-title">${principalTitle}</div>
            <div class="sig-content">
              <span class="sig-placeholder">(التوقيع والختم)</span>
            </div>
          </div>
        </div>

        <!-- Page Footer (Matching PDF) -->
        <div class="doc-footer">
          <div>الأرضية الرقمية لتسيير المخابر المدرسية</div>
          <div>${activeDateLtrSpan}</div>
          <div>صفحة 1 من 1</div>
        </div>
      </body>
      </html>
    `;
  };

  // Printing & Exporting handlers - opening in a New Tab
  const handlePrint = async () => {
    // Open new tab synchronously on user click to prevent popup blockers
    const printTab = window.open('', '_blank');
    if (printTab) {
      printTab.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <title>جاري تحضير استمارة التقرير اليومي...</title>
            <style>
              body { font-family: 'Amiri', 'Segoe UI', Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; direction: rtl; }
              .box { text-align: center; }
              .spinner { width: 36px; height: 36px; border: 4px solid #cbd5e1; border-top-color: #0284c7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="spinner"></div>
              <div style="font-weight: 900; font-size: 16px;">جاري تجهيز استمارة التقرير اليومي للمخبر للطباعة...</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 6px;">يُرجى الانتظار ثوانٍ معدودة...</div>
            </div>
          </body>
        </html>
      `);
    }

    await handleSave();
    const html = generateDailyReportHtml();
    await PrintService.printInNewTab(html, {
      title: `التقرير اليومي للمخبر - ${date}`,
      existingWindow: printTab
    });
  };

  const handleExportPDF = async () => {
    await handleSave();
    await PDFService.generateDailyReportPDF({
      date,
      reportNumber,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: docSigners,
      noActivities,
      noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      observations: {
        labNotes,
        supervisorNotes,
        directorNotes
      },
      rows: noActivities ? [] : rows
    });
  };

  const handleExportWord = async () => {
    await handleSave();
    PDFService.generateDailyReportWord({
      date,
      reportNumber,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: docSigners,
      noActivities,
      noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      observations: {
        labNotes,
        supervisorNotes,
        directorNotes
      },
      rows: noActivities ? [] : rows
    });
  };

  // Advanced Preview in PdfReviewModal
  const handlePreviewPdf = async () => {
    await handleSave();
    const doc = await PDFService.generateDailyReportPDF({
      date,
      reportNumber,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: docSigners,
      noActivities,
      noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      observations: {
        labNotes,
        supervisorNotes,
        directorNotes
      },
      rows: noActivities ? [] : rows,
      save: false
    });
    const blob = doc.output('blob');
    openPdfPreview({
      file: new File([blob], `التقرير_اليومي_${date}.pdf`, { type: 'application/pdf' }),
      title: `التقرير اليومي للمخبر - ${getDayName(date)} ${date}`,
      fileName: `daily_report_${date}.pdf`,
      category: 'التقارير اليومية للمخبر',
      date: date,
      reference: reportNumber ? `رقم ${reportNumber}` : undefined,
      description: `سجل الحصص والتجارب المخبرية المنجزة ليوم ${getDayName(date)} ${date} - ${institution?.school || ''}`
    });
  };

  // Blank Form Handlers
  const downloadBlankPDF = async () => {
    await PDFService.generateDailyReportPDF({
      date,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: docSigners,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      rows: [],
      isBlank: true,
      save: true
    });
  };

  const downloadBlankWord = () => {
    PDFService.generateDailyReportWord({
      date,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: docSigners,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      rows: [],
      isBlank: true
    });
  };

  const printBlankReport = async () => {
    const printTab = window.open('', '_blank');
    const html = generateDailyReportHtml({ isBlank: true });
    await PrintService.printInNewTab(html, {
      title: 'استمارة التقرير اليومي للمخبر (نموذج رسمي فارغ)',
      existingWindow: printTab
    });
  };

  const printNoActivitiesReport = async () => {
    const printTab = window.open('', '_blank');
    const html = generateDailyReportHtml({ overrideNoActivities: true });
    await PrintService.printInNewTab(html, {
      title: 'التقرير اليومي للمخبر (نموذج خاص: يوم بدون أنشطة تطبيقية)',
      existingWindow: printTab
    });
  };

  const downloadNoActivitiesPDF = async () => {
    await PDFService.generateDailyReportPDF({
      date,
      reportNumber,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: formatOfficialRankTitle(docSender),
      signers: [formatOfficialRankTitle(docSigners[0] || docSender), 'الناظر', 'مدير المؤسسة'],
      noActivities: true,
      noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      observations: {
        labNotes: labNotes?.trim() || '',
        supervisorNotes: supervisorNotes?.trim() || '',
        directorNotes: directorNotes?.trim() || ''
      },
      rows: []
    });
  };

  const downloadNoActivitiesWord = () => {
    PDFService.generateDailyReportWord({
      date,
      reportNumber,
      department: docDepartment,
      academicYear: docAcademicYear,
      location: docLocation,
      routing: docRouting,
      recipient: docRecipient,
      sender: docSender,
      signers: ['الملحق الرئيس بالمخابر', 'الناظر', 'المدير'],
      noActivities: true,
      noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: docDepartment
      },
      observations: {
        labNotes: labNotes || 'تم استغلال اليوم في أعمال الصيانة الدورية وتنظيم وتصنيف عتاد المخبر وتحضير المحاليل والتجارب في ظروف عادية.',
        supervisorNotes,
        directorNotes
      },
      rows: []
    });
  };

  // History operations
  const loadReport = (report: SavedReport) => {
    setDate(report.date);
    setReportNumber(report.reportNumber || '');
    if (report.routing) handleSetRouting(report.routing, report.sender);
    if (report.department) setDocDepartment(report.department);
    if (report.academicYear) setDocAcademicYear(report.academicYear);
    if (report.location) setDocLocation(report.location);
    if (report.sender) setDocSender(report.sender);
    if (report.recipient) setDocRecipient(report.recipient);
    
    // Ensure "الناظر" in signers
    if (report.signers) {
      setDocSigners(report.signers.map(s => s.includes('تحت إشراف ناظر') ? 'الناظر' : (s.includes('مدير المؤسسة') ? 'المدير' : s)));
    } else {
      handleSetRouting(report.routing || 'hierarchical_nazir');
    }

    if (report.noActivities !== undefined) {
      setNoActivities(Boolean(report.noActivities));
      if (report.noActivitiesReason) setNoActivitiesReason(report.noActivitiesReason);
    } else {
      setNoActivities(false);
    }

    const fetchedRows = (report.rows || []).map((row: any, i: number) => ({
      id: i + 1,
      teacher: row.teacher || '',
      teacherSubject: row.teacherSubject || '',
      time: row.time || '',
      class: row.class || '',
      activityType: row.activityType || 'عملي',
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

  const handlePreviewHistoryReport = async (report: SavedReport) => {
    const doc = await PDFService.generateDailyReportPDF({
      date: report.date,
      reportNumber: report.reportNumber,
      department: report.department || docDepartment,
      academicYear: report.academicYear || docAcademicYear,
      location: report.location || docLocation,
      routing: report.routing || docRouting,
      recipient: report.recipient || docRecipient,
      sender: report.sender || docSender,
      signers: report.signers || docSigners,
      noActivities: report.noActivities,
      noActivitiesReason: report.noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: report.department || docDepartment
      },
      observations: {
        labNotes: report.labNotes,
        supervisorNotes: report.supervisorNotes,
        directorNotes: report.directorNotes
      },
      rows: report.rows as any,
      save: false
    });
    const blob = doc.output('blob');
    openPdfPreview({
      file: new File([blob], `التقرير_اليومي_${report.date}.pdf`, { type: 'application/pdf' }),
      title: `التقرير اليومي للمخبر - ${report.date}`,
      fileName: `daily_report_${report.date}.pdf`,
      category: 'أرشيف التقارير اليومية',
      date: report.date,
      reference: report.reportNumber ? `رقم ${report.reportNumber}` : undefined,
      description: `أرشيف التقرير اليومي للمخبر - ${institution?.school || ''}`
    });
  };

  const handleExportHistoryWord = (report: SavedReport) => {
    PDFService.generateDailyReportWord({
      date: report.date,
      reportNumber: report.reportNumber,
      department: report.department || docDepartment,
      academicYear: report.academicYear || docAcademicYear,
      location: report.location || docLocation,
      routing: report.routing || docRouting,
      recipient: report.recipient || docRecipient,
      sender: report.sender || docSender,
      signers: report.signers || docSigners,
      noActivities: report.noActivities,
      noActivitiesReason: report.noActivitiesReason,
      schoolInfo: {
        school: institution?.school,
        commune: institution?.commune || docLocation,
        directorate: institution?.directorate,
        laboratory: report.department || docDepartment
      },
      observations: {
        labNotes: report.labNotes,
        supervisorNotes: report.supervisorNotes,
        directorNotes: report.directorNotes
      },
      rows: report.rows as any
    });
  };

  const printHistoryReport = async (report: SavedReport) => {
    const printTab = window.open('', '_blank');
    if (printTab) {
      printTab.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <title>جاري تحضير استمارة التقرير اليومي...</title>
            <style>
              body { font-family: 'Amiri', 'Segoe UI', Tahoma, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; direction: rtl; }
              .box { text-align: center; }
              .spinner { width: 36px; height: 36px; border: 4px solid #cbd5e1; border-top-color: #2b3d22; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="spinner"></div>
              <div style="font-weight: 900; font-size: 16px;">جاري تجهيز استمارة التقرير اليومي للمخبر للطباعة...</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 6px;">يُرجى الانتظار ثوانٍ معدودة...</div>
            </div>
          </body>
        </html>
      `);
    }

    const html = generateDailyReportHtml({ reportData: report });
    await PrintService.printInNewTab(html, {
      title: `التقرير اليومي للمخبر - ${report.date}`,
      existingWindow: printTab
    });
  };

  const exportHistorySummaryExcel = () => {
    if (history.length === 0) return;
    const data = history.map((item, index) => ({
      'الرقم': index + 1,
      'تاريخ التقرير': item.date,
      'اليوم': item.dayName || getDayName(item.date),
      'رقم التقرير': item.reportNumber || '---',
      'الوضعية': item.noActivities ? 'يوم بدون أنشطة تطبيقية' : 'أنشطة مخبرية منجزة',
      'المصلحة': item.department || docDepartment,
      'مكان التحرير': item.location || docLocation,
      'عدد الحصص': item.noActivities ? 0 : (item.rows?.length || 0),
      'الأساتذة الحاضرون': item.noActivities ? '---' : (Array.from(new Set(item.rows?.map(r => r.teacher).filter(Boolean))).join('، ') || '---'),
      'الأقسام': item.noActivities ? '---' : (Array.from(new Set(item.rows?.map(r => r.class).filter(Boolean))).join('، ') || '---'),
      'ملاحظات مسؤول المخبر': item.labNotes || (item.noActivities ? item.noActivitiesReason : '---'),
      'ملاحظات الناظر': item.supervisorNotes || '---',
      'ملاحظات المدير': item.directorNotes || '---'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل التقارير اليومية');
    XLSX.writeFile(workbook, `سجل_التقارير_اليومية_للمخبر_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return {
    schoolId,
    navigate,
    timeSlots,
    loadingTimeSlots,
    isTimeManagerOpen, setIsTimeManagerOpen,
    pickerState, setPickerState,
    resourcePickerState, setResourcePickerState,
    isPresetModalOpen, setIsPresetModalOpen,
    presetTargetRowId, setPresetTargetRowId,
    teachers,
    activeTab, setActiveTab,
    date, setDate: handleDateChange,
    reportNumber, setReportNumber,
    docRouting, setDocRouting,
    docDepartment, setDocDepartment,
    docAcademicYear, setDocAcademicYear,
    docLocation, setDocLocation,
    docSender, setDocSender,
    docRecipient, setDocRecipient,
    docSigners, setDocSigners,
    handleSetRouting,
    noActivities, setNoActivities: toggleNoActivities,
    noActivitiesReason, setNoActivitiesReason,
    generateDailyReportHtml,
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
    deleteTargetReportId, setDeleteTargetReportId,
    handleDeleteHistoryReport,
    isLoading,
    isLoadingHistory,
    saveSuccess,
    copySuccessMessage,
    stats,
    generateNextReportNumber,
    fetchReportForDate,
    addRow,
    duplicateRow,
    clearAllRows,
    updateRow,
    deleteRow,
    removeRow,
    moveRow,
    copyFromPreviousReport,
    applyExperimentPreset,
    addPresetAsNewRow,
    appendLabNote,
    appendSupervisorNote,
    appendDirectorNote,
    goToToday,
    goToYesterday,
    goToTomorrow,
    handleSave,
    handleDelete,
    handlePrint,
    handlePreviewPdf,
    handleExportPDF,
    handleExportWord,
    downloadBlankPDF,
    downloadBlankWord,
    printBlankReport,
    printNoActivitiesReport,
    downloadNoActivitiesPDF,
    downloadNoActivitiesWord,
    loadReport,
    handlePreviewHistoryReport,
    handleExportHistoryWord,
    printHistoryReport,
    exportHistorySummaryExcel,
    getDayName,
    setRows
  };
}
