import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';

const LAST_HUB_STORAGE_KEY = 'mekhbari_last_visited_hub';

const HUB_SLUGS = new Set([
  'inventory',
  'pedagogical',
  'safety-hub',
  'scientific-hub',
  'settings-hub',
]);

export const routeMap: Record<string, string> = {
  // Portals & Core
  'teacher-portal': 'فضاء الأستاذ',
  'censor-portal': 'فضاء الناظر',
  'director-portal': 'فضاء مدير المؤسسة',
  'economist-portal': 'فضاء المقتصد',
  'admin': 'إدارة النظام المركزية',

  // Main Hubs
  'inventory': 'إدارة المخزون والجرد',
  'pedagogical': 'المتابعة البيداغوجية',
  'safety-hub': 'فضاء الأمن والسلامة',
  'scientific-hub': 'الفضاء العلمي والمحاكاة',
  'settings-hub': 'الإدارة والإعدادات',

  // Inventory & Stock
  'chemicals': 'المخزن الكيميائي والكواشف',
  'glassware-store': 'مخزن الزجاجيات وبطاقات المخزون',
  'equipment': 'سجل العتاد والتجهيزات',
  'inventory-cards': 'سجل بطاقات الجرد',
  'tech-inventory': 'جرد التجهيزات التقنية',
  'consumables-sds': 'جرد المستهلكات وبطاقات SDS',
  'glassware-breakage': 'سجل الزجاجيات والكسور',
  'chemical-storage': 'مصفوفة التوافق الكيميائي',
  'chemical-waste': 'إدارة النفايات الكيميائية',
  'maintenance': 'الصيانة والمعايرة',
  'scrapping': 'إسقاط وتكهين التجهيزات',
  'loan-request': 'إعارة الوسائل والأجهزة',
  'qr-print-center': 'مركز الطباعة (QR)',
  'calculators': 'الحاسبة المخبرية والمحاليل',

  // Pedagogical & Scheduling
  'daily-report': 'التقارير اليومية للمخبر',
  'lab-assistant': 'المساعد المخبري الذكي',
  'lab-experiments': 'سجل التجارب المخبرية',
  'teachers': 'فريق الأساتذة',
  'timetable': 'جدولة الحصص الأسبوعية',
  'lab-schedule': 'جدول استعمال المخابر',
  'pedagogical-tracking': 'المتابعة البيداغوجية المستمرة',
  'follow-up-registry': 'سجل المتابعة والوسائل',
  'student-groups': 'تسيير الأفواج التربوية',
  'educational-map': 'الخريطة التربوية للمؤسسة',
  'smart-forms': 'المولد الذكي للنماذج',
  'activity-request': 'طلب نشاط تطبيقي',
  'sync': 'مزامنة الحصص والتحضير',
  'worksheet-generator': 'مولد أوراق العمل',
  'document-library': 'المكتبة الرقمية والوثائق',
  'school-legislation': 'التشريع المدرسي والقوانين',
  'archive': 'الأرشيف الرقمي',

  // Safety
  'safety': 'الأمن والسلامة وسجل الحوادث',
  'safety-guide': 'دليل السلامة الشامل',

  // Scientific & Virtual Labs
  'periodic-table': 'الجدول الدوري التفاعلي',
  'chemistry-tools': 'أدوات الكيمياء',
  'atom-3d': 'مجسمات الذرات 3D',
  'virtual-lab': 'المخبر الافتراضي',
  'exao': 'التجريب بالحاسوب (EXAO)',
  'physics-simulations': 'محاكاة فيزيائية تفاعلية',
  'virtual-microscope': 'المجهر الافتراضي',
  'scientific-calculator': 'الآلة الحاسبة العلمية',
  'molecular-viewer': 'عارض الجزيئات 3D',
  'astronomy': 'الفضاء وعلم الفلك',
  'earth-sciences': 'علوم الأرض والجيولوجيا',
  'anatomy': 'نماذج التشريح 3D',

  // Management & System
  'administrative-documents': 'نماذج الوثائق الإدارية',
  'settings': 'الإعدادات الشخصية والمؤسسة',
  'backup': 'مركز النسخ الاحتياطي',
  'backup-center': 'مركز النسخ والبيانات',
  'database-management': 'إدارة وصيانة قاعدة البيانات',
  'reports': 'التقارير الإحصائية الرسمية',
  'budget-purchases': 'الميزانية والطلبيات',
  'professional-exams': 'الامتحانات والمسابقات المهنية',
  'important-links': 'موارد وروابط هامة',
  'diagnostic': 'تشخيص النظام والاتصال',
  'design-system': 'نظام التصميم والواجهة',
  'support': 'الدعم الفني والاقتراحات',

  // Legal / Info
  'privacy-policy': 'سياسة الخصوصية',
  'data-deletion': 'حذف البيانات',
  'terms-of-service': 'شروط الاستخدام',
};

// Primary default parent hub for each route slug
const parentMap: Record<string, string> = {
  // Inventory Hub
  'chemicals': 'inventory',
  'glassware-store': 'inventory',
  'equipment': 'inventory',
  'inventory-cards': 'inventory',
  'chemical-storage': 'inventory',
  'tech-inventory': 'inventory',
  'consumables-sds': 'inventory',
  'glassware-breakage': 'inventory',
  'maintenance': 'inventory',
  'scrapping': 'inventory',
  'loan-request': 'inventory',
  'qr-print-center': 'inventory',
  'calculators': 'inventory',

  // Pedagogical Hub
  'daily-report': 'pedagogical',
  'lab-assistant': 'pedagogical',
  'lab-experiments': 'pedagogical',
  'teachers': 'pedagogical',
  'timetable': 'pedagogical',
  'lab-schedule': 'pedagogical',
  'pedagogical-tracking': 'pedagogical',
  'follow-up-registry': 'pedagogical',
  'student-groups': 'pedagogical',
  'educational-map': 'pedagogical',
  'smart-forms': 'pedagogical',
  'activity-request': 'pedagogical',
  'sync': 'pedagogical',
  'worksheet-generator': 'pedagogical',
  'document-library': 'pedagogical',
  'school-legislation': 'pedagogical',
  'archive': 'pedagogical',

  // Safety Hub
  'safety': 'safety-hub',
  'safety-guide': 'safety-hub',
  'chemical-waste': 'safety-hub',

  // Scientific Hub
  'periodic-table': 'scientific-hub',
  'chemistry-tools': 'scientific-hub',
  'atom-3d': 'scientific-hub',
  'virtual-lab': 'scientific-hub',
  'exao': 'scientific-hub',
  'physics-simulations': 'scientific-hub',
  'virtual-microscope': 'scientific-hub',
  'scientific-calculator': 'scientific-hub',
  'molecular-viewer': 'scientific-hub',
  'astronomy': 'scientific-hub',
  'earth-sciences': 'scientific-hub',
  'anatomy': 'scientific-hub',

  // Management & Settings Hub
  'administrative-documents': 'settings-hub',
  'settings': 'settings-hub',
  'backup-center': 'settings-hub',
  'database-management': 'settings-hub',
  'reports': 'settings-hub',
  'budget-purchases': 'settings-hub',
  'professional-exams': 'settings-hub',
  'important-links': 'settings-hub',
  'diagnostic': 'settings-hub',
  'design-system': 'settings-hub',
  'support': 'settings-hub',
  'admin': 'settings-hub',
};

// All valid parent hubs for shared routes (used to preserve the user's actual hub trail)
const validParentsMap: Record<string, string[]> = {
  'chemical-storage': ['inventory', 'safety-hub'],
  'consumables-sds': ['inventory', 'safety-hub'],
  'glassware-breakage': ['inventory', 'safety-hub'],
  'chemical-waste': ['safety-hub', 'inventory'],
  'maintenance': ['inventory', 'safety-hub'],
  'scrapping': ['inventory', 'safety-hub'],
  'calculators': ['inventory', 'pedagogical', 'scientific-hub'],
  'educational-map': ['pedagogical', 'scientific-hub'],
  'worksheet-generator': ['pedagogical', 'scientific-hub'],
  'document-library': ['pedagogical', 'settings-hub'],
  'school-legislation': ['pedagogical', 'safety-hub', 'settings-hub'],
  'archive': ['pedagogical', 'settings-hub'],
  'budget-purchases': ['settings-hub', 'inventory'],
};

function getLastVisitedHub(): string | null {
  try {
    return sessionStorage.getItem(LAST_HUB_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setLastVisitedHub(hub: string) {
  try {
    sessionStorage.setItem(LAST_HUB_STORAGE_KEY, hub);
  } catch {
    // ignore storage errors
  }
}

export default function Breadcrumbs() {
  const location = useLocation();
  const { currentRole, roleConfig } = useUserRole();

  const homePath = roleConfig?.defaultPath || ROUTES.HOME;
  const cleanPathname = location.pathname.replace(/\/+$/, '') || '/';
  const pathParts = cleanPathname.split('/').filter(Boolean);

  // Track last visited hub for accurate contextual parent trails on shared routes
  useEffect(() => {
    if (pathParts.length === 1 && HUB_SLUGS.has(pathParts[0])) {
      setLastVisitedHub(pathParts[0]);
    } else if (cleanPathname === homePath || cleanPathname === ROUTES.HOME) {
      try {
        sessionStorage.removeItem(LAST_HUB_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [cleanPathname, homePath, pathParts]);

  // Hide breadcrumbs on root / user's primary portal page
  if (pathParts.length === 0 || cleanPathname === homePath) {
    return null;
  }

  const currentSlug = pathParts[pathParts.length - 1];

  // Resolve parent hub dynamically based on navigation context & current user role permissions
  const resolveParentHub = (slug: string): string | undefined => {
    const candidateHubs = validParentsMap[slug] || (parentMap[slug] ? [parentMap[slug]] : []);
    if (candidateHubs.length === 0) return undefined;

    const lastHub = getLastVisitedHub();
    if (
      lastHub &&
      candidateHubs.includes(lastHub) &&
      isRouteAllowedForRole(currentRole, `/${lastHub}`)
    ) {
      return lastHub;
    }

    const firstPermittedHub = candidateHubs.find((hub) =>
      isRouteAllowedForRole(currentRole, `/${hub}`)
    );
    return firstPermittedHub;
  };

  // Build clean logical trail: [optional permitted parent hub, ...actual route segments]
  const logicalPaths: string[] = [];

  if (pathParts.length > 1) {
    // Nested route segments (preserve literal subpath hierarchy, prepend hub if permitted)
    const rootSegment = pathParts[0];
    const resolvedParent = resolveParentHub(rootSegment);
    if (resolvedParent && resolvedParent !== rootSegment) {
      logicalPaths.push(resolvedParent);
    }
    pathParts.forEach((seg) => logicalPaths.push(seg));
  } else {
    const resolvedParent = resolveParentHub(currentSlug);
    if (resolvedParent && resolvedParent !== currentSlug) {
      logicalPaths.push(resolvedParent);
    }
    logicalPaths.push(currentSlug);
  }

  const homeLabel =
    homePath === ROUTES.HOME ? 'الرئيسية' : routeMap[homePath.replace(/^\//, '')] || 'الرئيسية';

  return (
    <nav className="flex mb-6 no-print" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5 text-start">
        <li className="flex items-center">
          <Link
            to={homePath}
            className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <Home size={14} className="shrink-0" />
            <span>{homeLabel}</span>
          </Link>
        </li>

        {logicalPaths.map((slug, index) => {
          const isLast = index === logicalPaths.length - 1;
          const routeTo =
            pathParts.length > 1 && index > (logicalPaths.length - pathParts.length)
              ? `/${pathParts.slice(0, index - (logicalPaths.length - pathParts.length) + 1).join('/')}`
              : `/${slug}`;
          const displayName = routeMap[slug] || slug;

          return (
            <li key={`${slug}-${index}`} className="flex items-center">
              <ChevronLeft
                size={14}
                className="text-outline/40 mx-1 shrink-0 rtl:rotate-0 ltr:rotate-180"
              />
              {isLast ? (
                <span className="text-primary font-black text-xs" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-secondary hover:text-primary transition-colors text-xs font-bold"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
