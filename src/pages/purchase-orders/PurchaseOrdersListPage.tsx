import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { getPurchaseOrders, cancelPurchaseOrder, approvePurchaseOrder, PurchaseOrder } from '@/api/purchase-orders.api';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function PurchaseOrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Dialog state
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page, search],
    queryFn: () => getPurchaseOrders({ page, limit: 10, search }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Orden de compra anulada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al anular la orden de compra');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Orden de compra aprobada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar la orden de compra');
    },
  });

  const handleCancel = () => {
    if (selectedPoId) {
      cancelMutation.mutate(selectedPoId);
    }
  };

  const handleApprove = () => {
    if (selectedPoId) {
      approveMutation.mutate(selectedPoId);
    }
  };

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RECEIVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'Borrador';
      case 'APPROVED':
        return 'Aprobada';
      case 'RECEIVED':
        return 'Recibida';
      case 'CANCELLED':
        return 'Anulada';
      default:
        return status;
    }
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Número',
      cell: ({ row }) => <span className="font-semibold">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: 'orderDate',
      header: 'Fecha',
      cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
    },
    {
      accessorKey: 'supplier.businessName',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.supplier?.businessName}</div>
          <div className="text-xs text-muted-foreground">RUC: {row.original.supplier?.ruc}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-semibold">S/ {Number(row.original.total).toFixed(2)}</span>,
    },
    {
      accessorKey: 'creator.fullName',
      header: 'Creado por',
      cell: ({ row }) => row.original.creator?.fullName,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/purchase-orders/${po.id}`)}
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {po.status === 'DRAFT' && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/purchase-orders/new?edit=${po.id}`)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={() => {
                    setSelectedPoId(po.id);
                    setConfirmApproveOpen(true);
                  }}
                  title="Aprobar"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
              <Button
                variant="outline"
                size="icon"
                className="text-rose-600 hover:text-rose-700"
                onClick={() => {
                  setSelectedPoId(po.id);
                  setConfirmCancelOpen(true);
                }}
                title="Anular"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h2>
          <p className="text-muted-foreground">Administración de compras y abastecimiento de mercadería.</p>
        </div>
        <Button onClick={() => navigate('/purchase-orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por número o proveedor..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
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

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Anular Orden de Compra"
        description="¿Está seguro que desea anular esta orden de compra? Esta acción no se puede deshacer si la orden ya está recibida."
        onConfirm={handleCancel}
        confirmText="Sí, Anular"
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Aprobar Orden de Compra"
        description="¿Está seguro que desea aprobar esta orden de compra? Una vez aprobada, se podrá proceder con el ingreso de mercadería."
        onConfirm={handleApprove}
        confirmText="Sí, Aprobar"
      />
    </div>
  );
}
