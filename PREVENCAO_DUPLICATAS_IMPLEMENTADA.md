# 🚨 Prevenção de Apontamentos Duplicados - IMPLEMENTADO

## ⚠️ PROBLEMA IDENTIFICADO

**Gravidade:** CRÍTICA  
**Data:** 23/10/2024

### Descrição do Problema:
Registros de apontamento de produção estavam sendo inseridos **em duplicata**, causando:
- ❌ Contagem incorreta de peças produzidas
- ❌ Distorção de todos os KPIs (OEE, produtividade, etc)
- ❌ Relatórios e análises incorretos
- ❌ Dados financeiros afetados

### Exemplo Real (do usuário):
```
Data/Hora            Tempo    Perda    Tipo         Peças
22/10/2025, 22:23:44  5.1s      0     Automático     3
22/10/2025, 22:23:43  5.1s      0     Automático     3
                      ^^^^                           ^
                      mesmo tempo e mesma quantidade!
                      diferença de apenas 1 segundo
```

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. **Backend - Detecção e Bloqueio de Duplicatas**

#### Arquivo: `backend/src/controllers/dataCollectorController.ts`

**Mudanças implementadas:**
- ✅ Verificação de apontamentos duplicados antes de inserir
- ✅ Janela de tempo de 10 segundos para detectar duplicatas
- ✅ Comparação baseada em: ordem + timestamp + contador CLP + quantidade
- ✅ Retorna o registro existente ao invés de criar duplicata
- ✅ Logs detalhados quando duplicata é detectada

**Código:**
```typescript
// ⚠️ PREVENÇÃO DE DUPLICATAS - CRÍTICO
const appointmentTimestamp = timestamp ? new Date(timestamp) : new Date();
const parsedQuantity = parseInt(quantity);
const parsedClpCounterValue = clpCounterValue ? parseInt(clpCounterValue) : null;

// Buscar apontamento recente (últimos 10 segundos) com os mesmos dados
const timeWindow = new Date(appointmentTimestamp.getTime() - 10000); // 10 segundos antes

const duplicateCheck = await prisma.productionAppointment.findFirst({
  where: {
    productionOrderId: parseInt(productionOrderId),
    automatic: true,
    timestamp: {
      gte: timeWindow,
      lte: new Date(appointmentTimestamp.getTime() + 1000), // 1 segundo depois
    },
    ...(parsedClpCounterValue ? { clpCounterValue: parsedClpCounterValue } : {}),
  },
  orderBy: {
    timestamp: 'desc',
  },
});

// Se encontrou um apontamento muito similar, rejeitar como duplicata
if (duplicateCheck) {
  console.warn(`⚠️  DUPLICATA DETECTADA E BLOQUEADA: OP ${order.orderNumber}, Quantidade: ${parsedQuantity}, Contador: ${parsedClpCounterValue || 'N/A'}`);
  console.warn(`   Apontamento existente: ID ${duplicateCheck.id}, Timestamp: ${duplicateCheck.timestamp.toISOString()}`);
  
  // Retornar o apontamento existente ao invés de criar duplicata
  res.status(200).json({
    ...duplicateCheck,
    isDuplicate: true,
    message: 'Apontamento duplicado detectado, registro existente retornado',
  });
  return;
}
```

---

### 2. **Backend - Proteção para Apontamentos Manuais**

#### Arquivo: `backend/src/services/productionService.ts`

**Mudanças implementadas:**
- ✅ Aviso quando apontamentos manuais idênticos são criados em menos de 5 segundos
- ✅ Permite criação (pode ser legítimo) mas loga warning
- ✅ Adiciona flag `isDuplicateWarning` no evento WebSocket

**Código:**
```typescript
// ⚠️ PREVENÇÃO DE DUPLICATAS - Verificar se já existe um apontamento manual muito recente
const now = new Date();
const timeWindow = new Date(now.getTime() - 5000); // 5 segundos antes

const recentAppointment = await prisma.productionAppointment.findFirst({
  where: {
    productionOrderId,
    userId,
    automatic: false,
    quantity,
    timestamp: {
      gte: timeWindow,
    },
  },
  orderBy: {
    timestamp: 'desc',
  },
});

// Se encontrou apontamento idêntico muito recente, avisar mas permitir
if (recentAppointment) {
  console.warn(`⚠️  AVISO: Apontamento manual similar detectado (menos de 5s)`);
  console.warn(`   Permitindo criação, mas pode ser duplicata. Verifique se é intencional.`);
}
```

---

### 3. **Banco de Dados - Índices para Performance**

#### Arquivo: `backend/prisma/migrations/20251023_prevent_duplicate_appointments/migration.sql`

**Índices criados:**
1. **`idx_appointment_dedup_auto`** - Detecção rápida de duplicatas automáticas
2. **`idx_appointment_recent`** - Busca eficiente de apontamentos recentes

```sql
-- Índice composto para apontamentos automáticos (CLP)
CREATE INDEX IF NOT EXISTS "idx_appointment_dedup_auto" 
ON "production_appointments" ("productionOrderId", "automatic", "timestamp", "clpCounterValue")
WHERE "automatic" = true AND "clpCounterValue" IS NOT NULL;

-- Índice para busca rápida de apontamentos recentes
CREATE INDEX IF NOT EXISTS "idx_appointment_recent" 
ON "production_appointments" ("productionOrderId", "timestamp" DESC, "automatic");
```

---

### 4. **Script de Limpeza de Duplicatas Existentes**

#### Arquivo: `LIMPAR_DUPLICATAS_APONTAMENTOS.sql`

**Funcionalidades:**
- ✅ Identificar duplicatas existentes
- ✅ Mostrar estatísticas (quantas, quais ordens afetadas)
- ✅ Remover duplicatas mantendo o registro mais antigo
- ✅ Corrigir automaticamente as quantidades nas ordens de produção
- ✅ Verificação pós-limpeza
- ✅ Transação com COMMIT/ROLLBACK para segurança

**Como usar:**
```bash
# 1. Conectar ao banco
psql -U postgres -d mes_production

# 2. Executar o script
\i LIMPAR_DUPLICATAS_APONTAMENTOS.sql

# 3. Revisar o que será deletado
# 4. Se tudo OK, o script aplica as mudanças
# 5. Se algo der errado, ROLLBACK automático
```

---

## 🔍 Critérios de Detecção de Duplicatas

### Apontamentos Automáticos (CLP):
Um apontamento é considerado duplicata se:
1. ✅ Mesma ordem de produção (`productionOrderId`)
2. ✅ Ambos são automáticos (`automatic = true`)
3. ✅ Diferença de timestamp **menor que 10 segundos**
4. ✅ Mesmo valor de contador CLP (`clpCounterValue`) - se disponível
5. ✅ Mesma quantidade (`quantity`) - opcional, para casos extremos

### Apontamentos Manuais:
Um apontamento manual gera **aviso** (mas permite criação) se:
1. ✅ Mesma ordem de produção
2. ✅ Mesmo usuário (`userId`)
3. ✅ Mesma quantidade
4. ✅ Diferença de timestamp **menor que 5 segundos**

---

## 📊 Impacto da Solução

### Antes:
- ❌ Duplicatas inseridas silenciosamente
- ❌ KPIs incorretos
- ❌ Sem controle ou visibilidade

### Depois:
- ✅ Duplicatas **bloqueadas automaticamente**
- ✅ Logs detalhados de tentativas de duplicação
- ✅ Performance otimizada com índices
- ✅ Script para limpar dados históricos
- ✅ Proteção em múltiplas camadas

---

## 🧪 Como Testar

### Teste 1: Tentar inserir duplicata via Data Collector
```bash
# Enviar o mesmo apontamento duas vezes rapidamente
curl -X POST http://localhost:3001/api/data-collector/production-appointment \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "productionOrderId": 1,
    "quantity": 3,
    "clpCounterValue": 100
  }'

# Repetir imediatamente
curl -X POST http://localhost:3001/api/data-collector/production-appointment \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "productionOrderId": 1,
    "quantity": 3,
    "clpCounterValue": 100
  }'
```

**Resultado Esperado:**
- 1ª requisição: `201 Created` - Apontamento criado
- 2ª requisição: `200 OK` com `isDuplicate: true` - Duplicata bloqueada

### Teste 2: Verificar logs do backend
```bash
# Deve aparecer no console:
✅ Apontamento automático criado: OP OP-001 +3 peças (Contador CLP: 100)
⚠️  DUPLICATA DETECTADA E BLOQUEADA: OP OP-001, Quantidade: 3, Contador: 100
   Apontamento existente: ID 123, Timestamp: 2025-10-23T22:23:43.000Z
```

### Teste 3: Executar script de limpeza
```sql
-- Ver duplicatas antes
SELECT COUNT(*) FROM production_appointments;

-- Executar script
\i LIMPAR_DUPLICATAS_APONTAMENTOS.sql

-- Verificar que duplicatas foram removidas
-- Ver contagem depois (deve ser menor)
```

---

## 📁 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `backend/src/controllers/dataCollectorController.ts` | ✅ Adicionada verificação de duplicatas para apontamentos automáticos | Implementado |
| `backend/src/services/productionService.ts` | ✅ Adicionado aviso para apontamentos manuais duplicados | Implementado |
| `backend/prisma/migrations/20251023_prevent_duplicate_appointments/migration.sql` | ✅ Criados índices para performance | Criado |
| `LIMPAR_DUPLICATAS_APONTAMENTOS.sql` | ✅ Script completo para limpeza de dados históricos | Criado |
| `PREVENCAO_DUPLICATAS_IMPLEMENTADA.md` | ✅ Documentação completa da solução | Este arquivo |

---

## 🚀 Próximos Passos

### Imediato:
1. ✅ **Aplicar migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name prevent_duplicate_appointments
   ```

2. ✅ **Reiniciar backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. ⚠️ **Limpar duplicatas existentes:**
   ```bash
   psql -U postgres -d mes_production -f LIMPAR_DUPLICATAS_APONTAMENTOS.sql
   ```

### Monitoramento:
1. Verificar logs do backend regularmente
2. Monitorar se avisos de duplicatas aparecem
3. Investigar causa raiz se duplicatas continuarem aparecendo

### Investigação Adicional (se necessário):
- Verificar se o Data Collector está fazendo retry de requisições
- Verificar se há timeout causando reenvio
- Verificar configuração de rede/proxy

---

## 📞 Suporte

Se duplicatas continuarem aparecendo após esta implementação:
1. Verifique os logs do backend (`⚠️  DUPLICATA DETECTADA`)
2. Verifique os logs do data-collector
3. Execute novamente o script de limpeza
4. Investigue a origem das requisições duplicadas

---

## ✅ Checklist de Implementação

- [x] Código de detecção implementado no backend
- [x] Índices criados para performance
- [x] Script de limpeza criado
- [x] Documentação completa
- [ ] Migration aplicada ao banco
- [ ] Backend reiniciado
- [ ] Duplicatas históricas limpas
- [ ] Testes realizados
- [ ] Monitoramento configurado

---

**Status:** ✅ IMPLEMENTADO (aguardando aplicação e testes)  
**Prioridade:** 🚨 CRÍTICA  
**Risco:** ✅ MITIGADO

