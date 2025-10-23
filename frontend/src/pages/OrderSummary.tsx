import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalculateIcon from '@mui/icons-material/Calculate';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

interface OrderData {
  id: number;
  orderNumber: string;
  item: {
    name: string;
    code: string;
  };
  mold: {
    name: string;
    cavities: number;
    activeCavities?: number;
    cycleTime?: number;
  };
  plcConfig?: {
    id: number;
    name: string;
    timeDivisor: number;
  } | null;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  startDate: string | null;
  status: string;
  productionAppointments?: AppointmentDetail[];
}

interface ProductionStats {
  totalProduced: number;
  totalRejected: number;
  remaining: number;
  averageCycle: number;
  totalInjectionTime: string;
  completionPercentage: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  productivity: number; // peças por hora
  productionHours: number; // horas de produção
  qualityRate: number;
}

interface DailyProduction {
  date: string;
  quantity: number;
}

interface AppointmentDetail {
  id: number;
  timestamp: string;
  quantity: number;
  rejectedQuantity: number;
  automatic: boolean;
  clpCounterValue?: number;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  notes?: string;
}

interface Downtime {
  id: number;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE' | 'PLANNED';
  reason: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // em segundos
  activityType?: {
    name: string;
    type: string;
    color?: string;
  };
}

const OrderSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [dailyProduction, setDailyProduction] = useState<DailyProduction[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [downtimes, setDowntimes] = useState<Downtime[]>([]);
  
  // Estados para atualização automática
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(1);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estado para modal de apontamentos
  const [appointmentsModalOpen, setAppointmentsModalOpen] = useState(false);
  
  // Estado para modal de OEE
  const [oeeModalOpen, setOeeModalOpen] = useState(false);
  
  // Estado para modal de explicação de cálculo
  const [calculationModalOpen, setCalculationModalOpen] = useState(false);
  
  // Refs para scroll automático nas seções do modal OEE
  const availabilityRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const qualityRef = useRef<HTMLDivElement>(null);
  
  // Tamanho responsivo do gráfico circular
  const gaugeSize = isMobile ? 120 : isTablet ? 180 : 200;

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (!id) {
      setError('ID da ordem não fornecido');
      setLoading(false);
      return;
    }

    try {
      if (!showRefreshIndicator) {
      setLoading(true);
      }
      setError(null);

      console.log('🔍 Carregando ordem ID:', id);

      // Carregar dados da ordem (já inclui appointments)
      const orderResponse = await api.get(`/production-orders/${id}`);
      
      if (!orderResponse.data) {
        throw new Error('Dados da ordem não encontrados');
      }
      
      const orderWithAppointments = orderResponse.data;
      
      console.log('✅ Ordem carregada:', orderWithAppointments);
      
      // Verificar se tem item e mold
      if (!orderWithAppointments.item) {
        console.warn('⚠️ Ordem sem item vinculado');
      }
      if (!orderWithAppointments.mold) {
        console.warn('⚠️ Ordem sem molde vinculado');
      }
      
      setOrderData(orderWithAppointments);
      setLastUpdate(new Date());

      // Processar apontamentos
      if (orderWithAppointments.productionAppointments && Array.isArray(orderWithAppointments.productionAppointments)) {
        console.log(`📊 ${orderWithAppointments.productionAppointments.length} apontamentos encontrados`);
        setAppointments(orderWithAppointments.productionAppointments.slice(0, 50));
        
        // Calcular produção diária
        processeDailyProduction(orderWithAppointments.productionAppointments);
      } else {
        console.log('ℹ️ Nenhum apontamento encontrado');
        setAppointments([]);
        setDailyProduction([]);
      }

      // Carregar estatísticas
      loadStatistics(orderWithAppointments);

      // Carregar paradas (downtimes) da ordem
      try {
        const downtimesResponse = await api.get(`/downtimes?productionOrderId=${id}`);
        if (downtimesResponse.data && Array.isArray(downtimesResponse.data)) {
          console.log(`⏸️ ${downtimesResponse.data.length} paradas encontradas`);
          setDowntimes(downtimesResponse.data);
        } else {
          setDowntimes([]);
        }
      } catch (downtimeErr) {
        console.warn('⚠️ Erro ao carregar paradas:', downtimeErr);
        setDowntimes([]);
      }

      console.log('✨ Dados carregados com sucesso');

    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar dados da ordem';
      if (!showRefreshIndicator) {
      setError(errorMessage);
      }
    } finally {
      if (!showRefreshIndicator) {
      setLoading(false);
    }
    }
  }, [id]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        loadData(true);
      }, refreshInterval * 1000);
    }

    // Cleanup ao desmontar ou quando dependências mudarem
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, loadData]);

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

  // Função para abrir modal OEE e rolar até componente específico
  const openOeeModalAndScroll = (componentRef: React.RefObject<HTMLDivElement>) => {
    setOeeModalOpen(true);
    // Aguardar modal abrir antes de fazer scroll
    setTimeout(() => {
      if (componentRef.current) {
        componentRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 300); // Aguardar animação do modal
  };

  const loadStatistics = (order: OrderData) => {
    try {
      // ⚠️ ESTRUTURA PADRONIZADA:
      // - TODOS os apontamentos: clpCounterValue = peças
      // - quantity = tempo (auto: ciclo/divisor, manual: segundos direto)
      const appointments = order.productionAppointments || [];
      
      // Quantidade produzida = soma dos clpCounterValue (padronizado para auto + manual)
      const totalProduced = appointments.reduce((sum, apt) => sum + (apt.clpCounterValue || 0), 0);
      
      const totalRejected = order.rejectedQuantity || 0;
      const remaining = order.plannedQuantity - totalProduced - totalRejected; // Descontar perdas
      const completionPercentage = order.plannedQuantity > 0 
        ? (totalProduced / order.plannedQuantity) * 100 
        : 0;

      // Calcular tempo
      const timeDivisor = order.plcConfig?.timeDivisor || 10;
      let totalSeconds = 0;
      let automaticAppointments = 0;
      let manualAppointments = 0;
      
      appointments.forEach(apt => {
        if (apt.automatic) {
          // Automático: quantity = tempo de ciclo (convertido para segundos)
          totalSeconds += (apt.quantity || 0) / timeDivisor;
          automaticAppointments++;
        } else {
          // Manual: quantity = tempo já em segundos (padronizado)
          totalSeconds += apt.quantity || 0;
          manualAppointments++;
        }
      });
      
      const averageCycle = appointments.length > 0 ? totalSeconds / appointments.length : 0;
      
      // Tempo total de injeção
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const totalInjectionTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Cálculo dos KPIs de MES

      // Taxa de Qualidade (peças boas / total produzido)
      const qualityRate = totalProduced > 0 
        ? ((totalProduced - totalRejected) / totalProduced) * 100 
        : 100;
      
      // Qualidade para OEE (peças boas / peças totais)
      const totalPieces = totalProduced + totalRejected;
      const quality = totalPieces > 0 
        ? ((totalProduced) / totalPieces) * 100 
        : 100;

      // Performance (ciclo ideal / ciclo real)
      const idealCycleTime = order.mold?.cycleTime || averageCycle;
      const performance = idealCycleTime > 0 && averageCycle > 0
        ? Math.min((idealCycleTime / averageCycle) * 100, 100)
        : 100;

      // Disponibilidade - assumindo tempo de produção vs tempo total disponível
      // Como não temos dados de downtime aqui, usamos uma estimativa baseada no tempo real vs ideal
      const idealProductionTime = (totalProduced + totalRejected) * idealCycleTime;
      const availability = idealProductionTime > 0 && totalSeconds > 0
        ? Math.min((idealProductionTime / totalSeconds) * 100, 100)
        : 100;

      // OEE = Disponibilidade × Performance × Qualidade
      const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

      // Horas de produção
      const productionHours = totalSeconds > 0 ? totalSeconds / 3600 : 0;

      // Produtividade (peças por hora)
      const productivity = totalSeconds > 0 
        ? (totalProduced / totalSeconds) * 3600 
        : 0;

      setStats({
        totalProduced,
        totalRejected,
        remaining,
        averageCycle,
        totalInjectionTime,
        completionPercentage,
        oee,
        availability,
        performance,
        quality,
        productivity,
        productionHours,
        qualityRate,
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
    }
  };

  const processeDailyProduction = (appointments: any[]) => {
    try {
      // Agrupar por data - somar clpCounterValue (peças produzidas)
      const dailyMap = new Map<string, number>();
      appointments.forEach((apt: any) => {
        const date = new Date(apt.timestamp).toLocaleDateString('pt-BR');
        const current = dailyMap.get(date) || 0;
        dailyMap.set(date, current + (apt.clpCounterValue || 0));
      });

      const daily = Array.from(dailyMap.entries())
        .map(([date, quantity]) => ({ date, quantity }))
        .slice(-10); // Últimos 10 dias

      setDailyProduction(daily);
    } catch (err) {
      console.error('Erro ao processar produção diária:', err);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Ordem não encontrada'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, width: '100%', overflow: 'hidden' }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<AssessmentIcon />}
        title="Resumo da Ordem"
        subtitle={orderData ? `Ordem ${orderData.orderNumber} - ${orderData.item?.name}` : 'Visualização detalhada e indicadores'}
        iconGradient="linear-gradient(135deg, #5c6bc0 0%, #3f51b5 100%)"
        breadcrumbs={[
          { label: 'Dashboard Produção', path: `/production-dashboard/${id}` },
          { label: 'Resumo' },
        ]}
      />

      {/* Controles de Atualização Automática */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1, sm: 1.25 }, 
          mb: { xs: 1.5, md: 2 }, 
          mx: { xs: 2, sm: 2, md: 3 },
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

      {/* Informações Básicas - Aprimoradas */}
      <Paper sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 }, 
        mb: { xs: 1.5, md: 3 }, 
        mx: { xs: 2, sm: 2, md: 3 },
        borderRadius: 3,
        boxShadow: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 80, sm: 90, md: 100 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(63, 81, 181, 0.04)',
              border: '2px solid rgba(63, 81, 181, 0.15)',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)'
              }
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, 
                display: 'block', 
                lineHeight: 1.2, 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1
              }}>
                Ordem de Produção
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                color: '#3f51b5',
                letterSpacing: 0.5
              }}>
                {orderData?.orderNumber || '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 80, sm: 90, md: 100 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(0, 150, 136, 0.04)',
              border: '2px solid rgba(0, 150, 136, 0.15)',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: 'rgba(0, 150, 136, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)'
              }
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, 
                display: 'block', 
                lineHeight: 1.2, 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1
              }}>
                Cavidades
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                color: '#009688'
              }}>
                {orderData?.mold?.activeCavities || orderData?.mold?.cavities || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 80, sm: 90, md: 100 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(255, 152, 0, 0.04)',
              border: '2px solid rgba(255, 152, 0, 0.15)',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: 'rgba(255, 152, 0, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
              }
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, 
                display: 'block', 
                lineHeight: 1.2, 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1
              }}>
                Referência do Produto
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' }, 
                lineHeight: 1.3, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: '#ff9800',
                px: 1
              }}>
                {orderData?.item?.name || '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 1.5, sm: 2 },
              minHeight: { xs: 80, sm: 90, md: 100 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(156, 39, 176, 0.04)',
              border: '2px solid rgba(156, 39, 176, 0.15)',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: 'rgba(156, 39, 176, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)'
              }
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, 
                display: 'block', 
                lineHeight: 1.2, 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1
              }}>
                Molde
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' }, 
                lineHeight: 1.3, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: '#9c27b0',
                px: 1
              }}>
                {orderData?.mold?.name || '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ px: { xs: 2, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1.5, md: 3 }}>
          {/* Produção - Gauge Visual */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 3.5 }, 
              mb: { xs: 1.5, sm: 0 }, 
              borderRadius: 3, 
              boxShadow: { xs: 2, sm: 3 }, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' }, 
                mb: { xs: 1.5, sm: 2 }, 
                fontWeight: 700,
                color: '#1a237e'
              }}>
                Produção
              </Typography>
              
              {/* Gauge Circular Aprimorado */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: { xs: 2, md: 3 } }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  {/* Círculo de fundo com sombra */}
                  <Box sx={{
                    position: 'absolute',
                    width: gaugeSize + 10,
                    height: gaugeSize + 10,
                    borderRadius: '50%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    top: -5,
                    left: -5,
                    bgcolor: 'white'
                  }} />
                  
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={gaugeSize}
                    thickness={isMobile ? 6 : 10}
                    sx={{ color: '#e8eaf6' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(stats?.completionPercentage || 0, 100)}
                    size={gaugeSize}
                    thickness={isMobile ? 6 : 10}
                    sx={{
                      color: (stats?.completionPercentage || 0) >= 100 ? '#4caf50' : '#1976d2',
                      position: 'absolute',
                      left: 0,
                      filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3))',
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h3" component="div" color="text.primary" sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }, 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {(stats?.totalProduced || 0).toLocaleString('pt-BR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      fontWeight: 600,
                      mt: 0.5
                    }}>
                      produzidas
                    </Typography>
                  </Box>
                </Box>
              </Box>

            {/* Métricas de Produção - Aprimoradas */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mt: { xs: 0.5, md: 1 } }}>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(33, 150, 243, 0.04)',
                  border: '2px solid rgba(33, 150, 243, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, 
                    mt: 1,
                    color: '#1976d2'
                  }}>
                    {(orderData?.plannedQuantity || 0).toLocaleString('pt-BR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    planejado
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(244, 67, 54, 0.04)',
                  border: '2px solid rgba(244, 67, 54, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Perda
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    color: 'error.main', 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, 
                    mt: 1
                  }}>
                    {(stats?.totalRejected || 0).toLocaleString('pt-BR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    rejeitadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: stats && stats.remaining < 0 ? 'rgba(76, 175, 80, 0.04)' : 'rgba(255, 152, 0, 0.04)',
                  border: stats && stats.remaining < 0 ? '2px solid rgba(76, 175, 80, 0.1)' : '2px solid rgba(255, 152, 0, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: stats && stats.remaining < 0 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: stats && stats.remaining < 0 ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 4px 12px rgba(255, 152, 0, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Faltante
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 800,
                      color: stats && stats.remaining < 0 ? 'success.main' : 'warning.main',
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      mt: 1
                    }}
                  >
                    {(stats?.remaining || 0).toLocaleString('pt-BR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    para meta
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Peças por Hora - Centralizado */}
            <Box sx={{ mt: { xs: 2, md: 3 }, textAlign: 'center', bgcolor: '#f8f9fa', p: { xs: 1.5, md: 2 }, borderRadius: 2 }}>
              <Tooltip 
                title="Taxa de produção calculada dividindo o total de peças produzidas pelo tempo total de produção ativa (excluindo paradas)"
                arrow
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="caption" color="primary" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, display: 'block' }}>
                      Peças por Hora
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setCalculationModalOpen(true)}
                      sx={{ 
                        color: 'primary.main',
                        p: 0.5,
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' }
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
                    </IconButton>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.125rem' } }}>
                    {stats?.productivity ? Math.round(stats.productivity).toLocaleString('pt-BR') : '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem', md: '0.7rem' } }}>
                    Taxa média de produção
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: { xs: 1, md: 1.5 }, 
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      p: { xs: 0.75, md: 1 },
                      borderRadius: 1,
                      border: '1px dashed rgba(25, 118, 210, 0.3)',
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Cálculo:</Box>{' '}
                    {stats?.totalProduced.toLocaleString('pt-BR')} peças ÷ {stats?.productionHours.toFixed(2)} horas = {stats?.productivity ? Math.round(stats.productivity).toLocaleString('pt-BR') : '0'} peças/hora
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Produção Diária - Gráfico de Barras Aprimorado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 3.5 }, 
            mb: { xs: 1.5, sm: 0 }, 
            borderRadius: 3, 
            boxShadow: { xs: 2, sm: 3 }, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' }, 
              mb: { xs: 1.5, sm: 2 }, 
              fontWeight: 700,
              color: '#1a237e'
            }}>
              Produção Diária
            </Typography>
            
            <Box sx={{ 
              mt: { xs: 1.5, md: 2 }, 
              height: { xs: 120, sm: 250, md: 300 }, 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              px: { xs: 0.5, sm: 1 }
            }}>
              {dailyProduction.length > 0 ? (
                dailyProduction.map((day, index) => {
                  const maxQuantity = Math.max(...dailyProduction.map(d => d.quantity));
                  const heightPercentage = (day.quantity / maxQuantity) * 100;
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ 
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' }, 
                        lineHeight: 1, 
                        mb: 0.5,
                        fontWeight: 700,
                        color: '#1976d2'
                      }}>
                        {day.quantity.toLocaleString('pt-BR')}
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: `${heightPercentage}%`,
                          background: `linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)`,
                          borderRadius: { xs: 1, sm: 1.5 },
                          minHeight: { xs: 20, sm: 30 },
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        fontSize: { xs: '0.55rem', sm: '0.65rem', md: '0.7rem' }, 
                        writingMode: 'vertical-rl', 
                        transform: 'rotate(180deg)', 
                        mt: 0.5,
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}>
                        {day.date}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', fontWeight: 500 }}>
                  Sem dados de produção
                </Typography>
              )}
            </Box>

            {/* Métricas de Tempo - Aprimoradas */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mt: { xs: 1, md: 2 } }}>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(156, 39, 176, 0.04)',
                  border: '2px solid rgba(156, 39, 176, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Padrão
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, 
                    mt: 1,
                    color: '#9c27b0'
                  }}>
                    {orderData?.mold?.cycleTime || 0}s
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    ciclo ideal
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 150, 136, 0.04)',
                  border: '2px solid rgba(0, 150, 136, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 150, 136, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 150, 136, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Coletado
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, 
                    mt: 1,
                    color: '#009688'
                  }}>
                    {((appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0)) / (orderData?.plcConfig?.timeDivisor || 10)).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}s
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    tempo total
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(63, 81, 181, 0.04)',
                  border: '2px solid rgba(63, 81, 181, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(63, 81, 181, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.15)'
                  }
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, 
                    display: 'block', 
                    lineHeight: 1.3, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, 
                    mt: 1,
                    color: '#3f51b5'
                  }}>
                    {stats?.totalInjectionTime || '00:00:00'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5
                  }}>
                    (HH:MM:SS)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      </Box>

      {/* KPIs de Performance */}
      <Box sx={{ px: { xs: 2, sm: 2, md: 3 }, mt: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, mb: 2, fontWeight: 600 }}>
          Indicadores de Performance (OEE)
        </Typography>
        
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* OEE Global */}
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => setOeeModalOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <SpeedIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  OEE (clique para detalhes)
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats?.oee.toFixed(1) || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(stats?.oee || 0, 100)} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color={stats && stats.oee >= 85 ? 'success' : stats && stats.oee >= 60 ? 'warning' : 'error'}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Disponibilidade */}
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => openOeeModalAndScroll(availabilityRef)}
            >
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'success.main', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Disponibilidade (clique)
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats?.availability.toFixed(1) || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(stats?.availability || 0, 100)} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Performance */}
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => openOeeModalAndScroll(performanceRef)}
            >
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <SpeedIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'warning.main', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Performance (clique)
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats?.performance.toFixed(1) || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(stats?.performance || 0, 100)} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="warning"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Qualidade */}
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={3}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => openOeeModalAndScroll(qualityRef)}
            >
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <CheckCircleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'info.main', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Qualidade (clique)
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {stats?.quality.toFixed(1) || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(stats?.quality || 0, 100)} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="info"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Gráfico de Qualidade e Botão de Apontamentos */}
      <Box sx={{ px: { xs: 2, sm: 2, md: 3 }, mt: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Gráfico de Qualidade */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 2, boxShadow: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, fontWeight: 600 }}>
                Análise de Qualidade
              </Typography>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="h2" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                        {stats?.totalProduced || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Peças Aprovadas
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                        {stats?.qualityRate?.toFixed(1) || '100.0'}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="h2" fontWeight="bold" color="error.main" sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                        {stats?.totalRejected || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Peças Rejeitadas
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ mt: 1 }}>
                        {(100 - (stats?.qualityRate || 100)).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Apontamentos */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 2, boxShadow: { xs: 1, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ListAltIcon />}
                  onClick={() => setAppointmentsModalOpen(true)}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Ver Detalhes dos Apontamentos
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {appointments.length} apontamentos registrados
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Modal de Detalhes dos Apontamentos */}
      <Dialog
        open={appointmentsModalOpen}
        onClose={() => setAppointmentsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ListAltIcon />
          <Typography variant="h6" component="span">
            Detalhes dos Apontamentos
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: 'auto', p: { xs: 2, sm: 3 } }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '450px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Data/Hora
                </th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Tempo
                </th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '0.875rem', fontWeight: 600 }}>
                  Perda
                </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', fontSize: '0.875rem', fontWeight: 600 }}>
                  Tipo
                </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', fontSize: '0.875rem', fontWeight: 600 }}>
                  Peças
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((apt) => {
                  // Formatar tempo
                  // ⚠️ ESTRUTURA PADRONIZADA:
                  // - Auto: quantity = tempo PLC (dividir por divisor)
                  // - Manual: quantity = tempo em segundos (direto)
                  let timeDisplay = '-';
                  if (apt.automatic) {
                    // Automático: quantity é o tempo em unidades do PLC
                    timeDisplay = `${((apt.quantity || 0) / (orderData?.plcConfig?.timeDivisor || 10)).toFixed(1)}s`;
                  } else {
                    // Manual: quantity já é tempo em segundos (padronizado)
                    timeDisplay = `${apt.quantity || 0}s`;
                  }

                  // Definir quantidade de peças
                  // ⚠️ ESTRUTURA PADRONIZADA: clpCounterValue sempre = peças (auto + manual)
                  const piecesDisplay = apt.clpCounterValue || '-';

                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(apt.timestamp)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.875rem' }}>
                        {timeDisplay}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.875rem' }}>
                        {apt.rejectedQuantity || 0}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.875rem' }}>
                        <Chip 
                          label={apt.automatic ? 'Automático' : 'Manual'} 
                          size="small" 
                          color={apt.automatic ? 'primary' : 'default'}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                        {piecesDisplay}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#999', fontSize: '1rem' }}>
                    Nenhum apontamento registrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAppointmentsModalOpen(false)} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Composição do OEE */}
      <Dialog
        open={oeeModalOpen}
        onClose={() => setOeeModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon />
          <Typography variant="h6" component="span">
            Composição do OEE (Overall Equipment Effectiveness)
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* OEE Geral */}
          <Box sx={{ mb: 3, textAlign: 'center', p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              {stats?.oee.toFixed(1) || 0}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              OEE = Disponibilidade × Performance × Qualidade
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {stats && stats.availability && stats.performance && stats.quality
                ? `${stats.availability.toFixed(1)}% × ${stats.performance.toFixed(1)}% × ${stats.quality.toFixed(1)}% = ${stats.oee.toFixed(1)}%`
                : 'Calculando...'}
            </Typography>
    </Box>

          <Divider sx={{ my: 3 }} />

          {/* Diagnóstico Automático */}
          {stats && (() => {
            const components = [
              { name: 'Disponibilidade', value: stats.availability, target: 90, icon: '⏱️', color: '#4caf50' },
              { name: 'Performance', value: stats.performance, target: 95, icon: '⚡', color: '#ff9800' },
              { name: 'Qualidade', value: stats.quality, target: 99, icon: '✓', color: '#2196f3' }
            ];
            
            // Encontrar o componente mais baixo
            const lowestComponent = components.reduce((prev, curr) => 
              curr.value < prev.value ? curr : prev
            );
            
            // Verificar se OEE está abaixo de 85%
            const isLowOEE = stats.oee < 85;
            
            if (!isLowOEE) {
              return (
                <Box sx={{ mb: 3, p: 3, bgcolor: '#e8f5e9', borderRadius: 2, border: '2px solid #4caf50' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ fontSize: 40 }}>🎯</Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        OEE Excelente!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Todos os componentes estão em níveis satisfatórios. Continue monitorando para manter a excelência.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            }
            
            // Calcular gap e impacto
            const gap = lowestComponent.target - lowestComponent.value;
            const potentialOEE = (stats.availability / 100) * (stats.performance / 100) * (stats.quality / 100) * 100;
            const componentFactor = lowestComponent.name === 'Disponibilidade' 
              ? (lowestComponent.target / 100) * (stats.performance / 100) * (stats.quality / 100) * 100
              : lowestComponent.name === 'Performance'
              ? (stats.availability / 100) * (lowestComponent.target / 100) * (stats.quality / 100) * 100
              : (stats.availability / 100) * (stats.performance / 100) * (lowestComponent.target / 100) * 100;
            const potentialGain = componentFactor - potentialOEE;
            
            // Recomendações específicas
            const recommendations: Record<string, string[]> = {
              'Disponibilidade': [
                'Implementar manutenção preventiva programada',
                'Reduzir tempo de setup e trocas de molde',
                'Investigar e eliminar causas de paradas não planejadas',
                'Melhorar preparação de materiais e ferramentas'
              ],
              'Performance': [
                'Revisar e otimizar parâmetros do processo de injeção',
                'Reduzir microparadas e ajustes durante produção',
                'Verificar se o tempo de ciclo ideal está adequado',
                'Treinar operadores em técnicas de otimização'
              ],
              'Qualidade': [
                'Revisar controle de qualidade da matéria-prima',
                'Calibrar equipamentos e sensores',
                'Treinar equipe em padrões de qualidade',
                'Implementar poka-yoke (à prova de erros)'
              ]
            };
            
            return (
              <Box sx={{ mb: 3, p: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '2px solid #ff9800' }}>
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                  <Box sx={{ fontSize: 40 }}>🎯</Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" color="error.main" gutterBottom>
                      Diagnóstico: {lowestComponent.icon} {lowestComponent.name} é o Gargalo
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Situação Atual:</strong> A {lowestComponent.name.toLowerCase()} está em{' '}
                      <span style={{ color: lowestComponent.color, fontWeight: 'bold' }}>
                        {lowestComponent.value.toFixed(1)}%
                      </span>
                      {', '}
                      {gap.toFixed(1)} pontos percentuais abaixo do ideal ({lowestComponent.target}%).
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      <strong>Impacto no OEE:</strong> Se a {lowestComponent.name.toLowerCase()} atingisse {lowestComponent.target}%, 
                      o OEE subiria de <strong>{stats.oee.toFixed(1)}%</strong> para aproximadamente{' '}
                      <strong style={{ color: '#4caf50' }}>{componentFactor.toFixed(1)}%</strong>
                      {' '}(ganho de +{potentialGain.toFixed(1)} pontos).
                    </Typography>
                    
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        🔧 Ações Prioritárias Recomendadas:
                      </Typography>
                      <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                        {recommendations[lowestComponent.name].map((rec, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{rec}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>

                    {/* Mostrar segundo componente mais baixo se também estiver ruim */}
                    {(() => {
                      const sortedComponents = [...components].sort((a, b) => a.value - b.value);
                      const secondLowest = sortedComponents[1];
                      if (secondLowest.value < secondLowest.target - 5) {
                        return (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff9c4', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              ⚠️ <strong>Atenção:</strong> {secondLowest.name} também está baixa ({secondLowest.value.toFixed(1)}%). 
                              Após melhorar a {lowestComponent.name.toLowerCase()}, foque neste componente.
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Box>
                </Box>
              </Box>
            );
          })()}

          {/* Detalhamento dos Componentes */}
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
            Componentes do OEE
          </Typography>

          <Grid container spacing={3}>
            {/* Disponibilidade */}
            <Grid item xs={12} ref={availabilityRef}>
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: '#e8f5e9',
                  ...(stats && stats.availability < stats.performance && stats.availability < stats.quality && stats.oee < 85 && {
                    border: '3px solid #f44336',
                    boxShadow: '0 0 10px rgba(244, 67, 54, 0.3)'
                  })
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          Disponibilidade: {stats?.availability.toFixed(1) || 0}%
                        </Typography>
                        {stats && stats.availability < stats.performance && stats.availability < stats.quality && stats.oee < 85 && (
                          <Chip label="GARGALO" size="small" color="error" sx={{ fontWeight: 'bold' }} />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(stats?.availability || 0, 100)} 
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        color="success"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>O que mede:</strong> Quanto tempo o equipamento esteve disponível para produção em relação ao tempo total.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cálculo:</strong> (Tempo de produção ideal / Tempo real) × 100
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Perdas incluídas:</strong> Paradas não planejadas, quebras, setup, ajustes.
                  </Typography>

                  {/* Detalhes Expandidos de Disponibilidade */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 Detalhamento de Tempos
                  </Typography>
                  
                  {(() => {
                    // Calcular tempos
                    const now = new Date();
                    const startDate = orderData?.startDate ? new Date(orderData.startDate) : null;
                    const totalTimeMs = startDate ? now.getTime() - startDate.getTime() : 0;
                    const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
                    
                    // Calcular tempo de paradas
                    const totalDowntimeSeconds = downtimes.reduce((sum, dt) => {
                      if (dt.duration) return sum + dt.duration;
                      if (dt.endTime) {
                        const start = new Date(dt.startTime);
                        const end = new Date(dt.endTime);
                        return sum + (end.getTime() - start.getTime()) / 1000;
                      }
                      return sum;
                    }, 0);
                    const totalDowntimeHours = totalDowntimeSeconds / 3600;
                    
                    // Tempo produtivo
                    const productiveTimeHours = totalTimeHours - totalDowntimeHours;
                    
                    // Agrupar paradas por tipo
                    const downtimesByType = {
                      PRODUCTIVE: 0,
                      UNPRODUCTIVE: 0,
                      PLANNED: 0
                    };
                    
                    downtimes.forEach(dt => {
                      const duration = dt.duration || 
                        (dt.endTime ? (new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 1000 : 0);
                      downtimesByType[dt.type] += duration / 3600; // converter para horas
                    });
                    
                    return (
                      <Box sx={{ mt: 2 }}>
                        {/* Resumo de Tempos */}
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                              <AccessTimeIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Tempo Total
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {totalTimeHours.toFixed(1)}h
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                              <PlayCircleOutlineIcon sx={{ fontSize: 24, color: 'success.main', mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Tempo Produtivo
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {productiveTimeHours.toFixed(1)}h
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({totalTimeHours > 0 ? ((productiveTimeHours / totalTimeHours) * 100).toFixed(1) : 0}%)
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                              <PauseCircleOutlineIcon sx={{ fontSize: 24, color: 'error.main', mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Tempo de Paradas
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="error.main">
                                {totalDowntimeHours.toFixed(1)}h
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({totalTimeHours > 0 ? ((totalDowntimeHours / totalTimeHours) * 100).toFixed(1) : 0}%)
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Breakdown por Tipo de Parada */}
                        {downtimes.length > 0 && (
                          <>
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mt: 2, mb: 1 }}>
                              Distribuição de Paradas:
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              {/* Paradas Improdutivas */}
                              {downtimesByType.UNPRODUCTIVE > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                      <Typography variant="caption">Improdutivas</Typography>
                                    </Box>
                                    <Typography variant="caption" fontWeight="bold">
                                      {downtimesByType.UNPRODUCTIVE.toFixed(1)}h
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={totalDowntimeHours > 0 ? (downtimesByType.UNPRODUCTIVE / totalDowntimeHours) * 100 : 0}
                                    color="error"
                                    sx={{ height: 4 }}
                                  />
                                </Box>
                              )}
                              
                              {/* Paradas Produtivas */}
                              {downtimesByType.PRODUCTIVE > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <BuildIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                      <Typography variant="caption">Produtivas (Setup)</Typography>
                                    </Box>
                                    <Typography variant="caption" fontWeight="bold">
                                      {downtimesByType.PRODUCTIVE.toFixed(1)}h
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={totalDowntimeHours > 0 ? (downtimesByType.PRODUCTIVE / totalDowntimeHours) * 100 : 0}
                                    color="primary"
                                    sx={{ height: 4 }}
                                  />
                                </Box>
                              )}
                              
                              {/* Paradas Planejadas */}
                              {downtimesByType.PLANNED > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <AccessTimeIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                      <Typography variant="caption">Planejadas (Manutenção)</Typography>
                                    </Box>
                                    <Typography variant="caption" fontWeight="bold">
                                      {downtimesByType.PLANNED.toFixed(1)}h
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={totalDowntimeHours > 0 ? (downtimesByType.PLANNED / totalDowntimeHours) * 100 : 0}
                                    color="warning"
                                    sx={{ height: 4 }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Top 5 Paradas */}
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mt: 2, mb: 1 }}>
                              Principais Paradas:
                            </Typography>
                            <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                              {downtimes
                                .map(dt => ({
                                  ...dt,
                                  durationCalc: dt.duration || 
                                    (dt.endTime ? (new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 1000 : 0)
                                }))
                                .sort((a, b) => b.durationCalc - a.durationCalc)
                                .slice(0, 5)
                                .map((dt, idx) => (
                                  <Box 
                                    key={dt.id} 
                                    sx={{ 
                                      p: 1, 
                                      bgcolor: idx % 2 === 0 ? '#fafafa' : 'white',
                                      borderRadius: 0.5,
                                      mb: 0.5
                                    }}
                                  >
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Box>
                                        <Typography variant="caption" fontWeight="bold">
                                          {dt.reason}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          {new Date(dt.startTime).toLocaleString('pt-BR')}
                                        </Typography>
                                      </Box>
                                      <Chip 
                                        label={`${(dt.durationCalc / 60).toFixed(0)} min`}
                                        size="small"
                                        color={
                                          dt.type === 'UNPRODUCTIVE' ? 'error' : 
                                          dt.type === 'PRODUCTIVE' ? 'primary' : 'warning'
                                        }
                                      />
                                    </Box>
                                  </Box>
                                ))}
                            </Box>
                          </>
                        )}
                        
                        {downtimes.length === 0 && (
                          <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="caption" color="success.main">
                              ✅ Nenhuma parada registrada até o momento!
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance */}
            <Grid item xs={12} ref={performanceRef}>
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: '#fff3e0',
                  ...(stats && stats.performance < stats.availability && stats.performance < stats.quality && stats.oee < 85 && {
                    border: '3px solid #f44336',
                    boxShadow: '0 0 10px rgba(244, 67, 54, 0.3)'
                  })
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <SpeedIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          Performance: {stats?.performance.toFixed(1) || 0}%
                        </Typography>
                        {stats && stats.performance < stats.availability && stats.performance < stats.quality && stats.oee < 85 && (
                          <Chip label="GARGALO" size="small" color="error" sx={{ fontWeight: 'bold' }} />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(stats?.performance || 0, 100)} 
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        color="warning"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>O que mede:</strong> A velocidade de produção comparada com a velocidade ideal (tempo de ciclo padrão).
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cálculo:</strong> (Tempo de ciclo ideal / Tempo de ciclo real) × 100
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Dados:</strong> Ciclo ideal = {orderData?.mold?.cycleTime || 0}s | Ciclo real = {stats?.averageCycle.toFixed(1) || 0}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Perdas incluídas:</strong> Pequenas paradas, redução de velocidade, marcha lenta.
                  </Typography>

                  {/* Detalhes Expandidos de Performance */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 Detalhamento de Performance
                  </Typography>
                  
                  {(() => {
                    const idealCycle = orderData?.mold?.cycleTime || 0;
                    const realCycle = stats?.averageCycle || 0;
                    const perfPercentage = stats?.performance || 0;
                    
                    // Calcular perda de tempo por ciclo
                    const timeLossPerCycle = realCycle - idealCycle;
                    const totalPieces = (stats?.totalProduced || 0) + (stats?.totalRejected || 0);
                    const totalTimeLoss = timeLossPerCycle * totalPieces;
                    
                    // Calcular quantas peças a mais poderiam ser produzidas
                    const potentialExtraPieces = idealCycle > 0 ? Math.floor(totalTimeLoss / idealCycle) : 0;
                    
                    // Distribuir apontamentos por faixa de ciclo
                    const cycleRanges = {
                      optimal: 0,      // <= ciclo ideal
                      good: 0,         // até 10% acima
                      acceptable: 0,   // 10-20% acima
                      slow: 0          // > 20% acima
                    };
                    
                    appointments.forEach(apt => {
                      const timeDivisor = orderData?.plcConfig?.timeDivisor || 10;
                      const cycleTime = (apt.quantity || 0) / timeDivisor;
                      
                      if (cycleTime <= idealCycle) {
                        cycleRanges.optimal++;
                      } else if (cycleTime <= idealCycle * 1.1) {
                        cycleRanges.good++;
                      } else if (cycleTime <= idealCycle * 1.2) {
                        cycleRanges.acceptable++;
                      } else {
                        cycleRanges.slow++;
                      }
                    });
                    
                    const totalAppointments = appointments.length;
                    
                    return (
                      <Box sx={{ mt: 2 }}>
                        {/* Comparação Ciclo Ideal vs Real */}
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Ciclo Ideal
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {idealCycle.toFixed(1)}s
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Meta de processo
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Ciclo Real Médio
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {realCycle.toFixed(1)}s
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Média dos apontamentos
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Perda por Ciclo
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="error.main">
                                +{timeLossPerCycle.toFixed(1)}s
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {idealCycle > 0 ? `+${((timeLossPerCycle / idealCycle) * 100).toFixed(0)}%` : '0%'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Impacto da Perda */}
                        <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1, mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            💡 Impacto da Perda de Performance:
                          </Typography>
                          <Typography variant="body2">
                            • Tempo total perdido: <strong>{(totalTimeLoss / 60).toFixed(1)} minutos</strong>
                          </Typography>
                          <Typography variant="body2">
                            • Peças potencialmente perdidas: <strong>{potentialExtraPieces} unidades</strong>
                          </Typography>
                          {idealCycle > 0 && realCycle > 0 && (
                            <Typography variant="body2">
                              • Se atingir ciclo ideal: ganho de <strong>{(100 - perfPercentage).toFixed(1)} pontos percentuais</strong>
                            </Typography>
                          )}
                        </Box>

                        {/* Distribuição de Ciclos */}
                        {totalAppointments > 0 && (
                          <>
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mt: 2, mb: 1 }}>
                              Distribuição de Ciclos ({totalAppointments} apontamentos):
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              {/* Ciclos Ótimos */}
                              {cycleRanges.optimal > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption">
                                      ✅ Ótimos (≤ ideal)
                                    </Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {cycleRanges.optimal} ({((cycleRanges.optimal / totalAppointments) * 100).toFixed(0)}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(cycleRanges.optimal / totalAppointments) * 100}
                                    sx={{ height: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' } }}
                                  />
                                </Box>
                              )}
                              
                              {/* Ciclos Bons */}
                              {cycleRanges.good > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption">
                                      👍 Bons (até +10%)
                                    </Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {cycleRanges.good} ({((cycleRanges.good / totalAppointments) * 100).toFixed(0)}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(cycleRanges.good / totalAppointments) * 100}
                                    sx={{ height: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#8bc34a' } }}
                                  />
                                </Box>
                              )}
                              
                              {/* Ciclos Aceitáveis */}
                              {cycleRanges.acceptable > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption">
                                      ⚠️ Aceitáveis (+10-20%)
                                    </Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {cycleRanges.acceptable} ({((cycleRanges.acceptable / totalAppointments) * 100).toFixed(0)}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(cycleRanges.acceptable / totalAppointments) * 100}
                                    sx={{ height: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' } }}
                                  />
                                </Box>
                              )}
                              
                              {/* Ciclos Lentos */}
                              {cycleRanges.slow > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption">
                                      🐌 Lentos ({'>'}+20%)
                                    </Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {cycleRanges.slow} ({((cycleRanges.slow / totalAppointments) * 100).toFixed(0)}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(cycleRanges.slow / totalAppointments) * 100}
                                    sx={{ height: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#f44336' } }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Recomendações */}
                            {perfPercentage < 95 && (
                              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                                  🔧 Ações Recomendadas:
                                </Typography>
                                {cycleRanges.slow > totalAppointments * 0.2 && (
                                  <Typography variant="caption" display="block">
                                    • Alto % de ciclos lentos: verificar parâmetros do processo
                                  </Typography>
                                )}
                                {realCycle > idealCycle * 1.1 && (
                                  <Typography variant="caption" display="block">
                                    • Ciclo médio muito acima do ideal: revisar configurações da máquina
                                  </Typography>
                                )}
                                <Typography variant="caption" display="block">
                                  • Treinar operadores em otimização de processo
                                </Typography>
                                <Typography variant="caption" display="block">
                                  • Investigar microparadas e ajustes frequentes
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>

            {/* Qualidade */}
            <Grid item xs={12} ref={qualityRef}>
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: '#e3f2fd',
                  ...(stats && stats.quality < stats.availability && stats.quality < stats.performance && stats.oee < 85 && {
                    border: '3px solid #f44336',
                    boxShadow: '0 0 10px rgba(244, 67, 54, 0.3)'
                  })
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          Qualidade: {stats?.quality.toFixed(1) || 0}%
                        </Typography>
                        {stats && stats.quality < stats.availability && stats.quality < stats.performance && stats.oee < 85 && (
                          <Chip label="GARGALO" size="small" color="error" sx={{ fontWeight: 'bold' }} />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(stats?.quality || 0, 100)} 
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        color="info"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>O que mede:</strong> A proporção de peças boas produzidas em relação ao total de peças fabricadas.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cálculo:</strong> (Peças aprovadas / Total produzido) × 100
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Dados:</strong> Aprovadas = {stats?.totalProduced || 0} | Rejeitadas = {stats?.totalRejected || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Perdas incluídas:</strong> Refugos, retrabalho, peças fora de especificação.
                  </Typography>

                  {/* Detalhes Expandidos de Qualidade */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 Detalhamento de Qualidade
                  </Typography>
                  
                  {(() => {
                    const totalProduced = stats?.totalProduced || 0;
                    const totalRejected = stats?.totalRejected || 0;
                    const totalPieces = totalProduced + totalRejected;
                    const qualityPercentage = stats?.quality || 0;
                    
                    // Calcular impacto das perdas
                    const rejectionRate = totalPieces > 0 ? (totalRejected / totalPieces) * 100 : 0;
                    const potentialQualityImpact = totalPieces > 0 
                      ? ((totalPieces / totalPieces) * 100) - qualityPercentage
                      : 0;
                    
                    return (
                      <Box sx={{ mt: 2 }}>
                        {/* Resumo de Qualidade */}
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                              <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main', mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Peças Aprovadas
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {totalProduced}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {totalPieces > 0 ? ((totalProduced / totalPieces) * 100).toFixed(1) : 0}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                              <WarningIcon sx={{ fontSize: 24, color: 'error.main', mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Peças Rejeitadas
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="error.main">
                                {totalRejected}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rejectionRate.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Total Produzido
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {totalPieces}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Aprovadas + Rejeitadas
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Índice de Qualidade
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="info.main">
                                {qualityPercentage.toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {qualityPercentage >= 99 ? 'Excelente' : qualityPercentage >= 95 ? 'Bom' : 'Atenção'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Impacto das Rejeições */}
                        {totalRejected > 0 && (
                          <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1, mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              💡 Impacto das Rejeições:
                            </Typography>
                            <Typography variant="body2">
                              • Peças perdidas: <strong>{totalRejected} unidades</strong> ({rejectionRate.toFixed(1)}% do total)
                            </Typography>
                            <Typography variant="body2">
                              • Se qualidade fosse 100%: ganho de <strong>{potentialQualityImpact.toFixed(1)} pontos percentuais</strong>
                            </Typography>
                            <Typography variant="body2">
                              • Material desperdiçado: <strong>{totalRejected} peças</strong>
                            </Typography>
                            {orderData?.plannedQuantity && (
                              <Typography variant="body2">
                                • Progresso real considerando perdas: <strong>{((totalProduced / orderData.plannedQuantity) * 100).toFixed(1)}%</strong>
                              </Typography>
                            )}
                          </Box>
                        )}

                        {totalRejected === 0 && (
                          <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, mb: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              ✅ Excelente! Nenhuma peça rejeitada até o momento!
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Continue mantendo os padrões de qualidade
                            </Typography>
                          </Box>
                        )}

                        {/* Distribuição de Qualidade */}
                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mt: 2, mb: 1 }}>
                          Distribuição de Qualidade:
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          {/* Barra de Aprovadas */}
                          <Box sx={{ mb: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption">Peças Aprovadas</Typography>
                              </Box>
                              <Typography variant="caption" fontWeight="bold">
                                {totalProduced} ({totalPieces > 0 ? ((totalProduced / totalPieces) * 100).toFixed(1) : 0}%)
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={totalPieces > 0 ? (totalProduced / totalPieces) * 100 : 0}
                              sx={{ height: 6, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' } }}
                            />
                          </Box>
                          
                          {/* Barra de Rejeitadas */}
                          {totalRejected > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                  <Typography variant="caption">Peças Rejeitadas</Typography>
                                </Box>
                                <Typography variant="caption" fontWeight="bold">
                                  {totalRejected} ({rejectionRate.toFixed(1)}%)
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={rejectionRate}
                                sx={{ height: 6, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#f44336' } }}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* Metas de Qualidade */}
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                          <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                            🎯 Metas de Qualidade:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: qualityPercentage >= 99 ? '#4caf50' : '#e0e0e0', color: qualityPercentage >= 99 ? 'white' : 'text.secondary', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight="bold">≥ 99%</Typography>
                                <Typography variant="caption" display="block">Classe Mundial</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: qualityPercentage >= 95 && qualityPercentage < 99 ? '#ff9800' : '#e0e0e0', color: qualityPercentage >= 95 && qualityPercentage < 99 ? 'white' : 'text.secondary', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight="bold">95-98%</Typography>
                                <Typography variant="caption" display="block">Bom</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: qualityPercentage < 95 ? '#f44336' : '#e0e0e0', color: qualityPercentage < 95 ? 'white' : 'text.secondary', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight="bold">{"< 95%"}</Typography>
                                <Typography variant="caption" display="block">Ação Necessária</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Recomendações */}
                        {qualityPercentage < 99 && totalRejected > 0 && (
                          <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                              🔧 Ações Recomendadas:
                            </Typography>
                            {rejectionRate > 5 && (
                              <Typography variant="caption" display="block">
                                • Taxa de rejeição elevada: investigar causas raiz imediatamente
                              </Typography>
                            )}
                            {rejectionRate > 2 && rejectionRate <= 5 && (
                              <Typography variant="caption" display="block">
                                • Taxa de rejeição moderada: revisar parâmetros do processo
                              </Typography>
                            )}
                            <Typography variant="caption" display="block">
                              • Verificar qualidade da matéria-prima
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Calibrar equipamentos e sensores
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Treinar equipe em padrões de qualidade
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Implementar controles poka-yoke (à prova de erros)
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Interpretação */}
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              📊 Interpretação do OEE
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#4caf50', color: 'white', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">≥ 85%</Typography>
                  <Typography variant="caption">Excelente (Classe Mundial)</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#ff9800', color: 'white', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">60-84%</Typography>
                  <Typography variant="caption">Bom (Melhorias Possíveis)</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#f44336', color: 'white', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">{"< 60%"}</Typography>
                  <Typography variant="caption">Crítico (Ação Necessária)</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Dicas */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8eaf6', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
              💡 Dicas para Melhorar o OEE
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li><strong>Disponibilidade:</strong> Reduzir paradas planejadas e não planejadas através de manutenção preventiva.</li>
                <li><strong>Performance:</strong> Otimizar parâmetros do processo, reduzir microparadas e ajustes.</li>
                <li><strong>Qualidade:</strong> Melhorar controle de processo, treinamento e qualidade da matéria-prima.</li>
              </ul>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOeeModalOpen(false)} variant="contained" size="large">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Explicação de Cálculo */}
      <Dialog
        open={calculationModalOpen}
        onClose={() => setCalculationModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon />
          <Typography variant="h6" component="span">
            Como são Calculados os Dados
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Resumo do Cálculo Principal */}
          <Box sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              🎯 Peças por Hora
            </Typography>
            <Typography variant="body1" gutterBottom>
              Taxa média de produção que indica quantas peças são produzidas a cada hora.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body1" fontWeight="bold" align="center">
                {stats?.totalProduced.toLocaleString('pt-BR') || 0} peças ÷ {stats?.productionHours.toFixed(2) || 0} horas = {stats?.productivity ? Math.round(stats.productivity).toLocaleString('pt-BR') : '0'} peças/hora
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Passo a Passo do Cálculo */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Origem dos Dados - Passo a Passo
          </Typography>

          {/* Passo 1 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                1
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Somar Todos os Tempos Coletados
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              O sistema coleta o tempo de cada ciclo de injeção no campo <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>quantity</code> (registrador D33 do PLC).
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Código:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                totalTimeUnits = soma de todos os quantity
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                📌 Seus Dados Atuais:
              </Typography>
              <Typography variant="body2">
                • Total de apontamentos: <strong>{appointments.length}</strong>
              </Typography>
              <Typography variant="body2">
                • Soma total dos tempos: <strong>{appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0).toLocaleString('pt-BR')}</strong> unidades
              </Typography>
            </Box>
          </Box>

          {/* Passo 2 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                2
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Converter para Segundos
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              O <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>timeDivisor</code> define como converter as unidades em segundos.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Código:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                timeDivisor = {orderData?.plcConfig?.timeDivisor || 10} (configurado no PLC){'\n'}
                totalSeconds = totalTimeUnits ÷ timeDivisor
              </Typography>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ℹ️ O que significa timeDivisor = {orderData?.plcConfig?.timeDivisor || 10}?
              </Typography>
              {(orderData?.plcConfig?.timeDivisor || 10) === 10 && (
                <Typography variant="body2">
                  As unidades estão em <strong>décimos de segundo</strong>.<br />
                  Exemplo: 51 unidades = 5,1 segundos
                </Typography>
              )}
              {(orderData?.plcConfig?.timeDivisor || 10) === 100 && (
                <Typography variant="body2">
                  As unidades estão em <strong>centésimos de segundo</strong>.<br />
                  Exemplo: 510 unidades = 5,1 segundos
                </Typography>
              )}
              {(orderData?.plcConfig?.timeDivisor || 10) === 1000 && (
                <Typography variant="body2">
                  As unidades estão em <strong>milissegundos</strong>.<br />
                  Exemplo: 5100 unidades = 5,1 segundos
                </Typography>
              )}
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                📌 Seus Dados Atuais:
              </Typography>
              <Typography variant="body2">
                • Total em unidades: <strong>{appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0).toLocaleString('pt-BR')}</strong>
              </Typography>
              <Typography variant="body2">
                • Divisor configurado: <strong>{orderData?.plcConfig?.timeDivisor || 10}</strong>
              </Typography>
              <Typography variant="body2">
                • Total em segundos: <strong>{((appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0)) / (orderData?.plcConfig?.timeDivisor || 10)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong> segundos
              </Typography>
            </Box>
          </Box>

          {/* Passo 3 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                3
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Converter para Horas
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Dividimos o total de segundos por 3600 para obter o tempo em horas.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Código:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                productionHours = totalSeconds ÷ 3600
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                📌 Seus Dados Atuais:
              </Typography>
              <Typography variant="body2">
                • Total em segundos: <strong>{((appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0)) / (orderData?.plcConfig?.timeDivisor || 10)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>
              </Typography>
              <Typography variant="body2">
                • Total em horas: <strong>{stats?.productionHours.toFixed(2) || 0}</strong> horas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Equivalente a: <strong>{stats?.totalInjectionTime || '0:00:00'}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Passo 4 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                4
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Calcular Produtividade
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Dividimos o total de peças produzidas pelo tempo em horas.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Código:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                productivity = (totalProduced ÷ totalSeconds) × 3600
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ✅ Resultado Final:
              </Typography>
              <Typography variant="body2">
                • Peças produzidas: <strong>{stats?.totalProduced.toLocaleString('pt-BR') || 0}</strong>
              </Typography>
              <Typography variant="body2">
                • Tempo de produção: <strong>{stats?.productionHours.toFixed(2) || 0}</strong> horas
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                • Produtividade: {stats?.productivity ? Math.round(stats.productivity).toLocaleString('pt-BR') : '0'} peças/hora 🎯
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informações Adicionais */}
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
              💡 Informações Importantes
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>O tempo é coletado automaticamente do PLC a cada ciclo de injeção</li>
                <li>O <strong>timeDivisor</strong> é configurado no cadastro do CLP e varia conforme o equipamento</li>
                <li>Apenas o tempo de produção ativa é contabilizado (excluindo paradas)</li>
                <li>A produtividade reflete a taxa média real, considerando variações nos ciclos</li>
              </ul>
            </Typography>
          </Box>

          {/* Análise do Ciclo */}
          {(() => {
            const totalTimeUnits = appointments.reduce((sum, apt) => sum + (apt.quantity || 0), 0);
            const timeDivisor = orderData?.plcConfig?.timeDivisor || 10;
            const avgCycleSeconds = appointments.length > 0 ? (totalTimeUnits / timeDivisor) / appointments.length : 0;
            
            return (
              <Box sx={{ mt: 3, p: 2, bgcolor: avgCycleSeconds < 5 ? '#fff3e0' : '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  ⏱️ Análise do Ciclo Médio
                </Typography>
                <Typography variant="body2">
                  • Ciclo médio atual: <strong>{avgCycleSeconds.toFixed(1)} segundos</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {avgCycleSeconds < 5 && (
                    <span>⚠️ Atenção: Ciclo muito rápido! Verifique se o <strong>timeDivisor</strong> está configurado corretamente.</span>
                  )}
                  {avgCycleSeconds >= 5 && avgCycleSeconds <= 15 && (
                    <span>⚡ Ciclo rápido - típico de peças pequenas.</span>
                  )}
                  {avgCycleSeconds > 15 && avgCycleSeconds <= 40 && (
                    <span>✅ Ciclo normal - dentro da faixa esperada para injeção plástica.</span>
                  )}
                  {avgCycleSeconds > 40 && (
                    <span>🐌 Ciclo lento - típico de peças grandes ou complexas.</span>
                  )}
                </Typography>
              </Box>
            );
          })()}

        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCalculationModalOpen(false)} variant="contained" size="large">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderSummary;

