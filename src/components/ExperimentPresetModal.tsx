import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Search, 
  X, 
  Plus, 
  Check, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Filter, 
  Atom, 
  Dna,
  ArrowRight
} from 'lucide-react';
import { LAB_EXPERIMENT_PRESETS, ExperimentPreset } from '../data/labExperimentPresets';
import { cn } from '../lib/utils';

interface ExperimentPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: ExperimentPreset) => void;
  onAddNewRow?: (preset: ExperimentPreset) => void;
  targetRowNumber?: number | null;
}

export default function ExperimentPresetModal({
  isOpen,
  onClose,
  onSelect,
  onAddNewRow,
  targetRowNumber
}: ExperimentPresetModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'علوم فيزيائية' | 'علوم طبيعية'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredPresets = useMemo(() => {
    return LAB_EXPERIMENT_PRESETS.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.level.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
      const matchesType = selectedType === 'all' || p.activityType === selectedType;

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [searchTerm, selectedSubject, selectedType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 no-print" dir="rtl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface w-full max-w-4xl max-h-[90vh] rounded-[36px] overflow-hidden shadow-2xl border border-outline/10 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-surface-container-low/50 border-b border-outline/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <FlaskConical size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary flex items-center gap-2">
                  بنك التجارب والأنشطة المخبرية
                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    المنهاج الجزائري
                  </span>
                </h3>
                <p className="text-sm font-bold text-secondary mt-1">
                  {targetRowNumber !== null && targetRowNumber !== undefined 
                    ? `اختر التجربة لتعبئة بيانات السطر رقم (${targetRowNumber}) فوراً` 
                    : 'اختر تجربة نموذجية لإدراج تفاصيلها وموادها مباشرة في التقرير اليومي'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-secondary hover:text-primary hover:bg-surface-container-high rounded-full transition-all"
            >
              <X size={22} />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-6 border-b border-outline/5 space-y-4 bg-surface">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <input 
                  type="text"
                  placeholder="ابحث باسم التجربة أو الأداة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low/50 border border-outline/10 rounded-2xl pr-11 pl-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition-all text-primary"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary"
                  >
                    مسح
                  </button>
                )}
              </div>

              {/* Subject Filters */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                    selectedSubject === 'all' 
                      ? "bg-primary text-on-primary shadow-sm" 
                      : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
                  )}
                >
                  <Layers size={14} />
                  كل المواد ({LAB_EXPERIMENT_PRESETS.length})
                </button>
                <button
                  onClick={() => setSelectedSubject('علوم فيزيائية')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                    selectedSubject === 'علوم فيزيائية' 
                      ? "bg-amber-600 text-white shadow-sm" 
                      : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
                  )}
                >
                  <Atom size={14} />
                  علوم فيزيائية (فيزياء وكيمياء)
                </button>
                <button
                  onClick={() => setSelectedSubject('علوم طبيعية')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                    selectedSubject === 'علوم طبيعية' 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
                  )}
                >
                  <Dna size={14} />
                  علوم الطبيعة والحياة
                </button>
              </div>
            </div>

            {/* Activity Type filter chips */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-secondary flex items-center gap-1">
                <Filter size={13} />
                النوع:
              </span>
              {['all', 'عملي', 'محاكاة', 'EXAO'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    selectedType === t 
                      ? "bg-primary/15 text-primary font-black border border-primary/20" 
                      : "text-secondary hover:text-primary hover:bg-surface-container-low"
                  )}
                >
                  {t === 'all' ? 'الكل' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Experiments List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4 max-h-[55vh]">
            {filteredPresets.length === 0 ? (
              <div className="text-center py-16">
                <FlaskConical size={48} className="mx-auto text-primary/20 mb-3" />
                <p className="text-primary font-bold">لا توجد تجارب تطابق البحث المختار</p>
                <p className="text-xs text-secondary mt-1">جرّب استخدام كلمات مفتاحية أخرى أو تغيير خيارات التصفية</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPresets.map((preset) => (
                  <motion.div
                    key={preset.id}
                    layout
                    className="bg-surface-container-low/40 hover:bg-surface-container-low border border-outline/10 hover:border-primary/30 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={cn(
                          "text-[11px] font-black px-2.5 py-1 rounded-lg",
                          preset.subject === 'علوم فيزيائية' 
                            ? "bg-amber-500/10 text-amber-700" 
                            : "bg-emerald-500/10 text-emerald-700"
                        )}>
                          {preset.subject}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                            {preset.activityType}
                          </span>
                          <span className="text-[10px] font-bold bg-surface-container-high text-secondary px-2 py-0.5 rounded-md">
                            {preset.level}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-black text-primary mb-2.5 leading-snug">
                        {preset.title}
                      </h4>

                      {/* Equipment */}
                      <div className="bg-surface p-3 rounded-xl border border-outline/5 mb-3 text-xs text-secondary space-y-1">
                        <p className="font-bold text-primary/70 text-[11px]">الأدوات والمواد المقترحة:</p>
                        <p className="leading-relaxed line-clamp-2">{preset.equipment}</p>
                      </div>

                      {/* Notes */}
                      {preset.notes && (
                        <p className="text-[11px] font-bold text-primary/60 italic leading-relaxed mb-4">
                          💡 {preset.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-outline/5 mt-auto">
                      <button
                        onClick={() => onSelect(preset)}
                        className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                      >
                        <Check size={14} />
                        {targetRowNumber ? `تطبيق على السطر ${targetRowNumber}` : 'تطبيق على السطر'}
                      </button>
                      {onAddNewRow && (
                        <button
                          onClick={() => onAddNewRow(preset)}
                          className="py-2.5 px-3 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                          title="إضافة كسطر إضافي جديد"
                        >
                          <Plus size={14} />
                          سطر جديد
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-surface-container-low/30 border-t border-outline/10 text-center text-xs font-bold text-secondary flex justify-between items-center px-8">
            <span>إجمالي التجارب الجاهزة: {filteredPresets.length} من {LAB_EXPERIMENT_PRESETS.length}</span>
            <button 
              onClick={onClose}
              className="text-xs font-black text-primary hover:underline"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
