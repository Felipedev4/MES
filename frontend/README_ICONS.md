# 🎨 Sistema de Ícones e Headers

## Componente PageHeader

Componente padronizado para headers de páginas com ícones, gradientes e responsividade.

### Uso Básico

```tsx
import PageHeader from '../components/PageHeader';
import YourIcon from '@mui/icons-material/YourIcon';

<PageHeader
  icon={<YourIcon />}
  title="Título da Página"
  subtitle="Descrição opcional"  // opcional
  iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"  // opcional
/>
```

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `icon` | `React.ReactNode` | Sim | Ícone do Material-UI |
| `title` | `string` | Sim | Título da página |
| `subtitle` | `string` | Não | Subtítulo descritivo |
| `iconGradient` | `string` | Não | Gradiente CSS (padrão: azul) |

### Páginas Implementadas

- ✅ Dashboard
- ✅ Ordens de Produção
- ✅ Itens/Produtos
- ✅ Moldes
- ✅ Empresas
- ✅ Setores
- ✅ Injetoras
- ✅ Dashboard Produção

### Responsividade

**Desktop (≥ 600px):**
- Ícone: 56x56px
- Título: variant h4
- Layout horizontal

**Mobile (< 600px):**
- Ícone: 48x48px
- Título: variant h5
- Layout vertical
- Subtítulo menor (body2)

### Gradientes Disponíveis

```typescript
const gradients = {
  azul: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  roxo: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
  verde: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
  laranja: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  vermelho: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
  ciano: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
  azulEscuro: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
};
```

### Exemplo Completo

```tsx
import React from 'react';
import { Box, Button } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/PageHeader';

const MyPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        icon={<AssignmentIcon />}
        title="Minha Página"
        subtitle="Descrição da página"
        iconGradient="linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
      />
      
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button variant="contained" startIcon={<AddIcon />}>
          Novo Item
        </Button>
      </Box>
      
      {/* Conteúdo da página */}
    </Box>
  );
};
```

### Customização

O componente aceita qualquer ícone do Material-UI:

```tsx
import {
  Dashboard,
  Assignment,
  Category,
  Build,
  Business,
  AccountTree,
  Precision,
  Speed,
} from '@mui/icons-material';
```

### Dicas

1. **Escolha cores que façam sentido:**
   - Verde para produção/sucesso
   - Vermelho para alertas/máquinas
   - Azul para dados/relatórios
   - Roxo para dashboards
   - Laranja para itens/produtos

2. **Use subtítulos descritivos:**
   - "Gerenciamento de..." para CRUD
   - "Cadastro de..." para formulários
   - "Monitoramento de..." para dashboards
   - "Configuração de..." para settings

3. **Mantenha consistência:**
   - Use o mesmo gradiente para páginas relacionadas
   - Mantenha ícones do mesmo "tema"

