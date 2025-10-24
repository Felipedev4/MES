/**
 * Página de gerenciamento de colaboradores/usuários
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton as MuiIconButton,
  Typography,
  Stack,
  useTheme,
  alpha} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  VpnKey as KeyIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  AdminPanelSettings,
  WorkOutline,
  Warning,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  employeeCode?: string;
  phone?: string;
  department?: string;
  shiftId?: number;
  shift?: {
    id: number;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
  };
  mustChangePassword: boolean;
  lastPasswordChange?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  email: string;
  password?: string;
  name: string;
  role: string;
  active: boolean;
  employeeCode: string;
  phone: string;
  department: string;
  shiftId: number | '';
  mustChangePassword: boolean;
}

const initialFormData: UserFormData = {
  email: '',
  password: '',
  name: '',
  role: 'OPERATOR',
  active: true,
  employeeCode: '',
  phone: '',
  department: '',
  shiftId: '',
  mustChangePassword: true};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  DIRECTOR: 'Diretoria',
  MANAGER: 'Gerente',
  LEADER: 'Líder',
  OPERATOR: 'Operador'};

const roleColors: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  ADMIN: 'error',
  DIRECTOR: 'warning',
  MANAGER: 'info',
  LEADER: 'success',
  OPERATOR: 'default'};

interface Shift {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
}

export default function Users() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { selectedCompany } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Estados de busca e filtros
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadUsers();
    if (selectedCompany) {
      loadShifts();
    }
  }, [selectedCompany]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar colaboradores', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = async () => {
    if (!selectedCompany) return;
    
    try {
      const response = await api.get('/shifts', {
        params: { companyId: selectedCompany.id }
      });
      setShifts(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar turnos:', error);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        employeeCode: user.employeeCode || '',
        phone: user.phone || '',
        department: user.department || '',
        shiftId: user.shiftId || '',
        mustChangePassword: user.mustChangePassword});
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
    setShowPassword(false);
  };

  const handleSave = async () => {
    try {
      if (!formData.email || !formData.name || !formData.role) {
        enqueueSnackbar('Email, nome e perfil são obrigatórios', { variant: 'warning' });
        return;
      }

      if (!editingId && !formData.password) {
        enqueueSnackbar('Senha é obrigatória para novos usuários', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        ...formData,
        employeeCode: formData.employeeCode || null,
        phone: formData.phone || null,
        department: formData.department || null,
        shiftId: formData.shiftId || null};

      if (editingId) {
        await api.put(`/users/${editingId}`, dataToSend);
        enqueueSnackbar('Colaborador atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/users', dataToSend);
        enqueueSnackbar('Colaborador criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar colaborador';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja desativar este colaborador?')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      enqueueSnackbar('Colaborador desativado com sucesso', { variant: 'success' });
      loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao desativar colaborador';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof UserFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'active' || field === 'mustChangePassword' 
      ? event.target.checked 
      : event.target.value;
    
    setFormData({
      ...formData,
      [field]: value});
  };

  const handleOpenResetPassword = (userId: number) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      enqueueSnackbar('Senha deve ter no mínimo 6 caracteres', { variant: 'warning' });
      return;
    }

    try {
      await api.post(`/users/${selectedUserId}/reset-password`, {
        newPassword,
        mustChangePassword: true});
      enqueueSnackbar('Senha resetada com sucesso', { variant: 'success' });
      setResetPasswordDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao resetar senha';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // Filtros e estatísticas computados
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.employeeCode && user.employeeCode.toLowerCase().includes(searchText.toLowerCase()));

      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus =
        !filterStatus || (filterStatus === 'active' ? user.active : !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchText, filterRole, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.active).length,
      admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'DIRECTOR' || u.role === 'MANAGER').length,
      mustChangePassword: users.filter((u) => u.mustChangePassword).length};
  }, [users]);

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<PeopleIcon />}
        title="Colaboradores"
        subtitle="Gestão de usuários e permissões"
        iconGradient="linear-gradient(135deg, #673ab7 0%, #512da8 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Colaboradores"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Colaboradores Ativos"
            value={stats.active}
            subtitle={`${((stats.active / stats.total) * 100 || 0).toFixed(0)}% do total`}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Gestores/Admins"
            value={stats.admins}
            subtitle="Admin, Diretor ou Gerente"
            icon={<AdminPanelSettings sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Trocar Senha"
            value={stats.mustChangePassword}
            subtitle="Precisam redefinir"
            icon={<Warning sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Busca e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
          <TextField
            placeholder="Buscar por nome, e-mail ou código..."
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
          <TextField
            select
            size="small"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )}}
          >
            <MenuItem value="">Todos os Perfis</MenuItem>
            {Object.entries(roleLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )}}
          >
            <MenuItem value="">Todos Status</MenuItem>
            <MenuItem value="active">Ativos</MenuItem>
            <MenuItem value="inactive">Inativos</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 180 }}
          >
            Novo Colaborador
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Colaboradores */}
      <TableContainer 
        component={Paper}
        sx={{ 
          maxHeight: { xs: 'calc(100vh - 520px)', md: 'calc(100vh - 550px)' },
          overflow: 'auto',
          borderRadius: 2}}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Cód. Func.
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Nome
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Perfil
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05), display: { xs: 'none', md: 'table-cell' } }}>
                Departamento
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05), display: { xs: 'none', lg: 'table-cell' } }}>
                Turno
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05), display: { xs: 'none', sm: 'table-cell' } }}>
                Trocar Senha
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando colaboradores...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <WorkOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {searchText || filterRole || filterStatus
                      ? 'Nenhum colaborador encontrado com os filtros aplicados'
                      : 'Nenhum colaborador cadastrado'}
                  </Typography>
                  {!searchText && !filterRole && !filterStatus && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Cadastrar Primeiro Colaborador
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Chip
                      label={user.employeeCode || 'N/A'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleLabels[user.role]}
                      color={roleColors[user.role]}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.department || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {user.shift ? (
                      <Chip
                        label={`${user.shift.name} (${user.shift.code})`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? 'Ativo' : 'Inativo'}
                      color={user.active ? 'success' : 'error'}
                      size="small"
                      variant="filled"
                      icon={user.active ? <CheckCircle /> : <Cancel />}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Chip
                      label={user.mustChangePassword ? 'Sim' : 'Não'}
                      color={user.mustChangePassword ? 'warning' : 'success'}
                      size="small"
                      variant={user.mustChangePassword ? 'filled' : 'outlined'}
                      icon={user.mustChangePassword ? <Warning /> : <CheckCircle />}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                      title="Editar colaborador"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)}}}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => handleOpenResetPassword(user.id)}
                      title="Resetar senha"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.1)}}}
                    >
                      <KeyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user.id)}
                      title="Desativar colaborador"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1)}}}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Formulário */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2}}}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5}}>
          <Box
            sx={{
              backgroundColor: alpha('#fff', 0.2),
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'}}
          >
            <PeopleIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {editingId ? 'Atualize as informações do colaborador' : 'Preencha os dados para cadastrar um novo colaborador'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5}>
            {/* Dados Pessoais */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                Dados Pessoais
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Funcionário"
                value={formData.employeeCode}
                onChange={handleChange('employeeCode')}
                placeholder="Ex: EMP001"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome Completo"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Nome completo do colaborador"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              />
            </Grid>

            {/* Dados de Contato */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                Contato
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="email@empresa.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              />
            </Grid>

            {/* Dados da Empresa */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                Empresa e Perfil
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.department}
                onChange={handleChange('department')}
                placeholder="Ex: Produção, Qualidade"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Turno Padrão"
                value={formData.shiftId}
                onChange={handleChange('shiftId')}
                helperText={
                  !selectedCompany
                    ? 'Selecione uma empresa para visualizar os turnos'
                    : shifts.length === 0
                    ? 'Nenhum turno cadastrado para esta empresa'
                    : 'Turno em que o colaborador normalmente trabalha'
                }
                disabled={!selectedCompany || shifts.length === 0}
              >
                <MenuItem value="">Sem turno definido</MenuItem>
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.code}) - {shift.startTime} às {shift.endTime}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Perfil de Acesso"
                value={formData.role}
                onChange={handleChange('role')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AdminPanelSettings sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )}}
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Segurança */}
            {!editingId && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                    Segurança
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Mínimo 6 caracteres"
                    helperText="A senha deve conter no mínimo 6 caracteres"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <MuiIconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </MuiIconButton>
                        </InputAdornment>
                      )}}
                  />
                </Grid>
              </>
            )}

            {/* Configurações */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                Configurações
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: formData.active ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${formData.active ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: 2}}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleChange('active')}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Colaborador Ativo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.active ? 'Pode acessar o sistema' : 'Não pode acessar'}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: formData.mustChangePassword ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${formData.mustChangePassword ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 2}}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.mustChangePassword}
                      onChange={handleChange('mustChangePassword')}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Trocar Senha
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.mustChangePassword ? 'Deve trocar no login' : 'Não precisa trocar'}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" size="large">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            size="large"
            startIcon={editingId ? <EditIcon /> : <AddIcon />}
          >
            {editingId ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Reset de Senha */}
      <Dialog 
        open={resetPasswordDialogOpen} 
        onClose={() => setResetPasswordDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2}}}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.dark, 0.9)} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5}}>
          <Box
            sx={{
              backgroundColor: alpha('#fff', 0.2),
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'}}
          >
            <KeyIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Resetar Senha
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Defina uma nova senha temporária
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2}}
          >
            <Typography variant="body2" color="info.main" fontWeight={600} gutterBottom>
              ℹ️ Aviso Importante
            </Typography>
            <Typography variant="caption" color="text.secondary">
              O usuário será obrigado a trocar a senha no próximo login.
            </Typography>
          </Paper>
          <TextField
            fullWidth
            label="Nova Senha Temporária"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            helperText="Esta será uma senha temporária que o usuário deverá trocar"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              )}}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setResetPasswordDialogOpen(false)} variant="outlined" size="large">
            Cancelar
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="warning"
            size="large"
            startIcon={<KeyIcon />}
          >
            Resetar Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

