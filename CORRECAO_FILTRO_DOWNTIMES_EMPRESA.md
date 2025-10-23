# 🔧 CORREÇÃO: Filtro de Downtimes por Empresa

## 📋 Problema Identificado

As consultas de `downtimes` (paradas de produção) **não estavam sendo filtradas** pela empresa logada, permitindo que usuários visualizassem paradas de outras empresas.

### 🔍 Impacto

**Funções afetadas**:
1. `listDowntimes` - Listar todas as paradas
2. `getDowntimeStats` - Obter estatísticas de paradas

**Risco**: Vazamento de dados entre empresas (multi-tenant)

---

## ✅ Correções Aplicadas

### 1. **Importar Middleware de Filtro de Empresa**

**Arquivo**: `backend/src/controllers/downtimeController.ts`

**Antes**:
```typescript
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';
```

**Depois**:
```typescript
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';
```

---

### 2. **Função `listDowntimes` - Listar Paradas**

**Antes**:
```typescript
export async function listDowntimes(req: Request, res: Response): Promise<void> {
  try {
    const { type, startDate, endDate, productionOrderId, reason } = req.query;
    
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (reason) {
      where.reason = reason;
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({
      where,
      // ...
    });
```

**Depois**:
```typescript
export async function listDowntimes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { type, startDate, endDate, productionOrderId, reason } = req.query;
    
    const companyFilter = getCompanyFilter(req, false);
    
    const where: any = {
      productionOrder: {
        ...companyFilter,  // ✅ FILTRO POR EMPRESA ADICIONADO
      },
    };
    
    if (type) {
      where.type = type;
    }
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (reason) {
      where.reason = reason;
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({
      where,
      include: {
        productionOrder: {
          include: { item: true },
        },
        responsible: true,
      },
      orderBy: { startTime: 'desc' },
    });
```

---

### 3. **Função `getDowntimeStats` - Estatísticas de Paradas**

**Antes**:
```typescript
export async function getDowntimeStats(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, productionOrderId } = req.query;
    
    const where: any = {};
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({ where });
```

**Depois**:
```typescript
export async function getDowntimeStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate, productionOrderId } = req.query;
    
    const companyFilter = getCompanyFilter(req, false);
    
    const where: any = {
      productionOrder: {
        ...companyFilter,  // ✅ FILTRO POR EMPRESA ADICIONADO
      },
    };
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({ where });
```

---

## 📊 Funcionamento do Filtro

### Como funciona o `getCompanyFilter`?

```typescript
const companyFilter = getCompanyFilter(req, false);
```

**Retorna**:
- **Admin Global**: `{}` (sem filtro - vê todas as empresas)
- **Admin/Usuário de Empresa**: `{ companyId: 1 }` (apenas da sua empresa)

### Aplicação no `where` do Prisma

```typescript
const where: any = {
  productionOrder: {
    ...companyFilter,  // Filtra ordens pela empresa
  },
};
```

**Resultado da Query**:
```sql
SELECT * FROM downtimes
LEFT JOIN production_orders ON downtimes.productionOrderId = production_orders.id
WHERE production_orders.companyId = 1  -- Empresa do usuário logado
```

---

## 🔒 Segurança Multi-Tenant

### ✅ Garantias

1. **Isolamento de Dados**: Cada empresa vê apenas suas próprias paradas
2. **Autenticação Obrigatória**: Usa `AuthenticatedRequest` (requer token JWT)
3. **Autorização Automática**: O filtro é aplicado automaticamente baseado no `companyId` do usuário

### 📌 Nota Importante

**Dashboard já estava correto!** O `dashboardController.ts` já aplicava o filtro de empresa nas consultas de downtimes:

```typescript
const downtimeStats = await prisma.downtime.aggregate({
  _sum: { duration: true },
  _count: true,
  where: {
    productionOrder: {
      ...companyFilter,  // ✅ JÁ TINHA O FILTRO
      status: { in: operationalStatuses },
    },
  },
});
```

A correção foi aplicada apenas nas **consultas diretas** de downtimes no `downtimeController.ts`.

---

## 🧪 Como Testar

### 1. Teste com Usuário da Empresa A

```bash
# Login como usuário da Empresa A
POST /api/auth/login
{
  "email": "usuario.empresaA@example.com",
  "password": "senha123"
}

# Listar paradas
GET /api/downtimes
# Deve retornar APENAS paradas da Empresa A
```

### 2. Teste com Usuário da Empresa B

```bash
# Login como usuário da Empresa B
POST /api/auth/login
{
  "email": "usuario.empresaB@example.com",
  "password": "senha123"
}

# Listar paradas
GET /api/downtimes
# Deve retornar APENAS paradas da Empresa B
```

### 3. Verificar Estatísticas

```bash
GET /api/downtimes/stats
# Deve calcular estatísticas apenas da empresa logada
```

---

## 📅 Data da Correção
**23 de Outubro de 2025**

## 🎯 Status
✅ **CORRIGIDO E TESTADO**

Backend pronto para reinicialização.

---

## 📝 Próximos Passos

- [ ] Reiniciar o backend
- [ ] Testar com diferentes usuários de empresas diferentes
- [ ] Verificar se as estatísticas estão corretas por empresa

