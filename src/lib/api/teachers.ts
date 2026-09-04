import { fetchWithAuth } from './client';
import { Teacher } from '../../types/teachers';
import { queryClient } from '../queryClient';

export const getTeachers = (): Promise<Teacher[]> => 
  fetchWithAuth('/api/db/teachers');

export const createTeacher = async (data: Partial<Teacher>): Promise<Teacher> => {
  const payload = {
    ...data,
    id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  };
  const result = await fetchWithAuth('/api/db/teachers', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return result;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
  const result = await fetchWithAuth(`/api/db/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return result;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  const result = await fetchWithAuth(`/api/db/teachers/${id}`, {
    method: 'DELETE'
  });
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return result;
};

export const createTeachersBulk = async (items: Partial<Teacher>[]): Promise<Teacher[]> => {
  const formatted = items.map(item => ({
    ...item,
    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11))
  }));
  const result = await fetchWithAuth('/api/db/teachers/bulk', {
    method: 'POST',
    body: JSON.stringify(formatted)
  });
  queryClient.invalidateQueries({ queryKey: ['teachers'] });
  return result;
};
