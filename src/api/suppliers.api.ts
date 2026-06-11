import api from './axios';

export interface Supplier {
  id: string;
  ruc: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSuppliers {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getSuppliers = async (params: { page: number; limit: number; search?: string }): Promise<PaginatedSuppliers> => {
  return api.get('/suppliers', { params }) as unknown as Promise<PaginatedSuppliers>;
};

export const createSupplier = async (data: any) => {
  return api.post('/suppliers', data);
};

export const updateSupplier = async (id: string, data: any) => {
  return api.patch(`/suppliers/${id}`, data);
};

export const deleteSupplier = async (id: string) => {
  return api.delete(`/suppliers/${id}`);
};
