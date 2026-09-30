import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Files, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Sparkles, 
  Globe, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Scale, 
  FileSignature, 
  BookOpen, 
  Filter, 
  Calendar,
  Layers,
  ArrowRight,
  Check,
  RefreshCw
} from 'lucide-react';
import { db, getUserCollection, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { saveFileWithResilientFallback } from '../lib/fileStorage';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { LegislationDoc } from '../pages/SchoolLegislation';

export interface BatchItem {
  id: string;
  file: File;
  title: string;
  reference: string;
  date: string;
  category: LegislationDoc['category'];
  description: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  fileSizeFormatted: string;
}

interface BatchLegislationUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  schoolId?: string | null;
  isAdmin: boolean;
}

const CATEGORIES_LIST: { id: LegislationDoc['category']; label: string; icon: any }[] = [
  { id: 'circular_instruction', label: 'المناشير والتعليمات', icon: FileText },
  { id: 'law_order', label: 'الأوامر والقوانين', icon: Scale },
  { id: 'decree', label: 'المراسيم', icon: FileSignature },
  { id: 'special_law', label: 'القوانين الأساسية الخاصة', icon: BookOpen },
  { id: 'decision', label: 'القرارات', icon: Filter },
];

/**
 * Formats bytes to human readable string (KB / MB)
 */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Intelligent parser that extracts metadata (title, category, reference number, date, summary)
 * from file name and structure.
 */
export function parseLegislationFileInfo(file: File): Omit<BatchItem, 'id' | 'file' | 'status' | 'fileSizeFormatted'> {
  const originalName = file.name;
  // 1. Remove file extension
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').trim();

  // 2. Clean spaces and separators
  const cleanName = nameWithoutExt
    .replace(/[_\t]+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = cleanName.toLowerCase();

  // 3. Detect Category based on Algerian school legislation conventions
  let detectedCategory: LegislationDoc['category'] = 'circular_instruction';
  if (
    lower.includes('مرسوم') || 
    lower.includes('مراسيم') || 
    lower.includes('decret') || 
    lower.includes('décret')
  ) {
    detectedCategory = 'decree';
  } else if (
    lower.includes('قانون اساسي') || 
    lower.includes('قانون أساسي') || 
    lower.includes('خاص') || 
    lower.includes('statut')
  ) {
    detectedCategory = 'special_law';
  } else if (
    lower.includes('قرار') || 
    lower.includes('قرارات') || 
    lower.includes('arrete') || 
    lower.includes('arrêté') ||
    lower.includes('decision')
  ) {
    detectedCategory = 'decision';
  } else if (
    lower.includes('قانون') || 
    lower.includes('أمر') || 
    lower.includes('اوامر') || 
    lower.includes('loi') || 
    lower.includes('ordonnance')
  ) {
    detectedCategory = 'law_order';
  } else if (
    lower.includes('منشور') || 
    lower.includes('مناشير') || 
    lower.includes('تعليم') || 
    lower.includes('circulaire') || 
    lower.includes('instruction')
  ) {
    detectedCategory = 'circular_instruction';
  }

  // 4. Detect Reference Number (e.g. رقم 24-15, رقم 123, N° 08-315, 23-45)
  let reference = '';
  const refPattern = /(?:رقم|num[eé]ro|n[°o\.]?)\s*([0-9]+(?:\s*[-/]\s*[0-9]+)?)/i;
  const refMatch = cleanName.match(refPattern);
  if (refMatch) {
    reference = `رقم ${refMatch[1].replace(/\s+/g, '')}`;
  } else {
    // Check for pairs like "24-15" or "08-315"
    const dashNumMatch = cleanName.match(/\b([0-9]{2,4}\s*[-/]\s*[0-9]{1,4})\b/);
    if (dashNumMatch) {
      reference = `رقم ${dashNumMatch[1].replace(/\s+/g, '')}`;
    }
  }

  // 5. Detect Date
  let detectedDate = '';
  // Try YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = cleanName.match(/\b(19\d\d|20\d\d)[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    detectedDate = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  } else {
    // Try DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = cleanName.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](19\d\d|20\d\d)\b/);
    if (dmyMatch) {
      detectedDate = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    } else {
      // Try single Year like 2023 or 2024
      const yearMatch = cleanName.match(/\b(19\d\d|20[0-2]\d)\b/);
      if (yearMatch) {
        detectedDate = `${yearMatch[1]}-01-01`;
      } else {
        // Fallback: today's date
        detectedDate = new Date().toISOString().split('T')[0];
      }
    }
  }

  // 6. Clean Title
  // Strip leading numbering or bracket tags like "01 - " or "[PDF]"
  let title = cleanName
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^[0-9]+[\s.-]+/, '')
    .trim();

  if (!title) {
    title = nameWithoutExt;
  }

  // 7. Auto-generate informative summary/description
  const categoryLabels: Record<string, string> = {
    circular_instruction: 'منشور / تعليمة وزارية',
    law_order: 'أمر / قانون رسمي',
    decree: 'مرسوم تنفيذي أو رئاسي',
    special_law: 'قانون أساسي خاص',
    decision: 'قرار وزاري رسمي',
  };
  const catLabel = categoryLabels[detectedCategory] || 'وثيقة رسمية';
  const description = `${catLabel} ${reference ? `(${reference})` : ''} تم استخراجه وأرشفته رقمياً للمخابر المدرسية والحياة التربوية.`;

  return {
    title,
    reference,
    date: detectedDate,
    category: detectedCategory,
    description
  };
}

export default function BatchLegislationUploadModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  isAdmin
}: BatchLegislationUploadModalProps) {
  const { openPdfPreview } = usePdfPreview();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; currentName: string }>({
    current: 0,
    total: 0,
    currentName: ''
  });
  
  // Scope selector: admin can choose public vs school local
  const [isPublicScope, setIsPublicScope] = useState<boolean>(isAdmin);

  // Bulk actions helper states
  const [bulkCategory, setBulkCategory] = useState<LegislationDoc['category'] | ''>('');
  const [bulkDate, setBulkDate] = useState<string>('');

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newItems: BatchItem[] = fileArray.map((file, idx) => {
      const parsed = parseLegislationFileInfo(file);
      return {
        id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        fileSizeFormatted: formatBytes(file.size),
        status: 'pending',
        ...parsed
      };
    });

    setItems(prev => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const updateItem = (id: string, updates: Partial<BatchItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (items.length > 0 && window.confirm('هل تريد إلغاء وإفراغ قائمة الملفات المحددة؟')) {
      setItems([]);
    }
  };

  const applyBulkCategory = () => {
    if (!bulkCategory) return;
    setItems(prev => prev.map(item => ({ ...item, category: bulkCategory })));
  };

  const applyBulkDate = () => {
    if (!bulkDate) return;
    setItems(prev => prev.map(item => ({ ...item, date: bulkDate })));
  };

  const handleStartUpload = async () => {
    if (items.length === 0) return;

    // Validate that all items have at least title
    const invalidItems = items.filter(it => !it.title.trim());
    if (invalidItems.length > 0) {
      alert(`يرجى كتابة عنوان لجميع الملفات (${invalidItems.length} ملفات بدون عنوان)`);
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setUploadProgress({
        current: i + 1,
        total: items.length,
        currentName: item.title
      });

      // Update item status to uploading
      updateItem(item.id, { status: 'uploading' });

      try {
        // 1. Resilient File Storage upload (Cloud storage -> IndexedDB / Data URL fallback)
        const uploadResult = await saveFileWithResilientFallback(
          item.file,
          'uploads/legislation',
          3000
        );

        // 2. Add to Firestore collection (Public or School local)
        if (isPublicScope) {
          await addDoc(collection(db, 'public_legislation'), {
            title: item.title.trim(),
            reference: item.reference.trim(),
            date: item.date || '',
            category: item.category,
            description: item.description.trim(),
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
            storageType: uploadResult.storageType || null,
            isPublic: true,
            publishedBy: auth.currentUser?.email || 'الإدارة المركزية',
            publisherRole: 'مشرف عام (Admin)',
            createdAt: serverTimestamp()
          });
        } else {
          await addDoc(getUserCollection(schoolId, 'legislation'), {
            title: item.title.trim(),
            reference: item.reference.trim(),
            date: item.date || '',
            category: item.category,
            description: item.description.trim(),
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
            storageType: uploadResult.storageType || null,
            isPublic: false,
            publishedBy: auth.currentUser?.email || 'مسؤول المخبر',
            createdAt: serverTimestamp()
          });
        }

        updateItem(item.id, { status: 'completed' });
        successCount++;
      } catch (err: any) {
        console.error(`Failed uploading file ${item.title}:`, err);
        updateItem(item.id, { 
          status: 'error', 
          errorMessage: err.message || 'فشل رفع الملف أو حفظ بياناته' 
        });
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      setTimeout(() => {
        onSuccess(successCount);
        onClose();
      }, 800);
    }
  };

  const completedCount = items.filter(it => it.status === 'completed').length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-scrim/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-surface w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/15 text-tertiary flex items-center justify-center shadow-xs">
              <Files size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-black text-primary">رفع وإضافة عدة ملفات دفعة واحدة</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>تعبئة تلقائية للبيانات</span>
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                اختر أو اسحب ملفات PDF متعددة ليقوم النظام باستخراج وتعبئة العنوان، التصنيف، المرجع، والتاريخ آلياً مع إمكانية التعديل قبل الحفظ.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2.5 hover:bg-surface-container rounded-full text-secondary transition-colors disabled:opacity-50"
            title="إغلاق"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scope Selector: Public for all vs School local */}
          {isAdmin ? (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border-2 border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span>صلاحية المشرف العام: نطاق نشر هذه الحزمة من الوثائق</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  {isPublicScope ? 'نشر عام متاح للجميع' : 'خاص بالمؤسسة فقط'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsPublicScope(true)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-all ${
                    isPublicScope
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant/40'
                  }`}
                >
                  <Globe size={18} className={`shrink-0 mt-0.5 ${isPublicScope ? 'text-white' : 'text-emerald-600'}`} />
                  <div>
                    <span className="font-black text-xs block">نصوص رسمية عامة (متاحة لجميع المؤسسات بالجزائر)</span>
                    <span className="text-[10px] opacity-85 block mt-0.5">ستضاف فوراً للأرشيف الوطني ليراها جميع مستخدمي التطبيق</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsPublicScope(false)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-all ${
                    !isPublicScope
                      ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/30'
                      : 'bg-surface text-secondary hover:bg-surface-container border-outline-variant/40'
                  }`}
                >
                  <Building2 size={18} className={`shrink-0 mt-0.5 ${!isPublicScope ? 'text-white' : 'text-primary'}`} />
                  <div>
                    <span className="font-black text-xs block">خاص بأرشيف مؤسستي فقط</span>
                    <span className="text-[10px] opacity-85 block mt-0.5">تُحفظ داخل مجلد المؤسسة الحالية دون نشرها للعامة</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 flex items-center gap-3 text-xs text-secondary">
              <Building2 size={18} className="text-tertiary shrink-0" />
              <span>
                سيتم رفع وحفظ هذه الوثائق في <strong>أرشيف مؤسستك الخاص</strong>. لنشر نصوص رسمية عامة يرجى تسجيل الدخول بحساب المشرف العام.
              </span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              isDragOver
                ? 'border-primary bg-primary/10 scale-[0.99] shadow-inner'
                : 'border-outline-variant hover:border-tertiary hover:bg-surface-container-low bg-surface'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFilesSelected(e.target.files);
                  e.target.value = ''; // reset so same files can be re-selected if needed
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-3">
              <UploadCloud size={32} />
            </div>
            <h4 className="text-base md:text-lg font-black text-primary mb-1">
              اسحب وأفلت ملفات PDF هنا أو اضغط للاختيار من جهازك
            </h4>
            <p className="text-xs text-secondary max-w-md mx-auto">
              يمكنك تحديد عشرات الملفات مرة واحدة. يدعم ملفات PDF، الصور، ومستندات Word. يتم فحص كل ملف واستخراج عنوانه وتصنيفه وتاريخه تلقائياً.
            </p>
          </div>

          {/* Selected Files List & Auto-Filled Items */}
          {items.length > 0 && (
            <div className="space-y-4">
              {/* Batch Actions Toolbar */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-primary">قائمة الوثائق المجهزة:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-xs font-mono font-bold">
                    {items.length} ملف
                  </span>
                  {completedCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-xs font-bold">
                      تم رفع {completedCount} بنجاح
                    </span>
                  )}
                </div>

                {/* Bulk helpers */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Bulk Category apply */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-secondary font-medium">تصنيف موحد للكل:</span>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value as any)}
                      className="bg-surface px-2.5 py-1.5 rounded-xl border border-outline-variant text-xs outline-none"
                    >
                      <option value="">(اختر لتطبيقه على الكل)</option>
                      {CATEGORIES_LIST.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    {bulkCategory && (
                      <button
                        type="button"
                        onClick={applyBulkCategory}
                        className="px-2 py-1 bg-tertiary text-on-tertiary rounded-lg font-bold text-xs hover:bg-tertiary/90"
                      >
                        تطبيق
                      </button>
                    )}
                  </div>

                  {/* Add more files button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-surface hover:bg-surface-container border border-outline-variant rounded-xl text-xs font-bold text-primary flex items-center gap-1 transition-all"
                  >
                    <Files size={14} />
                    <span>إضافة ملفات أخرى</span>
                  </button>

                  {/* Clear all button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={clearAll}
                    className="px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-xl text-xs font-bold transition-all"
                  >
                    مسح القائمة
                  </button>
                </div>
              </div>

              {/* Upload Progress Bar if active */}
              {isUploading && (
                <div className="bg-surface-container p-4 rounded-2xl border border-primary/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-primary">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        جاري معالجة ورفع الوثيقة ({uploadProgress.current} من {uploadProgress.total}): {uploadProgress.currentName}
                      </span>
                    </div>
                    <span className="font-mono">{percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {items.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : item.status === 'uploading'
                          ? 'bg-primary/5 border-primary/40 shadow-xs'
                          : item.status === 'error'
                          ? 'bg-error/5 border-error/30'
                          : 'bg-surface-container-low/70 border-outline-variant/60 hover:border-outline'
                      }`}
                    >
                      {/* Top Bar of item: File info & status & actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-outline-variant/30">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-secondary truncate max-w-xs md:max-w-md" dir="ltr">
                            {item.file.name}
                          </span>
                          <span className="text-[11px] text-outline font-medium px-2 py-0.5 rounded-md bg-surface-container">
                            {item.fileSizeFormatted}
                          </span>
                          <span className="text-[10px] text-tertiary font-bold flex items-center gap-1 bg-tertiary/10 px-2 py-0.5 rounded-full">
                            <Sparkles size={11} />
                            معلومات مستخرجة آلياً
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Badge */}
                          {item.status === 'completed' && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-500/15 px-2.5 py-1 rounded-xl">
                              <CheckCircle2 size={14} />
                              تم الحفظ
                            </span>
                          )}
                          {item.status === 'uploading' && (
                            <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-xl">
                              <RefreshCw size={13} className="animate-spin" />
                              جاري الحفظ...
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-xs font-bold text-error flex items-center gap-1 bg-error/10 px-2.5 py-1 rounded-xl" title={item.errorMessage}>
                              <AlertCircle size={14} />
                              فشل الرفع
                            </span>
                          )}

                          {/* Preview PDF Button */}
                          <button
                            type="button"
                            onClick={() => openPdfPreview({
                              file: item.file,
                              title: item.title || item.file.name,
                              fileName: item.file.name
                            })}
                            className="px-2.5 py-1 bg-surface hover:bg-surface-container text-tertiary border border-outline-variant/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                            title="معاينة محتوى ملف PDF"
                          >
                            <Eye size={13} />
                            <span>معاينة PDF</span>
                          </button>

                          {/* Delete from batch button */}
                          {!isUploading && item.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-error/60 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                              title="حذف من القائمة"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Auto-filled & Editable Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Title field */}
                        <div className="md:col-span-6">
                          <label className="block text-[11px] font-bold text-primary mb-1">
                            عنوان النص التشريعي <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            disabled={isUploading || item.status === 'completed'}
                            value={item.title}
                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                            placeholder="مثال: المرسوم التنفيذي رقم..."
                            className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60"
                          />
                        </div>

                        {/* Category field */}
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-bold text-primary mb-1">
                            طبيعة النص <span className="text-error">*</span>
                          </label>
                          <select
                            disabled={isUploading || item.status === 'completed'}
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value as any })}
                            className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60"
                          >
                            {CATEGORIES_LIST.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Reference field */}
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-bold text-primary mb-1">
                            الرقم المرجعي
                          </label>
                          <input
                            type="text"
                            disabled={isUploading || item.status === 'completed'}
                            value={item.reference}
                            onChange={(e) => updateItem(item.id, { reference: e.target.value })}
                            placeholder="مثال: رقم 24-15"
                            className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60 text-left font-mono"
                            dir="ltr"
                          />
                        </div>

                        {/* Date field */}
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-bold text-primary mb-1">
                            تاريخ الإصدار / النشر
                          </label>
                          <input
                            type="date"
                            disabled={isUploading || item.status === 'completed'}
                            value={item.date}
                            onChange={(e) => updateItem(item.id, { date: e.target.value })}
                            className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60"
                          />
                        </div>

                        {/* Description field */}
                        <div className="md:col-span-9">
                          <label className="block text-[11px] font-bold text-primary mb-1">
                            خلاصة أو وصف للمحتوى
                          </label>
                          <input
                            type="text"
                            disabled={isUploading || item.status === 'completed'}
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            placeholder="اكتب خلاصة موجزة للموضوع..."
                            className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 md:p-6 bg-surface-container-low border-t border-outline-variant/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-secondary font-medium">
            {items.length === 0 ? (
              <span>قم بسحب واختيار الملفات للبدء في تجهيز القائمة وحفظها.</span>
            ) : (
              <span>
                إجمالي الملفات: <strong>{items.length}</strong> | الجاهزة للحفظ:{' '}
                <strong>{items.filter(it => it.status !== 'completed').length}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-6 py-3 bg-surface hover:bg-surface-container text-secondary rounded-xl text-xs font-bold border border-outline-variant/60 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isUploading || items.length === 0}
              onClick={handleStartUpload}
              className="px-8 py-3.5 bg-tertiary text-on-tertiary hover:bg-tertiary/90 rounded-xl text-xs font-black shadow-md shadow-tertiary/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري رفع وحفظ الحزمة ({percentage}%)...</span>
                </>
              ) : (
                <>
                  {isPublicScope ? <Globe size={16} /> : <UploadCloud size={16} />}
                  <span>
                    {isPublicScope
                      ? `نشر وحفظ جميع الملفات (${items.length} وثيقة عامة)`
                      : `حفظ جميع الملفات (${items.length} وثيقة في أرشيف المؤسسة)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
