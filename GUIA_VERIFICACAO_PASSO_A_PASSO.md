# 🔍 Guia de Verificação Passo a Passo - Vínculo de Empresa

## 🎯 Objetivo

Este guia vai te mostrar **passo a passo** como verificar se o vínculo de empresa está funcionando corretamente no seu sistema.

---

## 📋 Pré-requisitos

- [ ] Sistema backend rodando (porta 3001)
- [ ] Sistema frontend rodando (porta 3000)
- [ ] PostgreSQL rodando
- [ ] Você tem acesso ao banco de dados

---

## 🚀 PASSO 1: Verificar Empresas no Banco

### 1.1. Abrir ferramenta de banco de dados

**Opção A: Prisma Studio**
```bash
cd backend
npx prisma studio
```
Abrirá no navegador em `http://localhost:5555`

**Opção B: psql (Terminal)**
```bash
psql -U postgres -d mes_db
```

**Opção C: PgAdmin, DBeaver, etc.**
(Use sua ferramenta preferida)

### 1.2. Executar query de verificação

```sql
-- Ver empresas cadastradas
SELECT * FROM companies;
```

**Resultado esperado:**
```
 id | code   | name         | trade_name | active
----+--------+--------------+------------+--------
  1 | EMP001 | Empresa ABC  | ABC Ltda   | true
```

✅ **Se tem empresas:** Prossiga para o próximo passo  
❌ **Se não tem empresas:** Crie uma empresa primeiro:

```sql
INSERT INTO companies (code, name, trade_name, active, created_at, updated_at)
VALUES ('EMP001', 'Empresa ABC', 'ABC Ltda', true, NOW(), NOW());
```

---

## 👥 PASSO 2: Verificar Vínculo Usuário-Empresa

### 2.1. Ver usuários cadastrados
```sql
SELECT id, email, name, role, selected_company_id FROM users;
```

### 2.2. Ver vínculo user-company
```sql
SELECT 
  u.id as user_id,
  u.name as usuario,
  c.id as company_id,
  c.name as empresa,
  uc.is_default
FROM user_companies uc
JOIN users u ON uc.user_id = u.id
JOIN companies c ON uc.company_id = c.id;
```

**Resultado esperado:**
```
 user_id | usuario      | company_id | empresa      | is_default
---------+--------------+------------+--------------+------------
       1 | Operador     |          1 | Empresa ABC  | true
```

✅ **Se tem vínculo:** Prossiga  
❌ **Se não tem vínculo:** Criar vínculo:

```sql
-- Vincular usuário 1 à empresa 1
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (1, 1, true, NOW(), NOW());

-- Atualizar empresa selecionada
UPDATE users SET selected_company_id = 1 WHERE id = 1;
```

---

## 🔑 PASSO 3: Testar Login e Verificar Token

### 3.1. Fazer login no sistema

Abra o frontend em `http://localhost:3000` e faça login.

### 3.2. Verificar token JWT

**Opção A: Console do Navegador (F12)**
```javascript
// Colar no console:
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decodificar token:
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
```

**Resultado esperado:**
```json
{
  "userId": 1,
  "role": "OPERATOR",
  "companyId": 1,  // ← DEVE TER ESTE CAMPO!
  "iat": 1729641000,
  "exp": 1729669800
}
```

✅ **Se tem companyId:** Perfeito! Prossiga  
❌ **Se NÃO tem companyId:** 
- Refaça o login
- Se persistir, verifique o backend (authController.ts)

---

## 🧪 PASSO 4: Verificar Filtros no Backend

### 4.1. Ativar logs do Prisma

Edite: `backend/src/config/database.ts`

```typescript
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],  // ← Adicionar esta linha
});
```

Reinicie o backend:
```bash
cd backend
npm run dev
```

### 4.2. Fazer request de moldes

No frontend ou Postman:
```
GET http://localhost:3001/api/molds
Headers:
  Authorization: Bearer <seu_token>
```

### 4.3. Ver logs no terminal do backend

**Resultado esperado:**
```
prisma:query SELECT * FROM "molds" WHERE "company_id" = 1
```

✅ **Se aparece filtro `company_id = 1`:** Funcionando corretamente!  
❌ **Se NÃO filtra por empresa:** Verificar middleware

---

## 📦 PASSO 5: Verificar Dados Vinculados

### 5.1. Moldes por empresa
```sql
SELECT 
  COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
  COUNT(m.id) as total_moldes
FROM molds m
LEFT JOIN companies c ON m.company_id = c.id
GROUP BY c.name;
```

**Resultado esperado:**
```
      empresa       | total_moldes
-------------------+--------------
 Empresa ABC       |            5
```

❌ **Se aparecer "SEM EMPRESA":** Corrigir órfãos:
```sql
UPDATE molds SET company_id = 1 WHERE company_id IS NULL;
```

### 5.2. Itens por empresa
```sql
SELECT 
  COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
  COUNT(i.id) as total_itens
FROM items i
LEFT JOIN companies c ON i.company_id = c.id
GROUP BY c.name;
```

❌ **Se aparecer "SEM EMPRESA":** Corrigir órfãos:
```sql
UPDATE items SET company_id = 1 WHERE company_id IS NULL;
```

### 5.3. Ordens por empresa
```sql
SELECT 
  COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
  COUNT(po.id) as total_ordens
FROM production_orders po
LEFT JOIN companies c ON po.company_id = c.id
GROUP BY c.name;
```

❌ **Se aparecer "SEM EMPRESA":** Corrigir órfãos:
```sql
UPDATE production_orders SET company_id = 1 WHERE company_id IS NULL;
```

---

## ✍️ PASSO 6: Verificar Apontamentos (Vínculo Indireto)

### 6.1. Apontamentos por empresa
```sql
SELECT 
  c.name as empresa,
  COUNT(pa.id) as total_apontamentos,
  SUM(pa.quantity) as total_produzido
FROM production_appointments pa
INNER JOIN production_orders po ON pa.production_order_id = po.id
INNER JOIN companies c ON po.company_id = c.id
GROUP BY c.name;
```

**Resultado esperado:**
```
   empresa   | total_apontamentos | total_produzido
-------------+--------------------+-----------------
 Empresa ABC |                 15 |            5000
```

✅ **Se mostra apontamentos vinculados:** Funcionando!  
⚠️ **Nota:** Apontamentos são vinculados via ordem, não diretamente

---

## 🎨 PASSO 7: Testar no Frontend

### 7.1. Listar moldes
1. Acesse a lista de moldes no sistema
2. Verifique se aparecem apenas moldes da sua empresa

### 7.2. Listar itens
1. Acesse a lista de itens
2. Verifique se aparecem apenas itens da sua empresa

### 7.3. Listar ordens
1. Acesse as ordens de produção
2. Verifique se aparecem apenas ordens da sua empresa

### 7.4. Verificar apontamentos
1. Acesse uma ordem de produção
2. Veja os apontamentos
3. Todos devem ser da ordem que pertence à sua empresa

---

## 🚨 PASSO 8: Testar Multi-Empresa (Opcional)

### 8.1. Criar segunda empresa
```sql
INSERT INTO companies (code, name, trade_name, active, created_at, updated_at)
VALUES ('EMP002', 'Empresa XYZ', 'XYZ SA', true, NOW(), NOW());
```

### 8.2. Vincular usuário às duas empresas
```sql
-- Vincular à empresa 2
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (1, 2, false, NOW(), NOW());
```

### 8.3. Criar molde da empresa 2
```sql
INSERT INTO molds (code, name, cavities, company_id, active, created_at, updated_at)
VALUES ('M999', 'Molde Empresa 2', 1, 2, true, NOW(), NOW());
```

### 8.4. Fazer logout e login novamente

Ao fazer login, você deve ver opção de selecionar empresa:
- [ ] Empresa ABC
- [ ] Empresa XYZ

### 8.5. Selecionar Empresa ABC

Deve mostrar apenas moldes/itens da Empresa ABC

### 8.6. Trocar para Empresa XYZ

Deve mostrar o molde M999 (da Empresa XYZ)

---

## ✅ CHECKLIST FINAL

Marque cada item verificado:

### Banco de Dados
- [ ] Empresas cadastradas em `companies`
- [ ] Usuário vinculado em `user_companies`
- [ ] `selected_company_id` preenchido no usuário
- [ ] Moldes com `company_id` preenchido
- [ ] Itens com `company_id` preenchido
- [ ] Ordens com `company_id` preenchido

### Backend
- [ ] Middleware `injectCompanyId` aplicado nas rotas
- [ ] Controllers usam `getCompanyFilter(req)`
- [ ] Logs do Prisma mostram filtro `company_id`

### JWT
- [ ] Token contém `companyId` no payload
- [ ] Token está sendo enviado nas requests
- [ ] Middleware extrai `companyId` corretamente

### Frontend
- [ ] Login funciona
- [ ] Seleção de empresa funciona (se múltiplas)
- [ ] Lista de moldes filtra por empresa
- [ ] Lista de itens filtra por empresa
- [ ] Lista de ordens filtra por empresa

### Testes Avançados
- [ ] Apontamentos aparecem corretamente
- [ ] Trocar de empresa muda os dados exibidos
- [ ] Usuário sem empresa vê mensagem de erro

---

## 🐛 Problemas Comuns e Soluções

### ❌ Problema: "Não vejo nenhum molde/item"

**Causa:** Registros não têm `company_id`  
**Solução:**
```sql
UPDATE molds SET company_id = 1 WHERE company_id IS NULL;
UPDATE items SET company_id = 1 WHERE company_id IS NULL;
UPDATE production_orders SET company_id = 1 WHERE company_id IS NULL;
```

### ❌ Problema: "Token não tem companyId"

**Causa:** Usuário não tem empresa selecionada  
**Solução:**
```sql
-- Verificar
SELECT id, email, selected_company_id FROM users WHERE id = 1;

-- Corrigir
UPDATE users SET selected_company_id = 1 WHERE id = 1;
```

### ❌ Problema: "Vejo dados de todas as empresas"

**Causa:** Middleware não está aplicado  
**Solução:** Verificar arquivo de rotas:
```typescript
// backend/src/routes/moldRoutes.ts
router.use(injectCompanyId); // ← Deve estar aqui
```

### ❌ Problema: "Erro ao fazer login"

**Causa:** Usuário não tem vínculo com empresa  
**Solução:**
```sql
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (1, 1, true, NOW(), NOW());
```

---

## 📊 Script de Verificação Completa

Execute este script para ver um resumo completo:

```sql
-- COPIE E EXECUTE NO BANCO DE DADOS

-- 1. Empresas
SELECT '1️⃣ EMPRESAS' as item, COUNT(*) as total FROM companies WHERE active = true;

-- 2. Usuários com empresa
SELECT '2️⃣ USUÁRIOS COM EMPRESA' as item, COUNT(*) as total 
FROM users WHERE selected_company_id IS NOT NULL;

-- 3. Vínculos user-company
SELECT '3️⃣ VÍNCULOS USER-COMPANY' as item, COUNT(*) as total FROM user_companies;

-- 4. Moldes vinculados
SELECT '4️⃣ MOLDES VINCULADOS' as item, COUNT(*) as total 
FROM molds WHERE company_id IS NOT NULL;

-- 5. Itens vinculados
SELECT '5️⃣ ITENS VINCULADOS' as item, COUNT(*) as total 
FROM items WHERE company_id IS NOT NULL;

-- 6. Ordens vinculadas
SELECT '6️⃣ ORDENS VINCULADAS' as item, COUNT(*) as total 
FROM production_orders WHERE company_id IS NOT NULL;

-- 7. Órfãos (sem empresa)
SELECT '❌ MOLDES ÓRFÃOS' as item, COUNT(*) as total 
FROM molds WHERE company_id IS NULL
UNION ALL
SELECT '❌ ITENS ÓRFÃOS', COUNT(*) FROM items WHERE company_id IS NULL
UNION ALL
SELECT '❌ ORDENS ÓRFÃS', COUNT(*) FROM production_orders WHERE company_id IS NULL;
```

**Resultado esperado:**
```
         item          | total
-----------------------+-------
 1️⃣ EMPRESAS           |     1
 2️⃣ USUÁRIOS COM EMPRESA |     1
 3️⃣ VÍNCULOS USER-COMPANY |     1
 4️⃣ MOLDES VINCULADOS   |     5
 5️⃣ ITENS VINCULADOS    |    10
 6️⃣ ORDENS VINCULADAS   |     3
 ❌ MOLDES ÓRFÃOS       |     0  ← DEVE SER ZERO!
 ❌ ITENS ÓRFÃOS        |     0  ← DEVE SER ZERO!
 ❌ ORDENS ÓRFÃS        |     0  ← DEVE SER ZERO!
```

---

## 🎯 Próximos Passos

Após concluir esta verificação:

1. **Tudo funcionando?** 
   - ✅ Sistema está pronto para uso multi-empresa!
   - 📖 Consulte `REFERENCIA_RAPIDA_EMPRESA.md` quando precisar

2. **Encontrou problemas?**
   - 📄 Veja soluções em `COMO_FUNCIONA_VINCULO_EMPRESA.md`
   - 🔍 Execute `VERIFICAR_VINCULOS_EMPRESA.sql` para diagnóstico

3. **Quer melhorar performance?**
   - 📊 Considere adicionar `companyId` direto em `ProductionAppointment`
   - 📖 Veja sugestões em `VINCULO_EMPRESA_EXPLICACAO.md`

---

**Criado em:** 22/10/2025  
**Tempo estimado:** 15-20 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Básica)

