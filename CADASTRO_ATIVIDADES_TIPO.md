# Cadastro de Atividades com Tipo

## 📋 Visão Geral

Implementado o campo **Tipo** (Produtiva/Improdutiva) no cadastro de Tipos de Atividade, com layout organizado por categorias, conforme solicitado.

---

## ✅ Alterações Implementadas

### 1. Campo Tipo Adicionado

#### Interface TypeScript
```typescript
interface ActivityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE';  // ✅ NOVO CAMPO
  color: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Tipos Disponíveis
- **PRODUCTIVE** (Produtiva) - Atividades que agregam valor à produção
- **UNPRODUCTIVE** (Improdutiva) - Paradas, manutenções, etc.

---

### 2. Layout Reorganizado

#### Antes
- Tabela única com todas as atividades misturadas
- Sem distinção visual entre tipos

#### Depois
```
┌────────────────────────────────────┐
│  Tipos de Atividade                │
│  [+ Novo Tipo]                     │
├────────────────────────────────────┤
│                                    │
│  Tipo: Produtiva                   │
│  ┌──────────────────────────────┐  │
│  │ Ação │ Descrição │ Status    │  │
│  ├──────────────────────────────┤  │
│  │[Edição]│PRODUÇÃO ATIVA│Ativo │  │
│  └──────────────────────────────┘  │
│                                    │
│  Tipo: Improdutiva                 │
│  ┌──────────────────────────────┐  │
│  │ Ação │ Descrição │ Status    │  │
│  ├──────────────────────────────┤  │
│  │[Edição]│FIM DE EXPEDIENTE│...│  │
│  │[Edição]│TROCA DE MOLDE│...   │  │
│  │[Edição]│HORÁRIO DE PICO│...  │  │
│  │  ...   │     ...      │ ...  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

### 3. Formulário de Cadastro

#### Campo Tipo no Formulário
```typescript
<TextField
  fullWidth
  required
  select
  label="Tipo"
  value={formData.type}
  onChange={handleChange('type')}
>
  <option value="PRODUCTIVE">Produtiva</option>
  <option value="UNPRODUCTIVE">Improdutiva</option>
</TextField>
```

#### Ordem dos Campos
1. **Tipo** (Produtiva/Improdutiva) - SELECT
2. **Código** - TextField
3. **Nome** - TextField
4. **Descrição** - TextArea
5. **Cor** - Color Picker
6. **Ativo** - Switch

---

### 4. Agrupamento Automático

#### Lógica de Separação
```typescript
// Filtrar por tipo
const productiveActivities = activityTypes.filter(
  a => a.type === 'PRODUCTIVE'
);
const unproductiveActivities = activityTypes.filter(
  a => a.type === 'UNPRODUCTIVE'
);
```

#### Renderização
- Seção "Tipo: Produtiva" exibe atividades PRODUCTIVE
- Seção "Tipo: Improdutiva" exibe atividades UNPRODUCTIVE
- Cada seção tem sua própria tabela independente

---

## 🎨 Layout das Tabelas

### Estrutura
```
| Ação (15%) | Descrição (45%) | Status (40%) |
|------------|-----------------|--------------|
| [Edição]   | PRODUÇÃO ATIVA  | [Ativo]      |
```

### Características
- **Coluna Ação**: Botão "Edição" com ícone
- **Coluna Descrição**: Nome da atividade em destaque
- **Coluna Status**: Chip colorido (Verde: Ativo / Cinza: Inativo)

---

## 📊 Tabelas Separadas

### Tipo: Produtiva
- Header: "Tipo: Produtiva" (H6, bold)
- Margin-bottom: 4 (espaçamento entre seções)
- Cor da seção: Success (verde)

### Tipo: Improdutiva  
- Header: "Tipo: Improdutiva" (H6, bold)
- Cor da seção: Warning (laranja)

---

## 🔧 Funcionalidades

### Criar Nova Atividade
1. Click em "Novo Tipo"
2. Selecionar tipo (Produtiva/Improdutiva)
3. Preencher código e nome
4. Preencher descrição (opcional)
5. Escolher cor (opcional)
6. Marcar como ativo/inativo
7. Salvar

### Editar Atividade
1. Click no botão "Edição" na linha da atividade
2. Alterar campos desejados
3. Salvar alterações

### Visualização
- Atividades agrupadas automaticamente por tipo
- Navegação clara entre seções
- Status visual com chips coloridos

---

## 🎯 Exemplos de Uso

### Atividades Produtivas
```
- PRODUÇÃO ATIVA
- SETUP CONCLUÍDO
- CICLO NORMAL
```

### Atividades Improdutivas
```
- FIM DE EXPEDIENTE
- TROCA DE MOLDE
- HORÁRIO DE PICO
- FALTA DE OPERADOR
- AJUSTE DE PROCESSO
- FALTA DE ENERGIA
- FIM DE PRODUÇÃO
- FALTA DE MATÉRIA PRIMA
- PROBLEMAS COM MATÉRIA PRIMA
- TRY OUT
- MANUTENÇÃO DE MÁQUINA
- MANUTENÇÃO DE MOLDE
- HORÁRIO DE REFEIÇÃO
```

---

## 📡 Integração com API

### Endpoint de Criação
```typescript
POST /api/activity-types
Body: {
  code: string;
  name: string;
  description: string | null;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE';  // ✅ NOVO
  color: string | null;
  active: boolean;
}
```

### Endpoint de Atualização
```typescript
PUT /api/activity-types/:id
Body: {
  code: string;
  name: string;
  description: string | null;
  type: 'PRODUCTIVE' | 'UNPRODUCTIVE';  // ✅ NOVO
  color: string | null;
  active: boolean;
}
```

### Endpoint de Listagem
```typescript
GET /api/activity-types
Response: ActivityType[]  // Inclui campo 'type'
```

---

## 🗄️ Banco de Dados

### Migration Necessária
```sql
-- Adicionar coluna type na tabela ActivityType
ALTER TABLE "ActivityType" 
ADD COLUMN "type" VARCHAR(20) NOT NULL DEFAULT 'UNPRODUCTIVE';

-- Adicionar constraint para valores válidos
ALTER TABLE "ActivityType" 
ADD CONSTRAINT "ActivityType_type_check" 
CHECK ("type" IN ('PRODUCTIVE', 'UNPRODUCTIVE'));

-- Opcional: Criar índice para melhor performance
CREATE INDEX "ActivityType_type_idx" 
ON "ActivityType"("type");
```

### Schema Prisma
```prisma
model ActivityType {
  id          Int      @id @default(autoincrement())
  code        String   @unique @db.VarChar(50)
  name        String   @db.VarChar(200)
  description String?  @db.VarChar(500)
  type        String   @db.VarChar(20)  // PRODUCTIVE ou UNPRODUCTIVE
  color       String?  @db.VarChar(7)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  downtimes   Downtime[]
  
  @@map("activity_types")
}
```

---

## ✅ Checklist de Implementação

### Frontend
- [x] Interface TypeScript atualizada
- [x] Campo tipo adicionado ao formulário
- [x] Layout reorganizado com seções separadas
- [x] Agrupamento automático por tipo
- [x] Função getTypeLabel implementada
- [x] Função getTypeColor implementada
- [x] Remoção de código não utilizado (DeleteIcon, handleDelete)
- [x] Tabelas separadas por tipo
- [x] Botão "Edição" estilizado
- [x] Zero erros de compilação

### Backend (Pendente)
- [ ] Migration para adicionar coluna type
- [ ] Atualizar schema Prisma
- [ ] Validação do campo type
- [ ] Atualizar endpoints para aceitar type
- [ ] Atualizar seed.ts com dados de exemplo

---

## 🎨 Estilos Aplicados

### Headers de Seção
```typescript
<Typography variant="h6" fontWeight="bold" mb={2}>
  Tipo: Produtiva
</Typography>
```

### Botão de Edição
```typescript
<Button
  variant="outlined"
  size="small"
  fullWidth
  startIcon={<EditIcon />}
  onClick={() => handleOpenDialog(activityType)}
>
  Edição
</Button>
```

### Chip de Status
```typescript
<Chip
  label={activityType.active ? 'Ativo' : 'Inativo'}
  color={activityType.active ? 'success' : 'default'}
  size="small"
/>
```

---

## 📏 Larguras das Colunas

| Coluna | Largura | Justificativa |
|--------|---------|---------------|
| Ação | 15% | Botão de edição fixo |
| Descrição | 45% | Campo mais importante |
| Status | 40% | Chip de status |

---

## 🚀 Como Usar

### Criar Atividade Produtiva
1. Click em "Novo Tipo"
2. Selecionar: **Produtiva**
3. Código: PROD_ATIVA
4. Nome: PRODUÇÃO ATIVA
5. Ativo: Sim
6. Salvar

### Criar Atividade Improdutiva
1. Click em "Novo Tipo"
2. Selecionar: **Improdutiva**
3. Código: TROCA_MOLDE
4. Nome: TROCA DE MOLDE
5. Descrição: Tempo gasto na troca de molde
6. Ativo: Sim
7. Salvar

---

## 🔍 Benefícios

### Organização
✅ Atividades separadas por categoria  
✅ Fácil visualização de produtivas vs improdutivas  
✅ Navegação intuitiva

### Usabilidade
✅ Menos scroll necessário  
✅ Informação mais clara  
✅ Layout limpo e profissional

### Manutenção
✅ Código organizado  
✅ Fácil adicionar novos tipos no futuro  
✅ Separação de responsabilidades clara

---

## 📝 Arquivos Modificados

1. ✅ `frontend/src/pages/ActivityTypes.tsx`
   - Adicionado campo type nas interfaces
   - Reorganizado layout com tabelas separadas
   - Implementado agrupamento por tipo
   - Adicionado select de tipo no formulário
   - Removido código não utilizado

---

## 🎯 Próximos Passos

### Backend
1. Criar migration para adicionar coluna type
2. Atualizar controllers para validar type
3. Atualizar validators
4. Adicionar dados de exemplo no seed

### Testes
1. Testar criação de atividade produtiva
2. Testar criação de atividade improdutiva
3. Testar edição de tipo existente
4. Verificar agrupamento correto

---

## 📊 Status

✅ **Frontend Implementado**  
⏳ **Backend Pendente** (migration + validação)  
✅ **Zero Erros de Compilação**  
✅ **Layout Conforme Solicitado**

---

**Data**: Outubro 2025  
**Status**: ✅ Frontend Completo

