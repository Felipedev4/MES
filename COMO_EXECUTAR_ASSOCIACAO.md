# 🚀 Como Associar Dados à Empresa EMP-001

## 📋 Objetivo

Associar **TODOS os dados existentes** (moldes, itens, ordens) à empresa **EMP-001**, para que quando você logar com **EMP-002**, não veja nenhum dado (separação total entre empresas).

---

## ⚡ Opção 1: Execução Rápida (Recomendado)

### Passo 1: Abrir ferramenta de banco de dados

Escolha uma das opções:

**A) PgAdmin** (se instalado)
- Abra PgAdmin
- Conecte ao banco `mes_db`
- Clique em "Query Tool" (ícone SQL)

**B) DBeaver** (se instalado)
- Abra DBeaver
- Conecte ao banco `mes_db`
- Clique em "SQL Editor"

**C) psql** (linha de comando)
```powershell
psql -U postgres -d mes_db
```

### Passo 2: Copiar e Executar o Script

Abra o arquivo: **`SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql`**

**Cole TODO o conteúdo** na ferramenta de SQL e execute!

✅ **Pronto!** Em menos de 1 segundo todos os dados estarão associados.

---

## 🔧 Opção 2: Usando psql (Terminal)

### Método A: PowerShell (Windows)

```powershell
# Executar o script
$env:PGPASSWORD = "postgres"
psql -U postgres -d mes_db -f SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql
Remove-Item Env:\PGPASSWORD
```

### Método B: CMD (Windows)

```cmd
set PGPASSWORD=postgres
psql -U postgres -d mes_db -f SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql
set PGPASSWORD=
```

---

## 🎨 Opção 3: Prisma Studio (Visual)

Prisma Studio não permite executar SQL diretamente, mas você pode usar para **verificar** os dados depois:

```powershell
cd backend
npx prisma studio
```

Depois de abrir (http://localhost:5555):
1. Clique em "companies" → Ver empresas criadas
2. Clique em "molds" → Ver que todos têm `companyId`
3. Clique em "items" → Ver que todos têm `companyId`

---

## ✅ Verificar se Funcionou

Depois de executar o script, execute esta query para verificar:

```sql
SELECT 
    c.code as empresa,
    COUNT(DISTINCT m.id) as moldes,
    COUNT(DISTINCT i.id) as itens,
    COUNT(DISTINCT po.id) as ordens
FROM companies c
LEFT JOIN molds m ON m.company_id = c.id
LEFT JOIN items i ON i.company_id = c.id
LEFT JOIN production_orders po ON po.company_id = c.id
GROUP BY c.code
ORDER BY c.code;
```

**Resultado esperado:**
```
 empresa  | moldes | itens | ordens
----------+--------+-------+--------
 EMP-001  |     5  |   10  |    3     ← Todos os dados
 EMP-002  |     0  |    0  |    0     ← Vazio (pronto para novos dados)
```

---

## 🧪 Testar no Sistema

### 1. Logout
- Faça logout no sistema frontend (http://localhost:3000)

### 2. Login Novamente
- Faça login com seu usuário

### 3. Selecionar EMP-001
- Você verá opção de selecionar empresa
- Selecione **EMP-001**
- ✅ Deve ver **TODOS** os moldes, itens e ordens

### 4. Trocar para EMP-002
- No header, clique no botão de trocar empresa
- Selecione **EMP-002**
- ✅ NÃO deve ver **NENHUM** molde, item ou ordem

### 5. Criar Dados Teste na EMP-002
- Ainda na EMP-002, crie um novo molde
- Nome: "Molde Teste EMP-002"
- Código: "M-EMP002-001"

### 6. Trocar de Volta para EMP-001
- Troque para EMP-001
- ✅ NÃO deve ver o molde "Molde Teste EMP-002"

### 7. Voltar para EMP-002
- Troque para EMP-002
- ✅ Deve ver apenas o molde "Molde Teste EMP-002"

---

## 🎯 O Que o Script Faz

```
1. ✅ Cria empresa EMP-001 (se não existir)
2. ✅ Cria empresa EMP-002 (se não existir)
3. ✅ Associa TODOS os moldes à EMP-001
4. ✅ Associa TODOS os itens à EMP-001
5. ✅ Associa TODAS as ordens à EMP-001
6. ✅ Vincula seu usuário às duas empresas
7. ✅ Define EMP-001 como empresa padrão
```

---

## 🔍 Comandos de Diagnóstico

### Ver empresas cadastradas
```sql
SELECT * FROM companies ORDER BY code;
```

### Ver moldes por empresa
```sql
SELECT 
    COALESCE(c.code, 'SEM EMPRESA') as empresa,
    m.code,
    m.name
FROM molds m
LEFT JOIN companies c ON m.company_id = c.id
ORDER BY c.code, m.code;
```

### Ver vínculo de usuário
```sql
SELECT 
    u.email,
    c.code as empresa,
    uc.is_default as padrao
FROM user_companies uc
JOIN users u ON uc.user_id = u.id
JOIN companies c ON uc.company_id = c.id
WHERE u.id = 1;
```

---

## 🚨 Problemas Comuns

### ❌ "psql: command not found"

**Solução:** Use PgAdmin ou DBeaver em vez de psql

### ❌ "Permission denied"

**Solução:** Use o usuário `postgres` ou seu usuário admin do banco

### ❌ "Database does not exist"

**Solução:** O banco é `mes_db`. Verifique o nome correto:
```sql
\l  -- no psql, lista todos os bancos
```

### ❌ "duplicate key value violates unique constraint"

**Não é problema!** Significa que a empresa já existe. O script continua normalmente.

---

## 📝 Notas Importantes

### Sobre Apontamentos

Os **apontamentos** (ProductionAppointment) não têm campo `company_id` direto.

Eles são vinculados à empresa **através da ordem de produção**:
- Apontamento → ProductionOrder → Company

Quando você associa todas as ordens à EMP-001, **automaticamente** todos os apontamentos dessas ordens também ficam vinculados à EMP-001.

### Sobre Paradas (Downtimes)

Mesmo princípio dos apontamentos:
- Downtime → ProductionOrder → Company

### Reversão

Se quiser desfazer, basta executar:

```sql
-- Mover tudo para EMP-002
UPDATE molds SET company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
UPDATE items SET company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
UPDATE production_orders SET company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
```

---

## 🎉 Sucesso!

Depois de executar o script, seu sistema estará com:

✅ **EMP-001**: Todos os dados existentes  
✅ **EMP-002**: Empresa vazia, pronta para novos dados  
✅ **Multi-empresa**: Funcionando com separação total  
✅ **Filtros**: Automáticos (via JWT + Middleware)  

---

## 📚 Próximos Passos

1. ✅ Executar o script: `SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql`
2. ✅ Testar no frontend (logout → login → selecionar empresa)
3. ✅ Criar dados teste na EMP-002
4. ✅ Verificar que os dados não se misturam
5. 🎯 Usar o sistema normalmente!

---

**Dúvidas?** Consulte:
- `REFERENCIA_RAPIDA_EMPRESA.md` - Para queries rápidas
- `GUIA_VERIFICACAO_PASSO_A_PASSO.md` - Para verificação completa
- `INDICE_VINCULO_EMPRESA.md` - Para navegar na documentação

---

**Criado em:** 22/10/2025  
**Tempo estimado:** 5 minutos  
**Dificuldade:** ⭐☆☆☆☆ (Muito Fácil)

