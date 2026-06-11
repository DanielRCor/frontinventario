import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router';
import {
  getInvoice,
  markInvoiceAsPaid,
  cancelInvoice,
} from '../../api/invoices.api';
import { format } from 'date-fns';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Error al anular');
    },
  });

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Comprobante no encontrado</div>;

  const statusLabel =
    invoice.status === 'PAID' ? 'PAGADO' : invoice.status === 'CANCELLED' ? 'ANULADO' : 'PENDIENTE';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link to="/invoices" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-2 inline-block">
            &larr; Volver a Facturación
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {invoice.type === 'FACTURA' ? 'Factura' : 'Boleta'} {invoice.fullNumber}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              invoice.status === 'PAID'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : invoice.status === 'CANCELLED'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {statusLabel}
          </span>
          {invoice.status === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  navigate(`/dispatches/new/${invoice.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Crear Despacho
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Marcar como pagado?')) {
                    payMutation.mutate(invoice.id);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? 'Procesando...' : 'Cobrar'}
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Está seguro de anular este comprobante? El stock será devuelto.')) {
                    cancelMutation.mutate(invoice.id);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Procesando...' : 'Anular'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos del Cliente</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Razón Social:</span> {invoice.customer?.businessName}</p>
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Documento:</span> {invoice.customer?.documentType} {invoice.customer?.documentNumber}</p>
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Dirección:</span> {invoice.customer?.address || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Detalles del Comprobante</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Fecha Emisión:</span> {format(new Date(invoice.issueDate), 'dd/MM/yyyy HH:mm')}</p>
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Almacén:</span> {invoice.warehouse?.name}</p>
            <p><span className="text-gray-500 dark:text-gray-400 font-medium">Emitido por:</span> {invoice.creator?.fullName}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Descripción</th>
                <th className="p-4 font-medium text-right">Cant.</th>
                <th className="p-4 font-medium text-right">P. Unit.</th>
                <th className="p-4 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.details?.map((detail) => (
                <tr key={detail.id} className="text-sm">
                  <td className="p-4 text-gray-900 dark:text-gray-300">{detail.product?.code}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-300 font-medium">{detail.product?.name}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-300 text-right">{Number(detail.quantity).toFixed(2)}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-300 text-right">S/ {Number(detail.unitPrice).toFixed(2)}</td>
                  <td className="p-4 text-gray-900 dark:text-gray-300 text-right font-medium">S/ {Number(detail.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-700/30 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span>S/ {Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>IGV (18%):</span>
              <span>S/ {Number(invoice.igv).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Total:</span>
              <span>S/ {Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {invoice.observations && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Observaciones</h3>
          <p className="text-gray-900 dark:text-gray-300 text-sm whitespace-pre-wrap">{invoice.observations}</p>
        </div>
      )}
    </div>
  );
}
