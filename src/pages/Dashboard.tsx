import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { logger } from '../services/loggingService';
import { useSchool } from '../context/SchoolContext';
import { onSnapshot, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getUserCollection, auth, checkIsAdmin } from '../firebase';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ensureApiKey, getEquipmentIntelligence } from '../services/geminiService';
import { useSqlCollection } from '../hooks/useSqlCollection';
import { LabReservation } from '../lib/api/labSchedule';
import { 
  FileText, 
  FlaskConical, 
  Users, 
  BookOpen, 
  ShieldAlert, 
  AlertTriangle,
  Hammer,
  ArrowLeft,
  Sparkles,
  FileUp,
  Database,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Atom,
  Settings,
  ShieldCheck,
  Bell,
  BarChart3,
  Wrench,
  Microscope,
  CalendarCheck,
  ArrowUpRight,
  FileDown,
  Building2,
  FileCheck,
  GraduationCap,
  Wallet,
  FileSpreadsheet,
  Coins
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';
import { ROUTES } from '../config/routes';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart, 
  Pie
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────
interface Report {
  id: string;
  createdAt?: { seconds: number };
  date?: string;
  className?: string;
  teacherName?: string;
  observations?: string;
}

interface ChemicalItem {
  id: string;
  nameAr?: string;
  nameEn?: string;
  quantity?: number;
  unit?: string;
  expiryDate?: string;
  hazardClass?: string;
  shelf?: string;
}

interface EquipmentItem {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  serialNumber?: string;
  location?: string;
}

interface SafetyIncidentItem {
  id: string;
  title?: string;
  severity?: string;
  date?: string;
  status?: string;
}

interface GraphDataPoint {
  name: string;
  count: number;
}

// ── KPI Card Component ─────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  badgeType?: 'default' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

const KPICard = memo(({ title, value, subtitle, icon: Icon, badge, badgeType = 'default', onClick }: KPICardProps) => {
  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className="bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
          <Icon size={24} />
        </div>
        {badge && (
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-md tracking-tight",
            badgeType === 'error' && "bg-error/10 text-error",
            badgeType === 'warning' && "bg-amber-500/10 text-amber-700",
            badgeType === 'success' && "bg-emerald-600/10 text-emerald-700",
            badgeType === 'default' && "bg-primary/10 text-primary"
          )}>
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-on-surface/60 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-primary font-mono tabular-nums tracking-tight">
            {value}
          </span>
        </div>
        <p className="text-xs text-on-surface/70 mt-2 truncate font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
});
KPICard.displayName = 'KPICard';

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { schoolId } = useSchool();
  const { currentRole, roleConfig, userProfile, teacherProfile } = useUserRole();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clock & Dates
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateAr, setCurrentDateAr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateAr(now.toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Strict role enforcement: If role is not lab_manager, redirect to their dedicated portal
  useEffect(() => {
    if (currentRole && currentRole !== 'lab_manager') {
      const target = roleConfig?.defaultPath;
      if (target && target !== ROUTES.HOME) {
        navigate(target, { replace: true });
      }
    }
  }, [currentRole, roleConfig, navigate]);

  // Today's Arabic Day name for schedule matching
  const todayArabicDay = useMemo(() => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[new Date().getDay()];
  }, []);

  // Operation States
  const [isImporting, setIsImporting] = useState(false);
  const [isSmartUpdating, setIsSmartUpdating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Active filters and views
  const [alertsTab, setAlertsTab] = useState<'all' | 'stock' | 'expiry' | 'maintenance' | 'incidents'>('all');
  const [chartView, setChartView] = useState<'weekly' | 'equipment'>('weekly');

  // Counts & Data State
  const [counts, setCounts] = useState({
    reports: 0,
    equipment: 0,
    functionalEquip: 0,
    chemicals: 0,
    teachers: 0,
    incidents: 0,
    lowStock: 0,
    brokenEquip: 0,
    experiments: 0,
    expiringSoon: 0
  });

  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [lowStockItems, setLowStockItems] = useState<ChemicalItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<ChemicalItem[]>([]);
  const [brokenItems, setBrokenItems] = useState<EquipmentItem[]>([]);
  const [incidentList, setIncidentList] = useState<SafetyIncidentItem[]>([]);

  // Fetch Lab Schedule from SQL
  const { data: rawReservations, loading: scheduleLoading } = 
    useSqlCollection<LabReservation>('lab_schedule', '/api/db/lab-schedule');

  const todaySessions = useMemo(() => {
    if (!Array.isArray(rawReservations)) return [];
    return rawReservations.filter(r => r.day === todayArabicDay && r.status !== 'cancelled');
  }, [rawReservations, todayArabicDay]);

  // Firestore Subscriptions
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    checkIsAdmin(auth.currentUser).then(setIsAdmin);

    const unsubReports = onSnapshot(getUserCollection(schoolId, 'reports'), (snap) => {
      setCounts(prev => ({ ...prev, reports: snap.size }));
      const reports = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Report))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 4);
      setRecentReports(reports);
    }, (err) => logger.warn('Dashboard: Failed to load reports', err));

    const unsubExps = onSnapshot(getUserCollection(schoolId, 'experiment_logs'), (snap) => {
      setCounts(prev => ({ ...prev, experiments: snap.size }));
      
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
      const stats = days.map(day => ({ name: day, count: 0 }));
      
      snap.docs.forEach(docSnap => {
        const rawDate = docSnap.data().date;
        const d = rawDate?.toDate?.() || (rawDate ? new Date(rawDate) : null);
        if (d && !isNaN(d.getTime())) {
          const dayName = d.toLocaleDateString('ar-DZ', { weekday: 'long' });
          const idx = days.indexOf(dayName);
          if (idx !== -1) stats[idx].count++;
        }
      });
      setGraphData(stats);
    }, (err) => logger.warn('Dashboard: Failed to load experiment logs', err));

    const unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentItem));
      const broken = items.filter(d => ['broken', 'maintenance'].includes(d.status || ''));
      const functional = items.filter(d => d.status === 'functional');

      setCounts(prev => ({ 
        ...prev, 
        equipment: snap.size, 
        brokenEquip: broken.length, 
        functionalEquip: functional.length || (snap.size - broken.length)
      }));
      setBrokenItems(broken.slice(0, 6));
    }, (err) => logger.warn('Dashboard: Failed to load equipment', err));

    const unsubChem = onSnapshot(getUserCollection(schoolId, 'chemicals'), (snap) => {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);

      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChemicalItem));
      const low = items.filter(d => (d.quantity || 0) < 10);
      
      const expiring = items.filter(d => {
        if (!d.expiryDate) return false;
        const expDate = new Date(d.expiryDate);
        return expDate > today && expDate <= nextMonth;
      });

      setCounts(prev => ({ 
        ...prev, 
        chemicals: snap.size, 
        lowStock: low.length, 
        expiringSoon: expiring.length 
      }));
      setLowStockItems(low.slice(0, 6));
      setExpiringItems(expiring.slice(0, 6));
    }, (err) => logger.warn('Dashboard: Failed to load chemicals', err));

    const unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers'), (snap) => {
      setCounts(prev => ({ ...prev, teachers: snap.size }));
    }, (err) => logger.warn('Dashboard: Failed to load teachers', err));

    const unsubIncidents = onSnapshot(getUserCollection(schoolId, 'safety_incidents'), (snap) => {
      setCounts(prev => ({ ...prev, incidents: snap.size }));
      const incs = snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyIncidentItem));
      setIncidentList(incs.slice(0, 6));
    }, (err) => {
      logger.warn('Dashboard: Failed to load incidents', err);
    });

    return () => {
      unsubReports();
      unsubExps();
      unsubEquip();
      unsubChem();
      unsubTeachers();
      unsubIncidents();
    };
  }, [schoolId, auth.currentUser]);

  // Readiness Calculation
  const labReadinessPercent = useMemo(() => {
    if (counts.equipment === 0) return 100;
    const rate = Math.round((counts.functionalEquip / counts.equipment) * 100);
    return Math.min(Math.max(rate, 0), 100);
  }, [counts.equipment, counts.functionalEquip]);

  // Equipment Chart Data
  const equipmentStatusData = useMemo(() => {
    const functional = counts.functionalEquip || Math.max(counts.equipment - counts.brokenEquip, 0);
    const broken = counts.brokenEquip;
    return [
      { name: 'جاهز وسليم', value: functional, color: '#2b3d22' },
      { name: 'بحاجة صيانة أو تعطل', value: broken, color: '#dc2626' }
    ];
  }, [counts.functionalEquip, counts.equipment, counts.brokenEquip]);

  // Unified Alert List
  const activeAlerts = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      detail: string;
      category: 'stock' | 'expiry' | 'maintenance' | 'incidents';
      typeLabel: string;
      severity: 'warning' | 'error' | 'info';
      actionLabel: string;
      actionPath: string;
    }> = [];

    lowStockItems.forEach(item => {
      list.push({
        id: `low-${item.id}`,
        title: item.nameAr || 'مادة كيميائية',
        detail: `الكمية المتبقية: ${item.quantity ?? 0} ${item.unit || 'وحدة'} (أقل من الحد الأدنى)`,
        category: 'stock',
        typeLabel: 'نقص مخزون',
        severity: 'error',
        actionLabel: 'تعديل المخزون',
        actionPath: ROUTES.CHEMICALS
      });
    });

    expiringItems.forEach(item => {
      list.push({
        id: `exp-${item.id}`,
        title: item.nameAr || 'مادة كيميائية',
        detail: `تاريخ الانتهاء: ${item.expiryDate || 'قريب جداً'}`,
        category: 'expiry',
        typeLabel: 'قرب انتهاء',
        severity: 'warning',
        actionLabel: 'فحص المادة',
        actionPath: ROUTES.CHEMICALS
      });
    });

    brokenItems.forEach(item => {
      list.push({
        id: `brk-${item.id}`,
        title: item.name || 'جهاز مخبري',
        detail: `الرقم: ${item.serialNumber || 'غير محدد'} · الموقع: ${item.location || 'المخبر'}`,
        category: 'maintenance',
        typeLabel: 'عطل وصيانة',
        severity: 'error',
        actionLabel: 'سجل الصيانة',
        actionPath: ROUTES.MAINTENANCE
      });
    });

    incidentList.forEach(item => {
      list.push({
        id: `inc-${item.id}`,
        title: item.title || 'حادث سلامة مسجل',
        detail: `التاريخ: ${item.date || 'اليوم'} · الشدة: ${item.severity || 'متوسط'}`,
        category: 'incidents',
        typeLabel: 'بلاغ سلامة',
        severity: 'warning',
        actionLabel: 'سجل الحوادث',
        actionPath: ROUTES.SAFETY
      });
    });

    if (alertsTab === 'all') return list;
    return list.filter(a => a.category === alertsTab);
  }, [lowStockItems, expiringItems, brokenItems, incidentList, alertsTab]);

  // Handle XLS Import
  const handleImportXLS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        let totalImported = 0;

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws) as any[];
          if (data.length === 0) continue;

          const formatDate = (val: any) => {
            if (!val) return '';
            if (val instanceof Date) return val.toISOString().split('T')[0];
            const d = new Date(val);
            if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
            return String(val).trim();
          };

          const CHUNK_SIZE = 450;
          const chunks = [];
          for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            chunks.push(data.slice(i, i + CHUNK_SIZE));
          }

          for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach((item) => {
              let collectionName = '';
              if (item['الاسم'] && item['المادة']) collectionName = 'teachers';
              else if (item['تعيين الجهاز'] || item['النوع'] === 'زجاجيات' || item['النوع'] === 'أجهزة') collectionName = 'equipment';
              else if (item['الاسم'] && (item['الصيغة'] || item['CAS'] || item['الكمية'])) collectionName = 'chemicals';
              
              if (!collectionName) {
                const normalizedSheet = sheetName.toLowerCase();
                if (normalizedSheet.includes('chem')) collectionName = 'chemicals';
                else if (normalizedSheet.includes('equip')) collectionName = 'equipment';
                else if (normalizedSheet.includes('teach')) collectionName = 'teachers';
              }

              if (!collectionName) return;
              const docRef = doc(getUserCollection(schoolId, collectionName));
              
              if (collectionName === 'chemicals') {
                const quantity = Number(item['الكمية'] || 0);
                batch.set(docRef, {
                  nameAr: item['الاسم'] || 'مادة غير مسمى',
                  nameEn: item['Name'] || item['الاسم'] || 'Unnamed Chemical',
                  formula: item['الصيغة'] || '',
                  casNumber: item['CAS'] || '',
                  storageTemp: item['درجة التخزين'] || '',
                  expiryDate: formatDate(item['تاريخ الانتهاء']),
                  quantity: isNaN(quantity) ? 0 : quantity,
                  unit: item['الوحدة'] || 'ml',
                  state: item['الحالة'] || 'solid',
                  hazardClass: String(item['الخطورة'] || '').toLowerCase() === 'danger' ? 'danger' : 'safe',
                  shelf: item['الموقع'] || '',
                  ghs: [],
                  notes: item['ملاحظات'] || '',
                  createdAt: serverTimestamp()
                });
              } else if (collectionName === 'teachers') {
                batch.set(docRef, {
                  name: String(item['الاسم'] || 'أستاذ غير مسمى').trim(),
                  subject: String(item['المادة'] || 'مادة غير محددة').trim(),
                  rank: item['الرتبة'] || '',
                  functionalCode: item['الرمز الوظيفي'] || '',
                  birthDate: formatDate(item['تاريخ الازدياد']),
                  grade: item['الدرجة'] || '',
                  effectiveDate: formatDate(item['تاريخ السريان']),
                  email: item['البريد'] || '',
                  levels: item['الأطوار'] ? String(item['الأطوار']).split(';').map(s => s.trim()) : [],
                  createdAt: serverTimestamp()
                });
              } else if (collectionName === 'equipment') {
                const typeRaw = String(item['النوع'] || '').toLowerCase();
                const statusRaw = String(item['الحالة'] || '').toLowerCase();
                const quantity = Number(item['الكمية الإجمالية'] || 0);
                
                batch.set(docRef, {
                  name: String(item['تعيين الجهاز'] || 'جهاز غير مسمى').trim(),
                  type: typeRaw.includes('زجاج') ? 'glassware' : typeRaw.includes('جهاز') ? 'tech' : 'other',
                  serialNumber: item['رقم الجرد'] || item['الرقم التسلسلي'] || '',
                  status: statusRaw.includes('سليم') ? 'functional' : statusRaw.includes('صيانة') ? 'maintenance' : 'broken',
                  totalQuantity: isNaN(quantity) ? 0 : quantity,
                  availableQuantity: isNaN(quantity) ? 0 : quantity,
                  brokenQuantity: 0,
                  supplier: item['الممون'] || '',
                  location: item['الموقع'] || '',
                  notes: item['ملاحظات'] || '',
                  foundationalInventory: item['الجرد التأسيسي'] || '',
                  decennialReview: item['المراجعة العشرية'] || '',
                  createdAt: serverTimestamp()
                });
              }
              totalImported++;
            });
            await batch.commit();
          }
        }

        setNotification({ message: `تم استيراد ${totalImported} سجل بنجاح من كافة الصفحات!`, type: 'success' });
        setTimeout(() => setNotification(null), 4000);
      } catch (error) {
        logger.error('Error importing XLS:', error);
        setNotification({ message: 'حدث خطأ أثناء استيراد الملف. يرجى التأكد من تطابق النموذج.', type: 'error' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Export Template
  const handleExportTemplate = async () => {
    try {
      const wb = XLSX.utils.book_new();

      const chemSnap = await getDocs(getUserCollection(schoolId, 'chemicals'));
      const equipSnap = await getDocs(getUserCollection(schoolId, 'equipment'));
      const teachSnap = await getDocs(getUserCollection(schoolId, 'teachers'));

      const chemicalData = chemSnap.docs.map(d => {
        const docData = d.data() as any;
        return {
          'الاسم': docData.nameAr || '',
          'Name': docData.nameEn || '',
          'الصيغة': docData.formula || '',
          'CAS': docData.casNumber || '',
          'درجة التخزين': docData.storageTemp || '',
          'تاريخ الانتهاء': docData.expiryDate || '',
          'الكمية': docData.quantity || 0,
          'الوحدة': docData.unit || '',
          'الحالة': docData.state || '',
          'الخطورة': docData.hazardClass || '',
          'الموقع': docData.shelf || '',
          'ملاحظات': docData.notes || ''
        };
      });

      if (chemicalData.length === 0) {
        chemicalData.push({ 'الاسم': 'مثال: حمض الكلور', 'Name': 'HCl', 'الصيغة': 'HCl', 'CAS': '7647-01-0', 'درجة التخزين': '25C', 'تاريخ الانتهاء': '2026-12-31', 'الكمية': 500, 'الوحدة': 'ml', 'الحالة': 'liquid', 'الخطورة': 'danger', 'الموقع': 'رف أ', 'ملاحظات': 'مادة أكالة' });
      }
      const wsChem = XLSX.utils.json_to_sheet(chemicalData);
      XLSX.utils.book_append_sheet(wb, wsChem, "Chemicals");

      const equipmentData = equipSnap.docs.map(d => {
        const docData = d.data() as any;
        return {
          'تعيين الجهاز': docData.name || '',
          'النوع': docData.type === 'glassware' ? 'زجاجيات' : docData.type === 'tech' ? 'أجهزة' : 'أخرى',
          'رقم الجرد': docData.serialNumber || '',
          'الرقم التسلسلي': docData.serialNumber || '',
          'الحالة': docData.status === 'functional' ? 'سليم' : docData.status === 'maintenance' ? 'صيانة' : 'تعطل',
          'الكمية الإجمالية': docData.totalQuantity || 0,
          'الممون': docData.supplier || '',
          'الموقع': docData.location || '',
          'ملاحظات': docData.notes || '',
          'الجرد التأسيسي': docData.foundationalInventory || '',
          'المراجعة العشرية': docData.decennialReview || ''
        };
      });

      if (equipmentData.length === 0) {
        equipmentData.push({ 'تعيين الجهاز': 'مثال: مجهر ضوئي', 'النوع': 'أجهزة', 'رقم الجرد': 'LAB-001', 'الرقم التسلسلي': 'SN12345', 'الحالة': 'سليم', 'الكمية الإجمالية': 5, 'الممون': 'وزارة التربية', 'الموقع': 'الخزانة 1', 'ملاحظات': 'دقة عالية', 'الجرد التأسيسي': 'نعم', 'المراجعة العشرية': '2026' });
      }
      const wsEquip = XLSX.utils.json_to_sheet(equipmentData);
      XLSX.utils.book_append_sheet(wb, wsEquip, "Equipment");

      const teacherData = teachSnap.docs.map(d => {
        const docData = d.data() as any;
        return {
          'الاسم': docData.name || '',
          'المادة': docData.subject || '',
          'الرتبة': docData.rank || '',
          'الرمز الوظيفي': docData.functionalCode || '',
          'تاريخ الازدياد': docData.birthDate || '',
          'الدرجة': docData.grade || '',
          'تاريخ السريان': docData.effectiveDate || '',
          'البريد': docData.email || '',
          'الأطوار': (docData.levels || []).join(';')
        };
      });

      if (teacherData.length === 0) {
        teacherData.push({ 'الاسم': 'أحمد محمد', 'المادة': 'علوم طبيعية', 'الرتبة': 'أستاذ تعليم ثانوي', 'الرمز الوظيفي': '987654', 'تاريخ الازدياد': '1985-05-15', 'الدرجة': '6', 'تاريخ السريان': '2023-01-01', 'البريد': 'ahmed@mail.com', 'الأطوار': 'ثانوي' });
      }
      const wsTeachers = XLSX.utils.json_to_sheet(teacherData);
      XLSX.utils.book_append_sheet(wb, wsTeachers, "Teachers");

      XLSX.writeFile(wb, `Lab_Full_Data_Template.xlsx`);
      setNotification({ message: 'تم تحميل ملف البيانات في ملف Excel بنجاح!', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      logger.error('Error exporting data template:', error);
      handleFirestoreError(error, OperationType.LIST, 'export_process');
      setNotification({ message: 'حدث خطأ أثناء تصدير البيانات. يرجى التحقق من الاتصال والصلاحيات.', type: 'error' });
    }
  };

  // Smart AI Metadata Update
  const handleSmartUpdate = async () => {
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      setNotification({ message: 'يرجى اختيار مفتاح API الخاص بك لاستخدام ميزة التحديث الذكي.', type: 'error' });
      return;
    }

    setIsSmartUpdating(true);
    try {
      const equipSnap = await getDocs(getUserCollection(schoolId, 'equipment'));
      const chemSnap = await getDocs(getUserCollection(schoolId, 'chemicals'));
      
      const items = [
        ...equipSnap.docs.map(d => ({ id: d.id, collection: 'equipment', ...(d.data() as any) })),
        ...chemSnap.docs.map(d => ({ id: d.id, collection: 'chemicals', ...(d.data() as any) }))
      ];
      
      if (items.length === 0) {
        setNotification({ message: 'لا توجد تجهيزات لتحديثها.', type: 'error' });
        return;
      }

      const CHUNK_SIZE = 10;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const itemsToProcess = chunk.map((item: any) => ({ id: item.id, name: item.name || item.nameAr }));
        
        const enrichedData = await getEquipmentIntelligence(itemsToProcess);
        if (!enrichedData) {
          throw new Error('فشل الحصول على بيانات الذكاء الاصطناعي.');
        }

        const batch = writeBatch(db);
        enrichedData.forEach((update: any) => {
          const originalItem = items.find((it: any) => it.id === update.id);
          const collectionName = originalItem?.collection || 'equipment';
          const docRef = doc(getUserCollection(schoolId, collectionName), update.id);
          batch.update(docRef, {
            smartNameAr: update.smartNameAr,
            smartDescriptionAr: update.smartDescriptionAr,
            imageKeyword: update.imageKeyword,
            lastSmartUpdate: serverTimestamp()
          });
        });
        await batch.commit();
        
        if (i + CHUNK_SIZE < items.length) {
          await new Promise(r => setTimeout(r, 4000));
        }
      }

      setNotification({ message: 'تم التحديث الذكي للمخزون والمعرفات بنجاح!', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      logger.error('Error in smart update:', error);
      setNotification({ message: 'حدث خطأ أثناء التحديث الذكي. يرجى المحاولة لاحقاً.', type: 'error' });
    } finally {
      setIsSmartUpdating(false);
    }
  };

  // Specialized Functional Modules - Strictly filtered by role
  const coreModules = useMemo(() => {
    const list = [
      { 
        title: 'الجرد والمخزون', 
        desc: 'إدارة الكواشف الكيميائية، الأجهزة، بطاقات الجرد، ومصفوفات التوافق المخبري.', 
        count: `${counts.chemicals + counts.equipment} مادة وجهاز`, 
        icon: Database, 
        path: ROUTES.INVENTORY_DASHBOARD 
      },
      { 
        title: 'المتابعة البيداغوجية', 
        desc: 'تسيير جدول استعمال المخابر، الأساتذة، الأفواج، والتجارب المخبرية المنفذة.', 
        count: `${counts.experiments} تجربة`, 
        icon: BookOpen, 
        path: ROUTES.PEDAGOGICAL_DASHBOARD 
      },
      { 
        title: 'الأمن والسلامة المخبرية', 
        desc: 'إدارة المخاطر والنفايات، بروتوكولات الطوارئ والإسعافات الأولية وتتبع الحوادث.', 
        count: `${counts.incidents} بلاغ`, 
        icon: ShieldAlert, 
        path: ROUTES.SAFETY_HUB 
      },
      { 
        title: 'الموارد العلمية والمحاكاة', 
        desc: 'الجدول الدوري التفاعلي، المحاكاة الفيزيائية، النماذج ثلاثية الأبعاد والمجهر الافتراضي.', 
        count: 'أدوات علمية', 
        icon: Atom, 
        path: ROUTES.SCIENTIFIC_HUB 
      },
      { 
        title: 'الإدارة والإعدادات', 
        desc: 'إعدادات المؤسسة، الميزانية والمشتريات، واستيراد ونسخ قواعد البيانات.', 
        count: 'مركز التحكم', 
        icon: Settings, 
        path: ROUTES.SETTINGS_HUB 
      },
      ...(isAdmin ? [{ 
        title: 'لوحة الإدارة المركزية', 
        desc: 'التحكم الشامل في المستخدمين، الصلاحيات المتقدمة، وسجلات النظام الكاملة.', 
        count: 'مشرف النظام', 
        icon: ShieldCheck, 
        path: ROUTES.ADMIN 
      }] : [])
    ];
    return list.filter(item => isRouteAllowedForRole(currentRole, item.path));
  }, [counts.chemicals, counts.equipment, counts.experiments, counts.incidents, isAdmin, currentRole]);

  // Dynamic quick actions filtered strictly by role
  const quickActions = useMemo(() => {
    const allActions = [
      { title: 'فضاء الإدارة العليا', icon: Building2, path: ROUTES.DIRECTOR_PORTAL },
      { title: 'تحرير تقرير يومي', icon: FileText, path: ROUTES.DAILY_REPORT },
      { title: 'تسجيل تجربة مخبرية', icon: FlaskConical, path: ROUTES.LAB_EXPERIMENTS },
      { title: 'جرد عتاد أو مادة', icon: Database, path: ROUTES.INVENTORY_DASHBOARD },
      { title: 'سجل صيانة وأعطال', icon: Hammer, path: ROUTES.MAINTENANCE },
      { title: 'طلب إعارة أجهزة', icon: ArrowUpRight, path: ROUTES.LOAN_REQUEST },
      { title: 'بروتوكولات السلامة', icon: ShieldCheck, path: ROUTES.SAFETY_HUB },
      { title: 'التقارير السنوية', icon: BarChart3, path: ROUTES.REPORTS },
      { title: 'الميزانية والمشتريات', icon: Wallet, path: ROUTES.BUDGET_PURCHASES },
      { title: 'الأرشيف والسجلات', icon: BookOpen, path: ROUTES.ARCHIVE },
      { title: 'التشريع المدرسي', icon: FileCheck, path: ROUTES.SCHOOL_LEGISLATION },
      { title: 'وثائق الإدارة', icon: FileSpreadsheet, path: ROUTES.ADMIN_TEMPLATES },
    ];
    return allActions.filter(action => isRouteAllowedForRole(currentRole, action.path));
  }, [currentRole]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24 rtl font-sans" dir="rtl">
      <Helmet>
        <title>مركز قيادة المخابر | الأرضية الرقمية للمخابر المدرسية</title>
      </Helmet>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border",
              notification.type === 'success' 
                ? "bg-primary text-on-primary border-primary-container" 
                : "bg-error text-white border-red-700"
            )}
          >
            {notification.type === 'success' ? <Sparkles size={18} /> : <AlertTriangle size={18} />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input for XLS Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportXLS} 
        className="hidden" 
        accept=".xls,.xlsx"
      />

      {/* ── 1. Top Header & Live Status Bar ──────────────────────────────── */}
      <header className="pt-2 pb-1 border-b border-outline/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>الأرضية الرقمية للمخابر التعليمية</span>
              <span aria-hidden="true">·</span>
              <span className="text-on-surface/60 font-mono tabular-nums">{currentDateAr}</span>
              <span aria-hidden="true">·</span>
              <span className="text-on-surface/60 font-mono tabular-nums">{currentTime}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight font-sans">
              مركز القيادة والتحكم للمخابر
            </h1>
            <p className="text-sm font-medium text-on-surface/70">
              متابعة آنية للتجهيزات، الكواشف الكيميائية، جداول الحصص والتجارب المخبرية.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-primary text-xs font-bold border border-outline/10 hover:bg-surface-container hover:border-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <FileUp size={14} />}
              استيراد سجلات Excel
            </button>

            <button
              onClick={handleExportTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-primary text-xs font-bold border border-outline/10 hover:bg-surface-container hover:border-primary/20 transition-colors whitespace-nowrap"
            >
              <FileDown size={14} />
              تصدير الهيكل المرجعي
            </button>

            <button
              onClick={handleSmartUpdate}
              disabled={isSmartUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              {isSmartUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              تحديث المعرفات الذكي
            </button>
          </div>
        </div>
      </header>

      {/* ── Statutory Rank & Institutional Collaboration Banner ── */}
      <section aria-label="بيانات الرتبة والربط المؤسساتي" className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-container to-emerald-500/10 border border-primary/20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <FlaskConical size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-primary">
                  {userProfile?.grade || 'مسؤول المخبر'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  فضاء مسؤول المخبر (معتمد رسمياً)
                </span>
                <span className="text-[10px] text-on-surface/60 font-bold">
                  {userProfile?.corps || 'سلك موظفي المخابر (المرسوم التنفيذي 25-54)'}
                </span>
              </div>
              <p className="text-xs text-on-surface/80 font-medium mt-0.5">
                المؤسسة: <strong className="text-primary font-bold">{userProfile?.institution || localStorage.getItem('algeria_lab_school_name') || 'المؤسسة التعليمية'}</strong>
                {userProfile?.directorate && ` · ${userProfile.directorate}`}
                {userProfile?.commune && ` · بلدية ${userProfile.commune}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface/70 bg-surface/80 p-2.5 rounded-xl border border-outline/10 self-start md:self-center">
            <Database size={16} className="text-primary shrink-0" />
            <div className="text-start">
              <span className="block font-black text-primary text-[11px]">قاعدة البيانات المشتركة للمؤسسة</span>
              <span className="block text-[10px] text-on-surface/60">
                مرتبطة تلقائياً مع: الأساتذة · ناظر الدروس · المدير · المقتصد
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Quick Command Bar ────────────────────────────────────────── */}
      <section aria-label="الإجراءات السريعة" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">
            الإجراءات السريعة الأكثر استخداماً
          </h2>
          <span className="text-xs text-primary font-bold">الوصول المباشر بنقرة واحدة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-surface-container-lowest border border-outline/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <ActionIcon size={20} />
                </div>
                <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. Operational Alerts Center ─────────────────────────────────── */}
      <section aria-label="مركز التنبيهات التشغيلية" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">مركز التنبيهات التشغيلية</h2>
              <p className="text-xs text-on-surface/60">
                متابعة استباقية لمواد قاربت على الانتهاء، نواقص المخزون والأجهزة المتطلبة للصيانة.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline/10 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setAlertsTab('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                alertsTab === 'all' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/70 hover:text-primary"
              )}
            >
              الكل ({activeAlerts.length})
            </button>
            <button
              onClick={() => setAlertsTab('stock')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                alertsTab === 'stock' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/70 hover:text-primary"
              )}
            >
              نواقص المخزون ({counts.lowStock})
            </button>
            <button
              onClick={() => setAlertsTab('expiry')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                alertsTab === 'expiry' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/70 hover:text-primary"
              )}
            >
              قرب الصلاحية ({counts.expiringSoon})
            </button>
            <button
              onClick={() => setAlertsTab('maintenance')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                alertsTab === 'maintenance' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/70 hover:text-primary"
              )}
            >
              أعطال وصيانة ({counts.brokenEquip})
            </button>
          </div>
        </div>

        {/* Alerts Content */}
        {activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAlerts.slice(0, 6).map((alert) => (
              <div 
                key={alert.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline/10 hover:border-outline/25 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        alert.severity === 'error' ? "bg-error/10 text-error" : "bg-amber-500/10 text-amber-700"
                      )}>
                        {alert.typeLabel}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-primary truncate max-w-[200px]">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-on-surface/70 line-clamp-2">
                      {alert.detail}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline/5 flex items-center justify-end">
                  <button
                    onClick={() => navigate(alert.actionPath)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors"
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline/10 text-center space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
            <p className="text-sm font-bold text-primary">كافة مؤشرات المخبر في حالة نظامية ومستقرة</p>
            <p className="text-xs text-on-surface/60">لا توجد مواد منتهية الصلاحية أو أعطال حرجة تتطلب تدخلاً فورياً حالياً.</p>
          </div>
        )}
      </section>

      {/* ── 4. Key Performance Indicators (KPI Grid) ────────────────────── */}
      <section aria-label="مؤشرات الأداء المخبري" className="space-y-3">
        <h2 className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">
          مؤشرات الأداء والجاهزية التشغيلية
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            title="نسبة الجاهزية"
            value={`${labReadinessPercent}%`}
            subtitle="معدل سلامة الأجهزة"
            icon={CheckCircle2}
            badge={labReadinessPercent >= 80 ? 'ممتاز' : 'انتباه'}
            badgeType={labReadinessPercent >= 80 ? 'success' : 'warning'}
            onClick={() => navigate(ROUTES.EQUIPMENT)}
          />

          <KPICard
            title="الكواشف والمواد"
            value={counts.chemicals}
            subtitle={`${counts.lowStock} تحت الحد الأدنى`}
            icon={FlaskConical}
            badge={counts.lowStock > 0 ? `${counts.lowStock} نقص` : 'كافٍ'}
            badgeType={counts.lowStock > 0 ? 'warning' : 'default'}
            onClick={() => navigate(ROUTES.CHEMICALS)}
          />

          <KPICard
            title="الأجهزة والعتاد"
            value={counts.equipment}
            subtitle={`${counts.brokenEquip} في الصيانة`}
            icon={Wrench}
            badge={counts.brokenEquip > 0 ? `${counts.brokenEquip} صيانة` : 'سليم'}
            badgeType={counts.brokenEquip > 0 ? 'error' : 'default'}
            onClick={() => navigate(ROUTES.EQUIPMENT)}
          />

          <KPICard
            title="التجارب المنجزة"
            value={counts.experiments}
            subtitle="جلسة عمل مسجلة"
            icon={Microscope}
            badge="بيداغوجي"
            onClick={() => navigate(ROUTES.LAB_EXPERIMENTS)}
          />

          <KPICard
            title="التقارير اليومية"
            value={counts.reports}
            subtitle="محضر رسمي صادر"
            icon={FileText}
            badge="سجل رسمي"
            onClick={() => navigate(ROUTES.DAILY_REPORT)}
          />

          <KPICard
            title="الطاقم التربوي"
            value={counts.teachers}
            subtitle="أستاذ مسجل بالمخبر"
            icon={Users}
            badge="مؤطر"
            onClick={() => navigate(ROUTES.TEACHERS)}
          />
        </div>
      </section>

      {/* ── 5. Split Section: Today's Schedule & Analytics Studio ────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left / Right (RTL): Today's Lab Sessions */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">حصص وتجارب اليوم</h3>
                  <p className="text-xs text-on-surface/60">
                    الجدول الزمني المبرمج ليوم <span className="text-primary font-bold">{todayArabicDay}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(ROUTES.LAB_SCHEDULE)}
                className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
              >
                الجدول الكامل
              </button>
            </div>

            {/* Sessions List */}
            {scheduleLoading ? (
              <div className="py-12 text-center text-xs text-on-surface/60 flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-primary" />
                جاري استرجاع جدول الحصص...
              </div>
            ) : todaySessions.length > 0 ? (
              <div className="space-y-3">
                {todaySessions.slice(0, 4).map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline/5 hover:border-primary/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{session.subject}</span>
                        <span aria-hidden="true" className="text-on-surface/40">·</span>
                        <span className="text-xs font-medium text-on-surface/80">{session.labName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface/60">
                        <span>الأستاذ: <strong className="text-on-surface">{session.teacher}</strong></span>
                        {session.group && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>الفوج: {session.group}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-surface-container text-primary font-mono text-xs font-bold tabular-nums">
                        {session.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <Clock size={32} className="mx-auto text-on-surface/30" />
                <p className="text-sm font-bold text-on-surface/80">لا توجد حصص مبرمجة في الجدول لليوم ({todayArabicDay})</p>
                <p className="text-xs text-on-surface/60">يمكنك جدولة حصة جديدة أو تسجيل تجربة يدوياً في أي وقت.</p>
                <button
                  onClick={() => navigate(ROUTES.LAB_SCHEDULE)}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <Plus size={14} />
                  إضافة حجز في جدول المخابر
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-outline/10 flex items-center justify-between">
            <span className="text-xs text-on-surface/60">
              إجمالي الحصص المسجلة لهذا اليوم: <strong className="text-primary font-mono tabular-nums">{todaySessions.length}</strong>
            </span>
            <button
              onClick={() => navigate(ROUTES.LAB_SCHEDULE)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              <span>إدارة الجدول الأسبوعي</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        </div>

        {/* Analytics Studio */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">استوديو التحليلات المخبرية</h3>
                  <p className="text-xs text-on-surface/60">معدلات الاستغلال وتوزيع التجهيزات</p>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg border border-outline/10">
                <button
                  onClick={() => setChartView('weekly')}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition-colors",
                    chartView === 'weekly' ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface/60 hover:text-primary"
                  )}
                >
                  النشاط الأسبوعي
                </button>
                <button
                  onClick={() => setChartView('equipment')}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition-colors",
                    chartView === 'equipment' ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface/60 hover:text-primary"
                  )}
                >
                  حالة التجهيزات
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-[220px] w-full pt-2">
              {chartView === 'weekly' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e2dc" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#2b3d22', fontWeight: 'bold', fontSize: 11 }} 
                      reversed
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(43, 61, 34, 0.04)' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-lowest p-2.5 rounded-lg shadow-md border border-outline/10 text-xs">
                              <p className="font-bold text-on-surface/60 mb-0.5">{payload[0].payload.name}</p>
                              <p className="font-bold text-primary font-mono tabular-nums">{payload[0].value} تجارب مسجلة</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#2b3d22' : '#2b3d2233'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full gap-8">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={equipmentStatusData}
                          innerRadius={42}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {equipmentStatusData.map((entry, idx) => (
                            <Cell key={`pie-cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#2b3d22]" />
                      <span className="font-bold text-on-surface">أجهزة سليمة:</span>
                      <strong className="font-mono tabular-nums text-primary">{counts.functionalEquip} ({labReadinessPercent}%)</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
                      <span className="font-bold text-on-surface">بحاجة صيانة:</span>
                      <strong className="font-mono tabular-nums text-error">{counts.brokenEquip}</strong>
                    </div>
                    <div className="pt-2 border-t border-outline/10 text-on-surface/60">
                      إجمالي العتاد: <span className="font-mono tabular-nums font-bold text-primary">{counts.equipment}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-outline/10 flex items-center justify-between">
            <span className="text-xs text-on-surface/60">
              {counts.experiments > 0 ? `استناداً إلى ${counts.experiments} تجربة مخبرية مدونة` : 'بادر بتدوين التجارب لتحليل الكثافة المخبرية'}
            </span>
            <button
              onClick={() => navigate(ROUTES.LAB_EXPERIMENTS)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              <span>سجل التجارب</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. Recent Activity Feed ─────────────────────────────────────── */}
      {recentReports.length > 0 && (
        <section aria-label="آخر النشاطات المخبرية" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">
              آخر التقارير والنشاطات اليومية الصادرة
            </h2>
            <button
              onClick={() => navigate(ROUTES.DAILY_REPORT)}
              className="text-xs font-bold text-primary hover:underline"
            >
              عرض كافة التقارير
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate(ROUTES.DAILY_REPORT)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(ROUTES.DAILY_REPORT); }}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline/10 hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {report.className || 'قسم عام'}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-on-surface/50">
                      {report.date}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface/70 line-clamp-2 leading-relaxed">
                    {report.observations || 'سارت التجارب في ظروف عادية ووفق البروتوكولات المقررة.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-outline/5 flex items-center justify-between text-xs">
                  <span className="text-on-surface/60 truncate font-medium">
                    {report.teacherName || 'أستاذ المادة'}
                  </span>
                  <ArrowLeft size={14} className="text-primary group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Core Operational Modules Grid ────────────────────────────── */}
      <section aria-label="الأقسام والمراكز المتخصصة" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">
            المراكز والوحدات الوظيفية للمخبر
          </h2>
          <span className="text-xs text-on-surface/60">تنظيم شامل لكافة مفاصل العمل المخبري</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                onClick={() => navigate(mod.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(mod.path); }}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold text-primary font-mono tabular-nums px-2.5 py-1 rounded-md bg-surface-container-low">
                      {mod.count}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-primary-container transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-on-surface/70 leading-relaxed font-medium">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-outline/5 flex items-center justify-between text-xs font-bold text-primary">
                  <span>فتح القسم</span>
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
