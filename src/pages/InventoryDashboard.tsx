import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import {
  FlaskConical,
  Beaker,
  Monitor,
  Package,
  Trash2,
  Database,
  ArrowLeft,
  Sparkles,
  Wrench,
  ShieldCheck,
  RefreshCw,
  Printer,
  Camera,
  X,
  Bot,
  ShieldAlert,
  Calculator,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeLabImage } from '../services/geminiService';

interface InventoryModule {
  title: string;
  desc: string;
  icon: typeof FlaskConical;
  accentClass: string;
  path: string;
}

interface InventorySection {
  id: string;
  title: string;
  subtitle: string;
  modules: InventoryModule[];
}

const INVENTORY_SECTIONS: InventorySection[] = [
  {
    id: 'core-stores',
    title: 'المخازن وسجلات الجرد الأساسية',
    subtitle: 'تتبع المواد الكيميائية، مخزن الزجاجيات، التجهيزات وبطاقات الجرد الدائم',
    modules: [
      {
        title: 'المخزن الكيميائي',
        desc: 'تتبع المحاليل والكواشف، تواريخ الصلاحية، وبطاقات المخزون للمواد الكيميائية.',
        icon: FlaskConical,
        accentClass: 'bg-primary/10 text-primary',
        path: ROUTES.CHEMICALS,
      },
      {
        title: 'مخزن الزجاجيات وبطاقات المخزون',
        desc: 'مخزن مخصص للزجاجيات المخبرية بنماذج قياسية مصورة وطباعة بطاقات المخزون.',
        icon: Beaker,
        accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        path: ROUTES.GLASSWARE_STORE,
      },
      {
        title: 'سجل العتاد والتجهيزات',
        desc: 'قاعدة بيانات شاملة للأجهزة والمعدات المخبرية والتجهيزات البيداغوجية.',
        icon: Monitor,
        accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.EQUIPMENT,
      },
      {
        title: 'سجل بطاقات الجرد',
        desc: 'سجل رسمي لبطاقات الجرد الدائم للأجهزة والتجهيزات (باستثناء الزجاجيات والمواد).',
        icon: Database,
        accentClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.INVENTORY_CARDS,
      },
      {
        title: 'جرد التجهيزات التقنية',
        desc: 'متابعة الأجهزة الحساسة والإلكترونية ومراقبة مواعيد المعايرة الدورية.',
        icon: Monitor,
        accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        path: ROUTES.TECH_INVENTORY,
      },
      {
        title: 'جرد المستهلكات و SDS',
        desc: 'سجل متقدم يربط كل مادة مستهلكة بملف بيانات السلامة الخاص بها.',
        icon: Package,
        accentClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
        path: ROUTES.CONSUMABLES_SDS,
      },
    ],
  },
  {
    id: 'operations-maintenance',
    title: 'المتابعة التشغيلية، الصيانة والكسور',
    subtitle: 'الوقاية الكيميائية، الصيانة، الإعارة بين المخابر ومركز الطباعة والترقيم',
    modules: [
      {
        title: 'سجل الزجاجيات والكسور',
        desc: 'سجل متتابع للزجاجيات المكسورة والمفقودة وحساب القيمة المالية للفواقد.',
        icon: Beaker,
        accentClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        path: ROUTES.GLASSWARE_BREAKAGE,
      },
      {
        title: 'مصفوفة التوافق الكيميائي',
        desc: 'قواعد التخزين الآمن للمواد الكيميائية وتفادي التفاعلات الخطرة في الخزائن.',
        icon: ShieldCheck,
        accentClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
        path: ROUTES.CHEMICAL_STORAGE,
      },
      {
        title: 'الصيانة والمعايرة',
        desc: 'سجلات صيانة الأجهزة المعطلة وطلبات التصليح والمعايرة الدورية.',
        icon: Wrench,
        accentClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
        path: ROUTES.MAINTENANCE,
      },
      {
        title: 'إسقاط وتكهين التجهيزات',
        desc: 'إسقاط وتكهين فني للمعدات التالفة وغير القابلة للإصلاح وفق المحاضر الرسمية.',
        icon: Trash2,
        accentClass: 'bg-error/10 text-error',
        path: ROUTES.SCRAPPING,
      },
      {
        title: 'إعارة الوسائل والأجهزة',
        desc: 'إدارة وتوثيق طلبات الإعارة بين الأقسام والمخابر واسترجاع العتاد.',
        icon: RefreshCw,
        accentClass: 'bg-primary/10 text-primary',
        path: ROUTES.LOAN_REQUEST,
      },
      {
        title: 'مركز الطباعة (QR)',
        desc: 'توليد وطباعة ملصقات QR Code لكافة المواد والأجهزة ورفوف المخزن.',
        icon: Printer,
        accentClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        path: ROUTES.QR_PRINT_CENTER,
      },
    ],
  },
  {
    id: 'procurement-calculators',
    title: 'التموين، الحسابات المخبرية والنفايات',
    subtitle: 'طلبيات التوريد، حسابات المحاليل القياسية، ومعالجة النفايات الكيميائية',
    modules: [
      {
        title: 'الحاسبة المخبرية وتراكيز المحاليل',
        desc: 'حسابات تحضير المحاليل القياسية، التمديد، والكتلة الكيميائية للمخزن.',
        icon: Calculator,
        accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        path: ROUTES.CALCULATORS,
      },
      {
        title: 'الميزانية والطلبيات',
        desc: 'تسيير الميزانية السنوية، نماذج طلبيات الشراء (كواشف، زجاجيات، عتاد) والممونين.',
        icon: Wallet,
        accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.BUDGET_PURCHASES,
      },
      {
        title: 'إدارة النفايات الكيميائية',
        desc: 'نظام للتعامل مع المواد المنتهية وبقايا التفاعلات وفق بروتوكولات التحييد.',
        icon: Trash2,
        accentClass: 'bg-error/10 text-error',
        path: ROUTES.CHEMICAL_WASTE,
      },
    ],
  },
];

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const { currentRole, roleConfig } = useUserRole();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const visibleSections = useMemo(() => {
    return INVENTORY_SECTIONS.map((sec) => ({
      ...sec,
      modules: sec.modules.filter((m) => isRouteAllowedForRole(currentRole, m.path)),
    })).filter((sec) => sec.modules.length > 0);
  }, [currentRole]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = (evt.target?.result as string).split(',')[1];
      try {
        const result = await analyzeLabImage(base64);
        setScanResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 rtl font-sans" dir="rtl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline/10 pb-6">
        <div className="text-start space-y-1.5">
          <p className="text-xs font-bold text-primary/80">إدارة المخزون الشاملة</p>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight text-balance">
            لوحة الجرد والمخازن
          </h1>
          <p className="text-on-surface/75 text-sm sm:text-base font-medium">
            تسيير ومتابعة كافة ممتلكات المخبر المادية، الزجاجيات والكواشف الكيميائية
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Camera size={18} />
            <span>المساعد البصري الذكي</span>
          </button>
          <button
            onClick={() => navigate(roleConfig?.defaultPath || ROUTES.HOME)}
            className="bg-surface-container-lowest text-primary border border-outline/15 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </header>

      {/* Categorized Sections */}
      <div className="space-y-10">
        {visibleSections.map((section) => (
          <section key={section.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-outline/10 pb-2">
              <h2 className="text-lg font-black text-primary">{section.title}</h2>
              <p className="text-xs text-on-surface/65 font-medium">{section.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {section.modules.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <motion.div
                    key={mod.path + mod.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    onClick={() => navigate(mod.path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(mod.path);
                    }}
                    className="bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                            mod.accentClass
                          )}
                        >
                          <Icon size={24} />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-primary mb-1.5 group-hover:text-primary-container transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface/75 leading-relaxed line-clamp-2 font-medium">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-outline/5 flex justify-between items-center text-primary font-bold text-xs">
                      <span>فتح السجل</span>
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Vision Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScannerOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-outline/10 text-right"
              dir="rtl"
            >
              <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Camera size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary">المساعد البصري للوسائل المخبرية</h3>
                    <p className="text-xs font-medium text-on-surface/60">التعرف الذكي على الزجاجيات والأجهزة</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!scanResult && !scanning ? (
                  <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-outline/20 rounded-3xl space-y-5">
                    <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-secondary/40">
                      <Camera size={40} />
                    </div>
                    <div className="text-center space-y-1.5">
                      <h4 className="text-lg font-black text-primary">التقط صورة للوسيلة أو المادة</h4>
                      <p className="text-xs font-medium text-secondary/70 max-w-sm">
                        سيقوم المساعد بالتعرف على الأداة المخبرية وتزويدك بتقرير سريع حول استخدامها وشروط سلامتها.
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                      <div className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
                        <Camera size={18} />
                        <span>التقاط صورة الآن</span>
                      </div>
                    </label>
                  </div>
                ) : scanning ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-primary">
                        <Bot size={32} />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-xl font-black text-primary">جاري تحليل الصورة...</h4>
                      <p className="text-xs font-medium text-secondary/70">يتم مقارنة الصورة مع قاعدة بيانات الوسائل المخبرية.</p>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface shadow-sm flex items-center justify-center text-primary border border-outline/10 shrink-0">
                        <Bot size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-primary">{scanResult.nameAr}</h4>
                        <div className="flex items-center gap-1.5 text-primary/60 font-bold text-xs">
                          <Sparkles size={14} />
                          <span>نتيجة التحليل الذكي</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 space-y-2">
                        <h5 className="flex items-center gap-2 text-primary font-bold text-xs">
                          <Beaker size={16} />
                          <span>الاستخدام البيداغوجي</span>
                        </h5>
                        <p className="text-xs font-medium text-secondary leading-relaxed">{scanResult.primaryUse}</p>
                      </div>
                      <div className="bg-error/5 p-5 rounded-2xl border border-error/15 space-y-2">
                        <h5 className="flex items-center gap-2 text-error font-bold text-xs">
                          <ShieldAlert size={16} />
                          <span>تحذيرات السلامة</span>
                        </h5>
                        <p className="text-xs font-medium text-secondary leading-relaxed">{scanResult.safetyWarnings}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setScanResult(null);
                          setScanning(false);
                        }}
                        className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold text-primary text-sm transition-colors"
                      >
                        مسح وإعادة المحاولة
                      </button>
                      <button
                        onClick={() => {
                          setIsScannerOpen(false);
                          navigate(ROUTES.INVENTORY_CARDS);
                        }}
                        className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                      >
                        فتح بطاقات الجرد
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
