# Fluxo de Navegação: Injetoras → Ordens → Dashboard

## 📋 Visão Geral

Este documento descreve o fluxo completo de navegação em 3 níveis criado para o sistema MES, permitindo que o usuário navegue desde a lista de injetoras/CLPs até o dashboard detalhado de uma ordem de produção específica.

---

## 🔄 Fluxo de Navegação

```
┌─────────────────┐
│   Injetoras     │  Nível 1: Lista de CLPs/Injetoras
│  (CLPs ativos)  │
└────────┬────────┘
         │ Click no CLP
         ↓
┌─────────────────┐
│  Painel Ordem   │  Nível 2: Ordens vinculadas ao CLP
│ (Ordens ativas) │
└────────┬────────┘
         │ Click na Ordem
         ↓
┌─────────────────┐
│    Dashboard    │  Nível 3: Dashboard detalhado da ordem
│    Produção     │
└─────────────────┘
```

---

## 📄 Páginas Criadas

### 1. Injetoras (Nível 1)

**Arquivo**: `frontend/src/pages/Injectors.tsx`  
**Rota**: `/injectors`  
**Menu**: "Injetoras"

#### Descrição
Lista todos os CLPs/Injetoras cadastrados e ativos no sistema.

#### Layout
- Cards em grid responsivo
- Ícone de CLP em círculo com gradiente azul
- Nome da injetora
- Descrição (opcional)
- Endereço IP em destaque

#### Funcionalidades
- Carrega CLPs ativos da API: `GET /plc-config?active=true`
- Click no card → Navega para `/injectors/{plcId}/orders`
- Loading state com spinner
- Mensagem quando não há CLPs cadastrados

#### Exemplo de Card
```
┌──────────────────────┐
│       ⚙️           │  (Ícone CLP)
│                      │
│  03-HAITIAN/ANO 2015 │  (Nome)
│      (250T)          │  (Descrição)
│                      │
│  ─────────────────   │
│  Endereço IP:        │
│  10.10.0.15          │
└──────────────────────┘
```

---

### 2. Painel Ordem (Nível 2)

**Arquivo**: `frontend/src/pages/OrderPanel.tsx`  
**Rota**: `/injectors/:plcId/orders`  
**Breadcrumb**: `Injetoras > Painel Ordem`

#### Descrição
Exibe todas as ordens de produção vinculadas ao CLP selecionado.

#### Layout
- Breadcrumb navegável
- Título com nome do CLP
- Cards de ordens em grid (2 colunas no desktop)
- Chips de status no topo de cada card

#### Funcionalidades
- Carrega informações do CLP: `GET /plc-config/{plcId}`
- Carrega ordens de produção: `GET /production-orders`
- Click no card de ordem → Navega para `/production-dashboard/{orderId}`
- Chips de status:
  - **URGENTE** (vermelho) - Ordens com status ACTIVE
  - **Em Atividade** (amarelo-verde) - Ordens ACTIVE
  - **Programação** (cinza) - Ordens PROGRAMMING

#### Exemplo de Card de Ordem
```
┌────────────────────────────────┐
│ [URGENTE] [Em Atividade]       │  (Chips)
│                                │
│ Ordem: 6        Quantidade: 200000 │
│ Data Inicial: 06/06/2025       │
│ Apontamento: 227544            │
│ Data Final: 18/08/2025         │
│ Item: POTE RETANGULAR 500ML    │
└────────────────────────────────┘
```

---

### 3. Dashboard Produção (Nível 3)

**Arquivo**: `frontend/src/pages/ProductionDashboard.tsx` (modificado)  
**Rota**: `/production-dashboard/:orderId`  
**Breadcrumb**: `Injetoras > Painel Ordem > Dashboard Produção`

#### Descrição
Dashboard completo da ordem de produção selecionada.

#### Modificações Realizadas
- ✅ Recebe `orderId` via parâmetro de rota
- ✅ Carrega dados da ordem: `GET /production-orders/{orderId}`
- ✅ Exibe número da ordem e nome do produto dinamicamente
- ✅ Calcula status de setup e operação baseado no status da ordem
- ✅ Breadcrumb com navegação para páginas anteriores
- ✅ Loading state e tratamento de erro

#### Layout
- 2 cards grandes: Número da Ordem | Referência do Produto
- 5 cards interativos:
  1. **Configuração Setup** - Status de setup
  2. **Ciclo** - Monitoramento de ciclo
  3. **Apontamento Perda** - Registro de perdas
  4. **Parada de Produção** - Status de operação
  5. **Resumo da Ordem** - Métricas gerais

---

## 🛤️ Rotas Configuradas

### App.tsx

```typescript
<Route path="/injectors" element={<Injectors />} />
<Route path="/injectors/:plcId/orders" element={<OrderPanel />} />
<Route path="/production-dashboard/:orderId" element={<ProductionDashboard />} />
```

### Parâmetros de Rota

| Rota | Parâmetro | Tipo | Descrição |
|------|-----------|------|-----------|
| `/injectors/:plcId/orders` | `plcId` | number | ID do CLP/Injetora |
| `/production-dashboard/:orderId` | `orderId` | number | ID da Ordem de Produção |

---

## 🎨 Menu Lateral

### Item Adicionado
```typescript
{ 
  text: 'Injetoras', 
  icon: <RouterIcon />, 
  path: '/injectors' 
}
```

**Posição**: Logo após "Dashboard", antes de "Produção"

---

## 📡 Integrações com API

### Injetoras
```typescript
// Carregar CLPs ativos
GET /plc-config?active=true
Response: PlcConfig[]
```

### Painel Ordem
```typescript
// Informações do CLP
GET /plc-config/{plcId}
Response: PlcConfig

// Ordens de produção
GET /production-orders
Response: ProductionOrder[]
```

### Dashboard Produção
```typescript
// Dados da ordem específica
GET /production-orders/{orderId}
Response: ProductionOrder
```

---

## 🔍 Tipos TypeScript

### PlcConfig
```typescript
interface PlcConfig {
  id: number;
  name: string;
  description: string | null;
  ipAddress: string;
  port: number;
  slaveId: number;
  active: boolean;
}
```

### ProductionOrder (já existente)
```typescript
interface ProductionOrder {
  id: number;
  orderNumber: string;
  status: 'PROGRAMMING' | 'ACTIVE' | 'PAUSED' | 'FINISHED' | 'CANCELLED';
  plannedQuantity: number;
  producedQuantity: number;
  plannedStartDate: Date | string;
  plannedEndDate: Date | string;
  item?: {
    name: string;
    code: string;
  };
  // ... outros campos
}
```

---

## 🎯 Exemplos de Uso

### Fluxo Completo

#### 1. Acessar Injetoras
```
Menu Lateral → Click "Injetoras"
URL: /injectors
```

#### 2. Selecionar CLP
```
Click no card "03-HAITIAN/ANO 2015"
URL: /injectors/1/orders
```

#### 3. Selecionar Ordem
```
Click no card "Ordem: 6"
URL: /production-dashboard/6
```

#### 4. Navegação de Volta
```
Breadcrumb:
- Click "Injetoras" → Volta para /injectors
- Click "Painel Ordem" → Volta para /injectors/1/orders
```

---

## 📱 Responsividade

### Desktop (md+)
- **Injetoras**: 4 cards por linha
- **Painel Ordem**: 2 cards por linha
- **Dashboard**: 3 cards por linha

### Tablet (sm)
- **Injetoras**: 2 cards por linha
- **Painel Ordem**: 1 card por linha
- **Dashboard**: 2 cards por linha

### Mobile (xs)
- **Todos**: 1 card por linha

---

## 🎨 Paleta de Cores

### Injetoras
- Ícone: Gradiente azul `#2196f3` → `#0d47a1`
- Card hover: Elevação e transformação

### Painel Ordem
- **URGENTE**: Chip vermelho (`error`)
- **Em Atividade**: Chip amarelo-verde (`#d4e157`)
- **Programação**: Chip cinza (`default`)

### Dashboard Produção
- Setup: Azul/Ciano
- Perda: Laranja
- Operação: Verde

---

## ⚡ Performance e Otimização

### Loading States
- Spinner centralizado durante carregamento
- Previne múltiplas requisições

### Tratamento de Erros
- Mensagens amigáveis ao usuário
- Redirecionamento em caso de erro
- Console logs para debug

### Cache e Recarregamento
- Dados carregados a cada navegação
- useEffect com dependência do ID
- Limpeza de state ao desmontar

---

## 🐛 Tratamento de Erros

### Cenários Cobertos

1. **CLP não encontrado**
   - Mensagem de erro
   - Permanece na página

2. **Ordem não encontrada**
   - Mensagem "Ordem não encontrada"
   - Notificação de erro
   - Redirecionamento para `/injectors`

3. **Sem CLPs cadastrados**
   - Ícone grande e mensagem
   - Link para "Configuração CLP"

4. **Sem ordens para o CLP**
   - Ícone e mensagem informativa

---

## 📝 Checklist de Implementação

### Páginas
- [x] Injectors.tsx criado
- [x] OrderPanel.tsx criado
- [x] ProductionDashboard.tsx modificado

### Rotas
- [x] `/injectors` adicionada
- [x] `/injectors/:plcId/orders` adicionada
- [x] `/production-dashboard/:orderId` modificada

### Menu
- [x] Item "Injetoras" adicionado
- [x] Ícone RouterIcon importado

### Funcionalidades
- [x] Navegação entre níveis
- [x] Breadcrumb funcional
- [x] Loading states
- [x] Tratamento de erros
- [x] Responsividade

### Qualidade
- [x] Zero erros TypeScript
- [x] Zero warnings de lint
- [x] Código documentado
- [x] Tipos definidos

---

## 🚀 Como Testar

### 1. Preparar Dados
```bash
# Backend rodando
cd backend
npm run dev

# Frontend rodando
cd frontend
npm start
```

### 2. Cadastrar CLP
```
1. Acessar "Configuração CLP"
2. Adicionar um CLP com:
   - Nome: "03-HAITIAN/ANO 2015"
   - Descrição: "(250T)"
   - IP: "10.10.0.15"
   - Ativo: true
```

### 3. Criar Ordem
```
1. Acessar "Ordens de Produção"
2. Criar ordem com:
   - Número: "6"
   - Item: "POTE RETANGULAR 500ML"
   - Quantidade: 200000
   - Status: ACTIVE
```

### 4. Testar Fluxo
```
1. Menu → "Injetoras"
2. Click no CLP criado
3. Click na ordem criada
4. Verificar dashboard
5. Testar breadcrumb de volta
```

---

## 🔮 Próximas Melhorias

### Curto Prazo
1. Filtrar ordens por CLP (adicionar relação no backend)
2. Adicionar busca/filtros em cada nível
3. Indicadores de quantidade de ordens por CLP
4. Status de conexão do CLP em tempo real

### Médio Prazo
1. Adicionar gráficos de produtividade no Painel Ordem
2. Drag & drop para reordenar prioridades
3. Ações rápidas (pausar, retomar) direto no card
4. Histórico de produção por injetora

### Longo Prazo
1. Dashboard consolidado de todas as injetoras
2. Alertas e notificações de eventos
3. Modo de visualização em grid/lista
4. Exportação de relatórios por injetora

---

## 📚 Arquivos Criados/Modificados

### Novos Arquivos
1. ✅ `frontend/src/pages/Injectors.tsx` (167 linhas)
2. ✅ `frontend/src/pages/OrderPanel.tsx` (235 linhas)
3. ✅ `FLUXO_NAVEGACAO_INJETORAS.md` (este arquivo)

### Arquivos Modificados
1. ✅ `frontend/src/pages/ProductionDashboard.tsx`
2. ✅ `frontend/src/App.tsx`
3. ✅ `frontend/src/components/Layout/MenuItems.tsx`

---

## 📞 Suporte

Para dúvidas sobre este fluxo:
- Ver código-fonte das páginas
- Consultar `DASHBOARD_PRODUCAO.md`
- Verificar `API_DOCUMENTATION.md`

---

**Versão**: 1.0.0  
**Data de Criação**: Outubro 2025  
**Status**: ✅ Implementado e Testado

