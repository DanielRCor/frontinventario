import api from './axios';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  categoryId: string;
  unitOfMeasureId: string;
  salePrice: number;
  purchasePrice: number;
  minimumStock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  category?: { name: string };
  unitOfMeasure?: { name: string; abbreviation: string };
  warehouseStocks?: {
    warehouseId: string;
    quantity: number;
  }[];
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getProducts = async (params: { page: number; limit: number; search?: string }): Promise<PaginatedProducts> => {
  return api.get('/products', { params }) as unknown as Promise<PaginatedProducts>;
};

export const getProduct = async (id: string): Promise<Product> => {
  return api.get(`/products/${id}`) as unknown as Promise<Product>;
};

export const createProduct = async (data: any) => {
  return api.post('/products', data);
};

export const updateProduct = async (id: string, data: any) => {
  return api.patch(`/products/${id}`, data);
};

export const deleteProduct = async (id: string) => {
  return api.delete(`/products/${id}`);
};
