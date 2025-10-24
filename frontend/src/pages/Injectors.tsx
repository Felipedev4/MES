/**
 * Página de Injetoras/CLPs
 * Lista todos os CLPs cadastrados no sistema
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  Typography,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  PrecisionManufacturing as InjectorIcon,
  Router as RouterIcon,
  FiberManualRecord as StatusIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

interface PlcConfig {
  id: number;
  name: string;
  description?: string | null;
  host: string;  // IP do CLP
  port: number;
  unitId: number;  // ID da unidade Modbus
  active: boolean;
}

const Injectors: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [plcs, setPlcs] = useState<PlcConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlcs();
  }, []);

  const loadPlcs = async () => {
    try {
      setLoading(true);
      const response = await api.get<PlcConfig[]>('/plc-config', {
        params: { active: true }
      });
      setPlcs(response.data);
    } catch (error) {
      console.error('Erro ao carregar CLPs:', error);
      enqueueSnackbar('Erro ao carregar injetoras', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlcClick = (plcId: number) => {
    navigate(`/injectors/${plcId}/orders`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      <PageHeader
        icon={<InjectorIcon />}
        title="Injetoras"
        subtitle="Máquinas injetoras e CLPs"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
      />

      {/* Grid de CLPs */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {plcs.map((plc, index) => {
          // Simular status online (pode ser melhorado com dados reais)
          const isOnline = plc.active;
          // Gradientes azuis para padronização
          const gradients = [
            'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', // Azul padrão
            'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)', // Azul claro
            'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', // Azul escuro
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Azul ciano
            'linear-gradient(135deg, #2979ff 0%, #2962ff 100%)', // Azul vibrante
            'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)', // Azul intermediário
          ];
          const gradient = gradients[index % gradients.length];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plc.id}>
              <Card 
                elevation={4}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: gradient,
                  },
                }}
              >
                <CardActionArea 
                  onClick={() => handlePlcClick(plc.id)}
                  sx={{ height: '100%', p: 3 }}
                >
                  <Stack spacing={2.5}>
                    {/* Nome e Descrição */}
                    <Box>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{ 
                          mb: 0.5,
                          fontSize: 18,
                          background: gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {plc.name}
                      </Typography>
                      {plc.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}
                        >
                          {plc.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Informações Técnicas */}
                    <Stack spacing={1.5}>
                      {/* Endereço de Rede (IP:Porta) */}
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '5px',
                            height: '100%',
                            background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                              flexShrink: 0,
                            }}
                          >
                            <RouterIcon sx={{ fontSize: 24, color: 'white' }} />
                          </Box>
                          <Box flex={1}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              fontWeight={600} 
                              sx={{ 
                                fontSize: 10, 
                                textTransform: 'uppercase', 
                                letterSpacing: 0.8,
                                display: 'block',
                                mb: 0.5,
                              }}
                            >
                              Endereço de Conexão
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              color="primary.main"
                              sx={{ 
                                fontSize: 18, 
                                fontFamily: 'monospace',
                                letterSpacing: 0.5,
                              }}
                            >
                              {plc.host}:{plc.port}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Detalhes Técnicos */}
                      <Stack direction="row" spacing={1.5}>
                        {/* ID da Unidade Modbus */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
                            },
                          }}
                        >
                          <Stack spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.3)}`,
                              }}
                            >
                              <MemoryIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontSize: 9,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  display: 'block',
                                  mb: 0.5,
                                }}
                              >
                                ID Unidade
                              </Typography>
                              <Typography 
                                variant="h6" 
                                fontWeight={700} 
                                sx={{ 
                                  color: theme.palette.info.main,
                                  fontSize: 20,
                                  lineHeight: 1,
                                }}
                              >
                                {plc.unitId}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Status da Conexão */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(isOnline ? theme.palette.success.main : theme.palette.grey[500], 0.1)} 0%, ${alpha(isOnline ? theme.palette.success.main : theme.palette.grey[500], 0.05)} 100%)`,
                            border: `1px solid ${alpha(isOnline ? theme.palette.success.main : theme.palette.grey[500], 0.2)}`,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: `0 4px 12px ${alpha(isOnline ? theme.palette.success.main : theme.palette.grey[500], 0.15)}`,
                            },
                          }}
                        >
                          <Stack spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${isOnline ? theme.palette.success.main : theme.palette.grey[500]} 0%, ${isOnline ? theme.palette.success.dark : theme.palette.grey[600]} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 2px 8px ${alpha(isOnline ? theme.palette.success.main : theme.palette.grey[500], 0.3)}`,
                              }}
                            >
                              <StatusIcon 
                                sx={{ 
                                  fontSize: 16, 
                                  color: 'white',
                                  animation: isOnline ? 'pulse 2s infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.6 },
                                  },
                                }} 
                              />
                            </Box>
                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontSize: 9,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  display: 'block',
                                  mb: 0.5,
                                }}
                              >
                                Status
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight={700} 
                                sx={{ 
                                  color: isOnline ? theme.palette.success.main : theme.palette.grey[600],
                                  fontSize: 12,
                                  lineHeight: 1,
                                }}
                              >
                                {isOnline ? 'Ativo' : 'Inativo'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>

                    {/* Botão de Ação */}
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 2,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
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
                        '&:hover::before': {
                          left: '100%',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <Typography 
                          variant="body2" 
                          fontWeight={700} 
                          sx={{ 
                            color: 'white',
                            fontSize: 14,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                          }}
                        >
                          Ver Ordens de Produção
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            fontSize: 18,
                            animation: 'bounce 2s infinite',
                            '@keyframes bounce': {
                              '0%, 100%': { transform: 'translateX(0)' },
                              '50%': { transform: 'translateX(4px)' },
                            },
                          }}
                        >
                          →
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mensagem quando não há CLPs */}
      {plcs.length === 0 && !loading && (
        <Box 
          display="flex" 
          flexDirection="column"
          alignItems="center" 
          justifyContent="center" 
          minHeight="50vh"
        >
          <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
            Nenhuma injetora cadastrada
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
            Configure suas injetoras em <strong>Configuração CLP</strong> para começar a monitorar suas máquinas
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Injectors;

