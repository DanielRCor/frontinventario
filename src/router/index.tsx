import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CategoriesListPage from '@/pages/categories/CategoriesListPage';
import UnitsListPage from '@/pages/units/UnitsListPage';
import ProductsListPage from '@/pages/products/ProductsListPage';
import ProductFormPage from '@/pages/products/ProductFormPage';
import SuppliersListPage from '@/pages/suppliers/SuppliersListPage';
import CustomersListPage from '@/pages/customers/CustomersListPage';
import WarehousesListPage from '@/pages/warehouses/WarehousesListPage';
import PurchaseOrdersListPage from '@/pages/purchase-orders/PurchaseOrdersListPage';
import PurchaseOrderFormPage from '@/pages/purchase-orders/PurchaseOrderFormPage';
import PurchaseOrderDetailPage from '@/pages/purchase-orders/PurchaseOrderDetailPage';
import GoodsReceiptsListPage from '@/pages/goods-receipts/GoodsReceiptsListPage';
import GoodsReceiptFormPage from '@/pages/goods-receipts/GoodsReceiptFormPage';
import InvoicesListPage from '@/pages/invoices/InvoicesListPage';
import InvoiceFormPage from '@/pages/invoices/InvoiceFormPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import DispatchesListPage from '@/pages/dispatches/DispatchesListPage';
import DispatchFormPage from '@/pages/dispatches/DispatchFormPage';
import DispatchDetailPage from '@/pages/dispatches/DispatchDetailPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'categories',
            element: <CategoriesListPage />,
          },
          {
            path: 'units-of-measure',
            element: <UnitsListPage />,
          },
          {
            path: 'products',
            element: <ProductsListPage />,
          },
          {
            path: 'products/new',
            element: <ProductFormPage />,
          },
          {
            path: 'products/:id/edit',
            element: <ProductFormPage />,
          },
          {
            path: 'suppliers',
            element: <SuppliersListPage />,
          },
          {
            path: 'customers',
            element: <CustomersListPage />,
          },
          {
            path: 'inventory',
            element: <WarehousesListPage />,
          },
          {
            path: 'purchase-orders',
            element: <PurchaseOrdersListPage />,
          },
          {
            path: 'purchase-orders/new',
            element: <PurchaseOrderFormPage />,
          },
          {
            path: 'purchase-orders/:id',
            element: <PurchaseOrderDetailPage />,
          },
          {
            path: 'goods-receipts',
            element: <GoodsReceiptsListPage />,
          },
          {
            path: 'goods-receipts/new',
            element: <GoodsReceiptFormPage />,
          },
          {
            path: 'invoices',
            element: <InvoicesListPage />,
          },
          {
            path: 'invoices/new',
            element: <InvoiceFormPage />,
          },
          {
            path: 'invoices/:id',
            element: <InvoiceDetailPage />,
          },
          {
            path: 'dispatches',
            element: <DispatchesListPage />,
          },
          {
            path: 'dispatches/new/:invoiceId',
            element: <DispatchFormPage />,
          },
          {
            path: 'dispatches/:id',
            element: <DispatchDetailPage />,
          },
        ],
      },
    ],
  },
]);
