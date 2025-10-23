# 🔐 Credenciais de Acesso - Sistema MES

**Data:** 23 de Outubro de 2025  
**Status:** ✅ Ativo

---

## 👤 Usuário Administrador

### Credenciais de Login

| Campo | Valor |
|-------|-------|
| **Email** | `admin@mes.com` |
| **Senha** | `admin123` |
| **Role** | `ADMIN` (Administrador) |
| **Empresa Padrão** | Empresa Padrão (EMP001) |

---

## 🌐 URLs de Acesso

### Produção
| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface do usuário |
| **Backend API** | http://localhost:3001 | API REST |
| **API Docs** | http://localhost:3001/api-docs | Swagger UI |
| **Data Collector** | http://localhost:3002 | Status do coletor |

---

## 🔑 Como Fazer Login

### Via Frontend (http://localhost:3000)

1. Acesse: http://localhost:3000
2. Na tela de login, insira:
   - **Email:** `admin@mes.com`
   - **Senha:** `admin123`
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard

### Via API (Postman/Curl)

```bash
# Usando curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mes.com",
    "password": "admin123"
  }'

# Usando PowerShell
$body = @{
  email = 'admin@mes.com'
  password = 'admin123'
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Resposta Esperada

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@mes.com",
    "name": "Administrador",
    "role": "ADMIN",
    "mustChangePassword": false
  },
  "companies": [
    {
      "id": 1,
      "code": "EMP001",
      "name": "Empresa Padrão",
      "tradeName": "Empresa MES",
      "isDefault": true
    }
  ],
  "requiresCompanySelection": false
}
```

---

## 🔒 Segurança

### Alterando a Senha

#### Via SQL:

```sql
-- Atualizar senha do admin
-- Nova senha: novaSenha123

-- 1. Gerar hash da nova senha
cd backend
node gerar_hash_senha.js  -- (modificar para sua nova senha)

-- 2. Atualizar no banco
UPDATE users 
SET password = 'HASH_GERADO_AQUI',
    "updatedAt" = NOW()
WHERE email = 'admin@mes.com';
```

#### Via API (quando logado):

```bash
PUT /api/users/:id
{
  "password": "novaSenha123"
}
```

---

## 👥 Criando Novos Usuários

### Via API (com token do admin):

```bash
POST /api/auth/register
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "OPERATOR"
}
```

### Roles Disponíveis:

| Role | Descrição | Permissões |
|------|-----------|------------|
| `ADMIN` | Administrador | Acesso total ao sistema |
| `DIRECTOR` | Diretoria | Visualização de todos os dados |
| `MANAGER` | Gerente | Gerenciamento de produção |
| `SUPERVISOR` | Supervisor | Supervisão de ordens |
| `LEADER` | Líder | Coordenação de equipes |
| `OPERATOR` | Operador | Apontamentos e produção |

---

## 🏢 Empresas (Multi-Empresa)

### Empresa Padrão Criada

| Campo | Valor |
|-------|-------|
| **ID** | 1 |
| **Código** | EMP001 |
| **Nome** | Empresa Padrão |
| **Nome Fantasia** | Empresa MES |
| **Status** | Ativo |

### Criando Novas Empresas

```sql
-- Via SQL
INSERT INTO companies (code, name, "tradeName", active, "createdAt", "updatedAt")
VALUES ('EMP002', 'Minha Empresa', 'Nome Fantasia', true, NOW(), NOW());

-- Vincular usuário à nova empresa
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
VALUES (1, (SELECT id FROM companies WHERE code = 'EMP002'), false, NOW(), NOW());
```

```bash
# Via API
POST /api/companies
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "code": "EMP002",
  "name": "Minha Empresa",
  "tradeName": "Nome Fantasia",
  "active": true
}
```

---

## 🔧 Troubleshooting

### Problema: "Credenciais inválidas"

**Causas possíveis:**
1. Email ou senha incorretos
2. Usuário não existe no banco
3. Usuário está inativo

**Solução:**
```sql
-- Verificar se usuário existe
SELECT id, email, name, role, active FROM users WHERE email = 'admin@mes.com';

-- Reativar usuário se estiver inativo
UPDATE users SET active = true WHERE email = 'admin@mes.com';

-- Resetar senha
-- (use gerar_hash_senha.js para gerar novo hash)
UPDATE users 
SET password = 'NOVO_HASH_AQUI'
WHERE email = 'admin@mes.com';
```

### Problema: "Token inválido ou expirado"

**Solução:**
- Faça login novamente para obter um novo token
- Tokens JWT expiram em 24 horas

### Problema: Esqueci a senha

**Solução:**
```sql
-- Resetar para admin123
UPDATE users 
SET password = '$2b$10$1acq47OA.LEfTsfzCNCCe.4hUHT/ttInxauehvKgMtPoaTKqwQFya',
    "updatedAt" = NOW()
WHERE email = 'admin@mes.com';
```

---

## 📊 Verificar Usuários no Sistema

```sql
-- Listar todos os usuários
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.active,
  COUNT(uc.id) as num_companies
FROM users u
LEFT JOIN user_companies uc ON u.id = uc."userId"
GROUP BY u.id, u.email, u.name, u.role, u.active
ORDER BY u.id;

-- Listar usuários com suas empresas
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  c.id as company_id,
  c.name as company_name,
  uc."isDefault"
FROM users u
LEFT JOIN user_companies uc ON u.id = uc."userId"
LEFT JOIN companies c ON uc."companyId" = c.id
ORDER BY u.id, c.id;
```

---

## ⚠️ Avisos Importantes

### Segurança

1. **ALTERE A SENHA PADRÃO** em ambiente de produção
2. Use senhas fortes (mínimo 8 caracteres, letras, números e símbolos)
3. Nunca compartilhe credenciais de administrador
4. Revise periodicamente os usuários ativos

### Backup

Faça backup regular das credenciais e do banco de dados:
```bash
# Backup do banco de dados
$env:PGPASSWORD='As09kl00__'
pg_dump -U postgres -d mes_db > backup_mes_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

---

## 📚 Documentação Relacionada

- `API_DOCUMENTATION.md` - Documentação completa da API
- `SISTEMA_COLABORADORES_PERMISSOES.md` - Sistema de permissões
- `SISTEMA_MULTI_EMPRESA.md` - Multi-empresa
- `GUIA_SCRIPTS_INICIALIZACAO.md` - Scripts de inicialização

---

## 🆘 Suporte

### Script para Recriar Usuário Admin

Se necessário, recrie o usuário administrador executando:

```bash
$env:PGPASSWORD='As09kl00__'
psql -U postgres -d mes_db -f criar_usuario_admin.sql
```

Ou use o script do backend:
```bash
cd backend
node gerar_hash_senha.js
```

---

**🎉 Sistema pronto para uso!**

Acesse **http://localhost:3000** e faça login com:
- Email: `admin@mes.com`
- Senha: `admin123`

---

**Data de Criação:** 23 de Outubro de 2025  
**Última Atualização:** 23 de Outubro de 2025  
**Versão:** 1.0.0

