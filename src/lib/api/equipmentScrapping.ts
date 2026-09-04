import { fetchWithAuth } from './client';
import { queryClient } from '../queryClient';

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  observations: string;
}

export interface ScrapItem {
  id: string;
  inventoryNum: string;
  name: string;
  acquisitionDate: string;
  quantity: number;
  reason: string;
  state: string;
  acquisitionValue: string;
  estimatedValue: string;
  notes: string;
}

export interface EquipmentScrappingRecord {
  id: string;
  pvNumber: string;
  date: string;
  location: string;
  committeeMembers: CommitteeMember[];
  scrapItems: ScrapItem[];
  proposalData?: any;
  status: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getEquipmentScrapping = (): Promise<EquipmentScrappingRecord[]> =>
  fetchWithAuth('/api/db/equipment-scrapping');

export const createEquipmentScrapping = async (data: Partial<EquipmentScrappingRecord>): Promise<EquipmentScrappingRecord> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/equipment-scrapping', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['equipment_scrapping'] });
  return result;
};

export const updateEquipmentScrapping = async (id: string, data: Partial<EquipmentScrappingRecord>): Promise<EquipmentScrappingRecord> => {
  const result = await fetchWithAuth(`/api/db/equipment-scrapping/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['equipment_scrapping'] });
  return result;
};

export const deleteEquipmentScrapping = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/equipment-scrapping/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['equipment_scrapping'] });
  return result;
};
