import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Map,
  Atom,
  Beaker,
  FileSpreadsheet,
  Box,
  FlaskConical,
  Activity,
  Microscope,
  Telescope,
  Calculator,
  Dna,
  Zap,
  Globe,
  Heart,
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ScientificCard {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof Atom;
  accentClass: string;
  actionText: string;
  path: string;
}

interface ScientificSection {
  id: string;
  title: string;
  subtitle: string;
  cards: ScientificCard[];
}

const SCIENTIFIC_SECTIONS: ScientificSection[] = [
  {
    id: 'chemistry-virtual-lab',
    title: 'الكيمياء والمخبر الافتراضي',
    subtitle: 'الجدول الدوري، التمثيل ثلاثي الأبعاد للذرات والجزيئات، وأدوات التحضير المخبري',
    cards: [
      {
        id: 'periodic-table',
        title: 'الجدول الدوري التفاعلي',
        subtitle: '118 عنصراً كيميائياً',
        desc: 'جدول دوري تفاعلي شامل يضم تصنيفات العناصر وخواصها الفيزيائية والكيميائية.',
        icon: Box,
        accentClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        actionText: 'بدء الاستكشاف',
        path: ROUTES.PERIODIC_TABLE,
      },
      {
        id: 'atom-3d',
        title: 'مجسمات الذرات 3D',
        subtitle: 'نماذج ثلاثية الأبعاد',
        desc: 'نماذج ذرات تفاعلية توضح المدارات وتوزع الإلكترونات بشكل بصري دقيق.',
        icon: Atom,
        accentClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        actionText: 'عرض النماذج',
        path: ROUTES.ATOM_3D,
      },
      {
        id: 'molecular-viewer',
        title: 'عارض الجزيئات 3D',
        subtitle: 'الكيمياء العضوية والروابط',
        desc: 'بناء وعرض الجزيئات الكيميائية المعقدة ثلاثية الأبعاد لفهم البنية الفراغية.',
        icon: Dna,
        accentClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        actionText: 'عرض الجزيئات',
        path: ROUTES.MOLECULAR_VIEWER,
      },
      {
        id: 'tools',
        title: 'أدوات الكيمياء',
        subtitle: 'موازن · كتلة مولية · ذوبان',
        desc: 'مجموعة أدوات تشمل موازن المعادلات الكيميائية، حاسبة الكتلة المولية وجداول الذوبان.',
        icon: Beaker,
        accentClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        actionText: 'فتح الأدوات',
        path: ROUTES.CHEMISTRY_TOOLS,
      },
      {
        id: 'virtual-lab',
        title: 'المخبر الافتراضي',
        subtitle: 'محاكاة التجارب التفاعلية',
        desc: 'بيئة افتراضية لإجراء التجارب الكيميائية ومحاكاة التفاعلات بأمان تام.',
        icon: FlaskConical,
        accentClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        actionText: 'دخول المخبر',
        path: ROUTES.VIRTUAL_LAB,
      },
      {
        id: 'lab-calculators',
        title: 'الحاسبة المخبرية والكواشف',
        subtitle: 'تراكيز · تمديد · محاليل',
        desc: 'حسابات دقيقة لتحضير المحاليل القياسية والتمديد وتحويل التراكيز المولية والكتلية.',
        icon: Calculator,
        accentClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        actionText: 'فتح الحاسبة',
        path: ROUTES.CALCULATORS,
      },
    ],
  },
  {
    id: 'physics-biology-earth',
    title: 'الفيزياء، علوم الطبيعة والجيولوجيا',
    subtitle: 'المحاكاة الفيزيائية، التجريب بالحاسوب، الفحص المجهري، التشريح والفلك',
    cards: [
      {
        id: 'physics-sim',
        title: 'محاكاة فيزيائية',
        subtitle: 'الميكانيك · الكهرباء · البصريات',
        desc: 'تجارب فيزيائية تفاعلية لفهم قوانين الحركة، الدارات الكهربائية والظواهر الضوئية.',
        icon: Zap,
        accentClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        actionText: 'بدء المحاكاة',
        path: ROUTES.PHYSICS_SIMULATIONS,
      },
      {
        id: 'exao',
        title: 'التجريب المدعم بالحاسوب (EXAO)',
        subtitle: 'القياسات والمنحنيات البيانية',
        desc: 'أداة متقدمة لالتقاط وتحليل البيانات التجريبية ورسم المنحنيات البيانية بدقة.',
        icon: Activity,
        accentClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        actionText: 'بدء التجريب',
        path: ROUTES.EXAO,
      },
      {
        id: 'virtual-microscope',
        title: 'المجهر الافتراضي',
        subtitle: 'استكشاف العالم المجهري',
        desc: 'عرض شرائح مجهرية لعينات بيولوجية وخلايا نباتية وحيوانية مع التكبير المتدرج.',
        icon: Microscope,
        accentClass: 'bg-green-500/10 text-green-600 dark:text-green-400',
        actionText: 'فحص العينات',
        path: ROUTES.VIRTUAL_MICROSCOPE,
      },
      {
        id: 'anatomy',
        title: 'نماذج التشريح 3D',
        subtitle: 'جسم الإنسان والأجهزة الحيوية',
        desc: 'استكشاف ثلاثي الأبعاد لأعضاء وأجهزة جسم الإنسان لمادة علوم الطبيعة والحياة.',
        icon: Heart,
        accentClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        actionText: 'عرض النماذج',
        path: ROUTES.ANATOMY,
      },
      {
        id: 'earth-sciences',
        title: 'علوم الأرض والجيولوجيا',
        subtitle: 'طبقات الأرض · الزلازل · البراكين',
        desc: 'محاكاة تفاعلية للظواهر الجيولوجية والدينامية الداخلية والخارجية للكوكب.',
        icon: Globe,
        accentClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        actionText: 'استكشاف الأرض',
        path: ROUTES.EARTH_SCIENCES,
      },
      {
        id: 'astronomy',
        title: 'الفضاء وعلم الفلك',
        subtitle: 'النظام الشمسي والأجرام السماوية',
        desc: 'استكشاف الكواكب والنجوم وحركة الأجرام السماوية في محاكاة تفاعلية للفضاء.',
        icon: Telescope,
        accentClass: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
        actionText: 'استكشاف الفضاء',
        path: ROUTES.ASTRONOMY,
      },
    ],
  },
  {
    id: 'utilities-teaching',
    title: 'الأدوات المساندة والخريطة التربوية',
    subtitle: 'الحسابات العلمية الدقيقة، إعداد أوراق العمل التطبيقية ومعاينة المخابر',
    cards: [
      {
        id: 'scientific-calculator',
        title: 'الآلة الحاسبة العلمية',
        subtitle: 'ثوابت فيزيائية وتحويل وحدات',
        desc: 'حاسبة متطورة تتضمن الثوابت الفيزيائية والكيميائية وأدوات تحويل الوحدات القياسية.',
        icon: Calculator,
        accentClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
        actionText: 'فتح الحاسبة',
        path: ROUTES.SCIENTIFIC_CALCULATOR,
      },
      {
        id: 'worksheet',
        title: 'مولد أوراق العمل',
        subtitle: 'إعداد التمارين والبطاقات التطبيقية',
        desc: 'توليد أوراق عمل قابلة للطباعة لتمارين موازنة المعادلات بمستويات صعوبة متعددة.',
        icon: FileSpreadsheet,
        accentClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        actionText: 'توليد ورقة',
        path: ROUTES.WORKSHEET_GENERATOR,
      },
      {
        id: 'educational-map-card',
        title: 'الخريطة التربوية التفاعلية',
        subtitle: 'توزيع المنشآت والمخابر',
        desc: 'استكشاف التوزيع المكاني للأقسام، المخابر العلمية، وقاعات التجارب في المؤسسة.',
        icon: Map,
        accentClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        actionText: 'عرض الخريطة',
        path: ROUTES.EDUCATIONAL_MAP,
      },
    ],
  },
];

export default function ScientificDashboard() {
  const navigate = useNavigate();
  const { currentRole, roleConfig } = useUserRole();

  const visibleSections = useMemo(() => {
    return SCIENTIFIC_SECTIONS.map((sec) => ({
      ...sec,
      cards: sec.cards.filter((card) => isRouteAllowedForRole(currentRole, card.path)),
    })).filter((sec) => sec.cards.length > 0);
  }, [currentRole]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 rtl font-sans" dir="rtl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline/10 pb-6">
        <div className="text-start space-y-1.5">
          <p className="text-xs font-bold text-primary/80">الفضاء العلمي والمحاكاة</p>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight text-balance">
            الموارد العلمية والمخابر الافتراضية
          </h1>
          <p className="text-on-surface/75 text-sm sm:text-base font-medium max-w-2xl">
            منصة شاملة لمحاكاة الفيزياء والكيمياء وعلوم الطبيعة والجيولوجيا والأدوات البيداغوجية التفاعلية
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
              {section.cards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    onClick={() => navigate(card.path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(card.path);
                    }}
                    className="bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                            card.accentClass
                          )}
                        >
                          <Icon size={24} />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-primary-container transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs font-bold text-on-surface/55 mb-2">
                        {card.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-on-surface/75 leading-relaxed line-clamp-2 font-medium">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-outline/5 flex justify-between items-center text-primary font-bold text-xs">
                      <span>{card.actionText}</span>
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
