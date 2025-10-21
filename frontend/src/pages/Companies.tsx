/**
 * Página de gerenciamento de empresas
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface Company {
  id: number;
  code: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sectors: number;
    productionOrders: number;
  };
}

interface CompanyFormData {
  code: string;
  name: string;
  tradeName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
}

const initialFormData: CompanyFormData = {
  code: '',
  name: '',
  tradeName: '',
  cnpj: '',
  address: '',
  phone: '',
  email: '',
  active: true,
};

export default function Companies() {
  const { enqueueSnackbar } = useSnackbar();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

  // Carregar empresas
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error: any) {
      enqueueSnackbar('Erro ao carregar empresas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        code: company.code,
        name: company.name,
        tradeName: company.tradeName || '',
        cnpj: company.cnpj || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        active: company.active,
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
      // Validações básicas
      if (!formData.code || !formData.name) {
        enqueueSnackbar('Código e nome são obrigatórios', { variant: 'warning' });
        return;
      }

      // Limpar campos vazios
      const dataToSend = {
        ...formData,
        tradeName: formData.tradeName || null,
        cnpj: formData.cnpj || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
      };

      if (editingId) {
        await api.put(`/companies/${editingId}`, dataToSend);
        enqueueSnackbar('Empresa atualizada com sucesso', { variant: 'success' });
      } else {
        await api.post('/companies', dataToSend);
        enqueueSnackbar('Empresa criada com sucesso', { variant: 'success' });
      }

      handleCloseDialog();
      loadCompanies();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar empresa';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      return;
    }

    try {
      await api.delete(`/companies/${id}`);
      enqueueSnackbar('Empresa excluída com sucesso', { variant: 'success' });
      loadCompanies();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao excluir empresa';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleChange = (field: keyof CompanyFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    if (cnpj.length !== 14) return cnpj;
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Empresas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Empresa
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Nome Fantasia</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Setores</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma empresa cadastrada
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>{company.code}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.tradeName || '-'}</TableCell>
                  <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
                  <TableCell>{company.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${company._count?.sectors || 0} setores`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.active ? 'Ativo' : 'Inativo'}
                      color={company.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(company.id)}
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

      {/* Dialog de Formulário */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Empresa' : 'Nova Empresa'}
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
                fullWidth
                label="Nome Fantasia"
                value={formData.tradeName}
                onChange={handleChange('tradeName')}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNPJ"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                inputProps={{ maxLength: 14 }}
                helperText="Apenas números"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço"
                value={formData.address}
                onChange={handleChange('address')}
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={handleChange('phone')}
                inputProps={{ maxLength: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                inputProps={{ maxLength: 100 }}
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

