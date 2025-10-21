/**
 * Página de Cadastro de Itens
 */

import React, { useEffect, useState } from 'react';
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
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { Item } from '../types';
import { useSnackbar } from 'notistack';

// Schema de validação
const itemSchema = yup.object({
  code: yup.string().required('Código é obrigatório').max(50),
  name: yup.string().required('Nome é obrigatório').max(200),
  description: yup.string().max(500),
  unit: yup.string().required('Unidade é obrigatória').max(20),
  active: yup.boolean(),
});

type ItemFormData = yup.InferType<typeof itemSchema>;

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>({
    resolver: yupResolver(itemSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      unit: 'pç',
      active: true,
    },
  });

  const loadItems = async () => {
    try {
      const response = await api.get<Item[]>('/items');
      setItems(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar itens', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      reset(item);
    } else {
      setEditingItem(null);
      reset({
        code: '',
        name: '',
        description: '',
        unit: 'pç',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem.id}`, data);
        enqueueSnackbar('Item atualizado com sucesso!', { variant: 'success' });
      } else {
        await api.post('/items', data);
        enqueueSnackbar('Item criado com sucesso!', { variant: 'success' });
      }
      loadItems();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar item';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este item?')) return;

    try {
      await api.delete(`/items/${id}`);
      enqueueSnackbar('Item excluído com sucesso!', { variant: 'success' });
      loadItems();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir item';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Itens</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <Chip
                    label={item.active ? 'Ativo' : 'Inativo'}
                    color={item.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(item)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingItem ? 'Editar Item' : 'Novo Item'}
          </DialogTitle>
          <DialogContent>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Código"
                  fullWidth
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Unidade (ex: pç, kg, m)"
                  fullWidth
                  margin="normal"
                  error={!!errors.unit}
                  helperText={errors.unit?.message}
                />
              )}
            />
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Ativo"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Items;


