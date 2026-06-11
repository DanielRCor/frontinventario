import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createInvoice } from '../../api/invoices.api';
import { getCustomers } from '../../api/customers.api';
import { getWarehouses } from '../../api/warehouses.api';
import { getProducts } from '../../api/products.api';

const invoiceSchema = z.object({
  type: z.enum(['FACTURA', 'BOLETA']),
  customerId: z.string().min(1, 'Selecciona un cliente'),
  warehouseId: z.string().min(1, 'Selecciona un almacén'),
  observations: z.string().optional(),
  details: z
    .array(
      z.object({
        productId: z.string().min(1, 'Selecciona un producto'),
        quantity: z.number().min(0.01, 'Cantidad mayor a 0'),
        unitPrice: z.number().min(0, 'Precio mayor o igual a 0'),
      })
    )
    .min(1, 'Agrega al menos un producto'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers', 'invoice-form'],
    queryFn: () => getCustomers({ page: 1, limit: 100, search: '' }),
  });
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
  });
  const { data: products } = useQuery({
    queryKey: ['products', 'invoice-form'],
    queryFn: () => getProducts({ page: 1, limit: 100, search: '' }),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: 'FACTURA',
      details: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const watchDetails = watch('details');

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error al emitir el comprobante');
    },
  });

  const onSubmit = (data: InvoiceFormValues) => {
    createMutation.mutate(data);
  };

  const subtotal = watchDetails.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Venta</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Datos Generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Comprobante
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <select
                {...register('customerId')}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un cliente</option>
                {customers?.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Almacén de Despacho
              </label>
              <select
                {...register('warehouseId')}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un almacén</option>
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.warehouseId && <p className="text-red-500 text-xs mt-1">{errors.warehouseId.message}</p>}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
              <textarea
                {...register('observations')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Productos</h2>
            <button
              type="button"
              onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
              className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
            >
              + Añadir Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2 w-32">Cantidad</th>
                  <th className="pb-2 w-32">Precio Unit. (S/)</th>
                  <th className="pb-2 w-32">Subtotal</th>
                  <th className="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const qty = watchDetails[index]?.quantity || 0;
                  const price = watchDetails[index]?.unitPrice || 0;
                  const lineSubtotal = qty * price;

                  return (
                    <tr key={field.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 pr-2">
                        <select
                          {...register(`details.${index}.productId`)}
                          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        >
                          <option value="">Seleccionar...</option>
                          {products?.data?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} - (Ref: S/{Number(p.salePrice).toFixed(2)})
                            </option>
                          ))}
                        </select>
                        {errors.details?.[index]?.productId && (
                          <p className="text-red-500 text-xs mt-1">{errors.details[index].productId?.message}</p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`details.${index}.quantity`, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                        {errors.details?.[index]?.quantity && (
                          <p className="text-red-500 text-xs mt-1">{errors.details[index].quantity?.message}</p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`details.${index}.unitPrice`, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="py-3 px-2 text-gray-900 dark:text-gray-300 font-medium">
                        S/ {lineSubtotal.toFixed(2)}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IGV (18%):</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total:</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {createMutation.isPending ? 'Emitiendo...' : 'Emitir Comprobante'}
          </button>
        </div>
      </form>
    </div>
  );
}
