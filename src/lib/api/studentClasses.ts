import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface StudentClass {
  id: string;
  name: string;
  level: string;
  academicYear?: string;
  groups: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface LabSession {
  id: string;
  classId?: string;
  className: string;
  groupName: string;
  teacherName: string;
  roomName: string;
  benches: number;
  status: 'active' | 'completed';
  date?: string;
  incidents?: any[];
  createdAt?: any;
  updatedAt?: any;
}

export const getStudentClasses = (): Promise<StudentClass[]> =>
  fetchWithAuth('/api/db/student-classes');

export const createStudentClass = async (data: Partial<StudentClass>): Promise<StudentClass> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/student-classes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['student_classes'] });
  return result;
};

export const updateStudentClass = async (id: string, data: Partial<StudentClass>): Promise<StudentClass> => {
  const result = await fetchWithAuth(`/api/db/student-classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['student_classes'] });
  return result;
};

export const deleteStudentClass = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/student-classes/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['student_classes'] });
  return result;
};

export const getLabSessions = (): Promise<LabSession[]> =>
  fetchWithAuth('/api/db/lab-sessions');

export const createLabSession = async (data: Partial<LabSession>): Promise<LabSession> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/lab-sessions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['lab_sessions'] });
  return result;
};

export const updateLabSession = async (id: string, data: Partial<LabSession>): Promise<LabSession> => {
  const result = await fetchWithAuth(`/api/db/lab-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['lab_sessions'] });
  return result;
};

export const deleteLabSession = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/lab-sessions/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['lab_sessions'] });
  return result;
};
