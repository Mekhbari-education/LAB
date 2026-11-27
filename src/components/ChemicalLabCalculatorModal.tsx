import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Beaker, Droplets, X, ArrowDownToLine, AlertTriangle } from 'lucide-react';
import { Chemical } from '../types/chemicals';
import { calculateMolarMass } from '../utils/chemistryCalc';
import { cn } from '../lib/utils';

interface ChemicalLabCalculatorModalProps {
  isOpen: boolean;
  chemical: Chemical | null;
  onClose: () => void;
  onDeductStock?: (chemical: Chemical, amountInChemicalUnit: number, reason: string) => Promise<void>;
}

type CalcMode = 'solid' | 'dilution';

export function ChemicalLabCalculatorModal({
  isOpen,
  chemical,
  onClose,
  onDeductStock,
}: ChemicalLabCalculatorModalProps) {
  const [mode, setMode] = useState<CalcMode>('solid');
  const [formulaInput, setFormulaInput] = useState('');
  const [molarMassInput, setMolarMassInput] = useState<string>('58.44');
  const [targetMolarity, setTargetMolarity] = useState<string>('0.1'); // mol/L
  const [targetVolumeMl, setTargetVolumeMl] = useState<string>('250'); // mL
  const [purityPercent, setPurityPercent] = useState<string>('100');

  // Dilution mode
  const [stockMolarity, setStockMolarity] = useState<string>('1.0'); // C1 (mol/L)
  const [desiredMolarity, setDesiredMolarity] = useState<string>('0.1'); // C2 (mol/L)
  const [desiredVolumeMl, setDesiredVolumeMl] = useState<string>('250'); // V2 (mL)
  const [isDeducting, setIsDeducting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (chemical) {
      const f = chemical.formula || '';
      setFormulaInput(f);
      const parsedM = calculateMolarMass(f);
      if (parsedM) {
        setMolarMassInput(String(parsedM));
      }
      setMode(chemical.state === 'liquid' ? 'dilution' : 'solid');
    }
  }, [isOpen, chemical]);

  const parsedFormulaMass = useMemo(() => calculateMolarMass(formulaInput), [formulaInput]);

  useEffect(() => {
    if (parsedFormulaMass) {
      setMolarMassInput(String(parsedFormulaMass));
    }
  }, [parsedFormulaMass]);

  const solidResult = useMemo(() => {
    const M = parseFloat(molarMassInput);
    const C = parseFloat(targetMolarity);
    const Vml = parseFloat(targetVolumeMl);
    const purity = Math.max(1, Math.min(100, parseFloat(purityPercent) || 100));
    if (!Number.isFinite(M) || !Number.isFinite(C) || !Number.isFinite(Vml) || M <= 0 || C < 0 || Vml < 0) {
      return null;
    }
    const pureMassGrams = C * (Vml / 1000) * M;
    const requiredMassGrams = pureMassGrams / (purity / 100);
    return {
      pureMassGrams,
      requiredMassGrams,
    };
  }, [molarMassInput, targetMolarity, targetVolumeMl, purityPercent]);

  const dilutionResult = useMemo(() => {
    const c1 = parseFloat(stockMolarity);
    const c2 = parseFloat(desiredMolarity);
    const v2 = parseFloat(desiredVolumeMl);
    if (!Number.isFinite(c1) || !Number.isFinite(c2) || !Number.isFinite(v2) || c1 <= 0 || c2 < 0 || v2 < 0) {
      return null;
    }
    const v1Ml = (c2 * v2) / c1;
    const waterMl = Math.max(0, v2 - v1Ml);
    return {
      v1Ml,
      waterMl,
      invalid: c2 > c1,
    };
  }, [stockMolarity, desiredMolarity, desiredVolumeMl]);

  if (!isOpen) return null;

  const canDeductSolid =
    Boolean(chemical && onDeductStock && solidResult && solidResult.requiredMassGrams > 0) &&
    (chemical?.unit === 'g' || chemical?.unit === 'kg');

  const canDeductLiquid =
    Boolean(chemical && onDeductStock && dilutionResult && !dilutionResult.invalid && dilutionResult.v1Ml > 0) &&
    (chemical?.unit === 'ml' || chemical?.unit === 'L');

  const handleDeduct = async () => {
    if (!chemical || !onDeductStock) return;
    setIsDeducting(true);
    try {
      if (mode === 'solid' && solidResult) {
        const amount =
          chemical.unit === 'kg'
            ? Number((solidResult.requiredMassGrams / 1000).toFixed(4))
            : Number(solidResult.requiredMassGrams.toFixed(2));
        await onDeductStock(
          chemical,
          amount,
          `تحضير ${targetVolumeMl} mL بتركيز ${targetMolarity} mol/L`
        );
      } else if (mode === 'dilution' && dilutionResult && !dilutionResult.invalid) {
        const amount =
          chemical.unit === 'L'
            ? Number((dilutionResult.v1Ml / 1000).toFixed(4))
            : Number(dilutionResult.v1Ml.toFixed(2));
        await onDeductStock(
          chemical,
          amount,
          `تمديد ${desiredVolumeMl} mL إلى تركيز ${desiredMolarity} mol/L`
        );
      }
      onClose();
    } finally {
      setIsDeducting(false);
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
          className="relative bg-surface-container-lowest border border-outline/15 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calculator size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">حاسبة التحضير والتمديد المخبرية</h3>
                <p className="text-xs font-bold text-secondary/70 mt-0.5">
                  {chemical
                    ? `${chemical.nameAr || chemical.nameEn}${chemical.formula ? ` · ${chemical.formula}` : ''}`
                    : 'حساب الكتلة المولية وتحضير المحاليل القياسية بدقة'}
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

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-2xl border border-outline/10">
            <button
              type="button"
              onClick={() => setMode('solid')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap',
                mode === 'solid'
                  ? 'bg-surface text-primary shadow-sm border border-outline/10'
                  : 'text-secondary/75 hover:text-primary'
              )}
            >
              <Beaker size={15} />
              <span>تحضير من مادة صلبة</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('dilution')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap',
                mode === 'dilution'
                  ? 'bg-surface text-primary shadow-sm border border-outline/10'
                  : 'text-secondary/75 hover:text-primary'
              )}
            >
              <Droplets size={15} />
              <span>تمديد محلول (C₁V₁ = C₂V₂)</span>
            </button>
          </div>

          {mode === 'solid' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">الصيغة الكيميائية (لحساب M تلقائياً)</label>
                  <input
                    dir="ltr"
                    value={formulaInput}
                    onChange={(e) => setFormulaInput(e.target.value)}
                    placeholder="مثال: CuSO4·5H2O"
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">الكتلة المولية M (g/mol)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    dir="ltr"
                    value={molarMassInput}
                    onChange={(e) => setMolarMassInput(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">التركيز المولي المطلوب C (mol/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    dir="ltr"
                    value={targetMolarity}
                    onChange={(e) => setTargetMolarity(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">الحجم المطلوب تحضيره V (mL)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    dir="ltr"
                    value={targetVolumeMl}
                    onChange={(e) => setTargetVolumeMl(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-secondary/80">نسبة النقاوة (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  dir="ltr"
                  value={purityPercent}
                  onChange={(e) => setPurityPercent(e.target.value)}
                  className="w-full sm:w-44 bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>

              {solidResult && (
                <div className="p-5 rounded-2xl bg-primary/6 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-secondary/75">الكتلة الواجب وزنها بدقة</p>
                    <p className="text-3xl font-black text-primary font-mono tabular-nums mt-1">
                      {solidResult.requiredMassGrams.toFixed(3)} <span className="text-sm font-bold">g</span>
                    </p>
                    {parseFloat(purityPercent) < 100 && (
                      <p className="text-[11px] font-bold text-secondary/70 mt-1 tabular-nums">
                        الكتلة النقية النظريّة: {solidResult.pureMassGrams.toFixed(3)} g
                      </p>
                    )}
                  </div>
                  {canDeductSolid && (
                    <button
                      type="button"
                      disabled={isDeducting}
                      onClick={handleDeduct}
                      className="px-4 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <ArrowDownToLine size={15} />
                      <span>خصم من مخزون {chemical?.nameAr || chemical?.nameEn}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">التركيز الأم C₁ (mol/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    dir="ltr"
                    value={stockMolarity}
                    onChange={(e) => setStockMolarity(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">التركيز المطلوب C₂ (mol/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    dir="ltr"
                    value={desiredMolarity}
                    onChange={(e) => setDesiredMolarity(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary/80">الحجم النهائي V₂ (mL)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    dir="ltr"
                    value={desiredVolumeMl}
                    onChange={(e) => setDesiredVolumeMl(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/15 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>

              {dilutionResult && (
                dilutionResult.invalid ? (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-200 text-xs font-black">
                    <AlertTriangle size={18} className="shrink-0" />
                    <span>التركيز المطلوب C₂ لا يمكن أن يكون أكبر من تركيز المحلول الأم C₁.</span>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-primary/6 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-secondary/75">حجم المحلول الأم الواجب سحبه (V₁)</p>
                      <p className="text-3xl font-black text-primary font-mono tabular-nums">
                        {dilutionResult.v1Ml.toFixed(2)} <span className="text-sm font-bold">mL</span>
                      </p>
                      <p className="text-xs font-bold text-secondary/80 tabular-nums">
                        يُضاف إليه ماء مقطر حتى العلامة (≈ {dilutionResult.waterMl.toFixed(2)} mL)
                      </p>
                    </div>
                    {canDeductLiquid && (
                      <button
                        type="button"
                        disabled={isDeducting}
                        onClick={handleDeduct}
                        className="px-4 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                      >
                        <ArrowDownToLine size={15} />
                        <span>خصم الحجم من المخزون</span>
                      </button>
                    )}
                  </div>
                )
              )}

              <p className="text-[11px] font-bold text-secondary/70">
                تذكير أمان مخبري: عند تمديد الأحماض المركزة، اسكب الحمض تدريجياً فوق الماء المقطر مع التحريك، ولا تفعل العكس أبداً.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
