# ⚡ Solução Rápida - Central de E-mails Não Aparece

## 🔍 O Problema

A **Central de E-mails** não aparecia no menu porque as permissões não estavam configuradas.

## ✅ O Que Foi Corrigido

### 1. ✅ Frontend Atualizado
- Arquivo `frontend/src/utils/permissions.ts` atualizado
- Permissões `email_logs` adicionadas para todos os roles

### 2. 🔄 Falta Aplicar no Banco de Dados
- Script SQL preparado: `init_email_logs_permissions.sql`
- Script PowerShell criado: `APLICAR_PERMISSOES_EMAIL_LOGS.ps1`

---

## 🚀 Execute Agora (3 Passos)

### Passo 1️⃣: Aplicar Permissões no Banco

Escolha uma das opções abaixo:

#### 🔵 Opção A - Usar Script PowerShell (Mais Fácil)

```powershell
.\APLICAR_PERMISSOES_EMAIL_LOGS.ps1
```

Digite a senha do PostgreSQL quando solicitado.

---

#### 🔵 Opção B - Copiar e Colar SQL

1. Abra o **pgAdmin** ou **DBeaver**
2. Conecte ao banco `mes_db`
3. Cole e execute este SQL:

```sql
-- ADMIN
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = true;

-- DIRECTOR
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'email_logs', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false;

-- MANAGER
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'email_logs', true, false, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canEdit" = true;

-- SUPERVISOR
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true;

-- LEADER
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true;

-- OPERATOR
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'email_logs', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO NOTHING;
```

---

### Passo 2️⃣: Logout + Limpar Cache

1. **Faça logout** do sistema
2. **Limpe o cache**: Pressione `Ctrl + Shift + Delete` OU `Ctrl + F5`
3. **Feche e abra** o navegador (opcional, mas recomendado)

---

### Passo 3️⃣: Login e Verificar

1. **Faça login** novamente
2. Vá em **Administração** (menu lateral)
3. **Central de E-mails** deve aparecer! 📧

---

## 🎯 Como Saber se Funcionou?

### ✅ Menu Lateral Atualizado

```
📊 Dashboard
═══════════════════════════
🏭 Operacional
   📡 Injetoras
   ✏️ Apontamento Manual
   📋 Ordens de Produção
   ⚠️ Paradas
═══════════════════════════
📁 Cadastros
   🏢 Empresas
   🏛️ Setores
   📦 Itens
   🔧 Moldes
   🐛 Defeitos
   📑 Tipos de Atividade
   🏷️ Tipos de Referência
═══════════════════════════
🔐 Administração
   👥 Colaboradores
   👥 Colaboradores e Empresas
   🔒 Permissões
   ⚙️ Configuração CLP
   📧 Configuração de E-mail
   🔔 Alertas de Manutenção
   📧 Central de E-mails  ⬅️ NOVO!
```

---

## 🛠️ Problemas?

### ❌ Ainda não aparece no menu

**Solução 1:** Verifique se você fez logout e login
```
Administração > Logout > Login novamente
```

**Solução 2:** Limpe o cache do navegador
```
Ctrl + Shift + Delete (limpar cache)
OU
Ctrl + F5 (reload forçado)
```

**Solução 3:** Verifique se as permissões foram aplicadas
```sql
SELECT * FROM role_permissions WHERE resource = 'email_logs';
```

Deve retornar 6 linhas (ADMIN, DIRECTOR, MANAGER, SUPERVISOR, LEADER, OPERATOR).

---

### ❌ Erro ao acessar a página

**Solução:** Reinicie o backend

```powershell
.\REINICIAR_BACKEND.ps1
```

OU

```powershell
cd backend
npm run dev
```

---

## 📊 Quem Pode Ver a Central de E-mails?

| Role       | Pode Ver? | Permissões                    |
|------------|-----------|-------------------------------|
| ADMIN      | ✅ Sim    | Ver, Criar, Editar, Deletar   |
| DIRECTOR   | ✅ Sim    | Ver, Criar, Editar            |
| MANAGER    | ✅ Sim    | Ver, Editar                   |
| SUPERVISOR | ✅ Sim    | Apenas Ver                    |
| LEADER     | ✅ Sim    | Apenas Ver                    |
| OPERATOR   | ❌ Não    | Sem acesso                    |

---

## 📝 Comandos Úteis

### Verificar permissões no banco
```sql
SELECT role, resource, "canView", "canCreate", "canEdit", "canDelete"
FROM role_permissions
WHERE resource = 'email_logs'
ORDER BY role;
```

### Reiniciar backend
```powershell
.\REINICIAR_BACKEND.ps1
```

### Reiniciar sistema completo
```powershell
.\1REINICIAR_SISTEMA_MES.bat
```

---

## 📞 Suporte

Se ainda tiver problemas:

1. ✅ Verifique este documento novamente
2. ✅ Leia `CORRECAO_CENTRAL_EMAIL_NAO_APARECE.md` (documentação completa)
3. ✅ Consulte `CENTRAL_DE_EMAILS.md` (documentação da funcionalidade)

---

**✅ Status:** Correção Aplicada  
**📅 Data:** 23/10/2025  
**🎯 Próximo Passo:** Execute o Passo 1️⃣ acima

