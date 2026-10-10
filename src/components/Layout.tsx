import { Outlet, Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Beaker, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  User,
  Menu,
  X,
  FileText,
  Archive,
  Users,
  Database,
  Trash2,
  Map,
  Monitor,
  Package,
  Folder,
  BookOpen,
  Sun,
  Moon,
  QrCode,
  Printer,
  Wallet,
  ShieldCheck,
  Scale,
  Calculator,
  Wrench,
  ChevronDown,
  Clock,
  Sparkles,
  Atom,
  Binary,
  MessageSquare,
  ExternalLink,
  Award,
  Globe,
  RefreshCw,
  PlusCircle,
  GraduationCap,
  LifeBuoy,
  BarChart3,
  Server,
  Activity,
  Microscope,
  Telescope,
  Dna,
  Zap,
  Heart,
  FileSpreadsheet
} from 'lucide-react';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ErrorBoundary from './ErrorBoundary';
import { doc, getDoc, onSnapshot, query, where, setDoc } from 'firebase/firestore';
import { db, getUserCollection, checkIsAdmin } from '../firebase';
import GlobalSearch from './GlobalSearch';
import Breadcrumbs from './Breadcrumbs';
import NotificationCenter from './NotificationCenter';
import logo from '/ministry-logo.png';
import { ROUTES } from '../config/routes';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const syncUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          const updates: any = {};
          if (auth.currentUser.photoURL && (!userDoc.exists() || userDoc.data()?.photoURL !== auth.currentUser.photoURL)) {
            updates.photoURL = auth.currentUser.photoURL;
          }
          if (auth.currentUser.displayName && (!userDoc.exists() || userDoc.data()?.displayName !== auth.currentUser.displayName)) {
            updates.displayName = auth.currentUser.displayName;
          }

          if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    };
    syncUserProfile();
  }, [auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser) {
      checkIsAdmin(auth.currentUser).then(setIsAdmin);
    }
  }, [auth.currentUser]);

  const { t, i18n } = useTranslation();

  const navigationGroups = [
    {
      title: t('nav.dashboard_group', 'لوحة التحكم الرئيسية'),
      icon: LayoutDashboard,
      items: [
        { name: t('nav.dashboard', 'لوحة القيادة'), path: ROUTES.HOME, icon: LayoutDashboard },
        { name: t('nav.inventory_dashboard', 'لوحة الجرد الشاملة'), path: ROUTES.INVENTORY_DASHBOARD, icon: Database },
        { name: t('nav.pedagogical_dashboard', 'اللوحة البيداغوجية'), path: ROUTES.PEDAGOGICAL_DASHBOARD, icon: BookOpen },
        { name: t('nav.safety_hub', 'قطب الأمن والسلامة'), path: ROUTES.SAFETY_HUB, icon: ShieldAlert },
        { name: t('nav.scientific_hub', 'فضاء الموارد العلمية'), path: ROUTES.SCIENTIFIC_HUB, icon: Atom },
        { name: t('nav.settings_hub', 'الإدارة والإعدادات'), path: ROUTES.SETTINGS_HUB, icon: Settings },
        ...(isAdmin ? [{ name: t('nav.admin_dashboard', 'لوحة الإدارة المركزية'), path: ROUTES.ADMIN, icon: ShieldCheck }] : []),
      ]
    },
    {
      title: t('nav.inventory_group', 'الجرد والمخزون'),
      icon: Package,
      items: [
        { name: t('nav.chemicals', 'الكواشف الكيميائية'), path: ROUTES.CHEMICALS, icon: FlaskConical },
        { name: t('nav.equipment', 'التجهيزات المخبرية'), path: ROUTES.EQUIPMENT, icon: Beaker },
        { name: t('nav.inventory_cards', 'سجل بطاقات الجرد'), path: ROUTES.INVENTORY_CARDS, icon: FileText },
        { name: t('nav.tech_inventory', 'جرد التجهيزات التقنية'), path: ROUTES.TECH_INVENTORY, icon: Monitor },
        { name: t('nav.consumables_sds', 'جرد المستهلكات و SDS'), path: ROUTES.CONSUMABLES_SDS, icon: Package },
        { name: t('nav.glassware_breakage', 'جرد الزجاجيات والكسور'), path: ROUTES.GLASSWARE_BREAKAGE, icon: Beaker },
        { name: t('nav.chemical_storage', 'مصفوفة التوافق'), path: ROUTES.CHEMICAL_STORAGE, icon: ShieldCheck },
        { name: t('nav.maintenance', 'الصيانة والمعايرة'), path: ROUTES.MAINTENANCE, icon: Wrench },
        { name: t('nav.scrapping', 'إسقاط التجهيزات'), path: ROUTES.SCRAPPING, icon: Trash2 },
        { name: t('nav.loan_request', 'إعارة الوسائل'), path: ROUTES.LOAN_REQUEST, icon: RefreshCw },
        { name: t('nav.qr_print_center', 'مركز الطباعة (QR)'), path: ROUTES.QR_PRINT_CENTER, icon: Printer },
        { name: t('nav.calculators', 'الحاسبة المخبرية'), path: ROUTES.CALCULATORS, icon: Calculator },
      ]
    },
    {
      title: t('nav.pedagogical_group', 'المتابعة البيداغوجية'),
      icon: BookOpen,
      items: [
        { name: t('nav.daily_report', 'التقارير اليومية'), path: ROUTES.DAILY_REPORT, icon: FileText },
        { name: t('nav.lab_assistant', 'مساعد مخبري (AI)'), path: ROUTES.LAB_ASSISTANT, icon: Sparkles },
        { name: t('nav.lab_experiments', 'سجل التجارب المخبرية'), path: ROUTES.LAB_EXPERIMENTS, icon: FlaskConical },
        { name: t('nav.teachers', 'فريق الأساتذة'), path: ROUTES.TEACHERS, icon: Users },
        { name: t('nav.document_library', 'المكتبة الرقمية'), path: ROUTES.DOCUMENT_LIBRARY, icon: Folder },
        { name: t('nav.school_legislation', 'التشريع المدرسي'), path: ROUTES.SCHOOL_LEGISLATION, icon: Scale },
        { name: t('nav.timetable', 'جدولة الحصص'), path: ROUTES.TIMETABLE, icon: Clock },
        { name: t('nav.lab_schedule', 'جدول استعمال المخابر'), path: ROUTES.LAB_SCHEDULE, icon: Clock },
        { name: t('nav.pedagogical_tracking', 'المتابعة البيداغوجية'), path: ROUTES.PEDAGOGICAL_TRACKING, icon: GraduationCap },
        { name: t('nav.follow_up_registry', 'سجل المتابعة'), path: ROUTES.FOLLOW_UP_REGISTRY, icon: BookOpen },
        { name: t('nav.student_groups', 'تسيير الأفواج'), path: ROUTES.STUDENT_GROUPS, icon: Users },
        { name: t('nav.activity_request', 'طلب نشاط تطبيقي'), path: ROUTES.ACTIVITY_REQUEST, icon: PlusCircle },
        { name: t('nav.smart_forms', 'المولد الذكي للنماذج'), path: ROUTES.SMART_FORMS, icon: FileText },
        { name: t('nav.archive', 'الأرشيف الرقمي'), path: ROUTES.ARCHIVE, icon: Archive },
        { name: t('nav.sync', 'مزامنة الحصص'), path: ROUTES.SYNC, icon: RefreshCw },
        { name: t('nav.worksheet_generator', 'مولد أوراق العمل'), path: ROUTES.WORKSHEET_GENERATOR, icon: FileSpreadsheet },
      ]
    },
    {
      title: t('nav.safety_group', 'الأمن والسلامة'),
      icon: ShieldAlert,
      items: [
        { name: t('nav.safety', 'الأمن والسلامة'), path: ROUTES.SAFETY, icon: ShieldAlert },
        { name: t('nav.safety_guide', 'دليل السلامة'), path: ROUTES.SAFETY_GUIDE, icon: LifeBuoy },
        { name: t('nav.chemical_storage', 'مصفوفة التوافق'), path: ROUTES.CHEMICAL_STORAGE, icon: ShieldCheck },
        { name: t('nav.chemical_waste', 'إدارة النفايات الكيميائية'), path: ROUTES.CHEMICAL_WASTE, icon: Trash2 },
        { name: t('nav.consumables_sds', 'بطاقات بيانات السلامة (SDS)'), path: ROUTES.CONSUMABLES_SDS, icon: Package },
        { name: t('nav.glassware_breakage', 'سجل الزجاجيات والكسور'), path: ROUTES.GLASSWARE_BREAKAGE, icon: Beaker },
        { name: t('nav.maintenance_safety', 'الصيانة الوقائية'), path: ROUTES.MAINTENANCE, icon: Wrench },
        { name: t('nav.scrapping_safety', 'إسقاط وتكهين المعدات'), path: ROUTES.SCRAPPING, icon: Trash2 },
      ]
    },
    {
      title: t('nav.resources_group', 'الموارد العلمية'),
      icon: Atom,
      items: [
        { name: t('nav.periodic_table', 'الجدول الدوري'), path: ROUTES.PERIODIC_TABLE, icon: Atom },
        { name: t('nav.atom_3d', 'مجسمات الذرات 3D'), path: ROUTES.ATOM_3D, icon: Atom },
        { name: t('nav.chemistry_tools', 'أدوات الكيمياء'), path: ROUTES.CHEMISTRY_TOOLS, icon: Binary },
        { name: t('nav.virtual_lab', 'المخبر الافتراضي'), path: ROUTES.VIRTUAL_LAB, icon: FlaskConical },
        { name: t('nav.exao', 'التجريب بالحاسوب (EXAO)'), path: ROUTES.EXAO, icon: Activity },
        { name: t('nav.physics_sim', 'محاكاة فيزيائية'), path: ROUTES.PHYSICS_SIMULATIONS, icon: Zap },
        { name: t('nav.virtual_microscope', 'المجهر الافتراضي'), path: ROUTES.VIRTUAL_MICROSCOPE, icon: Microscope },
        { name: t('nav.scientific_calculator', 'الحاسبة العلمية'), path: ROUTES.SCIENTIFIC_CALCULATOR, icon: Calculator },
        { name: t('nav.lab_calculators', 'الحاسبة المخبرية'), path: ROUTES.CALCULATORS, icon: Calculator },
        { name: t('nav.educational_map', 'الخريطة التربوية'), path: ROUTES.EDUCATIONAL_MAP, icon: Map },
        { name: t('nav.molecular_viewer', 'عارض الجزيئات 3D'), path: ROUTES.MOLECULAR_VIEWER, icon: Dna },
        { name: t('nav.astronomy', 'الفضاء وعلم الفلك'), path: ROUTES.ASTRONOMY, icon: Telescope },
        { name: t('nav.earth_sciences', 'علوم الأرض والجيولوجيا'), path: ROUTES.EARTH_SCIENCES, icon: Globe },
        { name: t('nav.anatomy', 'نماذج التشريح 3D'), path: ROUTES.ANATOMY, icon: Heart },
      ]
    },
    {
      title: t('nav.admin_settings_group', 'الإدارة والإعدادات'),
      icon: Settings,
      items: [
        { name: t('nav.admin_templates', 'نماذج وثائق إدارية'), path: ROUTES.ADMIN_TEMPLATES, icon: FileText },
        { name: t('nav.personal_settings', 'الإعدادات الشخصية'), path: ROUTES.SETTINGS, icon: Settings },
        { name: t('nav.backup_center', 'مركز النسخ والبيانات'), path: ROUTES.BACKUP_CENTER, icon: Database },
        { name: t('nav.database_management', 'إدارة قاعدة البيانات'), path: ROUTES.DATABASE_MANAGEMENT, icon: Server },
        { name: t('nav.reports', 'التقارير الإحصائية الرسمية'), path: ROUTES.REPORTS, icon: BarChart3 },
        { name: t('nav.budget_purchases', 'الميزانية والطلبيات'), path: ROUTES.BUDGET_PURCHASES, icon: Wallet },
        { name: t('nav.professional_exams', 'الإمتحانات المهنية'), path: ROUTES.PROFESSIONAL_EXAMS, icon: Award },
        { name: t('nav.employee_space', 'فضاء الموظف'), path: 'https://mowadaf.education.dz/', icon: ExternalLink, external: true },
        { name: t('nav.important_links', 'موارد وروابط هامة'), path: ROUTES.IMPORTANT_LINKS, icon: ExternalLink },
        { name: t('nav.diagnostic', 'تشخيص النظام والاتصال'), path: ROUTES.DIAGNOSTIC, icon: Activity },
        { name: t('nav.support', 'الدعم والاقتراحات'), path: ROUTES.SUPPORT, icon: MessageSquare },
      ]
    },
  ];
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['لوحة التحكم الرئيسية', 'الجرد والمخزون']);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [hoveredGroupFlyout, setHoveredGroupFlyout] = useState<{
    group: (typeof navigationGroups)[0];
    top: number;
  } | null>(null);
  const [hoveredItemTooltip, setHoveredItemTooltip] = useState<{
    name: string;
    top: number;
  } | null>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGroupMouseEnter = (group: (typeof navigationGroups)[0], e: React.MouseEvent<HTMLElement>) => {
    if (!isSidebarOpen) {
      if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItemTooltip(null);
      setHoveredGroupFlyout({
        group,
        top: Math.max(70, Math.min(window.innerHeight - 240, rect.top + rect.height / 2))
      });
    }
  };

  const handleGroupMouseLeave = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    flyoutTimeoutRef.current = setTimeout(() => {
      setHoveredGroupFlyout(null);
    }, 200);
  };

  const handleFlyoutMouseEnter = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    flyoutTimeoutRef.current = setTimeout(() => {
      setHoveredGroupFlyout(null);
    }, 150);
  };

  const handleItemMouseEnter = (name: string, e: React.MouseEvent<HTMLElement>) => {
    if (!isSidebarOpen) {
      if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItemTooltip({
        name,
        top: rect.top + rect.height / 2
      });
    }
  };

  const handleItemMouseLeave = () => {
    setHoveredItemTooltip(null);
  };

  const handleLogout = () => signOut(auth);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          // Fetch both user record and settings
          const [userDoc, settingsDoc] = await Promise.all([
            getDoc(doc(db, 'users', auth.currentUser.uid)),
            getDoc(doc(db, 'settings', auth.currentUser.uid))
          ]);

          let role = 'مساعد مخبري';
          
          if (settingsDoc.exists()) {
            const settingsData = settingsDoc.data();
            const job = settingsData.soilType || settingsData.jobTitle || settingsData.grade || role;
            const cycle = settingsData.cycle ? ` — ${settingsData.cycle}` : '';
            role = `${job}${cycle}`;
          } else if (userDoc.exists()) {
            role = userDoc.data().role || role;
          }
          
          setUserRole(role);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('the client is offline')) {
            console.warn('Firestore is offline. Using default role.');
          } else {
            console.error('Error fetching role:', error);
          }
          setUserRole('مساعد مخبري');
        }
      } else {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [auth.currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isRtl = i18n.language?.startsWith('ar');

  return (
    <div className="min-h-screen bg-surface flex text-foreground">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SideNavBar */}
      <aside 
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "fixed start-0 top-0 h-full z-40 flex flex-col bg-surface-container-low transition-all duration-300 no-print border-e border-outline-variant/10 shadow-sm",
          isSidebarOpen 
            ? "w-72 translate-x-0" 
            : "rtl:max-md:translate-x-full ltr:max-md:-translate-x-full md:translate-x-0 md:w-20 w-72 md:transform-none"
        )}
      >
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all relative border-b border-outline-variant/10 shrink-0",
          isSidebarOpen ? "p-6" : "px-2 py-4"
        )}>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-4 end-4 p-2 text-secondary hover:text-primary rounded-full hover:bg-secondary-container/40 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          )}
          <img 
            className={cn("object-contain transition-all shrink-0", isSidebarOpen ? "w-16 h-16" : "w-10 h-10")}
            src={logo}
            alt="Logo" 
          />
          {isSidebarOpen && (
            <div className="text-center mt-1 px-2 overflow-hidden">
              <h1 className="text-base sm:text-lg font-black text-primary leading-tight">{t('header.platform_title', 'الأرضية الرقمية — فضاء موظفوا المخابر')}</h1>
              <p className="text-[10px] text-secondary font-bold leading-tight mt-1">{t('header.ministry', 'وزارة التربية الوطنية')}</p>
            </div>
          )}
        </div>

        <nav 
          role="navigation" 
          aria-label="القائمة الرئيسية" 
          className={cn(
            "flex-1 overflow-y-auto no-scrollbar transition-all",
            isSidebarOpen ? "px-4 py-4 space-y-3" : "px-2 py-3 space-y-2 overflow-x-hidden"
          )}
        >
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            const hasActiveItem = group.items.some(item => !item.external && location.pathname === item.path);
            const GroupIcon = group.icon;

            const toggleGroup = () => {
              setExpandedGroups(prev => 
                prev.includes(group.title) 
                  ? prev.filter(t => t !== group.title)
                  : [...prev, group.title]
              );
            };

            return (
              <div key={group.title} className="space-y-1 w-full">
                {isSidebarOpen ? (
                  <>
                    <button
                      onClick={toggleGroup}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group/title",
                        isExpanded ? "text-primary bg-primary/10 font-black" : hasActiveItem ? "text-primary font-bold bg-primary/5" : "text-secondary hover:bg-secondary-container/30 hover:text-primary"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <GroupIcon size={19} className={cn("shrink-0", (isExpanded || hasActiveItem) && "text-primary")} />
                        <span className="text-xs font-bold truncate">{group.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ChevronDown size={15} className="text-secondary/60 group-hover/title:text-primary" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden ps-3 ms-2.5 border-s-2 border-outline-variant/30 flex flex-col gap-1 mt-1.5"
                        >
                          {group.items.map((item) => {
                            const isActive = !item.external && location.pathname === item.path;
                            const ItemIcon = item.icon;
                            
                            const linkClasses = cn(
                              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group/item text-xs",
                              isActive 
                                ? "bg-secondary-container text-primary font-black shadow-xs" 
                                : "text-secondary hover:bg-secondary-container/20 hover:text-primary font-bold"
                            );

                            if (item.external) {
                              return (
                                <a
                                  key={item.path}
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={linkClasses}
                                >
                                  <ItemIcon size={16} className="shrink-0" />
                                  <span className="truncate">{item.name}</span>
                                </a>
                              );
                            }

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                  if (window.innerWidth < 768) {
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={linkClasses}
                              >
                                <ItemIcon size={16} className={cn("shrink-0", isActive && "text-primary")} />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    {/* Collapsed Category Icon Button */}
                    <button
                      onClick={toggleGroup}
                      onMouseEnter={(e) => handleGroupMouseEnter(group, e)}
                      onMouseLeave={handleGroupMouseLeave}
                      title={group.title}
                      aria-label={group.title}
                      className={cn(
                        "w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 relative shrink-0",
                        hasActiveItem
                          ? "bg-primary text-on-primary shadow-sm"
                          : isExpanded
                          ? "bg-secondary-container text-primary shadow-xs ring-1 ring-primary/20" 
                          : "text-secondary hover:bg-secondary-container/30 hover:text-primary"
                      )}
                    >
                      <GroupIcon size={20} className="shrink-0" />
                      {hasActiveItem && (
                        <span className="absolute top-1 end-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface-container-low" />
                      )}
                    </button>

                    {/* Sub-items in collapsed sidebar shown when group is expanded */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center gap-1.5 py-1.5 my-1 w-full bg-surface-container/50 rounded-2xl border border-outline-variant/15"
                        >
                          {group.items.map((item) => {
                            const isActive = !item.external && location.pathname === item.path;
                            const ItemIcon = item.icon;
                            
                            const collapsedItemClasses = cn(
                              "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 relative",
                              isActive
                                ? "bg-primary text-on-primary shadow-xs"
                                : "text-secondary hover:bg-secondary-container/50 hover:text-primary"
                            );

                            if (item.external) {
                              return (
                                <a
                                  key={item.path}
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onMouseEnter={(e) => handleItemMouseEnter(item.name, e)}
                                  onMouseLeave={handleItemMouseLeave}
                                  title={item.name}
                                  aria-label={item.name}
                                  className={collapsedItemClasses}
                                >
                                  <ItemIcon size={15} className="shrink-0" />
                                </a>
                              );
                            }

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onMouseEnter={(e) => handleItemMouseEnter(item.name, e)}
                                onMouseLeave={handleItemMouseLeave}
                                title={item.name}
                                aria-label={item.name}
                                className={collapsedItemClasses}
                              >
                                <ItemIcon size={15} className={cn("shrink-0", isActive && "text-on-primary")} />
                                {isActive && (
                                  <span className="absolute -start-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-primary rounded-full" />
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={cn("transition-all border-t border-outline-variant/10 shrink-0", isSidebarOpen ? "p-4" : "p-2 flex justify-center")}>
          <button 
            onClick={handleLogout}
            title={t('header.logout', 'تسجيل الخروج')}
            aria-label={t('header.logout', 'تسجيل الخروج')}
            className={cn(
              "flex items-center text-error hover:bg-error/10 transition-all rounded-2xl",
              isSidebarOpen ? "w-full gap-3 py-2.5 px-3.5 justify-start" : "w-11 h-11 justify-center shrink-0"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-bold text-xs truncate">{t('header.logout', 'تسجيل الخروج')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 print:ms-0 min-w-0 w-full",
        isSidebarOpen ? "md:ms-72" : "md:ms-20"
      )}>
        {/* TopAppBar */}
        <header className="h-16 bg-surface/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center px-4 md:px-8 no-print">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
              title={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
              className="p-2 hover:bg-secondary-container/50 rounded-full text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Menu size={20} className={cn("transition-transform duration-200", isSidebarOpen ? "rotate-90 md:rotate-0" : "")} />
            </button>
            <h2 className="text-base md:text-lg font-bold text-primary truncate max-w-[150px] sm:max-w-none">
              {t('header.app_title', 'نظام تسيير المخابر')}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative group">
              <button 
                className="p-2 hover:bg-secondary-container/50 rounded-full text-primary transition-all flex items-center gap-1"
                title="تغيير اللغة"
              >
                <Globe size={20} />
              </button>
              <div className="absolute top-full end-0 mt-2 w-32 bg-surface-container-highest rounded-xl shadow-xl border border-outline-variant p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {['ar', 'fr', 'en'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    className={cn(
                      "w-full text-start px-4 py-2 rounded-lg text-sm transition-all",
                      i18n.language === lng ? "bg-primary/10 text-primary font-bold" : "hover:bg-surface-container-low text-secondary"
                    )}
                  >
                    {t(`language.${lng}`)}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-secondary-container/50 rounded-full text-primary transition-all hidden sm:block"
              title={t('header.switch_theme')}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="p-2 hover:bg-secondary-container/50 rounded-full text-primary transition-all"
              title={t('header.scan_qr')}
            >
              <QrCode size={20} />
            </button>
            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="bg-surface-container-high border-none rounded-full py-2 pe-10 ps-4 w-64 text-sm text-start text-outline/60 hover:bg-surface-container-highest transition-all flex items-center justify-between"
              >
                <span>{t('header.search_quick', 'بحث سريع...')}</span>
                <span className="text-[10px] bg-surface-container-low px-1.5 py-0.5 rounded border border-outline/10">⌘K</span>
              </button>
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            </div>
            <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
              <NotificationCenter />
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
                aria-label="قائمة الملف الشخصي"
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all active:scale-95 ms-1 shrink-0"
              >
                <img 
                  className="w-full h-full object-cover antialiased" 
                  src={(auth.currentUser?.photoURL || "https://picsum.photos/seed/user/100/100").replace(/=s\d+(-c)?/g, '=s400-c')} 
                  alt="Profile" 
                  style={{ imageRendering: 'auto' }}
                  referrerPolicy="no-referrer"
                />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute end-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-surface-container-highest rounded-2xl shadow-2xl border border-outline-variant/40 p-2 z-50 text-start"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/50 mb-2">
                      <p className="text-sm font-bold text-primary truncate">{auth.currentUser?.displayName || 'مستخدم'}</p>
                      <p className="text-[10px] text-secondary truncate mb-2">{auth.currentUser?.email || auth.currentUser?.phoneNumber}</p>
                      {userRole && (
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black border border-primary/5 shadow-sm">
                            {userRole}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {isAdmin && (
                      <Link 
                        to={ROUTES.ADMIN} 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-800 font-bold hover:bg-emerald-50 rounded-xl transition-colors mb-1"
                      >
                        <ShieldCheck size={18} className="text-emerald-600" />
                        <span>لوحة الإدارة المركزية</span>
                      </Link>
                    )}

                    <Link 
                      to={ROUTES.SETTINGS} 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      <Settings size={18} />
                      <span>الإعدادات</span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 rounded-xl transition-colors mt-1"
                    >
                      <LogOut size={18} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main role="main" aria-label="المحتوى الرئيسي" className="p-4 md:p-8 print:p-0 overflow-x-hidden print:overflow-visible print:w-full">
          <Breadcrumbs />
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex justify-center items-center h-64 w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-secondary font-bold animate-pulse text-sm">جاري التحميل...</p>
                </div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Collapsed Sidebar Flyout Menu - Rendered at top level so it is NEVER clipped */}
      <AnimatePresence>
        {!isSidebarOpen && hoveredGroupFlyout && (
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 12 : -12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isRtl ? 12 : -12, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
            style={{
              position: 'fixed',
              top: hoveredGroupFlyout.top,
              [isRtl ? 'right' : 'left']: '5.25rem',
              transform: 'translateY(-50%)',
            }}
            className="z-50 min-w-[210px] max-w-[280px] bg-surface-container-highest/95 backdrop-blur-md rounded-2xl shadow-2xl border border-outline-variant/30 p-2 text-foreground no-print"
          >
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 border-b border-outline-variant/20 mb-1.5">
              <hoveredGroupFlyout.group.icon size={18} className="text-primary shrink-0" />
              <span className="text-xs font-black text-primary truncate">
                {hoveredGroupFlyout.group.title}
              </span>
            </div>
            <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto no-scrollbar">
              {hoveredGroupFlyout.group.items.map((item) => {
                const isActive = !item.external && location.pathname === item.path;
                const ItemIcon = item.icon;
                
                if (item.external) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-secondary hover:bg-secondary-container/40 hover:text-primary transition-colors"
                    >
                      <ItemIcon size={15} className="shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setHoveredGroupFlyout(null)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors",
                      isActive
                        ? "bg-primary text-on-primary shadow-xs font-black"
                        : "text-secondary hover:bg-secondary-container/40 hover:text-primary"
                    )}
                  >
                    <ItemIcon size={15} className="shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Sub-Item Single Tooltip */}
      <AnimatePresence>
        {!isSidebarOpen && hoveredItemTooltip && !hoveredGroupFlyout && (
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 8 : -8 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed',
              top: hoveredItemTooltip.top,
              [isRtl ? 'right' : 'left']: '5.25rem',
              transform: 'translateY(-50%)',
            }}
            className="z-50 px-3 py-1.5 bg-surface-container-highest/95 backdrop-blur-md text-primary text-xs font-black rounded-xl shadow-xl border border-outline-variant/30 whitespace-nowrap pointer-events-none no-print"
          >
            {hoveredItemTooltip.name}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* QR Scanner Modal Placeholder */}
      <AnimatePresence>
        {isQRScannerOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQRScannerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-surface w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-outline/10"
            >
              <div className="p-6 flex justify-between items-center border-b border-outline/5">
                <h3 className="text-xl font-black text-primary flex items-center gap-2">
                  <QrCode size={24} />
                  ماسح الرموز
                </h3>
                <button onClick={() => setIsQRScannerOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center gap-6">
                <div className="w-64 h-64 bg-black rounded-3xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-4 border-2 border-primary/50 rounded-2xl animate-pulse"></div>
                  <div className="w-full h-0.5 bg-primary absolute top-1/2 -translate-y-1/2 animate-scan shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"></div>
                  <p className="text-white/50 text-[10px] font-bold">جاري البحث عن رمز QR...</p>
                </div>
                <p className="text-center text-sm text-secondary font-medium">
                  وجه الكاميرا نحو رمز الاستجابة السريعة (QR Code) الملصق على الجهاز أو المادة الكيميائية
                </p>
                <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold hover:shadow-lg transition-all">
                  تشغيل الكاميرا
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
