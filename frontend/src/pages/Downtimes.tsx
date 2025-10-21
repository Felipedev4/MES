/**
 * Página de Paradas (Downtimes)
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { Downtime, DowntimeType } from '../types';
import { useSnackbar } from 'notistack';
import moment from 'moment';

// Schema de validação
const downtimeSchema = yup.object({
  type: yup.string().required('Tipo é obrigatório').oneOf(['PRODUCTIVE', 'UNPRODUCTIVE', 'PLANNED']),
  reason: yup.string().required('Motivo é obrigatório').max(200),
  description: yup.string().max(1000),
  startTime: yup.date().required('Data/hora de início é obrigatória'),
  endTime: yup.date().nullable(),
});

type DowntimeFormData = yup.InferType<typeof downtimeSchema>;

const Downtimes: React.FC = () => {
  const [downtimes, setDowntimes] = useState<Downtime[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DowntimeFormData>({
    resolver: yupResolver(downtimeSchema),
    defaultValues: {
      type: 'UNPRODUCTIVE' as any,
      reason: '',
      description: '',
      startTime: new Date() as any,
      endTime: undefined,
    },
  });

  const loadDowntimes = async () => {
    try {
      const response = await api.get<Downtime[]>('/downtimes');
      setDowntimes(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar paradas', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadDowntimes();
  }, []);

  const handleOpenDialog = () => {
    reset({
      type: 'UNPRODUCTIVE' as any,
      reason: '',
      description: '',
      startTime: new Date() as any,
      endTime: undefined,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    reset();
  };

  const onSubmit = async (data: DowntimeFormData) => {
    try {
      await api.post('/downtimes', data);
      enqueueSnackbar('Parada registrada com sucesso!', { variant: 'success' });
      loadDowntimes();
      handleCloseDialog();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar parada';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const getTypeColor = (type: DowntimeType) => {
    const colors = {
      PRODUCTIVE: 'primary',
      UNPRODUCTIVE: 'error',
      PLANNED: 'warning',
    };
    return colors[type] as any;
  };

  const getTypeLabel = (type: DowntimeType) => {
    const labels = {
      PRODUCTIVE: 'Produtiva',
      UNPRODUCTIVE: 'Improdutiva',
      PLANNED: 'Planejada',
    };
    return labels[type];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Paradas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Registrar Parada
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {downtimes.map((downtime: any) => (
              <TableRow key={downtime.id}>
                <TableCell>
                  <Chip
                    label={getTypeLabel(downtime.type)}
                    color={getTypeColor(downtime.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{downtime.reason}</TableCell>
                <TableCell>{moment(downtime.startTime).format('DD/MM/YYYY HH:mm')}</TableCell>
                <TableCell>
                  {downtime.endTime ? moment(downtime.endTime).format('DD/MM/YYYY HH:mm') : '-'}
                </TableCell>
                <TableCell>{downtime.durationFormatted || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={downtime.isActive ? 'Em Andamento' : 'Finalizada'}
                    color={downtime.isActive ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Registro */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Registrar Parada</DialogTitle>
          <DialogContent>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo de Parada"
                  fullWidth
                  margin="normal"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  <MenuItem value="PRODUCTIVE">Produtiva</MenuItem>
                  <MenuItem value="UNPRODUCTIVE">Improdutiva</MenuItem>
                  <MenuItem value="PLANNED">Planejada</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Motivo"
                  fullWidth
                  margin="normal"
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
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
              name="startTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data/Hora de Início"
                  type="datetime-local"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.startTime}
                  helperText={errors.startTime?.message}
                />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data/Hora de Fim (opcional)"
                  type="datetime-local"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endTime}
                  helperText={errors.endTime?.message}
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

export default Downtimes;


