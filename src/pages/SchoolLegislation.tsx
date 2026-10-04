import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { db, getUserCollection, auth, checkIsAdmin } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  Scale, FileText, Search, Plus, Trash2, ExternalLink, 
  Filter, FileArchive, X, BookOpen, UploadCloud, Calendar, 
  FileSignature, Download, Link2, CheckCircle2, AlertCircle, Eye,
  Globe, Building2, ShieldCheck, Lock, Share2, Crown, Files, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { saveFileWithResilientFallback, openOrDownloadFile, deleteStoredFile } from '../lib/fileStorage';
import BatchLegislationUploadModal from '../components/BatchLegislationUploadModal';

export interface LegislationDoc {
  id: string;
  title: string;
  reference: string;
  date: string;
  category: 'circular_instruction' | 'law_order' | 'decree' | 'special_law' | 'decision' | 'law' | 'circular' | 'correspondence' | 'other';
  description: string;
  fileUrl?: string;
  fileName?: string;
  storageType?: 'cloud' | 'inline' | 'local' | 'external';
  isPublic?: boolean;
  publishedBy?: string;
  publisherRole?: string;
  sourceCollection?: 'public' | 'school';
  createdAt: any;
}

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: FileArchive },
  { id: 'circular_instruction', label: 'المناشير والتعليمات', icon: FileText },
  { id: 'law_order', label: 'الأوامر والقوانين', icon: Scale },
  { id: 'decree', label: 'المراسيم', icon: FileSignature },
  { id: 'special_law', label: 'القوانين الأساسية الخاصة', icon: BookOpen },
  { id: 'decision', label: 'القرارات', icon: Filter },
];

export default function SchoolLegislation() {
  const { schoolId } = useSchool();
  const { openPdfPreview } = usePdfPreview();
  const [documents, setDocuments] = useState<LegislationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'public' | 'school'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Admin & Public publishing State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPublicScope, setIsPublicScope] = useState<boolean>(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<'file' | 'link'>('file');
  const [newDoc, setNewDoc] = useState<{
    title: string;
    reference: string;
    date: string;
    category: LegislationDoc['category'];
    description: string;
    externalUrl: string;
  }>({
    title: '',
    reference: '',
    date: '',
    category: 'circular_instruction',
    description: '',
    externalUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Verify Admin Status
  useEffect(() => {
    const verifyAdmin = async () => {
      if (auth.currentUser) {
        const adminStatus = await checkIsAdmin(auth.currentUser);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          setIsPublicScope(true);
        }
      }
    };
    verifyAdmin();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [schoolId]);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let combinedDocs: LegislationDoc[] = [];

      // 1. Fetch Public Official Legislation (Visible to all schools/users)
      try {
        const qPublic = query(collection(db, 'public_legislation'), orderBy('createdAt', 'desc'));
        const publicSnap = await getDocs(qPublic);
        const publicItems = publicSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          isPublic: true,
          sourceCollection: 'public'
        } as LegislationDoc));
        combinedDocs.push(...publicItems);
      } catch (err) {
        console.warn('Fetching public legislation returned:', err);
      }

      // 2. Fetch School-specific Local Legislation
      try {
        const qLegislation = query(getUserCollection(schoolId, 'legislation'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(qLegislation);
        const schoolItems = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          isPublic: false,
          sourceCollection: 'school'
        } as LegislationDoc));
        combinedDocs.push(...schoolItems);
      } catch (err) {
        console.warn('Fetching from legislation collection returned:', err);
      }

      // 3. Check legacy collection 'equipment' if any legislation was created there
      try {
        const qEquip = query(getUserCollection(schoolId, 'equipment'));
        const snapEquip = await getDocs(qEquip);
        const legacyDocs = snapEquip.docs
          .map(d => ({ id: d.id, ...d.data(), isPublic: false, sourceCollection: 'school' } as any))
          .filter(d => d.title && d.category && [
            'circular_instruction', 'law_order', 'decree', 'special_law', 'decision', 'law', 'circular', 'correspondence', 'other'
          ].includes(d.category));
        
        const existingIds = new Set(combinedDocs.map(d => d.id));
        for (const legDoc of legacyDocs) {
          if (!existingIds.has(legDoc.id)) {
            combinedDocs.push(legDoc as LegislationDoc);
          }
        }
      } catch (legacyErr) {
        // Non-blocking
      }

      // Deduplicate by ID
      const seen = new Set<string>();
      const uniqueDocs = combinedDocs.filter(doc => {
        if (seen.has(doc.id)) return false;
        seen.add(doc.id);
        return true;
      });

      setDocuments(uniqueDocs);
    } catch (error) {
      console.error('Error fetching legislation documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.category) {
      alert("الرجاء ملء الحقول الإلزامية");
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = '';
      let fileName = '';
      let storageType: 'cloud' | 'inline' | 'local' | 'external' | undefined = undefined;

      // 1. If an external link was provided
      if (attachmentMode === 'link' && newDoc.externalUrl.trim()) {
        fileUrl = newDoc.externalUrl.trim();
        fileName = 'رابط إلكتروني';
        storageType = 'external';
      }

      // 2. If a file was selected from device
      if (attachmentMode === 'file' && selectedFile) {
        const result = await saveFileWithResilientFallback(selectedFile, 'uploads/legislation', 2500);
        fileUrl = result.fileUrl;
        fileName = result.fileName;
        storageType = result.storageType;
      }

      // 3. Save record to Firestore
      if (isPublicScope) {
        await addDoc(collection(db, 'public_legislation'), {
          title: newDoc.title.trim(),
          reference: newDoc.reference.trim() || '',
          date: newDoc.date || '',
          category: newDoc.category,
          description: newDoc.description.trim() || '',
          fileUrl,
          fileName,
          storageType: storageType || null,
          isPublic: true,
          publishedBy: auth.currentUser?.email || 'الإدارة المركزية',
          publisherRole: 'مشرف عام (Admin)',
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(getUserCollection(schoolId, 'legislation'), {
          title: newDoc.title.trim(),
          reference: newDoc.reference.trim() || '',
          date: newDoc.date || '',
          category: newDoc.category,
          description: newDoc.description.trim() || '',
          fileUrl,
          fileName,
          storageType: storageType || null,
          isPublic: false,
          publishedBy: auth.currentUser?.email || 'مسؤول المخبر',
          createdAt: serverTimestamp()
        });
      }

      setShowAddModal(false);
      setNewDoc({ title: '', reference: '', date: '', category: 'circular_instruction', description: '', externalUrl: '' });
      setSelectedFile(null);
      setAttachmentMode('file');
      
      showNotification(
        isPublicScope 
          ? 'تم نشر النص التشريعي العام بنجاح وهو متاح الآن لجميع المدارس والمستخدمين!'
          : storageType === 'local' 
            ? 'تم حفظ الوثيقة والمرفق بنجاح محلياً في الذاكرة الآمنة للتطبيق.' 
            : 'تمت إضافة الوثيقة التشريعية بنجاح!',
        'success'
      );
      fetchDocuments();
    } catch (error: any) {
      console.error("Error adding document:", error);
      alert(error.message || "حدث خطأ أثناء حفظ الوثيقة.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docItem: LegislationDoc) => {
    if (docItem.isPublic && !isAdmin) {
      alert("النصوص الرسمية العامة محمية ويمكن إدارتها فقط بواسطة مدير النظام (Admin).");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${docItem.isPublic ? 'هذا النص الرسمي العام' : 'هذه الوثيقة التشريعية'}؟ لا يمكن التراجع عن هذه العملية.`)) return;
    
    try {
      if (docItem.isPublic || docItem.sourceCollection === 'public') {
        await deleteDoc(doc(db, 'public_legislation', docItem.id));
      } else {
        try {
          await deleteDoc(doc(getUserCollection(schoolId, 'legislation'), docItem.id));
        } catch {
          await deleteDoc(doc(getUserCollection(schoolId, 'equipment'), docItem.id));
        }
      }
      
      // Clean up file if present
      if (docItem.fileUrl) {
        await deleteStoredFile(docItem.fileUrl);
      }
      
      setDocuments(prev => prev.filter(d => d.id !== docItem.id));
      showNotification('تم حذف الوثيقة التشريعية بنجاح.', 'info');
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  const handlePreviewDoc = (docItem: LegislationDoc) => {
    if (!docItem.fileUrl) return;
    openPdfPreview({
      url: docItem.fileUrl,
      title: docItem.title,
      fileName: docItem.fileName || `${docItem.title}.pdf`,
      category: getCategoryLabel(docItem.category),
      date: docItem.date,
      storageType: docItem.storageType === 'local' ? 'local' : docItem.storageType === 'cloud' ? 'cloud' : 'external',
      description: docItem.description,
      reference: docItem.reference,
      docId: docItem.id,
      isPublic: docItem.isPublic
    });
  };

  const handlePreviewSelectedFile = () => {
    if (!selectedFile) return;
    openPdfPreview({
      file: selectedFile,
      title: newDoc.title || selectedFile.name,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      category: getCategoryLabel(newDoc.category),
      description: newDoc.description
    });
  };

  const handleOpenFile = async (docItem: LegislationDoc) => {
    if (!docItem.fileUrl) return;
    // Prefer in-app PDF review modal for PDFs or images
    handlePreviewDoc(docItem);
  };

  // Filter Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (doc.title || '').toLowerCase().includes(query) ||
        (doc.reference || '').toLowerCase().includes(query) ||
        (doc.description || '').toLowerCase().includes(query);
      
      const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;

      const matchesScope = 
        scopeFilter === 'all' || 
        (scopeFilter === 'public' && doc.isPublic) || 
        (scopeFilter === 'school' && !doc.isPublic);

      return matchesSearch && matchesCategory && matchesScope;
    });
  }, [documents, searchQuery, activeCategory, scopeFilter]);

  const getCategoryLabel = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.label || 'غير محدد';
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 start-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-xl border text-sm font-black ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
                : 'bg-primary text-on-primary border-primary-container shadow-primary/20'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
            {notification.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold text-primary flex items-center gap-4">
              <Scale size={40} className="text-tertiary" />
              التشريع المدرسي
            </h1>
            {isAdmin && (
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs">
                <Crown size={14} className="text-amber-500" />
                <span>حساب المشرف العام (Admin)</span>
              </span>
            )}
          </div>
          <p className="text-lg text-secondary max-w-3xl">
            مكتبة رقمية شاملة تخزن كل ما يخص القوانين، المراسيم، المناشير، المراسلات والتعليمات المنظمة للحياة المدرسية والتسيير الإداري للمخابر.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={() => setShowBatchModal(true)}
            className="px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2.5 shadow-sm group"
          >
            <Files size={22} className="group-hover:scale-110 transition-transform" />
            <div className="text-right">
              <span className="block text-sm md:text-base leading-tight font-black">رفع عدة ملفات دفعة واحدة</span>
              <span className="text-[11px] opacity-90 font-medium">تعبئة ذكية للمعلومات آلياً</span>
            </div>
          </button>

          <button 
            onClick={() => {
              if (isAdmin) setIsPublicScope(true);
              setShowAddModal(true);
            }}
            className="px-6 py-3.5 bg-tertiary text-on-tertiary rounded-2xl font-bold hover:shadow-lg hover:shadow-tertiary/30 transition-all flex items-center gap-2.5 shrink-0 shadow-sm"
          >
            <Plus size={22} />
            <span className="font-black">{isAdmin ? 'إضافة وثيقة فردية' : 'إضافة وثيقة'}</span>
          </button>
        </div>
      </header>

      {/* Scope Selector: All, Public National, School Local */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30">
          <button
            onClick={() => setScopeFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              scopeFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface'
            }`}
          >
            <span>جميع الوثائق</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">{documents.length}</span>
          </button>

          <button
            onClick={() => setScopeFilter('public')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              scopeFilter === 'public'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-secondary hover:text-emerald-600 hover:bg-surface'
            }`}
          >
            <Globe size={14} />
            <span>نصوص رسمية عامة</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
              {documents.filter(d => d.isPublic).length}
            </span>
          </button>

          <button
            onClick={() => setScopeFilter('school')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              scopeFilter === 'school'
                ? 'bg-tertiary text-on-tertiary shadow-xs'
                : 'text-secondary hover:text-tertiary hover:bg-surface'
            }`}
          >
            <Building2 size={14} />
            <span>خاص بالمؤسسة</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {documents.filter(d => !d.isPublic).length}
            </span>
          </button>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck size={16} />
            <span>صلاحية النشر العام مفعلة: الوثائق المضافة ستظهر لجميع المدارس</span>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-surface rounded-3xl p-4 border border-outline-variant shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container hover:bg-surface-container-highest text-secondary'}`}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            )
          })}
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            type="text" 
            placeholder="بحث في القوانين والمناشير..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border-none px-12 py-3 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-secondary">
          <div className="w-12 h-12 border-4 border-tertiary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">جاري تحميل الأرشيف التشريعي...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-16 text-center border border-dashed border-outline-variant">
          <Scale size={64} className="mx-auto text-outline mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-secondary mb-2">لا توجد نصوص تشريعية مطابقة</h3>
          <p className="text-secondary max-w-md mx-auto">
            لم يتم العثور على أي مراسيم أو قوانين في هذا القسم. اضغط على الزر أعلاه لإضافة أول وثيقة أو قم بتغيير معايير البحث.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDocuments.map((docItem, index) => (
              <motion.div 
                key={docItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative"
              >
                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  {docItem.fileUrl && (
                    <>
                      <button 
                        onClick={() => handlePreviewDoc(docItem)}
                        className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs" 
                        title="معاينة ومراجعة ملف PDF"
                      >
                        <Eye size={15} />
                        <span>معاينة PDF</span>
                      </button>
                      <button 
                        onClick={() => openOrDownloadFile(docItem.fileUrl!, docItem.fileName || docItem.title)}
                        className="p-1.5 bg-secondary-container hover:bg-surface-container-highest text-secondary rounded-xl transition-colors flex items-center justify-center" 
                        title="تحميل المرفق مباشرة"
                      >
                        {docItem.fileUrl.startsWith('http') ? <ExternalLink size={15} /> : <Download size={15} />}
                      </button>
                    </>
                  )}
                  {/* Delete button: Only if admin OR if it's school's own local document */}
                  {(isAdmin || !docItem.isPublic) && (
                    <button 
                      onClick={() => handleDelete(docItem)} 
                      className="p-1.5 text-error/40 group-hover:text-error hover:bg-error/10 rounded-xl transition-all" 
                      title={docItem.isPublic ? "حذف النص العام (صلاحية المشرف)" : "حذف الوثيقة"}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="mb-4 pr-2">
                   <div className="flex flex-wrap items-center gap-2 mb-3">
                     {docItem.isPublic ? (
                       <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs">
                         <Globe size={13} className="text-emerald-600" />
                         <span>نص رسمي عام (متاح للجميع)</span>
                       </span>
                     ) : (
                       <span className="bg-tertiary/15 text-tertiary border border-tertiary/20 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                         <Building2 size={13} />
                         <span>خاص بالمؤسسة</span>
                       </span>
                     )}
                     <span className="bg-surface-container px-2.5 py-1 rounded-full text-xs font-bold text-secondary">
                       {getCategoryLabel(docItem.category)}
                     </span>
                     {docItem.date && (
                       <span className="text-xs text-outline font-medium flex items-center gap-1">
                         <Calendar size={12}/> {docItem.date}
                       </span>
                     )}
                   </div>
                   <h3 className="text-xl font-bold text-primary leading-tight mb-2 pl-12">{docItem.title}</h3>
                   {docItem.reference && (
                     <p className="text-sm font-mono text-secondary font-bold mb-3 border-r-2 border-tertiary pr-2">
                       المرجع: {docItem.reference}
                     </p>
                   )}
                   {docItem.isPublic && docItem.publishedBy && (
                     <div className="mb-2 text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium flex items-center gap-1">
                       <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                       <span>الناشر: {docItem.publishedBy}</span>
                     </div>
                   )}
                </div>
                
                <p className="text-sm text-secondary/80 flex-1 leading-relaxed line-clamp-4">
                  {docItem.description || 'لا يوجد وصف للوثيقة.'}
                </p>

                {docItem.fileUrl && (
                  <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-outline font-medium">
                    <button
                      onClick={() => handlePreviewDoc(docItem)}
                      className="flex items-center gap-2 hover:text-primary transition-colors truncate max-w-[190px]"
                      dir="ltr"
                    >
                      <FileText size={14} className="shrink-0 text-primary"/>
                      <span className="truncate">{docItem.fileName || 'المرفق الرقمي'}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewDoc(docItem)}
                        className="text-[11px] text-tertiary hover:underline font-bold flex items-center gap-1"
                      >
                        <Eye size={12} />
                        معاينة
                      </button>
                      {docItem.storageType === 'local' && (
                        <span className="text-[10px] bg-secondary-container px-2 py-0.5 rounded-full text-secondary font-bold">
                          مخزن محلياً
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="bg-surface w-full max-w-2xl my-auto rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary flex items-center gap-2"><Scale /> إضافة وثيقة تشريعية</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowBatchModal(true);
                    }}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 mt-1 transition-colors"
                  >
                    <Files size={14} className="text-tertiary" />
                    <span>تريد رفع عدة ملفات دفعة واحدة؟ اضغط هنا للرفع الجماعي الذكي</span>
                  </button>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-outline-variant/30 rounded-full text-secondary transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddDocument} className="p-6 md:p-8 space-y-6">
                {/* Publishing Scope Selector */}
                {isAdmin ? (
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border-2 border-emerald-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                        <ShieldCheck size={20} className="text-emerald-600" />
                        <span>صلاحيات المشرف العام (Admin) — نطاق النشر</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        متاح لجميع المدارس
                      </span>
                    </div>

                    <p className="text-xs text-secondary/90 leading-relaxed">
                      حدد نطاق توفر هذه الوثيقة. يمكنك نشرها كـ <strong>نص رسمي عام</strong> يظهر لجميع مستخدمي المنصة ومخابر الوطن، أو حصرها في الأرشيف المحلي لمؤسستك الحالية فقط.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPublicScope(true)}
                        className={`p-3.5 rounded-xl border text-start flex items-start gap-3 transition-all ${
                          isPublicScope
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant/40'
                        }`}
                      >
                        <Globe size={20} className={`shrink-0 mt-0.5 ${isPublicScope ? 'text-white' : 'text-emerald-600'}`} />
                        <div>
                          <span className="font-black text-xs block">نص رسمي عام (متاح للجميع)</span>
                          <span className="text-[10px] opacity-80 block mt-0.5">يظهر فوراً لجميع المؤسسات والأساتذة ومسؤولي المخابر بالجزائر</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPublicScope(false)}
                        className={`p-3.5 rounded-xl border text-start flex items-start gap-3 transition-all ${
                          !isPublicScope
                            ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/30'
                            : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant/40'
                        }`}
                      >
                        <Building2 size={20} className={`shrink-0 mt-0.5 ${!isPublicScope ? 'text-white' : 'text-primary'}`} />
                        <div>
                          <span className="font-black text-xs block">خاص بمؤسستي فقط</span>
                          <span className="text-[10px] opacity-80 block mt-0.5">يُحفظ في الأرشيف الداخلي لمؤسستك الحالية</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 flex items-center gap-3 text-xs text-secondary">
                    <Building2 size={16} className="text-tertiary shrink-0" />
                    <span>
                      سيتم حفظ هذه الوثيقة في <strong>أرشيف مؤسستك الخاص</strong>. لنشر نصوص رسمية عامة على مستوى الوطن، يتطلب ذلك حساب المشرف العام (Admin).
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">عنوان النص التشريعي <span className="text-error">*</span></label>
                  <input 
                    required 
                    type="text" 
                    placeholder="مثال: المرسوم التنفيذي رقم 25-54..."
                    value={newDoc.title} 
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})} 
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">طبيعة النص <span className="text-error">*</span></label>
                    <select 
                      required 
                      value={newDoc.category} 
                      onChange={e => setNewDoc({...newDoc, category: e.target.value as any})} 
                      className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="circular_instruction">المناشير والتعليمات</option>
                      <option value="law_order">الأوامر والقوانين</option>
                      <option value="decree">المراسيم</option>
                      <option value="special_law">القوانين الأساسية الخاصة</option>
                      <option value="decision">القرارات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">الرقم المرجعي</label>
                    <input 
                      type="text" 
                      dir="ltr"
                      placeholder="مثال: رقم 25-54"
                      value={newDoc.reference} 
                      onChange={e => setNewDoc({...newDoc, reference: e.target.value})} 
                      className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">تاريخ الإصدار / النشر</label>
                  <input 
                    type="date" 
                    value={newDoc.date} 
                    onChange={e => setNewDoc({...newDoc, date: e.target.value})} 
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">خلاصة أو وصف للمحتوى</label>
                  <textarea 
                    rows={3}
                    placeholder="اكتب خلاصة موجزة للموضوع الذي يعالجه هذا النص..."
                    value={newDoc.description} 
                    onChange={e => setNewDoc({...newDoc, description: e.target.value})} 
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" 
                  />
                </div>

                {/* Attachment Section with File or Link switch */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-primary">المرفق الرقمي (اختياري)</label>
                    <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/50 text-xs">
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('file')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                          attachmentMode === 'file' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-primary'
                        }`}
                      >
                        <UploadCloud size={14} />
                        رفع ملف
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('link')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                          attachmentMode === 'link' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-primary'
                        }`}
                      >
                        <Link2 size={14} />
                        رابط خارجي
                      </button>
                    </div>
                  </div>

                  {attachmentMode === 'file' ? (
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-outline-variant border-dashed rounded-2xl cursor-pointer bg-surface-container-low hover:bg-surface-container hover:border-tertiary transition-all group">
                        <div className="flex flex-col items-center justify-center pt-3 pb-3 text-secondary group-hover:text-tertiary">
                          <UploadCloud size={28} className="mb-1" />
                          <p className="text-sm font-bold truncate max-w-xs">{selectedFile ? selectedFile.name : 'إضغط لإختيار ملف المرفق'}</p>
                          <p className="text-[11px] opacity-70 mt-0.5">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'PDF, JPG, PNG, DOC (يتم الحفظ السحابي والمحلي تلقائياً)'}
                          </p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,image/*,.doc,.docx" onChange={handleFileChange} />
                      </label>
                      {selectedFile && (
                        <div className="flex items-center justify-between text-xs text-primary font-bold mt-2 px-3 py-2 bg-surface-container rounded-xl border border-outline-variant/30">
                          <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> 
                            <span className="truncate">{selectedFile.name}</span>
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              type="button" 
                              onClick={handlePreviewSelectedFile} 
                              className="px-2.5 py-1 bg-tertiary/15 hover:bg-tertiary hover:text-white text-tertiary rounded-lg font-black transition-all flex items-center gap-1"
                            >
                              <Eye size={13} />
                              معاينة ومراجعة
                            </button>
                            <button type="button" onClick={() => setSelectedFile(null)} className="text-error hover:underline text-xs">إلغاء</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="url" 
                        dir="ltr"
                        placeholder="https://drive.google.com/... أو https://www.joradp.dz/..."
                        value={newDoc.externalUrl} 
                        onChange={e => setNewDoc({...newDoc, externalUrl: e.target.value})} 
                        className="w-full bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left font-mono text-sm" 
                      />
                      <div className="flex items-center justify-between mt-1 px-1">
                        <p className="text-[11px] text-secondary">
                          يمكنك وضع رابط مباشر لموقع الجريدة الرسمية، وزارة التربية، أو مجلد Google Drive المشترك.
                        </p>
                        {newDoc.externalUrl && (
                          <button
                            type="button"
                            onClick={() => openPdfPreview({
                              url: newDoc.externalUrl,
                              title: newDoc.title || 'معاينة الرابط الخارجي',
                              category: getCategoryLabel(newDoc.category)
                            })}
                            className="text-xs text-tertiary font-bold hover:underline flex items-center gap-1 shrink-0"
                          >
                            <Eye size={12} />
                            معاينة
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-outline-variant/50 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="flex-1 py-4 bg-tertiary text-on-tertiary rounded-xl font-bold hover:bg-tertiary/90 flex items-center justify-center gap-2 shadow-md shadow-tertiary/20 disabled:opacity-70"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري حفظ ونشر الوثيقة...</span>
                      </div>
                    ) : (
                      <>
                        {isPublicScope ? <Globe size={20} /> : <Scale size={20} />}
                        <span>{isPublicScope ? 'نشر النص التشريعي العام (لكل المستخدمين)' : 'حفظ في أرشيف المؤسسة'}</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    disabled={isUploading}
                    className="px-8 py-4 bg-surface-container text-secondary rounded-xl font-bold hover:bg-outline-variant/30 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH MULTI-FILE UPLOAD MODAL */}
      <BatchLegislationUploadModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        schoolId={schoolId}
        isAdmin={isAdmin}
        onSuccess={(count) => {
          showNotification(
            `تم رفع وإضافة ${count} وثيقة بنجاح مع تعبئة وحفظ بياناتها تلقائياً في الأرشيف!`,
            'success'
          );
          fetchDocuments();
        }}
      />
    </div>
  );
}
