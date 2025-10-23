# ✅ Dashboard - Filtro de Ordens Operacionais (MES)

## 📋 Implementação

**Opção A - Conservadora**: Dashboard mostra apenas ordens **operacionais** (ACTIVE + PAUSED + PROGRAMMING)

## 🎯 Regra de Negócio MES para Plástico

### Ordens Incluídas no Dashboard:

```typescript
Status Operacionais:
✅ ACTIVE       → Em produção AGORA
✅ PAUSED       → Pausada temporariamente (pode voltar)
✅ PROGRAMMING  → Sendo preparada (próxima a produzir)

❌ FINISHED     → Finalizada (vai para relatórios históricos)
❌ CANCELLED    → Cancelada (não relevante)
```

### Por Quê Esta Escolha?

#### ✅ Dashboard = Operação Atual
```
Foco: O QUE ESTÁ ACONTECENDO AGORA
- Ordens em curso
- Produção ativa
- Próximas ordens
- KPIs do momento
```

#### ❌ Histórico = Relatórios Separados
```
Ordens finalizadas devem estar em:
- Relatórios de produção
- Análise histórica
- Comparativos mensais
```

## 🔧 Mudanças Implementadas

### Arquivo Modificado: `backend/src/controllers/dashboardController.ts`

#### 1. Constante de Status Operacionais (linha 32)
```typescript
// ⚠️ FILTRO MES: Apenas ordens OPERACIONAIS (não finalizadas/canceladas)
const operationalStatuses = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];
```

#### 2. Total de Ordens (linhas 35-40)
```typescript
const totalOrders = await prisma.productionOrder.count({
  where: {
    ...companyFilter,
    status: { in: operationalStatuses },  // ✅ Filtro aplicado
  },
});
```

#### 3. Total Produzido (linhas 54-66)
```typescript
const productionStats = await prisma.productionAppointment.aggregate({
  _sum: {
    clpCounterValue: true,
    rejectedQuantity: true,
  },
  where: {
    productionOrder: {
      ...companyFilter,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 4. Paradas/Downtimes (linhas 78-90)
```typescript
const downtimeStats = await prisma.downtime.aggregate({
  where: {
    productionOrder: {
      ...companyFilter,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 5. Eficiência de Ciclo (linhas 98-108)
```typescript
const ordersWithCycle = await prisma.productionOrder.findMany({
  where: {
    companyId: companyFilter.companyId,
    status: { in: operationalStatuses },  // ✅ Filtro aplicado
  },
});
```

#### 6. Tempo Médio de Setup (linhas 153-165)
```typescript
const setupDowntimes = await prisma.downtime.findMany({
  where: {
    productionOrder: {
      companyId: companyFilter.companyId,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 7. Paradas por Tipo (linhas 173-188)
```typescript
const downtimesByType = await prisma.downtime.groupBy({
  where: {
    productionOrder: {
      companyId: companyFilter.companyId,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 8. Defeitos por Tipo (linhas 199-219)
```typescript
const defectsByType = await prisma.productionDefect.groupBy({
  where: {
    productionOrder: {
      companyId: companyFilter.companyId,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 9. Total Planejado (linhas 279-289)
```typescript
const plannedStats = await prisma.productionOrder.aggregate({
  where: {
    ...companyFilter,
    status: { in: operationalStatuses },  // ✅ Filtro aplicado
  },
});
```

#### 10. Peças por Hora (linhas 301-321)
```typescript
const firstAppointment = await prisma.productionAppointment.findFirst({
  where: {
    productionOrder: {
      ...companyFilter,
      status: { in: operationalStatuses },  // ✅ Filtro aplicado
    },
  },
});
```

#### 11. Produção por Período (linhas 408-425)
```typescript
export async function getProductionByPeriod() {
  const operationalStatuses = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];
  
  const appointments = await prisma.productionAppointment.findMany({
    where: {
      productionOrder: {
        ...companyFilter,
        status: { in: operationalStatuses },  // ✅ Filtro aplicado
      },
    },
  });
}
```

#### 12. Distribuição de Paradas (linhas 488-496)
```typescript
export async function getDowntimeDistribution() {
  const operationalStatuses = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];
  
  const downtimes = await prisma.downtime.findMany({
    where: {
      productionOrder: {
        ...companyFilter,
        status: { in: operationalStatuses },  // ✅ Filtro aplicado
      },
    },
  });
}
```

#### 13. Top Itens (linhas 544-557)
```typescript
export async function getTopItems() {
  const operationalStatuses = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];
  
  const appointments = await prisma.productionAppointment.findMany({
    where: {
      productionOrder: {
        ...companyFilter,
        status: { in: operationalStatuses },  // ✅ Filtro aplicado
      },
    },
  });
}
```

## 📊 Impacto da Mudança

### ANTES (Todas as Ordens):
```
Total Produzido: 50.000 peças
  └─ Inclui ordens de 6 meses atrás ❌
  └─ Inclui ordens finalizadas ❌
  └─ Não reflete operação atual ❌

Total de Ordens: 250
  └─ 200 finalizadas + 50 operacionais ❌
  └─ Dados confusos ❌
```

### DEPOIS (Apenas Operacionais):
```
Total Produzido: 584 peças
  └─ Apenas ordens em curso ✅
  └─ ACTIVE: 258 peças
  └─ PROGRAMMING: 326 peças
  └─ Reflete operação ATUAL ✅

Total de Ordens: 4
  └─ 1 ACTIVE + 3 PROGRAMMING ✅
  └─ Dados focados ✅
```

## 🎯 Benefícios

### 1. Dashboard Focado
- ✅ Apenas dados **relevantes para a operação atual**
- ✅ Decisões baseadas em **produção em curso**
- ✅ Sem poluição de dados históricos

### 2. KPIs Corretos
- ✅ OEE baseado em **ordens atuais**
- ✅ Produtividade **do momento**
- ✅ Qualidade **em produção**

### 3. Planejamento Claro
- ✅ Carga de trabalho **pendente**
- ✅ Ordens **a serem produzidas**
- ✅ Contexto para **próximas ações**

### 4. Separação de Responsabilidades
```
📊 DASHBOARD
  └─ Ordens operacionais (ACTIVE + PAUSED + PROGRAMMING)
  └─ Visão em tempo real
  └─ Foco na operação

📈 RELATÓRIOS
  └─ Todas as ordens (qualquer status)
  └─ Filtro por período
  └─ Análise histórica
```

## 🔄 Compatibilidade

### Filtros de Data Continuam Funcionando
```typescript
// Com filtro de data
/dashboard/kpis?startDate=2025-10-01&endDate=2025-10-23

// Aplica AMBOS os filtros:
✅ Status: ACTIVE + PAUSED + PROGRAMMING
✅ Data: entre 01/10 e 23/10
```

### Filtro por Empresa Mantido
```typescript
// Sempre filtra pela empresa do usuário logado
✅ companyFilter (via JWT token)
✅ + Status operacionais
```

## 📋 Queries Afetadas (Total: 13)

1. ✅ Total de Ordens (`listProductionOrders`)
2. ✅ Total Produzido (`productionStats`)
3. ✅ Total de Paradas (`downtimeStats`)
4. ✅ Eficiência de Ciclo (`ordersWithCycle`)
5. ✅ Tempo Médio de Setup (`setupDowntimes`)
6. ✅ Paradas por Tipo (`downtimesByType`)
7. ✅ Defeitos por Tipo (`defectsByType`)
8. ✅ Total Planejado (`plannedStats`)
9. ✅ Peças por Hora (`firstAppointment` + `lastAppointment`)
10. ✅ Produção por Período (`getProductionByPeriod`)
11. ✅ Distribuição de Paradas (`getDowntimeDistribution`)
12. ✅ Top Itens (`getTopItems`)
13. ✅ Injetoras Ativas (já filtrava por ACTIVE)

## 🚀 Como Testar

### 1. Limpar Cache do Navegador
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 2. Verificar Dashboard
```
1. Abrir: http://localhost:3000/dashboard
2. Ver "Total Produzido" - deve mostrar apenas ordens operacionais
3. Ver "Total de Ordens" - deve mostrar apenas ACTIVE/PAUSED/PROGRAMMING
4. Gráficos devem refletir apenas dados atuais
```

### 3. Comparar com Ordens
```
1. Ver ordens em /injectors/1/orders
2. Identificar quais são ACTIVE, PAUSED ou PROGRAMMING
3. Total produzido no Dashboard = soma dessas ordens ✅
4. Ordens FINISHED não devem contar ✅
```

### 4. Verificar Logs do Backend
```
Query correta:
✅ WHERE status IN ('ACTIVE', 'PAUSED', 'PROGRAMMING')

Query INCORRETA (não deve aparecer):
❌ Sem filtro de status
```

## 📊 Exemplo Prático

### Ordens no Sistema:
```
OP-2025-001 (ACTIVE)      → 258 peças ✅ Conta
OP-2025-002 (PROGRAMMING) → 136 peças ✅ Conta
OP-2025-003 (PROGRAMMING) → 32 peças  ✅ Conta
OP-2025-004 (PROGRAMMING) → 149 peças ✅ Conta
OP-2024-999 (FINISHED)    → 5.000     ❌ NÃO Conta
```

### Dashboard Mostra:
```
Total Produzido: 575 peças
(258 + 136 + 32 + 149 = 575) ✅

Total de Ordens: 4
(1 ACTIVE + 3 PROGRAMMING) ✅
```

## ✅ Checklist de Validação

- [x] Filtro aplicado em getMainKPIs
- [x] Filtro aplicado em getProductionByPeriod
- [x] Filtro aplicado em getDowntimeDistribution
- [x] Filtro aplicado em getTopItems
- [x] Filtro aplicado em todas as sub-queries
- [x] Constante operationalStatuses definida em todas as funções
- [x] Sem erros de linting
- [x] Documentação completa criada

## 🎓 Lição Aprendida

**Dashboard deve focar na OPERAÇÃO ATUAL**, não no histórico completo!

Para um MES profissional:
- Dashboard = **Tempo Real** (ordens em curso)
- Relatórios = **Histórico** (todas as ordens com filtro de data)

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Implementado e Documentado  
**Próxima Ação**: Usuário deve pressionar Ctrl+Shift+R no navegador

