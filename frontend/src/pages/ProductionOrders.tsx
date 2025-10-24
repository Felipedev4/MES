/**
 * Página de Ordens de Produção - Design Profissional
 */

import React, { useEffect, useState, useMemo } from 'react';
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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  Typography,
  alpha,
  useTheme,
  LinearProgress,
  Tooltip,
  Stack,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Palette as PaletteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  PauseCircle as PausedIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { ProductionOrder, Item, Mold, Color } from '../types';
import { useSnackbar } from 'notistack';
import {
  getStatusLabel,
  getStatusColor,
  PRODUCTION_STATUS_OPTIONS,
  getStatusIcon,
} from '../utils/productionStatus';

// Schema de validação
const orderSchema = yup.object({
  orderNumber: yup.string().required('Número da ordem é obrigatório').max(50),
  itemId: yup.number().required('Item é obrigatório').positive(),
  colorId: yup.number().nullable().positive(),
  moldId: yup.number().nullable().positive(),
  plannedQuantity: yup.number().required('Quantidade planejada é obrigatória').positive().integer(),
  priority: yup.number().min(0).integer(),
  status: yup.string().oneOf(['PROGRAMMING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED']),
  plannedStartDate: yup.date().required('Data de início é obrigatória'),
  plannedEndDate: yup.date().required('Data de fim é obrigatória'),
  notes: yup.string().max(1000),
});

type OrderFormData = yup.InferType<typeof orderSchema>;

// Helper: Converte Date para formato yyyy-MM-ddTHH:mm (datetime-local)
const formatDateTimeForInput = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ProductionOrders: React.FC = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [itemColors, setItemColors] = useState<Color[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { enqueueSnackbar} = useSnackbar();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<OrderFormData>({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      orderNumber: '',
      itemId: 0,
      colorId: undefined,
      moldId: undefined,
      plannedQuantity: 0,
      priority: 0,
      status: 'PROGRAMMING' as any,
      plannedStartDate: formatDateTimeForInput(new Date()) as any,
      plannedEndDate: formatDateTimeForInput(new Date()) as any,
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

  const loadItemColors = async (itemId: number) => {
    try {
      const response = await api.get<Color[]>(`/items/${itemId}/colors`);
      setItemColors(response.data);
    } catch (error) {
      console.error('Erro ao carregar cores do item:', error);
      setItemColors([]);
    }
  };

  useEffect(() => {
    loadOrders();
    loadItems();
    loadMolds();
  }, []);

  const handleOpenDialog = async (order?: ProductionOrder) => {
    if (order) {
      setEditingOrder(order);
      reset({
        ...order,
        status: order.status as any,
        plannedStartDate: formatDateTimeForInput(order.plannedStartDate) as any,
        plannedEndDate: formatDateTimeForInput(order.plannedEndDate) as any,
      });
      // Carregar cores do item
      if (order.itemId) {
        await loadItemColors(order.itemId);
      }
      if (order.color) {
        setSelectedColor(order.color);
      }
    } else {
      setEditingOrder(null);
      setItemColors([]);
      setSelectedColor(null);
      reset({
        orderNumber: '',
        itemId: 0,
        colorId: undefined,
        moldId: undefined,
        plannedQuantity: 0,
        priority: 0,
        status: 'PROGRAMMING' as any,
        plannedStartDate: formatDateTimeForInput(new Date()) as any,
        plannedEndDate: formatDateTimeForInput(new Date()) as any,
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrder(null);
    setItemColors([]);
    setSelectedColor(null);
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

  // Filtrar ordens
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.item?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        order.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) => o.status === 'ACTIVE').length;
    const programming = orders.filter((o) => o.status === 'PROGRAMMING').length;
    const paused = orders.filter((o) => o.status === 'PAUSED').length;
    const finished = orders.filter((o) => o.status === 'FINISHED').length;
    const totalPlanned = orders.reduce((sum, o) => sum + o.plannedQuantity, 0);
    const totalProduced = orders.reduce((sum, o) => sum + o.producedQuantity, 0);
    const avgProgress = total > 0 
      ? orders.reduce((sum, o) => sum + ((o.producedQuantity / o.plannedQuantity) * 100), 0) / total 
      : 0;

    return { total, active, programming, paused, finished, totalPlanned, totalProduced, avgProgress };
  }, [orders]);

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<AssignmentIcon />}
        title="Ordens de Produção"
        subtitle="Gerenciamento de ordens de produção"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
      />

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total de Ordens"
            value={stats.total}
            subtitle="Cadastradas"
            icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Em Produção"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Programação/Pausadas"
            value={`${stats.programming}/${stats.paused}`}
            subtitle="Aguardando"
            icon={<PausedIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Progresso Médio"
            value={`${stats.avgProgress.toFixed(1)}%`}
            subtitle={`${stats.totalProduced.toLocaleString()}/${stats.totalPlanned.toLocaleString()} pçs`}
            icon={<ProgressIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Buscar por número, código ou nome do item..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          >
            <option value="ALL">Todos Status</option>
            <option value="PROGRAMMING">Programação</option>
            <option value="ACTIVE">Ativas</option>
            <option value="PAUSED">Pausadas</option>
            <option value="FINISHED">Finalizadas</option>
            <option value="CANCELLED">Canceladas</option>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nova Ordem
          </Button>
        </Stack>
      </Paper>

      <TableContainer 
        component={Paper}
        sx={{ 
          maxHeight: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 300px)' },
          overflow: 'auto',
          '& .MuiTableCell-head': {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nº Ordem</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Cor</TableCell>
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL'
                      ? 'Nenhuma ordem encontrada com os filtros aplicados'
                      : 'Nenhuma ordem cadastrada'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const progress = (order.producedQuantity / order.plannedQuantity) * 100;
                
                return (
                <TableRow 
                  key={order.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{order.orderNumber}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{order.item?.name || '-'}</TableCell>
                  <TableCell>
                    {order.color ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '8px',
                            bgcolor: order.color.hexCode || '#ccc',
                            border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                            boxShadow: `0 2px 4px ${alpha(order.color.hexCode || '#000', 0.3)}`,
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>{order.color.name}</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{order.mold?.name || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {order.plannedQuantity.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color={order.producedQuantity > 0 ? 'success.main' : 'text.secondary'}>
                      {order.producedQuantity.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                        {progress.toFixed(1)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(progress, 100)} 
                        color={progress >= 100 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${getStatusIcon(order.status)} ${getStatusLabel(order.status)}`}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.priority} 
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton 
                        onClick={() => handleOpenDialog(order)} 
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {editingOrder ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'}
                </Typography>
              </Box>
              <IconButton 
                onClick={handleCloseDialog}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (value) {
                      loadItemColors(Number(value));
                    } else {
                      setItemColors([]);
                      setSelectedColor(null);
                      setValue('colorId', undefined);
                    }
                  }}
                >
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Campo de Seleção de Cor */}
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                options={itemColors}
                value={selectedColor}
                onChange={(_, newValue) => {
                  setSelectedColor(newValue);
                  setValue('colorId', newValue?.id);
                }}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cor do Item"
                    placeholder={itemColors.length === 0 ? "Selecione um item primeiro" : "Selecione a cor"}
                    disabled={itemColors.length === 0}
                    helperText={itemColors.length === 0 ? "Item não possui cores cadastradas ou nenhum item selecionado" : ""}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PaletteIcon sx={{ ml: 1, mr: -0.5, color: 'text.secondary' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      <Box display="flex" alignItems="center" gap={1.5} width="100%">
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: option.hexCode || '#ccc',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            flexShrink: 0,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.code}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  );
                }}
              />
              {selectedColor && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Cor selecionada: {selectedColor.name}
                </Typography>
              )}
            </Box>
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
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  margin="normal"
                  error={!!errors.status}
                  helperText={errors.status?.message || 'Atenção: Apenas uma ordem pode estar Em Atividade por vez'}
                >
                  {PRODUCTION_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="plannedStartDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data e Hora Inicial Planejada"
                  type="datetime-local"
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
                  label="Data e Hora Final Planejada"
                  type="datetime-local"
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
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingOrder ? 'Atualizar' : 'Criar Ordem'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductionOrders;


