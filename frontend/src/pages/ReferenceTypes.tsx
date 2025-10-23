/**
 * Página de gerenciamento de tipos de referência - Design Profissional
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ListAlt as ListIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

interface ReferenceType {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

interface ReferenceTypeFormData {
  code: string;
  name: string;
  active: boolean;
}

const initialFormData: ReferenceTypeFormData = {
  code: '',
  name: '',
  active: true};

export default function ReferenceTypes() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [referenceTypes, setReferenceTypes] = useState<ReferenceType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ReferenceTypeFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadReferenceTypes();
  }, []);

  const loadReferenceTypes = async () => {
    try {
      const response = await api.get('/reference-types');
      setReferenceTypes(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar tipos de referência', { variant: 'error' });
    }
  };

  const handleOpenDialog = (referenceType?: ReferenceType) => {
    if (referenceType) {
      setEditingId(referenceType.id);
      setFormData({
        code: referenceType.code,
        name: referenceType.name,
        active: referenceType.active});
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

      if (editingId) {
        await api.put(`/reference-types/${editingId}`, formData);
        enqueueSnackbar('✅ Tipo de referência atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/reference-types', formData);
        enqueueSnackbar('✅ Tipo de referência criado com sucesso', { variant: 'success' });
      }

      loadReferenceTypes();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar tipo de referência';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este tipo de referência?')) return;

    try {
      await api.delete(`/reference-types/${id}`);
      enqueueSnackbar('✅ Tipo de referência excluído com sucesso', { variant: 'success' });
      loadReferenceTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir tipo de referência';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar tipos de referência
  const filteredReferenceTypes = useMemo(() => {
    return referenceTypes.filter((referenceType) => {
      const matchesSearch =
        referenceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referenceType.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && referenceType.active) ||
        (filterStatus === 'INACTIVE' && !referenceType.active);

      return matchesSearch && matchesStatus;
    });
  }, [referenceTypes, searchTerm, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = referenceTypes.length;
    const active = referenceTypes.filter((r) => r.active).length;
    const inactive = total - active;
    const totalItems = referenceTypes.reduce((sum, r) => sum + (r._count?.items || 0), 0);
    const withItems = referenceTypes.filter((r) => (r._count?.items || 0) > 0).length;

    return { total, active, inactive, totalItems, withItems };
  }, [referenceTypes]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<LabelIcon />}
        title="Tipos de Referência"
        subtitle="Gerenciamento de tipos de referência de itens"
        iconGradient="linear-gradient(135deg, #673ab7 0%, #512da8 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Tipos"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<LabelIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativos"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<LabelIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Tipos em Uso"
            value={stats.withItems}
            subtitle="Com itens associados"
            icon={<ListIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Itens"
            value={stats.totalItems}
            subtitle="Itens associados"
            icon={<ListIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.secondary.main}
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
            Novo Tipo
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Tipos de Referência */}
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
              <TableCell align="center">Itens Associados</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReferenceTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL'
                      ? 'Nenhum tipo de referência encontrado com os filtros aplicados'
                      : 'Nenhum tipo de referência cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReferenceTypes.map((referenceType) => (
                <TableRow
                  key={referenceType.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {referenceType.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {referenceType.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={referenceType._count?.items || 0}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={referenceType.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={referenceType.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(referenceType)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(referenceType.id)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LabelIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Tipo de Referência' : 'Novo Tipo de Referência'}
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
                placeholder="Ex: REF001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cliente, Produto Final, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`}}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.active ? 'Ativo no sistema' : 'Inativo'}
                    </Typography>
                  </Box>
                  <Chip
                    label={formData.active ? 'Ativo' : 'Inativo'}
                    color={formData.active ? 'success' : 'default'}
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                  />
                </Stack>
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
}
