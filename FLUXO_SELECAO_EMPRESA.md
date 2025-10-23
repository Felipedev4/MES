# Fluxo de Seleção de Empresa e Vinculação de Ordens

## 📋 Descrição

Sistema completo de multi-empresa onde colaboradores podem ter acesso a múltiplas empresas e devem selecionar uma empresa para trabalhar. Todas as ordens de produção, itens, moldes e outros cadastros são automaticamente vinculados à empresa selecionada.

## 🔄 Fluxo Completo de Login e Seleção de Empresa

### 1️⃣ **Login Inicial**

**Página**: `/login`

```typescript
// Frontend: Login.tsx
const handleLogin = async () => {
  const response = await login(email, password);
  
  if (response.requiresCompanySelection && response.companies.length > 1) {
    // Usuário tem múltiplas empresas
    navigate('/select-company', { 
      state: { user, companies }
    });
  } else {
    // Usuário tem apenas 1 empresa ou nenhuma
    navigate('/dashboard');
  }
};
```

**Backend**: Retorna estrutura:
```json
{
  "token": "eyJhbGciOi..." ou null,
  "user": {
    "id": 1,
    "email": "admin@mes.com",
    "name": "Admin",
    "role": "ADMIN"
  },
  "companies": [
    { "id": 1, "name": "Empresa Norte", "code": "EMP-NORTE" },
    { "id": 2, "name": "Empresa Sul", "code": "EMP-SUL" }
  ],
  "requiresCompanySelection": true
}
```

**Comportamento**:
- ✅ **1 Empresa**: Token JWT gerado imediatamente com `companyId`
- ✅ **Múltiplas Empresas**: Token `null`, usuário deve selecionar
- ✅ **Sem Empresas**: Token `null`, exibir mensagem de erro

---

### 2️⃣ **Seleção de Empresa** (Se múltiplas empresas)

**Página**: `/select-company`

**Componente**: `SelectCompany.tsx`

**Funcionalidades**:
- Exibe lista de empresas do usuário
- Pré-seleciona empresa padrão (se definida)
- Permite escolher empresa manualmente
- Botão "Selecionar Empresa"

```typescript
// Frontend: SelectCompany.tsx
const handleSelectCompany = async () => {
  // Chama endpoint /auth/select-company
  await authSelectCompany(selectedCompanyId);
  
  // Redireciona para dashboard
  navigate('/dashboard');
};
```

**Backend**: Endpoint `/auth/select-company`

```typescript
// Request
POST /auth/select-company
{
  "userId": 1,
  "companyId": 1
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... },
  "company": {
    "id": 1,
    "code": "EMP-NORTE",
    "name": "Empresa Norte S.A.",
    "tradeName": "Norte Indústria"
  }
}
```

**O que acontece**:
1. Verifica se usuário tem acesso à empresa (tabela `user_companies`)
2. Atualiza `selectedCompanyId` do usuário
3. **Gera novo token JWT** com `companyId` incluído
4. Retorna token e dados da empresa

---

### 3️⃣ **Armazenamento Local**

**LocalStorage** (após seleção):
```javascript
localStorage.setItem('@MES:token', token);         // JWT com companyId
localStorage.setItem('@MES:user', JSON.stringify(user));
localStorage.setItem('@MES:company', JSON.stringify(company));
```

**AuthContext** (estado global):
```typescript
{
  user: User,
  selectedCompany: Company,
  companies: Company[],
  isAuthenticated: boolean
}
```

---

### 4️⃣ **Indicação Visual da Empresa Selecionada**

**Header/AppBar** (`Layout.tsx`):

Exibe chip com:
- 🏢 Ícone de empresa (BusinessIcon)
- Nome da empresa
- Cor secundária
- Bordas brancas

```tsx
<Chip
  icon={<BusinessIcon />}
  label={selectedCompany.name}
  color="secondary"
  variant="outlined"
/>
```

**Visível em**: Todas as páginas do sistema (exceto login e select-company)

---

## 📊 Vinculação de Ordens de Produção à Empresa

### Como Funciona

**1. Token JWT contém `companyId`**:
```json
{
  "userId": 1,
  "role": "ADMIN",
  "companyId": 1  // ← Empresa selecionada
}
```

**2. Middleware extrai `companyId` do token**:

```typescript
// backend/src/middleware/companyFilter.ts
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
    companyId?: number;  // ← Extraído do JWT
  };
}
```

**3. Criação de Ordem de Produção**:

```typescript
// backend/src/controllers/productionOrderController.ts
export async function createProductionOrder(req: AuthenticatedRequest, res: Response) {
  const companyId = req.user?.companyId; // ← Pega do JWT
  
  const order = await prisma.productionOrder.create({
    data: {
      orderNumber,
      itemId,
      moldId,
      companyId,  // ← Vincula à empresa automaticamente
      plannedQuantity,
      // ...
    },
  });
}
```

**4. Filtro de Listagem**:

```typescript
// backend/src/controllers/productionOrderController.ts
export async function listProductionOrders(req: AuthenticatedRequest, res: Response) {
  const where: any = {
    ...getCompanyFilter(req, false), // ← Filtra por empresa
  };
  
  const orders = await prisma.productionOrder.findMany({ where });
}
```

---

## 🔐 Segurança e Isolamento de Dados

### ✅ Garantias de Segurança

1. **Isolamento por Empresa**:
   - Usuário de Empresa A **não vê** dados da Empresa B
   - Cada token JWT é específico para uma empresa
   - Filtros automáticos aplicados em todas queries

2. **Validação de Acesso**:
   - Ao selecionar empresa, verifica se usuário tem acesso
   - Tabela `user_companies` controla permissões
   - Tentativa de acesso não autorizado retorna erro 400

3. **Auditoria**:
   - Todas ordens têm `companyId` gravado
   - Rastreável qual empresa criou qual ordem
   - Logs de seleção de empresa no backend

---

## 📁 Cadastros Vinculados à Empresa

Os seguintes cadastros **devem** ter `companyId`:

| Cadastro | Tabela | Campo |
|----------|--------|-------|
| ✅ Ordens de Produção | `production_orders` | `companyId` |
| ✅ Itens | `items` | `companyId` |
| ✅ Moldes | `molds` | `companyId` |
| ✅ CLPs | `plc_configs` | `companyId` |
| ✅ Setores | `sectors` | `companyId` |
| ✅ Apontamentos | `production_appointments` | via `productionOrderId` |
| ✅ Paradas | `downtimes` | via `productionOrderId` |

---

## 🎯 Casos de Uso

### **Caso 1: Usuário com 1 Empresa**

```
Login → Token JWT gerado com companyId → Dashboard
       (Sem seleção, direto para sistema)
```

**Fluxo**:
1. Login em `/login`
2. Backend detecta 1 empresa apenas
3. Gera token JWT com `companyId` incluído
4. Redirect para `/dashboard`
5. Todas operações vinculadas automaticamente

---

### **Caso 2: Usuário com Múltiplas Empresas**

```
Login → Seleção de Empresa → Token JWT gerado → Dashboard
       (Obrigatório selecionar)
```

**Fluxo**:
1. Login em `/login`
2. Backend detecta 2+ empresas
3. Retorna `requiresCompanySelection: true`
4. Redirect para `/select-company`
5. Usuário escolhe empresa
6. Endpoint `/auth/select-company` gera token JWT
7. Redirect para `/dashboard`
8. Todas operações vinculadas à empresa escolhida

---

### **Caso 3: Trocar de Empresa**

**Opções**:

**A) Logout e Login Novamente**:
```
Dashboard → Logout → Login → Selecionar Outra Empresa
```

**B) Botão "Trocar Empresa"** (Implementar):
```typescript
// Futuro: Adicionar botão no header
const handleChangeCompany = () => {
  navigate('/select-company', {
    state: { user, companies }
  });
};
```

---

## 🔧 Implementação Técnica

### **Frontend**

**Arquivos Principais**:
- ✅ `frontend/src/pages/Login.tsx` - Fluxo de login
- ✅ `frontend/src/pages/SelectCompany.tsx` - Seleção de empresa
- ✅ `frontend/src/contexts/AuthContext.tsx` - Estado global
- ✅ `frontend/src/services/authService.ts` - Chamadas API
- ✅ `frontend/src/components/Layout/Layout.tsx` - Exibição da empresa

**LocalStorage**:
```javascript
'@MES:token'    → JWT com companyId
'@MES:user'     → Dados do usuário
'@MES:company'  → Empresa selecionada
```

---

### **Backend**

**Arquivos Principais**:
- ✅ `backend/src/controllers/authController.ts` - Login e seleção
- ✅ `backend/src/middleware/companyFilter.ts` - Extração de companyId
- ✅ `backend/src/controllers/productionOrderController.ts` - Vinculação
- ✅ `backend/src/utils/jwt.ts` - JWT com companyId

**JWT Payload**:
```typescript
interface JwtPayload {
  userId: number;
  role: string;
  companyId?: number; // ← Incluído após seleção
}
```

**Middleware de Empresa**:
```typescript
export function getCompanyFilter(req: AuthenticatedRequest, required = true) {
  if (req.user?.companyId) {
    return { companyId: req.user.companyId };
  }
  if (required) {
    throw new Error('Company ID required');
  }
  return {};
}
```

---

## 📊 Banco de Dados

### **Tabela `user_companies`**

Controla quais empresas cada usuário pode acessar:

```sql
CREATE TABLE user_companies (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "companyId" INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "isDefault" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "companyId")
);
```

**Exemplo de dados**:
```sql
-- Admin tem acesso a 2 empresas
INSERT INTO user_companies ("userId", "companyId", "isDefault")
VALUES
  (1, 1, TRUE),  -- Empresa Norte (padrão)
  (1, 2, FALSE); -- Empresa Sul
```

---

### **Tabela `users`**

Campo `selectedCompanyId` armazena última empresa selecionada:

```sql
ALTER TABLE users 
ADD COLUMN "selectedCompanyId" INTEGER REFERENCES companies(id);
```

---

### **Tabelas com `companyId`**

Todas tabelas de cadastro devem ter:

```sql
ALTER TABLE production_orders ADD COLUMN "companyId" INTEGER REFERENCES companies(id);
ALTER TABLE items ADD COLUMN "companyId" INTEGER REFERENCES companies(id);
ALTER TABLE molds ADD COLUMN "companyId" INTEGER REFERENCES companies(id);
ALTER TABLE plc_configs ADD COLUMN "companyId" INTEGER REFERENCES companies(id);
ALTER TABLE sectors ADD COLUMN "companyId" INTEGER REFERENCES companies(id);
```

---

## ✅ Checklist de Implementação

### Frontend
- [x] Página de login com detecção de múltiplas empresas
- [x] Página SelectCompany para escolha
- [x] AuthContext com `selectedCompany`
- [x] LocalStorage para persistir empresa
- [x] Header exibe empresa selecionada
- [x] Redirect automático após seleção

### Backend
- [x] Endpoint `/auth/login` retorna empresas
- [x] Endpoint `/auth/select-company` gera token
- [x] JWT inclui `companyId`
- [x] Middleware `companyFilter` extrai `companyId`
- [x] `createProductionOrder` vincula à empresa
- [x] `listProductionOrders` filtra por empresa
- [x] Validação de acesso na seleção

### Banco de Dados
- [x] Tabela `user_companies` criada
- [x] Campo `selectedCompanyId` em `users`
- [x] Campo `companyId` em `production_orders`
- [x] Campo `companyId` em outros cadastros

---

## 🎨 Interface Visual

### **Header com Empresa**
```
┌─────────────────────────────────────────────────────────────┐
│ ☰ MES - Sistema de Manufatura  [🏢 Empresa Norte] Admin ⚙  │
└─────────────────────────────────────────────────────────────┘
```

### **Página SelectCompany**
```
┌─────────────────────────────────────────────┐
│  Bem-vindo(a), Admin!                       │
│                                             │
│  Você tem acesso a múltiplas empresas.      │
│  Por favor, selecione uma para continuar.   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Empresa: [Empresa Norte ▼]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [  Selecionar Empresa  ]                   │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### **Problema**: Ordem sendo criada sem `companyId`
**Causa**: Token JWT não contém `companyId`  
**Solução**: Verificar se usuário passou pela seleção de empresa

### **Problema**: Usuário não vê ordens criadas
**Causa**: Filtro de empresa está ativo  
**Solução**: Verificar se `companyId` do token corresponde ao das ordens

### **Problema**: Múltiplas empresas mas não redireciona
**Causa**: Lógica de redirect incorreta no Login  
**Solução**: Verificar `requiresCompanySelection` no response

---

## 📈 Melhorias Futuras

1. **Botão "Trocar Empresa"** no header
2. **Dashboard por empresa** com métricas segregadas
3. **Permissões específicas** por empresa
4. **Histórico de trocas** de empresa
5. **Notificações** quando trocar empresa
6. **Logo da empresa** no header
7. **Tema personalizado** por empresa

---

## 📌 Resumo

**Status**: ✅ Implementado e Funcional  
**Versão**: 1.0  
**Data**: 22/10/2024  

**Funcionalidades**:
- ✅ Login com detecção de múltiplas empresas
- ✅ Seleção de empresa obrigatória
- ✅ Token JWT com `companyId`
- ✅ Ordens vinculadas automaticamente
- ✅ Filtro por empresa em listagens
- ✅ Indicação visual no header
- ✅ Persistência no localStorage
- ✅ Isolamento de dados por empresa

**Tecnologias**:
- Frontend: React, TypeScript, Material-UI, React Router
- Backend: Node.js, Express, Prisma, JWT
- Banco: PostgreSQL

**Próximos Passos**:
1. Testar com usuários reais
2. Adicionar botão "Trocar Empresa"
3. Implementar relatórios por empresa

