import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { useSystemConfig } from '../context/SystemConfigContext';
import { auth, isProjectOwner } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Settings,
  Database,
  Wallet,
  MessageSquare,
  ArrowLeft,
  Award,
  ExternalLink,
  FileText,
  BarChart3,
  Activity,
  Server,
  Globe,
  Scale,
  Folder,
  Archive,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ManagementModuleItem {
  title: string;
  desc: string;
  icon: typeof Settings;
  color: string;
  path: string;
  external?: boolean;
  adminOnly?: boolean;
}

interface ManagementSection {
  id: string;
  title: string;
  subtitle: string;
  modules: ManagementModuleItem[];
}

const MANAGEMENT_SECTIONS: ManagementSection[] = [
  {
    id: 'admin-docs-reports',
    title: 'الإدارة، الوثائق والتقارير',
    subtitle: 'النماذج الرسمية، التقارير الإحصائية، الميزانية، التشريع والأرشيف',
    modules: [
      {
        title: 'نماذج وثائق إدارية',
        desc: 'نماذج رسمية مقننة قابلة للتعديل والطباعة: طلبات إدارية، تقارير ومحاضر استلام وإتلاف.',
        icon: FileText,
        color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        path: ROUTES.ADMIN_TEMPLATES,
      },
      {
        title: 'التقارير الإحصائية الرسمية',
        desc: 'توليد التقارير الإحصائية الشاملة لنشاط المخبر والمواد والتجهيزات وطباعتها برأسية وزارية.',
        icon: BarChart3,
        color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        path: ROUTES.REPORTS,
      },
      {
        title: 'الميزانية والطلبيات',
        desc: 'تسيير الميزانية السنوية، نماذج طلبيات الشراء المقننة (سجلات، كواشف، زجاجيات) والممونين.',
        icon: Wallet,
        color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.BUDGET_PURCHASES,
      },
      {
        title: 'التشريع المدرسي',
        desc: 'موسوعة النصوص القانونية، القرارات والمناشير الوزارية المنظمة لتسيير المخابر.',
        icon: Scale,
        color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.SCHOOL_LEGISLATION,
      },
      {
        title: 'المكتبة الرقمية',
        desc: 'بنك رقمي للمذكرات، الوثائق التنظيمية، والأدلة المعتمدة في قطاع التربية الوطنية.',
        icon: Folder,
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        path: ROUTES.DOCUMENT_LIBRARY,
      },
      {
        title: 'الأرشيف الرقمي',
        desc: 'أرشيف السجلات التاريخية للتقارير والنشاطات والوثائق عبر المواسم الدراسية.',
        icon: Archive,
        color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300',
        path: ROUTES.ARCHIVE,
      },
    ],
  },
  {
    id: 'system-data-services',
    title: 'النظام، البيانات والخدمات المهنية',
    subtitle: 'إعدادات الحساب والمؤسسة، النسخ الاحتياطي، التشخيص، المسابقات والمنصات الوزارية',
    modules: [
      {
        title: 'الإعدادات الشخصية والمؤسسة',
        desc: 'تعديل بيانات الحساب، كلمات المرور، والمعلومات الرسمية للمستخدم والمؤسسة.',
        icon: Settings,
        color: 'bg-primary/10 text-primary',
        path: ROUTES.SETTINGS,
      },
      {
        title: 'مركز النسخ والبيانات',
        desc: 'إدارة النسخ الاحتياطية السحابية والمحلية، واستعادة البيانات وأرشفة السجلات.',
        icon: Database,
        color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        path: ROUTES.BACKUP_CENTER,
      },
      {
        title: 'إدارة وصيانة قاعدة البيانات',
        desc: 'مراقبة سجلات البيانات، فحص السلامة، وإجراء عمليات الاستيراد والتصدير بتنسيق JSON.',
        icon: Server,
        color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
        path: ROUTES.DATABASE_MANAGEMENT,
      },
      {
        title: 'أداة تشخيص النظام والاتصال',
        desc: 'اختبار الاتصال بقاعدة البيانات، تدقيق التراخيص والصلاحيات، وفحص سرعة الاستجابة.',
        icon: Activity,
        color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
        path: ROUTES.DIAGNOSTIC,
      },
      {
        title: 'نظام التصميم والواجهة',
        desc: 'مرجع الأنماط البصرية، المكونات التفاعلية وهوية العرض المعتمدة في المنصة.',
        icon: Sparkles,
        color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        path: ROUTES.DESIGN_SYSTEM,
      },
      {
        title: 'الإمتحانات المهنية',
        desc: 'متابعة الامتحانات والاختبارات المهنية للترقية، ومستجدات المسابقات لموظفي المخابر.',
        icon: Award,
        color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        path: ROUTES.PROFESSIONAL_EXAMS,
      },
      {
        title: 'فضاء الموظف (وزارة التربية)',
        desc: 'المنصة الرقمية الرسمية لموظفي قطاع التربية الوطنية لمتابعة الوضعية الإدارية والمالية.',
        icon: Globe,
        color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        path: 'https://mowadaf.education.dz/',
        external: true,
      },
      {
        title: 'موارد وروابط هامة',
        desc: 'دليل المنصات والمواقع الرسمية التابعة لوزارة التربية الوطنية ورقمنة القطاع.',
        icon: ExternalLink,
        color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
        path: ROUTES.IMPORTANT_LINKS,
      },
      {
        title: 'الدعم والاقتراحات',
        desc: 'التواصل لتقديم اقتراح أو الإبلاغ عن مشكلة فنية والمساهمة في تحسين المنصة.',
        icon: MessageSquare,
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        path: ROUTES.SUPPORT,
      },
      {
        title: 'لوحة الإدارة المركزية',
        desc: 'التحكم الشامل في المستخدمين، الصلاحيات المتقدمة، وسجلات النظام الكاملة.',
        icon: ShieldCheck,
        color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        path: ROUTES.ADMIN,
        adminOnly: true,
      },
    ],
  },
];

export default function ManagementDashboard() {
  const navigate = useNavigate();
  const { currentRole, roleConfig } = useUserRole();
  const { isRouteEffectivelyAllowed } = useSystemConfig();
  const [isOwner, setIsOwner] = useState<boolean>(() => isProjectOwner(auth.currentUser));

  useEffect(() => {
    setIsOwner(isProjectOwner(auth.currentUser));
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsOwner(isProjectOwner(user));
    });
    return () => unsub();
  }, []);

  const visibleSections = useMemo(() => {
    return MANAGEMENT_SECTIONS.map((sec) => ({
      ...sec,
      modules: sec.modules.filter((mod) => {
        if (mod.adminOnly) return isOwner;
        if (mod.external) return true;
        return isRouteEffectivelyAllowed(currentRole, mod.path, isOwner);
      }),
    })).filter((sec) => sec.modules.length > 0);
  }, [currentRole, isOwner, isRouteEffectivelyAllowed]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 rtl font-sans" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline/10 pb-6">
        <div className="text-start space-y-1.5">
          <p className="text-xs font-bold text-primary/80">التسيير الإداري والنظام</p>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight text-balance">
            الإدارة والإعدادات
          </h1>
          <p className="text-on-surface/75 text-sm sm:text-base font-medium">
            إعدادات النظام، النماذج الإدارية، الميزانية، التشريع ومركز البيانات والتشخيص
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
                const innerContent = (
                  <>
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                            mod.color
                          )}
                        >
                          <Icon size={24} />
                        </div>
                        {mod.external && (
                          <ExternalLink size={16} className="text-on-surface/40 group-hover:text-primary transition-colors" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-primary mb-1.5 group-hover:text-primary-container transition-colors flex items-center gap-2">
                        <span>{mod.title}</span>
                      </h3>

                      <p className="text-xs sm:text-sm text-on-surface/75 leading-relaxed line-clamp-2 font-medium">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-outline/5 flex justify-between items-center text-primary font-bold text-xs">
                      <span>{mod.external ? 'فتح المنصة الخارجية' : 'فتح القسم'}</span>
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        {mod.external ? (
                          <ExternalLink size={15} />
                        ) : (
                          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  </>
                );

                return mod.external ? (
                  <motion.a
                    key={mod.path + mod.title}
                    href={mod.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                  >
                    {innerContent}
                  </motion.a>
                ) : (
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
                    {innerContent}
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
