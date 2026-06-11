import api from './axios';

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getWarehouses = async (): Promise<Warehouse[]> => {
  return api.get('/warehouses') as unknown as Promise<Warehouse[]>;
};

export const createWarehouse = async (data: { name: string; address?: string }) => {
  return api.post('/warehouses', data);
};

export const updateWarehouse = async (id: string, data: { name?: string; address?: string }) => {
  return api.patch(`/warehouses/${id}`, data);
};

export const getWarehouseStock = async (id: string) => {
  return api.get(`/warehouses/${id}/stock`);
};
