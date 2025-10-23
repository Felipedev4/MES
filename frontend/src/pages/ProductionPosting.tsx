/**
 * Página de Apontamento de Produção
 * Interface para registro manual e automático de produção via CLP
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ConnectedIcon,
  Cancel as DisconnectedIcon,
  Router as PlcIcon,
  Wifi as WebSocketIcon,
  Settings as ManualIcon,
  Speed as AutoIcon,
  PostAdd as PostingIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useSocket } from '../contexts/SocketContext';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { ProductionOrder } from '../types';

interface PlcStatus {
  connected: boolean;
  register: string;
  status: 'Online' | 'Offline';
  currentCount: number;
}

const ProductionPosting: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const socket = useSocket();
  
  // Estados
  const [plcStatus, setPlcStatus] = useState<PlcStatus>({
    connected: true,
    register: 'D33',
    status: 'Online',
    currentCount: 0,
  });
  
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedAutoOrder, setSelectedAutoOrder] = useState<number | ''>('');
  const [manualPosting, setManualPosting] = useState({
    orderId: '',
    producedQuantity: 0,
    rejectedQuantity: 0,
  });

  // Carregar ordens de produção ativas
  const loadActiveOrders = useCallback(async () => {
    try {
      const response = await api.get<ProductionOrder[]>('/production-orders', {
        params: { status: 'ACTIVE' }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    }
  }, []);

  useEffect(() => {
    loadActiveOrders();
    
    // Verificar conexão WebSocket
    if (socket) {
      setWebSocketConnected(socket.isConnected);
      
      // Listeners para eventos do socket
      socket.on('connect', () => {
        setWebSocketConnected(true);
        enqueueSnackbar('WebSocket conectado', { variant: 'success' });
      });
      
      socket.on('disconnect', () => {
        setWebSocketConnected(false);
        enqueueSnackbar('WebSocket desconectado', { variant: 'warning' });
      });
      
      // Receber dados do PLC
      socket.on('plc:data', (data: any) => {
        setPlcStatus(prev => ({
          ...prev,
          currentCount: data.count || prev.currentCount,
          connected: true,
          status: 'Online',
        }));
      });
      
      socket.on('plc:status', (data: any) => {
        setPlcStatus(prev => ({
          ...prev,
          connected: data.connected,
          status: data.connected ? 'Online' : 'Offline',
        }));
      });
    }
    
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('plc:data');
        socket.off('plc:status');
      }
    };
  }, [socket, enqueueSnackbar, loadActiveOrders]);

  // Submeter apontamento manual
  const handleManualSubmit = async () => {
    if (!manualPosting.orderId) {
      enqueueSnackbar('Selecione uma ordem de produção', { variant: 'warning' });
      return;
    }

    if (manualPosting.producedQuantity === 0 && manualPosting.rejectedQuantity === 0) {
      enqueueSnackbar('Informe a quantidade produzida ou rejeitada', { variant: 'warning' });
      return;
    }

    try {
      await api.post('/production/appointments', {
        productionOrderId: manualPosting.orderId,
        quantity: manualPosting.producedQuantity,
        rejectedQuantity: manualPosting.rejectedQuantity,
      });
      
      enqueueSnackbar('Apontamento realizado com sucesso!', { variant: 'success' });
      
      // Resetar formulário
      setManualPosting({
        orderId: '',
        producedQuantity: 0,
        rejectedQuantity: 0,
      });
      
      // Recarregar ordens
      loadActiveOrders();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao registrar produção';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header Profissional */}
      <PageHeader
        icon={<PostingIcon />}
        title="Apontamento de Produção"
        subtitle="Registro manual e automático de produção via CLP"
        iconGradient="linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Coluna Esquerda - Status e Apontamento Automático */}
        <Grid item xs={12} md={6}>
          {/* Status do CLP */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3,
              border: plcStatus.connected ? '2px solid #4caf50' : '2px solid #f44336',
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <PlcIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Status do CLP DVP-12SE
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Registro {plcStatus.register}
              </Typography>
              <Chip
                icon={plcStatus.connected ? <ConnectedIcon /> : <DisconnectedIcon />}
                label={plcStatus.connected ? 'Conectado' : 'Desconectado'}
                color={plcStatus.connected ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box 
              sx={{ 
                textAlign: 'center',
                bgcolor: plcStatus.status === 'Online' ? 'success.light' : 'error.light',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color={plcStatus.status === 'Online' ? 'success.dark' : 'error.dark'}
              >
                {plcStatus.status}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2, p: 3 }}>
              <Typography variant="h1" fontWeight="bold" color="primary">
                {plcStatus.currentCount}
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Contador atual
              </Typography>
            </Box>
          </Paper>

          {/* WebSocket Status */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <WebSocketIcon sx={{ fontSize: 28, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  WebSocket
                </Typography>
              </Box>
              <Chip
                label={webSocketConnected ? 'Conectado' : 'Desconectado'}
                color={webSocketConnected ? 'success' : 'error'}
                icon={webSocketConnected ? <ConnectedIcon /> : <DisconnectedIcon />}
              />
            </Box>
          </Paper>

          {/* Apontamento Automático via CLP */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '2px solid #2196f3',
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <AutoIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Apontamento Automático via CLP
              </Typography>
            </Box>

            <TextField
              select
              fullWidth
              label="Selecionar Ordem de Produção"
              value={selectedAutoOrder}
              onChange={(e) => setSelectedAutoOrder(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={!plcStatus.connected || !webSocketConnected}
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">Selecione uma ordem</MenuItem>
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.orderNumber} - {order.item?.name || 'N/A'}
                </MenuItem>
              ))}
            </TextField>

            {selectedAutoOrder && (
              <Box mt={2} p={2} sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ℹ️ O apontamento será feito automaticamente pelo CLP
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Coluna Direita - Apontamento Manual */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '2px solid #ff9800',
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <ManualIcon sx={{ fontSize: 32, mr: 2, color: '#f57c00' }} />
              <Typography variant="h6" fontWeight="bold">
                Apontamento Manual
              </Typography>
            </Box>

            <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3 }}>
              <TextField
                select
                fullWidth
                label="Ordem de Produção"
                value={manualPosting.orderId}
                onChange={(e) => setManualPosting({ ...manualPosting, orderId: e.target.value })}
                margin="normal"
              >
                <MenuItem value="">Selecione uma ordem</MenuItem>
                {orders.map((order) => (
                  <MenuItem key={order.id} value={order.id}>
                    #{order.orderNumber} - {order.item?.name || 'N/A'}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Quantidade Produzida"
                value={manualPosting.producedQuantity}
                onChange={(e) => setManualPosting({ 
                  ...manualPosting, 
                  producedQuantity: parseInt(e.target.value) || 0 
                })}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />

              <TextField
                fullWidth
                type="number"
                label="Quantidade Rejeitada"
                value={manualPosting.rejectedQuantity}
                onChange={(e) => setManualPosting({ 
                  ...manualPosting, 
                  rejectedQuantity: parseInt(e.target.value) || 0 
                })}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleManualSubmit}
                sx={{ mt: 3, py: 1.5 }}
              >
                Registrar Apontamento
              </Button>
            </Box>

            {/* Informações adicionais */}
            <Box mt={3} p={2} sx={{ bgcolor: 'white', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📝 <strong>Dica:</strong> Use o apontamento manual quando:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mt: 1 }}>
                • O CLP estiver desconectado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                • Houver necessidade de correção de dados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                • Registrar produção retroativa
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionPosting;

