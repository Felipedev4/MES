# 🔧 Correção: Central de E-mails Não Aparece no Front

## 📋 Problema Identificado

A **Central de E-mails** não aparecia no menu lateral do sistema porque:

1. ❌ As permissões `email_logs` **não estavam configuradas** no arquivo de permissões do frontend
2. ❌ As permissões `email_logs` **não estavam no banco de dados**

## ✅ Soluções Aplicadas

### 1. Frontend - Arquivo de Permissões Atualizado

**Arquivo modificado:** `frontend/src/utils/permissions.ts`

Adicionada a permissão `email_logs` para todos os roles:

| Role       | canView | canCreate | canEdit | canDelete |
|------------|---------|-----------|---------|-----------|
| ADMIN      | ✅      | ✅        | ✅      | ✅        |
| DIRECTOR   | ✅      | ✅        | ✅      | ❌        |
| MANAGER    | ✅      | ❌        | ✅      | ❌        |
| SUPERVISOR | ✅      | ❌        | ❌      | ❌        |
| LEADER     | ✅      | ❌        | ❌      | ❌        |
| OPERATOR   | ❌      | ❌        | ❌      | ❌        |

### 2. Script SQL Criado

**Script criado:** `APLICAR_PERMISSOES_EMAIL_LOGS.ps1`

Script PowerShell para facilitar a aplicação das permissões no banco de dados.

---

## 🚀 Como Aplicar a Correção

### Passo 1: Aplicar Permissões no Banco de Dados

**Opção A - Via Script PowerShell (Recomendado):**

```powershell
.\APLICAR_PERMISSOES_EMAIL_LOGS.ps1
```

Quando solicitado, digite a senha do PostgreSQL.

**Opção B - Via SQL Direto:**

Execute no PostgreSQL (banco `mes_db`):

```sql
-- ADMIN - Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = true,
  "updatedAt" = NOW();

-- DIRECTOR - Acesso total (sem deletar)
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'email_logs', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = false,
  "updatedAt" = NOW();

-- MANAGER - Visualizar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'email_logs', true, false, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canEdit" = true,
  "updatedAt" = NOW();

-- SUPERVISOR - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();

-- LEADER - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();

-- OPERATOR - Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'email_logs', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO NOTHING;
```

**Opção C - Via API:**

```http
POST http://localhost:3001/api/permissions/initialize
Authorization: Bearer {seu_token_jwt}
```

### Passo 2: Reiniciar o Backend (Opcional)

Se você usou a Opção C, pode ser necessário reiniciar o backend:

```powershell
.\REINICIAR_BACKEND.ps1
```

### Passo 3: Atualizar o Frontend

1. **Faça logout** do sistema
2. **Limpe o cache do navegador** (Ctrl + Shift + Delete ou Ctrl + F5)
3. **Faça login novamente**

### Passo 4: Verificar

1. Abra o sistema
2. Vá em **Administração** (menu lateral)
3. Deve aparecer **"Central de E-mails"** 📧

---

## 🔍 Verificação de Sucesso

### No Menu Lateral

✅ Deve aparecer em **Administração**:
- Colaboradores
- Colaboradores e Empresas
- Permissões
- Configuração CLP
- Configuração de E-mail
- Alertas de Manutenção
- **Central de E-mails** ⬅️ NOVO

### No Banco de Dados

Execute para verificar:

```sql
SELECT role, resource, "canView", "canCreate", "canEdit", "canDelete"
FROM role_permissions
WHERE resource = 'email_logs'
ORDER BY role;
```

Deve retornar **6 linhas** (uma para cada role).

---

## 📊 O que a Central de E-mails Faz?

A **Central de E-mails** é uma página que:

- 📊 Mostra **todos os e-mails** enviados pelo sistema
- ✅ Exibe **estatísticas** de envio (total, sucessos, falhas, últimas 24h)
- 🔍 Permite **buscar e filtrar** e-mails por status e tipo
- 👁️ Visualizar **detalhes completos** de cada e-mail
- 📧 Suporta **múltiplos tipos**:
  - Alertas de Manutenção
  - Notificações de Parada
  - Outros

---

## 🛠️ Troubleshooting

### ❌ Menu ainda não aparece

**Causa 1:** Token JWT desatualizado
- **Solução:** Faça logout e login novamente

**Causa 2:** Cache do navegador
- **Solução:** Limpe o cache (Ctrl+Shift+Delete) ou abra em aba anônima

**Causa 3:** Permissões não aplicadas no banco
- **Solução:** Verifique se executou o SQL corretamente

### ❌ Erro ao acessar a página

**Causa 1:** Backend não encontrou os endpoints
- **Solução:** Reinicie o backend

**Causa 2:** Erro de permissão
- **Solução:** Verifique se seu usuário tem o role correto (ADMIN, DIRECTOR, etc.)

---

## 📝 Arquivos Modificados

1. ✅ `frontend/src/utils/permissions.ts` - Adicionadas permissões de `email_logs`
2. ✅ `APLICAR_PERMISSOES_EMAIL_LOGS.ps1` - Script criado para facilitar aplicação
3. ✅ `CORRECAO_CENTRAL_EMAIL_NAO_APARECE.md` - Esta documentação

---

## 🎯 Resumo Rápido

```bash
# 1. Aplicar permissões no banco
.\APLICAR_PERMISSOES_EMAIL_LOGS.ps1

# 2. Logout + Limpar Cache (Ctrl+F5)

# 3. Login novamente

# 4. Verificar: Administração > Central de E-mails
```

---

**Data da Correção:** 23/10/2025  
**Problema:** Central de e-mail não aparece no front  
**Status:** ✅ Resolvido

