import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Download, Settings, RefreshCw, Printer } from 'lucide-react';

const EASY_EQUATIONS = [
  { eq: "H2 + O2 -> H2O", ans: "2,1,2" },
  { eq: "N2 + H2 -> NH3", ans: "1,3,2" },
  { eq: "C + O2 -> CO2", ans: "1,1,1" },
  { eq: "Mg + O2 -> MgO", ans: "2,1,2" }
];

const MEDIUM_EQUATIONS = [
  { eq: "Al + O2 -> Al2O3", ans: "4,3,2" },
  { eq: "Fe + O2 -> Fe2O3", ans: "4,3,2" },
  { eq: "CH4 + O2 -> CO2 + H2O", ans: "1,2,1,2" },
  { eq: "C3H8 + O2 -> CO2 + H2O", ans: "1,5,3,4" }
];

export default function WorksheetGenerator() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount] = useState(5);
  const [worksheet, setWorksheet] = useState<any[]>([]);

  const generate = () => {
    const source = difficulty === 'easy' ? EASY_EQUATIONS : MEDIUM_EQUATIONS;
    // Shuffle and pick
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    setWorksheet(shuffled.slice(0, count));
  };

  return (
    <div className="flex flex-col h-screen bg-surface rtl font-sans" dir="rtl">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0 print:hidden z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-l from-amber-500 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-amber-500" />
            مولد أوراق العمل
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
         {/* Sidebar Controls (Hidden on mobile generally, but keeping simple here, and hidden on print) */}
         <div className="w-full md:w-80 bg-surface-container-lowest border-l border-outline/10 p-6 flex flex-col gap-8 print:hidden overflow-y-auto">
            <div className="space-y-6">
              <h3 className="font-black text-on-surface flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                إعدادات الورقة
              </h3>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-on-surface-variant">المستوى</label>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setDifficulty('easy')}
                     className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${difficulty === 'easy' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                   >
                     سهل
                   </button>
                   <button 
                     onClick={() => setDifficulty('medium')}
                     className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${difficulty === 'medium' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                   >
                     متوسط
                   </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-on-surface-variant flex justify-between">
                  <span>عدد المعادلات</span>
                  <span className="text-primary">{count}</span>
                </label>
                <input 
                  type="range" 
                  min="2" max="10" 
                  value={count} 
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <button 
                onClick={generate}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <RefreshCw size={20} />
                توليد ورقة جديدة
              </button>

              <button 
                onClick={() => window.print()}
                disabled={worksheet.length === 0}
                className="w-full py-4 bg-surface-container text-on-surface rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                <Printer size={20} />
                طباعة الورقة
              </button>
            </div>
         </div>

         {/* Document Preview */}
         <div className="flex-1 bg-surface-container p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-12 print:p-8 flex flex-col relative border border-outline/5">
                
                {worksheet.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant opacity-50 print:hidden">
                     <FileSpreadsheet size={64} className="mb-4" />
                     <p className="text-lg font-medium tracking-wide">قم بتوليد ورقة عمل لتبدأ عرضها هنا</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-12">
                       <div>
                         <h1 className="text-3xl font-black mb-2">ورقة عمل: الموازنة الكيميائية</h1>
                         <p className="text-gray-600 font-bold">المستوى: {difficulty === 'easy' ? 'مبتدئ' : 'متوسط'}</p>
                       </div>
                       <div className="text-left space-y-2 text-sm font-bold">
                         <p>الاسم: .......................................</p>
                         <p>التاريخ: .......................................</p>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-12 flex-1">
                      <p className="font-bold text-lg mb-8">التعليمة: وازن المعادلات الكيميائية التالية:</p>
                      {worksheet.map((item, index) => {
                         const sides = item.eq.split('->');
                         return (
                           <div key={index} className="flex gap-4 items-center text-2xl font-black tracking-widest font-mono p-4 rounded-xl border border-transparent hover:border-black/5 transition-colors">
                              <span className="text-xl w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 font-sans">{index + 1}</span>
                              <div className="flex-1 flex items-center gap-6" dir="ltr">
                                 <span>{sides[0]}</span>
                                 <ArrowLeft size={24} className="text-gray-400 shrink-0" />
                                 <span>{sides[1]}</span>
                              </div>
                           </div>
                         )
                      })}
                    </div>

                    <div className="mt-12 text-center text-sm font-bold text-gray-400 pt-8 border-t border-gray-200">
                      تم التوليد بواسطة منصة الموارد العلمية
                    </div>
                  </>
                )}
            </div>
         </div>
      </div>
    </div>
  );
}
