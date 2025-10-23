import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  Tooltip,
  Avatar,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
  alpha} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CorporateFare as CorporateFareIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';
import { User, Company } from '../types';

interface UserCompany {
  id: number;
  userId: number;
  companyId: number;
  isDefault: boolean;
  company: Company;
}

const UserCompanies = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  // Estados principais
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<Record<number, UserCompany[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados do dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [isDefaultCompany, setIsDefaultCompany] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNoCompanies, setFilterNoCompanies] = useState(false);
  const [filterMultipleCompanies, setFilterMultipleCompanies] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersResponse, companiesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/companies'),
      ]);

      setUsers(usersResponse.data);
      setCompanies(companiesResponse.data);

      // Carregar empresas de cada usuário
      const userCompaniesData: Record<number, UserCompany[]> = {};
      await Promise.all(
        usersResponse.data.map(async (user: User) => {
          try {
            const response = await api.get(`/companies/user/${user.id}`);
            userCompaniesData[user.id] = response.data;
          } catch (err) {
            console.error(`Erro ao carregar empresas do usuário ${user.id}:`, err);
            userCompaniesData[user.id] = [];
          }
        })
      );

      setUserCompanies(userCompaniesData);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao carregar dados';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtro de busca
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employeeCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro: usuários sem empresas
      if (filterNoCompanies && (userCompanies[user.id]?.length || 0) > 0) {
        return false;
      }

      // Filtro: usuários com múltiplas empresas
      if (filterMultipleCompanies && (userCompanies[user.id]?.length || 0) <= 1) {
        return false;
      }

      return true;
    });
  }, [users, userCompanies, searchTerm, filterNoCompanies, filterMultipleCompanies]);

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedCompanyId('');
    setIsDefaultCompany((userCompanies[user.id]?.length || 0) === 0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedCompanyId('');
    setIsDefaultCompany(false);
    setDialogLoading(false);
  };

  const handleLinkUser = async () => {
    if (!selectedUser || !selectedCompanyId) {
      enqueueSnackbar('Selecione uma empresa', { variant: 'warning' });
      return;
    }

    try {
      setDialogLoading(true);
      
      await api.post('/companies/link-user', {
        userId: selectedUser.id,
        companyId: selectedCompanyId,
        isDefault: isDefaultCompany});

      enqueueSnackbar('Colaborador vinculado à empresa com sucesso!', { variant: 'success' });
      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao vincular empresa';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUnlinkUser = async (userId: number, companyId: number, companyName: string) => {
    if (!window.confirm(`Tem certeza que deseja desvincular este colaborador da empresa "${companyName}"?`)) {
      return;
    }

    try {
      await api.delete(`/companies/unlink-user/${userId}/${companyId}`);
      enqueueSnackbar('Vínculo removido com sucesso!', { variant: 'success' });
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao remover vínculo';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleSetDefault = async (userId: number, companyId: number) => {
    try {
      await api.post('/companies/set-default', {
        userId,
        companyId});

      enqueueSnackbar('Empresa padrão definida com sucesso!', { variant: 'success' });
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao definir empresa padrão';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // Empresas disponíveis para vincular ao usuário selecionado
  const availableCompanies = useMemo(() => {
    if (!selectedUser) return [];
    
    const userCompanyIds = (userCompanies[selectedUser.id] || []).map(uc => uc.companyId);
    return companies.filter(company => !userCompanyIds.includes(company.id));
  }, [selectedUser, companies, userCompanies]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const usersWithCompanies = users.filter(u => (userCompanies[u.id]?.length || 0) > 0).length;
    const usersWithoutCompanies = totalUsers - usersWithCompanies;
    const usersWithMultipleCompanies = users.filter(u => (userCompanies[u.id]?.length || 0) > 1).length;

    return {
      totalUsers,
      usersWithCompanies,
      usersWithoutCompanies,
      usersWithMultipleCompanies};
  }, [users, userCompanies]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Cabeçalho */}
        {/* Header Profissional */}
        <PageHeader
          icon={<PersonIcon />}
          title="Gestão de Colaboradores e Empresas"
          subtitle="Vincule colaboradores às suas respectivas empresas e defina a empresa padrão"
          iconGradient="linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/*, s de Estatísticas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Total de Colaboradores"
              value={stats.totalUsers}
              subtitle="Cadastrados no sistema"
              icon={<GroupsIcon sx={{ fontSize: 32 }} />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Com Empresas"
              value={stats.usersWithCompanies}
              subtitle={`${((stats.usersWithCompanies / stats.totalUsers) * 100 || 0).toFixed(0)}% do total`}
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Sem Empresas"
              value={stats.usersWithoutCompanies}
              subtitle="Precisam ser vinculados"
              icon={<WarningIcon sx={{ fontSize: 32 }} />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Múltiplas Empresas"
              value={stats.usersWithMultipleCompanies}
              subtitle="Com mais de 1 vínculo"
              icon={<CorporateFareIcon sx={{ fontSize: 32 }} />}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Filtros e Busca */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por nome, email ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  )}}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={filterNoCompanies}
                      onChange={(e) => setFilterNoCompanies(e.target.checked)}
                    />
                  }
                  label="Sem Empresas"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filterMultipleCompanies}
                      onChange={(e) => setFilterMultipleCompanies(e.target.checked)}
                    />
                  }
                  label="Múltiplas Empresas"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabela de Colaboradores */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="25%">Colaborador</TableCell>
                  <TableCell width="15%">Código</TableCell>
                  <TableCell width="15%">Cargo</TableCell>
                  <TableCell width="30%">Empresas Vinculadas</TableCell>
                  <TableCell width="10%" align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm || filterNoCompanies || filterMultipleCompanies
                            ? 'Nenhum colaborador encontrado com os filtros aplicados'
                            : 'Nenhum colaborador cadastrado'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.employeeCode || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={
                            user.role === 'ADMIN'
                              ? 'error'
                              : user.role === 'MANAGER'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {(userCompanies[user.id] || []).length === 0 ? (
                          <Chip
                            label="Nenhuma empresa"
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        ) : (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(userCompanies[user.id] || [])
                              .filter((uc) => uc.company)
                              .map((uc) => (
                                <Tooltip
                                  key={uc.id}
                                  title={
                                    uc.isDefault
                                      ? 'Empresa Padrão - Clique para remover'
                                      : 'Clique na estrela para definir como padrão'
                                  }
                                >
                                  <Chip
                                    label={uc.company.name}
                                    size="small"
                                    color={uc.isDefault ? 'primary' : 'default'}
                                    icon={
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          !uc.isDefault && handleSetDefault(user.id, uc.companyId)
                                        }
                                        sx={{ p: 0 }}
                                      >
                                        {uc.isDefault ? (
                                          <StarIcon sx={{ fontSize: 16 }} />
                                        ) : (
                                          <StarBorderIcon sx={{ fontSize: 16 }} />
                                        )}
                                      </IconButton>
                                    }
                                    onDelete={() =>
                                      handleUnlinkUser(user.id, uc.companyId, uc.company.name)
                                    }
                                    deleteIcon={<DeleteIcon />}
                                    sx={{ mb: 0.5 }}
                                  />
                                </Tooltip>
                              ))}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Adicionar Empresa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(user)}
                            size="small"
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredUsers.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                Exibindo {filteredUsers.length} de {users.length} colaboradores
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Dialog para adicionar empresa */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2}}}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.dark, 0.9)} 100%)`,
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
            <BusinessIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Vincular Empresa
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Associe uma empresa a este colaborador
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box>
            {selectedUser && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2}}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {availableCompanies.length === 0 ? (
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Nenhuma Empresa Disponível
                </Typography>
                <Typography variant="caption">
                  Todas as empresas já foram vinculadas a este colaborador.
                </Typography>
              </Alert>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel>Selecione a Empresa</InputLabel>
                  <Select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value as number)}
                    label="Selecione a Empresa"
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ color: 'text.secondary', ml: 1 }} />
                      </InputAdornment>
                    }
                  >
                    {availableCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Código: {company.code}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Paper
                  sx={{
                    p: 2,
                    mt: 2.5,
                    backgroundColor: isDefaultCompany ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.grey[500], 0.05),
                    border: `1px solid ${isDefaultCompany ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.grey[500], 0.2)}`,
                    borderRadius: 2}}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isDefaultCompany}
                        onChange={(e) => setIsDefaultCompany(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Empresa Padrão
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isDefaultCompany 
                            ? 'Será selecionada automaticamente ao fazer login' 
                            : 'Não será definida como padrão'}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                {isDefaultCompany && (
                  <Alert severity="info" sx={{ mt: 2 }} icon={<StarIcon />}>
                    <Typography variant="caption">
                      Esta empresa será a opção padrão quando o colaborador fizer login no sistema.
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} disabled={dialogLoading} variant="outlined" size="large">
            Cancelar
          </Button>
          <Button
            onClick={handleLinkUser}
            variant="contained"
            color="info"
            size="large"
            disabled={!selectedCompanyId || dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {dialogLoading ? 'Vinculando...' : 'Vincular Empresa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserCompanies;
