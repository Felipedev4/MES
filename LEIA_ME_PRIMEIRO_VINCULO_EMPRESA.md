# 👋 LEIA-ME PRIMEIRO - Vínculo de Empresa

## 🎯 Sua Dúvida

> "Não consegui identificar o vínculo da empresa logada com os registros de ordem, molde e apontamentos"

---

## ✅ Resposta Rápida

**Seu sistema JÁ ESTÁ FUNCIONANDO com filtro multi-empresa!** 🎉

Aqui está como funciona:

```
1. Usuário faz login → Seleciona empresa
2. Sistema gera JWT com companyId
3. Middleware extrai companyId do token
4. Controllers filtram dados automaticamente
5. Usuário vê apenas dados da sua empresa ✅
```

---

## 📚 Documentação Criada para Você

Criei **7 documentos** para te ajudar a entender completamente:

### 🌟 **Comece por aqui:**

1. **📄 INDICE_VINCULO_EMPRESA.md** ← COMECE AQUI!
   - Índice geral de todos os documentos
   - Te direciona para o documento certo

2. **📄 REFERENCIA_RAPIDA_EMPRESA.md** ⚡
   - Consulta rápida (5 min)
   - Queries prontas
   - Comandos úteis

3. **📄 GUIA_VERIFICACAO_PASSO_A_PASSO.md** 🔍
   - Verificação completa (20 min)
   - Checklist
   - Testes práticos

---

## 🚀 O Que Fazer Agora?

### Opção 1: Entendimento Rápido (5 minutos)
```bash
1. Abrir: REFERENCIA_RAPIDA_EMPRESA.md
2. Ler seção "Resumo de 1 Minuto"
3. Pronto! Já sabe como funciona ✅
```

### Opção 2: Verificação Completa (20 minutos)
```bash
1. Abrir: GUIA_VERIFICACAO_PASSO_A_PASSO.md
2. Seguir os 8 passos
3. Sistema verificado e funcionando ✅
```

### Opção 3: Diagnóstico do Banco (2 minutos)
```bash
1. Abrir PostgreSQL (psql, PgAdmin, etc)
2. Executar: VERIFICAR_VINCULOS_EMPRESA.sql
3. Ver relatório completo ✅
```

---

## 🎯 Estrutura Resumida

### ✅ Tem `companyId` direto (fácil de filtrar):
- **Mold** (Molde) → `companyId`
- **Item** (Produto) → `companyId`
- **ProductionOrder** (Ordem) → `companyId`
- **Sector** (Setor) → `companyId`

### ⚠️ Vínculo indireto (via ProductionOrder):
- **ProductionAppointment** → `order.companyId`
- **Downtime** → `order.companyId`
- **ProductionDefect** → `order.companyId`

---

## 🔑 Como Funciona (Resumo Visual)

```
┌─────────────────────────────────────────────┐
│ 👤 USUÁRIO FAZ LOGIN                        │
│ → Seleciona "Empresa ABC"                   │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 🔑 JWT TOKEN GERADO                         │
│ {                                           │
│   userId: 1,                                │
│   companyId: 1  ← EMPRESA ABC              │
│ }                                           │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 🌐 FRONTEND ENVIA REQUESTS                  │
│ Header: Authorization: Bearer <token>       │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 🔐 MIDDLEWARE (Backend)                     │
│ → Extrai token                              │
│ → Pega companyId = 1                        │
│ → Injeta em req.user.companyId              │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 🎯 CONTROLLER                               │
│ const where = {                             │
│   companyId: req.user.companyId  // = 1     │
│ }                                           │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 💾 BANCO DE DADOS                           │
│ SELECT * FROM molds                         │
│ WHERE company_id = 1                        │
│                                             │
│ Resultado: Apenas moldes da Empresa ABC ✅  │
└─────────────────────────────────────────────┘
```

---

## 🧪 Teste Rápido (30 segundos)

Quer ver funcionando AGORA?

### 1. Frontend - Ver token (F12 no navegador):
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// Deve mostrar: { userId: 1, companyId: 1, ... }
```

### 2. Banco de Dados - Ver moldes por empresa:
```sql
SELECT company_id, COUNT(*) 
FROM molds 
GROUP BY company_id;
```

### 3. Backend - Ver filtro nos logs:
```typescript
// Editar: backend/src/config/database.ts
const prisma = new PrismaClient({
  log: ['query']  // ← Adicionar
});

// Reiniciar backend e fazer request
// Log vai mostrar: WHERE company_id = 1
```

---

## 🚨 Problemas Comuns

### ❌ "Não vejo moldes/itens no sistema"

**Causa:** Registros sem `company_id`  
**Solução rápida:**
```sql
UPDATE molds SET company_id = 1 WHERE company_id IS NULL;
UPDATE items SET company_id = 1 WHERE company_id IS NULL;
UPDATE production_orders SET company_id = 1 WHERE company_id IS NULL;
```

### ❌ "Token não tem companyId"

**Causa:** Usuário sem empresa vinculada  
**Solução rápida:**
```sql
-- Vincular usuário 1 à empresa 1
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (1, 1, true, NOW(), NOW());

-- Definir empresa selecionada
UPDATE users SET selected_company_id = 1 WHERE id = 1;
```

---

## 📋 Lista de Arquivos Criados

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **INDICE_VINCULO_EMPRESA.md** | 📚 Índice geral | Primeiro arquivo a abrir |
| **REFERENCIA_RAPIDA_EMPRESA.md** | ⚡ Cheat sheet | Consultas diárias |
| **GUIA_VERIFICACAO_PASSO_A_PASSO.md** | ✅ Checklist | Verificação inicial |
| **VERIFICAR_VINCULOS_EMPRESA.sql** | 🔍 Diagnóstico | Ver estado do banco |
| **COMO_FUNCIONA_VINCULO_EMPRESA.md** | 📖 Explicação completa | Aprendizado detalhado |
| **VINCULO_EMPRESA_EXPLICACAO.md** | 🏗️ Arquitetura | Entender estrutura |
| **DIAGRAMA_VINCULO_EMPRESA.md** | 🎨 Visual | Aprender visualmente |

---

## 🎓 Roteiro Recomendado

### Para você que está começando:

```
1. 📖 Leia: LEIA_ME_PRIMEIRO_VINCULO_EMPRESA.md (este arquivo) - 3 min
2. 📖 Leia: REFERENCIA_RAPIDA_EMPRESA.md - 5 min
3. ✅ Execute: GUIA_VERIFICACAO_PASSO_A_PASSO.md - 20 min

Total: ~30 minutos
Resultado: Compreensão completa do sistema ✅
```

---

## 💡 Dica Final

**Não precisa ler TODOS os documentos!**

1. 🌟 Comece com: `REFERENCIA_RAPIDA_EMPRESA.md`
2. 🔍 Se tiver dúvidas: `GUIA_VERIFICACAO_PASSO_A_PASSO.md`
3. 📚 Para aprofundar: Use o `INDICE_VINCULO_EMPRESA.md` para encontrar o documento certo

---

## 🎉 Conclusão

Seu sistema **JÁ FUNCIONA** com multi-empresa! 

Os documentos criados vão te ajudar a:
- ✅ Entender como funciona
- ✅ Verificar se está correto
- ✅ Corrigir problemas
- ✅ Consultar rapidamente

---

## 🚀 Próximo Passo

**Abra agora:** [`INDICE_VINCULO_EMPRESA.md`](./INDICE_VINCULO_EMPRESA.md)

Ele vai te guiar para o documento certo baseado no que você precisa! 🎯

---

**Criado em:** 22/10/2025  
**Tempo de leitura:** 3 minutos  
**Nível:** Iniciante

---

**💬 Tem dúvidas?** Todos os documentos têm seções de troubleshooting e exemplos práticos!

