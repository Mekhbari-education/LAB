import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wand2 } from 'lucide-react';
import { Chemical } from '../types/chemicals';

interface ChemicalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSmartFill: () => void;
  isGenerating: boolean;
  newChemical: Partial<Chemical>;
  editingChemical: Chemical | null;
  onChange: (field: string, value: any) => void;
}

export function ChemicalAddModal({
  isOpen,
  onClose,
  onSubmit,
  onSmartFill,
  isGenerating,
  newChemical,
  editingChemical,
  onChange
}: ChemicalAddModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10"
        >
          <div className="p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-ee-[100px] -me-8 -mt-8"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                <Wand2 size={24} />
              </div>
              <h3 className="text-2xl font-black text-primary">
                {editingChemical ? 'تعديل بيانات المادة' : 'إضافة مادة كيميائية جديدة'}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="md:col-span-2 flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">PRODUIT CHIMIQUE</label>
                <input 
                  required
                  className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold"
                  value={newChemical.nameEn || ''}
                  onChange={e => onChange('nameEn', e.target.value)}
                />
              </div>
              <button 
                type="button"
                onClick={onSmartFill}
                disabled={isGenerating}
                className="bg-primary-container text-primary px-6 py-4 rounded-2xl flex items-center gap-2 font-black hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50 h-[58px]"
                title="تعبئة ذكية للمعلومات"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Wand2 size={20} />
                )}
                <span className="hidden md:inline">تعبئة ذكية</span>
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الاسم العربي</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                value={newChemical.nameAr || ''}
                onChange={e => onChange('nameAr', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الصيغة الكيميائية</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold"
                value={newChemical.formula || ''}
                onChange={e => onChange('formula', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">رقم CAS</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold"
                value={newChemical.casNumber || ''}
                onChange={e => onChange('casNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">درجة حرارة التخزين</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                value={newChemical.storageTemp || ''}
                onChange={e => onChange('storageTemp', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الحالة</label>
              <select 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start"
                value={newChemical.state || 'solid'}
                onChange={e => onChange('state', e.target.value)}
              >
                <option value="solid">صلب (Solid)</option>
                <option value="liquid">سائل (Liquid)</option>
                <option value="gas">غاز (Gas)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الكمية</label>
              <div className="flex gap-3">
                <input 
                  type="number"
                  required
                  className="flex-1 bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                  value={newChemical.quantity || 0}
                  onChange={e => onChange('quantity', Number(e.target.value))}
                />
                <select 
                  className="bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer"
                  value={newChemical.unit || 'g'}
                  onChange={e => onChange('unit', e.target.value)}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">تصنيف الخطورة</label>
              <select 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start"
                value={newChemical.hazardClass || 'safe'}
                onChange={e => onChange('hazardClass', e.target.value)}
              >
                <option value="safe">آمن</option>
                <option value="danger">خطر</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">GHS (فواصل بين الرموز)</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                placeholder="GHS01, GHS02..."
                value={newChemical.ghs?.join(', ') || ''}
                onChange={e => onChange('ghs', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الرف</label>
              <input 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                value={newChemical.shelf || ''}
                onChange={e => onChange('shelf', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">الصلاحية ⚠</label>
              <input 
                type="date"
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start"
                value={newChemical.expiryDate || ''}
                onChange={e => onChange('expiryDate', e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-secondary/60 uppercase tracking-widest ms-1">ملاحظات</label>
              <textarea 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold min-h-[100px] text-start"
                value={newChemical.notes || ''}
                onChange={e => onChange('notes', e.target.value)}
              />
            </div>
            <div className="md:col-span-2 pt-6">
              <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95">
                {editingChemical ? 'حفظ التعديلات' : 'تأكيد إضافة المادة للمخزن'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
