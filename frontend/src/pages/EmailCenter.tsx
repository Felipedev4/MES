/**
 * Central de E-mails - Visualização consolidada de todos os e-mails enviados pelo sistema
 */

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
  Chip,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Alert} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  NotificationsActive as AlertIcon,
  Warning as WarningIcon,
  Info as InfoIcon} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import moment from 'moment';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';

// Interfaces
interface EmailLog {
  id: number;
  emailConfigId?: number;
  recipients: string;
  subject: string;
  body: string;
  success: boolean;
  error?: string;
  sentAt: string;
  // Campos extras
  emailType?: 'maintenance_alert' | 'downtime_notification' | 'other';
  moldId?: number;
  moldCode?: string;
  downtimeId?: number;
  downtimeReason?: string;
  productionOrderNumber?: string;
  defectName?: string;
  sectorNames?: string;
}

export default function EmailCenter() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      
      // Buscar logs de e-mail de diferentes fontes
      const [maintenanceLogsRes, downtimeLogsRes] = await Promise.all([
        api.get('/maintenance-alerts/email-logs?limit=200'),
        api.get('/downtimes/email-logs?limit=200'),
      ]);

      // Processar e combinar logs
      const allEmails: EmailLog[] = [
        ...maintenanceLogsRes.data.map((log: any) => ({
          ...log,
          emailType: 'maintenance_alert' as const,
          moldCode: log.mold?.code})),
        ...downtimeLogsRes.data.map((log: any) => ({
          ...log,
          emailType: 'downtime_notification' as const,
          downtimeId: log.downtimeId,
          downtimeReason: log.downtime?.reason,
          productionOrderNumber: log.productionOrder?.orderNumber,
          defectName: log.defect?.name,
          sectorNames: log.sectorNames})),
      ];

      // Ordenar por data (mais recentes primeiro)
      allEmails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      setEmails(allEmails);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar e-mails', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtros e estatísticas
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        !searchText ||
        email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        email.recipients.toLowerCase().includes(searchText.toLowerCase()) ||
        (email.moldCode && email.moldCode.toLowerCase().includes(searchText.toLowerCase())) ||
        (email.productionOrderNumber && email.productionOrderNumber.toLowerCase().includes(searchText.toLowerCase())) ||
        (email.defectName && email.defectName.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus =
        !filterStatus ||
        (filterStatus === 'success' ? email.success : !email.success);

      const matchesType =
        !filterType || email.emailType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [emails, searchText, filterStatus, filterType]);

  const stats = useMemo(() => {
    const last24h = emails.filter(
      (e) => moment(e.sentAt).isAfter(moment().subtract(24, 'hours'))
    ).length;

    return {
      total: emails.length,
      success: emails.filter((e) => e.success).length,
      failed: emails.filter((e) => !e.success).length,
      last24h};
  }, [emails]);

  const handleViewEmail = (email: EmailLog) => {
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmail(null);
  };

  const getEmailTypeLabel = (type?: string) => {
    switch (type) {
      case 'maintenance_alert':
        return 'Alerta de Manutenção';
      case 'downtime_notification':
        return 'Notificação de Parada';
      default:
        return 'Outros';
    }
  };

  const getEmailTypeColor = (type?: string) => {
    switch (type) {
      case 'maintenance_alert':
        return 'warning';
      case 'downtime_notification':
        return 'error';
      default:
        return 'info';
    }
  };

  const getEmailTypeIcon = (type?: string) => {
    switch (type) {
      case 'maintenance_alert':
        return <AlertIcon sx={{ fontSize: 16 }} />;
      case 'downtime_notification':
        return <WarningIcon sx={{ fontSize: 16 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<EmailIcon />}
        title="Central de E-mails"
        subtitle="Visualização consolidada de todos os e-mails enviados pelo sistema"
        iconGradient="linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de E-mails"
            value={stats.total}
            subtitle="Enviados pelo sistema"
            icon={<EmailIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Enviados com Sucesso"
            value={stats.success}
            subtitle={`${((stats.success / stats.total) * 100 || 0).toFixed(0)}% de sucesso`}
            icon={<SuccessIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Falhas no Envio"
            value={stats.failed}
            subtitle="Precisam atenção"
            icon={<ErrorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Últimas 24h"
            value={stats.last24h}
            subtitle="Enviados recentemente"
            icon={<SendIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Busca e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            placeholder="Buscar por assunto, destinatário, molde, ordem, defeito..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )}}
          >
            <MenuItem value="">Todos Status</MenuItem>
            <MenuItem value="success">Sucesso</MenuItem>
            <MenuItem value="failed">Falha</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )}}
          >
            <MenuItem value="">Todos os Tipos</MenuItem>
            <MenuItem value="maintenance_alert">Alertas de Manutenção</MenuItem>
            <MenuItem value="downtime_notification">Notificações de Parada</MenuItem>
            <MenuItem value="other">Outros</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadEmails}
            sx={{ minWidth: 120 }}
          >
            Atualizar
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de E-mails */}
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
                Data/Hora
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Tipo
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Assunto
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Destinatários
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando e-mails...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredEmails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <EmailIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {searchText || filterStatus || filterType
                      ? 'Nenhum e-mail encontrado'
                      : 'Nenhum e-mail enviado ainda'}
                  </Typography>
                  <Typography color="text.secondary">
                    {searchText || filterStatus || filterType
                      ? 'Tente ajustar os filtros'
                      : 'Os e-mails enviados pelo sistema aparecerão aqui'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmails.map((email) => (
                <TableRow
                  key={email.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {moment(email.sentAt).format('DD/MM/YYYY')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {moment(email.sentAt).format('HH:mm:ss')}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getEmailTypeLabel(email.emailType)}
                      size="small"
                      color={getEmailTypeColor(email.emailType) as any}
                      icon={getEmailTypeIcon(email.emailType)}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={email.subject}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'}}
                      >
                        {email.subject}
                      </Typography>
                    </Tooltip>
                    {email.moldCode && (
                      <Typography variant="caption" color="text.secondary">
                        Molde: {email.moldCode}
                      </Typography>
                    )}
                    {email.productionOrderNumber && (
                      <Typography variant="caption" color="text.secondary">
                        OP: {email.productionOrderNumber}
                      </Typography>
                    )}
                    {email.defectName && (
                      <Typography variant="caption" color="text.secondary">
                        Defeito: {email.defectName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={email.recipients}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'}}
                      >
                        {email.recipients.split(',').length > 1
                          ? `${email.recipients.split(',')[0].trim()} +${
                              email.recipients.split(',').length - 1
                            }`
                          : email.recipients}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {email.success ? (
                      <Chip
                        label="Enviado"
                        size="small"
                        color="success"
                        icon={<SuccessIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Tooltip title={email.error || 'Erro desconhecido'}>
                        <Chip
                          label="Falha"
                          size="small"
                          color="error"
                          icon={<ErrorIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewEmail(email)}
                      title="Ver detalhes"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)}}}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Detalhes do E-mail */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2}}}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
              theme.palette.primary.dark,
              0.9
            )} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5}}
        >
          <Box
            sx={{
              backgroundColor: alpha('#fff', 0.2),
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'}}
          >
            <EmailIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Detalhes do E-mail
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {selectedEmail && moment(selectedEmail.sentAt).format('DD/MM/YYYY HH:mm:ss')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedEmail && (
            <Grid container spacing={2.5}>
              {/* Status */}
              <Grid item xs={12}>
                {selectedEmail.success ? (
                  <Alert severity="success" icon={<SuccessIcon />}>
                    E-mail enviado com sucesso!
                  </Alert>
                ) : (
                  <Alert severity="error" icon={<ErrorIcon />}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Falha no envio
                    </Typography>
                    <Typography variant="caption">{selectedEmail.error || 'Erro desconhecido'}</Typography>
                  </Alert>
                )}
              </Grid>

              {/* Tipo */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                  Tipo de E-mail
                </Typography>
                <Chip
                  label={getEmailTypeLabel(selectedEmail.emailType)}
                  color={getEmailTypeColor(selectedEmail.emailType) as any}
                  icon={getEmailTypeIcon(selectedEmail.emailType)}
                />
              </Grid>

              {/* Assunto */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                  Assunto
                </Typography>
                <Typography variant="body2">{selectedEmail.subject}</Typography>
              </Grid>

              {/* Destinatários */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                  Destinatários ({selectedEmail.recipients.split(',').length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedEmail.recipients.split(',').map((email, idx) => (
                    <Chip key={idx} label={email.trim()} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Grid>

              {/* Conteúdo */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                  Conteúdo
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.grey[500], 0.05),
                    borderRadius: 2,
                    maxHeight: 300,
                    overflow: 'auto'}}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                    style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
                  />
                </Paper>
              </Grid>

              {/* Informações Adicionais */}
              {(selectedEmail.moldCode || selectedEmail.productionOrderNumber || selectedEmail.defectName || selectedEmail.sectorNames) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
                    Informações Adicionais
                  </Typography>
                  {selectedEmail.moldCode && (
                    <Typography variant="body2">
                      <strong>Molde:</strong> {selectedEmail.moldCode}
                    </Typography>
                  )}
                  {selectedEmail.productionOrderNumber && (
                    <Typography variant="body2">
                      <strong>Ordem de Produção:</strong> {selectedEmail.productionOrderNumber}
                    </Typography>
                  )}
                  {selectedEmail.defectName && (
                    <Typography variant="body2">
                      <strong>Defeito:</strong> {selectedEmail.defectName}
                    </Typography>
                  )}
                  {selectedEmail.downtimeReason && (
                    <Typography variant="body2">
                      <strong>Motivo da Parada:</strong> {selectedEmail.downtimeReason}
                    </Typography>
                  )}
                  {selectedEmail.sectorNames && (
                    <Typography variant="body2">
                      <strong>Setores Notificados:</strong> {selectedEmail.sectorNames}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined" size="large">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

