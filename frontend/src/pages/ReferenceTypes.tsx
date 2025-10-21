/**
 * Página de gerenciamento de tipos de referência
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
  Label as LabelIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ReferenceType {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

interface ReferenceTypeFormData {
  code: string;
  name: string;
  active: boolean;
}

const initialFormData: ReferenceTypeFormData = {
  code: '',
  name: '',
  active: true,
};

export default function ReferenceTypes() {
  const { enqueueSnackbar } = useSnackbar();
  const [referenceTypes, setReferenceTypes] = useState<ReferenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ReferenceTypeFormData>(initialFormData);

  useEffect(() => {
    loadReferenceTypes();
  }, []);

  const loadReferenceTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reference-types');
      setReferenceTypes(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar tipos de referência', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (referenceType?: ReferenceType) => {
    if (referenceType) {
      setEditingId(referenceType.id);
      setFormData({
        code: referenceType.code,
        name: referenceType.name,
        active: referenceType.active,
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

      if (editingId) {
        await api.put(`/reference-types/${editingId}`, formData);
        enqueueSnackbar('Tipo de referência atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/reference-types', formData);
        enqueueSnackbar('Tipo de referência criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadReferenceTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar tipo de referência';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de referência?')) {
      return;
    }

    try {
      await api.delete(`/reference-types/${id}`);
      enqueueSnackbar('Tipo de referência excluído com sucesso', { variant: 'success' });
      loadReferenceTypes();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir tipo de referência';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof ReferenceTypeFormData) => (
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
          <LabelIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Tipos de Referência
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
              <TableCell>Itens Vinculados</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : referenceTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum tipo de referência cadastrado
                </TableCell>
              </TableRow>
            ) : (
              referenceTypes.map((referenceType) => (
                <TableRow key={referenceType.id} hover>
                  <TableCell>{referenceType.code}</TableCell>
                  <TableCell>{referenceType.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${referenceType._count?.items || 0} itens`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={referenceType.active ? 'Ativo' : 'Inativo'}
                      color={referenceType.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(referenceType)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(referenceType.id)}
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
          {editingId ? 'Editar Tipo de Referência' : 'Novo Tipo de Referência'}
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

