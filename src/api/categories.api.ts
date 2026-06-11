import api from './axios';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export const getCategories = async (): Promise<Category[]> => {
  return api.get('/categories') as unknown as Promise<Category[]>;
};

export const createCategory = async (data: { name: string; description?: string }) => {
  return api.post('/categories', data);
};

export const updateCategory = async (id: string, data: { name?: string; description?: string }) => {
  return api.patch(`/categories/${id}`, data);
};

export const deleteCategory = async (id: string) => {
  return api.delete(`/categories/${id}`);
};
