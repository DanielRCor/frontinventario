import api from './axios';

export interface Customer {
  id: string;
  documentType: 'DNI' | 'RUC' | 'PASAPORTE' | 'CE';
  documentNumber: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getCustomers = async (params: { page: number; limit: number; search?: string }): Promise<PaginatedCustomers> => {
  return api.get('/customers', { params }) as unknown as Promise<PaginatedCustomers>;
};

export const createCustomer = async (data: any) => {
  return api.post('/customers', data);
};

export const updateCustomer = async (id: string, data: any) => {
  return api.patch(`/customers/${id}`, data);
};

export const deleteCustomer = async (id: string) => {
  return api.delete(`/customers/${id}`);
};
