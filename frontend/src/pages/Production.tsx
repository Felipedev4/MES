/**
 * Página de Apontamento de Produção com Integração CLP em Tempo Real
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { Assignment as ProductionIcon } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { ProductionOrder, PlcStatus } from '../types';
import { useSocket } from '../contexts/SocketContext';
import { useSnackbar } from 'notistack';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [plcStatus, setPlcStatus] = useState<PlcStatus | null>(null);
  const [manualQuantity, setManualQuantity] = useState<number>(0);
  const [manualRejected, setManualRejected] = useState<number>(0);
  
  const { on, off, isConnected: wsConnected } = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const loadOrders = async () => {
    try {
      const response = await api.get<ProductionOrder[]>('/production-orders', {
        params: { status: 'IN_PROGRESS' },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar ordens');
    }
  };

  const loadActiveOrder = async () => {
    try {
      const response = await api.get('/production/active-order');
      setActiveOrderId(response.data.activeOrderId);
    } catch (error) {
      console.error('Erro ao carregar ordem ativa');
    }
  };

  const loadPlcStatus = async () => {
    try {
      const response = await api.get<PlcStatus>('/production/plc/status');
      setPlcStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status do CLP');
    }
  };

  useEffect(() => {
    loadOrders();
    loadActiveOrder();
    loadPlcStatus();

    // Escutar atualizações do CLP em tempo real
    on('plc:connected', () => {
      enqueueSnackbar('CLP conectado!', { variant: 'success' });
      loadPlcStatus();
    });

    on('plc:disconnected', () => {
      enqueueSnackbar('CLP desconectado', { variant: 'warning' });
      loadPlcStatus();
    });

    on('plc:valueChanged', (data) => {
      setPlcStatus((prev) => ({
        ...prev!,
        lastValue: data.newValue,
        timestamp: data.timestamp,
      }));
    });

    on('production:update', (data) => {
      enqueueSnackbar(`Produção atualizada: +${data.increment} peças`, { variant: 'info' });
      loadOrders();
    });

    // Polling do status do CLP a cada 5 segundos
    const interval = setInterval(loadPlcStatus, 5000);

    return () => {
      off('plc:connected');
      off('plc:disconnected');
      off('plc:valueChanged');
      off('production:update');
      clearInterval(interval);
    };
  }, []);

  const handleStartAutomatic = async () => {
    if (!selectedOrderId) {
      enqueueSnackbar('Selecione uma ordem de produção', { variant: 'warning' });
      return;
    }

    try {
      await api.post('/production/active-order', {
        productionOrderId: selectedOrderId,
      });
      setActiveOrderId(selectedOrderId);
      enqueueSnackbar('Apontamento automático iniciado!', { variant: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao iniciar apontamento automático';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleStopAutomatic = async () => {
    try {
      await api.delete('/production/active-order');
      setActiveOrderId(null);
      enqueueSnackbar('Apontamento automático parado', { variant: 'info' });
    } catch (error: any) {
      enqueueSnackbar('Erro ao parar apontamento automático', { variant: 'error' });
    }
  };

  const handleManualAppointment = async () => {
    if (!selectedOrderId) {
      enqueueSnackbar('Selecione uma ordem de produção', { variant: 'warning' });
      return;
    }

    if (manualQuantity <= 0) {
      enqueueSnackbar('Quantidade deve ser maior que zero', { variant: 'warning' });
      return;
    }

    try {
      await api.post('/production/appointments', {
        productionOrderId: selectedOrderId,
        quantity: manualQuantity,
        rejectedQuantity: manualRejected,
      });
      
      enqueueSnackbar('Apontamento manual realizado!', { variant: 'success' });
      setManualQuantity(0);
      setManualRejected(0);
      loadOrders();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao realizar apontamento';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const activeOrder = orders.find(o => o.id === activeOrderId);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<ProductionIcon />}
        title="Apontamento de Produção"
        subtitle="Integração com CLP em tempo real para apontamento automático"
        iconGradient="linear-gradient(135deg, #00897b 0%, #00695c 100%)"
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Status do CLP */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <SettingsInputAntennaIcon fontSize="large" />
              <Box flexGrow={1}>
                <Typography variant="h6">Status do CLP DVP-12SE</Typography>
                <Typography variant="body2" color="textSecondary">
                  Registro D33 - {plcStatus?.connected ? 'Conectado' : 'Desconectado'}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Chip
                  label={plcStatus?.connected ? 'Online' : 'Offline'}
                  color={plcStatus?.connected ? 'success' : 'error'}
                />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {plcStatus?.lastValue || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Contador atual
                </Typography>
              </Box>
              <Box textAlign="right">
                <Chip
                  label={wsConnected ? 'WebSocket Conectado' : 'WebSocket Desconectado'}
                  color={wsConnected ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Apontamento Automático */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Apontamento Automático via CLP
            </Typography>

            {activeOrder && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Ordem Ativa: {activeOrder.orderNumber} - {activeOrder.item?.name}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Selecionar Ordem de Produção"
              value={selectedOrderId || ''}
              onChange={(e) => setSelectedOrderId(Number(e.target.value))}
              margin="normal"
              disabled={!!activeOrderId}
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.orderNumber} - {order.item?.name} ({order.producedQuantity}/{order.plannedQuantity})
                </MenuItem>
              ))}
            </TextField>

            <Box mt={2} display="flex" gap={2}>
              {!activeOrderId ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartAutomatic}
                  disabled={!plcStatus?.connected}
                >
                  Iniciar Apontamento Automático
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopAutomatic}
                >
                  Parar Apontamento Automático
                </Button>
              )}
            </Box>

            {!plcStatus?.connected && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                CLP não conectado. Verifique a conexão Modbus.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Apontamento Manual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Apontamento Manual
            </Typography>

            <TextField
              select
              fullWidth
              label="Ordem de Produção"
              value={selectedOrderId || ''}
              onChange={(e) => setSelectedOrderId(Number(e.target.value))}
              margin="normal"
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.orderNumber} - {order.item?.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Quantidade Produzida"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(Number(e.target.value))}
              margin="normal"
            />

            <TextField
              fullWidth
              type="number"
              label="Quantidade Rejeitada"
              value={manualRejected}
              onChange={(e) => setManualRejected(Number(e.target.value))}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleManualAppointment}
              sx={{ mt: 2 }}
            >
              Registrar Apontamento Manual
            </Button>
          </Paper>
        </Grid>

        {/* Ordem Selecionada - Detalhes */}
        {selectedOrder && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detalhes da Ordem: {selectedOrder.orderNumber}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Item
                      </Typography>
                      <Typography variant="h6">
                        {selectedOrder.item?.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Planejado
                      </Typography>
                      <Typography variant="h6">
                        {selectedOrder.plannedQuantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Produzido
                      </Typography>
                      <Typography variant="h6">
                        {selectedOrder.producedQuantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Rejeitado
                      </Typography>
                      <Typography variant="h6">
                        {selectedOrder.rejectedQuantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Progresso: {((selectedOrder.producedQuantity / selectedOrder.plannedQuantity) * 100).toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(selectedOrder.producedQuantity / selectedOrder.plannedQuantity) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Production;


