import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Play, Pause, RotateCcw, Download, Settings, ChevronDown, Check, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';

type ExperimentType = 'rc_charge' | 'titration' | 'kinematics';

interface DataPoint {
  x: number;
  y: number;
}

export default function Exao() {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState<ExperimentType>('rc_charge');
  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number>(0);
  
  // Experiment Configs
  const experiments = {
    rc_charge: {
      name: 'شحن مكثفة (RC)',
      xLabel: 'الزمن (s)',
      yLabel: 'التوتر (V)',
      color: '#8b5cf6', // Violet
      maxX: 5,
      maxY: 12,
      generatePoint: (t: number) => ({
        x: Number(t.toFixed(2)),
        y: Number((10 * (1 - Math.exp(-t / 1))).toFixed(2)) // E=10V, tau=1s
      })
    },
    titration: {
      name: 'معايرة حمض-أساس',
      xLabel: 'الحجم (mL)',
      yLabel: 'pH',
      color: '#ec4899', // Pink
      maxX: 25,
      maxY: 14,
      generatePoint: (v: number) => {
        // Simple sigmoid curve for titration
        const vEq = 10;
        const ph = 7 + 5 * Math.atan(v - vEq);
        return {
          x: Number(v.toFixed(1)),
          y: Number(Math.max(0, Math.min(14, ph)).toFixed(2))
        };
      }
    },
    kinematics: {
      name: 'السقوط الحر (السرعة)',
      xLabel: 'الزمن (s)',
      yLabel: 'السرعة (m/s)',
      color: '#10b981', // Emerald
      maxX: 3,
      maxY: 30,
      generatePoint: (t: number) => ({
        x: Number(t.toFixed(2)),
        y: Number((9.8 * t).toFixed(2)) // g = 9.8
      })
    }
  };

  const currentExp = experiments[activeExperiment];

  const resetExperiment = () => {
    setIsPlaying(false);
    setData([]);
    setTime(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    resetExperiment();
  }, [activeExperiment]);

  useEffect(() => {
    if (isPlaying) {
      let lastTimestamp = performance.now();
      const step = (timestamp: number) => {
        const delta = (timestamp - lastTimestamp) / 1000; // seconds
        lastTimestamp = timestamp;
        
        setTime(prevTime => {
          const newTime = prevTime + (activeExperiment === 'titration' ? delta * 5 : delta);
          if (newTime >= currentExp.maxX) {
            setIsPlaying(false);
            return currentExp.maxX;
          }
          
          setData(prevData => {
            const newPoint = currentExp.generatePoint(newTime);
            // Only add if x changed enough to avoid too many points
            if (prevData.length === 0 || newPoint.x - prevData[prevData.length-1].x > (currentExp.maxX / 100)) {
               return [...prevData, newPoint];
            }
            return prevData;
          });
          
          return newTime;
        });
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(step);
        }
      };
      
      animationRef.current = requestAnimationFrame(step);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, activeExperiment]);

  return (
    <div className="flex flex-col h-screen bg-surface rtl font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-l from-indigo-500 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity size={24} className="text-indigo-500" />
            التجريب المدعم بالحاسوب (EXAO)
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-surface-container-lowest border-l border-outline/10 p-6 flex flex-col gap-8 overflow-y-auto">
           
           <div className="space-y-4">
             <h3 className="font-bold text-on-surface text-lg border-b border-outline/10 pb-2">التجربة</h3>
             <div className="flex flex-col gap-2">
                {(Object.keys(experiments) as ExperimentType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveExperiment(key)}
                    className={cn(
                      "text-right p-4 rounded-2xl transition-all border font-bold text-sm flex justify-between items-center",
                      activeExperiment === key 
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-700" 
                        : "bg-surface border-outline/10 text-on-surface hover:bg-surface-container"
                    )}
                  >
                    <span>{experiments[key].name}</span>
                    {activeExperiment === key && <Check size={18} className="text-indigo-500" />}
                  </button>
                ))}
             </div>
           </div>

           <div className="space-y-4">
             <h3 className="font-bold text-on-surface text-lg border-b border-outline/10 pb-2">التحكم</h3>
             <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={time >= currentExp.maxX}
                  className={cn(
                    "col-span-2 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-sm",
                    isPlaying ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-indigo-600 text-white hover:bg-indigo-700",
                    time >= currentExp.maxX ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause fill="currentColor" size={20} /> إيقاف مؤقت
                    </>
                  ) : (
                    <>
                      <Play fill="currentColor" size={20} /> {data.length > 0 ? 'متابعة' : 'بدء القياس'}
                    </>
                  )}
                </button>
                <button
                  onClick={resetExperiment}
                  className="py-3 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={18} />
                  إعادة
                </button>
                <button
                  onClick={() => {
                    // Simple CSV download
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      currentExp.xLabel + "," + currentExp.yLabel + "\n" +
                      data.map(e => e.x + "," + e.y).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `data_${activeExperiment}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  }}
                  disabled={data.length === 0}
                  className="py-3 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download size={18} />
                  تصدير
                </button>
             </div>
           </div>

           {/* Metrics Summary */}
           {data.length > 0 && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50 text-indigo-900 p-4 rounded-2xl border border-indigo-100"
             >
                <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
                  <Activity size={16} />
                  النتائج الحالية
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <div className="text-indigo-400 font-medium mb-1">{currentExp.xLabel}</div>
                     <div className="font-black text-xl font-mono">{time.toFixed(2)}</div>
                   </div>
                   <div>
                     <div className="text-indigo-400 font-medium mb-1">{currentExp.yLabel}</div>
                     <div className="font-black text-xl font-mono">{data[data.length-1]?.y.toFixed(2) || '0.00'}</div>
                   </div>
                </div>
             </motion.div>
           )}

        </div>

        {/* Main Chart Area */}
        <div className="flex-1 bg-surface-container-lowest p-4 md:p-8 flex flex-col relative">
           
           <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-outline/10 p-4 md:p-8 flex flex-col">
              
              <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="text-2xl font-black text-on-surface mb-1">المنحنى البياني</h2>
                   <p className="text-on-surface-variant font-medium">تطور {currentExp.yLabel.split(' ')[0]} بدلالة {currentExp.xLabel.split(' ')[0]}</p>
                 </div>
                 {isPlaying && (
                   <div className="flex items-center gap-2 text-error font-bold text-sm bg-error/10 px-3 py-1.5 rounded-full animate-pulse">
                     <span className="w-2 h-2 rounded-full bg-error"></span>
                     التقاط البيانات جارٍ...
                   </div>
                 )}
              </div>

              <div className="flex-1 w-full min-h-[400px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="x" 
                      type="number"
                      domain={[0, currentExp.maxX]} 
                      label={{ value: currentExp.xLabel, position: 'bottom', offset: -10 }}
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      domain={[0, currentExp.maxY]}
                      label={{ value: currentExp.yLabel, angle: -90, position: 'insideLeft', offset: -10 }}
                      stroke="#94a3b8"
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      labelFormatter={(value) => `${currentExp.xLabel}: ${value}`}
                    />
                    
                    {/* Common Reference lines depending on experiment */}
                    {activeExperiment === 'rc_charge' && (
                       <ReferenceLine y={10} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'top', value: 'E = 10V', fill: '#94a3b8' }} />
                    )}
                    {activeExperiment === 'titration' && (
                       <ReferenceLine x={10} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'V_eq = 10mL', fill: '#94a3b8' }} />
                    )}

                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke={currentExp.color}
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 2, fill: '#fff', stroke: currentExp.color }}
                      isAnimationActive={false} // Disable recharts animation since we animate data points
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}

