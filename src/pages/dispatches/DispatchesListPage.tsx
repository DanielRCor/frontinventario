import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle2, Clock3, Truck, Package2 } from 'lucide-react';

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
    {
      accessorKey: 'dispatchNumber',
      header: 'Despacho',
      cell: ({ row }) => <span className="font-medium text-slate-900 dark:text-white">{row.original.dispatchNumber}</span>,
    },
    {
      accessorKey: 'invoice.fullNumber',
      header: 'Factura',
      cell: ({ row }) => <span className="text-slate-700 dark:text-slate-200">{row.original.invoice?.fullNumber}</span>,
    },
    {
      accessorKey: 'invoice.customer.businessName',
      header: 'Cliente',
      cell: ({ row }) => <span className="text-slate-700 dark:text-slate-200">{row.original.invoice?.customer?.businessName}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        const tone =
          status === 'DELIVERED'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : status === 'IN_TRANSIT'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-amber-100 text-amber-700 border-amber-200';

        const icon = status === 'DELIVERED' ? CheckCircle2 : status === 'IN_TRANSIT' ? Truck : Clock3;
        const StatusIcon = icon;

        return (
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      accessorKey: 'dispatchDate',
      header: 'Fecha',
      cell: ({ row }) => format(new Date(row.original.dispatchDate), 'dd/MM/yyyy HH:mm'),
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

  const total = data?.data?.length ?? 0;
  const delivered = data?.data?.filter((dispatch) => dispatch.status === 'DELIVERED').length ?? 0;
  const inTransit = data?.data?.filter((dispatch) => dispatch.status === 'IN_TRANSIT').length ?? 0;
  const pending = data?.data?.filter((dispatch) => dispatch.status === 'PENDING').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Gestión logística</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Despachos</h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Controla el estado de entrega de cada factura y revisa su seguimiento en un solo lugar.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-4 text-right backdrop-blur md:block">
            <p className="text-sm text-slate-300">Despachos registrados</p>
            <p className="text-3xl font-bold">{total}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pendientes</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold">{pending}</p>
            <Clock3 className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">En ruta</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold">{inTransit}</p>
            <Truck className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Entregados</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold">{delivered}</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card p-6 shadow-sm">
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
