# 🚨 AÇÃO IMEDIATA NECESSÁRIA

## Problema Identificado

**OP-2025-001** e possivelmente **outras ordens** têm divergência nos valores:
- Card mostra: **2.645** peças ❌
- OrderSummary mostra: **246** peças ✅

## Causa

O backend estava incrementando `producedQuantity` com `quantity` (tempo de ciclo) em vez de `clpCounterValue` (contador de peças).

## O Que Foi Feito

### ✅ 1. Backend Corrigido
- `backend/src/controllers/dataCollectorController.ts` - Agora usa `clpCounterValue`
- `backend/src/services/productionService.ts` - Agora usa `counterValue`

### ✅ 2. Scripts SQL Criados
- `CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql` - Corrige dados históricos
- `INVESTIGAR_DIVERGENCIA_OP-2025-001.sql` - Investiga problemas

### ✅ 3. Documentação Completa
- `CORRECAO_CRITICA_PRODUCED_QUANTITY.md` - Explicação detalhada

## 🔧 O Que VOCÊ Precisa Fazer AGORA

### Passo 1: Reiniciar Backend ⚡

```powershell
cd C:\Empresas\Desenvolvimento\MES
.\REINICIAR_BACKEND.ps1
```

Isso aplicará as correções de código.

### Passo 2: Executar Script SQL 🗄️

**Opção A - Completo** (Recomendado):
```powershell
# Abrir pgAdmin ou psql
# Abrir arquivo: CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql
# Executar TODAS as etapas em ordem
```

**Opção B - Rápido** (Apenas correção):
```sql
-- Conectar ao banco de dados
-- Executar este comando:

UPDATE production_orders po
SET "producedQuantity" = COALESCE((
    SELECT SUM("clpCounterValue")
    FROM production_appointments
    WHERE "productionOrderId" = po.id
    AND "clpCounterValue" IS NOT NULL
), 0),
"updatedAt" = NOW();
```

### Passo 3: Verificar Resultado ✅

```sql
-- Ver resultado da OP-2025-001
SELECT 
    "orderNumber",
    "producedQuantity" AS "Deve ser 246",
    (SELECT SUM("clpCounterValue") FROM production_appointments 
     WHERE "productionOrderId" = production_orders.id) AS "Soma Real"
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';
```

**Resultado Esperado**: Ambos devem mostrar **246**

### Passo 4: Atualizar Interface 🔄

```
1. Abrir: http://localhost:3000/injectors/1/orders
2. Atualizar página (F5)
3. Verificar se OP-2025-001 agora mostra 246
4. Clicar no card
5. Confirmar que OrderSummary também mostra 246
```

## ⏱️ Tempo Estimado

- ⚡ Reiniciar backend: **30 segundos**
- 🗄️ Executar SQL: **5 segundos**
- ✅ Verificar: **2 minutos**

**TOTAL: ~3 minutos**

## 🎯 Resultado Final

Após executar os passos acima:

### ANTES:
```
Card:         2.645 ❌
OrderSummary:   246 ✅
Status:       DIVERGENTE ❌
```

### DEPOIS:
```
Card:         246 ✅
OrderSummary: 246 ✅
Status:       CORRETO ✅
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique logs do backend** durante o próximo apontamento
2. **Execute** `INVESTIGAR_DIVERGENCIA_OP-2025-001.sql`
3. **Compare** os resultados com a documentação

## 🔐 Backup (Opcional mas Recomendado)

Antes de executar o UPDATE:

```sql
-- Criar backup da tabela
CREATE TABLE production_orders_backup AS 
SELECT * FROM production_orders;

-- Se algo der errado, restaurar:
-- UPDATE production_orders SET "producedQuantity" = 
--   (SELECT "producedQuantity" FROM production_orders_backup 
--    WHERE production_orders_backup.id = production_orders.id);
```

## 📋 Checklist

- [ ] Backend reiniciado
- [ ] Script SQL executado
- [ ] OP-2025-001 mostra 246 no card
- [ ] OP-2025-001 mostra 246 no resumo
- [ ] Barra de progresso mostra ~24.6%
- [ ] Novo apontamento de teste funciona corretamente

---
**Prioridade**: 🔴 ALTA  
**Tempo**: 3 minutos  
**Impacto**: Corrige dados de TODAS as ordens  
**Data**: 23/10/2025

