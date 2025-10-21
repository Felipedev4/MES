/**
 * Página de Dashboard - KPIs e gráficos em tempo real
 */

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
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
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { DashboardKPIs, ProductionByPeriod } from '../types';
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
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [productionData, setProductionData] = useState<ProductionByPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const loadData = async () => {
    try {
      const [kpisRes, productionRes] = await Promise.all([
        api.get<DashboardKPIs>('/dashboard/kpis'),
        api.get<ProductionByPeriod[]>('/dashboard/production-by-period', {
          params: { groupBy: 'day' },
        }),
      ]);

      setKpis(kpisRes.data);
      setProductionData(productionRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      enqueueSnackbar('Erro ao carregar dados do dashboard', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Escutar atualizações em tempo real
    on('production:update', () => {
      loadData();
    });

    return () => {
      off('production:update');
    };
  }, []);

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
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Produção
      </Typography>

      {/* KPIs Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                OEE
              </Typography>
              <Typography variant="h4">
                {kpis.oee.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Produzido
              </Typography>
              <Typography variant="h4">
                {kpis.totalProduced.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Taxa de Qualidade
              </Typography>
              <Typography variant="h4">
                {kpis.qualityRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ordens em Andamento
              </Typography>
              <Typography variant="h4">
                {kpis.ordersInProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Produção por Período
            </Typography>
            <Line data={productionChartData} options={{ responsive: true }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Componentes do OEE
            </Typography>
            <Doughnut data={oeeChartData} options={{ responsive: true }} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas de Paradas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">
                  Total de Paradas
                </Typography>
                <Typography variant="h5">{kpis.downtimeCount}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">
                  Tempo Total de Paradas
                </Typography>
                <Typography variant="h5">{kpis.totalDowntimeFormatted}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;


