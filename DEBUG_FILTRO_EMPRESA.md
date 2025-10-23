# Debug: Filtro de Empresa no Dashboard

## 🐛 Problema Identificado

O Dashboard está mostrando dados de registros com `companyId = NULL` ao invés dos dados da empresa logada.

### **Sintomas:**
- Usuário logado na "Empresa Exemplo LTDA" vê dados
- Usuário logado na "EMPRESA TESTE" não vê dados (ou vê dados errados)
- Logs SQL mostram: `WHERE "companyId" IS NULL`

## 🔍 Causa Raiz

O token JWT não está carregando corretamente o `companyId` da empresa selecionada, resultando em `req.user.companyId = undefined`.

Quando isso acontece, o middleware `getCompanyFilter()` retorna `{ companyId: null }`, que força o Prisma a buscar apenas registros sem empresa.

## 📋 Verificações Necessárias

### **1. Verificar Token JWT**

**Como verificar:**
1. Abra o DevTools do navegador (F12)
2. Vá em `Application` → `Local Storage` → `http://localhost:3000`
3. Procure pelo item `token`
4. Copie o valor e decodifique em: https://jwt.io/

**O que deve ter:**
```json
{
  "userId": 1,
  "role": "ADMIN",
  "companyId": 1,  // ← DEVE TER ESTE CAMPO!
  "iat": 1234567890,
  "exp": 1234567890
}
```

### **2. Verificar Logs do Backend**

Com o backend rodando, acesse o Dashboard e verifique os logs:

```bash
# Logs esperados:
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 1 }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 1 }
```

**Se aparecer:**
```bash
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: undefined }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: null }
```

**→ O problema é que o token JWT não tem `companyId`!**

### **3. Verificar Banco de Dados**

```sql
-- Verificar se o usuário tem empresa selecionada
SELECT id, email, name, "selectedCompanyId" 
FROM users 
WHERE id = 1;

-- Verificar empresas do usuário
SELECT uc.*, c.name as company_name
FROM user_companies uc
JOIN companies c ON c.id = uc."companyId"
WHERE uc."userId" = 1;
```

## ✅ Solução Imediata

### **Opção 1: Relogar no Sistema**

1. Fazer logout completo
2. Fazer login novamente
3. **Selecionar a empresa** quando solicitado
4. Acessar o Dashboard

### **Opção 2: Trocar de Empresa Manualmente**

1. Clicar no ícone do usuário (canto superior direito)
2. Clicar em "Trocar Empresa"
3. Selecionar a empresa desejada
4. Confirmar

Isso irá gerar um novo token JWT com o `companyId` correto.

### **Opção 3: Limpar LocalStorage e Relogar**

1. Abra o DevTools (F12)
2. Console:
```javascript
localStorage.clear();
location.reload();
```
3. Faça login novamente

## 🔧 Correção Permanente

O problema pode estar em um dos seguintes pontos:

### **1. Login sem Selecionar Empresa**

**Arquivo:** `backend/src/controllers/authController.ts`

No login, quando o usuário tem apenas 1 empresa, o token é gerado corretamente:

```typescript
// ✅ CORRETO
token = generateToken({
  userId: user.id,
  role: user.role,
  companyId: companies[0].id,  // ← Tem companyId
});
```

Mas se o usuário tem múltiplas empresas e não selecionou, o token não tem `companyId`:

```typescript
// ⚠️ POSSÍVEL PROBLEMA
token = generateToken({
  userId: user.id,
  role: user.role,
  // companyId não definido!
});
```

### **2. Middleware CompanyFilter**

**Arquivo:** `backend/src/middleware/companyFilter.ts`

```typescript
export function getCompanyFilter(req: AuthenticatedRequest, allowNull: boolean = false): any {
  if (!req.user?.companyId) {
    return allowNull ? {} : { companyId: null };  // ← PROBLEMA!
  }
  
  return { companyId: req.user.companyId };
}
```

**Proposta de correção:**

```typescript
export function getCompanyFilter(req: AuthenticatedRequest, allowNull: boolean = false): any {
  // Se não tem companyId, pode ser porque:
  // 1. Usuário não está autenticado
  // 2. Usuário não selecionou empresa
  // 3. Token JWT está inválido/expirado
  
  if (!req.user?.companyId) {
    if (allowNull) {
      return {}; // Não filtra por empresa
    } else {
      // ⚠️ IMPORTANTE: Retornar filtro impossível para não expor dados de outras empresas
      return { companyId: -1 }; // Nenhum registro terá ID -1
    }
  }
  
  return { companyId: req.user.companyId };
}
```

## 📊 Dados de Teste

Para verificar se o filtro está funcionando:

### **Empresa Exemplo LTDA (ID: 1)**
```sql
SELECT COUNT(*) as total_ordens FROM production_orders WHERE "companyId" = 1;
SELECT COUNT(*) as total_apontamentos 
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
WHERE po."companyId" = 1;
```

### **EMPRESA TESTE (ID: 2)**
```sql
SELECT COUNT(*) as total_ordens FROM production_orders WHERE "companyId" = 2;
SELECT COUNT(*) as total_apontamentos 
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
WHERE po."companyId" = 2;
```

### **Registros SEM Empresa (Problema!)**
```sql
SELECT COUNT(*) as total_ordens FROM production_orders WHERE "companyId" IS NULL;
```

## 🎯 Próximos Passos

1. **Verificar logs do backend** ao acessar o Dashboard
2. **Conferir se o JWT tem companyId**
3. **Relogar no sistema** para gerar novo token
4. **Se o problema persistir**, aplicar correção no middleware

## 📝 Como Testar Corretamente

### **Teste 1: Empresa com Dados**
1. Login como usuário da "EMPRESA TESTE"
2. Acessar Dashboard
3. **Resultado Esperado**: Mostrar dados reais da empresa

### **Teste 2: Empresa sem Dados**
1. Login como usuário da "Empresa Exemplo LTDA"
2. Acessar Dashboard  
3. **Resultado Esperado**: Todos os valores zerados

### **Teste 3: Trocar de Empresa**
1. Logado em qualquer empresa
2. Trocar para outra empresa
3. Acessar Dashboard
4. **Resultado Esperado**: Dados mudam conforme a empresa selecionada

---

**Status**: 🔍 Em investigação  
**Logs adicionados**: ✅ Sim  
**Backend**: Rodando com logs de debug  
**Próximo passo**: Usuário deve acessar o Dashboard novamente para vermos os logs

