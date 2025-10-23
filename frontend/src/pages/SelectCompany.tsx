import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';

interface Company {
  id: number;
  code: string;
  name: string;
  tradeName?: string;
  isDefault: boolean;
}

interface LocationState {
  user: {
    id: number;
    name: string;
    email: string;
  };
  companies: Company[];
}

export default function SelectCompany() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectCompany: selectCompanyContext } = useAuth();
  const { user, companies } = (location.state as LocationState) || { user: null, companies: [] };

  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(
    companies.find((c) => c.isDefault)?.id || companies[0]?.id || 0
  );
  const [loading, setLoading] = useState(false);

  // Se não tiver empresas, redireciona para login
  if (!user || !companies || companies.length === 0) {
    navigate('/login');
    return null;
  }

  const handleSelectCompany = async () => {
    setLoading(true);
    try {
      // Usar a função do contexto para atualizar o estado
      await selectCompanyContext(selectedCompanyId);
      
      console.log('✅ Empresa selecionada com sucesso!');
      
      // Redirecionar para dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao selecionar empresa:', error);
      alert(error.response?.data?.error || 'Erro ao selecionar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
          <Box textAlign="center" mb={4}>
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Selecione a Empresa
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Olá, <strong>{user.name}</strong>! Você tem acesso a {companies.length} empresa
              {companies.length > 1 ? 's' : ''}.
            </Typography>
          </Box>

          <Grid container spacing={2} mb={4}>
            {companies.map((company) => (
              <Grid item xs={12} sm={6} key={company.id}>
                <Card
                  elevation={selectedCompanyId === company.id ? 8 : 2}
                  sx={{
                    border: selectedCompanyId === company.id ? '3px solid' : '1px solid transparent',
                    borderColor: selectedCompanyId === company.id ? 'primary.main' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea onClick={() => setSelectedCompanyId(company.id)}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {company.name}
                        </Typography>
                        {selectedCompanyId === company.id && (
                          <CheckCircleIcon color="primary" />
                        )}
                      </Box>

                      {company.tradeName && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {company.tradeName}
                        </Typography>
                      )}

                      <Box display="flex" gap={1} mt={2}>
                        <Chip label={company.code} size="small" color="default" />
                        {company.isDefault && (
                          <Chip label="Padrão" size="small" color="primary" />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSelectCompany}
              disabled={!selectedCompanyId || loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {loading ? 'Carregando...' : 'Continuar'}
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Voltar ao Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

