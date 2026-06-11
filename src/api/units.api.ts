import api from './axios';

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
}

export const getUnits = async (): Promise<UnitOfMeasure[]> => {
  return api.get('/units-of-measure') as unknown as Promise<UnitOfMeasure[]>;
};

export const createUnit = async (data: { name: string; abbreviation: string }) => {
  return api.post('/units-of-measure', data);
};

export const updateUnit = async (id: string, data: { name?: string; abbreviation?: string }) => {
  return api.patch(`/units-of-measure/${id}`, data);
};

export const deleteUnit = async (id: string) => {
  return api.delete(`/units-of-measure/${id}`);
};
