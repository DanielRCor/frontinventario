import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';

import { getDispatches, type Dispatch } from '@/api/invoices.api';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';

export default function DispatchesListPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dispatches'],
    queryFn: getDispatches,
  });

  const getStatusLabel = (status: Dispatch['status']) => {
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

  const columns: ColumnDef<Dispatch>[] = [
    { accessorKey: 'dispatchNumber', header: 'Despacho' },
    {
      accessorKey: 'invoice.fullNumber',
      header: 'Factura',
      cell: ({ row }) => row.original.invoice?.fullNumber,
    },
    {
      accessorKey: 'invoice.customer.businessName',
      header: 'Cliente',
      cell: ({ row }) => row.original.invoice?.customer?.businessName,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => getStatusLabel(row.original.status),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/dispatches/${row.original.id}`)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Despachos</h2>
          <p className="text-muted-foreground">Flujo de entrega asociado a facturas pendientes.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.data || []}
          pageCount={1}
          page={1}
          onPageChange={() => undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
