# 🔍 Debug: Token JWT não está sendo extraído corretamente

## 🎯 Problema Atual

- ✅ Token JWT contém: `{ userId: 1, role: "ADMIN", companyId: 1 }`
- ❌ Backend recebe: `{ userId: 1, role: "ADMIN", companyId: undefined }`

## 📝 O que fizemos

Adicionamos logs de debug no middleware de autenticação (`backend/src/middleware/auth.ts`) para ver o que está sendo decodificado do token.

## 🧪 Próximos Passos

### 1️⃣ Recarregar o Dashboard

1. Abra o Dashboard: http://192.168.2.105:3000/dashboard
2. Faça **Hard Refresh**: `Ctrl + Shift + R`
3. Aguarde carregar

### 2️⃣ Verificar Logs do Backend

No terminal do backend, procure por estas linhas:

```
🔓 [AUTH MIDDLEWARE] Token decodificado: {"userId":1,"role":"ADMIN","companyId":1,...}
🔓 [AUTH MIDDLEWARE] req.user após atribuição: {"userId":1,"role":"ADMIN","companyId":1,...}
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 1 }
```

### 3️⃣ Cenários Possíveis

#### ✅ Cenário 1: Logs mostram `companyId: 1` em todos os lugares
**Solução**: O problema foi resolvido! Os KPIs devem aparecer zerados (porque empresa 1 não tem dados).

#### ❌ Cenário 2: Logs mostram `companyId: undefined` no token decodificado
**Problema**: O token não está sendo gerado corretamente ou o JWT_SECRET está diferente.
**Solução**: Verificar variáveis de ambiente `.env`

#### ❌ Cenário 3: Token não está sendo enviado
**Problema**: Frontend não está enviando o header Authorization.
**Solução**: Verificar `axios` interceptor no frontend.

## 🔧 Solução Adicional: Verificar JWT_SECRET

Se o token não for decodificado corretamente, pode ser porque o `JWT_SECRET` usado para gerar é diferente do usado para decodificar.

### Verificar .env do Backend

```bash
cd backend
cat .env | grep JWT_SECRET
```

Deve mostrar algo como:
```
JWT_SECRET=a-string-secret-at-least-256-bits-long
```

### Garantir que o .env está sendo carregado

Verifique se o `backend/.env` tem:
```
JWT_SECRET=a-string-secret-at-least-256-bits-long
JWT_EXPIRES_IN=24h
```

## 📊 O que esperar

Após fazer o hard refresh e ver os logs, você deve ver:

```
🔓 [AUTH MIDDLEWARE] Token decodificado: {"userId":1,"role":"ADMIN","companyId":1,"iat":1761180677,"exp":1761267077}
🔓 [AUTH MIDDLEWARE] req.user após atribuição: {"userId":1,"role":"ADMIN","companyId":1,"iat":1761180677,"exp":1761267077}
🔍 [DASHBOARD KPIs] User: { userId: 1, role: 'ADMIN', companyId: 1 }
🔍 [DASHBOARD KPIs] CompanyFilter: { companyId: 1 }
```

**E os KPIs devem aparecer ZERADOS** porque a empresa com ID 1 (Empresa Exemplo LTDA) não tem dados.

## 🎯 Para Testar com Dados Reais

Se você quiser ver os KPIs com valores reais:

1. **Logout** do sistema
2. **Login** novamente
3. **Selecione "EMPRESA TESTE" (EMP001)** - essa tem dados!
4. O token terá `companyId: 2`
5. Dashboard mostrará valores reais: ~60 ordens, ~1500 peças, etc.

---

**Status**: ⏳ Aguardando logs do backend  
**Próxima ação**: Recarregue o Dashboard e me envie os logs!

