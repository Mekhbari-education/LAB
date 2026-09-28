import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, 
  Save, 
  RotateCcw, 
  FileCheck, 
  Sliders, 
  Building2, 
  Layout, 
  Palette, 
  PenTool, 
  QrCode,
  CheckCircle2,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';
import { usePrintSettings } from '../../context/PrintSettingsContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  PrintPaperSize, 
  PrintOrientation, 
  PrintMargins, 
  PrintScale, 
  PrintColorMode, 
  PrintHeaderStyle,
  QRStickerPreset 
} from '../../types/printSettings';
import logo from '/ministry-logo.png';

export default function PrintSettingsTab() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    saveSettingsToCloud, 
    isSaving,
    printTestPage,
    openPrintPreview
  } = usePrintSettings();

  const { schoolName } = useSchool();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);

  const inst = settings.institution;
  const layout = settings.layout;
  const app = settings.appearance;
  const sig = settings.signatures;
  const qr = settings.qrSticker;

  const handleSave = async () => {
    const success = await saveSettingsToCloud();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    try {
      await printTestPage();
    } catch (e) {
      console.error('Test print error:', e);
    } finally {
      setIsTestPrinting(false);
    }
  };

  const handlePreviewTestPage = () => {
    openPrintPreview({
      title: 'تقرير تجريبي لمعاينة إعدادات الطباعة',
      subtitle: `فحص رسمي للهوامش والترويسة — ${inst.school}`,
      type: 'table',
      headers: ['#', 'المكون / الإعداد', 'القيمة الحالية', 'الحالة والملاحظة'],
      rows: [
        ['1', 'حجم الورق', layout.paperSize.toUpperCase(), 'متطابق مع قياس A4 القياسي'],
        ['2', 'اتجاه الصفحة', layout.orientation === 'portrait' ? 'عمودي' : 'أفقي', 'جاهز للطباعة'],
        ['3', 'حجم الهوامش', layout.margins, 'حدود متوازنة لمنع اقتطاع النصوص'],
        ['4', 'نمط الألوان', app.colorMode, 'حسب اختيار المستخدم'],
        ['5', 'المؤسسة والمخبر', `${inst.school} — ${inst.laboratory}`, 'بيانات معتمدة']
      ],
      summaryCards: [
        { label: 'الورق', value: layout.paperSize.toUpperCase() },
        { label: 'النمط', value: app.colorMode },
        { label: 'الهامش', value: layout.margins },
        { label: 'التاريخ', value: new Date().toLocaleDateString('ar-DZ') }
      ],
      notes: 'تتيح لك هذه المعاينة التأكد من صحة الترويسة والأختام وتنسيق الجداول قبل إرسال الوثيقة الفعلية إلى الطابعة.'
    });
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* Top Banner & Quick Actions */}
      <div className="asymmetric-card bg-surface-container p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_12px_32px_rgba(65,84,55,0.06)] border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Printer size={26} />
            </span>
            <h3 className="text-2xl font-black text-primary">إعدادات الطباعة والوثائق الرسمية</h3>
          </div>
          <p className="text-secondary text-sm max-w-2xl leading-relaxed">
            تخصيص الترويسة الوزارية الرسمية، هوامش الورق، التأشيرات والأختام، خيارات توفير الحبر (Eco Mode)، ونماذج ملصقات QR لتتوافق بدقة مع معايير وزارة التربية الوطنية الجزائرية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePreviewTestPage}
            className="px-5 py-3 rounded-2xl font-bold bg-surface hover:bg-secondary-container/40 text-primary border border-outline-variant/40 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Eye size={18} />
            <span>معاينة فورية</span>
          </button>

          <button
            onClick={handleTestPrint}
            disabled={isTestPrinting}
            className="px-5 py-3 rounded-2xl font-bold bg-tertiary text-on-tertiary hover:shadow-lg hover:shadow-tertiary/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Printer size={18} />
            <span>{isTestPrinting ? 'جاري الفحص...' : 'طباعة صفحة فحص'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3 font-bold"
        >
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span>تم حفظ إعدادات الطباعة سحابياً بنجاح وتطبيقها على كافة الوثائق والتقارير.</span>
        </motion.div>
      )}

      {/* 1. Official Header Section */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-primary">الترويسة الوزارية والهوية الرسمية</h4>
              <p className="text-xs text-secondary">البيانات التي تظهر أعلى كافة تقارير وسجلات المخبر</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">عنوان الجمهورية</label>
            <input
              type="text"
              value={inst.country}
              onChange={(e) => updateSettings({ institution: { ...inst, country: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">الوزارة الوصية</label>
            <input
              type="text"
              value={inst.ministry}
              onChange={(e) => updateSettings({ institution: { ...inst, ministry: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">مديرية التربية</label>
            <input
              type="text"
              value={inst.directorate}
              onChange={(e) => updateSettings({ institution: { ...inst, directorate: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">المؤسسة التعليمية</label>
            <input
              type="text"
              value={inst.school}
              onChange={(e) => updateSettings({ institution: { ...inst, school: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">البلدية</label>
            <input
              type="text"
              value={inst.commune || ''}
              onChange={(e) => updateSettings({ institution: { ...inst, commune: e.target.value } })}
              placeholder="مثال: عين كرشة"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">اسم وتسمية المخبر</label>
            <input
              type="text"
              value={inst.laboratory}
              onChange={(e) => updateSettings({ institution: { ...inst, laboratory: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">السنة الدراسية الحالية</label>
            <input
              type="text"
              value={inst.academicYear}
              onChange={(e) => updateSettings({ institution: { ...inst, academicYear: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/20">
          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-secondary-container/20 transition-colors">
            <input
              type="checkbox"
              checked={inst.showRepublicHeader}
              onChange={(e) => updateSettings({ institution: { ...inst, showRepublicHeader: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار عنوان الجمهورية</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-secondary-container/20 transition-colors">
            <input
              type="checkbox"
              checked={inst.showMinistry}
              onChange={(e) => updateSettings({ institution: { ...inst, showMinistry: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار اسم الوزارة</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-secondary-container/20 transition-colors">
            <input
              type="checkbox"
              checked={inst.showLogo}
              onChange={(e) => updateSettings({ institution: { ...inst, showLogo: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-secondary">إظهار الشعار في الترويسة</span>
              {inst.customLogoUrl && (
                <span className="text-[10px] text-emerald-700 font-bold">شعار مخصص نشط</span>
              )}
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-secondary-container/20 transition-colors">
            <input
              type="checkbox"
              checked={inst.showDate}
              onChange={(e) => updateSettings({ institution: { ...inst, showDate: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار تاريخ الطباعة</span>
          </label>
        </div>
      </section>

      {/* 2. Paper & Layout Settings */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <Layout size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-primary">إعدادات الورق والتخطيط (Layout & Paper)</h4>
              <p className="text-xs text-secondary">تحديد مقاس الورق، اتجاه الصفحة، والهوامش الافتراضية</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paper Size */}
          <div>
            <label className="block text-xs font-bold text-secondary mb-2">حجم الورق القياسي</label>
            <div className="grid grid-cols-3 gap-2">
              {(['a4', 'a3', 'letter'] as PrintPaperSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateSettings({ layout: { ...layout, paperSize: size } })}
                  className={`py-3 px-2 rounded-xl text-xs font-black uppercase transition-all border ${
                    layout.paperSize === size
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container text-secondary border-outline-variant/20 hover:bg-secondary-container/30'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-1.5">A4 هو المقاس الإداري المعتمد في المؤسسات التعليمية.</p>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-bold text-secondary mb-2">الاتجاه الافتراضي للتقارير</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'portrait', label: 'عمودي' },
                { id: 'landscape', label: 'أفقي' },
                { id: 'auto', label: 'تلقائي' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ layout: { ...layout, orientation: item.id as PrintOrientation } })}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    layout.orientation === item.id
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container text-secondary border-outline-variant/20 hover:bg-secondary-container/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-1.5">يُفضل التقرير اليومي والجداول العريضة بالوضع الأفقي.</p>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-bold text-secondary mb-2">هوامش الصفحة</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'مضغوطة (8mm)' },
                { id: 'standard', label: 'قياسية (14mm)' },
                { id: 'spacious', label: 'واسعة (20mm)' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ layout: { ...layout, margins: item.id as PrintMargins } })}
                  className={`py-3 px-1.5 rounded-xl text-[11px] font-bold transition-all border text-center ${
                    layout.margins === item.id
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container text-secondary border-outline-variant/20 hover:bg-secondary-container/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-1.5">الهوامش المضغوطة تستوعب بنوداً أكثر بالصفحة الواحدة.</p>
          </div>
        </div>

        {/* Scale & Font */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/20">
          <div>
            <label className="block text-xs font-bold text-secondary mb-2">مقياس حجم الخطوط</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: '85% مدمج' },
                { id: 'normal', label: '100% عادي' },
                { id: 'large', label: '115% مكبر' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ layout: { ...layout, fontSizeScale: item.id as PrintScale } })}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    layout.fontSizeScale === item.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-container text-secondary border-outline-variant/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-2">نوع الخط العربي في التقارير</label>
            <select
              value={layout.fontFamily}
              onChange={(e) => updateSettings({ layout: { ...layout, fontFamily: e.target.value as any } })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm font-semibold"
            >
              <option value="Cairo">خط القاهرة الرسمي (Cairo - الافتراضي للمنصة)</option>
              <option value="Amiri">خط أميري الكلاسيكي (Amiri - خط نصوص تقليدي)</option>
              <option value="ManaraDocs">خط وثائق المنارة المدمج (ManaraDocs)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Color & Eco-Friendly Modes */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <Palette size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-primary">خيارات الألوان واستهلاك الحبر (Eco Printing)</h4>
              <p className="text-xs text-secondary">تحكم دقيق لتوفير حبر الطابعة وتكييف الوثائق لآلات النسخ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'color',
              title: 'ملون كامل رسمي',
              desc: 'ألوان المنظومة التعليمية الكاملة مع خلفيات خضراء أنيقة للترويسة.'
            },
            {
              id: 'grayscale',
              title: 'تدرج رمادي اقتصادي (Eco)',
              desc: 'يقلل استهلاك خراطيش الحبر الملون بنسبة 80%، مناسب للطباعة اليومية.'
            },
            {
              id: 'blackAndWhite',
              title: 'أبيض وأسود عالي التباين',
              desc: 'بدون أي تظليل، حدود واضحة تماماً ومثالية لآلات التصوير والمسح الضوئي.'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => updateSettings({ appearance: { ...app, colorMode: item.id as PrintColorMode } })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                app.colorMode === item.id
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-outline-variant/30 bg-surface hover:bg-secondary-container/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary text-sm">{item.title}</span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  app.colorMode === item.id ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {app.colorMode === item.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20">
          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={app.tableStriped}
              onChange={(e) => updateSettings({ appearance: { ...app, tableStriped: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">تظليل الصفوف المتناوبة في الجداول</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={app.compactRows}
              onChange={(e) => updateSettings({ appearance: { ...app, compactRows: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">ضغط أسطر الجداول لتقليل عدد الصفحات</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={app.highContrastBorders}
              onChange={(e) => updateSettings({ appearance: { ...app, highContrastBorders: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">حدود واضحة داكنة لتسهيل القراءة</span>
          </label>
        </div>
      </section>

      {/* 4. Signatures & Official Seals */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <PenTool size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-primary">التأشيرات والأختام الرسمية للمؤسسة</h4>
              <p className="text-xs text-secondary">تحديد المسميات الإدارية وخانات التوقيع أسفل كل تقرير</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-secondary">تفعيل بلوك التأشيرات</span>
            <input
              type="checkbox"
              checked={sig.showSignatures}
              onChange={(e) => updateSettings({ signatures: { ...sig, showSignatures: e.target.checked } })}
              className="w-5 h-5 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>

        {sig.showSignatures && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                <label className="flex items-center justify-between font-bold text-xs text-primary">
                  <span>خانة المسؤول عن المخبر</span>
                  <input
                    type="checkbox"
                    checked={sig.showLabManager}
                    onChange={(e) => updateSettings({ signatures: { ...sig, showLabManager: e.target.checked } })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <input
                  type="text"
                  value={sig.labManagerTitle}
                  onChange={(e) => updateSettings({ signatures: { ...sig, labManagerTitle: e.target.value } })}
                  placeholder="الصفة الرسمية (مثال: المسؤول عن المخبر)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold"
                />
              </div>

              <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                <label className="flex items-center justify-between font-bold text-xs text-primary">
                  <span>خانة مدير المؤسسة التعليمية</span>
                  <input
                    type="checkbox"
                    checked={sig.showPrincipal}
                    onChange={(e) => updateSettings({ signatures: { ...sig, showPrincipal: e.target.checked } })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <input
                  type="text"
                  value={sig.principalTitle}
                  onChange={(e) => updateSettings({ signatures: { ...sig, principalTitle: e.target.value } })}
                  placeholder="الصفة (مثال: مدير(ة) المؤسسة)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold"
                />
              </div>

              <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                <label className="flex items-center justify-between font-bold text-xs text-primary">
                  <span>خانة الأستاذ المؤطر (للحصص والتجارب)</span>
                  <input
                    type="checkbox"
                    checked={sig.showTeacher}
                    onChange={(e) => updateSettings({ signatures: { ...sig, showTeacher: e.target.checked } })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <input
                  type="text"
                  value={sig.teacherTitle}
                  onChange={(e) => updateSettings({ signatures: { ...sig, teacherTitle: e.target.value } })}
                  placeholder="الصفة (مثال: الأستاذ المؤطر)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold"
                />
              </div>

              <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                <label className="flex items-center justify-between font-bold text-xs text-primary">
                  <span>خانة مفتش التربية الوطنية للزيارات</span>
                  <input
                    type="checkbox"
                    checked={sig.showInspector}
                    onChange={(e) => updateSettings({ signatures: { ...sig, showInspector: e.target.checked } })}
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
                <input
                  type="text"
                  value={sig.inspectorTitle}
                  onChange={(e) => updateSettings({ signatures: { ...sig, inspectorTitle: e.target.value } })}
                  placeholder="الصفة (مثال: مفتش المادة)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={sig.reserveStampSpace}
                  onChange={(e) => updateSettings({ signatures: { ...sig, reserveStampSpace: e.target.checked } })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-xs font-bold text-secondary">حجز مساحة دائرية مخصصة للختم الإداري للمؤسسة</span>
              </label>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">العبارة الإدارية في تذييل الصفحة</label>
                <input
                  type="text"
                  value={sig.customDisclaimer}
                  onChange={(e) => updateSettings({ signatures: { ...sig, customDisclaimer: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. QR Code Stickers Presets */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <QrCode size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-primary">تخطيط قصاصات وملصقات QR والأجهزة</h4>
              <p className="text-xs text-secondary">تجهيز قياسات شبكة الملصقات اللاصقة (Stickers Paper Sheets) بحسب المقاس الورقي</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: '2x4',
              cols: 2,
              rows: 4,
              w: 99.1,
              h: 67.7,
              title: '8 قصاصات بالصفحة (2×4)',
              desc: 'حجم كبير مخصص للأجهزة الكبيرة (موازين، مجاهر، حواسيب، مولدات)'
            },
            {
              id: '3x7',
              cols: 3,
              rows: 7,
              w: 63.5,
              h: 38.1,
              title: '21 قصاصة بالصفحة (3×7)',
              desc: 'المقاس القياسي الأكثر انتشاراً لقوارير المواد الكيميائية والأدوات'
            },
            {
              id: '4x8',
              cols: 4,
              rows: 8,
              w: 48.5,
              h: 25.4,
              title: '32 قصاصة بالصفحة (4×8)',
              desc: 'ملصقات مدمجة وصغيرة لأنابيب الاختبار والزجاجيات الدقيقة'
            }
          ].map((preset) => (
            <div
              key={preset.id}
              onClick={() => updateSettings({
                qrSticker: {
                  ...qr,
                  preset: preset.id as QRStickerPreset,
                  gridColumns: preset.cols,
                  gridRows: preset.rows,
                  stickerWidthMm: preset.w,
                  stickerHeightMm: preset.h
                }
              })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                qr.preset === preset.id
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-outline-variant/30 bg-surface hover:bg-secondary-container/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary text-sm">{preset.title}</span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  qr.preset === preset.id ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {qr.preset === preset.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">{preset.desc}</p>
              <div className="mt-3 text-[11px] font-mono text-secondary">
                الأبعاد التقريبية: {preset.w} × {preset.h} ملم
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/20">
          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={qr.showLogo}
              onChange={(e) => updateSettings({ qrSticker: { ...qr, showLogo: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار شعار الوزارة في القصاصة</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={qr.showSchoolName}
              onChange={(e) => updateSettings({ qrSticker: { ...qr, showSchoolName: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار اسم المؤسسة</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={qr.showItemCode}
              onChange={(e) => updateSettings({ qrSticker: { ...qr, showItemCode: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار الرقم المعرف (ID)</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={qr.showStorageLocation}
              onChange={(e) => updateSettings({ qrSticker: { ...qr, showStorageLocation: e.target.checked } })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-secondary">إظهار مكان التخزين (الرف)</span>
          </label>
        </div>
      </section>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-outline-variant/20">
        <button
          onClick={resetSettings}
          className="text-secondary hover:text-red-600 flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <RotateCcw size={16} />
          <span>استعادة الإعدادات الرسمية الافتراضية</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestPrint}
            disabled={isTestPrinting}
            className="px-6 py-3 rounded-2xl font-bold bg-surface border border-outline-variant/40 hover:bg-secondary-container/40 text-primary transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Printer size={18} />
            <span>طباعة صفحة فحص</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm shadow-md"
          >
            <Save size={18} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
