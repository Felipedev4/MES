# ⚡ Referência Rápida - Vínculo de Empresa

## 📋 Resumo de 1 Minuto

```
✅ Tem companyId direto:
   - Mold (molde)
   - Item (produto)
   - ProductionOrder (ordem)
   - Sector (setor)

❌ Vínculo indireto (via ordem):
   - ProductionAppointment (apontamento)
   - Downtime (parada)
   - ProductionDefect (defeito)

🔑 CompanyId vem de:
   JWT Token → Middleware → Controller → Filtro
```

---

## 🚀 Queries Rápidas

### ✅ Filtro Direto (Moldes, Itens, Ordens)
```typescript
// Backend - Controller
const where: any = {
  ...getCompanyFilter(req, false),  // ← Adiciona companyId
};

const moldes = await prisma.mold.findMany({ where });
```

### ⚠️ Filtro Indireto (Apontamentos)
```typescript
// Backend - Controller
const apontamentos = await prisma.productionAppointment.findMany({
  where: {
    productionOrder: {
      companyId: req.user?.companyId  // ← JOIN necessário
    }
  },
  include: {
    productionOrder: {
      include: { company: true, item: true, mold: true }
    }
  }
});
```

---

## 🔑 JWT Token

### Estrutura
```json
{
  "userId": 1,
  "role": "OPERATOR",
  "companyId": 1,  // ← Empresa selecionada
  "iat": 1729641000,
  "exp": 1729669800
}
```

### Ver no Frontend
```javascript
// Console do navegador
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

---

## 🛠️ Middleware

### Aplicar nas Rotas
```typescript
// backend/src/routes/moldRoutes.ts
import { injectCompanyId } from '../middleware/companyFilter';

router.use(injectCompanyId);  // ← Injeta companyId
```

### Exigir Empresa
```typescript
import { requireCompany } from '../middleware/companyFilter';

router.get('/', requireCompany, listItems);  // ← Exige empresa
```

---

## 📊 SQL Direto

### Moldes da Empresa 1
```sql
SELECT * FROM molds WHERE company_id = 1;
```

### Itens da Empresa 1
```sql
SELECT * FROM items WHERE company_id = 1;
```

### Ordens da Empresa 1
```sql
SELECT * FROM production_orders WHERE company_id = 1;
```

### Apontamentos da Empresa 1 (com JOIN)
```sql
SELECT pa.*, po.order_number
FROM production_appointments pa
INNER JOIN production_orders po ON pa.production_order_id = po.id
WHERE po.company_id = 1;
```

---

## 🚨 Correção Rápida de Órfãos

```sql
-- Associar moldes sem empresa à empresa 1
UPDATE molds SET company_id = 1 WHERE company_id IS NULL;

-- Associar itens sem empresa à empresa 1
UPDATE items SET company_id = 1 WHERE company_id IS NULL;

-- Associar ordens sem empresa à empresa 1
UPDATE production_orders SET company_id = 1 WHERE company_id IS NULL;

-- Vincular usuário 1 à empresa 1
INSERT INTO user_companies (user_id, company_id, is_default)
VALUES (1, 1, true)
ON CONFLICT (user_id, company_id) DO NOTHING;

-- Selecionar empresa 1 para usuário 1
UPDATE users SET selected_company_id = 1 WHERE id = 1;
```

---

## 🧪 Testes Rápidos

### 1. Verificar Empresas
```sql
SELECT * FROM companies;
```

### 2. Verificar Usuário-Empresa
```sql
SELECT u.name, c.name as empresa, uc.is_default
FROM user_companies uc
JOIN users u ON uc.user_id = u.id
JOIN companies c ON uc.company_id = c.id;
```

### 3. Contar Registros por Empresa
```sql
-- Moldes
SELECT company_id, COUNT(*) FROM molds GROUP BY company_id;

-- Itens
SELECT company_id, COUNT(*) FROM items GROUP BY company_id;

-- Ordens
SELECT company_id, COUNT(*) FROM production_orders GROUP BY company_id;

-- Apontamentos (via ordem)
SELECT po.company_id, COUNT(pa.id)
FROM production_appointments pa
JOIN production_orders po ON pa.production_order_id = po.id
GROUP BY po.company_id;
```

---

## 📁 Arquivos Importantes

```
backend/src/
├── middleware/
│   └── companyFilter.ts       ← Extrai companyId do JWT
├── controllers/
│   ├── moldController.ts      ← Usa getCompanyFilter
│   ├── itemController.ts      ← Usa getCompanyFilter
│   └── productionOrderController.ts
└── routes/
    ├── moldRoutes.ts          ← Aplica injectCompanyId
    └── itemRoutes.ts          ← Aplica injectCompanyId
```

---

## 🎯 Fluxo Simplificado

```
1. Usuário faz login → Seleciona empresa → Recebe JWT com companyId
2. Frontend envia requests com token no header
3. Middleware extrai companyId do token
4. Controller adiciona filtro { companyId: X }
5. Prisma/SQL filtra apenas dados da empresa
6. Usuário vê apenas seus dados
```

---

## 💡 Comandos Úteis

### Backend
```bash
# Regenerar Prisma Client
cd backend
npx prisma generate

# Ver banco de dados
npx prisma studio

# Aplicar migrations
npx prisma db push
```

### Logs do Prisma
```typescript
// backend/src/config/database.ts
const prisma = new PrismaClient({
  log: ['query'],  // Ver SQL gerado
});
```

---

## 🔍 Debug Checklist

```
□ Token tem companyId no payload?
□ Middleware injectCompanyId está aplicado?
□ Controller usa getCompanyFilter(req)?
□ Registros têm company_id preenchido?
□ SQL está filtrando por company_id?
```

---

## 📞 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `VINCULO_EMPRESA_EXPLICACAO.md` | Explicação completa e detalhada |
| `COMO_FUNCIONA_VINCULO_EMPRESA.md` | Guia prático com exemplos |
| `DIAGRAMA_VINCULO_EMPRESA.md` | Diagramas visuais |
| `VERIFICAR_VINCULOS_EMPRESA.sql` | Script SQL de verificação |
| `SISTEMA_MULTI_EMPRESA.md` | Documentação original |

---

## ⚡ Atalhos de Código

### Controller com Filtro
```typescript
export async function listItems(req: AuthenticatedRequest, res: Response) {
  const where: any = {
    ...getCompanyFilter(req, false),
  };
  const items = await prisma.item.findMany({ where });
  res.json(items);
}
```

### Controller com Join (Apontamentos)
```typescript
export async function listAppointments(req: AuthenticatedRequest, res: Response) {
  const appointments = await prisma.productionAppointment.findMany({
    where: {
      productionOrder: { companyId: req.user?.companyId }
    },
    include: {
      productionOrder: { include: { company: true } }
    }
  });
  res.json(appointments);
}
```

### Rota com Middleware
```typescript
import { authenticateToken } from '../middleware/auth';
import { injectCompanyId, requireCompany } from '../middleware/companyFilter';

router.use(authenticateToken);
router.use(injectCompanyId);
router.get('/', requireCompany, listItems);
```

---

**Atualizado**: 22/10/2025  
**Versão**: 1.0

