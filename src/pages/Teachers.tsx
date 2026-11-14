import React, { useState } from 'react';
import { cn } from '../lib/utils';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Edit,
  Trash2,
  GraduationCap,
  X,
  FileUp,
  Upload,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Eye,
  BookOpen,
  Calendar,
  Award,
  AlertTriangle,
  RotateCcw,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher } from '../types/teachers';
import { useTeachers } from '../hooks/useTeachers';
import { useTranslation } from 'react-i18next';

const SUGGESTED_LEVELS_CEM = ['1 متوسط', '2 متوسط', '3 متوسط', '4 متوسط'];
const SUGGESTED_LEVELS_LYCEE = ['1 ثانوي', '2 ثانوي', '3 ثانوي'];

function getTeacherInitials(tTeacher: Teacher): string {
  const first = (tTeacher.firstName || '').trim();
  const last = (tTeacher.lastName || '').trim();
  if (first && last) return `${first[0]}.${last[0]}`;
  const parts = (tTeacher.name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}.${parts[1][0]}`;
  if (parts.length === 1) return parts[0].slice(0, 2);
  return 'أس';
}

export default function Teachers() {
  const { t, i18n } = useTranslation();
  const {
    schoolName,
    academicYear,
    educationLevel,
    teachers,
    loading,
    searchTerm,
    setSearchTerm,
    selectedRank,
    setSelectedRank,
    selectedSubject,
    setSelectedSubject,
    isAddModalOpen,
    openAddModal,
    openEditModal,
    closeAddModal,
    editingTeacher,
    viewingTeacher,
    setViewingTeacher,
    isImporting,
    isSaving,
    isDeleting,
    selectedIds,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    deleteConfirmTarget,
    setDeleteConfirmTarget,
    requestDeleteTeacher,
    requestBulkDelete,
    confirmDelete,
    copiedCodeId,
    handleCopyCode,
    newTeacher,
    setNewTeacher,
    importMessage,
    columnFilters,
    setColumnFilters,
    showFilterRow,
    setShowFilterRow,
    sortConfig,
    fileInputRef,
    formatDisplayDate,
    handleAddTeacher,
    handleXLSImport,
    handleCSVImport,
    handleExportXLS,
    handleDownloadTemplateXLS,
    handlePrintRoster,
    handleSort,
    resetAllFilters,
    filteredTeachers,
    uniqueRanks,
    uniqueSubjects,
    activeFiltersCount,
    stats,
    parentRef,
    rowVirtualizer
  } = useTeachers();

  const [customLevelInput, setCustomLevelInput] = useState('');

  const suggestedLevels =
    educationLevel === 'Lycée'
      ? [...SUGGESTED_LEVELS_LYCEE, ...SUGGESTED_LEVELS_CEM]
      : [...SUGGESTED_LEVELS_CEM, ...SUGGESTED_LEVELS_LYCEE];

  const toggleLevel = (lvl: string) => {
    const current = Array.isArray(newTeacher.levels) ? newTeacher.levels : [];
    const exists = current.includes(lvl);
    setNewTeacher({
      ...newTeacher,
      levels: exists ? current.filter(item => item !== lvl) : [...current, lvl]
    });
  };

  const handleAddCustomLevel = () => {
    const trimmed = customLevelInput.trim();
    if (!trimmed) return;
    const current = Array.isArray(newTeacher.levels) ? newTeacher.levels : [];
    if (!current.includes(trimmed)) {
      setNewTeacher({ ...newTeacher, levels: [...current, trimmed] });
    }
    setCustomLevelInput('');
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Teacher }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={13} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={13} className="text-primary shrink-0" />
    ) : (
      <ArrowDown size={13} className="text-primary shrink-0" />
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative pb-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Notification Toast */}
      <AnimatePresence>
        {importMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={cn(
              'fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-xl text-center font-bold shadow-xl z-[100] min-w-[300px] border',
              importMessage.type === 'success'
                ? 'bg-primary text-on-primary border-primary/20'
                : 'bg-error text-on-error border-error/20'
            )}
          >
            {importMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Page Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            {t('teachers.title', 'تسيير الأساتذة والموظفين')}
          </h2>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            {schoolName} • السنة الدراسية{' '}
            <span className="font-mono tabular-nums font-bold text-primary">{academicYear}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handlePrintRoster(false)}
            disabled={filteredTeachers.length === 0}
            className="bg-surface-container-lowest border border-outline/20 text-primary px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-surface-container-low transition-colors text-sm font-bold whitespace-nowrap shrink-0 disabled:opacity-40"
          >
            <Printer size={17} />
            <span>طباعة القائمة</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-95 shadow-sm transition-all text-sm font-bold whitespace-nowrap shrink-0"
          >
            <UserPlus size={18} />
            <span>{t('teachers.btn_add', 'تسجيل أستاذ جديد')}</span>
          </button>
        </div>
      </header>

      {/* Structured Stat Bar (Single Elevation, Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-secondary">
              {t('teachers.stat_total', 'إجمالي المسجلين')}
            </div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-secondary">
              {t('teachers.stat_secondary_teachers', 'هيئة التدريس')}
            </div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
              {stats.teachingStaff || stats.secondaryTeachers}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-secondary">
              {t('teachers.stat_lab_staff', 'موظفو المخابر')}
            </div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">{stats.labStaff}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
            <FlaskConical size={20} />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-secondary">المواد والتخصصات</div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums mt-1">
              {stats.uniqueSubjectsCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
        </div>
      </div>

      {/* Unified Search, Filters & Import/Export Toolbar */}
      <section className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search + Dropdown Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[230px]">
              <input
                className="w-full bg-surface-container-low border border-outline/15 rounded-xl py-2.5 pr-10 pl-9 focus:ring-2 focus:ring-primary/25 focus:border-primary/40 text-sm transition-all"
                placeholder={t('teachers.search_placeholder', 'بحث بالاسم، الرمز الوظيفي، المادة، الهاتف...')}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-3 text-outline" size={17} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-2.5 top-2.5 text-outline hover:text-primary p-0.5 rounded"
                  aria-label="مسح البحث"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={selectedRank}
              onChange={e => setSelectedRank(e.target.value)}
              className="bg-surface-container-low border border-outline/15 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-primary/25 text-xs sm:text-sm font-bold cursor-pointer min-w-[150px]"
            >
              <option value="all">{t('teachers.all_ranks', 'كل الرتب')}</option>
              {uniqueRanks.map(rank => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-surface-container-low border border-outline/15 rounded-xl py-2.5 px-3.5 focus:ring-2 focus:ring-primary/25 text-xs sm:text-sm font-bold cursor-pointer min-w-[150px]"
            >
              <option value="all">كل المواد</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept=".csv" className="hidden" id="csvInput" onChange={handleCSVImport} />
            <input type="file" accept=".xls,.xlsx" className="hidden" ref={fileInputRef} onChange={handleXLSImport} />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-surface-container-low border border-outline/20 text-primary px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-surface-container-high transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {isImporting ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <FileUp size={16} />
              )}
              <span>{t('common.import_xls', 'استيراد XLS')}</span>
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('csvInput')?.click()}
              disabled={isImporting}
              className="bg-surface-container-low border border-outline/20 text-secondary px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-surface-container-high transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Upload size={16} />
              <span>{t('common.import_csv', 'CSV')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportXLS(false)}
              disabled={filteredTeachers.length === 0}
              className="bg-surface-container-low border border-outline/20 text-secondary px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-surface-container-high transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 disabled:opacity-40"
              title="تصدير القائمة الحالية إلى Excel"
            >
              <Download size={16} />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplateXLS}
              className="bg-surface-container-low border border-outline/20 text-secondary px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-surface-container-high transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0"
              title="تحميل نموذج Excel متوافق للاستيراد"
            >
              <FileSpreadsheet size={16} />
              <span>نموذج XLS</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFilterRow(!showFilterRow)}
              className={cn(
                'px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors text-xs sm:text-sm font-bold border relative whitespace-nowrap shrink-0',
                showFilterRow
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-low border-outline/20 text-secondary hover:bg-surface-container-high'
              )}
            >
              <Filter size={16} />
              <span>{showFilterRow ? t('teachers.btn_hide_filter', 'إخفاء التصفية') : t('teachers.btn_filter_table', 'تصفية الأعمدة')}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-error text-on-error text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-mono font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Contextual Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap items-center justify-between gap-3 bg-primary/10 border border-primary/25 rounded-xl px-4 py-2.5"
            >
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-primary">
                <span>
                  تم تحديد <span className="font-mono tabular-nums font-black">{selectedIds.length}</span> سجل
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-secondary hover:text-primary underline font-medium whitespace-nowrap"
                >
                  إلغاء التحديد
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintRoster(true)}
                  className="bg-surface-container-lowest border border-outline/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors whitespace-nowrap shrink-0"
                >
                  <Printer size={14} />
                  <span>طباعة المحددين</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportXLS(true)}
                  className="bg-surface-container-lowest border border-outline/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors whitespace-nowrap shrink-0"
                >
                  <Download size={14} />
                  <span>تصدير المحددين</span>
                </button>
                <button
                  type="button"
                  onClick={requestBulkDelete}
                  className="bg-error text-on-error px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                >
                  <Trash2 size={14} />
                  <span>حذف المحددين</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Data Grid */}
      <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl overflow-hidden">
        <div className="max-h-[580px] overflow-auto custom-scrollbar" ref={parentRef}>
          <table className="w-full text-right border-collapse min-w-[820px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-surface-container-low text-secondary text-[11px] font-black border-b border-outline/15">
                <th className="px-4 py-3.5 w-11 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="تحديد الكل"
                    className="w-4 h-4 rounded border-outline/40 text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-4 py-3.5 cursor-pointer group select-none" onClick={() => handleSort('functionalCode')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t('teachers.col_code', 'الرمز الوظيفي')}</span>
                    <SortIcon columnKey="functionalCode" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer group select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t('teachers.col_name', 'الأستاذ / الموظف')}</span>
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer group select-none" onClick={() => handleSort('rank')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t('teachers.col_rank', 'الرتبة والدرجة')}</span>
                    <SortIcon columnKey="rank" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer group select-none" onClick={() => handleSort('subject')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t('teachers.col_subject', 'المادة والمستويات')}</span>
                    <SortIcon columnKey="subject" />
                  </div>
                </th>
                <th className="px-4 py-3.5 cursor-pointer group select-none" onClick={() => handleSort('birthDate')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t('teachers.col_birth_date', 'تاريخ الازدياد')}</span>
                    <SortIcon columnKey="birthDate" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center w-32">{t('common.actions', 'الإجراءات')}</th>
              </tr>

              {showFilterRow && (
                <tr className="bg-surface-container-low/95 border-b border-outline/15">
                  <td className="px-3 py-2 text-center text-[10px] font-bold text-secondary">—</td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/25"
                      placeholder={t('common.filter', 'تصفية الرمز...')}
                      value={columnFilters.functionalCode}
                      onChange={e => setColumnFilters({ ...columnFilters, functionalCode: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/25"
                      placeholder={t('common.filter', 'تصفية الاسم...')}
                      value={columnFilters.name}
                      onChange={e => setColumnFilters({ ...columnFilters, name: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/25"
                      placeholder={t('common.filter', 'تصفية الرتبة...')}
                      value={columnFilters.rank}
                      onChange={e => setColumnFilters({ ...columnFilters, rank: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/25"
                      placeholder={t('common.filter', 'تصفية المادة...')}
                      value={columnFilters.subject}
                      onChange={e => setColumnFilters({ ...columnFilters, subject: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/25"
                      placeholder={t('common.filter', 'تصفية التاريخ...')}
                      value={columnFilters.birthDate}
                      onChange={e => setColumnFilters({ ...columnFilters, birthDate: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-[11px] font-bold text-error hover:underline whitespace-nowrap"
                    >
                      {t('common.reset', 'إعادة تعيين')}
                    </button>
                  </td>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-outline/10 relative">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="w-4 h-4 bg-surface-container-high rounded mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-surface-container-high rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-36 bg-surface-container-high rounded" />
                          <div className="h-3 w-24 bg-surface-container-low rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 bg-surface-container-high rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 bg-surface-container-high rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-surface-container-high rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 bg-surface-container-high rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-secondary flex items-center justify-center mx-auto">
                        <Users size={24} />
                      </div>
                      <h3 className="text-base font-black text-primary">
                        {teachers.length === 0 ? 'لا يوجد أساتذة مسجلون بعد' : 'لا توجد سجلات مطابقة لمعايير البحث'}
                      </h3>
                      <p className="text-xs text-secondary leading-relaxed">
                        {teachers.length === 0
                          ? 'ابدأ بتسجيل الأساتذة وموظفي المخبر يدوياً أو استورد القائمة مباشرة من ملف Excel الخاص بالمؤسسة.'
                          : 'جرّب تعديل كلمات البحث أو إعادة تعيين التصفية لعرض جميع الأساتذة المسجلين.'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {teachers.length === 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={openAddModal}
                              className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <UserPlus size={15} />
                              <span>تسجيل أستاذ جديد</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-surface-container-low border border-outline/20 text-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <FileUp size={15} />
                              <span>استيراد من Excel</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadTemplateXLS}
                              className="bg-surface-container-low border border-outline/20 text-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <FileSpreadsheet size={15} />
                              <span>تحميل النموذج</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={resetAllFilters}
                            className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <RotateCcw size={14} />
                            <span>إعادة تعيين التصفية</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                (() => {
                  const virtualItems = rowVirtualizer.getVirtualItems();
                  const useFallback = virtualItems.length === 0 && filteredTeachers.length > 0;
                  const rowsToRender = useFallback
                    ? filteredTeachers.slice(0, 100).map((item, idx) => ({ item, index: idx, measure: false }))
                    : virtualItems.map(v => ({
                        item: filteredTeachers[v.index],
                        index: v.index,
                        measure: true
                      }));

                  return (
                    <>
                      {!useFallback && virtualItems.length > 0 && virtualItems[0].start > 0 && (
                        <tr>
                          <td style={{ height: `${virtualItems[0].start}px` }} colSpan={7} />
                        </tr>
                      )}
                      {rowsToRender.map(({ item: tTeacher, index, measure }) => {
                        if (!tTeacher) return null;
                        const isSelected = selectedIds.includes(tTeacher.id);
                        const isCopied = copiedCodeId === tTeacher.id;

                        return (
                          <tr
                            key={tTeacher.id}
                            ref={measure ? rowVirtualizer.measureElement : undefined}
                            data-index={index}
                            className={cn(
                              'transition-colors group',
                              isSelected ? 'bg-primary/[0.06]' : 'hover:bg-surface-container-low/50'
                            )}
                          >
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(tTeacher.id)}
                                aria-label={`تحديد ${tTeacher.name}`}
                                className="w-4 h-4 rounded border-outline/40 text-primary focus:ring-primary cursor-pointer accent-primary"
                              />
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="inline-flex items-center gap-1.5">
                                <span className="font-mono tabular-nums text-xs font-bold text-primary">
                                  {tTeacher.functionalCode || '—'}
                                </span>
                                {tTeacher.functionalCode && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(tTeacher)}
                                    title="نسخ الرمز الوظيفي (كود الدخول)"
                                    className="p-1 rounded-md text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
                                  >
                                    {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                                  {getTeacherInitials(tTeacher)}
                                </div>
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => setViewingTeacher(tTeacher)}
                                    className="font-bold text-sm text-primary hover:underline text-right block truncate"
                                  >
                                    {tTeacher.name || 'بدون اسم'}
                                  </button>
                                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-secondary mt-0.5">
                                    {tTeacher.phone && (
                                      <span className="font-mono tabular-nums">{tTeacher.phone}</span>
                                    )}
                                    {tTeacher.email && <span className="truncate max-w-[180px]">{tTeacher.email}</span>}
                                    {!tTeacher.phone && !tTeacher.email && (
                                      <span>
                                        {t('teachers.field_effective_date', 'سريان')}:{' '}
                                        <span className="font-mono tabular-nums">
                                          {formatDisplayDate(tTeacher.effectiveDate)}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-primary">{tTeacher.rank || 'غير محدد'}</span>
                                <div className="text-[11px] text-secondary mt-0.5 flex items-center gap-2">
                                  <span>
                                    {t('teachers.field_grade', 'الدرجة')}:{' '}
                                    <span className="font-mono tabular-nums font-bold text-primary">
                                      {tTeacher.grade || '—'}
                                    </span>
                                  </span>
                                  {tTeacher.effectiveDate && (
                                    <span className="text-outline font-mono tabular-nums">
                                      • {formatDisplayDate(tTeacher.effectiveDate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="text-xs font-extrabold text-primary">{tTeacher.subject || 'غير محدد'}</span>
                                {Array.isArray(tTeacher.levels) && tTeacher.levels.length > 0 && (
                                  <span className="text-[11px] text-secondary mt-0.5 truncate max-w-[200px]">
                                    {tTeacher.levels.join(' · ')}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-xs text-secondary font-mono tabular-nums">
                              {formatDisplayDate(tTeacher.birthDate)}
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex justify-center items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setViewingTeacher(tTeacher)}
                                  title="معاينة البطاقة"
                                  className="p-2 hover:bg-surface-container-high rounded-lg text-secondary hover:text-primary transition-colors"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(tTeacher)}
                                  title="تعديل"
                                  className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDeleteTeacher(tTeacher)}
                                  title="حذف"
                                  className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!useFallback &&
                        virtualItems.length > 0 &&
                        rowVirtualizer.getTotalSize() - (virtualItems.at(-1)?.end || 0) > 0 && (
                          <tr>
                            <td
                              style={{
                                height: `${rowVirtualizer.getTotalSize() - (virtualItems.at(-1)?.end || 0)}px`
                              }}
                              colSpan={7}
                            />
                          </tr>
                        )}
                    </>
                  );
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Table Summary Footer (No dead pagination buttons) */}
        <div className="px-5 py-3.5 bg-surface-container-low border-t border-outline/10 flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-3 text-secondary font-medium">
            <span>
              عرض <strong className="font-mono tabular-nums text-primary">{filteredTeachers.length}</strong> من أصل{' '}
              <strong className="font-mono tabular-nums text-primary">{teachers.length}</strong> أستاذ وموظف
            </span>
            {selectedIds.length > 0 && (
              <span className="text-primary font-bold">
                • محدد: <span className="font-mono tabular-nums">{selectedIds.length}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-primary hover:underline font-bold flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw size={13} />
                <span>مسح جميع الفلاتر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Teacher Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative bg-surface border border-outline/20 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 flex justify-between items-center bg-surface-container-low border-b border-outline/15 shrink-0">
                <h3 className="text-lg font-black text-primary">
                  {editingTeacher
                    ? t('teachers.modal_edit_title', 'تعديل بيانات الأستاذ')
                    : t('teachers.modal_add_title', 'تسجيل أستاذ جديد')}
                </h3>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_code', 'الرمز الوظيفي')} <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      dir="ltr"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-mono font-bold text-sm text-right"
                      value={newTeacher.functionalCode || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, functionalCode: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_birth_date', 'تاريخ الازدياد')}
                    </label>
                    <input
                      type="date"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.birthDate || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, birthDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_last_name', 'اللقب')} <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.lastName || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_first_name', 'الاسم')} <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.firstName || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_rank', 'الرتبة')} <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      list="teacher-ranks-list"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.rank || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, rank: e.target.value })}
                      placeholder="مثال: أستاذ التعليم المتوسط"
                    />
                    <datalist id="teacher-ranks-list">
                      <option value="أستاذ التعليم المتوسط" />
                      <option value="أستاذ رئيسي للتعليم المتوسط" />
                      <option value="أستاذ مكون للتعليم المتوسط" />
                      <option value="أستاذ التعليم الثانوي" />
                      <option value="أستاذ رئيسي للتعليم الثانوي" />
                      <option value="أستاذ مكون للتعليم الثانوي" />
                      <option value="ملحق رئيسي بالمخابر" />
                      <option value="ملحق بالمخابر" />
                      <option value="معاون تقني بالمخابر" />
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_subject', 'المادة / التخصص')} <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      list="teacher-subjects-list"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.subject || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                      placeholder="مثال: العلوم الفيزيائية والتكنولوجيا"
                    />
                    <datalist id="teacher-subjects-list">
                      <option value="العلوم الفيزيائية والتكنولوجيا" />
                      <option value="علوم الطبيعة والحياة" />
                      <option value="العلوم الفيزيائية" />
                      <option value="الكيمياء" />
                      <option value="العلوم الفيزيائية والطبيعية" />
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_grade', 'الدرجة')}
                    </label>
                    <input
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-mono font-bold text-sm"
                      value={newTeacher.grade || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, grade: e.target.value })}
                      placeholder="مثال: 04"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_effective_date', 'تاريخ السريان')}
                    </label>
                    <input
                      type="date"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm"
                      value={newTeacher.effectiveDate || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, effectiveDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">رقم الهاتف</label>
                    <input
                      type="tel"
                      dir="ltr"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-mono font-bold text-sm text-right"
                      value={newTeacher.phone || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                      placeholder="06xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary block">
                      {t('teachers.field_email', 'البريد الإلكتروني')}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/25 font-bold text-sm text-right"
                      value={newTeacher.email || ''}
                      onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Teaching Levels Selector */}
                <div className="space-y-2 pt-1 border-t border-outline/10">
                  <label className="text-xs font-bold text-secondary block">المستويات / الأقسام المسندة</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedLevels.map(lvl => {
                      const active = Array.isArray(newTeacher.levels) && newTeacher.levels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleLevel(lvl)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap',
                            active
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-low text-secondary border-outline/20 hover:bg-surface-container-high'
                          )}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customLevelInput}
                      onChange={e => setCustomLevelInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomLevel();
                        }
                      }}
                      placeholder="إضافة مستوى أو قسم مخصص (مثال: 2 ع ت 1)..."
                      className="flex-1 bg-surface-container-low border border-outline/20 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLevel}
                      className="bg-surface-container-high text-primary px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-primary/10 transition-colors whitespace-nowrap shrink-0"
                    >
                      إضافة
                    </button>
                  </div>
                  {Array.isArray(newTeacher.levels) &&
                    newTeacher.levels.filter(l => !suggestedLevels.includes(l)).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {newTeacher.levels
                          .filter(l => !suggestedLevels.includes(l))
                          .map(extra => (
                            <span
                              key={extra}
                              className="inline-flex items-center gap-1.5 bg-surface-container-high text-primary px-2.5 py-1 rounded-lg text-xs font-bold"
                            >
                              {extra}
                              <button
                                type="button"
                                onClick={() => toggleLevel(extra)}
                                className="text-secondary hover:text-error"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline/10">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-5 py-2.5 rounded-xl border border-outline/20 text-secondary font-bold text-sm hover:bg-surface-container-low transition-colors whitespace-nowrap"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSaving ? 'جاري الحفظ...' : t('common.save', 'حفظ البيانات')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher Details Inspection Modal */}
      <AnimatePresence>
        {viewingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingTeacher(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative bg-surface border border-outline/20 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 bg-surface-container-low border-b border-outline/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-sm shrink-0">
                    {getTeacherInitials(viewingTeacher)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-primary truncate">{viewingTeacher.name}</h3>
                    <p className="text-xs text-secondary truncate">{viewingTeacher.rank || 'أستاذ / موظف'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingTeacher(null)}
                  className="p-2 hover:bg-surface-container-high rounded-lg text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="bg-surface-container-low border border-outline/15 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-secondary">الرمز الوظيفي (رمز الدخول لبوابة الأستاذ)</div>
                    <div className="font-mono tabular-nums font-black text-base text-primary mt-0.5">
                      {viewingTeacher.functionalCode || 'غير محدد'}
                    </div>
                  </div>
                  {viewingTeacher.functionalCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(viewingTeacher)}
                      className="bg-surface-container-lowest border border-outline/20 px-3 py-1.5 rounded-lg text-xs font-bold text-primary flex items-center gap-1.5 hover:bg-surface-container-high transition-colors whitespace-nowrap"
                    >
                      {copiedCodeId === viewingTeacher.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedCodeId === viewingTeacher.id ? 'تم النسخ' : 'نسخ الرمز'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold flex items-center gap-1.5">
                      <BookOpen size={13} />
                      <span>المادة / التخصص</span>
                    </div>
                    <div className="font-bold text-primary mt-1">{viewingTeacher.subject || 'غير محدد'}</div>
                  </div>

                  <div className="bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold flex items-center gap-1.5">
                      <Award size={13} />
                      <span>الدرجة وتاريخ السريان</span>
                    </div>
                    <div className="font-bold text-primary mt-1 font-mono tabular-nums">
                      {viewingTeacher.grade || '—'} • {formatDisplayDate(viewingTeacher.effectiveDate)}
                    </div>
                  </div>

                  <div className="bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>تاريخ الازدياد</span>
                    </div>
                    <div className="font-bold text-primary mt-1 font-mono tabular-nums">
                      {formatDisplayDate(viewingTeacher.birthDate)}
                    </div>
                  </div>

                  <div className="bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold flex items-center gap-1.5">
                      <Phone size={13} />
                      <span>رقم الهاتف</span>
                    </div>
                    <div className="font-bold text-primary mt-1 font-mono tabular-nums">
                      {viewingTeacher.phone || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="col-span-2 bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold flex items-center gap-1.5">
                      <Mail size={13} />
                      <span>البريد الإلكتروني</span>
                    </div>
                    <div className="font-bold text-primary mt-1 break-all">
                      {viewingTeacher.email || 'غير مسجل'}
                    </div>
                  </div>

                  <div className="col-span-2 bg-surface-container-low/60 border border-outline/10 rounded-xl p-3">
                    <div className="text-secondary font-bold">المستويات المسندة</div>
                    <div className="font-bold text-primary mt-1">
                      {Array.isArray(viewingTeacher.levels) && viewingTeacher.levels.length > 0
                        ? viewingTeacher.levels.join(' — ')
                        : 'غير محددة'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-surface-container-low border-t border-outline/15 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingTeacher;
                    setViewingTeacher(null);
                    requestDeleteTeacher(target);
                  }}
                  className="text-error hover:bg-error/10 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Trash2 size={14} />
                  <span>حذف السجل</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingTeacher;
                    setViewingTeacher(null);
                    openEditModal(target);
                  }}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity whitespace-nowrap"
                >
                  <Edit size={14} />
                  <span>تعديل البيانات</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirmTarget(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative bg-surface border border-outline/20 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-primary">تأكيد الحذف</h3>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {deleteConfirmTarget.mode === 'single' ? (
                      <>
                        هل أنت متأكد من حذف سجل{' '}
                        <strong className="text-primary">{deleteConfirmTarget.teacher.name}</strong>؟ لا يمكن التراجع عن
                        هذا الإجراء بعد تنفيذه.
                      </>
                    ) : (
                      <>
                        هل أنت متأكد من حذف{' '}
                        <strong className="text-primary font-mono tabular-nums">
                          {deleteConfirmTarget.ids.length}
                        </strong>{' '}
                        سجلات محددة؟ لا يمكن التراجع عن هذا الإجراء.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="px-4 py-2 rounded-xl border border-outline/20 text-secondary text-xs font-bold hover:bg-surface-container-low transition-colors whitespace-nowrap"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="bg-error text-on-error px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، تأكيد الحذف'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
