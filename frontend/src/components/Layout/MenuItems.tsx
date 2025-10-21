/**
 * Itens do menu de navegação
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import BugReportIcon from '@mui/icons-material/BugReport';
import LabelIcon from '@mui/icons-material/Label';

interface MenuItemsProps {
  onItemClick?: () => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Produção', icon: <PlayArrowIcon />, path: '/production' },
    { divider: true },
    { text: 'Itens', icon: <InventoryIcon />, path: '/items' },
    { text: 'Moldes', icon: <PrecisionManufacturingIcon />, path: '/molds' },
    { text: 'Ordens de Produção', icon: <AssignmentIcon />, path: '/production-orders' },
    { text: 'Paradas', icon: <ErrorOutlineIcon />, path: '/downtimes' },
    { divider: true },
    { text: 'Empresas', icon: <BusinessIcon />, path: '/companies' },
    { text: 'Setores', icon: <AccountTreeIcon />, path: '/sectors' },
    { text: 'Tipos de Atividade', icon: <CategoryIcon />, path: '/activity-types' },
    { text: 'Defeitos', icon: <BugReportIcon />, path: '/defects' },
    { text: 'Tipos de Referência', icon: <LabelIcon />, path: '/reference-types' },
    { divider: true },
    { text: 'Configuração CLP', icon: <SettingsIcon />, path: '/plc-config' },
  ];

  return (
    <>
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
        }

        return (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path!)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        );
      })}
    </>
  );
};

export default MenuItems;


