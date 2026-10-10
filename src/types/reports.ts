export interface ReportRow {
  id: number;
  teacher: string;
  teacherSubject?: string;
  time: string;
  class: string;
  activityType: string;
  activityTitle: string;
  equipment: string;
  notes: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  rank?: string;
}

export interface InstitutionSettings {
  directorate: string;
  school: string;
  commune?: string;
  address: string;
  jobTitle: string;
}

export type RoutingType = 'direct' | 'hierarchical_nazir' | 'hierarchical_cpe';

export interface SavedReport {
  id: string;
  date: string;
  dayName?: string;
  reportNumber?: string;
  rows: Omit<ReportRow, 'id'>[];
  labNotes: string;
  supervisorNotes: string;
  directorNotes: string;
  routing?: RoutingType;
  department?: string;
  academicYear?: string;
  location?: string;
  sender?: string;
  recipient?: string;
  signers?: string[];
  noActivities?: boolean;
  noActivitiesReason?: string;
  createdBy: string;
  createdAt: any;
  updatedAt?: any;
}

export interface DaySummaryStats {
  totalSessions: number;
  distinctTeachersCount: number;
  distinctClassesCount: number;
  distinctTeachers: string[];
  distinctClasses: string[];
  practicalCount: number;
  simulationCount: number;
  exaoCount: number;
  virtualCount: number;
}
