import { fetchWithAuth } from './client';
import { Equipment } from '../../types/equipment';
import { queryClient } from '../queryClient';

export const getEquipment = (): Promise<Equipment[]> => 
  fetchWithAuth('/api/db/equipment');

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/equipment', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return result;
};

export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
  const result = await fetchWithAuth(`/api/db/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return result;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/equipment/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return result;
};

export const createEquipmentBulk = async (items: Partial<Equipment>[]): Promise<Equipment[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  }));
  const result = await fetchWithAuth('/api/db/equipment/bulk', {
    method: 'POST',
    body: JSON.stringify(formatted)
  });
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  return result;
};
