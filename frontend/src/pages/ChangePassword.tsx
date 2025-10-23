/**
 * Página de Troca de Senha (primeiro login ou troca obrigatória)
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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Se o usuário não está logado ou não precisa trocar a senha, redireciona
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.mustChangePassword) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/users/${user?.id}/change-password`, {
        currentPassword,
        newPassword,
      });

      enqueueSnackbar('Senha alterada com sucesso!', { variant: 'success' });
      
      // Fazer logout e redirecionar para login
      logout();
      navigate('/login');
      
      enqueueSnackbar('Por favor, faça login novamente com a nova senha', { 
        variant: 'info' 
      });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao alterar senha';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

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
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Alterar Senha
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            Por motivos de segurança, você precisa alterar sua senha antes de continuar.
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Usuário: <strong>{user.name}</strong> ({user.email})
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Senha Atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Mínimo de 6 caracteres"
            />

            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={logout}
              sx={{ mt: 2 }}
            >
              Cancelar e Sair
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangePassword;

