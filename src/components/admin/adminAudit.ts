import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, PROJECT_OWNER_EMAIL } from '../../firebase';

export interface RecordOwnerAuditInput {
  action: string;
  targetType: string;
  targetIds?: string[];
  summary: string;
  details?: Record<string, any>;
}

/**
 * Writes an immutable audit entry to /admin_audit_logs (owner-only create, update/delete denied in rules).
 */
export async function recordOwnerAudit(input: RecordOwnerAuditInput): Promise<void> {
  try {
    const ref = doc(collection(db, 'admin_audit_logs'));
    await setDoc(ref, {
      action: input.action,
      actorEmail: auth.currentUser?.email || PROJECT_OWNER_EMAIL,
      targetType: input.targetType,
      targetIds: input.targetIds || [],
      summary: input.summary,
      details: input.details || {},
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to write admin_audit_logs:', err);
  }
}
