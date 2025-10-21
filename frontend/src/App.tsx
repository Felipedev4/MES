/**
 * Componente principal da aplicação
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Molds from './pages/Molds';
import ProductionOrders from './pages/ProductionOrders';
import Downtimes from './pages/Downtimes';
import Production from './pages/Production';
import PlcConfig from './pages/PlcConfig';
import Companies from './pages/Companies';
import Sectors from './pages/Sectors';
import ActivityTypes from './pages/ActivityTypes';
import Defects from './pages/Defects';
import ReferenceTypes from './pages/ReferenceTypes';

// Components
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';

// Tema Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/items" element={<Items />} />
              <Route path="/molds" element={<Molds />} />
              <Route path="/production-orders" element={<ProductionOrders />} />
              <Route path="/downtimes" element={<Downtimes />} />
              <Route path="/production" element={<Production />} />
              <Route path="/plc-config" element={<PlcConfig />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/sectors" element={<Sectors />} />
              <Route path="/activity-types" element={<ActivityTypes />} />
              <Route path="/defects" element={<Defects />} />
              <Route path="/reference-types" element={<ReferenceTypes />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;


