/**
 * Página de gerenciamento de tipos de atividade
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ActivityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    downtimes: number;
  };
}

interface ActivityTypeFormData {
  code: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
}

const initialFormData: ActivityTypeFormData = {
  code: '',
  name: '',
  description: '',
  color: '#1976d2',
  active: true,
};

export default function ActivityTypes() {
  const { enqueueSnackbar } = useSnackbar();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ActivityTypeFormData>(initialFormData);

  useEffect(() => {
    loadActivityTypes();
  }, []);

  const loadActivityTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activity-types');
      setActivityTypes(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar tipos de atividade', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (activityType?: ActivityType) => {
    if (activityType) {
      setEditingId(activityType.id);
      setFormData({
        code: activityType.code,
        name: activityType.name,
        description: activityType.description || '',
        color: activityType.color || '#1976d2',
        active: activityType.active,
      });
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
      if (!formData.code || !formData.name) {
        enqueueSnackbar('Código e nome são obrigatórios', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        color: formData.color || null,
        active: formData.active,
      };

      if (editingId) {
        await api.put(`/activity-types/${editingId}`, dataToSend);
        enqueueSnackbar('Tipo de atividade atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/activity-types', dataToSend);
        enqueueSnackbar('Tipo de atividade criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadActivityTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar tipo de atividade';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de atividade?')) {
      return;
    }

    try {
      await api.delete(`/activity-types/${id}`);
      enqueueSnackbar('Tipo de atividade excluído com sucesso', { variant: 'success' });
      loadActivityTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir tipo de atividade';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof ActivityTypeFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'active' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <CategoryIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Tipos de Atividade
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Tipo
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Cor</TableCell>
              <TableCell>Paradas</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : activityTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum tipo de atividade cadastrado
                </TableCell>
              </TableRow>
            ) : (
              activityTypes.map((activityType) => (
                <TableRow key={activityType.id} hover>
                  <TableCell>{activityType.code}</TableCell>
                  <TableCell>{activityType.name}</TableCell>
                  <TableCell>{activityType.description || '-'}</TableCell>
                  <TableCell>
                    {activityType.color && (
                      <Box
                        sx={{
                          width: 40,
                          height: 24,
                          backgroundColor: activityType.color,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activityType._count?.downtimes || 0}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activityType.active ? 'Ativo' : 'Inativo'}
                      color={activityType.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(activityType)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(activityType.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Tipo de Atividade' : 'Novo Tipo de Atividade'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Código"
                value={formData.code}
                onChange={handleChange('code')}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome"
                value={formData.name}
                onChange={handleChange('name')}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="color"
                label="Cor"
                value={formData.color}
                onChange={handleChange('color')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleChange('active')}
                  />
                }
                label="Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

