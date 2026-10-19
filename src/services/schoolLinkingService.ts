import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { RegisteredSchool } from '../types/school';

/**
 * Normalizes Arabic text for flexible matching across variations in spelling,
 * hamzas, taa marbuta, and diacritics.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs
    .replace(/[أإآ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alef Maksura
    .replace(/[ى]/g, 'ي')
    // Replace hyphens and special punctuation with spaces
    .replace(/[_\-–—/\\,.،؛:()[\]{}'"]/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extracts a 2-digit wilaya code from strings like "07 - بسكرة" or "16 - الجزائر"
 */
export function extractWilayaCode(wilaya: string): string {
  if (!wilaya) return '00';
  const match = wilaya.match(/^(\d{1,2})/);
  if (match) {
    return match[1].padStart(2, '0');
  }
  return '00';
}

/**
 * Deterministic hash to convert Arabic names into clean, URL-safe Firestore IDs
 */
function simpleArabicSlug(name: string): string {
  const norm = normalizeArabicText(name);
  
  // Transliterate common words for cleaner readable IDs
  let slug = norm
    .replace(/\bمتوسطه\b/g, 'cem')
    .replace(/\bثانويه\b/g, 'lyc')
    .replace(/\bمتقن\b/g, 'tech')
    .replace(/\bمدرسه\b/g, 'ecole')
    .replace(/\bقطاف\b/g, 'guettaf')
    .replace(/\bالطاهر\b/g, 'taher')
    .replace(/\bالشهيد\b/g, 'chahid')
    .replace(/\bالاخوه\b/g, 'freres')
    .replace(/\bابن\b/g, 'ibn')
    .replace(/\bبن\b/g, 'ben');

  // Convert non-ascii to hex-safe slug or hash
  let asciiSlug = slug.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
  
  // Calculate deterministic numeric hash of the normalized Arabic string
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = ((hash << 5) - hash) + norm.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString(36);

  if (asciiSlug.length > 2) {
    return `${asciiSlug.substring(0, 24)}_${positiveHash}`;
  }
  return `school_${positiveHash}`;
}

/**
 * Generates a deterministic canonical school ID.
 * Example: "متوسطة قطاف الطاهر" + "07 - بسكرة" -> "sch_07_cem_guettaf_taher_..."
 */
export function generateCanonicalSchoolId(schoolName: string, wilaya: string): string {
  const wilayaCode = extractWilayaCode(wilaya);
  const slug = simpleArabicSlug(schoolName);
  return `sch_${wilayaCode}_${slug}`;
}

/**
 * Searches Firestore for an existing registered school by name and wilaya
 */
export async function findRegisteredSchool(
  schoolName: string, 
  wilaya: string
): Promise<RegisteredSchool | null> {
  if (!schoolName || !wilaya) return null;

  try {
    const canonicalId = generateCanonicalSchoolId(schoolName, wilaya);
    const docRef = doc(db, 'registered_schools', canonicalId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as RegisteredSchool;
    }

    // Secondary lookup by normalized name and wilaya
    const normalized = normalizeArabicText(schoolName);
    const schoolsCol = collection(db, 'registered_schools');
    const q = query(schoolsCol, where('wilaya', '==', wilaya));
    const querySnap = await getDocs(q);

    for (const d of querySnap.docs) {
      const data = d.data();
      if (
        data.normalizedName === normalized || 
        normalizeArabicText(data.name || '') === normalized ||
        (data.name && data.name.trim() === schoolName.trim())
      ) {
        return { id: d.id, ...data } as RegisteredSchool;
      }
    }
  } catch (err) {
    console.warn('Error in findRegisteredSchool:', err);
  }

  return null;
}

/**
 * Retrieves all registered schools for search/autocomplete
 */
export async function getAllRegisteredSchools(): Promise<RegisteredSchool[]> {
  try {
    const querySnap = await getDocs(collection(db, 'registered_schools'));
    const list: RegisteredSchool[] = [];
    querySnap.forEach(d => {
      list.push({ id: d.id, ...d.data() } as RegisteredSchool);
    });
    return list;
  } catch (err) {
    console.warn('Could not fetch all registered schools:', err);
    return [];
  }
}

/**
 * Saves or updates a registered school (e.g. from the Director onboarding wizard)
 */
export async function saveOrUpdateRegisteredSchool(schoolData: {
  name: string;
  wilaya: string;
  commune: string;
  directorate: string;
  educationLevel: 'CEM' | 'Lycée' | 'Autre';
  academicYear?: string;
  directorUid: string;
  directorName: string;
  directorEmail: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}): Promise<RegisteredSchool> {
  const schoolId = generateCanonicalSchoolId(schoolData.name, schoolData.wilaya);
  const normalizedName = normalizeArabicText(schoolData.name);
  const wilayaCode = extractWilayaCode(schoolData.wilaya);
  const now = new Date().toISOString();

  const record: RegisteredSchool = {
    id: schoolId,
    name: schoolData.name.trim(),
    normalizedName,
    educationLevel: schoolData.educationLevel,
    directorate: schoolData.directorate.trim(),
    wilaya: schoolData.wilaya.trim(),
    wilayaCode,
    commune: schoolData.commune.trim(),
    address: schoolData.address || '',
    phone: schoolData.phone || '',
    email: schoolData.directorEmail || '',
    academicYear: schoolData.academicYear || '2025/2026',
    directorUid: schoolData.directorUid,
    directorName: schoolData.directorName,
    directorEmail: schoolData.directorEmail,
    logoUrl: schoolData.logoUrl || '',
    createdAt: now,
    updatedAt: now,
    status: 'active'
  };

  // 1. Save in registered_schools collection
  await setDoc(doc(db, 'registered_schools', schoolId), {
    ...record,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 2. Mirror into schools/{schoolId}/profile & settings/{schoolId}
  try {
    await setDoc(doc(db, 'schools', schoolId, 'profile', 'info'), {
      ...record,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'settings', schoolId), {
      schoolId,
      schoolName: record.name,
      directorateName: record.directorate,
      wilaya: record.wilaya,
      commune: record.commune,
      academicYear: record.academicYear,
      schoolLogo: record.logoUrl || '',
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (mirrorErr) {
    console.warn('Mirroring school profile warning:', mirrorErr);
  }

  // 3. Update the Director's user record in users/{directorUid} and settings/{directorUid}
  try {
    await setDoc(doc(db, 'users', schoolData.directorUid), {
      schoolId,
      institution: record.name,
      wilaya: record.wilaya,
      commune: record.commune,
      educationLevel: record.educationLevel,
      hasCompletedSchoolSetup: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'settings', schoolData.directorUid), {
      schoolId,
      schoolName: record.name,
      directorateName: record.directorate,
      wilaya: record.wilaya,
      commune: record.commune,
      academicYear: record.academicYear,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (uErr) {
    console.warn('Updating director user doc warning:', uErr);
  }

  // 4. Update localStorage and broadcast changes
  if (typeof window !== 'undefined') {
    localStorage.setItem('algeria_lab_school_id', schoolId);
    localStorage.setItem('algeria_lab_school_name', record.name);
    localStorage.setItem('algeria_lab_directorate', record.directorate);
    localStorage.setItem('algeria_lab_commune', record.commune);
    localStorage.setItem('algeria_lab_academic_year', record.academicYear);
    if (record.logoUrl) {
      localStorage.setItem('algeria_lab_school_logo', record.logoUrl);
    }
    window.dispatchEvent(new Event('school_changed'));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

/**
 * Links a staff member (teacher, censor, lab manager, economist) to the school database
 */
export async function linkStaffMemberToSchool(
  uid: string,
  schoolName: string,
  wilaya: string,
  role: string
): Promise<string> {
  let matched = await findRegisteredSchool(schoolName, wilaya);
  const targetSchoolId = matched ? matched.id : generateCanonicalSchoolId(schoolName, wilaya);

  try {
    await setDoc(doc(db, 'users', uid), {
      schoolId: targetSchoolId,
      institution: schoolName.trim(),
      wilaya: wilaya.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'settings', uid), {
      schoolId: targetSchoolId,
      schoolName: schoolName.trim(),
      wilaya: wilaya.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not link staff member to school:', err);
  }

  return targetSchoolId;
}
