import { addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, getUserCollection } from '../firebase';

// ─── Logger موحّد: يُطبع في بيئة التطوير فقط ──────────────────────────────
const isDev = import.meta.env.DEV;
export const logger = {
  log:   (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  info:  (...args: unknown[]) => { if (isDev) console.info(...args); },
};
// ───────────────────────────────────────────────────────────────────────────

export enum LogAction {
  CREATE = 'إنشاء',
  UPDATE = 'تعديل',
  DELETE = 'حذف',
  IMPORT = 'استيراد',
  EXPORT = 'تصدير',
  LOGIN = 'تسجيل دخول',
  LOGOUT = 'تسجيل خروج'
}

export enum LogModule {
  EQUIPMENT = 'الأجهزة',
  CHEMICALS = 'المواد الكيميائية',
  CONSUMABLES = 'المواد الاستهلاكية',
  REPORTS = 'التقارير',
  TEACHERS = 'الأساتذة',
  SAFETY = 'الأمن والسلامة',
  BACKUP = 'النسخ الاحتياطي'
}

export async function logActivity(
  schoolId: string,
  action: LogAction,
  module: LogModule,
  details: string,
  targetId?: string
) {
  if (!auth.currentUser) return;

  try {
    const logData: Record<string, any> = {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'مستخدم',
      userEmail: auth.currentUser.email || '',
      action,
      module,
      details,
      timestamp: serverTimestamp()
    };
    if (targetId !== undefined && targetId !== null) {
      logData.targetId = targetId;
    }
    await addDoc(getUserCollection(schoolId, 'logs'), logData);
  } catch (error) {
    logger.error('Error logging activity:', error);
  }
}
