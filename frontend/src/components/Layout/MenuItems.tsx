/**
 * Itens do menu de navegação - Menu lateral profissional
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RouterIcon from '@mui/icons-material/Router';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import BugReportIcon from '@mui/icons-material/BugReport';
import LabelIcon from '@mui/icons-material/Label';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FactoryIcon from '@mui/icons-material/Factory';
import FolderIcon from '@mui/icons-material/Folder';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../contexts/AuthContext';
import { canView } from '../../utils/permissions';

interface MenuItemsProps {
  onItemClick?: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  resource: string;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  color?: string;
}

const MenuItems: React.FC<MenuItemsProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Estados para controlar seções colapsáveis
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    operational: true,
    register: true,
    reports: true,
    admin: true,
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Organizar menu em seções com hierarquia
  const menuSections: MenuSection[] = [
    {
      title: 'Operacional',
      icon: <FactoryIcon />,
      color: '#1976d2',
      items: [
        { text: 'Injetoras', icon: <RouterIcon />, path: '/injectors', resource: 'injectors' },
        { text: 'Apontamento Manual', icon: <EditNoteIcon />, path: '/manual-posting', resource: 'manual_posting' },
        { text: 'Ordens de Produção', icon: <AssignmentIcon />, path: '/production-orders', resource: 'production_orders' },
        { text: 'Paradas', icon: <ErrorOutlineIcon />, path: '/downtimes', resource: 'downtimes' },
      ]
    },
    {
      title: 'Cadastros',
      icon: <FolderIcon />,
      color: '#2e7d32',
      items: [
        { text: 'Empresas', icon: <BusinessIcon />, path: '/companies', resource: 'companies' },
        { text: 'Setores', icon: <AccountTreeIcon />, path: '/sectors', resource: 'sectors' },
        { text: 'Itens', icon: <InventoryIcon />, path: '/items', resource: 'items' },
        { text: 'Moldes', icon: <PrecisionManufacturingIcon />, path: '/molds', resource: 'molds' },
        { text: 'Defeitos', icon: <BugReportIcon />, path: '/defects', resource: 'defects' },
        { text: 'Tipos de Atividade', icon: <CategoryIcon />, path: '/activity-types', resource: 'activity_types' },
        { text: 'Tipos de Referência', icon: <LabelIcon />, path: '/reference-types', resource: 'reference_types' },
      ]
    },
    {
      title: 'Relatórios',
      icon: <AssessmentIcon />,
      color: '#9c27b0',
      items: [
        { text: 'Relatórios', icon: <AssessmentIcon />, path: '/reports', resource: 'reports' },
      ]
    },
    {
      title: 'Administração',
      icon: <AdminPanelSettingsIcon />,
      color: '#ed6c02',
      items: [
        { text: 'Colaboradores', icon: <PeopleIcon />, path: '/users', resource: 'users' },
        { text: 'Colaboradores e Empresas', icon: <GroupWorkIcon />, path: '/user-companies', resource: 'user_companies' },
        { text: 'Permissões', icon: <SecurityIcon />, path: '/permissions', resource: 'permissions' },
        { text: 'Configuração CLP', icon: <SettingsIcon />, path: '/plc-config', resource: 'plc_config' },
        { text: 'Configuração de E-mail', icon: <EmailIcon />, path: '/email-config', resource: 'email_config' },
        { text: 'Alertas de Manutenção', icon: <NotificationsActiveIcon />, path: '/maintenance-alerts', resource: 'maintenance_alerts' },
        { text: 'Central de E-mails', icon: <EmailIcon />, path: '/email-center', resource: 'email_logs' },
      ]
    }
  ];

  // Filtrar seções baseado nas permissões
  const visibleSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => user && canView(user.role, item.resource))
  })).filter(section => section.items.length > 0);

  // Renderizar seção de cabeçalho
  const renderSectionHeader = (title: string, icon: React.ReactNode, sectionKey: string, color: string) => (
    <ListItemButton
      onClick={() => toggleSection(sectionKey)}
      sx={{
        py: 1.5,
        px: 2,
        mt: 1,
        mb: 0.5,
        backgroundColor: alpha(color, 0.08),
        '&:hover': {
          backgroundColor: alpha(color, 0.15),
        },
        borderLeft: `3px solid ${color}`,
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color }}>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={title}
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'text.primary',
          letterSpacing: 0.5,
        }}
      />
      {openSections[sectionKey] ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
  );

  // Renderizar item do menu
  const renderMenuItem = (item: MenuItem) => {
    const isSelected = location.pathname === item.path;
    
    return (
      <ListItemButton
        key={item.path}
        selected={isSelected}
        onClick={() => handleNavigation(item.path)}
        sx={{
          py: 1.25,
          pl: 4,
          pr: 2,
          borderRadius: '0 20px 20px 0',
          mr: 1,
          mb: 0.5,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.12),
            borderRight: theme => `3px solid ${theme.palette.primary.main}`,
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.18),
            },
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
              color: 'primary.main',
            },
          },
          '&:hover': {
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, transition: 'color 0.2s' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: isSelected ? 600 : 400,
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <Box>
      {/* Dashboard - Item especial no topo */}
      {user && canView(user.role, 'dashboard') && (
        <>
          <ListItemButton
            selected={location.pathname === '/dashboard'}
            onClick={() => handleNavigation('/dashboard')}
            sx={{
              py: 1.5,
              px: 2,
              mx: 1,
              mb: 2,
              borderRadius: 2,
              backgroundColor: location.pathname === '/dashboard' 
                ? theme => alpha(theme.palette.primary.main, 0.15)
                : 'transparent',
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.12),
              },
              '&.Mui-selected': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.15),
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: location.pathname === '/dashboard' ? 'primary.main' : 'inherit'
            }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/dashboard' ? 600 : 500,
                fontSize: '0.95rem',
                color: location.pathname === '/dashboard' ? 'primary.main' : 'inherit'
              }}
            />
          </ListItemButton>
          <Divider sx={{ mx: 2, mb: 1 }} />
        </>
      )}

      {/* Seções organizadas */}
      {visibleSections.map((section, sectionIndex) => {
        const sectionKey = ['operational', 'register', 'admin'][sectionIndex];
        return (
          <Box key={section.title}>
            {renderSectionHeader(section.title, section.icon, sectionKey, section.color!)}
            <Collapse in={openSections[sectionKey]} timeout="auto" unmountOnExit>
              <Box sx={{ pb: 1 }}>
                {section.items.map(item => renderMenuItem(item))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};

export default MenuItems;


