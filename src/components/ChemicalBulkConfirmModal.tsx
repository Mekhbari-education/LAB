import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Layers, ListChecks, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type BulkUpdateScope = 'missing' | 'all' | 'selected';

export interface BulkSmartUpdateOptions {
  scope: BulkUpdateScope;
  overwriteExisting: boolean;
}

interface CustomBulkConfirmModalProps {
  isOpen: boolean;
  chemicalsLength: number;
  missingCount: number;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (options: BulkSmartUpdateOptions) => void;
}

export function ChemicalBulkConfirmModal({
  isOpen,
  chemicalsLength,
  missingCount,
  selectedCount,
  onClose,
  onConfirm,
}: CustomBulkConfirmModalProps) {
  const [scope, setScope] = useState<BulkUpdateScope>(
    selectedCount > 0 ? 'selected' : missingCount > 0 ? 'missing' : 'all'
  );
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedCount > 0) {
        setScope('selected');
      } else if (missingCount > 0) {
        setScope('missing');
      } else {
        setScope('all');
      }
      setOverwriteExisting(false);
    }
  }, [isOpen, selectedCount, missingCount]);

  if (!isOpen) return null;

  const targetCount =
    scope === 'selected' ? selectedCount : scope === 'missing' ? missingCount : chemicalsLength;

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
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          dir="rtl"
          className="relative bg-surface-container-lowest rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline/15 text-right space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary tracking-tight">تحديث ذكي للقائمة</h3>
                <p className="text-xs font-bold text-secondary/70 mt-0.5">
                  معالجة سريعة بالدفعات لإكمال الصيغ الكيميائية، CAS، رموز GHS وملاحظات السلامة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-secondary/60 hover:text-primary hover:bg-surface-container-low transition-colors"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => setScope('selected')}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-2xl border text-right transition-all',
                  scope === 'selected'
                    ? 'bg-primary/8 border-primary text-primary shadow-sm'
                    : 'bg-surface-container-low/60 border-outline/10 text-secondary hover:border-outline/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <ListChecks size={18} className="shrink-0" />
                  <div>
                    <p className="text-sm font-black">تحديث المواد المحددة فقط</p>
                    <p className="text-[11px] font-bold opacity-75">تشغيل التحديث على الصفوف المختارة في الجدول</p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-surface border border-outline/10 tabular-nums">
                  {selectedCount}
                </span>
              </button>
            )}

            <button
              type="button"
              disabled={missingCount === 0}
              onClick={() => setScope('missing')}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-2xl border text-right transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                scope === 'missing'
                  ? 'bg-primary/8 border-primary text-primary shadow-sm'
                  : 'bg-surface-container-low/60 border-outline/10 text-secondary hover:border-outline/30'
              )}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <div>
                  <p className="text-sm font-black">إكمال المواد ذات البيانات الناقصة فقط</p>
                  <p className="text-[11px] font-bold opacity-75">
                    {missingCount > 0
                      ? 'تستهدف فقط المواد التي تنقصها الصيغة أو CAS أو حرارة التخزين أو السلامة'
                      : 'جميع المواد في القائمة مكتملة البيانات الأساسية'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-surface border border-outline/10 tabular-nums">
                {missingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScope('all')}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-2xl border text-right transition-all',
                scope === 'all'
                  ? 'bg-primary/8 border-primary text-primary shadow-sm'
                  : 'bg-surface-container-low/60 border-outline/10 text-secondary hover:border-outline/30'
              )}
            >
              <div className="flex items-center gap-3">
                <Layers size={18} className="shrink-0" />
                <div>
                  <p className="text-sm font-black">تحديث جميع المواد في القائمة</p>
                  <p className="text-[11px] font-bold opacity-75">مراجعة وتحديث كافة السجلات دفعة واحدة</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-surface border border-outline/10 tabular-nums">
                {chemicalsLength}
              </span>
            </button>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline/10 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="block text-xs font-black text-primary">
                استبدال البيانات المعبأة مسبقاً أيضاً
              </span>
              <span className="block text-[11px] font-bold text-secondary/70">
                عند إلغاء التحديد، يتم ملء الحقول الفارغة فقط دون المساس بملاحظاتك أو تواريخك الحالية. (الكمية والوحدة والرف لا تتغير أبداً).
              </span>
            </div>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              disabled={targetCount === 0}
              onClick={() => onConfirm({ scope, overwriteExisting })}
              className="flex-1 bg-primary text-on-primary py-3.5 px-5 rounded-full font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>بدء التحديث الذكي ({targetCount})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-surface border border-outline/20 text-secondary py-3.5 rounded-full font-black text-sm hover:bg-surface-container-high transition-all active:scale-95"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
