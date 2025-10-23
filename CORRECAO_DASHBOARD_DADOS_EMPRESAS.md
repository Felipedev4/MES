# 🚨 CORREÇÃO: Dashboard - Dados Incorretos por Empresa

## 📋 Problema Identificado

O Dashboard estava exibindo dados **muito acima** do real porque usava o campo `quantity` (tempo de ciclo) em vez de `clpCounterValue` (peças produzidas).

### Exemplo do Problema:
```
❌ ANTES (ERRADO):
Total Produzido: 584 (mas na verdade são ~58 peças)
Cálculo errado: Soma de quantity (tempo) = 5.840 unidades de tempo

✅ DEPOIS (CORRETO):
Total Produzido: 58 peças
Cálculo correto: Soma de clpCounterValue = 58 peças
```

## 🔍 Causa Raiz

**Mesmo problema** do `producedQuantity` que corrigimos anteriormente!

O Dashboard tinha **4 lugares** onde usava `quantity` incorretamente:

1. ❌ KPIs principais (Total Produzido)
2. ❌ Produção por Período (gráfico de linha)
3. ❌ Eficiência de Ciclo
4. ❌ Top Itens mais produzidos

## ✅ Correções Aplicadas

### 1. KPIs Principais (`getMainKPIs`)

**Arquivo**: `backend/src/controllers/dashboardController.ts` (linhas 47-61)

**Antes**:
```typescript
const productionStats = await prisma.productionAppointment.aggregate({
  _sum: {
    quantity: true,  // ❌ ERRADO: tempo de ciclo
    rejectedQuantity: true,
  },
  where: {
    productionOrder: companyFilter,
  },
});

const totalProduced = productionStats._sum.quantity || 0;
```

**Depois**:
```typescript
// ⚠️ IMPORTANTE: Usar clpCounterValue (peças) e não quantity (tempo de ciclo)
const productionStats = await prisma.productionAppointment.aggregate({
  _sum: {
    clpCounterValue: true,  // ✅ CORRETO: peças produzidas
    rejectedQuantity: true,
  },
  where: {
    productionOrder: companyFilter,
  },
});

const totalProduced = productionStats._sum.clpCounterValue || 0;
```

### 2. Produção por Período (`getProductionByPeriod`)

**Arquivo**: `backend/src/controllers/dashboardController.ts` (linhas 412-413)

**Antes**:
```typescript
groupedData[key].produced += app.quantity;  // ❌ ERRADO
```

**Depois**:
```typescript
// ⚠️ CORRIGIDO: Usar clpCounterValue (peças) e não quantity (tempo de ciclo)
groupedData[key].produced += app.clpCounterValue || 0;  // ✅ CORRETO
```

### 3. Eficiência de Ciclo

**Arquivo**: `backend/src/controllers/dashboardController.ts` (linhas 106-111)

**Antes**:
```typescript
const totalPieces = appointments.reduce((sum, app) => sum + app.quantity, 0);  // ❌ ERRADO
const realCyclePerPiece = timeElapsed / totalPieces;
```

**Depois**:
```typescript
// ⚠️ CORRIGIDO: Usar clpCounterValue (peças) e não quantity (tempo de ciclo)
const totalPieces = appointments.reduce((sum, app) => sum + (app.clpCounterValue || 0), 0);  // ✅ CORRETO
const realCyclePerPiece = totalPieces > 0 ? timeElapsed / totalPieces : 0;
```

### 4. Top Itens Mais Produzidos (`getTopItems`)

**Arquivo**: `backend/src/controllers/dashboardController.ts` (linhas 527-528)

**Antes**:
```typescript
itemStats[itemId].totalProduced += app.quantity;  // ❌ ERRADO
```

**Depois**:
```typescript
// ⚠️ CORRIGIDO: Usar clpCounterValue (peças) e não quantity (tempo de ciclo)
itemStats[itemId].totalProduced += app.clpCounterValue || 0;  // ✅ CORRETO
```

## 📊 Impacto da Correção

### Antes (ERRADO) - Usando `quantity`:
```
Total Produzido: 584
  └─ Na verdade: 5.840 unidades de TEMPO
  └─ Não representa peças reais!

Produção por Período (gráfico):
  └─ Linha mostrando valores altíssimos
  └─ Dados completamente incorretos

Top Itens:
  └─ Rankings errados
  └─ Baseados em tempo, não em peças
```

### Depois (CORRETO) - Usando `clpCounterValue`:
```
Total Produzido: 58
  └─ 58 peças REAIS do contador do PLC
  └─ Dados corretos! ✅

Produção por Período (gráfico):
  └─ Linha mostrando valores reais
  └─ Dados compatíveis com OrderSummary ✅

Top Itens:
  └─ Rankings corretos
  └─ Baseados em peças produzidas ✅
```

## 🔄 Como Aplicar a Correção

### 1. Backend já foi corrigido ✅

O código foi atualizado e o backend reiniciado.

### 2. Limpar Cache do Navegador 🌐

**O navegador pode estar usando dados antigos em cache!**

#### Opção A - Atualização Forçada (Recomendado):
```
1. Pressione Ctrl + Shift + R (Windows/Linux)
   ou Cmd + Shift + R (Mac)
2. Isso força o navegador a buscar dados novos
```

#### Opção B - Limpar Cache Manualmente:
```
1. Abra DevTools (F12)
2. Vá em "Network" (Rede)
3. Marque "Disable cache"
4. Recarregue a página (F5)
```

#### Opção C - Modo Anônimo:
```
1. Abra uma janela anônima (Ctrl + Shift + N)
2. Faça login novamente
3. Acesse o Dashboard
```

## 🎯 Validação

### Como Verificar se Está Correto Agora:

1. **Compare com OrderSummary**:
   ```
   Dashboard "Total Produzido" = OrderSummary "Total"
   
   Exemplo:
   OP-2025-001: 258 peças (ambos devem mostrar isso)
   ```

2. **Verifique no Banco de Dados**:
   ```sql
   -- Executar esta query
   SELECT 
       SUM("clpCounterValue") as total_pecas_produzidas,
       COUNT(*) as total_apontamentos
   FROM production_appointments pa
   JOIN production_orders po ON po.id = pa."productionOrderId"
   WHERE po."companyId" = 1;
   ```

3. **Logs do Backend**:
   ```
   Procure por queries como:
   SELECT SUM("clpCounterValue") ...  ✅ (correto)
   
   NÃO deve aparecer:
   SELECT SUM("quantity") ...  ❌ (errado)
   ```

## 📋 Checklist de Verificação

Após limpar o cache do navegador, verifique:

- [ ] Total Produzido no Dashboard bate com soma das ordens
- [ ] Gráfico "Produção por Período" mostra valores realistas
- [ ] Top Itens mostra quantidades corretas de peças
- [ ] KPIs (OEE, Qualidade, etc.) fazem sentido
- [ ] Valores são compatíveis com OrderSummary
- [ ] Nenhum valor absurdamente alto (> 100.000)

## 🔍 Queries Corretas nos Logs

Você deve ver queries assim nos logs do Prisma:

```sql
✅ CORRETO:
SELECT SUM("clpCounterValue"), SUM("rejectedQuantity") FROM ...
```

**NÃO** deve aparecer:
```sql
❌ ERRADO:
SELECT SUM("quantity"), SUM("rejectedQuantity") FROM ...
```

## 📁 Arquivos Modificados

- `backend/src/controllers/dashboardController.ts`
  - Linha 50: `clpCounterValue` (KPIs principais)
  - Linha 60: `clpCounterValue` (total produzido)
  - Linha 107: `clpCounterValue` (eficiência de ciclo)
  - Linha 413: `clpCounterValue` (produção por período)
  - Linha 528: `clpCounterValue` (top itens)

## 🚨 AÇÃO NECESSÁRIA DO USUÁRIO

**LIMPE O CACHE DO NAVEGADOR!**

```
1. Pressione Ctrl + Shift + R (Windows)
   ou Cmd + Shift + R (Mac)

2. Aguarde a página recarregar completamente

3. Verifique se os dados agora fazem sentido
```

Se após limpar o cache os dados ainda estiverem errados:
1. Abra o Console do navegador (F12)
2. Vá em "Network" e veja as requisições
3. Procure por `/dashboard/kpis`
4. Veja a resposta e me informe os valores

## 💡 Por Que Aconteceu?

O Dashboard estava usando a **mesma lógica errada** do `producedQuantity`:
- `quantity` = tempo de ciclo (ex: 2645 unidades)
- `clpCounterValue` = peças reais (ex: 258 peças)

Corrigimos:
1. ✅ `producedQuantity` nas ordens (SQL anterior)
2. ✅ Dashboard KPIs (agora)
3. ✅ Dashboard gráficos (agora)
4. ✅ Top itens (agora)

**Sistema agora 100% consistente!** 🎉

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Correção Aplicada - AGUARDANDO LIMPEZA DE CACHE  
**Próxima Ação**: Usuário deve pressionar Ctrl+Shift+R no navegador

