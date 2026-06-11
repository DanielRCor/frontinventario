import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Plus, Truck } from 'lucide-react';

import { getGoodsReceipts, GoodsReceipt } from '@/api/goods-receipts.api';
import { getPurchaseOrders, PurchaseOrder } from '@/api/purchase-orders.api';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GoodsReceiptsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['goods-receipts', page, search],
    queryFn: () => getGoodsReceipts({ page, limit: 10, search }),
  });

  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } = useQuery({
    queryKey: ['purchase-orders', 'goods-receipts-pending'],
    queryFn: () => getPurchaseOrders({ page: 1, limit: 100 }),
  });

  const pendingOrders = (purchaseOrdersData?.data || []).filter(
    (order: PurchaseOrder) => order.status === 'APPROVED',
  );

  const columns: ColumnDef<GoodsReceipt>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'Nota de Ingreso',
      cell: ({ row }) => <span className="font-semibold">{row.original.receiptNumber}</span>,
    },
    {
      accessorKey: 'purchaseOrder.orderNumber',
      header: 'Orden de Compra',
      cell: ({ row }) => row.original.purchaseOrder?.orderNumber,
    },
    {
      accessorKey: 'receiptDate',
      header: 'Fecha Ingreso',
      cell: ({ row }) => new Date(row.original.receiptDate).toLocaleDateString(),
    },
    {
      accessorKey: 'warehouse.name',
      header: 'Almacén de Destino',
      cell: ({ row }) => row.original.warehouse?.name,
    },
    {
      accessorKey: 'receiver.fullName',
      header: 'Recibido Por',
      cell: ({ row }) => row.original.receiver?.fullName,
    },
    {
      accessorKey: 'observations',
      header: 'Observaciones',
      cell: ({ row }) => row.original.observations || <span className="text-muted-foreground">-</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/purchase-orders/${row.original.purchaseOrderId}`)}
          title="Ver Orden de Compra asociada"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const pendingColumns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Orden',
      cell: ({ row }) => <span className="font-semibold">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: 'supplier.businessName',
      header: 'Proveedor',
      cell: ({ row }) => row.original.supplier?.businessName,
    },
    {
      accessorKey: 'orderDate',
      header: 'Fecha',
      cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-semibold">S/ {Number(row.original.total).toFixed(2)}</span>,
    },
    {
      id: 'actions',
      header: 'Acción',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => navigate(`/goods-receipts/new?poId=${row.original.id}`)}>
          Registrar ingreso
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ingresos de Mercadería</h2>
          <p className="text-muted-foreground">Historial de recepción física y actualización de stock (Kardex).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-blue-500" />
            <span>Registre ingresos desde la orden de compra aprobada.</span>
          </div>
          <Button onClick={() => navigate('/purchase-orders')}>
            <Plus className="mr-2 h-4 w-4" /> Ver Órdenes
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por número o OC..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Órdenes aprobadas pendientes de ingreso</h3>
            <p className="text-sm text-muted-foreground">
              Aquí verás las órdenes aceptadas que todavía no tienen una nota de ingreso.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">{pendingOrders.length} pendientes</span>
        </div>

        <DataTable
          columns={pendingColumns}
          data={pendingOrders}
          pageCount={1}
          page={1}
          onPageChange={() => undefined}
          isLoading={purchaseOrdersLoading}
        />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.data || []}
          pageCount={data?.meta?.totalPages || 1}
          page={page}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
