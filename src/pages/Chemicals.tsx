import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Plus,
  Search,
  Download,
  FileUp,
  AlertTriangle,
  ShieldAlert,
  QrCode,
  Trash2,
  Edit,
  X,
  Printer,
  Bell,
  Sparkles,
  Check,
  FileText,
  FileDown,
  Calculator,
  ChevronDown,
  Minus,
  FolderInput,
  RotateCcw,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import QRScanner from '../components/QRScanner';
import { ChemicalAddModal } from '../components/ChemicalAddModal';
import { ChemicalBulkConfirmModal } from '../components/ChemicalBulkConfirmModal';
import { ChemicalReviewModal } from '../components/ChemicalReviewModal';
import { ChemicalLabCalculatorModal } from '../components/ChemicalLabCalculatorModal';
import { ChemicalSmartImportModal } from '../components/ChemicalSmartImportModal';
import { ChemicalSafetyAuditModal } from '../components/ChemicalSafetyAuditModal';

import { getGhsIcon, getGhsLabel } from '../types/chemicals';
import {
  useChemicalsLogic,
  ChemicalStatusFilter,
  ChemicalStateFilter,
} from '../hooks/useChemicalsLogic';
import { useTranslation } from 'react-i18next';

export default function Chemicals({ isNested = false }: { isNested?: boolean }) {
  const { t, i18n } = useTranslation();
  const {
    chemicals,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    stateFilter,
    setStateFilter,
    shelfFilter,
    setShelfFilter,
    uniqueShelves,
    filterLowStock,
    setFilterLowStock,
    selectedChemical,
    setSelectedChemical,
    isAddModalOpen,
    setIsAddModalOpen,
    editingChemical,
    setEditingChemical,
    fileInputRef,
    isImporting,
    isGenerating,
    isBulkUpdating,
    isBulkConfirmOpen,
    setIsBulkConfirmOpen,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    isDeletingBulk,
    isLabCalcOpen,
    setIsLabCalcOpen,
    isSmartImportOpen,
    setIsSmartImportOpen,
    isSafetyAuditOpen,
    setIsSafetyAuditOpen,
    safetyGuidesCache,
    loadingSafetyGuideId,
    handleFetchSafetyGuide,
    handleQuickAdjustQuantity,
    handleBulkAssignShelf,
    handleSmartTextImport,
    toast,
    setToast,
    bulkProgress,
    selectedIds,
    setSelectedIds,
    suggestedUpdate,
    isReviewModalOpen,
    setIsReviewModalOpen,
    isQRScannerOpen,
    setIsQRScannerOpen,
    formatDisplayDate,
    setNewChemical,
    handleAddChemical,
    handleSmartFill,
    handleRequestSmartUpdate,
    handleApproveUpdate,
    handleBulkSmartUpdate,
    cancelBulkUpdate,
    missingChemicalsCount,
    dangerCount,
    expiringOrExpiredCount,
    duplicateIds,
    handleDeleteChemical,
    handlePrintList,
    handleExportPDF,
    handleExportWord,
    handleExportXLS,
    handleImportXLS,
    handlePrintInventoryCards,
    handlePrint,
    handleSort,
    handleToggleSelect,
    handleSelectAll,
    handleBulkDelete,
    filteredChemicals,
    sortedChemicals,
    getSortIcon,
    lowStockCount,
    parentRef,
    rowVirtualizer,
    newChemical,
  } = useChemicalsLogic(isNested);

  const [sidebarTab, setSidebarTab] = useState<'details' | 'safety'>('details');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [customAdjustQty, setCustomAdjustQty] = useState('5');
  const [bulkShelfInput, setBulkShelfInput] = useState('');
  const [isBulkShelfPopoverOpen, setIsBulkShelfPopoverOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (sidebarTab === 'safety' && selectedChemical && !safetyGuidesCache[selectedChemical.id]) {
      handleFetchSafetyGuide(selectedChemical);
    }
  }, [sidebarTab, selectedChemical?.id]);

  const activeSelectedIds = selectedIds.filter(id => chemicals.some(c => c.id === id));
  const selectedItemsList = chemicals.filter(c => activeSelectedIds.includes(c.id));
  const isAllFilteredSelected =
    filteredChemicals.length > 0 && filteredChemicals.every(c => activeSelectedIds.includes(c.id));

  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'all' || stateFilter !== 'all' || shelfFilter !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStateFilter('all');
    setShelfFilter('all');
  };

  const activeSafetyGuide = selectedChemical ? safetyGuidesCache[selectedChemical.id] : undefined;
  const isGuideLoading = Boolean(selectedChemical && loadingSafetyGuideId === selectedChemical.id);

  return (
    <div
      className={cn('space-y-8 max-w-7xl mx-auto pb-24', !isNested && 'px-4')}
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Toast notification */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-6 start-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-bold max-w-md transition-all',
            toast.type === 'success' &&
              'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800',
            toast.type === 'error' &&
              'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800',
            toast.type === 'info' &&
              'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800'
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100" aria-label="إغلاق التنبيه">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      {!isNested && (
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              {t('chemicals.title', 'المخزن الكيميائي')}
            </h1>
            <p className="text-secondary/80 text-sm sm:text-base font-medium">
              {t('chemicals.subtitle', 'إدارة وتتبع المحاليل والكواشف الكيميائية وسلامة التخزين')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportXLS}
              className="hidden"
              accept=".xls,.xlsx"
            />

            <button
              type="button"
              onClick={() => setIsQRScannerOpen(true)}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all whitespace-nowrap shrink-0"
            >
              <QrCode size={16} />
              <span>{t('common.scan_qr', 'مسح QR')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLabCalcOpen(true)}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all whitespace-nowrap shrink-0"
            >
              <Calculator size={16} />
              <span>حاسبة التحضير</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSafetyAuditOpen(true)}
              disabled={chemicals.length === 0}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <ShieldAlert size={16} />
              <span>فحص التوافق</span>
            </button>

            {/* Consolidated Export / Print / Import Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                className="bg-surface text-secondary border border-outline/15 px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all whitespace-nowrap shrink-0"
              >
                <Printer size={16} />
                <span>تصدير وطباعة</span>
                <ChevronDown size={14} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute end-0 mt-2 w-60 bg-surface-container-lowest border border-outline/15 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handlePrintList();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-primary text-right"
                  >
                    <Printer size={15} />
                    <span>طباعة القائمة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handlePrintInventoryCards(sortedChemicals);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-primary text-right"
                  >
                    <ClipboardList size={15} />
                    <span>طباعة بطاقات المخزون</span>
                  </button>
                  <div className="my-1 border-t border-outline/10" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handleExportPDF();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-secondary text-right"
                  >
                    <FileText size={15} />
                    <span>تصدير PDF رسمي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handleExportWord();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-secondary text-right"
                  >
                    <FileDown size={15} />
                    <span>تصدير Word (.doc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handleExportXLS();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-secondary text-right"
                  >
                    <Download size={15} />
                    <span>تصدير Excel (.xlsx)</span>
                  </button>
                  <div className="my-1 border-t border-outline/10" />
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-secondary text-right disabled:opacity-50"
                  >
                    <FileUp size={15} />
                    <span>{isImporting ? 'جاري الاستيراد...' : 'استيراد ملف Excel'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      setIsSmartImportOpen(true);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-surface-container-low text-primary text-right"
                  >
                    <Sparkles size={15} />
                    <span>استيراد ذكي من قائمة نصية</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsBulkConfirmOpen(true)}
              disabled={isBulkUpdating || chemicals.length === 0}
              className="bg-surface-container-low text-primary border border-primary/20 px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-black hover:bg-primary/10 transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
              title="تحديث ذكي لجميع المواد في القائمة"
            >
              {isBulkUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="tabular-nums">
                    {bulkProgress.current}/{bulkProgress.total}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>تحديث ذكي</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingChemical(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-black shadow-md shadow-primary/20 hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
            >
              <Plus size={16} />
              <span>{t('chemicals.btn_add', 'إضافة مادة')}</span>
            </button>
          </div>
        </header>
      )}

      {/* Compact Toolbar when Nested inside another Hub */}
      {isNested && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLabCalcOpen(true)}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low whitespace-nowrap"
            >
              <Calculator size={15} />
              <span>حاسبة التحضير</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSafetyAuditOpen(true)}
              disabled={chemicals.length === 0}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low disabled:opacity-50 whitespace-nowrap"
            >
              <ShieldAlert size={15} />
              <span>فحص التوافق</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSmartImportOpen(true)}
              className="bg-surface text-secondary border border-outline/15 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black hover:bg-surface-container-low whitespace-nowrap"
            >
              <Sparkles size={15} />
              <span>استيراد نصي ذكي</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkConfirmOpen(true)}
              disabled={isBulkUpdating || chemicals.length === 0}
              className="bg-surface-container-low text-primary border border-primary/20 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black hover:bg-primary/10 disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles size={15} />
              <span>تحديث ذكي</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingChemical(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-on-primary px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black hover:bg-primary/90 whitespace-nowrap"
            >
              <Plus size={15} />
              <span>{t('chemicals.btn_add', 'إضافة مادة')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Bulk Smart Update Progress Banner */}
      {isBulkUpdating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest border border-primary/25 rounded-3xl p-5 shadow-lg space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-primary">جاري التحديث الذكي بالدفعات...</h4>
                <p className="text-xs font-bold text-secondary/75">
                  {bulkProgress.currentLabel
                    ? `المجموعة الحالية: ${bulkProgress.currentLabel}`
                    : 'جاري تحليل البيانات الكيميائية...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs font-black text-primary tabular-nums">
                {bulkProgress.current} / {bulkProgress.total} (نجاح: {bulkProgress.successCount}
                {bulkProgress.failCount > 0 ? ` · تعذر: ${bulkProgress.failCount}` : ''})
              </span>
              <button
                type="button"
                onClick={cancelBulkUpdate}
                className="px-4 py-2 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-black hover:bg-rose-600 hover:text-white transition-all"
              >
                إيقاف التحديث
              </button>
            </div>
          </div>
          <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${bulkProgress.total > 0 ? Math.min(100, Math.round((bulkProgress.current / bulkProgress.total) * 100)) : 0}%`,
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Interactive KPI Cards (Real Computed Data, Clickable Quick Filters) */}
      {!isNested && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'text-right p-5 rounded-3xl border transition-all',
              statusFilter === 'all'
                ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                : 'bg-surface-container-low border-outline/10 hover:border-outline/25'
            )}
          >
            <p className="text-xs text-secondary/70 font-black mb-2">
              {t('chemicals.stat_total_chemicals', 'إجمالي المواد')}
            </p>
            <h3 className="text-3xl font-black text-primary tabular-nums">{chemicals.length}</h3>
            <p className="text-[11px] font-bold text-secondary/65 mt-1 tabular-nums">
              موزعة على {uniqueShelves.length} رف / خزانة
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'danger' ? 'all' : 'danger')}
            className={cn(
              'text-right p-5 rounded-3xl border transition-all',
              statusFilter === 'danger'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 shadow-sm'
                : 'bg-surface-container-low border-outline/10 hover:border-rose-300/60'
            )}
          >
            <p className="text-xs text-rose-700 dark:text-rose-300 font-black mb-2">
              {t('chemicals.col_hazard', 'مواد خطرة (GHS)')}
            </p>
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums">{dangerCount}</h3>
            <p className="text-[11px] font-bold text-secondary/65 mt-1">تتطلب تخزيناً وحماية خاصة</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
            className={cn(
              'text-right p-5 rounded-3xl border transition-all',
              statusFilter === 'expiring'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 shadow-sm'
                : 'bg-surface-container-low border-outline/10 hover:border-amber-300/60'
            )}
          >
            <p className="text-xs text-amber-700 dark:text-amber-300 font-black mb-2">
              {t('chemicals.stat_expired', 'منتهية أو قريبة الانتهاء')}
            </p>
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {expiringOrExpiredCount}
            </h3>
            <p className="text-[11px] font-bold text-secondary/65 mt-1">خلال 90 يوماً القادمة</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
            className={cn(
              'text-right p-5 rounded-3xl border transition-all',
              statusFilter === 'low'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-surface-container-low border-outline/10 hover:border-primary/30'
            )}
          >
            <p
              className={cn(
                'text-xs font-black mb-2',
                statusFilter === 'low' ? 'text-white/80' : 'text-secondary/70'
              )}
            >
              مواد منخفضة المخزون
            </p>
            <h3
              className={cn(
                'text-3xl font-black tabular-nums',
                statusFilter === 'low' ? 'text-white' : 'text-primary'
              )}
            >
              {lowStockCount}
            </h3>
            <p
              className={cn(
                'text-[11px] font-bold mt-1 tabular-nums',
                statusFilter === 'low' ? 'text-white/75' : 'text-secondary/65'
              )}
            >
              {missingChemicalsCount > 0 ? `${missingChemicalsCount} مادة تنقصها بيانات` : 'البيانات الأساسية مكتملة'}
            </p>
          </button>
        </section>
      )}

      {lowStockCount > 0 && statusFilter !== 'low' && (
        <div className="bg-amber-50/70 dark:bg-amber-950/25 text-amber-900 dark:text-amber-100 px-5 py-3.5 rounded-2xl flex items-center justify-between gap-4 border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber-600 shrink-0" />
            <span className="font-bold text-sm tabular-nums">
              {t('chemicals.low_stock_badge', 'تنبيه: يوجد مواد منخفضة المخزون!')} ({lowStockCount})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className="text-xs font-black underline underline-offset-4 text-amber-800 dark:text-amber-200 px-3 py-1.5 hover:bg-amber-500/10 rounded-lg transition-all whitespace-nowrap shrink-0"
          >
            {t('chemicals.filter_low_stock', 'عرض المواد المنخفضة')}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Inventory Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline/15 shadow-sm">
            {/* Search & Faceted Filters */}
            <div className="p-5 space-y-4 bg-surface-container-low/40 border-b border-outline/10">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-outline/60" size={18} />
                  <input
                    className="w-full bg-surface border border-outline/15 rounded-full ps-11 pe-10 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-start"
                    placeholder={t('chemicals.search_placeholder', 'بحث بالاسم، الصيغة، رقم CAS، أو الرف...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary"
                      aria-label="مسح البحث"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value as ChemicalStateFilter)}
                    className="bg-surface border border-outline/15 rounded-full px-3.5 py-2.5 text-xs font-black text-secondary outline-none cursor-pointer"
                    aria-label="تصفية حسب الحالة الفيزيائية"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="solid">صلب</option>
                    <option value="liquid">سائل</option>
                    <option value="gas">غاز</option>
                  </select>

                  <select
                    value={shelfFilter}
                    onChange={(e) => setShelfFilter(e.target.value)}
                    className="bg-surface border border-outline/15 rounded-full px-3.5 py-2.5 text-xs font-black text-secondary outline-none cursor-pointer max-w-[160px]"
                    aria-label="تصفية حسب الرف"
                  >
                    <option value="all">كل الرفوف</option>
                    {uniqueShelves.map(shelf => (
                      <option key={shelf} value={shelf}>
                        {shelf}
                      </option>
                    ))}
                  </select>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="px-3 py-2 rounded-full text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <RotateCcw size={13} />
                      <span>إعادة ضبط</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Segmented Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {(
                  [
                    { id: 'all', label: `الكل (${chemicals.length})` },
                    { id: 'danger', label: `خطرة (${dangerCount})` },
                    { id: 'expiring', label: `الصلاحية (${expiringOrExpiredCount})` },
                    { id: 'low', label: `منخفضة (${lowStockCount})` },
                    { id: 'incomplete', label: `ناقصة البيانات (${missingChemicalsCount})` },
                    ...(duplicateIds.size > 0
                      ? [{ id: 'duplicates', label: `مكررة محتملة (${duplicateIds.size})` }]
                      : []),
                  ] as { id: ChemicalStatusFilter; label: string }[]
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap shrink-0 tabular-nums',
                      statusFilter === tab.id
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface text-secondary/80 hover:text-primary border border-outline/10'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={parentRef} className="overflow-auto scrollbar-hide relative max-h-[680px] w-full">
              <table className="w-full text-start border-collapse table-auto relative">
                <thead className="sticky top-0 z-20 bg-surface-container-lowest border-b border-outline/10">
                  <tr className="bg-surface-container-low/60 text-secondary/70 text-[11px] font-black">
                    <th className="px-3 py-3.5 text-start w-10">
                      <div
                        onClick={handleSelectAll}
                        className={cn(
                          'w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all',
                          isAllFilteredSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-outline/30 hover:border-primary/50'
                        )}
                      >
                        {isAllFilteredSelected && <Check size={12} />}
                      </div>
                    </th>
                    <th className="px-2 py-3.5 text-start w-9">#</th>
                    <th
                      className="px-3 py-3.5 text-start min-w-[150px] cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('nameEn')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('nameEn')}
                        {t('chemicals.col_name_en', 'المادة (EN / AR)')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-right w-24 hidden sm:table-cell cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('formula')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('formula')}
                        {t('chemicals.col_formula', 'الصيغة')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-right w-24 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('quantity')}
                        {t('chemicals.col_quantity', 'الكمية')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-right w-20 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('hazardClass')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('hazardClass')}
                        {t('chemicals.col_hazard', 'الخطورة')}
                      </div>
                    </th>
                    <th className="px-3 py-3.5 text-right w-20 hidden xl:table-cell">GHS</th>
                    <th
                      className="px-3 py-3.5 text-right w-16 hidden md:table-cell cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('shelf')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('shelf')}
                        {t('chemicals.col_location', 'الرف')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-right w-24 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('expiryDate')}
                    >
                      <div className="flex items-center">
                        {getSortIcon('expiryDate')}
                        {t('chemicals.col_expiry', 'الصلاحية')}
                      </div>
                    </th>
                    <th className="px-3 py-3.5 text-center w-24">{t('common.actions', 'إجراءات')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10 relative w-full">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={10} className="px-4 py-4">
                          <div className="h-5 bg-surface-container-low rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : sortedChemicals.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-8 py-16 text-center space-y-3">
                        <p className="text-secondary/75 font-bold text-sm">
                          {hasActiveFilters
                            ? 'لا توجد مواد تطابق معايير البحث والتصفية الحالية'
                            : t('common.empty', 'المخزن الكيميائي فارغ حالياً')}
                        </p>
                        <div>
                          {hasActiveFilters ? (
                            <button
                              type="button"
                              onClick={resetAllFilters}
                              className="px-4 py-2 rounded-full bg-surface-container-low text-primary text-xs font-black hover:bg-primary/10 transition-colors"
                            >
                              عرض جميع المواد
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsAddModalOpen(true)}
                              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-colors"
                            >
                              إضافة أول مادة
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rowVirtualizer.getVirtualItems().length > 0 &&
                        rowVirtualizer.getVirtualItems()[0].start > 0 && (
                          <tr>
                            <td
                              style={{ padding: 0, height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}
                              colSpan={10}
                            />
                          </tr>
                        )}
                      {rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const index = virtualRow.index;
                        const c = sortedChemicals[index];
                        const isExpired = Boolean(c.expiryDate && new Date(c.expiryDate) < new Date());
                        const isSelected = selectedChemical?.id === c.id;
                        return (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedChemical(c)}
                            ref={rowVirtualizer.measureElement}
                            data-index={index}
                            className={cn(
                              'hover:bg-surface-container-low/50 transition-colors group cursor-pointer text-sm',
                              isSelected && 'bg-primary/6'
                            )}
                          >
                            <td className="px-3 py-3.5">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelect(c.id);
                                }}
                                className={cn(
                                  'w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all',
                                  selectedIds.includes(c.id)
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-outline/30 group-hover:border-primary/50'
                                )}
                              >
                                {selectedIds.includes(c.id) && <Check size={12} />}
                              </div>
                            </td>
                            <td className="px-2 py-3.5 font-bold text-secondary/60 tabular-nums text-xs">
                              {index + 1}
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-black text-primary break-words leading-snug">
                                  {c.nameEn || c.nameAr}
                                </span>
                                {c.nameAr && c.nameEn && (
                                  <span className="text-xs text-secondary/70 break-words mt-0.5">{c.nameAr}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3.5 hidden sm:table-cell">
                              <div className="font-mono font-bold text-secondary text-xs">{c.formula || '—'}</div>
                              {c.casNumber && (
                                <div className="text-[10px] font-mono text-secondary/60 mt-0.5">{c.casNumber}</div>
                              )}
                            </td>
                            <td className="px-3 py-3.5 whitespace-nowrap">
                              <span
                                className={cn(
                                  'font-black tabular-nums',
                                  c.quantity < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                                )}
                              >
                                {c.quantity}
                              </span>{' '}
                              <span className="text-[11px] font-bold text-secondary/65">{c.unit}</span>
                            </td>
                            <td className="px-3 py-3.5 whitespace-nowrap">
                              {c.hazardClass === 'danger' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600 dark:text-rose-400">
                                  <AlertTriangle size={13} />
                                  <span>خطر</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                  <ShieldCheck size={13} />
                                  <span>آمن</span>
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3.5 hidden xl:table-cell">
                              <div className="flex gap-1">
                                {c.ghs?.slice(0, 3).map((g, i) => {
                                  const iconSrc = getGhsIcon(g);
                                  const label = getGhsLabel(g);
                                  return (
                                    <div
                                      key={i}
                                      className="w-7 h-7 bg-surface rounded-md flex items-center justify-center border border-outline/15 p-0.5"
                                      title={label}
                                    >
                                      {iconSrc ? (
                                        <img
                                          src={iconSrc}
                                          alt={label}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <span className="text-[8px] font-black">{g}</span>
                                      )}
                                    </div>
                                  );
                                })}
                                {c.ghs && c.ghs.length > 3 && (
                                  <span className="text-[10px] text-secondary/60 self-center font-bold tabular-nums">
                                    +{c.ghs.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3.5 font-bold text-primary hidden md:table-cell text-xs">
                              {c.shelf || '—'}
                            </td>
                            <td className="px-3 py-3.5">
                              <span
                                className={cn(
                                  'font-bold whitespace-nowrap text-xs tabular-nums inline-flex items-center gap-1',
                                  isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-secondary/80'
                                )}
                              >
                                {formatDisplayDate(c.expiryDate)}
                                {isExpired && <AlertTriangle size={13} />}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestSmartUpdate(c);
                                  }}
                                  disabled={isGenerating}
                                  className="p-1.5 text-secondary/50 hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                  title="تحديث ذكي"
                                >
                                  <Sparkles size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingChemical(c);
                                    setNewChemical({
                                      nameEn: c.nameEn,
                                      nameAr: c.nameAr,
                                      formula: c.formula,
                                      casNumber: c.casNumber || '',
                                      storageTemp: c.storageTemp || '',
                                      unit: c.unit,
                                      quantity: c.quantity,
                                      state: c.state,
                                      hazardClass: c.hazardClass,
                                      ghs: c.ghs,
                                      shelf: c.shelf,
                                      expiryDate: c.expiryDate,
                                      notes: c.notes,
                                    });
                                    setIsAddModalOpen(true);
                                  }}
                                  className="p-1.5 text-secondary/50 hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                  title="تعديل"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChemical(c.id, c.nameAr || c.nameEn);
                                  }}
                                  className="p-1.5 text-secondary/50 hover:text-rose-600 hover:bg-rose-500/10 transition-all rounded-lg"
                                  title="حذف"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {rowVirtualizer.getVirtualItems().length > 0 &&
                        rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()?.at(-1)?.end || 0) > 0 && (
                          <tr>
                            <td
                              style={{
                                padding: 0,
                                height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()?.at(-1)?.end || 0)}px`,
                              }}
                              colSpan={10}
                            />
                          </tr>
                        )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details & Smart Safety Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {selectedChemical ? (
            <div
              key={selectedChemical.id}
              className="bg-surface-container-lowest rounded-3xl p-6 border border-outline/15 shadow-sm space-y-5"
            >
              {/* Header & Hazard */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={cn(
                      'font-black inline-flex items-center gap-1.5',
                      selectedChemical.hazardClass === 'danger'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    )}
                  >
                    {selectedChemical.hazardClass === 'danger' ? (
                      <>
                        <AlertTriangle size={14} />
                        <span>{t('chemicals.hazard_danger', 'مادة خطرة')}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>{t('chemicals.hazard_safe', 'مادة آمنة')}</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-secondary/70 font-bold">
                    {selectedChemical.casNumber || 'CAS غير محدد'}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-primary leading-tight">
                    {selectedChemical.nameEn || selectedChemical.nameAr}
                  </h2>
                  {selectedChemical.nameAr && selectedChemical.nameEn && (
                    <h3 className="text-base font-bold text-secondary mt-0.5">{selectedChemical.nameAr}</h3>
                  )}
                  <p className="text-sm font-mono font-bold text-secondary/70 mt-1">
                    {selectedChemical.formula || '—'}
                  </p>
                </div>
              </div>

              {/* Segmented Tabs: Details vs Smart AI FDS */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline/10">
                <button
                  type="button"
                  onClick={() => setSidebarTab('details')}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap',
                    sidebarTab === 'details'
                      ? 'bg-surface text-primary shadow-xs border border-outline/10'
                      : 'text-secondary/75 hover:text-primary'
                  )}
                >
                  بيانات المخزون
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('safety')}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap',
                    sidebarTab === 'safety'
                      ? 'bg-surface text-primary shadow-xs border border-outline/10'
                      : 'text-secondary/75 hover:text-primary'
                  )}
                >
                  <Sparkles size={13} />
                  <span>بطاقة السلامة FDS</span>
                </button>
              </div>

              {sidebarTab === 'details' ? (
                <div className="space-y-5">
                  <div className="divide-y divide-outline/10 text-sm">
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary/70">
                        {t('chemicals.field_storage_temp', 'درجة التخزين')}
                      </span>
                      <span className="font-black text-primary">{selectedChemical.storageTemp || 'غير محدد'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary/70">{t('common.status', 'الحالة')}</span>
                      <span className="font-black text-primary">
                        {selectedChemical.state === 'solid'
                          ? t('chemicals.state_solid', 'صلب')
                          : selectedChemical.state === 'liquid'
                          ? t('chemicals.state_liquid', 'سائل')
                          : t('chemicals.state_gas', 'غاز')}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary/70">{t('chemicals.col_location', 'الرف')}</span>
                      <span className="font-black text-primary">{selectedChemical.shelf || 'غير محدد'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary/70">{t('chemicals.col_expiry', 'الصلاحية')}</span>
                      <span
                        className={cn(
                          'font-black tabular-nums',
                          selectedChemical.expiryDate && new Date(selectedChemical.expiryDate) < new Date()
                            ? 'text-rose-600'
                            : 'text-primary'
                        )}
                      >
                        {formatDisplayDate(selectedChemical.expiryDate)}
                      </span>
                    </div>
                    <div className="py-2.5 space-y-1">
                      <span className="text-xs font-bold text-secondary/70 block">{t('common.notes', 'ملاحظات')}</span>
                      <p className="text-xs font-bold text-primary/90 leading-relaxed break-words">
                        {selectedChemical.notes || t('common.none', 'لا توجد ملاحظات')}
                      </p>
                    </div>
                  </div>

                  {/* Real Stock Level & Quick Inline Adjuster */}
                  <div className="pt-3 border-t border-outline/10 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-secondary/75">الكمية المتوفرة</span>
                      <span className="text-2xl font-black text-primary tabular-nums">
                        {selectedChemical.quantity}{' '}
                        <span className="text-xs font-bold text-secondary/70">{selectedChemical.unit}</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          selectedChemical.quantity < 10 ? 'bg-amber-500' : 'bg-primary'
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(4, Math.round((selectedChemical.quantity / 100) * 100)))}%`,
                        }}
                      />
                    </div>

                    {/* Quick Consumption / Restock Controls */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdjustQuantity(
                            selectedChemical,
                            -(parseFloat(customAdjustQty) || 5),
                            'سحب مخبري سريع'
                          )
                        }
                        disabled={selectedChemical.quantity <= 0}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 disabled:opacity-40"
                        title="خصم الكمية"
                      >
                        <Minus size={12} />
                        <span className="tabular-nums">{parseFloat(customAdjustQty) || 5}</span>
                      </button>

                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        dir="ltr"
                        value={customAdjustQty}
                        onChange={(e) => setCustomAdjustQty(e.target.value)}
                        className="w-16 text-center bg-surface-container-low border border-outline/15 rounded-xl py-1.5 text-xs font-mono font-black tabular-nums outline-none"
                        aria-label="كمية التعديل السريع"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdjustQuantity(
                            selectedChemical,
                            parseFloat(customAdjustQty) || 5,
                            'توريد سريع'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1"
                        title="إضافة للمخزون"
                      >
                        <Plus size={12} />
                        <span className="tabular-nums">{parseFloat(customAdjustQty) || 5}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLabCalcOpen(true)}
                        className="ms-auto px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-black hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 whitespace-nowrap"
                        title="فتح حاسبة التحضير والتمديد لهذه المادة"
                      >
                        <Calculator size={13} />
                        <span>تحضير</span>
                      </button>
                    </div>
                  </div>

                  {selectedChemical.ghs && selectedChemical.ghs.length > 0 && (
                    <div className="pt-3 border-t border-outline/10 space-y-2.5">
                      <span className="text-xs font-black text-secondary/70 block">
                        {t('chemicals.ghs_symbols', 'رموز السلامة GHS')}
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {selectedChemical.ghs.map((g, i) => {
                          const iconSrc = getGhsIcon(g);
                          const label = getGhsLabel(g);
                          return (
                            <div
                              key={i}
                              className="bg-surface-container-low p-2.5 rounded-xl border border-outline/10 flex flex-col items-center gap-1.5"
                            >
                              <div className="w-11 h-11 flex items-center justify-center">
                                {iconSrc ? (
                                  <img
                                    src={iconSrc}
                                    alt={label}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-xs font-black">{g}</span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-secondary text-center leading-tight">
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Document & Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-outline/10">
                    <button
                      type="button"
                      onClick={() => handlePrint(selectedChemical)}
                      className="p-2.5 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-xl text-primary transition-all flex flex-col items-center gap-1 text-[10px] font-black"
                      title="طباعة بطاقة التعريف"
                    >
                      <Printer size={17} />
                      <span>تعريفية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintInventoryCards([selectedChemical])}
                      className="p-2.5 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-xl text-primary transition-all flex flex-col items-center gap-1 text-[10px] font-black"
                      title="طباعة بطاقة المخزون"
                    >
                      <FileText size={17} />
                      <span>بطاقة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestSmartUpdate()}
                      disabled={isGenerating}
                      className="p-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/15 rounded-xl text-primary transition-all flex flex-col items-center gap-1 text-[10px] font-black disabled:opacity-50"
                      title="تحديث ذكي لهذه المادة"
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={17} />
                      )}
                      <span>تحديث</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChemical(selectedChemical);
                        setNewChemical({
                          nameEn: selectedChemical.nameEn,
                          nameAr: selectedChemical.nameAr,
                          formula: selectedChemical.formula,
                          casNumber: selectedChemical.casNumber || '',
                          storageTemp: selectedChemical.storageTemp || '',
                          unit: selectedChemical.unit,
                          quantity: selectedChemical.quantity,
                          state: selectedChemical.state,
                          hazardClass: selectedChemical.hazardClass,
                          ghs: selectedChemical.ghs,
                          shelf: selectedChemical.shelf,
                          expiryDate: selectedChemical.expiryDate,
                          notes: selectedChemical.notes,
                        });
                        setIsAddModalOpen(true);
                      }}
                      className="p-2.5 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-xl text-primary transition-all flex flex-col items-center gap-1 text-[10px] font-black"
                      title="تعديل البيانات"
                    >
                      <Edit size={17} />
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Smart AI FDS Safety Card Tab */
                <div className="space-y-4">
                  {isGuideLoading ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-7 h-7 border-2 border-primary/25 border-t-primary rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-secondary/75">
                        جاري إعداد بطاقة السلامة والتحضير المخبري (FDS)...
                      </p>
                    </div>
                  ) : activeSafetyGuide ? (
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <span className="font-black text-primary block">معدات الوقاية المطلوبة (EPI)</span>
                        <p className="font-bold text-secondary leading-relaxed">
                          {activeSafetyGuide.ppe.join(' · ')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline/10 space-y-1.5">
                        <span className="font-black text-rose-600 dark:text-rose-400 block">
                          المواد المتعارضة (ممنوع التخزين معها)
                        </span>
                        <p className="font-bold text-secondary leading-relaxed">
                          {activeSafetyGuide.incompatibleWith.join(' · ')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline/10 space-y-1.5">
                        <span className="font-black text-primary block">إرشادات التخزين والتهوية</span>
                        <p className="font-bold text-secondary/85 leading-relaxed">
                          {activeSafetyGuide.storageRules}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline/10 space-y-1.5">
                        <span className="font-black text-primary block">نصائح التحضير المخبري</span>
                        <p className="font-bold text-secondary/85 leading-relaxed">
                          {activeSafetyGuide.prepTips}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline/10 space-y-1.5">
                        <span className="font-black text-amber-700 dark:text-amber-300 block">
                          الإسعافات الأولية والطوارئ
                        </span>
                        <p className="font-bold text-secondary/85 leading-relaxed">
                          {activeSafetyGuide.firstAid}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline/10 space-y-1.5">
                        <span className="font-black text-primary block">التعامل مع الانسكاب والتخلص الآمن</span>
                        <p className="font-bold text-secondary/85 leading-relaxed">
                          {activeSafetyGuide.spillAndDisposal}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFetchSafetyGuide(selectedChemical, true)}
                        className="w-full py-2 rounded-xl border border-outline/15 text-xs font-black text-primary hover:bg-surface-container-low transition-colors"
                      >
                        تحديث بطاقة السلامة
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-3">
                      <p className="text-xs font-bold text-secondary/75">
                        اطلع على معدات الحماية، التعارضات الكيميائية، وإسعافات الطوارئ لهذه المادة.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFetchSafetyGuide(selectedChemical)}
                        className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-black hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                      >
                        <Sparkles size={14} />
                        <span>توليد بطاقة السلامة الذكية</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-10 text-center text-secondary/65 text-sm font-bold border border-outline/15 border-dashed">
              {t('chemicals.select_prompt', 'اختر مادة من القائمة لعرض تفاصيلها المخبرية')}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {activeSelectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-5 py-3.5 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-3 w-[calc(100vw-2rem)] max-w-3xl border border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tabular-nums">
                {activeSelectedIds.length} {t('common.selected', 'مادة مختارة')}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk Shelf Assign */}
              {isBulkShelfPopoverOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (bulkShelfInput.trim()) {
                      handleBulkAssignShelf(bulkShelfInput);
                      setBulkShelfInput('');
                      setIsBulkShelfPopoverOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1"
                >
                  <input
                    autoFocus
                    value={bulkShelfInput}
                    onChange={(e) => setBulkShelfInput(e.target.value)}
                    placeholder="اسم الرف (مثال: A2)"
                    className="bg-transparent text-xs font-bold text-white placeholder:text-white/60 outline-none w-28"
                  />
                  <button type="submit" className="text-xs font-black px-2 py-0.5 rounded-full bg-primary text-white">
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBulkShelfPopoverOpen(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBulkShelfPopoverOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/12 hover:bg-white/20 transition-all font-black text-xs whitespace-nowrap"
                >
                  <FolderInput size={14} />
                  <span>نقل لرف</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsBulkConfirmOpen(true)}
                disabled={isBulkUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-all font-black text-xs disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles size={14} />
                <span>تحديث ذكي</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/12 hover:bg-white/20 transition-all font-black text-xs whitespace-nowrap"
                onClick={() => {
                  const items = chemicals.filter(c => selectedIds.includes(c.id));
                  const worksheet = XLSX.utils.json_to_sheet(
                    items.map(c => ({
                      Chemical: c.nameEn,
                      Arabic: c.nameAr,
                      Formula: c.formula,
                      CAS: c.casNumber || '',
                      Qty: c.quantity,
                      Unit: c.unit,
                      Shelf: c.shelf,
                    }))
                  );
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'SelectedItems');
                  XLSX.writeFile(workbook, `selected_chemicals_${new Date().getTime()}.xlsx`);
                }}
              >
                <Download size={14} />
                <span>تصدير</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const items = chemicals.filter(c => selectedIds.includes(c.id));
                  handlePrintInventoryCards(items);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/12 hover:bg-white/20 transition-all font-black text-xs whitespace-nowrap"
              >
                <Printer size={14} />
                <span>بطاقات</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
                disabled={isDeletingBulk}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white transition-all font-black text-xs disabled:opacity-50 whitespace-nowrap"
              >
                <Trash2 size={14} />
                <span>حذف</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1.5 hover:bg-white/15 rounded-full transition-all"
                aria-label="إلغاء التحديد"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ChemicalAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddChemical}
        onSmartFill={handleSmartFill}
        isGenerating={isGenerating}
        newChemical={newChemical}
        editingChemical={editingChemical}
        onChange={(field, value) => setNewChemical(prev => ({ ...prev, [field]: value }))}
      />

      <ChemicalBulkConfirmModal
        isOpen={isBulkConfirmOpen}
        chemicalsLength={chemicals.length}
        missingCount={missingChemicalsCount}
        selectedCount={activeSelectedIds.length}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkSmartUpdate}
      />

      <ChemicalReviewModal
        isOpen={isReviewModalOpen}
        suggestedUpdate={suggestedUpdate}
        selectedChemical={selectedChemical}
        onClose={() => setIsReviewModalOpen(false)}
        onApprove={handleApproveUpdate}
      />

      <ChemicalLabCalculatorModal
        isOpen={isLabCalcOpen}
        chemical={selectedChemical}
        onClose={() => setIsLabCalcOpen(false)}
        onDeductStock={async (chem, amount, reason) => {
          await handleQuickAdjustQuantity(chem, -amount, reason);
        }}
      />

      <ChemicalSmartImportModal
        isOpen={isSmartImportOpen}
        onClose={() => setIsSmartImportOpen(false)}
        onImport={handleSmartTextImport}
      />

      <ChemicalSafetyAuditModal
        isOpen={isSafetyAuditOpen}
        chemicals={chemicals}
        onClose={() => setIsSafetyAuditOpen(false)}
        onFocusSearch={(term) => setSearchTerm(term)}
      />

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteConfirmOpen && activeSelectedIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border border-outline/15 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-lg font-black text-primary">تأكيد الحذف الجماعي</h4>
                <p className="text-xs font-bold text-secondary/70 tabular-nums">
                  سيتم حذف {activeSelectedIds.length} مادة كيميائية نهائياً من المخزن
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low border border-outline/10 p-3 max-h-40 overflow-y-auto space-y-1 text-xs font-bold text-secondary">
              {selectedItemsList.slice(0, 6).map(item => (
                <div key={item.id} className="truncate">
                  • {item.nameAr || item.nameEn} {item.formula ? `(${item.formula})` : ''}
                </div>
              ))}
              {selectedItemsList.length > 6 && (
                <div className="text-secondary/60 tabular-nums">... و{selectedItemsList.length - 6} مواد أخرى</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-outline/15 text-xs font-black text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={handleBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingBulk ? 'جاري الحذف...' : `حذف (${activeSelectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
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
              const item = chemicals.find(e => e.id === actualId || e.id === data);
              if (item) {
                setSelectedChemical(item);
                setEditingChemical(item);
                setIsAddModalOpen(true);
              } else {
                setToast({ type: 'error', message: 'عذراً، لم يتم العثور على المادة بهذه الشيفرة.' });
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
