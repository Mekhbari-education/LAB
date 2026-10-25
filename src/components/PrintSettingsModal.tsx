import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Printer } from 'lucide-react';
import { usePrintSettings } from '../context/PrintSettingsContext';
import PrintSettingsTab from './settings/PrintSettingsTab';

export default function PrintSettingsModal() {
  const { isPrintSettingsModalOpen, closePrintSettingsModal } = usePrintSettings();

  if (!isPrintSettingsModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[115] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm rtl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-surface w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant/30 overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sliders size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary">لوحة إعدادات الطباعة الشاملة</h3>
                <p className="text-xs text-secondary/80">تخصيص الترويسة الوزارية، تخطيط الصفحات، التوقيعات، وأنماط الألوان</p>
              </div>
            </div>

            <button
              onClick={closePrintSettingsModal}
              className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary-container/40 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <PrintSettingsTab />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
