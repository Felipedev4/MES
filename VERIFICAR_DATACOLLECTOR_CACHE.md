# 🔧 CORRIGIR: Data-Collector enviando cavidades erradas

## 🐛 PROBLEMA

O data-collector está enviando `clpCounterValue = 3` mas o molde tem `4 cavidades`.

Isso acontece porque o data-collector faz cache das informações da ordem quando ela fica ativa.

---

## ✅ SOLUÇÃO IMEDIATA

### 1. Corrigir os dados existentes

Execute o SQL:
```bash
psql -U postgres -d mes_production -f CORRIGIR_CLPCOUNTERVALUE_OP001.sql
```

Este script vai:
- ✅ Fazer backup da tabela
- ✅ Atualizar `clpCounterValue` de 3 para 4 em todos os apontamentos
- ✅ Recalcular o `producedQuantity` da ordem
- ✅ Mostrar o antes e depois

**Resultado esperado:**
- 219 apontamentos × 4 cavidades = **876 peças** ✅

---

### 2. Reiniciar o Data-Collector

O data-collector faz cache das ordens ativas. Para ele pegar as informações atualizadas:

```powershell
# Parar o data-collector
# (Ctrl+C se estiver rodando no terminal)

# OU usar o script
.\REINICIAR_DATA_COLLECTOR.ps1
```

Quando ele reiniciar, vai buscar as informações atualizadas do molde.

---

## 🔍 POR QUE ACONTECEU?

### Cache do ProductionMonitor

O data-collector carrega as ordens ativas a cada 10 segundos:

```typescript
// ProductionMonitor.ts - linha 34
this.checkInterval = setInterval(async () => {
  await this.loadActiveOrders();
}, 10000); // 10 segundos
```

Quando uma ordem fica ativa, ele busca:
```typescript
const moldCavities = orderForThisPlc.moldCavities || 1;
```

**Se o molde foi atualizado depois que a ordem já estava ativa**, o data-collector continua usando o valor antigo até ser reiniciado.

---

## 🎯 VERIFICAR SE ESTÁ CORRIGIDO

Após executar o SQL e reiniciar o data-collector:

1. **Aguarde um novo ciclo ser produzido**

2. **Verifique o novo apontamento:**
```sql
SELECT 
    id,
    "productionOrderId",
    quantity,
    "clpCounterValue",
    timestamp
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
)
ORDER BY timestamp DESC
LIMIT 5;
```

3. **`clpCounterValue` deve ser 4** nos novos apontamentos ✅

4. **No OrderSummary:**
   - Peças produzidas deve aumentar de 4 em 4
   - Peças por hora deve estar correto
   - Produção diária deve mostrar valores realistas

---

## 🔮 PREVENÇÃO FUTURA

### Opção 1: Forçar atualização ao mudar molde

No frontend, quando atualizar o molde de uma ordem ativa, mostrar alerta:
```
⚠️ Molde alterado! Reinicie o data-collector para aplicar as mudanças.
```

### Opção 2: Atualizar cache automaticamente

Modificar `ProductionMonitor.ts` para detectar mudanças:

```typescript
private async loadActiveOrders(): Promise<void> {
  const orders = await this.apiClient.getActiveProductionOrders();
  
  for (const order of orders) {
    const existing = this.activeOrders.get(order.id);
    
    // Detectar se cavidades mudaram
    if (existing && existing.moldCavities !== order.moldCavities) {
      logger.warn(`⚠️ Molde da ordem ${order.orderNumber} foi atualizado: ${existing.moldCavities} → ${order.moldCavities} cavidades`);
    }
    
    this.activeOrders.set(order.id, order);
  }
}
```

---

## 📊 IMPACTO DA CORREÇÃO

**Antes:**
- 219 apontamentos × 3 = **657 peças**
- Peças por hora: INCORRETO ❌

**Depois:**
- 219 apontamentos × 4 = **876 peças** 
- Diferença: **+219 peças** (25% a mais!)
- Peças por hora: CORRETO ✅

---

## ✅ CHECKLIST

- [ ] Executei `CORRIGIR_CLPCOUNTERVALUE_OP001.sql`
- [ ] Verifiquei que os apontamentos foram atualizados para 4
- [ ] Verifiquei que `producedQuantity` da ordem foi recalculado
- [ ] Reiniciei o data-collector
- [ ] Aguardei um novo ciclo ser produzido
- [ ] Confirmei que novos apontamentos têm `clpCounterValue = 4`
- [ ] Verifiquei no OrderSummary que os valores estão corretos
- [ ] Atualizei a página do OrderSummary (F5)


