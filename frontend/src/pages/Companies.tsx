/**
 * Página de gerenciamento de empresas - Design Profissional
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
  Business as BusinessIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';

interface Company {
  id: number;
  code: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sectors: number;
    productionOrders: number;
  };
}

interface CompanyFormData {
  code: string;
  name: string;
  tradeName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
}

const initialFormData: CompanyFormData = {
  code: '',
  name: '',
  tradeName: '',
  cnpj: '',
  address: '',
  phone: '',
  email: '',
  active: true};

export default function Companies() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Carregar empresas
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar empresas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        code: company.code,
        name: company.name,
        tradeName: company.tradeName || '',
        cnpj: company.cnpj || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        active: company.active});
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
      // Validações básicas
      if (!formData.code || !formData.name) {
        enqueueSnackbar('⚠️ Código e nome são obrigatórios', { variant: 'warning' });
        return;
      }

      // Limpar campos vazios
      const dataToSend = {
        ...formData,
        tradeName: formData.tradeName || null,
        cnpj: formData.cnpj || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null};

      if (editingId) {
        await api.put(`/companies/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Empresa atualizada com sucesso', { variant: 'success' });
      } else {
        await api.post('/companies', dataToSend);
        enqueueSnackbar('✅ Empresa criada com sucesso', { variant: 'success' });
      }

      loadCompanies();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar empresa';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir esta empresa?')) return;

    try {
      await api.delete(`/companies/${id}`);
      enqueueSnackbar('✅ Empresa excluída com sucesso', { variant: 'success' });
      loadCompanies();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir empresa';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar empresas
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.cnpj && company.cnpj.includes(searchTerm));

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && company.active) ||
        (filterStatus === 'INACTIVE' && !company.active);

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.active).length;
    const inactive = total - active;
    const totalSectors = companies.reduce((sum, c) => sum + (c._count?.sectors || 0), 0);

    return { total, active, inactive, totalSectors };
  }, [companies]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<BusinessIcon />}
        title="Empresas"
        subtitle="Gerenciamento de empresas do sistema"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1565c0 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Empresas"
            value={stats.total}
            subtitle="Cadastradas no sistema"
            icon={<BusinessIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativas"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<BusinessIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Inativas"
            value={stats.inactive}
            subtitle={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% do total`}
            icon={<BusinessIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Setores"
            value={stats.totalSectors}
            subtitle="Em todas as empresas"
            icon={<LocationIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Buscar por nome, código ou CNPJ..."
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
            sx={{ minWidth: 150 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <option value="ALL">Todos Status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nova Empresa
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Empresas */}
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
              <TableCell>Nome / Razão Social</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell align="center">Setores</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL'
                      ? 'Nenhuma empresa encontrada com os filtros aplicados'
                      : 'Nenhuma empresa cadastrada'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {company.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {company.name}
                    </Typography>
                    {company.tradeName && (
                      <Typography variant="caption" color="text.secondary">
                        {company.tradeName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.cnpj || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {company.phone && (
                      <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{company.phone}</Typography>
                      </Stack>
                    )}
                    {company.email && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{company.email}</Typography>
                      </Stack>
                    )}
                    {!company.phone && !company.email && '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={company._count?.sectors || 0}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={company.active ? 'Ativa' : 'Inativa'}
                      size="small"
                      color={company.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(company)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(company.id)}
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
            <BusinessIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Empresa' : 'Nova Empresa'}
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
                placeholder="Ex: EMP001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome/Razão Social"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo da empresa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Fantasia"
                fullWidth
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                placeholder="Nome comercial"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNPJ"
                fullWidth
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endereço"
                fullWidth
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="empresa@exemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )}}
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
                      Status da Empresa
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.active ? 'Empresa ativa no sistema' : 'Empresa inativa'}
                    </Typography>
                  </Box>
                  <Chip
                    label={formData.active ? 'Ativa' : 'Inativa'}
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
