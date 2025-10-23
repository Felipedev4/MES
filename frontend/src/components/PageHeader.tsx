/**
 * Componente de Header Profissional e Padronizado para Páginas
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link as MuiLink,
  useMediaQuery, 
  useTheme,
  Paper
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconGradient?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  icon, 
  title, 
  subtitle,
  iconGradient = 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
  breadcrumbs
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(13, 71, 161, 0.02) 100%)',
        borderRadius: 3,
        p: { xs: 2.5, md: 3.5 },
        mb: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
          aria-label="breadcrumb" 
          sx={{ mb: 2 }}
        >
          <MuiLink
            component="button"
            variant="body2"
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 16 }} />
            Início
          </MuiLink>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast || !crumb.path) {
              return (
                <Typography 
                  key={index} 
                  variant="body2" 
                  color="text.primary"
                  fontWeight={500}
                >
                  {crumb.label}
                </Typography>
              );
            }
            
            return (
              <MuiLink
                key={index}
                component="button"
                variant="body2"
                onClick={() => crumb.path && navigate(crumb.path)}
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
        gap={isMobile ? 2 : 2.5}
      >
        {/* Icon */}
        <Box
          sx={{
            width: isMobile ? 52 : 64,
            height: isMobile ? 52 : 64,
            borderRadius: 2.5,
            background: iconGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.25)',
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { fontSize: isMobile ? 30 : 36, color: 'white' }
          })}
        </Box>

        {/* Title & Subtitle */}
        <Box flex={1}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight={700}
            sx={{ 
              mb: subtitle ? 0.5 : 0,
              color: 'text.primary',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary"
              sx={{ fontWeight: 400 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;

