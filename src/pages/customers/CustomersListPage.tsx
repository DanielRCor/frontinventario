import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Customer, getCustomers, deleteCustomer } from '@/api/customers.api';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CustomerDialog } from './components/CustomerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function CustomersListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', page, debouncedSearch],
    queryFn: () => getCustomers({ page, limit, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado');
      setConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'documentNumber',
      header: 'Documento',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm">{row.original.documentNumber}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.documentType}</span>
        </div>
      ),
    },
    {
      accessorKey: 'businessName',
      header: 'Nombre / Razón Social',
      cell: ({ row }) => <span className="font-medium">{row.original.businessName}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Contacto',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.original.email || '-'}</span>
          <span className="text-xs text-muted-foreground">{row.original.phone || '-'}</span>
        </div>
      ),
    },


    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(customer)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(customer)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-8 text-center">Cargando clientes...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error al cargar clientes.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gestiona el directorio de tus clientes.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center">
        <Input
          placeholder="Buscar por DNI/RUC o nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pageCount={data?.meta?.totalPages ?? 1}
        page={page}
        onPageChange={setPage}
      />

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Estás seguro?"
        description={`Se eliminará al cliente "${selectedCustomer?.businessName}". Esta acción no se puede deshacer.`}
        onConfirm={() => selectedCustomer && deleteMutation.mutate(selectedCustomer.id)}
        variant="destructive"
      />
    </div>
  );
}
