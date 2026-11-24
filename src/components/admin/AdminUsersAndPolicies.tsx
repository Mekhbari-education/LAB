import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  Ban,
  Check,
  Trash2,
  KeyRound,
  Lock,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  X,
  RotateCcw,
  Save,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { doc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, PROJECT_OWNER_EMAIL } from '../../firebase';
import { ROLE_CONFIGS, UserRole } from '../../context/UserRoleContext';
import { ROLE_PERMITTED_ROUTES } from '../../config/permissions';
import { ROUTES } from '../../config/routes';
import { GlobalSystemConfig, RoleRouteOverride } from '../../context/SystemConfigContext';
import { cn } from '../../lib/utils';
import {
  AdminUser,
  DelegatedAdminEntry,
  ROUTE_ARABIC_LABELS,
  SystemActivityLog,
  UserSettings,
  WORKSPACE_ROLE_KEYS,
  downloadCSV,
  formatDateTime,
  resolveEffectiveWorkspaceRole,
} from './adminTypes';
import { recordOwnerAudit } from './adminAudit';

interface AdminUsersAndPoliciesProps {
  mode: 'users' | 'policies';
  users: AdminUser[];
  settingsMap: Record<string, UserSettings>;
  delegatedAdmins: DelegatedAdminEntry[];
  activityLogs: SystemActivityLog[];
  systemConfig: GlobalSystemConfig;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminUsersAndPolicies({
  mode,
  users,
  settingsMap,
  delegatedAdmins,
  activityLogs,
  systemConfig,
  onShowToast,
}: AdminUsersAndPoliciesProps) {
  // Users filters & bulk selection
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole | 'disabled'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkTargetRole, setBulkTargetRole] = useState<UserRole>('lab_manager');
  const [isBulkMutating, setIsBulkMutating] = useState(false);

  // Single user inspector & delete modal
  const [inspectedUser, setInspectedUser] = useState<{
    user: AdminUser;
    settings?: UserSettings;
  } | null>(null);
  const [userPendingDelete, setUserPendingDelete] = useState<AdminUser | null>(null);
  const [isMutatingUser, setIsMutatingUser] = useState<string | null>(null);

  // Policies / dynamic RBAC matrix state
  const [selectedPolicyRole, setSelectedPolicyRole] = useState<UserRole>('lab_manager');
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [draftOverrides, setDraftOverrides] = useState<Partial<Record<UserRole, RoleRouteOverride>>>(
    () => systemConfig.roleRouteOverrides || {}
  );
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Sync draftOverrides when systemConfig updates externally if user hasn't modified
  const [hasUnsavedPolicyEdits, setHasUnsavedPolicyEdits] = useState(false);

  const effectiveOverrides = hasUnsavedPolicyEdits
    ? draftOverrides
    : systemConfig.roleRouteOverrides || {};

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const s = settingsMap[u.id] || {};
      const displayName = u.name || u.displayName || '';
      const schoolName = u.institution || s.schoolName || s.school || '';
      const directorate = u.directorate || s.directorateName || s.directorate || '';
      const jobTitle = u.grade || u.roleTitle || s.jobTitle || '';
      const empId = u.nationalId || s.employeeId || '';

      const matchesSearch =
        !q ||
        displayName.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        schoolName.toLowerCase().includes(q) ||
        directorate.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q) ||
        empId.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (userRoleFilter === 'all') return true;
      if (userRoleFilter === 'disabled') return Boolean(u.disabled);
      return resolveEffectiveWorkspaceRole(u) === userRoleFilter;
    });
  }, [users, settingsMap, userSearch, userRoleFilter]);

  const toggleUserSelection = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([...selectedUserIds, ...filteredUsers.map((u) => u.id)]);
      setSelectedUserIds(Array.from(merged));
    }
  };

  // --- Single User Mutations ---
  const handleAssignWorkspaceRole = async (targetUser: AdminUser, newRole: UserRole) => {
    setIsMutatingUser(targetUser.id);
    try {
      const roleInfo = ROLE_CONFIGS[newRole];
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: newRole,
        roleOverride: newRole,
        roleTitle: roleInfo.label,
        updatedAt: serverTimestamp(),
      });
      try {
        await setDoc(
          doc(db, 'settings', targetUser.id),
          { jobTitle: roleInfo.label, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch {
        // optional settings sync
      }

      await recordOwnerAudit({
        action: 'USER_ROLE_ASSIGN',
        targetType: 'user',
        targetIds: [targetUser.id],
        summary: `تعيين رتبة (${roleInfo.label}) للمستخدم ${targetUser.email || targetUser.id}`,
        details: { newRole },
      });

      onShowToast(
        `تم تعيين صلاحية "${roleInfo.label}" للمستخدم ${targetUser.name || targetUser.email || ''}.`,
        'success'
      );

      if (inspectedUser?.user.id === targetUser.id) {
        setInspectedUser({
          ...inspectedUser,
          user: { ...targetUser, role: newRole, roleOverride: newRole, roleTitle: roleInfo.label },
        });
      }
    } catch (err: any) {
      onShowToast('فشل تعديل الرتبة: ' + (err?.message || ''), 'error');
    } finally {
      setIsMutatingUser(null);
    }
  };

  const handleToggleUserDisabled = async (targetUser: AdminUser) => {
    if ((targetUser.email || '').trim().toLowerCase() === PROJECT_OWNER_EMAIL) {
      onShowToast('لا يمكن تعليق حساب مالك المشروع.', 'error');
      return;
    }
    const nextDisabled = !targetUser.disabled;
    setIsMutatingUser(targetUser.id);
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        disabled: nextDisabled,
        updatedAt: serverTimestamp(),
      });

      await recordOwnerAudit({
        action: nextDisabled ? 'USER_SUSPEND' : 'USER_ACTIVATE',
        targetType: 'user',
        targetIds: [targetUser.id],
        summary: `${nextDisabled ? 'تعليق' : 'إعادة تفعيل'} حساب ${targetUser.email || targetUser.id}`,
      });

      onShowToast(
        nextDisabled ? 'تم تعليق صلاحيات المستخدم مؤقتاً.' : 'تم إعادة تفعيل حساب المستخدم.',
        'success'
      );
      if (inspectedUser?.user.id === targetUser.id) {
        setInspectedUser({ ...inspectedUser, user: { ...targetUser, disabled: nextDisabled } });
      }
    } catch (err: any) {
      onShowToast('فشل تحديث حالة الحساب: ' + (err?.message || ''), 'error');
    } finally {
      setIsMutatingUser(null);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userPendingDelete) return;
    if ((userPendingDelete.email || '').trim().toLowerCase() === PROJECT_OWNER_EMAIL) {
      onShowToast('لا يمكن حذف سجل مالك المشروع.', 'error');
      setUserPendingDelete(null);
      return;
    }
    const target = userPendingDelete;
    setIsMutatingUser(target.id);
    try {
      await deleteDoc(doc(db, 'users', target.id));
      await recordOwnerAudit({
        action: 'USER_DELETE',
        targetType: 'user',
        targetIds: [target.id],
        summary: `حذف سجل المستخدم ${target.email || target.displayName || target.id}`,
      });
      onShowToast(`تم حذف سجل المستخدم ${target.email || target.id}.`, 'success');
      if (inspectedUser?.user.id === target.id) setInspectedUser(null);
      setSelectedUserIds((prev) => prev.filter((id) => id !== target.id));
      setUserPendingDelete(null);
    } catch (err: any) {
      onShowToast('فشل حذف المستخدم: ' + (err?.message || ''), 'error');
    } finally {
      setIsMutatingUser(null);
    }
  };

  const handleToggleLegislationDelegate = async (targetUser: AdminUser) => {
    const existing = delegatedAdmins.find((a) => a.id === targetUser.id && a.active === true);
    setIsMutatingUser(targetUser.id);
    try {
      if (existing) {
        await deleteDoc(doc(db, 'admins', targetUser.id));
        await recordOwnerAudit({
          action: 'DELEGATE_REVOKE',
          targetType: 'admin_delegate',
          targetIds: [targetUser.id],
          summary: `سحب تفويض التشريع من ${targetUser.email || targetUser.id}`,
        });
        onShowToast('تم سحب تفويض تحرير التشريع العام.', 'info');
      } else {
        await setDoc(doc(db, 'admins', targetUser.id), {
          email: targetUser.email || '',
          name: targetUser.name || targetUser.displayName || 'مشرف تشريع',
          active: true,
          grantedBy: PROJECT_OWNER_EMAIL,
          updatedAt: serverTimestamp(),
        });
        await recordOwnerAudit({
          action: 'DELEGATE_GRANT',
          targetType: 'admin_delegate',
          targetIds: [targetUser.id],
          summary: `منح تفويض التشريع العام إلى ${targetUser.email || targetUser.id}`,
        });
        onShowToast('تم تفويض إدارة التشريع المدرسي فقط (بدون صلاحية المالك).', 'success');
      }
    } catch (err: any) {
      onShowToast('فشل تحديث التفويض: ' + (err?.message || ''), 'error');
    } finally {
      setIsMutatingUser(null);
    }
  };

  // --- Bulk Actions ---
  const handleBulkAssignRole = async () => {
    if (selectedUserIds.length === 0) return;
    setIsBulkMutating(true);
    const roleInfo = ROLE_CONFIGS[bulkTargetRole];
    try {
      await Promise.all(
        selectedUserIds.map((uid) =>
          updateDoc(doc(db, 'users', uid), {
            role: bulkTargetRole,
            roleOverride: bulkTargetRole,
            roleTitle: roleInfo.label,
            updatedAt: serverTimestamp(),
          })
        )
      );
      await recordOwnerAudit({
        action: 'BULK_ROLE_ASSIGN',
        targetType: 'users',
        targetIds: selectedUserIds,
        summary: `تعيين جماعي لرتبة (${roleInfo.label}) لعدد ${selectedUserIds.length} مستخدم`,
        details: { newRole: bulkTargetRole, count: selectedUserIds.length },
      });
      onShowToast(`تم تحديث رتبة ${selectedUserIds.length} مستخدمين إلى "${roleInfo.label}".`, 'success');
      setSelectedUserIds([]);
    } catch (err: any) {
      onShowToast('فشل التحديث الجماعي: ' + (err?.message || ''), 'error');
    } finally {
      setIsBulkMutating(false);
    }
  };

  const handleBulkSetDisabled = async (disabled: boolean) => {
    const eligibleIds = selectedUserIds.filter((uid) => {
      const u = users.find((item) => item.id === uid);
      return (u?.email || '').trim().toLowerCase() !== PROJECT_OWNER_EMAIL;
    });
    if (eligibleIds.length === 0) {
      onShowToast('لا توجد حسابات قابلة للتعديل ضمن التحديد.', 'info');
      return;
    }
    setIsBulkMutating(true);
    try {
      await Promise.all(
        eligibleIds.map((uid) =>
          updateDoc(doc(db, 'users', uid), {
            disabled,
            updatedAt: serverTimestamp(),
          })
        )
      );
      await recordOwnerAudit({
        action: disabled ? 'BULK_SUSPEND' : 'BULK_ACTIVATE',
        targetType: 'users',
        targetIds: eligibleIds,
        summary: `${disabled ? 'تعليق' : 'تفعيل'} جماعي لعدد ${eligibleIds.length} حساب`,
      });
      onShowToast(
        `${disabled ? 'تم تعليق' : 'تم تفعيل'} ${eligibleIds.length} حساباً بنجاح.`,
        'success'
      );
      setSelectedUserIds([]);
    } catch (err: any) {
      onShowToast('فشل العملية الجماعية: ' + (err?.message || ''), 'error');
    } finally {
      setIsBulkMutating(false);
    }
  };

  const handleExportCSV = (subset?: AdminUser[]) => {
    const source = subset && subset.length > 0 ? subset : filteredUsers;
    const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'رتبة الفضاء', 'المؤسسة', 'الولاية', 'الحالة'];
    const rows = source.map((u) => {
      const s = settingsMap[u.id] || {};
      const rKey = resolveEffectiveWorkspaceRole(u);
      return [
        u.id,
        u.name || u.displayName || 'غير محدد',
        u.email || '',
        ROLE_CONFIGS[rKey]?.label || rKey,
        u.institution || s.schoolName || s.school || 'غير محددة',
        u.wilaya || u.directorate || s.directorateName || '',
        u.disabled ? 'معلق' : 'نشط',
      ];
    });
    downloadCSV(`users_export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    onShowToast(`تم تصدير ${source.length} مستخدم إلى ملف CSV.`, 'success');
  };

  // --- Policy Matrix Helpers ---
  const allUniqueRoutes = useMemo(() => {
    return Array.from(new Set(Object.values(ROLE_PERMITTED_ROUTES).flat())).filter((route) => {
      if (route === ROUTES.ADMIN) return false;
      const q = routeSearchQuery.trim().toLowerCase();
      if (!q) return true;
      const ar = (ROUTE_ARABIC_LABELS[route] || '').toLowerCase();
      return route.toLowerCase().includes(q) || ar.includes(q);
    });
  }, [routeSearchQuery]);

  const isRouteAllowedInDraft = (role: UserRole, route: string): boolean => {
    const baseAllowed = (ROLE_PERMITTED_ROUTES[role] || []).includes(route);
    const ov = effectiveOverrides[role];
    if (ov?.blocked?.includes(route)) return false;
    if (ov?.added?.includes(route)) return true;
    return baseAllowed;
  };

  const handleTogglePolicyRoute = (role: UserRole, route: string) => {
    const currentAllowed = isRouteAllowedInDraft(role, route);
    const baseAllowed = (ROLE_PERMITTED_ROUTES[role] || []).includes(route);
    const currentRoleOv = effectiveOverrides[role] || { added: [], blocked: [] };
    let nextAdded = [...(currentRoleOv.added || [])];
    let nextBlocked = [...(currentRoleOv.blocked || [])];

    if (currentAllowed) {
      // Turning OFF
      nextAdded = nextAdded.filter((r) => r !== route);
      if (baseAllowed && !nextBlocked.includes(route)) {
        nextBlocked.push(route);
      }
    } else {
      // Turning ON
      nextBlocked = nextBlocked.filter((r) => r !== route);
      if (!baseAllowed && !nextAdded.includes(route)) {
        nextAdded.push(route);
      }
    }

    setDraftOverrides({
      ...effectiveOverrides,
      [role]: { added: nextAdded, blocked: nextBlocked },
    });
    setHasUnsavedPolicyEdits(true);
  };

  const handleResetRolePolicy = (role: UserRole) => {
    const copy = { ...effectiveOverrides };
    delete copy[role];
    setDraftOverrides(copy);
    setHasUnsavedPolicyEdits(true);
  };

  const handleSavePolicyOverrides = async () => {
    setIsSavingPolicy(true);
    try {
      await setDoc(
        doc(db, 'system_config', 'global'),
        {
          roleRouteOverrides: effectiveOverrides,
          updatedBy: PROJECT_OWNER_EMAIL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await recordOwnerAudit({
        action: 'POLICY_OVERRIDES_UPDATE',
        targetType: 'system_config',
        targetIds: ['global'],
        summary: 'تحديث مصفوفة الصلاحيات والمسارات الديناميكية للأدوار',
        details: { roleRouteOverrides: effectiveOverrides },
      });
      setHasUnsavedPolicyEdits(false);
      onShowToast('تم حفظ مصفوفة الصلاحيات وتفعيلها فوراً عبر المنصة.', 'success');
    } catch (err: any) {
      onShowToast('فشل حفظ السياسات: ' + (err?.message || ''), 'error');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  if (mode === 'policies') {
    const roleOv = effectiveOverrides[selectedPolicyRole];
    const overrideCount = (roleOv?.added?.length || 0) + (roleOv?.blocked?.length || 0);

    return (
      <div className="space-y-6">
        {/* Owner-Only Lock Summary */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-primary">
                حماية المالك الحصرية · Owner Lock Security
              </h2>
              <p className="text-xs text-on-surface/70 mt-0.5">
                المسار <span className="font-mono font-bold">/admin</span> وجميع عمليات الكتابة الحساسة مقفلة برمجياً وعلى مستوى قواعد Firestore للبريد الموثق{' '}
                <span className="font-mono font-bold text-primary">{PROJECT_OWNER_EMAIL}</span> فقط.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleResetRolePolicy(selectedPolicyRole)}
              disabled={overrideCount === 0}
              className="px-3 py-2 rounded-lg border border-outline/15 text-xs font-bold text-on-surface/75 hover:border-primary/40 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>استعادة افتراضي الدور</span>
            </button>
            <button
              type="button"
              onClick={handleSavePolicyOverrides}
              disabled={isSavingPolicy || !hasUnsavedPolicyEdits}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSavingPolicy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>حفظ السياسات الحية</span>
            </button>
          </div>
        </div>

        {/* Interactive Role Route Policy Editor */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-outline/10 pb-3">
            <div>
              <h3 className="text-sm font-black text-primary">
                مصفوفة التحكم الديناميكي بالمسارات · Dynamic RBAC Matrix
              </h3>
              <p className="text-[11px] text-on-surface/65">
                فعّل أو عطل أي صفحة لكل رتبة وظيفية، وسينعكس التغيير مباشرة في القوائم وحماية المسارات لجميع المستخدمين
              </p>
            </div>

            <div className="relative w-full lg:w-64">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
              <input
                type="text"
                value={routeSearchQuery}
                onChange={(e) => setRouteSearchQuery(e.target.value)}
                placeholder="بحث عن مسار أو صفحة..."
                className="w-full ps-8 pe-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {WORKSPACE_ROLE_KEYS.map((rk) => {
              const info = ROLE_CONFIGS[rk];
              const ov = effectiveOverrides[rk];
              const delta = (ov?.added?.length || 0) + (ov?.blocked?.length || 0);
              return (
                <button
                  key={rk}
                  type="button"
                  onClick={() => setSelectedPolicyRole(rk)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer',
                    selectedPolicyRole === rk
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline/15 text-on-surface/80 hover:border-primary/40'
                  )}
                >
                  <span>{info.shortLabel}</span>
                  {delta > 0 && (
                    <span className="font-mono text-[10px] opacity-85">+{delta} تعديل</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pe-1">
            {allUniqueRoutes.map((route) => {
              const allowed = isRouteAllowedInDraft(selectedPolicyRole, route);
              const baseAllowed = (ROLE_PERMITTED_ROUTES[selectedPolicyRole] || []).includes(route);
              const isOverridden = allowed !== baseAllowed;

              return (
                <button
                  key={route}
                  type="button"
                  onClick={() => handleTogglePolicyRoute(selectedPolicyRole, route)}
                  className={cn(
                    'text-start p-3 rounded-lg border transition-colors flex items-center justify-between gap-2 cursor-pointer',
                    allowed
                      ? 'bg-surface-container-low border-primary/30'
                      : 'bg-surface border-outline/15 opacity-70'
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-on-surface truncate">
                      {ROUTE_ARABIC_LABELS[route] || route}
                    </div>
                    <div className="text-[10px] font-mono text-on-surface/55 truncate mt-0.5">
                      {route}
                      {isOverridden ? ' · مخصص' : ''}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center',
                      allowed ? 'bg-primary justify-end' : 'bg-outline/30 justify-start'
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delegated Legislation Admins (/admins) */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline/15 space-y-3">
          <div>
            <h3 className="text-sm font-black text-primary">
              مفوضو التشريع العام · Delegated Legislation Editors (/admins)
            </h3>
            <p className="text-[11px] text-on-surface/65">
              المستخدمون المفوضون لتحرير نصوص التشريع المدرسي العام فقط دون أي صلاحية للدخول إلى لوحة الإدارة المركزية
            </p>
          </div>
          {delegatedAdmins.length === 0 ? (
            <p className="text-xs text-on-surface/55 py-4">
              لا يوجد مفوضون حالياً. يمكنك تفويض أي مستخدم من بطاقته في قسم «إدارة المستخدمين».
            </p>
          ) : (
            <div className="divide-y divide-outline/10">
              {delegatedAdmins.map((entry) => (
                <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-primary">{entry.name || entry.id}</div>
                    <div className="font-mono text-[11px] text-on-surface/65">{entry.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteDoc(doc(db, 'admins', entry.id));
                      await recordOwnerAudit({
                        action: 'DELEGATE_REVOKE',
                        targetType: 'admin_delegate',
                        targetIds: [entry.id],
                        summary: `سحب تفويض التشريع من ${entry.email || entry.id}`,
                      });
                      onShowToast('تم سحب التفويض بنجاح.', 'info');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-error/30 text-error font-bold hover:bg-error/10 cursor-pointer"
                  >
                    سحب التفويض
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- USERS WORKSPACE ---
  return (
    <div className="space-y-5">
      {/* Search, Role Filter & Export */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="بحث بالاسم، البريد، المؤسسة، أو رقم التعريف..."
              className="w-full ps-9 pe-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs outline-none focus:border-primary"
            />
          </div>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold outline-none focus:border-primary"
          >
            <option value="all">جميع الرتب ({users.length})</option>
            {WORKSPACE_ROLE_KEYS.map((rk) => (
              <option key={rk} value={rk}>
                {ROLE_CONFIGS[rk].shortLabel}
              </option>
            ))}
            <option value="disabled">الحسابات المعلقة</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCSV()}
            className="px-3.5 py-2 rounded-lg border border-outline/15 bg-surface text-xs font-bold text-primary hover:border-primary/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>تصدير الدليل CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-primary text-on-primary p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="font-mono tabular-nums">{selectedUserIds.length}</span>
              <span>مستخدمين محددين · Bulk Operations</span>
              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="text-[11px] underline opacity-85 hover:opacity-100 cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={bulkTargetRole}
                onChange={(e) => setBulkTargetRole(e.target.value as UserRole)}
                className="px-2.5 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs outline-none"
              >
                {WORKSPACE_ROLE_KEYS.map((rk) => (
                  <option key={rk} value={rk}>
                    {ROLE_CONFIGS[rk].shortLabel}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleBulkAssignRole}
                disabled={isBulkMutating}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 font-bold cursor-pointer disabled:opacity-50"
              >
                تعيين الرتبة
              </button>

              <button
                type="button"
                onClick={() => handleBulkSetDisabled(true)}
                disabled={isBulkMutating}
                className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 font-bold cursor-pointer disabled:opacity-50"
              >
                تعليق
              </button>

              <button
                type="button"
                onClick={() => handleBulkSetDisabled(false)}
                disabled={isBulkMutating}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 font-bold cursor-pointer disabled:opacity-50"
              >
                تفعيل
              </button>

              <button
                type="button"
                onClick={() =>
                  handleExportCSV(users.filter((u) => selectedUserIds.includes(u.id)))
                }
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 font-bold cursor-pointer"
              >
                تصدير المحدد
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-surface-container-low border-b border-outline/10 text-on-surface/75 font-black">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAllFiltered}
                    aria-label="تحديد الكل"
                    className="p-1 text-primary cursor-pointer"
                  >
                    {allFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="py-3 px-3 text-start">المستخدم · User</th>
                <th className="py-3 px-3 text-start">المؤسسة · School</th>
                <th className="py-3 px-3 text-start">الرتبة الوظيفية · Role</th>
                <th className="py-3 px-3 text-center">الحالة · Status</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface/50">
                    لا توجد حسابات مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const s = settingsMap[u.id] || {};
                  const roleKey = resolveEffectiveWorkspaceRole(u);
                  const roleInfo = ROLE_CONFIGS[roleKey];
                  const isOwnerUser =
                    (u.email || '').trim().toLowerCase() === PROJECT_OWNER_EMAIL;
                  const isSelected = selectedUserIds.includes(u.id);

                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        'hover:bg-surface-container-low/50 transition-colors',
                        isSelected && 'bg-primary/5'
                      )}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleUserSelection(u.id)}
                          className="p-1 text-primary cursor-pointer"
                        >
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-primary flex items-center gap-1.5">
                          <span>{u.name || u.displayName || 'مستخدم'}</span>
                          {isOwnerUser && (
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                              OWNER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-on-surface/60">
                          {u.email || u.id}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-on-surface/85">
                          {u.institution || s.schoolName || s.school || 'غير محددة'}
                        </div>
                        <div className="text-[11px] text-on-surface/55">
                          {u.wilaya || u.directorate || s.directorateName || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-on-surface">{roleInfo.shortLabel}</div>
                        <div className="text-[11px] text-on-surface/60 truncate max-w-[190px]">
                          {u.grade || s.jobTitle || roleInfo.label}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {u.disabled ? (
                          <span className="text-error">معلق · Suspended</span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">نشط · Active</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectedUser({ user: u, settings: s })}
                            title="معاينة 360°"
                            className="p-1.5 rounded-lg hover:bg-surface-container text-primary cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          {!isOwnerUser && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleUserDisabled(u)}
                                disabled={isMutatingUser === u.id}
                                title={u.disabled ? 'تفعيل' : 'تعليق'}
                                className={cn(
                                  'p-1.5 rounded-lg hover:bg-surface-container cursor-pointer',
                                  u.disabled ? 'text-emerald-700' : 'text-amber-700'
                                )}
                              >
                                {u.disabled ? <Check size={15} /> : <Ban size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setUserPendingDelete(u)}
                                title="حذف"
                                className="p-1.5 rounded-lg hover:bg-error/10 text-error cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
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

      {/* 360° User Inspector Drawer */}
      <AnimatePresence>
        {inspectedUser && (
          <div className="fixed inset-0 z-[90] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedUser(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full max-w-lg bg-surface h-full shadow-2xl border-e border-outline/15 flex flex-col z-10 overflow-hidden"
            >
              <div className="p-5 border-b border-outline/10 flex items-center justify-between gap-3 bg-surface-container-lowest">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-primary truncate">
                    {inspectedUser.user.name || inspectedUser.user.displayName || 'تفاصيل المستخدم'}
                  </h3>
                  <p className="text-[11px] font-mono text-on-surface/65 truncate">
                    {inspectedUser.user.email || inspectedUser.user.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="p-2 rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 space-y-2.5">
                  <h4 className="font-black text-primary">الهوية والربط المؤسساتي · Statutory Profile</h4>
                  <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                    <div>
                      <span className="text-on-surface/60 block">المؤسسة:</span>
                      <span className="font-bold">
                        {inspectedUser.user.institution ||
                          inspectedUser.settings?.schoolName ||
                          'غير محددة'}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface/60 block">الولاية / المديرية:</span>
                      <span className="font-bold">
                        {inspectedUser.user.wilaya || inspectedUser.user.directorate || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface/60 block">رقم التعريف NIN:</span>
                      <span className="font-mono font-bold">
                        {inspectedUser.user.nationalId || inspectedUser.settings?.employeeId || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface/60 block">معرف المؤسسة schoolId:</span>
                      <span className="font-mono font-bold truncate block">
                        {inspectedUser.user.schoolId || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Reassignment */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 space-y-3">
                  <div className="flex items-center gap-2 font-black text-primary">
                    <UserCog size={16} />
                    <span>تعيين رتبة فضاء العمل · Role Override</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {WORKSPACE_ROLE_KEYS.map((rk) => {
                      const active = resolveEffectiveWorkspaceRole(inspectedUser.user) === rk;
                      return (
                        <button
                          key={rk}
                          type="button"
                          disabled={isMutatingUser === inspectedUser.user.id}
                          onClick={() => handleAssignWorkspaceRole(inspectedUser.user, rk)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-start font-bold transition-colors cursor-pointer',
                            active
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface border-outline/15 hover:border-primary/40'
                          )}
                        >
                          {ROLE_CONFIGS[rk].shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delegation & Account Status */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 space-y-3">
                  <div className="font-black text-primary flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>الحالة والتفويض · Status & Delegation</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLegislationDelegate(inspectedUser.user)}
                      disabled={isMutatingUser === inspectedUser.user.id}
                      className="px-3 py-2 rounded-lg border border-outline/20 font-bold hover:border-primary/40 cursor-pointer"
                    >
                      {delegatedAdmins.some(
                        (a) => a.id === inspectedUser.user.id && a.active === true
                      )
                        ? 'سحب تفويض التشريع'
                        : 'منح تفويض التشريع العام'}
                    </button>

                    {(inspectedUser.user.email || '').toLowerCase() !== PROJECT_OWNER_EMAIL && (
                      <button
                        type="button"
                        onClick={() => handleToggleUserDisabled(inspectedUser.user)}
                        disabled={isMutatingUser === inspectedUser.user.id}
                        className={cn(
                          'px-3 py-2 rounded-lg font-bold cursor-pointer',
                          inspectedUser.user.disabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-error/10 text-error'
                        )}
                      >
                        {inspectedUser.user.disabled ? 'إعادة تفعيل الحساب' : 'تعليق الحساب'}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Recent Activity */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/15 space-y-2.5">
                  <h4 className="font-black text-primary">أحدث نشاطات المستخدم · Recent Logs</h4>
                  {(() => {
                    const uLogs = activityLogs
                      .filter(
                        (l) =>
                          l.userId === inspectedUser.user.id ||
                          (l.userEmail && l.userEmail === inspectedUser.user.email)
                      )
                      .slice(0, 8);
                    if (uLogs.length === 0) {
                      return <p className="text-on-surface/55">لا توجد سجلات نشاط مسجلة لهذا المستخدم.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {uLogs.map((l) => (
                          <div key={l.id} className="p-2.5 rounded-lg bg-surface-container-low text-[11px]">
                            <div className="flex justify-between font-bold">
                              <span className="text-primary">{l.action} · {l.module}</span>
                              <span className="font-mono text-on-surface/55">
                                {formatDateTime(l.timestamp)}
                              </span>
                            </div>
                            <p className="text-on-surface/75 mt-0.5">{l.details}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userPendingDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              onClick={() => setUserPendingDelete(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />
            <div className="relative bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-error">
                <ShieldAlert size={24} />
                <h3 className="text-base font-black">تأكيد حذف سجل المستخدم</h3>
              </div>
              <p className="text-xs text-on-surface/80 leading-relaxed">
                هل أنت متأكد من حذف وثيقة المستخدم{' '}
                <strong>{userPendingDelete.name || userPendingDelete.email}</strong> نهائياً من قاعدة البيانات؟
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserPendingDelete(null)}
                  className="px-4 py-2 rounded-lg border border-outline/15 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={isMutatingUser === userPendingDelete.id}
                  className="px-4 py-2 rounded-lg bg-error text-on-error text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
