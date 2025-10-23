# 🔧 CORREÇÃO: Campo `quantity` em `production_appointments`

## ❌ PROBLEMA ANTERIOR

O sistema estava salvando o **número de cavidades do molde** no campo `quantity`:

```typescript
// ❌ ERRADO
const piecesProduced = moldCavities; // 2 cavidades
await recordProduction(orderId, piecesProduced, ...); // quantity = 2
```

**Resultado:**
- `production_appointments.quantity = 2` (cavidades do molde)
- Valor do D33 (70, 110, etc) era ignorado

---

## ✅ SOLUÇÃO IMPLEMENTADA

Agora o sistema salva **o valor coletado do registro D33** no campo `quantity`:

```typescript
// ✅ CORRETO
const quantityFromD33 = currentValue; // 70, 110, etc (valor do D33)
await recordProduction(orderId, quantityFromD33, ...); // quantity = valor D33
```

**Resultado:**
- `production_appointments.quantity = 70` (valor do D33)
- Cada apontamento registra o tempo de ciclo real

---

## 📋 MUDANÇAS NO CÓDIGO

### **Arquivo:** `data-collector/src/services/PlcConnection.ts`

**Linhas 231-246:**

```typescript
// quantity = Valor D33 | clpCounterValue = Cavidades do molde
const moldCavities = orderForThisPlc.moldCavities || 1; // Default: 1 cavidade
const quantityFromD33 = currentValue; // Valor coletado do D33

// Logar informações do ciclo
logger.info(`🔄 Ciclo completo detectado!`);
logger.info(`⏱️  ${register.registerName}: ${currentValue}ms (Δ ${Math.abs(change)}ms)`);
logger.info(`🎯 Criando apontamento: OP ${orderForThisPlc.orderNumber}`);
logger.info(`📦 quantity=${quantityFromD33} (D33) | clpCounterValue=${moldCavities} (cavidades)`);

const success = await this.productionMonitor.recordProduction(
  orderForThisPlc.id,
  quantityFromD33, // ✅ quantity = valor do D33
  undefined, // plcDataId
  moldCavities // ✅ clpCounterValue = cavidades do molde
);
```

---

## 🧪 COMO TESTAR

### 1. **Altere o valor do D33 no CLP Simulator:**
```
Valor atual: 0
Novo valor: 75
```

### 2. **Verifique os logs do Data Collector:**
```
🔄 Ciclo completo detectado!
⏱️  D33: 75ms (Δ 75ms)
🎯 Criando apontamento: OP OP-2025-002
📦 Quantity = Valor D33: 75 | Molde: 2 cavidades
✅ Apontamento registrado com sucesso!
```

### 3. **Consulte o banco de dados:**
```sql
SELECT id, quantity, "clpCounterValue", timestamp 
FROM production_appointments 
ORDER BY id DESC 
LIMIT 5;
```

**Resultado esperado:**
```
 id | quantity | clpCounterValue |      timestamp
----+----------+-----------------+-------------------
  X |   75     |        2        | 2025-10-22 ...
```

---

## 📊 ESTRUTURA DA TABELA `production_appointments`

| Campo | Tipo | Descrição | Valor Exemplo |
|-------|------|-----------|---------------|
| `id` | `INT` | ID do apontamento | `123` |
| `productionOrderId` | `INT` | ID da ordem de produção | `2` |
| **`quantity`** | `INT` | **Valor do D33** | **`75`** |
| `clpCounterValue` | `INT` | Cavidades do molde | `2` |
| `automatic` | `BOOLEAN` | Apontamento automático | `true` |
| `timestamp` | `TIMESTAMP` | Data/hora do registro | `2025-10-22 14:30:00` |

---

## 🎯 FLUXO COMPLETO

```
┌─────────────────┐
│ CLP: D33 = 0    │
└────────┬────────┘
         │ Muda para 75ms
         ▼
┌───────────────────────────────┐
│ Data Collector                │
│ - Detecta mudança em D33      │
│ - currentValue = 75 (D33)     │
│ - moldCavities = 2            │
└────────┬──────────────────────┘
         │ Envia apontamento
         ▼
┌───────────────────────────────┐
│ Backend API                   │
│ - Recebe dados do ciclo       │
│ - Salva em production_        │
│   appointments:               │
│   • quantity = 75 (D33)       │
│   • clpCounterValue = 2       │
└───────────────────────────────┘
```

---

## ⚙️ STATUS DOS SERVIÇOS

| Serviço | Status | Porta | Verificado em |
|---------|--------|-------|---------------|
| Backend | ✅ Rodando | 3001 | 22/10/2025 |
| Data Collector | ✅ Rodando | 3002 | 22/10/2025 |
| PostgreSQL | ✅ Ativo | 5432 | - |
| registerPurpose | ✅ CYCLE_TIME | - | ✅ Confirmado |

---

## 📝 NOTAS IMPORTANTES

1. **Campo `quantity`:**
   - Antes: Número de cavidades do molde (2, 4, 8, etc)
   - Agora: Valor do registro D33 (70, 110, 150, etc)

2. **Campo `clpCounterValue`:**
   - Armazena o número de cavidades do molde (2, 4, 8, etc)
   - Útil para calcular produtividade e eficiência

3. **Detectação de ciclo:**
   - Qualquer mudança no valor de D33 = 1 ciclo completo
   - Não importa se o valor aumenta ou diminui

4. **Valor zero:**
   - D33 = 0 é válido
   - Mudança de 0 → N ou N → 0 ambas criam apontamentos

5. **Cálculo de peças produzidas:**
   - Cada registro = 1 ciclo
   - Peças no ciclo = `clpCounterValue` (cavidades)
   - Total de peças = soma de todos os `clpCounterValue`

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **Altere D33 no CLP Simulator** e observe os apontamentos serem criados
2. ✅ **Verifique no frontend** se a quantidade produzida está aumentando
3. ✅ **Consulte o banco** para confirmar os valores corretos

---

**Data da correção:** 22/10/2025  
**Serviços reiniciados:** ✅ Sim  
**Sistema operacional:** ✅ Funcionando corretamente

