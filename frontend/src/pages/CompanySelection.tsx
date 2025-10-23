/**
 * Tela de Seleção de Empresa
 */

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CompanySelection: React.FC = () => {
  const { companies, selectCompany } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectCompany = async (companyId: number) => {
    try {
      setLoading(true);
      setError(null);
      await selectCompany(companyId);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro ao selecionar empresa:', err);
      setError(err.response?.data?.error || 'Erro ao selecionar empresa');
    } finally {
      setLoading(false);
    }
  };

  if (companies.length === 0) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="warning">
            Você não possui acesso a nenhuma empresa. Entre em contato com o administrador.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <Business fontSize="large" />
        </Avatar>
        
        <Typography component="h1" variant="h4" sx={{ mt: 2, mb: 1 }}>
          Selecione uma Empresa
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Escolha a empresa que deseja acessar
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ width: '100%' }}>
          <List>
            {companies.map((company, index) => (
              <ListItemButton
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                disabled={loading}
                sx={{
                  borderBottom: index < companies.length - 1 ? '1px solid #e0e0e0' : 'none',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {company.name}
                      {company.isDefault && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'white',
                          }}
                        >
                          Padrão
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span" display="block">
                        Código: {company.code}
                      </Typography>
                      {company.tradeName && (
                        <Typography variant="body2" component="span" display="block" color="text.secondary">
                          {company.tradeName}
                        </Typography>
                      )}
                    </>
                  }
                />
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default CompanySelection;

