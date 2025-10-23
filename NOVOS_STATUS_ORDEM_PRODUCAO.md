# 📊 Novos Status de Ordem de Produção

**Data:** 22 de Outubro de 2025  
**Versão:** 2.1.0

---

## 🎯 Resumo das Mudanças

Implementação de novos status para Ordens de Produção com validação de negócio para garantir que **apenas uma ordem possa estar em atividade por vez**.

---

## 📋 Novos Status

| Status | Nome | Descrição | Ícone | Cor |
|--------|------|-----------|-------|-----|
| `PROGRAMMING` | Programação | Ordem em fase de programação e planejamento | 📋 | Cinza |
| `ACTIVE` | Em Atividade | Ordem em execução (somente UMA por vez) | ▶️ | Verde |
| `PAUSED` | Pausada | Ordem pausada temporariamente | ⏸️ | Amarelo |
| `FINISHED` | Encerrada | Ordem finalizada com sucesso | ✅ | Azul |
| `CANCELLED` | Cancelada | Ordem cancelada | ❌ | Vermelho |

---

## 🔄 Mapeamento de Status Antigos

| Status Antigo | Status Novo |
|---------------|-------------|
| `PENDING` | `PROGRAMMING` |
| `IN_PROGRESS` | `ACTIVE` |
| `PAUSED` | `PAUSED` (mantido) |
| `COMPLETED` | `FINISHED` |
| `CANCELLED` | `CANCELLED` (mantido) |

---

## 🔒 Regras de Negócio

### 1. **Uma Ordem Ativa por Vez**
✅ **IMPORTANTE:** Apenas uma ordem pode ter o status `ACTIVE` por vez.

**Comportamento:**
- Ao tentar ativar uma ordem quando já existe outra ativa:
  ```json
  {
    "error": "Já existe uma ordem em atividade",
    "details": "A ordem OP-2024-001 está atualmente em atividade. Pause ou encerre-a antes de iniciar outra.",
    "activeOrderId": 1,
    "activeOrderNumber": "OP-2024-001"
  }
  ```

### 2. **Transições de Status Permitidas**

```
PROGRAMMING
  ├─> ACTIVE      ✅
  └─> CANCELLED   ✅

ACTIVE
  ├─> PAUSED      ✅
  ├─> FINISHED    ✅
  └─> CANCELLED   ✅

PAUSED
  ├─> ACTIVE      ✅
  └─> CANCELLED   ✅

FINISHED
  └─> (nenhuma transição permitida)

CANCELLED
  └─> (nenhuma transição permitida)
```

### 3. **Datas Automáticas**

- **`startDate`:** Definida automaticamente quando a ordem muda para `ACTIVE`
- **`endDate`:** Definida automaticamente quando a ordem muda para `FINISHED`

### 4. **Apontamentos de Produção**

- ✅ Apenas ordens com status `ACTIVE` podem receber apontamentos automáticos do Data Collector
- ❌ Ordens com outros status não aceitam apontamentos

---

## 🗄️ Migração do Banco de Dados

### Opção 1: Usando Prisma (Recomendado)

```bash
cd backend

# Gerar migração
npx prisma migrate dev --name novos_status_producao

# Ou aplicar diretamente (desenvolvimento)
npx prisma db push

# Regenerar o Prisma Client
npx prisma generate
```

### Opção 2: Executar SQL Manualmente

```bash
cd backend

# Conectar ao PostgreSQL
psql -U postgres -d mes

# Executar o script de migração
\i MIGRATION_PRODUCTION_STATUS.sql
```

### Verificação Pós-Migração

```sql
-- Verificar se os novos status foram aplicados
SELECT DISTINCT status FROM production_orders;

-- Verificar se há apenas uma ordem ativa (máximo)
SELECT COUNT(*) as ordens_ativas 
FROM production_orders 
WHERE status = 'ACTIVE';
-- Resultado esperado: 0 ou 1
```

---

## 💻 Uso no Frontend

### 1. **Importar os Utilitários**

```typescript
import {
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  canTransitionTo,
  getAvailableTransitions,
  PRODUCTION_STATUS_OPTIONS,
} from '../utils/productionStatus';
```

### 2. **Usar o Componente de Status**

```tsx
import ProductionStatusChip from '../components/ProductionStatusChip';

<ProductionStatusChip 
  status="ACTIVE" 
  showIcon={true}
  showTooltip={true}
/>
```

### 3. **Criar Select com Status Disponíveis**

```tsx
import { PRODUCTION_STATUS_OPTIONS } from '../utils/productionStatus';

<Select value={status} onChange={handleChange}>
  {PRODUCTION_STATUS_OPTIONS.map(option => (
    <MenuItem key={option.value} value={option.value}>
      {option.icon} {option.label}
    </MenuItem>
  ))}
</Select>
```

### 4. **Validar Transições**

```tsx
import { canTransitionTo, getAvailableTransitions } from '../utils/productionStatus';

// Verificar se pode mudar de PROGRAMMING para ACTIVE
if (canTransitionTo('PROGRAMMING', 'ACTIVE')) {
  // Permitir transição
}

// Obter status disponíveis
const availableStatuses = getAvailableTransitions('PROGRAMMING');
// Retorna: ['ACTIVE', 'CANCELLED']
```

---

## 🔧 Mudanças no Código

### Backend

#### 1. **Schema Prisma** (`backend/prisma/schema.prisma`)
```prisma
enum ProductionStatus {
  PROGRAMMING  // Programação
  ACTIVE       // Em Atividade (somente uma por vez)
  PAUSED       // Pausada
  FINISHED     // Encerrada
  CANCELLED    // Cancelada
}

model ProductionOrder {
  // ...
  status ProductionStatus @default(PROGRAMMING)
  // ...
}
```

#### 2. **Controller** (`backend/src/controllers/productionOrderController.ts`)
- ✅ Validação de ordem única ativa
- ✅ Definição automática de `startDate` e `endDate`

#### 3. **Data Collector** (`backend/src/controllers/dataCollectorController.ts`)
- ✅ Busca por `status = 'ACTIVE'` (ao invés de `IN_PROGRESS`)
- ✅ Validação de apontamentos apenas para ordens `ACTIVE`

### Frontend

#### Novos Arquivos:
- ✅ `frontend/src/utils/productionStatus.ts` - Utilitários e tipos
- ✅ `frontend/src/components/ProductionStatusChip.tsx` - Componente de chip

---

## 🧪 Como Testar

### 1. **Aplicar Migração**

```bash
cd backend
npx prisma db push
npx prisma generate
npm run dev
```

### 2. **Testar Validação de Ordem Única**

**Cenário 1: Ativar primeira ordem**
```bash
# PUT /api/production-orders/1
{
  "status": "ACTIVE"
}
# ✅ Sucesso
```

**Cenário 2: Tentar ativar segunda ordem**
```bash
# PUT /api/production-orders/2
{
  "status": "ACTIVE"
}
# ❌ Erro 400: "Já existe uma ordem em atividade"
```

**Cenário 3: Pausar ordem ativa e ativar outra**
```bash
# 1. Pausar ordem 1
PUT /api/production-orders/1
{
  "status": "PAUSED"
}
# ✅ Sucesso

# 2. Ativar ordem 2
PUT /api/production-orders/2
{
  "status": "ACTIVE"
}
# ✅ Sucesso (agora pode!)
```

### 3. **Testar Apontamentos**

```bash
# Com ordem ACTIVE - deve funcionar
POST /api/data-collector/production-appointments
{
  "productionOrderId": 1,
  "quantity": 10
}
# ✅ Sucesso

# Com ordem PAUSED - deve falhar
POST /api/data-collector/production-appointments
{
  "productionOrderId": 2,
  "quantity": 10
}
# ❌ Erro: "Ordem de produção não está em atividade"
```

### 4. **Testar Data Collector**

```bash
# Acionar sensor do CLP
# ✅ Data Collector deve:
#    1. Buscar ordens com status ACTIVE
#    2. Criar apontamento automático
#    3. Frontend atualizar em tempo real
```

---

## 📊 Exemplo de Fluxo Completo

```
1. Criar Ordem
   └─> Status: PROGRAMMING 📋

2. Iniciar Ordem
   └─> Status: ACTIVE ▶️
   └─> startDate: automaticamente definida
   └─> Data Collector começa a monitorar

3. Sensor acionado
   └─> Apontamento automático criado
   └─> producedQuantity atualizada

4. Pausar para Setup
   └─> Status: PAUSED ⏸️
   └─> Apontamentos pausados

5. Retomar Produção
   └─> Status: ACTIVE ▶️
   └─> Apontamentos retomados

6. Finalizar Ordem
   └─> Status: FINISHED ✅
   └─> endDate: automaticamente definida
   └─> Apontamentos bloqueados
```

---

## 🚨 Troubleshooting

### Erro: "Already exists"
```
Error: Type "ProductionStatus" already exists
```
**Solução:**
```bash
npx prisma migrate reset
npx prisma db push
npx prisma generate
```

### Frontend mostra status antigos
**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+R)
2. Verificar se o frontend foi recompilado

### Data Collector não encontra ordens
**Solução:**
1. Verificar se a ordem está com status `ACTIVE` (não mais `IN_PROGRESS`)
2. Reiniciar o Data Collector:
   ```bash
   cd data-collector
   npm run build
   npm start
   ```

---

## 📈 Benefícios

✅ **Controle mais preciso** do fluxo de produção  
✅ **Evita conflitos** de múltiplas ordens ativas  
✅ **Melhor rastreabilidade** com datas automáticas  
✅ **Interface mais intuitiva** com status em português  
✅ **Validação de negócio** no backend

---

## 🔄 Compatibilidade

| Componente | Versão Mínima | Status |
|------------|---------------|--------|
| Backend | 1.0.0 | ✅ Atualizado |
| Frontend | 1.0.0 | ✅ Atualizado |
| Data Collector | 1.0.0 | ✅ Atualizado |
| PostgreSQL | 12+ | ✅ Compatível |

---

## 📝 Próximos Passos

1. ✅ Aplicar migração no banco de dados
2. ✅ Reiniciar backend
3. ✅ Atualizar páginas do frontend que exibem status
4. ✅ Testar fluxo completo de produção
5. ✅ Documentar para usuários finais

---

**🎉 Implementação concluída!**

Para dúvidas ou suporte, consulte a documentação ou abra uma issue no repositório.

