import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getInvoice, createDispatch } from '@/api/invoices.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const dispatchSchema = z.object({
  dispatchDate: z.string().min(1, 'La fecha es requerida'),
  transportistName: z.string().optional(),
  transportistPlate: z.string().optional(),
  responsiblePerson: z.string().optional(),
  deliveryAddress: z.string().optional(),
  observations: z.string().optional(),
});

type DispatchFormValues = z.infer<typeof dispatchSchema>;

export default function DispatchFormPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => getInvoice(invoiceId!),
    enabled: !!invoiceId,
  });

  const { register, handleSubmit } = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      dispatchDate: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: createDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/dispatches');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error al crear despacho');
    },
  });

  if (!invoiceId) {
    return <div className="p-8 text-center text-red-500">Factura no especificada</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center">Cargando factura...</div>;
  }

  const onSubmit = (data: DispatchFormValues) => {
    mutation.mutate({ invoiceId, ...data });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-2">Crear Despacho</h2>
      <p className="text-muted-foreground mb-6">Factura {invoice?.fullNumber}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de despacho</label>
            <Input type="date" {...register('dispatchDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transportista</label>
            <Input {...register('transportistName')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Placa</label>
            <Input {...register('transportistPlate')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Responsable</label>
            <Input {...register('responsiblePerson')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección de entrega</label>
            <Input {...register('deliveryAddress')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <Input {...register('observations')} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dispatches')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Crear despacho'}
          </Button>
        </div>
      </form>
    </div>
  );
}
