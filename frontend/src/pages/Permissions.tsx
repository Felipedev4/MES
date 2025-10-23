/**
 * Página de configuração de permissões por perfil
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Chip,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  alpha} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Warning as WarningIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';

interface Permission {
  id: number;
  role: string;
  resource: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  DIRECTOR: 'Diretoria',
  MANAGER: 'Gerente',
  SUPERVISOR: 'Supervisor',
  LEADER: 'Líder',
  OPERATOR: 'Operador'};

const resourceLabels: Record<string, string> = {
  activity_types: 'Tipos de Atividade',
  companies: 'Empresas',
  dashboard: 'Dashboard',
  defects: 'Defeitos',
  downtimes: 'Paradas',
  email_config: 'Configuração de E-mail',
  email_logs: 'Central de E-mails',
  injectors: 'Injetoras',
  items: 'Itens/Produtos',
  maintenance_alerts: 'Alertas de Manutenção',
  manual_posting: 'Apontamento Manual',
  molds: 'Moldes',
  permissions: 'Permissões',
  plc_config: 'Configuração CLP',
  production_orders: 'Ordens de Produção',
  reference_types: 'Tipos de Referência',
  reports: 'Relatórios',
  sectors: 'Setores',
  user_companies: 'Colaboradores e Empresas',
  users: 'Colaboradores'};

export default function Permissions() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [selectedRole, setSelectedRole] = useState<string>('OPERATOR');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPermissions(selectedRole);
  }, [selectedRole]);

  const loadPermissions = async (role: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/permissions/role/${role}`);
      setPermissions(response.data);
      setHasChanges(false);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar permissões', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (_event: React.SyntheticEvent, newValue: string) => {
    if (hasChanges) {
      if (!window.confirm('Você tem alterações não salvas. Deseja continuar?')) {
        return;
      }
    }
    setSelectedRole(newValue);
  };

  const handlePermissionChange = (resource: string, permission: string, value: boolean) => {
    setPermissions((prev) => {
      const existingIndex = prev.findIndex((p) => p.resource === resource);
      
      if (existingIndex >= 0) {
        // Atualizar permissão existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [permission]: value};
        return updated;
      } else {
        // Criar nova permissão
        return [
          ...prev,
          {
            id: 0,
            role: selectedRole,
            resource,
            canView: permission === 'canView' ? value : false,
            canCreate: permission === 'canCreate' ? value : false,
            canEdit: permission === 'canEdit' ? value : false,
            canDelete: permission === 'canDelete' ? value : false},
        ];
      }
    });
    setHasChanges(true);
  };

  const getPermission = (resource: string, permission: string): boolean => {
    const perm = permissions.find((p) => p.resource === resource);
    return perm ? (perm as any)[permission] : false;
  };

  const handleSave = async () => {
    try {
      await api.post('/permissions/bulk', {
        role: selectedRole,
        permissions: permissions.map((p) => ({
          resource: p.resource,
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canDelete: p.canDelete}))});
      enqueueSnackbar('Permissões salvas com sucesso', { variant: 'success' });
      setHasChanges(false);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar permissões';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleInitializeDefaults = async () => {
    if (!window.confirm('Isso irá sobrescrever todas as permissões com os valores padrão. Confirma?')) {
      return;
    }

    try {
      await api.post('/permissions/initialize');
      enqueueSnackbar('Permissões padrão inicializadas com sucesso', { variant: 'success' });
      loadPermissions(selectedRole);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao inicializar permissões';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // Ordenar recursos por ordem alfabética (A-Z) baseado no label
  const allResources = Object.keys(resourceLabels).sort((a, b) => {
    const labelA = resourceLabels[a].toLowerCase();
    const labelB = resourceLabels[b].toLowerCase();
    return labelA.localeCompare(labelB);
  });

  // Filtrar recursos por busca
  const filteredResources = useMemo(() => {
    if (!searchText) return allResources;
    
    const search = searchText.toLowerCase();
    return allResources.filter((resource) =>
      resourceLabels[resource].toLowerCase().includes(search) ||
      resource.toLowerCase().includes(search)
    );
  }, [allResources, searchText]);

  // Estatísticas das permissões
  const stats = useMemo(() => {
    let fullAccess = 0;
    let partialAccess = 0;
    let noAccess = 0;

    allResources.forEach((resource) => {
      const perm = permissions.find((p) => p.resource === resource);
      if (!perm) {
        noAccess++;
      } else {
        const totalPerms = [perm.canView, perm.canCreate, perm.canEdit, perm.canDelete].filter(Boolean).length;
        if (totalPerms === 4) {
          fullAccess++;
        } else if (totalPerms > 0) {
          partialAccess++;
        } else {
          noAccess++;
        }
      }
    });

    return {
      total: allResources.length,
      fullAccess,
      partialAccess,
      noAccess};
  }, [allResources, permissions]);

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<SecurityIcon />}
        title="Permissões"
        subtitle="Configuração de acessos por perfil"
        iconGradient="linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Recursos"
            value={stats.total}
            subtitle={`Para perfil ${roleLabels[selectedRole]}`}
            icon={<FolderIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Acesso Completo"
            value={stats.fullAccess}
            subtitle="Todas as permissões"
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Acesso Parcial"
            value={stats.partialAccess}
            subtitle="Algumas permissões"
            icon={<WarningIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Sem Acesso"
            value={stats.noAccess}
            subtitle="Nenhuma permissão"
            icon={<RemoveCircleIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Ações e Alertas */}
      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Alterações Não Salvas
          </Typography>
          <Typography variant="caption">
            Você tem alterações não salvas. Não esqueça de salvar antes de trocar de perfil!
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            placeholder="Buscar recurso..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )}}
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges}
            sx={{ minWidth: 180 }}
          >
            Salvar Alterações
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleInitializeDefaults}
            sx={{ minWidth: 180 }}
          >
            Restaurar Padrão
          </Button>
        </Stack>
      </Paper>

      {/* Tabs de Roles */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedRole}
          onChange={handleChangeRole}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64}}}
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <Tab
              key={value}
              label={label}
              value={value}
              icon={
                <Chip
                  label={value}
                  size="small"
                  color={value === selectedRole ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tabela de Permissões */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: { xs: 'calc(100vh - 600px)', md: 'calc(100vh - 620px)' },
          overflow: 'auto',
          borderRadius: 2,
          position: 'relative'}}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 700, 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
                minWidth: 200, 
                position: 'sticky',
                top: 0,
                zIndex: 100}}>
                Recurso
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 0,
                zIndex: 100}}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                  <span>Visualizar</span>
                </Stack>
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 0,
                zIndex: 100}}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <AddIcon sx={{ fontSize: 18 }} />
                  <span>Criar</span>
                </Stack>
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 0,
                zIndex: 100}}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <EditIcon sx={{ fontSize: 18 }} />
                  <span>Editar</span>
                </Stack>
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `2px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 0,
                zIndex: 100}}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                  <span>Excluir</span>
                </Stack>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando permissões...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <FolderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum recurso encontrado com o filtro "{searchText}"
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map((resource) => {
                const hasAnyPermission = 
                  getPermission(resource, 'canView') ||
                  getPermission(resource, 'canCreate') ||
                  getPermission(resource, 'canEdit') ||
                  getPermission(resource, 'canDelete');
                
                return (
                  <TableRow 
                    key={resource} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {hasAnyPermission ? (
                          <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                        ) : (
                          <RemoveCircleIcon sx={{ fontSize: 20, color: theme.palette.error.main }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {resourceLabels[resource]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {resource}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={getPermission(resource, 'canView')}
                        onChange={(e) => handlePermissionChange(resource, 'canView', e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={getPermission(resource, 'canCreate')}
                        onChange={(e) => handlePermissionChange(resource, 'canCreate', e.target.checked)}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={getPermission(resource, 'canEdit')}
                        onChange={(e) => handlePermissionChange(resource, 'canEdit', e.target.checked)}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={getPermission(resource, 'canDelete')}
                        onChange={(e) => handlePermissionChange(resource, 'canDelete', e.target.checked)}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
        <Typography variant="subtitle2" fontWeight={700} color="info.main" gutterBottom>
          ℹ️ Sobre as Permissões
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Visualizar
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Acesso de leitura
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AddIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Criar
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Novos registros
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EditIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Editar
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Modificar existentes
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DeleteIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Excluir
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Deletar registros
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

