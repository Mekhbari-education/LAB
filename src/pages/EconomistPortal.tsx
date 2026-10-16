import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useUserRole } from '../context/UserRoleContext';
import { onSnapshot, query, updateDoc, doc, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, getUserCollection, auth } from '../firebase';
import { 
  Wallet, 
  Package, 
  FileCheck, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Printer, 
  FileText, 
  Trash2, 
  ArrowLeft, 
  Building2, 
  Sparkles, 
  Calendar, 
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export default function EconomistPortal() {
  const { schoolId, schoolName, directorate, commune } = useSchool();
  const { setRole } = useUserRole();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'budget' | 'inventory' | 'consumables' | 'scrapping' | 'templates'>('budget');
  
  // Data states
  const [purchases, setPurchases] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [consumablesList, setConsumablesList] = useState<any[]>([]);
  const [scrappingRecords, setScrappingRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal for new purchase requisition
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newCategory, setNewCategory] = useState('كواشف ومستهلكات مخبرية');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    try {
      if (auth.currentUser) {
        // Purchases / Budget items
        const unsubPurchases = onSnapshot(getUserCollection(schoolId, 'budget_purchases'), (snap) => {
          setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        // Equipment for permanent inventory
        const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
          setEquipmentList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        // Consumables
        const unsubConsumables = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
          setConsumablesList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        // Scrapping
        const unsubScrapping = onSnapshot(getUserCollection(schoolId, 'equipment_scrapping'), (snap) => {
          setScrappingRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, () => {});

        return () => {
          unsubPurchases();
          unsubEquip();
          unsubConsumables();
          unsubScrapping();
        };
      }
    } catch (e) {
      console.warn('Realtime listener fallback in EconomistPortal', e);
    }
  }, [schoolId]);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    setIsSubmitting(true);
    try {
      await addDoc(getUserCollection(schoolId, 'budget_purchases'), {
        title: newTitle.trim(),
        amount: Number(newAmount),
        supplier: newSupplier.trim() || 'الممون المعتمد',
        category: newCategory,
        notes: newNotes.trim(),
        status: 'معتمد مالياً',
        date: new Date().toISOString().split('T')[0],
        fiscalYear: new Date().getFullYear(),
        createdAt: serverTimestamp()
      });

      setNotification({ message: 'تم تدوين سند الطلبية والاعتماد المالي بنجاح', type: 'success' });
      setIsNewPurchaseModalOpen(false);
      setNewTitle('');
      setNewAmount('');
      setNewSupplier('');
      setNewNotes('');
    } catch (err: any) {
      console.error('Failed to create purchase requisition:', err);
      setNotification({ message: 'تعذر حفظ السجل المالي.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const totalBudgetSpent = purchases.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalEquipCount = equipmentList.reduce((acc, eq) => acc + (Number(eq.totalQuantity) || 1), 0);
  const totalPendingScraps = scrappingRecords.filter(s => s.status !== 'approved').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 pb-24 font-sans" dir="rtl">
      <Helmet>
        <title>فضاء المقتصد والمسير المالي | الأرضية الرقمية للمخابر المدرسية</title>
      </Helmet>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-xs font-bold",
              notification.type === 'success' 
                ? "bg-purple-900 text-purple-100 border-purple-700" 
                : "bg-error text-white border-red-700"
            )}
          >
            <Sparkles size={16} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Top Header ──────────────────────────────────────────────── */}
      <header className="pt-2 pb-6 border-b border-outline/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>المصالح الاقتصادية والمادية</span>
            <span>·</span>
            <span>{schoolName || 'المؤسسة التعليمية'}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">السنة المالية: {new Date().getFullYear()}</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            فضاء المقتصد والمسير المالي والمادي
          </h1>
          <p className="text-sm font-medium text-on-surface/70">
            متابعة الميزانية التشغيلية، اعتمادات طلبيات المخابر، سجلات بطاقات الجرد العام، والتكهين.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewPurchaseModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>إضافة سند طلبية مخبرية</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-primary text-xs font-bold border border-outline/10 hover:bg-surface-container transition-colors"
          >
            <Printer size={16} />
            <span>طباعة الموقف المالي</span>
          </button>
        </div>
      </header>

      {/* ── 2. Financial & Material KPIs ─────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Coins size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
              المصاريف الملتزم بها
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums">
              {totalBudgetSpent.toLocaleString('fr-DZ')} <span className="text-xs font-sans text-on-surface/60">دج</span>
            </div>
            <p className="text-xs text-on-surface/60 font-medium mt-1">إجمالي طلبيات التجهيزات والمستهلكات</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
              الجرد الدائم
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums">
              {totalEquipCount} <span className="text-xs font-sans text-on-surface/60">عتاد مسجل</span>
            </div>
            <p className="text-xs text-on-surface/60 font-medium mt-1">تجهيزات مخبرية عامة ودائمة</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              المستهلكات
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums">
              {consumablesList.length} <span className="text-xs font-sans text-on-surface/60">مادة</span>
            </div>
            <p className="text-xs text-on-surface/60 font-medium mt-1">كواشف، زجاجيات، ومواد دورية</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              ملفات التكهين
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-primary font-mono tabular-nums">
              {totalPendingScraps} <span className="text-xs font-sans text-on-surface/60">ملف قيد الإسقاط</span>
            </div>
            <p className="text-xs text-on-surface/60 font-medium mt-1">عتاد تالف بانتظار مصادقة اللجنة</p>
          </div>
        </div>
      </section>

      {/* ── 3. Tabs Navigation ─────────────────────────────────────────── */}
      <div className="border-b border-outline/10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('budget')}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'budget' 
                ? "border-purple-600 text-purple-700 dark:text-purple-300" 
                : "border-transparent text-on-surface/60 hover:text-primary"
            )}
          >
            <Wallet size={16} />
            <span>الميزانية والطلبيات ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'inventory' 
                ? "border-purple-600 text-purple-700 dark:text-purple-300" 
                : "border-transparent text-on-surface/60 hover:text-primary"
            )}
          >
            <Layers size={16} />
            <span>بطاقات الجرد العام والدائم</span>
          </button>

          <button
            onClick={() => setActiveTab('consumables')}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'consumables' 
                ? "border-purple-600 text-purple-700 dark:text-purple-300" 
                : "border-transparent text-on-surface/60 hover:text-primary"
            )}
          >
            <Package size={16} />
            <span>مشتريات المستهلكات و SDS</span>
          </button>

          <button
            onClick={() => setActiveTab('scrapping')}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'scrapping' 
                ? "border-purple-600 text-purple-700 dark:text-purple-300" 
                : "border-transparent text-on-surface/60 hover:text-primary"
            )}
          >
            <Trash2 size={16} />
            <span>محاضر الإسقاط والتكهين</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === 'templates' 
                ? "border-purple-600 text-purple-700 dark:text-purple-300" 
                : "border-transparent text-on-surface/60 hover:text-primary"
            )}
          >
            <FileText size={16} />
            <span>النماذج الإدارية والمحاضر المالية</span>
          </button>
        </div>
      </div>

      {/* ── 4. Tab Content ────────────────────────────────────────────── */}
      <section className="space-y-4">
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-primary">سجل سندات الطلب والالتزامات المالية للمخابر</h3>
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.BUDGET_PURCHASES}
                  className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                >
                  <span>فتح وحدة الميزانية التفاعلية</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline/10 space-y-3">
                <Wallet size={36} className="mx-auto text-on-surface/30" />
                <h4 className="text-sm font-bold text-primary">لا توجد طلبيات مسجلة حتى الآن</h4>
                <p className="text-xs text-on-surface/60 max-w-sm mx-auto">
                  يمكنك تدوين سندات الطلب واحتياجات المخابر لاعتمادها وربطها بالميزانية التشغيلية.
                </p>
                <button
                  onClick={() => setIsNewPurchaseModalOpen(true)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold"
                >
                  إضافة سند طلبية جديد
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-outline/10 bg-surface-container-lowest">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-low text-on-surface/70 border-b border-outline/10">
                    <tr>
                      <th className="py-3 px-4 font-bold">موضوع الطلبية / السند</th>
                      <th className="py-3 px-4 font-bold">الصنف</th>
                      <th className="py-3 px-4 font-bold">الممون المعتمد</th>
                      <th className="py-3 px-4 font-bold">المبلغ (دج)</th>
                      <th className="py-3 px-4 font-bold">التاريخ</th>
                      <th className="py-3 px-4 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/5 font-medium">
                    {purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-primary">{p.title}</td>
                        <td className="py-3 px-4 text-on-surface/70">{p.category || 'مستهلكات مخبرية'}</td>
                        <td className="py-3 px-4 text-on-surface/70">{p.supplier || 'الممون'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-700 dark:text-purple-300">
                          {Number(p.amount || 0).toLocaleString('fr-DZ')} دج
                        </td>
                        <td className="py-3 px-4 font-mono text-on-surface/60">{p.date || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {p.status || 'معتمد'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">سجل بطاقات الجرد العام والتجهيزات المادية</h3>
              <Link
                to={ROUTES.INVENTORY_CARDS}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>فتح سجل بطاقات الجرد الرقمي</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                onClick={() => navigate(ROUTES.INVENTORY_CARDS)}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <FileSpreadsheet size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-primary mb-1">سجل بطاقات الجرد الرسمي</h4>
                <p className="text-xs text-on-surface/70">
                  إدارة الأرقام التسلسلية، الترقيم الدائم، وتوزيع البطاقات وفق المنشور الوزاري.
                </p>
              </div>

              <div 
                onClick={() => navigate(ROUTES.TECH_INVENTORY)}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <Layers size={24} className="text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-primary mb-1">جرد التجهيزات التقنية والمكتبية</h4>
                <p className="text-xs text-on-surface/70">
                  أجهزة العرض، الحواسيب المخبرية، مجسات EXAO، والمعدات الإلكترونية.
                </p>
              </div>

              <div 
                onClick={() => navigate(ROUTES.EQUIPMENT)}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <Package size={24} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-primary mb-1">سجل التجهيزات والأدوات المخبرية</h4>
                <p className="text-xs text-on-surface/70">
                  معاينة إجمالي عتاد الفيزياء، الكيمياء، وعلوم الحياة والتوزيع في القاعات.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consumables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">المستهلكات، الكواشف الكيميائية، وبطاقات السلامة</h3>
              <Link
                to={ROUTES.CONSUMABLES_SDS}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>مركز جرد المستهلكات و SDS</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">طلبيات وتوريدات المواد المستهلكة السنوية</h4>
                <p className="text-xs text-on-surface/70 max-w-xl">
                  تتيح متابعة الكميات المتبقية من الكواشف والمستهلكات الزجاجية لبرمجة طلبيات الاستدراك وتفادي العجز في الحصص التطبيقية.
                </p>
              </div>
              <button
                onClick={() => navigate(ROUTES.CONSUMABLES_SDS)}
                className="px-4 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors whitespace-nowrap"
              >
                عرض سجل المستهلكات
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scrapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">إسقاط وتكهين التجهيزات والعتاد التالف</h3>
              <Link
                to={ROUTES.SCRAPPING}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>سجل الإسقاط والتكهين الكامل</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">محاضر لجنة إسقاط العتاد غير القابل للإصلاح</h4>
                <p className="text-xs text-on-surface/70 max-w-xl">
                  تفريغ التجهيزات من سجل الجرد الدائم بعد مصادقة لجنة المؤسسة ورفع التقرير لمديرية التربية.
                </p>
              </div>
              <button
                onClick={() => navigate(ROUTES.SCRAPPING)}
                className="px-4 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors whitespace-nowrap"
              >
                معاينة ملفات التكهين
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">النماذج الرسمية للمصالح الاقتصادية والمخابر</h3>
              <Link
                to={ROUTES.ADMIN_TEMPLATES}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>المكتبة الكاملة للنماذج الإدارية</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'سند طلبية مواد مخبرية (Bon de Commande)', desc: 'سند موجه للممونين المعتمدين لتوريد عتاد أو كواشف.' },
                { title: 'وصل استلام ومطابقة التجهيزات', desc: 'محضر إثبات الاستلام ومطابقة المواصفات التقنية.' },
                { title: 'محضر جرد عتاد المخابر السنوي', desc: 'استمارة تدقيق الرصيد المادي وإحصاء الفروقات.' },
                { title: 'محضر إسقاط وتكهين عتاد تالف', desc: 'النموذج الرسمي المعتمد لإسقاط الأجهزة من الجرد.' },
                { title: 'بطاقة متابعة استهلاك الزجاجيات والكواشف', desc: 'متابعة حركة المواد المستهلكة خلال الفصل الدراسي.' },
                { title: 'التقارير الإحصائية ومؤشرات الميزانية', desc: 'ملخص المصاريف الموجهة للتجهيزات البيداغوجية.' },
              ].map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(ROUTES.ADMIN_TEMPLATES)}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline/10 hover:border-purple-500/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <FileText size={18} className="text-purple-600 mb-1.5" />
                    <h5 className="text-xs font-bold text-primary mb-1">{tmpl.title}</h5>
                    <p className="text-[11px] text-on-surface/60">{tmpl.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 mt-3 flex items-center gap-1">
                    <span>فتح النموذج للطباعة</span>
                    <ArrowLeft size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Modal: New Purchase Requisition ─────────────────────────────── */}
      <AnimatePresence>
        {isNewPurchaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-outline/10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline/10">
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-purple-700 dark:text-purple-300" />
                  <h3 className="text-base font-bold text-primary">إضافة سند طلبية مخبرية جديدة</h3>
                </div>
                <button
                  onClick={() => setIsNewPurchaseModalOpen(false)}
                  className="text-on-surface/40 hover:text-on-surface"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePurchase} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface/80">موضوع الطلبية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: اقتناء كواشف كيميائية لفصل الربيع"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-purple-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface/80">المبلغ التقديري (دج)</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 45000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-mono font-medium focus:border-purple-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface/80">الممون المعتمد</label>
                    <input
                      type="text"
                      placeholder="اسم المؤسسة الموردة"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-purple-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface/80">صنف الطلبية</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-purple-600 outline-none"
                  >
                    <option value="كواشف ومستهلكات مخبرية">كواشف ومستهلكات مخبرية</option>
                    <option value="أجهزة وتجهيزات تقنية">أجهزة وتجهيزات تقنية</option>
                    <option value="زجاجيات مخبرية">زجاجيات مخبرية</option>
                    <option value="معدات السلامة والوقاية">معدات السلامة والوقاية</option>
                    <option value="صيانة وقطع غيار">صيانة وقطع غيار</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface/80">ملاحظات أو مراجع إدارية</label>
                  <textarea
                    rows={2}
                    placeholder="رقم الفاتورة الشكلية، الباب المالي..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-outline/15 bg-surface text-xs font-medium focus:border-purple-600 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPurchaseModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-outline/15 text-xs font-bold hover:bg-surface-container"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'اعتماد وحفظ السند'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
