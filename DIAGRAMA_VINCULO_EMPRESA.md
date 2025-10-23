# 🎨 Diagrama Visual - Vínculo de Empresa no Sistema MES

## 📊 Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🏢 COMPANY (Empresa)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  id | code | name | tradeName | cnpj | active                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────┬──────────────────┬─────────────┘
                       │                    │                  │
        ┌──────────────┼────────────────┐   │                  │
        │              │                │   │                  │
        ▼              ▼                ▼   ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
│   🔧 MOLD    │ │  📦 ITEM     │ │  🏭 SECTOR   │  │ 👥 USER_COMPANY  │
│ (Molde)      │ │  (Produto)   │ │  (Setor)     │  │ (Vínculo M2M)    │
├──────────────┤ ├──────────────┤ ├──────────────┤  ├──────────────────┤
│ ✅ companyId │ │ ✅ companyId │ │ ✅ companyId │  │ userId           │
│              │ │              │ │              │  │ companyId        │
│              │ │              │ │              │  │ isDefault        │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘  └────────┬─────────┘
       │                │                │                    │
       │                │                │                    ▼
       │                │                │           ┌─────────────────┐
       │                │                │           │   👤 USER       │
       └────────────────┴────────────────┘           │   (Usuário)     │
                        │                            ├─────────────────┤
                        ▼                            │ selectedCompanyId│
              ┌──────────────────┐                   └─────────────────┘
              │ 📋 PRODUCTION    │
              │    ORDER         │
              │ (Ordem Produção) │
              ├──────────────────┤
              │ ✅ companyId     │
              │    moldId        │
              │    itemId        │
              │    plcConfigId   │
              │    sectorId      │
              └────────┬─────────┘
                       │
        ┌──────────────┼─────────────────┬────────────────┐
        │              │                 │                │
        ▼              ▼                 ▼                ▼
┌────────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────┐
│ ✍️ PRODUCTION  │ │ ⏸️ DOWN    │ │ 🚫 PRODUC    │ │ ⏱️ CYCLE     │
│  APPOINTMENT   │ │  TIME      │ │  TION_DEFECT │ │  CHANGE      │
│ (Apontamento)  │ │ (Parada)   │ │  (Defeito)   │ │  (Alt.Ciclo) │
├────────────────┤ ├────────────┤ ├──────────────┤ ├──────────────┤
│❌ SEM companyId│ │❌ SEM      │ │❌ SEM        │ │❌ SEM        │
│                │ │  companyId │ │  companyId   │ │  companyId   │
│                │ │            │ │              │ │              │
│ 🔗 INDIRETO    │ │ 🔗 INDIRETO│ │ 🔗 INDIRETO  │ │ 🔗 INDIRETO  │
│ via order      │ │ via order  │ │ via order    │ │ via order    │
└────────────────┘ └────────────┘ └──────────────┘ └──────────────┘
```

**Legenda:**
- ✅ = Tem campo `companyId` direto
- ❌ = NÃO tem campo `companyId` direto
- 🔗 = Vínculo indireto (requer JOIN)

---

## 🎯 Fluxo de Dados - Exemplo Prático

### Cenário: Usuário lista moldes da sua empresa

```
1️⃣ USUÁRIO FAZ LOGIN
   ┌─────────────────────────────────────────┐
   │ POST /api/auth/login                    │
   │ { email: "op@empresa.com", senha: "..." }│
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ Sistema consulta tabela USERS           │
   │ SELECT * FROM users WHERE email = ?     │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ Sistema verifica USER_COMPANIES         │
   │ SELECT * FROM user_companies            │
   │ WHERE user_id = 1                       │
   │                                         │
   │ Retorna: [Empresa 1, Empresa 2]         │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ Usuário seleciona EMPRESA 1             │
   │ POST /api/auth/select-company           │
   │ { userId: 1, companyId: 1 }             │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ Sistema atualiza SELECTED_COMPANY_ID    │
   │ UPDATE users                            │
   │ SET selected_company_id = 1             │
   │ WHERE id = 1                            │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ Sistema gera JWT TOKEN                  │
   │ {                                       │
   │   userId: 1,                            │
   │   role: "OPERATOR",                     │
   │   companyId: 1  ← EMPRESA NO TOKEN     │
   │ }                                       │
   └─────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2️⃣ USUÁRIO LISTA MOLDES
   ┌─────────────────────────────────────────┐
   │ GET /api/molds                          │
   │ Header: Authorization: Bearer <token>   │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ MIDDLEWARE: injectCompanyId             │
   │ Extrai token → companyId = 1            │
   │ Adiciona em req.user.companyId          │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ CONTROLLER: listMolds                   │
   │ const where = {                         │
   │   ...getCompanyFilter(req)              │
   │ }                                       │
   │ // where = { companyId: 1 }             │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ PRISMA QUERY                            │
   │ SELECT * FROM molds                     │
   │ WHERE company_id = 1                    │
   └─────────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────────┐
   │ RESPOSTA: Apenas moldes da Empresa 1    │
   │ [                                       │
   │   { id: 1, code: "M001", name: "..." }, │
   │   { id: 3, code: "M003", name: "..." }  │
   │ ]                                       │
   └─────────────────────────────────────────┘
```

---

## 🔍 Consultas SQL Equivalentes

### Listar Moldes da Empresa 1 (Direto)
```sql
-- ✅ FÁCIL - Tem companyId direto
SELECT * 
FROM molds 
WHERE company_id = 1;
```

### Listar Itens da Empresa 1 (Direto)
```sql
-- ✅ FÁCIL - Tem companyId direto
SELECT * 
FROM items 
WHERE company_id = 1;
```

### Listar Ordens da Empresa 1 (Direto)
```sql
-- ✅ FÁCIL - Tem companyId direto
SELECT * 
FROM production_orders 
WHERE company_id = 1;
```

### Listar Apontamentos da Empresa 1 (Indireto)
```sql
-- ⚠️ REQUER JOIN - Vínculo indireto
SELECT pa.*, po.order_number, po.company_id
FROM production_appointments pa
INNER JOIN production_orders po 
  ON pa.production_order_id = po.id
WHERE po.company_id = 1;
```

### Listar Paradas da Empresa 1 (Indireto)
```sql
-- ⚠️ REQUER JOIN - Vínculo indireto
SELECT d.*, po.order_number, po.company_id
FROM downtimes d
INNER JOIN production_orders po 
  ON d.production_order_id = po.id
WHERE po.company_id = 1;
```

---

## 🎨 Exemplo Visual de Filtro

### Banco de Dados:

```
┌──────────────────────────────────────────────┐
│ COMPANIES                                    │
├──────────────────────────────────────────────┤
│ 1 | EMP001 | Empresa ABC                     │
│ 2 | EMP002 | Empresa XYZ                     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ MOLDS                                        │
├──────────────────────────────────────────────┤
│ id | code | name         | company_id       │
├──────────────────────────────────────────────┤
│ 1  | M001 | Molde Tampa  | 1 ← Empresa ABC │
│ 2  | M002 | Molde Corpo  | 2 ← Empresa XYZ │
│ 3  | M003 | Molde Base   | 1 ← Empresa ABC │
│ 4  | M004 | Molde Alça   | NULL ← Órfão    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ PRODUCTION_ORDERS                            │
├──────────────────────────────────────────────┤
│ id | order_number | mold_id | company_id    │
├──────────────────────────────────────────────┤
│ 1  | OP-001       | 1       | 1 ← Emp. ABC  │
│ 2  | OP-002       | 2       | 2 ← Emp. XYZ  │
│ 3  | OP-003       | 3       | 1 ← Emp. ABC  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ PRODUCTION_APPOINTMENTS                      │
├──────────────────────────────────────────────┤
│ id | production_order_id | quantity          │
├──────────────────────────────────────────────┤
│ 1  | 1 → OP-001 (Emp 1)  | 100              │
│ 2  | 1 → OP-001 (Emp 1)  | 150              │
│ 3  | 2 → OP-002 (Emp 2)  | 200              │
│ 4  | 3 → OP-003 (Emp 1)  | 50               │
└──────────────────────────────────────────────┘
```

### Query do Usuário da Empresa 1:

```typescript
// Frontend envia token JWT com companyId = 1

GET /api/molds
→ Middleware extrai: companyId = 1
→ Filtro aplicado: WHERE company_id = 1
→ Resultado: [Molde M001, Molde M003]  ✅ Apenas empresa 1
```

```typescript
GET /api/production-appointments
→ Middleware extrai: companyId = 1
→ JOIN com production_orders
→ Filtro: WHERE production_orders.company_id = 1
→ Resultado: [Apontamento 1, 2, 4]  ✅ Apenas ordens da empresa 1
```

---

## 📁 Arquitetura de Código

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  localStorage.getItem('token')                          │   │
│  │  ↓                                                      │   │
│  │  Authorization: Bearer eyJhbGci...                      │   │
│  │                                                         │   │
│  │  { userId: 1, role: "OPERATOR", companyId: 1 }         │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1️⃣ ROUTES (moldRoutes.ts)                             │   │
│  │     router.use(injectCompanyId)  ← Middleware           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  2️⃣ MIDDLEWARE (companyFilter.ts)                       │   │
│  │     - Extrai JWT                                        │   │
│  │     - Decodifica token                                  │   │
│  │     - Injeta companyId em req.user                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  3️⃣ CONTROLLER (moldController.ts)                      │   │
│  │     const where = {                                     │   │
│  │       ...getCompanyFilter(req, false)                   │   │
│  │     }                                                   │   │
│  │     // where = { companyId: 1 }                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  4️⃣ PRISMA ORM                                          │   │
│  │     prisma.mold.findMany({                             │   │
│  │       where: { companyId: 1 }                          │   │
│  │     })                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SQL Query
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SELECT * FROM molds WHERE company_id = 1;              │   │
│  │                                                         │   │
│  │  Result: [                                              │   │
│  │    { id: 1, code: "M001", company_id: 1 },              │   │
│  │    { id: 3, code: "M003", company_id: 1 }               │   │
│  │  ]                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificação

Use este checklist para garantir que o vínculo está funcionando:

```
□ Empresas cadastradas na tabela companies
□ Usuários vinculados a empresas via user_companies
□ Usuário tem selected_company_id definido
□ JWT contém companyId no payload
□ Middleware injectCompanyId aplicado nas rotas
□ Controllers usam getCompanyFilter(req)
□ Moldes têm company_id preenchido
□ Itens têm company_id preenchido
□ Ordens têm company_id preenchido
□ Filtros retornam apenas dados da empresa logada
```

---

## 🔧 Ferramentas de Debug

### 1. Verificar Token JWT (Frontend - Console):
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token Payload:', payload);
// Deve mostrar: { userId: 1, role: "...", companyId: 1 }
```

### 2. Verificar Filtro no Backend (Log):
```typescript
// Adicionar no controller:
console.log('CompanyId do usuário:', req.user?.companyId);
console.log('Filtro aplicado:', getCompanyFilter(req));
```

### 3. Verificar SQL Gerado (Prisma):
```typescript
// Habilitar logs do Prisma
// backend/src/config/database.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

**Data**: 22/10/2025  
**Versão**: 1.0  
**Status**: ✅ Documentação Completa

