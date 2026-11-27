import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, X, Search } from 'lucide-react';
import { analyzeChemicalStorage, StorageAnalysisResult } from '../services/geminiService';
import { Chemical } from '../types/chemicals';
import { cn } from '../lib/utils';

interface ChemicalSafetyAuditModalProps {
  isOpen: boolean;
  chemicals: Chemical[];
  onClose: () => void;
  onFocusSearch?: (term: string) => void;
}

export function ChemicalSafetyAuditModal({
  isOpen,
  chemicals,
  onClose,
  onFocusSearch,
}: ChemicalSafetyAuditModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<StorageAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    try {
      const res = await analyzeChemicalStorage(chemicals);
      if (!res) {
        setErrorMsg('تعذر إتمام تحليل السلامة حالياً. يرجى المحاولة مجدداً.');
      } else {
        setResult(res);
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء تحليل التوافق الكيميائي.');
    } finally {
      setIsAnalyzing(false);
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
          className="relative bg-surface-container-lowest border border-outline/15 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">فحص التوافق والسلامة الكيميائية للرفوف</h3>
                <p className="text-xs font-bold text-secondary/70 mt-0.5 tabular-nums">
                  تحليل مواقع التخزين لـ {chemicals.length} مادة وكشف تعارض الأحماض، القواعد، المؤكسدات والمواد القابلة للاشتعال
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

          {!result && (
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <h4 className="text-sm font-black text-primary">تشغيل التدقيق الذكي للمخزن</h4>
                <p className="text-xs font-bold text-secondary/75">
                  سيتم فحص الرفوف الحالية وتصنيف المواد إلى مناطق تخزين متوافقة وفق معايير السلامة المخبرية.
                </p>
              </div>
              <button
                type="button"
                disabled={isAnalyzing || chemicals.length === 0}
                onClick={handleRunAudit}
                className="px-6 py-3 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{isAnalyzing ? 'جاري فحص المخزن...' : 'بدء فحص التوافق الآن'}</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline/10">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-secondary/75">التقييم العام لتنظيم المخزن</p>
                    <p className="text-lg font-black text-primary">
                      الدرجة التقديرية: {result.overallSafetyGrade}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAudit}
                  className="px-4 py-2 rounded-full border border-outline/20 text-xs font-black text-primary hover:bg-surface transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>إعادة الفحص</span>
                </button>
              </div>

              {/* Hazards */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-primary tabular-nums">
                  التنبيهات والتعارضات المكتشفة ({result.hazards.length})
                </h4>
                {result.hazards.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    لم يتم رصد تعارضات خطيرة بين المواد في مواقع التخزين الحالية.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {result.hazards.map((h, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-4 rounded-2xl border space-y-2',
                          h.severity === 'high'
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-black text-primary">
                            <AlertTriangle
                              size={15}
                              className={h.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}
                            />
                            <span>الموقع: {h.location || 'غير محدد'}</span>
                            <span className="text-secondary/60">·</span>
                            <span className={h.severity === 'high' ? 'text-rose-600' : 'text-amber-700 dark:text-amber-300'}>
                              {h.severity === 'high' ? 'خطورة عالية' : h.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </span>
                          </div>
                          {onFocusSearch && h.chemicalsInvolved[0] && (
                            <button
                              type="button"
                              onClick={() => {
                                onFocusSearch(h.chemicalsInvolved[0]);
                                onClose();
                              }}
                              className="text-[11px] font-black text-primary hover:underline flex items-center gap-1"
                            >
                              <Search size={12} />
                              <span>عرض في الجدول</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-bold text-secondary leading-relaxed">{h.reason}</p>
                        <p className="text-[11px] font-bold text-secondary/75">
                          المواد المعنية: {h.chemicalsInvolved.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ideal Storage Zones */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-primary tabular-nums">
                  مناطق التخزين المقترحة ({result.storageZones.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.storageZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-container-low border border-outline/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-sm font-black text-primary">{zone.zoneName}</h5>
                        <span className="text-[11px] font-black text-secondary/70 tabular-nums">
                          {zone.recommendedChemicals.length} مادة
                        </span>
                      </div>
                      <p className="text-xs font-bold text-secondary/80 leading-relaxed">{zone.description}</p>
                      <p className="text-[11px] font-bold text-secondary/65 line-clamp-2">
                        {zone.recommendedChemicals.join('، ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
