import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UnitOfMeasure, createUnit, updateUnit } from '@/api/units.api';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

const unitSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  abbreviation: z.string().min(1, 'La abreviatura es requerida').max(10, 'Máximo 10 caracteres'),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: UnitOfMeasure | null;
}

export function UnitDialog({ open, onOpenChange, unit }: UnitDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!unit;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
    },
  });

  useEffect(() => {
    if (unit && open) {
      form.reset({
        name: unit.name,
        abbreviation: unit.abbreviation,
      });
    } else if (!open) {
      form.reset({ name: '', abbreviation: '' });
    }
  }, [unit, open, form]);

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidad creada exitosamente');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear unidad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UnitFormValues) => updateUnit(unit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidad actualizada exitosamente');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar unidad');
    },
  });

  const onSubmit = (data: UnitFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ name: data.name, abbreviation: data.abbreviation });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Unidad' : 'Nueva Unidad'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la unidad de medida.' : 'Ingresa los datos para crear una nueva unidad.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Kilogramos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: KG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
