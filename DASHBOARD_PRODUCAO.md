# Dashboard de Produção

## Descrição

O **Dashboard de Produção** é uma interface visual moderna e intuitiva para monitoramento e controle em tempo real das ordens de produção. Esta página foi criada com base nos requisitos de visualização de status e controle operacional de processos de manufatura.

## Características

### 🎨 Interface Moderna
- Design responsivo com Material-UI
- Cards interativos com efeito hover
- Gradientes e sombras para melhor experiência visual
- Ícones intuitivos para cada funcionalidade

### 📊 Informações Principais

#### Cabeçalho
- Ícone de velocímetro (Speed) representando o dashboard
- Breadcrumb navegável: `Injetoras > Painel Ordem > Dashboard Produção`
- Navegação fácil entre seções

#### Dados da Ordem
1. **Número da Ordem**: Display grande e destacado
2. **Referência do Produto**: Nome/código do item em produção

### 🎯 Cards de Controle

#### 1. Configuração Setup
- **Ícone**: Engrenagem (Settings)
- **Cor**: Azul
- **Status**: Mostra se o setup foi finalizado ou está em andamento
- **Função**: Controle de configuração inicial da ordem

#### 2. Ciclo
- **Ícone**: Loop (rotação)
- **Cor**: Ciano
- **Função**: Monitoramento do ciclo de produção

#### 3. Apontamento Perda
- **Ícone**: Aviso (Warning)
- **Cor**: Laranja
- **Função**: Registro de perdas e refugos

#### 4. Parada de Produção
- **Ícone**: Pause
- **Cor**: Verde
- **Status**: Indica se a ordem está em operação ou parada
- **Função**: Controle de paradas planejadas e não planejadas

#### 5. Resumo da Ordem
- **Ícone**: Gráfico (Assessment)
- **Cor**: Verde claro
- **Função**: Visualização de métricas e resumo geral

## Estrutura de Arquivos

```
frontend/src/
├── pages/
│   └── ProductionDashboard.tsx    # Página principal do dashboard
├── App.tsx                          # Rota adicionada: /production-dashboard
└── components/
    └── Layout/
        └── MenuItems.tsx           # Item de menu adicionado
```

## Acesso

### Navegação
1. Faça login no sistema
2. No menu lateral, clique em **"Dashboard Produção"**
3. Ou acesse diretamente via URL: `/production-dashboard`

### Breadcrumb
- Clique em "Injetoras" para voltar ao dashboard principal
- Clique em "Painel Ordem" para ver as ordens de produção

## Funcionalidades Interativas

### Cards Clicáveis
Todos os cards são clicáveis e preparados para:
- Abrir dialogs com informações detalhadas
- Navegar para páginas específicas
- Executar ações relacionadas ao contexto

### Atualização em Tempo Real
A página está preparada para:
- Integração com WebSocket para updates em tempo real
- Atualização automática de status
- Notificações de mudanças de estado

## Integração Futura

### API Endpoints Esperados

```typescript
// Exemplo de estrutura de dados
interface OrderData {
  orderNumber: string;
  reference: string;
  setupFinalized: boolean;
  inOperation: boolean;
  cycle: {
    current: number;
    total: number;
  };
  losses: {
    count: number;
    percentage: number;
  };
  // ... outros campos
}
```

### WebSocket Events
```javascript
// Eventos que podem ser ouvidos
socket.on('order:status:update', (data) => {
  // Atualizar status da ordem
});

socket.on('production:cycle:complete', (data) => {
  // Atualizar ciclo
});

socket.on('production:downtime:start', (data) => {
  // Registrar parada
});
```

## Personalização

### Cores dos Cards
As cores são definidas nas funções `getIconColor()` e `getIconColorDark()`:

```typescript
const getIconColor = (title: string): string => {
  switch (title) {
    case 'Configuração Setup': return '#2196f3';
    case 'Ciclo': return '#00bcd4';
    case 'Apontamento Perda': return '#ff9800';
    case 'Parada de Produção': return '#4caf50';
    case 'Resumo da Ordem': return '#8bc34a';
  }
};
```

### Status Chips
Os chips de status podem ter as cores:
- **success** (verde): Operação normal
- **warning** (amarelo): Atenção necessária
- **error** (vermelho): Problema crítico
- **info** (azul): Informação

## Responsividade

### Breakpoints
- **Mobile (xs)**: Cards em coluna única
- **Tablet (sm)**: 2 cards por linha
- **Desktop (md+)**: Até 3 cards por linha

### Grid System
```typescript
<Grid item xs={12} sm={6} md={4}>
  // Cada card se ajusta automaticamente
</Grid>
```

## Exemplos de Uso

### Estado Inicial (Setup)
```typescript
const [orderData] = useState({
  orderNumber: '6',
  reference: 'POTE RETANGULAR 500ML',
  setupFinalized: false,  // Em setup
  inOperation: false,      // Não operando
});
```

### Em Produção
```typescript
const [orderData] = useState({
  orderNumber: '6',
  reference: 'POTE RETANGULAR 500ML',
  setupFinalized: true,   // Setup concluído
  inOperation: true,      // Em operação
});
```

## Próximos Passos

### Funcionalidades a Implementar
1. ✅ Interface visual criada
2. ⏳ Integração com API de ordens
3. ⏳ WebSocket para dados em tempo real
4. ⏳ Dialogs de detalhes para cada card
5. ⏳ Gráficos e métricas
6. ⏳ Histórico de eventos
7. ⏳ Exportação de relatórios

### Melhorias Futuras
- Dashboard customizável (arrastar e soltar cards)
- Temas dark/light
- Notificações push
- Alertas sonoros para eventos críticos
- Suporte a múltiplas ordens simultâneas

## Tecnologias Utilizadas

- **React** 18+ com TypeScript
- **Material-UI** v5
- **React Router** para navegação
- **React Hooks** para gerenciamento de estado

## Suporte

Para dúvidas ou sugestões sobre o Dashboard de Produção, consulte:
- Documentação do projeto: `README.md`
- Arquitetura: `ARCHITECTURE.md`
- Guia de instalação: `INSTALL.md`

---

**Versão**: 1.0.0  
**Data de Criação**: Outubro 2025  
**Autor**: Equipe MES Development

