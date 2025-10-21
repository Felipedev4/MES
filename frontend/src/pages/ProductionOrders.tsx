/**
 * Página de Ordens de Produção
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { ProductionOrder, Item, Mold, ProductionStatus } from '../types';
import { useSnackbar } from 'notistack';

// Schema de validação
const orderSchema = yup.object({
  orderNumber: yup.string().required('Número da ordem é obrigatório').max(50),
  itemId: yup.number().required('Item é obrigatório').positive(),
  moldId: yup.number().nullable().positive(),
  plannedQuantity: yup.number().required('Quantidade planejada é obrigatória').positive().integer(),
  priority: yup.number().min(0).integer(),
  plannedStartDate: yup.date().required('Data de início é obrigatória'),
  plannedEndDate: yup.date().required('Data de fim é obrigatória'),
  notes: yup.string().max(1000),
});

type OrderFormData = yup.InferType<typeof orderSchema>;

// Helper: Converte Date para formato yyyy-MM-dd
const formatDateForInput = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProductionOrders: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<OrderFormData>({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      orderNumber: '',
      itemId: 0,
      moldId: undefined,
      plannedQuantity: 0,
      priority: 0,
      plannedStartDate: formatDateForInput(new Date()) as any,
      plannedEndDate: formatDateForInput(new Date()) as any,
      notes: '',
    },
  });

  const loadOrders = async () => {
    try {
      const response = await api.get<ProductionOrder[]>('/production-orders');
      setOrders(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar ordens', { variant: 'error' });
    }
  };

  const loadItems = async () => {
    try {
      const response = await api.get<Item[]>('/items', { params: { active: true } });
      setItems(response.data);
    } catch (error) {
      console.error('Erro ao carregar itens');
    }
  };

  const loadMolds = async () => {
    try {
      const response = await api.get<Mold[]>('/molds', { params: { active: true } });
      setMolds(response.data);
    } catch (error) {
      console.error('Erro ao carregar moldes');
    }
  };

  useEffect(() => {
    loadOrders();
    loadItems();
    loadMolds();
  }, []);

  const handleOpenDialog = (order?: ProductionOrder) => {
    if (order) {
      setEditingOrder(order);
      reset({
        ...order,
        plannedStartDate: formatDateForInput(order.plannedStartDate) as any,
        plannedEndDate: formatDateForInput(order.plannedEndDate) as any,
      });
    } else {
      setEditingOrder(null);
      reset({
        orderNumber: '',
        itemId: 0,
        moldId: undefined,
        plannedQuantity: 0,
        priority: 0,
        plannedStartDate: formatDateForInput(new Date()) as any,
        plannedEndDate: formatDateForInput(new Date()) as any,
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrder(null);
    reset();
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      if (editingOrder) {
        await api.put(`/production-orders/${editingOrder.id}`, data);
        enqueueSnackbar('Ordem atualizada com sucesso!', { variant: 'success' });
      } else {
        await api.post('/production-orders', data);
        enqueueSnackbar('Ordem criada com sucesso!', { variant: 'success' });
      }
      loadOrders();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar ordem';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const getStatusColor = (status: ProductionStatus) => {
    const colors = {
      PENDING: 'default',
      IN_PROGRESS: 'primary',
      PAUSED: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] as any;
  };

  const getStatusLabel = (status: ProductionStatus) => {
    const labels = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Andamento',
      PAUSED: 'Pausada',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
    };
    return labels[status];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Ordens de Produção</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Ordem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Ordem</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Molde</TableCell>
              <TableCell>Planejado</TableCell>
              <TableCell>Produzido</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.item?.name || '-'}</TableCell>
                <TableCell>{order.mold?.name || '-'}</TableCell>
                <TableCell>{order.plannedQuantity}</TableCell>
                <TableCell>{order.producedQuantity}</TableCell>
                <TableCell>
                  {((order.producedQuantity / order.plannedQuantity) * 100).toFixed(1)}%
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.priority}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(order)} size="small">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingOrder ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'}
          </DialogTitle>
          <DialogContent>
            <Controller
              name="orderNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número da Ordem"
                  fullWidth
                  margin="normal"
                  error={!!errors.orderNumber}
                  helperText={errors.orderNumber?.message}
                />
              )}
            />
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Item"
                  fullWidth
                  margin="normal"
                  error={!!errors.itemId}
                  helperText={errors.itemId?.message}
                >
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="moldId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Molde (opcional)"
                  fullWidth
                  margin="normal"
                  error={!!errors.moldId}
                  helperText={errors.moldId?.message}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {molds.map((mold) => (
                    <MenuItem key={mold.id} value={mold.id}>
                      {mold.code} - {mold.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="plannedQuantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantidade Planejada"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.plannedQuantity}
                  helperText={errors.plannedQuantity?.message}
                />
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Prioridade"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.priority}
                  helperText={errors.priority?.message}
                />
              )}
            />
            <Controller
              name="plannedStartDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de Início Planejada"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.plannedStartDate}
                  helperText={errors.plannedStartDate?.message}
                />
              )}
            />
            <Controller
              name="plannedEndDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de Fim Planejada"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.plannedEndDate}
                  helperText={errors.plannedEndDate?.message}
                />
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observações"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductionOrders;


