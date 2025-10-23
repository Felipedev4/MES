# 🚨 CORREÇÃO CRÍTICA: Campo `producedQuantity`

## ⚠️ PROBLEMA IDENTIFICADO

### Divergência Detectada
**Ordem OP-2025-001**:
- ❌ **Card** (injectors/1/orders): **2.645** peças
- ✅ **OrderSummary**: **246** peças

### Causa Raiz

O campo `producedQuantity` da tabela `production_orders` estava sendo incrementado **INCORRETAMENTE**.

#### ❌ ANTES (ERRADO):
```typescript
// backend/src/controllers/dataCollectorController.ts (linha 405)
producedQuantity: {
  increment: parsedQuantity, // ← quantity = TEMPO de ciclo (2645 unidades)
}
```

#### ✅ DEPOIS (CORRETO):
```typescript
// backend/src/controllers/dataCollectorController.ts (linha 411)
const piecesProduced = parsedClpCounterValue || 0;
producedQuantity: {
  increment: piecesProduced, // ← clpCounterValue = PEÇAS reais (246)
}
```

## 📊 Entendendo os Campos

| Campo | Armazena | Exemplo | Uso |
|-------|----------|---------|-----|
| `quantity` | **Tempo de ciclo** (em unidades do PLC) | 2645 | Calcular horas de produção |
| `clpCounterValue` | **Contador de peças** (do PLC) | 246 | Contar peças produzidas |
| `producedQuantity` | **Total de peças** (deve usar `clpCounterValue`) | 246 | Exibir nos cards/resumo |

### Fórmulas Corretas

```typescript
// ✅ CORRETO - Total de peças produzidas
totalProduced = Σ (production_appointments.clpCounterValue)

// ❌ ERRADO - Isso retorna TEMPO, não peças
totalProduced = Σ (production_appointments.quantity)

// ✅ CORRETO - Horas de produção
totalSeconds = Σ (production_appointments.quantity) ÷ timeDivisor
productionHours = totalSeconds ÷ 3600
```

## 🔧 CORREÇÕES APLICADAS

### 1. Backend - Data Collector Controller ✅

**Arquivo**: `backend/src/controllers/dataCollectorController.ts`

**Mudança** (linhas 400-420):
```typescript
// ⚠️ CORREÇÃO CRÍTICA: Usar clpCounterValue (peças) e não quantity (tempo)
const piecesProduced = parsedClpCounterValue || 0;

if (piecesProduced > 0) {
  const updatedOrder = await prisma.productionOrder.update({
    where: { id: parsedOrderId },
    data: {
      producedQuantity: {
        increment: piecesProduced, // ← CORRIGIDO
      },
    },
  });
} else {
  console.warn('clpCounterValue não informado - producedQuantity não atualizado');
}
```

### 2. Backend - Production Service ✅

**Arquivo**: `backend/src/services/productionService.ts`

**Mudança** (linhas 120-138):
```typescript
// ⚠️ CORREÇÃO: Usar counterValue (peças) e não quantity (tempo)
const piecesProduced = counterValue || 0;

const updatedOrder = await prisma.productionOrder.update({
  where: { id: this.activeOrderId },
  data: {
    producedQuantity: {
      increment: piecesProduced, // ← CORRIGIDO
    },
    ...(order.producedQuantity + piecesProduced >= order.plannedQuantity && {
      status: 'FINISHED',
      endDate: new Date(),
    }),
  },
});
```

### 3. WebSocket Event ✅

**Mudança** (linha 147):
```typescript
this.io.emit('production:update', {
  appointment,
  order: updatedOrder,
  increment: piecesProduced, // ← CORRIGIDO
  total: updatedOrder.producedQuantity,
});
```

## 📝 SCRIPT DE CORREÇÃO SQL

### Criado: `CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql`

**Recursos**:
1. ✅ Verificação de divergências ANTES da correção
2. ✅ Verificação específica da OP-2025-001
3. ✅ Script de UPDATE para recalcular `producedQuantity`
4. ✅ Verificação APÓS correção
5. ✅ Estatísticas completas
6. ✅ Detecção de apontamentos sem `clpCounterValue`

### Como Executar

```sql
-- 1. Ver divergências
SELECT ... FROM production_orders ... -- ETAPA 1

-- 2. Aplicar correção (DESCOMENTE)
UPDATE production_orders po
SET "producedQuantity" = COALESCE((
    SELECT SUM("clpCounterValue")
    FROM production_appointments
    WHERE "productionOrderId" = po.id
    AND "clpCounterValue" IS NOT NULL
), 0);

-- 3. Verificar resultado
SELECT ... -- ETAPA 4 e 5
```

## 🎯 IMPACTO DA CORREÇÃO

### Antes da Correção

```
┌─────────────────────────────────────────┐
│ Card (OrderPanel)                       │
│ OP-2025-001                             │
│ Produzido: 2.645 ❌ (quantity)         │
│ Progresso: 264% ❌                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ OrderSummary                            │
│ OP-2025-001                             │
│ Total: 246 ✅ (clpCounterValue)        │
│ Progresso: 24.6% ✅                    │
└─────────────────────────────────────────┘

❌ DIVERGÊNCIA: 2.645 ≠ 246
```

### Depois da Correção

```
┌─────────────────────────────────────────┐
│ Card (OrderPanel)                       │
│ OP-2025-001                             │
│ Produzido: 246 ✅                       │
│ Progresso: 24.6% ✅                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ OrderSummary                            │
│ OP-2025-001                             │
│ Total: 246 ✅                           │
│ Progresso: 24.6% ✅                    │
└─────────────────────────────────────────┘

✅ COMPATIBILIDADE: 246 = 246
```

## ⚠️ CONSIDERAÇÕES IMPORTANTES

### 1. Apontamentos Sem `clpCounterValue`

Alguns apontamentos podem não ter `clpCounterValue`:
- Apontamentos manuais antigos
- Apontamentos de sistemas legados
- Apontamentos com erro de comunicação com PLC

**Solução**: Estes apontamentos **não serão contabilizados** após a correção. Se necessário, pode-se:
- Preencher manualmente com base em cavidades ativas
- Migrar dados históricos
- Aceitar que dados antigos podem estar incompletos

### 2. Compatibilidade com Frontend

✅ **OrderPanel** (cards): Usa `order.producedQuantity` diretamente  
✅ **OrderSummary**: Calcula soma de `clpCounterValue`  

Após a correção e recálculo SQL, **ambos mostrarão o mesmo valor**.

### 3. Novos Apontamentos

✅ A partir de agora, **todos os novos apontamentos** usarão `clpCounterValue`  
✅ O campo `producedQuantity` será **incrementado corretamente**  
✅ Não haverá mais divergências

## 📋 CHECKLIST DE IMPLANTAÇÃO

### Passo 1: Backup ⚠️
```sql
-- Criar backup da tabela production_orders
CREATE TABLE production_orders_backup AS 
SELECT * FROM production_orders;
```

### Passo 2: Verificar Divergências
```sql
-- Executar ETAPA 1 do script
-- Anotar quantas ordens têm divergência
```

### Passo 3: Reiniciar Backend
```powershell
# Parar serviços
.\REINICIAR_BACKEND.ps1
```

### Passo 4: Aplicar Correção SQL
```sql
-- Descomentar e executar ETAPA 3 do script
```

### Passo 5: Verificar Resultado
```sql
-- Executar ETAPAS 4, 5 e 6 do script
-- Confirmar que OP-2025-001 agora mostra 246
```

### Passo 6: Testar Interface
- [ ] Abrir `/injectors/1/orders`
- [ ] Verificar se OP-2025-001 mostra **246**
- [ ] Clicar no card para abrir OrderSummary
- [ ] Confirmar que também mostra **246**
- [ ] Verificar barra de progresso (deve estar ~24.6%)

### Passo 7: Monitorar Novos Apontamentos
- [ ] Fazer um novo apontamento de teste
- [ ] Verificar logs do backend
- [ ] Confirmar que está usando `clpCounterValue`
- [ ] Verificar que `producedQuantity` incrementou corretamente

## 📁 Arquivos Modificados/Criados

### Modificados ✅
- `backend/src/controllers/dataCollectorController.ts`
- `backend/src/services/productionService.ts`

### Criados ✅
- `CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql` - Script de correção SQL
- `INVESTIGAR_DIVERGENCIA_OP-2025-001.sql` - Script de investigação
- `CORRECAO_CRITICA_PRODUCED_QUANTITY.md` - Esta documentação

## 🔍 Validação Final

Execute esta query para confirmar que tudo está OK:

```sql
SELECT 
    po."orderNumber",
    po."producedQuantity" AS "Campo DB",
    COALESCE(SUM(pa."clpCounterValue"), 0) AS "Soma clpCounterValue",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa."clpCounterValue"), 0) 
        THEN '✅ OK' 
        ELSE '❌ DIVERGE' 
    END AS "Status"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED')
GROUP BY po.id, po."orderNumber", po."producedQuantity"
ORDER BY po."orderNumber";
```

**Resultado Esperado**: Todos com status ✅ OK

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Prioridade**: 🔴 CRÍTICA  
**Status**: ✅ Correção Aplicada - Aguardando Execução do Script SQL

