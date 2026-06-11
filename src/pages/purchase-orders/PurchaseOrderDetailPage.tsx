import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle, Ban, Truck } from 'lucide-react';
import { toast } from 'sonner';

import { getPurchaseOrder, approvePurchaseOrder, cancelPurchaseOrder, PurchaseOrder } from '@/api/purchase-orders.api';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => getPurchaseOrder(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => approvePurchaseOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Orden de compra aprobada con éxito');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar la orden');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelPurchaseOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Orden de compra anulada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al anular la orden');
    },
  });

  if (isLoading) {
    return <div className="text-center py-10">Cargando detalle de la orden...</div>;
  }

  if (!order) {
    return <div className="text-center py-10 text-rose-600">Orden de compra no encontrada</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h2>
            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-muted-foreground">Detalle completo de la orden de compra.</p>
        </div>
        
        <div className="flex gap-2">
          {order.status === 'DRAFT' && (
            <>
              <Button onClick={() => navigate(`/purchase-orders/new?edit=${order.id}`)} variant="outline">
                Editar
              </Button>
              <Button onClick={() => setConfirmApproveOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Aprobar Orden
              </Button>
            </>
          )}

          {order.status === 'APPROVED' && (
            <Button onClick={() => navigate(`/goods-receipts/new?poId=${order.id}`)} className="bg-blue-600 hover:bg-blue-700">
              <Truck className="mr-2 h-4 w-4" /> Registrar Ingreso
            </Button>
          )}

          {order.status !== 'CANCELLED' && order.status !== 'RECEIVED' && (
            <Button onClick={() => setConfirmCancelOpen(true)} variant="destructive">
              <Ban className="mr-2 h-4 w-4" /> Anular Orden
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Información de la Orden</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha Emisión:</span>
              <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Creado Por:</span>
              <p className="font-medium">{order.creator?.fullName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Observaciones:</span>
              <p className="font-medium">{order.observations || 'Sin observaciones'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Almacén destino:</span>
              <p className="font-medium">{order.warehouse?.name || 'No asignado'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-semibold text-lg border-b pb-2">Proveedor</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Razón Social:</span>
              <p className="font-semibold text-base">{order.supplier?.businessName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">RUC:</span>
              <p className="font-semibold text-base">{order.supplier?.ruc}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dirección:</span>
              <p className="font-medium">{order.supplier?.address || 'No especificada'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contacto:</span>
              <p className="font-medium">{order.supplier?.phone || order.supplier?.email || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Detalle de Productos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.details?.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell className="font-medium">{detail.product?.code}</TableCell>
                <TableCell>
                  {detail.product?.name} 
                  {detail.product?.unitOfMeasure && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({detail.product.unitOfMeasure.abbreviation})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{Number(detail.quantity).toFixed(2)}</TableCell>
                <TableCell className="text-right">S/ {Number(detail.unitPrice).toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">S/ {Number(detail.subtotal).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col items-end gap-2 pt-4 text-right">
          <div className="text-sm">
            Subtotal: <span className="font-semibold ml-2">S/ {Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="text-sm">
            IGV (18%): <span className="font-semibold ml-2">S/ {Number(order.igv).toFixed(2)}</span>
          </div>
          <div className="text-xl font-bold">
            Total: <span className="text-emerald-600 ml-2">S/ {Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Aprobar Orden de Compra"
        description="Al aprobar la orden de compra, el proveedor podrá entregar los productos y se habilitará la recepción de mercadería."
        onConfirm={() => approveMutation.mutate()}
        confirmText="Sí, Aprobar"
      />

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Anular Orden de Compra"
        description="¿Está seguro que desea anular esta orden de compra? Esta acción cancela la transacción."
        onConfirm={() => cancelMutation.mutate()}
        confirmText="Sí, Anular"
        variant="destructive"
      />
    </div>
  );
}
