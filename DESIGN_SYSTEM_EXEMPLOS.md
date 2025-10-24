# 🛠️ Design System - Exemplos Práticos

## 📋 Guia de Uso do Design System MES

Este documento fornece exemplos práticos de código para implementar os padrões do Design System.

---

## 🎯 Template Básico de Página

### Estrutura Padrão
```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const MyPage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: { xs: 2, sm: 0 } }}>
      {/* Header */}
      <PageHeader
        icon={<AddIcon />}
        title="Nome da Página"
        subtitle="Descrição da funcionalidade"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
      />
      
      {/* Ações */}
      <Box display="flex" justifyContent="flex-end" mb={{ xs: 2, md: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAction}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2,
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'none',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          Nova Ação
        </Button>
      </Box>
      
      {/* Conteúdo Principal */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 3,
        }}
      >
        {/* Seu conteúdo aqui */}
      </Paper>
    </Box>
  );
};

export default MyPage;
```

---

## 📊 Tabela Profissional Completa

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

function DataTable({ data }: { data: any[] }) {
  const theme = useTheme();
  
  return (
    <TableContainer 
      component={Paper} 
      elevation={3}
      sx={{ 
        maxHeight: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 300px)' },
        overflow: 'auto',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                fontWeight: 700, 
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              Coluna 1
            </TableCell>
            <TableCell sx={{ /* repita o estilo */ }}>Coluna 2</TableCell>
            {/* Mais colunas */}
          </TableRow>
        </TableHead>
        
        <TableBody>
          {data.map((row) => (
            <TableRow 
              key={row.id}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'scale(1.01)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                {row.field1}
              </TableCell>
              <TableCell>{row.field2}</TableCell>
              <TableCell align="right">
                <Tooltip title="Editar" arrow>
                  <IconButton 
                    onClick={() => handleEdit(row.id)} 
                    size="small"
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.15),
                        transform: 'rotate(15deg) scale(1.1)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

---

## 🎴 Grid de Cards

```typescript
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';

function CardsGrid({ items }: { items: any[] }) {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  return (
    <Grid container spacing={3}>
      {items.map((item, index) => {
        const isSelected = selectedId === item.id;
        
        // Gradientes variados
        const gradients = [
          'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
          'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        ];
        const gradient = gradients[index % gradients.length];
        
        return (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              elevation={isSelected ? 8 : 3}
              sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                background: isSelected 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                  : 'background.paper',
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
                onClick={() => setSelectedId(item.id)}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Ícone */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '14px',
                          background: gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                    </Box>
                    
                    {/* Título */}
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      sx={{ 
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {item.name}
                    </Typography>
                    
                    {/* Descrição */}
                    {item.description && (
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    )}
                    
                    {/* Chips */}
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={item.code} 
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
```

---

## 🪟 Modal/Dialog Completo

```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

function CustomDialog({ open, onClose, onSave }: DialogProps) {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Título do Modal
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              background: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Seus campos aqui */}
        <TextField
          fullWidth
          label="Campo Exemplo"
          margin="normal"
        />
      </DialogContent>
      
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.grey[50], 0.5),
        }}
      >
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            borderColor: alpha(theme.palette.divider, 0.3),
            color: 'text.secondary',
            '&:hover': {
              borderColor: theme.palette.error.main,
              background: alpha(theme.palette.error.main, 0.05),
              color: 'error.main',
            },
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onSave}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 📊 Barra de Progresso com Informações

```typescript
import {
  Box,
  Stack,
  Typography,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { TrendingUp as ProgressIcon } from '@mui/icons-material';

function ProgressBar({ current, total }: { current: number; total: number }) {
  const theme = useTheme();
  const progress = (current / total) * 100;
  const isComplete = progress >= 100;
  
  return (
    <Stack spacing={0.5} sx={{ minWidth: 120 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {progress.toFixed(1)}%
        </Typography>
        <ProgressIcon 
          sx={{ 
            fontSize: 14, 
            color: isComplete ? 'success.main' : 'text.secondary' 
          }} 
        />
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={Math.min(progress, 100)} 
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.grey[500], 0.15),
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: isComplete
              ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
              : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          },
        }}
      />
    </Stack>
  );
}
```

---

## 🎨 Chip de Cor Customizado

```typescript
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';

function ColorChip({ color }: { color: { name: string; hexCode: string } }) {
  const theme = useTheme();
  
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '8px',
          bgcolor: color.hexCode || '#ccc',
          border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `0 2px 4px ${alpha(color.hexCode || '#000', 0.3)}`,
        }}
      />
      <Typography variant="body2" fontWeight={500}>
        {color.name}
      </Typography>
    </Stack>
  );
}
```

---

## 🔔 Status Badge/Chip

```typescript
import { Chip, alpha, useTheme } from '@mui/material';

function StatusChip({ status, priority }: { status: string; priority?: number }) {
  const theme = useTheme();
  
  // Chip de Status
  if (status) {
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: 11,
          // cores baseadas no status
        }}
      />
    );
  }
  
  // Chip de Prioridade
  if (priority !== undefined) {
    return (
      <Chip 
        label={priority} 
        size="small"
        sx={{
          fontWeight: 700,
          minWidth: 32,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
          color: theme.palette.warning.main,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        }}
      />
    );
  }
  
  return null;
}
```

---

## 🎯 Box com Ícone Estilizado

```typescript
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { Router as RouterIcon } from '@mui/icons-material';

function InfoBox({ title, value, icon }: InfoBoxProps) {
  const theme = useTheme();
  
  return (
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
          {icon}
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
            {title}
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight={700}
            color="primary.main"
            sx={{ fontSize: 18 }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
```

---

## 🎬 Animações Reutilizáveis

```typescript
// Fade In + Slide Up
const fadeInUpAnimation = {
  animation: 'fadeInUp 0.6s ease-out',
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(30px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
};

// Shimmer Effect
const shimmerAnimation = {
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
};

// Pulse
const pulseAnimation = {
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.6 },
  },
};

// Uso:
<Box sx={fadeInUpAnimation}>
  {/* conteúdo */}
</Box>
```

---

## 🎨 Gradientes Prontos para Uso

```typescript
const theme = useTheme();

// Gradientes de Fundo
const gradients = {
  primary: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  success: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  warning: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
  error: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  
  // Fundos suaves
  primaryLight: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  
  // Variações azuis para cards
  blue1: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  blue2: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
  blue3: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
  blue4: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  blue5: 'linear-gradient(135deg, #2979ff 0%, #2962ff 100%)',
  blue6: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
};

// Uso:
<Box sx={{ background: gradients.primary }} />
```

---

## 📱 Componente Responsivo

```typescript
import { Box, useMediaQuery, useTheme } from '@mui/material';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return (
    <Box 
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        fontSize: { xs: 14, md: 16 },
        display: { xs: 'block', md: 'flex' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {isMobile && <div>Versão Mobile</div>}
      {isTablet && <div>Versão Tablet</div>}
      {isDesktop && <div>Versão Desktop</div>}
    </Box>
  );
}
```

---

## 🎯 Utilities Helper

```typescript
// Criar um arquivo utils/styleHelpers.ts

import { alpha } from '@mui/material';
import { Theme } from '@mui/material/styles';

export const styleHelpers = {
  // Gradiente padrão
  primaryGradient: (theme: Theme) => 
    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  
  // Background suave
  lightBackground: (theme: Theme, opacity = 0.05) =>
    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, opacity)} 0%, ${alpha(theme.palette.primary.main, opacity * 0.5)} 100%)`,
  
  // Sombra padrão
  primaryShadow: (theme: Theme, opacity = 0.3) =>
    `0 4px 12px ${alpha(theme.palette.primary.main, opacity)}`,
  
  // Hover effect
  hoverElevation: (theme: Theme) => ({
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
  }),
  
  // Header de tabela
  tableHeader: (theme: Theme) => ({
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  }),
};

// Uso:
import { styleHelpers } from '../utils/styleHelpers';

<Box sx={{ background: styleHelpers.primaryGradient(theme) }} />
```

---

## ✅ Checklist de Validação

Antes de considerar uma página completa, verifique:

### Visual
- [ ] ✅ Cores seguem a paleta (azul primary)
- [ ] ✅ Gradientes aplicados em destaque
- [ ] ✅ Sombras apropriadas
- [ ] ✅ BorderRadius consistente (2, 3, 4)
- [ ] ✅ Espaçamento uniforme

### Tipografia
- [ ] ✅ FontWeight apropriado (500, 600, 700)
- [ ] ✅ FontSize consistente
- [ ] ✅ LetterSpacing em uppercase
- [ ] ✅ textTransform: 'none' em botões

### Interatividade
- [ ] ✅ Transições em hover (0.2s ou 0.3s)
- [ ] ✅ Hover effects implementados
- [ ] ✅ Feedback visual em ações
- [ ] ✅ Tooltips onde apropriado

### Responsividade
- [ ] ✅ Breakpoints aplicados
- [ ] ✅ Padding responsivo { xs, sm, md }
- [ ] ✅ Funciona em mobile

### Código
- [ ] ✅ Usa `theme.palette`
- [ ] ✅ Usa `alpha()` para transparências
- [ ] ✅ Sem cores hardcoded
- [ ] ✅ Sem erros de linter

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-24

