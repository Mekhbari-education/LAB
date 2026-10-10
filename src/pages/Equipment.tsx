import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import * as XLSX from 'xlsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { 
  Beaker, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileUp,
  History, 
  AlertTriangle,
  CheckCircle,
  Wrench,
  Monitor,
  Trash2,
  Edit,
  X,
  Printer,
  Package,
  Database,
  ArrowLeft,
  Sparkles,
  MoreHorizontal,
  Map,
  FileText,
  RefreshCw,
  FileDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  QrCode,
  Layers,
  Check,
  CheckCircle2,
  Copy,
  Save,
  Eye,
  SlidersHorizontal,
  Table as TableIcon,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatSchoolWithCommune } from '../lib/utils';
import { getEquipmentIntelligence, ensureApiKey } from '../services/geminiService';
import { logActivity, LogAction, LogModule } from '../services/loggingService';
import QRScanner from '../components/QRScanner';

import type { Equipment, MaintenanceLog } from '../types/equipment';
import { useEquipmentLogic } from '../hooks/useEquipmentLogic';
import { useTranslation } from 'react-i18next';

export default function Equipment({ isNested = false }: { isNested?: boolean }) {
  const { t, i18n } = useTranslation();
  const {
    schoolId,
    schoolName,
    directorate,
    commune,
    searchParams,
    navigate,
    equipment,
    loading,
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterExitStatus, setFilterExitStatus,
    isAddModalOpen, setIsAddModalOpen,
    editingEquipment, setEditingEquipment,
    isSmartUpdating,
    isSmartUpdateConfirmOpen, setIsSmartUpdateConfirmOpen,
    bulkProgress,
    sortField,
    sortDirection,
    qrCodeItem, setQrCodeItem,
    isQRModalOpen, setIsQRModalOpen,
    isQRScannerOpen, setIsQRScannerOpen,
    selectedIds, setSelectedIds,
    fileInputRef,
    isImporting,
    isHistoryModalOpen, setIsHistoryModalOpen,
    selectedEquipHistory,
    currentEquipName,
    isAnalyzing,
    isBulkUpdating,
    suggestedUpdate, setSuggestedUpdate,
    isReviewModalOpen, setIsReviewModalOpen,
    isBulkConfirmOpen, setIsBulkConfirmOpen,
    selectedEquipment,
    newEquipment, setNewEquipment,
    handleAddEquipment,
    handleDeleteEquipment,
    handleImportXLS,
    handleDownloadGeneralInventoryTemplate,
    handleExportGeneralInventoryXLS,
    handleUpdateStatus,
    handleInlineUpdate,
    handleQuickAddRow,
    handleDuplicateEquipment,
    fetchHistory,
    handleExportXLS,
    handlePrintList,
    handlePrintInventoryCards,
    handleExportPDF,
    handleExportWord,
    handleSmartUpdate,
    handlePrint,
    handleSort,
    handleToggleSelect,
    handleSelectAll,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleRequestSmartUpdate,
    handleApproveUpdate,
    handleBulkSmartUpdate,
    filteredEquipment,
    rowVirtualizer,
    parentRef,
    totalPieces,
    totalAvailable,
    totalBroken,
    totalTypes,
    totalEstimatedValue
  } = useEquipmentLogic(isNested);

  const [isInlineEditMode, setIsInlineEditMode] = useState<boolean>(true);
  const [saveIndicator, setSaveIndicator] = useState<{ [key: string]: boolean }>({});
  const [isOfficialRegistryModalOpen, setIsOfficialRegistryModalOpen] = useState<boolean>(false);
  const [isFitScreen, setIsFitScreen] = useState<boolean>(true);

  const triggerInlineEdit = (id: string, field: keyof Equipment, val: any) => {
    handleInlineUpdate(id, field, val);
    const key = `${id}_${String(field)}`;
    setSaveIndicator(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSaveIndicator(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 1500);
  };

  return (
    <div className={cn("space-y-12 max-w-7xl mx-auto pb-24 font-sans", !isNested && "px-6")} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Official Algerian Header (Print Only or Toggle) */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-right text-sm font-bold">
            <p>مديرية التربية لولاية: {directorate || 'أم البواقي'}</p>
            <p>{formatSchoolWithCommune(schoolName, commune) || 'المؤسسة التربوية'}</p>
          </div>
          <div className="text-center">
            <p className="font-black text-base">الجمهورية الجزائرية الديمقراطية الشعبية</p>
            <p className="font-bold text-sm">وزارة التربية الوطنية</p>
          </div>
          <div className="text-left text-sm font-bold">
            <p>السنة الدراسية: 2025 - 2026</p>
          </div>
        </div>
        <h2 className="text-center text-2xl font-black underline mt-6">{t('equipment.title', 'جرد مخزون الزجاجيات والعتاد — مخبر الوسائل التعليمية')}</h2>
      </div>

      {/* Header */}
      {!isNested && (
        <header className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-2">
              <Package size={14} />
              {t('equipment.badge', 'إدارة المخزون والعتاد')}
            </div>
            <h1 className="text-4xl font-black text-primary tracking-tighter">{t('equipment.title', 'جرد الزجاجيات والعتاد')}</h1>
            <p className="text-on-surface/60 text-lg font-bold">{t('equipment.subtitle', 'إدارة وتتبع الأدوات الزجاجية والأجهزة التكنولوجية')}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 relative z-10">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportXLS} 
              className="hidden" 
              accept=".xls,.xlsx"
            />
            <button 
              onClick={() => navigate(ROUTES.INVENTORY_CARDS)}
              className="bg-primary text-white px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl active:scale-95"
            >
              <Database size={20} />
              {t('equipment.btn_inventory_cards', 'سجل بطاقات الجرد')}
            </button>
            <button 
              onClick={handlePrintInventoryCards}
              className="bg-surface text-primary border-2 border-primary/10 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95"
            >
              <QrCode size={20} />
              {t('equipment.btn_print_cards', 'طباعة بطاقات الجرد')}
            </button>
            <button 
              onClick={handlePrintList}
              className="bg-surface text-primary border-2 border-primary/10 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95"
            >
              <Printer size={20} />
              {t('equipment.btn_print_list', 'طباعة القائمة')}
            </button>
            <button 
              onClick={handleExportWord}
              className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-2 border-blue-500/30 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
              title="تصدير كملف Word (.doc) رسمي بنفس تفاصيل الـ PDF"
            >
              <FileDown size={20} />
              {t('common.export_word', 'تصدير Word')}
            </button>
            <button 
              onClick={handleExportPDF}
              className="bg-surface text-primary border-2 border-primary/10 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95"
            >
              <FileText size={20} />
              {t('common.export_pdf', 'تصدير PDF')}
            </button>
            <button 
              onClick={() => setIsBulkConfirmOpen(true)}
              disabled={isBulkUpdating}
              className="bg-surface text-primary border-2 border-primary/10 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isBulkUpdating ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              {t('equipment.btn_smart_update', 'تحديث ذكي للكل')}
            </button>
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="bg-surface text-primary border-2 border-primary/10 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95"
            >
              <QrCode size={20} />
              {t('common.scan_qr', 'مسح QR')}
            </button>
            <button 
              onClick={handleDownloadGeneralInventoryTemplate}
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/30 px-5 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"
              title="تحميل نموذج Excel فارغ يطابق تماماً أعمدة سجل الجرد العام الخاص بالمؤسسة (8 أعمدة رسمية)"
            >
              <Download size={20} />
              نموذج سجل الجرد (Excel)
            </button>
            <button 
              onClick={handleExportGeneralInventoryXLS}
              className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-2 border-teal-500/30 px-5 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-teal-500 hover:text-white transition-all shadow-xl active:scale-95"
              title="تصدير بيانات الجرد الحالية إلى ملف Excel بنفس أعمدة سجل الجرد العام الرسمي للمؤسسة"
            >
              <FileDown size={20} />
              تصدير سجل الجرد العام
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-surface text-primary border-2 border-primary/20 px-6 py-3.5 rounded-full font-black flex items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
              title="استيراد ملف Excel مطابق لسجل الجرد العام: رقم التسجيل | تاريخ التكفل بالتسجيل | تعيين الشيء | مصدره | قیمته | التعيين | خروجه | ملاحظات"
            >
              {isImporting ? (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <FileUp size={20} />
              )}
              {t('common.import_xls', 'استيراد سجل الجرد (Excel)')}
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-black flex items-center gap-2 shadow-2xl shadow-primary/30 hover:bg-primary-container hover:shadow-primary/40 transition-all active:scale-95"
            >
              <Plus size={22} />
              {t('equipment.btn_add', 'إضافة صنف')}
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        </header>
      )}

      {/* Quick Access to Specialized Units */}
      {!isNested && (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'الأجهزة التقنية', path: ROUTES.TECH_INVENTORY, icon: Monitor, color: 'bg-primary/5 text-primary' },
            { label: 'جرد الزجاجيات', path: ROUTES.GLASSWARE_BREAKAGE, icon: Beaker, color: 'bg-primary/5 text-primary' },
            { label: 'النماذج الذكية', path: ROUTES.SMART_FORMS, icon: FileText, color: 'bg-primary/5 text-primary' },
            { label: 'النفايات الكيميائية', path: ROUTES.CHEMICAL_WASTE, icon: Trash2, color: 'bg-error/5 text-error' },
            { label: 'الخريطة التربوية', path: ROUTES.EDUCATIONAL_MAP, icon: Map, color: 'bg-primary/5 text-primary' },
            { label: 'المستهلكات & SDS', path: ROUTES.CONSUMABLES_SDS, icon: Package, color: 'bg-primary/5 text-primary' },
          ].map((unit, i) => (
            <motion.a
              key={unit.label}
              href={`#${unit.path}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-[32px] border border-outline/5 shadow-sm hover:shadow-md transition-all group text-center gap-3",
                unit.color
              )}
            >
              <div className="p-3 rounded-2xl bg-surface shadow-sm group-hover:scale-110 transition-transform">
                <unit.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{unit.label}</span>
            </motion.a>
          ))}
        </section>
      )}

      {/* Stats */}
      {!isNested && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: t('equipment.stat_types', 'أصناف العتاد'), value: totalTypes, icon: Layers, color: 'bg-primary/10', textColor: 'text-primary', onClick: () => setFilterStatus('all') },
            { label: t('equipment.stat_total_pieces', 'إجمالي الكميات'), value: totalPieces, icon: Package, color: 'bg-primary/5', textColor: 'text-primary', onClick: () => setFilterStatus('all') },
            { 
              label: 'القيمة التقديرية (دج)', 
              value: totalEstimatedValue > 0 ? `${totalEstimatedValue.toLocaleString('fr-DZ')} دج` : 'قيد التسعير', 
              icon: Coins, 
              color: 'bg-emerald-500/10', 
              textColor: 'text-emerald-700 dark:text-emerald-300',
              onClick: () => {} 
            },
            { label: t('equipment.stat_functional', 'سليمة / جاهزة'), value: totalAvailable, icon: CheckCircle, color: 'bg-green-500/10', textColor: 'text-green-700 dark:text-green-300', onClick: () => setFilterStatus('functional') },
            { label: t('equipment.stat_broken', 'صيانة / مشطوبة'), value: totalBroken, icon: AlertTriangle, color: 'bg-error/10', textColor: 'text-error', onClick: () => setFilterStatus('broken') },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={stat.onClick}
              className={cn(
                "p-5 rounded-3xl border border-outline/5 transition-all group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer",
                stat.color
              )}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-[11px] text-on-surface/60 font-black uppercase tracking-wider">{stat.label}</p>
                <div className="p-2 bg-surface rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
                  <stat.icon size={18} />
                </div>
              </div>
              <div>
                <span className={cn("text-2xl lg:text-3xl font-black tracking-tight block truncate", stat.textColor)}>{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Main Content */}
      <div className="bg-surface rounded-[40px] overflow-hidden shadow-2xl border border-outline/5 relative">
        {/* Controls & Filter Bar */}
        <div className="p-5 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-surface-container-low/40 border-b border-outline/5">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md group">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                className="w-full bg-surface border border-outline/10 rounded-2xl ps-11 pe-4 py-2.5 text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
                placeholder="بحث شامل: التعيين، رقم التسجيل، المصدر، القيمة، الملاحظات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-primary p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-2xl border border-outline/10 shadow-sm">
              <Filter size={15} className="text-primary/40" />
              <select 
                className="bg-transparent border-none text-xs font-black text-primary focus:ring-0 cursor-pointer py-1"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">كل الأنواع</option>
                <option value="glassware">زجاجيات مخبرية</option>
                <option value="tech">أجهزة تقنية</option>
                <option value="smart">تحديث ذكي ✨</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {/* Exit / Active Filter */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-2xl border border-outline/10 shadow-sm">
              <SlidersHorizontal size={15} className="text-primary/40" />
              <select 
                className="bg-transparent border-none text-xs font-black text-primary focus:ring-0 cursor-pointer py-1"
                value={filterExitStatus}
                onChange={(e) => setFilterExitStatus(e.target.value)}
              >
                <option value="all">كل المواد (الحالية + المشطوبة)</option>
                <option value="active">المواد الحالية بالمخبر فقط</option>
                <option value="exited">المواد المشطوبة / الخارجة</option>
              </select>
            </div>
          </div>

          {/* Quick Actions & View Toggles */}
          <div className="flex flex-wrap items-center gap-2.5 justify-end">
            {/* Quick Add Row Button */}
            <button
              onClick={handleQuickAddRow}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="إضافة سطر جديد فارغ مباشرة في الجدول والبدء في تعبئته فوراً"
            >
              <Plus size={16} />
              سطر جديد سريع
            </button>

            {/* Toggle Inline Edit Mode */}
            <button 
              onClick={() => setIsInlineEditMode(!isInlineEditMode)}
              className={cn(
                "px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm border active:scale-95",
                isInlineEditMode 
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20" 
                  : "bg-surface border-outline/10 text-on-surface/60 hover:text-primary"
              )}
              title="تفعيل/تعطيل التعديل المباشر كبرنامج إكسل"
            >
              <Edit size={15} />
              <span>تعديل مباشر في الجدول</span>
              <span className={cn("w-2 h-2 rounded-full", isInlineEditMode ? "bg-amber-500 animate-pulse" : "bg-outline/40")} />
            </button>

            {/* Official Registry View Button */}
            <button 
              onClick={() => setIsOfficialRegistryModalOpen(true)}
              className="bg-surface text-primary border border-outline/10 hover:border-primary/40 px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="معاينة سجل الجرد العام الرسمي وفق النموذج الوزاري الجزائري جاهز للطباعة"
            >
              <FileText size={15} />
              معاينة السجل الرسمي
            </button>

            {/* Screen Fit Mode Toggle */}
            <button
              onClick={() => setIsFitScreen(!isFitScreen)}
              className={cn(
                "px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm border",
                isFitScreen ? "bg-primary/10 border-primary/20 text-primary" : "bg-surface border-outline/10 text-on-surface/60"
              )}
              title={isFitScreen ? "الجدول ملائم لعرض الشاشة 100% بدون تمرير أفقي" : "الجدول بنمط موسّع"}
            >
              <TableIcon size={15} />
              {isFitScreen ? "ملائم للشاشة (بدون تمرير)" : "عرض موسّع"}
            </button>
          </div>
        </div>

        {/* The Zero-Horizontal-Scroll Table */}
        <div 
          className={cn(
            "overflow-y-auto max-h-[720px] custom-scrollbar",
            isFitScreen ? "overflow-x-hidden w-full" : "overflow-x-auto"
          )} 
          ref={parentRef}
        >
          <table className={cn("w-full text-right border-collapse", isFitScreen ? "table-fixed text-xs" : "min-w-[1250px] text-xs")}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-surface-container-low text-on-surface/60 text-[11px] font-black uppercase tracking-wider border-b border-outline/10">
                <th className={cn("py-3 text-center", isFitScreen ? "w-9" : "w-10")}>
                  <div 
                    onClick={handleSelectAll}
                    className={cn(
                      "w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-all mx-auto",
                      selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0
                        ? "bg-primary border-primary text-white" 
                        : "border-outline/30 hover:border-primary/50"
                    )}
                  >
                    {selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0 && <CheckCircle size={10} />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-20" : "w-24")} onClick={() => handleSort('serialNumber')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>رقم التسجيل</span>
                    {sortField === 'serialNumber' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-24" : "w-28")} onClick={() => handleSort('registrationDate')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>تاريخ التكفل</span>
                    {sortField === 'registrationDate' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-2 text-start", isFitScreen ? "w-[22%]" : "w-64")} onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>تعيين الشيء</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-14" : "w-16")} onClick={() => handleSort('totalQuantity')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>الكمية</span>
                    {sortField === 'totalQuantity' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-[11%]" : "w-28")} onClick={() => handleSort('source')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>مصدره</span>
                    {sortField === 'source' || sortField === 'supplier' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-20" : "w-24")} onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>قیمته</span>
                    {sortField === 'price' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-[10%]" : "w-28")} onClick={() => handleSort('location')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>التعيين</span>
                    {sortField === 'location' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-20" : "w-24")} onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>الحالة</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center cursor-pointer hover:text-primary transition-colors whitespace-nowrap px-1", isFitScreen ? "w-20" : "w-24")} onClick={() => handleSort('exitDate')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>خروجه</span>
                    {sortField === 'exitDate' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : <ArrowUpDown size={12} className="opacity-20" />}
                  </div>
                </th>
                <th className={cn("py-3 text-center whitespace-nowrap px-1", isFitScreen ? "w-[11%]" : "w-32")}>ملاحظات</th>
                <th className={cn("py-3 text-center whitespace-nowrap px-1", isFitScreen ? "w-20" : "w-24")}>إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 relative w-full">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                      <p className="text-on-surface/40 font-black text-xs">{t('common.loading', 'جاري تحميل البيانات...')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Package size={52} />
                      <p className="text-base font-black">{t('common.empty', 'لا توجد أصناف مطابقة للبحث')}</p>
                      <button
                        onClick={handleQuickAddRow}
                        className="mt-2 bg-primary text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        إضافة أول صنف الآن
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                    <tr><td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={12} /></tr>
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const e = filteredEquipment[virtualRow.index];
                    const isSelected = selectedIds.includes(e.id);
                    return (
                      <tr 
                        key={e.id}
                        ref={rowVirtualizer.measureElement}
                        data-index={virtualRow.index}
                        className={cn(
                          "hover:bg-primary/[0.03] transition-colors group text-xs",
                          isSelected && "bg-primary/[0.05]"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-1 text-center">
                          <div 
                            onClick={(evt) => {
                              evt.stopPropagation();
                              handleToggleSelect(e.id);
                            }}
                            className={cn(
                              "w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all mx-auto",
                              isSelected 
                                ? "bg-primary border-primary text-white" 
                                : "border-outline/30 group-hover:border-primary/50"
                            )}
                          >
                            {isSelected && <CheckCircle size={10} />}
                          </div>
                        </td>

                        {/* رقم التسجيل */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-black text-primary/80 text-xs transition-colors"
                              defaultValue={e.serialNumber || ''}
                              placeholder="---"
                              onBlur={(ev) => triggerInlineEdit(e.id, 'serialNumber', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="font-black text-primary/80 bg-surface-container-low/60 px-2 py-0.5 rounded-md inline-block">
                              {e.serialNumber || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_serialNumber`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* تاريخ التكفل بالتسجيل */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-bold text-primary/80 text-[11px] transition-colors"
                              defaultValue={e.registrationDate || e.foundationalInventory || ''}
                              placeholder="DD/MM/YYYY"
                              onBlur={(ev) => triggerInlineEdit(e.id, 'registrationDate', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="text-[11px] font-bold text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded">
                              {e.registrationDate || e.foundationalInventory || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_registrationDate`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* تعيين الشيء */}
                        <td className="py-2 px-2 text-start relative">
                          {isInlineEditMode ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <span className="text-primary/40 flex-shrink-0" title={e.type === 'tech' ? 'جهاز تقني' : 'زجاجيات'}>
                                {e.type === 'tech' ? <Monitor size={14} /> : <Beaker size={14} />}
                              </span>
                              <input 
                                type="text"
                                className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1.5 py-1 font-black text-primary text-xs transition-colors truncate focus:truncate-none"
                                defaultValue={e.smartNameAr || e.name}
                                placeholder="اسم الصنف..."
                                onBlur={(ev) => triggerInlineEdit(e.id, 'name', ev.target.value)}
                                onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-primary/50 flex-shrink-0">
                                {e.type === 'tech' ? <Monitor size={14} /> : <Beaker size={14} />}
                              </span>
                              <span className="font-black text-primary truncate" title={e.smartNameAr || e.name}>
                                {e.smartNameAr || e.name}
                              </span>
                            </div>
                          )}
                          {saveIndicator[`${e.id}_name`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* الكمية */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="number"
                              min="0"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-black text-primary text-xs transition-colors"
                              defaultValue={e.totalQuantity}
                              onBlur={(ev) => triggerInlineEdit(e.id, 'totalQuantity', Number(ev.target.value) || 0)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="font-black text-primary text-sm">
                              {e.totalQuantity}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_totalQuantity`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* مصدره */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-bold text-on-surface/80 text-[11px] transition-colors truncate"
                              defaultValue={e.source || e.supplier || ''}
                              placeholder="المصدر..."
                              onBlur={(ev) => triggerInlineEdit(e.id, 'source', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="font-bold text-on-surface/70 text-[11px] truncate block" title={e.source || e.supplier || '---'}>
                              {e.source || e.supplier || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_source`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* قیمته */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 focus:bg-surface border border-emerald-500/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 rounded px-1 py-1 text-center font-black text-emerald-700 dark:text-emerald-300 text-[11px] transition-colors truncate"
                              defaultValue={e.price || ''}
                              placeholder="القيمة..."
                              onBlur={(ev) => triggerInlineEdit(e.id, 'price', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded truncate block">
                              {e.price || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_price`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* التعيين */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-bold text-on-surface/80 text-[11px] transition-colors truncate"
                              defaultValue={e.location || ''}
                              placeholder="الموقع..."
                              onBlur={(ev) => triggerInlineEdit(e.id, 'location', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="font-bold text-on-surface/70 text-[11px] truncate block" title={e.location || '---'}>
                              {e.location || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_location`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* الحالة */}
                        <td className="py-2 px-1 text-center relative">
                          <select 
                            className={cn(
                              "w-full rounded-lg px-1 py-1 text-[11px] font-black border transition-all cursor-pointer text-center",
                              e.status === 'maintenance' ? "bg-tertiary/10 border-tertiary/20 text-tertiary" : 
                              e.status === 'broken' ? "bg-error/10 border-error/20 text-error" : "bg-primary/5 border-primary/10 text-primary"
                            )}
                            defaultValue={e.status}
                            onChange={(ev) => triggerInlineEdit(e.id, 'status', ev.target.value)}
                          >
                            <option value="functional">سليم</option>
                            <option value="maintenance">صيانة</option>
                            <option value="broken">تالف / مشطوب</option>
                          </select>
                          {saveIndicator[`${e.id}_status`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* خروجه */}
                        <td className="py-2 px-1 text-center relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className={cn(
                                "w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-center font-bold text-[11px] transition-colors truncate",
                                e.exitDate && e.exitDate !== '---' && e.exitDate !== '-' ? "text-error font-black bg-error/5" : "text-on-surface/60"
                              )}
                              defaultValue={e.exitDate || ''}
                              placeholder="---"
                              onBlur={(ev) => triggerInlineEdit(e.id, 'exitDate', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className={cn(
                              "text-[11px] font-bold block truncate",
                              e.exitDate && e.exitDate !== '---' && e.exitDate !== '-' ? "text-error bg-error/10 px-1.5 py-0.5 rounded font-black" : "text-on-surface/40"
                            )}>
                              {e.exitDate || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_exitDate`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* ملاحظات */}
                        <td className="py-2 px-1.5 text-start relative">
                          {isInlineEditMode ? (
                            <input 
                              type="text"
                              className="w-full bg-transparent hover:bg-surface-container-low/70 focus:bg-surface border border-transparent hover:border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-1 py-1 text-[11px] text-on-surface/70 transition-colors truncate focus:truncate-none"
                              defaultValue={e.notes || ''}
                              placeholder="ملاحظات..."
                              onBlur={(ev) => triggerInlineEdit(e.id, 'notes', ev.target.value)}
                              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }}
                            />
                          ) : (
                            <span className="text-[11px] text-on-surface/50 truncate block" title={e.notes || '---'}>
                              {e.notes || '---'}
                            </span>
                          )}
                          {saveIndicator[`${e.id}_notes`] && (
                            <span className="absolute top-1 end-1 text-emerald-600 animate-ping">●</span>
                          )}
                        </td>

                        {/* إجراءات سريعة */}
                        <td className="py-2 px-1 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Duplicate row */}
                            <button 
                              onClick={() => handleDuplicateEquipment(e)}
                              className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="نسخ وتكرار هذا الصنف برقم تسجيل جديد"
                            >
                              <Copy size={13} />
                            </button>

                            {/* Full Edit Modal */}
                            <button 
                              onClick={() => {
                                setEditingEquipment(e);
                                setNewEquipment({
                                  name: e.name, type: e.type, serialNumber: e.serialNumber, status: e.status,
                                  totalQuantity: e.totalQuantity, availableQuantity: e.availableQuantity, brokenQuantity: e.brokenQuantity,
                                  supplier: e.source || e.supplier || '', location: e.location || '', notes: e.notes || '',
                                  source: e.source || e.supplier || '',
                                  price: e.price || '',
                                  registrationDate: e.registrationDate || e.foundationalInventory || '',
                                  exitDate: e.exitDate || '',
                                  foundationalInventory: e.foundationalInventory || '', decennialReview: e.decennialReview || ''
                                });
                                setIsAddModalOpen(true);
                              }}
                              className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="تعديل تفصيلي كامل"
                            >
                              <Edit size={13} />
                            </button>

                            {/* QR Code */}
                            <button 
                              onClick={() => {
                                setQrCodeItem(e);
                                setIsQRModalOpen(true);
                              }}
                              className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="رمز الاستجابة السريعة QR"
                            >
                              <QrCode size={13} />
                            </button>

                            {/* Print Card */}
                            <button 
                              onClick={() => handlePrint(e)}
                              className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="طباعة بطاقة تقنية فردية"
                            >
                              <Printer size={13} />
                            </button>

                            {/* Delete */}
                            <button 
                              onClick={() => handleDeleteEquipment(e.id, e.name)}
                              className="p-1 text-error/60 hover:text-error hover:bg-error/10 rounded-md transition-colors"
                              title="حذف الصنف"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()?.at(-1)?.end || 0) > 0 && (
                    <tr><td style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()?.at(-1)?.end || 0)}px` }} colSpan={12} /></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Update Confirmation Modal */}
      <AnimatePresence>
        {isSmartUpdateConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSmartUpdateConfirmOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-surface w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-10 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
                <Sparkles size={40} />
              </div>
              <h3 className="text-3xl font-black text-primary mb-4 font-serif">تحديث ذكي شامل</h3>
              <p className="text-on-surface/60 text-lg font-bold leading-relaxed mb-10">
                هل أنت متأكد من رغبتك في تحديث معلومات التجهيزات ذكياً؟
                <br />
                <span className="text-sm opacity-70">قد تستغرق هذه العملية بعض الوقت. سيتم تحديث البيانات تلقائياً بناءً على اقتراحات الذكاء الاصطناعي.</span>
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsSmartUpdateConfirmOpen(false);
                    handleSmartUpdate();
                  }}
                  className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-container transition-all active:scale-95"
                >
                  بدء التحديث
                </button>
                <button 
                  onClick={() => setIsSmartUpdateConfirmOpen(false)}
                  className="flex-1 bg-surface-container-low text-on-surface/40 py-4 rounded-2xl font-black hover:bg-surface-container transition-all active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Update Progress Overlay */}
      <AnimatePresence>
        {isSmartUpdating && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-3xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-surface w-full max-w-md rounded-[40px] shadow-2xl p-12 text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-primary/10 rounded-full" />
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="64" cy="64" r="56" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - (bulkProgress.current / bulkProgress.total))}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw size={32} className="text-primary animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-primary mb-2 font-serif">جاري التحديث الذكي...</h3>
              <p className="text-on-surface/40 font-bold mb-8">
                معالجة العنصر {bulkProgress.current} من أصل {bulkProgress.total}
              </p>
              <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">يرجى عدم إغلاق الصفحة</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-4 rounded-[28px] shadow-2xl flex flex-wrap items-center justify-between gap-4 w-[calc(100vw-2rem)] max-w-2xl border border-white/10"
          >
            <div className="flex flex-col">
              <span className="text-sm font-black">{selectedIds.length} صنف مختار</span>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">عمليات جماعية</span>
            </div>

            <div className="h-8 w-px bg-surface/10 hidden sm:block" />

            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => handleBulkStatusUpdate('functional')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/20 text-success hover:bg-success hover:text-white transition-all font-black text-xs"
              >
                <CheckCircle size={14} />
                سليم
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('broken')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/20 text-error-container hover:bg-error hover:text-white transition-all font-black text-xs"
              >
                <AlertTriangle size={14} />
                تالف
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/20 text-error-container hover:bg-error hover:text-white transition-all font-black text-xs border border-error/30"
              >
                <Trash2 size={14} />
                حذف
              </button>
              
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/10 hover:bg-surface/20 transition-all font-black text-xs"
                onClick={() => {
                  const items = equipment.filter(e => selectedIds.includes(e.id));
                  const worksheet = XLSX.utils.json_to_sheet(items.map(e => ({
                    'Item Name': e.name,
                    'Type': e.type,
                    'Serial': e.serialNumber,
                    'Status': e.status,
                    'Total Qty': e.totalQuantity
                  })));
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "SelectedItems");
                  XLSX.writeFile(workbook, `selected_equipment_${new Date().getTime()}.xlsx`);
                }}
              >
                <Download size={14} />
                تصدير
              </button>

              <button 
                onClick={() => setSelectedIds([])}
                className="p-1.5 hover:bg-surface/10 rounded-full transition-all ms-2"
                aria-label="إلغاء التحديد"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-surface w-full max-w-3xl rounded-[50px] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-10 flex justify-between items-center bg-surface-container-low/50 border-b border-outline/5">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary rounded-2xl text-on-primary shadow-xl shadow-primary/20">
                    {editingEquipment ? <Edit size={28} /> : <Plus size={28} />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-primary font-serif">
                      {editingEquipment ? t('equipment.modal_edit_title', 'تعديل بيانات الصنف') : t('equipment.modal_add_title', 'إضافة صنف جديد')}
                    </h3>
                    <p className="text-on-surface/40 text-sm font-bold">
                      {editingEquipment ? t('common.edit', 'تحديث بيانات العتاد أو الزجاجيات') : t('common.add', 'أدخل بيانات العتاد أو الزجاجيات الجديدة')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEquipment(null);
                    setNewEquipment({
                      name: '',
                      type: 'glassware',
                      serialNumber: '',
                      status: 'functional',
                      totalQuantity: 0,
                      availableQuantity: 0,
                      brokenQuantity: 0,
                      supplier: '',
                      location: '',
                      notes: '',
                      source: '',
                      price: '',
                      registrationDate: '',
                      exitDate: '',
                      foundationalInventory: '',
                      decennialReview: ''
                    });
                  }} 
                  className="p-4 hover:bg-error/10 hover:text-error rounded-full transition-all active:scale-90"
                >
                  <X size={28} />
                </button>
              </div>
              
              <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAddEquipment} className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">تعيين الشيء / اسم الصنف</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="مثال: مجهر ضوئي، بيشر 250مل..."
                      value={newEquipment.name}
                      onChange={e => setNewEquipment({...newEquipment, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">{t('equipment.field_type', 'النوع')}</label>
                    <select 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner appearance-none"
                      value={newEquipment.type}
                      onChange={e => setNewEquipment({...newEquipment, type: e.target.value as any})}
                    >
                      <option value="glassware">زجاجيات مخبرية</option>
                      <option value="tech">أجهزة تقنية / إلكترونية</option>
                      <option value="other">أدوات ووسائل أخرى</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">رقم التسجيل / رقم الجرد</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="رقم القيد في سجل الجرد العام"
                      value={newEquipment.serialNumber}
                      onChange={e => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">تاريخ التكفل بالتسجيل</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="DD/MM/YYYY مثلاً 15/09/2023"
                      value={newEquipment.registrationDate || newEquipment.foundationalInventory || ''}
                      onChange={e => setNewEquipment({
                        ...newEquipment, 
                        registrationDate: e.target.value,
                        foundationalInventory: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">مصدره / الممون</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="ميزانية المؤسسة، وزارة التربية، هبة..."
                      value={newEquipment.source || newEquipment.supplier || ''}
                      onChange={e => setNewEquipment({
                        ...newEquipment, 
                        source: e.target.value,
                        supplier: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">قیمته (دج)</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="مثال: 45000.00 دج"
                      value={newEquipment.price || ''}
                      onChange={e => setNewEquipment({...newEquipment, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">التعيين / مكان التواجد</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="مخبر العلوم الطبيعية، مخبر الفيزياء، الورشة..."
                      value={newEquipment.location}
                      onChange={e => setNewEquipment({...newEquipment, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">{t('equipment.field_status', 'الحالة التشغيلية')}</label>
                    <select 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner appearance-none"
                      value={newEquipment.status}
                      onChange={e => setNewEquipment({...newEquipment, status: e.target.value as any})}
                    >
                      <option value="functional">{t('equipment.status_functional', 'سليم / نشط')}</option>
                      <option value="maintenance">{t('equipment.status_maintenance', 'قيد الصيانة')}</option>
                      <option value="broken">{t('equipment.status_broken', 'تالف / خارج الخدمة')}</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">خروجه (تاريخ أو سند الإسقاط والشطب)</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="اتركه فارغاً إذا كان الصنف نشطاً، أو اكتب تاريخ/سند الشطب"
                      value={newEquipment.exitDate || ''}
                      onChange={e => setNewEquipment({...newEquipment, exitDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">{t('equipment.field_quantity', 'إجمالي الكمية')}</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      value={newEquipment.totalQuantity}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setNewEquipment({...newEquipment, totalQuantity: val, availableQuantity: val - (newEquipment.brokenQuantity || 0)});
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">الكمية التالفة</label>
                    <input 
                      type="number"
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      value={newEquipment.brokenQuantity}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setNewEquipment({...newEquipment, brokenQuantity: val, availableQuantity: (newEquipment.totalQuantity || 0) - val});
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">{t('inventory_cards.col_decennial', 'المراجعة العشرية')}</label>
                    <input 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                      placeholder="بيانات المراجعة العشرية"
                      value={newEquipment.decennialReview}
                      onChange={e => setNewEquipment({...newEquipment, decennialReview: e.target.value})}
                    />
                  </div>
                  <div className="col-span-full space-y-3">
                    <label className="text-xs font-black text-on-surface/40 uppercase tracking-widest mr-4">{t('equipment.field_notes', 'ملاحظات')}</label>
                    <textarea 
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-[24px] px-6 py-4 text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner min-h-[100px]"
                      placeholder="أي ملاحظات إضافية..."
                      value={newEquipment.notes}
                      onChange={e => setNewEquipment({...newEquipment, notes: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 pt-8">
                    <button type="submit" className="w-full bg-primary text-on-primary py-6 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:bg-primary-container hover:shadow-primary/40 transition-all active:scale-[0.98]">
                      {editingEquipment ? t('common.save', 'حفظ التعديلات') : t('common.confirm', 'تأكيد إضافة الصنف للجرد')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHistoryModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-2xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 40 }} 
              className="relative bg-surface w-full max-w-2xl rounded-[50px] shadow-2xl p-12 max-h-[85vh] overflow-hidden flex flex-col border border-white/20"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <History size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary font-serif">سجل الحركات</h3>
                    <p className="text-on-surface/40 text-xs font-bold">{currentEquipName}</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-4 hover:bg-error/10 hover:text-error rounded-full transition-all active:scale-90">
                  <X size={28} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                {selectedEquipHistory.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                    <History size={64} />
                    <p className="text-xl font-black">لا يوجد سجل حركات لهذا الصنف</p>
                  </div>
                ) : (
                  selectedEquipHistory.map((log, i) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative border-r-4 border-primary/20 pr-8 py-6 bg-surface-container-low/30 rounded-l-[32px] group hover:border-primary transition-all"
                    >
                      <div className="absolute top-1/2 -right-[10px] w-4 h-4 rounded-full bg-primary shadow-lg border-4 border-white group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-center mb-3">
                        <span className={cn(
                          "text-xs font-black px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest",
                          log.newStatus === 'functional' ? "bg-primary/10 text-primary" : 
                          log.newStatus === 'maintenance' ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"
                        )}>
                          {log.newStatus === 'functional' ? 'سليم / نشط' : log.newStatus === 'maintenance' ? 'قيد الصيانة' : 'تالف / خارج الخدمة'}
                        </span>
                        <span className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest">{log.date?.toDate()?.toLocaleString('ar-DZ')}</span>
                      </div>
                      <p className="text-base text-on-surface/70 font-bold leading-relaxed">{log.note}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* QR Code Modal */}
      <AnimatePresence>
        {isQRModalOpen && qrCodeItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQRModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-outline/10 p-8 flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-black text-primary">{qrCodeItem.name}</h3>
                <p className="text-xs text-secondary font-bold">{qrCodeItem.serialNumber}</p>
              </div>
              
              <div className="bg-surface p-4 rounded-3xl shadow-inner border border-outline/5">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ id: qrCodeItem.id, type: 'equipment', name: qrCodeItem.name }))}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Printer size={18} />
                  طباعة الملصق
                </button>
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-outline/20 font-bold text-secondary hover:bg-surface-container-high transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Update Confirmation Modal */}
      <AnimatePresence>
        {isBulkConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkConfirmOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-surface w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4">تحديث ذكي شامل</h3>
              <p className="text-on-surface/60 font-bold mb-8 leading-relaxed">
                سيقوم النظام باستخدام الذكاء الاصطناعي لتحسين مسميات وأوصاف جميع الأجهزة في القائمة. هل تود الاستمرار؟
              </p>
              <div className="flex gap-4">
                <button onClick={handleBulkSmartUpdate} className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">تأكيد التحديث</button>
                <button onClick={() => setIsBulkConfirmOpen(false)} className="flex-1 bg-surface-container-high text-on-surface/60 py-4 rounded-2xl font-black">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Suggested Update Modal */}
      <AnimatePresence>
        {isReviewModalOpen && suggestedUpdate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-surface w-full max-w-lg rounded-[40px] shadow-2xl p-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-black text-primary">اقتراح تحسين البيانات</h3>
              </div>
              
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-surface-container-low rounded-3xl border border-outline/5">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">الاسم المقترح</p>
                  <p className="text-xl font-black text-primary">{suggestedUpdate.smartNameAr}</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-3xl border border-outline/5">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">الوصف المقترح</p>
                  <p className="text-sm font-bold text-on-surface/70 leading-relaxed">{suggestedUpdate.smartDescriptionAr}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleApproveUpdate} className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">اعتماد التحديث</button>
                <button onClick={() => { setIsReviewModalOpen(false); setSuggestedUpdate(null); }} className="flex-1 bg-surface-container-high text-on-surface/60 py-4 rounded-2xl font-black">تجاهل</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Overlay */}
      <AnimatePresence>
        {isBulkUpdating && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-surface p-12 rounded-[40px] shadow-2xl text-center max-w-sm w-full mx-6">
              <RefreshCw className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h3 className="text-2xl font-black text-primary mb-2">جاري التحديث الذكي</h3>
              <p className="text-on-surface/40 font-bold mb-8">يرجى الانتظار، جاري معالجة البيانات...</p>
              <div className="h-4 bg-surface-container-high rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs font-black text-primary">{bulkProgress.current} من {bulkProgress.total}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScanner
            onClose={() => setIsQRScannerOpen(false)}
            onScan={(data) => {
              setIsQRScannerOpen(false);
              let actualId = data;
              if (data.startsWith('APP_ID_')) {
                const parts = data.split('_');
                actualId = parts.slice(2, -1).join('_');
              }
              setSearchTerm(actualId);
              // Find item and pre-fill AddModal (or just filter list)
              const item = equipment.find(e => e.id === actualId || e.id === data);
              if (item) {
                setEditingEquipment(item);
                setNewEquipment({
                  name: item.name,
                  type: item.type,
                  serialNumber: item.serialNumber,
                  status: item.status,
                  totalQuantity: item.totalQuantity,
                  availableQuantity: item.availableQuantity,
                  brokenQuantity: item.brokenQuantity,
                  supplier: item.supplier || '',
                  location: item.location || '',
                  notes: item.notes || '',
                  foundationalInventory: item.foundationalInventory || '',
                  decennialReview: item.decennialReview || ''
                });
                setIsAddModalOpen(true);
              } else {
                alert('عذراً، لم يتم العثور على الصنف بهذه الشيفرة.');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Official Algerian General Inventory Registry Modal (سجل الجرد العام الرسمي للمؤسسة) */}
      <AnimatePresence>
        {isOfficialRegistryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOfficialRegistryModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface w-full max-w-6xl max-h-[92vh] rounded-[36px] shadow-2xl overflow-hidden border border-outline/10 flex flex-col"
            >
              {/* Modal Header Bar */}
              <div className="p-6 bg-surface-container-low border-b border-outline/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary font-serif">سجل الجرد العام الرسمي الخاص بالمؤسسة</h3>
                    <p className="text-xs text-on-surface/50 font-bold">النموذج الوزاري المعتمد وفق التشريع المدرسي الجزائري (8 أعمدة رسمية)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrintList}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-container shadow-md transition-all active:scale-95"
                  >
                    <Printer size={15} />
                    طباعة السجل الرسمي
                  </button>
                  <button 
                    onClick={handleExportGeneralInventoryXLS}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                  >
                    <Download size={15} />
                    تصدير Excel
                  </button>
                  <button 
                    onClick={() => setIsOfficialRegistryModalOpen(false)}
                    className="p-2.5 hover:bg-surface-container rounded-full text-on-surface/40 hover:text-primary transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Printable Sheet Body */}
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-zinc-950 font-serif">
                {/* Official Algerian Republic Header */}
                <div className="border-b-2 border-black/80 pb-6 mb-6">
                  <div className="flex justify-between items-start text-xs md:text-sm font-black text-zinc-900 dark:text-zinc-100">
                    <div className="text-right space-y-1">
                      <p>وزارة التربية الوطنية</p>
                      <p>مديرية التربية لولاية: {directorate || 'أم البواقي'}</p>
                      <p>{formatSchoolWithCommune(schoolName, commune) || 'المؤسسة التربوية'}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-black text-sm md:text-base">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                      <p className="text-xs text-zinc-500">نظام رقمنة سجلات المخابر المدرسية</p>
                    </div>
                    <div className="text-left text-xs space-y-1">
                      <p>التاريخ: {new Date().toLocaleDateString('ar-DZ')}</p>
                      <p>عدد الأصناف: {filteredEquipment.length}</p>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-wider underline underline-offset-8">
                      سجل الجرد العام للمؤسسة
                    </h2>
                  </div>
                </div>

                {/* Official 8-Columns Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse border-2 border-zinc-800 text-xs">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-900 border-b-2 border-zinc-800 font-black text-zinc-900 dark:text-white">
                        <th className="border border-zinc-800 py-3 px-2 w-14">رقم التسجيل</th>
                        <th className="border border-zinc-800 py-3 px-2 w-24">تاريخ التكفل بالتسجيل</th>
                        <th className="border border-zinc-800 py-3 px-3 text-start w-72">تعيين الشيء</th>
                        <th className="border border-zinc-800 py-3 px-2 w-36">مصدره</th>
                        <th className="border border-zinc-800 py-3 px-2 w-24">قیمته</th>
                        <th className="border border-zinc-800 py-3 px-2 w-32">التعيين</th>
                        <th className="border border-zinc-800 py-3 px-2 w-24">خروجه</th>
                        <th className="border border-zinc-800 py-3 px-3 text-start">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                      {filteredEquipment.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-zinc-400">لا توجد بيانات مسجلة حالياً</td>
                        </tr>
                      ) : (
                        filteredEquipment.map((e, idx) => (
                          <tr key={e.id} className="border-b border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 font-black text-zinc-900 dark:text-zinc-100">
                              {e.serialNumber || (idx + 1).toString().padStart(2, '0')}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 text-[11px] font-bold">
                              {e.registrationDate || e.foundationalInventory || '---'}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-3 text-start font-bold text-zinc-900 dark:text-white">
                              {e.smartNameAr || e.name} {e.totalQuantity > 1 ? `(الكمية: ${e.totalQuantity})` : ''}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 text-[11px]">
                              {e.source || e.supplier || '---'}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 font-bold text-[11px]">
                              {e.price || '---'}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 text-[11px]">
                              {e.location || 'مخبر العلوم'}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-2 text-[11px] font-bold text-red-600">
                              {e.exitDate || '---'}
                            </td>
                            <td className="border border-zinc-300 dark:border-zinc-800 py-2.5 px-3 text-start text-[11px] text-zinc-600 dark:text-zinc-400">
                              {e.notes || '---'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Official Signatures Footer */}
                <div className="grid grid-cols-3 gap-6 text-center text-xs md:text-sm font-black pt-12 pb-6 text-zinc-900 dark:text-zinc-100">
                  <div className="border border-zinc-400 dark:border-zinc-700 rounded-2xl p-4">
                    <p className="mb-12">المقتصد / مسير المصالح الاقتصادية</p>
                    <p className="text-[10px] text-zinc-400">الختم والتوقيع</p>
                  </div>
                  <div className="border border-zinc-400 dark:border-zinc-700 rounded-2xl p-4">
                    <p className="mb-12">مسؤول المخبر / الأستاذ المشرف</p>
                    <p className="text-[10px] text-zinc-400">الختم والتوقيع</p>
                  </div>
                  <div className="border border-zinc-400 dark:border-zinc-700 rounded-2xl p-4">
                    <p className="mb-12">مدير المؤسسة التربوية</p>
                    <p className="text-[10px] text-zinc-400">الختم والتوقيع</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
