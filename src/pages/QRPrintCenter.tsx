import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { PrintService } from '../services/printService';
import { getEquipment } from '../lib/api/equipment';
import { getChemicals } from '../lib/api/chemicals';
import { 
  CheckSquare, 
  Square, 
  Printer, 
  FlaskConical, 
  Monitor, 
  Sliders, 
  Eye, 
  Layers, 
  Settings as SettingsIcon,
  Search,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { QRStickerPreset } from '../types/printSettings';
import logo from '/ministry-logo.png';

interface Equipment {
  id: string;
  name: string;
  type: string;
  location?: string;
}

interface Chemical {
  id: string;
  nameAr: string;
  nameEn: string;
  shelf?: string;
  state?: string;
}

type TabType = 'equipment' | 'chemicals';

export default function QRPrintCenter() {
  const { schoolId, schoolName } = useSchool();
  const { settings, updateSettings } = usePrintSettings();
  const [activeTab, setActiveTab] = useState<TabType>('equipment');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [chemicalList, setChemicalList] = useState<Chemical[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ 
    id: string; 
    name: string; 
    qrValue: string; 
    collection: string;
    category?: string;
    location?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const qrConfig = settings.qrSticker;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqData, chData] = await Promise.all([
        getEquipment(),
        getChemicals()
      ]);
      setEquipmentList(eqData.map(e => ({ 
        id: e.id, 
        name: e.name, 
        type: e.type || 'معدات',
        location: (e as any).location || (e as any).cabinet || 'المخبر الرئيسي'
      })));
      setChemicalList(chData.map(c => ({ 
        id: c.id, 
        nameAr: c.nameAr, 
        nameEn: c.nameEn || '',
        shelf: c.shelf || 'الرف العام',
        state: c.state
      })));
    } catch (error) {
      console.error('Error fetching data for QR print:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChemicals = chemicalList.filter(c => 
    (c.nameAr && c.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.nameEn && c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (item: { id: string; name: string; collection: string; category?: string; location?: string }) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, { 
          id: item.id, 
          name: item.name, 
          qrValue: `APP_ID_${item.id}_${item.collection}`, 
          collection: item.collection,
          category: item.category,
          location: item.location
        }];
      }
    });
  };

  const selectAllFiltered = () => {
    if (activeTab === 'equipment') {
      const allSelected = filteredEquipment.length > 0 && filteredEquipment.every(eq => selectedItems.some(i => i.id === eq.id));
      if (allSelected) {
        setSelectedItems(prev => prev.filter(i => !filteredEquipment.some(eq => eq.id === i.id)));
      } else {
        const newItems = filteredEquipment
          .filter(eq => !selectedItems.some(i => i.id === eq.id))
          .map(eq => ({ 
            id: eq.id, 
            name: eq.name, 
            qrValue: `APP_ID_${eq.id}_equipment`, 
            collection: 'equipment',
            category: eq.type,
            location: eq.location
          }));
        setSelectedItems(prev => [...prev, ...newItems]);
      }
    } else {
      const allSelected = filteredChemicals.length > 0 && filteredChemicals.every(ch => selectedItems.some(i => i.id === ch.id));
      if (allSelected) {
        setSelectedItems(prev => prev.filter(i => !filteredChemicals.some(ch => ch.id === i.id)));
      } else {
        const newItems = filteredChemicals
          .filter(ch => !selectedItems.some(i => i.id === ch.id))
          .map(ch => ({ 
            id: ch.id, 
            name: ch.nameAr || ch.nameEn || 'مادة بدون اسم', 
            qrValue: `APP_ID_${ch.id}_chemicals`, 
            collection: 'chemicals',
            category: ch.state === 'solid' ? 'صلب' : ch.state === 'liquid' ? 'سائل' : 'غاز',
            location: ch.shelf
          }));
        setSelectedItems(prev => [...prev, ...newItems]);
      }
    }
  };

  const isAllSelected = () => {
    if (activeTab === 'equipment' && filteredEquipment.length > 0) {
      return filteredEquipment.every(eq => selectedItems.some(i => i.id === eq.id));
    } else if (activeTab === 'chemicals' && filteredChemicals.length > 0) {
      return filteredChemicals.every(ch => selectedItems.some(i => i.id === ch.id));
    }
    return false;
  };

  const handlePrintStickers = async () => {
    if (selectedItems.length === 0) return;
    setIsPrinting(true);
    try {
      const html = PrintService.generateStickersHtml(selectedItems, settings);
      await PrintService.printHtml(html, { title: 'ملصقات وقصاصات المخبر' });
    } catch (e) {
      console.error('Error printing stickers:', e);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePresetChange = (preset: QRStickerPreset) => {
    let cols = 3;
    let rows = 7;
    let w = 63.5;
    let h = 38.1;

    if (preset === '2x4') {
      cols = 2; rows = 4; w = 99.1; h = 67.7;
    } else if (preset === '4x8') {
      cols = 4; rows = 8; w = 48.5; h = 25.4;
    }

    updateSettings({
      qrSticker: {
        ...qrConfig,
        preset,
        gridColumns: cols,
        gridRows: rows,
        stickerWidthMm: w,
        stickerHeightMm: h
      }
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-32" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Printer size={26} />
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-primary">مركز طباعة القصاصات والباركود</h1>
          </div>
          <p className="text-base text-secondary max-w-2xl leading-relaxed">
            توليد وطباعة بطاقات التعريف الدائمة المزودة برموز QR ولصقها على التجهيزات والمواد الكيميائية بدقة واحترافية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`px-5 py-3 rounded-2xl font-bold border transition-all flex items-center gap-2 text-sm shadow-sm ${
              showConfigDrawer
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-secondary hover:bg-secondary-container/30 border-outline-variant/30'
            }`}
          >
            <Sliders size={18} />
            <span>تنسيق الملصقات ({qrConfig.preset})</span>
          </button>

          <button
            onClick={handlePrintStickers}
            disabled={selectedItems.length === 0 || isPrinting}
            className="flex-1 md:flex-initial px-8 py-3.5 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <Printer size={20} />
            <span>{isPrinting ? 'جاري الإرسال للطابعة...' : `طباعة القصاصات (${selectedItems.length})`}</span>
          </button>
        </div>
      </header>

      {/* Preset & Configuration Bar */}
      <AnimatePresence>
        {showConfigDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface rounded-3xl p-6 mb-8 border border-outline-variant/30 shadow-md space-y-6 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2 font-bold text-primary text-sm">
                <Layers size={18} />
                <span>اختر نموذج ورقة الملصقات (Sticker Sheet Preset)</span>
              </div>
              <span className="text-xs text-secondary">
                حجم القصاصة الحالية: {qrConfig.stickerWidthMm} × {qrConfig.stickerHeightMm} ملم
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: '2x4', title: '8 ملصقات بالصفحة (2×4)', desc: 'كبيرة للأجهزة الثقيلة والمجاهر' },
                { id: '3x7', title: '21 ملصق بالصفحة (3×7)', desc: 'قياسية لقوارير الكواشف والأدوات' },
                { id: '4x8', title: '32 ملصق بالصفحة (4×8)', desc: 'صغيرة للأنابيب والزجاجيات الدقيقة' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id as QRStickerPreset)}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${
                    qrConfig.preset === p.id
                      ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                      : 'border-outline-variant/30 bg-surface-container text-secondary hover:bg-secondary-container/30'
                  }`}
                >
                  <div className="text-sm font-black mb-1">{p.title}</div>
                  <div className="text-xs opacity-75">{p.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-outline-variant/20">
              <label className="flex items-center gap-2 text-xs font-bold text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={qrConfig.showLogo}
                  onChange={(e) => updateSettings({ qrSticker: { ...qrConfig, showLogo: e.target.checked } })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>شعار الوزارة</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={qrConfig.showSchoolName}
                  onChange={(e) => updateSettings({ qrSticker: { ...qrConfig, showSchoolName: e.target.checked } })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>اسم المؤسسة</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={qrConfig.showItemCode}
                  onChange={(e) => updateSettings({ qrSticker: { ...qrConfig, showItemCode: e.target.checked } })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>معرف الجهاز (ID)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={qrConfig.showStorageLocation}
                  onChange={(e) => updateSettings({ qrSticker: { ...qrConfig, showStorageLocation: e.target.checked } })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>مكان الحفظ والرف</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 border-b border-outline-variant/30 pb-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'equipment'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container hover:bg-secondary-container/40 text-secondary'
            }`}
          >
            <Monitor size={18} />
            <span>العتاد والأجهزة ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chemicals')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'chemicals'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container hover:bg-secondary-container/40 text-secondary'
            }`}
          >
            <FlaskConical size={18} />
            <span>المواد الكيميائية ({chemicalList.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-secondary opacity-60" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المعرف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-surface border border-outline-variant/30 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Selected Items Counter Badge */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-between text-xs font-bold">
          <span>تم تحديد {selectedItems.length} عنصر للطباعة</span>
          <button 
            onClick={() => setSelectedItems([])}
            className="text-secondary hover:text-red-600 underline"
          >
            إلغاء التحديد بالكامل
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-secondary font-bold animate-pulse">جاري تحميل البيانات...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-surface-container text-secondary text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 w-16 text-center">
                    <button onClick={selectAllFiltered} className="text-primary hover:text-primary/80 transition-colors">
                      {isAllSelected() ? <CheckSquare size={22} /> : <Square size={22} />}
                    </button>
                  </th>
                  <th className="p-4">الاسم والتسمية الرسمية</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">مكان التخزين</th>
                  <th className="p-4 w-44 text-left">المعرف الفردي (ID)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {activeTab === 'equipment' && filteredEquipment.map(eq => {
                  const isSelected = selectedItems.some(i => i.id === eq.id);
                  return (
                    <tr
                      key={eq.id}
                      className={`hover:bg-secondary-container/20 transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => toggleSelection({ 
                        id: eq.id, 
                        name: eq.name, 
                        collection: 'equipment',
                        category: eq.type,
                        location: eq.location
                      })}
                    >
                      <td className="p-4 text-center">
                        {isSelected ? (
                          <CheckSquare size={18} className="text-primary mx-auto" />
                        ) : (
                          <Square size={18} className="text-secondary opacity-60 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 font-bold text-primary">{eq.name}</td>
                      <td className="p-4 text-secondary text-xs">{eq.type}</td>
                      <td className="p-4 text-secondary text-xs">{eq.location || 'المخبر الرئيسي'}</td>
                      <td className="p-4 text-xs font-mono text-secondary text-left">{eq.id}</td>
                    </tr>
                  );
                })}

                {activeTab === 'chemicals' && filteredChemicals.map(ch => {
                  const isSelected = selectedItems.some(i => i.id === ch.id);
                  const nameToUse = ch.nameAr || ch.nameEn || 'مادة بدون اسم';
                  const cat = ch.state === 'solid' ? 'صلب' : ch.state === 'liquid' ? 'سائل' : 'غاز';
                  return (
                    <tr
                      key={ch.id}
                      className={`hover:bg-secondary-container/20 transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => toggleSelection({ 
                        id: ch.id, 
                        name: nameToUse, 
                        collection: 'chemicals',
                        category: cat,
                        location: ch.shelf
                      })}
                    >
                      <td className="p-4 text-center">
                        {isSelected ? (
                          <CheckSquare size={18} className="text-primary mx-auto" />
                        ) : (
                          <Square size={18} className="text-secondary opacity-60 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 font-bold text-primary">
                        <div>{nameToUse}</div>
                        {ch.nameEn && <div className="text-[11px] font-mono text-secondary opacity-70">{ch.nameEn}</div>}
                      </td>
                      <td className="p-4 text-secondary text-xs">{cat}</td>
                      <td className="p-4 text-secondary text-xs">{ch.shelf || 'الرف العام'}</td>
                      <td className="p-4 text-xs font-mono text-secondary text-left">{ch.id}</td>
                    </tr>
                  );
                })}

                {activeTab === 'equipment' && filteredEquipment.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-secondary">
                      لا توجد أجهزة مطابقة لخيارات البحث.
                    </td>
                  </tr>
                )}

                {activeTab === 'chemicals' && filteredChemicals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-secondary">
                      لا توجد مواد كيميائية مطابقة لخيارات البحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Sample Sticker Card Preview */}
      {selectedItems.length > 0 && (
        <div className="mt-8 bg-surface-container rounded-3xl p-6 border border-outline-variant/30">
          <div className="text-xs font-bold text-secondary mb-3 flex items-center gap-2">
            <Eye size={16} />
            <span>معاينة حية لشكل القصاصة المطبوعة:</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {selectedItems.slice(0, 3).map(item => (
              <div
                key={item.id}
                style={{
                  width: `${qrConfig.stickerWidthMm * 3.5}px`,
                  minHeight: `${qrConfig.stickerHeightMm * 2.8}px`
                }}
                className="bg-white text-neutral-900 border border-neutral-300 rounded-xl p-3 shadow-md flex items-center justify-between gap-3 text-right"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {qrConfig.showLogo && <img src={logo} alt="" className="h-4 w-auto" />}
                    {qrConfig.showSchoolName && (
                      <span className="text-[9px] font-bold text-primary truncate">{schoolName || 'المؤسسة التعليمية'}</span>
                    )}
                  </div>
                  <div className="text-xs font-black text-neutral-800 line-clamp-2 leading-tight mb-1">
                    {item.name}
                  </div>
                  <div className="text-[9px] text-neutral-500 flex gap-2">
                    {qrConfig.showCategory && item.category && <span>{item.category}</span>}
                    {qrConfig.showStorageLocation && item.location && <span>{item.location}</span>}
                  </div>
                  {qrConfig.showItemCode && (
                    <div className="text-[9px] font-mono text-primary font-bold mt-1">ID: {item.id}</div>
                  )}
                </div>

                <div className="w-14 h-14 bg-white p-1 rounded border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                  <QRCodeSVG value={item.qrValue} size={48} level="M" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
