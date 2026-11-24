import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import {
  ShieldAlert,
  Trash2,
  ArrowLeft,
  LifeBuoy,
  ShieldCheck,
  Package,
  Beaker,
  Wrench,
  Scale,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const safetyModules = [
  {
    title: 'الأمن والسلامة وسجل الحوادث',
    desc: 'متابعة سجل الحوادث، المعدات الوقائية، مطافئ الحريق، والإسعافات الأولية.',
    icon: ShieldAlert,
    color: 'bg-error/10 text-error',
    path: ROUTES.SAFETY,
  },
  {
    title: 'دليل السلامة الشامل',
    desc: 'دليل مرجعي شامل لقواعد السلوك الآمن وبروتوكولات الطوارئ المخبرية.',
    icon: LifeBuoy,
    color: 'bg-primary/10 text-primary',
    path: ROUTES.SAFETY_GUIDE,
  },
  {
    title: 'التشريع المدرسي وتنظيمات الوقاية',
    desc: 'النصوص القانونية والقرارات الوزارية المؤطرة للأمن المخبري والوقاية من الأخطار.',
    icon: Scale,
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    path: ROUTES.SCHOOL_LEGISLATION,
  },
  {
    title: 'مصفوفة التوافق الكيميائي',
    desc: 'قواعد التخزين الآمن للمواد الكيميائية وتفادي التفاعلات الخطرة والانفجارات.',
    icon: ShieldCheck,
    color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    path: ROUTES.CHEMICAL_STORAGE,
  },
  {
    title: 'إدارة وتصريف النفايات الكيميائية',
    desc: 'نظام آمن لمعالجة وتحييد المواد المنتهية والمخلفات السامة بيئياً.',
    icon: Trash2,
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    path: ROUTES.CHEMICAL_WASTE,
  },
  {
    title: 'بطاقات بيانات السلامة (SDS)',
    desc: 'سجل بطاقات السلامة لجميع المواد الكيميائية والمستهلكات وإرشادات الخطورة.',
    icon: Package,
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    path: ROUTES.CONSUMABLES_SDS,
  },
  {
    title: 'سجل الزجاجيات والكسور',
    desc: 'متابعة الكسور والتلفيات أثناء الحصص وتفادي مخاطر الإصابات والشظايا.',
    icon: Beaker,
    color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    path: ROUTES.GLASSWARE_BREAKAGE,
  },
  {
    title: 'الصيانة والمعايرة الوقائية',
    desc: 'الفحص الدوري لعزل الأجهزة، التوصيلات الكهربائية ومعايرة الحساسات لتفادي الحوادث.',
    icon: Wrench,
    color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    path: ROUTES.MAINTENANCE,
  },
  {
    title: 'إسقاط وتكهين المعدات التالفة',
    desc: 'إسقاط فني رسمي للوسائل المتضررة أو غير الآمنة للاستخدام لتفادي الخطر في المخابر.',
    icon: Trash2,
    color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300',
    path: ROUTES.SCRAPPING,
  },
];

export default function SafetyDashboard() {
  const navigate = useNavigate();
  const { currentRole, roleConfig } = useUserRole();

  const visibleModules = useMemo(
    () => safetyModules.filter((mod) => isRouteAllowedForRole(currentRole, mod.path)),
    [currentRole]
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 rtl font-sans" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline/10 pb-6">
        <div className="text-start space-y-1.5">
          <p className="text-xs font-bold text-primary/80">الوقاية والحماية المخبرية</p>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight text-balance">
            فضاء الأمن والسلامة
          </h1>
          <p className="text-on-surface/75 text-sm sm:text-base font-medium">
            إدارة أمن وحماية العاملين، التلاميذ، المواد الكيميائية والوسائل العلمية
          </p>
        </div>

        <button
          onClick={() => navigate(roleConfig?.defaultPath || ROUTES.HOME)}
          className="bg-surface-container-lowest text-primary border border-outline/15 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>العودة للرئيسية</span>
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleModules.map((mod, i) => {
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
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105',
                    mod.color
                  )}
                >
                  <Icon size={24} />
                </div>

                <h3 className="text-lg font-bold text-primary mb-1.5 group-hover:text-primary-container transition-colors">
                  {mod.title}
                </h3>

                <p className="text-xs sm:text-sm text-on-surface/75 leading-relaxed line-clamp-2 font-medium">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-outline/5 flex justify-between items-center text-primary font-bold text-xs">
                <span>فتح الوحدة</span>
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
