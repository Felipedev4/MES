# 🎨 Design System - Sistema MES

## 📋 Índice
1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Componentes Padrão](#componentes-padrão)
4. [Gradientes](#gradientes)
5. [Sombras e Elevação](#sombras-e-elevação)
6. [Animações](#animações)
7. [Espaçamento](#espaçamento)
8. [Tabelas](#tabelas)
9. [Cards](#cards)
10. [Botões](#botões)
11. [Modais/Dialogs](#modais-dialogs)
12. [Headers](#headers)
13. [Boas Práticas](#boas-práticas)

---

## 🎨 Paleta de Cores

### Cor Principal (Primary)
```typescript
// Azul Material Design
primary.main: #2196f3
primary.light: #42a5f5
primary.dark: #1976d2
```

### Cores Secundárias
```typescript
success.main: #4caf50
success.dark: #388e3c
warning.main: #ff9800
warning.dark: #f57c00
error.main: #f44336
error.dark: #d32f2f
info.main: #2196f3
info.dark: #1976d2
```

### Uso com Alpha (Transparência)
```typescript
// Fundos suaves
alpha(theme.palette.primary.main, 0.05)  // 5% - muito suave
alpha(theme.palette.primary.main, 0.08)  // 8% - suave
alpha(theme.palette.primary.main, 0.15)  // 15% - moderado
alpha(theme.palette.primary.main, 0.2)   // 20% - visível

// Bordas
alpha(theme.palette.primary.main, 0.2)   // bordas suaves
alpha(theme.palette.primary.main, 0.3)   // bordas médias
alpha(theme.palette.divider, 0.1)        // bordas muito suaves
```

---

## 📝 Tipografia

### Tamanhos e Pesos
```typescript
// Headers
variant="h4"  fontWeight={700}  // Títulos principais
variant="h5"  fontWeight={700}  // Subtítulos
variant="h6"  fontWeight={700}  // Títulos de seção

// Corpo
variant="body1"  fontWeight={500}  // Texto normal
variant="body2"  fontWeight={500}  // Texto secundário

// Captions
variant="caption"  fontSize={11-12}  fontWeight={600}  // Labels
textTransform: 'uppercase'
letterSpacing: 0.5-1
```

### Gradientes em Texto
```typescript
sx={{
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}}
```

---

## 🧩 Componentes Padrão

### 1. PageHeader
```typescript
<PageHeader
  icon={<AssignmentIcon />}
  title="Título da Página"
  subtitle="Descrição da página"
  iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
  breadcrumbs={[
    { label: 'Home', path: '/home' },
    { label: 'Seção' },
  ]}
/>
```

---

## 🌈 Gradientes

### Gradientes Padrão
```typescript
// Azul Principal (usar em botões, headers, ícones)
`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`

// Fundos Suaves (cards selecionados, backgrounds)
`linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`

// Headers de Tabela
`linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`

// Success
`linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`

// Warning
`linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
```

### Gradiente Shimmer (Animado)
```typescript
sx={{
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
}}
```

---

## 💎 Sombras e Elevação

### BoxShadow Padrão
```typescript
// Leve
boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`

// Média
boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`

// Forte
boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`

// Muito Forte
boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
```

### Elevation Material-UI
```typescript
elevation={2}   // Padrão para cards
elevation={3}   // Tabelas e containers
elevation={8}   // Cards selecionados
elevation={24}  // Modais e dialogs
```

---

## ⚡ Animações

### Transições Padrão
```typescript
transition: 'all 0.2s'  // Rápida
transition: 'all 0.3s'  // Média
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'  // Suave
```

### Hover Effects Comuns
```typescript
// Elevação
'&:hover': {
  transform: 'translateY(-2px)',
  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
}

// Scale
'&:hover': {
  transform: 'scale(1.02)',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
}

// Rotação + Scale
'&:hover': {
  transform: 'rotate(15deg) scale(1.1)',
}
```

### Animação de Entrada (Fade In + Slide Up)
```typescript
sx={{
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
}}
```

### Animação de Pulso
```typescript
'@keyframes pulse': {
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.6 },
}
```

---

## 📏 Espaçamento

### Padding Padrão
```typescript
p: { xs: 2, sm: 3 }     // Containers gerais
p: { xs: 3, sm: 5 }     // Modais/Dialogs
px: 3, py: 1.2          // Botões
px: 3, py: 2.5          // Dialog Actions
```

### Margin/Spacing
```typescript
mb: { xs: 2, md: 3 }    // Entre seções
spacing={2}             // Grid items
spacing={3}             // Stack items
gap={1.5}               // Flex items
```

### Border Radius
```typescript
borderRadius: 2         // 8px - Botões, inputs
borderRadius: 3         // 12px - Cards
borderRadius: 4         // 16px - Modais
borderRadius: '50%'     // Círculos perfeitos
borderRadius: '8px'     // Quadrados arredondados
```

---

## 📊 Tabelas

### Header da Tabela
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
  Título
</TableCell>
```

### Container da Tabela
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
```

### Linhas com Hover
```typescript
<TableRow 
  sx={{
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'scale(1.01)',
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  }}
>
```

---

## 🎴 Cards

### Card Padrão
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
  }}
>
```

### Card Selecionado
```typescript
<Card
  elevation={8}
  sx={{
    borderRadius: 3,
    border: `2px solid ${theme.palette.primary.main}`,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  }}
>
```

### Card com Barra Superior
```typescript
sx={{
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
```

---

## 🔘 Botões

### Botão Primary Gradiente
```typescript
<Button
  variant="contained"
  startIcon={<AddIcon />}
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
  Texto do Botão
</Button>
```

### Botão Secondary/Outlined
```typescript
<Button 
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
      borderColor: theme.palette.primary.main,
      background: alpha(theme.palette.primary.main, 0.05),
      color: theme.palette.primary.main,
    },
  }}
>
  Cancelar
</Button>
```

### IconButton Estilizado
```typescript
<IconButton 
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
```

---

## 🪟 Modais/Dialogs

### Dialog Container
```typescript
<Dialog 
  open={open} 
  onClose={handleClose} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  }}
>
```

### Dialog Title Estilizado
```typescript
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
  <IconButton onClick={handleClose}>
    <CloseIcon />
  </IconButton>
</DialogTitle>
```

### Dialog Actions Estilizado
```typescript
<DialogActions
  sx={{
    px: 3,
    py: 2.5,
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    background: alpha(theme.palette.grey[50], 0.5),
  }}
>
  {/* Botões aqui */}
</DialogActions>
```

---

## 🎯 Headers

### Logo Box (usado em login/select company)
```typescript
<Box
  sx={{
    width: 80,
    height: 80,
    borderRadius: '20px',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -3,
      borderRadius: '22px',
      padding: '3px',
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: 0.5,
    },
  }}
>
  <Icon sx={{ fontSize: 40, color: 'white' }} />
</Box>
```

---

## 📋 Boas Práticas

### ✅ SEMPRE FAZER

1. **Usar `alpha()` para transparências**
   ```typescript
   alpha(theme.palette.primary.main, 0.1)
   ```

2. **Usar gradientes para destaque**
   ```typescript
   background: `linear-gradient(135deg, ...)`
   ```

3. **Adicionar transições**
   ```typescript
   transition: 'all 0.3s'
   ```

4. **Usar tema para cores**
   ```typescript
   color: theme.palette.primary.main
   ```

5. **BorderRadius consistente**
   ```typescript
   borderRadius: 2  // botões
   borderRadius: 3  // cards
   ```

6. **Typography sem uppercase direto**
   ```typescript
   textTransform: 'none'  // em botões
   ```

7. **Usar fontWeight específicos**
   ```typescript
   fontWeight: 600  // médio
   fontWeight: 700  // bold
   ```

### ❌ EVITAR

1. **Cores hardcoded**
   ```typescript
   ❌ color: '#2196f3'
   ✅ color: theme.palette.primary.main
   ```

2. **Sombras sem alpha**
   ```typescript
   ❌ boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
   ✅ boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`
   ```

3. **Hover sem transição**
   ```typescript
   ❌ '&:hover': { background: 'blue' }
   ✅ transition: 'all 0.3s', '&:hover': { background: 'blue' }
   ```

4. **Elevation muito alta sem propósito**
   ```typescript
   ❌ elevation={24}  // em cards normais
   ✅ elevation={3}   // para cards
   ✅ elevation={24}  // apenas para modals
   ```

---

## 🎨 Chips e Badges

### Chip de Status
```typescript
<Chip
  label="Status"
  size="small"
  sx={{
    fontWeight: 600,
    fontSize: 11,
  }}
/>
```

### Chip Customizado
```typescript
<Chip 
  label="Texto" 
  size="small"
  sx={{
    fontWeight: 700,
    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
  }}
/>
```

---

## 📊 Barras de Progresso

### LinearProgress Estilizado
```typescript
<LinearProgress 
  variant="determinate" 
  value={progress} 
  sx={{
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.grey[500], 0.15),
    '& .MuiLinearProgress-bar': {
      borderRadius: 3,
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
  }}
/>
```

---

## 🔍 Tooltips

### Tooltip Padrão
```typescript
<Tooltip title="Descrição da ação" arrow>
  <IconButton>
    <EditIcon />
  </IconButton>
</Tooltip>
```

---

## 🎯 Resumo dos Valores Mais Usados

| Propriedade | Valor |
|-------------|-------|
| **borderRadius** | 2 (botões), 3 (cards), 4 (modais) |
| **fontWeight** | 500 (normal), 600 (médio), 700 (bold) |
| **fontSize** | 11-12 (caption), 14 (body), 16 (subtítulos) |
| **alpha backgrounds** | 0.02-0.08 (muito suave), 0.1-0.2 (moderado) |
| **alpha borders** | 0.1-0.3 |
| **transition** | 0.2s (rápido), 0.3s (médio) |
| **elevation** | 2-3 (cards), 8 (selecionado), 24 (modal) |
| **px** | 3 (botões), 3-5 (containers) |
| **py** | 1-1.5 (botões), 2-3 (containers) |

---

## 📱 Responsividade

### Breakpoints Material-UI
```typescript
xs: 0-600px    // Mobile
sm: 600-960px  // Tablet
md: 960-1280px // Desktop pequeno
lg: 1280-1920px // Desktop grande
xl: 1920px+    // Desktop muito grande
```

### Uso de Breakpoints
```typescript
sx={{
  p: { xs: 2, sm: 3, md: 4 },
  fontSize: { xs: 14, md: 16 },
  display: { xs: 'none', md: 'flex' },
}}
```

---

## 🎉 Checklist de Implementação

Ao criar/refatorar uma página, verificar:

- [ ] ✅ Usa `theme.palette` para cores
- [ ] ✅ Aplica gradientes em elementos de destaque
- [ ] ✅ Usa `alpha()` para transparências
- [ ] ✅ Adiciona transições em hover effects
- [ ] ✅ BorderRadius consistente (2, 3, ou 4)
- [ ] ✅ Sombras apropriadas para elevação
- [ ] ✅ Typography com fontWeight e letterSpacing
- [ ] ✅ Botões com textTransform: 'none'
- [ ] ✅ Headers de tabela estilizados
- [ ] ✅ Modais com título e ações estilizadas
- [ ] ✅ Animações suaves (0.2s ou 0.3s)
- [ ] ✅ Responsividade implementada
- [ ] ✅ Sem erros de linter

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-24  
**Mantido por:** Equipe de Desenvolvimento MES

