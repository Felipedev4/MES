# 🔐 Como Inicializar Permissões Padrão

## Problema
A **Central de E-mails** não aparece no menu lateral porque o recurso `email_logs` não está nas permissões do sistema.

## Solução Rápida

### Opção 1: Via API (Recomendado)

1. **Abra o Postman, Thunder Client ou similar**

2. **Faça a seguinte requisição:**

```http
POST http://localhost:3001/api/permissions/initialize
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

**Resposta esperada:**
```json
{
  "message": "Permissões padrão inicializadas/atualizadas com sucesso",
  "created": X,
  "updated": Y
}
```

### Opção 2: Via SQL Direto (PostgreSQL)

Execute no banco de dados `mes_db`:

```sql
-- Inserir permissão para ADMIN
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = true,
  "updatedAt" = NOW();

-- Inserir permissão para DIRECTOR
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = true,
  "updatedAt" = NOW();

-- Inserir permissão para MANAGER
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();

-- Inserir permissão para SUPERVISOR
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();
```

### Opção 3: Via Interface (Tela de Permissões)

1. **Acesse**: Administração > Permissões
2. **Selecione o perfil**: ADMIN (ou outro)
3. **Procure**: "Central de E-mails" ou "email_logs"
4. **Marque**: ✅ Visualizar (View)
5. **Salve**

---

## Após Inicializar Permissões

1. **Faça logout e login novamente** (para atualizar o token JWT)
2. **Limpe o cache do navegador** (Ctrl+F5)
3. **Verifique o menu lateral**: Deve aparecer "Central de E-mails" em **Administração**

---

## Estrutura de Permissões

### Recurso: `email_logs`

| Perfil     | View | Create | Edit | Delete |
|------------|------|--------|------|--------|
| ADMIN      | ✅   | ✅     | ✅   | ✅     |
| DIRECTOR   | ✅   | ✅     | ✅   | ✅     |
| MANAGER    | ✅   | ❌     | ❌   | ❌     |
| SUPERVISOR | ✅   | ❌     | ❌   | ❌     |
| LEADER     | ❌   | ❌     | ❌   | ❌     |
| OPERATOR   | ❌   | ❌     | ❌   | ❌     |

---

## Verificação

### Como saber se funcionou?

1. **Via Menu Lateral**:
   - Abra o sistema
   - Vá em **Administração**
   - Deve aparecer **"Central de E-mails"** 📧

2. **Via API**:
```http
GET http://localhost:3001/api/permissions?role=ADMIN
Authorization: Bearer {seu_token_jwt}
```

Procure por:
```json
{
  "role": "ADMIN",
  "resource": "email_logs",
  "canView": true,
  "canCreate": true,
  "canEdit": true,
  "canDelete": true
}
```

---

## Troubleshooting

### ❌ Menu não aparece mesmo após permissões

**Possíveis causas:**

1. **Token desatualizado**:
   - Solução: Faça logout e login novamente

2. **Cache do navegador**:
   - Solução: Pressione `Ctrl + Shift + Delete` e limpe cache
   - Ou: Abra em aba anônima

3. **Frontend não atualizado**:
   - Solução: Reinicie o frontend (`npm start` no diretório `frontend`)

4. **Código não compilado**:
   - Solução: No frontend, pare o servidor e rode novamente `npm start`

### ❌ Erro 403 ao acessar

Significa que as permissões não foram aplicadas corretamente:
- Verifique se executou a inicialização
- Faça logout e login
- Verifique na tela de Permissões se `email_logs` existe

---

## Automação Futura

Para evitar esse problema no futuro, as permissões padrão devem ser inicializadas automaticamente:

1. **No primeiro deploy**: Execute `POST /api/permissions/initialize`
2. **Em migrations**: Adicione as permissões no seed do Prisma
3. **Na inicialização do servidor**: Execute automaticamente na primeira vez

---

**Criado em**: 23/10/2025  
**Versão**: 1.0

