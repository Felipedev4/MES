# Sistema de Colaboradores e Permissões

## 📋 Visão Geral

Sistema completo de gerenciamento de colaboradores com controle de acesso baseado em perfis (RBAC - Role-Based Access Control).

## 👥 Perfis de Usuário

O sistema possui 5 perfis hierárquicos:

| Perfil | Descrição | Acesso Padrão |
|--------|-----------|---------------|
| **ADMIN** | Administrador do Sistema | Acesso total a todos os recursos |
| **DIRECTOR** | Diretoria | Visualização total, edição limitada, sem exclusão |
| **MANAGER** | Gerente | Gestão operacional completa (exceto config. sistema) |
| **LEADER** | Líder de Produção | Operações do chão de fábrica |
| **OPERATOR** | Operador | Apenas apontamento de produção |

## 🔐 Funcionalidades Implementadas

### Backend

#### 1. **Modelo de Dados Expandido** (`schema.prisma`)
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  password              String
  name                  String
  role                  Role      @default(OPERATOR)
  active                Boolean   @default(true)
  mustChangePassword    Boolean   @default(true)
  lastPasswordChange    DateTime?
  phone                 String?
  department            String?
  employeeCode          String?   @unique
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model RolePermission {
  id          Int      @id @default(autoincrement())
  role        Role
  resource    String
  canView     Boolean  @default(false)
  canCreate   Boolean  @default(false)
  canEdit     Boolean  @default(false)
  canDelete   Boolean  @default(false)
}
```

#### 2. **Controllers Criados**

**`userController.ts`** - Gerenciamento de Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Desativar usuário (soft delete)
- `POST /api/users/:id/change-password` - Trocar senha
- `POST /api/users/:id/reset-password` - Resetar senha (admin)

**`rolePermissionController.ts`** - Gerenciamento de Permissões
- `GET /api/permissions` - Listar todas as permissões
- `GET /api/permissions/role/:role` - Obter permissões por perfil
- `GET /api/permissions/check` - Verificar permissão específica
- `POST /api/permissions` - Criar/atualizar permissão
- `POST /api/permissions/bulk` - Atualizar permissões em lote
- `POST /api/permissions/initialize` - Inicializar permissões padrão
- `DELETE /api/permissions/:id` - Deletar permissão

### Frontend

#### 1. **Página de Colaboradores** (`/users`)
Funcionalidades:
- ✅ Listagem de colaboradores com filtros
- ✅ Cadastro de novos usuários
- ✅ Edição de dados cadastrais
- ✅ Gerenciamento de status (Ativo/Inativo)
- ✅ Resetar senha (função administrativa)
- ✅ Forçar troca de senha no primeiro login
- ✅ Gestão de códigos de funcionário
- ✅ Design responsivo para mobile

Campos do Cadastro:
- Código de Funcionário (único, opcional)
- Nome Completo
- Email (único, obrigatório)
- Telefone
- Departamento
- Perfil (Role)
- Senha (obrigatória no cadastro)
- Status (Ativo/Inativo)
- Forçar troca de senha

#### 2. **Página de Permissões** (`/permissions`)
Funcionalidades:
- ✅ Configuração por perfil (tabs)
- ✅ Matriz de permissões por recurso
- ✅ 4 tipos de ação: Visualizar, Criar, Editar, Excluir
- ✅ Salvar alterações em lote
- ✅ Restaurar permissões padrão
- ✅ Alertas de alterações não salvas
- ✅ Design intuitivo com switches

Recursos Configuráveis:
- Dashboard
- Colaboradores (users)
- Empresas
- Setores
- Itens/Produtos
- Moldes
- Ordens de Produção
- Apontamento de Produção
- Paradas
- Produção
- Configuração CLP
- Tipos de Atividade
- Defeitos
- Tipos de Referência
- Injetoras
- Relatórios
- Permissões

## 🚀 Como Usar

### 1. Aplicar Migration

```bash
cd backend
npm run prisma:migrate
```

Ou manualmente:
```bash
npx prisma migrate deploy
```

### 2. Inicializar Permissões Padrão

Fazer uma requisição POST para:
```
POST /api/permissions/initialize
```

Ou através da interface web:
1. Acesse `/permissions`
2. Clique em "Restaurar Padrão"

### 3. Criar Primeiro Usuário Admin

```bash
# Via API
POST /api/users
{
  "name": "Administrador",
  "email": "admin@example.com",
  "password": "senha123",
  "role": "ADMIN",
  "active": true,
  "mustChangePassword": true
}
```

Ou atualize um usuário existente:
```bash
# Via Prisma Studio
npx prisma studio
# Edite o usuário e altere o role para ADMIN
```

## 📊 Matriz de Permissões Padrão

### ADMIN
- ✅ Acesso total a todos os recursos
- ✅ Todas as operações (Ver, Criar, Editar, Excluir)

### DIRECTOR
- ✅ Visualização completa de tudo
- ✅ Criar e Editar (exceto Usuários e Config CLP)
- ❌ Sem permissão de exclusão

### MANAGER
- ✅ Gestão operacional completa
- ✅ Criar e Editar operações de produção
- ❌ Sem acesso a Usuários, Empresas e Config CLP
- ✅ Pode excluir Paradas e Apontamentos

### LEADER
- ✅ Operações do chão de fábrica
- ✅ Criar Apontamentos, Paradas e Defeitos
- ✅ Editar Apontamentos, Paradas e Ordens
- ❌ Sem acesso a Usuários e Config CLP

### OPERATOR
- ✅ Acesso básico
- ✅ Visualizar Dashboard, Injetoras e Produção
- ✅ Criar Apontamentos de Produção
- ❌ Sem outras permissões

## 🔒 Segurança

### Recursos de Segurança Implementados:

1. **Senhas**
   - Hash bcrypt com salt
   - Mínimo 6 caracteres
   - Força troca no primeiro login (configurável)
   - Data da última alteração registrada

2. **Validações**
   - Email único
   - Código de funcionário único
   - Verificação de senha atual na troca
   - Validação de campos obrigatórios

3. **Soft Delete**
   - Usuários são desativados, não deletados
   - Mantém histórico de apontamentos

4. **Auditoria**
   - Timestamps de criação e atualização
   - Registro de última troca de senha

## 📱 Responsividade

Todas as páginas foram otimizadas para:
- ✅ Desktop (telas grandes)
- ✅ Tablets (iPad e similares)
- ✅ Mobile (iPhone, Android)

Recursos mobile:
- Tabelas com scroll horizontal
- Colunas ocultáveis em telas pequenas
- Botões e textos redimensionáveis
- Layout adaptativo

## 🎯 Próximos Passos Sugeridos

1. **Implementar Middleware de Permissões**
   ```typescript
   // middleware/checkPermission.ts
   export const checkPermission = (resource: string, action: string) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       const userRole = req.user.role;
       const hasPermission = await checkUserPermission(userRole, resource, action);
       if (!hasPermission) {
         return res.status(403).json({ error: 'Sem permissão' });
       }
       next();
     };
   };
   ```

2. **Integrar com Auth Context**
   - Verificar permissões no frontend
   - Ocultar botões/menus sem permissão
   - Redirecionar se tentar acessar sem permissão

3. **Adicionar Logs de Auditoria**
   - Registrar quem fez o quê e quando
   - Histórico de alterações de permissões

4. **Notificações**
   - Email quando senha é resetada
   - Alerta de primeiro login

## 📝 Exemplos de Uso

### Verificar Permissão no Frontend
```typescript
const hasEditPermission = await api.get('/permissions/check', {
  params: {
    role: user.role,
    resource: 'production_orders',
    action: 'edit'
  }
});

if (hasEditPermission.data.allowed) {
  // Mostrar botão de editar
}
```

### Atualizar Permissões em Lote
```typescript
await api.post('/permissions/bulk', {
  role: 'MANAGER',
  permissions: [
    { resource: 'items', canView: true, canCreate: true, canEdit: true, canDelete: false },
    { resource: 'molds', canView: true, canCreate: true, canEdit: true, canDelete: false },
    // ... outros recursos
  ]
});
```

## 🐛 Troubleshooting

### Problema: "Email já cadastrado"
**Solução**: Verifique se o email já está em uso. Cada email deve ser único.

### Problema: "Código de funcionário já cadastrado"
**Solução**: Cada código de funcionário deve ser único ou deixe em branco.

### Problema: "Senha deve ter no mínimo 6 caracteres"
**Solução**: Use uma senha mais forte com pelo menos 6 caracteres.

### Problema: Permissões não estão funcionando
**Solução**: Execute `/api/permissions/initialize` para criar as permissões padrão.

## 📚 Referências

- [Prisma Docs - Role-Based Access Control](https://www.prisma.io/docs)
- [Material-UI Components](https://mui.com/material-ui/)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

---

**Desenvolvido para:** Sistema MES - Manufacturing Execution System
**Data:** Outubro 2025
**Versão:** 1.0.0

