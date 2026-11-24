import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import {
  Calendar,
  Clock,
  Map,
  BookOpen,
  RefreshCw,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Users,
  Calculator,
  FileText,
  FlaskConical,
  FileSpreadsheet,
  Bot,
  Folder,
  Scale,
  Archive,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PedagogicalModule {
  title: string;
  desc: string;
  icon: typeof FileText;
  accentClass: string;
  path: string;
}

interface PedagogicalSection {
  id: string;
  title: string;
  subtitle: string;
  modules: PedagogicalModule[];
}

const PEDAGOGICAL_SECTIONS: PedagogicalSection[] = [
  {
    id: 'coordination-experiments',
    title: 'التنسيق، التقارير والتجارب',
    subtitle: 'متابعة النشاط اليومي، طلبات التحضير، سجل التجارب والنماذج البيداغوجية',
    modules: [
      {
        title: 'التقارير اليومية',
        desc: 'تسجيل ومتابعة النشاطات اليومية للمخبر والحصص التطبيقية والتأشيرات.',
        icon: FileText,
        accentClass: 'bg-primary/10 text-primary',
        path: ROUTES.DAILY_REPORT,
      },
      {
        title: 'سجل التجارب المخبرية',
        desc: 'بنك شامل لبروتوكولات التجارب المقررة لمادتي العلوم الفيزيائية والطبيعية.',
        icon: FlaskConical,
        accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.LAB_EXPERIMENTS,
      },
      {
        title: 'طلب نشاط تطبيقي',
        desc: 'تقديم ومتابعة طلبات التجارب والنشاطات العلمية وتحضير الوسائل اللازمة.',
        icon: PlusCircle,
        accentClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        path: ROUTES.ACTIVITY_REQUEST,
      },
      {
        title: 'سجل المتابعة',
        desc: 'سجل رقمي متكامل يضم استعمال الوسائل، الكواشف وحصيلة الأعمال التطبيقية.',
        icon: BookOpen,
        accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        path: ROUTES.FOLLOW_UP_REGISTRY,
      },
      {
        title: 'المتابعة البيداغوجية',
        desc: 'متابعة تنفيذ البرامج الدراسية والدروس التطبيقية المنجزة حسب كل مستوى.',
        icon: GraduationCap,
        accentClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.PEDAGOGICAL_TRACKING,
      },
      {
        title: 'التحضير الذكي للنماذج',
        desc: 'توليد النماذج والبطاقات التقنية الرقمية باستخدام المساعد الذكي.',
        icon: Sparkles,
        accentClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        path: ROUTES.SMART_FORMS,
      },
    ],
  },
  {
    id: 'schedules-team',
    title: 'الجداول الزمنية والفريق التربوي',
    subtitle: 'توزيع المخابر، إسناد الحصص، الأفواج التربوية والخريطة المدرسية',
    modules: [
      {
        title: 'حصص المخبر',
        desc: 'جدولة استخدام المخابر وتفادي التضارب بين الأفواج التربوية.',
        icon: Clock,
        accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        path: ROUTES.LAB_SCHEDULE,
      },
      {
        title: 'جدولة الحصص',
        desc: 'تسيير الجدول الزمني الأسبوعي للمؤسسة وتوزيع الفترات الدراسية.',
        icon: Calendar,
        accentClass: 'bg-primary/10 text-primary',
        path: ROUTES.TIMETABLE,
      },
      {
        title: 'مزامنة الحصص',
        desc: 'ربط التحضير المخبري بجدول الحصص الفعلي لضمان جاهزية الوسائل.',
        icon: RefreshCw,
        accentClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
        path: ROUTES.SYNC,
      },
      {
        title: 'فريق الأساتذة',
        desc: 'قائمة أساتذة العلوم والفيزياء والأطوار المسندة للفريق التربوي.',
        icon: Users,
        accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        path: ROUTES.TEACHERS,
      },
      {
        title: 'تسيير الأفواج',
        desc: 'إدارة وتنظيم أفواج التلاميذ ضمن الأقسام والمخابر التعليمية.',
        icon: Users,
        accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.STUDENT_GROUPS,
      },
      {
        title: 'إدارة الخريطة التربوية',
        desc: 'توزيع التلاميذ والأقسام على القاعات والمخابر المتاحة بالمؤسسة.',
        icon: Map,
        accentClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.EDUCATIONAL_MAP,
      },
    ],
  },
  {
    id: 'assistants-references',
    title: 'المساعدة، المراجع والأرشيف',
    subtitle: 'الأدوات الذكية، المذكرات البيداغوجية، النصوص القانونية والأرشيف السنوي',
    modules: [
      {
        title: 'المساعد المخبري الذكي',
        desc: 'مساعد ذكي لتحضير التجارب وتقديم إرشادات تحضير المحاليل والسلامة.',
        icon: Bot,
        accentClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.LAB_ASSISTANT,
      },
      {
        title: 'مولد أوراق العمل',
        desc: 'توليد أوراق عمل وتمارين تطبيقية قابلة للطباعة لترسيخ المفاهيم.',
        icon: FileSpreadsheet,
        accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        path: ROUTES.WORKSHEET_GENERATOR,
      },
      {
        title: 'الحاسبة المخبرية',
        desc: 'أدوات وحسابات سريعة لتحضير المحاليل وإدارة التراكيز المولية والكتلية.',
        icon: Calculator,
        accentClass: 'bg-primary/10 text-primary',
        path: ROUTES.CALCULATORS,
      },
      {
        title: 'المكتبة الرقمية',
        desc: 'بنك رقمي للمذكرات، الوثائق البيداغوجية، والأدلة التعليمية المعتمدة.',
        icon: Folder,
        accentClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        path: ROUTES.DOCUMENT_LIBRARY,
      },
      {
        title: 'التشريع المدرسي',
        desc: 'موسوعة النصوص القانونية، القرارات والمناشير الوزارية المنظمة لتسيير المخابر.',
        icon: Scale,
        accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.SCHOOL_LEGISLATION,
      },
      {
        title: 'الأرشيف الرقمي',
        desc: 'أرشيف السجلات التاريخية للتقارير والنشاطات المنفذة عبر المواسم الدراسية.',
        icon: Archive,
        accentClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300',
        path: ROUTES.ARCHIVE,
      },
    ],
  },
];

export default function PedagogicalDashboard() {
  const navigate = useNavigate();
  const { currentRole, roleConfig } = useUserRole();

  const visibleSections = useMemo(() => {
    return PEDAGOGICAL_SECTIONS.map((sec) => ({
      ...sec,
      modules: sec.modules.filter((m) => isRouteAllowedForRole(currentRole, m.path)),
    })).filter((sec) => sec.modules.length > 0);
  }, [currentRole]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 rtl font-sans" dir="rtl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline/10 pb-6">
        <div className="text-start space-y-1.5">
          <p className="text-xs font-bold text-primary/80">الفضاء البيداغوجي الرقمي</p>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight text-balance">
            اللوحة البيداغوجية والتنسيق
          </h1>
          <p className="text-on-surface/75 text-sm sm:text-base font-medium">
            تسيير الجداول الزمنية، النشاطات العلمية، الفريق التربوي والمراجع الرسمية
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

      {/* Sections */}
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
                      <span>فتح القسم</span>
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
    </div>
  );
}
