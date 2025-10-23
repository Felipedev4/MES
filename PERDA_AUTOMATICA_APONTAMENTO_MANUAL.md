# ✅ Registro Automático de Perda - Apontamento Manual

## 🎯 Objetivo

Quando registrar um apontamento manual com **quantidade rejeitada**, o sistema agora cria automaticamente um registro de perda (defeito) que aparece na tela **"Apontamento de Perda"**.

---

## 🔄 Fluxo Implementado

### 1️⃣ Usuário Registra Apontamento Manual

```
Tela: Apontamento Manual
┌─────────────────────────────────────────┐
│ Ordem: OP-2025-001                      │
│ Início: 23/10/2025 13:00                │
│ Fim: 23/10/2025 13:48                   │
│ Quantidade Produzida: 500 peças         │
│ Quantidade Rejeitada: 39 peças ⭐       │
│ Observações: Produção normal            │
│                                         │
│ [Registrar Apontamento] 🟢             │
└─────────────────────────────────────────┘
```

### 2️⃣ Backend Processa Automaticamente

```typescript
// 1. Criar apontamento
productionAppointment.create({
  quantity: 500,
  rejectedQuantity: 39, // ⭐
  ...
})

// 2. Atualizar ordem
productionOrder.update({
  producedQuantity: +500,
  rejectedQuantity: +39,
})

// 3. SE rejectedQuantity > 0 ⭐
if (rejectedQuantity > 0) {
  // Criar registro de defeito AUTOMATICAMENTE
  productionDefect.create({
    defectId: 13, // "Perda de Apontamento Manual"
    quantity: 39,
    notes: "Apontamento Manual - Produção normal"
  })
}
```

### 3️⃣ Resultado na Tela de Perdas

```
Tela: Apontamento de Perda
┌──────────────────────────────────────────────────────┐
│ Perdas Registradas 🔴 1                              │
├──────────────┬────────────────────┬──────┬───────────┤
│ Data/Hora    │ Defeito            │ Qtd. │ Obs.      │
├──────────────┼────────────────────┼──────┼───────────┤
│ 23/10 13:48  │ Perda de Ap. Manual│ 39   │ Produção  │ ⭐ AUTOMÁTICO
└──────────────┴────────────────────┴──────┴───────────┘
```

---

## 🗂️ Estrutura de Dados

### Defeito Padrão Criado

| Campo | Valor |
|-------|-------|
| **ID** | 13 |
| **Code** | MANUAL |
| **Name** | Perda de Apontamento Manual |
| **Description** | Peças rejeitadas registradas em apontamento manual de produção |
| **Severity** | LOW |
| **Active** | true |

### Registro de Perda Automático

Quando `rejectedQuantity > 0` no apontamento manual, cria:

```json
{
  "productionDefectId": 1,
  "productionOrderId": 1,
  "defectId": 13,
  "quantity": 39,
  "timestamp": "2025-10-23T13:48:00.000Z",
  "notes": "Apontamento Manual - Produção normal"
}
```

---

## 📁 Arquivos Modificados

### Backend

**1. `backend/prisma/schema.prisma`**
- ✅ Modelo `Defect` com campo `code` único

**2. `backend/src/services/productionService.ts`**
```typescript
// ANTES:
const appointment = await prisma.productionAppointment.create({...});
const updatedOrder = await prisma.productionOrder.update({...});
return { appointment, order: updatedOrder };

// DEPOIS (com transação):
const result = await prisma.$transaction(async (tx) => {
  // Criar apontamento
  const appointment = await tx.productionAppointment.create({...});
  
  // Atualizar ordem
  const updatedOrder = await tx.productionOrder.update({...});
  
  // ⭐ NOVO: Criar registro de perda se houver quantidade rejeitada
  let productionDefect = null;
  if (rejectedQuantity > 0) {
    const defaultDefect = await tx.defect.findUnique({
      where: { code: 'MANUAL' },
    });
    
    if (defaultDefect) {
      productionDefect = await tx.productionDefect.create({
        data: {
          productionOrderId,
          defectId: defaultDefect.id,
          quantity: rejectedQuantity,
          notes: notes ? `Apontamento Manual - ${notes}` : 'Apontamento Manual',
        },
      });
    }
  }
  
  return { appointment, order: updatedOrder, productionDefect };
});
```

### Banco de Dados

**3. Defeito Padrão**
```sql
INSERT INTO defects (code, name, description, severity, active)
VALUES (
  'MANUAL',
  'Perda de Apontamento Manual',
  'Peças rejeitadas registradas em apontamento manual de produção',
  'LOW',
  true
);
```

---

## ✅ Benefícios

### 1. **Rastreabilidade Completa** 📊
- Todas as perdas são registradas
- Histórico completo na tela de perdas
- Dados consistentes entre apontamento e perda

### 2. **Automático e Simples** 🤖
- Usuário não precisa fazer dois cadastros
- Registro de perda criado automaticamente
- Menos chance de erro humano

### 3. **Transação Atômica** 🔒
- Tudo ou nada (rollback em caso de erro)
- Dados sempre consistentes
- Segurança garantida

### 4. **Observações Integradas** 📝
- Observações do apontamento vão para a perda
- Contexto preservado
- Rastreamento facilitado

---

## 🎨 Exemplo Completo

### Cenário: Produção com 39 Peças Rejeitadas

#### 1️⃣ Apontamento Manual Registrado

```json
{
  "orderId": 1,
  "startTime": "2025-10-23T13:00:00",
  "endTime": "2025-10-23T13:48:00",
  "quantity": 500,
  "rejectedQuantity": 39,
  "notes": "Problema no molde cavidade 3"
}
```

#### 2️⃣ Registros Criados Automaticamente

**ProductionAppointment:**
```json
{
  "id": 5,
  "productionOrderId": 1,
  "quantity": 500,
  "rejectedQuantity": 39,
  "startTime": "2025-10-23T13:00:00",
  "endTime": "2025-10-23T13:48:00",
  "durationSeconds": 2880,
  "automatic": false
}
```

**ProductionOrder (atualizado):**
```json
{
  "id": 1,
  "producedQuantity": 568,  // +500
  "rejectedQuantity": 94    // +39 (já tinha 55)
}
```

**ProductionDefect (⭐ AUTOMÁTICO):**
```json
{
  "id": 1,
  "productionOrderId": 1,
  "defectId": 13,
  "quantity": 39,
  "timestamp": "2025-10-23T13:48:00",
  "notes": "Apontamento Manual - Problema no molde cavidade 3"
}
```

#### 3️⃣ Visualização na Tela de Perdas

```
┌────────────────────────────────────────────────────────────┐
│ 🔴 Apontamento de Perda                                    │
├────────────────────────────────────────────────────────────┤
│ Ordem: OP-2025-001 - Balde 10L Azul                       │
│                                                            │
│ Informações da Ordem:                                      │
│ • Item: Balde 10L Azul                                    │
│ • Produzido: 568 / 15000                                  │
│ • Rejeitado: 94 ⭐                                         │
│                                                            │
│ ───────────────────────────────────────────────────────── │
│                                                            │
│ Perdas Registradas 🔴 1                                    │
├──────────────┬────────────────────┬──────┬────────────────┤
│ Data/Hora    │ Defeito            │ Qtd. │ Observações    │
├──────────────┼────────────────────┼──────┼────────────────┤
│ 23/10 13:48  │ Perda de Ap.Manual │ 39   │ Problema no    │
│              │ Variação: baixa    │      │ molde cav. 3   │
└──────────────┴────────────────────┴──────┴────────────────┘
```

---

## 🔍 Como Verificar

### 1. No Backend (Logs)
```
✅ Registro de perda criado automaticamente: 39 peças rejeitadas (Defeito ID: 13)
```

### 2. No Banco de Dados
```sql
-- Ver último defeito de produção criado
SELECT 
  pd.id,
  pd.quantity,
  pd.timestamp,
  d.name AS defeito,
  po.orderNumber
FROM production_defects pd
JOIN defects d ON pd.defectId = d.id
JOIN production_orders po ON pd.productionOrderId = po.id
WHERE d.code = 'MANUAL'
ORDER BY pd.id DESC
LIMIT 1;
```

### 3. Na Tela de Perdas
1. Acesse a ordem de produção
2. Clique em **"Apontamento de Perda"** (card Perda)
3. Veja a lista **"Perdas Registradas"**
4. ✅ A perda do apontamento manual está lá!

---

## 📊 Comparação

### ❌ ANTES (Manual)

```
Usuário faz 2 ações:

1. Registrar Apontamento Manual
   → 500 peças produzidas
   → 39 peças rejeitadas

2. Ir em "Apontamento de Perda"
   → Selecionar ordem
   → Selecionar defeito
   → Informar 39 peças
   → Gravar

PROBLEMA: Duplicação de trabalho, chance de esquecer
```

### ✅ DEPOIS (Automático)

```
Usuário faz 1 ação:

1. Registrar Apontamento Manual
   → 500 peças produzidas
   → 39 peças rejeitadas

Sistema automaticamente:
   ✅ Cria apontamento
   ✅ Atualiza ordem
   ✅ Registra perda ⭐

BENEFÍCIO: Automático, rápido, sem esquecer
```

---

## ⚙️ Configuração

### Defeito Padrão

Para verificar se o defeito padrão existe:

```sql
SELECT * FROM defects WHERE code = 'MANUAL';
```

Para recriar se necessário:

```sql
INSERT INTO defects (code, name, description, severity, active, "createdAt", "updatedAt")
VALUES (
  'MANUAL',
  'Perda de Apontamento Manual',
  'Peças rejeitadas registradas em apontamento manual de produção',
  'LOW',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO UPDATE SET
  active = true,
  "updatedAt" = NOW();
```

---

## 🧪 Como Testar

### 1. Criar Apontamento Manual com Perda

1. Acesse **"Apontamento Manual"**
2. Selecione uma ordem ACTIVE
3. Preencha:
   - Início: hoje, 14:00
   - Fim: hoje, 14:30
   - Peças: 100
   - **Rejeitadas: 10** ⭐
4. Clique em **"Registrar Apontamento"**

### 2. Verificar Registro de Perda

1. Vá para a mesma ordem de produção
2. Clique no card **"Perda"**
3. Veja na lista **"Perdas Registradas"**
4. ✅ Deve aparecer:
   - Defeito: "Perda de Apontamento Manual"
   - Qtd: 10
   - Timestamp: hoje, 14:30

---

## ✅ Status

**IMPLEMENTADO E TESTADO**

- ✅ Defeito padrão criado no banco
- ✅ Backend modificado (transação atômica)
- ✅ Registro automático de perda
- ✅ Logs informativos
- ✅ Sem erros de lint
- ✅ Compatibilidade total preservada

---

**Data da Implementação**: 23/10/2025  
**Desenvolvido por**: AI Assistant  
**Versão**: 1.0

