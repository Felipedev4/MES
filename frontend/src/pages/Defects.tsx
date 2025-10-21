/**
 * Página de gerenciamento de defeitos
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
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as DefectIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface Defect {
  id: number;
  code: string;
  name: string;
  severity: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    productionDefects: number;
  };
}

interface DefectFormData {
  code: string;
  name: string;
  severity: string;
  active: boolean;
}

const initialFormData: DefectFormData = {
  code: '',
  name: '',
  severity: 'MINOR',
  active: true,
};

const severityOptions = [
  { value: 'CRITICAL', label: 'Crítico', color: 'error' as const },
  { value: 'MAJOR', label: 'Maior', color: 'warning' as const },
  { value: 'MINOR', label: 'Menor', color: 'info' as const },
];

export default function Defects() {
  const { enqueueSnackbar } = useSnackbar();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DefectFormData>(initialFormData);

  useEffect(() => {
    loadDefects();
  }, []);

  const loadDefects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/defects');
      setDefects(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar defeitos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (defect?: Defect) => {
    if (defect) {
      setEditingId(defect.id);
      setFormData({
        code: defect.code,
        name: defect.name,
        severity: defect.severity,
        active: defect.active,
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
        await api.put(`/defects/${editingId}`, formData);
        enqueueSnackbar('Defeito atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/defects', formData);
        enqueueSnackbar('Defeito criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadDefects();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar defeito';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este defeito?')) {
      return;
    }

    try {
      await api.delete(`/defects/${id}`);
      enqueueSnackbar('Defeito excluído com sucesso', { variant: 'success' });
      loadDefects();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir defeito';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof DefectFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'active' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const getSeverityInfo = (severity: string) => {
    return severityOptions.find(opt => opt.value === severity) || severityOptions[2];
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <DefectIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Defeitos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Defeito
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Severidade</TableCell>
              <TableCell>Ocorrências</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : defects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum defeito cadastrado
                </TableCell>
              </TableRow>
            ) : (
              defects.map((defect) => {
                const severityInfo = getSeverityInfo(defect.severity);
                return (
                  <TableRow key={defect.id} hover>
                    <TableCell>{defect.code}</TableCell>
                    <TableCell>{defect.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={severityInfo.label}
                        color={severityInfo.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={defect._count?.productionDefects || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={defect.active ? 'Ativo' : 'Inativo'}
                        color={defect.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(defect)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(defect.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Defeito' : 'Novo Defeito'}
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
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Severidade"
                value={formData.severity}
                onChange={handleChange('severity')}
              >
                {severityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
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

