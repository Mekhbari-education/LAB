import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope, Construction } from 'lucide-react';
import { motion } from 'motion/react';

export default function VirtualMicroscope() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-surface rtl font-sans" dir="rtl">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-l from-green-500 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Microscope size={24} className="text-green-500" />
            المجهر الافتراضي
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-lowest">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full bg-surface p-12 rounded-[40px] shadow-sm border border-outline/10 text-center flex flex-col items-center relative overflow-hidden"
         >
           <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
           
           <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 relative">
              <Microscope size={48} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                 <Construction size={20} />
              </div>
           </div>

           <h2 className="text-2xl font-black text-on-surface mb-4">قيد التطوير</h2>
           <p className="text-on-surface-variant leading-relaxed mb-8">
             نقوم بتطوير أداة استكشاف مجهرية متقدمة لعلوم الأحياء مع دعم مختلف أنواع التكبير.
           </p>

           <button 
             onClick={() => navigate(-1)}
             className="px-8 py-4 bg-surface-container hover:bg-surface-container-high rounded-2xl font-bold text-on-surface transition-colors w-full"
           >
             العودة للرئيسية
           </button>
         </motion.div>
      </div>
    </div>
  );
}
