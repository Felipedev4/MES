import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  MenuItem,
  Typography,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  WbSunny as WbSunnyIcon,
  Bedtime as BedtimeIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/Layout/PageHeader';
import api from '../services/api';

interface Company {
  id: number;
  name: string;
  code: string;
}

interface Shift {
  id: number;
  companyId: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  description?: string;
  active: boolean;
  company?: Company;
}

export default function Shifts() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form fields
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadCompanies();
    loadShifts();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadShifts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shifts');
      setShifts(response.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar turnos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setCompanyId(shift.companyId);
      setName(shift.name);
      setCode(shift.code);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      setDescription(shift.description || '');
      setActive(shift.active);
    } else {
      setEditingShift(null);
      setCompanyId('');
      setName('');
      setCode('');
      setStartTime('');
      setEndTime('');
      setDescription('');
      setActive(true);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingShift(null);
  };

  const handleSave = async () => {
    if (!companyId || !name || !code || !startTime || !endTime) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
      return;
    }

    try {
      const data = {
        companyId,
        name,
        code,
        startTime,
        endTime,
        description,
        active,
      };

      if (editingShift) {
        await api.put(`/shifts/${editingShift.id}`, data);
        enqueueSnackbar('Turno atualizado com sucesso!', { variant: 'success' });
      } else {
        await api.post('/shifts', data);
        enqueueSnackbar('Turno criado com sucesso!', { variant: 'success' });
      }

      handleCloseDialog();
      loadShifts();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao salvar turno', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este turno?')) return;

    try {
      await api.delete(`/shifts/${id}`);
      enqueueSnackbar('Turno deletado com sucesso!', { variant: 'success' });
      loadShifts();
    } catch (error) {
      enqueueSnackbar('Erro ao deletar turno', { variant: 'error' });
    }
  };

  const getShiftIcon = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 18) return <WbSunnyIcon />;
    return <BedtimeIcon />;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<AccessTimeIcon />}
        title="Turnos"
        subtitle="Gerenciamento de turnos de trabalho"
        iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
        >
          Novo Turno
        </Button>
      </Box>

      <TableContainer 
        component={Paper}
        sx={{
          maxHeight: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 300px)' },
          overflow: 'auto',
          '& .MuiTableCell-head': {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Empresa</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {shift.company?.name || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {shift.company?.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getShiftIcon(shift.startTime)}
                    <Typography variant="body2" fontWeight={500}>
                      {shift.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={shift.code} 
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {shift.startTime} - {shift.endTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(() => {
                        const start = parseInt(shift.startTime.split(':')[0]);
                        const end = parseInt(shift.endTime.split(':')[0]);
                        let duration = end - start;
                        if (duration < 0) duration += 24;
                        return `${duration}h de duração`;
                      })()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {shift.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={shift.active ? 'Ativo' : 'Inativo'}
                    color={shift.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(shift)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(shift.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EventNoteIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {editingShift ? 'Editar Turno' : 'Novo Turno'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              select
              label="Empresa"
              value={companyId}
              onChange={(e) => setCompanyId(Number(e.target.value))}
              required
              fullWidth
              disabled={!!editingShift}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nome do Turno"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="Ex: 1º Turno, Turno Matutino"
            />

            <TextField
              label="Código"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              fullWidth
              placeholder="Ex: T1, MAT"
              inputProps={{ maxLength: 10 }}
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Horário Início"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Horário Fim"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Turno Matutino - Produção"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Turno Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {editingShift ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

