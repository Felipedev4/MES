# ✅ Campo `durationSeconds` - Tempo Gravado em Segundos

## 🎯 Objetivo

Gravar o tempo total do apontamento manual em **segundos** no banco de dados, em vez de calcular sempre que for exibir.

---

## 📋 Implementação

### 🗂️ Novo Campo no Banco de Dados

**Campo adicionado:**
```sql
durationSeconds INTEGER NULL
```

**Características:**
- ✅ **Nullable**: Não quebra apontamentos automáticos ou antigos
- ✅ **Indexado**: Performance otimizada para consultas
- ✅ **Calculado Automaticamente**: Backend calcula `endTime - startTime`

---

## 🔄 Fluxo de Dados

### 1️⃣ **Registro no Frontend**

```typescript
// Usuário preenche:
startTime: "2025-10-23T13:00:00"
endTime:   "2025-10-23T13:48:00"
quantity:  39 (peças)
```

### 2️⃣ **Cálculo no Backend**

```typescript
// Backend calcula automaticamente:
const durationSeconds = Math.floor(
  (endTime.getTime() - startTime.getTime()) / 1000
);
// Resultado: 2880 segundos (48 minutos)
```

### 3️⃣ **Gravação no Banco**

```sql
INSERT INTO production_appointments (
  productionOrderId, userId, quantity, 
  startTime, endTime, durationSeconds, automatic
) VALUES (
  1, 1, 39,
  '2025-10-23 13:00:00', '2025-10-23 13:48:00', 
  2880, -- ⭐ Gravado em segundos
  false
);
```

### 4️⃣ **Exibição no Frontend**

```typescript
// Frontend usa o valor gravado:
if (apt.durationSeconds != null) {
  // 2880 segundos → "48m 0s"
  const hours = Math.floor(2880 / 3600);    // 0
  const minutes = Math.floor(2880 % 3600 / 60); // 48
  const seconds = 2880 % 60;                 // 0
  
  timeDisplay = "48m 0s"; // ✅
}
```

---

## 🗃️ Schema Prisma Atualizado

```prisma
model ProductionAppointment {
  id                Int       @id @default(autoincrement())
  productionOrderId Int
  userId            Int
  quantity          Int       // Peças produzidas (manual) ou tempo ciclo (automático)
  rejectedQuantity  Int       @default(0)
  timestamp         DateTime  @default(now())
  startTime         DateTime? // Data/hora início (manual)
  endTime           DateTime? // Data/hora fim (manual)
  durationSeconds   Int?      // ⭐ NOVO: Tempo em segundos (manual)
  automatic         Boolean   @default(false)
  clpCounterValue   Int?      // Contador PLC (automático)
  notes             String?
  createdAt         DateTime  @default(now())

  productionOrder ProductionOrder @relation(...)
  user            User            @relation(...)

  @@index([durationSeconds]) // ⭐ Índice para performance
  @@map("production_appointments")
}
```

---

## 📊 Estrutura de Dados

### Apontamento MANUAL

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| `quantity` | 39 | Peças produzidas |
| `startTime` | 2025-10-23 13:00:00 | Início da produção |
| `endTime` | 2025-10-23 13:48:00 | Fim da produção |
| **`durationSeconds`** | **2880** | ⭐ **Tempo total (48 min)** |
| `automatic` | `false` | Manual |
| `clpCounterValue` | `null` | - |

**Exibição:**
- **Peças**: 39
- **Tempo**: 48m 0s (calculado de 2880 segundos)

### Apontamento AUTOMÁTICO

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| `quantity` | 500 | Tempo ciclo em unidades PLC |
| `startTime` | `null` | - |
| `endTime` | `null` | - |
| **`durationSeconds`** | **`null`** | Não usado |
| `automatic` | `true` | Automático |
| `clpCounterValue` | 5 | Peças contadas pelo PLC |

**Exibição:**
- **Peças**: 5 (do clpCounterValue)
- **Tempo**: 50.0s (500 ÷ 10 divisor)

---

## 📁 Arquivos Modificados

### Backend

1. **`backend/prisma/schema.prisma`**
   - Campo `durationSeconds Int?` adicionado
   - Índice criado

2. **`backend/src/services/productionService.ts`**
   ```typescript
   // Calcular duração em segundos se tiver startTime e endTime
   let durationSeconds: number | undefined;
   if (startTime && endTime) {
     durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
   }

   // Criar apontamento com durationSeconds
   const appointment = await prisma.productionAppointment.create({
     data: {
       // ... outros campos
       startTime,
       endTime,
       durationSeconds, // ⭐ GRAVADO
     },
   });
   ```

### Frontend

3. **`frontend/src/types/index.ts`**
   ```typescript
   export interface ProductionAppointment {
     // ... outros campos
     startTime?: string;
     endTime?: string;
     durationSeconds?: number; // ⭐ NOVO
   }
   ```

4. **`frontend/src/pages/OrderSummary.tsx`**
   ```typescript
   // Preferir usar durationSeconds quando disponível
   if (apt.durationSeconds != null) {
     // Usar valor gravado (mais eficiente) ⭐
     const totalSeconds = apt.durationSeconds;
     // Formatar...
   } else if (apt.startTime && apt.endTime) {
     // Fallback: calcular (compatibilidade)
     // ...
   }
   ```

### Banco de Dados

5. **SQL Migration**
   ```sql
   -- Adicionar campo
   ALTER TABLE production_appointments 
   ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER;

   -- Criar índice
   CREATE INDEX IF NOT EXISTS "production_appointments_durationSeconds_idx" 
   ON production_appointments("durationSeconds");

   -- Atualizar registros existentes
   UPDATE production_appointments
   SET "durationSeconds" = EXTRACT(EPOCH FROM ("endTime" - "startTime"))::INTEGER
   WHERE automatic = false 
     AND "startTime" IS NOT NULL 
     AND "endTime" IS NOT NULL;
   ```

---

## ✅ Vantagens

### 1. **Performance** ⚡
- ✅ Não precisa calcular toda vez que exibe
- ✅ Valor já gravado no banco
- ✅ Queries mais rápidas

### 2. **Consistência** 🎯
- ✅ Tempo calculado uma única vez
- ✅ Mesmo valor sempre que consultar
- ✅ Evita problemas de timezone

### 3. **Simplicidade** 🧩
- ✅ Backend faz o cálculo automaticamente
- ✅ Frontend apenas formata para exibição
- ✅ Lógica centralizada

### 4. **Compatibilidade** 🔄
- ✅ Campo nullable não quebra dados antigos
- ✅ Fallback para calcular se não existir
- ✅ Apontamentos automáticos não afetados

---

## 🔍 Exemplos de Consulta

### Buscar apontamentos com tempo total

```sql
SELECT 
  id,
  quantity AS pecas,
  "durationSeconds" AS tempo_segundos,
  "durationSeconds" / 60 AS tempo_minutos,
  "startTime",
  "endTime",
  automatic
FROM production_appointments
WHERE automatic = false
ORDER BY id DESC;
```

**Resultado:**
```
id | pecas | tempo_segundos | tempo_minutos |    startTime        |     endTime         | automatic
---+-------+----------------+---------------+---------------------+---------------------+-----------
 2 |   39  |      2880      |      48       | 2025-10-23 13:00:00 | 2025-10-23 13:48:00 | false
 1 |    1  |       300      |       5       | 2025-10-23 12:00:00 | 2025-10-23 12:05:00 | false
```

### Tempo médio de produção

```sql
SELECT 
  AVG("durationSeconds") AS tempo_medio_segundos,
  AVG("durationSeconds") / 60 AS tempo_medio_minutos
FROM production_appointments
WHERE automatic = false 
  AND "durationSeconds" IS NOT NULL;
```

---

## 🧪 Como Testar

### 1. Criar novo apontamento manual
1. Acesse **Apontamento Manual**
2. Preencha início: `23/10/2025 14:00`
3. Preencha fim: `23/10/2025 14:30`
4. Quantidade: `50`
5. Registrar

### 2. Verificar no banco
```sql
SELECT 
  id,
  quantity,
  "durationSeconds",
  "startTime",
  "endTime"
FROM production_appointments
WHERE automatic = false
ORDER BY id DESC
LIMIT 1;
```

**Esperado:**
- `quantity`: 50
- `durationSeconds`: 1800 (30 minutos × 60)
- `startTime`: 2025-10-23 14:00:00
- `endTime`: 2025-10-23 14:30:00

### 3. Verificar na tela
1. Acesse a ordem de produção
2. Clique em **Resumo**
3. Veja na tabela:
   - **Peças**: 50 ✅
   - **Tempo**: 30m 0s ✅

---

## 📊 Exemplo Real

### Entrada do Usuário:
```
Ordem: OP-2025-001
Início: 23/10/2025 13:00:00
Fim:    23/10/2025 14:35:20
Peças:  100
```

### Gravado no Banco:
```sql
{
  "quantity": 100,
  "startTime": "2025-10-23T13:00:00.000Z",
  "endTime": "2025-10-23T14:35:20.000Z",
  "durationSeconds": 5720,  -- ⭐ 1h 35m 20s
  "automatic": false
}
```

### Exibido na Tela:
```
Peças: 100
Tempo: 1h 35m 20s
```

**Cálculo:**
- 5720 segundos ÷ 3600 = **1 hora**
- 5720 % 3600 = 2120 ÷ 60 = **35 minutos**
- 2120 % 60 = **20 segundos**
- Resultado: **"1h 35m 20s"** ✅

---

## 📝 Notas Importantes

1. **Campo Nullable**: `durationSeconds` pode ser `NULL` para:
   - Apontamentos automáticos (sempre `NULL`)
   - Apontamentos manuais antigos (antes da implementação)
   - Apontamentos sem `startTime`/`endTime`

2. **Fallback Automático**: Frontend calcula de `startTime`/`endTime` se `durationSeconds` for `NULL`

3. **Compatibilidade Total**: Sistema continua funcionando com dados antigos

4. **Atualização Retroativa**: Script SQL atualizou apontamentos manuais existentes

---

## ✅ Status

**IMPLEMENTADO E TESTADO**

- ✅ Campo criado no banco
- ✅ Índice criado
- ✅ Backend calcula e grava automaticamente
- ✅ Frontend usa valor gravado
- ✅ Compatibilidade com dados antigos
- ✅ Sem erros de lint
- ✅ 1 registro atualizado retroativamente

---

**Data da Implementação**: 23/10/2025  
**Desenvolvido por**: AI Assistant  
**Versão**: 1.0

