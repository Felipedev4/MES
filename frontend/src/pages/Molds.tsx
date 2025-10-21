/**
 * Página de Cadastro de Moldes
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
import { Mold } from '../types';
import { useSnackbar } from 'notistack';
import moment from 'moment';

// Schema de validação
const moldSchema = yup.object({
  code: yup.string().required('Código é obrigatório').max(50),
  name: yup.string().required('Nome é obrigatório').max(200),
  description: yup.string().max(500),
  cavities: yup.number().required('Número de cavidades é obrigatório').positive().integer(),
  cycleTime: yup.number().positive().nullable(),
  maintenanceDate: yup.date().nullable(),
  active: yup.boolean(),
});

type MoldFormData = yup.InferType<typeof moldSchema>;

const Molds: React.FC = () => {
  const [molds, setMolds] = useState<Mold[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMold, setEditingMold] = useState<Mold | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MoldFormData>({
    resolver: yupResolver(moldSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      cavities: 1,
      cycleTime: undefined,
      maintenanceDate: undefined,
      active: true,
    },
  });

  const loadMolds = async () => {
    try {
      const response = await api.get<Mold[]>('/molds');
      setMolds(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar moldes', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadMolds();
  }, []);

  const handleOpenDialog = (mold?: Mold) => {
    if (mold) {
      setEditingMold(mold);
      reset({
        ...mold,
        maintenanceDate: mold.maintenanceDate ? new Date(mold.maintenanceDate) as any : undefined,
      });
    } else {
      setEditingMold(null);
      reset({
        code: '',
        name: '',
        description: '',
        cavities: 1,
        cycleTime: undefined,
        maintenanceDate: undefined,
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMold(null);
    reset();
  };

  const onSubmit = async (data: MoldFormData) => {
    try {
      if (editingMold) {
        await api.put(`/molds/${editingMold.id}`, data);
        enqueueSnackbar('Molde atualizado com sucesso!', { variant: 'success' });
      } else {
        await api.post('/molds', data);
        enqueueSnackbar('Molde criado com sucesso!', { variant: 'success' });
      }
      loadMolds();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar molde';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este molde?')) return;

    try {
      await api.delete(`/molds/${id}`);
      enqueueSnackbar('Molde excluído com sucesso!', { variant: 'success' });
      loadMolds();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir molde';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Moldes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Molde
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Cavidades</TableCell>
              <TableCell>Tempo de Ciclo (s)</TableCell>
              <TableCell>Próxima Manutenção</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {molds.map((mold) => (
              <TableRow key={mold.id}>
                <TableCell>{mold.code}</TableCell>
                <TableCell>{mold.name}</TableCell>
                <TableCell>{mold.cavities}</TableCell>
                <TableCell>{mold.cycleTime || '-'}</TableCell>
                <TableCell>
                  {mold.maintenanceDate ? moment(mold.maintenanceDate).format('DD/MM/YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={mold.active ? 'Ativo' : 'Inativo'}
                    color={mold.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(mold)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(mold.id)} size="small" color="error">
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
            {editingMold ? 'Editar Molde' : 'Novo Molde'}
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
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="cavities"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número de Cavidades"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.cavities}
                  helperText={errors.cavities?.message}
                />
              )}
            />
            <Controller
              name="cycleTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tempo de Ciclo (segundos)"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.cycleTime}
                  helperText={errors.cycleTime?.message}
                />
              )}
            />
            <Controller
              name="maintenanceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data da Próxima Manutenção"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.maintenanceDate}
                  helperText={errors.maintenanceDate?.message}
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

export default Molds;


