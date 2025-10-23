# 📊 Tabelas de Apontamentos e Atividades de Produção

## 🎯 Tabelas Principais

### 1️⃣ **`production_appointments`** - Apontamentos de Produção
**Tabela no Banco:** `production_appointments`  
**Model Prisma:** `ProductionAppointment`

Armazena todos os **apontamentos de produção** (quantidade produzida):

```sql
CREATE TABLE production_appointments (
    id                  SERIAL PRIMARY KEY,
    production_order_id INTEGER NOT NULL,        -- Ordem de produção
    user_id             INTEGER NOT NULL,        -- Usuário que fez o apontamento
    quantity            INTEGER NOT NULL,        -- Quantidade produzida
    rejected_quantity   INTEGER DEFAULT 0,       -- Quantidade rejeitada
    timestamp           TIMESTAMP DEFAULT NOW(), -- Momento do apontamento
    automatic           BOOLEAN DEFAULT FALSE,   -- Se foi automático (via CLP)
    clp_counter_value   INTEGER,                 -- Valor do contador do CLP
    notes               TEXT,                    -- Observações
    created_at          TIMESTAMP DEFAULT NOW()
);
```

**Campos Importantes:**
- `production_order_id` - Link para ordem de produção
- `quantity` - Quantidade de peças produzidas neste apontamento
- `automatic` - `true` se veio do Data Collector, `false` se foi manual
- `clp_counter_value` - Valor do contador do CLP no momento
- `timestamp` - Quando a produção foi registrada

---

### 2️⃣ **`downtimes`** - Paradas/Atividades (Produtivas e Improdutivas)
**Tabela no Banco:** `downtimes`  
**Model Prisma:** `Downtime`

Armazena todas as **paradas e atividades** durante a produção:

```sql
CREATE TABLE downtimes (
    id                  SERIAL PRIMARY KEY,
    production_order_id INTEGER,              -- Ordem de produção (opcional)
    activity_type_id    INTEGER,              -- Tipo de atividade
    type                VARCHAR NOT NULL,     -- PRODUCTIVE, UNPRODUCTIVE, PLANNED
    reason              TEXT NOT NULL,        -- Motivo da parada
    description         TEXT,                 -- Descrição detalhada
    responsible_id      INTEGER,              -- Responsável
    start_time          TIMESTAMP NOT NULL,   -- Início da parada
    end_time            TIMESTAMP,            -- Fim da parada (null se ainda ativa)
    duration            INTEGER,              -- Duração em segundos
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

**Tipos de Atividade (DowntimeType):**
- `PRODUCTIVE` - Atividades produtivas (setup, troca de molde, ajustes)
- `UNPRODUCTIVE` - Paradas improdutivas (quebra, falta de material, falta de operador)
- `PLANNED` - Paradas planejadas (manutenção preventiva, reuniões)

**Campos Importantes:**
- `activity_type_id` - Link para `activity_types` (tipo específico da atividade)
- `type` - Categoria geral da parada
- `start_time` / `end_time` - Período da atividade
- `duration` - Calculado automaticamente (endTime - startTime)

---

### 3️⃣ **`activity_types`** - Tipos de Atividades
**Tabela no Banco:** `activity_types`  
**Model Prisma:** `ActivityType`

Define os **tipos de atividades/paradas** que podem ocorrer:

```sql
CREATE TABLE activity_types (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR UNIQUE NOT NULL,  -- Código único (ex: "SETUP", "QUEBRA")
    name        VARCHAR NOT NULL,         -- Nome (ex: "Setup de Máquina")
    description TEXT,                     -- Descrição detalhada
    type        VARCHAR DEFAULT 'UNPRODUCTIVE', -- PRODUCTIVE ou UNPRODUCTIVE
    color       VARCHAR,                  -- Cor em hex para UI (#FF0000)
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

**Exemplos de Tipos de Atividade:**
- **PRODUTIVAS:** Setup, Troca de Molde, Ajustes, Limpeza Programada
- **IMPRODUTIVAS:** Quebra de Máquina, Falta de Material, Falta de Operador, Manutenção Corretiva

---

### 4️⃣ **`production_defects`** - Defeitos de Produção
**Tabela no Banco:** `production_defects`  
**Model Prisma:** `ProductionDefect`

Registra **defeitos encontrados** durante a produção:

```sql
CREATE TABLE production_defects (
    id                  SERIAL PRIMARY KEY,
    production_order_id INTEGER NOT NULL,     -- Ordem de produção
    defect_id           INTEGER NOT NULL,     -- Tipo de defeito
    quantity            INTEGER NOT NULL,     -- Quantidade com defeito
    timestamp           TIMESTAMP DEFAULT NOW(),
    notes               TEXT,                 -- Observações
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

### 5️⃣ **`cycle_changes`** - Mudanças de Tempo de Ciclo
**Tabela no Banco:** `cycle_changes`  
**Model Prisma:** `CycleChange`

Registra **alterações no tempo de ciclo** durante a produção:

```sql
CREATE TABLE cycle_changes (
    id                  SERIAL PRIMARY KEY,
    production_order_id INTEGER NOT NULL,     -- Ordem de produção
    previous_cycle      FLOAT,                -- Ciclo anterior (segundos)
    new_cycle           FLOAT NOT NULL,       -- Novo ciclo (segundos)
    reason              TEXT NOT NULL,        -- Motivo da alteração
    user_id             INTEGER,              -- Quem alterou
    timestamp           TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

### 6️⃣ **`plc_data`** - Dados Históricos do CLP
**Tabela no Banco:** `plc_data`  
**Model Prisma:** `PlcData`

Armazena **histórico de leituras** do CLP/PLC:

```sql
CREATE TABLE plc_data (
    id               SERIAL PRIMARY KEY,
    plc_register_id  INTEGER,              -- Registro do CLP
    register_address INTEGER NOT NULL,     -- Endereço (ex: 33 para D33)
    register_name    VARCHAR,              -- Nome (ex: "D33")
    value            INTEGER NOT NULL,     -- Valor lido
    timestamp        TIMESTAMP DEFAULT NOW(),
    connected        BOOLEAN DEFAULT TRUE, -- Se estava conectado
    error_message    TEXT                  -- Mensagem de erro (se houver)
);
```

---

## 🔗 Relacionamentos

```
production_orders (Ordem de Produção)
    ├── production_appointments (1:N) → Apontamentos de produção
    ├── downtimes (1:N)              → Paradas/Atividades
    ├── production_defects (1:N)     → Defeitos encontrados
    └── cycle_changes (1:N)          → Mudanças de ciclo

activity_types (Tipos de Atividade)
    └── downtimes (1:N)              → Paradas registradas

defects (Catálogo de Defeitos)
    └── production_defects (1:N)     → Defeitos registrados

plc_configs (Configuração CLP)
    └── plc_registers (1:N)          → Registros configurados
        └── plc_data (1:N)           → Histórico de leituras
```

---

## 📈 Fluxo de Dados

### Apontamento de Produção (Manual ou Automático)

```
1. Operador ou Data Collector registra produção
2. Grava em: production_appointments
   - production_order_id
   - quantity (quantidade produzida)
   - automatic (true/false)
   - timestamp
3. Atualiza production_orders.produced_quantity += quantity
```

### Registro de Parada/Atividade

```
1. Operador inicia uma atividade/parada
2. Grava em: downtimes
   - production_order_id
   - activity_type_id (tipo da atividade)
   - type (PRODUCTIVE/UNPRODUCTIVE/PLANNED)
   - start_time
   - end_time (null até finalizar)
3. Quando finaliza, atualiza end_time e calcula duration
```

### Apontamento de Defeito

```
1. Operador registra peças com defeito
2. Grava em: production_defects
   - production_order_id
   - defect_id
   - quantity (quantidade com defeito)
3. Atualiza production_orders.rejected_quantity += quantity
```

---

## 🔍 Consultas Úteis

### Ver apontamentos de uma ordem

```sql
SELECT 
    pa.id,
    pa.quantity,
    pa.rejected_quantity,
    pa.timestamp,
    pa.automatic,
    u.name as user_name
FROM production_appointments pa
JOIN users u ON pa.user_id = u.id
WHERE pa.production_order_id = 1
ORDER BY pa.timestamp DESC;
```

### Ver atividades/paradas de uma ordem

```sql
SELECT 
    d.id,
    d.type,
    d.reason,
    at.name as activity_type,
    d.start_time,
    d.end_time,
    d.duration,
    u.name as responsible
FROM downtimes d
LEFT JOIN activity_types at ON d.activity_type_id = at.id
LEFT JOIN users u ON d.responsible_id = u.id
WHERE d.production_order_id = 1
ORDER BY d.start_time DESC;
```

### Ver defeitos de uma ordem

```sql
SELECT 
    pd.quantity,
    pd.timestamp,
    d.name as defect_name,
    d.severity
FROM production_defects pd
JOIN defects d ON pd.defect_id = d.id
WHERE pd.production_order_id = 1
ORDER BY pd.timestamp DESC;
```

### Ver leituras do CLP

```sql
SELECT 
    plc.register_name,
    plc.value,
    plc.timestamp,
    plc.connected
FROM plc_data plc
WHERE plc.register_address = 33
ORDER BY plc.timestamp DESC
LIMIT 100;
```

---

## 📋 Resumo

| Tabela | Função | Frequência de Gravação |
|--------|--------|------------------------|
| `production_appointments` | Produção registrada | A cada apontamento (manual ou automático) |
| `downtimes` | Paradas/Atividades | A cada início/fim de atividade |
| `production_defects` | Defeitos encontrados | Quando detectado defeito |
| `cycle_changes` | Mudanças de ciclo | Quando tempo de ciclo é alterado |
| `plc_data` | Dados do CLP | A cada leitura (1-5 segundos) |
| `activity_types` | Tipos de atividade | Raramente (só cadastro) |

---

## 🎯 Controllers Responsáveis

**Backend:**
- `productionController.ts` - Apontamentos de produção
- `downtimeController.ts` - Paradas/Atividades
- `productionDefectController.ts` - Defeitos
- `cycleChangeController.ts` - Mudanças de ciclo
- `dataCollectorController.ts` - Recebe dados do CLP

**Data Collector:**
- `ProductionMonitor.ts` - Monitora ordens ativas
- `PlcPoolManager.ts` - Lê dados dos CLPs
- `ApiClient.ts` - Envia apontamentos para backend

---

**Atualizado em:** 22/10/2024  
**Versão do Schema:** Prisma 5.22.0

