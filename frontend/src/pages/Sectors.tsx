/**
 * Página de gerenciamento de setores - Design Profissional
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
  MenuItem,
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
  AccountTree as SectorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  Factory as FactoryIcon,
  Email as EmailIcon,
  Notifications as NotificationIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';

interface Company {
  id: number;
  code: string;
  name: string;
}

interface Sector {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description?: string;
  email?: string;
  sendEmailOnAlert: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  _count?: {
    plcConfigs: number;
    productionOrders: number;
  };
}

interface SectorFormData {
  companyId: string;
  code: string;
  name: string;
  description: string;
  email: string;
  sendEmailOnAlert: boolean;
  active: boolean;
}

const initialFormData: SectorFormData = {
  companyId: '',
  code: '',
  name: '',
  description: '',
  email: '',
  sendEmailOnAlert: false,
  active: true};

export default function Sectors() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SectorFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');

  useEffect(() => {
    loadSectors();
    loadCompanies();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar setores', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar empresas', { variant: 'error' });
    }
  };

  const handleOpenDialog = (sector?: Sector) => {
    if (sector) {
      setEditingId(sector.id);
      setFormData({
        companyId: sector.companyId.toString(),
        code: sector.code,
        name: sector.name,
        description: sector.description || '',
        email: sector.email || '',
        sendEmailOnAlert: sector.sendEmailOnAlert || false,
        active: sector.active});
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
      if (!formData.companyId || !formData.code || !formData.name) {
        enqueueSnackbar('⚠️ Preencha todos os campos obrigatórios', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        companyId: parseInt(formData.companyId),
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        email: formData.email || null,
        sendEmailOnAlert: formData.sendEmailOnAlert,
        active: formData.active};

      if (editingId) {
        await api.put(`/sectors/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Setor atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/sectors', dataToSend);
        enqueueSnackbar('✅ Setor criado com sucesso', { variant: 'success' });
      }

      loadSectors();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar setor';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este setor?')) return;

    try {
      await api.delete(`/sectors/${id}`);
      enqueueSnackbar('✅ Setor excluído com sucesso', { variant: 'success' });
      loadSectors();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir setor';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar setores
  const filteredSectors = useMemo(() => {
    return sectors.filter((sector) => {
      const matchesSearch =
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sector.company?.name && sector.company.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && sector.active) ||
        (filterStatus === 'INACTIVE' && !sector.active);

      const matchesCompany =
        filterCompany === 'ALL' ||
        sector.companyId.toString() === filterCompany;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [sectors, searchTerm, filterStatus, filterCompany]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = sectors.length;
    const active = sectors.filter((s) => s.active).length;
    const inactive = total - active;
    const totalPlcs = sectors.reduce((sum, s) => sum + (s._count?.plcConfigs || 0), 0);

    return { total, active, inactive, totalPlcs };
  }, [sectors]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<SectorIcon />}
        title="Setores"
        subtitle="Gerenciamento de setores por empresa"
        iconGradient="linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Setores"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<SectorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativos"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<SectorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Inativos"
            value={stats.inactive}
            subtitle={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% do total`}
            icon={<SectorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Configurações CLP"
            value={stats.totalPlcs}
            subtitle="Total de CLPs configurados"
            icon={<FactoryIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Buscar por nome, código ou empresa..."
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
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            sx={{ minWidth: 180 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <option value="ALL">Todas Empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </TextField>

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
            Novo Setor
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Setores */}
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
              <TableCell>Empresa</TableCell>
              <TableCell align="center">CLPs</TableCell>
              <TableCell align="center">Ordens</TableCell>
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
            ) : filteredSectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL' || filterCompany !== 'ALL'
                      ? 'Nenhum setor encontrado com os filtros aplicados'
                      : 'Nenhum setor cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSectors.map((sector) => (
                <TableRow
                  key={sector.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {sector.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {sector.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {sector.company?.name || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={sector._count?.plcConfigs || 0}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={sector._count?.productionOrders || 0}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={sector.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={sector.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(sector)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(sector.id)}
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
            <SectorIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Setor' : 'Novo Setor'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Empresa"
                fullWidth
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                SelectProps={{ native: false }}
              >
                <MenuItem value="">
                  <em>Selecione uma empresa</em>
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Código"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: SET001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome do Setor"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Linha de Injeção 1"
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
                placeholder="Descrição detalhada do setor"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="E-mail do Setor"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: manutencao@empresa.com"
                helperText="E-mail para receber notificações de paradas com defeitos vinculados"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: formData.sendEmailOnAlert 
                    ? alpha(theme.palette.success.main, 0.05) 
                    : alpha(theme.palette.grey[500], 0.05),
                  border: `2px solid ${formData.sendEmailOnAlert 
                    ? alpha(theme.palette.success.main, 0.3) 
                    : alpha(theme.palette.grey[500], 0.2)}`,
                  transition: 'all 0.3s'}}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <NotificationIcon 
                      color={formData.sendEmailOnAlert ? 'success' : 'action'} 
                      sx={{ fontSize: 24 }}
                    />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Notificações por E-mail
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formData.sendEmailOnAlert 
                      ? '✅ Este setor receberá e-mails automáticos quando houver paradas com defeitos vinculados a ele'
                      : '⚠️ Este setor NÃO receberá notificações por e-mail de paradas'
                    }
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {formData.sendEmailOnAlert ? 'Notificações Ativadas' : 'Notificações Desativadas'}
                    </Typography>
                    <Chip
                      label={formData.sendEmailOnAlert ? 'ON' : 'OFF'}
                      color={formData.sendEmailOnAlert ? 'success' : 'default'}
                      onClick={() => setFormData({ ...formData, sendEmailOnAlert: !formData.sendEmailOnAlert })}
                      icon={<NotificationIcon />}
                      sx={{ 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        minWidth: 80,
                        '&:hover': {
                          transform: 'scale(1.05)'},
                        transition: 'transform 0.2s'}}
                    />
                  </Stack>
                  {formData.sendEmailOnAlert && !formData.email && (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`}}
                    >
                      <Typography variant="caption" color="warning.main" fontWeight={600}>
                        ⚠️ Configure um e-mail para receber as notificações
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
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
                      Status do Setor
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.active ? 'Setor ativo no sistema' : 'Setor inativo'}
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
