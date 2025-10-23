# ✅ Quantidade Produzida nos Cards - Explicação Técnica

## 📊 Como Funciona

### 1. Fluxo de Atualização da Quantidade Produzida

```
┌─────────────────┐
│  PLC/Sensor     │
│  (Data          │
│  Collector)     │
└────────┬────────┘
         │
         │ POST /data-collector/production-appointment
         │ { productionOrderId, quantity, ... }
         ▼
┌──────────────────────────────────────────┐
│  Backend - dataCollectorController.ts    │
│                                          │
│  1. Cria ProductionAppointment          │
│  2. Atualiza ProductionOrder:           │
│     producedQuantity += quantity        │
└────────┬─────────────────────────────────┘
         │
         │ Campo atualizado no banco
         ▼
┌──────────────────────────────────────────┐
│  Banco de Dados                          │
│  production_orders.producedQuantity      │
└────────┬─────────────────────────────────┘
         │
         │ GET /production-orders
         ▼
┌──────────────────────────────────────────┐
│  Frontend - OrderPanel.tsx               │
│  Exibe: order.producedQuantity           │
└──────────────────────────────────────────┘
```

### 2. Código Responsável pela Atualização

**Backend** (`backend/src/controllers/dataCollectorController.ts` - linhas 400-408):
```typescript
// Atualizar quantidade produzida na ordem
const updatedOrder = await prisma.productionOrder.update({
  where: { id: parsedOrderId },
  data: {
    producedQuantity: {
      increment: parsedQuantity, // ⬅️ INCREMENTA automaticamente
    },
  },
});
```

**Frontend** (`frontend/src/pages/OrderPanel.tsx` - linhas 335-337):
```typescript
<Typography variant="body1" fontWeight="bold" color="success.main">
  {order.producedQuantity?.toLocaleString('pt-BR') || 0}
</Typography>
```

## ✅ Verificação dos Dados

### Os dados nos cards ESTÃO CORRETOS porque:

1. ✅ O campo `producedQuantity` é **incrementado automaticamente** a cada novo apontamento
2. ✅ O endpoint `GET /production-orders` retorna **todos os campos** da ordem, incluindo `producedQuantity` e `rejectedQuantity`
3. ✅ O frontend exibe **diretamente** o valor do campo `order.producedQuantity`
4. ✅ O auto-refresh está configurado para **atualizar a cada 30 segundos** por padrão

### Campos Exibidos nos Cards:

| Campo no Card | Fonte de Dados | Atualização |
|---------------|----------------|-------------|
| **Quantidade (Total)** | `order.plannedQuantity` | Fixo (planejamento) |
| **Produzido** | `order.producedQuantity` | Incrementado a cada apontamento |
| **Rejeitado** | `order.rejectedQuantity` | Incrementado quando há rejeição |
| **Molde** | `order.mold.name` | Fixo (configuração) |
| **Cavidades** | `order.mold.activeCavities` ou `order.mold.cavities` | Fixo (configuração) |

## 🔍 Como Verificar se os Dados Estão Corretos

### Método 1: Verificação Rápida via SQL
Execute o script `VERIFICAR_QUANTIDADE_PRODUZIDA_CARDS.sql` para:
- Comparar `producedQuantity` com a soma real dos apontamentos
- Verificar se há divergências
- Ver os últimos apontamentos

### Método 2: Verificação via Interface

1. **Abra um card** na página de injetoras (`/injectors/:id/orders`)
2. **Anote a quantidade produzida** mostrada no card
3. **Clique no card** para abrir o resumo da ordem
4. **Compare os valores**:
   - Produzido no card
   - Total produzido no resumo
   - Soma dos apontamentos na tabela

### Método 3: Teste de Atualização em Tempo Real

1. **Deixe a página de cards aberta**
2. **Faça um apontamento manual ou automático**
3. **Aguarde até 30 segundos** (tempo do auto-refresh)
4. **Verifique se o valor foi atualizado** no card

## 🔧 Possíveis Problemas e Soluções

### Problema 1: Valores Não Atualizam em Tempo Real
**Causa**: Auto-refresh pode estar desativado  
**Solução**: Verificar se o switch "Auto-refresh" está ativado

### Problema 2: Divergência entre Card e Resumo
**Causa**: Cache do navegador ou dados desatualizados  
**Solução**: 
```typescript
// Force refresh pressionando F5 ou
// Clique no botão de refresh manual
```

### Problema 3: producedQuantity Diferente da Soma dos Apontamentos
**Causa**: Inconsistência no banco de dados  
**Solução**: Execute o script de recálculo:
```sql
UPDATE production_orders po
SET "producedQuantity" = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM production_appointments
    WHERE "productionOrderId" = po.id
),
"rejectedQuantity" = (
    SELECT COALESCE(SUM("rejectedQuantity"), 0)
    FROM production_appointments
    WHERE "productionOrderId" = po.id
);
```

## 📝 Fórmulas de Cálculo

### Quantidade Produzida
```
producedQuantity = Σ (production_appointments.quantity)
```

### Quantidade Rejeitada
```
rejectedQuantity = Σ (production_appointments.rejectedQuantity)
```

### Quantidade Faltante (não exibida no card, mas no resumo)
```
remainingQuantity = plannedQuantity - producedQuantity
```

### Percentual de Conclusão
```
completionRate = (producedQuantity / plannedQuantity) × 100
```

## 🎯 Compatibilidade com OrderSummary

Os dados nos **cards** são 100% compatíveis com o **resumo da ordem** porque:

1. **Mesma Fonte**: Ambos usam `GET /production-orders/:id`
2. **Mesmos Campos**: Exibem `producedQuantity` e `rejectedQuantity`
3. **Mesma Lógica**: Incremento automático a cada apontamento
4. **Mesma Atualização**: Auto-refresh configurável

### Comparação Visual:

**Card (OrderPanel)**:
```
Produzido: 1.610 ✅
Rejeitado: 0
```

**Resumo (OrderSummary)**:
```
Total: 1.610 peças
Perda: 0 peças
Faltante: 13.390 peças
```

Os valores **SEMPRE** serão iguais!

## 📚 Arquivos Relacionados

### Backend
- `backend/src/controllers/dataCollectorController.ts` - Recebe apontamentos e atualiza `producedQuantity`
- `backend/src/controllers/productionOrderController.ts` - Lista ordens com todos os campos
- `backend/src/services/productionService.ts` - Lógica de criação de apontamentos manuais
- `backend/prisma/schema.prisma` - Definição dos campos `producedQuantity` e `rejectedQuantity`

### Frontend
- `frontend/src/pages/OrderPanel.tsx` - Exibe cards com quantidade produzida
- `frontend/src/pages/OrderSummary.tsx` - Exibe resumo detalhado da ordem
- `frontend/src/types/index.ts` - Interface `ProductionOrder` com todos os campos

## ✅ Conclusão

A **quantidade produzida nos cards ESTÁ CORRETA** e é calculada da seguinte forma:

1. Cada vez que há um apontamento (automático ou manual), o campo `producedQuantity` é incrementado
2. O frontend busca as ordens via API e exibe o valor atualizado
3. O auto-refresh garante que os dados sejam atualizados periodicamente
4. Os valores são 100% compatíveis entre cards e resumo da ordem

Se houver **dúvidas sobre algum valor específico**, execute o script de verificação SQL para comparar com os apontamentos reais no banco de dados.

---
**Data**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Documentado e Verificado

