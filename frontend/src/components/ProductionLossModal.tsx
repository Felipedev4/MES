/**
 * Modal para Apontamento de Perda
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { Defect, ProductionOrder, ProductionDefect } from '../types';
import moment from 'moment';

interface ProductionLossModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productionOrderId?: number; // ID da ordem para pré-selecionar
}

const ProductionLossModal: React.FC<ProductionLossModalProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  productionOrderId 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [productionDefects, setProductionDefects] = useState<ProductionDefect[]>([]);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [formData, setFormData] = useState({
    productionOrderId: '',
    defectId: '',
    quantity: '',
    notes: '',
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productionOrderId]);

  // Carregar perdas quando uma ordem for selecionada
  useEffect(() => {
    if (formData.productionOrderId && open) {
      loadProductionDefects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.productionOrderId, open]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Se um productionOrderId foi passado, buscar essa ordem específica
      let ordersToLoad: ProductionOrder[] = [];
      
      if (productionOrderId) {
        // Buscar a ordem específica
        try {
          const orderRes = await api.get<ProductionOrder>(`/production-orders/${productionOrderId}`);
          ordersToLoad = [orderRes.data];
        } catch (error) {
          console.error('Erro ao carregar ordem específica:', error);
          // Se falhar, tentar buscar ordens ativas
          const ordersRes = await api.get<ProductionOrder[]>('/production-orders', {
            params: { status: 'ACTIVE' },
          });
          ordersToLoad = ordersRes.data;
        }
      } else {
        // Buscar todas as ordens ativas
        const ordersRes = await api.get<ProductionOrder[]>('/production-orders', {
          params: { status: 'ACTIVE' },
        });
        ordersToLoad = ordersRes.data;
      }

      // Buscar defeitos
      const defectsRes = await api.get<Defect[]>('/defects', {
        params: { active: true },
      });

      setOrders(ordersToLoad);
      setDefects(defectsRes.data);

      // Pré-selecionar ordem se foi passada via prop
      if (productionOrderId && ordersToLoad.length > 0) {
        setFormData(prev => ({
          ...prev,
          productionOrderId: productionOrderId.toString(),
        }));
      } 
      // Caso contrário, se houver apenas uma ordem ativa, pré-selecionar
      else if (ordersToLoad.length === 1) {
        setFormData(prev => ({
          ...prev,
          productionOrderId: ordersToLoad[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' });
    } finally {
      setLoadingData(false);
    }
  };

  const loadProductionDefects = async () => {
    if (!formData.productionOrderId) return;
    
    setLoadingDefects(true);
    try {
      const response = await api.get<ProductionDefect[]>('/production-defects', {
        params: { 
          productionOrderId: formData.productionOrderId 
        },
      });
      setProductionDefects(response.data);
    } catch (error) {
      console.error('Erro ao carregar perdas:', error);
      setProductionDefects([]);
    } finally {
      setLoadingDefects(false);
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    // Validação
    if (!formData.productionOrderId) {
      enqueueSnackbar('Selecione uma ordem de produção', { variant: 'warning' });
      return;
    }

    if (!formData.defectId) {
      enqueueSnackbar('Selecione um defeito', { variant: 'warning' });
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      enqueueSnackbar('Informe uma quantidade válida', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/production-defects', {
        productionOrderId: parseInt(formData.productionOrderId),
        defectId: parseInt(formData.defectId),
        quantity: parseInt(formData.quantity),
        notes: formData.notes || undefined,
      });

      enqueueSnackbar('Perda registrada com sucesso!', { variant: 'success' });
      
      // Recarregar a lista de perdas
      await loadProductionDefects();
      
      // Limpar apenas os campos do formulário, mantendo a ordem selecionada
      setFormData(prev => ({
        ...prev,
        defectId: '',
        quantity: '',
        notes: '',
      }));
      
      // Mudar para aba de histórico
      setActiveTab(1);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao registrar perda:', error);
      const message = error.response?.data?.error || 'Erro ao registrar perda';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        productionOrderId: '',
        defectId: '',
        quantity: '',
        notes: '',
      });
      setProductionDefects([]);
      setActiveTab(0); // Resetar para primeira aba
      onClose();
    }
  };

  const handleDelete = async (defectId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de perda?')) {
      return;
    }

    try {
      await api.delete(`/production-defects/${defectId}`);
      enqueueSnackbar('Perda excluída com sucesso!', { variant: 'success' });
      
      // Recarregar lista
      await loadProductionDefects();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao excluir perda:', error);
      const message = error.response?.data?.error || 'Erro ao excluir perda';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const selectedOrder = orders.find(o => o.id.toString() === formData.productionOrderId);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          <Typography variant="h6" component="span">
            Apontamento de Perda
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loadingData ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Abas */}
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 3,
                pt: 1
              }}
            >
              <Tab label="Novo Registro" />
              <Tab 
                label={
                  <Badge badgeContent={productionDefects.length} color="error">
                    Histórico
                  </Badge>
                } 
              />
            </Tabs>

            {/* Conteúdo da Aba 0: Formulário */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                {/* Seleção de Ordem */}
                <TextField
                  select
                  label="Ordem *"
                  value={formData.productionOrderId}
                  onChange={handleChange('productionOrderId')}
                  required
                  disabled={loading || orders.length === 0 || !!productionOrderId}
                  helperText={
                    orders.length === 0 
                      ? 'Nenhuma ordem encontrada' 
                      : productionOrderId 
                        ? 'Ordem da produção atual' 
                        : 'Selecione a ordem de produção'
                  }
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                >
                  {orders.map(order => (
                    <MenuItem key={order.id} value={order.id.toString()}>
                      {order.orderNumber} - {order.item?.name}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Informações da Ordem (Compacto) */}
                {selectedOrder && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      bgcolor: 'primary.50',
                      border: '1px solid',
                      borderColor: 'primary.200',
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                          {selectedOrder.item?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Produzido:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {selectedOrder.producedQuantity} / {selectedOrder.plannedQuantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Rejeitado:
                        </Typography>
                        <Chip 
                          label={selectedOrder.rejectedQuantity} 
                          size="small" 
                          color="error" 
                          sx={{ fontWeight: 600, height: 24 }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Formulário */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="Quantidade da Perda *"
                      value={formData.quantity}
                      onChange={handleChange('quantity')}
                      required
                      disabled={loading}
                      inputProps={{ min: 1 }}
                      fullWidth
                      size="small"
                      helperText="Qtd. de peças com defeito"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Defeito *"
                      value={formData.defectId}
                      onChange={handleChange('defectId')}
                      required
                      disabled={loading || defects.length === 0}
                      helperText={defects.length === 0 ? 'Nenhum defeito' : 'Tipo de defeito'}
                      fullWidth
                      size="small"
                    >
                      {defects.map(defect => (
                        <MenuItem key={defect.id} value={defect.id.toString()}>
                          {defect.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Observações"
                      value={formData.notes}
                      onChange={handleChange('notes')}
                      multiline
                      rows={3}
                      disabled={loading}
                      fullWidth
                      size="small"
                      placeholder="Descreva detalhes sobre o defeito..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Conteúdo da Aba 1: Histórico */}
            {activeTab === 1 && (
              <Box sx={{ p: 2 }}>
                {loadingDefects ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                    <CircularProgress size={32} />
                  </Box>
                ) : productionDefects.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 6, 
                      textAlign: 'center', 
                      bgcolor: 'grey.50',
                      border: '1px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                    }}
                  >
                    <WarningAmberIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma perda registrada para esta ordem
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                      maxHeight: 400,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 1,
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1.5 }}>
                            Data/Hora
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1.5 }}>
                            Defeito
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1.5 }}>
                            Qtd.
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1.5 }}>
                            Observações
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1.5, width: 80 }}>
                            Ações
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productionDefects.map((pd) => (
                          <TableRow 
                            key={pd.id} 
                            hover
                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                          >
                            <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', py: 1.5 }}>
                              {moment(pd.timestamp).format('DD/MM/YY HH:mm')}
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={500} fontSize="0.8125rem">
                                {pd.defect?.name || '-'}
                              </Typography>
                              {pd.defect?.description && (
                                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                  {pd.defect.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Chip 
                                label={pd.quantity} 
                                size="small" 
                                color="error" 
                                sx={{ fontWeight: 600, minWidth: 45, height: 22, fontSize: '0.75rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                fontSize="0.8125rem"
                                sx={{ 
                                  maxWidth: 200, 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={pd.notes || ''}
                              >
                                {pd.notes || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(pd.id)}
                                title="Excluir perda"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 2, 
          gap: 2, 
          bgcolor: 'grey.50',
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
          variant="outlined"
          size="large"
          fullWidth
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || loadingData || orders.length === 0 || defects.length === 0}
          color="primary"
          size="large"
          fullWidth
          sx={{ order: { xs: 1, sm: 2 } }}
          startIcon={loading ? null : <WarningAmberIcon />}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Gravar Perda'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionLossModal;

