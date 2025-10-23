# 🔍 DIAGNÓSTICO: Quantidade Total de Produção Ativa Incorreta

## 🐛 PROBLEMA RELATADO

No `OrderSummary`:
- **Peças por hora:** mostrando 0,07
- **Total da produção diária:** mostrando 0:04:00

Valores muito baixos que indicam problema no cálculo ou nos dados.

---

## 📊 COMO FUNCIONA O CÁLCULO

### Estrutura dos Apontamentos

Cada apontamento tem 2 campos importantes:

1. **`quantity`**: Tempo do ciclo em unidades (precisa ser dividido por `timeDivisor`)
2. **`clpCounterValue`**: Número de **peças produzidas** no ciclo (= cavidades ativas do molde)

### Cálculos no Frontend

```typescript
// Total de peças produzidas
const totalProduced = appointments.reduce((sum, apt) => 
  sum + (apt.clpCounterValue || 0), 0
);

// Tempo total de produção (em segundos)
const totalTimeUnits = appointments.reduce((sum, apt) => 
  sum + (apt.quantity || 0), 0
);
const totalSeconds = totalTimeUnits / timeDivisor;

// Peças por hora
const productivity = (totalProduced / totalSeconds) * 3600;
```

---

## 🔍 POSSÍVEIS CAUSAS

### Causa 1: `clpCounterValue` está NULL ou ZERO

Se os apontamentos não têm `clpCounterValue` preenchido:
- **Total produzido:** 0 peças ❌
- **Peças por hora:** 0 ❌

**Como verificar:**
Execute o script `VERIFICAR_CLPCOUNTERVALUE.sql`

### Causa 2: Ordem sem Molde ou Cavidades não Configuradas

O data-collector usa as **cavidades do molde** para preencher `clpCounterValue`:

```typescript
const moldCavities = orderForThisPlc.moldCavities || 1;
```

Se a ordem não tem molde vinculado ou o molde não tem cavidades configuradas:
- **clpCounterValue:** será 1 (padrão) ou 0
- **Resultado:** contagem incorreta

**Como verificar:**
```sql
SELECT 
    po.id,
    po."orderNumber",
    po."moldId",
    m.name as mold_name,
    m.cavities,
    m."activeCavities"
FROM production_orders po
LEFT JOIN molds m ON po."moldId" = m.id
WHERE po.status = 'ACTIVE';
```

### Causa 3: Valores muito pequenos durante testes

Se você está testando com poucos ciclos:
- **1 ciclo com 4 cavidades** = 4 peças
- **Em 240 segundos (4 min)** = 0,066... horas
- **Peças por hora:** 4 / 0,066 = **60 peças/hora** ✅

Mas se o `clpCounterValue` for 1:
- **1 peça em 240 segundos**
- **Peças por hora:** 1 / 0,066 = **15 peças/hora**

---

## ✅ SOLUÇÕES

### Solução 1: Verificar Dados dos Apontamentos

Execute este script SQL:

```sql
-- Ver últimos apontamentos
SELECT 
    id,
    "productionOrderId",
    quantity,
    "clpCounterValue",
    automatic,
    timestamp
FROM production_appointments
ORDER BY timestamp DESC
LIMIT 20;

-- Verificar soma total
SELECT 
    SUM(quantity) as soma_tempo_total,
    SUM("clpCounterValue") as soma_pecas_total,
    COUNT(*) as total_apontamentos,
    COUNT("clpCounterValue") as apontamentos_com_clp_value
FROM production_appointments;
```

**Resultado esperado:**
- `soma_pecas_total` deve ser > 0
- `apontamentos_com_clp_value` deve ser igual a `total_apontamentos`

### Solução 2: Verificar Configuração do Molde

```sql
-- Verificar ordens ativas e seus moldes
SELECT 
    po.id,
    po."orderNumber",
    po.status,
    m.id as mold_id,
    m.name as mold_name,
    m.cavities,
    m."activeCavities",
    COUNT(pa.id) as total_appointments,
    SUM(pa."clpCounterValue") as total_pieces
FROM production_orders po
LEFT JOIN molds m ON po."moldId" = m.id
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status = 'ACTIVE'
GROUP BY po.id, m.id;
```

**O que verificar:**
- Ordem tem `moldId` preenchido?
- Molde tem `cavities` > 0?
- `total_pieces` está acumulando corretamente?

### Solução 3: Corrigir Apontamentos Antigos (se necessário)

Se você tem apontamentos sem `clpCounterValue`, pode corrigir assim:

```sql
-- BACKUP primeiro!
-- CREATE TABLE production_appointments_backup AS 
-- SELECT * FROM production_appointments;

-- Atualizar apontamentos que têm ordem com molde, mas clpCounterValue está NULL
UPDATE production_appointments pa
SET "clpCounterValue" = COALESCE(m.cavities, 1)
FROM production_orders po
LEFT JOIN molds m ON po."moldId" = m.id
WHERE pa."productionOrderId" = po.id
  AND pa."clpCounterValue" IS NULL
  AND pa.automatic = true;

-- Verificar quantos foram atualizados
SELECT 
    COUNT(*) as apontamentos_corrigidos
FROM production_appointments
WHERE "clpCounterValue" IS NOT NULL;
```

---

## 🎯 AÇÃO IMEDIATA

1. **Execute o diagnóstico:**
   ```bash
   psql -U <usuario> -d mes_production -f VERIFICAR_CLPCOUNTERVALUE.sql
   ```

2. **Verifique a ordem ativa:**
   - Ela tem molde vinculado?
   - O molde tem cavidades configuradas?

3. **Se necessário, atualize o molde:**
   ```sql
   UPDATE molds 
   SET cavities = 4,  -- Número real de cavidades
       "activeCavities" = 4  -- Cavidades ativas
   WHERE id = <id_do_molde>;
   ```

4. **Reinicie o data-collector** para que ele pegue as novas configurações

---

## 📝 CHECKLIST DE VERIFICAÇÃO

- [ ] Executei o SQL de diagnóstico
- [ ] Verifiquei que `clpCounterValue` está preenchido nos apontamentos
- [ ] Confirmei que a ordem ativa tem molde vinculado
- [ ] Verifiquei que o molde tem cavidades configuradas corretamente
- [ ] Reiniciei o data-collector após ajustes
- [ ] Testei um novo ciclo de produção
- [ ] Confirmei que os valores estão corretos no OrderSummary

---

## 📊 VALORES ESPERADOS

Para uma produção típica:

**Exemplo: Molde com 4 cavidades, ciclo de 30 segundos**

- **1 hora de produção:**
  - 120 ciclos (3600s / 30s)
  - 480 peças (120 ciclos × 4 cavidades)
  - **Peças por hora:** 480
  
- **10 ciclos em 5 minutos:**
  - 10 apontamentos
  - 40 peças (10 × 4)
  - **Peças por hora:** 40 / (300/3600) = 480 ✅

Se você está vendo **0,07 peças/hora**, algo está muito errado nos dados!


