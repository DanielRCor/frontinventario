import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getInvoices, Invoice } from '../../api/invoices.api';
import { format } from 'date-fns';

export default function InvoicesListPage() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices?.filter(
    (inv) =>
      inv.fullNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturación y Ventas</h1>
        <Link
          to="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nueva Venta
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando ventas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="p-4 font-medium">Comprobante</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {invoice.type === 'FACTURA' ? 'Factura' : 'Boleta'}
                      </div>
                      <div className="text-sm text-gray-500">{invoice.fullNumber}</div>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-300">
                      {invoice.customer?.businessName || 'Cliente no encontrado'}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-300">
                      {format(new Date(invoice.issueDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-gray-300 font-medium">
                      S/ {Number(invoice.total).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : invoice.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {invoice.status === 'PAID' ? 'PAGADO' : invoice.status === 'CANCELLED' ? 'ANULADO' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredInvoices?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No se encontraron comprobantes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
