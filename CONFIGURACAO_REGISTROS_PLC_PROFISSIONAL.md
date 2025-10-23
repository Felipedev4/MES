# 📊 Configuração Profissional de Registros PLC

## 🎯 Problema Identificado

O sistema estava tratando **TODOS** os registros do PLC como contadores de produção, quando na verdade:

- **D33** = Tempo de ciclo (milissegundos) ⏱️
- **D40** = Contador de peças produzidas 📊
- **D41** = Temperatura do molde 🌡️
- Etc.

**Resultado:** Apontamentos incorretos e dados confusos na interface.

---

## ✅ Solução Implementada

### 1️⃣ **Campo `registerPurpose` Adicionado**

Agora cada registro PLC tem um propósito definido:

| registerPurpose | Descrição | Uso | Exemplo |
|----------------|-----------|-----|---------|
| **PRODUCTION_COUNTER** | Contador de peças produzidas | Cria apontamentos automáticos | D40, D50 |
| **CYCLE_TIME** | Tempo de ciclo da máquina | Monitoramento de performance | D33 |
| **TEMPERATURE** | Temperatura do molde/material | Controle de qualidade | D41, D42 |
| **PRESSURE** | Pressão de injeção | Controle de processo | D43, D44 |
| **OTHER** | Outros dados | Apenas registro | D45+ |

---

## 🗄️ Mudanças no Banco de Dados

### Migration Criada:

```sql
ALTER TABLE "plc_registers" 
ADD COLUMN "register_purpose" VARCHAR(50);
```

### Schema Atualizado:

```prisma
model PlcRegister {
  id              Int       @id @default(autoincrement())
  plcConfigId     Int
  registerName    String    // Ex: "D33", "D40", etc
  registerAddress Int       // Endereço numérico
  description     String?   // Descrição legível
  dataType        String    @default("INT16")
  registerPurpose String?   // NOVO! ← Propósito do registro
  enabled         Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 🔧 Lógica Atualizada

### Data Collector (`PlcConnection.ts`):

```typescript
// Antes: Criava apontamento para QUALQUER mudança
if (change > 0 && currentValue > 0) {
  createAppointment(change);
}

// Agora: Apenas para PRODUCTION_COUNTER
if (register.registerPurpose === 'PRODUCTION_COUNTER' && change > 0) {
  createAppointment(change, currentValue); // ← Passa valor do contador
}

// Tempo de ciclo é apenas logado
if (register.registerPurpose === 'CYCLE_TIME') {
  logger.debug(`⏱️ Tempo de Ciclo: ${currentValue}ms`);
}
```

### Backend (`dataCollectorController.ts`):

```typescript
// Agora salva o valor do contador CLP
const appointment = await prisma.productionAppointment.create({
  data: {
    productionOrderId,
    quantity,
    automatic: true,
    clpCounterValue, // ← Valor do contador salvo!
    timestamp,
  },
});
```

---

## 📝 Como Configurar Corretamente

### Via Frontend (Recomendado):

1. **Acessar:** Configurações → Configuração de CLPs
2. **Selecionar** o CLP (ex: Injetora 01)
3. **Adicionar/Editar Registros:**

#### Exemplo de Configuração:

| Registro | Endereço | Descrição | Tipo Dado | **Propósito** | Habilitado |
|----------|----------|-----------|-----------|---------------|------------|
| D33 | 33 | Tempo de Ciclo (ms) | INT16 | **CYCLE_TIME** | ✅ |
| D40 | 40 | Contador de Peças | INT16 | **PRODUCTION_COUNTER** | ✅ |
| D41 | 41 | Temperatura Molde (°C) | INT16 | **TEMPERATURE** | ✅ |
| D42 | 42 | Pressão Injeção (bar) | INT16 | **PRESSURE** | ✅ |
| D50 | 50 | Modo Operação | INT16 | **OTHER** | ❌ |

---

### Via SQL (Direto no Banco):

```sql
-- D33 = Tempo de Ciclo
UPDATE plc_registers
SET 
  register_purpose = 'CYCLE_TIME',
  description = 'Tempo de Ciclo (ms)'
WHERE register_name = 'D33';

-- D40 = Contador de Produção
UPDATE plc_registers
SET 
  register_purpose = 'PRODUCTION_COUNTER',
  description = 'Contador de Peças Produzidas'
WHERE register_name = 'D40';

-- D41 = Temperatura
UPDATE plc_registers
SET 
  register_purpose = 'TEMPERATURE',
  description = 'Temperatura do Molde (°C)'
WHERE register_name = 'D41';
```

---

## 🚀 Aplicar as Mudanças

### 1️⃣ Rodar a Migration

```powershell
cd C:\Empresas\Desenvolvimento\MES\backend

# Aplicar migration
npx prisma migrate deploy

# OU criar nova migration
npx prisma migrate dev --name add_register_purpose

# Gerar cliente Prisma
npx prisma generate

# Recompilar
npm run build
```

### 2️⃣ Configurar Registros

**IMPORTANTE:** Configure os registros ANTES de iniciar o Data Collector!

```sql
-- Verificar configuração atual
SELECT 
  id,
  register_name,
  register_address,
  description,
  register_purpose,
  enabled
FROM plc_registers
WHERE plc_config_id = 1
ORDER BY register_address;

-- Atualizar propósitos conforme necessário
```

### 3️⃣ Reiniciar Serviços

```powershell
# Parar tudo primeiro
# (Ctrl+C nos terminais do backend e data-collector)

# Backend
cd C:\Empresas\Desenvolvimento\MES\backend
npm run dev

# Data Collector (em outro terminal)
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

---

## 📊 Resultado na Interface

### Antes (Errado):
```
Detalhes Apontamento
Data/Hora: 22/10/2025, 10:49:58
Quantidade Produzida: 4
Tipo: Automático
Contador CLP: -  ← VAZIO!
```

### Depois (Correto):
```
Detalhes Apontamento
Data/Hora: 22/10/2025, 10:49:58
Quantidade Produzida: 4
Tipo: Automático
Contador CLP: 168  ← VALOR CORRETO!
Registro: D40 (Contador de Peças)
```

---

## 🔍 Logs Esperados

### Data Collector (Com configuração correta):

```log
📊 D33: 20000 → 20100 (+100)
⏱️  D33 (Tempo de Ciclo): 20100ms

📊 D40: 164 → 168 (+4)
🎯 Criando apontamento automático: OP OP-2025-002 +4 peças
📊 Contador CLP D40: 168 peças
✅ Apontamento registrado com sucesso!
```

### Backend:

```log
✅ Apontamento automático criado: OP OP-2025-002 +4 peças (Contador CLP: 168)
```

---

## 📋 Checklist de Configuração

- [ ] Migration aplicada no banco
- [ ] Prisma client regenerado
- [ ] Backend recompilado
- [ ] Registros configurados com `registerPurpose` correto
- [ ] D33 configurado como `CYCLE_TIME`
- [ ] D40 (ou equivalente) configurado como `PRODUCTION_COUNTER`
- [ ] Backend reiniciado
- [ ] Data Collector reiniciado
- [ ] Teste realizado com sensor real
- [ ] Contador CLP aparece nos apontamentos

---

## 🆘 Troubleshooting

### ❌ Contador CLP continua "-" ou NULL

**Verificar:**

1. **Registro tem `registerPurpose`?**
```sql
SELECT register_name, register_purpose 
FROM plc_registers 
WHERE enabled = true;
```

2. **É PRODUCTION_COUNTER?**
```sql
UPDATE plc_registers
SET register_purpose = 'PRODUCTION_COUNTER'
WHERE register_name = 'D40';  -- Ajuste conforme seu contador
```

3. **Data Collector foi reiniciado?**
   - Parar (Ctrl+C)
   - Iniciar novamente
   - Verificar logs

---

### ❌ Apontamentos criados para D33 (Tempo)

**Causa:** D33 está configurado como `PRODUCTION_COUNTER`

**Solução:**
```sql
UPDATE plc_registers
SET register_purpose = 'CYCLE_TIME'
WHERE register_name = 'D33';
```

---

### ❌ Nenhum apontamento é criado

**Verificar:**

1. **Existe registro com `PRODUCTION_COUNTER`?**
```sql
SELECT * FROM plc_registers 
WHERE register_purpose = 'PRODUCTION_COUNTER' 
AND enabled = true;
```

2. **Se não existir, criar/atualizar:**
```sql
-- Atualizar D40 como contador
UPDATE plc_registers
SET register_purpose = 'PRODUCTION_COUNTER'
WHERE register_name = 'D40';

-- OU criar novo
INSERT INTO plc_registers (
  plc_config_id, 
  register_name, 
  register_address, 
  description,
  register_purpose,
  enabled
) VALUES (
  1,  -- ID do seu PLC
  'D40',
  40,
  'Contador de Peças Produzidas',
  'PRODUCTION_COUNTER',
  true
);
```

---

## 📚 Documentação Relacionada

- **Tabelas do Sistema:** `TABELAS_APONTAMENTOS_ATIVIDADES.md`
- **Apontamento Automático:** `SOLUCAO_APONTAMENTO_AUTOMATICO_IMPLEMENTADA.md`
- **Senha PostgreSQL:** `SENHA_POSTGRES.txt`

---

## 🎓 Boas Práticas

### ✅ Nomenclatura Clara:

```
✅ BOM:
- "D33" → "Tempo de Ciclo (ms)"
- "D40" → "Contador de Peças Produzidas"
- "D41" → "Temperatura do Molde (°C)"

❌ EVITAR:
- "D33" → "Registro 33"
- "D40" → "Contador"
- "D41" → "Temp"
```

### ✅ Um Contador por CLP:

- Apenas **UM** registro deve ser `PRODUCTION_COUNTER` por CLP
- Se tiver múltiplos contadores, criar lógica específica

### ✅ Documentar no Banco:

```sql
-- Adicionar comentário na tabela
COMMENT ON COLUMN plc_registers.register_purpose IS 
'Propósito: PRODUCTION_COUNTER (gera apontamentos), CYCLE_TIME (monitoramento), TEMPERATURE, PRESSURE, OTHER';
```

---

**Criado em:** 22/10/2024  
**Status:** ✅ Solução Implementada  
**Próximo Passo:** Aplicar migration e configurar registros

