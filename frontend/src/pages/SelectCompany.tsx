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
  Stack,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
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
  const theme = useTheme();

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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            animation: 'fadeInUp 0.6s ease-out',
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Paper 
            elevation={24} 
            sx={{ 
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite',
              },
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' },
              },
            }}
          >
            {/* Logo e Cabeçalho */}
            <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '22px',
                    padding: '3px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0.5,
                  },
                }}
              >
                <ApartmentIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Box textAlign="center">
                <Typography 
                  variant="h4" 
                  component="h1" 
                  fontWeight={700}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 1,
                  }}
                >
                  Selecione a Empresa
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Olá, <strong>{user.name}</strong>! Você tem acesso a{' '}
                  <strong>{companies.length}</strong> empresa{companies.length > 1 ? 's' : ''}.
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 4, opacity: 0.6 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Escolha uma Empresa
              </Typography>
            </Divider>

            {/* Grid de Empresas */}
            <Grid container spacing={3} mb={4}>
              {companies.map((company) => {
                const isSelected = selectedCompanyId === company.id;
                
                return (
                  <Grid item xs={12} sm={6} key={company.id}>
                    <Card
                      elevation={isSelected ? 8 : 2}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                        background: isSelected 
                          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                          : 'background.paper',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                      }}
                    >
                      <CardActionArea 
                        onClick={() => setSelectedCompanyId(company.id)}
                        sx={{ height: '100%' }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2}>
                            {/* Header com Ícone e Check */}
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '12px',
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                                  border: isSelected ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s',
                                }}
                              >
                                <BusinessIcon 
                                  sx={{ 
                                    fontSize: 24, 
                                    color: theme.palette.primary.main,
                                  }} 
                                />
                              </Box>
                              
                              {isSelected && (
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                                    animation: 'checkBounce 0.5s ease-out',
                                    '@keyframes checkBounce': {
                                      '0%': { transform: 'scale(0)', opacity: 0 },
                                      '50%': { transform: 'scale(1.2)' },
                                      '100%': { transform: 'scale(1)', opacity: 1 },
                                    },
                                  }}
                                >
                                  <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                                </Box>
                              )}
                            </Stack>

                            {/* Nome e Nome Fantasia */}
                            <Box>
                              <Typography 
                                variant="h6" 
                                fontWeight={700}
                                sx={{
                                  mb: 0.5,
                                  color: isSelected ? theme.palette.primary.main : 'text.primary',
                                  transition: 'color 0.3s',
                                }}
                              >
                                {company.name}
                              </Typography>
                              {company.tradeName && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: 13 }}
                                >
                                  {company.tradeName}
                                </Typography>
                              )}
                            </Box>

                            {/* Chips */}
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip 
                                label={company.code} 
                                size="small" 
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 11,
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
                                    : alpha(theme.palette.grey[500], 0.08),
                                  color: isSelected ? theme.palette.primary.main : 'text.secondary',
                                  border: `1px solid ${isSelected ? alpha(theme.palette.primary.main, 0.2) : 'transparent'}`,
                                }}
                              />
                              {company.isDefault && (
                                <Chip 
                                  label="Padrão" 
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: 11,
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    color: 'white',
                                  }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Botões de Ação */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSelectCompany}
                disabled={!selectedCompanyId || loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                {loading ? 'Carregando...' : 'Continuar'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/login')}
                startIcon={<ArrowBackIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.divider, 0.3),
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Voltar ao Login
              </Button>
            </Stack>
          </Paper>

          {/* Texto de Copyright */}
          <Typography 
            variant="caption" 
            color="white" 
            align="center" 
            sx={{ 
              display: 'block', 
              mt: 3,
              opacity: 0.9,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            © {new Date().getFullYear()} MES - Manufacturing Execution System. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

