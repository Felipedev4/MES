# Correção: Gravação de Apontamento não Funcionando

## 🔴 Problema Reportado

Gravação de apontamento não estava mais funcionando.

## 🔍 Investigação

### Análise do Código

Foram verificados:
1. ✅ Controllers de apontamento (backend)
2. ✅ Service de produção (backend)
3. ✅ Schema do Prisma
4. ✅ Rotas do backend
5. ✅ Chamadas do frontend

### Problema Encontrado

**Endpoint incorreto em `ProductionPosting.tsx`**

#### ❌ Código Incorreto:
```typescript
// frontend/src/pages/ProductionPosting.tsx:131
await api.post('/production', {
  productionOrderId: manualPosting.orderId,
  producedQuantity: manualPosting.producedQuantity,
  rejectedQuantity: manualPosting.rejectedQuantity,
});
```

**Problemas:**
1. ❌ Endpoint `/production` não existe nas rotas
2. ❌ Campo `producedQuantity` deveria ser `quantity`
3. ❌ O endpoint correto é `/production/appointments`

#### ✅ Código Corrigido:
```typescript
// frontend/src/pages/ProductionPosting.tsx:131
await api.post('/production/appointments', {
  productionOrderId: manualPosting.orderId,
  quantity: manualPosting.producedQuantity,
  rejectedQuantity: manualPosting.rejectedQuantity,
});
```

## 📝 Endpoints Corretos de Apontamento

### Backend Routes (`/api/production`)

```typescript
// backend/src/routes/productionRoutes.ts

POST /production/appointments         // Criar apontamento manual
POST /production/active-order          // Definir ordem ativa (apontamento automático)
DELETE /production/active-order        // Parar apontamento automático
GET /production/active-order           // Obter ordem ativa
GET /production/stats                  // Estatísticas de produção
GET /production/plc/status             // Status do CLP
GET /production/plc/read               // Ler registro do CLP
POST /production/plc/reset             // Resetar contador do CLP
```

### Data Collector Routes (`/api/data-collector`)

```typescript
// backend/src/routes/dataCollectorRoutes.ts

POST /data-collector/appointment       // Receber apontamento do data-collector
```

## 📊 Estrutura de Dados do Apontamento

### Request Body Correto:
```typescript
{
  productionOrderId: number;  // ID da ordem de produção
  quantity: number;            // Quantidade produzida (campo correto!)
  rejectedQuantity?: number;   // Quantidade rejeitada (opcional)
  notes?: string;              // Observações (opcional)
}
```

### Response:
```typescript
{
  appointment: {
    id: number;
    productionOrderId: number;
    userId: number;
    quantity: number;
    rejectedQuantity: number;
    automatic: boolean;
    clpCounterValue: number | null;
    notes: string | null;
    timestamp: Date;
    createdAt: Date;
  },
  order: {
    // ... dados atualizados da ordem
    producedQuantity: number;  // Incrementado
    rejectedQuantity: number;  // Incrementado
  }
}
```

## 🎯 Páginas que Criam Apontamentos

### 1. **Production.tsx** ✅ Correto
```typescript
await api.post('/production/appointments', {
  productionOrderId: selectedOrderId,
  quantity: manualQuantity,
  rejectedQuantity: manualRejected,
});
```

### 2. **ProductionPosting.tsx** ✅ Corrigido
```typescript
await api.post('/production/appointments', {
  productionOrderId: manualPosting.orderId,
  quantity: manualPosting.producedQuantity,
  rejectedQuantity: manualPosting.rejectedQuantity,
});
```

### 3. **Data Collector** (automático) ✅ Correto
```typescript
await api.post('/data-collector/appointment', {
  productionOrderId,
  quantity,
  timestamp,
  clpCounterValue,
});
```

## 🔧 Controller Backend

### `productionController.ts` - createAppointment

```typescript
export async function createAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productionOrderId, quantity, rejectedQuantity = 0, notes } = req.body;
    const userId = req.userId!;

    const result = await productionService.createManualAppointment(
      productionOrderId,
      userId,
      quantity,
      rejectedQuantity,
      notes
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao criar apontamento:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar apontamento' });
  }
}
```

### Validações Importantes:

1. ✅ `productionOrderId` deve existir
2. ✅ `quantity` deve ser > 0
3. ✅ `userId` vem do token JWT (autenticação)
4. ✅ Ordem é atualizada automaticamente:
   - `producedQuantity` incrementado
   - `rejectedQuantity` incrementado
   - Status muda para `FINISHED` se atingir meta

## 🔐 Autenticação

**Importante:** Todas as rotas de `/production/*` requerem autenticação:

```typescript
router.use(authenticateToken);
```

O `userId` é extraído do token JWT automaticamente pelo middleware.

## 📱 Frontend - Boas Práticas

### ✅ Fazer:
```typescript
// Usar o campo 'quantity' (não 'producedQuantity')
await api.post('/production/appointments', {
  productionOrderId: order.id,
  quantity: 10,
  rejectedQuantity: 2,
  notes: 'Opcional'
});
```

### ❌ Evitar:
```typescript
// Endpoint errado
await api.post('/production', { ... });

// Campo errado
await api.post('/production/appointments', {
  producedQuantity: 10  // ❌ Deve ser 'quantity'
});
```

## 🚀 WebSocket Events

Após criar apontamento, o backend emite evento:

```typescript
io.emit('production:update', {
  appointment: { ... },
  order: { ... },
  increment: quantity,
  total: updatedOrder.producedQuantity,
});
```

Isso atualiza o dashboard em tempo real automaticamente.

## 🧪 Testando Apontamentos

### Via Frontend:

1. Acesse página "Produção" (`/production`)
2. Selecione uma ordem
3. Digite quantidade
4. Clique em "Apontar"

### Via API (Postman/curl):

```bash
POST http://localhost:3001/api/production/appointments
Headers:
  Authorization: Bearer {seu_token_jwt}
  Content-Type: application/json

Body:
{
  "productionOrderId": 1,
  "quantity": 10,
  "rejectedQuantity": 1,
  "notes": "Teste de apontamento"
}
```

## ✅ Correção Aplicada

- ✅ Endpoint corrigido em `ProductionPosting.tsx`
- ✅ Campo `producedQuantity` renomeado para `quantity`
- ✅ Apontamentos devem funcionar normalmente agora

## 📅 Data da Correção

22 de Outubro de 2025

## 📁 Arquivo Modificado

- `frontend/src/pages/ProductionPosting.tsx`

---

**Teste:** Após essa correção, tente criar um apontamento manual e verifique se funciona corretamente!

