import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface LabReservation {
  id: string;
  labName: string;
  day: string;
  time: string;
  teacher: string;
  subject: string;
  group: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: any;
  updatedAt?: any;
}

export const getLabSchedule = (): Promise<LabReservation[]> =>
  fetchWithAuth('/api/db/lab-schedule');

export const createLabReservation = async (data: Partial<LabReservation>): Promise<LabReservation> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/lab-schedule', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['lab_schedule'] });
  return result;
};

export const updateLabReservation = async (id: string, data: Partial<LabReservation>): Promise<LabReservation> => {
  const result = await fetchWithAuth(`/api/db/lab-schedule/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['lab_schedule'] });
  return result;
};

export const deleteLabReservation = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/lab-schedule/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['lab_schedule'] });
  return result;
};
