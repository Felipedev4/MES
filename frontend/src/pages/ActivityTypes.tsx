/**
 * Página de gerenciamento de tipos de atividade - Design Profissional
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Grid,
  Stack,
  InputAdornment,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as ActivityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ProductiveIcon,
  Cancel as UnproductiveIcon,
  Palette as ColorIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

interface ActivityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE';
  color: string | null;
  sectorEmail: string | null;
  emailNotificationsEnabled: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    downtimes: number;
  };
}

interface ActivityTypeFormData {
  code: string;
  name: string;
  description: string;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE';
  color: string;
  sectorEmail: string;
  emailNotificationsEnabled: boolean;
  active: boolean;
}

const initialFormData: ActivityTypeFormData = {
  code: '',
  name: '',
  description: '',
  type: 'UNPRODUCTIVE',
  color: '#f44336',
  sectorEmail: '',
  emailNotificationsEnabled: false,
  active: true,
};

export default function ActivityTypes() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ActivityTypeFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadActivityTypes();
  }, []);

  const loadActivityTypes = async () => {
    try {
      const response = await api.get('/activity-types');
      setActivityTypes(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar tipos de atividade', { variant: 'error' });
    }
  };

  const handleOpenDialog = (activityType?: ActivityType) => {
    if (activityType) {
      setEditingId(activityType.id);
      setFormData({
        code: activityType.code,
        name: activityType.name,
        description: activityType.description || '',
        type: activityType.type,
        color: activityType.color || '#f44336',
        sectorEmail: activityType.sectorEmail || '',
        emailNotificationsEnabled: activityType.emailNotificationsEnabled,
        active: activityType.active,
      });
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

      const dataToSend = {
        ...formData,
        description: formData.description || null,
      };

      if (editingId) {
        await api.put(`/activity-types/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Tipo de atividade atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/activity-types', dataToSend);
        enqueueSnackbar('✅ Tipo de atividade criado com sucesso', { variant: 'success' });
      }

      loadActivityTypes();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar tipo de atividade';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este tipo de atividade?')) return;

    try {
      await api.delete(`/activity-types/${id}`);
      enqueueSnackbar('✅ Tipo de atividade excluído com sucesso', { variant: 'success' });
      loadActivityTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir tipo de atividade';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar tipos de atividade
  const filteredActivityTypes = useMemo(() => {
    return activityTypes.filter((activityType) => {
      const matchesSearch =
        activityType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activityType.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'ALL' ||
        activityType.type === filterType;

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && activityType.active) ||
        (filterStatus === 'INACTIVE' && !activityType.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activityTypes, searchTerm, filterType, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = activityTypes.length;
    const active = activityTypes.filter((a) => a.active).length;
    const productive = activityTypes.filter((a) => a.type === 'PRODUCTIVE').length;
    const unproductive = activityTypes.filter((a) => a.type === 'UNPRODUCTIVE').length;
    const totalUsage = activityTypes.reduce((sum, a) => sum + (a._count?.downtimes || 0), 0);

    return { total, active, productive, unproductive, totalUsage };
  }, [activityTypes]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<ActivityIcon />}
        title="Tipos de Atividade"
        subtitle="Gerenciamento de tipos de atividade de paradas"
        iconGradient="linear-gradient(135deg, #3f51b5 0%, #283593 100%)"
      />

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total de Tipos"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<ActivityIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Produtivas"
            value={stats.productive}
            subtitle={`${stats.total > 0 ? Math.round((stats.productive / stats.total) * 100) : 0}% do total`}
            icon={<ProductiveIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Improdutivas"
            value={stats.unproductive}
            subtitle={`${stats.total > 0 ? Math.round((stats.unproductive / stats.total) * 100) : 0}% do total`}
            icon={<UnproductiveIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Usos Totais"
            value={stats.totalUsage}
            subtitle="Paradas registradas"
            icon={<ActivityIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
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
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 150 }}
            SelectProps={{ native: true }}
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="PRODUCTIVE">Produtivas</option>
            <option value="UNPRODUCTIVE">Improdutivas</option>
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
              ),
            }}
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

      {/* Tabela de Tipos de Atividade */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: { xs: 'calc(100vh - 550px)', md: 'calc(100vh - 500px)' },
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
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="center">Cor</TableCell>
              <TableCell align="center">Usos</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivityTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
                      ? 'Nenhum tipo de atividade encontrado com os filtros aplicados'
                      : 'Nenhum tipo de atividade cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredActivityTypes.map((activityType) => (
                <TableRow
                  key={activityType.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {activityType.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {activityType.name}
                    </Typography>
                    {activityType.description && (
                      <Typography variant="caption" color="text.secondary">
                        {activityType.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={activityType.type === 'PRODUCTIVE' ? <ProductiveIcon /> : <UnproductiveIcon />}
                      label={activityType.type === 'PRODUCTIVE' ? 'Produtiva' : 'Improdutiva'}
                      size="small"
                      color={activityType.type === 'PRODUCTIVE' ? 'success' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        backgroundColor: activityType.color || '#ccc',
                        margin: 'auto',
                        border: `2px solid ${alpha(activityType.color || '#ccc', 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={activityType._count?.downtimes || 0}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={activityType.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={activityType.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(activityType)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(activityType.id)}
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
            <ActivityIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Tipo de Atividade' : 'Novo Tipo de Atividade'}
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
                placeholder="Ex: ATI001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Setup, Troca de Molde, etc."
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
                placeholder="Descrição detalhada do tipo de atividade"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Tipo"
                fullWidth
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PRODUCTIVE' | 'UNPRODUCTIVE' })}
                SelectProps={{ native: false }}
              >
                <MenuItem value="PRODUCTIVE">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ProductiveIcon color="success" />
                    <span>Produtiva</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="UNPRODUCTIVE">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <UnproductiveIcon color="error" />
                    <span>Improdutiva</span>
                  </Stack>
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cor"
                type="color"
                fullWidth
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ColorIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campos de E-mail e Notificações */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon color="info" fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      E-mail do Setor
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Ex: manutencao@empresa.com"
                    value={formData.sectorEmail}
                    onChange={(e) => setFormData({ ...formData, sectorEmail: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    E-mail para receber notificações de paradas com defeitos vinculados
                  </Typography>

                  {/* Notificações por E-mail */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: formData.emailNotificationsEnabled
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.grey[500], 0.1),
                      border: `1px solid ${
                        formData.emailNotificationsEnabled
                          ? alpha(theme.palette.success.main, 0.3)
                          : alpha(theme.palette.grey[500], 0.3)
                      }`,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {formData.emailNotificationsEnabled ? (
                          <NotificationsIcon fontSize="small" />
                        ) : (
                          <NotificationsOffIcon fontSize="small" />
                        )}
                        <Typography variant="body2" fontWeight={600}>
                          Notificações por E-mail
                        </Typography>
                      </Stack>

                      {!formData.emailNotificationsEnabled && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <WarningIcon fontSize="small" color="warning" />
                          <Typography variant="caption" color="warning.main">
                            Este setor NÃO receberá notificações por e-mail de paradas
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {formData.emailNotificationsEnabled ? 'Notificações Ativadas' : 'Notificações Desativadas'}
                        </Typography>
                        <Chip
                          icon={formData.emailNotificationsEnabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
                          label={formData.emailNotificationsEnabled ? 'ON' : 'OFF'}
                          color={formData.emailNotificationsEnabled ? 'success' : 'default'}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              emailNotificationsEnabled: !formData.emailNotificationsEnabled,
                            })
                          }
                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
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
