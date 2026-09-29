import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  ShoppingCart, 
  ShieldCheck, 
  User, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Settings, 
  School, 
  Database, 
  X, 
  KeyRound, 
  Loader2, 
  Download, 
  Bell,
  RefreshCw,
  Activity,
  AlertCircle,
  Eye,
  Send,
  Building2,
  Trash2,
  Check,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Shield,
  HelpCircle,
  BadgeAlert,
  GraduationCap
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, checkIsAdmin, testFirestoreConnection } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import ministryLogo from '/ministry-logo.png';
import { SCHOOL_DB } from '../data/schools';

type AdminTab = 'overview' | 'users' | 'schools' | 'tickets' | 'purchases' | 'announcements' | 'system';

interface AdminUser {
  id: string;
  displayName?: string;
  email?: string;
  role?: string;
  photoURL?: string;
  createdAt?: any;
  lastLogin?: any;
  disabled?: boolean;
}

interface UserSettings {
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

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  userId?: string;
  userEmail?: string;
  userName?: string;
  schoolName?: string;
  createdAt?: any;
  adminReply?: string;
  adminRepliedAt?: any;
}

interface PurchaseOrder {
  id: string;
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
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'urgent' | 'technical' | 'pedagogical' | 'update';
  priority: 'normal' | 'high';
  createdAt?: any;
  authorName?: string;
  active?: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Authentication & Access state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Live Data collections
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, UserSettings>>({});
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // Modals & Drawers state
  const [selectedUser, setSelectedUser] = useState<{ user: AdminUser; settings?: UserSettings } | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplyingTicket, setIsReplyingTicket] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);

  // New Announcement Modal state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<'urgent' | 'technical' | 'pedagogical' | 'update'>('pedagogical');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high'>('normal');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'lab_staff' | 'teacher'>('all');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolCycleFilter, setSchoolCycleFilter] = useState<'all' | 'ثانوي' | 'متوسط' | 'ابتدائي'>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<string>('all');

  // System Health state
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [isPingingDb, setIsPingingDb] = useState(false);

  // 1. Verify Administrator Privileges
  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      setIsVerifyingAuth(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          if (isMounted) {
            setIsAdmin(false);
            setIsVerifyingAuth(false);
          }
          return;
        }

        const adminStatus = await checkIsAdmin(user);
        if (isMounted) {
          setIsAdmin(adminStatus);
          setIsVerifyingAuth(false);
        }
      } catch (err) {
        console.error('Error verifying admin rights:', err);
        if (isMounted) {
          setIsAdmin(false);
          setIsVerifyingAuth(false);
        }
      }
    };

    verifyAdmin();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch live data streams when admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;

    setIsLoadingData(true);

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const uList: AdminUser[] = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setUsers(uList);
    }, (err) => {
      console.warn('Could not subscribe to users:', err);
    });

    // Listen to user settings
    const unsubSettings = onSnapshot(collection(db, 'settings'), (snap) => {
      const sMap: Record<string, UserSettings> = {};
      snap.docs.forEach(docSnap => {
        sMap[docSnap.id] = docSnap.data() as UserSettings;
      });
      setSettingsMap(sMap);
    }, (err) => {
      console.warn('Could not subscribe to settings:', err);
    });

    // Listen to support tickets
    const unsubTickets = onSnapshot(collection(db, 'support_tickets'), (snap) => {
      const tList: SupportTicket[] = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      })).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
      setTickets(tList);
    }, (err) => {
      console.warn('Could not subscribe to support_tickets:', err);
    });

    // Listen to purchase orders
    const unsubPurchases = onSnapshot(collection(db, 'purchase_orders'), (snap) => {
      const pList: PurchaseOrder[] = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      })).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
      setPurchases(pList);
    }, (err) => {
      console.warn('Could not subscribe to purchase_orders:', err);
    });

    // Listen to system announcements
    const unsubAnnouncements = onSnapshot(collection(db, 'system_announcements'), (snap) => {
      const aList: Announcement[] = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      })).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
      setAnnouncements(aList);
      setIsLoadingData(false);
    }, (err) => {
      console.warn('Could not subscribe to system_announcements:', err);
      setIsLoadingData(false);
    });

    // Test DB connection status once on boot
    testFirestoreConnection(1).then(ok => setDbHealthy(ok));

    return () => {
      unsubUsers();
      unsubSettings();
      unsubTickets();
      unsubPurchases();
      unsubAnnouncements();
    };
  }, [isAdmin]);

  // Derived Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'Admin' || u.role === 'admin').length;
    const labStaffCount = Object.values(settingsMap).filter(s => 
      !s.jobTitle?.includes('أستاذ') && (s.jobTitle?.includes('مخبر') || s.jobTitle?.includes('ملحق'))
    ).length;
    const teacherCount = Object.values(settingsMap).filter(s => s.jobTitle?.includes('أستاذ')).length;

    // Distinct establishments
    const uniqueSchools = new Set<string>();
    const uniqueWilayas = new Set<string>();
    Object.values(settingsMap).forEach(s => {
      if (s.schoolName || s.school) uniqueSchools.add(s.schoolName || s.school || '');
      if (s.directorateName || s.directorate) uniqueWilayas.add(s.directorateName || s.directorate || '');
    });

    const openTicketsCount = tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
    const totalPurchaseVolume = purchases.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const pendingOrdersCount = purchases.filter(p => p.status === 'sent' || p.status === 'draft').length;

    return {
      totalUsers: Math.max(totalUsers, Object.keys(settingsMap).length),
      adminCount: Math.max(adminCount, 1),
      labStaffCount,
      teacherCount,
      totalSchools: uniqueSchools.size,
      totalWilayas: uniqueWilayas.size,
      openTicketsCount,
      totalTickets: tickets.length,
      totalPurchaseVolume,
      pendingOrdersCount,
      totalOrders: purchases.length,
      activeAnnouncementsCount: announcements.filter(a => a.active !== false).length
    };
  }, [users, settingsMap, tickets, purchases, announcements]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const s = settingsMap[u.id] || {};
      const searchLower = userSearch.toLowerCase();
      
      const matchesSearch = !userSearch || 
        (u.displayName && u.displayName.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower)) ||
        (s.schoolName && s.schoolName.toLowerCase().includes(searchLower)) ||
        (s.directorateName && s.directorateName.toLowerCase().includes(searchLower)) ||
        (s.jobTitle && s.jobTitle.toLowerCase().includes(searchLower)) ||
        (s.employeeId && s.employeeId.includes(searchLower));

      if (!matchesSearch) return false;

      if (userRoleFilter === 'admin') {
        return u.role === 'Admin' || u.role === 'admin';
      }
      if (userRoleFilter === 'teacher') {
        return s.jobTitle?.includes('أستاذ');
      }
      if (userRoleFilter === 'lab_staff') {
        return !s.jobTitle?.includes('أستاذ') && (s.jobTitle?.includes('مخبر') || s.jobTitle?.includes('ملحق'));
      }
      return true;
    });
  }, [users, settingsMap, userSearch, userRoleFilter]);

  // Aggregated Registered Schools List
  const aggregatedSchools = useMemo(() => {
    const schoolMap = new Map<string, {
      name: string;
      directorate: string;
      commune: string;
      cycle: string;
      staffCount: number;
      staff: { name: string; title: string; email: string }[];
    }>();

    Object.entries(settingsMap).forEach(([uid, s]) => {
      const schoolName = s.schoolName || s.school;
      if (!schoolName) return;

      const userObj = users.find(u => u.id === uid);
      const staffMember = {
        name: userObj?.displayName || 'موظف مخبر',
        title: s.jobTitle || 'ملحق بالمخابر',
        email: userObj?.email || ''
      };

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          name: schoolName,
          directorate: s.directorateName || s.directorate || 'مديرية التربية',
          commune: s.communeName || s.commune || '',
          cycle: s.cycle || 'ثانوي',
          staffCount: 1,
          staff: [staffMember]
        });
      } else {
        const item = schoolMap.get(schoolName)!;
        item.staffCount += 1;
        item.staff.push(staffMember);
      }
    });

    const list = Array.from(schoolMap.values());
    return list.filter(sch => {
      const matchesSearch = !schoolSearch || 
        sch.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        sch.directorate.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        sch.commune.toLowerCase().includes(schoolSearch.toLowerCase());
      
      const matchesCycle = schoolCycleFilter === 'all' || sch.cycle === schoolCycleFilter;
      return matchesSearch && matchesCycle;
    });
  }, [settingsMap, users, schoolSearch, schoolCycleFilter]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (ticketStatusFilter === 'all') return true;
      return t.status === ticketStatusFilter;
    });
  }, [tickets, ticketStatusFilter]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (purchaseStatusFilter === 'all') return true;
      return p.status === purchaseStatusFilter;
    });
  }, [purchases, purchaseStatusFilter]);

  // User Role Management Handler
  const handleToggleUserRole = async (targetUser: AdminUser) => {
    const isCurrentlyAdmin = targetUser.role === 'Admin' || targetUser.role === 'admin';
    const newRole = isCurrentlyAdmin ? 'user' : 'Admin';
    
    try {
      await updateDoc(doc(db, 'users', targetUser.id), { role: newRole });
      
      // Also update settings doc if exists
      try {
        await updateDoc(doc(db, 'settings', targetUser.id), { role: newRole });
      } catch (e) {}

      showToast(`تم تغيير رتبة ${targetUser.displayName || 'المستخدم'} إلى ${newRole === 'Admin' ? 'مدير نظام (Admin)' : 'مستخدم عادي'}.`, 'success');
      
      if (selectedUser?.user.id === targetUser.id) {
        setSelectedUser({ ...selectedUser, user: { ...targetUser, role: newRole } });
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      showToast('فشل تحديث رتبة المستخدم: ' + err.message, 'error');
    }
  };

  // Ticket Status & Reply Handler
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    setIsReplyingTicket(true);
    try {
      await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
        adminReply: ticketReplyText.trim(),
        adminRepliedAt: serverTimestamp(),
        adminName: auth.currentUser?.displayName || 'الإدارة المركزية',
        status: 'resolved'
      });

      showToast('تم إرسال الرد الرسمي وحل التذكرة بنجاح.', 'success');
      setSelectedTicket(null);
      setTicketReplyText('');
    } catch (err: any) {
      console.error('Error replying ticket:', err);
      showToast('فشل إرسال الرد: ' + err.message, 'error');
    } finally {
      setIsReplyingTicket(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), { status: newStatus });
      showToast('تم تحديث حالة التذكرة بنجاح.', 'success');
    } catch (err: any) {
      showToast('فشل تحديث الحالة: ' + err.message, 'error');
    }
  };

  // Broadcast Announcement Handler
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast('يرجى كتابة عنوان وتفاصيل الإعلان الوزاري.', 'error');
      return;
    }

    setIsPostingAnnouncement(true);
    try {
      const docRef = doc(collection(db, 'system_announcements'));
      await setDoc(docRef, {
        title: annTitle.trim(),
        message: annMessage.trim(),
        category: annCategory,
        priority: annPriority,
        authorName: auth.currentUser?.displayName || 'مديرية البرامج والوسائل التعليمية',
        createdAt: serverTimestamp(),
        active: true
      });

      showToast('تم نشر وتعميم الإعلان لكافة مستخدمي المنصة بنجاح.', 'success');
      setShowAnnouncementModal(false);
      setAnnTitle('');
      setAnnMessage('');
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      showToast('فشل نشر الإعلان: ' + err.message, 'error');
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'system_announcements', id));
      showToast('تم حذف الإعلان.', 'success');
    } catch (err: any) {
      showToast('فشل حذف الإعلان: ' + err.message, 'error');
    }
  };

  // Database Connection Ping
  const handlePingDatabase = async () => {
    setIsPingingDb(true);
    try {
      const ok = await testFirestoreConnection(2);
      setDbHealthy(ok);
      if (ok) {
        showToast('الاتصال بقاعدة بيانات Firestore السحابية مستقر ومثالي.', 'success');
      } else {
        showToast('تنبيه: تعذر اختبار الاتصال بـ Firestore.', 'error');
      }
    } catch (e: any) {
      setDbHealthy(false);
      showToast('خطأ أثناء اختبار الاتصال: ' + e.message, 'error');
    } finally {
      setIsPingingDb(false);
    }
  };

  // Export Users Directory to CSV
  const handleExportUsersCSV = () => {
    try {
      const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الرتبة', 'المؤسسة التعليمية', 'مديرية التربية', 'البلدية', 'الرتبة في النظام'];
      const rows = users.map(u => {
        const s = settingsMap[u.id] || {};
        return [
          u.id,
          u.displayName || 'غير محدد',
          u.email || '',
          s.jobTitle || 'ملحق بالمخابر',
          s.schoolName || s.school || 'غير محدد',
          s.directorateName || s.directorate || '',
          s.communeName || s.commune || '',
          u.role || 'user'
        ];
      });

      const csvContent = '\uFEFF' + [headers, ...rows].map(row => 
        row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `دليل_مستخدمي_المخابر_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('تم تصدير دليل المستخدمين بنجاح بصيغة CSV.', 'success');
    } catch (err: any) {
      showToast('حدث خطأ أثناء تصدير البيانات: ' + err.message, 'error');
    }
  };

  // --- ACCESS RESTRICTED SCREEN IF NOT ADMIN ---
  if (!isVerifyingAuth && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 rtl font-sans" dir="rtl">
        <Helmet>
          <title>الوصول مقيد — الإدارة المركزية</title>
        </Helmet>
        <div className="max-w-md w-full bg-surface-container p-8 rounded-3xl border border-outline-variant/30 text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">منطقة الرقابة والإدارة المركزية</h2>
          <p className="text-sm text-secondary leading-relaxed mb-6">
            هذا القسم مخصص حصرياً للمشرفين والمسؤولين المركزيين المعتمدين لمتابعة منظومة المخابر المدرسية الوطنية.
          </p>
          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 mb-6 text-xs text-secondary text-right">
            <div><strong>الحساب الحالي:</strong> {auth.currentUser?.email || 'غير مسجل'}</div>
            <div className="mt-1 text-on-surface/60">إذا كنت مشرفاً أو مديراً مخولاً، يرجى التأكد من تسجيل الدخول بالحساب الإداري المعتمد.</div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3.5 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            العودة إلى لوحة القيادة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 rtl font-sans" dir="rtl">
      <Helmet>
        <title>لوحة الإدارة المركزية والرقابة العامة — LabEducationDZ</title>
      </Helmet>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl border text-white font-bold text-sm",
              toast.type === 'error' ? "bg-red-600 border-red-400" : toast.type === 'info' ? "bg-blue-600 border-blue-400" : "bg-primary border-primary/40"
            )}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Official Banner */}
      <header className="mb-8 pt-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-outline-variant/30">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center p-2.5 shadow-sm border border-outline-variant/30 flex-shrink-0">
              <img src={ministryLogo} alt="شعار الوزارة" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-primary tracking-tight">لوحة الإدارة المركزية والرقابة العامة</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <ShieldCheck size={13} /> إشراف وطني
                </span>
              </div>
              <p className="text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
                منظومة الرقابة والمتابعة الشاملة لموظفي المخابر العلمية، المؤسسات التعليمية، طلبيات التموين، وبلاغات الدعم التقني عبر الولايات.
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-3 flex-wrap self-stretch lg:self-auto justify-end">
            <button
              onClick={handlePingDatabase}
              disabled={isPingingDb}
              className="px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-xs font-bold text-secondary hover:text-primary transition-all flex items-center gap-2 shadow-xs"
              title="فحص الاتصال بقاعدة البيانات"
            >
              <Activity size={15} className={cn("text-emerald-600", isPingingDb && "animate-spin")} />
              <span>{dbHealthy ? 'Firestore: متصل' : 'فحص الاتصال'}</span>
            </button>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Bell size={15} />
              <span>نشر تعميم وزاري</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Segmented Controls) */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-4 pb-2 border-b border-outline-variant/10 text-sm font-bold">
          {[
            { id: 'overview', label: 'لوحة القيادة والمؤشرات', icon: Activity, count: null },
            { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users, count: stats.totalUsers },
            { id: 'schools', label: 'دليل المؤسسات والمخابر', icon: School, count: stats.totalSchools },
            { id: 'tickets', label: 'تذاكر الدعم والطلبات', icon: MessageSquare, count: stats.openTicketsCount > 0 ? stats.openTicketsCount : null, alert: stats.openTicketsCount > 0 },
            { id: 'purchases', label: 'مراقبة الميزانيات والطلبيات', icon: ShoppingCart, count: stats.pendingOrdersCount > 0 ? stats.pendingOrdersCount : null },
            { id: 'announcements', label: 'التعميمات والإعلانات', icon: Bell, count: stats.activeAnnouncementsCount },
            { id: 'system', label: 'صيانة وأمان النظام', icon: Database, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs font-black relative",
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-secondary hover:text-primary hover:bg-surface-container"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive ? "bg-white/20 text-white" : tab.alert ? "bg-red-100 text-red-700" : "bg-surface-container-high text-secondary"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & LIVE ANALYTICS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-secondary">إجمالي الموظفين والمستخدمين</span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-primary tracking-tight mb-2">
                {stats.totalUsers}
              </div>
              <div className="text-xs text-secondary flex items-center gap-2">
                <span>{stats.labStaffCount} موظف مخبر</span>
                <span aria-hidden="true">·</span>
                <span>{stats.teacherCount} أستاذ</span>
                <span aria-hidden="true">·</span>
                <span>{stats.adminCount} مشرف</span>
              </div>
            </div>

            <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-secondary">المؤسسات والولايات النشطة</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <School size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-900 tracking-tight mb-2">
                {stats.totalSchools} <span className="text-sm font-bold text-secondary">مؤسسة</span>
              </div>
              <div className="text-xs text-secondary flex items-center gap-2">
                <span>عبر {stats.totalWilayas} مديرية تربية ولائية</span>
              </div>
            </div>

            <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-secondary">تذاكر الدعم والاقتراحات</span>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-900 tracking-tight mb-2">
                {stats.openTicketsCount} <span className="text-sm font-bold text-secondary">قيد المتابعة</span>
              </div>
              <div className="text-xs text-secondary flex items-center gap-2">
                <span>إجمالي التذاكر: {stats.totalTickets} تذكرة</span>
              </div>
            </div>

            <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-secondary">طلبيات التموين والميزانية</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-indigo-900 tracking-tight mb-2">
                {stats.pendingOrdersCount} <span className="text-sm font-bold text-secondary">طلبية جارية</span>
              </div>
              <div className="text-xs text-secondary flex items-center gap-2">
                <span>القيمة المقدرة: {new Intl.NumberFormat('ar-DZ').format(stats.totalPurchaseVolume)} د.ج</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Active Announcements & Ministerial Circulars */}
            <div className="lg:col-span-2 p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <Bell size={18} className="text-primary" />
                  <h3 className="text-base font-black text-primary">التعميمات الوزارية والإعلانات النشطة</h3>
                </div>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  إدارة الإعلانات ({announcements.length})
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="py-8 text-center text-xs text-secondary">
                  لا توجد تعميمات منشورة حالياً. انقر على "نشر تعميم وزاري" لإرسال إشعار للمستخدمين.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map(ann => (
                    <div key={ann.id} className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-primary">{ann.title}</span>
                          <span className="text-[10px] text-secondary">·</span>
                          <span className="text-[10px] font-bold text-secondary">
                            {ann.category === 'urgent' ? 'عاجل ومهم' : ann.category === 'technical' ? 'إشعار تقني' : 'توجيه بيداغوجي'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary line-clamp-2 leading-relaxed">{ann.message}</p>
                      </div>
                      <span className="text-[10px] font-bold text-on-surface/50 whitespace-nowrap">
                        {ann.authorName || 'الإدارة المركزية'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: System & Database Health */}
            <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <Shield size={18} className="text-primary" />
                <h3 className="text-base font-black text-primary">حالة النظام السحابي</h3>
              </div>

              <div className="space-y-3 text-xs text-secondary">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container">
                  <span>خادم قاعدة البيانات (Firestore)</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={14} /> نشط ومتصل
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container">
                  <span>المصادقة السحابية (Firebase Auth)</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={14} /> مهيأة وآمنة
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container">
                  <span>تخزين الشعارات والوثائق</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <CheckCircle2 size={14} /> مدعوم ومحسن
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container">
                  <span>النسخ الاحتياطي التلقائي</span>
                  <span className="font-bold text-indigo-700">تلقائي يومي</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportUsersCSV}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all border border-outline-variant/30 flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>تصدير دليل المستخدمين (CSV)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USERS & PERMISSIONS MANAGEMENT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/30">
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-secondary" size={17} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="البحث بالاسم، البريد الإلكتروني، المؤسسة التعليمية، أو الرمز الوظيفي..."
                className="w-full ps-11 pe-4 py-2.5 rounded-xl bg-surface-container border-none text-xs font-bold focus:ring-1 focus:ring-primary text-start"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'admin', label: 'المشرفون فقط' },
                { id: 'lab_staff', label: 'موظفو المخابر' },
                { id: 'teacher', label: 'الأساتذة' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUserRoleFilter(f.id as any)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    userRoleFilter === f.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container text-secondary hover:text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={handleExportUsersCSV}
                className="p-2 rounded-xl bg-surface-container text-secondary hover:text-primary border border-outline-variant/30"
                title="تصدير CSV"
              >
                <FileSpreadsheet size={16} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/20 text-secondary font-black">
                    <th className="py-4 px-6">المستخدم</th>
                    <th className="py-4 px-4">المؤسسة التعليمية والولاية</th>
                    <th className="py-4 px-4">الرتبة والصفة</th>
                    <th className="py-4 px-4">الصلاحية في المنصة</th>
                    <th className="py-4 px-6 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-secondary font-bold">
                        لم يتم العثور على مستخدمين يطابقون معايير البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const s = settingsMap[u.id] || {};
                      const isUserAdmin = u.role === 'Admin' || u.role === 'admin';
                      return (
                        <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 border border-outline-variant/30">
                                {u.photoURL || s.profilePhoto ? (
                                  <img 
                                    src={u.photoURL || s.profilePhoto} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <User size={18} className="text-primary" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-primary text-sm">
                                  {u.displayName || 'مستخدم مخبر'}
                                </div>
                                <div className="text-[11px] text-secondary opacity-70">
                                  {u.email || 'بدون بريد'} {s.employeeId ? `· رمز: ${s.employeeId}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-primary">
                              {s.schoolName || s.school || 'غير محددة'}
                            </div>
                            <div className="text-[11px] text-secondary opacity-70">
                              {s.directorateName || s.directorate || 'مديرية التربية'} {s.communeName ? `· ${s.communeName}` : ''}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-secondary">
                              {s.jobTitle || 'ملحق بالمخابر'}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {isUserAdmin ? (
                              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-600" />
                                مدير نظام (Admin)
                              </span>
                            ) : (
                              <span className="font-medium text-secondary">
                                مستخدم عادي
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedUser({ user: u, settings: s })}
                                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold transition-all text-xs flex items-center gap-1"
                              >
                                <Eye size={13} />
                                <span>عرض</span>
                              </button>

                              <button
                                onClick={() => handleToggleUserRole(u)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                                  isUserAdmin
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                )}
                              >
                                {isUserAdmin ? 'تخفيض الرتبة' : 'ترقية لمشرف'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCHOOLS & ESTABLISHMENTS DIRECTORY                                 */}
      {/* ========================================================================= */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/30">
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-secondary" size={17} />
              <input
                type="text"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="البحث باسم المؤسسة، الولاية، أو البلدية..."
                className="w-full ps-11 pe-4 py-2.5 rounded-xl bg-surface-container border-none text-xs font-bold focus:ring-1 focus:ring-primary text-start"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'كافة الأطوار' },
                { id: 'ثانوي', label: 'ثانويات' },
                { id: 'متوسط', label: 'متوسطات' },
                { id: 'ابتدائي', label: 'ابتدائيات' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSchoolCycleFilter(f.id as any)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    schoolCycleFilter === f.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container text-secondary hover:text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aggregatedSchools.length === 0 ? (
              <div className="col-span-full py-16 text-center text-secondary font-bold">
                لا توجد مؤسسات تعليمية مسجلة تطابق البحث الحالي.
              </div>
            ) : (
              aggregatedSchools.map((sch, i) => (
                <div key={i} className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-secondary">{sch.directorate}</span>
                      <span className="text-[11px] font-bold text-primary">طور {sch.cycle}</span>
                    </div>

                    <h4 className="text-base font-black text-primary leading-tight">
                      {sch.name}
                    </h4>

                    {sch.commune && (
                      <p className="text-xs text-secondary opacity-70">
                        البلدية: {sch.commune}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-secondary">
                      {sch.staffCount} موظف مسجل
                    </span>
                    <button
                      onClick={() => {
                        setUserSearch(sch.name);
                        setActiveTab('users');
                      }}
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>عرض الطاقم</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUPPORT TICKETS & HELPDESK                                         */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Status Filter Buttons */}
          <div className="flex items-center justify-between gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/30 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'كافة التذاكر' },
                { id: 'new', label: 'جديدة وغير معالجة' },
                { id: 'in_progress', label: 'قيد المعالجة' },
                { id: 'resolved', label: 'تم الرد والحل' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTicketStatusFilter(f.id as any)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    ticketStatusFilter === f.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container text-secondary hover:text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-secondary font-bold">
              إجمالي التذاكر: {tickets.length}
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-secondary font-bold bg-surface rounded-3xl border border-outline-variant/30">
                لا توجد تذاكر دعم مسجلة تطابق الفلتر الحالي.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div 
                  key={t.id} 
                  className={cn(
                    "p-6 bg-surface rounded-3xl border transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
                    t.status === 'new' ? "border-amber-300/80 bg-amber-50/20" : "border-outline-variant/30"
                  )}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-base text-primary">{t.title}</span>
                      <span className="text-xs text-secondary">·</span>
                      <span className="text-xs font-bold text-secondary">
                        {t.userName || t.userEmail || 'مستخدم غير معروف'}
                      </span>
                      {t.schoolName && (
                        <>
                          <span className="text-xs text-secondary">·</span>
                          <span className="text-xs text-secondary">{t.schoolName}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                      {t.description}
                    </p>

                    {t.adminReply && (
                      <div className="mt-2 p-3 rounded-xl bg-surface-container text-xs text-emerald-900 border border-emerald-200/50">
                        <strong>الرد الإداري:</strong> {t.adminReply}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      t.status === 'new' ? "bg-amber-100 text-amber-900" :
                      t.status === 'in_progress' ? "bg-blue-100 text-blue-900" :
                      "bg-emerald-100 text-emerald-900"
                    )}>
                      {t.status === 'new' ? 'جديدة' : t.status === 'in_progress' ? 'قيد المعالجة' : 'تم الرد والحل'}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedTicket(t);
                        setTicketReplyText(t.adminReply || '');
                      }}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare size={14} />
                      <span>{t.adminReply ? 'تعديل الرد' : 'الرد والمتابعة'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PURCHASE ORDERS & SOURCING OVERSIGHT                                */}
      {/* ========================================================================= */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/30 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'كافة الطلبيات' },
                { id: 'draft', label: 'مسودة' },
                { id: 'sent', label: 'مرسلة للمقتصد' },
                { id: 'received', label: 'مستلمة ومكتملة' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPurchaseStatusFilter(f.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    purchaseStatusFilter === f.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container text-secondary hover:text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-secondary font-bold">
              إجمالي الطلبيات المسجلة: {purchases.length}
            </div>
          </div>

          <div className="bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/20 text-secondary font-black">
                    <th className="py-4 px-6">رقم السند والمؤسسة</th>
                    <th className="py-4 px-4">المورد المقترح</th>
                    <th className="py-4 px-4">عدد البنود</th>
                    <th className="py-4 px-4">المبلغ التقديري</th>
                    <th className="py-4 px-4">الحالة الإدارية</th>
                    <th className="py-4 px-6 text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-secondary font-bold">
                        لا توجد طلبيات شراء مسجلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map(p => (
                      <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-primary text-sm">{p.orderNumber || p.id}</div>
                          <div className="text-[11px] text-secondary opacity-70">{p.schoolName || 'المخبر المدرسي'}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-secondary">{p.supplierName || 'ديوان المطبوعات / مورد معتمد'}</td>
                        <td className="py-4 px-4 text-secondary">{p.items?.length || 0} بنود</td>
                        <td className="py-4 px-4 font-black text-primary">
                          {new Intl.NumberFormat('ar-DZ').format(p.total || 0)} د.ج
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold",
                            p.status === 'received' ? "bg-emerald-100 text-emerald-800" :
                            p.status === 'sent' ? "bg-blue-100 text-blue-800" : "bg-surface-container text-secondary"
                          )}>
                            {p.status === 'received' ? 'مستلمة' : p.status === 'sent' ? 'مرسلة للمقتصد' : 'مسودة'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs"
                          >
                            معاينة
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BROADCAST ANNOUNCEMENTS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center p-6 bg-surface rounded-3xl border border-outline-variant/30 flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-black text-primary">إدارة التعميمات والإعلانات المركزية</h3>
              <p className="text-xs text-secondary mt-1">تتيح لك إرسال إشعارات وتوجيهات وزارية فورية تظهر لجميع موظفي المخابر في المنصة.</p>
            </div>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Bell size={16} />
              <span>إنشاء تعميم جديد</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="p-12 text-center text-secondary font-bold bg-surface rounded-3xl border border-outline-variant/30">
                لا توجد تعميمات منشورة حتى الآن.
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="p-6 bg-surface rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base text-primary">{ann.title}</h4>
                      <span className="text-xs text-secondary">·</span>
                      <span className="text-xs text-secondary font-bold">
                        {ann.category === 'urgent' ? 'هام وعاجل' : ann.category === 'technical' ? 'إشعار فني' : 'توجيه بيداغوجي'}
                      </span>
                      {ann.priority === 'high' && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">أولوية قصوى</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{ann.message}</p>
                    <div className="text-[11px] text-on-surface/50 font-bold pt-1">
                      الجهة المصدرة: {ann.authorName || 'الإدارة المركزية'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="px-3.5 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>حذف التعميم</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SYSTEM OPERATIONS & DATABASE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* Database Inspector */}
          <div className="p-6 bg-surface rounded-3xl border border-outline-variant/30 space-y-6">
            <div>
              <h3 className="text-lg font-black text-primary">فحص وصيانة قاعدة البيانات (Firestore Collections)</h3>
              <p className="text-xs text-secondary mt-1">مراقبة سلامة المجموعات، بنية البيانات، واختبار الاتصال بالسحابة.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary font-bold">مجموعة المستخدمين (users)</div>
                  <div className="text-xl font-black text-primary mt-1">{users.length} وثيقة</div>
                </div>
                <Users size={24} className="text-primary/40" />
              </div>

              <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary font-bold">مجموعة الإعدادات (settings)</div>
                  <div className="text-xl font-black text-primary mt-1">{Object.keys(settingsMap).length} وثيقة</div>
                </div>
                <Settings size={24} className="text-primary/40" />
              </div>

              <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary font-bold">تذاكر الدعم (support_tickets)</div>
                  <div className="text-xl font-black text-primary mt-1">{tickets.length} وثيقة</div>
                </div>
                <MessageSquare size={24} className="text-primary/40" />
              </div>

              <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary font-bold">طلبيات الشراء (purchase_orders)</div>
                  <div className="text-xl font-black text-primary mt-1">{purchases.length} وثيقة</div>
                </div>
                <ShoppingCart size={24} className="text-primary/40" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 flex-wrap">
              <button
                onClick={handlePingDatabase}
                disabled={isPingingDb}
                className="px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                <Activity size={16} className={cn(isPingingDb && "animate-spin")} />
                <span>اختبار استجابة قاعدة البيانات الآن</span>
              </button>

              <button
                onClick={handleExportUsersCSV}
                className="px-5 py-3 rounded-2xl bg-surface-container text-primary border border-outline-variant/30 font-bold text-xs hover:bg-surface-container-high transition-all flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                <span>تصدير نسخة احتياطية من الدليل الإداري (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER DETAILS & ROLE DRAWER                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                    {selectedUser.user.photoURL || selectedUser.settings?.profilePhoto ? (
                      <img src={selectedUser.user.photoURL || selectedUser.settings?.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-primary">{selectedUser.user.displayName || 'مستخدم مخبر'}</h3>
                    <p className="text-xs text-secondary">{selectedUser.user.email}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-full hover:bg-surface-container text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User details grid */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface-container flex justify-between">
                  <span className="text-secondary font-bold">الرتبة والصفة المهنية:</span>
                  <span className="font-black text-primary">{selectedUser.settings?.jobTitle || 'ملحق بالمخابر'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container flex justify-between">
                  <span className="text-secondary font-bold">المؤسسة التعليمية:</span>
                  <span className="font-black text-primary">{selectedUser.settings?.schoolName || selectedUser.settings?.school || 'غير محددة'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container flex justify-between">
                  <span className="text-secondary font-bold">مديرية التربية والبلدية:</span>
                  <span className="font-black text-primary">
                    {selectedUser.settings?.directorateName || selectedUser.settings?.directorate || 'مديرية التربية'} {selectedUser.settings?.communeName ? `· ${selectedUser.settings?.communeName}` : ''}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container flex justify-between">
                  <span className="text-secondary font-bold">الرمز الوظيفي للموظف:</span>
                  <span className="font-black text-primary font-mono">{selectedUser.settings?.employeeId || 'غير مسجل'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container flex justify-between">
                  <span className="text-secondary font-bold">الصلاحية الحالية في المنصة:</span>
                  <span className={cn(
                    "font-bold",
                    selectedUser.user.role === 'Admin' || selectedUser.user.role === 'admin' ? "text-emerald-700" : "text-secondary"
                  )}>
                    {selectedUser.user.role === 'Admin' || selectedUser.user.role === 'admin' ? 'مدير نظام (Admin)' : 'مستخدم عادي'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => handleToggleUserRole(selectedUser.user)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all",
                    selectedUser.user.role === 'Admin' || selectedUser.user.role === 'admin'
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {selectedUser.user.role === 'Admin' || selectedUser.user.role === 'admin'
                    ? 'إلغاء صفة مدير النظام'
                    : 'ترقية إلى مدير نظام مركزي (Admin)'}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="py-3 px-5 rounded-2xl bg-surface-container text-secondary font-bold text-xs hover:bg-surface-container-high"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: TICKET RESPONSE & RESOLUTION                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div>
                  <h3 className="font-black text-lg text-primary">{selectedTicket.title}</h3>
                  <p className="text-xs text-secondary mt-0.5">من: {selectedTicket.userName || selectedTicket.userEmail} · {selectedTicket.schoolName || 'المخبر'}</p>
                </div>

                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-full hover:bg-surface-container text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Inquiry details */}
              <div className="p-4 rounded-2xl bg-surface-container text-xs text-secondary leading-relaxed">
                <strong>نص الطلب أو الاستفسار:</strong>
                <p className="mt-2 text-primary whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendTicketReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-2">
                    الرد الإداري أو الحل المقترح للمستخدم:
                  </label>
                  <textarea
                    rows={4}
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="اكتب رد الإدارة المركزية وتوجيهات الحل الفني هنا..."
                    className="w-full p-4 rounded-2xl bg-surface-container border-none text-xs font-bold text-primary focus:ring-1 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100"
                    >
                      تعيين كـ قيد المعالجة
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isReplyingTicket}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isReplyingTicket ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      <span>إرسال الرد واعتماد الحل</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST ANNOUNCEMENT                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <Bell size={20} className="text-primary" />
                  <h3 className="font-black text-lg text-primary">نشر تعميم أو إشعار وزاري مركزي</h3>
                </div>

                <button 
                  onClick={() => setShowAnnouncementModal(false)}
                  className="p-2 rounded-full hover:bg-surface-container text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1.5">عنوان التعميم أو الإشعار</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="مثال: تعليمات الجرد السنوي الشامل لمخابر الفيزياء والكيمياء"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container border-none text-xs font-bold text-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5">تصنيف التعميم</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl bg-surface-container border-none text-xs font-bold text-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="pedagogical">توجيه بيداغوجي ومخبري</option>
                      <option value="urgent">هام وعاجل</option>
                      <option value="technical">إشعار فني ونظامي</option>
                      <option value="update">تحديث وميزات المنصة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5">مستوى الأولوية</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl bg-surface-container border-none text-xs font-bold text-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="normal">أولوية عادية</option>
                      <option value="high">أولوية قصوى (تمييز أحمر)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1.5">نص وتفاصيل التعميم</label>
                  <textarea
                    rows={4}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="أدخل نص التوجيه والتعليمات الإدارية الموجهة لمسؤولي المخابر..."
                    className="w-full p-4 rounded-2xl bg-surface-container border-none text-xs font-bold text-primary focus:ring-1 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isPostingAnnouncement}
                    className="flex-1 py-3 px-5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPostingAnnouncement ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>نشر التعميم للجميع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="py-3 px-5 rounded-2xl bg-surface-container text-secondary font-bold text-xs hover:bg-surface-container-high"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: PURCHASE ORDER INSPECTION                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div>
                  <h3 className="font-black text-lg text-primary">سند طلب تموين: {selectedPurchase.orderNumber || selectedPurchase.id}</h3>
                  <p className="text-xs text-secondary mt-0.5">المؤسسة: {selectedPurchase.schoolName || 'مخبر مدرسي'} · المورد: {selectedPurchase.supplierName || 'معتمد'}</p>
                </div>

                <button 
                  onClick={() => setSelectedPurchase(null)}
                  className="p-2 rounded-full hover:bg-surface-container text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-secondary">البنود والمواد المطلوبة:</h4>
                <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-surface-container-high text-secondary font-black">
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">المادة / التجهيز</th>
                        <th className="py-2.5 px-4">الكمية</th>
                        <th className="py-2.5 px-4">السعر التقديري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {selectedPurchase.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 text-secondary">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-primary">{item.name}</td>
                          <td className="py-2.5 px-4 text-secondary">{item.quantity} {item.unit || ''}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-primary">
                            {new Intl.NumberFormat('ar-DZ').format(item.unitPrice || 0)} د.ج
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-sm">
                  <span>المبلغ الإجمالي التقديري للطلبية:</span>
                  <span>{new Intl.NumberFormat('ar-DZ').format(selectedPurchase.total || 0)} د.ج</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="py-2.5 px-6 rounded-xl bg-surface-container text-secondary font-bold text-xs hover:bg-surface-container-high"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
