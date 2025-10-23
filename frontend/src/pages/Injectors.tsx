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
} from '@mui/material';
import { Settings as PlcIcon, PrecisionManufacturing as InjectorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

interface PlcConfig {
  id: number;
  name: string;
  description: string | null;
  ipAddress: string;
  port: number;
  slaveId: number;
  active: boolean;
}

const Injectors: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
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
        iconGradient="linear-gradient(135deg, #ff5722 0%, #e64a19 100%)"
      />

      {/* Grid de CLPs */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {plcs.map((plc) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={plc.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea 
                onClick={() => handlePlcClick(plc.id)}
                sx={{ height: '100%', p: 2 }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight={200}
                >
                  {/* Ícone */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      boxShadow: 3,
                    }}
                  >
                    <PlcIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>

                  {/* Nome */}
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ textAlign: 'center' }}
                  >
                    {plc.name}
                  </Typography>
                  
                  {/* Descrição */}
                  {plc.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ textAlign: 'center', mb: 2 }}
                    >
                      {plc.description}
                    </Typography>
                  )}

                  {/* Endereço IP */}
                  <Box 
                    mt={2} 
                    pt={2} 
                    sx={{ 
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Endereço IP:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {plc.ipAddress}
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há CLPs */}
      {plcs.length === 0 && !loading && (
        <Box 
          display="flex" 
          flexDirection="column"
          alignItems="center" 
          justifyContent="center" 
          minHeight="40vh"
        >
          <PlcIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhuma injetora cadastrada
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Configure suas injetoras em "Configuração CLP"
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Injectors;

