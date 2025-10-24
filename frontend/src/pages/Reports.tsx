/**
 * Página de Relatórios - Design Profissional
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Stack,
  TextField,
  Button,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TrendingUp as ProductionIcon,
  BugReport as DefectIcon,
  PauseCircle as DowntimeIcon,
  Speed as EfficiencyIcon,
  Assignment as OrderIcon,
  CalendarToday as CalendarIcon,
  Business as CompanyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { exportToExcel, exportToPDF, formatDate } from '../utils/exportUtils';
import { format } from 'date-fns';

interface Company {
  id: number;
  name: string;
}

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'production',
    title: 'Relatório de Produção',
    description: 'Produção realizada por período, item e máquina',
    icon: <ProductionIcon sx={{ fontSize: 40 }} />,
    color: '#2196f3',
  },
  {
    id: 'defects',
    title: 'Relatório de Defeitos',
    description: 'Defeitos registrados por tipo e setor',
    icon: <DefectIcon sx={{ fontSize: 40 }} />,
    color: '#f44336',
  },
  {
    id: 'downtime',
    title: 'Relatório de Paradas',
    description: 'Paradas de produção e tempo de inatividade',
    icon: <DowntimeIcon sx={{ fontSize: 40 }} />,
    color: '#ff9800',
  },
  {
    id: 'efficiency',
    title: 'Relatório de Eficiência (OEE)',
    description: 'Indicadores de eficiência e produtividade',
    icon: <EfficiencyIcon sx={{ fontSize: 40 }} />,
    color: '#4caf50',
  },
  {
    id: 'orders',
    title: 'Relatório de Ordens',
    description: 'Status e conclusão de ordens de produção',
    icon: <OrderIcon sx={{ fontSize: 40 }} />,
    color: '#9c27b0',
  },
];

export default function Reports() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [companyId, setCompanyId] = useState<string>('ALL');
  
  useEffect(() => {
    loadCompanies();
  }, []);
  
  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };
  
  const loadReport = async () => {
    if (!selectedReport) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/reports/${selectedReport}`, {
        params: {
          startDate,
          endDate,
          companyId: companyId === 'ALL' ? undefined : companyId,
        },
      });
      setReportData(response.data);
      
      if (response.data.length === 0) {
        enqueueSnackbar('Nenhum registro encontrado no período selecionado. Tente ajustar as datas!', { 
          variant: 'warning',
          autoHideDuration: 6000,
        });
      } else {
        enqueueSnackbar(`Relatório gerado com sucesso! ${response.data.length} registro(s) encontrado(s)`, { 
          variant: 'success' 
        });
      }
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Erro ao gerar relatório', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      enqueueSnackbar('Não há dados para exportar', { variant: 'warning' });
      return;
    }
    
    const report = reportTypes.find(r => r.id === selectedReport);
    const fileName = `${report?.title}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`;
    
    exportToExcel(reportData, fileName, report?.title);
    enqueueSnackbar('Relatório exportado para Excel!', { variant: 'success' });
  };
  
  const handleExportPDF = () => {
    if (reportData.length === 0) {
      enqueueSnackbar('Não há dados para exportar', { variant: 'warning' });
      return;
    }
    
    const report = reportTypes.find(r => r.id === selectedReport);
    const fileName = `${report?.title}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`;
    
    // Preparar dados para PDF
    const headers = Object.keys(reportData[0] || {});
    const data = reportData.map(row => headers.map(header => row[header]));
    
    const filters = [
      { label: 'Período', value: `${formatDate(startDate)} a ${formatDate(endDate)}` },
      { label: 'Empresa', value: companyId === 'ALL' ? 'Todas' : companies.find(c => c.id.toString() === companyId)?.name || '-' },
    ];
    
    exportToPDF(report?.title || 'Relatório', headers, data, fileName, filters);
    enqueueSnackbar('Relatório exportado para PDF!', { variant: 'success' });
  };
  
  const currentReport = reportTypes.find(r => r.id === selectedReport);
  
  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<ReportIcon />}
        title="Relatórios"
        subtitle="Geração e exportação de relatórios gerenciais"
        iconGradient="linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)"
      />
      
      {!selectedReport ? (
        // Seleção de tipo de relatório
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Selecione o tipo de relatório:
          </Typography>
          
          <Grid container spacing={3}>
            {reportTypes.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(report.color, 0.3)}`,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelectedReport(report.id)}
                    sx={{ height: '100%', p: 3 }}
                  >
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${report.color} 0%, ${alpha(report.color, 0.7)} 100%)`,
                          color: 'white',
                        }}
                      >
                        {report.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={700}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        // Visualização do relatório
        <>
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedReport(null);
                setReportData([]);
              }}
            >
              ← Voltar
            </Button>
            <Chip
              label={currentReport?.title}
              sx={{
                fontWeight: 600,
                fontSize: 14,
                py: 2.5,
                px: 1,
                background: `linear-gradient(135deg, ${currentReport?.color} 0%, ${alpha(currentReport?.color || '#000', 0.7)} 100%)`,
                color: 'white',
              }}
            />
          </Stack>
          
          {/* Filtros */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} mb={2}>
              Filtros
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  fullWidth
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Final"
                  type="date"
                  fullWidth
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Empresa"
                  fullWidth
                  size="small"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CompanyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="ALL">Todas as empresas</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={loadReport}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                >
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Ações de exportação */}
          {reportData.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={handleExportExcel}
                >
                  Exportar Excel
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PdfIcon />}
                  onClick={handleExportPDF}
                >
                  Exportar PDF
                </Button>
              </Stack>
            </Paper>
          )}
          
          {/* Tabela de dados */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress size={60} />
            </Box>
          ) : reportData.length === 0 ? (
            <Alert 
              severity="warning"
              sx={{ 
                fontSize: '1rem',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Typography variant="body1" fontWeight={600} gutterBottom>
                ⚠️ Nenhum registro encontrado
              </Typography>
              <Typography variant="body2" paragraph>
                Não foram encontrados dados para o período selecionado:
              </Typography>
              <Box sx={{ pl: 2, mb: 1 }}>
                <Typography variant="body2">
                  • <strong>Data Início:</strong> {formatDate(startDate)}
                </Typography>
                <Typography variant="body2">
                  • <strong>Data Fim:</strong> {formatDate(endDate)}
                </Typography>
                <Typography variant="body2">
                  • <strong>Empresa:</strong> {companyId === 'ALL' ? 'Todas' : companies.find(c => c.id.toString() === companyId)?.name || '-'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                💡 <strong>Dica:</strong> Tente ampliar o período de datas ou selecionar "Todas" as empresas.
              </Typography>
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 'calc(100vh - 500px)',
                overflow: 'auto',
                '& .MuiTableCell-head': {
                  backgroundColor: theme.palette.grey[100],
                  fontWeight: 600,
                  fontSize: '0.875rem',
                },
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(reportData[0] || {}).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index} hover>
                      {Object.values(row).map((value: any, colIndex) => (
                        <TableCell key={colIndex}>
                          {typeof value === 'number' && !Number.isInteger(value)
                            ? value.toFixed(2)
                            : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}

