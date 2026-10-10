import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Plus, 
  Printer, 
  ChevronLeft, 
  Save, 
  History, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  FileDown, 
  ChevronUp, 
  ChevronDown, 
  User, 
  Users, 
  BookOpen, 
  PenTool, 
  X, 
  FlaskConical, 
  Copy, 
  Eye, 
  RotateCcw, 
  FileSpreadsheet, 
  Calendar, 
  Sparkles, 
  Check, 
  Search, 
  Filter, 
  AlertTriangle,
  AlertCircle,
  CalendarOff,
  MessageSquare,
  Scale,
  MapPin,
  Building,
  School,
  FileCheck,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatOfficialRankTitle } from '../lib/utils';
import TimeSlotManager from '../components/TimeSlotManager';
import ClassPicker from '../components/ClassPicker';
import ResourcePicker from '../components/ResourcePicker';
import ExperimentPresetModal from '../components/ExperimentPresetModal';
import { useDailyReport } from '../hooks/useDailyReport';
import { LAB_OBSERVATION_PRESETS, ExperimentPreset } from '../data/labExperimentPresets';
import { SavedReport, RoutingType } from '../types/reports';

export default function DailyReport() {
  const {
    schoolId,
    navigate,
    timeSlots,
    loadingTimeSlots,
    isTimeManagerOpen, setIsTimeManagerOpen,
    pickerState, setPickerState,
    resourcePickerState, setResourcePickerState,
    isPresetModalOpen, setIsPresetModalOpen,
    presetTargetRowId, setPresetTargetRowId,
    teachers,
    activeTab, setActiveTab,
    date, setDate,
    reportNumber, setReportNumber,
    docRouting, setDocRouting,
    docDepartment, setDocDepartment,
    docAcademicYear, setDocAcademicYear,
    docLocation, setDocLocation,
    docSender, setDocSender,
    docRecipient, setDocRecipient,
    docSigners, setDocSigners,
    handleSetRouting,
    rows,
    labNotes, setLabNotes,
    supervisorNotes, setSupervisorNotes,
    directorNotes, setDirectorNotes,
    institution,
    history,
    isSaving,
    signature, setSignature,
    isSignatureModalOpen, setIsSignatureModalOpen,
    signatureCanvasRef,
    isDrawing,
    startDrawing,
    stopDrawing,
    draw,
    clearSignature,
    saveSignature,
    isDeleting, setIsDeleting,
    showDeleteConfirm, setShowDeleteConfirm,
    deleteTargetReportId, setDeleteTargetReportId,
    handleDeleteHistoryReport,
    isLoading,
    isLoadingHistory,
    saveSuccess,
    copySuccessMessage,
    stats,
    addRow,
    duplicateRow,
    clearAllRows,
    updateRow,
    removeRow,
    moveRow,
    copyFromPreviousReport,
    applyExperimentPreset,
    addPresetAsNewRow,
    appendLabNote,
    appendSupervisorNote,
    appendDirectorNote,
    goToToday,
    goToYesterday,
    goToTomorrow,
    handleSave,
    handleDelete,
    handlePrint,
    handlePreviewPdf,
    handleExportPDF,
    handleExportWord,
    downloadBlankPDF,
    downloadBlankWord,
    printBlankReport,
    printNoActivitiesReport,
    downloadNoActivitiesPDF,
    downloadNoActivitiesWord,
    noActivities,
    setNoActivities,
    noActivitiesReason,
    setNoActivitiesReason,
    loadReport,
    handlePreviewHistoryReport,
    handleExportHistoryWord,
    printHistoryReport,
    exportHistorySummaryExcel,
    getDayName,
    setRows
  } = useDailyReport();

  // Blank template menu dropdown state
  const [isBlankMenuOpen, setIsBlankMenuOpen] = useState(false);
  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Copy previous confirmation modal state
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  // Show header settings drawer / panel
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);

  // History search and filter state
  const [historySearch, setHistorySearch] = useState('');
  const [historyMonthFilter, setHistoryMonthFilter] = useState('all');

  // Filtered history records
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchSearch = 
        !historySearch ||
        item.date.includes(historySearch) ||
        (item.reportNumber && item.reportNumber.includes(historySearch)) ||
        (item.dayName && item.dayName.includes(historySearch)) ||
        item.rows?.some(r => 
          (r.teacher && r.teacher.includes(historySearch)) ||
          (r.class && r.class.includes(historySearch)) ||
          (r.activityTitle && r.activityTitle.includes(historySearch)) ||
          (r.equipment && r.equipment.includes(historySearch))
        );

      const matchMonth = 
        historyMonthFilter === 'all' || 
        item.date.startsWith(historyMonthFilter);

      return matchSearch && matchMonth;
    });
  }, [history, historySearch, historyMonthFilter]);

  // Distinct months in history for dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    history.forEach(item => {
      if (item.date) {
        months.add(item.date.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(months).sort().reverse();
  }, [history]);

  return (
    <div className="min-h-screen bg-surface-container-low/30 p-4 md:p-10 rtl pb-24 font-sans" dir="rtl">
      {/* Time Slot Manager Modal */}
      <TimeSlotManager 
        isOpen={isTimeManagerOpen} 
        onClose={() => setIsTimeManagerOpen(false)} 
      />

      {/* Class Picker Modal */}
      <ClassPicker 
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState({ isOpen: false, rowId: null })}
        onSelect={(className) => {
          if (pickerState.rowId !== null) {
            updateRow(pickerState.rowId, 'class', className);
          }
        }}
        initialValue={pickerState.rowId !== null ? rows.find(r => r.id === pickerState.rowId)?.class : ''}
      />

      {/* Resource & Equipment Picker Modal */}
      <ResourcePicker 
        isOpen={resourcePickerState.isOpen}
        onClose={() => setResourcePickerState({ isOpen: false, rowId: null })}
        onSelect={(resources) => {
          if (resourcePickerState.rowId !== null) {
            updateRow(resourcePickerState.rowId, 'equipment', resources);
          }
        }}
        initialValue={resourcePickerState.rowId !== null ? rows.find(r => r.id === resourcePickerState.rowId)?.equipment : ''}
      />

      {/* Experiment Preset Modal */}
      <ExperimentPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => {
          setIsPresetModalOpen(false);
          setPresetTargetRowId(null);
        }}
        onSelect={(preset) => {
          if (presetTargetRowId !== null) {
            applyExperimentPreset(presetTargetRowId, preset);
          } else {
            addPresetAsNewRow(preset);
          }
        }}
        onAddNewRow={(preset) => addPresetAsNewRow(preset)}
        targetRowNumber={presetTargetRowId !== null ? rows.findIndex(r => r.id === presetTargetRowId) + 1 : null}
      />

      {/* Delete Confirmation Modal (Current Report) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-outline/10 text-center"
            >
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-error" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-2">تأكيد حذف التقرير</h3>
              <p className="text-secondary font-bold mb-8">هل أنت متأكد من رغبتك في حذف هذا التقرير ليوم {getDayName(date)} ({date})؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 rounded-2xl bg-surface-container-high text-primary font-black hover:bg-surface-container-highest transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-2xl bg-error text-on-error font-black shadow-lg shadow-error/20 hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Archived History Report) */}
      <AnimatePresence>
        {deleteTargetReportId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-outline/10 text-center"
            >
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-error" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-2">حذف التقرير من الأرشيف</h3>
              <p className="text-secondary font-bold mb-8">سيتم حذف هذا التقرير نهائياً من الأرشيف الإلكتروني.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteTargetReportId(null)}
                  className="flex-1 py-4 rounded-2xl bg-surface-container-high text-primary font-black hover:bg-surface-container-highest transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => handleDeleteHistoryReport(deleteTargetReportId)}
                  className="flex-1 py-4 rounded-2xl bg-error text-on-error font-black shadow-lg shadow-error/20 hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  حذف نهائي
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Table Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-outline/10 text-center"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw size={32} />
              </div>
              <h3 className="text-2xl font-black text-primary mb-2">إعادة ضبط الجدول</h3>
              <p className="text-secondary font-bold mb-8">هل تريد مسح جميع أسطر الحصص وإعادة الجدول إلى وضعه الافتراضي؟</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-surface-container-high text-primary font-black hover:bg-surface-container-highest transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    clearAllRows();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-600 text-white font-black hover:bg-amber-700 transition-all shadow-md"
                >
                  مسح وإعادة ضبط
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy From Yesterday / Previous Confirmation Modal */}
      <AnimatePresence>
        {showCopyConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-outline/10 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Copy size={32} />
              </div>
              <h3 className="text-2xl font-black text-primary mb-2">نسخ من آخر تقرير محفوظ</h3>
              <p className="text-secondary font-bold mb-8">سيتم استبدال أسطر الجدول والملاحظات الحالية ببيانات آخر تقرير تم تسجيله في المخبر. هل تود المتابعة؟</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCopyConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-surface-container-high text-primary font-black hover:bg-surface-container-highest transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={async () => {
                    setIsCopying(true);
                    await copyFromPreviousReport();
                    setIsCopying(false);
                    setShowCopyConfirm(false);
                  }}
                  disabled={isCopying}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-on-primary font-black hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isCopying ? <Loader2 size={18} className="animate-spin" /> : <Copy size={18} />}
                  تأكيد النسخ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy Success Toast Notice */}
      <AnimatePresence>
        {copySuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] bg-primary text-on-primary px-6 py-3.5 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 border border-primary/20 no-print"
          >
            <CheckCircle2 size={20} className="text-emerald-300" />
            <span>{copySuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation & Action Controls Bar */}
      <div className="max-w-6xl mx-auto mb-6 no-print space-y-4">
        {/* Row 1: Tab switcher, Date navigation, Main Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-surface p-4 rounded-3xl border border-outline/10 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 text-primary hover:bg-surface-container-high rounded-2xl transition-all active:scale-95 shadow-sm"
              title="رجوع"
            >
              <ChevronLeft size={22} className="rotate-180" />
            </button>
            <div className="bg-surface-container-low p-1.5 rounded-2xl flex border border-outline/5 flex-1 lg:flex-initial">
              <button
                onClick={() => setActiveTab('new')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 flex-1 lg:flex-initial",
                  activeTab === 'new' 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "text-secondary hover:text-primary"
                )}
              >
                <Plus size={18} />
                التقرير اليومي
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 flex-1 lg:flex-initial",
                  activeTab === 'history' 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "text-secondary hover:text-primary"
                )}
              >
                <History size={18} />
                الأرشيف ({history.length})
              </button>
            </div>
          </div>

          {/* Quick Date Jumper (in New Report tab) */}
          {activeTab === 'new' && (
            <div className="flex items-center gap-2 bg-surface-container-low/60 px-3 py-1.5 rounded-2xl border border-outline/10">
              <Calendar size={18} className="text-primary/60" />
              <button
                onClick={goToYesterday}
                className="px-2.5 py-1 text-xs font-black text-secondary hover:text-primary hover:bg-surface rounded-lg transition-all"
                title="اليوم السابق"
              >
                أمس
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-black bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-all"
                title="تاريخ اليوم"
              >
                اليوم
              </button>
              <button
                onClick={goToTomorrow}
                className="px-2.5 py-1 text-xs font-black text-secondary hover:text-primary hover:bg-surface rounded-lg transition-all"
                title="اليوم الموالي"
              >
                غداً
              </button>
              <span className="w-px h-4 bg-outline/20 mx-1" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-black text-primary outline-none cursor-pointer"
              />
              <span className="text-xs font-black text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md">
                {getDayName(date)}
              </span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {activeTab === 'new' && (
              <>
                {/* Header Metadata Settings toggle */}
                <button 
                  onClick={() => setShowHeaderSettings(!showHeaderSettings)}
                  className={cn(
                    "border px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all active:scale-95",
                    showHeaderSettings 
                      ? "bg-primary text-on-primary border-primary shadow-sm" 
                      : "bg-surface text-secondary hover:text-primary border-outline/15 hover:bg-surface-container-low"
                  )}
                  title="تخصيص بيانات الترويسة الإدارية ومكان التحرير"
                >
                  <SlidersHorizontal size={16} />
                  بيانات الترويسة
                </button>

                {/* Time Slot Manager Button */}
                <button 
                  onClick={() => setIsTimeManagerOpen(true)}
                  className="bg-surface text-secondary hover:text-primary border border-outline/15 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all active:scale-95"
                  title="تخصيص الحصص وتوقيت فترات العمل"
                >
                  <Clock size={16} />
                  المواقيت
                </button>

                {/* Preset Experiments Modal Launcher */}
                <button 
                  onClick={() => {
                    setPresetTargetRowId(null);
                    setIsPresetModalOpen(true);
                  }}
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all active:scale-95 shadow-sm"
                  title="استعراض بنك التجارب والأنشطة المنهجية الجاهزة"
                >
                  <FlaskConical size={16} />
                  بنك التجارب
                </button>

                {/* Copy from Yesterday button */}
                <button 
                  onClick={() => setShowCopyConfirm(true)}
                  className="bg-surface text-secondary hover:text-primary border border-outline/15 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all active:scale-95"
                  title="استيراد ونسخ بيانات آخر تقرير مسجل"
                >
                  <Copy size={16} />
                  نسخ السابق
                </button>

                {/* Blank Template Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsBlankMenuOpen(!isBlankMenuOpen)}
                    className="bg-surface text-secondary hover:text-primary border border-outline/15 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black hover:bg-surface-container-low transition-all active:scale-95"
                    title="خيارات الاستمارة البيضاء الفارغة للتحرير اليدوي"
                  >
                    <FileText size={16} />
                    استمارة فارغة
                    <ChevronDown size={14} />
                  </button>
                  {isBlankMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-outline/10 p-2 z-50 space-y-1">
                      <div className="px-3 py-1 text-[10px] font-black text-secondary uppercase tracking-wider">
                        استمارة بيضاء عادية
                      </div>
                      <button
                        onClick={() => {
                          printBlankReport();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-surface-container-low flex items-center gap-2"
                      >
                        <Printer size={15} />
                        طباعة استمارة بيضاء فوراً
                      </button>
                      <button
                        onClick={() => {
                          downloadBlankPDF();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-surface-container-low flex items-center gap-2"
                      >
                        <FileDown size={15} />
                        تحميل استمارة بيضاء (PDF)
                      </button>
                      <button
                        onClick={() => {
                          downloadBlankWord();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-surface-container-low flex items-center gap-2"
                      >
                        <FileText size={15} />
                        تحميل استمارة بيضاء (Word)
                      </button>

                      <div className="border-t border-outline/10 my-1 pt-1 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={12} />
                        نموذج خاص: بدون نشاطات
                      </div>
                      <button
                        onClick={() => {
                          printNoActivitiesReport();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <Printer size={15} />
                        طباعة نموذج خاص (بدون نشاطات)
                      </button>
                      <button
                        onClick={() => {
                          downloadNoActivitiesPDF();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <FileDown size={15} />
                        تحميل نموذج خاص (PDF)
                      </button>
                      <button
                        onClick={() => {
                          downloadNoActivitiesWord();
                          setIsBlankMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <FileText size={15} />
                        تحميل نموذج خاص (Word)
                      </button>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saveSuccess 
                      ? "bg-emerald-600 text-white" 
                      : "bg-surface text-primary border border-outline/20 hover:border-primary/40"
                  )}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  {saveSuccess ? "تم الحفظ بنجاح!" : "حفظ التقرير"}
                </button>

                {/* Delete Report Button */}
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="p-2.5 text-error hover:bg-error/10 border border-error/20 rounded-2xl transition-all"
                  title="حذف التقرير الحالي"
                >
                  <Trash2 size={16} />
                </button>

                {/* Export / Print Group */}
                <div className="flex bg-surface rounded-2xl border border-outline/15 p-1 shadow-sm gap-1">
                  <button 
                    onClick={handlePreviewPdf}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                    title="معاينة PDF تفاعلية متقدمة"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                    title="تحميل PDF مباشر"
                  >
                    <FileDown size={18} />
                  </button>
                  <button 
                    onClick={handleExportWord}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                    title="تصدير مستند Word (.doc)"
                  >
                    <FileText size={18} />
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="bg-primary text-on-primary px-4 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black shadow hover:bg-primary/90 transition-all active:scale-95"
                    title="طباعة الاستمارة الرسمية مباشرة"
                  >
                    <Printer size={16} />
                    طباعة
                  </button>
                </div>
              </>
            )}

            {/* Archive Actions */}
            {activeTab === 'history' && (
              <button
                onClick={exportHistorySummaryExcel}
                disabled={history.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black shadow transition-all disabled:opacity-50"
              >
                <FileSpreadsheet size={16} />
                تصدير الأرشيف إلى Excel
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Special No-Activities Mode Control Panel (نموذج خاص في حالة عدم وجود نشاطات تطبيقية) */}
        {activeTab === 'new' && (
          <div className="bg-surface p-4 rounded-3xl border border-outline/10 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <AlertCircle size={18} className={noActivities ? "text-amber-500" : "text-primary/70"} />
                <span>نموذج التقرير اليومي وحالة الأنشطة التطبيقية:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNoActivities(!noActivities)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-sm",
                    noActivities
                      ? "bg-amber-500 text-white shadow-amber-500/20"
                      : "bg-surface-container-low/70 hover:bg-surface-container-low text-primary border border-outline/15"
                  )}
                >
                  <CalendarOff size={15} />
                  {noActivities ? "نموذج خاص مفعّل: يوم بدون أنشطة تطبيقية" : "تفعيل نموذج خاص (يوم بدون أنشطة تطبيقية)"}
                </button>
              </div>
            </div>

            {/* When No Activities Mode is Active */}
            {noActivities ? (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                    سبب عدم إنجاز أو برمجة نشاطات تطبيقية لهذا اليوم:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={printNoActivitiesReport}
                      className="bg-primary text-on-primary px-3 py-1.5 rounded-xl text-xs font-black shadow hover:bg-primary/90 transition-all flex items-center gap-1.5"
                    >
                      <Printer size={13} />
                      طباعة النموذج الخاص
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoActivities(false)}
                      className="text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline px-2 py-1"
                    >
                      إلغاء والعودة للحصص
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={noActivitiesReason}
                    onChange={(e) => setNoActivitiesReason(e.target.value)}
                    placeholder="اكتب سبب عدم وجود نشاطات تطبيقية..."
                    className="w-full bg-surface border border-outline/20 rounded-xl px-3.5 py-2 text-xs font-bold text-primary outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Quick Presets for Reasons */}
                <div className="flex flex-wrap gap-1.5 items-center pt-1">
                  <span className="text-[10px] font-black text-amber-800/80 dark:text-amber-300/80 ml-1">أسباب جاهزة:</span>
                  {[
                    'أعمال الصيانة الدورية وتنظيم وتصنيف عتاد المخبر وتحضير المحاليل والتجارب',
                    'فترة اختبارات وفروض فصلية رسمية (توقف الأنشطة المخبرية مؤقتاً)',
                    'أعمال الجرد السنوي والمراجعة التقنية والوقائية للوسائل',
                    'يوم مخصص للتحضير المسبق للتجارب المنهجية للأسبوع القادم',
                    'غياب مبرر لأساتذة المادة أو عطلة رسمية'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoActivitiesReason(preset)}
                      className={cn(
                        "text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all text-right",
                        noActivitiesReason === preset
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-surface text-secondary hover:text-primary border-outline/15 hover:bg-surface-container-low"
                      )}
                    >
                      {idx === 0 ? '🛠️ صيانة وتنظيم' : idx === 1 ? '📝 فترة امتحانات' : idx === 2 ? '📦 جرد ومراجعة' : idx === 3 ? '⚗️ تحضير تجارب' : '👨‍🏫 غياب أو عطلة'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] font-bold text-secondary">
                الوضع الحالي: تسجيل وتوثيق الحصص والتجارب المخبرية المنجزة مع الأساتذة. إذا كان اليوم بدون حصص، اضغط على الزر أعلاه لتفعيل النموذج الخاص.
              </p>
            )}
          </div>
        )}

        {/* Row 3: Collapsible Header & Institution Customization Drawer */}
        {activeTab === 'new' && showHeaderSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface p-5 rounded-3xl border border-outline/10 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <h4 className="text-sm font-black text-primary flex items-center gap-2">
                <Building size={16} />
                تخصيص بيانات الترويسة الإدارية الرسمية ومكان التحرير
              </h4>
              <button 
                onClick={() => setShowHeaderSettings(false)}
                className="text-xs font-bold text-secondary hover:text-primary"
              >
                إغلاق
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-secondary block mb-1">المصلحة:</label>
                <input 
                  type="text"
                  value={docDepartment}
                  onChange={(e) => setDocDepartment(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl px-3 py-2 font-black text-primary outline-none focus:border-primary"
                  placeholder="مخبر العلوم الفيزيائية والطبيعية"
                />
              </div>

              <div>
                <label className="font-bold text-secondary block mb-1">السنة الدراسية:</label>
                <input 
                  type="text"
                  value={docAcademicYear}
                  onChange={(e) => setDocAcademicYear(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl px-3 py-2 font-black text-primary outline-none focus:border-primary text-center"
                  placeholder="2026 / 2027"
                />
              </div>

              <div>
                <label className="font-bold text-secondary block mb-1">مكان التحرير:</label>
                <input 
                  type="text"
                  value={docLocation}
                  onChange={(e) => setDocLocation(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl px-3 py-2 font-black text-primary outline-none focus:border-primary"
                  placeholder="عين كرشة"
                />
              </div>

              <div>
                <label className="font-bold text-secondary block mb-1">المحرر / الوظيفة:</label>
                <input 
                  type="text"
                  value={docSender}
                  onChange={(e) => setDocSender(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl px-3 py-2 font-black text-primary outline-none focus:border-primary"
                  placeholder="الملحق الرئيس بالمخابر"
                />
              </div>
            </div>

            <div className="p-3 bg-surface-container-low/50 rounded-2xl text-[11px] font-bold text-secondary flex items-center justify-between">
              <span><strong>صيغة التحرير المعتمدة في أسفل الوثيقة:</strong> حرر بـ : {docLocation || 'عين كرشة'} في : {date}</span>
              <span className="text-primary font-black">جاهزة للطباعة والتصدير</span>
            </div>
          </motion.div>
        )}

        {/* Row 4: Live Day Statistics Widget */}
        {activeTab === 'new' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface p-4 rounded-3xl border border-outline/10 shadow-sm text-center">
            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-secondary mb-1">إجمالي الحصص المسجلة</span>
              <span className="text-2xl font-black text-primary">{stats.totalSessions}</span>
              <span className="text-[10px] text-primary/60 font-bold mt-0.5">
                {stats.totalSessions > 0 ? "نشاط مسجل في المخبر" : "لا توجد حصص بعد"}
              </span>
            </div>

            <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-secondary mb-1">الأساتذة المؤطرون</span>
              <span className="text-2xl font-black text-amber-700">{stats.distinctTeachersCount}</span>
              <span className="text-[10px] text-amber-600 font-bold mt-0.5 truncate max-w-full">
                {stats.distinctTeachers.length > 0 ? stats.distinctTeachers.slice(0, 2).join('، ') : "---"}
              </span>
            </div>

            <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-secondary mb-1">الأقسام المستفيدة</span>
              <span className="text-2xl font-black text-emerald-700">{stats.distinctClassesCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 truncate max-w-full">
                {stats.distinctClasses.length > 0 ? stats.distinctClasses.join('، ') : "---"}
              </span>
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-secondary mb-1">تصنيف الأنشطة</span>
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 mt-1">
                <span>عملي: {stats.practicalCount}</span>
                <span className="text-outline/40">|</span>
                <span>محاكاة: {stats.simulationCount}</span>
                <span className="text-outline/40">|</span>
                <span>EXAO: {stats.exaoCount}</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold mt-0.5">أنشطة بيداغوجية</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'new' ? (
          <motion.div 
            key="new-report"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-5xl mx-auto bg-surface rounded-[40px] shadow-2xl p-8 md:p-14 min-h-[29.7cm] border border-outline/5 font-report relative overflow-hidden print-container"
          >
            {/* Algerian Official Letterhead */}
            <div className="relative z-10 flex justify-between items-start border-b-2 border-primary pb-8 mb-8">
              <div className="text-right text-[11px] font-bold space-y-2 text-primary">
                <p className="font-black text-sm">{institution?.directorate || 'مديرية التربية لولاية أم البواقي'}</p>
                <p className="font-black text-sm">{institution?.school || 'متوسطة قطاف الطاهر - عين كرشة'}</p>
              </div>

              <div className="text-center space-y-2.5 flex-1 px-4">
                <p className="text-2xl font-black text-primary tracking-tight leading-relaxed">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-lg font-black text-primary/85">وزارة التربية الوطنية</p>
                <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
              </div>

              <div className="text-left text-[11px] font-bold space-y-2 text-primary">
                <p className="font-black text-sm">
                  السنة الدراسية: <span className="border-b-2 border-primary px-3 inline-block font-black">{docAcademicYear || '2026 / 2027'}</span>
                </p>
                <p className="font-black text-sm">
                  المخبر: <span className="border-b-2 border-primary px-3 inline-block font-black">{docDepartment || 'مخبر العلوم الفيزيائية والطبيعية'}</span>
                </p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center mb-8">
              <h2 className="relative z-10 text-3xl md:text-4xl font-black text-primary uppercase tracking-[0.1em] inline-block">
                التقرير اليومي للمخبر
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full h-1 bg-primary rounded-full opacity-20" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-primary rounded-full" />
              </h2>
              {noActivities && (
                <div className="mt-4 block">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-black">
                    <AlertCircle size={14} />
                    نموذج خاص: يوم بدون أنشطة تطبيقية بالمخبر
                  </span>
                </div>
              )}
            </div>

            {/* Date Details Bar */}
            <div className="relative z-10 flex flex-wrap gap-6 mb-8 text-sm font-bold text-primary">
              <div className="flex items-center gap-3 bg-surface-container-low/40 px-5 py-2.5 rounded-2xl border border-outline/5">
                <label className="font-black opacity-60 uppercase text-xs">رقم التقرير:</label>
                <span className="font-black text-primary text-base" dir="ltr">{reportNumber || '01'}</span>
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low/40 px-5 py-2.5 rounded-2xl border border-outline/5">
                <label className="font-black opacity-60 uppercase text-xs">التاريخ:</label>
                <input 
                  className="bg-transparent outline-none text-center w-40 font-black border-b-2 border-primary/20 focus:border-primary transition-all text-base" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low/40 px-5 py-2.5 rounded-2xl border border-outline/5">
                <label className="font-black opacity-60 uppercase text-xs">الموافق ليوم:</label>
                <span className="font-black text-primary min-w-[90px] text-center text-base">{getDayName(date)}</span>
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low/40 px-5 py-2.5 rounded-2xl border border-outline/5 mr-auto">
                <label className="font-black opacity-60 uppercase text-xs">{noActivities ? 'الوضعية:' : 'عدد الحصص المسجلة:'}</label>
                <span className="font-black text-primary text-base">{noActivities ? 'يوم بدون أنشطة تطبيقية' : `${rows.length} حصة`}</span>
              </div>
            </div>

            {/* Special Blank Template when No Practical Activities */}
            {noActivities ? (
              <div className="relative z-10 space-y-5">
                <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 md:p-8 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-100 text-xs font-black">
                    <AlertCircle size={15} />
                    نموذج رسمي خاص: يوم بدون أنشطة تطبيقية بالمخبر
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-primary">
                    لم تُسجّل أيّ حصص أو أعمال تطبيقية بالمخبر خلال هذا اليوم
                  </h3>
                  <div className="bg-surface/80 border border-outline/10 rounded-2xl p-4 max-w-2xl mx-auto space-y-2">
                    <p className="text-xs font-black text-secondary">
                      طبيعة المهام والأنشطة المنجزة في المخبر:
                    </p>
                    <p className="text-sm font-black text-primary leading-relaxed">
                      {noActivitiesReason || 'أعمال الصيانة الدورية وتنظيم وتصنيف عتاد المخبر وتحضير المحاليل والتجارب'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={printNoActivitiesReport}
                      className="bg-primary text-on-primary px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black shadow hover:bg-primary/90 transition-all active:scale-95"
                    >
                      <Printer size={16} />
                      طباعة النموذج الخاص الفارغ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoActivities(false)}
                      className="bg-surface text-secondary hover:text-primary border border-outline/20 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all hover:bg-surface-container-low"
                    >
                      <RotateCcw size={16} />
                      العودة لتسجيل الحصص التطبيقية
                    </button>
                  </div>
                </div>

                {/* Structured empty ledger table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-primary/30 text-center">
                    <thead className="bg-primary/5">
                      <tr className="text-primary text-sm font-black uppercase tracking-wider">
                        <th className="border-2 border-primary/30 p-3 w-12 text-center">#</th>
                        <th className="border-2 border-primary/30 p-3 w-48 text-center">الأستاذ(ة) والمادة</th>
                        <th className="border-2 border-primary/30 p-3 w-32 text-center">التوقيت</th>
                        <th className="border-2 border-primary/30 p-3 w-28 text-center">القسم</th>
                        <th className="border-2 border-primary/30 p-3 text-center">النشاط التطبيقي</th>
                        <th className="border-2 border-primary/30 p-3 w-56 text-center">الأدوات والمواد المستعملة</th>
                        <th className="border-2 border-primary/30 p-3 w-36 text-center">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-primary/15 text-xs font-bold text-secondary">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <tr key={num} className="h-11 hover:bg-primary/5 transition-colors">
                          <td className="border-2 border-primary/30 p-2 font-black text-primary/70">{num}</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/30">---</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/30">---</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/30">---</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/60 font-bold">لا توجد حصة تطبيقية مبرمجة</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/30">---</td>
                          <td className="border-2 border-primary/30 p-2 text-primary/30">---</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Main Daily Report Table */
              <>
                <div className="relative z-10 overflow-x-auto">
              <table className="w-full border-collapse border-2 border-primary/30">
                <thead className="bg-primary/5">
                  <tr className="text-primary text-sm font-black uppercase tracking-wider">
                    <th className="border-2 border-primary/30 p-3 w-14 text-center">ترتيب</th>
                    <th className="border-2 border-primary/30 p-3 w-12 text-center">#</th>
                    <th className="border-2 border-primary/30 p-3 w-44 text-center">الأستاذ(ة) والمادة</th>
                    <th className="border-2 border-primary/30 p-3 w-32 text-center">التوقيت</th>
                    <th className="border-2 border-primary/30 p-3 w-28 text-center">القسم</th>
                    <th className="border-2 border-primary/30 p-3 text-center">النشاط التطبيقي</th>
                    <th className="border-2 border-primary/30 p-3 w-56 text-center">الأدوات والمواد المستعملة</th>
                    <th className="border-2 border-primary/30 p-3 w-36 text-center">ملاحظات</th>
                    <th className="border-2 border-primary/30 p-3 w-20 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-primary/15">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-primary/5 transition-colors group">
                      {/* Row ordering buttons */}
                      <td className="border-2 border-primary/30 p-1 text-center">
                        <div className="flex flex-col items-center -space-y-1">
                          <button 
                            onClick={() => moveRow(row.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-primary/40 hover:text-primary disabled:opacity-10 transition-all"
                            title="تحريك للأعلى"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            onClick={() => moveRow(row.id, 'down')}
                            disabled={index === rows.length - 1}
                            className="p-1 text-primary/40 hover:text-primary disabled:opacity-10 transition-all"
                            title="تحريك للأسفل"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </td>

                      {/* Number */}
                      <td className="border-2 border-primary/30 p-3 text-center text-sm font-black text-primary/70">
                        {index + 1}
                      </td>

                      {/* Teacher and Subject */}
                      <td className="border-2 border-primary/30 p-2 relative group/teacher">
                        <div className="flex flex-col items-center gap-1">
                          <select 
                            className="w-full border-none bg-transparent text-center text-sm font-black outline-none focus:bg-surface-container-low rounded-lg py-1 transition-all" 
                            value={row.teacher}
                            onChange={(e) => {
                              const selectedTeacher = teachers.find(t => t.name === e.target.value);
                              setRows(rows.map(r => r.id === row.id ? { 
                                ...r, 
                                teacher: e.target.value,
                                teacherSubject: selectedTeacher?.subject || r.teacherSubject
                              } : r));
                            }}
                          >
                            <option value="">اختر الأستاذ...</option>
                            {teachers
                              .filter(t => {
                                const isTeacher = t.subject && t.subject !== 'غير محدد' && t.subject.trim() !== '';
                                const isNotStaff = !t.rank || (!t.rank.includes('مخبري') && !t.rank.includes('عامل'));
                                return isTeacher && isNotStaff;
                              })
                              .map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                              ))}
                          </select>
                          {row.teacherSubject && (
                            <span className="text-[11px] font-black text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
                              {row.teacherSubject}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Time Slot */}
                      <td className="border-2 border-primary/30 p-2 relative group/time">
                        <input 
                          className="w-full border-none bg-transparent text-center text-sm font-bold outline-none focus:bg-surface-container-low rounded-lg py-1.5 transition-all" 
                          type="text" 
                          list="time-slots"
                          value={row.time}
                          placeholder="08:00 - 09:00"
                          onChange={(e) => updateRow(row.id, 'time', e.target.value)}
                        />
                        <datalist id="time-slots">
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot} />
                          ))}
                        </datalist>
                      </td>

                      {/* Class */}
                      <td className="border-2 border-primary/30 p-2 relative group/class">
                        <input 
                          className="w-full border-none bg-transparent text-center text-sm font-bold outline-none focus:bg-surface-container-low rounded-lg py-1.5 transition-all cursor-pointer" 
                          type="text" 
                          readOnly
                          placeholder="اختر القسم..."
                          value={row.class}
                          onClick={() => setPickerState({ isOpen: true, rowId: row.id })}
                        />
                      </td>

                      {/* Activity Title and Type */}
                      <td className="border-2 border-primary/30 p-2 relative group/activity">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1">
                            <select 
                              className="border-none bg-surface-container-low/40 text-xs font-black outline-none focus:bg-surface-container-low rounded-lg py-1 px-2 transition-all"
                              value={row.activityType}
                              onChange={(e) => updateRow(row.id, 'activityType', e.target.value)}
                            >
                              <option value="عملي">عملي</option>
                              <option value="محاكاة">محاكاة</option>
                              <option value="EXAO">EXAO</option>
                              <option value="افتراضي">افتراضي</option>
                            </select>
                            <input 
                              type="text"
                              className="flex-1 border-none bg-transparent text-start text-sm font-bold outline-none focus:bg-surface-container-low rounded-lg py-1 px-2 transition-all"
                              placeholder="عنوان التجربة أو النشاط..."
                              value={row.activityTitle}
                              onChange={(e) => updateRow(row.id, 'activityTitle', e.target.value)}
                            />
                          </div>

                          {/* Quick launcher from Preset bank for this row */}
                          <div className="flex items-center justify-between pt-0.5">
                            <button
                              onClick={() => {
                                setPresetTargetRowId(row.id);
                                setIsPresetModalOpen(true);
                              }}
                              className="text-[10px] font-bold text-primary/60 hover:text-primary flex items-center gap-1 hover:underline transition-all"
                            >
                              <Sparkles size={11} />
                              اختيار تجربة من المنهاج...
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Equipment and Materials */}
                      <td className="border-2 border-primary/30 p-2">
                        <div className="relative group/resources">
                          <div 
                            onClick={() => setResourcePickerState({ isOpen: true, rowId: row.id })}
                            className={cn(
                              "w-full min-h-[50px] bg-surface-container-low/30 rounded-xl p-2.5 text-start text-xs font-bold cursor-pointer hover:bg-surface-container-low/50 transition-all border border-transparent",
                              !row.equipment && "flex items-center justify-center italic text-secondary/50"
                            )}
                          >
                            {row.equipment ? (
                              <span className="text-primary leading-relaxed">{row.equipment}</span>
                            ) : (
                              "اختر الوسائل والمواد..."
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Row Notes */}
                      <td className="border-2 border-primary/30 p-2">
                        <input 
                          className="w-full border-none bg-transparent text-center text-xs font-bold outline-none focus:bg-surface-container-low rounded-lg py-1.5 transition-all" 
                          type="text" 
                          placeholder="ملاحظات..."
                          value={row.notes}
                          onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                        />
                      </td>

                      {/* Actions (Duplicate, Delete) */}
                      <td className="border-2 border-primary/30 p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => duplicateRow(row.id)}
                            className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
                            title="تكرار هذا السطر"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 text-error/50 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                            title="حذف هذا السطر"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Bottom Action Buttons */}
            <div className="relative z-10 mt-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={addRow}
                  className="flex items-center justify-center gap-2 text-primary font-black text-xs hover:bg-primary/5 px-6 py-3 rounded-2xl transition-all border-2 border-dashed border-primary/25 hover:border-primary/50 flex-1 sm:flex-initial"
                >
                  <Plus size={16} />
                  إضافة سطر جديد للجدول
                </button>
                <button 
                  onClick={() => {
                    setPresetTargetRowId(null);
                    setIsPresetModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 text-primary font-black text-xs bg-primary/10 hover:bg-primary/15 px-5 py-3 rounded-2xl transition-all flex-1 sm:flex-initial shadow-sm"
                >
                  <FlaskConical size={16} />
                  إدراج من بنك التجارب
                </button>
              </div>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-bold text-secondary hover:text-error hover:underline flex items-center gap-1.5 px-3 py-2 transition-all"
              >
                <RotateCcw size={14} />
                إعادة ضبط وإفراغ الجدول
              </button>
            </div>
          </>
        )}

            {/* Observations & Predefined Remarks Section */}
            <div className="relative z-10 mt-12">
              <table className="w-full border-collapse border-2 border-primary/30 rounded-3xl overflow-hidden shadow-sm">
                <thead className="bg-primary/5">
                  <tr className="text-primary text-sm font-black uppercase tracking-wider">
                    <th className="border-2 border-primary/30 p-3.5 w-1/3">ملاحظات {formatOfficialRankTitle(docSigners[0] || docSender || institution?.jobTitle)}</th>
                    <th className="border-2 border-primary/30 p-3.5 w-1/3">
                      ملاحظات الناظر
                    </th>
                    <th className="border-2 border-primary/30 p-3.5 w-1/3">ملاحظات السيد المدير</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* Lab Manager Notes */}
                    <td className="border-2 border-primary/30 p-3 align-top">
                      {/* Predefined chips */}
                      <div className="mb-2 space-y-1">
                        <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                          <MessageSquare size={11} />
                          عبارات مقترحة جاهزة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {LAB_OBSERVATION_PRESETS.labNotes.slice(0, 3).map((preset, idx) => (
                            <button
                              key={idx}
                              onClick={() => appendLabNote(preset)}
                              className="text-[10px] bg-primary/5 hover:bg-primary/15 text-primary/80 font-bold px-2 py-0.5 rounded-md transition-all text-right line-clamp-1 max-w-full"
                              title={preset}
                            >
                              + {preset.substring(0, 35)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea 
                        className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:bg-primary/5 transition-all min-h-[140px] resize-none leading-relaxed border-none"
                        placeholder="اكتب ملاحظات مسؤول المخبر هنا..."
                        value={labNotes}
                        onChange={(e) => setLabNotes(e.target.value)}
                      />
                    </td>

                    {/* Supervisor (الناظر) Notes */}
                    <td className="border-2 border-primary/30 p-3 align-top">
                      {/* Predefined chips */}
                      <div className="mb-2 space-y-1">
                        <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                          <MessageSquare size={11} />
                          عبارات مقترحة للتأشيرة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {LAB_OBSERVATION_PRESETS.supervisorNotes.slice(0, 2).map((preset, idx) => (
                            <button
                              key={idx}
                              onClick={() => appendSupervisorNote(preset)}
                              className="text-[10px] bg-primary/5 hover:bg-primary/15 text-primary/80 font-bold px-2 py-0.5 rounded-md transition-all text-right line-clamp-1 max-w-full"
                              title={preset}
                            >
                              + {preset.substring(0, 35)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea 
                        className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:bg-primary/5 transition-all min-h-[140px] resize-none leading-relaxed border-none"
                        placeholder="ملاحظات وتوجيهات الناظر..."
                        value={supervisorNotes}
                        onChange={(e) => setSupervisorNotes(e.target.value)}
                      />
                    </td>

                    {/* Director (المدير) Notes */}
                    <td className="border-2 border-primary/30 p-3 align-top">
                      {/* Predefined chips */}
                      <div className="mb-2 space-y-1">
                        <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                          <MessageSquare size={11} />
                          عبارات مقترحة للمدير:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {LAB_OBSERVATION_PRESETS.directorNotes.slice(0, 2).map((preset, idx) => (
                            <button
                              key={idx}
                              onClick={() => appendDirectorNote(preset)}
                              className="text-[10px] bg-primary/5 hover:bg-primary/15 text-primary/80 font-bold px-2 py-0.5 rounded-md transition-all text-right line-clamp-1 max-w-full"
                              title={preset}
                            >
                              + {preset.substring(0, 35)}...
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea 
                        className="w-full bg-transparent p-2 text-sm font-bold outline-none focus:bg-primary/5 transition-all min-h-[140px] resize-none leading-relaxed border-none"
                        placeholder="ملاحظات السيد المدير..."
                        value={directorNotes}
                        onChange={(e) => setDirectorNotes(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* صيغة التحرير في أسفل الوثيقة */}
            <div className="relative z-10 flex items-center justify-between text-base font-black text-primary mt-8 px-2 border-t border-primary/10 pt-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary/60" />
                <span>حرر بـ : <strong>{docLocation || 'عين كرشة'}</strong> في : <strong dir="ltr" className="inline-block font-mono tracking-wider">{date}</strong></span>
              </div>
              <span className="text-xs font-bold text-secondary">
                الموافق ليوم: {getDayName(date)}
              </span>
            </div>

            {/* Official Signatures Footer Block (Matches Selected Routing Ladder) */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 text-center">
              {/* Signer 1: Lab Manager */}
              <div className="space-y-6">
                <p className="text-sm font-black text-primary underline underline-offset-8">
                  توقيع {formatOfficialRankTitle(docSigners[0] || docSender || institution?.jobTitle)}
                </p>
                <div 
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="h-24 border-2 border-dashed border-primary/20 rounded-3xl flex items-center justify-center bg-surface-container-low/20 cursor-pointer hover:bg-primary/5 transition-all group overflow-hidden"
                >
                  {signature ? (
                    <img src={signature} alt="Signature" className="h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-primary/30 group-hover:text-primary transition-colors">
                      <PenTool size={20} />
                      <span className="text-[9px] font-black">إدراج التوقيع الرقمي</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signer 2: Middle Authority if Hierarchical (Nazir or CPE) */}
              {docSigners.length > 2 && (
                <div className="space-y-6">
                  <p className="text-sm font-black text-primary underline underline-offset-8">
                    الناظر
                  </p>
                  <div className="h-24 border-2 border-dashed border-primary/15 rounded-3xl flex items-center justify-center">
                    <span className="text-primary/15 font-sans text-2xl italic">Visa & Signature</span>
                  </div>
                </div>
              )}

              {/* Signer 3: School Principal */}
              <div className="space-y-6">
                <p className="text-sm font-black text-primary underline underline-offset-8">
                  توقيع ومصادقة {docSigners[docSigners.length - 1] || 'مدير المؤسسة'}
                </p>
                <div className="h-24 border-2 border-dashed border-primary/15 rounded-3xl flex items-center justify-center">
                  <span className="text-primary/15 font-sans text-2xl italic">Signature & Cachet</span>
                </div>
              </div>
            </div>

            <div className="mt-14 pt-4 border-t border-outline/10 text-center font-sans">
              <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">
                المنصة الرقمية لإدارة مخابر العلوم — الجمهورية الجزائرية الديمقراطية الشعبية
              </p>
            </div>
          </motion.div>
        ) : (
          /* Archive / History Tab */
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Archive Search & Filter Bar */}
            <div className="bg-surface p-6 rounded-3xl border border-outline/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-96">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <input 
                  type="text"
                  placeholder="ابحث بالتاريخ، الأستاذ، القسم، أو النشاط..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-surface-container-low/50 border border-outline/10 rounded-2xl pr-11 pl-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition-all text-primary"
                />
                {historySearch && (
                  <button 
                    onClick={() => setHistorySearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary font-bold"
                  >
                    مسح
                  </button>
                )}
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs font-bold text-secondary flex items-center gap-1">
                  <Filter size={14} />
                  الشهر:
                </label>
                <select
                  value={historyMonthFilter}
                  onChange={(e) => setHistoryMonthFilter(e.target.value)}
                  className="bg-surface-container-low border border-outline/10 rounded-2xl px-4 py-2.5 text-xs font-black text-primary outline-none"
                >
                  <option value="all">كل الأشهر ({history.length} تقرير)</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Archive Content */}
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 size={48} className="text-primary animate-spin" />
                <p className="text-primary font-black">جاري تحميل سجل الأرشيف الإلكتروني...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-surface rounded-[40px] p-20 text-center border border-outline/10 shadow-xl">
                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={40} className="text-primary/30" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">
                  {history.length === 0 ? "لا توجد تقارير مؤرشفة بعد" : "لا توجد نتائج تطابق البحث"}
                </h3>
                <p className="text-secondary font-bold text-sm">
                  {history.length === 0 
                    ? "قم بإنشاء تقرير يومي وحفظه ليوثق تلقائياً في السجل الرقمي الرسمي" 
                    : "جرّب تغيير كلمات البحث أو اختيار شهر آخر"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistory.map((report) => {
                  const teachersInReport = Array.from(new Set(report.rows?.map(r => r.teacher).filter(Boolean)));
                  const classesInReport = Array.from(new Set(report.rows?.map(r => r.class).filter(Boolean)));
                  
                  return (
                    <motion.div
                      key={report.id}
                      whileHover={{ y: -4 }}
                      className="bg-surface rounded-[32px] p-6 border border-outline/10 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150" />

                      <div>
                        {/* Header Badge */}
                        <div className="relative z-10 flex justify-between items-start mb-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <FileCheck size={22} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {report.reportNumber && (
                              <span className="text-[11px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-xl">
                                رقم {report.reportNumber}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-secondary bg-surface-container-low px-2.5 py-1 rounded-xl">
                              {report.dayName || getDayName(report.date)}
                            </span>
                          </div>
                        </div>

                        {/* Title & Date */}
                        <h4 className="text-lg font-black text-primary mb-1">
                          تقرير يوم {report.dayName || getDayName(report.date)}
                        </h4>
                        <p className="text-xs font-bold text-secondary mb-3 flex items-center gap-1.5">
                          <Calendar size={13} />
                          {report.date}
                        </p>

                        {/* Routing Ladder Badge if stored */}
                        {report.recipient && (
                          <p className="text-[11px] font-bold text-primary/70 mb-3 bg-primary/5 p-2 rounded-xl">
                            {report.recipient}
                          </p>
                        )}

                        {/* Summary Badges */}
                        <div className="bg-surface-container-low/50 rounded-2xl p-3.5 space-y-2 mb-4 border border-outline/5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-secondary font-bold">الحصص المسجلة:</span>
                            <span className="font-black text-primary bg-surface px-2 py-0.5 rounded-md border border-outline/10">
                              {report.rows?.length || 0} حصة
                            </span>
                          </div>

                          {teachersInReport.length > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-secondary font-bold">الأساتذة:</span>
                              <span className="font-bold text-primary/80 truncate max-w-[150px]">
                                {teachersInReport.join('، ')}
                              </span>
                            </div>
                          )}

                          {classesInReport.length > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-secondary font-bold">الأقسام:</span>
                              <span className="font-bold text-primary/80 truncate max-w-[150px]">
                                {classesInReport.join('، ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes Preview if available */}
                        {report.labNotes && (
                          <p className="text-[11px] font-bold text-secondary italic line-clamp-2 mb-4">
                            💬 {report.labNotes}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 border-t border-outline/10 mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePreviewHistoryReport(report)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="معاينة PDF"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => printHistoryReport(report)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="طباعة فورية"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleExportHistoryWord(report)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="تصدير Word"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetReportId(report.id)}
                            className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                            title="حذف من الأرشيف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <button 
                          onClick={() => loadReport(report)}
                          className="py-2 px-3.5 bg-primary text-on-primary rounded-xl text-xs font-black hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          تعديل
                          <ChevronLeft size={14} className="rotate-180" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Modal */}
      <AnimatePresence>
        {isSignatureModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSignatureModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface w-full max-w-lg rounded-[36px] overflow-hidden shadow-2xl border border-outline/10"
            >
              <div className="p-6 flex justify-between items-center border-b border-outline/10">
                <h3 className="text-xl font-black text-primary flex items-center gap-2">
                  <PenTool size={22} />
                  اعتماد التوقيع الرقمي للمخبر
                </h3>
                <button onClick={() => setIsSignatureModalOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-xs font-bold text-secondary">
                  قم برسم توقيعك في المساحة أدناه لاعتماده تلقائياً على التقارير اليومية واستخراجها موقعة:
                </p>
                <div className="bg-surface-container-low rounded-2xl border-2 border-outline/15 overflow-hidden touch-none shadow-inner">
                  <canvas
                    ref={signatureCanvasRef}
                    width={450}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full cursor-crosshair bg-white"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={clearSignature}
                    className="flex-1 py-3.5 rounded-2xl border border-outline/20 font-black text-secondary hover:bg-surface-container-high transition-all text-sm"
                  >
                    مسح
                  </button>
                  <button 
                    onClick={saveSignature}
                    className="flex-[2] py-3.5 rounded-2xl bg-primary text-on-primary font-black hover:bg-primary/90 transition-all text-sm shadow-md"
                  >
                    اعتماد التوقيع
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
