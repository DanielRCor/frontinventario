import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { UnitOfMeasure, getUnits, deleteUnit } from '@/api/units.api';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { UnitDialog } from './components/UnitDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function UnitsListPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidad de medida eliminada');
      setConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const handleEdit = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  const handleDelete = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setConfirmOpen(true);
  };

  const handleCreate = () => {
    setSelectedUnit(null);
    setDialogOpen(true);
  };

  const columns: ColumnDef<UnitOfMeasure>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'abbreviation',
      header: 'Abreviatura',
      cell: ({ row }) => <Badge variant="outline">{row.original.abbreviation}</Badge>,
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        const unit = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(unit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(unit)}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unidades de Medida</h2>
          <p className="text-muted-foreground">Gestiona las unidades para los productos.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Unidad
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
      />

      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unit={selectedUnit}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Estás seguro?"
        description={`Se eliminará la unidad "${selectedUnit?.name}". Esta acción no se puede deshacer.`}
        onConfirm={() => selectedUnit && deleteMutation.mutate(selectedUnit.id)}
        variant="destructive"
      />
    </div>
  );
}
