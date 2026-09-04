import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Beaker, RotateCcw, Droplet, Plus, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type ChemicalType = 'liquid' | 'acid' | 'base' | 'salt' | 'indicator';

interface Chemical {
  id: string;
  name: string;
  symbol: string;
  color: string; // RGB string like '255, 255, 255'
  type: ChemicalType;
}

const CHEMICALS: Chemical[] = [
  { id: 'water', name: 'ماء مقطر', symbol: 'H₂O', color: '200, 230, 255', type: 'liquid' },
  { id: 'hcl', name: 'حمض كلور الماء', symbol: 'HCl', color: '240, 248, 255', type: 'acid' },
  { id: 'naoh', name: 'هيدروكسيد الصوديوم', symbol: 'NaOH', color: '245, 245, 245', type: 'base' },
  { id: 'cuso4', name: 'كبريتات النحاس', symbol: 'CuSO₄', color: '59, 130, 246', type: 'salt' },
  { id: 'kmno4', name: 'برمنجنات البوتاسيوم', symbol: 'KMnO₄', color: '168, 85, 247', type: 'salt' },
  { id: 'k2cr2o7', name: 'ثنائي كرومات البوتاسيوم', symbol: 'K₂Cr₂O₇', color: '249, 115, 22', type: 'salt' },
  { id: 'phenolphthalein', name: 'فينول فثالين', symbol: 'Ph', color: '255, 255, 255', type: 'indicator' },
];

interface ContainerItem {
  id: string;
  type: 'beaker' | 'flask';
  state: {
    acidBaseBalance: number; // < 0 acid, > 0 base, 0 neutral
    hasIndicator: boolean;
    color: string; // current mixed color
    volume: number;
    mixedIds: Set<string>;
  };
}

export default function VirtualLab() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'equipment' | 'chemicals'>('equipment');

  // Add a new container to the desk
  const addContainer = (type: 'beaker' | 'flask') => {
    const newContainer: ContainerItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      state: {
        acidBaseBalance: 0,
        hasIndicator: false,
        color: 'transparent',
        volume: 0,
        mixedIds: new Set(),
      }
    };
    setContainers([...containers, newContainer]);
    setSelectedContainerId(newContainer.id);
  };

  // Remove a container
  const removeContainer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContainers(containers.filter(c => c.id !== id));
    if (selectedContainerId === id) setSelectedContainerId(null);
  };

  // Mix two RGB colors
  const mixColors = (c1: string, c2: string, ratio: number = 0.5): string => {
    if (c1 === 'transparent') return c2;
    if (c2 === 'transparent') return c1;
    const [r1, g1, b1] = c1.split(',').map(Number);
    const [r2, g2, b2] = c2.split(',').map(Number);
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    return `${r}, ${g}, ${b}`;
  };

  // Add chemical to the selected container
  const addChemical = (chemical: Chemical) => {
    if (!selectedContainerId) return;

    setContainers(prev => prev.map(container => {
      if (container.id !== selectedContainerId) return container;
      if (container.state.volume >= 100) return container; // Full

      let newBalance = container.state.acidBaseBalance;
      if (chemical.type === 'acid') newBalance -= 1;
      if (chemical.type === 'base') newBalance += 1;

      let hasIndicator = container.state.hasIndicator || chemical.type === 'indicator';
      
      let baseColor = container.state.color;
      let addedColor = chemical.color;
      
      // Indicator logic (Phenolphthalein turns pink in base)
      if (hasIndicator && newBalance > 0) {
         addedColor = '236, 72, 153'; // Pink
      } else if (hasIndicator && newBalance <= 0) {
         // Should lose pink color if neutral or acidic, but for simplicity let's rely on standard color mixing 
         // or we can override base color if it was mostly pink indicator
      }

      // Special override for Phenolphthalein in basic solution
      let finalColor = mixColors(baseColor, addedColor, 1 / ((container.state.volume / 10) + 1));
      if (hasIndicator && newBalance > 0) finalColor = mixColors(finalColor, '236, 72, 153', 0.8);

      const mixed = new Set(container.state.mixedIds);
      mixed.add(chemical.id);

      return {
        ...container,
        state: {
          acidBaseBalance: newBalance,
          hasIndicator,
          color: finalColor,
          volume: Math.min(100, container.state.volume + 10),
          mixedIds: mixed,
        }
      };
    }));
  };

  const clearDesk = () => {
    setContainers([]);
    setSelectedContainerId(null);
  };

  const getContainerIcon = (type: 'beaker' | 'flask') => {
    return type === 'beaker' ? Beaker : FlaskConical;
  };

  return (
    <div className="flex flex-col h-screen bg-surface rtl font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-l from-rose-500 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <FlaskConical size={24} className="text-rose-500" />
              المخبر الافتراضي
            </h1>
          </div>
        </div>
        
        <button
          onClick={clearDesk}
          className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-xl transition-colors text-sm font-bold"
        >
          <RotateCcw size={16} />
          إفراغ الطاولة
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-80 bg-surface-container-lowest border-l border-outline/10 flex flex-col z-10">
          <div className="flex p-2 bg-surface-container/50 m-4 rounded-2xl">
            <button 
              onClick={() => setActiveTab('equipment')}
              className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", activeTab === 'equipment' ? "bg-surface shadow text-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              الأدوات
            </button>
            <button 
              onClick={() => setActiveTab('chemicals')}
              className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all", activeTab === 'chemicals' ? "bg-surface shadow text-primary" : "text-on-surface-variant hover:text-on-surface")}
            >
              المواد المتفاعلة
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-0">
             <AnimatePresence mode="wait">
               {activeTab === 'equipment' ? (
                 <motion.div 
                   key="equipment"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="grid grid-cols-2 gap-3"
                 >
                   <button 
                     onClick={() => addContainer('beaker')}
                     className="bg-surface border border-outline/10 p-4 rounded-[20px] flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                   >
                     <div className="w-12 h-12 rounded-full bg-surface-container group-hover:bg-primary/10 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                       <Beaker size={24} />
                     </div>
                     <span className="font-bold text-sm text-on-surface">بيشر</span>
                   </button>
                   <button 
                     onClick={() => addContainer('flask')}
                     className="bg-surface border border-outline/10 p-4 rounded-[20px] flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                   >
                     <div className="w-12 h-12 rounded-full bg-surface-container group-hover:bg-primary/10 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                       <FlaskConical size={24} />
                     </div>
                     <span className="font-bold text-sm text-on-surface">دورق أفالون</span>
                   </button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="chemicals"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex flex-col gap-3"
                 >
                   {!selectedContainerId && (
                     <div className="p-4 bg-tertiary-container/30 text-tertiary rounded-2xl text-sm font-medium flex items-start gap-3 mb-2">
                       <Info size={20} className="shrink-0 mt-0.5" />
                       <p>حدد وعاءً من الطاولة أولاً لتتمكن من إضافة المواد إليه.</p>
                     </div>
                   )}
                   
                   {CHEMICALS.map(chemical => (
                     <button
                       key={chemical.id}
                       onClick={() => addChemical(chemical)}
                       disabled={!selectedContainerId}
                       className="text-right bg-surface border border-outline/10 p-4 rounded-[20px] hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none"
                     >
                       <div className="flex items-center gap-4">
                         <div 
                           className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center shadow-inner"
                           style={{ backgroundColor: `rgba(${chemical.color}, 0.8)` }}
                         >
                           <Droplet size={16} className={chemical.color === '255, 255, 255' ? 'text-black/50' : 'text-white/80'} />
                         </div>
                         <div>
                           <div className="font-bold text-on-surface">{chemical.name}</div>
                           <div className="text-xs text-on-surface-variant mt-1 font-mono tracking-wider">{chemical.symbol}</div>
                         </div>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-surface-container group-hover:bg-primary group-hover:text-on-primary flex items-center justify-center transition-colors">
                         <Plus size={16} />
                       </div>
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* Main Lab Area */}
        <div className="flex-1 bg-surface-container-lowest relative overflow-hidden" 
             style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.03) 2px, transparent 0)', backgroundSize: '40px 40px' }}
        >
           {/* Desk Graphic */}
           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-container-high to-surface-container/50 border-t-4 border-outline/10"></div>
           
           <div className="absolute inset-0 p-8 pb-32 flex items-end justify-center gap-12 gap-y-24 flex-wrap content-end">
             <AnimatePresence>
                {containers.length === 0 && (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   >
                     <p className="text-2xl font-bold text-on-surface-variant/40 tracking-wide">
                        أضف أدوات من القائمة الجانبية للبدء
                     </p>
                   </motion.div>
                )}

                {containers.map((container, index) => {
                  const Icon = getContainerIcon(container.type);
                  const isSelected = selectedContainerId === container.id;
                  
                  return (
                    <motion.div
                      key={container.id}
                      initial={{ scale: 0, y: -50 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => setSelectedContainerId(container.id)}
                      className={cn(
                        "relative cursor-pointer group transition-transform hover:-translate-y-2",
                        isSelected ? "scale-110" : "scale-100 opacity-90"
                      )}
                    >
                      {/* Selection Ring */}
                      {isSelected && (
                         <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] border-2 border-primary/30 animate-pulse pointer-events-none" />
                      )}

                      {/* Tool Actions */}
                      <button 
                        onClick={(e) => removeContainer(container.id, e)}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-20"
                      >
                         <Trash2 size={18} />
                      </button>

                      {/* Chemical Level & Liquid Render */}
                      <div className="relative w-32 h-40 flex items-end justify-center z-10 transition-all duration-500">
                         {container.type === 'beaker' && (
                           <div className="absolute inset-0 border-4 border-t-0 border-white/60 bg-white/20 rounded-b-2xl backdrop-blur-sm overflow-hidden shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.1)]">
                             {/* Liquid */}
                             <motion.div 
                               className="absolute bottom-0 left-0 right-0 origin-bottom transition-all duration-700 ease-in-out"
                               style={{ 
                                 height: `${container.state.volume}%`,
                                 backgroundColor: container.state.volume > 0 ? `rgba(${container.state.color}, 0.8)` : 'transparent',
                                 boxShadow: container.state.volume > 0 ? `inset 0 4px 10px rgba(255,255,255,0.4)` : 'none'
                               }}
                             />
                             {/* Measurement marks */}
                             <div className="absolute left-1 bottom-4 top-4 flex flex-col justify-between border-l-2 border-black/20 w-3">
                                {[...Array(4)].map((_, i) => (
                                   <div key={i} className="border-b-2 border-black/20 w-2 h-0" />
                                ))}
                             </div>
                           </div>
                         )}

                         {container.type === 'flask' && (
                           <div className="relative w-32 h-40 flex flex-col items-center justify-end drop-shadow-xl">
                              {/* Neck */}
                              <div className="w-10 h-20 border-4 border-b-0 border-white/60 bg-white/20 backdrop-blur-sm z-10 relative">
                                 {/* Volume in neck if full */}
                                 <motion.div 
                                   className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-700 ease-in-out"
                                   style={{ 
                                     height: container.state.volume > 70 ? `${(container.state.volume - 70) * 3.3}%` : '0%',
                                     backgroundColor: container.state.volume > 0 ? `rgba(${container.state.color}, 0.8)` : 'transparent',
                                   }}
                                 />
                              </div>
                              {/* Body */}
                              <div className="w-32 h-24 border-4 border-white/60 bg-white/20 backdrop-blur-sm rounded-full -mt-2 overflow-hidden relative shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05)]">
                                 <motion.div 
                                   className="absolute bottom-0 left-0 right-0 origin-bottom transition-all duration-700 ease-in-out"
                                   style={{ 
                                     height: Math.min(100, (container.state.volume / 70) * 100) + '%',
                                     backgroundColor: container.state.volume > 0 ? `rgba(${container.state.color}, 0.8)` : 'transparent',
                                   }}
                                 />
                              </div>
                           </div>
                         )}
                      </div>

                      {/* Tooltip info */}
                      {container.state.volume > 0 && (
                         <div className="absolute -right-8 top-1/2 -translate-y-1/2 translate-x-full bg-surface shadow-xl rounded-xl p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30 min-w-[120px]">
                            <div className="text-xs font-bold text-on-surface-variant mb-1">المحتوى: {container.state.volume}mL</div>
                            <div className="flex gap-1 flex-wrap">
                               {Array.from(container.state.mixedIds).map(id => {
                                 const chem = CHEMICALS.find(c => c.id === id);
                                 return chem ? (
                                   <span key={id} className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full font-mono">
                                     {chem.symbol}
                                   </span>
                                 ) : null;
                               })}
                            </div>
                         </div>
                      )}
                    </motion.div>
                  )
                })}
             </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
}

