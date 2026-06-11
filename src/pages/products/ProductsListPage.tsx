import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Product, getProducts, deleteProduct } from '@/api/products.api';
import { Warehouse, getWarehouses } from '@/api/warehouses.api';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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

export default function ProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => getProducts({ page, limit, search }),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado');
      setConfirmOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setConfirmOpen(true);
  };

  const statusMap = {
    ACTIVE: { label: 'Activo', variant: 'default' as const },
    INACTIVE: { label: 'Inactivo', variant: 'secondary' as const },
    DISCONTINUED: { label: 'Descontinuado', variant: 'destructive' as const },
  };

  const getStockForWarehouse = (product: Product) => {
    if (!warehouseId) {
      return product.warehouseStocks?.reduce((total, stock) => total + Number(stock.quantity), 0) ?? 0;
    }

    return Number(product.warehouseStocks?.find((stock) => stock.warehouseId === warehouseId)?.quantity ?? 0);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.category?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'salePrice',
      header: 'Precio',
      cell: ({ row }) => `S/ ${Number(row.original.salePrice).toFixed(2)}`,
    },
    {
      id: 'stock',
      header: 'Stock actual',
      cell: ({ row }) => {
        const stock = getStockForWarehouse(row.original);
        const isLowStock = stock <= row.original.minimumStock;

        return (
          <div className="flex flex-col">
            <span className={`font-semibold ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stock.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">Mínimo: {row.original.minimumStock}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'unitOfMeasure.abbreviation',
      header: 'Unidad',
      cell: ({ row }) => <Badge variant="outline">{row.original.unitOfMeasure?.abbreviation}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = statusMap[row.original.status as keyof typeof statusMap];
        return <Badge variant={status?.variant || 'default'}>{status?.label || row.original.status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
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
              <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(product)}
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

  if (isLoading) {
    return <div className="p-8 text-center">Cargando productos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Error al cargar los productos.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">Catálogo principal de artículos e inventario.</p>
        </div>
        <Button onClick={() => navigate('/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los almacenes</option>
          {warehouses?.map((warehouse: Warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
        <Input
          placeholder="Buscar por código o nombre..."
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Estás seguro?"
        description={`Se eliminará el producto "${selectedProduct?.name}". Esta acción no se puede deshacer.`}
        onConfirm={() => selectedProduct && deleteMutation.mutate(selectedProduct.id)}
        variant="destructive"
      />
    </div>
  );
}
