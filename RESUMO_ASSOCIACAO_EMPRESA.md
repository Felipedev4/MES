# 📋 RESUMO - Associar Dados à Empresa EMP-001

## 🎯 Sua Solicitação

> "Passar as informações para a empresa EMP-001, então quando logar com a empresa EMP-02, as informações não aparecerão"

---

## ✅ Solução Pronta

Criei **3 arquivos** para você executar facilmente:

### 1️⃣ **SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql** ⭐ EXECUTE ESTE!

**O que faz:**
- ✅ Cria empresas EMP-001 e EMP-002
- ✅ Associa TODOS os moldes à EMP-001
- ✅ Associa TODOS os itens à EMP-001  
- ✅ Associa TODAS as ordens à EMP-001
- ✅ Vincula seu usuário às duas empresas
- ✅ Define EMP-001 como padrão

**Como usar:**
1. Abra PgAdmin, DBeaver ou psql
2. Cole TODO o conteúdo do arquivo
3. Execute!
4. Pronto em 1 segundo! ✅

---

### 2️⃣ **COMO_EXECUTAR_ASSOCIACAO.md** 📖 LEIA SE TIVER DÚVIDA

**Contém:**
- 3 opções de execução (PgAdmin, psql, Prisma Studio)
- Passo a passo detalhado
- Como testar no frontend
- Troubleshooting

---

### 3️⃣ **ASSOCIAR_DADOS_EMPRESA_001.sql** 🔍 VERSÃO COMPLETA

**Contém:**
- Script completo com verificações
- Queries de diagnóstico
- Explicações detalhadas
- Teste automático

*(Use se quiser ver o que está acontecendo em cada etapa)*

---

## ⚡ Execução Rápida (30 segundos)

### Opção A: PgAdmin ou DBeaver

```
1. Abrir PgAdmin/DBeaver
2. Conectar ao banco mes_db
3. Abrir arquivo: SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql
4. Executar tudo (Ctrl+A → F5)
5. Pronto! ✅
```

### Opção B: psql (PowerShell)

```powershell
$env:PGPASSWORD = "postgres"
psql -U postgres -d mes_db -f SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql
```

---

## 🧪 Como Testar

### 1. Frontend - Logout e Login

```
1. Abrir http://localhost:3000
2. Fazer logout
3. Fazer login novamente
4. Deve aparecer tela de seleção de empresa:
   - [x] EMP-001 - Empresa Principal (padrão)
   - [ ] EMP-002 - Empresa Secundária
```

### 2. Testar com EMP-001

```
1. Selecionar EMP-001
2. Ir para lista de moldes
3. ✅ Deve ver TODOS os moldes
4. Ir para lista de itens
5. ✅ Deve ver TODOS os itens
```

### 3. Testar com EMP-002

```
1. Trocar para EMP-002 (botão no header)
2. Ir para lista de moldes
3. ✅ NÃO deve ver NENHUM molde
4. Ir para lista de itens
5. ✅ NÃO deve ver NENHUM item
```

### 4. Criar Dado Teste na EMP-002

```
1. Ainda na EMP-002, criar novo molde:
   - Código: M-EMP002-001
   - Nome: Molde Teste EMP-002
2. ✅ Molde criado com sucesso
```

### 5. Verificar Separação

```
1. Trocar para EMP-001
2. ✅ NÃO deve ver "Molde Teste EMP-002"
3. Trocar para EMP-002  
4. ✅ Deve ver APENAS "Molde Teste EMP-002"
```

**🎉 Se todos os testes passarem: Sistema multi-empresa funcionando perfeitamente!**

---

## 📊 Resultado Esperado

### Banco de Dados (Após Executar Script)

```
┌──────────────────────────────────────────┐
│ EMPRESAS                                 │
├──────────────────────────────────────────┤
│ EMP-001 | Empresa Principal             │
│ EMP-002 | Empresa Secundária            │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ MOLDES                                   │
├──────────────────────────────────────────┤
│ M001 | Molde 1 | company_id: 1 (EMP-001)│
│ M002 | Molde 2 | company_id: 1 (EMP-001)│
│ M003 | Molde 3 | company_id: 1 (EMP-001)│
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ ITENS                                    │
├──────────────────────────────────────────┤
│ I001 | Item 1  | company_id: 1 (EMP-001)│
│ I002 | Item 2  | company_id: 1 (EMP-001)│
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ ORDENS                                   │
├──────────────────────────────────────────┤
│ OP-001 | ...   | company_id: 1 (EMP-001)│
│ OP-002 | ...   | company_id: 1 (EMP-001)│
└──────────────────────────────────────────┘
```

### Frontend

**Usuário logado com EMP-001:**
```
📋 Moldes: [M001, M002, M003, ...]
📦 Itens: [I001, I002, ...]
📋 Ordens: [OP-001, OP-002, ...]
```

**Usuário logado com EMP-002:**
```
📋 Moldes: [vazio]
📦 Itens: [vazio]
📋 Ordens: [vazio]
```

---

## 🔍 Verificação Rápida (SQL)

Execute esta query para ver a distribuição:

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
 EMP-002  |     0  |    0  |    0     ← Vazio
```

---

## 📚 Arquivos Criados

| Arquivo | Propósito | Quando Usar |
|---------|-----------|-------------|
| **SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql** | Script SQL rápido | ⭐ Execute este primeiro! |
| **COMO_EXECUTAR_ASSOCIACAO.md** | Guia de execução | Se tiver dúvida como executar |
| **ASSOCIAR_DADOS_EMPRESA_001.sql** | Script completo | Para ver detalhes e diagnósticos |
| **EXECUTAR_ASSOCIACAO_EMP001.ps1** | Script PowerShell | Automatiza execução (opcional) |
| **RESUMO_ASSOCIACAO_EMPRESA.md** | Este arquivo | Visão geral |

---

## 🎯 Próximos Passos

```
1. ✅ Executar: SCRIPT_RAPIDO_ASSOCIAR_EMP001.sql (1 min)
2. 🔄 Fazer: Logout no frontend
3. 🔑 Fazer: Login novamente  
4. 🏢 Selecionar: EMP-001 → Ver todos os dados
5. 🏢 Selecionar: EMP-002 → Ver empresa vazia
6. ✅ Criar: Molde teste na EMP-002
7. 🔄 Trocar: Para EMP-001 → Não ver molde da EMP-002
8. 🎉 Confirmar: Sistema multi-empresa funcionando!
```

**Tempo total:** ~5 minutos

---

## 💡 Dicas

### Trocar de Empresa no Frontend

Procure no header do sistema um botão com ícone de empresa ou menu dropdown. Deve mostrar:
- **Empresa atual:** EMP-001 - Empresa Principal
- **Trocar para:** EMP-002 - Empresa Secundária

### Criar Usuários Diferentes por Empresa

Se quiser, pode criar usuários específicos para cada empresa:

```sql
-- Usuário apenas da EMP-001
INSERT INTO users (email, password, name, role, active, must_change_password, created_at, updated_at)
VALUES ('emp001@empresa.com', '$2b$10$...', 'Usuário EMP-001', 'OPERATOR', true, false, NOW(), NOW());

-- Vincular apenas à EMP-001
INSERT INTO user_companies (user_id, company_id, is_default)
VALUES (
    (SELECT id FROM users WHERE email = 'emp001@empresa.com'),
    (SELECT id FROM companies WHERE code = 'EMP-001'),
    true
);
```

---

## 🚨 Se Algo Der Errado

### Reverter Mudanças

```sql
-- Desvincular tudo (voltar ao estado órfão)
UPDATE molds SET company_id = NULL;
UPDATE items SET company_id = NULL;
UPDATE production_orders SET company_id = NULL;
```

### Executar Novamente

Não tem problema executar o script múltiplas vezes! Ele usa `ON CONFLICT` e `UPDATE`, então é seguro.

---

## 📞 Documentação Relacionada

Para mais informações:

- 📖 **LEIA_ME_PRIMEIRO_VINCULO_EMPRESA.md** - Introdução geral
- ⚡ **REFERENCIA_RAPIDA_EMPRESA.md** - Cheat sheet
- ✅ **GUIA_VERIFICACAO_PASSO_A_PASSO.md** - Verificação completa
- 📚 **INDICE_VINCULO_EMPRESA.md** - Índice de toda documentação

---

## ✅ Checklist Final

Antes de começar:
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 3000)
- [ ] PostgreSQL rodando
- [ ] Ferramenta SQL pronta (PgAdmin/DBeaver/psql)

Após executar script:
- [ ] Script executado sem erros
- [ ] Query de verificação mostra EMP-001 com dados
- [ ] Query de verificação mostra EMP-002 vazia
- [ ] Logout e login no frontend
- [ ] Tela de seleção de empresa aparece
- [ ] EMP-001 mostra todos os dados
- [ ] EMP-002 não mostra nenhum dado
- [ ] Criou molde teste na EMP-002
- [ ] Molde da EMP-002 não aparece na EMP-001
- [ ] Sistema multi-empresa funcionando! 🎉

---

**Criado em:** 22/10/2025  
**Status:** ✅ Pronto para executar  
**Dificuldade:** ⭐☆☆☆☆ (Muito Fácil)

