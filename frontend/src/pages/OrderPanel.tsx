/**
 * Painel de Ordens - Lista ordens vinculadas a uma injetora/CLP
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
  Stack,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { 
  Assignment as OrderIcon, 
  SettingsInputComponent as InjectorIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { ProductionOrder } from '../types';

const OrderPanel: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { plcId } = useParams<{ plcId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [plcName, setPlcName] = useState('');
  
  // Estados para atualização automática
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPlcInfo = async () => {
    try {
      const response = await api.get(`/plc-config/${plcId}`);
      setPlcName(response.data.name);
    } catch (error) {
      console.error('Erro ao carregar informações do CLP:', error);
    }
  };

  const loadOrders = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (!showRefreshIndicator) {
        setLoading(true);
      }
      
      // Buscar todas as ordens ativas (em produção ou planejadas)
      const response = await api.get<ProductionOrder[]>('/production-orders', {
        params: { 
          // Pode adicionar filtro por CLP se houver essa relação no backend
        }
      });
      
      // Ordenar ordens:
      // 1. Ordens em ATIVIDADE (ACTIVE) primeiro
      // 2. Depois por PRIORIDADE (descendente - maior prioridade primeiro)
      // 3. Depois por data de início planejada (ascendente)
      const sortedOrders = response.data.sort((a, b) => {
        // 1. Priorizar ordens ACTIVE
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        
        // 2. Se ambas têm mesmo status, ordenar por prioridade (maior primeiro)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        
        // 3. Se têm mesma prioridade, ordenar por data de início
        return new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime();
      });
      
      setOrders(sortedOrders);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
      if (!showRefreshIndicator) {
        enqueueSnackbar('Erro ao carregar ordens', { variant: 'error' });
      }
    } finally {
      if (!showRefreshIndicator) {
        setLoading(false);
      }
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (plcId) {
      loadPlcInfo();
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plcId]);

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
        loadOrders(true);
      }, refreshInterval * 1000);
    }

    // Cleanup ao desmontar ou quando dependências mudarem
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, loadOrders]);

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

  const handleOrderClick = (orderId: number) => {
    navigate(`/production-dashboard/${orderId}`);
  };

  const getUrgencyChip = (order: ProductionOrder) => {
    // Lógica para determinar urgência (pode ser customizada)
    if (order.status === 'ACTIVE') {
      return (
        <Chip 
          label="URGENTE" 
          size="small" 
          sx={{ 
            fontWeight: 700,
            fontSize: 11,
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            color: 'white',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.8 },
            },
          }} 
        />
      );
    } else if (order.status === 'PROGRAMMING') {
      return (
        <Chip 
          label="Programação" 
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 11,
            background: alpha(theme.palette.grey[500], 0.15),
            color: 'text.secondary',
          }}
        />
      );
    }
    return null;
  };

  const getActivityChip = (order: ProductionOrder) => {
    if (order.status === 'ACTIVE') {
      return (
        <Chip 
          label="Em Atividade" 
          size="small" 
          sx={{ 
            fontWeight: 700,
            fontSize: 11,
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            color: 'white',
          }} 
        />
      );
    }
    return null;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<InjectorIcon />}
        title={`Painel Ordem - ${plcName || 'Carregando...'}`}
        subtitle="Consulta de ordens vinculadas à injetora"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
        breadcrumbs={[
          { label: 'Injetoras', path: '/injectors' },
          { label: 'Painel Ordem' },
        ]}
      />

      {/* Controles de Atualização Automática */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 1.5 }, alignItems: { xs: 'stretch', sm: 'center' }, flex: 1 }}>
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
                width: { xs: '100%', sm: 130 },
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
          textAlign: { xs: 'left', sm: 'right' },
          fontSize: { xs: '0.65rem', sm: '0.7rem' },
          opacity: 0.6
        }}>
          Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
        </Typography>
      </Paper>

      {/* Grid de Ordens */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {orders.map((order) => {
          const progress = (order.producedQuantity / order.plannedQuantity) * 100;
          const isActive = order.status === 'ACTIVE';
          
          return (
            <Grid item xs={12} md={6} key={order.id}>
              <Card 
                elevation={isActive ? 8 : 3}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${isActive ? theme.palette.warning.main : alpha(theme.palette.divider, 0.1)}`,
                  background: isActive 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.03)} 100%)`
                    : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
              <CardActionArea onClick={() => handleOrderClick(order.id)}>
                {/* Barra de Progresso Visual */}
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(progress, 100)}
                  sx={{
                    height: 6,
                    backgroundColor: alpha(theme.palette.grey[500], 0.15),
                    '& .MuiLinearProgress-bar': {
                      background: progress >= 100
                        ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                        : progress >= 80
                          ? `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                          : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    },
                  }}
                />

                {/* Chips de Status no Topo */}
                <Box 
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    p: 2,
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    {getUrgencyChip(order)}
                    {getActivityChip(order)}
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ProgressIcon 
                      sx={{ 
                        fontSize: 16, 
                        color: progress >= 100 ? 'success.main' : 'primary.main' 
                      }} 
                    />
                    <Typography variant="body2" fontWeight={700} color={progress >= 100 ? 'success.main' : 'primary.main'}>
                      {Math.round(progress)}%
                    </Typography>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Header - Ordem e Quantidade Planejada */}
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Ordem:
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {order.orderNumber}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Quantidade:
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {order.plannedQuantity.toLocaleString('pt-BR')}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ borderTop: '2px solid', borderColor: 'divider', pt: 2, mb: 2 }} />

                  {/* Informações em Grid - Linha 1 */}
                  <Grid container spacing={2} mb={2}>
                    {/* Data Inicial */}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Data Inicial:
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {formatDate(order.plannedStartDate)}
                      </Typography>
                    </Grid>

                    {/* Produzido */}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Produzido:
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {order.producedQuantity?.toLocaleString('pt-BR') || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Informações em Grid - Linha 2 */}
                  <Grid container spacing={2}>
                    {/* Data Final */}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Data Final:
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {formatDate(order.plannedEndDate)}
                      </Typography>
                    </Grid>

                    {/* Rejeitado */}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                        Rejeitado:
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={order.rejectedQuantity > 0 ? 'error.main' : 'text.secondary'}>
                        {order.rejectedQuantity?.toLocaleString('pt-BR') || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Molde - Seção específica para plásticos */}
                  {order.mold && (
                    <Box 
                      mt={2} 
                      pt={2} 
                      sx={{ 
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                            Molde:
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{
                              wordBreak: 'break-word',
                              lineHeight: 1.3,
                            }}
                          >
                            {order.mold.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                            Cavidades:
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {order.mold.activeCavities || order.mold.cavities} / {order.mold.cavities}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            (ativas / totais)
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Referência do Produto no rodapé */}
                  <Box 
                    mt={2} 
                    pt={2} 
                    sx={{ 
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#fafafa',
                      mx: -3,
                      px: 3,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" display="block" mb={0.5} fontWeight={500}>
                      Referência do Produto:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="text.primary">
                      {order.item?.name || 'Produto não especificado'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          );
        })}
      </Grid>

      {/* Mensagem quando não há ordens */}
      {orders.length === 0 && !loading && (
        <Box 
          display="flex" 
          flexDirection="column"
          alignItems="center" 
          justifyContent="center" 
          minHeight="40vh"
        >
          <OrderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhuma ordem encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Não há ordens vinculadas a esta injetora
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrderPanel;

