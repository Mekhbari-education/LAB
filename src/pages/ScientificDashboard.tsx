import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Atom, Beaker, FileSpreadsheet, Box, FlaskConical, Play, Activity, Microscope, Telescope, Calculator, Dna, Zap, Globe, Heart } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const cards = [
  {
    id: 'periodic-table',
    title: 'الجدول الدوري',
    subtitle: 'استكشاف تفاعلي للعناصر',
    desc: 'جدول دوري تفاعلي شامل يضم 118 عنصرًا مع تصنيفات لونية ومعلومات كيميائية متكاملة.',
    icon: Box,
    iconColor: 'text-blue-500',
    bgIcon: 'bg-blue-500/10',
    gradient: 'from-blue-500/20 to-transparent',
    category: 'تفاعلي',
    actionText: 'بدء الاستكشاف',
    path: ROUTES.PERIODIC_TABLE
  },
  {
    id: 'atom-3d',
    title: 'مجسمات الذرات 3D',
    subtitle: 'نماذج ثلاثية الأبعاد',
    desc: 'نماذج ذرات تفاعلية ثلاثية الأبعاد توضح المدارات والإلكترونات بشكل بصري دقيق.',
    icon: Atom,
    iconColor: 'text-purple-500',
    bgIcon: 'bg-purple-500/10',
    gradient: 'from-purple-500/20 to-transparent',
    category: 'محاكاة',
    actionText: 'عرض النماذج',
    path: ROUTES.ATOM_3D
  },
  {
    id: 'tools',
    title: 'أدوات الكيمياء',
    subtitle: 'موازن، كتلة مولية، ذوبان',
    desc: 'مجموعة أدوات احترافية تشمل موازن المعادلات الكيميائية، وحاسبة الكتلة المولية، وجداول الذوبان.',
    icon: Beaker,
    iconColor: 'text-emerald-500',
    bgIcon: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/20 to-transparent',
    category: 'أدوات',
    actionText: 'فتح الأدوات',
    path: ROUTES.CHEMISTRY_TOOLS
  },
  {
    id: 'virtual-lab',
    title: 'المخبر الافتراضي',
    subtitle: 'تجارب تفاعلية',
    desc: 'بيئة افتراضية لإجراء التجارب الكيميائية ومحاكاة التفاعلات بأمان وبصورة تفاعلية.',
    icon: FlaskConical,
    iconColor: 'text-rose-500',
    bgIcon: 'bg-rose-500/10',
    gradient: 'from-rose-500/20 to-transparent',
    category: 'محاكاة',
    actionText: 'دخول المخبر',
    path: ROUTES.VIRTUAL_LAB
  },
  {
    id: 'exao',
    title: 'التجريب المدعم بالحاسوب',
    subtitle: 'القياسات والمنحنيات البيانية',
    desc: 'أداة متقدمة لالتقاط وتحليل البيانات التجريبية ورسم المنحنيات البيانية بفاعلية عالية (EXAO).',
    icon: Activity,
    iconColor: 'text-indigo-500',
    bgIcon: 'bg-indigo-500/10',
    gradient: 'from-indigo-500/20 to-transparent',
    category: 'تحليل',
    actionText: 'بدء التجريب',
    path: ROUTES.EXAO
  },
  {
    id: 'worksheet',
    title: 'أوراق العمل',
    subtitle: 'مولد آلي للتمارين',
    desc: 'توليد أوراق عمل قابلة للطباعة لتمارين موازنة المعادلات مع مستويات صعوبة متعددة.',
    icon: FileSpreadsheet,
    iconColor: 'text-amber-500',
    bgIcon: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 to-transparent',
    category: 'تعليم',
    actionText: 'توليد ورقة',
    path: ROUTES.WORKSHEET_GENERATOR
  },
  {
    id: 'physics-sim',
    title: 'محاكاة فيزيائية',
    subtitle: 'الميكانيك، الكهرباء، البصريات',
    desc: 'تجارب فيزيائية تفاعلية لفهم قوانين الحركة، الدارات الكهربائية، والظواهر الضوئية.',
    icon: Zap,
    iconColor: 'text-yellow-500',
    bgIcon: 'bg-yellow-500/10',
    gradient: 'from-yellow-500/20 to-transparent',
    category: 'محاكاة',
    actionText: 'بدء المحاكاة',
    path: ROUTES.PHYSICS_SIMULATIONS
  },
  {
    id: 'virtual-microscope',
    title: 'المجهر الافتراضي',
    subtitle: 'استكشاف العالم المجهري',
    desc: 'عرض شرائح مجهرية لعينات بيولوجية وخلايا نباتية وحيوانية مع إمكانية التكبير.',
    icon: Microscope,
    iconColor: 'text-green-500',
    bgIcon: 'bg-green-500/10',
    gradient: 'from-green-500/20 to-transparent',
    category: 'بيولوجيا',
    actionText: 'فحص العينات',
    path: ROUTES.VIRTUAL_MICROSCOPE
  },
  {
    id: 'scientific-calculator',
    title: 'آلة حاسبة علمية',
    subtitle: 'ثوابت وتحويلات',
    desc: 'حاسبة متطورة تتضمن الثوابت الفيزيائية والكيميائية وأدوات تحويل الوحدات القياسية.',
    icon: Calculator,
    iconColor: 'text-slate-500',
    bgIcon: 'bg-slate-500/10',
    gradient: 'from-slate-500/20 to-transparent',
    category: 'أدوات',
    actionText: 'فتح الحاسبة',
    path: ROUTES.SCIENTIFIC_CALCULATOR
  },
  {
    id: 'molecular-viewer',
    title: 'عارض الجزيئات 3D',
    subtitle: 'الكيمياء العضوية والمركبات',
    desc: 'بناء وعرض الجزيئات الكيميائية المعقدة بشكل ثلاثي الأبعاد لفهم الروابط والتركيب الفراغي.',
    icon: Dna,
    iconColor: 'text-cyan-500',
    bgIcon: 'bg-cyan-500/10',
    gradient: 'from-cyan-500/20 to-transparent',
    category: 'تفاعلي',
    actionText: 'عرض الجزيئات',
    path: ROUTES.MOLECULAR_VIEWER
  },
  {
    id: 'astronomy',
    title: 'الفضاء وعلم الفلك',
    subtitle: 'النظام الشمسي والأجرام',
    desc: 'استكشاف الكواكب والنجوم وحركة الأجرام السماوية في محاكاة تفاعلية للفضاء.',
    icon: Telescope,
    iconColor: 'text-fuchsia-500',
    bgIcon: 'bg-fuchsia-500/10',
    gradient: 'from-fuchsia-500/20 to-transparent',
    category: 'استكشاف',
    actionText: 'استكشاف الفضاء',
    path: ROUTES.ASTRONOMY
  },
  {
    id: 'earth-sciences',
    title: 'علوم الأرض والجيولوجيا',
    subtitle: 'طبقات الأرض، الزلازل والبراكين',
    desc: 'محاكاة تفاعلية للظواهر الجيولوجية، طبقات الأرض، والدينامية الداخلية والخارجية للكوكب.',
    icon: Globe,
    iconColor: 'text-amber-600',
    bgIcon: 'bg-amber-600/10',
    gradient: 'from-amber-600/20 to-transparent',
    category: 'جيولوجيا',
    actionText: 'استكشاف الأرض',
    path: ROUTES.EARTH_SCIENCES
  },
  {
    id: 'anatomy',
    title: 'نماذج التشريح 3D',
    subtitle: 'جسم الإنسان والأنظمة الحيوية',
    desc: 'استكشاف ثلاثي الأبعاد لأعضاء وأجهزة جسم الإنسان لمادة علوم الطبيعة والحياة.',
    icon: Heart,
    iconColor: 'text-rose-600',
    bgIcon: 'bg-rose-600/10',
    gradient: 'from-rose-600/20 to-transparent',
    category: 'بيولوجيا',
    actionText: 'عرض النماذج',
    path: ROUTES.ANATOMY
  }
];

export default function ScientificDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] w-full bg-surface rtl font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex z-10 items-center justify-between px-6 py-4 border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
              الموارد العلمية
            </h1>
          </div>
        </div>
        
          <button
            onClick={() => navigate(ROUTES.EDUCATIONAL_MAP)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors font-semibold text-sm"
          >
            <Map size={18} />
            الخريطة التربوية
          </button>
      </div>

      <AnimatePresence mode="wait">
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 lg:p-10"
          >
             <div className="max-w-7xl mx-auto space-y-12">
               
               {/* Hero Section */}
               <div className="text-center space-y-4 pt-4 pb-8">
                 <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary/10 rounded-2xl sm:mb-4">
                   <Atom className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-bold text-on-surface">استكشف عالم الكيمياء التفاعلي</h2>
                 <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                   منصة متكاملة توفر أدوات بيداغوجية، مجسمات ذرات ثلاثية الأبعاد، محاكاة للمخابر، وجداول دورية تفاعلية للمساعدة في تبسيط المفاهيم العلمية.
                 </p>
               </div>

               {/* Cards Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                 {cards.map((card, i) => {
                   const Icon = card.icon;
                   return (
                     <motion.div
                       key={card.id}
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                       onClick={() => navigate(card.path)}
                       className="group cursor-pointer relative flex flex-col bg-surface overflow-hidden rounded-[2rem] border border-outline/10 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-2"
                     >
                       {/* Background Gradient */}
                       <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
                       
                       <div className="relative p-8 flex-1 flex flex-col">
                         {/* Header */}
                         <div className="flex justify-between items-start mb-6">
                           <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", card.bgIcon)}>
                             <Icon className={cn("w-8 h-8", card.iconColor)} strokeWidth={1.5} />
                           </div>
                           <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-medium rounded-full">
                             {card.category}
                           </span>
                         </div>
                         
                         {/* Content */}
                         <div className="flex-1">
                           <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                             {card.title}
                           </h3>
                           <p className="text-sm font-medium text-on-surface-variant/80 mb-3 block">
                             {card.subtitle}
                           </p>
                           <p className="text-sm text-on-surface-variant leading-relaxed">
                             {card.desc}
                           </p>
                         </div>

                         {/* Action Footer */}
                         <div className="mt-8 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                           <span className="font-semibold text-sm text-primary">{card.actionText}</span>
                           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
                             <Play fill="currentColor" className="w-4 h-4 ml-1" />
                           </div>
                         </div>

                       </div>
                     </motion.div>
                   );
                 })}
               </div>

             </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}
