import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface MaintenanceLog {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  issue: string;
  technician?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  cost?: string;
  startDate: string;
  completionDate?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getMaintenanceLogs = (): Promise<MaintenanceLog[]> =>
  fetchWithAuth('/api/db/maintenance');

export const createMaintenanceLog = async (data: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['maintenance'] });
  return result;
};

export const updateMaintenanceLog = async (id: string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
  const result = await fetchWithAuth(`/api/db/maintenance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['maintenance'] });
  return result;
};

export const deleteMaintenanceLog = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/maintenance/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['maintenance'] });
  return result;
};
