import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wand2, 
  X, 
  FileText, 
  FileDown, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Share2, 
  Save, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileCode,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { formatSchoolWithCommune } from '../lib/utils';
import { 
  SmartAdminDocument, 
  SmartDocItem, 
  generateSmartAdminDocument, 
  generateFallbackSmartDocument,
  downloadSmartDocWord, 
  downloadSmartDocPdf, 
  copyToGoogleDocsClipboard,
  buildMarkdownOutput
} from '../services/smartDocService';
import { PDFService } from '../services/pdfService';
import { SavedAdminDoc } from '../pages/AdministrativeDocuments';

interface SmartDocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument?: (doc: SavedAdminDoc) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'طلب كواشف وزجاجيات لمخبر العلوم',
    icon: '🧪',
    prompt: 'أريد مراسلة داخلية رسمية من أستاذ مسؤول مخبر العلوم الطبيعية إلى مدير المؤسسة والمقتصد لطلب توفير كواشف كيميائية نقية وأواني زجاجية بيركس للأعمال التطبيقية للثلاثي الثاني.'
  },
  {
    title: 'طلب صيانة وإصلاح مجاهر ضوئية',
    icon: '🔬',
    prompt: 'طلب صيانة عاجل لأربعة مجاهر ضوئية ثنائية العينية وميزان إلكتروني دقيق معطلين في مخبر البيولوجيا والعلوم الطبيعية.'
  },
  {
    title: 'سند طلب أدوات الوقاية والسلامة',
    icon: '🦺',
    prompt: 'سند طلب مصلحي داخلي موجه للمصالح الاقتصادية لاقتناء نظارات واقية، قفازات نتريل، ومطافئ حريق بودرة لتأمين مخبر العلوم.'
  },
  {
    title: 'تجهيزات كهربائية لمخبر الفيزياء',
    icon: '⚡',
    prompt: 'طلب تزويد مخبر العلوم الفيزيائية بأجهزة قياس متعددة (Multimètre) ومولدات تيار مستمر قابلة للضبط 0-30V لدروس الكهرباء.'
  }
];

export default function SmartDocumentGeneratorModal({
  isOpen,
  onClose,
  onSaveDocument
}: SmartDocumentGeneratorModalProps) {
  const { schoolName, directorate, commune } = useSchool();
  const { openPdfPreview } = usePdfPreview();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'print' | 'markdown'>('editor');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedGDoc, setCopiedGDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active generated document
  const [doc, setDoc] = useState<SmartAdminDocument | null>(null);

  const schoolContext = {
    schoolName,
    directorate,
    commune,
    country: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    ministry: 'وزارة التربية الوطنية'
  };

  const formattedSchool = formatSchoolWithCommune(schoolName, commune) || 'المؤسسة التعليمية';

  // Initialize with a default template when opened
  useEffect(() => {
    if (isOpen && !doc) {
      const initial = generateFallbackSmartDocument('طلب كواشف وزجاجيات لمخبر العلوم', schoolContext);
      setDoc(initial);
      setPrompt('طلب توفير كواشف كيميائية وزجاجيات مخبرية للأعمال التطبيقية للفصل الدراسي الجاري.');
    }
  }, [isOpen]);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Generate with AI
  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateSmartAdminDocument(textToUse, schoolContext);
      setDoc(generated);
      showNotification('تم توليد المراسلة وسند الطلب المصلحي الذكي بنجاح وفق المعايير الرسمية!', 'success');
    } catch (err) {
      console.error('Error generating smart document:', err);
      showNotification('حدث خطأ أثناء التوليد، تم الاعتماد على النموذج التلقائي المقنن.', 'info');
      const fallback = generateFallbackSmartDocument(textToUse, schoolContext);
      setDoc(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit Handlers
  const handleUpdateField = <K extends keyof SmartAdminDocument>(key: K, value: SmartAdminDocument[K]) => {
    if (!doc) return;
    const updated = { ...doc, [key]: value };
    updated.markdownPreview = buildMarkdownOutput(updated, schoolContext);
    setDoc(updated);
  };

  const handleUpdateItem = (index: number, field: keyof SmartDocItem, value: string) => {
    if (!doc) return;
    const newItems = [...doc.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleUpdateField('items', newItems);
  };

  const handleAddItem = () => {
    if (!doc) return;
    const nextNum = (doc.items.length + 1).toString().padStart(2, '0');
    const newItem: SmartDocItem = {
      id: `item_${Date.now()}`,
      itemNumber: nextNum,
      designation: '',
      referenceOrSpecs: '',
      unit: 'قطعة',
      quantity: '01',
      purposeOrNotes: ''
    };
    handleUpdateField('items', [...doc.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (!doc) return;
    const newItems = doc.items.filter((_, i) => i !== index);
    handleUpdateField('items', newItems);
  };

  // Google Docs Copy & Open
  const handleGoogleDocs = async () => {
    if (!doc) return;
    const success = await copyToGoogleDocsClipboard(doc, schoolContext);
    if (success) {
      setCopiedGDoc(true);
      showNotification('تم نسخ التنسيق والجداول بنجاح! الصق في Google Docs (Ctrl+V)', 'success');
      setTimeout(() => setCopiedGDoc(false), 3000);
    }
  };

  // Copy Markdown
  const handleCopyMarkdown = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(doc.markdownPreview);
    setCopiedMarkdown(true);
    showNotification('تم نسخ نص الـ Markdown بالكامل للحافظة', 'success');
    setTimeout(() => setCopiedMarkdown(false), 3000);
  };

  // Download Word (.doc)
  const handleDownloadWord = () => {
    if (!doc) return;
    downloadSmartDocWord(doc, schoolContext);
    showNotification(`تم تنزيل ملف Word (.doc) بنجاح مطابق تماماً للـ PDF!`, 'success');
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!doc) return;
    try {
      await downloadSmartDocPdf(doc, schoolContext);
      showNotification(`تم تنزيل ملف PDF بنجاح!`, 'success');
    } catch (e) {
      console.error('PDF error:', e);
      showNotification('حدث خطأ أثناء تنزيل PDF', 'error');
    }
  };

  // Interactive PDF Preview
  const handlePreviewPdf = async () => {
    if (!doc) return;
    try {
      const blob = await PDFService.generateAdministrativeDocumentPDF({
        title: doc.title,
        reference: doc.referenceCode,
        category: 'سند طلب مصلحي',
        date: doc.date,
        sender: doc.department,
        recipient: doc.recipient,
        subject: doc.subject,
        content: doc.contextAndPurpose,
        notes: doc.notes,
        hasTable: true,
        tableHeaders: ['الرقم', 'تعيين المادة / الوسيلة', 'المرجع والمواصفات', 'الكمية / الوحدة'],
        tableRows: doc.items.map(it => [
          it.itemNumber,
          it.designation,
          it.referenceOrSpecs,
          `${it.quantity} ${it.unit}`
        ]),
        signers: doc.signers,
        schoolInfo: {
          country: schoolContext.country,
          ministry: schoolContext.ministry,
          directorate: schoolContext.directorate,
          school: formattedSchool,
          commune: schoolContext.commune
        },
        fileName: `${doc.title}.pdf`,
        save: false
      });
      openPdfPreview({
        file: blob,
        title: doc.title,
        fileName: `${doc.title}.pdf`,
        category: 'سند طلب مصلحي',
        description: doc.subject
      });
    } catch (e) {
      console.error('Preview error:', e);
    }
  };

  // Save to Archive
  const handleSaveToArchive = () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const savedItem: SavedAdminDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        templateId: 'smart_generator',
        title: doc.title,
        category: 'requests',
        date: doc.date,
        reference: doc.referenceCode,
        sender: doc.department,
        recipient: doc.recipient,
        subject: doc.subject,
        content: doc.contextAndPurpose,
        notes: doc.notes,
        rows: doc.items.map(it => ({
          col1: it.itemNumber,
          col2: it.designation,
          col3: `${it.quantity} ${it.unit}`,
          col4: `${it.referenceOrSpecs} — ${it.purposeOrNotes}`
        })),
        signers: doc.signers,
        createdAt: new Date().toISOString()
      };

      if (onSaveDocument) {
        onSaveDocument(savedItem);
      }
      showNotification('تم حفظ الوثيقة بنجاح في أرشيف وثائقك الإدارية!', 'success');
    } catch (err) {
      console.error('Save error:', err);
      showNotification('حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md rtl overflow-hidden" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-surface w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant/40 overflow-hidden"
      >
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 ${
                notification.type === 'success' 
                  ? 'bg-emerald-600 text-white' 
                  : notification.type === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-primary text-white'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <header className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-primary">المولّد الذكي للوثائق والمراسلات الداخلية</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-black border border-primary/20">
                  AI Smart Document Generator
                </span>
              </div>
              <p className="text-xs text-secondary opacity-80">
                تحويل الطلبات العادية إلى مراسلات وسندات طلب مصلحية رسمية مع إمكانية التعديل الكامل والربط بـ Google Docs و Word
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* AI Prompt Input Bar */}
        <section className="p-4 bg-surface-container-lowest border-b border-outline-variant/30 shrink-0">
          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                placeholder="اكتب فكرة أو طلبك باللغة الطبيعية (مثال: نحتاج توفير كواشف كيميائية لمخبر العلوم مع أنابيب وموازين للثلاثي الثاني)..."
                className="w-full bg-surface border-2 border-outline-variant/50 focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none transition-all pl-10"
              />
              <Wand2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-700 hover:from-primary/90 hover:to-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الصياغة الذكية...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>توليد الوثيقة بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 no-scrollbar">
            <span className="text-[11px] font-black text-secondary shrink-0 ml-1">نماذج سريعة:</span>
            {PRESET_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(p.prompt);
                  handleGenerate(p.prompt);
                }}
                disabled={isGenerating}
                className="px-3 py-1 rounded-xl bg-surface hover:bg-primary/10 border border-outline-variant/30 text-xs font-bold text-secondary hover:text-primary transition-all whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <span>{p.icon}</span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* View Switcher Tabs */}
        <div className="px-6 pt-3 pb-2 bg-surface-container flex items-center justify-between border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-2xl border border-outline-variant/30">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Edit3 size={15} />
              <span>وضع التعديل الحي (متاح للتعديل)</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'print'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Eye size={15} />
              <span>المعاينة الرسمية الجاهزة للطباعة</span>
            </button>

            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'markdown'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <FileCode size={15} />
              <span>معاينة Markdown</span>
            </button>
          </div>

          {/* Quick Stats or Active doc info */}
          {doc && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-secondary">
              <span className="px-2 py-0.5 rounded-lg bg-surface border border-outline-variant/30 font-mono">
                {doc.items.length} مواد
              </span>
              <span>•</span>
              <span className="text-primary truncate max-w-[220px]">{doc.title}</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-lowest custom-scrollbar">
          {!doc ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60">
              <Wand2 size={48} className="text-primary mb-3" />
              <p className="text-base font-bold">قم بإدخال نص الطلب أو اختيار نموذج سريع لبدء التوليد</p>
            </div>
          ) : activeTab === 'editor' ? (
            /* ================= EDITABLE MODE (إمكانية التعديل الكاملة) ================= */
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header Details Card */}
              <div className="p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <h3 className="font-black text-primary text-base flex items-center gap-2">
                    <Building2 size={18} />
                    <span>الترويسة والمعلومات الإدارية (قابلة للتعديل)</span>
                  </h3>
                  <span className="text-xs text-secondary">
                    {formattedSchool} — {directorate}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">عنوان الوثيقة / السند</label>
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => handleUpdateField('title', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">المصلحة أو القسم الطالب</label>
                    <input
                      type="text"
                      value={doc.department}
                      onChange={(e) => handleUpdateField('department', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">الجهة الموجه إليها (المستلم)</label>
                    <input
                      type="text"
                      value={doc.recipient}
                      onChange={(e) => handleUpdateField('recipient', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">المرجع الإداري / الترقيم</label>
                    <input
                      type="text"
                      value={doc.referenceCode}
                      onChange={(e) => handleUpdateField('referenceCode', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">تاريخ التحرير</label>
                    <input
                      type="date"
                      value={doc.date}
                      onChange={(e) => handleUpdateField('date', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-secondary mb-1">السنة الدراسية</label>
                    <input
                      type="text"
                      value={doc.academicYear}
                      onChange={(e) => handleUpdateField('academicYear', e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-secondary mb-1">الموضوع (Objet)</label>
                  <input
                    type="text"
                    value={doc.subject}
                    onChange={(e) => handleUpdateField('subject', e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-black text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-secondary mb-1">نص الديباجة والسياق الإداري</label>
                  <textarea
                    rows={3}
                    value={doc.contextAndPurpose}
                    onChange={(e) => handleUpdateField('contextAndPurpose', e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 text-sm font-medium text-on-surface leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Items Table Card */}
              <div className="p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <div>
                    <h3 className="font-black text-primary text-base flex items-center gap-2">
                      <FileSpreadsheet size={18} />
                      <span>جدول المواد والتجهيزات المطلوبة ({doc.items.length} بنود)</span>
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      يمكنك تعديل أي خانة مباشرة أو إضافة وحذف بنود حسب الحاجة الميدانية
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-black flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} />
                    <span>إضافة مادة / بند +</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-outline-variant/30 rounded-2xl">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container-high text-secondary font-black border-b border-outline-variant/30">
                        <th className="p-2.5 text-center w-12">الرقم</th>
                        <th className="p-2.5">تعيين المادة أو الوسيلة</th>
                        <th className="p-2.5 w-48">المرجع والمواصفات الفنية</th>
                        <th className="p-2.5 text-center w-24">الوحدة</th>
                        <th className="p-2.5 text-center w-24">الكمية</th>
                        <th className="p-2.5">البيان / الغرض البيداغوجي</th>
                        <th className="p-2.5 text-center w-12">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {doc.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-primary/[0.02]">
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={item.itemNumber}
                              onChange={(e) => handleUpdateItem(idx, 'itemNumber', e.target.value)}
                              className="w-10 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1 text-xs font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.designation}
                              onChange={(e) => handleUpdateItem(idx, 'designation', e.target.value)}
                              placeholder="اسم المادة أو العتاد..."
                              className="w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-bold text-primary"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.referenceOrSpecs}
                              onChange={(e) => handleUpdateItem(idx, 'referenceOrSpecs', e.target.value)}
                              placeholder="مواصفات / مرجع..."
                              className="w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                              className="w-16 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                              className="w-16 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-black text-emerald-700"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.purposeOrNotes}
                              onChange={(e) => handleUpdateItem(idx, 'purposeOrNotes', e.target.value)}
                              placeholder="الغرض البيداغوجي / ملاحظة..."
                              className="w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 hover:bg-rose-500/10 text-rose-600 rounded-lg transition-colors"
                              title="حذف البند"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & Approvals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-3">
                  <h4 className="font-black text-primary text-sm flex items-center gap-1.5">
                    <AlertCircle size={16} />
                    <span>ملاحظات وتوجيهات تنظيمية</span>
                  </h4>
                  <textarea
                    rows={3}
                    value={doc.notes}
                    onChange={(e) => handleUpdateField('notes', e.target.value)}
                    placeholder="أدخل أي ملاحظات استعجالية أو إدارية..."
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 text-xs font-medium resize-none"
                  />
                </div>

                <div className="p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-3">
                  <h4 className="font-black text-primary text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>الموقعون والتأشيرات الإدارية</span>
                  </h4>
                  <div className="space-y-2">
                    {doc.signers.map((sig, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={sig}
                        onChange={(e) => {
                          const newSig = [...doc.signers];
                          newSig[idx] = e.target.value;
                          handleUpdateField('signers', newSig);
                        }}
                        className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-1.5 text-xs font-bold"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'print' ? (
            /* ================= READY TO PRINT PREVIEW ================= */
            <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 font-sans print:p-0 print:border-none print:shadow-none">
              {/* Official Algerian Republic Header */}
              <div className="text-center mb-6">
                <p className="font-bold text-base text-slate-800">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="font-bold text-sm text-slate-600">وزارة التربية الوطنية</p>
              </div>

              {/* Meta Info */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4 mb-6 text-sm font-bold">
                <div className="space-y-1">
                  <p>{directorate || 'مديرية التربية الوطنية'}</p>
                  <p>{formattedSchool}</p>
                  <p className="text-emerald-800 font-black">السنة الدراسية: {doc.academicYear}</p>
                </div>
                <div className="text-left space-y-1" dir="ltr">
                  <p>التاريخ: {doc.date}</p>
                  <p className="font-mono">المرجع: {doc.referenceCode}</p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="border-2 border-emerald-800 bg-emerald-50 text-center py-2.5 px-4 rounded-xl mb-6 shadow-xs">
                <h1 className="text-xl sm:text-2xl font-black text-emerald-900">{doc.title}</h1>
              </div>

              {/* Dept and Subject Box */}
              <div className="border border-slate-300 bg-slate-50 p-4 rounded-xl mb-6 text-sm space-y-2">
                <p><span className="font-black text-slate-700">المصلحة / القسم الطالب:</span> <span className="font-bold">{doc.department}</span></p>
                <p><span className="font-black text-slate-700">إلى السيد:</span> <span className="font-bold">{doc.recipient}</span></p>
                <p className="text-emerald-800 font-black"><span className="text-slate-700">الموضوع:</span> {doc.subject}</p>
              </div>

              {/* Context Text */}
              <div className="text-justify text-sm leading-relaxed mb-6 font-medium text-slate-800">
                {doc.contextAndPurpose}
              </div>

              {/* Items Table */}
              <div className="mb-6 overflow-hidden rounded-xl border border-emerald-800">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-black">
                      <th className="p-2.5 text-center w-12 border-l border-emerald-700">الرقم</th>
                      <th className="p-2.5 border-l border-emerald-700">تعيين المادة أو الوسيلة</th>
                      <th className="p-2.5 border-l border-emerald-700 w-44">المرجع والمواصفات</th>
                      <th className="p-2.5 text-center w-16 border-l border-emerald-700">الوحدة</th>
                      <th className="p-2.5 text-center w-16 border-l border-emerald-700">الكمية</th>
                      <th className="p-2.5">البيان / الغرض البيداغوجي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doc.items.map((it, idx) => (
                      <tr key={it.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 text-center font-bold border-l border-slate-200">{it.itemNumber}</td>
                        <td className="p-2 font-bold text-slate-900 border-l border-slate-200">{it.designation}</td>
                        <td className="p-2 text-slate-600 border-l border-slate-200">{it.referenceOrSpecs}</td>
                        <td className="p-2 text-center border-l border-slate-200">{it.unit}</td>
                        <td className="p-2 text-center font-black text-emerald-800 border-l border-slate-200">{it.quantity}</td>
                        <td className="p-2 text-slate-700">{it.purposeOrNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {doc.notes && (
                <div className="border-r-4 border-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-bold text-amber-900 mb-6">
                  <strong>ملاحظة هامة:</strong> {doc.notes}
                </div>
              )}

              {/* Approval Checkboxes */}
              <div className="border border-dashed border-emerald-700 bg-emerald-50/50 p-4 rounded-xl text-xs font-bold text-slate-800 mb-8">
                <p className="font-black text-emerald-900 mb-2">تأشيرة وموافقة إدارة المؤسسة:</p>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-emerald-700 w-4 h-4" />
                    <span>مقبول ومعتمد للتنفيذ الفوري</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-emerald-700 w-4 h-4" />
                    <span>مؤجل للاعتماد المالي القادم</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-emerald-700 w-4 h-4" />
                    <span>مرفوض مع التعليل المرفق</span>
                  </label>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center">
                {doc.signers.map((sig, i) => (
                  <div key={i} className="space-y-12">
                    <p className="font-black text-xs text-slate-800 border-t border-slate-400 pt-2">{sig}</p>
                    <p className="text-[10px] text-slate-400 font-bold">(الاسم، التوقيع والختم الرسمي)</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ================= MARKDOWN OUTPUT ================= */
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-outline-variant/30">
                <span className="text-xs font-black text-secondary">
                  معاينة وثيقة Markdown الرسمية (قابلة للنسخ والطباعة الفورية)
                </span>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedMarkdown ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedMarkdown ? 'تم النسخ!' : 'نسخ Markdown'}</span>
                </button>
              </div>

              <div className="bg-surface rounded-2xl p-6 border border-outline-variant/40 font-mono text-xs leading-relaxed text-on-surface whitespace-pre-wrap select-all overflow-x-auto shadow-inner" dir="rtl">
                {doc.markdownPreview}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions and Official Google Doc Chip */}
        <footer className="p-4 bg-surface-container border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Official Google Doc Chip Link */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoogleDocs}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              title="فتح Google Docs ونسخ التنسيق تلقائياً (الصق Ctrl+V داخل المستند)"
            >
              <ExternalLink size={15} />
              <span>{copiedGDoc ? 'تم نسخ التنسيق! جاري الفتح...' : '📎 فتح في Google Docs مع نسخ التنسيق'}</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadWord}
              className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title="تنزيل ملف Word (.doc) رسمي بنفس تفاصيل وهيئة الـ PDF"
            >
              <FileDown size={15} />
              <span>تنزيل Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title="تنزيل كملف PDF رسمي"
            >
              <Download size={15} />
              <span>تنزيل PDF (.pdf)</span>
            </button>

            <button
              type="button"
              onClick={handlePreviewPdf}
              className="px-3 py-2.5 bg-surface text-secondary hover:text-primary border border-outline-variant/40 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
              title="معاينة ملف PDF بملء الشاشة"
            >
              <Eye size={15} />
              <span>معاينة PDF</span>
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToArchive}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              title="حفظ في الأرشيف الشخصي للوثائق الإدارية"
            >
              <Save size={15} />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ في الأرشيف'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-bold text-xs transition-colors"
            >
              إغلاق
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
