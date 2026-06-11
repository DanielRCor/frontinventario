import api from './axios';

export interface GoodsReceiptDetail {
  id?: string;
  goodsReceiptId?: string;
  productId: string;
  quantityExpected: number;
  quantityReceived: number;
  observations: string | null;
  product?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  receiptDate: string;
  observations: string | null;
  receivedBy: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
    orderDate: string;
    supplier?: {
      businessName: string;
    };
  };
  receiver?: {
    id: string;
    fullName: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  details?: GoodsReceiptDetail[];
}

export interface PaginatedGoodsReceipts {
  data: GoodsReceipt[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getGoodsReceipts = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<PaginatedGoodsReceipts> => {
  return api.get('/goods-receipts', { params }) as unknown as Promise<PaginatedGoodsReceipts>;
};

export const getGoodsReceipt = async (id: string): Promise<GoodsReceipt> => {
  return api.get(`/goods-receipts/${id}`) as unknown as Promise<GoodsReceipt>;
};

export const createGoodsReceipt = async (data: any): Promise<GoodsReceipt> => {
  return api.post('/goods-receipts', data) as unknown as Promise<GoodsReceipt>;
};
