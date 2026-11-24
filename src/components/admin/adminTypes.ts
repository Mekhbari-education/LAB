import { UserRole } from '../../context/UserRoleContext';
import { ROUTES } from '../../config/routes';

export type AdminWorkspaceId =
  | 'overview'
  | 'lab_oversight'
  | 'users'
  | 'policies'
  | 'schools'
  | 'announcements'
  | 'tickets'
  | 'purchases'
  | 'audit'
  | 'flags'
  | 'explorer';

export interface AdminUser {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: string;
  roleOverride?: string;
  roleTitle?: string;
  schoolId?: string;
  institution?: string;
  wilaya?: string;
  directorate?: string;
  commune?: string;
  educationLevel?: string;
  grade?: string;
  gradeCode?: string;
  corps?: string;
  nationalId?: string;
  phone?: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLogin?: any;
  disabled?: boolean;
}

export interface UserSettings {
  school?: string;
  schoolName?: string;
  directorate?: string;
  directorateName?: string;
  commune?: string;
  communeName?: string;
  cycle?: string;
  jobTitle?: string;
  employeeId?: string;
  address?: string;
  grade?: string;
  specialty?: string;
  schoolLogo?: string;
  profilePhoto?: string;
  updatedAt?: string;
}

export interface RegisteredSchool {
  id: string;
  name?: string;
  wilaya?: string;
  commune?: string;
  directorate?: string;
  educationLevel?: string;
  academicYear?: string;
  directorName?: string;
  directorEmail?: string;
  phone?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SupportTicket {
  id: string;
  title?: string;
  subject?: string;
  description?: string;
  message?: string;
  category?: string;
  type?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'new' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending';
  userId?: string;
  userEmail?: string;
  userName?: string;
  schoolName?: string;
  createdAt?: any;
  adminReply?: string;
  adminRepliedAt?: any;
}

export interface PurchaseOrder {
  id: string;
  schoolId?: string;
  orderNumber?: string;
  schoolName?: string;
  supplierName?: string;
  total?: number;
  subtotal?: number;
  status?: string;
  date?: any;
  items?: any[];
  notes?: string;
  createdAt?: any;
  sourceCollection?: 'purchase_orders' | 'purchase_requests';
}

export type AnnouncementScope = 'all' | 'wilaya' | 'cycle' | 'role';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'urgent' | 'technical' | 'pedagogical' | 'update';
  priority: 'normal' | 'high';
  createdAt?: any;
  authorName?: string;
  active?: boolean;
  targetScope?: AnnouncementScope;
  targetValues?: string[];
  expiresAt?: string;
}

export interface SystemActivityLog {
  id: string;
  schoolId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action?: string;
  module?: string;
  details?: string;
  targetId?: string;
  timestamp?: any;
}

export interface DiagnosticLogItem {
  id: string;
  timestamp?: any;
  testBy?: string;
  userAgent?: string;
  message?: string;
  databaseId?: string;
}

export interface OwnerAuditLogItem {
  id: string;
  action: string;
  actorEmail?: string;
  targetType?: string;
  targetIds?: string[];
  summary: string;
  details?: Record<string, any>;
  timestamp?: any;
}

export interface DelegatedAdminEntry {
  id: string;
  email?: string;
  name?: string;
  active?: boolean;
  grantedBy?: string;
  updatedAt?: any;
}

export interface CrossSchoolChemical {
  id: string;
  schoolId: string;
  name?: string;
  nameAr?: string;
  formula?: string;
  quantity?: number;
  minQuantity?: number;
  unit?: string;
  expiryDate?: string;
  hazardClass?: string;
  ghs?: string[];
}

export interface CrossSchoolEquipment {
  id: string;
  schoolId: string;
  name?: string;
  type?: string;
  status?: string;
  totalQuantity?: number;
  availableQuantity?: number;
  brokenQuantity?: number;
}

export interface CrossSchoolIncident {
  id: string;
  schoolId: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  date?: any;
  createdAt?: any;
}

export interface CrossSchoolReport {
  id: string;
  schoolId: string;
  title?: string;
  createdAt?: any;
}

export interface SchoolHealthScore {
  id: string;
  name: string;
  wilaya: string;
  directorate: string;
  commune: string;
  cycle: string;
  staffCount: number;
  chemicalsCount: number;
  lowStockCount: number;
  expiredChemicalsCount: number;
  equipmentCount: number;
  brokenEquipmentCount: number;
  openIncidentsCount: number;
  reportsCount: number;
  totalScore: number;
  pillars: {
    profileScore: number;   // max 25
    staffScore: number;     // max 20
    safetyStockScore: number; // max 35
    reportingScore: number; // max 20
  };
  gradeLabel: 'ممتاز · Optimal' | 'مستقر · Stable' | 'يحتاج متابعة · Watch' | 'حرج · Critical';
}

export interface AIInsightsResponse {
  executiveSummary: string;
  riskLevel: 'nominal' | 'elevated' | 'critical';
  anomalies: {
    title: string;
    severity: 'info' | 'warning' | 'critical';
    category: string;
    evidence: string;
    affectedTarget: string;
    recommendation: string;
  }[];
  actionItems: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    targetWorkspace: string;
  }[];
}

export const WORKSPACE_ROLE_KEYS: UserRole[] = [
  'lab_manager',
  'director',
  'censor',
  'teacher',
  'economist',
];

export const ROUTE_ARABIC_LABELS: Record<string, string> = {
  [ROUTES.HOME]: 'لوحة القيادة الرئيسية',
  [ROUTES.TEACHER_PORTAL]: 'فضاء الأستاذ',
  [ROUTES.CENSOR_PORTAL]: 'فضاء الناظر',
  [ROUTES.DIRECTOR_PORTAL]: 'فضاء مدير المؤسسة',
  [ROUTES.ECONOMIST_PORTAL]: 'فضاء المقتصد',
  [ROUTES.INVENTORY_DASHBOARD]: 'لوحة الجرد الشاملة',
  [ROUTES.PEDAGOGICAL_DASHBOARD]: 'اللوحة البيداغوجية',
  [ROUTES.SAFETY_HUB]: 'قطب الأمن والسلامة',
  [ROUTES.SCIENTIFIC_HUB]: 'فضاء الموارد العلمية',
  [ROUTES.SETTINGS_HUB]: 'الإدارة والإعدادات',
  [ROUTES.CHEMICALS]: 'الكواشف الكيميائية',
  [ROUTES.GLASSWARE_STORE]: 'مخزن الزجاجيات',
  [ROUTES.EQUIPMENT]: 'التجهيزات المخبرية',
  [ROUTES.INVENTORY_CARDS]: 'سجل بطاقات الجرد',
  [ROUTES.TECH_INVENTORY]: 'جرد التجهيزات التقنية',
  [ROUTES.CONSUMABLES_SDS]: 'المستهلكات وبطاقات الأمان',
  [ROUTES.GLASSWARE_BREAKAGE]: 'الزجاجيات والكسور',
  [ROUTES.CHEMICAL_STORAGE]: 'مصفوفة التخزين الكيميائي',
  [ROUTES.MAINTENANCE]: 'الصيانة والمعايرة',
  [ROUTES.SCRAPPING]: 'إسقاط التجهيزات',
  [ROUTES.LOAN_REQUEST]: 'إعارة الوسائل',
  [ROUTES.QR_PRINT_CENTER]: 'مركز طباعة QR',
  [ROUTES.CALCULATORS]: 'الحاسبة المخبرية',
  [ROUTES.DAILY_REPORT]: 'التقارير اليومية',
  [ROUTES.LAB_ASSISTANT]: 'المساعد المخبري الذكي',
  [ROUTES.LAB_EXPERIMENTS]: 'سجل التجارب المخبرية',
  [ROUTES.TEACHERS]: 'فريق الأساتذة',
  [ROUTES.DOCUMENT_LIBRARY]: 'المكتبة الرقمية',
  [ROUTES.SCHOOL_LEGISLATION]: 'التشريع المدرسي',
  [ROUTES.TIMETABLE]: 'استعمال الزمن',
  [ROUTES.LAB_SCHEDULE]: 'جدول المخابر',
  [ROUTES.PEDAGOGICAL_TRACKING]: 'المتابعة البيداغوجية',
  [ROUTES.FOLLOW_UP_REGISTRY]: 'سجل المتابعة',
  [ROUTES.STUDENT_GROUPS]: 'أفواج التلاميذ',
  [ROUTES.ACTIVITY_REQUEST]: 'طلب نشاط تطبيقي',
  [ROUTES.SMART_FORMS]: 'النماذج الذكية',
  [ROUTES.ARCHIVE]: 'الأرشيف الرقمي',
  [ROUTES.SYNC]: 'المزامنة',
  [ROUTES.WORKSHEET_GENERATOR]: 'مولد أوراق العمل',
  [ROUTES.SAFETY]: 'السلامة المخبرية',
  [ROUTES.SAFETY_GUIDE]: 'دليل الوقاية',
  [ROUTES.CHEMICAL_WASTE]: 'تسيير النفايات الكيميائية',
  [ROUTES.EDUCATIONAL_MAP]: 'الخريطة التربوية',
  [ROUTES.PERIODIC_TABLE]: 'الجدول الدوري',
  [ROUTES.ATOM_3D]: 'الذرة ثلاثية الأبعاد',
  [ROUTES.CHEMISTRY_TOOLS]: 'أدوات الكيمياء',
  [ROUTES.VIRTUAL_LAB]: 'المخبر الافتراضي',
  [ROUTES.EXAO]: 'التجريب المدعم بالحاسوب ExAO',
  [ROUTES.PHYSICS_SIMULATIONS]: 'محاكاة الفيزياء',
  [ROUTES.VIRTUAL_MICROSCOPE]: 'المجهر الافتراضي',
  [ROUTES.SCIENTIFIC_CALCULATOR]: 'الآلة الحاسبة العلمية',
  [ROUTES.MOLECULAR_VIEWER]: 'عارض الجزيئات',
  [ROUTES.ASTRONOMY]: 'علم الفلك',
  [ROUTES.EARTH_SCIENCES]: 'علوم الأرض',
  [ROUTES.ANATOMY]: 'التشريح ثلاثي الأبعاد',
  [ROUTES.ADMIN_TEMPLATES]: 'نماذج الوثائق الإدارية',
  [ROUTES.SETTINGS]: 'الإعدادات الشخصية',
  [ROUTES.BACKUP_CENTER]: 'مركز النسخ الاحتياطي',
  [ROUTES.DATABASE_MANAGEMENT]: 'إدارة قاعدة البيانات',
  [ROUTES.REPORTS]: 'التقارير الإحصائية',
  [ROUTES.BUDGET_PURCHASES]: 'الميزانية والطلبيات',
  [ROUTES.PROFESSIONAL_EXAMS]: 'الامتحانات المهنية',
  [ROUTES.IMPORTANT_LINKS]: 'روابط هامة',
  [ROUTES.DIAGNOSTIC]: 'تشخيص الاتصال',
  [ROUTES.DESIGN_SYSTEM]: 'نظام التصميم',
  [ROUTES.SUPPORT]: 'الدعم والاقتراحات',
};

export function getTimestampMs(ts: any): number {
  if (!ts) return 0;
  if (typeof ts?.toMillis === 'function') return ts.toMillis();
  if (typeof ts?.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts?.seconds === 'number') return ts.seconds * 1000;
  const parsed = new Date(ts).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatDateTime(ts: any): string {
  const ms = getTimestampMs(ts);
  if (!ms) return '—';
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

export function resolveEffectiveWorkspaceRole(u: AdminUser): UserRole {
  const candidate = String(u.roleOverride || u.role || '').trim().toLowerCase();
  if (WORKSPACE_ROLE_KEYS.includes(candidate as UserRole)) {
    return candidate as UserRole;
  }
  return 'lab_manager';
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function isExpiredDate(dateStr?: string): boolean {
  if (!dateStr) return false;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}

export function computeSchoolHealthScores(params: {
  registeredSchools: RegisteredSchool[];
  settingsMap: Record<string, UserSettings>;
  users: AdminUser[];
  chemicals: CrossSchoolChemical[];
  equipment: CrossSchoolEquipment[];
  incidents: CrossSchoolIncident[];
  reports: CrossSchoolReport[];
}): SchoolHealthScore[] {
  const { registeredSchools, settingsMap, users, chemicals, equipment, incidents, reports } = params;

  type Acc = {
    id: string;
    name: string;
    wilaya: string;
    directorate: string;
    commune: string;
    cycle: string;
    staffIds: Set<string>;
    schoolKeys: Set<string>;
  };

  const map = new Map<string, Acc>();

  registeredSchools.forEach((sch) => {
    const name = (sch.name || '').trim();
    if (!name) return;
    const key = name.toLowerCase();
    const cycle =
      sch.educationLevel === 'CEM' ? 'متوسط' : sch.educationLevel === 'Lycée' ? 'ثانوي' : 'ثانوي';
    map.set(key, {
      id: sch.id,
      name,
      wilaya: sch.wilaya || sch.directorate || 'غير محددة',
      directorate: sch.directorate || sch.wilaya || 'مديرية التربية',
      commune: sch.commune || '',
      cycle,
      staffIds: new Set<string>(),
      schoolKeys: new Set<string>([sch.id]),
    });
  });

  users.forEach((u) => {
    const s = settingsMap[u.id] || {};
    const inst = (u.institution || s.schoolName || s.school || '').trim();
    if (!inst) return;
    const key = inst.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: u.schoolId || u.id,
        name: inst,
        wilaya: u.wilaya || u.directorate || s.directorateName || s.directorate || 'غير محددة',
        directorate: u.directorate || s.directorateName || s.directorate || 'مديرية التربية',
        commune: u.commune || s.communeName || s.commune || '',
        cycle: u.educationLevel === 'CEM' ? 'متوسط' : s.cycle || 'ثانوي',
        staffIds: new Set<string>(),
        schoolKeys: new Set<string>(),
      });
    }
    const entry = map.get(key)!;
    entry.staffIds.add(u.id);
    if (u.schoolId) entry.schoolKeys.add(u.schoolId);
    entry.schoolKeys.add(u.id);
  });

  Object.entries(settingsMap).forEach(([uid, s]) => {
    const inst = (s.schoolName || s.school || '').trim();
    if (!inst) return;
    const key = inst.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: uid,
        name: inst,
        wilaya: s.directorateName || s.directorate || 'غير محددة',
        directorate: s.directorateName || s.directorate || 'مديرية التربية',
        commune: s.communeName || s.commune || '',
        cycle: s.cycle || 'ثانوي',
        staffIds: new Set<string>([uid]),
        schoolKeys: new Set<string>([uid]),
      });
    } else {
      const entry = map.get(key)!;
      entry.staffIds.add(uid);
      entry.schoolKeys.add(uid);
    }
  });

  const results: SchoolHealthScore[] = [];

  map.forEach((entry) => {
    const matchesSchool = (sid: string) => entry.schoolKeys.has(sid) || sid === entry.id;

    const schChems = chemicals.filter((c) => matchesSchool(c.schoolId));
    const schEquip = equipment.filter((e) => matchesSchool(e.schoolId));
    const schIncidents = incidents.filter((inc) => matchesSchool(inc.schoolId));
    const schReports = reports.filter((r) => matchesSchool(r.schoolId));

    const lowStockCount = schChems.filter((c) => Number(c.quantity ?? 0) <= Number(c.minQuantity ?? 5)).length;
    const expiredChemicalsCount = schChems.filter((c) => isExpiredDate(c.expiryDate)).length;
    const brokenEquipmentCount = schEquip.filter(
      (e) => e.status === 'broken' || e.status === 'maintenance' || Number(e.brokenQuantity ?? 0) > 0
    ).length;
    const openIncidentsCount = schIncidents.filter(
      (i) => i.status !== 'resolved' && i.status !== 'closed'
    ).length;

    // 1. Profile completeness (max 25)
    let profileScore = 10;
    if (entry.directorate && entry.directorate !== 'مديرية التربية') profileScore += 6;
    if (entry.commune) profileScore += 5;
    if (entry.cycle) profileScore += 4;

    // 2. Staff coverage (max 20)
    const staffCount = entry.staffIds.size;
    const staffScore = staffCount >= 3 ? 20 : staffCount === 2 ? 15 : staffCount === 1 ? 10 : 0;

    // 3. Safety & Inventory Hygiene (max 35)
    let safetyStockScore = 20;
    if (schChems.length > 0 || schEquip.length > 0) safetyStockScore += 15;
    safetyStockScore -= Math.min(12, expiredChemicalsCount * 4);
    safetyStockScore -= Math.min(8, lowStockCount * 2);
    safetyStockScore -= Math.min(10, openIncidentsCount * 5);
    safetyStockScore -= Math.min(6, brokenEquipmentCount * 2);
    safetyStockScore = Math.max(0, safetyStockScore);

    // 4. Reporting cadence (max 20)
    const reportingScore =
      schReports.length >= 3 ? 20 : schReports.length === 2 ? 15 : schReports.length === 1 ? 10 : 5;

    const totalScore = Math.min(100, Math.max(0, profileScore + staffScore + safetyStockScore + reportingScore));

    const gradeLabel: SchoolHealthScore['gradeLabel'] =
      totalScore >= 80
        ? 'ممتاز · Optimal'
        : totalScore >= 60
        ? 'مستقر · Stable'
        : totalScore >= 40
        ? 'يحتاج متابعة · Watch'
        : 'حرج · Critical';

    results.push({
      id: entry.id,
      name: entry.name,
      wilaya: entry.wilaya,
      directorate: entry.directorate,
      commune: entry.commune,
      cycle: entry.cycle,
      staffCount,
      chemicalsCount: schChems.length,
      lowStockCount,
      expiredChemicalsCount,
      equipmentCount: schEquip.length,
      brokenEquipmentCount,
      openIncidentsCount,
      reportsCount: schReports.length,
      totalScore,
      pillars: {
        profileScore,
        staffScore,
        safetyStockScore,
        reportingScore,
      },
      gradeLabel,
    });
  });

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
