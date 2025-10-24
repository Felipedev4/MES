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
import SelectCompany from './pages/SelectCompany';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Permissions from './pages/Permissions';
import Items from './pages/Items';
import Molds from './pages/Molds';
import ProductionOrders from './pages/ProductionOrders';
import ProductionDashboard from './pages/ProductionDashboard';
import ManualOrderPosting from './pages/ManualOrderPosting';
import Injectors from './pages/Injectors';
import OrderPanel from './pages/OrderPanel';
import Downtimes from './pages/Downtimes';
import PlcConfig from './pages/PlcConfig';
import Companies from './pages/Companies';
import Sectors from './pages/Sectors';
import ActivityTypes from './pages/ActivityTypes';
import Defects from './pages/Defects';
import ReferenceTypes from './pages/ReferenceTypes';
import OrderSummary from './pages/OrderSummary';
import UserCompanies from './pages/UserCompanies';
import EmailConfig from './pages/EmailConfig';
import MaintenanceAlerts from './pages/MaintenanceAlerts';
import EmailCenter from './pages/EmailCenter';
import Reports from './pages/Reports';

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
            <Route path="/select-company" element={<SelectCompany />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/injectors" element={<Injectors />} />
              <Route path="/injectors/:plcId/orders" element={<OrderPanel />} />
              <Route path="/production-dashboard/:orderId" element={<ProductionDashboard />} />
              <Route path="/order-summary/:id" element={<OrderSummary />} />
              <Route path="/items" element={<Items />} />
              <Route path="/molds" element={<Molds />} />
              <Route path="/production-orders" element={<ProductionOrders />} />
              <Route path="/manual-posting" element={<ManualOrderPosting />} />
              <Route path="/downtimes" element={<Downtimes />} />
              <Route path="/plc-config" element={<PlcConfig />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/user-companies" element={<UserCompanies />} />
              <Route path="/sectors" element={<Sectors />} />
              <Route path="/activity-types" element={<ActivityTypes />} />
              <Route path="/defects" element={<Defects />} />
              <Route path="/reference-types" element={<ReferenceTypes />} />
              <Route path="/email-config" element={<EmailConfig />} />
              <Route path="/maintenance-alerts" element={<MaintenanceAlerts />} />
              <Route path="/email-center" element={<EmailCenter />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;


