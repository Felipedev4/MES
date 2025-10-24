/**
 * Página de Paradas (Downtimes) - Design Profissional
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  InputAdornment,
  Stack,
  alpha,
  useTheme} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  PauseCircle as DowntimeIcon,
  PlayCircle as ProductiveIcon,
  Cancel as UnproductiveIcon,
  Schedule as PlannedIcon,
  AccessTime as DurationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';
import { Downtime, DowntimeType } from '../types';
import { useSnackbar } from 'notistack';
import moment from 'moment';

// Schema de validação
const downtimeSchema = yup.object({
  productionOrderId: yup.number().nullable(),
  type: yup.string().required('Tipo é obrigatório').oneOf(['PRODUCTIVE', 'UNPRODUCTIVE', 'PLANNED']),
  reason: yup.string().required('Motivo é obrigatório').max(200),
  description: yup.string().max(1000),
  startTime: yup.date().required('Data/hora de início é obrigatória'),
  endTime: yup.date().nullable()});

type DowntimeFormData = yup.InferType<typeof downtimeSchema>;

const Downtimes: React.FC = () => {
  const [downtimes, setDowntimes] = useState<Downtime[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DowntimeFormData>({
    resolver: yupResolver(downtimeSchema),
    defaultValues: {
      productionOrderId: null as any,
      type: 'UNPRODUCTIVE' as any,
      reason: '',
      description: '',
      startTime: new Date() as any,
      endTime: undefined}});

  const loadDowntimes = async () => {
    try {
      const response = await api.get<Downtime[]>('/downtimes');
      setDowntimes(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar paradas', { variant: 'error' });
    }
  };

  const loadProductionOrders = async () => {
    try {
      const response = await api.get('/production-orders');
      // Filtrar apenas ordens ativas ou em progresso
      const activeOrders = response.data.filter((order: any) => 
        order.status === 'IN_PROGRESS' || order.status === 'PENDING'
      );
      setProductionOrders(activeOrders);
    } catch (error) {
      console.error('Erro ao carregar ordens de produção:', error);
    }
  };

  useEffect(() => {
    loadDowntimes();
    loadProductionOrders();
  }, []);

  const handleOpenDialog = () => {
    reset({
      productionOrderId: null as any,
      type: 'UNPRODUCTIVE' as any,
      reason: '',
      description: '',
      startTime: new Date() as any,
      endTime: undefined});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    reset();
  };

  const onSubmit = async (data: DowntimeFormData) => {
    try {
      await api.post('/downtimes', data);
      enqueueSnackbar('✅ Parada registrada com sucesso!', { variant: 'success' });
      loadDowntimes();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar parada';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const getTypeColor = (type: DowntimeType) => {
    const colors = {
      PRODUCTIVE: theme.palette.primary.main,
      UNPRODUCTIVE: theme.palette.error.main,
      PLANNED: theme.palette.warning.main};
    return colors[type];
  };

  const getTypeLabel = (type: DowntimeType) => {
    const labels = {
      PRODUCTIVE: 'Produtiva',
      UNPRODUCTIVE: 'Improdutiva',
      PLANNED: 'Planejada'};
    return labels[type];
  };

  const getTypeIcon = (type: DowntimeType) => {
    const icons = {
      PRODUCTIVE: <ProductiveIcon />,
      UNPRODUCTIVE: <UnproductiveIcon />,
      PLANNED: <PlannedIcon />};
    return icons[type];
  };

  // Filtrar paradas
  const filteredDowntimes = useMemo(() => {
    return downtimes.filter((downtime: any) => {
      const matchesSearch = 
        downtime.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (downtime.description && downtime.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'ALL' || downtime.type === filterType;
      const matchesStatus = 
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && downtime.isActive) ||
        (filterStatus === 'FINISHED' && !downtime.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [downtimes, searchTerm, filterType, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = downtimes.length;
    const productive = downtimes.filter((d: any) => d.type === 'PRODUCTIVE').length;
    const unproductive = downtimes.filter((d: any) => d.type === 'UNPRODUCTIVE').length;
    const planned = downtimes.filter((d: any) => d.type === 'PLANNED').length;
    const active = downtimes.filter((d: any) => d.isActive).length;

    return { total, productive, unproductive, planned, active };
  }, [downtimes]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<DowntimeIcon />}
        title="Paradas"
        subtitle="Gerenciamento de paradas produtivas, improdutivas e planejadas"
        iconGradient="linear-gradient(135deg, #f44336 0%, #c62828 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Paradas"
            value={stats.total}
            subtitle="Registradas no sistema"
            icon={<DowntimeIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Produtivas"
            value={stats.productive}
            subtitle={`${stats.total > 0 ? Math.round((stats.productive / stats.total) * 100) : 0}% do total`}
            icon={<ProductiveIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Improdutivas"
            value={stats.unproductive}
            subtitle={`${stats.total > 0 ? Math.round((stats.unproductive / stats.total) * 100) : 0}% do total`}
            icon={<UnproductiveIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Em Andamento"
            value={stats.active}
            subtitle={stats.active > 0 ? 'Paradas ativas agora' : 'Nenhuma ativa'}
            icon={<DurationIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          {/* Busca */}
          <TextField
            placeholder="Buscar por motivo ou descrição..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )}}
          />

          {/* Filtro por Tipo */}
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <MenuItem value="ALL">Todos os Tipos</MenuItem>
            <MenuItem value="PRODUCTIVE">Produtiva</MenuItem>
            <MenuItem value="UNPRODUCTIVE">Improdutiva</MenuItem>
            <MenuItem value="PLANNED">Planejada</MenuItem>
          </TextField>

          {/* Filtro por Status */}
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">Todos Status</MenuItem>
            <MenuItem value="ACTIVE">Em Andamento</MenuItem>
            <MenuItem value="FINISHED">Finalizadas</MenuItem>
          </TextField>

          {/* Botão Registrar */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Registrar Parada
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Paradas */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: { xs: 'calc(100vh - 550px)', md: 'calc(100vh - 500px)' },
          overflow: 'auto',
          '& .MuiTableCell-head': {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 600,
            fontSize: '0.875rem'}}}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width="10%">Tipo</TableCell>
              <TableCell width="20%">Motivo</TableCell>
              <TableCell width="15%">Ordem</TableCell>
              <TableCell width="13%">Início</TableCell>
              <TableCell width="13%">Fim</TableCell>
              <TableCell width="10%">Duração</TableCell>
              <TableCell width="10%">Status</TableCell>
              <TableCell width="9%" align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDowntimes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
                      ? 'Nenhuma parada encontrada com os filtros aplicados'
                      : 'Nenhuma parada registrada'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDowntimes.map((downtime: any) => (
                <TableRow
                  key={downtime.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(downtime.type)}
                      label={getTypeLabel(downtime.type)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getTypeColor(downtime.type), 0.1),
                        color: getTypeColor(downtime.type),
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: getTypeColor(downtime.type)}}}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {downtime.reason}
                    </Typography>
                    {downtime.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'}}
                      >
                        {downtime.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {downtime.productionOrder ? (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {downtime.productionOrder.orderNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {downtime.productionOrder.item?.name || 'N/A'}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        label="Geral"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {moment(downtime.startTime).format('DD/MM/YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(downtime.startTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {downtime.endTime ? (
                      <>
                        <Typography variant="body2">
                          {moment(downtime.endTime).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(downtime.endTime).format('HH:mm')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {downtime.durationFormatted ? (
                      <Chip
                        icon={<DurationIcon sx={{ fontSize: 16 }} />}
                        label={downtime.durationFormatted}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={downtime.isActive ? 'Em Andamento' : 'Finalizada'}
                      size="small"
                      color={downtime.isActive ? 'warning' : 'success'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Detalhes">
                      <IconButton size="small" color="primary">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Registro */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DowntimeIcon color="error" />
              <Typography variant="h6" fontWeight={600}>
                Registrar Nova Parada
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Controller
              name="productionOrderId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Ordem de Produção (Opcional)"
                  fullWidth
                  margin="normal"
                  error={!!errors.productionOrderId}
                  helperText={errors.productionOrderId?.message || 'Vincular esta parada a uma ordem específica'}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <MenuItem value="">
                    <em>Nenhuma (Parada Geral)</em>
                  </MenuItem>
                  {productionOrders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {order.orderNumber} - {order.item?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.item?.code || ''} • Máquina: {order.plcConfig?.name || 'N/A'}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo de Parada"
                  fullWidth
                  margin="normal"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  <MenuItem value="PRODUCTIVE">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ProductiveIcon color="primary" fontSize="small" />
                      <span>Produtiva (Setup, Troca de Molde, etc.)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="UNPRODUCTIVE">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <UnproductiveIcon color="error" fontSize="small" />
                      <span>Improdutiva (Falha, Falta de Material, etc.)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="PLANNED">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PlannedIcon color="warning" fontSize="small" />
                      <span>Planejada (Manutenção Preventiva, etc.)</span>
                    </Stack>
                  </MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Motivo"
                  placeholder="Ex: Falta de Operador, Setup de Molde, etc."
                  fullWidth
                  margin="normal"
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição Detalhada (Opcional)"
                  placeholder="Adicione mais informações sobre a parada..."
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data/Hora de Início"
                      type="datetime-local"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data/Hora de Fim (Opcional)"
                      type="datetime-local"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message || 'Deixe em branco se ainda está em andamento'}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<AddIcon />}>
              Registrar Parada
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Downtimes;
