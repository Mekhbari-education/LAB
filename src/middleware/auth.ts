import { Request, Response, NextFunction } from 'express';
import { adminAuth, getAdminFirestore } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  schoolId?: string;
  isAdmin?: boolean;
}

// In-memory cache for user school membership (5-minute TTL to reduce Firestore reads)
const schoolMembershipCache = new Map<string, { schoolId: string; expiresAt: number }>();

export async function resolveVerifiedSchoolId(uid: string, headerSchoolId?: string, isAdminUser?: boolean): Promise<string> {
  // If user is verified admin and requested a specific school via header, honor it
  if (isAdminUser && headerSchoolId) {
    return headerSchoolId;
  }

  // Check cache
  const cached = schoolMembershipCache.get(uid);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    if (headerSchoolId && headerSchoolId !== cached.schoolId && !isAdminUser) {
      throw new Error('School membership mismatch: User does not belong to the requested school.');
    }
    return cached.schoolId;
  }

  try {
    const fs = getAdminFirestore();
    const userDoc = await fs.collection('users').doc(uid).get();
    let resolvedId = uid;
    if (userDoc.exists) {
      const data = userDoc.data();
      if (data?.schoolId) {
        resolvedId = data.schoolId;
      }
    }

    // Cache the resolved school ID for 5 minutes
    schoolMembershipCache.set(uid, {
      schoolId: resolvedId,
      expiresAt: now + 5 * 60 * 1000
    });

    if (headerSchoolId && headerSchoolId !== resolvedId && !isAdminUser) {
      throw new Error('School membership mismatch: User does not belong to the requested school.');
    }

    return resolvedId;
  } catch (err: any) {
    if (err?.message?.includes('membership mismatch')) {
      throw err;
    }
    // Fallback to uid if Firestore is momentarily unreachable
    return headerSchoolId || uid;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Determine admin status strictly from server-verified token claims
    req.isAdmin = Boolean(
      decodedToken.admin === true || 
      (decodedToken.email === 'faycalassoul@gmail.com' && decodedToken.email_verified === true)
    );

    const headerSchoolId = req.headers['x-school-id'] ? String(req.headers['x-school-id']) : undefined;

    try {
      req.schoolId = await resolveVerifiedSchoolId(decodedToken.uid, headerSchoolId, req.isAdmin);
    } catch (mismatchErr: any) {
      return res.status(403).json({ error: mismatchErr.message || 'Forbidden: Access to this school is denied.' });
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token in requireAuth:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
};
