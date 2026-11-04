import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  QrCode, 
  Sliders, 
  Layers, 
  Check, 
  Search, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Copy,
  Info
} from 'lucide-react';
import { Equipment } from '../types/equipment';
import { 
  EquipmentStickerItem, 
  StickerPreset, 
  generateEquipmentStickersHtml,
  renderQrCodeSvg,
  renderBarcodeSvg,
  getEquipmentCategory
} from '../services/equipmentStickerService';
import { PrintService } from '../services/printService';
import { formatSchoolWithCommune } from '../lib/utils';

interface EquipmentStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment[];
  selectedItem?: Equipment | null;
  selectedIds?: string[];
  schoolInfo: {
    schoolName: string;
    commune: string;
    directorate: string;
  };
}

export default function EquipmentStickerModal({
  isOpen,
  onClose,
  equipment = [],
  selectedItem = null,
  selectedIds = [],
  schoolInfo
}: EquipmentStickerModalProps) {
  // Config state
  const [preset, setPreset] = useState<StickerPreset>('standard_8');
  const [scope, setScope] = useState<'all' | 'selected' | 'single'>(
    selectedItem ? 'single' : (selectedIds && selectedIds.length > 0 ? 'selected' : 'all')
  );
  const [activeSingleId, setActiveSingleId] = useState<string>(
    selectedItem?.id || (equipment[0]?.id || '')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Content toggles
  const [includeMinistryHeader, setIncludeMinistryHeader] = useState(true);
  const [includeSchoolName, setIncludeSchoolName] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [includeStatusBadge, setIncludeStatusBadge] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeWarningNotice, setIncludeWarningNotice] = useState(true);
  const [cutGuides, setCutGuides] = useState(true);
  const [colorMode, setColorMode] = useState<'color' | 'bw' | 'grayscale'>('color');
  const [copiesPerItem, setCopiesPerItem] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Filter items based on chosen scope
  const targetItems: EquipmentStickerItem[] = useMemo(() => {
    let rawList: Equipment[] = [];
    if (scope === 'single') {
      const found = equipment.find(e => e.id === activeSingleId) || selectedItem || equipment[0];
      rawList = found ? [found] : [];
    } else if (scope === 'selected' && selectedIds && selectedIds.length > 0) {
      rawList = equipment.filter(e => selectedIds.includes(e.id));
      if (rawList.length === 0) rawList = equipment;
    } else {
      rawList = equipment;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rawList = rawList.filter(e => 
        (e.name || '').toLowerCase().includes(q) ||
        (e.smartNameAr || '').toLowerCase().includes(q) ||
        (e.serialNumber || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
      );
    }

    return rawList.map(e => ({
      id: e.id,
      name: e.name,
      smartNameAr: e.smartNameAr,
      serialNumber: e.serialNumber,
      type: e.type,
      location: e.location,
      registrationDate: e.registrationDate,
      foundationalInventory: e.foundationalInventory,
      source: e.source || e.supplier,
      supplier: e.supplier || e.source,
      price: e.price,
      status: e.status,
      notes: e.notes
    }));
  }, [equipment, scope, activeSingleId, selectedItem, selectedIds, searchQuery]);

  // Build the live standalone HTML
  const generatedHtml = useMemo(() => {
    return generateEquipmentStickersHtml({
      items: targetItems,
      schoolName: schoolInfo.schoolName,
      commune: schoolInfo.commune,
      directorate: schoolInfo.directorate,
      laboratoryName: 'مخبر العلوم الفيزيائية والطبيعية',
      preset,
      includeQrCode,
      includeBarcode,
      includeMinistryHeader,
      includeSchoolName,
      includeLocation,
      includeDate,
      includeStatusBadge,
      includeWarningNotice,
      cutGuides,
      colorMode,
      copiesPerItem
    });
  }, [
    targetItems,
    schoolInfo,
    preset,
    includeQrCode,
    includeBarcode,
    includeMinistryHeader,
    includeSchoolName,
    includeLocation,
    includeDate,
    includeStatusBadge,
    includeWarningNotice,
    cutGuides,
    colorMode,
    copiesPerItem
  ]);

  if (!isOpen) return null;

  const totalStickers = targetItems.length * copiesPerItem;
  const stickersPerPage = preset === 'standard_8' ? 8 : preset === 'compact_18' ? 18 : preset === 'mini_24' ? 24 : 1;
  const estimatedPages = Math.ceil(totalStickers / stickersPerPage) || 1;

  const handleDirectPrint = async () => {
    await PrintService.printInNewTab(generatedHtml, {
      title: `ملصقات_جرد_العتاد_${schoolInfo.schoolName}`,
      autoPrint: true
    });
  };

  const handleOpenPreviewTab = async () => {
    await PrintService.printInNewTab(generatedHtml, {
      title: `معاينة_ملصقات_العتاد_${schoolInfo.schoolName}`,
      autoPrint: false
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 md:p-6" dir="rtl">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative bg-surface w-full max-w-[1500px] h-[94vh] rounded-3xl shadow-2xl flex flex-col border border-outline/10 overflow-hidden"
        >
          {/* Header Bar */}
          <header className="px-6 py-4 bg-surface-container flex flex-wrap items-center justify-between gap-4 border-b border-outline/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Tag size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black text-primary">
                    طباعة ملصقات جرد وتعريف العتاد المخبري
                  </h2>
                  <span className="text-[11px] font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                    نموذج لاصق رسمي فوق الجهاز
                  </span>
                </div>
                <p className="text-xs text-on-surface/60 font-bold">
                  {formatSchoolWithCommune(schoolInfo.schoolName, schoolInfo.commune)} · {totalStickers} ملصق ({estimatedPages} صفحة A4 تقريباً)
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenPreviewTab}
                className="bg-surface text-primary border border-outline/20 hover:border-primary/40 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm active:scale-95"
                title="فتح في نافذة مستقلة"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">نافذة جديدة</span>
              </button>
              <button
                onClick={handleDirectPrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Printer size={16} />
                <span>طباعة الملصقات الآن</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-on-surface/50 hover:text-error hover:bg-surface-container-high rounded-xl transition-colors"
                title="إغلاق"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Main Layout: Controls Sidebar + Live Preview Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-surface-container-low/30">
            {/* Controls Sidebar */}
            <aside className="w-full lg:w-96 bg-surface border-b lg:border-b-0 lg:border-l border-outline/10 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 text-xs">
              
              {/* Presets Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-primary flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>حجم ونموذج الملصق (Sticker Preset)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreset('standard_8')}
                    className={`p-3 rounded-2xl border text-start transition-all ${
                      preset === 'standard_8'
                        ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                        : 'bg-surface-container text-on-surface/70 border-outline/10 hover:border-primary/30 font-bold'
                    }`}
                  >
                    <div className="text-xs font-black">قياسي (8 في الصفحة)</div>
                    <div className="text-[10px] text-on-surface/50 mt-0.5">92×65 مم · للأجهزة الكبيرة</div>
                  </button>

                  <button
                    onClick={() => setPreset('compact_18')}
                    className={`p-3 rounded-2xl border text-start transition-all ${
                      preset === 'compact_18'
                        ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                        : 'bg-surface-container text-on-surface/70 border-outline/10 hover:border-primary/30 font-bold'
                    }`}
                  >
                    <div className="text-xs font-black">مدمج (18 في الصفحة)</div>
                    <div className="text-[10px] text-on-surface/50 mt-0.5">63×44 مم · للأدوات والزجاجيات</div>
                  </button>

                  <button
                    onClick={() => setPreset('mini_24')}
                    className={`p-3 rounded-2xl border text-start transition-all ${
                      preset === 'mini_24'
                        ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                        : 'bg-surface-container text-on-surface/70 border-outline/10 hover:border-primary/30 font-bold'
                    }`}
                  >
                    <div className="text-xs font-black">مصغر (24 في الصفحة)</div>
                    <div className="text-[10px] text-on-surface/50 mt-0.5">48×32 مم · للأنابيب الدقيقة</div>
                  </button>

                  <button
                    onClick={() => setPreset('single')}
                    className={`p-3 rounded-2xl border text-start transition-all ${
                      preset === 'single'
                        ? 'bg-primary/10 border-primary text-primary shadow-sm font-black'
                        : 'bg-surface-container text-on-surface/70 border-outline/10 hover:border-primary/30 font-bold'
                    }`}
                  >
                    <div className="text-xs font-black">ملصق مفرد (Single)</div>
                    <div className="text-[10px] text-on-surface/50 mt-0.5">بطاقة تعريف فردية فائقة</div>
                  </button>
                </div>
              </div>

              {/* Scope Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-primary flex items-center gap-1.5">
                  <Sliders size={14} />
                  <span>نطاق الأجهزة المراد طباعتها</span>
                </label>
                <div className="flex bg-surface-container p-1 rounded-2xl border border-outline/10">
                  <button
                    onClick={() => setScope('all')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      scope === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface/60 hover:text-primary'
                    }`}
                  >
                    الكل ({equipment.length})
                  </button>
                  {selectedIds && selectedIds.length > 0 && (
                    <button
                      onClick={() => setScope('selected')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        scope === 'selected'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-on-surface/60 hover:text-primary'
                      }`}
                    >
                      المحددة ({selectedIds.length})
                    </button>
                  )}
                  <button
                    onClick={() => setScope('single')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      scope === 'single'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface/60 hover:text-primary'
                    }`}
                  >
                    جهاز واحد
                  </button>
                </div>

                {scope === 'single' && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-on-surface/60">اختر الجهاز المطلوب:</span>
                    <select
                      value={activeSingleId}
                      onChange={(e) => setActiveSingleId(e.target.value)}
                      className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-1 focus:ring-primary"
                    >
                      {equipment.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.serialNumber ? `[${e.serialNumber}] ` : ''}{e.smartNameAr || e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
                <input
                  type="text"
                  placeholder="تصفية بالاسم أو رقم الجرد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container border border-outline/10 rounded-xl ps-9 pe-3 py-2 text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-primary p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Content Checklist Toggles */}
              <div className="space-y-2 border-t border-outline/10 pt-4">
                <label className="text-xs font-black text-primary">خيارات وعناصر الملصق</label>
                <div className="space-y-1.5">
                  {[
                    { label: 'الترويسة الرسمية (الجمهورية والوزارة)', state: includeMinistryHeader, setter: setIncludeMinistryHeader },
                    { label: 'اسم المؤسسة والبلدية والمخبر', state: includeSchoolName, setter: setIncludeSchoolName },
                    { label: 'مكان الحفظ بالمخبر (الخزانة / الرف)', state: includeLocation, setter: setIncludeLocation },
                    { label: 'تاريخ القيد والتكفل بالجرد', state: includeDate, setter: setIncludeDate },
                    { label: 'شارة الحالة التشغيلية (سليم / صيانة)', state: includeStatusBadge, setter: setIncludeStatusBadge },
                    { label: 'رمز الاستجابة السريعة (QR Code المتجهي)', state: includeQrCode, setter: setIncludeQrCode },
                    { label: 'شريط الباركود التشبيهي (Barcode)', state: includeBarcode, setter: setIncludeBarcode },
                    { label: 'عبارة التحذير: "ملك المؤسسة — لا ينزع"', state: includeWarningNotice, setter: setIncludeWarningNotice },
                    { label: 'خطوط القص والمحاذاة بالمقص (Cut Guides ✂)', state: cutGuides, setter: setCutGuides },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-container cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-outline/30"
                      />
                      <span className="font-bold text-on-surface/80">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Mode & Copies */}
              <div className="space-y-3 border-t border-outline/10 pt-4">
                <div>
                  <label className="text-xs font-black text-primary block mb-1.5">نمط الألوان والطباعة</label>
                  <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
                    <button
                      onClick={() => setColorMode('color')}
                      className={`py-1.5 rounded-lg text-xs font-bold ${colorMode === 'color' ? 'bg-primary text-white shadow-sm' : 'text-on-surface/60'}`}
                    >
                      ألوان رسمية
                    </button>
                    <button
                      onClick={() => setColorMode('bw')}
                      className={`py-1.5 rounded-lg text-xs font-bold ${colorMode === 'bw' ? 'bg-primary text-white shadow-sm' : 'text-on-surface/60'}`}
                      title="عالي التباين للطابعات الحرارية والليزر"
                    >
                      أبيض وأسود
                    </button>
                    <button
                      onClick={() => setColorMode('grayscale')}
                      className={`py-1.5 rounded-lg text-xs font-bold ${colorMode === 'grayscale' ? 'bg-primary text-white shadow-sm' : 'text-on-surface/60'}`}
                    >
                      تدرج رمادي
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-bold text-on-surface/70">عدد النسخ لكل ملصق:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCopiesPerItem(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 bg-surface-container rounded-lg border border-outline/20 font-black flex items-center justify-center hover:bg-surface-container-high"
                    >
                      -
                    </button>
                    <span className="font-black text-primary w-6 text-center">{copiesPerItem}</span>
                    <button
                      onClick={() => setCopiesPerItem(prev => Math.min(20, prev + 1))}
                      className="w-7 h-7 bg-surface-container rounded-lg border border-outline/20 font-black flex items-center justify-center hover:bg-surface-container-high"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Info notice */}
              <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-primary text-[11px] leading-relaxed">
                <strong className="block mb-1">💡 توجيهات الاستعمال المخبري:</strong>
                هذه الملصقات صممت لتلصق مباشرة فوق الجهاز أو المعدة المخبرية بعد قصها بالمقص أو عبر ورق الملصقات اللاصقة (A4 Sticker Sheets). يحتوي كل ملصق على رقم الجرد العام ورمز QR محلي فوري.
              </div>
            </aside>

            {/* Live Preview Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {/* Zoom & Viewport Bar */}
              <div className="px-6 py-2.5 bg-surface border-b border-outline/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface/60">معاينة مباشرة للصفحة:</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-mono font-bold text-primary">
                    A4 Portrait · {targetItems.length} صنف · {totalStickers} ملصق إجمالي
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-xl border border-outline/10">
                  <button
                    onClick={() => setZoom(prev => Math.max(50, prev - 15))}
                    className="p-1 hover:bg-surface-container rounded text-on-surface/60 hover:text-primary transition-colors"
                    title="تصغير"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-2 font-mono font-bold text-primary text-xs">{zoom}%</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(160, prev + 15))}
                    className="p-1 hover:bg-surface-container rounded text-on-surface/60 hover:text-primary transition-colors"
                    title="تكبير"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    className="p-1 hover:bg-surface-container rounded text-on-surface/60 hover:text-primary transition-colors"
                    title="إعادة ضبط"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>

              {/* Zoomable Iframe Preview Container */}
              <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-slate-100 dark:bg-zinc-900 custom-scrollbar">
                <div 
                  style={{ 
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="shadow-2xl rounded-sm bg-white overflow-hidden"
                >
                  <iframe
                    title="معاينة ملصقات الجرد"
                    srcDoc={generatedHtml}
                    className="w-[210mm] min-h-[297mm] border-0 bg-white"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </main>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
