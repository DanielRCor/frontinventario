import api from './axios';

export interface PurchaseOrderDetail {
  id?: string;
  purchaseOrderId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  product?: {
    id: string;
    code: string;
    name: string;
    purchasePrice: number;
    unitOfMeasure?: {
      name: string;
      abbreviation: string;
    };
  };
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  supplierId: string;
  warehouseId?: string | null;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  observations: string | null;
  subtotal: number;
  igv: number;
  total: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    businessName: string;
    ruc: string;
  };
  warehouse?: {
    id: string;
    name: string;
  } | null;
  creator?: {
    id: string;
    fullName: string;
  };
  details?: PurchaseOrderDetail[];
}

export interface PaginatedPurchaseOrders {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getPurchaseOrders = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<PaginatedPurchaseOrders> => {
  return api.get('/purchase-orders', { params }) as unknown as Promise<PaginatedPurchaseOrders>;
};

export const getPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return api.get(`/purchase-orders/${id}`) as unknown as Promise<PurchaseOrder>;
};

export const createPurchaseOrder = async (data: any): Promise<PurchaseOrder> => {
  return api.post('/purchase-orders', data) as unknown as Promise<PurchaseOrder>;
};

export const updatePurchaseOrder = async (id: string, data: any): Promise<PurchaseOrder> => {
  return api.patch(`/purchase-orders/${id}`, data) as unknown as Promise<PurchaseOrder>;
};

export const approvePurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return api.patch(`/purchase-orders/${id}/approve`) as unknown as Promise<PurchaseOrder>;
};

export const cancelPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return api.patch(`/purchase-orders/${id}/cancel`) as unknown as Promise<PurchaseOrder>;
};
