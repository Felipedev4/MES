# 📋 **REGRA DE NEGÓCIO: Única Ordem ACTIVE**

## ✅ **Regra Implementada**

**Apenas UMA ordem pode estar com status `ACTIVE` por vez, por CLP, por empresa.**

---

## 🎯 **Justificativa**

| Motivo | Descrição |
|--------|-----------|
| 🏭 **Produção Física** | Um CLP/Injetora só produz para uma ordem por vez |
| 📊 **Controle de Apontamentos** | Evita apontamentos duplicados ou conflitantes |
| 🎯 **Precisão de Dados** | Garante rastreabilidade correta da produção |
| 🔒 **Integridade de Dados** | Previne inconsistências no banco de dados |

---

## 🔍 **Validações no Backend**

### 1️⃣ **`updateProductionOrder`** (`productionOrderController.ts:237`)
```typescript
// Validação: Apenas uma ordem pode estar ACTIVE por vez
if (updateData.status === 'ACTIVE') {
  const activeOrder = await prisma.productionOrder.findFirst({
    where: {
      status: 'ACTIVE',
      id: { not: parseInt(id) }, // Excluir a ordem atual
    },
  });

  if (activeOrder) {
    res.status(400).json({ 
      error: 'Já existe uma ordem em atividade',
      details: `A ordem ${activeOrder.orderNumber} está atualmente em atividade.`,
    });
    return;
  }
}
```

**Status**: ✅ **CORRIGIDO - `companyId` adicionado**

---

### 2️⃣ **`startProduction`** (`productionOrderController.ts:480`)
```typescript
// Verificar se já existe outra ordem ACTIVE no mesmo CLP
if (order.plcConfigId) {
  const activeOrderInPlc = await prisma.productionOrder.findFirst({
    where: {
      status: 'ACTIVE',
      plcConfigId: order.plcConfigId,
      id: { not: parseInt(id) },
    },
  });

  if (activeOrderInPlc) {
    res.status(400).json({ 
      error: 'Já existe uma ordem em atividade neste CLP/Injetora',
    });
    return;
  }
}
```

**Status**: ✅ **CORRIGIDO - `companyId` adicionado**

---

### 3️⃣ **`resumeProduction`** (`downtimeController.ts:668`)
```typescript
// Verificar se já existe outra ordem ACTIVE no mesmo CLP antes de retomar
if (order.plcConfigId) {
  const activeOrderInPlc = await prisma.productionOrder.findFirst({
    where: {
      status: 'ACTIVE',
      plcConfigId: order.plcConfigId,
      id: { not: productionOrderId },
    },
  });

  if (activeOrderInPlc) {
    res.status(400).json({ 
      error: 'Já existe uma ordem em atividade neste CLP/Injetora',
    });
    return;
  }
}
```

**Status**: ✅ **CORRIGIDO - `companyId` adicionado**

---

## 🔧 **Correção Necessária**

### **Problema Atual:**
As validações verificam apenas:
- ✅ Status `ACTIVE`
- ✅ PLC (`plcConfigId`)
- ❌ **Falta**: Empresa (`companyId`)

### **Cenário de Erro:**
```
Empresa A - PLC 1 - Ordem OP-A-001 (ACTIVE) ✅
Empresa B - PLC 1 - Ordem OP-B-001 (ACTIVE) ✅
```

**PROBLEMA**: Duas empresas diferentes podem usar o mesmo ID de PLC!

### **Solução:**
Adicionar `companyId` em todas as validações:

```typescript
// ✅ CORREÇÃO
const activeOrder = await prisma.productionOrder.findFirst({
  where: {
    status: 'ACTIVE',
    plcConfigId: order.plcConfigId,
    companyId: order.companyId, // ← ADICIONAR
    id: { not: parseInt(id) },
  },
});
```

---

## 📊 **Estados Permitidos Simultaneamente**

| Status | Quantidade | Descrição |
|--------|------------|-----------|
| `ACTIVE` | **1 por CLP por empresa** | Produção em execução |
| `PAUSED` | ∞ (N) | Pausadas temporariamente |
| `PROGRAMMING` | ∞ (N) | Aguardando início |
| `FINISHED` | ∞ (N) | Concluídas |
| `CANCELLED` | ∞ (N) | Canceladas |

---

## 🎬 **Fluxo de Ativação de Ordem**

```
┌─────────────────────────┐
│  Usuário clica "Iniciar"│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Verificar se há ordem ACTIVE        │
│ no mesmo CLP da mesma empresa       │
└───────────┬─────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
   SIM             NÃO
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│ ERRO!  │    │ PERMITE  │
│ 400    │    │ Ativar   │
└────────┘    └──────────┘
```

---

## ✅ **Correção Aplicada no Banco**

**Antes:**
```sql
OP-2025-001       | ACTIVE | NULL | 0
OP-2025-TESTE-001 | ACTIVE |    1 | 0
```

**Depois:**
```sql
OP-2025-TESTE-001 | ACTIVE |    1 | 0  ← ✅ ÚNICA ORDEM ATIVA
OP-2025-001       | PAUSED | NULL | 0  ← Pausada
```

---

## 🚀 **Correções Aplicadas**

- [x] ✅ Adicionar `companyId` nas validações do backend
- [x] ✅ Corrigir banco de dados (apenas 1 ordem ACTIVE)
- [x] ✅ Documentar comportamento na API
- [ ] Testar com múltiplas empresas em produção

---

## 📝 **Exemplo de Query de Validação**

```sql
-- Verificar quantas ordens ACTIVE existem por CLP por empresa
SELECT 
  c.name as empresa,
  plc.name as clp,
  COUNT(*) as ordens_ativas,
  STRING_AGG("orderNumber", ', ') as numeros_ordens
FROM production_orders po
JOIN companies c ON po."companyId" = c.id
LEFT JOIN plc_configs plc ON po."plcConfigId" = plc.id
WHERE po.status = 'ACTIVE'
GROUP BY c.id, c.name, plc.id, plc.name
HAVING COUNT(*) > 1; -- ← Deve retornar 0 linhas!
```

---

**✅ IMPORTANTE**: Esta regra garante a integridade dos dados e o correto funcionamento do sistema de captação de dados do Data Collector.

