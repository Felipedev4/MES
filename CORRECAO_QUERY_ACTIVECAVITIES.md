# ✅ CORREÇÃO APLICADA - Query activeCavities

## 🐛 Problema Identificado

A query do Prisma estava buscando apenas `cavities`, mas NÃO estava buscando `activeCavities`!

### ❌ Query Anterior (ERRADA)
```typescript
mold: {
  select: {
    cavities: true,  // ← Só buscava cavities
  },
}
```

**Resultado:**
```
activeCavities: undefined  ❌
moldCavitiesUsado: 4      (fallback para cavities)
```

---

## ✅ Correção Aplicada

### ✅ Query Nova (CORRETA)
```typescript
mold: {
  select: {
    code: true,
    name: true,
    cavities: true,
    activeCavities: true,  // ← ADICIONADO!
  },
}
```

**Resultado esperado:**
```
activeCavities: 2         ✅
moldCavitiesUsado: 2      ✅
```

---

## 🎯 O que vai acontecer agora

### 1. Backend vai buscar activeCavities
```sql
SELECT 
  id, 
  cavities, 
  activeCavities  ← AGORA VAI BUSCAR!
FROM molds
```

### 2. Debug vai mostrar
```
🔍 DEBUG MOLDE: {
  orderNumber: 'OP-2025-004',
  moldCode: 'MOLD-001',
  moldName: 'Molde Tampa 4 Cavidades',
  totalCavities: 4,
  activeCavities: 2,        ✅
  moldCavitiesUsado: 2      ✅
}
```

### 3. Data-collector vai usar
```
📦 quantity=48 (D33) | clpCounterValue=2 (cavidades) ✅
```

### 4. Banco vai gravar
```sql
INSERT INTO production_appointments (
  quantity,         -- 48 (D33)
  clpCounterValue   -- 2 (activeCavities) ✅
)
```

---

## 📺 Verificação

### Console Backend
Procure por:
```
🔍 DEBUG MOLDE: {
  ...
  activeCavities: 2,         ← Deve ser 2 agora!
  moldCavitiesUsado: 2       ← E aqui também!
}
```

### Console Data-Collector
```
📦 quantity=??? (D33) | clpCounterValue=2 (cavidades) ✅
```

### Tabela production_appointments
```
clpCounterValue = 2  ✅
```

---

## 🎉 Pronto!

Agora o sistema vai:
1. ✅ Buscar `activeCavities` do banco
2. ✅ Usar valor **2** ao invés de 4
3. ✅ Gravar **2** na coluna "Tempo"
4. ✅ Contabilizar corretamente a produção

---

**Arquivo**: `backend/src/controllers/dataCollectorController.ts`  
**Linha**: 233-237  
**Mudança**: Adicionado `activeCavities: true` no select  
**Status**: ✅ Corrigido e serviços reiniciados  

Aguarde o próximo ciclo do PLC para confirmar!

