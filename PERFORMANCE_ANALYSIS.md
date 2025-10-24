# 🔍 Análise de Performance do Banco de Dados e Código

## 📊 ÍNDICES FALTANDO NO SCHEMA

### ✅ Índices Críticos a Adicionar:

#### 1. **DefectSector**
```prisma
@@index([defectId])
@@index([sectorId])
```
**Motivo**: Consultas frequentes para buscar setores de um defeito e defeitos de um setor.

#### 2. **UserCompany**
```prisma
@@index([userId])
@@index([companyId])
```
**Motivo**: Consultas para listar empresas de um usuário e usuários de uma empresa.

#### 3. **PlcRegister**
```prisma
@@index([plcConfigId])
```
**Motivo**: Listar registros de um CLP específico.

#### 4. **ProductionDefect**
```prisma
@@index([defectId])
```
**Motivo**: Relatórios e consultas por tipo de defeito.

#### 5. **CycleChange**
```prisma
@@index([productionOrderId])
@@index([timestamp])
```
**Motivo**: Histórico de alterações por ordem e por período.

#### 6. **Downtime** (índices adicionais)
```prisma
@@index([activityTypeId])
@@index([defectId])
@@index([responsibleId])
@@index([startTime])
@@index([type])
```
**Motivo**: Queries frequentes por tipo de atividade, defeito, responsável, data e tipo de parada.

#### 7. **ProductionOrder** (índices adicionais)
```prisma
@@index([companyId])
@@index([itemId])
@@index([moldId])
@@index([plannedStartDate])
```
**Motivo**: Filtros comuns em relatórios e listagens.

#### 8. **User** (índices adicionais)
```prisma
@@index([role])
@@index([active])
```
**Motivo**: Filtros por perfil e status ativo.

#### 9. **Item**
```prisma
@@index([referenceTypeId])
```
**Motivo**: Listar itens por tipo de referência.

#### 10. **Mold**
```prisma
@@index([companyId])
```
**Motivo**: Listar moldes por empresa.

---

## 🚨 QUERIES N+1 IDENTIFICADAS

### Controllers que precisam de otimização:

1. **downtimeController.ts**
   - `listDowntimes`: OK ✅ (já usa includes)
   
2. **productionOrderController.ts**
   - Verificar se todos os endpoints usam includes apropriados
   
3. **reportsController.ts**
   - OK ✅ (usa includes completos para relatórios)

---

## 📄 PAGINAÇÃO FALTANDO

### Endpoints que precisam de paginação:

1. **GET /api/downtimes**
   - ⚠️ Sem paginação - pode retornar milhares de registros
   
2. **GET /api/production-orders**
   - ⚠️ Sem paginação - pode retornar milhares de registros
   
3. **GET /api/production-appointments**
   - ⚠️ Sem paginação - pode retornar milhares de registros
   
4. **GET /api/production-defects**
   - ⚠️ Sem paginação - pode retornar milhares de registros

5. **GET /api/plc-data**
   - ⚠️ Sem paginação - histórico pode ser enorme

---

## 🧹 LIMPEZA DE CÓDIGO NECESSÁRIA

### Backend:

1. **Imports não utilizados**
   - Verificar todos os controllers
   - Verificar todos os services
   
2. **Código comentado/morto**
   - Remover comentários desnecessários
   - Remover código não utilizado

3. **Duplicação de código**
   - Identificar funções repetidas
   - Criar utilitários compartilhados

### Frontend:

1. **Imports não utilizados**
   - Verificar todas as páginas
   - Verificar todos os componentes
   
2. **Console.logs**
   - Remover console.logs de debug
   - Manter apenas logs importantes

---

## 📈 ESTIMATIVA DE IMPACTO

### Performance esperada após otimizações:

- **Consultas no banco**: 40-60% mais rápidas com índices
- **Memória do servidor**: 30-50% redução com paginação
- **Tempo de resposta API**: 30-40% mais rápido
- **Tamanho do bundle frontend**: 5-10% menor após limpeza

---

## ⏱️ PRIORIDADES

### Alta Prioridade (Fazer Agora):
1. ✅ Adicionar índices críticos
2. ✅ Implementar paginação em endpoints principais
3. ✅ Otimizar queries N+1

### Média Prioridade (Fazer em Seguida):
4. ✅ Limpar imports não utilizados
5. ✅ Remover console.logs desnecessários

### Baixa Prioridade (Melhorias Futuras):
6. ⏳ Adicionar cache para consultas frequentes
7. ⏳ Implementar compressão de resposta HTTP
8. ⏳ Otimizar bundle splitting no frontend

---

## 🎯 EXECUÇÃO

Vou implementar as melhorias na seguinte ordem:
1. Schema do Prisma (índices)
2. Backend (paginação e queries)
3. Frontend (limpeza de código)
4. Gerar migration
5. Testar e validar

