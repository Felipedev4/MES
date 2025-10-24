/**
 * Página de Cadastro de Itens - Design Profissional
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Tooltip,
  Typography,
  Grid,
  InputAdornment,
  alpha,
  useTheme,
  Autocomplete} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as ItemIcon,
  Palette as ColorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import api from '../services/api';
import { Item, Color } from '../types';
import { useSnackbar } from 'notistack';

interface ItemFormData {
  code: string;
  name: string;
  description: string;
  unit: string;
  materialCost: string;
  laborCost: string;
  scrapCost: string;
  colors: Color[];
  active: boolean;
}

const initialFormData: ItemFormData = {
  code: '',
  name: '',
  description: '',
  unit: 'un', // Conforme ABNT: minúscula
  materialCost: '',
  laborCost: '',
  scrapCost: '',
  colors: [],
  active: true};

// Unidades de medida conforme ABNT NBR 5891 e NBR ISO 80000-1
const UNIT_OPTIONS = [
  // Unidades de contagem
  { value: 'un', label: 'Unidade (un)' },
  { value: 'pç', label: 'Peça (pç)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'par', label: 'Par (par)' },
  { value: 'dz', label: 'Dúzia (dz)' },
  { value: 'jg', label: 'Jogo (jg)' },
  
  // Massa (ABNT: símbolos em minúscula, exceto derivados de nomes próprios)
  { value: 't', label: 'Tonelada (t)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'mg', label: 'Miligrama (mg)' },
  
  // Comprimento (ABNT: símbolos em minúscula)
  { value: 'km', label: 'Quilômetro (km)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'mm', label: 'Milímetro (mm)' },
  
  // Área (ABNT: usar² para quadrado)
  { value: 'm²', label: 'Metro quadrado (m²)' },
  { value: 'cm²', label: 'Centímetro quadrado (cm²)' },
  
  // Volume (ABNT: usar³ para cúbico, L maiúsculo)
  { value: 'm³', label: 'Metro cúbico (m³)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'mL', label: 'Mililitro (mL)' },
  
  // Tempo (ABNT: símbolos sem ponto)
  { value: 'h', label: 'Hora (h)' },
  { value: 'min', label: 'Minuto (min)' },
  { value: 's', label: 'Segundo (s)' },
];

const Items: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { enqueueSnackbar } = useSnackbar();

  const loadItems = async () => {
    try {
      const response = await api.get<Item[]>('/items');
      setItems(response.data);
    } catch (error) {
      enqueueSnackbar('❌ Erro ao carregar itens', { variant: 'error' });
    }
  };

  const loadColors = async () => {
    try {
      const response = await api.get<Color[]>('/colors');
      setColors(response.data);
    } catch (error) {
      enqueueSnackbar('❌ Erro ao carregar cores', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadItems();
    loadColors();
  }, []);

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || '',
        unit: item.unit,
        materialCost: item.materialCost?.toString() || '',
        laborCost: item.laborCost?.toString() || '',
        scrapCost: item.scrapCost?.toString() || '',
        colors: item.colors || [],
        active: item.active});
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name || !formData.unit) {
        enqueueSnackbar('⚠️ Código, nome e unidade são obrigatórios', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        unit: formData.unit,
        materialCost: formData.materialCost ? parseFloat(formData.materialCost) : null,
        laborCost: formData.laborCost ? parseFloat(formData.laborCost) : null,
        scrapCost: formData.scrapCost ? parseFloat(formData.scrapCost) : null,
        active: formData.active,
        colorIds: formData.colors.map(c => c.id)};

      if (editingId) {
        await api.put(`/items/${editingId}`, dataToSend);
        enqueueSnackbar('✅ Item atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/items', dataToSend);
        enqueueSnackbar('✅ Item criado com sucesso', { variant: 'success' });
      }

      loadItems();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar item';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('⚠️ Deseja realmente excluir este item?')) return;

    try {
      await api.delete(`/items/${id}`);
      enqueueSnackbar('✅ Item excluído com sucesso', { variant: 'success' });
      loadItems();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir item';
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' });
    }
  };

  // Filtrar itens
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && item.active) ||
        (filterStatus === 'INACTIVE' && !item.active);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.active).length;
    const inactive = total - active;
    const withColors = items.filter((i) => i.colors && i.colors.length > 0).length;
    const totalColors = items.reduce((sum, i) => sum + (i.colors?.length || 0), 0);

    return { total, active, inactive, withColors, totalColors };
  }, [items]);

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<ItemIcon />}
        title="Itens/Produtos"
        subtitle="Gerenciamento de itens e produtos do sistema"
        iconGradient="linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)"
      />

      {/*, s de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total de Itens"
            value={stats.total}
            subtitle="Cadastrados no sistema"
            icon={<ItemIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Ativos"
            value={stats.active}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total`}
            icon={<ItemIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Com Cores"
            value={stats.withColors}
            subtitle={`${stats.totalColors} cores associadas`}
            icon={<ColorIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Inativos"
            value={stats.inactive}
            subtitle={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% do total`}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Barra de Ações e Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Buscar por nome ou código..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )}}
          />

          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 130 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              )}}
          >
            <option value="ALL">Todos Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Novo Item
          </Button>
        </Stack>
      </Paper>

      {/* Tabela de Itens */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: { xs: 'calc(100vh - 550px)', md: 'calc(100vh - 500px)' },
          overflow: 'auto',
          '& .MuiTableCell-head': {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 600,
            fontSize: '0.875rem'}}}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Unidade</TableCell>
              <TableCell>Cores</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'ALL'
                      ? 'Nenhum item encontrado com os filtros aplicados'
                      : 'Nenhum item cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)}}}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {item.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.unit}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    {item.colors && item.colors.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {item.colors.slice(0, 3).map((color) => (
                          <Tooltip key={color.id} title={color.name}>
                            <Chip
                              label={color.code}
                              size="small"
                              sx={{
                                backgroundColor: color.hexCode || '#ccc',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.7rem'}}
                            />
                          </Tooltip>
                        ))}
                        {item.colors.length > 3 && (
                          <Chip
                            label={`+${item.colors.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={item.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ItemIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingId ? 'Editar Item' : 'Novo Item'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Código"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: ITEM001"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome do Item"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Tampa 500ml Branca"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do item"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Unidade"
                fullWidth
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                SelectProps={{ native: true }}
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'}}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.active ? 'Ativo' : 'Inativo'}
                  </Typography>
                </Box>
                <Chip
                  label={formData.active ? 'Ativo' : 'Inativo'}
                  color={formData.active ? 'success' : 'default'}
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                />
              </Box>
            </Grid>
            
            {/* Custos */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 1 }}>
                💰 Custos (R$ por {formData.unit || 'unidade'})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Custo Material"
                type="number"
                fullWidth
                value={formData.materialCost}
                onChange={(e) => setFormData({ ...formData, materialCost: e.target.value })}
                placeholder="0,00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{
                  step: '0.01',
                  min: '0'
                }}
                helperText="Custo de material por unidade"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Custo Mão-de-Obra"
                type="number"
                fullWidth
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                placeholder="0,00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{
                  step: '0.01',
                  min: '0'
                }}
                helperText="Custo de mão-de-obra por unidade"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Custo Refugo"
                type="number"
                fullWidth
                value={formData.scrapCost}
                onChange={(e) => setFormData({ ...formData, scrapCost: e.target.value })}
                placeholder="0,00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{
                  step: '0.01',
                  min: '0'
                }}
                helperText="Custo de refugo/desperdício por unidade"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={colors.filter(c => c.active)}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                value={formData.colors}
                onChange={(_, newValue) => setFormData({ ...formData, colors: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cores Disponíveis"
                    placeholder="Selecione as cores"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <ColorIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )}}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.code}
                      size="small"
                      sx={{
                        backgroundColor: option.hexCode || '#ccc',
                        color: '#fff',
                        fontWeight: 600}}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} startIcon={<AddIcon />}>
            {editingId ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Items;
