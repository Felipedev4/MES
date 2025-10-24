# 🔄 Guia de Migração para o Novo Design System

## 📋 Objetivo

Este guia ajuda a migrar páginas existentes para o novo padrão de design profissional do Sistema MES.

---

## 🎯 Antes de Começar

### Ferramentas Necessárias
- Material-UI v5+
- TypeScript
- `alpha` function do Material-UI
- `useTheme` hook

### Imports Básicos
```typescript
import {
  Box,
  alpha,
  useTheme,
} from '@mui/material';
```

---

## 🔄 Passo a Passo de Migração

### 1️⃣ Adicionar useTheme

**❌ Antes:**
```typescript
const MyComponent: React.FC = () => {
  return (
    <Box>...</Box>
  );
};
```

**✅ Depois:**
```typescript
const MyComponent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box>...</Box>
  );
};
```

---

### 2️⃣ Migrar Botões

**❌ Antes:**
```typescript
<Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={handleClick}
>
  Novo Item
</Button>
```

**✅ Depois:**
```typescript
<Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={handleClick}
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
  Novo Item
</Button>
```

---

### 3️⃣ Migrar Headers de Tabela

**❌ Antes:**
```typescript
<TableCell>Nome</TableCell>
```

**✅ Depois:**
```typescript
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
  Nome
</TableCell>
```

---

### 4️⃣ Migrar TableContainer

**❌ Antes:**
```typescript
<TableContainer component={Paper}>
  <Table>...</Table>
</TableContainer>
```

**✅ Depois:**
```typescript
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
  <Table stickyHeader size="small">...</Table>
</TableContainer>
```

---

### 5️⃣ Migrar TableRow com Hover

**❌ Antes:**
```typescript
<TableRow key={item.id}>
  <TableCell>{item.name}</TableCell>
</TableRow>
```

**✅ Depois:**
```typescript
<TableRow 
  key={item.id}
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
    {item.name}
  </TableCell>
</TableRow>
```

---

### 6️⃣ Migrar Cards

**❌ Antes:**
```typescript
<Card>
  <CardContent>
    <Typography variant="h6">{item.name}</Typography>
  </CardContent>
</Card>
```

**✅ Depois:**
```typescript
<Card
  elevation={3}
  sx={{
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 5,
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
  }}
>
  <CardContent sx={{ p: 3 }}>
    <Typography 
      variant="h6" 
      fontWeight={700}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {item.name}
    </Typography>
  </CardContent>
</Card>
```

---

### 7️⃣ Migrar IconButton

**❌ Antes:**
```typescript
<IconButton onClick={handleEdit} size="small">
  <EditIcon />
</IconButton>
```

**✅ Depois:**
```typescript
<Tooltip title="Editar" arrow>
  <IconButton 
    onClick={handleEdit} 
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
```

---

### 8️⃣ Migrar Dialog

**❌ Antes:**
```typescript
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>Título</DialogTitle>
  <DialogContent>...</DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Cancelar</Button>
    <Button variant="contained">Salvar</Button>
  </DialogActions>
</Dialog>
```

**✅ Depois:**
```typescript
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
        Título
      </Typography>
    </Box>
    <IconButton onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  
  <DialogContent>...</DialogContent>
  
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
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
        },
      }}
    >
      Salvar
    </Button>
  </DialogActions>
</Dialog>
```

---

### 9️⃣ Migrar Chips

**❌ Antes:**
```typescript
<Chip label="Status" size="small" color="primary" />
```

**✅ Depois:**
```typescript
<Chip
  label="Status"
  size="small"
  sx={{
    fontWeight: 600,
    fontSize: 11,
    // Para chips customizados:
    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
  }}
/>
```

---

### 🔟 Adicionar Barra de Progresso

**Adicionar onde não existe:**
```typescript
// No lugar de apenas porcentagem:
{((order.producedQuantity / order.plannedQuantity) * 100).toFixed(1)}%

// Substituir por:
<Stack spacing={0.5} sx={{ minWidth: 120 }}>
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="caption" fontWeight={600} color="text.secondary">
      {progress.toFixed(1)}%
    </Typography>
    <ProgressIcon sx={{ fontSize: 14, color: progress >= 100 ? 'success.main' : 'text.secondary' }} />
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
        background: progress >= 100
          ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
          : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      },
    }}
  />
</Stack>
```

---

## 📊 Ordem de Prioridade de Migração

### Alta Prioridade (Impacto Visual Imediato)
1. ✅ **Botões principais** - Gradiente + hover
2. ✅ **Headers de tabela** - Background + borda azul
3. ✅ **Modais/Dialogs** - Título estilizado
4. ✅ **Cards principais** - Hover effects

### Média Prioridade
5. ✅ **TableRows** - Hover effects
6. ✅ **IconButtons** - Background + hover
7. ✅ **Chips** - Cores customizadas
8. ✅ **TableContainer** - Bordas arredondadas

### Baixa Prioridade (Refinamentos)
9. ✅ **Barras de progresso** - Visual aprimorado
10. ✅ **Tooltips** - Adicionar onde falta
11. ✅ **Animações de entrada** - Fade in
12. ✅ **Responsive tweaks** - Ajustes finos

---

## 🎯 Páginas Prioritárias para Migração

### Já Migradas ✅
- [x] Login
- [x] SelectCompany
- [x] Injectors
- [x] ProductionOrders
- [x] ProductionDashboard (parcial)

### Próximas (Ordem de Prioridade)
1. **Items** - Cadastro de itens
2. **Molds** - Cadastro de moldes
3. **Sectors** - Cadastro de setores
4. **Companies** - Cadastro de empresas
5. **Users** - Cadastro de usuários
6. **ActivityTypes** - Tipos de atividade
7. **Defects** - Defeitos
8. **Colors** - Cores
9. **EmailConfig** - Configuração de e-mail
10. **PlcConfig** - Configuração de CLP

---

## 🛠️ Script de Busca e Substituição

### Encontrar Botões Antigos
```bash
# Buscar botões sem estilo
grep -r "variant=\"contained\"" frontend/src/pages/ | grep -v "sx={{" | grep -v "DESIGN"
```

### Encontrar TableCells sem Estilo
```bash
# Buscar TableCell de header sem estilo
grep -r "<TableCell>" frontend/src/pages/ | grep -v "sx={{" | grep -v "DESIGN"
```

### Encontrar Dialogs Antigos
```bash
# Buscar Dialogs sem PaperProps
grep -r "<Dialog" frontend/src/pages/ | grep -v "PaperProps" | grep -v "DESIGN"
```

---

## ✅ Checklist de Migração por Página

Copie este checklist ao migrar uma página:

```markdown
### Página: [NOME_DA_PÁGINA]

#### Estrutura
- [ ] Adiciona `useTheme` hook
- [ ] Adiciona `alpha` import
- [ ] Container principal com padding responsivo

#### Componentes
- [ ] Botões com gradiente + hover
- [ ] Headers de tabela estilizados
- [ ] TableContainer com bordas arredondadas
- [ ] TableRows com hover effect
- [ ] Cards com hover + barra superior
- [ ] IconButtons estilizados + tooltips
- [ ] Dialog title estilizado
- [ ] Dialog actions estilizados
- [ ] Chips customizados

#### Visual
- [ ] Cores usando `theme.palette`
- [ ] Transparências usando `alpha()`
- [ ] Gradientes aplicados
- [ ] Sombras apropriadas
- [ ] BorderRadius consistente
- [ ] FontWeight apropriado

#### Interatividade
- [ ] Transições adicionadas
- [ ] Hover effects implementados
- [ ] Animações de entrada (opcional)

#### Responsividade
- [ ] Breakpoints aplicados
- [ ] Padding responsivo
- [ ] Testado em mobile

#### Validação
- [ ] Sem erros de linter
- [ ] Sem warnings TypeScript
- [ ] Sem cores hardcoded
- [ ] Visual consistente com outras páginas
```

---

## 🔍 Exemplos de Before/After

### Exemplo Completo: Tabela de Dados

**❌ ANTES:**
```typescript
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Nome</TableCell>
        <TableCell>Status</TableCell>
        <TableCell align="right">Ações</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>
            <Chip label={item.status} size="small" color="primary" />
          </TableCell>
          <TableCell align="right">
            <IconButton onClick={() => handleEdit(item.id)} size="small">
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

**✅ DEPOIS:**
```typescript
const theme = useTheme();

<TableContainer 
  component={Paper} 
  elevation={3}
  sx={{ 
    maxHeight: 'calc(100vh - 300px)',
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
          Nome
        </TableCell>
        <TableCell sx={{ /* mesmo estilo */ }}>Status</TableCell>
        <TableCell align="right" sx={{ /* mesmo estilo */ }}>Ações</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map(item => (
        <TableRow 
          key={item.id}
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
            {item.name}
          </TableCell>
          <TableCell>
            <Chip 
              label={item.status} 
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          </TableCell>
          <TableCell align="right">
            <Tooltip title="Editar" arrow>
              <IconButton 
                onClick={() => handleEdit(item.id)} 
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
```

---

## 🎉 Conclusão

Após migrar uma página:

1. ✅ Teste visualmente em desktop e mobile
2. ✅ Verifique hover effects
3. ✅ Confira erros de linter
4. ✅ Compare com páginas já migradas
5. ✅ Marque como concluída no checklist

**Página migrada com sucesso! 🎉**

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-24

