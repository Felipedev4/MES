# Vínculo de Turno com Colaboradores

## Visão Geral
Sistema de vínculo entre turnos de trabalho e colaboradores, permitindo definir o turno padrão de cada funcionário e facilitar a gestão de escalas e horários.

## Mudanças no Backend

### 1. Schema do Banco de Dados (Prisma)

#### Modelo User
```prisma
model User {
  // ... outros campos
  shiftId  Int? // Turno padrão do colaborador
  
  // Relações
  shift    Shift? @relation(fields: [shiftId], references: [id])
  
  @@index([shiftId])
}
```

#### Modelo Shift
```prisma
model Shift {
  // ... outros campos
  users    User[] // Colaboradores vinculados a este turno
}
```

### 2. Migration do Banco
**Arquivo**: `backend/prisma/migrations/20251024_add_user_shift/migration.sql`

```sql
-- Adicionar campo shiftId à tabela users
ALTER TABLE "users" ADD COLUMN "shiftId" INTEGER;

-- Adicionar índice para melhor performance
CREATE INDEX "users_shiftId_idx" ON "users"("shiftId");

-- Adicionar foreign key
ALTER TABLE "users" ADD CONSTRAINT "users_shiftId_fkey" 
  FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
```

**Características**:
- Campo opcional (pode ser NULL)
- ON DELETE SET NULL: Se turno for deletado, colaborador não é afetado
- Índice para queries mais rápidas

### 3. Controller de Usuários

#### Listar Usuários
```typescript
const users = await prisma.user.findMany({
  select: {
    // ... outros campos
    shiftId: true,
    shift: {
      select: {
        id: true,
        name: true,
        code: true,
        startTime: true,
        endTime: true,
      },
    },
  },
});
```

#### Criar Usuário
```typescript
const user = await prisma.user.create({
  data: {
    // ... outros campos
    shiftId: shiftId || null,
  },
  select: {
    // ... inclui informações do turno
    shift: { select: { /* ... */ } },
  },
});
```

#### Atualizar Usuário
```typescript
const updateData = {
  // ... outros campos
  shiftId: shiftId !== undefined ? (shiftId || null) : undefined,
};
```

**Lógica**:
- Se `shiftId` for enviado, atualiza (mesmo que seja vazio/null)
- Se `shiftId` não for enviado (undefined), não altera o valor atual

## Mudanças no Frontend

### 1. Interfaces TypeScript

```typescript
interface User {
  // ... outros campos
  shiftId?: number;
  shift?: {
    id: number;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
  };
}

interface UserFormData {
  // ... outros campos
  shiftId: number | '';
}

interface Shift {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
}
```

### 2. Estado e Carregamento

```typescript
const [shifts, setShifts] = useState<Shift[]>([]);

useEffect(() => {
  loadUsers();
  loadShifts(); // Carrega turnos disponíveis
}, []);

const loadShifts = async () => {
  const response = await api.get('/shifts');
  setShifts(response.data);
};
```

### 3. Formulário de Cadastro/Edição

**Campo Select de Turno**:
```tsx
<TextField
  fullWidth
  select
  label="Turno Padrão"
  value={formData.shiftId}
  onChange={handleChange('shiftId')}
  helperText="Turno em que o colaborador normalmente trabalha"
>
  <MenuItem value="">Sem turno definido</MenuItem>
  {shifts.map((shift) => (
    <MenuItem key={shift.id} value={shift.id}>
      {shift.name} ({shift.code}) - {shift.startTime} às {shift.endTime}
    </MenuItem>
  ))}
</TextField>
```

**Exemplo de Opções**:
- Sem turno definido
- 1º Turno (T1) - 06:00 às 14:00
- 2º Turno (T2) - 14:00 às 22:00
- 3º Turno (T3) - 22:00 às 06:00

### 4. Tabela de Colaboradores

**Nova Coluna**:
```tsx
<TableCell 
  sx={{ 
    fontWeight: 700, 
    display: { xs: 'none', lg: 'table-cell' } 
  }}
>
  Turno
</TableCell>
```

**Célula de Dados**:
```tsx
<TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
  {user.shift ? (
    <Chip
      label={`${user.shift.name} (${user.shift.code})`}
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 600,
        backgroundColor: alpha(theme.palette.info.main, 0.1),
        borderColor: theme.palette.info.main,
        color: theme.palette.info.main
      }}
    />
  ) : (
    <Typography variant="body2" color="text.secondary">
      -
    </Typography>
  )}
</TableCell>
```

**Estilo do Chip**:
- Cor: Azul (info)
- Fundo transparente com 10% de opacidade
- Borda sólida azul
- Texto em azul
- Exibe nome e código do turno

**Visibilidade**:
- Oculta em telas pequenas (xs, sm, md)
- Visível em telas grandes (lg, xl)

## Fluxos de Uso

### 1. Criar Novo Colaborador com Turno
1. Clicar em "Novo Colaborador"
2. Preencher dados pessoais e de contato
3. Selecionar turno no campo "Turno Padrão"
4. Salvar
5. Backend cria usuário com `shiftId`
6. Tabela exibe colaborador com chip do turno

### 2. Criar Colaborador Sem Turno
1. Clicar em "Novo Colaborador"
2. Preencher dados
3. Deixar "Sem turno definido" selecionado
4. Salvar
5. Backend cria usuário com `shiftId = null`
6. Tabela exibe "-" na coluna Turno

### 3. Editar Turno de Colaborador Existente
1. Clicar no ícone de edição
2. Alterar seleção no campo "Turno Padrão"
3. Salvar
4. Backend atualiza `shiftId`
5. Tabela atualiza e mostra novo turno

### 4. Remover Turno de Colaborador
1. Clicar no ícone de edição
2. Selecionar "Sem turno definido"
3. Salvar
4. Backend define `shiftId = null`
5. Tabela exibe "-"

## Benefícios

### 1. Gestão de Escalas
- Identificar facilmente quais colaboradores trabalham em cada turno
- Planejar distribuição de pessoal por período
- Equilibrar carga de trabalho entre turnos

### 2. Rastreabilidade
- Relacionar apontamentos de produção com o turno do colaborador
- Analisar produtividade por turno
- Gerar relatórios por período de trabalho

### 3. Organização
- Centralizar informação de horário de trabalho
- Evitar confusão sobre quando cada funcionário trabalha
- Facilitar comunicação interna

### 4. Relatórios (Futuro)
- Filtrar apontamentos por turno
- Comparar eficiência entre turnos
- Calcular custos por período

### 5. Automação
- Sugerir turno automaticamente em apontamentos manuais
- Validar horários de entrada/saída
- Alertas de inconsistência (ex: apontamento fora do turno)

## Integridade de Dados

### Foreign Key com SET NULL
```sql
ON DELETE SET NULL
```

**Comportamento**:
- Se um turno for deletado, colaboradores vinculados **não são afetados**
- O campo `shiftId` é automaticamente definido como `NULL`
- Colaboradores continuam ativos, apenas sem turno definido

**Exemplo**:
1. Turno "T1" tem 5 colaboradores vinculados
2. Turno "T1" é deletado
3. Os 5 colaboradores continuam cadastrados
4. Campo "Turno" deles mostra "-" (sem turno)

### Validação de Dados
- Campo opcional: Colaborador pode não ter turno
- Select sempre inclui opção "Sem turno definido"
- Backend aceita `null`, `undefined` ou número válido
- Frontend converte string vazia para `null` antes de enviar

## Queries Otimizadas

### Índice no Campo shiftId
```sql
CREATE INDEX "users_shiftId_idx" ON "users"("shiftId");
```

**Performance**:
- Queries por turno são mais rápidas
- Joins entre users e shifts são otimizados
- Contagens e agregações por turno melhoram

### Exemplo de Query Eficiente
```typescript
// Contar colaboradores por turno
const usersPerShift = await prisma.user.groupBy({
  by: ['shiftId'],
  _count: true,
  where: { active: true },
});
// Usa o índice users_shiftId_idx
```

## Compatibilidade

### Dados Existentes
- Colaboradores já cadastrados: `shiftId = NULL` por padrão
- Não afeta funcionalidades existentes
- Migração segura (apenas adiciona campo)

### Versões Anteriores
- Campo opcional: Sistema funciona sem turno definido
- Backward compatible: APIs antigas não precisam enviar `shiftId`
- Frontend antigo: Apenas não mostra coluna de turno

## Próximos Passos Sugeridos

### 1. Relatórios
- [ ] Adicionar filtro por turno nos relatórios de produção
- [ ] Gráfico de produtividade por turno
- [ ] Comparativo de eficiência entre turnos

### 2. Apontamentos
- [ ] Preencher automaticamente turno em apontamentos manuais
- [ ] Calcular turno com base no horário do apontamento
- [ ] Validar consistência entre horário e turno do colaborador

### 3. Dashboards
- [ ] Card mostrando distribuição de colaboradores por turno
- [ ] Indicador de turnos com falta de pessoal
- [ ] Lista de colaboradores online no turno atual

### 4. Notificações
- [ ] Alertar supervisor quando colaborador de turno diferente faz apontamento
- [ ] Lembrete de troca de turno
- [ ] Resumo diário por turno

## Testes Recomendados

### Backend
- [ ] Criar usuário com turno válido
- [ ] Criar usuário sem turno (shiftId = null)
- [ ] Atualizar turno de usuário existente
- [ ] Remover turno de usuário (definir como null)
- [ ] Deletar turno e verificar users (SET NULL)
- [ ] Listar usuários e verificar relação com shift

### Frontend
- [ ] Abrir formulário de novo usuário
- [ ] Verificar se campo "Turno Padrão" está presente
- [ ] Verificar se opções de turno são carregadas
- [ ] Criar usuário selecionando um turno
- [ ] Criar usuário sem selecionar turno
- [ ] Editar usuário e alterar turno
- [ ] Verificar se coluna "Turno" aparece na tabela (telas grandes)
- [ ] Verificar se Chip do turno é exibido corretamente

## Documentação Técnica

### Arquivos Modificados

**Backend**:
- `backend/prisma/schema.prisma` - Schema do banco
- `backend/prisma/migrations/20251024_add_user_shift/migration.sql` - Migration
- `backend/src/controllers/userController.ts` - CRUD de usuários

**Frontend**:
- `frontend/src/pages/Users.tsx` - Página de gerenciamento de colaboradores

### Dependências
Nenhuma nova dependência foi adicionada. Usa apenas:
- Prisma (já existente)
- Material-UI (já existente)
- React (já existente)

### Comandos SQL Importantes

**Listar colaboradores por turno**:
```sql
SELECT 
  s.name AS turno,
  COUNT(u.id) AS total_colaboradores
FROM shifts s
LEFT JOIN users u ON u."shiftId" = s.id
WHERE u.active = true
GROUP BY s.id, s.name
ORDER BY total_colaboradores DESC;
```

**Colaboradores sem turno definido**:
```sql
SELECT 
  id,
  name,
  "employeeCode",
  email
FROM users
WHERE "shiftId" IS NULL
  AND active = true;
```

**Verificar integridade**:
```sql
-- Deve retornar 0 (todos shiftId referem turnos válidos ou são NULL)
SELECT COUNT(*) 
FROM users u
WHERE u."shiftId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM shifts s WHERE s.id = u."shiftId"
  );
```

## Suporte e Manutenção

### Logs Relevantes
```
📋 Ao listar usuários: Inclui informações do turno
✅ Ao criar usuário: Valida shiftId se fornecido
🔄 Ao atualizar usuário: Permite alterar ou remover turno
🗑️ Ao deletar turno: Colaboradores mantêm cadastro (shiftId vira NULL)
```

### Troubleshooting

**Problema**: Turnos não aparecem no select
- **Causa**: API `/shifts` não retornou dados
- **Solução**: Verificar se há turnos cadastrados, verificar filtro por empresa

**Problema**: Erro ao salvar usuário com turno
- **Causa**: `shiftId` inválido (turno não existe)
- **Solução**: Recarregar lista de turnos, verificar se turno ainda está ativo

**Problema**: Coluna "Turno" não aparece na tabela
- **Causa**: Tela pequena (coluna está oculta em xs, sm, md)
- **Solução**: Aumentar tamanho da janela ou verificar em dispositivo maior

---

## Conclusão

O vínculo de turno com colaboradores foi implementado de forma completa e integrada, permitindo:
- Definir turno padrão de cada funcionário
- Visualizar rapidamente quem trabalha em cada turno
- Facilitar gestão de escalas e horários
- Base para futuras funcionalidades de relatórios e automação

A implementação é **opcional** (colaborador pode não ter turno), **segura** (foreign key com SET NULL) e **performática** (índice no campo shiftId).

