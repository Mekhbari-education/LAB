import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Trash2, X, FileText, Plus } from 'lucide-react';
import { parseChemicalsFromText, ParsedChemicalDraft } from '../services/geminiService';
import { Chemical } from '../types/chemicals';

interface ChemicalSmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Partial<Chemical>[]) => Promise<void>;
}

export function ChemicalSmartImportModal({
  isOpen,
  onClose,
  onImport,
}: ChemicalSmartImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useState<ParsedChemicalDraft[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setErrorMsg(null);
    setIsParsing(true);
    try {
      const parsed = await parseChemicalsFromText(rawText);
      if (!parsed || parsed.length === 0) {
        setErrorMsg('لم يتم العثور على مواد كيميائية واضحة في النص المدخل. جرّب صياغة أوضح.');
      } else {
        setDrafts(parsed);
      }
    } catch {
      setErrorMsg('تعذر تحليل النص حالياً. حاول مرة أخرى بعد قليل.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveDraft = (index: number) => {
    setDrafts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmImport = async () => {
    if (drafts.length === 0) return;
    setIsSaving(true);
    try {
      const payload: Partial<Chemical>[] = drafts.map(d => ({
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        formula: d.formula,
        casNumber: d.casNumber,
        quantity: Number(d.quantity) || 0,
        unit: d.unit || 'g',
        state: d.state || 'solid',
        hazardClass: d.hazardClass || 'safe',
        ghs: Array.isArray(d.ghs) ? d.ghs : [],
        storageTemp: d.storageTemp || '',
        shelf: d.shelf || '',
        expiryDate: '',
        notes: d.notes || '',
      }));
      await onImport(payload);
      setRawText('');
      setDrafts([]);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          dir="rtl"
          className="relative bg-surface-container-lowest border border-outline/15 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">استيراد ذكي من قائمة نصية أو فاتورة</h3>
                <p className="text-xs font-bold text-secondary/70 mt-0.5">
                  الصق قائمة طلبات أو وصل استلام (بالعربية أو الفرنسية أو الإنجليزية) وسيستخرج النظام كل مادة وصيغتها وخطورتها تلقائياً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-secondary/60 hover:text-primary hover:bg-surface-container-low transition-colors"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`مثال:\n- حمض الكلوريدريك HCl 500 ml خزانة A1\n- كبريتات النحاس المائية 250g\n- Sodium Hydroxide NaOH 1 kg`}
              className="w-full bg-surface-container-low border border-outline/15 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-secondary/70">
                يمكنك مراجعة المواد المستخرجة وتعديلها قبل الحفظ في المخزن
              </span>
              <button
                type="button"
                disabled={isParsing || !rawText.trim()}
                onClick={handleAnalyze}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {isParsing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>تحليل واستخراج المواد</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-primary tabular-nums">
                  المواد المستخرجة الجاهزة للإضافة ({drafts.length})
                </h4>
              </div>

              <div className="border border-outline/15 rounded-2xl overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-low text-secondary/75 font-black sticky top-0">
                    <tr>
                      <th className="p-3">المادة</th>
                      <th className="p-3">الصيغة</th>
                      <th className="p-3">الكمية</th>
                      <th className="p-3">الخطورة</th>
                      <th className="p-3">الرف</th>
                      <th className="p-3 text-center">إزالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10">
                    {drafts.map((d, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-3">
                          <div className="font-black text-primary">{d.nameAr || d.nameEn}</div>
                          <div className="text-[11px] text-secondary/70">{d.nameEn}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-secondary">{d.formula || '—'}</td>
                        <td className="p-3 font-black tabular-nums">
                          {d.quantity} {d.unit}
                        </td>
                        <td className="p-3 font-bold">
                          <span className={d.hazardClass === 'danger' ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}>
                            {d.hazardClass === 'danger' ? 'خطر' : 'آمن'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-secondary">{d.shelf || '—'}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDraft(i)}
                            className="p-1.5 rounded-lg text-secondary/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            aria-label="حذف من المعاينة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-outline/20 text-xs font-black text-secondary hover:bg-surface-container-low transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>إضافة {drafts.length} مادة إلى المخزن</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
