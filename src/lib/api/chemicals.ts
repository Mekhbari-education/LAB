import { fetchWithAuth } from './client';
import { Chemical } from '../../types/chemicals';
import { queryClient } from '../queryClient';

export const getChemicals = (): Promise<Chemical[]> => 
  fetchWithAuth('/api/db/chemicals');

export const createChemical = async (data: Partial<Chemical>): Promise<Chemical> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/chemicals', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return result;
};

export const updateChemical = async (id: string, data: Partial<Chemical>): Promise<Chemical> => {
  const result = await fetchWithAuth(`/api/db/chemicals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return result;
};

export const deleteChemical = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/chemicals/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return result;
};

export const createChemicalsBulk = async (items: Partial<Chemical>[]): Promise<Chemical[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  }));
  const result = await fetchWithAuth('/api/db/chemicals/bulk', {
    method: 'POST',
    body: JSON.stringify(formatted)
  });
  queryClient.invalidateQueries({ queryKey: ['chemicals'] });
  return result;
};
