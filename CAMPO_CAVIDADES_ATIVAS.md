# Campo Cavidades Ativas - Implementação Completa

## Resumo
Foi adicionado o campo **Cavidades Ativas** no cadastro de moldes, que permite especificar quantas cavidades estão funcionais para produção, mesmo que o molde tenha mais cavidades no total.

## Exemplo de Uso
- **Molde com 10 cavidades totais**: mas apenas **4 cavidades estão boas** para injeção
- O sistema agora usa as **4 cavidades ativas** nos apontamentos automáticos de produção

---

## Alterações Realizadas

### 1. **Backend - Banco de Dados**

#### Schema Prisma (`backend/prisma/schema.prisma`)
- ✅ Adicionado campo `activeCavities Int?` no modelo `Mold`

#### Migration
- ✅ Criado arquivo de migration: `backend/add_active_cavities.sql`
- ⚠️ **IMPORTANTE**: Execute este SQL manualmente no banco de dados:

```sql
-- Adiciona campo activeCavities na tabela molds
ALTER TABLE "molds" ADD COLUMN IF NOT EXISTS "activeCavities" INTEGER;

-- Atualiza valores existentes para usar o mesmo número de cavidades totais
UPDATE "molds" SET "activeCavities" = "cavities" WHERE "activeCavities" IS NULL;
```

### 2. **Backend - API**

#### Validação (`backend/src/validators/moldValidator.ts`)
- ✅ Adicionado campo `activeCavities` nos schemas de criação e atualização
- ✅ Validação: cavidades ativas não pode ser maior que o total de cavidades

#### Controller (`backend/src/controllers/moldController.ts`)
- ✅ Atualizado `createMold` para aceitar e salvar `activeCavities`
- ✅ Se não informado, usa o valor de `cavities` como padrão

#### Data Collector (`backend/src/controllers/dataCollectorController.ts`)
- ✅ **Uso prioritário de activeCavities**: 
  - Quando retorna ordens ativas para o data-collector, usa `activeCavities` se disponível
  - Caso contrário, usa `cavities` (compatibilidade com moldes antigos)

```typescript
moldCavities: order.mold?.activeCavities || order.mold?.cavities || null
```

### 3. **Frontend - Interface**

#### Tipos (`frontend/src/types/index.ts`)
- ✅ Adicionado campo `activeCavities?: number` na interface `Mold`

#### Página de Moldes (`frontend/src/pages/Molds.tsx`)
- ✅ Adicionado campo no formulário: **"Cavidades Ativas (Funcionais)"**
- ✅ Validação: não pode ser maior que o total de cavidades
- ✅ Helper text explicativo: "Número de cavidades em bom estado para produção"
- ✅ Nova coluna na tabela: **"Cav. Ativas"**
- ✅ Indicador visual (Chip amarelo) quando cavidades ativas < cavidades totais

---

## Como Aplicar as Mudanças

### Passo 1: Atualizar o Banco de Dados
Execute o SQL manualmente no PostgreSQL:

```bash
# Opção 1: Via psql (ajuste a senha se necessário)
psql -U postgres -d mes_db -f backend/add_active_cavities.sql

# Opção 2: Copie e execute o SQL direto no pgAdmin ou DBeaver
```

### Passo 2: Reiniciar o Backend
```bash
cd backend
npm run dev
```

### Passo 3: Reiniciar o Frontend
```bash
cd frontend
npm start
```

### Passo 4: Reiniciar o Data Collector (se estiver em uso)
```bash
cd data-collector
npm run dev
```

---

## Como Usar

### Cadastro de Molde
1. Acesse **Moldes** no menu
2. Clique em **Novo Molde** ou edite um existente
3. Preencha:
   - **Número Total de Cavidades**: Total de cavidades do molde (ex: 10)
   - **Cavidades Ativas**: Cavidades funcionais (ex: 4)
4. Salve

### Apontamento Automático
- O sistema agora usa **Cavidades Ativas** nos cálculos de produção
- Se um molde tem 10 cavidades mas apenas 4 estão ativas, os apontamentos usarão 4

### Compatibilidade
- ✅ Moldes antigos sem `activeCavities` continuam funcionando normalmente
- ✅ Sistema usa `cavities` quando `activeCavities` não está definido

---

## Arquivos Modificados

### Backend
- `backend/prisma/schema.prisma`
- `backend/add_active_cavities.sql` (novo)
- `backend/src/validators/moldValidator.ts`
- `backend/src/controllers/moldController.ts`
- `backend/src/controllers/dataCollectorController.ts`

### Frontend
- `frontend/src/types/index.ts`
- `frontend/src/pages/Molds.tsx`

---

## Notas Importantes

⚠️ **Migration Manual**: A migration precisa ser aplicada manualmente no banco de dados antes de reiniciar os serviços.

✅ **Retrocompatibilidade**: Todos os moldes existentes terão `activeCavities` = `cavities` após a migration, mantendo o comportamento atual.

✅ **Validação Automática**: O sistema valida que cavidades ativas não pode ser maior que o total de cavidades.

