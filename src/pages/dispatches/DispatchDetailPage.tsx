import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, CircleX, Clock3, Truck } from 'lucide-react';

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
        return 'En ruta';
      case 'DELIVERED':
        return 'Entregado';
      default:
        return status;
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  if (isLoading) return <div className="p-8 text-center">Cargando despacho...</div>;
  if (!dispatch) return <div className="p-8 text-center text-red-500">Despacho no encontrado</div>;

  const statusConfig = {
    PENDING: {
      label: 'Pendiente',
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock3,
    },
    IN_TRANSIT: {
      label: 'En ruta',
      tone: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Truck,
    },
    DELIVERED: {
      label: 'Entregado',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
  }[dispatch.status];

  const StatusIcon = statusConfig.icon;

  const timeline = [
    {
      title: 'Creado',
      description: 'Despacho registrado',
      time: dispatch.createdAt,
      active: true,
    },
    {
      title: 'En ruta',
      description: 'Transporte en camino',
      time: dispatch.status === 'PENDING' ? null : dispatch.updatedAt,
      active: dispatch.status === 'IN_TRANSIT' || dispatch.status === 'DELIVERED',
    },
    {
      title: 'Entregado',
      description: 'Mercadería entregada al cliente',
      time: dispatch.deliveryDate,
      active: dispatch.status === 'DELIVERED',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black/70 px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <Link to="/dispatches" className="mb-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              Volver a Despachos
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Detalle de Despacho</h2>
            <p className="text-slate-500">
              {dispatch.dispatchNumber} · Factura {dispatch.invoice?.fullNumber}
            </p>
          </div>
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/dispatches" aria-label="Cerrar detalle">
              <CircleX className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div>
              <p className="text-sm text-slate-500">Estado actual</p>
              <span
                className={`mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusConfig.tone}`}
              >
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Fecha despacho</p>
              <p className="font-medium text-slate-900 dark:text-white">{formatDateTime(dispatch.dispatchDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.invoice?.customer?.businessName}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Factura</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.invoice?.fullNumber}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Transportista</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.transportistName || '-'}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Placa</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.transportistPlate || '-'}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Responsable</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.responsiblePerson || '-'}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">Dirección</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.deliveryAddress || '-'}</p>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="mb-4 text-lg font-semibold">Línea de tiempo</h3>
                <div className="space-y-5">
                  {timeline.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`h-4 w-4 rounded-full border-2 ${
                            step.active ? 'border-emerald-200 bg-emerald-500' : 'border-slate-300 bg-white'
                          }`}
                        />
                        {index < timeline.length - 1 && <span className="mt-1 h-full w-px bg-slate-200" />}
                      </div>
                      <div className="pb-2">
                        <p className="font-medium text-slate-900 dark:text-white">{step.title}</p>
                        <p className="text-sm text-slate-500">{step.description}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDateTime(step.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="text-lg font-semibold">Productos despachados</h3>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/60">
                      <tr className="text-sm text-slate-500">
                        <th className="p-3 font-medium">Código</th>
                        <th className="p-3 font-medium">Producto</th>
                        <th className="p-3 font-medium text-right">Cantidad</th>
                        <th className="p-3 font-medium text-right">P. Unit.</th>
                        <th className="p-3 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {dispatch.invoice?.details?.map((detail) => (
                        <tr key={detail.id} className="text-sm">
                          <td className="p-3">{detail.product?.code}</td>
                          <td className="p-3 font-medium">{detail.product?.name}</td>
                          <td className="p-3 text-right">{Number(detail.quantity).toFixed(2)}</td>
                          <td className="p-3 text-right">S/ {Number(detail.unitPrice).toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">S/ {Number(detail.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {dispatch.observations && (
                <div className="rounded-3xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="mb-2 text-sm text-slate-500">Observaciones</p>
                  <p className="text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100">{dispatch.observations}</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="mb-4 text-lg font-semibold">Resumen</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500">Nº Despacho</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.dispatchNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">Factura</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.invoice?.fullNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cliente</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.invoice?.customer?.businessName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Creado por</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{dispatch.creator?.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Fecha de registro</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDateTime(dispatch.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Última actualización</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDateTime(dispatch.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {dispatch.status === 'PENDING' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => inTransitMutation.mutate(dispatch.id)}
                    disabled={inTransitMutation.isPending}
                  >
                    Marcar en ruta
                  </Button>
                )}
                {dispatch.status === 'IN_TRANSIT' && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => deliveredMutation.mutate(dispatch.id)}
                    disabled={deliveredMutation.isPending}
                  >
                    Marcar entregado
                  </Button>
                )}
                {dispatch.status === 'DELIVERED' && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-700">
                    <CheckCircle2 className="mx-auto mb-2 h-5 w-5" />
                    Entrega completada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
