# 🔍 Diagnóstico: D33 Não Está Capturando

**Data:** 23 de Outubro de 2025  
**Problema:** Registro D33 não está criando apontamentos automáticos

---

## 🐛 Problemas Identificados

### 1. **Conflito de Propósito do Registro**

**Configuração Atual:**
- D33 está configurado como `PRODUCTION_COUNTER`

**Lógica do Código:**
- O código do Data Collector procura por `CYCLE_TIME` para detectar ciclos completos
- A função `handleProductionCounter` verifica: `register.registerPurpose === 'CYCLE_TIME'`
- Como D33 está como `PRODUCTION_COUNTER`, nunca entra nesta condição!

**Trecho do código:**
```typescript
const isCycleComplete = 
  register.registerPurpose === 'CYCLE_TIME' &&  // ← AQUI ESTÁ O PROBLEMA!
  previousValue !== null && 
  currentValue > 0 &&
  currentValue !== previousValue;
```

### 2. **Time Divisor Incorreto**

**Antes:** `time_divisor = 10` (esperava valores em décimos de segundo)  
**Correto:** `time_divisor = 1` (valores em segundos) ✅ **JÁ CORRIGIDO**

### 3. **Sem Ordem Ativa Vinculada**

**Verificado:** Não há ordens de produção com status ACTIVE vinculadas ao PLC.

---

## ✅ Soluções Aplicadas

### Solução 1: Corrigir o Propósito do D33

Existem duas abordagens:

#### Abordagem A: D33 como Contador de Produção Real
Se D33 é um contador incremental de peças:

```sql
-- Manter como PRODUCTION_COUNTER (requer código adicional)
-- Atualmente NÃO IMPLEMENTADO no Data Collector
```

#### Abordagem B: D33 como Tempo de Ciclo (RECOMENDADO) ⭐
Se D33 é o tempo de ciclo da máquina:

```sql
-- Alterar para CYCLE_TIME
UPDATE plc_registers
SET register_purpose = 'CYCLE_TIME',
    description = 'Tempo de Ciclo da Máquina (segundos)'
WHERE "registerName" = 'D33'
  AND "plcConfigId" = 1;
```

**RECOMENDAÇÃO:** Use a **Abordagem B** pois:
- ✅ Já está implementada no código
- ✅ É a lógica padrão de injetoras (1 ciclo = N peças)
- ✅ Funciona imediatamente

### Solução 2: Time Divisor

```sql
-- JÁ APLICADO ✅
UPDATE plc_configs 
SET time_divisor = 1 
WHERE name = 'CLP Principal - DVP-12SE';
```

### Solução 3: Criar Ordem Ativa

```sql
-- Criar uma ordem de teste ACTIVE vinculada ao PLC
INSERT INTO production_orders (
  "orderNumber",
  "itemId",
  "moldId",
  "plcConfigId",
  "companyId",
  "sectorId",
  "plannedQuantity",
  "producedQuantity",
  status,
  priority,
  "plannedStartDate",
  "plannedEndDate",
  "createdAt",
  "updatedAt"
)
VALUES (
  'OP-2025-TESTE-001',
  1,  -- Tampa 38mm
  1,  -- MOL-101 (16 cavidades)
  1,  -- CLP DVP12-SE
  1,  -- Plásticos Industriais
  1,  -- Setor Injeção
  10000,
  0,
  'ACTIVE',
  10,
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```

---

## 🔧 Como o Sistema Deve Funcionar

### Fluxo Correto com CYCLE_TIME:

1. **PLC está rodando** produzindo peças
2. **D33 muda de valor** (exemplo: 45s → 47s)
3. **Data Collector detecta** mudança no CYCLE_TIME
4. **Interpreta** como 1 ciclo completo
5. **Busca ordem ACTIVE** vinculada ao PLC
6. **Lê cavidades do molde** (exemplo: 16 cavidades)
7. **Cria apontamento:**
   - quantity = valor do D33 (47)
   - clpCounterValue = cavidades do molde (16)
   - producedQuantity da ordem += 16 peças

### Log Esperado:

```
🔄 Ciclo completo detectado!
⏱️  D33: 47s (Δ 2s)
🎯 Criando apontamento: OP OP-2025-TESTE-001
📦 quantity=47 (D33) | clpCounterValue=16 (cavidades)
✅ Apontamento registrado com sucesso!
```

---

## 🚀 Script de Correção Completa

Execute este script SQL:

```sql
BEGIN;

-- 1. Corrigir propósito do D33 para CYCLE_TIME
UPDATE plc_registers
SET register_purpose = 'CYCLE_TIME',
    description = 'Tempo de Ciclo da Máquina (segundos)'
WHERE "registerName" = 'D33'
  AND "plcConfigId" = 1;

-- 2. Confirmar time_divisor = 1 (já corrigido)
UPDATE plc_configs 
SET time_divisor = 1 
WHERE id = 1;

-- 3. Criar ordem de teste ACTIVE
INSERT INTO production_orders (
  "orderNumber", "itemId", "moldId", "plcConfigId", "companyId", "sectorId",
  "plannedQuantity", "producedQuantity", status, priority,
  "plannedStartDate", "plannedEndDate", "createdAt", "updatedAt"
)
VALUES (
  'OP-2025-TESTE-001',
  1, 1, 1, 1, 1,
  10000, 0, 'ACTIVE', 10,
  NOW(), NOW() + INTERVAL '7 days', NOW(), NOW()
)
ON CONFLICT DO NOTHING;

COMMIT;

-- Verificar
SELECT 'CONFIGURAÇÃO CORRIGIDA!' as status;

SELECT 'PLC:' as info, name, host, time_divisor FROM plc_configs WHERE id = 1;

SELECT 'D33:' as info, "registerName", register_purpose, description 
FROM plc_registers WHERE "registerName" = 'D33' AND "plcConfigId" = 1;

SELECT 'ORDEM ATIVA:' as info, "orderNumber", status, "plcConfigId" 
FROM production_orders WHERE status = 'ACTIVE';
```

---

## 📋 Checklist de Verificação

Após aplicar as correções:

- [ ] D33 está como `CYCLE_TIME`?
- [ ] time_divisor está como `1`?
- [ ] Existe ordem com status `ACTIVE`?
- [ ] Ordem está vinculada ao PLC (plcConfigId = 1)?
- [ ] Molde da ordem tem cavidades definidas?
- [ ] Data Collector foi reiniciado?
- [ ] PLC está conectado (verificar logs)?

---

## 🔄 Reiniciar Data Collector

**IMPORTANTE:** Após fazer as correções, REINICIE o Data Collector:

```powershell
# Parar todos os serviços
Get-Process -Name node | Stop-Process -Force

# Reiniciar
cd C:\Empresas\Desenvolvimento\MES
REINICIAR_SISTEMA_MES.bat
```

Ou manualmente:
```powershell
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

---

## 🧪 Testar Apontamento

1. **Verificar conexão** nos logs do Data Collector:
   ```
   🔌 PLC "CLP Principal - DVP-12SE" conectado!
   📊 Monitorando 4 registros
   ```

2. **Mudar valor do D33** no PLC (ou simular)

3. **Aguardar 1-2 segundos**

4. **Verificar logs**:
   ```
   📊 D33: 45 → 47 (+2)
   🔄 Ciclo completo detectado!
   📦 quantity=47 | clpCounterValue=16
   ✅ Apontamento registrado!
   ```

5. **Verificar no banco**:
   ```sql
   SELECT * FROM production_appointments 
   WHERE automatic = true 
   ORDER BY timestamp DESC 
   LIMIT 5;
   ```

---

## 📌 Resumo

**Problema Principal:** D33 estava como `PRODUCTION_COUNTER` mas o código procura `CYCLE_TIME`

**Solução:** 
1. ✅ Alterar D33 para `CYCLE_TIME`
2. ✅ Garantir `time_divisor = 1`
3. ✅ Criar ordem ACTIVE vinculada ao PLC
4. ⏭️ Reiniciar Data Collector
5. ⏭️ Testar mudança no D33

**Próximo Arquivo:** `CORRIGIR_D33_COMPLETO.sql`

---

