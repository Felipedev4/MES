/**
 * Página de Dashboard - KPIs e gráficos em tempo real
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalculateIcon from '@mui/icons-material/Calculate';
import api from '../services/api';
import { DashboardKPIs, ProductionByPeriod } from '../types';
import PageHeader from '../components/PageHeader';
import { useSocket } from '../contexts/SocketContext';
import { useSnackbar } from 'notistack';
import moment from 'moment';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [productionData, setProductionData] = useState<ProductionByPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [calculationModalOpen, setCalculationModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { on, off } = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (!showRefreshIndicator) {
        setLoading(true);
      }
      
      const [kpisRes, productionRes] = await Promise.all([
        api.get<DashboardKPIs>('/dashboard/kpis'),
        api.get<ProductionByPeriod[]>('/dashboard/production-by-period', {
          params: { groupBy: 'day' },
        }),
      ]);

      setKpis(kpisRes.data);
      setProductionData(productionRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (!showRefreshIndicator) {
        enqueueSnackbar('Erro ao carregar dados do dashboard', { variant: 'error' });
      }
    } finally {
      if (!showRefreshIndicator) {
        setLoading(false);
      }
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadData();

    // Escutar atualizações em tempo real
    on('production:update', () => {
      loadData(true);
    });

    return () => {
      off('production:update');
    };
  }, [loadData, on, off]);

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

  if (loading || !kpis) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Configuração dos gráficos
  const productionChartData = {
    labels: productionData.map(d => moment(d.period).format('DD/MM')),
    datasets: [
      {
        label: 'Produzido',
        data: productionData.map(d => d.produced),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Rejeitado',
        data: productionData.map(d => d.rejected),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const oeeChartData = {
    labels: ['Disponibilidade', 'Performance', 'Qualidade'],
    datasets: [
      {
        data: [kpis.availability, kpis.performance, kpis.quality],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<DashboardIcon />}
        title="Dashboard de Produção"
        subtitle="Indicadores e métricas em tempo real"
        iconGradient="linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"
      />

      {/* Controles de Atualização Automática */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1, sm: 1.25 }, 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 1.5,
          border: '1px solid rgba(0, 0, 0, 0.06)',
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

      {/* KPIs Cards - Linha 1: Principais */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        📊 Indicadores Principais
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="body2" sx={{ opacity: 0.9 }}>
                OEE (Overall Equipment Effectiveness)
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="white">
                {kpis.oee.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                Disp: {kpis.availability.toFixed(1)}% | Perf: {kpis.performance.toFixed(1)}% | Qual: {kpis.quality.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="body2" sx={{ opacity: 0.9 }}>
                Total Produzido
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="white">
                {kpis.totalProduced.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {kpis.estimatedWeightKg.toLocaleString()} kg estimado
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="body2" sx={{ opacity: 0.9 }}>
                Taxa de Qualidade
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="white">
                {kpis.qualityRate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {kpis.totalRejected} peças rejeitadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)' }}>
            <CardContent>
              <Typography color="white" gutterBottom variant="body2" sx={{ opacity: 0.9 }}>
                Injetoras Ativas
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="white">
                {kpis.activeInjectors}
              </Typography>
              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {kpis.ordersInProgress} ordens em andamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KPIs Cards - Linha 2: Eficiência de Processo */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        ⚙️ Eficiência de Processo
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Eficiência de Ciclo
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {kpis.cycleEfficiency > 0 ? kpis.cycleEfficiency.toFixed(1) : '0.0'}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Ciclo Real vs Teórico
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Utilização de Cavidades
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {kpis.cavityUtilization.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {kpis.totalActiveCavities}/{kpis.totalPossibleCavities} cavidades
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Tempo Médio de Setup
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {kpis.avgSetupTimeMinutes.toFixed(0)} min
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {kpis.setupCount} setups realizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total de Defeitos
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error">
                {kpis.totalDefects}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {((kpis.totalDefects / (kpis.totalProduced || 1)) * 100).toFixed(2)}% do total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        📈 Análises e Gráficos
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Produção por Período
              </Typography>
              <Tooltip title="Como são calculados estes dados?" arrow>
                <IconButton
                  size="small"
                  onClick={() => setCalculationModalOpen(true)}
                  sx={{
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light', color: 'white' },
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ position: 'relative', height: { xs: 250, md: 300 } }}>
              <Line 
                data={productionChartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false
                }} 
              />
            </Box>
            
            {/* Estatísticas de Produção */}
            <Box sx={{ mt: 3, borderTop: '2px solid #f0f0f0', pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
                      Total
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {kpis.totalProduced.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      peças produzidas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
                      Perda
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {kpis.totalRejected.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      peças rejeitadas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
                      Faltante
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {(kpis.totalPlanned - kpis.totalProduced).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      para atingir meta
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Peças por Hora - Centralizado */}
              <Box sx={{ mt: 3, textAlign: 'center', bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                <Tooltip 
                  title="Taxa de produção calculada dividindo o total de peças produzidas pelo tempo total de produção ativa (excluindo paradas)"
                  arrow
                >
                  <Box>
                    <Typography variant="body2" color="primary" gutterBottom fontWeight="bold">
                      Peças por Hora
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {kpis.piecesPerHour ? kpis.piecesPerHour.toLocaleString() : '0'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Taxa média de produção
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1.5, 
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        p: 1,
                        borderRadius: 1,
                        border: '1px dashed rgba(25, 118, 210, 0.3)'
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Cálculo:</Box>{' '}
                      {kpis.totalProduced.toLocaleString()} peças ÷ {kpis.productionHours.toFixed(2)} horas = {kpis.piecesPerHour ? kpis.piecesPerHour.toLocaleString() : '0'} peças/hora
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Componentes do OEE
            </Typography>
            <Box sx={{ position: 'relative', height: { xs: 250, md: 300 } }}>
              <Doughnut 
                data={oeeChartData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Análise de Paradas por Tipo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Distribuição de Paradas
            </Typography>
            <Box sx={{ position: 'relative', height: { xs: 250, md: 300 } }}>
              <Doughnut 
                data={{
                  labels: ['Produtivas', 'Improdutivas', 'Planejadas'],
                  datasets: [
                    {
                      data: [
                        kpis.productiveDowntime || 0,
                        kpis.unproductiveDowntime || 0,
                        kpis.plannedDowntime || 0,
                      ],
                      backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                      ],
                      borderWidth: 2,
                      borderColor: '#fff',
                    },
                  ],
                }}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const hours = Math.floor(value / 3600);
                          const minutes = Math.floor((value % 3600) / 60);
                          return `${label}: ${hours}h ${minutes}m`;
                        }
                      }
                    }
                  },
                }} 
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Produtivas:</strong> {kpis.productiveDowntimeFormatted}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Improdutivas:</strong> {kpis.unproductiveDowntimeFormatted}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Planejadas:</strong> {kpis.plannedDowntimeFormatted}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Top 5 Defeitos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top 5 Defeitos
            </Typography>
            {kpis.topDefects && kpis.topDefects.length > 0 ? (
              <>
                <Box sx={{ position: 'relative', height: { xs: 250, md: 300 } }}>
                  <Doughnut 
                    data={{
                      labels: kpis.topDefects.map(d => d.defectName),
                      datasets: [
                        {
                          data: kpis.topDefects.map(d => d.quantity),
                          backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                          ],
                          borderWidth: 2,
                          borderColor: '#fff',
                        },
                      ],
                    }}
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 10,
                            },
                          },
                        },
                      },
                    }} 
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  {kpis.topDefects.map((defect, index) => (
                    <Typography key={index} variant="body2" color="textSecondary">
                      <strong>{defect.defectName}:</strong> {defect.quantity} peças
                    </Typography>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: 300,
                color: 'text.secondary'
              }}>
                <Typography variant="body2">
                  Nenhum defeito registrado no período
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Estatísticas Detalhadas */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Estatísticas Detalhadas - Indústria de Plástico
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total de Ordens
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">{kpis.totalOrders}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total de Paradas
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">{kpis.downtimeCount}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {kpis.totalDowntimeFormatted}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Cavidades Totais
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis.totalActiveCavities} / {kpis.totalPossibleCavities}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {kpis.cavityUtilization.toFixed(1)}% utilizadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Peso Total Estimado
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis.estimatedWeightKg.toLocaleString()} kg
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Base: 50g por peça
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de Explicação de Cálculo de Peças por Hora */}
      <Dialog
        open={calculationModalOpen}
        onClose={() => setCalculationModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon />
          <Typography variant="h6" component="span">
            Como são Calculadas as Peças por Hora
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Resumo do Cálculo Principal */}
          <Box sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              🎯 Peças por Hora
            </Typography>
            <Typography variant="body1" gutterBottom>
              Taxa média de produção que indica quantas peças são produzidas a cada hora nas ordens operacionais (ATIVAS, PAUSADAS, EM PROGRAMAÇÃO).
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body1" fontWeight="bold" align="center">
                {kpis ? `${kpis.totalProduced.toLocaleString('pt-BR')} peças ÷ Tempo Total = ${kpis.piecesPerHour ? kpis.piecesPerHour.toLocaleString('pt-BR') : '0'} peças/hora` : 'Carregando...'}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                Coletar Dados de Produção
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              O sistema coleta dados de <strong>todas as ordens operacionais</strong> (status: ATIVA, PAUSADA ou EM PROGRAMAÇÃO) da sua empresa.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: '#fff9c4', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                📌 Dados Considerados:
              </Typography>
              <Typography variant="body2">
                • <strong>Apontamentos de produção</strong>: Campo <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>clpCounterValue</code> (contador real de peças do CLP)
              </Typography>
              <Typography variant="body2">
                • <strong>Tempo de ciclo</strong>: Campo <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>quantity</code> (tempo de cada ciclo em unidades do PLC)
              </Typography>
            </Box>
          </Box>

          {/* Passo 2 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                Somar Todos os Tempos de Ciclo
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              O sistema soma todos os valores de <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>quantity</code> dos apontamentos para calcular o tempo total de produção.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Fórmula:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                totalTimeUnits = Σ (quantity de todos os apontamentos)
              </Typography>
            </Box>
          </Box>

          {/* Passo 3 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                Converter para Segundos e Depois para Horas
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              O <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd' }}>timeDivisor</code> (configurado no PLC) converte as unidades em segundos. Depois, dividimos por 3600 para obter horas.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Fórmula:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                totalSeconds = totalTimeUnits ÷ timeDivisor<br />
                totalHours = totalSeconds ÷ 3600
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ℹ️ Valores Comuns de timeDivisor:
              </Typography>
              <Typography variant="body2">
                • <strong>10</strong>: Unidades em décimos de segundo (51 = 5,1s)
              </Typography>
              <Typography variant="body2">
                • <strong>100</strong>: Unidades em centésimos de segundo (510 = 5,1s)
              </Typography>
              <Typography variant="body2">
                • <strong>1000</strong>: Unidades em milissegundos (5100 = 5,1s)
              </Typography>
            </Box>
          </Box>

          {/* Passo 4 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                Calcular Peças por Hora
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Com o total de peças produzidas e o tempo total em horas, calculamos a taxa média de produção.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Fórmula Final:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                Peças por Hora = Total de Peças ÷ Total de Horas
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                ✅ Resultado Atual:
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.dark" sx={{ my: 1 }}>
                {kpis?.piecesPerHour ? kpis.piecesPerHour.toLocaleString('pt-BR') : '0'} peças/hora
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kpis ? `Baseado em ${kpis.totalProduced.toLocaleString('pt-BR')} peças produzidas` : ''}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Notas Importantes */}
          <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffb74d' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="warning.dark">
              ⚠️ Notas Importantes:
            </Typography>
            <Typography variant="body2" paragraph>
              • O cálculo considera <strong>apenas ordens operacionais</strong> (ATIVA, PAUSADA, EM PROGRAMAÇÃO)
            </Typography>
            <Typography variant="body2" paragraph>
              • Ordens <strong>FINALIZADAS</strong> e <strong>CANCELADAS</strong> não são incluídas
            </Typography>
            <Typography variant="body2">
              • O tempo considera <strong>ciclos reais de produção</strong>, incluindo pequenas paradas operacionais
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setCalculationModalOpen(false)} variant="contained" color="primary">
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;


