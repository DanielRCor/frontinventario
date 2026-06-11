import api from './axios';

export interface InvoiceDetail {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Invoice {
  id: string;
  type: 'FACTURA' | 'BOLETA';
  series: string;
  number: number;
  fullNumber: string;
  issueDate: string;
  dueDate?: string;
  customerId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  subtotal: number;
  igv: number;
  total: number;
  observations?: string;
  createdBy: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;

  customer?: any;
  warehouse?: any;
  creator?: any;
  details?: InvoiceDetail[];
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  invoiceId: string;
  dispatchDate: string;
  deliveryDate?: string | null;
  transportistName?: string | null;
  transportistPlate?: string | null;
  responsiblePerson?: string | null;
  deliveryAddress?: string | null;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  observations?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    fullNumber: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    customer?: {
      id: string;
      businessName: string;
    };
  };
  creator?: {
    id: string;
    fullName: string;
  };
}

export interface CreateInvoiceDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  type: 'FACTURA' | 'BOLETA';
  customerId: string;
  warehouseId: string;
  observations?: string;
  details: CreateInvoiceDetailDto[];
}

export const getInvoices = async (): Promise<Invoice[]> => {
  return api.get('/invoices') as unknown as Promise<Invoice[]>;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  return api.get(`/invoices/${id}`) as unknown as Promise<Invoice>;
};

export const createInvoice = async (invoice: CreateInvoiceDto): Promise<Invoice> => {
  return api.post('/invoices', invoice) as unknown as Promise<Invoice>;
};

export const markInvoiceAsPaid = async (id: string): Promise<Invoice> => {
  return api.patch(`/invoices/${id}/pay`) as unknown as Promise<Invoice>;
};

export const cancelInvoice = async (id: string): Promise<Invoice> => {
  return api.patch(`/invoices/${id}/cancel`) as unknown as Promise<Invoice>;
};

export interface CreateDispatchDto {
  invoiceId: string;
  dispatchDate: string;
  transportistName?: string;
  transportistPlate?: string;
  responsiblePerson?: string;
  deliveryAddress?: string;
  observations?: string;
}

export const getDispatches = async (): Promise<Dispatch[]> => {
  return api.get('/dispatches') as unknown as Promise<Dispatch[]>;
};

export const getDispatch = async (id: string): Promise<Dispatch> => {
  return api.get(`/dispatches/${id}`) as unknown as Promise<Dispatch>;
};

export const createDispatch = async (data: CreateDispatchDto): Promise<Dispatch> => {
  return api.post('/dispatches', data) as unknown as Promise<Dispatch>;
};

export const markDispatchInTransit = async (id: string): Promise<Dispatch> => {
  return api.patch(`/dispatches/${id}/in-transit`) as unknown as Promise<Dispatch>;
};

export const markDispatchDelivered = async (id: string): Promise<Dispatch> => {
  return api.patch(`/dispatches/${id}/delivered`) as unknown as Promise<Dispatch>;
};
