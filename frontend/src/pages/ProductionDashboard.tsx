/**
 * Dashboard de Produção - Painel de Controle da Ordem em Operação
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Settings as SetupIcon,
  Loop as CicloIcon,
  Warning as PerdaIcon,
  PauseCircle as ParadaIcon,
  Assessment as ResumoIcon,
  Speed as SpeedIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  InfoOutlined as InfoIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { ProductionOrder } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProductionLossModal from '../components/ProductionLossModal';

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  status?: string;
  statusColor?: 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  icon, 
  title, 
  status, 
  statusColor = 'info', 
  onClick, 
  disabled = false,
  disabledMessage = 'Bloqueado'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s',
        opacity: disabled ? 0.5 : 1,
        '&:hover': {
          transform: isMobile || disabled ? 'none' : 'translateY(-4px)',
          boxShadow: isMobile || disabled ? 3 : 6,
        },
      }}
    >
      <CardActionArea 
        onClick={disabled ? undefined : onClick} 
        disabled={disabled}
        sx={{ height: '100%', p: isMobile ? 1.5 : 2 }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight={isMobile ? 120 : 160}
        >
          <Box
            sx={{
              width: isMobile ? 48 : 64,
              height: isMobile ? 48 : 64,
              borderRadius: 2,
              background: disabled 
                ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                : `linear-gradient(135deg, ${getIconColor(title)} 0%, ${getIconColorDark(title)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: isMobile ? 1 : 2,
              boxShadow: 3,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: isMobile ? 28 : 36, color: 'white' }
            })}
          </Box>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: isMobile ? '0.875rem' : '1.25rem',
              fontWeight: 600,
              lineHeight: 1.2,
              color: disabled ? 'text.disabled' : 'text.primary',
            }}
          >
            {title}
          </Typography>
          {disabled ? (
            <Chip 
              label={disabledMessage} 
              color="default"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                mt: 0.5,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.7rem' : '0.875rem',
              }} 
            />
          ) : status && (
            <Chip 
              label={status} 
              color={statusColor}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                mt: 0.5,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.7rem' : '0.875rem',
              }} 
            />
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
};

// Helper para cores dos ícones
const getIconColor = (title: string): string => {
  switch (title) {
    case 'Configuração Setup':
      return '#2196f3';
    case 'Ciclo':
      return '#00bcd4';
    case 'Apontamento Perda':
      return '#ff9800';
    case 'Parada de Produção':
      return '#4caf50';
    case 'Resumo da Ordem':
      return '#8bc34a';
    default:
      return '#1976d2';
  }
};

const getIconColorDark = (title: string): string => {
  switch (title) {
    case 'Configuração Setup':
      return '#1565c0';
    case 'Ciclo':
      return '#0097a7';
    case 'Apontamento Perda':
      return '#f57c00';
    case 'Parada de Produção':
      return '#2e7d32';
    case 'Resumo da Ordem':
      return '#689f38';
    default:
      return '#0d47a1';
  }
};

interface ActiveSetup {
  id: number;
  startTime: string;
  endTime?: string | null;
  description: string;
  responsible: {
    id: number;
    name: string;
    email: string;
  };
}

interface ActivityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE' | 'PLANNED';
  color: string | null;
  active: boolean;
}

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orderData, setOrderData] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [cavities, setCavities] = useState<string>('');
  const [startingSetup, setStartingSetup] = useState(false);
  const [finishingSetup, setFinishingSetup] = useState(false);
  const [activeSetup, setActiveSetup] = useState<ActiveSetup | null>(null);
  const [hasFinishedSetup, setHasFinishedSetup] = useState(false);
  
  // Estados para atualização automática
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para Alteração de Ciclo
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [cycleHistory, setCycleHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cycleData, setCycleData] = useState({
    newCycle: '',
    reason: '',
  });
  const [savingCycle, setSavingCycle] = useState(false);
  
  // Estado para Apontamento de Perda
  const [lossModalOpen, setLossModalOpen] = useState(false);
  
  // Estados para Início de Produção
  const [startProductionDialogOpen, setStartProductionDialogOpen] = useState(false);
  const [startingProduction, setStartingProduction] = useState(false);
  
  // Estados para Parada de Produção
  const [stopProductionDialogOpen, setStopProductionDialogOpen] = useState(false);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [stopData, setStopData] = useState({
    activityTypeId: '',
    startTime: '',
  });
  const [registeringStop, setRegisteringStop] = useState(false);
  
  // Estados para Retomada de Produção
  const [resumeProductionDialogOpen, setResumeProductionDialogOpen] = useState(false);
  const [resumingProduction, setResumingProduction] = useState(false);

  const loadOrderData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (!showRefreshIndicator) {
        setLoading(true);
      }
      
      const response = await api.get<ProductionOrder>(`/production-orders/${orderId}`);
      setOrderData(response.data);
      setLastUpdate(new Date());
      
      // Carregar setup ativo se existir
      await loadActiveSetup();
    } catch (error) {
      console.error('Erro ao carregar ordem:', error);
      if (!showRefreshIndicator) {
        enqueueSnackbar('Erro ao carregar dados da ordem', { variant: 'error' });
        navigate('/injectors');
      }
    } finally {
      if (!showRefreshIndicator) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, enqueueSnackbar, navigate]);

  useEffect(() => {
    if (orderId) {
      loadOrderData();
      loadActivityTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Auto-refresh effect
  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Configurar novo intervalo se auto-refresh estiver ativo
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadOrderData(true);
      }, refreshInterval * 1000);
    }

    // Cleanup ao desmontar ou quando dependências mudarem
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, loadOrderData]);

  const handleRefreshIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Permitir campo vazio
    if (inputValue === '') {
      setRefreshInterval(0);
      return;
    }
    
    const value = parseInt(inputValue);
    // Aceitar qualquer número válido (a validação mínima é feita no useEffect)
    if (!isNaN(value) && value >= 0) {
      setRefreshInterval(value);
    }
  };

  const handleAutoRefreshToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoRefresh(event.target.checked);
  };

  const loadActivityTypes = async () => {
    try {
      const response = await api.get('/activity-types');
      setActivityTypes(response.data.filter((at: ActivityType) => at.active));
    } catch (error) {
      console.error('Erro ao carregar tipos de atividade:', error);
      setActivityTypes([]);
    }
  };

  const loadActiveSetup = async () => {
    try {
      const response = await api.get(`/downtimes/active-setup`, {
        params: { productionOrderId: orderId },
      });
      setActiveSetup(response.data);
      
      // Se não tem setup ativo, verificar se tem setup finalizado recentemente
      if (!response.data) {
        await checkFinishedSetup();
      } else {
        setHasFinishedSetup(false);
      }
    } catch (error) {
      console.error('Erro ao carregar setup ativo:', error);
      setActiveSetup(null);
      await checkFinishedSetup();
    }
  };

  const checkFinishedSetup = async () => {
    try {
      const response = await api.get(`/downtimes`, {
        params: { 
          productionOrderId: orderId,
          reason: 'Setup de Molde'
        },
      });
      
      // Verificar se existe algum setup finalizado (com endTime)
      if (response.data && response.data.length > 0) {
        const lastSetup = response.data[0]; // Primeiro item (mais recente)
        setHasFinishedSetup(!!lastSetup.endTime);
      } else {
        setHasFinishedSetup(false);
      }
    } catch (error) {
      console.error('Erro ao verificar setup finalizado:', error);
      setHasFinishedSetup(false);
    }
  };

  const handleCardClick = (cardName: string) => {
    console.log(`Card clicado: ${cardName}`);
    
    if (cardName === 'Setup') {
      setSetupDialogOpen(true);
      // Sempre mostrar as cavidades ativas do molde cadastrado (readonly)
      if (orderData?.mold?.activeCavities || orderData?.mold?.cavities) {
        const cavitiesToShow = orderData.mold.activeCavities || orderData.mold.cavities;
        setCavities(cavitiesToShow.toString());
      } else {
        setCavities('');
      }
    } else if (cardName === 'Ciclo') {
      setCycleDialogOpen(true);
      loadCycleHistory();
    } else if (cardName === 'Perda') {
      setLossModalOpen(true);
    } else if (cardName === 'Parada') {
      // Se a ordem está ACTIVE, abrir modal de parada
      // Se a ordem está PAUSED, abrir modal de retomada
      // Se a ordem está em PROGRAMMING ou não foi iniciada, abrir modal de início de produção
      if (orderData?.status === 'ACTIVE') {
        handleOpenStopDialog();
      } else if (orderData?.status === 'PAUSED') {
        setResumeProductionDialogOpen(true);
      } else if (orderData?.status === 'PROGRAMMING' || !orderData?.startDate) {
        setStartProductionDialogOpen(true);
      }
    } else if (cardName === 'Resumo') {
      // Navegar para a página de Resumo da Ordem
      navigate(`/order-summary/${orderId}`);
    }
  };

  const handleOpenStopDialog = () => {
    // Preencher a data/hora atual do sistema
    const now = new Date();
    
    // Formatar para datetime-local (yyyy-MM-ddTHH:mm)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setStopData({
      activityTypeId: '',
      startTime: formattedTime,
    });
    setStopProductionDialogOpen(true);
  };

  const handleCloseSetupDialog = () => {
    setSetupDialogOpen(false);
    setCavities('');
  };

  const loadCycleHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/cycle-changes/history/${orderId}`);
      setCycleHistory(response.data.changes || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de ciclo:', error);
      setCycleHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseCycleDialog = () => {
    setCycleDialogOpen(false);
    setCycleData({ newCycle: '', reason: '' });
  };

  const handleCycleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCycleData({
      ...cycleData,
      [field]: event.target.value,
    });
  };

  const handleSaveCycle = async () => {
    if (!cycleData.newCycle || !cycleData.reason) {
      enqueueSnackbar('Preencha todos os campos', { variant: 'warning' });
      return;
    }

    if (orderData?.status !== 'PAUSED') {
      enqueueSnackbar('A ordem deve estar PAUSADA para registrar alteração de ciclo', { variant: 'error' });
      return;
    }

    try {
      setSavingCycle(true);

      await api.post('/cycle-changes', {
        productionOrderId: parseInt(orderId!),
        newCycle: parseFloat(cycleData.newCycle),
        reason: cycleData.reason,
        userId: user?.id || null,
      });

      enqueueSnackbar('Alteração de ciclo registrada com sucesso!', { variant: 'success' });
      // Limpar formulário mas manter dialog aberto
      setCycleData({ newCycle: '', reason: '' });
      // Recarregar histórico
      await loadCycleHistory();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao registrar alteração de ciclo';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSavingCycle(false);
    }
  };

  const handleStartSetup = async () => {
    if (!orderId) {
      enqueueSnackbar('ID da ordem não encontrado', { variant: 'error' });
      return;
    }

    try {
      setStartingSetup(true);
      
      await api.post('/downtimes/start-setup', {
        productionOrderId: parseInt(orderId),
        // Cavidades são obtidas automaticamente do molde no backend
      });

      enqueueSnackbar('Setup iniciado com sucesso!', { variant: 'success' });
      handleCloseSetupDialog();
      
      // Recarregar dados da ordem e setup ativo
      await loadOrderData();
    } catch (error: any) {
      console.error('Erro ao iniciar setup:', error);
      const message = error.response?.data?.error || 'Erro ao iniciar setup';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setStartingSetup(false);
    }
  };

  const handleFinishSetup = async () => {
    if (!activeSetup) {
      enqueueSnackbar('Nenhum setup ativo encontrado', { variant: 'error' });
      return;
    }

    try {
      setFinishingSetup(true);
      
      // Criar data no horário de Brasília
      const now = new Date();
      const brasiliaOffset = -3 * 60; // UTC-3 em minutos
      const localOffset = now.getTimezoneOffset(); // Offset local em minutos
      const diffMinutes = brasiliaOffset - localOffset;
      const brasiliaTime = new Date(now.getTime() + (diffMinutes * 60 * 1000));
      
      await api.patch(`/downtimes/${activeSetup.id}/end`, {
        endTime: brasiliaTime.toISOString(),
      });

      enqueueSnackbar('Setup finalizado com sucesso!', { variant: 'success' });
      handleCloseSetupDialog();
      
      // Recarregar dados da ordem
      await loadOrderData();
    } catch (error: any) {
      console.error('Erro ao finalizar setup:', error);
      const message = error.response?.data?.error || 'Erro ao finalizar setup';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setFinishingSetup(false);
    }
  };

  const handleStartProduction = async () => {
    if (!orderId) {
      enqueueSnackbar('ID da ordem não encontrado', { variant: 'error' });
      return;
    }

    try {
      setStartingProduction(true);
      
      await api.post(`/production-orders/${orderId}/start-production`);

      enqueueSnackbar('Produção iniciada com sucesso!', { variant: 'success' });
      setStartProductionDialogOpen(false);
      
      // Recarregar dados da ordem
      await loadOrderData();
    } catch (error: any) {
      console.error('Erro ao iniciar produção:', error);
      const message = error.response?.data?.error || 'Erro ao iniciar produção';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setStartingProduction(false);
    }
  };

  const handleRegisterStop = async () => {
    if (!stopData.activityTypeId || !stopData.startTime) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
      return;
    }

    try {
      setRegisteringStop(true);
      
      await api.post('/downtimes/register-stop', {
        productionOrderId: parseInt(orderId!),
        activityTypeId: parseInt(stopData.activityTypeId),
        startTime: new Date(stopData.startTime).toISOString(),
      });

      enqueueSnackbar('Parada registrada com sucesso!', { variant: 'success' });
      setStopProductionDialogOpen(false);
      
      // Recarregar dados da ordem
      await loadOrderData();
    } catch (error: any) {
      console.error('Erro ao registrar parada:', error);
      const message = error.response?.data?.error || 'Erro ao registrar parada';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setRegisteringStop(false);
    }
  };

  const handleResumeProduction = async () => {
    if (!orderId) {
      enqueueSnackbar('ID da ordem não encontrado', { variant: 'error' });
      return;
    }

    try {
      setResumingProduction(true);
      
      await api.post('/downtimes/resume-production', {
        productionOrderId: parseInt(orderId),
      });

      enqueueSnackbar('Produção retomada com sucesso!', { variant: 'success' });
      setResumeProductionDialogOpen(false);
      
      // Recarregar dados da ordem
      await loadOrderData();
    } catch (error: any) {
      console.error('Erro ao retomar produção:', error);
      const message = error.response?.data?.error || 'Erro ao retomar produção';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setResumingProduction(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!orderData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">
          Ordem não encontrada
        </Typography>
      </Box>
    );
  }

  const hasActiveSetup = activeSetup !== null;
  const inOperation = orderData.status === 'ACTIVE';
  const isPaused = orderData.status === 'PAUSED';

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<SpeedIcon />}
        title="Dashboard Produção"
        subtitle={`Ordem ${orderData?.orderNumber || ''} - ${orderData?.item?.name || ''}`}
        iconGradient="linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)"
        breadcrumbs={[
          { label: 'Injetoras', path: '/injectors' },
          { label: 'Painel Ordem', path: `/injectors/${orderData.plcConfigId}/orders` },
          { label: 'Dashboard Produção' },
        ]}
      />

      {/* Informações principais da ordem */}
      <Grid container spacing={isMobile ? 2 : 3} mb={isMobile ? 3 : 4}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: isMobile ? 2 : 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '2px solid #1976d2',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: isMobile ? '120px' : '150px',
            }}
          >
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              fontWeight="bold" 
              color="primary" 
              gutterBottom
              sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            >
              {orderData.orderNumber}
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
              Ordem de Produção
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: isMobile ? 2 : 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '2px solid #1976d2',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: isMobile ? '120px' : '150px',
            }}
          >
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '1rem' : '1.25rem',
                lineHeight: 1.3,
              }}
            >
              {orderData.item?.name || 'Produto não especificado'}
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
              Referência do Produto
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controles de Atualização Automática */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1, sm: 1.25 }, 
          mb: isMobile ? 2 : 3, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: { xs: 1, sm: 1.5 },
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 1.5,
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: { xs: 1, sm: 1.5 }, alignItems: isMobile ? 'stretch' : 'center', flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={handleAutoRefreshToggle}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 500,
                color: 'text.secondary'
              }}>
                Auto-refresh
              </Typography>
            }
            sx={{ m: 0 }}
          />
          
          <Tooltip title="Intervalo mínimo: 5 segundos">
            <TextField
              label="Intervalo (seg)"
              type="number"
              value={refreshInterval}
              onChange={handleRefreshIntervalChange}
              disabled={!autoRefresh}
              size="small"
              inputProps={{ min: 5, step: 5 }}
              sx={{ 
                width: isMobile ? '100%' : 130,
                '& .MuiInputBase-root': {
                  fontSize: '0.8rem',
                  height: 32
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem'
                }
              }}
            />
          </Tooltip>
        </Box>

        <Typography variant="caption" sx={{ 
          color: 'text.secondary',
          textAlign: isMobile ? 'left' : 'right',
          fontSize: { xs: '0.65rem', sm: '0.7rem' },
          opacity: 0.6
        }}>
          Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
        </Typography>
      </Paper>

      {/* Cards de status e ações */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Configuração Setup */}
        <Grid item xs={6} sm={6} md={4}>
          <StatusCard
            icon={<SetupIcon />}
            title="Configuração Setup"
            status={
              hasActiveSetup 
                ? 'Aguardando Finalização' 
                : (hasFinishedSetup ? 'Setup Finalizado' : 'Em Setup')
            }
            statusColor={
              hasActiveSetup 
                ? 'warning' 
                : (hasFinishedSetup ? 'success' : 'info')
            }
            onClick={() => handleCardClick('Setup')}
          />
        </Grid>

        {/* Ciclo */}
        <Grid item xs={6} sm={6} md={4}>
          <StatusCard
            icon={<CicloIcon />}
            title="Ciclo"
            onClick={() => handleCardClick('Ciclo')}
          />
        </Grid>

        {/* Apontamento Perda */}
        <Grid item xs={6} sm={6} md={4}>
          <StatusCard
            icon={<PerdaIcon />}
            title="Apontamento Perda"
            onClick={() => handleCardClick('Perda')}
            disabled={!hasFinishedSetup}
            disabledMessage="Finalizar Setup Primeiro"
          />
        </Grid>

        {/* Parada de Produção */}
        <Grid item xs={6} sm={6} md={4}>
          <StatusCard
            icon={<ParadaIcon />}
            title={
              orderData?.status === 'PROGRAMMING' || !orderData?.startDate
                ? 'Início de Produção' 
                : 'Parada de Produção'
            }
            status={
              orderData?.status === 'PROGRAMMING' || !orderData?.startDate
                ? 'Aguardando Início' 
                : (inOperation ? 'Ordem em Operação!' : (isPaused ? 'Ordem Parada' : 'Parada'))
            }
            statusColor={
              orderData?.status === 'PROGRAMMING' || !orderData?.startDate
                ? 'warning' 
                : (inOperation ? 'success' : 'error')
            }
            onClick={() => handleCardClick('Parada')}
            disabled={!hasFinishedSetup}
            disabledMessage="Finalizar Setup Primeiro"
          />
        </Grid>

        {/* Resumo da Ordem */}
        <Grid item xs={12} sm={6} md={4}>
          <StatusCard
            icon={<ResumoIcon />}
            title="Resumo da Ordem"
            onClick={() => handleCardClick('Resumo')}
          />
        </Grid>
      </Grid>

      {/* Dialog de Setup */}
      <Dialog
        open={setupDialogOpen}
        onClose={handleCloseSetupDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: isMobile ? 1.5 : 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">
              Setup Ordem
            </Typography>
            <IconButton
              edge="end"
              onClick={handleCloseSetupDialog}
              aria-label="close"
              size={isMobile ? "small" : "medium"}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
          <Box display="flex" flexDirection="column" gap={isMobile ? 2 : 3}>
            {/* Alerta se já tem setup ativo */}
            {hasActiveSetup && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#fff3cd',
                  borderRadius: 1,
                  border: '1px solid #ffc107',
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="#856404">
                  ⚠️ Setup em andamento
                </Typography>
                <Typography variant="caption" color="#856404">
                  Iniciado por: {activeSetup?.responsible?.name}
                </Typography>
                <br />
                <Typography variant="caption" color="#856404">
                  Início: {activeSetup?.startTime ? new Date(activeSetup.startTime).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : '-'}
                </Typography>
              </Box>
            )}

            {/* Alerta se setup foi finalizado */}
            {!hasActiveSetup && hasFinishedSetup && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#d4edda',
                  borderRadius: 1,
                  border: '1px solid #28a745',
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="#155724">
                  ✅ Setup finalizado
                </Typography>
                <Typography variant="caption" color="#155724">
                  O setup desta ordem já foi concluído com sucesso.
                </Typography>
              </Box>
            )}

            {/* Campo Ordem (apenas visualização) */}
            <TextField
              label="Ordem"
              value={orderData?.orderNumber || ''}
              fullWidth
              disabled
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />

            {/* Campo Cavidade Molde - SEMPRE BLOQUEADO */}
            <TextField
              label="Cavidades Ativas"
              type="number"
              value={cavities || (orderData?.mold?.activeCavities ? orderData.mold.activeCavities.toString() : (orderData?.mold?.cavities ? orderData.mold.cavities.toString() : ''))}
              fullWidth
              disabled // SEMPRE DESABILITADO
              InputProps={{
                readOnly: true,
              }}
              placeholder="-"
              helperText={
                hasActiveSetup
                  ? 'Setup já iniciado - alteração deve ser feita no cadastro de moldes'
                  : 'Alteração deve ser feita no cadastro de moldes'
              }
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: isMobile ? 1.5 : 2, 
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row',
            '& > button': {
              width: isMobile ? '100%' : 'auto',
            }
          }}
        >
          {/* Botão Finalizar Setup - só aparece se TEM setup ativo */}
          {hasActiveSetup && (
            <Button
              onClick={handleFinishSetup}
              variant="contained"
              color="success"
              disabled={finishingSetup}
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : 140, order: isMobile ? 1 : 2 }}
            >
              {finishingSetup ? 'Finalizando...' : 'Finalizar Setup'}
            </Button>
          )}
          
          {/* Botão Inicia Setup - só aparece se NÃO tem setup ativo E NÃO tem setup finalizado */}
          {!hasActiveSetup && !hasFinishedSetup && (
            <Button
              onClick={handleStartSetup}
              variant="contained"
              color="primary"
              disabled={startingSetup}
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : 120, order: isMobile ? 1 : 2 }}
            >
              {startingSetup ? 'Iniciando...' : 'Inicia Setup'}
            </Button>
          )}
          
          <Button
            onClick={handleCloseSetupDialog}
            variant="outlined"
            color="inherit"
            disabled={startingSetup || finishingSetup}
            fullWidth={isMobile}
            sx={{ order: isMobile ? 2 : 1 }}
          >
            {(hasActiveSetup || hasFinishedSetup) ? 'Fechar' : 'Cancelar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Alteração de Ciclo */}
      <Dialog
        open={cycleDialogOpen}
        onClose={handleCloseCycleDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: isMobile ? 1.5 : 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">
              Alteração de Ciclo
            </Typography>
            <IconButton
              edge="end"
              onClick={handleCloseCycleDialog}
              aria-label="close"
              size={isMobile ? "small" : "medium"}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
          <Box display="flex" flexDirection="column" gap={isMobile ? 2 : 3}>
            {/* Histórico de Alterações */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Histórico de Alterações
              </Typography>
              
              {loadingHistory ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress size={30} />
                </Box>
              ) : cycleHistory.length === 0 ? (
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma alteração de ciclo registrada ainda
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: isMobile ? 300 : 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Data/Hora</strong></TableCell>
                        <TableCell align="right"><strong>Ciclo Anterior</strong></TableCell>
                        <TableCell align="right"><strong>Novo Ciclo</strong></TableCell>
                        <TableCell><strong>Motivo</strong></TableCell>
                        <TableCell><strong>Usuário</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cycleHistory.map((change: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', whiteSpace: 'nowrap' }}>
                            {new Date(change.timestamp).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                            {change.previousCycle ? `${change.previousCycle}s` : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                            <strong>{change.newCycle}s</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', maxWidth: 200 }}>
                            {change.reason}
                          </TableCell>
                          <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', whiteSpace: 'nowrap' }}>
                            {change.user?.name || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Nova Alteração */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Nova Alteração
            </Typography>

            {/* Alerta se ordem não estiver pausada */}
            {orderData?.status !== 'PAUSED' && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f8d7da',
                  borderRadius: 1,
                  border: '1px solid #f5c6cb',
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="#721c24">
                  ⚠️ Atenção!
                </Typography>
                <Typography variant="caption" color="#721c24">
                  A ordem deve estar <strong>PAUSADA</strong> para registrar alteração de ciclo.
                </Typography>
              </Box>
            )}

            {/* Campo Ordem (apenas visualização) */}
            <TextField
              label="Ordem"
              value={orderData?.orderNumber || ''}
              fullWidth
              disabled
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />

            {/* Ciclo Atual */}
            {orderData?.mold?.cycleTime && (
              <TextField
                label="Ciclo Atual (segundos)"
                value={orderData.mold.cycleTime}
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            )}

            {/* Novo Ciclo */}
            <TextField
              label="Novo Ciclo (segundos) *"
              type="number"
              value={cycleData.newCycle}
              onChange={handleCycleChange('newCycle')}
              fullWidth
              inputProps={{ step: '0.1', min: '0' }}
              required
            />

            {/* Motivo */}
            <TextField
              label="Motivo da Alteração *"
              multiline
              rows={4}
              value={cycleData.reason}
              onChange={handleCycleChange('reason')}
              fullWidth
              required
              placeholder="Ex: Ajuste para melhorar qualidade, Alteração de processo, etc."
            />
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: isMobile ? 1.5 : 2, 
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row',
            '& > button': {
              width: isMobile ? '100%' : 'auto',
            }
          }}
        >
          <Button
            onClick={handleSaveCycle}
            variant="contained"
            color="primary"
            disabled={savingCycle || orderData?.status !== 'PAUSED'}
            fullWidth={isMobile}
            sx={{ minWidth: isMobile ? 'auto' : 140, order: isMobile ? 1 : 2 }}
          >
            {savingCycle ? 'Adicionando...' : 'Adicionar Registro'}
          </Button>
          
          <Button
            onClick={handleCloseCycleDialog}
            variant="outlined"
            color="inherit"
            disabled={savingCycle}
            fullWidth={isMobile}
            sx={{ order: isMobile ? 2 : 1 }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Início de Produção */}
      <Dialog
        open={startProductionDialogOpen}
        onClose={() => !startingProduction && setStartProductionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white', textAlign: 'center' }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h2">⚠️</Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Abertura de Apontamento
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1">
            Confirma abertura de apontamento de produção
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleStartProduction}
            variant="contained"
            color="primary"
            disabled={startingProduction}
            sx={{ minWidth: 140 }}
          >
            {startingProduction ? 'Iniciando...' : 'Inicia Operação'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Retomada de Produção */}
      <Dialog
        open={resumeProductionDialogOpen}
        onClose={() => !resumingProduction && setResumeProductionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
            color: 'white',
            py: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            },
          }}
        >
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={2}
            position="relative"
            zIndex={1}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <PlayIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Retomada de Produção
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                Confirmar retorno das atividades
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4, px: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
              Deseja retomar a produção?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Esta ação finalizará a parada atual e retomará as operações
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: 'success.200',
              background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(102, 187, 106, 0.08) 100%)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <CheckIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                Ações que serão executadas:
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 3.5, '& li': { mb: 0.5 } }}>
              <Typography component="li" variant="body2" color="text.secondary">
                A parada atual será <strong>finalizada automaticamente</strong>
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                A ordem retornará ao status <strong>ATIVO</strong>
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                A produção será <strong>retomada imediatamente</strong>
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, gap: 1.5, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setResumeProductionDialogOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={resumingProduction}
            sx={{ 
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResumeProduction}
            variant="contained"
            color="success"
            disabled={resumingProduction}
            startIcon={resumingProduction ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
            sx={{ 
              minWidth: 180,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
              },
            }}
          >
            {resumingProduction ? 'Retomando...' : 'Retomar Produção'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Parada de Produção */}
      <Dialog
        open={stopProductionDialogOpen}
        onClose={() => !registeringStop && setStopProductionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden',
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)',
            color: 'white',
            py: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2} flex={1}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <ParadaIcon sx={{ fontSize: 42, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Parada de Produção
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
                    Registrar interrupção das atividades
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => !registeringStop && setStopProductionDialogOpen(false)}
                disabled={registeringStop}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                  ml: 2,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: isMobile ? 2 : 3, pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Info Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.200',
                background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(3, 169, 244, 0.08) 100%)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <InfoIcon color="info" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700} color="info.dark">
                  Informação da Ordem
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Ordem:</strong> {orderData?.orderNumber || '—'}
              </Typography>
            </Box>

            {/* Tipo de Atividade */}
            <TextField
              select
              label="Atividade *"
              value={stopData.activityTypeId}
              onChange={(e) => setStopData({ ...stopData, activityTypeId: e.target.value })}
              fullWidth
              required
              disabled={registeringStop}
              helperText="Selecione o tipo de parada"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              {activityTypes.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {activity.color && (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: activity.color,
                          border: '2px solid',
                          borderColor: 'divider',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {activity.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.type === 'PRODUCTIVE' && 'Produtiva'}
                        {activity.type === 'UNPRODUCTIVE' && 'Improdutiva'}
                        {activity.type === 'PLANNED' && 'Planejada'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Início da Parada */}
            <TextField
              label="Início Parada *"
              type="datetime-local"
              value={stopData.startTime}
              onChange={(e) => setStopData({ ...stopData, startTime: e.target.value })}
              fullWidth
              required
              disabled={registeringStop}
              helperText="Data e hora do início da parada"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <EventIcon sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions 
          sx={{ 
            p: 2.5,
            gap: 1.5,
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            '& > button': {
              width: isMobile ? '100%' : 'auto',
            }
          }}
        >
          <Button
            onClick={() => setStopProductionDialogOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={registeringStop}
            fullWidth={isMobile}
            sx={{ 
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleRegisterStop}
            variant="contained"
            color="error"
            disabled={registeringStop}
            fullWidth={isMobile}
            startIcon={registeringStop ? <CircularProgress size={20} color="inherit" /> : <ParadaIcon />}
            sx={{ 
              minWidth: 180,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(198, 40, 40, 0.4)',
              },
            }}
          >
            {registeringStop ? 'Gravando...' : 'Gravar Registro'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Apontamento de Perda */}
      <ProductionLossModal 
        open={lossModalOpen}
        onClose={() => setLossModalOpen(false)}
        onSuccess={loadOrderData}
        productionOrderId={orderData?.id}
      />
    </Box>
  );
};

export default ProductionDashboard;

