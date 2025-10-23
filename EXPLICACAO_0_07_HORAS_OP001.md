# 🔍 EXPLICAÇÃO: Como chegou em 0.07 horas na OP-2025-001

## 📊 DADOS DA OP-2025-001

Você mostrou 10 apontamentos mais recentes:
```
ID    quantity  clpCounterValue  timestamp
216   37        3                02:02:43
215   20        3                02:02:35
214   40        3                02:02:29
213   72        3                02:02:20
212   38        3                02:02:09
211   20        3                02:01:56
210   48        3                02:01:51
209   21        3                02:01:46
208   41        3                02:01:39
207   58        3                02:01:32
```

**Total de apontamentos:** 219

---

## 🧮 CÁLCULO PASSO A PASSO

### Passo 1: Somar todos os `quantity` (tempo em unidades)

O campo `quantity` armazena o **tempo do ciclo em unidades** (não em segundos diretamente).

**Código:**
```typescript
const totalTimeUnits = appointments.reduce((sum, apt) => 
  sum + (apt.quantity || 0), 0
);
```

**Vamos simular com os 10 valores mostrados:**
```
37 + 20 + 40 + 72 + 38 + 20 + 48 + 21 + 41 + 58 = 395 unidades
```

**Mas são 219 apontamentos no total!** Só estou vendo os últimos 10.

Para saber o total real, precisamos da soma de TODOS os 219 apontamentos.

---

### Passo 2: Converter para segundos usando `timeDivisor`

O `timeDivisor` define quantas unidades equivalem a 1 segundo.

**Código:**
```typescript
const timeDivisor = order.plcConfig?.timeDivisor || 10;
const totalSeconds = totalTimeUnits / timeDivisor;
```

**Valor padrão:** `timeDivisor = 10`

Isso significa: **10 unidades = 1 segundo**

**Se totalSeconds = 240 segundos** (como você mencionou 0:04:00):
```
totalTimeUnits = 240 × 10 = 2400 unidades
```

---

### Passo 3: Calcular horas de produção

**Código:**
```typescript
const productionHours = totalSeconds > 0 ? totalSeconds / 3600 : 0;
```

**Cálculo:**
```
productionHours = 240 / 3600
productionHours = 0.0666... ≈ 0.07 horas
```

**Conversão:**
- 0.07 horas × 60 = **4.2 minutos**
- Isso corresponde ao tempo mostrado: **0:04:00** ✅

---

## 📈 ONDE O VALOR APARECE

### 1. Na descrição das Peças por Hora

```typescript
{stats?.totalProduced.toLocaleString('pt-BR')} peças ÷ 
{stats?.productionHours.toFixed(2)} horas = 
{stats?.productivity ? Math.round(stats.productivity).toLocaleString('pt-BR') : '0'} peças/hora
```

**Com os dados atuais (antes da correção):**
```
657 peças ÷ 0.07 horas = 9.386 peças/hora
```

Mas você mencionou **0,07 peças/hora**, não 0.07 horas!

---

## 🤔 ONDE ESTÁ O PROBLEMA?

### Problema 1: `clpCounterValue = 3` em vez de 4

Seus apontamentos têm `clpCounterValue = 3`, mas o molde tem **4 cavidades**.

**Total atual (ERRADO):**
```
219 apontamentos × 3 = 657 peças
```

**Total correto:**
```
219 apontamentos × 4 = 876 peças
```

### Problema 2: Tempo muito pequeno

240 segundos (4 minutos) para 219 apontamentos significa:
```
240 / 219 = 1.09 segundos por apontamento
```

Isso é **extremamente rápido** para um ciclo de injeção!

Ciclos típicos de injeção: **20-60 segundos**

---

## 🔍 VERIFICAR O `timeDivisor`

O valor de 0.07 horas (4 minutos) sugere que:

1. **Ou o `timeDivisor` está errado**
2. **Ou a soma dos `quantity` está muito baixa**

### Verificar o `timeDivisor` da ordem:

```sql
SELECT 
    po."orderNumber",
    pc.name as clp_name,
    pc."timeDivisor"
FROM production_orders po
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';
```

**Valores comuns:**
- `timeDivisor = 10`: 10 unidades = 1 segundo (padrão)
- `timeDivisor = 100`: 100 unidades = 1 segundo
- `timeDivisor = 1000`: 1000 unidades = 1 segundo (milissegundos)

---

## 🎯 CALCULAR O VALOR CORRETO

### Se o ciclo médio é ~20 segundos (típico):

**Tempo total esperado:**
```
219 ciclos × 20 segundos = 4.380 segundos = 1,22 horas
```

### Se você tem apenas 240 segundos (4 minutos):

Pode ser que:
1. **Você está vendo apenas apontamentos recentes** (não os 219 completos)
2. **O `timeDivisor` está incorreto**
3. **Os valores de `quantity` não estão sendo gravados corretamente**

---

## 🔧 SOLUÇÃO

### 1. Verificar soma REAL de todos os quantity:

```sql
SELECT 
    COUNT(*) as total_apontamentos,
    SUM(quantity) as soma_quantity_total,
    AVG(quantity) as media_quantity,
    MIN(quantity) as min_quantity,
    MAX(quantity) as max_quantity
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
);
```

### 2. Verificar o timeDivisor:

```sql
SELECT 
    po."orderNumber",
    pc."timeDivisor",
    COALESCE(pc."timeDivisor", 10) as divisor_usado
FROM production_orders po
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';
```

### 3. Calcular o tempo real:

```sql
SELECT 
    COUNT(*) as total_apontamentos,
    SUM(quantity) as soma_quantity,
    COALESCE(pc."timeDivisor", 10) as time_divisor,
    SUM(quantity) / COALESCE(pc."timeDivisor", 10) as total_segundos,
    ROUND((SUM(quantity) / COALESCE(pc."timeDivisor", 10)) / 3600.0, 2) as total_horas
FROM production_appointments pa
JOIN production_orders po ON pa."productionOrderId" = po.id
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';
```

---

## 📝 RESUMO

**0.07 horas = 4.2 minutos = 240 segundos**

Isso vem de:
```
totalSeconds = (soma de todos os quantity) / timeDivisor
productionHours = totalSeconds / 3600
```

**Para 219 apontamentos, 4 minutos é muito pouco!**

Esperado: **~1 hora** ou mais (dependendo do ciclo)

**Próximos passos:**
1. Execute as queries acima para verificar os valores reais
2. Verifique se o `timeDivisor` está correto
3. Me envie os resultados para eu calcular exatamente onde está o erro


