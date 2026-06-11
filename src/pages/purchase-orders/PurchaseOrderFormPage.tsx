import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import { createPurchaseOrder, getPurchaseOrder, updatePurchaseOrder } from '@/api/purchase-orders.api';
import { getSuppliers } from '@/api/suppliers.api';
import { getProducts } from '@/api/products.api';

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

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'El proveedor es requerido'),
  orderDate: z.string().min(1, 'La fecha es requerida'),
  observations: z.string().optional(),
  details: z
    .array(
      z.object({
        productId: z.string().min(1, 'El producto es requerido'),
        quantity: z.coerce.number().min(0.01, 'La cantidad debe ser mayor a 0'),
        unitPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
      }),
    )
    .min(1, 'Debe agregar al menos un producto a la orden'),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      observations: '',
      details: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => getSuppliers({ page: 1, limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => getProducts({ page: 1, limit: 100 }),
  });

  const watchedDetails = useWatch({
    control,
    name: 'details',
  });

  useEffect(() => {
    if (isEditing && editId) {
      getPurchaseOrder(editId).then((data) => {
        reset({
          supplierId: data.supplierId,
          orderDate: new Date(data.orderDate).toISOString().split('T')[0],
          observations: data.observations || '',
          details:
            data.details?.map((detail) => ({
              productId: detail.productId,
              quantity: Number(detail.quantity),
              unitPrice: Number(detail.unitPrice),
            })) || [],
        });
      });
    }
  }, [editId, isEditing, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: PurchaseOrderFormValues) =>
      isEditing && editId ? updatePurchaseOrder(editId, data) : createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success(isEditing ? 'Orden de compra actualizada' : 'Orden de compra creada');
      navigate('/purchase-orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar la orden de compra');
    },
  });

  const onSubmit = (data: PurchaseOrderFormValues) => {
    saveMutation.mutate(data);
  };

  const subtotal = watchedDetails?.reduce((acc, detail) => {
    const qty = Number(detail?.quantity) || 0;
    const price = Number(detail?.unitPrice) || 0;
    return acc + qty * price;
  }, 0) || 0;

  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = productsData?.data.find((p) => p.id === productId);
    if (selectedProduct) {
      form.setValue(`details.${index}.unitPrice`, Number(selectedProduct.salePrice));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
          </h2>
          <p className="text-muted-foreground">Registre una orden de compra para abastecer existencias.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione proveedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliersData?.data.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.businessName} (RUC: {supplier.documentNumber})
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
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Emisión *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Entrega urgente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Productos / Partidas</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar Item
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Producto *</TableHead>
                      <TableHead className="w-[20%]">Cantidad *</TableHead>
                      <TableHead className="w-[20%]">Precio Unitario (S/) *</TableHead>
                      <TableHead className="w-[15%]">Subtotal</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const qty = Number(watchedDetails?.[index]?.quantity) || 0;
                      const price = Number(watchedDetails?.[index]?.unitPrice) || 0;
                      const lineSubtotal = qty * price;

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`details.${index}.productId`}
                              render={({ field: subField }) => (
                                <FormItem className="space-y-0">
                                  <Select
                                    onValueChange={(val) => {
                                      subField.onChange(val);
                                      handleProductChange(index, val);
                                    }}
                                    value={subField.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccione producto" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {productsData?.data.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                          {product.name} (SKU: {product.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`details.${index}.quantity`}
                              render={({ field: subField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input type="number" step="0.01" {...subField} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`details.${index}.unitPrice`}
                              render={({ field: subField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input type="number" step="0.01" {...subField} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">S/ {lineSubtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:text-rose-700"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 border-t pt-4 text-right">
              <div className="text-sm">
                Subtotal: <span className="font-semibold ml-2">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                IGV (18%): <span className="font-semibold ml-2">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="text-xl font-bold">
                Total: <span className="text-emerald-600 ml-2">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/purchase-orders')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Orden'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
