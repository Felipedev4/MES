/**
 * Página de Cadastro de Moldes - Design Profissional
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Typography,
  Stack,
  InputAdornment,
  alpha,
  useTheme,
  Tooltip} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as MoldIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Event as MaintenanceIcon,
  Timer as CycleIcon} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';
import { Mold } from '../types';
import { useSnackbar } from 'notistack';
import moment from 'moment';

interface MoldFormData {
  code: string;
  name: string;
  description: string;
  cavities: number;
  activeCavities: number | null;
  cycleTime: number | null;
  maintenanceDate: string;
  active: boolean;
}

const initialFormData: MoldFormData = {
  code: '',
  name: '',
  description: '',
  cavities: 1,
  activeCavities: null,
  cycleTime: null,
  maintenanceDate: '',
  active: true};

const Molds: React.FC = () => {
  const theme = useTheme();
  const [molds, setMolds] = useState<Mold[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MoldFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { enqueueSnackbar } = useSnackbar();

  const loadMolds = async () => {
    try {
      const response = await api.get<Mold[]>('/molds');
      setMolds(response.data);
    } catch (error) {
      enqueueSnackbar('❌ Erro ao carregar moldes', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadMolds();
  }, []);

  const handleOpenDialog = (mold?: Mold) => {
    if (mold) {
      setEditingId(mold.id);
      setFormData({
        code: mold.code,
        name: mold.name,
        description: mold.description || '',
        cavities: mold.cavities,
        activeCavities: mold.activeCavities || null,
        cycleTime: mold.cycleTime || null,
        maintenanceDate: mold.maintenanceDate ? moment(mold.maintenanceDate).format('YYYY-MM-DD') : '',
        active: mold.active});
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name) {
        enqueueSnackbar('⚠️ Código e nome são obrigatórios', { variant: 'warning' });
        return;
      }

      if (formData.cavities < 1) {
        enqueueSnackbar('⚠️ Número de cavidades deve ser maior que zero', { variant: 'warning' });
        return;
      }

      if (formData.activeCavities && formData.activeCavities > formData.cavities) {
        enqueueSnackbar('⚠️ Cavidades ativas não pode ser maior que o total', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        ...formData,
        description: formData.description || null,
        activeCavities: formData.activeCavities || null,
        cycleTime: formData.cycleTime || null,
        maintenanceDate: formData.maintenanceDate || null};

      if (editingId) {
        await api.put(`/molds/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Molde atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/molds', dataToSend);
        enqueueSnackbar('✅ Molde criado com sucesso', { variant: 'success' });
      }

      loadMolds();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar molde';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este molde?')) return;

    try {
      await api.delete(`/molds/${id}`);
      enqueueSnackbar('✅ Molde excluído com sucesso', { variant: 'success' });
      loadMolds();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir molde';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar moldes
  const filteredMolds = useMemo(() => {
    return molds.filter((mold) => {
      const matchesSearch =
        mold.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mold.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && mold.active) ||
        (filterStatus === 'INACTIVE' && !mold.active);

      return matchesSearch && matchesStatus;
    });
  }, [molds, searchTerm, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = molds.length;
    const active = molds.filter((m) => m.active).length;
    const inactive = total - active;
    const totalCavities = molds.reduce((sum, m) => sum + m.cavities, 0);
    const withMaintenance = molds.filter((m) => m.maintenanceDate).length;

    return { total, active, inactive, totalCavities, withMaintenance };
  }, [molds]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<MoldIcon />}
        title="Moldes"
        subtitle="Gerenciamento de moldes de injeção"
        iconGradient="linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Moldes"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<MoldIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativos"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<MoldIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Cavidades"
            value={stats.totalCavities}
            subtitle="Soma de todas as cavidades"
            icon={<CategoryIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Com Manutenção"
            value={stats.withMaintenance}
            subtitle="Moldes com data agendada"
            icon={<MaintenanceIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Buscar por nome ou código..."
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

          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 130 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <option value="ALL">Todos Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Novo Molde
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Moldes */}
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
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Cavidades</TableCell>
              <TableCell align="center">Tempo Ciclo</TableCell>
              <TableCell>Manutenção</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMolds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL'
                      ? 'Nenhum molde encontrado com os filtros aplicados'
                      : 'Nenhum molde cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMolds.map((mold) => (
                <TableRow
                  key={mold.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {mold.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {mold.name}
                    </Typography>
                    {mold.description && (
                      <Typography variant="caption" color="text.secondary">
                        {mold.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      <Chip
                        label={`${mold.activeCavities || mold.cavities}/${mold.cavities}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {mold.cycleTime ? (
                      <Chip
                        icon={<CycleIcon sx={{ fontSize: 14 }} />}
                        label={`${mold.cycleTime}s`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {mold.maintenanceDate ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MaintenanceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {moment(mold.maintenanceDate).format('DD/MM/YYYY')}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={mold.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={mold.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(mold)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(mold.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MoldIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Molde' : 'Novo Molde'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Código"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: MOL001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome do Molde"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Tampa 500ml"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do molde"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Total de Cavidades"
                type="number"
                fullWidth
                required
                value={formData.cavities}
                onChange={(e) => setFormData({ ...formData, cavities: parseInt(e.target.value) || 1 })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cavidades Ativas"
                type="number"
                fullWidth
                value={formData.activeCavities || ''}
                onChange={(e) => setFormData({ ...formData, activeCavities: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Deixe vazio = todas"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tempo de Ciclo (s)"
                type="number"
                fullWidth
                value={formData.cycleTime || ''}
                onChange={(e) => setFormData({ ...formData, cycleTime: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Ex: 45"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CycleIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Manutenção"
                type="date"
                fullWidth
                value={formData.maintenanceDate}
                onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MaintenanceIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'}}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.active ? 'Ativo' : 'Inativo'}
                  </Typography>
                </Box>
                <Chip
                  label={formData.active ? 'Ativo' : 'Inativo'}
                  color={formData.active ? 'success' : 'default'}
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} startIcon={<AddIcon />}>
            {editingId ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Molds;
