/**
 * Página de Configuração de CLP
 */

import React, { useEffect, useState } from 'react';
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
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { plcConfigService } from '../services/plcConfigService';
import { PlcConfig } from '../types';

interface Sector {
  id: number;
  code: string;
  name: string;
}

const PlcConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<PlcConfig[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PlcConfig | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const { enqueueSnackbar } = useSnackbar();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 502,
    unitId: 1,
    timeout: 5000,
    pollingInterval: 1000,
    reconnectInterval: 10000,
    sectorId: '' as string | number,
  });

  const [registerFormData, setRegisterFormData] = useState({
    registerName: '',
    registerAddress: 0,
    description: '',
    dataType: 'INT16',
    enabled: true,
  });

  useEffect(() => {
    loadConfigs();
    loadSectors();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await plcConfigService.list();
      setConfigs(data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar configurações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSectors = async () => {
    try {
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar setores', { variant: 'error' });
    }
  };

  const handleOpenDialog = (config?: PlcConfig) => {
    if (config) {
      setSelectedConfig(config);
      setFormData({
        name: config.name,
        host: config.host,
        port: config.port,
        unitId: config.unitId,
        timeout: config.timeout,
        pollingInterval: config.pollingInterval,
        reconnectInterval: config.reconnectInterval,
        sectorId: config.sectorId || '',
      });
    } else {
      setSelectedConfig(null);
      setFormData({
        name: '',
        host: '',
        port: 502,
        unitId: 1,
        timeout: 5000,
        pollingInterval: 1000,
        reconnectInterval: 10000,
        sectorId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConfig(null);
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        sectorId: formData.sectorId ? Number(formData.sectorId) : null,
      };

      if (selectedConfig) {
        await plcConfigService.update(selectedConfig.id, dataToSend);
        enqueueSnackbar('Configuração atualizada com sucesso!', { variant: 'success' });
      } else {
        await plcConfigService.create(dataToSend);
        enqueueSnackbar('Configuração criada com sucesso!', { variant: 'success' });
      }
      handleCloseDialog();
      loadConfigs();
    } catch (error) {
      enqueueSnackbar('Erro ao salvar configuração', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta configuração?')) {
      try {
        await plcConfigService.delete(id);
        enqueueSnackbar('Configuração deletada com sucesso!', { variant: 'success' });
        loadConfigs();
      } catch (error) {
        enqueueSnackbar('Erro ao deletar configuração', { variant: 'error' });
      }
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await plcConfigService.activate(id);
      enqueueSnackbar('Configuração ativada com sucesso!', { variant: 'success' });
      loadConfigs();
    } catch (error) {
      enqueueSnackbar('Erro ao ativar configuração', { variant: 'error' });
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await plcConfigService.testConnection({
        host: formData.host,
        port: formData.port,
        unitId: formData.unitId,
        timeout: formData.timeout,
      });
      setTestResult(result);
      if (result.success) {
        enqueueSnackbar('Conexão testada com sucesso!', { variant: 'success' });
      } else {
        enqueueSnackbar('Falha na conexão', { variant: 'error' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Erro ao testar conexão' });
      enqueueSnackbar('Erro ao testar conexão', { variant: 'error' });
    } finally {
      setTestLoading(false);
    }
  };

  // Registro functions
  const handleOpenRegisterDialog = (config: PlcConfig) => {
    setSelectedConfig(config);
    setRegisterFormData({
      registerName: '',
      registerAddress: 0,
      description: '',
      dataType: 'INT16',
      enabled: true,
    });
    setRegisterDialogOpen(true);
  };

  const handleSubmitRegister = async () => {
    if (!selectedConfig) return;

    try {
      await plcConfigService.createRegister({
        ...registerFormData,
        plcConfigId: selectedConfig.id,
      });
      enqueueSnackbar('Registro adicionado com sucesso!', { variant: 'success' });
      setRegisterDialogOpen(false);
      loadConfigs();
    } catch (error) {
      enqueueSnackbar('Erro ao adicionar registro', { variant: 'error' });
    }
  };

  const handleToggleRegister = async (registerId: number, enabled: boolean) => {
    try {
      await plcConfigService.updateRegister(registerId, { enabled });
      enqueueSnackbar('Registro atualizado!', { variant: 'success' });
      loadConfigs();
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar registro', { variant: 'error' });
    }
  };

  const handleDeleteRegister = async (registerId: number) => {
    if (window.confirm('Tem certeza que deseja deletar este registro?')) {
      try {
        await plcConfigService.deleteRegister(registerId);
        enqueueSnackbar('Registro deletado!', { variant: 'success' });
        loadConfigs();
      } catch (error) {
        enqueueSnackbar('Erro ao deletar registro', { variant: 'error' });
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Configuração de CLP</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Configuração
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Porta</TableCell>
                <TableCell>Setor</TableCell>
                <TableCell>Polling (ms)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registros</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <React.Fragment key={config.id}>
                  <TableRow>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>{config.host}</TableCell>
                    <TableCell>{config.port}</TableCell>
                    <TableCell>{config.sector?.name || '-'}</TableCell>
                    <TableCell>{config.pollingInterval}</TableCell>
                    <TableCell>
                      {config.active ? (
                        <Chip
                          label="Ativa"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip label="Inativa" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{config.registers?.length || 0}</TableCell>
                    <TableCell align="right">
                      {!config.active && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActivate(config.id)}
                          title="Ativar"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(config)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(config.id)}
                        title="Deletar"
                        disabled={config.active}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {config.registers && config.registers.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ bgcolor: 'grey.50', p: 0 }}>
                        <Accordion elevation={0}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2">
                              Registros ({config.registers.length})
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Nome</TableCell>
                                  <TableCell>Endereço</TableCell>
                                  <TableCell>Descrição</TableCell>
                                  <TableCell>Tipo</TableCell>
                                  <TableCell>Habilitado</TableCell>
                                  <TableCell align="right">Ações</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {config.registers.map((register) => (
                                  <TableRow key={register.id}>
                                    <TableCell>{register.registerName}</TableCell>
                                    <TableCell>{register.registerAddress}</TableCell>
                                    <TableCell>{register.description || '-'}</TableCell>
                                    <TableCell>{register.dataType}</TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={register.enabled}
                                        onChange={(e) =>
                                          handleToggleRegister(register.id, e.target.checked)
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteRegister(register.id)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <Box mt={2}>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenRegisterDialog(config)}
                              >
                                Adicionar Registro
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Configuração */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedConfig ? 'Editar Configuração' : 'Nova Configuração'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Setor"
                value={formData.sectorId}
                onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                helperText="Opcional - vincule a um setor específico"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {sectors.map((sector) => (
                  <MenuItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Host/IP"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Porta"
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Unit ID"
                type="number"
                value={formData.unitId}
                onChange={(e) =>
                  setFormData({ ...formData, unitId: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Timeout (ms)"
                type="number"
                value={formData.timeout}
                onChange={(e) =>
                  setFormData({ ...formData, timeout: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Intervalo de Polling (ms)"
                type="number"
                value={formData.pollingInterval}
                onChange={(e) =>
                  setFormData({ ...formData, pollingInterval: parseInt(e.target.value) })
                }
                helperText="Frequência de leitura dos registros"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Intervalo de Reconexão (ms)"
                type="number"
                value={formData.reconnectInterval}
                onChange={(e) =>
                  setFormData({ ...formData, reconnectInterval: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={
                  testLoading ? <CircularProgress size={20} /> : <SettingsInputAntennaIcon />
                }
                onClick={handleTestConnection}
                disabled={testLoading || !formData.host}
                fullWidth
              >
                Testar Conexão
              </Button>
            </Grid>
            {testResult && (
              <Grid item xs={12}>
                <Alert severity={testResult.success ? 'success' : 'error'}>
                  {testResult.message}
                  {testResult.latency && ` (Latência: ${testResult.latency}ms)`}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.host}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Registro */}
      <Dialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Registro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nome do Registro"
                value={registerFormData.registerName}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, registerName: e.target.value })
                }
                placeholder="D33"
                required
                helperText="Ex: D33, D34, M100"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Endereço"
                type="number"
                value={registerFormData.registerAddress}
                onChange={(e) =>
                  setRegisterFormData({
                    ...registerFormData,
                    registerAddress: parseInt(e.target.value),
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={registerFormData.description}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, description: e.target.value })
                }
                placeholder="Contador de produção"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Dado"
                value={registerFormData.dataType}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, dataType: e.target.value })
                }
              >
                <MenuItem value="INT16">INT16</MenuItem>
                <MenuItem value="INT32">INT32</MenuItem>
                <MenuItem value="UINT16">UINT16</MenuItem>
                <MenuItem value="UINT32">UINT32</MenuItem>
                <MenuItem value="FLOAT">FLOAT</MenuItem>
                <MenuItem value="BOOL">BOOL</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={registerFormData.enabled}
                    onChange={(e) =>
                      setRegisterFormData({ ...registerFormData, enabled: e.target.checked })
                    }
                  />
                }
                label="Habilitado"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmitRegister}
            variant="contained"
            disabled={!registerFormData.registerName || registerFormData.registerAddress < 0}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlcConfigPage;

