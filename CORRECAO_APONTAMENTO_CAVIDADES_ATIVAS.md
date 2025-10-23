# Correção Crítica - Apontamento de Produção com Cavidades Ativas

## 🐛 Problema Identificado

Os apontamentos automáticos estavam registrando a **quantidade ERRADA** de peças:

### Comportamento Incorreto ❌
- Molde: 4 cavidades totais, **2 cavidades ativas**
- Cada ciclo deveria produzir: **2 peças**
- Sistema estava registrando: **4 peças** (ou valor do tempo D33)
- **ERRO CRÍTICO**: Contabilização incorreta da produção!

### Exemplo Real
```
Apontamento 1: 4 peças ❌ (deveria ser 2)
Apontamento 2: 4 peças ❌ (deveria ser 2)  
Apontamento 3: 4 peças ❌ (deveria ser 2)

Total registrado: 12 peças
Total real produzido: 6 peças
DIFERENÇA: 100% a mais! 🚨
```

---

## ✅ Correção Aplicada

### Arquivo: `data-collector/src/services/PlcConnection.ts`

#### ANTES (Incorreto):
```typescript
// ❌ ERRADO: Usava o tempo do D33 como quantidade
const moldCavities = orderForThisPlc.moldCavities || 1;
const quantityFromD33 = currentValue; // Tempo de ciclo!

const success = await this.productionMonitor.recordProduction(
  orderForThisPlc.id,
  quantityFromD33,     // ❌ Passava TEMPO como QUANTIDADE
  undefined,
  moldCavities         // Cavidades ficava em outro campo
);
```

#### DEPOIS (Correto):
```typescript
// ✅ CORRETO: Usa cavidades ativas como quantidade
const moldCavities = orderForThisPlc.moldCavities || 1; // Cavidades ativas
const cycleTimeFromD33 = currentValue; // Tempo de ciclo

const success = await this.productionMonitor.recordProduction(
  orderForThisPlc.id,
  moldCavities,        // ✅ QUANTIDADE = Cavidades ativas (2 peças)
  undefined,
  cycleTimeFromD33     // Tempo fica registrado aqui
);
```

---

## 🔄 Como Funciona Agora

### Fluxo Correto

1. **PLC detecta ciclo completo** (D33 muda)
   
2. **Backend retorna**:
   - `moldCavities = 2` (cavidades ativas)
   
3. **Data-collector registra**:
   ```
   quantity = 2 peças (cavidades ativas) ✅
   clpCounterValue = tempo do ciclo (D33)
   ```

4. **Banco de dados salva**:
   ```sql
   INSERT INTO production_appointments 
   (quantity, clpCounterValue) 
   VALUES (2, <tempo_ciclo>);
   ```

5. **Ordem de produção atualiza**:
   ```
   producedQuantity += 2 peças ✅
   ```

---

## 📊 Resultados Esperados

### Antes da Correção ❌
```
Ciclo 1: +4 peças (ERRADO)
Ciclo 2: +4 peças (ERRADO)
Ciclo 3: +4 peças (ERRADO)
─────────────────────────
Total: 12 peças (200% do real)
```

### Depois da Correção ✅
```
Ciclo 1: +2 peças (CORRETO - cavidades ativas)
Ciclo 2: +2 peças (CORRETO - cavidades ativas)
Ciclo 3: +2 peças (CORRETO - cavidades ativas)
─────────────────────────
Total: 6 peças (100% correto!)
```

---

## 🚀 Como Aplicar a Correção

### 1. Parar o Data Collector
```powershell
Get-Process -Name "node" | Where-Object {$_.Path -like "*data-collector*"} | Stop-Process -Force
```

### 2. Recompilar
```bash
cd data-collector
npm run build
```

### 3. Iniciar Novamente
```bash
npm run dev
# ou
npm start
```

---

## 🧪 Como Testar

### 1. Verificar Logs do Data Collector
Deve mostrar:
```
🔄 Ciclo completo detectado!
⏱️  D33: 3500ms (Δ 200ms)
🎯 Criando apontamento: OP OP-2025-004
📦 Produzido: 2 peças (cavidades ativas) | Tempo: 3500ms ✅
✅ Apontamento registrado com sucesso!
```

### 2. Verificar Banco de Dados
```sql
SELECT quantity, "clpCounterValue", timestamp
FROM production_appointments
ORDER BY timestamp DESC
LIMIT 5;

-- Deve mostrar:
-- quantity | clpCounterValue | timestamp
-- ---------|-----------------|----------
--    2     |     3500        | ...  ✅
--    2     |     3700        | ...  ✅
```

### 3. Verificar Frontend
- Resumo da Ordem deve mostrar incrementos de **2 em 2**
- Não mais incrementos de 4 em 4

---

## ⚠️ IMPORTANTE - Dados Antigos

### Apontamentos Anteriores
Os apontamentos feitos **ANTES** desta correção estão com quantidades erradas no banco.

**Opções:**

#### Opção 1: Corrigir Dados Antigos (Recomendado)
```sql
-- Corrigir apontamentos da ordem OP-2025-004
-- Se o molde tem 2 cavidades ativas mas registrou 4:

UPDATE production_appointments
SET quantity = 2
WHERE "productionOrderId" = (
  SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-004'
)
AND quantity = 4
AND automatic = true;

-- Recalcular total produzido
UPDATE production_orders
SET "producedQuantity" = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM production_appointments
  WHERE "productionOrderId" = production_orders.id
)
WHERE "orderNumber" = 'OP-2025-004';
```

#### Opção 2: Apenas Novos Apontamentos
- Deixar dados antigos como estão
- Apontamentos novos virão corretos
- **Nota**: Total acumulado terá discrepância

---

## 📝 Arquivos Modificados

- `data-collector/src/services/PlcConnection.ts`
- `data-collector/dist/services/PlcConnection.js` (compilado)

---

## ✅ Checklist de Verificação

- [x] Código corrigido
- [x] Data-collector compilado
- [ ] Data-collector reiniciado
- [ ] Logs verificados
- [ ] Primeiro apontamento testado
- [ ] Quantidade correta confirmada
- [ ] Dados antigos corrigidos (opcional)

---

## 💡 Lógica Final

**REGRA DE OURO:**
```
Quantidade produzida por ciclo = Cavidades Ativas do Molde
```

- Molde com 10 cavidades, 4 ativas → **+4 peças/ciclo**
- Molde com 4 cavidades, 2 ativas → **+2 peças/ciclo**
- Molde com 1 cavidade, 1 ativa → **+1 peça/ciclo**

---

**Correção Crítica Aplicada em: 22/10/2025 - 23:20**

**Status: ✅ PRONTO PARA USAR**

