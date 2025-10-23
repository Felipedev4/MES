/**
 * Página de Apontamento Manual de Ordem de Produção
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  PostAdd as PostingIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

interface ProductionOrder {
  id: number;
  orderNumber: string;
  itemId: number;
  item?: {
    code: string;
    name: string;
    unit: string;
  };
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  status: string;
}

const ManualOrderPosting: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [calculatedTime, setCalculatedTime] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [rejectedQuantity, setRejectedQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Carregar ordens ativas
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get<ProductionOrder[]>('/production-orders', {
        params: { status: 'ACTIVE' },
      });
      setOrders(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar ordens:', error);
      enqueueSnackbar('Erro ao carregar ordens de produção', { variant: 'error' });
    }
  };

  // Quando seleciona uma ordem
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o.id === parseInt(selectedOrderId));
      setSelectedOrder(order || null);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId, orders]);

  // Calcular tempo automaticamente quando início e fim são preenchidos
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        if (hours > 0) {
          setCalculatedTime(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setCalculatedTime(`${minutes}m ${seconds}s`);
        } else {
          setCalculatedTime(`${seconds}s`);
        }
      } else {
        setCalculatedTime('');
      }
    } else {
      setCalculatedTime('');
    }
  }, [startTime, endTime]);

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      enqueueSnackbar('Selecione uma ordem de produção', { variant: 'warning' });
      return;
    }

    if (!startTime || !endTime) {
      enqueueSnackbar('Informe data/hora de início e fim', { variant: 'warning' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      enqueueSnackbar('Data/hora de fim deve ser maior que início', { variant: 'warning' });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      enqueueSnackbar('Informe a quantidade produzida', { variant: 'warning' });
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/production/appointments', {
        productionOrderId: parseInt(selectedOrderId),
        quantity: parseInt(quantity),
        rejectedQuantity: rejectedQuantity ? parseInt(rejectedQuantity) : 0,
        notes: notes || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      enqueueSnackbar('Apontamento registrado com sucesso!', { variant: 'success' });
      
      // Limpar formulário
      setStartTime('');
      setEndTime('');
      setCalculatedTime('');
      setQuantity('');
      setRejectedQuantity('');
      setNotes('');
      
      // Recarregar ordens para atualizar quantidades
      loadOrders();
      
    } catch (error: any) {
      console.error('Erro ao registrar apontamento:', error);
      const message = error.response?.data?.error || 'Erro ao registrar apontamento';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedOrderId('');
    setSelectedOrder(null);
    setStartTime('');
    setEndTime('');
    setCalculatedTime('');
    setQuantity('');
    setRejectedQuantity('');
    setNotes('');
  };

  const remainingQuantity = selectedOrder 
    ? selectedOrder.plannedQuantity - selectedOrder.producedQuantity 
    : 0;

  const currentProgress = selectedOrder
    ? Math.round((selectedOrder.producedQuantity / selectedOrder.plannedQuantity) * 100)
    : 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<PostingIcon />}
        title="Apontamento Manual de Ordem"
        subtitle="Registro manual de produção por ordem"
        iconGradient="linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
      />

      <Grid container spacing={3}>
        {/* Formulário de Apontamento */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Registrar Apontamento
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {/* Seleção de Ordem */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Ordem de Produção *"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={submitting}
                  helperText="Selecione a ordem para registrar o apontamento"
                >
                  <MenuItem value="">
                    <em>Selecione uma ordem</em>
                  </MenuItem>
                  {orders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.orderNumber} - {order.item?.name} ({order.producedQuantity}/{order.plannedQuantity})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Data/Hora de Início */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data/Hora de Início *"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!selectedOrderId || submitting}
                  InputLabelProps={{ shrink: true }}
                  helperText="Quando iniciou a produção"
                />
              </Grid>

              {/* Data/Hora de Fim */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data/Hora de Fim *"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!selectedOrderId || submitting}
                  InputLabelProps={{ shrink: true }}
                  helperText="Quando finalizou a produção"
                />
              </Grid>

              {/* Tempo Calculado */}
              {calculatedTime && (
                <Grid item xs={12}>
                  <Alert severity="info" icon={<SuccessIcon />}>
                    <strong>Tempo Total:</strong> {calculatedTime}
                  </Alert>
                </Grid>
              )}

              {/* Quantidade Produzida */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade Produzida *"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={!selectedOrderId || submitting}
                  InputProps={{
                    endAdornment: selectedOrder && (
                      <InputAdornment position="end">
                        {selectedOrder.item?.unit || 'pç'}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  helperText={selectedOrder ? `Faltam: ${remainingQuantity} ${selectedOrder.item?.unit || 'pç'}` : ''}
                />
              </Grid>

              {/* Quantidade Rejeitada */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade Rejeitada"
                  value={rejectedQuantity}
                  onChange={(e) => setRejectedQuantity(e.target.value)}
                  disabled={!selectedOrderId || submitting}
                  InputProps={{
                    endAdornment: selectedOrder && (
                      <InputAdornment position="end">
                        {selectedOrder.item?.unit || 'pç'}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  helperText="Opcional - peças com defeito"
                />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observações"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!selectedOrderId || submitting}
                  placeholder="Informações adicionais sobre o apontamento..."
                />
              </Grid>

              {/* Botões */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    disabled={submitting}
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!selectedOrderId || submitting}
                    startIcon={<PostingIcon />}
                  >
                    {submitting ? 'Registrando...' : 'Registrar Apontamento'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Informações da Ordem Selecionada */}
        <Grid item xs={12} md={4}>
          {selectedOrder ? (
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Ordem Selecionada
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                
                <Box mb={2}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Número da Ordem
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedOrder.orderNumber}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Item
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedOrder.item?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Código: {selectedOrder.item?.code}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Quantidade Planejada
                  </Typography>
                  <Typography variant="h6">
                    {selectedOrder.plannedQuantity.toLocaleString('pt-BR')} {selectedOrder.item?.unit || 'pç'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Já Produzido
                  </Typography>
                  <Typography variant="h6">
                    {selectedOrder.producedQuantity.toLocaleString('pt-BR')} {selectedOrder.item?.unit || 'pç'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Faltam Produzir
                  </Typography>
                  <Typography variant="h6" color={remainingQuantity > 0 ? 'warning.light' : 'success.light'}>
                    {remainingQuantity.toLocaleString('pt-BR')} {selectedOrder.item?.unit || 'pç'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Progresso
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {currentProgress}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info" icon={<WarningIcon />}>
              Selecione uma ordem de produção para visualizar os detalhes e registrar apontamento.
            </Alert>
          )}

          {/* Dica */}
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <SuccessIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Dica
              </Typography>
            </Box>
            <Typography variant="caption">
              Registre apontamentos de produção manualmente sempre que necessário. 
              Os dados são atualizados em tempo real no dashboard.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManualOrderPosting;

