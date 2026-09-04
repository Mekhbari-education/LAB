import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface GlasswareItem {
  id: string;
  designationFr: string;
  nameAr: string;
  type: string;
  unit: string;
  quantity: number;
  status: 'جيدة' | 'مكسورة' | 'تحتاج إصلاح' | 'مفقودة';
  location: string;
  notes: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getGlassware = (): Promise<GlasswareItem[]> =>
  fetchWithAuth('/api/db/glassware');

export const createGlassware = async (data: Partial<GlasswareItem>): Promise<GlasswareItem> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/glassware', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['glassware_inventory'] });
  return result;
};

export const createGlasswareBulk = async (items: Partial<GlasswareItem>[]): Promise<GlasswareItem[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  }));
  const result = await fetchWithAuth('/api/db/glassware/bulk', {
    method: 'POST',
    body: JSON.stringify(formatted)
  });
  queryClient.invalidateQueries({ queryKey: ['glassware_inventory'] });
  return result;
};

export const updateGlassware = async (id: string, data: Partial<GlasswareItem>): Promise<GlasswareItem> => {
  const result = await fetchWithAuth(`/api/db/glassware/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['glassware_inventory'] });
  return result;
};

export const deleteGlassware = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/glassware/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['glassware_inventory'] });
  return result;
};
