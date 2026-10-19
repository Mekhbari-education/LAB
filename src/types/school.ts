export type EducationCycle = 'middle_school' | 'high_school' | 'primary' | 'other';

export interface RegisteredSchool {
  id: string; // canonical schoolId e.g. "sch_07_cem_guettaf_taher"
  name: string; // e.g. "متوسطة قطاف الطاهر"
  normalizedName: string;
  educationLevel: 'CEM' | 'Lycée' | 'Autre';
  directorate: string; // e.g. "مديرية التربية لولاية بسكرة"
  wilaya: string; // e.g. "07 - بسكرة"
  wilayaCode: string; // e.g. "07"
  commune: string; // e.g. "سيدي عقبة"
  address?: string;
  phone?: string;
  email?: string;
  academicYear: string; // e.g. "2025/2026"
  directorUid?: string;
  directorName?: string;
  directorEmail?: string;
  logoUrl?: string;
  stampUrl?: string;
  staffCount?: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'pending';
}
