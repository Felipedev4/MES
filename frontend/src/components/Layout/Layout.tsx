/**
 * Layout principal com AppBar e Drawer
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MenuItems from './MenuItems';

const DRAWER_WIDTH = 260;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const { user, selectedCompany, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obter iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Traduzir role para português
  const getRoleLabel = (role?: string) => {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      DIRECTOR: 'Diretor',
      MANAGER: 'Gerente',
      SUPERVISOR: 'Supervisor',
      LEADER: 'Líder',
      OPERATOR: 'Operador',
    };
    return role ? roleLabels[role] || role : '';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderBottom: theme => `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          backdropFilter: 'blur(8px)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {/* Botão de Menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.2),
              },
              transition: 'all 0.2s',
            }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          {/* Logo e Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                mr: 1.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                M
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.2,
                  letterSpacing: 0.5,
                }}
              >
                {isSmallScreen ? 'MES' : 'MES System'}
              </Typography>
              {!isSmallScreen && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.9,
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                  }}
                >
                  Manufacturing Execution System
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Informações do Usuário */}
          {!isSmallScreen && (
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Empresa Selecionada */}
              {selectedCompany && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedCompany.name}
                  </Typography>
                </Box>
              )}

              <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.common.white, 0.2), my: 1 }} />
              
              {/* Informações do Usuário */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.85,
                      fontSize: '0.7rem',
                      lineHeight: 1,
                    }}
                  >
                    {getRoleLabel(user?.role)}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}

          {/* Mobile - Avatar simples */}
          {isSmallScreen && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
                mr: 1,
              }}
            >
              {getUserInitials()}
            </Avatar>
          )}
          
          {/* Botão Sair */}
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Sair"
            sx={{
              ml: 1,
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.2),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            borderRight: theme => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />

        {/* Menu Items - Área scrollável */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1, pt: 2 }}>
          <List sx={{ px: 0 }}>
            <MenuItems onItemClick={isMobile ? handleDrawerToggle : undefined} />
          </List>
        </Box>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 0, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: { md: drawerOpen ? 0 : `-${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;


