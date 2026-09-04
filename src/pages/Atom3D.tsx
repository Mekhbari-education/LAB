import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Pause, Atom, RotateCcw } from 'lucide-react';
import { elements } from '../constants/elements';

export default function Atom3D() {
  const navigate = useNavigate();
  const [selectedElement, setSelectedElement] = useState(elements[0]); // Hydrogen by default
  const [isRotating, setIsRotating] = useState(true);

  // Calculate rings and electrons based on electron configuration
  const electronsPerRing = selectedElement.electron_configuration.split(' ').map(shell => {
    // Basic heuristic for electron count in a shell
    const match = shell.match(/[spdf](\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(v => v > 0);
  
  if (electronsPerRing.length === 0) electronsPerRing.push(selectedElement.number);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white rtl font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-white/70 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-l from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Atom size={24} className="text-purple-400" />
            مجسمات الذرات 3D
          </h1>
          <p className="text-xs text-white/50">عرض تفاعلي لنماذج بور الذرية ثلاثية الأبعاد</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
        {/* Main 3D Canvas Area (Simulated with CSS) */}
        <div className="flex-1 relative flex items-center justify-center p-8 min-h-[500px]">
          
          {/* Controls Overlay */}
          <div className="absolute top-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex gap-4 z-20">
            <button onClick={() => setIsRotating(!isRotating)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
              {isRotating ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => setIsRotating(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Atom Structure */}
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center perspective-[1000px]">
            
            {/* Nucleus */}
            <motion.div 
              className="absolute w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-500 to-purple-600 shadow-[0_0_50px_rgba(239,68,68,0.6)] z-10 flex items-center justify-center flex-wrap gap-0.5 overflow-hidden p-2"
              animate={isRotating ? { rotateX: 360, rotateY: 360 } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="text-xs font-black text-white/90 drop-shadow-md z-20 flex flex-col items-center">
                 <span>{selectedElement.symbol}</span>
                 <span className="text-[8px]">{selectedElement.number} +</span>
              </div>
            </motion.div>

            {/* Electron Orbits Rings */}
            {electronsPerRing.map((eCount, ringIndex) => {
              const ringSize = 100 + (ringIndex * 70); // px size
              const duration = 10 + (ringIndex * 5); // slower outside
              
              const electrons = Array.from({length: eCount}).map((_, i) => i);
              
              return (
                <motion.div
                  key={ringIndex}
                  className="absolute rounded-full border border-blue-400/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] preserve-3d"
                  style={{
                    width: `${ringSize}px`,
                    height: `${ringSize}px`,
                  }}
                  initial={{ rotateX: 70, rotateY: ringIndex * 45 }}
                  animate={isRotating ? { rotateZ: 360 } : {}}
                  transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
                >
                  {electrons.map(eIndex => {
                    const angle = (360 / eCount) * eIndex;
                    return (
                      <div
                        key={eIndex}
                        className="absolute w-3 h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${ringSize / 2}px)`,
                        }}
                      />
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
          
          {/* Dynamic BG Glow based on selected element */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-10 pointer-events-none" />
        </div>

        {/* Sidebar Data */}
        <div className="w-full lg:w-96 bg-white/5 border-r border-white/10 backdrop-blur-xl p-6 flex flex-col gap-6 overflow-y-auto">
           <h3 className="text-xl font-bold flex items-center gap-2 text-white/90">
             <Atom size={20} />
             اختر الذرة
           </h3>
           
           <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
              <input 
                 type="text" 
                 placeholder="ابحث عن عنصر..." 
                 className="flex-1 bg-transparent border-none text-white text-sm px-4 py-2 focus:outline-none"
              />
           </div>

           <div className="grid grid-cols-4 gap-2 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
              {elements.map(el => (
                <button
                  key={el.number}
                  onClick={() => setSelectedElement(el)}
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedElement.number === el.number 
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  <span className="text-[10px] absolute top-1 right-1 opacity-50">{el.number}</span>
                  <span className="text-lg font-black">{el.symbol}</span>
                </button>
              ))}
           </div>
           
           {/* Detailed view */}
           <div className="bg-black/50 rounded-2xl p-6 border border-white/10 mt-auto">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-3xl font-black text-white">{selectedElement.name}</h2>
                   <p className="text-purple-400 font-bold text-sm mt-1 uppercase tracking-wider">{selectedElement.category}</p>
                </div>
                <div className="text-5xl font-black text-white/10">#{selectedElement.number}</div>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                   <span className="text-white/50 text-sm">التوزيع الإلكتروني</span>
                   <span className="font-mono text-cyan-400">{selectedElement.electron_configuration}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                   <span className="text-white/50 text-sm">الكتلة الذرية</span>
                   <span className="font-bold text-white">{selectedElement.atomic_mass}</span>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
