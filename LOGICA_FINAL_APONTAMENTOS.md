# Lógica Final dos Apontamentos - Cavidades Ativas

## ✅ Lógica Correta Implementada

### Quando um ciclo completa:

```typescript
quantity = moldCavities (cavidades ativas)
clpCounterValue = counterValue (valor do contador D33)
```

### Exemplo Prático

**Molde**: Tampa 4 Cavidades
- **Cavidades totais**: 4
- **Cavidades ativas**: 2

**Quando o PLC completa um ciclo:**
1. D33 muda de valor (ex: 3500 → 3700)
2. Data-collector detecta a mudança
3. Registra apontamento:
   - `quantity = 2` (cavidades ativas) → **Coluna "Peças"**
   - `clpCounterValue = 3700` (valor do D33) → **Coluna "Tempo"** ou campo de referência

---

## 📊 O que Você Verá

### Na Tabela de Apontamentos

| Data/Hora | Tempo | Perda | Tipo | **Peças** |
|-----------|-------|-------|------|-----------|
| 22/10/2025, 15:00:00 | 0.4s | 0 | Automático | **2** ✅ |
| 22/10/2025, 14:59:45 | 0.4s | 0 | Automático | **2** ✅ |
| 22/10/2025, 14:59:30 | 2.7s | 0 | Automático | **2** ✅ |

### Nos Logs do Data-Collector

```
🔄 Ciclo completo detectado!
⏱️  D33: 3700 (Δ 200)
🎯 Criando apontamento: OP OP-2025-004
📦 Quantidade: 2 peças | Contador CLP: 3700
✅ Apontamento registrado com sucesso!
```

### No Backend

```
✅ Apontamento automático criado: OP OP-2025-004 +2 peças (Contador CLP: 3700)
```

---

## 🎯 Campos do Banco de Dados

### Tabela `production_appointments`

| Campo | Valor | Significado |
|-------|-------|-------------|
| `quantity` | 2 | Peças produzidas (cavidades ativas) |
| `clpCounterValue` | 3700 | Valor do contador D33 (referência) |
| `automatic` | true | Apontamento automático |
| `timestamp` | 2025-10-22 15:00:00 | Data/hora do ciclo |

---

## 🔍 Como o Sistema Calcula

### 1. Data-Collector pega ordem ativa
```javascript
moldCavities = order.mold.activeCavities || order.mold.cavities
// Resultado: 2 (cavidades ativas)
```

### 2. Detecta ciclo completo
```javascript
D33 mudou: 3500 → 3700
counterValue = 3700
```

### 3. Envia para backend
```javascript
POST /api/data-collector/production-appointment
{
  productionOrderId: 4,
  quantity: 2,              // ← Cavidades ativas
  clpCounterValue: 3700,    // ← Valor do D33
  timestamp: "2025-10-22T15:00:00"
}
```

### 4. Backend salva
```sql
INSERT INTO production_appointments 
  (quantity, clpCounterValue, automatic)
VALUES 
  (2, 3700, true);
  
UPDATE production_orders 
SET producedQuantity = producedQuantity + 2
WHERE id = 4;
```

---

## ✅ Verificação

### Está correto se:
- ✅ Coluna "Peças" mostra **2** (cavidades ativas)
- ✅ Total produzido aumenta de **2 em 2**
- ✅ Logs mostram "📦 Quantidade: 2 peças"

### Está errado se:
- ❌ Coluna "Peças" mostra valores estranhos (32, 27, 4000)
- ❌ Total produzido aumenta irregularmente
- ❌ Logs mostram valores inconsistentes

---

## 🔧 Data-Collector Reiniciado

O data-collector foi reiniciado com a lógica correta:
- **quantity** = cavidades ativas (2 peças)
- **clpCounterValue** = valor do contador D33

---

**Status**: ✅ **PRONTO**

Aguardando próximo ciclo para confirmar!

