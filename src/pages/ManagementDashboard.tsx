import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
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
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ManagementModuleItem {
  title: string;
  desc: string;
  icon: any;
  color: string;
  path: string;
  external?: boolean;
}

const managementModules: ManagementModuleItem[] = [
  { 
    title: 'نماذج وثائق إدارية', 
    desc: 'نماذج رسمية مقننة قابلة للتعديل والطباعة: طلبات إدارية، تقارير دورية وحوادث، محاضر استلام وإتلاف، واستمارات تسيير المخابر.', 
    icon: FileText, 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', 
    path: ROUTES.ADMIN_TEMPLATES 
  },
  { 
    title: 'الإعدادات الشخصية', 
    desc: 'تعديل بيانات الحساب، كلمات المرور، والمعلومات الشخصية للمستخدم والمؤسسة.', 
    icon: Settings, 
    color: 'bg-primary/10 text-primary', 
    path: ROUTES.SETTINGS 
  },
  { 
    title: 'مركز النسخ والبيانات', 
    desc: 'إدارة النسخ الاحتياطية السحابية والمحلية، واستعادة البيانات وأرشفة السجلات.', 
    icon: Database, 
    color: 'bg-surface-container-high text-primary', 
    path: ROUTES.BACKUP_CENTER 
  },
  { 
    title: 'إدارة وصيانة قاعدة البيانات', 
    desc: 'مراقبة مجموعات Firestore، فحص صحة البيانات، وإجراء عمليات الاستيراد والتصدير بتنسيق JSON.', 
    icon: Server, 
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300', 
    path: ROUTES.DATABASE_MANAGEMENT 
  },
  { 
    title: 'التقارير الإحصائية الرسمية', 
    desc: 'توليد التقارير الإحصائية الشاملة لنشاط المخبر والمواد والتجهيزات وطباعتها برأسية وزارية.', 
    icon: BarChart3, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', 
    path: ROUTES.REPORTS 
  },
  { 
    title: 'الميزانية والطلبيات', 
    desc: 'تسيير الميزانية السنوية، نماذج طلبيات الشراء المقننة (سجلات، كواشف، زجاجيات)، وسجل الموردين.', 
    icon: Wallet, 
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', 
    path: ROUTES.BUDGET_PURCHASES 
  },
  { 
    title: 'الإمتحانات المهنية', 
    desc: 'متابعة الامتحانات والإختبارات المهنية للترقية، ومستجدات المسابقات الداخلية لموظفي المخابر.', 
    icon: Award, 
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', 
    path: ROUTES.PROFESSIONAL_EXAMS 
  },
  { 
    title: 'فضاء الموظف (وزارة التربية)', 
    desc: 'المنصة الرقمية الرسمية لموظفي قطاع التربية الوطنية لمتابعة الوضعية الإدارية والمالية.', 
    icon: Globe, 
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300', 
    path: 'https://mowadaf.education.dz/',
    external: true
  },
  { 
    title: 'موارد وروابط هامة', 
    desc: 'دليل المنصات والمواقع الرسمية التابعة لوزارة التربية الوطنية ورقمنة القطاع.', 
    icon: ExternalLink, 
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', 
    path: ROUTES.IMPORTANT_LINKS 
  },
  { 
    title: 'أداة تشخيص النظام والاتصال', 
    desc: 'اختبار الاتصال بقاعدة البيانات، تدقيق التراخيص والصلاحيات، وفحص سرعة الاستجابة.', 
    icon: Activity, 
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300', 
    path: ROUTES.DIAGNOSTIC 
  },
  { 
    title: 'الدعم والاقتراحات', 
    desc: 'التواصل لتقديم اقتراح أو الإبلاغ عن مشكلة فنية والمساهمة في تحسين المنصة.', 
    icon: MessageSquare, 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', 
    path: ROUTES.SUPPORT 
  }
];

export default function ManagementDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 pb-24 rtl font-sans" dir="rtl">
      <div className="flex items-center gap-4 border-b border-outline/10 pb-6 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
            الإدارة والإعدادات
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            إعدادات النظام، النماذج الإدارية، الميزانية، ومركز البيانات والتشخيص.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementModules.map((mod, i) => {
          const Icon = mod.icon;
          const cardContent = (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
              
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm", mod.color)}>
                <Icon size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                {mod.title}
                {mod.external && <ExternalLink size={16} className="text-on-surface-variant" />}
              </h3>
              
              <p className="text-on-surface-variant leading-relaxed opacity-90 text-sm">
                {mod.desc}
              </p>
              
              <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                <ArrowLeft size={24} className="text-primary" />
              </div>
            </>
          );

          return mod.external ? (
            <motion.a
              key={mod.title}
              href={mod.path}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-surface-container-lowest p-8 rounded-[32px] hover:shadow-ambient-hover hover:-translate-y-1 transition-all duration-300 ease-out group cursor-pointer relative overflow-hidden shadow-ambient border border-outline/5 block"
            >
              {cardContent}
            </motion.a>
          ) : (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => navigate(mod.path)}
              className="bg-surface-container-lowest p-8 rounded-[32px] hover:shadow-ambient-hover hover:-translate-y-1 transition-all duration-300 ease-out group cursor-pointer relative overflow-hidden shadow-ambient border border-outline/5"
            >
              {cardContent}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
