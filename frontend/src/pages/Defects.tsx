/**
 * Página de gerenciamento de defeitos - Design Profissional
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
  Tooltip,
  MenuItem,
  Autocomplete} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as DefectIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as LowIcon,
  AccountTree as SectorIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

interface Sector {
  id: number;
  code: string;
  name: string;
}

interface Defect {
  id: number;
  code: string;
  name: string;
  severity: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  responsibleSectors?: Sector[];
  _count?: {
    productionDefects: number;
  };
}

interface DefectFormData {
  code: string;
  name: string;
  severity: string;
  active: boolean;
  sectors: Sector[];
}

const initialFormData: DefectFormData = {
  code: '',
  name: '',
  severity: 'MEDIUM',
  active: true,
  sectors: []};

const severityOptions = [
  { value: 'CRITICAL', label: 'Crítico', color: 'error' as const, icon: <ErrorIcon /> },
  { value: 'HIGH', label: 'Alto', color: 'warning' as const, icon: <WarningIcon /> },
  { value: 'MEDIUM', label: 'Médio', color: 'info' as const, icon: <InfoIcon /> },
  { value: 'LOW', label: 'Baixo', color: 'success' as const, icon: <LowIcon /> },
];

export default function Defects() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DefectFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    loadDefects();
    loadSectors();
  }, []);

  const loadDefects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/defects');
      setDefects(response.data);
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar defeitos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSectors = async () => {
    try {
      const response = await api.get('/sectors');
      setSectors(response.data.filter((s: any) => s.active));
    } catch (error: any) {
      enqueueSnackbar('❌ Erro ao carregar setores', { variant: 'error' });
    }
  };

  const handleOpenDialog = (defect?: Defect) => {
    if (defect) {
      setEditingId(defect.id);
      setFormData({
        code: defect.code,
        name: defect.name,
        severity: defect.severity,
        active: defect.active,
        sectors: defect.responsibleSectors || []});
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
        code: formData.code,
        name: formData.name,
        severity: formData.severity,
        active: formData.active,
        sectorIds: formData.sectors.map(s => s.id)};

      if (editingId) {
        await api.put(`/defects/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Defeito atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/defects', dataToSend);
        enqueueSnackbar('✅ Defeito criado com sucesso', { variant: 'success' });
      }

      loadDefects();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar defeito';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este defeito?')) return;

    try {
      await api.delete(`/defects/${id}`);
      enqueueSnackbar('✅ Defeito excluído com sucesso', { variant: 'success' });
      loadDefects();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir defeito';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const getSeverityConfig = (severity: string) => {
    return severityOptions.find(opt => opt.value === severity) || severityOptions[2];
  };

  // Filtrar defeitos
  const filteredDefects = useMemo(() => {
    return defects.filter((defect) => {
      const matchesSearch =
        defect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && defect.active) ||
        (filterStatus === 'INACTIVE' && !defect.active);

      const matchesSeverity =
        filterSeverity === 'ALL' ||
        defect.severity === filterSeverity;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [defects, searchTerm, filterStatus, filterSeverity]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = defects.length;
    const active = defects.filter((d) => d.active).length;
    const inactive = total - active;
    const critical = defects.filter((d) => d.severity === 'CRITICAL').length;
    const high = defects.filter((d) => d.severity === 'HIGH').length;
    const totalOccurrences = defects.reduce((sum, d) => sum + (d._count?.productionDefects || 0), 0);

    return { total, active, inactive, critical, high, totalOccurrences };
  }, [defects]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<DefectIcon />}
        title="Defeitos"
        subtitle="Gerenciamento de tipos de defeitos de produção"
        iconGradient="linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Defeitos"
            value={stats.total}
            subtitle="Tipos cadastrados"
            icon={<DefectIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativos"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<DefectIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Críticos/Altos"
            value={`${stats.critical}/${stats.high}`}
            subtitle="Requerem atenção"
            icon={<ErrorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ocorrências"
            value={stats.totalOccurrences}
            subtitle="Total registrado"
            icon={<WarningIcon sx={{ fontSize: 32 }} />}
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
              )}}
          />

          <TextField
            select
            size="small"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            sx={{ minWidth: 150 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WarningIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <option value="ALL">Todas Severidades</option>
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
            Novo Defeito
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Defeitos */}
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
              <TableCell align="center">Severidade</TableCell>
              <TableCell>Setores Responsáveis</TableCell>
              <TableCell align="center">Ocorrências</TableCell>
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
            ) : filteredDefects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL' || filterSeverity !== 'ALL'
                      ? 'Nenhum defeito encontrado com os filtros aplicados'
                      : 'Nenhum defeito cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDefects.map((defect) => {
                const severityConfig = getSeverityConfig(defect.severity);
                return (
                  <TableRow
                    key={defect.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {defect.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {defect.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={severityConfig.icon}
                        label={severityConfig.label}
                        size="small"
                        color={severityConfig.color}
                        sx={{
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            fontSize: 16}}}
                      />
                    </TableCell>
                    <TableCell>
                      {defect.responsibleSectors && defect.responsibleSectors.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                          {defect.responsibleSectors.slice(0, 2).map((sector) => (
                            <Tooltip key={sector.id} title={sector.name}>
                              <Chip
                                label={sector.code}
                                size="small"
                                variant="outlined"
                                color="primary"
                                icon={<SectorIcon sx={{ fontSize: 14 }} />}
                                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            </Tooltip>
                          ))}
                          {defect.responsibleSectors.length > 2 && (
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="caption" fontWeight={600}>
                                    Outros setores:
                                  </Typography>
                                  {defect.responsibleSectors.slice(2).map(s => (
                                    <Typography key={s.id} variant="caption" display="block">
                                      • {s.code} - {s.name}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                            >
                              <Chip
                                label={`+${defect.responsibleSectors.length - 2}`}
                                size="small"
                                variant="outlined"
                                color="info"
                                sx={{ fontSize: '0.7rem', cursor: 'help' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      ) : (
                        <Tooltip 
                          title="⚠️ Vincule setores para identificar responsáveis por resolver este defeito"
                          arrow
                        >
                          <Chip
                            label="Sem setores"
                            size="small"
                            icon={<WarningIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              backgroundColor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              cursor: 'help',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.warning.main, 0.2)}}}
                            onClick={() => handleOpenDialog(defect)}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={defect._count?.productionDefects || 0}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={defect.active ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={defect.active ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(defect)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(defect.id)}
                        >
                          <DeleteIcon fontSize="small" />
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DefectIcon color="error" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Defeito' : 'Novo Defeito'}
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
                placeholder="Ex: DEF001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome do Defeito"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Bolha de Ar, Mancha, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Severidade"
                fullWidth
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                SelectProps={{ native: false }}
              >
                {severityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {option.icon}
                      <span>{option.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`}}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SectorIcon color="info" />
                    <Typography variant="subtitle2" fontWeight={600} color="info.main">
                      Setores Responsáveis pela Resolução
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    💡 Selecione os setores que podem identificar e resolver este tipo de defeito.
                    Isso permite notificações automáticas e rastreabilidade de responsabilidades.
                  </Typography>
                  <Autocomplete
                    multiple
                    options={sectors}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={formData.sectors}
                    onChange={(_, newValue) => setFormData({ ...formData, sectors: newValue })}
                    noOptionsText="Nenhum setor encontrado"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={formData.sectors.length === 0 ? "Clique para selecionar os setores..." : "Adicionar mais setores..."}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={option.code}
                            size="small"
                            color="primary"
                            sx={{ minWidth: 60, fontWeight: 600 }}
                          />
                          <Typography variant="body2">{option.name}</Typography>
                        </Stack>
                      </Box>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={`${option.code} - ${option.name}`}
                          size="small"
                          color="primary"
                          icon={<SectorIcon sx={{ fontSize: 14 }} />}
                          sx={{ fontWeight: 600 }}
                        />
                      ))
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper'}}}
                  />
                  {formData.sectors.length === 0 && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`}}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WarningIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        <Typography variant="caption" color="warning.main" fontWeight={600}>
                          Atenção: Defeitos sem setores responsáveis não permitirão notificações automáticas
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  {formData.sectors.length > 0 && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`}}
                    >
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        ✓ {formData.sectors.length} setor(es) selecionado(s) - Responsabilidade definida!
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
                      Status do Defeito
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.active ? 'Defeito ativo no sistema' : 'Defeito inativo'}
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
