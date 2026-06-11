import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Check } from 'lucide-react';

import { getPurchaseOrder } from '@/api/purchase-orders.api';
import { createGoodsReceipt } from '@/api/goods-receipts.api';
import { getWarehouses } from '@/api/warehouses.api';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const goodsReceiptSchema = z.object({
  purchaseOrderId: z.string().min(1, 'La orden de compra es requerida'),
  warehouseId: z.string().min(1, 'El almacén de destino es requerido'),
  receiptDate: z.string().min(1, 'La fecha de recepción es requerida'),
  observations: z.string().optional(),
  details: z.array(
    z.object({
      productId: z.string(),
      quantityExpected: z.coerce.number().min(0.01),
      quantityReceived: z.coerce.number().min(0, 'No puede ingresar cantidades negativas'),
      observations: z.string().optional(),
    })
  ),
});

type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;

export default function GoodsReceiptFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const poId = searchParams.get('poId');

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      purchaseOrderId: poId || '',
      warehouseId: '',
      receiptDate: new Date().toISOString().split('T')[0],
      observations: '',
      details: [],
    },
  });

  const { control, handleSubmit, reset } = form;
  const { fields, replace } = useFieldArray({
    control,
    name: 'details',
  });

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['purchase-order', poId],
    queryFn: () => getPurchaseOrder(poId!),
    enabled: !!poId,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: getWarehouses,
  });

  useEffect(() => {
    if (order) {
      // Pre-popula el formulario con la info de la orden de compra aprobada
      replace(
        order.details?.map((detail) => ({
          productId: detail.productId,
          quantityExpected: Number(detail.quantity),
          quantityReceived: Number(detail.quantity), // Por defecto recibe todo
          observations: '',
        })) || []
      );
      form.setValue('purchaseOrderId', order.id);
    }
  }, [order, replace, form]);

  const saveMutation = useMutation({
    mutationFn: (data: GoodsReceiptFormValues) => createGoodsReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ingreso de mercadería registrado con éxito');
      navigate('/goods-receipts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar el ingreso');
    },
  });

  const onSubmit = (data: GoodsReceiptFormValues) => {
    saveMutation.mutate(data);
  };

  if (!poId) {
    return <div className="text-center py-10 text-rose-600">ID de Orden de compra no especificado. Registre el ingreso desde el detalle de la Orden.</div>;
  }

  if (orderLoading) {
    return <div className="text-center py-10">Cargando datos de la orden de compra...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/purchase-orders/${poId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Nota de Ingreso</h2>
          <p className="text-muted-foreground">Registre la mercadería recibida para la orden {order?.orderNumber}.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <FormLabel className="text-muted-foreground">Proveedor</FormLabel>
                <p className="font-semibold text-base mt-1">{order?.supplier?.businessName}</p>
              </div>
              
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén de Destino *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione almacén" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Recepción *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones Generales</FormLabel>
                  <FormControl>
                    <Input placeholder="Comentarios sobre el estado del lote u otros detalles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Productos a Recibir</h3>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad Ordenada</TableHead>
                      <TableHead className="text-right w-[20%]">Cantidad Recibida *</TableHead>
                      <TableHead className="w-[30%]">Observaciones / Comentario de Partida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-semibold">{order?.details?.[index]?.product?.code}</TableCell>
                        <TableCell>{order?.details?.[index]?.product?.name}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {field.quantityExpected.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.quantityReceived`}
                            render={({ field: subField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input type="number" step="0.01" className="text-right" {...subField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`details.${index}.observations`}
                            render={({ field: subField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input placeholder="Ej: 1 unidad dañada" {...subField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate(`/purchase-orders/${poId}`)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Procesando...' : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Registrar Ingreso y Aumentar Stock
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
