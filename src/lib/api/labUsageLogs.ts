import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface ConsumedItem {
  name: string;
  quantity: number;
  unit: string;
  type: 'chemical' | 'equipment' | 'glassware';
}

export interface LabUsageLog {
  id: string;
  date: string;
  teacherName: string;
  className: string;
  groupName?: string;
  experimentTitle: string;
  consumedItems: ConsumedItem[];
  notes?: string;
  signed?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getLabUsageLogs = (): Promise<LabUsageLog[]> =>
  fetchWithAuth('/api/db/lab-usage-logs');

export const createLabUsageLog = async (data: Partial<LabUsageLog>): Promise<LabUsageLog> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/lab-usage-logs', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['lab_usage_logs'] });
  return result;
};

export const deleteLabUsageLog = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/lab-usage-logs/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['lab_usage_logs'] });
  return result;
};
