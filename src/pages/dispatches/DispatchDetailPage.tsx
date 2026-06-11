import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';

import { getDispatch, markDispatchDelivered, markDispatchInTransit } from '@/api/invoices.api';
import { Button } from '@/components/ui/button';

export default function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: dispatch, isLoading } = useQuery({
    queryKey: ['dispatches', id],
    queryFn: () => getDispatch(id!),
    enabled: !!id,
  });

  const inTransitMutation = useMutation({
    mutationFn: markDispatchInTransit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dispatches', id] }),
  });

  const deliveredMutation = useMutation({
    mutationFn: markDispatchDelivered,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dispatches', id] }),
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'IN_TRANSIT':
        return 'En tránsito';
      case 'DELIVERED':
        return 'Entregado';
      default:
        return status;
    }
  };

  if (isLoading) return <div className="p-8 text-center">Cargando despacho...</div>;
  if (!dispatch) return <div className="p-8 text-center text-red-500">Despacho no encontrado</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dispatches" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Volver a Despachos
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{dispatch.dispatchNumber}</h2>
          <p className="text-muted-foreground">Factura {dispatch.invoice?.fullNumber}</p>
        </div>
        <div className="flex gap-2">
          {dispatch.status === 'PENDING' && (
            <Button onClick={() => inTransitMutation.mutate(dispatch.id)} disabled={inTransitMutation.isPending}>
              Marcar en tránsito
            </Button>
          )}
          {dispatch.status !== 'DELIVERED' && (
            <Button
              variant="outline"
              onClick={() => deliveredMutation.mutate(dispatch.id)}
              disabled={deliveredMutation.isPending}
            >
              Marcar entregado
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
        <div>
          <strong>Estado:</strong> {getStatusLabel(dispatch.status)}
        </div>
        <div>
          <strong>Cliente:</strong> {dispatch.invoice?.customer?.businessName}
        </div>
        <div>
          <strong>Fecha despacho:</strong> {new Date(dispatch.dispatchDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Transportista:</strong> {dispatch.transportistName || '-'}
        </div>
        <div>
          <strong>Placa:</strong> {dispatch.transportistPlate || '-'}
        </div>
        <div>
          <strong>Responsable:</strong> {dispatch.responsiblePerson || '-'}
        </div>
        <div>
          <strong>Dirección:</strong> {dispatch.deliveryAddress || '-'}
        </div>
        <div>
          <strong>Observaciones:</strong> {dispatch.observations || '-'}
        </div>
      </div>
    </div>
  );
}
