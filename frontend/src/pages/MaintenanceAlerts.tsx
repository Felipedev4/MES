import { useState, useEffect } from 'react';
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
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NotificationsActive as AlertIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { MaintenanceAlert, EmailConfig, Mold, EmailLog } from '../types';

// Função helper para formatar tempo decorrido
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `há ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else {
    return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  }
}

export default function MaintenanceAlertsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [upcomingAlerts, setUpcomingAlerts] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingAlert, setEditingAlert] = useState<MaintenanceAlert | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    moldId: '',
    emailConfigId: '',
    recipientEmails: '',
    daysBeforeMaintenance: 7,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alertsRes, configsRes, moldsRes, upcomingRes, logsRes] = await Promise.all([
        api.get('/maintenance-alerts'),
        api.get('/email-configs'),
        api.get('/molds'),
        api.get('/maintenance-alerts/upcoming/list?days=30'),
        api.get('/maintenance-alerts/email-logs?limit=50'),
      ]);
      setAlerts(alertsRes.data);
      setEmailConfigs(configsRes.data.filter((c: EmailConfig) => c.active));
      setMolds(moldsRes.data);
      setUpcomingAlerts(upcomingRes.data);
      setEmailLogs(logsRes.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (alert?: MaintenanceAlert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        moldId: alert.moldId?.toString() || '',
        emailConfigId: alert.emailConfigId.toString(),
        recipientEmails: alert.recipientEmails,
        daysBeforeMaintenance: alert.daysBeforeMaintenance,
        active: alert.active,
      });
    } else {
      setEditingAlert(null);
      setFormData({
        moldId: '',
        emailConfigId: emailConfigs[0]?.id.toString() || '',
        recipientEmails: '',
        daysBeforeMaintenance: 7,
        active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAlert(null);
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.emailConfigId || !formData.recipientEmails) {
        enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
        return;
      }

      // Validar e-mails
      const emails = formData.recipientEmails.split(',').map(e => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emails.some(e => !emailRegex.test(e))) {
        enqueueSnackbar('Um ou mais e-mails são inválidos', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        ...formData,
        moldId: formData.moldId ? parseInt(formData.moldId) : null,
        emailConfigId: parseInt(formData.emailConfigId),
      };

      if (editingAlert) {
        await api.put(`/maintenance-alerts/${editingAlert.id}`, dataToSend);
        enqueueSnackbar('Alerta atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/maintenance-alerts', dataToSend);
        enqueueSnackbar('Alerta criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao salvar alerta', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este alerta?')) return;

    try {
      await api.delete(`/maintenance-alerts/${id}`);
      enqueueSnackbar('Alerta excluído com sucesso', { variant: 'success' });
      loadData();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao excluir alerta', { variant: 'error' });
    }
  };

  const handleForceSend = async (id: number) => {
    // Buscar dados do alerta para mostrar na confirmação
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    const mold = molds.find(m => m.id === alert.moldId);
    const config = emailConfigs.find(c => c.id === alert.emailConfigId);
    const recipients = alert.recipientEmails.split(',').map(e => e.trim());

    // Mensagem de confirmação detalhada
    const confirmMessage = `🔔 CONFIRMAR ENVIO DE ALERTA

📋 Molde: ${mold?.code || 'Todos'}${mold?.description ? ` - ${mold.description}` : ''}
📧 Destinatários (${recipients.length}):
${recipients.slice(0, 3).map(e => `   • ${e}`).join('\n')}${recipients.length > 3 ? `\n   • + ${recipients.length - 3} mais...` : ''}
⚙️  Config SMTP: ${config?.name || 'N/A'}

Deseja enviar o alerta AGORA?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/maintenance-alerts/${id}/send`);
      
      // Mensagem de sucesso detalhada
      const results = response.data.results || [];
      const successCount = results.filter((r: any) => r.status === 'enviado').length;
      const errorCount = results.length - successCount;

      if (errorCount === 0) {
        enqueueSnackbar(
          `✅ Alerta enviado com sucesso para ${successCount} destinatário(s)! Verifique o Histórico de Envios.`,
          { 
            variant: 'success',
            autoHideDuration: 6000,
          }
        );
      } else {
        enqueueSnackbar(
          `⚠️ Parcialmente enviado: ${successCount} sucesso, ${errorCount} falha(s). Verifique o Histórico de Envios para detalhes.`,
          { 
            variant: 'warning',
            autoHideDuration: 8000,
          }
        );
      }
      
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro desconhecido';
      enqueueSnackbar(
        `❌ Erro ao enviar alerta: ${errorMsg}`,
        { 
          variant: 'error',
          autoHideDuration: 8000,
        }
      );
    } finally {
      setSending(false);
    }
  };

  const handleCheckNow = async () => {
    if (!window.confirm('🔍 Verificar todos os alertas agora?\n\nIsso irá verificar os moldes com manutenção próxima e enviar e-mails se necessário.')) {
      return;
    }

    setSending(true);
    try {
      const response = await api.post('/maintenance-alerts/check');
      const checked = response.data.checked || 0;
      const sent = response.data.sent || 0;
      
      if (sent > 0) {
        enqueueSnackbar(
          `✅ Verificação concluída! ${sent} alerta(s) enviado(s) de ${checked} verificado(s).`,
          { 
            variant: 'success',
            autoHideDuration: 6000,
          }
        );
      } else {
        enqueueSnackbar(
          `ℹ️ Verificação concluída! Nenhum alerta precisou ser enviado. ${checked} alerta(s) verificado(s).`,
          { 
            variant: 'info',
            autoHideDuration: 5000,
          }
        );
      }
      
      loadData();
    } catch (error: any) {
      enqueueSnackbar(
        `❌ Erro ao verificar alertas: ${error.response?.data?.error || 'Erro desconhecido'}`,
        { 
          variant: 'error',
          autoHideDuration: 7000,
        }
      );
    } finally {
      setSending(false);
    }
  };

  const handleClearEmailLogs = async () => {
    const confirmMessage = `🗑️ LIMPAR HISTÓRICO DE E-MAILS

⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!

Você está prestes a deletar TODOS os registros de envios de e-mails (${emailLogs.length} registro(s)).

Isso inclui:
• Histórico de sucessos e falhas
• Datas e horários de envio
• Destinatários e assuntos
• Mensagens de erro

Tem certeza que deseja continuar?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete('/maintenance-alerts/email-logs');
      const deletedCount = response.data.deletedCount || 0;
      
      enqueueSnackbar(
        `🗑️ Histórico limpo! ${deletedCount} registro(s) de e-mail deletado(s) com sucesso.`,
        { 
          variant: 'success',
          autoHideDuration: 5000,
        }
      );
      loadData();
    } catch (error: any) {
      enqueueSnackbar(
        `❌ Erro ao limpar histórico: ${error.response?.data?.error || 'Erro desconhecido'}`,
        { 
          variant: 'error',
          autoHideDuration: 7000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AlertIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Alertas de Manutenção
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure alertas automáticos de manutenção de moldes
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleCheckNow}
            disabled={sending}
          >
            Verificar Agora
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Alerta
          </Button>
        </Box>
      </Box>

      {/* Alertas Pendentes */}
      {upcomingAlerts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ScheduleIcon />
            <Typography variant="h6">Manutenções Programadas</Typography>
          </Box>
          <Grid container spacing={2}>
            {upcomingAlerts.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={`upcoming-${item.moldId || index}`}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.moldCode || 'Sem código'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Próxima manutenção: {item.nextMaintenanceDate 
                        ? new Date(item.nextMaintenanceDate).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.daysUntilMaintenance !== undefined 
                        ? `${item.daysUntilMaintenance} dias restantes`
                        : 'Aguardando dados'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {emailConfigs.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Configure primeiro um servidor de e-mail em "Configuração de E-mail"
        </Alert>
      ) : null}

      {alerts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhum alerta cadastrado
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Configure alertas para receber notificações antes da manutenção dos moldes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={emailConfigs.length === 0}
          >
            Adicionar Alerta
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Molde</TableCell>
                <TableCell>Destinatários</TableCell>
                <TableCell>Dias de Antecedência</TableCell>
                <TableCell>Config. E-mail</TableCell>
                <TableCell>Último Envio</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    {alert.moldId ? (
                      <Typography fontWeight="bold">
                        {alert.mold?.code || `Molde #${alert.moldId}`}
                      </Typography>
                    ) : (
                      <Chip label="TODOS OS MOLDES" size="small" color="info" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {alert.recipientEmails.split(',').length > 1
                        ? `${alert.recipientEmails.split(',')[0].trim()} +${alert.recipientEmails.split(',').length - 1}`
                        : alert.recipientEmails}
                    </Typography>
                  </TableCell>
                  <TableCell>{alert.daysBeforeMaintenance} dias</TableCell>
                  <TableCell>{alert.emailConfig?.name || '-'}</TableCell>
                  <TableCell>
                    {alert.lastCheck
                      ? formatTimeAgo(new Date(alert.lastCheck))
                      : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    {alert.active ? (
                      <Chip label="Ativo" size="small" color="success" />
                    ) : (
                      <Chip label="Inativo" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleForceSend(alert.id)}
                      disabled={sending}
                      title="Enviar Agora (Manual)"
                    >
                      <SendIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(alert)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(alert.id)}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAlert ? 'Editar Alerta' : 'Novo Alerta'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              Configure alertas para receber e-mails automáticos antes da data de manutenção dos moldes.
              O sistema verifica diariamente às 08:00.
            </Alert>

            <TextField
              select
              label="Molde"
              value={formData.moldId}
              onChange={(e) => setFormData({ ...formData, moldId: e.target.value })}
              fullWidth
              helperText="Deixe vazio para alertar sobre todos os moldes"
            >
              <MenuItem value="">Todos os moldes</MenuItem>
              {molds.map((mold) => (
                <MenuItem key={mold.id} value={mold.id.toString()}>
                  {mold.code} - {mold.description}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Configuração de E-mail"
              value={formData.emailConfigId}
              onChange={(e) => setFormData({ ...formData, emailConfigId: e.target.value })}
              fullWidth
              required
            >
              {emailConfigs.map((config) => (
                <MenuItem key={config.id} value={config.id.toString()}>
                  {config.name} ({config.fromEmail})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="E-mails Destinatários"
              value={formData.recipientEmails}
              onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="email1@empresa.com, email2@empresa.com"
              helperText="Separe múltiplos e-mails por vírgula"
            />

            <TextField
              label="Dias de Antecedência"
              type="number"
              value={formData.daysBeforeMaintenance}
              onChange={(e) => setFormData({ ...formData, daysBeforeMaintenance: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1, max: 90 }}
              helperText="Quantos dias antes da manutenção enviar o alerta"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Alerta ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingAlert ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aba de Histórico de Envios */}
      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<AlertIcon />} label="Alertas Configurados" iconPosition="start" />
            <Tab icon={<HistoryIcon />} label={`Histórico de Envios (${emailLogs.length})`} iconPosition="start" />
          </Tabs>
        </Box>

        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Histórico de Envios ({emailLogs.length})
              </Typography>
              {emailLogs.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearEmailLogs}
                >
                  Limpar Histórico
                </Button>
              )}
            </Box>
            
            {emailLogs.length === 0 ? (
              <Alert severity="info">Nenhum e-mail enviado ainda</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Data/Hora</TableCell>
                      <TableCell>Molde</TableCell>
                      <TableCell>Destinatário</TableCell>
                      <TableCell>Assunto</TableCell>
                      <TableCell>Config</TableCell>
                      <TableCell>Erro</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Tooltip title={log.success ? 'Enviado com sucesso' : 'Falha no envio'}>
                            {log.success ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <ErrorIcon color="error" />
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.sentAt).toLocaleString('pt-BR')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(new Date(log.sentAt))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.mold ? (
                            <>
                              <Typography variant="body2" fontWeight="bold">
                                {log.mold.code}
                              </Typography>
                              {log.mold.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {log.mold.description}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.recipients}</Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={log.body}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {log.subject}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {log.emailConfig?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.error ? (
                            <Tooltip title={log.error}>
                              <Chip label="Ver erro" size="small" color="error" />
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

