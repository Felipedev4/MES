import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  InputAdornment,
  useTheme,
  alpha} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Cancel as CancelIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { EmailConfig } from '../types';

// Componente de, de Estatísticas
export default function EmailConfigPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailConfig | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    active: true});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await api.get('/email-configs');
      setConfigs(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar configurações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: EmailConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.username,
        password: '', // Não preencher senha por segurança
        fromEmail: config.fromEmail,
        fromName: config.fromName || '',
        active: config.active});
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        active: true});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.name || !formData.host || !formData.username || !formData.fromEmail) {
        enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
        return;
      }

      if (!editingConfig && !formData.password) {
        enqueueSnackbar('Senha é obrigatória para nova configuração', { variant: 'warning' });
        return;
      }

      const dataToSend = editingConfig
        ? formData.password
          ? formData // Com senha (atualizar senha)
          : { ...formData, password: undefined } // Sem senha (manter senha atual)
        : formData; // Nova config (senha obrigatória)

      if (editingConfig) {
        await api.put(`/email-configs/${editingConfig.id}`, dataToSend);
        enqueueSnackbar('Configuração atualizada com sucesso', { variant: 'success' });
      } else {
        await api.post('/email-configs', dataToSend);
        enqueueSnackbar('Configuração criada com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadConfigs();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao salvar configuração', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta configuração?')) return;

    try {
      await api.delete(`/email-configs/${id}`);
      enqueueSnackbar('Configuração excluída com sucesso', { variant: 'success' });
      loadConfigs();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao excluir configuração', { variant: 'error' });
    }
  };

  const handleTest = async (id: number) => {
    setTesting(true);
    try {
      const response = await api.post(`/email-configs/${id}/test`);
      enqueueSnackbar(response.data.message || 'Teste realizado com sucesso!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao testar conexão', { variant: 'error' });
    } finally {
      setTesting(false);
    }
  };

  // Filtros e estatísticas
  const filteredConfigs = useMemo(() => {
    return configs.filter((config) =>
      !searchText ||
      config.name.toLowerCase().includes(searchText.toLowerCase()) ||
      config.host.toLowerCase().includes(searchText.toLowerCase()) ||
      config.fromEmail.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [configs, searchText]);

  const stats = useMemo(() => {
    return {
      total: configs.length,
      active: configs.filter((c) => c.active).length,
      inactive: configs.filter((c) => !c.active).length,
      secure: configs.filter((c) => c.secure).length};
  }, [configs]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<EmailIcon />}
        title="Configuração de E-mail"
        subtitle="Gerencie as configurações SMTP para envio de alertas"
        iconGradient="linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Configurações"
            value={stats.total}
            subtitle="SMTP cadastrados"
            icon={<SettingsIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Configurações Ativas"
            value={stats.active}
            subtitle="Prontas para envio"
            icon={<CheckIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Inativas"
            value={stats.inactive}
            subtitle="Desabilitadas"
            icon={<CancelIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Com SSL/TLS"
            value={stats.secure}
            subtitle="Conexão segura"
            icon={<CheckIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Busca e Ações */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por nome, host ou e-mail..."
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
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 200 }}
          >
            Nova Configuração
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Configurações */}
      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 2}}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>Servidor SMTP</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>Porta</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>E-mail Remetente</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <EmailIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma configuração cadastrada
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Adicione uma configuração SMTP para enviar alertas
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Adicionar Configuração
                  </Button>
                </TableCell>
              </TableRow>
            ) : filteredConfigs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma configuração encontrada com "{searchText}"
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs.map((config) => (
                <TableRow 
                  key={config.id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SettingsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {config.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2">{config.host}</Typography>
                      {config.secure && (
                        <Chip label="SSL/TLS" size="small" color="success" sx={{ ml: 1, height: 20 }} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={config.port} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{config.fromEmail}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {config.active ? (
                      <Chip 
                        label="Ativo" 
                        size="small" 
                        color="success" 
                        icon={<CheckIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip 
                        label="Inativo" 
                        size="small" 
                        color="error"
                        icon={<CancelIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleTest(config.id)}
                      disabled={testing}
                      title="Testar Conexão"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.1)}}}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(config)}
                      title="Editar"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)}}}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(config.id)}
                      title="Excluir"
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

      {/* Dialog de Criação/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              Configure o servidor SMTP para envio de e-mails. Gmail: smtp.gmail.com (porta 587).
            </Alert>

            <TextField
              label="Nome da Configuração"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Servidor SMTP"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                fullWidth
                required
                placeholder="smtp.gmail.com"
              />
              <TextField
                label="Porta"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                sx={{ width: '150px' }}
                required
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.secure}
                  onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                />
              }
              label="Usar SSL/TLS"
            />

            <TextField
              label="Usuário SMTP"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label={editingConfig ? 'Senha (deixe vazio para manter)' : 'Senha'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!editingConfig}
            />

            <TextField
              label="E-mail Remetente"
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              fullWidth
              required
              placeholder="alertas@empresa.com"
            />

            <TextField
              label="Nome do Remetente"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              fullWidth
              placeholder="Sistema MES - Alertas"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Configuração ativa"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingConfig ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

