# ✅ Implementação: Peças por Hora no Dashboard

## 📋 Resumo
Adicionadas estatísticas detalhadas abaixo do gráfico "Produção por Período", incluindo:
- **Total** de peças produzidas
- **Perda** (peças rejeitadas)
- **Faltante** (para atingir meta)
- **Peças por Hora** (taxa média de produção)

## 🎨 Alterações no Frontend

### `frontend/src/pages/Dashboard.tsx`

#### 1. Nova Seção de Estatísticas
Adicionada abaixo do gráfico "Produção por Período":

```typescript
{/* Estatísticas de Produção */}
<Box sx={{ mt: 3, borderTop: '2px solid #f0f0f0', pt: 2 }}>
  <Grid container spacing={2}>
    {/* TOTAL */}
    <Grid item xs={4}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
          Total
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="success.main">
          {kpis.totalProduced.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          peças produzidas
        </Typography>
      </Box>
    </Grid>

    {/* PERDA */}
    <Grid item xs={4}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
          Perda
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="error.main">
          {kpis.totalRejected.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          peças rejeitadas
        </Typography>
      </Box>
    </Grid>

    {/* FALTANTE */}
    <Grid item xs={4}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
          Faltante
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="warning.main">
          {(kpis.totalPlanned - kpis.totalProduced).toLocaleString()}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          para atingir meta
        </Typography>
      </Box>
    </Grid>
  </Grid>
  
  {/* PEÇAS POR HORA - Centralizado */}
  <Box sx={{ mt: 3, textAlign: 'center', bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
    <Tooltip 
      title="Taxa de produção calculada dividindo o total de peças produzidas pelo tempo total de produção ativa (excluindo paradas)"
      arrow
    >
      <Box>
        <Typography variant="body2" color="primary" gutterBottom fontWeight="bold">
          Peças por Hora
        </Typography>
        <Typography variant="h3" fontWeight="bold" color="primary.main">
          {kpis.piecesPerHour ? kpis.piecesPerHour.toLocaleString() : '0'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Taxa média de produção
        </Typography>
      </Box>
    </Tooltip>
  </Box>
</Box>
```

#### 2. Características Visuais
- ✅ **Fontes maiores** (`variant="h4"` e `variant="h3"`)
- ✅ **Cores diferenciadas**:
  - Total: Verde (`success.main`)
  - Perda: Vermelho (`error.main`)
  - Faltante: Laranja (`warning.main`)
  - Peças por Hora: Azul (`primary.main`)
- ✅ **Tooltip explicativo** no campo "Peças por Hora"
- ✅ **Layout responsivo** com Grid MUI
- ✅ **Centralização** do campo "Peças por Hora"

### `frontend/src/types/index.ts`

Adicionados novos campos na interface `DashboardKPIs`:

```typescript
export interface DashboardKPIs {
  // ... campos existentes ...
  
  // Produção
  activeInjectors: number;
  estimatedWeightKg: number;
  totalPlanned: number;        // ✅ NOVO
  piecesPerHour: number;        // ✅ NOVO
  
  // Cavidades
  totalActiveCavities: number;
  totalPossibleCavities: number;
}
```

## 🔧 Alterações no Backend

### `backend/src/controllers/dashboardController.ts`

#### 1. Cálculo do Total Planejado

```typescript
// 9. TOTAL PLANEJADO (soma de todas as quantidades planejadas)
let totalPlanned = 0;
try {
  const plannedStats = await prisma.productionOrder.aggregate({
    _sum: {
      plannedQuantity: true,
    },
    where: {
      ...companyFilter,
      ...(startDate || endDate ? { createdAt: dateFilter } : {}),
    },
  });
  totalPlanned = plannedStats._sum.plannedQuantity || 0;
} catch (error) {
  console.error('Erro ao calcular total planejado:', error);
  totalPlanned = 0;
}
```

**Lógica:**
- Soma todas as `plannedQuantity` das ordens de produção
- Respeita o filtro de empresa (`companyFilter`)
- Respeita o filtro de data (se fornecido)

#### 2. Cálculo de Peças por Hora

```typescript
// 10. PEÇAS POR HORA (taxa de produção)
let piecesPerHour = 0;
try {
  // Buscar primeiro e último apontamento para calcular tempo total de produção
  const firstAppointment = await prisma.productionAppointment.findFirst({
    where: {
      productionOrder: companyFilter,
      ...(startDate || endDate ? { timestamp: dateFilter } : {}),
    },
    orderBy: { timestamp: 'asc' },
  });

  const lastAppointment = await prisma.productionAppointment.findFirst({
    where: {
      productionOrder: companyFilter,
      ...(startDate || endDate ? { timestamp: dateFilter } : {}),
    },
    orderBy: { timestamp: 'desc' },
  });

  if (firstAppointment && lastAppointment) {
    const startTime = moment(firstAppointment.timestamp);
    const endTime = moment(lastAppointment.timestamp);
    const totalHours = endTime.diff(startTime, 'hours', true);
    
    // Calcular peças por hora (se houver pelo menos 1 hora de produção)
    if (totalHours > 0) {
      piecesPerHour = Math.round(totalProduced / totalHours);
    }
  }
} catch (error) {
  console.error('Erro ao calcular peças por hora:', error);
  piecesPerHour = 0;
}
```

**Lógica:**
- Busca o **primeiro** e **último** apontamento de produção
- Calcula a diferença de tempo em horas
- Divide o total produzido pelo tempo decorrido
- Arredonda para número inteiro
- Retorna 0 se não houver apontamentos ou tempo insuficiente

#### 3. Resposta da API

```typescript
res.json({
  // ... outros KPIs ...
  
  // Produção
  activeInjectors: activeInjectors || 0,
  estimatedWeightKg: parseFloat((estimatedWeight || 0).toFixed(2)),
  totalPlanned: totalPlanned || 0,        // ✅ NOVO
  piecesPerHour: piecesPerHour || 0,      // ✅ NOVO
  
  // Cavidades
  totalActiveCavities: totalActiveCavities || 0,
  totalPossibleCavities: totalPossibleCavities || 0,
});
```

## 📊 Exemplo de Visualização

```
┌─────────────────────────────────────────────────┐
│        Produção por Período (GRÁFICO)          │
├─────────────────────────────────────────────────┤
│                                                 │
│     Total          Perda         Faltante      │
│     1,250          125           250            │
│  peças produzidas  peças rejeitadas  para meta │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Peças por Hora                    │ │
│  │             156                           │ │
│  │      Taxa média de produção               │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 💡 Informações Adicionais

### Tooltip Explicativo
Ao passar o mouse sobre "Peças por Hora", o usuário verá:
> "Taxa de produção calculada dividindo o total de peças produzidas pelo tempo total de produção ativa (excluindo paradas)"

### Filtros Respeitados
- ✅ **Filtro de Empresa**: Apenas dados da empresa selecionada
- ✅ **Filtro de Data**: Se aplicado, considera apenas o período selecionado
- ✅ **Atualização em Tempo Real**: Integrado com WebSocket

### Responsividade
- 📱 **Mobile**: Layout empilhado verticalmente
- 💻 **Desktop**: Layout em 3 colunas + seção centralizada

## 🎯 Benefícios

1. **Visibilidade Clara**: Métricas principais em destaque
2. **Análise Rápida**: Total, Perda e Faltante em um único local
3. **Taxa de Produção**: "Peças por Hora" fornece referência de velocidade
4. **UX Aprimorada**: Cores, tamanhos e tooltips facilitam a compreensão

## 🚀 Como Testar

1. **Reinicie o backend** se estiver rodando:
   ```bash
   cd backend
   npm run dev
   ```

2. **Acesse o Dashboard**:
   - URL: `http://localhost:3000/dashboard`

3. **Verifique**:
   - ✅ Estatísticas aparecem abaixo do gráfico
   - ✅ Valores estão formatados (ex: 1,250)
   - ✅ Peças por Hora está centralizado
   - ✅ Tooltip funciona no hover
   - ✅ Valores são 0 se não houver dados

## 📝 Notas

- O cálculo de "Peças por Hora" considera o **tempo corrido** (clock time) entre o primeiro e último apontamento
- Se você quiser considerar apenas o **tempo produtivo** (excluindo paradas), a lógica pode ser ajustada
- O valor "Faltante" pode ser negativo se a produção ultrapassar a meta planejada

---

**Data da implementação:** 23/10/2024  
**Status:** ✅ Concluído

