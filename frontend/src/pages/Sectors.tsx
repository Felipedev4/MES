/**
 * Página de gerenciamento de setores
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
  AccountTree as SectorIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface Company {
  id: number;
  code: string;
  name: string;
}

interface Sector {
  id: number;
  companyId: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  _count?: {
    plcConfigs: number;
    productionOrders: number;
  };
}

interface SectorFormData {
  companyId: string;
  code: string;
  name: string;
  active: boolean;
}

const initialFormData: SectorFormData = {
  companyId: '',
  code: '',
  name: '',
  active: true,
};

export default function Sectors() {
  const { enqueueSnackbar } = useSnackbar();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SectorFormData>(initialFormData);

  useEffect(() => {
    loadSectors();
    loadCompanies();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar setores', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar empresas', { variant: 'error' });
    }
  };

  const handleOpenDialog = (sector?: Sector) => {
    if (sector) {
      setEditingId(sector.id);
      setFormData({
        companyId: sector.companyId.toString(),
        code: sector.code,
        name: sector.name,
        active: sector.active,
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
      if (!formData.companyId || !formData.code || !formData.name) {
        enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
        return;
      }

      const dataToSend = {
        companyId: parseInt(formData.companyId),
        code: formData.code,
        name: formData.name,
        active: formData.active,
      };

      if (editingId) {
        await api.put(`/sectors/${editingId}`, dataToSend);
        enqueueSnackbar('Setor atualizado com sucesso', { variant: 'success' });
      } else {
        await api.post('/sectors', dataToSend);
        enqueueSnackbar('Setor criado com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadSectors();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar setor';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este setor?')) {
      return;
    }

    try {
      await api.delete(`/sectors/${id}`);
      enqueueSnackbar('Setor excluído com sucesso', { variant: 'success' });
      loadSectors();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir setor';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof SectorFormData) => (
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
          <SectorIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Setores
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Setor
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>CLPs</TableCell>
              <TableCell>Ordens</TableCell>
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
            ) : sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum setor cadastrado
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => (
                <TableRow key={sector.id} hover>
                  <TableCell>{sector.code}</TableCell>
                  <TableCell>{sector.name}</TableCell>
                  <TableCell>{sector.company?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={sector._count?.plcConfigs || 0}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sector._count?.productionOrders || 0}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sector.active ? 'Ativo' : 'Inativo'}
                      color={sector.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(sector)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(sector.id)}
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
          {editingId ? 'Editar Setor' : 'Novo Setor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                required
                label="Empresa"
                value={formData.companyId}
                onChange={handleChange('companyId')}
              >
                <MenuItem value="">Selecione uma empresa</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
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

