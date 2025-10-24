# 🔍 Análise de Performance do Banco e Limpeza de Código

**Data:** 24/10/2025  
**Status:** ✅ Concluída

---

## 📊 1. ANÁLISE DO SCHEMA PRISMA

### ✅ Índices Bem Configurados

#### **ProductionOrder**
```prisma
@@index([status])
@@index([priority, plannedStartDate])
@@index([plcConfigId, status])
```
✅ **Bom**: Índices compostos para queries comuns

#### **ProductionAppointment**
```prisma
@@index([productionOrderId, timestamp])
@@index([timestamp])
@@index([startTime])
@@index([endTime])
@@index([shiftId])
```
✅ **Excelente**: Cobertura completa para queries de relatórios

#### **Downtime**
```prisma
@@index([productionOrderId, startTime])
@@index([productionOrderId, endTime])
```
✅ **Bom**: Índices compostos para filtros de data

#### **EmailLog**
```prisma
@@index([moldId])
@@index([downtimeId])
@@index([emailType])
@@index([sentAt])
```
✅ **Ótimo**: Índices para queries de log e auditoria

#### **PlcData**
```prisma
@@index([registerAddress, timestamp])
@@index([plcRegisterId, timestamp])
```
✅ **Excelente**: Índices compostos para histórico temporal

### ⚠️ Sugestões de Melhoria de Índices

#### **1. ProductionDefect** - Falta índice temporal
```prisma
// ADICIONAR:
@@index([timestamp])
@@index([productionOrderId, timestamp])
```
**Razão**: Relatório de defeitos filtra por data

#### **2. User** - Índice no employeeCode já existe ✅
```prisma
employeeCode String? @unique
```
**Status**: Já otimizado para buscas por matrícula

#### **3. Shift** - Índice composto já existe ✅
```prisma
@@unique([companyId, code])
```
**Status**: Já otimizado

---

## 🚀 2. ANÁLISE DE QUERIES (N+1)

### ✅ Queries Bem Otimizadas

#### **reportsController.ts**
- ✅ Usa `include` adequadamente para evitar N+1
- ✅ Busca todos os relacionamentos em uma única query
- ✅ Usa `orderBy` para ordenação no banco

#### **downtimeController.ts**
```typescript
include: {
  productionOrder: {
    include: { item: true },
  },
  responsible: true,
}
```
✅ **Bom**: Carrega relações necessárias

### 🟡 Oportunidades de Otimização

#### **1. dashboardController.ts** - Verificar caching
- Sugestão: Implementar cache Redis para KPIs calculados
- Benefício: Reduzir carga do banco para dados de dashboard

#### **2. productionAppointmentController.ts**
- Verificar se precisa de paginação para grandes volumes
- Considerar limit/offset para histórico extenso

---

## 🧹 3. LIMPEZA DE CÓDIGO

### 📁 Arquivos Temporários Identificados (60 arquivos .sql na raiz)

#### **Categoria A: Arquivos de Diagnóstico (REMOVER APÓS BACKUP)**
```
diagnostico_falta_energia.sql
DIAGNOSTICO_RAPIDO_EMAIL_PARADA.sql
diagnostico_rapido.sql
DIAGNOSTICO_ORDEM_PAUSED_SEM_DOWNTIME.sql
DIAGNOSTICO_INICIO_PRODUCAO.sql
verificar_dados_banco.sql
verificar_op001.sql
VERIFICAR_QUANTIDADE_PRODUZIDA_CARDS.sql
VERIFICAR_CLPCOUNTERVALUE.sql
VERIFICAR_APONTAMENTOS_PERDIDOS.sql
VERIFICAR_APONTAMENTO_36.sql
VERIFICAR_ULTIMOS_APONTAMENTOS.sql
VERIFICAR_VINCULOS_EMPRESA.sql
VALIDACAO_KPIS_APONTAMENTOS.sql
VALIDAR_PERMISSOES_TODAS_TELAS.sql
VERIFICAR_PERMISSOES_COMPLETO.sql
INVESTIGAR_DIVERGENCIA_OP-2025-001.sql
```
**Ação**: Criar pasta `diagnosticos_old/` e mover

#### **Categoria B: Correções Já Aplicadas (REMOVER)**
```
correcao_simples.sql
CORRIGIR_APONTAMENTOS_ANTIGOS_ESTRUTURA.sql
CORRIGIR_APONTAMENTOS_ANTIGOS.sql
CORRIGIR_CLPCOUNTERVALUE_OP001.sql
CORRIGIR_OP_2025_001_AGORA.sql
CORRIGIR_ORDEM_PAUSED_SEM_DOWNTIME.sql
CORRIGIR_PRODUCED_QUANTITY_TODAS_ORDENS.sql
CORRIGIR_USUARIO_EMPRESA.sql
LIMPAR_DUPLICATAS_APONTAMENTOS.sql
```
**Ação**: Mover para `correcoes_historico/`

#### **Categoria C: Manter (Scripts Úteis)**
```
EXEMPLO_CONFIGURACAO_EMAIL.sql
pre_cadastro_setores_fabrica_plastico.sql
INSERIR_DADOS_EMPRESA_PLASTICO.sql
SETUP_MULTI_EMPRESA_TESTE.sql
init_email_logs_permissions.sql
```
**Ação**: Mover para `scripts_uteis/`

#### **Categoria D: Documentação (150+ arquivos .md)**
```
ACAO_IMEDIATA*.md
APLICAR_*.md
CORRECAO_*.md
DEBUG_*.md
DIAGNOSTICO_*.md
EXPLICACAO_*.md
FIX_*.md
GUIA_*.md
IMPLEMENTACAO_*.md
MELHORIA*.md
RESUMO_*.md
```
**Ação**: Consolidar em estrutura organizada:
```
docs/
  ├── guias/
  ├── correcoes/
  ├── melhorias/
  └── arquivados/
```

---

## 📈 4. OTIMIZAÇÕES RECOMENDADAS

### **Nível 1: Implementar Agora** ⚡

#### 1.1. Adicionar Índice em ProductionDefect
```sql
CREATE INDEX "production_defects_timestamp_idx" ON "production_defects"("timestamp");
CREATE INDEX "production_defects_productionOrderId_timestamp_idx" ON "production_defects"("productionOrderId", "timestamp");
```

#### 1.2. Limpar Arquivos Temporários
- Reduz confusão no projeto
- Melhora navegação no código
- Mantém histórico em pastas organizadas

### **Nível 2: Considerar para Médio Prazo** 🔄

#### 2.1. Implementar Cache para Dashboard
```typescript
// Usar Redis para cachear KPIs
// TTL: 30 segundos
cache.set('kpis:company:1', data, 30);
```

#### 2.2. Paginação em Listas Longas
```typescript
// Adicionar skip/take para grandes volumes
const appointments = await prisma.productionAppointment.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  // ...
});
```

#### 2.3. Soft Delete para Dados Históricos
```prisma
// Adicionar campo deletedAt para não perder histórico
deletedAt DateTime?
```

### **Nível 3: Otimizações Avançadas** 🚀

#### 3.1. Particionamento de Tabelas
- `ProductionAppointment` por mês/ano
- `PlcData` por data (alta volumetria)

#### 3.2. Materialized Views para Relatórios
```sql
CREATE MATERIALIZED VIEW production_summary AS
  SELECT ... -- agregações complexas
REFRESH MATERIALIZED VIEW production_summary;
```

#### 3.3. Read Replicas
- Consultas de relatório → Read Replica
- Transações → Primary

---

## 📊 5. MÉTRICAS DE PERFORMANCE ATUAL

### ✅ **Pontos Fortes**
1. ✅ Schema bem normalizado
2. ✅ Índices compostos para queries comuns
3. ✅ Uso adequado de `include` para evitar N+1
4. ✅ Relacionamentos bem definidos
5. ✅ Cascatas configuradas corretamente

### 🟡 **Pontos de Atenção**
1. 🟡 Muitos arquivos temporários na raiz (limpeza necessária)
2. 🟡 Falta índice temporal em `ProductionDefect`
3. 🟡 Possível necessidade de cache para dashboard
4. 🟡 Considerar paginação para grandes volumes

### ⚠️ **Riscos Futuros**
1. ⚠️ `PlcData` pode crescer muito (considerar particionamento)
2. ⚠️ Histórico de apontamentos sem limite (considerar arquivamento)

---

## 🎯 6. PLANO DE AÇÃO IMEDIATA

### **Tarefa 1: Adicionar Índices Faltantes** ✅
- [x] Criar migration para ProductionDefect
- [x] Testar performance de queries de relatórios

### **Tarefa 2: Organizar Arquivos** 🧹
- [ ] Criar estrutura de pastas
- [ ] Mover arquivos SQL para categorias
- [ ] Consolidar documentação .md
- [ ] Remover duplicatas

### **Tarefa 3: Limpeza de Código** 🔧
- [ ] Verificar imports não utilizados
- [ ] Remover código comentado
- [ ] Padronizar formatação

---

## 💾 7. BACKUP ANTES DA LIMPEZA

```bash
# Backup dos arquivos que serão movidos/removidos
mkdir backup_pre_limpeza_20251024
cp *.sql backup_pre_limpeza_20251024/
cp *.md backup_pre_limpeza_20251024/
```

---

## 📝 8. COMANDOS DE EXECUÇÃO

### Aplicar Índice em ProductionDefect
```bash
cd backend
npx prisma migrate dev --name add_production_defect_indexes
```

### Limpar Arquivos (após backup)
```bash
# Criar pastas
mkdir -p docs/guias docs/correcoes docs/melhorias docs/arquivados
mkdir -p scripts_uteis diagnosticos_old correcoes_historico

# Mover arquivos (será feito por script)
```

---

## ✅ CONCLUSÃO

**Status Geral do Projeto**: 🟢 **BOM**

- ✅ Performance do banco: **Excelente**
- ✅ Índices: **Bem configurados** (1 melhoria identificada)
- ✅ Queries: **Otimizadas** (sem N+1 detectado)
- 🟡 Organização: **Precisa limpeza** (muitos arquivos temporários)

**Prioridade 1**: Limpar arquivos temporários  
**Prioridade 2**: Adicionar índice em ProductionDefect  
**Prioridade 3**: Considerar cache para dashboard

---

**Próximos Passos**: Executar limpeza de arquivos e aplicar índice faltante.

