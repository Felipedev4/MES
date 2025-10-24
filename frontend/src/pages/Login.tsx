/**
 * Página de Login
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PrecisionManufacturing as ManufacturingIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar se precisa selecionar empresa
      if (response.requiresCompanySelection && response.companies.length > 1) {
        navigate('/select-company', { 
          replace: true,
          state: { 
            user: response.user,
            companies: response.companies,
          },
        });
        return;
      }
      
      // Verificar se precisa trocar a senha
      if (response.user.mustChangePassword === true) {
        enqueueSnackbar('Você precisa alterar sua senha antes de continuar', { 
          variant: 'warning' 
        });
        navigate('/change-password', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao realizar login';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
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
      <Container maxWidth="sm">
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
                <ManufacturingIcon sx={{ fontSize: 40, color: 'white' }} />
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
                  Sistema MES
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Manufacturing Execution System
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 4, opacity: 0.6 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Acesso ao Sistema
              </Typography>
            </Divider>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Campo de Email */}
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />

                {/* Campo de Senha */}
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />

                {/* Botão de Login */}
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  size="large"
                  disabled={loading}
                  endIcon={<LoginIcon />}
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
                  {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                </Button>
              </Stack>
            </form>
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
};

export default Login;


